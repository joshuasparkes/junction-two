import React, { useState } from "react";
import Layout from "../components/common/Layout";

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
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Approvals</h1>

        {/* Tabs */}
        <div className="border-b border-gray-200 mb-8">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setActiveTab("received")}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === "received"
                  ? "border-gray-900 text-gray-900"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              Received
            </button>
            <button
              onClick={() => setActiveTab("sent")}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === "sent"
                  ? "border-gray-900 text-gray-900"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              Sent
            </button>
          </nav>
        </div>

        {/* Content */}
        {activeTab === "received" && (
          <div>
            <h2 className="text-2xl font-semibold text-gray-900 mb-6">
              Received
            </h2>

            {currentApprovals.length > 0 ? (
              <div className="bg-white rounded-lg shadow-sm overflow-hidden">
                {/* Table Header */}
                <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
                  <div className="grid grid-cols-5 gap-4">
                    <div className="text-sm font-medium text-gray-500">
                      Trip Name
                    </div>
                    <div className="text-sm font-medium text-gray-500">
                      Requested by
                    </div>
                    <div className="text-sm font-medium text-gray-500">
                      Out of policy groups
                    </div>
                    <div className="text-sm font-medium text-gray-500">
                      Submission date
                    </div>
                    <div className="text-sm font-medium text-gray-500">
                      My policy status
                    </div>
                  </div>
                </div>

                {/* Table Body */}
                <div className="divide-y divide-gray-200">
                  {currentApprovals.map((approval) => (
                    <div
                      key={approval.id}
                      className="px-6 py-4 hover:bg-gray-50 cursor-pointer"
                    >
                      <div className="grid grid-cols-5 gap-4 items-center">
                        <div className="text-sm font-medium text-gray-900">
                          {approval.tripName}
                        </div>
                        <div className="text-sm text-gray-700">
                          {approval.requestedBy}
                        </div>
                        <div className="text-sm text-gray-700">
                          {approval.outOfPolicyGroups || ""}
                        </div>
                        <div className="text-sm text-gray-700">
                          {approval.submissionDate}
                        </div>
                        <div className="text-sm text-gray-700">
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
                <h3 className="mt-2 text-sm font-medium text-gray-900">
                  No approval requests
                </h3>
                <p className="mt-1 text-sm text-gray-500">
                  You don't have any pending approval requests.
                </p>
              </div>
            )}
          </div>
        )}

        {activeTab === "sent" && (
          <div>
            <h2 className="text-2xl font-semibold text-gray-900 mb-6">Sent</h2>

            {sentApprovals.length > 0 ? (
              <div className="bg-white rounded-lg shadow-sm overflow-hidden">
                {/* Table Header */}
                <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
                  <div className="grid grid-cols-5 gap-4">
                    <div className="text-sm font-medium text-gray-500">
                      Trip Name
                    </div>
                    <div className="text-sm font-medium text-gray-500">
                      Requested by
                    </div>
                    <div className="text-sm font-medium text-gray-500">
                      Out of policy groups
                    </div>
                    <div className="text-sm font-medium text-gray-500">
                      Submission date
                    </div>
                    <div className="text-sm font-medium text-gray-500">
                      My policy status
                    </div>
                  </div>
                </div>

                {/* Table Body */}
                <div className="divide-y divide-gray-200">
                  {sentApprovals.map((approval) => (
                    <div
                      key={approval.id}
                      className="px-6 py-4 hover:bg-gray-50 cursor-pointer"
                    >
                      <div className="grid grid-cols-5 gap-4 items-center">
                        <div className="text-sm font-medium text-gray-900">
                          {approval.tripName}
                        </div>
                        <div className="text-sm text-gray-700">
                          {approval.requestedBy}
                        </div>
                        <div className="text-sm text-gray-700">
                          {approval.outOfPolicyGroups || ""}
                        </div>
                        <div className="text-sm text-gray-700">
                          {approval.submissionDate}
                        </div>
                        <div className="text-sm text-gray-700">
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
                <h3 className="mt-2 text-sm font-medium text-gray-900">
                  No sent requests
                </h3>
                <p className="mt-1 text-sm text-gray-500">
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
