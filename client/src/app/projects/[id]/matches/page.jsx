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

  useEffect(() => {
    if (loading) return;
    if (!user) router.push('/login');

    const load = async () => {
      try {
        setFetching(true);
        const [projRes, matchRes] = await Promise.all([
          projectService.getProject(id),
          projectService.getProjectMatches(id)
        ]);

        if (projRes.success) setProject(projRes.data.project);
        if (matchRes.success) setMatches(matchRes.data.matches || []);
      } catch (err) {
        console.error(err);
      } finally {
        setFetching(false);
      }
    };
    load();
  }, [id, user, loading, router]);

  if (fetching) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-teal-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <Sidebar activeTab="notifications" />
      <div className="md:ml-64">
        <Header />
        <div className="max-w-4xl mx-auto px-4 py-6">
          <button
            onClick={() => router.back()}
            className="mb-6 flex items-center gap-2 text-teal-600 hover:text-teal-700"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to Project
          </button>

          <div className="bg-white border border-gray-200 rounded-xl p-6">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              Matches for {project?.title || 'Project'}
            </h1>
            <p className="text-gray-600 mb-6">
              {matches.length} collaborator{matches.length !== 1 ? 's' : ''} matched
            </p>

            {matches.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-600">No matches yet. Try updating your needed roles.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {matches.map((match) => (
                  <div key={match.userId} className="border border-gray-200 rounded-lg p-4 hover:border-teal-400 transition-colors">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-3">
                        <div className="w-12 h-12 bg-teal-600 rounded-full flex items-center justify-center text-white font-bold">
                          {match.userName?.[0] || 'U'}
                        </div>
                        <div>
                          <h3 className="font-semibold text-gray-900">{match.userName}</h3>
                          <p className="text-sm text-teal-600">Score: {match.score}%</p>
                          <p className="text-sm text-gray-600 mt-1">{match.explanation}</p>
                        </div>
                      </div>
                      <button
                        onClick={() => router.push(`/profile/${match.userId}`)}
                        className="px-4 py-2 bg-teal-600 text-white rounded-lg text-sm hover:bg-teal-700"
                      >
                        View Profile
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}