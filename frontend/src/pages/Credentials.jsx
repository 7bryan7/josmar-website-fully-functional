import React, { useEffect, useState } from 'react';
import { api } from '../api/client';
import Lightbox from '../components/Lightbox';

export default function Credentials() {
  const [data, setData] = useState({ global_certifications: [], other_certificates: [] });
  const [loading, setLoading] = useState(true);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);
  const [lightboxImages, setLightboxImages] = useState([]);

  useEffect(() => {
    async function fetchCredentials() {
      try {
        const credentialsData = await api.get('/api/public/credentials');
        setData(credentialsData);
      } catch (e) {
        console.error('Failed to load credentials data', e);
      } finally {
        setLoading(false);
      }
    }
    fetchCredentials();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center py-32">
        <div className="w-10 h-10 border-4 border-accent-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  const { global_certifications, other_certificates } = data;

  const openLightbox = (imagePath, title, description) => {
    setLightboxImages([{ path: imagePath, title, description }]);
    setLightboxIndex(0);
    setLightboxOpen(true);
  };

  return (
    <div className="bg-slate-50 min-h-[80vh] py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Page Title */}
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-bold text-primary-900 tracking-tight mb-4">Credentials & Accreditations</h1>
          <p className="text-slate-500 max-w-2xl mx-auto text-md font-semibold">
            Licensed professional licenses and institutional certifications validating our engineering standards.
          </p>
        </div>

        {/* 1. Global Certifications Section */}
        <div className="mb-20">
          <div className="border-b border-slate-200 pb-4 mb-8">
            <h2 className="text-2xl font-bold text-primary-900">Global Institutional Certifications</h2>
            <p className="text-slate-400 text-xs mt-1">Certificates received from globally recognized engineering and regulatory organizations.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {global_certifications.map((cert) => (
              <div key={cert.id} className="card-premium bg-white p-6 flex flex-col md:flex-row gap-6 items-start">
                
                {/* Certificate Image Preview */}
                <div 
                  onClick={() => openLightbox(cert.certificate_image_path, cert.title, cert.description)}
                  className="w-full md:w-32 h-44 bg-slate-100 border border-slate-200 rounded-xl overflow-hidden cursor-zoom-in group flex-shrink-0 relative shadow-inner"
                >
                  {cert.certificate_image_path ? (
                    <img 
                      src={`/media/${cert.certificate_image_path}`} 
                      alt={cert.title} 
                      className="w-full h-full object-cover group-hover:opacity-95 transition-opacity" 
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-slate-100 text-xs text-slate-400 font-medium">No credential image available</div>
                  )}
                  <div className="absolute inset-0 bg-black/10 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-xs font-bold">
                    View
                  </div>
                </div>

                {/* Certification details */}
                <div className="flex-grow space-y-3">
                  <div className="flex items-center gap-3">
                    {cert.org_logo_path && (
                      <img src={`/media/${cert.org_logo_path}`} alt={cert.issuing_organization} className="h-8 w-auto object-contain" />
                    )}
                    <div>
                      <h3 className="font-bold text-lg text-primary-900 leading-tight">{cert.title}</h3>
                      <p className="text-slate-500 text-xs font-semibold">{cert.issuing_organization}</p>
                    </div>
                  </div>

                  <p className="text-slate-600 text-xs leading-relaxed">{cert.description}</p>

                  <div className="grid grid-cols-2 gap-x-4 gap-y-1 pt-2 text-[11px] text-slate-500 border-t border-slate-50">
                    {cert.certificate_number && (
                      <>
                        <span className="font-semibold text-slate-400">License Number:</span>
                        <span className="text-slate-700 font-bold">{cert.certificate_number}</span>
                      </>
                    )}
                    <span className="font-semibold text-slate-400">Issue Date:</span>
                    <span className="text-slate-700 font-bold">{cert.issue_date}</span>
                    {cert.expiry_date && (
                      <>
                        <span className="font-semibold text-slate-400">Expiry Date:</span>
                        <span className="text-slate-700 font-bold">{cert.expiry_date}</span>
                      </>
                    )}
                  </div>

                  {cert.credential_url && (
                    <div className="pt-2">
                      <a 
                        href={cert.credential_url} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-accent-500 hover:text-accent-600 text-xs font-semibold hover:underline"
                      >
                        Verify Credential &rarr;
                      </a>
                    </div>
                  )}
                </div>
              </div>
            ))}

            {global_certifications.length === 0 && (
              <div className="col-span-full text-center py-20 bg-white rounded-2xl border border-slate-100 border-dashed text-slate-500 font-medium">
                No data available for now
              </div>
            )}
          </div>
        </div>

        {/* 2. Other Certificates Section */}
        <div>
          <div className="border-b border-slate-200 pb-4 mb-8">
            <h2 className="text-2xl font-bold text-primary-900">Technical & Safety Certificates</h2>
            <p className="text-slate-400 text-xs mt-1">Individual project, safety compliance, and engineering program credentials.</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            {other_certificates.map((cert) => (
              <div key={cert.id} className="card-premium bg-white flex flex-col justify-between">
                <div>
                  <div 
                    onClick={() => openLightbox(cert.certificate_image_path, cert.title, cert.description)}
                    className="h-44 overflow-hidden bg-slate-100 border-b border-slate-100 cursor-zoom-in group relative shadow-inner"
                  >
                    {cert.certificate_image_path ? (
                      <img 
                        src={`/media/${cert.certificate_image_path}`} 
                        alt={cert.title} 
                        className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-300" 
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-slate-100 text-slate-400 font-medium text-xs">No certificate image available</div>
                    )}
                    <div className="absolute inset-0 bg-black/10 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-xs font-bold">
                      Zoom Certificate
                    </div>
                  </div>
                  <div className="p-6">
                    <span className="text-accent-500 text-[10px] font-bold uppercase tracking-wider">{cert.category}</span>
                    <h3 className="font-bold text-md text-primary-900 mt-1 mb-2 leading-tight">{cert.title}</h3>
                    <p className="text-slate-500 text-xs leading-relaxed">{cert.description}</p>
                  </div>
                </div>
              </div>
            ))}

            {other_certificates.length === 0 && (
              <div className="col-span-full text-center py-20 bg-white rounded-2xl border border-slate-100 border-dashed text-slate-500 font-medium">
                No data available for now
              </div>
            )}
          </div>
        </div>

      </div>

      {/* Lightbox zoom modal */}
      <Lightbox
        isOpen={lightboxOpen}
        images={lightboxImages}
        initialIndex={lightboxIndex}
        onClose={() => setLightboxOpen(false)}
      />
    </div>
  );
}
