import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { useToast } from '../../../hooks/use-toast';
import { Button } from '../../ui/button';
import { Input } from '../../ui/input';
import { Switch } from '../../ui/switch';
import { Save, Calendar, Clock, Star } from 'lucide-react';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

const CLOSURE_OPTIONS = ['Registration Closed', 'Seats Full', 'Enrollment Closed', 'Sold Out'];
const TZ_OPTIONS = ['', 'IST', 'GST Dubai', 'EST', 'PST', 'CST', 'MST', 'GMT', 'UTC', 'BST', 'CET', 'AEST', 'SGT', 'JST', 'KST', 'NZST'];

const ProgramRow = ({ p, i, update }) => (
  <tr className={`border-b ${i % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'} hover:bg-yellow-50/30 ${p.enrollment_open === false ? 'opacity-70' : ''}`} data-testid={`hub-row-${p.id}`}>
    <td className="px-2 py-1.5 sticky left-0 bg-inherit z-10">
      <div className="font-medium text-gray-900 truncate max-w-[160px] text-[11px]" title={p.title}>{p.title}</div>
    </td>
    <td className="px-1 py-1 text-center"><Switch checked={p.enrollment_open !== false} onCheckedChange={v => update(i, 'enrollment_open', v)} /></td>
    <td className="px-1 py-1">
      {p.enrollment_open === false ? (
        <select value={p.closure_text || 'Registration Closed'} onChange={e => update(i, 'closure_text', e.target.value)}
          className="w-full border rounded px-1 py-1 text-[10px] bg-orange-50 border-orange-200 text-orange-800">
          {CLOSURE_OPTIONS.map(opt => <option key={opt} value={opt}>{opt}</option>)}
        </select>
      ) : <span className="text-[10px] text-green-500 px-1">Open</span>}
    </td>
    <td className="px-1 py-1"><Input value={p.start_date || ''} onChange={e => update(i, 'start_date', e.target.value)} placeholder="Jan 15, 2026" className="h-7 text-[10px] px-1" /></td>
    <td className="px-1 py-1"><Input value={p.end_date || ''} onChange={e => update(i, 'end_date', e.target.value)} placeholder="Feb 4, 2026" className="h-7 text-[10px] px-1" /></td>
    <td className="px-1 py-1"><Input value={p.deadline_date || ''} onChange={e => update(i, 'deadline_date', e.target.value)} placeholder="Countdown date" className="h-7 text-[10px] px-1" /></td>
    <td className="px-1 py-1"><Input value={p.timing || ''} onChange={e => update(i, 'timing', e.target.value)} placeholder="7 PM - 8 PM" className="h-7 text-[10px] px-1" /></td>
    <td className="px-1 py-1">
      <select value={p.time_zone || ''} onChange={e => update(i, 'time_zone', e.target.value)} className="w-full border rounded px-1 py-1 text-[10px] bg-white">
        {TZ_OPTIONS.map(tz => <option key={tz} value={tz}>{tz || '--'}</option>)}
      </select>
    </td>
    <td className="px-1 py-1 text-center"><Switch checked={p.exclusive_offer_enabled || false} onCheckedChange={v => update(i, 'exclusive_offer_enabled', v)} /></td>
    <td className="px-1 py-1">
      {p.exclusive_offer_enabled ? (
        <Input value={p.exclusive_offer_text || ''} onChange={e => update(i, 'exclusive_offer_text', e.target.value)} placeholder="Limited Seats" className="h-7 text-[10px] px-1 border-red-200 bg-red-50" />
      ) : <span className="text-[10px] text-gray-400 px-1">-</span>}
    </td>
    <td className="px-1 py-1"><Input value={p.offer_text || ''} onChange={e => update(i, 'offer_text', e.target.value)} placeholder="20% OFF" className="h-7 text-[10px] px-1" /></td>
    <td className="px-1 py-1 text-center"><Switch checked={p.enable_online !== false} onCheckedChange={v => update(i, 'enable_online', v)} /></td>
    <td className="px-1 py-1 text-center"><Switch checked={p.enable_offline !== false} onCheckedChange={v => update(i, 'enable_offline', v)} /></td>
    <td className="px-1 py-1 text-center"><Switch checked={p.enable_in_person || false} onCheckedChange={v => update(i, 'enable_in_person', v)} /></td>
    <td className="px-1 py-1 text-center"><Switch checked={p.show_duration_on_card !== false} onCheckedChange={v => update(i, 'show_duration_on_card', v)} /></td>
    <td className="px-1 py-1 text-center"><Switch checked={p.show_pricing_on_card !== false} onCheckedChange={v => update(i, 'show_pricing_on_card', v)} /></td>
    <td className="px-1 py-1 text-center"><Switch checked={p.show_tiers_on_card !== false} onCheckedChange={v => update(i, 'show_tiers_on_card', v)} /></td>
  </tr>
);

const TableHeader = () => (
  <thead>
    <tr className="bg-gray-100 border-b">
      <th className="text-left px-2 py-2 font-semibold text-gray-700 min-w-[140px] sticky left-0 bg-gray-100 z-10">Program</th>
      <th className="px-1 py-2 font-semibold text-green-600 w-14 text-[10px]">Enroll</th>
      <th className="px-1 py-2 font-semibold text-orange-600 min-w-[100px] text-[10px]">Closure</th>
      <th className="px-1 py-2 font-semibold text-gray-600 min-w-[100px] text-[10px]">Start</th>
      <th className="px-1 py-2 font-semibold text-gray-600 min-w-[100px] text-[10px]">End</th>
      <th className="px-1 py-2 font-semibold text-gray-600 min-w-[100px] text-[10px]">Deadline</th>
      <th className="px-1 py-2 font-semibold text-gray-600 min-w-[80px] text-[10px]">Timing</th>
      <th className="px-1 py-2 font-semibold text-gray-600 min-w-[65px] text-[10px]">TZ</th>
      <th className="px-1 py-2 font-semibold text-red-600 w-14 text-[10px]">Excl. Offer</th>
      <th className="px-1 py-2 font-semibold text-red-500 min-w-[90px] text-[10px]">Offer Text</th>
      <th className="px-1 py-2 font-semibold text-red-400 min-w-[70px] text-[10px]">Badge</th>
      <th className="px-1 py-2 font-semibold text-blue-500 w-12 text-[10px]">Online</th>
      <th className="px-1 py-2 font-semibold text-teal-600 w-12 text-[10px]">Offline</th>
      <th className="px-1 py-2 font-semibold text-teal-700 w-12 text-[10px]">In-Pers.</th>
      <th className="px-1 py-2 font-semibold text-[#D4AF37] w-12 text-[10px]">Duration</th>
      <th className="px-1 py-2 font-semibold text-gray-600 w-12 text-[10px]">Price</th>
      <th className="px-1 py-2 font-semibold text-gray-600 w-12 text-[10px]">Tiers</th>
    </tr>
  </thead>
);

const UpcomingHubTab = () => {
  const { toast } = useToast();
  const [programs, setPrograms] = useState([]);
  const [saving, setSaving] = useState(false);

  const fetchData = useCallback(async () => {
    const res = await axios.get(`${API}/programs`);
    setPrograms(res.data || []);
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const update = (idx, field, value) => {
    setPrograms(prev => { const c = [...prev]; c[idx] = { ...c[idx], [field]: value }; return c; });
  };

  const saveAll = async () => {
    setSaving(true);
    try {
      await Promise.all(programs.map(p => axios.put(`${API}/programs/${p.id}`, p)));
      toast({ title: 'All settings saved!' });
    } catch (e) { toast({ title: 'Error saving', description: e.message, variant: 'destructive' }); }
    setSaving(false);
  };

  const upcomingPrograms = programs.filter(p => p.is_upcoming);
  const flagshipPrograms = programs.filter(p => !p.is_upcoming);
  // Map original index
  const upcomingWithIdx = upcomingPrograms.map(p => ({ ...p, _origIdx: programs.findIndex(x => x.id === p.id) }));
  const flagshipWithIdx = flagshipPrograms.map(p => ({ ...p, _origIdx: programs.findIndex(x => x.id === p.id) }));

  return (
    <div data-testid="upcoming-hub-tab">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2"><Calendar size={18} className="text-[#D4AF37]" /> Programs Hub</h2>
          <p className="text-xs text-gray-500 mt-1">Manage all card settings, visibility, and scheduling. Toggle any program as Upcoming in the Programs tab.</p>
        </div>
        <Button onClick={saveAll} disabled={saving} className="bg-[#D4AF37] hover:bg-[#b8962e]" data-testid="upcoming-hub-save">
          <Save size={14} className="mr-1" />{saving ? 'Saving...' : 'Save All'}
        </Button>
      </div>

      {/* ===== UPCOMING PROGRAMS ===== */}
      <div className="mb-8">
        <h3 className="text-sm font-semibold text-blue-700 mb-3 flex items-center gap-1.5 border-l-4 border-blue-500 pl-2">
          <Clock size={14} /> Upcoming Programs
          <span className="text-[10px] font-normal text-gray-400 ml-2">({upcomingPrograms.length} programs)</span>
        </h3>
        {upcomingPrograms.length === 0 ? (
          <p className="text-xs text-gray-400 italic pl-4 mb-4">No upcoming programs. Toggle "Upcoming" ON in the Programs tab to add here.</p>
        ) : (
          <div className="overflow-x-auto border rounded-lg border-blue-200">
            <table className="w-full text-[11px]" data-testid="upcoming-programs-table">
              <TableHeader />
              <tbody>
                {upcomingWithIdx.map((p, i) => (
                  <ProgramRow key={p.id} p={p} i={i} update={(_, field, value) => update(p._origIdx, field, value)} />
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ===== PROGRAMS (NON-UPCOMING / FLAGSHIP) ===== */}
      <div className="mb-6">
        <h3 className="text-sm font-semibold text-[#D4AF37] mb-3 flex items-center gap-1.5 border-l-4 border-[#D4AF37] pl-2">
          <Star size={14} /> Programs
          <span className="text-[10px] font-normal text-gray-400 ml-2">({flagshipPrograms.length} programs)</span>
        </h3>
        {flagshipPrograms.length === 0 ? (
          <p className="text-xs text-gray-400 italic pl-4 mb-4">All programs are marked as Upcoming.</p>
        ) : (
          <div className="overflow-x-auto border rounded-lg border-[#D4AF37]/30">
            <table className="w-full text-[11px]" data-testid="flagship-programs-table">
              <TableHeader />
              <tbody>
                {flagshipWithIdx.map((p, i) => (
                  <ProgramRow key={p.id} p={p} i={i} update={(_, field, value) => update(p._origIdx, field, value)} />
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div className="mt-6 flex justify-end">
        <Button onClick={saveAll} disabled={saving} className="bg-[#D4AF37] hover:bg-[#b8962e]" data-testid="upcoming-hub-save-bottom">
          <Save size={14} className="mr-1" />{saving ? 'Saving...' : 'Save All'}
        </Button>
      </div>
    </div>
  );
};

export default UpcomingHubTab;
