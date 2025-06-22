import React, { useState, useEffect } from "react";
import Layout from "../components/common/Layout";
import OrgSelector from "../components/common/OrgSelector";
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
import {
  CompanyProfile,
  PeopleManagement,
  TravelPolicies,
  PaymentMethods,
  CreateUserModal,
  InviteUserModal
} from "../components/travel-manager";

const TravelManagerPage: React.FC = () => {
  const { currentOrganization } = useAuth();
  const [activeMainTab, setActiveMainTab] = useState("company");
  const [activeSubTab, setActiveSubTab] = useState("profile");
  
  // Company data state
  const [companyData, setCompanyData] = useState({
    logo: "/junction-logo2.png",
    hero: "https://images.unsplash.com/photo-1497366216548-37526070297c?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80",
    name: currentOrganization?.name || "Company Name",
    billingAddress: currentOrganization?.address || "No address set",
    phoneNumber: currentOrganization?.phone || "No phone number set",
  });
  
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

  // Update company data when organization changes
  useEffect(() => {
    if (currentOrganization) {
      setCompanyData(prev => ({
        ...prev,
        name: currentOrganization.name,
        billingAddress: currentOrganization?.address || "No address set",
        phoneNumber: currentOrganization?.phone || "No phone number set",
      }));
    }
  }, [currentOrganization]);
  
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
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Org Selector */}
        <div className="mb-6">
          <OrgSelector />
        </div>
        
        {/* Header */}
        <div className="mb-8">
          <h1 className="title-text font-normal text-chatgpt-text-primary mb-2">
            Travel Manager
          </h1>
          <p className="content-text text-chatgpt-text-secondary">
            Manage your organization's travel settings and policies
          </p>
        </div>
        
        {/* Two Column Layout */}
        <div className="flex gap-6">
          {/* Left Sidebar Navigation */}
          <div className="w-64 flex-shrink-0">
            <div className="bg-white border border-gray-200 rounded-lg p-3">
              <div className="space-y-0">
                {/* Company Section with Sub-items */}
                <div>
                  <button
                    onClick={() => setActiveMainTab("company")}
                    className={`w-full p-3 rounded-md hover:bg-gray-50 transition-colors duration-200 text-left ${
                      activeMainTab === "company" ? "bg-gray-100" : ""
                    }`}
                  >
                    <span className="content-text font-normal text-chatgpt-text-primary">
                      Company
                    </span>
                  </button>
                  {/* Company Sub-items */}
                  {activeMainTab === "company" && (
                    <div className="ml-4 mt-1 space-y-0">
                      {subTabs.map((tab) => (
                        <button
                          key={tab.id}
                          onClick={() => setActiveSubTab(tab.id)}
                          className={`w-full p-2 rounded-md hover:bg-gray-50 transition-colors duration-200 text-left ${
                            activeSubTab === tab.id ? "bg-gray-100" : ""
                          }`}
                        >
                          <span className="sidebar-text text-chatgpt-text-secondary">
                            {tab.label}
                          </span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
                
                {/* Other Main Tabs */}
                {mainTabs.filter(tab => tab.id !== "company").map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => {
                      setActiveMainTab(tab.id);
                      // Reset sub tab when changing main tab
                      if (tab.id !== "company") {
                        setActiveSubTab("profile");
                      }
                    }}
                    className={`w-full p-3 rounded-md hover:bg-gray-50 transition-colors duration-200 text-left ${
                      activeMainTab === tab.id ? "bg-gray-100" : ""
                    }`}
                  >
                    <span className="content-text font-normal text-chatgpt-text-primary">
                      {tab.label}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </div>
          
          {/* Main Content Area */}
          <div className="flex-1">
            {/* Company Profile Tab */}
            {activeMainTab === "company" && activeSubTab === "profile" && currentOrganization && (
              <CompanyProfile 
                companyData={companyData}
                organizationId={currentOrganization.id}
                onUpdate={(field, value) => {
                  setCompanyData(prev => ({
                    ...prev,
                    [field]: value
                  }));
                }}
              />
            )}

            {/* People Tab */}
            {activeMainTab === "people" && (
              <PeopleManagement
                members={members}
                invitations={invitations}
                loading={loadingMembers}
                error={error}
                currentOrganization={currentOrganization}
                onCreateUser={() => setShowCreateUserModal(true)}
                onInviteUser={() => setShowInviteUserModal(true)}
                onRemoveUser={handleRemoveUser}
              />
            )}

            {/* Payment Tab */}
            {activeMainTab === "payment" && (
              <PaymentMethods
                paymentMethods={paymentMethods}
                onAddCard={() => setShowAddCardModal(true)}
              />
            )}

            {/* Policies Tab */}
            {activeMainTab === "policies" && (
              <TravelPolicies
                organizationPolicies={organizationPolicies}
                policyGroups={policyGroups}
                outOfPolicyReasons={outOfPolicyReasons}
              />
            )}

            {/* Other Tabs */}
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
        </div>

        {/* Create User Modal */}
        <CreateUserModal
          isOpen={showCreateUserModal}
          form={createUserForm}
          onClose={() => {
            setShowCreateUserModal(false);
            setCreateUserForm({ firstName: '', lastName: '', email: '', role: 'member' });
          }}
          onSubmit={handleCreateUser}
          onChange={(field, value) => setCreateUserForm(prev => ({ ...prev, [field]: value }))}
        />

        {/* Invite User Modal */}
        <InviteUserModal
          isOpen={showInviteUserModal}
          form={inviteUserForm}
          onClose={() => {
            setShowInviteUserModal(false);
            setInviteUserForm({ email: '', role: 'member', message: '' });
          }}
          onSubmit={handleInviteUser}
          onChange={(field, value) => setInviteUserForm(prev => ({ ...prev, [field]: value }))}
        />

        {/* Add Credit Card Modal */}
        {showAddCardModal && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
            <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
              <div className="mt-3">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Add Credit Card</h3>
                <form className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Card Number</label>
                    <input type="text" className="chatgpt-input w-full" placeholder="1234 5678 9012 3456" />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Expiry Date</label>
                      <input type="text" className="chatgpt-input w-full" placeholder="MM/YY" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">CVV</label>
                      <input type="text" className="chatgpt-input w-full" placeholder="123" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Cardholder Name</label>
                    <input type="text" className="chatgpt-input w-full" placeholder="John Doe" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Billing Address</label>
                    <textarea 
                      rows={3}
                      className="chatgpt-input w-full" 
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
                      className="chatgpt-button"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="chatgpt-primary-button"
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