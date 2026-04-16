const { Server } = require('socket.io');
const jwt        = require('jsonwebtoken');

let io;

const init = (server) => {
  io = new Server(server, {
    cors: { origin: 'http://localhost:5173', methods: ['GET', 'POST'] },
  });

  // Middleware xác thực token khi connect
  io.use((socket, next) => {
    const token = socket.handshake.auth?.token;
    if (!token) return next(new Error('No token'));
    try {
      socket.user = jwt.verify(token, process.env.JWT_SECRET);
      next();
    } catch {
      next(new Error('Invalid token'));
    }
  });

  io.on('connection', (socket) => {
    console.log(`Socket connected: ${socket.user?.username} (${socket.id})`);

    socket.on('disconnect', () => {
      console.log(`Socket disconnected: ${socket.id}`);
    });
  });

  return io;
};

const emit = (event, data) => {
  if (io) io.emit(event, data);
};

module.exports = { init, emit };