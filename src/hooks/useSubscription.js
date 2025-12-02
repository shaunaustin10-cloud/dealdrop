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

    // The extension syncs subscriptions to: customers/{uid}/subscriptions
    const subRef = collection(db, 'customers', user.uid, 'subscriptions');
    const q = query(subRef, where('status', 'in', ['active', 'trialing']));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      if (snapshot.empty) {
        setIsPro(false);
        setSubscription(null);
      } else {
        // Assume the first active subscription is the valid one
        const subDoc = snapshot.docs[0];
        setIsPro(true);
        setSubscription({
          id: subDoc.id,
          ...subDoc.data(),
        });
      }
      setLoading(false);
    }, (error) => {
      console.error("Error fetching subscription:", error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user]);

  return { isPro, subscription, loading };
};
