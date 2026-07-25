const { Server } = require('socket.io');

let io;

const initSocket = (server) => {
  io = new Server(server, {
  cors: {
    origin: (origin, callback) => {
      const allowed = [
        'http://localhost:5173',
        /\.vercel\.app$/
      ];
      if (!origin || allowed.some(o => typeof o === 'string' ? o === origin : o.test(origin))) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    },
    credentials: true
  }
});

  io.on('connection', (socket) => {
    console.log('Socket connected:', socket.id);

    // Client sends their userId to join a personal room
    socket.on('join', (userId) => {
      socket.join(userId.toString());
      console.log(`User ${userId} joined their notification room`);
    });

    socket.on('disconnect', () => {
      console.log('Socket disconnected:', socket.id);
    });
  });

  console.log('Socket.io initialized');
};

// Send notification to a specific user's room
const sendToUser = (userId, event, data) => {
  if (!io) throw new Error('Socket.io not initialized');
  io.to(userId.toString()).emit(event, data);
};

const getIO = () => {
  if (!io) throw new Error('Socket.io not initialized');
  return io;
};

module.exports = { initSocket, sendToUser, getIO };