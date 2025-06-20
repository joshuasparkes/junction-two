import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getTrips, deleteTrip } from '../../services/tripService';
import { Trip } from '../../lib/supabase';
import Layout from '../common/Layout';
import { useAuth } from '../../contexts/AuthContext';

const TripList: React.FC = () => {
  const { currentOrganization } = useAuth();
  const [trips, setTrips] = useState<Trip[]>([]);
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    const fetchTrips = async () => {
      // Only fetch trips if an organization is selected
      if (!currentOrganization) {
        setTrips([]);
        return;
      }

      setLoading(true);
      try {
        const tripData = await getTrips(undefined, currentOrganization.id);
        setTrips(tripData);
        console.log(`Loaded ${tripData.length} trips for organization: ${currentOrganization.name}`);
      } catch (err) {
        console.error('Failed to fetch trips:', err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchTrips();
  }, [currentOrganization]); // Re-fetch when organization changes

  const handleDeleteTrip = async (id: string) => {
    try {
      await deleteTrip(id);
      setTrips(trips.filter(trip => trip.id !== id));
    } catch (err) {
      console.error('Failed to delete trip:', err);
    }
  };

  if (loading) return (
    <Layout>
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        <span className="ml-3 text-lg text-gray-600">Loading trips...</span>
      </div>
    </Layout>
  );

  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              {currentOrganization ? `${currentOrganization.name} Trips` : 'My Trips'}
            </h1>
            {currentOrganization && (
              <p className="text-sm text-gray-600">
                Your role: <span className="capitalize font-medium">{currentOrganization.role}</span>
              </p>
            )}
          </div>
          <Link
            to="/plan-trip"
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            New Trip
          </Link>
        </div>

        {!currentOrganization ? (
          <div className="text-center py-12">
            <div className="mx-auto h-16 w-16 bg-yellow-100 rounded-full flex items-center justify-center mb-4">
              <svg className="h-8 w-8 text-yellow-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-4m-5 0H3m2 0h4M9 7h6m-6 4h6m-6 4h6" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">Select an organization</h3>
            <p className="text-gray-600 mb-6">
              Choose an organization from the sidebar to view and manage trips.
            </p>
          </div>
        ) : trips.length === 0 ? (
          <div className="text-center py-12">
            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
            <h3 className="mt-2 text-sm font-medium text-gray-900">No trips found</h3>
            <p className="mt-1 text-sm text-gray-500">Get started by creating your first trip!</p>
            <div className="mt-6">
              <Link
                to="/plan-trip"
                className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Create Trip
              </Link>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {trips.map((trip) => (
              <div key={trip.id} className="bg-white rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-shadow duration-200">
                <Link to={`/trips/${trip.id}`} className="block p-6 hover:bg-gray-50">
                  {/* Header with title and status */}
                  <div className="flex items-start justify-between mb-4">
                    <h3 className="text-lg font-semibold text-gray-900 truncate pr-2">
                      {trip.name || 'Untitled Trip'}
                    </h3>
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 whitespace-nowrap">
                      Active
                    </span>
                  </div>

                  {/* Trip details */}
                  <div className="space-y-2 mb-6">
                    <p className="text-sm text-gray-600">
                      Created on {trip.created_at ? new Date(trip.created_at).toLocaleDateString() : 'Unknown date'}
                    </p>
                    <p className="text-sm text-gray-900 font-medium">
                      {trip.start_date && trip.end_date 
                        ? `${new Date(trip.start_date).toLocaleDateString()} - ${new Date(trip.end_date).toLocaleDateString()}`
                        : 'Dates not set'
                      }
                    </p>
                  </div>

                </Link>
                
                {/* Action buttons - Outside of the main link to prevent nested clicks */}
                <div className="px-6 pb-4">
                  <div className="flex items-center justify-end space-x-2">
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        if (trip.id) handleDeleteTrip(trip.id);
                      }}
                      className="inline-flex items-center px-3 py-1.5 border border-red-300 shadow-sm text-xs font-medium rounded text-red-700 bg-white hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors"
                    >
                      <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
};

export default TripList;
