import React, { useState } from 'react';
import { Check, X, Zap } from 'lucide-react';
import { createCheckoutSession } from '../services/stripeService';
import { useAuth } from '../context/AuthContext';

// REPLACE THIS WITH YOUR ACTUAL STRIPE PRICE ID LATER
const PRO_PRICE_ID = import.meta.env.VITE_STRIPE_PRICE_ID || 'price_12345_placeholder'; 

export default function PricingModal({ isOpen, onClose }) {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);

  if (!isOpen) return null;

  const handleUpgrade = async () => {
    setIsLoading(true);
    try {
      await createCheckoutSession(user.uid, PRO_PRICE_ID);
      // Browser will redirect, no need to stop loading state
    } catch (error) {
      console.error("Checkout failed:", error);
      alert("Failed to start checkout: " + error.message);
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
      <div className="relative w-full max-w-md bg-slate-900 rounded-2xl border border-slate-800 shadow-2xl overflow-hidden">
        {/* Close Button */}
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-white transition-colors"
        >
          <X size={24} />
        </button>

        {/* Header */}
        <div className="p-8 text-center border-b border-slate-800 bg-slate-900">
          <div className="w-16 h-16 bg-emerald-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <Zap size={32} className="text-emerald-500" />
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">Upgrade to Pro</h2>
          <p className="text-slate-400">Unlock the full power of REI Deal Drop.</p>
        </div>

        {/* Content */}
        <div className="p-8 space-y-6">
          <div className="flex items-baseline justify-center gap-1">
            <span className="text-4xl font-bold text-white">$49</span>
            <span className="text-slate-400">/month</span>
          </div>

          <ul className="space-y-4">
            {[
              "Unlimited Deal Analysis (AI)",
              "Advanced Property Data (RentCast)",
              "Priority Support",
              "Manager Mode Access",
              "Export Reports to PDF"
            ].map((feature, i) => (
              <li key={i} className="flex items-center gap-3 text-slate-300">
                <div className="bg-emerald-500/20 p-1 rounded-full">
                  <Check size={14} className="text-emerald-400" />
                </div>
                {feature}
              </li>
            ))}
          </ul>

          <button
            onClick={handleUpgrade}
            disabled={isLoading}
            className="w-full py-4 bg-emerald-500 hover:bg-emerald-400 text-white font-bold rounded-xl transition-all shadow-lg shadow-emerald-900/20 hover:shadow-emerald-900/40 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {isLoading ? 'Redirecting to Stripe...' : 'Upgrade Now'}
          </button>
          
          <p className="text-center text-xs text-slate-500">
            Secure payments powered by Stripe. Cancel anytime.
          </p>
        </div>
      </div>
    </div>
  );
}
