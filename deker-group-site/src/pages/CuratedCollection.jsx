import React from 'react';
import { Sparkles, Hammer, ArrowRight, ChevronLeft, MapPin, Ruler, Bed, Bath } from 'lucide-react';
import { Link, useParams } from 'react-router-dom';
import SEO from '../components/SEO';

const CURATED_HOMES = {
  'new-construction': {
    title: 'New Construction',
    subtitle: 'The Future of Living',
    description: 'Explore pre-construction opportunities, custom builds, and energy-efficient modern estates with full warranties in Hampton Roads.',
    icon: <Sparkles className="text-primary" size={24} />,
    homes: [
      {
        id: 1,
        address: 'The Wellington Estate',
        location: 'Virginia Beach, VA',
        price: '$1,250,000',
        specs: { beds: 5, baths: 4.5, sqft: '4,200' },
        status: 'Pre-Construction',
        image: '/images/hero-modern.jpg',
        tags: ['Smart Home', 'Energy Star']
      },
      {
        id: 2,
        address: 'Riverfront Modern',
        location: 'Chesapeake, VA',
        price: '$895,000',
        specs: { beds: 4, baths: 3.5, sqft: '3,100' },
        status: 'Under Construction',
        image: '/images/hero-modern.jpg',
        tags: ['Waterfront', 'Modern']
        }
        ]
        },
        'newly-renovated': {
        title: 'Newly Renovated',
        subtitle: 'Reimagined Elegance',
        description: 'Move-in ready designer homes combining established charm with contemporary high-end finishes and systems in the region.',
        icon: <Hammer className="text-luxury-gold" size={24} />,
        homes: [
        {
        id: 3,
        address: 'Historic Ghent Designer-Flip',
        location: 'Norfolk, VA',
        price: '$675,000',
        specs: { beds: 3, baths: 2.5, sqft: '2,400' },
        status: 'Completed 2026',
        image: '/images/investor-modern.jpg',
        tags: ['Designer Finishes', 'Historic']
        },
      {
        id: 4,
        address: 'Coastal Chic Bungalow',
        location: 'Virginia Beach, VA',
        price: '$545,000',
        specs: { beds: 3, baths: 2, sqft: '1,850' },
        status: 'Just Finished',
        image: '/images/hero-modern.jpg', // Placeholder for now
        tags: ['Open Concept', 'New Kitchen']
      }
    ]
  }
};

export default function CuratedCollection() {
  const { type } = useParams();
  const collection = CURATED_HOMES[type];

  if (!collection) return (
    <div className="min-h-screen flex items-center justify-center bg-cream">
      <div className="text-center">
        <h2 className="font-serif text-3xl mb-4">Collection Not Found</h2>
        <Link to="/" className="text-primary font-luxury-caps tracking-widest text-xs uppercase">Return Home</Link>
      </div>
    </div>
  );

  return (
    <div className="bg-cream min-h-screen pt-32 pb-24">
      <SEO 
        title={`${collection.title} | Curated by De'Shaun Austin`}
        description={collection.description}
      />
      
      <div className="max-w-7xl mx-auto px-6">
        <Link to="/" className="inline-flex items-center gap-2 text-slate-500 hover:text-midnight transition-colors font-luxury-caps text-[10px] tracking-widest uppercase mb-12">
          <ChevronLeft size={14} /> Back to Home
        </Link>

        <div className="max-w-3xl mb-20">
          <div className="flex items-center gap-3 mb-6">
            {collection.icon}
            <span className="font-luxury-caps text-[11px] tracking-[0.3em] uppercase text-slate-500 font-bold">{collection.subtitle}</span>
          </div>
          <h1 className="font-serif text-5xl md:text-6xl text-midnight mb-8 italic">
            {collection.title} <span className="not-italic text-slate-400">Inventory.</span>
          </h1>
          <p className="text-slate-600 text-lg font-light leading-relaxed">
            {collection.description} These properties have been hand-selected for their exceptional quality and investment value.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          {collection.homes.map((home) => (
            <div key={home.id} className="group bg-white rounded-3xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-500">
              <div className="aspect-[16/10] overflow-hidden relative">
                <img 
                  src={home.image} 
                  alt={home.address} 
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                />
                <div className="absolute top-6 left-6">
                  <span className="bg-midnight/80 backdrop-blur-md text-white px-4 py-2 rounded-full font-luxury-caps text-[9px] tracking-widest uppercase">
                    {home.status}
                  </span>
                </div>
              </div>
              <div className="p-8">
                <div className="flex justify-between items-start mb-6">
                  <div>
                    <h3 className="font-serif text-2xl text-midnight mb-1">{home.address}</h3>
                    <p className="flex items-center gap-1 text-slate-400 text-xs font-light">
                      <MapPin size={12} /> {home.location}
                    </p>
                  </div>
                  <p className="font-serif text-2xl text-primary">{home.price}</p>
                </div>

                <div className="grid grid-cols-3 gap-4 py-6 border-y border-slate-100 mb-8">
                  <div className="flex flex-col gap-1">
                    <span className="text-[10px] text-slate-400 uppercase tracking-widest flex items-center gap-1"><Bed size={12}/> Beds</span>
                    <span className="font-medium text-midnight">{home.specs.beds}</span>
                  </div>
                  <div className="flex flex-col gap-1">
                    <span className="text-[10px] text-slate-400 uppercase tracking-widest flex items-center gap-1"><Bath size={12}/> Baths</span>
                    <span className="font-medium text-midnight">{home.specs.baths}</span>
                  </div>
                  <div className="flex flex-col gap-1">
                    <span className="text-[10px] text-slate-400 uppercase tracking-widest flex items-center gap-1"><Ruler size={12}/> Sq Ft</span>
                    <span className="font-medium text-midnight">{home.specs.sqft}</span>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2 mb-8">
                  {home.tags.map(tag => (
                    <span key={tag} className="bg-slate-50 text-slate-500 px-3 py-1 rounded-md text-[9px] uppercase tracking-widest font-bold">
                      {tag}
                    </span>
                  ))}
                </div>

                <Link 
                  to="/contact" 
                  className="block w-full text-center bg-midnight text-white py-4 rounded-xl font-luxury-caps text-[10px] tracking-widest uppercase hover:bg-primary transition-all"
                >
                  Inquire for Details
                </Link>
              </div>
            </div>
          ))}
        </div>

        {/* Lead Capture Hook */}
        <div className="mt-32 bg-midnight rounded-[3rem] p-12 md:p-20 text-white text-center relative overflow-hidden">
          <div className="relative z-10">
            <h2 className="font-serif text-4xl mb-6 italic">Don't See What You're Looking For?</h2>
            <p className="text-slate-400 max-w-2xl mx-auto mb-10 font-light">
              I have access to several {collection.title.toLowerCase()} projects currently in the "pre-market" phase that are not listed here.
            </p>
            <Link to="/contact" className="inline-block bg-primary text-white px-10 py-4 rounded-xl font-luxury-caps text-[10px] tracking-widest uppercase hover:bg-white hover:text-midnight transition-all">
               Get VIP Access to Pre-Market Leads
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
