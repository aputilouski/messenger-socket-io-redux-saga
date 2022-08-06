const { Server } = require('socket.io');
const { User, Message, Room, UserRoom } = require('./models');
const { getUserUuidByAccessToken } = require('./services/passport');
const debug = require('debug')('api:io');
const { Op, Sequelize } = require('sequelize');

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
    user.save().catch(error => {
      console.log(error);
      socket.emit('error', 'Oops. Something went wrong while connecting.');
    });

    socket.join(uuid);

    Promise.all([User.loadAssociatedRooms(uuid), User.loadUnreadMessagesCounter(uuid)])
      .then(([userAssociatedRoomsResult, unreadMessagesCounterResult]) => {
        const contacts = [];
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

        socket.to(contacts.map(user => user.uuid)).emit('user:connected', uuid);

        setTimeout(() => {
          // this delay is needed to avoid a situation where the frontend has not yet registered handlers
          socket.emit('initialization', contactRooms, contacts);
        }, 160);

        return contactRooms.map(room => room.id);
      })
      .catch(error => {
        console.log(error);
        socket.emit('error', 'Oops. Something went wrong during application initialization.');
      });

    socket.on('messages', (room_id, offset = 0, limit = 25) => {
      Message.findAll({
        where: { room_id },
        order: [['created_at', 'DESC']],
        offset,
        limit,
      })
        .then(messages => socket.emit('messages', room_id, messages))
        .catch(error => {
          console.log(error);
          socket.emit('error', 'Oops. Something went wrong while loading messages.');
        });
    });

    socket.on('message:create', async messageData => {
      try {
        const { text, room_id } = messageData;
        const room = await Room.findByPk(room_id, { include: { model: User, as: 'users', attributes: ['uuid'] } });
        if (!room) throw new Error('No Room');
        const message = await Message.create({ text, from: uuid, room_id });
        const to = room.users.map(user => user.uuid);
        io.to(to).emit('message:created', room_id, message);
      } catch (error) {
        console.log(error);
        socket.emit('error', 'Oops. Something went wrong while creating the message.');
      }
    });

    socket.on('messages:read', room_id => {
      UserRoom.findAll({ where: { room_id } })
        .then(records => {
          const userRoom = records.find(record => record.user_uuid === uuid);
          if (!userRoom) return;
          userRoom.last_read = new Date();
          userRoom.save();
          const array = records.map(r => r.user_uuid).filter(user_uuid => user_uuid !== uuid);
          socket.to(array).emit('messages:read', uuid, userRoom.last_read);
        })
        .catch(error => {
          console.log(error);
          socket.emit('error', 'Oops. Something went wrong while reading the message.');
        });
    });

    socket.on('search', text => {
      const words = typeof text === 'string' ? text.split(' ').filter(w => Boolean(w)) : undefined;
      if (!words || !words.length) socket.emit('search');

      const patterns = words.map(word => word + '%');

      User.findAndCountAll({
        attributes: User.userAttributes,
        where: {
          uuid: { [Op.not]: uuid },
          [Op.or]: {
            username: { [Op.iLike]: { [Op.any]: patterns } },
            name: { [Op.substring]: words },
          },
        },
        include: {
          model: Room,
          as: 'rooms',
          attributes: [],
          include: { model: User, as: 'users', attributes: [], where: { uuid }, required: false },
        },
        order: [['created_at', 'DESC']],
        group: [
          'user.uuid', //
          'rooms->user_room.room_id',
          'rooms->user_room.user_uuid',
          'rooms->users->user_room.room_id',
          'rooms->users->user_room.user_uuid',
        ],
        having: Sequelize.where(Sequelize.fn('COUNT', Sequelize.col('rooms->users.uuid')), Op.ne, 1),
      })
        .then(result => socket.emit('search', result))
        .catch(error => {
          console.log(error);
          socket.emit('error', 'Oops. Something went wrong while searching.');
        });
    });

    socket.on('room:new', async (to, text) => {
      try {
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
      } catch (error) {
        console.log(error);
        socket.emit('error', 'Oops. Something went wrong while adding a new contact.');
      }
    });

    socket.on('disconnect', () => {
      debug('user disconnected: ' + uuid);

      user.connected = false;
      user.disconnected_at = new Date();
      user.save().catch(error => {
        console.log(error);
        socket.emit('error', 'Oops. Something went wrong while disconnecting.');
      });

      User.loadAssociatedRooms(uuid)
        .then(result => {
          const contacts = result.rooms.filter(room => room.users.length === 1).map(room => room.users[0]);
          socket.to(contacts.map(user => user.uuid)).emit('user:disconnected', uuid, user.disconnected_at);
        })
        .catch(error => {
          console.log(error);
          socket.emit('error', 'Oops. Something went wrong while disconnecting.');
        });
    });
  });
};
