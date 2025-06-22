import React from 'react';

interface PaymentMethod {
  id: string;
  type: string;
  lastFour: string;
  expiry: string;
  name: string;
  isDefault: boolean;
}

interface PaymentMethodsProps {
  paymentMethods: PaymentMethod[];
  onAddCard: () => void;
}

const PaymentMethods: React.FC<PaymentMethodsProps> = ({
  paymentMethods,
  onAddCard
}) => {
  return (
    <div>
      <div className="mb-8 flex justify-between items-start">
        <div>
          <h2 className="title-text font-normal text-chatgpt-text-primary mb-1">
            Payment Methods
          </h2>
          <p className="content-text text-chatgpt-text-secondary">
            Manage your organization's payment methods.
          </p>
        </div>
        <button
          onClick={onAddCard}
          className="chatgpt-primary-button flex items-center"
        >
          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
          </svg>
          Add Credit Card
        </button>
      </div>

      <div className="bg-white border border-gray-200 rounded-lg p-3">
        <div className="space-y-0">
          {paymentMethods.map((method) => (
            <div key={method.id} className="p-3 rounded-md hover:bg-gray-50 transition-colors duration-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-7 bg-gray-100 rounded flex items-center justify-center flex-shrink-0">
                    <span className="sidebar-text font-normal text-gray-600">{method.type}</span>
                  </div>
                  <div>
                    <p className="content-text font-normal text-chatgpt-text-primary">{method.name}</p>
                    <p className="sidebar-text text-chatgpt-text-secondary">
                      •••• •••• •••• {method.lastFour} • Expires {method.expiry}
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  {method.isDefault && (
                    <span className="inline-flex items-center px-2 py-1 rounded-full sidebar-text font-normal bg-green-100 text-green-700">
                      Default
                    </span>
                  )}
                  <button className="text-gray-400 hover:text-gray-600 transition-colors duration-200">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default PaymentMethods;