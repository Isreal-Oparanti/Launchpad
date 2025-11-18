const Project = require('../models/Project');

class ProjectController {
 async createProject(req, res) {
    try {
      console.log('===== CREATE PROJECT DEBUG =====');
      console.log('Headers:', req.headers);
      console.log('req.body:', req.body);
      console.log('req.files:', req.files);
      console.log('req.user:', req.user);
      console.log('================================');

      if (!req.body || Object.keys(req.body).length === 0) {
        return res.status(400).json({
          success: false,
          message: 'No form data received. Ensure the request is multipart/form-data.',
        });
      }

      const requiredFields = ['title', 'tagline', 'problemStatement', 'solution', 'targetMarket', 'category', 'stage'];
      for (const field of requiredFields) {
        if (!req.body[field] || req.body[field].trim() === '') {
          return res.status(400).json({
            success: false,
            message: `Missing or empty required field: ${field}`,
          });
        }
      }

      let tags = [];
      if (req.body.tags) {
        try {
          tags = typeof req.body.tags === 'string' ? JSON.parse(req.body.tags) : req.body.tags;
        } catch (e) {
          console.error('Failed to parse tags:', e);
          tags = [];
        }
      }

      let neededRoles = [];
      if (req.body.neededRoles) {
        try {
          neededRoles = typeof req.body.neededRoles === 'string' ? JSON.parse(req.body.neededRoles) : req.body.neededRoles;
        } catch (e) {
          console.error('Failed to parse neededRoles:', e);
          neededRoles = [];
        }
      }

      const projectData = {
        title: req.body.title,
        tagline: req.body.tagline,
        problemStatement: req.body.problemStatement,
        solution: req.body.solution,
        targetMarket: req.body.targetMarket,
        category: req.body.category,
        stage: req.body.stage,
        tags,
        demoUrl: req.body.demoUrl || '',
        neededRoles: neededRoles.length > 0 ? neededRoles : undefined,
        creator: req.user._id,
        isPublished: req.body.isPublished === 'true',
        logo: req.files?.logo ? { data: req.files.logo[0].buffer, contentType: req.files.logo[0].mimetype } : null,
        coverImage: req.files?.coverImage ? { data: req.files.coverImage[0].buffer, contentType: req.files.coverImage[0].mimetype } : null,
        upvoteCount: 0,
        viewCount: 0,
        commentCount: 0,
        interestCount: 0,
      };

      console.log('Project data before saving:', projectData);

      const newProject = new Project(projectData);

      await newProject.save();

      console.log('✅ Project created successfully:', newProject._id);

      res.status(201).json({
        success: true,
        data: newProject,
        message: 'Project created successfully',
      });
    } catch (error) {
      console.error('❌ Create project error:', error);
      res.status(400).json({
        success: false,
        message: error.message || 'Failed to create project',
        errors: error.errors,
      });
    }
  }

   async getAllProjects(req, res) {
    try {
      const { page = 1, limit = 12, category, stage, search, sort = 'recent' } = req.query;
      const skip = (page - 1) * limit;
      const query = { isPublished: true };

      // Build query efficiently
      if (category && category !== 'all') query.category = category;
      if (stage && stage !== 'all') query.stage = stage;
      
      // Use regex for search instead of $text for better performance
      if (search && search.trim()) {
        query.$or = [
          { title: { $regex: search, $options: 'i' } },
          { tagline: { $regex: search, $options: 'i' } },
          { tags: { $in: [new RegExp(search, 'i')] } }
        ];
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

      // Select only necessary fields for performance
      const selectFields = 'title tagline problemStatement stage category tags coverImage logo upvoteCount viewCount commentCount interestCount neededRoles createdAt lastActivityAt creator';

      const [projects, total] = await Promise.all([
        Project.find(query)
          .select(selectFields)
          .populate('creator', 'fullName profilePicture title initials') // Added title field
          .sort(sortQuery)
          .skip(skip)
          .limit(parseInt(limit))
          .lean(),
        Project.countDocuments(query),
      ]);

      // Process projects efficiently
      const userId = req.user?._id?.toString();
      const projectsWithUserData = projects.map((project) => ({
        ...project,
        hasUpvoted: userId ? project.upvotes?.some(id => id.toString() === userId) : false,
        hasExpressedInterest: userId
          ? project.interestedInvestors?.some(i => i.user?.toString() === userId)
          : false,
        upvotes: undefined,
        interestedInvestors: undefined,
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
            hasMore: skip + projects.length < total,
          },
        },
      });
    } catch (error) {
      console.error('Get projects error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch projects',
      });
    }
  }

  async getFeaturedProjects(req, res) {
    try {
      const projects = await Project.find({ isPublished: true })
        .sort({ upvoteCount: -1, viewCount: -1 })
        .limit(6)
        .populate('creator', 'fullName profilePicture school major initials')
        .lean();

      res.json({
        success: true,
        data: projects,
      });
    } catch (error) {
      console.error('Get featured projects error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch featured projects',
      });
    }
  }

  async getTrendingProjects(req, res) {
    try {
      const projects = await Project.find({ isPublished: true })
        .sort({ lastActivityAt: -1, upvoteCount: -1 })
        .limit(10)
        .populate('creator', 'fullName profilePicture school major initials')
        .lean();

      res.json({
        success: true,
        data: projects,
      });
    } catch (error) {
      console.error('Get trending projects error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch trending projects',
      });
    }
  }

   async getProjectById(req, res) {
    try {
      const project = await Project.findById(req.params.id)
        .populate('creator', 'fullName profilePicture title email initials') // Added title field
        .populate('teamMembers.user', 'fullName profilePicture title initials');

      if (!project) {
        return res.status(404).json({
          success: false,
          message: 'Project not found',
        });
      }

      // Update view count asynchronously without blocking the response
      project.viewCount += 1;
      project.save().catch(err => console.error('Error updating view count:', err));

      const projectData = project.toObject();
      const userId = req.user?._id?.toString();
      
      projectData.hasUpvoted = userId ? project.upvotes.some(id => id.toString() === userId) : false;
      projectData.hasExpressedInterest = userId
        ? project.interestedInvestors.some(i => i.user.toString() === userId)
        : false;
      
      delete projectData.upvotes;
      delete projectData.interestedInvestors;

      res.json({
        success: true,
        data: projectData,
      });
    } catch (error) {
      console.error('Get project error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch project',
      });
    }
  }

 async updateProject(req, res) {
    try {
      const existingProject = await Project.findById(req.params.id);

      if (!existingProject) {
        return res.status(404).json({
          success: false,
          message: 'Project not found',
        });
      }

      if (existingProject.creator.toString() !== req.user._id.toString()) {
        return res.status(403).json({
          success: false,
          message: 'You can only edit your own projects',
        });
      }

      // Parse tags if provided
      if (req.body.tags) {
        try {
          existingProject.tags = typeof req.body.tags === 'string' ? JSON.parse(req.body.tags) : req.body.tags;
        } catch (e) {
          console.error('Failed to parse tags:', e);
        }
      }

      // Parse neededRoles if provided
      if (req.body.neededRoles) {
        try {
          existingProject.neededRoles = typeof req.body.neededRoles === 'string' ? JSON.parse(req.body.neededRoles) : req.body.neededRoles;
        } catch (e) {
          console.error('Failed to parse neededRoles:', e);
        }
      }

      // Update other fields
      const updatableFields = [
        'title', 'tagline', 'problemStatement', 'solution', 'targetMarket', 
        'category', 'stage', 'demoUrl', 'isPublished'
      ];
      updatableFields.forEach(field => {
        if (req.body[field] !== undefined) {
          existingProject[field] = req.body[field];
        }
      });

      // Update images if provided
      if (req.files?.logo) {
        existingProject.logo = { data: req.files.logo[0].buffer, contentType: req.files.logo[0].mimetype };
      }
      if (req.files?.coverImage) {
        existingProject.coverImage = { data: req.files.coverImage[0].buffer, contentType: req.files.coverImage[0].mimetype };
      }

      existingProject.updatedAt = new Date();
      existingProject.lastActivityAt = new Date();
      await existingProject.save();
      await existingProject.populate('creator', 'fullName profilePicture school major initials');

      res.json({
        success: true,
        message: 'Project updated successfully',
        data: existingProject,
      });
    } catch (error) {
      console.error('Update project error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to update project',
      });
    }
  }

  
  async deleteProject(req, res) {
    try {
      const project = await Project.findById(req.params.id);

      if (!project) {
        return res.status(404).json({
          success: false,
          message: 'Project not found',
        });
      }

      if (project.creator.toString() !== req.user._id.toString()) {
        return res.status(403).json({
          success: false,
          message: 'You can only delete your own projects',
        });
      }

      await project.deleteOne();

      res.json({
        success: true,
        message: 'Project deleted successfully',
      });
    } catch (error) {
      console.error('Delete project error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to delete project',
      });
    }
  }

  async toggleUpvote(req, res) {
    try {
      const project = await Project.findById(req.params.id);

      if (!project) {
        return res.status(404).json({
          success: false,
          message: 'Project not found',
        });
      }

      const index = project.upvotes.indexOf(req.user._id);
      if (index === -1) {
        project.upvotes.push(req.user._id);
      } else {
        project.upvotes.splice(index, 1);
      }
      project.upvoteCount = project.upvotes.length;
      project.lastActivityAt = new Date();
      await project.save();

      res.json({
        success: true,
        data: {
          upvoted: index === -1,
          upvoteCount: project.upvoteCount,
        },
      });
    } catch (error) {
      console.error('Upvote error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to process upvote',
      });
    }
  }

  async expressInterest(req, res) {
    try {
      const { message } = req.body;
      const project = await Project.findById(req.params.id);

      if (!project) {
        return res.status(404).json({
          success: false,
          message: 'Project not found',
        });
      }

      const alreadyInterested = project.interestedInvestors.some(
        (i) => i.user.toString() === req.user._id.toString()
      );
      if (alreadyInterested) {
        return res.status(400).json({
          success: false,
          message: 'You have already expressed interest in this project',
        });
      }

      project.interestedInvestors.push({
        user: req.user._id,
        message,
        createdAt: new Date(),
      });
      project.interestCount = project.interestedInvestors.length;
      project.lastActivityAt = new Date();
      await project.save();

      res.json({
        success: true,
        message: 'Interest expressed successfully',
        data: {
          interestCount: project.interestCount,
        },
      });
    } catch (error) {
      console.error('Express interest error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to express interest',
      });
    }
  }

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
        Comment.countDocuments({ project: req.params.id, isDeleted: false }),
      ]);

      const processedComments = comments.map((comment) => {
        if (comment.isAnonymous) {
          return {
            ...comment,
            author: {
              fullName: 'Anonymous',
              initials: '?',
              profilePicture: null,
            },
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
            hasMore: skip + comments.length < total,
          },
        },
      });
    } catch (error) {
      console.error('Get comments error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch comments',
      });
    }
  }

  async addComment(req, res) {
    try {
      const { content, isAnonymous = false } = req.body;

      if (!content || content.trim().length === 0) {
        return res.status(400).json({
          success: false,
          message: 'Comment content is required',
        });
      }

      const project = await Project.findById(req.params.id);
      if (!project) {
        return res.status(404).json({
          success: false,
          message: 'Project not found',
        });
      }

      const comment = new Comment({
        project: req.params.id,
        author: req.user._id,
        content,
        isAnonymous,
      });

      await comment.save();
      await comment.populate('author', 'fullName profilePicture school initials');

      project.commentCount += 1;
      project.lastActivityAt = new Date();
      await project.save();

      const commentData = comment.toObject();
      if (commentData.isAnonymous) {
        commentData.author = {
          fullName: 'Anonymous',
          initials: '?',
          profilePicture: null,
        };
      }

      res.status(201).json({
        success: true,
        message: 'Comment added successfully',
        data: commentData,
      });
    } catch (error) {
      console.error('Add comment error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to add comment',
      });
    }
  }

  async deleteComment(req, res) {
    try {
      const comment = await Comment.findById(req.params.commentId);

      if (!comment) {
        return res.status(404).json({
          success: false,
          message: 'Comment not found',
        });
      }

      if (comment.author.toString() !== req.user._id.toString()) {
        return res.status(403).json({
          success: false,
          message: 'You can only delete your own comments',
        });
      }

      comment.isDeleted = true;
      await comment.save();

      const project = await Project.findById(req.params.projectId);
      if (project) {
        project.commentCount = Math.max(0, project.commentCount - 1);
        await project.save();
      }

      res.json({
        success: true,
        message: 'Comment deleted successfully',
      });
    } catch (error) {
      console.error('Delete comment error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to delete comment',
      });
    }
  }

async getMyProjects(req, res) {
  try {
    const projects = await Project.find({ 
      creator: req.user._id 
    })
      .select('title tagline problemStatement stage category tags coverImage logo upvoteCount viewCount commentCount interestCount createdAt updatedAt')
      .sort({ createdAt: -1 })
      .lean();

    // Transform projects to match frontend expectations
    const projectsWithCounts = projects.map(project => ({
      id: project._id,
      title: project.title,
      tagline: project.tagline,
      description: project.problemStatement,
      stage: project.stage,
      category: project.category,
      tags: project.tags,
      coverImage: project.coverImage,
      logo: project.logo,
      upvotes: project.upvoteCount || 0,
      comments: project.commentCount || 0,
      views: project.viewCount || 0,
      createdAt: project.createdAt,
      updatedAt: project.updatedAt
    }));

    res.json({
      success: true,
      data: {
        projects: projectsWithCounts
      }
    });
  } catch (error) {
    console.error('Get my projects error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch your projects'
    });
  }
}

  async toggleCommentLike(req, res) {
    try {
      const comment = await Comment.findById(req.params.commentId);

      if (!comment) {
        return res.status(404).json({
          success: false,
          message: 'Comment not found',
        });
      }

      const index = comment.likes.indexOf(req.user._id);
      if (index === -1) {
        comment.likes.push(req.user._id);
      } else {
        comment.likes.splice(index, 1);
      }
      comment.likeCount = comment.likes.length;
      await comment.save();

      res.json({
        success: true,
        data: {
          liked: index === -1,
          likeCount: comment.likeCount,
        },
      });
    } catch (error) {
      console.error('Like comment error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to process like',
      });
    }
  }
}

module.exports = ProjectController;