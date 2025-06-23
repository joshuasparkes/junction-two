import { supabase } from '../lib/supabase';

export interface SystemAdminOrganization {
  id: string;
  name: string;
  address: string;
  phone: string;
  created_at: string;
  owner_id: string;
  parent_org_id: string | null;
  is_parent: boolean;
  users: OrganizationUser[];
  child_organizations?: SystemAdminOrganization[];
}

export interface OrganizationUser {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  role: string;
  is_primary: boolean;
  joined_at: string;
}

export interface CreateUserData {
  email: string;
  first_name: string;
  last_name: string;
  org_id: string;
  role: 'manager' | 'user' | 'booker';
  is_primary?: boolean;
}

export class SystemAdminService {
  /**
   * Get all organizations with their hierarchical structure
   */
  static async getAllOrganizations(): Promise<SystemAdminOrganization[]> {
    try {
      // Get all organizations
      const { data: organizations, error: orgError } = await supabase
        .from('organizations')
        .select('*')
        .order('name');

      if (orgError) throw orgError;

      // Get all user organization relationships
      const { data: userOrgs, error: userOrgError } = await supabase
        .from('user_organizations')
        .select('*');

      if (userOrgError) throw userOrgError;

      // Get all user profiles separately
      const { data: userProfiles, error: userProfileError } = await supabase
        .from('user_profiles')
        .select('id, email, first_name, last_name');

      if (userProfileError) throw userProfileError;

      // Process organizations and build hierarchy
      const processedOrgs: SystemAdminOrganization[] = organizations.map(org => {
        // Get users for this organization
        const orgUsers = userOrgs
          .filter(uo => uo.org_id === org.id)
          .map(uo => {
            const userProfile = userProfiles.find(up => up.id === uo.user_id);
            return {
              id: uo.user_id,
              email: userProfile?.email || 'Unknown',
              first_name: userProfile?.first_name || 'Unknown',
              last_name: userProfile?.last_name || 'Unknown', 
              role: uo.role,
              is_primary: uo.is_primary,
              joined_at: uo.created_at,
            };
          });

        return {
          id: org.id,
          name: org.name,
          address: org.address || 'No address set',
          phone: org.phone || 'No phone set',
          created_at: org.created_at,
          owner_id: org.owner_id,
          parent_org_id: org.parent_org_id,
          is_parent: org.is_parent,
          users: orgUsers,
          child_organizations: [],
        };
      });

      // Build hierarchy by linking children to parents
      const parentOrgs = processedOrgs.filter(org => org.parent_org_id === null);
      const childOrgs = processedOrgs.filter(org => org.parent_org_id !== null);

      // Attach child organizations to their parents
      parentOrgs.forEach(parent => {
        parent.child_organizations = childOrgs.filter(child => 
          child.parent_org_id === parent.id
        );
      });

      return parentOrgs;
    } catch (error) {
      console.error('Error fetching organizations:', error);
      throw error;
    }
  }

  /**
   * Get all users across all organizations
   */
  static async getAllUsers(): Promise<OrganizationUser[]> {
    try {
      // Get all user profiles
      const { data: users, error: userError } = await supabase
        .from('user_profiles')
        .select('*')
        .order('first_name');

      if (userError) throw userError;

      // Get all user organization relationships
      const { data: userOrgs, error: userOrgError } = await supabase
        .from('user_organizations')
        .select('*');

      if (userOrgError) throw userOrgError;

      return users.map(user => {
        const userOrg = userOrgs.find(uo => uo.user_id === user.id);
        return {
          id: user.id,
          email: user.email,
          first_name: user.first_name,
          last_name: user.last_name,
          role: userOrg?.role || 'user',
          is_primary: userOrg?.is_primary || false,
          joined_at: userOrg?.created_at || user.created_at,
        };
      });
    } catch (error) {
      console.error('Error fetching users:', error);
      throw error;
    }
  }

  /**
   * Create a new user and assign to organization
   */
  static async createUser(userData: CreateUserData): Promise<void> {
    try {
      // First create the user profile
      const { data: userProfile, error: userError } = await supabase
        .from('user_profiles')
        .insert({
          email: userData.email,
          first_name: userData.first_name,
          last_name: userData.last_name,
        })
        .select()
        .single();

      if (userError) throw userError;

      // Then create the organization relationship
      const { error: orgError } = await supabase
        .from('user_organizations')
        .insert({
          user_id: userProfile.id,
          org_id: userData.org_id,
          role: userData.role,
          is_primary: userData.is_primary || false,
        });

      if (orgError) throw orgError;
    } catch (error) {
      console.error('Error creating user:', error);
      throw error;
    }
  }

  /**
   * Delete a user from an organization
   */
  static async deleteUserFromOrganization(userId: string, orgId: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('user_organizations')
        .delete()
        .eq('user_id', userId)
        .eq('org_id', orgId);

      if (error) throw error;
    } catch (error) {
      console.error('Error deleting user from organization:', error);
      throw error;
    }
  }

  /**
   * Delete a user completely (from all organizations)
   */
  static async deleteUser(userId: string): Promise<void> {
    try {
      // First delete all organization relationships
      const { error: orgError } = await supabase
        .from('user_organizations')
        .delete()
        .eq('user_id', userId);

      if (orgError) throw orgError;

      // Then delete the user profile
      const { error: userError } = await supabase
        .from('user_profiles')
        .delete()
        .eq('id', userId);

      if (userError) throw userError;
    } catch (error) {
      console.error('Error deleting user:', error);
      throw error;
    }
  }

  /**
   * Get organization statistics
   */
  static async getSystemStats(): Promise<{
    totalOrganizations: number;
    totalUsers: number;
    parentOrganizations: number;
    childOrganizations: number;
  }> {
    try {
      const [orgsResult, usersResult] = await Promise.all([
        supabase.from('organizations').select('id, is_parent'),
        supabase.from('user_profiles').select('id'),
      ]);

      if (orgsResult.error) throw orgsResult.error;
      if (usersResult.error) throw usersResult.error;

      const organizations = orgsResult.data || [];
      const users = usersResult.data || [];

      return {
        totalOrganizations: organizations.length,
        totalUsers: users.length,
        parentOrganizations: organizations.filter(org => org.is_parent).length,
        childOrganizations: organizations.filter(org => !org.is_parent).length,
      };
    } catch (error) {
      console.error('Error fetching system stats:', error);
      throw error;
    }
  }
}