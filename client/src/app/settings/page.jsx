'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useUser } from '@/context/AuthContext';
import { authService } from '@/utils/auth';
import Sidebar from '@/components/Sidebar';
import Header from '@/components/Header';

const SettingsPage = () => {
  const router = useRouter();
  const { user, loading: userLoading, fetchUser, logout } = useUser();
  const [activeSidebarTab, setActiveSidebarTab] = useState('settings');
  const [activeTab, setActiveTab] = useState('account');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  // Account Settings
  const [accountForm, setAccountForm] = useState({
    username: '',
    email: '',
    fullName: '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  // Profile Settings
  const [profileForm, setProfileForm] = useState({
    school: '',
    major: '',
    currentPosition: '',
    location: '',
    bio: ''
  });

  // Privacy Settings
  const [privacyForm, setPrivacyForm] = useState({
    profileVisibility: 'public',
    showEmail: false,
    showLocation: true,
    allowMessages: true
  });

  // Notification Settings
  const [notificationForm, setNotificationForm] = useState({
    emailNotifications: true,
    projectUpdates: true,
    commentsOnMyProjects: true,
    newCollaborationMatches: true,
    weeklyDigest: false,
    marketingEmails: false
  });

  useEffect(() => {
    if (userLoading) return;
    if (!user) {
      router.push('/login');
      return;
    }

    setAccountForm({
      username: user.username || '',
      email: user.email || '',
      fullName: user.fullName || '',
      currentPassword: '',
      newPassword: '',
      confirmPassword: ''
    });

    setProfileForm({
      school: user.school || '',
      major: user.major || '',
      currentPosition: user.currentPosition || '',
      location: user.location || '',
      bio: user.bio || ''
    });
  }, [user, userLoading, router]);

  const showMessage = (type, text) => {
    setMessage({ type, text });
    setTimeout(() => setMessage({ type: '', text: '' }), 5000);
  };

  const handleAccountUpdate = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Validate username
      if (accountForm.username.length < 3) {
        showMessage('error', 'Username must be at least 3 characters');
        setLoading(false);
        return;
      }

      const updateData = {
        username: accountForm.username,
        fullName: accountForm.fullName
      };

      const response = await authService.updateProfile(updateData);
      
      if (response.success) {
        await fetchUser();
        showMessage('success', 'Account updated successfully!');
      } else {
        throw new Error(response.message);
      }
    } catch (error) {
      showMessage('error', error.message || 'Failed to update account');
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (!accountForm.currentPassword) {
        showMessage('error', 'Please enter your current password');
        setLoading(false);
        return;
      }

      if (accountForm.newPassword.length < 6) {
        showMessage('error', 'New password must be at least 6 characters');
        setLoading(false);
        return;
      }

      if (accountForm.newPassword !== accountForm.confirmPassword) {
        showMessage('error', 'Passwords do not match');
        setLoading(false);
        return;
      }

      const response = await authService.changePassword({
        currentPassword: accountForm.currentPassword,
        newPassword: accountForm.newPassword
      });

      if (response.success) {
        setAccountForm(prev => ({
          ...prev,
          currentPassword: '',
          newPassword: '',
          confirmPassword: ''
        }));
        showMessage('success', 'Password changed successfully!');
      } else {
        throw new Error(response.message);
      }
    } catch (error) {
      showMessage('error', error.message || 'Failed to change password');
    } finally {
      setLoading(false);
    }
  };

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await authService.updateProfile(profileForm);
      
      if (response.success) {
        await fetchUser();
        showMessage('success', 'Profile updated successfully!');
      } else {
        throw new Error(response.message);
      }
    } catch (error) {
      showMessage('error', error.message || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAccount = async () => {
    const confirmed = window.confirm(
      'Are you sure you want to delete your account? This action cannot be undone. All your projects and data will be permanently deleted.'
    );

    if (!confirmed) return;

    const doubleConfirm = window.confirm(
      'This is your last warning. Are you absolutely sure you want to delete your account?'
    );

    if (!doubleConfirm) return;

    try {
      setLoading(true);
      const response = await authService.deleteAccount();
      
      if (response.success) {
        showMessage('success', 'Account deleted successfully');
        setTimeout(() => {
          logout();
        }, 2000);
      } else {
        throw new Error(response.message);
      }
    } catch (error) {
      showMessage('error', error.message || 'Failed to delete account');
      setLoading(false);
    }
  };

  if (userLoading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-teal-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <Sidebar activeTab={activeSidebarTab} setActiveTab={setActiveSidebarTab} />
      
      <div className="md:ml-64">
        <Header />
        
        <div className="max-w-4xl mx-auto px-4 py-6 pb-24 md:pb-8">
          {/* Page Header */}
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Settings</h1>
            <p className="text-gray-600">Manage your account settings and preferences</p>
          </div>

          {/* Message Banner */}
          {message.text && (
            <div className={`mb-6 p-4 rounded-lg ${
              message.type === 'success' ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'
            }`}>
              <p className={`text-sm font-medium ${
                message.type === 'success' ? 'text-green-800' : 'text-red-800'
              }`}>
                {message.text}
              </p>
            </div>
          )}

          {/* Tabs */}
          <div className="bg-white border border-gray-200 rounded-xl mb-6 overflow-hidden">
            <div className="flex overflow-x-auto">
              <button
                onClick={() => setActiveTab('account')}
                className={`flex-1 min-w-[120px] py-3 px-4 text-sm font-medium transition-colors whitespace-nowrap ${
                  activeTab === 'account'
                    ? 'text-teal-600 border-b-2 border-teal-600 bg-teal-50'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                }`}
              >
                Account
              </button>
              <button
                onClick={() => setActiveTab('profile')}
                className={`flex-1 min-w-[120px] py-3 px-4 text-sm font-medium transition-colors whitespace-nowrap ${
                  activeTab === 'profile'
                    ? 'text-teal-600 border-b-2 border-teal-600 bg-teal-50'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                }`}
              >
                Profile
              </button>
              <button
                onClick={() => setActiveTab('privacy')}
                className={`flex-1 min-w-[120px] py-3 px-4 text-sm font-medium transition-colors whitespace-nowrap ${
                  activeTab === 'privacy'
                    ? 'text-teal-600 border-b-2 border-teal-600 bg-teal-50'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                }`}
              >
                Privacy
              </button>
              <button
                onClick={() => setActiveTab('notifications')}
                className={`flex-1 min-w-[120px] py-3 px-4 text-sm font-medium transition-colors whitespace-nowrap ${
                  activeTab === 'notifications'
                    ? 'text-teal-600 border-b-2 border-teal-600 bg-teal-50'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                }`}
              >
                Notifications
              </button>
            </div>
          </div>

          {/* Tab Content */}
          <div className="bg-white border border-gray-200 rounded-xl p-6">
            {/* Account Tab */}
            {activeTab === 'account' && (
              <div className="space-y-8">
                {/* Account Information */}
                <div>
                  <h2 className="text-lg font-semibold text-gray-900 mb-4">Account Information</h2>
                  <form onSubmit={handleAccountUpdate} className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Username</label>
                      <input
                        type="text"
                        value={accountForm.username}
                        onChange={(e) => setAccountForm({ ...accountForm, username: e.target.value })}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                        placeholder="username"
                      />
                      <p className="text-xs text-gray-500 mt-1">Your unique username. Must be at least 3 characters.</p>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
                      <input
                        type="text"
                        value={accountForm.fullName}
                        onChange={(e) => setAccountForm({ ...accountForm, fullName: e.target.value })}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                        placeholder="John Doe"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
                      <input
                        type="email"
                        value={accountForm.email}
                        disabled
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-50 text-gray-500 cursor-not-allowed"
                      />
                      <p className="text-xs text-gray-500 mt-1">Email cannot be changed. Contact support if you need to update it.</p>
                    </div>

                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full md:w-auto px-6 py-3 bg-teal-600 text-white rounded-lg font-medium hover:bg-teal-700 transition-colors disabled:opacity-50"
                    >
                      {loading ? 'Saving...' : 'Save Changes'}
                    </button>
                  </form>
                </div>

                {/* Change Password */}
                <div className="pt-8 border-t border-gray-200">
                  <h2 className="text-lg font-semibold text-gray-900 mb-4">Change Password</h2>
                  <form onSubmit={handlePasswordChange} className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Current Password</label>
                      <input
                        type="password"
                        value={accountForm.currentPassword}
                        onChange={(e) => setAccountForm({ ...accountForm, currentPassword: e.target.value })}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                        placeholder="Enter current password"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">New Password</label>
                      <input
                        type="password"
                        value={accountForm.newPassword}
                        onChange={(e) => setAccountForm({ ...accountForm, newPassword: e.target.value })}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                        placeholder="Enter new password"
                      />
                      <p className="text-xs text-gray-500 mt-1">Must be at least 6 characters long</p>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Confirm New Password</label>
                      <input
                        type="password"
                        value={accountForm.confirmPassword}
                        onChange={(e) => setAccountForm({ ...accountForm, confirmPassword: e.target.value })}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                        placeholder="Confirm new password"
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full md:w-auto px-6 py-3 bg-teal-600 text-white rounded-lg font-medium hover:bg-teal-700 transition-colors disabled:opacity-50"
                    >
                      {loading ? 'Changing...' : 'Change Password'}
                    </button>
                  </form>
                </div>

                {/* Delete Account */}
                <div className="pt-8 border-t border-gray-200">
                  <h2 className="text-lg font-semibold text-red-600 mb-4">Danger Zone</h2>
                  <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                    <h3 className="text-sm font-semibold text-red-800 mb-2">Delete Account</h3>
                    <p className="text-sm text-red-700 mb-4">
                      Once you delete your account, there is no going back. All your projects, comments, and data will be permanently deleted.
                    </p>
                    <button
                      onClick={handleDeleteAccount}
                      disabled={loading}
                      className="px-6 py-2 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 transition-colors disabled:opacity-50"
                    >
                      Delete My Account
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Profile Tab */}
            {activeTab === 'profile' && (
              <div>
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Profile Details</h2>
                <form onSubmit={handleProfileUpdate} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">School/Organization</label>
                    <input
                      type="text"
                      value={profileForm.school}
                      onChange={(e) => setProfileForm({ ...profileForm, school: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                      placeholder="e.g., Stanford University"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Major/Field of Study</label>
                    <input
                      type="text"
                      value={profileForm.major}
                      onChange={(e) => setProfileForm({ ...profileForm, major: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                      placeholder="e.g., Computer Science"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Current Position</label>
                    <input
                      type="text"
                      value={profileForm.currentPosition}
                      onChange={(e) => setProfileForm({ ...profileForm, currentPosition: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                      placeholder="e.g., Software Engineer, Founder"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Location</label>
                    <input
                      type="text"
                      value={profileForm.location}
                      onChange={(e) => setProfileForm({ ...profileForm, location: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                      placeholder="e.g., San Francisco, CA"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Bio</label>
                    <textarea
                      value={profileForm.bio}
                      onChange={(e) => setProfileForm({ ...profileForm, bio: e.target.value })}
                      rows={4}
                      maxLength={500}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent resize-none"
                      placeholder="Tell us about yourself..."
                    />
                    <p className="text-xs text-gray-500 mt-1">{profileForm.bio.length}/500 characters</p>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full md:w-auto px-6 py-3 bg-teal-600 text-white rounded-lg font-medium hover:bg-teal-700 transition-colors disabled:opacity-50"
                  >
                    {loading ? 'Saving...' : 'Save Changes'}
                  </button>
                </form>
              </div>
            )}

            {/* Privacy Tab */}
            {activeTab === 'privacy' && (
              <div>
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Privacy Settings</h2>
                <div className="space-y-6">
                  <ToggleSetting
                    title="Profile Visibility"
                    description="Make your profile visible to other users"
                    enabled={privacyForm.profileVisibility === 'public'}
                    onChange={(val) => setPrivacyForm({ ...privacyForm, profileVisibility: val ? 'public' : 'private' })}
                  />

                  <ToggleSetting
                    title="Show Email on Profile"
                    description="Display your email address on your public profile"
                    enabled={privacyForm.showEmail}
                    onChange={(val) => setPrivacyForm({ ...privacyForm, showEmail: val })}
                  />

                  <ToggleSetting
                    title="Show Location"
                    description="Display your location on your profile"
                    enabled={privacyForm.showLocation}
                    onChange={(val) => setPrivacyForm({ ...privacyForm, showLocation: val })}
                  />

                  <ToggleSetting
                    title="Allow Direct Messages"
                    description="Allow other users to send you direct messages"
                    enabled={privacyForm.allowMessages}
                    onChange={(val) => setPrivacyForm({ ...privacyForm, allowMessages: val })}
                  />

                  <button
                    onClick={() => showMessage('success', 'Privacy settings saved!')}
                    className="w-full md:w-auto px-6 py-3 bg-teal-600 text-white rounded-lg font-medium hover:bg-teal-700 transition-colors"
                  >
                    Save Privacy Settings
                  </button>
                </div>
              </div>
            )}

            {/* Notifications Tab */}
            {activeTab === 'notifications' && (
              <div>
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Notification Preferences</h2>
                <div className="space-y-6">
                  <ToggleSetting
                    title="Email Notifications"
                    description="Receive email notifications for important updates"
                    enabled={notificationForm.emailNotifications}
                    onChange={(val) => setNotificationForm({ ...notificationForm, emailNotifications: val })}
                  />

                  <ToggleSetting
                    title="Project Updates"
                    description="Get notified when projects you follow are updated"
                    enabled={notificationForm.projectUpdates}
                    onChange={(val) => setNotificationForm({ ...notificationForm, projectUpdates: val })}
                  />

                  <ToggleSetting
                    title="Comments on My Projects"
                    description="Receive notifications when someone comments on your projects"
                    enabled={notificationForm.commentsOnMyProjects}
                    onChange={(val) => setNotificationForm({ ...notificationForm, commentsOnMyProjects: val })}
                  />

                  <ToggleSetting
                    title="New Collaboration Matches"
                    description="Get notified when we find potential collaborators for you"
                    enabled={notificationForm.newCollaborationMatches}
                    onChange={(val) => setNotificationForm({ ...notificationForm, newCollaborationMatches: val })}
                  />

                  <ToggleSetting
                    title="Weekly Digest"
                    description="Receive a weekly email with platform highlights"
                    enabled={notificationForm.weeklyDigest}
                    onChange={(val) => setNotificationForm({ ...notificationForm, weeklyDigest: val })}
                  />

                  <ToggleSetting
                    title="Marketing Emails"
                    description="Receive emails about new features and updates"
                    enabled={notificationForm.marketingEmails}
                    onChange={(val) => setNotificationForm({ ...notificationForm, marketingEmails: val })}
                  />

                  <button
                    onClick={() => showMessage('success', 'Notification preferences saved!')}
                    className="w-full md:w-auto px-6 py-3 bg-teal-600 text-white rounded-lg font-medium hover:bg-teal-700 transition-colors"
                  >
                    Save Notification Settings
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// Toggle Setting Component
const ToggleSetting = ({ title, description, enabled, onChange }) => (
  <div className="flex items-start justify-between py-3">
    <div className="flex-1">
      <h3 className="text-sm font-semibold text-gray-900 mb-1">{title}</h3>
      <p className="text-sm text-gray-600">{description}</p>
    </div>
    <label className="relative inline-flex items-center cursor-pointer ml-4">
      <input
        type="checkbox"
        checked={enabled}
        onChange={(e) => onChange(e.target.checked)}
        className="sr-only peer"
      />
      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-teal-100 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-teal-600"></div>
    </label>
  </div>
);

export default SettingsPage;