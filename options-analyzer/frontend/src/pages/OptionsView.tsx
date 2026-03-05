import React, { useState, useEffect } from 'react';
import { getMarketPulse, getScanStatus } from '../services/apiService';
import { TrendingUp, Zap, MessageSquare, Newspaper, ExternalLink, RefreshCw, BarChart2, Search, ArrowUpRight, ArrowDownRight } from 'lucide-react';

const OptionsView: React.FC = () => {
  const [marketPulse, setMarketPulse] = useState<any>(null);
  const [pulseLoading, setPulseLoading] = useState(false);
  const [scanStatus, setScanStatus] = useState<any>({ active: false, currentTask: '' });

  useEffect(() => {
    fetchPulse();
    const pulseInterval = setInterval(fetchPulse, 60000); 
    const statusInterval = setInterval(async () => {
        try {
            const status = await getScanStatus();
            setScanStatus(status);
        } catch (e) {}
    }, 3000);

    return () => {
        clearInterval(pulseInterval);
        clearInterval(statusInterval);
    };
  }, []);

  const fetchPulse = async () => {
    setPulseLoading(true);
    try {
      const res = await getMarketPulse();
      setMarketPulse(res);
    } catch (err) {
      console.error("Pulse error:", err);
    } finally {
      setPulseLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-10">
      
      {/* ALPHA SEARCH & OVERVIEW */}
      <div className="flex flex-col lg:flex-row gap-8 items-end">
        <div className="flex-1 space-y-4">
            <h2 className="text-4xl font-extrabold tracking-tight text-base-text">Market Aggregator</h2>
            <p className="text-sm font-medium text-base-muted uppercase tracking-widest">Global Options Flow • Institutional Momentum • Social Sentiment</p>
            <div className="relative max-w-xl group">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-base-muted group-focus-within:text-brand transition-colors w-5 h-5" />
                <input
                    type="text"
                    className="w-full bg-base-white border border-base-border rounded-xl pl-12 pr-4 py-4 focus:ring-4 focus:ring-brand/5 focus:border-brand outline-none text-base font-semibold transition-all text-base-text shadow-sm"
                    placeholder="Identify Specific Alpha (e.g. NVDA, TSLA)..."
                />
            </div>
        </div>
        <div className="flex gap-4">
            <div className="bg-base-white border border-base-border px-6 py-4 rounded-xl shadow-sm">
                <div className="text-[10px] font-bold text-base-muted uppercase tracking-widest mb-1">Active Scan</div>
                <div className="text-lg font-black text-base-text tabular-nums">{marketPulse?.atgl?.length || 0} Assets</div>
            </div>
            <div className="bg-base-white border border-base-border px-6 py-4 rounded-xl shadow-sm">
                <div className="text-[10px] font-bold text-base-muted uppercase tracking-widest mb-1">Unusual Vol</div>
                <div className="text-lg font-black text-brand tabular-nums">{marketPulse?.unusual?.length || 0} Entries</div>
            </div>
        </div>
      </div>

      <div className="grid grid-cols-12 gap-8">
        
        {/* MAIN ANALYSIS BLOCK */}
        <div className="col-span-12 lg:col-span-8 space-y-8">
            
            {/* UNUSUAL FLOW TABLE */}
            <div className="bg-base-white border border-base-border rounded-2xl shadow-sm overflow-hidden">
                <div className="px-6 py-4 border-b border-base-border flex justify-between items-center bg-base-light/50">
                    <div className="flex items-center gap-2">
                        <Zap className="w-4 h-4 text-warning" />
                        <span className="text-[11px] font-bold text-base-text uppercase tracking-wider">Unusual Options Activity</span>
                    </div>
                    <RefreshCw className={`w-3.5 h-3.5 text-base-muted cursor-pointer ${pulseLoading ? 'animate-spin' : ''}`} onClick={fetchPulse} />
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="text-[10px] font-bold text-base-muted uppercase tracking-[0.2em] border-b border-base-border bg-base-light/30">
                                <th className="px-6 py-3 font-semibold">Contract</th>
                                <th className="px-6 py-3 font-semibold">Strike</th>
                                <th className="px-6 py-3 font-semibold">Ratio</th>
                                <th className="px-6 py-3 font-semibold">Volume</th>
                                <th className="px-6 py-3 font-semibold text-right">Momentum</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-base-border">
                            {marketPulse?.unusual?.map((item: any, i: number) => (
                                <tr key={i} className="hover:bg-base-light/50 transition-colors group cursor-pointer">
                                    <td className="px-6 py-5">
                                        <div className="flex flex-col">
                                            <span className="text-base font-bold text-base-text uppercase tracking-tight group-hover:text-brand transition-colors">{item.ticker}</span>
                                            <span className={`text-[9px] font-bold uppercase tracking-widest ${item.type === 'CALL' ? 'text-success' : 'text-danger'}`}>{item.type}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-5 font-bold text-base-text tabular-nums text-base">${item.strike}</td>
                                    <td className="px-6 py-5">
                                        <div className="px-2 py-1 bg-brand-light text-brand text-[10px] font-bold rounded-md border border-brand/10 w-fit">{item.ratio}x</div>
                                    </td>
                                    <td className="px-6 py-5 font-semibold text-base-muted tabular-nums text-sm">{item.vol.toLocaleString()}</td>
                                    <td className="px-6 py-5 text-right">
                                        <ArrowUpRight className="w-4 h-4 text-success ml-auto" />
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* MOMENTUM TICKER GRID (ATGL) */}
            <div className="space-y-4">
                <div className="flex items-center gap-2 px-1">
                    <TrendingUp className="w-4 h-4 text-success" />
                    <span className="text-[11px] font-bold text-base-text uppercase tracking-wider">High Relative Strength (ATGL)</span>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
                    {marketPulse?.atgl?.map((ticker: string, idx: number) => (
                        <div key={idx} className="bg-base-white border border-base-border p-4 rounded-xl shadow-sm hover:border-brand transition-colors group cursor-pointer">
                            <div className="flex justify-between items-center">
                                <span className="text-base font-bold text-base-text uppercase tracking-tight group-hover:text-brand">{ticker}</span>
                                <div className="w-1.5 h-1.5 bg-success rounded-full"></div>
                            </div>
                            <div className="mt-2 text-[9px] font-bold text-base-muted uppercase tracking-widest">Prime Trend</div>
                        </div>
                    ))}
                </div>
            </div>
        </div>

        {/* SIDEBAR INTELLIGENCE */}
        <div className="col-span-12 lg:col-span-4 space-y-8">
            
            {/* SOCIAL PULSE */}
            <div className="bg-base-white border border-base-border rounded-2xl shadow-sm overflow-hidden">
                <div className="px-6 py-4 border-b border-base-border bg-base-light/50 flex items-center gap-2">
                    <MessageSquare className="w-4 h-4 text-brand" />
                    <span className="text-[11px] font-bold text-base-text uppercase tracking-wider">Social Intelligence</span>
                </div>
                <div className="p-2 space-y-1">
                    {marketPulse?.social?.map((item: any, idx: number) => (
                        <div key={idx} className="p-4 hover:bg-base-light rounded-xl transition-colors flex justify-between items-center group cursor-pointer">
                            <div className="flex flex-col">
                                <span className="text-sm font-bold text-base-text group-hover:text-brand">{item.ticker}</span>
                                <span className="text-[10px] font-medium text-base-muted">{item.mentionCount} Mentions • {item.source}</span>
                            </div>
                            <span className={`text-[10px] font-bold px-2 py-1 rounded-md ${item.sentiment === 'Bullish' ? 'bg-success/10 text-success' : 'bg-base-light text-base-muted'}`}>{item.sentiment}</span>
                        </div>
                    ))}
                </div>
            </div>

            {/* NEWS FEED */}
            <div className="bg-base-white border border-base-border rounded-2xl shadow-sm overflow-hidden">
                <div className="px-6 py-4 border-b border-base-border bg-base-light/50 flex items-center gap-2">
                    <Newspaper className="w-4 h-4 text-base-text" />
                    <span className="text-[11px] font-bold text-base-text uppercase tracking-wider">Financial News</span>
                </div>
                <div className="p-2 space-y-1">
                    {marketPulse?.news?.map((news: any, idx: number) => (
                        <a key={idx} href={news.link} target="_blank" rel="noopener noreferrer" className="block p-4 hover:bg-base-light rounded-xl transition-colors group">
                            <h4 className="text-xs font-bold text-base-text leading-tight group-hover:text-brand line-clamp-2 uppercase tracking-tight">{news.title}</h4>
                            <div className="flex justify-between items-center mt-3">
                                <span className="text-[9px] font-bold text-base-muted uppercase tracking-widest">{new Date(news.pubDate).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                                <ExternalLink size={10} className="text-base-border group-hover:text-brand" />
                            </div>
                        </a>
                    ))}
                </div>
            </div>

        </div>
      </div>
    </div>
  );
};

export default OptionsView;
