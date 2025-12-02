import React from 'react';
import PropTypes from 'prop-types';
import { Home, Trash2, ChevronRight } from 'lucide-react';

const DealCard = ({ deal, onClick, onDelete, isAdmin }) => {
  // Quick calc for display
  const price = parseFloat(deal.price);
  const arv = parseFloat(deal.arv);
  const rehab = parseFloat(deal.rehab);
  const rent = parseFloat(deal.rent);
  
  // Simple Flip ROI estimation
  const totalCost = price + rehab + (price * 0.03); // 3% closing
  const profit = arv - totalCost - (arv * 0.06); // 6% selling
  const roi = (profit / totalCost) * 100;
  


  return (
    <div className="group bg-slate-900 border border-slate-800 hover:border-emerald-500/50 rounded-2xl overflow-hidden transition-all duration-300 hover:shadow-2xl hover:shadow-emerald-900/20 flex flex-col h-full relative">
      {isAdmin && (
        <button 
          onClick={(e) => { e.stopPropagation(); onDelete(deal.id); }}
          className="absolute top-2 right-2 z-10 bg-red-500/80 hover:bg-red-500 p-2 rounded-full text-white opacity-0 group-hover:opacity-100 transition-opacity"
        >
          <Trash2 size={16} />
        </button>
      )}
      
      <div className="h-48 bg-slate-800 relative overflow-hidden">
        {deal.imageUrl ? (
          <img src={deal.imageUrl} alt={deal.address} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-slate-800 text-slate-600">
            <Home size={48} />
          </div>
        )}
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-slate-900 to-transparent h-20"></div>
        <div className="absolute bottom-3 left-4">
           <span className="bg-emerald-500 text-white text-xs font-bold px-2 py-1 rounded-md mb-1 inline-block">
             {roi > 15 ? 'HOT DEAL' : 'Solid Rental'}
           </span>
           <h3 className="text-white font-bold truncate pr-4">{deal.address}</h3>
        </div>
      </div>
      
      <div className="p-4 flex-1 flex flex-col justify-between">
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
             <p className="text-slate-500 text-xs uppercase">Buy Price</p>
             <p className="text-white font-mono font-bold">${price.toLocaleString()}</p>
          </div>
          <div>
             <p className="text-slate-500 text-xs uppercase">Est. Rehab</p>
             <p className="text-emerald-400 font-mono font-bold">${rehab.toLocaleString()}</p>
          </div>
          <div>
             <p className="text-slate-500 text-xs uppercase">ARV</p>
             <p className="text-white font-mono font-bold">${arv.toLocaleString()}</p>
          </div>
           <div>
             <p className="text-slate-500 text-xs uppercase">Proj. Rent</p>
             <p className="text-white font-mono font-bold">${rent.toLocaleString()}</p>
          </div>
        </div>

        <div className="pt-4 border-t border-slate-800 flex justify-between items-center">
           <div className="flex flex-col">
              <span className="text-[10px] text-slate-500 uppercase font-bold">Est. ROI</span>
              <span className={`text-lg font-bold ${roi > 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                {roi.toFixed(1)}%
              </span>
           </div>
           <div className="flex flex-col">
              <span className="text-[10px] text-slate-500 uppercase font-bold">Est. Profit</span>
              <span className={`text-lg font-bold ${profit > 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                ${Math.floor(profit/1000)}k
              </span>
           </div>
           <button 
             onClick={() => onClick(deal)}
             className="bg-slate-800 hover:bg-slate-700 text-white px-4 py-2 rounded-lg text-sm font-semibold transition-colors flex items-center gap-1"
           >
             Details <ChevronRight size={14} />
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
    price: PropTypes.number.isRequired,
    rehab: PropTypes.number.isRequired,
    arv: PropTypes.number.isRequired,
    rent: PropTypes.number.isRequired,
    imageUrl: PropTypes.string,
  }).isRequired,
  onClick: PropTypes.func.isRequired,
  onDelete: PropTypes.func.isRequired,
  isAdmin: PropTypes.bool.isRequired,
};

export default DealCard;

