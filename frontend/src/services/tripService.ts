import { supabase, Trip } from '../lib/supabase';

export interface CreateTripData {
  name: string;
  start_date: string;
  end_date: string;
  created_by?: string;
  org_id?: string;
  bookings_ids?: string[];
}

export async function createTrip(tripData: CreateTripData): Promise<Trip> {
  console.log('Creating trip with data:', tripData);
  
  const { data, error } = await supabase
    .from('trips')
    .insert([{
      name: tripData.name,
      start_date: tripData.start_date,
      end_date: tripData.end_date,
      created_by: tripData.created_by,
      org_id: tripData.org_id,
      bookings_ids: tripData.bookings_ids || []
    }])
    .select()
    .single();

  if (error) {
    console.error('Supabase error:', error);
    throw new Error(`Failed to create trip: ${error.message}`);
  }

  console.log('Trip created successfully:', data);
  return data;
}

export async function getTrips(userId?: string, orgId?: string): Promise<Trip[]> {
  let query = supabase.from('trips').select('*').order('created_at', { ascending: false });
  
  if (userId) {
    query = query.eq('created_by', userId);
  }
  
  if (orgId) {
    query = query.eq('org_id', orgId);
  }

  const { data, error } = await query;

  if (error) {
    throw new Error(`Failed to fetch trips: ${error.message}`);
  }

  return data || [];
}

export async function deleteTrip(id: string): Promise<void> {
  const { error } = await supabase
    .from('trips')
    .delete()
    .eq('id', id);

  if (error) {
    throw new Error(`Failed to delete trip: ${error.message}`);
  }
}

export async function getTripById(id: string): Promise<Trip | null> {
  const { data, error } = await supabase
    .from('trips')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    if (error.code === 'PGRST116') {
      return null; // Trip not found
    }
    throw new Error(`Failed to fetch trip: ${error.message}`);
  }

  return data;
}

export async function updateTrip(id: string, tripData: Partial<CreateTripData>): Promise<Trip> {
  const { data, error } = await supabase
    .from('trips')
    .update(tripData)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to update trip: ${error.message}`);
  }

  return data;
}