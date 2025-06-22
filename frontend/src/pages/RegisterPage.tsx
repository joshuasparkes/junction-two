import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { AuthService } from '../services/authService';
import { UserRole, Organization } from '../lib/supabase';
import Layout from '../components/common/Layout';

type RegistrationStep = 'account' | 'organization';
type OrgSetupType = 'create' | 'join';

const RegisterPage: React.FC = () => {
  const navigate = useNavigate();
  const { signUp, createOrganization, joinOrganization } = useAuth();
  
  // Registration state
  const [step, setStep] = useState<RegistrationStep>('account');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [needsEmailConfirmation, setNeedsEmailConfirmation] = useState(false);
  
  // Account form data
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  
  // Organization setup
  const [orgSetupType, setOrgSetupType] = useState<OrgSetupType>('create');
  const [orgName, setOrgName] = useState('');
  const [userRole, setUserRole] = useState<UserRole>('manager');
  const [existingOrgs, setExistingOrgs] = useState<Organization[]>([]);
  const [selectedOrg, setSelectedOrg] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState('');

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleAccountSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log('RegisterPage: Form submitted');
    setError(null);

    // Validation
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    console.log('RegisterPage: Validation passed, starting signup');
    setLoading(true);

    try {
      console.log('RegisterPage: Calling signUp...');
      const { user, error } = await signUp(
        formData.email,
        formData.password,
        formData.firstName,
        formData.lastName
      );

      console.log('RegisterPage: SignUp completed', { user, error });

      if (error) {
        console.error('RegisterPage: SignUp error', error);
        setError(error.message);
        return;
      }

      if (user) {
        console.log('RegisterPage: User created, checking if email confirmation needed');
        // Check if user needs to confirm email
        if (!user.email_confirmed_at) {
          setNeedsEmailConfirmation(true);
        }
        setStep('organization');
      }
    } catch (err) {
      console.error('RegisterPage: Exception during signup', err);
      setError('Failed to create account. Please try again.');
    } finally {
      console.log('RegisterPage: Setting loading to false');
      setLoading(false);
    }
  };

  const searchOrganizations = async (query: string) => {
    if (query.length < 2) {
      setExistingOrgs([]);
      return;
    }

    try {
      const orgs = await AuthService.searchOrganizations(query);
      setExistingOrgs(orgs);
    } catch (err) {
      console.error('Error searching organizations:', err);
    }
  };

  const handleOrgSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;
    setSearchQuery(query);
    searchOrganizations(query);
  };

  const handleOrganizationSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      if (orgSetupType === 'create') {
        if (!orgName.trim()) {
          setError('Organization name is required');
          return;
        }
        await createOrganization(orgName, userRole);
      } else {
        if (!selectedOrg) {
          setError('Please select an organization to join');
          return;
        }
        await joinOrganization(selectedOrg, userRole);
      }

      // Success - redirect to dashboard
      navigate('/dashboard');
    } catch (err) {
      console.error('Organization setup error:', err);
      if (err instanceof Error && err.message.includes('No user found')) {
        setError('Please confirm your email address before creating an organization. Check your inbox for the confirmation link.');
      } else if (err instanceof Error && err.message.includes('authenticated')) {
        setError('Please confirm your email address before creating an organization. Check your inbox for the confirmation link.');
      } else {
        setError(err instanceof Error ? err.message : 'Failed to setup organization');
      }
    } finally {
      setLoading(false);
    }
  };

  const roleDescriptions = {
    manager: 'Full access to manage organization, users, and bookings',
    booker: 'Can create and manage bookings for the organization',
    user: 'Can view and create personal bookings',
    guest: 'Limited access to view organization information'
  };

  return (
    <Layout>
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="max-w-md mx-auto">
          <h1 className="title-text font-normal text-chatgpt-text-primary mb-4 text-center">
            {step === 'account' ? 'Create your account' : 'Setup your organization'}
          </h1>
          <p className="text-center content-text text-gray-600 mb-8">
            {step === 'account' ? (
              <>
                Already have an account?{' '}
                <Link to="/login" className="font-medium text-blue-600 hover:text-blue-700">
                  Sign in
                </Link>
              </>
            ) : (
              'Almost done! Let\'s get your organization set up.'
            )}
          </p>

          <div className="bg-white rounded-lg shadow-sm p-8">
            {/* Step Indicator */}
            <div className="mb-8">
              <div className="flex items-center">
                <div className={`flex items-center justify-center w-8 h-8 rounded-full border-2 ${
                  step === 'account' ? 'border-blue-600 bg-blue-600 text-white' : 'border-gray-300 bg-gray-300 text-gray-600'
                }`}>
                  {step === 'organization' ? '✓' : '1'}
                </div>
                <div className={`flex-1 h-1 mx-2 ${step === 'organization' ? 'bg-blue-600' : 'bg-gray-200'}`}></div>
                <div className={`flex items-center justify-center w-8 h-8 rounded-full border-2 ${
                  step === 'organization' ? 'border-blue-600 bg-blue-600 text-white' : 'border-gray-300 text-gray-600'
                }`}>
                  2
                </div>
              </div>
              <div className="flex justify-between mt-2 text-xs text-gray-500">
                <span>Account</span>
                <span>Organization</span>
              </div>
            </div>

            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700">
                {error}
              </div>
            )}

            {step === 'account' && (
              <form onSubmit={handleAccountSubmit} className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-2">
                      First name
                    </label>
                    <input
                      id="firstName"
                      name="firstName"
                      type="text"
                      required
                      value={formData.firstName}
                      onChange={handleInputChange}
                      className="chatgpt-input w-full"
                      placeholder="First name"
                    />
                  </div>
                  <div>
                    <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-2">
                      Last name
                    </label>
                    <input
                      id="lastName"
                      name="lastName"
                      type="text"
                      required
                      value={formData.lastName}
                      onChange={handleInputChange}
                      className="chatgpt-input w-full"
                      placeholder="Last name"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                    Email address
                  </label>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    value={formData.email}
                    onChange={handleInputChange}
                    className="chatgpt-input w-full"
                    placeholder="Email address"
                  />
                </div>

                <div>
                  <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                    Password
                  </label>
                  <input
                    id="password"
                    name="password"
                    type="password"
                    autoComplete="new-password"
                    required
                    value={formData.password}
                    onChange={handleInputChange}
                    className="chatgpt-input w-full"
                    placeholder="Password"
                  />
                </div>

                <div>
                  <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2">
                    Confirm password
                  </label>
                  <input
                    id="confirmPassword"
                    name="confirmPassword"
                    type="password"
                    autoComplete="new-password"
                    required
                    value={formData.confirmPassword}
                    onChange={handleInputChange}
                    className="chatgpt-input w-full"
                    placeholder="Confirm password"
                  />
                </div>

                <div>
                  <button
                    type="submit"
                    disabled={loading}
                    className="chatgpt-primary-button w-full"
                  >
                    {loading ? (
                      <div className="flex items-center justify-center">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Creating account...
                      </div>
                    ) : (
                      'Create Account'
                    )}
                  </button>
                </div>
              </form>
            )}

            {step === 'organization' && (
              <form onSubmit={handleOrganizationSubmit} className="space-y-6">
                {/* Email Confirmation Notice */}
                {needsEmailConfirmation && (
                  <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4">
                    <div className="flex">
                      <div className="flex-shrink-0">
                        <svg className="h-5 w-5 text-yellow-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M8.485 2.495c.673-1.167 2.357-1.167 3.03 0l6.28 10.875c.673 1.167-.17 2.625-1.516 2.625H3.72c-1.347 0-2.189-1.458-1.515-2.625L8.485 2.495zM10 5a.75.75 0 01.75.75v3.5a.75.75 0 01-1.5 0v-3.5A.75.75 0 0110 5zm0 9a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
                        </svg>
                      </div>
                      <div className="ml-3">
                        <h3 className="text-sm font-medium text-yellow-800">
                          Email confirmation required
                        </h3>
                        <div className="mt-2 text-sm text-yellow-700">
                          <p>
                            We've sent a confirmation email to <strong>{formData.email}</strong>. 
                            Please check your inbox and click the confirmation link before creating an organization.
                          </p>
                          <p className="mt-2">
                            You can still set up your organization preferences now, but you'll need to confirm your email before the organization is created.
                          </p>
                        </div>
                        <div className="mt-4">
                          <button
                            type="button"
                            onClick={() => navigate('/login')}
                            className="text-sm font-medium text-yellow-800 hover:text-yellow-900"
                          >
                            Go to login →
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Organization Setup Type */}
                <div>
                  <div className="inline-flex p-1 bg-gray-200 rounded-full" role="group">
                    <button
                      type="button"
                      onClick={() => setOrgSetupType('create')}
                      className={`px-4 py-2 rounded-full font-normal content-text transition-all duration-200 relative ${
                        orgSetupType === 'create'
                          ? 'bg-white text-gray-900 shadow-sm z-10'
                          : 'text-gray-600 hover:text-gray-900'
                      }`}
                    >
                      Create New Organization
                    </button>
                    <button
                      type="button"
                      onClick={() => setOrgSetupType('join')}
                      className={`px-4 py-2 rounded-full font-normal content-text transition-all duration-200 relative ${
                        orgSetupType === 'join'
                          ? 'bg-white text-gray-900 shadow-sm z-10'
                          : 'text-gray-600 hover:text-gray-900'
                      }`}
                    >
                      Join Existing Organization
                    </button>
                  </div>
                </div>

                {orgSetupType === 'create' ? (
                  <div>
                    <label htmlFor="orgName" className="block text-sm font-medium text-gray-700 mb-2">
                      Organization name
                    </label>
                    <input
                      id="orgName"
                      type="text"
                      required
                      value={orgName}
                      onChange={(e) => setOrgName(e.target.value)}
                      className="chatgpt-input w-full"
                      placeholder="Enter organization name"
                    />
                  </div>
                ) : (
                  <div>
                    <label htmlFor="orgSearch" className="block text-sm font-medium text-gray-700 mb-2">
                      Search for organization
                    </label>
                    <input
                      id="orgSearch"
                      type="text"
                      value={searchQuery}
                      onChange={handleOrgSearch}
                      className="chatgpt-input w-full"
                      placeholder="Type to search organizations..."
                    />
                    
                    {existingOrgs.length > 0 && (
                      <div className="mt-2 max-h-40 overflow-y-auto border border-gray-300 rounded-md">
                        {existingOrgs.map((org) => (
                          <div
                            key={org.id}
                            onClick={() => setSelectedOrg(org.id)}
                            className={`px-3 py-2 cursor-pointer hover:bg-gray-50 ${
                              selectedOrg === org.id ? 'bg-blue-50 border-l-4 border-blue-600' : ''
                            }`}
                          >
                            <div className="font-medium text-gray-900">{org.name}</div>
                            <div className="text-sm text-gray-500">
                              Created {new Date(org.created_at).toLocaleDateString()}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* Role Selection */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Your role in the organization
                  </label>
                  <div className="space-y-3">
                    {Object.entries(roleDescriptions).map(([role, description]) => (
                      <div key={role} className="flex items-start">
                        <div className="flex items-center h-5">
                          <input
                            id={role}
                            name="role"
                            type="radio"
                            value={role}
                            checked={userRole === role}
                            onChange={(e) => setUserRole(e.target.value as UserRole)}
                            className="focus:ring-blue-500 h-4 w-4 text-blue-600 border-gray-300"
                          />
                        </div>
                        <div className="ml-3 text-sm">
                          <label htmlFor={role} className="font-medium text-gray-700 capitalize">
                            {role}
                          </label>
                          <p className="text-gray-500">{description}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <button
                    type="submit"
                    disabled={loading || (orgSetupType === 'join' && !selectedOrg)}
                    className="chatgpt-primary-button w-full"
                  >
                    {loading ? (
                      <div className="flex items-center justify-center">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Processing...
                      </div>
                    ) : (
                      orgSetupType === 'create' ? 'Create Organization' : 'Join Organization'
                    )}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default RegisterPage;