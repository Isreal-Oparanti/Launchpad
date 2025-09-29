
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Sidebar from '@/components/Sidebar';
import Header from '@/components/Header';
import { useUser } from '@/context/AuthContext'; // ✅ use your custom hook

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
  const { user, loading } = useUser(); // ✅ now uses your auth context
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
    router.push('/login'); // redirect if no user
    return null;
  }

  // fallback to mock data but prefer real user info
  const profileData = { 
    ...mockUserData, 
    email: user?.email || mockUserData.email,
    name: user?.firstname 
      ? `${user.firstname} ${user.lastname}` 
      : mockUserData.name,
    username: user?.username || mockUserData.username
  };

  const userProjects = mockUserProjects;

  return (
    <div className="min-h-screen bg-gradient-to-b from-teal-50 to-white font-sans">
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />
      <div className="md:ml-64 md:pt-0">
        <Header />

        {/* rest of your profile UI stays the same */}
      </div>
    </div>
  );
}
