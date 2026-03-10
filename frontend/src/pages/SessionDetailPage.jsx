import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Button } from '../components/ui/button';
import { ArrowLeft, Calendar, Clock } from 'lucide-react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import FloatingButtons from '../components/FloatingButtons';
import { resolveImageUrl } from '../lib/imageUtils';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

function SessionDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSession();
  }, [id]);

  const loadSession = async () => {
    try {
      const response = await axios.get(`${API}/sessions/${id}`);
      setSession(response.data);
    } catch (error) {
      console.error('Error loading session:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl text-gray-600">Loading...</div>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Session Not Found</h2>
          <Button onClick={() => navigate('/')}>Back to Home</Button>
        </div>
      </div>
    );
  }

  return (
    <>
      <Header />
      <div className="min-h-screen bg-white pt-20">
        <div className="container mx-auto px-4 py-12">
          <Button
            variant="outline"
            onClick={() => navigate('/')}
            className="mb-8"
          >
            <ArrowLeft size={18} className="mr-2" />
            Back to Home
          </Button>

          <div className="max-w-4xl mx-auto">
            {/* Hero Image */}
            <div className="mb-8 rounded-lg overflow-hidden shadow-2xl">
              <img
                src={resolveImageUrl(session.image)}
                alt={session.title}
                className="w-full h-96 object-cover"
              />
            </div>

            {/* Title */}
            <h1 className="text-4xl md:text-5xl font-serif text-gray-900 mb-6">
              {session.title}
            </h1>

            {/* Session Details */}
            <div className="flex gap-6 mb-8 text-gray-600">
              <div className="flex items-center gap-2">
                <Clock size={20} />
                <span>60-90 minutes</span>
              </div>
              <div className="flex items-center gap-2">
                <Calendar size={20} />
                <span>By Appointment</span>
              </div>
            </div>

            {/* Description */}
            <div className="prose prose-lg max-w-none">
              <div className="bg-gradient-to-br from-amber-50 to-orange-50 p-8 rounded-lg mb-8">
                <h2 className="text-2xl font-serif text-gray-900 mb-4">About This Session</h2>
                <p className="text-gray-700 text-lg leading-relaxed">
                  {session.description}
                </p>
              </div>

              <div className="grid md:grid-cols-2 gap-6 mb-8">
                <div className="bg-white border-2 border-gray-200 p-6 rounded-lg">
                  <h3 className="text-xl font-semibold text-gray-900 mb-3">What to Expect</h3>
                  <ul className="space-y-2 text-gray-700">
                    <li>✓ Personalized healing approach</li>
                    <li>✓ Safe and supportive environment</li>
                    <li>✓ Immediate energetic shifts</li>
                    <li>✓ Practical guidance for integration</li>
                  </ul>
                </div>

                <div className="bg-white border-2 border-gray-200 p-6 rounded-lg">
                  <h3 className="text-xl font-semibold text-gray-900 mb-3">Who Is This For</h3>
                  <ul className="space-y-2 text-gray-700">
                    <li>✓ Anyone seeking deep healing</li>
                    <li>✓ Those ready for transformation</li>
                    <li>✓ Individuals committed to growth</li>
                    <li>✓ Open to energetic work</li>
                  </ul>
                </div>
              </div>

              <div className="bg-gray-900 text-white p-8 rounded-lg mb-8">
                <h2 className="text-2xl font-serif mb-4">Book Your Personal Session</h2>
                <p className="mb-6 text-gray-300">
                  Ready to experience this transformative healing session? Connect with us to schedule your appointment.
                </p>
                <div className="flex gap-4">
                  {session.price_usd > 0 && (
                    <Button 
                      className="bg-yellow-600 hover:bg-yellow-700 text-white"
                      onClick={() => navigate(`/checkout/session/${session.id}`)}
                    >
                      Book Now - From ${session.price_usd}
                    </Button>
                  )}
                  <Button variant="outline" className="text-white border-white hover:bg-white hover:text-gray-900">
                    Ask a Question
                  </Button>
                </div>
              </div>

              <div className="bg-blue-50 border-l-4 border-blue-500 p-6 rounded">
                <h3 className="text-lg font-semibold text-blue-900 mb-2">Note</h3>
                <p className="text-blue-800">
                  All sessions are conducted remotely or in-person based on your preference. Each session is customized to your unique needs and current state.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
      <Footer />
      <FloatingButtons />
    </>
  );
}

export default SessionDetailPage;
