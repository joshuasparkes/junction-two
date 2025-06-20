import { supabase, Booking } from '../lib/supabase';

export interface CreateBookingData {
  junction_booking_id: string;
  trip_id: string;
  user_id: string;
  org_id?: string;
  total_amount: string;
  currency: string;
  junction_response?: any;
  passengers_data?: any[];
  trips_data?: any[];
  price_breakdown?: any[];
  fulfillment_info?: any[];
}

export async function createBookingInSupabase(bookingData: CreateBookingData): Promise<Booking> {
  console.log('🔵 Creating booking in Supabase with data:', bookingData);
  
  const insertData = {
    junction_booking_id: bookingData.junction_booking_id,
    trip_id: bookingData.trip_id,
    user_id: bookingData.user_id,
    org_id: bookingData.org_id,
    status: 'pending-payment',
    total_amount: bookingData.total_amount,
    currency: bookingData.currency,
    junction_response: bookingData.junction_response,
    passengers_data: bookingData.passengers_data,
    trips_data: bookingData.trips_data,
    price_breakdown: bookingData.price_breakdown,
    fulfillment_info: bookingData.fulfillment_info,
  };
  
  console.log('🔵 Supabase insert data:', insertData);
  
  const { data, error } = await supabase
    .from('bookings')
    .insert([insertData])
    .select()
    .single();

  console.log('🔵 Supabase insert response:', { data, error });

  if (error) {
    console.error('🔵 Supabase booking error details:', error);
    throw new Error(`Failed to create booking: ${error.message}`);
  }

  console.log('🔵 Successfully created booking in Supabase:', data);
  return data;
}

export async function updateBookingStatus(bookingId: string, status: string): Promise<Booking> {
  const { data, error } = await supabase
    .from('bookings')
    .update({ status })
    .eq('id', bookingId)
    .select()
    .single();

  if (error) {
    console.error('Supabase booking update error:', error);
    throw new Error(`Failed to update booking status: ${error.message}`);
  }

  return data;
}

export async function updateBookingConfirmation(
  bookingId: string, 
  updates: {
    status?: string;
    confirmation_number?: string;
    ticket_url?: string;
    collection_reference?: string;
    delivery_option?: string;
    fulfillment_info?: any[];
  }
): Promise<Booking> {
  const { data, error } = await supabase
    .from('bookings')
    .update(updates)
    .eq('id', bookingId)
    .select()
    .single();

  if (error) {
    console.error('Supabase booking confirmation update error:', error);
    throw new Error(`Failed to update booking confirmation: ${error.message}`);
  }

  return data;
}

export async function getBookingByJunctionId(junctionBookingId: string): Promise<Booking | null> {
  const { data, error } = await supabase
    .from('bookings')
    .select('*')
    .eq('junction_booking_id', junctionBookingId)
    .single();

  if (error) {
    if (error.code === 'PGRST116') {
      return null; // Booking not found
    }
    console.error('Supabase booking fetch error:', error);
    throw new Error(`Failed to fetch booking: ${error.message}`);
  }

  return data;
}

export async function getUserBookings(userId: string): Promise<Booking[]> {
  const { data, error } = await supabase
    .from('bookings')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Supabase bookings fetch error:', error);
    throw new Error(`Failed to fetch bookings: ${error.message}`);
  }

  return data || [];
}

export async function getTripBookings(tripId: string): Promise<Booking[]> {
  console.log('🎫 Fetching bookings for trip:', tripId);
  
  const { data, error } = await supabase
    .from('bookings')
    .select('*')
    .eq('trip_id', tripId)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('🎫 Supabase trip bookings fetch error:', error);
    throw new Error(`Failed to fetch trip bookings: ${error.message}`);
  }

  console.log('🎫 Found bookings for trip:', data);
  return data || [];
}