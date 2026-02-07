import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { Check, X, Zap, Briefcase, Star } from 'lucide-react';
import { createCheckoutSession } from '../services/stripeService';
import { useAuth } from '../context/AuthContext';
import { doc, onSnapshot } from 'firebase/firestore';
import { db } from '../firebaseConfig';

const appId = import.meta.env.VITE_APP_ID || 'default-app-id';

// PRICE IDS
const FOUNDING_PRICE_ID = 'price_1SoZ0KKhuaxmxrluGuHVwAsB';

const PRO_PRICE_ID_MONTHLY = import.meta.env.VITE_STRIPE_PRICE_ID_PRO_MONTHLY || 'price_pro_monthly_placeholder'; 
const PRO_PRICE_ID_ANNUAL = import.meta.env.VITE_STRIPE_PRICE_ID_PRO_ANNUAL || 'price_pro_annual_placeholder';

const BUSINESS_PRICE_ID_MONTHLY = import.meta.env.VITE_STRIPE_PRICE_ID_BUSINESS_MONTHLY || 'price_business_monthly_placeholder';
const BUSINESS_PRICE_ID_ANNUAL = import.meta.env.VITE_STRIPE_PRICE_ID_BUSINESS_ANNUAL || 'price_business_annual_placeholder';

export default function PricingModal({ isOpen, onClose }) {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [billingCycle, setBillingCycle] = useState('monthly'); // 'monthly' or 'annual'
  const [foundingCount, setFoundingCount] = useState(42); // Default fallback

  useEffect(() => {
    if (!isOpen) return;
    
    // Listen to real-time member count (simulated or real doc)
    const statsRef = doc(db, 'artifacts', appId, 'stats', 'subscriptions');
    const unsub = onSnapshot(statsRef, (snap) => {
        if (snap.exists()) {
            setFoundingCount(snap.data().foundingMemberCount || 0);
        }
    }, (err) => {
        console.warn("Could not fetch real-time count, using fallback", err);
    });
    
    return () => unsub();
  }, [isOpen]);

  if (!isOpen) return null;

  const handleUpgrade = async (priceId, planName, trialDays = 0) => {
    setIsLoading(true);
    setSelectedPlan(planName);
    try {
      if (priceId.includes('placeholder')) {
          alert("This plan is not yet active in Stripe. Please contact support.");
          setIsLoading(false);
          setSelectedPlan(null);
          return;
      }
      await createCheckoutSession(user.uid, priceId, 'subscription', {}, trialDays);
    } catch (error) {
      console.error("Checkout failed:", error);
      alert("Failed to start checkout: " + error.message);
      setIsLoading(false);
      setSelectedPlan(null);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-midnight/90 backdrop-blur-sm">
      <div className="relative w-full max-w-6xl bg-midnight rounded-2xl border border-slate-800 shadow-2xl overflow-hidden flex flex-col max-h-[95vh]">
        {/* Header */}
        <div className="p-6 md:p-8 text-center border-b border-slate-800 bg-midnight flex-shrink-0 relative">
          <button 
            onClick={onClose}
            className="absolute top-6 right-6 text-slate-400 hover:text-white transition-colors"
          >
            <X size={24} />
          </button>
          <h2 className="text-3xl font-bold text-white mb-2">Choose Your Plan</h2>
          <p className="text-slate-400 mb-6">Unlock advanced analysis and professional reporting.</p>

          {/* Billing Toggle */}
          <div className="flex items-center justify-center gap-4">
            <span className={`text-sm font-bold ${billingCycle === 'monthly' ? 'text-white' : 'text-slate-500'}`}>Monthly</span>
            <button 
              onClick={() => setBillingCycle(prev => prev === 'monthly' ? 'annual' : 'monthly')}
              className="w-14 h-7 bg-slate-700 rounded-full relative transition-colors focus:outline-none"
            >
              <div className={`absolute top-1 w-5 h-5 bg-emerald-500 rounded-full transition-transform ${billingCycle === 'annual' ? 'left-8' : 'left-1'}`}></div>
            </button>
            <span className={`text-sm font-bold flex items-center gap-2 ${billingCycle === 'annual' ? 'text-white' : 'text-slate-500'}`}>
              Annual <span className="bg-emerald-500/20 text-emerald-400 text-[10px] px-2 py-0.5 rounded-full uppercase tracking-wider">Save 20%</span>
            </span>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 md:p-8 overflow-y-auto custom-scrollbar">
          
          {/* Urgent Banner for Founding Members */}
          {foundingCount < 100 && (
              <div className="mb-10 bg-gradient-to-r from-amber-500/20 to-orange-500/20 border border-amber-500/30 rounded-2xl p-6 flex flex-col md:flex-row items-center justify-between gap-6 animate-pulse-slow">
                  <div className="flex items-center gap-4">
                      <div className="bg-amber-500 p-3 rounded-full text-white shadow-lg shadow-amber-900/40">
                          <Star size={24} fill="currentColor" />
                      </div>
                      <div>
                          <h3 className="text-xl font-black text-white uppercase tracking-tight">Founding Member Special</h3>
                          <p className="text-amber-200/80 text-sm">Join the first 100 investors for lifetime VIP pricing + 7-day free trial.</p>
                      </div>
                  </div>
                  <div className="w-full md:w-64 space-y-2">
                      <div className="flex justify-between text-xs font-bold uppercase tracking-widest text-amber-500">
                          <span>{foundingCount}/100 Spots Taken</span>
                          <span>{100 - foundingCount} Left</span>
                      </div>
                      <div className="h-3 bg-slate-800 rounded-full overflow-hidden border border-amber-500/20">
                          <div 
                            className="h-full bg-gradient-to-r from-amber-600 to-amber-400 transition-all duration-1000 shadow-[0_0_10px_rgba(245,158,11,0.5)]" 
                            style={{ width: `${foundingCount}%` }}
                          ></div>
                      </div>
                  </div>
              </div>
          )}

          <div className="grid md:grid-cols-3 gap-6">

            {/* Founding Member Plan (Replacing Lite) */}
            <div className={`border-2 rounded-2xl p-6 flex flex-col relative transition-all duration-500 ${foundingCount < 100 ? 'bg-amber-500/5 border-amber-500 shadow-2xl shadow-amber-900/10' : 'bg-slate-800/50 border-slate-700 opacity-60 grayscale'}`}>
              {foundingCount < 100 && (
                  <div className="absolute top-0 right-6 -translate-y-1/2 bg-amber-500 text-white px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest shadow-lg">
                    Limited Offer
                  </div>
              )}
              <div className="mb-4">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 ${foundingCount < 100 ? 'bg-amber-500 text-white' : 'bg-slate-700 text-slate-400'}`}>
                  <Star size={24} />
                </div>
                <h3 className="text-xl font-bold text-white">Founding VIP</h3>
                <div className="flex items-baseline gap-1 mt-2">
                  <span className="text-3xl font-black text-white">$19</span>
                  <span className="text-slate-400">/mo</span>
                  <span className="ml-2 text-xs text-slate-500 line-through">$49/mo</span>
                </div>
                <p className="text-xs text-amber-500 font-bold mt-2 uppercase tracking-tight">
                    {foundingCount < 100 ? 'Includes 7-Day Free Trial' : 'Offer Expired'}
                </p>
              </div>

              <ul className="space-y-3 mb-8 flex-1">
                {[
                  "Unlimited AI Analysis",
                  "VIP First Look Access (>=84)",
                  "7-Day FREE Trial",
                  "Locked-in $19/mo for Life",
                  "Early Access to Features"
                ].map((feature, i) => (
                  <li key={i} className="flex items-center gap-3 text-sm text-slate-300">
                    <Check size={16} className={`${foundingCount < 100 ? 'text-amber-500' : 'text-slate-600'} flex-shrink-0`} />
                    {feature}
                  </li>
                ))}
              </ul>

              <button
                onClick={() => handleUpgrade(FOUNDING_PRICE_ID, 'Founding VIP', 7)}
                disabled={isLoading || foundingCount >= 100}
                className={`w-full py-3 font-black rounded-xl transition-all shadow-lg uppercase tracking-wider text-sm ${foundingCount < 100 ? 'bg-amber-500 hover:bg-amber-400 text-white shadow-amber-900/40' : 'bg-slate-700 text-slate-500 cursor-not-allowed'}`}
              >
                {isLoading && selectedPlan === 'Founding VIP' ? 'Processing...' : (foundingCount < 100 ? 'Claim Founding Spot' : 'Offer Expired')}
              </button>
            </div>
            
            {/* Pro Plan */}
            <div className="bg-slate-800/80 border border-emerald-500 rounded-2xl p-6 flex flex-col relative transform md:-translate-y-4 shadow-xl shadow-emerald-900/10">
               <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-emerald-500 text-white px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide whitespace-nowrap">
                Most Popular
              </div>
              <div className="mb-4">
                <div className="w-12 h-12 bg-emerald-500/10 rounded-xl flex items-center justify-center mb-4 text-emerald-500">
                  <Zap size={24} />
                </div>
                <h3 className="text-xl font-bold text-white">Pro Investor</h3>
                <div className="flex items-baseline gap-1 mt-2">
                  <span className="text-3xl font-bold text-white">
                    {billingCycle === 'annual' ? '$39' : '$49'}
                  </span>
                  <span className="text-slate-400">/mo</span>
                </div>
                <p className="text-sm text-slate-400 mt-2">
                    {billingCycle === 'annual' ? 'Billed $468 yearly' : 'Billed monthly'}
                </p>
              </div>

              <ul className="space-y-3 mb-8 flex-1">
                {[
                  "Unlimited* AI Analysis",
                  "VIP First Look Access (>=84 Score)",
                  "Advanced Market Data (RentCast)",
                  "PDF Report Export",
                  "Street View & Maps",
                ].map((feature, i) => (
                  <li key={i} className="flex items-center gap-3 text-sm text-white font-medium">
                    <Check size={16} className="text-emerald-400 flex-shrink-0" />
                    {feature}
                  </li>
                ))}
              </ul>

              <button
                onClick={() => handleUpgrade(billingCycle === 'annual' ? PRO_PRICE_ID_ANNUAL : PRO_PRICE_ID_MONTHLY, 'Pro')}
                disabled={isLoading}
                className="w-full py-3 bg-emerald-500 hover:bg-emerald-400 text-white font-bold rounded-xl transition-all shadow-lg shadow-emerald-900/30 disabled:opacity-50"
              >
                {isLoading && selectedPlan === 'Pro' ? 'Processing...' : 'Upgrade to Pro'}
              </button>
              <p className="text-[10px] text-slate-500 text-center mt-2">*Fair Use Policy applies (100 detailed reports/mo)</p>
            </div>

            {/* Business Plan */}
            <div className="bg-gradient-to-b from-slate-800 to-slate-900 border border-blue-500/30 rounded-2xl p-6 flex flex-col relative hover:border-blue-500 transition-colors">
              <div className="mb-4">
                <div className="w-12 h-12 bg-blue-500/10 rounded-xl flex items-center justify-center mb-4 text-blue-400">
                  <Briefcase size={24} />
                </div>
                <h3 className="text-xl font-bold text-white">Business Class</h3>
                <div className="flex items-baseline gap-1 mt-2">
                  <span className="text-3xl font-bold text-white">
                    {billingCycle === 'annual' ? '$119' : '$149'}
                  </span>
                  <span className="text-slate-400">/mo</span>
                </div>
                <p className="text-sm text-slate-400 mt-2">
                    {billingCycle === 'annual' ? 'Billed $1428 yearly' : 'Billed monthly'}
                </p>
              </div>

              <ul className="space-y-3 mb-8 flex-1">
                {[
                  "Everything in Pro",
                  "VIP First Look Access",
                  "White-Label Reports (Custom Logo)",
                  "Team Access (3 Seats)",
                  "Priority Support",
                ].map((feature, i) => (
                  <li key={i} className="flex items-center gap-3 text-sm text-slate-300">
                    <Check size={16} className="text-blue-500 flex-shrink-0" />
                    {feature}
                  </li>
                ))}
              </ul>

              <button
                onClick={() => handleUpgrade(billingCycle === 'annual' ? BUSINESS_PRICE_ID_ANNUAL : BUSINESS_PRICE_ID_MONTHLY, 'Business')}
                disabled={isLoading}
                className="w-full py-3 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl transition-all shadow-lg shadow-blue-900/30 disabled:opacity-50"
              >
                {isLoading && selectedPlan === 'Business' ? 'Processing...' : 'Get Business'}
              </button>
            </div>

          </div>
          
          <p className="text-center text-xs text-slate-500 mt-6">
            Secure payments powered by Stripe. Cancel anytime.
          </p>
        </div>
      </div>
    </div>
  );
}

PricingModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
};
