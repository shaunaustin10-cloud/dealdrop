import React from 'react';
import { X, Zap, CheckCircle, ArrowRight } from 'lucide-react';

const CreditsExhaustedModal = ({ isOpen, onClose, onUpgrade }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-lg bg-slate-900 border border-emerald-500/30 rounded-3xl shadow-2xl shadow-emerald-900/20 overflow-hidden">
        {/* Top Glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-64 h-24 bg-emerald-500/20 rounded-full blur-3xl pointer-events-none"></div>
        
        <div className="p-8 text-center relative z-10">
          <button 
            onClick={onClose}
            className="absolute top-0 right-0 text-slate-500 hover:text-white transition-colors"
          >
            <X size={20} />
          </button>

          <div className="w-20 h-20 bg-emerald-500/10 rounded-2xl flex items-center justify-center mx-auto mb-6 text-emerald-500 border border-emerald-500/20">
            <Zap size={40} fill="currentColor" />
          </div>

          <h2 className="text-3xl font-black text-white mb-2">You're All Out!</h2>
          <p className="text-slate-400 mb-8">You've used all your free analysis credits. Upgrade to Pro to unlock unlimited data and professional reports.</p>

          <div className="bg-slate-800/50 rounded-2xl p-6 mb-8 text-left border border-slate-700">
            <h4 className="text-emerald-400 font-bold text-xs uppercase tracking-widest mb-4">Pro Benefits:</h4>
            <ul className="space-y-3">
              <li className="flex items-start gap-3 text-sm text-slate-300">
                <CheckCircle size={16} className="text-emerald-500 mt-0.5 shrink-0" />
                <span><strong>Unlimited</strong> AI Deal Analyses</span>
              </li>
              <li className="flex items-start gap-3 text-sm text-slate-300">
                <CheckCircle size={16} className="text-emerald-500 mt-0.5 shrink-0" />
                <span>Full Rent & ARV Market Reports</span>
              </li>
              <li className="flex items-start gap-3 text-sm text-slate-300">
                <CheckCircle size={16} className="text-emerald-500 mt-0.5 shrink-0" />
                <span>One-Click PDF Export for Clients</span>
              </li>
            </ul>
          </div>

          <button
            onClick={onUpgrade}
            className="w-full py-4 bg-emerald-500 hover:bg-emerald-400 text-white font-black rounded-xl transition-all shadow-lg shadow-emerald-900/40 flex items-center justify-center gap-2 group"
          >
            Upgrade to Pro Now <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
          </button>
          
          <button 
            onClick={onClose}
            className="mt-4 text-slate-500 hover:text-slate-300 text-sm font-bold transition-colors"
          >
            Maybe Later
          </button>
        </div>
      </div>
    </div>
  );
};

export default CreditsExhaustedModal;
