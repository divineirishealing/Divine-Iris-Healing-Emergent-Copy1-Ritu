import React from 'react';
import { Mail, Phone } from 'lucide-react';

const FloatingButtons = () => {
  return (
    <div data-testid="floating-buttons" className="fixed right-5 bottom-5 flex flex-col gap-3 z-40">
      <a
        href="mailto:support@divineirishealing.com"
        data-testid="floating-email-btn"
        className="w-12 h-12 bg-[#D4AF37] hover:bg-[#b8962e] rounded-full flex items-center justify-center shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-110"
        aria-label="Send Email"
      >
        <Mail size={20} className="text-white" />
      </a>
      <a
        href="https://wa.me/971553325778"
        target="_blank"
        rel="noopener noreferrer"
        data-testid="floating-whatsapp-btn"
        className="w-12 h-12 bg-green-500 hover:bg-green-600 rounded-full flex items-center justify-center shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-110"
        aria-label="WhatsApp"
      >
        <Phone size={20} className="text-white" />
      </a>
    </div>
  );
};

export default FloatingButtons;
