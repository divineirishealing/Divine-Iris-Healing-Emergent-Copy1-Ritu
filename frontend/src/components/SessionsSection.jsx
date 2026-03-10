import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { sessions as mockSessions } from '../mockData';
import { Button } from './ui/button';
import { Card, CardContent } from './ui/card';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const SessionsSection = () => {
  const navigate = useNavigate();
  const [sessions, setSessions] = useState(mockSessions);
  const [activeTab, setActiveTab] = useState(mockSessions[0]?.title);

  useEffect(() => {
    loadSessions();
  }, []);

  const loadSessions = async () => {
    try {
      const response = await axios.get(`${API}/sessions`);
      if (response.data && response.data.length > 0) {
        setSessions(response.data);
        setActiveTab(response.data[0]?.title);
      }
    } catch (error) {
      console.log('Using mock data for sessions');
    }
  };

  const handleSessionClick = (session) => {
    navigate(`/session/${session.id}`);
  };

  return (
    <section id="sessions" className="py-20 bg-gradient-to-br from-gray-900 to-gray-800 text-white">
      <div className="container mx-auto px-4">
        <h2 className="text-4xl md:text-5xl font-serif text-center mb-16">
          Book Personal Session
        </h2>

        {/* Tab Navigation */}
        <div className="mb-12 max-w-5xl mx-auto">
          <div className="flex flex-wrap gap-3 justify-center">
            {sessions.slice(0, 8).map((session) => (
              <button
                key={session.id}
                onClick={() => setActiveTab(session.title)}
                className={`px-4 py-2 rounded-full text-sm transition-all duration-300 ${
                  activeTab === session.title
                    ? 'bg-yellow-600 text-white shadow-lg'
                    : 'bg-white/10 text-white/80 hover:bg-white/20'
                }`}
              >
                {session.title}
              </button>
            ))}
          </div>
        </div>

        {/* Session Cards Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
          {sessions.slice(0, 6).map((session) => (
            <Card
              key={session.id}
              className="overflow-hidden bg-white hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 cursor-pointer border-0"
              onClick={() => handleSessionClick(session)}
            >
              <div className="relative h-48 overflow-hidden">
                <img
                  src={session.image}
                  alt={session.title}
                  className="w-full h-full object-cover transition-transform duration-500 hover:scale-110"
                />
              </div>
              <CardContent className="p-6">
                <h4 className="text-lg font-semibold text-gray-900 mb-3">
                  {session.title}
                </h4>
                <p className="text-gray-600 text-sm leading-relaxed mb-4 line-clamp-3">
                  {session.description}
                </p>
                <Button className="w-full bg-yellow-600 hover:bg-yellow-700 text-white">
                  View Details
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        {sessions.length > 6 && (
          <div className="text-center mt-12">
            <Button
              onClick={() => navigate('/sessions')}
              className="bg-yellow-600 hover:bg-yellow-700 text-white px-8 py-6"
            >
              View All Sessions
            </Button>
          </div>
        )}
      </div>
    </section>
  );
};

export default SessionsSection;
