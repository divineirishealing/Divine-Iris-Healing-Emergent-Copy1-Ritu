import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Header from '../components/Header';
import Footer from '../components/Footer';
import FloatingButtons from '../components/FloatingButtons';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

function resolveUrl(url) {
  if (!url) return '';
  if (url.startsWith('/api/image/')) return `${BACKEND_URL}${url}`;
  return url;
}

export default function AboutPage() {
  const [settings, setSettings] = useState(null);

  useEffect(() => {
    axios.get(`${API}/settings`).then(r => setSettings(r.data)).catch(() => {});
    window.scrollTo(0, 0);
  }, []);

  const s = settings || {};
  const aboutImage = s.about_image ? resolveUrl(s.about_image) : 'https://divineirishealing.com/assets/images/dimple_ranawat.png';
  const logoUrl = s.logo_url ? resolveUrl(s.logo_url) : 'https://divineirishealing.com/assets/images/Divine-iris-logo.png';

  return (
    <div className="min-h-screen bg-white" style={{ fontFamily: "'Cormorant Garamond', Georgia, serif" }}>
      <Header />

      {/* Hero */}
      <section data-testid="about-hero" className="min-h-[45vh] flex flex-col items-center justify-center text-center px-4 pt-20"
        style={{ background: 'linear-gradient(180deg, #1a1a1a 0%, #2d2d2d 50%, #1a1a1a 100%)' }}>
        <h1 className="text-white mb-3" style={{ fontFamily: "'Cinzel', serif", fontSize: 'clamp(2rem, 5vw, 3.5rem)', fontVariant: 'small-caps', fontWeight: 400, letterSpacing: '0.08em' }}>
          {s.about_name || 'Dimple Ranawat'}
        </h1>
        <p className="text-gray-400 text-xs tracking-[0.3em] uppercase">
          {s.about_title || 'Founder, Divine Iris – Soulful Healing Studio'}
        </p>
      </section>

      {/* Logo + Meet the Healer + Bio */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4 max-w-5xl">
          {/* Logo */}
          <div className="flex justify-center mb-12">
            <img src={logoUrl} alt="Divine Iris Logo" className="h-24 object-contain" onError={(e) => { e.target.style.display = 'none'; }} />
          </div>

          <div className="grid md:grid-cols-2 gap-12 items-start">
            {/* Photo */}
            <div>
              <div className="rounded-lg overflow-hidden">
                <img src={aboutImage} alt={s.about_name || 'Dimple Ranawat'} data-testid="about-image" className="w-full h-auto object-cover" />
              </div>
            </div>

            {/* Bio */}
            <div>
              <p className="text-[#D4AF37] text-[10px] font-medium tracking-[0.3em] mb-3 uppercase" style={{ fontFamily: "'Lato', sans-serif" }}>
                MEET THE HEALER
              </p>
              <h2 data-testid="about-name" className="text-gray-900 mb-2" style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '2.2rem', fontWeight: 600 }}>
                {s.about_name || 'Dimple Ranawat'}
              </h2>
              <p className="text-[#D4AF37] text-sm mb-6" style={{ fontFamily: "'Cormorant Garamond', serif" }}>
                {s.about_title || 'Founder, Divine Iris – Soulful Healing Studio'}
              </p>

              <p className="text-gray-500 text-sm leading-relaxed mb-6" style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '0.95rem' }}>
                {s.about_bio || 'Dimple Ranawat is an internationally recognised healer, accountability coach, and life transformation mentor whose work is reshaping how the world understands healing, growth, and well-being. She is the founder of Divine Iris – Soulful Healing Studio and the visionary creator of several life-transforming programs, including the Atomic Weight Release Program (AWRP), Atomic Musculoskeletal Regeneration Program (AMRP), and SoulSync Neuro-Harmonics.'}
              </p>

              {(s.about_bio_2 || true) && (
                <>
                  <h4 className="text-gray-900 font-semibold text-sm mb-3" style={{ fontFamily: "'Cormorant Garamond', serif" }}>Personal Journey</h4>
                  <p className="text-gray-500 text-sm leading-relaxed" style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '0.95rem' }}>
                    {s.about_bio_2 || "Dimple's journey began with a profound question: \"Why do people continue to suffer despite awareness, effort, and access to solutions?\" Her work is rooted in lived experience and deep inquiry, discovering that lasting change happens when the deeper layers of the human system feel safe enough to release. She blends empathy, clarity, and grounded wisdom to help individuals release emotional, mental, and subconscious patterns, returning to their natural state of balance."}
                  </p>
                </>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Our Philosophy + Work & Impact Cards */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4 max-w-5xl">
          <div className="grid md:grid-cols-2 gap-8">
            {/* Our Philosophy */}
            <div className="bg-white rounded-lg p-10 shadow-sm" data-testid="philosophy-card">
              <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#D4AF37" strokeWidth="1.5" className="mb-5"><path d="M12 22c-4-3-8-6-8-11a8 8 0 1116 0c0 5-4 8-8 11z"/><path d="M12 13V7"/><path d="M9 10l3-3 3 3"/></svg>
              <h3 className="text-gray-900 text-xl font-semibold mb-4" style={{ fontFamily: "'Cormorant Garamond', serif" }}>Our Philosophy</h3>
              <p className="text-gray-500 text-sm leading-relaxed" style={{ fontFamily: "'Cormorant Garamond', serif" }}>
                {s.about_philosophy || 'Dimple believes in "living limitless effortlessly." Healing should not be forceful or complex. When body, mind, and soul are aligned, healing unfolds naturally. Her approach focuses on releasing root-level imprints that silently shape health, behavior, and life direction.'}
              </p>
            </div>

            {/* Work & Impact */}
            <div className="bg-white rounded-lg p-10 shadow-sm" data-testid="impact-card">
              <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#D4AF37" strokeWidth="1.5" className="mb-5"><circle cx="12" cy="12" r="3"/><path d="M12 1v2m0 18v2M4.22 4.22l1.42 1.42m12.72 12.72l1.42 1.42M1 12h2m18 0h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/></svg>
              <h3 className="text-gray-900 text-xl font-semibold mb-4" style={{ fontFamily: "'Cormorant Garamond', serif" }}>Work & Impact</h3>
              <p className="text-gray-500 text-sm leading-relaxed" style={{ fontFamily: "'Cormorant Garamond', serif" }}>
                {s.about_impact || 'As the creator of the Atomic Weight Release Program, Dimple introduced a revolutionary consciousness-based approach involving atomic, subconscious, and DNA-expression levels. Her work blends science, psychology, and spirituality for profound transformation.'}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Mission & Vision */}
      <section className="py-16 bg-gray-900" data-testid="mission-vision">
        <div className="container mx-auto px-4 max-w-5xl">
          <h2 className="text-white text-center mb-2" style={{ fontFamily: "'Cinzel', serif", fontSize: '1.8rem', fontWeight: 400 }}>
            Mission & Vision
          </h2>
          <p className="text-gray-500 text-center text-xs mb-12">Where healing meets awareness, and transformation begins from within.</p>

          <div className="grid md:grid-cols-2 gap-12">
            <div>
              <h3 className="text-white text-lg font-semibold mb-4" style={{ fontFamily: "'Cormorant Garamond', serif" }}>Our Mission</h3>
              <p className="text-gray-400 text-sm leading-relaxed" style={{ fontFamily: "'Cormorant Garamond', serif" }}>
                {s.about_mission || "To alleviate suffering at its root — supporting individuals in releasing emotional, mental, subconscious, and karmic weight. We aim to allow clarity, inner strength, and self-trust to emerge naturally, freeing individuals from survival mode."}
              </p>
            </div>
            <div>
              <h3 className="text-white text-lg font-semibold mb-4" style={{ fontFamily: "'Cormorant Garamond', serif" }}>Our Vision</h3>
              <p className="text-gray-400 text-sm leading-relaxed" style={{ fontFamily: "'Cormorant Garamond', serif" }}>
                {s.about_vision || "To build a world where healing is humane, conscious, and sustainable. We envision emotional well-being and nervous system regulation as foundational to education and personal growth, shifting global conversations from managing suffering to deep transformation."}
              </p>
            </div>
          </div>
        </div>
      </section>

      <Footer />
      <FloatingButtons />
    </div>
  );
}
