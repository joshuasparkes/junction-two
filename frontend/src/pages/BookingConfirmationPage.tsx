import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Layout from '../components/common/Layout';

const BookingConfirmationPage: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const state = location.state as any;
  
  if (!state?.booking) {
    navigate('/book?tab=rail');
    return null;
  }
  
  const { booking, offer, isReturn } = state;
  
  return (
    <Layout>
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="bg-white rounded-lg shadow-sm p-8 text-center">
          {/* Success Icon */}
          <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-6">
            <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Booking Confirmed!
          </h1>
          
          <p className="text-gray-600 mb-6">
            Your train {isReturn ? 'round trip' : 'journey'} has been successfully booked
          </p>
          
          {/* Booking Details */}
          <div className="bg-gray-50 rounded-lg p-6 mb-6 text-left">
            <h2 className="font-semibold text-gray-900 mb-4">Booking Details</h2>
            
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-600">Booking ID:</span>
                <span className="font-medium text-gray-900">{booking.id || 'TRAIN-' + Date.now()}</span>
              </div>
              
              {booking.confirmationNumber && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Confirmation Number:</span>
                  <span className="font-medium text-gray-900">{booking.confirmationNumber}</span>
                </div>
              )}
              
              <div className="flex justify-between">
                <span className="text-gray-600">Status:</span>
                <span className="font-medium text-green-600">Confirmed</span>
              </div>
              
              <div className="flex justify-between">
                <span className="text-gray-600">Total Amount:</span>
                <span className="font-bold text-gray-900">€{offer.price.amount}</span>
              </div>
            </div>
          </div>
          
          {/* Info Box */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <p className="text-sm text-blue-800">
              A confirmation email has been sent to the passenger email addresses with your ticket details and boarding information.
            </p>
          </div>
          
          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={() => navigate('/trips')}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
            >
              View My Trips
            </button>
            
            <button
              onClick={() => navigate('/book?tab=rail')}
              className="px-6 py-3 bg-white text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors font-medium"
            >
              Book Another Trip
            </button>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default BookingConfirmationPage;