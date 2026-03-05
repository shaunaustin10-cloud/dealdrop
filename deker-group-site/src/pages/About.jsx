import React from 'react';
import { Link } from 'react-router-dom';
import { Award, Shield, Zap, TrendingUp, Users, MapPin } from 'lucide-react';
import SEO from '../components/SEO';

export default function About() {
  return (
    <div className="bg-sand min-h-screen">
      <SEO 
        title="About De'Shaun Austin | NextHome Mission to Serve" 
        description="Learn about De'Shaun Austin and the mission-driven approach to luxury and investment real estate in Hampton Roads."
      />

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 px-6">
        <div className="max-w-7xl mx-auto">
          <span className="font-luxury-caps text-primary mb-4 block tracking-[0.3em]">The Philosophy</span>
          <h1 className="font-serif text-6xl md:text-8xl text-midnight mb-12 italic">
            Mission to <span className="not-italic text-primary">Serve.</span>
          </h1>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div className="relative">
              <div className="aspect-[4/5] rounded-3xl overflow-hidden shadow-2xl">
                <img 
                  src="/images/headshot.jpg" 
                  alt="De'Shaun Austin" 
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="absolute -bottom-8 -right-8 bg-white p-8 rounded-3xl shadow-xl hidden md:block border border-sand-dark">
                <p className="font-serif text-4xl text-midnight mb-1">12+</p>
                <p className="font-luxury-caps text-[10px] text-slate-400 tracking-widest uppercase">Years Experience</p>
              </div>
            </div>
            
            <div className="space-y-8">
              <h2 className="font-serif text-4xl text-midnight leading-tight">
                Redefining the standard of service in <span className="italic">Hampton Roads.</span>
              </h2>
              <div className="space-y-6 text-slate-600 text-lg leading-relaxed font-light">
                <p>
                  Real estate isn't just about property; it's about people, legacy, and the mission to serve. At NextHome Mission to Serve, we've built our reputation on a foundation of data-driven insights and a personalized, boutique approach to every transaction.
                </p>
                <p>
                  Led by De'Shaun Austin, our team specializes in bridging the gap between luxury residential living and high-yield investment opportunities. We don't just find you a house; we help you secure your future.
                </p>
              </div>
              <div className="pt-4">
                <Link to="/contact" className="bg-midnight text-white px-10 py-4 rounded-xl font-luxury-caps text-[11px] tracking-widest hover:bg-primary transition-all uppercase">
                  Schedule a Consultation
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Core Values */}
      <section className="bg-white py-32 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-20">
            <h2 className="font-serif text-5xl text-midnight mb-4 italic">Our Core <span className="not-italic">Commitment</span></h2>
            <div className="w-24 h-1 bg-primary mx-auto"></div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            {[
              {
                icon: <Shield className="text-primary" size={32} />,
                title: "Integrity First",
                desc: "Every recommendation we make is backed by transparency and your best interest. No exceptions."
              },
              {
                icon: <TrendingUp className="text-primary" size={32} />,
                title: "Data-Driven",
                desc: "We leverage advanced market analytics to ensure our clients always have the competitive edge."
              },
              {
                icon: <Zap className="text-primary" size={32} />,
                title: "Mission Focused",
                desc: "Our 'Mission to Serve' isn't just a name—it's the standard we live by every single day."
              }
            ].map((value, i) => (
              <div key={i} className="p-10 bg-sand rounded-[2rem] border border-sand-dark hover:border-primary transition-all group">
                <div className="mb-6 group-hover:scale-110 transition-transform duration-500">{value.icon}</div>
                <h3 className="font-serif text-2xl text-midnight mb-4">{value.title}</h3>
                <p className="text-slate-500 font-light leading-relaxed">{value.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats / Proof */}
      <section className="bg-midnight py-32 px-6 text-white overflow-hidden relative">
        <div className="absolute top-0 right-0 w-96 h-96 bg-primary/10 rounded-full blur-[100px] -mr-48 -mt-48"></div>
        <div className="max-w-7xl mx-auto relative z-10">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-12 text-center">
            <div>
              <p className="font-serif text-6xl text-primary mb-2">$140M+</p>
              <p className="font-luxury-caps text-[10px] tracking-widest text-slate-400">Career Sales Volume</p>
            </div>
            <div>
              <p className="font-serif text-6xl text-primary mb-2">500+</p>
              <p className="font-luxury-caps text-[10px] tracking-widest text-slate-400">Happy Families served</p>
            </div>
            <div>
              <p className="font-serif text-6xl text-primary mb-2">98%</p>
              <p className="font-luxury-caps text-[10px] tracking-widest text-slate-400">List-to-Sale Ratio</p>
            </div>
            <div>
              <p className="font-serif text-6xl text-primary mb-2">12+</p>
              <p className="font-luxury-caps text-[10px] tracking-widest text-slate-400">Years of Authority</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-32 px-6">
        <div className="max-w-5xl mx-auto bg-white rounded-[3rem] p-16 md:p-24 text-center border border-sand-dark relative shadow-2xl">
          <h2 className="font-serif text-5xl md:text-7xl text-midnight mb-8">
            Ready to experience <br/>
            <span className="italic text-primary">the difference?</span>
          </h2>
          <p className="text-slate-500 text-lg font-light mb-12 max-w-2xl mx-auto">
            Whether you are buying your first home or expanding your investment portfolio, we are here to serve your mission.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/contact" className="bg-midnight text-white px-12 py-5 rounded-xl font-luxury-caps text-[11px] tracking-widest hover:bg-primary transition-all uppercase">
              Get in Touch
            </Link>
            <Link to="/buy" className="bg-sand text-midnight border border-sand-dark px-12 py-5 rounded-xl font-luxury-caps text-[11px] tracking-widest hover:bg-white transition-all uppercase">
              View Properties
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
