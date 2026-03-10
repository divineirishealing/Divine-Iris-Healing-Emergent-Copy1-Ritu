import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { programs as mockPrograms } from '../mockData';
import { resolveImageUrl } from '../lib/imageUtils';

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
    <section id="programs" data-testid="programs-section" className="py-20 bg-white">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl md:text-4xl text-center text-gray-900 mb-16">
          Flagship Programs
        </h2>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
          {programs.slice(0, 6).map((program) => (
            <div
              key={program.id}
              data-testid={`program-card-${program.id}`}
              className="group cursor-pointer bg-white rounded-lg overflow-hidden shadow-md hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 border border-gray-100"
              onClick={() => navigate(`/program/${program.id}`)}
            >
              <div className="relative h-52 overflow-hidden">
                <img
                  src={resolveImageUrl(program.image)}
                  alt={program.title}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  onError={(e) => {
                    e.target.src = 'https://images.unsplash.com/photo-1545389336-cf090694435e?w=600&h=400&fit=crop';
                  }}
                />
                {program.category && (
                  <span className="absolute top-4 left-4 bg-white/90 text-gray-800 text-xs px-3 py-1 rounded-full font-medium tracking-wide">
                    {program.category}
                  </span>
                )}
              </div>
              <div className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-3 leading-tight">
                  {program.title}
                </h3>
                <p className="text-gray-500 text-sm leading-relaxed mb-4 line-clamp-3">
                  {program.description}
                </p>
                <span className="inline-block text-[#D4AF37] text-sm font-medium hover:text-[#b8962e] transition-colors tracking-wider">
                  Know More &rarr;
                </span>
              </div>
            </div>
          ))}
        </div>

        {programs.length > 6 && (
          <div className="text-center mt-12">
            <button
              onClick={() => navigate('/programs')}
              className="bg-[#D4AF37] hover:bg-[#b8962e] text-white px-8 py-3 rounded-full text-sm transition-all duration-300 shadow-lg tracking-wider"
            >
              View All Programs
            </button>
          </div>
        )}
      </div>
    </section>
  );
};

export default ProgramsSection;
