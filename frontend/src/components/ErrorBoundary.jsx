import React from 'react';

export class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('[ErrorBoundary] Caught runtime error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="max-w-4xl mx-auto my-16 px-4 text-center">
          <div className="bg-red-50 border border-red-200 rounded-2xl p-8 shadow-sm">
            <h2 className="text-red-800 font-bold text-lg mb-2">Application Error</h2>
            <p className="text-slate-600 text-sm mb-6">
              A critical runtime error occurred while rendering the page.
            </p>
            <div className="bg-slate-900 text-slate-100 font-mono text-xs p-4 rounded-lg text-left overflow-x-auto max-w-lg mx-auto mb-6">
              {this.state.error?.stack || this.state.error?.toString() || 'Unknown React error'}
            </div>
            <div className="flex justify-center gap-4">
              <button 
                onClick={() => window.location.reload()} 
                className="bg-accent-500 text-white font-bold text-xs px-6 py-2.5 rounded-lg hover:bg-accent-600 transition-colors"
              >
                Reload Application
              </button>
              <button 
                onClick={() => {
                  this.setState({ hasError: false, error: null });
                  window.location.href = '/';
                }}
                className="bg-slate-900 text-white font-bold text-xs px-6 py-2.5 rounded-lg hover:bg-slate-800 transition-colors"
              >
                Go to Home
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
