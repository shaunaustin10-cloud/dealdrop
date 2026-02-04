import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import DealList from './DealList';
import DealDetail from './DealDetail';
import { Link } from 'react-router-dom';
import { LayoutGrid, ArrowLeft, Sun, Moon } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

export default function MarketplacePage() {
  const { user } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [selectedDeal, setSelectedDeal] = useState(null);

  const handleSelectDeal = (deal) => {
    setSelectedDeal(deal);
  };

  const handleBack = () => {
    setSelectedDeal(null);
  };

  return (
    <div className="min-h-screen bg-white dark:bg-[#0f172a] text-slate-900 dark:text-slate-200 font-sans selection:bg-emerald-500/30 pb-20 transition-colors duration-300">
       <nav className="border-b border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-[#0f172a]/80 backdrop-blur-md sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
             <Link to="/" className="text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors">
                <ArrowLeft size={20} />
             </Link>
             <div className="flex items-center gap-2">
                <div className="bg-slate-100 dark:bg-slate-900 p-1.5 rounded-lg">
                   <LayoutGrid size={20} className="text-primary" />
                </div>
                <span className="font-serif text-xl text-slate-900 dark:text-white tracking-tight">REI Deal <span className="text-primary italic">Drop</span></span>
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
                <div className="text-sm text-slate-500 dark:text-slate-400">
                    Logged in as <span className="text-emerald-600 dark:text-emerald-400 font-bold">{user.displayName || user.email}</span>
                </div>
             ) : (
                <div className="flex gap-2">
                    <Link to="/login" className="text-slate-600 dark:text-white hover:text-emerald-600 px-3 py-1.5 text-sm font-bold transition-colors">
                        Login
                    </Link>
                    <Link to="/register" className="bg-emerald-600 hover:bg-emerald-500 text-white px-3 py-1.5 rounded-lg text-sm font-bold transition-colors shadow-lg shadow-emerald-900/20">
                        Create Account
                    </Link>
                </div>
             )}
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 py-8">
        {!selectedDeal ? (
            <>
                <div className="mb-8 text-center max-w-2xl mx-auto">
                <h1 className="text-3xl md:text-4xl font-black text-slate-900 dark:text-white mb-4">
                    Verified Off-Market Deals
                </h1>
                <p className="text-slate-500 dark:text-slate-400 text-lg font-medium">
                    Browse exclusive inventory from top wholesalers. All contracts are verified before posting.
                </p>
                </div>

                <DealList 
                    onSelectDeal={handleSelectDeal}
                    isPublic={true}
                />
            </>
        ) : (
            <DealDetail 
                deal={selectedDeal} 
                onBack={handleBack}
                isPublic={true}
            />
        )}
      </main>
    </div>
  );
}
