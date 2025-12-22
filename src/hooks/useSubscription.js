import { useState, useEffect } from 'react';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { db } from '../firebaseConfig';
import { useAuth } from '../context/AuthContext';

export const useSubscription = () => {
  const { user } = useAuth();
  const [isPro, setIsPro] = useState(false);
  const [subscription, setSubscription] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setIsPro(false);
      setSubscription(null);
      setLoading(false);
      return;
    }

    // 1. Check Profile Tier (Manual/Legacy)
    const profileIsPro = import.meta.env.DEV || user.subscriptionTier === 'pro' || user.subscriptionTier === 'agency';

    // 2. Check Stripe Subscription (Real-time)
    const subRef = collection(db, 'customers', user.uid, 'subscriptions');
    const q = query(subRef, where('status', 'in', ['active', 'trialing']));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      if (snapshot.empty) {
        setIsPro(profileIsPro); // Fallback to profile status if no Stripe sub
        setSubscription(null);
      } else {
        const subDoc = snapshot.docs[0];
        setIsPro(true); // Stripe says active
        setSubscription({
          id: subDoc.id,
          ...subDoc.data(),
        });
      }
      setLoading(false);
    }, (error) => {
      console.error("Error fetching subscription:", error);
      // Fallback on error
      setIsPro(profileIsPro);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user]);

  return { 
    isPro, 
    subscription, 
    credits: user?.credits ?? 0, // Expose credits
    tier: user?.subscriptionTier || 'free',
    loading 
  };
};
