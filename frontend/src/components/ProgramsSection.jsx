import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { programs as mockPrograms } from '../mockData';
import { Button } from './ui/button';
import { Card, CardContent } from './ui/card';
import { Badge } from './ui/badge';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const ProgramsSection = () => {
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
    <section id="programs" className="py-20 bg-white">
      <div className="container mx-auto px-4">
        <h2 className="text-4xl md:text-5xl font-serif text-center text-gray-900 mb-16">
          Flagship Programs
        </h2>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
          {programs.slice(0, 6).map((program) => (
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
                  Know More
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        {programs.length > 6 && (
          <div className="text-center mt-12">
            <Button
              onClick={() => navigate('/programs')}
              className="bg-yellow-600 hover:bg-yellow-700 text-white px-8 py-6"
            >
              View All Programs
            </Button>
          </div>
        )}
      </div>
    </section>
  );
};

export default ProgramsSection;
