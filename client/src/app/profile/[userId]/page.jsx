'use client';

import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useUser } from '@/context/AuthContext';
import Header from '@/components/Header';
import Sidebar from '@/components/Sidebar';
import { authService } from '@/utils/auth';

const UserProfilePage = () => {
  const { userId } = useParams();
  const router = useRouter();
  const { user: currentUser } = useUser();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [userProjects, setUserProjects] = useState([]);
  const [activeTabs, setActiveTabs] = useState('profile');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        setLoading(true);
        
        // Use authService to fetch user profile
        const userResponse = await authService.getUserProfile(userId);
        setUser(userResponse.user);
        
        // Use authService to fetch user's projects
        const projectsResponse = await authService.getUserProjects(userId);
        setUserProjects(projectsResponse.projects || []);
        
      } catch (error) {
        console.error('Error fetching user profile:', error);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    if (userId) {
      fetchUserProfile();
    }
  }, [userId]);

  if (loading) {
      return (
        <div className="min-h-screen bg-white">
          <Sidebar activeTab="profile" />
          <div className="md:ml-64">
            <Header />
            <div className="flex items-center justify-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-4 border-teal-600 border-t-transparent"></div>
            </div>
          </div>
        </div>
      );
    }
  if (!user) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">User Not Found</h1>
          <p className="text-gray-600 mb-4">The user profile you're looking for doesn't exist.</p>
          <button
            onClick={() => router.back()}
            className="bg-teal-600 text-white px-6 py-2 rounded-lg hover:bg-teal-700"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  const isOwnProfile = currentUser && currentUser.id === userId;

  return (
    <div className="min-h-screen bg-white">
      <Sidebar
        activeTab={activeTabs}
        setActiveTab={setActiveTabs}
        mobileMenuOpen={mobileMenuOpen}
        setMobileMenuOpen={setMobileMenuOpen}
      />
      <div className="md:ml-64">
        <Header
          onMenuToggle={() => setMobileMenuOpen(!mobileMenuOpen)}
          mobileMenuOpen={mobileMenuOpen}
        />
        
        <div className="max-w-4xl mx-auto px-4 py-6 pb-24 md:pb-8">
          {/* Back Button */}
          <button
            onClick={() => router.back()}
            className="mb-6 flex items-center gap-2 text-teal-600 hover:text-teal-700"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back
          </button>

          {/* Profile Header */}
          <div className="bg-white border border-gray-200 rounded-xl p-6 mb-4">
            <div className="flex items-start gap-4 mb-6">
              {/* Profile Picture */}
              <div className="shrink-0">
                <div className="w-20 h-20 bg-teal-600 rounded-full flex items-center justify-center text-white text-2xl font-bold overflow-hidden">
                  {user.profilePicture ? (
                    <img 
                      src={user.profilePicture} 
                      alt={user.fullName}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span>{user.initials}</span>
                  )}
                </div>
              </div>

              {/* Profile Info */}
              <div className="flex-1 min-w-0">
                <h1 className="text-xl font-bold text-gray-900 mb-1 truncate">{user.fullName}</h1>
                <p className="text-teal-600 text-sm mb-2">@{user.username}</p>
                {user.title && (
                  <p className="text-sm text-gray-600 mb-2">{user.title}</p>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex gap-2 shrink-0">
                {!isOwnProfile && (
                  <>
                    <button className="px-4 py-2 bg-teal-600 text-white rounded-lg text-sm font-medium hover:bg-teal-700">
                      Connect
                    </button>
                    <button 
                      onClick={() => router.push(`/message/${user.id}`)}
                      className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-50"
                    >
                      Message
                    </button>
                  </>
                )}
              </div>
            </div>

            {/* Bio */}
            <div className="mb-6">
              <p className="text-gray-700 text-sm leading-relaxed">
                {user.bio || `${user.fullName} hasn't added a bio yet.`}
              </p>
            </div>

            {/* Details Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <InfoItem 
                icon={<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2-2v2m8 0V6a2 2 0 012 2v6a2 2 0 01-2 2H8a2 2 0 01-2-2V8a2 2 0 012-2V6" /></svg>}
                label="Role/Title"
                value={user.title || 'Not specified'}
              />
              
              <InfoItem 
                icon={<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>}
                label="Location"
                value={user.location || 'Not specified'}
              />
            </div>

            {/* Social Links */}
            {(user.website || user.linkedinUrl || user.githubUrl || user.twitterUrl) && (
              <div className="mb-6">
                <div className="flex flex-wrap gap-3">
                  {user.website && <SocialLink href={user.website} platform="website" label="Website" />}
                  {user.linkedinUrl && <SocialLink href={user.linkedinUrl} platform="linkedin" label="LinkedIn" />}
                  {user.githubUrl && <SocialLink href={user.githubUrl} platform="github" label="GitHub" />}
                  {user.twitterUrl && <SocialLink href={user.twitterUrl} platform="twitter" label="Twitter" />}
                </div>
              </div>
            )}

            {/* Skills & Expertise */}
            <div className="space-y-4">
              <TagSection
                title="Expertise"
                items={user.expertise || []}
                color="teal"
              />
              
              <TagSection
                title="Skills"
                items={user.skills || []}
                color="blue"
              />
              
              <TagSection
                title="Interests"
                items={user.interests || []}
                color="purple"
              />
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-4 mt-6 pt-6 border-t border-gray-200">
              <StatCard label="Projects" value={userProjects.length} />
              <StatCard label="Connections" value={user.connections || 0} />
              <StatCard label="Collaborations" value={user.collaborations || 0} />
            </div>
          </div>

          {/* Projects Section */}
          <div className="bg-white border border-gray-200 rounded-xl p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4">
              Projects ({userProjects.length})
            </h3>
            {userProjects.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-600">No projects yet.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {userProjects.map((project) => (
                  <ProjectCard 
                    key={project.id} 
                    project={project} 
                    onClick={() => router.push(`/projects/${project.id}`)} 
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// Helper Components
const InfoItem = ({ icon, label, value }) => (
  <div className="flex items-start gap-2">
    <div className="text-gray-400 mt-0.5">{icon}</div>
    <div className="flex-1 min-w-0">
      <p className="text-xs text-gray-500">{label}</p>
      <p className="text-sm text-gray-900 truncate">{value}</p>
    </div>
  </div>
);

const SocialLink = ({ href, platform, label }) => {
  const getIcon = (platform) => {
    switch (platform) {
      case 'website':
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
          </svg>
        );
      case 'linkedin':
        return (
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
            <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/>
          </svg>
        );
      case 'github':
        return (
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
          </svg>
        );
      case 'twitter':
        return (
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
            <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/>
          </svg>
        );
      default:
        return null;
    }
  };

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex items-center gap-2 px-3 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm text-gray-700 transition-colors"
    >
      {getIcon(platform)}
      <span>{label}</span>
    </a>
  );
};

const TagSection = ({ title, items, color }) => {
  const colorClasses = {
    teal: 'bg-teal-50 text-teal-700 border-teal-200',
    blue: 'bg-blue-50 text-blue-700 border-blue-200',
    purple: 'bg-purple-50 text-purple-700 border-purple-200'
  };

  return (
    <div>
      <h4 className="text-sm font-semibold text-gray-700 mb-2">{title}</h4>
      {items.length > 0 ? (
        <div className="flex flex-wrap gap-2">
          {items.map((item, idx) => (
            <span key={idx} className={`px-3 py-1 rounded-full text-xs border ${colorClasses[color]}`}>
              {item}
            </span>
          ))}
        </div>
      ) : (
        <p className="text-sm text-gray-400">Not specified</p>
      )}
    </div>
  );
};

const StatCard = ({ label, value }) => (
  <div className="text-center">
    <div className="text-2xl font-bold text-gray-900">{value}</div>
    <div className="text-xs text-gray-600">{label}</div>
  </div>
);

const ProjectCard = ({ project, onClick }) => (
  <div 
    onClick={onClick}
    className="border border-gray-200 rounded-lg p-4 hover:border-teal-400 hover:shadow-md transition-all cursor-pointer"
  >
    <div className="flex items-start justify-between mb-2">
      <h4 className="font-semibold text-gray-900 text-sm">{project.title}</h4>
      <span className="px-2 py-1 bg-teal-50 text-teal-700 text-xs rounded-full shrink-0 ml-2">
        {project.stage}
      </span>
    </div>
    <p className="text-sm text-gray-600 mb-3 line-clamp-2">{project.description}</p>
    <div className="flex items-center gap-4 text-xs text-gray-500">
      <span className="flex items-center gap-1">
        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path d="M2 10.5a1.5 1.5 0 113 0v6a1.5 1.5 0 01-3 0v-6zM6 10.333v5.43a2 2 0 001.106 1.79l.05.025A4 4 0 008.943 18h5.416a2 2 0 001.962-1.608l1.2-6A2 2 0 0015.56 8H12V4a2 2 0 00-2-2 1 1 0 00-1 1v.667a4 4 0 01-.8 2.4L6.8 7.933a4 4 0 00-.8 2.4z" /></svg>
        {project.upvotes || 0}
      </span>
      <span className="flex items-center gap-1">
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg>
        {project.comments || 0}
      </span>
    </div>
  </div>
);

export default UserProfilePage;