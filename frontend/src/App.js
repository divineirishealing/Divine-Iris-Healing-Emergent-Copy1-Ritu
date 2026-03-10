import React, { useEffect } from 'react';
import './App.css';
import Header from './components/Header';
import HeroSection from './components/HeroSection';
import AboutSection from './components/AboutSection';
import SponsorSection from './components/SponsorSection';
import ProgramsSection from './components/ProgramsSection';
import SessionsSection from './components/SessionsSection';
import StatsSection from './components/StatsSection';
import TestimonialsSection from './components/TestimonialsSection';
import NewsletterSection from './components/NewsletterSection';
import Footer from './components/Footer';
import FloatingButtons from './components/FloatingButtons';
import { Toaster } from './components/ui/toaster';

function App() {
  useEffect(() => {
    // Smooth scroll behavior
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
      anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
          target.scrollIntoView({
            behavior: 'smooth',
            block: 'start'
          });
        }
      });
    });
  }, []);

  return (
    <div className="App">
      <Header />
      <HeroSection />
      <AboutSection />
      <SponsorSection />
      <ProgramsSection />
      <SessionsSection />
      <StatsSection />
      <TestimonialsSection />
      <NewsletterSection />
      <Footer />
      <FloatingButtons />
      <Toaster />
    </div>
  );
}

export default App;
