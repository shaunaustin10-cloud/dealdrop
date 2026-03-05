import React, { useEffect, useState } from 'react';
import { collection, getDocs, query, limit } from 'firebase/firestore';
import { db } from '../firebaseConfig';
import { Search, MapPin, Calendar, Copy, CheckCircle } from 'lucide-react';

const appId = import.meta.env.VITE_APP_ID || 'dealdrop-prod';

const ForeclosureLeads = () => {
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchLeads();
  }, []);

  const fetchLeads = async () => {
    try {
      console.log(`Fetching leads from: artifacts/${appId}/foreclosureLeads`);
      const leadsRef = collection(db, 'artifacts', appId, 'foreclosureLeads');
      const q = query(leadsRef, limit(1000)); 
      const snap = await getDocs(q);
      
      const leadsList = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      console.log(`Found ${leadsList.length} leads.`);
      setLeads(leadsList);
    } catch (e) {
      console.error("Error fetching leads:", e);
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
  };

  if (loading) return <div className="p-8 text-center">Loading Leads... (Checking folder: {appId})</div>;
  if (error) return <div className="p-8 text-center text-red-500 font-bold">Error: {error}</div>;

  return (
    <div className="space-y-6">
      <div className="bg-emerald-600 text-white p-4 rounded-xl shadow-lg flex justify-between items-center">
        <h2 className="font-black uppercase tracking-widest text-sm">Foreclosure Database Debug</h2>
        <div className="font-black text-xl">Total Leads Found: {leads.length}</div>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {leads.map(lead => (
          <div key={lead.id} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-2xl shadow-sm hover:shadow-md transition-all group">
            <div className="flex flex-col md:flex-row justify-between gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-[10px] uppercase font-black px-2 py-0.5 bg-slate-100 dark:bg-slate-800 text-slate-500 rounded">
                    {lead.source}
                  </span>
                </div>
                <h4 className="font-black text-xl text-slate-900 dark:text-white flex items-center gap-2">
                  {lead.address}
                  <button 
                    onClick={() => copyToClipboard(lead.address)}
                    className="text-slate-400 hover:text-emerald-500 transition-colors"
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
            </div>
          </div>
        ))}
      </div>
      
      {leads.length === 0 && (
        <div className="text-center py-20 bg-slate-50 dark:bg-slate-900/50 rounded-3xl border-2 border-dashed border-slate-200 dark:border-slate-800">
          <p className="text-slate-500 font-bold mb-2">No leads found in artifacts/{appId}/foreclosureLeads</p>
          <p className="text-xs text-slate-400">Double check that the GitHub Scraper finished successfully.</p>
        </div>
      )}
    </div>
  );
};

export default ForeclosureLeads;
