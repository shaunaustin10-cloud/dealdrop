import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  Search, 
  ArrowUpRight,
  TrendingUp,
  Briefcase,
  ChevronDown,
  Lock,
  Zap,
  Bell
} from 'lucide-react';
import SEO from '../components/SEO';
import MLSListings from '../components/MLSListings';
import MarketPulse from '../components/MarketPulse';
import LifestyleQuiz from '../components/LifestyleQuiz';
import { db } from '../firebaseConfig';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';

export default function Home() {
  const [vipEmail, setVipEmail] = useState('');
  const [vipStatus, setVipStatus] = useState('idle');

  const handleVipSubmit = async (e) => {
    e.preventDefault();
    setVipStatus('loading');
    try {
      await addDoc(collection(db, 'leads'), {
        email: vipEmail,
        source: 'VIP First Look List',
        timestamp: serverTimestamp()
      });
      setVipStatus('success');
      setVipEmail('');
    } catch (err) {
      console.error(err);
      setVipStatus('error');
    }
  };

  return (
    <>
      <SEO 
        title="Hampton Roads Real Estate & Luxury Homes" 
        description="Discover elite real estate services in Norfolk, Virginia Beach, and Chesapeake. Specializing in luxury listings, off-market investment deals, and expert representation with De'Shaun Austin."
      />
      {/* Luxury Presence Style Hero */}
      <section className="relative h-screen w-full overflow-hidden bg-midnight">
        <div className="absolute inset-0 z-0">
          <img 
            src="/images/hero-modern.jpg" 
            className="w-full h-full object-cover animate-luxury-pulse"
            alt="Luxury Modern Estate"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-midnight/90 via-transparent to-midnight/10"></div>
        </div>
        
        <div className="relative z-10 h-full flex flex-col justify-end pb-32 px-6 md:px-12 max-w-7xl mx-auto">
          <div className="max-w-4xl">
            <h1 className="font-serif text-6xl md:text-[80px] lg:text-[100px] text-white leading-[0.9] mb-12 animate-luxury-in opacity-0" style={{ animationDelay: '0.3s' }}>
               Experience <br/>
               <span className="italic text-white font-light">Excellence.</span>
            </h1>

            {/* Luxury CTAs */}
            <div className="flex flex-wrap gap-4 animate-luxury-in opacity-0" style={{ animationDelay: '0.4s' }}>
                <a 
                  href="https://deshaunaustin.missiontoserve.group/index.php?advanced=1&rtype=map" 
                  target="_blank"
                  className="bg-white text-midnight px-10 py-4 font-luxury-caps text-[11px] tracking-[0.2em] hover:bg-primary hover:text-white transition-all uppercase shadow-2xl"
                >
                   Explore Interactive Map
                </a>
                <Link 
                  to="/buy"
                  className="bg-white/10 backdrop-blur-md border border-white/20 text-white px-10 py-4 font-luxury-caps text-[11px] tracking-[0.2em] hover:bg-white/20 transition-all uppercase"
                >
                   Buyer Concierge
                </Link>
            </div>
          </div>
        </div>
        
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20 animate-bounce text-white/50">
           <ChevronDown size={24} />
        </div>
      </section>

      {/* Market Pulse - Data Driven Authority */}
      <MarketPulse />

      {/* The Agent - Split Layout */}
      <section className="py-32 bg-cream">
         <div className="max-w-[1400px] mx-auto px-6 grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div className="relative order-2 lg:order-1">
               <div className="aspect-[4/5] max-w-sm mx-auto lg:mx-0 overflow-hidden relative z-10">
                  <img src="/images/headshot.jpg" alt="De'Shaun Austin" className="w-full h-full object-cover transition-all duration-700" />
               </div>
               <div className="absolute top-12 -left-12 w-full h-full border border-midnight/10 -z-0 hidden lg:block"></div>
            </div>
            
            <div className="order-1 lg:order-2 lg:pl-12">
               <span className="font-luxury-caps text-luxury-gold mb-6 block">The Partner You Deserve</span>
               <h2 className="font-serif text-5xl md:text-6xl text-midnight mb-8 leading-[1.1]">
                  De'Shaun Austin <br/> <span className="italic font-light text-slate-400">Mission to Serve.</span>
               </h2>
               <div className="space-y-6 text-slate-600 font-light text-lg leading-relaxed mb-12">
                  <p>
                     Real estate is more than transactions; it's about the life you build within the walls. I bring a personalized, boutique approach to every client, backed by the powerful engine of NextHome.
                  </p>
                  <p>
                     Whether you are a first-time buyer or a seasoned investor, my mission is to serve your unique goals with transparency and expertise.
                  </p>
               </div>
               <Link to="/contact" className="inline-block bg-midnight text-white px-10 py-4 font-luxury-caps text-[11px] tracking-widest hover:bg-luxury-gold transition-colors uppercase">
                  Work With De'Shaun
               </Link>
            </div>
         </div>
      </section>

      {/* Lifestyle Quiz - Interactive Lead Magnet */}
      <LifestyleQuiz />

      {/* Full Bleed Neighborhoods */}
      <section className="bg-sand-dark py-32">
         <div className="px-6 md:px-12 mb-16 flex justify-between items-end max-w-[1400px] mx-auto">
            <div>
               <span className="font-luxury-caps text-luxury-gold mb-4 block">Curated Communities</span>
               <h2 className="font-serif text-5xl text-midnight">Explore the Area</h2>
            </div>
         </div>

         <div className="flex overflow-x-auto snap-x snap-mandatory gap-6 px-6 md:px-12 pb-12 scrollbar-hide">
            {[
               { name: "Norfolk", img: "/images/locations/norfolk.webp", sub: "Urban Waterfront" },
               { name: "Virginia Beach", img: "/images/locations/va-beach.webp", sub: "Coastal Living" },
               { name: "Chesapeake", img: "/images/locations/chesapeake.webp", sub: "Suburban Retreat" },
               { name: "Portsmouth", img: "/images/locations/portsmouth.webp", sub: "Historic Charm" },
               { name: "Hampton", img: "/images/locations/hampton.webp", sub: "Maritime Heritage" },
               { name: "Suffolk", img: "/images/locations/suffolk.webp", sub: "Rural Charm" }
            ].map((area, i) => (
               <Link 
                  to={`/area/${area.name.toLowerCase().replace(' ', '-')}`} 
                  key={i} 
                  className="relative min-w-[85vw] md:min-w-[400px] aspect-[3/4] group overflow-hidden bg-midnight snap-center"
               >
                  <img 
                    src={area.img} 
                    alt={`${area.name} Real Estate - ${area.sub}`} 
                    className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110 opacity-80 group-hover:opacity-100"
                    loading="lazy"
                    width="612"
                    height="408"
                  />
                  <div className="absolute inset-0 bg-black/20 group-hover:bg-transparent transition-colors"></div>
                  <div className="absolute bottom-12 left-8 text-white z-10">
                     <p className="font-luxury-caps tracking-widest mb-2 opacity-0 group-hover:opacity-100 transform translate-y-4 group-hover:translate-y-0 transition-all duration-500 delay-100">{area.sub}</p>
                     <h3 className="font-serif text-4xl italic">{area.name}</h3>
                  </div>
               </Link>
            ))}
         </div>
      </section>

      {/* VIP First Look - Scarcity Lead Capture */}
      <section className="bg-white py-32 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="bg-midnight rounded-[3rem] p-8 md:p-20 text-white relative overflow-hidden flex flex-col lg:flex-row items-center gap-16 shadow-2xl">
            <div className="absolute top-0 right-0 w-full h-full opacity-20 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]"></div>
            
            <div className="lg:w-1/2 relative z-10">
              <div className="flex items-center gap-3 text-primary mb-6">
                <Lock size={20} />
                <span className="font-luxury-caps text-[10px] tracking-[0.3em] uppercase font-bold">The Insider Circle</span>
              </div>
              <h2 className="font-serif text-5xl md:text-6xl mb-8 italic">Get the <span className="not-italic text-primary">First Look.</span></h2>
              <p className="text-slate-400 text-lg font-light leading-relaxed mb-8">
                Join our exclusive VIP network to receive off-market luxury deals and new construction previews 48 hours before they hit the general public.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="flex items-center gap-3 text-sm text-slate-300">
                  <Bell className="text-primary" size={18} /> Instant Notifications
                </div>
                <div className="flex items-center gap-3 text-sm text-slate-300">
                  <Zap className="text-primary" size={18} /> Priority Access
                </div>
              </div>
            </div>

            <div className="lg:w-1/2 w-full relative z-10">
              {vipStatus === 'success' ? (
                <div className="bg-white/5 border border-white/10 rounded-3xl p-10 text-center">
                  <div className="w-16 h-16 bg-primary/20 text-primary rounded-full flex items-center justify-center mx-auto mb-6">
                    <Bell size={32} />
                  </div>
                  <h3 className="font-serif text-2xl mb-2">You're on the list.</h3>
                  <p className="text-slate-400 text-sm font-light">Watch your inbox for the next exclusive drop.</p>
                </div>
              ) : (
                <form onSubmit={handleVipSubmit} className="space-y-4">
                  <div className="bg-white/5 border border-white/10 rounded-2xl p-2 flex flex-col sm:flex-row gap-2">
                    <input 
                      required
                      type="email"
                      placeholder="Enter your professional email..."
                      className="flex-1 bg-transparent border-none text-white px-6 py-4 focus:ring-0 text-sm"
                      value={vipEmail}
                      onChange={(e) => setVipEmail(e.target.value)}
                    />
                    <button type="submit" disabled={vipStatus === 'loading'} className="bg-primary text-white px-10 py-4 rounded-xl font-luxury-caps text-[10px] tracking-widest hover:bg-white hover:text-midnight transition-all uppercase whitespace-nowrap">
                      {vipStatus === 'loading' ? 'Joining...' : 'Join the VIP List'}
                    </button>
                  </div>
                  <p className="text-[10px] text-slate-500 text-center uppercase tracking-widest">No Spam • High Value • Secure Access</p>
                </form>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Current Offerings - Direct Map Link */}
      <section id="inventory" className="bg-sand py-32 px-6">
         <div className="max-w-[1400px] mx-auto text-center">
            <div className="max-w-2xl mx-auto mb-20">
               <span className="font-luxury-caps text-luxury-gold mb-4 block">Exclusive Portfolio</span>
               <h2 className="font-serif text-5xl text-midnight mb-6 italic">Current <span className="not-italic">Offerings</span></h2>
               <p className="text-slate-light font-light leading-relaxed">
                  Explore our curated selection of properties. Direct access to the region's most sought-after inventory.
               </p>
            </div>

            <MLSListings />
         </div>
      </section>
    </>
  );
}