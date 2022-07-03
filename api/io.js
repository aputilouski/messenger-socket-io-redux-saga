const { Server } = require('socket.io');

module.exports = server => {
  const io = new Server(server, {
    cors: {
      origin: 'http://localhost:3002',
    },
  });

  io.on('connection', socket => {
    console.log('a user connected');
    socket.on('disconnect', () => {
      console.log('user disconnected');
    });
  });
};
