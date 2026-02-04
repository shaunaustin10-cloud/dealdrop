import React, { useState } from 'react';
import LeadGenWizard from '../components/LeadGenWizard';
import { TrendingUp, CheckCircle, BarChart } from 'lucide-react';

const SELLER_QUESTIONS = [
  {
    key: 'address',
    text: "What is the address of the home you're selling?",
    type: 'input',
    placeholder: '123 Main St, City, State'
  },
  {
    key: 'timeline',
    text: "How soon are you looking to sell?",
    type: 'options',
    options: ['Immediately', '1-3 Months', '3-6 Months', 'Just Curious']
  },
  {
    key: 'condition',
    text: "How would you rate the condition of your home?",
    type: 'options',
    options: ['Turn-Key / Renovated', 'Good Condition', 'Needs Some TLC', 'Fixer Upper']
  },
  {
    key: 'email',
    text: "Where should we send your home valuation report?",
    type: 'input',
    inputType: 'email',
    placeholder: 'name@example.com'
  }
];

export default function Seller() {
  const [completed, setCompleted] = useState(false);

  const handleLeadSubmit = (data) => {
    console.log("Seller Lead Data:", data);
    setCompleted(true);
    // TODO: Send to backend/CRM
  };

  return (
    <div className="pt-20">
      {/* Hero Section */}
      <section className="relative py-24 bg-midnight overflow-hidden min-h-[85vh] flex items-center">
        <div className="absolute inset-0 z-0">
          <img 
            src="/images/trust-hero.jpg" 
            className="w-full h-full object-cover opacity-30"
            alt="Luxury Living Room"
          />
          <div className="absolute inset-0 bg-gradient-to-l from-midnight via-midnight/90 to-transparent"></div>
        </div>

        <div className="max-w-7xl mx-auto px-6 relative z-10 w-full">
          <div className="flex flex-col lg:flex-row-reverse items-center gap-16">
            <div className="lg:w-1/2">
              <span className="font-luxury-caps text-primary mb-6 block tracking-widest">For Sellers</span>
              <h1 className="font-serif text-5xl md:text-7xl text-white leading-tight mb-8">
                Maximize Your <br/>
                <span className="italic text-primary">Return.</span>
              </h1>
              <p className="text-slate-300 text-lg mb-12 max-w-lg leading-relaxed">
                Strategic marketing, professional staging, and expert negotiation. We sell homes faster and for more money than the competition.
              </p>
              
              {!completed ? (
                <LeadGenWizard 
                  title="Get Your Home Valuation" 
                  questions={SELLER_QUESTIONS} 
                  onComplete={handleLeadSubmit} 
                />
              ) : (
                <div className="bg-white/10 backdrop-blur-md border border-white/20 p-8 rounded-3xl text-center animate-luxury-in">
                  <h3 className="font-serif text-3xl text-white mb-4">Valuation in Progress.</h3>
                  <p className="text-slate-300 mb-6">Our algorithms are crunching the numbers. Check your email shortly for your comprehensive home report.</p>
                </div>
              )}
            </div>
            
            <div className="lg:w-1/2 w-full">
               <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                 <div className="bg-white/5 backdrop-blur-sm border border-white/10 p-8 rounded-3xl">
                   <TrendingUp className="text-primary mb-4" size={32} />
                   <h3 className="text-2xl font-serif text-white mb-2">Top Dollar</h3>
                   <p className="text-slate-400 text-sm">Our listings sell for 4.2% more than the area average thanks to our premium marketing.</p>
                 </div>
                 <div className="bg-white/5 backdrop-blur-sm border border-white/10 p-8 rounded-3xl">
                   <CheckCircle className="text-primary mb-4" size={32} />
                   <h3 className="text-2xl font-serif text-white mb-2">Zero Stress</h3>
                   <p className="text-slate-400 text-sm">We handle everything: staging, repairs, cleaning, and photography.</p>
                 </div>
                 <div className="bg-white/5 backdrop-blur-sm border border-white/10 p-8 rounded-3xl md:col-span-2">
                   <BarChart className="text-primary mb-4" size={32} />
                   <h3 className="text-2xl font-serif text-white mb-2">Market Analysis</h3>
                   <p className="text-slate-400 text-sm">We don't guess. We use real-time data to price your home perfectly for the current market conditions.</p>
                 </div>
               </div>
            </div>
          </div>
        </div>
      </section>

      {/* Marketing Showcase */}
      <section className="bg-white py-24 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-3xl mx-auto mb-20">
            <span className="font-luxury-caps text-primary mb-4 block">The Marketing Suite</span>
            <h2 className="font-serif text-4xl md:text-5xl text-midnight">Showcasing your home <br/><span className="italic">to the world.</span></h2>
          </div>

          <div className="grid md:grid-cols-2 gap-8 items-center">
             <div className="aspect-video bg-sand-dark rounded-3xl overflow-hidden relative group">
                <img src="/images/hero-modern.jpg" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" alt="Marketing Example" />
                <div className="absolute inset-0 flex items-center justify-center">
                   <div className="w-16 h-16 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center border border-white/30 cursor-pointer hover:bg-white/30 transition-colors">
                      <div className="w-0 h-0 border-t-[10px] border-t-transparent border-l-[18px] border-l-white border-b-[10px] border-b-transparent ml-1"></div>
                   </div>
                </div>
             </div>
             <div className="space-y-8">
                {[
                  "Professional HDR Photography & Drone Footage",
                  "3D Matterport Virtual Tours",
                  "Dedicated Property Website",
                  "Social Media Advertising Campaigns",
                  "Email Blast to 10,000+ Local Buyers"
                ].map((feature, i) => (
                  <div key={i} className="flex items-center gap-4">
                     <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-sm">
                       {i + 1}
                     </div>
                     <p className="font-serif text-xl text-midnight">{feature}</p>
                  </div>
                ))}
             </div>
          </div>
        </div>
      </section>
    </div>
  );
}