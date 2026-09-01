import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { ThemeProvider, useTheme } from './context/ThemeContext';
import { LanguageProvider } from './context/LanguageContext';
import { AdminAuthProvider } from './context/AdminAuthContext';
import { UserAuthProvider } from './context/UserAuthContext';
import { RealtimeProvider } from './context/RealtimeContext';
import { UserAuthModal } from './components/modals/UserAuthModal';
import { Navbar } from './components/common/Navbar';
import { Footer } from './components/common/Footer';
import { Home } from './pages/Home';
import { Sheep } from './pages/Sheep';
import { Goats } from './pages/Goats';
import { Cows } from './pages/Cows';
import { AnimalDetails } from './pages/AnimalDetails';
import { Services } from './pages/Services';
import { DeliveryServicePage } from './pages/services/DeliveryServicePage';
import { SlaughterPrepServicePage } from './pages/services/SlaughterPrepServicePage';
import { CeremonyServicePage } from './pages/services/CeremonyServicePage';
import { MeatByKgServicePage } from './pages/services/MeatByKgServicePage';
import { FreshSheepServicePage } from './pages/services/FreshSheepServicePage';
import { About } from './pages/About';
import { Contact } from './pages/Contact';
import { Admin } from './pages/Admin';
import { NotFound } from './pages/NotFound';

// Auto scroll-to-top on route navigation
const ScrollToTop: React.FC = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' as ScrollBehavior });
  }, [pathname]);

  return null;
};

const AppContent: React.FC = () => {
  const { theme } = useTheme();
  const isDark = theme === 'design7';

  return (
    <div
      className={`min-h-screen flex flex-col transition-colors duration-300 ${
        isDark ? 'bg-[#1B1208] text-[#F4E8D0]' : 'bg-[#FAF7F0] text-[#241A12]'
      }`}
    >
      <ScrollToTop />
      <Navbar />
      <UserAuthModal />
      <main className="flex-1">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/sheep" element={<Sheep />} />
          <Route path="/goats" element={<Goats />} />
          <Route path="/cows" element={<Cows />} />
          <Route path="/animals/:id" element={<AnimalDetails />} />
          
          {/* Main Services Overview (Editorial Layout) */}
          <Route path="/services" element={<Services />} />

          {/* 5 Distinct Dedicated Service Dashboards */}
          <Route path="/services/delivery" element={<DeliveryServicePage />} />
          <Route path="/services/slaughter-prep" element={<SlaughterPrepServicePage />} />
          <Route path="/services/events-ceremonies" element={<CeremonyServicePage />} />
          <Route path="/services/meat-by-kg" element={<MeatByKgServicePage />} />
          <Route path="/services/fresh-slaughtered-sheep" element={<FreshSheepServicePage />} />

          <Route path="/about" element={<About />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/admin" element={<Admin />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>
      <Footer />
    </div>
  );
};

export const App: React.FC = () => {
  return (
    <ThemeProvider>
      <LanguageProvider>
        <AdminAuthProvider>
          <UserAuthProvider>
            <RealtimeProvider>
              <Router>
                <AppContent />
              </Router>
            </RealtimeProvider>
          </UserAuthProvider>
        </AdminAuthProvider>
      </LanguageProvider>
    </ThemeProvider>
  );
};

export default App;
