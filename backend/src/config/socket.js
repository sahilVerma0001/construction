const { Server } = require('socket.io');
const jwt = require('jsonwebtoken');
const { promisify } = require('util');
const User = require('../models/User');
const Chat = require('../models/Chat');
const Message = require('../models/Message');

const initializeSocket = (server) => {
  const io = new Server(server, {
    cors: {
      origin: '*', // Adjust this to specific origins in production
      methods: ['GET', 'POST']
    }
  });

  // Socket Authentication Middleware
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth?.token?.split(' ')[1];
      
      if (!token) {
        return next(new Error('Authentication error: Token missing'));
      }

      // Verify token
      const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);
      
      // Fetch user
      const user = await User.findById(decoded.id);
      if (!user) {
        return next(new Error('Authentication error: User not found'));
      }

      // Attach user to socket
      socket.user = user;
      next();
    } catch (err) {
      next(new Error('Authentication error: Invalid token'));
    }
  });

  io.on('connection', (socket) => {
    console.log(`User connected to socket: ${socket.user._id}`);

    // JOIN ROOM
    socket.on('joinRoom', async ({ chatId }) => {
      // Validate that the user is actually part of this chat
      const chat = await Chat.findById(chatId);
      if (!chat) {
        return socket.emit('error', { message: 'Chat not found' });
      }

      if (
        socket.user.role !== 'admin' &&
        chat.customerId.toString() !== socket.user._id.toString() &&
        chat.contractorId.toString() !== socket.user._id.toString()
      ) {
        return socket.emit('error', { message: 'Unauthorized to join this chat' });
      }

      socket.join(chatId);
      console.log(`User ${socket.user._id} joined room ${chatId}`);
    });

    // SEND MESSAGE
    socket.on('sendMessage', async ({ chatId, content }) => {
      try {
        // 1. Save to Messages collection
        const message = await Message.create({
          chatId,
          senderId: socket.user._id,
          content
        });

        // 2. Update Chat's last message
        await Chat.findByIdAndUpdate(chatId, {
          lastMessage: content,
          lastMessageAt: new Date()
        });

        // 3. Broadcast to everyone in the room
        io.to(chatId).emit('receiveMessage', message);
      } catch (err) {
        socket.emit('error', { message: 'Failed to send message', error: err.message });
      }
    });

    socket.on('disconnect', () => {
      console.log(`User disconnected: ${socket.user._id}`);
    });
  });

  return io;
};

module.exports = initializeSocket;
