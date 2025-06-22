import React from 'react';

interface InviteUserForm {
  email: string;
  role: string;
  message: string;
}

interface InviteUserModalProps {
  isOpen: boolean;
  form: InviteUserForm;
  onClose: () => void;
  onSubmit: (e: React.FormEvent) => void;
  onChange: (field: keyof InviteUserForm, value: string) => void;
}

const InviteUserModal: React.FC<InviteUserModalProps> = ({
  isOpen,
  form,
  onClose,
  onSubmit,
  onChange
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
        <div className="mt-3">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Invite User</h3>
          <form onSubmit={onSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
              <input 
                type="email" 
                required
                value={form.email}
                onChange={(e) => onChange('email', e.target.value)}
                className="chatgpt-input w-full" 
                placeholder="user@example.com" 
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Role</label>
              <select 
                value={form.role}
                onChange={(e) => onChange('role', e.target.value)}
                className="chatgpt-select w-full"
              >
                <option value="member">Member</option>
                <option value="manager">Manager</option>
                <option value="admin">Admin</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Message (Optional)</label>
              <textarea 
                rows={3}
                value={form.message}
                onChange={(e) => onChange('message', e.target.value)}
                className="chatgpt-input w-full" 
                placeholder="Add a personal message to the invitation..."
              />
            </div>
            <div className="bg-blue-50 border border-blue-200 rounded-md p-3">
              <div className="flex">
                <svg className="w-5 h-5 text-blue-400 mr-2 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
                <div className="text-sm text-blue-700">
                  <p>An invitation email will be sent to the user. They can accept the invitation to join your organization.</p>
                </div>
              </div>
            </div>
            <div className="flex justify-end space-x-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="chatgpt-button"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="chatgpt-primary-button"
              >
                Send Invitation
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default InviteUserModal;