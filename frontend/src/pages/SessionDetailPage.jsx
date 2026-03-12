import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { ArrowLeft, Clock, Wifi, MapPin, Quote, ChevronLeft, ChevronRight, Calendar as CalendarIcon } from 'lucide-react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import FloatingButtons from '../components/FloatingButtons';
import { useCurrency } from '../context/CurrencyContext';
import { renderMarkdown } from '../lib/renderMarkdown';
import { useSiteSettings } from '../context/SiteSettingsContext';
import { HEADING, SUBTITLE } from '../lib/designTokens';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const applyStyle = (styleObj, defaults = {}) => {
  if (!styleObj || Object.keys(styleObj).length === 0) return defaults;
  return { ...defaults, ...(styleObj.font_family && { fontFamily: styleObj.font_family }), ...(styleObj.font_size && { fontSize: styleObj.font_size }), ...(styleObj.font_color && { color: styleObj.font_color }), ...(styleObj.font_weight && { fontWeight: styleObj.font_weight }), ...(styleObj.font_style && { fontStyle: styleObj.font_style }) };
};

/* ---- Calendar Component ---- */
const BookingCalendar = ({ availableDates = [], selectedDate, onSelectDate }) => {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const year = currentMonth.getFullYear();
  const month = currentMonth.getMonth();
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const monthName = currentMonth.toLocaleString('default', { month: 'long', year: 'numeric' });
  const availableSet = useMemo(() => new Set(availableDates), [availableDates]);

  const days = [];
  for (let i = 0; i < firstDay; i++) days.push(null);
  for (let d = 1; d <= daysInMonth; d++) days.push(d);

  const isAvailable = (day) => {
    if (!day) return false;
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    return availableSet.has(dateStr);
  };
  const isSelected = (day) => {
    if (!day || !selectedDate) return false;
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    return dateStr === selectedDate;
  };
  const isPast = (day) => {
    if (!day) return false;
    const minDate = new Date(); minDate.setHours(0,0,0,0); minDate.setDate(minDate.getDate() + 7);
    return new Date(year, month, day) < minDate;
  };
  const isWeekend = (day) => {
    if (!day) return false;
    const dow = new Date(year, month, day).getDay();
    return dow === 0 || dow === 6;
  };

  return (
    <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100" data-testid="session-detail-calendar">
      <div className="flex items-center justify-between mb-4">
        <button onClick={() => setCurrentMonth(new Date(year, month - 1))} className="p-1.5 rounded-full hover:bg-gray-100 text-gray-400"><ChevronLeft size={18} /></button>
        <span className="text-sm font-semibold text-gray-800 tracking-wide">{monthName}</span>
        <button onClick={() => setCurrentMonth(new Date(year, month + 1))} className="p-1.5 rounded-full hover:bg-gray-100 text-gray-400"><ChevronRight size={18} /></button>
      </div>
      <div className="grid grid-cols-7 gap-1 text-center mb-2">
        {['Su','Mo','Tu','We','Th','Fr','Sa'].map(d => (
          <div key={d} className={`text-[10px] font-medium py-1 ${d === 'Su' || d === 'Sa' ? 'text-red-300' : 'text-gray-400'}`}>{d}</div>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-1">
        {days.map((day, i) => {
          const available = isAvailable(day);
          const selected = isSelected(day);
          const past = isPast(day);
          const weekend = isWeekend(day);
          const disabled = !day || past || weekend || !available;
          return (
            <button key={i} disabled={disabled}
              onClick={() => {
                if (day && available && !weekend && !past) {
                  onSelectDate(`${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`);
                }
              }}
              className={`h-9 w-full rounded-lg text-xs transition-all ${
                !day ? '' :
                weekend ? 'text-red-200 cursor-not-allowed' :
                selected ? 'bg-purple-600 text-white font-bold shadow-md' :
                available && !past ? 'bg-purple-50 text-purple-700 hover:bg-purple-100 cursor-pointer font-medium' :
                past ? 'text-gray-200' : 'text-gray-300'
              }`}
            >{day || ''}</button>
          );
        })}
      </div>
      <div className="mt-3 flex items-center gap-3 text-[10px] text-gray-400">
        {availableDates.length > 0 && <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-purple-50 border border-purple-200" /> Available</span>}
        <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-red-50" /> Weekend</span>
        <span>Min 7 days advance</span>
      </div>
    </div>
  );
};

function SessionDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { getPrice, formatPrice } = useCurrency();
  const { settings } = useSiteSettings();
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(null);

  useEffect(() => {
    if (settings && settings.sessions_page_visible === false) navigate('/', { replace: true });
  }, [settings, navigate]);

  useEffect(() => { loadSession(); }, [id]);

  const loadSession = async () => {
    try {
      const response = await axios.get(`${API}/sessions/${id}`);
      setSession(response.data);
    } catch (error) { console.error('Error loading session:', error); }
    finally { setLoading(false); }
  };

  const modeLabel = (mode) => {
    if (mode === 'offline') return 'In-Person';
    if (mode === 'both') return 'Online & In-Person';
    return 'Online';
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center"><div className="text-xl text-gray-600">Loading...</div></div>;
  if (!session) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Session Not Found</h2>
        <button onClick={() => navigate('/')} className="px-6 py-2 bg-purple-600 text-white rounded-full text-sm">Back to Home</button>
      </div>
    </div>
  );

  const hero = settings?.page_heroes?.sessions || {};

  return (
    <>
      <Header />
      <div className="min-h-screen">
        {/* Hero gradient banner */}
        <div className="relative pt-20 pb-16 overflow-hidden"
          style={{ background: 'linear-gradient(135deg, #1e1033 0%, #2d1b69 25%, #4c1d95 50%, #6d28d9 75%, #7c3aed 100%)' }}>
          <div className="absolute top-0 right-0 w-96 h-96 rounded-full opacity-10" style={{ background: 'radial-gradient(circle, #a78bfa, transparent 70%)' }} />
          <div className="absolute bottom-0 left-0 w-72 h-72 rounded-full opacity-10" style={{ background: 'radial-gradient(circle, #c084fc, transparent 70%)' }} />

          <div className="container mx-auto px-6 md:px-8 lg:px-12 relative z-10">
            <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-white/60 hover:text-white text-xs mb-8 transition-colors" data-testid="back-btn">
              <ArrowLeft size={16} /> Back
            </button>
            <div className="max-w-3xl">
              <div className="flex items-center gap-3 mb-4">
                <span className={`text-[10px] px-3 py-1 rounded-full font-medium flex items-center gap-1 ${
                  session.session_mode === 'offline' ? 'bg-teal-500/20 text-teal-200' :
                  session.session_mode === 'both' ? 'bg-purple-300/20 text-purple-200' :
                  'bg-blue-400/20 text-blue-200'
                }`}>
                  {session.session_mode === 'offline' ? <MapPin size={12} /> : <Wifi size={12} />}
                  {modeLabel(session.session_mode)}
                </span>
                {session.duration && (
                  <span className="text-[10px] px-3 py-1 rounded-full bg-white/10 text-white/60 flex items-center gap-1">
                    <Clock size={10} /> {session.duration}
                  </span>
                )}
              </div>
              <h1 className="mb-2" style={applyStyle(hero.title_style, { ...HEADING, color: '#fff', fontSize: 'clamp(1.8rem, 4vw, 2.5rem)', fontVariant: 'small-caps', letterSpacing: '0.08em' })} data-testid="session-detail-title">
                {session.title}
              </h1>
              <p className="mb-4" style={applyStyle(hero.subtitle_style, { color: 'rgba(255,255,255,0.5)', fontFamily: "'Lato', sans-serif", fontSize: '14px' })}>
                {hero.subtitle_text || ''}
              </p>
              {formatPrice(getPrice(session)) && (
                <span className="text-xl font-bold" style={{ color: '#c084fc' }}>{formatPrice(getPrice(session))}</span>
              )}
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="container mx-auto px-6 md:px-8 lg:px-12 py-12">
          <div className="max-w-5xl mx-auto grid lg:grid-cols-5 gap-10">
            {/* Left content */}
            <div className="lg:col-span-3 space-y-8">
              <div>
                <h2 className="text-xl font-semibold text-gray-900 mb-4" style={{ fontFamily: "'Cinzel', serif" }}>About This Session</h2>
                <div className="text-gray-600 text-sm leading-relaxed" dangerouslySetInnerHTML={{ __html: renderMarkdown(session.description) }} />
              </div>

              {/* Testimonial */}
              {session.testimonial_text && (
                <div className="bg-gradient-to-br from-purple-50 to-violet-50 rounded-xl p-6 border border-purple-100 relative" data-testid="session-detail-testimonial">
                  <Quote size={24} className="text-purple-200 absolute top-4 left-4" />
                  <p className="text-gray-700 text-sm leading-relaxed italic pl-8"
                    dangerouslySetInnerHTML={{ __html: renderMarkdown(session.testimonial_text) }} />
                </div>
              )}

              <div className="grid md:grid-cols-2 gap-5">
                <div className="bg-white border border-gray-100 p-5 rounded-xl shadow-sm">
                  <h3 className="text-sm font-semibold text-gray-900 mb-3">What to Expect</h3>
                  <ul className="space-y-2 text-gray-600 text-xs">
                    <li className="flex items-start gap-2"><span className="text-purple-500 mt-0.5">&#10003;</span> Personalized healing approach</li>
                    <li className="flex items-start gap-2"><span className="text-purple-500 mt-0.5">&#10003;</span> Safe and supportive environment</li>
                    <li className="flex items-start gap-2"><span className="text-purple-500 mt-0.5">&#10003;</span> Immediate energetic shifts</li>
                    <li className="flex items-start gap-2"><span className="text-purple-500 mt-0.5">&#10003;</span> Practical guidance for integration</li>
                  </ul>
                </div>
                <div className="bg-white border border-gray-100 p-5 rounded-xl shadow-sm">
                  <h3 className="text-sm font-semibold text-gray-900 mb-3">Who Is This For</h3>
                  <ul className="space-y-2 text-gray-600 text-xs">
                    <li className="flex items-start gap-2"><span className="text-purple-500 mt-0.5">&#10003;</span> Anyone seeking deep healing</li>
                    <li className="flex items-start gap-2"><span className="text-purple-500 mt-0.5">&#10003;</span> Those ready for transformation</li>
                    <li className="flex items-start gap-2"><span className="text-purple-500 mt-0.5">&#10003;</span> Individuals committed to growth</li>
                    <li className="flex items-start gap-2"><span className="text-purple-500 mt-0.5">&#10003;</span> Open to energetic work</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Right sidebar — Booking */}
            <div className="lg:col-span-2 space-y-5">
              <BookingCalendar
                availableDates={session.available_dates || []}
                selectedDate={selectedDate}
                onSelectDate={setSelectedDate}
              />

              {(session.time_slots && session.time_slots.length > 0) && (
                <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
                  <p className="text-xs text-gray-500 font-medium mb-3 uppercase tracking-wider">Available Times</p>
                  <div className="flex flex-wrap gap-2">
                    {session.time_slots.map((slot, i) => (
                      <span key={i} className="px-3 py-1.5 rounded-full text-xs bg-purple-50 text-purple-700 border border-purple-100 hover:bg-purple-100 cursor-pointer transition-all" data-testid={`detail-time-slot-${i}`}>
                        {slot}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              <button
                onClick={() => navigate(`/enroll/session/${session.id}`)}
                data-testid="book-now-btn"
                className="w-full py-3.5 rounded-full text-sm tracking-widest uppercase font-medium transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-[1.02] text-white"
                style={{ background: 'linear-gradient(135deg, #7c3aed, #a855f7)' }}
              >
                Book Now
              </button>

              <p className="text-[10px] text-gray-400 text-center leading-relaxed">
                All sessions are conducted online via Zoom or through in-person appointments based on availability. Each session is customized to your unique needs.
              </p>
            </div>
          </div>
        </div>
      </div>
      <Footer />
      <FloatingButtons />
    </>
  );
}

export default SessionDetailPage;
