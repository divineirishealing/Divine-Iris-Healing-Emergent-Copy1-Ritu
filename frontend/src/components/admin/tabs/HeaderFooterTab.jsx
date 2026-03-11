import React from 'react';
import { Input } from '../../ui/input';
import { Textarea } from '../../ui/textarea';
import { Label } from '../../ui/label';
import { Facebook, Instagram, Youtube, Linkedin } from 'lucide-react';

const HeaderFooterTab = ({ settings, onChange }) => {
  const s = settings;
  const set = (key, val) => onChange({ ...s, [key]: val });

  return (
    <div data-testid="header-footer-tab">
      <h2 className="text-xl font-semibold text-gray-900 mb-1">Header & Footer</h2>
      <p className="text-xs text-gray-400 mb-6">Edit social media links, contact info, and footer text.</p>

      {/* Social Links */}
      <div className="bg-white rounded-lg p-5 shadow-sm border mb-5">
        <p className="text-sm font-semibold text-gray-800 mb-1">Social Media Links</p>
        <p className="text-xs text-gray-400 mb-4">These appear in the header and footer. Paste the full URL to your profile.</p>

        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <Facebook size={18} className="text-blue-600 flex-shrink-0" />
            <div className="flex-1">
              <Label className="text-xs text-gray-500">Facebook Page URL</Label>
              <Input value={s.social_facebook || ''} onChange={e => set('social_facebook', e.target.value)} placeholder="https://facebook.com/yourpage" />
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Instagram size={18} className="text-pink-600 flex-shrink-0" />
            <div className="flex-1">
              <Label className="text-xs text-gray-500">Instagram Profile URL</Label>
              <Input value={s.social_instagram || ''} onChange={e => set('social_instagram', e.target.value)} placeholder="https://instagram.com/yourprofile" />
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Youtube size={18} className="text-red-600 flex-shrink-0" />
            <div className="flex-1">
              <Label className="text-xs text-gray-500">YouTube Channel URL</Label>
              <Input value={s.social_youtube || ''} onChange={e => set('social_youtube', e.target.value)} placeholder="https://youtube.com/yourchannel" />
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Linkedin size={18} className="text-blue-700 flex-shrink-0" />
            <div className="flex-1">
              <Label className="text-xs text-gray-500">LinkedIn Profile URL</Label>
              <Input value={s.social_linkedin || ''} onChange={e => set('social_linkedin', e.target.value)} placeholder="https://linkedin.com/in/yourprofile" />
            </div>
          </div>
        </div>
      </div>

      {/* Footer Content */}
      <div className="bg-white rounded-lg p-5 shadow-sm border mb-5">
        <p className="text-sm font-semibold text-gray-800 mb-1">Footer Content</p>
        <p className="text-xs text-gray-400 mb-4">The text and info shown at the bottom of every page.</p>

        <div className="space-y-4">
          <div>
            <Label className="text-xs text-gray-500">Brand Name (appears at top of footer)</Label>
            <Input value={s.footer_brand_name || ''} onChange={e => set('footer_brand_name', e.target.value)} placeholder="Divine Iris Healing" />
          </div>
          <div>
            <Label className="text-xs text-gray-500">Tagline (short description below brand name)</Label>
            <Textarea value={s.footer_tagline || ''} onChange={e => set('footer_tagline', e.target.value)} rows={2} placeholder="Delve into the deeper realm..." />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="text-xs text-gray-500">Contact Email</Label>
              <Input value={s.footer_email || ''} onChange={e => set('footer_email', e.target.value)} placeholder="support@yourdomain.com" />
            </div>
            <div>
              <Label className="text-xs text-gray-500">Contact Phone</Label>
              <Input value={s.footer_phone || ''} onChange={e => set('footer_phone', e.target.value)} placeholder="+971553325778" />
            </div>
          </div>
          <div>
            <Label className="text-xs text-gray-500">Copyright Text (at the very bottom)</Label>
            <Input value={s.footer_copyright || ''} onChange={e => set('footer_copyright', e.target.value)} placeholder="2026 Divine Iris Healing. All Rights Reserved." />
          </div>
        </div>
      </div>

      {/* Preview */}
      <div className="bg-white rounded-lg p-5 shadow-sm border">
        <p className="text-xs text-gray-400 mb-3 text-center font-medium">FOOTER PREVIEW</p>
        <div className="bg-gray-900 p-6 rounded-lg text-white text-xs">
          <div className="grid grid-cols-2 gap-6 mb-4">
            <div>
              <p className="text-base mb-2">{s.footer_brand_name || 'Divine Iris Healing'}</p>
              <p className="text-gray-400 text-[10px]">{s.footer_tagline || 'Delve into the deeper realm...'}</p>
            </div>
            <div>
              <p className="text-gray-400">{s.footer_email || 'email@domain.com'}</p>
              <p className="text-gray-400">{s.footer_phone || '+971...'}</p>
            </div>
          </div>
          <div className="border-t border-gray-700 pt-3 text-center text-gray-500 text-[10px]">
            &copy; {s.footer_copyright || '2026 Divine Iris Healing'}
          </div>
        </div>
      </div>
    </div>
  );
};

export default HeaderFooterTab;
