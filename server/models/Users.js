const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const validator = require('validator');

const userSchema = new mongoose.Schema({
  fullName: {
    type: String,
    required: [true, 'Full name is required'],
    trim: true,
    maxLength: [100, 'Full name cannot exceed 100 characters']
  },
  
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    validate: [validator.isEmail, 'Please provide a valid email'],
    index: true
  },
  
  password: {
    type: String,
    required: function() {
      return !this.googleId;
    },
    minLength: [6, 'Password must be at least 6 characters'],
    select: false
  },
  
  googleId: {
    type: String,
    sparse: true,
    index: true
  },
  
  profilePicture: {
    type: String,
    default: null
  },
  
  school: {
    type: String,
    required: [true, 'School is required'],
    trim: true
  },
  
  major: {
    type: String,
    trim: true,
    default: null
  },
  
  isEmailVerified: {
    type: Boolean,
    default: false
  },
  
  emailVerificationToken: {
    type: String,
    select: false
  },
  
  emailVerificationExpires: {
    type: Date,
    select: false
  },
  
  passwordResetToken: {
    type: String,
    select: false
  },
  
  passwordResetExpires: {
    type: Date,
    select: false
  },
  
  lastLogin: {
    type: Date,
    default: Date.now
  },
  
  role: {
    type: String,
    enum: ['student', 'admin', 'moderator'],
    default: 'student'
  },
  
  profileCompleted: {
    type: Boolean,
    default: false
  },
  
  termsAccepted: {
    type: Boolean,
    default: false
  },
  
  termsAcceptedAt: {
    type: Date
  }
}, {
  timestamps: true,
  toJSON: { 
    virtuals: true,
    transform: function(doc, ret) {
      delete ret.password;
      delete ret.emailVerificationToken;
      delete ret.emailVerificationExpires;
      delete ret.passwordResetToken;
      delete ret.passwordResetExpires;
      delete ret.__v;
      return ret;
    }
  },
  toObject: { virtuals: true }
});

userSchema.index({ email: 1 });
userSchema.index({ googleId: 1 });
userSchema.index({ school: 1 });
userSchema.index({ createdAt: -1 });

userSchema.virtual('initials').get(function() {
  if (!this.fullName) return 'U';
  return this.fullName
    .split(' ')
    .map(name => name.charAt(0).toUpperCase())
    .slice(0, 2)
    .join('');
});

userSchema.pre('save', async function(next) {
  if (!this.isModified('password') || !this.password) return next();
  
  try {
    this.password = await bcrypt.hash(this.password, 12);
    next();
  } catch (error) {
    next(error);
  }
});

userSchema.pre('save', function(next) {
  this.profileCompleted = !!(
    this.fullName &&
    this.email &&
    this.school &&
    this.isEmailVerified &&
    this.termsAccepted
  );
  next();
});

userSchema.methods.comparePassword = async function(candidatePassword) {
  if (!this.password) return false;
  return await bcrypt.compare(candidatePassword, this.password);
};

userSchema.statics.findByEmailOrGoogle = function(email, googleId = null) {
  const query = { email: email.toLowerCase() };
  if (googleId) {
    query.$or = [
      { email: email.toLowerCase() },
      { googleId: googleId }
    ];
  }
  return this.findOne(query);
};

userSchema.statics.createUser = async function(userData) {
  const session = await mongoose.startSession();
  
  try {
    session.startTransaction();
    
    const existingUser = await this.findByEmailOrGoogle(userData.email, userData.googleId);
    if (existingUser) {
      throw new Error('User already exists with this email');
    }
    
    const user = new this(userData);
    await user.save({ session });
    
    await session.commitTransaction();
    return user;
    
  } catch (error) {
    await session.abortTransaction();
    throw error;
  } finally {
    session.endSession();
  }
};

const User = mongoose.model('User', userSchema);

module.exports = User;