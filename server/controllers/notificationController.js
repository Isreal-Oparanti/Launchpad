const Notification = require('../models/Notification');

class NotificationController {
  async getNotifications(req, res) {
    try {
      const notifications = await Notification.find({ user: req.user._id })
        .sort({ createdAt: -1 })
        .limit(50);
      res.json({ success: true, data: { notifications } });
    } catch (error) {
      console.error('Get notifications error:', error);
      res.status(500).json({ success: false, message: 'Failed to get notifications' });
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
      res.json({ success: true, data: notification });
    } catch (error) {
      console.error('Mark read error:', error);
      res.status(500).json({ success: false, message: 'Failed to mark as read' });
    }
  }

  async markAllAsRead(req, res) {
    try {
      await Notification.updateMany({ user: req.user._id, read: false }, { read: true });
      res.json({ success: true });
    } catch (error) {
      console.error('Mark all read error:', error);
      res.status(500).json({ success: false, message: 'Failed to mark all as read' });
    }
  }

  async deleteNotification(req, res) {
    try {
      const notification = await Notification.findOneAndDelete({ _id: req.params.id, user: req.user._id });
      if (!notification) return res.status(404).json({ success: false, message: 'Notification not found' });
      res.json({ success: true });
    } catch (error) {
      console.error('Delete notification error:', error);
      res.status(500).json({ success: false, message: 'Failed to delete notification' });
    }
  }
}

module.exports = NotificationController;