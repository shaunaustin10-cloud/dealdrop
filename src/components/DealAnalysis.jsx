import React from 'react';
import PropTypes from 'prop-types';
import { ShieldCheck, TrendingUp, DollarSign, Activity } from 'lucide-react';
import { calculateDealScore } from '../utils/calculateDealScore';

const DealAnalysis = ({ deal }) => {
  // Calculate real-time metrics
  const { score, verdict, verdictColor, metrics } = calculateDealScore(deal);
  const market = deal.aiAnalysis?.market;
  const isAgent = deal.roleAtCreation === 'agent';

  return (
    <div className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-emerald-500/30 rounded-2xl p-6 animate-fade-in relative overflow-hidden">
      <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none"></div>
      
      {!isAgent && (
      <div className="flex items-center justify-between mb-6">
        <div>
            <h3 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <ShieldCheck className="text-emerald-500 dark:text-emerald-400" /> Instant Deal Analysis
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Real-time profitability scoring</p>
        </div>
        <div className="text-right">
            <span className={`text-3xl font-black ${verdictColor} block leading-none`}>{score}/100</span>
            <span className={`text-xs font-bold uppercase tracking-wider ${verdictColor}`}>{verdict}</span>
        </div>
      </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Financial Snapshot */}
        <div className="bg-white dark:bg-slate-800/50 p-4 rounded-xl border border-slate-200 dark:border-slate-700 h-full shadow-sm">
             <h4 className="text-slate-500 dark:text-slate-400 text-sm font-bold uppercase mb-3 flex items-center gap-2">
               <DollarSign size={16} /> Profitability Metrics
             </h4>
             <div className="space-y-3">
               <div className="flex justify-between items-center">
                 <span className="text-slate-600 dark:text-slate-300">Est. Equity</span>
                 <span className="text-emerald-600 dark:text-emerald-400 font-mono font-bold">
                   ${metrics.equity?.toLocaleString()}
                 </span>
               </div>
               <div className="flex justify-between items-center">
                 <span className="text-slate-600 dark:text-slate-300">ROI (Cash-on-Cash)</span>
                 <span className={`font-bold ${Number(metrics.roi) > 15 ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-900 dark:text-slate-200'}`}>
                   {metrics.roi}%
                 </span>
               </div>
               <div className="flex justify-between items-center">
                 <span className="text-slate-600 dark:text-slate-300">Cap Rate (Rental)</span>
                 <span className="font-mono text-slate-900 dark:text-slate-200">
                   {metrics.capRate}%
                 </span>
               </div>
                <div className="pt-2 border-t border-slate-100 dark:border-slate-700/50">
                   <div className="flex justify-between items-center text-xs">
                        <span className="text-slate-500 dark:text-slate-400">Max Allowable Offer (70% Rule)</span>
                        <span className="text-slate-600 dark:text-slate-300">${Math.round(metrics.mao)?.toLocaleString()}</span>
                   </div>
                </div>
             </div>
        </div>

        {/* Market Data Section (RenCast) */}
        <div className="bg-white dark:bg-slate-800/50 p-4 rounded-xl border border-slate-200 dark:border-slate-700 h-full flex flex-col shadow-sm">
             <div className="flex justify-between items-start mb-3">
                <h4 className="text-slate-500 dark:text-slate-400 text-sm font-bold uppercase flex items-center gap-2">
                  <TrendingUp size={16} /> Market Validation
                </h4>
                {market && (
                    <div className="flex flex-col items-end">
                        <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${market.confidenceScore >= 80 ? 'bg-emerald-500/20 text-emerald-600 dark:text-emerald-400' : market.confidenceScore >= 60 ? 'bg-amber-500/20 text-amber-600 dark:text-amber-400' : 'bg-rose-500/20 text-rose-600 dark:text-rose-400'}`}>
                            {market.confidenceScore}% Conf.
                        </span>
                    </div>
                )}
             </div>

             {market ? (
                <div className="space-y-4 flex-1 overflow-y-auto pr-1 max-h-[300px] custom-scrollbar">
                    {/* ARV Section */}
                    <div className="bg-slate-50 dark:bg-slate-900/50 p-3 rounded-lg border border-slate-100 dark:border-slate-700/50">
                        <div className="flex justify-between items-center mb-1">
                            <span className="text-slate-500 dark:text-slate-400 text-xs uppercase font-bold">Verified ARV</span>
                            <span className="text-emerald-600 dark:text-emerald-400 font-mono font-bold text-lg">
                                ${market.arv?.toLocaleString() || 0}
                            </span>
                        </div>
                        {market.arvRange && (
                             <div className="flex justify-between items-center text-xs text-slate-400 dark:text-slate-500">
                                <span>Range:</span>
                                <span>${market.arvRange.low?.toLocaleString()} - ${market.arvRange.high?.toLocaleString()}</span>
                             </div>
                        )}
                    </div>

                    {/* Rent Section */}
                    <div className="bg-slate-50 dark:bg-slate-900/50 p-3 rounded-lg border border-slate-100 dark:border-slate-700/50">
                        <div className="flex justify-between items-center mb-1">
                            <span className="text-slate-500 dark:text-slate-400 text-xs uppercase font-bold">Rent Est.</span>
                            <span className="text-blue-600 dark:text-blue-400 font-mono font-bold text-lg">
                                ${market.rentEstimate?.toLocaleString() || 0}/mo
                            </span>
                        </div>
                        {market.rentRange && (
                             <div className="flex justify-between items-center text-xs text-slate-400 dark:text-slate-500">
                                <span>Range:</span>
                                <span>${market.rentRange.low?.toLocaleString()} - ${market.rentRange.high?.toLocaleString()}/mo</span>
                             </div>
                        )}
                    </div>
                    
                    {/* Comps Section */}
                    <div className="space-y-3">
                        {market.comps && market.comps.length > 0 && (
                            <div>
                                <h5 className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase mb-2">Recent Sales</h5>
                                <div className="space-y-1.5">
                                    {market.comps.map((comp, i) => (
                                        <div key={i} className="flex justify-between items-center text-xs bg-slate-50 dark:bg-slate-800/30 p-1.5 rounded border border-slate-100 dark:border-slate-700/30">
                                            <div className="flex flex-col truncate max-w-[65%]">
                                                <span className="text-slate-700 dark:text-slate-300 truncate" title={comp.address}>{comp.address}</span>
                                                <span className="text-[10px] text-slate-400 dark:text-slate-500">{comp.distance} • {comp.date ? comp.date.split('T')[0] : 'N/A'}</span>
                                            </div>
                                            <span className="font-mono text-emerald-600 dark:text-emerald-400/90">${comp.price.toLocaleString()}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {market.rentComps && market.rentComps.length > 0 && (
                            <div>
                                <h5 className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase mb-2 border-t border-slate-100 dark:border-slate-700/50 pt-2">Rental Comps</h5>
                                <div className="space-y-1.5">
                                    {market.rentComps.map((comp, i) => (
                                        <div key={i} className="flex justify-between items-center text-xs bg-slate-50 dark:bg-slate-800/30 p-1.5 rounded border border-slate-100 dark:border-slate-700/30">
                                            <div className="flex flex-col truncate max-w-[65%]">
                                                <span className="text-slate-700 dark:text-slate-300 truncate" title={comp.address}>{comp.address}</span>
                                                <span className="text-[10px] text-slate-400 dark:text-slate-500">{comp.distance} • {comp.daysOld ? `${comp.daysOld} days ago` : 'N/A'}</span>
                                            </div>
                                            <span className="font-mono text-blue-600 dark:text-blue-400/90">${comp.rent.toLocaleString()}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
             ) : (
                <div className="flex-1 flex flex-col items-center justify-center text-slate-400 dark:text-slate-500 text-xs text-center p-4">
                    <Activity size={24} className="mb-2 opacity-20" />
                    <p>No market data fetched yet.</p>
                    <p>Click &quot;Fetch Market Data&quot; above.</p>
                </div>
             )}
        </div>
      </div>

      {/* Gemini AI Analysis */}
      {deal.aiAnalysis?.gemini && (
        <div className="mt-6 bg-gradient-to-br from-white to-slate-50 dark:from-slate-800 dark:to-slate-900 p-5 rounded-xl border border-indigo-200 dark:border-indigo-500/30 shadow-lg shadow-indigo-500/5 dark:shadow-indigo-500/10">
            <div className="flex items-center gap-2 mb-4">
                <div className="p-1.5 bg-indigo-50 dark:bg-indigo-500/20 rounded-lg">
                    <Activity size={18} className="text-indigo-600 dark:text-indigo-400" />
                </div>
                <h4 className="text-indigo-900 dark:text-indigo-200 font-bold uppercase tracking-wider text-sm">AI Underwriter&apos;s Report</h4>
            </div>
            
            <div className="space-y-4">
                <div className="bg-white dark:bg-slate-950/50 p-3 rounded-lg border border-slate-100 dark:border-slate-800">
                    <p className="text-slate-700 dark:text-slate-300 italic text-sm">&quot;{deal.aiAnalysis.gemini.summary}&quot;</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <h5 className="text-rose-600 dark:text-rose-400 text-xs font-bold uppercase mb-2 flex items-center gap-1">
                             Risks
                        </h5>
                        <ul className="text-sm space-y-1">
                            {deal.aiAnalysis.gemini.risks?.map((risk, i) => (
                                <li key={i} className="flex items-start gap-2 text-slate-600 dark:text-slate-400">
                                    <span className="text-rose-500/50 mt-1">•</span> {risk}
                                </li>
                            ))}
                        </ul>
                    </div>
                    <div>
                        <h5 className="text-emerald-600 dark:text-emerald-400 text-xs font-bold uppercase mb-2 flex items-center gap-1">
                             Strengths
                        </h5>
                        <ul className="text-sm space-y-1">
                            {deal.aiAnalysis.gemini.strengths?.map((strength, i) => (
                                <li key={i} className="flex items-start gap-2 text-slate-600 dark:text-slate-400">
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
