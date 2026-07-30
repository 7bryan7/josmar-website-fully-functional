import React from 'react';
import { useApp } from '../App';

export default function AboutUs() {
  const { settings } = useApp();
  const general = settings?.general || {};
  const footer = settings?.footer || {};
  
  // Custom design specs
  const stats = [
    { label: 'Engineering Projects', value: '250+' },
    { label: 'Years of Experience', value: '20+' },
    { label: 'Professional Staff', value: '15+' },
    { label: 'Client Satisfaction', value: '99%' }
  ];

  return (
    <div className="bg-slate-50">
      {/* Banner */}
      <section className="bg-primary-900 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <h1 className="text-4xl font-bold tracking-tight mb-4">About Our Firm</h1>
          <p className="text-slate-300 max-w-2xl mx-auto text-md font-medium">
            Discover the history, leadership, and engineering standards that define {general.company_name || 'our firm'}.
          </p>
        </div>
      </section>

      {/* History and Vision */}
      <section className="py-16">
        <div className="max-w-4xl mx-auto px-4">
          <div className="card-premium p-8 bg-white mb-12">
            <h2 className="text-2xl font-bold text-primary-900 mb-4">Our History</h2>
            <p className="text-slate-600 leading-relaxed mb-6">
              Founded over two decades ago, {general.company_name || 'our firm'} began as a structural design consultancy. Through rigorous technical engineering, safety compliance, and deep respect for architectural integrity, we expanded into civil infrastructure projects and environmental impact assessments. Today, we stand as a premier multi-disciplinary engineering consulting firm.
            </p>
            <h2 className="text-2xl font-bold text-primary-900 mb-4 mt-8">Our Vision</h2>
            <p className="text-slate-600 leading-relaxed">
              {footer.footer_tagline || 'Engineering a sustainable and resilient future through innovative consulting solutions.'} We strive to incorporate state-of-the-art modeling methodologies, BIM alignment, and green building certifications (such as LEED) into every development plan we deliver.
            </p>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            {stats.map((stat, idx) => (
              <div key={idx} className="card-premium bg-white p-6">
                <div className="text-2xl md:text-4xl font-extrabold text-accent-500 mb-1">{stat.value}</div>
                <div className="text-slate-500 text-xs font-semibold uppercase tracking-wider">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
