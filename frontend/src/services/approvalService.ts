/**
 * Service for handling approval requests
 */

const POLICY_ENGINE_URL = process.env.REACT_APP_POLICY_ENGINE_URL || 'http://localhost:5001';

export interface ApprovalRequest {
  id: string;
  org_id: string;
  user_id: string;
  approver_id?: string;
  travel_data: any;
  policy_evaluation: any;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  reason?: string;
  created_at: string;
  updated_at: string;
}

export interface CreateApprovalRequest {
  org_id: string;
  user_id: string;
  travel_data: any;
  policy_evaluation: any;
}

export interface ProcessApproval {
  action: 'APPROVE' | 'REJECT';
  reason?: string;
  approver_id: string;
}

export class ApprovalService {
  /**
   * Get approval requests for an organization
   */
  static async getApprovalRequests(params: {
    org_id: string;
    user_id?: string;     // For sent requests
    approver_id?: string; // For received requests
    status?: string;
  }): Promise<ApprovalRequest[]> {
    const queryParams = new URLSearchParams({
      org_id: params.org_id,
      ...(params.user_id && { user_id: params.user_id }),
      ...(params.approver_id && { approver_id: params.approver_id }),
      ...(params.status && { status: params.status })
    });

    const response = await fetch(`${POLICY_ENGINE_URL}/api/v1/approval-requests/?${queryParams}`);
    if (!response.ok) {
      throw new Error(`Failed to fetch approval requests: ${response.statusText}`);
    }
    return await response.json();
  }

  /**
   * Get sent approval requests for a user
   */
  static async getSentRequests(org_id: string, user_id: string): Promise<ApprovalRequest[]> {
    return this.getApprovalRequests({ org_id, user_id });
  }

  /**
   * Get received approval requests for an approver
   */
  static async getReceivedRequests(org_id: string, approver_id: string): Promise<ApprovalRequest[]> {
    return this.getApprovalRequests({ org_id, approver_id });
  }

  /**
   * Get pending approval requests for an approver
   */
  static async getPendingRequests(org_id: string, approver_id: string): Promise<ApprovalRequest[]> {
    return this.getApprovalRequests({ org_id, approver_id, status: 'PENDING' });
  }

  /**
   * Create a new approval request
   */
  static async createApprovalRequest(request: CreateApprovalRequest): Promise<ApprovalRequest> {
    const response = await fetch(`${POLICY_ENGINE_URL}/api/v1/approval-requests/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(request),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || `Failed to create approval request: ${response.statusText}`);
    }

    return await response.json();
  }

  /**
   * Get a specific approval request
   */
  static async getApprovalRequest(requestId: string): Promise<ApprovalRequest> {
    const response = await fetch(`${POLICY_ENGINE_URL}/api/v1/approval-requests/${requestId}`);
    if (!response.ok) {
      throw new Error(`Failed to fetch approval request: ${response.statusText}`);
    }
    return await response.json();
  }

  /**
   * Process an approval request (approve or reject)
   */
  static async processApproval(requestId: string, decision: ProcessApproval): Promise<ApprovalRequest> {
    const response = await fetch(`${POLICY_ENGINE_URL}/api/v1/approval-requests/${requestId}/process`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(decision),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || `Failed to process approval: ${response.statusText}`);
    }

    return await response.json();
  }

  /**
   * Approve a request
   */
  static async approveRequest(requestId: string, approverId: string, reason?: string): Promise<ApprovalRequest> {
    return this.processApproval(requestId, {
      action: 'APPROVE',
      approver_id: approverId,
      reason
    });
  }

  /**
   * Reject a request
   */
  static async rejectRequest(requestId: string, approverId: string, reason?: string): Promise<ApprovalRequest> {
    return this.processApproval(requestId, {
      action: 'REJECT',
      approver_id: approverId,
      reason
    });
  }

  /**
   * Format travel data for display
   */
  static formatTravelData(travelData: any): string {
    if (travelData.train) {
      const train = travelData.train;
      const origin = travelData.origin || 'Unknown';
      const destination = travelData.destination || 'Unknown';
      const price = train.currency ? `${train.currency} ${train.price}` : `€${train.price}`;
      const date = train.departure_date ? new Date(train.departure_date).toLocaleDateString() : '';
      
      return `${origin} → ${destination} | ${price} | ${train.class || 'Standard'} | ${date}`;
    }
    
    if (travelData.flight) {
      const flight = travelData.flight;
      return `Flight: ${flight.price} ${flight.currency}`;
    }
    
    return 'Travel booking';
  }

  /**
   * Get the primary policy violation message
   */
  static getPolicyViolationSummary(policyEvaluation: any): string {
    if (policyEvaluation.messages && policyEvaluation.messages.length > 0) {
      return policyEvaluation.messages[0];
    }
    
    if (policyEvaluation.result === 'APPROVAL_REQUIRED') {
      return 'Requires manager approval';
    }
    
    if (policyEvaluation.result === 'OUT_OF_POLICY') {
      return 'Out of company policy';
    }
    
    return 'Policy violation';
  }
}