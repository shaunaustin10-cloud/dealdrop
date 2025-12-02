import { doc, setDoc, getDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebaseConfig';

const appId = import.meta.env.VITE_APP_ID || 'default-app-id';

/**
 * Creates or updates a public user profile in Firestore.
 * This should be called after successful registration.
 */
export const createUserProfile = async (uid, userData) => {
  if (!uid) return;

  const userRef = doc(db, 'artifacts', appId, 'profiles', uid);
  
  // Only store safe, public information here
  const profileData = {
    displayName: userData.displayName || 'Real Estate Investor',
    email: userData.email, // Optional: might want to hide this depending on privacy pref
    photoURL: userData.photoURL || `https://api.dicebear.com/9.x/initials/svg?seed=${userData.displayName || 'User'}`,
    bio: userData.bio || 'Active real estate investor looking for deals.',
    role: userData.role || 'investor', // investor, wholesaler, agent
    joinedAt: serverTimestamp(),
  };

  try {
    await setDoc(userRef, profileData, { merge: true });
  } catch (error) {
    console.error("Error creating user profile:", error);
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
 * Fetches the user's Buy Box criteria.
 */
export const getUserBuyBox = async (uid) => {
  if (!uid) return null;
  
  try {
    const userRef = doc(db, 'artifacts', appId, 'profiles', uid);
    const snapshot = await getDoc(userRef);
    
    if (snapshot.exists() && snapshot.data().buyBox) {
      return snapshot.data().buyBox;
    }
    return null;
  } catch (error) {
    console.error("Error fetching buy box:", error);
    return null;
  }
};
