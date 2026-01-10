import React, { createContext, useContext, useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { doc, onSnapshot } from 'firebase/firestore';
import { auth, db } from '../firebaseConfig';
import { Navigate } from 'react-router-dom';

const appId = import.meta.env.VITE_APP_ID || 'default-app-id';
const AuthContext = createContext(null);

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let profileUnsubscribe = null;

    const authUnsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser) {
        // User is signed in, listen to their profile
        const profileRef = doc(db, 'artifacts', appId, 'profiles', currentUser.uid);
        
        profileUnsubscribe = onSnapshot(profileRef, (docSnap) => {
          if (docSnap.exists()) {
            // Merge Auth User + Firestore Profile
            setUser({ ...currentUser, ...docSnap.data() });
          } else {
            // Fallback if profile doesn't exist yet
            setUser(currentUser);
          }
          setLoading(false);
        }, (err) => {
          console.error("Profile sync error:", err);
          setUser(currentUser); // Still allow login even if profile fails
          setLoading(false);
        });

      } else {
        // User is signed out
        if (profileUnsubscribe) profileUnsubscribe();
        setUser(null);
        setLoading(false);
      }
    });

    return () => {
      authUnsubscribe();
      if (profileUnsubscribe) profileUnsubscribe();
    };
  }, []);

  const handleLogout = async () => {
    await signOut(auth);
  };

  const value = {
    user,
    loading,
    logout: handleLogout,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

AuthProvider.propTypes = {
  children: PropTypes.node.isRequired,
};

// ProtectedRoute component now uses the AuthContext
export const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) return <div className="min-h-screen bg-slate-950 flex items-center justify-center text-white">Loading...</div>;
  
  if (!user) return <Navigate to="/login" />;

  return children;
};

ProtectedRoute.propTypes = {
  children: PropTypes.node.isRequired,
};
