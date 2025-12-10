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
      index: true, // ✅ Add direct index for faster creator queries
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
      index: true, // ✅ Add direct index
    },
    tags: [{ type: String, trim: true }],
    stage: {
      type: String,
      required: true,
      enum: ['Idea', 'Prototype', 'MVP', 'Beta', 'Launched'],
      default: 'Idea',
      index: true, // ✅ Add direct index
    },
    logo: { 
      data: Buffer, 
      contentType: String,
      filename: String
    },
    coverImage: { 
      data: Buffer, 
      contentType: String,
      filename: String
    },
    gallery: [{ 
      data: Buffer, 
      contentType: String,
      //  CRITICAL: Don't select by default
    }],
    videoUrl: { type: String, default: null },
    demoUrl: { type: String, default: null },
    pitchDeckUrl: { type: String, default: null },
    repositoryUrl: { type: String, default: null, select: false },
    upvotes: [{ 
      type: mongoose.Schema.Types.ObjectId, 
      ref: 'User',
      select: false // ✅ Don't select by default for performance
    }],
    upvoteCount: { type: Number, default: 0, index: true }, // ✅ Add index
    viewCount: { type: Number, default: 0, index: true }, // ✅ Add index
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
    isPublished: { type: Boolean, default: false, index: true }, // ✅ Add index
    isFeatured: { type: Boolean, default: false },
    neededRoles: [
      {
        role: {
          type: String,
          required: true,
          enum: ['Co-founder', 'Technical Co-founder', 'Designer', 'Frontend Developer', 'Backend Developer', 'Full-Stack Developer', 'Mobile Developer', 'Product Manager', 'Marketing Lead', 'Business Development', 'Sales Lead', 'Data Scientist', 'Content Creator', 'Other'],
        },
        requiredSkills: [{ type: String, trim: true }],
        preferredLocation: { type: String, default: 'Remote' },
        commitment: { type: String, default: 'Full-time' },
        equity: { type: String, default: 'Negotiable' },
        description: { type: String, default: '', maxlength: 500 },
      },
    ],
    projectEmbedding: { type: [Number], index: 'vector', default: null },
    lastActivityAt: { type: Date, default: Date.now, index: true }, // ✅ Add index
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// ✅ OPTIMIZED INDEXES - Compound indexes for common queries
projectSchema.index({ isPublished: 1, createdAt: -1 }, { name: 'published_recent' });
projectSchema.index({ isPublished: 1, upvoteCount: -1 }, { name: 'published_popular' });
projectSchema.index({ isPublished: 1, lastActivityAt: -1 }, { name: 'published_trending' });
projectSchema.index({ isPublished: 1, category: 1, createdAt: -1 }, { name: 'published_category_recent' });
projectSchema.index({ isPublished: 1, stage: 1, createdAt: -1 }, { name: 'published_stage_recent' });
projectSchema.index({ creator: 1, createdAt: -1 }, { name: 'creator_projects' });

// ✅ Text search index
projectSchema.index(
  { title: 'text', tagline: 'text', problemStatement: 'text', tags: 'text' },
  { 
    name: 'text_search',
    weights: {
      title: 10,
      tagline: 5,
      problemStatement: 3,
      tags: 2
    }
  }
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
    .select('-logo.data -coverImage.data -gallery')
    .populate('creator', 'fullName profilePicture school major title')
    .sort('-createdAt')
    .limit(limit)
    .lean();
};

projectSchema.statics.getTrendingProjects = function (limit = 20) {
  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
  return this.find({ isPublished: true, createdAt: { $gte: sevenDaysAgo } })
    .select('-logo.data -coverImage.data -gallery')
    .populate('creator', 'fullName profilePicture school major title')
    .sort('-upvoteCount -viewCount')
    .limit(limit)
    .lean();
};

// === MIDDLEWARE ===
projectSchema.pre('save', function(next) {
  this.lastActivityAt = new Date();
  if (this.isModified('upvotes')) this.upvoteCount = this.upvotes.length;
  if (this.isModified('interestedInvestors')) this.interestCount = this.interestedInvestors.length;
  
  if (this.isNew) {
    this._isNewProject = true;
  }
  
  next();
});

// POST-SAVE: Trigger matching for NEW projects with needed roles
projectSchema.post('save', async function(doc, next) {
  try {
    if (doc._isNewProject && doc.neededRoles && doc.neededRoles.length > 0) {
      console.log('\n🎯 AUTO-MATCHING TRIGGERED — NEW PROJECT DETECTED');
      console.log('Project:', doc.title);
      console.log('Creator:', doc.creator);
      console.log('Needed Roles:', doc.neededRoles.length);
      
      const { matchUsersToProject } = require('../utils/matching');
      const Notification = require('./Notification');

      setTimeout(async () => {
        try {
          console.log('🚀 STARTING AUTO-MATCHING...');
          const matches = await matchUsersToProject(doc, 5);
          console.log('✅ AUTO-MATCHING COMPLETE:', matches.length, 'matches found');

          if (matches.length > 0 && matches[0].userId) {
            const notification = new Notification({
              user: doc.creator,
              type: 'match',
              title: `${matches.length} Match${matches.length > 1 ? 'es' : ''} Found!`,
              description: `We found ${matches.length} potential collaborator${matches.length > 1 ? 's' : ''} for "${doc.title}"`,
              link: `/projects/${doc._id}/matches`,
              metadata: {
                projectId: doc._id,
                matchCount: matches.length,
                triggeredBy: 'project_creation'
              }
            });
            await notification.save();
            console.log('✅ NOTIFICATION CREATED FOR', matches.length, 'MATCHES');
          } else {
            console.log('⏭️ No valid matches found');
          }
        } catch (matchingError) {
          console.error('❌ AUTO-MATCHING FAILED:', matchingError.message);
        }
      }, 1000); 
    }
  } catch (error) {
    console.error('❌POST-SAVE HOOK ERROR:', error.message);
  }
  
  next();
});

// === MODEL & INDEX CLEANUP ===
const Project = mongoose.model('Project', projectSchema);

// ✅ Index creation on startup
Project.on('index', (error) => {
  if (error) {
    console.error('❌ Index creation error:', error);
  } else {
    console.log('✅ All Project indexes created successfully');
  }
});

module.exports = Project;