import React, { useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { LayoutProvider } from "./contexts/LayoutContext";
import { AuthProvider } from "./contexts/AuthContext";
import { Provider } from "react-redux";
import { store } from "./redux/store";
import { warmSupabaseConnection } from "./lib/supabaseConnection";

import LandingPage from "./pages/LandingPage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import DashboardPage from "./pages/DashboardPage";
import BookTravelPage from "./pages/BookTravelPage";
import PlanTripPage from "./pages/PlanTripPage";
import TripsPage from "./pages/TripsPage";
import TripDetailPage from "./pages/TripDetailPage";
import TravelManagerPage from "./pages/TravelManagerPage";
import ApprovalsPage from "./pages/ApprovalsPage";
import HelpSupportPage from "./pages/HelpSupportPage";
import UserProfilePage from "./pages/UserProfilePage";
import TravelerDetailsPage from "./pages/TravelerDetailsPage";
import PaymentPage from "./pages/PaymentPage";
import BookingConfirmationPage from "./pages/BookingConfirmationPage";
import OrgManagerPage from "./pages/OrgManagerPage";
import SystemAdminPage from "./pages/SystemAdminPage";
import ProtectedRoute from "./components/auth/ProtectedRoute";

const App: React.FC = () => {
  // Warm up Supabase connection immediately on app start
  useEffect(() => {
    warmSupabaseConnection();
  }, []);

  return (
    <Provider store={store}>
      <AuthProvider>
        <LayoutProvider>
          <Router>
            <div className="min-h-screen bg-gray-50">
              <Routes>
                {/* Public routes */}
                <Route path="/" element={<LandingPage />} />
                <Route path="/login" element={<LoginPage />} />
                <Route path="/register" element={<RegisterPage />} />

                {/* Protected routes - require authentication */}
                <Route
                  path="/dashboard"
                  element={<Navigate to="/book" replace />}
                />

                <Route
                  path="/book"
                  element={
                    <ProtectedRoute>
                      <BookTravelPage />
                    </ProtectedRoute>
                  }
                />

                <Route
                  path="/plan-trip"
                  element={
                    <ProtectedRoute>
                      <PlanTripPage />
                    </ProtectedRoute>
                  }
                />

                <Route
                  path="/trips"
                  element={
                    <ProtectedRoute>
                      <TripsPage />
                    </ProtectedRoute>
                  }
                />

                <Route
                  path="/trips/:id"
                  element={
                    <ProtectedRoute>
                      <TripDetailPage />
                    </ProtectedRoute>
                  }
                />

                {/* Manager and booker only routes */}
                <Route
                  path="/travel-manager"
                  element={
                    <ProtectedRoute requiredRoles={["manager", "booker"]}>
                      <TravelManagerPage />
                    </ProtectedRoute>
                  }
                />

                {/* Manager only routes */}
                <Route
                  path="/approvals"
                  element={
                    <ProtectedRoute requiredRoles={["manager"]}>
                      <ApprovalsPage />
                    </ProtectedRoute>
                  }
                />

                <Route
                  path="/org-manager"
                  element={
                    <ProtectedRoute requiredRoles={["manager"]}>
                      <OrgManagerPage />
                    </ProtectedRoute>
                  }
                />

                <Route
                  path="/system-admin"
                  element={
                    <ProtectedRoute requiredRoles={["manager"]}>
                      <SystemAdminPage />
                    </ProtectedRoute>
                  }
                />

                <Route
                  path="/help"
                  element={
                    <ProtectedRoute>
                      <HelpSupportPage />
                    </ProtectedRoute>
                  }
                />

                <Route
                  path="/profile"
                  element={
                    <ProtectedRoute>
                      <UserProfilePage />
                    </ProtectedRoute>
                  }
                />

                <Route
                  path="/traveler-details"
                  element={
                    <ProtectedRoute>
                      <TravelerDetailsPage />
                    </ProtectedRoute>
                  }
                />

                <Route
                  path="/payment"
                  element={
                    <ProtectedRoute>
                      <PaymentPage />
                    </ProtectedRoute>
                  }
                />

                <Route
                  path="/booking-confirmation"
                  element={
                    <ProtectedRoute>
                      <BookingConfirmationPage />
                    </ProtectedRoute>
                  }
                />
              </Routes>
            </div>
          </Router>
        </LayoutProvider>
      </AuthProvider>
    </Provider>
  );
};

export default App;
