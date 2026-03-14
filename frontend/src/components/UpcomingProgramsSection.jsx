import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { resolveImageUrl } from '../lib/imageUtils';
import { useCurrency } from '../context/CurrencyContext';
import { useCart } from '../context/CartContext';
import { useToast } from '../hooks/use-toast';
import { Monitor, Calendar, Clock, AlertTriangle, Wifi, ShoppingCart, Check, Bell } from 'lucide-react';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const CountdownTimer = ({ deadline }) => {
  const [timeLeft, setTimeLeft] = useState(getTimeLeft(deadline));

  function getTimeLeft(dateStr) {
    if (!dateStr) return null;
    const target = new Date(dateStr);
    if (isNaN(target.getTime())) return null;
    const diff = target.getTime() - Date.now();
    if (diff <= 0) return { expired: true };
    return {
      expired: false,
      days: Math.floor(diff / 86400000),
      hours: Math.floor((diff % 86400000) / 3600000),
      minutes: Math.floor((diff % 3600000) / 60000),
      seconds: Math.floor((diff % 60000) / 1000),
    };
  }

  useEffect(() => {
    if (!deadline) return;
    const interval = setInterval(() => setTimeLeft(getTimeLeft(deadline)), 1000);
    return () => clearInterval(interval);
  }, [deadline]);

  if (!timeLeft) return null;
  if (timeLeft.expired) return (
    <div data-testid="countdown-expired" className="flex items-center gap-2 text-red-500 text-xs font-medium">
      <AlertTriangle size={14} /><span>Registration Closed</span>
    </div>
  );

  return (
    <div data-testid="countdown-timer" className="flex items-center gap-2">
      <Clock size={14} className="text-red-500 animate-pulse" />
      <div className="flex gap-1.5">
        {timeLeft.days > 0 && <span className="bg-red-500 text-white text-xs font-bold px-2 py-1 rounded">{timeLeft.days}d</span>}
        <span className="bg-red-500 text-white text-xs font-bold px-2 py-1 rounded">{String(timeLeft.hours).padStart(2,'0')}h</span>
        <span className="bg-red-500 text-white text-xs font-bold px-2 py-1 rounded">{String(timeLeft.minutes).padStart(2,'0')}m</span>
        <span className="bg-red-500 text-white text-xs font-bold px-2 py-1 rounded">{String(timeLeft.seconds).padStart(2,'0')}s</span>
      </div>
    </div>
  );
};

const UpcomingCard = ({ program }) => {
  const navigate = useNavigate();
  const { getPrice, getOfferPrice, symbol } = useCurrency();
  const { addItem, items } = useCart();
  const { toast } = useToast();
  const [selectedTier, setSelectedTier] = useState(0);
  const [justAdded, setJustAdded] = useState(false);
  const tiers = program.duration_tiers || [];
  const hasTiers = program.is_flagship && tiers.length > 0;
  const tier = hasTiers ? tiers[selectedTier] : null;

  const isAnnual = tier && (tier.label.toLowerCase().includes('annual') || tier.label.toLowerCase().includes('year') || tier.duration_unit === 'year');
  const price = getPrice(program, hasTiers ? selectedTier : null);
  const offerPrice = getOfferPrice(program, hasTiers ? selectedTier : null);
  const showContact = isAnnual && price === 0;
  const inCart = items.some(i => i.programId === program.id && i.tierIndex === selectedTier);

  const handleAddToCart = () => {
    const added = addItem(program, selectedTier);
    if (added) {
      setJustAdded(true);
      toast({ title: `${program.title} added to cart`, description: `${tier?.label || 'Standard'} plan` });
      setTimeout(() => setJustAdded(false), 2000);
    } else {
      toast({ title: 'Already in cart', variant: 'destructive' });
    }
  };

  const deadline = program.deadline_date || program.start_date;
  const expired = (() => {
    if (!deadline) return false;
    const t = new Date(deadline);
    return !isNaN(t.getTime()) && t.getTime() < Date.now();
  })();

  // Parse date string, handling ordinal suffixes like "27th", "1st"
  const parseDate = (d) => {
    if (!d) return null;
    const cleaned = d.replace(/(\d+)(st|nd|rd|th)/gi, '$1').replace(',', '');
    const dt = new Date(cleaned);
    return isNaN(dt.getTime()) ? null : dt;
  };

  // Auto-calculate duration from start_date and end_date (inclusive: both start and end days count)
  const autoDuration = (() => {
    const s = parseDate(program.start_date);
    const e = parseDate(program.end_date);
    if (!s || !e) return program.duration && program.duration !== '90 days' ? program.duration : '';
    const diffDays = Math.round((e - s) / (1000 * 60 * 60 * 24)) + 1; // inclusive
    if (diffDays <= 0) return '';
    return `${diffDays} Days`;
  })();

  // Format date to standard: "27 Mar 2026"
  const fmtDate = (d) => {
    const dt = parseDate(d);
    if (!dt) return d || '';
    return dt.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
  };

  // Format timing with GMT
  const fmtTiming = (() => {
    if (!program.timing) return '';
    const tz = program.time_zone || '';
    return `${program.timing} ${tz}`.trim();
  })();

  return (
    <div data-testid={`upcoming-card-${program.id}`}
      className={`group bg-white rounded-xl overflow-hidden shadow-lg transition-all duration-300 border border-gray-100 flex flex-col ${expired || program.enrollment_open === false ? 'opacity-75' : 'hover:shadow-2xl'}`}>
      <div className="relative h-48 overflow-hidden cursor-pointer" onClick={() => navigate(`/program/${program.id}`)}>
        <img src={resolveImageUrl(program.image)} alt={program.title}
          className={`w-full h-full object-cover transition-transform duration-500 ${!(expired || program.enrollment_open === false) ? 'group-hover:scale-105' : 'grayscale-[30%]'}`}
          onError={(e) => { e.target.src = 'https://images.unsplash.com/photo-1545389336-cf090694435e?w=600&h=400&fit=crop'; }} />
        <div className="absolute top-3 left-3 flex gap-1.5 flex-wrap">
          {program.enable_online !== false && <span className="px-2.5 py-1 rounded-full text-[10px] font-semibold shadow-sm bg-blue-500 text-white">Online</span>}
          {program.enable_offline !== false && <span className="px-2.5 py-1 rounded-full text-[10px] font-semibold shadow-sm bg-teal-600 text-white">Remote</span>}
          {program.enable_in_person && <span className="px-2.5 py-1 rounded-full text-[10px] font-semibold shadow-sm bg-emerald-500 text-white">In Person</span>}
          {program.show_duration_on_card !== false && autoDuration && <span className="px-2.5 py-1 rounded-full text-[10px] font-semibold shadow-sm bg-purple-600 text-white">{autoDuration}</span>}
        </div>
        {(expired || program.enrollment_open === false) && (
          <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
            <span className="bg-gray-900/80 text-white text-[10px] font-bold px-3 py-1.5 rounded-full tracking-wider uppercase">Registration Closed</span>
          </div>
        )}
        {!expired && program.enrollment_open !== false && deadline && (
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-2.5 pt-5">
            <CountdownTimer deadline={deadline} />
          </div>
        )}
      </div>

      <div className="p-4 flex-1 flex flex-col">
        <p className="text-[#D4AF37] text-[10px] tracking-wider mb-0.5 uppercase">{program.category}</p>
        <h3 className="text-base font-semibold text-gray-900 mb-1.5 leading-tight">{program.title}</h3>
        <p className="text-gray-500 text-xs leading-relaxed mb-3 line-clamp-2 flex-1">{program.description}</p>

        {/* Compact info line: dates · duration · time */}
        <div className="text-gray-400 text-[10px] mb-3 space-y-0.5">
          {(program.start_date || program.end_date) && (
            <div className="flex items-center gap-1">
              <Calendar size={10} className="flex-shrink-0" />
              <span>{fmtDate(program.start_date)}{program.end_date ? ` — ${fmtDate(program.end_date)}` : ''}</span>
            </div>
          )}
          {fmtTiming && (
            <div className="flex items-center gap-1">
              <Clock size={10} className="flex-shrink-0" />
              <span>{fmtTiming}</span>
            </div>
          )}
        </div>

        {/* Duration Tier Selector */}
        {hasTiers && (
          <div data-testid={`upcoming-tier-selector-${program.id}`} className="mb-3">
            <div className="flex gap-1">
              {tiers.map((t, i) => (
                <button key={i} data-testid={`upcoming-tier-btn-${program.id}-${i}`}
                  onClick={() => setSelectedTier(i)}
                  className={`flex-1 text-[10px] py-1.5 rounded-full border transition-all ${
                    selectedTier === i ? 'bg-[#D4AF37] text-white border-[#D4AF37]' : 'bg-white text-gray-500 border-gray-200 hover:border-[#D4AF37]'
                  }`}>
                  {t.label}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Early Bird Countdown */}
        {!expired && program.enrollment_open !== false && offerPrice > 0 && deadline && (() => {
          const now = new Date();
          const dl = new Date(deadline);
          if (dl <= now) return null;
          const diff = dl - now;
          const days = Math.floor(diff / (1000 * 60 * 60 * 24));
          const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
          const mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
          return (
            <div data-testid={`early-bird-countdown-${program.id}`}
              className="flex items-center gap-2 bg-red-50 border border-red-100 rounded-lg px-3 py-2 mb-3 animate-pulse">
              <Bell size={14} className="text-red-500 flex-shrink-0" />
              <div className="text-xs">
                <span className="font-bold text-red-600">{program.offer_text || 'Early Bird'}</span>
                <span className="text-red-500 ml-1.5">ends in {days}d {hours}h {mins}m</span>
              </div>
            </div>
          );
        })()}

        {/* Pricing */}
        <div className="border-t pt-3 mt-auto">
          {showContact ? (
            <div className="text-center mb-2">
              <p className="text-gray-500 text-[10px] mb-1.5">Custom pricing</p>
              <button onClick={() => navigate(`/contact?program=${program.id}&title=${encodeURIComponent(program.title)}&tier=Annual`)} data-testid={`upcoming-contact-${program.id}`}
                className="w-full bg-gray-900 hover:bg-gray-800 text-white py-2 rounded-full text-[10px] tracking-wider transition-colors uppercase font-medium">
                Contact for Pricing
              </button>
            </div>
          ) : (
            <>
              <div className="flex items-baseline gap-2 mb-2">
                {offerPrice > 0 ? (
                  <>
                    <span className="text-xl font-bold text-[#D4AF37]">{symbol} {offerPrice.toLocaleString()}</span>
                    <span className="text-xs text-gray-400 line-through">{symbol} {price.toLocaleString()}</span>
                  </>
                ) : price > 0 ? (
                  <span className="text-xl font-bold text-gray-900">{symbol} {price.toLocaleString()}</span>
                ) : (
                  <span className="text-xs text-gray-500 italic">Contact for pricing</span>
                )}
              </div>
              <div className="flex gap-1.5">
                <button onClick={() => navigate(`/program/${program.id}`)}
                  data-testid={`upcoming-know-more-${program.id}`}
                  className="flex-1 bg-[#1a1a1a] hover:bg-[#333] text-white py-2 rounded-full text-[10px] tracking-wider transition-all duration-300 uppercase font-medium">
                  Know More
                </button>
                {!expired && price > 0 && program.enrollment_open !== false ? (
                  <>
                    <button onClick={handleAddToCart} data-testid={`upcoming-add-cart-${program.id}`}
                      disabled={inCart || justAdded}
                      className={`flex items-center justify-center px-2.5 py-2 rounded-full text-[10px] transition-all font-medium border ${
                        inCart || justAdded ? 'bg-green-50 text-green-600 border-green-200' : 'bg-white text-gray-700 border-gray-200 hover:border-[#D4AF37] hover:text-[#D4AF37]'
                      }`}>
                      {inCart || justAdded ? <Check size={11} /> : <ShoppingCart size={11} />}
                    </button>
                    <button onClick={() => navigate(`/enroll/program/${program.id}?tier=${selectedTier}`)}
                      data-testid={`upcoming-enroll-${program.id}`}
                      className="flex-1 bg-[#D4AF37] hover:bg-[#b8962e] text-white py-2 rounded-full text-[10px] tracking-wider transition-all duration-300 uppercase font-medium">
                      Enroll Now
                    </button>
                  </>
                ) : (expired || program.enrollment_open === false) ? (
                  <button disabled data-testid={`upcoming-enroll-disabled-${program.id}`}
                    className="flex-1 bg-gray-300 text-gray-500 py-2 rounded-full text-[10px] tracking-wider uppercase font-medium cursor-not-allowed">
                    Closed
                  </button>
                ) : null}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

const UpcomingProgramsSection = ({ sectionConfig, inline }) => {
  const [programs, setPrograms] = useState([]);

  useEffect(() => {
    axios.get(`${API}/programs?visible_only=true&upcoming_only=true`)
      .then(r => setPrograms(r.data))
      .catch(err => console.error('Error loading upcoming programs:', err));
  }, []);

  if (programs.length === 0) return null;

  const content = (
    <>
      <div className={inline ? "text-center mb-8" : "text-center mb-14"}>
        <h2 className={inline ? "text-xl md:text-2xl text-gray-900" : "text-3xl md:text-4xl text-gray-900"} style={sectionConfig?.title_style ? { ...(sectionConfig.title_style.font_family && { fontFamily: sectionConfig.title_style.font_family }), ...(sectionConfig.title_style.font_size && !inline && { fontSize: sectionConfig.title_style.font_size }), ...(sectionConfig.title_style.font_color && { color: sectionConfig.title_style.font_color }), ...(sectionConfig.title_style.font_weight && { fontWeight: sectionConfig.title_style.font_weight }), ...(sectionConfig.title_style.font_style && { fontStyle: sectionConfig.title_style.font_style }) } : {}}>{sectionConfig?.title || 'Upcoming Programs'}</h2>
        {!inline && (sectionConfig?.subtitle || (!programs.some(p => p.enable_in_person) && !sectionConfig)) && (
          <p className="text-xs text-gray-400 mt-3" style={sectionConfig?.subtitle_style ? { ...(sectionConfig.subtitle_style.font_color && { color: sectionConfig.subtitle_style.font_color }), ...(sectionConfig.subtitle_style.font_size && { fontSize: sectionConfig.subtitle_style.font_size }), ...(sectionConfig.subtitle_style.font_family && { fontFamily: sectionConfig.subtitle_style.font_family }) } : {}}>{sectionConfig?.subtitle || 'All sessions are conducted online via Zoom or through remote distance healing — no in-person sessions at this time.'}</p>
        )}
      </div>
      <div className={inline ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4" : "max-w-6xl mx-auto grid md:grid-cols-2 lg:grid-cols-3 gap-8"}>
        {programs.map(program => <UpcomingCard key={program.id} program={program} />)}
      </div>
    </>
  );

  if (inline) return <div data-testid="upcoming-programs-section">{content}</div>;

  return (
    <section id="upcoming" data-testid="upcoming-programs-section" className="py-12 bg-white">
      <div className="container mx-auto px-4">
        {content}
      </div>
    </section>
  );
};

export default UpcomingProgramsSection;
