import React from 'react';
import PropTypes from 'prop-types';
import { DollarSign, Trash2, Edit, Bed, Bath, Square, Clock } from 'lucide-react';
import { useSubscription } from '../hooks/useSubscription';
import { formatAddress } from '../utils/formatAddress';

const NewDealCard = ({ deal, onDeleteDeal, onSelectDeal, onEditDeal }) => {
  const { isPro } = useSubscription();

  const getBadgeColor = (score) => {
    if (score > 75) return 'bg-emerald-500/20 text-emerald-300';
    if (score >= 50) return 'bg-yellow-500/20 text-yellow-300';
    return 'bg-red-500/20 text-red-300';
  };

  const formatMoney = (amount) => {
    return new Intl.NumberFormat('en-US', { 
      style: 'currency', 
      currency: 'USD', 
      maximumFractionDigits: 0 
    }).format(amount);
  };

  const isJustListed = () => {
    if (!deal.createdAt) return false;
    const created = deal.createdAt.seconds ? new Date(deal.createdAt.seconds * 1000) : new Date(deal.createdAt);
    const now = new Date();
    const diffInHours = (now - created) / (1000 * 60 * 60);
    return diffInHours < 48;
  };

  return (
    <div 
      className="group bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden transition-all duration-300 hover:scale-[1.02] hover:shadow-xl hover:shadow-emerald-900/20 flex flex-col cursor-pointer"
      onClick={() => onSelectDeal(deal)}
    >
      <div className="relative h-48 bg-slate-800">
        <div className="absolute top-2 right-2 z-10 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
            <button
              onClick={(e) => { e.stopPropagation(); onEditDeal(deal); }}
              className="bg-blue-500/80 hover:bg-blue-500 p-2 rounded-full text-white"
              title="Edit Deal"
            >
              <Edit size={16} />
            </button>
            <button 
              onClick={(e) => { e.stopPropagation(); onDeleteDeal(deal.id); }}
              className="bg-red-500/80 hover:bg-red-500 p-2 rounded-full text-white"
              title="Delete Deal"
            >
              <Trash2 size={16} />
            </button>
        </div>
        
        {/* Just Listed Badge */}
        {isJustListed() && (
           <div className="absolute top-2 left-2 z-10 bg-blue-500 text-white text-xs font-bold px-2 py-1 rounded-md flex items-center gap-1 shadow-lg">
             <Clock size={12} /> Just Listed
           </div>
        )}

        <img 
          src={(deal.imageUrls && deal.imageUrls[0]) || `https://picsum.photos/seed/${deal.id}/400/300`} 
          alt={deal.address} 
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent to-transparent"></div>
        <div className="absolute bottom-4 left-4 right-4">
          <h3 className="font-bold text-xl text-white truncate mb-1 shadow-black/50 drop-shadow-md">
            {formatAddress(deal.address, isPro)}
          </h3>
          <div className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-bold backdrop-blur-md border border-white/10 ${getBadgeColor(deal.dealScore)}`}>
            Deal Score: {deal.dealScore}
          </div>
        </div>
      </div>
      
      <div className="p-4 flex flex-col gap-4 flex-1">
        {/* Key Stats Row */}
        <div className="flex items-center justify-between text-slate-400 text-sm border-b border-slate-800 pb-4">
          <div className="flex items-center gap-1.5">
             <Bed size={16} className="text-emerald-500" />
             <span>{deal.bedrooms || 0} <span className="text-xs">bds</span></span>
          </div>
          <div className="flex items-center gap-1.5">
             <Bath size={16} className="text-emerald-500" />
             <span>{deal.bathrooms || 0} <span className="text-xs">ba</span></span>
          </div>
          <div className="flex items-center gap-1.5">
             <Square size={16} className="text-emerald-500" />
             <span>{deal.sqft?.toLocaleString() || 0} <span className="text-xs">sqft</span></span>
          </div>
        </div>

        {/* Price and Action Row */}
        <div className="flex justify-between items-end mt-auto">
          <div>
             <p className="text-xs text-slate-500 font-bold uppercase tracking-wider mb-0.5">Buy Price</p>
             <div className="flex items-center gap-1 text-white">
               <span className="text-2xl font-bold tracking-tight">{formatMoney(deal.price)}</span>
             </div>
          </div>
          <div className="text-right">
             <p className="text-xs text-slate-500 font-bold uppercase tracking-wider mb-0.5">Est. ARV</p>
             <p className="text-sm text-slate-300 font-medium">{formatMoney(deal.arv)}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

NewDealCard.propTypes = {
  deal: PropTypes.shape({
    id: PropTypes.string.isRequired,
    address: PropTypes.string.isRequired,
    imageUrls: PropTypes.arrayOf(PropTypes.string),
    dealScore: PropTypes.number.isRequired,
    price: PropTypes.number,
    arv: PropTypes.number,
    bedrooms: PropTypes.number,
    bathrooms: PropTypes.number,
    sqft: PropTypes.number,
  }).isRequired,
  onDeleteDeal: PropTypes.func.isRequired,
  onSelectDeal: PropTypes.func.isRequired,
  onEditDeal: PropTypes.func.isRequired,
};

export default NewDealCard;
