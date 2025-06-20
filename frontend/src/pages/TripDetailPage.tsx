import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import Layout from '../components/common/Layout';
import { getTripById } from '../services/tripService';
import { Trip } from '../lib/supabase';

interface Booking {
  id: string;
  type: 'flight' | 'rail';
  title: string;
  departure: {
    location: string;
    time: string;
    date: string;
  };
  arrival: {
    location: string;
    time: string;
    date: string;
  };
  price: number;
  status: 'confirmed' | 'pending' | 'cancelled';
  duration?: string;
  airline?: string;
  trainOperator?: string;
  class: string;
}

interface CartItem {
  id: string;
  type: 'flight' | 'rail';
  title: string;
  price: number;
  departure: {
    location: string;
    time: string;
    date: string;
  };
  arrival: {
    location: string;
    time: string;
    date: string;
  };
}

const TripDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [trip, setTrip] = useState<Trip | null>(null);
  const [loading, setLoading] = useState(true);
  const [showAddBooking, setShowAddBooking] = useState(false);

  // Mock bookings data
  const [bookings] = useState<Booking[]>([
    {
      id: '1',
      type: 'flight',
      title: 'Outbound Flight',
      departure: {
        location: 'London Heathrow (LHR)',
        time: '14:30',
        date: '2025-07-15'
      },
      arrival: {
        location: 'New York JFK (JFK)',
        time: '17:45',
        date: '2025-07-15'
      },
      price: 589,
      status: 'confirmed',
      duration: '8h 15m',
      airline: 'British Airways',
      class: 'Economy'
    },
    {
      id: '2',
      type: 'rail',
      title: 'City Connection',
      departure: {
        location: 'New York Penn Station',
        time: '09:15',
        date: '2025-07-16'
      },
      arrival: {
        location: 'Boston South Station',
        time: '13:30',
        date: '2025-07-16'
      },
      price: 125,
      status: 'confirmed',
      duration: '4h 15m',
      trainOperator: 'Amtrak',
      class: 'Business'
    }
  ]);

  const [cartItems] = useState<CartItem[]>([
    {
      id: 'cart-1',
      type: 'flight',
      title: 'Return Flight',
      price: 612,
      departure: {
        location: 'Boston Logan (BOS)',
        time: '16:20',
        date: '2025-07-20'
      },
      arrival: {
        location: 'London Heathrow (LHR)',
        time: '06:30',
        date: '2025-07-21'
      }
    }
  ]);

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

    fetchTrip();
  }, [id]);

  const handleAddBooking = (type: 'flight' | 'rail') => {
    const tab = type === 'flight' ? 'flights' : 'rail';
    navigate(`/book?tab=${tab}&tripId=${id}`);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getTypeIcon = (type: string) => {
    if (type === 'flight') {
      return (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
        </svg>
      );
    }
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

  const totalCart = cartItems.reduce((sum, item) => sum + item.price, 0);

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

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
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
                {bookings.length === 0 ? (
                  <div className="text-center py-8">
                    <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                    </svg>
                    <h3 className="mt-2 text-sm font-medium text-gray-900">No bookings yet</h3>
                    <p className="mt-1 text-sm text-gray-500">Get started by adding your first booking.</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {bookings.map((booking) => (
                      <div key={booking.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                        <div className="flex items-start justify-between">
                          <div className="flex items-start space-x-3">
                            <div className="flex-shrink-0 mt-1">
                              {getTypeIcon(booking.type)}
                            </div>
                            <div className="flex-1">
                              <div className="flex items-center space-x-2 mb-2">
                                <h3 className="text-sm font-medium text-gray-900">{booking.title}</h3>
                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(booking.status)}`}>
                                  {booking.status}
                                </span>
                              </div>
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                                <div>
                                  <p className="text-gray-900 font-medium">{booking.departure.location}</p>
                                  <p className="text-gray-600">{booking.departure.time} • {new Date(booking.departure.date).toLocaleDateString()}</p>
                                </div>
                                <div>
                                  <p className="text-gray-900 font-medium">{booking.arrival.location}</p>
                                  <p className="text-gray-600">{booking.arrival.time} • {new Date(booking.arrival.date).toLocaleDateString()}</p>
                                </div>
                              </div>
                              <div className="mt-2 flex items-center space-x-4 text-xs text-gray-500">
                                {booking.duration && <span>Duration: {booking.duration}</span>}
                                {booking.airline && <span>Airline: {booking.airline}</span>}
                                {booking.trainOperator && <span>Operator: {booking.trainOperator}</span>}
                                <span>Class: {booking.class}</span>
                              </div>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-lg font-semibold text-gray-900">£{booking.price}</p>
                            <button className="text-sm text-blue-600 hover:text-blue-700 mt-1">
                              View Details
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Cart Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg border border-gray-200 shadow-sm sticky top-8">
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900">Cart</h2>
              </div>

              <div className="p-6">
                {cartItems.length === 0 ? (
                  <div className="text-center py-8">
                    <svg className="mx-auto h-8 w-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4m2.6 8L6 4H4m3 9h10a1 1 0 010 2H7a1 1 0 01-1-1V7H4" />
                    </svg>
                    <p className="mt-2 text-sm text-gray-500">Your cart is empty</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {cartItems.map((item) => (
                      <div key={item.id} className="border border-gray-200 rounded-lg p-3">
                        <div className="flex items-start justify-between">
                          <div className="flex items-start space-x-2">
                            <div className="flex-shrink-0 mt-1">
                              {getTypeIcon(item.type)}
                            </div>
                            <div className="flex-1">
                              <h4 className="text-sm font-medium text-gray-900">{item.title}</h4>
                              <p className="text-xs text-gray-600 mt-1">
                                {item.departure.location} → {item.arrival.location}
                              </p>
                              <p className="text-xs text-gray-500">
                                {new Date(item.departure.date).toLocaleDateString()}
                              </p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-sm font-semibold text-gray-900">£{item.price}</p>
                            <button className="text-xs text-red-600 hover:text-red-700 mt-1">
                              Remove
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}

                    <div className="border-t border-gray-200 pt-4">
                      <div className="flex justify-between items-center mb-4">
                        <span className="text-base font-medium text-gray-900">Total</span>
                        <span className="text-lg font-bold text-gray-900">£{totalCart}</span>
                      </div>
                      <button className="w-full bg-blue-600 text-white rounded-lg py-2 px-4 font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
                        Proceed to Checkout
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default TripDetailPage;