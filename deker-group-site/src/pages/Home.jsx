import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  Search, 
  ArrowUpRight,
  TrendingUp,
  Briefcase,
  ChevronDown
} from 'lucide-react';

const MOCK_LISTINGS = [
  {
    id: 1,
    address: "124 Marine Terrace, Laguna Beach, CA",
    price: 4250000,
    beds: 4,
    baths: 3,
    sqft: 3200,
    type: "Modern Coastal",
    image: "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&q=80&w=1000",
    isVip: true
  },
  {
    id: 2,
    address: "888 Sandbar Way, Malibu, CA",
    price: 8900000,
    beds: 5,
    baths: 6,
    sqft: 5400,
    type: "Oceanfront Estate",
    image: "https://images.unsplash.com/photo-1613545325278-f24b0cae1224?auto=format&fit=crop&q=80&w=1000",
    isVip: false
  },
  {
    id: 3,
    address: "420 Skyline Drive, Hollywood Hills, CA",
    price: 2750000,
    beds: 3,
    baths: 3,
    sqft: 2800,
    type: "Contemporary",
    image: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&q=80&w=1000",
    isVip: true
  }
];

export default function Home() {
  const [search, setSearch] = useState('');

  const handleImageError = (e) => {
    e.target.src = "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?auto=format&fit=crop&q=80&w=1000";
  };

  return (
    <>
      {/* Luxury Presence Style Hero */}
      <section className="relative h-screen w-full overflow-hidden bg-midnight">
        <div className="absolute inset-0 z-0">
          <img 
            src="/images/hero-modern.jpg" 
            className="w-full h-full object-cover animate-luxury-pulse"
            alt="Luxury Modern Estate"
          />
          {/* Subtle Gradient Overlay - Bottom Only */}
          <div className="absolute inset-0 bg-gradient-to-t from-midnight/90 via-transparent to-midnight/10"></div>
        </div>
        
        {/* Content Aligned Bottom Left */}
        <div className="relative z-10 h-full flex flex-col justify-end pb-32 px-6 md:px-12 max-w-7xl mx-auto">
          <div className="max-w-4xl">
            <div className="animate-luxury-in opacity-0" style={{ animationDelay: '0.2s' }}>
               <span className="font-serif text-white text-2xl md:text-4xl mb-2 block italic font-light">De'Shaun Austin</span>
               <span className="font-luxury-caps text-luxury-gold mb-8 block tracking-[0.4em] text-[10px]">Mission to Serve</span>
            </div>
            
            <h1 className="font-serif text-6xl md:text-[80px] lg:text-[100px] text-white leading-[0.9] mb-12 animate-luxury-in opacity-0" style={{ animationDelay: '0.3s' }}>
               Experience <br/>
               <span className="italic text-white font-light">Excellence.</span>
            </h1>

            {/* Minimalist Search */}
            <div className="max-w-xl animate-luxury-in opacity-0" style={{ animationDelay: '0.4s' }}>
                <form 
                  action="https://deshaunaustin.missiontoserve.group/index.php" 
                  method="GET"
                  target="_blank"
                  className="bg-white/10 backdrop-blur-md border border-white/20 p-2 rounded-none flex items-center group transition-all hover:bg-white/20"
                >
                    <input type="hidden" name="advanced" value="1" />
                    <Search className="text-white ml-4" size={20} />
                    <input 
                      type="text" 
                      name="city[]"
                      placeholder="Search by City, Zip, or Address..." 
                      className="bg-transparent border-none text-white placeholder:text-white/60 focus:ring-0 w-full px-4 py-3 font-light tracking-wide focus:outline-none"
                    />
                    <button type="submit" className="bg-white text-midnight px-8 py-3 font-luxury-caps text-[10px] tracking-widest hover:bg-primary hover:text-white transition-colors uppercase">
                       Search
                    </button>
                </form>
            </div>
          </div>
        </div>
        
        {/* Scroll Indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20 animate-bounce text-white/50">
           <ChevronDown size={24} />
        </div>
      </section>

      {/* Floating Action Button */}
      <button className="fixed bottom-8 right-8 z-[100] bg-white text-midnight p-6 rounded-full shadow-2xl hover:scale-105 transition-transform group border border-sand-dark">
         <span className="font-serif italic text-xl group-hover:hidden">?</span>
         <span className="hidden group-hover:block font-luxury-caps text-[10px] tracking-widest">Chat</span>
      </button>

      {/* Intro Stats - Minimal */}
      <section className="bg-white py-32 px-6">
        <div className="max-w-7xl mx-auto">
           <div className="flex flex-col md:flex-row justify-between items-end mb-24 border-b border-sand-dark pb-8">
              <div className="max-w-lg">
                 <span className="text-luxury-gold font-luxury-caps mb-4 block">Market Authority</span>
                 <p className="font-serif text-4xl text-midnight leading-tight">
                    Redefining real estate in Hampton Roads with data-driven insights and world-class service.
                 </p>
              </div>
              <div className="mt-8 md:mt-0">
                 <Link to="/about" className="text-xs font-bold uppercase tracking-widest border-b border-midnight pb-1 hover:text-luxury-gold hover:border-luxury-gold transition-colors">
                    Read Our Story
                 </Link>
              </div>
           </div>

           <div className="grid grid-cols-2 md:grid-cols-4 gap-12">
              {[
                 { label: "Sales Volume", value: "$140M+" },
                 { label: "Active Listings", value: "24" },
                 { label: "Years Experience", value: "12+" },
                 { label: "Happy Clients", value: "500+" }
              ].map((stat, i) => (
                 <div key={i} className="group cursor-default">
                    <p className="font-serif text-5xl md:text-6xl text-midnight mb-2 group-hover:text-luxury-gold transition-colors duration-500">{stat.value}</p>
                    <p className="font-luxury-caps text-slate-light tracking-widest">{stat.label}</p>
                 </div>
              ))}
           </div>
        </div>
      </section>

      {/* Full Bleed Neighborhoods */}
      <section className="bg-sand-dark py-32">
         <div className="px-6 md:px-12 mb-16 flex justify-between items-end max-w-[1400px] mx-auto">
            <div>
               <span className="font-luxury-caps text-luxury-gold mb-4 block">Curated Communities</span>
               <h2 className="font-serif text-5xl text-midnight">Explore the Area</h2>
            </div>
            <div className="hidden md:flex gap-4">
               {/* Custom Prev/Next Arrows could go here */}
            </div>
         </div>

         <div className="flex overflow-x-auto snap-x snap-mandatory gap-6 px-6 md:px-12 pb-12 scrollbar-hide">
            {[
               { name: "Norfolk", img: "https://images.unsplash.com/photo-1514565131-fce0801e5785?auto=format&fit=crop&q=80&w=1000", sub: "Urban Waterfront" },
               { name: "Virginia Beach", img: "/images/vabeach.jpg", sub: "Coastal Living" },
               { name: "Chesapeake", img: "/images/chesapeake.jpg", sub: "Suburban Retreat" },
               { name: "Portsmouth", img: "https://images.unsplash.com/photo-1588665796238-124b89311451?auto=format&fit=crop&q=80&w=1000", sub: "Historic Charm" }
            ].map((area, i) => (
               <Link 
                  to={`/area/${area.name.toLowerCase().replace(' ', '-')}`} 
                  key={i} 
                  className="relative min-w-[85vw] md:min-w-[400px] aspect-[3/4] group overflow-hidden bg-midnight snap-center"
               >
                  <img src={area.img} alt={area.name} className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110 opacity-80 group-hover:opacity-100" />
                  <div className="absolute inset-0 bg-black/20 group-hover:bg-transparent transition-colors"></div>
                  <div className="absolute bottom-12 left-8 text-white z-10">
                     <p className="font-luxury-caps tracking-widest mb-2 opacity-0 group-hover:opacity-100 transform translate-y-4 group-hover:translate-y-0 transition-all duration-500 delay-100">{area.sub}</p>
                     <h3 className="font-serif text-4xl italic">{area.name}</h3>
                  </div>
               </Link>
            ))}
         </div>
      </section>

      {/* Featured Properties - Grid Layout */}
      <section id="inventory" className="bg-white py-32 px-6">
         <div className="max-w-[1400px] mx-auto">
            <div className="text-center max-w-2xl mx-auto mb-20">
               <span className="font-luxury-caps text-luxury-gold mb-4 block">Exclusive Portfolio</span>
               <h2 className="font-serif text-5xl text-midnight mb-6">Current Offerings</h2>
               <p className="text-slate-light font-light leading-relaxed">
                  A curated selection of the finest properties in Hampton Roads. From waterfront estates to modern downtown lofts.
               </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-y-16 gap-x-8">
               {MOCK_LISTINGS.map((listing) => (
                  <div key={listing.id} className="group">
                     <div className="aspect-[4/5] overflow-hidden bg-sand-dark relative mb-6">
                        <img src={listing.image} alt={listing.address} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" onError={handleImageError} />
                        {listing.isVip && (
                           <div className="absolute top-4 left-4 bg-white/90 backdrop-blur text-midnight px-3 py-1 text-[10px] font-bold uppercase tracking-widest">
                              VIP Access
                           </div>
                        )}
                     </div>
                     <div className="flex justify-between items-start mb-2">
                        <h3 className="font-serif text-2xl text-midnight group-hover:text-luxury-gold transition-colors">{listing.address}</h3>
                        <p className="font-sans text-lg font-light">${(listing.price / 1000000).toFixed(2)}M</p>
                     </div>
                     <p className="text-slate-light text-xs uppercase tracking-widest mb-4">
                        {listing.beds} Beds • {listing.baths} Baths • {listing.sqft} Sq. Ft.
                     </p>
                     <div className="flex gap-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300 transform translate-y-2 group-hover:translate-y-0">
                        <Link to={`/property/${listing.id}`} className="text-[10px] font-bold uppercase tracking-widest border-b border-midnight pb-1">
                           View Details
                        </Link>
                     </div>
                  </div>
               ))}
            </div>
         </div>
      </section>

      {/* The Agent - Split Layout */}
      <section className="py-32 bg-cream">
         <div className="max-w-[1400px] mx-auto px-6 grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div className="relative order-2 lg:order-1">
               <div className="aspect-[4/5] max-w-md mx-auto lg:mx-0 overflow-hidden relative z-10">
                  <img src="/images/headshot.jpg" alt="De'Shaun Austin" className="w-full h-full object-cover transition-all duration-700" />
               </div>
               {/* Abstract decorative box */}
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
               <button className="bg-midnight text-white px-10 py-4 font-luxury-caps text-[11px] tracking-widest hover:bg-luxury-gold transition-colors">
                  Work With De'Shaun
               </button>
            </div>
         </div>
      </section>

      {/* Investor Call to Action - Dark Mode */}
      <section className="bg-midnight py-32 px-6 text-center relative overflow-hidden">
         <div className="absolute inset-0 opacity-20 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]"></div>
         <div className="max-w-4xl mx-auto relative z-10">
            <TrendingUp className="mx-auto text-luxury-gold mb-8" size={48} />
            <h2 className="font-serif text-5xl md:text-7xl text-white mb-8">
               Build Your <span className="italic text-luxury-gold">Legacy.</span>
            </h2>
            <p className="text-white/60 text-lg font-light mb-12 max-w-2xl mx-auto">
               Join our exclusive investor network for first access to off-market wholesale deals and high-yield opportunities in the Hampton Roads area.
            </p>
            <a 
               href="http://localhost:5173" 
               className="inline-block border border-white/30 text-white px-12 py-4 font-luxury-caps text-[11px] tracking-widest hover:bg-white hover:text-midnight transition-all"
            >
               Enter Investor Portal
            </a>
         </div>
      </section>
    </>
  );
}