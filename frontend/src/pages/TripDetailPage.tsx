import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import Layout from '../components/common/Layout';
import { getTripById } from '../services/tripService';
import { getTripBookings } from '../services/supabaseBookingService';
import { Trip, Booking } from '../lib/supabase';

// Remove old interface since we're using the one from supabase

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

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed':
        return 'bg-green-100 text-green-800';
      case 'pending-payment':
        return 'bg-yellow-100 text-yellow-800';
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
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <span className="ml-3 text-lg text-gray-600">Loading trip...</span>
        </div>
      </Layout>
    );
  }

  if (!trip) {
    return (
      <Layout>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900">Trip not found</h1>
            <Link to="/trips" className="text-blue-600 hover:text-blue-700 mt-4 inline-block">
              Back to trips
            </Link>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <Link 
            to="/trips" 
            className="text-blue-600 hover:text-blue-700 text-sm font-medium mb-4 inline-flex items-center"
          >
            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to trips
          </Link>
          <h1 className="text-3xl font-bold text-gray-900">{trip.name || 'Trip Details'}</h1>
          <p className="text-gray-600 mt-1">
            {trip.start_date && trip.end_date 
              ? `${new Date(trip.start_date).toLocaleDateString()} - ${new Date(trip.end_date).toLocaleDateString()}`
              : 'Dates not set'
            }
          </p>
        </div>

        <div className="space-y-8">
            {/* Bookings Section */}
            <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
              <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
                <h2 className="text-lg font-semibold text-gray-900">Bookings</h2>
                <div className="relative">
                  <button
                    onClick={() => setShowAddBooking(!showAddBooking)}
                    className="inline-flex items-center px-4 py-2 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    Add Booking
                  </button>

                  {/* Dropdown Menu */}
                  {showAddBooking && (
                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg z-10 border border-gray-200">
                      <div className="py-1">
                        <button
                          onClick={() => handleAddBooking('flight')}
                          className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center"
                        >
                          <svg className="w-4 h-4 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                          </svg>
                          Add Flight
                        </button>
                        <button
                          onClick={() => handleAddBooking('rail')}
                          className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center"
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

              <div className="p-6">
                {loadingBookings ? (
                  <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                    <p className="mt-2 text-sm text-gray-500">Loading bookings...</p>
                  </div>
                ) : bookings.length === 0 ? (
                  <div className="text-center py-8">
                    <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                    </svg>
                    <h3 className="mt-2 text-sm font-medium text-gray-900">No bookings yet</h3>
                    <p className="mt-1 text-sm text-gray-500">Get started by adding your first booking.</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {bookings.map((booking) => {
                      const details = getBookingDetails(booking);
                      return (
                        <div key={booking.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                          <div className="flex items-start justify-between">
                            <div className="flex items-start space-x-3">
                              <div className="flex-shrink-0 mt-1">
                                {getTypeIcon()}
                              </div>
                              <div className="flex-1">
                                <div className="flex items-center space-x-2 mb-2">
                                  <h3 className="text-sm font-medium text-gray-900">
                                    Train Journey #{booking.junction_booking_id?.slice(-8)}
                                  </h3>
                                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(booking.status)}`}>
                                    {booking.status}
                                  </span>
                                </div>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                                  <div>
                                    <p className="text-gray-900 font-medium">{details.departure.location}</p>
                                    <p className="text-gray-600">{details.departure.time} • {details.departure.date}</p>
                                  </div>
                                  <div>
                                    <p className="text-gray-900 font-medium">{details.arrival.location}</p>
                                    <p className="text-gray-600">{details.arrival.time} • {details.arrival.date}</p>
                                  </div>
                                </div>
                                <div className="mt-2 flex items-center space-x-4 text-xs text-gray-500">
                                  <span>Operator: {details.operator}</span>
                                  <span>Class: {details.class}</span>
                                  {booking.delivery_option && <span>Delivery: {booking.delivery_option}</span>}
                                </div>
                                {booking.ticket_url && (
                                  <div className="mt-2">
                                    <a 
                                      href={booking.ticket_url} 
                                      target="_blank" 
                                      rel="noopener noreferrer"
                                      className="text-xs text-blue-600 hover:text-blue-700"
                                    >
                                      Download Ticket
                                    </a>
                                  </div>
                                )}
                              </div>
                            </div>
                            <div className="text-right">
                              <p className="text-lg font-semibold text-gray-900">{booking.currency}{booking.total_amount}</p>
                              <p className="text-xs text-gray-500 mt-1">
                                {booking.created_at ? new Date(booking.created_at).toLocaleDateString() : 'N/A'}
                              </p>
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
      </div>
    </Layout>
  );
};

export default TripDetailPage;