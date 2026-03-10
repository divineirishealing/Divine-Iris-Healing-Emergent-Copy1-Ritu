import React from 'react';
import { Button } from './ui/button';

const SponsorSection = () => {
  return (
    <section className="py-20 bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="container mx-auto px-4">
        <div className="grid md:grid-cols-2 gap-12 items-center max-w-6xl mx-auto">
          {/* Content */}
          <div>
            <h2 className="text-4xl md:text-5xl font-serif text-gray-900 mb-6">
              Shine a Light in a Life
            </h2>
            <p className="text-gray-700 text-lg mb-4 leading-relaxed">
              Healing flows when we support each other.
            </p>
            <p className="text-gray-600 mb-4 leading-relaxed">
              Becoming a sponsor allows anyone to contribute towards someone else's healing—anonymously or intentionally.
              <br />
              It is not charity, it is conscious support.
              <br />
              When one heals, the collective heals.
            </p>
            <p className="text-gray-700 font-medium mb-8">
              Because healing should never wait for circumstances
            </p>

            <Button className="bg-yellow-600 hover:bg-yellow-700 text-white px-8 py-6 rounded-full text-base transition-all duration-300 shadow-lg hover:shadow-xl">
              Become a Sponsor
            </Button>
          </div>

          {/* Image */}
          <div className="order-first md:order-last">
            <div className="rounded-lg overflow-hidden shadow-xl">
              <img
                src="https://images.unsplash.com/photo-1469571486292-0ba58a3f068b?w=600&h=400&fit=crop"
                alt="Sponsor Support"
                className="w-full h-auto object-cover"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default SponsorSection;
