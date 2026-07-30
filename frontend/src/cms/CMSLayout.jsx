import React, { useState } from 'react';
import { Link, Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useApp } from '../App';
import { 
  Squares2X2Icon, 
  PhotoIcon, 
  Cog6ToothIcon, 
  BriefcaseIcon, 
  FolderIcon, 
  ChatBubbleLeftRightIcon, 
  UsersIcon, 
  AcademicCapIcon, 
  NewspaperIcon, 
  DocumentTextIcon, 
  StarIcon, 
  FaceSmileIcon,
  HomeIcon,
  ArrowLeftOnRectangleIcon,
  Bars3Icon,
  XMarkIcon
} from '@heroicons/react/24/outline';

export default function CMSLayout() {
  const { logout, user } = useApp();
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/admin/login');
  };

  const navItems = [
    { name: 'Dashboard', path: '/admin', icon: Squares2X2Icon, end: true },
    { name: 'Media Library', path: '/admin/media', icon: PhotoIcon },
    { name: 'Settings', path: '/admin/settings', icon: Cog6ToothIcon },
    
    // CRUD modules separator
    { name: 'SEPARATOR', label: 'Website Content' },
    
    { name: 'Projects', path: '/admin/projects', icon: FolderIcon },
    { name: 'Services', path: '/admin/services', icon: BriefcaseIcon },
    { name: 'Credentials', path: '/admin/global_certifications', icon: AcademicCapIcon },
    { name: 'Other Certs', path: '/admin/other_certificates', icon: DocumentTextIcon },
    { name: 'Gallery Albums', path: '/admin/gallery_albums', icon: PhotoIcon },
    { name: 'Gallery Images', path: '/admin/gallery', icon: PhotoIcon },
    { name: 'Blog / News', path: '/admin/blogs', icon: NewspaperIcon },
    { name: 'Clients', path: '/admin/clients', icon: FaceSmileIcon },
    { name: 'Testimonials', path: '/admin/testimonials', icon: StarIcon },
    { name: 'Careers', path: '/admin/careers', icon: BriefcaseIcon },
    
    // Submissions separator
    { name: 'SEPARATOR', label: 'Submissions' },
    
    { name: 'Applications', path: '/admin/applications', icon: UsersIcon },
    { name: 'Contact Messages', path: '/admin/contact_messages', icon: ChatBubbleLeftRightIcon },
    { name: 'Manage Users', path: '/admin/users', icon: UsersIcon }
  ];

  const checkActive = (item) => {
    if (item.end) {
      return location.pathname === item.path;
    }
    return location.pathname.startsWith(item.path);
  };

  const SidebarContent = () => (
    <div className="flex flex-col h-full bg-slate-950 text-slate-400">
      {/* Sidebar Brand header */}
      <div className="flex items-center justify-between h-16 px-6 bg-slate-900 border-b border-slate-800">
        <Link to="/admin" className="flex items-center gap-2 text-white">
          <div className="h-8 w-8 bg-accent-500 text-white flex items-center justify-center font-bold text-md rounded-lg">J</div>
          <span className="font-bold text-md tracking-tight">Josmar Admin</span>
        </Link>
        <button className="lg:hidden p-1 rounded-lg hover:bg-slate-800 text-slate-400" onClick={() => setSidebarOpen(false)}>
          <XMarkIcon className="h-5 w-5" />
        </button>
      </div>

      {/* Nav List */}
      <nav className="flex-1 overflow-y-auto px-4 py-4 space-y-1">
        {navItems.map((item, idx) => {
          if (item.name === 'SEPARATOR') {
            return (
              <div key={idx} className="pt-5 pb-1 text-[10px] uppercase font-extrabold text-slate-500 tracking-widest cursor-default select-none border-b border-slate-900/60 mb-2">
                {item.label}
              </div>
            );
          }

          const Icon = item.icon;
          const active = checkActive(item);

          return (
            <Link
              key={item.path}
              to={item.path}
              onClick={() => setSidebarOpen(false)}
              className={`flex items-center gap-3 px-3 py-2 text-xs font-semibold rounded-lg transition-colors ${
                active 
                  ? 'bg-accent-500 text-white font-bold' 
                  : 'hover:bg-slate-900 hover:text-white'
              }`}
            >
              <Icon className="h-5 w-5 flex-shrink-0" />
              <span>{item.name}</span>
            </Link>
          );
        })}
      </nav>

      {/* Sidebar Footer */}
      <div className="p-4 bg-slate-900 border-t border-slate-800 flex justify-between items-center text-xs">
        <div className="truncate pr-2">
          <p className="font-bold text-white truncate">{user?.username}</p>
          <p className="text-[10px] text-slate-500 capitalize">{user?.role}</p>
        </div>
        <button 
          onClick={handleLogout}
          className="p-1.5 rounded-lg text-slate-500 hover:text-white hover:bg-slate-800 transition-colors"
          title="Sign Out"
        >
          <ArrowLeftOnRectangleIcon className="h-5 w-5" />
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-100 flex">
      {/* Sidebar Desktop */}
      <aside className="hidden lg:block w-64 flex-shrink-0 border-r border-slate-800">
        <div className="sticky top-0 h-screen">
          <SidebarContent />
        </div>
      </aside>

      {/* Sidebar Mobile Modal */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-50 flex lg:hidden">
          <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs" onClick={() => setSidebarOpen(false)} />
          <div className="relative w-64 max-w-xs bg-slate-950 flex flex-col h-full z-10 animate-slide-right">
            <SidebarContent />
          </div>
        </div>
      )}

      {/* Right Side Content Panel */}
      <div className="flex-grow flex flex-col min-w-0">
        {/* Top Header navbar */}
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-6 sticky top-0 z-40">
          <button 
            onClick={() => setSidebarOpen(true)}
            className="lg:hidden p-2 rounded-lg text-slate-500 hover:bg-slate-100 focus:outline-none"
          >
            <Bars3Icon className="h-6 w-6" />
          </button>
          
          <div className="flex items-center gap-4 ml-auto">
            <a 
              href="/" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-xs font-semibold text-slate-500 hover:text-accent-500 flex items-center gap-1 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-100"
            >
              <HomeIcon className="h-4 w-4" />
              Live Site
            </a>
          </div>
        </header>

        {/* Content Outlet View */}
        <main className="flex-grow p-6 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
