import React from 'react';
import { Link } from 'react-router-dom';

export default function NotFound() {
  return (
    <div className="bg-slate-50 min-h-[70vh] flex items-center justify-center py-12 px-4">
      <div className="max-w-md w-full text-center bg-white p-8 rounded-2xl shadow-soft border border-slate-100">
        <div className="h-16 w-16 bg-accent-50 text-accent-500 rounded-full flex items-center justify-center mx-auto mb-6 text-2xl font-bold">
          404
        </div>
        <h1 className="text-2xl font-bold text-primary-900 mb-3">Page Not Found</h1>
        <p className="text-slate-500 text-sm mb-8 leading-relaxed">
          The engineering resource or page you are requesting could not be located. It may have been moved, renamed, or deleted in the CMS.
        </p>
        <Link to="/" className="button-primary w-full text-sm font-semibold">
          Return to Homepage
        </Link>
      </div>
    </div>
  );
}
