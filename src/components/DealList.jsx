import React, { useState, useEffect, useMemo } from 'react';
import PropTypes from 'prop-types';
import { LayoutGrid, Search, SlidersHorizontal, Map as MapIcon, List, TrendingUp } from 'lucide-react'; 
import DealCard from './DealCard'; 
import DealMap from './DealMap';
import { useFetchDeals } from '../hooks/useDeals';

const SkeletonCard = () => (
  <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden h-full flex flex-col">
    <div className="h-48 bg-slate-100 dark:bg-slate-800 animate-pulse relative">
       <div className="absolute inset-0 bg-gradient-to-r from-slate-100 via-slate-50 to-slate-100 dark:from-slate-800 dark:via-slate-700 dark:to-slate-800 animate-shimmer" style={{ backgroundSize: '200% 100%' }}></div>
    </div>
    <div className="p-4 flex-1 space-y-4">
      <div className="h-6 bg-slate-100 dark:bg-slate-800 rounded w-3/4 animate-pulse"></div>
      <div className="flex justify-between">
        <div className="h-4 bg-slate-100 dark:bg-slate-800 rounded w-1/4 animate-pulse"></div>
        <div className="h-4 bg-slate-100 dark:bg-slate-800 rounded w-1/4 animate-pulse"></div>
      </div>
      <div className="h-10 bg-slate-100 dark:bg-slate-800 rounded w-full animate-pulse mt-4"></div>
    </div>
  </div>
);

const DealList = ({ onDeleteDeal, onSelectDeal, isPublic, buyBox }) => {
  const [sortBy, setSortBy] = useState(isPublic ? 'publishedAt' : 'createdAt');
  const [filterAddress, setFilterAddress] = useState('');
  const [filterSource, setFilterSource] = useState('All');
  const [viewMode, setViewMode] = useState('list'); // 'map', 'list'
  const [hoveredDealId, setHoveredDealId] = useState(null);
  const [vipOnly, setVipOnly] = useState(false);

  const { deals: allDeals, loading, error } = useFetchDeals(isPublic, sortBy);

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

    if (filterSource !== 'All') {
        result = result.filter(deal => {
            const source = deal.leadSource || 'Off-Market';
            if (filterSource === 'MLS/Listed') {
                return source === 'MLS' || source === 'Listed';
            }
            return source === filterSource;
        });
    }

    if (vipOnly) {
        result = result.filter(deal => (deal.dealScore || 0) >= 84);
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
    } else if (sortBy === 'createdAt' || sortBy === 'publishedAt') {
        result.sort((a, b) => {
             const dateA = a[sortBy]?.toDate ? a[sortBy].toDate() : (a[sortBy] || 0);
             const dateB = b[sortBy]?.toDate ? b[sortBy].toDate() : (b[sortBy] || 0);
             return dateB - dateA;
        });
    }

    return result;
  }, [allDeals, filterAddress, isPublic, buyBox, sortBy, vipOnly]);

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
    <div className="flex flex-col h-full">
      {/* Search & Filters Bar */}
      <div className="flex-shrink-0 flex flex-col md:flex-row justify-between items-center gap-3 bg-white/50 dark:bg-slate-900/50 p-3 rounded-xl border border-slate-200 dark:border-slate-800 backdrop-blur-sm mb-3">
        <div className="relative w-full md:w-80">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search size={16} className="text-slate-400 dark:text-slate-500" />
          </div>
          <input
            type="text"
            placeholder="Search properties..."
            value={filterAddress}
            onChange={(e) => setFilterAddress(e.target.value)}
            className="block w-full pl-9 pr-3 py-2 border border-slate-200 dark:border-slate-700 rounded-lg leading-5 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-300 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-xs transition-all hover:bg-slate-50 dark:hover:bg-slate-750"
          />
        </div>
        
        <div className="flex items-center gap-2 w-full md:w-auto">
          <button 
            onClick={() => setVipOnly(!vipOnly)}
            className={`flex items-center gap-2 px-3 py-2 rounded-lg border transition-all text-[10px] md:text-xs font-bold ${vipOnly ? 'bg-amber-500 border-amber-600 text-white shadow-md' : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'}`}
          >
            <TrendingUp size={14} />
            VIP Only
          </button>

          <div className="flex items-center gap-2 bg-white dark:bg-slate-800 rounded-lg px-3 py-2 border border-slate-200 dark:border-slate-700 w-full md:w-auto">
            <span className="text-[10px] uppercase font-black text-slate-400 dark:text-slate-500 whitespace-nowrap">Source</span>
            <select
              value={filterSource}
              onChange={(e) => setFilterSource(e.target.value)}
              className="bg-transparent border-none text-slate-700 dark:text-slate-300 text-[10px] md:text-xs font-bold focus:ring-0 cursor-pointer w-full outline-none"
            >
              <option value="All" className="text-slate-900">All Sources</option>
              <option value="Off-Market" className="text-slate-900">Off-Market</option>
              <option value="MLS/Listed" className="text-slate-900">MLS / Listed</option>
              <option value="Wholesaler" className="text-slate-900">Wholesaler</option>
              <option value="Direct Mail" className="text-slate-900">Direct Mail</option>
              <option value="Referral" className="text-slate-900">Referral</option>
              <option value="Other" className="text-slate-900">Other</option>
            </select>
          </div>

          <div className="flex items-center gap-2 bg-white dark:bg-slate-800 rounded-lg px-3 py-2 border border-slate-200 dark:border-slate-700 w-full md:w-auto">
            <SlidersHorizontal size={14} className="text-slate-400" />
            <select
              id="sort-by"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="bg-transparent border-none text-slate-700 dark:text-slate-300 text-[10px] md:text-xs font-bold focus:ring-0 cursor-pointer w-full outline-none"
            >
              <option value={isPublic ? 'publishedAt' : 'createdAt'} className="text-slate-900">Newest Listed</option>
              <option value="dealScore" className="text-slate-900">Highest Score</option>
              <option value="price" className="text-slate-900">Lowest Price</option>
            </select>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="relative flex-1 min-h-0">
        <div className={`flex flex-col lg:flex-row gap-6 h-full ${viewMode === 'hybrid' ? 'lg:h-[calc(100vh-180px)]' : 'lg:h-[calc(100vh-180px)]'}`}>
          
          {/* List View Component */}
          {(viewMode === 'list' || viewMode === 'hybrid') && (
              <div className={`${viewMode === 'hybrid' ? 'lg:w-1/2' : 'w-full'} h-full lg:overflow-y-auto pr-2 custom-scrollbar`}>
                  {filteredDeals.length > 0 ? (
                      <div className={`grid gap-6 ${viewMode === 'hybrid' ? 'grid-cols-1 xl:grid-cols-2' : 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'}`}>
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
                                  isPublic={isPublic}
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

          {/* Map View Component */}
          {(viewMode === 'map' || viewMode === 'hybrid') && (
              <div className={`${viewMode === 'hybrid' ? 'lg:w-1/2' : 'w-full'} h-[500px] lg:h-full rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800 relative bg-slate-100 dark:bg-slate-900 shadow-inner`}>
                  <DealMap deals={filteredDeals} onSelectDeal={onSelectDeal} hoveredDealId={hoveredDealId} />
              </div>
          )}
        </div>

        {/* View Mode Toggle Controls */}
        <div className="fixed lg:absolute bottom-24 lg:bottom-6 left-1/2 -translate-x-1/2 z-50 flex bg-slate-900/90 dark:bg-slate-800/90 backdrop-blur-md p-1 rounded-full shadow-2xl border border-slate-700/50">
            <button 
                onClick={() => setViewMode('list')}
                className={`px-4 py-2 rounded-full text-xs font-bold transition-all flex items-center gap-2 ${viewMode === 'list' ? 'bg-emerald-500 text-white shadow-lg' : 'text-slate-400 hover:text-white'}`}
            >
                <List size={16} /> <span className="hidden sm:inline">List</span>
            </button>
            <button 
                onClick={() => setViewMode('hybrid')}
                className={`px-4 py-2 rounded-full text-xs font-bold transition-all flex items-center gap-2 ${viewMode === 'hybrid' ? 'bg-emerald-500 text-white shadow-lg' : 'text-slate-400 hover:text-white'}`}
            >
                <LayoutGrid size={16} /> <span className="hidden sm:inline">Hybrid</span>
            </button>
            <button 
                onClick={() => setViewMode('map')}
                className={`px-4 py-2 rounded-full text-xs font-bold transition-all flex items-center gap-2 ${viewMode === 'map' ? 'bg-emerald-500 text-white shadow-lg' : 'text-slate-400 hover:text-white'}`}
            >
                <MapIcon size={16} /> <span className="hidden sm:inline">Map</span>
            </button>
        </div>
      </div>
    </div>
  );
};

DealList.propTypes = {
  onDeleteDeal: PropTypes.func,
  onSelectDeal: PropTypes.func.isRequired,
  onEditDeal: PropTypes.func,
  isPublic: PropTypes.bool,
  buyBox: PropTypes.object,
};

export default DealList;