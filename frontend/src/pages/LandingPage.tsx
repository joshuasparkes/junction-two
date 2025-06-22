import React from "react";
import { Link } from "react-router-dom";

const LandingPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-chatgpt-bg">
      {/* Navigation */}
      <nav className="bg-black px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center">
            <div className="text-white font-medium">
              Junction
              <br />
              <span className="text-sm font-normal">for Business</span>
            </div>
          </div>
          <div className="flex items-center space-x-6">
            <button className="text-white hover:text-gray-300 transition-colors flex items-center space-x-1">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
              </svg>
              <span className="text-sm">EN</span>
            </button>
            <Link
              to="/login"
              className="text-white hover:text-gray-300 transition-colors text-sm"
            >
              Contact sales
            </Link>
            <Link
              to="/login"
              className="bg-white text-black px-4 py-2 rounded-full text-sm font-medium hover:bg-gray-100 transition-colors"
            >
              Log in
            </Link>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="flex flex-col lg:flex-row min-h-[calc(100vh-72px)]">
        {/* Left Panel - White */}
        <div className="flex-1 bg-white p-12 lg:p-20 flex flex-col justify-center">
          <div className="max-w-md">
            <h1 className="title-text font-normal text-chatgpt-text-primary mb-8">
              Let's get started
            </h1>
            
            <div className="mb-8">
              <input
                type="email"
                placeholder="Business email address"
                className="chatgpt-input w-full"
              />
            </div>

            <Link
              to="/register"
              className="chatgpt-primary-button inline-flex items-center justify-center w-full sm:w-auto px-8"
            >
              Next
            </Link>

            <div className="mt-12 space-y-4">
              <p className="content-text text-gray-600">
                Already have an account?{" "}
                <Link to="/login" className="text-blue-600 hover:text-blue-700 underline">
                  Sign in
                </Link>
              </p>
              
              <p className="text-sm text-gray-500 leading-relaxed">
                Junction Two would like to contact you at the business email address provided, including 
                to share recommendations and product updates. You may opt out of promotional 
                messages at any time.
              </p>
            </div>
          </div>
        </div>

        {/* Right Panel - Dark */}
        <div className="flex-1 bg-gray-900 text-white p-12 lg:p-20 flex flex-col justify-center relative overflow-hidden">
          <div className="max-w-md relative z-10">
            <h2 className="text-3xl font-normal mb-12">
              Streamline your corporate travel with Junction Two
            </h2>

            <div className="space-y-8">
              <div className="flex items-start space-x-4">
                <div className="mt-1">
                  <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                  </svg>
                </div>
                <div>
                  <h3 className="font-medium mb-1">Unified booking platform</h3>
                  <p className="text-sm text-gray-400">
                    Book flights and rail travel in one place. Compare prices across all major carriers and rail operators.
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <div className="mt-1">
                  <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                  </svg>
                </div>
                <div>
                  <h3 className="font-medium mb-1">Automated expense management</h3>
                  <p className="text-sm text-gray-400">
                    Real-time expense tracking with automatic policy compliance. No more manual receipts or reimbursements.
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <div className="mt-1">
                  <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </div>
                <div>
                  <h3 className="font-medium mb-1">Complete traveler management</h3>
                  <p className="text-sm text-gray-400">
                    Manage team travel profiles, preferences, and approvals. Full visibility into travel spend and patterns.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Decorative illustration at bottom */}
          <div className="absolute bottom-0 right-0 w-96 h-96 opacity-10">
            <svg viewBox="0 0 400 400" className="w-full h-full">
              <defs>
                <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                  <circle cx="20" cy="20" r="2" fill="currentColor" />
                </pattern>
              </defs>
              <rect width="100%" height="100%" fill="url(#grid)" />
              {/* Abstract shapes */}
              <circle cx="100" cy="300" r="60" fill="currentColor" opacity="0.2" />
              <circle cx="200" cy="350" r="40" fill="currentColor" opacity="0.15" />
              <circle cx="300" cy="320" r="50" fill="currentColor" opacity="0.1" />
              <path d="M 150 250 Q 200 200 250 250" stroke="currentColor" strokeWidth="2" fill="none" opacity="0.3" />
            </svg>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LandingPage;