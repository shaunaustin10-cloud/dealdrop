import React, { useEffect, useState } from 'react';
import { collection, getDocs, query, orderBy, limit, doc, updateDoc, deleteDoc } from 'firebase/firestore';
import { db } from '../firebaseConfig';
import { Search, MapPin, Calendar, Clock, ExternalLink, Copy, CheckCircle, Trash2, Filter } from 'lucide-react';

const appId = import.meta.env.VITE_APP_ID || 'default-app-id';

const ForeclosureLeads = () => {
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchArea] = useState('');
  const [filter, setFilter] = useState('all'); // all, Hampton Roads, Richmond

  useEffect(() => {
    fetchLeads();
  }, []);

  const fetchLeads = async () => {
    try {
      const leadsRef = collection(db, 'artifacts', appId, 'foreclosureLeads');
      const q = query(leadsRef, limit(1000)); 
      const snap = await getDocs(q);
      let leadsList = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      
      // Sort: Furthest Auction Date first, then by dateAdded
      leadsList.sort((a, b) => {
        const dateA = a.saleDate ? new Date(a.saleDate) : null;
        const dateB = b.saleDate ? new Date(b.saleDate) : null;
        
        // Handle invalid dates
        const isValidA = dateA && !isNaN(dateA.getTime());
        const isValidB = dateB && !isNaN(dateB.getTime());

        if (isValidA && isValidB) {
          return dateB.getTime() - dateA.getTime(); // Furthest date (descending)
        }
        
        if (isValidA) return -1;
        if (isValidB) return 1;

        // Fallback to dateAdded if no sale date
        const addedA = new Date(a.dateAdded || 0);
        const addedB = new Date(b.dateAdded || 0);
        return addedB.getTime() - addedA.getTime();
      });

      setLeads(leadsList);
    } catch (e) {
      console.error("Error fetching leads:", e);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (leadId, newStatus) => {
    try {
      const leadRef = doc(db, 'artifacts', appId, 'foreclosureLeads', leadId);
      await updateDoc(leadRef, { status: newStatus });
      setLeads(prev => prev.map(l => l.id === leadId ? { ...l, status: newStatus } : l));
    } catch (e) {
      console.error("Error updating status:", e);
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    // You could add a toast notification here
  };

  const filteredLeads = leads.filter(lead => {
    const areaMatch = filter === 'all' || 
      (filter === 'Hampton Roads' && ['NORFOLK', 'VIRGINIA BEACH', 'CHESAPEAKE', 'PORTSMOUTH', 'SUFFOLK', 'HAMPTON', 'NEWPORT NEWS'].some(c => lead.address.toUpperCase().includes(c))) ||
      (filter === 'Richmond' && ['RICHMOND', 'HENRICO', 'CHESTERFIELD'].some(c => lead.address.toUpperCase().includes(c)));
    
    const searchMatch = lead.address.toLowerCase().includes(searchTerm.toLowerCase());
    
    return areaMatch && searchMatch;
  });

  if (loading) return <div className="p-8 text-center">Loading Leads...</div>;

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row gap-4 justify-between items-center bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input 
            type="text" 
            placeholder="Search addresses..." 
            className="w-full pl-10 pr-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 focus:ring-2 focus:ring-emerald-500 outline-none"
            value={searchTerm}
            onChange={(e) => setSearchArea(e.target.value)}
          />
        </div>
        <div className="flex gap-2">
          {['all', 'Hampton Roads', 'Richmond'].map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${
                filter === f 
                ? 'bg-emerald-600 text-white shadow-lg' 
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
              }`}
            >
              {f.charAt(0).toUpperCase() + f.slice(1)}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {filteredLeads.map(lead => (
          <div key={lead.id} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-2xl shadow-sm hover:shadow-md transition-all group">
            <div className="flex flex-col md:flex-row justify-between gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-[10px] uppercase font-black px-2 py-0.5 bg-slate-100 dark:bg-slate-800 text-slate-500 rounded">
                    {lead.source}
                  </span>
                  {lead.status === 'skip-traced' && (
                    <span className="text-[10px] uppercase font-black px-2 py-0.5 bg-emerald-500/10 text-emerald-600 rounded flex items-center gap-1">
                      <CheckCircle size={10} /> Skip Traced
                    </span>
                  )}
                </div>
                <h4 className="font-black text-xl text-slate-900 dark:text-white flex items-center gap-2">
                  {lead.address}
                  <button 
                    onClick={() => copyToClipboard(lead.address)}
                    className="text-slate-400 hover:text-emerald-500 transition-colors"
                    title="Copy for TruePeopleSearch"
                  >
                    <Copy size={16} />
                  </button>
                </h4>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-y-2 mt-4 text-sm">
                  <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400">
                    <Calendar size={16} className="text-emerald-500" />
                    <span>Sale Date: <strong>{lead.saleDate || 'TBD'}</strong></span>
                  </div>
                  <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400">
                    <MapPin size={16} className="text-emerald-500" />
                    <span>{lead.jurisdiction || lead.county}</span>
                  </div>
                </div>
              </div>

              <div className="flex flex-row md:flex-col justify-end gap-2 border-t md:border-t-0 pt-4 md:pt-0 border-slate-100 dark:border-slate-800">
                <button 
                  onClick={() => handleStatusChange(lead.id, lead.status === 'skip-traced' ? 'new' : 'skip-traced')}
                  className={`px-4 py-2 rounded-xl font-bold text-sm transition-all flex items-center justify-center gap-2 border ${
                    lead.status === 'skip-traced'
                    ? 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20'
                    : 'bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700'
                  }`}
                >
                  <CheckCircle size={16} /> {lead.status === 'skip-traced' ? 'Completed' : 'Mark Done'}
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
      
      {filteredLeads.length === 0 && (
        <div className="text-center py-20 bg-slate-50 dark:bg-slate-900/50 rounded-3xl border-2 border-dashed border-slate-200 dark:border-slate-800">
          <p className="text-slate-500 font-bold">No leads found matching your criteria.</p>
        </div>
      )}
    </div>
  );
};

export default ForeclosureLeads;
