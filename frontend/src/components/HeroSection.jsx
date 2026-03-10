import React from 'react';

const HeroSection = () => {
  return (
    <section id="home" className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background Video Overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-gray-400 via-gray-500 to-gray-600">
        <div className="absolute inset-0 bg-black/40"></div>
      </div>

      {/* Content */}
      <div className="relative z-10 text-center px-4">
        <h1 className="text-white text-6xl md:text-8xl font-serif mb-4 tracking-wider animate-fade-in">
          Divine Iris
          <br />
          Healing
        </h1>
        <div className="flex items-center justify-center space-x-4 mt-6">
          <div className="h-px w-16 bg-white/50"></div>
          <p className="text-white text-lg md:text-xl tracking-widest font-light">
            ETERNAL HAPPINESS
          </p>
          <div className="h-px w-16 bg-white/50"></div>
        </div>
      </div>

      {/* Scroll Indicator */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
        <div className="w-6 h-10 border-2 border-white/50 rounded-full flex items-start justify-center p-2">
          <div className="w-1 h-3 bg-white/50 rounded-full"></div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
