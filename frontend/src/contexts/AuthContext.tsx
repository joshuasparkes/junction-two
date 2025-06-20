import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase, AuthUser, Organization, UserRole } from '../lib/supabase';

interface AuthContextType {
  user: AuthUser | null;
  session: Session | null;
  loading: boolean;
  currentOrganization: (Organization & { role: UserRole; is_primary: boolean }) | null;
  setCurrentOrganization: (org: (Organization & { role: UserRole; is_primary: boolean }) | null) => void;
  signUp: (email: string, password: string, firstName: string, lastName: string) => Promise<{ user: User | null; error: any }>;
  signIn: (email: string, password: string) => Promise<{ user: User | null; error: any }>;
  signOut: () => Promise<void>;
  createOrganization: (name: string, userRole?: UserRole) => Promise<Organization>;
  joinOrganization: (orgId: string, role?: UserRole) => Promise<void>;
  leaveOrganization: (orgId: string) => Promise<void>;
  updateProfile: (firstName: string, lastName: string) => Promise<void>;
  changePassword: (currentPassword: string, newPassword: string) => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentOrganization, setCurrentOrganization] = useState<(Organization & { role: UserRole; is_primary: boolean }) | null>(null);

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session?.user) {
        loadUserProfile(session.user);
      } else {
        setLoading(false);
      }
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      setSession(session);
      if (session?.user) {
        await loadUserProfile(session.user);
      } else {
        setUser(null);
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const loadUserProfile = async (authUser: User, retryCount = 0) => {
    console.log(`Loading user profile for: ${authUser.id} (attempt ${retryCount + 1})`);
    
    const MAX_RETRIES = 1; // Reduced retries
    const TIMEOUT_MS = 3000; // Reduced timeout to 3 seconds for faster fallback
    
    // Set basic user data IMMEDIATELY and never fail
    const basicUserData = {
      id: authUser.id,
      email: authUser.email || '',
      profile: undefined,
      organizations: []
    };
    
    // Always set user data first - this prevents UI hanging
    setUser(basicUserData);
    setLoading(false); // Set loading to false immediately
    
    // Try to load profile data in background - but don't block the UI
    try {
      let profile = null;
      let organizations: Array<Organization & { role: UserRole; is_primary: boolean }> = [];
      
      // Load profile data with simple timeout
      console.log('Background: Fetching user profile...');
      try {
        const profilePromise = supabase
          .from('user_profiles')
          .select('*')
          .eq('id', authUser.id)
          .single();
        
        const timeoutPromise = new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Profile timeout')), TIMEOUT_MS)
        );
        
        const { data: profileData, error: profileError } = await Promise.race([
          profilePromise,
          timeoutPromise
        ]) as any;
        
        if (profileError && profileError.code !== 'PGRST116') {
          console.warn('Background: Profile loading error (non-critical):', profileError.message);
        } else if (profileData) {
          profile = profileData;
          console.log('Background: Profile loaded successfully');
        }
      } catch (error: any) {
        console.warn('Background: Profile loading failed/timed out - continuing without profile:', error.message);
      }
      
      // Load organizations with simple timeout
      console.log('Background: Fetching user organizations...');
      try {
        const orgPromise = supabase
          .from('user_organizations')
          .select(`
            role,
            is_primary,
            org_id,
            organizations (
              id,
              name,
              created_at,
              created_by
            )
          `)
          .eq('user_id', authUser.id);
        
        const orgTimeoutPromise = new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Organizations timeout')), TIMEOUT_MS)
        );
        
        const { data: userOrgs, error: orgError } = await Promise.race([
          orgPromise,
          orgTimeoutPromise
        ]) as any;
        
        if (orgError) {
          console.warn('Background: Organizations loading error:', orgError.message);
        } else if (userOrgs && userOrgs.length > 0) {
          console.log('Background: Raw organizations data:', userOrgs.length, 'items');
          
          // Transform data with robust error handling
          const transformedOrgs = userOrgs
            .filter((uo: any) => uo?.organizations?.id) // Only valid entries
            .map((uo: any) => {
              try {
                const org = uo.organizations;
                return {
                  id: org.id,
                  name: org.name || 'Unnamed Organization',
                  created_at: org.created_at,
                  created_by: org.created_by,
                  role: uo.role as UserRole,
                  is_primary: Boolean(uo.is_primary)
                };
              } catch (e) {
                console.warn('Background: Invalid organization entry:', uo);
                return null;
              }
            })
            .filter((org: any): org is Organization & { role: UserRole; is_primary: boolean } => org !== null); // Type-safe filter
          
          organizations = transformedOrgs;
          
          console.log('Background: Successfully transformed', organizations.length, 'organizations');
        }
      } catch (error: any) {
        console.warn('Background: Organizations loading failed/timed out - continuing without organizations:', error.message);
      }
      
      // Update user data with any successfully loaded information
      const updatedUserData = {
        id: authUser.id,
        email: authUser.email || '',
        profile: profile || undefined,
        organizations: organizations || []
      };
      
      // Only update if we actually got some data
      if (profile || organizations.length > 0) {
        console.log('Background: Updating user data with loaded profile/organizations');
        setUser(updatedUserData);
        
        // Auto-select organization if we have any
        if (organizations.length > 0) {
          const primaryOrg = organizations.find(org => org.is_primary);
          const selectedOrg = primaryOrg || organizations[0];
          setCurrentOrganization(selectedOrg);
          console.log('Background: Auto-selected organization:', selectedOrg.name);
        }
      }
      
      console.log('Background: Profile loading completed');
      
    } catch (error) {
      // Even if background loading fails completely, we continue with basic user data
      console.warn('Background: Profile loading failed completely, continuing with basic user data:', error);
      
      // Only retry once and only for very specific errors
      if (retryCount < MAX_RETRIES && error instanceof Error && error.message.includes('network')) {
        console.log('Background: Retrying once due to network error...');
        setTimeout(() => {
          loadUserProfile(authUser, retryCount + 1);
        }, 1000);
      }
    }
  };

  const signUp = async (email: string, password: string, firstName: string, lastName: string) => {
    console.log('Starting signUp process for:', email);
    
    try {
      console.log('Calling supabase.auth.signUp...');
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
      });

      console.log('SignUp response received:', { user: data.user, error });

      if (error) {
        console.error('SignUp error:', error);
        return { user: null, error };
      }

      if (data.user) {
        console.log('User created successfully');
        
        // Set the user state immediately after signup
        setUser({
          id: data.user.id,
          email: data.user.email || '',
          profile: undefined,
          organizations: []
        });
        
        // First check if profile exists, if not create it
        try {
          const { data: existingProfile } = await supabase
            .from('user_profiles')
            .select('id')
            .eq('id', data.user.id)
            .single();

          if (!existingProfile) {
            // Create profile if it doesn't exist
            console.log('Creating user profile...');
            const { error: createError } = await supabase
              .from('user_profiles')
              .insert([{
                id: data.user.id,
                email: data.user.email,
                first_name: firstName,
                last_name: lastName,
              }]);
            
            if (createError) {
              console.error('Error creating profile:', createError);
            }
          } else {
            // Update existing profile
            console.log('Updating user profile...');
            const { error: updateError } = await supabase
              .from('user_profiles')
              .update({
                first_name: firstName,
                last_name: lastName,
              })
              .eq('id', data.user.id);

            if (updateError) {
              console.error('Error updating profile:', updateError);
            }
          }
        } catch (err) {
          console.error('Exception with profile:', err);
        }
      }

      console.log('SignUp completed successfully');
      return { user: data.user, error: null };
    } catch (err) {
      console.error('Exception in signUp:', err);
      return { user: null, error: err };
    }
  };

  const signIn = async (email: string, password: string) => {
    console.log('Attempting sign in for:', email);
    
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    console.log('Sign in response:', { user: data.user, error });
    return { user: data.user, error };
  };

  const signOut = async () => {
    console.log('Signing out user...');
    
    try {
      // Sign out from Supabase
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        console.error('Error signing out:', error);
        throw error;
      }
      
      // Clear local user state
      setUser(null);
      setSession(null);
      setCurrentOrganization(null);
      
      console.log('User signed out successfully');
    } catch (error) {
      console.error('Exception during sign out:', error);
      // Even if there's an error, clear local state
      setUser(null);
      setSession(null);
      setCurrentOrganization(null);
      throw error;
    }
  };

  const createOrganization = async (name: string, userRole: UserRole = 'manager'): Promise<Organization> => {
    console.log('createOrganization called with:', { name, userRole });
    
    if (!user) {
      console.error('No user found for organization creation');
      throw new Error('User must be authenticated to create organization');
    }

    try {
      console.log('Creating organization in database...');
      
      // Create organization
      const { data: org, error: orgError } = await supabase
        .from('organizations')
        .insert([{
          name,
          created_by: user.id,
        }])
        .select()
        .single();

      if (orgError) {
        console.error('Error creating organization:', orgError);
        throw new Error(`Failed to create organization: ${orgError.message}`);
      }

      console.log('Organization created:', org);

      // Add user to organization
      console.log('Adding user to organization...');
      const { error: userOrgError } = await supabase
        .from('user_organizations')
        .insert([{
          user_id: user.id,
          org_id: org.id,
          role: userRole,
          is_primary: user.organizations?.length === 0 // First org is primary
        }]);

      if (userOrgError) {
        console.error('Error adding user to organization:', userOrgError);
        throw new Error(`Failed to add user to organization: ${userOrgError.message}`);
      }

      console.log('User added to organization successfully');
      
      // Refresh user data to include new organization
      await refreshUser();
      
      return org;
    } catch (error) {
      console.error('Exception in createOrganization:', error);
      throw error;
    }
  };

  const joinOrganization = async (orgId: string, role: UserRole = 'user') => {
    console.log('joinOrganization called with:', { orgId, role });
    
    if (!user) {
      console.error('No user found for joining organization');
      throw new Error('User must be authenticated to join organization');
    }

    try {
      console.log('Joining organization...');
      
      // Check if organization exists
      const { data: org, error: orgCheckError } = await supabase
        .from('organizations')
        .select('id, name')
        .eq('id', orgId)
        .single();

      if (orgCheckError || !org) {
        throw new Error('Organization not found');
      }

      // Add user to organization
      const { error } = await supabase
        .from('user_organizations')
        .insert([{
          user_id: user.id,
          org_id: orgId,
          role,
          is_primary: false,
        }]);

      if (error) {
        console.error('Error joining organization:', error);
        throw new Error(`Failed to join organization: ${error.message}`);
      }

      console.log('Successfully joined organization');
      await refreshUser();
    } catch (error) {
      console.error('Exception in joinOrganization:', error);
      throw error;
    }
  };

  const leaveOrganization = async (orgId: string) => {
    console.log('leaveOrganization called with:', orgId);
    
    if (!user) {
      throw new Error('User must be authenticated to leave organization');
    }

    try {
      const { error } = await supabase
        .from('user_organizations')
        .delete()
        .eq('user_id', user.id)
        .eq('org_id', orgId);

      if (error) {
        console.error('Error leaving organization:', error);
        throw new Error(`Failed to leave organization: ${error.message}`);
      }

      console.log('Successfully left organization');
      await refreshUser();
    } catch (error) {
      console.error('Exception in leaveOrganization:', error);
      throw error;
    }
  };

  const updateProfile = async (firstName: string, lastName: string) => {
    console.log('updateProfile called');
    
    if (!user) {
      throw new Error('User must be authenticated to update profile');
    }

    try {
      const { error } = await supabase
        .from('user_profiles')
        .update({
          first_name: firstName,
          last_name: lastName,
          updated_at: new Date().toISOString()
        })
        .eq('id', user.id);

      if (error) {
        console.error('Error updating profile:', error);
        throw new Error(`Failed to update profile: ${error.message}`);
      }

      console.log('Profile updated successfully');
      await refreshUser();
    } catch (error) {
      console.error('Exception in updateProfile:', error);
      throw error;
    }
  };

  const changePassword = async (currentPassword: string, newPassword: string) => {
    console.log('changePassword called');
    
    try {
      // First verify current password by attempting to sign in
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: user?.email || '',
        password: currentPassword
      });

      if (signInError) {
        throw new Error('Current password is incorrect');
      }

      // Update password
      const { error } = await supabase.auth.updateUser({
        password: newPassword
      });

      if (error) {
        console.error('Error changing password:', error);
        throw new Error(`Failed to change password: ${error.message}`);
      }

      console.log('Password changed successfully');
    } catch (error) {
      console.error('Exception in changePassword:', error);
      throw error;
    }
  };

  const refreshUser = async () => {
    console.log('refreshUser called');
    if (session?.user) {
      await loadUserProfile(session.user);
    }
  };

  const value = {
    user,
    session,
    loading,
    currentOrganization,
    setCurrentOrganization,
    signUp,
    signIn,
    signOut,
    createOrganization,
    joinOrganization,
    leaveOrganization,
    updateProfile,
    changePassword,
    refreshUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};