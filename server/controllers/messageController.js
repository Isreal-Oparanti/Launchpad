// controllers/messageController.js
const Message = require('../models/Message');
const User = require('../models/User');
const mongoose = require('mongoose');

class MessageController {
  // Get total unread message count for current user
  async getUnreadMessageCount(req, res) {
    try {
      const userId = req.user._id;
      
      const unreadCount = await Message.countDocuments({
        receiver: userId,
        read: false
      });

      res.status(200).json({
        success: true,
        data: {
          unreadCount
        }
      });
    } catch (error) {
      console.error('Get unread message count error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get unread message count'
      });
    }
  }

  // Mark all messages in a conversation as read
  async markConversationAsRead(req, res) {
    try {
      const { userId } = req.params;
      const currentUserId = req.user._id;

      await Message.updateMany(
        {
          sender: userId,
          receiver: currentUserId,
          read: false
        },
        {
          $set: { read: true, readAt: new Date() }
        }
      );

      res.status(200).json({
        success: true,
        message: 'Conversation marked as read'
      });
    } catch (error) {
      console.error('Mark conversation as read error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to mark conversation as read'
      });
    }
  }

  // Get conversations (updated to use req.user._id instead of req.user.id)
  async getConversations(req, res) {
    try {
      const userId = req.user._id;

      // Get all unique conversations for the user
      const conversations = await Message.aggregate([
        {
          $match: {
            $or: [
              { sender: new mongoose.Types.ObjectId(userId) },
              { receiver: new mongoose.Types.ObjectId(userId) }
            ]
          }
        },
        {
          $sort: { createdAt: -1 }
        },
        {
          $group: {
            _id: {
              $cond: [
                { $eq: ['$sender', new mongoose.Types.ObjectId(userId)] },
                '$receiver',
                '$sender'
              ]
            },
            lastMessage: { $first: '$$ROOT' },
            unreadCount: {
              $sum: {
                $cond: [
                  { 
                    $and: [
                      { $eq: ['$receiver', new mongoose.Types.ObjectId(userId)] },
                      { $eq: ['$read', false] }
                    ]
                  },
                  1,
                  0
                ]
              }
            },
            totalMessages: { $sum: 1 }
          }
        },
        {
          $lookup: {
            from: 'users',
            localField: '_id',
            foreignField: '_id',
            as: 'user'
          }
        },
        {
          $unwind: '$user'
        },
        {
          $project: {
            _id: 0,
            userId: '$_id',
            userName: '$user.fullName',
            userTitle: '$user.title',
            userProfilePicture: '$user.profilePicture',
            userInitials: '$user.initials',
            lastMessage: {
              id: '$lastMessage._id',
              text: '$lastMessage.text',
              timestamp: '$lastMessage.createdAt',
              senderId: '$lastMessage.sender',
              read: '$lastMessage.read'
            },
            unreadCount: 1,
            totalMessages: 1
          }
        },
        {
          $sort: { 'lastMessage.timestamp': -1 }
        }
      ]);

      res.status(200).json({
        success: true,
        conversations
      });

    } catch (error) {
      console.error('Get conversations error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch conversations'
      });
    }
  }

  // Get messages with a specific user
  async getMessages(req, res) {
    try {
      const { userId } = req.params;
      const currentUserId = req.user._id;

      if (!userId) {
        return res.status(400).json({
          success: false,
          message: 'User ID is required'
        });
      }

      // Verify the other user exists
      const otherUser = await User.findById(userId);
      if (!otherUser) {
        return res.status(404).json({
          success: false,
          message: 'User not found'
        });
      }

      // Get messages between the two users
      const messages = await Message.find({
        $or: [
          { sender: currentUserId, receiver: userId },
          { sender: userId, receiver: currentUserId }
        ]
      })
      .populate('sender', 'fullName profilePicture initials title')
      .populate('receiver', 'fullName profilePicture initials title')
      .sort({ createdAt: 1 })
      .limit(100);

      // Mark messages as read
      const unreadMessages = messages.filter(msg => 
        msg.receiver._id.toString() === currentUserId.toString() && !msg.read
      );

      if (unreadMessages.length > 0) {
        await Message.updateMany(
          {
            _id: { $in: unreadMessages.map(msg => msg._id) }
          },
          {
            $set: { read: true, readAt: new Date() }
          }
        );
      }

      res.status(200).json({
        success: true,
        data: {
          messages: messages.map(msg => ({
            id: msg._id,
            senderId: msg.sender._id,
            senderName: msg.sender.fullName,
            senderInitials: msg.sender.initials,
            senderProfilePicture: msg.sender.profilePicture,
            receiverId: msg.receiver._id,
            text: msg.text,
            timestamp: msg.createdAt,
            read: msg.read,
            readAt: msg.readAt
          })),
          otherUser: {
            id: otherUser._id,
            name: otherUser.fullName,
            title: otherUser.title,
            profilePicture: otherUser.profilePicture,
            initials: otherUser.initials
          }
        }
      });

    } catch (error) {
      console.error('Get messages error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch messages'
      });
    }
  }

  // Send a message
  async sendMessage(req, res) {
    try {
      const { receiverId, text } = req.body;
      const senderId = req.user._id;

      if (!receiverId || !text) {
        return res.status(400).json({
          success: false,
          message: 'Receiver ID and text are required'
        });
      }

      if (text.trim().length === 0) {
        return res.status(400).json({
          success: false,
          message: 'Message cannot be empty'
        });
      }

      // Verify receiver exists
      const receiver = await User.findById(receiverId);
      if (!receiver) {
        return res.status(404).json({
          success: false,
          message: 'Receiver not found'
        });
      }

      const message = new Message({
        sender: senderId,
        receiver: receiverId,
        text: text.trim()
      });

      await message.save();
      await message.populate('sender', 'fullName profilePicture initials title');
      await message.populate('receiver', 'fullName profilePicture initials title');

      res.status(201).json({
        success: true,
        data: {
          message: {
            id: message._id,
            senderId: message.sender._id,
            senderName: message.sender.fullName,
            senderInitials: message.sender.initials,
            senderProfilePicture: message.sender.profilePicture,
            receiverId: message.receiver._id,
            text: message.text,
            timestamp: message.createdAt,
            read: message.read
          }
        }
      });

    } catch (error) {
      console.error('Send message error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to send message'
      });
    }
  }

  // Mark specific messages as read
  async markAsRead(req, res) {
    try {
      const { messageIds } = req.body;
      const userId = req.user._id;

      if (!messageIds || !Array.isArray(messageIds)) {
        return res.status(400).json({
          success: false,
          message: 'Message IDs array is required'
        });
      }

      await Message.updateMany(
        {
          _id: { $in: messageIds },
          receiver: userId,
          read: false
        },
        {
          $set: { read: true, readAt: new Date() }
        }
      );

      // Get updated count
      const unreadCount = await Message.countDocuments({
        receiver: userId,
        read: false
      });

      res.status(200).json({
        success: true,
        data: {
          unreadCount
        }
      });

    } catch (error) {
      console.error('Mark as read error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to mark messages as read'
      });
    }
  }
}

module.exports = MessageController;