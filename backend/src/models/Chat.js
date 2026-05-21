const mongoose = require('mongoose');

const chatSchema = new mongoose.Schema({
  projectId: {
    type: mongoose.Schema.ObjectId,
    ref: 'Project',
    required: true
  },
  customerId: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: true
  },
  contractorId: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: true
  },
  lastMessage: String,
  lastMessageAt: Date
}, { timestamps: true });

// Ensure unique chat between customer and contractor per project
chatSchema.index({ customerId: 1, contractorId: 1, projectId: 1 }, { unique: true });

const Chat = mongoose.model('Chat', chatSchema);
module.exports = Chat;
