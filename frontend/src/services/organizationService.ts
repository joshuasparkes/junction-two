import { supabase, Organization } from '../lib/supabase';

export interface UpdateOrganizationData {
  name?: string;
  address?: string;
  phone?: string;
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
}