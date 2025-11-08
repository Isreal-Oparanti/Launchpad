const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const validator = require('validator');
const { OpenAIEmbeddings } = require('@langchain/openai');

// SINGLETON: Reuse embeddings instance
let embeddings = null;
if (process.env.USE_AI_MATCHING === 'true') {
  try {
    embeddings = new OpenAIEmbeddings({
      modelName: 'text-embedding-3-small',
      openAIApiKey: process.env.OPENAI_API_KEY,
      maxRetries: 2,
      timeout: 10000,
    });
    console.log('OpenAI embeddings initialized');
  } catch (err) {
    console.warn('Failed to initialize embeddings:', err.message);
  }
}

const userSchema = new mongoose.Schema({
  fullName: {
    type: String,
    required: [true, 'Full name is required'],
    trim: true,
    maxLength: [100, 'Full name cannot exceed 100 characters']
  },
  
  username: {
    type: String,
    required: [true, 'Username is required'],
    unique: true,
    trim: true,
    lowercase: true,
    minLength: [3, 'Username must be at least 3 characters'],
    maxLength: [30, 'Username cannot exceed 30 characters'],
    match: [/^[a-zA-Z0-9_]+$/, 'Username can only contain letters, numbers, and underscores']
  },
  
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    validate: [validator.isEmail, 'Please provide a valid email']
  },
  
  password: {
    type: String,
    required: function() { return !this.googleId; },
    minLength: [6, 'Password must be at least 6 characters'],
    select: false
  },
  
  googleId: { type: String, sparse: true },
  
  profilePicture: { type: String, default: null },
  
  school: { type: String, required: [true, 'School is required'], trim: true },
  
  major: { type: String, trim: true, default: null },
  
  bio: { type: String, maxLength: [500, 'Bio cannot exceed 500 characters'], default: null },
  
  skills: [{ type: String, trim: true }],
  interests: [{ type: String, trim: true }],
  location: { type: String, trim: true, default: null },
  openToCollaboration: { type: Boolean, default: false },
  hobbies: [{ type: String, trim: true }],
  personalityTraits: [{ type: String, trim: true }],

  collaborationProfile: {
    lookingFor: [{ type: String }],
    commitmentLevel: { type: String },
    availability: { type: String },
    location: { type: String },
    timezone: { type: String },
    remotePreference: { type: String },
    industries: [{ type: String }],
    workStyle: [{ type: String }],
    personalityTraits: [{ type: String }],
    hobbies: [{ type: String }],
    strengths: [{ type: String }],
    projectStagePreference: [{ type: String }],
    previousExperience: { type: String },
    additionalNotes: { type: String, maxLength: 300 }
  },

  currentPosition: { type: String, trim: true, default: null },
  website: { type: String, trim: true, default: null },
  linkedinUrl: { type: String, trim: true, default: null },
  githubUrl: { type: String, trim: true, default: null },
  twitterUrl: { type: String, trim: true, default: null },
  expertise: [{ type: String, trim: true }],

  profileEmbedding: {
    type: [Number],
    default: null
  },
  
  isEmailVerified: { type: Boolean, default: false },
  emailVerificationCode: { type: String, select: false },
  emailVerificationCodeExpires: { type: Date, select: false },
  passwordResetToken: { type: String, select: false },
  passwordResetExpires: { type: Date, select: false },
  lastLogin: { type: Date, default: Date.now },
  role: { type: String, enum: ['student', 'admin', 'moderator'], default: 'student' },
  profileCompleted: { type: Boolean, default: false },
  termsAccepted: { type: Boolean, default: false },
  termsAcceptedAt: { type: Date }
}, {
  timestamps: true,
  toJSON: { 
    virtuals: true,
    transform: (doc, ret) => {
      delete ret.password;
      delete ret.emailVerificationCode;
      delete ret.emailVerificationCodeExpires;
      delete ret.passwordResetToken;
      delete ret.passwordResetExpires;
      delete ret.__v;
      return ret;
    }
  },
  toObject: { virtuals: true }
});

// Indexes
userSchema.index({ email: 1 });
userSchema.index({ username: 1 });
userSchema.index({ googleId: 1 });
userSchema.index({ school: 1 });
userSchema.index({ createdAt: -1 });

// Virtuals
userSchema.virtual('initials').get(function() {
  if (!this.fullName) return 'U';
  return this.fullName.split(' ').map(n => n[0]?.toUpperCase()).slice(0, 2).join('');
});

userSchema.virtual('displayName').get(function() {
  return this.username || this.fullName.split(' ')[0];
});

// === PASSWORD HASHING ===
userSchema.pre('save', async function(next) {
  if (!this.isModified('password') || !this.password) return next();
  try {
    this.password = await bcrypt.hash(this.password, 12);
    next();
  } catch (err) {
    next(err);
  }
});

// === PROFILE COMPLETION ===
userSchema.pre('save', function(next) {
  this.profileCompleted = !!(
    this.fullName &&
    this.username &&
    this.email &&
    this.school &&
    this.isEmailVerified &&
    this.termsAccepted
  );
  next();
});

// === AUTO-GENERATE EMBEDDING (PRODUCTION SAFE) ===
userSchema.pre('save', async function(next) {
  // Skip if AI disabled
  if (process.env.USE_AI_MATCHING !== 'true' || !embeddings) return next();

  // Only run if relevant fields changed
  const fields = ['bio', 'skills', 'interests', 'expertise', 'currentPosition', 'collaborationProfile'];
  const changed = fields.some(f => this.isModified(f));
  if (!changed) return next();

  // Build rich text
  const parts = [
    this.bio || '',
    this.skills?.length ? `Skills: ${this.skills.join(', ')}` : '',
    this.interests?.length ? `Interests: ${this.interests.join(', ')}` : '',
    this.expertise?.length ? `Expertise: ${this.expertise.join(', ')}` : '',
    this.currentPosition ? `Position: ${this.currentPosition}` : '',
  ];

  if (this.collaborationProfile) {
    const cp = this.collaborationProfile;
    parts.push(
      `Looking for: ${cp.lookingFor?.join(', ') || ''}`,
      `Industries: ${cp.industries?.join(', ') || ''}`,
      `Work style: ${cp.workStyle?.join(', ') || ''}`,
      `Personality: ${cp.personalityTraits?.join(', ') || ''}`,
      `Commitment: ${cp.commitmentLevel || ''}`,
      `Availability: ${cp.availability || ''}`
    );
  }

  const text = parts.filter(Boolean).join(' | ').trim();

  // No content → clear embedding
  if (!text) {
    this.profileEmbedding = null;
    return next();
  }

  // Generate embedding — NEVER BLOCK SAVE
  try {
    const [embedding] = await embeddings.embedDocuments([text]);
    this.profileEmbedding = embedding;
    console.log(`Embedding updated: ${this.fullName}`);
  } catch (err) {
    console.error(`Embedding failed for ${this.fullName}:`, err.message);
    this.profileEmbedding = null;
  }

  next();
});

// === INSTANCE METHODS ===
userSchema.methods.comparePassword = async function(candidate) {
  if (!this.password) return false;
  return bcrypt.compare(candidate, this.password);
};

userSchema.methods.generateVerificationCode = function() {
  const code = Math.floor(100000 + Math.random() * 900000).toString();
  this.emailVerificationCode = code;
  this.emailVerificationCodeExpires = Date.now() + 10 * 60 * 1000;
  return code;
};

userSchema.methods.verifyEmailCode = function(code) {
  if (this.emailVerificationCode !== code || this.emailVerificationCodeExpires < Date.now()) {
    return false;
  }
  this.isEmailVerified = true;
  this.emailVerificationCode = undefined;
  this.emailVerificationCodeExpires = undefined;
  return true;
};

// === STATIC METHODS ===
userSchema.statics.findByEmailOrGoogle = function(email, googleId = null) {
  const query = { email: email.toLowerCase() };
  if (googleId) {
    query.$or = [{ email: email.toLowerCase() }, { googleId }];
  }
  return this.findOne(query);
};

userSchema.statics.findByUsername = function(username) {
  return this.findOne({ username: username.toLowerCase() });
};

userSchema.statics.createUser = async function(userData) {
  const session = await mongoose.startSession();
  try {
    session.startTransaction();
    const existing = await this.findByEmailOrGoogle(userData.email, userData.googleId);
    if (existing) throw new Error('User already exists');
    if (userData.username && await this.findByUsername(userData.username)) {
      throw new Error('Username taken');
    }
    const user = new this(userData);
    await user.save({ session });
    await session.commitTransaction();
    return user;
  } catch (err) {
    await session.abortTransaction();
    throw err;
  } finally {
    session.endSession();
  }
};

const User = mongoose.model('User', userSchema);
module.exports = User;