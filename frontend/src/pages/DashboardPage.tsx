import React from "react";
import { Link } from "react-router-dom";
import Layout from "../components/common/Layout";

const DashboardPage: React.FC = () => {
  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-2xl font-semibold text-gray-900 mb-2">
            Welcome back, Jane
          </h1>
          <p className="text-gray-600">Ready to plan your next adventure?</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Link
            to="/plan-trip"
            className="bg-white rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow border border-gray-200"
          >
            <div className="flex items-center mb-4">
              <div className="w-12 h-12 bg-green-600 rounded-full flex items-center justify-center">
                <svg
                  className="w-6 h-6 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 4v16m8-8H4"
                  />
                </svg>
              </div>
              <h3 className="ml-4 text-lg font-semibold text-gray-900">
                Plan New Trip
              </h3>
            </div>
            <p className="text-gray-600">
              Create a new trip board and invite friends to collaborate
            </p>
          </Link>

          <Link
            to="/book"
            className="bg-white rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow border border-gray-200 bg-blue-50"
          >
            <div className="flex items-center mb-4">
              <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center">
                <svg
                  className="w-6 h-6 text-white"
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
              </div>
              <h3 className="ml-4 text-lg font-semibold text-gray-900">
                Book Travel
              </h3>
            </div>
            <p className="text-gray-600">
              Search and book flights, hotels, cars, and trains
            </p>
          </Link>

          <Link
            to="/trips"
            className="bg-white rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow border border-gray-200"
          >
            <div className="flex items-center mb-4">
              <div className="w-12 h-12 bg-gray-600 rounded-full flex items-center justify-center">
                <svg
                  className="w-6 h-6 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-4m-5 0H3m2 0h4M9 7h6m-6 4h6m-6 4h6"
                  />
                </svg>
              </div>
              <h3 className="ml-4 text-lg font-semibold text-gray-900">
                My Trips
              </h3>
            </div>
            <p className="text-gray-600">
              View and manage your upcoming and past trips
            </p>
          </Link>
        </div>
      </div>
    </Layout>
  );
};

export default DashboardPage;
