const mongoose = require('mongoose');

const bidSchema = new mongoose.Schema({
  projectId: {
    type: mongoose.Schema.ObjectId,
    ref: 'Project',
    required: true
  },
  contractorId: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: true
  },
  estimatedPrice: {
    type: Number,
    required: [true, 'Please provide an estimated price']
  },
  timelineDays: {
    type: Number,
    required: [true, 'Please estimate the timeline in days']
  },
  proposalText: {
    type: String,
    required: [true, 'Please provide a short proposal']
  },
  status: {
    type: String,
    enum: ['pending', 'accepted', 'rejected', 'withdrawn'],
    default: 'pending'
  }
}, { timestamps: true });

// Prevent a contractor from bidding multiple times on the same project
bidSchema.index({ projectId: 1, contractorId: 1 }, { unique: true });

const Bid = mongoose.model('Bid', bidSchema);
module.exports = Bid;
