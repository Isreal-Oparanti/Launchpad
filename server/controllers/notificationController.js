const Notification = require('../models/Notification');

class NotificationController {
  async getNotifications(req, res) {
    try {
      const notifications = await Notification.find({ user: req.user._id })
        .sort({ createdAt: -1 })
        .limit(50);
      
      // Get unread count for badges
      const unreadCount = await Notification.countDocuments({ 
        user: req.user._id, 
        read: false 
      });

      res.json({ 
        success: true, 
        data: { 
          notifications,
          unreadCount 
        } 
      });
    } catch (error) {
      console.error('Get notifications error:', error);
      res.status(500).json({ success: false, message: 'Failed to get notifications' });
    }
  }

  async getUnreadCount(req, res) {
    try {
      const unreadCount = await Notification.countDocuments({ 
        user: req.user._id, 
        read: false 
      });

      res.json({ 
        success: true, 
        data: { unreadCount } 
      });
    } catch (error) {
      console.error('Get unread count error:', error);
      res.status(500).json({ success: false, message: 'Failed to get unread count' });
    }
  }

  async markAsRead(req, res) {
    try {
      const notification = await Notification.findOneAndUpdate(
        { _id: req.params.id, user: req.user._id },
        { read: true },
        { new: true }
      );
      if (!notification) return res.status(404).json({ success: false, message: 'Notification not found' });
      
      // Return updated unread count
      const unreadCount = await Notification.countDocuments({ 
        user: req.user._id, 
        read: false 
      });

      res.json({ 
        success: true, 
        data: { 
          notification,
          unreadCount 
        } 
      });
    } catch (error) {
      console.error('Mark read error:', error);
      res.status(500).json({ success: false, message: 'Failed to mark as read' });
    }
  }

  async markAllAsRead(req, res) {
    try {
      await Notification.updateMany({ user: req.user._id, read: false }, { read: true });
      
      res.json({ 
        success: true, 
        data: { unreadCount: 0 } 
      });
    } catch (error) {
      console.error('Mark all read error:', error);
      res.status(500).json({ success: false, message: 'Failed to mark all as read' });
    }
  }

  async deleteNotification(req, res) {
    try {
      const notification = await Notification.findOne({ _id: req.params.id, user: req.user._id });
      if (!notification) return res.status(404).json({ success: false, message: 'Notification not found' });
      
      await Notification.findByIdAndDelete(req.params.id);
      
      // Return updated unread count
      const unreadCount = await Notification.countDocuments({ 
        user: req.user._id, 
        read: false 
      });

      res.json({ 
        success: true, 
        data: { unreadCount } 
      });
    } catch (error) {
      console.error('Delete notification error:', error);
      res.status(500).json({ success: false, message: 'Failed to delete notification' });
    }
  }
}

module.exports = NotificationController;