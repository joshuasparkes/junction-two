// Use your backend API instead of calling Junction directly to avoid CORS issues
const BACKEND_API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:8000/api';

export interface Place {
  id: string;
  name: string;
  placeTypes: string[];
  coordinates: {
    latitude: number;
    longitude: number;
  };
  countryCode: string;
  countryName: string;
  iataCode: string | null;
  timeZone: string;
}

export interface PlacesResponse {
  items: Place[];
  links: {
    next: string | null;
  };
  meta: {
    itemsOnPage: number;
    cursors: {
      next: string;
    };
  };
}

// Search for railway stations
export async function searchRailwayStations(query: string): Promise<Place[]> {
  console.log('🚂 Searching for railway stations:', query);
  
  if (!query || query.trim().length < 2) {
    console.log('🚂 Query too short, returning empty array');
    return [];
  }

  try {
    const encodedQuery = encodeURIComponent(query.trim());
    const url = `${BACKEND_API_BASE}/places/railway-stations?query=${encodedQuery}`;
    
    console.log('🚂 Making API call to backend:', url);
    
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
    });

    console.log('🚂 Response status:', response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('🚂 Backend API error response:', errorText);
      throw new Error(`Backend API request failed: ${response.status} ${response.statusText} - ${errorText}`);
    }

    const data: PlacesResponse = await response.json();
    console.log('🚂 Backend API Response data:', data);
    console.log(`🚂 Found ${data.items.length} railway stations for "${query}"`);
    
    return data.items;
  } catch (error) {
    console.error('🚂 Error searching railway stations:', error);
    
    // Return mock data for testing if API fails
    if (query.toLowerCase().includes('augsburg')) {
      console.log('🚂 Returning mock data for testing');
      return [{
        id: 'mock_station_1',
        name: 'Augsburg Morellstraße (Mock)',
        placeTypes: ['railway-station'],
        coordinates: { latitude: 48.355178, longitude: 10.8930876 },
        countryCode: 'DE',
        countryName: 'Germany',
        iataCode: null,
        timeZone: 'Europe/Berlin'
      }];
    }
    
    throw new Error(`Failed to search railway stations: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

// Search for airports (for comparison/alternative transport)
export async function searchAirports(query: string): Promise<Place[]> {
  console.log('Searching for airports:', query);
  
  if (!query || query.trim().length < 2) {
    return [];
  }

  try {
    const encodedQuery = encodeURIComponent(query.trim());
    const url = `${BACKEND_API_BASE}/places/airports?query=${encodedQuery}`;
    
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Backend API request failed: ${response.status} ${response.statusText}`);
    }

    const data: PlacesResponse = await response.json();
    console.log(`Found ${data.items.length} airports for "${query}"`);
    
    return data.items;
  } catch (error) {
    console.error('Error searching airports:', error);
    throw new Error(`Failed to search airports: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

// Get place by ID
export async function getPlaceById(placeId: string): Promise<Place | null> {
  console.log('Fetching place by ID:', placeId);
  
  try {
    const url = `${BACKEND_API_BASE}/places/${placeId}`;
    
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      if (response.status === 404) {
        return null;
      }
      throw new Error(`Backend API request failed: ${response.status} ${response.statusText}`);
    }

    const place: Place = await response.json();
    console.log('Place found:', place.name);
    
    return place;
  } catch (error) {
    console.error('Error fetching place by ID:', error);
    throw new Error(`Failed to fetch place: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

// Search for places of any type (general search)
export async function searchPlaces(query: string, placeType?: string): Promise<Place[]> {
  console.log('Searching for places:', { query, placeType });
  
  if (!query || query.trim().length < 2) {
    return [];
  }

  try {
    const encodedQuery = encodeURIComponent(query.trim());
    let url = `${BACKEND_API_BASE}/places/search?query=${encodedQuery}`;
    
    if (placeType) {
      url += `&place_type=${placeType}`;
    }
    
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Backend API request failed: ${response.status} ${response.statusText}`);
    }

    const data: PlacesResponse = await response.json();
    console.log(`Found ${data.items.length} places for "${query}"`);
    
    return data.items;
  } catch (error) {
    console.error('Error searching places:', error);
    throw new Error(`Failed to search places: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}