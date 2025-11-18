// routes/projects.js (Your original router, no changes needed as Multer is already configured here)

const express = require('express');
const multer = require('multer');
const ProjectController = require('../controllers/projectController');
const { authenticate, optionalAuth } = require('../utils/jwt');

const router = express.Router();
const projectController = new ProjectController();

const upload = multer({ 
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 }
});


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

router.put('/:id', authenticate, projectController.updateProject.bind(projectController));
router.delete('/:id', authenticate, projectController.deleteProject.bind(projectController));

router.post('/:id/upvote', authenticate, projectController.toggleUpvote.bind(projectController));
router.post('/:id/interest', authenticate, projectController.expressInterest.bind(projectController));

router.get('/:id/comments', projectController.getComments.bind(projectController));
router.post('/:id/comments', authenticate, projectController.addComment.bind(projectController));
router.delete('/:projectId/comments/:commentId', authenticate, projectController.deleteComment.bind(projectController));
router.post('/:projectId/comments/:commentId/like', authenticate, projectController.toggleCommentLike.bind(projectController));

module.exports = router;