import React, { useState, useEffect } from 'react';
import { getMarketPulse } from '../services/apiService';
import { Newspaper, RefreshCw, ArrowUpRight, Info, MoreHorizontal } from 'lucide-react';
import { InteractiveChart } from '../components/InteractiveChart';

// GENERATE MOCK CHART DATA
const generateMockData = (points = 100) => {
    const data = [];
    let price = 150;
    const now = new Date();
    for (let i = points; i >= 0; i--) {
        const time = new Date(now.getTime() - i * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
        price = price + (Math.random() - 0.45) * 5; // Slight upward bias
        data.push({ time, value: parseFloat(price.toFixed(2)) });
    }
    return data;
};

interface OptionsViewProps {
  darkMode?: boolean;
}

const OptionsView: React.FC<OptionsViewProps> = ({ darkMode = false }) => {
  const [marketPulse, setMarketPulse] = useState<any>(null);
  const [pulseLoading, setPulseLoading] = useState(false);
  const [selectedTicker, setSelectedTicker] = useState<string | null>(null);
  const [chartData, setChartData] = useState(generateMockData(100));

  // Calculator State
  const [calcPrice, setCalcPrice] = useState<number>(2.50);
  const [calcContracts, setCalcContracts] = useState<number>(10);
  const [calcStopLossPct, setCalcStopLossPct] = useState<number>(10);

  const totalInvestment = calcPrice * calcContracts * 100;
  const stopPrice = Math.max(0, calcPrice * (1 - calcStopLossPct / 100));
  const maxLossAmount = totalInvestment * (calcStopLossPct / 100);

  useEffect(() => {
    fetchPulse();
    const pulseInterval = setInterval(fetchPulse, 60000); 
    return () => clearInterval(pulseInterval);
  }, []);

  // When a new ticker is selected, "load" new chart data
  useEffect(() => {
    if (selectedTicker) {
        setChartData(generateMockData(Math.floor(Math.random() * 50) + 50));
    }
  }, [selectedTicker]);

  const fetchPulse = async () => {
    setPulseLoading(true);
    try {
      const res = await getMarketPulse();
      setMarketPulse(res);
      if (!selectedTicker && res.unusual?.length > 0) {
          setSelectedTicker(res.unusual[0].ticker);
      }
    } catch (err) {
      console.error("Pulse error:", err);
    } finally {
      setPulseLoading(false);
    }
  };

  // MOCK CHART SPARKLINE
  const Sparkline = ({ color = "#00c805" }) => (
    <svg viewBox="0 0 100 30" className="w-full h-12">
        <path 
            d="M0 25 L10 20 L20 22 L30 15 L40 18 L50 10 L60 12 L70 5 L80 8 L90 2 L100 4" 
            fill="none" 
            stroke={color} 
            strokeWidth="2" 
            strokeLinecap="round"
        />
    </svg>
  );

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
      
      {/* LEFT COLUMN: MAIN CONTENT */}
      <div className="lg:col-span-8 space-y-12">
        
        {/* MAIN CHART AREA */}
        <section className="space-y-6">
            <div className="flex justify-between items-end">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight mb-1">{selectedTicker || 'Market Overview'}</h1>
                    <div className="flex items-center gap-2">
                        <span className="text-2xl font-bold">${chartData[chartData.length - 1]?.value.toFixed(2) || '0.00'}</span>
                        <span className="text-[#00c805] font-bold text-sm">+2.45 (1.34%)</span>
                        <div className="h-4 w-4 bg-[#00c805]/10 rounded-full flex items-center justify-center">
                            <ArrowUpRight size={12} className="text-[#00c805]" />
                        </div>
                    </div>
                </div>
                <div className="flex gap-2">
                    {['1D', '1W', '1M', '3M', '1Y', 'ALL'].map(t => (
                        <button key={t} className={`px-3 py-1 text-xs font-bold rounded-md transition-colors ${t === '1D' ? 'bg-[#00c805]/10 text-[#00c805]' : `hover:bg-gray-100 ${darkMode ? 'text-gray-400 hover:text-white hover:bg-gray-800' : 'text-gray-500'}`}`}>{t}</button>
                    ))}
                </div>
            </div>

            {/* REAL INTERACTIVE CHART */}
            <div className="h-[300px] w-full">
                <InteractiveChart data={chartData} color="#00c805" darkMode={darkMode} />
            </div>
        </section>

        {/* STATS GRID */}
        <section className={`border-t pt-10 grid grid-cols-2 sm:grid-cols-4 gap-8 ${darkMode ? 'border-gray-800' : 'border-gray-100'}`}>
            <div>
                <div className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Volume</div>
                <div className="text-sm font-bold">1.2M</div>
            </div>
            <div>
                <div className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Avg Vol</div>
                <div className="text-sm font-bold">850K</div>
            </div>
            <div>
                <div className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Market Cap</div>
                <div className="text-sm font-bold">2.4T</div>
            </div>
            <div>
                <div className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">P/E Ratio</div>
                <div className="text-sm font-bold">32.4</div>
            </div>
        </section>

        {/* TRADE RISK CALCULATOR */}
        <section className={`border-t pt-10 space-y-6 ${darkMode ? 'border-gray-800' : 'border-gray-100'}`}>
            <h3 className="text-xl font-bold flex items-center gap-2">
                Trade Risk Calculator
            </h3>
            <div className={`rounded-2xl p-6 border grid grid-cols-1 md:grid-cols-3 gap-6 ${darkMode ? 'bg-gray-900 border-gray-800' : 'bg-gray-50 border-gray-100'}`}>
                <div className="space-y-2">
                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Contract Price ($)</label>
                    <input 
                        type="number" 
                        value={calcPrice}
                        onChange={(e) => setCalcPrice(Number(e.target.value))}
                        className={`w-full border rounded-xl px-4 py-3 font-bold text-lg focus:outline-none focus:border-[#00c805] focus:ring-1 focus:ring-[#00c805] ${darkMode ? 'bg-[#000000] border-gray-700 text-white' : 'bg-white border-gray-200 text-[#1a1a1a]'}`}
                    />
                </div>
                <div className="space-y-2">
                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wider"># of Contracts</label>
                    <input 
                        type="number" 
                        value={calcContracts}
                        onChange={(e) => setCalcContracts(Number(e.target.value))}
                        className={`w-full border rounded-xl px-4 py-3 font-bold text-lg focus:outline-none focus:border-[#00c805] focus:ring-1 focus:ring-[#00c805] ${darkMode ? 'bg-[#000000] border-gray-700 text-white' : 'bg-white border-gray-200 text-[#1a1a1a]'}`}
                    />
                </div>
                <div className="space-y-2">
                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Max Risk %</label>
                    <div className="relative">
                        <input 
                            type="number" 
                            value={calcStopLossPct}
                            onChange={(e) => setCalcStopLossPct(Number(e.target.value))}
                            className={`w-full border rounded-xl pl-4 pr-8 py-3 font-bold text-lg focus:outline-none focus:border-[#FF5000] focus:ring-1 focus:ring-[#FF5000] ${darkMode ? 'bg-[#000000] border-gray-700 text-white' : 'bg-white border-gray-200 text-[#1a1a1a]'}`}
                        />
                        <span className="absolute right-4 top-1/2 -translate-y-1/2 font-bold text-gray-500">%</span>
                    </div>
                </div>

                <div className={`md:col-span-3 grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 border-t ${darkMode ? 'border-gray-800' : 'border-gray-200'}`}>
                    <div>
                        <div className="text-xs font-medium text-gray-500">Total Investment</div>
                        <div className="text-xl font-bold">${totalInvestment.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</div>
                    </div>
                    <div>
                        <div className="text-xs font-medium text-gray-500">Set Stop Price At</div>
                        <div className="text-xl font-bold text-[#FF5000]">${stopPrice.toFixed(2)}</div>
                    </div>
                    <div>
                        <div className="text-xs font-medium text-gray-500">Max Cash At Risk</div>
                        <div className="text-xl font-bold text-[#FF5000]">-${maxLossAmount.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</div>
                    </div>
                </div>

                {/* PROFIT TARGETS (TRIMMING STRATEGY) */}
                <div className={`md:col-span-3 pt-6 border-t ${darkMode ? 'border-gray-800' : 'border-gray-200'}`}>
                    <h4 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-4">Profit Targets (Trimming Strategy)</h4>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                        <div className={`p-4 rounded-xl border flex flex-col items-center justify-center text-center ${darkMode ? 'bg-gray-800/50 border-gray-700' : 'bg-white border-gray-100'}`}>
                            <div className="text-[10px] font-bold text-[#00c805] uppercase tracking-wider mb-1">Target 1</div>
                            <div className="text-lg font-bold">${(calcPrice * 1.10).toFixed(2)}</div>
                            <div className="text-[10px] font-medium text-gray-500 mt-1">+10% Gain</div>
                        </div>
                        <div className={`p-4 rounded-xl border flex flex-col items-center justify-center text-center ${darkMode ? 'bg-gray-800/50 border-gray-700' : 'bg-white border-gray-100'}`}>
                            <div className="text-[10px] font-bold text-[#00c805] uppercase tracking-wider mb-1">Target 2</div>
                            <div className="text-lg font-bold">${(calcPrice * 1.20).toFixed(2)}</div>
                            <div className="text-[10px] font-medium text-gray-500 mt-1">+20% Gain</div>
                        </div>
                        <div className={`p-4 rounded-xl border flex flex-col items-center justify-center text-center ${darkMode ? 'bg-gray-800/50 border-gray-700' : 'bg-white border-gray-100'}`}>
                            <div className="text-[10px] font-bold text-[#00c805] uppercase tracking-wider mb-1">Target 3</div>
                            <div className="text-lg font-bold">${(calcPrice * 1.50).toFixed(2)}</div>
                            <div className="text-[10px] font-medium text-gray-500 mt-1">+50% Gain</div>
                        </div>
                        <div className={`p-4 rounded-xl border flex flex-col items-center justify-center text-center relative overflow-hidden ${darkMode ? 'bg-[#00c805]/10 border-[#00c805]/30' : 'bg-[#00c805]/5 border-[#00c805]/20'}`}>
                            <div className="absolute top-0 left-0 w-full h-1 bg-[#00c805]"></div>
                            <div className="text-[10px] font-bold text-[#00c805] uppercase tracking-wider mb-1">Runners</div>
                            <div className="text-lg font-bold text-[#00c805]">${(calcPrice * 2.00).toFixed(2)}</div>
                            <div className="text-[10px] font-medium text-[#00c805] mt-1">+100% (Double)</div>
                        </div>
                    </div>
                    {calcContracts >= 3 && (
                        <div className={`mt-4 text-[11px] font-medium p-3 rounded-lg flex items-start gap-2 ${darkMode ? 'bg-gray-800 text-gray-400' : 'bg-gray-100 text-gray-600'}`}>
                            <Info size={14} className="min-w-[14px] mt-0.5" />
                            <span><strong>Trimming Suggestion:</strong> Since you have {calcContracts} contracts, sell {Math.max(1, Math.floor(calcContracts * 0.5))} at Target 1 ($ {(calcPrice * 1.10).toFixed(2)}), sell {Math.max(1, Math.floor(calcContracts * 0.3))} at Target 2 ($ {(calcPrice * 1.20).toFixed(2)}), and leave {calcContracts - Math.max(1, Math.floor(calcContracts * 0.5)) - Math.max(1, Math.floor(calcContracts * 0.3))} as "Runners" for the bigger moves.</span>
                        </div>
                    )}
                </div>
            </div>
        </section>

        {/* NEWS FEED */}
        <section className={`border-t pt-10 space-y-6 ${darkMode ? 'border-gray-800' : 'border-gray-100'}`}>
            <h3 className="text-xl font-bold flex items-center gap-2">
                News
                <Info size={14} className="text-gray-500" />
            </h3>
            <div className="space-y-6">
                {marketPulse?.news?.map((n: any, i: number) => (
                    <a key={i} href={n.link} target="_blank" className="flex gap-6 group">
                        <div className="flex-1 space-y-1">
                            <div className="text-[10px] font-bold text-[#00c805] uppercase">{selectedTicker || 'Market'} News</div>
                            <h4 className="text-sm font-bold leading-snug group-hover:underline decoration-[#00c805]">{n.title}</h4>
                            <div className="text-xs text-gray-500 font-medium">1h ago • Bloomberg</div>
                        </div>
                        <div className={`w-20 h-20 rounded-xl overflow-hidden flex items-center justify-center ${darkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
                            <Newspaper className={darkMode ? 'text-gray-700' : 'text-gray-200'} size={24} />
                        </div>
                    </a>
                ))}
            </div>
        </section>
      </div>

      {/* RIGHT COLUMN: WATCHLIST & FLOW */}
      <div className="lg:col-span-4 space-y-8">
        
        {/* WATCHLIST (ATGL) */}
        <div className={`border rounded-2xl shadow-sm overflow-hidden sticky top-24 ${darkMode ? 'bg-[#000000] border-gray-800' : 'bg-white border-gray-100'}`}>
            <div className={`px-6 py-5 border-b flex justify-between items-center ${darkMode ? 'border-gray-800' : 'border-gray-50'}`}>
                <span className="font-bold text-sm tracking-tight">ATGL Watchlist</span>
                <MoreHorizontal size={16} className="text-gray-500 cursor-pointer" />
            </div>
            <div className={`divide-y ${darkMode ? 'divide-gray-800' : 'divide-gray-50'}`}>
                {marketPulse?.atgl?.length > 0 ? marketPulse?.atgl?.map((item: any, i: number) => (
                    <div 
                        key={i} 
                        onClick={() => setSelectedTicker(item.ticker)}
                        className={`px-6 py-4 flex justify-between items-center cursor-pointer transition-colors ${selectedTicker === item.ticker ? 'bg-[#00c805]/10' : darkMode ? 'hover:bg-gray-900' : 'hover:bg-gray-50'}`}
                    >
                        <div>
                            <div className="font-bold text-sm tracking-tight">{item.ticker}</div>
                            <div className={`mt-1 inline-block px-2 py-0.5 text-[10px] font-bold uppercase tracking-widest rounded-full ${
                                item.status === 'In Green Zone' 
                                    ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' 
                                    : item.status === 'Approaching'
                                    ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'
                                    : 'bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400'
                            }`}>
                                {item.status || 'Trend List'}
                            </div>
                        </div>
                        <div className="w-16">
                            <Sparkline />
                        </div>
                        <div className="text-right">
                            <div className="text-sm font-bold">${item.price ? item.price.toFixed(2) : '---'}</div>
                            <div className={`text-[10px] font-bold ${item.changePercent >= 0 ? 'text-[#00c805]' : 'text-red-500'}`}>
                                {item.changePercent ? `${item.changePercent > 0 ? '+' : ''}${item.changePercent.toFixed(2)}%` : '---'}
                            </div>
                        </div>
                    </div>
                )) : (
                    <div className="p-8 text-center text-sm text-gray-500">
                        Scanning ATGL data...
                    </div>
                )}
            </div>
        </div>

        {/* UNUSUAL FLOW CARDS */}
        <div className="space-y-4">
            <div className="px-2 flex justify-between items-center">
                <span className="font-bold text-sm text-gray-500 uppercase tracking-widest">Whale Flow</span>
                <RefreshCw className={`w-3.5 h-3.5 text-gray-500 cursor-pointer ${pulseLoading ? 'animate-spin' : ''}`} onClick={fetchPulse} />
            </div>
            {marketPulse?.unusual?.slice(0, 5).map((item: any, i: number) => (
                <div key={i} className={`border p-5 rounded-2xl shadow-sm hover:shadow-md transition-shadow cursor-pointer ${darkMode ? 'bg-[#000000] border-gray-800' : 'bg-white border-gray-100'}`}>
                    <div className="flex justify-between items-start mb-3">
                        <div className="flex items-center gap-2">
                            <div className={`w-2 h-2 rounded-full ${item.type === 'CALL' ? 'bg-[#00c805]' : 'bg-[#FF5000]'}`}></div>
                            <span className="font-bold text-sm tracking-tight">{item.ticker} {item.strike}{item.type[0]}</span>
                        </div>
                        <span className={`text-[10px] font-bold px-2 py-1 rounded ${darkMode ? 'bg-gray-900 text-gray-400' : 'bg-gray-50 text-gray-500'}`}>{item.ratio}x Vol</span>
                    </div>
                    <div className="flex justify-between items-end">
                        <div className="text-xs text-gray-500 font-medium">Exp {item.exp}</div>
                        <div className="text-xs font-bold">{item.vol.toLocaleString()} Contracts</div>
                    </div>
                </div>
            ))}
        </div>

      </div>
    </div>
  );
};

export default OptionsView;
