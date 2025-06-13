import React, { useState } from "react";
import Layout from "../components/common/Layout";

interface FiltersState {
  reservationStatus: {
    draft: boolean;
    confirmed: boolean;
  };
  organizations: {
    snowfallLeisure: boolean;
    snowfallEmployee: boolean;
    snowfallLimited: boolean;
  };
  personalTrips: boolean;
}

const MyTripsPage: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("start-date");
  const [activeTab, setActiveTab] = useState("upcoming");
  const [filters, setFilters] = useState<FiltersState>({
    reservationStatus: {
      draft: false,
      confirmed: true,
    },
    organizations: {
      snowfallLeisure: true,
      snowfallEmployee: true,
      snowfallLimited: true,
    },
    personalTrips: true,
  });

  const handleReservationStatusChange = (
    key: keyof FiltersState["reservationStatus"]
  ) => {
    setFilters((prev) => ({
      ...prev,
      reservationStatus: {
        ...prev.reservationStatus,
        [key]: !prev.reservationStatus[key],
      },
    }));
  };

  const handleOrganizationChange = (
    key: keyof FiltersState["organizations"]
  ) => {
    setFilters((prev) => ({
      ...prev,
      organizations: {
        ...prev.organizations,
        [key]: !prev.organizations[key],
      },
    }));
  };

  const handlePersonalTripsChange = () => {
    setFilters((prev) => ({
      ...prev,
      personalTrips: !prev.personalTrips,
    }));
  };

  const trips = [
    {
      id: "1965311",
      title: "Snowfall Employee Travel Site",
      status: "Draft",
      startDate: "12 Jun 2025",
      endDate: "19 Jun 2025",
      createdAt: "a day ago",
      type: "upcoming",
    },
  ];

  const upcomingTrips = trips.filter((trip) => trip.type === "upcoming");
  const pastTrips = trips.filter((trip) => trip.type === "past");

  return (
    <Layout>
      <div className="flex h-full">
        {/* Sidebar Filters */}
        <div className="w-80 bg-gray-50 border-r border-gray-200 p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">
            Filter by
          </h2>

          {/* Reservation Status */}
          <div className="mb-8">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              Reservation status
            </h3>
            <div className="space-y-3">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={filters.reservationStatus.draft}
                  onChange={() => handleReservationStatusChange("draft")}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <span className="ml-3 text-gray-700">Draft</span>
              </label>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={filters.reservationStatus.confirmed}
                  onChange={() => handleReservationStatusChange("confirmed")}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <span className="ml-3 text-green-600 font-medium">
                  Confirmed
                </span>
              </label>
            </div>
          </div>

          {/* Organizations */}
          <div className="mb-8">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              Organizations
            </h3>
            <div className="space-y-3">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={filters.organizations.snowfallLeisure}
                  onChange={() => handleOrganizationChange("snowfallLeisure")}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <span className="ml-3 text-gray-700">
                  Snowfall Leisure Travel Site{" "}
                  <span className="text-gray-500">(1)</span>
                </span>
              </label>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={filters.organizations.snowfallEmployee}
                  onChange={() => handleOrganizationChange("snowfallEmployee")}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <span className="ml-3 text-gray-700">
                  Snowfall Employee Travel Site{" "}
                  <span className="text-gray-500">(1)</span>
                </span>
              </label>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={filters.organizations.snowfallLimited}
                  onChange={() => handleOrganizationChange("snowfallLimited")}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <span className="ml-3 text-gray-700">
                  Snowfall Limited <span className="text-gray-500">(5)</span>
                </span>
              </label>
            </div>
          </div>

          {/* Personal Trips */}
          <div>
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={filters.personalTrips}
                onChange={handlePersonalTripsChange}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <span className="ml-3 text-gray-700 font-medium">
                Personal Trips{" "}
                <span className="text-gray-500 font-normal">(1)</span>
              </span>
            </label>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <h1 className="text-3xl font-bold text-gray-900">My Trips</h1>
            <div className="flex items-center space-x-4">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search traveler, trip name or ID"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-96 pl-4 pr-10 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <button className="absolute right-3 top-1/2 transform -translate-y-1/2">
                  <svg
                    className="w-5 h-5 text-gray-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                    />
                  </svg>
                </button>
              </div>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="start-date">Sort by start date</option>
                <option value="end-date">Sort by end date</option>
                <option value="created-date">Sort by created date</option>
                <option value="trip-name">Sort by trip name</option>
              </select>
            </div>
          </div>

          {/* Tabs */}
          <div className="border-b border-gray-200 mb-6">
            <nav className="-mb-px flex space-x-8">
              <button
                onClick={() => setActiveTab("upcoming")}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === "upcoming"
                    ? "border-blue-500 text-blue-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                Upcoming Trips ({upcomingTrips.length})
              </button>
              <button
                onClick={() => setActiveTab("past")}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === "past"
                    ? "border-blue-500 text-blue-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                Past Trips ({pastTrips.length})
              </button>
            </nav>
          </div>

          {/* Trip Cards */}
          <div className="space-y-4">
            {activeTab === "upcoming" &&
              upcomingTrips.map((trip) => (
                <div
                  key={trip.id}
                  className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center mb-2">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                          {trip.status}
                        </span>
                      </div>
                      <div className="text-sm text-gray-600 mb-3">
                        {trip.startDate} to {trip.endDate} • {trip.createdAt}
                      </div>
                      <h3 className="text-lg font-medium text-gray-900">
                        {trip.title} • ID: {trip.id}
                      </h3>
                    </div>
                    <div className="flex items-center space-x-2 ml-4">
                      <button className="p-2 text-gray-400 hover:text-gray-600">
                        <svg
                          className="w-5 h-5"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"
                          />
                        </svg>
                      </button>
                      <button className="p-2 text-gray-400 hover:text-red-600">
                        <svg
                          className="w-5 h-5"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                          />
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>
              ))}

            {activeTab === "past" && pastTrips.length === 0 && (
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
                    d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                  />
                </svg>
                <h3 className="mt-2 text-sm font-medium text-gray-900">
                  No past trips
                </h3>
                <p className="mt-1 text-sm text-gray-500">
                  Your completed trips will appear here.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default MyTripsPage;
