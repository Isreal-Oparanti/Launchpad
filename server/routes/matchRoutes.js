// routes/matches.js
const express = require('express');
const { authenticate } = require('../utils/jwt');
const Project = require('../models/Project');
const { getProjectMatches } = require('../utils/matching');

const router = express.Router();

// GET project matches (NO save, NO re-matching)
router.get('/:projectId', authenticate, async (req, res) => {
  try {
    console.log(`\n📊 [MATCHES ROUTE] Fetching matches for project: ${req.params.projectId}`);
    console.log(`👤 Requested by user: ${req.user.id}`);
    
    // ONLY fetch project data - DO NOT SAVE OR MODIFY
    const project = await Project.findById(req.params.projectId)
      .select('title creator neededRoles') // Only select needed fields
      .populate('creator', 'fullName')
      .lean(); // CRITICAL: .lean() prevents accidental saves

    if (!project) {
      console.log('❌ Project not found');
      return res.status(404).json({ 
        success: false, 
        message: 'Project not found' 
      });
    }

    console.log('✅ Project found:', project.title);
    console.log('📦 Fetching cached matches from database...');
    
    // FETCH FROM DATABASE (Instant, no API calls, no re-matching)
    const matches = await getProjectMatches(req.params.projectId);
    
    console.log(`✅ Retrieved ${matches.length} cached matches (no re-matching)\n`);

    res.json({ 
      success: true, 
      data: { 
        project: {
          id: project._id,
          title: project.title,
          creator: project.creator
        },
        matches,
        fromCache: true,
        timestamp: new Date().toISOString()
      } 
    });
  } catch (err) {
    console.error('❌ [MATCHES ROUTE] Error:', err);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to fetch matches' 
    });
  }
});

module.exports = router;