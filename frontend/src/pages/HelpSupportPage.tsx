import React from "react";
import Layout from "../components/common/Layout";

const HelpSupportPage: React.FC = () => {
  return (
    <Layout>
      <div className="min-h-screen bg-gray-50 py-16">
        <div className="max-w-6xl mx-auto px-4">
          {/* Header */}
          <div className="text-center mb-16">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              Contact Junction Two support
            </h1>
            <p className="text-xl text-gray-600">
              Get Personalized Assistance: Connect with Our Team of Experts.
            </p>
          </div>

          {/* Support Options */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Email Us */}
            <div className="bg-white rounded-lg shadow-sm p-8 text-center">
              <div className="w-16 h-16 bg-blue-600 rounded-lg flex items-center justify-center mx-auto mb-6">
                <svg
                  className="w-8 h-8 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                  />
                </svg>
              </div>
              <h3 className="text-2xl font-semibold text-gray-900 mb-4">
                Email Us
              </h3>
              <p className="text-gray-600 mb-8">We reply fast.</p>

              <div className="space-y-2">
                <a
                  href="mailto:support@diplomattravel.gr"
                  className="block text-blue-600 hover:text-blue-700 font-medium"
                >
                  support@diplomattravel.gr
                </a>
                <p className="text-gray-500 text-sm">24/7 support</p>
              </div>
            </div>

            {/* Need a quick answer */}
            <div className="bg-white rounded-lg shadow-sm p-8 text-center">
              <div className="w-16 h-16 bg-blue-600 rounded-lg flex items-center justify-center mx-auto mb-6">
                <svg
                  className="w-8 h-8 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                  />
                </svg>
              </div>
              <h3 className="text-2xl font-semibold text-gray-900 mb-4">
                Need a quick answer?
              </h3>
              <p className="text-gray-600 mb-8">Talk to an advisor now.</p>

              <div className="space-y-2">
                <a
                  href="tel:+15593776471"
                  className="block text-blue-600 hover:text-blue-700 font-medium text-lg"
                >
                  (559) 377-6471
                </a>
                <p className="text-gray-500 text-sm">
                  8:30AM TO 5:30PM EST, MON TO FRI
                </p>
              </div>
            </div>

            {/* After hours */}
            <div className="bg-white rounded-lg shadow-sm p-8 text-center">
              <div className="w-16 h-16 bg-blue-600 rounded-lg flex items-center justify-center mx-auto mb-6">
                <svg
                  className="w-8 h-8 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z"
                  />
                </svg>
              </div>
              <h3 className="text-2xl font-semibold text-gray-900 mb-4">
                After hours
              </h3>
              <p className="text-gray-600 mb-8">US$22.91 per call.</p>

              <div className="space-y-2">
                <a
                  href="tel:+18883462443"
                  className="block text-blue-600 hover:text-blue-700 font-medium text-lg"
                >
                  (888) 346-2443
                </a>
                <p className="text-gray-500 text-sm">AVAILABILITY 24/7</p>
              </div>
            </div>
          </div>

          {/* Additional Information */}
          <div className="mt-16 text-center">
            <div className="bg-white rounded-lg shadow-sm p-8 max-w-4xl mx-auto">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                How can we help you today?
              </h2>
              <p className="text-gray-600 mb-6">
                Our support team is here to assist you with any questions about
                bookings, travel policies, account management, or technical
                issues. Choose the contact method that works best for you.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-left">
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">
                    Common Support Topics:
                  </h3>
                  <ul className="text-gray-600 space-y-1">
                    <li>• Booking assistance and modifications</li>
                    <li>• Travel policy questions</li>
                    <li>• Account setup and management</li>
                    <li>• Payment and billing inquiries</li>
                  </ul>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">
                    Emergency Support:
                  </h3>
                  <ul className="text-gray-600 space-y-1">
                    <li>• 24/7 emergency travel assistance</li>
                    <li>• Flight cancellations and delays</li>
                    <li>• Lost or stolen travel documents</li>
                    <li>• Medical emergencies while traveling</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default HelpSupportPage;
