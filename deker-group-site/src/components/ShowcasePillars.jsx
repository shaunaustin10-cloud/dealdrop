import React from 'react';
import { Sparkles, Hammer, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function ShowcasePillars() {
  return (
    <section className="py-24 bg-cream">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-16">
          <span className="font-luxury-caps text-luxury-gold mb-4 block">Curated Collections</span>
          <h2 className="font-serif text-5xl text-midnight italic">Defined by <span className="not-italic">Modernity.</span></h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          {/* New Construction Pillar */}
          <Link 
            to="/collection/new-construction"
            className="group relative overflow-hidden bg-midnight aspect-[16/9] rounded-2xl shadow-2xl block"
          >
            <img 
              src="/images/hero-modern.jpg" 
              className="absolute inset-0 w-full h-full object-cover opacity-60 group-hover:scale-105 transition-transform duration-700"
              alt="New Construction" 
            />
            <div className="absolute inset-0 bg-gradient-to-t from-midnight/90 via-midnight/20 to-transparent"></div>
            <div className="absolute bottom-10 left-10 right-10">
              <div className="flex items-center gap-3 text-primary mb-4">
                <Sparkles size={20} />
                <span className="font-luxury-caps text-[10px] tracking-widest uppercase font-bold">New Construction</span>
              </div>
              <h3 className="font-serif text-3xl text-white mb-4 italic">The <span className="not-italic">Future</span> of Living.</h3>
              <p className="text-slate-300 font-light text-sm mb-6 max-w-sm">
                Explore pre-construction opportunities, custom builds, and energy-efficient modern estates.
              </p>
              <span className="flex items-center gap-2 text-white font-luxury-caps text-[10px] tracking-widest uppercase group-hover:text-primary transition-colors">
                View Curated Builds <ArrowRight size={14} />
              </span>
            </div>
          </Link>

          {/* Renovated Pillar */}
          <Link 
            to="/collection/newly-renovated"
            className="group relative overflow-hidden bg-midnight aspect-[16/9] rounded-2xl shadow-2xl block"
          >
            <img 
              src="/images/hero-modern.jpg" 
              className="absolute inset-0 w-full h-full object-cover opacity-60 group-hover:scale-105 transition-transform duration-700"
              alt="Newly Renovated Design" 
            />
            <div className="absolute inset-0 bg-gradient-to-t from-midnight/90 via-midnight/20 to-transparent"></div>
            <div className="absolute bottom-10 left-10 right-10">
              <div className="flex items-center gap-3 text-luxury-gold mb-4">
                <Hammer size={20} />
                <span className="font-luxury-caps text-[10px] tracking-widest uppercase font-bold">Newly Renovated</span>
              </div>
              <h3 className="font-serif text-3xl text-white mb-4 italic">Reimagined <span className="not-italic">Elegance.</span></h3>
              <p className="text-slate-300 font-light text-sm mb-6 max-w-sm">
                Move-in ready designer homes combining established charm with contemporary high-end finishes.
              </p>
              <span className="flex items-center gap-2 text-white font-luxury-caps text-[10px] tracking-widest uppercase group-hover:text-luxury-gold transition-colors">
                View Curated Renovations <ArrowRight size={14} />
              </span>
            </div>
          </Link>
        </div>
      </div>
    </section>
  );
}
