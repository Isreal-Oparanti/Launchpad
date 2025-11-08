'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useUser } from '@/context/AuthContext';
import projectService from '@/utils/project'; 
import Sidebar from '@/components/Sidebar';
import Header from '@/components/Header';

const ProjectsPage = () => {
  const router = useRouter();
  const { user, loading: userLoading } = useUser();
  
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  const [category, setCategory] = useState('all');
  const [stage, setStage] = useState('all');
  const [sort, setSort] = useState('recent');
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [selectedProject, setSelectedProject] = useState(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [activeTab, setActiveTab] = useState('projects');

  const observerTarget = useRef(null);

  const fetchProjects = useCallback(async (pageNum, isRefresh = false) => {
    try {
      setLoading(true);
      
      const response = await projectService.getProjects({
        page: pageNum,
        limit: 12,
        category,
        stage,
        search: searchQuery,
        sort
      });
      
      if (response.success) {
        if (isRefresh || pageNum === 1) {
          setProjects(response.data.projects);
        } else {
          setProjects(prev => [...prev, ...response.data.projects]);
        }
        setHasMore(response.data.pagination.hasMore);
        setPage(pageNum);
      }
    } catch (error) {
      console.error('Fetch projects error:', error);
      setProjects([]);
      setHasMore(false);
    } finally {
      setLoading(false);
    }
  }, [category, stage, searchQuery, sort]); 

  // Infinite scroll observer
  useEffect(() => {
    const observer = new IntersectionObserver(
      entries => {
        if (entries[0].isIntersecting && hasMore && !loading) {
          fetchProjects(page + 1);
        }
      },
      { threshold: 0.5 }
    );

    const currentTarget = observerTarget.current;
    if (currentTarget) {
      observer.observe(currentTarget);
    }

    return () => {
      if (currentTarget) {
        observer.unobserve(currentTarget);
      }
    };
  }, [hasMore, loading, page, fetchProjects]);

  // Initial load and filter changes
  useEffect(() => {
    fetchProjects(1, true);
  }, [fetchProjects]);

  // Handle upvote with optimistic update
  const handleUpvote = async (projectId) => {
    if (!user) {
      router.push('/login');
      return;
    }

    // Optimistic update
    setProjects(prev => prev.map(p => {
      if (p._id === projectId) {
        return {
          ...p,
          hasUpvoted: !p.hasUpvoted,
          upvoteCount: p.hasUpvoted ? p.upvoteCount - 1 : p.upvoteCount + 1
        };
      }
      return p;
    }));

    try {
      await projectService.toggleUpvote(projectId);
    } catch (error) {
      console.error('Upvote error:', error);
      // Check if unauthorized
      if (error.response?.status === 401 || error.message?.includes('token')) {
        router.push('/login');
        return;
      }
      // Revert on error
      setProjects(prev => prev.map(p => {
        if (p._id === projectId) {
          return {
            ...p,
            hasUpvoted: !p.hasUpvoted,
            upvoteCount: p.hasUpvoted ? p.upvoteCount + 1 : p.upvoteCount - 1
          };
        }
        return p;
      }));
    }
  };

  // Handle express interest
  const handleExpressInterest = async (projectId) => {
    if (!user) {
      router.push('/login');
      return;
    }

    try {
      const response = await projectService.expressInterest(projectId, '');
      
      if (response.success) {
        setProjects(prev => prev.map(p => {
          if (p._id === projectId) {
            return {
              ...p,
              hasExpressedInterest: true,
              interestCount: response.data.interestCount
            };
          }
          return p;
        }));
      }
    } catch (error) {
      console.error('Express interest error:', error);
      // Check if unauthorized
      if (error.response?.status === 401 || error.message?.includes('token')) {
        router.push('/login');
        return;
      }
      alert(error.message || 'Failed to express interest');
    }
  };

  const handleDeleteProject = async (projectId) => {
    try {
      const response = await projectService.deleteProject(projectId);
      if (response.success) {
        setProjects(prev => prev.filter(p => p._id !== projectId));
        setShowDeleteConfirm(false);
        setSelectedProject(null);
      }
    } catch (error) {
      alert(error.message || 'Failed to delete project');
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

  const ProjectCard = ({ project }) => {
    const [showMenu, setShowMenu] = useState(false);
    const isOwner = user && user._id === project.creator._id;

    return (
      <div
        onClick={() => router.push(`/projects/${project._id}`)}
        className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden cursor-pointer hover:shadow-md transition-shadow"
      >
        {/* Cover Image with Logo */}
        {project.coverImage && (
          <div className="relative h-48 bg-gradient-to-br from-teal-100 to-blue-100">
            <img
              src={project.coverImage}
              alt={project.title}
              className="w-full h-full object-cover"
            />
            <div className="absolute top-3 right-3">
              <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStageColor(project.stage)}`}>
                {project.stage}
              </span>
            </div>
            {/* Logo Badge */}
            {project.logo && (
              <div className="absolute bottom-3 left-3 w-16 h-16 bg-white rounded-xl shadow-lg p-2 border-2 border-white">
                <img src={project.logo} alt={`${project.title} logo`} className="w-full h-full object-contain" />
              </div>
            )}
          </div>
        )}

        {/* Content */}
        <div className="p-4">
          {/* Title & Tagline */}
          <h3 className="text-lg font-bold text-gray-900 mb-1">{project.title}</h3>
          <p className="text-sm text-gray-600 mb-3 line-clamp-2">{project.tagline}</p>

          {/* Problem Statement Preview */}
          <p className="text-xs text-gray-500 mb-3 line-clamp-3">{project.problemStatement}</p>

          {/* Tags */}
          <div className="flex flex-wrap gap-1.5 mb-3">
            {project.tags.slice(0, 3).map((tag, idx) => (
              <span key={idx} className="px-2 py-1 bg-teal-50 text-teal-700 text-xs rounded-md">
                #{tag}
              </span>
            ))}
            {project.tags.length > 3 && (
              <span className="px-2 py-1 bg-gray-50 text-gray-500 text-xs rounded-md">
                +{project.tags.length - 3}
              </span>
            )}
          </div>

          {/* Needed Roles Badge */}
          {project.neededRoles?.length > 0 && (
            <div className="mb-3">
              <span className="inline-flex items-center gap-1 px-3 py-1 bg-orange-100 text-orange-700 text-xs rounded-full font-medium">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
                Seeking {project.neededRoles.length} Role{project.neededRoles.length > 1 ? 's' : ''}
              </span>
            </div>
          )}

          {/* Creator & Actions */}
          <div className="flex items-center justify-between mb-3 pb-3 border-b border-gray-100">
            <button
              onClick={(e) => {
                e.stopPropagation();
                router.push(`/profile/${project.creator._id}`);
              }}
              className="flex items-center gap-2 hover:bg-gray-50 rounded-lg p-1 -ml-1 transition-colors"
            >
              <div className="w-8 h-8 bg-gradient-to-br from-teal-400 to-blue-500 rounded-full flex items-center justify-center text-white text-xs font-semibold">
                {project.creator.initials}
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900">{project.creator.fullName}</p>
                <p className="text-xs text-gray-500">{project.creator.title || 'Student Entrepreneur'}</p>
              </div>
            </button>

            <div className="flex items-center gap-2">
              {/* Upvote Button */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleUpvote(project._id);
                }}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-lg transition-all ${
                  project.hasUpvoted
                    ? 'bg-red-50 text-red-600'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                <svg className="w-4 h-4" fill={project.hasUpvoted ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
                <span className="text-sm font-semibold">{project.upvoteCount}</span>
              </button>

              {/* Interest Button */}
              {!project.hasExpressedInterest ? (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleExpressInterest(project._id);
                  }}
                  className="flex items-center gap-1.5 px-3 py-2 bg-teal-100 text-teal-700 rounded-lg hover:bg-teal-200 transition-all text-xs font-medium"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                  I'm Interested
                </button>
              ) : (
                <div className="flex items-center gap-1.5 px-3 py-2 bg-green-100 text-green-700 rounded-lg text-xs font-medium">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  Interested
                </div>
              )}

              {isOwner && (
                <div className="relative">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setShowMenu(!showMenu);
                    }}
                    className="p-2 hover:bg-gray-100 rounded-full"
                  >
                    <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
                    </svg>
                  </button>
                  {showMenu && (
                    <div className="absolute right-0 mt-2 w-32 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-10">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedProject(project);
                          setShowCreateModal(true);
                          setShowMenu(false);
                        }}
                        className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                        Edit
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedProject(project);
                          setShowDeleteConfirm(true);
                          setShowMenu(false);
                        }}
                        className="flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50 w-full"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                        Delete
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Stats Row */}
          <div className="flex items-center gap-4 text-xs text-gray-500">
            <span className="flex items-center gap-1">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
              {project.viewCount}
            </span>
            {project.interestCount > 0 && (
              <span className="flex items-center gap-1 text-teal-600 font-medium">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                {project.interestCount}
              </span>
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-teal-50 to-white font-sans">
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />
      
      {/* Main Content Area */}
      <div className="md:ml-64 md:pt-0">
        <Header />
        
        {/* Projects Page Content */}
        <div className="container mx-auto px-4 py-8 pb-20 md:pb-8">
          {/* Header - Sticky */}
          <div className="sticky top-0 z-40 w-full bg-white border-b border-gray-200 shadow-sm z-[9]">
            <div className="px-4 py-4">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <h1 className="text-xl font-bold text-gray-900">Discover Projects</h1>
                  <p className="text-sm text-gray-500">Ideas changing campus</p>
                </div>
                <button
                  onClick={() => {
                    setSelectedProject(null);
                    setShowCreateModal(true);
                  }}
                  className="bg-teal-600 text-white p-3 rounded-full shadow-lg active:scale-95 transition-transform"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                </button>
              </div>

              {/* Search Bar */}
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search projects..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-gray-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
                <svg className="absolute left-3 top-3 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>

              {/* Filter Toggle */}
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="mt-2 flex items-center gap-2 text-sm text-teal-600 font-medium"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
                </svg>
                Filters
              </button>
            </div>

            {/* Filter Panel */}
            {showFilters && (
              <div className="px-4 pb-4 border-t border-gray-100 bg-gray-50">
                <div className="grid grid-cols-3 gap-2 mt-3">
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="px-3 py-2 text-sm bg-white border border-gray-200 rounded-lg"
                  >
                    <option value="all">All</option>
                    <option value="Technology">Tech</option>
                    <option value="Health">Health</option>
                    <option value="Education">Education</option>
                    <option value="Agriculture">Agriculture</option>
                    <option value="Finance">Finance</option>
                    <option value="Social Impact">Impact</option>
                  </select>

                  <select
                    value={stage}
                    onChange={(e) => setStage(e.target.value)}
                    className="px-3 py-2 text-sm bg-white border border-gray-200 rounded-lg"
                  >
                    <option value="all">All Stages</option>
                    <option value="Idea">Idea</option>
                    <option value="Prototype">Prototype</option>
                    <option value="MVP">MVP</option>
                    <option value="Beta">Beta</option>
                    <option value="Launched">Launched</option>
                  </select>

                  <select
                    value={sort}
                    onChange={(e) => setSort(e.target.value)}
                    className="px-3 py-2 text-sm bg-white border border-gray-200 rounded-lg"
                  >
                    <option value="recent">Recent</option>
                    <option value="popular">Popular</option>
                    <option value="trending">Trending</option>
                  </select>
                </div>
              </div>
            )}
          </div>

          {/* Projects Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 px-4 py-4">
            {projects.map((project) => (
              <ProjectCard key={project._id} project={project} />
            ))}
          </div>

          {/* Loading Spinner */}
          {loading && (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-10 w-10 border-4 border-teal-600 border-t-transparent"></div>
            </div>
          )}

          {/* Infinite Scroll Trigger */}
          {hasMore && !loading && (
            <div ref={observerTarget} className="h-20 flex items-center justify-center">
              <p className="text-sm text-gray-400">Loading more...</p>
            </div>
          )}

          {/* End of Results */}
          {!hasMore && projects.length > 0 && (
            <div className="text-center py-8">
              <p className="text-gray-400 text-sm">You've reached the end!</p>
            </div>
          )}

          {/* Empty State */}
          {!loading && projects.length === 0 && (
            <div className="text-center py-12">
              <svg className="mx-auto h-16 w-16 text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
              </svg>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No projects found</h3>
              <p className="text-gray-500 mb-4">Try adjusting your filters or be the first to post!</p>
              <button
                onClick={() => {
                  setCategory('all');
                  setStage('all');
                  setSort('recent');
                  setSearchQuery('');
                }}
                className="px-6 py-2.5 bg-teal-600 text-white rounded-lg font-medium"
              >
                Clear Filters
              </button>
            </div>
          )}
        </div>

        {/* Create/Edit Project Modal */}
        {showCreateModal && (
          <CreateProjectModal
            project={selectedProject}
            onClose={() => {
              setShowCreateModal(false);
              setSelectedProject(null);
            }}
            onSuccess={() => {
              setShowCreateModal(false);
              setSelectedProject(null);
              fetchProjects(1, true);
              setShowSuccessModal(true);
            }}
          />
        )}

        {/* Success Modal */}
        {showSuccessModal && (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 relative overflow-hidden">
              {/* Cute background elements */}
              <div className="absolute inset-0 pointer-events-none">
                <div className="absolute top-0 left-0 w-32 h-32 bg-teal-200/20 rounded-full -translate-x-1/2 -translate-y-1/2 animate-pulse"></div>
                <div className="absolute bottom-0 right-0 w-32 h-32 bg-blue-200/20 rounded-full translate-x-1/2 translate-y-1/2 animate-pulse delay-200"></div>
              </div>
              
              {/* Cute icon */}
              <div className="text-center mb-4">
                <svg className="w-16 h-16 mx-auto text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              
              <h3 className="text-xl font-bold text-teal-900 text-center mb-2">Project Published!</h3>
              <p className="text-teal-700 text-center mb-6">
                Your innovative idea is now live on Launchpad. Our intelligent matching system is analyzing potential collaborators—expect top recommendations in your notifications soon!
              </p>
              
              <div className="flex gap-3">
                <button
                  onClick={() => setShowSuccessModal(false)}
                  className="flex-1 py-3 bg-teal-600 text-white rounded-xl font-medium hover:bg-teal-700 transition-colors"
                >
                  Got it!
                </button>
                <button
                  onClick={() => {
                    setShowSuccessModal(false);
                    router.push('/notifications');
                  }}
                  className="flex-1 py-3 border-2 border-teal-600 text-teal-600 rounded-xl font-medium hover:bg-teal-50 transition-colors"
                >
                  View Notifications
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Delete Confirmation Modal */}
        {showDeleteConfirm && selectedProject && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6">
              <div className="flex items-center gap-4 mb-4">
                <div className="p-3 bg-red-100 rounded-full">
                  <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900">Delete Project?</h3>
                  <p className="text-sm text-gray-600">This action cannot be undone</p>
                </div>
              </div>
              <p className="text-gray-700 mb-6">
                Are you sure you want to delete "<strong>{selectedProject.title}</strong>"? All data including comments, upvotes, and team information will be permanently removed.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setShowDeleteConfirm(false);
                    setSelectedProject(null);
                  }}
                  className="flex-1 px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-xl font-semibold hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleDeleteProject(selectedProject._id)}
                  className="flex-1 px-6 py-3 bg-red-600 text-white rounded-xl font-semibold hover:bg-red-700 transition-colors"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// Create Project Modal Component
const CreateProjectModal = ({ onClose, onSuccess, project }) => {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    title: project?.title || '',
    tagline: project?.tagline || '',
    problemStatement: project?.problemStatement || '',
    solution: project?.solution || '',
    targetMarket: project?.targetMarket || '',
    category: project?.category || 'Technology',
    stage: project?.stage || 'Idea',
    tags: project?.tags || [],
    demoUrl: project?.demoUrl || '',
    logo: null,
    coverImage: null,
    neededRoles: project?.neededRoles || [],
  });
  const [tagInput, setTagInput] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [logoPreview, setLogoPreview] = useState(project?.logo || null);
  const [coverPreview, setCoverPreview] = useState(project?.coverImage || null);
  const [showTeamNeeds, setShowTeamNeeds] = useState((project?.neededRoles || []).length > 0);
  const [currentRole, setCurrentRole] = useState({
    role: 'Co-founder',
    requiredSkills: [],
    preferredLocation: 'Remote',
    commitment: 'Full-time',
    equity: 'Negotiable',
    description: ''
  });
  const [skillInput, setSkillInput] = useState('');

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      const submitData = new FormData();
      
      // Append core fields
      submitData.append('title', formData.title);
      submitData.append('tagline', formData.tagline);
      submitData.append('problemStatement', formData.problemStatement);
      submitData.append('solution', formData.solution);
      submitData.append('targetMarket', formData.targetMarket);
      submitData.append('category', formData.category);
      submitData.append('stage', formData.stage);
      submitData.append('tags', JSON.stringify(formData.tags));
      submitData.append('demoUrl', formData.demoUrl);
      submitData.append('isPublished', 'true');
      
      // Append team needs if any
      if (formData.neededRoles.length > 0) {
        submitData.append('neededRoles', JSON.stringify(formData.neededRoles));
      }

      if (formData.logo instanceof File) submitData.append('logo', formData.logo);
      if (formData.coverImage instanceof File) submitData.append('coverImage', formData.coverImage);

      let response;
      if (project) {
        response = await projectService.updateProject(project._id, submitData);
      } else {
        response = await projectService.createProject(submitData);
      }
      
      if (response.success) {
        onSuccess();
      } else {
        alert(response.message || 'Failed to save project');
      }
    } catch (error) {
      console.error('Save project error:', error);
      if (error.response?.status === 401 || error.message?.includes('token')) {
        alert('Your session has expired. Please login again.');
        window.location.href = '/login';
        return;
      }
      alert(error.message || 'Failed to save project');
    } finally {
      setSubmitting(false);
    }
  };

  const handleFileUpload = (e, type) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('Please upload an image file');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      alert('File size must be less than 5MB');
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      if (type === 'logo') {
        setLogoPreview(reader.result);
        setFormData({ ...formData, logo: file });
      } else {
        setCoverPreview(reader.result);
        setFormData({ ...formData, coverImage: file });
      }
    };
    reader.readAsDataURL(file);
  };

  const addTag = () => {
    if (tagInput.trim() && !formData.tags.includes(tagInput.trim())) {
      setFormData({ ...formData, tags: [...formData.tags, tagInput.trim()] });
      setTagInput('');
    }
  };

  const removeTag = (tag) => {
    setFormData({ ...formData, tags: formData.tags.filter(t => t !== tag) });
  };

  const addSkillToRole = () => {
    if (skillInput.trim() && !currentRole.requiredSkills.includes(skillInput.trim())) {
      setCurrentRole({
        ...currentRole,
        requiredSkills: [...currentRole.requiredSkills, skillInput.trim()]
      });
      setSkillInput('');
    }
  };

  const removeSkillFromRole = (skill) => {
    setCurrentRole({
      ...currentRole,
      requiredSkills: currentRole.requiredSkills.filter(s => s !== skill)
    });
  };

  const addRole = () => {
    if (currentRole.role && currentRole.requiredSkills.length > 0) {
      setFormData({
        ...formData,
        neededRoles: [...formData.neededRoles, currentRole]
      });
      setCurrentRole({
        role: 'Co-founder',
        requiredSkills: [],
        preferredLocation: 'Remote',
        commitment: 'Full-time',
        equity: 'Negotiable',
        description: ''
      });
      setSkillInput('');
    }
  };

  const removeRole = (index) => {
    setFormData({
      ...formData,
      neededRoles: formData.neededRoles.filter((_, i) => i !== index)
    });
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div className="bg-white w-full sm:max-w-2xl sm:rounded-2xl rounded-t-3xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 p-4 flex items-center justify-between">
          <h2 className="text-xl font-bold text-gray-900">{project ? 'Edit Project' : 'Create Project'}</h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Progress */}
        <div className="px-4 py-3 bg-gray-50 border-b border-gray-200">
          <div className="flex items-center gap-2">
            {[1, 2, 3, 4].map(s => (
              <div key={s} className={`flex-1 h-2 rounded-full ${s <= step ? 'bg-teal-600' : 'bg-gray-200'}`} />
            ))}
          </div>
          <p className="text-sm text-gray-600 mt-2">Step {step} of 4</p>
        </div>

        {/* Form */}
        <div className="p-4 space-y-4">
          {step === 1 && (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Project Title *</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="e.g., Campus Food Delivery App"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                  maxLength={100}
                />
                <p className="text-xs text-gray-500 mt-1">{formData.title.length}/100 characters</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Tagline *</label>
                <input
                  type="text"
                  value={formData.tagline}
                  onChange={(e) => setFormData({ ...formData, tagline: e.target.value })}
                  placeholder="One sentence that captures your project"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                  maxLength={150}
                />
                <p className="text-xs text-gray-500 mt-1">{formData.tagline.length}/150 characters</p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Category *</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500"
                  >
                    <option value="Technology">Technology</option>
                    <option value="Health">Health</option>
                    <option value="Education">Education</option>
                    <option value="Agriculture">Agriculture</option>
                    <option value="Finance">Finance</option>
                    <option value="Social Impact">Social Impact</option>
                    <option value="Entertainment">Entertainment</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Stage *</label>
                  <select
                    value={formData.stage}
                    onChange={(e) => setFormData({ ...formData, stage: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500"
                  >
                    <option value="Idea">Idea</option>
                    <option value="Prototype">Prototype</option>
                    <option value="MVP">MVP</option>
                    <option value="Beta">Beta</option>
                    <option value="Launched">Launched</option>
                  </select>
                </div>
              </div>
            </>
          )}

          {step === 2 && (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Problem Statement *</label>
                <p className="text-xs text-gray-500 mb-2">What problem are you solving?</p>
                <textarea
                  value={formData.problemStatement}
                  onChange={(e) => setFormData({ ...formData, problemStatement: e.target.value })}
                  placeholder="Describe the pain point your target users face..."
                  rows={4}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent resize-none"
                  maxLength={1000}
                />
                <p className="text-xs text-gray-500 mt-1">{formData.problemStatement.length}/1000 characters</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Your Solution *</label>
                <p className="text-xs text-gray-500 mb-2">How does your project solve this problem?</p>
                <textarea
                  value={formData.solution}
                  onChange={(e) => setFormData({ ...formData, solution: e.target.value })}
                  placeholder="Explain your approach and what makes it unique..."
                  rows={4}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent resize-none"
                  maxLength={1000}
                />
                <p className="text-xs text-gray-500 mt-1">{formData.solution.length}/1000 characters</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Target Market *</label>
                <p className="text-xs text-gray-500 mb-2">Who is this for?</p>
                <textarea
                  value={formData.targetMarket}
                  onChange={(e) => setFormData({ ...formData, targetMarket: e.target.value })}
                  placeholder="e.g., University students in Nigeria, Small businesses in Lagos..."
                  rows={3}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent resize-none"
                  maxLength={500}
                />
                <p className="text-xs text-gray-500 mt-1">{formData.targetMarket.length}/500 characters</p>
              </div>
            </>
          )}

          {step === 3 && (
            <>
              {/* Logo and Cover Upload */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Project Logo</label>
                  <div className="relative">
                    {logoPreview ? (
                      <div className="relative w-full h-32 border-2 border-dashed border-gray-300 rounded-lg overflow-hidden">
                        <img src={logoPreview} alt="Logo preview" className="w-full h-full object-contain bg-gray-50" />
                        <button
                          type="button"
                          onClick={() => {
                            setLogoPreview(null);
                            setFormData({ ...formData, logo: null });
                          }}
                          className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      </div>
                    ) : (
                      <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-teal-500 transition-colors">
                        <svg className="w-8 h-8 text-gray-400 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        <p className="text-xs text-gray-500">Upload Logo</p>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => handleFileUpload(e, 'logo')}
                          className="hidden"
                        />
                      </label>
                    )}
                  </div>
                  <p className="text-xs text-gray-500 mt-1">Square image recommended</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Cover Image</label>
                  <div className="relative">
                    {coverPreview ? (
                      <div className="relative w-full h-32 border-2 border-dashed border-gray-300 rounded-lg overflow-hidden">
                        <img src={coverPreview} alt="Cover preview" className="w-full h-full object-cover" />
                        <button
                          type="button"
                          onClick={() => {
                            setCoverPreview(null);
                            setFormData({ ...formData, coverImage: null });
                          }}
                          className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      </div>
                    ) : (
                      <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-teal-500 transition-colors">
                        <svg className="w-8 h-8 text-gray-400 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        <p className="text-xs text-gray-500">Upload Cover</p>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => handleFileUpload(e, 'cover')}
                          className="hidden"
                        />
                      </label>
                    )}
                  </div>
                  <p className="text-xs text-gray-500 mt-1">16:9 ratio recommended</p>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Tags</label>
                <p className="text-xs text-gray-500 mb-2">Add relevant keywords (AI, Mobile, Web, etc.)</p>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                    placeholder="Type and press Enter"
                    className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500"
                  />
                  <button
                    type="button"
                    onClick={addTag}
                    className="px-6 py-3 bg-teal-600 text-white rounded-lg font-medium"
                  >
                    Add
                  </button>
                </div>
                <div className="flex flex-wrap gap-2 mt-3">
                  {formData.tags.map(tag => (
                    <span key={tag} className="px-3 py-1.5 bg-teal-100 text-teal-700 rounded-lg text-sm flex items-center gap-2">
                      #{tag}
                      <button onClick={() => removeTag(tag)} className="text-teal-600 hover:text-teal-800">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </span>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Demo URL (Optional)</label>
                <p className="text-xs text-gray-500 mb-2">Link to working demo or prototype</p>
                <input
                  type="url"
                  value={formData.demoUrl}
                  onChange={(e) => setFormData({ ...formData, demoUrl: e.target.value })}
                  placeholder="https://..."
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500"
                />
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex gap-3">
                  <svg className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                  </svg>
                  <div>
                    <h4 className="text-sm font-semibold text-blue-900 mb-1">Privacy Notice</h4>
                    <p className="text-xs text-blue-800">Your project will be public. We focus on <strong>what</strong> you're building and <strong>why it matters</strong>, not technical implementation. Keep your code private until you're ready to share.</p>
                  </div>
                </div>
              </div>
            </>
          )}

          {step === 4 && (
            <>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Team Needs (Optional)</label>
                    <p className="text-xs text-gray-500">Specify roles you're seeking for this project and the kind of person you're looking for</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={showTeamNeeds}
                      onChange={() => setShowTeamNeeds(!showTeamNeeds)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-teal-500 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-teal-600"></div>
                  </label>
                </div>

                {showTeamNeeds && (
                  <div className="space-y-6">
                    {/* Current Role Form */}
                    <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                      <div className="space-y-3">
                        <div>
                          <label className="block text-xs font-medium text-gray-700 mb-1">Role *</label>
                          <select
                            value={currentRole.role}
                            onChange={(e) => setCurrentRole({ ...currentRole, role: e.target.value })}
                            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500"
                          >
                            <option value="Co-founder">Co-founder</option>
                            <option value="Technical Co-founder">Technical Co-founder</option>
                            <option value="Designer">Designer (UI/UX)</option>
                            <option value="Frontend Developer">Frontend Developer</option>
                            <option value="Backend Developer">Backend Developer</option>
                            <option value="Full-Stack Developer">Full-Stack Developer</option>
                            <option value="Mobile Developer">Mobile Developer</option>
                            <option value="Product Manager">Product Manager</option>
                            <option value="Marketing Lead">Marketing Lead</option>
                            <option value="Business Development">Business Development</option>
                            <option value="Sales Lead">Sales Lead</option>
                            <option value="Data Scientist">Data Scientist</option>
                            <option value="Content Creator">Content Creator</option>
                            <option value="Other">Other</option>
                          </select>
                        </div>

                        <div>
                          <label className="block text-xs font-medium text-gray-700 mb-1">Required Skills *</label>
                          <div className="flex gap-2">
                            <input
                              type="text"
                              value={skillInput}
                              onChange={(e) => setSkillInput(e.target.value)}
                              onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addSkillToRole())}
                              placeholder="e.g., React, Figma, SEO"
                              className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500"
                            />
                            <button
                              type="button"
                              onClick={addSkillToRole}
                              className="px-4 py-2 bg-blue-600 text-white text-sm rounded-lg font-medium"
                            >
                              Add
                            </button>
                          </div>
                          <div className="flex flex-wrap gap-2 mt-2">
                            {currentRole.requiredSkills.map(skill => (
                              <span key={skill} className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-md flex items-center gap-1">
                                {skill}
                                <button onClick={() => removeSkillFromRole(skill)} className="text-blue-600 hover:text-blue-800">
                                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                  </svg>
                                </button>
                              </span>
                            ))}
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label className="block text-xs font-medium text-gray-700 mb-1">Location</label>
                            <input
                              type="text"
                              value={currentRole.preferredLocation}
                              onChange={(e) => setCurrentRole({ ...currentRole, preferredLocation: e.target.value })}
                              placeholder="e.g., NYC or Remote"
                              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500"
                            />
                          </div>

                          <div>
                            <label className="block text-xs font-medium text-gray-700 mb-1">Commitment</label>
                            <select
                              value={currentRole.commitment}
                              onChange={(e) => setCurrentRole({ ...currentRole, commitment: e.target.value })}
                              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500"
                            >
                              <option value="Full-time">Full-time</option>
                              <option value="Part-time">Part-time</option>
                              <option value="Flexible">Flexible</option>
                              <option value="Contract">Contract</option>
                            </select>
                          </div>
                        </div>

                        <div>
                          <label className="block text-xs font-medium text-gray-700 mb-1">Equity Offer</label>
                          <input
                            type="text"
                            value={currentRole.equity}
                            onChange={(e) => setCurrentRole({ ...currentRole, equity: e.target.value })}
                            placeholder="e.g., 1-5%, Negotiable"
                            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500"
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-medium text-gray-700 mb-1">Role Description (Recommended for smarter ai match)</label>
                          <textarea
                            value={currentRole.description}
                            onChange={(e) => setCurrentRole({ ...currentRole, description: e.target.value })}
                            placeholder="Describe the kind of person you're looking for, e.g., 'Passionate about sustainability, with startup experience'"
                            rows={3}
                            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 resize-none"
                            maxLength={500}
                          />
                          <p className="text-xs text-gray-500 mt-1">{currentRole.description.length}/500 characters</p>
                        </div>

                        <button
                          type="button"
                          onClick={addRole}
                          className="w-full py-2 bg-blue-600 text-white text-sm rounded-lg font-medium disabled:opacity-50"
                          disabled={currentRole.requiredSkills.length === 0}
                        >
                          Add Role
                        </button>
                      </div>
                    </div>

                    {/* Added Roles List */}
                    {formData.neededRoles.length > 0 && (
                      <div className="space-y-3">
                        <p className="text-sm font-medium text-gray-700">Added Roles ({formData.neededRoles.length})</p>
                        {formData.neededRoles.map((role, index) => (
                          <div key={index} className="p-3 bg-white border border-gray-200 rounded-lg flex items-start justify-between">
                            <div>
                              <p className="text-sm font-semibold text-gray-900">{role.role}</p>
                              <p className="text-xs text-gray-600 mt-1">Skills: {role.requiredSkills.join(', ')}</p>
                              <p className="text-xs text-gray-500 mt-1">Location: {role.preferredLocation}</p>
                              <p className="text-xs text-gray-500 mt-1">Commitment: {role.commitment}</p>
                              <p className="text-xs text-gray-500 mt-1">Equity: {role.equity}</p>
                              {role.description && <p className="text-xs text-gray-600 mt-1">Description: {role.description}</p>}
                            </div>
                            <button
                              onClick={() => removeRole(index)}
                              className="p-1 text-red-600 hover:text-red-800"
                            >
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                              </svg>
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </>
          )}
        </div>

        {/* Footer Actions */}
        <div className="sticky bottom-0 bg-white border-t border-gray-200 p-4 flex gap-3">
          {step > 1 && (
            <button
              onClick={() => setStep(step - 1)}
              className="flex-1 py-3 border border-gray-300 text-gray-700 rounded-lg font-medium"
            >
              Back
            </button>
          )}
          {step < 4 ? (
            <button
              onClick={() => setStep(step + 1)}
              disabled={
                (step === 1 && (!formData.title || !formData.tagline)) ||
                (step === 2 && (!formData.problemStatement || !formData.solution || !formData.targetMarket))
              }
              className="flex-1 py-3 bg-teal-600 text-white rounded-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              disabled={submitting}
              className="flex-1 py-3 bg-gradient-to-r from-teal-600 to-blue-600 text-white rounded-lg font-medium disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {submitting ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                  {project ? 'Updating...' : 'Publishing...'}
                </>
              ) : (
                <>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  {project ? 'Update Project' : 'Publish Project'}
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProjectsPage;