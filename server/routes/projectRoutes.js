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
      return res.status(404).json({ 
        success: false, 
        message: 'Logo not found' 
      });
    }
    
    res.set('Content-Type', project.logo.contentType);
    res.send(project.logo.data);
  } catch (error) {
    console.error('Get logo error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to get logo' 
    });
  }
});

// Serve project cover image
router.get('/:id/cover', async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project || !project.coverImage || !project.coverImage.data) {
      return res.status(404).json({ 
        success: false, 
        message: 'Cover image not found' 
      });
    }
    
    res.set('Content-Type', project.coverImage.contentType);
    res.send(project.coverImage.data);
  } catch (error) {
    console.error('Get cover error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to get cover image' 
    });
  }
});

// =============== PROJECT CRUD ROUTES ===============
router.get('/', optionalAuth, projectController.getAllProjects.bind(projectController));
router.get('/my-projects', authenticate, projectController.getMyProjects.bind(projectController));
router.get('/featured', projectController.getFeaturedProjects.bind(projectController));
router.get('/trending', projectController.getTrendingProjects.bind(projectController));
router.get('/:id', optionalAuth, projectController.getProjectById.bind(projectController));

router.post('/create', 
  authenticate, 
  upload.fields([{ name: 'logo', maxCount: 1 }, { name: 'coverImage', maxCount: 1 }]),
  projectController.createProject.bind(projectController)
);

router.put('/:id', 
  authenticate, 
  upload.fields([{ name: 'logo', maxCount: 1 }, { name: 'coverImage', maxCount: 1 }]),
  projectController.updateProject.bind(projectController)
);

router.delete('/:id', authenticate, projectController.deleteProject.bind(projectController));

// =============== INTERACTION ROUTES ===============
router.post('/:id/upvote', authenticate, projectController.toggleUpvote.bind(projectController));
router.post('/:id/interest', authenticate, projectController.expressInterest.bind(projectController));

// =============== COMMENT ROUTES ===============
router.get('/:id/comments', projectController.getComments.bind(projectController));
router.post('/:id/comments', authenticate, projectController.addComment.bind(projectController));
router.delete('/:projectId/comments/:commentId', authenticate, projectController.deleteComment.bind(projectController));
router.post('/:projectId/comments/:commentId/like', authenticate, projectController.toggleCommentLike.bind(projectController));

module.exports = router;