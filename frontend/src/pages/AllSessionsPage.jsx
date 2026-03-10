import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { sessions as mockSessions } from '../mockData';
import Header from '../components/Header';
import Footer from '../components/Footer';
import FloatingButtons from '../components/FloatingButtons';
import { Card, CardContent } from '../components/ui/card';
import { Button } from '../components/ui/button';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

function AllSessionsPage() {
  const navigate = useNavigate();
  const [sessions, setSessions] = useState(mockSessions);

  useEffect(() => {
    loadSessions();
  }, []);

  const loadSessions = async () => {
    try {
      const response = await axios.get(`${API}/sessions`);
      if (response.data && response.data.length > 0) {
        setSessions(response.data);
      }
    } catch (error) {
      console.log('Using mock data for sessions');
    }
  };

  return (
    <>
      <Header />
      <div className="min-h-screen bg-white pt-20">
        <div className="container mx-auto px-4 py-12">
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-serif text-gray-900 mb-4">
              Personal Healing Sessions
            </h1>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Individual sessions tailored to your unique healing journey
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
            {sessions.map((session) => (
              <Card
                key={session.id}
                className="overflow-hidden hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 border-0 shadow-lg cursor-pointer"
                onClick={() => navigate(`/session/${session.id}`)}
              >
                <div className="relative h-48 overflow-hidden">
                  <img
                    src={session.image}
                    alt={session.title}
                    className="w-full h-full object-cover transition-transform duration-500 hover:scale-110"
                  />
                </div>
                <CardContent className="p-6">
                  <h3 className="text-xl font-semibold text-gray-900 mb-3 leading-tight">
                    {session.title}
                  </h3>
                  <p className="text-gray-600 text-sm leading-relaxed mb-4 line-clamp-3">
                    {session.description}
                  </p>
                  <Button
                    className="w-full bg-yellow-600 hover:bg-yellow-700 text-white transition-all duration-300"
                  >
                    View Details
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
      <Footer />
      <FloatingButtons />
    </>
  );
}

export default AllSessionsPage;
