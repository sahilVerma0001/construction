const Bid = require('../models/Bid');
const Project = require('../models/Project');
const Chat = require('../models/Chat');
const AppError = require('../utils/AppError');
const { z } = require('zod');

const submitBidSchema = z.object({
  projectId: z.string().min(1, 'Project ID is required'),
  estimatedPrice: z.number().positive('Bid amount must be positive'),
  timelineDays: z.number().positive('Estimated days must be positive'),
  proposalText: z.string().min(10, 'Proposal must be at least 10 characters long')
});

exports.submitBid = async (req, res, next) => {
  try {
    // Validation
    const validatedData = submitBidSchema.parse(req.body);

    // 1. Ensure project exists and is open
    const project = await Project.findById(validatedData.projectId);
    if (!project) {
      return next(new AppError('Project not found', 404));
    }
    if (project.status !== 'open') {
      return next(new AppError('This project is no longer accepting bids', 400));
    }

    // 2. Prevent multiple bids from the same contractor
    const existingBid = await Bid.findOne({ 
      projectId: validatedData.projectId, 
      contractorId: req.user._id 
    });

    if (existingBid) {
      return next(new AppError('You have already submitted a bid for this project', 400));
    }

    // 3. Create Bid
    const bid = await Bid.create({
      ...validatedData,
      contractorId: req.user._id,
      status: 'pending'
    });

    res.status(201).json({
      status: 'success',
      data: {
        bid
      }
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ status: 'fail', errors: error.errors });
    }
    next(error);
  }
};

exports.getBidsForProject = async (req, res, next) => {
  try {
    const { projectId } = req.params;

    // Verify project belongs to customer (or user is an admin)
    const project = await Project.findById(projectId);
    if (!project) {
      return next(new AppError('Project not found', 404));
    }

    if (req.user.role === 'customer' && project.customerId.toString() !== req.user._id.toString()) {
      return next(new AppError('You can only view bids for your own projects', 403));
    }

    const bids = await Bid.find({ projectId })
      .populate('contractorId', 'firstName lastName')
      .sort('bidAmount'); // Sort by lowest bid by default

    res.status(200).json({
      status: 'success',
      results: bids.length,
      data: {
        bids
      }
    });
  } catch (error) {
    next(error);
  }
};

exports.acceptBid = async (req, res, next) => {
  try {
    const { bidId } = req.params;

    const bid = await Bid.findById(bidId);
    if (!bid) {
      return next(new AppError('Bid not found', 404));
    }

    const project = await Project.findById(bid.projectId);
    
    // Only the project owner can accept a bid
    if (project.customerId.toString() !== req.user._id.toString()) {
      return next(new AppError('You are not authorized to accept this bid', 403));
    }

    if (project.status !== 'open') {
      return next(new AppError('This project already has an accepted bid', 400));
    }

    // 1. Update this bid to accepted
    bid.status = 'accepted';
    await bid.save();

    // 2. Reject all other bids for this project
    await Bid.updateMany(
      { projectId: project._id, _id: { $ne: bid._id } },
      { $set: { status: 'rejected' } }
    );

    // 3. Update project status to assigned and record the winning bid
    project.status = 'assigned';
    project.winningBidId = bid._id;
    await project.save();

    // 4. Automatically create a Chat room between customer and contractor
    const chat = await Chat.create({
      projectId: project._id,
      customerId: project.customerId,
      contractorId: bid.contractorId
    });

    res.status(200).json({
      status: 'success',
      message: 'Bid accepted successfully',
      data: {
        bid,
        project,
        chat
      }
    });
  } catch (error) {
    next(error);
  }
};

exports.getMyBids = async (req, res, next) => {
  try {
    if (req.user.role !== 'contractor') {
      return next(new AppError('Only contractors can access their bids', 403));
    }

    const bids = await Bid.find({ contractorId: req.user._id })
      .populate('projectId', 'title status location projectType')
      .sort('-createdAt');

    res.status(200).json({
      status: 'success',
      results: bids.length,
      data: {
        bids
      }
    });
  } catch (error) {
    next(error);
  }
};
