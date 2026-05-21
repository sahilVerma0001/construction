const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  chatId: {
    type: mongoose.Schema.ObjectId,
    ref: 'Chat',
    required: true
  },
  senderId: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: true
  },
  content: {
    type: String,
    required: [true, 'Message content cannot be empty']
  },
  messageType: {
    type: String,
    enum: ['text', 'image', 'system'],
    default: 'text'
  },
  isRead: {
    type: Boolean,
    default: false
  }
}, { timestamps: true });

// Fast lookups for chat history
messageSchema.index({ chatId: 1, createdAt: -1 });

const Message = mongoose.model('Message', messageSchema);
module.exports = Message;
