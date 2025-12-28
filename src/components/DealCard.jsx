import React from 'react';
import PropTypes from 'prop-types';
import { Home, Trash2, ChevronRight, TrendingUp } from 'lucide-react';
import { calculateDealScore } from '../utils/calculateDealScore';

const getGoogleStreetViewUrl = (address) => {
  const API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
  if (!API_KEY || !address) return `https://picsum.photos/seed/${address || 'default'}/400/300`;
  
  return `https://maps.googleapis.com/maps/api/streetview?size=600x400&location=${encodeURIComponent(address)}&key=${API_KEY}`;
};

const DealCard = ({ deal, onClick, onDelete, isAdmin }) => {
  // Quick calc for display
  const price = parseFloat(deal.price);
  const arv = parseFloat(deal.arv);
  const rehab = parseFloat(deal.rehab);
  const rent = parseFloat(deal.rent);
  
  // Use the shared utility to get the official "Deal Score"
  const { score, verdict, verdictColor } = calculateDealScore({ price, arv, rehab, rent });

  // Simple Profit Calc for display
  const totalCost = price + rehab; // Simplified
  const profit = deal.projectedResult || (arv - totalCost); 

  const streetViewUrl = getGoogleStreetViewUrl(deal.address);
  const displayImage = (deal.imageUrls && deal.imageUrls.length > 0 && !deal.imageUrls[0].includes('picsum')) 
    ? deal.imageUrls[0] 
    : streetViewUrl;

  return (
    <div 
      onClick={() => onClick(deal)}
      className="group bg-slate-900 border border-slate-800 hover:border-emerald-500/50 rounded-2xl overflow-hidden transition-all duration-300 hover:shadow-2xl hover:shadow-emerald-900/20 flex flex-col h-full relative cursor-pointer"
    >
      {onDelete && (
        <button 
          onClick={(e) => { e.stopPropagation(); onDelete(deal.id); }}
          className="absolute top-2 right-2 z-30 bg-red-500/80 hover:bg-red-500 p-2 rounded-full text-white opacity-0 group-hover:opacity-100 transition-opacity"
          title="Delete Deal"
        >
          <Trash2 size={16} />
        </button>
      )}
      
      <div className="h-48 bg-slate-800 relative overflow-hidden">
        <img 
          src={displayImage} 
          alt={deal.address} 
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          onError={(e) => {
            if (e.target.src !== streetViewUrl) {
                e.target.src = streetViewUrl;
            } else {
                e.target.src = "https://images.unsplash.com/photo-1518780664697-55e3ad937233?auto=format&fit=crop&q=80&w=400";
            }
          }}
        />
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-slate-900 via-slate-900/60 to-transparent h-24"></div>
        <div className="absolute bottom-3 left-4 right-4">
           <div className="flex justify-between items-end">
               <div>
                   <div className="flex gap-2 mb-2">
                       <span className={`${verdictColor} bg-slate-950/50 backdrop-blur-md border border-slate-700/50 text-[10px] font-black uppercase px-2 py-1 rounded inline-block tracking-wider`}>
                         {verdict}
                       </span>
                       {(deal.hasPool === true || deal.hasPool === 'true') && (
                           <span className="bg-blue-500/80 backdrop-blur-md border border-blue-400/50 text-white text-[10px] font-black uppercase px-2 py-1 rounded inline-block tracking-wider">
                             Pool
                           </span>
                       )}
                   </div>
                   <h3 className="text-white font-bold truncate text-lg leading-tight drop-shadow-md">{deal.address}</h3>
                   <div className="flex items-center gap-2 text-slate-300 text-xs truncate opacity-90 mt-0.5">
                      <span>{deal.propertyType || 'Single Family'}</span>
                      <span>•</span>
                      <span>{deal.city || 'Location Details'}</span>
                   </div>
               </div>
           </div>
        </div>
      </div>
      
      <div className="p-4 flex-1 flex flex-col justify-between">
        <div className="flex justify-between items-center mb-4 px-2">
          <div>
             <p className="text-slate-500 text-[10px] uppercase font-bold tracking-wider">Buy Price</p>
             <p className="text-white font-mono font-bold text-lg">${price.toLocaleString()}</p>
          </div>
          <div className="text-right">
             <p className="text-slate-500 text-[10px] uppercase font-bold tracking-wider">Est. Rehab</p>
             <p className="text-emerald-400 font-mono font-bold text-lg">${rehab.toLocaleString()}</p>
          </div>
        </div>

        <div className="pt-4 border-t border-slate-800 flex justify-between items-center">
           
           {/* Enhanced Deal Score Display */}
           <div className="flex items-center gap-3">
               <div className="relative w-12 h-12 flex items-center justify-center">
                  <svg className="w-full h-full transform -rotate-90">
                    <circle cx="24" cy="24" r="20" stroke="currentColor" strokeWidth="4" fill="transparent" className="text-slate-800" />
                    <circle cx="24" cy="24" r="20" stroke="currentColor" strokeWidth="4" fill="transparent" 
                        strokeDasharray={125} 
                        strokeDashoffset={125 - (125 * score) / 100} 
                        className={verdictColor} 
                    />
                  </svg>
                  <span className={`absolute text-sm font-black ${verdictColor}`}>{score}</span>
               </div>
               <div className="flex flex-col">
                  <span className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">Deal Score</span>
                  <div className="flex items-center gap-1 text-xs font-bold text-white">
                    {score > 75 ? <TrendingUp size={12} className="text-emerald-400" /> : null}
                    {score}/100
                  </div>
               </div>
           </div>

           <button 
             onClick={() => onClick(deal)}
             className="bg-slate-800 hover:bg-slate-700 text-white px-3 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-colors flex items-center gap-1 group-hover:bg-emerald-600 group-hover:text-white"
           >
             Analyze <ChevronRight size={12} />
           </button>
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
  }).isRequired,
  onClick: PropTypes.func.isRequired,
  onDelete: PropTypes.func,
  isAdmin: PropTypes.bool,
};

export default DealCard;