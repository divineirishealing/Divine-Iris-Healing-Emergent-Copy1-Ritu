import React, { useState, useEffect } from 'react';
import axios from 'axios';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

function resolveUrl(url) {
  if (!url) return '';
  if (url.startsWith('/api/image/')) return `${BACKEND_URL}${url}`;
  return url;
}

const AboutSection = () => {
  const [settings, setSettings] = useState(null);

  useEffect(() => {
    axios.get(`${API}/settings`).then(r => setSettings(r.data)).catch(() => {});
  }, []);

  const s = settings || {};
  const logoUrl = s.logo_url ? resolveUrl(s.logo_url) : 'https://divineirishealing.com/assets/images/Divine-iris-logo.png';
  const logoWidth = s.logo_width || 96;
  const aboutImage = s.about_image ? resolveUrl(s.about_image) : 'https://divineirishealing.com/assets/images/dimple_ranawat.png';

  return (
    <section id="about" data-testid="about-section" className="py-20 bg-white">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-center mb-12">
          <img src={logoUrl} alt="Logo" data-testid="site-logo" style={{ width: `${logoWidth}px`, height: 'auto' }} className="object-contain"
            onError={(e) => { e.target.style.display = 'none'; }} />
        </div>

        <div className="grid md:grid-cols-2 gap-12 items-start max-w-5xl mx-auto">
          <div className="order-2 md:order-1">
            <div className="rounded-lg overflow-hidden">
              <img src={aboutImage} alt={s.about_name || 'Healer'} className="w-full h-auto object-cover"
                onError={(e) => { e.target.src = 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=600&h=700&fit=crop&crop=faces'; }} />
            </div>
          </div>

          <div className="order-1 md:order-2">
            <p className="text-[#D4AF37] text-[10px] font-medium tracking-[0.3em] mb-3 uppercase" style={{ fontFamily: "'Lato', sans-serif" }}>
              {s.about_subtitle || 'Meet the Healer'}
            </p>
            <h2 data-testid="about-heading" className="text-gray-900 mb-2" style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '2.2rem', fontWeight: 600 }}>
              {s.about_name || 'Dimple Ranawat'}
            </h2>
            <h3 className="text-[#D4AF37] text-sm mb-6" style={{ fontFamily: "'Cormorant Garamond', serif" }}>
              {s.about_title || 'Founder, Divine Iris – Soulful Healing Studio'}
            </h3>

            <div className="space-y-4">
              <p className="text-gray-500 leading-relaxed" style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '0.9rem', lineHeight: '1.8' }}>
                {s.about_bio || 'Dimple Ranawat is an internationally recognised healer, accountability coach, and life transformation mentor whose work is reshaping how the world understands healing, growth, and well-being.'}
              </p>
              {(s.about_bio_2) && (
                <>
                  <h4 className="text-gray-900 font-semibold text-sm mt-4 mb-2" style={{ fontFamily: "'Cormorant Garamond', serif" }}>Personal Journey</h4>
                  <p className="text-gray-500 leading-relaxed" style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '0.9rem', lineHeight: '1.8' }}>{s.about_bio_2}</p>
                </>
              )}
            </div>

            <a href="/about" data-testid="read-full-bio-btn"
              className="inline-block mt-8 border border-[#D4AF37] text-[#D4AF37] hover:bg-[#D4AF37] hover:text-white px-8 py-3 text-[10px] transition-all duration-300 tracking-[0.2em] uppercase">
              {s.about_button_text || 'Read Full Bio'}
            </a>
          </div>
        </div>
      </div>
    </section>
  );
};

export default AboutSection;
