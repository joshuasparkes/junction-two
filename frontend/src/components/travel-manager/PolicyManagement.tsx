import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { PolicyService, Policy, PolicyRule, RuleSpecification } from '../../services/policyService';

interface PolicyManagementProps {
  currentOrganization: any;
}

const PolicyManagement: React.FC<PolicyManagementProps> = ({ currentOrganization }) => {
  const { user } = useAuth();
  const [policies, setPolicies] = useState<Policy[]>([]);
  const [ruleSpecs, setRuleSpecs] = useState<RuleSpecification[]>([]);
  const [selectedPolicy, setSelectedPolicy] = useState<Policy | null>(null);
  const [policyRules, setPolicyRules] = useState<PolicyRule[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showCreatePolicy, setShowCreatePolicy] = useState(false);
  const [showCreateRule, setShowCreateRule] = useState(false);
  const [showRulesModal, setShowRulesModal] = useState(false);

  // Form states
  const [policyForm, setPolicyForm] = useState({
    label: '',
    type: 'TRAVEL' as 'TRAVEL' | 'ORG',
    action: 'OUT_OF_POLICY' as 'HIDE' | 'BLOCK' | 'APPROVE' | 'OUT_OF_POLICY',
    enforce_approval: false,
    exclude_restricted_fares: false,
    refundable_fares_enabled: false
  });

  const [ruleForm, setRuleForm] = useState({
    code: '',
    action: 'APPROVE' as 'HIDE' | 'BLOCK' | 'APPROVE' | 'OUT_OF_POLICY',
    vars: {} as any
  });

  // Load policies and rule specifications
  useEffect(() => {
    if (currentOrganization) {
      loadPolicies();
      loadRuleSpecifications();
    }
  }, [currentOrganization]);

  // Load rules when policy is selected and modal is opened
  useEffect(() => {
    if (selectedPolicy && showRulesModal) {
      loadPolicyRules(selectedPolicy.id);
    }
  }, [selectedPolicy, showRulesModal]);

  const loadPolicies = async () => {
    if (!currentOrganization) return;
    
    setLoading(true);
    setError(null);
    try {
      const policiesData = await PolicyService.getPolicies(currentOrganization.id);
      setPolicies(policiesData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load policies');
      console.error('Error loading policies:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadRuleSpecifications = async () => {
    try {
      const specs = await PolicyService.getRuleSpecifications('TRAIN');
      setRuleSpecs(specs);
    } catch (err) {
      console.error('Error loading rule specifications:', err);
    }
  };

  const loadPolicyRules = async (policyId: string) => {
    try {
      const rules = await PolicyService.getRulesByPolicy(policyId);
      setPolicyRules(rules);
    } catch (err) {
      console.error('Error loading policy rules:', err);
    }
  };

  const handleCreatePolicy = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentOrganization) return;

    try {
      setError(null);
      const newPolicy = await PolicyService.createPolicy({
        ...policyForm,
        org_id: currentOrganization.id,
        active: true,
        exclude_restricted_fares: policyForm.exclude_restricted_fares,
        refundable_fares_enabled: policyForm.refundable_fares_enabled
      });

      setPolicies([...policies, newPolicy]);
      setPolicyForm({
        label: '',
        type: 'TRAVEL',
        action: 'OUT_OF_POLICY',
        enforce_approval: false,
        exclude_restricted_fares: false,
        refundable_fares_enabled: false
      });
      setShowCreatePolicy(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create policy');
    }
  };

  const handleCreateRule = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPolicy) return;

    try {
      setError(null);
      const newRule = await PolicyService.createRule({
        ...ruleForm,
        policy_id: selectedPolicy.id,
        active: true
      });

      setPolicyRules([...policyRules, newRule]);
      setRuleForm({
        code: '',
        action: 'OUT_OF_POLICY',
        vars: {}
      });
      setShowCreateRule(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create rule');
    }
  };

  const handleDeletePolicy = async (policyId: string) => {
    if (!window.confirm('Are you sure you want to delete this policy?')) return;

    try {
      await PolicyService.deletePolicy(policyId);
      setPolicies(policies.filter(p => p.id !== policyId));
      if (selectedPolicy?.id === policyId) {
        setSelectedPolicy(null);
        setPolicyRules([]);
        setShowRulesModal(false);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete policy');
    }
  };

  const handleDeleteRule = async (ruleId: string) => {
    if (!window.confirm('Are you sure you want to delete this rule?')) return;

    try {
      await PolicyService.deleteRule(ruleId);
      setPolicyRules(policyRules.filter(r => r.id !== ruleId));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete rule');
    }
  };

  const openRulesModal = (policy: Policy) => {
    setSelectedPolicy(policy);
    setShowRulesModal(true);
  };

  const closeRulesModal = () => {
    setShowRulesModal(false);
    setSelectedPolicy(null);
    setPolicyRules([]);
    setShowCreateRule(false);
  };

  const selectedRuleSpec = ruleSpecs.find(spec => spec.code === ruleForm.code);

  return (
    <div>
      <div className="mb-8">
        <h2 className="title-text font-normal text-chatgpt-text-primary mb-1">
          Policy Management
        </h2>
        <p className="content-text text-chatgpt-text-secondary">
          Manage your organization's travel policies and rules.
        </p>
        {error && (
          <div className="mt-4 bg-red-50 border border-red-200 rounded-md p-3">
            <p className="sidebar-text text-red-700">{error}</p>
          </div>
        )}
      </div>

      {/* Policies List */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="content-text font-normal text-chatgpt-text-primary">Travel Policies</h3>
          <button
            onClick={() => setShowCreatePolicy(true)}
            className="chatgpt-primary-button text-sm"
          >
            Create Policy
          </button>
        </div>

        <div className="bg-white border border-gray-200 rounded-lg p-3">
          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Loading policies...</p>
            </div>
          ) : policies.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-600">No policies found. Create your first policy to get started.</p>
            </div>
          ) : (
            <div className="space-y-0">
              {policies.map((policy) => (
                <div 
                  key={policy.id} 
                  className="p-3 rounded-md hover:bg-gray-50 transition-colors duration-200"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h4 className="content-text font-normal text-chatgpt-text-primary mb-1">
                        {policy.label}
                      </h4>
                      <p className="sidebar-text text-chatgpt-text-secondary mb-2">
                        {policy.type} • {policy.action.replace('_', ' ')}
                      </p>
                      <div className="flex items-center space-x-2">
                        <span className={`inline-flex items-center px-2 py-1 rounded-full sidebar-text font-normal ${
                          policy.active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'
                        }`}>
                          {policy.active ? 'Active' : 'Inactive'}
                        </span>
                        {policy.enforce_approval && (
                          <span className="inline-flex items-center px-2 py-1 rounded-full sidebar-text font-normal bg-orange-100 text-orange-700">
                            Requires Approval
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center space-x-2 ml-4">
                      <button 
                        onClick={() => openRulesModal(policy)}
                        className="sidebar-text text-blue-600 hover:text-blue-700 transition-colors duration-200"
                      >
                        Manage Rules
                      </button>
                      <button 
                        onClick={() => handleDeletePolicy(policy.id)}
                        className="sidebar-text text-red-600 hover:text-red-700 transition-colors duration-200"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Policy Rules Modal */}
      {showRulesModal && selectedPolicy && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[80vh] overflow-hidden">
            <div className="flex justify-between items-center p-6 border-b border-gray-200">
              <h2 className="content-text font-normal text-chatgpt-text-primary">
                Policy Rules - {selectedPolicy.label}
              </h2>
              <button
                onClick={closeRulesModal}
                className="text-gray-400 hover:text-gray-600"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="p-6 overflow-y-auto" style={{ maxHeight: 'calc(80vh - 140px)' }}>
              {/* Policy Info */}
              <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                <h3 className="content-text font-normal text-chatgpt-text-primary mb-2">{selectedPolicy.label}</h3>
                <div className="flex items-center space-x-4">
                  <span className="sidebar-text text-chatgpt-text-secondary">
                    {selectedPolicy.type} • {selectedPolicy.action.replace('_', ' ')}
                  </span>
                  <span className={`inline-flex items-center px-2 py-1 rounded-full sidebar-text font-normal ${
                    selectedPolicy.active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'
                  }`}>
                    {selectedPolicy.active ? 'Active' : 'Inactive'}
                  </span>
                  {selectedPolicy.enforce_approval && (
                    <span className="inline-flex items-center px-2 py-1 rounded-full sidebar-text font-normal bg-orange-100 text-orange-700">
                      Requires Approval
                    </span>
                  )}
                </div>
              </div>

              {/* Add Rule Button */}
              <div className="mb-6">
                <button
                  onClick={() => setShowCreateRule(true)}
                  className="chatgpt-primary-button inline-flex items-center justify-center"
                >
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  Add Rule
                </button>
              </div>

              {/* Rules List */}
              <div>
                {policyRules.length === 0 ? (
                  <div className="text-center py-12">
                    <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                    </svg>
                    <h3 className="mt-2 text-sm font-medium text-gray-900">No rules found</h3>
                    <p className="mt-1 text-sm text-gray-500">Add rules to define how this policy behaves.</p>
                  </div>
                ) : (
                  <div className="bg-white border border-gray-200 rounded-lg">
                    <div className="space-y-0">
                      {policyRules.map((rule) => {
                        const spec = ruleSpecs.find(s => s.code === rule.code);
                        return (
                          <div key={rule.id} className="p-4 border-b border-gray-100 last:border-b-0 hover:bg-gray-50 transition-colors duration-200">
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <h4 className="content-text font-normal text-chatgpt-text-primary mb-1">
                                  {spec?.name || rule.code}
                                </h4>
                                <p className="sidebar-text text-chatgpt-text-secondary mb-3">
                                  {spec?.description}
                                </p>
                                <div className="flex items-center space-x-3">
                                  <span className={`inline-flex items-center px-3 py-1 rounded-full sidebar-text font-normal ${
                                    rule.action === 'BLOCK' ? 'bg-red-100 text-red-700' :
                                    rule.action === 'APPROVE' ? 'bg-orange-100 text-orange-700' :
                                    rule.action === 'HIDE' ? 'bg-gray-100 text-gray-700' :
                                    'bg-blue-100 text-blue-700'
                                  }`}>
                                    {rule.action.replace('_', ' ')}
                                  </span>
                                  {rule.vars && Object.keys(rule.vars).length > 0 && (
                                    <div className="flex flex-wrap gap-2">
                                      {Object.entries(rule.vars).map(([key, value]) => (
                                        <span key={key} className="sidebar-text text-gray-600 bg-gray-100 px-2 py-1 rounded">
                                          {key.replace('_', ' ')}: {String(value)}
                                        </span>
                                      ))}
                                    </div>
                                  )}
                                </div>
                              </div>
                              <div className="ml-4">
                                <button
                                  onClick={() => handleDeleteRule(rule.id)}
                                  className="sidebar-text text-red-600 hover:text-red-700 transition-colors duration-200"
                                >
                                  Delete
                                </button>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Create Policy Modal */}
      {showCreatePolicy && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Create New Policy</h3>
              <form onSubmit={handleCreatePolicy} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Policy Name</label>
                  <input
                    type="text"
                    value={policyForm.label}
                    onChange={(e) => setPolicyForm({...policyForm, label: e.target.value})}
                    className="chatgpt-input w-full"
                    placeholder="e.g., Executive Travel Policy"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Policy Type</label>
                  <select
                    value={policyForm.type}
                    onChange={(e) => setPolicyForm({...policyForm, type: e.target.value as 'TRAVEL' | 'ORG'})}
                    className="chatgpt-input w-full"
                  >
                    <option value="TRAVEL">Travel Policy</option>
                    <option value="ORG">Organization Policy</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Default Action</label>
                  <select
                    value={policyForm.action}
                    onChange={(e) => setPolicyForm({...policyForm, action: e.target.value as any})}
                    className="chatgpt-input w-full"
                  >
                    <option value="OUT_OF_POLICY">Out of Policy</option>
                    <option value="APPROVE">Require Approval</option>
                    <option value="BLOCK">Block Booking</option>
                    <option value="HIDE">Hide Option</option>
                  </select>
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    checked={policyForm.enforce_approval}
                    onChange={(e) => setPolicyForm({...policyForm, enforce_approval: e.target.checked})}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label className="ml-2 block text-sm text-gray-900">Always require approval</label>
                </div>

                <div className="flex justify-end space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowCreatePolicy(false)}
                    className="chatgpt-button"
                  >
                    Cancel
                  </button>
                  <button type="submit" className="chatgpt-primary-button">
                    Create Policy
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Create Rule Modal */}
      {showCreateRule && selectedPolicy && showRulesModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-[60]">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Add Rule to {selectedPolicy.label}</h3>
              <form onSubmit={handleCreateRule} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Rule Type</label>
                  <select
                    value={ruleForm.code}
                    onChange={(e) => setRuleForm({...ruleForm, code: e.target.value})}
                    className="chatgpt-input w-full"
                    required
                  >
                    <option value="">Select a rule type</option>
                    {ruleSpecs.map((spec) => (
                      <option key={spec.code} value={spec.code}>
                        {spec.name}
                      </option>
                    ))}
                  </select>
                </div>

                {selectedRuleSpec && (
                  <div>
                    <p className="text-sm text-gray-600 mb-3">{selectedRuleSpec.description}</p>
                    
                    {/* Dynamic form fields based on rule specification */}
                    {Object.entries(selectedRuleSpec.parameters).map(([paramKey, paramSpec]) => (
                      <div key={paramKey}>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          {paramKey.replace('_', ' ')} {paramSpec.required && '*'}
                        </label>
                        {paramSpec.type === 'number' ? (
                          <input
                            type="number"
                            onChange={(e) => setRuleForm({
                              ...ruleForm, 
                              vars: {...ruleForm.vars, [paramKey]: parseFloat(e.target.value)}
                            })}
                            className="chatgpt-input w-full"
                            placeholder={paramSpec.description}
                            required={paramSpec.required}
                          />
                        ) : paramSpec.type === 'boolean' ? (
                          <input
                            type="checkbox"
                            onChange={(e) => setRuleForm({
                              ...ruleForm, 
                              vars: {...ruleForm.vars, [paramKey]: e.target.checked}
                            })}
                            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                          />
                        ) : (
                          <input
                            type="text"
                            onChange={(e) => setRuleForm({
                              ...ruleForm, 
                              vars: {...ruleForm.vars, [paramKey]: e.target.value}
                            })}
                            className="chatgpt-input w-full"
                            placeholder={paramSpec.description}
                            required={paramSpec.required}
                          />
                        )}
                      </div>
                    ))}
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Action when rule fails</label>
                  <select
                    value={ruleForm.action}
                    onChange={(e) => setRuleForm({...ruleForm, action: e.target.value as any})}
                    className="chatgpt-input w-full"
                  >
                    <option value="OUT_OF_POLICY">Out of Policy</option>
                    <option value="APPROVE">Require Approval</option>
                    <option value="BLOCK">Block Booking</option>
                    <option value="HIDE">Hide Option</option>
                  </select>
                </div>

                <div className="flex justify-end space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowCreateRule(false)}
                    className="chatgpt-button"
                  >
                    Cancel
                  </button>
                  <button type="submit" className="chatgpt-primary-button">
                    Add Rule
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PolicyManagement;