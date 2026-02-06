import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { doc, getDoc, collection, getDocs, query, where, orderBy, updateDoc } from 'firebase/firestore';
import { db } from '../firebaseConfig';
import { ShieldAlert, Users, LayoutGrid, DollarSign, CheckCircle, XCircle, FileText, ExternalLink } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const appId = import.meta.env.VITE_APP_ID || 'default-app-id';

const AdminDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ users: 0, deals: 0 });
  const [pendingDeals, setPendingDeals] = useState([]);

  const [users, setUsers] = useState([]);

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
           fetchPendingDeals();
           fetchUsers();
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

  const fetchUsers = async () => {
    try {
        const usersSnap = await getDocs(collection(db, 'artifacts', appId, 'profiles'));
        const publicDealsSnap = await getDocs(collection(db, 'artifacts', appId, 'publicDeals'));
        
        // Count deals per user
        const dealCounts = {};
        publicDealsSnap.forEach(doc => {
            const data = doc.data();
            const uid = data.createdBy || data.sellerId;
            if (uid) {
                dealCounts[uid] = (dealCounts[uid] || 0) + 1;
            }
        });

        const usersList = usersSnap.docs.map(doc => ({ 
            id: doc.id, 
            ...doc.data(),
            dealCount: dealCounts[doc.id] || 0
        }));
        setUsers(usersList);
    } catch (e) {
        console.error("Error fetching users:", e);
    }
  };

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

  const fetchPendingDeals = async () => {
      try {
          const dealsRef = collection(db, 'artifacts', appId, 'publicDeals');
          // Query for Pending Verification deals
          // Note: Ensure you have an index for 'status'
          const q = query(dealsRef, where('status', '==', 'Pending Verification'), orderBy('createdAt', 'desc'));
          const snapshot = await getDocs(q);
          const deals = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
          setPendingDeals(deals);
      } catch (e) {
          console.error("Error fetching pending deals:", e);
      }
  };

  const handleApprove = async (dealId) => {
      if (!confirm("Approve this deal for the VIP Marketplace?")) return;
      try {
          const dealRef = doc(db, 'artifacts', appId, 'publicDeals', dealId);
          await updateDoc(dealRef, {
              status: 'Available', // or 'Active'
              isVipApproved: true,
              approvedAt: new Date()
          });
          // Remove from local state
          setPendingDeals(prev => prev.filter(d => d.id !== dealId));
          alert("Deal Approved!");
      } catch (e) {
          console.error("Approval failed:", e);
          alert("Error approving deal.");
      }
  };

  const handleReject = async (dealId) => {
      if (!confirm("Reject this deal? It will be set to 'Draft' status.")) return;
      try {
          const dealRef = doc(db, 'artifacts', appId, 'publicDeals', dealId);
          await updateDoc(dealRef, {
              status: 'Draft',
              rejectionReason: prompt("Reason for rejection?") || "Admin Review Failed"
          });
          setPendingDeals(prev => prev.filter(d => d.id !== dealId));
      } catch (e) {
          console.error("Rejection failed:", e);
      }
  };

  const updateUserTier = async (userId, currentTier) => {
      const tiers = ['free', 'lite', 'pro', 'business', 'agency'];
      const newTier = prompt(`Current Tier: ${currentTier}\nAvailable: ${tiers.join(', ')}\nEnter new tier:`, currentTier);
      
      if (!newTier || !tiers.includes(newTier.toLowerCase())) return;

      try {
          const userRef = doc(db, 'artifacts', appId, 'profiles', userId);
          await updateDoc(userRef, { subscriptionTier: newTier.toLowerCase() });
          setUsers(prev => prev.map(u => u.id === userId ? { ...u, subscriptionTier: newTier.toLowerCase() } : u));
          alert("Tier updated successfully!");
      } catch (e) {
          console.error("Error updating tier:", e);
          alert("Failed to update tier.");
      }
  };

  const updateUserCredits = async (userId, currentCredits) => {
      const input = prompt(`Current Credits: ${currentCredits ?? '∞'}\nEnter new credit amount (or 'null' for unlimited):`, currentCredits);
      if (input === null) return;
      
      const newCredits = input.toLowerCase() === 'null' ? null : parseInt(input);

      try {
          const userRef = doc(db, 'artifacts', appId, 'profiles', userId);
          await updateDoc(userRef, { credits: newCredits });
          setUsers(prev => prev.map(u => u.id === userId ? { ...u, credits: newCredits } : u));
          alert("Credits updated successfully!");
      } catch (e) {
          console.error("Error updating credits:", e);
          alert("Failed to update credits.");
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

        {/* Verification Queue */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8 mb-8">
            <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
                <FileText className="text-amber-500" /> Verification Queue
                {pendingDeals.length > 0 && (
                    <span className="bg-amber-500 text-slate-900 text-xs px-2 py-1 rounded-full font-black">
                        {pendingDeals.length} Pending
                    </span>
                )}
            </h3>

            {pendingDeals.length === 0 ? (
                <p className="text-slate-500 italic">No deals pending verification.</p>
            ) : (
                <div className="space-y-4">
                    {pendingDeals.map(deal => (
                        <div key={deal.id} className="bg-slate-950 border border-slate-800 p-4 rounded-xl flex flex-col md:flex-row justify-between gap-4">
                            <div>
                                <h4 className="font-bold text-lg text-white">{deal.address}</h4>
                                <div className="flex gap-4 text-sm text-slate-400 mt-1">
                                    <span>Score: <strong className={deal.dealScore > 84 ? "text-emerald-400" : "text-white"}>{deal.dealScore}</strong></span>
                                    <span>Price: ${Number(deal.price).toLocaleString()}</span>
                                    <span>User: {deal.sellerContactEmail || deal.createdBy}</span>
                                </div>
                                {deal.proofOfContractPath ? (
                                    <a href={deal.proofOfContractPath} target="_blank" rel="noreferrer" className="text-blue-400 text-xs flex items-center gap-1 mt-2 hover:underline">
                                        <ExternalLink size={12} /> View Contract Proof
                                    </a>
                                ) : (
                                    <span className="text-red-400 text-xs mt-2 block">No Proof Uploaded</span>
                                )}
                            </div>
                            <div className="flex items-center gap-2">
                                <button 
                                    onClick={() => handleReject(deal.id)}
                                    className="bg-slate-800 hover:bg-red-900/30 text-slate-300 hover:text-red-400 px-4 py-2 rounded-lg font-bold text-sm transition-colors flex items-center gap-2"
                                >
                                    <XCircle size={16} /> Reject
                                </button>
                                <button 
                                    onClick={() => handleApprove(deal.id)}
                                    className="bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-2 rounded-lg font-bold text-sm transition-colors flex items-center gap-2"
                                >
                                    <CheckCircle size={16} /> Approve & Post
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>

        {/* User Directory */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8 mb-8">
            <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
                <Users className="text-blue-500" /> User Directory
                <span className="bg-blue-500 text-white text-xs px-2 py-1 rounded-full font-black">
                    {users.length} Total
                </span>
            </h3>

            <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="border-b border-slate-800 text-slate-500 text-sm uppercase tracking-widest font-black">
                            <th className="py-4 px-4">User</th>
                            <th className="py-4 px-4">Role</th>
                            <th className="py-4 px-4">Tier</th>
                            <th className="py-4 px-4 text-center">Deals</th>
                            <th className="py-4 px-4 text-center">Credits</th>
                            <th className="py-4 px-4 text-right">Joined</th>
                        </tr>
                    </thead>
                    <tbody>
                        {users.map(u => (
                            <tr key={u.id} className="border-b border-slate-800/50 hover:bg-slate-800/20 transition-colors">
                                <td className="py-4 px-4">
                                    <div className="flex items-center gap-3">
                                        <img 
                                            src={u.photoURL || `https://api.dicebear.com/9.x/initials/svg?seed=${u.displayName || u.email || 'User'}`} 
                                            alt="" 
                                            className="w-8 h-8 rounded-full bg-slate-800"
                                        />
                                        <div>
                                            <div className="font-bold">{u.displayName || 'Unnamed User'}</div>
                                            <div className="text-xs text-slate-500 font-mono">{u.email || u.id.substring(0, 8)}</div>
                                        </div>
                                    </div>
                                </td>
                                <td className="py-4 px-4">
                                    <span className={`text-[10px] uppercase font-black px-2 py-1 rounded-md ${
                                        u.role === 'admin' ? 'bg-red-500/10 text-red-500 border border-red-500/20' :
                                        u.role === 'agent' ? 'bg-amber-500/10 text-amber-500 border border-amber-500/20' :
                                        'bg-slate-800 text-slate-400'
                                    }`}>
                                        {u.role || 'investor'}
                                    </span>
                                </td>
                                <td className="py-4 px-4">
                                    <button 
                                        onClick={() => updateUserTier(u.id, u.subscriptionTier || 'free')}
                                        className={`text-[10px] uppercase font-black px-2 py-1 rounded-md transition-transform hover:scale-105 ${
                                            u.subscriptionTier === 'pro' ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20' :
                                            u.subscriptionTier === 'agency' ? 'bg-purple-500/10 text-purple-500 border border-purple-500/20' :
                                            u.subscriptionTier === 'business' ? 'bg-blue-500/10 text-blue-500 border border-blue-500/20' :
                                            'bg-slate-800 text-slate-400'
                                        }`}
                                    >
                                        {u.subscriptionTier || 'free'}
                                    </button>
                                </td>
                                <td className="py-4 px-4 text-center">
                                    <span className="font-bold text-slate-300">
                                        {u.dealCount}
                                    </span>
                                </td>
                                <td className="py-4 px-4 text-center">
                                    <button 
                                        onClick={() => updateUserCredits(u.id, u.credits)}
                                        className={`font-black transition-transform hover:scale-110 ${u.credits === 0 ? 'text-red-500' : 'text-white'}`}
                                    >
                                        {u.credits ?? '∞'}
                                    </button>
                                </td>
                                <td className="py-4 px-4 text-right text-xs text-slate-500">
                                    {u.joinedAt?.toDate ? u.joinedAt.toDate().toLocaleDateString() : 'N/A'}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8 text-center opacity-50">
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
