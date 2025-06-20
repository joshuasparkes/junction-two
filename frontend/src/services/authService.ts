import { supabase, Organization, UserRole } from '../lib/supabase';

export interface CreateOrgData {
  name: string;
  userRole?: UserRole;
}

export interface JoinOrgData {
  orgId?: string;
  orgName?: string;
  role?: UserRole;
}

export class AuthService {
  static async findOrganizationByName(name: string): Promise<Organization | null> {
    const { data, error } = await supabase
      .from('organizations')
      .select('*')
      .eq('name', name)
      .single();

    if (error && error.code !== 'PGRST116') {
      throw new Error(`Failed to find organization: ${error.message}`);
    }

    return data;
  }

  static async searchOrganizations(query: string): Promise<Organization[]> {
    const { data, error } = await supabase
      .from('organizations')
      .select('*')
      .ilike('name', `%${query}%`)
      .limit(10);

    if (error) {
      throw new Error(`Failed to search organizations: ${error.message}`);
    }

    return data || [];
  }

  static async getUserOrganizations(userId: string) {
    const { data, error } = await supabase
      .from('user_organizations')
      .select(`
        role,
        is_primary,
        organizations (
          id,
          name,
          created_at,
          created_by
        )
      `)
      .eq('user_id', userId);

    if (error) {
      throw new Error(`Failed to get user organizations: ${error.message}`);
    }

    return data?.map(uo => ({
      ...uo.organizations,
      role: uo.role,
      is_primary: uo.is_primary
    })) || [];
  }

  static async updateUserRole(userId: string, orgId: string, role: UserRole) {
    const { error } = await supabase
      .from('user_organizations')
      .update({ role })
      .eq('user_id', userId)
      .eq('org_id', orgId);

    if (error) {
      throw new Error(`Failed to update user role: ${error.message}`);
    }
  }

  static async removeUserFromOrganization(userId: string, orgId: string) {
    const { error } = await supabase
      .from('user_organizations')
      .delete()
      .eq('user_id', userId)
      .eq('org_id', orgId);

    if (error) {
      throw new Error(`Failed to remove user from organization: ${error.message}`);
    }
  }
}