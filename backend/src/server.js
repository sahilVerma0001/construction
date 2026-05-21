require('dotenv').config();
const http = require('http');
const app = require('./app');
const connectDB = require('./config/db');

// Connect to database
connectDB();

const server = http.createServer(app);

// Initialize Socket.IO
const initializeSocket = require('./config/socket');
const io = initializeSocket(server);

// Optionally export io if we want to use it inside controllers later
app.set('io', io);

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  console.log('UNHANDLED REJECTION! 💥 Shutting down...');
  console.log(err.name, err.message);
  server.close(() => {
    process.exit(1);
  });
});
