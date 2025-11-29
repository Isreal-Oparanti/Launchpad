const mongoose = require('mongoose');

const projectViewSchema = new mongoose.Schema({
  project: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Project',
    required: true,
    index: true
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null,
    index: true
  },
  // For anonymous users
  ipAddress: {
    type: String,
    default: null
  },
  userAgent: {
    type: String,
    default: null
  },
  // Session identifier (combination of IP + user agent hash)
  sessionHash: {
    type: String,
    required: true,
    index: true
  },
  viewedAt: {
    type: Date,
    default: Date.now,
    index: true
  }
}, {
  timestamps: false
});


projectViewSchema.index({ project: 1, user: 1, viewedAt: -1 });
projectViewSchema.index({ project: 1, sessionHash: 1, viewedAt: -1 });
projectViewSchema.index({ viewedAt: 1 }, { expireAfterSeconds: 7776000 }); // Auto-delete after 90 days

const ProjectView = mongoose.model('ProjectView', projectViewSchema);
module.exports = ProjectView;