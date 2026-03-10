import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { testimonials as mockTestimonials } from '../mockData';
import { Play } from 'lucide-react';
import {
  Dialog,
  DialogContent,
} from './ui/dialog';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const TestimonialsSection = () => {
  const [testimonials, setTestimonials] = useState(mockTestimonials);
  const [selectedVideo, setSelectedVideo] = useState(null);

  useEffect(() => {
    loadTestimonials();
  }, []);

  const loadTestimonials = async () => {
    try {
      const response = await axios.get(`${API}/testimonials`);
      if (response.data && response.data.length > 0) {
        setTestimonials(response.data);
      }
    } catch (error) {
      console.log('Using mock data for testimonials');
    }
  };

  return (
    <section id="media" className="py-20 bg-white">
      <div className="container mx-auto px-4">
        <h2 className="text-4xl md:text-5xl font-serif text-center text-gray-900 mb-16">
          Testimonials
        </h2>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {testimonials.map((testimonial) => (
            <div
              key={testimonial.id}
              className="relative group cursor-pointer overflow-hidden rounded-lg shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2"
              onClick={() => setSelectedVideo(testimonial.videoId)}
            >
              <img
                src={testimonial.thumbnail}
                alt={`Testimonial ${testimonial.id}`}
                className="w-full h-64 object-cover transition-transform duration-500 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-black/40 group-hover:bg-black/60 transition-all duration-300 flex items-center justify-center">
                <div className="w-16 h-16 bg-yellow-600 rounded-full flex items-center justify-center transform group-hover:scale-110 transition-transform duration-300 shadow-xl">
                  <Play size={24} className="text-white ml-1" fill="white" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Video Modal */}
      <Dialog open={!!selectedVideo} onOpenChange={() => setSelectedVideo(null)}>
        <DialogContent className="max-w-4xl p-0 overflow-hidden">
          {selectedVideo && (
            <div className="relative" style={{ paddingBottom: '56.25%' }}>
              <iframe
                className="absolute inset-0 w-full h-full"
                src={`https://www.youtube.com/embed/${selectedVideo}?autoplay=1`}
                title="YouTube video player"
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              ></iframe>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </section>
  );
};

export default TestimonialsSection;
