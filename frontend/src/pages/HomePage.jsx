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

const DARK_SECTIONS = new Set(['HeroSection', 'SessionsSection', 'StatsSection']);

/*
  Two asymmetric gradients that chain together:
  Type A (lavender→white): starts #f3edff, ends #ffffff
  Type B (white→lavender): starts #ffffff, ends #f3edff
  
  A's end (#ffffff) = B's start (#ffffff) → seamless
  B's end (#f3edff) = A's start (#f3edff) → seamless
  
  This creates the original flowing wave regardless of section order.
*/
const GRAD_LAVENDER_TO_WHITE = 'linear-gradient(180deg, #f3edff 0%, #ece4ff 10%, #f5f0ff 25%, #faf8ff 40%, #ffffff 60%, #ffffff 100%)';
const GRAD_WHITE_TO_LAVENDER = 'linear-gradient(180deg, #ffffff 0%, #ffffff 40%, #faf8ff 60%, #f5f0ff 75%, #ece4ff 90%, #f3edff 100%)';

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

  // Track the flow: starts with lavender (after hero)
  // Even light sections: lavender→white, Odd light sections: white→lavender
  let lightCount = 0;

  return (
    <>
      <Header />
      {visibleSections.map((sec) => {
        const Component = COMPONENT_MAP[sec.component];
        if (!Component) return null;

        // Dark sections render with their own backgrounds
        if (DARK_SECTIONS.has(sec.component)) {
          return <Component key={sec.id} sectionConfig={sec} />;
        }

        // Light sections get chained gradients
        const gradient = lightCount % 2 === 0 ? GRAD_LAVENDER_TO_WHITE : GRAD_WHITE_TO_LAVENDER;
        lightCount++;

        return (
          <div key={sec.id} style={{ background: gradient }}>
            <Component sectionConfig={sec} />
          </div>
        );
      })}
      <Footer />
      <FloatingButtons />
    </>
  );
}

export default HomePage;
