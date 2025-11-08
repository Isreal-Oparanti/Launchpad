const mongoose = require('mongoose');

const matchSchema = new mongoose.Schema({
  project: { type: mongoose.Schema.Types.ObjectId, ref: 'Project', required: true },
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  role: { type: String, required: true },
  score: { type: Number, default: 0 },
  explanation: { type: String },
  agentReasoning: { type: String },
  read: { type: Boolean, default: false },
  type: { type: String, enum: ['ai', 'fallback'], default: 'fallback' },
}, { timestamps: true });

matchSchema.index({ project: 1, user: 1 }, { unique: true });

const Match = mongoose.model('Match', matchSchema);

module.exports = Match;