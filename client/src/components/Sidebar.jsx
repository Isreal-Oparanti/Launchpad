// components/Sidebar.jsx
'use client';
import { useUser } from '@civic/auth/react';
import { useRouter } from 'next/navigation';

export default function Sidebar({ activeTab, setActiveTab }) {
  const { user, signOut } = useUser();
  const router = useRouter();
  
  const navigationItems = [
    { 
      id: 'dashboard', 
      label: 'Dashboard',
      path: '/dashboard',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
        </svg>
      )
    },
    { 
      id: 'opportunities', 
      label: 'Opportunities',
      path: '/opportunities',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      )
    },
     { 
      id: 'notifications', 
      label: 'Notifications',
      path: '/notifications',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
        </svg>
      )
    },
     { 
      id: 'profile', 
      label: 'Profile',
      path: '/profile',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
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
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      )
    },
    { 
      id: 'help', 
      label: 'Help & Support',
      path: '/help',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
  };
  
  // Mobile bottom navigation items
  const mobileNavItems = navigationItems.filter(item => 
    ['dashboard', 'projects', 'opportunities', 'notifications', 'profile'].includes(item.id)
  );
  
  return (
    <>
      {/* Desktop Sidebar */}
      <div className="hidden md:flex fixed left-0 top-0 h-screen w-64 bg-white shadow-lg flex-col border-r border-teal-100 z-30">
        {/* Logo Section */}
        <div className="p-6 border-b border-teal-100">
          <div className="flex items-center">
            {/* <div className="w-10 h-10 rounded-full bg-teal-600 flex items-center justify-center text-white font-bold text-xl">L</div> */}
           <span className="ml-3 font-extrabold text-teal-700 text-xl tracking-tight ">
   <i>Launch</i><span className="text-orange-600 font-extrabold ">pad</span>
 </span>
          </div>
        </div>
      
        {/* Main Navigation */}
        <div className="flex-1 overflow-y-auto py-4">
          <nav className="space-y-1 px-3">
            {navigationItems.map((item) => (
              <button
                key={item.id}
                onClick={() => handleNavigation(item)}
                className={`w-full flex items-center px-3 py-2.5 rounded-lg text-left transition-all cursor-pointer ${
                  activeTab === item.id
                    ? 'bg-teal-100 text-teal-700 shadow-sm'
                    : 'text-teal-600 hover:text-teal-700 hover:bg-teal-50'
                }`}
              >
                <span className="mr-3">{item.icon}</span>
                <span className="text-sm font-medium">{item.label}</span>
                {item.id === 'notifications' && (
                  <span className="ml-auto bg-orange-500 text-white text-xs px-2 py-0.5 rounded-full min-w-[20px] text-center">3</span>
                )}
              </button>
            ))}
          </nav>
          
          {/* Divider */}
          <div className="px-3 my-4 mb-10">
            <div className="border-t border-teal-100"></div>
          </div>
          
          {/* Bottom Navigation */}
          <nav className="space-y-1 px-3">
            {bottomItems.map((item) => (
              <button
                key={item.id}
                onClick={() => handleNavigation(item)}
                className={`w-full flex items-center px-3 py-2.5 rounded-lg text-left transition-all cursor-pointer ${
                  activeTab === item.id
                    ? 'bg-teal-100 text-teal-700 shadow-sm'
                    : 'text-teal-600 hover:text-teal-700 hover:bg-teal-50'
                }`}
              >
                <span className="mr-3">{item.icon}</span>
                <span className="text-sm font-medium">{item.label}</span>
              </button>
            ))}
          </nav>
        </div>
        
        {/* Sign Out Section */}
        <div className="p-4 border-t border-teal-100">
          <button
            onClick={() => signOut()}
            className="w-full cursor-pointer flex items-center justify-center px-3 py-2.5 rounded-lg text-red-600 hover:bg-red-50 transition-colors"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            <span className="text-sm font-medium">Sign Out</span>
          </button>
        </div>
      </div>
      
      {/* Mobile Bottom Navigation */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-teal-100 z-30">
        <div className="flex justify-around items-center py-2">
          {mobileNavItems.map((item) => (
            <button
              key={item.id}
              onClick={() => handleNavigation(item)}
              className={`flex flex-col items-center justify-center px-2 py-1 rounded-lg transition-colors ${
                activeTab === item.id ? 'text-teal-600' : 'text-teal-500'
              }`}
            >
              {item.icon}
              <span className="text-xs mt-1">{item.label}</span>
              {item.id === 'notifications' && (
                <span className="absolute top-1 right-4 bg-orange-500 text-white text-xs rounded-full h-4 w-4 flex items-center justify-center">3</span>
              )}
            </button>
          ))}
        </div>
      </div>
    </>
  );
}