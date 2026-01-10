import React, { useState, useEffect } from 'react';

const CookieConsent = () => {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem('cookieConsent');
    if (!consent) {
      setShow(true);
    }
  }, []);

  const handleAccept = () => {
    localStorage.setItem('cookieConsent', 'true');
    setShow(false);
  };

  if (!show) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-slate-900 border-t border-slate-800 p-4 md:p-6 z-50 animate-slide-up shadow-2xl">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="text-slate-300 text-sm md:text-base">
          <p className="font-bold text-white mb-1">We value your privacy</p>
          <p>
            We use cookies to enhance your browsing experience, serve personalized content, and analyze our traffic. 
            By clicking &quot;Accept&quot;, you consent to our use of cookies. 
            Read our <a href="/privacy" className="text-emerald-400 hover:underline">Privacy Policy</a>.
          </p>
        </div>
        <div className="flex gap-3 shrink-0">
          <button 
            onClick={handleAccept}
            className="bg-emerald-500 hover:bg-emerald-400 text-white font-bold py-2 px-6 rounded-lg transition-colors text-sm"
          >
            Accept
          </button>
        </div>
      </div>
    </div>
  );
};

export default CookieConsent;
