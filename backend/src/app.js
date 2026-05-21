const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const AppError = require('./utils/AppError');

const app = express();

// 1. GLOBAL MIDDLEWARES
// Set security HTTP headers
app.use(helmet());

// Development logging
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// Body parser, reading data from body into req.body
app.use(express.json({ limit: '10kb' }));

// Implement CORS
app.use(cors());

// 2. ROUTES
const authRouter = require('./routes/authRoutes');
const projectRouter = require('./routes/projectRoutes');
const bidRouter = require('./routes/bidRoutes');
const adminRouter = require('./routes/adminRoutes');
const chatRouter = require('./routes/chatRoutes');

app.use('/api/auth', authRouter);
app.use('/api/projects', projectRouter);
app.use('/api/bids', bidRouter);
app.use('/api/admin', adminRouter);
app.use('/api/chats', chatRouter);

// 3. UNHANDLED ROUTES
app.use((req, res, next) => {
  next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404));
});

// 4. GLOBAL ERROR HANDLER
app.use((err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';

  if (process.env.NODE_ENV === 'development') {
    res.status(err.statusCode).json({
      status: err.status,
      error: err,
      message: err.message,
      stack: err.stack,
    });
  } else {
    // Production error response
    if (err.isOperational) {
      res.status(err.statusCode).json({
        status: err.status,
        message: err.message,
      });
    } else {
      // Programming or other unknown error: don't leak error details
      console.error('ERROR 💥', err);
      res.status(500).json({
        status: 'error',
        message: 'Something went very wrong!',
      });
    }
  }
});

module.exports = app;
