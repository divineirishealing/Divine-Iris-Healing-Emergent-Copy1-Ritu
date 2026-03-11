import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { programs as mockPrograms } from '../mockData';
import { resolveImageUrl } from '../lib/imageUtils';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const DurationSelector = ({ tiers, onSelect, selected }) => {
  if (!tiers || tiers.length === 0) return null;
  return (
    <div className="flex gap-1 mb-3" onClick={e => e.stopPropagation()}>
      {tiers.map((t, i) => (
        <button key={i} onClick={() => onSelect(i)}
          className={`flex-1 text-[10px] py-1.5 rounded-full border transition-all ${
            selected === i ? 'bg-[#D4AF37] text-white border-[#D4AF37]' : 'bg-white text-gray-500 border-gray-200 hover:border-[#D4AF37]'
          }`}>
          {t.label}
        </button>
      ))}
    </div>
  );
};

const ProgramCard = ({ program }) => {
  const navigate = useNavigate();
  const [selectedTier, setSelectedTier] = useState(0);
  const tiers = program.duration_tiers || [];
  const hasTiers = program.is_flagship && tiers.length > 0;
  const tier = hasTiers ? tiers[selectedTier] : null;

  const isAnnual = tier && (
    tier.label.toLowerCase().includes('annual') ||
    tier.label.toLowerCase().includes('year') ||
    (tier.duration_unit === 'year')
  );
  const showContact = isAnnual && (!tier.price_aed || tier.price_aed === 0);

  return (
    <div data-testid={`program-card-${program.id}`}
      className="group cursor-pointer bg-white rounded-lg overflow-hidden shadow-md hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 border border-gray-100"
      onClick={() => navigate(`/program/${program.id}`)}>
      <div className="relative h-48 overflow-hidden">
        <img src={resolveImageUrl(program.image)} alt={program.title}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          onError={(e) => { e.target.src = 'https://images.unsplash.com/photo-1545389336-cf090694435e?w=600&h=400&fit=crop'; }} />
        {program.session_mode && (
          <span className={`absolute top-3 left-3 text-[10px] px-2.5 py-1 rounded-full font-medium ${
            program.session_mode === 'online' ? 'bg-blue-500/90 text-white' : 'bg-purple-500/90 text-white'
          }`}>
            {program.session_mode === 'online' ? 'Online' : 'Remote / Hybrid'}
          </span>
        )}
        {program.offer_text && (
          <span className="absolute top-3 right-3 bg-red-500 text-white text-[10px] px-2.5 py-1 rounded-full font-bold">
            {program.offer_text}
          </span>
        )}
      </div>
      <div className="p-5">
        <h3 className="text-base font-semibold text-gray-900 mb-2 leading-tight">{program.title}</h3>
        <p className="text-gray-500 text-xs leading-relaxed mb-3 line-clamp-2">{program.description}</p>

        {hasTiers && <DurationSelector tiers={tiers} selected={selectedTier} onSelect={setSelectedTier} />}

        {/* Pricing */}
        {showContact ? (
          <div className="text-center" onClick={e => e.stopPropagation()}>
            <button onClick={() => navigate('/contact')}
              className="w-full bg-gray-900 hover:bg-gray-800 text-white text-xs py-2.5 rounded-full transition-colors tracking-wider">
              Contact for Pricing
            </button>
          </div>
        ) : (
          <div className="flex items-center justify-between">
            <div>
              {tier ? (
                <span className="text-[#D4AF37] font-bold text-sm">
                  {tier.offer_aed && tier.offer_aed > 0 ? (
                    <><span className="line-through text-gray-400 font-normal text-xs mr-1">AED {tier.price_aed}</span> AED {tier.offer_aed}</>
                  ) : (
                    <>AED {tier.price_aed}</>
                  )}
                </span>
              ) : (
                <span className="text-[#D4AF37] font-bold text-sm">
                  {program.price_aed > 0 ? `AED ${program.price_aed}` : 'Free'}
                </span>
              )}
            </div>
            <span className="text-[#D4AF37] text-xs font-medium tracking-wider group-hover:text-[#b8962e]">
              Know More &rarr;
            </span>
          </div>
        )}
      </div>
    </div>
  );
};

const ProgramsSection = () => {
  const navigate = useNavigate();
  const [programs, setPrograms] = useState(mockPrograms);

  useEffect(() => {
    axios.get(`${API}/programs?visible_only=true`).then(r => {
      if (r.data?.length > 0) setPrograms(r.data);
    }).catch(() => {});
  }, []);

  return (
    <section id="programs" data-testid="programs-section" className="py-20 bg-white">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl md:text-4xl text-center text-gray-900 mb-16">Flagship Programs</h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {programs.slice(0, 6).map(p => <ProgramCard key={p.id} program={p} />)}
        </div>
        {programs.length > 6 && (
          <div className="text-center mt-12">
            <button onClick={() => navigate('/programs')} className="bg-[#D4AF37] hover:bg-[#b8962e] text-white px-8 py-3 rounded-full text-sm transition-all duration-300 shadow-lg tracking-wider">
              View All Programs
            </button>
          </div>
        )}
      </div>
    </section>
  );
};

export default ProgramsSection;
