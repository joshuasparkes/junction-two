import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import axios from 'axios';

// Define the Trip interface
export interface Trip {
  id: number;
  name: string;
  description: string;
  start_date: string;
  end_date: string;
  status: string;
  organization_id?: number;
  owner_id: number;
  created_at: string;
  updated_at: string;
}

// Define the state interface
interface TripState {
  trips: Trip[];
  trip: Trip | null;
  loading: boolean;
  error: string | null;
}

// Define the initial state
const initialState: TripState = {
  trips: [],
  trip: null,
  loading: false,
  error: null,
};

// Define the API base URL
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000/api/v1';

// Define async thunks for API calls
export const fetchTrips = createAsyncThunk(
  'trips/fetchTrips',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get(`${API_URL}/trips/`);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.detail || 'Failed to fetch trips');
    }
  }
);

export const fetchTrip = createAsyncThunk(
  'trips/fetchTrip',
  async (id: number, { rejectWithValue }) => {
    try {
      const response = await axios.get(`${API_URL}/trips/${id}`);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.detail || 'Failed to fetch trip');
    }
  }
);

export const createTrip = createAsyncThunk(
  'trips/createTrip',
  async (trip: Omit<Trip, 'id' | 'created_at' | 'updated_at'>, { rejectWithValue }) => {
    try {
      const response = await axios.post(`${API_URL}/trips/`, trip);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.detail || 'Failed to create trip');
    }
  }
);

export const updateTrip = createAsyncThunk(
  'trips/updateTrip',
  async ({ id, trip }: { id: number; trip: Partial<Trip> }, { rejectWithValue }) => {
    try {
      const response = await axios.put(`${API_URL}/trips/${id}`, trip);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.detail || 'Failed to update trip');
    }
  }
);

export const deleteTrip = createAsyncThunk(
  'trips/deleteTrip',
  async (id: number, { rejectWithValue }) => {
    try {
      const response = await axios.delete(`${API_URL}/trips/${id}`);
      return { id, data: response.data };
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.detail || 'Failed to delete trip');
    }
  }
);

// Create the trip slice
const tripSlice = createSlice({
  name: 'trips',
  initialState,
  reducers: {
    clearTrip: (state) => {
      state.trip = null;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch trips
      .addCase(fetchTrips.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchTrips.fulfilled, (state, action: PayloadAction<Trip[]>) => {
        state.loading = false;
        state.trips = action.payload;
      })
      .addCase(fetchTrips.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Fetch trip
      .addCase(fetchTrip.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchTrip.fulfilled, (state, action: PayloadAction<Trip>) => {
        state.loading = false;
        state.trip = action.payload;
      })
      .addCase(fetchTrip.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Create trip
      .addCase(createTrip.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createTrip.fulfilled, (state, action: PayloadAction<Trip>) => {
        state.loading = false;
        state.trips.push(action.payload);
        state.trip = action.payload;
      })
      .addCase(createTrip.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Update trip
      .addCase(updateTrip.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateTrip.fulfilled, (state, action: PayloadAction<Trip>) => {
        state.loading = false;
        state.trips = state.trips.map((trip) =>
          trip.id === action.payload.id ? action.payload : trip
        );
        state.trip = action.payload;
      })
      .addCase(updateTrip.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Delete trip
      .addCase(deleteTrip.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteTrip.fulfilled, (state, action) => {
        state.loading = false;
        state.trips = state.trips.filter((trip) => trip.id !== action.payload.id);
        if (state.trip && state.trip.id === action.payload.id) {
          state.trip = null;
        }
      })
      .addCase(deleteTrip.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearTrip, clearError } = tripSlice.actions;

export default tripSlice.reducer;
