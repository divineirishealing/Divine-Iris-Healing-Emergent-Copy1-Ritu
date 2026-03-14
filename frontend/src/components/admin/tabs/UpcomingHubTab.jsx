import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { useToast } from '../../../hooks/use-toast';
import { Button } from '../../ui/button';
import { Input } from '../../ui/input';
import { Switch } from '../../ui/switch';
import { Save, Calendar, Clock, AlertTriangle } from 'lucide-react';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

const CLOSURE_OPTIONS = ['Registration Closed', 'Seats Full', 'Enrollment Closed', 'Sold Out'];

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
    setPrograms(prev => {
      const copy = [...prev];
      copy[idx] = { ...copy[idx], [field]: value };
      return copy;
    });
  };

  const saveAll = async () => {
    setSaving(true);
    try {
      await Promise.all(programs.map(p => axios.put(`${API}/programs/${p.id}`, p)));
      toast({ title: 'All upcoming settings saved!' });
    } catch (e) {
      toast({ title: 'Error saving', description: e.message, variant: 'destructive' });
    }
    setSaving(false);
  };

  return (
    <div data-testid="upcoming-hub-tab">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2"><Calendar size={18} className="text-[#D4AF37]" /> Upcoming Programs Hub</h2>
          <p className="text-xs text-gray-500 mt-1">Manage all card-related settings in one place.</p>
        </div>
        <Button onClick={saveAll} disabled={saving} className="bg-[#D4AF37] hover:bg-[#b8962e]" data-testid="upcoming-hub-save">
          <Save size={14} className="mr-1" />{saving ? 'Saving...' : 'Save All'}
        </Button>
      </div>

      <div className="overflow-x-auto border rounded-lg">
        <table className="w-full text-xs" data-testid="upcoming-programs-table">
          <thead>
            <tr className="bg-gray-100 border-b">
              <th className="text-left px-3 py-2.5 font-semibold text-gray-700 min-w-[140px] sticky left-0 bg-gray-100 z-10">Program</th>
              <th className="px-2 py-2.5 font-semibold text-blue-600 w-16">Upcoming</th>
              <th className="px-2 py-2.5 font-semibold text-[#D4AF37] w-16">Flagship</th>
              <th className="px-2 py-2.5 font-semibold text-green-600 w-16">Enroll Open</th>
              <th className="px-2 py-2.5 font-semibold text-orange-600 min-w-[130px]">Closure Text</th>
              <th className="px-2 py-2.5 font-semibold text-gray-600 min-w-[120px]">Start Date</th>
              <th className="px-2 py-2.5 font-semibold text-gray-600 min-w-[120px]">End Date</th>
              <th className="px-2 py-2.5 font-semibold text-gray-600 min-w-[120px]">Deadline</th>
              <th className="px-2 py-2.5 font-semibold text-gray-600 min-w-[90px]">Timing</th>
              <th className="px-2 py-2.5 font-semibold text-gray-600 min-w-[80px]">Timezone</th>
              <th className="px-2 py-2.5 font-semibold text-red-600 w-16">Exclusive Offer</th>
              <th className="px-2 py-2.5 font-semibold text-red-500 min-w-[130px]">Offer Text</th>
              <th className="px-2 py-2.5 font-semibold text-red-400 min-w-[100px]">Offer Badge</th>
              <th className="px-2 py-2.5 font-semibold text-blue-500 w-14">Online</th>
              <th className="px-2 py-2.5 font-semibold text-teal-600 w-14">Offline</th>
              <th className="px-2 py-2.5 font-semibold text-teal-700 w-14">In-Person</th>
            </tr>
          </thead>
          <tbody>
            {programs.map((p, i) => (
              <tr key={p.id} className={`border-b ${i % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'} hover:bg-yellow-50/30 ${p.enrollment_open === false ? 'opacity-70' : ''}`} data-testid={`upcoming-row-${p.id}`}>
                <td className="px-3 py-2 sticky left-0 bg-inherit z-10">
                  <div className="font-medium text-gray-900 truncate max-w-[180px]" title={p.title}>{p.title}</div>
                </td>
                <td className="px-2 py-2 text-center">
                  <Switch checked={p.is_upcoming || false} onCheckedChange={v => update(i, 'is_upcoming', v)} />
                </td>
                <td className="px-2 py-2 text-center">
                  <Switch checked={p.is_flagship || false} onCheckedChange={v => update(i, 'is_flagship', v)} />
                </td>
                <td className="px-2 py-2 text-center">
                  <Switch checked={p.enrollment_open !== false} onCheckedChange={v => update(i, 'enrollment_open', v)} />
                </td>
                <td className="px-1 py-1">
                  {p.enrollment_open === false ? (
                    <select value={p.closure_text || 'Registration Closed'} onChange={e => update(i, 'closure_text', e.target.value)}
                      className="w-full border rounded px-1.5 py-1.5 text-[10px] bg-orange-50 border-orange-200 text-orange-800">
                      {CLOSURE_OPTIONS.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                    </select>
                  ) : <span className="text-[10px] text-gray-400 px-1.5">-</span>}
                </td>
                <td className="px-1 py-1">
                  <Input value={p.start_date || ''} onChange={e => update(i, 'start_date', e.target.value)} placeholder="e.g., Jan 15, 2026" className="h-7 text-[10px] px-1.5" />
                </td>
                <td className="px-1 py-1">
                  <Input value={p.end_date || ''} onChange={e => update(i, 'end_date', e.target.value)} placeholder="e.g., Feb 4, 2026" className="h-7 text-[10px] px-1.5" />
                </td>
                <td className="px-1 py-1">
                  <Input value={p.deadline_date || ''} onChange={e => update(i, 'deadline_date', e.target.value)} placeholder="Countdown deadline" className="h-7 text-[10px] px-1.5" />
                </td>
                <td className="px-1 py-1">
                  <Input value={p.timing || ''} onChange={e => update(i, 'timing', e.target.value)} placeholder="e.g., 7 PM - 8 PM" className="h-7 text-[10px] px-1.5" />
                </td>
                <td className="px-1 py-1">
                  <select value={p.time_zone || ''} onChange={e => update(i, 'time_zone', e.target.value)}
                    className="w-full border rounded px-1 py-1.5 text-[10px] bg-white">
                    <option value="">--</option>
                    <option value="IST">IST</option>
                    <option value="GST Dubai">GST Dubai</option>
                    <option value="EST">EST</option>
                    <option value="PST">PST</option>
                    <option value="GMT">GMT</option>
                    <option value="CET">CET</option>
                    <option value="AEST">AEST</option>
                    <option value="SGT">SGT</option>
                    <option value="JST">JST</option>
                  </select>
                </td>
                <td className="px-2 py-2 text-center">
                  <Switch checked={p.exclusive_offer_enabled || false} onCheckedChange={v => update(i, 'exclusive_offer_enabled', v)} />
                </td>
                <td className="px-1 py-1">
                  {p.exclusive_offer_enabled ? (
                    <Input value={p.exclusive_offer_text || ''} onChange={e => update(i, 'exclusive_offer_text', e.target.value)} placeholder="e.g., Limited Seats" className="h-7 text-[10px] px-1.5 border-red-200 bg-red-50" />
                  ) : <span className="text-[10px] text-gray-400 px-1.5">-</span>}
                </td>
                <td className="px-1 py-1">
                  <Input value={p.offer_text || ''} onChange={e => update(i, 'offer_text', e.target.value)} placeholder="e.g., 20% OFF" className="h-7 text-[10px] px-1.5" />
                </td>
                <td className="px-2 py-2 text-center">
                  <Switch checked={p.enable_online !== false} onCheckedChange={v => update(i, 'enable_online', v)} />
                </td>
                <td className="px-2 py-2 text-center">
                  <Switch checked={p.enable_offline !== false} onCheckedChange={v => update(i, 'enable_offline', v)} />
                </td>
                <td className="px-2 py-2 text-center">
                  <Switch checked={p.enable_in_person || false} onCheckedChange={v => update(i, 'enable_in_person', v)} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
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
