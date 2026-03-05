import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import DealList from './DealList';
import DealDetail from './DealDetail';
import { Link } from 'react-router-dom';
import { LayoutGrid, ArrowLeft, Sun, Moon, FileWarning, X, Check, Loader2 } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { useSubscription } from '../hooks/useSubscription';
import { useDeals } from '../hooks/useDeals';

export default function MarketplacePage() {
  const { user } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const { isVIP } = useSubscription();
  const { updateDeal } = useDeals();
  const [selectedDeal, setSelectedDeal] = useState(null);
  
  const [showNDAModal, setShowNDAModal] = useState(false);
  const [pendingDeal, setPendingDeal] = useState(null);
  const [unlocking, setUnlocking] = useState(false);

  const handleSelectDeal = (deal) => {
    const isFirstLook = (deal.dealScore || 0) >= 84;
    const isArchived = deal.status === 'Under Contract' || deal.status === 'Closed';
    const isOwner = user && (deal.sellerId === user.uid || deal.createdBy === user.uid);
    const isUnlockedByMe = deal.unlockedBy?.includes(user?.uid);
    
    const isLocked = !isOwner && (
        isArchived || 
        (isFirstLook ? (!isVIP && !user?.isVerified) : !isUnlockedByMe) || 
        !user
    );

    if (isLocked && !isArchived && !isFirstLook && user) {
        setPendingDeal(deal);
        setShowNDAModal(true);
    } else {
        setSelectedDeal(deal);
    }
  };

  const handleUnlock = async () => {
    if (!user || !pendingDeal) return;
    setUnlocking(true);
    try {
        const unlockedBy = pendingDeal.unlockedBy || [];
        if (!unlockedBy.includes(user.uid)) {
            await updateDeal(pendingDeal.id, { 
                ...pendingDeal, 
                unlockedBy: [...unlockedBy, user.uid] 
            });
        }
        setShowNDAModal(false);
        setSelectedDeal(pendingDeal);
        setPendingDeal(null);
    } catch (error) {
        console.error("Unlock failed:", error);
        alert("Failed to unlock deal.");
    } finally {
        setUnlocking(false);
    }
  };

  const handleBack = () => {
    setSelectedDeal(null);
  };

    return (
      <div className="min-h-screen bg-white dark:bg-midnight text-slate-900 dark:text-slate-200 font-sans selection:bg-emerald-500/30 pb-20 transition-colors duration-300">
        <nav className="border-b border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-midnight/80 backdrop-blur-md sticky top-0 z-40">        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
             <Link to="/" className="text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors">
                <ArrowLeft size={20} />
             </Link>
             <div className="flex items-center gap-1.5 flex-shrink-0">
                <LayoutGrid className="text-primary" size={18} />
                <span className="font-serif text-base md:text-xl text-slate-900 dark:text-white tracking-tight whitespace-nowrap">REI <span className="text-primary italic">Deal Drop</span></span>
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

      <main className="max-w-7xl mx-auto px-4 py-6">
        {!selectedDeal ? (
            <>
                <div className="mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-2xl md:text-3xl font-black text-slate-900 dark:text-white">
                            Live <span className="text-primary italic font-serif">Marketplace</span>
                        </h1>
                        <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">
                            Vetted Assignments & AI-Analyzed Off-Market Inventory
                        </p>
                    </div>
                </div>

                <DealList 
                    onSelectDeal={handleSelectDeal}
                    isPublic={true}
                />

                {/* Compliance Disclosure */}
                <div className="mt-12 p-4 md:p-6 bg-slate-50 dark:bg-slate-900/50 rounded-2xl border border-slate-200 dark:border-slate-800 border-dashed">
                    <div className="max-w-2xl mx-auto text-center">
                        <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500 mb-2">Marketplace Disclosure</h3>
                        <p className="text-[10px] md:text-xs text-slate-500 dark:text-slate-400 leading-relaxed italic">
                            REI Deal Drop is a marketplace for off-market property deals. All properties offered are either owned by the respective poster, 
                            under contract and selling equitable interest via assignment of contract, or offered in conjunction with a business associate. 
                            <strong> Real Estate Agents:</strong> please add your desired commission to the sales price, to be paid by the buyer at closing. 
                            Users are encouraged to perform their own due diligence before entering into any contract.
                        </p>
                    </div>
                </div>
            </>
        ) : (
            <DealDetail 
                deal={selectedDeal} 
                onBack={handleBack}
                isPublic={true}
            />
        )}
      </main>

      {/* NDA Modal */}
      {showNDAModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-slate-900/90 backdrop-blur-sm" onClick={() => setShowNDAModal(false)}></div>
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl w-full max-w-lg relative z-10 overflow-hidden shadow-2xl animate-scale-in">
                <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center">
                    <div className="flex items-center gap-2">
                        <div className="p-2 bg-amber-500/10 rounded-lg">
                            <FileWarning size={20} className="text-amber-500" />
                        </div>
                        <h3 className="text-lg font-black text-slate-900 dark:text-white uppercase tracking-tight">Confidentiality Agreement</h3>
                    </div>
                    <button onClick={() => setShowNDAModal(false)} className="text-slate-400 hover:text-slate-600 transition-colors">
                        <X size={20} />
                    </button>
                </div>
                
                <div className="p-8 space-y-4">
                    <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed font-medium">
                        By unlocking this property, you acknowledge and agree to the following terms:
                    </p>
                    <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-xl space-y-3 border border-slate-100 dark:border-slate-800">
                        <div className="flex gap-3">
                            <div className="mt-1 w-1.5 h-1.5 bg-primary rounded-full shrink-0"></div>
                            <p className="text-xs text-slate-700 dark:text-slate-300 font-bold uppercase tracking-wider">Non-Circumvention</p>
                        </div>
                        <p className="text-xs text-slate-500 dark:text-slate-400 pl-4 leading-relaxed">
                            You will not attempt to contact the owner of record or bypass the wholesaler/assignee for this property. All inquiries must be handled through this platform or the listed seller contact.
                        </p>
                        <div className="flex gap-3">
                            <div className="mt-1 w-1.5 h-1.5 bg-primary rounded-full shrink-0"></div>
                            <p className="text-xs text-slate-700 dark:text-slate-300 font-bold uppercase tracking-wider">Confidentiality</p>
                        </div>
                        <p className="text-xs text-slate-500 dark:text-slate-400 pl-4 leading-relaxed">
                            You will keep all property details, including the exact address and contract terms, strictly confidential and will not share them with third parties without written consent.
                        </p>
                    </div>
                </div>

                <div className="p-6 bg-slate-50 dark:bg-slate-800/30 flex flex-col gap-3">
                    <button 
                        onClick={handleUnlock}
                        disabled={unlocking}
                        className="w-full bg-primary hover:bg-orange-600 text-white font-black uppercase tracking-widest py-4 rounded-xl shadow-lg transition-all transform hover:-translate-y-0.5 flex items-center justify-center gap-2"
                    >
                        {unlocking ? <Loader2 size={18} className="animate-spin" /> : <Check size={18} />}
                        I Agree & Unlock Address
                    </button>
                    <p className="text-[10px] text-center text-slate-400 uppercase font-bold">
                        Access will be logged for the seller
                    </p>
                </div>
            </div>
        </div>
      )}
    </div>
  );
}
