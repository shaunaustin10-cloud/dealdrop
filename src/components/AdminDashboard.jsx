import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { doc, getDoc, collection, getDocs } from 'firebase/firestore';
import { db } from '../firebaseConfig';
import { ShieldAlert, Users, LayoutGrid, DollarSign } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const appId = import.meta.env.VITE_APP_ID || 'default-app-id';

const AdminDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ users: 0, deals: 0 });

  useEffect(() => {
    const checkAdmin = async () => {
      if (!user) {
          navigate('/login');
          return;
      }

      try {
        const docRef = doc(db, 'artifacts', appId, 'profiles', user.uid);
        const snap = await getDoc(docRef);
        
        if (snap.exists() && snap.data().role === 'admin') {
           setIsAdmin(true);
           fetchStats();
        } else {
           navigate('/dashboard');
        }
      } catch (e) {
        console.error("Admin check failed", e);
        navigate('/dashboard');
      } finally {
        setLoading(false);
      }
    };
    checkAdmin();
  }, [user, navigate]);

  const fetchStats = async () => {
      // Note: This is expensive in Firestore (reads all docs). 
      // For MVP/Admin it's okay, but in prod use Counters.
      try {
          const usersSnap = await getDocs(collection(db, 'artifacts', appId, 'profiles'));
          // Deals is harder because they are subcollections. 
          // We'll just count users for now to save reads.
          setStats({ users: usersSnap.size, deals: 'N/A' });
      } catch (e) {
          console.error("Stats fetch error", e);
      }
  };

  if (loading) return <div className="p-8 text-center text-white">Verifying Access...</div>;

  if (!isAdmin) return null;

  return (
    <div className="min-h-screen bg-slate-950 text-white p-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-black mb-8 flex items-center gap-3">
            <ShieldAlert className="text-red-500" /> Admin Dashboard
        </h1>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
            <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl">
                <div className="flex items-center gap-3 mb-2 text-slate-400">
                    <Users size={20} /> Total Users
                </div>
                <div className="text-4xl font-black">{stats.users}</div>
            </div>
            
             <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl opacity-50">
                <div className="flex items-center gap-3 mb-2 text-slate-400">
                    <LayoutGrid size={20} /> Total Deals
                </div>
                <div className="text-4xl font-black">{stats.deals}</div>
                <p className="text-xs text-slate-500 mt-2">Requires Aggregation Query</p>
            </div>

             <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl opacity-50">
                <div className="flex items-center gap-3 mb-2 text-slate-400">
                    <DollarSign size={20} /> Revenue
                </div>
                <div className="text-4xl font-black">Stripe</div>
                <p className="text-xs text-slate-500 mt-2">Check Stripe Dashboard</p>
            </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8 text-center">
            <h3 className="text-xl font-bold mb-4">User Management</h3>
            <p className="text-slate-400">
                To manage users (reset passwords, delete accounts), please use the <a href="https://console.firebase.google.com" target="_blank" rel="noreferrer" className="text-emerald-400 hover:underline">Firebase Console</a>.
            </p>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
