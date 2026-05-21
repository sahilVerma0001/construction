const jwt = require('jsonwebtoken');
const User = require('../models/User');
const ContractorProfile = require('../models/ContractorProfile');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/AppError');

const signToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN
  });
};

const createSendToken = (user, statusCode, res) => {
  const token = signToken(user._id);

  // Remove password from output
  user.password = undefined;

  res.status(statusCode).json({
    status: 'success',
    token,
    data: {
      user
    }
  });
};

exports.register = catchAsync(async (req, res, next) => {
  const { phone, email, firstName, lastName, password, role } = req.body;

  // Only allow customer or contractor roles via registration
  const allowedRoles = ['customer', 'contractor'];
  if (role && !allowedRoles.includes(role)) {
    return next(new AppError('Invalid role. Admins are assigned manually.', 400));
  }

  const finalRole = role || 'customer';

  const newUser = await User.create({
    phone,
    email,
    firstName,
    lastName,
    password,
    role: finalRole
  });

  // Auto-create a minimal pending profile so the admin can see new contractors immediately.
  // The contractor fills in company/PAN details later in onboarding.
  if (finalRole === 'contractor') {
    await ContractorProfile.create({ userId: newUser._id });
  }

  createSendToken(newUser, 201, res);
});

exports.login = catchAsync(async (req, res, next) => {
  const { phone, password } = req.body;

  if (!phone || !password) {
    return next(new AppError('Please provide phone and password!', 400));
  }

  const user = await User.findOne({ phone }).select('+password');

  if (!user || !(await user.correctPassword(password, user.password))) {
    return next(new AppError('Incorrect phone or password', 401));
  }

  createSendToken(user, 200, res);
});

exports.getMe = catchAsync(async (req, res, next) => {
  const user = await User.findById(req.user.id);

  let profile = null;
  if (user.role === 'contractor') {
    profile = await ContractorProfile.findOne({ userId: user._id });
  }

  res.status(200).json({
    status: 'success',
    data: {
      user,
      profile
    }
  });
});

exports.updateProfile = catchAsync(async (req, res, next) => {
  if (req.user.role !== 'contractor') {
    return next(new AppError('Only contractors have a dedicated profile to update.', 403));
  }

  const { companyName, experienceYears, gstin, panCard } = req.body;

  // Find and update the contractor's profile
  const profile = await ContractorProfile.findOneAndUpdate(
    { userId: req.user._id },
    {
      companyName,
      experienceYears: experienceYears ? Number(experienceYears) : undefined,
      gstin,
      panCard
    },
    { new: true, runValidators: true }
  );

  if (!profile) {
    return next(new AppError('Contractor profile not found.', 404));
  }

  res.status(200).json({
    status: 'success',
    data: {
      profile
    }
  });
});
