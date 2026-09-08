import React, { useEffect, Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { ThemeProvider, useTheme } from './context/ThemeContext';
import { LanguageProvider } from './context/LanguageContext';
import { AdminAuthProvider, useAdminAuth } from './context/AdminAuthContext';
import { UserAuthProvider } from './context/UserAuthContext';
import { RealtimeProvider } from './context/RealtimeContext';
import { UserAuthModal } from './components/modals/UserAuthModal';
import { Navbar } from './components/common/Navbar';
import { Footer } from './components/common/Footer';
// Primary storefront catalog routes are eagerly loaded for instant navigation without Suspense flashes or CLS
import { Home } from './pages/Home';
import { Sheep } from './pages/Sheep';
import { Goats } from './pages/Goats';
import { Cows } from './pages/Cows';

// Secondary storefront and dashboard routes are lazy-loaded on-demand for low 3G initial payload
const PackageBuilder = lazy(() => import('./pages/PackageBuilder').then(m => ({ default: m.PackageBuilder })));
const Services       = lazy(() => import('./pages/Services').then(m => ({ default: m.Services })));
const About          = lazy(() => import('./pages/About').then(m => ({ default: m.About })));

// Secondary and dashboard routes are lazy-loaded on-demand
const AnimalDetails  = lazy(() => import('./pages/AnimalDetails').then(m => ({ default: m.AnimalDetails })));
const MyPackages     = lazy(() => import('./pages/MyPackages').then(m => ({ default: m.MyPackages })));
const MyReservations = lazy(() => import('./pages/MyReservations').then(m => ({ default: m.MyReservations })));
const Contact        = lazy(() => import('./pages/Contact').then(m => ({ default: m.Contact })));
const Admin          = lazy(() => import('./pages/Admin').then(m => ({ default: m.Admin })));
const NotFound       = lazy(() => import('./pages/NotFound').then(m => ({ default: m.NotFound })));

// Minimal loading spinner shown while a lazy route chunk downloads
const PageLoader: React.FC = () => (
  <div className="flex items-center justify-center min-h-[40vh]">
    <div className="w-8 h-8 rounded-full border-2 border-[#C58A3A] border-t-transparent animate-spin" />
  </div>
);

// Auto scroll-to-top on route navigation and page refresh
const ScrollToTop: React.FC = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    if ('scrollRestoration' in history) {
      history.scrollRestoration = 'manual';
    }
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' as ScrollBehavior });
  }, [pathname]);

  useEffect(() => {
    if ('scrollRestoration' in history) {
      history.scrollRestoration = 'manual';
    }
    const scrollToTopImmediate = () => {
      window.scrollTo(0, 0);
      document.documentElement.scrollTop = 0;
      document.body.scrollTop = 0;
    };

    scrollToTopImmediate();
    const rafId = requestAnimationFrame(scrollToTopImmediate);
    const timeoutId = setTimeout(scrollToTopImmediate, 30);

    window.addEventListener('pageshow', scrollToTopImmediate);
    window.addEventListener('load', scrollToTopImmediate);

    return () => {
      cancelAnimationFrame(rafId);
      clearTimeout(timeoutId);
      window.removeEventListener('pageshow', scrollToTopImmediate);
      window.removeEventListener('load', scrollToTopImmediate);
    };
  }, []);

  return null;
};

const AppContent: React.FC = () => {
  const { theme } = useTheme();
  const isDark = theme === 'design7';
  const location = useLocation();
  const { isAuthenticated: isAdminAuth } = useAdminAuth();

  const isAdminPage = location.pathname.startsWith('/admin');
  const showCustomerChrome = !isAdminAuth && !isAdminPage;

  // Cleanup transition flags once cleanly on customer storefront pages
  useEffect(() => {
    if (!isAdminPage) {
      sessionStorage.removeItem('jonny_admin_logging_out');
      sessionStorage.removeItem('jonny_admin_signing_in');
    }
  }, [isAdminPage]);

  // Strict Admin Isolation: When authenticated as Admin, ONLY the Admin Dashboard is displayed.
  // Any attempt to navigate back or access customer storefront routes is immediately redirected to /admin.
  if (isAdminAuth && !isAdminPage) {
    return <Navigate to="/admin" replace />;
  }

  return (
    <div
      className={`min-h-screen flex flex-col transition-colors duration-300 ${
        isDark ? 'bg-[#1B1208] text-[#F4E8D0]' : 'bg-[#FAF7F0] text-[#241A12]'
      }`}
    >
      <ScrollToTop />
      {showCustomerChrome && <Navbar />}
      {showCustomerChrome && <UserAuthModal />}
      <main className="flex-1">
        <Suspense fallback={<PageLoader />}>
          {isAdminAuth ? (
            <Routes>
              <Route path="/admin" element={<Admin />} />
              <Route path="*" element={<Navigate to="/admin" replace />} />
            </Routes>
          ) : (
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/sheep" element={<Sheep />} />
              <Route path="/goats" element={<Goats />} />
              <Route path="/cows" element={<Cows />} />
              <Route path="/animals/:id" element={<AnimalDetails />} />

              {/* Packages & Custom Builder */}
              <Route path="/packages" element={<PackageBuilder />} />
              <Route path="/my-packages" element={<MyPackages />} />
              <Route path="/my-reservations" element={<MyReservations />} />
              <Route path="/my-orders" element={<MyReservations />} />

              {/* Main Services Page (No redundant form pages) */}
              <Route path="/services" element={<Services />} />
              <Route path="/services/*" element={<Navigate to="/services" replace />} />

              <Route path="/about" element={<About />} />
              <Route path="/contact" element={<Contact />} />
              <Route path="/admin" element={<Admin />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          )}
        </Suspense>
      </main>
      {showCustomerChrome && <Footer />}
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
