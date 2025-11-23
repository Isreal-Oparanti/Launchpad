'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useUser } from '@/context/AuthContext';
import notificationService from '@/utils/notification';
import Header from '@/components/Header';
import Sidebar from '@/components/Sidebar';

export default function Notifications() {
  const { user, loading } = useUser();
  const router = useRouter();
  const [notifications, setNotifications] = useState([]);
  const [fetching, setFetching] = useState(true);
  const [showSettings, setShowSettings] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);
    handleResize();
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    if (loading || !user) return;
    loadNotifications();
  }, [user, loading]);

  const loadNotifications = async () => {
    try {
      setFetching(true);
      const res = await notificationService.getNotifications();
      if (res.success) setNotifications(res.data.notifications);
    } catch (err) {
      console.error('Failed to load notifications');
    } finally {
      setFetching(false);
    }
  };

  const markAsRead = async (id, link) => {
    try {
      await notificationService.markAsRead(id);
      setNotifications(prev => prev.map(n => n._id === id ? { ...n, read: true } : n));
      if (link) router.push(link);
    } catch (err) {
      console.error('Mark read failed');
    }
  };

  const markAllAsRead = async () => {
    try {
      await notificationService.markAllAsRead();
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    } catch (err) {
      console.error('Mark all read failed');
    }
  };

  const deleteNotification = async (id) => {
    try {
      await notificationService.deleteNotification(id);
      setNotifications(prev => prev.filter(n => n._id !== id));
    } catch (err) {
      console.error('Delete failed');
    }
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  if (loading) {
      return (
        <div className="min-h-screen bg-white">
          <Sidebar activeTab="notifications" />
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
      <Sidebar activeTab="notifications" />
      <div className="md:ml-64">
        <Header />
        <div className="max-w-3xl mx-auto px-4 py-6">

          {/* Header with Settings Icon */}
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-2xl font-bold text-gray-900">Notifications</h1>
            <button
              onClick={() => setShowSettings(true)}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <svg className="w-6 h-6 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </button>
          </div>

          {/* Unread Summary */}
          {unreadCount > 0 && (
            <div className="bg-teal-50 border border-teal-200 rounded-lg p-3 mb-4 flex items-center justify-between">
              <p className="text-sm text-teal-800">
                {unreadCount} unread notification{unreadCount > 1 ? 's' : ''}
              </p>
              <button
                onClick={markAllAsRead}
                className="text-xs text-teal-600 hover:text-teal-700 font-medium"
              >
                Mark all as read
              </button>
            </div>
          )}

          {/* Notification List */}
          <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
            {notifications.length === 0 ? (
              <div className="text-center py-12">
                <svg className="w-16 h-16 mx-auto text-gray-300 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                </svg>
                <p className="text-gray-600">No notifications yet</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-100">
                {notifications.map((n) => (
                  <div
                    key={n._id}
                    onClick={() => markAsRead(n._id, n.link)}
                    className={`p-4 hover:bg-gray-50 transition-colors cursor-pointer ${!n.read ? 'bg-blue-50' : ''}`}
                  >
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 bg-teal-100 rounded-full flex items-center justify-center flex-shrink-0">
                        {n.icon || (
                          <svg className="w-5 h-5 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                          </svg>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between">
                          <h3 className={`text-sm font-semibold ${!n.read ? 'text-teal-900' : 'text-gray-900'}`}>
                            {n.title}
                          </h3>
                          <span className="text-xs text-gray-500 ml-2 whitespace-nowrap">
                            {n.formattedTime || n.time}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600 mt-1 line-clamp-1">
                          {n.description}
                        </p>
                        <div className="flex items-center gap-2 mt-1 text-xs">
                          {!n.read && <span className="w-2 h-2 bg-blue-500 rounded-full"></span>}
                          <span className="text-gray-500 capitalize">{n.type}</span>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              deleteNotification(n._id);
                            }}
                            className="text-red-600 hover:text-red-700"
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* SETTINGS MODAL — Fullscreen on mobile */}
      {showSettings && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-0 md:p-4">
          <div className={`bg-white w-full h-full md:max-w-lg md:h-auto md:rounded-2xl md:shadow-2xl overflow-y-auto ${isMobile ? '' : 'my-8'}`}>
            {/* Header */}
            <div className="sticky top-0 bg-white border-b border-gray-200 p-4 flex items-center gap-3">
              {isMobile && (
                <button onClick={() => setShowSettings(false)}>
                  <svg className="w-6 h-6 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                </button>
              )}
              <h2 className="text-xl font-bold text-gray-900 flex-1 text-center md:text-left">
                Notification Settings
              </h2>
              {!isMobile && (
                <button onClick={() => setShowSettings(false)}>
                  <svg className="w-6 h-6 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              )}
            </div>

            {/* Body */}
            <div className="p-6 space-y-6">
              {[
                { label: 'Project Updates', desc: 'Activity on your projects' },
                { label: 'New Opportunities', desc: 'Funding, competitions' },
                { label: 'Collaboration Requests', desc: 'Match notifications' },
                { label: 'Email Notifications', desc: 'Important updates via email' }
              ].map((item, i) => (
                <div key={i} className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium text-gray-900">{item.label}</h3>
                    <p className="text-sm text-gray-600">{item.desc}</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" className="sr-only peer" defaultChecked={i < 3} />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-teal-600"></div>
                  </label>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}