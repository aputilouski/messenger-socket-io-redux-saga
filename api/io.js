const { Server } = require('socket.io');
const { User, Message } = require('./models');
const { getUserByAccessToken } = require('./services/passport');
const { Op } = require('sequelize');
const debug = require('debug')('api:io');

module.exports = server => {
  const io = new Server(server);

  io.use(async (socket, next) => {
    try {
      const user = await getUserByAccessToken(socket.handshake.auth.token);
      if (!user) return next(new Error('auth error'));
      socket.user = user;
      next();
    } catch (error) {
      return next(new Error('auth error'));
    }
  });

  io.on('connection', socket => {
    const uuid = socket.user.uuid;
    debug('user connected: ' + uuid);

    socket.join(uuid);

    User.findAll({
      where: { uuid: { [Op.not]: uuid } },
      attributes: User.publicAttributes,
    }).then(users => {
      socket.emit('rooms', users);
    });

    socket.on('messages', (to, offset = 0, limit = 25) => {
      Message.findAll({
        where: { from: uuid, to },
        order: [['created_at', 'DESC']],
        offset,
        limit,
      }).then(messages => {
        socket.emit('messages', to, messages);
      });
    });

    socket.on('message:create', message => {
      const { text, to } = message;
      Message.create({ text, to, from: uuid }).then(message => {
        socket.emit('message:created', to, message);
      });
    });

    socket.on('disconnect', () => {
      debug('user disconnected: ' + uuid);
    });
  });
};
