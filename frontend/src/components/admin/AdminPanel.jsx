import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { useToast } from '../../hooks/use-toast';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';
import { Switch } from '../ui/switch';
import { Label } from '../ui/label';
import ImageUploader from './ImageUploader';
import { resolveImageUrl } from '../../lib/imageUtils';
import {
  Settings, Package, Calendar, MessageSquare, BarChart3, Mail,
  Trash2, Edit, Plus, X, Eye, EyeOff, Save, ArrowUp, ArrowDown,
  Globe, Layout, Image, Users, Palette
} from 'lucide-react';

import HeroSettingsTab from './tabs/HeroSettingsTab';
import AboutSettingsTab from './tabs/AboutSettingsTab';
import NewsletterSettingsTab from './tabs/NewsletterSettingsTab';
import HeaderFooterTab from './tabs/HeaderFooterTab';
import EnrollmentsTab from './tabs/EnrollmentsTab';
import GlobalStylesTab from './tabs/GlobalStylesTab';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const AdminPanel = () => {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('hero');

  const [programs, setPrograms] = useState([]);
  const [sessions, setSessions] = useState([]);
  const [testimonials, setTestimonials] = useState([]);
  const [stats, setStats] = useState([]);
  const [subscribers, setSubscribers] = useState([]);
  const [siteSettings, setSiteSettings] = useState(null);

  const [showProgramForm, setShowProgramForm] = useState(false);
  const [showSessionForm, setShowSessionForm] = useState(false);
  const [showTestimonialForm, setShowTestimonialForm] = useState(false);
  const [showStatForm, setShowStatForm] = useState(false);
  const [editingId, setEditingId] = useState(null);

  const [programForm, setProgramForm] = useState({ title: '', category: '', description: '', image: '', price_usd: 0, price_inr: 0, price_eur: 0, price_gbp: 0, price_aed: 0, visible: true, order: 0, program_type: 'online', offer_price_usd: 0, offer_price_inr: 0, offer_text: '', is_upcoming: false, start_date: '', deadline_date: '', enrollment_open: true });
  const [sessionForm, setSessionForm] = useState({ title: '', description: '', image: '', price_usd: 0, price_inr: 0, price_eur: 0, price_gbp: 0, price_aed: 0, visible: true, order: 0 });
  const [testimonialForm, setTestimonialForm] = useState({ type: 'graphic', name: '', text: '', image: '', videoId: '', program_id: '', visible: true });
  const [statForm, setStatForm] = useState({ value: '', label: '', order: 0 });

  const loadAll = useCallback(async () => {
    try {
      const [prog, sess, test, st, subs, settings] = await Promise.all([
        axios.get(`${API}/programs`),
        axios.get(`${API}/sessions`),
        axios.get(`${API}/testimonials`),
        axios.get(`${API}/stats`),
        axios.get(`${API}/newsletter`),
        axios.get(`${API}/settings`),
      ]);
      setPrograms(prog.data);
      setSessions(sess.data);
      setTestimonials(test.data);
      setStats(st.data);
      setSubscribers(subs.data);
      setSiteSettings(settings.data);
    } catch (error) { console.error('Error loading:', error); }
  }, []);

  useEffect(() => { loadAll(); }, [loadAll]);

  // ===== PROGRAMS =====
  const saveProgram = async () => {
    try {
      if (editingId) { await axios.put(`${API}/programs/${editingId}`, programForm); toast({ title: 'Program updated!' }); }
      else { await axios.post(`${API}/programs`, programForm); toast({ title: 'Program created!' }); }
      resetProgramForm(); loadAll();
    } catch (error) { toast({ title: 'Error', description: error.message, variant: 'destructive' }); }
  };
  const editProgram = (p) => {
    setEditingId(p.id);
    setProgramForm({ title: p.title, category: p.category || '', description: p.description, image: p.image, price_usd: p.price_usd || 0, price_inr: p.price_inr || 0, price_eur: p.price_eur || 0, price_gbp: p.price_gbp || 0, price_aed: p.price_aed || 0, visible: p.visible !== false, order: p.order || 0, program_type: p.program_type || 'online', offer_price_usd: p.offer_price_usd || 0, offer_price_inr: p.offer_price_inr || 0, offer_text: p.offer_text || '', is_upcoming: p.is_upcoming || false, start_date: p.start_date || '', deadline_date: p.deadline_date || '', enrollment_open: p.enrollment_open !== false });
    setShowProgramForm(true);
  };
  const deleteProgram = async (id) => { if (!window.confirm('Delete this program?')) return; await axios.delete(`${API}/programs/${id}`); toast({ title: 'Program deleted' }); loadAll(); };
  const toggleProgramVisibility = async (p) => { await axios.patch(`${API}/programs/${p.id}/visibility`, { visible: !p.visible }); loadAll(); };
  const moveProgramOrder = async (idx, dir) => { const items = [...programs]; const sw = idx + dir; if (sw < 0 || sw >= items.length) return; [items[idx], items[sw]] = [items[sw], items[idx]]; await axios.patch(`${API}/programs/reorder`, { order: items.map(i => i.id) }); loadAll(); };
  const resetProgramForm = () => { setShowProgramForm(false); setEditingId(null); setProgramForm({ title: '', category: '', description: '', image: '', price_usd: 0, price_inr: 0, price_eur: 0, price_gbp: 0, price_aed: 0, visible: true, order: 0, program_type: 'online', offer_price_usd: 0, offer_price_inr: 0, offer_text: '', is_upcoming: false, start_date: '', deadline_date: '', enrollment_open: true }); };

  // ===== SESSIONS =====
  const saveSession = async () => {
    try {
      if (editingId) { await axios.put(`${API}/sessions/${editingId}`, sessionForm); toast({ title: 'Session updated!' }); }
      else { await axios.post(`${API}/sessions`, sessionForm); toast({ title: 'Session created!' }); }
      resetSessionForm(); loadAll();
    } catch (error) { toast({ title: 'Error', description: error.message, variant: 'destructive' }); }
  };
  const editSession = (s) => {
    setEditingId(s.id);
    setSessionForm({ title: s.title, description: s.description, image: s.image, price_usd: s.price_usd || 0, price_inr: s.price_inr || 0, price_eur: s.price_eur || 0, price_gbp: s.price_gbp || 0, price_aed: s.price_aed || 0, visible: s.visible !== false, order: s.order || 0 });
    setShowSessionForm(true);
  };
  const deleteSession = async (id) => { if (!window.confirm('Delete this session?')) return; await axios.delete(`${API}/sessions/${id}`); toast({ title: 'Session deleted' }); loadAll(); };
  const toggleSessionVisibility = async (s) => { await axios.patch(`${API}/sessions/${s.id}/visibility`, { visible: !s.visible }); loadAll(); };
  const moveSessionOrder = async (idx, dir) => { const items = [...sessions]; const sw = idx + dir; if (sw < 0 || sw >= items.length) return; [items[idx], items[sw]] = [items[sw], items[idx]]; await axios.patch(`${API}/sessions/reorder`, { order: items.map(i => i.id) }); loadAll(); };
  const resetSessionForm = () => { setShowSessionForm(false); setEditingId(null); setSessionForm({ title: '', description: '', image: '', price_usd: 0, price_inr: 0, price_eur: 0, price_gbp: 0, price_aed: 0, visible: true, order: 0 }); };

  // ===== TESTIMONIALS =====
  const saveTestimonial = async () => {
    try {
      if (editingId) { await axios.put(`${API}/testimonials/${editingId}`, testimonialForm); toast({ title: 'Testimonial updated!' }); }
      else { await axios.post(`${API}/testimonials`, testimonialForm); toast({ title: 'Testimonial created!' }); }
      resetTestimonialForm(); loadAll();
    } catch (error) { toast({ title: 'Error', description: error.message, variant: 'destructive' }); }
  };
  const editTestimonial = (t) => {
    setEditingId(t.id);
    setTestimonialForm({ type: t.type, name: t.name || '', text: t.text || '', image: t.image || '', videoId: t.videoId || '', program_id: t.program_id || '', visible: t.visible !== false });
    setShowTestimonialForm(true);
  };
  const deleteTestimonial = async (id) => { if (!window.confirm('Delete?')) return; await axios.delete(`${API}/testimonials/${id}`); toast({ title: 'Deleted' }); loadAll(); };
  const toggleTestimonialVisibility = async (t) => { await axios.patch(`${API}/testimonials/${t.id}/visibility`, { visible: !t.visible }); loadAll(); };
  const resetTestimonialForm = () => { setShowTestimonialForm(false); setEditingId(null); setTestimonialForm({ type: 'graphic', name: '', text: '', image: '', videoId: '', program_id: '', visible: true }); };

  // ===== STATS =====
  const saveStat = async () => {
    try {
      if (editingId) { await axios.put(`${API}/stats/${editingId}`, statForm); toast({ title: 'Stat updated!' }); }
      else { await axios.post(`${API}/stats`, statForm); toast({ title: 'Stat created!' }); }
      setShowStatForm(false); setEditingId(null); setStatForm({ value: '', label: '', order: 0 }); loadAll();
    } catch (error) { toast({ title: 'Error', description: error.message, variant: 'destructive' }); }
  };
  const editStat = (st) => { setEditingId(st.id); setStatForm({ value: st.value, label: st.label, order: st.order || 0 }); setShowStatForm(true); };
  const deleteStat = async (id) => { if (!window.confirm('Delete?')) return; await axios.delete(`${API}/stats/${id}`); toast({ title: 'Deleted' }); loadAll(); };

  // ===== SITE SETTINGS =====
  const saveSiteSettings = async () => {
    try {
      await axios.put(`${API}/settings`, siteSettings);
      toast({ title: 'Settings saved!' });
    } catch (error) { toast({ title: 'Error', description: error.message, variant: 'destructive' }); }
  };

  const handleVideoUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const formData = new FormData();
    formData.append('file', file);
    try {
      toast({ title: 'Uploading video...' });
      const res = await axios.post(`${API}/upload/video`, formData, { headers: { 'Content-Type': 'multipart/form-data' } });
      setSiteSettings({ ...siteSettings, hero_video_url: res.data.url });
      toast({ title: 'Video uploaded!' });
    } catch (err) { toast({ title: 'Upload failed', variant: 'destructive' }); }
  };

  const tabs = [
    { key: 'hero', label: 'Hero Banner', icon: Image },
    { key: 'about', label: 'About', icon: Layout },
    { key: 'programs', label: 'Programs', icon: Package, count: programs.length },
    { key: 'sessions', label: 'Sessions', icon: Calendar, count: sessions.length },
    { key: 'testimonials', label: 'Testimonials', icon: MessageSquare, count: testimonials.length },
    { key: 'stats', label: 'Stats', icon: BarChart3, count: stats.length },
    { key: 'newsletter', label: 'Newsletter', icon: Mail },
    { key: 'header_footer', label: 'Header & Footer', icon: Globe },
    { key: 'enrollments', label: 'Enrollments', icon: Users },
    { key: 'subscribers', label: 'Subscribers', icon: Mail, count: subscribers.length },
    { key: 'styles', label: 'Global Styles', icon: Palette },
  ];

  const settingsTabKeys = ['hero', 'about', 'newsletter', 'header_footer', 'styles'];
  const needsSave = settingsTabKeys.includes(activeTab);

  return (
    <div data-testid="admin-panel" className="min-h-screen bg-gray-50">
      <div className="bg-gray-900 text-white py-4 px-6 flex justify-between items-center">
        <h1 className="text-lg font-semibold tracking-wider">Divine Iris Admin</h1>
        <a href="/" className="text-xs text-gray-400 hover:text-[#D4AF37] transition-colors">View Site</a>
      </div>

      <div className="flex">
        <aside className="w-52 bg-white border-r min-h-[calc(100vh-56px)] p-3 hidden md:block">
          {tabs.map(tab => (
            <button key={tab.key} data-testid={`admin-tab-${tab.key}`} onClick={() => setActiveTab(tab.key)}
              className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs mb-0.5 transition-all ${
                activeTab === tab.key ? 'bg-[#D4AF37] text-white' : 'text-gray-600 hover:bg-gray-50'
              }`}>
              <tab.icon size={14} />
              <span>{tab.label}</span>
              {tab.count !== undefined && <span className="ml-auto text-[10px] opacity-70">{tab.count}</span>}
            </button>
          ))}
        </aside>

        <div className="md:hidden w-full overflow-x-auto border-b bg-white">
          <div className="flex">
            {tabs.map(tab => (
              <button key={tab.key} onClick={() => setActiveTab(tab.key)}
                className={`px-3 py-3 text-[10px] whitespace-nowrap ${activeTab === tab.key ? 'border-b-2 border-[#D4AF37] text-[#D4AF37]' : 'text-gray-500'}`}>
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        <main className="flex-1 p-6 max-w-5xl">
          {/* Settings-based tabs with save button */}
          {activeTab === 'hero' && siteSettings && (
            <div>
              <HeroSettingsTab settings={siteSettings} onChange={setSiteSettings} onVideoUpload={handleVideoUpload} />
              <Button data-testid="save-settings-btn" onClick={saveSiteSettings} className="bg-[#D4AF37] hover:bg-[#b8962e] mt-5"><Save size={14} className="mr-1" /> Save Changes</Button>
            </div>
          )}

          {activeTab === 'about' && siteSettings && (
            <div>
              <AboutSettingsTab settings={siteSettings} onChange={setSiteSettings} />
              <Button onClick={saveSiteSettings} className="bg-[#D4AF37] hover:bg-[#b8962e] mt-5"><Save size={14} className="mr-1" /> Save Changes</Button>
            </div>
          )}

          {activeTab === 'newsletter' && siteSettings && (
            <div>
              <NewsletterSettingsTab settings={siteSettings} onChange={setSiteSettings} />
              <Button onClick={saveSiteSettings} className="bg-[#D4AF37] hover:bg-[#b8962e] mt-5"><Save size={14} className="mr-1" /> Save Changes</Button>
            </div>
          )}

          {activeTab === 'header_footer' && siteSettings && (
            <div>
              <HeaderFooterTab settings={siteSettings} onChange={setSiteSettings} />
              <Button onClick={saveSiteSettings} className="bg-[#D4AF37] hover:bg-[#b8962e] mt-5"><Save size={14} className="mr-1" /> Save Changes</Button>
            </div>
          )}

          {activeTab === 'styles' && siteSettings && (
            <div>
              <GlobalStylesTab settings={siteSettings} onChange={setSiteSettings} />
              <Button onClick={saveSiteSettings} className="bg-[#D4AF37] hover:bg-[#b8962e] mt-5"><Save size={14} className="mr-1" /> Save Changes</Button>
            </div>
          )}

          {activeTab === 'enrollments' && <EnrollmentsTab />}

          {/* ===== PROGRAMS TAB ===== */}
          {activeTab === 'programs' && (
            <div>
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-semibold text-gray-900">Programs ({programs.length})</h2>
                <Button data-testid="add-program-btn" onClick={() => { resetProgramForm(); setShowProgramForm(true); }} className="bg-[#D4AF37] hover:bg-[#b8962e]"><Plus size={16} className="mr-1" /> Add Program</Button>
              </div>

              {showProgramForm && (
                <div data-testid="program-form" className="bg-white rounded-lg p-6 mb-6 shadow-sm border">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="font-medium">{editingId ? 'Edit Program' : 'New Program'}</h3>
                    <button onClick={resetProgramForm}><X size={18} /></button>
                  </div>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div><Label>Title</Label><Input data-testid="program-title-input" value={programForm.title} onChange={e => setProgramForm({...programForm, title: e.target.value})} /></div>
                    <div><Label>Category</Label><Input value={programForm.category} onChange={e => setProgramForm({...programForm, category: e.target.value})} /></div>
                    <div className="md:col-span-2"><Label>Description</Label><Textarea value={programForm.description} onChange={e => setProgramForm({...programForm, description: e.target.value})} rows={4} /></div>
                    <div className="md:col-span-2"><Label>Image</Label><ImageUploader value={programForm.image} onChange={url => setProgramForm({...programForm, image: url})} /></div>
                    <div><Label>Price AED</Label><Input type="number" value={programForm.price_aed} onChange={e => setProgramForm({...programForm, price_aed: parseFloat(e.target.value)||0})} /></div>
                    <div><Label>Price USD</Label><Input type="number" value={programForm.price_usd} onChange={e => setProgramForm({...programForm, price_usd: parseFloat(e.target.value)||0})} /></div>
                    <div><Label>Price INR</Label><Input type="number" value={programForm.price_inr} onChange={e => setProgramForm({...programForm, price_inr: parseFloat(e.target.value)||0})} /></div>
                    <div><Label>Offer Price INR</Label><Input type="number" value={programForm.offer_price_inr} onChange={e => setProgramForm({...programForm, offer_price_inr: parseFloat(e.target.value)||0})} placeholder="0 = no offer" /></div>
                    <div className="md:col-span-2"><Label>Offer Badge Text</Label><Input value={programForm.offer_text} onChange={e => setProgramForm({...programForm, offer_text: e.target.value})} placeholder="e.g., 20% OFF" /></div>
                    <div>
                      <Label>Program Type</Label>
                      <select value={programForm.program_type} onChange={e => setProgramForm({...programForm, program_type: e.target.value})} className="w-full border rounded-md px-3 py-2 text-sm">
                        <option value="online">Online</option><option value="offline">In-Person</option><option value="hybrid">Hybrid</option>
                      </select>
                    </div>
                    <div><Label>Start Date</Label><Input value={programForm.start_date} onChange={e => setProgramForm({...programForm, start_date: e.target.value})} placeholder="e.g., March 15, 2026" /></div>
                    <div><Label>Deadline Date</Label><Input type="date" value={programForm.deadline_date||''} onChange={e => setProgramForm({...programForm, deadline_date: e.target.value})} /></div>
                    <div className="flex items-center gap-2"><Switch checked={programForm.is_upcoming} onCheckedChange={v => setProgramForm({...programForm, is_upcoming: v})} /><Label>Show in Upcoming</Label></div>
                    <div className="flex items-center gap-2"><Switch checked={programForm.enrollment_open!==false} onCheckedChange={v => setProgramForm({...programForm, enrollment_open: v})} /><Label>Enrollment Open</Label></div>
                    <div className="flex items-center gap-2"><Switch checked={programForm.visible} onCheckedChange={v => setProgramForm({...programForm, visible: v})} /><Label>Visible on Site</Label></div>
                  </div>
                  <div className="mt-4 flex gap-2">
                    <Button data-testid="save-program-btn" onClick={saveProgram} className="bg-[#D4AF37] hover:bg-[#b8962e]"><Save size={14} className="mr-1" /> Save</Button>
                    <Button variant="outline" onClick={resetProgramForm}>Cancel</Button>
                  </div>
                </div>
              )}

              <div className="space-y-2">
                {programs.map((p, idx) => (
                  <div key={p.id} data-testid={`program-row-${p.id}`} className={`bg-white rounded-lg p-4 flex items-center gap-4 shadow-sm border ${!p.visible ? 'opacity-60' : ''}`}>
                    <div className="flex flex-col gap-1">
                      <button onClick={() => moveProgramOrder(idx, -1)} disabled={idx===0} className="p-0.5 hover:bg-gray-100 rounded disabled:opacity-30"><ArrowUp size={14} /></button>
                      <button onClick={() => moveProgramOrder(idx, 1)} disabled={idx===programs.length-1} className="p-0.5 hover:bg-gray-100 rounded disabled:opacity-30"><ArrowDown size={14} /></button>
                    </div>
                    {p.image && <img src={resolveImageUrl(p.image)} alt={p.title} className="w-14 h-14 object-cover rounded" />}
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm text-gray-900 truncate">{p.title}</p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <p className="text-xs text-gray-500">{p.category}</p>
                        {p.is_upcoming && <span className="text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded">Upcoming</span>}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button onClick={() => toggleProgramVisibility(p)} className="p-1.5 rounded hover:bg-gray-100">{p.visible ? <Eye size={16} className="text-green-600" /> : <EyeOff size={16} className="text-gray-400" />}</button>
                      <button onClick={() => editProgram(p)} className="p-1.5 rounded hover:bg-gray-100"><Edit size={16} className="text-blue-600" /></button>
                      <button onClick={() => deleteProgram(p.id)} className="p-1.5 rounded hover:bg-gray-100"><Trash2 size={16} className="text-red-500" /></button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ===== SESSIONS TAB ===== */}
          {activeTab === 'sessions' && (
            <div>
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-semibold text-gray-900">Sessions ({sessions.length})</h2>
                <Button data-testid="add-session-btn" onClick={() => { resetSessionForm(); setShowSessionForm(true); }} className="bg-[#D4AF37] hover:bg-[#b8962e]"><Plus size={16} className="mr-1" /> Add Session</Button>
              </div>

              {showSessionForm && (
                <div data-testid="session-form" className="bg-white rounded-lg p-6 mb-6 shadow-sm border">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="font-medium">{editingId ? 'Edit Session' : 'New Session'}</h3>
                    <button onClick={resetSessionForm}><X size={18} /></button>
                  </div>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="md:col-span-2"><Label>Title</Label><Input data-testid="session-title-input" value={sessionForm.title} onChange={e => setSessionForm({...sessionForm, title: e.target.value})} /></div>
                    <div className="md:col-span-2"><Label>Description</Label><Textarea value={sessionForm.description} onChange={e => setSessionForm({...sessionForm, description: e.target.value})} rows={4} /></div>
                    <div className="md:col-span-2"><Label>Image</Label><ImageUploader value={sessionForm.image} onChange={url => setSessionForm({...sessionForm, image: url})} /></div>
                    <div><Label>Price AED</Label><Input type="number" value={sessionForm.price_aed||0} onChange={e => setSessionForm({...sessionForm, price_aed: parseFloat(e.target.value)||0})} /></div>
                    <div><Label>Price USD</Label><Input type="number" value={sessionForm.price_usd} onChange={e => setSessionForm({...sessionForm, price_usd: parseFloat(e.target.value)||0})} /></div>
                    <div><Label>Price INR</Label><Input type="number" value={sessionForm.price_inr} onChange={e => setSessionForm({...sessionForm, price_inr: parseFloat(e.target.value)||0})} /></div>
                    <div className="flex items-center gap-2"><Switch checked={sessionForm.visible} onCheckedChange={v => setSessionForm({...sessionForm, visible: v})} /><Label>Visible on Site</Label></div>
                  </div>
                  <div className="mt-4 flex gap-2">
                    <Button data-testid="save-session-btn" onClick={saveSession} className="bg-[#D4AF37] hover:bg-[#b8962e]"><Save size={14} className="mr-1" /> Save</Button>
                    <Button variant="outline" onClick={resetSessionForm}>Cancel</Button>
                  </div>
                </div>
              )}

              <div className="space-y-2">
                {sessions.map((s, idx) => (
                  <div key={s.id} data-testid={`session-row-${s.id}`} className={`bg-white rounded-lg p-4 flex items-center gap-4 shadow-sm border ${!s.visible ? 'opacity-60' : ''}`}>
                    <div className="flex flex-col gap-1">
                      <button onClick={() => moveSessionOrder(idx, -1)} disabled={idx===0} className="p-0.5 hover:bg-gray-100 rounded disabled:opacity-30"><ArrowUp size={14} /></button>
                      <button onClick={() => moveSessionOrder(idx, 1)} disabled={idx===sessions.length-1} className="p-0.5 hover:bg-gray-100 rounded disabled:opacity-30"><ArrowDown size={14} /></button>
                    </div>
                    {s.image && <img src={resolveImageUrl(s.image)} alt={s.title} className="w-14 h-14 object-cover rounded" />}
                    <div className="flex-1 min-w-0"><p className="font-medium text-sm text-gray-900 truncate">{s.title}</p></div>
                    <div className="flex items-center gap-2">
                      <button onClick={() => toggleSessionVisibility(s)} className="p-1.5 rounded hover:bg-gray-100">{s.visible ? <Eye size={16} className="text-green-600" /> : <EyeOff size={16} className="text-gray-400" />}</button>
                      <button onClick={() => editSession(s)} className="p-1.5 rounded hover:bg-gray-100"><Edit size={16} className="text-blue-600" /></button>
                      <button onClick={() => deleteSession(s.id)} className="p-1.5 rounded hover:bg-gray-100"><Trash2 size={16} className="text-red-500" /></button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ===== TESTIMONIALS TAB ===== */}
          {activeTab === 'testimonials' && (
            <div>
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-semibold text-gray-900">Testimonials ({testimonials.length})</h2>
                <Button data-testid="add-testimonial-btn" onClick={() => { resetTestimonialForm(); setShowTestimonialForm(true); }} className="bg-[#D4AF37] hover:bg-[#b8962e]"><Plus size={16} className="mr-1" /> Add Testimonial</Button>
              </div>
              {showTestimonialForm && (
                <div data-testid="testimonial-form" className="bg-white rounded-lg p-6 mb-6 shadow-sm border">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="font-medium">{editingId ? 'Edit Testimonial' : 'New Testimonial'}</h3>
                    <button onClick={resetTestimonialForm}><X size={18} /></button>
                  </div>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <Label>Type</Label>
                      <select data-testid="testimonial-type-select" value={testimonialForm.type} onChange={e => setTestimonialForm({...testimonialForm, type: e.target.value})} className="w-full border rounded-md px-3 py-2 text-sm">
                        <option value="graphic">Graphic (Image)</option><option value="video">Video (YouTube)</option>
                      </select>
                    </div>
                    <div><Label>Name</Label><Input value={testimonialForm.name} onChange={e => setTestimonialForm({...testimonialForm, name: e.target.value})} /></div>
                    <div className="md:col-span-2"><Label>Text</Label><Textarea data-testid="testimonial-text-input" value={testimonialForm.text} onChange={e => setTestimonialForm({...testimonialForm, text: e.target.value})} rows={3} /></div>
                    {testimonialForm.type==='graphic' && <div className="md:col-span-2"><Label>Image</Label><ImageUploader value={testimonialForm.image} onChange={url => setTestimonialForm({...testimonialForm, image: url})} /></div>}
                    {testimonialForm.type==='video' && <div className="md:col-span-2"><Label>YouTube Video ID</Label><Input value={testimonialForm.videoId} onChange={e => setTestimonialForm({...testimonialForm, videoId: e.target.value})} placeholder="e.g., FVgxpMEMnoc" /></div>}
                    <div className="flex items-center gap-2"><Switch checked={testimonialForm.visible} onCheckedChange={v => setTestimonialForm({...testimonialForm, visible: v})} /><Label>Visible</Label></div>
                  </div>
                  <div className="mt-4 flex gap-2">
                    <Button data-testid="save-testimonial-btn" onClick={saveTestimonial} className="bg-[#D4AF37] hover:bg-[#b8962e]"><Save size={14} className="mr-1" /> Save</Button>
                    <Button variant="outline" onClick={resetTestimonialForm}>Cancel</Button>
                  </div>
                </div>
              )}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {testimonials.map((t) => (
                  <div key={t.id} className={`bg-white rounded-lg shadow-sm border overflow-hidden ${!t.visible ? 'opacity-50' : ''}`}>
                    {t.type==='graphic' && t.image && <img src={resolveImageUrl(t.image)} alt={t.name} className="w-full h-32 object-cover" />}
                    {t.type==='video' && <img src={t.thumbnail||`https://img.youtube.com/vi/${t.videoId}/hqdefault.jpg`} alt={t.name} className="w-full h-32 object-cover" />}
                    <div className="p-3">
                      <span className={`inline-block px-2 py-0.5 rounded text-xs ${t.type==='graphic'?'bg-blue-100 text-blue-700':'bg-red-100 text-red-700'}`}>{t.type}</span>
                      {t.name && <p className="text-sm font-medium mt-1">{t.name}</p>}
                      <div className="flex items-center gap-2 mt-2">
                        <button onClick={() => toggleTestimonialVisibility(t)} className="p-1 rounded hover:bg-gray-100">{t.visible ? <Eye size={14} className="text-green-600" /> : <EyeOff size={14} className="text-gray-400" />}</button>
                        <button onClick={() => editTestimonial(t)} className="p-1 rounded hover:bg-gray-100"><Edit size={14} className="text-blue-600" /></button>
                        <button onClick={() => deleteTestimonial(t.id)} className="p-1 rounded hover:bg-gray-100"><Trash2 size={14} className="text-red-500" /></button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ===== STATS TAB ===== */}
          {activeTab === 'stats' && (
            <div>
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h2 className="text-xl font-semibold text-gray-900">Stats ({stats.length})</h2>
                  <p className="text-xs text-gray-400">The numbers shown in the dark section (e.g., "28000+ Clients")</p>
                </div>
                <Button onClick={() => { setEditingId(null); setStatForm({ value: '', label: '', order: 0 }); setShowStatForm(true); }} className="bg-[#D4AF37] hover:bg-[#b8962e]"><Plus size={16} className="mr-1" /> Add Stat</Button>
              </div>
              {showStatForm && (
                <div className="bg-white rounded-lg p-6 mb-6 shadow-sm border">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="font-medium">{editingId ? 'Edit Stat' : 'New Stat'}</h3>
                    <button onClick={() => { setShowStatForm(false); setEditingId(null); }}><X size={18} /></button>
                  </div>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div><Label>Value (e.g., "28000+")</Label><Input value={statForm.value} onChange={e => setStatForm({...statForm, value: e.target.value})} placeholder="28000+" /></div>
                    <div><Label>Label (e.g., "Happy Clients")</Label><Input value={statForm.label} onChange={e => setStatForm({...statForm, label: e.target.value})} placeholder="Happy Clients" /></div>
                  </div>
                  <div className="mt-4 flex gap-2">
                    <Button onClick={saveStat} className="bg-[#D4AF37] hover:bg-[#b8962e]"><Save size={14} className="mr-1" /> Save</Button>
                    <Button variant="outline" onClick={() => { setShowStatForm(false); setEditingId(null); }}>Cancel</Button>
                  </div>
                </div>
              )}
              <div className="space-y-2">
                {stats.map((st) => (
                  <div key={st.id} className="bg-white rounded-lg p-4 flex items-center gap-4 shadow-sm border">
                    <div className="text-2xl font-bold text-[#D4AF37] w-32 text-center">{st.value}</div>
                    <div className="flex-1 text-sm text-gray-600">{st.label}</div>
                    <div className="flex items-center gap-2">
                      <button onClick={() => editStat(st)} className="p-1.5 rounded hover:bg-gray-100"><Edit size={16} className="text-blue-600" /></button>
                      <button onClick={() => deleteStat(st.id)} className="p-1.5 rounded hover:bg-gray-100"><Trash2 size={16} className="text-red-500" /></button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ===== SUBSCRIBERS TAB ===== */}
          {activeTab === 'subscribers' && (
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-6">Subscribers ({subscribers.length})</h2>
              <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50 border-b"><tr><th className="px-4 py-3 text-left text-xs text-gray-500">Email</th><th className="px-4 py-3 text-left text-xs text-gray-500">Date</th></tr></thead>
                  <tbody>
                    {subscribers.map(sub => (
                      <tr key={sub.id||sub.email} className="border-b"><td className="px-4 py-3">{sub.email}</td><td className="px-4 py-3 text-gray-500">{sub.subscribed_at?new Date(sub.subscribed_at).toLocaleDateString():'-'}</td></tr>
                    ))}
                  </tbody>
                </table>
                {subscribers.length===0 && <p className="text-center py-8 text-gray-400">No subscribers yet</p>}
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default AdminPanel;
