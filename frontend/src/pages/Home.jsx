import React, { useEffect, useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api/client';
import Carousel from '../components/Carousel';
import { ChevronRightIcon } from '@heroicons/react/24/outline';
import { useApp } from '../App';

function ScrollReveal({ children, direction = 'left', delay = 0 }) {
  const [isVisible, setIsVisible] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) {
      setIsVisible(true);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.unobserve(entry.target);
        }
      },
      {
        threshold: 0.05,
        rootMargin: '0px 0px -60px 0px'
      }
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => {
      if (ref.current) {
        observer.unobserve(ref.current);
      }
    };
  }, []);

  const directionClasses = {
    left: 'opacity-0 -translate-x-32 md:-translate-x-48',
    right: 'opacity-0 translate-x-32 md:translate-x-48',
    up: 'opacity-0 translate-y-24'
  };

  return (
    <div
      ref={ref}
      className={`transition-all duration-[1800ms] will-change-transform ${
        isVisible 
          ? 'opacity-100 translate-x-0 translate-y-0' 
          : directionClasses[direction]
      }`}
      style={{ 
        transitionDelay: `${delay}ms`,
        transitionTimingFunction: 'cubic-bezier(0.16, 1, 0.3, 1)'
      }}
    >
      {children}
    </div>
  );
}

export default function Home() {
  const { settings: globalSettings } = useApp();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchHomeData() {
      try {
        const homeData = await api.get('/api/public/homepage');
        setData(homeData);
      } catch (e) {
        console.error('Failed to load homepage data', e);
      } finally {
        setLoading(false);
      }
    }
    fetchHomeData();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center py-32 bg-slate-50">
        <div className="w-10 h-10 border-4 border-accent-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!data) return null;

  const { sections, services, projects, testimonials, clients, news } = data;

  // Renderer map for homepage sections
  const renderSection = (section) => {
    const sKey = section.section_key;
    const settings = section.settings_json || {};

    switch (sKey) {
      case 'hero': {
        // Dynamic image settings from global Settings context, falling back to premium Unsplash engineering photos
        const generalSettings = globalSettings?.general || {};
        const img1 = generalSettings.hero_image_1 ? `/media/${generalSettings.hero_image_1}` : "https://images.unsplash.com/photo-1541888946425-d81bb19240f5?auto=format&fit=crop&w=600&q=80";
        const img2 = generalSettings.hero_image_2 ? `/media/${generalSettings.hero_image_2}` : "https://images.unsplash.com/photo-1581094288338-2314dddb7ecc?auto=format&fit=crop&w=600&q=80";
        const img3 = generalSettings.hero_image_3 ? `/media/${generalSettings.hero_image_3}` : "https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&w=600&q=80";

        return (
          <section 
            key={section.id}
            className={`relative text-white overflow-hidden ${section.padding_y} ${section.background_color}`}
          >
            {/* Background image overlay */}
            {section.background_image_media_id && (
              <div 
                className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-15"
                style={{ backgroundImage: `url(/media/${section.background_image_media_id})` }}
              />
            )}
            <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 items-center">
                
                {/* Left Column: Copywriting */}
                <div className="lg:col-span-6 text-center lg:text-left flex flex-col items-center lg:items-start">
                  <span className="bg-accent-500/10 text-accent-400 font-bold uppercase tracking-wider text-xs px-3.5 py-1.5 rounded-full mb-6 inline-flex items-center gap-1.5 border border-accent-500/20 backdrop-blur-sm">
                    <span className="h-2 w-2 rounded-full bg-accent-400 animate-pulse"></span> Consulting Engineers
                  </span>
                  <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight mb-6 leading-tight max-w-2xl bg-gradient-to-r from-white via-slate-100 to-slate-300 bg-clip-text text-transparent">
                    {section.title}
                  </h1>
                  <p className="text-lg md:text-xl text-slate-300 max-w-xl mb-10 leading-relaxed">
                    {section.subtitle}
                  </p>
                  <div className="flex flex-wrap justify-center lg:justify-start gap-4">
                    {settings.button_text && (
                      <Link to={settings.button_link || '/services'} className="button-primary px-8 py-3.5 text-base shadow-lg shadow-accent-500/10">
                        {settings.button_text}
                      </Link>
                    )}
                    {settings.secondary_button_text && (
                      <Link to={settings.secondary_button_link || '/projects'} className="button-secondary bg-slate-900/40 border-white/10 text-white hover:bg-white/10 hover:text-white px-8 py-3.5 text-base backdrop-blur-sm transition-all">
                        {settings.secondary_button_text}
                      </Link>
                    )}
                  </div>
                </div>

                {/* Right Column: Layered Overlapping Interactive Photo Grid */}
                <div className="lg:col-span-6 relative w-full h-[400px] sm:h-[500px] flex items-center justify-center lg:justify-end mt-12 lg:mt-0 select-none">
                  <div className="relative w-full max-w-[420px] h-full">
                    
                    {/* Back / Left Image Wrapper (Civil construction) */}
                    <div className="absolute top-12 left-0 animate-float-slow z-10 hover:z-30">
                      <div className="w-[240px] sm:w-[290px] aspect-[4/3] rounded-2xl overflow-hidden shadow-2xl border-4 border-slate-950/80 bg-slate-800 -rotate-6 hover:rotate-0 hover:scale-110 hover:shadow-accent-500/20 transition-all duration-500 ease-out group cursor-pointer">
                        <img src={img1} alt="Structural construction" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out" />
                        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-4">
                          <span className="text-white text-xs font-bold tracking-wider uppercase">Infrastructure</span>
                        </div>
                      </div>
                    </div>

                    {/* Top / Right Image Wrapper (CAD blueprints) */}
                    <div className="absolute top-2 right-0 animate-float-delayed z-20 hover:z-30">
                      <div className="w-[200px] sm:w-[240px] aspect-[3/4] rounded-2xl overflow-hidden shadow-2xl border-4 border-slate-950/80 bg-slate-800 rotate-6 hover:rotate-0 hover:scale-110 hover:shadow-accent-500/20 transition-all duration-500 ease-out group cursor-pointer">
                        <img src={img2} alt="Engineering design blueprints" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out" />
                        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-4">
                          <span className="text-white text-xs font-bold tracking-wider uppercase">Planning & Design</span>
                        </div>
                      </div>
                    </div>

                    {/* Front / Bottom Center Image Wrapper (Completed structure) */}
                    <div className="absolute bottom-4 left-16 sm:left-24 animate-float-fast z-25 hover:z-30">
                      <div className="w-[220px] sm:w-[270px] aspect-[4/3] rounded-2xl overflow-hidden shadow-2xl border-4 border-slate-950/80 bg-slate-800 rotate-2 hover:rotate-0 hover:scale-110 hover:shadow-accent-500/20 transition-all duration-500 ease-out group cursor-pointer">
                        <img src={img3} alt="Completed modern project structure" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out" />
                        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-4">
                          <span className="text-white text-xs font-bold tracking-wider uppercase">Engineering</span>
                        </div>
                      </div>
                    </div>

                  </div>
                </div>

              </div>
            </div>
          </section>
        );
      }

      case 'intro':
        return (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 my-8 sm:my-12">
            <ScrollReveal direction="left">
              <section 
                key={section.id} 
                className={`rounded-[2.5rem] border border-slate-100/50 shadow-lg shadow-slate-100/5 ${section.padding_y} bg-gradient-to-br from-slate-50/60 via-white to-slate-50/20 overflow-hidden`}
              >
                <div className="px-6 sm:px-12 lg:px-16 text-center max-w-4xl mx-auto">
                  <span className="text-accent-500 font-bold uppercase tracking-wider text-xs block mb-2">Introduction</span>
                  <h2 className="text-3xl font-bold text-primary-900 mb-6">{section.title}</h2>
                  <p className="text-slate-500 font-semibold mb-6">{section.subtitle}</p>
                  <p className="text-slate-600 leading-relaxed text-md">{settings.body_text}</p>
                </div>
              </section>
            </ScrollReveal>
          </div>
        );

      case 'why_choose_us':
        return (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 my-8 sm:my-12">
            <ScrollReveal direction="right">
              <section 
                key={section.id} 
                className={`rounded-[2.5rem] border border-sky-100/50 shadow-lg shadow-sky-100/10 ${section.padding_y} bg-gradient-to-br from-sky-50/50 via-white to-sky-50/20 overflow-hidden`}
              >
                <div className="px-6 sm:px-12 lg:px-16">
                  <div className="text-center mb-12">
                    <span className="text-accent-500 font-bold uppercase tracking-wider text-xs block mb-2">Our Strategy</span>
                    <h2 className="text-3xl font-bold text-primary-900">{section.title}</h2>
                    <p className="text-slate-500 mt-2">{section.subtitle}</p>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {Array.isArray(settings.cards) && settings.cards.map((card, idx) => (
                      <div key={idx} className="card-premium p-6">
                        <div className="h-10 w-10 bg-accent-50 text-accent-500 rounded-xl flex items-center justify-center font-bold text-lg mb-4">
                          {idx + 1}
                        </div>
                        <h3 className="font-bold text-lg text-primary-900 mb-2">{card.title}</h3>
                        <p className="text-slate-600 text-sm leading-relaxed">{card.desc}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </section>
            </ScrollReveal>
          </div>
        );

      case 'services':
        return (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 my-8 sm:my-12">
            <ScrollReveal direction="left">
              <section 
                key={section.id} 
                className={`rounded-[2.5rem] border border-slate-100/60 shadow-lg shadow-slate-100/10 ${section.padding_y} bg-gradient-to-br from-slate-50/70 via-white to-slate-50/30 overflow-hidden`}
              >
                <div className="px-6 sm:px-12 lg:px-16">
                  <div className="flex justify-between items-end mb-12">
                    <div>
                      <span className="text-accent-500 font-bold uppercase tracking-wider text-xs block mb-2">Capabilities</span>
                      <h2 className="text-3xl font-bold text-primary-900">{section.title}</h2>
                      <p className="text-slate-500 mt-2">{section.subtitle}</p>
                    </div>
                    <Link to="/services" className="hidden md:flex items-center text-accent-500 hover:text-accent-600 font-medium text-sm gap-1 group">
                      All Services <ChevronRightIcon className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                    </Link>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {services.map((svc) => (
                      <div key={svc.id} className="card-premium flex flex-col justify-between p-6">
                        <div>
                          <div className="h-12 w-12 bg-primary-50 rounded-xl text-primary-900 flex items-center justify-center mb-6">
                            <span className="font-semibold text-lg">{svc.title.substring(0, 2)}</span>
                          </div>
                          <h3 className="font-bold text-lg text-primary-900 mb-3">{svc.title}</h3>
                          <p className="text-slate-600 text-sm line-clamp-3 mb-6">{svc.description}</p>
                        </div>
                        <Link to={`/services#${svc.seo_url}`} className="text-accent-500 hover:text-accent-600 font-semibold text-sm inline-flex items-center gap-1">
                          Read More &rarr;
                        </Link>
                      </div>
                    ))}
                  </div>
                </div>
              </section>
            </ScrollReveal>
          </div>
        );

      case 'projects':
        return (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 my-8 sm:my-12">
            <ScrollReveal direction="right">
              <section 
                key={section.id} 
                className={`rounded-[2.5rem] border border-blue-100/40 shadow-lg shadow-blue-100/5 ${section.padding_y} bg-gradient-to-br from-blue-50/30 via-white to-blue-50/10 overflow-hidden`}
              >
                <div className="px-6 sm:px-12 lg:px-16">
                  <div className="flex justify-between items-end mb-12">
                    <div>
                      <span className="text-accent-500 font-bold uppercase tracking-wider text-xs block mb-2">Portfolio</span>
                      <h2 className="text-3xl font-bold text-primary-900">{section.title}</h2>
                      <p className="text-slate-500 mt-2">{section.subtitle}</p>
                    </div>
                    <Link to="/projects" className="hidden md:flex items-center text-accent-500 hover:text-accent-600 font-medium text-sm gap-1 group">
                      All Projects <ChevronRightIcon className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                    </Link>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {projects.map((proj) => (
                      <div key={proj.id} className="card-premium group">
                        <div className="h-48 overflow-hidden bg-slate-200 relative">
                          {proj.primary_image_path ? (
                            <img 
                              src={`/media/${proj.primary_image_path}`} 
                              alt={proj.name}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-slate-400 font-medium">No Image</div>
                          )}
                          <span className="absolute top-4 left-4 bg-primary-900/90 text-white text-xs font-semibold px-2.5 py-1 rounded-full uppercase tracking-wider">
                            {proj.category}
                          </span>
                        </div>
                        <div className="p-6">
                          <h3 className="font-bold text-lg text-primary-900 mb-2 truncate">{proj.name}</h3>
                          <p className="text-slate-400 text-xs font-semibold mb-3">Client: {proj.client}</p>
                          <p className="text-slate-600 text-sm line-clamp-2 mb-4">{proj.description}</p>
                          <Link to={`/projects/${proj.seo_slug}`} className="text-accent-500 hover:text-accent-600 font-semibold text-sm inline-flex items-center gap-1">
                            View Case Study &rarr;
                          </Link>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </section>
            </ScrollReveal>
          </div>
        );

      case 'stats':
        return (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 my-8 sm:my-12">
            <ScrollReveal direction="left">
              <section 
                key={section.id} 
                className={`rounded-[2.5rem] border border-slate-800 shadow-2xl ${section.padding_y} bg-gradient-to-br from-slate-900 via-slate-950 to-primary-950 text-white overflow-hidden`}
              >
                <div className="px-6 sm:px-12 lg:px-16">
                  <h2 className="text-3xl font-bold mb-12 text-center">{section.title}</h2>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                    {Array.isArray(settings.stats) && settings.stats.map((stat, idx) => (
                      <div key={idx} className="flex flex-col items-center">
                        <div className="text-3xl md:text-5xl font-extrabold text-accent-400 mb-2">{stat.value}</div>
                        <div className="text-slate-400 text-sm font-semibold">{stat.label}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </section>
            </ScrollReveal>
          </div>
        );

      case 'testimonials':
        return (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 my-8 sm:my-12">
            <ScrollReveal direction="right">
              <section 
                key={section.id} 
                className={`rounded-[2.5rem] border border-emerald-100/30 shadow-lg shadow-emerald-100/5 ${section.padding_y} bg-gradient-to-br from-emerald-50/20 via-white to-emerald-50/10 overflow-hidden`}
              >
                <div className="px-6 sm:px-12 lg:px-16">
                  <div className="text-center mb-12">
                    <span className="text-accent-500 font-bold uppercase tracking-wider text-xs block mb-2">Testimonials</span>
                    <h2 className="text-3xl font-bold text-primary-900">{section.title}</h2>
                    <p className="text-slate-500 mt-2">{section.subtitle}</p>
                  </div>

                  <Carousel
                    items={testimonials}
                    renderItem={(item) => (
                      <div className="card-premium p-6 w-[280px] md:w-[350px] flex flex-col justify-between min-h-[220px]">
                        <p className="text-slate-600 text-sm italic leading-relaxed mb-6">&ldquo;{item.testimonial_text}&rdquo;</p>
                        <div className="flex items-center gap-3">
                          {item.avatar_path ? (
                            <img src={`/media/${item.avatar_path}`} alt={item.client_name} className="h-10 w-10 rounded-full object-cover" />
                          ) : (
                            <div className="h-10 w-10 rounded-full bg-slate-200 flex items-center justify-center font-bold text-sm text-slate-500">
                              {item.client_name.substring(0, 1)}
                            </div>
                          )}
                          <div>
                            <h4 className="font-bold text-sm text-primary-900">{item.client_name}</h4>
                            <p className="text-slate-400 text-xs">{item.client_role} {item.company_name && `at ${item.company_name}`}</p>
                          </div>
                        </div>
                      </div>
                    )}
                  />
                </div>
              </section>
            </ScrollReveal>
          </div>
        );

      case 'logos':
        return (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 my-8 sm:my-12">
            <ScrollReveal direction="left">
              <section 
                key={section.id} 
                className={`rounded-[2.5rem] border border-slate-100/40 shadow-md ${section.padding_y} bg-gradient-to-br from-slate-50/30 via-white to-slate-50/20 overflow-hidden`}
              >
                <div className="px-6 sm:px-12 lg:px-16">
                  <h2 className="text-slate-400 font-bold text-sm uppercase tracking-wider mb-8 text-center">{section.title}</h2>
                  <div className="flex flex-wrap items-center justify-center gap-12 opacity-50 grayscale hover:grayscale-0 hover:opacity-100 transition-all duration-300">
                    {clients.map((client) => (
                      <div key={client.id} className="h-12 w-28 flex items-center justify-center">
                        {client.logo_path ? (
                          <img src={`/media/${client.logo_path}`} alt={client.name} className="max-h-full max-w-full object-contain" />
                        ) : (
                          <span className="font-semibold text-slate-600 text-md">{client.name}</span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </section>
            </ScrollReveal>
          </div>
        );

      case 'news':
        return (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 my-8 sm:my-12">
            <ScrollReveal direction="right">
              <section 
                key={section.id} 
                className={`rounded-[2.5rem] border border-indigo-100/30 shadow-lg shadow-indigo-100/5 ${section.padding_y} bg-gradient-to-br from-indigo-50/20 via-white to-indigo-50/10 overflow-hidden`}
              >
                <div className="px-6 sm:px-12 lg:px-16">
                  <div className="flex justify-between items-end mb-12">
                    <div>
                      <span className="text-accent-500 font-bold uppercase tracking-wider text-xs block mb-2">Publications</span>
                      <h2 className="text-3xl font-bold text-primary-900">{section.title}</h2>
                      <p className="text-slate-500 mt-2">{section.subtitle}</p>
                    </div>
                    <Link to="/blog" className="hidden md:flex items-center text-accent-500 hover:text-accent-600 font-medium text-sm gap-1 group">
                      All Articles <ChevronRightIcon className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                    </Link>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {news.map((item) => (
                      <div key={item.id} className="card-premium flex flex-col justify-between">
                        <div>
                          {item.featured_image_path && (
                            <div className="h-48 overflow-hidden bg-slate-200">
                              <img src={`/media/${item.featured_image_path}`} alt={item.title} className="w-full h-full object-cover" />
                            </div>
                          )}
                          <div className="p-6">
                            <span className="text-accent-500 text-xs font-semibold uppercase tracking-wider">{item.category_name}</span>
                            <h3 className="font-bold text-lg text-primary-900 mt-2 mb-3 leading-snug line-clamp-2">{item.title}</h3>
                            <p className="text-slate-600 text-sm line-clamp-3">{item.excerpt}</p>
                          </div>
                        </div>
                        <div className="px-6 pb-6 pt-2">
                          <Link to={`/blog/${item.seo_url}`} className="text-accent-500 hover:text-accent-600 font-semibold text-sm">
                            Read Article &rarr;
                          </Link>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </section>
            </ScrollReveal>
          </div>
        );

      case 'cta':
        return (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 my-8 sm:my-12 mb-20">
            <ScrollReveal direction="up">
              <section 
                key={section.id} 
                className={`rounded-[2.5rem] border border-accent-500/20 shadow-2xl shadow-accent-500/10 ${section.padding_y} bg-gradient-to-br from-accent-600 via-sky-700 to-primary-950 text-white overflow-hidden`}
              >
                <div className="px-6 sm:px-12 lg:px-16 text-center relative z-10 flex flex-col items-center">
                  <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-6">{section.title}</h2>
                  <p className="text-slate-200 mb-8 max-w-xl">{section.subtitle}</p>
                  {settings.button_text && (
                    <Link to={settings.button_link || '/contact'} className="button-secondary bg-white text-primary-900 border-transparent hover:bg-slate-50 font-bold">
                      {settings.button_text}
                    </Link>
                  )}
                </div>
              </section>
            </ScrollReveal>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="flex flex-col">
      {sections.map(section => renderSection(section))}
    </div>
  );
}
