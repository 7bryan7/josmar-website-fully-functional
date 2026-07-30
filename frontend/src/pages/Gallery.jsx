import React, { useEffect, useState } from 'react';
import { api } from '../api/client';
import Lightbox from '../components/Lightbox';
import { MagnifyingGlassIcon } from '@heroicons/react/24/outline';

export default function Gallery() {
  const [albums, setAlbums] = useState([]);
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [categories, setCategories] = useState([]);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedAlbum, setSelectedAlbum] = useState('All');
  
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);

  useEffect(() => {
    async function loadGalleryData() {
      try {
        const data = await api.get('/api/public/gallery');
        setAlbums(data.albums || []);
        setImages(data.images || []);
        
        // Extract unique categories
        const cats = ['All', ...new Set(data.images.map(img => img.category_name).filter(Boolean))];
        setCategories(cats);
      } catch (e) {
        console.error('Failed to load gallery data', e);
      } finally {
        setLoading(false);
      }
    }
    loadGalleryData();
  }, []);

  // Filtered Images list
  const filteredImages = images.filter(img => {
    const matchesCategory = selectedCategory === 'All' || img.category_name === selectedCategory;
    const matchesAlbum = selectedAlbum === 'All' || img.album_id === selectedAlbum;
    
    const term = search.toLowerCase();
    const matchesSearch = !search || 
      (img.name && img.name.toLowerCase().includes(term)) ||
      (img.alt_text && img.alt_text.toLowerCase().includes(term)) ||
      (img.caption && img.caption.toLowerCase().includes(term));
      
    return matchesCategory && matchesAlbum && matchesSearch;
  });

  const openLightbox = (idx) => {
    setLightboxIndex(idx);
    setLightboxOpen(true);
  };

  return (
    <div className="bg-slate-50 min-h-[80vh] py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Title */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-primary-900 tracking-tight mb-4">Project Gallery</h1>
          <p className="text-slate-500 max-w-2xl mx-auto text-md font-semibold">
            Visual archive of our construction works, site safety practices, and structural designs.
          </p>
        </div>

        {/* Toolbar: Album Filter, Category Filter, Search */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 mb-12 bg-white p-6 rounded-2xl border border-slate-100 shadow-soft">
          
          <div className="flex flex-wrap gap-4 items-center">
            {/* Album selector */}
            <div className="flex flex-col gap-1">
              <span className="text-[10px] uppercase font-bold text-slate-400">Filter Album</span>
              <select
                value={selectedAlbum}
                onChange={(e) => setSelectedAlbum(e.target.value)}
                className="px-3 py-1.5 border border-slate-200 rounded-lg text-xs bg-slate-50 text-slate-700 font-semibold focus:outline-none focus:ring-1 focus:ring-accent-500"
              >
                <option value="All">All Albums</option>
                {albums.map(a => (
                  <option key={a.id} value={a.id}>{a.name}</option>
                ))}
              </select>
            </div>

            {/* Category selector */}
            <div className="flex flex-col gap-1">
              <span className="text-[10px] uppercase font-bold text-slate-400">Filter Category</span>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="px-3 py-1.5 border border-slate-200 rounded-lg text-xs bg-slate-50 text-slate-700 font-semibold focus:outline-none focus:ring-1 focus:ring-accent-500"
              >
                {categories.map(cat => (
                  <option key={cat} value={cat}>{cat === 'All' ? 'All Categories' : cat}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Search bar */}
          <div className="relative w-full lg:w-72">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search images by caption..."
              className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-xl bg-slate-50 text-xs focus:outline-none focus:ring-1 focus:ring-accent-500 shadow-inner"
            />
            <MagnifyingGlassIcon className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
          </div>
        </div>

        {/* Gallery Image Grid */}
        {loading ? (
          <div className="flex justify-center items-center py-20">
            <div className="w-8 h-8 border-4 border-accent-500 border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {filteredImages.map((img, idx) => (
              <div 
                key={img.id}
                onClick={() => openLightbox(idx)}
                className="card-premium group h-60 overflow-hidden bg-slate-100 cursor-zoom-in relative"
              >
                <img
                  src={`/media/${img.path}`}
                  alt={img.alt_text || 'Gallery Image'}
                  loading="lazy" // Native browser lazy loading
                  className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-300"
                />
                
                {/* Overlay Text */}
                <div className="absolute inset-0 bg-slate-900/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-4 text-white">
                  {img.category_name && (
                    <span className="text-accent-300 text-[9px] uppercase tracking-wider font-bold mb-1">{img.category_name}</span>
                  )}
                  <h4 className="font-bold text-sm truncate">{img.name}</h4>
                  {img.caption && (
                    <p className="text-slate-300 text-xs line-clamp-2 mt-1 leading-normal">{img.caption}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {!loading && filteredImages.length === 0 && (
          <div className="text-center py-20 text-slate-400 font-semibold bg-white rounded-2xl border border-slate-100">
            No gallery images found matching the criteria.
          </div>
        )}
      </div>

      {/* Lightbox full screen zoom */}
      {filteredImages.length > 0 && (
        <Lightbox
          isOpen={lightboxOpen}
          images={filteredImages}
          initialIndex={lightboxIndex}
          onClose={() => setLightboxOpen(false)}
        />
      )}
    </div>
  );
}
