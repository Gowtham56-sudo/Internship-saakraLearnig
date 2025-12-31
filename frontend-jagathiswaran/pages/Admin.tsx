import React, { useState } from 'react';
import { authAPI } from '../services/apiService';

const Admin: React.FC = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [mode, setMode] = useState<'trainer' | 'admin'>('trainer');

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!name || !email || !password) {
      setError('Name, email, and password are required.');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }

    setLoading(true);
    const createFn = mode === 'trainer' ? authAPI.createTrainer : authAPI.createAdmin;
    const { data, error: apiError } = await createFn(name, email, password, phone || undefined);
    setLoading(false);

    if (apiError) {
      setError(apiError);
      return;
    }

    setSuccess(`${mode === 'trainer' ? 'Trainer' : 'Admin'} created. UID: ${data?.uid || 'created'}`);
    setName('');
    setEmail('');
    setPassword('');
    setPhone('');
  };

  return (
    <div className="p-6 md:p-10 max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-black text-slate-900">Admin Panel</h1>
        <p className="text-slate-500">Create trainer credentials directly.</p>
      </div>

      <div className="bg-white rounded-3xl shadow-sm border border-slate-200 p-6 md:p-8">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <h2 className="text-xl font-bold text-slate-900">Create Account</h2>
            <div className="flex bg-slate-100 p-1 rounded-full text-xs font-bold">
              <button
                type="button"
                onClick={() => setMode('trainer')}
                className={`px-3 py-1 rounded-full ${mode === 'trainer' ? 'bg-white text-indigo-600 shadow' : 'text-slate-500'}`}
              >
                Trainer
              </button>
              <button
                type="button"
                onClick={() => setMode('admin')}
                className={`px-3 py-1 rounded-full ${mode === 'admin' ? 'bg-white text-indigo-600 shadow' : 'text-slate-500'}`}
              >
                Admin
              </button>
            </div>
          </div>
          <span className="px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest bg-indigo-50 text-indigo-600">Admin Only</span>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 text-sm font-semibold rounded-xl">
            {error}
          </div>
        )}

        {success && (
          <div className="mb-4 p-3 bg-green-50 border border-green-200 text-green-700 text-sm font-semibold rounded-xl">
            {success}
          </div>
        )}

        <form className="space-y-4" onSubmit={handleCreate}>
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-1">Full Name</label>
            <input
              type="text"
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              placeholder="Trainer name"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-1">Email</label>
              <input
                type="email"
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                placeholder="trainer@domain.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-1">Phone (optional)</label>
              <input
                type="tel"
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                placeholder="+91 98765 43210"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-bold text-slate-700 mb-1">Password</label>
            <input
              type="password"
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              placeholder="Minimum 6 characters"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <p className="text-xs text-slate-500 mt-1">Password is stored in Firebase Auth; role is set to {mode} automatically.</p>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-lg shadow-lg disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center"
          >
            {loading ? `Creating ${mode}...` : `Create ${mode === 'trainer' ? 'Trainer' : 'Admin'} Account`}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Admin;
