import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { HEADING, BODY, GOLD, CONTAINER } from '../lib/designTokens';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const applyHeroStyle = (styleObj, defaults = {}) => {
  if (!styleObj || Object.keys(styleObj).length === 0) return defaults;
  return { ...defaults, ...(styleObj.font_family && { fontFamily: styleObj.font_family }), ...(styleObj.font_size && { fontSize: styleObj.font_size }), ...(styleObj.font_color && { color: styleObj.font_color }), ...(styleObj.font_weight && { fontWeight: styleObj.font_weight }), ...(styleObj.font_style && { fontStyle: styleObj.font_style }) };
};

const SponsorSection = () => {
  const [settings, setSettings] = useState(null);
  useEffect(() => { axios.get(`${API}/settings`).then(r => setSettings(r.data)).catch(() => {}); }, []);

  const hero = settings?.page_heroes?.sponsor || {};

  return (
    <section data-testid="sponsor-section" className="py-20 bg-gradient-to-br from-gray-50 to-gray-100">
      <div className={CONTAINER}>
        <div className="grid md:grid-cols-2 gap-12 items-center max-w-7xl mx-auto">
          <div>
            <h2 className="mb-6 leading-tight" style={applyHeroStyle(hero.title_style, { ...HEADING, fontSize: 'clamp(1.5rem, 3vw, 2rem)' })}>
              {hero.title_text || 'Shine a Light in a Life'}
            </h2>
            <p className="mb-4 leading-relaxed" style={applyHeroStyle(hero.subtitle_style, BODY)}>
              {hero.subtitle_text || 'Healing flows when we support each other.'}
            </p>
            <div className="text-gray-600 mb-6 leading-relaxed text-sm space-y-1">
              <p>Becoming a sponsor allows anyone to contribute towards someone else's healing—anonymously or intentionally.</p>
              <p>It is not charity, it is conscious support.</p>
              <p>When one heals, the collective heals.</p>
            </div>
            <p className="text-gray-800 font-medium mb-8 text-sm italic">
              Because healing should never wait for circumstances
            </p>
            <a href="/contact" data-testid="become-sponsor-btn"
              className="inline-block bg-[#D4AF37] hover:bg-[#b8962e] text-white px-8 py-3 rounded-full text-sm transition-all duration-300 shadow-lg hover:shadow-xl tracking-wider">
              Become a Sponsor
            </a>
          </div>
          <div className="order-first md:order-last flex justify-center">
            <div className="rounded-lg overflow-hidden shadow-xl max-w-md w-full">
              <img src="https://divineirishealing.com/assets/images/sponsor-placeholder.jpg" alt="Be The Sponsor" className="w-full h-auto object-cover"
                onError={(e) => { e.target.src = 'https://images.unsplash.com/photo-1469571486292-0ba58a3f068b?w=600&h=400&fit=crop'; }} />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default SponsorSection;
