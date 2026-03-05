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
                Elite Brokerage Services & Real Estate Investment Group. <br/>
                Setting the standard for luxury and investment real estate in Hampton Roads.
             </p>
          </div>

          {/* Quick Links */}
          <div className="space-y-6">
             <h4 className="font-luxury-caps text-white tracking-widest">Navigation</h4>
             <ul className="space-y-3 text-xs text-slate-400 uppercase tracking-wide">
                <li><Link to="/buy" className="hover:text-primary transition-colors">Buy a Home</Link></li>
                <li><Link to="/sell" className="hover:text-primary transition-colors">Sell Your Home</Link></li>
                <li><Link to="/#inventory" className="hover:text-primary transition-colors">Featured Listings</Link></li>
                <li><a href="http://localhost:5173" className="hover:text-primary transition-colors">Investor Portal</a></li>
             </ul>
          </div>

          {/* Minimal Legal Block */}
          <div className="space-y-4 md:col-span-1">
             <div className="text-[10px] text-slate-500 leading-relaxed uppercase tracking-widest space-y-4">
                <p>
                   <strong>De'Shaun Austin</strong><br/>
                   NextHome Mission to Serve<br/>
                   Norfolk, VA • Licensed in VA
                </p>
                <div className="flex items-center gap-3 pt-1">
                   <span className="border border-slate-600 rounded-full w-4 h-4 flex items-center justify-center font-serif text-[8px] text-slate-400">=</span>
                   <span className="text-slate-400 font-bold">R</span>
                   <span>EHO • REALTOR&reg;</span>
                </div>
                <p className="opacity-40 text-[8px]">
                   &copy; 2026 Mission to Serve Realty LLC. <br/>
                   Independently owned and operated.
                </p>
             </div>
          </div>
       </div>
    </footer>
  );
}