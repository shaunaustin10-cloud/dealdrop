import React, { useState } from 'react';
import { ChevronRight, ChevronLeft, Check, Sparkles, Home, Coffee, Anchor, Trees, Mail, User, Phone } from 'lucide-react';
import { db } from '../firebaseConfig';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';

const QUESTIONS = [
  {
    key: 'vibe',
    text: "How do you prefer to start your Saturday morning?",
    options: [
      { label: "A quiet walk through a historic neighborhood", val: 'historic', icon: <Trees size={18} /> },
      { label: "Coffee at a bustling downtown cafe", val: 'urban', icon: <Coffee size={18} /> },
      { label: "Sunrise walk on the beach or boardwalk", val: 'beach', icon: <Anchor size={18} /> },
      { label: "Working out in a private home gym", val: 'suburban', icon: <Home size={18} /> }
    ]
  },
  {
    key: 'architecture',
    text: "Which architectural style speaks to you most?",
    options: [
      { label: "Historic Victorian or Colonial", val: 'historic' },
      { label: "Sleek Modern Glass & Steel", val: 'urban' },
      { label: "Coastal Contemporary with big decks", val: 'beach' },
      { label: "Traditional Craftsman with a large yard", val: 'suburban' }
    ]
  },
  {
    key: 'priority',
    text: "What is your #1 priority in a new location?",
    options: [
      { label: "Walkability to restaurants and shops", val: 'urban' },
      { label: "Top-rated school districts", val: 'suburban' },
      { label: "Waterfront access or ocean views", val: 'beach' },
      { label: "Preserving history and character", val: 'historic' }
    ]
  }
];

export default function LifestyleQuiz() {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState({});
  const [showForm, setShowShowForm] = useState(false);
  const [formData, setFormData] = useState({ name: '', email: '', phone: '' });
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleOptionSelect = (key, value) => {
    setAnswers(prev => ({ ...prev, [key]: value }));
    if (step < QUESTIONS.length - 1) {
      setStep(prev => prev + 1);
    } else {
      setShowShowForm(true);
    }
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    try {
      await addDoc(collection(db, 'leads'), {
        ...formData,
        quizResults: answers,
        source: 'Lifestyle Match Quiz',
        timestamp: serverTimestamp()
      });
      setIsSubmitted(true);
    } catch (err) {
      console.error("Quiz submission error:", err);
    }
  };

  if (isSubmitted) {
    return (
      <div className="bg-white rounded-[3rem] p-12 md:p-20 text-center shadow-2xl border border-sand-dark max-w-4xl mx-auto">
        <div className="w-20 h-20 bg-emerald-50 text-emerald-500 rounded-full flex items-center justify-center mx-auto mb-8">
          <Check size={40} />
        </div>
        <h3 className="font-serif text-4xl text-midnight mb-4">Your Matches are Ready</h3>
        <p className="text-slate-500 font-light mb-8 max-w-sm mx-auto">
          We've analyzed your lifestyle profile. A curated list of the top 3 Hampton Roads neighborhoods matching your vibe has been sent to your inbox.
        </p>
        <button onClick={() => setIsSubmitted(false)} className="text-primary font-luxury-caps text-[10px] tracking-widest uppercase border-b border-primary pb-1">Retake Quiz</button>
      </div>
    );
  }

  return (
    <section className="py-32 px-6 bg-sand">
      <div className="max-w-4xl mx-auto">
        {!showForm ? (
          <div className="bg-white rounded-[3rem] p-8 md:p-16 shadow-2xl border border-sand-dark relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl -mr-32 -mt-32"></div>
            
            <div className="relative z-10">
              <div className="flex items-center gap-2 text-primary mb-6">
                <Sparkles size={20} />
                <span className="font-luxury-caps text-[10px] tracking-[0.3em] uppercase font-bold">Discover Your Place</span>
              </div>
              
              <div className="mb-12">
                <div className="flex gap-2 mb-8">
                  {QUESTIONS.map((_, idx) => (
                    <div key={idx} className={`h-1 flex-1 rounded-full transition-all duration-500 ${idx <= step ? 'bg-primary' : 'bg-sand-dark'}`} />
                  ))}
                </div>
                <h2 className="font-serif text-4xl md:text-5xl text-midnight mb-4 italic">
                  Which neighborhood <span className="not-italic text-primary">fits your lifestyle?</span>
                </h2>
                <p className="text-slate-400 font-light text-lg">{QUESTIONS[step].text}</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {QUESTIONS[step].options.map((opt, i) => (
                  <button
                    key={i}
                    onClick={() => handleOptionSelect(QUESTIONS[step].key, opt.val)}
                    className="flex items-center justify-between p-6 bg-sand hover:bg-white border border-sand-dark hover:border-primary hover:shadow-xl transition-all rounded-2xl group text-left"
                  >
                    <span className="text-midnight font-medium">{opt.label}</span>
                    <div className="text-slate-300 group-hover:text-primary transition-colors">
                      {opt.icon || <ChevronRight size={20} />}
                    </div>
                  </button>
                ))}
              </div>

              {step > 0 && (
                <button 
                  onClick={() => setStep(prev => prev - 1)}
                  className="mt-8 flex items-center gap-2 text-slate-400 hover:text-midnight transition-colors text-xs font-luxury-caps tracking-widest uppercase"
                >
                  <ChevronLeft size={14} /> Back
                </button>
              )}
            </div>
          </div>
        ) : (
          <div className="bg-midnight rounded-[3rem] p-8 md:p-16 shadow-2xl text-white relative overflow-hidden">
            <div className="absolute top-0 right-0 w-96 h-96 bg-primary/10 rounded-full blur-[100px] -mr-48 -mt-48"></div>
            
            <div className="relative z-10 max-w-lg mx-auto text-center">
              <h3 className="font-serif text-4xl mb-6 italic">Almost <span className="not-italic">There.</span></h3>
              <p className="text-slate-400 font-light mb-10 leading-relaxed">
                Enter your details below to receive your personalized **Lifestyle Match Report** and a curated list of active properties in your matched areas.
              </p>

              <form onSubmit={handleFormSubmit} className="space-y-4">
                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                  <input required placeholder="Full Name" className="w-full bg-white/5 border border-white/10 rounded-xl px-12 py-4 text-sm focus:outline-none focus:border-primary transition-all" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
                </div>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                  <input required type="email" placeholder="Email Address" className="w-full bg-white/5 border border-white/10 rounded-xl px-12 py-4 text-sm focus:outline-none focus:border-primary transition-all" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} />
                </div>
                <div className="relative">
                  <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                  <input required type="tel" placeholder="Phone Number" className="w-full bg-white/5 border border-white/10 rounded-xl px-12 py-4 text-sm focus:outline-none focus:border-primary transition-all" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} />
                </div>
                <button type="submit" className="w-full bg-primary text-white py-5 rounded-xl font-luxury-caps text-[11px] tracking-widest hover:bg-white hover:text-midnight transition-all uppercase shadow-xl shadow-primary/20">
                  Reveal My Matches
                </button>
              </form>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
