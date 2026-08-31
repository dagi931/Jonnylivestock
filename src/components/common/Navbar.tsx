import React, { useState, useEffect } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import { business } from '../../config/business';
import { ThemeToggle } from './ThemeToggle';
import { LanguageToggle } from './LanguageToggle';
import { Menu, X, ChevronRight, BarChart3 } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import { useLanguage } from '../../context/LanguageContext';

export const Navbar: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();
  const { theme } = useTheme();
  const { t } = useLanguage();
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
  }, [location.pathname]);

  const navLinks = [
    { name: t.nav.home, path: '/' },
    { name: t.nav.sheep, path: '/sheep' },
    { name: t.nav.goats, path: '/goats' },
    { name: t.nav.cows, path: '/cows' },
    { name: t.nav.services, path: '/services' },
    { name: t.nav.about, path: '/about' },
    { name: t.nav.contact, path: '/contact' },
    { name: t.nav.admin, path: '/admin', isAdmin: true },
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
            className="flex items-center gap-2.5 group focus:outline-none focus-visible:ring-2 focus-visible:ring-[#C58A3A] rounded-lg shrink-0"
          >
            <div
              className={`w-9 h-9 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center font-serif font-bold text-base sm:text-lg transition-transform duration-200 group-hover:scale-105 ${
                isDark
                  ? 'bg-gradient-to-br from-[#4A2C16] to-[#2A1A0D] text-[#E0B15A] border border-[#C58A3A]/40 shadow-inner'
                  : 'bg-gradient-to-br from-[#FAF7F0] to-[#F1E8D8] text-[#B8792F] border border-[#B8792F]/40 shadow-sm'
              }`}
            >
              <span>JL</span>
            </div>
            <span
              className={`font-serif font-bold text-lg sm:text-xl tracking-tight transition-colors ${
                isDark ? 'text-[#F4E8D0] group-hover:text-[#E0B15A]' : 'text-[#2A1A0D] group-hover:text-[#B8792F]'
              }`}
            >
              {business.name}
            </span>
          </Link>

          {/* Center: Desktop Navigation Links (Middle of header) */}
          <nav className="hidden md:flex items-center justify-center gap-1 mx-auto px-4">
            {navLinks.map((link) => (
              <NavLink
                key={link.path}
                to={link.path}
                className={({ isActive }) =>
                  `px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-150 ${
                    isActive
                      ? isDark
                        ? 'text-[#E0B15A] bg-[#2A1A0D] border border-[#4A2C16] font-semibold shadow-xs'
                        : 'text-[#B8792F] bg-[#F1E8D8] border border-[#E4D4BC] font-semibold shadow-xs'
                      : isDark
                        ? 'text-[#D8C5A8] hover:text-[#F4E8D0] hover:bg-[#2A1A0D]/50'
                        : 'text-[#746556] hover:text-[#2A1A0D] hover:bg-[#F1E8D8]/50'
                  }`
                }
              >
                {link.isAdmin ? (
                  <span className="flex items-center gap-1.5">
                    <BarChart3 className="w-3.5 h-3.5" />
                    <span>{link.name}</span>
                  </span>
                ) : (
                  link.name
                )}
              </NavLink>
            ))}
          </nav>

          {/* Right: Desktop Switchers (with clear spacing between Admin & Language Changer) */}
          <div className="hidden md:flex items-center gap-2.5 shrink-0 pl-4 lg:pl-6">
            <LanguageToggle />
            <ThemeToggle />
          </div>

          {/* Mobile View: Language Toggle + Theme Toggle + Menu Button */}
          <div className="flex md:hidden items-center gap-2">
            <LanguageToggle />
            <ThemeToggle />
            
            <button
              onClick={() => setIsOpen(!isOpen)}
              type="button"
              className={`p-2 rounded-xl transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[#C58A3A] ${
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

      {/* Mobile Drawer */}
      {isOpen && (
        <div
          className={`md:hidden border-b animate-in slide-in-from-top-2 duration-150 ${
            isDark
              ? 'bg-[#1B1208] border-[#4A2C16] text-[#F4E8D0]'
              : 'bg-[#FAF7F0] border-[#E4D4BC] text-[#2A1A0D]'
          }`}
        >
          <div className="px-4 pt-2 pb-5 space-y-1 max-w-7xl mx-auto">
            {navLinks.map((link) => (
              <NavLink
                key={link.path}
                to={link.path}
                className={({ isActive }) =>
                  `flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                    isActive
                      ? isDark
                        ? 'bg-[#2A1A0D] text-[#E0B15A] font-semibold border border-[#4A2C16]'
                        : 'bg-[#F1E8D8] text-[#B8792F] font-semibold border border-[#E4D4BC]'
                      : isDark
                        ? 'text-[#D8C5A8] hover:bg-[#2A1A0D]/50 hover:text-[#F4E8D0]'
                        : 'text-[#746556] hover:bg-[#F1E8D8]/50 hover:text-[#2A1A0D]'
                  }`
                }
              >
                <div className="flex items-center gap-2">
                  {link.isAdmin && <BarChart3 className="w-4 h-4 text-amber-500" />}
                  <span>{link.name}</span>
                </div>
                <ChevronRight className="w-4 h-4 opacity-50" />
              </NavLink>
            ))}
          </div>
        </div>
      )}
    </header>
  );
};
