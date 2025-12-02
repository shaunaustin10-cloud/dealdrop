import React, { useState } from 'react';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../firebaseConfig';
import { useNavigate, Link } from 'react-router-dom';
import { LayoutGrid, ArrowRight, User, Mail, Lock } from 'lucide-react';
import { createUserProfile } from '../services/userService'; // Import the service

export default function RegisterPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [role, setRole] = useState('investor'); // Default role
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // Create the public profile
      await createUserProfile(user.uid, {
        email: user.email,
        displayName: name || email.split('@')[0],
        role: role, // Pass the selected role
      });

      navigate('/dashboard');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 flex items-center justify-center p-4">
      <div className="max-w-md w-full p-8 bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl">
        <div className="flex justify-center mb-6">
           <div className="w-12 h-12 bg-gradient-to-br from-emerald-400 to-cyan-500 rounded-xl flex items-center justify-center shadow-lg shadow-emerald-500/20">
              <LayoutGrid className="text-white" size={24} />
           </div>
        </div>
        <h1 className="text-3xl font-bold text-center text-white mb-2">Join Dealdrop</h1>
        <p className="text-slate-400 text-center mb-8">The Verified Deal Marketplace</p>

        <form onSubmit={handleRegister} className="space-y-5">
          
          {/* Role Selection */}
          <div className="grid grid-cols-2 gap-3 p-1 bg-slate-800 rounded-xl">
            <button
              type="button"
              onClick={() => setRole('investor')}
              className={`py-2 px-4 rounded-lg text-sm font-bold transition-all ${
                role === 'investor' 
                  ? 'bg-slate-700 text-white shadow-sm' 
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              I&apos;m an Investor
            </button>
            <button
              type="button"
              onClick={() => setRole('wholesaler')}
              className={`py-2 px-4 rounded-lg text-sm font-bold transition-all ${
                role === 'wholesaler' 
                  ? 'bg-emerald-600 text-white shadow-sm' 
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              I&apos;m a Wholesaler
            </button>
          </div>

          <div>
            <label className="block text-slate-400 text-xs uppercase tracking-wider mb-1 font-semibold">Full Name</label>
            <div className="relative">
              <User className="absolute left-3 top-3 text-slate-500" size={18} />
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="John Doe"
                required
                className="w-full bg-slate-800 border border-slate-700 rounded-lg py-3 pl-10 pr-4 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all"
              />
            </div>
          </div>

          <div>
            <label className="block text-slate-400 text-xs uppercase tracking-wider mb-1 font-semibold">Email</label>
            <div className="relative">
              <Mail className="absolute left-3 top-3 text-slate-500" size={18} />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                required
                className="w-full bg-slate-800 border border-slate-700 rounded-lg py-3 pl-10 pr-4 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all"
              />
            </div>
          </div>

          <div>
            <label className="block text-slate-400 text-xs uppercase tracking-wider mb-1 font-semibold">Password</label>
            <div className="relative">
              <Lock className="absolute left-3 top-3 text-slate-500" size={18} />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                className="w-full bg-slate-800 border border-slate-700 rounded-lg py-3 pl-10 pr-4 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all"
              />
            </div>
          </div>

          {error && <div className="bg-red-500/10 border border-red-500/50 text-red-400 text-sm p-3 rounded-lg text-center">{error}</div>}
          
          <button 
            type="submit" 
            disabled={loading}
            className="w-full bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white font-bold py-3 rounded-lg shadow-lg shadow-emerald-900/20 flex items-center justify-center gap-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Creating Account...' : (
              <>
                Get Started <ArrowRight size={18} />
              </>
            )}
          </button>

          <div className="text-center pt-4 border-t border-slate-800">
            <p className="text-slate-400 text-sm">
              Already have an account?{' '}
              <Link to="/login" className="text-emerald-400 hover:text-emerald-300 font-bold transition-colors">
                Login
              </Link>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
}
