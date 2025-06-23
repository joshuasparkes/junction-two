import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Layout from '../components/common/Layout';
import { TrainOffer } from '../services/trainService';
import { BookingResponse, confirmBooking, ConfirmationRequest } from '../services/bookingService';

interface LocationState {
  booking: BookingResponse & { id: string };
  offer: TrainOffer;
  isReturn: boolean;
  supabaseBookingId?: string;
}

const PaymentPage: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const state = location.state as LocationState;
  
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentError, setPaymentError] = useState<string | null>(null);
  const [deliveryOption, setDeliveryOption] = useState<'electronic-ticket' | 'kiosk-collect'>('electronic-ticket');
  
  // Mock payment form state
  const [cardNumber, setCardNumber] = useState('');
  const [expiryDate, setExpiryDate] = useState('');
  const [cvv, setCvv] = useState('');
  const [cardholderName, setCardholderName] = useState('');
  
  if (!state?.booking || !state?.offer) {
    navigate('/book?tab=rail');
    return null;
  }
  
  const { booking, offer, isReturn } = state;
  
  const handlePayment = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Basic validation for mock payment
    if (!cardNumber || !expiryDate || !cvv || !cardholderName) {
      setPaymentError('Please fill in all payment details');
      return;
    }
    
    setIsProcessing(true);
    setPaymentError(null);
    
    try {
      // Mock payment processing delay
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Mock payment always succeeds
      console.log('💳 Mock payment processed successfully');
      
      // Confirm the booking with delivery preferences
      const confirmationRequest: ConfirmationRequest = {
        fulfillmentChoices: [
          {
            deliveryOption,
            segmentSequence: 1
          }
        ]
      };
      
      const confirmedBooking = await confirmBooking(booking.id, confirmationRequest);
      
      // Navigate to confirmation page
      navigate('/booking-confirmation', {
        state: {
          booking: confirmedBooking,
          offer,
          isReturn
        }
      });
    } catch (error) {
      console.error('Payment or confirmation failed:', error);
      setPaymentError(error instanceof Error ? error.message : 'Payment processing failed. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };
  
  return (
    <Layout>
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-2xl font-semibold text-gray-900 mb-2">
            Payment & Confirmation
          </h1>
          <p className="text-gray-600">
            Complete your booking by providing payment details
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Payment Form */}
          <div className="lg:col-span-2">
            <form onSubmit={handlePayment} className="space-y-6">
              {/* Delivery Options */}
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">
                  Ticket Delivery
                </h2>
                
                <div className="space-y-3">
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="delivery"
                      value="electronic-ticket"
                      checked={deliveryOption === 'electronic-ticket'}
                      onChange={(e) => setDeliveryOption(e.target.value as 'electronic-ticket')}
                      className="mr-3"
                    />
                    <div>
                      <div className="font-medium">Electronic Ticket (Recommended)</div>
                      <div className="text-sm text-gray-500">Instant delivery via email</div>
                    </div>
                  </label>
                  
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="delivery"
                      value="kiosk-collect"
                      checked={deliveryOption === 'kiosk-collect'}
                      onChange={(e) => setDeliveryOption(e.target.value as 'kiosk-collect')}
                      className="mr-3"
                    />
                    <div>
                      <div className="font-medium">Station Collection</div>
                      <div className="text-sm text-gray-500">Collect at departure station</div>
                    </div>
                  </label>
                </div>
              </div>

              {/* Mock Payment Form */}
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">
                  Payment Details
                </h2>
                
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
                  <p className="text-sm text-blue-800">
                    🔒 This is a demo environment. Use any test card details.
                  </p>
                </div>
                
                <div className="grid grid-cols-1 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Cardholder Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={cardholderName}
                      onChange={(e) => setCardholderName(e.target.value)}
                      placeholder="John Smith"
                      className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Card Number <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={cardNumber}
                      onChange={(e) => setCardNumber(e.target.value)}
                      placeholder="1234 5678 9012 3456"
                      className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                    />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Expiry Date <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={expiryDate}
                        onChange={(e) => setExpiryDate(e.target.value)}
                        placeholder="MM/YY"
                        className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        required
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        CVV <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={cvv}
                        onChange={(e) => setCvv(e.target.value)}
                        placeholder="123"
                        className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        required
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Error Message */}
              {paymentError && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
                  {paymentError}
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex justify-between items-center">
                <button
                  type="button"
                  onClick={() => navigate(-1)}
                  className="px-6 py-3 text-gray-700 hover:text-gray-900 font-medium"
                >
                  Back to details
                </button>
                
                <button
                  type="submit"
                  disabled={isProcessing}
                  className="bg-green-600 text-white px-8 py-3 rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
                >
                  {isProcessing ? (
                    <div className="flex items-center">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Processing payment...
                    </div>
                  ) : (
                    `Complete payment (€${offer.price.amount})`
                  )}
                </button>
              </div>
            </form>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm p-6 sticky top-8">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Order Summary
              </h2>
              
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Trip type:</span>
                  <span className="font-medium">{isReturn ? 'Round trip' : 'One way'}</span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-gray-600">Booking ID:</span>
                  <span className="font-medium text-sm">{booking.id}</span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-gray-600">Status:</span>
                  <span className="font-medium text-orange-600">Pending Payment</span>
                </div>
                
                <hr className="my-4" />
                
                <div className="flex justify-between text-lg">
                  <span className="font-semibold">Total:</span>
                  <span className="font-bold text-green-600">€{offer.price.amount}</span>
                </div>
              </div>
              
              <div className="mt-6 p-3 bg-gray-50 rounded-lg">
                <p className="text-xs text-gray-600">
                  By completing this payment, you agree to the terms and conditions of travel.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default PaymentPage;