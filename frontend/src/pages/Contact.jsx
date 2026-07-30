import React, { useState } from 'react';
import { useApp } from '../App';
import { PhoneIcon, EnvelopeIcon, MapPinIcon, ClockIcon } from '@heroicons/react/24/outline';

export default function Contact() {
  const { settings } = useApp();
  const contact = settings?.contact || {};

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  // Handle phone list parsing
  let phoneList = [];
  try {
    phoneList = typeof contact.phone_numbers === 'string' ? JSON.parse(contact.phone_numbers) : contact.phone_numbers || [];
    if (!Array.isArray(phoneList)) phoneList = [phoneList];
  } catch(e) {
    phoneList = [contact.phone_numbers];
  }

  // Handle email list parsing
  let emailList = [];
  try {
    emailList = typeof contact.emails === 'string' ? JSON.parse(contact.emails) : contact.emails || [];
    if (!Array.isArray(emailList)) emailList = [emailList];
  } catch(e) {
    emailList = [contact.emails];
  }

  // Handle business hours object
  let hoursObj = {};
  try {
    hoursObj = typeof contact.business_hours === 'string' ? JSON.parse(contact.business_hours) : contact.business_hours || {};
  } catch(e) {
    hoursObj = { hours: contact.business_hours };
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');

    try {
      const res = await fetch('/api/public/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, phone, subject, message }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({ error: 'Request failed' }));
        throw new Error(err.error || 'Failed to submit contact form.');
      }

      setSuccess(true);
      setName('');
      setEmail('');
      setPhone('');
      setSubject('');
      setMessage('');
      setTimeout(() => setSuccess(false), 5000);
    } catch (err) {
      setError(err.message || 'An error occurred. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="bg-slate-50 min-h-[80vh] py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Title */}
        <div className="text-center mb-16">
          <h1 className="text-4xl font-bold text-primary-900 tracking-tight mb-4">Contact Our Offices</h1>
          <p className="text-slate-500 max-w-xl mx-auto text-md font-semibold">
            Evaluate your upcoming engineering projects or request professional consultations.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
          {/* Info Card Grid */}
          <div className="lg:col-span-1 space-y-6">
            
            {/* Phone numbers */}
            <div className="card-premium bg-white p-6 flex gap-4 items-start">
              <div className="h-10 w-10 bg-accent-50 text-accent-500 rounded-lg flex items-center justify-center flex-shrink-0">
                <PhoneIcon className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-bold text-primary-900 mb-1 text-sm uppercase tracking-wider">Phone Numbers</h3>
                {phoneList.map((ph, idx) => (
                  <p key={idx} className="text-slate-600 text-sm">{ph}</p>
                ))}
              </div>
            </div>

            {/* Email addresses */}
            <div className="card-premium bg-white p-6 flex gap-4 items-start">
              <div className="h-10 w-10 bg-accent-50 text-accent-500 rounded-lg flex items-center justify-center flex-shrink-0">
                <EnvelopeIcon className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-bold text-primary-900 mb-1 text-sm uppercase tracking-wider">Emails</h3>
                {emailList.map((em, idx) => (
                  <a key={idx} href={`mailto:${em}`} className="text-accent-500 hover:text-accent-600 block text-sm">{em}</a>
                ))}
              </div>
            </div>

            {/* Physical office address */}
            <div className="card-premium bg-white p-6 flex gap-4 items-start">
              <div className="h-10 w-10 bg-accent-50 text-accent-500 rounded-lg flex items-center justify-center flex-shrink-0">
                <MapPinIcon className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-bold text-primary-900 mb-1 text-sm uppercase tracking-wider">Office Address</h3>
                <p className="text-slate-600 text-sm leading-relaxed">{contact.office_address}</p>
              </div>
            </div>

            {/* Business Hours */}
            <div className="card-premium bg-white p-6 flex gap-4 items-start">
              <div className="h-10 w-10 bg-accent-50 text-accent-500 rounded-lg flex items-center justify-center flex-shrink-0">
                <ClockIcon className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-bold text-primary-900 mb-1 text-sm uppercase tracking-wider">Business Hours</h3>
                {Object.entries(hoursObj).map(([day, hrs]) => (
                  <p key={day} className="text-slate-600 text-sm">
                    <span className="capitalize font-semibold text-slate-400 mr-1">{day}:</span> {hrs}
                  </p>
                ))}
              </div>
            </div>

          </div>

          {/* Form Card */}
          <div className="lg:col-span-2 card-premium bg-white p-8">
            <h2 className="text-xl font-bold text-primary-900 mb-6">Send A Request</h2>
            
            {success ? (
              <div className="bg-green-50 border border-green-100 rounded-xl p-6 text-center text-green-800">
                <div className="w-10 h-10 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-3 font-bold text-lg">✓</div>
                <h4 className="font-bold">Message Sent Successfully!</h4>
                <p className="text-xs text-green-600 mt-1">Our engineering team will get in touch with you shortly.</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold uppercase text-slate-400 mb-1">Full Name</label>
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm bg-slate-50 focus:outline-none focus:ring-1 focus:ring-accent-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase text-slate-400 mb-1">Email Address</label>
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm bg-slate-50 focus:outline-none focus:ring-1 focus:ring-accent-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold uppercase text-slate-400 mb-1">Phone Number (Optional)</label>
                    <input
                      type="text"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm bg-slate-50 focus:outline-none focus:ring-1 focus:ring-accent-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase text-slate-400 mb-1">Subject</label>
                    <input
                      type="text"
                      required
                      value={subject}
                      onChange={(e) => setSubject(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm bg-slate-50 focus:outline-none focus:ring-1 focus:ring-accent-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase text-slate-400 mb-1">Message Detail</label>
                  <textarea
                    rows={5}
                    required
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Describe your project requirements or general inquiry..."
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm bg-slate-50 focus:outline-none focus:ring-1 focus:ring-accent-500"
                  />
                </div>

                {error && <div className="text-red-500 text-xs font-bold">{error}</div>}

                <div className="pt-4 flex justify-end">
                  <button
                    type="submit"
                    disabled={submitting}
                    className="button-primary font-bold text-xs uppercase tracking-wider"
                  >
                    {submitting ? 'Sending...' : 'Send Message'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>

        {/* Google Maps Embed */}
        {contact.google_maps_embed && (
          <div className="card-premium h-96 w-full shadow-soft rounded-2xl overflow-hidden border border-slate-100">
            <iframe
              src={contact.google_maps_embed}
              width="100%"
              height="100%"
              style={{ border: 0 }}
              allowFullScreen=""
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              title="Office Location Map"
            />
          </div>
        )}

      </div>
    </div>
  );
}
