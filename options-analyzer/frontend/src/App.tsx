import React, { useState, useEffect } from 'react'
import OptionsView from './pages/OptionsView'
import SportsView from './pages/SportsView'
import { Activity, Trophy, Search, ChevronRight, Bell, Globe, Search as SearchIcon } from 'lucide-react'

function App() {
  const [activeTab, setActiveTab] = useState<'options' | 'sports'>('options')
  
  return (
    <div className="min-h-screen bg-base-light flex flex-col font-sans text-base-text selection:bg-brand-light">
      
      {/* PROFESSIONAL TOP NAV */}
      <nav className="h-14 bg-base-white border-b border-base-border sticky top-0 z-50 flex items-center px-6">
        <div className="flex items-center gap-3 flex-1">
          <div className="w-7 h-7 bg-brand rounded flex items-center justify-center text-white font-bold text-sm shadow-sm">α</div>
          <span className="font-bold text-sm tracking-tight text-base-text uppercase tracking-widest">Alpha.Lab</span>
          <div className="h-4 w-[1px] bg-base-border mx-2"></div>
          <div className="flex items-center gap-1">
            <div className="w-1.5 h-1.5 bg-success rounded-full animate-pulse"></div>
            <span className="text-[10px] font-semibold text-base-muted uppercase tracking-widest">Live Engine</span>
          </div>
        </div>

        <div className="flex bg-base-light p-0.5 rounded-md border border-base-border mx-auto">
          <button 
            onClick={() => setActiveTab('options')}
            className={`px-4 py-1.5 rounded text-[11px] font-bold uppercase transition-all tracking-wider ${activeTab === 'options' ? 'bg-base-white text-brand shadow-sm border border-base-border' : 'text-base-muted hover:text-base-text'}`}
          >
            Options Market
          </button>
          <button 
            onClick={() => setActiveTab('sports')}
            className={`px-4 py-1.5 rounded text-[11px] font-bold uppercase transition-all tracking-wider ${activeTab === 'sports' ? 'bg-base-white text-brand shadow-sm border border-base-border' : 'text-base-muted hover:text-base-text'}`}
          >
            Sports Betting
          </button>
        </div>

        <div className="flex items-center gap-4 flex-1 justify-end">
           <Bell size={16} className="text-base-muted cursor-pointer hover:text-base-text transition-colors" />
           <div className="w-7 h-7 rounded-full bg-brand-light flex items-center justify-center text-[10px] font-bold text-brand uppercase">JD</div>
        </div>
      </nav>

      {/* CONTENT REGION */}
      <main className="flex-1 max-w-[1400px] w-full mx-auto p-6 lg:p-10 flex flex-col gap-8">
        {activeTab === 'options' ? <OptionsView /> : <SportsView />}
      </main>

      {/* MINIMAL FOOTER */}
      <footer className="px-10 py-8 border-t border-base-border bg-base-white">
        <div className="max-w-[1400px] mx-auto flex flex-col md:flex-row justify-between items-center text-[10px] font-medium text-base-muted uppercase tracking-widest gap-4">
          <div>© 2026 Alpha Laboratory • Proprietary Aggregation Engine</div>
          <div className="flex gap-8">
            <a href="#" className="hover:text-brand transition-colors">Privacy</a>
            <a href="#" className="hover:text-brand transition-colors">Risk Disclosure</a>
            <a href="#" className="hover:text-brand transition-colors">Documentation</a>
          </div>
        </div>
      </footer>
    </div>
  )
}

export default App
