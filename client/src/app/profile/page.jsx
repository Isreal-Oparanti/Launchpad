'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useUser } from '@/context/AuthContext';
import { authService } from '@/utils/auth';
import projectService from '@/utils/project';
import Sidebar from '@/components/Sidebar';
import Header from '@/components/Header';

const ProfilePage = () => {
  const router = useRouter();
  const { user, loading: userLoading, fetchUser } = useUser();
  
  const [isProfileLoading, setIsProfileLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [showCollabModal, setShowCollabModal] = useState(false);
  const [activeTab, setActiveTab] = useState('projects');
  const [activeSidebarTab, setActiveSidebarTab] = useState('profile');
  const [loading, setLoading] = useState(false);
  const [activeTabs, setActiveTabs] = useState('profile');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const [formData, setFormData] = useState({
    fullName: '',
    username: '',
    email: '',
    school: '',
    major: '',
    currentPosition: '',
    bio: '',
    location: '',
    website: '',
    linkedinUrl: '',
    githubUrl: '',
    twitterUrl: '',
    skills: [],
    interests: [],
    expertise: [],
    openToCollaboration: false,
    collaborationProfile: null,
    profilePicture: ''
  });

  const [userProjects, setUserProjects] = useState([]);

  useEffect(() => {
    if (userLoading) return;
    if (!user) {
      router.push('/login');
      return;
    }

    setFormData({
      fullName: user.fullName || '',
      username: user.username || '',
      email: user.email || '',
      school: user.school || '',
      major: user.major || '',
      currentPosition: user.currentPosition || '',
      bio: user.bio || '',
      location: user.location || '',
      website: user.website || '',
      linkedinUrl: user.linkedinUrl || '',
      githubUrl: user.githubUrl || '',
      twitterUrl: user.twitterUrl || '',
      skills: user.skills || [],
      interests: user.interests || [],
      expertise: user.expertise || [],
      openToCollaboration: user.openToCollaboration || false,
      collaborationProfile: user.collaborationProfile || null,
      profilePicture: user.profilePicture || ''
    });
    
    loadUserData();
    setIsProfileLoading(false);
  }, [user, userLoading, router]);

  const loadUserData = async () => {
    try {
      const projectsResponse = await projectService.getMyProjects();
      if (projectsResponse.success) {
        setUserProjects(projectsResponse.data.projects);
      }
    } catch (error) {
      console.error('Load user data error:', error);
      setUserProjects([]);
    }
  };

  const handleImageUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('Please upload an image file');
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
      if (!cloudName) throw new Error('Cloudinary not configured');

      const response = await fetch(
        `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
        { method: 'POST', body: uploadFormData }
      );

      if (!response.ok) throw new Error('Upload failed');
      const data = await response.json();

      if (data.secure_url) {
        const updateResponse = await authService.updateProfile({ profilePicture: data.secure_url });
        if (updateResponse.success) {
          await fetchUser();
          setFormData(prev => ({ ...prev, profilePicture: data.secure_url }));
        }
      }
    } catch (error) {
      console.error('Image upload error:', error);
      alert('Failed to upload image');
    } finally {
      setUploadingImage(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleArrayInput = (field, value) => {
    const items = value.split(',').map(s => s.trim()).filter(s => s);
    setFormData(prev => ({ ...prev, [field]: items }));
  };

  const handleSave = async () => {
    try {
      setLoading(true);
      const response = await authService.updateProfile(formData);
      
      if (response.success) {
        await fetchUser();
        setIsEditing(false);
        alert('Profile updated successfully!');
      } else {
        throw new Error(response.message || 'Failed to update profile');
      }
    } catch (error) {
      console.error('Update profile error:', error);
      alert(error.message || 'Failed to update profile');
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
      currentPosition: user.currentPosition || '',
      bio: user.bio || '',
      location: user.location || '',
      website: user.website || '',
      linkedinUrl: user.linkedinUrl || '',
      githubUrl: user.githubUrl || '',
      twitterUrl: user.twitterUrl || '',
      skills: user.skills || [],
      interests: user.interests || [],
      expertise: user.expertise || [],
      openToCollaboration: user.openToCollaboration || false,
      collaborationProfile: user.collaborationProfile || null,
      profilePicture: user.profilePicture || ''
    });
    setIsEditing(false);
  };

  const handleCollabToggle = async () => {
    if (!user.openToCollaboration) {
      setShowCollabModal(true);
    } else {
      try {
        const response = await authService.updateProfile({ openToCollaboration: false });
        if (response.success) {
          await fetchUser();
          alert('Collaboration disabled');
        }
      } catch (error) {
        alert('Failed to update collaboration status');
      }
    }
  };

  if (userLoading || isProfileLoading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-teal-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <Sidebar
        activeTab={activeTabs}
        setActiveTab={setActiveTab}
        mobileMenuOpen={mobileMenuOpen}
        setMobileMenuOpen={setMobileMenuOpen}
      />
      <div className="md:ml-64">
       <Header
          onMenuToggle={() => setMobileMenuOpen(!mobileMenuOpen)}
          mobileMenuOpen={mobileMenuOpen}
        />
        
        <div className="max-w-4xl mx-auto px-4 py-6 pb-24 md:pb-8">
          {/* Profile Header */}
          <div className="bg-white border border-gray-200 rounded-xl p-6 mb-4">
            <div className="flex items-start gap-4 mb-6">
              {/* Profile Picture */}
              <div className="relative group shrink-0">
                <div className="w-20 h-20 bg-teal-600 rounded-full flex items-center justify-center text-white text-2xl font-bold overflow-hidden">
                  {formData.profilePicture ? (
                    <img 
                      src={formData.profilePicture} 
                      alt={formData.fullName}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span>{user.initials}</span>
                  )}
                </div>
                
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

              {/* Profile Info */}
              <div className="flex-1 min-w-0">
                {isEditing ? (
                  <input
                    type="text"
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleInputChange}
                    className="text-xl font-bold mb-1 w-full border-b border-gray-300 focus:border-teal-600 focus:outline-none"
                    placeholder="Your full name"
                  />
                ) : (
                  <h1 className="text-xl font-bold text-gray-900 mb-1 truncate">{user.fullName}</h1>
                )}
                
                <p className="text-teal-600 text-sm mb-2">@{user.username}</p>
                
                {isEditing ? (
                  <input
                    type="text"
                    name="currentPosition"
                    value={formData.currentPosition}
                    onChange={handleInputChange}
                    className="text-sm text-gray-600 w-full border-b border-gray-300 focus:border-teal-600 focus:outline-none mb-2"
                    placeholder="e.g., Software Engineer, Founder"
                  />
                ) : (
                  user.currentPosition && (
                    <p className="text-sm text-gray-600 mb-2">{user.currentPosition}</p>
                  )
                )}
              </div>

              {/* Edit Button */}
              <div className="flex gap-2 shrink-0">
                {!isEditing ? (
                  <button
                    onClick={() => setIsEditing(true)}
                    className="px-4 py-2 bg-teal-600 text-white rounded-lg text-sm font-medium hover:bg-teal-700"
                  >
                    Edit
                  </button>
                ) : (
                  <>
                    <button
                      onClick={handleCancel}
                      className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-50"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleSave}
                      disabled={loading}
                      className="px-4 py-2 bg-teal-600 text-white rounded-lg text-sm font-medium hover:bg-teal-700 disabled:opacity-50"
                    >
                      {loading ? 'Saving...' : 'Save'}
                    </button>
                  </>
                )}
              </div>
            </div>

            {/* Bio */}
            <div className="mb-6">
              {isEditing ? (
                <textarea
                  name="bio"
                  value={formData.bio}
                  onChange={handleInputChange}
                  placeholder="Tell us about yourself..."
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent resize-none text-sm"
                  maxLength={500}
                />
              ) : (
                <p className="text-gray-700 text-sm leading-relaxed">
                  {user.bio || "No bio yet. Add one to tell others about yourself."}
                </p>
              )}
            </div>

            {/* Details Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <InfoItem 
                icon={<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>}
                label="Organization"
                value={isEditing ? (
                  <input type="text" name="school" value={formData.school} onChange={handleInputChange} className="w-full border-b border-gray-300 focus:border-teal-600 focus:outline-none text-sm" />
                ) : user.school}
              />
              
              <InfoItem 
                icon={<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l9-5-9-5-9 5 9 5z" /></svg>}
                label="Major/Field"
                value={isEditing ? (
                  <input type="text" name="major" value={formData.major} onChange={handleInputChange} className="w-full border-b border-gray-300 focus:border-teal-600 focus:outline-none text-sm" placeholder="e.g., Computer Science" />
                ) : user.major || 'Not specified'}
              />
              
              <InfoItem 
                icon={<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>}
                label="Location"
                value={isEditing ? (
                  <input type="text" name="location" value={formData.location} onChange={handleInputChange} className="w-full border-b border-gray-300 focus:border-teal-600 focus:outline-none text-sm" placeholder="e.g., New York, NY" />
                ) : user.location || 'Not specified'}
              />
              
              <InfoItem 
                icon={<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>}
                label="Email"
                value={user.email}
              />
            </div>

            {/* Social Links */}
            {(isEditing || user.website || user.linkedinUrl || user.githubUrl || user.twitterUrl) && (
              <div className="mb-6">
                {isEditing ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <input type="url" name="website" value={formData.website} onChange={handleInputChange} placeholder="Website URL" className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-teal-500" />
                    <input type="url" name="linkedinUrl" value={formData.linkedinUrl} onChange={handleInputChange} placeholder="LinkedIn URL" className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-teal-500" />
                    <input type="url" name="githubUrl" value={formData.githubUrl} onChange={handleInputChange} placeholder="GitHub URL" className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-teal-500" />
                    <input type="url" name="twitterUrl" value={formData.twitterUrl} onChange={handleInputChange} placeholder="Twitter/X URL" className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-teal-500" />
                  </div>
                ) : (
                  <div className="flex flex-wrap gap-3">
                    {user.website && <SocialLink href={user.website} icon="🌐" label="Website" />}
                    {user.linkedinUrl && <SocialLink href={user.linkedinUrl} icon="💼" label="LinkedIn" />}
                    {user.githubUrl && <SocialLink href={user.githubUrl} icon="💻" label="GitHub" />}
                    {user.twitterUrl && <SocialLink href={user.twitterUrl} icon="🐦" label="Twitter" />}
                  </div>
                )}
              </div>
            )}

            {/* Skills & Expertise */}
            <div className="space-y-4">
              <TagSection
                title="Expertise"
                items={formData.expertise}
                isEditing={isEditing}
                onEdit={(val) => handleArrayInput('expertise', val)}
                placeholder="e.g., Frontend Development, UI/UX Design"
                color="teal"
              />
              
              <TagSection
                title="Skills"
                items={formData.skills}
                isEditing={isEditing}
                onEdit={(val) => handleArrayInput('skills', val)}
                placeholder="e.g., React, Figma, Python"
                color="blue"
              />
              
              <TagSection
                title="Interests"
                items={formData.interests}
                isEditing={isEditing}
                onEdit={(val) => handleArrayInput('interests', val)}
                placeholder="e.g., Startups, EdTech, AI"
                color="purple"
              />
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-4 mt-6 pt-6 border-t border-gray-200">
              <StatCard label="Projects" value={userProjects.length} />
              <StatCard label="Upvotes" value={userProjects.reduce((sum, p) => sum + (p.upvotes || 0), 0)} />
              <StatCard label="Comments" value={userProjects.reduce((sum, p) => sum + (p.comments || 0), 0)} />
            </div>
          </div>

          {/* Collaboration Toggle */}
          <div className="bg-white border border-gray-200 rounded-xl p-6 mb-4">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <h3 className="text-lg font-bold text-gray-900 mb-2">Open to Collaboration</h3>
                <p className="text-sm text-gray-600 mb-4">
                  Enable this to match with potential co-founders and collaborators based on your profile, skills, and interests. We'll help you find the perfect teammates for your next project.
                </p>
                {user.openToCollaboration && user.collaborationProfile && (
                  <div className="bg-teal-50 border border-teal-200 rounded-lg p-4">
                    <p className="text-sm text-teal-800 font-medium mb-2">🎯 Your collaboration profile is active</p>
                    <div className="flex flex-wrap gap-2 text-xs">
                      {user.collaborationProfile.lookingFor?.length > 0 && (
                        <span className="text-teal-700">Looking for: {user.collaborationProfile.lookingFor.join(', ')}</span>
                      )}
                    </div>
                  </div>
                )}
              </div>
              <button
                onClick={handleCollabToggle}
                className={`px-6 py-3 rounded-lg font-medium transition-colors shrink-0 ${
                  user.openToCollaboration
                    ? 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                    : 'bg-teal-600 text-white hover:bg-teal-700'
                }`}
              >
                {user.openToCollaboration ? 'Disable' : 'Enable'}
              </button>
            </div>
            
            {user.openToCollaboration && (
              <button
                onClick={() => setShowCollabModal(true)}
                className="mt-4 w-full py-2 border-2 border-teal-600 text-teal-600 rounded-lg font-medium hover:bg-teal-50 transition-colors"
              >
                Edit Collaboration Preferences
              </button>
            )}
          </div>

          {/* Projects */}
          <div className="bg-white border border-gray-200 rounded-xl p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4">My Projects ({userProjects.length})</h3>
            {userProjects.length === 0 ? (
              <div className="text-center py-12">
                <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
                <h4 className="text-lg font-semibold text-gray-900 mb-2">No Projects Yet</h4>
                <p className="text-gray-600 mb-4 text-sm">Start by creating your first project</p>
                <button
                  onClick={() => router.push('/projects/create')}
                  className="bg-teal-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-teal-700"
                >
                  Create Project
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                {userProjects.map((project) => (
                  <ProjectCard key={project.id} project={project} onClick={() => router.push(`/projects/${project.id}`)} />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Collaboration Modal */}
      {showCollabModal && (
        <CollaborationModal
          onClose={() => setShowCollabModal(false)}
          initialData={user.collaborationProfile || {}}
          onSave={async (collabData) => {
            try {
              const response = await authService.updateProfile({
                openToCollaboration: true,
                collaborationProfile: collabData
              });
              if (response.success) {
                await fetchUser();
                setShowCollabModal(false);
                alert('Collaboration preferences saved!');
              }
            } catch (error) {
              alert('Failed to save collaboration preferences');
            }
          }}
        />
      )}
    </div>
  );
};

// Collaboration Preferences Modal
const CollaborationModal = ({ onClose, initialData, onSave }) => {
  const [step, setStep] = useState(1);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    lookingFor: initialData.lookingFor || [],
    commitmentLevel: initialData.commitmentLevel || 'Not specified',
    availability: initialData.availability || 'Flexible',
    location: initialData.location || '',
    timezone: initialData.timezone || '',
    remotePreference: initialData.remotePreference || 'Open to both',
    industries: initialData.industries || [],
    workStyle: initialData.workStyle || [],
    personalityTraits: initialData.personalityTraits || [],
    hobbies: initialData.hobbies || [],
    strengths: initialData.strengths || [],
    projectStagePreference: initialData.projectStagePreference || [],
    previousExperience: initialData.previousExperience || 'First-time founder',
    additionalNotes: initialData.additionalNotes || ''
  });

  const lookingForOptions = [
    'Co-founder', 'Technical Partner', 'Business Partner', 'Designer',
    'Mentor', 'Mentee', 'Collaborator', 'Advisor', 'Team Member'
  ];

  const industryOptions = [
    'EdTech', 'FinTech', 'HealthTech', 'E-commerce', 'SaaS', 'AI/ML',
    'Social Impact', 'Gaming', 'Entertainment', 'Food & Beverage',
    'Real Estate', 'Transportation', 'Energy', 'Agriculture'
  ];

  const workStyleOptions = [
    'Fast-paced', 'Methodical', 'Collaborative', 'Independent',
    'Data-driven', 'Creative', 'Structured', 'Flexible'
  ];

  const personalityOptions = [
    'Analytical', 'Creative', 'Leadership', 'Team Player', 'Problem Solver',
    'Innovative', 'Detail-Oriented', 'Adaptable', 'Communicative',
    'Strategic Thinker', 'Empathetic', 'Results-Driven'
  ];

  const projectStageOptions = ['Ideation', 'Prototype', 'MVP', 'Growth', 'Scaling', 'Any'];

  const toggleArrayItem = (field, item) => {
    setFormData(prev => ({
      ...prev,
      [field]: prev[field].includes(item)
        ? prev[field].filter(i => i !== item)
        : [...prev[field], item]
    }));
  };

  const addCustomItem = (field, value) => {
    if (value.trim() && !formData[field].includes(value.trim())) {
      setFormData(prev => ({
        ...prev,
        [field]: [...prev[field], value.trim()]
      }));
    }
  };

  const removeCustomItem = (field, item) => {
    setFormData(prev => ({
      ...prev,
      [field]: prev[field].filter(i => i !== item)
    }));
  };

  const handleSubmit = async () => {
    if (formData.lookingFor.length === 0) {
      alert('Please select at least one option for what you\'re looking for');
      return;
    }
    if (formData.industries.length === 0) {
      alert('Please select at least one industry');
      return;
    }
    if (formData.personalityTraits.length === 0) {
      alert('Please select at least one personality trait');
      return;
    }

    setSaving(true);
    try {
      await onSave(formData);
    } catch (error) {
      alert('Failed to save preferences');
    } finally {
      setSaving(false);
    }
  };

  const totalSteps = 4;
  const progress = (step / totalSteps) * 100;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full my-8">
        {/* Header */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold text-gray-900">Collaboration Preferences</h2>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          
          {/* Progress Bar */}
          <div className="relative">
            <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
              <div 
                className="h-full bg-teal-600 transition-all duration-300"
                style={{ width: `${progress}%` }}
              ></div>
            </div>
            <p className="text-sm text-gray-600 mt-2">Step {step} of {totalSteps}</p>
          </div>
        </div>

        {/* Content */}
        <div className="max-h-[60vh] overflow-y-auto p-6">
          {step === 1 && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">What are you looking for?</h3>
                <p className="text-sm text-gray-600 mb-4">Select all that apply</p>
                <div className="flex flex-wrap gap-2">
                  {lookingForOptions.map(option => (
                    <button
                      key={option}
                      onClick={() => toggleArrayItem('lookingFor', option)}
                      className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                        formData.lookingFor.includes(option)
                          ? 'bg-teal-600 text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {option}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Commitment Level</h3>
                <select
                  value={formData.commitmentLevel}
                  onChange={(e) => setFormData({ ...formData, commitmentLevel: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500"
                >
                  <option value="Not specified">Not specified</option>
                  <option value="Full-time">Full-time</option>
                  <option value="Part-time">Part-time</option>
                  <option value="Side Project">Side Project</option>
                  <option value="Flexible">Flexible</option>
                </select>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Availability</h3>
                <select
                  value={formData.availability}
                  onChange={(e) => setFormData({ ...formData, availability: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500"
                >
                  <option value="Immediately">Immediately</option>
                  <option value="Within 1 month">Within 1 month</option>
                  <option value="1-3 months">1-3 months</option>
                  <option value="3+ months">3+ months</option>
                  <option value="Flexible">Flexible</option>
                </select>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Preferred Industries</h3>
                <p className="text-sm text-gray-600 mb-4">What domains interest you?</p>
                <div className="flex flex-wrap gap-2">
                  {industryOptions.map(option => (
                    <button
                      key={option}
                      onClick={() => toggleArrayItem('industries', option)}
                      className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                        formData.industries.includes(option)
                          ? 'bg-teal-600 text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {option}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Project Stage Preference</h3>
                <p className="text-sm text-gray-600 mb-4">What stage are you interested in?</p>
                <div className="flex flex-wrap gap-2">
                  {projectStageOptions.map(option => (
                    <button
                      key={option}
                      onClick={() => toggleArrayItem('projectStagePreference', option)}
                      className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                        formData.projectStagePreference.includes(option)
                          ? 'bg-teal-600 text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {option}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Previous Experience</h3>
                <select
                  value={formData.previousExperience}
                  onChange={(e) => setFormData({ ...formData, previousExperience: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500"
                >
                  <option value="First-time founder">First-time founder</option>
                  <option value="1-2 projects">1-2 projects</option>
                  <option value="3-5 projects">3-5 projects</option>
                  <option value="5+ projects">5+ projects</option>
                  <option value="Serial entrepreneur">Serial entrepreneur</option>
                </select>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Work Style</h3>
                <p className="text-sm text-gray-600 mb-4">How do you prefer to work?</p>
                <div className="flex flex-wrap gap-2">
                  {workStyleOptions.map(option => (
                    <button
                      key={option}
                      onClick={() => toggleArrayItem('workStyle', option)}
                      className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                        formData.workStyle.includes(option)
                          ? 'bg-teal-600 text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {option}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Personality Traits</h3>
                <p className="text-sm text-gray-600 mb-4">Select traits that describe you (3-5 recommended)</p>
                <div className="flex flex-wrap gap-2">
                  {personalityOptions.map(option => (
                    <button
                      key={option}
                      onClick={() => toggleArrayItem('personalityTraits', option)}
                      disabled={formData.personalityTraits.length >= 5 && !formData.personalityTraits.includes(option)}
                      className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors disabled:opacity-40 disabled:cursor-not-allowed ${
                        formData.personalityTraits.includes(option)
                          ? 'bg-teal-600 text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {option}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Timezone Preference</h3>
                <select
                  value={formData.timezonePreference}
                  onChange={(e) => setFormData({ ...formData, timezonePreference: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500"
                >
                  <option value="Same timezone">Same timezone</option>
                  <option value="Flexible">Flexible</option>
                  <option value="Async work preferred">Async work preferred</option>
                </select>
              </div>
            </div>
          )}

          {step === 4 && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Your Hobbies & Interests</h3>
                <p className="text-sm text-gray-600 mb-4">Help others understand you better (for cultural fit)</p>
                <input
                  type="text"
                  placeholder="Type a hobby and press Enter (e.g., hiking, coding, music)"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 mb-3"
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      addCustomItem('hobbies', e.target.value);
                      e.target.value = '';
                    }
                  }}
                />
                <div className="flex flex-wrap gap-2">
                  {formData.hobbies.map(hobby => (
                    <span key={hobby} className="px-3 py-2 bg-purple-50 text-purple-700 rounded-lg text-sm flex items-center gap-2">
                      {hobby}
                      <button onClick={() => removeCustomItem('hobbies', hobby)} className="text-purple-600 hover:text-purple-800">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </span>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Your Strengths</h3>
                <p className="text-sm text-gray-600 mb-4">What do you bring to the table?</p>
                <input
                  type="text"
                  placeholder="Type a strength and press Enter (e.g., UI/UX design, fundraising)"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 mb-3"
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      addCustomItem('strengths', e.target.value);
                      e.target.value = '';
                    }
                  }}
                />
                <div className="flex flex-wrap gap-2">
                  {formData.strengths.map(strength => (
                    <span key={strength} className="px-3 py-2 bg-teal-50 text-teal-700 rounded-lg text-sm flex items-center gap-2">
                      {strength}
                      <button onClick={() => removeCustomItem('strengths', strength)} className="text-teal-600 hover:text-teal-800">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </span>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Additional Notes (Optional)</h3>
                <textarea
                  value={formData.additionalNotes}
                  onChange={(e) => setFormData({ ...formData, additionalNotes: e.target.value })}
                  placeholder="Anything else you'd like potential collaborators to know?"
                  rows={4}
                  maxLength={300}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 resize-none"
                />
                <p className="text-xs text-gray-500 mt-1">{formData.additionalNotes.length}/300</p>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-200 flex gap-3">
          {step > 1 && (
            <button
              onClick={() => setStep(step - 1)}
              className="flex-1 py-3 border-2 border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors"
            >
              Back
            </button>
          )}
          {step < totalSteps ? (
            <button
              onClick={() => setStep(step + 1)}
              className="flex-1 py-3 bg-teal-600 text-white rounded-lg font-medium hover:bg-teal-700 transition-colors"
            >
              Next
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              disabled={saving}
              className="flex-1 py-3 bg-teal-600 text-white rounded-lg font-medium hover:bg-teal-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {saving ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                  Saving...
                </>
              ) : (
                'Complete Setup'
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

// Helper Components
const InfoItem = ({ icon, label, value }) => (
  <div className="flex items-start gap-2">
    <div className="text-gray-400 mt-0.5">{icon}</div>
    <div className="flex-1 min-w-0">
      <p className="text-xs text-gray-500">{label}</p>
      {typeof value === 'string' ? (
        <p className="text-sm text-gray-900 truncate">{value}</p>
      ) : (
        value
      )}
    </div>
  </div>
);

const SocialLink = ({ href, icon, label }) => (
  <a
    href={href}
    target="_blank"
    rel="noopener noreferrer"
    className="inline-flex items-center gap-2 px-3 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm text-gray-700 transition-colors"
  >
    <span>{icon}</span>
    <span>{label}</span>
  </a>
);

const TagSection = ({ title, items, isEditing, onEdit, placeholder, color }) => {
  const colorClasses = {
    teal: 'bg-teal-50 text-teal-700 border-teal-200',
    blue: 'bg-blue-50 text-blue-700 border-blue-200',
    purple: 'bg-purple-50 text-purple-700 border-purple-200'
  };

  return (
    <div>
      <h4 className="text-sm font-semibold text-gray-700 mb-2">{title}</h4>
      {isEditing ? (
        <input
          type="text"
          defaultValue={items.join(', ')}
          onBlur={(e) => onEdit(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 text-sm"
          placeholder={placeholder}
        />
      ) : items.length > 0 ? (
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

export default ProfilePage; 