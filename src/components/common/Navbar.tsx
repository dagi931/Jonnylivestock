import React, { useState, useEffect } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import { business } from '../../config/business';
import { ThemeToggle } from './ThemeToggle';
import { LanguageToggle } from './LanguageToggle';
import { useUserAuth } from '../../context/UserAuthContext';
import { useAdminAuth } from '../../context/AdminAuthContext';
import {
  Menu,
  X,
  ChevronRight,
  User,
  LogOut,
  LogIn,
  Gift,
  Bookmark,
  ShoppingBag
} from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import { useLanguage } from '../../context/LanguageContext';

export const Navbar: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const location = useLocation();
  const { theme } = useTheme();
  const { t, isAmharic } = useLanguage();
  const { user, isAuthenticated, logout: userLogout, openAuthModal } = useUserAuth();
  const { logout: adminLogout } = useAdminAuth();
  const isDark = theme === 'design7';

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 15);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    setIsOpen(false);
    setUserDropdownOpen(false);
  }, [location.pathname]);

  const handleFullLogout = () => {
    setUserDropdownOpen(false);
    setIsOpen(false);
    sessionStorage.setItem('jonny_admin_logging_out', '1');
    localStorage.removeItem('jonny_user_token');
    localStorage.removeItem('jonny_user_profile');
    localStorage.removeItem('jonny_admin_token');
    localStorage.removeItem('jonny_admin_user');
    userLogout();
    adminLogout();
    window.location.replace('/');
  };

  interface NavLinkItem {
    name: string;
    path: string;
    isSpecial?: boolean;
  }

  // Public navigation links
  const navLinks: NavLinkItem[] = [
    { name: t.nav.home, path: '/' },
    { name: t.nav.sheep, path: '/sheep' },
    { name: t.nav.goats, path: '/goats' },
    { name: t.nav.cows, path: '/cows' },
    {
      name: isAmharic ? 'የበዓል ጥቅሎች' : 'Packages',
      path: '/packages',
      isSpecial: true
    },
    { name: t.nav.services, path: '/services' },
    { name: t.nav.about, path: '/about' },
    { name: t.nav.contact, path: '/contact' }
  ];

  return (
    <header
      className={`sticky top-0 z-50 transition-all duration-200 ${
        scrolled
          ? isDark
            ? 'bg-[#1B1208]/95 backdrop-blur-md shadow-lg border-b border-[#4A2C16]/80'
            : 'bg-[#FAF7F0]/95 backdrop-blur-md shadow-sm border-b border-[#E4D4BC]'
          : isDark
            ? 'bg-[#1B1208] border-b border-[#4A2C16]/50'
            : 'bg-[#FAF7F0] border-b border-[#E4D4BC]/60'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-18">
          {/* Left: Brand Logo */}
          <Link
            to="/"
            className="flex items-center gap-2.5 sm:gap-3 group focus:outline-none focus-visible:ring-2 focus-visible:ring-[#C58A3A] rounded-lg shrink-0"
          >
            <img
              src="/logo-sm.webp"
              srcSet="/logo-sm.webp 1x, /logo.webp 2x"
              alt="Jonny Livestock"
              width="64"
              height="56"
              loading="eager"
              fetchPriority="high"
              decoding="async"
              className="w-[41px] h-[36px] sm:w-[50px] sm:h-[44px] object-contain transition-transform duration-200 group-hover:scale-105 shrink-0"
            />
            <span
              className={`font-serif font-bold text-lg sm:text-xl tracking-tight transition-colors ${
                isDark ? 'text-[#F4E8D0] group-hover:text-[#E0B15A]' : 'text-[#2A1A0D] group-hover:text-[#B8792F]'
              }`}
            >
              {business.name}
            </span>
          </Link>

          {/* Center: Desktop Navigation Links */}
          <nav className="hidden lg:flex items-center justify-center gap-1 mx-auto px-2">
            {navLinks.map((link) => (
              <NavLink
                key={link.path}
                to={link.path}
                className={({ isActive }) =>
                  `px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-150 relative ${
                    isActive
                      ? isDark
                        ? 'text-[#E0B15A] bg-[#2A1A0D] border border-[#4A2C16] font-semibold shadow-xs'
                        : 'text-[#B8792F] bg-[#F1E8D8] border border-[#E4D4BC] font-semibold shadow-xs'
                      : isDark
                        ? 'text-[#D8C5A8] hover:text-[#F4E8D0] hover:bg-[#2A1A0D]/50'
                        : 'text-[#746556] hover:text-[#2A1A0D] hover:bg-[#F1E8D8]/50'
                  } ${link.isSpecial ? 'font-bold' : ''}`
                }
              >
                {link.isSpecial ? (
                  <span className="flex items-center gap-1.5 text-amber-500">
                    <Gift className="w-3.5 h-3.5" />
                    <span>{link.name}</span>
                  </span>
                ) : (
                  link.name
                )}
              </NavLink>
            ))}
          </nav>

          {/* Right: User Account, Switchers */}
          <div className="hidden sm:flex items-center gap-2.5 shrink-0 pl-2">
            {/* User Auth Trigger */}
            {isAuthenticated && user ? (
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border text-xs font-semibold transition-all ${
                    isDark
                      ? 'bg-[#2A1A0D] border-[#4A2C16] text-[#E0B15A] hover:bg-[#3A2412]'
                      : 'bg-[#F1E8D8] border-[#E4D4BC] text-[#B8792F] hover:bg-[#EFE8DC]'
                  }`}
                >
                  <User className="w-3.5 h-3.5 text-[#C18A45]" />
                  <span className="max-w-[100px] truncate">{user.name.split(' ')[0]}</span>
                </button>

                {userDropdownOpen && (
                  <div
                    className={`absolute right-0 mt-2 w-52 rounded-2xl shadow-xl border p-2 z-50 animate-in fade-in zoom-in-95 duration-150 ${
                      isDark ? 'bg-[#24170D] border-[#4A2C16] text-[#F4E8D0]' : 'bg-white border-[#E4D4BC] text-[#2A1A0D]'
                    }`}
                  >
                    <div className="px-3 py-2 border-b border-black/10 dark:border-white/10 mb-1">
                      <div className="font-bold text-xs truncate flex items-center justify-between">
                        <span>{user.name}</span>
                      </div>
                      <div className="text-[10px] opacity-60 truncate">{user.email}</div>
                    </div>

                    {/* Customer Personal Links */}
                        <Link
                          to="/my-orders"
                          onClick={() => setUserDropdownOpen(false)}
                          className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs hover:bg-[#C18A45]/15 hover:text-[#C18A45] transition-colors"
                        >
                          <ShoppingBag className="w-3.5 h-3.5 text-amber-500" />
                          <span>{isAmharic ? 'ትዕዛዞች & ይዞታዎች' : 'My Orders & Reservations'}</span>
                        </Link>

                        <Link
                          to="/my-packages"
                          onClick={() => setUserDropdownOpen(false)}
                          className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs hover:bg-[#C18A45]/15 hover:text-[#C18A45] transition-colors"
                        >
                          <Bookmark className="w-3.5 h-3.5 text-amber-500" />
                          <span>{isAmharic ? 'የተቀመጡ ጥቅሎች' : 'My Saved Packages'}</span>
                        </Link>

                    <button
                      type="button"
                      onClick={handleFullLogout}
                      className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs text-red-400 hover:bg-red-500/10 transition-colors mt-1 pt-1 border-t border-black/5 dark:border-white/5"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      <span>{isAmharic ? 'ውጣ (Logout)' : 'Sign Out'}</span>
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <button
                type="button"
                onClick={() => openAuthModal('login')}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#C18A45]/15 hover:bg-[#C18A45]/25 text-[#C18A45] text-xs font-bold transition-colors border border-[#C18A45]/30"
              >
                <LogIn className="w-3.5 h-3.5" />
                <span>{isAmharic ? 'ይግቡ' : 'Sign In'}</span>
              </button>
            )}

            <LanguageToggle />
            <ThemeToggle />
          </div>

          {/* Mobile View - Clean header with auth & burger trigger */}
          <div className="flex sm:hidden items-center gap-2">
            {!isAuthenticated && (
              <button
                type="button"
                onClick={() => openAuthModal('login')}
                className="flex items-center gap-1.5 px-3 h-10 rounded-xl bg-[#C18A45]/15 text-[#C18A45] text-xs font-bold border border-[#C18A45]/30 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#C58A3A]"
                aria-label="Sign In"
              >
                <LogIn className="w-4 h-4" />
                <span>{isAmharic ? 'ይግቡ' : 'Sign In'}</span>
              </button>
            )}

            <button
              onClick={() => setIsOpen(!isOpen)}
              type="button"
              className={`p-2.5 min-w-[44px] min-h-[44px] flex items-center justify-center rounded-xl transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[#C58A3A] ${
                isDark
                  ? 'text-[#F4E8D0] hover:bg-[#2A1A0D] border border-[#4A2C16]'
                  : 'text-[#2A1A0D] hover:bg-[#F1E8D8] border border-[#E4D4BC]'
              }`}
              aria-expanded={isOpen}
              aria-label={isOpen ? 'Close menu' : 'Open menu'}
            >
              {isOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5 stroke-[2.2]" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Backdrop Overlay */}
      <div
        className={`fixed inset-x-0 top-16 sm:top-18 bottom-0 bg-black/50 backdrop-blur-sm transition-opacity duration-300 lg:hidden z-40 ${
          isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
        onClick={() => setIsOpen(false)}
        aria-hidden="true"
      />

      {/* Mobile Drawer (Absolute overlay so page content below NEVER shifts down) */}
      <div
        className={`lg:hidden absolute top-full left-0 right-0 z-50 border-b transition-all duration-300 ease-out transform ${
          isOpen
            ? 'opacity-100 translate-y-0 pointer-events-auto'
            : 'opacity-0 -translate-y-3 pointer-events-none'
        } ${
          isDark
            ? 'bg-[#1B1208] border-[#4A2C16] text-[#F4E8D0]'
            : 'bg-[#FAF7F0] border-[#E4D4BC] text-[#241A12]'
        }`}
        style={{
          backgroundColor: isDark ? '#1B1208' : '#FAF7F0',
          boxShadow: isDark
            ? '0 20px 40px rgba(0, 0, 0, 0.65)'
            : '0 20px 40px rgba(42, 26, 13, 0.16)'
        }}
      >
        <div className="px-4 pt-3 pb-6 space-y-1.5 max-w-7xl mx-auto max-h-[calc(100dvh-4.5rem)] overflow-y-auto overscroll-contain">
          {isAuthenticated && user && (
            <div
              className={`p-3.5 rounded-xl mb-2.5 flex justify-between items-center border ${
                isDark
                  ? 'bg-[#2A1A0D] border-[#4A2C16] text-[#F4E8D0]'
                  : 'bg-[#F1E8D8] border-[#E4D4BC] text-[#241A12]'
              }`}
            >
              <div>
                <div className="font-bold text-xs flex items-center gap-2">
                  <span className={isDark ? 'text-[#F4E8D0]' : 'text-[#241A12]'}>{user.name}</span>
                </div>
                <div className={`text-[11px] font-medium mt-0.5 ${isDark ? 'text-[#D8C5A8]' : 'text-[#746556]'}`}>
                  {user.email}
                </div>
              </div>
              <button
                type="button"
                onClick={handleFullLogout}
                className="p-2 rounded-lg text-red-500 hover:bg-red-500/10 transition-colors"
                title="Log out"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* Quick Links for User in Mobile */}
          {isAuthenticated && (
            <div className={`grid grid-cols-2 gap-2 pb-2.5 mb-2.5 border-b ${isDark ? 'border-[#4A2C16]' : 'border-[#E4D4BC]'}`}>
              <Link
                to="/my-orders"
                onClick={() => setIsOpen(false)}
                className="p-2.5 rounded-xl bg-amber-500/15 border border-amber-500/40 text-amber-700 dark:text-amber-400 text-xs font-bold flex items-center gap-1.5 justify-center shadow-xs"
              >
                <ShoppingBag className="w-3.5 h-3.5" />
                <span>{isAmharic ? 'ትዕዛዞች & ይዞታዎች' : 'Orders & Reservations'}</span>
              </Link>
              <Link
                to="/my-packages"
                onClick={() => setIsOpen(false)}
                className="p-2.5 rounded-xl bg-amber-500/15 border border-amber-500/40 text-amber-700 dark:text-amber-400 text-xs font-bold flex items-center gap-1.5 justify-center shadow-xs"
              >
                <Bookmark className="w-3.5 h-3.5" />
                <span>My Packages</span>
              </Link>
            </div>
          )}

          {!isAuthenticated && (
            <div className={`pb-3 mb-2 border-b ${isDark ? 'border-[#4A2C16]' : 'border-[#E4D4BC]'}`}>
              <button
                type="button"
                onClick={() => {
                  setIsOpen(false);
                  openAuthModal('login');
                }}
                className={`w-full py-2.5 px-4 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-colors shadow-xs ${
                  isDark
                    ? 'bg-[#C58A3A] text-[#1B1208] hover:bg-[#E0B15A]'
                    : 'bg-[#B8792F] text-white hover:bg-[#9E6523]'
                }`}
              >
                <LogIn className="w-4 h-4" />
                <span>{isAmharic ? 'ግባ / ተመዝገብ' : 'Sign In / Register'}</span>
              </button>
            </div>
          )}

          {navLinks.map((link) => (
            <NavLink
              key={link.path}
              to={link.path}
              onClick={() => setIsOpen(false)}
              className={({ isActive }) =>
                `flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-semibold transition-colors ${
                  isActive
                    ? isDark
                      ? 'bg-[#2A1A0D] text-[#E0B15A] border border-[#4A2C16] shadow-xs'
                      : 'bg-[#F1E8D8] text-[#B8792F] border border-[#E4D4BC] shadow-xs'
                    : isDark
                      ? 'text-[#F4E8D0] hover:bg-[#2A1A0D]/70 hover:text-[#E0B15A]'
                      : 'text-[#241A12] hover:bg-[#F1E8D8] hover:text-[#B8792F]'
                }`
              }
            >
              <div className="flex items-center gap-2.5">
                {link.isSpecial ? (
                  <Gift className="w-4 h-4 text-amber-600 dark:text-amber-500" />
                ) : null}
                <span>{link.name}</span>
              </div>
              <ChevronRight
                className={`w-4 h-4 transition-transform ${
                  isDark ? 'text-[#D8C5A8]/70' : 'text-[#746556]/80'
                }`}
              />
            </NavLink>
          ))}

          {/* Theme & Language Switchers inside Mobile Burger Menu */}
          <div className={`pt-3.5 mt-2 border-t grid grid-cols-2 gap-2.5 ${isDark ? 'border-[#4A2C16]' : 'border-[#E4D4BC]'}`}>
            <LanguageToggle fullWidth showLabel />
            <ThemeToggle fullWidth showLabel />
          </div>
        </div>
      </div>
    </header>
  );
};
