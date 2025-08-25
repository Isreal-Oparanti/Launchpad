// components/Header.jsx
'use client';

import { useUser } from '@civic/auth/react';

export default function Header({ title = "Dashboard", subtitle = "Welcome back!" }) {
  const { user, signOut } = useUser();

  return (
    <header className="sticky top-0 z-40 bg-white/95  backdrop-blur-md shadow-sm border-b border-teal-100">
      <div className="px-6 py-4">
        <div className="flex items-center justify-between">
          {/* Page Title */}
         <div className="hidden md:flex items-center bg-teal-50 rounded-lg px-3 py-2 min-w-[300px]">
              <svg className="w-4 h-4 text-teal-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input 
                type="text" 
                placeholder="Search projects, opportunities..." 
                className="bg-transparent text-sm text-teal-700 placeholder-teal-400 flex-1 outline-none"
              />
            </div>
          {/* Header Actions */}
          <div className="flex items-center space-x-4">
          

            {/* Notifications */}
            <button className="relative p-2 rounded-lg hover:bg-teal-50 transition-colors">
              <svg className="w-5 h-5 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
              </svg>
              <span className="absolute -top-1 -right-1 bg-orange-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">3</span>
            </button>

            {/* Messages */}
            <button className="p-2 rounded-lg hover:bg-teal-50 transition-colors">
              <svg className="w-5 h-5 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
            </button>

           
            {/* User Menu */}
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gradient-to-r from-teal-400 to-teal-600 rounded-full flex items-center justify-center text-white text-sm font-medium">
                {user?.name?.charAt(0) || 'U'}
              </div>
              <div className="hidden lg:block">
                <p className="text-sm font-medium text-teal-900">{user?.name || 'User'}</p>
                <p className="text-xs text-teal-500">Student</p>
              </div>
              
              {/* Dropdown Arrow */}
              <button className="p-1 rounded hover:bg-teal-50 transition-colors">
                <svg className="w-4 h-4 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}