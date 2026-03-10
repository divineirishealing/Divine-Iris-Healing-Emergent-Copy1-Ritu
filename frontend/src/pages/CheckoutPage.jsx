import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Button } from '../components/ui/button';
import { ArrowLeft, ShoppingCart } from 'lucide-react';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

function CheckoutPage() {
  const { type, id } = useParams(); // type: 'program' or 'session'
  const navigate = useNavigate();
  const [item, setItem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currency, setCurrency] = useState('usd');
  const [currencySymbol, setCurrencySymbol] = useState('$');
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    loadItem();
    detectCurrency();
  }, [id, type]);

  const detectCurrency = async () => {
    try {
      const response = await axios.get(`${API}/currency/detect`);
      setCurrency(response.data.currency);
      setCurrencySymbol(response.data.symbol);
    } catch (error) {
      console.error('Currency detection failed:', error);
    }
  };

  const loadItem = async () => {
    try {
      const endpoint = type === 'program' ? 'programs' : 'sessions';
      const response = await axios.get(`${API}/${endpoint}/${id}`);
      setItem(response.data);
    } catch (error) {
      console.error('Error loading item:', error);
    } finally {
      setLoading(false);
    }
  };

  const getPrice = () => {
    if (!item) return 0;
    return item[`price_${currency}`] || item.price_usd || 0;
  };

  const handleCheckout = async (e) => {
    e.preventDefault();
    setProcessing(true);

    try {
      const checkoutData = {
        item_type: type,
        item_id: id,
        currency: currency,
        customer_email: email,
        customer_name: name,
        origin_url: window.location.origin
      };

      const response = await axios.post(`${API}/payments/checkout`, checkoutData);
      
      // Redirect to Stripe checkout
      window.location.href = response.data.url;
    } catch (error) {
      alert('Payment failed: ' + (error.response?.data?.detail || error.message));
      setProcessing(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-xl">Loading...</div>
      </div>
    );
  }

  if (!item) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Item Not Found</h2>
          <Button onClick={() => navigate('/')}>Back to Home</Button>
        </div>
      </div>
    );
  }

  const price = getPrice();

  return (
    <div className="min-h-screen bg-gray-100 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <Button
          variant="outline"
          onClick={() => navigate(-1)}
          className="mb-6"
        >
          <ArrowLeft size={18} className="mr-2" />
          Back
        </Button>

        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          <div className="md:flex">
            {/* Item Details */}
            <div className="md:w-1/2 p-8">
              <img
                src={item.image}
                alt={item.title}
                className="w-full h-64 object-cover rounded-lg mb-6"
              />
              <h1 className="text-3xl font-bold text-gray-900 mb-4">
                {item.title}
              </h1>
              <p className="text-gray-600 mb-4">{item.description}</p>
              <div className="text-4xl font-bold text-yellow-600">
                {currencySymbol}{price.toFixed(2)}
              </div>
            </div>

            {/* Checkout Form */}
            <div className="md:w-1/2 bg-gray-50 p-8">
              <h2 className="text-2xl font-bold mb-6">Complete Your Purchase</h2>
              
              <form onSubmit={handleCheckout} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                    placeholder="Enter your full name"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                    placeholder="Enter your email"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Currency
                  </label>
                  <select
                    value={currency}
                    onChange={(e) => {
                      setCurrency(e.target.value);
                      const symbols = { usd: '$', inr: '₹', eur: '€', gbp: '£' };
                      setCurrencySymbol(symbols[e.target.value]);
                    }}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                  >
                    <option value="usd">USD ($)</option>
                    <option value="inr">INR (₹)</option>
                    <option value="eur">EUR (€)</option>
                    <option value="gbp">GBP (£)</option>
                  </select>
                </div>

                <div className="border-t pt-4 mt-6">
                  <div className="flex justify-between text-lg font-semibold mb-4">
                    <span>Total:</span>
                    <span>{currencySymbol}{price.toFixed(2)}</span>
                  </div>

                  <Button
                    type="submit"
                    disabled={processing || price <= 0}
                    className="w-full bg-yellow-600 hover:bg-yellow-700 text-white py-3 text-lg"
                  >
                    {processing ? (
                      'Processing...'
                    ) : (
                      <>
                        <ShoppingCart size={20} className="mr-2" />
                        Proceed to Payment
                      </>
                    )}
                  </Button>

                  <p className="text-xs text-gray-500 mt-4 text-center">
                    Secure payment powered by Stripe
                  </p>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default CheckoutPage;
