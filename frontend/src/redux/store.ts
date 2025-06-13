import { configureStore } from '@reduxjs/toolkit';
// Import reducers as they are created
// import authReducer from './slices/authSlice';

export const store = configureStore({
  reducer: {
    // Add reducers here as they are created
    // auth: authReducer,
  },
});

// Infer the `RootState` and `AppDispatch` types from the store itself
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
