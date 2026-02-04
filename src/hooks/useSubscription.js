import { useState, useEffect } from 'react';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { db } from '../firebaseConfig';
import { useAuth } from '../context/AuthContext';

// Import Price IDs (Must match PricingModal/Env)
const PRO_IDS = [
    import.meta.env.VITE_STRIPE_PRICE_ID_PRO_MONTHLY,
    import.meta.env.VITE_STRIPE_PRICE_ID_PRO_ANNUAL,
    'price_pro_monthly_placeholder',
    'price_pro_annual_placeholder'
].filter(Boolean);

const BUSINESS_IDS = [
    import.meta.env.VITE_STRIPE_PRICE_ID_BUSINESS_MONTHLY,
    import.meta.env.VITE_STRIPE_PRICE_ID_BUSINESS_ANNUAL,
    'price_1SoZ0KKhuaxmxrluGuHVwAsB', // Founding Member VIP
    'price_business_monthly_placeholder',
    'price_business_annual_placeholder'
].filter(Boolean);

const LITE_IDS = [
    import.meta.env.VITE_STRIPE_PRICE_ID_LITE_MONTHLY,
    import.meta.env.VITE_STRIPE_PRICE_ID_LITE_ANNUAL,
    'price_lite_monthly_placeholder',
    'price_lite_annual_placeholder'
].filter(Boolean);

export const useSubscription = () => {
  const { user } = useAuth();
  const [isPro, setIsPro] = useState(false);
  const [planType, setPlanType] = useState('free');
  const [subscription, setSubscription] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setIsPro(false);
      setPlanType('free');
      setSubscription(null);
      setLoading(false);
      return;
    }

    // 1. Check Profile Tier (Manual/Legacy override)
    // If dev or manual override exists, respect it
    const legacyIsPro = import.meta.env.DEV || user.subscriptionTier === 'pro' || user.subscriptionTier === 'agency';
    if (legacyIsPro && !user.subscriptionTier) {
        // If simply running in dev without specific tier, assume Pro for convenience
        // But if we want to test Lite, we might need to change this.
        // For now, let's stick to existing dev behavior but allow Stripe to override if present.
    }

    // 2. Check Stripe Subscription (Real-time)
    const subRef = collection(db, 'customers', user.uid, 'subscriptions');
    const q = query(subRef, where('status', 'in', ['active', 'trialing']));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      if (snapshot.empty) {
        // No active Stripe sub
        const finalIsPro = legacyIsPro;
        setIsPro(finalIsPro);
        setPlanType(finalIsPro ? (user.subscriptionTier === 'agency' ? 'business' : 'pro') : 'free');
        setSubscription(null);
      } else {
        const subDoc = snapshot.docs[0];
        const subData = subDoc.data();
        
        // Determine Plan based on Price ID
        const priceId = subData.items?.[0]?.price?.id;
        
        let detectedPlan = 'free';
        let unlimitedAccess = false;

        if (BUSINESS_IDS.includes(priceId)) {
            detectedPlan = 'business';
            unlimitedAccess = true;
        } else if (PRO_IDS.includes(priceId)) {
            detectedPlan = 'pro';
            unlimitedAccess = true;
        } else if (LITE_IDS.includes(priceId)) {
            detectedPlan = 'lite';
            unlimitedAccess = false; // Lite is NOT "Pro" (unlimited)
        } else {
            // Fallback for unknown active subs (assume Pro to be safe/generous?)
            // Or default to free? Let's assume Pro if they are paying but ID is unknown.
            detectedPlan = 'pro';
            unlimitedAccess = true;
        }

        setIsPro(unlimitedAccess);
        setPlanType(detectedPlan);
        setSubscription({
          id: subDoc.id,
          ...subData,
        });
      }
      setLoading(false);
    }, (error) => {
      console.error("Error fetching subscription:", error);
      setIsPro(legacyIsPro);
      setPlanType('free');
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user]);

  return { 
    isPro, // True if Pro or Business (Unlimited)
    isVIP: planType === 'pro' || planType === 'business',
    planType, // 'free', 'lite', 'pro', 'business'
    subscription, 
    credits: user?.credits ?? 0, 
    tier: planType,
    loading 
  };
};
