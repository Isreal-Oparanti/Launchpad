const Project = require('../models/Project');
const Comment = require('../models/Comment');

class ProjectController {

  async getAllProjects(req, res) {
    try {
      const {
        page = 1,
        limit = 12,
        category,
        stage,
        search,
        sort = 'recent'
      } = req.query;

      const skip = (page - 1) * limit;
      
      const query = { isPublished: true };
      
      if (category && category !== 'all') {
        query.category = category;
      }
      
      if (stage && stage !== 'all') {
        query.stage = stage;
      }
      
      if (search) {
        query.$text = { $search: search };
      }

      let sortQuery = {};
      switch (sort) {
        case 'popular':
          sortQuery = { upvoteCount: -1, viewCount: -1 };
          break;
        case 'trending':
          sortQuery = { lastActivityAt: -1, upvoteCount: -1 };
          break;
        case 'recent':
        default:
          sortQuery = { createdAt: -1 };
      }

      const [projects, total] = await Promise.all([
        Project.find(query)
          .populate('creator', 'fullName profilePicture school major initials')
          .sort(sortQuery)
          .skip(skip)
          .limit(parseInt(limit))
          .lean(),
        Project.countDocuments(query)
      ]);

      const projectsWithUserData = projects.map(project => ({
        ...project,
        hasUpvoted: req.user ? project.upvotes.some(id => id.toString() === req.user._id.toString()) : false,
        hasExpressedInterest: req.user ? project.interestedInvestors.some(i => i.user.toString() === req.user._id.toString()) : false,
        upvotes: undefined,
        interestedInvestors: undefined
      }));

      res.json({
        success: true,
        data: {
          projects: projectsWithUserData,
          pagination: {
            page: parseInt(page),
            limit: parseInt(limit),
            total,
            pages: Math.ceil(total / limit),
            hasMore: skip + projects.length < total
          }
        }
      });
    } catch (error) {
      console.error('Get projects error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch projects'
      });
    }
  }

  // GET featured projects
  async getFeaturedProjects(req, res) {
    try {
      const projects = await Project.getFeaturedProjects(6);
      
      res.json({
        success: true,
        data: projects
      });
    } catch (error) {
      console.error('Get featured projects error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch featured projects'
      });
    }
  }

  // GET trending projects
  async getTrendingProjects(req, res) {
    try {
      const projects = await Project.getTrendingProjects(10);
      
      res.json({
        success: true,
        data: projects
      });
    } catch (error) {
      console.error('Get trending projects error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch trending projects'
      });
    }
  }

  // GET single project
  async getProjectById(req, res) {
    try {
      const project = await Project.findById(req.params.id)
        .populate('creator', 'fullName profilePicture school major email initials')
        .populate('teamMembers.user', 'fullName profilePicture school major initials');

      if (!project) {
        return res.status(404).json({
          success: false,
          message: 'Project not found'
        });
      }

      await project.incrementViews();

      const projectData = project.toObject();
      projectData.hasUpvoted = req.user ? project.hasUpvoted(req.user._id) : false;
      projectData.hasExpressedInterest = req.user ? project.hasExpressedInterest(req.user._id) : false;
      
      delete projectData.upvotes;
      delete projectData.interestedInvestors;

      res.json({
        success: true,
        data: projectData
      });
    } catch (error) {
      console.error('Get project error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch project'
      });
    }
  }

  // POST create new project
  async createProject(req, res) {
    try {
      const projectData = {
        ...req.body,
        creator: req.user._id
      };

      const project = new Project(projectData);
      await project.save();

      await project.populate('creator', 'fullName profilePicture school major initials');

      res.status(201).json({
        success: true,
        message: 'Project created successfully',
        data: project
      });
    } catch (error) {
      console.error('Create project error:', error);
      
      if (error.name === 'ValidationError') {
        return res.status(400).json({
          success: false,
          message: 'Validation error',
          errors: Object.values(error.errors).map(e => e.message)
        });
      }
      
      res.status(500).json({
        success: false,
        message: 'Failed to create project'
      });
    }
  }

  // PUT update project
  async updateProject(req, res) {
    try {
      const project = await Project.findById(req.params.id);

      if (!project) {
        return res.status(404).json({
          success: false,
          message: 'Project not found'
        });
      }

      if (project.creator.toString() !== req.user._id.toString()) {
        return res.status(403).json({
          success: false,
          message: 'You can only edit your own projects'
        });
      }

      Object.keys(req.body).forEach(key => {
        if (key !== 'creator' && key !== 'upvotes' && key !== 'interestedInvestors') {
          project[key] = req.body[key];
        }
      });

      await project.save();
      await project.populate('creator', 'fullName profilePicture school major initials');

      res.json({
        success: true,
        message: 'Project updated successfully',
        data: project
      });
    } catch (error) {
      console.error('Update project error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to update project'
      });
    }
  }

  // DELETE project
  async deleteProject(req, res) {
    try {
      const project = await Project.findById(req.params.id);

      if (!project) {
        return res.status(404).json({
          success: false,
          message: 'Project not found'
        });
      }

      if (project.creator.toString() !== req.user._id.toString()) {
        return res.status(403).json({
          success: false,
          message: 'You can only delete your own projects'
        });
      }

      await project.deleteOne();

      res.json({
        success: true,
        message: 'Project deleted successfully'
      });
    } catch (error) {
      console.error('Delete project error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to delete project'
      });
    }
  }

  // POST toggle upvote
  async toggleUpvote(req, res) {
    try {
      const project = await Project.findById(req.params.id);

      if (!project) {
        return res.status(404).json({
          success: false,
          message: 'Project not found'
        });
      }

      const upvoted = await project.toggleUpvote(req.user._id);

      res.json({
        success: true,
        data: {
          upvoted,
          upvoteCount: project.upvoteCount
        }
      });
    } catch (error) {
      console.error('Upvote error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to process upvote'
      });
    }
  }

  // POST express interest
  async expressInterest(req, res) {
    try {
      const { message } = req.body;
      const project = await Project.findById(req.params.id);

      if (!project) {
        return res.status(404).json({
          success: false,
          message: 'Project not found'
        });
      }

      await project.addInterest(req.user._id, message);

      res.json({
        success: true,
        message: 'Interest expressed successfully',
        data: {
          interestCount: project.interestCount
        }
      });
    } catch (error) {
      console.error('Express interest error:', error);
      
      if (error.message.includes('already expressed interest')) {
        return res.status(400).json({
          success: false,
          message: error.message
        });
      }
      
      res.status(500).json({
        success: false,
        message: 'Failed to express interest'
      });
    }
  }

  // GET project comments
  async getComments(req, res) {
    try {
      const { page = 1, limit = 20 } = req.query;
      const skip = (page - 1) * limit;

      const [comments, total] = await Promise.all([
        Comment.find({ project: req.params.id, isDeleted: false })
          .populate('author', 'fullName profilePicture school initials')
          .sort('-createdAt')
          .skip(skip)
          .limit(parseInt(limit))
          .lean(),
        Comment.countDocuments({ project: req.params.id, isDeleted: false })
      ]);

      const processedComments = comments.map(comment => {
        if (comment.isAnonymous) {
          return {
            ...comment,
            author: {
              fullName: 'Anonymous',
              initials: '?',
              profilePicture: null
            }
          };
        }
        return comment;
      });

      res.json({
        success: true,
        data: {
          comments: processedComments,
          pagination: {
            page: parseInt(page),
            limit: parseInt(limit),
            total,
            hasMore: skip + comments.length < total
          }
        }
      });
    } catch (error) {
      console.error('Get comments error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch comments'
      });
    }
  }

  // POST add comment
  async addComment(req, res) {
    try {
      const { content, isAnonymous = false } = req.body;

      if (!content || content.trim().length === 0) {
        return res.status(400).json({
          success: false,
          message: 'Comment content is required'
        });
      }

      const project = await Project.findById(req.params.id);
      if (!project) {
        return res.status(404).json({
          success: false,
          message: 'Project not found'
        });
      }

      const comment = new Comment({
        project: req.params.id,
        author: req.user._id,
        content,
        isAnonymous
      });

      await comment.save();
      await comment.populate('author', 'fullName profilePicture school initials');

      const commentData = comment.toObject();
      if (commentData.isAnonymous) {
        commentData.author = {
          fullName: 'Anonymous',
          initials: '?',
          profilePicture: null
        };
      }

      res.status(201).json({
        success: true,
        message: 'Comment added successfully',
        data: commentData
      });
    } catch (error) {
      console.error('Add comment error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to add comment'
      });
    }
  }

  // DELETE comment
  async deleteComment(req, res) {
    try {
      const comment = await Comment.findById(req.params.commentId);

      if (!comment) {
        return res.status(404).json({
          success: false,
          message: 'Comment not found'
        });
      }

      if (comment.author.toString() !== req.user._id.toString()) {
        return res.status(403).json({
          success: false,
          message: 'You can only delete your own comments'
        });
      }

      await comment.softDelete();

      res.json({
        success: true,
        message: 'Comment deleted successfully'
      });
    } catch (error) {
      console.error('Delete comment error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to delete comment'
      });
    }
  }

  // POST toggle comment like
  async toggleCommentLike(req, res) {
    try {
      const comment = await Comment.findById(req.params.commentId);

      if (!comment) {
        return res.status(404).json({
          success: false,
          message: 'Comment not found'
        });
      }

      const liked = await comment.toggleLike(req.user._id);

      res.json({
        success: true,
        data: {
          liked,
          likeCount: comment.likeCount
        }
      });
    } catch (error) {
      console.error('Like comment error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to process like'
      });
    }
  }
}

module.exports = ProjectController;