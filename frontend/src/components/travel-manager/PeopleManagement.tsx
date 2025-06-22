import React, { useState, useMemo } from "react";
import { OrganizationMember } from "../../services/peopleService";

interface PeopleManagementProps {
  members: OrganizationMember[];
  invitations: any[];
  loading: boolean;
  error: string | null;
  currentOrganization: any;
  onCreateUser: () => void;
  onInviteUser: () => void;
  onRemoveUser: (userId: string) => void;
}

const PeopleManagement: React.FC<PeopleManagementProps> = ({
  members,
  invitations,
  loading,
  error,
  currentOrganization,
  onCreateUser,
  onInviteUser,
  onRemoveUser,
}) => {
  const [searchQuery, setSearchQuery] = useState("");

  // Filter members based on search query
  const filteredMembers = useMemo(() => {
    if (!searchQuery.trim()) {
      return members;
    }

    const query = searchQuery.toLowerCase();
    return members.filter((member) => {
      const firstName = member.user_profiles.first_name?.toLowerCase() || "";
      const lastName = member.user_profiles.last_name?.toLowerCase() || "";
      const email = member.user_profiles.email?.toLowerCase() || "";

      return (
        firstName.includes(query) ||
        lastName.includes(query) ||
        email.includes(query)
      );
    });
  }, [members, searchQuery]);
  return (
    <div>
      <div className="mb-8 flex justify-between items-start">
        <div>
          <h2 className="title-text font-normal text-chatgpt-text-primary mb-1">
            People Management
          </h2>
          <p className="content-text text-chatgpt-text-secondary">
            Manage users and invitations for your organization.
          </p>
          {currentOrganization && (
            <p className="sidebar-text text-gray-500 mt-1">
              {currentOrganization.name} • {members.length} member
              {members.length !== 1 ? "s" : ""}
              {invitations.length > 0 &&
                ` • ${invitations.length} pending invitation${
                  invitations.length !== 1 ? "s" : ""
                }`}
            </p>
          )}
        </div>
        <div className="flex space-x-3">
          <button
            onClick={onInviteUser}
            className="chatgpt-button flex items-center"
          >
            <svg
              className="w-4 h-4 mr-2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 6v6m0 0v6m0-6h6m-6 0H6"
              />
            </svg>
            Invite User
          </button>
          <button
            onClick={onCreateUser}
            className="chatgpt-primary-button flex items-center"
          >
            <svg
              className="w-4 h-4 mr-2"
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
            Create User
          </button>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
          <div className="flex">
            <svg
              className="w-5 h-5 mr-2 mt-0.5"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                clipRule="evenodd"
              />
            </svg>
            {error}
          </div>
        </div>
      )}

      {/* Loading State */}
      {loading ? (
        <div className="bg-white rounded-lg shadow-sm p-8 text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading organization members...</p>
        </div>
      ) : !currentOrganization ? (
        <div className="bg-white rounded-lg shadow-sm p-8 text-center">
          <div className="mx-auto h-12 w-12 bg-yellow-100 rounded-full flex items-center justify-center mb-4">
            <svg
              className="h-6 w-6 text-yellow-600"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
              />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Select an organization
          </h3>
          <p className="text-gray-600">
            Please select an organization from the sidebar to manage its
            members.
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Members List */}
          <div>
            <div className="flex justify-between items-center mb-4">
              <h3 className="content-text font-normal text-chatgpt-text-primary">
                Organization Members
              </h3>
              <div className="flex items-center space-x-3">
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Search by name or email..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="chatgpt-input pl-9 w-64"
                  />
                </div>
                {searchQuery && (
                  <span className="sidebar-text text-gray-500">
                    {filteredMembers.length} of {members.length} members
                  </span>
                )}
              </div>
            </div>

            {filteredMembers.length === 0 ? (
              <div className="bg-white border border-gray-200 rounded-lg p-8 text-center">
                <div className="mx-auto h-12 w-12 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                  <svg
                    className="h-6 w-6 text-gray-400"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                    />
                  </svg>
                </div>
                <h3 className="content-text font-normal text-gray-900 mb-2">
                  {searchQuery ? "No matching members found" : "No members yet"}
                </h3>
                <p className="sidebar-text text-gray-600 mb-4">
                  {searchQuery
                    ? `No members match "${searchQuery}". Try a different search term.`
                    : "Get started by creating or inviting users to your organization."}
                </p>
              </div>
            ) : (
              <div className="bg-white border border-gray-200 rounded-lg p-3">
                <div className="space-y-0">
                  {filteredMembers.map((member) => (
                    <div
                      key={member.id}
                      className="p-3 rounded-md hover:bg-gray-50 transition-colors duration-200"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h4 className="content-text font-normal text-chatgpt-text-primary mb-1">
                            {member.user_profiles.first_name && member.user_profiles.last_name
                              ? `${member.user_profiles.first_name} ${member.user_profiles.last_name}`
                              : member.user_profiles.email
                            }
                          </h4>
                          <p className="sidebar-text text-chatgpt-text-secondary mb-2">
                            {member.user_profiles.email}
                          </p>
                          <div className="flex items-center space-x-3">
                            <span className="inline-flex items-center px-2 py-1 rounded-full sidebar-text font-normal bg-green-100 text-green-700">
                              Active
                            </span>
                            <span
                              className={`inline-flex items-center px-2 py-1 rounded-full sidebar-text font-normal capitalize ${
                                member.role === "admin" ||
                                member.role === "owner"
                                  ? "bg-purple-100 text-purple-700"
                                  : member.role === "manager"
                                  ? "bg-blue-100 text-blue-700"
                                  : "bg-gray-100 text-gray-700"
                              }`}
                            >
                              {member.role}
                            </span>
                            {member.is_primary && (
                              <span className="inline-flex items-center px-2 py-1 rounded-full sidebar-text font-normal bg-blue-100 text-blue-700">
                                Primary
                              </span>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center space-x-2 ml-4">
                          <button
                            onClick={() => onRemoveUser(member.user_id)}
                            className="sidebar-text text-red-600 hover:text-red-700 transition-colors duration-200"
                          >
                            Remove
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Pending Invitations */}
          {invitations.length > 0 && (
            <div>
              <h3 className="content-text font-normal text-chatgpt-text-primary mb-4">
                Pending Invitations
              </h3>
              <div className="bg-white border border-gray-200 rounded-lg p-3">
                <div className="space-y-0">
                  {invitations.map((invitation) => (
                    <div
                      key={invitation.id}
                      className="p-3 rounded-md hover:bg-gray-50 transition-colors duration-200"
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="content-text font-normal text-chatgpt-text-primary">
                            {invitation.email}
                          </p>
                          <p className="sidebar-text text-chatgpt-text-secondary">
                            Invited{" "}
                            {new Date(
                              invitation.created_at
                            ).toLocaleDateString()}{" "}
                            • Role: {invitation.role}
                          </p>
                        </div>
                        <div className="flex items-center space-x-2">
                          <span className="inline-flex items-center px-2 py-1 rounded-full sidebar-text font-normal bg-yellow-100 text-yellow-700">
                            Pending
                          </span>
                          <button className="text-gray-400 hover:text-gray-600 transition-colors duration-200">
                            <svg
                              className="w-4 h-4"
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
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default PeopleManagement;
