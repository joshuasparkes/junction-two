import React, { useState, useEffect } from "react";
import Layout from "../components/common/Layout";
import { useAuth } from "../contexts/AuthContext";
import { OrganizationService } from "../services/organizationService";
import { createUser, CreateUserData, getOrganizationMembers, removeUserFromOrganization, OrganizationMember } from "../services/peopleService";
import { Organization } from "../lib/supabase";

const OrgManagerPage: React.FC = () => {
  const { user, currentOrganization } = useAuth();
  const [childOrgs, setChildOrgs] = useState<Organization[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showManageUsersModal, setShowManageUsersModal] = useState(false);
  const [showCreateUserModal, setShowCreateUserModal] = useState(false);
  const [selectedChildOrg, setSelectedChildOrg] = useState<Organization | null>(null);
  const [childOrgUsers, setChildOrgUsers] = useState<OrganizationMember[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [createForm, setCreateForm] = useState({
    name: "",
    address: "",
    phone: "",
  });
  const [createUserForm, setCreateUserForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    role: "user",
  });

  // Check if current organization is a parent
  const [isParentOrg, setIsParentOrg] = useState(false);

  useEffect(() => {
    checkParentStatus();
  }, [currentOrganization]);

  useEffect(() => {
    if (isParentOrg) {
      fetchChildOrganizations();
    }
  }, [isParentOrg]);

  const checkParentStatus = async () => {
    if (!currentOrganization) return;
    
    try {
      const isParent = await OrganizationService.checkParentStatus(currentOrganization.id);
      setIsParentOrg(isParent);
    } catch (error) {
      console.error("Error checking parent status:", error);
    }
  };

  const fetchChildOrganizations = async () => {
    if (!currentOrganization) return;

    setLoading(true);
    try {
      const childOrgs = await OrganizationService.getChildOrganizations(currentOrganization.id);
      setChildOrgs(childOrgs);
    } catch (error) {
      console.error("Error fetching child organizations:", error);
      setError("Failed to load child organizations");
    } finally {
      setLoading(false);
    }
  };

  const handleCreateChildOrg = async () => {
    if (!currentOrganization || !user) return;

    try {
      // Remove debug logging
      // console.log('Creating child org with user:', user);
      
      const newOrg = await OrganizationService.createChildOrganization({
        name: createForm.name,
        address: createForm.address,
        phone: createForm.phone,
        parent_org_id: currentOrganization.id
        // Omitting created_by and owner_id to avoid foreign key constraint issues
      });

      setChildOrgs([...childOrgs, newOrg]);
      setShowCreateModal(false);
      setCreateForm({ name: "", address: "", phone: "" });
    } catch (error) {
      console.error("Error creating child organization:", error);
      setError("Failed to create child organization");
    }
  };

  const handleDeleteChildOrg = async (orgId: string) => {
    if (!window.confirm("Are you sure you want to delete this child organization?")) return;

    try {
      await OrganizationService.deleteChildOrganization(orgId);
      setChildOrgs(childOrgs.filter(org => org.id !== orgId));
    } catch (error) {
      console.error("Error deleting child organization:", error);
      setError("Failed to delete child organization");
    }
  };

  const enableParentMode = async () => {
    if (!currentOrganization) return;

    try {
      await OrganizationService.enableParentMode(currentOrganization.id);
      setIsParentOrg(true);
    } catch (error) {
      console.error("Error enabling parent mode:", error);
      setError("Failed to enable parent organization mode");
    }
  };

  const handleCreateSuperUser = async () => {
    if (!selectedChildOrg) return;

    try {
      await createUser({
        firstName: createUserForm.firstName,
        lastName: createUserForm.lastName,
        email: createUserForm.email,
        role: createUserForm.role,
        orgId: selectedChildOrg.id
      });

      setShowCreateUserModal(false);
      setCreateUserForm({ firstName: "", lastName: "", email: "", role: "user" });
      // Refresh the users list
      if (selectedChildOrg) {
        await fetchChildOrgUsers(selectedChildOrg.id);
      }
    } catch (error) {
      console.error("Error creating super user:", error);
      setError("Failed to create super user");
    }
  };

  const openManageUsersModal = async (org: Organization) => {
    setSelectedChildOrg(org);
    setShowManageUsersModal(true);
    await fetchChildOrgUsers(org.id);
  };

  const openCreateUserModal = () => {
    setShowCreateUserModal(true);
  };

  const fetchChildOrgUsers = async (orgId: string) => {
    setLoadingUsers(true);
    try {
      const users = await getOrganizationMembers(orgId);
      setChildOrgUsers(users);
    } catch (error) {
      console.error("Error fetching organization users:", error);
      setError("Failed to load organization users");
    } finally {
      setLoadingUsers(false);
    }
  };

  const handleDeleteUser = async (userId: string) => {
    if (!selectedChildOrg) return;
    if (!window.confirm("Are you sure you want to remove this user from the organization?")) return;

    try {
      await removeUserFromOrganization(userId, selectedChildOrg.id);
      setChildOrgUsers(childOrgUsers.filter(user => user.user_id !== userId));
    } catch (error) {
      console.error("Error removing user:", error);
      setError("Failed to remove user from organization");
    }
  };

  return (
    <Layout>
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8">
          <div>
            <h1 className="title-text font-normal text-chatgpt-text-primary mb-2">
              Organization Manager
            </h1>
            <p className="content-text text-chatgpt-text-secondary">
              Manage your child organizations
            </p>
          </div>
        </div>

        {!isParentOrg ? (
          <div className="text-center py-12">
            <div className="mx-auto h-16 w-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
              <svg className="h-8 w-8 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-10 0H3m2 0h5m-5-16v16" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">Enable Parent Organization Mode</h3>
            <p className="text-gray-600 mb-6">
              As a parent organization, you can create and manage child organizations.
            </p>
            <button
              onClick={enableParentMode}
              className="chatgpt-primary-button inline-flex items-center justify-center"
            >
              Enable Parent Mode
            </button>
          </div>
        ) : (
          <>
            {/* Action Bar */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8">
              <div className="content-text text-chatgpt-text-secondary">
                {childOrgs.length} child organization{childOrgs.length !== 1 ? 's' : ''}
              </div>
              <button
                onClick={() => setShowCreateModal(true)}
                className="chatgpt-primary-button inline-flex items-center justify-center"
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Add Child Organization
              </button>
            </div>

            {/* Child Organizations List */}
            {loading ? (
              <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                <span className="ml-3 text-lg text-gray-600">Loading organizations...</span>
              </div>
            ) : error ? (
              <div className="text-center py-12">
                <div className="mx-auto h-16 w-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
                  <svg className="h-8 w-8 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">Error loading organizations</h3>
                <p className="text-gray-600">{error}</p>
              </div>
            ) : childOrgs.length === 0 ? (
              <div className="text-center py-12">
                <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-10 0H3m2 0h5m-5-16v16" />
                </svg>
                <h3 className="mt-2 text-sm font-medium text-gray-900">No child organizations found</h3>
                <p className="mt-1 text-sm text-gray-500">Get started by creating your first child organization!</p>
                <div className="mt-6">
                  <button
                    onClick={() => setShowCreateModal(true)}
                    className="chatgpt-primary-button inline-flex items-center justify-center"
                  >
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    Create Child Organization
                  </button>
                </div>
              </div>
            ) : (
              <div className="bg-white border border-gray-200 rounded-lg p-3">
                <div className="space-y-0">
                  {childOrgs.map((org) => (
                    <div key={org.id} className="p-3 rounded-md hover:bg-gray-50 transition-colors duration-200">
                      <div className="flex items-start justify-between mb-1">
                        <h3 className="content-text font-normal text-chatgpt-text-primary">
                          {org.name}
                        </h3>
                        <span className="inline-flex items-center px-2 py-1 rounded-full sidebar-text bg-green-100 text-green-700 whitespace-nowrap">
                          Active
                        </span>
                      </div>
                      
                      <p className="sidebar-text text-chatgpt-text-secondary mb-2">
                        {org.address || "No address set"} • {org.phone || "No phone set"}
                      </p>
                      
                      <div className="flex items-center justify-between">
                        <p className="sidebar-text text-gray-500">
                          Created {new Date(org.created_at).toLocaleDateString()}
                        </p>
                        <div className="flex items-center gap-4">
                          <button
                            onClick={() => openManageUsersModal(org)}
                            className="sidebar-text text-blue-600 hover:text-blue-700 transition-colors duration-200"
                            title="Manage users in this organization"
                          >
                            Manage Users
                          </button>
                          <button
                            onClick={() => handleDeleteChildOrg(org.id)}
                            className="sidebar-text text-red-600 hover:text-red-700 transition-colors duration-200"
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}

        {/* Create Modal */}
        {showCreateModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md">
              <h2 className="content-text font-normal text-chatgpt-text-primary mb-4">Create Child Organization</h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block sidebar-text text-chatgpt-text-secondary mb-1">
                    Organization Name
                  </label>
                  <input
                    type="text"
                    value={createForm.name}
                    onChange={(e) => setCreateForm({ ...createForm, name: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 sidebar-text"
                    placeholder="Enter organization name"
                  />
                </div>

                <div>
                  <label className="block sidebar-text text-chatgpt-text-secondary mb-1">
                    Address
                  </label>
                  <input
                    type="text"
                    value={createForm.address}
                    onChange={(e) => setCreateForm({ ...createForm, address: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 sidebar-text"
                    placeholder="Enter address"
                  />
                </div>

                <div>
                  <label className="block sidebar-text text-chatgpt-text-secondary mb-1">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    value={createForm.phone}
                    onChange={(e) => setCreateForm({ ...createForm, phone: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 sidebar-text"
                    placeholder="Enter phone number"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 mt-6">
                <button
                  onClick={() => setShowCreateModal(false)}
                  className="sidebar-text text-chatgpt-text-secondary hover:text-chatgpt-text-primary transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleCreateChildOrg}
                  disabled={!createForm.name || !createForm.address || !createForm.phone}
                  className="chatgpt-primary-button disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Create Organization
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Manage Users Modal */}
        {showManageUsersModal && selectedChildOrg && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-2xl max-h-[80vh] overflow-y-auto">
              <div className="flex justify-between items-center mb-6">
                <h2 className="content-text font-normal text-chatgpt-text-primary">
                  Manage Users - {selectedChildOrg.name}
                </h2>
                <button
                  onClick={() => {
                    setShowManageUsersModal(false);
                    setSelectedChildOrg(null);
                    setChildOrgUsers([]);
                  }}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* Add User Button */}
              <div className="mb-6">
                <button
                  onClick={openCreateUserModal}
                  className="chatgpt-primary-button inline-flex items-center justify-center"
                >
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  Add User
                </button>
              </div>

              {/* Users List */}
              {loadingUsers ? (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                  <span className="ml-3 sidebar-text">Loading users...</span>
                </div>
              ) : childOrgUsers.length === 0 ? (
                <div className="text-center py-8">
                  <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                  </svg>
                  <h3 className="mt-2 text-sm font-medium text-gray-900">No users found</h3>
                  <p className="mt-1 text-sm text-gray-500">Get started by adding the first user to this organization.</p>
                </div>
              ) : (
                <div className="bg-white border border-gray-200 rounded-lg">
                  <div className="space-y-0">
                    {childOrgUsers.map((member) => (
                      <div key={member.id} className="p-4 border-b border-gray-100 last:border-b-0">
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-3">
                              <div className="h-10 w-10 rounded-full bg-blue-600 flex items-center justify-center">
                                <span className="text-white text-sm font-medium">
                                  {(member.user_profiles.first_name?.charAt(0) || member.user_profiles.email.charAt(0)).toUpperCase()}
                                </span>
                              </div>
                              <div>
                                <h3 className="content-text font-normal text-chatgpt-text-primary">
                                  {member.user_profiles.first_name && member.user_profiles.last_name
                                    ? `${member.user_profiles.first_name} ${member.user_profiles.last_name}`
                                    : member.user_profiles.email
                                  }
                                </h3>
                                <p className="sidebar-text text-chatgpt-text-secondary">
                                  {member.user_profiles.email}
                                </p>
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-4">
                            <span className={`inline-flex items-center px-2 py-1 rounded-full sidebar-text whitespace-nowrap ${
                              member.role === 'manager' ? 'bg-purple-100 text-purple-700' :
                              member.role === 'booker' ? 'bg-blue-100 text-blue-700' :
                              'bg-gray-100 text-gray-700'
                            }`}>
                              {member.role.charAt(0).toUpperCase() + member.role.slice(1)}
                            </span>
                            {member.is_primary && (
                              <span className="inline-flex items-center px-2 py-1 rounded-full sidebar-text bg-green-100 text-green-700 whitespace-nowrap">
                                Primary
                              </span>
                            )}
                            <button
                              onClick={() => handleDeleteUser(member.user_id)}
                              className="sidebar-text text-red-600 hover:text-red-700 transition-colors duration-200"
                            >
                              Remove
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Create User Modal */}
        {showCreateUserModal && selectedChildOrg && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md">
              <h2 className="content-text font-normal text-chatgpt-text-primary mb-4">
                Add User to {selectedChildOrg.name}
              </h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block sidebar-text text-chatgpt-text-secondary mb-1">
                    First Name
                  </label>
                  <input
                    type="text"
                    value={createUserForm.firstName}
                    onChange={(e) => setCreateUserForm({ ...createUserForm, firstName: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 sidebar-text"
                    placeholder="Enter first name"
                  />
                </div>

                <div>
                  <label className="block sidebar-text text-chatgpt-text-secondary mb-1">
                    Last Name
                  </label>
                  <input
                    type="text"
                    value={createUserForm.lastName}
                    onChange={(e) => setCreateUserForm({ ...createUserForm, lastName: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 sidebar-text"
                    placeholder="Enter last name"
                  />
                </div>

                <div>
                  <label className="block sidebar-text text-chatgpt-text-secondary mb-1">
                    Email Address
                  </label>
                  <input
                    type="email"
                    value={createUserForm.email}
                    onChange={(e) => setCreateUserForm({ ...createUserForm, email: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 sidebar-text"
                    placeholder="Enter email address"
                  />
                </div>

                <div>
                  <label className="block sidebar-text text-chatgpt-text-secondary mb-1">
                    Role
                  </label>
                  <select
                    value={createUserForm.role || "user"}
                    onChange={(e) => setCreateUserForm({ ...createUserForm, role: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 sidebar-text"
                  >
                    <option value="user">User</option>
                    <option value="booker">Booker</option>
                    <option value="manager">Manager</option>
                  </select>
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                  <p className="sidebar-text text-blue-800">
                    <strong>Note:</strong> This will create a user account with a temporary password that will be displayed after creation.
                  </p>
                </div>
              </div>

              <div className="flex justify-end gap-3 mt-6">
                <button
                  onClick={() => {
                    setShowCreateUserModal(false);
                    setCreateUserForm({ firstName: "", lastName: "", email: "", role: "user" });
                  }}
                  className="sidebar-text text-chatgpt-text-secondary hover:text-chatgpt-text-primary transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleCreateSuperUser}
                  disabled={!createUserForm.firstName || !createUserForm.lastName || !createUserForm.email}
                  className="chatgpt-primary-button disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Add User
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default OrgManagerPage;