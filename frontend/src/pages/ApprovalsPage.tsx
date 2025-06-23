import React, { useState, useEffect } from "react";
import Layout from "../components/common/Layout";
import OrgSelector from "../components/common/OrgSelector";
import { useAuth } from "../contexts/AuthContext";
import { ApprovalService, ApprovalRequest } from "../services/approvalService";

const ApprovalsPage: React.FC = () => {
  const { user, currentOrganization } = useAuth();
  const [pendingApprovals, setPendingApprovals] = useState<ApprovalRequest[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [processingRequest, setProcessingRequest] = useState<string | null>(null);

  useEffect(() => {
    if (currentOrganization) {
      loadApprovalRequests();
    }
  }, [currentOrganization]);

  const loadApprovalRequests = async () => {
    if (!currentOrganization) return;

    setLoading(true);
    setError(null);

    try {
      // Get ALL pending approval requests for the organization
      const pending = await ApprovalService.getApprovalRequests({
        org_id: currentOrganization.id,
        status: 'PENDING'
      });
      setPendingApprovals(pending);
    } catch (err) {
      console.error('Failed to load approval requests:', err);
      setError(err instanceof Error ? err.message : 'Failed to load approval requests');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (requestId: string, reason?: string) => {
    if (!user || processingRequest) return;

    setProcessingRequest(requestId);
    try {
      await ApprovalService.approveRequest(requestId, user.id, reason);
      await loadApprovalRequests(); // Reload the list
    } catch (err) {
      console.error('Failed to approve request:', err);
      setError(err instanceof Error ? err.message : 'Failed to approve request');
    } finally {
      setProcessingRequest(null);
    }
  };

  const handleReject = async (requestId: string, reason?: string) => {
    if (!user || processingRequest) return;

    setProcessingRequest(requestId);
    try {
      await ApprovalService.rejectRequest(requestId, user.id, reason);
      await loadApprovalRequests(); // Reload the list
    } catch (err) {
      console.error('Failed to reject request:', err);
      setError(err instanceof Error ? err.message : 'Failed to reject request');
    } finally {
      setProcessingRequest(null);
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
            Pending Approvals
          </h1>
          <p className="content-text text-chatgpt-text-secondary">
            All pending approval requests for {currentOrganization?.name || 'your organization'}
          </p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700">
            {error}
          </div>
        )}

        {/* Content */}
        <div>
          <div className="flex items-center justify-between mb-6">
            <h2 className="title-text font-normal text-chatgpt-text-primary">
              {pendingApprovals.length} Pending Approval{pendingApprovals.length !== 1 ? 's' : ''}
            </h2>
            {loading && (
              <div className="text-sm text-gray-500 flex items-center">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mr-2"></div>
                Loading...
              </div>
            )}
          </div>

          {pendingApprovals.length > 0 ? (
            <div className="bg-white rounded-lg shadow-sm overflow-hidden border border-gray-200">
              {/* Table Header */}
              <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
                <div className="grid grid-cols-6 gap-4">
                  <div className="sidebar-text font-normal text-gray-600">
                    Travel Details
                  </div>
                  <div className="sidebar-text font-normal text-gray-600">
                    Requested by
                  </div>
                  <div className="sidebar-text font-normal text-gray-600">
                    Policy Violation
                  </div>
                  <div className="sidebar-text font-normal text-gray-600">
                    Submission Date
                  </div>
                  <div className="sidebar-text font-normal text-gray-600">
                    Status
                  </div>
                  <div className="sidebar-text font-normal text-gray-600">
                    Actions
                  </div>
                </div>
              </div>

              {/* Table Body */}
              <div className="divide-y divide-gray-200">
                {pendingApprovals.map((approval) => (
                  <div
                    key={approval.id}
                    className="px-6 py-4 hover:bg-gray-50 transition-colors duration-200"
                  >
                    <div className="grid grid-cols-6 gap-4 items-center">
                      <div className="sidebar-text font-normal text-gray-900">
                        {ApprovalService.formatTravelData(approval.travel_data)}
                      </div>
                      <div className="sidebar-text text-gray-700">
                        {approval.user_id.slice(0, 8)}...
                      </div>
                      <div className="sidebar-text text-gray-700">
                        {ApprovalService.getPolicyViolationSummary(approval.policy_evaluation)}
                      </div>
                      <div className="sidebar-text text-gray-700">
                        {new Date(approval.created_at).toLocaleDateString()}
                      </div>
                      <div className="sidebar-text">
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-700">
                          PENDING
                        </span>
                      </div>
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleApprove(approval.id)}
                          disabled={processingRequest === approval.id}
                          className="bg-green-600 text-white px-3 py-1 rounded text-xs hover:bg-green-700 disabled:opacity-50 transition-colors"
                        >
                          {processingRequest === approval.id ? 'Processing...' : 'Approve'}
                        </button>
                        <button
                          onClick={() => handleReject(approval.id)}
                          disabled={processingRequest === approval.id}
                          className="bg-red-600 text-white px-3 py-1 rounded text-xs hover:bg-red-700 disabled:opacity-50 transition-colors"
                        >
                          Reject
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="text-center py-12">
              <svg
                className="mx-auto h-12 w-12 text-gray-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <h3 className="mt-2 content-text font-normal text-gray-900">
                No pending approvals
              </h3>
              <p className="mt-1 sidebar-text text-gray-500">
                There are no travel bookings waiting for approval.
              </p>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default ApprovalsPage;