import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { PolicyService, PolicyEvaluationResult } from '../../services/policyService';

interface PolicyComplianceBadgeProps {
  trainOffer: any;
  origin?: string;
  destination?: string;
  className?: string;
}

const PolicyComplianceBadge: React.FC<PolicyComplianceBadgeProps> = ({
  trainOffer,
  origin,
  destination,
  className = ''
}) => {
  const { user, currentOrganization } = useAuth();
  const [evaluation, setEvaluation] = useState<PolicyEvaluationResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (trainOffer && user && currentOrganization) {
      evaluatePolicy();
    }
  }, [trainOffer, user, currentOrganization]);

  const evaluatePolicy = async () => {
    if (!trainOffer || !user || !currentOrganization) return;

    setLoading(true);
    setError(null);

    try {
      // Extract train data from the offer
      const trainData = {
        train: {
          price: parseFloat(trainOffer.price.amount),
          currency: trainOffer.price.currency || 'EUR',
          class: getTrainClass(trainOffer),
          operator: getTrainOperator(trainOffer),
          departure_date: trainOffer.trips?.[0]?.segments?.[0]?.departureAt,
        },
        origin: origin,
        destination: destination,
      };

      const result = await PolicyService.evaluatePolicy({
        travel_data: trainData,
        org_id: currentOrganization.id,
        user_id: user.id,
      });

      setEvaluation(result);
    } catch (err) {
      console.error('Policy evaluation failed:', err);
      setError('Policy check failed');
    } finally {
      setLoading(false);
    }
  };

  const getTrainClass = (offer: any): string => {
    // Extract class from train offer - this depends on your train API structure
    const firstSegment = offer.trips?.[0]?.segments?.[0];
    if (firstSegment?.fareClass) {
      return firstSegment.fareClass.toUpperCase();
    }
    if (firstSegment?.bookingClass) {
      return firstSegment.bookingClass.toUpperCase();
    }
    return 'STANDARD'; // Default
  };

  const getTrainOperator = (offer: any): string => {
    // Extract operator from train offer
    const firstSegment = offer.trips?.[0]?.segments?.[0];
    if (firstSegment?.vehicle?.name) {
      return firstSegment.vehicle.name;
    }
    if (firstSegment?.operator) {
      return firstSegment.operator;
    }
    return offer.metadata?.providerId || 'Unknown';
  };

  const getBadgeContent = () => {
    if (loading) {
      return {
        text: 'Checking...',
        bgColor: 'bg-gray-100',
        textColor: 'text-gray-600',
        icon: '⏳'
      };
    }

    if (error) {
      return {
        text: 'Policy Check Failed',
        bgColor: 'bg-gray-100',
        textColor: 'text-gray-600',
        icon: '⚠️'
      };
    }

    if (!evaluation) {
      return null;
    }

    switch (evaluation.result) {
      case 'IN_POLICY':
        return {
          text: 'In Policy',
          bgColor: 'bg-green-100',
          textColor: 'text-green-700',
          icon: '✅'
        };
      case 'OUT_OF_POLICY':
        return {
          text: 'Out of Policy',
          bgColor: 'bg-orange-100',
          textColor: 'text-orange-700',
          icon: '⚠️',
          tooltip: evaluation.messages.join(', ')
        };
      case 'APPROVAL_REQUIRED':
        return {
          text: 'Approval Required',
          bgColor: 'bg-yellow-100',
          textColor: 'text-yellow-700',
          icon: '👨‍💼',
          tooltip: evaluation.messages.join(', ')
        };
      case 'BOOKING_BLOCKED':
        return {
          text: 'Blocked',
          bgColor: 'bg-red-100',
          textColor: 'text-red-700',
          icon: '🚫',
          tooltip: evaluation.messages.join(', ')
        };
      case 'HIDDEN':
        return null; // Don't show the offer at all
      case 'NOT_SPECIFIED':
        return {
          text: 'No Policy',
          bgColor: 'bg-gray-100',
          textColor: 'text-gray-600',
          icon: '📋'
        };
      default:
        return null;
    }
  };

  const badgeContent = getBadgeContent();

  // If the result is HIDDEN, return null to hide the entire offer
  if (evaluation?.result === 'HIDDEN') {
    return null;
  }

  // If no badge content, don't render anything
  if (!badgeContent) {
    return null;
  }

  return (
    <div className={`inline-flex items-center ${className}`}>
      <span
        className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${badgeContent.bgColor} ${badgeContent.textColor}`}
        title={badgeContent.tooltip}
      >
        <span className="mr-1">{badgeContent.icon}</span>
        {badgeContent.text}
      </span>
      
      {evaluation?.messages && evaluation.messages.length > 0 && (
        <div className="ml-2">
          <button
            className="text-xs text-blue-600 hover:text-blue-800 underline"
            onClick={() => {
              alert(`Policy Details:\n\n${evaluation.messages.join('\n\n')}`);
            }}
            title="View policy details"
          >
            Details
          </button>
        </div>
      )}
    </div>
  );
};

// Hook to determine if an offer should be hidden
export const usePolicyFilter = (offers: any[], user: any, currentOrganization: any) => {
  const [filteredOffers, setFilteredOffers] = useState(offers);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!user || !currentOrganization || !offers.length) {
      setFilteredOffers(offers);
      return;
    }

    filterOffers();
  }, [offers, user, currentOrganization]);

  const filterOffers = async () => {
    setLoading(true);
    
    try {
      const evaluationPromises = offers.map(async (offer) => {
        try {
          const trainData = {
            train: {
              price: parseFloat(offer.price.amount),
              currency: offer.price.currency || 'EUR',
            }
          };

          const result = await PolicyService.evaluatePolicy({
            travel_data: trainData,
            org_id: currentOrganization.id,
            user_id: user.id,
          });

          return { offer, result: result.result };
        } catch (err) {
          console.error('Policy evaluation failed for offer:', offer.id, err);
          return { offer, result: 'NOT_SPECIFIED' };
        }
      });

      const evaluations = await Promise.all(evaluationPromises);
      
      // Filter out HIDDEN offers
      const visible = evaluations
        .filter(({ result }) => result !== 'HIDDEN')
        .map(({ offer }) => offer);

      setFilteredOffers(visible);
    } catch (err) {
      console.error('Policy filtering failed:', err);
      setFilteredOffers(offers); // Fallback to showing all offers
    } finally {
      setLoading(false);
    }
  };

  return { filteredOffers, loading };
};

export default PolicyComplianceBadge;