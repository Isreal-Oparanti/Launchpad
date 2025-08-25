// lib/models/User.js
import mongoose from 'mongoose';

const UserSchema = new mongoose.Schema({
  // Civic Auth ID (primary identifier from Civic)
  civicId: {
    type: String,
    required: true,
    unique: true,
  },
  
  // Basic info from Civic Auth
  email: {
    type: String,
    required: true,
  },
  
  name: {
    type: String,
    required: true,
  },
  
  // Additional profile information
  university: {
    type: String,
    default: '',
  },
  
  major: {
    type: String,
    default: '',
  },
  
  graduationYear: {
    type: Number,
    default: null,
  },
  
  bio: {
    type: String,
    default: '',
    maxLength: 500,
  },
  
  avatar: {
    type: String,
    default: '',
  },
  
  // Project-related fields
  projects: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Project',
  }],
  
  sparks: {
    type: Number,
    default: 0,
  },
  
  // Authentication metadata
  isVerified: {
    type: Boolean,
    default: true, // Civic Auth handles verification
  },
  
  lastLogin: {
    type: Date,
    default: Date.now,
  },
  
  // Timestamps
  createdAt: {
    type: Date,
    default: Date.now,
  },
  
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

// Update the updatedAt field before saving
UserSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Create indexes for better performance
UserSchema.index({ civicId: 1 });
UserSchema.index({ email: 1 });

export default mongoose.models.User || mongoose.model('User', UserSchema);