import React from 'react';
import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="bg-midnight text-white px-6 py-20 border-t border-white/10">
       <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-12">
          {/* Brand Column */}
          <div className="md:col-span-2 space-y-6">
             <div className="flex flex-col leading-none">
                <span className="font-serif text-3xl">NextHome Mission to <span className="text-primary italic">Serve</span></span>
                <span className="font-luxury-caps text-slate-light mt-1 text-[8px] tracking-widest">at NextHome</span>
             </div>
             <p className="text-slate-400 text-xs leading-relaxed max-w-sm uppercase tracking-wider">
                A purpose-driven approach to real estate. <br/>
                Serving our community through expert representation, new construction expertise, and mortgage solutions.
             </p>
          </div>

          {/* Quick Links */}
          <div className="space-y-6">
             <h4 className="font-luxury-caps text-white tracking-widest">Navigation</h4>
             <ul className="space-y-3 text-xs text-slate-400 uppercase tracking-wide">
                <li><Link to="/buy" className="hover:text-primary transition-colors">Buy a Home</Link></li>
                <li><Link to="/sell" className="hover:text-primary transition-colors">Sell Your Home</Link></li>
                <li><Link to="/collection/new-construction" className="hover:text-primary transition-colors">New Construction</Link></li>
                <li><a href="https://reidealdrop.com" className="hover:text-primary transition-colors">Investor Portal</a></li>
             </ul>
          </div>

          {/* Minimal Legal Block */}
          <div className="space-y-4 md:col-span-1">
             <div className="text-[10px] text-slate-500 leading-relaxed uppercase tracking-[0.2em] space-y-4 font-luxury-caps">
                <p>
                   <strong className="text-white">De'Shaun Austin</strong><br/>
                   NextHome Mission to Serve<br/>
                   Norfolk, VA • Licensed in VA
                </p>
                <div className="flex items-center gap-3 pt-1">
                   <span className="border border-slate-600 rounded-full w-4 h-4 flex items-center justify-center font-serif text-[8px] text-slate-400">E</span>
                   <span className="text-slate-400 font-bold">R</span>
                   <span className="opacity-60 text-[8px]">REALTOR&reg; • Equal Housing Opportunity</span>
                </div>
                <p className="opacity-40 text-[7px] leading-normal tracking-widest">
                   &copy; 2026 Mission to Serve Realty LLC. <br/>
                   Each office is independently owned and operated.
                </p>
             </div>
          </div>
       </div>
    </footer>
  );
}