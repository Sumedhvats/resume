const mongoose = require('mongoose');

const resumeSchema = new mongoose.Schema({
  originalName: {
    type: String,
    required: true
  },
  filename: {
    type: String,
    required: true
  },
  filePath: {
    type: String,
    required: true
  },
  extractedText: {
    type: String,
    required: true
  },
  keywords: [{
    type: String,
    lowercase: true
  }],
  skills: [{
    type: String,
    lowercase: true
  }],
  experience: {
    type: String
  },
  education: {
    type: String
  },
  contactInfo: {
    email: String,
    phone: String,
    name: String
  },
  fileSize: {
    type: Number
  },
  mimeType: {
    type: String
  },
  uploadedAt: {
    type: Date,
    default: Date.now
  },
  matchHistory: [{
    jobId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Job'
    },
    score: {
      type: Number,
      min: 0,
      max: 100
    },
    matchedKeywords: [String],
    matchedAt: {
      type: Date,
      default: Date.now
    }
  }]
});

resumeSchema.index({ extractedText: 'text' });
resumeSchema.index({ keywords: 1 });
resumeSchema.index({ uploadedAt: -1 });

module.exports = mongoose.model('Resume', resumeSchema);
