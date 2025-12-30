import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { completeOnboarding } from '../services/userService';
import { CheckCircle, ArrowRight, LayoutGrid, FileText, Zap } from 'lucide-react';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../firebaseConfig';

const appId = import.meta.env.VITE_APP_ID || 'default-app-id';

const OnboardingModal = () => {
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [step, setStep] = useState(0);

  useEffect(() => {
    const checkOnboarding = async () => {
      if (!user) return;
      try {
        const docRef = doc(db, 'artifacts', appId, 'profiles', user.uid);
        const snap = await getDoc(docRef);
        if (snap.exists()) {
          const data = snap.data();
          // Check if explicit false/undefined. If true, don't show.
          if (!data.hasOnboarded) {
             // Delay slightly for smoother UX
             setTimeout(() => setIsOpen(true), 1500);
          }
        }
      } catch (e) {
        console.error("Error checking onboarding:", e);
      }
    };
    checkOnboarding();
  }, [user]);

  const handleComplete = async () => {
    setIsOpen(false);
    if (user) {
        await completeOnboarding(user.uid);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-md animate-fade-in">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 w-full max-w-lg rounded-3xl shadow-2xl flex flex-col relative overflow-hidden">
        
        {/* Background Accents */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl -mr-32 -mt-32 pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl -ml-32 -mb-32 pointer-events-none"></div>

        <div className="p-8 relative z-10 text-center">
           <div className="w-16 h-16 bg-emerald-500 rounded-2xl mx-auto flex items-center justify-center mb-6 shadow-lg shadow-emerald-500/30">
             <LayoutGrid size={32} className="text-white" />
           </div>
           
           <h2 className="text-2xl font-black text-slate-900 dark:text-white mb-2">Welcome to Deal Drop!</h2>
           <p className="text-slate-500 dark:text-slate-400 mb-8 max-w-sm mx-auto">
             Your new command center for analyzing and closing real estate deals faster than ever.
           </p>

           <div className="space-y-4 text-left max-w-sm mx-auto mb-8">
              <div className="flex gap-4 items-start p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700">
                  <div className="bg-blue-500/10 p-2 rounded-lg text-blue-500 mt-1">
                      <LayoutGrid size={20} />
                  </div>
                  <div>
                      <h4 className="font-bold text-slate-900 dark:text-white text-sm">1. Add a Property</h4>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Enter any US address to instantly fetch market data and photos.</p>
                  </div>
              </div>
              
              <div className="flex gap-4 items-start p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700">
                  <div className="bg-purple-500/10 p-2 rounded-lg text-purple-500 mt-1">
                      <Zap size={20} />
                  </div>
                  <div>
                      <h4 className="font-bold text-slate-900 dark:text-white text-sm">2. Run AI Analysis</h4>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Get an instant "Buy" or "Pass" verdict based on profitability.</p>
                  </div>
              </div>

              <div className="flex gap-4 items-start p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700">
                  <div className="bg-emerald-500/10 p-2 rounded-lg text-emerald-500 mt-1">
                      <FileText size={20} />
                  </div>
                  <div>
                      <h4 className="font-bold text-slate-900 dark:text-white text-sm">3. Download Report</h4>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Generate a professional PDF packet to send to buyers or lenders.</p>
                  </div>
              </div>
           </div>

           <button 
             onClick={handleComplete}
             className="w-full bg-emerald-500 hover:bg-emerald-400 text-white font-bold py-4 rounded-2xl shadow-xl shadow-emerald-500/20 flex items-center justify-center gap-2 transition-transform hover:scale-[1.02]"
           >
             Let's Get Started <ArrowRight size={20} />
           </button>
        </div>
      </div>
    </div>
  );
};

export default OnboardingModal;
