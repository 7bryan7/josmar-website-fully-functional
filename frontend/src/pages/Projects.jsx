import React, { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { api } from '../api/client';
import { MagnifyingGlassIcon } from '@heroicons/react/24/outline';

export default function Projects() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchParams, setSearchParams] = useSearchParams();
  const [search, setSearch] = useState(searchParams.get('search') || '');
  const [categories, setCategories] = useState([]);

  const currentCategory = searchParams.get('category') || 'All';

  useEffect(() => {
    async function loadInitialData() {
      try {
        // Load categories from database (project types)
        const cats = await api.get('/api/public/settings');
        // Build unique categories list
        const projRes = await api.get('/api/public/projects');
        const uniqueCats = ['All', ...new Set(projRes.map(p => p.category))];
        setCategories(uniqueCats);
      } catch (e) {
        console.error('Failed to load categories', e);
      }
    }
    loadInitialData();
  }, []);

  useEffect(() => {
    async function fetchProjects() {
      setLoading(true);
      try {
        const query = new URLSearchParams();
        if (currentCategory !== 'All') {
          query.set('category', currentCategory);
        }
        if (search) {
          query.set('search', search);
        }
        const data = await api.get(`/api/public/projects?${query.toString()}`);
        setProjects(data);
      } catch (e) {
        console.error('Failed to load projects', e);
      } finally {
        setLoading(false);
      }
    }
    fetchProjects();
  }, [currentCategory, searchParams]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    const params = new URLSearchParams(searchParams);
    if (search) {
      params.set('search', search);
    } else {
      params.delete('search');
    }
    setSearchParams(params);
  };

  const handleCategorySelect = (cat) => {
    const params = new URLSearchParams(searchParams);
    if (cat === 'All') {
      params.delete('category');
    } else {
      params.set('category', cat);
    }
    setSearchParams(params);
  };

  return (
    <div>
      <section className="bg-primary-900 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <h1 className="text-4xl font-bold tracking-tight mb-4">Engineering Case Studies</h1>
          <p className="text-slate-300 max-w-2xl mx-auto text-md">
            Browse our diverse portfolio of structural retrofits, environmental audits, and civil works.
          </p>
        </div>
      </section>

      <section className="py-12 bg-slate-50 min-h-[60vh]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Filters & Search Toolbar */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
            {/* Category tabs */}
            <div className="flex flex-wrap gap-2 order-2 md:order-1">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => handleCategorySelect(cat)}
                  className={`px-4 py-2 text-xs font-semibold uppercase tracking-wider rounded-lg transition-all ${
                    currentCategory === cat
                      ? 'bg-primary-900 text-white shadow-sm'
                      : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            {/* Search Input */}
            <form onSubmit={handleSearchSubmit} className="relative w-full md:w-80 order-1 md:order-2">
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search projects..."
                className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-xl bg-white text-sm focus:outline-none focus:ring-1 focus:ring-accent-500 focus:border-accent-500 transition-all shadow-sm"
              />
              <MagnifyingGlassIcon className="absolute left-3 top-2.5 h-5 w-5 text-slate-400" />
            </form>
          </div>

          {/* Grid list */}
          {loading ? (
            <div className="flex justify-center items-center py-20">
              <div className="w-8 h-8 border-4 border-accent-500 border-t-transparent rounded-full animate-spin"></div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {projects.length === 0 ? (
                <div className="col-span-1 md:col-span-3 text-center py-20 text-slate-500 font-medium bg-white rounded-2xl border border-slate-100 border-dashed">
                  No data available for now
                </div>
              ) : (
                projects.map((proj) => (
                  <div key={proj.id} className="card-premium group flex flex-col justify-between h-full bg-white">
                    <div>
                      <div className="h-48 overflow-hidden bg-slate-100 relative">
                        {proj.primary_image_path ? (
                          <img 
                            src={`/media/${proj.primary_image_path}`} 
                            alt={proj.name} 
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-slate-400 text-sm font-semibold bg-slate-800/50">
                            No project image available
                          </div>
                        )}
                        <span className="absolute top-4 left-4 bg-primary-900/90 text-white text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider">
                          {proj.category}
                        </span>
                      </div>
  
                      <div className="p-6">
                        <h3 className="font-bold text-lg text-primary-900 mb-2 truncate group-hover:text-accent-500 transition-colors">
                          {proj.name}
                        </h3>
                        <p className="text-slate-400 text-xs font-semibold mb-3">Client: {proj.client}</p>
                        <p className="text-slate-600 text-sm line-clamp-3 leading-relaxed">
                          {proj.description}
                        </p>
                      </div>
                    </div>
  
                    <div className="px-6 pb-6 pt-2">
                      <Link 
                        to={`/projects/${proj.seo_slug}`} 
                        className="text-accent-500 hover:text-accent-600 font-semibold text-sm inline-flex items-center gap-1"
                      >
                        View Project Detail &rarr;
                      </Link>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
