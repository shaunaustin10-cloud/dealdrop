import React, { useState, useEffect } from 'react';
import { Trophy, Target, TrendingUp, Activity, BarChart2, Calendar, Clock, ChevronRight } from 'lucide-react';
import axios from 'axios';

const SportsView: React.FC = () => {
  const [matches, setMatches] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSports = async () => {
      try {
        const response = await axios.get('/api/sports/matches');
        setMatches(response.data);
      } catch (error) {
        console.error("Sports fetch failed", error);
      } finally {
        setLoading(false);
      }
    };
    fetchSports();
  }, []);

  const soccerMatches = matches.filter(m => m.sport === 'Soccer');
  const basketballMatches = matches.filter(m => m.sport === 'Basketball');

  return (
    <div className="space-y-10">
      
      {/* HEADER SECTION */}
      <div className="flex flex-col lg:flex-row justify-between items-end gap-6">
        <div className="space-y-2">
            <h2 className="text-4xl font-extrabold tracking-tight text-base-text">Sports Laboratory</h2>
            <p className="text-sm font-medium text-base-muted uppercase tracking-widest">AI-Driven Odds Matrix • Statistical Probability • Social Sentiment</p>
        </div>
        <div className="bg-brand text-white px-6 py-3 rounded-xl shadow-sm flex items-center gap-3">
            <Calendar size={18} />
            <span className="text-sm font-bold uppercase tracking-wider">{new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
        </div>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-32 gap-4">
            <div className="animate-spin w-10 h-10 border-4 border-brand border-t-transparent rounded-full"></div>
            <p className="text-xs font-bold text-base-muted uppercase tracking-[0.2em]">Compiling Match Data...</p>
        </div>
      ) : (
        <div className="grid grid-cols-12 gap-8">
            
            {/* SOCCER TARGETS */}
            <div className="col-span-12 lg:col-span-7 space-y-6">
                <div className="flex items-center gap-3 px-1">
                    <div className="p-2 bg-success/10 rounded-lg">
                        <Target className="text-success w-5 h-5" />
                    </div>
                    <h3 className="text-lg font-bold text-base-text uppercase tracking-tight">Top Soccer Probabilities (1H & BTTS)</h3>
                </div>

                <div className="grid grid-cols-1 gap-4">
                    {soccerMatches.map((match, idx) => (
                        <div key={idx} className="bg-base-white border border-base-border rounded-2xl p-6 shadow-sm hover:border-brand transition-colors group">
                            <div className="flex justify-between items-center mb-6">
                                <div className="flex items-center gap-3">
                                    <span className="text-[10px] font-bold text-base-muted uppercase tracking-widest bg-base-light px-2 py-1 rounded border border-base-border">{match.league}</span>
                                    <div className="flex items-center gap-1 text-[10px] font-bold text-brand">
                                        <Clock size={12} />
                                        {match.time}
                                    </div>
                                </div>
                                <ChevronRight size={16} className="text-base-border group-hover:text-brand transition-colors" />
                            </div>

                            <div className="flex items-center justify-between gap-4 mb-8">
                                <div className="flex-1 text-center">
                                    <div className="text-xl font-black text-base-text uppercase tracking-tighter">{match.home}</div>
                                    <div className="text-[10px] font-bold text-base-muted uppercase mt-1">Home</div>
                                </div>
                                <div className="text-xs font-black text-base-border italic">VS</div>
                                <div className="flex-1 text-center">
                                    <div className="text-xl font-black text-base-text uppercase tracking-tighter">{match.away}</div>
                                    <div className="text-[10px] font-bold text-base-muted uppercase mt-1">Away</div>
                                </div>
                            </div>

                            <div className="grid grid-cols-3 gap-4">
                                <div className="bg-base-light rounded-xl p-4 border border-base-border text-center">
                                    <div className="text-[9px] font-bold text-base-muted uppercase tracking-widest mb-1">1H Goal Prob</div>
                                    <div className="text-2xl font-black text-success tabular-nums">{match.firstHalfGoalProb}%</div>
                                </div>
                                <div className="bg-base-light rounded-xl p-4 border border-base-border text-center">
                                    <div className="text-[9px] font-bold text-base-muted uppercase tracking-widest mb-1">BTTS Prob</div>
                                    <div className="text-2xl font-black text-brand tabular-nums">{match.bttsProb}%</div>
                                </div>
                                <div className="bg-base-light rounded-xl p-4 border border-base-border text-center flex flex-col justify-center">
                                    <div className="text-[9px] font-bold text-base-muted uppercase tracking-widest mb-1">Social Lean</div>
                                    <div className="text-xs font-extrabold text-base-text uppercase">{match.socialLean}</div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* NBA SECTION */}
            <div className="col-span-12 lg:col-span-5 space-y-6">
                <div className="flex items-center gap-3 px-1">
                    <div className="p-2 bg-brand/10 rounded-lg">
                        <TrendingUp className="text-brand w-5 h-5" />
                    </div>
                    <h3 className="text-lg font-bold text-base-text uppercase tracking-tight">NBA Alpha Straight Bets</h3>
                </div>

                <div className="space-y-4">
                    {basketballMatches.map((match, idx) => (
                        <div key={idx} className="bg-base-white border border-base-border rounded-2xl p-6 shadow-sm hover:border-brand transition-colors group">
                            <div className="flex justify-between items-start mb-4">
                                <div>
                                    <div className="text-lg font-black text-base-text uppercase tracking-tight">{match.home} vs {match.away}</div>
                                    <div className="text-[10px] font-bold text-base-muted uppercase tracking-widest mt-1">{match.time} • NBA Regular Season</div>
                                </div>
                                <div className="bg-brand-light text-brand text-[10px] font-bold px-2 py-1 rounded border border-brand/10">Value Entry</div>
                            </div>

                            <div className="space-y-3 mt-6">
                                <div className="flex justify-between items-center py-2 border-b border-base-border border-dashed">
                                    <span className="text-xs font-bold text-base-muted uppercase">Line Recommendation</span>
                                    <span className="text-sm font-black text-brand uppercase">{match.moneylineLean}</span>
                                </div>
                                <div className="flex justify-between items-center py-2 border-b border-base-border border-dashed">
                                    <span className="text-xs font-bold text-base-muted uppercase">Win Expectancy</span>
                                    <span className="text-sm font-black text-base-text">{match.winProb}%</span>
                                </div>
                                <div className="flex justify-between items-center py-2">
                                    <span className="text-xs font-bold text-base-muted uppercase">Statistical Driver</span>
                                    <span className="text-xs font-bold text-base-text">{match.keyStat}</span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                <div className="bg-brand/5 border border-brand/10 p-6 rounded-2xl">
                    <div className="flex items-center gap-2 mb-2">
                        <Activity size={14} className="text-brand" />
                        <span className="text-[10px] font-bold text-brand uppercase tracking-[0.2em]">Model Insights</span>
                    </div>
                    <p className="text-[11px] font-medium text-base-muted leading-relaxed uppercase">Our model cross-references betting volume, social sentiment from top analysts, and recent player PER metrics to identify mispriced lines.</p>
                </div>
            </div>

        </div>
      )}
    </div>
  );
};

export default SportsView;
