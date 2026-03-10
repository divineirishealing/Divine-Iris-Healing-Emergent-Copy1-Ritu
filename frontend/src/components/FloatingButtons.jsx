import React from 'react';
import { Mail, Phone } from 'lucide-react';

const FloatingButtons = () => {
  return (
    <div className="fixed right-6 bottom-6 flex flex-col gap-3 z-40">
      {/* Email Button */}
      <a
        href="mailto:support@divineirishealing.com"
        className="w-14 h-14 bg-yellow-600 hover:bg-yellow-700 rounded-full flex items-center justify-center shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-110"
        aria-label="Send Email"
      >
        <Mail size={24} className="text-white" />
      </a>

      {/* WhatsApp Button */}
      <a
        href="https://wa.me/971553325778"
        target="_blank"
        rel="noopener noreferrer"
        className="w-14 h-14 bg-green-500 hover:bg-green-600 rounded-full flex items-center justify-center shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-110"
        aria-label="Contact on WhatsApp"
      >
        <Phone size={24} className="text-white" />
      </a>
    </div>
  );
};

export default FloatingButtons;
