import React from 'react';

interface OrganizationPolicy {
  id: string;
  name: string;
  preTripApproval: string;
  outOfPolicyMessage: string;
}

interface PolicyGroup {
  id: string;
  name: string;
  description: string;
  priority: number;
}

interface OutOfPolicyReason {
  id: string;
  reason: string;
  description: string;
  requiresApproval: boolean;
}

interface TravelPoliciesProps {
  organizationPolicies: OrganizationPolicy[];
  policyGroups: PolicyGroup[];
  outOfPolicyReasons: OutOfPolicyReason[];
}

const TravelPolicies: React.FC<TravelPoliciesProps> = ({
  organizationPolicies,
  policyGroups,
  outOfPolicyReasons
}) => {
  return (
    <div>
      <div className="mb-8">
        <h2 className="title-text font-normal text-chatgpt-text-primary mb-1">
          Travel Policies
        </h2>
        <p className="content-text text-chatgpt-text-secondary">
          Manage your organization's travel policies and rules.
        </p>
      </div>

      <div className="space-y-6">
        {/* Organization Policies */}
        <div>
          <h3 className="content-text font-normal text-chatgpt-text-primary mb-4">Organization Policies</h3>
          <div className="bg-white border border-gray-200 rounded-lg p-3">
            <div className="space-y-0">
              {organizationPolicies.map((policy) => (
                <div key={policy.id} className="p-3 rounded-md hover:bg-gray-50 transition-colors duration-200">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h4 className="content-text font-normal text-chatgpt-text-primary mb-1">{policy.name}</h4>
                      <p className="sidebar-text text-chatgpt-text-secondary mb-2">{policy.outOfPolicyMessage}</p>
                      <span className="inline-flex items-center px-2 py-1 rounded-full sidebar-text font-normal bg-blue-100 text-blue-700 capitalize">
                        {policy.preTripApproval.replace('_', ' ')}
                      </span>
                    </div>
                    <div className="flex items-center space-x-2 ml-4">
                      <button className="sidebar-text text-blue-600 hover:text-blue-700 transition-colors duration-200">Edit</button>
                      <button className="sidebar-text text-red-600 hover:text-red-700 transition-colors duration-200">Delete</button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Policy Groups */}
        <div>
          <h3 className="content-text font-normal text-chatgpt-text-primary mb-4">Policy Groups</h3>
          <div className="bg-white border border-gray-200 rounded-lg p-3">
            <div className="space-y-0">
              {policyGroups.map((group) => (
                <div key={group.id} className="p-3 rounded-md hover:bg-gray-50 transition-colors duration-200">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h4 className="content-text font-normal text-chatgpt-text-primary mb-1">{group.name}</h4>
                      <p className="sidebar-text text-chatgpt-text-secondary mb-2">{group.description}</p>
                      <span className="sidebar-text text-gray-500">Priority: {group.priority}</span>
                    </div>
                    <div className="flex items-center space-x-2 ml-4">
                      <button className="sidebar-text text-blue-600 hover:text-blue-700 transition-colors duration-200">Edit</button>
                      <button className="sidebar-text text-red-600 hover:text-red-700 transition-colors duration-200">Delete</button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Out of Policy Reasons */}
        <div>
          <h3 className="content-text font-normal text-chatgpt-text-primary mb-4">Out of Policy Reasons</h3>
          <div className="bg-white border border-gray-200 rounded-lg p-3">
            <div className="space-y-0">
              {outOfPolicyReasons.map((reason) => (
                <div key={reason.id} className="p-3 rounded-md hover:bg-gray-50 transition-colors duration-200">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h4 className="content-text font-normal text-chatgpt-text-primary mb-1">{reason.reason}</h4>
                      <p className="sidebar-text text-chatgpt-text-secondary mb-2">{reason.description}</p>
                      <span className={`inline-flex items-center px-2 py-1 rounded-full sidebar-text font-normal ${
                        reason.requiresApproval ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'
                      }`}>
                        {reason.requiresApproval ? 'Requires Approval' : 'No Approval Required'}
                      </span>
                    </div>
                    <div className="flex items-center space-x-2 ml-4">
                      <button className="sidebar-text text-blue-600 hover:text-blue-700 transition-colors duration-200">Edit</button>
                      <button className="sidebar-text text-red-600 hover:text-red-700 transition-colors duration-200">Delete</button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TravelPolicies;