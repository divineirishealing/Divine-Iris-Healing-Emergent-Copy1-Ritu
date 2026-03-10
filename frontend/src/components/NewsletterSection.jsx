import React, { useState } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { useToast } from '../hooks/use-toast';

const NewsletterSection = () => {
  const [email, setEmail] = useState('');
  const { toast } = useToast();

  const handleSubmit = (e) => {
    e.preventDefault();
    if (email) {
      toast({
        title: "Successfully Subscribed!",
        description: "Thank you for joining our community.",
      });
      setEmail('');
    }
  };

  return (
    <section className="py-20 bg-gradient-to-br from-amber-50 to-orange-50">
      <div className="container mx-auto px-4">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-4xl md:text-5xl font-serif text-yellow-700 mb-6">
            Join Our Community
          </h2>
          <p className="text-gray-700 mb-8 leading-relaxed">
            Sign up to receive updates on upcoming workshops, new courses and more information
          </p>

          <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-4 items-center justify-center">
            <Input
              type="email"
              placeholder="ENTER YOUR EMAIL ADDRESS"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="max-w-md w-full px-6 py-6 rounded-full border-gray-300 focus:border-yellow-600 focus:ring-yellow-600"
              required
            />
            <Button
              type="submit"
              className="bg-yellow-600 hover:bg-yellow-700 text-white px-8 py-6 rounded-full text-base whitespace-nowrap transition-all duration-300 shadow-lg hover:shadow-xl"
            >
              SUBSCRIBE
            </Button>
          </form>

          <p className="text-gray-600 text-sm mt-6">
            By subscribing, you agree to our Privacy Policy and Terms of Use.
          </p>
        </div>
      </div>
    </section>
  );
};

export default NewsletterSection;
