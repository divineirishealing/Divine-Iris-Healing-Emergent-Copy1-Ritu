import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Menu, X, Facebook, Instagram, Youtube, Linkedin, ChevronDown } from 'lucide-react';
import axios from 'axios';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const Header = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isProgramsOpen, setIsProgramsOpen] = useState(false);
  const [settings, setSettings] = useState(null);
  const [programs, setPrograms] = useState([]);

  useEffect(() => {
    axios.get(`${API}/settings`).then(r => setSettings(r.data)).catch(() => {});
    axios.get(`${API}/programs`).then(r => setPrograms(r.data.filter(p => p.visible !== false))).catch(() => {});
  }, []);

  const social = {
    facebook: settings?.social_facebook || 'https://facebook.com',
    instagram: settings?.social_instagram || 'https://instagram.com',
    youtube: settings?.social_youtube || 'https://youtube.com',
    linkedin: settings?.social_linkedin || 'https://linkedin.com',
  };

  const handleNavClick = (path) => {
    setIsMenuOpen(false);
    setIsProgramsOpen(false);
    if (path.startsWith('/#')) {
      if (location.pathname === '/') {
        const el = document.getElementById(path.replace('/#', ''));
        if (el) el.scrollIntoView({ behavior: 'smooth' });
      } else { navigate(path); }
    } else { navigate(path); }
  };

  return (
    <>
      <header data-testid="site-header" className="fixed top-0 left-0 right-0 z-50 bg-black/60 backdrop-blur-sm">
        <div className="container mx-auto px-6 py-4 flex items-center justify-between">
          <button data-testid="menu-toggle-btn" onClick={() => setIsMenuOpen(!isMenuOpen)} className="flex items-center gap-2 text-white hover:text-[#D4AF37] transition-colors">
            {isMenuOpen ? <X size={22} /> : <Menu size={22} />}
            <span className="text-xs font-medium tracking-[0.2em]">MENU</span>
          </button>
          <div className="hidden md:flex items-center gap-5">
            <a href={social.facebook} target="_blank" rel="noopener noreferrer" className="text-white/80 hover:text-[#D4AF37] transition-colors"><Facebook size={18} /></a>
            <a href={social.instagram} target="_blank" rel="noopener noreferrer" className="text-white/80 hover:text-[#D4AF37] transition-colors"><Instagram size={18} /></a>
            <a href={social.youtube} target="_blank" rel="noopener noreferrer" className="text-white/80 hover:text-[#D4AF37] transition-colors"><Youtube size={18} /></a>
            <a href={social.linkedin} target="_blank" rel="noopener noreferrer" className="text-white/80 hover:text-[#D4AF37] transition-colors"><Linkedin size={18} /></a>
          </div>
        </div>
      </header>

      {isMenuOpen && (
        <div data-testid="menu-overlay" className="fixed inset-0 z-[60] flex items-center justify-center"
          style={{ background: 'linear-gradient(135deg, #8B6914 0%, #D4AF37 30%, #C5A028 50%, #8B6914 100%)' }}>
          <button data-testid="menu-close-btn" onClick={() => setIsMenuOpen(false)} className="absolute top-6 left-6 flex items-center gap-2 text-white hover:text-yellow-200 transition-colors">
            <X size={22} /><span className="text-xs font-medium tracking-[0.2em]">CLOSE</span>
          </button>
          <div className="absolute top-6 right-6 flex items-center gap-5">
            <a href={social.facebook} target="_blank" rel="noopener noreferrer" className="text-white/80 hover:text-white transition-colors"><Facebook size={18} /></a>
            <a href={social.instagram} target="_blank" rel="noopener noreferrer" className="text-white/80 hover:text-white transition-colors"><Instagram size={18} /></a>
            <a href={social.youtube} target="_blank" rel="noopener noreferrer" className="text-white/80 hover:text-white transition-colors"><Youtube size={18} /></a>
            <a href={social.linkedin} target="_blank" rel="noopener noreferrer" className="text-white/80 hover:text-white transition-colors"><Linkedin size={18} /></a>
          </div>
          <nav className="text-center space-y-6">
            {[{label:'HOME',path:'/'},{label:'ABOUT',path:'/#about'},{label:'SERVICES',path:'/services'},{label:'UPCOMING SESSIONS',path:'/sessions'},{label:'MEDIA',path:'/media'},{label:'TRANSFORMATIONS',path:'/transformations'}].map(item => (
              <button key={item.label} onClick={() => handleNavClick(item.path)} className="block w-full text-white text-2xl md:text-3xl font-light tracking-[0.15em] hover:text-yellow-200 transition-colors">{item.label}</button>
            ))}
            <div>
              <button onClick={() => setIsProgramsOpen(!isProgramsOpen)} className="text-white text-2xl md:text-3xl font-light tracking-[0.15em] hover:text-yellow-200 transition-colors inline-flex items-center gap-2">
                PROGRAMS <ChevronDown size={20} className={`transition-transform ${isProgramsOpen ? 'rotate-180' : ''}`} />
              </button>
              {isProgramsOpen && (
                <div className="mt-3 space-y-2">
                  {programs.map(p => (
                    <button key={p.id} onClick={() => handleNavClick(`/program/${p.id}`)} className="block w-full text-white/80 text-sm tracking-wider hover:text-white transition-colors">{p.title}</button>
                  ))}
                </div>
              )}
            </div>
            <button onClick={() => handleNavClick('/contact')} className="block w-full text-white text-2xl md:text-3xl font-light tracking-[0.15em] hover:text-yellow-200 transition-colors">CONTACT</button>
          </nav>
        </div>
      )}
    </>
  );
};

export default Header;
