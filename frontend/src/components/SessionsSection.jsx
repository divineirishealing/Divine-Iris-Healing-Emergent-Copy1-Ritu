import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { sessions as mockSessions } from '../mockData';
import { resolveImageUrl } from '../lib/imageUtils';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const SessionsSection = () => {
  const navigate = useNavigate();
  const [sessions, setSessions] = useState(mockSessions);
  const [selectedSession, setSelectedSession] = useState(null);

  useEffect(() => {
    loadSessions();
  }, []);

  const loadSessions = async () => {
    try {
      const response = await axios.get(`${API}/sessions`);
      if (response.data && response.data.length > 0) {
        setSessions(response.data);
        setSelectedSession(response.data[0]);
      } else {
        setSelectedSession(mockSessions[0]);
      }
    } catch (error) {
      console.log('Using mock data for sessions');
      setSelectedSession(mockSessions[0]);
    }
  };

  return (
    <section id="sessions" data-testid="sessions-section" className="py-20 bg-gray-900 text-white">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl md:text-4xl text-center mb-12">
          Book Personal Session
        </h2>

        {/* Session tabs - horizontal scrollable list */}
        <div className="mb-10 max-w-5xl mx-auto">
          <div className="flex flex-wrap gap-2 justify-center">
            {sessions.map((session) => (
              <button
                key={session.id}
                data-testid={`session-tab-${session.id}`}
                onClick={() => setSelectedSession(session)}
                className={`px-4 py-2 rounded-full text-xs transition-all duration-300 tracking-wide ${
                  selectedSession?.id === session.id
                    ? 'bg-[#D4AF37] text-white shadow-lg'
                    : 'bg-white/10 text-white/70 hover:bg-white/20 hover:text-white'
                }`}
              >
                {session.title}
              </button>
            ))}
          </div>
        </div>

        {/* Selected session detail */}
        {selectedSession && (
          <div data-testid="selected-session-detail" className="max-w-4xl mx-auto">
            <div className="bg-white rounded-lg overflow-hidden shadow-2xl">
              <div className="h-64 overflow-hidden">
                <img
                  src={resolveImageUrl(selectedSession.image)}
                  alt={selectedSession.title}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.target.src = 'https://images.unsplash.com/photo-1518531933037-91b2f5f229cc?w=800&h=400&fit=crop';
                  }}
                />
              </div>
              <div className="p-8">
                <h3 className="text-2xl text-gray-900 mb-4">{selectedSession.title}</h3>
                <p className="text-gray-600 text-sm leading-relaxed mb-6">
                  {selectedSession.description}
                </p>
                <button
                  onClick={() => navigate(`/session/${selectedSession.id}`)}
                  className="bg-gray-900 hover:bg-gray-800 text-white px-8 py-3 rounded-full text-sm transition-all duration-300 tracking-wider"
                >
                  View Details & Book
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Session cards grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-7xl mx-auto mt-12">
          {sessions.slice(0, 6).map((session) => (
            <div
              key={session.id}
              data-testid={`session-card-${session.id}`}
              className="group cursor-pointer bg-white rounded-lg overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1"
              onClick={() => navigate(`/session/${session.id}`)}
            >
              <div className="h-44 overflow-hidden">
                <img
                  src={resolveImageUrl(session.image)}
                  alt={session.title}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  onError={(e) => {
                    e.target.src = 'https://images.unsplash.com/photo-1518531933037-91b2f5f229cc?w=400&h=300&fit=crop';
                  }}
                />
              </div>
              <div className="p-5">
                <h4 className="text-base font-semibold text-gray-900 mb-2">{session.title}</h4>
                <p className="text-gray-500 text-xs leading-relaxed line-clamp-2 mb-3">{session.description}</p>
                <span className="text-[#D4AF37] text-xs font-medium tracking-wider">View Details &rarr;</span>
              </div>
            </div>
          ))}
        </div>

        {sessions.length > 6 && (
          <div className="text-center mt-10">
            <button
              onClick={() => navigate('/sessions')}
              data-testid="view-all-sessions-btn"
              className="bg-[#D4AF37] hover:bg-[#b8962e] text-white px-8 py-3 rounded-full text-sm transition-all duration-300 shadow-lg tracking-wider"
            >
              View All Sessions
            </button>
          </div>
        )}
      </div>
    </section>
  );
};

export default SessionsSection;
