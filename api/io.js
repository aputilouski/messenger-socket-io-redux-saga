const { Server } = require('socket.io');
const { User, Message, Room } = require('./models');
const { getUserUuidByAccessToken } = require('./services/passport');
const { Op } = require('sequelize');
const debug = require('debug')('api:io');

module.exports = server => {
  const io = new Server(server);

  io.use(async (socket, next) => {
    try {
      const uuid = getUserUuidByAccessToken(socket.handshake.auth.token);
      if (!uuid) return next(new Error('auth error'));
      socket.uuid = uuid;
      next();
    } catch (error) {
      return next(new Error('auth error'));
    }
  });

  io.on('connection', async socket => {
    const uuid = socket.uuid;
    debug('user connected: ' + uuid);

    const user = await User.findOne({
      where: { uuid },
      include: {
        model: Room,
        as: 'rooms',
        include: [
          {
            model: User,
            as: 'users',
            attributes: User.publicAttributes,
            where: { uuid: { [Op.not]: uuid } },
            required: false,
          },
          {
            model: Message,
            as: 'messages',
            separate: true,
            limit: 1,
            order: [['created_at', 'DESC']],
          },
        ],
      },
    });
    if (!user) new Error('auth error');

    user.connected = true;
    user.save();

    socket.join(uuid);

    const subscribers = [];
    const subscriberRooms = user.rooms
      .filter(room => room.users.length === 1)
      .map(room => {
        const companion = room.users[0];
        subscribers.push(companion);
        room.dataValues.companion = companion.uuid;
        delete room.dataValues.users;
        return room;
      });

    socket.emit('initialization', subscriberRooms, subscribers);

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

    socket.to(subscribers.map(user => user.uuid)).emit('user:connected', uuid);

    socket.on('disconnect', () => {
      debug('user disconnected: ' + uuid);

      user.connected = false;
      user.disconnected_at = new Date();
      user.save();

      socket.to(subscribers.map(user => user.uuid)).emit('user:disconnected', uuid, user.disconnected_at);
    });
  });
};
