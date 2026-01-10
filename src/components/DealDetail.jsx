import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { 
  ArrowLeft, 
  Bed, 
  Bath, 
  Square, 
  DollarSign, 
  TrendingUp,
  FileText,
  Loader2,
  Edit,
  ExternalLink,
  Map as MapIcon,
  BadgeDollarSign,
  ShieldCheck,
  Hammer,
  Trash2
} from 'lucide-react';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../firebaseConfig';
import { useAuth } from '../context/AuthContext';
import { useSubscription } from '../hooks/useSubscription';
import DealAnalysis from './DealAnalysis';
import { formatAddress } from '../utils/formatAddress';
import { generateDealReport } from '../utils/generatePdf';

const getGoogleStreetViewUrl = (address) => {
  const API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
  if (!API_KEY || !address) return `https://images.unsplash.com/photo-1518780664697-55e3ad937233?auto=format&fit=crop&q=80&w=800`;
  
  return `https://maps.googleapis.com/maps/api/streetview?size=600x400&location=${encodeURIComponent(address)}&key=${API_KEY}`;
};

const DealDetail = ({ deal, onBack, onEdit, onDelete, onUpgrade }) => {
  const { user } = useAuth();
  const { isPro } = useSubscription();
  const streetViewUrl = getGoogleStreetViewUrl(deal.address);

  // Sold Performance Calculation
  const isSold = deal.status === 'Closed' && parseFloat(deal.soldPrice) > 0;
  const soldPrice = parseFloat(deal.soldPrice) || 0;
  const purchasePrice = parseFloat(deal.price) || 0;
  const rehabCost = parseFloat(deal.rehab) || 0;
  const totalInvestment = purchasePrice + rehabCost;
  const realizedProfit = soldPrice - totalInvestment;
  const realizedRoi = totalInvestment > 0 ? (realizedProfit / totalInvestment) * 100 : 0;
  
  const [activeImage, setActiveImage] = useState(
    (deal.imageUrls && deal.imageUrls.length > 0 && !deal.imageUrls[0].includes('picsum')) 
      ? deal.imageUrls[0] 
      : streetViewUrl
  );
  // Removed unused imageLoaded state
  const [downloading, setDownloading] = useState(false);

  // Reset loader when active image changes
  useEffect(() => {
     // No-op
  }, [activeImage]);

  const handleDownloadReport = async () => {
    if (!user) return;

    // Gate PDF Export for Pro Users
    if (!isPro) {
        if (onUpgrade) onUpgrade();
        else alert("This feature is reserved for Pro members.");
        return;
    }

    setDownloading(true);
    try {
      const appId = import.meta.env.VITE_APP_ID || 'default-app-id';
      const userRef = doc(db, 'artifacts', appId, 'profiles', user.uid);
      const userSnap = await getDoc(userRef);
      const profileData = userSnap.exists() ? userSnap.data() : null;
      
      await generateDealReport(deal, profileData);
    } catch (error) {
      console.error("PDF Generation failed:", error);
      alert("Failed to generate report. Please try again.");
    } finally {
      setDownloading(false);
    }
  };

  const formatMoney = (val) => 
    new Intl.NumberFormat('en-US', { 
      style: 'currency', 
      currency: 'USD', 
      minimumFractionDigits: 0, 
      maximumFractionDigits: 0 
    }).format(val);

  // ROI Calculation
  const price = Number(deal.price) || 0;
  const effectiveRehab = Number(deal.effectiveRehab) || Number(deal.rehab) || 0; 
  const arv = Number(deal.arv) || 0;
  const rent = Number(deal.rent) || 0;
  
  const totalCost = price + effectiveRehab; 
  const potentialProfit = arv - totalCost;
  const roi = totalCost > 0 ? (potentialProfit / totalCost) * 100 : 0;

  // Agent Specific Metrics
  const isAgentCreated = deal.roleAtCreation === 'agent';
  const mortgage = Number(deal.mortgagePayoff) || 0;
  const taxes = Number(deal.taxProrations) || 0;
  const commPct = Number(deal.commissionPct) || 3;
  const miscCosts = Number(deal.miscClosingCosts) || 0;
  
  const estimatedComm = (isAgentCreated ? arv : price) * (commPct / 100);
  const sellerNet = arv - estimatedComm - miscCosts - effectiveRehab - mortgage - taxes;

  // Interactive Links
  const googleMapsUrl = `https://www.google.com/maps/search/?api=1&query=${deal.lat && deal.lng ? `${deal.lat},${deal.lng}` : encodeURIComponent(deal.address)}`;
  const interactiveStreetViewUrl = deal.lat && deal.lng 
    ? `https://www.google.com/maps/@?api=1&map_action=pano&viewpoint=${deal.lat},${deal.lng}`
    : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(deal.address)}&map_action=pano`;

  return (
    <div className="space-y-6 animate-fade-in relative max-w-7xl mx-auto">
      {/* Navigation & Header Actions */}
      <div className="flex justify-between items-center mb-4">
        <button 
          onClick={onBack} 
          className="flex items-center gap-2 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors group"
        >
          <div className="bg-white dark:bg-slate-800 p-2 rounded-full border border-slate-200 dark:border-slate-700 group-hover:bg-emerald-500/20 group-hover:border-emerald-500/50 group-hover:text-emerald-500 dark:group-hover:text-emerald-400 transition-colors">
            <ArrowLeft size={20} />
          </div>
          <span className="font-medium">Back to Gallery</span>
        </button>
        
        <div className="flex gap-3">
            {onDelete && (
                <button 
                  onClick={() => onDelete(deal.id)}
                  className="flex items-center gap-2 bg-white dark:bg-slate-800 hover:bg-red-50 dark:hover:bg-red-900/20 text-slate-700 dark:text-white hover:text-red-600 dark:hover:text-red-400 px-3 py-2 md:px-4 rounded-lg transition-colors border border-slate-200 dark:border-slate-700 hover:border-red-200 dark:hover:border-red-800 shadow-sm"
                  title="Delete Deal"
                >
                  <Trash2 size={18} />
                  <span className="hidden sm:inline text-sm font-bold">Delete</span>
                </button>
            )}

            <button 
              onClick={() => onEdit(deal)}
              className="flex items-center gap-2 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-white px-3 py-2 md:px-4 rounded-lg transition-colors border border-slate-200 dark:border-slate-700 shadow-sm"
            >
              <Edit size={18} className="text-blue-500 dark:text-blue-400" />
              <span className="hidden sm:inline text-sm font-bold">Edit Analysis</span>
            </button>
            
            <button 
              onClick={handleDownloadReport}
              disabled={downloading}
              className="flex items-center gap-2 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-white px-3 py-2 md:px-4 rounded-lg transition-colors border border-slate-200 dark:border-slate-700 shadow-sm disabled:opacity-50"
            >
              {downloading ? <Loader2 size={18} className="animate-spin text-emerald-500 dark:text-emerald-400" /> : <FileText size={18} className="text-emerald-500 dark:text-emerald-400" />}
              <span className="hidden sm:inline text-sm font-bold">{downloading ? 'Generating...' : 'Download Report'}</span>
            </button>
        </div>
      </div>

      {/* Full-Width Header Section */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 md:p-8 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/5 blur-3xl -mr-32 -mt-32 rounded-full"></div>
        
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 relative z-10">
          <div>
            <div className="flex flex-wrap items-center gap-3 mb-2">
              <span className={`px-2 py-0.5 rounded text-[10px] uppercase font-black tracking-widest ${
                  deal.status === 'New Lead' ? 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-500/30' :
                  deal.status === 'Under Contract' ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/30' :
                  deal.status === 'Closed' ? 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-500/30' :
                  'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-600'
              }`}>
                  {deal.status || 'New Lead'}
              </span>
              <span className="text-slate-500 dark:text-slate-500 text-xs font-bold uppercase tracking-widest">Added {deal.createdAt ? new Date(deal.createdAt.seconds * 1000).toLocaleDateString() : 'Recently'}</span>
            </div>
            <h1 className="text-2xl md:text-4xl font-black text-slate-900 dark:text-white leading-tight">
               {formatAddress(deal.address, true)}
            </h1>
          </div>
          
          <div className="flex gap-2 md:gap-8 bg-slate-50 dark:bg-slate-800/50 p-3 md:p-4 rounded-2xl border border-slate-200 dark:border-slate-700/50 backdrop-blur-sm">
            <div className="text-center md:text-left min-w-[60px]">
              <p className="text-slate-500 text-[9px] md:text-[10px] uppercase font-black tracking-widest mb-1">Deal Score</p>
              <div className="text-lg md:text-2xl font-black text-emerald-500 dark:text-emerald-400">{deal.dealScore}</div>
            </div>
            <div className="w-px h-10 bg-slate-200 dark:bg-slate-700"></div>
            <div className="text-center md:text-left min-w-[80px]">
              <p className="text-slate-500 text-[9px] md:text-[10px] uppercase font-black tracking-widest mb-1">Target ARV</p>
              <div className="text-lg md:text-2xl font-black text-slate-900 dark:text-white">{formatMoney(arv)}</div>
            </div>
            <div className="w-px h-10 bg-slate-200 dark:bg-slate-700"></div>
            <div className="text-center md:text-left min-w-[80px]">
              <p className="text-slate-500 text-[9px] md:text-[10px] uppercase font-black tracking-widest mb-1">Target Rent</p>
              <div className="text-lg md:text-2xl font-black text-slate-900 dark:text-white">{formatMoney(rent)}</div>
            </div>
          </div>
        </div>

        {/* Closed Deal Performance Banner */}
        {isSold && (
            <div className="mt-6 bg-gradient-to-r from-emerald-500/10 to-teal-500/10 border border-emerald-500/20 rounded-xl p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                    <div className="bg-emerald-500 p-2 rounded-lg text-white shadow-lg shadow-emerald-500/30">
                        <TrendingUp size={24} />
                    </div>
                    <div>
                        <h3 className="text-lg font-black text-emerald-600 dark:text-emerald-400">
                            {realizedRoi >= 20 ? "🚀 HOMERUN DEAL!" : realizedRoi > 0 ? "✅ PROFITABLE EXIT" : "⚠️ SOLD AT LOSS"}
                        </h3>
                        <p className="text-sm text-slate-600 dark:text-slate-300">
                            Sold for <strong>{formatMoney(soldPrice)}</strong> on {deal.closingDate || 'Closing'}
                        </p>
                    </div>
                </div>
                <div className="flex gap-8 text-center">
                    <div>
                        <p className="text-[10px] uppercase font-black tracking-widest text-slate-500">Realized Profit</p>
                        <p className={`text-2xl font-black ${realizedProfit >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-500'}`}>
                            {realizedProfit >= 0 ? '+' : ''}{formatMoney(realizedProfit)}
                        </p>
                    </div>
                    <div>
                        <p className="text-[10px] uppercase font-black tracking-widest text-slate-500">Realized ROI</p>
                        <p className={`text-2xl font-black ${realizedRoi >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-500'}`}>
                            {realizedRoi.toFixed(1)}%
                        </p>
                    </div>
                </div>
            </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Sticky Gallery (4/12 width) */}
        <div className="lg:col-span-5 lg:sticky lg:top-24 space-y-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800 aspect-[4/3] relative group shadow-2xl">
             {/* Loader behind the image */}
             <div className="absolute inset-0 bg-slate-100 dark:bg-slate-800 flex items-center justify-center z-0">
                 <div className="w-10 h-10 border-4 border-emerald-500/30 border-t-emerald-500 rounded-full animate-spin"></div>
             </div>
            
            <img 
              src={activeImage} 
              alt={deal.address} 
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover relative z-10 transition-opacity duration-300"
              onError={() => {
                 if (activeImage !== streetViewUrl) {
                    setActiveImage(streetViewUrl);
                 } else {
                    setActiveImage("https://images.unsplash.com/photo-1518780664697-55e3ad937233?auto=format&fit=crop&q=80&w=800");
                 }
              }}
            />
          </div>
          
          {deal.imageUrls && deal.imageUrls.length > 1 && (
             <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
               {deal.imageUrls.map((url, idx) => (
                 <button
                   key={idx}
                   onClick={() => setActiveImage(url)}
                   className={`flex-shrink-0 w-20 h-20 rounded-xl overflow-hidden border-2 transition-all ${activeImage === url ? 'border-emerald-500 shadow-lg shadow-emerald-500/20' : 'border-transparent opacity-60 hover:opacity-100'}`}
                 >
                   <img src={url} alt={`View ${idx + 1}`} className="w-full h-full object-cover" />
                 </button>
               ))}
             </div>
          )}

          <div className="grid grid-cols-3 gap-3">
             <div className="bg-white dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 p-3 rounded-xl flex flex-col items-center">
               <Bed className="text-emerald-500 dark:text-emerald-400 mb-1" size={18} />
               <span className="text-lg font-bold text-slate-900 dark:text-white">{deal.bedrooms}</span>
               <span className="text-[10px] text-slate-500 uppercase font-bold tracking-tighter">Beds</span>
             </div>
             <div className="bg-white dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 p-3 rounded-xl flex flex-col items-center">
               <Bath className="text-emerald-500 dark:text-emerald-400 mb-1" size={18} />
               <span className="text-lg font-bold text-slate-900 dark:text-white">{deal.bathrooms}</span>
               <span className="text-[10px] text-slate-500 uppercase font-bold tracking-tighter">Baths</span>
             </div>
             <div className="bg-white dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 p-3 rounded-xl flex flex-col items-center">
               <Square className="text-emerald-500 dark:text-emerald-400 mb-1" size={18} />
               <span className="text-lg font-bold text-slate-900 dark:text-white">{deal.sqft}</span>
               <span className="text-[10px] text-slate-500 uppercase font-bold tracking-tighter">Sq Ft</span>
             </div>
          </div>
        </div>

        <div className="lg:col-span-7 space-y-6">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-xl">
            <div className="flex items-center gap-2 mb-6">
              <div className="p-2 bg-emerald-500/10 rounded-lg">
                <DollarSign className="text-emerald-600 dark:text-emerald-400" size={20} />
              </div>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white">{isAgentCreated ? 'Seller Net Sheet' : 'Financial Breakdown'}</h3>
            </div>
            
            {isAgentCreated ? (
              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <p className="text-slate-500 text-[10px] uppercase font-black tracking-widest mb-1">Target Sale Price (ARV)</p>
                    <p className="text-xl font-black text-slate-900 dark:text-white">{formatMoney(arv)}</p>
                  </div>
                  <div>
                    <p className="text-slate-500 text-[10px] uppercase font-black tracking-widest mb-1">Selling Commission ({commPct}%)</p>
                    <p className="text-xl font-black text-red-500 dark:text-red-400">-{formatMoney(estimatedComm)}</p>
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <p className="text-slate-500 text-[10px] uppercase font-black tracking-widest mb-1">Mortgage Payoff</p>
                    <p className="text-xl font-black text-red-500 dark:text-red-400">-{formatMoney(mortgage)}</p>
                  </div>
                  <div>
                    <p className="text-slate-500 text-[10px] uppercase font-black tracking-widest mb-1">Tax Prorations & Misc</p>
                    <p className="text-xl font-black text-red-500 dark:text-red-400">-{formatMoney(taxes + miscCosts)}</p>
                  </div>
                </div>
                <div className="h-px bg-slate-200 dark:bg-slate-800 my-2"></div>
                <div className="bg-emerald-50 dark:bg-emerald-500/5 border border-emerald-200 dark:border-emerald-500/10 p-4 rounded-xl flex justify-between items-center">
                  <div>
                    <p className="text-slate-500 text-[10px] uppercase font-black tracking-widest mb-0.5">Estimated Net to Seller</p>
                    <p className="text-3xl font-black text-emerald-600 dark:text-emerald-400">{formatMoney(sellerNet)}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-slate-500 text-[10px] uppercase font-black tracking-widest mb-0.5">Renovated Scenario</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">Includes {formatMoney(effectiveRehab)} repairs</p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-6 gap-x-8">
                <div>
                  <p className="text-slate-500 text-[10px] uppercase font-black tracking-widest mb-1">Purchase Price</p>
                  <p className="text-2xl font-black text-slate-900 dark:text-white">{formatMoney(price)}</p>
                </div>
                <div>
                  <p className="text-slate-500 text-[10px] uppercase font-black tracking-widest mb-1">Est. Rehab</p>
                  <p className="text-2xl font-black text-emerald-600 dark:text-emerald-400">{formatMoney(effectiveRehab)}</p>
                </div>
                <div className="hidden sm:block col-span-2 h-px bg-slate-200 dark:bg-slate-800 my-2"></div>
                <div>
                  <p className="text-slate-500 text-[10px] uppercase font-black tracking-widest mb-1">Total Cost Basis</p>
                  <p className="text-2xl font-black text-slate-900 dark:text-white">{formatMoney(totalCost)}</p>
                </div>
                <div>
                  <p className="text-slate-500 text-[10px] uppercase font-black tracking-widest mb-1">Est. Potential Profit</p>
                  <p className={`text-2xl font-black ${potentialProfit >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-500 dark:text-red-400'}`}>
                    {formatMoney(potentialProfit)}
                  </p>
                </div>
                <div className="col-span-1 sm:col-span-2 bg-emerald-50 dark:bg-emerald-500/5 border border-emerald-200 dark:border-emerald-500/10 p-4 rounded-xl flex justify-between items-center">
                  <div>
                    <p className="text-slate-500 text-[10px] uppercase font-black tracking-widest mb-0.5">ROI Estimate</p>
                    <p className="text-3xl font-black text-emerald-600 dark:text-emerald-400">{roi.toFixed(2)}%</p>
                  </div>
                  <div className="text-right">
                    <p className="text-slate-500 text-[10px] uppercase font-black tracking-widest mb-0.5">Cap Rate</p>
                    <p className="text-xl font-bold text-slate-900 dark:text-white">7.4%</p>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-xl">
            <div className="p-6">
              <div className="flex items-center gap-2 mb-6">
                <div className="p-2 bg-indigo-500/10 rounded-lg">
                  <TrendingUp className="text-indigo-600 dark:text-indigo-400" size={20} />
                </div>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white">AI Market Analysis</h3>
              </div>
              <DealAnalysis deal={deal} />
            </div>
          </div>

          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-xl">
             <div className="flex items-center gap-2 mb-6">
                <div className="p-2 bg-purple-500/10 rounded-lg">
                  <FileText className="text-purple-600 dark:text-purple-400" size={20} />
                </div>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white">CRM Details</h3>
             </div>
             
             <div className="grid grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <span className="text-slate-500 text-[10px] uppercase font-black tracking-widest block mb-1">Lead Source</span>
                    <span className="text-slate-900 dark:text-white font-bold">{deal.leadSource || 'Off-Market'}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 text-[10px] uppercase font-black tracking-widest block mb-1">Status</span>
                    <span className="text-slate-900 dark:text-white font-bold">{deal.status || 'New Lead'}</span>
                  </div>
                </div>
                <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-xl border border-slate-200 dark:border-slate-700/50">
                  <span className="text-slate-500 text-[10px] uppercase font-black tracking-widest block mb-2">Seller Contact</span>
                  {deal.sellerName ? (
                    <div className="space-y-2">
                       <p className="text-slate-900 dark:text-white font-bold">{deal.sellerName}</p>
                       <p className="text-slate-500 dark:text-slate-400 text-sm">{deal.sellerPhone}</p>
                       <p className="text-slate-500 dark:text-slate-400 text-sm truncate">{deal.sellerEmail}</p>
                    </div>
                  ) : (
                    <p className="text-slate-500 dark:text-slate-600 text-sm italic">No contact info provided.</p>
                  )}
                </div>
             </div>

             <div className="mt-6">
                {deal.lat && deal.lng ? (
                   <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <a 
                        href={googleMapsUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center justify-center gap-2 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-900 dark:text-white py-3 px-4 rounded-xl border border-slate-200 dark:border-slate-700 transition-all font-bold text-sm shadow-sm hover:shadow-md group"
                      >
                        <MapIcon size={18} className="text-emerald-500 dark:text-emerald-400 group-hover:scale-110 transition-transform" />
                        Open in Google Maps
                      </a>
                      <a 
                        href={interactiveStreetViewUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center justify-center gap-2 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-900 dark:text-white py-3 px-4 rounded-xl border border-slate-200 dark:border-slate-700 transition-all font-bold text-sm shadow-sm hover:shadow-md group"
                      >
                        <ExternalLink size={18} className="text-blue-500 dark:text-blue-400 group-hover:scale-110 transition-transform" />
                        Interactive Street View
                      </a>
                   </div>
                ) : (
                   <a 
                    href={googleMapsUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-2 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-900 dark:text-white py-3 px-4 rounded-xl border border-slate-200 dark:border-slate-700 transition-all font-bold text-sm shadow-sm hover:shadow-md group w-full"
                  >
                    <MapIcon size={18} className="text-emerald-500 dark:text-emerald-400 group-hover:scale-110 transition-transform" />
                    Open in Google Maps
                  </a>
                )}
             </div>
          </div>

          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-xl">
             <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                Project Resources
             </h3>
             <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <a href="#" className="bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 p-4 rounded-xl flex flex-col items-center text-center transition-all group shadow-sm hover:shadow-md">
                   <div className="bg-emerald-500/10 p-3 rounded-full mb-3 group-hover:scale-110 transition-transform">
                      <BadgeDollarSign size={24} className="text-emerald-500 dark:text-emerald-400" />
                   </div>
                   <span className="text-slate-900 dark:text-white font-bold text-sm">Get Funding</span>
                   <span className="text-slate-500 text-xs mt-1">DSCR & Hard Money</span>
                </a>
                <a href="#" className="bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 p-4 rounded-xl flex flex-col items-center text-center transition-all group shadow-sm hover:shadow-md">
                   <div className="bg-blue-500/10 p-3 rounded-full mb-3 group-hover:scale-110 transition-transform">
                      <ShieldCheck size={24} className="text-blue-500 dark:text-blue-400" />
                   </div>
                   <span className="text-slate-900 dark:text-white font-bold text-sm">Insurance Quote</span>
                   <span className="text-slate-500 text-xs mt-1">Landlord Policies</span>
                </a>
                <a href="#" className="bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 p-4 rounded-xl flex flex-col items-center text-center transition-all group shadow-sm hover:shadow-md">
                   <div className="bg-orange-500/10 p-3 rounded-full mb-3 group-hover:scale-110 transition-transform">
                      <Hammer size={24} className="text-orange-500 dark:text-orange-400" />
                   </div>
                   <span className="text-slate-900 dark:text-white font-bold text-sm">Contractor Bids</span>
                   <span className="text-slate-500 text-xs mt-1">Local Pros</span>
                </a>
             </div>
          </div>

          {deal.notes && (
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-xl">
               <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                  <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full"></span>
                  Deal Notes
               </h3>
               <p className="text-slate-600 dark:text-slate-400 leading-relaxed whitespace-pre-wrap text-sm">{deal.notes}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

DealDetail.propTypes = {
  deal: PropTypes.shape({
    id: PropTypes.string,
    address: PropTypes.string,
    price: PropTypes.number,
    rehab: PropTypes.number,
    effectiveRehab: PropTypes.number, 
    arv: PropTypes.number,
    rent: PropTypes.number,
    sqft: PropTypes.number,
    bedrooms: PropTypes.number,
    bathrooms: PropTypes.number,
    imageUrls: PropTypes.arrayOf(PropTypes.string),
    notes: PropTypes.string,
    dealScore: PropTypes.number,
    createdAt: PropTypes.object,
    aiAnalysis: PropTypes.object,
    status: PropTypes.string,
    leadSource: PropTypes.string,
    sellerName: PropTypes.string,
    sellerPhone: PropTypes.string,
    sellerEmail: PropTypes.string,
    createdBy: PropTypes.string,
    soldPrice: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    roleAtCreation: PropTypes.string,
    mortgagePayoff: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    taxProrations: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    commissionPct: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    miscClosingCosts: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    lat: PropTypes.number,
    lng: PropTypes.number,
    closingDate: PropTypes.string,
  }).isRequired,
  onBack: PropTypes.func.isRequired,
  onEdit: PropTypes.func,
  onDelete: PropTypes.func,
  onUpgrade: PropTypes.func,
};

export default DealDetail;
