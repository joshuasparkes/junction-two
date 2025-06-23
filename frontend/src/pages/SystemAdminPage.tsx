import React, { useState, useEffect } from 'react';
import Layout from '../components/common/Layout';
import { 
  SystemAdminService, 
  SystemAdminOrganization, 
  OrganizationUser, 
  CreateUserData 
} from '../services/systemAdminService';

const SystemAdminPage: React.FC = () => {
  const [organizations, setOrganizations] = useState<SystemAdminOrganization[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrg, setSelectedOrg] = useState<string | null>(null);
  const [showCreateUser, setShowCreateUser] = useState(false);
  const [createForm, setCreateForm] = useState({
    email: '',
    first_name: '',
    last_name: '',
    role: 'user' as 'manager' | 'user' | 'booker',
  });
  const [systemStats, setSystemStats] = useState({
    totalOrganizations: 0,
    totalUsers: 0,
    parentOrganizations: 0,
    childOrganizations: 0,
  });
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'tree' | 'list'>('tree');
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredOrganizations, setFilteredOrganizations] = useState<SystemAdminOrganization[]>([]);

  useEffect(() => {
    loadData();
  }, []);

  // Filter organizations based on search query
  useEffect(() => {
    if (!searchQuery.trim()) {
      setFilteredOrganizations(organizations);
    } else {
      const filtered = organizations.filter(org => {
        const matchesOrg = org.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          org.users.some(user => 
            user.first_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            user.last_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            user.email.toLowerCase().includes(searchQuery.toLowerCase())
          );
        
        const matchesChild = org.child_organizations?.some(child =>
          child.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          child.users.some(user => 
            user.first_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            user.last_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            user.email.toLowerCase().includes(searchQuery.toLowerCase())
          )
        );

        return matchesOrg || matchesChild;
      });
      setFilteredOrganizations(filtered);
    }
  }, [organizations, searchQuery]);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      const [orgsData, statsData] = await Promise.all([
        SystemAdminService.getAllOrganizations(),
        SystemAdminService.getSystemStats(),
      ]);
      setOrganizations(orgsData);
      setSystemStats(statsData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateUser = async (orgId: string) => {
    if (!createForm.email || !createForm.first_name || !createForm.last_name) {
      setError('Please fill in all required fields');
      return;
    }

    try {
      setError(null);
      const userData: CreateUserData = {
        ...createForm,
        org_id: orgId,
      };
      
      await SystemAdminService.createUser(userData);
      setSuccess('User created successfully');
      setShowCreateUser(false);
      setCreateForm({
        email: '',
        first_name: '',
        last_name: '',
        role: 'user',
      });
      await loadData(); // Reload data
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create user');
    }
  };

  const handleDeleteUser = async (userId: string, orgId: string, userName: string) => {
    if (!window.confirm(`Are you sure you want to delete user "${userName}" from this organization?`)) {
      return;
    }

    try {
      setError(null);
      await SystemAdminService.deleteUserFromOrganization(userId, orgId);
      setSuccess('User deleted successfully');
      await loadData(); // Reload data
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete user');
    }
  };

  const renderOrganizationCard = (org: SystemAdminOrganization, isChild = false, depth = 0) => {
    const isExpanded = selectedOrg === org.id;
    
    return (
      <div key={org.id} className={`mb-4 ${depth > 0 ? 'ml-6' : ''}`}>
        {/* Connection Line for Child Organizations */}
        {isChild && viewMode === 'tree' && (
          <div className="relative">
            <div className="absolute -left-6 top-0 w-6 h-8 flex items-start justify-start">
              <div className="w-0.5 h-4 bg-blue-300 mt-4"></div>
              <div className="absolute top-6 left-0.5 w-4 h-0.5 bg-blue-300"></div>
              <div className="absolute top-6 left-4 w-1 h-1 bg-blue-400 rounded-full"></div>
            </div>
          </div>
        )}
        
        {/* Organization Card */}
        <div className={`border border-gray-200 rounded-lg overflow-hidden transition-all duration-200 hover:shadow-md ${
          isChild ? 'border-l-4 border-l-blue-200 bg-gradient-to-r from-blue-50 to-white' : 'shadow-sm bg-white'
        } ${isExpanded ? 'ring-2 ring-blue-200' : ''}`}>
          {/* Organization Header */}
          <div className={`px-6 py-4 ${isChild ? 'bg-blue-50' : 'bg-white'} border-b border-gray-200`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                {/* Organization Icon and Info */}
                <div className="flex items-center space-x-3">
                  <div className={`p-2 rounded-lg ${
                    org.is_parent ? 'bg-blue-100' : isChild ? 'bg-white' : 'bg-gray-100'
                  }`}>
                    {org.is_parent ? (
                      <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-4m-5 0H3m2 0h4M9 7h6m-6 4h6m-6 4h6" />
                      </svg>
                    ) : (
                      <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16l7-3 7 3z" />
                      </svg>
                    )}
                  </div>
                  <div>
                    <button
                      onClick={() => setSelectedOrg(isExpanded ? null : org.id)}
                      className="flex items-center space-x-2 hover:text-blue-600 transition-colors group"
                    >
                      <h3 className="title-text font-normal text-chatgpt-text-primary group-hover:text-blue-600">
                        {org.name}
                      </h3>
                      <svg 
                        className={`w-4 h-4 transition-transform text-gray-400 group-hover:text-blue-600 ${isExpanded ? 'rotate-90' : ''}`} 
                        fill="none" 
                        stroke="currentColor" 
                        viewBox="0 0 24 24"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </button>
                    <div className="flex items-center space-x-3 mt-1">
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                        org.is_parent ? 'bg-blue-100 text-blue-700' : 
                        isChild ? 'bg-indigo-100 text-indigo-700' : 
                        'bg-gray-100 text-gray-700'
                      }`}>
                        {org.is_parent ? 'Parent' : isChild ? 'Child' : 'Organization'}
                      </span>
                      <span className="sidebar-text text-gray-500 flex items-center">
                        <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                        </svg>
                        {org.users.length} user{org.users.length !== 1 ? 's' : ''}
                      </span>
                      {org.child_organizations && org.child_organizations.length > 0 && (
                        <span className="sidebar-text text-gray-500 flex items-center">
                          <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16l7-3 7 3z" />
                          </svg>
                          {org.child_organizations.length} child org{org.child_organizations.length !== 1 ? 's' : ''}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
              <div className="text-right">
                <p className="sidebar-text text-gray-600">
                  Created {new Date(org.created_at).toLocaleDateString()}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Organization Details (when expanded) */}
        {isExpanded && (
          <div className="p-6">
            {/* Organization Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div>
                <h4 className="content-text font-normal text-chatgpt-text-primary mb-2">Contact Information</h4>
                <p className="sidebar-text text-gray-600 mb-1">
                  <span className="font-medium">Address:</span> {org.address}
                </p>
                <p className="sidebar-text text-gray-600">
                  <span className="font-medium">Phone:</span> {org.phone}
                </p>
              </div>
              <div>
                <h4 className="content-text font-normal text-chatgpt-text-primary mb-2">Organization Details</h4>
                <p className="sidebar-text text-gray-600 mb-1">
                  <span className="font-medium">Type:</span> {org.is_parent ? 'Parent Organization' : 'Child Organization'}
                </p>
                {org.parent_org_id && (
                  <p className="sidebar-text text-gray-600">
                    <span className="font-medium">Parent:</span> {
                      organizations.find(p => p.id === org.parent_org_id)?.name || 'Unknown'
                    }
                  </p>
                )}
              </div>
            </div>

            {/* Users Section */}
            <div className="border-t pt-6">
              <div className="flex items-center justify-between mb-4">
                <h4 className="content-text font-normal text-chatgpt-text-primary">
                  Users ({org.users.length})
                </h4>
                <button
                  onClick={() => {
                    setSelectedOrg(org.id);
                    setShowCreateUser(true);
                  }}
                  className="chatgpt-primary-button text-sm px-3 py-1"
                >
                  Add User
                </button>
              </div>

              {/* Create User Form */}
              {showCreateUser && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                  <h5 className="content-text font-normal text-blue-900 mb-3">Add New User to {org.name}</h5>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <input
                      type="email"
                      placeholder="Email"
                      value={createForm.email}
                      onChange={(e) => setCreateForm(prev => ({ ...prev, email: e.target.value }))}
                      className="chatgpt-input"
                    />
                    <select
                      value={createForm.role}
                      onChange={(e) => setCreateForm(prev => ({ ...prev, role: e.target.value as 'manager' | 'user' | 'booker' }))}
                      className="chatgpt-input"
                    >
                      <option value="user">User</option>
                      <option value="booker">Booker</option>
                      <option value="manager">Manager</option>
                    </select>
                    <input
                      type="text"
                      placeholder="First Name"
                      value={createForm.first_name}
                      onChange={(e) => setCreateForm(prev => ({ ...prev, first_name: e.target.value }))}
                      className="chatgpt-input"
                    />
                    <input
                      type="text"
                      placeholder="Last Name"
                      value={createForm.last_name}
                      onChange={(e) => setCreateForm(prev => ({ ...prev, last_name: e.target.value }))}
                      className="chatgpt-input"
                    />
                  </div>
                  <div className="flex space-x-2 mt-4">
                    <button
                      onClick={() => handleCreateUser(org.id)}
                      className="chatgpt-primary-button text-sm px-4 py-2"
                    >
                      Create User
                    </button>
                    <button
                      onClick={() => setShowCreateUser(false)}
                      className="chatgpt-button text-sm px-4 py-2"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}

              {/* Users List */}
              {org.users.length > 0 ? (
                <div className="space-y-2">
                  {org.users.map((user) => (
                    <div key={user.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-md">
                      <div className="flex items-center space-x-4">
                        <div>
                          <p className="sidebar-text font-medium text-chatgpt-text-primary">
                            {user.first_name} {user.last_name}
                          </p>
                          <p className="sidebar-text text-gray-600">{user.email}</p>
                        </div>
                        <span className={`inline-flex items-center px-2 py-1 rounded-full sidebar-text ${
                          user.role === 'manager' ? 'bg-purple-100 text-purple-700' :
                          user.role === 'booker' ? 'bg-green-100 text-green-700' :
                          'bg-gray-100 text-gray-700'
                        }`}>
                          {user.role}
                        </span>
                        {user.is_primary && (
                          <span className="inline-flex items-center px-2 py-1 rounded-full sidebar-text bg-blue-100 text-blue-700">
                            Primary
                          </span>
                        )}
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className="sidebar-text text-gray-500">
                          Joined {new Date(user.joined_at).toLocaleDateString()}
                        </span>
                        <button
                          onClick={() => handleDeleteUser(user.id, org.id, `${user.first_name} ${user.last_name}`)}
                          className="sidebar-text text-red-600 hover:text-red-700 transition-colors ml-4"
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-6 text-gray-500">
                  <p className="sidebar-text">No users in this organization</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Child Organizations */}
        {org.child_organizations && org.child_organizations.length > 0 && (
          <div className="mt-4">
            {org.child_organizations.map(childOrg => renderOrganizationCard(childOrg, true, depth + 1))}
          </div>
        )}
      </div>
    );
  };

  return (
    <Layout>
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="title-text font-normal text-chatgpt-text-primary mb-2">
            System Administration
          </h1>
          <p className="content-text text-chatgpt-text-secondary">
            Manage all organizations and users across the system
          </p>
        </div>

        {/* System Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white border border-gray-200 rounded-lg p-4">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-4m-5 0H3m2 0h4M9 7h6m-6 4h6m-6 4h6" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="sidebar-text text-gray-600">Total Organizations</p>
                <p className="title-text font-normal text-chatgpt-text-primary">{systemStats.totalOrganizations}</p>
              </div>
            </div>
          </div>
          <div className="bg-white border border-gray-200 rounded-lg p-4">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="sidebar-text text-gray-600">Total Users</p>
                <p className="title-text font-normal text-chatgpt-text-primary">{systemStats.totalUsers}</p>
              </div>
            </div>
          </div>
          <div className="bg-white border border-gray-200 rounded-lg p-4">
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 rounded-lg">
                <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="sidebar-text text-gray-600">Parent Organizations</p>
                <p className="title-text font-normal text-chatgpt-text-primary">{systemStats.parentOrganizations}</p>
              </div>
            </div>
          </div>
          <div className="bg-white border border-gray-200 rounded-lg p-4">
            <div className="flex items-center">
              <div className="p-2 bg-orange-100 rounded-lg">
                <svg className="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16l7-3 7 3z" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="sidebar-text text-gray-600">Child Organizations</p>
                <p className="title-text font-normal text-chatgpt-text-primary">{systemStats.childOrganizations}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Messages */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
            {error}
          </div>
        )}
        
        {success && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg text-green-700">
            {success}
          </div>
        )}

        {/* Loading State */}
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-2 sidebar-text text-chatgpt-text-secondary">Loading organizations...</p>
          </div>
        ) : (
          /* Organizations List */
          <div>
            <div className="flex flex-col lg:flex-row lg:items-center justify-between mb-6 space-y-4 lg:space-y-0">
              <div className="flex items-center space-x-4">
                <h2 className="title-text font-normal text-chatgpt-text-primary">
                  Organizations ({filteredOrganizations.length}{searchQuery && ` of ${organizations.length}`})
                </h2>
                {searchQuery && (
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-blue-100 text-blue-700">
                    Filtered
                  </span>
                )}
              </div>
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center space-y-2 sm:space-y-0 sm:space-x-4">
                {/* Search Input */}
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <svg className="h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  </div>
                  <input
                    type="text"
                    placeholder="Search organizations or users..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm w-full sm:w-64"
                  />
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery('')}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center"
                    >
                      <svg className="h-4 w-4 text-gray-400 hover:text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  )}
                </div>
                {/* View Mode Toggle */}
                <div className="flex items-center bg-gray-100 rounded-lg p-1">
                  <button
                    onClick={() => setViewMode('tree')}
                    className={`px-3 py-1 rounded-md text-sm transition-colors ${
                      viewMode === 'tree' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    <div className="flex items-center space-x-1">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7v10" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 7v10" />
                      </svg>
                      <span>Tree</span>
                    </div>
                  </button>
                  <button
                    onClick={() => setViewMode('list')}
                    className={`px-3 py-1 rounded-md text-sm transition-colors ${
                      viewMode === 'list' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    <div className="flex items-center space-x-1">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
                      </svg>
                      <span>List</span>
                    </div>
                  </button>
                </div>
                <button
                  onClick={loadData}
                  className="chatgpt-button flex items-center space-x-2"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  <span>Refresh</span>
                </button>
              </div>
            </div>

            {filteredOrganizations.length > 0 ? (
              <div>
                {viewMode === 'tree' ? (
                  // Tree view - shows hierarchical structure
                  <div>
                    {filteredOrganizations.map(org => renderOrganizationCard(org))}
                  </div>
                ) : (
                  // List view - shows all organizations flat
                  <div className="space-y-4">
                    {filteredOrganizations.map(org => (
                      <div key={`parent-${org.id}`}>
                        {renderOrganizationCard(org, false, 0)}
                        {org.child_organizations && org.child_organizations.map(childOrg => (
                          <div key={`child-${childOrg.id}`} className="mt-2">
                            {renderOrganizationCard(childOrg, true, 0)}
                          </div>
                        ))}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-12">
                <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-4m-5 0H3m2 0h4M9 7h6m-6 4h6m-6 4h6" />
                </svg>
                <h3 className="mt-2 content-text font-normal text-chatgpt-text-primary">No organizations found</h3>
                <p className="mt-1 sidebar-text text-chatgpt-text-secondary">
                  There are no organizations in the system yet.
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </Layout>
  );
};

export default SystemAdminPage;