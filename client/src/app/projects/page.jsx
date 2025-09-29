
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import CreateProjectModal from '@/components/CreateProjectModal';
import Sidebar from '@/components/Sidebar';
import Header from '@/components/Header';

const mockProjects = [
  {
    id: 1,
    title: "Attendance AI",
    creator: { name: "Amina O.", avatar: "A", department: "Computer Science" },
    description: "Low-data app that auto-fills attendance using cheap beacons",
    upvotes: 42,
    tags: ["AI", "Education", "Mobile App"],
    stage: "Prototype",
    collaborators: 2,
    createdAt: "2025-01-15",
    image: "https://picsum.photos/400/250?random=1",
    repository: "https://github.com/example/attendance-ai",
    demo: "https://example.com/demo",
    views: 128,
    comments: 7
  },
  {
    id: 2,
    title: "Waste2Fuel",
    creator: { name: "Chinedu M.", avatar: "C", department: "Environmental Science" },
    description: "Community briquette from campus organic waste",
    upvotes: 89,
    tags: ["Sustainability", "Energy", "Community"],
    stage: "Idea",
    collaborators: 1,
    createdAt: "2025-02-10",
    image: "https://picsum.photos/400/250?random=2",
    repository: null,
    demo: null,
    views: 204,
    comments: 12
  },
  {
    id: 3,
    title: "Campus Connect",
    creator: { name: "Tunde A.", avatar: "T", department: "Software Engineering" },
    description: "Platform for student skill-sharing and collaboration",
    upvotes: 57,
    tags: ["Social", "Education", "Web App"],
    stage: "Development",
    collaborators: 4,
    createdAt: "2025-01-28",
    image: "https://picsum.photos/400/250?random=3",
    repository: "https://github.com/example/campus-connect",
    demo: "https://campus-connect.demo.com",
    views: 178,
    comments: 9
  },
  {
    id: 4,
    title: "EduStream",
    creator: { name: "Zainab K.", avatar: "Z", department: "Computer Engineering" },
    description: "Live streaming platform optimized for educational content",
    upvotes: 124,
    tags: ["Education", "Video", "Web App"],
    stage: "Launched",
    collaborators: 3,
    createdAt: "2024-12-05",
    image: "https://picsum.photos/400/250?random=4",
    repository: "https://github.com/example/edustream",
    demo: "https://edustream.live",
    views: 342,
    comments: 21
  },
  {
    id: 5,
    title: "AgriPredict",
    creator: { name: "Femi B.", avatar: "F", department: "Agricultural Science" },
    description: "AI-powered crop disease prediction using smartphone cameras",
    upvotes: 76,
    tags: ["AI", "Agriculture", "Mobile App"],
    stage: "Prototype",
    collaborators: 2,
    createdAt: "2025-02-18",
    image: "https://picsum.photos/400/250?random=5",
    repository: null,
    demo: "https://agripredict.demo.com",
    views: 156,
    comments: 8
  },
  {
    id: 6,
    title: "MediTrack",
    creator: { name: "Chioma N.", avatar: "C", department: "Medical Sciences" },
    description: "Medication reminder and management system for students",
    upvotes: 63,
    tags: ["Health", "Mobile App", "Productivity"],
    stage: "Development",
    collaborators: 3,
    createdAt: "2025-02-22",
    image: "https://picsum.photos/400/250?random=6",
    repository: "https://github.com/example/meditrack",
    demo: null,
    views: 189,
    comments: 11
  }
];

export default function ProjectsPage() {
  const router = useRouter();
  const [projects, setProjects] = useState(mockProjects);
  const [filter, setFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('popular');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('projects');
  const dummyUser = { name: "John Doe" };

  const handleUpvote = (projectId) => {
    setProjects(projects.map(project => {
      if (project.id === projectId) {
        const hasUpvoted = project.upvoted;
        return {
          ...project,
          upvotes: hasUpvoted ? project.upvotes - 1 : project.upvotes + 1,
          upvoted: !hasUpvoted
        };
      }
      return project;
    }));
  };

  const handleCreateProject = (projectData) => {
    const newProject = {
      id: Math.max(...projects.map(p => p.id)) + 1,
      title: projectData.title,
      creator: { 
        name: dummyUser.name, 
        avatar: dummyUser.name.charAt(0), 
        department: "Unknown" 
      },
      description: projectData.description,
      upvotes: 0,
      tags: projectData.tags,
      stage: projectData.stage,
      collaborators: 0,
      createdAt: new Date().toISOString().split('T')[0],
      image: `https://picsum.photos/400/250?random=${Math.floor(Math.random() * 100)}`,
      repository: projectData.repository || null,
      demo: projectData.demo || null,
      views: 0,
      comments: 0
    };
    
    setProjects([newProject, ...projects]);
    setIsCreateModalOpen(false);
  };

  const filteredProjects = projects
    .filter(project => {
      if (filter === 'all') return true;
      return project.stage.toLowerCase() === filter;
    })
    .filter(project => {
      if (!searchQuery) return true;
      return (
        project.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        project.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        project.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
      );
    })
    .sort((a, b) => {
      if (sortBy === 'popular') return b.upvotes - a.upvotes;
      if (sortBy === 'recent') return new Date(b.createdAt) - new Date(a.createdAt);
      return a.title.localeCompare(b.title);
    });

  return (
    <div className="min-h-screen bg-gradient-to-b from-teal-50 to-white font-sans">
       <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />
       <div className="md:ml-64  md:pt-0">
       <Header />

      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-teal-900 mb-2">Explore Projects</h1>
            <p className="text-teal-600">Discover innovative projects from OAU students</p>
          </div>
          <button 
            onClick={() => setIsCreateModalOpen(true)}
            className="bg-teal-600 hover:bg-teal-700 text-white px-6 py-3 rounded-lg font-semibold mt-4 md:mt-0 transition-all duration-300 shadow-md hover:shadow-lg transform hover:-translate-y-0.5 flex items-center"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            Add Your Project
          </button>
        </div>

        <div className="bg-white rounded-2xl shadow-lg p-6 mb-8 border border-teal-100">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg className="h-5 w-5 text-teal-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <input
                type="text"
                placeholder="Search projects..."
                className="pl-10 w-full p-3 border border-teal-200 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            <select 
              className="p-3 border border-teal-200 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
            >
              <option value="all">All Stages</option>
              <option value="idea">Idea</option>
              <option value="prototype">Prototype</option>
              <option value="development">Development</option>
              <option value="launched">Launched</option>
            </select>

            <select 
              className="p-3 border border-teal-200 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
            >
              <option value="popular">Most Popular</option>
              <option value="recent">Most Recent</option>
              <option value="name">Project Name</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProjects.map((project) => (
            <div key={project.id} className="bg-white rounded-2xl shadow-lg overflow-hidden border border-teal-100 hover:shadow-xl transition-shadow group">
              <div className="h-48 relative overflow-hidden">
                <img 
                  src={project.image} 
                  alt={project.title}
                  className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                />
                <div className="absolute top-4 right-4 bg-white px-3 py-1 rounded-full shadow-sm">
                  <span className="text-sm font-medium text-teal-700 capitalize">{project.stage}</span>
                </div>
                <div className="absolute bottom-4 left-4 bg-teal-600 text-white px-2 py-1 rounded text-xs font-medium">
                  {project.views} views
                </div>
              </div>

              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <h3 className="text-xl font-bold text-teal-900 group-hover:text-teal-700 transition-colors">{project.title}</h3>
                </div>

                <p className="text-teal-600 mb-4 line-clamp-2">{project.description}</p>

                <div className="flex flex-wrap gap-2 mb-4">
                  {project.tags.slice(0, 3).map((tag) => (
                    <span key={tag} className="bg-teal-100 text-teal-700 text-xs px-2 py-1 rounded">
                      #{tag}
                    </span>
                  ))}
                  {project.tags.length > 3 && (
                    <span className="bg-teal-50 text-teal-500 text-xs px-2 py-1 rounded">
                      +{project.tags.length - 3} more
                    </span>
                  )}
                </div>

                <div className="flex items-center justify-between mb-4 text-sm text-teal-500">
                  <div className="flex items-center space-x-4">
                    <span className="flex items-center">
                      <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                      </svg>
                      {project.collaborators}
                    </span>
                    <span className="flex items-center">
                      <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                      </svg>
                      {project.comments}
                    </span>
                  </div>
                  <span>{new Date(project.createdAt).toLocaleDateString()}</span>
                </div>

                <div className="flex items-center justify-between border-t border-teal-100 pt-4">
                  <div className="flex items-center">
                    <div className="w-8 h-8 bg-teal-200 rounded-full flex items-center justify-center text-xs font-medium text-teal-700 mr-2">
                      {project.creator.avatar}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-teal-900">{project.creator.name}</p>
                      <p className="text-xs text-teal-500">{project.creator.department}</p>
                    </div>
                  </div>
                  
                  <button 
                    onClick={() => handleUpvote(project.id)}
                    className={`flex items-center space-x-2 p-2 rounded-lg transition-colors ${
                      project.upvoted ? 'bg-orange-100 text-orange-500' : 'bg-teal-100 text-teal-600 hover:bg-teal-200'
                    }`}
                  >
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                    <span className="font-medium">Upvote · {project.upvotes}</span>
                  </button>
                </div>

                <div className="flex items-center justify-between mt-4 pt-4 border-t border-teal-100">
                  <div className="flex space-x-3">
                    {project.repository && (
                      <a href={project.repository} target="_blank" rel="noopener noreferrer" className="text-teal-600 hover:text-teal-700 flex items-center text-sm">
                        <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M12.316 3.051a1 1 0 01.633 1.265l-4 12a1 1 0 11-1.898-.632l4-12a1 1 0 011.265-.633zM5.707 6.293a1 1 0 010 1.414L3.414 10l2.293 2.293a1 1 0 11-1.414 1.414l-3-3a1 1 0 010-1.414l3-3a1 1 0 011.414 0zm8.586 0a1 1 0 011.414 0l3 3a1 1 0 010 1.414l-3 3a1 1 0 11-1.414-1.414L16.586 10l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
                        </svg>
                        Code
                      </a>
                    )}
                    {project.demo && (
                      <a href={project.demo} target="_blank" rel="noopener noreferrer" className="text-teal-600 hover:text-teal-700 flex items-center text-sm">
                        <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                        Demo
                      </a>
                    )}
                  </div>
                  <button className="text-teal-600 hover:text-teal-700 text-sm font-medium">
                    View Details →
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {filteredProjects.length === 0 && (
          <div className="text-center py-12">
            <svg className="mx-auto h-12 w-12 text-teal-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <h3 className="mt-2 text-lg font-medium text-teal-900">No projects found</h3>
            <p className="mt-1 text-teal-600">Try adjusting your search or filter to find what you're looking for.</p>
            <div className="mt-6">
              <button 
                onClick={() => {
                  setFilter('all');
                  setSearchQuery('');
                }}
                className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-teal-600 hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500"
              >
                Clear all filters
              </button>
            </div>
          </div>
        )}
      </div>

      <CreateProjectModal 
        isOpen={isCreateModalOpen} 
        onClose={() => setIsCreateModalOpen(false)}
        onSubmit={handleCreateProject}
      />
    </div>
    </div>
  );
}
