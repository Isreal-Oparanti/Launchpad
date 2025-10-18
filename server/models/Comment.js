const mongoose = require('mongoose');

const commentSchema = new mongoose.Schema({
  project: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Project',
    required: true,
    index: true
  },

  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },

  content: {
    type: String,
    required: [true, 'Comment content is required'],
    trim: true,
    maxLength: [1000, 'Comment cannot exceed 1000 characters']
  },

  // Anonymous posting
  isAnonymous: {
    type: Boolean,
    default: false
  },

  // Engagement
  likes: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],

  likeCount: {
    type: Number,
    default: 0
  },

  // Moderation
  isEdited: {
    type: Boolean,
    default: false
  },

  editedAt: {
    type: Date
  },

  isDeleted: {
    type: Boolean,
    default: false
  },

  deletedAt: {
    type: Date
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes
commentSchema.index({ project: 1, createdAt: -1 });
commentSchema.index({ author: 1, createdAt: -1 });

// Methods
commentSchema.methods.toggleLike = async function(userId) {
  const likeIndex = this.likes.indexOf(userId);
  
  if (likeIndex > -1) {
    this.likes.splice(likeIndex, 1);
    this.likeCount -= 1;
  } else {
    this.likes.push(userId);
    this.likeCount += 1;
  }
  
  await this.save();
  return likeIndex === -1;
};

commentSchema.methods.hasLiked = function(userId) {
  return this.likes.some(id => id.toString() === userId.toString());
};

commentSchema.methods.softDelete = async function() {
  this.isDeleted = true;
  this.deletedAt = Date.now();
  await this.save();
};

// Middleware - Update project comment count
commentSchema.post('save', async function(doc) {
  if (!doc.isDeleted) {
    const Project = mongoose.model('Project');
    const Comment = mongoose.model('Comment');
    const commentCount = await Comment.countDocuments({
      project: doc.project,
      isDeleted: false
    });
    
    await Project.findByIdAndUpdate(doc.project, {
      commentCount,
      lastActivityAt: Date.now()
    });
  }
});

commentSchema.post('remove', async function(doc) {
  const Project = mongoose.model('Project');
  const Comment = mongoose.model('Comment');
  const commentCount = await Comment.countDocuments({
    project: doc.project,
    isDeleted: false
  });
  
  await Project.findByIdAndUpdate(doc.project, {
    commentCount
  });
});

// Middleware - Update like count
commentSchema.pre('save', function(next) {
  if (this.isModified('likes')) {
    this.likeCount = this.likes.length;
  }
  next();
});

const Comment = mongoose.model('Comment', commentSchema);

module.exports = Comment;