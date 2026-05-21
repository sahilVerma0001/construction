const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  phone: {
    type: String,
    required: [true, 'Please provide your phone number'],
    unique: true,
  },
  email: {
    type: String,
    lowercase: true,
  },
  role: {
    type: String,
    enum: ['customer', 'contractor', 'admin'],
    default: 'customer'
  },
  firstName: {
    type: String,
    required: [true, 'Please provide your first name']
  },
  lastName: {
    type: String,
    required: [true, 'Please provide your last name']
  },
  password: {
    type: String,
    required: [true, 'Please provide a password'],
    minlength: 8,
    select: false
  },
  isPhoneVerified: {
    type: Boolean,
    default: false
  },
  avatarUrl: String,
}, { timestamps: true });

// Hash password before saving
userSchema.pre('save', async function() {
  if (!this.isModified('password')) return;
  this.password = await bcrypt.hash(this.password, 12);
});

// Compare password
userSchema.methods.correctPassword = async function(candidatePassword, userPassword) {
  return await bcrypt.compare(candidatePassword, userPassword);
};

const User = mongoose.model('User', userSchema);
module.exports = User;
