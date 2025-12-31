
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { User } from '../types';
import { loginWithEmail } from '../src/firebase';
import { authAPI } from '../services/apiService';

interface LoginProps {
  onLogin: (user: User) => void;
}

const Login: React.FC<LoginProps> = ({ onLogin }) => {
  const [role, setRole] = useState<'student' | 'trainer' | 'admin'>('student');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleRoleChange = (newRole: 'student' | 'trainer' | 'admin') => {
    setRole(newRole);
    setError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!email.includes('@')) {
      setError('Please enter a valid email address.');
      return;
    }

    if (!password) {
      setError('Please enter your password.');
      return;
    }

    setLoading(true);
    
    try {
      // Step 1: Authenticate with Firebase
      const { user: firebaseUser } = await loginWithEmail(email, password);
      
      // Step 2: Get user data from backend
      const { data, error: apiError } = await authAPI.login(firebaseUser.uid);
      
      if (apiError) {
        setError(apiError);
        setLoading(false);
        return;
      }

      // Step 3: Verify role matches
      if (data.role !== role) {
        setError(`This account is registered as ${data.role}, not ${role}.`);
        setLoading(false);
        return;
      }

      // Step 4: Login successful
      const userData: User = {
        id: firebaseUser.uid,
        name: data.user.name || email.split('@')[0],
        email: email,
        role: data.role,
        status: 'active',
        avatar: `https://ui-avatars.com/api/?name=${data.user.name || email.split('@')[0]}&background=${role === 'admin' ? '334155' : role === 'trainer' ? '4f46e5' : '6366f1'}&color=fff`
      };

      onLogin(userData);
      setLoading(false);
    } catch (err: any) {
      setError(err.message || 'Login failed. Please check your credentials.');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-slate-100">
      <div className="w-full max-w-md animate-in fade-in zoom-in-95 duration-500">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-indigo-600 rounded-2xl flex items-center justify-center text-white font-bold text-3xl mx-auto shadow-xl shadow-indigo-200">S</div>
          <h1 className="mt-6 text-3xl font-extrabold text-slate-900 tracking-tight">Welcome to Saakra</h1>
          <p className="mt-2 text-slate-600">Secure access to your learning environment</p>
        </div>

        {/* Role Switcher */}
        <div className="flex bg-slate-200 p-1 rounded-2xl mb-6 shadow-inner relative z-10 overflow-hidden">
          {['student', 'trainer', 'admin'].map((r) => (
            <button
              key={r}
              onClick={() => handleRoleChange(r as any)}
              className={`flex-1 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all z-10 ${
                role === r ? 'bg-white text-indigo-600 shadow-sm scale-100' : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              {r}
            </button>
          ))}
        </div>

        <div className="bg-white rounded-3xl p-8 shadow-xl shadow-slate-200/50 border border-slate-200/60 backdrop-blur-sm">
          <form className="space-y-6" onSubmit={handleSubmit}>
            {error && (
              <div className="p-3 bg-red-50 border border-red-100 text-red-600 text-xs font-bold rounded-xl flex items-center animate-in slide-in-from-top-1">
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                {error}
              </div>
            )}
            
            <div className={`p-4 rounded-2xl border mb-2 flex items-center space-x-3 transition-all duration-500 ${
              role === 'admin' ? 'bg-slate-900 border-slate-800' : 
              role === 'trainer' ? 'bg-indigo-600 border-indigo-500' : 'bg-blue-50 border-blue-100'
            }`}>
              <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                role === 'admin' ? 'bg-slate-800 text-white' : 
                role === 'trainer' ? 'bg-indigo-700 text-white' : 'bg-blue-600 text-white'
              }`}>
                {role === 'admin' && <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 11c0 3.517-1.009 6.799-2.753 9.571m-3.44-2.04l.054-.09A10.003 10.003 0 0014.243 3H9.757a10.003 10.003 0 00-7.857 7.441l.054.09A10.003 10.003 0 0012 21v-4a2 2 0 110-4h2a2 2 0 012 2v4a10.003 10.003 0 007.857-7.441l-.054-.09a10.003 10.003 0 00-7.857-7.441" /></svg>}
                {role === 'trainer' && <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg>}
                {role === 'student' && <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>}
              </div>
              <div className={role === 'admin' || role === 'trainer' ? 'text-white' : 'text-blue-900'}>
                <p className="text-[10px] font-bold uppercase tracking-tighter opacity-60">Identity</p>
                <p className="text-sm font-black capitalize">{role} Account</p>
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold text-slate-700 mb-1.5">Email Address</label>
              <input 
                type="email" 
                required
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all placeholder-slate-400"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-1.5">Password</label>
              <input 
                type="password" 
                required
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all placeholder-slate-400"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            <button 
              type="submit"
              disabled={loading}
              className={`w-full py-4 text-white rounded-xl font-bold active:scale-[0.98] transition-all shadow-lg disabled:opacity-70 flex items-center justify-center ${
                role === 'admin' ? 'bg-slate-900 hover:bg-slate-800 shadow-slate-200' : 
                role === 'trainer' ? 'bg-indigo-600 hover:bg-indigo-700 shadow-indigo-100' : 
                'bg-blue-600 hover:bg-blue-700 shadow-blue-100'
              }`}
            >
              {loading ? (
                <svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
              ) : `Sign In as ${role}`}
            </button>
          </form>

          <p className="mt-8 text-center text-sm text-slate-500">
            Forgot password? <a href="#" className="font-bold text-indigo-600 hover:text-indigo-500">Reset via email</a>
          </p>

          {role === 'student' ? (
            <div className="mt-6 pt-6 border-t border-slate-200 text-center">
              <p className="text-sm text-slate-600 mb-3">Don't have an account?</p>
              <Link 
                to="/register" 
                className="inline-flex items-center justify-center px-4 py-2.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-600 font-bold rounded-lg transition-colors border border-indigo-200"
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" /></svg>
                Create New Account
              </Link>
            </div>
          ) : (
            <div className="mt-6 pt-6 border-t border-slate-200 text-center">
              <p className="text-sm text-slate-600">Trainer/Admin accounts are issued by the administrator.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Login;
