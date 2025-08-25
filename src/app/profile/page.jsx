// app/profile/page.jsx
'use client';

import { useState } from 'react';
import { useUser } from '@civic/auth/react';
import { useRouter } from 'next/navigation';
import Sidebar from '@/components/Sidebar';
import Header from '@/components/Header';





const mockUserData = {
  name: "Amina O.",
  username: "amina_innovates",
  avatar: "A",
  department: "Computer Science",
  bio: "Passionate about AI and education technology. Building solutions that make learning more accessible across Africa.",
  email: "amina@student.oauife.edu.ng",
  joinDate: "2024-08-15",
  skills: ["AI/ML", "Python", "React", "UI/UX Design", "Data Analysis", "Project Management"],
  stats: {
    projects: 3,
    upvotes: 189,
    collaborations: 4,
    sparkScore: 92
  },
  badges: [
    { name: "First Project", icon: "🚀", description: "Published your first project" },
    { name: "Top Innovator", icon: "🌟", description: "Featured in Campus Spotlight" },
    { name: "Collaborator", icon: "🤝", description: "Joined 3+ projects" },
    { name: "Rising Star", icon: "⭐", description: "Received 100+ upvotes" }
  ]
};

// Mock user projects - would come from your backend
const mockUserProjects = [
  {
    id: 1,
    title: "Attendance AI",
    description: "Low-data app that auto-fills attendance using cheap beacons",
    upvotes: 42,
    tags: ["AI", "Education", "Mobile App"],
    stage: "Prototype",
    collaborators: 2,
    createdAt: "2025-01-15",
    image: "https://picsum.photos/400/250?random=1"
  },
  {
    id: 2,
    title: "EduChat Assistant",
    description: "AI-powered chatbot for educational content delivery in low-bandwidth areas",
    upvotes: 87,
    tags: ["AI", "Education", "Chatbot"],
    stage: "Development",
    collaborators: 3,
    createdAt: "2025-02-10",
    image: "https://picsum.photos/400/250?random=2"
  },
  {
    id: 3,
    title: "LearnLocal",
    description: "Platform for connecting students with local tutors in their community",
    upvotes: 60,
    tags: ["Education", "Web App", "Community"],
    stage: "Idea",
    collaborators: 1,
    createdAt: "2025-02-28",
    image: "https://picsum.photos/400/250?random=3"
  }
];

export default function ProfilePage() {
  const { user } = useUser();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('projects');
  const [isEditing, setIsEditing] = useState(false);
  
  // In a real app, this would come from your backend/context
  const profileData = { ...mockUserData, email: user?.email || mockUserData.email };
  const userProjects = mockUserProjects;

  return (
    <div className="min-h-screen bg-gradient-to-b from-teal-50 to-white font-sans">
       <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />
             <div className="flex-1 ml-64">
             <Header />

      <div className="container mx-auto px-4 py-8">
        {/* Profile Header */}
        <div className="bg-white rounded-2xl shadow-lg p-8 mb-8 border border-teal-100 relative overflow-hidden">
          {/* Decorative elements */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-teal-100 rounded-full -m-16 opacity-50"></div>
          <div className="absolute bottom-0 left-0 w-24 h-24 bg-orange-100 rounded-full -m-12 opacity-50"></div>
          
          <div className="relative z-10">
            <div className="flex flex-col md:flex-row md:items-start">
              {/* Avatar Section */}
              <div className="flex-shrink-0 mb-6 md:mb-0 md:mr-8">
                <div className="w-24 h-24 bg-gradient-to-r from-teal-400 to-teal-600 rounded-full flex items-center justify-center text-white text-3xl font-bold shadow-lg">
                  {profileData.avatar}
                </div>
              </div>
              
              {/* User Info */}
              <div className="flex-1">
                <div className="flex flex-col md:flex-row md:items-start md:justify-between mb-4">
                  <div>
                    <h1 className="text-3xl font-bold text-teal-900 mb-1">{profileData.name}</h1>
                    <p className="text-teal-600">@{profileData.username}</p>
                    <p className="text-teal-700 font-medium mt-2">{profileData.department}</p>
                  </div>
                  
                  <button 
                    onClick={() => setIsEditing(!isEditing)}
                    className="mt-4 md:mt-0 bg-teal-100 hover:bg-teal-200 text-teal-700 px-4 py-2 rounded-lg font-medium transition-colors flex items-center"
                  >
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                    Edit Profile
                  </button>
                </div>
                
                <p className="text-teal-700 mb-6 max-w-2xl">{profileData.bio}</p>
                
                {/* Stats */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                  <div className="text-center p-4 bg-teal-50 rounded-lg">
                    <div className="text-2xl font-bold text-teal-700">{profileData.stats.projects}</div>
                    <div className="text-sm text-teal-600">Projects</div>
                  </div>
                  <div className="text-center p-4 bg-teal-50 rounded-lg">
                    <div className="text-2xl font-bold text-teal-700">{profileData.stats.upvotes}</div>
                    <div className="text-sm text-teal-600">Upvotes</div>
                  </div>
                  <div className="text-center p-4 bg-teal-50 rounded-lg">
                    <div className="text-2xl font-bold text-teal-700">{profileData.stats.collaborations}</div>
                    <div className="text-sm text-teal-600">Collaborations</div>
                  </div>
                  <div className="text-center p-4 bg-teal-50 rounded-lg">
                    <div className="text-2xl font-bold text-teal-700">{profileData.stats.sparkScore}</div>
                    <div className="text-sm text-teal-600">Spark Score</div>
                  </div>
                </div>
                
                {/* Skills */}
                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-teal-900 mb-3">Skills & Expertise</h3>
                  <div className="flex flex-wrap gap-2">
                    {profileData.skills.map((skill, index) => (
                      <span key={index} className="bg-teal-100 text-teal-700 px-3 py-1 rounded-full text-sm">
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
                
                {/* Contact Info */}
                <div className="flex items-center text-teal-600">
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  <span>{profileData.email}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Badges Section */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-8 border border-teal-100">
          <h2 className="text-xl font-bold text-teal-900 mb-6">Achievements & Badges</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {profileData.badges.map((badge, index) => (
              <div key={index} className="text-center p-4 bg-gradient-to-br from-teal-50 to-teal-100 rounded-lg border border-teal-200">
                <div className="text-3xl mb-2">{badge.icon}</div>
                <h3 className="font-semibold text-teal-900 mb-1">{badge.name}</h3>
                <p className="text-sm text-teal-600">{badge.description}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Tabs Navigation */}
        <div className="flex border-b border-teal-200 mb-8">
          <button
            onClick={() => setActiveTab('projects')}
            className={`px-6 py-3 font-medium border-b-2 transition-colors ${
              activeTab === 'projects'
                ? 'border-teal-600 text-teal-700'
                : 'border-transparent text-teal-500 hover:text-teal-700'
            }`}
          >
            Projects
          </button>
          <button
            onClick={() => setActiveTab('activity')}
            className={`px-6 py-3 font-medium border-b-2 transition-colors ${
              activeTab === 'activity'
                ? 'border-teal-600 text-teal-700'
                : 'border-transparent text-teal-500 hover:text-teal-700'
            }`}
          >
            Activity
          </button>
          <button
            onClick={() => setActiveTab('collaborations')}
            className={`px-6 py-3 font-medium border-b-2 transition-colors ${
              activeTab === 'collaborations'
                ? 'border-teal-600 text-teal-700'
                : 'border-transparent text-teal-500 hover:text-teal-700'
            }`}
          >
            Collaborations
          </button>
        </div>

        {/* Tab Content */}
        {activeTab === 'projects' && (
          <div>
            <h2 className="text-2xl font-bold text-teal-900 mb-6">My Projects</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {userProjects.map((project) => (
                <div key={project.id} className="bg-white rounded-2xl shadow-lg overflow-hidden border border-teal-100 hover:shadow-xl transition-shadow">
                  {/* Project Image */}
                  <div className="h-48 relative overflow-hidden">
                    <img 
                      src={project.image} 
                      alt={project.title}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute top-4 right-4 bg-white px-3 py-1 rounded-full shadow-sm">
                      <span className="text-sm font-medium text-teal-700 capitalize">{project.stage}</span>
                    </div>
                  </div>

                  {/* Project Content */}
                  <div className="p-6">
                    <h3 className="text-xl font-bold text-teal-900 mb-2">{project.title}</h3>
                    <p className="text-teal-600 mb-4 line-clamp-2">{project.description}</p>
                    
                    {/* Tags */}
                    <div className="flex flex-wrap gap-2 mb-4">
                      {project.tags.map((tag) => (
                        <span key={tag} className="bg-teal-100 text-teal-700 text-xs px-2 py-1 rounded">
                          #{tag}
                        </span>
                      ))}
                    </div>
                    
                    {/* Stats */}
                    <div className="flex items-center justify-between text-sm text-teal-500">
                      <span className="flex items-center">
                        <svg className="w-4 h-4 mr-1 text-orange-500" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h极.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                        {project.upvotes} upvotes
                      </span>
                      <span>{new Date(project.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'activity' && (
          <div className="bg-white rounded-2xl shadow-lg p-6 border border-teal-100">
            <h2 className="text-2xl font-bold text-teal-900 mb-6">Recent Activity</h2>
            <div className="text-center py-12">
              <svg className="mx-auto h-12 w-12 text-teal-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <h3 className="mt-4 text-lg font-medium text-teal-900">Activity feed coming soon</h3>
              <p className="mt-2 text-teal-600">We're working on displaying your recent activity here.</p>
            </div>
          </div>
        )}

        {activeTab === 'collaborations' && (
          <div className="bg-white rounded-2xl shadow-lg p-6 border border-teal-100">
            <h2 className="text-2xl font-bold text-teal-900 mb-6">Collaborations</h2>
            <div className="text-center py-12">
              <svg className="mx-auto h-12 w-12 text-teal-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2极-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              <h3 className="mt-4 text-lg font-medium text-teal-900">Collaboration history coming soon</h3>
              <p className="mt-2 text-teal-600">We're working on displaying your collaboration history here.</p>
            </div>
          </div>
        )}
      </div>
    </div>
    </div>
  );
}