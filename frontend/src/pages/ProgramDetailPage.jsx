import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import FloatingButtons from '../components/FloatingButtons';
import { resolveImageUrl } from '../lib/imageUtils';
import { useCurrency } from '../context/CurrencyContext';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const applyStyle = (styleObj, defaults = {}) => {
  if (!styleObj) return defaults;
  return {
    ...defaults,
    ...(styleObj.font_family && { fontFamily: styleObj.font_family }),
    ...(styleObj.font_size && { fontSize: styleObj.font_size }),
    ...(styleObj.font_color && { color: styleObj.font_color }),
    ...(styleObj.font_weight && { fontWeight: styleObj.font_weight }),
    ...(styleObj.font_style && { fontStyle: styleObj.font_style }),
    ...(styleObj.text_align && { textAlign: styleObj.text_align }),
  };
};

/* Default sections when no custom sections configured */
const getDefaultSections = (program) => [
  {
    id: 'journey', section_type: 'journey', is_enabled: true, order: 0,
    title: 'The Journey',
    subtitle: '',
    body: program.description || '',
    image_url: '',
  },
  {
    id: 'who_for', section_type: 'who_for', is_enabled: true, order: 1,
    title: 'Who it is for',
    subtitle: 'A Sacred Invitation for those who resonate',
    body: '',
    image_url: '',
  },
  {
    id: 'experience', section_type: 'experience', is_enabled: true, order: 2,
    title: 'Your Experience',
    subtitle: '',
    body: '',
    image_url: '',
  },
];

function ProgramDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { getPrice, getOfferPrice, symbol } = useCurrency();
  const [program, setProgram] = useState(null);
  const [loading, setLoading] = useState(true);
  const [settings, setSettings] = useState(null);
  const [testimonials, setTestimonials] = useState([]);
  const [currentTestimonial, setCurrentTestimonial] = useState(0);

  useEffect(() => {
    window.scrollTo(0, 0);
    loadProgram();
    loadTestimonials();
    axios.get(`${API}/settings`).then(r => setSettings(r.data)).catch(() => {});
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

  const loadTestimonials = async () => {
    try {
      const res = await axios.get(`${API}/testimonials`);
      setTestimonials(res.data.filter(t => t.visible !== false));
    } catch (e) {}
  };

  const nextT = () => setCurrentTestimonial((p) => (p + 1) % Math.max(testimonials.length, 1));
  const prevT = () => setCurrentTestimonial((p) => (p - 1 + testimonials.length) % Math.max(testimonials.length, 1));

  const aboutImage = settings?.about_image
    ? resolveImageUrl(settings.about_image)
    : 'https://divineirishealing.com/assets/images/dimple_ranawat.png';

  if (loading) return <div className="min-h-screen flex items-center justify-center bg-[#1a1a1a]"><p className="text-gray-400 text-xs">Loading...</p></div>;
  if (!program) return (
    <div className="min-h-screen flex items-center justify-center bg-[#1a1a1a]">
      <div className="text-center">
        <h2 className="text-white text-xl mb-4" style={{ fontFamily: "'Cinzel', serif" }}>Program Not Found</h2>
        <button onClick={() => navigate('/')} className="bg-[#D4AF37] text-white px-6 py-2 text-xs tracking-[0.2em] uppercase">Back to Home</button>
      </div>
    </div>
  );

  const sections = (program.content_sections && program.content_sections.length > 0)
    ? program.content_sections.filter(s => s.is_enabled).sort((a, b) => (a.order || 0) - (b.order || 0))
    : getDefaultSections(program);

  const renderSection = (section, idx) => {
    const sType = section.section_type || 'custom';

    /* ===== The Journey / default text section ===== */
    if (sType === 'journey' || (sType === 'custom' && !section.image_url)) {
      return (
        <section key={section.id || idx} data-testid={`section-${idx}`} className="py-20 bg-white">
          <div className="container mx-auto px-4 max-w-4xl">
            {section.title && (
              <h2 className="text-center mb-4" style={applyStyle(section.title_style, { fontFamily: "'Cormorant Garamond', serif", fontSize: '1.8rem', fontWeight: 700, color: '#1a1a1a' })}>
                {section.title}
              </h2>
            )}
            {section.title && <div className="w-12 h-0.5 bg-[#D4AF37] mx-auto mb-10"></div>}
            {section.subtitle && (
              <p className="text-center mb-6" style={applyStyle(section.subtitle_style, { fontFamily: "'Cormorant Garamond', serif", fontSize: '0.9rem', color: '#999' })}>
                {section.subtitle}
              </p>
            )}
            {section.body && (
              <p className="leading-relaxed text-justify" style={applyStyle(section.body_style, { fontFamily: "'Cormorant Garamond', serif", fontSize: '0.95rem', color: '#666', lineHeight: '1.9' })}>
                {section.body}
              </p>
            )}
          </div>
        </section>
      );
    }

    /* ===== Who it is for ===== */
    if (sType === 'who_for') {
      const lines = section.body ? section.body.split('\n').filter(l => l.trim()) : [];
      return (
        <section key={section.id || idx} data-testid={`section-${idx}`} className="py-20 bg-[#f8f8f8]">
          <div className="container mx-auto px-4 max-w-4xl">
            <h2 className="text-center mb-4" style={applyStyle(section.title_style, { fontFamily: "'Cormorant Garamond', serif", fontSize: '1.8rem', fontWeight: 700, color: '#1a1a1a' })}>
              {section.title || 'Who it is for'}
            </h2>
            <div className="w-12 h-0.5 bg-[#D4AF37] mx-auto mb-4"></div>
            {section.subtitle && (
              <p className="text-center mb-12" style={applyStyle(section.subtitle_style, { fontFamily: "'Cormorant Garamond', serif", fontSize: '0.85rem', color: '#999' })}>
                {section.subtitle}
              </p>
            )}
            {lines.length > 0 && (
              <div className="grid md:grid-cols-2 gap-x-16 gap-y-6 max-w-3xl mx-auto">
                {lines.map((line, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <span className="text-[#D4AF37] mt-0.5 text-lg flex-shrink-0">&#10038;</span>
                    <p style={applyStyle(section.body_style, { fontFamily: "'Cormorant Garamond', serif", fontSize: '0.9rem', color: '#444' })}>
                      {line.replace(/^[-•*]\s*/, '')}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>
      );
    }

    /* ===== Your Experience (dark bg with image + italic quote) ===== */
    if (sType === 'experience') {
      return (
        <section key={section.id || idx} data-testid={`section-${idx}`} className="py-20" style={{ background: 'linear-gradient(180deg, #2a2a2a 0%, #1a1a1a 100%)' }}>
          <div className="container mx-auto px-4 max-w-5xl">
            <h2 className="text-center mb-4" style={applyStyle(section.title_style, { fontFamily: "'Cormorant Garamond', serif", fontSize: '1.8rem', fontWeight: 600, color: '#D4AF37', fontStyle: 'italic' })}>
              {section.title || 'Your Experience'}
            </h2>
            <div className="w-12 h-0.5 bg-[#D4AF37] mx-auto mb-12"></div>

            <div className="grid md:grid-cols-2 gap-12 items-center">
              <div className="overflow-hidden rounded-lg">
                <img
                  src={section.image_url ? resolveImageUrl(section.image_url) : aboutImage}
                  alt="Experience"
                  className="w-full h-80 object-cover grayscale"
                  onError={(e) => { e.target.src = aboutImage; }}
                />
              </div>
              <div>
                {section.body && (
                  <div className="border-l-2 border-[#D4AF37] pl-6">
                    <p className="italic leading-relaxed" style={applyStyle(section.body_style, { fontFamily: "'Cormorant Garamond', serif", fontSize: '0.95rem', color: '#ccc', lineHeight: '1.9', fontStyle: 'italic' })}>
                      {section.body}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>
      );
    }

    /* ===== Custom section with image (alternating left/right) ===== */
    if (section.image_url && section.image_url.trim()) {
      const imgLeft = idx % 2 === 0;
      return (
        <section key={section.id || idx} data-testid={`section-${idx}`} className={`py-20 ${idx % 2 === 0 ? 'bg-white' : 'bg-[#f8f8f8]'}`}>
          <div className="container mx-auto px-4 max-w-5xl">
            {section.title && (
              <h2 className="text-center mb-4" style={applyStyle(section.title_style, { fontFamily: "'Cormorant Garamond', serif", fontSize: '1.8rem', fontWeight: 700, color: '#1a1a1a' })}>
                {section.title}
              </h2>
            )}
            {section.title && <div className="w-12 h-0.5 bg-[#D4AF37] mx-auto mb-10"></div>}
            {section.subtitle && (
              <p className="text-center mb-8" style={applyStyle(section.subtitle_style, { fontFamily: "'Cormorant Garamond', serif", fontSize: '0.85rem', color: '#999' })}>
                {section.subtitle}
              </p>
            )}
            <div className="grid md:grid-cols-2 gap-12 items-center">
              <div className={imgLeft ? 'order-1' : 'order-1 md:order-2'}>
                <img src={resolveImageUrl(section.image_url)} alt={section.title} className="w-full rounded-lg" onError={(e) => { e.target.style.display = 'none'; }} />
              </div>
              <div className={imgLeft ? 'order-2' : 'order-2 md:order-1'}>
                <p className="leading-relaxed" style={applyStyle(section.body_style, { fontFamily: "'Cormorant Garamond', serif", fontSize: '0.95rem', color: '#666', lineHeight: '1.9' })}>
                  {section.body}
                </p>
              </div>
            </div>
          </div>
        </section>
      );
    }

    /* ===== Fallback text section ===== */
    return (
      <section key={section.id || idx} data-testid={`section-${idx}`} className={`py-20 ${idx % 2 === 0 ? 'bg-white' : 'bg-[#f8f8f8]'}`}>
        <div className="container mx-auto px-4 max-w-4xl">
          {section.title && (
            <h2 className="text-center mb-4" style={applyStyle(section.title_style, { fontFamily: "'Cormorant Garamond', serif", fontSize: '1.8rem', fontWeight: 700, color: '#1a1a1a' })}>
              {section.title}
            </h2>
          )}
          {section.title && <div className="w-12 h-0.5 bg-[#D4AF37] mx-auto mb-10"></div>}
          {section.subtitle && (
            <p className="text-center mb-6" style={applyStyle(section.subtitle_style, { fontFamily: "'Cormorant Garamond', serif", fontSize: '0.85rem', color: '#999' })}>
              {section.subtitle}
            </p>
          )}
          {section.body && (
            <p className="leading-relaxed text-justify" style={applyStyle(section.body_style, { fontFamily: "'Cormorant Garamond', serif", fontSize: '0.95rem', color: '#666', lineHeight: '1.9' })}>
              {section.body}
            </p>
          )}
        </div>
      </section>
    );
  };

  return (
    <div className="min-h-screen" style={{ fontFamily: "'Cormorant Garamond', Georgia, serif" }}>
      <Header />

      {/* ===== HERO ===== */}
      <section
        data-testid="program-hero"
        className="min-h-[50vh] flex flex-col items-center justify-center text-center px-4 pt-20"
        style={{ background: 'linear-gradient(180deg, #1a1a1a 0%, #2d2d2d 50%, #1a1a1a 100%)' }}
      >
        <p className="text-[#D4AF37] text-[10px] tracking-[0.35em] uppercase mb-5" style={{ fontFamily: "'Lato', sans-serif" }}>
          {program.category || 'FLAGSHIP PROGRAM'}
        </p>
        <h1 data-testid="program-title" className="text-white mb-6 max-w-4xl" style={{ fontFamily: "'Cinzel', serif", fontSize: 'clamp(1.8rem, 4vw, 3rem)', fontVariant: 'small-caps', fontWeight: 400, letterSpacing: '0.05em', lineHeight: 1.3 }}>
          {program.title}
        </h1>
        <div className="w-14 h-0.5 bg-[#D4AF37] mx-auto"></div>
      </section>

      {/* ===== DYNAMIC SECTIONS ===== */}
      {sections.map((section, idx) => renderSection(section, idx))}

      {/* ===== CTA: When You Are Seeking ===== */}
      <section className="py-20 bg-white" data-testid="cta-section">
        <div className="container mx-auto px-4 max-w-3xl text-center">
          <div className="w-14 h-0.5 bg-[#D4AF37] mx-auto mb-6"></div>
          <p className="text-xs tracking-[0.3em] text-gray-500 uppercase mb-6" style={{ fontFamily: "'Lato', sans-serif" }}>When you are seeking</p>

          {/* CTA body from first matching content_section or program description */}
          {sections.find(s => s.section_type === 'cta') ? (
            <p className="text-gray-600 text-lg mb-10 leading-relaxed" style={{ fontFamily: "'Cormorant Garamond', serif" }}>
              {sections.find(s => s.section_type === 'cta').body}
            </p>
          ) : (
            <p className="text-gray-600 text-lg mb-10 leading-relaxed" style={{ fontFamily: "'Cormorant Garamond', serif" }}>
              When you are ready to experience deep inner transformation and lasting change, this program becomes the foundation for that shift.
            </p>
          )}

          {/* Duration Tiers for flagship programs */}
          {program.is_flagship && program.duration_tiers && program.duration_tiers.length > 0 && (
            <div data-testid="duration-tiers" className="max-w-3xl mx-auto mb-10">
              <div className={`grid gap-4 ${program.duration_tiers.length === 3 ? 'sm:grid-cols-3' : program.duration_tiers.length === 2 ? 'sm:grid-cols-2' : 'max-w-xs mx-auto'}`}>
                {program.duration_tiers.map((tier, idx) => {
                  const isAnnual = tier.label?.toLowerCase().includes('annual') || tier.label?.toLowerCase().includes('year') || tier.duration_unit === 'year';
                  const tierPrice = getPrice(program, idx);
                  const tierOffer = getOfferPrice(program, idx);
                  const showContact = isAnnual && tierPrice === 0;
                  return (
                    <div key={idx} data-testid={`tier-${idx}`}
                      className="border border-gray-200 hover:border-[#D4AF37] rounded-lg p-5 transition-all duration-300 cursor-pointer group hover:shadow-md"
                      onClick={() => showContact ? navigate(`/contact?program=${program.id}&title=${encodeURIComponent(program.title)}&tier=${tier.label}`) : navigate(`/enroll/program/${program.id}?tier=${idx}`)}>
                      <p className="text-sm font-medium text-gray-900 group-hover:text-[#D4AF37] transition-colors mb-2" style={{ fontFamily: "'Cormorant Garamond', serif" }}>{tier.label}</p>
                      {showContact ? (
                        <div>
                          <p className="text-gray-400 text-[10px] mb-3">Custom pricing</p>
                          <span className="inline-block bg-[#D4AF37] text-white text-[10px] py-2 px-6 tracking-[0.15em] uppercase">Contact Us</span>
                        </div>
                      ) : (
                        <div>
                          <div className="mb-3">
                            {tierOffer > 0 ? (
                              <>
                                <p className="text-base font-semibold text-[#D4AF37]" style={{ fontFamily: "'Cinzel', serif" }}>{symbol} {tierOffer.toLocaleString()}</p>
                                <p className="text-[10px] text-gray-400 line-through">{symbol} {tierPrice.toLocaleString()}</p>
                              </>
                            ) : tierPrice > 0 ? (
                              <p className="text-base font-semibold text-gray-900" style={{ fontFamily: "'Cinzel', serif" }}>{symbol} {tierPrice.toLocaleString()}</p>
                            ) : (
                              <p className="text-xs text-gray-400 italic">Contact for pricing</p>
                            )}
                          </div>
                          <span className="inline-block bg-gray-900 group-hover:bg-[#D4AF37] text-white text-[10px] py-2 px-6 tracking-[0.15em] uppercase transition-colors">Select</span>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            {program.enrollment_open !== false ? (
              <button data-testid="enroll-btn" onClick={() => navigate(`/enroll/program/${program.id}`)}
                className="bg-[#D4AF37] hover:bg-[#b8962e] text-white px-10 py-3 text-xs tracking-[0.2em] uppercase transition-colors">
                Enroll Now
              </button>
            ) : (
              <button data-testid="express-interest-btn" onClick={() => navigate('/contact')}
                className="bg-[#D4AF37] hover:bg-[#b8962e] text-white px-10 py-3 text-xs tracking-[0.2em] uppercase transition-colors">
                Express Your Interest
              </button>
            )}
          </div>
        </div>
      </section>

      {/* ===== TESTIMONIALS ===== */}
      {testimonials.length > 0 && (
        <section className="py-16 bg-white" data-testid="testimonials-section">
          <div className="container mx-auto px-4">
            <h2 className="text-center mb-10" style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '1.8rem', fontWeight: 600, color: '#D4AF37', fontStyle: 'italic' }}>
              Testimonials
            </h2>
            <div className="max-w-5xl mx-auto relative flex items-center justify-center gap-4">
              <button onClick={prevT} data-testid="prev-testimonial" className="p-2 rounded-full bg-gray-100 hover:bg-gray-200 flex-shrink-0 transition-colors"><ChevronLeft size={18} /></button>
              <div className="flex gap-3 overflow-hidden">
                {[0, 1, 2, 3, 4].map((offset) => {
                  if (testimonials.length === 0) return null;
                  const tIdx = (currentTestimonial + offset) % testimonials.length;
                  const t = testimonials[tIdx];
                  if (!t) return null;
                  const imgSrc = t.type === 'graphic' ? resolveImageUrl(t.image) : `https://img.youtube.com/vi/${t.videoId}/hqdefault.jpg`;
                  return (
                    <img
                      key={offset}
                      src={imgSrc}
                      alt={t.name || `Testimonial ${tIdx + 1}`}
                      className="w-36 h-36 object-cover rounded-lg shadow flex-shrink-0"
                      onError={(e) => { e.target.style.display = 'none'; }}
                    />
                  );
                })}
              </div>
              <button onClick={nextT} data-testid="next-testimonial" className="p-2 rounded-full bg-gray-100 hover:bg-gray-200 flex-shrink-0 transition-colors"><ChevronRight size={18} /></button>
            </div>
          </div>
        </section>
      )}

      <Footer />
      <FloatingButtons />
    </div>
  );
}

export default ProgramDetailPage;
