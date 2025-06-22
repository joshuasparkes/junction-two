import React, { useState, useMemo, useEffect } from 'react';

interface Booking {
  id: string;
  created_at: string;
  total_amount: string;
  currency: string;
  org_id: string;
  vertical?: string;
  booking_date?: string;
}

interface ReportingManagementProps {
  bookings: Booking[];
  loading: boolean;
  error: string | null;
  currentOrganization: any;
  activeSubTab: string;
  onLoadBookings: (startDate: string, endDate: string) => void;
}

const ReportingManagement: React.FC<ReportingManagementProps> = ({
  bookings,
  loading,
  error,
  currentOrganization,
  activeSubTab,
  onLoadBookings
}) => {
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  // Set default date range (last 30 days)
  useEffect(() => {
    const today = new Date();
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(today.getDate() - 30);
    
    setStartDate(thirtyDaysAgo.toISOString().split('T')[0]);
    setEndDate(today.toISOString().split('T')[0]);
  }, []);

  // Load bookings when dates change
  useEffect(() => {
    if (startDate && endDate && currentOrganization) {
      onLoadBookings(startDate, endDate);
    }
  }, [startDate, endDate, currentOrganization, onLoadBookings]);

  // Filter bookings by vertical and calculate totals
  const { trainSpend, airSpend, trainBookings, airBookings } = useMemo(() => {
    console.log('🚂 Processing bookings for reporting:', bookings);
    console.log('🚂 Bookings with vertical field:', bookings.map(b => ({ id: b.id, vertical: b.vertical })));
    
    const train = bookings.filter(booking => booking.vertical === 'rail' || booking.vertical === 'train');
    const air = bookings.filter(booking => booking.vertical === 'air');
    
    console.log('🚂 Filtered train bookings:', train);
    console.log('🚂 Filtered air bookings:', air);
    
    const trainTotal = train.reduce((sum, booking) => {
      return sum + parseFloat(booking.total_amount || '0');
    }, 0);
    
    const airTotal = air.reduce((sum, booking) => {
      return sum + parseFloat(booking.total_amount || '0');
    }, 0);
    
    return {
      trainSpend: trainTotal,
      airSpend: airTotal,
      trainBookings: train,
      airBookings: air
    };
  }, [bookings]);

  const formatCurrency = (amount: number, currency: string = 'USD') => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const currentData = activeSubTab === 'train' ? trainBookings : airBookings;
  const currentSpend = activeSubTab === 'train' ? trainSpend : airSpend;
  const verticalName = activeSubTab === 'train' ? 'Train' : 'Air';

  return (
    <div>
      <div className="mb-8">
        <h2 className="title-text font-normal text-chatgpt-text-primary mb-1">
          Reporting
        </h2>
        <p className="content-text text-chatgpt-text-secondary">
          View spending reports and analytics for your organization.
        </p>
        {currentOrganization && (
          <p className="sidebar-text text-gray-500 mt-1">
            {currentOrganization.name} • {bookings.length} booking{bookings.length !== 1 ? 's' : ''} in date range
          </p>
        )}
        {error && (
          <div className="mt-4 bg-red-50 border border-red-200 rounded-md p-3">
            <p className="sidebar-text text-red-700">{error}</p>
          </div>
        )}
      </div>

      {!currentOrganization ? (
        <div className="bg-white rounded-lg shadow-sm p-8 text-center">
          <div className="mx-auto h-12 w-12 bg-yellow-100 rounded-full flex items-center justify-center mb-4">
            <svg className="h-6 w-6 text-yellow-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">Select an organization</h3>
          <p className="text-gray-600">Please select an organization to view its reports.</p>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Date Range Picker */}
          <div className="bg-white border border-gray-200 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <h3 className="content-text font-normal text-chatgpt-text-primary">Date Range</h3>
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <label className="sidebar-text text-gray-600">From:</label>
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="chatgpt-input"
                  />
                </div>
                <div className="flex items-center space-x-2">
                  <label className="sidebar-text text-gray-600">To:</label>
                  <input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="chatgpt-input"
                  />
                </div>
              </div>
            </div>
          </div>


          {/* Spend Summary */}
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <div className="text-center">
              <h3 className="title-text font-normal text-chatgpt-text-primary mb-2">
                {verticalName} Spend
              </h3>
              <div className="text-4xl font-bold text-chatgpt-text-primary mb-2">
                {formatCurrency(currentSpend)}
              </div>
              <p className="sidebar-text text-chatgpt-text-secondary">
                {currentData.length} booking{currentData.length !== 1 ? 's' : ''} from {formatDate(startDate)} to {formatDate(endDate)}
              </p>
            </div>
          </div>

          {/* Loading State */}
          {loading ? (
            <div className="bg-white rounded-lg shadow-sm p-8 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Loading booking data...</p>
            </div>
          ) : currentData.length === 0 ? (
            <div className="bg-white border border-gray-200 rounded-lg p-8 text-center">
              <div className="mx-auto h-12 w-12 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                <svg className="h-6 w-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <h3 className="content-text font-normal text-gray-900 mb-2">
                No {verticalName.toLowerCase()} bookings found
              </h3>
              <p className="sidebar-text text-gray-600">
                No {verticalName.toLowerCase()} bookings found in the selected date range.
              </p>
            </div>
          ) : (
            /* Bookings List */
            <div className="bg-white border border-gray-200 rounded-lg p-3">
              <div className="space-y-0">
                <div className="p-3 border-b border-gray-100">
                  <h4 className="content-text font-normal text-chatgpt-text-primary">
                    Recent {verticalName} Bookings
                  </h4>
                </div>
                {currentData.slice(0, 10).map((booking) => (
                  <div key={booking.id} className="p-3 rounded-md hover:bg-gray-50 transition-colors duration-200">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h4 className="content-text font-normal text-chatgpt-text-primary mb-1">
                          Booking #{booking.id.slice(-8)}
                        </h4>
                        <p className="sidebar-text text-chatgpt-text-secondary mb-2">
                          {formatDate(booking.booking_date || booking.created_at)}
                        </p>
                        <div className="flex items-center space-x-3">
                          <span className="inline-flex items-center px-2 py-1 rounded-full sidebar-text font-normal bg-blue-100 text-blue-700 capitalize">
                            {booking.vertical || 'Unknown'}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2 ml-4">
                        <span className="content-text font-semibold text-chatgpt-text-primary">
                          {formatCurrency(parseFloat(booking.total_amount || '0'), booking.currency)}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
                {currentData.length > 10 && (
                  <div className="p-3 text-center border-t border-gray-100">
                    <p className="sidebar-text text-gray-500">
                      Showing 10 of {currentData.length} bookings
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ReportingManagement;