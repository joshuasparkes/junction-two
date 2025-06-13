import React from "react";
import { Link } from "react-router-dom";

const LandingPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-white">
      <nav className="flex items-center justify-between px-6 py-4 bg-white shadow-sm">
        <div className="flex items-center">
          <img
            src="/junction-logotext.png"
            alt="Junction Two"
            className="h-8"
          />
        </div>
        <div className="hidden md:flex items-center space-x-8">
          <a href="#" className="text-gray-700 hover:text-gray-900">
            Corporate
          </a>
          <a href="#" className="text-gray-700 hover:text-gray-900">
            Agencies
          </a>
          <a href="#" className="text-gray-700 hover:text-gray-900">
            Suppliers
          </a>
          <a href="#" className="text-gray-700 hover:text-gray-900">
            Developers
          </a>
        </div>
        <Link
          to="/login"
          className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
        >
          Log In
        </Link>
      </nav>

      <div className="relative bg-gradient-to-r from-amber-50 to-amber-100 overflow-hidden">
        <div className="absolute inset-0">
          <img
            src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&auto=format&fit=crop&w=2000&q=80"
            alt="Travel background"
            className="w-full h-full object-cover opacity-20"
          />
        </div>
        <div className="relative px-6 py-24 max-w-7xl mx-auto">
          <div className="max-w-3xl">
            <h1 className="text-5xl font-bold text-gray-900 mb-6">
              Junction Two, the new home of travel!
            </h1>
            <p className="text-xl text-gray-700 mb-8">
              Business, leisure and anywhere in between
            </p>
          </div>
        </div>
      </div>

      <div className="bg-white py-16">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <h2 className="text-4xl font-bold text-gray-900 mb-6">
            Better prices, Greater choice, Amazing experiences
          </h2>
          <p className="text-lg text-gray-600 max-w-4xl mx-auto">
            Siloed profiles across disparate travel marketplaces no more.
            Junction Two is the integrator of travel data and interoperability,
            allowing the traveler to have one profile, business or leisure.
          </p>
        </div>
      </div>
    </div>
  );
};

export default LandingPage;
