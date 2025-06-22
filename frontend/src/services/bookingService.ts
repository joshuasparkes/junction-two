import { createBookingInSupabase, updateBookingConfirmation, getBookingByJunctionId } from './supabaseBookingService';
import { addBookingToTrip } from './tripService';
import { supabase } from '../lib/supabase';

const BACKEND_API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:8000/api';

export interface BookingPassenger {
  dateOfBirth: string;
  firstName: string;
  lastName: string;
  gender: string;
  email: string;
  phoneNumber: string;
  residentialAddress: {
    addressLines: string[];
    countryCode: string;
    postalCode: string;
    city: string;
  };
}

export interface BookingRequest {
  offerId: string;
  tripId: string;
  passengers: BookingPassenger[];
}

export interface BookingResponse {
  id?: string;
  status?: string;
  createdAt?: string;
  expiresAt?: string;
  price?: {
    currency: string;
    amount: string;
  };
  confirmationNumber?: string;
  fulfillmentInformation?: any[];
  passengers?: any[];
  priceBreakdown?: any[];
  ticketInformation?: any[];
  fareRules?: any[];
  trips?: any[];
  fullJunctionResponse?: any;
  // New nested structure from Junction API
  booking?: {
    id: string;
    status: string;
    createdAt?: string;
    expiresAt?: string;
    price: {
      currency: string;
      amount: string;
    };
    confirmationNumber?: string;
    passengers: any[];
    priceBreakdown: any[];
    ticketInformation: any[];
    fareRules: any[];
    trips: any[];
    fulfillmentInformation?: any[];
  };
}

export async function createBooking(bookingRequest: BookingRequest): Promise<BookingResponse & { id: string }> {
  console.log('🎫 Creating booking via backend proxy:', bookingRequest);
  
  try {
    const url = `${BACKEND_API_BASE}/bookings/create`;
    
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
      credentials: 'include', // Include cookies for authentication
      body: JSON.stringify(bookingRequest),
    });

    console.log('🎫 Backend proxy response status:', response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('🎫 Backend proxy error response:', errorText);
      throw new Error(`Booking failed: ${response.status} ${response.statusText} - ${errorText}`);
    }

    const data: BookingResponse = await response.json();
    console.log('🎫 Booking created via backend proxy - FULL RESPONSE:', data);
    console.log('🎫 Frontend response type:', typeof data);
    console.log('🎫 Frontend response keys:', Object.keys(data));
    console.log('🎫 Frontend fullJunctionResponse:', data.fullJunctionResponse);
    console.log('🎫 Frontend price:', data.price);
    console.log('🎫 Frontend passengers:', data.passengers);
    console.log('🎫 Frontend trips:', data.trips);
    console.log('🎫 Frontend priceBreakdown:', data.priceBreakdown);
    console.log('🎫 Frontend ticketInformation:', data.ticketInformation);
    
    // Save to Supabase after successful backend response
    try {
      const { data: { user } } = await supabase.auth.getUser();
      console.log('🎫 Current user for Supabase booking:', user);
      
      const bookingId = data.booking?.id || data.id;
      if (user && bookingId) {
        console.log('🎫 Attempting to save booking to Supabase:', {
          junction_booking_id: bookingId,
          trip_id: bookingRequest.tripId,
          user_id: user.id,
          total_amount: data.booking?.price?.amount || data.price?.amount || '0',
          currency: data.booking?.price?.currency || data.price?.currency || 'EUR',
        });
        
        const supabaseBooking = await createBookingInSupabase({
          junction_booking_id: bookingId,
          trip_id: bookingRequest.tripId,
          user_id: user.id,
          total_amount: data.booking?.price?.amount || data.price?.amount || '0',
          currency: data.booking?.price?.currency || data.price?.currency || 'EUR',
          vertical: 'rail', // Set to 'rail' for the create-booking endpoint
          junction_response: data.fullJunctionResponse || data,
          passengers_data: data.booking?.passengers || data.passengers || bookingRequest.passengers,
          trips_data: data.booking?.trips || data.trips || [],
          price_breakdown: data.booking?.priceBreakdown || data.priceBreakdown || [],
          fulfillment_info: data.fulfillmentInformation || data.ticketInformation || [],
        });
        console.log('🎫 Booking successfully saved to Supabase:', supabaseBooking);
      } else {
        console.log('🎫 No user authenticated or no booking ID - skipping Supabase save');
      }
    } catch (supabaseError) {
      console.error('🎫 Failed to save booking to Supabase:', supabaseError);
      // Don't throw error - backend booking was successful
    }
    
    // Return the booking data, handling both nested and flat response structures
    const bookingId = data.booking?.id || data.id;
    if (!bookingId) {
      throw new Error('No booking ID found in response');
    }
    
    return {
      id: bookingId,
      status: data.booking?.status || data.status || 'pending',
      createdAt: data.booking?.createdAt || data.createdAt || new Date().toISOString(),
      expiresAt: data.booking?.expiresAt || data.expiresAt,
      price: data.booking?.price || data.price,
      confirmationNumber: data.booking?.confirmationNumber || data.confirmationNumber,
      fulfillmentInformation: data.fulfillmentInformation || data.booking?.fulfillmentInformation,
      passengers: data.booking?.passengers || data.passengers,
      priceBreakdown: data.booking?.priceBreakdown || data.priceBreakdown,
      ticketInformation: data.booking?.ticketInformation || data.ticketInformation,
      fareRules: data.booking?.fareRules || data.fareRules,
      trips: data.booking?.trips || data.trips,
      fullJunctionResponse: data
    };
  } catch (error) {
    console.error('🎫 Error creating booking:', error);
    throw new Error(`Failed to create booking: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

export interface ConfirmationRequest {
  fulfillmentChoices: Array<{
    deliveryOption: 'electronic-ticket' | 'kiosk-collect';
    segmentSequence: number;
  }>;
}

export interface OrganizationBooking {
  id: string;
  created_at: string;
  total_amount: string;
  currency: string;
  org_id: string;
  vertical?: string;
  booking_date?: string;
  status: string;
  junction_booking_id: string;
}

export async function getOrganizationBookings(
  organizationId: string, 
  startDate?: string, 
  endDate?: string
): Promise<OrganizationBooking[]> {
  console.log('Fetching bookings for organization:', organizationId, { startDate, endDate });
  
  let query = supabase
    .from('bookings')
    .select('*')
    .eq('org_id', organizationId)
    .order('created_at', { ascending: false });

  if (startDate) {
    query = query.gte('booking_date', startDate);
  }
  
  if (endDate) {
    query = query.lte('booking_date', endDate);
  }

  const { data, error } = await query;

  if (error) {
    console.error('Error fetching bookings:', error);
    throw new Error(`Failed to fetch bookings: ${error.message}`);
  }

  console.log(`Found ${data?.length || 0} bookings for organization`);
  return data || [];
}

export async function confirmBooking(bookingId: string, confirmationRequest: ConfirmationRequest): Promise<BookingResponse> {
  console.log('🎫 Confirming booking via backend proxy:', bookingId, confirmationRequest);
  
  try {
    const url = `${BACKEND_API_BASE}/bookings/${bookingId}/confirm`;
    
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
      credentials: 'include', // Include cookies for authentication
      body: JSON.stringify(confirmationRequest),
    });

    console.log('🎫 Backend proxy confirmation response status:', response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('🎫 Backend proxy confirmation error response:', errorText);
      throw new Error(`Booking confirmation failed: ${response.status} ${response.statusText} - ${errorText}`);
    }

    const data = await response.json();
    console.log('🎫 Booking confirmed via backend proxy - FULL CONFIRMATION RESPONSE:', data);
    console.log('🎫 Confirmation response type:', typeof data);
    console.log('🎫 Confirmation response keys:', Object.keys(data));
    console.log('🎫 Confirmation status:', data.status);
    console.log('🎫 Confirmation passengers:', data.passengers);
    console.log('🎫 Confirmation trips:', data.trips);
    console.log('🎫 Confirmation priceBreakdown:', data.priceBreakdown);
    console.log('🎫 Confirmation ticketInformation:', data.ticketInformation);
    console.log('🎫 Confirmation booking object:', data.booking);
    console.log('🎫 Confirmation fulfillmentInformation:', data.fulfillmentInformation);
    
    // Update Supabase booking status after successful backend response
    try {
      const supabaseBooking = await getBookingByJunctionId(bookingId);
      if (supabaseBooking) {
        // Update booking confirmation details
        await updateBookingConfirmation(supabaseBooking.id!, {
          status: 'paid',
          delivery_option: confirmationRequest.fulfillmentChoices[0]?.deliveryOption,
          fulfillment_info: data.ticketInformation || data.fulfillmentInformation || [],
          confirmation_number: data.booking?.confirmationNumber,
          ticket_url: data.ticketInformation?.[0]?.ticketUrl,
          collection_reference: data.ticketInformation?.[0]?.collectionReference,
        });
        console.log('🎫 Supabase booking updated with confirmation details');
        
        // Add booking to trip's booking_ids array
        if (supabaseBooking.trip_id && supabaseBooking.id) {
          try {
            await addBookingToTrip(supabaseBooking.trip_id, supabaseBooking.id);
            console.log('🎫 Booking added to trip booking IDs');
          } catch (tripError) {
            console.error('🎫 Failed to add booking to trip:', tripError);
            // Don't throw - confirmation was successful
          }
        }
      }
    } catch (supabaseError) {
      console.error('🎫 Failed to update Supabase booking:', supabaseError);
      // Don't throw error - backend confirmation was successful
    }
    
    // Return response in expected format
    return {
      id: bookingId,
      status: 'paid',
      createdAt: data.booking?.createdAt || new Date().toISOString(),
      expiresAt: data.booking?.expiresAt,
      price: data.booking?.price || { currency: 'EUR', amount: '0' },
      confirmationNumber: data.booking?.confirmationNumber,
      fulfillmentInformation: data.fulfillmentInformation || []
    };
    
  } catch (error) {
    console.error('🎫 Error confirming booking:', error);
    throw new Error(`Failed to confirm booking: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}