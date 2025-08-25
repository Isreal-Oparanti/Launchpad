// app/dashboard/page.jsx
'use client';

import { useUser } from '@civic/auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import Sidebar from '@/components/Sidebar';
import Header from '@/components/Header';

export default function Dashboard() {
  const { user, isLoading } = useUser();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

const [trendingProjects, setTrendingProjects] = useState([
      {
        id: 1,
        title: "Attendance AI",
        creator: "Amina O.",
        description: "Low-data app that auto-fills attendance using cheap beacons",
        upvotes: 42,
        tags: ["AI", "Education"],
        stage: "Prototype",
        collaborators: 2
      },
      {
        id: 2,
        title: "Waste2Fuel",
        creator: "Chinedu M.",
        description: "Community briquette from campus organic waste",
        upvotes: 89,
        tags: ["Sustainability", "Energy"],
        stage: "Idea",
        collaborators: 1
      }
    ]);

    const [opportunities, setOpportunities] = useState([
      {
        id: 1,
        title: "Alumni Micro-Grant",
        provider: "OAU Alumni Fund",
        amount: "₦50,000",
        deadline: "2025-09-10",
        type: "Funding"
      },
      {
        id: 2,
        title: "TechCampus Hackathon",
        provider: "Google for Startups",
        prize: "₦200,000",
        deadline: "2025-08-25",
        type: "Competition"
      }
    ]);

  useEffect(() => {
    if (!isLoading && !user) {
      router.push('/');
    }
  }, [user, isLoading, router]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-teal-50">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-teal-600"></div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-teal-50 to-white font-sans flex">
      <Sidebar 
        activeTab={activeTab} 
        setActiveTab={setActiveTab}
        isMobileOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
      />
      
      {/* Main Content Area */}
      <div className="flex-1 lg:ml-0">
        <Header 
          onMenuToggle={() => setIsSidebarOpen(!isSidebarOpen)}
          isSidebarOpen={isSidebarOpen}
        />
        
        <div className="container mx-auto px-3 py-4 sm:px-4 sm:py-6">
          {/* Welcome Section */}
          <div className="bg-white rounded-xl sm:rounded-2xl shadow-lg p-4 sm:p-6 mb-6 border border-teal-100">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
              <div className="mb-4 sm:mb-0">
                <h1 className="text-xl sm:text-2xl font-bold text-teal-900 mb-1">
                  Welcome back, {user?.name?.split(' ')[0] || 'Innovator'}! 👋
                </h1>
                <p className="text-teal-600 text-sm sm:text-base">Ready to build something amazing today?</p>
              </div>
              <button className="bg-teal-600 hover:bg-teal-700 text-white px-4 py-2 sm:px-6 sm:py-3 rounded-lg font-semibold transition-all duration-300 shadow-md hover:shadow-lg transform hover:-translate-y-0.5 flex items-center justify-center text-sm sm:text-base">
                <svg className="w-4 h-4 sm:w-5 sm:h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m极-6h6m-6 0H6" />
                </svg>
                Add Project
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
            {/* Main Content */}
            <div className="lg:col-span-2">
              {/* Campus Spotlight Carousel */}
              <div className="bg-white rounded-xl sm:rounded-2xl shadow-lg p-4 sm:p-6 mb-6 border border-teal-100">
                <div className="flex items-center justify-between mb-4 sm:mb-6">
                  <h2 className="text-lg sm:text-xl font-bold text-teal-900">🔥 Campus Spotlight</h2>
                  <span className="text-xs sm:text-sm text-orange-500 font-medium">Top Projects</span>
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                  {trendingProjects.slice(0, 2).map((project) => (
                    <div key={project.id} className="bg-gradient-to-br from-teal-50 to-teal-100 rounded-lg sm:rounded-xl p-4 sm:p-5 border border-teal-200 hover:shadow-md transition-shadow">
                      <div className="flex items-start justify-between mb-3">
                        <span className="bg-teal-600 text-white text-xs px-2 py-1 rounded-full">{project.stage}</span>
                        <span className="flex items-center text-xs sm:text-sm text-teal-700">
                          <svg className="w-3 h-3 sm:w-4 sm:h-4 mr-1 text-orange-500" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                          </svg>
                          {project.upvotes}
                        </span>
                      </div>
                      <h3 className="font-bold text-base sm:text-lg text-teal-900 mb-2">{project.title}</h3>
                      <p className="text-teal-600 text-xs sm:text-sm mb-3 sm:mb-4">{project.description}</p>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <div className="w-5 h-5 sm:w-6 sm:h-6 bg-teal-200 rounded-full flex items-center justify-center text-xs font-medium text-teal-700 mr-2">
                            {project.creator.charAt(0)}
                          </div>
                          <span className="text-xs sm:text-sm text-teal-700">{project.creator}</span>
                        </div>
                        <button className="text-teal-600 hover:text-teal-700 text-xs sm:text-sm font-medium">
                          View →
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Trending Projects */}
              <div className="bg-white rounded-xl sm:rounded-2xl shadow-lg p-4 sm:p-6 border border-teal-100">
                <div className="flex items-center justify-between mb-4 sm:mb-6">
                  <h2 className="text-lg sm:text-xl font-bold text-teal-900">🚀 Trending Projects</h2>
                  <button className="text-teal-600 hover:text-teal-700 text-xs sm:text-sm font-medium">
                    View All →
                  </button>
                </div>

                <div className="space-y-3 sm:space-y-4">
                  {trendingProjects.map((project) => (
                    <div key={project.id} className="flex items-center p-3 sm:p-4 rounded-lg border border-teal-100 hover:border-teal-200 transition-colors">
                      <div className="flex-shrink-0 w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-r from-teal-400 to-teal-600 rounded-lg flex items-center justify-center text-white font-bold text-xs sm:text-sm">
                        {project.title.charAt(0)}
                      </div>
                      <div className="ml-3 sm:ml-4 flex-1">
                        <h3 className="font-semibold text-teal-900 text-sm sm:text-base">{project.title}</h3>
                        <p className="text-teal-600 text-xs sm:text-sm line-clamp-1">{project.description}</p>
                        <div className="flex items-center mt-1 sm:mt-2 space-x-1 sm:space-x-2">
                          {project.tags.slice(0, 2).map((tag) => (
                            <span key={tag} className="bg-teal-100 text-teal-700 text-xs px-1.5 sm:px-2 py-0.5 sm:py-1 rounded">
                              #{tag}
                            </span>
                          ))}
                          {project.tags.length > 2 && (
                            <span className="bg-teal-50 text-teal-500 text-xs px-1 sm:px-1.5 py-0.5 rounded">
                              +{project.tags.length - 2}
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="text-right">
                        <span className="flex items-center text-xs sm:text-sm text-teal-700">
                          <svg className="w-3 h-3 sm:w-4 sm:h-4 mr-1 text-orange-500" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-极.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                          </svg>
                          {project.upvotes}
                        </span>
                        <span className="text-xs text-teal-500">{project.collaborators} collab</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Sidebar Content */}
            <div className="space-y-4 sm:space-y-6">
              {/* Opportunities Panel */}
              <div className="bg-white rounded-xl sm:rounded-2xl shadow-lg p-4 sm:p-6 border border-teal-100">
                <h2 className="text-lg sm:text-xl font-bold text-teal-900 mb-3 sm:mb-4">💰 Opportunities</h2>
                <div className="space-y-3 sm:space-y-4">
                  {opportunities.map((opp) => (
                    <div key={opp.id} className="p-3 sm:p-4 rounded-lg bg-teal-50 border border-teal-200">
                      <div className="flex items-start justify-between mb-2">
                        <h3 className="font-semibold text-teal-900 text-sm sm:text-base">{opp.title}</h3>
                        <span className="bg-teal-600 text-white text-xs px-2 py-0.5 sm:px-2 sm:py-1 rounded">
                          {opp.type}
                        </span>
                      </div>
                      <p className="text-xs sm:text-sm text-teal-600 mb-2 sm:mb-3">By {opp.provider}</p>
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-sm sm:text-base font-medium text-teal-700">{opp.amount || opp.prize}</span>
                        <span className="text-xs text-teal-500">Deadline: {opp.deadline}</span>
                      </div>
                      <button className="w-full bg-teal-600 hover:bg-teal-700 text-white py-1.5 sm:py-2 rounded-lg text-xs sm:text-sm font-medium transition-colors">
                        Apply Now
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Quick Stats */}
              <div className="bg-white rounded-xl sm:rounded-2xl shadow-lg p-4 sm:p-6 border border-teal-100">
                <h2 className="text-lg sm:text-xl font-bold text-teal-900 mb-3 sm:mb-4">📊 Your Impact</h2>
                <div className="grid grid-cols-2 gap-3 sm:gap-4">
                  <div className="text-center p-3 bg-teal-50 rounded-lg">
                    <div className="text-xl sm:text-2xl font-bold text-teal-700 mb-1">3</div>
                    <div className="text-xs sm:text-sm text-teal-600">Projects</div>
                  </div>
                  <div className="text-center p-3 bg-teal-50 rounded-lg">
                    <div className="text-xl sm:text-2xl font-bold text-teal-700 mb-1">124</div>
                    <div className="text-xs sm:text-sm text-teal-600">Sparks</div>
                  </div>
                  <div className="text-center p-3 bg-teal-50 rounded-lg">
                    <div className="text-xl sm:text-2xl font-bold text-teal-700 mb-1">8</div>
                    <div className="text-xs sm:text-sm text-teal-600">Collaborators</div>
                  </div>
                  <div className="text-center p-3 bg-teal-50 rounded-lg">
                    <div className="text-xl sm:text-2xl font-bold text-teal-700 mb-1">2</div>
                    <div className="text-xs sm:text-sm text-teal-600">Badges</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}