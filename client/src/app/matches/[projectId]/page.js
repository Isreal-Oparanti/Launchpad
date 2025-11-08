'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useUser } from '@/context/AuthContext';
import Sidebar from '@/components/Sidebar';
import Header from '@/components/Header';

export default function MatchesPage() {
  const router = useRouter();
  const params = useParams();
  const { user, loading } = useUser();
  const projectId = params.projectId;
  
  const [matches, setMatches] = useState([]);
  const [fetching, setFetching] = useState(true);
  const [activeTab, setActiveTab] = useState('matches');
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    if (loading) return;
    if (!user) router.push('/login');
    
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);
    handleResize();

    const fetchMatches = async () => {
      try {
        setFetching(true);
        const response = await fetch(`${process.env.BASE_URL}/matches/${projectId}`, {
          credentials: 'include',
        });
        const data = await response.json();
        if (data.success) setMatches(data.data.matches || []);
      } catch (error) {
        console.error('Fetch matches error:', error);
      } finally {
        setFetching(false);
      }
    };
    fetchMatches();

    return () => window.removeEventListener('resize', handleResize);
  }, [user, loading, router, projectId]);

  if (fetching) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-teal-50">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-teal-600"></div>
      </div>
    );
  }

  // Mobile modal wrapper
  const renderContent = () => (
    <div className={`min-h-screen bg-gradient-to-b from-teal-50 to-white ${isMobile ? 'fixed inset-0 z-50' : ''}`}>
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />
      <div className={`${isMobile ? 'ml-0 pt-0' : 'md:ml-64 md:pt-0'}`}>
        <Header />
        <div className="container mx-auto px-4 py-8">
          {/* Header with Back Button */}
          <div className="flex items-center gap-4 mb-6">
            <button
              onClick={() => router.back()}  // Back to notifications
              className="flex items-center gap-2 text-teal-600 hover:text-teal-700 text-sm font-medium"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Back to Notifications
            </button>
            <h1 className="text-2xl font-bold text-teal-900 flex-1">Project Matches</h1>
            {isMobile && (
              <button
                onClick={() => router.back()}
                className="text-teal-600 hover:text-teal-700"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>
          
          {/* Matches List */}
          <div className="space-y-4">
            {matches.length === 0 ? (
              <div className="text-center py-12 bg-white rounded-2xl shadow-sm border border-teal-100">
                <svg className="w-16 h-16 mx-auto text-teal-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <h3 className="text-xl font-semibold text-teal-900 mb-2">No Matches Yet</h3>
                <p className="text-teal-600 mb-4">Our AI is still searching. Try broadening your role requirements!</p>
                <button
                  onClick={() => router.back()}
                  className="bg-teal-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-teal-700 transition-colors"
                >
                  Back to Notifications
                </button>
              </div>
            ) : (
              matches.map((match, idx) => (
                <div key={idx} className="bg-white rounded-2xl shadow-sm border border-teal-100 p-6 hover:shadow-md transition-shadow">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-teal-400 to-blue-500 rounded-full flex items-center justify-center text-white text-lg font-bold flex-shrink-0">
                      {match.userName.charAt(0).toUpperCase()}
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg font-bold text-teal-900 mb-1">{match.userName}</h3>
                      <p className="text-sm text-teal-600 mb-2">{match.role} • Score: {match.score}/10</p>
                      <p className="text-teal-700 text-sm mb-4 leading-relaxed">{match.explanation}</p>
                      {match.agentReasoning && (
                        <p className="text-xs text-teal-500 italic mb-4">AI Insight: {match.agentReasoning}</p>
                      )}
                      <div className="flex gap-3">
                        <button
                          onClick={() => router.push(`/profile/${match.userId}`)}
                          className="flex-1 bg-teal-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-teal-700 transition-colors flex items-center justify-center gap-2"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                          </svg>
                          View Profile & Message
                        </button>
                        <button
                          className="px-4 py-2 text-teal-600 border border-teal-600 rounded-lg font-medium hover:bg-teal-50 transition-colors"
                        >
                          Add to Team
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
  );

  return renderContent();
}