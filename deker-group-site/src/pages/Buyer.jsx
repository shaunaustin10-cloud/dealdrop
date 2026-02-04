import React, { useState } from 'react';
import LeadGenWizard from '../components/LeadGenWizard';
import LocalLogicWidget from '../components/LocalLogicWidget';

const BUYER_QUESTIONS = [
  {
    key: 'timeline',
    text: "When are you looking to move?",
    type: 'options',
    options: ['ASAP', '1-3 Months', '3-6 Months', 'Just Browsing']
  },
  {
    key: 'budget',
    text: "What is your approximate budget?",
    type: 'options',
    options: ['$300k - $500k', '$500k - $800k', '$800k - $1.5M', '$1.5M+']
  },
  {
    key: 'location',
    text: "Which area are you most interested in?",
    type: 'options',
    options: ['Norfolk', 'Virginia Beach', 'Chesapeake', 'Portsmouth', 'Not Sure']
  },
  {
    key: 'email',
    text: "Where should we send your curated property list?",
    type: 'input',
    inputType: 'email',
    placeholder: 'name@example.com'
  }
];

export default function Buyer() {
  const [completed, setCompleted] = useState(false);

  const handleLeadSubmit = (data) => {
    console.log("Buyer Lead Data:", data);
    setCompleted(true);
    // TODO: Send to backend/CRM
  };

  return (
    <div className="pt-20">
      {/* Hero Section */}
      <section className="relative py-24 bg-midnight overflow-hidden min-h-[80vh] flex items-center">
        <div className="absolute inset-0 z-0">
          <img 
            src="/images/hero-modern.jpg" 
            className="w-full h-full object-cover opacity-40"
            alt="Luxury Home Interior"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-midnight via-midnight/80 to-transparent"></div>
        </div>

        <div className="max-w-7xl mx-auto px-6 relative z-10 w-full">
          <div className="flex flex-col lg:flex-row items-center gap-16">
            <div className="lg:w-1/2">
              <span className="font-luxury-caps text-primary mb-6 block tracking-widest">For Buyers</span>
              <h1 className="font-serif text-5xl md:text-7xl text-white leading-tight mb-8">
                Experience the <br/>
                <span className="italic text-primary">Art of Buying.</span>
              </h1>
              <p className="text-slate-300 text-lg mb-12 max-w-lg leading-relaxed">
                Unlock exclusive access to off-market listings and let our concierge team guide you to your perfect home with data-driven insights.
              </p>
              
              {!completed ? (
                <LeadGenWizard 
                  title="Find Your Dream Home" 
                  questions={BUYER_QUESTIONS} 
                  onComplete={handleLeadSubmit} 
                />
              ) : (
                <div className="bg-white/10 backdrop-blur-md border border-white/20 p-8 rounded-3xl text-center animate-luxury-in">
                  <h3 className="font-serif text-3xl text-white mb-4">Welcome Aboard.</h3>
                  <p className="text-slate-300 mb-6">We've received your preferences. An agent will be in touch shortly with a curated list of properties.</p>
                  <button className="bg-primary text-white px-8 py-3 rounded-xl font-luxury-caps text-xs hover:bg-orange-600 transition-colors">
                    Browse Current Listings
                  </button>
                </div>
              )}
            </div>
            
            <div className="lg:w-1/2 w-full">
               <LocalLogicWidget location="Virginia Beach Oceanfront" />
            </div>
          </div>
        </div>
      </section>

      {/* Value Props */}
      <section className="bg-sand py-24 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-3xl mx-auto mb-20">
            <span className="font-luxury-caps text-primary mb-4 block">The Mission to Serve Advantage</span>
            <h2 className="font-serif text-4xl md:text-5xl text-midnight">Not just a transaction. <br/><span className="italic">A partnership.</span></h2>
          </div>

          <div className="grid md:grid-cols-3 gap-12">
             {[
               { title: "Off-Market Access", desc: "Get priority access to homes before they hit the MLS through our exclusive network." },
               { title: "Data-Driven Approach", desc: "We utilize advanced market analytics to ensure you never overpay for your investment." },
               { title: "Concierge Service", desc: "From inspections to closing, our team handles every detail for a stress-free experience." }
             ].map((item, i) => (
               <div key={i} className="bg-white p-10 rounded-3xl shadow-lg border border-sand-dark hover:-translate-y-2 transition-transform duration-500">
                  <h3 className="font-serif text-2xl text-midnight mb-4">{item.title}</h3>
                  <p className="text-slate-500 leading-relaxed">{item.desc}</p>
               </div>
             ))}
          </div>
        </div>
      </section>
    </div>
  );
}