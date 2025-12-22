import React, { useState } from 'react';
import { LayoutGrid, Plus, Zap } from 'lucide-react';
import { Link } from 'react-router-dom';
import DealList from './components/DealList';
import DealDetail from './components/DealDetail';
import AddDealModal from './components/AddDealModal';
import PricingModal from './components/PricingModal';
import Toast from './components/Toast';
import { useAuth } from './context/AuthContext';
import { useDeals } from './hooks/useDeals';
import { useSubscription } from './hooks/useSubscription';

export default function MainApp() {
  const { user, logout } = useAuth();
  const { addDeal, updateDeal, deleteDeal } = useDeals();
  const { isPro, loading: subLoading } = useSubscription();

  const [selectedDeal, setSelectedDeal] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showPricingModal, setShowPricingModal] = useState(false);
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
    <div className="min-h-screen bg-slate-950 text-slate-200 font-sans selection:bg-emerald-500/30 pb-20">
      <Toast toast={toast} setToast={setToast} />
      
      <nav className="border-b border-slate-800 bg-slate-900/50 backdrop-blur-md sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => setSelectedDeal(null)}>
            <div className="bg-emerald-500 p-1.5 rounded-lg">
              <LayoutGrid size={20} className="text-white" />
            </div>
            <span className="font-bold text-xl tracking-tight text-white">REI <span className="text-emerald-400">Deal Validator</span></span>
          </div>
          
          <div className="flex items-center gap-4">
            <Link 
               to="/marketplace"
               className="hidden md:flex items-center gap-1 text-sm font-bold text-slate-300 hover:text-white transition-colors"
            >
               Marketplace
            </Link>

            {!subLoading && !isPro && (
               <button 
                 onClick={() => setShowPricingModal(true)}
                 className="flex items-center gap-1 text-xs uppercase font-bold tracking-wider px-3 py-1.5 rounded-full bg-gradient-to-r from-amber-500 to-orange-500 text-white hover:from-amber-400 hover:to-orange-400 transition-all shadow-lg shadow-amber-900/20"
               >
                 <Zap size={12} fill="currentColor" /> Upgrade to Pro
               </button>
            )}

            {user ? (
              <>
                <span className="hidden md:inline text-sm text-slate-400">{user.email}</span>
                <button 
                  onClick={handleLogout}
                  className="text-xs uppercase font-bold tracking-wider px-3 py-1 rounded-full border border-slate-700 text-slate-500 hover:text-slate-300 transition-colors"
                >
                  Logout
                </button>
              </>
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
        {!selectedDeal ? (
          <div className="space-y-8">
            <div className="relative overflow-hidden rounded-3xl bg-slate-900 border border-slate-800 p-8 md:p-12">
              <div className="absolute top-0 right-0 -mt-10 -mr-10 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl"></div>
              <div className="absolute bottom-0 left-0 -mb-10 -ml-10 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl"></div>
              <div className="relative z-10 max-w-2xl">
                 <h1 className="text-3xl md:text-4xl font-bold text-white mb-4">
                    Manage Your <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-400">Deal Pipeline</span>
                 </h1>
                 <p className="text-slate-400 text-lg mb-8">
                   Track leads, analyze numbers, and generate professional reports for lenders and partners.
                 </p>
                 {user && (
                  <div className="flex gap-4">
                    <button 
                      onClick={() => setShowAddModal(true)} 
                      className="bg-emerald-500 hover:bg-emerald-400 text-white px-6 py-3 rounded-xl font-bold flex items-center gap-2 transition-all shadow-lg shadow-emerald-900/20 hover:shadow-emerald-900/40 transform hover:-translate-y-1"
                    >
                      <Plus size={20}/> Analyze New Deal
                    </button>
                    <Link
                      to="/marketplace"
                      className="bg-slate-800 hover:bg-slate-700 text-white px-6 py-3 rounded-xl font-bold flex items-center gap-2 transition-all border border-slate-700 transform hover:-translate-y-1"
                    >
                      Browse Marketplace
                    </Link>
                  </div>
                )}
                {!user && (
                  <div className="flex gap-4">
                    <Link to="/register" className="bg-emerald-500 hover:bg-emerald-400 text-white px-6 py-3 rounded-xl font-bold transition-all shadow-lg shadow-emerald-900/20">Get Started</Link>
                    <Link to="/login" className="bg-slate-800 hover:bg-slate-700 text-white px-6 py-3 rounded-xl font-bold border border-slate-700 transition-all">Login</Link>
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
          <DealDetail deal={selectedDeal} onBack={handleBack} />
        )}
      </main>
      
      <footer className="bg-slate-950 border-t border-slate-900 py-12 mt-auto">
         <div className="max-w-7xl mx-auto px-4 flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="flex items-center gap-2">
               <div className="bg-slate-900 p-1.5 rounded-lg">
                  <LayoutGrid size={20} className="text-slate-500" />
               </div>
               <span className="font-bold text-lg text-slate-500">REI Deal Validator</span>
            </div>
            <p className="text-slate-600 text-sm">
              &copy; {new Date().getFullYear()} REI Deal Validator. All rights reserved.
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
        onUpgrade={() => {
            setShowAddModal(false);
            setShowPricingModal(true);
        }}
      />

      <PricingModal 
        isOpen={showPricingModal} 
        onClose={() => setShowPricingModal(false)} 
      />

    </div>
  );
}