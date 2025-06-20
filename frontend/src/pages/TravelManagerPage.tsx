import React, { useState, useEffect } from "react";
import Layout from "../components/common/Layout";
import { useAuth } from "../contexts/AuthContext";
import { 
  getOrganizationMembers, 
  createUser, 
  inviteUser, 
  removeUserFromOrganization,
  getOrganizationInvitations,
  OrganizationMember,
  CreateUserData,
  InviteUserData 
} from "../services/peopleService";

const TravelManagerPage: React.FC = () => {
  const { currentOrganization } = useAuth();
  const [activeMainTab, setActiveMainTab] = useState("company");
  const [activeSubTab, setActiveSubTab] = useState("profile");
  
  // Company data state
  const [companyData, setCompanyData] = useState({
    logo: "/junction-logo2.png",
    hero: "https://images.unsplash.com/photo-1497366216548-37526070297c?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80",
    name: currentOrganization?.name || "Company Name",
    billingAddress: "6 Wellington Place, Leeds, ENG, United Kingdom, LS1 4AP",
    phoneNumber: "N/A",
  });
  
  // Edit mode states
  const [editMode, setEditMode] = useState<string | null>(null);
  const [editValue, setEditValue] = useState("");
  
  // Modal states
  const [showCreateUserModal, setShowCreateUserModal] = useState(false);
  const [showInviteUserModal, setShowInviteUserModal] = useState(false);
  const [showAddCardModal, setShowAddCardModal] = useState(false);
  
  // Real data states
  const [members, setMembers] = useState<OrganizationMember[]>([]);
  const [invitations, setInvitations] = useState<any[]>([]);
  const [loadingMembers, setLoadingMembers] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Form states
  const [createUserForm, setCreateUserForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    role: 'member'
  });
  
  const [inviteUserForm, setInviteUserForm] = useState({
    email: '',
    role: 'member',
    message: ''
  });
  
  const [paymentMethods, setPaymentMethods] = useState([
    { id: '1', type: 'Visa', lastFour: '1234', expiry: '12/27', name: 'Company Travel Account', isDefault: true },
    { id: '2', type: 'Mastercard', lastFour: '5678', expiry: '06/26', name: 'Backup Corporate Card', isDefault: false }
  ]);
  
  const [organizationPolicies, setOrganizationPolicies] = useState([
    { id: '1', name: 'Default Travel Policy', preTripApproval: 'only_when_out_of_policy', outOfPolicyMessage: 'Please provide justification for out-of-policy bookings' }
  ]);
  
  const [policyGroups, setPolicyGroups] = useState([
    { id: '1', name: 'Executive Travel', description: 'High-tier travel options for executives', priority: 1 },
    { id: '2', name: 'Standard Travel', description: 'Standard business travel guidelines', priority: 2 },
    { id: '3', name: 'Budget Travel', description: 'Cost-effective travel options', priority: 3 }
  ]);
  
  const [outOfPolicyReasons, setOutOfPolicyReasons] = useState([
    { id: '1', reason: 'Last minute booking', description: 'Booking made within 24 hours of travel', requiresApproval: true },
    { id: '2', reason: 'Client meeting requirement', description: 'Required for important client meeting', requiresApproval: false },
    { id: '3', reason: 'No alternative available', description: 'No policy-compliant options available', requiresApproval: true },
    { id: '4', reason: 'Emergency travel', description: 'Urgent business need', requiresApproval: true }
  ]);

  const mainTabs = [
    { id: "company", label: "Company" },
    { id: "activity-stream", label: "Activity Stream" },
    { id: "policies", label: "Policies" },
    { id: "people", label: "People" },
    { id: "guests", label: "Guests" },
    { id: "payment", label: "Payment" },
    { id: "trips", label: "Trips" },
    { id: "loyalty", label: "Loyalty" },
    { id: "reporting", label: "Reporting" },
    { id: "integrations", label: "Integrations" },
  ];

  const subTabs = [
    { id: "profile", label: "Profile" },
    { id: "permissions", label: "Permissions" },
    { id: "custom-fields", label: "Custom Fields" },
    { id: "email", label: "Email" },
  ];

  // Update company name when organization changes
  useEffect(() => {
    if (currentOrganization) {
      setCompanyData(prev => ({
        ...prev,
        name: currentOrganization.name
      }));
    }
  }, [currentOrganization]);
  
  // Edit handlers
  const handleEdit = (field: string, currentValue: string) => {
    setEditMode(field);
    setEditValue(currentValue);
  };
  
  const handleSave = (field: string) => {
    setCompanyData(prev => ({
      ...prev,
      [field]: editValue
    }));
    setEditMode(null);
    setEditValue("");
  };
  
  const handleCancel = () => {
    setEditMode(null);
    setEditValue("");
  };
  
  // Load organization members and invitations
  const loadMembersData = async () => {
    if (!currentOrganization) return;
    
    setLoadingMembers(true);
    setError(null);
    
    try {
      console.log('Loading members for organization:', currentOrganization.id);
      const [membersData, invitationsData] = await Promise.all([
        getOrganizationMembers(currentOrganization.id),
        getOrganizationInvitations(currentOrganization.id)
      ]);
      
      setMembers(membersData);
      setInvitations(invitationsData);
      console.log(`Loaded ${membersData.length} members and ${invitationsData.length} invitations`);
    } catch (err) {
      console.error('Error loading members data:', err);
      setError(err instanceof Error ? err.message : 'Failed to load members data');
    } finally {
      setLoadingMembers(false);
    }
  };
  
  // Load data when organization changes
  useEffect(() => {
    if (currentOrganization && activeMainTab === 'people') {
      loadMembersData();
    }
  }, [currentOrganization, activeMainTab]);
  
  // Handle create user form submission
  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentOrganization) return;
    
    try {
      setError(null);
      const userData: CreateUserData = {
        firstName: createUserForm.firstName,
        lastName: createUserForm.lastName,
        email: createUserForm.email,
        role: createUserForm.role,
        orgId: currentOrganization.id
      };
      
      await createUser(userData);
      
      // Reset form and close modal
      setCreateUserForm({ firstName: '', lastName: '', email: '', role: 'member' });
      setShowCreateUserModal(false);
      
      // Reload members data
      await loadMembersData();
    } catch (err) {
      console.error('Error creating user:', err);
      setError(err instanceof Error ? err.message : 'Failed to create user');
    }
  };
  
  // Handle invite user form submission
  const handleInviteUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentOrganization) return;
    
    try {
      setError(null);
      const inviteData: InviteUserData = {
        email: inviteUserForm.email,
        role: inviteUserForm.role,
        orgId: currentOrganization.id,
        message: inviteUserForm.message || undefined
      };
      
      await inviteUser(inviteData);
      
      // Reset form and close modal
      setInviteUserForm({ email: '', role: 'member', message: '' });
      setShowInviteUserModal(false);
      
      // Reload invitations data
      await loadMembersData();
    } catch (err) {
      console.error('Error inviting user:', err);
      setError(err instanceof Error ? err.message : 'Failed to send invitation');
    }
  };
  
  // Handle remove user
  const handleRemoveUser = async (userId: string) => {
    if (!currentOrganization) return;
    
    if (!window.confirm('Are you sure you want to remove this user from the organization?')) {
      return;
    }
    
    try {
      setError(null);
      await removeUserFromOrganization(userId, currentOrganization.id);
      await loadMembersData();
    } catch (err) {
      console.error('Error removing user:', err);
      setError(err instanceof Error ? err.message : 'Failed to remove user');
    }
  };

  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
        {/* Main Navigation */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 shadow-lg">
          <div className="w-full">
            <nav className="flex space-x-1 overflow-x-auto px-4">
              {mainTabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveMainTab(tab.id)}
                  className={`px-4 py-4 text-sm font-medium whitespace-nowrap rounded-t-lg transition-all duration-200 ${
                    activeMainTab === tab.id
                      ? "text-blue-600 bg-white border-b-4 border-blue-600 shadow-sm transform translate-y-1"
                      : "text-blue-100 hover:text-white hover:bg-blue-500 hover:bg-opacity-20"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* Sub Navigation - Only show for Company tab */}
        {activeMainTab === "company" && (
          <div className="bg-white border-b border-gray-200 shadow-sm">
            <div className="w-full">
              <nav className="flex space-x-8 px-6 overflow-x-auto">
                {subTabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveSubTab(tab.id)}
                    className={`px-1 py-4 text-sm font-medium border-b-2 transition-all duration-200 whitespace-nowrap ${
                      activeSubTab === tab.id
                        ? "text-blue-600 border-blue-600"
                        : "text-gray-500 border-transparent hover:text-gray-700 hover:border-gray-300"
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </nav>
            </div>
          </div>
        )}

        {/* Content */}
        <div className="w-full px-6 py-8">
          {/* Company Profile Tab */}
          {activeMainTab === "company" && activeSubTab === "profile" && (
            <div className="space-y-8">
              <div className="text-center">
                <h1 className="text-3xl font-bold text-gray-900 mb-3">
                  Company Profile
                </h1>
                <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                  Manage your company information and settings to keep your travel platform up to date.
                </p>
              </div>

              <div className="grid gap-6">
                {/* Company Name Card */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow duration-300">
                  <div className="p-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                          <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-4m-5 0H3m2 0h4M9 7h6m-6 4h6m-6 4h6" />
                          </svg>
                        </div>
                        <div className="flex-1">
                          <h3 className="text-lg font-semibold text-gray-900 mb-1">Company Name</h3>
                          <div className="text-sm text-gray-500 mb-3">Your organization's display name</div>
                          {editMode === 'name' ? (
                            <div className="flex items-center space-x-3">
                              <input
                                type="text"
                                value={editValue}
                                onChange={(e) => setEditValue(e.target.value)}
                                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                placeholder="Enter company name"
                              />
                              <button
                                onClick={() => handleSave('name')}
                                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200 font-medium"
                              >
                                Save
                              </button>
                              <button
                                onClick={handleCancel}
                                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors duration-200 font-medium"
                              >
                                Cancel
                              </button>
                            </div>
                          ) : (
                            <p className="text-lg font-medium text-gray-900">
                              {companyData.name}
                            </p>
                          )}
                        </div>
                      </div>
                      {editMode !== 'name' && (
                        <button 
                          onClick={() => handleEdit('name', companyData.name)}
                          className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all duration-200"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                        </button>
                      )}
                    </div>
                  </div>
                </div>

                {/* Billing Address Card */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow duration-300">
                  <div className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start space-x-4 flex-1">
                        <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                          <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                          </svg>
                        </div>
                        <div className="flex-1">
                          <h3 className="text-lg font-semibold text-gray-900 mb-1">Billing Address</h3>
                          <div className="text-sm text-gray-500 mb-3">Your company's billing and correspondence address</div>
                          {editMode === 'billingAddress' ? (
                            <div className="space-y-3">
                              <textarea
                                value={editValue}
                                onChange={(e) => setEditValue(e.target.value)}
                                rows={4}
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                                placeholder="Enter billing address"
                              />
                              <div className="flex space-x-3">
                                <button
                                  onClick={() => handleSave('billingAddress')}
                                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200 font-medium"
                                >
                                  Save
                                </button>
                                <button
                                  onClick={handleCancel}
                                  className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors duration-200 font-medium"
                                >
                                  Cancel
                                </button>
                              </div>
                            </div>
                          ) : (
                            <p className="text-gray-900 whitespace-pre-line">
                              {companyData.billingAddress}
                            </p>
                          )}
                        </div>
                      </div>
                      {editMode !== 'billingAddress' && (
                        <button 
                          onClick={() => handleEdit('billingAddress', companyData.billingAddress)}
                          className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all duration-200 flex-shrink-0"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                        </button>
                      )}
                    </div>
                  </div>
                </div>

                {/* Phone Number Card */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow duration-300">
                  <div className="p-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                          <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                          </svg>
                        </div>
                        <div className="flex-1">
                          <h3 className="text-lg font-semibold text-gray-900 mb-1">Phone Number</h3>
                          <div className="text-sm text-gray-500 mb-3">Primary contact number for your organization</div>
                          {editMode === 'phoneNumber' ? (
                            <div className="flex items-center space-x-3">
                              <input
                                type="text"
                                value={editValue}
                                onChange={(e) => setEditValue(e.target.value)}
                                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                placeholder="Enter phone number"
                              />
                              <button
                                onClick={() => handleSave('phoneNumber')}
                                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200 font-medium"
                              >
                                Save
                              </button>
                              <button
                                onClick={handleCancel}
                                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors duration-200 font-medium"
                              >
                                Cancel
                              </button>
                            </div>
                          ) : (
                            <p className="text-lg font-medium text-gray-900">
                              {companyData.phoneNumber}
                            </p>
                          )}
                        </div>
                      </div>
                      {editMode !== 'phoneNumber' && (
                        <button 
                          onClick={() => handleEdit('phoneNumber', companyData.phoneNumber)}
                          className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all duration-200"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* People Tab */}
          {activeMainTab === "people" && (
            <div>
              <div className="mb-8 flex justify-between items-center">
                <div>
                  <h1 className="text-2xl font-bold text-gray-900 mb-2">
                    People Management
                  </h1>
                  <p className="text-gray-600">
                    Manage users and invitations for your organization.
                  </p>
                  {currentOrganization && (
                    <p className="text-sm text-blue-600 mt-1">
                      {currentOrganization.name} • {members.length} member{members.length !== 1 ? 's' : ''}
                      {invitations.length > 0 && ` • ${invitations.length} pending invitation${invitations.length !== 1 ? 's' : ''}`}
                    </p>
                  )}
                </div>
                <div className="flex space-x-3">
                  <button
                    onClick={() => setShowInviteUserModal(true)}
                    className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 flex items-center transition-colors"
                  >
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                    Invite User
                  </button>
                  <button
                    onClick={() => setShowCreateUserModal(true)}
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center transition-colors"
                  >
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                    Create User
                  </button>
                </div>
              </div>

              {/* Error Message */}
              {error && (
                <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
                  <div className="flex">
                    <svg className="w-5 h-5 mr-2 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    </svg>
                    {error}
                  </div>
                </div>
              )}

              {/* Loading State */}
              {loadingMembers ? (
                <div className="bg-white rounded-lg shadow-sm p-8 text-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
                  <p className="text-gray-600">Loading organization members...</p>
                </div>
              ) : !currentOrganization ? (
                <div className="bg-white rounded-lg shadow-sm p-8 text-center">
                  <div className="mx-auto h-12 w-12 bg-yellow-100 rounded-full flex items-center justify-center mb-4">
                    <svg className="h-6 w-6 text-yellow-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Select an organization</h3>
                  <p className="text-gray-600">Please select an organization from the sidebar to manage its members.</p>
                </div>
              ) : (
                <div className="space-y-6">
                  {/* Members Table */}
                  <div className="bg-white rounded-lg shadow-sm overflow-hidden">
                    <div className="px-6 py-4 border-b border-gray-200">
                      <h3 className="text-lg font-medium text-gray-900">Organization Members</h3>
                    </div>
                    
                    {members.length === 0 ? (
                      <div className="p-8 text-center">
                        <div className="mx-auto h-12 w-12 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                          <svg className="h-6 w-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                          </svg>
                        </div>
                        <h3 className="text-lg font-medium text-gray-900 mb-2">No members yet</h3>
                        <p className="text-gray-600 mb-4">Get started by creating or inviting users to your organization.</p>
                      </div>
                    ) : (
                      <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                          <thead className="bg-gray-50">
                            <tr>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden md:table-cell">Email</th>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden lg:table-cell">Primary</th>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden lg:table-cell">Join Date</th>
                              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                            </tr>
                          </thead>
                          <tbody className="bg-white divide-y divide-gray-200">
                            {members.map((member) => (
                              <tr key={member.id} className="hover:bg-gray-50">
                                <td className="px-6 py-4 whitespace-nowrap">
                                  <div className="flex items-center">
                                    <div className="flex-shrink-0 h-8 w-8">
                                      <div className="h-8 w-8 rounded-full bg-blue-600 flex items-center justify-center">
                                        <span className="text-sm font-medium text-white">
                                          {(member.user_profiles.first_name?.charAt(0) || member.user_profiles.email.charAt(0)).toUpperCase()}
                                        </span>
                                      </div>
                                    </div>
                                    <div className="ml-4">
                                      <div className="text-sm font-medium text-gray-900">
                                        {member.user_profiles.first_name && member.user_profiles.last_name
                                          ? `${member.user_profiles.first_name} ${member.user_profiles.last_name}`
                                          : 'No name set'
                                        }
                                      </div>
                                      <div className="text-sm text-gray-500 md:hidden">{member.user_profiles.email}</div>
                                    </div>
                                  </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 hidden md:table-cell">
                                  {member.user_profiles.email}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize ${
                                    member.role === 'admin' || member.role === 'owner' ? 'bg-purple-100 text-purple-800' : 
                                    member.role === 'manager' ? 'bg-blue-100 text-blue-800' :
                                    'bg-gray-100 text-gray-800'
                                  }`}>
                                    {member.role}
                                  </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap hidden lg:table-cell">
                                  {member.is_primary && (
                                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                      Primary
                                    </span>
                                  )}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 hidden lg:table-cell">
                                  {new Date(member.created_at).toLocaleDateString()}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                  <button 
                                    onClick={() => handleRemoveUser(member.user_id)}
                                    className="text-red-600 hover:text-red-900 transition-colors"
                                  >
                                    Remove
                                  </button>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>

                  {/* Pending Invitations */}
                  {invitations.length > 0 && (
                    <div className="bg-white rounded-lg shadow-sm overflow-hidden">
                      <div className="px-6 py-4 border-b border-gray-200">
                        <h3 className="text-lg font-medium text-gray-900">Pending Invitations</h3>
                      </div>
                      <div className="divide-y divide-gray-200">
                        {invitations.map((invitation) => (
                          <div key={invitation.id} className="px-6 py-4 flex items-center justify-between">
                            <div>
                              <p className="text-sm font-medium text-gray-900">{invitation.email}</p>
                              <p className="text-sm text-gray-500">
                                Invited {new Date(invitation.created_at).toLocaleDateString()} • Role: {invitation.role}
                              </p>
                            </div>
                            <div className="flex items-center space-x-2">
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                                Pending
                              </span>
                              <button className="text-gray-400 hover:text-gray-600">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Payment Tab */}
          {activeMainTab === "payment" && (
            <div>
              <div className="mb-8 flex justify-between items-center">
                <div>
                  <h1 className="text-2xl font-bold text-gray-900 mb-2">
                    Payment Methods
                  </h1>
                  <p className="text-gray-600">
                    Manage your organization's payment methods.
                  </p>
                </div>
                <button
                  onClick={() => setShowAddCardModal(true)}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center"
                >
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                  </svg>
                  Add Credit Card
                </button>
              </div>

              <div className="grid gap-6">
                {paymentMethods.map((method) => (
                  <div key={method.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <div className="w-12 h-8 bg-gray-100 rounded flex items-center justify-center">
                          <span className="text-sm font-medium text-gray-600">{method.type}</span>
                        </div>
                        <div className="ml-4">
                          <p className="text-lg font-medium text-gray-900">{method.name}</p>
                          <p className="text-sm text-gray-500">•••• •••• •••• {method.lastFour}</p>
                          <p className="text-sm text-gray-500">Expires {method.expiry}</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-3">
                        {method.isDefault && (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                            Default
                          </span>
                        )}
                        <button className="text-gray-400 hover:text-gray-600">
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Policies Tab */}
          {activeMainTab === "policies" && (
            <div>
              <div className="mb-8">
                <h1 className="text-2xl font-bold text-gray-900 mb-2">
                  Travel Policies
                </h1>
                <p className="text-gray-600">
                  Manage your organization's travel policies and rules.
                </p>
              </div>

              <div className="space-y-8">
                {/* Organization Policies */}
                <div>
                  <h2 className="text-xl font-semibold text-gray-900 mb-4">Organization Policies</h2>
                  <div className="bg-white rounded-lg shadow-sm overflow-hidden">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Policy Name</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Pre-trip Approval</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Out of Policy Message</th>
                          <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {organizationPolicies.map((policy) => (
                          <tr key={policy.id}>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{policy.name}</td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 capitalize">
                                {policy.preTripApproval.replace('_', ' ')}
                              </span>
                            </td>
                            <td className="px-6 py-4 text-sm text-gray-500">{policy.outOfPolicyMessage}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                              <button className="text-blue-600 hover:text-blue-900 mr-3">Edit</button>
                              <button className="text-red-600 hover:text-red-900">Delete</button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Policy Groups */}
                <div>
                  <h2 className="text-xl font-semibold text-gray-900 mb-4">Policy Groups</h2>
                  <div className="bg-white rounded-lg shadow-sm overflow-hidden">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Group Name</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Priority</th>
                          <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {policyGroups.map((group) => (
                          <tr key={group.id}>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{group.name}</td>
                            <td className="px-6 py-4 text-sm text-gray-500">{group.description}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{group.priority}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                              <button className="text-blue-600 hover:text-blue-900 mr-3">Edit</button>
                              <button className="text-red-600 hover:text-red-900">Delete</button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Out of Policy Reasons */}
                <div>
                  <h2 className="text-xl font-semibold text-gray-900 mb-4">Out of Policy Reasons</h2>
                  <div className="bg-white rounded-lg shadow-sm overflow-hidden">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Reason</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Requires Approval</th>
                          <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {outOfPolicyReasons.map((reason) => (
                          <tr key={reason.id}>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{reason.reason}</td>
                            <td className="px-6 py-4 text-sm text-gray-500">{reason.description}</td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                reason.requiresApproval ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'
                              }`}>
                                {reason.requiresApproval ? 'Yes' : 'No'}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                              <button className="text-blue-600 hover:text-blue-900 mr-3">Edit</button>
                              <button className="text-red-600 hover:text-red-900">Delete</button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeSubTab === "permissions" && (
            <div className="text-center py-12">
              <h2 className="text-xl font-semibold text-gray-900 mb-2">
                Permissions
              </h2>
              <p className="text-gray-600">
                Permissions management coming soon.
              </p>
            </div>
          )}

          {activeSubTab === "custom-fields" && (
            <div className="text-center py-12">
              <h2 className="text-xl font-semibold text-gray-900 mb-2">
                Custom Fields
              </h2>
              <p className="text-gray-600">
                Custom fields management coming soon.
              </p>
            </div>
          )}

          {activeSubTab === "email" && (
            <div className="text-center py-12">
              <h2 className="text-xl font-semibold text-gray-900 mb-2">
                Email
              </h2>
              <p className="text-gray-600">Email settings coming soon.</p>
            </div>
          )}
        </div>

        {/* Create User Modal */}
        {showCreateUserModal && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
            <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
              <div className="mt-3">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Create New User</h3>
                <form onSubmit={handleCreateUser} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">First Name</label>
                    <input 
                      type="text" 
                      required
                      value={createUserForm.firstName}
                      onChange={(e) => setCreateUserForm(prev => ({ ...prev, firstName: e.target.value }))}
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500" 
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Last Name</label>
                    <input 
                      type="text" 
                      required
                      value={createUserForm.lastName}
                      onChange={(e) => setCreateUserForm(prev => ({ ...prev, lastName: e.target.value }))}
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500" 
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Email</label>
                    <input 
                      type="email" 
                      required
                      value={createUserForm.email}
                      onChange={(e) => setCreateUserForm(prev => ({ ...prev, email: e.target.value }))}
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500" 
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Role</label>
                    <select 
                      value={createUserForm.role}
                      onChange={(e) => setCreateUserForm(prev => ({ ...prev, role: e.target.value }))}
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="member">Member</option>
                      <option value="manager">Manager</option>
                      <option value="admin">Admin</option>
                    </select>
                  </div>
                  <div className="bg-yellow-50 border border-yellow-200 rounded-md p-3">
                    <div className="flex">
                      <svg className="w-5 h-5 text-yellow-400 mr-2 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                      </svg>
                      <div className="text-sm text-yellow-700">
                        <p>User will be created with a temporary password. They should change it on first login.</p>
                      </div>
                    </div>
                  </div>
                  <div className="flex justify-end space-x-3 pt-4">
                    <button
                      type="button"
                      onClick={() => {
                        setShowCreateUserModal(false);
                        setCreateUserForm({ firstName: '', lastName: '', email: '', role: 'member' });
                      }}
                      className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400 transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                    >
                      Create User
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}

        {/* Invite User Modal */}
        {showInviteUserModal && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
            <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
              <div className="mt-3">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Invite User</h3>
                <form onSubmit={handleInviteUser} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Email Address</label>
                    <input 
                      type="email" 
                      required
                      value={inviteUserForm.email}
                      onChange={(e) => setInviteUserForm(prev => ({ ...prev, email: e.target.value }))}
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500" 
                      placeholder="user@example.com" 
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Role</label>
                    <select 
                      value={inviteUserForm.role}
                      onChange={(e) => setInviteUserForm(prev => ({ ...prev, role: e.target.value }))}
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="member">Member</option>
                      <option value="manager">Manager</option>
                      <option value="admin">Admin</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Message (Optional)</label>
                    <textarea 
                      rows={3}
                      value={inviteUserForm.message}
                      onChange={(e) => setInviteUserForm(prev => ({ ...prev, message: e.target.value }))}
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500" 
                      placeholder="Add a personal message to the invitation..."
                    />
                  </div>
                  <div className="bg-blue-50 border border-blue-200 rounded-md p-3">
                    <div className="flex">
                      <svg className="w-5 h-5 text-blue-400 mr-2 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                      </svg>
                      <div className="text-sm text-blue-700">
                        <p>An invitation email will be sent to the user. They can accept the invitation to join your organization.</p>
                      </div>
                    </div>
                  </div>
                  <div className="flex justify-end space-x-3 pt-4">
                    <button
                      type="button"
                      onClick={() => {
                        setShowInviteUserModal(false);
                        setInviteUserForm({ email: '', role: 'member', message: '' });
                      }}
                      className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400 transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
                    >
                      Send Invitation
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}

        {/* Add Credit Card Modal */}
        {showAddCardModal && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
            <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
              <div className="mt-3">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Add Credit Card</h3>
                <form className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Card Number</label>
                    <input type="text" className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500" placeholder="1234 5678 9012 3456" />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Expiry Date</label>
                      <input type="text" className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500" placeholder="MM/YY" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">CVV</label>
                      <input type="text" className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500" placeholder="123" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Cardholder Name</label>
                    <input type="text" className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500" placeholder="John Doe" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Billing Address</label>
                    <textarea 
                      rows={3}
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500" 
                      placeholder="123 Main St, City, State, ZIP"
                    />
                  </div>
                  <div className="flex items-center">
                    <input type="checkbox" className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded" />
                    <label className="ml-2 block text-sm text-gray-900">Set as default payment method</label>
                  </div>
                  <div className="flex justify-end space-x-3 pt-4">
                    <button
                      type="button"
                      onClick={() => setShowAddCardModal(false)}
                      className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                    >
                      Add Card
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default TravelManagerPage;
