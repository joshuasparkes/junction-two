import React, { useState } from 'react';
import { OrganizationService } from '../../services/organizationService';

interface CompanyData {
  name: string;
  billingAddress: string;
  phoneNumber: string;
}

interface CompanyProfileProps {
  companyData: CompanyData;
  onUpdate: (field: string, value: string) => void;
  organizationId: string;
}

const CompanyProfile: React.FC<CompanyProfileProps> = ({ companyData, onUpdate, organizationId }) => {
  const [editMode, setEditMode] = useState<string | null>(null);
  const [editValue, setEditValue] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleEdit = (field: string, currentValue: string) => {
    setEditMode(field);
    setEditValue(currentValue);
    setError(null);
  };

  const handleSave = async (field: string) => {
    if (!organizationId) {
      setError('Organization ID is required');
      return;
    }

    setSaving(true);
    setError(null);
    
    try {
      // Map frontend field names to database column names
      const dbFieldMap: { [key: string]: string } = {
        'name': 'name',
        'billingAddress': 'address',
        'phoneNumber': 'phone'
      };

      const dbField = dbFieldMap[field];
      if (!dbField) {
        throw new Error(`Unknown field: ${field}`);
      }

      await OrganizationService.updateOrganization(organizationId, {
        [dbField]: editValue
      });

      // Update local state
      onUpdate(field, editValue);
      setEditMode(null);
      setEditValue("");
    } catch (err) {
      console.error('Error updating organization:', err);
      setError(err instanceof Error ? err.message : 'Failed to save changes');
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setEditMode(null);
    setEditValue("");
    setError(null);
  };

  return (
    <div>
      <div className="mb-8">
        <h2 className="title-text font-normal text-chatgpt-text-primary mb-1">
          Company Profile
        </h2>
        <p className="content-text text-chatgpt-text-secondary">
          Manage your company information and settings to keep your travel platform up to date.
        </p>
        {error && (
          <div className="mt-4 bg-red-50 border border-red-200 rounded-md p-3">
            <p className="sidebar-text text-red-700">{error}</p>
          </div>
        )}
      </div>

      <div className="bg-white border border-gray-200 rounded-lg p-3">
        <div className="space-y-0">
          {/* Company Name */}
          <div className="p-3 rounded-md hover:bg-gray-50 transition-colors duration-200">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h4 className="content-text font-normal text-chatgpt-text-primary mb-1">Company Name</h4>
                <p className="sidebar-text text-chatgpt-text-secondary mb-2">Your organization's display name</p>
                {editMode === 'name' ? (
                  <div className="flex items-center space-x-3">
                    <input
                      type="text"
                      value={editValue}
                      onChange={(e) => setEditValue(e.target.value)}
                      className="chatgpt-input flex-1"
                      placeholder="Enter company name"
                    />
                    <button
                      onClick={() => handleSave('name')}
                      disabled={saving}
                      className="chatgpt-primary-button disabled:opacity-50"
                    >
                      {saving ? 'Saving...' : 'Save'}
                    </button>
                    <button
                      onClick={handleCancel}
                      className="chatgpt-button"
                    >
                      Cancel
                    </button>
                  </div>
                ) : (
                  <p className="content-text font-normal text-chatgpt-text-primary">
                    {companyData.name}
                  </p>
                )}
              </div>
              {editMode !== 'name' && (
                <div className="flex items-center space-x-2 ml-4">
                  <button 
                    onClick={() => handleEdit('name', companyData.name)}
                    className="sidebar-text text-blue-600 hover:text-blue-700 transition-colors duration-200"
                  >
                    Edit
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Billing Address */}
          <div className="p-3 rounded-md hover:bg-gray-50 transition-colors duration-200">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h4 className="content-text font-normal text-chatgpt-text-primary mb-1">Billing Address</h4>
                <p className="sidebar-text text-chatgpt-text-secondary mb-2">Your company's billing and correspondence address</p>
                {editMode === 'billingAddress' ? (
                  <div className="space-y-3">
                    <textarea
                      value={editValue}
                      onChange={(e) => setEditValue(e.target.value)}
                      rows={4}
                      className="chatgpt-input w-full resize-none"
                      placeholder="Enter billing address"
                    />
                    <div className="flex space-x-3">
                      <button
                        onClick={() => handleSave('billingAddress')}
                        disabled={saving}
                        className="chatgpt-primary-button disabled:opacity-50"
                      >
                        {saving ? 'Saving...' : 'Save'}
                      </button>
                      <button
                        onClick={handleCancel}
                        className="chatgpt-button"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <p className="content-text text-chatgpt-text-primary whitespace-pre-line">
                    {companyData.billingAddress}
                  </p>
                )}
              </div>
              {editMode !== 'billingAddress' && (
                <div className="flex items-center space-x-2 ml-4">
                  <button 
                    onClick={() => handleEdit('billingAddress', companyData.billingAddress)}
                    className="sidebar-text text-blue-600 hover:text-blue-700 transition-colors duration-200"
                  >
                    Edit
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Phone Number */}
          <div className="p-3 rounded-md hover:bg-gray-50 transition-colors duration-200">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h4 className="content-text font-normal text-chatgpt-text-primary mb-1">Phone Number</h4>
                <p className="sidebar-text text-chatgpt-text-secondary mb-2">Primary contact number for your organization</p>
                {editMode === 'phoneNumber' ? (
                  <div className="flex items-center space-x-3">
                    <input
                      type="text"
                      value={editValue}
                      onChange={(e) => setEditValue(e.target.value)}
                      className="chatgpt-input flex-1"
                      placeholder="Enter phone number"
                    />
                    <button
                      onClick={() => handleSave('phoneNumber')}
                      disabled={saving}
                      className="chatgpt-primary-button disabled:opacity-50"
                    >
                      {saving ? 'Saving...' : 'Save'}
                    </button>
                    <button
                      onClick={handleCancel}
                      className="chatgpt-button"
                    >
                      Cancel
                    </button>
                  </div>
                ) : (
                  <p className="content-text font-normal text-chatgpt-text-primary">
                    {companyData.phoneNumber}
                  </p>
                )}
              </div>
              {editMode !== 'phoneNumber' && (
                <div className="flex items-center space-x-2 ml-4">
                  <button 
                    onClick={() => handleEdit('phoneNumber', companyData.phoneNumber)}
                    className="sidebar-text text-blue-600 hover:text-blue-700 transition-colors duration-200"
                  >
                    Edit
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CompanyProfile;