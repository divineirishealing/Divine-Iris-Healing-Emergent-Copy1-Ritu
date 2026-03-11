import React from 'react';
import { Input } from '../../ui/input';
import { Textarea } from '../../ui/textarea';
import { Label } from '../../ui/label';

const NewsletterSettingsTab = ({ settings, onChange }) => {
  const s = settings;
  const set = (key, val) => onChange({ ...s, [key]: val });

  return (
    <div data-testid="newsletter-settings-tab">
      <h2 className="text-xl font-semibold text-gray-900 mb-1">Newsletter Section</h2>
      <p className="text-xs text-gray-400 mb-6">The email signup section where visitors can subscribe to your updates.</p>

      <div className="bg-white rounded-lg p-5 shadow-sm border mb-5">
        <p className="text-sm font-semibold text-gray-800 mb-4">Edit Newsletter Content</p>

        <div className="space-y-4">
          <div>
            <Label className="text-xs text-gray-500">Heading (big text at the top)</Label>
            <Input value={s.newsletter_heading || ''} onChange={e => set('newsletter_heading', e.target.value)} placeholder="Join Our Community" className="text-lg" />
          </div>
          <div>
            <Label className="text-xs text-gray-500">Description (text below the heading)</Label>
            <Textarea value={s.newsletter_description || ''} onChange={e => set('newsletter_description', e.target.value)} rows={3} placeholder="Sign up to receive updates..." />
          </div>
          <div>
            <Label className="text-xs text-gray-500">Button Text (what the subscribe button says)</Label>
            <Input value={s.newsletter_button_text || ''} onChange={e => set('newsletter_button_text', e.target.value)} placeholder="Subscribe" />
          </div>
          <div>
            <Label className="text-xs text-gray-500">Small Print (text below the form)</Label>
            <Input value={s.newsletter_footer_text || ''} onChange={e => set('newsletter_footer_text', e.target.value)} placeholder="By subscribing..." />
          </div>
        </div>
      </div>

      {/* Preview */}
      <div className="bg-white rounded-lg p-5 shadow-sm border">
        <p className="text-xs text-gray-400 mb-3 text-center font-medium">LIVE PREVIEW</p>
        <div className="bg-white p-6 rounded-lg text-center border border-dashed">
          <h3 className="text-2xl text-[#8B6914] mb-3">{s.newsletter_heading || 'Join Our Community'}</h3>
          <p className="text-gray-600 text-sm mb-4">{s.newsletter_description || 'Sign up to receive updates...'}</p>
          <div className="flex justify-center gap-3">
            <input type="text" placeholder="ENTER YOUR EMAIL ADDRESS" disabled className="max-w-xs w-full px-4 py-2 rounded-full border border-gray-300 text-xs" />
            <span className="bg-[#D4AF37] text-white px-6 py-2 rounded-full text-xs">{s.newsletter_button_text || 'Subscribe'}</span>
          </div>
          <p className="text-gray-400 text-[10px] mt-3">{s.newsletter_footer_text || 'By subscribing...'}</p>
        </div>
      </div>
    </div>
  );
};

export default NewsletterSettingsTab;
