import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { collection, onSnapshot, query, orderBy, where } from 'firebase/firestore';
import { LayoutGrid, Search, SlidersHorizontal, Map as MapIcon } from 'lucide-react'; 
import NewDealCard from './NewDealCard'; 
import DealMap from './DealMap';

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

const DealList = ({ db, userId, __app_id, onDeleteDeal, onSelectDeal, onEditDeal, isPublic, buyBox }) => {
  const [deals, setDeals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState('createdAt');
  const [filterAddress, setFilterAddress] = useState('');
  const [viewMode, setViewMode] = useState('grid');

  // Initialize filter from Buy Box if available
  useEffect(() => {
    if (buyBox && buyBox.locations && buyBox.locations.length > 0) {
        // Just take the first location as a default search for now
        setFilterAddress(buyBox.locations[0]);
    }
  }, [buyBox]);

  useEffect(() => {
    if (!db || !__app_id) {
      setLoading(false);
      return;
    }
    
    if (!isPublic && !userId) {
         setLoading(false);
         return;
    }

    // Determine Collection Path
    const collectionPath = isPublic 
        ? `artifacts/${__app_id}/public/deals`
        : `artifacts/${__app_id}/users/${userId}/deals`;

    let q = collection(db, collectionPath);

    // Basic Firestore Filtering
    if (filterAddress) {
      q = query(q, where('address', '>=', filterAddress), where('address', '<=', filterAddress + '\uf8ff'));
    }

    // Apply ordering
    // Note: Firestore requires indexes for complex queries. If this fails, console will show link to create index.
    q = query(q, orderBy(sortBy, 'desc'));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      let dealsData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      
      // Client-side filtering for Buy Box (if active and not just searching by address)
      if (isPublic && buyBox) {
          dealsData = dealsData.filter(deal => {
              if (buyBox.minPrice && deal.price < buyBox.minPrice) return false;
              if (buyBox.maxPrice && deal.price > buyBox.maxPrice) return false;
              if (buyBox.minBedrooms && deal.bedrooms < buyBox.minBedrooms) return false;
              // ROI/CapRate filtering would require those to be top-level fields or calculated here
              return true;
          });
      }

      setDeals(dealsData);
      setLoading(false);
    }, (error) => {
      console.error("Error fetching deals:", error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [db, userId, __app_id, sortBy, filterAddress, isPublic, buyBox]);

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
          <SkeletonCard key={i} />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-center gap-4 bg-slate-900/50 p-4 rounded-2xl border border-slate-800 backdrop-blur-sm">
        <div className="relative w-full md:w-96">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search size={18} className="text-slate-500" />
          </div>
          <input
            type="text"
            placeholder="Search properties by address..."
            value={filterAddress}
            onChange={(e) => setFilterAddress(e.target.value)}
            className="block w-full pl-10 pr-3 py-2.5 border border-slate-700 rounded-xl leading-5 bg-slate-800 text-slate-300 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 sm:text-sm transition-all hover:bg-slate-750"
          />
        </div>
        
        <div className="flex items-center gap-3 w-full md:w-auto">
           {/* View Toggle */}
           <div className="flex bg-slate-800 rounded-xl p-1 border border-slate-700">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded-lg transition-all ${viewMode === 'grid' ? 'bg-slate-700 text-emerald-400 shadow-sm' : 'text-slate-400 hover:text-slate-200'}`}
                title="Grid View"
              >
                <LayoutGrid size={18} />
              </button>
              <button
                onClick={() => setViewMode('map')}
                className={`p-2 rounded-lg transition-all ${viewMode === 'map' ? 'bg-slate-700 text-emerald-400 shadow-sm' : 'text-slate-400 hover:text-slate-200'}`}
                title="Map View"
              >
                <MapIcon size={18} />
              </button>
           </div>

          <div className="flex items-center gap-2 bg-slate-800 rounded-xl px-4 py-2 border border-slate-700 w-full md:w-auto">
            <SlidersHorizontal size={16} className="text-slate-400" />
            <select
              id="sort-by"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="bg-transparent border-none text-slate-300 text-sm focus:ring-0 cursor-pointer w-full"
            >
              <option value="createdAt">Newest Listed</option>
              <option value="dealScore">Highest Score</option>
              <option value="price">Lowest Price</option>
            </select>
          </div>
        </div>
      </div>

      {viewMode === 'map' ? (
         <div className="animate-fade-in">
            {deals.length > 0 ? (
               <DealMap deals={deals} onSelectDeal={onSelectDeal} />
            ) : (
               <div className="text-center py-24 bg-slate-900/30 rounded-3xl border border-slate-800 border-dashed text-slate-400">
                  No deals to display on the map.
               </div>
            )}
         </div>
      ) : (
        deals.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 animate-fade-in">
            {deals.map(deal => (
              <NewDealCard 
                key={deal.id} 
                deal={deal} 
                onDeleteDeal={onDeleteDeal} 
                onSelectDeal={onSelectDeal} 
                onEditDeal={onEditDeal}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-24 bg-slate-900/30 rounded-3xl border border-slate-800 border-dashed flex flex-col items-center justify-center space-y-6">
            <div className="bg-slate-800 p-6 rounded-full">
              <LayoutGrid size={48} className="text-emerald-500/50" />
            </div>
            <div className="max-w-md mx-auto space-y-2">
              <h3 className="text-2xl font-bold text-white">No Deals Found</h3>
              <p className="text-slate-400">
                {filterAddress ? `No properties match "${filterAddress}". Try a different search.` : "Your pipeline is currently empty. Start adding deals to track your potential flips."}
              </p>
            </div>
          </div>
        )
      )}
    </div>
  );
};

DealList.propTypes = {
  db: PropTypes.object.isRequired,
  userId: PropTypes.string,
  __app_id: PropTypes.string.isRequired,
  onDeleteDeal: PropTypes.func.isRequired,
  onSelectDeal: PropTypes.func.isRequired,
  onEditDeal: PropTypes.func.isRequired,
  isPublic: PropTypes.bool,
  buyBox: PropTypes.object,
};

export default DealList;