import React, { useState, useEffect } from "react";
import Layout from "../components/common/Layout";
import OrgSelector from "../components/common/OrgSelector";
import { useAuth } from "../contexts/AuthContext";
import { ApprovalService, ApprovalRequest } from "../services/approvalService";

const ApprovalsPage: React.FC = () => {
  const { user, currentOrganization } = useAuth();
  const [activeTab, setActiveTab] = useState("received");
  const [receivedApprovals, setReceivedApprovals] = useState<ApprovalRequest[]>([]);
  const [sentApprovals, setSentApprovals] = useState<ApprovalRequest[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [processingRequest, setProcessingRequest] = useState<string | null>(null);

  useEffect(() => {
    if (user && currentOrganization) {
      loadApprovalRequests();
    }
  }, [user, currentOrganization, activeTab]);

  const loadApprovalRequests = async () => {
    if (!user || !currentOrganization) return;

    setLoading(true);
    setError(null);

    try {
      if (activeTab === "received") {
        // Get approval requests where the current user is the approver
        const received = await ApprovalService.getReceivedRequests(currentOrganization.id, user.id);
        setReceivedApprovals(received);
      } else {
        // Get approval requests sent by the current user
        const sent = await ApprovalService.getSentRequests(currentOrganization.id, user.id);
        setSentApprovals(sent);
      }
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

  const currentApprovals = activeTab === "received" ? receivedApprovals : sentApprovals;

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
            Approvals
          </h1>
          <p className="content-text text-chatgpt-text-secondary">
            Manage approval requests for travel bookings
          </p>
        </div>

        {/* Tabs */}
        <div className="mb-8">
          <div className="inline-flex p-1 bg-gray-200 rounded-full">
            <button
              onClick={() => setActiveTab("received")}
              className={`px-4 py-1 rounded-full font-normal content-text transition-all duration-200 relative ${
                activeTab === "received"
                  ? "bg-white text-gray-900 shadow-sm z-10"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              Received
            </button>
            <button
              onClick={() => setActiveTab("sent")}
              className={`px-4 py-1 rounded-full font-normal content-text transition-all duration-200 relative ${
                activeTab === "sent"
                  ? "bg-white text-gray-900 shadow-sm z-10"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              Sent
            </button>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700">
            {error}
          </div>
        )}

        {/* Content */}
        {activeTab === "received" && (
          <div>
            <h2 className="title-text font-normal text-chatgpt-text-primary mb-6">
              Received {loading && <span className="text-sm text-gray-500">(Loading...)</span>}
            </h2>

            {currentApprovals.length > 0 ? (
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
                  {currentApprovals.map((approval) => (
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
                          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                            approval.status === 'PENDING' ? 'bg-yellow-100 text-yellow-700' :
                            approval.status === 'APPROVED' ? 'bg-green-100 text-green-700' :
                            'bg-red-100 text-red-700'
                          }`}>
                            {approval.status}
                          </span>
                        </div>
                        <div className="flex space-x-2">
                          {approval.status === 'PENDING' && (
                            <>
                              <button
                                onClick={() => handleApprove(approval.id)}
                                disabled={processingRequest === approval.id}
                                className="bg-green-600 text-white px-3 py-1 rounded text-xs hover:bg-green-700 disabled:opacity-50"
                              >
                                {processingRequest === approval.id ? 'Processing...' : 'Approve'}
                              </button>
                              <button
                                onClick={() => handleReject(approval.id)}
                                disabled={processingRequest === approval.id}
                                className="bg-red-600 text-white px-3 py-1 rounded text-xs hover:bg-red-700 disabled:opacity-50"
                              >
                                Reject
                              </button>
                            </>
                          )}
                          {approval.status !== 'PENDING' && approval.reason && (
                            <span className="text-xs text-gray-500" title={approval.reason}>
                              {approval.reason.slice(0, 20)}...
                            </span>
                          )}
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
                  No approval requests
                </h3>
                <p className="mt-1 sidebar-text text-gray-500">
                  You don't have any pending approval requests.
                </p>
              </div>
            )}
          </div>
        )}

        {activeTab === "sent" && (
          <div>
            <h2 className="title-text font-normal text-chatgpt-text-primary mb-6">
              Sent {loading && <span className="text-sm text-gray-500">(Loading...)</span>}
            </h2>

            {currentApprovals.length > 0 ? (
              <div className="bg-white rounded-lg shadow-sm overflow-hidden border border-gray-200">
                {/* Table Header */}
                <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
                  <div className="grid grid-cols-5 gap-4">
                    <div className="sidebar-text font-normal text-gray-600">
                      Travel Details
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
                      Approver Response
                    </div>
                  </div>
                </div>

                {/* Table Body */}
                <div className="divide-y divide-gray-200">
                  {currentApprovals.map((approval) => (
                    <div
                      key={approval.id}
                      className="px-6 py-4 hover:bg-gray-50 transition-colors duration-200"
                    >
                      <div className="grid grid-cols-5 gap-4 items-center">
                        <div className="sidebar-text font-normal text-gray-900">
                          {ApprovalService.formatTravelData(approval.travel_data)}
                        </div>
                        <div className="sidebar-text text-gray-700">
                          {ApprovalService.getPolicyViolationSummary(approval.policy_evaluation)}
                        </div>
                        <div className="sidebar-text text-gray-700">
                          {new Date(approval.created_at).toLocaleDateString()}
                        </div>
                        <div className="sidebar-text">
                          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                            approval.status === 'PENDING' ? 'bg-yellow-100 text-yellow-700' :
                            approval.status === 'APPROVED' ? 'bg-green-100 text-green-700' :
                            'bg-red-100 text-red-700'
                          }`}>
                            {approval.status}
                          </span>
                        </div>
                        <div className="sidebar-text text-gray-700">
                          {approval.reason || (approval.status === 'PENDING' ? 'Waiting for response' : 'No reason provided')}
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
                    d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
                  />
                </svg>
                <h3 className="mt-2 content-text font-normal text-gray-900">
                  No sent requests
                </h3>
                <p className="mt-1 sidebar-text text-gray-500">
                  You haven't sent any approval requests yet.
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </Layout>
  );
};

export default ApprovalsPage;
