// routes/messageRoutes.js
const express = require('express');
const { authenticate } = require('../utils/jwt');
const MessageController = require('../controllers/messageController');

const router = express.Router();
const messageController = new MessageController();


router.get('/unread-count', authenticate, messageController.getUnreadMessageCount.bind(messageController));


router.get('/conversations', authenticate, messageController.getConversations.bind(messageController));


router.post('/', authenticate, messageController.sendMessage.bind(messageController));


router.put('/read', authenticate, messageController.markAsRead.bind(messageController));

router.put('/conversation/:userId/read', authenticate, messageController.markConversationAsRead.bind(messageController));


router.get('/:userId', authenticate, messageController.getMessages.bind(messageController));

module.exports = router;