import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { UserRole } from '../lib/supabase';
import Layout from '../components/common/Layout';
import OrgSelector from '../components/common/OrgSelector';

const UserProfilePage: React.FC = () => {
  const { user, signOut, createOrganization, joinOrganization, leaveOrganization, updateProfile, changePassword } = useAuth();
  const [activeTab, setActiveTab] = useState<'profile' | 'organizations' | 'security'>('profile');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Profile form state
  const [profileForm, setProfileForm] = useState({
    firstName: user?.profile?.first_name || '',
    lastName: user?.profile?.last_name || '',
    email: user?.email || ''
  });

  // Organization form state
  const [orgForm, setOrgForm] = useState({
    name: '',
    role: 'manager' as UserRole
  });
  const [joinOrgForm, setJoinOrgForm] = useState({
    orgId: '',
    role: 'user' as UserRole
  });

  // Security form state
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setLoading(true);

    try {
      await updateProfile(profileForm.firstName, profileForm.lastName);
      setSuccess('Profile updated successfully');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateOrganization = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setLoading(true);

    try {
      const org = await createOrganization(orgForm.name, orgForm.role);
      setSuccess(`Organization "${org.name}" created successfully`);
      setOrgForm({ name: '', role: 'manager' });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create organization');
    } finally {
      setLoading(false);
    }
  };

  const handleJoinOrganization = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setLoading(true);

    try {
      await joinOrganization(joinOrgForm.orgId, joinOrgForm.role);
      setSuccess('Successfully joined organization');
      setJoinOrgForm({ orgId: '', role: 'user' });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to join organization');
    } finally {
      setLoading(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setLoading(true);

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setError('New passwords do not match');
      setLoading(false);
      return;
    }

    try {
      await changePassword(passwordForm.currentPassword, passwordForm.newPassword);
      setSuccess('Password changed successfully');
      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to change password');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (!window.confirm('Are you sure you want to delete your account? This action cannot be undone.')) {
      return;
    }

    const secondConfirm = window.confirm('This will permanently delete your account and all associated data. Are you absolutely sure?');
    if (!secondConfirm) {
      return;
    }

    setError(null);
    setLoading(true);

    try {
      // Note: Supabase doesn't provide a direct way to delete user accounts from the client
      // This would typically require a server-side function or edge function
      // For now, we'll just sign out the user
      
      // In production, you would:
      // 1. Call a server-side endpoint to delete the user
      // 2. The server would use the Supabase Admin API to delete the user
      // 3. This would cascade delete related data based on foreign keys
      
      setError('Account deletion requires contacting support. You have been signed out.');
      setTimeout(async () => {
        await signOut();
        window.location.href = '/';
      }, 3000);
    } catch (err) {
      setError('Failed to process request');
    } finally {
      setLoading(false);
    }
  };

  const tabs = [
    { id: 'profile', name: 'Profile', icon: '' },
    { id: 'organizations', name: 'Organizations', icon: '' },
    { id: 'security', name: 'Security', icon: '' }
  ];

  return (
    <Layout>
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Org Selector */}
        <div className="mb-6">
          <OrgSelector />
        </div>
        
        {/* Header */}
        <div className="mb-8">
          <h1 className="title-text font-normal text-chatgpt-text-primary mb-2">
            Profile Settings
          </h1>
          <p className="content-text text-chatgpt-text-secondary">
            Manage your profile, organizations, and security settings
          </p>
        </div>

        {/* Tabs */}
        <div className="mb-8">
          <div className="inline-flex p-1 bg-gray-200 rounded-full">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`px-4 py-1 rounded-full font-normal content-text transition-all duration-200 relative ${
                  activeTab === tab.id
                    ? 'bg-white text-gray-900 shadow-sm z-10'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <span className="mr-2">{tab.icon}</span>
                {tab.name}
              </button>
            ))}
          </div>
        </div>

        {/* Error/Success Messages */}
        {error && (
          <div className="mb-6 p-3 bg-red-50 border border-red-200 rounded-lg">
            <p className="sidebar-text text-red-700">{error}</p>
          </div>
        )}
        {success && (
          <div className="mb-6 p-3 bg-green-50 border border-green-200 rounded-lg">
            <p className="sidebar-text text-green-700">{success}</p>
          </div>
        )}

        {/* Tab Content */}
        <div>
          {activeTab === 'profile' && (
            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <h3 className="title-text font-normal text-chatgpt-text-primary mb-6">Personal Information</h3>
              
              <form onSubmit={handleUpdateProfile} className="space-y-6">
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                  <div>
                    <label className="block sidebar-text font-normal text-gray-700 mb-2">
                      First Name
                    </label>
                    <input
                      type="text"
                      value={profileForm.firstName}
                      onChange={(e) => setProfileForm({ ...profileForm, firstName: e.target.value })}
                      className="chatgpt-input w-full"
                    />
                  </div>
                  <div>
                    <label className="block sidebar-text font-normal text-gray-700 mb-2">
                      Last Name
                    </label>
                    <input
                      type="text"
                      value={profileForm.lastName}
                      onChange={(e) => setProfileForm({ ...profileForm, lastName: e.target.value })}
                      className="chatgpt-input w-full"
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block sidebar-text font-normal text-gray-700 mb-2">
                    Email Address
                  </label>
                  <input
                    type="email"
                    value={profileForm.email}
                    disabled
                    className="chatgpt-input w-full bg-gray-50 text-gray-500"
                  />
                  <p className="mt-1 sidebar-text text-gray-500">Email cannot be changed</p>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="chatgpt-primary-button"
                >
                  {loading ? 'Updating...' : 'Update Profile'}
                </button>
              </form>
            </div>
          )}

          {activeTab === 'organizations' && (
            <div className="space-y-6">
              {/* Current Organizations */}
              <div>
                <h3 className="title-text font-normal text-chatgpt-text-primary mb-4">Your Organizations</h3>
                {user?.organizations && user.organizations.length > 0 ? (
                  <div className="bg-white border border-gray-200 rounded-lg p-3">
                    <div className="space-y-0">
                      {user.organizations.map((org) => (
                        <div key={org.id} className="p-3 rounded-md hover:bg-gray-50 transition-colors duration-200">
                          <div className="flex items-center justify-between">
                            <div>
                              <h4 className="content-text font-normal text-chatgpt-text-primary mb-1">{org.name}</h4>
                              <div className="flex items-center space-x-2">
                                <span className="sidebar-text text-chatgpt-text-secondary">
                                  Role: <span className="capitalize font-normal text-blue-600">{org.role}</span>
                                </span>
                                {org.is_primary && <span className="inline-flex items-center px-2 py-1 rounded-full sidebar-text font-normal bg-blue-100 text-blue-700">Primary</span>}
                              </div>
                            </div>
                            <button 
                              onClick={async () => {
                                try {
                                  setError(null);
                                  await leaveOrganization(org.id);
                                  setSuccess(`Left organization "${org.name}"`);
                                } catch (err) {
                                  setError(err instanceof Error ? err.message : 'Failed to leave organization');
                                }
                              }}
                              className="sidebar-text text-red-600 hover:text-red-700 transition-colors duration-200"
                            >
                              Leave
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="bg-white border border-gray-200 rounded-lg p-8 text-center">
                    <p className="content-text text-gray-500">You are not part of any organizations yet.</p>
                  </div>
                )}
              </div>

              {/* Create Organization */}
              <div className="bg-white border border-gray-200 rounded-lg p-6">
                <h3 className="title-text font-normal text-chatgpt-text-primary mb-6">Create New Organization</h3>
                <form onSubmit={handleCreateOrganization} className="space-y-6">
                  <div>
                    <label className="block sidebar-text font-normal text-gray-700 mb-2">
                      Organization Name
                    </label>
                    <input
                      type="text"
                      value={orgForm.name}
                      onChange={(e) => setOrgForm({ ...orgForm, name: e.target.value })}
                      required
                      className="chatgpt-input w-full"
                      placeholder="Enter organization name"
                    />
                  </div>
                  <div>
                    <label className="block sidebar-text font-normal text-gray-700 mb-2">
                      Your Role
                    </label>
                    <select
                      value={orgForm.role}
                      onChange={(e) => setOrgForm({ ...orgForm, role: e.target.value as UserRole })}
                      className="chatgpt-select w-full"
                    >
                      <option value="manager">Manager</option>
                      <option value="booker">Booker</option>
                    </select>
                  </div>
                  <button
                    type="submit"
                    disabled={loading}
                    className="chatgpt-primary-button"
                  >
                    {loading ? 'Creating...' : 'Create Organization'}
                  </button>
                </form>
              </div>

              {/* Join Organization */}
              <div className="bg-white border border-gray-200 rounded-lg p-6">
                <h3 className="title-text font-normal text-chatgpt-text-primary mb-6">Join Existing Organization</h3>
                <form onSubmit={handleJoinOrganization} className="space-y-6">
                  <div>
                    <label className="block sidebar-text font-normal text-gray-700 mb-2">
                      Organization ID
                    </label>
                    <input
                      type="text"
                      value={joinOrgForm.orgId}
                      onChange={(e) => setJoinOrgForm({ ...joinOrgForm, orgId: e.target.value })}
                      required
                      className="chatgpt-input w-full"
                      placeholder="Enter organization ID or invitation code"
                    />
                  </div>
                  <div>
                    <label className="block sidebar-text font-normal text-gray-700 mb-2">
                      Requested Role
                    </label>
                    <select
                      value={joinOrgForm.role}
                      onChange={(e) => setJoinOrgForm({ ...joinOrgForm, role: e.target.value as UserRole })}
                      className="chatgpt-select w-full"
                    >
                      <option value="user">User</option>
                      <option value="booker">Booker</option>
                      <option value="guest">Guest</option>
                    </select>
                  </div>
                  <button
                    type="submit"
                    disabled={loading}
                    className="chatgpt-primary-button"
                  >
                    {loading ? 'Joining...' : 'Join Organization'}
                  </button>
                </form>
              </div>
            </div>
          )}

          {activeTab === 'security' && (
            <div className="space-y-6">
              {/* Change Password */}
              <div className="bg-white border border-gray-200 rounded-lg p-6">
                <h3 className="title-text font-normal text-chatgpt-text-primary mb-6">Change Password</h3>
                <form onSubmit={handleChangePassword} className="space-y-6">
                  <div>
                    <label className="block sidebar-text font-normal text-gray-700 mb-2">
                      Current Password
                    </label>
                    <input
                      type="password"
                      value={passwordForm.currentPassword}
                      onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
                      required
                      className="chatgpt-input w-full"
                    />
                  </div>
                  <div>
                    <label className="block sidebar-text font-normal text-gray-700 mb-2">
                      New Password
                    </label>
                    <input
                      type="password"
                      value={passwordForm.newPassword}
                      onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                      required
                      minLength={6}
                      className="chatgpt-input w-full"
                    />
                  </div>
                  <div>
                    <label className="block sidebar-text font-normal text-gray-700 mb-2">
                      Confirm New Password
                    </label>
                    <input
                      type="password"
                      value={passwordForm.confirmPassword}
                      onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                      required
                      minLength={6}
                      className="chatgpt-input w-full"
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={loading}
                    className="chatgpt-primary-button"
                  >
                    {loading ? 'Updating...' : 'Change Password'}
                  </button>
                </form>
              </div>

              {/* Delete Account */}
              <div className="bg-white border border-red-200 rounded-lg p-6">
                <h3 className="title-text font-normal text-red-700 mb-4">Delete Account</h3>
                <p className="content-text text-gray-600 mb-6">
                  Once you delete your account, there is no going back. Please be certain.
                </p>
                <button
                  onClick={handleDeleteAccount}
                  disabled={loading}
                  className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 disabled:opacity-50 font-normal transition-colors duration-200"
                >
                  {loading ? 'Deleting...' : 'Delete Account'}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default UserProfilePage;