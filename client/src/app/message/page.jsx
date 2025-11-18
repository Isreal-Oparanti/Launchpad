'use client';

import { useRouter } from 'next/navigation';
import { useUser } from '@/context/AuthContext';
import Header from '@/components/Header';
import Sidebar from '@/components/Sidebar';
import { useState, useEffect } from 'react';
import { messageService } from '@/utils/message';

export default function ChatListPage() {
  const router = useRouter();
  const { user } = useUser();
  const [activeTab, setActiveTab] = useState('chat');
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchConversations();
  }, []);

  const fetchConversations = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await messageService.getConversations();
      console.log('Conversations response:', response); // Debug log
      
      if (response.success) {
        setConversations(response.conversations || []);
      } else {
        setError('Failed to load conversations');
      }
    } catch (error) {
      console.error('Error fetching conversations:', error);
      setError('Failed to load conversations. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (timestamp) => {
    try {
      const date = new Date(timestamp);
      const now = new Date();
      const diffInHours = (now - date) / (1000 * 60 * 60);
      
      if (diffInHours < 24) {
        return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      } else if (diffInHours < 168) {
        return date.toLocaleDateString([], { weekday: 'short' });
      } else {
        return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
      }
    } catch (e) {
      return 'Recently';
    }
  };

  const getLastMessagePreview = (conversation) => {
    if (!conversation.lastMessage || !conversation.lastMessage.text) {
      return 'No messages yet';
    }
    
    const text = conversation.lastMessage.text;
    return text.length > 50 ? text.substring(0, 50) + '...' : text;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white">
        <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />
        <div className="md:ml-64">
          <Header />
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-teal-600 border-t-transparent"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />
      <div className="md:ml-64">
        <Header />
        
        <div className="max-w-4xl mx-auto px-4 py-6">
          <div className="bg-white border border-gray-200 rounded-xl">
            {/* Header */}
            <div className="border-b border-gray-200 px-6 py-4">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-xl font-bold text-gray-900">Messages</h1>
                  <p className="text-sm text-gray-600 mt-1">Connect with potential collaborators</p>
                </div>
                <button
                  onClick={fetchConversations}
                  className="p-2 hover:bg-gray-100 rounded-lg text-gray-600"
                  title="Refresh conversations"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div className="mx-6 mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                <div className="flex items-center gap-2 text-red-700">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span>{error}</span>
                  <button 
                    onClick={fetchConversations}
                    className="ml-auto text-red-600 hover:text-red-800 font-medium"
                  >
                    Retry
                  </button>
                </div>
              </div>
            )}

            {/* Conversations List */}
            <div className="divide-y divide-gray-200">
              {conversations.length > 0 ? conversations.map((conversation) => (
                <div
                  key={conversation.userId}
                  onClick={() => router.push(`/message/${conversation.userId}`)}
                  className="px-6 py-4 hover:bg-gray-50 cursor-pointer transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-teal-600 rounded-full flex items-center justify-center text-white font-semibold overflow-hidden flex-shrink-0">
                      {conversation.userProfilePicture ? (
                        <img 
                          src={conversation.userProfilePicture} 
                          alt={conversation.userName}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <span>{conversation.userInitials}</span>
                      )}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold text-gray-900 truncate">
                          {conversation.userName}
                        </h3>
                        {conversation.unreadCount > 0 && (
                          <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full min-w-[20px] text-center">
                            {conversation.unreadCount}
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-gray-600 mb-1 truncate">{conversation.userTitle}</p>
                      <p className="text-sm text-gray-500 truncate">
                        {getLastMessagePreview(conversation)}
                      </p>
                    </div>
                    
                    <div className="flex flex-col items-end gap-1 flex-shrink-0">
                      <div className="text-xs text-gray-500 whitespace-nowrap">
                        {conversation.lastMessage ? formatTime(conversation.lastMessage.timestamp) : 'No messages'}
                      </div>
                      {conversation.totalMessages > 0 && (
                        <div className="text-xs text-gray-400">
                          {conversation.totalMessages} message{conversation.totalMessages !== 1 ? 's' : ''}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )) : (
                <div className="px-6 py-12 text-center">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">No conversations yet</h3>
                  <p className="text-gray-600 mb-4">Start a conversation with potential collaborators from their profiles</p>
                  <button
                    onClick={() => router.push('/dashboard/projects')}
                    className="bg-teal-600 text-white px-6 py-2 rounded-lg hover:bg-teal-700"
                  >
                    Browse Projects
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}