import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider, ProtectedRoute } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import MainApp from './MainApp';
import LoginPage from './components/LoginPage';
import RegisterPage from './components/RegisterPage';
import LandingPage from './components/LandingPage';
import TermsPage from './components/TermsPage'; 
import PrivacyPage from './components/PrivacyPage'; 
import MarketplacePage from './components/MarketplacePage';
import PublicDealPage from './components/PublicDealPage';

export default function App() {
  return (
    <BrowserRouter>
      <ThemeProvider>
        <AuthProvider>
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/marketplace" element={<MarketplacePage />} />
            <Route path="/deal/:uid/:id" element={<PublicDealPage />} />
            <Route path="/deal/:id" element={<PublicDealPage />} />
            <Route path="/dashboard/*" element={
              <ProtectedRoute>
                <MainApp />
              </ProtectedRoute>
            } />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/terms" element={<TermsPage />} /> 
            <Route path="/privacy" element={<PrivacyPage />} /> 
          </Routes>
        </AuthProvider>
      </ThemeProvider>
    </BrowserRouter>
  );
}
