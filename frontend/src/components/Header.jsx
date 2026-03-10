import React, { useState } from 'react';
import { Menu, X, Facebook, Instagram, Youtube, Linkedin } from 'lucide-react';
import { Button } from './ui/button';

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isProgramsOpen, setIsProgramsOpen] = useState(false);

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-black/50 backdrop-blur-md">
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
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
            <a href="#home" className="text-white hover:text-yellow-500 transition-colors text-sm font-medium">HOME</a>
            <a href="#about" className="text-white hover:text-yellow-500 transition-colors text-sm font-medium">ABOUT</a>
            <a href="#services" className="text-white hover:text-yellow-500 transition-colors text-sm font-medium">SERVICES</a>
            <a href="#sessions" className="text-white hover:text-yellow-500 transition-colors text-sm font-medium">UPCOMING SESSIONS</a>
            <a href="#media" className="text-white hover:text-yellow-500 transition-colors text-sm font-medium">MEDIA</a>
            <div className="relative group">
              <button className="text-white hover:text-yellow-500 transition-colors text-sm font-medium">
                PROGRAMS
              </button>
              <div className="absolute top-full left-0 mt-2 w-64 bg-white shadow-lg rounded-md opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
                <a href="#programs" className="block px-4 py-3 text-gray-700 hover:bg-gray-100 transition-colors text-sm">Atomic Weight Release Program</a>
                <a href="#programs" className="block px-4 py-3 text-gray-700 hover:bg-gray-100 transition-colors text-sm">Atomic Musculoskeletal Regeneration</a>
                <a href="#programs" className="block px-4 py-3 text-gray-700 hover:bg-gray-100 transition-colors text-sm">SoulSync Neuro-Harmonics</a>
                <a href="#programs" className="block px-4 py-3 text-gray-700 hover:bg-gray-100 transition-colors text-sm">Money Magic Multiplier</a>
                <a href="#programs" className="block px-4 py-3 text-gray-700 hover:bg-gray-100 transition-colors text-sm">Quad Layer Healing</a>
                <a href="#programs" className="block px-4 py-3 text-gray-700 hover:bg-gray-100 transition-colors text-sm">Divinity of Twinity</a>
              </div>
            </div>
            <a href="#contact" className="text-white hover:text-yellow-500 transition-colors text-sm font-medium">CONTACT</a>
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
              <a href="#home" onClick={() => setIsMenuOpen(false)} className="text-white hover:text-yellow-500 transition-colors text-sm font-medium">HOME</a>
              <a href="#about" onClick={() => setIsMenuOpen(false)} className="text-white hover:text-yellow-500 transition-colors text-sm font-medium">ABOUT</a>
              <a href="#services" onClick={() => setIsMenuOpen(false)} className="text-white hover:text-yellow-500 transition-colors text-sm font-medium">SERVICES</a>
              <a href="#sessions" onClick={() => setIsMenuOpen(false)} className="text-white hover:text-yellow-500 transition-colors text-sm font-medium">UPCOMING SESSIONS</a>
              <a href="#media" onClick={() => setIsMenuOpen(false)} className="text-white hover:text-yellow-500 transition-colors text-sm font-medium">MEDIA</a>
              <button
                onClick={() => setIsProgramsOpen(!isProgramsOpen)}
                className="text-white hover:text-yellow-500 transition-colors text-sm font-medium text-left"
              >
                PROGRAMS
              </button>
              {isProgramsOpen && (
                <div className="pl-4 flex flex-col space-y-2">
                  <a href="#programs" onClick={() => setIsMenuOpen(false)} className="text-white/80 hover:text-yellow-500 transition-colors text-xs">Atomic Weight Release Program</a>
                  <a href="#programs" onClick={() => setIsMenuOpen(false)} className="text-white/80 hover:text-yellow-500 transition-colors text-xs">Atomic Musculoskeletal Regeneration</a>
                  <a href="#programs" onClick={() => setIsMenuOpen(false)} className="text-white/80 hover:text-yellow-500 transition-colors text-xs">SoulSync Neuro-Harmonics</a>
                  <a href="#programs" onClick={() => setIsMenuOpen(false)} className="text-white/80 hover:text-yellow-500 transition-colors text-xs">Money Magic Multiplier</a>
                  <a href="#programs" onClick={() => setIsMenuOpen(false)} className="text-white/80 hover:text-yellow-500 transition-colors text-xs">Quad Layer Healing</a>
                  <a href="#programs" onClick={() => setIsMenuOpen(false)} className="text-white/80 hover:text-yellow-500 transition-colors text-xs">Divinity of Twinity</a>
                </div>
              )}
              <a href="#contact" onClick={() => setIsMenuOpen(false)} className="text-white hover:text-yellow-500 transition-colors text-sm font-medium">CONTACT</a>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
