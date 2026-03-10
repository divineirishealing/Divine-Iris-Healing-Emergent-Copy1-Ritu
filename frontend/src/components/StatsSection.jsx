import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { stats as mockStats } from '../mockData';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const StatsSection = () => {
  const [stats, setStats] = useState(mockStats);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      const response = await axios.get(`${API}/stats`);
      if (response.data && response.data.length > 0) {
        setStats(response.data);
      }
    } catch (error) {
      console.log('Using mock data for stats');
    }
  };

  return (
    <section data-testid="stats-section" className="py-16 bg-gray-900 text-white">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-5xl mx-auto">
          {stats.map((stat, index) => (
            <div key={index} className="text-center" data-testid={`stat-${index}`}>
              <div className="text-3xl md:text-5xl font-bold text-[#D4AF37] mb-2">
                {stat.value}
              </div>
              <div className="text-xs md:text-sm text-gray-400 tracking-[0.15em] uppercase">
                {stat.label}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default StatsSection;
