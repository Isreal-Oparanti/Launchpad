// utils/message.js
class MessageService {
  constructor() {
    this.baseURL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
  }

  async getConversations() {
    const response = await fetch(`${this.baseURL}/messages/conversations`, {
      credentials: 'include',
    });

    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.message || 'Failed to fetch conversations');
    }
    
    return data;
  }

  async getMessages(userId) {
    const response = await fetch(`${this.baseURL}/messages/${userId}`, {
      credentials: 'include',
    });

    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.message || 'Failed to fetch messages');
    }
    
    return data;
  }

  async sendMessage(receiverId, text) {
    const response = await fetch(`${this.baseURL}/messages`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify({ receiverId, text }),
    });

    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.message || 'Failed to send message');
    }
    
    return data;
  }

  async markAsRead(messageIds) {
    const response = await fetch(`${this.baseURL}/messages/read`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify({ messageIds }),
    });

    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.message || 'Failed to mark messages as read');
    }
    
    return data;
  }
}

export const messageService = new MessageService();