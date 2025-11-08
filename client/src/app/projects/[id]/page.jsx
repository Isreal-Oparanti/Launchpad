'use client';
import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useUser } from '@/context/AuthContext';
import projectService from '@/utils/project';
import Sidebar from '@/components/Sidebar';
import Header from '@/components/Header';

const ProjectDetailPage = () => {
  const params = useParams();
  const router = useRouter();
  const { id } = params;
  const { user } = useUser();
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeSidebarTab, setActiveSidebarTab] = useState('projects');

  const isOwner = user && project && user._id === project.creator._id;

  useEffect(() => {
    if (id) {
      fetchProject();
    }
  }, [id]);

  const fetchProject = async () => {
    try {
      const response = await projectService.getProject(id);
      if (response.success) {
        setProject(response.data);
      }
    } catch (error) {
      console.error('Fetch project error:', error);
      if (error.response?.status === 401 || error.message?.includes('token')) {
        router.push('/login');
      }
    } finally {
      setLoading(false);
    }
  };

  const getStageColor = (stage) => {
    const colors = {
      'Idea': 'bg-purple-100 text-purple-700',
      'Prototype': 'bg-blue-100 text-blue-700',
      'MVP': 'bg-yellow-100 text-yellow-700',
      'Beta': 'bg-orange-100 text-orange-700',
      'Launched': 'bg-green-100 text-green-700'
    };
    return colors[stage] || 'bg-gray-100 text-gray-700';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-teal-600 border-t-transparent"></div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Project not found</h2>
          <button onClick={() => router.back()} className="text-teal-600 font-medium">
            ← Go back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-teal-50 to-white font-sans">
      <Sidebar activeTab={activeSidebarTab} setActiveTab={setActiveSidebarTab} />
      <div className="md:ml-64">
        <Header title={project.title} subtitle={project.tagline} />
        <div className="max-w-4xl mx-auto px-4 py-8 pb-20 md:pb-8">
          {/* Back Button */}
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-teal-600 font-medium mb-6 hover:text-teal-700 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to Projects
          </button>

          {/* Cover Image with Logo */}
          {project.coverImage && (
            <div className="relative h-48 md:h-64 bg-gradient-to-br from-teal-100 to-blue-100">
              <img src={project.coverImage} alt={project.title} className="w-full h-full object-cover" />
              {project.logo && (
                <div className="absolute bottom-4 left-4 w-20 h-20 bg-white rounded-2xl shadow-xl p-3 border-2 border-white">
                  <img src={project.logo} alt={`${project.title} logo`} className="w-full h-full object-contain" />
                </div>
              )}
            </div>
          )}

          {/* Main Content */}
          <div className="py-6 space-y-6">
            {/* Title & Stage */}
            <div>
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">{project.title}</h2>
                  <p className="text-lg text-gray-600">{project.tagline}</p>
                </div>
                <span className={`px-3 py-1 rounded-full text-sm font-semibold ${getStageColor(project.stage)}`}>
                  {project.stage}
                </span>
              </div>

              {/* Tags */}
              <div className="flex flex-wrap gap-2">
                <span className="px-3 py-1 bg-gray-100 text-gray-700 text-sm rounded-lg font-medium">
                  {project.category}
                </span>
                {project.tags.map((tag, idx) => (
                  <span key={idx} className="px-3 py-1 bg-teal-50 text-teal-700 text-sm rounded-lg">
                    #{tag}
                  </span>
                ))}
              </div>
            </div>

            {/* Stats Bar */}
            <div className="flex items-center gap-6 text-sm text-gray-600 py-4 border-y border-gray-200">
              <span className="flex items-center gap-1.5">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
                {project.viewCount} views
              </span>
              <span className="flex items-center gap-1.5">
                <svg className="w-5 h-5" fill={project.hasUpvoted ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
                {project.upvoteCount} upvotes
              </span>
              <span className="flex items-center gap-1.5">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
                {project.commentCount} comments
              </span>
              {project.interestCount > 0 && (
                <span className="flex items-center gap-1.5 text-teal-600 font-medium">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                  {project.interestCount} interested
                </span>
              )}
            </div>

            {/* Problem Statement */}
            <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-r-lg">
              <h3 className="text-sm font-bold text-red-900 mb-2 flex items-center gap-2">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                The Problem
              </h3>
              <p className="text-gray-700">{project.problemStatement}</p>
            </div>

            {/* Solution */}
            <div className="bg-green-50 border-l-4 border-green-500 p-4 rounded-r-lg">
              <h3 className="text-sm font-bold text-green-900 mb-2 flex items-center gap-2">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z" clipRule="evenodd" />
                </svg>
                Our Solution
              </h3>
              <p className="text-gray-700">{project.solution}</p>
            </div>

            {/* Target Market */}
            <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded-r-lg">
              <h3 className="text-sm font-bold text-blue-900 mb-2 flex items-center gap-2">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3zM6 8a2 2 0 11-4 0 2 2 0 014 0zM16 18v-3a5.972 5.972 0 00-.75-2.906A3.005 3.005 0 0119 15v3h-3zM4.75 12.094A5.973 5.973 0 004 15v3H1v-3a3 3 0 013.75-2.906z" />
                </svg>
                Target Market
              </h3>
              <p className="text-gray-700">{project.targetMarket}</p>
            </div>

            {/* Traction (if available) */}
            {(project.traction?.users > 0 || project.traction?.milestones?.length > 0) && (
              <div className="bg-white rounded-2xl p-4 border border-gray-200">
                <h3 className="text-lg font-bold text-gray-900 mb-3">Traction</h3>
                <div className="grid grid-cols-2 gap-4">
                  {project.traction.users > 0 && (
                    <div>
                      <p className="text-2xl font-bold text-teal-600">{project.traction.users.toLocaleString()}</p>
                      <p className="text-sm text-gray-600">Users</p>
                    </div>
                  )}
                  {project.traction.revenue > 0 && (
                    <div>
                      <p className="text-2xl font-bold text-teal-600">₦{project.traction.revenue.toLocaleString()}</p>
                      <p className="text-sm text-gray-600">Revenue</p>
                    </div>
                  )}
                </div>
                {project.traction.milestones?.length > 0 && (
                  <div className="mt-4">
                    <p className="text-sm font-semibold text-gray-700 mb-2">Key Milestones:</p>
                    <ul className="space-y-1">
                      {project.traction.milestones.map((milestone, idx) => (
                        <li key={idx} className="text-sm text-gray-600 flex items-start gap-2">
                          <svg className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                          </svg>
                          {milestone}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}

            {/* Team Needs Section */}
            {project.neededRoles?.length > 0 && (
              <div className="bg-white rounded-2xl p-4 border border-gray-200">
                <h3 className="text-lg font-bold text-gray-900 mb-3 flex items-center gap-2">
                  <svg className="w-5 h-5 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                  </svg>
                  Open Team Roles ({project.neededRoles.length})
                </h3>
                <div className="space-y-4">
                  {project.neededRoles.map((role, idx) => (
                    <div key={idx} className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="text-sm font-semibold text-gray-900">{role.role}</h4>
                        <span className="px-2 py-1 bg-teal-100 text-teal-700 text-xs rounded-md">
                          {role.preferredLocation}
                        </span>
                      </div>
                      <p className="text-xs text-gray-600 mb-2">Required Skills:</p>
                      <div className="flex flex-wrap gap-1.5">
                        {role.requiredSkills.map((skill, sIdx) => (
                          <span key={sIdx} className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-md">
                            {skill}
                          </span>
                        ))}
                      </div>
                      <p className="text-xs text-gray-600 mt-2">Commitment: {role.commitment}</p>
                      <p className="text-xs text-gray-600 mt-1">Equity: {role.equity}</p>
                      {role.description && (
                        <p className="text-xs text-gray-600 mt-2">Description: {role.description}</p>
                      )}
                      <button
                        onClick={() => {
                          alert(`Reaching out for ${role.role} role - Manual contact to creator`);
                        }}
                        className="mt-3 w-full py-2 bg-teal-600 text-white text-sm rounded-lg font-medium hover:bg-teal-700 transition-colors"
                      >
                        Reach Out for this Role
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Creator Info */}
            <div className="bg-white rounded-2xl p-4 border border-gray-200">
              <h3 className="text-sm font-bold text-gray-900 mb-3">Created by</h3>
              <button
                onClick={() => router.push(`/profile/${project.creator._id}`)}
                className="flex items-center gap-3 hover:bg-gray-50 rounded-lg p-2 -ml-2 transition-colors w-full"
              >
                <div className="w-12 h-12 bg-gradient-to-br from-teal-400 to-blue-500 rounded-full flex items-center justify-center text-white text-lg font-bold">
                  {project.creator.initials}
                </div>
                <div className="flex-1 text-left">
                  <p className="font-semibold text-gray-900">{project.creator.fullName}</p>
                  <p className="text-sm text-gray-600">{project.creator.title || 'Student Entrepreneur'}</p>
                  {project.creator.school && <p className="text-xs text-gray-500">{project.creator.school}</p>}
                </div>
              </button>
              {project.teamMembers?.length > 0 && (
                <div className="mt-3 pt-3 border-t border-gray-100">
                  <p className="text-xs font-semibold text-gray-700 mb-2">Team Members:</p>
                  <div className="space-y-2">
                    {project.teamMembers.map((member, idx) => (
                      <button
                        key={idx}
                        onClick={() => router.push(`/profile/${member.user._id}`)}
                        className="flex items-center gap-2 w-full hover:bg-gray-50 rounded-lg p-2 -ml-2 transition-colors"
                      >
                        <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center text-xs font-semibold text-gray-700">
                          {member.user.initials}
                        </div>
                        <div className="flex-1 text-left">
                          <p className="text-sm font-medium text-gray-900">{member.user.fullName}</p>
                          <p className="text-xs text-gray-500">{member.role || member.expertise}</p>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Demo Link */}
            {project.demoUrl && (
              <a
                href={project.demoUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="block w-full bg-gradient-to-r from-teal-600 to-blue-600 text-white text-center py-4 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-shadow"
              >
                <span className="flex items-center justify-center gap-2">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                  </svg>
                  View Live Demo
                </span>
              </a>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProjectDetailPage;