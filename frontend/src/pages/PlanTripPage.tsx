import React, { useState } from "react";
import Layout from "../components/common/Layout";
import OrgSelector from "../components/common/OrgSelector";
import { createTrip } from "../services/tripService";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

const PlanTripPage: React.FC = () => {
  const { user, currentOrganization } = useAuth();
  const navigate = useNavigate();

  const getDefaultDates = () => {
    const today = new Date();
    const oneWeekFromNow = new Date();
    oneWeekFromNow.setDate(today.getDate() + 7);
    const twoWeeksFromNow = new Date();
    twoWeeksFromNow.setDate(today.getDate() + 14);

    return {
      start: oneWeekFromNow.toISOString().split("T")[0],
      end: twoWeeksFromNow.toISOString().split("T")[0],
    };
  };

  const defaultDates = getDefaultDates();
  const [tripName, setTripName] = useState("");
  const [startDate, setStartDate] = useState(defaultDates.start);
  const [endDate, setEndDate] = useState(defaultDates.end);
  const [inviteEmail, setInviteEmail] = useState("");
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleCreateTrip = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsCreating(true);
    setError(null);

    // Check if organization is selected
    if (!currentOrganization) {
      setError("Please select an organization to create a trip for");
      setIsCreating(false);
      return;
    }

    try {
      const trip = await createTrip({
        name: tripName,
        start_date: startDate,
        end_date: endDate,
        organization_id: currentOrganization.id,
      });

      console.log("Trip created successfully:", trip);
      navigate("/trips");
    } catch (err) {
      console.error("Failed to create trip:", err);
      setError(err instanceof Error ? err.message : "Failed to create trip");
    } finally {
      setIsCreating(false);
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
            Create new TripBoard
          </h1>
          <p className="content-text text-chatgpt-text-secondary">
            Name your board, invite your friends and create your trip together.
          </p>
        </div>

        <div className="bg-white rounded-lg shadow-sm pb-8">

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-md p-4 mb-6">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg
                    className="h-5 w-5 text-red-400"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-red-800">{error}</p>
                </div>
              </div>
            </div>
          )}

          <form onSubmit={handleCreateTrip} className="space-y-6">
            <div>
              <input
                type="text"
                placeholder="Trip Name"
                value={tripName}
                onChange={(e) => setTripName(e.target.value)}
                className="chatgpt-input w-full text-lg"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Trip Dates
              </label>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs text-gray-500 mb-1">
                    Start Date
                  </label>
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => {
                      setStartDate(e.target.value);
                      const start = new Date(e.target.value);
                      const end = new Date(endDate);
                      if (start >= end) {
                        const newEnd = new Date(start);
                        newEnd.setDate(start.getDate() + 1);
                        setEndDate(newEnd.toISOString().split("T")[0]);
                      }
                    }}
                    min={new Date().toISOString().split("T")[0]}
                    className="chatgpt-input w-full"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1">
                    End Date
                  </label>
                  <input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    min={startDate}
                    className="chatgpt-input w-full"
                  />
                </div>
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Default dates are set to one week from today
              </p>
            </div>

            <div className="flex space-x-2">
              <input
                type="email"
                placeholder="Name or email to search"
                value={inviteEmail}
                onChange={(e) => setInviteEmail(e.target.value)}
                className="chatgpt-input flex-1"
              />
              <button
                type="button"
                className="chatgpt-button"
              >
                Invite
              </button>
            </div>

            <div className="flex justify-end space-x-4 pt-6">
              <button
                type="button"
                className="chatgpt-button"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isCreating || !tripName.trim()}
                className="chatgpt-primary-button flex items-center justify-center"
              >
                {isCreating ? (
                  <>
                    <svg
                      className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    Creating...
                  </>
                ) : (
                  "Create TripBoard"
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </Layout>
  );
};

export default PlanTripPage;
