const jwt = require('jsonwebtoken');
const { promisify } = require('util');
const User = require('../models/User');
const ContractorProfile = require('../models/ContractorProfile');
const AppError = require('../utils/AppError');
const catchAsync = require('../utils/catchAsync');

exports.protect = catchAsync(async (req, res, next) => {
  // 1) Getting token and check if it's there
  let token;
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return next(new AppError('You are not logged in! Please log in to get access.', 401));
  }

  // 2) Verification token
  const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);

  // 3) Check if user still exists
  const currentUser = await User.findById(decoded.id);
  if (!currentUser) {
    return next(new AppError('The user belonging to this token does no longer exist.', 401));
  }

  // GRANT ACCESS TO PROTECTED ROUTE
  req.user = currentUser;
  next();
});

exports.restrictTo = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return next(new AppError('You do not have permission to perform this action', 403));
    }
    next();
  };
};

exports.requireApprovedContractor = catchAsync(async (req, res, next) => {
  if (req.user.role !== 'contractor') {
    return next(new AppError('Only contractors can perform this action.', 403));
  }

  const profile = await ContractorProfile.findOne({ userId: req.user._id });
  if (!profile) {
    return next(new AppError('Contractor profile not found.', 404));
  }

  if (profile.approvalStatus !== 'approved') {
    return next(new AppError(`Your profile status is ${profile.approvalStatus}. You must be approved to perform this action.`, 403));
  }

  next();
});
