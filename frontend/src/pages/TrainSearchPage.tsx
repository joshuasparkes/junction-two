import React, { useState } from 'react';
import Layout from '../components/common/Layout';
import PlaceSearchInput from '../components/travel/PlaceSearchInput';
import { Place } from '../services/placesService';

interface TrainSearchForm {
  origin: Place | null;
  destination: Place | null;
  departureDate: string;
  returnDate: string;
  passengers: number;
  tripType: 'one-way' | 'round-trip';
}

const TrainSearchPage: React.FC = () => {
  const [searchForm, setSearchForm] = useState<TrainSearchForm>({
    origin: null,
    destination: null,
    departureDate: '',
    returnDate: '',
    passengers: 1,
    tripType: 'one-way'
  });

  const [isSearching, setIsSearching] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Handle form field changes
  const handleFormChange = (field: keyof TrainSearchForm, value: any) => {
    setSearchForm(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ''
      }));
    }
  };

  // Swap origin and destination
  const handleSwapPlaces = () => {
    setSearchForm(prev => ({
      ...prev,
      origin: prev.destination,
      destination: prev.origin
    }));
  };

  // Validate form
  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!searchForm.origin) {
      newErrors.origin = 'Please select an origin station';
    }

    if (!searchForm.destination) {
      newErrors.destination = 'Please select a destination station';
    }

    if (searchForm.origin && searchForm.destination && searchForm.origin.id === searchForm.destination.id) {
      newErrors.destination = 'Origin and destination cannot be the same';
    }

    if (!searchForm.departureDate) {
      newErrors.departureDate = 'Please select a departure date';
    }

    if (searchForm.tripType === 'round-trip' && !searchForm.returnDate) {
      newErrors.returnDate = 'Please select a return date';
    }

    if (searchForm.departureDate && searchForm.returnDate && searchForm.returnDate < searchForm.departureDate) {
      newErrors.returnDate = 'Return date cannot be before departure date';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle search submission
  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsSearching(true);
    
    try {
      // TODO: Implement actual train search API call
      console.log('Searching for trains with:', searchForm);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // For now, just show an alert
      alert(`Searching for trains from ${searchForm.origin?.name} to ${searchForm.destination?.name}`);
      
    } catch (error) {
      console.error('Search failed:', error);
      alert('Search failed. Please try again.');
    } finally {
      setIsSearching(false);
    }
  };

  // Get minimum date (today)
  const getMinDate = () => {
    return new Date().toISOString().split('T')[0];
  };

  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50">
        {/* Header */}
        <div className="bg-gradient-to-r from-green-600 to-blue-600 text-white py-16">
          <div className="max-w-4xl mx-auto px-6 text-center">
            <h1 className="text-4xl font-bold mb-4">Train Travel Search</h1>
            <p className="text-xl text-green-100">Find and book train tickets across Europe</p>
          </div>
        </div>

        {/* Search Form */}
        <div className="max-w-4xl mx-auto px-6 py-12">
          <div className="bg-white rounded-2xl shadow-xl p-8">
            <form onSubmit={handleSearch} className="space-y-6">
              {/* Trip Type */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">Trip Type</label>
                <div className="flex space-x-4">
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="tripType"
                      value="one-way"
                      checked={searchForm.tripType === 'one-way'}
                      onChange={(e) => handleFormChange('tripType', e.target.value)}
                      className="mr-2 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-gray-700">One-way</span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="tripType"
                      value="round-trip"
                      checked={searchForm.tripType === 'round-trip'}
                      onChange={(e) => handleFormChange('tripType', e.target.value)}
                      className="mr-2 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-gray-700">Round-trip</span>
                  </label>
                </div>
              </div>

              {/* Origin and Destination */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="relative">
                  <PlaceSearchInput
                    label="From"
                    placeholder="Enter departure station..."
                    value={searchForm.origin}
                    onChange={(place) => handleFormChange('origin', place)}
                    searchType="railway-station"
                    required
                  />
                  {errors.origin && (
                    <p className="mt-1 text-sm text-red-600">{errors.origin}</p>
                  )}
                </div>

                <div className="relative">
                  <PlaceSearchInput
                    label="To"
                    placeholder="Enter destination station..."
                    value={searchForm.destination}
                    onChange={(place) => handleFormChange('destination', place)}
                    searchType="railway-station"
                    required
                  />
                  {errors.destination && (
                    <p className="mt-1 text-sm text-red-600">{errors.destination}</p>
                  )}
                </div>

                {/* Swap button */}
                <div className="lg:absolute lg:left-1/2 lg:top-8 lg:transform lg:-translate-x-1/2 lg:z-10 flex justify-center lg:justify-start">
                  <button
                    type="button"
                    onClick={handleSwapPlaces}
                    className="bg-white border-2 border-gray-300 rounded-full p-2 hover:border-blue-500 hover:text-blue-600 transition-colors shadow-sm"
                    title="Swap origin and destination"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                    </svg>
                  </button>
                </div>
              </div>

              {/* Dates */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Departure Date <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    value={searchForm.departureDate}
                    min={getMinDate()}
                    onChange={(e) => handleFormChange('departureDate', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  {errors.departureDate && (
                    <p className="mt-1 text-sm text-red-600">{errors.departureDate}</p>
                  )}
                </div>

                {searchForm.tripType === 'round-trip' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Return Date <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="date"
                      value={searchForm.returnDate}
                      min={searchForm.departureDate || getMinDate()}
                      onChange={(e) => handleFormChange('returnDate', e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                    {errors.returnDate && (
                      <p className="mt-1 text-sm text-red-600">{errors.returnDate}</p>
                    )}
                  </div>
                )}
              </div>

              {/* Passengers */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Passengers</label>
                  <select
                    value={searchForm.passengers}
                    onChange={(e) => handleFormChange('passengers', parseInt(e.target.value))}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(num => (
                      <option key={num} value={num}>
                        {num} {num === 1 ? 'Passenger' : 'Passengers'}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Search Button */}
              <div className="pt-6">
                <button
                  type="submit"
                  disabled={isSearching}
                  className="w-full bg-gradient-to-r from-green-600 to-blue-600 text-white py-4 px-8 rounded-lg font-semibold text-lg hover:from-green-700 hover:to-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                >
                  {isSearching ? (
                    <div className="flex items-center justify-center">
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white mr-3"></div>
                      Searching Trains...
                    </div>
                  ) : (
                    <div className="flex items-center justify-center">
                      <svg className="w-6 h-6 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                      </svg>
                      Search Trains
                    </div>
                  )}
                </button>
              </div>
            </form>
          </div>

          {/* Features */}
          <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Real-time Search</h3>
              <p className="text-gray-600">Search across multiple train operators for the best routes and prices.</p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Best Prices</h3>
              <p className="text-gray-600">Compare prices from different operators to find the best deals.</p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Secure Booking</h3>
              <p className="text-gray-600">Safe and secure booking process with instant confirmation.</p>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default TrainSearchPage;