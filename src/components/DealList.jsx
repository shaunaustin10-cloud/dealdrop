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
  const [filterStatus, setFilterStatus] = useState(isPublic ? 'Available' : 'All');
  const [viewMode, setViewMode] = useState('hybrid');
  const [hoveredDealId, setHoveredDealId] = useState(null);
  const [vipOnly, setVipOnly] = useState(false);
  const [showFilters, setShowFilters] = useState(false);

  const { deals: allDeals, loading, error } = useFetchDeals(isPublic, sortBy);

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

    if (filterStatus === 'Available') {
        result = result.filter(deal => {
            const status = deal.status || 'New Lead';
            return status === 'New Lead' || status === 'Available' || status === 'Contacted' || status === 'Under Contract' || status === 'Closed';
        });
    } else if (filterStatus !== 'All') {
        result = result.filter(deal => (deal.status || 'New Lead') === filterStatus);
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

    result.sort((a, b) => {
        const scoreA = (a.status === 'Closed' ? 2 : (a.status === 'Under Contract' ? 1 : 0));
        const scoreB = (b.status === 'Closed' ? 2 : (b.status === 'Under Contract' ? 1 : 0));
        return scoreA - scoreB;
    });

    return result;
  }, [allDeals, filterAddress, isPublic, buyBox, sortBy, vipOnly, filterSource, filterStatus]);

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
      <div className="flex-shrink-0 mb-6 space-y-3">
        {/* Top Control Bar */}
        <div className="flex flex-col md:flex-row gap-3 items-center">
            {/* Search Input */}
            <div className="relative flex-1 w-full">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Search size={16} className="text-slate-400 dark:text-slate-500" />
                </div>
                <input
                    type="text"
                    placeholder="Search by city or address..."
                    value={filterAddress}
                    onChange={(e) => setFilterAddress(e.target.value)}
                    className="block w-full pl-9 pr-3 py-2.5 border border-slate-200 dark:border-slate-800 rounded-xl bg-white dark:bg-slate-900/50 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary/50 text-sm shadow-sm transition-all"
                />
            </div>

            <div className="flex items-center gap-2 w-full md:w-auto">
                {/* Advanced Filter Toggle */}
                <button 
                    onClick={() => setShowFilters(!showFilters)}
                    className={`flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border transition-all text-[10px] font-black uppercase tracking-wider shadow-sm ${showFilters ? 'bg-slate-900 text-white border-slate-900 dark:bg-white dark:text-slate-900' : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-500 hover:border-slate-300'}`}
                >
                    <SlidersHorizontal size={14} />
                    Filters
                </button>

                {/* VIP Toggle */}
                <button 
                    onClick={() => setVipOnly(!vipOnly)}
                    className={`flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border transition-all text-[10px] font-black uppercase tracking-wider shadow-sm ${vipOnly ? 'bg-amber-500 border-amber-600 text-white' : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-500 hover:border-slate-300'}`}
                >
                    <TrendingUp size={14} />
                    VIP
                </button>

                <div className="h-8 w-px bg-slate-200 dark:bg-slate-800 mx-1 hidden md:block"></div>

                {/* View Switcher */}
                <div className="flex bg-white dark:bg-slate-900 p-1 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
                    <button 
                        onClick={() => setViewMode('hybrid')}
                        className={`p-1.5 px-2 rounded-lg transition-all ${viewMode === 'hybrid' ? 'bg-primary text-white shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
                        title="Split View"
                    >
                        <LayoutGrid size={16} />
                    </button>
                    <button 
                        onClick={() => setViewMode('list')}
                        className={`p-1.5 px-2 rounded-lg transition-all ${viewMode === 'list' ? 'bg-primary text-white shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
                        title="List View"
                    >
                        <List size={16} />
                    </button>
                    <button 
                        onClick={() => setViewMode('map')}
                        className={`p-1.5 px-2 rounded-lg transition-all ${viewMode === 'map' ? 'bg-primary text-white shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
                        title="Map View"
                    >
                        <MapIcon size={16} />
                    </button>
                </div>
            </div>
        </div>

        {/* Collapsible Filter Bar */}
        <div className={`overflow-hidden transition-all duration-300 ease-in-out ${showFilters ? 'max-h-40 opacity-100 mt-2' : 'max-h-0 opacity-0'}`}>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 p-4 bg-slate-50 dark:bg-slate-800/30 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-inner">
                {!isPublic && (
                    <div className="flex flex-col gap-1">
                        <label className="text-[9px] uppercase font-black text-slate-400 px-1">Source</label>
                        <select
                            value={filterSource}
                            onChange={(e) => setFilterSource(e.target.value)}
                            className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-700 dark:text-slate-300 text-xs font-bold focus:ring-primary focus:border-primary outline-none py-2 px-2"
                        >
                            <option value="All">All Sources</option>
                            <option value="Off-Market">Off-Market</option>
                            <option value="MLS/Listed">MLS / Listed</option>
                            <option value="Wholesaler">Wholesaler</option>
                            <option value="Direct Mail">Direct Mail</option>
                        </select>
                    </div>
                )}

                <div className="flex flex-col gap-1">
                    <label className="text-[9px] uppercase font-black text-slate-400 px-1">Deal Status</label>
                    <select
                        value={filterStatus}
                        onChange={(e) => setFilterStatus(e.target.value)}
                        className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-700 dark:text-slate-300 text-xs font-bold focus:ring-primary focus:border-primary outline-none py-2 px-2"
                    >
                        <option value="All">All Status</option>
                        <option value="Available">Available</option>
                        <option value="Under Contract">Under Contract</option>
                        <option value="Closed">Closed / Sold</option>
                    </select>
                </div>

                <div className="flex flex-col gap-1">
                    <label className="text-[9px] uppercase font-black text-slate-400 px-1">Sort By</label>
                    <select
                        value={sortBy}
                        onChange={(e) => setSortBy(e.target.value)}
                        className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-700 dark:text-slate-300 text-xs font-bold focus:ring-primary focus:border-primary outline-none py-2 px-2"
                    >
                        <option value={isPublic ? 'publishedAt' : 'createdAt'}>Newest Listed</option>
                        <option value="dealScore">Highest Score</option>
                        <option value="price">Lowest Price</option>
                    </select>
                </div>

                <div className="flex items-end">
                    <button 
                        onClick={() => {
                            setFilterAddress('');
                            setFilterSource('All');
                            setFilterStatus(isPublic ? 'Available' : 'All');
                            setSortBy(isPublic ? 'publishedAt' : 'createdAt');
                            setVipOnly(false);
                        }}
                        className="w-full py-2 text-[10px] font-black uppercase text-slate-400 hover:text-slate-600 transition-colors"
                    >
                        Reset All
                    </button>
                </div>
            </div>
        </div>
      </div>

      <div className="relative flex-1 min-h-0">
        <div className={`flex flex-col lg:flex-row gap-6 h-full ${viewMode === 'hybrid' ? 'lg:h-[calc(100vh-180px)]' : 'lg:h-[calc(100vh-180px)]'}`}>
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

          {(viewMode === 'map' || viewMode === 'hybrid') && (
              <div className={`${viewMode === 'hybrid' ? 'lg:w-1/2' : 'w-full'} h-[500px] lg:h-full rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800 relative bg-slate-100 dark:bg-slate-900 shadow-inner`}>
                  <DealMap deals={filteredDeals} onSelectDeal={onSelectDeal} hoveredDealId={hoveredDealId} />
              </div>
          )}
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