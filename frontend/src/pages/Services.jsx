import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { api } from '../api/client';
import { ArrowDownTrayIcon } from '@heroicons/react/24/outline';

export default function Services() {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const location = useLocation();

  useEffect(() => {
    async function loadServices() {
      try {
        const data = await api.get('/api/public/services');
        setServices(data);
      } catch (e) {
        console.error('Failed to load services', e);
      } finally {
        setLoading(false);
      }
    }
    loadServices();
  }, []);

  // Handle Hash Scroll Deep Linking
  useEffect(() => {
    if (!loading && location.hash) {
      const id = location.hash.substring(1);
      const element = document.getElementById(id);
      if (element) {
        setTimeout(() => {
          element.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }, 100);
      }
    }
  }, [loading, location.hash]);

  if (loading) {
    return (
      <div className="flex justify-center items-center py-32">
        <div className="w-10 h-10 border-4 border-accent-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div>
      <section className="bg-primary-900 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <h1 className="text-4xl font-bold tracking-tight mb-4">Engineering Capabilities</h1>
          <p className="text-slate-300 max-w-2xl mx-auto text-md">
            Professional engineering consulting services covering structural integrity, civil infrastructure design, and environmental permits.
          </p>
        </div>
      </section>

      <section className="py-16 bg-slate-50">
        <div className="max-w-5xl mx-auto px-4 space-y-12">
          {services.map((svc, idx) => (
            <div 
              key={svc.id} 
              id={svc.seo_url} 
              className={`card-premium bg-white p-8 scroll-mt-20 flex flex-col md:flex-row gap-8 items-center ${
                idx % 2 === 1 ? 'md:flex-row-reverse' : ''
              }`}
            >
              {/* Service image */}
              <div className="w-full md:w-1/3 h-52 bg-slate-100 rounded-xl overflow-hidden shadow-inner flex-shrink-0">
                {svc.image_path ? (
                  <img src={`/media/${svc.image_path}`} alt={svc.title} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-slate-400 font-semibold uppercase">
                    {svc.title.substring(0, 2)}
                  </div>
                )}
              </div>

              {/* Service details */}
              <div className="flex-grow">
                <div className="flex items-center gap-3 mb-4">
                  <div className="h-10 w-10 bg-accent-50 text-accent-500 rounded-lg flex items-center justify-center font-bold">
                    {svc.icon ? svc.icon.substring(0, 3).toUpperCase() : 'ENG'}
                  </div>
                  <h2 className="text-2xl font-bold text-primary-900">{svc.title}</h2>
                </div>
                <p className="text-slate-600 text-sm leading-relaxed mb-6 whitespace-pre-line">{svc.description}</p>
                
                {svc.brochure_path && (
                  <a
                    href={`/media/${svc.brochure_path}`}
                    download
                    target="_blank"
                    rel="noopener noreferrer"
                    className="button-secondary text-sm inline-flex items-center gap-2"
                  >
                    <ArrowDownTrayIcon className="h-4 w-4" />
                    Download Brochure (PDF)
                  </a>
                )}
              </div>
            </div>
          ))}

          {services.length === 0 && (
            <div className="text-center py-12 text-slate-500 font-medium">
              No services are currently published. Check back later!
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
