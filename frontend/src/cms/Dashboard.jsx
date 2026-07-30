import React, { useEffect, useState } from 'react';
import { api } from '../api/client';
import { Link } from 'react-router-dom';
import { 
  FolderIcon, 
  BriefcaseIcon, 
  EnvelopeIcon, 
  UsersIcon, 
  PhotoIcon,
  ClockIcon
} from '@heroicons/react/24/outline';

export default function Dashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchOverview = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.get('/api/admin/overview');
      setData(res);
    } catch (e) {
      console.error('Failed to load overview data', e);
      setError(e.message || 'Failed to load overview data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOverview();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center py-20">
        <div className="w-8 h-8 border-4 border-accent-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="p-8 text-center bg-white rounded-2xl border border-slate-200 shadow-sm max-w-md mx-auto my-12">
        <div className="text-red-500 font-bold mb-2">Error Loading Dashboard</div>
        <p className="text-slate-500 text-xs mb-4">{error || 'Unable to fetch dashboard data.'}</p>
        <button 
          onClick={fetchOverview} 
          className="bg-accent-500 text-white font-bold text-xs px-4 py-2 rounded-lg hover:bg-accent-600 transition-colors"
        >
          Retry
        </button>
      </div>
    );
  }

  const { counts, recent_messages, recent_logs } = data;

  const cardStats = [
    { name: 'Projects', value: counts.projects, icon: FolderIcon, link: '/admin/projects', color: 'bg-blue-500 text-white' },
    { name: 'Services', value: counts.services, icon: BriefcaseIcon, link: '/admin/services', color: 'bg-green-500 text-white' },
    { name: 'Unread Messages', value: counts.unread_messages, icon: EnvelopeIcon, link: '/admin/contact_messages', color: 'bg-yellow-500 text-white' },
    { name: 'Pending Applications', value: counts.pending_applications, icon: UsersIcon, link: '/admin/applications', color: 'bg-purple-500 text-white' },
    { name: 'Media Library', value: counts.media_files, icon: PhotoIcon, link: '/admin/media', color: 'bg-pink-500 text-white' }
  ];

  return (
    <div className="space-y-8">
      {/* Title */}
      <div>
        <h1 className="text-2xl font-bold text-primary-900">Control Panel Overview</h1>
        <p className="text-slate-500 text-xs mt-1">Review website metrics, application logs, and messages.</p>
      </div>

      {/* Stats Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
        {cardStats.map((stat, idx) => {
          const Icon = stat.icon;
          return (
            <Link key={idx} to={stat.link} className="card-premium bg-white p-6 hover:-translate-y-0.5 transition-transform">
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-slate-400 text-xs font-semibold uppercase tracking-wider">{stat.name}</p>
                  <p className="text-2xl font-extrabold text-primary-900 mt-2">{stat.value}</p>
                </div>
                <div className={`h-10 w-10 rounded-xl flex items-center justify-center ${stat.color} shadow-sm`}>
                  <Icon className="h-5 w-5" />
                </div>
              </div>
            </Link>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Messages Card */}
        <div className="card-premium bg-white p-6">
          <div className="flex justify-between items-center border-b border-slate-100 pb-4 mb-4">
            <h2 className="font-bold text-md text-primary-900">Recent Messages</h2>
            <Link to="/admin/contact_messages" className="text-xs font-semibold text-accent-500 hover:text-accent-600">
              View All
            </Link>
          </div>

          <div className="space-y-4">
            {recent_messages.map((msg) => (
              <div key={msg.id} className="p-4 rounded-xl border border-slate-100 hover:bg-slate-50 transition-colors text-xs space-y-1.5 relative">
                {msg.is_read === 0 && (
                  <span className="absolute top-4 right-4 h-2 w-2 bg-yellow-500 rounded-full" title="Unread" />
                )}
                <div className="flex justify-between">
                  <span className="font-bold text-primary-900">{msg.name}</span>
                  <span className="text-slate-400 text-[10px] font-semibold">{new Date(msg.created_at).toLocaleDateString()}</span>
                </div>
                <p className="text-slate-400 font-semibold">{msg.subject}</p>
                <p className="text-slate-600 line-clamp-2">{msg.message}</p>
              </div>
            ))}

            {recent_messages.length === 0 && (
              <div className="text-center py-10 text-slate-400 font-semibold">No messages received yet.</div>
            )}
          </div>
        </div>

        {/* Recent Audit Logs Card */}
        <div className="card-premium bg-white p-6">
          <div className="flex justify-between items-center border-b border-slate-100 pb-4 mb-4">
            <h2 className="font-bold text-md text-primary-900">Administrative Logs</h2>
            <span className="text-slate-400 text-xs font-semibold flex items-center gap-1">
              <ClockIcon className="h-4 w-4" /> Live logs
            </span>
          </div>

          <div className="space-y-3.5">
            {recent_logs.map((log) => (
              <div key={log.id} className="flex justify-between items-start text-xs border-b border-slate-50 pb-3 last:border-0 last:pb-0">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-primary-900 capitalize">{log.action.replace('_', ' ')}</span>
                    <span className="text-[10px] bg-slate-100 text-slate-500 px-2 py-0.5 rounded-full uppercase tracking-wider font-semibold">
                      {log.entity_type}
                    </span>
                  </div>
                  <p className="text-slate-500 mt-1">{log.details}</p>
                </div>
                <div className="text-right text-slate-400 text-[10px] font-semibold">
                  <p>{log.username || 'System'}</p>
                  <p className="text-[9px] mt-0.5">{new Date(log.created_at).toLocaleTimeString()}</p>
                </div>
              </div>
            ))}

            {recent_logs.length === 0 && (
              <div className="text-center py-10 text-slate-400 font-semibold">No admin actions logged yet.</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
