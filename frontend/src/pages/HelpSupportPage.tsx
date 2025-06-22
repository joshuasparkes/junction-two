import React from "react";
import Layout from "../components/common/Layout";
import OrgSelector from "../components/common/OrgSelector";

const HelpSupportPage: React.FC = () => {
  return (
    <Layout>
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Org Selector */}
        <div className="mb-6">
          <OrgSelector />
        </div>
        
        {/* Header */}
        <div className="mb-8">
          <h1 className="title-text font-normal text-chatgpt-text-primary mb-2">
            Help & Support
          </h1>
          <p className="content-text text-chatgpt-text-secondary">
            Get assistance with your travel needs
          </p>
        </div>

        <div className="bg-white border border-gray-200 rounded-lg p-3">
          <div className="space-y-0">
            {/* Email Support */}
            <div className="p-3 rounded-md hover:bg-gray-50 transition-colors duration-200">
              <h3 className="content-text font-normal text-chatgpt-text-primary mb-1">
                Email Support
              </h3>
              <p className="sidebar-text text-chatgpt-text-secondary mb-2">
                Get help via email - we reply fast
              </p>
              <a
                href="mailto:support@diplomattravel.gr"
                className="sidebar-text text-blue-600 hover:text-blue-700 transition-colors duration-200"
              >
                support@diplomattravel.gr
              </a>
              <p className="sidebar-text text-gray-500 mt-1">24/7 support</p>
            </div>

            {/* Phone Support */}
            <div className="p-3 rounded-md hover:bg-gray-50 transition-colors duration-200">
              <h3 className="content-text font-normal text-chatgpt-text-primary mb-1">
                Phone Support
              </h3>
              <p className="sidebar-text text-chatgpt-text-secondary mb-2">
                Talk to an advisor now
              </p>
              <a
                href="tel:+15593776471"
                className="sidebar-text text-blue-600 hover:text-blue-700 transition-colors duration-200"
              >
                (559) 377-6471
              </a>
              <p className="sidebar-text text-gray-500 mt-1">
                8:30AM TO 5:30PM EST, MON TO FRI
              </p>
            </div>

            {/* After Hours */}
            <div className="p-3 rounded-md hover:bg-gray-50 transition-colors duration-200">
              <h3 className="content-text font-normal text-chatgpt-text-primary mb-1">
                After Hours Support
              </h3>
              <p className="sidebar-text text-chatgpt-text-secondary mb-2">
                Emergency support available 24/7
              </p>
              <a
                href="tel:+18883462443"
                className="sidebar-text text-blue-600 hover:text-blue-700 transition-colors duration-200"
              >
                (888) 346-2443
              </a>
              <p className="sidebar-text text-gray-500 mt-1">
                US$22.91 per call - Available 24/7
              </p>
            </div>

            {/* Common Topics */}
            <div className="p-3 rounded-md hover:bg-gray-50 transition-colors duration-200">
              <h3 className="content-text font-normal text-chatgpt-text-primary mb-1">
                Common Support Topics
              </h3>
              <p className="sidebar-text text-chatgpt-text-secondary mb-2">
                Frequently asked questions and topics
              </p>
              <ul className="sidebar-text text-gray-600 space-y-1">
                <li>• Booking assistance and modifications</li>
                <li>• Travel policy questions</li>
                <li>• Account setup and management</li>
                <li>• Payment and billing inquiries</li>
              </ul>
            </div>

            {/* Emergency Support */}
            <div className="p-3 rounded-md hover:bg-gray-50 transition-colors duration-200">
              <h3 className="content-text font-normal text-chatgpt-text-primary mb-1">
                Emergency Support
              </h3>
              <p className="sidebar-text text-chatgpt-text-secondary mb-2">
                Urgent travel assistance
              </p>
              <ul className="sidebar-text text-gray-600 space-y-1">
                <li>• 24/7 emergency travel assistance</li>
                <li>• Flight cancellations and delays</li>
                <li>• Lost or stolen travel documents</li>
                <li>• Medical emergencies while traveling</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default HelpSupportPage;
