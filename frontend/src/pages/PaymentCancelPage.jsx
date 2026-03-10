import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { XCircle } from 'lucide-react';

function PaymentCancelPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center px-4">
      <div className="max-w-md w-full">
        <div className="bg-white rounded-lg shadow-lg p-8 text-center">
          <XCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Payment Cancelled
          </h2>
          <p className="text-gray-600 mb-6">
            Your payment has been cancelled. No charges were made to your account.
          </p>
          <div className="space-y-3">
            <Button
              onClick={() => navigate(-1)}
              className="w-full bg-yellow-600 hover:bg-yellow-700 text-white"
            >
              Try Again
            </Button>
            <Button
              onClick={() => navigate('/')}
              variant="outline"
              className="w-full"
            >
              Back to Home
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default PaymentCancelPage;
