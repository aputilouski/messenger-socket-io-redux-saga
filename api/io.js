const { Server } = require('socket.io');
const { User, Message, Room, UserRoom } = require('./models');
const { getUserUuidByAccessToken } = require('./services/passport');
const debug = require('debug')('api:io');
const { Op } = require('sequelize');

module.exports = server => {
  const io = new Server(server);

  io.use(async (socket, next) => {
    try {
      const uuid = getUserUuidByAccessToken(socket.handshake.auth.token);
      const user = await User.findByPk(uuid);
      if (!user) return next(new Error('auth error'));
      socket.user = user;
      next();
    } catch (error) {
      return next(new Error('auth error'));
    }
  });

  io.on('connection', async socket => {
    const uuid = socket.user.uuid;
    const user = socket.user;
    debug('user connected: ' + uuid);

    user.connected = true;
    user.save();

    socket.join(uuid);

    const contacts = [];
    const myRooms = await Promise.all([User.loadAssociatedRooms(uuid), User.loadUnreadMessagesCounter(uuid)]).then(([userAssociatedRoomsResult, unreadMessagesCounterResult]) => {
      const contactRooms = userAssociatedRoomsResult.rooms
        .filter(room => room.users.length === 1)
        .map(room => {
          const contact = room.users[0];
          contacts.push(contact);
          room.dataValues.contact = contact.uuid;
          delete room.dataValues.users;
          room.dataValues.unread_count = 0;
          return room;
        });

      unreadMessagesCounterResult.rooms.forEach(result => {
        const room = contactRooms.find(room => room.id === result.id);
        if (!room) return;
        room.dataValues.unread_count = result.dataValues.unread_count;
      });

      socket.emit('initialization', contactRooms, contacts);

      return contactRooms.map(room => room.id);
    });

    socket.on('messages', (room_id, offset = 0, limit = 25) => {
      // console.log(room_id, offset, limit);
      Message.findAll({
        where: { room_id },
        order: [['created_at', 'DESC']],
        offset,
        limit,
      }).then(messages => {
        socket.emit('messages', room_id, messages);
      });
    });

    socket.on('message:create', message => {
      const { text, room_id } = message;
      Room.findByPk(room_id, { include: { model: User, as: 'users', attributes: ['uuid'] } }).then(room => {
        if (!room) return;
        Message.create({ text, from: uuid, room_id }).then(message => {
          const to = room.users.map(user => user.uuid);
          io.to(to).emit('message:created', room_id, message);
        });
      });
    });

    socket.on('messages:read', room_id => {
      UserRoom.findAll({ where: { room_id } }).then(records => {
        const userRoom = records.find(record => record.user_uuid === uuid);
        if (!userRoom) return;
        userRoom.last_read = new Date();
        userRoom.save();
        const array = records.map(r => r.user_uuid).filter(user_uuid => user_uuid !== uuid);
        socket.to(array).emit('messages:read', uuid, userRoom.last_read);
      });
    });

    socket.on('search', text => {
      const words = typeof text === 'string' ? text.split(' ').filter(w => Boolean(w)) : undefined;
      if (!words || !words.length) socket.emit('search');

      const patterns = words.map(word => word + '%');
      const where = {
        uuid: { [Op.not]: [...contacts.map(c => c.uuid), uuid] },
        [Op.or]: {
          username: { [Op.iLike]: { [Op.any]: patterns } },
          name: { [Op.substring]: words },
        },
      };

      User.findAndCountAll({
        attributes: User.userAttributes,
        where,
        order: [['created_at', 'DESC']],
        // limit,
        // offset: (page - 1) * limit,
      }).then(result => {
        socket.emit('search', result);
      });
    });

    socket.on('room:new', async (to, text) => {
      const contact = await User.findByPk(to, { attributes: User.contactAttributes });
      if (!contact) throw new Error();
      const room = await Room.create();
      const roomUsers = await room.addUsers([to, uuid]);
      contact.dataValues.user_room = roomUsers.find(r => r.user_uuid === contact.uuid);
      const thisUserRoom = roomUsers.find(r => r.user_uuid === uuid);
      if (!contact.dataValues.user_room || !thisUserRoom) throw new Error();
      room.dataValues.contact = contact.uuid;
      room.dataValues.unread_count = 0;
      const message = await Message.create({ text, room_id: room.id, from: uuid });
      room.dataValues.messages = [message];
      socket.emit('room:new', room, contact, true);
      socket.to(to).emit(
        'room:new', //
        { ...room.get(), contact: uuid, unread_count: 1 },
        { ...user.getPublicAttributes(User.contactAttributes), user_room: thisUserRoom }
      );
    });

    socket.on('subscribe', contact => {
      contacts.push(contact);
    });

    socket.to(contacts.map(user => user.uuid)).emit('user:connected', uuid);

    socket.on('disconnect', () => {
      debug('user disconnected: ' + uuid);

      user.connected = false;
      user.disconnected_at = new Date();
      user.save();

      socket.to(contacts.map(user => user.uuid)).emit('user:disconnected', uuid, user.disconnected_at);
    });
  });
};
