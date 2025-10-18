'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation'; // Changed from next/router to next/navigation
import { useUser } from '@/context/AuthContext';
import projectService from '@/utils/project';


const ProjectDetailPage = () => {
  const params = useParams();
  const router = useRouter(); 
  const { id } = params; 
  const { user } = useUser();

  const [project, setProject] = useState(null);
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [commentText, setCommentText] = useState('');
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [submittingComment, setSubmittingComment] = useState(false);
  const [showInterestModal, setShowInterestModal] = useState(false);

  useEffect(() => {
    if (id) {
      fetchProject();
      fetchComments();
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

  const fetchComments = async () => {
    try {
      const response = await projectService.getComments(id);
      
      if (response.success) {
        setComments(response.data.comments);
      }
    } catch (error) {
      console.error('Fetch comments error:', error);
    }
  };

  const handleUpvote = async () => {
    if (!user) {
      router.push('/login');
      return;
    }

    const previousState = { ...project };
    setProject({
      ...project,
      hasUpvoted: !project.hasUpvoted,
      upvoteCount: project.hasUpvoted ? project.upvoteCount - 1 : project.upvoteCount + 1
    });

    try {
      await projectService.toggleUpvote(id);
    } catch (error) {
      setProject(previousState);
      console.error('Upvote error:', error);
      if (error.response?.status === 401 || error.message?.includes('token')) {
        router.push('/login');
      }
    }
  };

  const handleExpressInterest = async (message = '') => {
    if (!user) {
      router.push('/login');
      return;
    }

    try {
      const response = await projectService.expressInterest(id, message);
      
      if (response.success) {
        setProject({
          ...project,
          hasExpressedInterest: true,
          interestCount: response.data.interestCount
        });
        setShowInterestModal(false);
      }
    } catch (error) {
      console.error('Express interest error:', error);
      if (error.response?.status === 401 || error.message?.includes('token')) {
        router.push('/login');
        return;
      }
      alert(error.message || 'Failed to express interest');
    }
  };

  const handleSubmitComment = async () => {
    if (!user) {
      router.push('/login');
      return;
    }

    if (!commentText.trim()) return;

    setSubmittingComment(true);
    try {
      const response = await projectService.addComment(id, commentText, isAnonymous);
      
      if (response.success) {
        setComments([response.data, ...comments]);
        setCommentText('');
        setIsAnonymous(false);
        setProject({ ...project, commentCount: project.commentCount + 1 });
      }
    } catch (error) {
      console.error('Submit comment error:', error);
      if (error.response?.status === 401 || error.message?.includes('token')) {
        router.push('/login');
        return;
      }
      alert(error.message || 'Failed to post comment');
    } finally {
      setSubmittingComment(false);
    }
  };

  const handleLikeComment = async (commentId) => {
    if (!user) {
      router.push('/login');
      return;
    }

    setComments(comments.map(c => {
      if (c._id === commentId) {
        const hasLiked = c.likes?.includes(user._id);
        return {
          ...c,
          likeCount: hasLiked ? c.likeCount - 1 : c.likeCount + 1,
          likes: hasLiked 
            ? c.likes.filter(id => id !== user._id)
            : [...(c.likes || []), user._id]
        };
      }
      return c;
    }));

    try {
      await projectService.toggleCommentLike(id, commentId);
    } catch (error) {
      console.error('Like comment error:', error);
      if (error.response?.status === 401 || error.message?.includes('token')) {
        router.push('/login');
      }
    }
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
  
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="sticky top-0 z-40 bg-white border-b border-gray-200 shadow-sm">
        <div className="px-4 py-3 flex items-center gap-3">
          <button onClick={() => router.back()} className="p-2 hover:bg-gray-100 rounded-lg">
            <svg className="w-6 h-6 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <div className="flex-1">
            <h1 className="text-lg font-bold text-gray-900 truncate">{project.title}</h1>
          </div>
          <button className="p-2 hover:bg-gray-100 rounded-lg">
            <svg className="w-6 h-6 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
            </svg>
          </button>
        </div>
      </div>

      <div className="max-w-4xl mx-auto pb-24">
        {/* Cover Image with Logo */}
        {project.coverImage && (
          <div className="relative h-64 bg-gradient-to-br from-teal-100 to-blue-100">
            <img src={project.coverImage} alt={project.title} className="w-full h-full object-cover" />
            {project.logo && (
              <div className="absolute bottom-4 left-4 w-20 h-20 bg-white rounded-2xl shadow-xl p-3 border-2 border-white">
                <img src={project.logo} alt={`${project.title} logo`} className="w-full h-full object-contain" />
              </div>
            )}
          </div>
        )}

        {/* Main Content */}
        <div className="px-4 py-6 space-y-6">
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
                    <div key={idx} className="flex items-center gap-2">
                      <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center text-xs font-semibold text-gray-700">
                        {member.user.initials}
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900">{member.user.fullName}</p>
                        <p className="text-xs text-gray-500">{member.role || member.expertise}</p>
                      </div>
                    </div>
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

          {/* Comments Section */}
          <div className="bg-white rounded-2xl p-4 border border-gray-200">
            <h3 className="text-lg font-bold text-gray-900 mb-4">
              Comments ({project.commentCount})
            </h3>

            {/* Comment Input */}
            {user ? (
              <div className="mb-6">
                <textarea
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  placeholder="Share your thoughts..."
                  rows={3}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-transparent resize-none"
                  maxLength={1000}
                />
                <div className="flex items-center justify-between mt-2">
                  <label className="flex items-center gap-2 text-sm text-gray-600">
                    <input
                      type="checkbox"
                      checked={isAnonymous}
                      onChange={(e) => setIsAnonymous(e.target.checked)}
                      className="w-4 h-4 text-teal-600 border-gray-300 rounded focus:ring-teal-500"
                    />
                    Comment anonymously
                  </label>
                  <button
                    onClick={handleSubmitComment}
                    disabled={!commentText.trim() || submittingComment}
                    className="px-6 py-2 bg-teal-600 text-white rounded-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:bg-teal-700 transition-colors"
                  >
                    {submittingComment ? 'Posting...' : 'Post'}
                  </button>
                </div>
              </div>
            ) : (
              <div className="mb-6 p-4 bg-gray-50 rounded-xl text-center">
                <p className="text-gray-600 mb-2">Sign in to join the conversation</p>
                <button
                  onClick={() => router.push('/login')}
                  className="text-teal-600 font-semibold hover:text-teal-700"
                >
                  Sign In →
                </button>
              </div>
            )}

            {/* Comments List */}
            <div className="space-y-4">
              {comments.length === 0 ? (
                <div className="text-center py-8">
                  <svg className="mx-auto h-12 w-12 text-gray-300 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                  <p className="text-gray-500">No comments yet. Be the first to share your thoughts!</p>
                </div>
              ) : (
                comments.map((comment) => (
                  <div key={comment._id} className="border-b border-gray-100 pb-4 last:border-0">
                    <div className="flex items-start gap-3">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-semibold ${
                        comment.isAnonymous 
                          ? 'bg-gray-300 text-gray-600' 
                          : 'bg-gradient-to-br from-purple-400 to-pink-500 text-white'
                      }`}>
                        {comment.author.initials}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-semibold text-gray-900">{comment.author.fullName}</span>
                          {comment.isAnonymous && (
                            <span className="px-2 py-0.5 bg-gray-100 text-gray-600 text-xs rounded">Anonymous</span>
                          )}
                          <span className="text-xs text-gray-500">
                            {new Date(comment.createdAt).toLocaleDateString('en-US', { 
                              month: 'short', 
                              day: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </span>
                        </div>
                        {!comment.isAnonymous && comment.author.school && (
                          <p className="text-xs text-gray-500 mb-2">{comment.author.school}</p>
                        )}
                        <p className="text-gray-700 text-sm leading-relaxed">{comment.content}</p>
                        
                        {/* Comment Actions */}
                        <div className="flex items-center gap-4 mt-2">
                          <button
                            onClick={() => handleLikeComment(comment._id)}
                            className={`flex items-center gap-1 text-xs ${
                              comment.likes?.includes(user?._id)
                                ? 'text-red-500 font-semibold'
                                : 'text-gray-500 hover:text-red-500'
                            }`}
                          >
                            <svg className="w-4 h-4" fill={comment.likes?.includes(user?._id) ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                            </svg>
                            {comment.likeCount > 0 && <span>{comment.likeCount}</span>}
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Action Bar - Sticky */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4 shadow-lg z-50">
        <div className="max-w-4xl mx-auto flex gap-3">
          <button
            onClick={handleUpvote}
            className={`flex-1 py-3 rounded-xl font-semibold transition-all ${
              project.hasUpvoted
                ? 'bg-red-50 text-red-600 border-2 border-red-300'
                : 'bg-gray-100 text-gray-700 border-2 border-gray-200 hover:bg-gray-200'
            }`}
          >
            <span className="flex items-center justify-center gap-2">
              <svg className="w-5 h-5" fill={project.hasUpvoted ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
              {project.hasUpvoted ? 'Loved' : 'Love'} {project.upvoteCount}
            </span>
          </button>
          
          {!project.hasExpressedInterest ? (
            <button
              onClick={() => setShowInterestModal(true)}
              className="flex-1 py-3 bg-gradient-to-r from-teal-600 to-blue-600 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transition-shadow"
            >
              <span className="flex items-center justify-center gap-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                I'm Interested
              </span>
            </button>
          ) : (
            <div className="flex-1 py-3 bg-green-100 text-green-700 rounded-xl font-semibold text-center border-2 border-green-300">
              <span className="flex items-center justify-center gap-2">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                Interest Expressed
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Interest Modal */}
      {showInterestModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-end sm:items-center justify-center">
          <div className="bg-white w-full sm:max-w-lg sm:rounded-2xl rounded-t-3xl overflow-hidden">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold text-gray-900">Express Interest</h3>
                <button onClick={() => setShowInterestModal(false)} className="p-2 hover:bg-gray-100 rounded-lg">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              
              <div className="bg-teal-50 border border-teal-200 rounded-lg p-4 mb-4">
                <p className="text-sm text-teal-800">
                  Your interest will be shared with the project creator. They may reach out to discuss collaboration or investment opportunities.
                </p>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setShowInterestModal(false)}
                  className="flex-1 py-3 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleExpressInterest()}
                  className="flex-1 py-3 bg-gradient-to-r from-teal-600 to-blue-600 text-white rounded-lg font-medium hover:shadow-lg transition-shadow"
                >
                  Confirm Interest
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProjectDetailPage;