import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Facebook, Instagram, Youtube, Linkedin } from 'lucide-react';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const Footer = () => {
  const navigate = useNavigate();
  const [programs, setPrograms] = useState([]);
  const [settings, setSettings] = useState(null);

  useEffect(() => {
    axios.get(`${API}/programs`).then(r => setPrograms(r.data.filter(p => p.visible !== false).slice(0, 6))).catch(() => {});
    axios.get(`${API}/settings`).then(r => setSettings(r.data)).catch(() => {});
  }, []);

  const s = settings || {};
  const social = {
    facebook: s.social_facebook || 'https://facebook.com',
    instagram: s.social_instagram || 'https://instagram.com',
    youtube: s.social_youtube || 'https://youtube.com',
    linkedin: s.social_linkedin || 'https://linkedin.com',
  };

  return (
    <footer id="contact" data-testid="site-footer" className="bg-gray-900 text-white py-16">
      <div className="container mx-auto px-4">
        <div className="grid md:grid-cols-4 gap-10 mb-12">
          <div>
            <h3 className="text-xl mb-4">{s.footer_brand_name || 'Divine Iris Healing'}</h3>
            <p className="text-gray-400 text-xs leading-relaxed mb-6">{s.footer_tagline || 'Delve into the deeper realm of your soul with Divine Iris – Soulful Healing Studio'}</p>
            <div className="flex space-x-4">
              <a href={social.facebook} target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-[#D4AF37] transition-colors"><Facebook size={18} /></a>
              <a href={social.instagram} target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-[#D4AF37] transition-colors"><Instagram size={18} /></a>
              <a href={social.youtube} target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-[#D4AF37] transition-colors"><Youtube size={18} /></a>
              <a href={social.linkedin} target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-[#D4AF37] transition-colors"><Linkedin size={18} /></a>
            </div>
          </div>
          <div>
            <h4 className="text-sm font-semibold mb-4 tracking-wider">MENU</h4>
            <ul className="space-y-2 text-gray-400 text-xs">
              <li><a href="/" className="hover:text-[#D4AF37] transition-colors">HOME</a></li>
              <li><a href="/#about" className="hover:text-[#D4AF37] transition-colors">ABOUT</a></li>
              <li><a href="/services" className="hover:text-[#D4AF37] transition-colors">SERVICES</a></li>
              <li><a href="/sessions" className="hover:text-[#D4AF37] transition-colors">UPCOMING SESSIONS</a></li>
              <li><a href="/media" className="hover:text-[#D4AF37] transition-colors">MEDIA</a></li>
              <li><a href="/transformations" className="hover:text-[#D4AF37] transition-colors">TRANSFORMATIONS</a></li>
              <li><a href="/contact" className="hover:text-[#D4AF37] transition-colors">CONTACT</a></li>
            </ul>
          </div>
          <div>
            <h4 className="text-sm font-semibold mb-4 tracking-wider">PROGRAMS</h4>
            <ul className="space-y-2 text-gray-400 text-xs">
              {programs.map(p => (
                <li key={p.id}><button onClick={() => navigate(`/program/${p.id}`)} className="hover:text-[#D4AF37] transition-colors text-left">{p.title}</button></li>
              ))}
            </ul>
          </div>
          <div>
            <h4 className="text-sm font-semibold mb-4 tracking-wider">CONTACT US</h4>
            <ul className="space-y-3 text-gray-400 text-xs">
              <li><a href={`mailto:${s.footer_email || 'support@divineirishealing.com'}`} className="hover:text-[#D4AF37] transition-colors">{s.footer_email || 'support@divineirishealing.com'}</a></li>
              <li><a href={`tel:${s.footer_phone || '+971553325778'}`} className="hover:text-[#D4AF37] transition-colors">{s.footer_phone || '+971553325778'}</a></li>
              <li className="pt-3"><a href="#" className="hover:text-[#D4AF37] transition-colors">Terms & Conditions</a></li>
              <li><a href="#" className="hover:text-[#D4AF37] transition-colors">Privacy Policy</a></li>
            </ul>
          </div>
        </div>
        <div className="border-t border-gray-800 pt-8 text-center">
          <p className="text-gray-500 text-xs">&copy; {s.footer_copyright || '2026 Divine Iris Healing. All Rights Reserved.'}</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
