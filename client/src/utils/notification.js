// utils/notification.js

const baseURL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

const notificationService = {
  baseURL,

  async getNotifications() {
    try {
      const response = await fetch(`${baseURL}/notifications`, {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch notifications: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Get notifications error:', error);
      throw error;
    }
  },

  async getUnreadCount() {
    try {
      const response = await fetch(`${baseURL}/notifications/unread-count`, {
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

  async markAsRead(id) {
    try {
      const response = await fetch(`${baseURL}/notifications/${id}/mark-read`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to mark as read: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Mark as read error:', error);
      throw error;
    }
  },

  async markAllAsRead() {
    try {
      const response = await fetch(`${baseURL}/notifications/mark-all-read`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to mark all as read: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Mark all as read error:', error);
      throw error;
    }
  },

  async deleteNotification(id) {
    try {
      const response = await fetch(`${baseURL}/notifications/${id}`, {
        method: 'DELETE',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to delete notification: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Delete notification error:', error);
      throw error;
    }
  },

  async createNotification(notificationData) {
    try {
      const response = await fetch(`${baseURL}/notifications/create`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(notificationData),
      });

      if (!response.ok) {
        throw new Error(`Failed to create notification: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Create notification error:', error);
      throw error;
    }
  },
};

export default notificationService;