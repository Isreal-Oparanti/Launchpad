// routes/matches.js
const express = require('express');
const { authenticate } = require('../utils/jwt');
const Project = require('../models/Project');
const { getProjectMatches } = require('../utils/matching');

const router = express.Router();

router.get('/:projectId', authenticate, async (req, res) => {
  try {
    const project = await Project.findById(req.params.projectId)
      .populate('creator', 'fullName')
      .lean();

    if (!project) {
      return res.status(404).json({ 
        success: false, 
        message: 'Project not found' 
      });
    }

    console.log('📊 Fetching matches from database (cached)...');
    
    // FETCH FROM DATABASE (Instant, no API calls)
    const matches = await getProjectMatches(req.params.projectId);
    
    console.log(`✅ Retrieved ${matches.length} cached matches`);

    res.json({ 
      success: true, 
      data: { 
        matches,
        fromCache: true // Let frontend know this is cached
      } 
    });
  } catch (err) {
    console.error('GET /api/matches/:id error:', err);
    res.status(500).json({ 
      success: false, 
      message: 'Server error' 
    });
  }
});

module.exports = router;