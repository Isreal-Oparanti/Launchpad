'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useUser } from '@/context/AuthContext';

export default function Header({ onMenuToggle, mobileMenuOpen }) {
  const { user } = useUser();
  const router = useRouter();
  const [showNotifications, setShowNotifications] = useState(false);

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-gray-200">
      <div className="px-4 md:px-6 h-[73px] flex items-center">
        <div className="flex items-center justify-between gap-4 w-full">
          {/* Left: Logo + Search */}
          <div className="flex items-center gap-2">
            {/* Mobile Logo */}
            <div className="flex md:hidden items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-teal-600 flex items-center justify-center">
                <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <span className="text-xl font-bold text-gray-900">
                F<span className="text-teal-600">oundr</span>Geeks
              </span>
            </div>

            {/* Desktop Search */}
            <div className="hidden md:flex items-center bg-gray-50 rounded-lg px-4 py-2.5 min-w-[320px] lg:min-w-[400px]">
              <svg className="w-5 h-5 text-gray-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                type="text"
                placeholder="Search projects, opportunities..."
                className="bg-transparent text-sm text-gray-700 placeholder-gray-400 flex-1 outline-none"
              />
            </div>
          </div>

          {/* Right: Actions */}
          <div className="flex items-center gap-2 md:gap-3">
            {/* Notifications (Desktop) */}
            <div className="hidden md:block relative">
              <button
                onClick={() => setShowNotifications(!showNotifications)}
                className="relative p-2 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                </svg>
                <span className="absolute top-1 right-1 bg-teal-600 text-white text-[10px] font-bold rounded-full h-4 w-4 flex items-center justify-center">
                  5
                </span>
              </button>

              {showNotifications && (
                <>
                  <div className="fixed inset-0 z-30" onClick={() => setShowNotifications(false)} />
                  <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-lg border border-gray-200 z-40">
                    <div className="p-4 border-b border-gray-100">
                      <h3 className="text-sm font-bold text-gray-900">Notifications</h3>
                    </div>
                    <div className="max-h-[400px] overflow-y-auto">
                      {[1, 2, 3].map((i) => (
                        <div key={i} className="p-4 hover:bg-gray-50 border-b border-gray-100 cursor-pointer transition-colors">
                          <div className="flex gap-3">
                            <div className="w-10 h-10 rounded-full bg-teal-100 flex items-center justify-center shrink-0">
                              <svg className="w-5 h-5 text-teal-600" fill="currentColor" viewBox="0 0 20 20">
                                <path d="M10 2a6 6 0 00-6 6v3.586l-.707.707A1 1 0 004 14h12a1 1 0 00.707-1.707L16 11.586V8a6 6 0 00-6-6zM10 18a3 3 0 01-3-3h6a3 3 0 01-3 3z" />
                              </svg>
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-gray-900">New collaboration request</p>
                              <p className="text-xs text-gray-500 mt-0.5">Someone wants to join your project</p>
                              <p className="text-xs text-gray-400 mt-1">2 hours ago</p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                    <div className="p-3 border-t border-gray-100">
                      <button 
                        onClick={() => router.push('/notifications')}
                        className="w-full text-center text-sm font-medium text-teal-600 hover:text-teal-700"
                      >
                        View all notifications
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* Messages (Desktop) */}
            <button
              onClick={() => router.push('/messages')}
              className="hidden md:block relative p-2 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              <span className="absolute top-1 right-1 bg-teal-600 text-white text-[10px] font-bold rounded-full h-4 w-4 flex items-center justify-center">
                3
              </span>
            </button>

            {/* Profile (Desktop) */}
            <button
              onClick={() => router.push('/profile')}
              className="hidden md:flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <div className="w-8 h-8 bg-teal-600 rounded-full flex items-center justify-center text-white text-sm font-bold">
                {user?.initials || 'U'}
              </div>
              <div className="hidden lg:block text-left">
                <p className="text-sm font-medium text-gray-900 leading-tight">{user?.fullName || 'User'}</p>
                <p className="text-xs text-gray-500">@{user?.username || 'username'}</p>
              </div>
            </button>

            {/* Mobile Profile Avatar */}
            <button
              onClick={() => router.push('/profile')}
              className="md:hidden w-8 h-8 bg-teal-600 rounded-full flex items-center justify-center text-white text-sm font-bold"
            >
              {user?.initials || 'U'}
            </button>

            {/* HAMBURGER */}
            <button
              onClick={() => {
                console.log('Hamburger clicked!');
                onMenuToggle();
              }}
              className="md:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors"
            >
              {mobileMenuOpen ? (
                <svg className="w-6 h-6 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                <svg className="w-6 h-6 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              )}
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}