  const mongoose = require('mongoose');

const projectSchema = new mongoose.Schema({

  title: {
    type: String,
    required: [false, 'Project title is required'],
    trim: true,
    maxLength: [100, 'Title cannot exceed 100 characters']
  },
  
  tagline: {
    type: String,
    required: [true, 'Tagline is required'],
    trim: true,
    maxLength: [150, 'Tagline cannot exceed 150 characters']
  },

  // Investor-Focused Content
  problemStatement: {
    type: String,
    required: [true, 'Problem statement is required'],
    maxLength: [1000, 'Problem statement cannot exceed 1000 characters']
  },

  solution: {
    type: String,
    required: [true, 'Solution description is required'],
    maxLength: [1000, 'Solution cannot exceed 1000 characters']
  },

  targetMarket: {
    type: String,
    required: [true, 'Target market is required'],
    maxLength: [500, 'Target market cannot exceed 500 characters']
  },

  // Traction & Metrics
  traction: {
    users: { type: Number, default: 0 },
    revenue: { type: Number, default: 0 },
    growth: { type: String, default: '' },
    milestones: [{ type: String }]
  },

  // Team
  creator: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },

  teamMembers: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    role: String,
    expertise: String
  }],

  // Categories & Tags
  category: {
    type: String,
    required: true,
    enum: ['Technology', 'Health', 'Education', 'Agriculture', 'Finance', 'Social Impact', 'Entertainment', 'Other']
  },

  tags: [{
    type: String,
    trim: true
  }],

  // Project Stage
  stage: {
    type: String,
    required: true,
    enum: ['Idea', 'Prototype', 'MVP', 'Beta', 'Launched'],
    default: 'Idea'
  },

  // Media - UPDATED: Added logo field
  logo: {
    type: String,
    default: null
  },

  coverImage: {
    type: String,
    default: null
  },

  gallery: [{
    type: String
  }],

  videoUrl: {
    type: String,
    default: null
  },

  // Optional Links (shown publicly)
  demoUrl: {
    type: String,
    default: null
  },

  pitchDeckUrl: {
    type: String,
    default: null
  },

  // Hidden by default - only shared privately
  repositoryUrl: {
    type: String,
    default: null,
    select: false
  },

  // Engagement
  upvotes: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],

  upvoteCount: {
    type: Number,
    default: 0
  },

  viewCount: {
    type: Number,
    default: 0
  },

  commentCount: {
    type: Number,
    default: 0
  },

  // Investor Interest
  interestedInvestors: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    message: String,
    contactShared: { type: Boolean, default: false },
    createdAt: { type: Date, default: Date.now }
  }],

  interestCount: {
    type: Number,
    default: 0
  },

  // Status
  isPublished: {
    type: Boolean,
    default: false
  },

  isFeatured: {
    type: Boolean,
    default: false
  },

  // Metadata
  lastActivityAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for performance
projectSchema.index({ creator: 1, createdAt: -1 });
projectSchema.index({ upvoteCount: -1 });
projectSchema.index({ viewCount: -1 });
projectSchema.index({ category: 1 });
projectSchema.index({ stage: 1 });
projectSchema.index({ isPublished: 1, createdAt: -1 });
projectSchema.index({ tags: 1 });

// Text search index
projectSchema.index({
  title: 'text',
  tagline: 'text',
  problemStatement: 'text',
  tags: 'text'
});

// Virtual for engagement score
projectSchema.virtual('engagementScore').get(function() {
  const recency = (Date.now() - this.createdAt) / (1000 * 60 * 60 * 24);
  return (this.upvoteCount * 2 + this.commentCount * 3 + this.interestCount * 5) / (recency + 1);
});

// Methods
projectSchema.methods.incrementViews = async function() {
  this.viewCount += 1;
  await this.save();
};

projectSchema.methods.toggleUpvote = async function(userId) {
  const upvoteIndex = this.upvotes.indexOf(userId);
  
  if (upvoteIndex > -1) {
    this.upvotes.splice(upvoteIndex, 1);
    this.upvoteCount -= 1;
  } else {
    this.upvotes.push(userId);
    this.upvoteCount += 1;
  }
  
  this.lastActivityAt = Date.now();
  await this.save();
  return upvoteIndex === -1;
};

projectSchema.methods.hasUpvoted = function(userId) {
  return this.upvotes.some(id => id.toString() === userId.toString());
};

projectSchema.methods.addInterest = async function(userId, message = '') {
  const existingInterest = this.interestedInvestors.find(
    i => i.user.toString() === userId.toString()
  );
  
  if (existingInterest) {
    throw new Error('You have already expressed interest in this project');
  }
  
  this.interestedInvestors.push({
    user: userId,
    message,
    createdAt: Date.now()
  });
  
  this.interestCount += 1;
  this.lastActivityAt = Date.now();
  await this.save();
};

projectSchema.methods.hasExpressedInterest = function(userId) {
  return this.interestedInvestors.some(i => i.user.toString() === userId.toString());
};

// Static methods
projectSchema.statics.getFeaturedProjects = function(limit = 10) {
  return this.find({ isPublished: true, isFeatured: true })
    .populate('creator', 'fullName profilePicture school major title')
    .sort('-createdAt')
    .limit(limit);
};

projectSchema.statics.getTrendingProjects = function(limit = 20) {
  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
  
  return this.find({
    isPublished: true,
    createdAt: { $gte: sevenDaysAgo }
  })
    .populate('creator', 'fullName profilePicture school major title')
    .sort('-upvoteCount -viewCount')
    .limit(limit);
};

// Middleware
projectSchema.pre('save', function(next) {
  if (this.isModified('upvotes')) {
    this.upvoteCount = this.upvotes.length;
  }
  if (this.isModified('interestedInvestors')) {
    this.interestCount = this.interestedInvestors.length;
  }
  next();
});

const Project = mongoose.model('Project', projectSchema);

module.exports = Project;