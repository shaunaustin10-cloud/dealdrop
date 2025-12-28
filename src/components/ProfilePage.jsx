import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useSubscription } from '../hooks/useSubscription';
import { db, storage } from '../firebaseConfig';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { User, Building, Phone, Globe, Camera, Save, Loader2, LayoutTemplate, Lock, Briefcase, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import InputField from './InputField';
import Toast from './Toast';
import PricingModal from './PricingModal';

const appId = import.meta.env.VITE_APP_ID || 'default-app-id';

const ProfilePage = () => {
  const { user } = useAuth();
  const { tier } = useSubscription();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [showPricing, setShowPricing] = useState(false);
  const [toast, setToast] = useState({ show: false, message: '', type: '' });

  const [formData, setFormData] = useState({
    displayName: '',
    title: '',
    company: '',
    phone: '',
    website: '',
    role: 'investor', // 'investor' or 'agent'
    photoUrl: '',
    logoUrl: ''
  });

  const [photoFile, setPhotoFile] = useState(null);
  const [logoFile, setLogoFile] = useState(null);

  const isBusinessTier = tier === 'agency';

  useEffect(() => {
    const fetchProfile = async () => {
      if (!user) return;
      setLoading(true);
      try {
        const docRef = doc(db, 'artifacts', appId, 'profiles', user.uid);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const data = docSnap.data();
          setFormData(prev => ({
            ...prev,
            displayName: data.displayName || user.displayName || '',
            title: data.title || '',
            company: data.company || '',
            phone: data.phone || '',
            website: data.website || '',
            role: data.role || 'investor',
            photoUrl: data.photoUrl || '',
            logoUrl: data.logoUrl || ''
          }));
        }
      } catch (error) {
        console.error("Error fetching profile:", error);
        setToast({ show: true, message: "Failed to load profile.", type: 'error' });
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, [user]);

  const handleFileChange = (e, type) => {
    if (e.target.files[0]) {
      if (type === 'photo') setPhotoFile(e.target.files[0]);
      if (type === 'logo') setLogoFile(e.target.files[0]);
    }
  };

  const uploadImage = async (file, path) => {
    const storageRef = ref(storage, path);
    await uploadBytes(storageRef, file);
    return await getDownloadURL(storageRef);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      let updates = { ...formData };

      // Upload Images if changed
      if (photoFile) {
        const url = await uploadImage(photoFile, `users/${user.uid}/branding/profile.jpg`);
        updates.photoUrl = url;
      }
      if (logoFile) {
        // Double check server-side rules ideally, but client-side gate for now
        if (isBusinessTier) {
            const url = await uploadImage(logoFile, `users/${user.uid}/branding/logo.png`);
            updates.logoUrl = url;
        }
      }

      const docRef = doc(db, 'artifacts', appId, 'profiles', user.uid);
      await setDoc(docRef, updates, { merge: true });
      
      // Update local state to reflect new URLs immediately
      setFormData(updates);
      setPhotoFile(null);
      setLogoFile(null);
      
      setToast({ show: true, message: "Profile updated successfully!", type: 'success' });
    } catch (error) {
      console.error("Error updating profile:", error);
      setToast({ show: true, message: "Failed to save profile. " + error.message, type: 'error' });
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="flex justify-center items-center h-screen text-emerald-500"><Loader2 className="animate-spin" size={48}/></div>;

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 animate-fade-in">
      <Toast toast={toast} setToast={setToast} />
      <PricingModal isOpen={showPricing} onClose={() => setShowPricing(false)} />
      
      <div className="mb-8">
        <Link 
          to="/dashboard" 
          className="flex items-center gap-2 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors group mb-6 inline-flex"
        >
          <div className="bg-white dark:bg-slate-800 p-2 rounded-full border border-slate-200 dark:border-slate-700 group-hover:bg-emerald-500/20 group-hover:border-emerald-500/50 group-hover:text-emerald-500 dark:group-hover:text-emerald-400 transition-colors">
            <ArrowLeft size={20} />
          </div>
          <span className="font-medium">Back to Pipeline</span>
        </Link>
        <h1 className="text-3xl font-bold text-white mb-2">Profile & Branding</h1>
        <p className="text-slate-400">Manage your personal details and branding for reports.</p>
      </div>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Col: Images */}
        <div className="space-y-6">
          {/* Headshot */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 flex flex-col items-center text-center">
            <h3 className="text-white font-bold mb-4">Agent Headshot</h3>
            <div className="relative w-32 h-32 rounded-full overflow-hidden bg-slate-800 border-2 border-slate-700 mb-4 group">
               {(photoFile || formData.photoUrl || user.photoURL) ? (
                 <img 
                    src={photoFile ? URL.createObjectURL(photoFile) : (formData.photoUrl || user.photoURL)} 
                    alt="Profile" 
                    className="w-full h-full object-cover" 
                 />
               ) : (
                 <User className="w-16 h-16 text-slate-600 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
               )}
               <label htmlFor="photo-upload" className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 cursor-pointer transition-opacity">
                  <Camera className="text-white" />
               </label>
            </div>
            <input type="file" id="photo-upload" accept="image/*" onChange={(e) => handleFileChange(e, 'photo')} className="hidden" />
            <p className="text-xs text-slate-500">Recommended: 400x400px</p>
          </div>

          {/* Logo (Business Tier Gated) */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 flex flex-col items-center text-center relative overflow-hidden">
            <h3 className="text-white font-bold mb-4">Brokerage / Company Logo</h3>
            
            <div className={`relative w-full h-24 rounded-lg overflow-hidden bg-slate-800 border-2 border-slate-700 border-dashed mb-4 flex items-center justify-center ${!isBusinessTier ? 'opacity-20 pointer-events-none' : 'group'}`}>
               {(logoFile ? URL.createObjectURL(logoFile) : formData.logoUrl) ? (
                 <img src={logoFile ? URL.createObjectURL(logoFile) : formData.logoUrl} alt="Logo" className="max-h-full max-w-full object-contain p-2" />
               ) : (
                 <Building className="w-10 h-10 text-slate-600" />
               )}
               
               {isBusinessTier && (
                   <label htmlFor="logo-upload" className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 cursor-pointer transition-opacity">
                      <Camera className="text-white" />
                   </label>
               )}
            </div>
            
            {isBusinessTier ? (
                <>
                    <input type="file" id="logo-upload" accept="image/*" onChange={(e) => handleFileChange(e, 'logo')} className="hidden" />
                    <p className="text-xs text-slate-500">PNG with transparent background best.</p>
                </>
            ) : (
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-900/80 backdrop-blur-[2px] z-10 p-4">
                    <div className="bg-blue-500/20 p-3 rounded-full mb-3">
                        <Briefcase size={24} className="text-blue-400" />
                    </div>
                    <p className="text-white font-bold text-sm mb-1">Business Tier Only</p>
                    <p className="text-slate-400 text-xs mb-3">Upload custom logos for reports</p>
                    <button 
                        type="button"
                        onClick={() => setShowPricing(true)}
                        className="bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold py-2 px-4 rounded-lg transition-colors"
                    >
                        Upgrade to Business
                    </button>
                </div>
            )}
          </div>
        </div>

        {/* Right Col: Form Fields */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 md:p-8">
            <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
              <LayoutTemplate className="text-emerald-500" size={24} />
              Identity Settings
            </h3>
            
            <div className="mb-6">
              <label className="block text-slate-400 text-xs uppercase tracking-wider mb-2 font-semibold">Primary Role</label>
              <div className="grid grid-cols-2 gap-4">
                <button
                  type="button"
                  onClick={() => setFormData({...formData, role: 'investor'})}
                  className={`py-3 px-4 rounded-xl border text-sm font-bold transition-all ${formData.role === 'investor' ? 'bg-emerald-500/20 border-emerald-500 text-emerald-400' : 'bg-slate-800 border-slate-700 text-slate-400 hover:border-slate-600'}`}
                >
                  Investor / Wholesaler
                </button>
                <button
                  type="button"
                  onClick={() => setFormData({...formData, role: 'agent'})}
                  className={`py-3 px-4 rounded-xl border text-sm font-bold transition-all ${formData.role === 'agent' ? 'bg-blue-500/20 border-blue-500 text-blue-400' : 'bg-slate-800 border-slate-700 text-slate-400 hover:border-slate-600'}`}
                >
                  Real Estate Agent
                </button>
              </div>
              <p className="text-xs text-slate-500 mt-2">
                {formData.role === 'agent' 
                  ? "Optimizes dashboard for Listings, Commissions, and Seller Reports." 
                  : "Optimizes dashboard for Off-Market Deals, Assignment Fees, and Cash Flow."}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
               <InputField 
                 label="Full Name" 
                 value={formData.displayName} 
                 onChange={v => setFormData({...formData, displayName: v})} 
                 placeholder="e.g. Jane Doe"
               />
               <InputField 
                 label="Title / Headline" 
                 value={formData.title} 
                 onChange={v => setFormData({...formData, title: v})} 
                 placeholder="e.g. Senior Listing Specialist"
               />
               <InputField 
                 label="Company / Brokerage" 
                 value={formData.company} 
                 onChange={v => setFormData({...formData, company: v})} 
                 placeholder="e.g. Keller Williams Elite"
                 prefix={<Building size={14} />}
               />
               <InputField 
                 label="Phone Number" 
                 value={formData.phone} 
                 onChange={v => setFormData({...formData, phone: v})} 
                 placeholder="(555) 123-4567"
                 prefix={<Phone size={14} />}
               />
               <div className="md:col-span-2">
                  <InputField 
                    label="Website / Landing Page" 
                    value={formData.website} 
                    onChange={v => setFormData({...formData, website: v})} 
                    placeholder="https://janedoe.com"
                    prefix={<Globe size={14} />}
                  />
               </div>
            </div>

            <div className="mt-8 pt-6 border-t border-slate-800 flex justify-end">
               <button 
                 type="submit" 
                 disabled={saving}
                 className="bg-emerald-500 hover:bg-emerald-400 text-white font-bold py-3 px-8 rounded-xl flex items-center gap-2 transition-all shadow-lg shadow-emerald-900/20 disabled:opacity-50 disabled:cursor-not-allowed"
               >
                 {saving ? <Loader2 className="animate-spin" size={20} /> : <Save size={20} />}
                 {saving ? 'Saving...' : 'Save Changes'}
               </button>
            </div>
          </div>

          {/* Team Management Section (Stub) */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 md:p-8 relative overflow-hidden">
            <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
              <User className="text-blue-400" size={24} />
              Team Management
            </h3>

            {isBusinessTier ? (
              <div className="space-y-6">
                <div className="flex justify-between items-center bg-slate-800/50 p-4 rounded-xl border border-slate-700">
                   <div>
                      <p className="text-white font-bold">Team Slots</p>
                      <p className="text-slate-400 text-xs">You have used 0 of 3 available seats.</p>
                   </div>
                   <div className="flex gap-1">
                      {[1, 2, 3].map(i => (
                        <div key={i} className="w-3 h-3 rounded-full bg-slate-700"></div>
                      ))}
                   </div>
                </div>

                <div className="space-y-4">
                   <label className="block text-slate-400 text-xs uppercase tracking-wider font-semibold">Invite New Member</label>
                   <div className="flex gap-2">
                      <input 
                        type="email" 
                        placeholder="colleague@example.com"
                        className="flex-1 bg-slate-800 border border-slate-700 rounded-lg py-2 px-4 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all text-sm"
                      />
                      <button 
                        type="button"
                        onClick={() => setToast({ show: true, message: "Invite system is in preview. Please contact support to manually add users.", type: 'success' })}
                        className="bg-blue-600 hover:bg-blue-500 text-white font-bold py-2 px-4 rounded-lg text-sm transition-all"
                      >
                        Send Invite
                      </button>
                   </div>
                   <p className="text-[10px] text-slate-500 italic">* Members will receive an email to join your workspace.</p>
                </div>
              </div>
            ) : (
              <div className="py-8 flex flex-col items-center text-center">
                <div className="bg-blue-500/10 p-4 rounded-full mb-4">
                   <Lock size={32} className="text-blue-400 opacity-50" />
                </div>
                <h4 className="text-white font-bold mb-2">Team Access Restricted</h4>
                <p className="text-slate-400 text-sm max-w-xs mb-6">
                  Upgrade to the Business Class tier to add up to 3 sub-users to your account.
                </p>
                <button 
                  type="button"
                  onClick={() => setShowPricing(true)}
                  className="bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 px-8 rounded-xl transition-all shadow-lg shadow-blue-900/20"
                >
                  View Business Plans
                </button>
              </div>
            )}
          </div>
        </div>
      </form>
    </div>
  );
};

export default ProfilePage;
