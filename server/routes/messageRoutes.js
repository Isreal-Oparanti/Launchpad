// routes/messageRoutes.js
const express = require('express');
const { authenticate } = require('../utils/jwt');
const MessageController = require('../controllers/MessageController');

const router = express.Router();
const messageController = new MessageController();

// Get conversations list
router.get('/conversations', authenticate, messageController.getConversations.bind(messageController));

// Get messages with a specific user
router.get('/:userId', authenticate, messageController.getMessages.bind(messageController));

// Send a message
router.post('/', authenticate, messageController.sendMessage.bind(messageController));

// Mark messages as read
router.put('/read', authenticate, messageController.markAsRead.bind(messageController));

module.exports = router;