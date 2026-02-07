import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { signInWithEmailAndPassword, signInWithPopup, GoogleAuthProvider } from 'firebase/auth';
import { auth } from '../firebaseConfig';
import { useAuth } from '../context/AuthContext';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      navigate('/dashboard');
    }
  }, [user, navigate]);

  const handleGoogleSignIn = async () => {
    try {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
      // Navigation handled by useEffect when user state updates
    } catch (err) {
      console.error("Google Sign-In Error Full Object:", err);
      console.error("Google Sign-In Error Code:", err.code);
      console.error("Google Sign-In Error Message:", err.message);
      setError(`Google Sign-In failed: ${err.message}`);
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      await signInWithEmailAndPassword(auth, email, password);
      // Navigation handled by useEffect
    } catch (error) {
      console.error("Login Error:", error);
      setError(error.message);
    }
  };

  return (
    <div className="min-h-screen bg-midnight text-slate-200 flex items-center justify-center">
      <div className="max-w-md w-full p-8 bg-midnight border border-slate-800 rounded-2xl shadow-2xl">
        <h1 className="text-3xl font-bold text-center text-white mb-8">Login to Your Account</h1>
        <form onSubmit={handleLogin} className="space-y-6">
          <div>
            <label className="block text-slate-400 text-xs uppercase tracking-wider mb-1 font-semibold">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="w-full bg-slate-800 border border-slate-700 rounded-lg py-3 px-4 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all"
            />
          </div>
          <div>
            <label className="block text-slate-400 text-xs uppercase tracking-wider mb-1 font-semibold">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full bg-slate-800 border border-slate-700 rounded-lg py-3 px-4 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all"
            />
          </div>
          {error && <p className="text-red-500 text-sm">{error}</p>}
          
          <button type="submit" className="w-full bg-emerald-500 hover:bg-emerald-600 text-white font-bold py-3 rounded-lg mt-4 shadow-lg shadow-emerald-900/20 transition-all">
            Login
          </button>

          <div className="relative flex py-2 items-center">
            <div className="flex-grow border-t border-slate-800"></div>
            <span className="flex-shrink-0 mx-4 text-slate-500 text-xs">OR</span>
            <div className="flex-grow border-t border-slate-800"></div>
          </div>

          <button
            type="button"
            onClick={handleGoogleSignIn}
            className="w-full bg-white hover:bg-slate-100 text-slate-900 font-bold py-3 rounded-lg shadow-lg flex items-center justify-center gap-2 transition-all"
          >
            <img src="https://www.google.com/favicon.ico" alt="Google" className="w-5 h-5" />
            Sign in with Google
          </button>

          <div className="text-center mt-4">
            <p className="text-slate-400 text-sm">
              Don&apos;t have an account?{' '}
              <Link to="/register" className="text-emerald-400 hover:text-emerald-300 font-semibold">
                Register
              </Link>
            </p>
          </div>
          
          <div className="mt-8 pt-8 border-t border-slate-800 text-center">
             <button
               type="button" 
               onClick={async () => {
                  if(!confirm("This will clear all local data (including broken login sessions) and refresh the page. Continue?")) return;
                  try {
                      localStorage.clear();
                      sessionStorage.clear();
                      // Attempt to clear Firebase IndexedDB
                      if (window.indexedDB && window.indexedDB.databases) {
                          const dbs = await window.indexedDB.databases();
                          dbs.forEach(db => {
                              if (db.name && db.name.includes('firebase')) {
                                  window.indexedDB.deleteDatabase(db.name);
                              }
                          });
                      }
                  } catch (e) { console.error("Reset error", e); }
                  window.location.href = '/login';
               }}
               className="text-xs text-slate-600 hover:text-slate-400 underline transition-colors"
             >
               Troubleshoot: Reset App Data
             </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default LoginPage;
