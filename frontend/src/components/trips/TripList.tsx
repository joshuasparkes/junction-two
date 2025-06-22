import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getTrips, deleteTrip } from '../../services/tripService';
import { Trip } from '../../lib/supabase';
import Layout from '../common/Layout';
import OrgSelector from '../common/OrgSelector';
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
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Org Selector */}
        <div className="mb-6">
          <OrgSelector />
        </div>
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8">
          <div>
            <h1 className="title-text font-normal text-chatgpt-text-primary mb-2">
              {currentOrganization ? `${currentOrganization.name} Trips` : 'My Trips'}
            </h1>
            {currentOrganization && (
              <p className="content-text text-chatgpt-text-secondary">
                Your role: <span className="capitalize font-normal">{currentOrganization.role}</span>
              </p>
            )}
          </div>
          <Link
            to="/plan-trip"
            className="chatgpt-primary-button inline-flex items-center justify-center"
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
                className="chatgpt-primary-button inline-flex items-center justify-center"
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Create Trip
              </Link>
            </div>
          </div>
        ) : (
          <div className="bg-white border border-gray-200 rounded-lg p-3">
            <div className="space-y-0">
              {trips.map((trip) => (
                <div key={trip.id} className="p-3 rounded-md hover:bg-gray-50 transition-colors duration-200">
                  <Link to={`/trips/${trip.id}`} className="block">
                    <div className="flex items-start justify-between mb-1">
                      <h3 className="content-text font-normal text-chatgpt-text-primary">
                        {trip.name || 'Untitled Trip'}
                      </h3>
                      <span className="inline-flex items-center px-2 py-1 rounded-full sidebar-text bg-green-100 text-green-700 whitespace-nowrap">
                        Active
                      </span>
                    </div>
                    
                    <p className="sidebar-text text-chatgpt-text-secondary mb-2">
                      {trip.start_date && trip.end_date 
                        ? `${new Date(trip.start_date).toLocaleDateString()} - ${new Date(trip.end_date).toLocaleDateString()}`
                        : 'Dates not set'
                      }
                    </p>
                    
                    <div className="flex items-center justify-between">
                      <p className="sidebar-text text-gray-500">
                        Created {trip.created_at ? new Date(trip.created_at).toLocaleDateString() : 'Unknown date'}
                      </p>
                      <button
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          if (trip.id) handleDeleteTrip(trip.id);
                        }}
                        className="sidebar-text text-red-600 hover:text-red-700 transition-colors duration-200"
                      >
                        Delete
                      </button>
                    </div>
                  </Link>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default TripList;
