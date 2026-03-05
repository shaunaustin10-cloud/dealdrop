import React, { useEffect, useState } from 'react';
import { collection, getDocs, query, limit } from 'firebase/firestore';
import { db } from '../firebaseConfig';
import { MapPin, Calendar, Copy, ArrowDownAZ, Clock, Filter } from 'lucide-react';

const appId = 'default-app-id';

const ForeclosureLeads = () => {
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [sortBy, setSortBy] = useState('auctionDate'); // 'newest', 'auctionDate', 'city'
  const [selectedCity, setSelectedCity] = useState('All Cities');

  useEffect(() => {
    fetchLeads();
  }, []);

  const fetchLeads = async () => {
    try {
      const leadsRef = collection(db, 'artifacts', appId, 'foreclosureLeads');
      const q = query(leadsRef, limit(1000)); 
      const snap = await getDocs(q);
      
      const leadsList = snap.docs.map(doc => ({ 
        id: doc.id, 
        ...doc.data(),
        // Parse date for sorting
        parsedAuctionDate: doc.data().saleDate ? new Date(doc.data().saleDate) : new Date(0),
        addedTime: doc.data().updatedAt?.toMillis() || 0
      }));
      setLeads(leadsList);
    } catch (e) {
      console.error("Error fetching leads:", e);
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  // Extract unique cities/jurisdictions
  const cities = ['All Cities', ...new Set(leads.map(lead => (lead.jurisdiction || lead.county || 'Unknown').trim()))].sort();

  const getFilteredAndSortedLeads = () => {
    let filtered = [...leads];
    
    // 1. Filter by city
    if (selectedCity !== 'All Cities') {
      filtered = filtered.filter(lead => (lead.jurisdiction || lead.county) === selectedCity);
    }

    // 2. Sort
    if (sortBy === 'newest') {
      return filtered.sort((a, b) => b.addedTime - a.addedTime);
    } else if (sortBy === 'auctionDate') {
      return filtered.sort((a, b) => b.parsedAuctionDate - a.parsedAuctionDate);
    } else if (sortBy === 'city') {
      return filtered.sort((a, b) => {
        const cityA = (a.jurisdiction || a.county || '').toUpperCase();
        const cityB = (b.jurisdiction || b.county || '').toUpperCase();
        return cityA.localeCompare(cityB);
      });
    }
    return filtered;
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
  };

  if (loading) return <div className="p-8 text-center">Loading Leads...</div>;
  if (error) return <div className="p-8 text-center text-red-500 font-bold">Error: {error}</div>;

  const displayLeads = getFilteredAndSortedLeads();

  return (
    <div className="space-y-6">
      {/* Header & Controls */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 rounded-2xl shadow-sm space-y-4">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h2 className="font-black text-slate-900 dark:text-white uppercase tracking-tight">Foreclosure Lead List</h2>
            <p className="text-xs text-slate-500 font-medium">Showing {displayLeads.length} of {leads.length} total leads</p>
          </div>

          <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
            {/* City Dropdown */}
            <div className="relative flex-1 md:flex-none min-w-[160px]">
              <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
                <Filter size={14} />
              </div>
              <select 
                value={selectedCity}
                onChange={(e) => setSelectedCity(e.target.value)}
                className="w-full pl-9 pr-4 py-2 bg-slate-100 dark:bg-slate-800 border-none rounded-xl text-xs font-bold text-slate-700 dark:text-slate-200 appearance-none cursor-pointer focus:ring-2 focus:ring-emerald-500/20 transition-all"
              >
                {cities.map(city => (
                  <option key={city} value={city}>{city}</option>
                ))}
              </select>
            </div>

            {/* Sort Toggles */}
            <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-xl flex-1 md:flex-none">
              <button 
                onClick={() => setSortBy('auctionDate')}
                className={`flex-1 md:flex-none flex items-center justify-center gap-2 px-3 py-1.5 rounded-lg text-[10px] font-black uppercase transition-all ${sortBy === 'auctionDate' ? 'bg-white dark:bg-slate-700 text-emerald-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
              >
                <Calendar size={12} /> Auction
              </button>
              <button 
                onClick={() => setSortBy('newest')}
                className={`flex-1 md:flex-none flex items-center justify-center gap-2 px-3 py-1.5 rounded-lg text-[10px] font-black uppercase transition-all ${sortBy === 'newest' ? 'bg-white dark:bg-slate-700 text-emerald-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
              >
                <Clock size={12} /> Newest
              </button>
              <button 
                onClick={() => setSortBy('city')}
                className={`flex-1 md:flex-none flex items-center justify-center gap-2 px-3 py-1.5 rounded-lg text-[10px] font-black uppercase transition-all ${sortBy === 'city' ? 'bg-white dark:bg-slate-700 text-emerald-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
              >
                <ArrowDownAZ size={12} /> City
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Leads List */}
      <div className="grid grid-cols-1 gap-4">
        {displayLeads.map(lead => (
          <div key={lead.id} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-2xl shadow-sm hover:shadow-md transition-all group">
            <div className="flex flex-col md:flex-row justify-between gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-[10px] uppercase font-black px-2 py-0.5 bg-slate-100 dark:bg-slate-800 text-slate-500 rounded">
                    {lead.source}
                  </span>
                  {lead.status === 'Cancelled' && (
                    <span className="text-[10px] uppercase font-black px-2 py-0.5 bg-red-100 dark:bg-red-900/20 text-red-600 rounded">
                      Cancelled
                    </span>
                  )}
                </div>
                <h4 className="font-black text-xl text-slate-900 dark:text-white flex items-center gap-2 leading-tight">
                  {lead.address}
                  <button 
                    onClick={() => copyToClipboard(lead.address)}
                    className="text-slate-400 hover:text-emerald-500 transition-colors"
                    title="Copy Address"
                  >
                    <Copy size={16} />
                  </button>
                </h4>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-y-2 mt-4 text-sm">
                  <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400">
                    <Calendar size={16} className="text-emerald-500" />
                    <span>Auction: <strong>{lead.saleDate || 'TBD'}</strong></span>
                  </div>
                  <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400">
                    <MapPin size={16} className="text-emerald-500" />
                    <span>{lead.jurisdiction || lead.county}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
      
      {displayLeads.length === 0 && (
        <div className="text-center py-20 bg-slate-50 dark:bg-slate-900/50 rounded-3xl border-2 border-dashed border-slate-200 dark:border-slate-800">
          <p className="text-slate-500 font-bold mb-2">No leads found for {selectedCity}.</p>
        </div>
      )}
    </div>
  );
};

export default ForeclosureLeads;
