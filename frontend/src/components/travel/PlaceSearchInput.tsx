import React, { useState, useEffect, useRef } from 'react';
import { searchRailwayStations, searchAirports, searchPlaces, Place } from '../../services/placesService';

interface PlaceSearchInputProps {
  label: string;
  placeholder: string;
  value?: Place | null;
  onChange: (place: Place | null) => void;
  searchType?: 'railway-station' | 'airport' | 'all';
  required?: boolean;
  disabled?: boolean;
}

const PlaceSearchInput: React.FC<PlaceSearchInputProps> = ({
  label,
  placeholder,
  value,
  onChange,
  searchType = 'railway-station',
  required = false,
  disabled = false
}) => {
  const [query, setQuery] = useState(value?.name || '');
  const [suggestions, setSuggestions] = useState<Place[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const debounceRef = useRef<NodeJS.Timeout>();
  const inputRef = useRef<HTMLInputElement>(null);

  // Update query when value prop changes
  useEffect(() => {
    setQuery(value?.name || '');
  }, [value]);

  // Search for places with debouncing
  const performSearch = async (searchQuery: string) => {
    if (!searchQuery || searchQuery.trim().length < 2) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      let results: Place[] = [];
      
      switch (searchType) {
        case 'railway-station':
          results = await searchRailwayStations(searchQuery);
          break;
        case 'airport':
          results = await searchAirports(searchQuery);
          break;
        case 'all':
          results = await searchPlaces(searchQuery);
          break;
      }

      setSuggestions(results);
      setShowSuggestions(true);
    } catch (err) {
      console.error('Search error:', err);
      setError(err instanceof Error ? err.message : 'Search failed');
      setSuggestions([]);
      setShowSuggestions(false);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle input change with debouncing
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newQuery = e.target.value;
    console.log('🔍 Input changed:', newQuery);
    setQuery(newQuery);

    // Clear previous selection if user is typing
    if (value && newQuery !== value.name) {
      onChange(null);
    }

    // Debounce search
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    console.log('🔍 Setting debounced search for:', newQuery);
    debounceRef.current = setTimeout(() => {
      console.log('🔍 Debounced search executing for:', newQuery);
      performSearch(newQuery);
    }, 300);
  };

  // Handle selection
  const handleSelect = (place: Place) => {
    setQuery(place.name);
    onChange(place);
    setShowSuggestions(false);
    setSuggestions([]);
    inputRef.current?.blur();
  };

  // Handle input blur
  const handleBlur = () => {
    // Delay hiding suggestions to allow for click events
    setTimeout(() => {
      setShowSuggestions(false);
    }, 200);
  };

  // Handle input focus
  const handleFocus = () => {
    if (suggestions.length > 0) {
      setShowSuggestions(true);
    }
  };

  // Get icon based on search type
  const getIcon = () => {
    switch (searchType) {
      case 'railway-station':
        return (
          <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        );
      case 'airport':
        return (
          <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
          </svg>
        );
      default:
        return (
          <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
        );
    }
  };

  return (
    <div className="relative">
      <label className="block text-sm font-medium text-gray-700 mb-2">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>
      
      <div className="relative">
        
        
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={handleInputChange}
          onFocus={handleFocus}
          onBlur={handleBlur}
          placeholder={placeholder}
          disabled={disabled}
          className={`w-full pl-4 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${
            disabled ? 'bg-gray-100 text-gray-500 cursor-not-allowed' : 'bg-white'
          } ${error ? 'border-red-300' : ''}`}
        />
        
        {isLoading && (
          <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
          </div>
        )}
      </div>

      {/* Error message */}
      {error && (
        <p className="mt-1 text-sm text-red-600">{error}</p>
      )}

      

      {/* Suggestions dropdown */}
      {showSuggestions && suggestions.length > 0 && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
          {suggestions.map((place) => (
            <button
              key={place.id}
              onClick={() => handleSelect(place)}
              className="w-full px-4 py-3 text-left hover:bg-gray-50 focus:outline-none focus:bg-gray-50 border-b border-gray-100 last:border-b-0"
            >
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium text-gray-900">{place.name}</div>
                  <div className="text-sm text-gray-500">
                    {place.countryName}
                    {place.placeTypes.includes('railway-station') && ' • Railway Station'}
                    {place.placeTypes.includes('airport') && ' • Airport'}
                    {place.iataCode && ` • ${place.iataCode}`}
                  </div>
                </div>
                <div className="flex items-center space-x-1">
                  {place.placeTypes.includes('railway-station') && (
                    <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center">
                      <svg className="w-3 h-3 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z" />
                      </svg>
                    </div>
                  )}
                  {place.placeTypes.includes('airport') && (
                    <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center">
                      <svg className="w-3 h-3 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-8.293l-3-3a1 1 0 00-1.414 1.414L10.586 9H7a1 1 0 100 2h3.586l-1.293 1.293a1 1 0 101.414 1.414l3-3a1 1 0 000-1.414z" />
                      </svg>
                    </div>
                  )}
                </div>
              </div>
            </button>
          ))}
        </div>
      )}

      {/* No results message */}
      {showSuggestions && suggestions.length === 0 && !isLoading && query.length >= 2 && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg p-4 text-center text-gray-500">
          <div className="flex items-center justify-center">
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            No {searchType === 'railway-station' ? 'railway stations' : searchType === 'airport' ? 'airports' : 'places'} found for "{query}"
          </div>
        </div>
      )}
    </div>
  );
};

export default PlaceSearchInput;