const Chat = require('../models/Chat');
const Message = require('../models/Message');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/AppError');

exports.getChats = catchAsync(async (req, res, next) => {
  // Find all chats where the current user is either the customer or the contractor
  const query = req.user.role === 'customer' 
    ? { customerId: req.user._id } 
    : { contractorId: req.user._id };

  const chats = await Chat.find(query)
    .populate('customerId', 'firstName lastName companyName')
    .populate('contractorId', 'firstName lastName companyName')
    .populate('projectId', 'title')
    .sort({ lastMessageAt: -1 });

  res.status(200).json({
    status: 'success',
    results: chats.length,
    data: {
      chats
    }
  });
});

exports.getChatMessages = catchAsync(async (req, res, next) => {
  const { id: chatId } = req.params;

  // Validate that the user is part of this chat
  const chat = await Chat.findById(chatId);
  if (!chat) {
    return next(new AppError('Chat not found', 404));
  }

  if (
    req.user.role !== 'admin' &&
    chat.customerId.toString() !== req.user._id.toString() &&
    chat.contractorId.toString() !== req.user._id.toString()
  ) {
    return next(new AppError('You do not have permission to view these messages', 403));
  }

  const messages = await Message.find({ chatId }).sort({ createdAt: 1 });

  res.status(200).json({
    status: 'success',
    results: messages.length,
    data: {
      messages
    }
  });
});

exports.getChatDetails = catchAsync(async (req, res, next) => {
  const chat = await Chat.findById(req.params.id)
    .populate('customerId', 'firstName lastName companyName')
    .populate('contractorId', 'firstName lastName companyName')
    .populate('projectId', 'title');

  if (!chat) {
    return next(new AppError('Chat not found', 404));
  }

  // Admins can view any chat details
  if (
    req.user.role !== 'admin' &&
    chat.customerId._id.toString() !== req.user._id.toString() &&
    chat.contractorId._id.toString() !== req.user._id.toString()
  ) {
    return next(new AppError('You do not have permission to view this chat', 403));
  }

  res.status(200).json({
    status: 'success',
    data: {
      chat
    }
  });
});
