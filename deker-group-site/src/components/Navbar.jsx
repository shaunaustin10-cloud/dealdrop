import React, { useState } from 'react';
import { TrendingUp, Menu, X } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Navbar() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const navLinks = [
    { name: 'Buy', path: '/buy' },
    { name: 'Sell', path: '/sell' },
    { name: 'Mortgage Help', path: '/mortgage-assistance' },
    { name: 'Search', path: '/#inventory' },
    { name: 'About', path: '/about' },
    { name: 'Contact', path: '/contact' },
  ];

  return (
    <>
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white border-b border-sand-dark py-4 shadow-sm transition-all duration-500 font-luxury">
        <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
          <div className="flex items-center">
            <Link to="/">
              <img 
                src="/images/nexthome-official-horizontal.png"
                alt="NextHome Mission to Serve" 
                className="h-10 md:h-12"
              /> 
            </Link>
          </div>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-8 font-luxury-caps text-[11px] tracking-[0.2em] font-bold text-midnight">
            {navLinks.map((link) => (
              <Link 
                key={link.name} 
                to={link.path} 
                className="hover:text-primary transition-colors"
              >
                {link.name}
              </Link>
            ))}
          </div>

          <div className="flex items-center gap-4">
            <a 
              href="https://reidealdrop.com" 
              className="hidden sm:flex items-center gap-2 px-6 py-3 rounded-none text-[10px] font-bold uppercase tracking-widest transition-all duration-300 border bg-midnight text-white border-midnight hover:bg-primary hover:border-primary"
            >
              <TrendingUp size={14} />
              Investor Portal
            </a>

            {/* Mobile Menu Button */}
            <button 
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden p-2 text-midnight hover:text-primary transition-colors"
              aria-label="Toggle Menu"
            >
              {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile Menu Overlay */}
      <div 
        className={`fixed inset-0 z-40 bg-midnight transition-all duration-500 ease-in-out md:hidden ${
          isMobileMenuOpen ? 'opacity-100 visible' : 'opacity-0 invisible'
        }`}
      >
        <div className="flex flex-col h-full pt-32 px-10">
          <div className="flex flex-col gap-6">
            {navLinks.map((link) => (
              <Link 
                key={link.name} 
                to={link.path} 
                onClick={() => setIsMobileMenuOpen(false)}
                className="text-white font-luxury-caps text-2xl tracking-[0.2em] font-bold hover:text-primary transition-colors border-b border-white/10 pb-4"
              >
                {link.name}
              </Link>
            ))}
          </div>

          <div className="mt-12">
            <a 
              href="https://reidealdrop.com" 
              className="flex items-center justify-center gap-3 w-full py-6 bg-primary text-white text-xs font-black uppercase tracking-[0.3em]"
            >
              <TrendingUp size={18} />
              Investor Portal
            </a>
          </div>
        </div>
      </div>
    </>
  );
}
