import React, { useState, useEffect } from 'react';
import { LayoutGrid, Plus, Zap, User as UserIcon, Sun, Moon, ShieldAlert, Globe, Briefcase, Home } from 'lucide-react';
import { Link, Routes, Route, useLocation, Navigate } from 'react-router-dom';
import DealList from './components/DealList';
import DealDetail from './components/DealDetail';
import AddDealModal from './components/AddDealModal';
import PricingModal from './components/PricingModal';
import ProfilePage from './components/ProfilePage';
import AdminDashboard from './components/AdminDashboard';
import Toast from './components/Toast';
import CreditsExhaustedModal from './components/CreditsExhaustedModal';
import { useAuth } from './context/AuthContext';
import { useDeals } from './hooks/useDeals';
import { useSubscription } from './hooks/useSubscription';
import { useTheme } from './context/ThemeContext';
import CookieConsent from './components/CookieConsent';
import OnboardingModal from './components/OnboardingModal';

import { doc, getDoc } from 'firebase/firestore';
import { db } from './firebaseConfig';

export default function MainApp() {
  const { user, logout } = useAuth();
  const { addDeal, updateDeal, deleteDeal } = useDeals();
  const { isPro, loading: subLoading } = useSubscription();
  const { theme, toggleTheme } = useTheme();
  
  const [isAdmin, setIsAdmin] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const checkAdmin = async () => {
        if (!user) {
            setIsAdmin(false);
            return;
        }
        const appId = import.meta.env.VITE_APP_ID || 'default-app-id';
        try {
            const docRef = doc(db, 'artifacts', appId, 'profiles', user.uid);
            const snap = await getDoc(docRef);
            if (snap.exists() && snap.data().role === 'admin') {
                setIsAdmin(true);
            } else {
                setIsAdmin(false);
            }
        } catch (e) {
            console.warn("Nav admin check failed", e);
        }
    };
    checkAdmin();
  }, [user]);

  const [selectedDeal, setSelectedDeal] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showPricingModal, setShowPricingModal] = useState(false);
  const [showCreditsModal, setShowCreditsModal] = useState(false);
  const [editingDeal, setEditingDeal] = useState(null);

  const [toast, setToast] = useState({ show: false, message: '', type: '' });

  const handleAddDeal = async (dealData, shouldPublish) => {
    try {
      await addDeal(dealData, shouldPublish);
      setShowAddModal(false);
      setToast({ show: true, message: 'Deal analysis saved!', type: 'success' });
    } catch (e) {
      console.error("Error adding deal: ", e);
      setToast({ show: true, message: 'Failed to save analysis: ' + e.message, type: 'error' });
    }
  };

  const handleUpdateDeal = async (id, dealData, shouldPublish) => {
    try {
      await updateDeal(id, dealData, shouldPublish);
      setShowAddModal(false);
      setEditingDeal(null);
      setToast({ show: true, message: 'Deal updated successfully!', type: 'success' });
    } catch (e) {
      console.error("Error updating deal: ", e);
      setToast({ show: true, message: 'Failed to update deal: ' + e.message, type: 'error' });
    }
  };

  const handleDeleteDeal = async (id) => {
    if (!confirm("Are you sure you want to delete this deal?")) return;
    try {
      await deleteDeal(id);
      if (selectedDeal && selectedDeal.id === id) setSelectedDeal(null);
      setToast({ show: true, message: 'Deal deleted.', type: 'success' });
    } catch (e) {
      console.error("Error deleting deal: ", e);
      setToast({ show: true, message: 'Failed to delete deal: ' + e.message, type: 'error' });
    }
  };

  const handleSelectDeal = (deal) => {
    setSelectedDeal(deal);
  };

  const handleBack = () => {
    setSelectedDeal(null);
  };

  const handleLogout = async () => {
    await logout();
  };

  const handleEditClick = (deal) => {
    setEditingDeal(deal);
    setShowAddModal(true);
  };

  // Helper to determine active tab style
  const getNavLinkClass = (path) => {
      const isActive = location.pathname.includes(path);
      return `flex items-center gap-2 px-3 py-2 text-sm font-bold rounded-lg transition-colors ${
          isActive 
          ? 'bg-slate-100 dark:bg-slate-800 text-primary' 
          : 'text-slate-600 dark:text-slate-300 hover:text-primary hover:bg-slate-100 dark:hover:bg-slate-800'
      }`;
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#0f172a] text-slate-900 dark:text-slate-200 font-sans selection:bg-emerald-500/30 pb-20 transition-colors duration-300">
      <Toast toast={toast} setToast={setToast} />
      
      <nav className="border-b border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-[#0f172a]/80 backdrop-blur-md sticky top-0 z-40 transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
          <Link to="/dashboard/pipeline" className="flex items-center gap-2 cursor-pointer flex-shrink-0" onClick={() => setSelectedDeal(null)}>
            <div className="bg-slate-100 dark:bg-slate-900 p-1.5 rounded-lg">
               <LayoutGrid className="text-primary" size={20} />
            </div>
            <span className="font-serif text-lg md:text-xl text-slate-900 dark:text-white tracking-tight whitespace-nowrap">REI Deal <span className="text-primary italic">Drop</span></span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-1 mr-auto">
             <Link 
               to="/" 
               className="flex items-center gap-2 px-3 py-2 text-sm font-bold rounded-lg text-slate-600 dark:text-slate-300 hover:text-primary hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
             >
                <Home size={18} />
                Home
             </Link>

             <Link 
               to="/dashboard/pipeline" 
               onClick={() => setSelectedDeal(null)}
               className={getNavLinkClass('pipeline')}
             >
                <Briefcase size={18} />
                My Pipeline
             </Link>

             <Link 
               to="/dashboard/marketplace" 
               onClick={() => setSelectedDeal(null)}
               className={getNavLinkClass('marketplace')}
             >
                <Globe size={18} />
                Marketplace
             </Link>
             
             {isAdmin && (
                 <Link 
                   to="/dashboard/admin" 
                   className="flex items-center gap-2 px-3 py-2 text-sm font-bold text-red-600 dark:text-red-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
                 >
                    <ShieldAlert size={18} />
                    Admin
                 </Link>
             )}
          </div>
          
          <div className="flex items-center gap-4">
            <button
              onClick={toggleTheme}
              className="p-2 rounded-full text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              aria-label="Toggle Theme"
            >
              {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
            </button>

            {!subLoading && (
               <div className="flex items-center gap-3">
                 <div className="hidden sm:flex flex-col items-end leading-none mr-1">
                    <span className="text-[10px] uppercase font-black tracking-widest text-slate-500">
                      {isPro ? 'Premium Access' : 'Free Credits'}
                    </span>
                    <span className="text-sm font-bold text-slate-900 dark:text-white">
                      {isPro ? 'Unlimited' : (user?.credits || 0)} {isPro ? 'Analysis' : 'Remaining'}
                    </span>
                 </div>
                 {!isPro && (
                    <button 
                      onClick={() => setShowPricingModal(true)}
                      className="flex items-center gap-1 text-xs uppercase font-bold tracking-wider px-3 py-1.5 rounded-full bg-gradient-to-r from-amber-500 to-orange-500 text-white hover:from-amber-400 hover:to-orange-400 transition-all shadow-lg shadow-amber-900/20"
                    >
                      <Zap size={12} fill="currentColor" /> Upgrade
                    </button>
                 )}
               </div>
            )}

            {user ? (
              <div className="flex items-center gap-2 md:gap-4">
                <Link to="/dashboard/profile" className="flex items-center gap-2 group p-1 rounded-lg hover:bg-slate-800 transition-colors">
                  <div className="w-8 h-8 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center overflow-hidden group-hover:border-emerald-500 transition-colors">
                     {(user.photoUrl || user.photoURL) ? (
                        <img src={user.photoUrl || user.photoURL} alt="User" className="w-full h-full object-cover" />
                     ) : (
                        <UserIcon size={16} className="text-slate-400" />
                     )}
                  </div>
                  <div className="hidden md:flex flex-col items-start leading-none">
                    <span className="text-xs text-slate-500 mb-0.5">Settings</span>
                    <span className="text-sm font-bold text-slate-300 group-hover:text-white transition-colors">{user.displayName || user.email?.split('@')[0] || 'My Profile'}</span>
                  </div>
                </Link>
                <div className="h-8 w-px bg-slate-800 hidden md:block"></div>
                <button 
                  onClick={handleLogout}
                  className="hidden md:block text-xs uppercase font-bold tracking-wider px-3 py-1 rounded-full border border-slate-700 text-slate-500 hover:text-slate-300 transition-colors"
                >
                  Logout
                </button>
              </div>
            ) : (
              <>
                <Link to="/login" className="text-sm font-bold text-white">Login</Link>
                <Link to="/register" className="bg-emerald-600 hover:bg-emerald-500 text-white px-3 py-1.5 rounded-lg text-sm font-bold transition-colors">Register</Link>
              </>
            )}
          </div>
        </div>
      </nav>
      
      <main className="max-w-7xl mx-auto px-4 py-8 flex-grow">
        <Routes>
           <Route path="admin" element={<AdminDashboard />} />
           <Route path="profile" element={<ProfilePage />} />
           
           {/* Pipeline Route */}
           <Route path="pipeline" element={
              !selectedDeal ? (
                <div className="space-y-8">
                  {/* Pipeline Header */}
                  <div className="relative overflow-hidden rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700/50 px-4 py-3 md:px-6 md:py-4 shadow-sm mb-4">
                    <div className="absolute top-0 right-0 -mt-4 -mr-4 w-24 h-24 bg-emerald-500/5 rounded-full blur-2xl"></div>
                    
                    <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div>
                        <h1 className="text-xl md:text-2xl font-black text-slate-900 dark:text-white leading-tight">
                          My <span className="text-primary">Pipeline</span>
                        </h1>
                        <p className="text-slate-500 dark:text-slate-400 text-[10px] md:text-xs font-medium">
                          Manage your personal deal flow and analysis.
                        </p>
                      </div>

                      {user ? (
                        <button 
                          onClick={() => setShowAddModal(true)} 
                          className="bg-primary hover:bg-orange-600 text-white px-4 py-2 rounded-lg font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-md transform hover:-translate-y-0.5"
                        >
                          <Plus size={16}/> New Deal
                        </button>
                      ) : (
                        <div className="flex gap-2">
                          <Link to="/register" className="bg-emerald-500 hover:bg-emerald-400 text-white px-4 py-2 rounded-lg font-bold text-xs transition-all shadow-sm">Get Started</Link>
                          <Link to="/login" className="bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-900 dark:text-white px-4 py-2 rounded-lg font-bold text-xs border border-slate-200 dark:border-slate-700 transition-all shadow-sm">Login</Link>
                        </div>
                      )}
                    </div>
                  </div>

                  <DealList 
                    onDeleteDeal={handleDeleteDeal}
                    onSelectDeal={handleSelectDeal}
                    onEditDeal={handleEditClick}
                    isPublic={false}
                  />
                </div>
              ) : (
                <DealDetail 
                  deal={selectedDeal} 
                  onBack={handleBack} 
                  onEdit={handleEditClick}
                  onDelete={handleDeleteDeal}
                  onUpgrade={() => setShowCreditsModal(true)}
                  isPublic={false}
                />
              )
           } />

           {/* Marketplace Route */}
           <Route path="marketplace" element={
              !selectedDeal ? (
                <div className="space-y-8">
                  {/* Marketplace Header */}
                  <div className="relative overflow-hidden rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700/50 px-4 py-3 md:px-6 md:py-4 shadow-sm mb-4">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none"></div>
                    <div className="relative z-10">
                        <h1 className="text-xl md:text-2xl font-black text-slate-900 dark:text-white leading-tight">
                          Live <span className="text-blue-500 dark:text-blue-400">Marketplace</span>
                        </h1>
                        <p className="text-slate-500 dark:text-slate-400 text-[10px] md:text-xs font-medium">
                          Verified off-market deals from top wholesalers.
                        </p>
                    </div>
                  </div>

                  <DealList 
                    onDeleteDeal={handleDeleteDeal}
                    onSelectDeal={handleSelectDeal}
                    isPublic={true}
                  />
                </div>
              ) : (
                <DealDetail 
                  deal={selectedDeal} 
                  onBack={handleBack} 
                  onDelete={handleDeleteDeal}
                  onUpgrade={() => setShowCreditsModal(true)}
                  isPublic={true}
                />
              )
           } />

           {/* Default Redirect */}
           <Route path="/" element={<Navigate to="pipeline" replace />} />
        </Routes>
      </main>
      
      <footer className="bg-white dark:bg-slate-950 border-t border-slate-200 dark:border-slate-900 py-12 mt-auto">
         <div className="max-w-7xl mx-auto px-4 flex flex-col md:flex-row justify-between items-start gap-8">
            <div className="space-y-3">
                <div className="flex items-center gap-2">
                   <div className="bg-slate-100 dark:bg-slate-900 p-1.5 rounded-lg">
                      <LayoutGrid size={20} className="text-primary" />
                   </div>
                   <span className="font-serif text-lg text-slate-900 dark:text-white">REI Deal <span className="text-primary italic">Drop</span></span>
                </div>
                <p className="text-slate-500 dark:text-slate-600 text-[10px] leading-relaxed max-w-2xl uppercase tracking-wider font-medium">
                  &copy; {new Date().getFullYear()} REI Deal Drop. All rights reserved. 
                  <span className="block mt-1 normal-case font-normal text-[9px] opacity-70">
                    All properties are offered as equitable interest via assignment of contract or owned by the respective parties. Agents: add commission to sales price.
                  </span>
                </p>
            </div>
            <div className="flex gap-6 text-xs font-bold uppercase tracking-widest text-slate-500 dark:text-slate-600">
               <Link to="/" className="hover:text-primary transition-colors">Home</Link>
               <Link to="/terms" className="hover:text-primary transition-colors">Terms</Link>
               <Link to="/privacy" className="hover:text-primary transition-colors">Privacy</Link>
               <a href="#" className="hover:text-primary transition-colors">Support</a>
            </div>
         </div>
      </footer>

      <AddDealModal 
        isOpen={showAddModal} 
        onClose={() => {
          setShowAddModal(false);
          setEditingDeal(null);
        }} 
        onAdd={handleAddDeal} 
        initialData={editingDeal}
        onUpdate={handleUpdateDeal}
        onUpgrade={() => setShowCreditsModal(true)}
      />

      <PricingModal 
        isOpen={showPricingModal} 
        onClose={() => setShowPricingModal(false)} 
      />

      <CreditsExhaustedModal 
        isOpen={showCreditsModal} 
        onClose={() => setShowCreditsModal(false)}
        onUpgrade={() => {
            setShowCreditsModal(false);
            setShowPricingModal(true);
        }}
      />

      <CookieConsent />
            <OnboardingModal />
      
            {/* Mobile Bottom Navigation */}
            <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 z-50 px-4 py-3 flex justify-around items-center backdrop-blur-md bg-white/80 dark:bg-slate-900/80">
               <Link 
                 to="/" 
                 className={`flex flex-col items-center gap-1 ${location.pathname === '/' ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-400'}`}
               >
                  <Home size={20} />
                  <span className="text-[10px] font-bold uppercase tracking-tighter">Home</span>
               </Link>

               <Link 
                 to="/dashboard/pipeline" 
                 onClick={() => setSelectedDeal(null)}
                 className={`flex flex-col items-center gap-1 ${location.pathname.includes('pipeline') ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-400'}`}
               >
                  <Briefcase size={20} />
                  <span className="text-[10px] font-bold uppercase tracking-tighter">Pipeline</span>
               </Link>
               
               <Link 
                 to="/dashboard/marketplace" 
                 onClick={() => setSelectedDeal(null)}
                 className={`flex flex-col items-center gap-1 ${location.pathname.includes('marketplace') ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-400'}`}
               >
                  <Globe size={20} />
                  <span className="text-[10px] font-bold uppercase tracking-tighter">Marketplace</span>
               </Link>
      
               {isAdmin && (
                  <Link 
                    to="/dashboard/admin" 
                    className={`flex flex-col items-center gap-1 ${location.pathname.includes('admin') ? 'text-red-600' : 'text-slate-400'}`}
                  >
                     <ShieldAlert size={20} />
                     <span className="text-[10px] font-bold uppercase tracking-tighter">Admin</span>
                  </Link>
               )}
      
               <Link 
                 to="/dashboard/profile" 
                 className={`flex flex-col items-center gap-1 ${location.pathname.includes('profile') ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-400'}`}
               >
                  <UserIcon size={20} />
                  <span className="text-[10px] font-bold uppercase tracking-tighter">Profile</span>
               </Link>
            </div>
      
          </div>
        );
      }
      