import React, { useState } from "react";
import Layout from "../components/common/Layout";

const PlanTripPage: React.FC = () => {
  const [tripName, setTripName] = useState("");
  const [startDate, setStartDate] = useState("2025-06-13");
  const [endDate, setEndDate] = useState("2025-06-20");
  const [inviteEmail, setInviteEmail] = useState("");

  const handleCreateTrip = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Creating trip:", { tripName, startDate, endDate });
  };

  return (
    <Layout>
      <div className="max-w-2xl mx-auto px-4 py-8">
        <div className="bg-white rounded-lg shadow-sm p-8">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-2xl font-semibold text-gray-900">
              Create new TripBoard
            </h1>
            <button className="text-gray-400 hover:text-gray-600">
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>

          <p className="text-gray-600 mb-8">
            Name your board, invite your friends and create your trip together.
          </p>

          <form onSubmit={handleCreateTrip} className="space-y-6">
            <div>
              <input
                type="text"
                placeholder="Trip Name"
                value={tripName}
                onChange={(e) => setTripName(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-lg"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Start Date
                </label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  End Date
                </label>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            <div className="flex space-x-2">
              <input
                type="email"
                placeholder="Name or email to search"
                value={inviteEmail}
                onChange={(e) => setInviteEmail(e.target.value)}
                className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <button
                type="button"
                className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium"
              >
                Invite
              </button>
            </div>

            <div className="flex justify-end space-x-4 pt-6">
              <button
                type="button"
                className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium"
              >
                Create TripBoard
              </button>
            </div>
          </form>
        </div>
      </div>
    </Layout>
  );
};

export default PlanTripPage;
