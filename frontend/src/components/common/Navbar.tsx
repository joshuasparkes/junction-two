import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";

const Navbar: React.FC = () => {
  const [isExpanded, setIsExpanded] = useState(true);
  const location = useLocation();

  const isActive = (path: string) => location.pathname === path;

  const menuItems = [
    {
      path: "/plan-trip",
      name: "Plan Trip",
      icon: (
        <div className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center">
          <svg
            className="w-3 h-3 text-white"
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
      ),
    },
    {
      path: "/book",
      name: "Book Travel",
      icon: (
        <svg
          className="w-6 h-6 text-blue-600"
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
      ),
      highlight: true,
    },
    {
      path: "/trips",
      name: "My Trips",
      icon: (
        <svg
          className="w-6 h-6 text-gray-600"
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
      ),
    },
    {
      path: "/travel-manager",
      name: "Travel Manager",
      icon: (
        <svg
          className="w-6 h-6 text-gray-600"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
          />
        </svg>
      ),
    },
    {
      path: "/approvals",
      name: "Approvals",
      icon: (
        <svg
          className="w-6 h-6 text-gray-600"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
      ),
    },
    {
      path: "/help",
      name: "Help & Support",
      icon: (
        <svg
          className="w-6 h-6 text-gray-600"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
      ),
    },
  ];

  return (
    <div
      className={`fixed left-0 top-0 h-full bg-white shadow-lg border-r border-gray-200 transition-all duration-300 z-50 ${
        isExpanded ? "w-64" : "w-16"
      }`}
    >
      <div className="flex flex-col h-full">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <div className="flex items-center">
            <img src="/junction-logo2.png" alt="Junction" className="h-8 w-8" />
            {isExpanded && (
              <span className="ml-3 text-xl font-bold text-gray-900">
                Junction
              </span>
            )}
          </div>
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-1 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-100"
          >
            <svg
              className={`h-5 w-5 transition-transform duration-200 ${
                isExpanded ? "rotate-180" : ""
              }`}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 19l-7-7 7-7"
              />
            </svg>
          </button>
        </div>

        {/* Navigation Menu */}
        <nav className="flex-1 px-2 py-4 space-y-2">
          {menuItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center px-3 py-3 rounded-lg text-sm font-medium transition-colors duration-200 ${
                isActive(item.path)
                  ? "bg-blue-50 text-blue-700 border-r-2 border-blue-500"
                  : item.highlight
                  ? "text-gray-700 hover:bg-blue-50 hover:text-blue-700"
                  : "text-gray-700 hover:bg-gray-50 hover:text-gray-900"
              } ${!isExpanded ? "justify-center" : ""}`}
              title={!isExpanded ? item.name : ""}
            >
              <div className="flex-shrink-0">{item.icon}</div>
              {isExpanded && <span className="ml-3 truncate">{item.name}</span>}
            </Link>
          ))}
        </nav>

        {/* Bottom Section */}
        <div className="border-t border-gray-200 p-4">
          <Link
            to="/bookings"
            className={`flex items-center px-3 py-2 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 hover:text-gray-900 ${
              !isExpanded ? "justify-center" : ""
            }`}
            title={!isExpanded ? "All Bookings" : ""}
          >
            <svg
              className="w-5 h-5 text-gray-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
              />
            </svg>
            {isExpanded && <span className="ml-3">All Bookings</span>}
          </Link>

          {/* User Profile */}
          <div
            className={`flex items-center mt-4 px-3 py-2 ${
              !isExpanded ? "justify-center" : ""
            }`}
          >
            <img
              src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80"
              alt="Profile"
              className="h-8 w-8 rounded-full"
            />
            {isExpanded && (
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-900">Jane Doe</p>
                <p className="text-xs text-gray-500">jane@company.com</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Navbar;
