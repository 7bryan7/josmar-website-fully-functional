import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { api } from '../api/client';
import Lightbox from '../components/Lightbox';
import { ArrowLeftIcon, ArrowDownTrayIcon, CalendarIcon, MapPinIcon, UserIcon } from '@heroicons/react/24/outline';

export default function ProjectDetail() {
  const { slug } = useParams();
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);

  useEffect(() => {
    async function loadProjectDetails() {
      try {
        const data = await api.get(`/api/public/projects/${slug}`);
        setProject(data);
      } catch (e) {
        console.error('Failed to load project details', e);
      } finally {
        setLoading(false);
      }
    }
    loadProjectDetails();
  }, [slug]);

  if (loading) {
    return (
      <div className="flex justify-center items-center py-32">
        <div className="w-10 h-10 border-4 border-accent-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center">
        <h2 className="text-2xl font-bold text-slate-800 mb-4">Case Study Not Found</h2>
        <p className="text-slate-600 mb-8">The project you are looking for does not exist or has been deleted.</p>
        <Link to="/projects" className="button-primary">
          Back to Projects
        </Link>
      </div>
    );
  }

  const openLightbox = (idx) => {
    setLightboxIndex(idx);
    setLightboxOpen(true);
  };

  return (
    <div className="bg-slate-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Back Link */}
        <Link to="/projects" className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-primary-900 font-semibold mb-8 transition-colors">
          <ArrowLeftIcon className="h-4 w-4" />
          Back to Projects Portfolio
        </Link>

        {/* Project Title Block */}
        <div className="mb-8">
          <span className="text-accent-500 text-xs font-bold uppercase tracking-wider block mb-2">{project.category}</span>
          <h1 className="text-3xl md:text-5xl font-bold text-primary-900 tracking-tight">{project.name}</h1>
        </div>

        {/* Project Meta Information Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          
          {/* Main Case Study Text & Images */}
          <div className="lg:col-span-2 space-y-8">
            {/* Gallery Grid */}
            {project.images && project.images.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {project.images.map((img, idx) => (
                  <div 
                    key={img.id} 
                    onClick={() => openLightbox(idx)}
                    className="card-premium group h-64 overflow-hidden bg-slate-100 cursor-zoom-in relative"
                  >
                    <img 
                      src={`/media/${img.path}`} 
                      alt={img.alt_text || project.name} 
                      className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-300"
                    />
                    {img.caption && (
                      <div className="absolute inset-x-0 bottom-0 bg-black/50 p-3 text-white text-xs font-semibold backdrop-blur-xs">
                        {img.caption}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}

            {/* Description Text */}
            <div className="card-premium bg-white p-8">
              <h2 className="text-xl font-bold text-primary-900 mb-4">Project Overview & Scope</h2>
              <p className="text-slate-600 text-sm leading-relaxed whitespace-pre-line">{project.description}</p>
            </div>
          </div>

          {/* Specifications Sidebar */}
          <div className="space-y-8">
            {/* Stats list */}
            <div className="card-premium bg-white p-6 space-y-4">
              <h3 className="font-bold text-md text-primary-900 uppercase tracking-wider border-b border-slate-100 pb-3">Project Specifications</h3>
              
              <div className="flex items-center gap-3 text-sm">
                <UserIcon className="h-5 w-5 text-slate-400 flex-shrink-0" />
                <div>
                  <div className="text-slate-400 text-xs font-medium">Client</div>
                  <div className="text-slate-800 font-semibold">{project.client}</div>
                </div>
              </div>

              <div className="flex items-center gap-3 text-sm">
                <MapPinIcon className="h-5 w-5 text-slate-400 flex-shrink-0" />
                <div>
                  <div className="text-slate-400 text-xs font-medium">Location</div>
                  <div className="text-slate-800 font-semibold">{project.location}</div>
                </div>
              </div>

              <div className="flex items-center gap-3 text-sm">
                <CalendarIcon className="h-5 w-5 text-slate-400 flex-shrink-0" />
                <div>
                  <div className="text-slate-400 text-xs font-medium">Timeline</div>
                  <div className="text-slate-800 font-semibold">
                    {project.start_date} {project.end_date ? `to ${project.end_date}` : '(Ongoing)'}
                  </div>
                </div>
              </div>
            </div>

            {/* Documents Download Card */}
            {project.documents && project.documents.length > 0 && (
              <div className="card-premium bg-white p-6">
                <h3 className="font-bold text-md text-primary-900 uppercase tracking-wider border-b border-slate-100 pb-3 mb-4">Project Documents</h3>
                <div className="space-y-3">
                  {project.documents.map((doc) => (
                    <a
                      key={doc.id}
                      href={`/media/${doc.path}`}
                      download
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-between p-3 rounded-lg border border-slate-100 hover:bg-slate-50 transition-colors group text-sm"
                    >
                      <span className="text-slate-600 group-hover:text-primary-900 font-medium truncate max-w-[180px]">{doc.name}</span>
                      <ArrowDownTrayIcon className="h-4 w-4 text-slate-400 group-hover:text-accent-500 transition-colors flex-shrink-0" />
                    </a>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Full screen Lightbox gallery */}
      {project.images && project.images.length > 0 && (
        <Lightbox
          isOpen={lightboxOpen}
          images={project.images}
          initialIndex={lightboxIndex}
          onClose={() => setLightboxOpen(false)}
        />
      )}
    </div>
  );
}
