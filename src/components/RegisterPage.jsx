import React, { useState } from 'react';
import { createUserWithEmailAndPassword, signInWithPopup, GoogleAuthProvider } from 'firebase/auth';
import { auth } from '../firebaseConfig';
import { useNavigate, Link } from 'react-router-dom';
import { LayoutGrid, ArrowRight, User, Mail, Lock, Check } from 'lucide-react';
import { createUserProfile } from '../services/userService'; 

export default function RegisterPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [role, setRole] = useState('investor'); 
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState('');
  const navigate = useNavigate();

  const handleGoogleSignIn = async () => {
    setError('');
    setLoading(true);
    setStatus('Connecting to Google...');
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      const user = result.user;
      
      setStatus('Setting up your profile...');
      // Create/Update profile with selected role
      await createUserProfile(user.uid, {
        email: user.email,
        displayName: user.displayName,
        photoURL: user.photoURL,
        role: role, 
      });
      
      setStatus('Redirecting...');
      navigate('/dashboard');
    } catch (err) {
      console.error("Google Sign-In Error Full Object:", err);
      console.error("Google Sign-In Error Code:", err.code);
      console.error("Google Sign-In Error Message:", err.message);
      setError(`Google Sign-In failed: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    setStatus('Creating your account...');

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      setStatus('Setting up your profile and credits...');
      
      await createUserProfile(user.uid, {
        email: user.email,
        displayName: name || email.split('@')[0],
        role: role, 
      });

      setStatus('Redirecting to dashboard...');
      navigate('/dashboard');
    } catch (err) {
      setError(err.message);
      setStatus('');
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
        <p className="text-slate-400 text-center mb-8">Analyze. Validate. Close.</p>

        <form onSubmit={handleRegister} className="space-y-5">
          
          {/* Role Selection */}
          <div>
            <label className="block text-slate-400 text-xs uppercase tracking-wider mb-2 font-semibold">I am primarily a...</label>
            <div className="grid grid-cols-1 gap-2">
              <button
                type="button"
                onClick={() => setRole('investor')}
                className={`flex items-center gap-3 p-3 rounded-xl border text-left transition-all ${
                  role === 'investor' 
                    ? 'bg-emerald-500/10 border-emerald-500 text-emerald-400 ring-1 ring-emerald-500' 
                    : 'bg-slate-800 border-slate-700 text-slate-400 hover:bg-slate-700 hover:text-slate-200'
                }`}
              >
                <div className={`p-2 rounded-lg ${role === 'investor' ? 'bg-emerald-500 text-white' : 'bg-slate-700 text-slate-500'}`}>
                   <User size={18} />
                </div>
                <div>
                   <div className="text-sm font-bold text-white">Real Estate Investor</div>
                   <div className="text-xs opacity-70">I buy, flip, or hold properties.</div>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setRole('wholesaler')}
                className={`flex items-center gap-3 p-3 rounded-xl border text-left transition-all ${
                  role === 'wholesaler' 
                    ? 'bg-blue-500/10 border-blue-500 text-blue-400 ring-1 ring-blue-500' 
                    : 'bg-slate-800 border-slate-700 text-slate-400 hover:bg-slate-700 hover:text-slate-200'
                }`}
              >
                <div className={`p-2 rounded-lg ${role === 'wholesaler' ? 'bg-blue-500 text-white' : 'bg-slate-700 text-slate-500'}`}>
                   <LayoutGrid size={18} />
                </div>
                <div>
                   <div className="text-sm font-bold text-white">Wholesaler</div>
                   <div className="text-xs opacity-70">I find and assign off-market deals.</div>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setRole('agent')}
                className={`flex items-center gap-3 p-3 rounded-xl border text-left transition-all ${
                  role === 'agent' 
                    ? 'bg-purple-500/10 border-purple-500 text-purple-400 ring-1 ring-purple-500' 
                    : 'bg-slate-800 border-slate-700 text-slate-400 hover:bg-slate-700 hover:text-slate-200'
                }`}
              >
                <div className={`p-2 rounded-lg ${role === 'agent' ? 'bg-purple-500 text-white' : 'bg-slate-700 text-slate-500'}`}>
                   <User size={18} />
                </div>
                <div>
                   <div className="text-sm font-bold text-white">Real Estate Agent</div>
                   <div className="text-xs opacity-70">I list homes and represent clients.</div>
                </div>
              </button>
            </div>
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
            {loading ? status : (
              <>
                Get Started <ArrowRight size={18} />
              </>
            )}
          </button>

          <div className="relative flex py-2 items-center">
            <div className="flex-grow border-t border-slate-800"></div>
            <span className="flex-shrink-0 mx-4 text-slate-500 text-xs">OR</span>
            <div className="flex-grow border-t border-slate-800"></div>
          </div>

          <button
            type="button"
            onClick={handleGoogleSignIn}
            disabled={loading}
            className="w-full bg-white hover:bg-slate-100 text-slate-900 font-bold py-3 rounded-lg shadow-lg flex items-center justify-center gap-2 transition-all disabled:opacity-50"
          >
            <img src="https://www.google.com/favicon.ico" alt="Google" className="w-5 h-5" />
            Sign up with Google
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
