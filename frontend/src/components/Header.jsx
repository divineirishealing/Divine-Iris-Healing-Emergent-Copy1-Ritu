import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Menu, X, Facebook, Instagram, Youtube, Linkedin } from 'lucide-react';
import { Button } from './ui/button';

const Header = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isProgramsOpen, setIsProgramsOpen] = useState(false);

  const isHome = location.pathname === '/';

  const handleNavClick = (sectionId) => {
    if (isHome) {
      const element = document.getElementById(sectionId);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      }
    } else {
      navigate(`/#${sectionId}`);
    }
    setIsMenuOpen(false);
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-black/50 backdrop-blur-md">
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          {/* Logo/Brand */}
          <div 
            className="cursor-pointer" 
            onClick={() => navigate('/')}
          >
            <h2 className="text-white text-xl font-serif hidden md:block">Divine Iris Healing</h2>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="lg:hidden text-white p-2 hover:bg-white/10 rounded transition-colors"
          >
            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
            <span className="ml-2 text-sm font-medium">MENU</span>
          </button>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center space-x-8">
            <button onClick={() => handleNavClick('home')} className="text-white hover:text-yellow-500 transition-colors text-sm font-medium">HOME</button>
            <button onClick={() => handleNavClick('about')} className="text-white hover:text-yellow-500 transition-colors text-sm font-medium">ABOUT</button>
            <div className="relative group">
              <button className="text-white hover:text-yellow-500 transition-colors text-sm font-medium">
                PROGRAMS
              </button>
              <div className="absolute top-full left-0 mt-2 w-64 bg-white shadow-lg rounded-md opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                <button onClick={() => { navigate('/programs'); }} className="block w-full text-left px-4 py-3 text-gray-700 hover:bg-gray-100 transition-colors text-sm">All Programs</button>
                <button onClick={() => handleNavClick('programs')} className="block w-full text-left px-4 py-3 text-gray-700 hover:bg-gray-100 transition-colors text-sm">Featured Programs</button>
              </div>
            </div>
            <div className="relative group">
              <button className="text-white hover:text-yellow-500 transition-colors text-sm font-medium">
                SESSIONS
              </button>
              <div className="absolute top-full left-0 mt-2 w-64 bg-white shadow-lg rounded-md opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                <button onClick={() => { navigate('/sessions'); }} className="block w-full text-left px-4 py-3 text-gray-700 hover:bg-gray-100 transition-colors text-sm">All Sessions</button>
                <button onClick={() => handleNavClick('sessions')} className="block w-full text-left px-4 py-3 text-gray-700 hover:bg-gray-100 transition-colors text-sm">Book a Session</button>
              </div>
            </div>
            <button onClick={() => handleNavClick('media')} className="text-white hover:text-yellow-500 transition-colors text-sm font-medium">MEDIA</button>
            <button onClick={() => handleNavClick('contact')} className="text-white hover:text-yellow-500 transition-colors text-sm font-medium">CONTACT</button>
          </nav>

          {/* Social Media Icons */}
          <div className="hidden lg:flex items-center space-x-4">
            <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" className="text-white hover:text-yellow-500 transition-colors">
              <Facebook size={20} />
            </a>
            <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="text-white hover:text-yellow-500 transition-colors">
              <Instagram size={20} />
            </a>
            <a href="https://youtube.com" target="_blank" rel="noopener noreferrer" className="text-white hover:text-yellow-500 transition-colors">
              <Youtube size={20} />
            </a>
            <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" className="text-white hover:text-yellow-500 transition-colors">
              <Linkedin size={20} />
            </a>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="lg:hidden mt-4 pb-4">
            <nav className="flex flex-col space-y-3">
              <button onClick={() => handleNavClick('home')} className="text-white hover:text-yellow-500 transition-colors text-sm font-medium text-left">HOME</button>
              <button onClick={() => handleNavClick('about')} className="text-white hover:text-yellow-500 transition-colors text-sm font-medium text-left">ABOUT</button>
              <button
                onClick={() => setIsProgramsOpen(!isProgramsOpen)}
                className="text-white hover:text-yellow-500 transition-colors text-sm font-medium text-left"
              >
                PROGRAMS
              </button>
              {isProgramsOpen && (
                <div className="pl-4 flex flex-col space-y-2">
                  <button onClick={() => { navigate('/programs'); setIsMenuOpen(false); }} className="text-white/80 hover:text-yellow-500 transition-colors text-xs text-left">All Programs</button>
                  <button onClick={() => handleNavClick('programs')} className="text-white/80 hover:text-yellow-500 transition-colors text-xs text-left">Featured Programs</button>
                </div>
              )}
              <button onClick={() => { navigate('/sessions'); setIsMenuOpen(false); }} className="text-white hover:text-yellow-500 transition-colors text-sm font-medium text-left">SESSIONS</button>
              <button onClick={() => handleNavClick('media')} className="text-white hover:text-yellow-500 transition-colors text-sm font-medium text-left">MEDIA</button>
              <button onClick={() => handleNavClick('contact')} className="text-white hover:text-yellow-500 transition-colors text-sm font-medium text-left">CONTACT</button>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
