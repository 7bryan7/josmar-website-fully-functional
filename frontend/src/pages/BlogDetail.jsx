import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { api } from '../api/client';
import { ArrowLeftIcon, CalendarIcon, UserIcon, TagIcon } from '@heroicons/react/24/outline';

export default function BlogDetail() {
  const { slug } = useParams();
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadPostDetails() {
      try {
        const data = await api.get(`/api/public/news/${slug}`);
        setPost(data);
      } catch (e) {
        console.error('Failed to load blog post details', e);
      } finally {
        setLoading(false);
      }
    }
    loadPostDetails();
  }, [slug]);

  if (loading) {
    return (
      <div className="flex justify-center items-center py-32">
        <div className="w-10 h-10 border-4 border-accent-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center">
        <h2 className="text-2xl font-bold text-slate-800 mb-4">Article Not Found</h2>
        <p className="text-slate-600 mb-8">The blog post you are looking for does not exist or has been deleted.</p>
        <Link to="/blog" className="button-primary">
          Back to Blog
        </Link>
      </div>
    );
  }

  return (
    <div className="bg-slate-50 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6">
        
        {/* Back Link */}
        <Link to="/blog" className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-primary-900 font-semibold mb-8 transition-colors">
          <ArrowLeftIcon className="h-4 w-4" />
          Back to Blog List
        </Link>

        {/* Article Meta Header */}
        <div className="mb-8">
          <span className="text-accent-500 text-xs font-bold uppercase tracking-wider block mb-2">{post.category_name}</span>
          <h1 className="text-3xl md:text-5xl font-bold text-primary-900 tracking-tight mb-6">{post.title}</h1>
          
          <div className="flex flex-wrap items-center gap-6 text-sm text-slate-400 font-semibold border-b border-slate-200 pb-6">
            <div className="flex items-center gap-1.5">
              <CalendarIcon className="h-4 w-4" />
              <span>Published: {new Date(post.created_at).toLocaleDateString()}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <UserIcon className="h-4 w-4" />
              <span>By {post.author_name || 'Admin'}</span>
            </div>
          </div>
        </div>

        {/* Featured Image */}
        {post.featured_image_path && (
          <div className="h-96 w-full rounded-2xl overflow-hidden shadow-soft mb-8 bg-slate-100">
            <img src={`/media/${post.featured_image_path}`} alt={post.title} className="w-full h-full object-cover" />
          </div>
        )}

        {/* Rich Text Body */}
        <article className="card-premium bg-white p-8 md:p-12 mb-8">
          <div 
            className="prose prose-slate max-w-none text-slate-600 text-sm leading-relaxed whitespace-pre-line space-y-4"
            dangerouslySetInnerHTML={{ __html: post.content }}
          />
        </article>

        {/* Tags list */}
        {post.tags && post.tags.length > 0 && (
          <div className="flex items-center flex-wrap gap-2 text-xs text-slate-500 font-semibold mt-4">
            <TagIcon className="h-4 w-4 text-slate-400" />
            <span>Tags:</span>
            {post.tags.map((tag) => (
              <span key={tag.id} className="bg-slate-200/50 text-slate-600 px-2.5 py-1 rounded-full uppercase">
                {tag.name}
              </span>
            ))}
          </div>
        )}

      </div>
    </div>
  );
}
