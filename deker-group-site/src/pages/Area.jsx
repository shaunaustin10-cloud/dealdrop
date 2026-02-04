import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { 
  TrendingUp, 
  Home as HomeIcon, 
  BarChart2, 
  Map as MapIcon,
  Search,
  ArrowUpRight,
  ChevronRight
} from 'lucide-react';
import LocalLogicWidget from '../components/LocalLogicWidget';

const AREA_DATA = {
  'norfolk': {
    name: 'Norfolk',
    description: 'A vibrant waterfront city with a rich naval history, diverse neighborhoods, and a thriving arts scene. Norfolk offers a blend of historic charm and modern urban living.',
    image: 'https://images.unsplash.com/photo-1514565131-fce0801e5785?auto=format&fit=crop&q=80&w=1000',
    stats: {
      medianPrice: 325000,
      inventory: 145,
      avgDaysOnMarket: 24,
      yearOverYear: '+5.4%'
    },
    tags: ['Waterfront', 'Historic', 'Military', 'Arts & Culture', 'Urban'],
    neighborhoods: ['Ghent', 'Larchmont', 'Ocean View', 'Downtown', 'Willoughby Spit']
  },
  'virginia-beach': {
    name: 'Virginia Beach',
    description: 'The largest city in Virginia, known for its iconic boardwalk, beautiful beaches, and extensive park system. Perfect for families and outdoor enthusiasts alike.',
    image: '/images/vabeach.jpg',
    stats: {
      medianPrice: 415000,
      inventory: 280,
      avgDaysOnMarket: 18,
      yearOverYear: '+7.2%'
    },
    tags: ['Beachfront', 'Suburban', 'Family-Friendly', 'Military', 'Parks'],
    neighborhoods: ['Town Center', 'Sandbridge', 'Pungo', 'Shore Drive', 'Great Neck']
  },
  'chesapeake': {
    name: 'Chesapeake',
    description: 'A sprawling city offering a mix of suburban developments and protected wetlands. Known for its excellent schools and family-oriented communities.',
    image: '/images/chesapeake.jpg',
    stats: {
      medianPrice: 385000,
      inventory: 110,
      avgDaysOnMarket: 21,
      yearOverYear: '+4.8%'
    },
    tags: ['Suburban', 'Top-Rated Schools', 'Nature Trails', 'Family-Friendly'],
    neighborhoods: ['Greenbrier', 'Deep Creek', 'Western Branch', 'Great Bridge', 'Hickory']
  },
  'portsmouth': {
    name: 'Portsmouth',
    description: 'A historic port city with a walkable Olde Towne district, featuring one of the largest collections of historic homes between Alexandria and Charleston.',
    image: 'https://images.unsplash.com/photo-1541462608141-ad4d05ed4241?auto=format&fit=crop&q=80&w=1000',
    stats: {
      medianPrice: 245000,
      inventory: 65,
      avgDaysOnMarket: 28,
      yearOverYear: '+3.2%'
    },
    tags: ['Historic', 'Naval', 'Walkable', 'Olde Towne'],
    neighborhoods: ['Olde Towne', 'Park View', 'Churchland', 'Port Norfolk', 'Waterview']
  }
};

const MOCK_LISTINGS = [
  {
    id: 1,
    address: "742 Evergreen Terrace",
    price: 350000,
    beds: 3,
    baths: 2,
    sqft: 1800,
    image: "https://images.unsplash.com/photo-1568605114967-8130f3a36994?auto=format&fit=crop&q=80&w=1000"
  },
  {
    id: 2,
    address: "123 Ocean View Ave",
    price: 525000,
    beds: 4,
    baths: 3,
    sqft: 2400,
    image: "https://images.unsplash.com/photo-1570129477492-45c003edd2be?auto=format&fit=crop&q=80&w=1000"
  },
  {
    id: 3,
    address: "555 Historic Lane",
    price: 295000,
    beds: 2,
    baths: 1.5,
    sqft: 1400,
    image: "https://images.unsplash.com/photo-1576941089067-2de3c901e126?auto=format&fit=crop&q=80&w=1000"
  }
];

export default function Area() {
  const { slug } = useParams();
  const [area, setArea] = useState(null);

  useEffect(() => {
    if (slug && AREA_DATA[slug]) {
      setArea(AREA_DATA[slug]);
      window.scrollTo(0, 0);
    }
  }, [slug]);

  if (!area) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-sand">
        <div className="text-center">
          <h1 className="font-serif text-4xl mb-4 text-midnight">Area Not Found</h1>
          <Link to="/" className="text-primary hover:underline font-luxury-caps text-sm">Return Home</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-sand min-h-screen">
      {/* Hero Section */}
      <section className="relative h-[60vh] flex items-end overflow-hidden bg-midnight">
        <div className="absolute inset-0 z-0">
          <img 
            src={area.image} 
            className="w-full h-full object-cover opacity-60 scale-105"
            alt={area.name}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-midnight via-midnight/20 to-transparent"></div>
        </div>
        
        <div className="relative z-10 w-full max-w-7xl mx-auto px-6 pb-16">
          <div className="flex items-center gap-2 text-primary mb-4 font-luxury-caps text-[10px] tracking-[0.2em]">
            <Link to="/" className="hover:text-white transition-colors">Home</Link>
            <ChevronRight size={12} />
            <span className="text-white/60">Areas</span>
            <ChevronRight size={12} />
            <span>{area.name}</span>
          </div>
          <h1 className="font-serif text-6xl md:text-8xl text-white mb-6 italic">
            {area.name} <span className="not-italic">Real Estate</span>
          </h1>
          <div className="flex flex-wrap gap-3">
            {area.tags.map(tag => (
              <span key={tag} className="bg-white/10 backdrop-blur-md border border-white/20 text-white px-4 py-1.5 rounded-full text-[10px] font-luxury-caps tracking-wider">
                {tag}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Overview */}
      <section className="bg-white border-y border-sand-dark py-12">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-12 text-center">
            <div>
              <p className="font-luxury-caps text-slate-light mb-2">Median Price</p>
              <div className="flex items-center justify-center gap-2">
                <p className="font-serif text-3xl text-midnight">${area.stats.medianPrice.toLocaleString()}</p>
                <span className="text-emerald-500 text-[10px] font-bold bg-emerald-50 px-2 py-0.5 rounded-full">{area.stats.yearOverYear}</span>
              </div>
            </div>
            <div>
              <p className="font-luxury-caps text-slate-light mb-2">Active Inventory</p>
              <p className="font-serif text-3xl text-midnight">{area.stats.inventory}</p>
            </div>
            <div>
              <p className="font-luxury-caps text-slate-light mb-2">Avg. Days on Market</p>
              <p className="font-serif text-3xl text-midnight">{area.stats.avgDaysOnMarket}</p>
            </div>
            <div>
              <p className="font-luxury-caps text-slate-light mb-2">Market Type</p>
              <p className="font-serif text-3xl text-midnight">Seller's</p>
            </div>
          </div>
        </div>
      </section>

      {/* Content & Insights Grid */}
      <section className="max-w-7xl mx-auto px-6 py-24">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-16">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-16">
            <div>
              <span className="font-luxury-caps text-primary mb-4 block tracking-[0.3em]">About the Community</span>
              <h2 className="font-serif text-4xl text-midnight mb-6 italic">
                Life in <span className="not-italic">{area.name}</span>
              </h2>
              <p className="text-slate-600 text-lg leading-relaxed mb-8">
                {area.description}
              </p>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {area.neighborhoods.map(nb => (
                  <div key={nb} className="bg-white border border-sand-dark p-4 rounded-xl flex items-center justify-between group cursor-pointer hover:border-primary transition-all">
                    <span className="font-luxury-caps text-[10px] text-midnight">{nb}</span>
                    <ArrowUpRight size={14} className="text-slate-300 group-hover:text-primary transition-colors" />
                  </div>
                ))}
              </div>
            </div>

            {/* Simulated Map Placeholder */}
            <div className="bg-slate-200 aspect-video rounded-[2rem] overflow-hidden relative group">
                <div className="absolute inset-0 bg-cover bg-center opacity-50 transition-scale duration-700 group-hover:scale-105" style={{ backgroundImage: 'url(https://images.unsplash.com/photo-1526778548025-fa2f459cd5c1?auto=format&fit=crop&q=80&w=1000)' }}></div>
                <div className="absolute inset-0 flex items-center justify-center">
                    <button className="bg-midnight text-white px-8 py-4 rounded-full font-luxury-caps text-xs flex items-center gap-3 shadow-2xl hover:bg-primary transition-all">
                        <MapIcon size={18} />
                        Open Interactive Map
                    </button>
                </div>
            </div>

            {/* Featured Listings in Area */}
            <div>
              <div className="flex items-end justify-between mb-10">
                <div>
                  <span className="font-luxury-caps text-primary mb-4 block">New to Market</span>
                  <h2 className="font-serif text-4xl text-midnight italic">
                    {area.name} <span className="not-italic">Listings</span>
                  </h2>
                </div>
                <a href={`https://deshaunaustin.missiontoserve.group/index.php?advanced=1&city[]=${area.name}`} target="_blank" className="font-luxury-caps text-[10px] text-primary hover:underline flex items-center gap-2">
                  View All <ArrowUpRight size={14} />
                </a>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {MOCK_LISTINGS.map(listing => (
                  <div key={listing.id} className="group cursor-pointer">
                    <div className="aspect-[4/5] rounded-2xl overflow-hidden mb-4 shadow-lg">
                      <img src={listing.image} alt={listing.address} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                    </div>
                    <p className="font-serif text-lg text-midnight">{listing.address}</p>
                    <p className="text-primary font-sans font-light">${listing.price.toLocaleString()}</p>
                    <div className="flex gap-3 text-[9px] font-luxury-caps text-slate-400 mt-2">
                        <span>{listing.beds} BEDS</span>
                        <span>•</span>
                        <span>{listing.baths} BATHS</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-8">
            <LocalLogicWidget location={area.name} />
            
            <div className="bg-midnight rounded-3xl p-8 text-white relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-primary/20 rounded-full blur-2xl -mr-16 -mt-16"></div>
                <TrendingUp size={40} className="text-primary mb-6" />
                <h3 className="font-serif text-2xl mb-4 italic">Get a Weekly <span className="not-italic">Market Report</span></h3>
                <p className="text-slate-400 text-sm mb-6 leading-relaxed">
                  Stay ahead of the market with exclusive data on {area.name} delivered to your inbox.
                </p>
                <input 
                  type="email" 
                  placeholder="Email Address" 
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-primary mb-4"
                />
                <button className="w-full bg-primary text-white py-4 rounded-xl font-luxury-caps text-[10px] hover:bg-white hover:text-midnight transition-all">
                  Subscribe
                </button>
            </div>

            <div className="bg-white border border-sand-dark rounded-3xl p-8">
                <BarChart2 size={40} className="text-primary mb-6" />
                <h3 className="font-serif text-2xl mb-4 italic">Free <span className="not-italic">Home Valuation</span></h3>
                <p className="text-slate-500 text-sm mb-6 leading-relaxed">
                  Thinking of selling in {area.name}? Find out what your property is worth in today's market.
                </p>
                <button className="w-full border border-midnight text-midnight py-4 rounded-xl font-luxury-caps text-[10px] hover:bg-midnight hover:text-white transition-all">
                  Get My Value
                </button>
            </div>
          </div>
        </div>
      </section>

      {/* Final Search CTA */}
      <section className="bg-sand pb-24 px-6">
          <div className="max-w-7xl mx-auto bg-white rounded-[3rem] p-12 md:p-20 text-center border border-sand-dark relative overflow-hidden">
              <div className="relative z-10">
                <h2 className="font-serif text-5xl md:text-7xl text-midnight mb-8">
                    Ready to find your <br/>
                    <span className="italic text-primary">place in {area.name}?</span>
                </h2>
                <div className="max-w-2xl mx-auto">
                    <div className="bg-sand p-2 rounded-2xl flex flex-col md:flex-row gap-2 border border-sand-dark">
                        <div className="flex-1 flex items-center px-4 py-3">
                            <Search size={20} className="text-primary mr-3" />
                            <input type="text" placeholder="Price range, property type..." className="bg-transparent w-full focus:outline-none text-sm" />
                        </div>
                        <button className="bg-midnight text-white px-10 py-4 rounded-xl font-luxury-caps text-[10px] hover:bg-primary transition-all">
                            Browse All Listings
                        </button>
                    </div>
                </div>
              </div>
          </div>
      </section>
    </div>
  );
}
