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
  
  const price = parseFloat(deal.price);
  const arv = parseFloat(deal.arv);
  const rehab = parseFloat(deal.rehab);
  const rent = parseFloat(deal.rent);
  
  const { score, verdict, verdictColor } = calculateDealScore({ price, arv, rehab, rent, hasPool: deal.hasPool });

  const officialScore = deal.dealScore || score;
  const isFirstLook = officialScore >= 84;
  const isLocked = isPublic && ((isFirstLook && !isVIP && !user?.isVerified) || !user);

  const shortDesc = deal.city ? `${deal.city}, ${deal.state || ''}`.replace(/,\s*$/, '') : getShortAddress(deal.address);

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
      
      <div className="h-40 bg-slate-100 dark:bg-slate-800 relative overflow-hidden">
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
        {/* Deal Score Floating Badge */}
        <div className={`absolute top-8 right-2 z-20 w-10 h-10 rounded-full flex flex-col items-center justify-center border-2 bg-slate-900/90 backdrop-blur-sm shadow-lg ${(verdictColor || 'text-slate-400').replace('text-', 'border-')}`}>
            <span className={`text-[12px] font-black leading-none ${(verdictColor || 'text-white')}`}>{officialScore}</span>
            <span className="text-[6px] font-bold text-white uppercase tracking-tighter mt-0.5">Score</span>
        </div>

        {/* Status Overlays */}
        {deal.status === 'Under Contract' && (
            <div className="absolute top-0 left-0 w-full bg-emerald-600/90 text-white text-[9px] font-black uppercase py-0.5 text-center tracking-widest z-20 shadow-lg">
                Under Contract
            </div>
        )}
        {deal.status === 'Closed' && (
            <div className="absolute top-0 left-0 w-full bg-indigo-600/90 text-white text-[9px] font-black uppercase py-0.5 text-center tracking-widest z-20 shadow-lg">
                Sold / Closed
            </div>
        )}

        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent h-16"></div>
        <div className="absolute bottom-2 left-3 right-3">
           <div className="flex flex-wrap gap-1.5">
               <span className={`${verdictColor} bg-white/95 dark:bg-midnight/90 backdrop-blur-md border border-slate-200 dark:border-slate-700/50 text-[9px] font-black uppercase px-1.5 py-0.5 rounded tracking-wider shadow-sm`}>
                 {verdict}
               </span>
               {isFirstLook && (
                   <span className="bg-gradient-to-r from-amber-400 to-orange-500 text-white backdrop-blur-md border border-white/20 text-[9px] font-black uppercase px-1.5 py-0.5 rounded tracking-wider shadow-lg">
                     VIP
                   </span>
               )}
               {deal.hasValidContract && (
                   <span className="bg-indigo-600 text-white backdrop-blur-md border border-indigo-400/50 text-[9px] font-black uppercase px-1.5 py-0.5 rounded tracking-wider shadow-sm">
                     WHOLESALE
                   </span>
               )}
           </div>
        </div>
      </div>
      
      <div className="p-3 flex-1 flex flex-col">
        {/* Primary Financials */}
        <div className="flex justify-between items-end mb-1">
            <div className="flex items-baseline gap-1">
                <span className="text-xl font-black text-slate-900 dark:text-white tracking-tight">${price.toLocaleString()}</span>
                {rehab > 0 && (
                    <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-1.5 rounded">
                        +${(rehab/1000).toFixed(0)}k rehab
                    </span>
                )}
            </div>
        </div>

        {/* Property Stats - Zillow Style Single Line */}
        <div className="flex items-center gap-1.5 text-slate-700 dark:text-slate-300 text-xs font-bold mb-2">
            <span>{deal.bedrooms || '-'} bds</span>
            <span className="text-slate-300 dark:text-slate-700">|</span>
            <span>{deal.bathrooms || '-'} ba</span>
            <span className="text-slate-300 dark:text-slate-700">|</span>
            <span>{deal.sqft ? Number(deal.sqft).toLocaleString() : '-'} sqft</span>
            <span className="text-slate-300 dark:text-slate-700">|</span>
            <span className="text-slate-400 font-medium truncate">{deal.propertyType || 'House'}</span>
        </div>

        {/* Address & Location */}
        <div className="mb-3">
            <h3 className={`text-slate-500 dark:text-slate-400 text-[11px] leading-tight flex items-start gap-1 line-clamp-1 font-medium ${isLocked ? 'select-none' : ''}`}>
                {isLocked && <Lock size={10} className="text-amber-500 mt-0.5 shrink-0" />}
                {isLocked ? shortDesc : deal.address}
            </h3>
        </div>

        <div className="mt-auto pt-3 border-t border-slate-50 dark:border-slate-800 flex justify-between items-center">
           <div className="flex items-center gap-1 text-[10px] font-black text-slate-400 uppercase tracking-widest">
              {deal.status || 'Active'}
           </div>

           <div className="flex gap-2">
             {isPublic && isFirstLook && !isLocked && deal.status !== 'Under Contract' && deal.status !== 'Closed' && (
               <button 
                 onClick={handleBuyNow}
                 disabled={buying}
                 className="bg-primary hover:bg-orange-600 text-white px-2.5 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider transition-colors flex items-center gap-1 shadow-sm"
               >
                 {buying ? <Loader2 size={10} className="animate-spin" /> : <DollarSign size={10} />}
                 Buy
               </button>
             )}
             {(!isLocked || (deal.status !== 'Under Contract' && deal.status !== 'Closed')) ? (
                 <button 
                   onClick={() => onClick(deal)}
                   className={`bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-white px-2.5 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider transition-colors flex items-center gap-1 group-hover:bg-primary group-hover:text-white ${isLocked ? 'bg-amber-500/10 text-amber-600 border border-amber-500/20' : ''}`}
                 >
                   {isLocked ? 'Unlock' : 'Analyze'} <ChevronRight size={10} />
                 </button>
             ) : (
                 <div className="text-[9px] text-slate-400 font-bold uppercase italic">
                     Closed
                 </div>
             )}
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
    state: PropTypes.string,
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
    dealScore: PropTypes.number,
  }).isRequired,
  onClick: PropTypes.func.isRequired,
  onDelete: PropTypes.func,
  isPublic: PropTypes.bool,
};

export default DealCard;