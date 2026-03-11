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
      <h2 className="text-xl font-semibold text-gray-900 mb-1">About Section</h2>
      <p className="text-xs text-gray-400 mb-6">The "Meet the Healer" section with your photo and bio.</p>

      {/* Logo */}
      <div className="bg-white rounded-lg p-5 shadow-sm border mb-5">
        <p className="text-sm font-semibold text-gray-800 mb-1">Site Logo</p>
        <p className="text-xs text-gray-400 mb-3">This logo appears above the about section. Upload your brand logo.</p>
        {s.logo_url && (
          <div className="mb-3 flex items-center gap-3 bg-gray-50 p-3 rounded">
            <img src={resolveImageUrl(s.logo_url)} alt="Logo" className="h-16 object-contain" />
            <button onClick={() => set('logo_url', '')} className="text-red-500 text-xs hover:underline">Remove</button>
          </div>
        )}
        <ImageUploader value={s.logo_url || ''} onChange={url => set('logo_url', url)} />
        <div className="mt-3">
          <Label className="text-xs text-gray-500">Logo Size: {s.logo_width || 96}px</Label>
          <input type="range" min="40" max="300" value={s.logo_width || 96} onChange={e => set('logo_width', parseInt(e.target.value))} className="w-full mt-1" />
          <div className="flex justify-between text-[10px] text-gray-400"><span>Small (40px)</span><span>Large (300px)</span></div>
        </div>
      </div>

      {/* About Photo */}
      <div className="bg-white rounded-lg p-5 shadow-sm border mb-5">
        <p className="text-sm font-semibold text-gray-800 mb-1">Your Photo</p>
        <p className="text-xs text-gray-400 mb-3">The image shown on the left side of the about section.</p>
        {s.about_image && (
          <div className="mb-3">
            <img src={resolveImageUrl(s.about_image)} alt="About" className="w-32 h-40 object-cover rounded border" />
          </div>
        )}
        <ImageUploader value={s.about_image || ''} onChange={url => set('about_image', url)} />
      </div>

      {/* Text Content */}
      <div className="bg-white rounded-lg p-5 shadow-sm border mb-5">
        <p className="text-sm font-semibold text-gray-800 mb-1">Text Content</p>
        <p className="text-xs text-gray-400 mb-4">Edit the text shown in the about section.</p>

        <div className="space-y-4">
          <div>
            <Label className="text-xs text-gray-500">Small Label Above Name (e.g., "Meet the Healer")</Label>
            <Input value={s.about_subtitle || ''} onChange={e => set('about_subtitle', e.target.value)} placeholder="Meet the Healer" />
          </div>
          <div>
            <Label className="text-xs text-gray-500">Your Name (big text)</Label>
            <Input value={s.about_name || ''} onChange={e => set('about_name', e.target.value)} placeholder="Dimple Ranawat" className="text-lg" />
          </div>
          <div>
            <Label className="text-xs text-gray-500">Your Title (gold text below name)</Label>
            <Input value={s.about_title || ''} onChange={e => set('about_title', e.target.value)} placeholder="Founder, Divine Iris..." />
          </div>
          <div>
            <Label className="text-xs text-gray-500">Bio - Paragraph 1</Label>
            <Textarea value={s.about_bio || ''} onChange={e => set('about_bio', e.target.value)} rows={4} placeholder="Write your main bio here..." />
          </div>
          <div>
            <Label className="text-xs text-gray-500">Bio - Paragraph 2 (Personal Journey)</Label>
            <Textarea value={s.about_bio_2 || ''} onChange={e => set('about_bio_2', e.target.value)} rows={4} placeholder="Write your personal journey here..." />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="text-xs text-gray-500">Button Text</Label>
              <Input value={s.about_button_text || ''} onChange={e => set('about_button_text', e.target.value)} placeholder="Read Full Bio" />
            </div>
            <div>
              <Label className="text-xs text-gray-500">Button Link</Label>
              <Input value={s.about_button_link || ''} onChange={e => set('about_button_link', e.target.value)} placeholder="/#about" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AboutSettingsTab;
