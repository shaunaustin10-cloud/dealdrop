import React, { useState } from 'react';
import { LayoutGrid, Plus, Zap, User as UserIcon, Sun, Moon } from 'lucide-react';
import { Link, Routes, Route } from 'react-router-dom';
import DealList from './components/DealList';
import DealDetail from './components/DealDetail';
import AddDealModal from './components/AddDealModal';
import PricingModal from './components/PricingModal';
import ProfilePage from './components/ProfilePage';
import Toast from './components/Toast';
import CreditsExhaustedModal from './components/CreditsExhaustedModal';
import { useAuth } from './context/AuthContext';
import { useDeals } from './hooks/useDeals';
import { useSubscription } from './hooks/useSubscription';
import { useTheme } from './context/ThemeContext';

export default function MainApp() {
  const { user, logout } = useAuth();
  const { addDeal, updateDeal, deleteDeal } = useDeals();
  const { isPro, loading: subLoading } = useSubscription();
  const { theme, toggleTheme } = useTheme();

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

  const handleUpdateDeal = async (id, dealData) => {
    try {
      await updateDeal(id, dealData);
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

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-200 font-sans selection:bg-emerald-500/30 pb-20 transition-colors duration-300">
      <Toast toast={toast} setToast={setToast} />
      
      <nav className="border-b border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50 backdrop-blur-md sticky top-0 z-40 transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 cursor-pointer flex-shrink-0" onClick={() => setSelectedDeal(null)}>
            <div className="bg-emerald-500 p-1.5 rounded-lg">
              <LayoutGrid size={20} className="text-white" />
            </div>
            <span className="font-bold text-lg md:text-xl tracking-tight text-slate-900 dark:text-white mr-4">REI <span className="text-emerald-600 dark:text-emerald-400">Deal Drop</span></span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-1 mr-auto">
             <Link 
               to="/dashboard" 
               onClick={() => setSelectedDeal(null)}
               className="flex items-center gap-2 px-3 py-2 text-sm font-bold text-slate-600 dark:text-slate-300 hover:text-emerald-600 dark:hover:text-emerald-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
             >
                <LayoutGrid size={18} />
                Dashboard
             </Link>
          </div>
          
          <div className="flex items-center gap-4">
            <button
              onClick={toggleTheme}
              className="p-2 rounded-full text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              aria-label="Toggle Theme"
            >
              {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
            </button>

            {!subLoading && !isPro && (
               <div className="flex items-center gap-3">
                 <div className="hidden sm:flex flex-col items-end leading-none mr-1">
                    <span className="text-[10px] uppercase font-black tracking-widest text-slate-500">Free Credits</span>
                    <span className="text-sm font-bold text-slate-900 dark:text-white">{user?.credits || 0} Remaining</span>
                 </div>
                 <button 
                   onClick={() => setShowPricingModal(true)}
                   className="flex items-center gap-1 text-xs uppercase font-bold tracking-wider px-3 py-1.5 rounded-full bg-gradient-to-r from-amber-500 to-orange-500 text-white hover:from-amber-400 hover:to-orange-400 transition-all shadow-lg shadow-amber-900/20"
                 >
                   <Zap size={12} fill="currentColor" /> Upgrade
                 </button>
               </div>
            )}

            {user ? (
              <div className="flex items-center gap-4">
                <Link to="/dashboard/profile" className="flex items-center gap-2 group p-1 rounded-lg hover:bg-slate-800 transition-colors">
                  <div className="w-8 h-8 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center overflow-hidden group-hover:border-emerald-500 transition-colors">
                     {(user.photoUrl || user.photoURL) ? (
                        <img src={user.photoUrl || user.photoURL} alt="User" className="w-full h-full object-cover" />
                     ) : (
                        <UserIcon size={16} className="text-slate-400" />
                     )}
                  </div>
                  <div className="flex flex-col items-start leading-none">
                    <span className="hidden md:inline text-xs text-slate-500 mb-0.5">Settings</span>
                    <span className="hidden md:inline text-sm font-bold text-slate-300 group-hover:text-white transition-colors">{user.displayName || user.email?.split('@')[0] || 'My Profile'}</span>
                  </div>
                </Link>
                <div className="h-8 w-px bg-slate-800 hidden md:block"></div>
                <button 
                  onClick={handleLogout}
                  className="text-xs uppercase font-bold tracking-wider px-3 py-1 rounded-full border border-slate-700 text-slate-500 hover:text-slate-300 transition-colors"
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
           <Route path="/profile" element={<ProfilePage />} />
           <Route path="/" element={
              !selectedDeal ? (
                <div className="space-y-8">
                  {/* Compact Dashboard Header */}
                  <div className="relative overflow-hidden rounded-2xl bg-slate-900 border border-slate-800 p-6 md:p-8 shadow-lg">
                    <div className="absolute top-0 right-0 -mt-4 -mr-4 w-32 h-32 bg-emerald-500/10 rounded-full blur-2xl"></div>
                    <div className="absolute bottom-0 left-0 -mb-4 -ml-4 w-32 h-32 bg-blue-500/10 rounded-full blur-2xl"></div>
                    
                    <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
                      <div>
                        <h1 className="text-2xl md:text-3xl font-black text-white mb-1">
                          Deal <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-400">Pipeline</span>
                        </h1>
                        <p className="text-slate-400 text-sm max-w-md">
                          Track leads, analyze numbers, and generate professional reports.
                        </p>
                      </div>

                      {user ? (
                        <button 
                          onClick={() => setShowAddModal(true)} 
                          className="bg-emerald-500 hover:bg-emerald-400 text-white px-5 py-2.5 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all shadow-lg shadow-emerald-900/20 hover:shadow-emerald-900/40 transform hover:-translate-y-0.5"
                        >
                          <Plus size={18}/> Analyze New Deal
                        </button>
                      ) : (
                        <div className="flex gap-3">
                          <Link to="/register" className="bg-emerald-500 hover:bg-emerald-400 text-white px-5 py-2.5 rounded-xl font-bold text-sm transition-all">Get Started</Link>
                          <Link to="/login" className="bg-slate-800 hover:bg-slate-700 text-white px-5 py-2.5 rounded-xl font-bold text-sm border border-slate-700 transition-all">Login</Link>
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
                  onUpgrade={() => setShowCreditsModal(true)}
                />
              )
           } />
        </Routes>
      </main>
      
      <footer className="bg-slate-950 border-t border-slate-900 py-12 mt-auto">
         <div className="max-w-7xl mx-auto px-4 flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="flex items-center gap-2">
               <div className="bg-slate-900 p-1.5 rounded-lg">
                  <LayoutGrid size={20} className="text-slate-500" />
               </div>
               <span className="font-bold text-lg text-slate-500">REI Deal Drop</span>
            </div>
            <p className="text-slate-600 text-sm">
              &copy; {new Date().getFullYear()} REI Deal Drop. All rights reserved.
            </p>
            <div className="flex gap-6 text-sm text-slate-600">
               <Link to="/terms" className="hover:text-slate-400 transition-colors">Terms</Link>
               <Link to="/privacy" className="hover:text-slate-400 transition-colors">Privacy</Link>
               <a href="#" className="hover:text-slate-400 transition-colors">Support</a>
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

    </div>
  );
}