// models/Project.js
const mongoose = require('mongoose');
const { matchUsersToProject } = require('../utils/matching');
const Notification = require('./Notification');

const projectSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Project title is required'],
      trim: true,
      maxlength: [100, 'Title cannot exceed 100 characters'],
    },
    tagline: {
      type: String,
      required: [true, 'Tagline is required'],
      trim: true,
      maxlength: [150, 'Tagline cannot exceed 150 characters'],
    },
    problemStatement: {
      type: String,
      required: [true, 'Problem statement is required'],
      maxlength: [1000, 'Problem statement cannot exceed 1000 characters'],
    },
    solution: {
      type: String,
      required: [true, 'Solution description is required'],
      maxlength: [1000, 'Solution cannot exceed 1000 characters'],
    },
    targetMarket: {
      type: String,
      required: [true, 'Target market is required'],
      maxlength: [500, 'Target market cannot exceed 500 characters'],
    },
    traction: {
      users: { type: Number, default: 0 },
      revenue: { type: Number, default: 0 },
      growth: { type: String, default: '' },
      milestones: [{ type: String }],
    },
    creator: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    teamMembers: [
      {
        user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        role: String,
        expertise: String,
      },
    ],
    category: {
      type: String,
      required: true,
      enum: ['Technology', 'Health', 'Education', 'Agriculture', 'Finance', 'Social Impact', 'Entertainment', 'Other'],
    },
    tags: [{ type: String, trim: true }],
    stage: {
      type: String,
      required: true,
      enum: ['Idea', 'Prototype', 'MVP', 'Beta', 'Launched'],
      default: 'Idea',
    },
    logo: { data: Buffer, contentType: String },
    coverImage: { data: Buffer, contentType: String },
    gallery: [{ data: Buffer, contentType: String }],
    videoUrl: { type: String, default: null },
    demoUrl: { type: String, default: null },
    pitchDeckUrl: { type: String, default: null },
    repositoryUrl: { type: String, default: null, select: false },
    upvotes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    upvoteCount: { type: Number, default: 0 },
    viewCount: { type: Number, default: 0 },
    commentCount: { type: Number, default: 0 },
    interestedInvestors: [
      {
        user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        message: String,
        contactShared: { type: Boolean, default: false },
        createdAt: { type: Date, default: Date.now },
      },
    ],
    interestCount: { type: Number, default: 0 },
    isPublished: { type: Boolean, default: false },
    isFeatured: { type: Boolean, default: false },
    neededRoles: [
      {
        role: {
          type: String,
          required: true,
          enum: ['Co-founder', 'Designer', 'Developer', 'Marketer', 'Business Dev', 'Other'],
        },
        requiredSkills: [{ type: String, trim: true }],
        preferredLocation: { type: String, default: 'Remote' },
        commitment: { type: String, default: 'Full-time' },
        equity: { type: String, default: 'Negotiable' },
        description: { type: String, default: '', maxlength: 500 },
      },
    ],
    projectEmbedding: { type: [Number], index: 'vector', default: null },
    lastActivityAt: { type: Date, default: Date.now },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// === INDEXES ===
projectSchema.index({ creator: 1, createdAt: -1 }, { name: 'creator_createdAt_index' });
projectSchema.index({ upvoteCount: -1 }, { name: 'upvoteCount_index' });
projectSchema.index({ viewCount: -1 }, { name: 'viewCount_index' });
projectSchema.index({ category: 1 }, { name: 'category_index' });
projectSchema.index({ stage: 1 }, { name: 'stage_index' });
projectSchema.index({ isPublished: 1, createdAt: -1 }, { name: 'isPublished_createdAt_index' });
projectSchema.index({ tags: 1 }, { name: 'tags_index' });
projectSchema.index(
  { title: 'text', tagline: 'text', problemStatement: 'text', tags: 'text' },
  { name: 'text_search_index' }
);

// === VIRTUAL ===
projectSchema.virtual('engagementScore').get(function () {
  const recency = (Date.now() - this.createdAt) / (1000 * 60 * 60 * 24);
  return (this.upvoteCount * 2 + this.commentCount * 3 + this.interestCount * 5) / (recency + 1);
});

// === METHODS ===
projectSchema.methods.incrementViews = async function () {
  this.viewCount += 1;
  await this.save();
};

projectSchema.methods.toggleUpvote = async function (userId) {
  const idx = this.upvotes.indexOf(userId);
  if (idx > -1) {
    this.upvotes.splice(idx, 1);
    this.upvoteCount -= 1;
  } else {
    this.upvotes.push(userId);
    this.upvoteCount += 1;
  }
  this.lastActivityAt = Date.now();
  await this.save();
  return idx === -1;
};

projectSchema.methods.hasUpvoted = function (userId) {
  return this.upvotes.some(id => id.toString() === userId.toString());
};

projectSchema.methods.addInterest = async function (userId, message = '') {
  if (this.interestedInvestors.some(i => i.user.toString() === userId.toString())) {
    throw new Error('Already expressed interest');
  }
  this.interestedInvestors.push({ user: userId, message });
  this.interestCount += 1;
  this.lastActivityAt = Date.now();
  await this.save();
};

projectSchema.methods.hasExpressedInterest = function (userId) {
  return this.interestedInvestors.some(i => i.user.toString() === userId.toString());
};

// === STATIC METHODS ===
projectSchema.statics.getFeaturedProjects = function (limit = 10) {
  return this.find({ isPublished: true, isFeatured: true })
    .populate('creator', 'fullName profilePicture school major title')
    .sort('-createdAt')
    .limit(limit);
};

projectSchema.statics.getTrendingProjects = function (limit = 20) {
  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
  return this.find({ isPublished: true, createdAt: { $gte: sevenDaysAgo } })
    .populate('creator', 'fullName profilePicture school major title')
    .sort('-upvoteCount -viewCount')
    .limit(limit);
};

// === MIDDLEWARE ===
projectSchema.pre('save', function(next) {
  this.lastActivityAt = new Date();
  if (this.isModified('upvotes')) this.upvoteCount = this.upvotes.length;
  if (this.isModified('interestedInvestors')) this.interestCount = this.interestedInvestors.length;
  next();
});
// POST-SAVE: MATCHING + NOTIFICATION
// POST-SAVE: MATCHING + NOTIFICATION
// POST-SAVE: MATCHING + NOTIFICATION
// models/Project.js — ONLY CHANGE THIS PART
// POST-SAVE: Only trigger if neededRoles is present AND not empty
projectSchema.post('save', async function (doc, next) {
  // CRITICAL: Only run on brand new projects (__v === 0 means first save)
  if (doc.__v !== 0) {
    console.log('⏭️ Skipping match (not first save, __v =', doc.__v, ')');
    next();
    return;
  }

  // ONLY if user actually requested collaborators
  if (!doc.neededRoles || doc.neededRoles.length === 0) {
    console.log('⏭️ Skipping match (no roles requested)');
    next();
    return;
  }

  console.log('\n🎯 MATCHING TRIGGERED — NEW PROJECT WITH ROLES');
  console.log('Project:', doc.title);
  console.log('Creator:', doc.creator);
  console.log('Needed Roles:', doc.neededRoles.map(r => `${r.role} (${r.requiredSkills.join(', ')})`));

  try {
    const matches = await matchUsersToProject(doc, 5);
    console.log('✅ MATCHES FOUND:', matches.length);

    if (matches.length > 0 && matches[0].userId) {
      const notif = new Notification({
        user: doc.creator,
        type: 'match',
        title: `${matches.length} Match${matches.length > 1 ? 'es' : ''} for "${doc.title}"`,
        description: `We found ${matches.length} potential collaborator${matches.length > 1 ? 's' : ''} for your project!`,
        link: `/projects/${doc._id}/matches`, // Direct to matches page
      });
      await notif.save();
      console.log('✅ NOTIFICATION SAVED:', notif._id);
    } else {
      console.log('⏭️ No valid matches — no notification sent');
    }
  } catch (err) {
    console.error('❌ MATCHING ERROR:', err.message);
    // Don't block project creation if matching fails
  }

  next();
});
// === MODEL & INDEX CLEANUP ===
const Project = mongoose.model('Project', projectSchema);

// Safe index cleanup on startup
Project.on('index', () => {
  Project.collection.dropIndexes().catch(err => {
    if (err.codeName !== 'IndexNotFound') {
      console.warn('Index cleanup failed:', err.message);
    }
  });
});

module.exports = Project;