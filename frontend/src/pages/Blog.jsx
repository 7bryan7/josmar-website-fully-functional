import React, { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { api } from '../api/client';
import Pagination from '../components/Pagination';
import { MagnifyingGlassIcon } from '@heroicons/react/24/outline';

export default function Blog() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchParams, setSearchParams] = useSearchParams();
  const [search, setSearch] = useState(searchParams.get('search') || '');
  const [categories, setCategories] = useState([]);
  
  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const postsPerPage = 6;

  const currentCategory = searchParams.get('category') || 'All';

  useEffect(() => {
    async function loadCategories() {
      try {
        const data = await api.get('/api/public/settings');
        // Retrieve blogs to find unique categories
        const blogs = await api.get('/api/public/news');
        const uniqueCats = ['All', ...new Set(blogs.map(b => b.category_name).filter(Boolean))];
        setCategories(uniqueCats);
      } catch (e) {
        console.error('Failed to load categories', e);
      }
    }
    loadCategories();
  }, []);

  useEffect(() => {
    async function fetchPosts() {
      setLoading(true);
      try {
        const query = new URLSearchParams();
        if (currentCategory !== 'All') {
          query.set('category', currentCategory);
        }
        if (search) {
          query.set('search', search);
        }
        const data = await api.get(`/api/public/news?${query.toString()}`);
        setPosts(data);
        setCurrentPage(1); // Reset page on filter
      } catch (e) {
        console.error('Failed to load blog posts', e);
      } finally {
        setLoading(false);
      }
    }
    fetchPosts();
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

  // Get current page posts
  const indexOfLastPost = currentPage * postsPerPage;
  const indexOfFirstPost = indexOfLastPost - postsPerPage;
  const currentPosts = posts.slice(indexOfFirstPost, indexOfLastPost);
  const totalPages = Math.ceil(posts.length / postsPerPage);

  return (
    <div>
      <section className="bg-primary-900 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <h1 className="text-4xl font-bold tracking-tight mb-4">Engineering Blog & Insights</h1>
          <p className="text-slate-300 max-w-2xl mx-auto text-md">
            Stay updated with our technical publications, local building code revisions, and corporate announcements.
          </p>
        </div>
      </section>

      <section className="py-12 bg-slate-50 min-h-[60vh]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          {/* Toolbar */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
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

            <form onSubmit={handleSearchSubmit} className="relative w-full md:w-80 order-1 md:order-2">
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search articles..."
                className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-xl bg-white text-sm focus:outline-none focus:ring-1 focus:ring-accent-500 focus:border-accent-500 transition-all shadow-sm"
              />
              <MagnifyingGlassIcon className="absolute left-3 top-2.5 h-5 w-5 text-slate-400" />
            </form>
          </div>

          {/* Grid List */}
          {loading ? (
            <div className="flex justify-center items-center py-20">
              <div className="w-8 h-8 border-4 border-accent-500 border-t-transparent rounded-full animate-spin"></div>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {currentPosts.map((post) => {
                  let text = post.content.replace(/<[^>]*>/g, '');
                  if (text.length > 130) text = text.substring(0, 130) + '...';

                  return (
                    <div key={post.id} className="card-premium group flex flex-col justify-between h-full bg-white">
                      <div>
                        {post.featured_image_path && (
                          <div className="h-48 overflow-hidden bg-slate-100">
                            <img 
                              src={`/media/${post.featured_image_path}`} 
                              alt={post.title} 
                              className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-300"
                            />
                          </div>
                        )}
                        <div className="p-6">
                          <span className="text-accent-500 text-[10px] font-bold uppercase tracking-wider">{post.category_name}</span>
                          <h3 className="font-bold text-lg text-primary-900 mt-2 mb-3 leading-snug line-clamp-2 group-hover:text-accent-500 transition-colors">
                            {post.title}
                          </h3>
                          <p className="text-slate-600 text-sm leading-relaxed line-clamp-3">
                            {text}
                          </p>
                        </div>
                      </div>

                      <div className="px-6 pb-6 pt-2 flex justify-between items-center text-xs text-slate-400 font-semibold border-t border-slate-50 mt-4 pt-4">
                        <span>By {post.author_name || 'Admin'}</span>
                        <Link 
                          to={`/blog/${post.seo_url}`} 
                          className="text-accent-500 hover:text-accent-600 font-bold"
                        >
                          Read Article &rarr;
                        </Link>
                      </div>
                    </div>
                  );
                })}
              </div>

              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={setCurrentPage}
              />
            </>
          )}

          {!loading && posts.length === 0 && (
            <div className="text-center py-20 text-slate-500 font-semibold">
              No news or insights published yet.
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
