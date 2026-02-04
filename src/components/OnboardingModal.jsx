import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { completeOnboarding, updateUserProfile } from '../services/userService';
import { ArrowRight, LayoutGrid, FileText, CheckCircle2, User, DollarSign, Building2, TrendingUp, Loader2 } from 'lucide-react';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../firebaseConfig';

const appId = import.meta.env.VITE_APP_ID || 'default-app-id';

const OnboardingModal = () => {
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [step, setStep] = useState(1); // 1: Welcome, 2: Questionnaire, 3: Success
  const [loading, setLoading] = useState(false);
  
  // Questionnaire State
  const [formData, setFormData] = useState({
    experience: '0', // '0', '1-5', '5+'
    funding: 'cash', // 'cash', 'hardmoney', 'private', 'heloc'
    llcName: '',
    buyBox: ''
  });

  useEffect(() => {
    const checkOnboarding = async () => {
      if (!user) return;
      try {
        const docRef = doc(db, 'artifacts', appId, 'profiles', user.uid);
        const snap = await getDoc(docRef);
        if (snap.exists()) {
          const data = snap.data();
          if (!data.hasOnboarded) {
             setTimeout(() => setIsOpen(true), 1500);
          }
        }
      } catch (e) {
        console.error("Error checking onboarding:", e);
      }
    };
    checkOnboarding();
  }, [user]);

  const handleNext = () => setStep(prev => prev + 1);

  const handleSubmitVetting = async () => {
    setLoading(true);
    try {
        if (user) {
            await updateUserProfile(user.uid, {
                vetting: formData,
                isPendingVerification: true // Mark for admin review
            });
            handleNext();
        }
    } catch (e) {
        alert("Failed to save profile. Please try again.");
    } finally {
        setLoading(false);
    }
  };

  const handleFinish = async () => {
    setIsOpen(false);
    if (user) {
        await completeOnboarding(user.uid);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-md animate-fade-in">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 w-full max-w-lg rounded-3xl shadow-2xl flex flex-col relative overflow-hidden transition-all duration-500">
        
        {/* Background Accents */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl -mr-32 -mt-32 pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl -ml-32 -mb-32 pointer-events-none"></div>

        {/* Step 1: Welcome */}
        {step === 1 && (
            <div className="p-8 relative z-10 text-center animate-in fade-in zoom-in duration-300">
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
                      <div className="bg-emerald-500/10 p-2 rounded-lg text-emerald-500 mt-1">
                          <FileText size={20} />
                      </div>
                      <div>
                          <h4 className="font-bold text-slate-900 dark:text-white text-sm">2. Download Report</h4>
                          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Generate a professional PDF packet to send to buyers or lenders.</p>
                      </div>
                  </div>
               </div>

               <button 
                 onClick={handleNext}
                 className="w-full bg-emerald-500 hover:bg-emerald-400 text-white font-bold py-4 rounded-2xl shadow-xl shadow-emerald-500/20 flex items-center justify-center gap-2 transition-transform hover:scale-[1.02]"
               >
                 Set Up Your Profile <ArrowRight size={20} />
               </button>
            </div>
        )}

        {/* Step 2: Vetting Questionnaire */}
        {step === 2 && (
            <div className="p-8 relative z-10 animate-in slide-in-from-right duration-300">
                <div className="mb-6">
                    <h2 className="text-2xl font-black text-slate-900 dark:text-white">Investor Vetting</h2>
                    <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">Complete your profile to unlock full property addresses and VIP deals.</p>
                </div>

                <div className="space-y-6">
                    {/* Experience */}
                    <div>
                        <label className="block text-slate-500 dark:text-slate-400 text-[10px] uppercase font-black tracking-widest mb-2 flex items-center gap-2">
                           <TrendingUp size={12} /> Investing Experience
                        </label>
                        <div className="grid grid-cols-3 gap-2">
                            {[
                                { label: '0 Deals', value: '0' },
                                { label: '1-5 Deals', value: '1-5' },
                                { label: '5+ Deals', value: '5+' }
                            ].map(opt => (
                                <button
                                    key={opt.value}
                                    onClick={() => setFormData({...formData, experience: opt.value})}
                                    className={`py-3 text-xs font-bold rounded-xl border transition-all ${formData.experience === opt.value ? 'bg-emerald-500 border-emerald-500 text-white shadow-lg shadow-emerald-500/20' : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-500'}`}
                                >
                                    {opt.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Funding */}
                    <div>
                        <label className="block text-slate-500 dark:text-slate-400 text-[10px] uppercase font-black tracking-widest mb-2 flex items-center gap-2">
                           <DollarSign size={12} /> Primary Funding Source
                        </label>
                        <select 
                            value={formData.funding}
                            onChange={(e) => setFormData({...formData, funding: e.target.value})}
                            className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-3 text-sm font-bold text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 outline-none"
                        >
                            <option value="cash">Cash / Liquid Assets</option>
                            <option value="hardmoney">Hard Money Lender</option>
                            <option value="private">Private Money / Partners</option>
                            <option value="heloc">HELOC / Line of Credit</option>
                            <option value="other">Other / Wholesale</option>
                        </select>
                    </div>

                    {/* LLC Name */}
                    <div>
                        <label className="block text-slate-500 dark:text-slate-400 text-[10px] uppercase font-black tracking-widest mb-2 flex items-center gap-2">
                           <Building2 size={12} /> Investing Entity / LLC (Optional)
                        </label>
                        <input 
                            type="text"
                            value={formData.llcName}
                            onChange={(e) => setFormData({...formData, llcName: e.target.value})}
                            placeholder="e.g. Acme Investments LLC"
                            className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-3 text-sm font-bold text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 outline-none"
                        />
                        <p className="text-[10px] text-slate-500 mt-2 italic">Recommended for faster address verification.</p>
                    </div>
                </div>

                <div className="mt-10">
                    <button 
                        onClick={handleSubmitVetting}
                        disabled={loading}
                        className="w-full bg-emerald-500 hover:bg-emerald-400 text-white font-bold py-4 rounded-2xl shadow-xl shadow-emerald-500/20 flex items-center justify-center gap-2 transition-all disabled:opacity-50"
                    >
                        {loading ? <Loader2 className="animate-spin" /> : <CheckCircle2 size={20} />}
                        {loading ? 'Saving Profile...' : 'Submit for Verification'}
                    </button>
                    <button onClick={handleFinish} className="w-full text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 text-xs font-bold mt-4 transition-colors">
                        Skip for now
                    </button>
                </div>
            </div>
        )}

        {/* Step 3: Success */}
        {step === 3 && (
            <div className="p-8 relative z-10 text-center animate-in zoom-in duration-300">
                <div className="w-20 h-20 bg-emerald-500/10 rounded-full mx-auto flex items-center justify-center mb-6">
                    <CheckCircle2 size={48} className="text-emerald-500" />
                </div>
                <h2 className="text-2xl font-black text-slate-900 dark:text-white mb-2">Profile Submitted!</h2>
                <p className="text-slate-500 dark:text-slate-400 mb-8 max-w-sm mx-auto">
                    Thanks! We&apos;ll review your profile. In the meantime, you can explore the marketplace and run your own deal analyses.
                </p>

                <button 
                    onClick={handleFinish}
                    className="w-full bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-black py-4 rounded-2xl flex items-center justify-center gap-2 transition-transform hover:scale-[1.02]"
                >
                    Go to Dashboard <ArrowRight size={20} />
                </button>
            </div>
        )}
      </div>
    </div>
  );
};

export default OnboardingModal;
