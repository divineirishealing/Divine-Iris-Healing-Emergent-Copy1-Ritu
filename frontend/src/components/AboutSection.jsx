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

        <div className="grid md:grid-cols-2 gap-12 items-center max-w-6xl mx-auto">
          <div className="order-2 md:order-1">
            <div className="relative rounded-lg overflow-hidden shadow-xl">
              <img src={aboutImage} alt={s.about_name || 'Healer'} className="w-full h-auto object-cover"
                onError={(e) => { e.target.src = 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=600&h=700&fit=crop&crop=faces'; }} />
            </div>
          </div>

          <div className="order-1 md:order-2">
            <p className="text-[#D4AF37] text-xs font-medium tracking-[0.2em] mb-3 uppercase">{s.about_subtitle || 'Meet the Healer'}</p>
            <h2 data-testid="about-heading" className="text-4xl md:text-5xl text-gray-900 mb-4">{s.about_name || 'Dimple Ranawat'}</h2>
            <h3 className="text-[#D4AF37] text-base md:text-lg mb-6 font-light">{s.about_title || 'Founder, Divine Iris – Soulful Healing Studio'}</h3>

            <div className="space-y-4 text-gray-600 leading-relaxed text-sm md:text-base">
              <p>{s.about_bio || 'Dimple Ranawat is an internationally recognised healer, accountability coach, and life transformation mentor whose work is reshaping how the world understands healing, growth, and well-being.'}</p>
              {(s.about_bio_2) && (
                <>
                  <h4 className="text-gray-900 font-semibold text-base mt-6 mb-3">Personal Journey</h4>
                  <p>{s.about_bio_2}</p>
                </>
              )}
            </div>

            {(s.about_button_text) && (
              <a href={s.about_button_link || '/#about'}
                className="inline-block mt-8 bg-[#D4AF37] hover:bg-[#b8962e] text-white px-8 py-3 rounded-full text-sm transition-all duration-300 shadow-lg hover:shadow-xl tracking-wider">
                {s.about_button_text || 'Read Full Bio'}
              </a>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};

export default AboutSection;
