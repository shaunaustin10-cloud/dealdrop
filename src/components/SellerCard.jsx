import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { getUserProfile } from '../services/userService';
import { ShieldCheck } from 'lucide-react';

export default function SellerCard({ userId }) {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      if (userId) {
        const data = await getUserProfile(userId);
        setProfile(data);
      }
      setLoading(false);
    };
    fetchProfile();
  }, [userId]);

  if (loading) {
    return <div className="h-24 bg-slate-900 rounded-2xl animate-pulse"></div>;
  }

  if (!profile) {
    return null; // Or a "Unknown Seller" state
  }

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 flex items-center gap-4">
      <div className="relative">
        <img 
          src={profile.photoURL} 
          alt={profile.displayName} 
          className="w-16 h-16 rounded-full border-2 border-slate-700 object-cover"
        />
        <div className="absolute -bottom-1 -right-1 bg-emerald-500 text-slate-950 p-1 rounded-full border border-slate-900" title="Verified Member">
          <ShieldCheck size={12} strokeWidth={3} />
        </div>
      </div>
      
      <div>
        <h3 className="text-lg font-bold text-white flex items-center gap-2">
          {profile.displayName}
        </h3>
        <p className="text-slate-400 text-sm">{profile.bio}</p>
        <div className="flex gap-2 mt-2">
          <span className="text-xs font-bold uppercase tracking-wider text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full">
             {profile.role}
          </span>
          <span className="text-xs text-slate-500 px-2 py-0.5">
             Joined {profile.joinedAt ? new Date(profile.joinedAt.seconds * 1000).getFullYear() : 'Recently'}
          </span>
        </div>
      </div>
    </div>
  );
}

SellerCard.propTypes = {
  userId: PropTypes.string.isRequired,
};
