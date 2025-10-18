const express = require('express');
const ProjectController = require('../controllers/projectController');
const { authenticate, optionalAuth } = require('../utils/jwt');

const router = express.Router();
const projectController = new ProjectController();

// Project routes
router.get('/', optionalAuth, projectController.getAllProjects.bind(projectController));
router.get('/featured', projectController.getFeaturedProjects.bind(projectController));
router.get('/trending', projectController.getTrendingProjects.bind(projectController));
router.get('/:id', optionalAuth, projectController.getProjectById.bind(projectController));
router.post('/', authenticate, projectController.createProject.bind(projectController));
router.put('/:id', authenticate, projectController.updateProject.bind(projectController));
router.delete('/:id', authenticate, projectController.deleteProject.bind(projectController));

// Engagement routes
router.post('/:id/upvote', authenticate, projectController.toggleUpvote.bind(projectController));
router.post('/:id/interest', authenticate, projectController.expressInterest.bind(projectController));

// Comment routes
router.get('/:id/comments', projectController.getComments.bind(projectController));
router.post('/:id/comments', authenticate, projectController.addComment.bind(projectController));
router.delete('/:projectId/comments/:commentId', authenticate, projectController.deleteComment.bind(projectController));
router.post('/:projectId/comments/:commentId/like', authenticate, projectController.toggleCommentLike.bind(projectController));

module.exports = router;