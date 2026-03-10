import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Header from '../components/Header';
import Footer from '../components/Footer';
import FloatingButtons from '../components/FloatingButtons';
import { resolveImageUrl } from '../lib/imageUtils';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

function ServicesPage() {
  const navigate = useNavigate();
  const [sessions, setSessions] = useState([]);
  const [selectedSession, setSelectedSession] = useState(null);

  useEffect(() => {
    loadSessions();
  }, []);

  const loadSessions = async () => {
    try {
      const response = await axios.get(`${API}/sessions`);
      setSessions(response.data);
      if (response.data.length > 0) {
        setSelectedSession(response.data[0]);
      }
    } catch (error) {
      console.error('Error loading sessions:', error);
    }
  };

  return (
    <div className="min-h-screen bg-white">
      <Header />

      {/* Hero */}
      <section
        className="min-h-[35vh] flex flex-col items-center justify-center text-center px-4 pt-24"
        style={{ background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 25%, #0f3460 50%, #1a1a2e 75%, #0d1b2a 100%)' }}
      >
        <h1
          data-testid="services-title"
          className="text-4xl md:text-6xl mb-4 tracking-wider"
          style={{ color: '#D4AF37', fontWeight: 400 }}
        >
          Book Personal Session
        </h1>
      </section>

      {/* Sidebar Layout */}
      <div className="py-12">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto grid md:grid-cols-[280px_1fr] gap-8">
            {/* Left Sidebar */}
            <div data-testid="services-sidebar" className="bg-gray-50 rounded-lg p-3">
              <div className="space-y-1">
                {sessions.map((session) => (
                  <button
                    key={session.id}
                    data-testid={`service-tab-${session.id}`}
                    onClick={() => setSelectedSession(session)}
                    className={`w-full text-left px-4 py-3 rounded-md transition-all text-sm ${
                      selectedSession?.id === session.id
                        ? 'bg-[#D4AF37] text-white font-medium'
                        : 'hover:bg-gray-100 text-gray-700'
                    }`}
                  >
                    {session.title}
                  </button>
                ))}
              </div>
            </div>

            {/* Right - Session Detail */}
            {selectedSession && (
              <div data-testid="service-detail" className="bg-white rounded-lg">
                <div className="mb-6 rounded-lg overflow-hidden">
                  <img
                    src={resolveImageUrl(selectedSession.image)}
                    alt={selectedSession.title}
                    className="w-full h-64 object-cover"
                    onError={(e) => {
                      e.target.src = 'https://images.unsplash.com/photo-1502823403499-6ccfcf4fb453?w=800&h=400&fit=crop';
                    }}
                  />
                </div>
                <h2 className="text-3xl text-gray-900 mb-4">{selectedSession.title}</h2>
                <p className="text-gray-600 leading-relaxed text-sm mb-8">{selectedSession.description}</p>
                <button
                  onClick={() => navigate(`/session/${selectedSession.id}`)}
                  data-testid="view-details-book-btn"
                  className="bg-gray-900 hover:bg-gray-800 text-white px-8 py-3 rounded-full text-sm transition-all duration-300 tracking-wider"
                >
                  VIEW DETAILS & BOOK
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      <Footer />
      <FloatingButtons />
    </div>
  );
}

export default ServicesPage;
