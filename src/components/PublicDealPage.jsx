import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useDeals } from '../hooks/useDeals';
import DealDetail from './DealDetail';
import { LayoutGrid, ArrowLeft, Loader2, Sun, Moon } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';

export default function PublicDealPage() {
  const { id, uid } = useParams();
  const navigate = useNavigate();
  const { getDealById } = useDeals();
  const { user } = useAuth();
  const { theme, toggleTheme } = useTheme();
  
  const [deal, setDeal] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchDeal = async () => {
      try {
        const dealData = await getDealById(id, uid);
        if (dealData) {
          setDeal(dealData);
        } else {
          setError("Deal not found or access denied.");
        }
      } catch (err) {
        console.error("Error fetching public deal:", err);
        setError("An error occurred while loading the deal.");
      } finally {
        setLoading(false);
      }
    };
    fetchDeal();
  }, [id, uid, getDealById]);

    return (
      <div className="min-h-screen bg-white dark:bg-midnight text-slate-900 dark:text-slate-200 font-sans selection:bg-emerald-500/30 pb-20 transition-colors duration-300">
        <nav className="border-b border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-midnight/80 backdrop-blur-md sticky top-0 z-40">        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
             <button 
                onClick={() => navigate(-1)} 
                className="text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors"
             >
                <ArrowLeft size={20} />
             </button>
             <div className="flex items-center gap-1.5 flex-shrink-0">
                <LayoutGrid size={18} className="text-primary" />
                <Link to="/" className="font-serif text-base md:text-xl text-slate-900 dark:text-white tracking-tight whitespace-nowrap">REI Deal <span className="text-primary italic">Drop</span></Link>
             </div>
          </div>
          
          <div className="flex items-center gap-4">
             <button
              onClick={toggleTheme}
              className="p-2 rounded-full text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              aria-label="Toggle Theme"
            >
              {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
            </button>

             {user ? (
                <Link to="/dashboard/pipeline" className="text-sm text-emerald-600 dark:text-emerald-400 font-bold hover:underline">
                    Back to Dashboard
                </Link>
             ) : (
                <div className="flex gap-2">
                    <Link to="/login" className="text-slate-600 dark:text-white hover:text-emerald-600 px-3 py-1.5 text-sm font-bold transition-colors">
                        Login
                    </Link>
                    <Link to="/register" className="bg-emerald-600 hover:bg-emerald-500 text-white px-3 py-1.5 rounded-lg text-sm font-bold transition-colors shadow-lg shadow-emerald-900/20">
                        Join DealDrop
                    </Link>
                </div>
             )}
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 py-8">
        {loading ? (
            <div className="flex flex-col items-center justify-center py-20">
                <Loader2 size={48} className="animate-spin text-emerald-500 mb-4" />
                <p className="text-slate-500 font-medium">Loading analysis report...</p>
            </div>
        ) : error ? (
            <div className="text-center py-20 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xl">
                <div className="bg-red-500/10 p-4 rounded-full w-fit mx-auto mb-6">
                    <ArrowLeft size={48} className="text-red-500" />
                </div>
                <h2 className="text-2xl font-black text-slate-900 dark:text-white mb-2">{error}</h2>
                <p className="text-slate-500 mb-8">This deal may have been removed or you don't have permission to view it.</p>
                <Link to="/" className="bg-emerald-600 hover:bg-emerald-500 text-white px-6 py-3 rounded-xl font-bold transition-all shadow-lg">
                    Return Home
                </Link>
            </div>
        ) : (
            <DealDetail 
                deal={deal} 
                onBack={() => navigate(-1)}
                isPublic={deal.isPublic}
            />
        )}
      </main>
    </div>
  );
}
