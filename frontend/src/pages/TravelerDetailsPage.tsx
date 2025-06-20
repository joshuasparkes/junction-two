import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Layout from '../components/common/Layout';
import { TrainOffer } from '../services/trainService';
import { createBooking } from '../services/bookingService';
import { getTrips } from '../services/tripService';
import { Trip } from '../lib/supabase';

interface LocationState {
  offer: TrainOffer;
  isReturn: boolean;
  passengerCount: number;
}

interface PassengerDetails {
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  gender: string;
  email: string;
  phoneNumber: string;
  addressLine1: string;
  city: string;
  postalCode: string;
  countryCode: string;
}

const TravelerDetailsPage: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const state = location.state as LocationState;
  
  const [isBooking, setIsBooking] = useState(false);
  const [bookingError, setBookingError] = useState<string | null>(null);
  const [passengers, setPassengers] = useState<PassengerDetails[]>([]);
  const [trips, setTrips] = useState<Trip[]>([]);
  const [selectedTripId, setSelectedTripId] = useState<string>('');
  const [isLoadingTrips, setIsLoadingTrips] = useState(false);
  
  // Initialize passengers array based on state
  React.useEffect(() => {
    if (state?.passengerCount) {
      setPassengers(
        Array(state.passengerCount).fill(null).map(() => ({
          firstName: '',
          lastName: '',
          dateOfBirth: '',
          gender: '',
          email: '',
          phoneNumber: '',
          addressLine1: '',
          city: '',
          postalCode: '',
          countryCode: 'GB'
        }))
      );
    }
  }, [state?.passengerCount]);

  // Load user trips
  useEffect(() => {
    const loadTrips = async () => {
      setIsLoadingTrips(true);
      try {
        const userTrips = await getTrips();
        setTrips(userTrips);
      } catch (error) {
        console.error('Failed to load trips:', error);
        setBookingError('Failed to load trips. Please refresh the page.');
      } finally {
        setIsLoadingTrips(false);
      }
    };

    loadTrips();
  }, []);
  
  if (!state?.offer) {
    navigate('/book?tab=rail');
    return null;
  }
  
  const { offer, isReturn, passengerCount } = state;

  const handlePassengerChange = (index: number, field: keyof PassengerDetails, value: string) => {
    const updatedPassengers = [...passengers];
    updatedPassengers[index] = {
      ...updatedPassengers[index],
      [field]: value
    };
    setPassengers(updatedPassengers);
  };

  const validateForm = (): boolean => {
    if (!selectedTripId) {
      setBookingError('Please select a trip for this booking');
      return false;
    }
    
    for (const passenger of passengers) {
      if (!passenger.firstName || !passenger.lastName || !passenger.dateOfBirth || 
          !passenger.gender || !passenger.email || !passenger.phoneNumber ||
          !passenger.addressLine1 || !passenger.city || !passenger.postalCode) {
        setBookingError('Please fill in all required fields for all passengers');
        return false;
      }
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsBooking(true);
    setBookingError(null);

    try {
      // Transform passenger data to match API format
      const bookingData = {
        offerId: offer.id,
        tripId: selectedTripId, // Keep as string since Supabase uses string IDs
        passengers: passengers.map(p => ({
          dateOfBirth: p.dateOfBirth,
          firstName: p.firstName,
          lastName: p.lastName,
          gender: p.gender,
          email: p.email,
          phoneNumber: p.phoneNumber,
          residentialAddress: {
            addressLines: [p.addressLine1],
            countryCode: p.countryCode,
            postalCode: p.postalCode,
            city: p.city
          }
        }))
      };

      const booking = await createBooking(bookingData);
      
      // Navigate to payment page
      navigate('/payment', { 
        state: { 
          booking,
          offer,
          isReturn 
        } 
      });
    } catch (error) {
      console.error('Booking failed:', error);
      setBookingError(error instanceof Error ? error.message : 'Booking failed. Please try again.');
    } finally {
      setIsBooking(false);
    }
  };

  return (
    <Layout>
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-2xl font-semibold text-gray-900 mb-2">
            Traveler Details
          </h1>
          <p className="text-gray-600">
            Please provide details for all {passengerCount} passenger{passengerCount > 1 ? 's' : ''} traveling
          </p>
        </div>

        {/* Trip Summary */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-8">
          <h2 className="font-semibold text-blue-900 mb-2">Trip Summary</h2>
          <div className="text-sm text-blue-800">
            <p className="mb-1">
              {isReturn ? 'Round trip' : 'One way'} journey
            </p>
            <p className="font-semibold text-lg text-blue-900">
              Total: €{offer.price.amount}
            </p>
          </div>
        </div>

        {/* Error Message */}
        {bookingError && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
            {bookingError}
          </div>
        )}

        {/* Trip Selection */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Select Trip
          </h2>
          
          {isLoadingTrips ? (
            <div className="flex items-center text-gray-600">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mr-2"></div>
              Loading trips...
            </div>
          ) : trips.length > 0 ? (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Choose a trip for this booking <span className="text-red-500">*</span>
              </label>
              <select
                value={selectedTripId}
                onChange={(e) => setSelectedTripId(e.target.value)}
                className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              >
                <option value="">Select a trip...</option>
                {trips.map((trip) => (
                  <option key={trip.id} value={trip.id}>
                    {trip.name} {trip.start_date && trip.end_date && `(${new Date(trip.start_date).toLocaleDateString()} - ${new Date(trip.end_date).toLocaleDateString()})`}
                  </option>
                ))}
              </select>
            </div>
          ) : (
            <div className="text-center py-6">
              <svg className="w-12 h-12 mx-auto text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-4m-5 0H3m2 0h4M9 7h6m-6 4h6m-6 4h6" />
              </svg>
              <p className="text-gray-600 mb-4">No trips found. You need to create a trip first.</p>
              <button
                type="button"
                onClick={() => window.open('/trips', '_blank')}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Create a trip
              </button>
              <p className="text-sm text-gray-500 mt-2">
                After creating a trip, refresh this page to select it.
              </p>
            </div>
          )}
        </div>

        {/* Passenger Forms */}
        <form onSubmit={handleSubmit}>
          {passengers.map((passenger, index) => (
            <div key={index} className="bg-white rounded-lg shadow-sm p-6 mb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Passenger {index + 1}
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* First Name */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    First Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={passenger.firstName}
                    onChange={(e) => handlePassengerChange(index, 'firstName', e.target.value)}
                    className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>

                {/* Last Name */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Last Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={passenger.lastName}
                    onChange={(e) => handlePassengerChange(index, 'lastName', e.target.value)}
                    className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>

                {/* Date of Birth */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Date of Birth <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    value={passenger.dateOfBirth}
                    onChange={(e) => handlePassengerChange(index, 'dateOfBirth', e.target.value)}
                    max={new Date().toISOString().split('T')[0]}
                    className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>

                {/* Gender */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Gender <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={passenger.gender}
                    onChange={(e) => handlePassengerChange(index, 'gender', e.target.value)}
                    className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  >
                    <option value="">Select gender</option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                  </select>
                </div>

                {/* Email */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="email"
                    value={passenger.email}
                    onChange={(e) => handlePassengerChange(index, 'email', e.target.value)}
                    className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>

                {/* Phone Number */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Phone Number <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="tel"
                    value={passenger.phoneNumber}
                    onChange={(e) => handlePassengerChange(index, 'phoneNumber', e.target.value)}
                    placeholder="+44..."
                    className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>

                {/* Address Line 1 */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Address <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={passenger.addressLine1}
                    onChange={(e) => handlePassengerChange(index, 'addressLine1', e.target.value)}
                    placeholder="Street address"
                    className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>

                {/* City */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    City <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={passenger.city}
                    onChange={(e) => handlePassengerChange(index, 'city', e.target.value)}
                    className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>

                {/* Postal Code */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Postal Code <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={passenger.postalCode}
                    onChange={(e) => handlePassengerChange(index, 'postalCode', e.target.value)}
                    className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>

                {/* Country */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Country <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={passenger.countryCode}
                    onChange={(e) => handlePassengerChange(index, 'countryCode', e.target.value)}
                    className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  >
                    <option value="GB">United Kingdom</option>
                    <option value="FR">France</option>
                    <option value="DE">Germany</option>
                    <option value="ES">Spain</option>
                    <option value="IT">Italy</option>
                    <option value="NL">Netherlands</option>
                    <option value="BE">Belgium</option>
                    <option value="CH">Switzerland</option>
                  </select>
                </div>
              </div>
            </div>
          ))}

          {/* Action Buttons */}
          <div className="flex justify-between items-center">
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="px-6 py-3 text-gray-700 hover:text-gray-900 font-medium"
            >
              Back to search
            </button>
            
            <button
              type="submit"
              disabled={isBooking}
              className="bg-green-600 text-white px-8 py-3 rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
            >
              {isBooking ? (
                <div className="flex items-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Processing booking...
                </div>
              ) : (
                `Next (€${offer.price.amount})`
              )}
            </button>
          </div>
        </form>
      </div>
    </Layout>
  );
};

export default TravelerDetailsPage;