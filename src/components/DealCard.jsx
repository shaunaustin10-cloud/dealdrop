import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { Trash2, ChevronRight, TrendingUp, Lock, DollarSign, Loader2 } from 'lucide-react';
import { calculateDealScore } from '../utils/calculateDealScore';
import { getShortAddress } from '../utils/formatAddress';
import { useSubscription } from '../hooks/useSubscription';
import { useAuth } from '../context/AuthContext';
import { createCheckoutSession } from '../services/stripeService';

const getGoogleStreetViewUrl = (address) => {
  const API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
  if (!API_KEY || !address) return `https://picsum.photos/seed/${address || 'default'}/400/300`;
  
  return `https://maps.googleapis.com/maps/api/streetview?size=600x400&location=${encodeURIComponent(address)}&key=${API_KEY}`;
};

const DealCard = ({ deal, onClick, onDelete, isPublic }) => {
  const { user } = useAuth();
  const { isVIP } = useSubscription();
  const [buying, setBuying] = useState(false);
  // Quick calc for display
  const price = parseFloat(deal.price);
  const arv = parseFloat(deal.arv);
  const rehab = parseFloat(deal.rehab);
  const rent = parseFloat(deal.rent);
  
  // Use the shared utility to get the official "Deal Score"
  // Note: calculateDealScore now might use soldPrice if we passed it, but here we usually display the projected score
  const { score, verdict, verdictColor } = calculateDealScore({ price, arv, rehab, rent, hasPool: deal.hasPool });

  // VIP Gating Logic - Prefer the saved score for badges/gating consistency
  const officialScore = deal.dealScore || score;
  const isFirstLook = officialScore >= 84;
  const isLocked = isPublic && ((isFirstLook && !isVIP && !user?.isVerified) || !user);

  const shortLocation = deal.city ? `${deal.city}, ${deal.state || ''}`.replace(/,\s*$/, '') : getShortAddress(deal.address);
  const shortDesc = `${shortLocation} • ${deal.propertyType || 'Single Family'}`;

  // Calculate Realized Performance if Sold
  let soldVerdict = null;
  if (deal.status === 'Closed' && deal.soldPrice) {
      const sp = parseFloat(deal.soldPrice);
      const cost = price + rehab;
      const profit = sp - cost;
      const roi = cost > 0 ? (profit / cost) * 100 : 0;
      
      if (roi >= 20) soldVerdict = { label: "HOMERUN", color: "bg-emerald-500", profit };
      else if (roi > 0) soldVerdict = { label: "PROFIT", color: "bg-green-500", profit };
      else soldVerdict = { label: "LOSS", color: "bg-red-500", profit };
  }

  const handleBuyNow = async (e) => {
      e.stopPropagation();
      if (!user) {
          alert("Please login to secure this deal.");
          return;
      }
      if (isLocked) {
          alert("This VIP First Look deal requires a Pro or Business subscription.");
          return;
      }
      if (!confirm("Secure this deal with a $500 refundable deposit? You will be redirected to Stripe.")) return;

      setBuying(true);
      try {
          const priceId = import.meta.env.VITE_STRIPE_PRICE_ID_DEPOSIT || 'price_1Qf7e8KirdM61FvwVPReyz';
          await createCheckoutSession(user.uid, priceId, 'payment', { dealId: deal.id });
      } catch (error) {
          console.error("Buy Now failed:", error);
          alert("Failed to initiate payment.");
      } finally {
          setBuying(false);
      }
  };

  const streetViewUrl = getGoogleStreetViewUrl(deal.address);
  const displayImage = (deal.imageUrls && deal.imageUrls.length > 0 && !deal.imageUrls[0].includes('picsum')) 
    ? deal.imageUrls[0] 
    : streetViewUrl;

  const isOwner = user && (deal.sellerId === user.uid || deal.createdBy === user.uid);

  return (
    <div 
      onClick={() => onClick(deal)}
      className="group bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-primary/50 rounded-2xl overflow-hidden transition-all duration-300 hover:shadow-2xl hover:shadow-primary/20 flex flex-col h-full relative cursor-pointer"
    >
      {onDelete && isOwner && (
        <button 
          onClick={(e) => { e.stopPropagation(); onDelete(deal.id); }}
          className="absolute top-2 right-2 z-30 bg-red-500/80 hover:bg-red-500 p-2 rounded-full text-white opacity-0 group-hover:opacity-100 transition-opacity"
          title="Delete Deal"
        >
          <Trash2 size={16} />
        </button>
      )}
      
      <div className="h-48 bg-slate-100 dark:bg-slate-800 relative overflow-hidden">
        <img 
          src={displayImage} 
          alt={deal.address} 
          className={`w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ${isLocked ? 'blur-md grayscale' : ''}`}
          onError={(e) => {
            if (e.target.src !== streetViewUrl) {
                e.target.src = streetViewUrl;
            } else {
                e.target.src = "https://images.unsplash.com/photo-1518780664697-55e3ad937233?auto=format&fit=crop&q=80&w=400";
            }
          }}
        />
        {/* Status Overlays */}
        {deal.status === 'Under Contract' && (
            <div className="absolute top-0 left-0 w-full bg-emerald-600/90 text-white text-[10px] font-black uppercase py-1 text-center tracking-widest z-20 shadow-lg">
                Under Contract
            </div>
        )}
        {deal.status === 'Closed' && (
            <div className="absolute top-0 left-0 w-full bg-indigo-600/90 text-white text-[10px] font-black uppercase py-1 text-center tracking-widest z-20 shadow-lg">
                Sold / Closed
            </div>
        )}

        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent h-24"></div>
        <div className="absolute bottom-3 left-4 right-4">
           <div className="flex justify-between items-end">
               <div>
                   <div className="flex gap-2 mb-2">
                       <span className={`${verdictColor} bg-white/90 dark:bg-slate-950/80 backdrop-blur-md border border-slate-200 dark:border-slate-700/50 text-[10px] font-black uppercase px-2 py-1 rounded inline-block tracking-wider`}>
                         {verdict}
                       </span>
                       {isFirstLook && (
                           <span className="bg-gradient-to-r from-amber-400 to-orange-500 text-white backdrop-blur-md border border-white/20 text-[10px] font-black uppercase px-2 py-1 rounded inline-block tracking-wider shadow-lg">
                             VIP FIRST LOOK
                           </span>
                       )}
                       {deal.hasValidContract && (
                           <span className="bg-indigo-600 text-white backdrop-blur-md border border-indigo-400/50 text-[10px] font-black uppercase px-2 py-1 rounded inline-block tracking-wider shadow-lg">
                             WHOLESALE
                           </span>
                       )}
                       {deal.status === 'Under Contract' && (
                           <span className="bg-emerald-600 text-white backdrop-blur-md border border-white/20 text-[10px] font-black uppercase px-2 py-1 rounded inline-block tracking-wider shadow-lg animate-pulse-slow">
                             UNDER CONTRACT
                           </span>
                       )}
                       {soldVerdict && (
                           <span className={`${soldVerdict.color} text-white backdrop-blur-md border border-white/20 text-[10px] font-black uppercase px-2 py-1 rounded inline-block tracking-wider shadow-lg animate-pulse`}>
                             SOLD: {soldVerdict.label}
                           </span>
                       )}
                       {(deal.hasPool === true || deal.hasPool === 'true') && (
                           <span className="bg-blue-500/90 backdrop-blur-md border border-blue-400/50 text-white text-[10px] font-black uppercase px-2 py-1 rounded inline-block tracking-wider">
                             Pool
                           </span>
                       )}
                   </div>
                   <h3 className={`text-white font-bold truncate text-lg leading-tight drop-shadow-md flex items-center gap-2 ${isLocked ? 'select-none' : ''}`}>
                      {isLocked && <Lock size={16} className="text-amber-400" />}
                      {isLocked ? shortDesc : deal.address}
                   </h3>
                   <div className="flex items-center gap-2 text-slate-200 text-xs truncate opacity-90 mt-0.5">
                      {isLocked ? (
                          <span className="text-amber-400 font-bold uppercase tracking-wider text-[10px]">Login for Full Address</span>
                      ) : (
                          <>
                            <span>{deal.propertyType || 'Single Family'}</span>
                            <span>•</span>
                            <span>{deal.city || 'Location Details'}</span>
                          </>
                      )}
                   </div>
               </div>
           </div>
        </div>
      </div>
      
      <div className="p-4 flex-1 flex flex-col justify-between">
        <div className="flex justify-between items-center mb-4 px-2">
          <div>
             <p className="text-slate-500 dark:text-slate-400 text-[10px] uppercase font-bold tracking-wider">Buy Price</p>
             <p className="text-slate-900 dark:text-white font-mono font-bold text-lg">${price.toLocaleString()}</p>
          </div>
          <div className="text-right">
             <p className="text-slate-500 dark:text-slate-400 text-[10px] uppercase font-bold tracking-wider">Est. Rehab</p>
             <p className="text-emerald-600 dark:text-emerald-400 font-mono font-bold text-lg">${rehab.toLocaleString()}</p>
          </div>
        </div>

        {/* Property Specs Row */}
        <div className="flex justify-between items-center px-2 mb-4 py-2 border-y border-slate-50 dark:border-slate-800/50">
            <div className="text-center">
                <p className="text-[9px] uppercase text-slate-400 font-bold">Beds</p>
                <p className="text-sm font-bold text-slate-700 dark:text-slate-300">{deal.bedrooms || '-'}</p>
            </div>
            <div className="w-px h-4 bg-slate-100 dark:bg-slate-800"></div>
            <div className="text-center">
                <p className="text-[9px] uppercase text-slate-400 font-bold">Baths</p>
                <p className="text-sm font-bold text-slate-700 dark:text-slate-300">{deal.bathrooms || '-'}</p>
            </div>
            <div className="w-px h-4 bg-slate-100 dark:bg-slate-800"></div>
            <div className="text-center">
                <p className="text-[9px] uppercase text-slate-400 font-bold">Sqft</p>
                <p className="text-sm font-bold text-slate-700 dark:text-slate-300">{deal.sqft ? Number(deal.sqft).toLocaleString() : '-'}</p>
            </div>
            <div className="w-px h-4 bg-slate-100 dark:bg-slate-800"></div>
            <div className="text-center">
                <p className="text-[9px] uppercase text-slate-400 font-bold">Built</p>
                <p className="text-sm font-bold text-slate-700 dark:text-slate-300">{deal.yearBuilt || '-'}</p>
            </div>
        </div>

        <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex justify-between items-center">
           
           {/* Enhanced Deal Score Display */}
           <div className="flex items-center gap-3">
               <div className="relative w-12 h-12 flex items-center justify-center">
                  <svg className="w-full h-full transform -rotate-90">
                    <circle cx="24" cy="24" r="20" stroke="currentColor" strokeWidth="4" fill="transparent" className="text-slate-200 dark:text-slate-800" />
                    <circle cx="24" cy="24" r="20" stroke="currentColor" strokeWidth="4" fill="transparent" 
                        strokeDasharray={125} 
                        strokeDashoffset={125 - (125 * officialScore) / 100} 
                        className={verdictColor} 
                    />
                  </svg>
                  <span className={`absolute text-sm font-black ${verdictColor}`}>{officialScore}</span>
               </div>
               <div className="flex flex-col">
                  <span className="text-[10px] text-slate-500 dark:text-slate-400 uppercase font-bold tracking-wider">Deal Score</span>
                  <div className="flex items-center gap-1 text-xs font-bold text-slate-700 dark:text-white">
                    {officialScore >= 84 ? <TrendingUp size={12} className="text-emerald-500 dark:text-emerald-400" /> : null}
                    {officialScore}/100
                  </div>
               </div>
           </div>

           <div className="flex gap-2">
             {isPublic && isFirstLook && !isLocked && (
               <button 
                 onClick={handleBuyNow}
                 disabled={buying}
                 className="bg-primary hover:bg-orange-600 text-white px-3 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-colors flex items-center gap-1 shadow-lg shadow-primary/20"
               >
                 {buying ? <Loader2 size={12} className="animate-spin" /> : <DollarSign size={12} />}
                 Buy Now
               </button>
             )}
             <button 
               onClick={() => onClick(deal)}
               className={`bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-white px-3 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-colors flex items-center gap-1 group-hover:bg-primary dark:group-hover:bg-primary group-hover:text-white dark:group-hover:text-white ${isLocked ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20' : ''}`}
             >
               {isLocked ? 'Unlock Details' : 'Analyze'} <ChevronRight size={12} />
             </button>
           </div>
        </div>
      </div>
    </div>
  );
};

DealCard.propTypes = {
  deal: PropTypes.shape({
    id: PropTypes.string.isRequired,
    address: PropTypes.string.isRequired,
    price: PropTypes.any.isRequired,
    rehab: PropTypes.any.isRequired,
    arv: PropTypes.any.isRequired,
    rent: PropTypes.any.isRequired,
    imageUrls: PropTypes.array,
    imageUrl: PropTypes.string,
    city: PropTypes.string,
    projectedResult: PropTypes.any,
    hasPool: PropTypes.any,
    propertyType: PropTypes.string,
    status: PropTypes.string,
    soldPrice: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    hasValidContract: PropTypes.bool,
    bedrooms: PropTypes.any,
    bathrooms: PropTypes.any,
    sqft: PropTypes.any,
    yearBuilt: PropTypes.any,
  }).isRequired,
  onClick: PropTypes.func.isRequired,
  onDelete: PropTypes.func,
  isPublic: PropTypes.bool,
};

export default DealCard;