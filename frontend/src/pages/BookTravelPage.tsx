import React, { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import Layout from "../components/common/Layout";
import OrgSelector from "../components/common/OrgSelector";
import PlaceSearchInput from "../components/travel/PlaceSearchInput";
import { Place } from "../services/placesService";
import { searchTrains, getReturnOffers, TrainOffer, formatTime, formatDate, formatDuration, getTransferCount } from "../services/trainService";

const BookTravelPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("rail");
  const [tripType, setTripType] = useState("roundtrip");
  const [classType, setClassType] = useState("economy");
  
  // Rail search state
  const [departureStation, setDepartureStation] = useState<Place | null>(null);
  const [arrivalStation, setArrivalStation] = useState<Place | null>(null);
  const [departureDate, setDepartureDate] = useState('');
  const [returnDate, setReturnDate] = useState('');
  const [passengers, setPassengers] = useState(1);
  
  // Search results state
  const [trainOffers, setTrainOffers] = useState<TrainOffer[]>([]);
  const [returnOffers, setReturnOffers] = useState<TrainOffer[]>([]);
  const [selectedOutboundOffer, setSelectedOutboundOffer] = useState<TrainOffer | null>(null);
  const [trainSearchId, setTrainSearchId] = useState<string | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [isLoadingReturn, setIsLoadingReturn] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);
  const [hasSearched, setHasSearched] = useState(false);
  const [showReturnOptions, setShowReturnOptions] = useState(false);
  const [currentView, setCurrentView] = useState<'outbound' | 'return'>('outbound');

  // Get initial tab from URL params
  useEffect(() => {
    const tab = searchParams.get('tab');
    if (tab && (tab === 'flights' || tab === 'rail')) {
      setActiveTab(tab);
    }
  }, [searchParams]);

  // Handle train search
  const handleTrainSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!departureStation || !arrivalStation || !departureDate) {
      setSearchError('Please fill in all required fields');
      return;
    }

    if (tripType === 'roundtrip' && !returnDate) {
      setSearchError('Please select a return date for round trip');
      return;
    }

    setIsSearching(true);
    setSearchError(null);
    setHasSearched(false);

    try {
      const searchRequest = {
        origin: departureStation.id,
        destination: arrivalStation.id,
        departureDate,
        passengers: Array(passengers).fill({ type: 'adult' }),
        ...(tripType === 'roundtrip' && returnDate ? { returnDate } : {})
      };

      const results = await searchTrains(searchRequest);
      setTrainOffers(results.items);
      setTrainSearchId(results.train_search_id || null);
      setHasSearched(true);
      
      // Reset return trip state
      setReturnOffers([]);
      setSelectedOutboundOffer(null);
      setShowReturnOptions(false);
      setCurrentView('outbound');
      
      if (results.message) {
        setSearchError(results.message);
      }
    } catch (error) {
      console.error('Train search failed:', error);
      setSearchError(error instanceof Error ? error.message : 'Search failed');
      setTrainOffers([]);
    } finally {
      setIsSearching(false);
    }
  };

  // Handle selecting an outbound offer for return trips
  const handleSelectOutbound = async (offer: TrainOffer) => {
    if (tripType !== 'roundtrip' || !trainSearchId) {
      return;
    }

    setIsLoadingReturn(true);
    setSelectedOutboundOffer(offer);
    setSearchError(null);

    try {
      const returnResults = await getReturnOffers(trainSearchId, offer.id);
      setReturnOffers(returnResults.items);
      setShowReturnOptions(true);
      setCurrentView('return');
      
      if (returnResults.message) {
        setSearchError(returnResults.message);
      }
    } catch (error) {
      console.error('Failed to get return offers:', error);
      setSearchError(error instanceof Error ? error.message : 'Failed to load return options');
      setReturnOffers([]);
    } finally {
      setIsLoadingReturn(false);
    }
  };

  // Handle going back to outbound options
  const handleBackToOutbound = () => {
    setCurrentView('outbound');
    setShowReturnOptions(false);
    setSearchError(null);
  };

  // Handle booking navigation
  const handleBookTrain = (offer: TrainOffer, isReturn: boolean = false) => {
    navigate('/traveler-details', {
      state: {
        offer,
        isReturn,
        passengerCount: passengers
      }
    });
  };

  return (
    <Layout>
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Org Selector */}
        <div className="mb-6">
          <OrgSelector />
        </div>
        
        <h1 className="title-text font-normal text-chatgpt-text-primary mb-8">
          Search for {activeTab === 'flights' ? 'Flights' : 'Rail Travel'}
        </h1>

        {/* Tab Navigation */}
        <div className="mb-6">
          <div className="inline-flex p-1 bg-gray-200 rounded-full">
            <button
              onClick={() => setActiveTab('flights')}
              className={`px-4 py-2 rounded-full font-normal content-text transition-all duration-200 relative flex items-center ${
                activeTab === 'flights'
                  ? 'bg-white text-gray-900 shadow-sm z-10'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
              </svg>
              Flights
            </button>
            <button
              onClick={() => setActiveTab('rail')}
              className={`px-4 py-2 rounded-full font-normal content-text transition-all duration-200 relative flex items-center ${
                activeTab === 'rail'
                  ? 'bg-white text-gray-900 shadow-sm z-10'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 01.553-.894L9 2l6 3 6-3v15l-6 3-6-3z" />
              </svg>
              Rail
            </button>
          </div>
        </div>

        {/* Search Forms */}
        {activeTab === 'flights' && (
          <div className="bg-white rounded-lg shadow-sm py-6">
            <div className="mb-6">
              <div className="inline-flex p-1 bg-gray-200 rounded-full">
                <button
                  onClick={() => setTripType("roundtrip")}
                  className={`px-4 py-1 rounded-full font-normal content-text transition-all duration-200 relative ${
                    tripType === "roundtrip"
                      ? "bg-white text-gray-900 shadow-sm z-10"
                      : "text-gray-600 hover:text-gray-900"
                  }`}
                >
                  Roundtrip
                </button>
                <button
                  onClick={() => setTripType("oneway")}
                  className={`px-4 py-1 rounded-full font-normal content-text transition-all duration-200 relative ${
                    tripType === "oneway"
                      ? "bg-white text-gray-900 shadow-sm z-10"
                      : "text-gray-600 hover:text-gray-900"
                  }`}
                >
                  One way
                </button>
                <button
                  onClick={() => setTripType("multicity")}
                  className={`px-4 py-1 rounded-full font-normal content-text transition-all duration-200 relative ${
                    tripType === "multicity"
                      ? "bg-white text-gray-900 shadow-sm z-10"
                      : "text-gray-600 hover:text-gray-900"
                  }`}
                >
                  Multi-city
                </button>
              </div>

            <div className="ml-auto flex items-center space-x-4">
              <select
                value={classType}
                onChange={(e) => setClassType(e.target.value)}
                className="chatgpt-select"
              >
                <option value="economy">Economy</option>
                <option value="premium">Premium Economy</option>
                <option value="business">Business</option>
                <option value="first">First Class</option>
              </select>

              <label className="flex items-center text-sm text-gray-600">
                <input type="checkbox" className="mr-2 rounded" />
                Direct flights only
              </label>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="relative">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <svg
                  className="w-4 h-4 inline mr-1"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
                  />
                </svg>
                Where from?
              </label>
              <input
                type="text"
                placeholder="Enter departure city"
                className="chatgpt-input w-full"
              />
            </div>

            <div className="relative">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <svg
                  className="w-4 h-4 inline mr-1"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                  />
                </svg>
                Where to?
              </label>
              <input
                type="text"
                placeholder="Enter destination city"
                className="chatgpt-input w-full"
              />
              <button className="absolute right-3 top-8 p-1">
                <svg
                  className="w-4 h-4 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4"
                  />
                </svg>
              </button>
            </div>

            <div className="relative">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <svg
                  className="w-4 h-4 inline mr-1"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8 7V3a2 2 0 012-2h4a2 2 0 012 2v4m-6 0h6m-6 0a2 2 0 00-2 2v10a2 2 0 002 2h6a2 2 0 002-2V9a2 2 0 00-2-2"
                  />
                </svg>
                Depart date
              </label>
              <input
                type="date"
                className="chatgpt-input w-full"
              />
            </div>

            {tripType === "roundtrip" && (
              <div className="relative">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <svg
                    className="w-4 h-4 inline mr-1"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M8 7V3a2 2 0 012-2h4a2 2 0 012 2v4m-6 0h6m-6 0a2 2 0 00-2 2v10a2 2 0 002 2h6a2 2 0 002-2V9a2 2 0 00-2-2"
                    />
                  </svg>
                  Return date
                </label>
                <input
                  type="date"
                  className="chatgpt-input w-full"
                />
              </div>
            )}
          </div>

          <div className="flex items-center justify-between">
            <div className="relative">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <svg
                  className="w-4 h-4 inline mr-1"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                  />
                </svg>
                1 Adult
              </label>
              <select className="chatgpt-select">
                <option>1 Adult</option>
                <option>2 Adults</option>
                <option>3 Adults</option>
                <option>4+ Adults</option>
              </select>
            </div>

              <button className="chatgpt-primary-button">
                Search flights
              </button>
            </div>
          </div>
        )}

        {/* Rail Search Form */}
        {activeTab === 'rail' && (
          <div className="bg-white rounded-lg shadow-sm py-6">
            <div className="mb-6">
              <div className="inline-flex p-1 bg-gray-200 rounded-full">
                <button
                  onClick={() => setTripType("roundtrip")}
                  className={`px-4 py-1 rounded-full font-normal content-text transition-all duration-200 relative ${
                    tripType === "roundtrip"
                      ? "bg-white text-gray-900 shadow-sm z-10"
                      : "text-gray-600 hover:text-gray-900"
                  }`}
                >
                  Return
                </button>
                <button
                  onClick={() => setTripType("oneway")}
                  className={`px-4 py-1 rounded-full font-normal content-text transition-all duration-200 relative ${
                    tripType === "oneway"
                      ? "bg-white text-gray-900 shadow-sm z-10"
                      : "text-gray-600 hover:text-gray-900"
                  }`}
                >
                  One way
                </button>
              </div>

              <div className="ml-auto flex items-center space-x-4">
                <select
                  value={classType}
                  onChange={(e) => setClassType(e.target.value)}
                  className="chatgpt-select"
                >
                  <option value="standard">Standard</option>
                  <option value="first">First Class</option>
                  <option value="business">Business</option>
                </select>

                <label className="flex items-center text-sm text-gray-600">
                  <input type="checkbox" className="mr-2 rounded" />
                  Direct routes only
                </label>
              </div>
            </div>

            <div className="flex items-end gap-4 mb-6">
              <div className="flex-1">
                <PlaceSearchInput
                  label="Departure station"
                  placeholder="Enter departure station"
                  value={departureStation}
                  onChange={setDepartureStation}
                  searchType="railway-station"
                  required
                />
              </div>

              {/* Switch Button */}
              <div className="pb-3">
                <button 
                  className="p-2 rounded-md hover:bg-gray-100 transition-colors"
                  onClick={() => {
                    const temp = departureStation;
                    setDepartureStation(arrivalStation);
                    setArrivalStation(temp);
                  }}
                  title="Swap stations"
                >
                  <svg className="w-5 h-5 text-gray-400 hover:text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                  </svg>
                </button>
              </div>

              <div className="flex-1">
                <PlaceSearchInput
                  label="Arrival station"
                  placeholder="Enter destination station"
                  value={arrivalStation}
                  onChange={setArrivalStation}
                  searchType="railway-station"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">

              <div className="relative">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <svg className="w-4 h-4 inline mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3a2 2 0 012-2h4a2 2 0 012 2v4m-6 0h6m-6 0a2 2 0 00-2 2v10a2 2 0 002 2h6a2 2 0 002-2V9a2 2 0 00-2-2" />
                  </svg>
                  Depart date <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  value={departureDate}
                  onChange={(e) => setDepartureDate(e.target.value)}
                  min={new Date().toISOString().split('T')[0]}
                  className="chatgpt-input w-full"
                />
              </div>

              {tripType === "roundtrip" && (
                <div className="relative">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <svg className="w-4 h-4 inline mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3a2 2 0 012-2h4a2 2 0 012 2v4m-6 0h6m-6 0a2 2 0 00-2 2v10a2 2 0 002 2h6a2 2 0 002-2V9a2 2 0 00-2-2" />
                    </svg>
                    Return date <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    value={returnDate}
                    onChange={(e) => setReturnDate(e.target.value)}
                    min={departureDate || new Date().toISOString().split('T')[0]}
                    className="chatgpt-input w-full"
                  />
                </div>
              )}
            </div>

            {/* Error message */}
            {searchError && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700">
                {searchError}
              </div>
            )}

            <form onSubmit={handleTrainSearch}>
              <div className="flex items-center justify-between">
                <div className="relative">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <svg className="w-4 h-4 inline mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                    Passengers
                  </label>
                  <select 
                    value={passengers}
                    onChange={(e) => setPassengers(parseInt(e.target.value))}
                    className="chatgpt-select"
                  >
                    <option value={1}>1 Adult</option>
                    <option value={2}>2 Adults</option>
                    <option value={3}>3 Adults</option>
                    <option value={4}>4 Adults</option>
                    <option value={5}>5 Adults</option>
                    <option value={6}>6 Adults</option>
                  </select>
                </div>

                <button 
                  type="submit"
                  disabled={isSearching}
                  className="chatgpt-primary-button"
                >
                  {isSearching ? (
                    <div className="flex items-center">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Searching...
                    </div>
                  ) : (
                    'Search trains'
                  )}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Train Search Results */}
        {activeTab === 'rail' && hasSearched && (
          <div className="mt-8 space-y-6">
            {/* Results Container */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              {/* Header with Back Button */}
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-gray-900">
                  {currentView === 'outbound' ? (
                    tripType === 'roundtrip' ? 'Outbound Journey' : 'Journey Options'
                  ) : (
                    'Return Journey'
                  )}
                  {((currentView === 'outbound' ? trainOffers : returnOffers).length > 0) && (
                    <span className="text-base font-normal text-gray-600 ml-2">
                      ({(currentView === 'outbound' ? trainOffers : returnOffers).length} option{(currentView === 'outbound' ? trainOffers : returnOffers).length !== 1 ? 's' : ''})
                    </span>
                  )}
                </h2>
                
                {/* Back Button for Return View */}
                {currentView === 'return' && (
                  <button
                    onClick={handleBackToOutbound}
                    className="flex items-center px-4 py-2 text-sm font-medium text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-colors"
                  >
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                    Back to outbound options
                  </button>
                )}
              </div>

              {/* Display current offers based on view */}
              {((currentView === 'outbound' ? trainOffers : returnOffers).length > 0) ? (
                <div className="space-y-4">
                  {(currentView === 'outbound' ? trainOffers : returnOffers).map((offer) => (
                    <div 
                      key={offer.id} 
                      className={`border rounded-lg p-4 hover:shadow-md transition-shadow ${
                        selectedOutboundOffer?.id === offer.id ? 'border-blue-500 bg-blue-50' : 'border-gray-200'
                      }`}
                    >
                      {/* Show outbound or return trip based on current view */}
                      {offer.trips.slice(currentView === 'outbound' ? 0 : 1, currentView === 'outbound' ? 1 : 2).map((trip, tripIndex) => (
                        <div key={tripIndex}>
                          {/* Trip header */}
                          <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center space-x-4">
                              <div className="text-lg font-semibold text-gray-900">
                                {formatTime(trip.segments[0].departureAt)} → {formatTime(trip.segments[trip.segments.length - 1].arrivalAt)}
                              </div>
                              <div className="text-sm text-gray-500">
                                {formatDate(trip.segments[0].departureAt)}
                              </div>
                              <div className="text-sm text-gray-500">
                                {formatDuration(trip.segments[0].departureAt, trip.segments[trip.segments.length - 1].arrivalAt)}
                              </div>
                              <div className="text-sm text-gray-500">
                                {getTransferCount(trip) === 0 ? 'Direct' : `${getTransferCount(trip)} transfer${getTransferCount(trip) !== 1 ? 's' : ''}`}
                              </div>
                            </div>
                            <div className="text-right">
                              <div className="text-2xl font-bold text-green-600">
                                €{offer.price.amount}
                              </div>
                              <div className="text-sm text-gray-500">
                                {currentView === 'return' ? 'Total: Outbound + Return' : offer.metadata.providerId}
                              </div>
                            </div>
                          </div>

                          {/* Segments */}
                          <div className="space-y-2 mb-4">
                            {trip.segments.map((segment, segmentIndex) => (
                              <div key={segmentIndex} className="flex items-center space-x-4 pl-4">
                                <div className="flex items-center space-x-2">
                                  <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 01.553-.894L9 2l6 3 6-3v15l-6 3-6-3z" />
                                  </svg>
                                  <span className="font-medium text-blue-600">
                                    {segment.vehicle.name} {segment.vehicle.code}
                                  </span>
                                </div>
                                <div className="text-sm text-gray-600">
                                  {formatTime(segment.departureAt)} - {formatTime(segment.arrivalAt)}
                                </div>
                                <div className="text-sm text-gray-500">
                                  {formatDuration(segment.departureAt, segment.arrivalAt)}
                                </div>
                              </div>
                            ))}
                          </div>

                          {/* Action button */}
                          <div className="flex justify-end">
                            {currentView === 'outbound' ? (
                              tripType === 'roundtrip' ? (
                                <button 
                                  onClick={() => handleSelectOutbound(offer)}
                                  disabled={isLoadingReturn && selectedOutboundOffer?.id === offer.id}
                                  className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
                                >
                                  {isLoadingReturn && selectedOutboundOffer?.id === offer.id ? (
                                    <div className="flex items-center">
                                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                      Loading return options...
                                    </div>
                                  ) : selectedOutboundOffer?.id === offer.id ? (
                                    'Selected for return options'
                                  ) : (
                                    'Select & view return options'
                                  )}
                                </button>
                              ) : (
                                <button 
                                  onClick={() => handleBookTrain(offer, false)}
                                  className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors font-medium"
                                >
                                  Book this train
                                </button>
                              )
                            ) : (
                              <button 
                                onClick={() => handleBookTrain(offer, true)}
                                className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors font-medium"
                              >
                                Book return journey (€{offer.price.amount})
                              </button>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <svg className="w-16 h-16 mx-auto mb-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 01.553-.894L9 2l6 3 6-3v15l-6 3-6-3z" />
                  </svg>
                  <p className="text-lg">
                    {currentView === 'outbound' 
                      ? 'No trains found for your search criteria'
                      : 'No return options found'
                    }
                  </p>
                  <p className="text-sm mt-2">
                    {currentView === 'outbound'
                      ? 'Try adjusting your departure date or stations'
                      : 'Try selecting a different outbound journey'
                    }
                  </p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default BookTravelPage;
