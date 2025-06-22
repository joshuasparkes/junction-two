import React, { useState } from "react";
import Layout from "../components/common/Layout";
import OrgSelector from "../components/common/OrgSelector";

interface ApprovalRequest {
  id: string;
  tripName: string;
  requestedBy: string;
  outOfPolicyGroups?: number;
  submissionDate: string;
  myPolicyStatus?: string;
}

const ApprovalsPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState("received");

  const receivedApprovals: ApprovalRequest[] = [
    {
      id: "1",
      tripName: "Google Ideation",
      requestedBy: "Ron Glickman",
      submissionDate: "15 Sep 2023, 08:16 PM",
    },
    {
      id: "2",
      tripName: "Google Ideation",
      requestedBy: "Michelle Degala Castillo",
      submissionDate: "01 Oct 2023, 05:06 PM",
    },
    {
      id: "3",
      tripName: "Trip to LHR",
      requestedBy: "Spencer Dando",
      outOfPolicyGroups: 1,
      submissionDate: "22 Feb 2024, 10:01 AM",
    },
    {
      id: "4",
      tripName: "Trip to LHR",
      requestedBy: "Spencer Dando",
      outOfPolicyGroups: 1,
      submissionDate: "22 Feb 2024, 11:07 AM",
    },
  ];

  const sentApprovals: ApprovalRequest[] = [];

  const currentApprovals =
    activeTab === "received" ? receivedApprovals : sentApprovals;

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

        {/* Content */}
        {activeTab === "received" && (
          <div>
            <h2 className="title-text font-normal text-chatgpt-text-primary mb-6">
              Received
            </h2>

            {currentApprovals.length > 0 ? (
              <div className="bg-white rounded-lg shadow-sm overflow-hidden border border-gray-200">
                {/* Table Header */}
                <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
                  <div className="grid grid-cols-5 gap-4">
                    <div className="sidebar-text font-normal text-gray-600">
                      Trip Name
                    </div>
                    <div className="sidebar-text font-normal text-gray-600">
                      Requested by
                    </div>
                    <div className="sidebar-text font-normal text-gray-600">
                      Out of policy groups
                    </div>
                    <div className="sidebar-text font-normal text-gray-600">
                      Submission date
                    </div>
                    <div className="sidebar-text font-normal text-gray-600">
                      My policy status
                    </div>
                  </div>
                </div>

                {/* Table Body */}
                <div className="divide-y divide-gray-200">
                  {currentApprovals.map((approval) => (
                    <div
                      key={approval.id}
                      className="px-6 py-4 hover:bg-gray-50 cursor-pointer transition-colors duration-200"
                    >
                      <div className="grid grid-cols-5 gap-4 items-center">
                        <div className="sidebar-text font-normal text-gray-900">
                          {approval.tripName}
                        </div>
                        <div className="sidebar-text text-gray-700">
                          {approval.requestedBy}
                        </div>
                        <div className="sidebar-text text-gray-700">
                          {approval.outOfPolicyGroups || ""}
                        </div>
                        <div className="sidebar-text text-gray-700">
                          {approval.submissionDate}
                        </div>
                        <div className="sidebar-text text-gray-700">
                          {approval.myPolicyStatus || ""}
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
            <h2 className="title-text font-normal text-chatgpt-text-primary mb-6">Sent</h2>

            {sentApprovals.length > 0 ? (
              <div className="bg-white rounded-lg shadow-sm overflow-hidden border border-gray-200">
                {/* Table Header */}
                <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
                  <div className="grid grid-cols-5 gap-4">
                    <div className="sidebar-text font-normal text-gray-600">
                      Trip Name
                    </div>
                    <div className="sidebar-text font-normal text-gray-600">
                      Requested by
                    </div>
                    <div className="sidebar-text font-normal text-gray-600">
                      Out of policy groups
                    </div>
                    <div className="sidebar-text font-normal text-gray-600">
                      Submission date
                    </div>
                    <div className="sidebar-text font-normal text-gray-600">
                      My policy status
                    </div>
                  </div>
                </div>

                {/* Table Body */}
                <div className="divide-y divide-gray-200">
                  {sentApprovals.map((approval) => (
                    <div
                      key={approval.id}
                      className="px-6 py-4 hover:bg-gray-50 cursor-pointer transition-colors duration-200"
                    >
                      <div className="grid grid-cols-5 gap-4 items-center">
                        <div className="sidebar-text font-normal text-gray-900">
                          {approval.tripName}
                        </div>
                        <div className="sidebar-text text-gray-700">
                          {approval.requestedBy}
                        </div>
                        <div className="sidebar-text text-gray-700">
                          {approval.outOfPolicyGroups || ""}
                        </div>
                        <div className="sidebar-text text-gray-700">
                          {approval.submissionDate}
                        </div>
                        <div className="sidebar-text text-gray-700">
                          {approval.myPolicyStatus || ""}
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
