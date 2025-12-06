const baseURL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

const messageService = {
  baseURL,

  // Get all conversations
  async getConversations() {
    try {
      const response = await fetch(`${baseURL}/messages/conversations`, {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch conversations: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Get conversations error:', error);
      throw error;
    }
  },

  // Get messages with a specific user
  async getMessages(userId) {
    try {
      const response = await fetch(`${baseURL}/messages/${userId}`, {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch messages: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Get messages error:', error);
      throw error;
    }
  },

  // Send a message
  async sendMessage(receiverId, text) {
    try {
      const response = await fetch(`${baseURL}/messages`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ receiverId, text }),
      });

      if (!response.ok) {
        throw new Error(`Failed to send message: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Send message error:', error);
      throw error;
    }
  },

  // Mark messages as read
  async markAsRead(messageIds) {
    try {
      const response = await fetch(`${baseURL}/messages/read`, {
        method: 'PUT',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ messageIds }),
      });

      if (!response.ok) {
        throw new Error(`Failed to mark messages as read: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Mark as read error:', error);
      throw error;
    }
  },

  // Get total unread message count for current user
  async getUnreadCount() {
    try {
      const response = await fetch(`${baseURL}/messages/unread-count`, {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch unread count: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Get unread count error:', error);
      throw error;
    }
  },

  // Mark all messages with a user as read
  async markConversationAsRead(userId) {
    try {
      const response = await fetch(`${baseURL}/messages/conversation/${userId}/read`, {
        method: 'PUT',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to mark conversation as read: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Mark conversation as read error:', error);
      throw error;
    }
  }
};

export default messageService;