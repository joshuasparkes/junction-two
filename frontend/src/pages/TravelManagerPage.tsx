import React, { useState } from "react";
import Layout from "../components/common/Layout";

const TravelManagerPage: React.FC = () => {
  const [activeMainTab, setActiveMainTab] = useState("company");
  const [activeSubTab, setActiveSubTab] = useState("profile");

  const mainTabs = [
    { id: "company", label: "Company" },
    { id: "activity-stream", label: "Activity Stream" },
    { id: "policies", label: "Policies" },
    { id: "people", label: "People" },
    { id: "guests", label: "Guests" },
    { id: "payment", label: "Payment" },
    { id: "trips", label: "Trips" },
    { id: "loyalty", label: "Loyalty" },
    { id: "reporting", label: "Reporting" },
    { id: "integrations", label: "Integrations" },
  ];

  const subTabs = [
    { id: "profile", label: "Profile" },
    { id: "permissions", label: "Permissions" },
    { id: "custom-fields", label: "Custom Fields" },
    { id: "email", label: "Email" },
  ];

  const companyData = {
    logo: "/junction-logo2.png",
    hero: "https://images.unsplash.com/photo-1497366216548-37526070297c?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80",
    name: "Snowfall Employee Travel Site",
    billingAddress: "6 Wellington Place, Leeds, ENG, United Kingdom, LS1 4AP",
    phoneNumber: "N/A",
  };

  return (
    <Layout>
      <div className="min-h-screen bg-gray-50">
        {/* Main Navigation */}
        <div className="bg-blue-600 shadow-sm">
          <div className="max-w-7xl mx-auto">
            <nav className="flex space-x-8 overflow-x-auto">
              {mainTabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveMainTab(tab.id)}
                  className={`px-4 py-4 text-sm font-medium whitespace-nowrap border-b-2 transition-colors ${
                    activeMainTab === tab.id
                      ? "text-white border-white"
                      : "text-blue-100 border-transparent hover:text-white hover:border-blue-300"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* Sub Navigation */}
        <div className="bg-white border-b border-gray-200">
          <div className="max-w-7xl mx-auto">
            <nav className="flex space-x-8">
              {subTabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveSubTab(tab.id)}
                  className={`px-1 py-4 text-sm font-medium border-b-2 transition-colors ${
                    activeSubTab === tab.id
                      ? "text-gray-900 border-gray-900"
                      : "text-gray-500 border-transparent hover:text-gray-700 hover:border-gray-300"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* Content */}
        <div className="max-w-7xl mx-auto px-4 py-8">
          {activeSubTab === "profile" && (
            <div>
              <div className="mb-8">
                <h1 className="text-2xl font-bold text-gray-900 mb-2">
                  Basic Info
                </h1>
                <p className="text-gray-600">
                  Help us get to know you better by adding information below.
                </p>
              </div>

              <div className="bg-white rounded-lg shadow-sm">
                {/* Company Logo */}
                <div className="flex items-center justify-between p-6 border-b border-gray-200">
                  <div className="flex items-center">
                    <span className="text-lg font-medium text-gray-900 w-48">
                      Company logo
                    </span>
                    <div className="flex items-center ml-8">
                      <div className="flex items-center space-x-3">
                        <svg
                          className="w-6 h-6 text-blue-600"
                          fill="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
                        </svg>
                        <span className="text-lg font-bold text-gray-900">
                          SNOWFALL
                        </span>
                      </div>
                    </div>
                  </div>
                  <button className="text-gray-400 hover:text-gray-600">
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
                        d="M9 5l7 7-7 7"
                      />
                    </svg>
                  </button>
                </div>

                {/* Company Hero */}
                <div className="flex items-center justify-between p-6 border-b border-gray-200">
                  <div className="flex items-center">
                    <span className="text-lg font-medium text-gray-900 w-48">
                      Company hero
                    </span>
                    <div className="ml-8">
                      <img
                        src={companyData.hero}
                        alt="Company hero"
                        className="w-48 h-16 object-cover rounded-lg"
                      />
                    </div>
                  </div>
                  <button className="text-gray-400 hover:text-gray-600">
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
                        d="M9 5l7 7-7 7"
                      />
                    </svg>
                  </button>
                </div>

                {/* Company Name */}
                <div className="flex items-center justify-between p-6 border-b border-gray-200">
                  <div className="flex items-center">
                    <span className="text-lg font-medium text-gray-900 w-48">
                      Company name
                    </span>
                    <span className="text-lg text-gray-700 ml-8">
                      {companyData.name}
                    </span>
                  </div>
                  <button className="text-gray-400 hover:text-gray-600">
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
                        d="M9 5l7 7-7 7"
                      />
                    </svg>
                  </button>
                </div>

                {/* Billing Address */}
                <div className="flex items-center justify-between p-6 border-b border-gray-200">
                  <div className="flex items-center">
                    <span className="text-lg font-medium text-gray-900 w-48">
                      Billing Address
                    </span>
                    <span className="text-lg text-gray-700 ml-8">
                      {companyData.billingAddress}
                    </span>
                  </div>
                  <button className="text-gray-400 hover:text-gray-600">
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
                        d="M9 5l7 7-7 7"
                      />
                    </svg>
                  </button>
                </div>

                {/* Phone Number */}
                <div className="flex items-center justify-between p-6">
                  <div className="flex items-center">
                    <span className="text-lg font-medium text-gray-900 w-48">
                      Phone Number
                    </span>
                    <span className="text-lg text-gray-700 ml-8">
                      {companyData.phoneNumber}
                    </span>
                  </div>
                  <button className="text-gray-400 hover:text-gray-600">
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
                        d="M9 5l7 7-7 7"
                      />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          )}

          {activeSubTab === "permissions" && (
            <div className="text-center py-12">
              <h2 className="text-xl font-semibold text-gray-900 mb-2">
                Permissions
              </h2>
              <p className="text-gray-600">
                Permissions management coming soon.
              </p>
            </div>
          )}

          {activeSubTab === "custom-fields" && (
            <div className="text-center py-12">
              <h2 className="text-xl font-semibold text-gray-900 mb-2">
                Custom Fields
              </h2>
              <p className="text-gray-600">
                Custom fields management coming soon.
              </p>
            </div>
          )}

          {activeSubTab === "email" && (
            <div className="text-center py-12">
              <h2 className="text-xl font-semibold text-gray-900 mb-2">
                Email
              </h2>
              <p className="text-gray-600">Email settings coming soon.</p>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default TravelManagerPage;
