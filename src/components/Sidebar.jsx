// components/Sidebar.jsx
'use client';

import { useUser } from '@civic/auth/react';
import { useRouter } from 'next/navigation';

export default function Sidebar({ activeTab, setActiveTab, isMobileOpen, onClose }) {
  const { user, signOut } = useUser();
  const router = useRouter();

  const navigationItems = [
    { 
      id: 'dashboard', 
      label: 'Dashboard',
      path: '/dashboard',
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="m8 5l4-4 4 4" />
        </svg>
      )
    },
    { 
      id: 'projects', 
      label: 'Projects',
      path: '/projects',
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 极 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a极 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 极h10" />
        </svg>
      )
    },
    { 
      id: 'opportunities', 
      label: 'Opportunities',
      path: '/opportunities',
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      )
    },
    { 
      id: 'notifications', 
      label: 'Notifications',
      path: '/notifications',
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
        </svg>
      )
    },
    { 
      id: 'profile', 
      label: 'Profile',
      path: '/profile',
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 极 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7极14a7 7 0 00-7-7z" />
        </svg>
      )
    }
  ];

  const bottomItems = [
    { 
      id: 'settings', 
      label: 'Settings',
      path: '/settings',
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 极 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0极" />
        </svg>
      )
    },
    { 
      id: 'help', 
      label: 'Help',
      path: '/help',
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      )
    }
  ];

  const handleNavigation = (item) => {
    setActiveTab(item.id);
    if (item.path) {
      router.push(item.path);
    }
    // Close sidebar on mobile after navigation
    if (window.innerWidth < 1024) {
      onClose();
    }
  };

  return (
    <>
      {/* Mobile overlay */}
      {isMobileOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={onClose}
        />
      )}
      
      {/* Sidebar */}
      <div className={`
        fixed lg:static top-0 left-0 h-screen w-64 bg-white shadow-lg flex flex-col border-r border-teal-100 z-50
        transform transition-transform duration-300 ease-in-out
        ${isMobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        {/* Logo Section */}
        <div className="p-4 border-b border-teal-100">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="w-8 h-8 rounded-full bg-teal-600 flex items-center justify-center text-white font-bold text-sm">L</div>
              <span className="ml-2 font-semibold text-teal-700 text-sm">Launch<span className="text-orange-500">pad</span></span>
            </div>
            <button 
              onClick={onClose}
              className="lg:hidden p-1 text-teal-500 hover:text-teal-700"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* User Profile Section - Hidden on mobile */}
        <div className="hidden lg:block p-4 border-b border-teal-100">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-gradient-to-r from-teal-400 to-teal-600 rounded-full flex items-center justify-center text-white text-xs font-medium">
              {user?.name?.charAt(0) || 'U'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-teal-900 truncate">{user?.name || 'User'}</p>
              <p className="text-xs text-teal-500 truncate">OAU Student</p>
            </div>
          </div>
        </div>

        {/* Main Navigation */}
        <div className="flex-1 overflow-y-auto py-4">
          <nav className="space-y-1 px-3">
            {navigationItems.map((item) => (
              <button
                key={item.id}
                onClick={() => handleNavigation(item)}
                className={`w-full flex items-center px-3 py-2 rounded-lg text-left transition-all cursor-pointer ${
                  activeTab === item.id
                    ? 'bg-teal-100 text-teal-700 shadow-sm'
                    : 'text-teal-600 hover:text-teal-700 hover:bg-teal-50'
                }`}
              >
                <span className="mr-3">{item.icon}</span>
                <span className="text-xs font-medium">{item.label}</span>
                {item.id === 'notifications' && (
                  <span className="ml-auto bg-orange-500 text-white text-xs px-1.5 py-0.5 rounded-full min-w-[18px] text-center">3</span>
                )}
              </button>
            ))}
          </nav>

          {/* Divider */}
          <div className="px-3 my-4">
            <div className="border-t border-teal-100"></div>
          </div>

          {/* Bottom Navigation */}
          <nav className="space-y-1 px-3">
            {bottomItems.map((item) => (
              <button
                key={item.id}
                onClick={() => handleNavigation(item)}
                className={`w-full flex items-center px-3 py-2 rounded-lg text-left transition-all cursor-pointer ${
                  activeTab === item.id
                    ? 'bg-teal-100 text-teal-700 shadow-sm'
                    : 'text-teal-600 hover:text-teal-700 hover:bg-teal-50'
                }`}
              >
                <span className="mr-3">{item.icon}</span>
                <span className="text-xs font-medium">{item.label}</span>
              </button>
            ))}
          </nav>
        </div>

        {/* Sign Out Section */}
        <div className="p-4 border-t border-teal-100">
          <button
            onClick={() => signOut()}
            className="w-full flex items-center justify-center px-3 py-2 rounded-lg text-red-600 hover:bg-red-50 transition-colors text-xs font-medium"
          >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3极7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            Sign Out
          </button>
        </div>
      </div>
    </>
  );
}