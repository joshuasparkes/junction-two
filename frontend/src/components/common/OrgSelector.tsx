import React, { useState } from "react";
import { useAuth } from "../../contexts/AuthContext";

const OrgSelector: React.FC = () => {
  const { currentOrganization, setCurrentOrganization, user } = useAuth();
  const [showOrgMenu, setShowOrgMenu] = useState(false);
  const userOrganizations = user?.organizations || [];

  if (!user || userOrganizations.length === 0) {
    return null;
  }

  return (
    <div className="relative inline-block">
      <button
        onClick={() => setShowOrgMenu(!showOrgMenu)}
        className="flex items-center gap-3 py-2 bg-white hover:bg-gray-50 "
      >
        <div className="flex items-center gap-2">
          <span className="text-lg font-normal text-black">Org</span>
          <span className="text-lg text-chatgpt-text-secondary">
            {currentOrganization?.name || "Select Organization"}
          </span>
        </div>
        <svg
          className="w-5 h-5 text-black"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          strokeWidth={1.5}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </button>

      {/* Organization Dropdown */}
      {showOrgMenu && (
        <div className="absolute top-full left-0 mt-1 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50 min-w-full">
          {userOrganizations.map((org) => (
            <button
              key={org.id}
              onClick={() => {
                setCurrentOrganization(org);
                setShowOrgMenu(false);
              }}
              className={`w-full text-left px-3 py-2 text-sm hover:bg-gray-50 flex items-center justify-between ${
                currentOrganization?.id === org.id
                  ? "bg-blue-50 text-blue-700"
                  : "text-gray-700"
              }`}
            >
              <div className="flex items-center">
                <div className="w-5 h-5 bg-blue-600 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-white text-xs font-bold">
                    {org.name.charAt(0)}
                  </span>
                </div>
                <div className="ml-2">
                  <div className="font-medium">{org.name}</div>
                  <div className="text-xs text-gray-500 capitalize">
                    {org.role}
                  </div>
                </div>
              </div>
              {currentOrganization?.id === org.id && (
                <svg
                  className="w-4 h-4 text-blue-600"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                    clipRule="evenodd"
                  />
                </svg>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default OrgSelector;
