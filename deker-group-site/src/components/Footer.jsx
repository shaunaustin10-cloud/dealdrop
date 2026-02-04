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

          {/* Legal / DPOR Compliance */}
          <div className="space-y-4">
             <h4 className="font-luxury-caps text-white tracking-widest">Compliance</h4>
             <div className="text-[10px] text-slate-500 leading-relaxed uppercase tracking-widest space-y-4">
                <p>
                   <strong>De'Shaun Austin</strong><br/>
                   Licensed Real Estate Professional<br/>
                   <strong>NextHome Mission to Serve</strong><br/>
                   Norfolk, VA<br/>
                   Licensed in the Commonwealth of Virginia
                </p>
                <p>
                   &copy; 2026 Mission to Serve Realty LLC. Each office is independently owned and operated. NextHome and the NextHome Casita logo are registered trademarks of NextHome, Inc.
                </p>
                <div className="flex items-center gap-2 pt-2">
                   <span className="border border-slate-600 rounded-full w-4 h-4 flex items-center justify-center font-serif text-[8px] text-slate-400">=</span>
                   <span>Equal Housing Opportunity</span>
                </div>
             </div>
          </div>
       </div>
    </footer>
  );
}