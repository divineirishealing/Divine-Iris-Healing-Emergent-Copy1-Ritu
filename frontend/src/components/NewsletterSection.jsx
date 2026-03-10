import React, { useState } from 'react';
import axios from 'axios';
import { useToast } from '../hooks/use-toast';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const NewsletterSection = () => {
  const [email, setEmail] = useState('');
  const { toast } = useToast();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (email) {
      try {
        await axios.post(`${API}/newsletter`, { email });
        toast({ title: "Successfully Subscribed!", description: "Thank you for joining our community." });
        setEmail('');
      } catch (error) {
        if (error.response?.status === 400) {
          toast({ title: "Already Subscribed", description: "This email is already subscribed.", variant: "destructive" });
        } else {
          toast({ title: "Error", description: "Something went wrong. Please try again.", variant: "destructive" });
        }
      }
    }
  };

  return (
    <section data-testid="newsletter-section" className="py-20" style={{ background: 'linear-gradient(135deg, #fdf8ef 0%, #fef3e2 50%, #fdf0d5 100%)' }}>
      <div className="container mx-auto px-4">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl text-[#8B6914] mb-6">
            Join Our Community
          </h2>
          <p className="text-gray-600 mb-8 leading-relaxed text-sm">
            Sign up to receive updates on upcoming workshops, new courses and more information
          </p>

          <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-4 items-center justify-center">
            <input
              type="email"
              placeholder="ENTER YOUR EMAIL ADDRESS"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              data-testid="newsletter-email-input"
              className="max-w-md w-full px-6 py-3 rounded-full border border-gray-300 focus:border-[#D4AF37] focus:ring-1 focus:ring-[#D4AF37] outline-none text-sm tracking-wider"
              required
            />
            <button
              type="submit"
              data-testid="newsletter-subscribe-btn"
              className="bg-[#D4AF37] hover:bg-[#b8962e] text-white px-8 py-3 rounded-full text-sm whitespace-nowrap transition-all duration-300 shadow-lg hover:shadow-xl tracking-wider"
            >
              Subscribe
            </button>
          </form>

          <p className="text-gray-500 text-xs mt-6">
            By subscribing, you agree to our Privacy Policy and Terms of Use.
          </p>
        </div>
      </div>
    </section>
  );
};

export default NewsletterSection;
