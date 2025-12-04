'use client';

import { useState, useEffect, useCallback } from 'react';
import { useUser } from '@/context/AuthContext';
import notificationService from '@/utils/notification';

export function useNotificationCount() {
  const { user } = useUser();
  const [notificationCount, setNotificationCount] = useState(0);
  const [loading, setLoading] = useState(true);

  const fetchNotificationCount = useCallback(async () => {
    if (!user) return;

    try {
      setLoading(true);
      const response = await fetch('/api/notifications/unread-count', {
        credentials: 'include',
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setNotificationCount(data.data.unreadCount);
        }
      }
    } catch (error) {
      console.error('Error fetching notification count:', error);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchNotificationCount();

    // Poll for updates every 30 seconds
    const interval = setInterval(fetchNotificationCount, 30000);

    return () => clearInterval(interval);
  }, [fetchNotificationCount]);

  const updateNotificationCount = (newCount) => {
    setNotificationCount(newCount);
  };

  return {
    notificationCount,
    loading,
    refetchNotificationCount: fetchNotificationCount,
    updateNotificationCount
  };
}