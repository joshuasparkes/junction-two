import React from 'react';
import { PolicyEvaluationResult } from '../../services/policyService';

interface PolicyWarningDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  evaluation: PolicyEvaluationResult | null;
  trainOffer: any;
}

const PolicyWarningDialog: React.FC<PolicyWarningDialogProps> = ({
  isOpen,
  onClose,
  onConfirm,
  evaluation,
  trainOffer
}) => {
  if (!isOpen || !evaluation) return null;

  const isOutOfPolicy = evaluation.result === 'OUT_OF_POLICY' || evaluation.result === 'APPROVAL_REQUIRED';

  if (!isOutOfPolicy) {
    // If not out of policy, just continue
    onConfirm();
    return null;
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-md w-full p-6">
        <div className="flex items-start mb-4">
          <div className="flex-shrink-0">
            <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center">
              <span className="text-orange-600 text-lg">⚠️</span>
            </div>
          </div>
          <div className="ml-3">
            <h3 className="text-lg font-medium text-gray-900">
              This fare is out of policy
            </h3>
            <p className="mt-2 text-sm text-gray-600">
              Are you sure you want to select this fare? Some items of this fare do not comply with the policies defined by your company.
            </p>
          </div>
        </div>

        {/* Policy Violations */}
        {evaluation.messages && evaluation.messages.length > 0 && (
          <div className="mb-4 p-3 bg-orange-50 rounded-md">
            <h4 className="text-sm font-medium text-orange-800 mb-2">
              Policy Violations:
            </h4>
            <ul className="text-sm text-orange-700 space-y-1">
              {evaluation.messages.map((message, index) => (
                <li key={index} className="flex items-start">
                  <span className="text-orange-500 mr-2">•</span>
                  {message}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Train Details */}
        <div className="mb-4 p-3 bg-gray-50 rounded-md">
          <h4 className="text-sm font-medium text-gray-800 mb-2">
            Selected Train:
          </h4>
          <div className="text-sm text-gray-600">
            <p><strong>Price:</strong> €{trainOffer?.price?.amount}</p>
            <p><strong>Departure:</strong> {trainOffer?.trips?.[0]?.segments?.[0]?.departureAt && 
              new Date(trainOffer.trips[0].segments[0].departureAt).toLocaleString()}</p>
            <p><strong>Duration:</strong> {trainOffer?.trips?.[0]?.segments?.length > 0 && 
              Math.floor((new Date(trainOffer.trips[0].segments[trainOffer.trips[0].segments.length - 1].arrivalAt).getTime() - 
                         new Date(trainOffer.trips[0].segments[0].departureAt).getTime()) / (1000 * 60 * 60))}h</p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex space-x-3">
          <button
            onClick={onClose}
            className="flex-1 bg-gray-200 text-gray-900 px-4 py-2 rounded-lg hover:bg-gray-300 transition-colors font-medium"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 bg-orange-600 text-white px-4 py-2 rounded-lg hover:bg-orange-700 transition-colors font-medium"
          >
            {evaluation.result === 'APPROVAL_REQUIRED' 
              ? 'Continue (Requires Approval)' 
              : 'Continue Anyway'
            }
          </button>
        </div>
      </div>
    </div>
  );
};

export default PolicyWarningDialog;