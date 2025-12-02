import React from 'react';
import PropTypes from 'prop-types';
import { ShieldCheck, TrendingUp, DollarSign, Activity } from 'lucide-react';
import { calculateDealScore } from '../utils/calculateDealScore';

const DealAnalysis = ({ deal }) => {
  // Calculate real-time metrics
  const { score, verdict, verdictColor, metrics } = calculateDealScore(deal);
  const market = deal.aiAnalysis?.market;

  return (
    <div className="bg-slate-900 border border-emerald-500/30 rounded-2xl p-6 animate-fade-in relative overflow-hidden">
      <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none"></div>
      
      <div className="flex items-center justify-between mb-6">
        <div>
            <h3 className="text-xl font-bold text-white flex items-center gap-2">
            <ShieldCheck className="text-emerald-400" /> Instant Deal Analysis
            </h3>
            <p className="text-xs text-slate-400 mt-1">Real-time profitability scoring</p>
        </div>
        <div className="text-right">
            <span className={`text-3xl font-black ${verdictColor} block leading-none`}>{score}/100</span>
            <span className={`text-xs font-bold uppercase tracking-wider ${verdictColor}`}>{verdict}</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Financial Snapshot */}
        <div className="bg-slate-800/50 p-4 rounded-xl border border-slate-700 h-full">
             <h4 className="text-slate-400 text-sm font-bold uppercase mb-3 flex items-center gap-2">
               <DollarSign size={16} /> Profitability Metrics
             </h4>
             <div className="space-y-3">
               <div className="flex justify-between items-center">
                 <span className="text-slate-300">Est. Equity</span>
                 <span className="text-emerald-400 font-mono font-bold">
                   ${metrics.equity?.toLocaleString()}
                 </span>
               </div>
               <div className="flex justify-between items-center">
                 <span className="text-slate-300">ROI (Cash-on-Cash)</span>
                 <span className={`font-bold ${Number(metrics.roi) > 15 ? 'text-emerald-400' : 'text-slate-200'}`}>
                   {metrics.roi}%
                 </span>
               </div>
               <div className="flex justify-between items-center">
                 <span className="text-slate-300">Cap Rate (Rental)</span>
                 <span className="font-mono text-slate-200">
                   {metrics.capRate}%
                 </span>
               </div>
                <div className="pt-2 border-t border-slate-700/50">
                   <div className="flex justify-between items-center text-xs">
                        <span className="text-slate-400">Max Allowable Offer (70% Rule)</span>
                        <span className="text-slate-300">${Math.round(metrics.mao)?.toLocaleString()}</span>
                   </div>
                </div>
             </div>
        </div>

        {/* Market Data Section (RenCast) */}
        <div className="bg-slate-800/50 p-4 rounded-xl border border-slate-700 h-full flex flex-col">
             <h4 className="text-slate-400 text-sm font-bold uppercase mb-3 flex items-center gap-2">
               <TrendingUp size={16} /> Market Validation
             </h4>
             {market ? (
                <div className="space-y-3 flex-1">
                    <div className="flex justify-between items-center">
                        <span className="text-slate-300">Verified ARV</span>
                        <span className="text-emerald-400 font-mono font-bold">
                        ${market.arv?.toLocaleString() || 0}
                        </span>
                    </div>
                    <div className="flex justify-between items-center">
                        <span className="text-slate-300">Rent Estimate</span>
                        <span className="text-slate-200 font-mono">
                        ${market.rentEstimate?.toLocaleString() || 0}/mo
                        </span>
                    </div>
                    
                    {market.comps && market.comps.length > 0 && (
                        <div className="pt-2 border-t border-slate-700/50 mt-auto">
                        <p className="text-xs text-slate-500 mb-1">Recent Comps</p>
                        {market.comps.map((comp, i) => (
                            <div key={i} className="flex justify-between text-xs text-slate-400 py-0.5">
                            <span className="truncate max-w-[60%]" title={comp.address}>{comp.address}</span>
                            <span>${comp.price.toLocaleString()}</span>
                            </div>
                        ))}
                        </div>
                    )}
                </div>
             ) : (
                <div className="flex-1 flex flex-col items-center justify-center text-slate-500 text-xs text-center p-4">
                    <Activity size={24} className="mb-2 opacity-20" />
                    <p>No market data fetched yet.</p>
                    <p>Click "Fetch Market Data" above.</p>
                </div>
             )}
        </div>
      </div>

      {/* Gemini AI Analysis */}
      {deal.aiAnalysis?.gemini && (
        <div className="mt-6 bg-gradient-to-br from-slate-800 to-slate-900 p-5 rounded-xl border border-indigo-500/30 shadow-lg shadow-indigo-500/10">
            <div className="flex items-center gap-2 mb-4">
                <div className="p-1.5 bg-indigo-500/20 rounded-lg">
                    <Activity size={18} className="text-indigo-400" />
                </div>
                <h4 className="text-indigo-200 font-bold uppercase tracking-wider text-sm">AI Underwriter's Report</h4>
            </div>
            
            <div className="space-y-4">
                <div className="bg-slate-950/50 p-3 rounded-lg border border-slate-800">
                    <p className="text-slate-300 italic text-sm">"{deal.aiAnalysis.gemini.summary}"</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <h5 className="text-rose-400 text-xs font-bold uppercase mb-2 flex items-center gap-1">
                             Risks
                        </h5>
                        <ul className="text-sm space-y-1">
                            {deal.aiAnalysis.gemini.risks?.map((risk, i) => (
                                <li key={i} className="flex items-start gap-2 text-slate-400">
                                    <span className="text-rose-500/50 mt-1">•</span> {risk}
                                </li>
                            ))}
                        </ul>
                    </div>
                    <div>
                        <h5 className="text-emerald-400 text-xs font-bold uppercase mb-2 flex items-center gap-1">
                             Strengths
                        </h5>
                        <ul className="text-sm space-y-1">
                            {deal.aiAnalysis.gemini.strengths?.map((strength, i) => (
                                <li key={i} className="flex items-start gap-2 text-slate-400">
                                    <span className="text-emerald-500/50 mt-1">•</span> {strength}
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>
            </div>
        </div>
      )}

    </div>
  );
};

DealAnalysis.propTypes = {
  deal: PropTypes.object.isRequired,
};

export default DealAnalysis;
