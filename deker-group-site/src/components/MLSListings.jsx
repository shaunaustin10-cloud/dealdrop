import React from 'react';
import { ArrowUpRight } from 'lucide-react';

export default function MLSListings() {
  return (
    <div className="text-center py-24 bg-sand/50 rounded-[3rem] border border-dashed border-sand-dark max-w-4xl mx-auto">
      <div className="max-w-2xl mx-auto px-6">
        <h3 className="font-serif text-3xl text-midnight mb-4 italic">Exclusive <span className="not-italic">Selection Coming Soon</span></h3>
        <p className="text-slate-500 font-light mb-8 leading-relaxed">
          I am currently vetting a new selection of high-performance listings. 
          Please check back shortly or use the interactive map to browse all active inventory in the region.
        </p>
        <a 
          href="https://deshaunaustin.missiontoserve.group/index.php?advanced=1&rtype=map" 
          target="_blank" 
          className="inline-flex bg-midnight text-white px-10 py-4 rounded-xl font-luxury-caps text-[10px] tracking-widest hover:bg-primary transition-all items-center justify-center gap-2"
        >
          Browse All Inventory <ArrowUpRight size={14} />
        </a>
      </div>
    </div>
  );
}
