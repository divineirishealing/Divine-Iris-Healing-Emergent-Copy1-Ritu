import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { testimonials as mockTestimonials } from '../mockData';
import { Play, ChevronLeft, ChevronRight } from 'lucide-react';
import { Dialog, DialogContent } from './ui/dialog';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const TestimonialsSection = () => {
  const [testimonials, setTestimonials] = useState(mockTestimonials);
  const [selectedVideo, setSelectedVideo] = useState(null);
  const scrollRef = useRef(null);

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

  const scroll = (dir) => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({ left: dir * 320, behavior: 'smooth' });
    }
  };

  return (
    <section id="media" data-testid="testimonials-section" className="py-20 bg-white">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl md:text-4xl text-center text-gray-900 mb-12">
          Testimonials
        </h2>

        {/* Horizontal carousel */}
        <div className="relative max-w-6xl mx-auto">
          <button
            onClick={() => scroll(-1)}
            data-testid="testimonial-prev"
            className="absolute left-0 top-1/2 -translate-y-1/2 z-10 w-10 h-10 bg-white shadow-lg rounded-full flex items-center justify-center hover:bg-gray-50 transition-colors -ml-5"
          >
            <ChevronLeft size={20} />
          </button>

          <div
            ref={scrollRef}
            className="flex gap-6 overflow-x-auto scroll-smooth pb-4 px-2"
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
          >
            {testimonials.map((testimonial) => (
              <div
                key={testimonial.id}
                data-testid={`testimonial-card-${testimonial.id}`}
                className="flex-shrink-0 w-72 md:w-80 relative group cursor-pointer overflow-hidden rounded-lg shadow-lg hover:shadow-2xl transition-all duration-300"
                onClick={() => setSelectedVideo(testimonial.videoId)}
              >
                <img
                  src={testimonial.thumbnail}
                  alt={`Testimonial ${testimonial.id}`}
                  className="w-full h-48 md:h-52 object-cover transition-transform duration-500 group-hover:scale-105"
                  onError={(e) => {
                    e.target.src = `https://img.youtube.com/vi/${testimonial.videoId}/hqdefault.jpg`;
                  }}
                />
                <div className="absolute inset-0 bg-black/30 group-hover:bg-black/50 transition-all duration-300 flex items-center justify-center">
                  <div className="w-14 h-14 bg-[#D4AF37] rounded-full flex items-center justify-center transform group-hover:scale-110 transition-transform duration-300 shadow-xl">
                    <Play size={20} className="text-white ml-0.5" fill="white" />
                  </div>
                </div>
              </div>
            ))}
          </div>

          <button
            onClick={() => scroll(1)}
            data-testid="testimonial-next"
            className="absolute right-0 top-1/2 -translate-y-1/2 z-10 w-10 h-10 bg-white shadow-lg rounded-full flex items-center justify-center hover:bg-gray-50 transition-colors -mr-5"
          >
            <ChevronRight size={20} />
          </button>
        </div>
      </div>

      {/* Video Modal */}
      <Dialog open={!!selectedVideo} onOpenChange={() => setSelectedVideo(null)}>
        <DialogContent className="max-w-4xl p-0 overflow-hidden bg-black">
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
