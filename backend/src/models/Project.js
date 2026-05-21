const mongoose = require('mongoose');

const projectSchema = new mongoose.Schema({
  customerId: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: true
  },
  title: {
    type: String,
    required: [true, 'A project must have a title']
  },
  projectType: {
    type: String,
    enum: ['residential', 'commercial', 'renovation'],
    required: true
  },
  description: {
    type: String,
    required: [true, 'Please describe your project requirements']
  },
  location: {
    city: { type: String, required: true },
    state: { type: String, required: true },
    pincode: { type: String, required: true },
    coordinates: {
      type: {
        type: String,
        enum: ['Point']
      },
      coordinates: [Number] // [longitude, latitude]
    }
  },
  landSize: {
    value: { type: Number, required: true },
    unit: {
      type: String,
      enum: ['sq_ft', 'gaj', 'bigha', 'acres'],
      required: true
    }
  },
  budget: {
    min: Number,
    max: Number
  },
  timelinePreference: {
    type: String,
    enum: ['urgent', 'flexible'],
    default: 'flexible'
  },
  media: [String],
  status: {
    type: String,
    enum: ['open', 'assigned', 'completed', 'cancelled'],
    default: 'open'
  },
  winningBidId: {
    type: mongoose.Schema.ObjectId,
    ref: 'Bid'
  }
}, { timestamps: true });

// Geospatial index
projectSchema.index({ 'location.coordinates': '2dsphere' });

const Project = mongoose.model('Project', projectSchema);
module.exports = Project;
