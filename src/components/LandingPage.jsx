import React from 'react';
import { Link } from 'react-router-dom';
import { LayoutGrid, CheckCircle, TrendingUp, ShieldCheck, ArrowRight, Users, Search, Brain } from 'lucide-react';

const LandingPage = () => {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 font-sans selection:bg-emerald-500/30">
      
      {/* Navigation */}
      <nav className="border-b border-slate-800 bg-slate-900/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="bg-emerald-500 p-2 rounded-lg shadow-lg shadow-emerald-500/20">
              <LayoutGrid size={24} className="text-white" />
            </div>
            <span className="font-bold text-2xl tracking-tight text-white">REI <span className="text-emerald-400">Deal Drop</span></span>
          </div>
          <div className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-400">
            <a href="#features" className="hover:text-white transition-colors">Features</a>
            <a href="#audiences" className="hover:text-white transition-colors">Who It's For</a>
            <a href="#pricing" className="hover:text-white transition-colors">Pricing</a>
          </div>
          <div className="flex items-center gap-4">
            <Link to="/login" className="text-sm font-bold text-white hover:text-emerald-400 transition-colors">Login</Link>
            <Link to="/register" className="bg-emerald-500 hover:bg-emerald-400 text-white px-5 py-2.5 rounded-full font-bold text-sm transition-all shadow-lg shadow-emerald-900/20 hover:shadow-emerald-900/40 transform hover:-translate-y-0.5">
              Get Started
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="relative overflow-hidden pt-20 pb-32">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[500px] bg-emerald-500/20 rounded-full blur-[120px] pointer-events-none"></div>
        <div className="max-w-7xl mx-auto px-6 relative z-10 text-center">
          <div className="inline-flex items-center gap-2 bg-slate-800/50 border border-slate-700 rounded-full px-4 py-1.5 mb-8 backdrop-blur-sm">
            <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span className="text-xs font-bold text-emerald-400 uppercase tracking-wide">AI-Powered Analysis v2.0 is Live</span>
          </div>
          <h1 className="text-5xl md:text-7xl font-extrabold text-white tracking-tight mb-6 leading-tight">
            Stop Guessing Values. <br/>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-400">Start Verifying Deals.</span>
          </h1>
          <p className="text-xl text-slate-400 max-w-2xl mx-auto mb-10 leading-relaxed">
            The first real estate marketplace that combines <strong>Real-Time Comps</strong>, <strong>Rental Data</strong>, and <strong>AI Condition Grades</strong> to tell you exactly what a property is worth.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Link to="/register" className="bg-emerald-500 hover:bg-emerald-400 text-white px-8 py-4 rounded-xl font-bold text-lg flex items-center justify-center gap-2 transition-all shadow-xl shadow-emerald-900/30 hover:shadow-emerald-900/50 transform hover:-translate-y-1">
              Verify a Deal Now <ArrowRight size={20} />
            </Link>
            <Link to="/demo" className="bg-slate-800 hover:bg-slate-700 text-white px-8 py-4 rounded-xl font-bold text-lg border border-slate-700 transition-all">
              Watch Demo
            </Link>
          </div>
        </div>
      </div>

      {/* Visual Hook / Dashboard Preview */}
      <div className="max-w-6xl mx-auto px-6 -mt-20 mb-32 relative z-20">
        <div className="bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden relative group">
          <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent to-transparent z-10 pointer-events-none"></div>
          <img 
            src="https://images.unsplash.com/photo-1613545325278-f24b0cae1224?ixlib=rb-4.0.3&auto=format&fit=crop&w=2000&q=80" 
            alt="Platform Interface" 
            className="w-full opacity-50 group-hover:opacity-60 transition-opacity duration-700"
          />
          <div className="absolute inset-0 flex items-center justify-center z-20">
             <div className="bg-slate-900/80 backdrop-blur-xl border border-slate-700 p-8 rounded-2xl max-w-lg w-full text-center transform group-hover:scale-105 transition-transform duration-500">
                <div className="flex justify-center mb-4">
                   <div className="bg-emerald-500/20 p-3 rounded-full text-emerald-400">
                      <TrendingUp size={32} />
                   </div>
                </div>
                <h3 className="text-2xl font-bold text-white mb-2">Verified ARV: $450,000</h3>
                <p className="text-slate-400 mb-6">"Based on 5 recent comps and AI Condition Grade B+. Confidence Score: 94%."</p>
                <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                   <div className="h-full bg-emerald-500 w-[94%]"></div>
                </div>
             </div>
          </div>
        </div>
      </div>

      {/* Features Grid */}
      <div id="features" className="py-24 bg-slate-900/50 border-y border-slate-900">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">Why Investors Trust Dealdrop</h2>
            <p className="text-slate-400 max-w-2xl mx-auto">Data-driven valuation. Automated diligence.</p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
             {/* Feature 1: Verification (Swapped) */}
            <div className="bg-slate-950 border border-slate-800 p-8 rounded-2xl hover:border-blue-500/50 transition-colors group">
              <div className="bg-blue-900/20 w-12 h-12 flex items-center justify-center rounded-xl text-blue-400 mb-6 group-hover:scale-110 transition-transform">
                <TrendingUp size={24} />
              </div>
              <h3 className="text-xl font-bold text-white mb-3">Smart Verification Scoring</h3>
              <p className="text-slate-400 leading-relaxed">We aggregate real-time comps, rental rates, and market trends to generate a confidence-weighted ARV for every single property.</p>
            </div>

            {/* Feature 2: Visual Audit (Swapped) */}
            <div className="bg-slate-950 border border-slate-800 p-8 rounded-2xl hover:border-emerald-500/50 transition-colors group">
              <div className="bg-emerald-900/20 w-12 h-12 flex items-center justify-center rounded-xl text-emerald-400 mb-6 group-hover:scale-110 transition-transform">
                <ShieldCheck size={24} />
              </div>
              <h3 className="text-xl font-bold text-white mb-3">Visual Condition Audit</h3>
              <p className="text-slate-400 leading-relaxed">Our Gemini AI scans listing photos to detect hidden damage and assign an unbiased Condition Score, ensuring the property matches the description.</p>
            </div>

            <div className="bg-slate-950 border border-slate-800 p-8 rounded-2xl hover:border-purple-500/50 transition-colors group">
              <div className="bg-purple-900/20 w-12 h-12 flex items-center justify-center rounded-xl text-purple-400 mb-6 group-hover:scale-110 transition-transform">
                <Search size={24} />
              </div>
              <h3 className="text-xl font-bold text-white mb-3">Map-Based Discovery</h3>
              <p className="text-slate-400 leading-relaxed">Visualise opportunities in your target zip codes. Filter by ROI score, price, or renovation tier to find your needle in the haystack.</p>
            </div>
          </div>
        </div>
      </div>

      {/* Audience Section */}
      <div id="audiences" className="py-24 max-w-7xl mx-auto px-6">
         <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
               <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">Built for the Modern Ecosystem</h2>
               <div className="space-y-6">
                  <div className="flex gap-4">
                     <div className="flex-shrink-0 mt-1">
                        <CheckCircle className="text-emerald-500" size={24} />
                     </div>
                     <div>
                        <h4 className="text-lg font-bold text-white">For Investors</h4>
                        <p className="text-slate-400 text-sm">Skip the due diligence headaches. Get straight to the offer with data-backed confidence.</p>
                     </div>
                  </div>
                  <div className="flex gap-4">
                     <div className="flex-shrink-0 mt-1">
                        <CheckCircle className="text-blue-500" size={24} />
                     </div>
                     <div>
                        <h4 className="text-lg font-bold text-white">For Agents</h4>
                        <p className="text-slate-400 text-sm">Become the expert your clients trust. Use our AI reports to win listings and justify prices.</p>
                     </div>
                  </div>
                  <div className="flex gap-4">
                     <div className="flex-shrink-0 mt-1">
                        <CheckCircle className="text-purple-500" size={24} />
                     </div>
                     <div>
                        <h4 className="text-lg font-bold text-white">For Wholesalers</h4>
                        <p className="text-slate-400 text-sm">Prove your deal is solid. High-scoring deals on our platform sell 4x faster.</p>
                     </div>
                  </div>
               </div>
            </div>
            <div className="bg-gradient-to-br from-emerald-900/20 to-slate-900 border border-slate-800 p-8 rounded-3xl relative overflow-hidden">
               <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none"></div>
               <div className="relative z-10">
                  <h3 className="text-2xl font-bold text-white mb-6">Join the Network</h3>
                  <div className="space-y-4">
                     <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 flex items-center gap-4">
                        <div className="bg-slate-800 w-10 h-10 rounded-full flex items-center justify-center text-white font-bold">JD</div>
                        <div>
                           <p className="text-white font-bold text-sm">John Doe (Investor)</p>
                           <p className="text-emerald-400 text-xs">Purchased a deal in Austin, TX</p>
                        </div>
                        <span className="ml-auto text-xs text-slate-500">2m ago</span>
                     </div>
                     <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 flex items-center gap-4">
                        <div className="bg-slate-800 w-10 h-10 rounded-full flex items-center justify-center text-white font-bold">SA</div>
                        <div>
                           <p className="text-white font-bold text-sm">Sarah Agent</p>
                           <p className="text-blue-400 text-xs">Added a listing in Miami, FL</p>
                        </div>
                        <span className="ml-auto text-xs text-slate-500">5m ago</span>
                     </div>
                  </div>
                  <Link to="/register" className="mt-8 w-full block bg-white text-slate-900 text-center font-bold py-3 rounded-xl hover:bg-slate-200 transition-colors">
                     Create Free Account
                  </Link>
               </div>
            </div>
         </div>
      </div>

      {/* Pricing Section */}
      <div id="pricing" className="py-24 bg-slate-900/50 border-t border-slate-900">
        <div className="max-w-7xl mx-auto px-6">
           <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">Simple, Transparent Pricing</h2>
              <p className="text-slate-400">Start for free, upgrade for power.</p>
           </div>

           <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
              {/* Scout Tier */}
              <div className="bg-slate-950 border border-slate-800 rounded-2xl p-8 flex flex-col hover:border-slate-700 transition-colors">
                 <h3 className="text-xl font-bold text-white mb-2">Scout</h3>
                 <p className="text-slate-500 text-sm mb-6">For casual browsing</p>
                 <div className="text-4xl font-bold text-white mb-6">$0<span className="text-lg text-slate-500 font-normal">/mo</span></div>
                 <ul className="space-y-4 mb-8 flex-1">
                    <li className="flex items-center gap-3 text-slate-300 text-sm">
                       <CheckCircle size={16} className="text-emerald-500 flex-shrink-0" />
                       Browse Map & Listings
                    </li>
                    <li className="flex items-center gap-3 text-slate-300 text-sm">
                       <CheckCircle size={16} className="text-emerald-500 flex-shrink-0" />
                       Post 1 Deal / Month
                    </li>
                    <li className="flex items-center gap-3 text-slate-300 text-sm">
                       <CheckCircle size={16} className="text-emerald-500 flex-shrink-0" />
                       Basic Property Data
                    </li>
                 </ul>
                 <Link to="/register" className="block w-full bg-slate-800 text-white text-center font-bold py-3 rounded-xl hover:bg-slate-700 transition-colors">
                    Get Started Free
                 </Link>
              </div>

              {/* Pro Investor Tier */}
              <div className="bg-gradient-to-b from-emerald-900/20 to-slate-950 border border-emerald-500/50 rounded-2xl p-8 flex flex-col relative transform md:-translate-y-4 shadow-2xl shadow-emerald-900/20">
                 <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-emerald-500 text-white px-4 py-1 rounded-full text-xs font-bold uppercase tracking-wide">
                    Most Popular
                 </div>
                 <h3 className="text-xl font-bold text-white mb-2">Pro Investor</h3>
                 <p className="text-emerald-400 text-sm mb-6">For serious buyers</p>
                 <div className="text-4xl font-bold text-white mb-6">$49<span className="text-lg text-slate-500 font-normal">/mo</span></div>
                 <ul className="space-y-4 mb-8 flex-1">
                    <li className="flex items-center gap-3 text-white text-sm font-medium">
                       <CheckCircle size={16} className="text-emerald-400 flex-shrink-0" />
                       Unlimited AI Verification Scores
                    </li>
                    <li className="flex items-center gap-3 text-white text-sm font-medium">
                       <CheckCircle size={16} className="text-emerald-400 flex-shrink-0" />
                       Full Rental & ARV Reports
                    </li>
                    <li className="flex items-center gap-3 text-white text-sm font-medium">
                       <CheckCircle size={16} className="text-emerald-400 flex-shrink-0" />
                       24hr Early Access to Deals
                    </li>
                    <li className="flex items-center gap-3 text-white text-sm font-medium">
                       <CheckCircle size={16} className="text-emerald-400 flex-shrink-0" />
                       Advanced Map Filters
                    </li>
                 </ul>
                 <Link to="/register" className="block w-full bg-emerald-500 text-white text-center font-bold py-3 rounded-xl hover:bg-emerald-400 transition-colors shadow-lg shadow-emerald-900/30">
                    Start Free Trial
                 </Link>
              </div>

              {/* Power Agent Tier */}
              <div className="bg-slate-950 border border-slate-800 rounded-2xl p-8 flex flex-col hover:border-blue-500/50 transition-colors">
                 <h3 className="text-xl font-bold text-white mb-2">Power Agent</h3>
                 <p className="text-blue-400 text-sm mb-6">For volume sellers</p>
                 <div className="text-4xl font-bold text-white mb-6">$99<span className="text-lg text-slate-500 font-normal">/mo</span></div>
                 <ul className="space-y-4 mb-8 flex-1">
                    <li className="flex items-center gap-3 text-slate-300 text-sm">
                       <CheckCircle size={16} className="text-blue-500 flex-shrink-0" />
                       Unlimited Deal Posting
                    </li>
                    <li className="flex items-center gap-3 text-slate-300 text-sm">
                       <CheckCircle size={16} className="text-blue-500 flex-shrink-0" />
                       'AI Verified' Trust Badge
                    </li>
                    <li className="flex items-center gap-3 text-slate-300 text-sm">
                       <CheckCircle size={16} className="text-blue-500 flex-shrink-0" />
                       Buyer Lead Generation
                    </li>
                    <li className="flex items-center gap-3 text-slate-300 text-sm">
                       <CheckCircle size={16} className="text-blue-500 flex-shrink-0" />
                       Team Management (3 Users)
                    </li>
                 </ul>
                 <Link to="/register" className="block w-full bg-slate-800 text-white text-center font-bold py-3 rounded-xl hover:bg-slate-700 transition-colors">
                    Contact Sales
                 </Link>
              </div>
           </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-slate-950 border-t border-slate-900 py-12">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-2">
            <div className="bg-slate-900 p-1.5 rounded-lg">
              <LayoutGrid size={20} className="text-slate-500" />
            </div>
            <span className="font-bold text-lg text-slate-500">REI Deal Drop</span>
          </div>
          <div className="text-slate-600 text-sm">
            &copy; {new Date().getFullYear()} REI Deal Drop. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
