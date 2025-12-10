const express = require('express');
const multer = require('multer');
const ProjectController = require('../controllers/projectController');
const { authenticate, optionalAuth } = require('../utils/jwt');
const Project = require('../models/Project');

const router = express.Router();
const projectController = new ProjectController();

const upload = multer({ 
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 }
});

// =============== IMAGE SERVING ROUTES ===============
// Serve project logo
router.get('/:id/logo', async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project || !project.logo || !project.logo.data) {
      // Return 200 with empty response instead of 404
      res.set('Content-Type', 'image/png');
      return res.status(200).send(Buffer.from(''));
    }
    
    res.set('Content-Type', project.logo.contentType || 'image/png');
    res.set('Cache-Control', 'public, max-age=31536000'); // 1 year cache
    res.send(project.logo.data);
  } catch (error) {
    console.error('Get logo error:', error);
    res.set('Content-Type', 'image/png');
    res.status(200).send(Buffer.from(''));
  }
});

// Serve project cover image
router.get('/:id/cover', async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project || !project.coverImage || !project.coverImage.data) {
      res.set('Content-Type', 'image/jpeg');
      return res.status(200).send(Buffer.from(''));
    }
    
    res.set('Content-Type', project.coverImage.contentType || 'image/jpeg');
    res.set('Cache-Control', 'public, max-age=31536000');
    res.send(project.coverImage.data);
  } catch (error) {
    console.error('Get cover error:', error);
    res.set('Content-Type', 'image/jpeg');
    res.status(200).send(Buffer.from(''));
  }
});

// =============== DEBUG ROUTES ===============
// ✅ FIXED: Added the debugImages route
router.get('/:id/debug-images', (req, res) => projectController.debugImages(req, res));

// =============== PROJECT CRUD ROUTES ===============
router.get('/', optionalAuth, (req, res) => projectController.getAllProjects(req, res));
router.get('/my-projects', authenticate, (req, res) => projectController.getMyProjects(req, res));
router.get('/featured', (req, res) => projectController.getFeaturedProjects(req, res));
router.get('/trending', (req, res) => projectController.getTrendingProjects(req, res));
router.get('/:id', optionalAuth, (req, res) => projectController.getProjectById(req, res));

router.post('/create', 
  authenticate, 
  upload.fields([{ name: 'logo', maxCount: 1 }, { name: 'coverImage', maxCount: 1 }]),
  (req, res) => projectController.createProject(req, res)
);

router.put('/:id', 
  authenticate, 
  upload.fields([{ name: 'logo', maxCount: 1 }, { name: 'coverImage', maxCount: 1 }]),
  (req, res) => projectController.updateProject(req, res)
);

router.delete('/:id', authenticate, (req, res) => projectController.deleteProject(req, res));

// =============== INTERACTION ROUTES ===============
router.post('/:id/upvote', authenticate, (req, res) => projectController.toggleUpvote(req, res));
router.post('/:id/interest', authenticate, (req, res) => projectController.expressInterest(req, res));

// =============== COMMENT ROUTES ===============
router.get('/:id/comments', (req, res) => projectController.getComments(req, res));
router.post('/:id/comments', authenticate, (req, res) => projectController.addComment(req, res));
router.delete('/:projectId/comments/:commentId', authenticate, (req, res) => projectController.deleteComment(req, res));
router.post('/:projectId/comments/:commentId/like', authenticate, (req, res) => projectController.toggleCommentLike(req, res));

module.exports = router;