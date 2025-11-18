
const Message = require('../models/Message');
const User = require('../models/User');
const mongoose = require('mongoose');

class MessageController {

async getConversations(req, res) {
  try {
    const userId = req.user.id;

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
            senderId: '$lastMessage.sender'
          },
          unreadCount: 1,
          totalMessages: 1
        }
      },
      {
        $sort: { 'lastMessage.timestamp': -1 }
      }
    ]);

    console.log(`Found ${conversations.length} conversations for user ${userId}`);

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

  async getMessages(req, res) {
    try {
      const { userId } = req.params;
      const currentUserId = req.user.id;

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
      .populate('sender', 'fullName profilePicture initials')
      .sort({ createdAt: 1 })
      .limit(100); // Limit to last 100 messages

      // Mark messages as read
      await Message.updateMany(
        {
          sender: userId,
          receiver: currentUserId,
          read: false
        },
        {
          $set: { read: true }
        }
      );

      res.status(200).json({
        success: true,
        messages: messages.map(msg => ({
          id: msg._id,
          senderId: msg.sender._id,
          senderName: msg.sender.fullName,
          senderInitials: msg.sender.initials,
          senderProfilePicture: msg.sender.profilePicture,
          text: msg.text,
          timestamp: msg.createdAt,
          read: msg.read
        }))
      });

    } catch (error) {
      console.error('Get messages error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch messages'
      });
    }
  }

  async sendMessage(req, res) {
    try {
      const { receiverId, text } = req.body;
      const senderId = req.user.id;

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

      // Populate sender info
      await message.populate('sender', 'fullName profilePicture initials');

      res.status(201).json({
        success: true,
        message: {
          id: message._id,
          senderId: message.sender._id,
          senderName: message.sender.fullName,
          senderInitials: message.sender.initials,
          senderProfilePicture: message.sender.profilePicture,
          text: message.text,
          timestamp: message.createdAt,
          read: message.read
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

  async markAsRead(req, res) {
    try {
      const { messageIds } = req.body;
      const userId = req.user.id;

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
          $set: { read: true }
        }
      );

      res.status(200).json({
        success: true,
        message: 'Messages marked as read'
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