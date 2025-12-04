'use client';

import { useState, useEffect, useCallback } from 'react';
import { useUser } from '@/context/AuthContext';
import notificationService from '@/utils/notification';

export function useNotificationCount() {
  const { user } = useUser();
  const [notificationCount, setNotificationCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchNotificationCount = useCallback(async () => {
    if (!user) return;

    try {
      setLoading(true);
      setError(null);
      
      // First try the specific unread-count endpoint
      try {
        const response = await fetch(`${notificationService.baseURL}/notifications/unread-count`, {
          method: 'GET',
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json',
          },
        });

        if (response.ok) {
          const data = await response.json();
          if (data.success) {
            setNotificationCount(data.data.unreadCount || 0);
            return;
          }
        }
      } catch (apiError) {
        console.log('Falling back to main notifications endpoint');
      }

      // Fallback: Use main notifications endpoint
      const data = await notificationService.getNotifications();
      if (data.success && data.data.notifications) {
        const unreadCount = data.data.notifications.filter(n => !n.read).length;
        setNotificationCount(unreadCount);
      }
    } catch (error) {
      console.error('Error fetching notification count:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (!user) return;

    fetchNotificationCount();

    // Poll for updates every 30 seconds
    const interval = setInterval(fetchNotificationCount, 30000);

    return () => clearInterval(interval);
  }, [user, fetchNotificationCount]);

  // Only show badge if count > 0
  const showBadge = notificationCount > 0;

  return {
    notificationCount,
    showBadge,
    loading,
    error,
    refetchNotificationCount: fetchNotificationCount,
    updateNotificationCount: setNotificationCount
  };
}