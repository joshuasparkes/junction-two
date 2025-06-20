import React, { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useLayout } from "../../contexts/LayoutContext";
import { useAuth } from "../../contexts/AuthContext";

const Navbar: React.FC = () => {
  const { isMobile, isNavbarExpanded, setIsNavbarExpanded } = useLayout();
  const { user, signOut, currentOrganization, setCurrentOrganization, loading } = useAuth();
  const [isOpen, setIsOpen] = useState(false); // For mobile menu overlay
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showOrgMenu, setShowOrgMenu] = useState(false);
  const [userOrganizations, setUserOrganizations] = useState<any[]>([]);
  const location = useLocation();
  const navigate = useNavigate();

  const isActive = (path: string) => location.pathname === path;

  // Close mobile menu when route changes
  useEffect(() => {
    if (isMobile) {
      setIsOpen(false);
    }
  }, [location, isMobile]);

  // Keep organizations state stable - only update when user.organizations actually changes
  useEffect(() => {
    if (user?.organizations && user.organizations.length > 0) {
      setUserOrganizations(user.organizations);
    }
    // Don't clear userOrganizations when user.organizations becomes empty during refreshUser
  }, [user?.organizations]);

  const toggleSidebar = () => {
    if (isMobile) {
      setIsOpen(!isOpen);
    } else {
      setIsNavbarExpanded(!isNavbarExpanded);
    }
  };

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
    <>
      {/* Mobile menu button */}
      {isMobile && (
        <button
          onClick={toggleSidebar}
          className="fixed top-4 left-4 z-[60] p-2 rounded-md bg-white shadow-lg border border-gray-200 text-gray-600 hover:text-gray-900 hover:bg-gray-50 lg:hidden"
        >
          <svg
            className="h-6 w-6"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 6h16M4 12h16M4 18h16"
            />
          </svg>
        </button>
      )}

      {/* Mobile overlay */}
      {isMobile && isOpen && (
        <div
          className="fixed inset-0 bg-gray-600 bg-opacity-50 z-40 lg:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div
        className={`fixed left-0 top-0 h-full bg-white shadow-lg border-r border-gray-200 transition-all duration-300 z-50 ${
          isMobile
            ? `${isOpen ? "translate-x-0" : "-translate-x-full"} w-64`
            : `${isNavbarExpanded ? "w-64" : "w-16"}`
        }`}
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-200">
            <div className="flex items-center">
              {(isNavbarExpanded || isMobile) && (
                <div className="flex items-center">
                  <img
                    src="/junction-logo2.png"
                    alt="Junction"
                    className="h-8 w-8"
                  />
                  <span className="ml-3 text-xl font-bold text-gray-900">
                    Junction
                  </span>
                </div>
              )}
            </div>
            {!isMobile && (
              <button
                onClick={toggleSidebar}
                className="p-1 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-100"
              >
                <svg
                  className={`h-5 w-5 transition-transform duration-200 ${
                    isNavbarExpanded ? "rotate-180" : ""
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
            )}
          </div>

          {/* Organization Switcher */}
          {user && userOrganizations.length > 0 && (
            <div className="px-4 py-3 border-b border-gray-200">
              {(isNavbarExpanded || isMobile) && (
                <p className="text-xs font-medium text-gray-500 mb-2">Organization</p>
              )}
              <div className="relative">
                <button
                  onClick={() => setShowOrgMenu(!showOrgMenu)}
                  className={`w-full flex items-center ${
                    !isNavbarExpanded && !isMobile ? 'justify-center' : 'justify-between'
                  } px-3 py-2 text-sm bg-gray-50 hover:bg-gray-100 rounded-lg border border-gray-200`}
                >
                  <div className="flex items-center">
                    <div className="w-6 h-6 bg-blue-600 rounded flex items-center justify-center flex-shrink-0">
                      <span className="text-white text-xs font-bold">
                        {currentOrganization?.name?.charAt(0) || 'O'}
                      </span>
                    </div>
                    {(isNavbarExpanded || isMobile) && (
                      <span className="ml-2 truncate font-medium text-gray-900">
                        {currentOrganization?.name || 'Select Organization'}
                      </span>
                    )}
                  </div>
                  {(isNavbarExpanded || isMobile) && (
                    <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  )}
                </button>

                {/* Organization Dropdown */}
                {showOrgMenu && (isNavbarExpanded || isMobile) && (
                  <div className="absolute top-full left-0 right-0 mt-1 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50">
                    {userOrganizations.map((org) => (
                      <button
                        key={org.id}
                        onClick={() => {
                          setCurrentOrganization(org);
                          setShowOrgMenu(false);
                        }}
                        className={`w-full text-left px-3 py-2 text-sm hover:bg-gray-50 flex items-center justify-between ${
                          currentOrganization?.id === org.id ? 'bg-blue-50 text-blue-700' : 'text-gray-700'
                        }`}
                      >
                        <div className="flex items-center">
                          <div className="w-5 h-5 bg-blue-600 rounded flex items-center justify-center flex-shrink-0">
                            <span className="text-white text-xs font-bold">
                              {org.name.charAt(0)}
                            </span>
                          </div>
                          <div className="ml-2">
                            <div className="font-medium">{org.name}</div>
                            <div className="text-xs text-gray-500 capitalize">{org.role}</div>
                          </div>
                        </div>
                        {currentOrganization?.id === org.id && (
                          <svg className="w-4 h-4 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        )}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

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
                } ${!isNavbarExpanded && !isMobile ? "justify-center" : ""}`}
                title={!isNavbarExpanded && !isMobile ? item.name : ""}
              >
                <div className="flex-shrink-0">{item.icon}</div>
                {(isNavbarExpanded || isMobile) && (
                  <span className="ml-3 truncate">{item.name}</span>
                )}
              </Link>
            ))}
          </nav>

          {/* Bottom Section */}
          <div className="border-t border-gray-200 p-4">
            {/* User Profile */}
            {user ? (
              <div className="relative">
                <div
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className={`flex items-center px-3 py-2 cursor-pointer hover:bg-gray-50 rounded-lg ${
                    !isNavbarExpanded && !isMobile ? "justify-center" : ""
                  }`}
                >
                  <div className="h-8 w-8 rounded-full bg-blue-600 flex items-center justify-center">
                    <span className="text-white text-sm font-medium">
                      {user.profile?.first_name?.charAt(0) || user.email.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  {(isNavbarExpanded || isMobile) && (
                    <div className="ml-3 flex-1">
                      <p className="text-sm font-medium text-gray-900">
                        {user.profile?.first_name && user.profile?.last_name 
                          ? `${user.profile.first_name} ${user.profile.last_name}`
                          : user.email
                        }
                      </p>
                      <p className="text-xs text-gray-500 truncate">{user.email}</p>
                      {userOrganizations.length > 0 && (
                        <p className="text-xs text-blue-600">
                          {userOrganizations.find(org => org.is_primary)?.name || userOrganizations[0].name}
                        </p>
                      )}
                    </div>
                  )}
                  {(isNavbarExpanded || isMobile) && (
                    <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  )}
                </div>

                {/* User Menu Dropdown */}
                {showUserMenu && (isNavbarExpanded || isMobile) && (
                  <div className="absolute bottom-full left-0 right-0 mb-2 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50">
                    <div className="px-4 py-2 border-b border-gray-200">
                      <p className="text-sm font-medium text-gray-900">
                        {user.profile?.first_name && user.profile?.last_name 
                          ? `${user.profile.first_name} ${user.profile.last_name}`
                          : user.email
                        }
                      </p>
                      <p className="text-xs text-gray-500">{user.email}</p>
                    </div>
                    
                    {userOrganizations.length > 0 && (
                      <div className="px-4 py-2 border-b border-gray-200">
                        <p className="text-xs font-medium text-gray-700 mb-1">Organizations:</p>
                        {userOrganizations.map((org) => (
                          <div key={org.id} className="text-xs text-gray-600 flex justify-between">
                            <span>{org.name}</span>
                            <span className="text-blue-600 capitalize">{org.role}</span>
                          </div>
                        ))}
                      </div>
                    )}
                    
                    <Link
                      to="/profile"
                      onClick={() => setShowUserMenu(false)}
                      className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                    >
                      Profile Settings
                    </Link>
                    
                    <button
                      onClick={async () => {
                        try {
                          setShowUserMenu(false);
                          await signOut();
                          navigate('/');
                        } catch (error) {
                          console.error('Error during sign out:', error);
                          // Still navigate to home even if sign out fails
                          navigate('/');
                        }
                      }}
                      className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                    >
                      Sign out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className={`flex items-center ${!isNavbarExpanded && !isMobile ? "justify-center" : ""}`}>
                <Link
                  to="/login"
                  className="flex items-center px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 rounded-lg"
                >
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                  </svg>
                  {(isNavbarExpanded || isMobile) && "Sign in"}
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default Navbar;
