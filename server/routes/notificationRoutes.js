const express = require('express');
const { authenticate } = require('../utils/jwt');
const router = express.Router();
const NotificationController = require('../controllers/notificationController');
const notificationController = new NotificationController();

router.get('/', authenticate, notificationController.getNotifications.bind(notificationController));
router.get('/unread-count', authenticate, notificationController.getUnreadCount.bind(notificationController));
router.post('/:id/mark-read', authenticate, notificationController.markAsRead.bind(notificationController));
router.post('/mark-all-read', authenticate, notificationController.markAllAsRead.bind(notificationController));
router.delete('/:id', authenticate, notificationController.deleteNotification.bind(notificationController));

module.exports = router;