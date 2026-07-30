import React from 'react';
import { useApp } from '../App';

export default function TermsConditions() {
  const { settings } = useApp();
  const companyName = settings?.general?.company_name || 'Josmar Consulting Engineers';

  return (
    <div className="bg-slate-50 min-h-[85vh] py-12">
      <div className="max-w-3xl mx-auto px-4">
        <div className="card-premium bg-white p-8 md:p-12">
          <h1 className="text-3xl font-bold text-primary-900 mb-6 border-b border-slate-100 pb-4">Terms & Conditions</h1>
          <p className="text-slate-400 text-xs font-semibold mb-6">Last updated: July 18, 2026</p>
          
          <div className="space-y-6 text-slate-600 text-sm leading-relaxed">
            <p>
              Welcome to our website. By accessing and browsing this website, you agree to comply with and be bound by the following terms and conditions of use, which govern {companyName}&apos;s relationship with you in relation to this website.
            </p>

            <h2 className="text-lg font-bold text-primary-900 pt-4">1. Use of Content</h2>
            <p>
              The content of the pages of this website is for your general information and use only. It is subject to change without notice. Unauthorized use of this website may give rise to a claim for damages and/or be a criminal offense.
            </p>

            <h2 className="text-lg font-bold text-primary-900 pt-4">2. Intellectual Property</h2>
            <p>
              This website contains material which is owned by or licensed to us. This material includes, but is not limited to, the design, layout, look, appearance, images, graphics, and case study documents. Reproduction is prohibited other than in accordance with copyright laws.
            </p>

            <h2 className="text-lg font-bold text-primary-900 pt-4">3. Disclaimers</h2>
            <p>
              Neither we nor any third parties provide any warranty or guarantee as to the accuracy, timeliness, performance, completeness, or suitability of the information and engineering materials found or offered on this website for any particular purpose. You acknowledge that such information and materials may contain inaccuracies or errors and we expressly exclude liability for any such inaccuracies or errors to the fullest extent permitted by law.
            </p>

            <h2 className="text-lg font-bold text-primary-900 pt-4">4. Links to Other Websites</h2>
            <p>
              From time to time, this website may also include links to other websites (e.g. credential verification sites or project partner sites). These links are provided for your convenience to provide further information. They do not signify that we endorse the website(s).
            </p>

            <h2 className="text-lg font-bold text-primary-900 pt-4">5. Governing Law</h2>
            <p>
              Your use of this website and any dispute arising out of such use is subject to local building codes, state regulations, and the laws of the jurisdiction in which {companyName} is registered.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
