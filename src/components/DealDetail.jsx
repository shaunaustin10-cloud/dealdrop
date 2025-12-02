import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { 
  ArrowLeft, 
  Bed, 
  Bath, 
  Square, 
  DollarSign, 
  Mail,
  TrendingUp,
  Home,
  Lock,
  FileText 
} from 'lucide-react';
import DealAnalysis from './DealAnalysis';
import { useSubscription } from '../hooks/useSubscription';
import { formatAddress } from '../utils/formatAddress';
import { generateDealReport } from '../utils/generatePdf';
import PricingModal from './PricingModal';
import SellerCard from './SellerCard'; // Import SellerCard

const DealDetail = ({ deal, onBack, onContact }) => {
  const { isPro } = useSubscription();
  const [showPricingModal, setShowPricingModal] = useState(false);

  const [activeImage, setActiveImage] = useState(
    (deal.imageUrls && deal.imageUrls[0]) || 
    `https://picsum.photos/seed/${deal.id}/800/600`
  );
  const [imageLoaded, setImageLoaded] = useState(false);

  // Reset loader when active image changes
  React.useEffect(() => {
    setImageLoaded(false);
  }, [activeImage]);

  const formatMoney = (val) => 
    new Intl.NumberFormat('en-US', { 
      style: 'currency', 
      currency: 'USD', 
      minimumFractionDigits: 0, 
      maximumFractionDigits: 0 
    }).format(val);

  const handleContactClick = () => {
    if (!isPro) {
      setShowPricingModal(true);
      return;
    }
    onContact(deal.address);
  };

  // ROI Calculation
  const price = Number(deal.price) || 0;
  // Use effectiveRehab for calculations, fall back to user-input rehab if effectiveRehab not present
  const effectiveRehab = Number(deal.effectiveRehab) || Number(deal.rehab) || 0; 
  const arv = Number(deal.arv) || 0;
  const rent = Number(deal.rent) || 0;
  
  const totalCost = price + effectiveRehab; // Use effectiveRehab here
  const potentialProfit = arv - totalCost;
  const roi = totalCost > 0 ? (potentialProfit / totalCost) * 100 : 0;

  // Extract AI values for prominent display
  const verifiedArv = deal.aiAnalysis?.market?.arv;
  const estimatedRent = deal.aiAnalysis?.market?.rentEstimate || deal.aiAnalysis?.market?.rent;

  return (
    <div className="space-y-6 animate-fade-in relative">
      {/* Navigation */}
      <div className="flex justify-between items-center">
        <button 
          onClick={onBack} 
          className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors group"
        >
          <div className="bg-slate-800 p-2 rounded-full group-hover:bg-emerald-500/20 group-hover:text-emerald-400 transition-colors">
            <ArrowLeft size={20} />
          </div>
          <span className="font-medium">Back to Gallery</span>
        </button>
        
        <button 
          onClick={() => generateDealReport(deal)}
          className="flex items-center gap-2 bg-slate-800 hover:bg-slate-700 text-white px-4 py-2 rounded-lg transition-colors border border-slate-700"
        >
          <FileText size={18} className="text-emerald-400" />
          <span className="text-sm font-bold">Download Report</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Image Gallery Section */}
        <div className="space-y-4">
          <div className="bg-slate-900 rounded-2xl overflow-hidden border border-slate-800 aspect-[4/3] relative group">
            {!imageLoaded && (
               <div className="absolute inset-0 bg-slate-800 animate-pulse z-10 flex items-center justify-center">
                 <div className="w-10 h-10 border-4 border-emerald-500/30 border-t-emerald-500 rounded-full animate-spin"></div>
               </div>
            )}
            <img 
              src={activeImage} 
              alt={deal.address} 
              className="w-full h-full object-cover transition-opacity duration-500"
              onLoad={() => setImageLoaded(true)}
              style={{ opacity: imageLoaded ? 1 : 0 }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
          </div>
          
          {deal.imageUrls && deal.imageUrls.length > 1 && (
             <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide relative">
               {deal.imageUrls.map((url, idx) => {
                 // Logic: Show first 2 images freely. Lock the rest if !isPro.
                 const isLocked = !isPro && idx > 0;
                 
                 return (
                   <div key={idx} className="relative flex-shrink-0 w-20 h-20">
                     <button
                       onClick={() => {
                         if (isLocked) {
                           setShowPricingModal(true);
                         } else {
                           setActiveImage(url);
                         }
                       }}
                       className={`w-full h-full rounded-lg overflow-hidden border-2 transition-all ${activeImage === url ? 'border-emerald-500 shadow-lg shadow-emerald-500/20' : 'border-transparent opacity-60 hover:opacity-100'} ${isLocked ? 'cursor-pointer' : ''}`}
                     >
                       <img 
                         src={url} 
                         alt={`View ${idx + 1}`} 
                         className={`w-full h-full object-cover ${isLocked ? 'blur-sm scale-110' : ''}`} 
                       />
                     </button>
                     {isLocked && (
                       <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                         <Lock size={16} className="text-white drop-shadow-md" />
                       </div>
                     )}
                   </div>
                 );
               })}
             </div>
          )}
          
          {/* Upgrade Prompt for Images (if not pro and multiple images exist) */}
          {!isPro && deal.imageUrls && deal.imageUrls.length > 1 && (
             <div className="bg-slate-900/80 border border-slate-800 p-3 rounded-xl flex items-center justify-between backdrop-blur-sm">
                <span className="text-sm text-slate-300 flex items-center gap-2">
                  <Lock size={14} className="text-amber-500" />
                  <span>{deal.imageUrls.length - 1} more photos available</span>
                </span>
                <button 
                  onClick={() => setShowPricingModal(true)}
                  className="text-xs font-bold text-emerald-400 hover:text-emerald-300 uppercase tracking-wider"
                >
                  Unlock Gallery
                </button>
             </div>
          )}
        </div>

        {/* Deal Info Section */}
        <div className="space-y-6">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6"> {/* New container for top info */}
            <h1 className="text-3xl md:text-4xl font-bold text-white leading-tight mb-2">
               {formatAddress(deal.address, isPro)}
               {!isPro && (
                 <span onClick={() => setShowPricingModal(true)} className="ml-3 inline-block cursor-pointer">
                   <Lock size={24} className="text-amber-500 inline-block hover:text-amber-400 transition-colors" />
                 </span>
               )}
            </h1>
            <p className="text-slate-400 text-lg">Added on {deal.createdAt ? new Date(deal.createdAt.seconds * 1000).toLocaleDateString() : 'Unknown Date'}</p>

            <div className="flex items-baseline gap-4 mt-4"> {/* New flex container for score, ARV, Rent */}
              <div className="bg-emerald-500/10 text-emerald-400 px-4 py-2 rounded-xl text-lg font-bold whitespace-nowrap border border-emerald-500/20">
                Score: {deal.dealScore}
              </div>
              {verifiedArv && (
                <div className="flex items-baseline gap-1 text-white">
                  <TrendingUp size={20} className="text-blue-400" />
                  <span className="text-xl font-bold">ARV: {formatMoney(verifiedArv)}</span>
                </div>
              )}
              {estimatedRent && (
                <div className="flex items-baseline gap-1 text-white">
                  <Home size={20} className="text-purple-400" />
                  <span className="text-xl font-bold">Rent: {formatMoney(estimatedRent)}</span>
                </div>
              )}
            </div>
          </div>

          {/* Key Stats Grid */}
          <div className="grid grid-cols-3 gap-4">
             <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl flex flex-col items-center text-center">
               <Bed className="text-emerald-400 mb-2" size={24} />
               <span className="text-2xl font-bold text-white">{deal.bedrooms}</span>
               <span className="text-xs text-slate-500 uppercase font-bold tracking-wider">Beds</span>
             </div>
             <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl flex flex-col items-center text-center">
               <Bath className="text-emerald-400 mb-2" size={24} />
               <span className="text-2xl font-bold text-white">{deal.bathrooms}</span>
               <span className="text-xs text-slate-500 uppercase font-bold tracking-wider">Baths</span>
             </div>
             <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl flex flex-col items-center text-center">
               <Square className="text-emerald-400 mb-2" size={24} />
               <span className="text-2xl font-bold text-white">{deal.sqft}</span>
               <span className="text-xs text-slate-500 uppercase font-bold tracking-wider">Sq Ft</span>
             </div>
          </div>

          {/* CRM / Internal Data Section */}
          <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-4">
             <h4 className="text-slate-400 text-xs uppercase font-bold mb-3 tracking-wider">Internal CRM Data</h4>
             <div className="grid grid-cols-2 gap-y-4">
                <div>
                   <span className="text-slate-500 text-xs block">Status</span>
                   <span className={`inline-block px-2 py-0.5 rounded text-xs font-bold mt-1 ${
                      deal.status === 'New Lead' ? 'bg-blue-500/20 text-blue-400' :
                      deal.status === 'Under Contract' ? 'bg-emerald-500/20 text-emerald-400' :
                      deal.status === 'Closed' ? 'bg-purple-500/20 text-purple-400' :
                      deal.status === 'Dead' ? 'bg-red-500/20 text-red-400' :
                      'bg-slate-700 text-slate-300'
                   }`}>
                      {deal.status || 'New Lead'}
                   </span>
                </div>
                <div>
                   <span className="text-slate-500 text-xs block">Lead Source</span>
                   <span className="text-white font-medium text-sm">{deal.leadSource || 'Off-Market'}</span>
                </div>
                {deal.sellerName && (
                   <div className="col-span-2 pt-2 border-t border-slate-700/50 flex flex-col gap-1">
                      <span className="text-slate-500 text-xs block">Seller Info</span>
                      <div className="flex gap-4 text-sm">
                         <span className="text-white font-medium">{deal.sellerName}</span>
                         {deal.sellerPhone && <span className="text-slate-400">{deal.sellerPhone}</span>}
                         {deal.sellerEmail && <span className="text-slate-400">{deal.sellerEmail}</span>}
                      </div>
                   </div>
                )}
             </div>
          </div>

          {/* Deal Analysis AI Section */}
          <DealAnalysis deal={deal} />

          {/* Seller Profile Card */}
          {deal.createdBy && <SellerCard userId={deal.createdBy} />}

          {/* Financials */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-6">
            <h3 className="text-xl font-bold text-white flex items-center gap-2">
              <DollarSign className="text-emerald-500" /> Financial Breakdown
            </h3>
            
            <div className="grid grid-cols-2 gap-y-6 gap-x-8">
              <div>
                <p className="text-slate-500 text-sm uppercase font-bold mb-1">Purchase Price</p>
                <p className="text-2xl font-bold text-white">{formatMoney(price)}</p>
              </div>
              <div>
                <p className="text-slate-500 text-sm uppercase font-bold mb-1">Est. Rehab</p>
                <p className="text-2xl font-bold text-emerald-400 flex items-center gap-2">
                   {formatMoney(effectiveRehab)} {/* Changed to effectiveRehab */}
                </p>
              </div>
              <div>
                <p className="text-slate-500 text-sm uppercase font-bold mb-1">After Repair Value (ARV)</p>
                <p className="text-2xl font-bold text-white">{formatMoney(arv)}</p>
              </div>
              <div>
                <p className="text-slate-500 text-sm uppercase font-bold mb-1">Est. Monthly Rent</p>
                <p className="text-2xl font-bold text-white">{formatMoney(rent)}</p>
              </div>
            </div>

            <div className="border-t border-slate-800 pt-4 mt-4">
               <div className="flex justify-between items-center">
                 <div>
                   <p className="text-slate-400 text-sm">Est. Potential Profit</p>
                   <p className={`text-xl font-bold ${potentialProfit >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                     {formatMoney(potentialProfit)}
                   </p>
                 </div>
                 <div className="text-right">
                   <p className="text-slate-400 text-sm">Est. ROI</p>
                   <p className={`text-xl font-bold ${roi >= 15 ? 'text-emerald-400' : 'text-yellow-400'}`}>
                     {roi.toFixed(2)}%
                   </p>
                 </div>
               </div>
            </div>
          </div>

          {/* Notes / Description */}
          {deal.notes && (
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
               <h3 className="text-lg font-bold text-white mb-3">Deal Notes</h3>
               <p className="text-slate-400 leading-relaxed whitespace-pre-wrap">{deal.notes}</p>
            </div>
          )}

          {/* Action Button */}
          <button 
            onClick={handleContactClick}
            className="w-full bg-emerald-600 hover:bg-emerald-500 text-white py-4 rounded-xl font-bold text-lg flex items-center justify-center gap-2 shadow-lg shadow-emerald-900/20 hover:shadow-emerald-900/40 transition-all transform hover:-translate-y-1"
          >
             {isPro ? (
                <>
                   <Mail size={22} />
                   I&apos;m Interested in This Deal
                </>
             ) : (
                <>
                   <Lock size={22} />
                   Upgrade to Contact Seller
                </>
             )}
          </button>
        </div>
      </div>

      <PricingModal 
        isOpen={showPricingModal} 
        onClose={() => setShowPricingModal(false)} 
      />
    </div>
  );
};

DealDetail.propTypes = {
  deal: PropTypes.shape({
    id: PropTypes.string,
    address: PropTypes.string,
    price: PropTypes.number,
    rehab: PropTypes.number,
    effectiveRehab: PropTypes.number, // Added effectiveRehab to propTypes
    arv: PropTypes.number,
    rent: PropTypes.number,
    sqft: PropTypes.number,
    bedrooms: PropTypes.number,
    bathrooms: PropTypes.number,
    imageUrls: PropTypes.arrayOf(PropTypes.string),
    notes: PropTypes.string,
    dealScore: PropTypes.number,
    createdAt: PropTypes.object,
    aiAnalysis: PropTypes.object, // Added aiAnalysis to propTypes
  }).isRequired,
  onBack: PropTypes.func.isRequired,
  onContact: PropTypes.func.isRequired,
};

export default DealDetail;
