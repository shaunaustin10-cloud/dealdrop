import React from 'react';
import { Link } from 'react-router-dom';
import { LayoutGrid, CheckCircle, TrendingUp, ArrowRight, Calculator, FileText, Activity, Target } from 'lucide-react';
import { generateDealReport } from '../utils/generatePdf';

const LandingPage = () => {
  const handleDownloadSample = async () => {
    const mockDeal = {
      address: "4522 North Central Ave, Indianapolis, IN 46205",
      imageUrls: ["https://images.unsplash.com/photo-1568605114967-8130f3a36994?auto=format&fit=crop&q=80&w=1200"],
      price: 145000,
      arv: 245000,
      rehab: 45000,
      rent: 1650,
      sqft: 1650,
      bedrooms: 3,
      bathrooms: 2,
      status: "Available",
      aiAnalysis: {
        gemini: {
          score: 88,
          verdict: "STRONG BUY",
          summary: "Solid BRRRR or Flip candidate. The property is priced 15% below neighborhood median with manageable mechanical updates needed. Significant equity spread even with conservative ARV estimates.",
          risks: ["Foundation settling noted in basement", "Older electrical panel"],
          strengths: ["10% below market value", "High rental demand for 3/2 layout"],
          calculated_mao: 155000,
          projected_profit: 55000
        },
        market: {
          confidenceScore: 91,
          arvRange: { low: 235000, high: 255000 },
          rentRange: { low: 1550, high: 1800 },
          comps: [
            { address: "4410 N Central Ave", price: 242000, distance: "0.1 mi", date: "2025-09-12" },
            { address: "4605 N Park Ave", price: 249500, distance: "0.4 mi", date: "2025-11-20" }
          ],
          rentComps: [
            { address: "4501 N Broadway", rent: 1600, distance: "0.2 mi", date: "2025-08-15" }
          ]
        }
      }
    };

    const mockProfile = {
      displayName: "Demo Agent",
      company: "Elite Realty Partners",
      phone: "(555) 000-1234",
      email: "demo@example.com",
      website: "https://example.com"
    };

    await generateDealReport(mockDeal, mockProfile);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 font-sans selection:bg-emerald-500/30">
      
      {/* Navigation */}
      <nav className="border-b border-slate-800 bg-slate-900/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="bg-emerald-500 p-2 rounded-lg shadow-lg shadow-emerald-500/20">
              <LayoutGrid size={24} className="text-white" />
            </div>
            <span className="font-bold text-2xl tracking-tight text-white">REI <span className="text-emerald-400">Deal Drop</span> <span className="text-xs text-slate-500 ml-2">v2.0</span></span>
          </div>
          <div className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-400">
            <a href="#features" className="hover:text-white transition-colors">Features</a>
            <a href="#audiences" className="hover:text-white transition-colors">Who It&apos;s For</a>
            <a href="#pricing" className="hover:text-white transition-colors">Pricing</a>
          </div>
          <div className="flex items-center gap-4">
            <Link to="/login" className="text-sm font-bold text-white hover:text-emerald-400 transition-colors">Login</Link>
            <Link to="/register" className="bg-emerald-500 hover:bg-emerald-400 text-white px-4 py-2 text-xs md:text-sm md:px-5 md:py-2.5 rounded-full font-bold transition-all shadow-lg shadow-emerald-900/20 hover:shadow-emerald-900/40 transform hover:-translate-y-0.5">
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
            <span className="text-xs font-bold text-emerald-400 uppercase tracking-wide">AI-Powered Valuation Engine</span>
          </div>
          <h1 className="text-5xl md:text-7xl font-extrabold text-white tracking-tight mb-6 leading-tight">
            Master the Market. <br/>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-400">Close More Deals.</span>
          </h1>
          <p className="text-xl text-slate-400 max-w-2xl mx-auto mb-10 leading-relaxed">
            The all-in-one valuation tool. <strong>Agents:</strong> Win listings with data-backed presentations. <strong>Investors:</strong> Verify profit margins instantly.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Link to="/register" className="bg-emerald-500 hover:bg-emerald-400 text-white px-8 py-4 rounded-xl font-bold text-lg flex items-center justify-center gap-2 transition-all shadow-xl shadow-emerald-900/30 hover:shadow-emerald-900/50 transform hover:-translate-y-1">
              Start Analyzing Free <ArrowRight size={20} />
            </Link>
            <button 
              onClick={handleDownloadSample}
              className="bg-slate-800 hover:bg-slate-700 text-white px-8 py-4 rounded-xl font-bold text-lg border border-slate-700 transition-all flex items-center justify-center gap-2"
            >
              <FileText size={20} className="text-emerald-400" />
              See Sample Report
            </button>
          </div>
        </div>
      </div>

      {/* Visual Hook / Dashboard Preview */}
      <div className="max-w-6xl mx-auto px-6 -mt-20 mb-32 relative z-20">
        <div className="bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden relative group min-h-[450px] md:min-h-[600px] flex items-center justify-center">
          <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent to-transparent z-10 pointer-events-none"></div>
          <img 
            src="https://images.unsplash.com/photo-1613545325278-f24b0cae1224?ixlib=rb-4.0.3&auto=format&fit=crop&w=2000&q=80" 
            alt="Platform Interface" 
            className="absolute inset-0 w-full h-full object-cover opacity-40 md:opacity-50 group-hover:opacity-60 transition-opacity duration-700"
          />
          <div className="relative z-20 px-4 w-full flex justify-center">
             <div className="bg-slate-900/80 backdrop-blur-xl border border-slate-700 p-6 md:p-8 rounded-2xl max-w-lg w-full text-center transform group-hover:scale-105 transition-transform duration-500 shadow-2xl">
                <div className="flex justify-center mb-4">
                   <div className="bg-emerald-500/20 p-3 rounded-full text-emerald-400">
                      <TrendingUp size={32} />
                   </div>
                </div>
                <h3 className="text-2xl font-bold text-white mb-2">Market Confidence: 94%</h3>
                <p className="text-slate-400 mb-6">&quot;Based on 5 active comps and 3 recent solds. Recommended List Price: $450k - $465k.&quot;</p>
                <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                   <div className="h-full bg-emerald-500 w-[94%]"></div>
                </div>
             </div>
          </div>
        </div>
      </div>

      {/* Social Proof / Trusted By */}
      <div className="py-12 border-y border-slate-900 bg-slate-950/50">
        <div className="max-w-7xl mx-auto px-6 text-center">
            <p className="text-slate-500 text-xs font-bold uppercase tracking-widest mb-8">Trusted by Top Agents & Investors</p>
            <div className="flex flex-wrap justify-center gap-12 opacity-50 grayscale hover:grayscale-0 transition-all duration-500">
                <span className="text-xl font-bold text-white">Realty<span className="text-emerald-500">Flow</span></span>
                <span className="text-xl font-bold text-white">Keller<span className="text-blue-500">Capital</span></span>
                <span className="text-xl font-bold text-white">Century<span className="text-yellow-500">21</span></span>
                <span className="text-xl font-bold text-white">Invest<span className="text-purple-500">Pro</span></span>
            </div>
        </div>
      </div>

      {/* Features Grid */}
      <div id="features" className="py-24 bg-slate-900/50 border-b border-slate-900">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">The Competitive Edge You Need</h2>
            <p className="text-slate-400 max-w-2xl mx-auto">Whether you&apos;re selling to a client or buying for yourself, data wins.</p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-slate-950 border border-slate-800 p-8 rounded-2xl hover:border-blue-500/50 transition-colors group">
              <div className="bg-blue-900/20 w-12 h-12 flex items-center justify-center rounded-xl text-blue-400 mb-6 group-hover:scale-110 transition-transform">
                <TrendingUp size={24} />
              </div>
              <h3 className="text-xl font-bold text-white mb-3">Instant Valuation</h3>
              <p className="text-slate-400 leading-relaxed">Stop relying on Zestimates. Get a professional-grade valuation based on real-time comps, rental rates, and local market trends.</p>
            </div>

            <div className="bg-slate-950 border border-slate-800 p-8 rounded-2xl hover:border-emerald-500/50 transition-colors group">
              <div className="bg-emerald-900/20 w-12 h-12 flex items-center justify-center rounded-xl text-emerald-400 mb-6 group-hover:scale-110 transition-transform">
                <Target size={24} />
              </div>
              <h3 className="text-xl font-bold text-white mb-3">Client-Ready Reports</h3>
              <p className="text-slate-400 leading-relaxed">Generate beautiful, branded PDF reports in one click. Impress sellers at the listing appointment or send clean packets to investors.</p>
            </div>

            <div className="bg-slate-950 border border-slate-800 p-8 rounded-2xl hover:border-purple-500/50 transition-colors group">
              <div className="bg-purple-900/20 w-12 h-12 flex items-center justify-center rounded-xl text-purple-400 mb-6 group-hover:scale-110 transition-transform">
                <Calculator size={24} />
              </div>
              <h3 className="text-xl font-bold text-white mb-3">Smart Pricing Engine</h3>
              <p className="text-slate-400 leading-relaxed">Calculate the perfect offer price (MAO) for investors, or the ideal listing price for agents, based on desired profit margins.</p>
            </div>
          </div>
        </div>
      </div>

      {/* Audience Section */}
      <div id="audiences" className="py-24 max-w-7xl mx-auto px-6">
         <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
               <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">One Platform. Every Role.</h2>
               <div className="space-y-6">
                  <div className="flex gap-4">
                     <div className="flex-shrink-0 mt-1">
                        <CheckCircle className="text-emerald-500" size={24} />
                     </div>
                     <div>
                        <h4 className="text-lg font-bold text-white">For Real Estate Agents</h4>
                        <p className="text-slate-400 text-sm">Win the listing every time. Walk in with a data-heavy &quot;CMA on Steroids&quot; that proves your pricing strategy is correct.</p>
                     </div>
                  </div>
                  <div className="flex gap-4">
                     <div className="flex-shrink-0 mt-1">
                        <CheckCircle className="text-blue-500" size={24} />
                     </div>
                     <div>
                        <h4 className="text-lg font-bold text-white">For Wholesalers</h4>
                        <p className="text-slate-400 text-sm">Build instant credibility. Send deal packets that buyers actually trust, complete with photos, maps, and verified comps.</p>
                     </div>
                  </div>
                  <div className="flex gap-4">
                     <div className="flex-shrink-0 mt-1">
                        <CheckCircle className="text-purple-500" size={24} />
                     </div>
                     <div>
                        <h4 className="text-lg font-bold text-white">For Investors</h4>
                        <p className="text-slate-400 text-sm">Analyze in seconds, not hours. Filter out the noise and only spend time on deals that hit your Buy Box.</p>
                     </div>
                  </div>
               </div>
            </div>
            
            <div className="bg-gradient-to-br from-emerald-900/20 to-slate-900 border border-slate-800 p-8 rounded-3xl relative overflow-hidden">
               <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none"></div>
               <div className="relative z-10">
                  <h3 className="text-2xl font-bold text-white mb-6">Start Analyzing Today</h3>
                  <div className="space-y-4">
                     <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 flex items-center gap-4">
                        <div className="bg-emerald-500/20 p-2 rounded-full text-emerald-400">
                            <Activity size={20} />
                        </div>
                        <div>
                           <p className="text-white font-bold text-sm">Analysis Complete</p>
                           <p className="text-emerald-400 text-xs">123 Main St • Score: 92/100</p>
                        </div>
                        <span className="ml-auto text-xs text-slate-500">Just now</span>
                     </div>
                     <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 flex items-center gap-4">
                        <div className="bg-blue-500/20 p-2 rounded-full text-blue-400">
                            <FileText size={20} />
                        </div>
                        <div>
                           <p className="text-white font-bold text-sm">Report Generated</p>
                           <p className="text-blue-400 text-xs">PDF Download Ready</p>
                        </div>
                        <span className="ml-auto text-xs text-slate-500">2m ago</span>
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

           <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-7xl mx-auto">
              {/* Starter Tier */}
              <div className="bg-slate-950 border border-slate-800 rounded-2xl p-6 flex flex-col hover:border-slate-700 transition-colors">
                 <h3 className="text-lg font-bold text-white mb-2">Starter</h3>
                 <p className="text-slate-500 text-xs mb-4">For curious beginners</p>
                 <div className="text-3xl font-bold text-white mb-4">$0<span className="text-sm text-slate-500 font-normal">/mo</span></div>
                 <ul className="space-y-3 mb-6 flex-1">
                    <li className="flex items-center gap-2 text-slate-300 text-xs">
                       <CheckCircle size={14} className="text-slate-500 flex-shrink-0" />
                       Analyze 3 Deals / Month
                    </li>
                    <li className="flex items-center gap-2 text-slate-300 text-xs">
                       <CheckCircle size={14} className="text-slate-500 flex-shrink-0" />
                       Basic Property Data
                    </li>
                 </ul>
                 <Link to="/register" className="block w-full bg-slate-800 text-white text-center font-bold py-2 rounded-xl hover:bg-slate-700 transition-colors text-sm">
                    Get Started Free
                 </Link>
              </div>

              {/* Lite Tier */}
              <div className="bg-slate-950 border border-slate-800 rounded-2xl p-6 flex flex-col hover:border-emerald-500/30 transition-colors">
                 <h3 className="text-lg font-bold text-white mb-2">Lite Investor</h3>
                 <p className="text-slate-500 text-xs mb-4">For weekend warriors</p>
                 <div className="text-3xl font-bold text-white mb-4">$19<span className="text-sm text-slate-500 font-normal">/mo</span></div>
                 <ul className="space-y-3 mb-6 flex-1">
                    <li className="flex items-center gap-2 text-slate-300 text-xs">
                       <CheckCircle size={14} className="text-emerald-500 flex-shrink-0" />
                       Analyze 15 Deals / Month
                    </li>
                    <li className="flex items-center gap-2 text-slate-300 text-xs">
                       <CheckCircle size={14} className="text-emerald-500 flex-shrink-0" />
                       Standard Reports
                    </li>
                    <li className="flex items-center gap-2 text-slate-300 text-xs">
                       <CheckCircle size={14} className="text-emerald-500 flex-shrink-0" />
                       Basic Maps
                    </li>
                 </ul>
                 <Link to="/register" className="block w-full bg-slate-700 text-white text-center font-bold py-2 rounded-xl hover:bg-slate-600 transition-colors text-sm">
                    Start Lite
                 </Link>
              </div>

              {/* Pro Investor Tier */}
              <div className="bg-gradient-to-b from-emerald-900/20 to-slate-950 border border-emerald-500 rounded-2xl p-6 flex flex-col relative transform md:-translate-y-4 shadow-2xl shadow-emerald-900/20">
                 <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-emerald-500 text-white px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wide whitespace-nowrap">
                    Most Popular
                 </div>
                 <h3 className="text-lg font-bold text-white mb-2">Pro Investor</h3>
                 <p className="text-emerald-400 text-xs mb-4">For serious buyers</p>
                 <div className="text-3xl font-bold text-white mb-4">$49<span className="text-sm text-slate-500 font-normal">/mo</span></div>
                 <ul className="space-y-3 mb-6 flex-1">
                    <li className="flex items-center gap-2 text-white text-xs font-medium">
                       <CheckCircle size={14} className="text-emerald-400 flex-shrink-0" />
                       Unlimited* AI Analyses
                    </li>
                    <li className="flex items-center gap-2 text-white text-xs font-medium">
                       <CheckCircle size={14} className="text-emerald-400 flex-shrink-0" />
                       Full Rental & ARV Reports
                    </li>
                    <li className="flex items-center gap-2 text-white text-xs font-medium">
                       <CheckCircle size={14} className="text-emerald-400 flex-shrink-0" />
                       Export to PDF
                    </li>
                    <li className="flex items-center gap-2 text-white text-xs font-medium">
                       <CheckCircle size={14} className="text-emerald-400 flex-shrink-0" />
                       Priority Cache Access
                    </li>
                 </ul>
                 <Link to="/register" className="block w-full bg-emerald-500 text-white text-center font-bold py-2 rounded-xl hover:bg-emerald-400 transition-colors shadow-lg shadow-emerald-900/30 text-sm">
                    Start Free Trial
                 </Link>
                 <p className="text-[9px] text-slate-500 text-center mt-2">*Fair use applies (100 reports/mo)</p>
              </div>

              {/* Business Tier */}
              <div className="bg-slate-950 border border-slate-800 rounded-2xl p-6 flex flex-col hover:border-blue-500/50 transition-colors">
                 <h3 className="text-lg font-bold text-white mb-2">Business</h3>
                 <p className="text-blue-400 text-xs mb-4">For scaling teams</p>
                 <div className="text-3xl font-bold text-white mb-4">$149<span className="text-sm text-slate-500 font-normal">/mo</span></div>
                 <ul className="space-y-3 mb-6 flex-1">
                    <li className="flex items-center gap-2 text-slate-300 text-xs">
                       <CheckCircle size={14} className="text-blue-500 flex-shrink-0" />
                       Unlimited Team Analysis
                    </li>
                    <li className="flex items-center gap-2 text-slate-300 text-xs">
                       <CheckCircle size={14} className="text-blue-500 flex-shrink-0" />
                       White-label Reports
                    </li>
                    <li className="flex items-center gap-2 text-slate-300 text-xs">
                       <CheckCircle size={14} className="text-blue-500 flex-shrink-0" />
                       Team Management (3 Seats)
                    </li>
                 </ul>
                 <Link to="/register" className="block w-full bg-slate-800 text-white text-center font-bold py-2 rounded-xl hover:bg-slate-700 transition-colors text-sm">
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