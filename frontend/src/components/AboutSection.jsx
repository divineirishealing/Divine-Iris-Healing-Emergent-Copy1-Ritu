import React from 'react';
import { Button } from './ui/button';

const AboutSection = () => {
  return (
    <section id="about" className="py-20 bg-white">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-center mb-12">
          <img
            src="https://images.unsplash.com/photo-1502823403499-6ccfcf4fb453?w=150&h=150&fit=crop&crop=faces"
            alt="Divine Iris Logo"
            className="w-24 h-24 md:w-32 md:h-32 object-contain"
          />
        </div>

        <div className="grid md:grid-cols-2 gap-12 items-center max-w-6xl mx-auto">
          {/* Image */}
          <div className="order-2 md:order-1">
            <div className="relative rounded-lg overflow-hidden shadow-xl">
              <div className="absolute inset-0 bg-gradient-to-br from-cyan-200 via-pink-200 to-pink-300"></div>
              <img
                src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=600&h=700&fit=crop&crop=faces"
                alt="Dimple Ranawat"
                className="relative w-full h-auto object-cover"
              />
            </div>
          </div>

          {/* Content */}
          <div className="order-1 md:order-2">
            <p className="text-yellow-600 text-sm font-medium tracking-wider mb-3">MEET THE HEALER</p>
            <h2 className="text-4xl md:text-5xl font-serif text-gray-900 mb-4">Dimple Ranawat</h2>
            <h3 className="text-yellow-600 text-lg mb-6">Founder, Divine Iris – Soulful Healing Studio</h3>
            
            <div className="space-y-4 text-gray-700 leading-relaxed">
              <p>
                Dimple Ranawat is an internationally recognised healer, accountability coach, and life transformation mentor whose work is reshaping how the world understands healing, growth, and well-being. She is the founder of <strong>Divine Iris – Soulful Healing Studio</strong> and the visionary creator of several life-transforming programs, including the <em>Atomic Weight Release Program (AWRP)</em>, <em>Atomic Musculoskeletal Regeneration Program (AMRP)</em>, and <em>SoulSync Neuro-Harmonics</em>.
              </p>

              <h4 className="text-gray-900 font-semibold text-lg mt-6 mb-3">Personal Journey</h4>
              <p>
                Dimple's journey began with a profound question: <em>"Why do people continue to suffer despite awareness, effort, and access to solutions?"</em> Her work is rooted in lived experience and deep inquiry, discovering that lasting change happens when the deeper layers of the human system feel safe enough to release. She blends empathy, clarity, and grounded wisdom to help individuals release emotional, mental, and subconscious patterns, returning to their natural state of balance.
              </p>
            </div>

            <Button className="mt-8 bg-yellow-600 hover:bg-yellow-700 text-white px-8 py-6 rounded-full text-base transition-all duration-300 shadow-lg hover:shadow-xl">
              Read Full Bio
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default AboutSection;
