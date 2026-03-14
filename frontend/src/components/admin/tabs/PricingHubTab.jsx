import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { useToast } from '../../../hooks/use-toast';
import { Button } from '../../ui/button';
import { Input } from '../../ui/input';
import { Switch } from '../../ui/switch';
import { Save, DollarSign, Tag } from 'lucide-react';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

const PricingHubTab = () => {
  const { toast } = useToast();
  const [programs, setPrograms] = useState([]);
  const [sessions, setSessions] = useState([]);
  const [saving, setSaving] = useState(false);

  const fetchData = useCallback(async () => {
    const [pRes, sRes] = await Promise.all([
      axios.get(`${API}/programs`),
      axios.get(`${API}/sessions`)
    ]);
    setPrograms(pRes.data || []);
    setSessions(sRes.data || []);
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const updateProgram = (idx, field, value) => {
    setPrograms(prev => {
      const copy = [...prev];
      copy[idx] = { ...copy[idx], [field]: value };
      return copy;
    });
  };

  const updateTier = (pIdx, tIdx, field, value) => {
    setPrograms(prev => {
      const copy = [...prev];
      const tiers = [...(copy[pIdx].duration_tiers || [])];
      tiers[tIdx] = { ...tiers[tIdx], [field]: value };
      copy[pIdx] = { ...copy[pIdx], duration_tiers: tiers };
      return copy;
    });
  };

  const updateSession = (idx, field, value) => {
    setSessions(prev => {
      const copy = [...prev];
      copy[idx] = { ...copy[idx], [field]: value };
      return copy;
    });
  };

  const saveAll = async () => {
    setSaving(true);
    try {
      const promises = [
        ...programs.map(p => axios.put(`${API}/programs/${p.id}`, p)),
        ...sessions.map(s => axios.put(`${API}/sessions/${s.id}`, s))
      ];
      await Promise.all(promises);
      toast({ title: 'All pricing saved!' });
    } catch (e) {
      toast({ title: 'Error saving', description: e.message, variant: 'destructive' });
    }
    setSaving(false);
  };

  const CurrencyCell = ({ value, onChange, className = '' }) => (
    <Input type="number" min="0" step="0.01" value={value || 0} onChange={e => onChange(parseFloat(e.target.value) || 0)}
      className={`h-8 text-xs w-full text-center px-1 ${className}`} />
  );

  return (
    <div data-testid="pricing-hub-tab">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2"><DollarSign size={18} className="text-[#D4AF37]" /> Pricing Hub</h2>
          <p className="text-xs text-gray-500 mt-1">Edit all prices in one place. Changes save together.</p>
        </div>
        <Button onClick={saveAll} disabled={saving} className="bg-[#D4AF37] hover:bg-[#b8962e]" data-testid="pricing-hub-save">
          <Save size={14} className="mr-1" />{saving ? 'Saving...' : 'Save All'}
        </Button>
      </div>

      {/* Programs Pricing */}
      <div className="mb-8">
        <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-1.5"><Tag size={14} /> Programs</h3>
        <div className="overflow-x-auto border rounded-lg">
          <table className="w-full text-xs" data-testid="pricing-programs-table">
            <thead>
              <tr className="bg-gray-100 border-b">
                <th className="text-left px-3 py-2.5 font-semibold text-gray-700 min-w-[160px] sticky left-0 bg-gray-100 z-10">Program</th>
                <th className="px-2 py-2.5 font-semibold text-gray-700 w-14">Visible</th>
                <th className="px-2 py-2.5 font-semibold text-blue-700 min-w-[80px]">AED</th>
                <th className="px-2 py-2.5 font-semibold text-green-700 min-w-[80px]">INR</th>
                <th className="px-2 py-2.5 font-semibold text-purple-700 min-w-[80px]">USD</th>
                <th className="px-2 py-2.5 font-semibold text-blue-500 min-w-[80px]">Offer AED</th>
                <th className="px-2 py-2.5 font-semibold text-green-500 min-w-[80px]">Offer INR</th>
                <th className="px-2 py-2.5 font-semibold text-purple-500 min-w-[80px]">Offer USD</th>
                <th className="px-2 py-2.5 font-semibold text-red-600 min-w-[120px]">Offer Badge</th>
              </tr>
            </thead>
            <tbody>
              {programs.map((p, i) => (
                <React.Fragment key={p.id}>
                  {/* Main program row */}
                  <tr className={`border-b ${i % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'} hover:bg-yellow-50/30`} data-testid={`pricing-row-${p.id}`}>
                    <td className="px-3 py-2 font-medium text-gray-900 sticky left-0 bg-inherit z-10">
                      <div className="truncate max-w-[200px]" title={p.title}>{p.title}</div>
                      {p.is_flagship && <span className="text-[9px] text-[#D4AF37] font-bold uppercase">Flagship</span>}
                      {p.is_upcoming && <span className="text-[9px] text-blue-500 font-bold uppercase ml-1">Upcoming</span>}
                    </td>
                    <td className="px-2 py-2 text-center">
                      <Switch checked={p.visible !== false} onCheckedChange={v => updateProgram(i, 'visible', v)} />
                    </td>
                    <td className="px-1 py-1"><CurrencyCell value={p.price_aed} onChange={v => updateProgram(i, 'price_aed', v)} /></td>
                    <td className="px-1 py-1"><CurrencyCell value={p.price_inr} onChange={v => updateProgram(i, 'price_inr', v)} /></td>
                    <td className="px-1 py-1"><CurrencyCell value={p.price_usd} onChange={v => updateProgram(i, 'price_usd', v)} /></td>
                    <td className="px-1 py-1"><CurrencyCell value={p.offer_price_aed} onChange={v => updateProgram(i, 'offer_price_aed', v)} className="border-blue-200" /></td>
                    <td className="px-1 py-1"><CurrencyCell value={p.offer_price_inr} onChange={v => updateProgram(i, 'offer_price_inr', v)} className="border-green-200" /></td>
                    <td className="px-1 py-1"><CurrencyCell value={p.offer_price_usd} onChange={v => updateProgram(i, 'offer_price_usd', v)} className="border-purple-200" /></td>
                    <td className="px-1 py-1">
                      <Input value={p.offer_text || ''} onChange={e => updateProgram(i, 'offer_text', e.target.value)} placeholder="e.g., 20% OFF" className="h-8 text-xs" />
                    </td>
                  </tr>
                  {/* Duration tier sub-rows */}
                  {(p.duration_tiers || []).map((t, ti) => (
                    <tr key={`${p.id}-tier-${ti}`} className="border-b bg-amber-50/30" data-testid={`pricing-tier-${p.id}-${ti}`}>
                      <td className="px-3 py-1.5 sticky left-0 bg-amber-50/30 z-10">
                        <span className="text-[10px] text-[#D4AF37] font-semibold ml-4">{t.label || `Tier ${ti + 1}`}</span>
                      </td>
                      <td></td>
                      <td className="px-1 py-1"><CurrencyCell value={t.price_aed} onChange={v => updateTier(i, ti, 'price_aed', v)} /></td>
                      <td className="px-1 py-1"><CurrencyCell value={t.price_inr} onChange={v => updateTier(i, ti, 'price_inr', v)} /></td>
                      <td className="px-1 py-1"><CurrencyCell value={t.price_usd} onChange={v => updateTier(i, ti, 'price_usd', v)} /></td>
                      <td colSpan={3} className="px-2 py-1 text-[10px] text-gray-400 italic">Tier pricing overrides base</td>
                      <td></td>
                    </tr>
                  ))}
                </React.Fragment>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Sessions Pricing */}
      <div>
        <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-1.5"><Tag size={14} /> Personal Sessions</h3>
        <div className="overflow-x-auto border rounded-lg">
          <table className="w-full text-xs" data-testid="pricing-sessions-table">
            <thead>
              <tr className="bg-gray-100 border-b">
                <th className="text-left px-3 py-2.5 font-semibold text-gray-700 min-w-[160px] sticky left-0 bg-gray-100 z-10">Session</th>
                <th className="px-2 py-2.5 font-semibold text-gray-700 w-14">Visible</th>
                <th className="px-2 py-2.5 font-semibold text-blue-700 min-w-[80px]">AED</th>
                <th className="px-2 py-2.5 font-semibold text-green-700 min-w-[80px]">INR</th>
                <th className="px-2 py-2.5 font-semibold text-purple-700 min-w-[80px]">USD</th>
              </tr>
            </thead>
            <tbody>
              {sessions.map((s, i) => (
                <tr key={s.id} className={`border-b ${i % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'} hover:bg-yellow-50/30`} data-testid={`pricing-session-${s.id}`}>
                  <td className="px-3 py-2 font-medium text-gray-900 sticky left-0 bg-inherit z-10">
                    <div className="truncate max-w-[200px]" title={s.title}>{s.title}</div>
                  </td>
                  <td className="px-2 py-2 text-center">
                    <Switch checked={s.visible !== false} onCheckedChange={v => updateSession(i, 'visible', v)} />
                  </td>
                  <td className="px-1 py-1"><CurrencyCell value={s.price_aed} onChange={v => updateSession(i, 'price_aed', v)} /></td>
                  <td className="px-1 py-1"><CurrencyCell value={s.price_inr} onChange={v => updateSession(i, 'price_inr', v)} /></td>
                  <td className="px-1 py-1"><CurrencyCell value={s.price_usd} onChange={v => updateSession(i, 'price_usd', v)} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="mt-6 flex justify-end">
        <Button onClick={saveAll} disabled={saving} className="bg-[#D4AF37] hover:bg-[#b8962e]" data-testid="pricing-hub-save-bottom">
          <Save size={14} className="mr-1" />{saving ? 'Saving...' : 'Save All Pricing'}
        </Button>
      </div>
    </div>
  );
};

export default PricingHubTab;
