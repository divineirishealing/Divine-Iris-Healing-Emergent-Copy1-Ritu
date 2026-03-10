import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Button } from '../components/ui/button';
import { ArrowLeft } from 'lucide-react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import FloatingButtons from '../components/FloatingButtons';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

function ProgramDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [program, setProgram] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadProgram();
  }, [id]);

  const loadProgram = async () => {
    try {
      const response = await axios.get(`${API}/programs/${id}`);
      setProgram(response.data);
    } catch (error) {
      console.error('Error loading program:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl text-gray-600">Loading...</div>
      </div>
    );
  }

  if (!program) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Program Not Found</h2>
          <Button onClick={() => navigate('/')}>Back to Home</Button>
        </div>
      </div>
    );
  }

  return (
    <>
      <Header />
      <div className="min-h-screen bg-white pt-20">
        <div className="container mx-auto px-4 py-12">
          <Button
            variant="outline"
            onClick={() => navigate('/')}
            className="mb-8"
          >
            <ArrowLeft size={18} className="mr-2" />
            Back to Home
          </Button>

          <div className="max-w-4xl mx-auto">
            {/* Hero Image */}
            <div className="mb-8 rounded-lg overflow-hidden shadow-2xl">
              <img
                src={program.image}
                alt={program.title}
                className="w-full h-96 object-cover"
              />
            </div>

            {/* Category Badge */}
            <div className="mb-4">
              <span className="inline-block bg-yellow-100 text-yellow-800 px-4 py-2 rounded-full text-sm font-medium">
                {program.category}
              </span>
            </div>

            {/* Title */}
            <h1 className="text-4xl md:text-5xl font-serif text-gray-900 mb-6">
              {program.title}
            </h1>

            {/* Description */}
            <div className="prose prose-lg max-w-none">
              <p className="text-gray-700 text-lg leading-relaxed mb-8">
                {program.description}
              </p>

              <div className="bg-gradient-to-br from-amber-50 to-orange-50 p-8 rounded-lg mb-8">
                <h2 className="text-2xl font-serif text-gray-900 mb-4">What This Program Offers</h2>
                <ul className="space-y-3 text-gray-700">
                  <li>✨ Deep transformation at multiple levels</li>
                  <li>✨ Personalized healing approach</li>
                  <li>✨ Sustainable long-term results</li>
                  <li>✨ Expert guidance throughout your journey</li>
                  <li>✨ Safe and supportive environment</li>
                </ul>
              </div>

              <div className="bg-gray-900 text-white p-8 rounded-lg mb-8">
                <h2 className="text-2xl font-serif mb-4">Ready to Begin Your Transformation?</h2>
                <p className="mb-6 text-gray-300">
                  Take the first step towards healing and balance. Connect with us to learn more about this program.
                </p>
                <div className="flex gap-4">
                  {program.price_usd > 0 && (
                    <Button 
                      className="bg-yellow-600 hover:bg-yellow-700 text-white"
                      onClick={() => navigate(`/checkout/program/${program.id}`)}
                    >
                      Buy Now - From ${program.price_usd}
                    </Button>
                  )}
                  <Button variant="outline" className="text-white border-white hover:bg-white hover:text-gray-900">
                    Contact Us
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <Footer />
      <FloatingButtons />
    </>
  );
}

export default ProgramDetailPage;
