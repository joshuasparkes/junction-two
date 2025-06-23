import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import Layout from '../components/common/Layout';
import { getTripById } from '../services/tripService';
import { getTripBookings } from '../services/supabaseBookingService';
import { Trip, Booking } from '../lib/supabase';

const TripDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [trip, setTrip] = useState<Trip | null>(null);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingBookings, setLoadingBookings] = useState(true);
  const [showAddBooking, setShowAddBooking] = useState(false);

  useEffect(() => {
    const fetchTrip = async () => {
      if (!id) return;
      setLoading(true);
      try {
        const tripData = await getTripById(id);
        setTrip(tripData);
      } catch (err) {
        console.error('Failed to fetch trip:', err);
      } finally {
        setLoading(false);
      }
    };

    const fetchBookings = async () => {
      if (!id) return;
      setLoadingBookings(true);
      try {
        const bookingsData = await getTripBookings(id);
        setBookings(bookingsData);
      } catch (err) {
        console.error('Failed to fetch bookings:', err);
      } finally {
        setLoadingBookings(false);
      }
    };

    fetchTrip();
    fetchBookings();
  }, [id]);

  const handleAddBooking = (type: 'flight' | 'rail') => {
    const tab = type === 'flight' ? 'flights' : 'rail';
    navigate(`/book?tab=${tab}&tripId=${id}`);
  };

  const handleConfirmBooking = (booking: Booking) => {
    // Navigate to payment page with booking details
    navigate('/payment', {
      state: {
        booking: {
          id: booking.junction_booking_id,
          status: booking.status,
          price: {
            amount: booking.total_amount,
            currency: booking.currency
          },
          passengers: booking.passengers_data,
          trips: booking.trips_data,
          priceBreakdown: booking.price_breakdown,
          fullJunctionResponse: booking.junction_response
        },
        // Reconstruct offer data from booking
        offer: booking.junction_response?.offerData || {
          id: booking.junction_response?.offer,
          price: {
            amount: booking.total_amount,
            currency: booking.currency
          }
        },
        isReturn: false,
        supabaseBookingId: booking.id // Pass the Supabase booking ID for status updates
      }
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed':
        return 'bg-green-100 text-green-800';
      case 'pending-payment':
        return 'bg-yellow-100 text-yellow-800';
      case 'pending-approval':
        return 'bg-orange-100 text-orange-800';
      case 'paid':
        return 'bg-blue-100 text-blue-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getBookingDetails = (booking: Booking) => {
    // Extract data from junction_response or trips_data
    const junctionData = booking.junction_response;
    const tripsData = booking.trips_data || [];
    
    if (tripsData.length > 0 && tripsData[0].segments) {
      const firstSegment = tripsData[0].segments[0];
      const lastSegment = tripsData[0].segments[tripsData[0].segments.length - 1];
      
      return {
        departure: {
          location: firstSegment?.origin || 'Unknown',
          time: firstSegment?.departureAt ? new Date(firstSegment.departureAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : 'N/A',
          date: firstSegment?.departureAt ? new Date(firstSegment.departureAt).toLocaleDateString() : 'N/A'
        },
        arrival: {
          location: lastSegment?.destination || 'Unknown', 
          time: lastSegment?.arrivalAt ? new Date(lastSegment.arrivalAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : 'N/A',
          date: lastSegment?.arrivalAt ? new Date(lastSegment.arrivalAt).toLocaleDateString() : 'N/A'
        },
        operator: firstSegment?.vehicle?.name || 'Unknown',
        class: firstSegment?.fare?.marketingName || 'Standard'
      };
    }
    
    return {
      departure: { location: 'Unknown', time: 'N/A', date: 'N/A' },
      arrival: { location: 'Unknown', time: 'N/A', date: 'N/A' },
      operator: 'Unknown',
      class: 'Standard'
    };
  };

  const getTypeIcon = () => {
    // For now, all bookings from our system are rail bookings
    return (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 01.553-.894L9 2l6 3 6-3v15l-6 3-6-3z" />
      </svg>
    );
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-600"></div>
          <span className="ml-3 content-text text-chatgpt-text-secondary">Loading trip...</span>
        </div>
      </Layout>
    );
  }

  if (!trip) {
    return (
      <Layout>
        <div className="max-w-6xl mx-auto px-4 py-8">
          <div className="text-center">
            <h1 className="title-text font-normal text-chatgpt-text-primary">Trip not found</h1>
            <Link to="/trips" className="sidebar-text text-gray-600 hover:text-gray-900 mt-4 inline-block transition-colors">
              Back to trips
            </Link>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <Link 
            to="/trips" 
            className="sidebar-text text-gray-600 hover:text-gray-900 mb-4 inline-flex items-center transition-colors"
          >
            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to trips
          </Link>
          <h1 className="title-text font-normal text-chatgpt-text-primary mb-2">{trip.name || 'Trip Details'}</h1>
          <p className="content-text text-chatgpt-text-secondary">
            {trip.start_date && trip.end_date 
              ? `${new Date(trip.start_date).toLocaleDateString()} - ${new Date(trip.end_date).toLocaleDateString()}`
              : 'Dates not set'
            }
          </p>
        </div>

        <div className="space-y-8">
            {/* Bookings Section */}
            <div className="bg-white border border-gray-200 rounded-lg p-3">
              <div className="flex items-center justify-between mb-4">
                <h2 className="title-text font-normal text-chatgpt-text-primary">Bookings</h2>
                <div className="relative">
                  <button
                    onClick={() => setShowAddBooking(!showAddBooking)}
                    className="chatgpt-primary-button inline-flex items-center justify-center"
                  >
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    Add Booking
                  </button>

                  {/* Dropdown Menu */}
                  {showAddBooking && (
                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg border border-gray-200 shadow-lg z-10">
                      <div className="p-2">
                        <button
                          onClick={() => handleAddBooking('flight')}
                          className="w-full text-left p-2 sidebar-text text-gray-700 hover:bg-gray-50 rounded-md flex items-center transition-colors"
                        >
                          <svg className="w-4 h-4 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                          </svg>
                          Add Flight
                        </button>
                        <button
                          onClick={() => handleAddBooking('rail')}
                          className="w-full text-left p-2 sidebar-text text-gray-700 hover:bg-gray-50 rounded-md flex items-center transition-colors"
                        >
                          <svg className="w-4 h-4 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 01.553-.894L9 2l6 3 6-3v15l-6 3-6-3z" />
                          </svg>
                          Add Rail
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {loadingBookings ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-600 mx-auto"></div>
                  <p className="mt-2 sidebar-text text-chatgpt-text-secondary">Loading bookings...</p>
                </div>
              ) : bookings.length === 0 ? (
                <div className="text-center py-8">
                  <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                  <h3 className="mt-2 sidebar-text font-normal text-chatgpt-text-primary">No bookings yet</h3>
                  <p className="mt-1 sidebar-text text-chatgpt-text-secondary">Get started by adding your first booking.</p>
                </div>
              ) : (
                <div className="space-y-0">
                  {bookings.map((booking) => {
                    const details = getBookingDetails(booking);
                    return (
                      <div key={booking.id} className="p-3 rounded-md hover:bg-gray-50 transition-colors duration-200">
                        <div className="flex items-start justify-between">
                          <div className="flex items-start space-x-3">
                            <div className="flex-shrink-0 mt-1">
                              {getTypeIcon()}
                            </div>
                            <div className="flex-1">
                              <div className="flex items-center space-x-2 mb-1">
                                <h3 className="content-text font-normal text-chatgpt-text-primary">
                                  Train Journey #{booking.junction_booking_id?.slice(-8)}
                                </h3>
                                <span className={`inline-flex items-center px-2 py-1 rounded-full sidebar-text ${getStatusColor(booking.status)} whitespace-nowrap`}>
                                  {booking.status === 'pending-payment' ? 'Pending Payment' : 
                                   booking.status === 'pending-approval' ? 'Pending Approval' : 
                                   booking.status}
                                </span>
                              </div>
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-2">
                                <div>
                                  <p className="sidebar-text font-normal text-chatgpt-text-primary">{details.departure.location}</p>
                                  <p className="sidebar-text text-chatgpt-text-secondary">{details.departure.time} • {details.departure.date}</p>
                                </div>
                                <div>
                                  <p className="sidebar-text font-normal text-chatgpt-text-primary">{details.arrival.location}</p>
                                  <p className="sidebar-text text-chatgpt-text-secondary">{details.arrival.time} • {details.arrival.date}</p>
                                </div>
                              </div>
                              <div className="flex items-center justify-between">
                                <div className="flex items-center space-x-4 sidebar-text text-gray-500">
                                  <span>Operator: {details.operator}</span>
                                  <span>Class: {details.class}</span>
                                  {booking.delivery_option && <span>Delivery: {booking.delivery_option}</span>}
                                </div>
                                {booking.ticket_url && (
                                  <a 
                                    href={booking.ticket_url} 
                                    target="_blank" 
                                    rel="noopener noreferrer"
                                    className="sidebar-text text-blue-600 hover:text-blue-700 transition-colors duration-200"
                                  >
                                    Download Ticket
                                  </a>
                                )}
                              </div>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="content-text font-normal text-chatgpt-text-primary">{booking.currency}{booking.total_amount}</p>
                            <p className="sidebar-text text-chatgpt-text-secondary mt-1">
                              {booking.created_at ? new Date(booking.created_at).toLocaleDateString() : 'N/A'}
                            </p>
                            {booking.status === 'pending-payment' && (
                              <button
                                onClick={() => handleConfirmBooking(booking)}
                                className="mt-2 chatgpt-button sidebar-text"
                              >
                                Confirm & Book
                              </button>
                            )}
                            {booking.status === 'pending-approval' && (
                              <div className="mt-2 sidebar-text text-orange-600">
                                Awaiting manager approval
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
        </div>
      </div>
    </Layout>
  );
};

export default TripDetailPage;