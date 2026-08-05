import React, { createContext, useContext, useState, useEffect, lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate, Link, useLocation } from 'react-router-dom';
import { api } from './api/client';
import { Bars3Icon, XMarkIcon } from '@heroicons/react/24/outline';
import { ErrorBoundary } from './components/ErrorBoundary';

// Context for global state
export const AppContext = createContext(null);

export function AppProvider({ children }) {
  const [settings, setSettings] = useState(() => {
    try {
      const cached = localStorage.getItem('josmar_settings');
      return cached ? JSON.parse(cached) : null;
    } catch (e) {
      return null;
    }
  });
  const [settingsLoading, setSettingsLoading] = useState(() => !localStorage.getItem('josmar_settings'));
  const [user, setUser] = useState(api.auth.getUser());
  const [initChecked, setInitChecked] = useState(false);
  const [needsSetup, setNeedsSetup] = useState(false);

  const fetchSettings = async () => {
    try {
      const data = await api.get('/api/public/settings');
      setSettings(data);
      localStorage.setItem('josmar_settings', JSON.stringify(data));
    } catch (e) {
      console.error('Failed to load settings', e);
    } finally {
      setSettingsLoading(false);
    }
  };

  useEffect(() => {
    // Listen for unauthorized 401 events globally
    const handleUnauthorized = () => {
      setUser(null);
    };
    window.addEventListener('auth:unauthorized', handleUnauthorized);

    // Parallelize initialization requests to avoid sequence blocking.
    // Auth check verifies current user session using the HttpOnly cookie.
    Promise.allSettled([
      fetchSettings(),
      fetch('/api/auth/me', { credentials: 'include' })
        .then(async (res) => {
          if (res.ok) {
            const data = await res.json();
            if (data.user && !localStorage.getItem('admin_user')) {
              localStorage.setItem('admin_user', JSON.stringify(data.user));
              setUser(data.user);
            }
          } else {
            localStorage.removeItem('admin_user');
            setUser(null);
          }
        })
        .catch(() => {
          // Network error — leave existing user state untouched
        })
    ]).finally(() => setInitChecked(true));

    return () => window.removeEventListener('auth:unauthorized', handleUnauthorized);
  }, []);

  useEffect(() => {
    if (settings && settings.theme) {
      const { primary_color, secondary_color, accent_color } = settings.theme;
      
      const setProp = (name, val) => document.documentElement.style.setProperty(name, val);
      
      if (primary_color) {
        setProp('--color-primary', primary_color);
      }
      if (secondary_color) {
        setProp('--color-secondary', secondary_color);
      }
      if (accent_color) {
        setProp('--color-accent', accent_color);
        
        if (accent_color && typeof accent_color === 'string' && accent_color.startsWith('#') && accent_color.length === 7) {
          try {
            const r = parseInt(accent_color.slice(1, 3), 16);
          const g = parseInt(accent_color.slice(3, 5), 16);
          const b = parseInt(accent_color.slice(5, 7), 16);
          
          const rl = Math.round(r + (255 - r) * 0.92);
          const gl = Math.round(g + (255 - g) * 0.92);
          const bl = Math.round(b + (255 - b) * 0.92);
          const lightHex = `#${((1 << 24) + (rl << 16) + (gl << 8) + bl).toString(16).slice(1)}`;
          setProp('--color-accent-light', lightHex);
          
          const rd = Math.round(r * 0.88);
          const gd = Math.round(g * 0.88);
          const bd = Math.round(b * 0.88);
          const darkHex = `#${((1 << 24) + (rd << 16) + (gd << 8) + bd).toString(16).slice(1)}`;
          setProp('--color-accent-dark', darkHex);
        } catch (e) {
          console.error('Failed to compute theme shades', e);
        }
      }
    }
  }
}, [settings]);

  const login = async (username, password) => {
    const loggedUser = await api.auth.login(username, password);
    setUser(loggedUser);
    return loggedUser;
  };

  const logout = () => {
    api.auth.logout();
    setUser(null);
  };

  return (
    <AppContext.Provider value={{ settings, settingsLoading, user, login, logout, setUser, fetchSettings, needsSetup, setNeedsSetup }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  return useContext(AppContext);
}

// Protected Route Guard for Admin Panel
function ProtectedRoute({ children }) {
  const { user } = useApp();
  const location = useLocation();

  if (!user) {
    return <Navigate to="/admin/login" state={{ from: location }} replace />;
  }

  return children;
}

// Public Layout (Navbar and Footer driven by D1)
function PublicLayout({ children }) {
  const { settings, settingsLoading } = useApp();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();

  if (settingsLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950 text-white">
        <div className="flex flex-col items-center gap-3">
          <div className="w-12 h-12 border-4 border-accent-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-slate-400 font-medium">Loading engineering parameters...</p>
        </div>
      </div>
    );
  }

  const general = settings?.general || {};
  const contact = settings?.contact || {};
  const social = settings?.social || {};
  const footerSettings = settings?.footer || {};
  const theme = settings?.theme || {};

  const links = [
    { name: 'Home', path: '/' },
    { name: 'About Us', path: '/about-us' },
    { name: 'Services', path: '/services' },
    { name: 'Projects', path: '/projects' },
    { name: 'Credentials', path: '/credentials' },
    { name: 'Gallery', path: '/gallery' },
    { name: 'Careers', path: '/careers' },
    { name: 'Blog', path: '/blog' },
    { name: 'Contact', path: '/contact' },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900 font-sans">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-slate-100 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-24 items-center">
            <Link to="/" className="flex items-center gap-4">
              {general.company_logo ? (
                <img src={`/media/${general.company_logo}`} alt={general.company_name} className="h-16 w-auto object-contain" />
              ) : (
                <div className="h-16 w-16 bg-primary-900 text-white flex items-center justify-center font-bold text-2xl rounded-2xl">J</div>
              )}
              <span className="font-bold text-3xl text-primary-900 tracking-tight">{general.company_name || 'Josmar'}</span>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center space-x-2">
              {links.map(l => {
                const isActive = location.pathname === l.path;
                return (
                  <Link
                    key={l.path}
                    to={l.path}
                    className={`relative px-4 py-2 text-sm font-medium rounded-xl transition-all duration-300 whitespace-nowrap hover:bg-slate-200/75 hover:shadow-[0_8px_20px_-6px_rgba(15,23,42,0.12)] hover:text-primary-900 after:absolute after:bottom-1.5 after:left-4 after:right-4 after:h-[2px] after:origin-left after:scale-x-0 after:bg-accent-500 after:transition-transform after:duration-300 hover:after:scale-x-100 ${
                      isActive
                        ? 'text-accent-500 font-bold after:scale-x-100'
                        : 'text-slate-600'
                    }`}
                  >
                    {l.name}
                  </Link>
                );
              })}
            </nav>

            {/* Mobile Nav Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-lg text-slate-500 hover:bg-slate-100 focus:outline-none"
            >
              {mobileMenuOpen ? <XMarkIcon className="h-6 w-6" /> : <Bars3Icon className="h-6 w-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Dropdown Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-white border-b border-slate-100 px-4 pt-2 pb-4 space-y-1 shadow-inner">
            {links.map(l => (
              <Link
                key={l.path}
                to={l.path}
                onClick={() => setMobileMenuOpen(false)}
                className={`block px-3 py-2 rounded-md text-base font-medium ${
                  location.pathname === l.path
                    ? 'bg-accent-50 text-accent-500'
                    : 'text-slate-600 hover:bg-slate-50 hover:text-primary-900'
                }`}
              >
                {l.name}
              </Link>
            ))}
          </div>
        )}
      </header>

      {/* Main Content Area */}
      <main className="flex-grow">
        {children}
      </main>

      {/* Footer */}
      <footer className="bg-primary-900 text-slate-300 border-t border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="md:col-span-2">
              <Link to="/" className="flex items-center gap-2 text-white mb-4">
                {general.company_logo ? (
                  <img src={`/media/${general.company_logo}`} alt={general.company_name} className="h-8 w-auto bg-white/10 p-1 rounded" />
                ) : (
                  <div className="h-8 w-8 bg-accent-500 text-white flex items-center justify-center font-bold text-md rounded">J</div>
                )}
                <span className="font-bold text-lg tracking-tight">{general.company_name || 'Josmar'}</span>
              </Link>
              <p className="text-slate-400 text-sm max-w-sm mb-6">
                {footerSettings.footer_tagline || 'Engineering a sustainable and resilient future through innovative consulting solutions.'}
              </p>
              {/* Social Icons */}
              <div className="flex gap-4">
                {social.linkedin && (
                  <a href={social.linkedin} target="_blank" rel="noopener noreferrer" className="hover:text-accent-300 transition-colors text-slate-400">
                    LinkedIn
                  </a>
                )}
                {social.twitter && (
                  <a href={social.twitter} target="_blank" rel="noopener noreferrer" className="hover:text-accent-300 transition-colors text-slate-400">
                    Twitter
                  </a>
                )}
              </div>
            </div>

            <div>
              <h3 className="text-white font-semibold text-sm uppercase tracking-wider mb-4">Company</h3>
              <ul className="space-y-2 text-sm">
                <li><Link to="/about-us" className="hover:text-white transition-colors">About Us</Link></li>
                <li><Link to="/services" className="hover:text-white transition-colors">Our Services</Link></li>
                <li><Link to="/projects" className="hover:text-white transition-colors">Projects Portfolio</Link></li>
                <li><Link to="/credentials" className="hover:text-white transition-colors">Credentials & Certs</Link></li>
                <li><Link to="/careers" className="hover:text-white transition-colors">Careers</Link></li>
              </ul>
            </div>

            <div>
              <h3 className="text-white font-semibold text-sm uppercase tracking-wider mb-4">Contact Info</h3>
              <ul className="space-y-2 text-sm text-slate-400">
                <li className="text-white font-medium">Address:</li>
                <li className="mb-2">{contact.office_address}</li>
                <li className="text-white font-medium">Phone:</li>
                <li>{Array.isArray(contact.phone_numbers) ? contact.phone_numbers[0] : contact.phone_numbers}</li>
                <li className="text-white font-medium mt-2">Email:</li>
                <li>{Array.isArray(contact.emails) ? contact.emails[0] : contact.emails}</li>
              </ul>
            </div>
          </div>

          <div className="border-t border-slate-800 mt-12 pt-6 flex flex-col md:flex-row justify-between items-center text-xs text-slate-500 gap-4">
            <p>{footerSettings.footer_copyright || '© 2026 Josmar Consulting Engineers. All rights reserved.'}</p>
            <div className="flex gap-4">
              <Link to="/privacy-policy" className="hover:underline">Privacy Policy</Link>
              <Link to="/terms-conditions" className="hover:underline">Terms &amp; Conditions</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

// Lazy Load Pages for Performance
const Home = lazy(() => import('./pages/Home'));
const AboutUs = lazy(() => import('./pages/AboutUs'));
const Services = lazy(() => import('./pages/Services'));
const Projects = lazy(() => import('./pages/Projects'));
const ProjectDetail = lazy(() => import('./pages/ProjectDetail'));
const Credentials = lazy(() => import('./pages/Credentials'));
const Gallery = lazy(() => import('./pages/Gallery'));
const Careers = lazy(() => import('./pages/Careers'));
const Blog = lazy(() => import('./pages/Blog'));
const BlogDetail = lazy(() => import('./pages/BlogDetail'));
const Contact = lazy(() => import('./pages/Contact'));
const PrivacyPolicy = lazy(() => import('./pages/PrivacyPolicy'));
const TermsConditions = lazy(() => import('./pages/TermsConditions'));
const NotFound = lazy(() => import('./pages/NotFound'));

// Lazy Load CMS Dashboard Pages
const CMSLogin = lazy(() => import('./cms/Login'));
const CMSDashboard = lazy(() => import('./cms/Dashboard'));
const CMSLayout = lazy(() => import('./cms/CMSLayout'));
const CMSCRUDManager = lazy(() => import('./cms/CRUDManager'));
const CMSMediaLibrary = lazy(() => import('./cms/MediaLibrary'));
const CMSSettings = lazy(() => import('./cms/Settings'));

export default function App() {
  return (
    <ErrorBoundary>
      <AppProvider>
        <BrowserRouter>
          <Suspense fallback={
            <div className="min-h-screen flex items-center justify-center bg-slate-900 text-white">
              <div className="w-10 h-10 border-4 border-accent-500 border-t-transparent rounded-full animate-spin"></div>
            </div>
          }>
            <Routes>
              {/* Public routes */}
              <Route path="/" element={<PublicLayout><Home /></PublicLayout>} />
              <Route path="/about-us" element={<PublicLayout><AboutUs /></PublicLayout>} />
              <Route path="/services" element={<PublicLayout><Services /></PublicLayout>} />
              <Route path="/projects" element={<PublicLayout><Projects /></PublicLayout>} />
              <Route path="/projects/:slug" element={<PublicLayout><ProjectDetail /></PublicLayout>} />
              <Route path="/credentials" element={<PublicLayout><Credentials /></PublicLayout>} />
              <Route path="/gallery" element={<PublicLayout><Gallery /></PublicLayout>} />
              <Route path="/careers" element={<PublicLayout><Careers /></PublicLayout>} />
              <Route path="/blog" element={<PublicLayout><Blog /></PublicLayout>} />
              <Route path="/blog/:slug" element={<PublicLayout><BlogDetail /></PublicLayout>} />
              <Route path="/contact" element={<PublicLayout><Contact /></PublicLayout>} />
              <Route path="/privacy-policy" element={<PublicLayout><PrivacyPolicy /></PublicLayout>} />
              <Route path="/terms-conditions" element={<PublicLayout><TermsConditions /></PublicLayout>} />

              {/* Admin Login Route */}
              <Route path="/admin/login" element={<CMSLogin />} />

              {/* Protected Admin Routes */}
              <Route path="/admin" element={
                <ProtectedRoute>
                  <CMSLayout />
                </ProtectedRoute>
              }>
                <Route index element={<CMSDashboard />} />
                <Route path="media" element={<CMSMediaLibrary />} />
                <Route path="settings" element={<CMSSettings />} />
                {/* Dynamic CRUD for various modules */}
                <Route path=":module" element={<CMSCRUDManager />} />
              </Route>

              {/* 404 Route */}
              <Route path="*" element={<PublicLayout><NotFound /></PublicLayout>} />
            </Routes>
          </Suspense>
        </BrowserRouter>
      </AppProvider>
    </ErrorBoundary>
  );
}
