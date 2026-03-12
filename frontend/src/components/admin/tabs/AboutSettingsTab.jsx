import React from 'react';
import { Input } from '../../ui/input';
import { Textarea } from '../../ui/textarea';
import { Label } from '../../ui/label';
import ImageUploader from '../ImageUploader';
import { resolveImageUrl } from '../../../lib/imageUtils';

const AboutSettingsTab = ({ settings, onChange }) => {
  const s = settings;
  const set = (key, val) => onChange({ ...s, [key]: val });

  return (
    <div data-testid="about-settings-tab">
      <h2 className="text-lg font-semibold text-gray-900 mb-1">About Section</h2>
      <p className="text-[10px] text-gray-400 mb-5">The "Meet the Healer" section + full About page content.</p>

      {/* Logo */}
      <div className="bg-white rounded-lg p-5 shadow-sm border mb-4">
        <p className="text-xs font-semibold text-gray-800 mb-1">Site Logo</p>
        <p className="text-[10px] text-gray-400 mb-3">Appears above the about section and on the About page.</p>
        {s.logo_url && (
          <div className="mb-3 flex items-center gap-3 bg-gray-50 p-3 rounded">
            <img src={resolveImageUrl(s.logo_url)} alt="Logo" className="h-16 object-contain" />
            <button onClick={() => set('logo_url', '')} className="text-red-500 text-[10px] hover:underline">Remove</button>
          </div>
        )}
        <ImageUploader value={s.logo_url || ''} onChange={url => set('logo_url', url)} />
        <div className="mt-3">
          <Label className="text-[10px] text-gray-500">Logo Size: {s.logo_width || 96}px</Label>
          <input type="range" min="40" max="300" value={s.logo_width || 96} onChange={e => set('logo_width', parseInt(e.target.value))} className="w-full mt-1" />
          <div className="flex justify-between text-[9px] text-gray-400"><span>Small (40px)</span><span>Large (300px)</span></div>
        </div>
      </div>

      {/* About Photo */}
      <div className="bg-white rounded-lg p-5 shadow-sm border mb-4">
        <p className="text-xs font-semibold text-gray-800 mb-1">Your Photo</p>
        <p className="text-[10px] text-gray-400 mb-3">Your image on the homepage About section AND the full /about page.</p>
        {s.about_image && (
          <div className="mb-3">
            <img src={resolveImageUrl(s.about_image)} alt="About" className="w-32 h-40 object-cover rounded border" />
          </div>
        )}
        <ImageUploader value={s.about_image || ''} onChange={url => set('about_image', url)} />
      </div>

      {/* Text Content */}
      <div className="bg-white rounded-lg p-5 shadow-sm border mb-4">
        <p className="text-xs font-semibold text-gray-800 mb-1">Bio Content</p>
        <p className="text-[10px] text-gray-400 mb-3">Shown on homepage and /about page.</p>
        <div className="space-y-3">
          <div>
            <Label className="text-[10px] text-gray-500">Small Label Above Name</Label>
            <Input value={s.about_subtitle || ''} onChange={e => set('about_subtitle', e.target.value)} placeholder="Meet the Healer" className="text-xs" />
          </div>
          <div>
            <Label className="text-[10px] text-gray-500">Your Name</Label>
            <Input value={s.about_name || ''} onChange={e => set('about_name', e.target.value)} placeholder="Dimple Ranawat" className="text-sm" />
          </div>
          <div>
            <Label className="text-[10px] text-gray-500">Your Title (gold text)</Label>
            <Input value={s.about_title || ''} onChange={e => set('about_title', e.target.value)} placeholder="Founder, Divine Iris..." className="text-xs" />
          </div>
          <div>
            <Label className="text-[10px] text-gray-500">Bio - Paragraph 1</Label>
            <Textarea value={s.about_bio || ''} onChange={e => set('about_bio', e.target.value)} rows={3} placeholder="Write your main bio here..." className="text-xs" />
          </div>
          <div>
            <Label className="text-[10px] text-gray-500">Bio - Paragraph 2 (Personal Journey)</Label>
            <Textarea value={s.about_bio_2 || ''} onChange={e => set('about_bio_2', e.target.value)} rows={3} placeholder="Write your personal journey here..." className="text-xs" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="text-[10px] text-gray-500">Button Text</Label>
              <Input value={s.about_button_text || ''} onChange={e => set('about_button_text', e.target.value)} placeholder="Read Full Bio" className="text-xs" />
            </div>
            <div>
              <Label className="text-[10px] text-gray-500">Button Link</Label>
              <Input value={s.about_button_link || ''} onChange={e => set('about_button_link', e.target.value)} placeholder="/about" className="text-xs" />
            </div>
          </div>
        </div>
      </div>

      {/* About Page - Philosophy & Impact */}
      <div className="bg-white rounded-lg p-5 shadow-sm border mb-4">
        <p className="text-xs font-semibold text-gray-800 mb-1">About Page - Cards</p>
        <p className="text-[10px] text-gray-400 mb-3">The "Our Philosophy" and "Work & Impact" cards on /about page.</p>
        <div className="space-y-3">
          <div>
            <Label className="text-[10px] text-gray-500">Our Philosophy</Label>
            <Textarea data-testid="about-philosophy" value={s.about_philosophy || ''} onChange={e => set('about_philosophy', e.target.value)} rows={3} placeholder="Dimple believes in 'living limitless effortlessly'..." className="text-xs" />
          </div>
          <div>
            <Label className="text-[10px] text-gray-500">Work & Impact</Label>
            <Textarea data-testid="about-impact" value={s.about_impact || ''} onChange={e => set('about_impact', e.target.value)} rows={3} placeholder="As the creator of the Atomic Weight Release Program..." className="text-xs" />
          </div>
        </div>
      </div>

      {/* About Page - Mission & Vision */}
      <div className="bg-white rounded-lg p-5 shadow-sm border mb-4">
        <p className="text-xs font-semibold text-gray-800 mb-1">About Page - Mission & Vision</p>
        <p className="text-[10px] text-gray-400 mb-3">The dark section on /about page.</p>
        <div className="space-y-3">
          <div>
            <Label className="text-[10px] text-gray-500">Our Mission</Label>
            <Textarea data-testid="about-mission" value={s.about_mission || ''} onChange={e => set('about_mission', e.target.value)} rows={3} placeholder="To alleviate suffering at its root..." className="text-xs" />
          </div>
          <div>
            <Label className="text-[10px] text-gray-500">Our Vision</Label>
            <Textarea data-testid="about-vision" value={s.about_vision || ''} onChange={e => set('about_vision', e.target.value)} rows={3} placeholder="To build a world where healing is humane..." className="text-xs" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default AboutSettingsTab;
