import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useApp } from '../App';

export default function Login() {
  const { login, user } = useApp();
  const navigate = useNavigate();
  const location = useLocation();

  const [isSetup, setIsSetup] = useState(false);
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const from = location.state?.from?.pathname || '/admin';

  // Check if setup is required on mount
  useEffect(() => {
    if (user) {
      navigate(from, { replace: true });
    }
    
    // Call setup check API
    async function checkSetup() {
      try {
        const res = await fetch('/api/auth/setup');
        const data = await res.json();
        setIsSetup(data.needsSetup === true);
      } catch (e) {
        setIsSetup(false);
      }
    }
    checkSetup();
  }, [user, navigate, from]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      if (isSetup) {
        // Run setup
        if (password !== confirmPassword) {
          throw new Error('Passwords do not match');
        }
        const res = await fetch('/api/auth/setup', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ username, email, password }),
        });
        
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Setup failed');
        
        // Auto-login after setup
        await login(username, password);
        navigate(from, { replace: true });
      } else {
        // Run standard login
        await login(username, password);
        navigate(from, { replace: true });
      }
    } catch (err) {
      setError(err.message || 'Authentication failed. Check parameters.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-900 px-4 py-12">
      <div className="max-w-md w-full text-white bg-slate-950 p-8 rounded-2xl border border-slate-800 shadow-2xl">
        <div className="text-center mb-8">
          <div className="h-12 w-12 bg-accent-500 text-white flex items-center justify-center font-bold text-xl rounded-xl mx-auto mb-4">J</div>
          <h2 className="text-2xl font-bold tracking-tight text-white">
            {isSetup ? 'Initial CMS Setup' : 'Josmar CMS Control Panel'}
          </h2>
          <p className="text-slate-400 text-xs mt-1.5 leading-normal">
            {isSetup 
              ? 'Create the primary administrator account for the consulting website.' 
              : 'Log in with your administrator username to update corporate pages.'}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1">Username</label>
            <input
              type="text"
              required
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full px-3 py-2 border border-slate-800 bg-slate-900 rounded-lg text-sm text-white focus:outline-none focus:ring-1 focus:ring-accent-500"
            />
          </div>

          {isSetup && (
            <div>
              <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1">Email Address</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3 py-2 border border-slate-800 bg-slate-900 rounded-lg text-sm text-white focus:outline-none focus:ring-1 focus:ring-accent-500"
              />
            </div>
          )}

          <div>
            <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1">Password</label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3 py-2 border border-slate-800 bg-slate-900 rounded-lg text-sm text-white focus:outline-none focus:ring-1 focus:ring-accent-500"
            />
          </div>

          {isSetup && (
            <div>
              <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1">Confirm Password</label>
              <input
                type="password"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full px-3 py-2 border border-slate-800 bg-slate-900 rounded-lg text-sm text-white focus:outline-none focus:ring-1 focus:ring-accent-500"
              />
            </div>
          )}

          {error && <div className="text-red-500 text-xs font-semibold">{error}</div>}

          <div className="pt-4">
            <button
              type="submit"
              disabled={loading}
              className="w-full button-primary text-xs font-bold uppercase tracking-wider disabled:opacity-50"
            >
              {loading ? 'Processing...' : (isSetup ? 'Create Account & Log In' : 'Sign In')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
