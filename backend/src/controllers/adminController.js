const ContractorProfile = require('../models/ContractorProfile');
const AppError = require('../utils/AppError');
const User = require('../models/User');

exports.getPendingContractors = async (req, res, next) => {
  try {
    const pendingProfiles = await ContractorProfile.find({ approvalStatus: 'pending' })
      .populate('userId', 'firstName lastName email phone')
      .sort('-createdAt');

    res.status(200).json({
      status: 'success',
      results: pendingProfiles.length,
      data: {
        profiles: pendingProfiles
      }
    });
  } catch (error) {
    next(error);
  }
};

exports.updateContractorStatus = async (req, res, next) => {
  try {
    const { profileId } = req.params;
    const { status } = req.body;

    if (!['approved', 'rejected'].includes(status)) {
      return next(new AppError('Invalid status. Must be "approved" or "rejected"', 400));
    }

    const profile = await ContractorProfile.findById(profileId);
    if (!profile) {
      return next(new AppError('Contractor profile not found', 404));
    }

    profile.approvalStatus = status;
    await profile.save();

    res.status(200).json({
      status: 'success',
      message: `Contractor successfully ${status}`,
      data: {
        profile
      }
    });
  } catch (error) {
    next(error);
  }
};

const Project = require('../models/Project');
const Chat = require('../models/Chat');

exports.getAllProjects = async (req, res, next) => {
  try {
    const projects = await Project.find()
      .populate('customerId', 'firstName lastName email')
      .populate({
        path: 'winningBidId',
        populate: {
          path: 'contractorId',
          select: 'firstName lastName email'
        }
      })
      .sort('-createdAt');

    res.status(200).json({
      status: 'success',
      results: projects.length,
      data: { projects }
    });
  } catch (error) {
    next(error);
  }
};

exports.getAllUsers = async (req, res, next) => {
  try {
    const users = await User.find().sort('-createdAt');
    const contractorProfiles = await ContractorProfile.find();

    const usersWithProfiles = users.map(user => {
      const u = user.toObject();
      if (u.role === 'contractor') {
        u.profile = contractorProfiles.find(p => p.userId.toString() === u._id.toString());
      }
      return u;
    });

    res.status(200).json({
      status: 'success',
      results: usersWithProfiles.length,
      data: { users: usersWithProfiles }
    });
  } catch (error) {
    next(error);
  }
};

exports.getAllChats = async (req, res, next) => {
  try {
    const chats = await Chat.find()
      .populate('customerId', 'firstName lastName')
      .populate('contractorId', 'firstName lastName companyName')
      .populate('projectId', 'title')
      .sort({ lastMessageAt: -1 });

    res.status(200).json({
      status: 'success',
      results: chats.length,
      data: { chats }
    });
  } catch (error) {
    next(error);
  }
};

exports.deleteUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return next(new AppError('No user found with that ID', 404));
    }

    // Don't let an admin delete themselves
    if (user._id.toString() === req.user._id.toString()) {
      return next(new AppError('You cannot delete your own admin account', 400));
    }

    // Delete contractor profile if they are a contractor
    if (user.role === 'contractor') {
      await ContractorProfile.findOneAndDelete({ userId: user._id });
    }

    // Delete the user
    await User.findByIdAndDelete(req.params.id);

    res.status(204).json({
      status: 'success',
      data: null
    });
  } catch (error) {
    next(error);
  }
};
