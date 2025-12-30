import { doc, setDoc, getDoc, updateDoc, increment, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebaseConfig';

const appId = import.meta.env.VITE_APP_ID || 'default-app-id';

/**
 * Decrements the user's credit count by 1.
 * Returns true if successful (credits were > 0), false if insufficient credits.
 */
export const decrementUserCredits = async (uid) => {
  if (!uid) return false;
  
  const userRef = doc(db, 'artifacts', appId, 'profiles', uid);
  
  try {
    const snap = await getDoc(userRef);
    if (!snap.exists()) return false;
    
    const data = snap.data();
    // Allow if Pro (unlimited) or if credits > 0
    if ((data.subscriptionTier === 'pro' || data.subscriptionTier === 'agency') || (data.credits && data.credits > 0)) {
        // Only decrement if NOT pro
        if (data.subscriptionTier !== 'pro' && data.subscriptionTier !== 'agency') {
            await updateDoc(userRef, { credits: increment(-1) });
        }
        return true;
    }
    
    return false;
  } catch (error) {
    console.error("Error decrementing credits:", error);
    return false;
  }
};

/**
 * Creates or updates a public user profile in Firestore.
 * This should be called after successful registration.
 */
export const createUserProfile = async (uid, userData) => {
  if (!uid) {
    console.error("❌ createUserProfile: No UID provided");
    return;
  }

  console.log(`🔧 DEBUG: Creating user profile for UID: ${uid} in App: ${appId}`);

  const userRef = doc(db, 'artifacts', appId, 'profiles', uid);
  
  // Only store safe, public information here
  const profileData = {
    displayName: userData.displayName || 'Real Estate Investor',
    email: userData.email, // Optional: might want to hide this depending on privacy pref
    photoURL: userData.photoURL || `https://api.dicebear.com/9.x/initials/svg?seed=${userData.displayName || 'User'}`,
    bio: userData.bio || 'Active real estate investor looking for deals.',
    role: userData.role || 'investor', // investor, wholesaler, agent
    joinedAt: serverTimestamp(),
    subscriptionTier: 'free',
    credits: 3, // Initial free credits
  };

  try {
    await setDoc(userRef, profileData, { merge: true });
    console.log("✅ DEBUG: User profile created successfully");
  } catch (error) {
    console.error("❌ DEBUG: Error creating user profile:", error);
    throw error;
  }
};

/**
 * Fetches a public user profile by UID.
 */
export const getUserProfile = async (uid) => {
  if (!uid) return null;
  
  try {
    const userRef = doc(db, 'artifacts', appId, 'profiles', uid);
    const snapshot = await getDoc(userRef);
    
    if (snapshot.exists()) {
      return { id: snapshot.id, ...snapshot.data() };
    }
    return null;
  } catch (error) {
    console.error("Error fetching user profile:", error);
    return null;
  }
};

/**
 * Updates the user's Buy Box criteria.
 */
export const updateUserBuyBox = async (uid, buyBoxData) => {
  if (!uid) return;

  const userRef = doc(db, 'artifacts', appId, 'profiles', uid);
  
  try {
    await setDoc(userRef, { buyBox: buyBoxData }, { merge: true });
  } catch (error) {
    console.error("Error updating buy box:", error);
    throw error;
  }
};

/**
 * Updates the user's profile to mark onboarding as complete.
 */
export const completeOnboarding = async (uid) => {
  if (!uid) return;
  const userRef = doc(db, 'artifacts', appId, 'profiles', uid);
  try {
    await updateDoc(userRef, { hasOnboarded: true });
  } catch (error) {
    console.error("Error updating onboarding status:", error);
  }
};

