// hooks/useUnreadMessageCount.js
'use client';

import { useState, useEffect, useCallback } from 'react';
import { useUser } from '@/context/AuthContext';
import messageService from '@/utils/message';

export function useUnreadMessageCount() {
  const { user } = useUser();
  const [unreadMessageCount, setUnreadMessageCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchUnreadCount = useCallback(async () => {
    if (!user) {
      setUnreadMessageCount(0);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      const response = await messageService.getUnreadCount();
      
      if (response.success) {
        setUnreadMessageCount(response.data?.unreadCount || 0);
      } else {
        // Fallback: Get count from conversations
        try {
          const conversationsRes = await messageService.getConversations();
          if (conversationsRes.success && conversationsRes.conversations) {
            const totalUnread = conversationsRes.conversations.reduce(
              (sum, conv) => sum + (conv.unreadCount || 0), 
              0
            );
            setUnreadMessageCount(totalUnread);
          }
        } catch (fallbackError) {
          console.error('Fallback count fetch failed:', fallbackError);
          setUnreadMessageCount(0);
        }
      }
    } catch (error) {
      console.error('Error fetching unread message count:', error);
      setError(error.message);
      setUnreadMessageCount(0);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (user) {
      // Initial fetch
      fetchUnreadCount();

      // Poll every 5 seconds for updates (reduced from 30 seconds)
      const interval = setInterval(fetchUnreadCount, 5000);

      return () => clearInterval(interval);
    } else {
      setUnreadMessageCount(0);
      setLoading(false);
    }
  }, [user, fetchUnreadCount]);

  // Check if we should show badge
  const showBadge = unreadMessageCount > 0;

  return {
    unreadMessageCount,
    loading,
    error,
    showBadge,
    refetchUnreadCount: fetchUnreadCount,
  };
}