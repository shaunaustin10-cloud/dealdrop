import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { Check, X, Zap, Briefcase, User } from 'lucide-react';
import { createCheckoutSession } from '../services/stripeService';
import { useAuth } from '../context/AuthContext';

// REPLACE THESE WITH ACTUAL STRIPE PRICE IDS
const LITE_PRICE_ID_MONTHLY = import.meta.env.VITE_STRIPE_PRICE_ID_LITE_MONTHLY || 'price_lite_monthly_placeholder';
const LITE_PRICE_ID_ANNUAL = import.meta.env.VITE_STRIPE_PRICE_ID_LITE_ANNUAL || 'price_lite_annual_placeholder';

const PRO_PRICE_ID_MONTHLY = import.meta.env.VITE_STRIPE_PRICE_ID_PRO_MONTHLY || 'price_pro_monthly_placeholder'; 
const PRO_PRICE_ID_ANNUAL = import.meta.env.VITE_STRIPE_PRICE_ID_PRO_ANNUAL || 'price_pro_annual_placeholder';

const BUSINESS_PRICE_ID_MONTHLY = import.meta.env.VITE_STRIPE_PRICE_ID_BUSINESS_MONTHLY || 'price_business_monthly_placeholder';
const BUSINESS_PRICE_ID_ANNUAL = import.meta.env.VITE_STRIPE_PRICE_ID_BUSINESS_ANNUAL || 'price_business_annual_placeholder';

export default function PricingModal({ isOpen, onClose }) {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [billingCycle, setBillingCycle] = useState('monthly'); // 'monthly' or 'annual'

  if (!isOpen) return null;

  const handleUpgrade = async (priceId, planName) => {
    setIsLoading(true);
    setSelectedPlan(planName);
    try {
      if (priceId.includes('placeholder')) {
          alert("This plan is not yet active in Stripe. Please contact support.");
          setIsLoading(false);
          setSelectedPlan(null);
          return;
      }
      await createCheckoutSession(user.uid, priceId);
    } catch (error) {
      console.error("Checkout failed:", error);
      alert("Failed to start checkout: " + error.message);
      setIsLoading(false);
      setSelectedPlan(null);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-sm">
      <div className="relative w-full max-w-6xl bg-slate-900 rounded-2xl border border-slate-800 shadow-2xl overflow-hidden flex flex-col max-h-[95vh]">
        {/* Header */}
        <div className="p-6 md:p-8 text-center border-b border-slate-800 bg-slate-900 flex-shrink-0 relative">
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
          <div className="grid md:grid-cols-3 gap-6">

            {/* Lite Plan */}
            <div className="bg-slate-800/50 border border-slate-700 rounded-2xl p-6 flex flex-col relative hover:border-slate-500 transition-colors">
              <div className="mb-4">
                <div className="w-12 h-12 bg-slate-700 rounded-xl flex items-center justify-center mb-4 text-slate-300">
                  <User size={24} />
                </div>
                <h3 className="text-xl font-bold text-white">Lite Investor</h3>
                <div className="flex items-baseline gap-1 mt-2">
                  <span className="text-3xl font-bold text-white">
                    {billingCycle === 'annual' ? '$15' : '$19'}
                  </span>
                  <span className="text-slate-400">/mo</span>
                </div>
                <p className="text-sm text-slate-400 mt-2">
                    {billingCycle === 'annual' ? 'Billed $180 yearly' : 'Billed monthly'}
                </p>
              </div>

              <ul className="space-y-3 mb-8 flex-1">
                {[
                  "15 AI Analyses / Month",
                  "Standard Reports",
                  "Comparable Sales Data",
                  "Basic Map Features"
                ].map((feature, i) => (
                  <li key={i} className="flex items-center gap-3 text-sm text-slate-300">
                    <Check size={16} className="text-slate-500 flex-shrink-0" />
                    {feature}
                  </li>
                ))}
              </ul>

              <button
                onClick={() => handleUpgrade(billingCycle === 'annual' ? LITE_PRICE_ID_ANNUAL : LITE_PRICE_ID_MONTHLY, 'Lite')}
                disabled={isLoading}
                className="w-full py-3 bg-slate-700 hover:bg-slate-600 text-white font-bold rounded-xl transition-all disabled:opacity-50"
              >
                {isLoading && selectedPlan === 'Lite' ? 'Processing...' : 'Start Lite'}
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
                  "Advanced Market Data (RentCast)",
                  "PDF Report Export",
                  "Street View & Maps",
                  "Priority Cache Access"
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
                  "White-Label Reports (Custom Logo)",
                  "Team Access (3 Seats)",
                  "Priority Support",
                  "Dedicated Account Manager"
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
