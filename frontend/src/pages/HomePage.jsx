import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Header from '../components/Header';
import HeroSection from '../components/HeroSection';
import AboutSection from '../components/AboutSection';
import UpcomingProgramsSection from '../components/UpcomingProgramsSection';
import SponsorSection from '../components/SponsorSection';
import ProgramsSection from '../components/ProgramsSection';
import SessionsSection from '../components/SessionsSection';
import StatsSection from '../components/StatsSection';
import TestimonialsSection from '../components/TestimonialsSection';
import TextTestimonialsStrip from '../components/TextTestimonialsStrip';
import NewsletterSection from '../components/NewsletterSection';
import CustomSection from '../components/CustomSection';
import Footer from '../components/Footer';
import FloatingButtons from '../components/FloatingButtons';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

const COMPONENT_MAP = {
  HeroSection,
  AboutSection,
  UpcomingProgramsSection,
  SponsorSection,
  ProgramsSection,
  SessionsSection,
  StatsSection,
  TestimonialsSection,
  TextTestimonialsStrip,
  NewsletterSection,
  custom: CustomSection,
};

// Components that have their own dark/themed backgrounds — skip flow gradient
const DARK_SECTIONS = new Set(['HeroSection', 'SessionsSection', 'StatsSection']);

// Alternating flow gradients: lavender → white → lavender → white
// Each gradient's top matches the previous gradient's bottom
const FLOW_GRADIENTS = {
  // After hero: starts from lavender (matching hero's purple tone), fades to white
  afterHero: 'linear-gradient(180deg, #e8daf5 0%, #f0e8f8 15%, #f8f5ff 35%, #ffffff 55%, #ffffff 70%, #f8f5ff 85%, #f3edff 100%)',
  // White-dominant: starts from lavender, white center, ends lavender
  white: 'linear-gradient(180deg, #f3edff 0%, #f8f5ff 15%, #ffffff 35%, #ffffff 65%, #f8f5ff 85%, #f3edff 100%)',
  // Purple-dominant: light lavender throughout
  purple: 'linear-gradient(180deg, #f3edff 0%, #ece4ff 20%, #f0e8f8 40%, #f5eef8 60%, #ece4ff 80%, #f3edff 100%)',
};

const DEFAULT_ORDER = [
  { id: 'hero', component: 'HeroSection', visible: true },
  { id: 'about', component: 'AboutSection', visible: true },
  { id: 'text_testimonials', component: 'TextTestimonialsStrip', visible: true },
  { id: 'upcoming', component: 'UpcomingProgramsSection', visible: true },
  { id: 'sponsor', component: 'SponsorSection', visible: true },
  { id: 'programs', component: 'ProgramsSection', visible: true },
  { id: 'sessions', component: 'SessionsSection', visible: true },
  { id: 'stats', component: 'StatsSection', visible: true },
  { id: 'testimonials', component: 'TestimonialsSection', visible: true },
  { id: 'newsletter', component: 'NewsletterSection', visible: true },
];

function HomePage() {
  const [sections, setSections] = useState(DEFAULT_ORDER);

  useEffect(() => {
    axios.get(`${BACKEND_URL}/api/settings`).then(r => {
      if (r.data.homepage_sections && r.data.homepage_sections.length > 0) {
        const saved = r.data.homepage_sections;
        const savedIds = new Set(saved.map(s => s.id));
        const merged = [...saved];
        DEFAULT_ORDER.forEach(def => {
          if (!savedIds.has(def.id)) {
            const defIdx = DEFAULT_ORDER.findIndex(d => d.id === def.id);
            const nextDef = DEFAULT_ORDER.slice(defIdx + 1).find(d => savedIds.has(d.id));
            const insertIdx = nextDef ? merged.findIndex(s => s.id === nextDef.id) : merged.length;
            merged.splice(insertIdx, 0, def);
          }
        });
        setSections(merged);
      }
    }).catch(() => {});

    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
      anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      });
    });
  }, []);

  const visibleSections = sections.filter(s => s.visible !== false);

  // Calculate flow gradient for each non-dark section based on position
  const getFlowGradient = (index, component) => {
    if (DARK_SECTIONS.has(component)) return null;
    // Find what position this light section is among light sections
    let lightIndex = 0;
    let isFirstAfterHero = false;
    for (let i = 0; i < index; i++) {
      const sec = visibleSections[i];
      if (DARK_SECTIONS.has(sec.component)) {
        if (sec.component === 'HeroSection') isFirstAfterHero = (lightIndex === 0);
        continue;
      }
      lightIndex++;
    }
    // First light section right after hero gets the blending gradient
    if (isFirstAfterHero || (index > 0 && visibleSections[index - 1]?.component === 'HeroSection')) {
      return FLOW_GRADIENTS.afterHero;
    }
    // Alternate: white → purple → white → purple
    return lightIndex % 2 === 0 ? FLOW_GRADIENTS.white : FLOW_GRADIENTS.purple;
  };

  return (
    <>
      <Header />
      <div className="homepage-flow" style={{ position: 'relative', overflow: 'hidden' }}>
        {/* Purple side glows */}
        <div style={{
          position: 'fixed', top: 0, left: 0, width: '220px', height: '100vh',
          background: 'linear-gradient(90deg, rgba(120,60,220,0.10) 0%, rgba(139,92,246,0.05) 40%, transparent 100%)',
          pointerEvents: 'none', zIndex: 1,
        }} />
        <div style={{
          position: 'fixed', top: 0, right: 0, width: '220px', height: '100vh',
          background: 'linear-gradient(270deg, rgba(120,60,220,0.10) 0%, rgba(139,92,246,0.05) 40%, transparent 100%)',
          pointerEvents: 'none', zIndex: 1,
        }} />
        {/* Gold dust particles */}
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          backgroundImage: `
            radial-gradient(2.5px 2.5px at 2% 10%, rgba(212,175,55,0.6) 0%, transparent 100%),
            radial-gradient(2px 2px at 6% 25%, rgba(212,175,55,0.5) 0%, transparent 100%),
            radial-gradient(3px 3px at 3% 42%, rgba(212,175,55,0.55) 0%, transparent 100%),
            radial-gradient(2px 2px at 7% 58%, rgba(212,175,55,0.45) 0%, transparent 100%),
            radial-gradient(2.5px 2.5px at 4% 74%, rgba(212,175,55,0.5) 0%, transparent 100%),
            radial-gradient(2px 2px at 2% 88%, rgba(212,175,55,0.4) 0%, transparent 100%),
            radial-gradient(2.5px 2.5px at 98% 8%, rgba(212,175,55,0.6) 0%, transparent 100%),
            radial-gradient(2px 2px at 94% 22%, rgba(212,175,55,0.5) 0%, transparent 100%),
            radial-gradient(3px 3px at 97% 40%, rgba(212,175,55,0.55) 0%, transparent 100%),
            radial-gradient(2px 2px at 93% 55%, rgba(212,175,55,0.45) 0%, transparent 100%),
            radial-gradient(2.5px 2.5px at 96% 72%, rgba(212,175,55,0.5) 0%, transparent 100%),
            radial-gradient(2px 2px at 98% 86%, rgba(212,175,55,0.4) 0%, transparent 100%),
            radial-gradient(1.5px 1.5px at 10% 15%, rgba(212,175,55,0.3) 0%, transparent 100%),
            radial-gradient(1.5px 1.5px at 90% 32%, rgba(212,175,55,0.3) 0%, transparent 100%)
          `,
          pointerEvents: 'none', zIndex: 2,
        }} />
        {visibleSections.map((sec, index) => {
          const Component = COMPONENT_MAP[sec.component];
          if (!Component) return null;
          const gradient = getFlowGradient(index, sec.component);
          if (!gradient) {
            // Dark section — render directly, no wrapper
            return <Component key={sec.id} sectionConfig={sec} />;
          }
          return (
            <div key={sec.id} style={{ background: gradient }}>
              <Component sectionConfig={sec} />
            </div>
          );
        })}
      </div>
      <Footer />
      <FloatingButtons />
    </>
  );
}

export default HomePage;
