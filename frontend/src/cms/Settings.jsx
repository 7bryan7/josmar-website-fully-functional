import React, { useEffect, useState } from 'react';
import { api } from '../api/client';
import { useApp } from '../App';
import Modal from '../components/Modal';
import { PhotoIcon, Cog6ToothIcon, CheckIcon } from '@heroicons/react/24/outline';

export default function Settings() {
  const { fetchSettings } = useApp();
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  
  // Media Selector state
  const [mediaList, setMediaList] = useState([]);
  const [mediaSelectorOpen, setMediaSelectorOpen] = useState(false);
  const [mediaTargetField, setMediaTargetField] = useState(''); // e.g. 'company_logo'

  useEffect(() => {
    async function loadSettings() {
      try {
        const data = await api.get('/api/public/settings');
        setSettings(data);
        
        // Pre-fetch media library list for selector
        const mediaData = await api.get('/api/admin/media');
        setMediaList(mediaData);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    loadSettings();
  }, []);

  const handleChange = (category, key, value) => {
    setSettings((prev) => ({
      ...prev,
      [category]: {
        ...prev[category],
        [key]: value
      }
    }));
  };

  const openMediaSelector = (targetField) => {
    setMediaTargetField(targetField);
    setMediaSelectorOpen(true);
  };

  const selectMedia = (path) => {
    if (mediaTargetField.startsWith('hero_image_')) {
      handleChange('general', mediaTargetField, path);
    } else if (mediaTargetField === 'company_logo') {
      handleChange('general', 'company_logo', path);
    }
    setMediaSelectorOpen(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setSuccess(false);

    try {
      // Flatten settings object back into array of { key, value } for API bulk edit
      const flattened = [];
      Object.entries(settings).forEach(([category, group]) => {
        Object.entries(group).forEach(([key, value]) => {
          flattened.push({ key, value });
        });
      });

      await api.put('/api/admin/settings', flattened);
      setSuccess(true);
      await fetchSettings(); // Refresh settings in global state context
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      alert(err.message || 'Failed to save settings.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-20">
        <div className="w-8 h-8 border-4 border-accent-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  const general = settings?.general || {};
  const theme = settings?.theme || {};
  const contact = settings?.contact || {};
  const social = settings?.social || {};
  const seo = settings?.seo || {};
  const footer = settings?.footer || {};

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Header */}
      <div className="flex justify-between items-center border-b border-slate-200 pb-4">
        <div>
          <h1 className="text-2xl font-bold text-primary-900 font-sans">Website Settings</h1>
          <p className="text-slate-500 text-xs mt-1">Configure company profiles, contact numbers, visual themes and SEO metadata defaults.</p>
        </div>

        <button 
          onClick={handleSubmit}
          disabled={submitting}
          className="button-primary text-xs py-2 flex items-center gap-1.5"
        >
          {submitting ? 'Saving...' : 'Save Settings'}
        </button>
      </div>

      {success && (
        <div className="bg-green-50 border border-green-100 rounded-xl p-4 text-xs font-semibold text-green-800 flex items-center gap-2 shadow-soft">
          <CheckIcon className="h-5 w-5 text-green-600" />
          <span>Settings saved successfully! Navigation configurations updated.</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* 1. General Company Profile */}
        <div className="card-premium bg-white p-6 space-y-4">
          <h2 className="font-bold text-md text-primary-900 border-b border-slate-100 pb-3">Company Profile</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1">Company Name</label>
              <input
                type="text"
                value={general.company_name || ''}
                onChange={(e) => handleChange('general', 'company_name', e.target.value)}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm bg-slate-50 focus:outline-none focus:ring-1 focus:ring-accent-500"
              />
            </div>

            <div>
              <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1">Analytics ID (Google Analytics)</label>
              <input
                type="text"
                placeholder="e.g. G-XXXXXX"
                value={general.analytics_id || ''}
                onChange={(e) => handleChange('general', 'analytics_id', e.target.value)}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm bg-slate-50 focus:outline-none focus:ring-1 focus:ring-accent-500"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1">Company Logo</label>
              <div className="flex gap-4 items-center">
                <div className="h-12 w-28 bg-slate-100 rounded-xl border border-slate-200 overflow-hidden flex items-center justify-center">
                  {general.company_logo ? (
                    <img src={`/media/${general.company_logo}`} alt="Logo preview" className="max-h-full max-w-full object-contain" />
                  ) : (
                    <span className="text-[10px] text-slate-400 font-bold">No Logo Selected</span>
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => openMediaSelector('company_logo')}
                  className="button-secondary text-xs py-2 flex items-center gap-1.5"
                >
                  <PhotoIcon className="h-5 w-5" />
                  Select Logo
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* 2. Theme Colors */}
        <div className="card-premium bg-white p-6 space-y-4">
          <h2 className="font-bold text-md text-primary-900 border-b border-slate-100 pb-3">Branding & Color Theme</h2>
          <div className="grid grid-cols-3 gap-6">
            <div>
              <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1">Primary Color (Hex)</label>
              <div className="flex gap-2 items-center">
                <input
                  type="color"
                  value={theme.primary_color || '#0f172a'}
                  onChange={(e) => handleChange('theme', 'primary_color', e.target.value)}
                  className="w-8 h-8 rounded border border-slate-200 overflow-hidden cursor-pointer"
                />
                <input
                  type="text"
                  value={theme.primary_color || ''}
                  onChange={(e) => handleChange('theme', 'primary_color', e.target.value)}
                  className="w-full px-2 py-1.5 border border-slate-200 rounded-lg text-xs bg-slate-50 text-slate-700 font-semibold"
                />
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1">Secondary Color (Hex)</label>
              <div className="flex gap-2 items-center">
                <input
                  type="color"
                  value={theme.secondary_color || '#ffffff'}
                  onChange={(e) => handleChange('theme', 'secondary_color', e.target.value)}
                  className="w-8 h-8 rounded border border-slate-200 overflow-hidden cursor-pointer"
                />
                <input
                  type="text"
                  value={theme.secondary_color || ''}
                  onChange={(e) => handleChange('theme', 'secondary_color', e.target.value)}
                  className="w-full px-2 py-1.5 border border-slate-200 rounded-lg text-xs bg-slate-50 text-slate-700 font-semibold"
                />
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1">Accent Color (Hex)</label>
              <div className="flex gap-2 items-center">
                <input
                  type="color"
                  value={theme.accent_color || '#0ea5e9'}
                  onChange={(e) => handleChange('theme', 'accent_color', e.target.value)}
                  className="w-8 h-8 rounded border border-slate-200 overflow-hidden cursor-pointer"
                />
                <input
                  type="text"
                  value={theme.accent_color || ''}
                  onChange={(e) => handleChange('theme', 'accent_color', e.target.value)}
                  className="w-full px-2 py-1.5 border border-slate-200 rounded-lg text-xs bg-slate-50 text-slate-700 font-semibold"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Homepage Hero Photo Stack */}
        <div className="card-premium bg-white p-6 space-y-4">
          <h2 className="font-bold text-md text-primary-900 border-b border-slate-100 pb-3">Homepage Hero Photo Stack</h2>
          <p className="text-slate-500 text-xs leading-relaxed">Customize the 3 staggered floating images displayed on the homepage Hero section. Select optimized high-resolution photos from your Media Library.</p>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-2">
            {/* Hero Image 1 */}
            <div className="space-y-2">
              <label className="block text-[10px] font-bold uppercase text-slate-400">Hero Image 1 (Background Left)</label>
              <div className="h-40 bg-slate-50 rounded-2xl border border-slate-200 overflow-hidden flex items-center justify-center relative group">
                {general.hero_image_1 ? (
                  <img src={`/media/${general.hero_image_1}`} alt="Hero 1 Preview" className="w-full h-full object-cover" />
                ) : (
                  <div className="text-center p-4">
                    <PhotoIcon className="h-8 w-8 text-slate-300 mx-auto mb-1" />
                    <span className="text-[10px] text-slate-400 font-bold">Using Default Fallback</span>
                  </div>
                )}
                {general.hero_image_1 && (
                  <button 
                    type="button"
                    onClick={() => handleChange('general', 'hero_image_1', '')}
                    className="absolute top-2 right-2 bg-red-500 hover:bg-red-600 text-white rounded-lg p-1 text-[10px] font-bold shadow opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    Reset
                  </button>
                )}
              </div>
              <button
                type="button"
                onClick={() => openMediaSelector('hero_image_1')}
                className="button-secondary text-xs w-full py-2 flex items-center justify-center gap-1.5"
              >
                <PhotoIcon className="h-4 w-4" />
                Select Photo 1
              </button>
            </div>

            {/* Hero Image 2 */}
            <div className="space-y-2">
              <label className="block text-[10px] font-bold uppercase text-slate-400">Hero Image 2 (Top Right)</label>
              <div className="h-40 bg-slate-50 rounded-2xl border border-slate-200 overflow-hidden flex items-center justify-center relative group">
                {general.hero_image_2 ? (
                  <img src={`/media/${general.hero_image_2}`} alt="Hero 2 Preview" className="w-full h-full object-cover" />
                ) : (
                  <div className="text-center p-4">
                    <PhotoIcon className="h-8 w-8 text-slate-300 mx-auto mb-1" />
                    <span className="text-[10px] text-slate-400 font-bold">Using Default Fallback</span>
                  </div>
                )}
                {general.hero_image_2 && (
                  <button 
                    type="button"
                    onClick={() => handleChange('general', 'hero_image_2', '')}
                    className="absolute top-2 right-2 bg-red-500 hover:bg-red-600 text-white rounded-lg p-1 text-[10px] font-bold shadow opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    Reset
                  </button>
                )}
              </div>
              <button
                type="button"
                onClick={() => openMediaSelector('hero_image_2')}
                className="button-secondary text-xs w-full py-2 flex items-center justify-center gap-1.5"
              >
                <PhotoIcon className="h-4 w-4" />
                Select Photo 2
              </button>
            </div>

            {/* Hero Image 3 */}
            <div className="space-y-2">
              <label className="block text-[10px] font-bold uppercase text-slate-400">Hero Image 3 (Front Center)</label>
              <div className="h-40 bg-slate-50 rounded-2xl border border-slate-200 overflow-hidden flex items-center justify-center relative group">
                {general.hero_image_3 ? (
                  <img src={`/media/${general.hero_image_3}`} alt="Hero 3 Preview" className="w-full h-full object-cover" />
                ) : (
                  <div className="text-center p-4">
                    <PhotoIcon className="h-8 w-8 text-slate-300 mx-auto mb-1" />
                    <span className="text-[10px] text-slate-400 font-bold">Using Default Fallback</span>
                  </div>
                )}
                {general.hero_image_3 && (
                  <button 
                    type="button"
                    onClick={() => handleChange('general', 'hero_image_3', '')}
                    className="absolute top-2 right-2 bg-red-500 hover:bg-red-600 text-white rounded-lg p-1 text-[10px] font-bold shadow opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    Reset
                  </button>
                )}
              </div>
              <button
                type="button"
                onClick={() => openMediaSelector('hero_image_3')}
                className="button-secondary text-xs w-full py-2 flex items-center justify-center gap-1.5"
              >
                <PhotoIcon className="h-4 w-4" />
                Select Photo 3
              </button>
            </div>
          </div>
        </div>

        {/* 3. Contact Settings */}
        <div className="card-premium bg-white p-6 space-y-4">
          <h2 className="font-bold text-md text-primary-900 border-b border-slate-100 pb-3">Contact Details & Maps</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1">Office Address</label>
              <input
                type="text"
                value={contact.office_address || ''}
                onChange={(e) => handleChange('contact', 'office_address', e.target.value)}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm bg-slate-50 focus:outline-none focus:ring-1 focus:ring-accent-500"
              />
            </div>

            <div>
              <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1">Google Maps Embed link (Iframe SRC)</label>
              <input
                type="text"
                placeholder="https://www.google.com/maps/embed?..."
                value={contact.google_maps_embed || ''}
                onChange={(e) => handleChange('contact', 'google_maps_embed', e.target.value)}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm bg-slate-50 focus:outline-none focus:ring-1 focus:ring-accent-500"
              />
            </div>
            
            <div className="md:col-span-2">
              <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1">Phone Numbers (JSON Array of strings)</label>
              <input
                type="text"
                value={typeof contact.phone_numbers === 'string' ? contact.phone_numbers : JSON.stringify(contact.phone_numbers || [])}
                onChange={(e) => handleChange('contact', 'phone_numbers', e.target.value)}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs bg-slate-50 text-slate-700 font-bold focus:outline-none"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1">Emails (JSON Array of strings)</label>
              <input
                type="text"
                value={typeof contact.emails === 'string' ? contact.emails : JSON.stringify(contact.emails || [])}
                onChange={(e) => handleChange('contact', 'emails', e.target.value)}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs bg-slate-50 text-slate-700 font-bold focus:outline-none"
              />
            </div>
          </div>
        </div>

        {/* 4. Social Links */}
        <div className="card-premium bg-white p-6 space-y-4">
          <h2 className="font-bold text-md text-primary-900 border-b border-slate-100 pb-3">Social Media Links</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1">LinkedIn Profile</label>
              <input
                type="text"
                value={social.linkedin || ''}
                onChange={(e) => handleChange('social', 'linkedin', e.target.value)}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm bg-slate-50 focus:outline-none focus:ring-1 focus:ring-accent-500"
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1">Twitter Profile</label>
              <input
                type="text"
                value={social.twitter || ''}
                onChange={(e) => handleChange('social', 'twitter', e.target.value)}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm bg-slate-50 focus:outline-none focus:ring-1 focus:ring-accent-500"
              />
            </div>
          </div>
        </div>

        {/* 5. Default SEO */}
        <div className="card-premium bg-white p-6 space-y-4">
          <h2 className="font-bold text-md text-primary-900 border-b border-slate-100 pb-3">SEO defaults</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1">Default Meta Title</label>
              <input
                type="text"
                value={seo.seo_default_title || ''}
                onChange={(e) => handleChange('seo', 'seo_default_title', e.target.value)}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm bg-slate-50 focus:outline-none focus:ring-1 focus:ring-accent-500"
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1">Default Meta Description</label>
              <textarea
                rows={3}
                value={seo.seo_default_description || ''}
                onChange={(e) => handleChange('seo', 'seo_default_description', e.target.value)}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm bg-slate-50 focus:outline-none focus:ring-1 focus:ring-accent-500"
              />
            </div>
          </div>
        </div>

        {/* 6. Footer Information */}
        <div className="card-premium bg-white p-6 space-y-4">
          <h2 className="font-bold text-md text-primary-900 border-b border-slate-100 pb-3">Footer Configuration</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1">Footer Tagline</label>
              <input
                type="text"
                value={footer.footer_tagline || ''}
                onChange={(e) => handleChange('footer', 'footer_tagline', e.target.value)}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm bg-slate-50 focus:outline-none focus:ring-1 focus:ring-accent-500"
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1">Copyright text</label>
              <input
                type="text"
                value={footer.footer_copyright || ''}
                onChange={(e) => handleChange('footer', 'footer_copyright', e.target.value)}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm bg-slate-50 focus:outline-none focus:ring-1 focus:ring-accent-500"
              />
            </div>
          </div>
        </div>
      </form>

      {/* Media Selector Modal */}
      <Modal
        isOpen={mediaSelectorOpen}
        onClose={() => setMediaSelectorOpen(false)}
        title={mediaTargetField.startsWith('hero_image_') ? "Select Hero Photo" : "Select Logo Image"}
        size="lg"
      >
        <div className="grid grid-cols-3 gap-4 max-h-[60vh] overflow-y-auto p-1">
          {mediaList.filter(m => m.mime_type.startsWith('image/')).map((media) => (
            <div 
              key={media.id} 
              onClick={() => selectMedia(media.path)}
              className="card-premium h-24 overflow-hidden bg-slate-100 cursor-pointer border border-slate-200 hover:border-accent-500 transition-colors flex items-center justify-center"
            >
              <img src={`/media/${media.thumbnail_path || media.path}`} alt={media.name} className="max-h-full max-w-full object-contain" />
            </div>
          ))}
          {mediaList.filter(m => m.mime_type.startsWith('image/')).length === 0 && (
            <div className="col-span-full text-center py-10 text-slate-400 text-xs font-semibold">
              No images available in media library. Please upload logos first!
            </div>
          )}
        </div>
      </Modal>
    </div>
  );
}
