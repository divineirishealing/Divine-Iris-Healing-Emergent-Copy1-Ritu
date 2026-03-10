import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { programs as mockPrograms } from '../mockData';
import Header from '../components/Header';
import Footer from '../components/Footer';
import FloatingButtons from '../components/FloatingButtons';
import { Card, CardContent } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

function AllProgramsPage() {
  const navigate = useNavigate();
  const [programs, setPrograms] = useState(mockPrograms);

  useEffect(() => {
    loadPrograms();
  }, []);

  const loadPrograms = async () => {
    try {
      const response = await axios.get(`${API}/programs`);
      if (response.data && response.data.length > 0) {
        setPrograms(response.data);
      }
    } catch (error) {
      console.log('Using mock data for programs');
    }
  };

  return (
    <>
      <Header />
      <div className="min-h-screen bg-white pt-20">
        <div className="container mx-auto px-4 py-12">
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-serif text-gray-900 mb-4">
              All Programs
            </h1>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Explore our comprehensive healing programs designed to transform your life at every level
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
            {programs.map((program) => (
              <Card
                key={program.id}
                className="overflow-hidden hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 border-0 shadow-lg cursor-pointer"
                onClick={() => navigate(`/program/${program.id}`)}
              >
                <div className="relative h-48 overflow-hidden">
                  <img
                    src={program.image}
                    alt={program.title}
                    className="w-full h-full object-cover transition-transform duration-500 hover:scale-110"
                  />
                  <div className="absolute top-4 left-4">
                    <Badge className="bg-white/90 text-gray-900 hover:bg-white">
                      {program.category}
                    </Badge>
                  </div>
                </div>
                <CardContent className="p-6">
                  <h3 className="text-xl font-semibold text-gray-900 mb-3 leading-tight">
                    {program.title}
                  </h3>
                  <p className="text-gray-600 text-sm leading-relaxed mb-4">
                    {program.description}
                  </p>
                  <Button
                    variant="outline"
                    className="w-full border-yellow-600 text-yellow-600 hover:bg-yellow-600 hover:text-white transition-all duration-300"
                  >
                    Learn More
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

export default AllProgramsPage;
