import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { Provider } from "react-redux";
import { store } from "./redux/store";

import LandingPage from "./pages/LandingPage";
import LoginPage from "./pages/LoginPage";
import DashboardPage from "./pages/DashboardPage";
import BookTravelPage from "./pages/BookTravelPage";
import PlanTripPage from "./pages/PlanTripPage";
import MyTripsPage from "./pages/MyTripsPage";
import TravelManagerPage from "./pages/TravelManagerPage";
import ApprovalsPage from "./pages/ApprovalsPage";
import HelpSupportPage from "./pages/HelpSupportPage";

const App: React.FC = () => {
  return (
    <Provider store={store}>
      <Router>
        <div className="min-h-screen bg-gray-50">
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/book" element={<BookTravelPage />} />
            <Route path="/plan-trip" element={<PlanTripPage />} />
            <Route path="/trips" element={<MyTripsPage />} />
            <Route path="/travel-manager" element={<TravelManagerPage />} />
            <Route path="/approvals" element={<ApprovalsPage />} />
            <Route path="/help" element={<HelpSupportPage />} />
            <Route
              path="/bookings"
              element={
                <div className="p-8 text-center">
                  All Bookings - Coming Soon
                </div>
              }
            />
          </Routes>
        </div>
      </Router>
    </Provider>
  );
};

export default App;
