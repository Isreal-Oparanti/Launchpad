
const mongoose = require('mongoose');

const matchSchema = new mongoose.Schema({
  project: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Project',
    required: true,
    index: true
  },
  
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  
  role: {
    type: String,
    required: true
  },
  
  score: {
    type: Number,
    required: true,
    min: 0,
    max: 100
  },
  
  explanation: {
    type: String,
    required: true
  },
  
  matchedSkills: [{
    type: String
  }],
  
  matchType: {
    type: String,
    enum: ['ai', 'keyword'],
    default: 'ai'
  },
  
  status: {
    type: String,
    enum: ['pending', 'contacted', 'accepted', 'rejected'],
    default: 'pending'
  },
  
  // Metadata
  matchedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Indexes for fast queries
matchSchema.index({ project: 1, score: -1 });
matchSchema.index({ user: 1 });
matchSchema.index({ project: 1, user: 1 }, { unique: true }); // Prevent duplicates

const Match = mongoose.model('Match', matchSchema);
module.exports = Match;