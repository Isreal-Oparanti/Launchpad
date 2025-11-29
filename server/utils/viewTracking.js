const crypto = require('crypto');
const ProjectView = require('../models/ProjectView');
const Project = require('../models/Project');

/**
 * Generate a unique session hash for anonymous users
 * Combines IP address and user agent to create consistent identifier
 */
function generateSessionHash(ipAddress, userAgent) {
  const identifier = `${ipAddress}-${userAgent}`;
  return crypto.createHash('sha256').update(identifier).digest('hex');
}

/**
 * Get client IP address (handles proxies and load balancers)
 */
function getClientIP(req) {
  return req.headers['x-forwarded-for']?.split(',')[0]?.trim() ||
         req.headers['x-real-ip'] ||
         req.connection?.remoteAddress ||
         req.socket?.remoteAddress ||
         'unknown';
}

/**
 * Check if this is a valid view (not a bot, not a duplicate)
 */
async function isValidView(projectId, userId, sessionHash) {
  // Time window: 1 view per user/session per 24 hours
  const viewWindow = 24 * 60 * 60 * 1000; // 24 hours in milliseconds
  const cutoffTime = new Date(Date.now() - viewWindow);

  const query = {
    project: projectId,
    viewedAt: { $gte: cutoffTime }
  };

  // Check by userId if logged in, otherwise by sessionHash
  if (userId) {
    query.user = userId;
  } else {
    query.sessionHash = sessionHash;
  }

  const recentView = await ProjectView.findOne(query).select('_id').lean();
  return !recentView; // Valid if no recent view found
}

/**
 * Record a project view (called asynchronously, doesn't block response)
 */
async function recordProjectView(projectId, req) {
  try {
    const userId = req.user?._id || null;
    const ipAddress = getClientIP(req);
    const userAgent = req.headers['user-agent'] || 'unknown';
    const sessionHash = generateSessionHash(ipAddress, userAgent);

    // Check if this is a valid view (not duplicate within 24h)
    const isValid = await isValidView(projectId, userId, sessionHash);
    
    if (!isValid) {
      console.log(`⏭️ View already counted for project ${projectId} (user: ${userId || 'anonymous'})`);
      return false;
    }

    // Record the view
    await ProjectView.create({
      project: projectId,
      user: userId,
      ipAddress: ipAddress,
      userAgent: userAgent,
      sessionHash: sessionHash,
      viewedAt: new Date()
    });

    // Increment project view count atomically
    await Project.findByIdAndUpdate(
      projectId,
      { $inc: { viewCount: 1 } },
      { new: false }
    );

    console.log(`✅ View recorded for project ${projectId} (user: ${userId || 'anonymous'})`);
    return true;
  } catch (error) {
    console.error('❌ Error recording view:', error);
    return false;
  }
}

/**
 * Get unique view count for a project
 */
async function getUniqueViewCount(projectId) {
  try {
    const count = await ProjectView.countDocuments({ project: projectId });
    return count;
  } catch (error) {
    console.error('Error getting view count:', error);
    return 0;
  }
}

/**
 * Get view analytics for a project
 */
async function getViewAnalytics(projectId, days = 30) {
  try {
    const cutoffDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

    const [totalViews, uniqueUsers, recentViews, viewsByDay] = await Promise.all([
      // Total unique views
      ProjectView.countDocuments({ project: projectId }),
      
      // Unique registered users
      ProjectView.countDocuments({ project: projectId, user: { $ne: null } }),
      
      // Recent views (last N days)
      ProjectView.countDocuments({ 
        project: projectId, 
        viewedAt: { $gte: cutoffDate } 
      }),
      
      // Views grouped by day
      ProjectView.aggregate([
        { 
          $match: { 
            project: new mongoose.Types.ObjectId(projectId),
            viewedAt: { $gte: cutoffDate }
          } 
        },
        {
          $group: {
            _id: { 
              $dateToString: { format: "%Y-%m-%d", date: "$viewedAt" } 
            },
            count: { $sum: 1 }
          }
        },
        { $sort: { _id: 1 } }
      ])
    ]);

    return {
      totalViews,
      uniqueUsers,
      anonymousUsers: totalViews - uniqueUsers,
      recentViews,
      viewsByDay: viewsByDay.map(v => ({
        date: v._id,
        count: v.count
      }))
    };
  } catch (error) {
    console.error('Error getting view analytics:', error);
    return null;
  }
}

module.exports = {
  recordProjectView,
  getUniqueViewCount,
  getViewAnalytics,
  generateSessionHash,
  getClientIP
};