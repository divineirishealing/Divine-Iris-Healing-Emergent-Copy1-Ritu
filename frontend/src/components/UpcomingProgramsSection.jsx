import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { resolveImageUrl } from '../lib/imageUtils';
import { MapPin, Monitor, Calendar, Clock, AlertTriangle, Wifi } from 'lucide-react';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const CountdownTimer = ({ deadline }) => {
  const [timeLeft, setTimeLeft] = useState(getTimeLeft(deadline));

  function getTimeLeft(dateStr) {
    if (!dateStr) return null;
    const target = new Date(dateStr);
    if (isNaN(target.getTime())) return null;
    const now = new Date();
    const diff = target.getTime() - now.getTime();
    if (diff <= 0) return { expired: true, days: 0, hours: 0, minutes: 0, seconds: 0 };
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((diff % (1000 * 60)) / 1000);
    return { expired: false, days, hours, minutes, seconds };
  }

  useEffect(() => {
    if (!deadline) return;
    const interval = setInterval(() => {
      setTimeLeft(getTimeLeft(deadline));
    }, 1000);
    return () => clearInterval(interval);
  }, [deadline]);

  if (!timeLeft) return null;

  if (timeLeft.expired) {
    return (
      <div data-testid="countdown-expired" className="flex items-center gap-2 text-red-500 text-xs font-medium">
        <AlertTriangle size={14} />
        <span>Registration Closed</span>
      </div>
    );
  }

  return (
    <div data-testid="countdown-timer" className="flex items-center gap-2">
      <Clock size={14} className="text-red-500 animate-pulse" />
      <div className="flex gap-1.5">
        {timeLeft.days > 0 && (
          <span className="bg-red-500 text-white text-xs font-bold px-2 py-1 rounded">
            {timeLeft.days}d
          </span>
        )}
        <span className="bg-red-500 text-white text-xs font-bold px-2 py-1 rounded">
          {String(timeLeft.hours).padStart(2, '0')}h
        </span>
        <span className="bg-red-500 text-white text-xs font-bold px-2 py-1 rounded">
          {String(timeLeft.minutes).padStart(2, '0')}m
        </span>
        <span className="bg-red-500 text-white text-xs font-bold px-2 py-1 rounded">
          {String(timeLeft.seconds).padStart(2, '0')}s
        </span>
      </div>
    </div>
  );
};

const UpcomingProgramsSection = () => {
  const navigate = useNavigate();
  const [programs, setPrograms] = useState([]);

  useEffect(() => {
    loadUpcoming();
  }, []);

  const loadUpcoming = async () => {
    try {
      const response = await axios.get(`${API}/programs?visible_only=true&upcoming_only=true`);
      setPrograms(response.data);
    } catch (error) {
      console.error('Error loading upcoming programs:', error);
    }
  };

  if (programs.length === 0) return null;

  const isExpired = (program) => {
    const deadline = program.deadline_date || program.start_date;
    if (!deadline) return false;
    const target = new Date(deadline);
    if (isNaN(target.getTime())) return false;
    return target.getTime() < Date.now();
  };

  const typeIcon = (t) => {
    if (t === 'offline') return <MapPin size={14} />;
    if (t === 'hybrid') return <><Monitor size={14} /><MapPin size={14} /></>;
    return <Monitor size={14} />;
  };

  const typeLabel = (t) => {
    if (t === 'offline') return 'In-Person';
    if (t === 'hybrid') return 'Online + In-Person';
    return 'Online';
  };

  return (
    <section id="upcoming" data-testid="upcoming-programs-section" className="py-20 bg-white">
      <div className="container mx-auto px-4">
        <div className="text-center mb-14">
          <p className="text-[#D4AF37] text-xs tracking-[0.25em] uppercase mb-3">Upcoming</p>
          <h2 className="text-3xl md:text-4xl text-gray-900">Upcoming Programs</h2>
        </div>

        <div className="max-w-6xl mx-auto grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {programs.map((program) => {
            const expired = isExpired(program);
            const deadline = program.deadline_date || program.start_date;

            return (
              <div
                key={program.id}
                data-testid={`upcoming-card-${program.id}`}
                className={`group bg-white rounded-xl overflow-hidden shadow-lg transition-all duration-300 border border-gray-100 flex flex-col relative ${
                  expired ? 'opacity-75' : 'hover:shadow-2xl'
                }`}
              >
                {/* Program Image */}
                <div className="relative h-52 overflow-hidden">
                  <img
                    src={resolveImageUrl(program.image)}
                    alt={program.title}
                    className={`w-full h-full object-cover transition-transform duration-500 ${!expired ? 'group-hover:scale-105' : 'grayscale-[30%]'}`}
                    onError={(e) => {
                      e.target.src = 'https://images.unsplash.com/photo-1545389336-cf090694435e?w=600&h=400&fit=crop';
                    }}
                  />
                  {/* Type badge */}
                  <div className="absolute top-3 left-3">
                    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium shadow-md ${
                      program.program_type === 'offline'
                        ? 'bg-emerald-500 text-white'
                        : program.program_type === 'hybrid'
                          ? 'bg-purple-500 text-white'
                          : 'bg-blue-500 text-white'
                    }`}>
                      {typeIcon(program.program_type)}
                      {typeLabel(program.program_type)}
                    </span>
                  </div>

                  {/* Limited Period Offer badge */}
                  {!expired && (program.offer_text || program.offer_price_usd > 0) && (
                    <div className="absolute top-3 right-3">
                      <span className="bg-gradient-to-r from-red-600 to-red-500 text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-lg animate-pulse">
                        {program.offer_text || 'LIMITED OFFER'}
                      </span>
                    </div>
                  )}

                  {/* Expired overlay */}
                  {expired && (
                    <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
                      <span className="bg-gray-900/80 text-white text-xs font-bold px-4 py-2 rounded-full tracking-wider uppercase">
                        Registration Closed
                      </span>
                    </div>
                  )}
                </div>

                {/* Content */}
                <div className="p-6 flex-1 flex flex-col">
                  <p className="text-[#D4AF37] text-xs tracking-wider mb-1 uppercase">{program.category}</p>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2 leading-tight">{program.title}</h3>
                  <p className="text-gray-500 text-sm leading-relaxed mb-4 line-clamp-3 flex-1">{program.description}</p>

                  {/* Session Mode Badge */}
                  {program.session_mode && (
                    <div className="flex items-center gap-2 text-xs mb-2">
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full ${
                        program.session_mode === 'online' ? 'bg-blue-50 text-blue-600' :
                        program.session_mode === 'remote' ? 'bg-purple-50 text-purple-600' :
                        'bg-green-50 text-green-600'
                      }`}>
                        {program.session_mode === 'online' ? <><Monitor size={11} /> Online (Zoom)</> :
                         program.session_mode === 'remote' ? <><Wifi size={11} /> Remote Healing</> :
                         <><Monitor size={11} /> Online + Remote</>}
                      </span>
                      {program.duration && <span className="text-gray-400">{program.duration}</span>}
                    </div>
                  )}

                  {/* Date */}
                  {program.start_date && (
                    <div className="flex items-center gap-2 text-gray-500 text-xs mb-1">
                      <Calendar size={14} />
                      <span>Starts: {program.start_date}</span>
                    </div>
                  )}
                  {program.end_date && (
                    <div className="flex items-center gap-2 text-gray-500 text-xs mb-3">
                      <Calendar size={14} />
                      <span>Ends: {program.end_date}</span>
                    </div>
                  )}
                  {!program.end_date && program.start_date && <div className="mb-3"></div>}

                  {/* Duration Tiers */}
                  {program.duration_tiers && program.duration_tiers.length > 0 && (
                    <div className="mb-3">
                      <p className="text-[10px] text-gray-500 mb-1">Available durations:</p>
                      <div className="flex flex-wrap gap-1">
                        {program.duration_tiers.map((t, i) => (
                          <span key={i} className="text-[10px] bg-gray-100 text-gray-600 px-2 py-0.5 rounded">{t.label}</span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Countdown Timer */}
                  {deadline && (
                    <div className="mb-4">
                      <CountdownTimer deadline={deadline} />
                    </div>
                  )}

                  {/* Limited Period Offer highlight */}
                  {!expired && (program.offer_text || program.offer_price_usd > 0) && (
                    <div className="bg-gradient-to-r from-amber-50 to-yellow-50 border border-amber-200 rounded-lg p-3 mb-4">
                      <div className="flex items-center gap-2">
                        <Clock size={14} className="text-amber-600" />
                        <span className="text-amber-800 text-xs font-bold uppercase tracking-wider">
                          Limited Period Offer - Sign Up Soon!
                        </span>
                      </div>
                    </div>
                  )}

                  {/* Pricing */}
                  <div className="border-t pt-4 mt-auto">
                    <div className="flex items-baseline gap-3 mb-3">
                      {program.offer_price_usd > 0 ? (
                        <>
                          <span className="text-2xl font-bold text-[#D4AF37]">${program.offer_price_usd}</span>
                          <span className="text-sm text-gray-400 line-through">${program.price_usd}</span>
                        </>
                      ) : program.price_usd > 0 ? (
                        <span className="text-2xl font-bold text-gray-900">${program.price_usd}</span>
                      ) : (
                        <span className="text-sm text-gray-500 italic">Contact for pricing</span>
                      )}
                    </div>

                    <div className="flex gap-2">
                      <button
                        onClick={() => navigate(`/program/${program.id}`)}
                        data-testid={`upcoming-know-more-${program.id}`}
                        className="flex-1 bg-[#1a1a1a] hover:bg-[#333] text-white py-2.5 rounded-full text-xs tracking-wider transition-all duration-300 uppercase font-medium"
                      >
                        Know More
                      </button>
                      {!expired && (program.price_usd > 0 || program.offer_price_usd > 0) && (
                        <button
                          onClick={() => navigate(`/enroll/program/${program.id}`)}
                          data-testid={`upcoming-enroll-${program.id}`}
                          className="flex-1 bg-[#D4AF37] hover:bg-[#b8962e] text-white py-2.5 rounded-full text-xs tracking-wider transition-all duration-300 uppercase font-medium"
                        >
                          Enroll Now
                        </button>
                      )}
                      {expired && (
                        <button
                          disabled
                          data-testid={`upcoming-enroll-disabled-${program.id}`}
                          className="flex-1 bg-gray-300 text-gray-500 py-2.5 rounded-full text-xs tracking-wider uppercase font-medium cursor-not-allowed"
                        >
                          Closed
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default UpcomingProgramsSection;
