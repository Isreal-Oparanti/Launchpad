
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Sidebar from '@/components/Sidebar';
import Header from '@/components/Header';
import { useUser } from '@/context/AuthContext'; 

// Mock data for now (can be swapped with backend projects later)
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
  const { user, loading } = useUser(); // ✅ use your auth context
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('projects');
  const [isEditing, setIsEditing] = useState(false);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-teal-700">Loading profile...</p>
      </div>
    );
  }

  if (!user) {
    router.push('/login');
    return null;
  }

  // merge real user info into mock data
  const profileData = {
    ...mockUserData,
    email: user?.email || mockUserData.email,
    name: user?.firstname ? `${user.firstname} ${user.lastname}` : mockUserData.name,
    username: user?.username || mockUserData.username
  };

  const userProjects = mockUserProjects;

  return (
    <div className="min-h-screen bg-gradient-to-b from-teal-50 to-white font-sans">
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />
      <div className="md:ml-64 md:pt-0">
        <Header />

        <div className="max-w-7xl mx-auto p-6 space-y-6">
          {/* Top profile section */}
          <div className="bg-white rounded-2xl shadow-sm border border-teal-100 overflow-hidden">
            <div className="h-32 bg-gradient-to-r from-teal-500 to-emerald-500"></div>
            <div className="px-6 pb-6 relative">
              <div className="flex flex-col md:flex-row items-start md:items-end -mt-16 md:space-x-6">
                {/* Avatar */}
                <div className="flex-shrink-0">
                  <div className="h-32 w-32 rounded-full bg-teal-600 flex items-center justify-center text-white text-4xl font-bold border-4 border-white shadow-lg">
                    {profileData.avatar}
                  </div>
                </div>
                {/* Info */}
                <div className="flex-grow mt-4 md:mt-0">
                  <h1 className="text-2xl font-bold text-teal-900">{profileData.name}</h1>
                  <p className="text-teal-600">@{profileData.username}</p>
                  <p className="mt-2 text-gray-700">{profileData.bio}</p>
                  <div className="flex flex-wrap mt-2 text-sm text-gray-500">
                    <span className="mr-4">📚 {profileData.department}</span>
                    <span>📅 Joined {new Date(profileData.joinDate).toLocaleDateString()}</span>
                  </div>
                </div>
                {/* Actions */}
                <div className="mt-4 md:mt-0">
                  <button
                    onClick={() => setIsEditing(true)}
                    className="px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700"
                  >
                    Edit Profile
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Stats grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {Object.entries(profileData.stats).map(([key, value]) => (
              <div key={key} className="bg-white p-4 rounded-xl shadow-sm border border-teal-100">
                <p className="text-2xl font-bold text-teal-800">{value}</p>
                <p className="text-sm capitalize text-teal-600">{key}</p>
              </div>
            ))}
          </div>

          {/* Skills + Badges */}
          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-white rounded-xl p-6 shadow-sm border border-teal-100">
              <h2 className="text-lg font-semibold text-teal-900 mb-4">Skills</h2>
              <div className="flex flex-wrap gap-2">
                {profileData.skills.map((skill, i) => (
                  <span
                    key={i}
                    className="px-3 py-1 bg-teal-50 text-teal-700 rounded-full text-sm"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-sm border border-teal-100">
              <h2 className="text-lg font-semibold text-teal-900 mb-4">Badges</h2>
              <div className="flex flex-wrap gap-3">
                {profileData.badges.map((badge, i) => (
                  <div key={i} className="flex items-center space-x-2 bg-teal-50 px-3 py-2 rounded-lg">
                    <span className="text-xl">{badge.icon}</span>
                    <div>
                      <p className="text-sm font-medium text-teal-800">{badge.name}</p>
                      <p className="text-xs text-teal-600">{badge.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Projects */}
          <div className="bg-white rounded-xl p-6 shadow-sm border border-teal-100">
            <h2 className="text-lg font-semibold text-teal-900 mb-6">My Projects</h2>
            <div className="grid md:grid-cols-3 gap-6">
              {userProjects.map(project => (
                <div key={project.id} className="bg-teal-50 rounded-xl overflow-hidden shadow-sm border border-teal-100">
                  <img src={project.image} alt={project.title} className="h-40 w-full object-cover" />
                  <div className="p-4">
                    <h3 className="font-bold text-teal-900">{project.title}</h3>
                    <p className="text-sm text-teal-700 mt-1">{project.description}</p>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {project.tags.map((tag, i) => (
                        <span key={i} className="px-2 py-1 text-xs bg-white border border-teal-200 rounded-full text-teal-700">
                          {tag}
                        </span>
                      ))}
                    </div>
                    <div className="flex justify-between items-center mt-3 text-sm text-teal-600">
                      <span>⬆️ {project.upvotes}</span>
                      <span>🤝 {project.collaborators}</span>
                      <span>{project.stage}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
