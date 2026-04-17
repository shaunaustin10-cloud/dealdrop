import React, { useEffect } from 'react';
import { ShieldCheck, TrendingUp, HeartHandshake, ArrowRight, Wallet, Clock, FileText } from 'lucide-react';

const MortgageAssistance = () => {
  useEffect(() => {
    document.title = "Mortgage Assistance & Foreclosure Help | NextHome Mission to Serve";
    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
      metaDescription.setAttribute("content", "Facing foreclosure? Our expert mortgage assistance services help you navigate the process, protect your credit, and ensure you walk away with the money you deserve.");
    }
  }, []);

  const services = [
    {
      title: "Foreclosure Prevention",
      desc: "Stop the clock. We analyze your situation to identify legal and strategic ways to pause or prevent the foreclosure process.",
      icon: <ShieldCheck className="text-primary" size={24} />
    },
    {
      title: "Equity Protection",
      desc: "Don't let the bank take your hard-earned equity. We help you sell or restructure to ensure you walk away with cash in hand.",
      icon: <Wallet className="text-primary" size={24} />
    },
    {
      title: "Short Sale Navigation",
      desc: "If you owe more than your home is worth, we negotiate with your lender to settle the debt and protect your future credit.",
      icon: <FileText className="text-primary" size={24} />
    },
    {
      title: "Loan Modification Support",
      desc: "We guide you through the complex paperwork required to restructure your loan for more affordable monthly payments.",
      icon: <HeartHandshake className="text-primary" size={24} />
    }
  ];

  return (
    <div className="pt-24 bg-sand min-h-screen font-luxury">
      {/* Hero Section */}
      <section className="relative py-20 bg-white border-b border-sand-dark overflow-hidden">
        <div className="absolute top-0 right-0 w-1/3 h-full bg-primary/5 -skew-x-12 transform translate-x-1/2" />
        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <div className="max-w-3xl">
            <span className="inline-block px-4 py-1.5 bg-primary/10 text-primary text-[10px] font-black uppercase tracking-[0.2em] mb-6 rounded-full">
              Confidential Mortgage Assistance
            </span>
            <h1 className="text-5xl md:text-7xl font-luxury-caps text-midnight mb-8 leading-[1.1] tracking-tight">
              Facing Foreclosure? <br />
              <span className="text-primary">Don't Walk Away Empty-Handed.</span>
            </h1>
            <p className="text-xl text-slate-600 mb-10 leading-relaxed font-medium">
              You have more options than you think. Our mission is to help you protect your credit, save your equity, and navigate the complex foreclosure process with professional guidance.
            </p>
            <div className="flex flex-wrap gap-4">
              <a 
                href="#consultation" 
                className="px-10 py-5 bg-midnight text-white text-xs font-bold uppercase tracking-widest hover:bg-primary transition-all flex items-center gap-3 shadow-xl shadow-midnight/10"
              >
                Get Free Consultation <ArrowRight size={16} />
              </a>
              <div className="flex items-center gap-3 px-6 py-4 border border-sand-dark bg-white/50 backdrop-blur-sm">
                <Clock className="text-primary" size={20} />
                <span className="text-[11px] font-bold uppercase tracking-widest text-midnight">Time is critical—Act Now</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Trust & Value Props */}
      <section className="py-24 bg-sand">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {services.map((service, i) => (
              <div key={i} className="bg-white p-8 border border-sand-dark shadow-sm hover:shadow-xl transition-all duration-500 group">
                <div className="mb-6 p-3 bg-sand inline-block group-hover:bg-primary/10 transition-colors">
                  {service.icon}
                </div>
                <h3 className="text-lg font-luxury-caps text-midnight mb-4 tracking-wider">{service.title}</h3>
                <p className="text-sm text-slate-500 leading-relaxed font-medium">
                  {service.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* The "Walk Away with Money" Strategy */}
      <section className="py-24 bg-midnight text-white overflow-hidden relative">
        <div className="absolute top-0 left-0 w-full h-full opacity-5 pointer-events-none">
          <div className="absolute top-20 left-10 text-[200px] font-black leading-none tracking-tighter uppercase select-none">Equity</div>
        </div>
        
        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
            <div>
              <h2 className="text-4xl md:text-5xl font-luxury-caps mb-8 leading-tight tracking-wide">
                Our Goal: <br />
                <span className="text-primary italic">Equity Preservation</span>
              </h2>
              <p className="text-lg text-sand/70 mb-8 leading-relaxed font-light">
                Most homeowners don't realize that even in foreclosure, there is often significant value left in the property. The banks want you to walk away so they can keep the surplus. 
              </p>
              <div className="space-y-6">
                {[
                  "Stop the foreclosure auction from proceeding",
                  "Analyze your home's current market value",
                  "Identify strategies to extract your built-up equity",
                  "Ensure you have moving capital for your next chapter"
                ].map((item, i) => (
                  <div key={i} className="flex gap-4 items-start">
                    <div className="mt-1 flex-shrink-0 w-5 h-5 bg-primary rounded-full flex items-center justify-center">
                      <TrendingUp size={12} className="text-white" />
                    </div>
                    <p className="text-sm font-bold tracking-wide text-sand uppercase">{item}</p>
                  </div>
                ))}
              </div>
            </div>
            <div className="bg-white/10 p-1 rounded-none backdrop-blur-md">
              <div className="bg-white p-10">
                <h3 className="text-2xl font-luxury-caps text-midnight mb-6 tracking-wider">The Truth About Foreclosure</h3>
                <div className="space-y-6 text-slate-600 font-medium">
                  <p className="leading-relaxed">
                    Doing nothing is the only way to lose everything. The moment you receive a Notice of Default, your rights as a homeowner begin to shrink.
                  </p>
                  <p className="leading-relaxed border-l-4 border-primary pl-6 py-2 bg-sand">
                    "We've helped local homeowners save their credit scores and walk away with five to six-figure checks that would have otherwise gone to the bank."
                  </p>
                  <div className="pt-4">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-primary flex items-center justify-center text-white">
                        <ShieldCheck size={24} />
                      </div>
                      <div>
                        <p className="text-[10px] font-black uppercase tracking-widest text-primary">Certified Specialists</p>
                        <p className="text-xs font-bold text-midnight uppercase tracking-wider">NextHome Distressed Property Experts</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Form Section */}
      <section id="consultation" className="py-24 bg-sand">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <span className="text-primary text-[10px] font-black uppercase tracking-[0.3em] mb-4 inline-block">Start Your Recovery</span>
          <h2 className="text-4xl md:text-6xl font-luxury-caps text-midnight mb-12 tracking-tight">Free Strategic Consultation</h2>
          
          <div className="bg-white p-10 md:p-16 border border-sand-dark shadow-2xl">
            <form className="grid grid-cols-1 md:grid-cols-2 gap-8 text-left">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-midnight">Full Name</label>
                <input type="text" placeholder="John Doe" className="w-full bg-sand border-none p-4 text-sm font-bold focus:ring-2 focus:ring-primary/20" />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-midnight">Phone Number</label>
                <input type="tel" placeholder="(555) 000-0000" className="w-full bg-sand border-none p-4 text-sm font-bold focus:ring-2 focus:ring-primary/20" />
              </div>
              <div className="md:col-span-2 space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-midnight">Email Address</label>
                <input type="email" placeholder="john@example.com" className="w-full bg-sand border-none p-4 text-sm font-bold focus:ring-2 focus:ring-primary/20" />
              </div>
              <div className="md:col-span-2 space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-midnight">Property City/County</label>
                <input type="text" placeholder="e.g. Norfolk, VA" className="w-full bg-sand border-none p-4 text-sm font-bold focus:ring-2 focus:ring-primary/20" />
              </div>
              <div className="md:col-span-2 space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-midnight">Current Situation (Optional)</label>
                <textarea rows="4" placeholder="Briefly describe your situation..." className="w-full bg-sand border-none p-4 text-sm font-bold focus:ring-2 focus:ring-primary/20"></textarea>
              </div>
              <div className="md:col-span-2 pt-6">
                <button type="submit" className="w-full py-6 bg-midnight text-white text-xs font-black uppercase tracking-[0.3em] hover:bg-primary transition-all shadow-xl shadow-midnight/10">
                  Request Confidential Help
                </button>
                <p className="mt-6 text-center text-[10px] text-slate-400 font-bold uppercase tracking-widest">
                  🔒 100% Confidential & Private. No Obligations.
                </p>
              </div>
            </form>
          </div>
        </div>
      </section>
    </div>
  );
};

export default MortgageAssistance;
