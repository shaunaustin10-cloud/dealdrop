import React from 'react';
import { MapPin, School, Coffee, TrendingUp } from 'lucide-react';

export default function LocalLogicWidget({ location = "Hampton Roads" }) {
  // Simulation of Local Logic Data
  const scores = [
    { label: "Walkability", score: 85, icon: MapPin },
    { label: "Schools", score: 92, icon: School },
    { label: "Lifestyle", score: 88, icon: Coffee },
    { label: "Growth", score: 94, icon: TrendingUp },
  ];

  return (
    <div className="bg-white rounded-3xl p-8 shadow-xl border border-sand-dark">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h3 className="font-serif text-2xl text-midnight">Local Insights</h3>
          <p className="text-slate-500 text-sm">Data for {location}</p>
        </div>
        <div className="bg-primary/10 text-primary px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest">
          Powered by Local Logic
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        {scores.map((item) => (
          <div key={item.label} className="bg-sand p-4 rounded-2xl">
            <div className="flex justify-between items-start mb-2">
              <item.icon className="text-primary" size={20} />
              <span className="font-bold text-lg text-midnight">{item.score}</span>
            </div>
            <p className="text-xs font-luxury-caps text-slate-500">{item.label}</p>
            <div className="w-full bg-slate-200 h-1.5 rounded-full mt-3 overflow-hidden">
              <div 
                className="bg-primary h-full rounded-full" 
                style={{ width: `${item.score}%` }}
              ></div>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-8 pt-8 border-t border-slate-100">
        <h4 className="font-luxury-caps text-midnight mb-4">Neighborhood Vibe</h4>
        <div className="flex flex-wrap gap-2">
          {['Quiet', 'Family-Friendly', 'Historic', 'Green Spaces', 'Luxury'].map((tag) => (
            <span key={tag} className="bg-white border border-slate-200 px-3 py-1 rounded-full text-xs text-slate-600">
              {tag}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}