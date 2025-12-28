import React, { useState, useEffect, useMemo } from 'react';
import PropTypes from 'prop-types';
import { LayoutGrid, Search, SlidersHorizontal, Map as MapIcon, List } from 'lucide-react'; 
import DealCard from './DealCard'; 
import DealMap from './DealMap';
import { useFetchDeals } from '../hooks/useDeals';

const SkeletonCard = () => (
  <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden h-full flex flex-col">
    <div className="h-48 bg-slate-800 animate-pulse relative">
       <div className="absolute inset-0 bg-gradient-to-r from-slate-800 via-slate-700 to-slate-800 animate-shimmer" style={{ backgroundSize: '200% 100%' }}></div>
    </div>
    <div className="p-4 flex-1 space-y-4">
      <div className="h-6 bg-slate-800 rounded w-3/4 animate-pulse"></div>
      <div className="flex justify-between">
        <div className="h-4 bg-slate-800 rounded w-1/4 animate-pulse"></div>
        <div className="h-4 bg-slate-800 rounded w-1/4 animate-pulse"></div>
      </div>
      <div className="h-10 bg-slate-800 rounded w-full animate-pulse mt-4"></div>
    </div>
  </div>
);

const DealList = ({ onDeleteDeal, onSelectDeal, onEditDeal, isPublic, buyBox }) => {
  const [sortBy, setSortBy] = useState('createdAt');
  const [filterAddress, setFilterAddress] = useState('');
  const [viewMode, setViewMode] = useState(() => window.innerWidth < 1024 ? 'list' : 'both'); // 'map', 'list', 'both' (desktop)
  const [hoveredDealId, setHoveredDealId] = useState(null);

  const { deals: allDeals, loading, error } = useFetchDeals(isPublic, sortBy);

  // Handle Mobile/Desktop View Default
  useEffect(() => {
    const handleResize = () => {
        if (window.innerWidth < 1024) {
            setViewMode(prev => prev === 'both' ? 'list' : prev);
        } else {
            setViewMode('both');
        }
    };
    window.addEventListener('resize', handleResize);
    handleResize(); // Init
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Initialize filter from Buy Box if available
  useEffect(() => {
    if (buyBox && buyBox.locations && buyBox.locations.length > 0) {
        setFilterAddress(buyBox.locations[0]);
    }
  }, [buyBox]);

  const filteredDeals = useMemo(() => {
    let result = [...allDeals];

    if (filterAddress) {
        const searchLower = filterAddress.toLowerCase();
        result = result.filter(deal => 
            deal.address && deal.address.toLowerCase().includes(searchLower)
        );
    }
    
    if (isPublic && buyBox) {
        result = result.filter(deal => {
            if (buyBox.minPrice && deal.price < buyBox.minPrice) return false;
            if (buyBox.maxPrice && deal.price > buyBox.maxPrice) return false;
            if (buyBox.minBedrooms && deal.bedrooms < buyBox.minBedrooms) return false;
            return true;
        });
    }

    // Client-side Sort (Fix for "Highest Score" not working if Firestore sort fails or fields missing)
    if (sortBy === 'dealScore') {
        result.sort((a, b) => (b.dealScore || 0) - (a.dealScore || 0));
    } else if (sortBy === 'price') {
        result.sort((a, b) => (a.price || 0) - (b.price || 0));
    } else if (sortBy === 'createdAt') {
        result.sort((a, b) => {
             const dateA = a.createdAt?.toDate ? a.createdAt.toDate() : (a.createdAt || 0);
             const dateB = b.createdAt?.toDate ? b.createdAt.toDate() : (b.createdAt || 0);
             return dateB - dateA;
        });
    }

    return result;
  }, [allDeals, filterAddress, isPublic, buyBox, sortBy]);

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
          <SkeletonCard key={i} />
        ))}
      </div>
    );
  }

  if (error) {
    return (
        <div className="text-center py-24 bg-red-900/10 rounded-3xl border border-red-800/50 flex flex-col items-center justify-center space-y-4">
            <div className="text-red-400 font-bold text-lg">Unable to load deals</div>
            <p className="text-red-300/70 max-w-md">{error.message || "An unexpected error occurred."}</p>
        </div>
    );
  }

  return (
    <div className="flex flex-col">
      {/* Search & Filters Bar */}
      <div className="flex-shrink-0 flex flex-col md:flex-row justify-between items-center gap-4 bg-white/50 dark:bg-slate-900/50 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 backdrop-blur-sm mb-4">
        <div className="relative w-full md:w-96">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search size={18} className="text-slate-400 dark:text-slate-500" />
          </div>
          <input
            type="text"
            placeholder="Search properties by address..."
            value={filterAddress}
            onChange={(e) => setFilterAddress(e.target.value)}
            className="block w-full pl-10 pr-3 py-2.5 border border-slate-200 dark:border-slate-700 rounded-xl leading-5 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-300 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 sm:text-sm transition-all hover:bg-slate-50 dark:hover:bg-slate-750"
          />
        </div>
        
        <div className="flex items-center gap-3 w-full md:w-auto">
          <div className="flex items-center gap-2 bg-white dark:bg-slate-800 rounded-xl px-4 py-2 border border-slate-200 dark:border-slate-700 w-full md:w-auto">
            <SlidersHorizontal size={16} className="text-slate-400" />
            <select
              id="sort-by"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="bg-transparent border-none text-slate-700 dark:text-slate-300 text-sm focus:ring-0 cursor-pointer w-full outline-none"
            >
              <option value="createdAt" className="text-slate-900">Newest Listed</option>
              <option value="dealScore" className="text-slate-900">Highest Score</option>
              <option value="price" className="text-slate-900">Lowest Price</option>
            </select>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="relative flex flex-col lg:flex-row gap-6 lg:h-[calc(100vh-250px)]">
        
        {/* Left Side: Deal List */}
        {(viewMode === 'list' || viewMode === 'both') && (
            <div className={`flex-1 ${viewMode === 'both' ? 'lg:w-1/2 lg:overflow-y-auto pr-2 custom-scrollbar' : 'w-full'}`}>
                {filteredDeals.length > 0 ? (
                    <div className={`grid gap-6 ${viewMode === 'list' ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4' : 'grid-cols-1'}`}>
                        {filteredDeals.map(deal => (
                        <div 
                            key={deal.id}
                            onMouseEnter={() => setHoveredDealId(deal.id)}
                            onMouseLeave={() => setHoveredDealId(null)}
                        >
                            <DealCard 
                                deal={deal} 
                                onDelete={onDeleteDeal} 
                                onClick={onSelectDeal} 
                            />
                        </div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-24 bg-slate-50/50 dark:bg-slate-900/30 rounded-3xl border border-slate-200 dark:border-slate-800 border-dashed flex flex-col items-center justify-center space-y-6">
                        <div className="bg-white dark:bg-slate-800 p-6 rounded-full">
                        <LayoutGrid size={48} className="text-emerald-500/50" />
                        </div>
                        <div className="max-w-md mx-auto space-y-2">
                        <h3 className="text-2xl font-bold text-slate-900 dark:text-white">No Deals Found</h3>
                        <p className="text-slate-500 dark:text-slate-400">
                            {filterAddress ? `No properties match "${filterAddress}". Try a different search.` : "Your pipeline is currently empty."}
                        </p>
                        </div>
                    </div>
                )}
            </div>
        )}

        {/* Right Side: Map (Fixed on Desktop, Visible on Mobile) */}
        <div className={`flex-1 rounded-2xl overflow-hidden border border-slate-800 relative bg-slate-900 transition-all duration-300 ${viewMode === 'both' ? 'hidden lg:block lg:h-full' : (viewMode === 'map' ? 'block h-[600px] lg:h-full' : 'hidden')}`}>
            <DealMap deals={filteredDeals} onSelectDeal={onSelectDeal} hoveredDealId={hoveredDealId} />
        </div>

        {/* Mobile Toggle Button */}
        <div className="lg:hidden absolute bottom-6 left-1/2 -translate-x-1/2 z-50">
            <button 
                onClick={() => setViewMode(prev => prev === 'list' ? 'map' : 'list')}
                className="bg-slate-900 text-white px-6 py-3 rounded-full shadow-xl shadow-black/50 border border-slate-700 font-bold flex items-center gap-2 hover:scale-105 transition-transform"
            >
                {viewMode === 'list' ? (
                    <>
                        <MapIcon size={18} /> Map View
                    </>
                ) : (
                    <>
                        <List size={18} /> List View
                    </>
                )}
            </button>
        </div>

      </div>
    </div>
  );
};

DealList.propTypes = {
  onDeleteDeal: PropTypes.func.isRequired,
  onSelectDeal: PropTypes.func.isRequired,
  onEditDeal: PropTypes.func.isRequired,
  isPublic: PropTypes.bool,
  buyBox: PropTypes.object,
};

export default DealList;