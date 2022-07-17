const { Server } = require('socket.io');
const { User } = require('./models');
const { getUserByAccessToken } = require('./services/passport');
const { Op } = require('sequelize');

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
    console.log('a user connected');

    const uuid = socket.user.uuid;

    socket.join(uuid);

    User.findAll({
      where: { uuid: { [Op.not]: uuid } },
      attributes: User.publicAttributes,
    }).then(users => {
      socket.emit('rooms', users);
    });

    socket.on('chat-messages', uuid => {
      socket.emit('chat-messages', []);
    });

    socket.on('disconnect', () => {
      console.log('user disconnected');
    });
  });
};
