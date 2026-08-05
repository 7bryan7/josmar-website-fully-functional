import React, { useEffect, useState } from 'react';
import { api } from '../api/client';
import Modal from '../components/Modal';

export default function Careers() {
  const [openings, setOpenings] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Application Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedJob, setSelectedJob] = useState(null);
  
  // Form fields
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [coverLetter, setCoverLetter] = useState('');
  const [resume, setResume] = useState(null);
  
  const [submitting, setSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [submitError, setSubmitError] = useState('');

  useEffect(() => {
    async function loadCareers() {
      try {
        const data = await api.get('/api/public/careers');
        setOpenings(data);
      } catch (e) {
        console.error('Failed to load careers', e);
      } finally {
        setLoading(false);
      }
    }
    loadCareers();
  }, []);

  const openApplyModal = (job) => {
    setSelectedJob(job);
    setName('');
    setEmail('');
    setCoverLetter('');
    setResume(null);
    setSubmitSuccess(false);
    setSubmitError('');
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!resume) {
      setSubmitError('Please select a resume file.');
      return;
    }

    // Validate file type
    const allowedTypes = ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
    if (!allowedTypes.includes(resume.type)) {
      setSubmitError('Only PDF and DOCX files are allowed.');
      return;
    }

    // Validate file size < 5MB
    if (resume.size > 5 * 1024 * 1024) {
      setSubmitError('File size must be less than 5MB.');
      return;
    }

    setSubmitting(true);
    setSubmitError('');

    try {
      const formData = new FormData();
      formData.append('career_id', selectedJob.id);
      formData.append('applicant_name', name);
      formData.append('applicant_email', email);
      formData.append('cover_letter', coverLetter);
      formData.append('resume', resume);

      const res = await fetch('/api/public/careers/apply', {
        method: 'POST',
        body: formData,
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({ error: 'Submission failed' }));
        throw new Error(err.error || 'Failed to submit application.');
      }

      setSubmitSuccess(true);
      setTimeout(() => {
        setIsModalOpen(false);
      }, 2500);
    } catch (err) {
      setSubmitError(err.message || 'An error occurred during submission.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-32">
        <div className="w-10 h-10 border-4 border-accent-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="bg-slate-50 min-h-[80vh] py-12">
      <div className="max-w-4xl mx-auto px-4">
        
        {/* Title */}
        <div className="text-center mb-16">
          <h1 className="text-4xl font-bold text-primary-900 tracking-tight mb-4">Join Our Team</h1>
          <p className="text-slate-500 max-w-xl mx-auto text-md font-semibold">
            We are always seeking talented structural, civil, and environmental engineers who value technical excellence.
          </p>
        </div>

        {/* Job Openings List */}
        <div className="space-y-6">
          {openings.map((job) => (
            <div key={job.id} className="card-premium bg-white p-6 md:p-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
              <div className="space-y-2">
                <h2 className="text-xl font-bold text-primary-900">{job.title}</h2>
                <div className="flex flex-wrap gap-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  <span>Location: {job.location}</span>
                  <span>•</span>
                  <span>Experience: {job.experience}</span>
                </div>
                <p className="text-slate-600 text-sm leading-relaxed max-w-xl pt-2">{job.description}</p>
              </div>

              <button
                onClick={() => openApplyModal(job)}
                className="button-primary text-xs font-bold uppercase tracking-wider whitespace-nowrap self-stretch md:self-auto"
              >
                Apply Now
              </button>
            </div>
          ))}

          {openings.length === 0 && (
            <div className="text-center py-20 text-slate-500 font-medium bg-white rounded-2xl border border-slate-100 border-dashed">
              No data available for now
            </div>
          )}
        </div>

      </div>

      {/* Apply Modal */}
      {selectedJob && (
        <Modal
          isOpen={isModalOpen}
          onClose={() => !submitting && setIsModalOpen(false)}
          title={`Apply for ${selectedJob.title}`}
          size="md"
        >
          {submitSuccess ? (
            <div className="text-center py-8">
              <div className="w-12 h-12 bg-green-50 text-green-500 rounded-full flex items-center justify-center mx-auto mb-4 font-bold text-xl">✓</div>
              <h3 className="font-bold text-lg text-primary-900">Application Submitted!</h3>
              <p className="text-slate-500 text-sm mt-2">Thank you for applying. We will review your resume shortly.</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase text-slate-500 mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm bg-slate-50 focus:outline-none focus:ring-1 focus:ring-accent-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-slate-500 mb-1">Email Address</label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm bg-slate-50 focus:outline-none focus:ring-1 focus:ring-accent-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-slate-500 mb-1">Cover Letter (Optional)</label>
                <textarea
                  rows={4}
                  value={coverLetter}
                  onChange={(e) => setCoverLetter(e.target.value)}
                  placeholder="Tell us why you'd be a great fit for Josmar..."
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm bg-slate-50 focus:outline-none focus:ring-1 focus:ring-accent-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-slate-500 mb-1">Upload Resume (PDF or DOCX, Max 5MB)</label>
                <input
                  type="file"
                  required
                  accept=".pdf,.docx"
                  onChange={(e) => setResume(e.target.files[0])}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs bg-slate-50 focus:outline-none"
                />
              </div>

              {submitError && (
                <div className="text-red-500 text-xs font-bold">{submitError}</div>
              )}

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  disabled={submitting}
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 border border-slate-200 text-slate-600 rounded-lg text-sm font-semibold hover:bg-slate-50 disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="button-primary text-sm font-bold disabled:opacity-50"
                >
                  {submitting ? 'Submitting...' : 'Submit Application'}
                </button>
              </div>
            </form>
          )}
        </Modal>
      )}
    </div>
  );
}
