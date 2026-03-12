import React from 'react';
import { Input } from '../../ui/input';
import { Label } from '../../ui/label';
import { Button } from '../../ui/button';
import { Switch } from '../../ui/switch';
import { Copy } from 'lucide-react';

const FONT_OPTIONS = [
  { value: '', label: 'Default' },
  { value: "'Cinzel', serif", label: 'Cinzel' },
  { value: "'Playfair Display', serif", label: 'Playfair' },
  { value: "'Lato', sans-serif", label: 'Lato' },
  { value: "'Montserrat', sans-serif", label: 'Montserrat' },
];
const SIZE_OPTIONS = ['10px','12px','14px','16px','18px','20px','24px','28px','32px','36px','42px','48px'];

const StyleCell = ({ style = {}, onStyleChange, label }) => {
  const update = (prop, val) => onStyleChange({ ...style, [prop]: val });
  return (
    <div className="mt-1">
      {label && <span className="text-[8px] text-gray-400 uppercase tracking-wider">{label}</span>}
      <div className="flex gap-1 items-center flex-wrap">
        <input type="color" value={style.font_color || '#000000'} onChange={e => update('font_color', e.target.value)} className="w-5 h-5 rounded cursor-pointer border-0" />
        <select value={style.font_family || ''} onChange={e => update('font_family', e.target.value)} className="text-[9px] border rounded px-1 py-0.5 w-16">
          {FONT_OPTIONS.map(f => <option key={f.value} value={f.value}>{f.label}</option>)}
        </select>
        <select value={style.font_size || ''} onChange={e => update('font_size', e.target.value)} className="text-[9px] border rounded px-1 py-0.5 w-12">
          <option value="">Size</option>
          {SIZE_OPTIONS.map(s => <option key={s} value={s}>{s}</option>)}
        </select>
        <button type="button" onClick={() => update('font_weight', style.font_weight === 'bold' ? '400' : 'bold')} className={`text-[9px] px-1 py-0.5 rounded border ${style.font_weight === 'bold' ? 'bg-gray-800 text-white' : 'bg-white'}`}><b>B</b></button>
        <button type="button" onClick={() => update('font_style', style.font_style === 'italic' ? 'normal' : 'italic')} className={`text-[9px] px-1 py-0.5 rounded border ${style.font_style === 'italic' ? 'bg-gray-800 text-white' : 'bg-white'}`}><i>I</i></button>
      </div>
    </div>
  );
};

const STATIC_PAGES = [
  { key: 'home', label: 'Homepage', defaultTitle: 'Divine Iris Healing', defaultSubtitle: 'ETERNAL HAPPINESS', alwaysVisible: true },
  { key: 'services', label: 'Services', defaultTitle: 'Our Services', defaultSubtitle: 'Claim your personal space', alwaysVisible: true },
  { key: 'contact', label: 'Contact', defaultTitle: 'Express Your Interest', defaultSubtitle: 'Ready to begin your healing journey?', alwaysVisible: true },
  { key: 'about', label: 'About', defaultTitle: 'Dimple Ranawat', defaultSubtitle: 'Founder, Divine Iris – Soulful Healing Studio', alwaysVisible: true },
  { key: 'programs', label: 'All Programs', defaultTitle: 'All Programs', defaultSubtitle: 'Explore our comprehensive healing programs', alwaysVisible: true },
  { key: 'sponsor', label: 'Shine a Light', defaultTitle: 'Shine a Light in a Life', defaultSubtitle: 'Healing flows when we support each other.', alwaysVisible: true },
  { key: 'transformations', label: 'Transformations', defaultTitle: 'TRANSFORMATIONS', defaultSubtitle: 'Stories of Healing, Growth & Awakening', alwaysVisible: true },
  { key: 'media', label: 'Media', defaultTitle: 'MEDIA', defaultSubtitle: '', toggleKey: 'media_page_visible' },
  { key: 'blog', label: 'Blog', defaultTitle: 'BLOG', defaultSubtitle: 'Insights, stories and updates', toggleKey: 'blog_page_visible' },
  { key: 'sessions', label: 'Personal Sessions', defaultTitle: 'Personal Healing Sessions', defaultSubtitle: 'Individual sessions tailored to your unique healing journey', toggleKey: 'sessions_page_visible' },
];

const TEMPLATE_STYLE_KEYS = [
  { key: 'title_style', label: 'Hero Title' },
  { key: 'subtitle_style', label: 'Hero Subtitle' },
  { key: 'section_title_style', label: 'Section Titles' },
  { key: 'section_subtitle_style', label: 'Section Subtitles' },
  { key: 'body_style', label: 'Body / Description Text' },
  { key: 'cta_style', label: 'CTA / Pricing Text' },
];

const PageHeadersTab = ({ settings, programs = [], onChange }) => {
  const heroes = settings.page_heroes || {};
  const getHero = (key) => heroes[key] || {};

  const updateHero = (key, field, value) => {
    const updated = { ...heroes, [key]: { ...getHero(key), [field]: value } };
    onChange({ ...settings, page_heroes: updated });
  };

  const applyToAll = () => {
    const src = getHero('home');
    const updated = { ...heroes };
    STATIC_PAGES.forEach(p => {
      updated[p.key] = { ...getHero(p.key), title_style: { ...(src.title_style || {}) }, subtitle_style: { ...(src.subtitle_style || {}) } };
    });
    onChange({ ...settings, page_heroes: updated });
  };

  const PageRow = ({ pageKey, label, defaultTitle, defaultSubtitle, toggleKey }) => {
    const hero = getHero(pageKey);
    return (
      <div className="bg-white rounded-lg border p-3 mb-2" data-testid={`hero-row-${pageKey}`}>
        <div className="flex items-center gap-2 mb-2">
          <span className="text-[10px] font-semibold text-gray-700 w-24 flex-shrink-0">{label}</span>
          {toggleKey && (
            <div className="flex items-center gap-1 ml-auto">
              <Label className="text-[9px] text-gray-400">Visible</Label>
              <Switch checked={settings[toggleKey] || false} onCheckedChange={v => onChange({ ...settings, [toggleKey]: v })} />
            </div>
          )}
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label className="text-[9px] text-gray-400">Hero Title</Label>
            <Input value={hero.title_text ?? defaultTitle} onChange={e => updateHero(pageKey, 'title_text', e.target.value)} className="text-[10px] h-7 mb-1" />
            <StyleCell style={hero.title_style || {}} onStyleChange={v => updateHero(pageKey, 'title_style', v)} />
          </div>
          <div>
            <Label className="text-[9px] text-gray-400">Hero Subtitle</Label>
            <Input value={hero.subtitle_text ?? defaultSubtitle} onChange={e => updateHero(pageKey, 'subtitle_text', e.target.value)} className="text-[10px] h-7 mb-1" />
            <StyleCell style={hero.subtitle_style || {}} onStyleChange={v => updateHero(pageKey, 'subtitle_style', v)} />
          </div>
        </div>
      </div>
    );
  };

  // Program Template
  const template = getHero('program_template');
  const updateTemplate = (field, value) => updateHero('program_template', field, value);

  return (
    <div data-testid="page-headers-tab">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">Page Headers</h2>
          <p className="text-[10px] text-gray-400">Edit hero title & subtitle for every page. Use "Apply Homepage Style to All" for uniform look.</p>
        </div>
        <Button onClick={applyToAll} variant="outline" size="sm" className="text-[10px] gap-1">
          <Copy size={12} /> Apply Homepage Style to All
        </Button>
      </div>

      <p className="text-[10px] font-semibold text-gray-500 mb-2 mt-4">STATIC PAGES</p>
      {STATIC_PAGES.map(p => (
        <PageRow key={p.key} pageKey={p.key} label={p.label} defaultTitle={p.defaultTitle} defaultSubtitle={p.defaultSubtitle} toggleKey={p.toggleKey} />
      ))}

      {/* ===== FLAGSHIP PROGRAM TEMPLATE ===== */}
      <div className="mt-6 mb-2 flex items-center gap-2">
        <p className="text-[10px] font-semibold text-gray-500">FLAGSHIP PROGRAM PAGES — SHARED TEMPLATE</p>
        <span className="text-[8px] bg-purple-100 text-purple-600 px-2 py-0.5 rounded-full font-medium">Applies to all program pages</span>
      </div>
      <div className="bg-gradient-to-br from-purple-50/50 to-white rounded-xl border border-purple-100 p-4" data-testid="program-template-section">
        <p className="text-[9px] text-gray-500 mb-3">Style changes here apply to <strong>every</strong> program detail page under Flagship Programs. Title/subtitle text comes from each program's data — only the styling is shared.</p>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {TEMPLATE_STYLE_KEYS.map(({ key, label }) => (
            <div key={key} className="bg-white rounded-lg border border-gray-100 p-2.5">
              <Label className="text-[9px] text-gray-500 font-semibold block mb-1">{label}</Label>
              <StyleCell style={template[key] || {}} onStyleChange={v => updateTemplate(key, v)} />
            </div>
          ))}
        </div>

        {/* Hero background color */}
        <div className="mt-3 flex items-center gap-3">
          <div className="flex items-center gap-2">
            <Label className="text-[9px] text-gray-500">Hero Background</Label>
            <input type="color" value={template.hero_bg || '#1a1a1a'} onChange={e => updateTemplate('hero_bg', e.target.value)} className="w-6 h-6 rounded cursor-pointer border" />
          </div>
          <div className="flex items-center gap-2">
            <Label className="text-[9px] text-gray-500">Gold Line Color</Label>
            <input type="color" value={template.accent_color || '#D4AF37'} onChange={e => updateTemplate('accent_color', e.target.value)} className="w-6 h-6 rounded cursor-pointer border" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default PageHeadersTab;
