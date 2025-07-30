const mongoose = require('mongoose');

const jobSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  company: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true
  },
  requirements: {
    type: String,
    required: true
  },
  location: {
    type: String,
    trim: true
  },
  salaryRange: {
    min: Number,
    max: Number,
    currency: {
      type: String,
      default: 'USD'
    }
  },
  jobType: {
    type: String,
    enum: ['full-time', 'part-time', 'contract', 'internship', 'freelance'],
    default: 'full-time'
  },
  keywords: [{
    type: String,
    lowercase: true
  }],
  requiredSkills: [{
    type: String,
    lowercase: true
  }],
  preferredSkills: [{
    type: String,
    lowercase: true
  }],
  experienceLevel: {
    type: String,
    enum: ['entry', 'mid', 'senior', 'lead', 'executive'],
    default: 'mid'
  },
  isActive: {
    type: Boolean,
    default: true
  },
  postedAt: {
    type: Date,
    default: Date.now
  },
  expiresAt: {
    type: Date
  },
  applicationUrl: {
    type: String
  },
  contactEmail: {
    type: String
  }
});

jobSchema.index({ title: 'text', description: 'text', requirements: 'text' });
jobSchema.index({ keywords: 1 });
jobSchema.index({ isActive: 1 });
jobSchema.index({ postedAt: -1 });

module.exports = mongoose.model('Job', jobSchema);
