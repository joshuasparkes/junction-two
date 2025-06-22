import React, { useState, useMemo } from 'react';
import type { Trip } from '../../lib/supabase';

interface TripManagementProps {
  trips: Trip[];
  loading: boolean;
  error: string | null;
  currentOrganization: any;
}

const TripManagement: React.FC<TripManagementProps> = ({
  trips,
  loading,
  error,
  currentOrganization
}) => {
  const [activeTab, setActiveTab] = useState<'upcoming' | 'past'>('upcoming');
  const [searchQuery, setSearchQuery] = useState('');

  // Filter trips by upcoming/past and search query
  const { upcomingTrips, pastTrips } = useMemo(() => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    const upcoming: Trip[] = [];
    const past: Trip[] = [];

    trips.forEach(trip => {
      if (!trip.start_date) return; // Skip trips without start date
      
      const startDate = new Date(trip.start_date);
      if (startDate >= today) {
        upcoming.push(trip);
      } else {
        past.push(trip);
      }
    });

    return {
      upcomingTrips: upcoming.sort((a, b) => {
        const aDate = a.start_date ? new Date(a.start_date).getTime() : 0;
        const bDate = b.start_date ? new Date(b.start_date).getTime() : 0;
        return aDate - bDate;
      }),
      pastTrips: past.sort((a, b) => {
        const aDate = a.start_date ? new Date(a.start_date).getTime() : 0;
        const bDate = b.start_date ? new Date(b.start_date).getTime() : 0;
        return bDate - aDate;
      })
    };
  }, [trips]);

  // Filter by search query
  const filteredTrips = useMemo(() => {
    const tripsToFilter = activeTab === 'upcoming' ? upcomingTrips : pastTrips;
    
    if (!searchQuery.trim()) {
      return tripsToFilter;
    }
    
    const query = searchQuery.toLowerCase();
    return tripsToFilter.filter(trip => 
      trip.name?.toLowerCase().includes(query) || false
    );
  }, [upcomingTrips, pastTrips, activeTab, searchQuery]);

  const formatDate = (dateString: string | undefined) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatDateRange = (startDate: string | undefined, endDate: string | undefined) => {
    const start = formatDate(startDate);
    const end = formatDate(endDate);
    return `${start} - ${end}`;
  };

  const calculateDuration = (startDate: string | undefined, endDate: string | undefined) => {
    if (!startDate || !endDate) return 'N/A';
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diffTime = Math.abs(end.getTime() - start.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
    return `${diffDays} day${diffDays !== 1 ? 's' : ''}`;
  };

  return (
    <div>
      <div className="mb-8">
        <h2 className="title-text font-normal text-chatgpt-text-primary mb-1">
          Trip Management
        </h2>
        <p className="content-text text-chatgpt-text-secondary">
          View and manage all trips for your organization.
        </p>
        {currentOrganization && (
          <p className="sidebar-text text-gray-500 mt-1">
            {currentOrganization.name} • {trips.length} trip{trips.length !== 1 ? 's' : ''} total
          </p>
        )}
        {error && (
          <div className="mt-4 bg-red-50 border border-red-200 rounded-md p-3">
            <p className="sidebar-text text-red-700">{error}</p>
          </div>
        )}
      </div>

      {/* Loading State */}
      {loading ? (
        <div className="bg-white rounded-lg shadow-sm p-8 text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading trips...</p>
        </div>
      ) : !currentOrganization ? (
        <div className="bg-white rounded-lg shadow-sm p-8 text-center">
          <div className="mx-auto h-12 w-12 bg-yellow-100 rounded-full flex items-center justify-center mb-4">
            <svg className="h-6 w-6 text-yellow-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">Select an organization</h3>
          <p className="text-gray-600">Please select an organization to view its trips.</p>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Tab Navigation */}
          <div className="flex items-center justify-between">
            <div className="flex space-x-1 bg-gray-100 rounded-lg p-1">
              <button
                onClick={() => setActiveTab('upcoming')}
                className={`px-4 py-2 rounded-md transition-colors duration-200 ${
                  activeTab === 'upcoming'
                    ? 'bg-white text-chatgpt-text-primary shadow-sm'
                    : 'text-gray-600 hover:text-chatgpt-text-primary'
                }`}
              >
                <span className="content-text font-normal">
                  Upcoming ({upcomingTrips.length})
                </span>
              </button>
              <button
                onClick={() => setActiveTab('past')}
                className={`px-4 py-2 rounded-md transition-colors duration-200 ${
                  activeTab === 'past'
                    ? 'bg-white text-chatgpt-text-primary shadow-sm'
                    : 'text-gray-600 hover:text-chatgpt-text-primary'
                }`}
              >
                <span className="content-text font-normal">
                  Past ({pastTrips.length})
                </span>
              </button>
            </div>

            {/* Search Bar */}
            <div className="flex items-center space-x-3">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg className="h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
                <input
                  type="text"
                  placeholder="Search trips..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="chatgpt-input pl-9 w-64"
                />
              </div>
              {searchQuery && (
                <span className="sidebar-text text-gray-500">
                  {filteredTrips.length} of {activeTab === 'upcoming' ? upcomingTrips.length : pastTrips.length} trips
                </span>
              )}
            </div>
          </div>

          {/* Trips List */}
          {filteredTrips.length === 0 ? (
            <div className="bg-white border border-gray-200 rounded-lg p-8 text-center">
              <div className="mx-auto h-12 w-12 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                <svg className="h-6 w-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="content-text font-normal text-gray-900 mb-2">
                {searchQuery ? 'No matching trips found' : `No ${activeTab} trips`}
              </h3>
              <p className="sidebar-text text-gray-600">
                {searchQuery 
                  ? `No trips match "${searchQuery}". Try a different search term.`
                  : `No ${activeTab} trips found for this organization.`
                }
              </p>
            </div>
          ) : (
            <div className="bg-white border border-gray-200 rounded-lg p-3">
              <div className="space-y-0">
                {filteredTrips.map((trip) => (
                  <div key={trip.id} className="p-3 rounded-md hover:bg-gray-50 transition-colors duration-200">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h4 className="content-text font-normal text-chatgpt-text-primary mb-1">
                          {trip.name || 'Unnamed Trip'}
                        </h4>
                        <p className="sidebar-text text-chatgpt-text-secondary mb-2">
                          {formatDateRange(trip.start_date, trip.end_date)} • {calculateDuration(trip.start_date, trip.end_date)}
                        </p>
                        <div className="flex items-center space-x-3">
                          <span className={`inline-flex items-center px-2 py-1 rounded-full sidebar-text font-normal ${
                            activeTab === 'upcoming' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-700'
                          }`}>
                            {activeTab === 'upcoming' ? 'Upcoming' : 'Completed'}
                          </span>
                          <span className="sidebar-text text-gray-500">
                            {trip.bookings_ids?.length || 0} booking{(trip.bookings_ids?.length || 0) !== 1 ? 's' : ''}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2 ml-4">
                        <button className="sidebar-text text-blue-600 hover:text-blue-700 transition-colors duration-200">
                          View Details
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default TripManagement;