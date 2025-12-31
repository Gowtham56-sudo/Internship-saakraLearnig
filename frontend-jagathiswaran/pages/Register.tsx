
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { User } from '../types';
import { registerWithEmail } from '../src/firebase';
import { authAPI } from '../services/apiService';

interface RegisterProps {
  onRegister: (user: User) => void;
}

const Register: React.FC<RegisterProps> = ({ onRegister }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [institution, setInstitution] = useState('');
  const [department, setDepartment] = useState('');
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    
    if (!name || !email || !password || !institution || !department) {
      setError('Please fill in all required fields.');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }

    if (phone && !/^\d{10}$/.test(phone.replace(/\D/g, ''))) {
      setError('Please enter a valid phone number.');
      return;
    }

    setLoading(true);
    
    try {
      // Step 1: Create Firebase user
      const { user: firebaseUser } = await registerWithEmail(email, password);
      
      // Step 2: Register in backend
      const { data, error: apiError } = await authAPI.register(name, email, password);
      
      if (apiError) {
        setError(apiError);
        setLoading(false);
        return;
      }

      // Step 3: Auto-login after registration
      const userData: User = {
        id: firebaseUser.uid,
        name: name,
        email: email,
        role: 'student', // Default role
        status: 'active',
        avatar: `https://ui-avatars.com/api/?name=${name}&background=random`
      };

      setSuccess('Registration successful! Redirecting to dashboard...');
      setTimeout(() => onRegister(userData), 1500);
      setLoading(false);
    } catch (err: any) {
      // Handle specific Firebase errors
      let errorMessage = err.message || 'Registration failed. Please try again.';
      
      if (err.code === 'auth/email-already-in-use') {
        errorMessage = 'This email is already registered. Please use a different email or try logging in.';
      } else if (err.code === 'auth/invalid-email') {
        errorMessage = 'Please enter a valid email address.';
      } else if (err.code === 'auth/weak-password') {
        errorMessage = 'Password must be at least 6 characters.';
      } else if (err.code === 'auth/operation-not-allowed') {
        errorMessage = 'Registration is currently disabled. Please contact support.';
      }
      
      setError(errorMessage);
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-indigo-50 via-white to-blue-50">
      <div className="w-full max-w-2xl">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-indigo-600 rounded-2xl flex items-center justify-center text-white font-bold text-3xl mx-auto shadow-xl shadow-indigo-200">S</div>
          <h1 className="mt-4 text-4xl font-extrabold text-slate-900">Create Your Account</h1>
          <p className="mt-2 text-slate-600">Join Saakra and begin your academic journey</p>
        </div>

        <div className="bg-white rounded-3xl p-8 shadow-lg border border-slate-100">
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 text-sm font-semibold rounded-xl flex items-start animate-in slide-in-from-top-1">
              <svg className="w-5 h-5 mr-3 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
              {error}
            </div>
          )}

          {success && (
            <div className="mb-6 p-4 bg-green-50 border border-green-200 text-green-700 text-sm font-semibold rounded-xl flex items-start animate-in slide-in-from-top-1">
              <svg className="w-5 h-5 mr-3 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
              {success}
            </div>
          )}
          
          <form className="space-y-5" onSubmit={handleSubmit}>
            {/* Personal Information */}
            <div className="pb-6 border-b border-slate-100">
              <h3 className="text-sm font-bold text-slate-700 uppercase tracking-wider mb-4">Personal Information</h3>
              
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">Full Name <span className="text-red-500">*</span></label>
                <input 
                  type="text" 
                  required
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all"
                  placeholder="John Doe"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">Email Address <span className="text-red-500">*</span></label>
                  <input 
                    type="email" 
                    required
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all"
                    placeholder="john@university.edu"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">Phone Number</label>
                  <input 
                    type="tel" 
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all"
                    placeholder="+91 98765 43210"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                  />
                </div>
              </div>
            </div>

            {/* Academic Information */}
            <div className="pb-6 border-b border-slate-100">
              <h3 className="text-sm font-bold text-slate-700 uppercase tracking-wider mb-4">Academic Information</h3>
              
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">Institution/College <span className="text-red-500">*</span></label>
                <input 
                  type="text" 
                  required
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all"
                  placeholder="Your University Name"
                  value={institution}
                  onChange={(e) => setInstitution(e.target.value)}
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2 mt-4">Department/Program <span className="text-red-500">*</span></label>
                <select 
                  required
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all"
                  value={department}
                  onChange={(e) => setDepartment(e.target.value)}
                >
                  <option value="">Select your department</option>
                  <option value="Computer Science">Computer Science</option>
                  <option value="Information Technology">Information Technology</option>
                  <option value="Electronics">Electronics & Communication</option>
                  <option value="Mechanical">Mechanical Engineering</option>
                  <option value="Civil">Civil Engineering</option>
                  <option value="Business">Business Administration</option>
                  <option value="Science">Science</option>
                  <option value="Arts">Arts</option>
                  <option value="Commerce">Commerce</option>
                  <option value="Other">Other</option>
                </select>
              </div>
            </div>

            {/* Security */}
            <div className="pb-6">
              <h3 className="text-sm font-bold text-slate-700 uppercase tracking-wider mb-4">Security</h3>
              
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">Password <span className="text-red-500">*</span></label>
                <div className="relative">
                  <input 
                    type="password" 
                    required
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all"
                    placeholder="Minimum 6 characters"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </div>
                <p className="text-xs text-slate-500 mt-2">Use at least 6 characters with a mix of letters and numbers</p>
              </div>
            </div>

            {/* Terms */}
            <div className="flex items-start bg-blue-50 p-4 rounded-lg border border-blue-100">
              <input type="checkbox" required className="mt-1 w-4 h-4 text-indigo-600 rounded" />
              <span className="ml-3 text-xs text-slate-700">
                I agree to the <a href="#" className="font-bold text-indigo-600 hover:underline">Terms of Service</a>, <a href="#" className="font-bold text-indigo-600 hover:underline">Privacy Policy</a>, and <a href="#" className="font-bold text-indigo-600 hover:underline">Academic Code of Conduct</a>.
              </span>
            </div>

            <button 
              type="submit"
              disabled={loading}
              className="w-full py-4 bg-gradient-to-r from-indigo-600 to-indigo-700 text-white rounded-lg font-bold hover:from-indigo-700 hover:to-indigo-800 transition-all shadow-lg shadow-indigo-200 disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center"
            >
              {loading ? (
                <>
                  <svg className="animate-spin h-5 w-5 text-white mr-2" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                  Creating your account...
                </>
              ) : (
                <>
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" /></svg>
                  Join Saakra
                </>
              )}
            </button>
          </form>

          <div className="mt-8 text-center">
            <p className="text-sm text-slate-600 mb-2">Already have an account?</p>
            <Link to="/login" className="inline-flex items-center font-bold text-indigo-600 hover:text-indigo-700 transition-colors">
              <span>Sign in instead</span>
              <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7l5 5m0 0l-5 5m5-5H6" /></svg>
            </Link>
          </div>
        </div>

        {/* Footer Info */}
        <div className="mt-6 text-center text-xs text-slate-500">
          <p>By registering, you agree to Saakra's policies. Your data is secure and encrypted.</p>
        </div>
      </div>
    </div>
  );
};

export default Register;
