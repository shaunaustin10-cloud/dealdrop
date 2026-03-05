import { Activity, BarChart3, ArrowUpRight, ThermometerSnowflake, Flame } from 'lucide-react';

const MARKET_STATS = [
  {
    label: "Inventory Level",
    value: "1.4 Months",
    trend: "Critical Low",
    icon: <ThermometerSnowflake className="text-blue-400" />,
    desc: "Sellers maintain high leverage."
  },
  {
    label: "Sale-to-List Ratio",
    value: "99.2%",
    trend: "+0.4%",
    icon: <BarChart3 className="text-emerald-400" />,
    desc: "Homes are selling at or above ask."
  },
  {
    label: "Avg. Days on Market",
    value: "18 Days",
    trend: "-2 Days",
    icon: <Activity className="text-primary" />,
    desc: "Market velocity is accelerating."
  },
  {
    label: "Hottest Area",
    value: "Olde Towne",
    trend: "Peak Demand",
    icon: <Flame className="text-orange-500" />,
    desc: "Highest search volume this month."
  }
];

export default function MarketPulse() {
  return (
    <section className="py-24 bg-midnight text-white overflow-hidden relative">
      <div className="absolute top-0 left-0 w-full h-full opacity-10 bg-[url('https://www.transparenttextures.com/patterns/grid-me.png')]"></div>
      
      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-6">
          <div>
            <div className="flex items-center gap-3 mb-4">
              <span className="relative flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-primary"></span>
              </span>
              <span className="font-luxury-caps text-[10px] tracking-[0.3em] text-primary uppercase">Live Market Pulse</span>
            </div>
            <h2 className="font-serif text-4xl md:text-5xl">Hampton Roads <span className="italic text-slate-400">By The Numbers.</span></h2>
          </div>
          <p className="text-slate-400 font-light max-w-sm text-sm leading-relaxed">
            Real-time local market analytics updated weekly to give our clients the competitive advantage in negotiations.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {MARKET_STATS.map((stat, i) => (
            <div key={i} className="bg-white/5 backdrop-blur-md border border-white/10 p-8 rounded-[2rem] hover:bg-white/10 transition-all group">
              <div className="flex justify-between items-start mb-6">
                <div className="p-3 bg-white/5 rounded-2xl group-hover:scale-110 transition-transform duration-500">
                  {stat.icon}
                </div>
                <span className="text-[10px] font-bold text-primary uppercase tracking-widest">{stat.trend}</span>
              </div>
              <p className="font-luxury-caps text-slate-500 text-[10px] tracking-widest mb-2 uppercase">{stat.label}</p>
              <h3 className="font-serif text-4xl mb-4">{stat.value}</h3>
              <p className="text-slate-400 text-xs font-light leading-relaxed">{stat.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
