import React, { useState } from 'react';
import { Mail, Phone, MapPin, Send, CheckCircle2, MessageSquare, Clock } from 'lucide-react';
import { db } from '../firebaseConfig';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import SEO from '../components/SEO';

export default function Contact() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: 'General Inquiry',
    message: ''
  });
  const [status, setStatus] = useState('idle'); // idle, loading, success, error

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus('loading');
    
    try {
      await addDoc(collection(db, 'leads'), {
        ...formData,
        source: 'Deker Group Site - Contact Page',
        timestamp: serverTimestamp()
      });
      setStatus('success');
      setFormData({ name: '', email: '', phone: '', subject: 'General Inquiry', message: '' });
    } catch (error) {
      console.error("Error saving contact lead:", error);
      setStatus('error');
    }
  };

  return (
    <div className="bg-sand min-h-screen">
      <SEO 
        title="Contact De'Shaun Austin | Luxury Real Estate Concierge" 
        description="Connect with De'Shaun Austin for personalized real estate services in Norfolk, Virginia Beach, and Chesapeake."
      />

      <section className="pt-32 pb-20 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-20">
            {/* Contact Info Side */}
            <div className="space-y-12">
              <div>
                <span className="font-luxury-caps text-primary mb-4 block tracking-[0.3em]">Get in Touch</span>
                <h1 className="font-serif text-6xl md:text-7xl text-midnight mb-8 italic">
                  Let's start a <span className="not-italic text-primary">conversation.</span>
                </h1>
                <p className="text-slate-500 text-lg font-light leading-relaxed max-w-md">
                  Whether you're looking to list a luxury estate or scale your investment portfolio, our team is ready to provide the expertise you deserve.
                </p>
              </div>

              <div className="grid gap-8">
                <div className="flex items-start gap-6 group">
                  <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-primary shadow-sm border border-sand-dark group-hover:bg-primary group-hover:text-white transition-all duration-500">
                    <Phone size={20} />
                  </div>
                  <div>
                    <p className="font-luxury-caps text-[10px] text-slate-400 tracking-widest mb-1 uppercase">Direct Line</p>
                    <p className="font-serif text-xl text-midnight">(757) 912-1644</p>
                  </div>
                </div>

                <div className="flex items-start gap-6 group">
                  <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-primary shadow-sm border border-sand-dark group-hover:bg-primary group-hover:text-white transition-all duration-500">
                    <Mail size={20} />
                  </div>
                  <div>
                    <p className="font-luxury-caps text-[10px] text-slate-400 tracking-widest mb-1 uppercase">Email Address</p>
                    <p className="font-serif text-xl text-midnight">shaunaustin10@gmail.com</p>
                  </div>
                </div>

                <div className="flex items-start gap-6 group">
                  <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-primary shadow-sm border border-sand-dark group-hover:bg-primary group-hover:text-white transition-all duration-500">
                    <MapPin size={20} />
                  </div>
                  <div>
                    <p className="font-luxury-caps text-[10px] text-slate-400 tracking-widest mb-1 uppercase">Primary Area</p>
                    <p className="font-serif text-xl text-midnight">Hampton Roads, Virginia</p>
                  </div>
                </div>
              </div>

              <div className="p-8 bg-midnight rounded-3xl text-white relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-primary/20 rounded-full blur-2xl -mr-16 -mt-16"></div>
                <div className="relative z-10 flex items-center gap-4 mb-4">
                  <Clock size={20} className="text-primary" />
                  <p className="font-luxury-caps text-[10px] tracking-[0.2em] uppercase">Concierge Hours</p>
                </div>
                <p className="text-slate-400 text-sm leading-relaxed relative z-10">
                  We are available for private consultations Monday through Saturday. All inquiries are typically answered within 2 business hours.
                </p>
              </div>
            </div>

            {/* Form Side */}
            <div className="bg-white rounded-[3rem] p-8 md:p-12 shadow-2xl border border-sand-dark relative">
              {status === 'success' ? (
                <div className="h-full flex flex-col items-center justify-center text-center space-y-6 py-20">
                  <div className="w-20 h-20 bg-emerald-50 text-emerald-500 rounded-full flex items-center justify-center">
                    <CheckCircle2 size={40} />
                  </div>
                  <h3 className="font-serif text-3xl text-midnight">Message Received</h3>
                  <p className="text-slate-500 font-light max-w-sm">
                    Thank you for reaching out. We have received your inquiry and a member of our team will contact you shortly.
                  </p>
                  <button 
                    onClick={() => setStatus('idle')}
                    className="text-primary font-luxury-caps text-[10px] tracking-widest uppercase border-b border-primary pb-1 hover:text-midnight hover:border-midnight transition-colors"
                  >
                    Send another message
                  </button>
                </div>
              ) : (
                <>
                  <div className="mb-10">
                    <h3 className="font-serif text-3xl text-midnight mb-2">Send a Message</h3>
                    <p className="text-slate-400 text-sm font-light">Tell us about your real estate goals.</p>
                  </div>

                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <label className="font-luxury-caps text-[10px] text-slate-400 tracking-widest uppercase ml-1">Full Name</label>
                        <input 
                          required
                          type="text"
                          className="w-full bg-sand border border-sand-dark rounded-xl px-6 py-4 text-sm focus:outline-none focus:border-primary transition-all"
                          value={formData.name}
                          onChange={(e) => setFormData({...formData, name: e.target.value})}
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="font-luxury-caps text-[10px] text-slate-400 tracking-widest uppercase ml-1">Phone Number</label>
                        <input 
                          required
                          type="tel"
                          className="w-full bg-sand border border-sand-dark rounded-xl px-6 py-4 text-sm focus:outline-none focus:border-primary transition-all"
                          value={formData.phone}
                          onChange={(e) => setFormData({...formData, phone: e.target.value})}
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="font-luxury-caps text-[10px] text-slate-400 tracking-widest uppercase ml-1">Email Address</label>
                      <input 
                        required
                        type="email"
                        className="w-full bg-sand border border-sand-dark rounded-xl px-6 py-4 text-sm focus:outline-none focus:border-primary transition-all"
                        value={formData.email}
                        onChange={(e) => setFormData({...formData, email: e.target.value})}
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="font-luxury-caps text-[10px] text-slate-400 tracking-widest uppercase ml-1">I am interested in...</label>
                      <select 
                        className="w-full bg-sand border border-sand-dark rounded-xl px-6 py-4 text-sm focus:outline-none focus:border-primary transition-all appearance-none"
                        value={formData.subject}
                        onChange={(e) => setFormData({...formData, subject: e.target.value})}
                      >
                        <option>General Inquiry</option>
                        <option>Buying a Home</option>
                        <option>Selling a Property</option>
                        <option>Investment Opportunities</option>
                        <option>New Construction</option>
                      </select>
                    </div>

                    <div className="space-y-2">
                      <label className="font-luxury-caps text-[10px] text-slate-400 tracking-widest uppercase ml-1">Message</label>
                      <textarea 
                        rows="4"
                        className="w-full bg-sand border border-sand-dark rounded-xl px-6 py-4 text-sm focus:outline-none focus:border-primary transition-all resize-none"
                        value={formData.message}
                        onChange={(e) => setFormData({...formData, message: e.target.value})}
                      ></textarea>
                    </div>

                    <button 
                      disabled={status === 'loading'}
                      type="submit"
                      className="w-full bg-midnight text-white py-5 rounded-xl font-luxury-caps text-[11px] tracking-widest hover:bg-primary transition-all shadow-xl shadow-midnight/10 flex items-center justify-center gap-3 uppercase"
                    >
                      {status === 'loading' ? 'Sending...' : 'Send Message'}
                      {status !== 'loading' && <Send size={14} />}
                    </button>
                  </form>
                </>
              )}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
