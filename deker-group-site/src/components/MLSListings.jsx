import React, { useState } from 'react';
import { ArrowUpRight, MapPin, Bed, Bath, Ruler, Sparkles, ChevronLeft, ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function MLSListings() {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const featuredProperty = {
    address: '1634 E Ocean View Avenue #2E',
    location: 'Norfolk, VA 23503',
    price: '$370,000',
    specs: { beds: 2, baths: 2, sqft: '1,042' },
    status: 'Just Listed',
    // Add your filenames here as you upload them
    images: [
      '/images/ocean-view.jpg', 
      '/images/oceanview-2.jpg',
      '/images/oceanview-3.jpg',
      '/images/oceanview-4.jpg',
      '/images/oceanview-5.jpg',
      '/images/oceanview-6.jpg',
      '/images/oceanview-7.jpg'
    ],
    tags: ['Waterfront Community', 'Ocean View', 'Recently Renovated'],
    listingUrl: 'https://deshaunaustin.missiontoserve.group/listing/10623744/1634-E-Ocean-View-Avenue-2E-Norfolk-VA-23503/'
  };

  const nextImage = (e) => {
    e.preventDefault();
    setCurrentImageIndex((prev) => (prev + 1) % featuredProperty.images.length);
  };

  const prevImage = (e) => {
    e.preventDefault();
    setCurrentImageIndex((prev) => (prev - 1 + featuredProperty.images.length) % featuredProperty.images.length);
  };

  return (
    <div className="space-y-24">
      {/* Featured Listing Highlight */}
      <div className="max-w-6xl mx-auto px-6">
        <div className="bg-white rounded-[3rem] overflow-hidden shadow-2xl border border-sand-dark flex flex-col lg:flex-row items-stretch group">
          
          {/* Image Carousel Section */}
          <div className="lg:w-3/5 relative overflow-hidden h-[450px] lg:h-auto">
            <a href={featuredProperty.listingUrl} target="_blank" rel="noopener noreferrer" className="block h-full">
              <img 
                src={featuredProperty.images[currentImageIndex]} 
                alt={`${featuredProperty.address} - View ${currentImageIndex + 1}`} 
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-1000"
                onError={(e) => {
                  // Fallback if ocean-view-1.jpg etc don't exist yet
                  if (currentImageIndex !== 0) setCurrentImageIndex(0);
                }}
              />
            </a>
            
            {/* Status Badge */}
            <div className="absolute top-8 left-8 z-20">
              <span className="bg-primary text-white px-6 py-2 rounded-full font-luxury-caps text-[10px] tracking-widest uppercase shadow-xl flex items-center gap-2">
                <Sparkles size={14} /> {featuredProperty.status}
              </span>
            </div>

            {/* Navigation Arrows */}
            <div className="absolute inset-y-0 left-0 right-0 flex items-center justify-between px-4 opacity-0 group-hover:opacity-100 transition-opacity z-20">
              <button 
                onClick={prevImage}
                className="bg-white/10 backdrop-blur-md hover:bg-white/30 text-white p-2 rounded-full transition-all"
              >
                <ChevronLeft size={24} />
              </button>
              <button 
                onClick={nextImage}
                className="bg-white/10 backdrop-blur-md hover:bg-white/30 text-white p-2 rounded-full transition-all"
              >
                <ChevronRight size={24} />
              </button>
            </div>

            {/* Photo Indicators (Dots) */}
            <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex gap-2 z-20">
              {featuredProperty.images.map((_, i) => (
                <div 
                  key={i} 
                  className={`w-1.5 h-1.5 rounded-full transition-all ${i === currentImageIndex ? 'bg-white w-4' : 'bg-white/40'}`}
                />
              ))}
            </div>
          </div>
          
          {/* Content Section */}
          <div className="lg:w-2/5 p-10 md:p-16 flex flex-col justify-center bg-cream/30">
            <div className="mb-8">
              <p className="font-luxury-caps text-luxury-gold text-[10px] tracking-[0.3em] uppercase mb-4 block">Featured Opportunity</p>
              <h3 className="font-serif text-4xl text-midnight mb-2">{featuredProperty.address}</h3>
              <p className="flex items-center gap-2 text-slate-400 font-light">
                <MapPin size={16} className="text-primary" /> {featuredProperty.location}
              </p>
            </div>

            <div className="grid grid-cols-3 gap-6 py-8 border-y border-sand-dark mb-10">
              <div className="text-center lg:text-left">
                <span className="text-[10px] text-slate-400 uppercase tracking-widest block mb-1">Beds</span>
                <span className="font-serif text-xl text-midnight">{featuredProperty.specs.beds}</span>
              </div>
              <div className="text-center lg:text-left">
                <span className="text-[10px] text-slate-400 uppercase tracking-widest block mb-1">Baths</span>
                <span className="font-serif text-xl text-midnight">{featuredProperty.specs.baths}</span>
              </div>
              <div className="text-center lg:text-left">
                <span className="text-[10px] text-slate-400 uppercase tracking-widest block mb-1">Sq Ft</span>
                <span className="font-serif text-xl text-midnight">{featuredProperty.specs.sqft}</span>
              </div>
            </div>

            <div className="flex flex-wrap gap-2 mb-10">
              {featuredProperty.tags.map(tag => (
                <span key={tag} className="bg-white/80 border border-sand-dark text-slate-500 px-4 py-1 rounded-full text-[9px] uppercase tracking-widest font-bold">
                  {tag}
                </span>
              ))}
            </div>

            <div className="flex flex-col gap-4">
              <a 
                href={featuredProperty.listingUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-midnight text-white px-8 py-5 rounded-xl font-luxury-caps text-[11px] tracking-widest uppercase hover:bg-primary transition-all text-center flex items-center justify-center gap-2 shadow-xl"
              >
                Full Property Details <ArrowUpRight size={14} />
              </a>
              <Link 
                to="/contact" 
                className="bg-white border border-sand-dark text-midnight px-8 py-5 rounded-xl font-luxury-caps text-[11px] tracking-widest uppercase hover:bg-sand transition-all text-center"
              >
                Schedule Private Tour
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Secondary Selection Link */}
      <div className="text-center py-20 bg-sand/30 rounded-[3rem] border border-dashed border-sand-dark max-w-4xl mx-auto px-6">
        <h3 className="font-serif text-2xl text-midnight mb-4 italic">More Exclusive <span className="not-italic">Selection Coming Soon</span></h3>
        <p className="text-slate-500 font-light mb-8 leading-relaxed max-w-lg mx-auto">
          We are currently vetting additional high-performance listings. 
          Use our interactive platform to browse all active inventory in the region.
        </p>
        <a 
          href="https://deshaunaustin.missiontoserve.group/index.php?advanced=1&rtype=map" 
          target="_blank" 
          className="inline-flex text-primary font-luxury-caps text-[10px] tracking-widest uppercase border-b border-primary/30 pb-1 hover:border-primary transition-all items-center gap-2"
        >
          Explore All Hampton Roads Listings <ArrowUpRight size={14} />
        </a>
      </div>
    </div>
  );
}
