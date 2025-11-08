require('dotenv').config();  // Load .env
const mongoose = require('mongoose');
const { matchUsersToProject } = require('./utils/matching');  // Path from /server root

// Connect to DB (replace with your actual DB URI if not in .env)
mongoose.connect(process.env.MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(async () => {
    console.log('DB connected for test');

    // Mock/test project (or fetch a real one from DB: await Project.findById('yourProjectId'))
    const testProject = {
      _id: 'testId',  // Fake ID
      neededRoles: [
        {
          role: 'Designer',
          requiredSkills: ['UI/UX', 'Figma'],
          description: 'Passionate about EdTech',
          preferredLocation: 'Remote',
          commitment: 'Part-time',
          equity: 'Negotiable'
        }
      ],
      problemStatement: 'Solving education access issues',
      solution: 'App for online learning'
    };

    // Test AI Mode
    process.env.USE_AI_MATCHING = 'true';  // Toggle here
    console.log('=== Testing AI Mode ===');
    const aiMatches = await matchUsersToProject(testProject, 3);  // Top 3
    console.log('AI Matches:', aiMatches);

    // Test Fallback Mode
    process.env.USE_AI_MATCHING = 'false';
    console.log('=== Testing Fallback Mode ===');
    const fallbackMatches = await matchUsersToProject(testProject, 3);
    console.log('Fallback Matches:', fallbackMatches);

    // Disconnect DB
    await mongoose.disconnect();
    console.log('Test complete');
  })
  .catch(err => console.error('DB connection error:', err));