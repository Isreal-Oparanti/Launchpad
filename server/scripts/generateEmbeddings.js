// scripts/generateEmbeddings.js
require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');
const { OpenAIEmbeddings } = require('@langchain/openai');

console.log('Starting embedding generation for all users...');

// Initialize OpenAI embeddings
const embeddings = new OpenAIEmbeddings({
  modelName: 'text-embedding-3-small',
  openAIApiKey: process.env.OPENAI_API_KEY,
});

async function generateUserEmbedding(user) {
  // Build rich text from all relevant fields
  const parts = [
    user.bio || '',
    user.skills?.length ? `Skills: ${user.skills.join(', ')}` : '',
    user.interests?.length ? `Interests: ${user.interests.join(', ')}` : '',
    user.expertise?.length ? `Expertise: ${user.expertise.join(', ')}` : '',
    user.currentPosition ? `Position: ${user.currentPosition}` : '',
  ];

  if (user.collaborationProfile) {
    const cp = user.collaborationProfile;
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

  if (!text) {
    console.log(`Skipping ${user.fullName || user.email} — no content`);
    return null;
  }

  try {
    const [embedding] = await embeddings.embedDocuments([text]);
    return embedding;
  } catch (err) {
    console.error(`Embedding failed for ${user.fullName}:`, err.message);
    return null;
  }
}

async function run() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Get ALL users who are open to collaboration OR have any profile data
    const users = await User.find({
      $or: [
        { openToCollaboration: true },
        { bio: { $exists: true, $ne: '' } },
        { skills: { $exists: true, $ne: [] } },
        { 'collaborationProfile.lookingFor': { $exists: true, $ne: [] } }
      ]
    }).select('fullName email bio skills collaborationProfile profileEmbedding');

    console.log(`Found ${users.length} users to process`);

    let updated = 0;
    for (let i = 0; i < users.length; i++) {
      const user = users[i];
      const embedding = await generateUserEmbedding(user);

      if (embedding && (!user.profileEmbedding || user.profileEmbedding.length === 0)) {
        user.profileEmbedding = embedding;
        await user.save();
        updated++;
        console.log(`Updated [${i + 1}/${users.length}]: ${user.fullName || user.email}`);
      } else if (user.profileEmbedding?.length > 0) {
        console.log(`Skipped [${i + 1}/${users.length}]: ${user.fullName || user.email} (already has embedding)`);
      } else {
        console.log(`Skipped [${i + 1}/${users.length}]: ${user.fullName || user.email} (no content)`);
      }
    }

    console.log(`\nDONE! Updated ${updated} users with embeddings.`);
  } catch (err) {
    console.error('Migration failed:', err);
  } finally {
    await mongoose.connection.close();
    console.log('DB connection closed.');
  }
}

run();