'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useUser } from '@/context/AuthContext';
import { authService } from '@/utils/auth';
import Sidebar from '@/components/Sidebar';
import Header from '@/components/Header';

const ProfilePage = () => {
  const router = useRouter();
  const { user, updateUser } = useUser();
  
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [activeTab, setActiveTab] = useState('projects');
  const [activeSidebarTab, setActiveSidebarTab] = useState('profile');
  const [formData, setFormData] = useState({
    fullName: '',
    username: '',
    email: '',
    school: '',
    major: '',
    bio: '',
    profilePicture: ''
  });

  // Sample data for projects and activity
  const [userProjects, setUserProjects] = useState([]);
  const [recentActivity, setRecentActivity] = useState([]);

  useEffect(() => {
    if (user) {
      setFormData({
        fullName: user.fullName || '',
        username: user.username || '',
        email: user.email || '',
        school: user.school || '',
        major: user.major || '',
        bio: user.bio || '',
        profilePicture: user.profilePicture || ''
      });
      setLoading(false);
      
      // Load sample data (replace with actual API calls)
      loadUserData();
    }
  }, [user]);

  const loadUserData = async () => {
    // Sample projects data
    setUserProjects([
      {
        id: 1,
        title: "Campus Food Delivery App",
        description: "A mobile app for ordering food from campus restaurants with real-time tracking and multiple payment options.",
        stage: "MVP",
        upvotes: 24,
        comments: 8,
        views: 156,
        createdAt: "2 days ago",
        tags: ["Mobile", "Food", "Delivery"]
      },
      {
        id: 2,
        title: "Study Group Finder",
        description: "Platform for students to find study partners based on courses and schedules.",
        stage: "Prototype",
        upvotes: 15,
        comments: 3,
        views: 89,
        createdAt: "1 week ago",
        tags: ["Education", "Social", "Study"]
      },
      {
        id: 3,
        title: "Campus Event Hub",
        description: "Centralized platform for discovering and organizing campus events.",
        stage: "Idea",
        upvotes: 7,
        comments: 2,
        views: 45,
        createdAt: "2 weeks ago",
        tags: ["Events", "Social", "Campus"]
      }
    ]);

    // Sample activity data
    setRecentActivity([
      {
        id: 1,
        type: 'comment',
        project: "AI Attendance System",
        content: "Great idea! Have you considered using facial recognition for better accuracy?",
        timestamp: "2 hours ago",
        projectId: "1"
      },
      {
        id: 2,
        type: 'upvote',
        project: "Sustainable Campus Initiative",
        content: "Upvoted this project - love the environmental focus!",
        timestamp: "1 day ago",
        projectId: "2"
      },
      {
        id: 3,
        type: 'project',
        project: "Study Group Finder",
        content: "Created new project to help students connect for studying",
        timestamp: "3 days ago",
        projectId: "3"
      },
      {
        id: 4,
        type: 'comment',
        project: "Campus Food Delivery",
        content: "This would be so useful during exam season!",
        timestamp: "5 days ago",
        projectId: "4"
      }
    ]);
  };

  const handleImageUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('Please upload an image file (JPEG, PNG, etc.)');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      alert('Image size should be less than 5MB');
      return;
    }

    setUploadingImage(true);

    try {
      const uploadFormData = new FormData();
      uploadFormData.append('file', file);
      uploadFormData.append('upload_preset', 'launchpad');

      const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
      if (!cloudName) {
        throw new Error('Cloudinary cloud name not configured');
      }

      const response = await fetch(
        `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
        {
          method: 'POST',
          body: uploadFormData,
        }
      );

      if (!response.ok) {
        throw new Error(`Upload failed with status: ${response.status}`);
      }

      const data = await response.json();

      if (data.secure_url) {
        setFormData(prev => ({ ...prev, profilePicture: data.secure_url }));
        
        // Update profile immediately using the service
        await authService.updateProfile({ profilePicture: data.secure_url });
        await updateUser({ profilePicture: data.secure_url });
      } else {
        throw new Error('Upload failed - no secure URL returned');
      }
    } catch (error) {
      console.error('Image upload error:', error);
      alert('Failed to upload image. Please try again.');
    } finally {
      setUploadingImage(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSave = async () => {
    try {
      setLoading(true);
      
      // Use the service to update profile
      const response = await authService.updateProfile(formData);
      
      if (response.success) {
        await updateUser(response.user);
        setIsEditing(false);
      } else {
        throw new Error(response.message || 'Failed to update profile');
      }
    } catch (error) {
      console.error('Update profile error:', error);
      alert(error.message || 'Failed to update profile. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setFormData({
      fullName: user.fullName || '',
      username: user.username || '',
      email: user.email || '',
      school: user.school || '',
      major: user.major || '',
      bio: user.bio || '',
      profilePicture: user.profilePicture || ''
    });
    setIsEditing(false);
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

  const getActivityIcon = (type) => {
    switch (type) {
      case 'comment':
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
          </svg>
        );
      case 'upvote':
        return (
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path d="M2 10.5a1.5 1.5 0 113 0v6a1.5 1.5 0 01-3 0v-6zM6 10.333v5.43a2 2 0 001.106 1.79l.05.025A4 4 0 008.943 18h5.416a2 2 0 001.962-1.608l1.2-6A2 2 0 0015.56 8H12V4a2 2 0 00-2-2 1 1 0 00-1 1v.667a4 4 0 01-.8 2.4L6.8 7.933a4 4 0 00-.8 2.4z" />
          </svg>
        );
      case 'project':
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
        );
      default:
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
          </svg>
        );
    }
  };

  if (loading && !user) {
    return (
      <div className="min-h-screen bg-teal-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-teal-600"></div>
      </div>
    );
  }

  if (!user) {
    router.push('/login');
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-teal-50 to-white font-sans">
      <Sidebar activeTab={activeSidebarTab} setActiveTab={setActiveSidebarTab} />
      
      {/* Main Content Area */}
      <div className="md:ml-64 md:pt-0">
        <Header />
        
        <div className="container mx-auto px-4 py-8 pb-20 md:pb-8">
          {/* Profile Header Card */}
          <div className="bg-white rounded-2xl shadow-lg p-6 mb-8 border border-teal-100">
            <div className="flex flex-col md:flex-row md:items-start gap-6">
              {/* Profile Picture */}
              <div className="flex flex-col items-center md:items-start">
                <div className="relative group">
                  <div className="w-20 h-20 bg-gradient-to-br from-teal-400 to-blue-500 rounded-full flex items-center justify-center text-white text-xl font-bold relative overflow-hidden">
                    {formData.profilePicture ? (
                      <img 
                        src={formData.profilePicture} 
                        alt={formData.fullName}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <span className="text-xl">{user.initials}</span>
                    )}
                  </div>
                  
                  {/* Edit Overlay */}
                  <label className="absolute inset-0 bg-black bg-opacity-50 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="hidden"
                      disabled={uploadingImage}
                    />
                    {uploadingImage ? (
                      <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                    ) : (
                      <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                    )}
                  </label>
                </div>
                
                {uploadingImage && (
                  <div className="mt-2 text-sm text-teal-600">
                    Uploading...
                  </div>
                )}
              </div>

              {/* Profile Info */}
              <div className="flex-1 text-center md:text-left">
                <div className="flex flex-col md:flex-row md:items-start md:justify-between mb-4">
                  <div className="flex-1">
                    <h1 className="text-2xl font-bold text-teal-900 mb-1">
                      {isEditing ? (
                        <input
                          type="text"
                          name="fullName"
                          value={formData.fullName}
                          onChange={handleInputChange}
                          className="text-2xl font-bold bg-transparent border-b border-teal-500 focus:outline-none focus:border-teal-700 w-full max-w-xs"
                          placeholder="Your full name"
                        />
                      ) : (
                        user.fullName
                      )}
                    </h1>
                    <p className="text-teal-600 mb-2">@{user.username}</p>
                    
                    {/* Bio Section */}
                    <div className="mb-4">
                      {isEditing ? (
                        <textarea
                          name="bio"
                          value={formData.bio}
                          onChange={handleInputChange}
                          placeholder="Tell us about yourself..."
                          rows={2}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent resize-none text-sm"
                          maxLength={500}
                        />
                      ) : (
                        <p className="text-gray-600 text-sm">
                          {user.bio || "No bio yet. Tell us about yourself..."}
                        </p>
                      )}
                    </div>

                    {/* School & Major */}
                    <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                      <span className="flex items-center gap-1">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                        </svg>
                        {user.school}
                      </span>
                      {user.major && (
                        <span className="flex items-center gap-1">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l9-5-9-5-9 5 9 5z" />
                          </svg>
                          {user.major}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Edit/Save Buttons */}
                  <div className="mt-4 md:mt-0">
                    {!isEditing ? (
                      <button
                        onClick={() => setIsEditing(true)}
                        className="bg-teal-600 hover:bg-teal-700 text-white px-4 py-2 rounded-lg font-semibold transition-all duration-300 shadow-md hover:shadow-lg transform hover:-translate-y-0.5 flex items-center justify-center gap-2"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                        Edit Profile
                      </button>
                    ) : (
                      <div className="flex gap-2">
                        <button
                          onClick={handleCancel}
                          className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors"
                        >
                          Cancel
                        </button>
                        <button
                          onClick={handleSave}
                          disabled={loading}
                          className="px-4 py-2 bg-teal-600 text-white rounded-lg font-medium hover:bg-teal-700 transition-colors disabled:opacity-50 flex items-center gap-2"
                        >
                          {loading ? (
                            <>
                              <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                              Saving...
                            </>
                          ) : (
                            'Save Changes'
                          )}
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                {/* Quick Stats */}
                <div className="grid grid-cols-3 gap-4">
                  <div className="text-center p-3 bg-teal-50 rounded-xl">
                    <div className="text-xl font-bold text-teal-700">{userProjects.length}</div>
                    <div className="text-sm text-teal-600">Projects</div>
                  </div>
                  <div className="text-center p-3 bg-blue-50 rounded-xl">
                    <div className="text-xl font-bold text-blue-700">
                      {userProjects.reduce((sum, project) => sum + project.upvotes, 0)}
                    </div>
                    <div className="text-sm text-blue-600">Upvotes</div>
                  </div>
                  <div className="text-center p-3 bg-purple-50 rounded-xl">
                    <div className="text-xl font-bold text-purple-700">
                      {userProjects.reduce((sum, project) => sum + project.comments, 0)}
                    </div>
                    <div className="text-sm text-purple-600">Comments</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Tabs Navigation */}
          <div className="bg-white rounded-2xl shadow-lg p-1 mb-6 border border-teal-100">
            <div className="flex">
              <button
                onClick={() => setActiveTab('projects')}
                className={`flex-1 py-3 text-sm font-medium rounded-lg transition-all ${
                  activeTab === 'projects'
                    ? 'bg-teal-600 text-white shadow-md'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                }`}
              >
                My Projects ({userProjects.length})
              </button>
              <button
                onClick={() => setActiveTab('activity')}
                className={`flex-1 py-3 text-sm font-medium rounded-lg transition-all ${
                  activeTab === 'activity'
                    ? 'bg-teal-600 text-white shadow-md'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                }`}
              >
                Recent Activity ({recentActivity.length})
              </button>
            </div>
          </div>

          {/* Tab Content */}
          <div>
            {activeTab === 'projects' && (
              <div className="space-y-4">
                {userProjects.length === 0 ? (
                  <div className="bg-white rounded-2xl p-8 text-center border border-teal-100">
                    <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                    </svg>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">No Projects Yet</h3>
                    <p className="text-gray-600 mb-4">Start by creating your first project to showcase your ideas</p>
                    <button
                      onClick={() => router.push('/projects/create')}
                      className="bg-teal-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-teal-700 transition-colors"
                    >
                      Create Your First Project
                    </button>
                  </div>
                ) : (
                  userProjects.map((project) => (
                    <div key={project.id} className="bg-white rounded-2xl p-6 border border-teal-100 hover:border-teal-200 transition-all duration-300 hover:shadow-md">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <h3 className="text-lg font-bold text-teal-900 mb-1">{project.title}</h3>
                          <p className="text-gray-600 text-sm">{project.description}</p>
                        </div>
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStageColor(project.stage)}`}>
                          {project.stage}
                        </span>
                      </div>
                      
                      {/* Tags */}
                      <div className="flex flex-wrap gap-2 mb-4">
                        {project.tags.map((tag, index) => (
                          <span key={index} className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-md">
                            #{tag}
                          </span>
                        ))}
                      </div>

                      <div className="flex items-center justify-between text-sm text-gray-500">
                        <div className="flex items-center gap-4">
                          <span className="flex items-center gap-1">
                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                              <path d="M2 10.5a1.5 1.5 0 113 0v6a1.5 1.5 0 01-3 0v-6zM6 10.333v5.43a2 2 0 001.106 1.79l.05.025A4 4 0 008.943 18h5.416a2 2 0 001.962-1.608l1.2-6A2 2 0 0015.56 8H12V4a2 2 0 00-2-2 1 1 0 00-1 1v.667a4 4 0 01-.8 2.4L6.8 7.933a4 4 0 00-.8 2.4z" />
                            </svg>
                            {project.upvotes}
                          </span>
                          <span className="flex items-center gap-1">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                            </svg>
                            {project.comments}
                          </span>
                          <span className="flex items-center gap-1">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                            </svg>
                            {project.views}
                          </span>
                        </div>
                        <span className="text-gray-400 text-xs">{project.createdAt}</span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}

            {activeTab === 'activity' && (
              <div className="space-y-4">
                {recentActivity.length === 0 ? (
                  <div className="bg-white rounded-2xl p-8 text-center border border-teal-100">
                    <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">No Recent Activity</h3>
                    <p className="text-gray-600">Your activity will appear here when you start engaging with projects</p>
                  </div>
                ) : (
                  recentActivity.map((activity) => (
                    <div key={activity.id} className="bg-white rounded-2xl p-6 border border-teal-100 hover:border-teal-200 transition-all duration-300">
                      <div className="flex items-start gap-4">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                          activity.type === 'comment' ? 'bg-blue-100 text-blue-600' :
                          activity.type === 'upvote' ? 'bg-orange-100 text-orange-600' :
                          'bg-teal-100 text-teal-600'
                        }`}>
                          {getActivityIcon(activity.type)}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-start justify-between mb-2">
                            <p className="text-gray-900 font-medium">
                              {activity.type === 'comment' && 'Commented on'}
                              {activity.type === 'upvote' && 'Upvoted'}
                              {activity.type === 'project' && 'Created project'}{' '}
                              <button 
                                onClick={() => router.push(`/projects/${activity.projectId}`)}
                                className="text-teal-600 hover:text-teal-700 font-semibold"
                              >
                                {activity.project}
                              </button>
                            </p>
                            <span className="text-gray-400 text-sm">{activity.timestamp}</span>
                          </div>
                          <p className="text-gray-600 text-sm bg-gray-50 rounded-lg p-3">{activity.content}</p>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;