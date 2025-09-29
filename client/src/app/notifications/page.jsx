'use client';
import { useUser } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import Sidebar from '@/components/Sidebar';
import Header from '@/components/Header';

export default function Notifications() {
  const { user, loading, logout } = useUser();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('notifications');
  
  // Sample notification data
  const [notifications, setNotifications] = useState([
    {
      id: 1,
      type: 'project',
      title: 'New upvote on your project',
      description: 'Amina O. upvoted your "Attendance AI" project',
      time: '2 hours ago',
      read: false,
      icon: (
        <svg className="w-5 h-5 text-orange-500" fill="currentColor" viewBox="0 0 20 20">
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      )
    },
    {
      id: 2,
      type: 'opportunity',
      title: 'New funding opportunity',
      description: 'OAU Alumni Fund is offering micro-grants up to ₦50,000',
      time: '5 hours ago',
      read: false,
      icon: (
        <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      )
    },
    {
      id: 3,
      type: 'collaboration',
      title: 'Collaboration request',
      description: 'Chinedu M. wants to collaborate on your Waste2Fuel project',
      time: '1 day ago',
      read: true,
      icon: (
        <svg className="w-5 h-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
      )
    },
    {
      id: 4,
      type: 'system',
      title: 'Your project is in Spotlight',
      description: 'Congratulations! Your "Attendance AI" project is featured in this week\'s Campus Spotlight',
      time: '2 days ago',
      read: true,
      icon: (
        <svg className="w-5 h-5 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
        </svg>
      )
    },
    {
      id: 5,
      type: 'comment',
      title: 'New comment on your project',
      description: 'Tunde A. commented: "This is a brilliant solution! Have you considered..."',
      time: '3 days ago',
      read: true,
      icon: (
        <svg className="w-5 h-5 text-teal-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
        </svg>
      )
    }
  ]);
  
  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);
  
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-teal-50">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-teal-600"></div>
      </div>
    );
  }
  
  if (!user) {
    return null; // Will redirect due to useEffect
  }
  
  const markAsRead = (id) => {
    setNotifications(notifications.map(notif => 
      notif.id === id ? { ...notif, read: true } : notif
    ));
  };
  
  const markAllAsRead = () => {
    setNotifications(notifications.map(notif => ({ ...notif, read: true })));
  };
  
  const unreadCount = notifications.filter(n => !n.read).length;
  
  return (
    <div className="min-h-screen bg-gradient-to-b from-teal-50 to-white font-sans">
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />
      
      {/* Main Content Area */}
      <div className="md:ml-64  md:pt-0">
        <Header />
        <div className="container mx-auto px-4 py-8 pb-20 md:pb-8">
          {/* Notifications Header */}
          <div className="bg-white rounded-2xl shadow-lg p-6 mb-8 border border-teal-100">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between">
              <div>
                <h1 className="text-2xl font-bold text-teal-900 mb-2">
                  Notifications
                </h1>
                <p className="text-teal-600">
                  {unreadCount > 0 
                    ? `You have ${unreadCount} unread notification${unreadCount > 1 ? 's' : ''}` 
                    : 'All caught up! No new notifications.'}
                </p>
              </div>
              {unreadCount > 0 && (
                <button 
                  onClick={markAllAsRead}
                  className="bg-teal-600 hover:bg-teal-700 text-white px-6 py-3 rounded-lg font-semibold mt-4 md:mt-0 transition-all duration-300 shadow-md hover:shadow-lg"
                >
                  Mark all as read
                </button>
              )}
            </div>
          </div>
          
          {/* Notifications List */}
          <div className="bg-white rounded-2xl shadow-lg border border-teal-100 overflow-hidden">
            {notifications.length === 0 ? (
              <div className="text-center py-12">
                <svg className="w-16 h-16 mx-auto text-teal-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                </svg>
                <h3 className="text-xl font-semibold text-teal-900 mb-2">No notifications</h3>
                <p className="text-teal-600">You're all caught up! Check back later for updates.</p>
              </div>
            ) : (
              <div className="divide-y divide-teal-100">
                {notifications.map((notification) => (
                  <div 
                    key={notification.id} 
                    className={`p-6 hover:bg-teal-50 transition-colors cursor-pointer ${!notification.read ? 'bg-blue-50' : ''}`}
                    onClick={() => markAsRead(notification.id)}
                  >
                    <div className="flex items-start">
                      <div className="flex-shrink-0 mr-4">
                        {notification.icon}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-start justify-between">
                          <h3 className={`font-semibold ${!notification.read ? 'text-teal-900' : 'text-teal-800'}`}>
                            {notification.title}
                          </h3>
                          <span className="text-xs text-teal-500 whitespace-nowrap ml-2">
                            {notification.time}
                          </span>
                        </div>
                        <p className="text-teal-600 mt-1 text-sm">
                          {notification.description}
                        </p>
                        <div className="flex items-center mt-3">
                          {!notification.read && (
                            <span className="inline-block w-2 h-2 bg-blue-500 rounded-full mr-2"></span>
                          )}
                          <span className="text-xs text-teal-500 capitalize">
                            {notification.type}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
          
          {/* Notification Settings */}
          <div className="mt-8 bg-white rounded-2xl shadow-lg p-6 border border-teal-100">
            <h2 className="text-xl font-bold text-teal-900 mb-4">Notification Settings</h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium text-teal-900">Project updates</h3>
                  <p className="text-sm text-teal-600">Get notified about activity on your projects</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" className="sr-only peer" defaultChecked />
                  <div className="w-11 h-6 bg-teal-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-teal-600"></div>
                </label>
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium text-teal-900">New opportunities</h3>
                  <p className="text-sm text-teal-600">Get notified about new funding and competitions</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" className="sr-only peer" defaultChecked />
                  <div className="w-11 h-6 bg-teal-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-teal-600"></div>
                </label>
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium text-teal-900">Collaboration requests</h3>
                  <p className="text-sm text-teal-600">Get notified when someone wants to collaborate</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" className="sr-only peer" defaultChecked />
                  <div className="w-11 h-6 bg-teal-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-teal-600"></div>
                </label>
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium text-teal-900">Email notifications</h3>
                  <p className="text-sm text-teal-600">Receive email updates for important notifications</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" className="sr-only peer" />
                  <div className="w-11 h-6 bg-teal-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-teal-600"></div>
                </label>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
