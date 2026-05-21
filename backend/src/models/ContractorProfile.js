const mongoose = require('mongoose');

const contractorProfileSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  // These are filled in by the contractor during onboarding after registration
  companyName: { type: String, default: '' },
  experienceYears: { type: Number, default: 0 },
  gstin: { type: String, default: '' },
  panCard: { type: String, default: '' },
  approvalStatus: {
    type: String,
    enum: ['pending', 'approved', 'rejected', 'suspended'],
    default: 'pending'
  },
  rejectionReason: String,
  serviceAreas: [{
    city: String,
    state: String,
    pincode: String
  }],
  portfolio: [{
    imageUrl: String,
    description: String
  }]
}, { timestamps: true });

// Index for fast searching
contractorProfileSchema.index({ 'serviceAreas.city': 1 });

const ContractorProfile = mongoose.model('ContractorProfile', contractorProfileSchema);
module.exports = ContractorProfile;
