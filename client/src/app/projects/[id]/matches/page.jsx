'use client';

import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useUser } from '@/context/AuthContext';
import projectService from '@/utils/project';
import Header from '@/components/Header';
import Sidebar from '@/components/Sidebar';

export default function ProjectMatches() {
  const { id } = useParams();
  const router = useRouter();
  const { user, loading } = useUser();
  const [matches, setMatches] = useState([]);
  const [project, setProject] = useState(null);
  const [fetching, setFetching] = useState(true);
  const [expandedExplanations, setExpandedExplanations] = useState({});

  useEffect(() => {
    if (loading) return;
    if (!user) {
      router.push('/login');
      return;
    }

    loadMatches();
  }, [id, user, loading, router]);

  const loadMatches = async () => {
    try {
      setFetching(true);
      
      const [projectRes, matchesRes] = await Promise.all([
        projectService.getProject(id),
        projectService.getProjectMatches(id)
      ]);

      if (projectRes.success) {
        setProject(projectRes.data.project);
      }

      if (matchesRes.success) {
        setMatches(matchesRes.data.matches || []);
      }
    } catch (err) {
      console.error('Failed to load matches:', err);
    } finally {
      setFetching(false);
    }
  };

  const toggleExplanation = (matchId) => {
    setExpandedExplanations(prev => ({
      ...prev,
      [matchId]: !prev[matchId]
    }));
  };

  const truncateExplanation = (text, maxLength = 120) => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  };

  if (fetching) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-teal-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <Sidebar activeTab="projects" />
      <div className="md:ml-64">
        <Header />
        <div className="max-w-4xl mx-auto px-4 py-6">
          {/* Back Button */}
          <button
            onClick={() => router.push(`/notifications`)}
            className="mb-6 flex items-center gap-2 text-teal-600 hover:text-teal-700 font-medium"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to Notifications
          </button>

          {/* Header */}
          <div className="bg-white border border-gray-200 rounded-xl p-4 md:p-6 mb-6">
            <h1 className="text-xl md:text-2xl font-bold text-gray-900 mb-2">
              Collaboration Matches
            </h1>
            <p className="text-gray-600 mb-3 md:mb-4 text-sm md:text-base">
              {project?.title || 'Your Project'}
            </p>
            
            <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 text-sm">
              <span className="bg-teal-100 text-teal-800 px-3 py-1 rounded-full w-fit">
                {matches.length} potential collaborator{matches.length !== 1 ? 's' : ''}
              </span>
              <span className="text-gray-500 text-xs sm:text-sm">
                Matched automatically when project was created
              </span>
            </div>
          </div>

          {/* Matches List */}
          {matches.length === 0 ? (
            <div className="text-center py-12 bg-white border border-gray-200 rounded-xl">
              <svg className="w-16 h-16 mx-auto text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2 2.5 0 015 0z" />
              </svg>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No matches yet</h3>
              <p className="text-gray-600 mb-4 px-4">
                Try updating your project description or required skills to attract more collaborators.
              </p>
              <button
                onClick={() => router.push(`/projects/${id}/edit`)}
                className="px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 text-sm"
              >
                Edit Project
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {matches.map((match, index) => {
                const isExpanded = expandedExplanations[match.userId || index];
                const explanation = match.explanation || '';
                const shouldTruncate = explanation.length > 120;
                const displayExplanation = isExpanded || !shouldTruncate ? explanation : truncateExplanation(explanation);

                return (
                  <div key={match.userId || index} className="bg-white border border-gray-200 rounded-xl p-4 md:p-6 hover:border-teal-300 transition-colors">
                    <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                      <div className="flex items-start gap-3 md:gap-4 flex-1">
                        {/* Avatar */}
                        <div className="flex-shrink-0">
                          {match.profilePicture ? (
                            <img 
                              src={match.profilePicture} 
                              alt={match.userName}
                              className="w-10 h-10 md:w-12 md:h-12 rounded-full object-cover"
                            />
                          ) : (
                            <div className="w-10 h-10 md:w-12 md:h-12 bg-teal-600 rounded-full flex items-center justify-center text-white font-bold text-sm md:text-lg">
                              {match.userName?.[0]?.toUpperCase() || 'U'}
                            </div>
                          )}
                        </div>

                        {/* Match Info */}
                        <div className="flex-1 min-w-0">
                          <div className="flex flex-col sm:flex-row sm:items-center gap-2 mb-2">
                            <h3 className="font-semibold text-gray-900 text-base md:text-lg">
                              {match.userName}
                            </h3>
                            <div className="flex flex-wrap gap-2">
                              <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
                                {match.role}
                              </span>
                              <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">
                                {match.score}% match
                              </span>
                            </div>
                          </div>

                          {/* Explanation with toggle */}
                          <div className="mb-3">
                            <p className="text-gray-700 text-sm md:text-base leading-relaxed">
                              {displayExplanation}
                            </p>
                            {shouldTruncate && (
                              <button
                                onClick={() => toggleExplanation(match.userId || index)}
                                className="text-teal-600 hover:text-teal-700 text-sm font-medium mt-1"
                              >
                                {isExpanded ? 'Show less' : 'Read more'}
                              </button>
                            )}
                          </div>

                          {/* Details */}
                          <div className="flex flex-col sm:flex-row sm:flex-wrap gap-2 md:gap-4 text-xs md:text-sm text-gray-600">
                            {match.currentPosition && (
                              <span className="flex items-center gap-1">
                                <svg className="w-3 h-3 md:w-4 md:h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                </svg>
                                <span className="truncate">{match.currentPosition}</span>
                              </span>
                            )}
                            {match.location && (
                              <span className="flex items-center gap-1">
                                <svg className="w-3 h-3 md:w-4 md:h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                </svg>
                                <span className="truncate">{match.location}</span>
                              </span>
                            )}
                            {match.skills && match.skills.length > 0 && (
                              <span className="flex items-center gap-1">
                                <svg className="w-3 h-3 md:w-4 md:h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                                </svg>
                                <span className="truncate">
                                  {match.skills.slice(0, 2).join(', ')}
                                  {match.skills.length > 2 && ` +${match.skills.length - 2} more`}
                                </span>
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Actions - Single View Profile Button */}
                      <div className="flex md:flex-col gap-2 md:ml-4 md:mt-0 mt-3">
                        <button
                          onClick={() => router.push(`/profile/${match.userId}`)}
                          className="flex-1 md:flex-none px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors text-sm font-medium flex items-center justify-center gap-2"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                          </svg>
                          View Profile
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}