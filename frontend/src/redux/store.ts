import { configureStore } from "@reduxjs/toolkit";
import tripReducer from "./slices/tripSlice";

export const store = configureStore({
  reducer: {
    trips: tripReducer,
  },
});

// Infer the `RootState` and `AppDispatch` types from the store itself
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
