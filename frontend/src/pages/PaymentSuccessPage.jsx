import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import axios from 'axios';
import { Button } from '../components/ui/button';
import { CheckCircle, Loader } from 'lucide-react';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

function PaymentSuccessPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState('checking'); // checking, success, failed
  const [transaction, setTransaction] = useState(null);
  const sessionId = searchParams.get('session_id');

  useEffect(() => {
    if (sessionId) {
      checkPaymentStatus();
    }
  }, [sessionId]);

  const checkPaymentStatus = async () => {
    let attempts = 0;
    const maxAttempts = 10;

    const poll = async () => {
      if (attempts >= maxAttempts) {
        setStatus('failed');
        return;
      }

      try {
        const response = await axios.get(`${API}/payments/status/${sessionId}`);
        const data = response.data;

        if (data.payment_status === 'paid') {
          setStatus('success');
          setTransaction(data);
          return;
        }

        attempts++;
        setTimeout(poll, 2000); // Poll every 2 seconds
      } catch (error) {
        console.error('Error checking status:', error);
        attempts++;
        setTimeout(poll, 2000);
      }
    };

    poll();
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center px-4">
      <div className="max-w-md w-full">
        <div className="bg-white rounded-lg shadow-lg p-8 text-center">
          {status === 'checking' && (
            <>
              <Loader className="w-16 h-16 text-yellow-600 mx-auto mb-4 animate-spin" />
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Processing Your Payment
              </h2>
              <p className="text-gray-600">
                Please wait while we confirm your payment...
              </p>
            </>
          )}

          {status === 'success' && (
            <>
              <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Payment Successful!
              </h2>
              <p className="text-gray-600 mb-6">
                Thank you for your purchase. You will receive a confirmation email shortly.
              </p>
              
              {transaction && (
                <div className="bg-gray-50 rounded-lg p-4 mb-6 text-left">
                  <h3 className="font-semibold mb-2">Transaction Details:</h3>
                  <p className="text-sm text-gray-600">
                    <strong>Item:</strong> {transaction.item_title}
                  </p>
                  <p className="text-sm text-gray-600">
                    <strong>Amount:</strong> {transaction.currency.toUpperCase()} {transaction.amount}
                  </p>
                  <p className="text-sm text-gray-600">
                    <strong>Email:</strong> {transaction.customer_email}
                  </p>
                </div>
              )}

              <Button
                onClick={() => navigate('/')}
                className="w-full bg-yellow-600 hover:bg-yellow-700 text-white"
              >
                Back to Home
              </Button>
            </>
          )}

          {status === 'failed' && (
            <>
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-3xl text-red-600">✕</span>
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Payment Verification Failed
              </h2>
              <p className="text-gray-600 mb-6">
                We couldn't verify your payment. Please check your email for confirmation or contact support.
              </p>
              <Button
                onClick={() => navigate('/')}
                variant="outline"
                className="w-full"
              >
                Back to Home
              </Button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default PaymentSuccessPage;
