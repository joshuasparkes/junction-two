import React, { useState } from "react";
import Layout from "../components/common/Layout";

const BookTravelPage: React.FC = () => {
  const [tripType, setTripType] = useState("roundtrip");
  const [classType, setClassType] = useState("economy");

  return (
    <Layout>
      <div className="max-w-4xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-semibold text-gray-900 mb-8">
          Hi Jane, Search for a Flight
        </h1>

        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex space-x-4 mb-6">
            <button
              onClick={() => setTripType("roundtrip")}
              className={`px-4 py-2 rounded-lg text-sm font-medium ${
                tripType === "roundtrip"
                  ? "bg-blue-100 text-blue-700 border border-blue-300"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              Roundtrip
            </button>
            <button
              onClick={() => setTripType("oneway")}
              className={`px-4 py-2 rounded-lg text-sm font-medium ${
                tripType === "oneway"
                  ? "bg-blue-100 text-blue-700 border border-blue-300"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              One way
            </button>
            <button
              onClick={() => setTripType("multicity")}
              className={`px-4 py-2 rounded-lg text-sm font-medium ${
                tripType === "multicity"
                  ? "bg-blue-100 text-blue-700 border border-blue-300"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              Multi-city
            </button>

            <div className="ml-auto flex items-center space-x-4">
              <select
                value={classType}
                onChange={(e) => setClassType(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="economy">Economy</option>
                <option value="premium">Premium Economy</option>
                <option value="business">Business</option>
                <option value="first">First Class</option>
              </select>

              <label className="flex items-center text-sm text-gray-600">
                <input type="checkbox" className="mr-2 rounded" />
                Direct flights only
              </label>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="relative">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                <svg
                  className="w-4 h-4 inline mr-1"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
                  />
                </svg>
                Where from?
              </label>
              <input
                type="text"
                placeholder="Enter departure city"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div className="relative">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                <svg
                  className="w-4 h-4 inline mr-1"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                  />
                </svg>
                Where to?
              </label>
              <input
                type="text"
                placeholder="Enter destination city"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <button className="absolute right-3 top-8 p-1">
                <svg
                  className="w-4 h-4 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4"
                  />
                </svg>
              </button>
            </div>

            <div className="relative">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                <svg
                  className="w-4 h-4 inline mr-1"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8 7V3a2 2 0 012-2h4a2 2 0 012 2v4m-6 0h6m-6 0a2 2 0 00-2 2v10a2 2 0 002 2h6a2 2 0 002-2V9a2 2 0 00-2-2"
                  />
                </svg>
                Depart date
              </label>
              <input
                type="date"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {tripType === "roundtrip" && (
              <div className="relative">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  <svg
                    className="w-4 h-4 inline mr-1"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M8 7V3a2 2 0 012-2h4a2 2 0 012 2v4m-6 0h6m-6 0a2 2 0 00-2 2v10a2 2 0 002 2h6a2 2 0 002-2V9a2 2 0 00-2-2"
                    />
                  </svg>
                  Return date
                </label>
                <input
                  type="date"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            )}
          </div>

          <div className="flex items-center justify-between">
            <div className="relative">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                <svg
                  className="w-4 h-4 inline mr-1"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                  />
                </svg>
                1 Adult
              </label>
              <select className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                <option>1 Adult</option>
                <option>2 Adults</option>
                <option>3 Adults</option>
                <option>4+ Adults</option>
              </select>
            </div>

            <button className="bg-blue-600 text-white px-8 py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium">
              Search flights
            </button>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default BookTravelPage;
