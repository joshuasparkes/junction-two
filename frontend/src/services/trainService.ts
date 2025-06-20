const BACKEND_API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:8000/api';

export interface TrainSearchRequest {
  origin: string;
  destination: string;
  departureDate: string;
  returnDate?: string;
  passengers: Array<{ type: 'adult' | 'child' }>;
}

export interface TrainSegment {
  origin: string;
  destination: string;
  departureAt: string;
  arrivalAt: string;
  fare: {
    type: string;
    marketingName: string;
  };
  stops: any[];
  vehicle: {
    name: string;
    code: string;
  };
}

export interface TrainTrip {
  segments: TrainSegment[];
}

export interface TrainOffer {
  id: string;
  expiresAt: string;
  inboundStepRequired: boolean;
  price: {
    currency: string;
    amount: string;
  };
  priceBreakdown: Array<{
    price: {
      currency: string;
      amount: string;
    };
    breakdownType: string;
  }>;
  passportInformation: string;
  trips: TrainTrip[];
  metadata: {
    providerId: string;
  };
}

export interface TrainSearchResponse {
  items: TrainOffer[];
  message?: string;
  train_search_id?: string;
}

export async function searchTrains(searchRequest: TrainSearchRequest): Promise<TrainSearchResponse> {
  console.log('🚂 Searching for trains:', searchRequest);
  
  try {
    const url = `${BACKEND_API_BASE}/trains/search`;
    
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(searchRequest),
    });

    console.log('🚂 Train search response status:', response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('🚂 Train search error response:', errorText);
      throw new Error(`Train search failed: ${response.status} ${response.statusText} - ${errorText}`);
    }

    const data: TrainSearchResponse = await response.json();
    console.log('🚂 Train search results:', data);
    console.log(`🚂 Found ${data.items.length} train offers`);
    
    return data;
  } catch (error) {
    console.error('🚂 Error searching trains:', error);
    throw new Error(`Failed to search trains: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

// Helper function to format duration
export function formatDuration(departureAt: string, arrivalAt: string): string {
  const departure = new Date(departureAt);
  const arrival = new Date(arrivalAt);
  const durationMs = arrival.getTime() - departure.getTime();
  const hours = Math.floor(durationMs / (1000 * 60 * 60));
  const minutes = Math.floor((durationMs % (1000 * 60 * 60)) / (1000 * 60));
  
  if (hours > 0) {
    return `${hours}h ${minutes}m`;
  }
  return `${minutes}m`;
}

// Helper function to format time
export function formatTime(dateString: string): string {
  return new Date(dateString).toLocaleTimeString('en-GB', {
    hour: '2-digit',
    minute: '2-digit',
  });
}

// Helper function to format date
export function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString('en-GB', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
  });
}

// Helper function to count transfers
export function getTransferCount(trip: TrainTrip): number {
  return Math.max(0, trip.segments.length - 1);
}

// Get return trip offers for a selected outbound offer
export async function getReturnOffers(trainSearchId: string, trainOfferId: string): Promise<TrainSearchResponse> {
  console.log('🚂 ===== STARTING RETURN OFFERS REQUEST =====');
  console.log('🚂 Parameters:', { trainSearchId, trainOfferId });
  
  try {
    const url = `${BACKEND_API_BASE}/trains/return-offers/${trainSearchId}`;
    const requestBody = { trainOfferId };
    
    console.log('🚂 Request URL:', url);
    console.log('🚂 Request method: POST');
    console.log('🚂 Request headers:', {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
    });
    console.log('🚂 Request body:', JSON.stringify(requestBody, null, 2));
    
    console.log('🚂 Making fetch request...');
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
    });

    console.log('🚂 Response received!');
    console.log('🚂 Response status:', response.status);
    console.log('🚂 Response statusText:', response.statusText);
    console.log('🚂 Response headers:', Object.fromEntries(response.headers.entries()));

    if (!response.ok) {
      const errorText = await response.text();
      console.error('🚂 Response error text:', errorText);
      throw new Error(`Return offers failed: ${response.status} ${response.statusText} - ${errorText}`);
    }

    console.log('🚂 Parsing response JSON...');
    const data: TrainSearchResponse = await response.json();
    console.log('🚂 Parsed response data:', JSON.stringify(data, null, 2));
    console.log(`🚂 Found ${data.items.length} return options`);
    
    return data;
  } catch (error) {
    console.error('🚂 ===== ERROR IN RETURN OFFERS REQUEST =====');
    console.error('🚂 Error type:', typeof error);
    console.error('🚂 Error message:', error instanceof Error ? error.message : String(error));
    console.error('🚂 Full error object:', error);
    throw new Error(`Failed to get return offers: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}