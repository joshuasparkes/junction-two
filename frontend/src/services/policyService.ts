import { supabase } from '../lib/supabase';

const POLICY_ENGINE_URL = process.env.REACT_APP_POLICY_ENGINE_URL || 'http://localhost:5001';

// Types
export interface Policy {
  id: string;
  org_id: string;
  label: string;
  type: 'TRAVEL' | 'ORG';
  active: boolean;
  action: 'HIDE' | 'BLOCK' | 'APPROVE' | 'OUT_OF_POLICY';
  enforce_approval: boolean;
  message_for_reservation?: any;
  exclude_restricted_fares: boolean;
  refundable_fares_enabled: boolean;
  user_count: number;
  guest_count: number;
  approver_count: number;
  created_at: string;
  updated_at: string;
}

export interface PolicyRule {
  id: string;
  policy_id: string;
  code: string;
  action: 'HIDE' | 'BLOCK' | 'APPROVE' | 'OUT_OF_POLICY';
  vars: any;
  active: boolean;
  created_at: string;
  updated_at: string;
}

export interface RuleSpecification {
  code: string;
  name: string;
  description: string;
  travel_type: 'TRAIN' | 'FLIGHT' | 'HOTEL' | 'CAR';
  parameters: {
    [key: string]: {
      type: string;
      required: boolean;
      description: string;
    };
  };
}

export interface PolicyEvaluationRequest {
  travel_data: {
    train?: {
      price: number;
      currency: string;
      class?: string;
      operator?: string;
      departure_date?: string;
    };
    origin?: string;
    destination?: string;
  };
  org_id: string;
  user_id: string;
}

export interface PolicyEvaluationResult {
  result: 'HIDDEN' | 'BOOKING_BLOCKED' | 'APPROVAL_REQUIRED' | 'OUT_OF_POLICY' | 'IN_POLICY' | 'NOT_SPECIFIED';
  policies_evaluated: number;
  details: any[];
  messages: string[];
  approvers: string[];
}

export class PolicyService {
  
  // Policy Management
  static async getPolicies(orgId: string): Promise<Policy[]> {
    try {
      const response = await fetch(`${POLICY_ENGINE_URL}/api/v1/policies/?org_id=${orgId}`);
      if (!response.ok) {
        throw new Error(`Failed to fetch policies: ${response.statusText}`);
      }
      return await response.json();
    } catch (error) {
      console.error('Error fetching policies:', error);
      throw error;
    }
  }

  static async createPolicy(policyData: Omit<Policy, 'id' | 'created_at' | 'updated_at' | 'user_count' | 'guest_count' | 'approver_count'>): Promise<Policy> {
    try {
      const response = await fetch(`${POLICY_ENGINE_URL}/api/v1/policies/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(policyData),
      });
      
      if (!response.ok) {
        throw new Error(`Failed to create policy: ${response.statusText}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error creating policy:', error);
      throw error;
    }
  }

  static async updatePolicy(policyId: string, policyData: Partial<Policy>): Promise<Policy> {
    try {
      const response = await fetch(`${POLICY_ENGINE_URL}/api/v1/policies/${policyId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(policyData),
      });
      
      if (!response.ok) {
        throw new Error(`Failed to update policy: ${response.statusText}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error updating policy:', error);
      throw error;
    }
  }

  static async deletePolicy(policyId: string): Promise<void> {
    try {
      const response = await fetch(`${POLICY_ENGINE_URL}/api/v1/policies/${policyId}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        throw new Error(`Failed to delete policy: ${response.statusText}`);
      }
    } catch (error) {
      console.error('Error deleting policy:', error);
      throw error;
    }
  }

  // Policy Rules
  static async getRulesByPolicy(policyId: string): Promise<PolicyRule[]> {
    try {
      const response = await fetch(`${POLICY_ENGINE_URL}/api/v1/policy-rules/?policy_id=${policyId}`);
      if (!response.ok) {
        throw new Error(`Failed to fetch rules: ${response.statusText}`);
      }
      return await response.json();
    } catch (error) {
      console.error('Error fetching rules:', error);
      throw error;
    }
  }

  static async createRule(ruleData: Omit<PolicyRule, 'id' | 'created_at' | 'updated_at'>): Promise<PolicyRule> {
    try {
      const response = await fetch(`${POLICY_ENGINE_URL}/api/v1/policy-rules/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(ruleData),
      });
      
      if (!response.ok) {
        throw new Error(`Failed to create rule: ${response.statusText}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error creating rule:', error);
      throw error;
    }
  }

  // Rule Specifications
  static async getRuleSpecifications(travelType?: string): Promise<RuleSpecification[]> {
    try {
      const url = travelType 
        ? `${POLICY_ENGINE_URL}/api/v1/policy-rules/specs?travel_type=${travelType}`
        : `${POLICY_ENGINE_URL}/api/v1/policy-rules/specs`;
      
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`Failed to fetch rule specifications: ${response.statusText}`);
      }
      return await response.json();
    } catch (error) {
      console.error('Error fetching rule specifications:', error);
      throw error;
    }
  }

  // Policy Evaluation
  static async evaluatePolicy(request: PolicyEvaluationRequest): Promise<PolicyEvaluationResult> {
    try {
      const response = await fetch(`${POLICY_ENGINE_URL}/api/v1/policy-evaluation/evaluate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(request),
      });
      
      if (!response.ok) {
        throw new Error(`Failed to evaluate policy: ${response.statusText}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error evaluating policy:', error);
      throw error;
    }
  }

  // Supabase Direct Access (for user assignments, approvers, etc.)
  static async assignPolicyToUser(userId: string, policyId: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('user_policy_assignments')
        .insert({
          user_id: userId,
          policy_id: policyId,
          assigned_by: (await supabase.auth.getUser()).data.user?.id
        });

      if (error) throw error;
    } catch (error) {
      console.error('Error assigning policy to user:', error);
      throw error;
    }
  }

  static async removePolicyFromUser(userId: string, policyId: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('user_policy_assignments')
        .delete()
        .eq('user_id', userId)
        .eq('policy_id', policyId);

      if (error) throw error;
    } catch (error) {
      console.error('Error removing policy from user:', error);
      throw error;
    }
  }

  static async getUserPolicies(userId: string): Promise<Policy[]> {
    try {
      const { data, error } = await supabase
        .from('user_policy_assignments')
        .select(`
          policy:policies (
            id, org_id, label, type, active, action, enforce_approval,
            message_for_reservation, exclude_restricted_fares, 
            refundable_fares_enabled, user_count, guest_count, 
            approver_count, created_at, updated_at
          )
        `)
        .eq('user_id', userId);

      if (error) throw error;

      return data?.map((assignment: any) => assignment.policy) || [];
    } catch (error) {
      console.error('Error fetching user policies:', error);
      throw error;
    }
  }

  // Health check
  static async healthCheck(): Promise<boolean> {
    try {
      const response = await fetch(`${POLICY_ENGINE_URL}/docs/`);
      return response.ok;
    } catch (error) {
      console.error('Policy engine health check failed:', error);
      return false;
    }
  }
}