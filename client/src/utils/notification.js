class NotificationService {
  constructor() {
    this.baseURL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
  }

  async getNotifications() {
    const response = await fetch(`${this.baseURL}/notifications`, {
      credentials: 'include',
    });

    if (!response.ok) {
      throw new Error('Failed to fetch notifications');
    }

    return response.json();
  }

  async markAsRead(notificationId) {
    const response = await fetch(`${this.baseURL}/notifications/${notificationId}/mark-read`, {
      method: 'POST',
      credentials: 'include',
    });

    if (!response.ok) {
      throw new Error('Failed to mark as read');
    }

    return response.json();
  }

  async markAllAsRead() {
    const response = await fetch(`${this.baseURL}/notifications/mark-all-read`, {
      method: 'POST',
      credentials: 'include',
    });

    if (!response.ok) {
      throw new Error('Failed to mark all as read');
    }

    return response.json();
  }

  async deleteNotification(notificationId) {
    const response = await fetch(`${this.baseURL}/notifications/${notificationId}`, {
      method: 'DELETE',
      credentials: 'include',
    });

    if (!response.ok) {
      throw new Error('Failed to delete notification');
    }

    return response.json();
  }
}

export const notificationService = new NotificationService();
export default notificationService;