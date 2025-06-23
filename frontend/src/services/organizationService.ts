import { supabase, Organization } from '../lib/supabase';

export interface UpdateOrganizationData {
  name?: string;
  address?: string;
  phone?: string;
}

export interface CreateChildOrganizationData {
  name: string;
  address: string;
  phone: string;
  parent_org_id: string;
  created_by?: string;
  owner_id?: string;
}

export class OrganizationService {
  static async updateOrganization(orgId: string, data: UpdateOrganizationData): Promise<Organization> {
    const { data: updatedOrg, error } = await supabase
      .from('organizations')
      .update(data)
      .eq('id', orgId)
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to update organization: ${error.message}`);
    }

    return updatedOrg;
  }

  static async getOrganization(orgId: string): Promise<Organization> {
    const { data, error } = await supabase
      .from('organizations')
      .select('*')
      .eq('id', orgId)
      .single();

    if (error) {
      throw new Error(`Failed to get organization: ${error.message}`);
    }

    return data;
  }

  static async getChildOrganizations(parentOrgId: string): Promise<Organization[]> {
    const { data, error } = await supabase
      .from('organizations')
      .select('*')
      .eq('parent_org_id', parentOrgId)
      .order('created_at', { ascending: false });

    if (error) {
      throw new Error(`Failed to get child organizations: ${error.message}`);
    }

    return data || [];
  }

  static async createChildOrganization(data: CreateChildOrganizationData): Promise<Organization> {
    // Build the insert object, only including fields that are defined
    const insertData: any = {
      name: data.name,
      address: data.address,
      phone: data.phone,
      parent_org_id: data.parent_org_id,
      users: []
    };

    // Only include created_by and owner_id if they're provided
    if (data.created_by) {
      insertData.created_by = data.created_by;
    }
    if (data.owner_id) {
      insertData.owner_id = data.owner_id;
    }

    const { data: newOrg, error } = await supabase
      .from('organizations')
      .insert(insertData)
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to create child organization: ${error.message}`);
    }

    return newOrg;
  }

  static async deleteChildOrganization(orgId: string): Promise<void> {
    const { error } = await supabase
      .from('organizations')
      .delete()
      .eq('id', orgId);

    if (error) {
      throw new Error(`Failed to delete child organization: ${error.message}`);
    }
  }

  static async enableParentMode(orgId: string): Promise<void> {
    const { error } = await supabase
      .from('organizations')
      .update({ is_parent: true })
      .eq('id', orgId);

    if (error) {
      throw new Error(`Failed to enable parent mode: ${error.message}`);
    }
  }

  static async checkParentStatus(orgId: string): Promise<boolean> {
    const { data, error } = await supabase
      .from('organizations')
      .select('is_parent')
      .eq('id', orgId)
      .single();

    if (error) {
      throw new Error(`Failed to check parent status: ${error.message}`);
    }

    return data?.is_parent || false;
  }
}