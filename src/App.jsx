import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider, ProtectedRoute } from './context/AuthContext';
import MainApp from './MainApp';
import LoginPage from './components/LoginPage';
import RegisterPage from './components/RegisterPage';
import LandingPage from './components/LandingPage';
import TermsPage from './components/TermsPage'; 
import PrivacyPage from './components/PrivacyPage'; 
import MarketplacePage from './components/MarketplacePage';

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/dashboard" element={
            <ProtectedRoute>
              <MainApp />
            </ProtectedRoute>
          } />
          <Route path="/marketplace" element={<MarketplacePage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/terms" element={<TermsPage />} /> 
          <Route path="/privacy" element={<PrivacyPage />} /> 
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}
