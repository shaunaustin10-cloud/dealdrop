import React, { useState } from 'react';
import { LayoutGrid, Plus, Zap } from 'lucide-react';
import { Link } from 'react-router-dom';
import { 
  collection, 
  addDoc, 
} from 'firebase/firestore';
import { db } from './firebaseConfig';
import DealList from './components/DealList';
import DealDetail from './components/DealDetail';
import AddDealModal from './components/AddDealModal';
import PricingModal from './components/PricingModal';
import Toast from './components/Toast';
import { useAuth } from './context/AuthContext';
import { useDeals } from './hooks/useDeals';
import { useSubscription } from './hooks/useSubscription';

const appId = import.meta.env.VITE_APP_ID || 'default-app-id';

export default function MainApp() {
  const { user, logout } = useAuth();
  const { addDeal, updateDeal, deleteDeal } = useDeals();
  const { isPro, loading: subLoading } = useSubscription();

  const [view, setView] = useState('marketplace'); 
  const [selectedDeal, setSelectedDeal] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showPricingModal, setShowPricingModal] = useState(false);
  const [editingDeal, setEditingDeal] = useState(null);

  const [toast, setToast] = useState({ show: false, message: '', type: '' });

  const handleAddDeal = async (dealData) => {
    try {
      await addDeal(dealData);
      setShowAddModal(false);
      setToast({ show: true, message: 'Deal added successfully!', type: 'success' });
    } catch (e) {
      console.error("Error adding deal: ", e);
      setToast({ show: true, message: 'Failed to add deal: ' + e.message, type: 'error' });
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
      if (selectedDeal && selectedDeal.id === id) setView('gallery');
      setToast({ show: true, message: 'Deal deleted.', type: 'success' });
    } catch (e) {
      console.error("Error deleting deal: ", e);
      setToast({ show: true, message: 'Failed to delete deal: ' + e.message, type: 'error' });
    }
  };

  const handleContact = async (address) => {
    if (!user) return;
    try {
      await addDoc(collection(db, 'artifacts', appId, 'users', user.uid, 'inquiries'), {
        address: address,
        date: new Date().toISOString(),
        message: "User clicked 'I Want This Deal'"
      });
      setToast({ show: true, message: 'Interest sent successfully!', type: 'success' });
    } catch (e) {
      console.error("Error sending inquiry", e);
      setToast({ show: true, message: 'Failed to send inquiry.', type: 'error' });
    }
  };

  const handleSelectDeal = (deal) => {
    setSelectedDeal(deal);
    setView('detail');
  };

  const handleBack = () => {
    setSelectedDeal(null);
    setView('gallery');
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
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => setView('gallery')}>
            <div className="bg-emerald-500 p-1.5 rounded-lg">
              <LayoutGrid size={20} className="text-white" />
            </div>
            <span className="font-bold text-xl tracking-tight text-white">REI <span className="text-emerald-400">Deal Drop</span></span>
          </div>
          
          <div className="flex items-center gap-4">
             {user && (
               <div className="hidden md:flex bg-slate-800 rounded-lg p-1 border border-slate-700 mr-4">
                  <button 
                    onClick={() => setView('marketplace')}
                    className={`px-4 py-1.5 rounded-md text-sm font-bold transition-all ${view === 'marketplace' ? 'bg-slate-700 text-emerald-400 shadow-sm' : 'text-slate-400 hover:text-white'}`}
                  >
                    Marketplace
                  </button>
                  <button 
                    onClick={() => setView('gallery')}
                    className={`px-4 py-1.5 rounded-md text-sm font-bold transition-all ${view === 'gallery' ? 'bg-slate-700 text-emerald-400 shadow-sm' : 'text-slate-400 hover:text-white'}`}
                  >
                    My Pipeline
                  </button>
               </div>
             )}

            {!subLoading && !isPro && (
               <button 
                 onClick={() => setShowPricingModal(true)}
                 className="flex items-center gap-1 text-xs uppercase font-bold tracking-wider px-3 py-1.5 rounded-full bg-gradient-to-r from-amber-500 to-orange-500 text-white hover:from-amber-400 hover:to-orange-400 transition-all shadow-lg shadow-amber-900/20"
               >
                 <Zap size={12} fill="currentColor" /> Upgrade
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
        {view === 'gallery' || view === 'marketplace' ? (
          <div className="space-y-8">
            <div className="relative overflow-hidden rounded-3xl bg-slate-900 border border-slate-800 p-8 md:p-12">
              <div className="absolute top-0 right-0 -mt-10 -mr-10 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl"></div>
              <div className="absolute bottom-0 left-0 -mb-10 -ml-10 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl"></div>
              <div className="relative z-10 max-w-2xl">
                 <h1 className="text-3xl md:text-4xl font-bold text-white mb-4">
                   {view === 'marketplace' ? (
                      <>Explore the <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-400">Marketplace</span></>
                   ) : (
                      <>Manage Your <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-400">Deal Pipeline</span></>
                   )}
                 </h1>
                 <p className="text-slate-400 text-lg mb-8">
                   {view === 'marketplace' 
                     ? "Find exclusive off-market deals from vetted wholesalers." 
                     : "Track leads, analyze numbers, and generate professional reports for lenders and partners."
                   }
                 </p>
                 {user && (
                  <button 
                    onClick={() => setShowAddModal(true)} 
                    className="bg-emerald-500 hover:bg-emerald-400 text-white px-6 py-3 rounded-xl font-bold flex items-center gap-2 transition-all shadow-lg shadow-emerald-900/20 hover:shadow-emerald-900/40 transform hover:-translate-y-1"
                  >
                    <Plus size={20}/> Post New Deal
                  </button>
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
              db={db} 
              userId={user?.uid} 
              __app_id={appId}
              onDeleteDeal={handleDeleteDeal}
              onSelectDeal={handleSelectDeal}
              onEditDeal={handleEditClick}
              isPublic={view === 'marketplace'}
            />
          </div>
        ) : (
          selectedDeal && <DealDetail deal={selectedDeal} onBack={handleBack} onContact={handleContact} />
        )}
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
      />

      <PricingModal 
        isOpen={showPricingModal} 
        onClose={() => setShowPricingModal(false)} 
      />

    </div>
  );
}