import { addDoc, collection, onSnapshot } from 'firebase/firestore';
import { db } from '../firebaseConfig';

/**
 * Starts a Stripe Checkout session for the given Price ID.
 * @param {string} userId - The current user's UID.
 * @param {string} priceId - The Stripe Price ID (price_...) to purchase.
 * @param {string} mode - 'subscription' or 'payment' (default: 'subscription').
 * @param {object} metadata - Optional metadata to attach to the session (e.g. { dealId: '123' }).
 * @param {number} trialDays - Number of trial days for subscriptions.
 * @returns {Promise<void>} - Redirects the browser to Stripe.
 */
export const createCheckoutSession = async (userId, priceId, mode = 'subscription', metadata = {}, trialDays = 0) => {
  if (!userId || !priceId) throw new Error("Missing userId or priceId");

  // 1. Create a doc in customers/{uid}/checkout_sessions
  const sessionsRef = collection(db, 'customers', userId, 'checkout_sessions');
  const sessionData = {
    price: priceId,
    success_url: window.location.origin + '/dashboard?success=true',
    cancel_url: window.location.origin + '/dashboard?canceled=true',
    mode: mode,
    allow_promotion_codes: true,
    payment_method_types: ['card'],
    metadata: metadata
  };

  if (mode === 'subscription' && trialDays > 0) {
    sessionData.subscription_data = {
        trial_period_days: trialDays
    };
  }

  const docRef = await addDoc(sessionsRef, sessionData);

  // 2. Listen for the extension to attach the 'url' field to the doc
  return new Promise((resolve, reject) => {
    const unsubscribe = onSnapshot(docRef, (snap) => {
      const { error, url } = snap.data() || {};
      if (error) {
        unsubscribe();
        reject(new Error(`An error occurred: ${error.message}`));
      }
      if (url) {
        unsubscribe();
        // 3. Redirect to Stripe
        window.location.assign(url);
        resolve();
      }
    });
  });
};

/**
 * Redirects the user to the Stripe Customer Portal to manage their sub.
 */
export const createPortalSession = async () => {
    // Note: The extension also provides a callable function for the portal
    // typically named 'ext-firestore-stripe-payments-createPortalLink'
    // If using the client SDK, this is easier, but for now, we will assume 
    // standard cloud function capability if enabled, OR simpler:
    // just link them to a generic "Manage Subscription" page if you haven't enabled the portal in Stripe.
    
    // For MVP, we might skip the portal integration unless strictly requested,
    // as it requires enabling the Portal in Stripe Dashboard settings first.
    console.log("Portal navigation not yet implemented.");
};
