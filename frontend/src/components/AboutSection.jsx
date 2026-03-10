import React from 'react';

const AboutSection = () => {
  return (
    <section id="about" data-testid="about-section" className="py-20 bg-white">
      <div className="container mx-auto px-4">
        {/* Logo centered */}
        <div className="flex items-center justify-center mb-12">
          <img
            src="https://divineirishealing.com/assets/images/Divine-iris-logo.png"
            alt="Divine Iris Logo"
            className="w-20 h-20 md:w-24 md:h-24 object-contain"
            onError={(e) => { e.target.style.display = 'none'; }}
          />
        </div>

        <div className="grid md:grid-cols-2 gap-12 items-center max-w-6xl mx-auto">
          {/* Image */}
          <div className="order-2 md:order-1">
            <div className="relative rounded-lg overflow-hidden shadow-xl">
              <img
                src="https://divineirishealing.com/assets/images/dimple_ranawat.png"
                alt="Dimple Ranawat"
                className="w-full h-auto object-cover"
                onError={(e) => {
                  e.target.src = 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=600&h=700&fit=crop&crop=faces';
                }}
              />
            </div>
          </div>

          {/* Content */}
          <div className="order-1 md:order-2">
            <p className="text-[#D4AF37] text-xs font-medium tracking-[0.2em] mb-3 uppercase">Meet the Healer</p>
            <h2 data-testid="about-heading" className="text-4xl md:text-5xl text-gray-900 mb-4">Dimple Ranawat</h2>
            <h3 className="text-[#D4AF37] text-base md:text-lg mb-6 font-light">Founder, Divine Iris – Soulful Healing Studio</h3>

            <div className="space-y-4 text-gray-600 leading-relaxed text-sm md:text-base">
              <p>
                Dimple Ranawat is an internationally recognised healer, accountability coach, and life transformation mentor whose work is reshaping how the world understands healing, growth, and well-being. She is the founder of <strong className="text-gray-800">Divine Iris – Soulful Healing Studio</strong> and the visionary creator of several life-transforming programs, including the <em>Atomic Weight Release Program (AWRP)</em>, <em>Atomic Musculoskeletal Regeneration Program (AMRP)</em>, and <em>SoulSync Neuro-Harmonics</em>.
              </p>

              <h4 className="text-gray-900 font-semibold text-base mt-6 mb-3">Personal Journey</h4>
              <p>
                Dimple's journey began with a profound question: <em>"Why do people continue to suffer despite awareness, effort, and access to solutions?"</em> Her work is rooted in lived experience and deep inquiry, discovering that lasting change happens when the deeper layers of the human system feel safe enough to release.
              </p>
            </div>

            <a
              href="/#about"
              className="inline-block mt-8 bg-[#D4AF37] hover:bg-[#b8962e] text-white px-8 py-3 rounded-full text-sm transition-all duration-300 shadow-lg hover:shadow-xl tracking-wider"
            >
              Read Full Bio
            </a>
          </div>
        </div>
      </div>
    </section>
  );
};

export default AboutSection;
