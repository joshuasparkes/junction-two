import { supabase } from '../lib/supabase';

export interface UserProfile {
  id: string;
  email: string;
  first_name?: string;
  last_name?: string;
  created_at?: string;
  updated_at?: string;
}

export interface OrganizationMember {
  id: string;
  user_id: string;
  org_id: string;
  role: string;
  is_primary: boolean;
  created_at: string;
  user_profiles: UserProfile;
}

export interface CreateUserData {
  firstName: string;
  lastName: string;
  email: string;
  role: string;
  orgId: string;
}

export interface InviteUserData {
  email: string;
  role: string;
  orgId: string;
  message?: string;
}

// Get all members of an organization
export async function getOrganizationMembers(orgId: string): Promise<OrganizationMember[]> {
  console.log('Fetching organization members for org:', orgId);
  
  const { data, error } = await supabase
    .rpc('get_organization_members_with_profiles', { 
      org_id_param: orgId 
    });

  if (error) {
    console.error('Error fetching organization members:', error);
    throw new Error(`Failed to fetch organization members: ${error.message}`);
  }

  if (!data || data.length === 0) {
    console.log('No members found for organization');
    return [];
  }

  console.log(`Found ${data.length} member records for organization`);
  
  // Transform the data to match our interface
  const transformedData: OrganizationMember[] = data.map((item: any) => {
    return {
      id: item.id,
      user_id: item.user_id,
      org_id: item.org_id,
      role: item.role,
      is_primary: item.is_primary,
      created_at: item.created_at,
      user_profiles: {
        id: item.user_id,
        email: item.email || 'Unknown',
        first_name: item.first_name || null,
        last_name: item.last_name || null,
        created_at: item.created_at,
        updated_at: item.created_at
      }
    };
  });
  
  return transformedData;
}

// Create a new user and add them to the organization
export async function createUser(userData: CreateUserData): Promise<UserProfile> {
  console.log('Creating new user:', userData);
  
  try {
    // Generate a temporary password
    const tempPassword = `TempPass${Math.random().toString(36).slice(-8)}!`;
    
    // Create the user account via regular signup
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: userData.email,
      password: tempPassword,
      options: {
        data: {
          first_name: userData.firstName,
          last_name: userData.lastName
        }
      }
    });

    if (authError) {
      console.error('Error creating auth user:', authError);
      throw new Error(`Failed to create user account: ${authError.message}`);
    }

    if (!authData.user) {
      throw new Error('No user data returned from auth creation');
    }

    console.log('Auth user created:', authData.user.id);

    // Create the user profile
    const { data: profileData, error: profileError } = await supabase
      .from('user_profiles')
      .insert([{
        id: authData.user.id,
        email: userData.email,
        first_name: userData.firstName,
        last_name: userData.lastName,
      }])
      .select()
      .single();

    if (profileError) {
      console.error('Error creating user profile:', profileError);
      throw new Error(`Failed to create user profile: ${profileError.message}`);
    }

    console.log('User profile created:', profileData);

    // Add user to the organization
    const { error: orgError } = await supabase
      .from('user_organizations')
      .insert([{
        user_id: authData.user.id,
        org_id: userData.orgId,
        role: userData.role,
        is_primary: false
      }]);

    if (orgError) {
      console.error('Error adding user to organization:', orgError);
      throw new Error(`Failed to add user to organization: ${orgError.message}`);
    }

    console.log('User added to organization successfully');
    
    // Return profile data with temp password info
    const result = {
      ...profileData,
      tempPassword: tempPassword // Include temp password in response
    };
    
    console.log(`User created with temporary password: ${tempPassword}`);
    alert(`User created successfully!\nTemporary password: ${tempPassword}\nPlease share this with the user and ask them to change it on first login.`);
    
    return result;

  } catch (error) {
    console.error('Exception in createUser:', error);
    throw error;
  }
}

// Send an invitation to join the organization
export async function inviteUser(inviteData: InviteUserData): Promise<void> {
  console.log('Sending invitation:', inviteData);
  
  try {
    // Check if user already exists
    const { data: existingUser } = await supabase
      .from('user_profiles')
      .select('id')
      .eq('email', inviteData.email)
      .single();

    if (existingUser) {
      // User exists, check if already in organization
      const { data: existingMember } = await supabase
        .from('user_organizations')
        .select('id')
        .eq('user_id', existingUser.id)
        .eq('org_id', inviteData.orgId)
        .single();

      if (existingMember) {
        throw new Error('User is already a member of this organization');
      }
    }

    // Create invitation record
    const { error: inviteError } = await supabase
      .from('user_invitations')
      .insert([{
        org_id: inviteData.orgId,
        email: inviteData.email,
        role: inviteData.role,
        status: 'pending',
        invited_by: (await supabase.auth.getUser()).data.user?.id
      }]);

    if (inviteError) {
      console.error('Error creating invitation:', inviteError);
      throw new Error(`Failed to create invitation: ${inviteError.message}`);
    }

    console.log('Invitation created successfully');
    
    // TODO: Send email invitation (for now just log)
    console.log(`Email invitation would be sent to: ${inviteData.email}`);
    console.log(`Invitation message: ${inviteData.message || 'No message provided'}`);

  } catch (error) {
    console.error('Exception in inviteUser:', error);
    throw error;
  }
}

// Remove a user from the organization
export async function removeUserFromOrganization(userId: string, orgId: string): Promise<void> {
  console.log('Removing user from organization:', { userId, orgId });
  
  const { error } = await supabase
    .from('user_organizations')
    .delete()
    .eq('user_id', userId)
    .eq('org_id', orgId);

  if (error) {
    console.error('Error removing user from organization:', error);
    throw new Error(`Failed to remove user from organization: ${error.message}`);
  }

  console.log('User removed from organization successfully');
}

// Get pending invitations for an organization
export async function getOrganizationInvitations(orgId: string): Promise<any[]> {
  console.log('Fetching invitations for org:', orgId);
  
  const { data, error } = await supabase
    .from('user_invitations')
    .select('*')
    .eq('org_id', orgId)
    .eq('status', 'pending')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching invitations:', error);
    throw new Error(`Failed to fetch invitations: ${error.message}`);
  }

  return data || [];
}