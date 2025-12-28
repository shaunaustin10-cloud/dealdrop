import React from 'react';
import { useAuth } from '../context/AuthContext';
import DealList from './DealList';
import { Link } from 'react-router-dom';
import { LayoutGrid, ArrowLeft } from 'lucide-react';

export default function MarketplacePage() {
  const { user } = useAuth();

  const handleSelectDeal = (deal) => {
    // For now, simple console log or you might want to open a public detail view
    console.log("Viewing public deal:", deal);
    // In a full implementation, this would open a public version of DealDetail
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 font-sans selection:bg-emerald-500/30 pb-20">
       <nav className="border-b border-slate-800 bg-slate-900/50 backdrop-blur-md sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
             <Link to="/dashboard" className="text-slate-400 hover:text-white transition-colors">
                <ArrowLeft size={20} />
             </Link>
             <div className="flex items-center gap-2">
                <div className="bg-emerald-500 p-1.5 rounded-lg">
                  <LayoutGrid size={20} className="text-white" />
                </div>
                <span className="font-bold text-xl tracking-tight text-white">Marketplace</span>
             </div>
          </div>
          
          <div className="flex items-center gap-4">
             {user ? (
                <div className="text-sm text-slate-400">
                    Logged in as <span className="text-emerald-400 font-bold">{user.displayName || user.email}</span>
                </div>
             ) : (
                <Link to="/login" className="bg-emerald-600 hover:bg-emerald-500 text-white px-3 py-1.5 rounded-lg text-sm font-bold transition-colors">
                    Login to Contact
                </Link>
             )}
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-8 text-center max-w-2xl mx-auto">
           <h1 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Verified Off-Market Deals
           </h1>
           <p className="text-slate-400 text-lg">
             Browse exclusive inventory from top wholesalers. All contracts are verified before posting.
           </p>
        </div>

        <DealList 
            onSelectDeal={handleSelectDeal}
            isPublic={true}
        />
      </main>
    </div>
  );
}
