import React from 'react';
import { useApp } from '../App';

export default function PrivacyPolicy() {
  const { settings } = useApp();
  const companyName = settings?.general?.company_name || 'Josmar Consulting Engineers';

  return (
    <div className="bg-slate-50 min-h-[85vh] py-12">
      <div className="max-w-3xl mx-auto px-4">
        <div className="card-premium bg-white p-8 md:p-12">
          <h1 className="text-3xl font-bold text-primary-900 mb-6 border-b border-slate-100 pb-4">Privacy Policy</h1>
          <p className="text-slate-400 text-xs font-semibold mb-6">Last updated: July 18, 2026</p>
          
          <div className="space-y-6 text-slate-600 text-sm leading-relaxed">
            <p>
              At {companyName}, we respect your privacy and are committed to protecting the personal information you share with us. This policy describes how we collect, store, use, and protect your information when you use our website, send inquiry forms, or submit job applications.
            </p>

            <h2 className="text-lg font-bold text-primary-900 pt-4">1. Information We Collect</h2>
            <p>
              We collect information you provide directly to us through forms, email subscriptions, and applications:
            </p>
            <ul className="list-disc pl-5 space-y-2">
              <li><strong>Contact Information:</strong> Name, email address, phone number, and mailing address.</li>
              <li><strong>Employment Profile:</strong> Resume files, cover letters, experience details, and email addresses.</li>
              <li><strong>Inquiry Content:</strong> Subject lines, message descriptions, and business details.</li>
            </ul>

            <h2 className="text-lg font-bold text-primary-900 pt-4">2. How We Use Your Information</h2>
            <p>
              We use the collected information for specific, legitimate business purposes:
            </p>
            <ul className="list-disc pl-5 space-y-2">
              <li>To evaluate and respond to service requests and project consultations.</li>
              <li>To process and review job applications.</li>
              <li>To maintain communication and safety operations.</li>
              <li>To compile aggregate statistics regarding site usage.</li>
            </ul>

            <h2 className="text-lg font-bold text-primary-900 pt-4">3. Storage & Security</h2>
            <p>
              All personal information, database metadata, and resume files are stored securely within Cloudflare D1 and R2 infrastructures. We implement security protocols (JWT validation, HTTPS protocols, and input sanitization) to prevent unauthorized access, alterations, or disclosures of your records.
            </p>

            <h2 className="text-lg font-bold text-primary-900 pt-4">4. Sharing Your Data</h2>
            <p>
              We do not sell, rent, or trade your personal information with third parties. We only share details with trusted hosting platforms (such as Cloudflare) solely for operating this web application.
            </p>

            <h2 className="text-lg font-bold text-primary-900 pt-4">5. Contact Us</h2>
            <p>
              If you have any questions about this Privacy Policy or wish to request deletion of your records, please contact us at info@josmar.com.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
