import React from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import FloatingButtons from '../components/FloatingButtons';

const testimonialImages = [
  'https://divineirishealing.com/assets/images/testimonials/1770288231_121a7ff8d43c21a47ee2.jpeg',
  'https://divineirishealing.com/assets/images/testimonials/1770288262_5df1ff82fddb95f146db.jpeg',
  'https://divineirishealing.com/assets/images/testimonials/1770288598_757da7a271614cb10822.jpeg',
  'https://divineirishealing.com/assets/images/testimonials/1770289072_ab4f5c6689469efb1b7f.jpeg',
  'https://divineirishealing.com/assets/images/testimonials/1770289093_21c29f8d6a2dc5b1c8a9.jpeg',
  'https://divineirishealing.com/assets/images/testimonials/1770289131_cf06997582aa897db7fc.jpeg',
  'https://divineirishealing.com/assets/images/testimonials/1770289153_a072f5d42a5e02165c0d.jpeg',
  'https://divineirishealing.com/assets/images/testimonials/1770289174_ac0c9bfc32bdb9d84fe4.jpeg',
  'https://divineirishealing.com/assets/images/testimonials/1770289192_8c6bc2f9b2dbd96e74ee.jpeg',
  'https://divineirishealing.com/assets/images/testimonials/1770289210_ef2a4f93ca54c382c728.jpeg',
  'https://divineirishealing.com/assets/images/testimonials/1770289233_e3aba475fa78bcff3752.jpeg',
  'https://divineirishealing.com/assets/images/testimonials/1770289258_972d592ed0dff3e89a5a.jpeg',
  'https://divineirishealing.com/assets/images/testimonials/1770289281_4a39ab61be8e4c6ebf18.jpeg',
  'https://divineirishealing.com/assets/images/testimonials/1770289418_aa10db6d9677c85dc8fb.jpeg',
  'https://divineirishealing.com/assets/images/testimonials/1770289438_c49463798e7912dd6e27.jpeg',
  'https://divineirishealing.com/assets/images/testimonials/1770289472_43d8c1c0643b30020f1c.jpeg',
  'https://divineirishealing.com/assets/images/testimonials/1771406783_77c4cb3d51018f66cff5.png',
  'https://divineirishealing.com/assets/images/testimonials/1771406888_f8b37016b522d4450f27.png',
  'https://divineirishealing.com/assets/images/testimonials/1771406917_39f6286cdc703cdb44b1.png',
  'https://divineirishealing.com/assets/images/testimonials/1771407030_074208cdb860ec07bcd0.png',
  'https://divineirishealing.com/assets/images/testimonials/1771407096_e288442d79f8ba3078e2.png',
  'https://divineirishealing.com/assets/images/testimonials/1771407127_934cf075f73a9a06cca1.png',
  'https://divineirishealing.com/assets/images/testimonials/1771407192_2191bb436611415332f0.png',
  'https://divineirishealing.com/assets/images/testimonials/1771407239_d3ea8d010f7f5ad2d89e.png',
];

function TransformationsPage() {
  return (
    <div className="min-h-screen bg-white">
      <Header />

      {/* Hero */}
      <section
        data-testid="transformations-hero"
        className="min-h-[50vh] flex flex-col items-center justify-center text-center px-4 pt-24"
        style={{ background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 25%, #0f3460 50%, #1a1a2e 75%, #0d1b2a 100%)' }}
      >
        <h1
          className="text-5xl md:text-7xl mb-6 tracking-wider"
          style={{ color: '#D4AF37', fontWeight: 400 }}
        >
          TRANSFORMATIONS
        </h1>
        <p className="text-gray-400 text-sm tracking-[0.2em]">
          Stories of Healing, Growth & Awakening
        </p>
      </section>

      {/* Testimonials Grid */}
      <section data-testid="transformations-grid" className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {testimonialImages.map((image, index) => (
              <div
                key={index}
                data-testid={`transformation-card-${index}`}
                className="bg-white rounded-lg shadow-md hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 overflow-hidden"
              >
                <img
                  src={image}
                  alt={`Transformation ${index + 1}`}
                  className="w-full h-auto object-contain"
                  loading="lazy"
                  onError={(e) => {
                    e.target.parentElement.style.display = 'none';
                  }}
                />
              </div>
            ))}
          </div>
        </div>
      </section>

      <Footer />
      <FloatingButtons />
    </div>
  );
}

export default TransformationsPage;
