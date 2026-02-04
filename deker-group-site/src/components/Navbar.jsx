import React, { useState, useEffect } from 'react';
import { TrendingUp } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Navbar() {
  // Permanent solid state for "Logo on White" compliance and best practice
  const scrolled = true; 

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white border-b border-sand-dark py-4 shadow-sm transition-all duration-500">
      <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
        <div className="flex items-center">
          <Link to="/">
            <img 
              src="/images/nexthome-official-horizontal.png"
              alt="NextHome Mission to Serve" 
              className="h-12"
            /> 
          </Link>
        </div>

        <div className="hidden md:flex items-center gap-8 font-luxury-caps text-[11px] tracking-[0.2em] font-bold text-midnight">
          <Link to="/buy" className="hover:text-primary transition-colors">Buy</Link>
          <Link to="/sell" className="hover:text-primary transition-colors">Sell</Link>
          <Link to="/#inventory" className="hover:text-primary transition-colors">Search</Link>
          <a href="#" className="hover:text-primary transition-colors">About</a>
          <a href="#" className="hover:text-primary transition-colors">Contact</a>
        </div>

        <a 
          href="http://localhost:5173" 
          className="flex items-center gap-2 px-6 py-3 rounded-none text-[10px] font-bold uppercase tracking-widest transition-all duration-300 border bg-midnight text-white border-midnight hover:bg-primary hover:border-primary"
        >
          <TrendingUp size={14} />
          Investor Portal
        </a>
      </div>
    </nav>
  );
}