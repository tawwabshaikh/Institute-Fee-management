import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { GraduationCap, Eye, EyeOff, Loader2 } from 'lucide-react';
import { useApp } from '../store/AppContext';

export function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [remember, setRemember] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { dispatch } = useApp();
  const navigate = useNavigate();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!email.trim()) { setError('Email is required'); return; }
    if (!password.trim()) { setError('Password is required'); return; }

    setLoading(true);
    setTimeout(() => {
      if (email === 'admin@nc2.com' && password === 'admin123') {
        dispatch({ type: 'LOGIN' });
        navigate('/');
      } else {
        setError('Invalid email or password');
        setLoading(false);
      }
    }, 800);
  };

  return (
    <div className="min-h-screen bg-bg flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 bg-emerald-900 rounded-2xl mb-4">
            <GraduationCap className="w-7 h-7 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-text-primary">𝗡𝗖² Institute</h1>
          <p className="text-sm text-text-secondary mt-1">Fee Management System</p>
        </div>

        {/* Form */}
        <div className="bg-surface border border-border rounded-2xl shadow-sm p-8">
          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                {error}
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-text-primary mb-1.5">Email</label>
              <input
                type="email" value={email} onChange={e => setEmail(e.target.value)}
                placeholder="admin@𝗡𝗖².com"
                className="w-full px-4 py-2.5 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-700/30 focus:border-emerald-700"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-text-primary mb-1.5">Password</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)}
                  placeholder="Enter password"
                  className="w-full px-4 py-2.5 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-700/30 focus:border-emerald-700 pr-10"
                />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-text-secondary hover:text-text-primary">
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={remember} onChange={e => setRemember(e.target.checked)} className="w-4 h-4 rounded border-gray-300 text-emerald-700 focus:ring-emerald-700" />
                <span className="text-sm text-text-secondary">Remember me</span>
              </label>
            </div>

            <button
              type="submit" disabled={loading}
              className="w-full bg-emerald-900 text-white py-2.5 rounded-lg font-medium text-sm hover:bg-emerald-800 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loading && <Loader2 className="w-4 h-4 animate-spin" />}
              {loading ? 'Signing in...' : 'Login'}
            </button>
          </form>

          <div className="mt-6 p-3 bg-gray-50 rounded-lg">
            <p className="text-xs text-text-secondary text-center">
              Demo credentials: <span className="font-mono font-medium">admin@𝗡𝗖².com</span> / <span className="font-mono font-medium">admin123</span>
            </p>
          </div>
        </div>

        <p className="text-center text-xs text-text-secondary mt-6">
  © 2026 𝗡𝗖² Institute. All rights reserved. Design & Created By{" "}
  <a 
    href="https://www.tawwab.dev" 
    target="_blank" 
    rel="noopener noreferrer" 
    className="hover:underline hover:text-blue-500 transition-colors"
  >
    Tawwab Shaikh
  </a>
</p>
      </div>
    </div>
  );
}
