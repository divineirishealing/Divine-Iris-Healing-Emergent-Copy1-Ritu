import React from 'react';

const HeroSection = () => {
  return (
    <section
      id="home"
      data-testid="hero-section"
      className="relative min-h-screen flex items-center justify-center overflow-hidden"
      style={{ background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 25%, #0f3460 50%, #1a1a2e 75%, #0d1b2a 100%)' }}
    >
      {/* Video-like animated overlay */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-black/50"></div>
        <div
          className="absolute inset-0 opacity-20"
          style={{
            backgroundImage: 'radial-gradient(ellipse at 20% 50%, rgba(212,175,55,0.15) 0%, transparent 60%), radial-gradient(ellipse at 80% 50%, rgba(212,175,55,0.1) 0%, transparent 60%)',
          }}
        ></div>
      </div>

      {/* Content */}
      <div className="relative z-10 text-center px-4">
        {/* Logo */}
        <div className="mb-8">
          <img
            src="https://divineirishealing.com/assets/images/Divine-iris-logo.png"
            alt="Divine Iris Logo"
            className="w-20 h-20 md:w-28 md:h-28 mx-auto object-contain opacity-90"
            onError={(e) => { e.target.style.display = 'none'; }}
          />
        </div>

        <h1
          data-testid="hero-title"
          className="text-white text-5xl sm:text-6xl md:text-8xl mb-4 tracking-wider animate-fade-in leading-tight"
          style={{ fontWeight: 400 }}
        >
          Divine Iris
          <br />
          Healing
        </h1>

        <div className="flex items-center justify-center space-x-4 mt-6 animate-fade-in" style={{ animationDelay: '0.3s' }}>
          <div className="h-px w-12 md:w-20 bg-[#D4AF37]/60"></div>
          <p className="text-[#D4AF37] text-sm md:text-base tracking-[0.3em] font-light">
            ETERNAL HAPPINESS
          </p>
          <div className="h-px w-12 md:w-20 bg-[#D4AF37]/60"></div>
        </div>
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
        <div className="w-6 h-10 border-2 border-white/30 rounded-full flex items-start justify-center p-2">
          <div className="w-1 h-3 bg-white/40 rounded-full"></div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
