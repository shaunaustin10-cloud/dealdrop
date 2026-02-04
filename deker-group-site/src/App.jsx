import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Home from './pages/Home';
import Area from './pages/Area';

import Buyer from './pages/Buyer';
import Seller from './pages/Seller';

export default function App() {
  return (
    <Router>
      <div className="min-h-screen flex flex-col bg-sand selection:bg-primary/30">
        <Navbar />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/area/:slug" element={<Area />} />
          <Route path="/buy" element={<Buyer />} />
          <Route path="/sell" element={<Seller />} />
        </Routes>
        <Footer />
      </div>
    </Router>
  );
}