// routes/matches.js
const express = require('express');
const { authenticate } = require('../utils/jwt');
const Project = require('../models/Project');
const { matchUsersToProject } = require('../utils/matching');

const router = express.Router();

router.get('/:projectId', authenticate, async (req, res) => {
  try {
    const project = await Project.findById(req.params.projectId)
      .populate('creator', 'fullName')
      .lean();

    if (!project) {
      return res.status(404).json({ success: false, message: 'Project not found' });
    }

    const matches = await matchUsersToProject(project, 5);
    res.json({ success: true, data: { matches } });
  } catch (err) {
    console.error('GET /api/matches/:id error:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

module.exports = router;