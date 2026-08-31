import React, { useState, useMemo } from 'react';
import { useAdminAuth } from '../context/AdminAuthContext';
import { mockAnimals as initialAnimals } from '../data/animals';
import { Animal, AnimalStatus, AnimalType } from '../types/animal';
import { StatusBadge } from '../components/common/StatusBadge';
import { formatPrice, formatWeight } from '../utils/formatters';
import { business } from '../config/business';
import { useTheme } from '../context/ThemeContext';
import {
  TrendingUp,
  DollarSign,
  ShoppingBag,
  Truck,
  Sparkles,
  Search,
  CheckCircle2,
  ArrowUpRight,
  Lock,
  Mail,
  Eye,
  EyeOff,
  LogOut,
  LayoutDashboard,
  ClipboardList,
  BarChart3,
  Settings,
  Shield,
  Layers,
  AlertCircle
} from 'lucide-react';
import { Link } from 'react-router-dom';

// Simulated customer service requests
interface MockRequest {
  id: string;
  customerName: string;
  phone: string;
  animalId: string;
  animalBreed: string;
  animalType: AnimalType;
  price: number;
  services: string[];
  location: string;
  date: string;
  status: 'New' | 'Contacted' | 'Confirmed' | 'Completed';
}

const initialRequests: MockRequest[] = [
  {
    id: "REQ-1042",
    customerName: "Dawit Tadesse",
    phone: "+251 91 123 4567",
    animalId: "CW-001",
    animalBreed: "Boran Bull",
    animalType: "cow",
    price: 110000,
    services: ["Livestock Delivery", "Slaughter & Meat Extraction (Single Worker)", "Ceremonial Supply (Wedding)"],
    location: "Addis Ababa, Bole",
    date: "2026-08-28 14:15",
    status: "New"
  },
  {
    id: "REQ-1041",
    customerName: "Helen Gebremariam",
    phone: "+251 92 456 7890",
    animalId: "SH-001",
    animalBreed: "Horro Ram",
    animalType: "sheep",
    price: 18000,
    services: ["Livestock Delivery", "Slaughter & Meat Extraction (Single Worker)"],
    location: "Addis Ababa, Aware",
    date: "2026-08-28 11:30",
    status: "Contacted"
  },
  {
    id: "REQ-1040",
    customerName: "Yohannes Bekele",
    phone: "+251 93 888 1234",
    animalId: "GT-001",
    animalBreed: "Boer Cross",
    animalType: "goat",
    price: 24000,
    services: ["Livestock Delivery", "Ceremonial Supply (Holiday)"],
    location: "Addis Ababa, Kazanchis",
    date: "2026-08-27 16:45",
    status: "Confirmed"
  },
  {
    id: "REQ-1039",
    customerName: "Almaz Kebede",
    phone: "+251 91 765 4321",
    animalId: "SH-003",
    animalBreed: "Bonga Ram",
    animalType: "sheep",
    price: 22000,
    services: ["Slaughter & Meat Extraction (Single Worker)"],
    location: "Aware, Farm Pickup",
    date: "2026-08-27 09:20",
    status: "Completed"
  },
  {
    id: "REQ-1038",
    customerName: "Berhanu Girma",
    phone: "+251 94 333 9999",
    animalId: "CW-003",
    animalBreed: "Local Highland Ox",
    animalType: "cow",
    price: 95000,
    services: ["Livestock Delivery", "Slaughter & Meat Extraction (Single Worker)", "Ceremonial Supply (Funeral/Memorial)"],
    location: "Adama, Kebele 04",
    date: "2026-08-26 15:10",
    status: "Completed"
  }
];

type AdminTab = 'overview' | 'inventory' | 'requests' | 'demand' | 'settings';

export const Admin: React.FC = () => {
  const { isAuthenticated, user, login, logout } = useAdminAuth();
  const { theme } = useTheme();
  const isDark = theme === 'design7';

  // Login Form States
  const [emailInput, setEmailInput] = useState('');
  const [passwordInput, setPasswordInput] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loginError, setLoginError] = useState('');
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  // Dashboard Active Sidebar Tab
  const [activeTab, setActiveTab] = useState<AdminTab>('overview');

  // Dashboard Data State
  const [animalsList, setAnimalsList] = useState<Animal[]>(initialAnimals);
  const [requestsList, setRequestsList] = useState<MockRequest[]>(initialRequests);
  const [selectedTypeFilter, setSelectedTypeFilter] = useState<string>('all');
  const [selectedStatusFilter, setSelectedStatusFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Calculations
  const stats = useMemo(() => {
    const totalAnimals = animalsList.length;
    const sheep = animalsList.filter((a) => a.type === 'sheep');
    const goats = animalsList.filter((a) => a.type === 'goat');
    const cows = animalsList.filter((a) => a.type === 'cow');

    const availableCount = animalsList.filter((a) => a.status === 'available').length;
    const reservedCount = animalsList.filter((a) => a.status === 'reserved').length;
    const soldCount = animalsList.filter((a) => a.status === 'sold').length;

    const totalInventoryValue = animalsList.reduce((acc, a) => acc + a.price, 0);
    const availableValue = animalsList.filter((a) => a.status === 'available').reduce((acc, a) => acc + a.price, 0);
    const soldValue = animalsList.filter((a) => a.status === 'sold').reduce((acc, a) => acc + a.price, 0);

    const sheepValue = sheep.reduce((acc, a) => acc + a.price, 0);
    const goatValue = goats.reduce((acc, a) => acc + a.price, 0);
    const cowValue = cows.reduce((acc, a) => acc + a.price, 0);

    const avgSheepWeight = sheep.length ? Math.round(sheep.reduce((acc, a) => acc + a.weight, 0) / sheep.length) : 0;
    const avgGoatWeight = goats.length ? Math.round(goats.reduce((acc, a) => acc + a.weight, 0) / goats.length) : 0;
    const avgCowWeight = cows.length ? Math.round(cows.reduce((acc, a) => acc + a.weight, 0) / cows.length) : 0;

    const avgSheepPrice = sheep.length ? Math.round(sheepValue / sheep.length) : 0;
    const avgGoatPrice = goats.length ? Math.round(goatValue / goats.length) : 0;
    const avgCowPrice = cows.length ? Math.round(cowValue / cows.length) : 0;

    return {
      totalAnimals,
      sheepCount: sheep.length,
      goatsCount: goats.length,
      cowsCount: cows.length,
      availableCount,
      reservedCount,
      soldCount,
      totalInventoryValue,
      availableValue,
      soldValue,
      sheepValue,
      goatValue,
      cowValue,
      avgSheepWeight,
      avgGoatWeight,
      avgCowWeight,
      avgSheepPrice,
      avgGoatPrice,
      avgCowPrice
    };
  }, [animalsList]);

  // Filtered Animals for Table
  const filteredAnimals = useMemo(() => {
    return animalsList.filter((animal) => {
      const matchesType = selectedTypeFilter === 'all' || animal.type === selectedTypeFilter;
      const matchesStatus = selectedStatusFilter === 'all' || animal.status === selectedStatusFilter;
      const matchesSearch =
        searchQuery === '' ||
        animal.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        animal.breed.toLowerCase().includes(searchQuery.toLowerCase()) ||
        animal.location.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesType && matchesStatus && matchesSearch;
    });
  }, [animalsList, selectedTypeFilter, selectedStatusFilter, searchQuery]);

  const handleToggleStatus = (animalId: string, newStatus: AnimalStatus) => {
    setAnimalsList((prev) =>
      prev.map((a) => (a.id === animalId ? { ...a, status: newStatus } : a))
    );
  };

  const handleUpdateRequestStatus = (requestId: string, newStatus: MockRequest['status']) => {
    setRequestsList((prev) =>
      prev.map((r) => (r.id === requestId ? { ...r, status: newStatus } : r))
    );
  };

  // Handle Login Submit
  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');
    setIsLoggingIn(true);

    setTimeout(() => {
      const res = login(emailInput, passwordInput);
      setIsLoggingIn(false);
      if (!res.success) {
        setLoginError(res.error || 'Login failed');
      }
    }, 400);
  };

  const handleUseDemoCredentials = () => {
    setEmailInput('admin@jonnylivestock.com');
    setPasswordInput('admin123');
    setLoginError('');
  };

  // ==========================================
  // VIEW 1: ADMIN LOGIN PORTAL (if not authenticated)
  // ==========================================
  if (!isAuthenticated) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
        <div
          className={`w-full max-w-md rounded-3xl border p-6 sm:p-8 shadow-2xl transition-all ${
            isDark ? 'bg-[#2A1A0D] border-[#4A2C16]' : 'bg-[#F1E8D8] border-[#E4D4BC]'
          }`}
        >
          {/* Header */}
          <div className="text-center mb-6">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#4A2C16] to-[#2A1A0D] border border-[#C58A3A]/40 flex items-center justify-center mx-auto mb-3 text-[#E0B15A] shadow-inner">
              <Shield className="w-6 h-6" />
            </div>
            <h1 className={`font-serif font-bold text-2xl ${isDark ? 'text-[#F4E8D0]' : 'text-[#2A1A0D]'}`}>
              Owner Admin Portal
            </h1>
            <p className={`text-xs mt-1 ${isDark ? 'text-[#D8C5A8]' : 'text-[#746556]'}`}>
              Sign in with your administrator email and password to access livestock intelligence.
            </p>
          </div>

          {/* Error Alert */}
          {loginError && (
            <div className="mb-4 p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-500 text-xs flex items-start gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{loginError}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleLoginSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider mb-1.5 opacity-90">
                Admin Email
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 opacity-50" />
                <input
                  type="email"
                  required
                  placeholder="admin@jonnylivestock.com"
                  value={emailInput}
                  onChange={(e) => setEmailInput(e.target.value)}
                  className={`w-full pl-10 pr-4 py-2.5 rounded-xl text-sm border focus:outline-none focus:ring-2 transition-all ${
                    isDark
                      ? 'bg-[#1B1208] border-[#4A2C16] text-[#F4E8D0] focus:ring-[#C58A3A]'
                      : 'bg-[#FAF7F0] border-[#E4D4BC] text-[#2A1A0D] focus:ring-[#B8792F]'
                  }`}
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider mb-1.5 opacity-90">
                Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 opacity-50" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  placeholder="••••••••"
                  value={passwordInput}
                  onChange={(e) => setPasswordInput(e.target.value)}
                  className={`w-full pl-10 pr-10 py-2.5 rounded-xl text-sm border focus:outline-none focus:ring-2 transition-all ${
                    isDark
                      ? 'bg-[#1B1208] border-[#4A2C16] text-[#F4E8D0] focus:ring-[#C58A3A]'
                      : 'bg-[#FAF7F0] border-[#E4D4BC] text-[#2A1A0D] focus:ring-[#B8792F]'
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 opacity-60 hover:opacity-100"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoggingIn}
              className={`w-full py-3 rounded-xl font-bold text-sm transition-all shadow-md flex items-center justify-center gap-2 ${
                isDark
                  ? 'bg-[#C58A3A] hover:bg-[#E0B15A] text-[#1B1208]'
                  : 'bg-[#B8792F] hover:bg-[#9E6523] text-[#FAF7F0]'
              } disabled:opacity-50`}
            >
              {isLoggingIn ? 'Verifying Credentials...' : 'Sign In to Dashboard'}
            </button>
          </form>

          {/* Quick Demo Helper */}
          <div className="mt-5 pt-4 border-t text-center space-y-2" style={{ borderColor: isDark ? '#4A2C16' : '#E4D4BC' }}>
            <p className="text-[11px] opacity-70">
              Demo Credentials: <strong className="font-mono">admin@jonnylivestock.com</strong> / <strong className="font-mono">admin123</strong>
            </p>
            <button
              type="button"
              onClick={handleUseDemoCredentials}
              className={`text-xs font-semibold hover:underline ${isDark ? 'text-[#E0B15A]' : 'text-[#B8792F]'}`}
            >
              Auto-fill Demo Credentials
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ==========================================
  // VIEW 2: AUTHENTICATED DASHBOARD (LEFT SIDEBAR LAYOUT)
  // ==========================================
  const navTabs: { id: AdminTab; label: string; icon: React.ElementType; badge?: string }[] = [
    { id: 'overview', label: 'Overview & Analytics', icon: LayoutDashboard },
    { id: 'inventory', label: 'Livestock Inventory', icon: Layers, badge: `${stats.totalAnimals}` },
    { id: 'requests', label: 'Inquiries & Orders', icon: ClipboardList, badge: `${requestsList.length}` },
    { id: 'demand', label: 'Service Demand Analysis', icon: BarChart3 },
    { id: 'settings', label: 'Farm Settings', icon: Settings }
  ];

  return (
    <div className="min-h-screen py-6 sm:py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Main 2-Column Sidebar Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-start">
          
          {/* ========================================== */}
          {/* LEFT SIDEBAR (Navigation Buttons) */}
          {/* ========================================== */}
          <aside className="lg:col-span-3 space-y-4">
            
            {/* Sidebar Navigation Panel */}
            <div
              className={`rounded-3xl border p-4 sm:p-5 transition-all shadow-md ${
                isDark ? 'bg-[#2A1A0D] border-[#4A2C16]' : 'bg-[#F1E8D8] border-[#E4D4BC]'
              }`}
            >
              {/* Sidebar Header / Owner Info */}
              <div className="flex items-center gap-3 pb-4 mb-4 border-b" style={{ borderColor: isDark ? '#4A2C16' : '#E4D4BC' }}>
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#4A2C16] to-[#2A1A0D] border border-[#C58A3A]/40 flex items-center justify-center font-serif font-bold text-base text-[#E0B15A]">
                  JL
                </div>
                <div className="flex-1 min-w-0">
                  <h2 className={`font-serif font-bold text-sm truncate ${isDark ? 'text-[#F4E8D0]' : 'text-[#2A1A0D]'}`}>
                    {user?.name || 'Jonny Owner'}
                  </h2>
                  <span className="block text-[10px] text-green-500 font-semibold uppercase tracking-wider">
                    ● Admin Active
                  </span>
                </div>
              </div>

              {/* Clickable Sidebar Tab Buttons */}
              <nav className="space-y-1.5" aria-label="Admin Navigation">
                {navTabs.map((tab) => {
                  const Icon = tab.icon;
                  const isActive = activeTab === tab.id;

                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      type="button"
                      className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all duration-150 text-left ${
                        isActive
                          ? isDark
                            ? 'bg-[#C58A3A] text-[#1B1208] shadow-sm font-bold'
                            : 'bg-[#B8792F] text-[#FAF7F0] shadow-sm font-bold'
                          : isDark
                            ? 'text-[#D8C5A8] hover:bg-[#1B1208]/70 hover:text-[#F4E8D0]'
                            : 'text-[#746556] hover:bg-[#FAF7F0] hover:text-[#2A1A0D]'
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <Icon className="w-4 h-4 shrink-0" />
                        <span>{tab.label}</span>
                      </div>
                      {tab.badge && (
                        <span
                          className={`text-[10px] font-mono px-2 py-0.5 rounded-full ${
                            isActive
                              ? isDark ? 'bg-[#1B1208] text-[#E0B15A]' : 'bg-[#FAF7F0] text-[#B8792F]'
                              : isDark ? 'bg-[#1B1208] text-[#D8C5A8]' : 'bg-[#F1E8D8] text-[#746556]'
                          }`}
                        >
                          {tab.badge}
                        </span>
                      )}
                    </button>
                  );
                })}
              </nav>

              {/* Logout Button */}
              <div className="pt-4 mt-4 border-t" style={{ borderColor: isDark ? '#4A2C16' : '#E4D4BC' }}>
                <button
                  onClick={logout}
                  type="button"
                  className={`w-full flex items-center justify-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold border transition-colors ${
                    isDark
                      ? 'bg-[#1B1208] border-[#4A2C16] text-[#D8C5A8] hover:text-red-400 hover:border-red-500/40'
                      : 'bg-[#FAF7F0] border-[#E4D4BC] text-[#746556] hover:text-red-600 hover:border-red-400'
                  }`}
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Log Out</span>
                </button>
              </div>
            </div>

            {/* Farm Status Quick Pill */}
            <div
              className={`p-4 rounded-2xl border text-xs space-y-1.5 ${
                isDark ? 'bg-[#2A1A0D]/70 border-[#4A2C16] text-[#D8C5A8]' : 'bg-[#F1E8D8] border-[#E4D4BC] text-[#746556]'
              }`}
            >
              <div className="flex justify-between items-center font-semibold">
                <span>Farm Location:</span>
                <span className={isDark ? 'text-[#F4E8D0]' : 'text-[#2A1A0D]'}>{business.city}</span>
              </div>
              <div className="flex justify-between items-center font-semibold">
                <span>Available Valuation:</span>
                <span className={isDark ? 'text-[#E0B15A]' : 'text-[#B8792F]'}>{formatPrice(stats.availableValue)}</span>
              </div>
            </div>

          </aside>

          {/* ========================================== */}
          {/* RIGHT MAIN CONTENT AREA (Active Tab Content) */}
          {/* ========================================== */}
          <main className="lg:col-span-9 space-y-6">
            
            {/* ---------------------------------------------------- */}
            {/* TAB 1: OVERVIEW & ANALYTICS */}
            {/* ---------------------------------------------------- */}
            {activeTab === 'overview' && (
              <div className="space-y-6 animate-in fade-in-50 duration-150">
                {/* Header Banner */}
                <div>
                  <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-amber-500 mb-1">
                    <TrendingUp className="w-4 h-4" />
                    <span>Executive Summary</span>
                  </div>
                  <h1 className={`font-serif font-bold text-2xl sm:text-3xl ${isDark ? 'text-[#F4E8D0]' : 'text-[#2A1A0D]'}`}>
                    Livestock Intelligence Overview
                  </h1>
                </div>

                {/* 4 KPI Metrics Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
                  {/* Card 1 */}
                  <div className={`p-4 sm:p-5 rounded-2xl border ${isDark ? 'bg-[#2A1A0D] border-[#4A2C16]' : 'bg-[#F1E8D8] border-[#E4D4BC]'}`}>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[11px] font-semibold uppercase tracking-wider opacity-70">Total Valuation</span>
                      <div className="w-7 h-7 rounded-lg bg-amber-500/10 text-amber-500 flex items-center justify-center">
                        <DollarSign className="w-3.5 h-3.5" />
                      </div>
                    </div>
                    <div className={`text-xl sm:text-2xl font-serif font-extrabold ${isDark ? 'text-[#E0B15A]' : 'text-[#B8792F]'}`}>
                      {formatPrice(stats.totalInventoryValue)}
                    </div>
                    <p className="text-[11px] opacity-70 mt-1">
                      Available: {formatPrice(stats.availableValue)}
                    </p>
                  </div>

                  {/* Card 2 */}
                  <div className={`p-4 sm:p-5 rounded-2xl border ${isDark ? 'bg-[#2A1A0D] border-[#4A2C16]' : 'bg-[#F1E8D8] border-[#E4D4BC]'}`}>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[11px] font-semibold uppercase tracking-wider opacity-70">Total Animals</span>
                      <div className="w-7 h-7 rounded-lg bg-blue-500/10 text-blue-500 flex items-center justify-center">
                        <ShoppingBag className="w-3.5 h-3.5" />
                      </div>
                    </div>
                    <div className={`text-xl sm:text-2xl font-serif font-extrabold ${isDark ? 'text-[#F4E8D0]' : 'text-[#2A1A0D]'}`}>
                      {stats.totalAnimals} Head
                    </div>
                    <p className="text-[11px] opacity-70 mt-1">
                      {stats.sheepCount} Sheep · {stats.goatsCount} Goats · {stats.cowsCount} Cows
                    </p>
                  </div>

                  {/* Card 3 */}
                  <div className={`p-4 sm:p-5 rounded-2xl border ${isDark ? 'bg-[#2A1A0D] border-[#4A2C16]' : 'bg-[#F1E8D8] border-[#E4D4BC]'}`}>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[11px] font-semibold uppercase tracking-wider opacity-70">Inventory Status</span>
                      <div className="w-7 h-7 rounded-lg bg-green-500/10 text-green-500 flex items-center justify-center">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5 text-xs font-semibold">
                      <span className="text-green-500 font-bold">{stats.availableCount} Avail</span>
                      <span>·</span>
                      <span className="text-amber-500 font-bold">{stats.reservedCount} Hold</span>
                      <span>·</span>
                      <span className="text-stone-400 font-bold">{stats.soldCount} Sold</span>
                    </div>
                    <div className="mt-2 w-full bg-stone-700/30 rounded-full h-1.5 overflow-hidden flex">
                      <div style={{ width: `${(stats.availableCount / stats.totalAnimals) * 100}%` }} className="bg-green-500 h-full" />
                      <div style={{ width: `${(stats.reservedCount / stats.totalAnimals) * 100}%` }} className="bg-amber-500 h-full" />
                      <div style={{ width: `${(stats.soldCount / stats.totalAnimals) * 100}%` }} className="bg-stone-500 h-full" />
                    </div>
                  </div>

                  {/* Card 4 */}
                  <div className={`p-4 sm:p-5 rounded-2xl border ${isDark ? 'bg-[#2A1A0D] border-[#4A2C16]' : 'bg-[#F1E8D8] border-[#E4D4BC]'}`}>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[11px] font-semibold uppercase tracking-wider opacity-70">Service Attach</span>
                      <div className="w-7 h-7 rounded-lg bg-purple-500/10 text-purple-500 flex items-center justify-center">
                        <Sparkles className="w-3.5 h-3.5" />
                      </div>
                    </div>
                    <div className={`text-xl sm:text-2xl font-serif font-extrabold ${isDark ? 'text-[#E0B15A]' : 'text-[#B8792F]'}`}>
                      82%
                    </div>
                    <p className="text-[11px] opacity-70 mt-1">
                      Deliveries & Slaughter requested
                    </p>
                  </div>
                </div>

                {/* Category Breakdown Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                  <div className={`p-5 rounded-2xl border ${isDark ? 'bg-[#2A1A0D] border-[#4A2C16]' : 'bg-[#F1E8D8] border-[#E4D4BC]'}`}>
                    <div className="flex items-center justify-between pb-2.5 border-b" style={{ borderColor: isDark ? '#4A2C16' : '#E4D4BC' }}>
                      <div className="flex items-center gap-2">
                        <ShoppingBag className="w-4 h-4 text-amber-500" />
                        <strong className="font-serif text-sm">Sheep Metrics</strong>
                      </div>
                      <span className="text-[11px] font-mono opacity-70">{stats.sheepCount} Animals</span>
                    </div>
                    <div className="pt-2.5 space-y-1.5 text-xs">
                      <div className="flex justify-between"><span className="opacity-70">Valuation:</span><strong className={isDark ? 'text-[#E0B15A]' : 'text-[#B8792F]'}>{formatPrice(stats.sheepValue)}</strong></div>
                      <div className="flex justify-between"><span className="opacity-70">Avg Price:</span><span>{formatPrice(stats.avgSheepPrice)}</span></div>
                      <div className="flex justify-between"><span className="opacity-70">Avg Weight:</span><span>{formatWeight(stats.avgSheepWeight)}</span></div>
                    </div>
                  </div>

                  <div className={`p-5 rounded-2xl border ${isDark ? 'bg-[#2A1A0D] border-[#4A2C16]' : 'bg-[#F1E8D8] border-[#E4D4BC]'}`}>
                    <div className="flex items-center justify-between pb-2.5 border-b" style={{ borderColor: isDark ? '#4A2C16' : '#E4D4BC' }}>
                      <div className="flex items-center gap-2">
                        <ShoppingBag className="w-4 h-4 text-amber-500" />
                        <strong className="font-serif text-sm">Goats Metrics</strong>
                      </div>
                      <span className="text-[11px] font-mono opacity-70">{stats.goatsCount} Animals</span>
                    </div>
                    <div className="pt-2.5 space-y-1.5 text-xs">
                      <div className="flex justify-between"><span className="opacity-70">Valuation:</span><strong className={isDark ? 'text-[#E0B15A]' : 'text-[#B8792F]'}>{formatPrice(stats.goatValue)}</strong></div>
                      <div className="flex justify-between"><span className="opacity-70">Avg Price:</span><span>{formatPrice(stats.avgGoatPrice)}</span></div>
                      <div className="flex justify-between"><span className="opacity-70">Avg Weight:</span><span>{formatWeight(stats.avgGoatWeight)}</span></div>
                    </div>
                  </div>

                  <div className={`p-5 rounded-2xl border ${isDark ? 'bg-[#2A1A0D] border-[#4A2C16]' : 'bg-[#F1E8D8] border-[#E4D4BC]'}`}>
                    <div className="flex items-center justify-between pb-2.5 border-b" style={{ borderColor: isDark ? '#4A2C16' : '#E4D4BC' }}>
                      <div className="flex items-center gap-2">
                        <ShoppingBag className="w-4 h-4 text-amber-500" />
                        <strong className="font-serif text-sm">Cows Metrics</strong>
                      </div>
                      <span className="text-[11px] font-mono opacity-70">{stats.cowsCount} Animals</span>
                    </div>
                    <div className="pt-2.5 space-y-1.5 text-xs">
                      <div className="flex justify-between"><span className="opacity-70">Valuation:</span><strong className={isDark ? 'text-[#E0B15A]' : 'text-[#B8792F]'}>{formatPrice(stats.cowValue)}</strong></div>
                      <div className="flex justify-between"><span className="opacity-70">Avg Price:</span><span>{formatPrice(stats.avgCowPrice)}</span></div>
                      <div className="flex justify-between"><span className="opacity-70">Avg Weight:</span><span>{formatWeight(stats.avgCowWeight)}</span></div>
                    </div>
                  </div>
                </div>

                {/* Quick Inquiries Preview */}
                <div className={`p-5 rounded-2xl border ${isDark ? 'bg-[#2A1A0D] border-[#4A2C16]' : 'bg-[#F1E8D8] border-[#E4D4BC]'}`}>
                  <div className="flex items-center justify-between mb-3">
                    <h3 className={`font-serif font-bold text-base ${isDark ? 'text-[#F4E8D0]' : 'text-[#2A1A0D]'}`}>
                      Recent Customer Requests Preview
                    </h3>
                    <button
                      onClick={() => setActiveTab('requests')}
                      className={`text-xs font-semibold hover:underline ${isDark ? 'text-[#E0B15A]' : 'text-[#B8792F]'}`}
                    >
                      View All Orders →
                    </button>
                  </div>
                  <div className="space-y-2">
                    {requestsList.slice(0, 3).map((req) => (
                      <div
                        key={req.id}
                        className={`p-3 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs ${
                          isDark ? 'bg-[#1B1208] border-[#4A2C16]' : 'bg-[#FAF7F0] border-[#E4D4BC]'
                        }`}
                      >
                        <div>
                          <strong className="font-mono">{req.id}</strong> · {req.customerName} ({req.animalBreed})
                          <span className="block text-[11px] opacity-70">{req.services.join(', ')}</span>
                        </div>
                        <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-amber-500/20 text-amber-400 border border-amber-500/30 self-start sm:self-auto">
                          {req.status}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* ---------------------------------------------------- */}
            {/* TAB 2: LIVESTOCK INVENTORY */}
            {/* ---------------------------------------------------- */}
            {activeTab === 'inventory' && (
              <div className="space-y-5 animate-in fade-in-50 duration-150">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <h2 className={`font-serif font-bold text-2xl ${isDark ? 'text-[#F4E8D0]' : 'text-[#2A1A0D]'}`}>
                      Livestock Inventory Manager
                    </h2>
                    <p className="text-xs opacity-70">
                      Search, inspect, and toggle animal availability in real time.
                    </p>
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    <div className="relative">
                      <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 opacity-60" />
                      <input
                        type="text"
                        placeholder="Search ID, breed, city..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className={`pl-8 pr-3 py-1.5 rounded-xl text-xs border focus:outline-none ${
                          isDark ? 'bg-[#1B1208] border-[#4A2C16] text-[#F4E8D0]' : 'bg-[#FAF7F0] border-[#E4D4BC] text-[#2A1A0D]'
                        }`}
                      />
                    </div>

                    <select
                      value={selectedTypeFilter}
                      onChange={(e) => setSelectedTypeFilter(e.target.value)}
                      className={`px-2.5 py-1.5 rounded-xl text-xs border focus:outline-none ${
                        isDark ? 'bg-[#1B1208] border-[#4A2C16] text-[#F4E8D0]' : 'bg-[#FAF7F0] border-[#E4D4BC] text-[#2A1A0D]'
                      }`}
                    >
                      <option value="all">All Types</option>
                      <option value="sheep">Sheep</option>
                      <option value="goat">Goat</option>
                      <option value="cow">Cow</option>
                    </select>

                    <select
                      value={selectedStatusFilter}
                      onChange={(e) => setSelectedStatusFilter(e.target.value)}
                      className={`px-2.5 py-1.5 rounded-xl text-xs border focus:outline-none ${
                        isDark ? 'bg-[#1B1208] border-[#4A2C16] text-[#F4E8D0]' : 'bg-[#FAF7F0] border-[#E4D4BC] text-[#2A1A0D]'
                      }`}
                    >
                      <option value="all">All Statuses</option>
                      <option value="available">Available</option>
                      <option value="reserved">Reserved</option>
                      <option value="sold">Sold</option>
                    </select>
                  </div>
                </div>

                {/* Table */}
                <div
                  className={`rounded-3xl border overflow-hidden shadow-sm ${
                    isDark ? 'bg-[#2A1A0D] border-[#4A2C16]' : 'bg-[#F1E8D8] border-[#E4D4BC]'
                  }`}
                >
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs border-collapse">
                      <thead>
                        <tr className={`border-b ${isDark ? 'border-[#4A2C16] text-[#D8C5A8]' : 'border-[#E4D4BC] text-[#746556]'}`}>
                          <th className="py-3 px-3.5 uppercase font-semibold">Animal ID</th>
                          <th className="py-3 px-3.5 uppercase font-semibold">Breed & Type</th>
                          <th className="py-3 px-3.5 uppercase font-semibold">Gender</th>
                          <th className="py-3 px-3.5 uppercase font-semibold">Weight</th>
                          <th className="py-3 px-3.5 uppercase font-semibold">Price</th>
                          <th className="py-3 px-3.5 uppercase font-semibold">Location</th>
                          <th className="py-3 px-3.5 uppercase font-semibold">Status</th>
                          <th className="py-3 px-3.5 uppercase font-semibold text-right">Toggle Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y" style={{ borderColor: isDark ? '#4A2C16' : '#E4D4BC' }}>
                        {filteredAnimals.map((animal) => (
                          <tr key={animal.id} className={`hover:bg-black/10 transition-colors ${isDark ? 'text-[#F4E8D0]' : 'text-[#2A1A0D]'}`}>
                            <td className="py-3 px-3.5 font-mono font-bold">
                              <Link to={`/animals/${animal.id}`} className="hover:underline inline-flex items-center gap-1">
                                <span>{animal.id}</span>
                                <ArrowUpRight className="w-3 h-3 opacity-60" />
                              </Link>
                            </td>
                            <td className="py-3 px-3.5">
                              <div className="capitalize font-semibold">{animal.breed}</div>
                              <span className="text-[10px] uppercase opacity-70 tracking-wider">{animal.type}</span>
                            </td>
                            <td className="py-3 px-3.5">{animal.gender}</td>
                            <td className="py-3 px-3.5 font-bold">{formatWeight(animal.weight)}</td>
                            <td className={`py-3 px-3.5 font-bold ${isDark ? 'text-[#E0B15A]' : 'text-[#B8792F]'}`}>
                              {formatPrice(animal.price)}
                            </td>
                            <td className="py-3 px-3.5">{animal.location}</td>
                            <td className="py-3 px-3.5">
                              <StatusBadge status={animal.status} size="sm" />
                            </td>
                            <td className="py-3 px-3.5 text-right">
                              <div className="inline-flex items-center gap-1">
                                <button
                                  onClick={() => handleToggleStatus(animal.id, 'available')}
                                  disabled={animal.status === 'available'}
                                  className="px-2 py-0.5 rounded text-[10px] font-semibold bg-green-500/20 text-green-400 border border-green-500/30 hover:bg-green-500/30 disabled:opacity-30"
                                >
                                  Avail
                                </button>
                                <button
                                  onClick={() => handleToggleStatus(animal.id, 'reserved')}
                                  disabled={animal.status === 'reserved'}
                                  className="px-2 py-0.5 rounded text-[10px] font-semibold bg-amber-500/20 text-amber-400 border border-amber-500/30 hover:bg-amber-500/30 disabled:opacity-30"
                                >
                                  Hold
                                </button>
                                <button
                                  onClick={() => handleToggleStatus(animal.id, 'sold')}
                                  disabled={animal.status === 'sold'}
                                  className="px-2 py-0.5 rounded text-[10px] font-semibold bg-stone-600/20 text-stone-400 border border-stone-600/30 hover:bg-stone-600/30 disabled:opacity-30"
                                >
                                  Sold
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {/* ---------------------------------------------------- */}
            {/* TAB 3: INQUIRIES & ORDERS PIPELINE */}
            {/* ---------------------------------------------------- */}
            {activeTab === 'requests' && (
              <div className="space-y-5 animate-in fade-in-50 duration-150">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <h2 className={`font-serif font-bold text-2xl ${isDark ? 'text-[#F4E8D0]' : 'text-[#2A1A0D]'}`}>
                      Customer Inquiries & Service Orders
                    </h2>
                    <p className="text-xs opacity-70">
                      Manage incoming reservations, destination deliveries, slaughter, and meat prep arrangements.
                    </p>
                  </div>
                  <span className="text-xs font-mono font-semibold px-2.5 py-1 rounded bg-amber-500/10 text-amber-500 border border-amber-500/20 self-start sm:self-auto">
                    {requestsList.length} Active Orders
                  </span>
                </div>

                <div
                  className={`rounded-3xl border overflow-hidden shadow-sm ${
                    isDark ? 'bg-[#2A1A0D] border-[#4A2C16]' : 'bg-[#F1E8D8] border-[#E4D4BC]'
                  }`}
                >
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs border-collapse">
                      <thead>
                        <tr className={`border-b ${isDark ? 'border-[#4A2C16] text-[#D8C5A8]' : 'border-[#E4D4BC] text-[#746556]'}`}>
                          <th className="py-3 px-3.5 uppercase font-semibold">Request ID</th>
                          <th className="py-3 px-3.5 uppercase font-semibold">Customer</th>
                          <th className="py-3 px-3.5 uppercase font-semibold">Animal</th>
                          <th className="py-3 px-3.5 uppercase font-semibold">Selected Services</th>
                          <th className="py-3 px-3.5 uppercase font-semibold">Destination</th>
                          <th className="py-3 px-3.5 uppercase font-semibold">Status</th>
                          <th className="py-3 px-3.5 uppercase font-semibold text-right">Update</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y" style={{ borderColor: isDark ? '#4A2C16' : '#E4D4BC' }}>
                        {requestsList.map((req) => (
                          <tr key={req.id} className={`hover:bg-black/10 transition-colors ${isDark ? 'text-[#F4E8D0]' : 'text-[#2A1A0D]'}`}>
                            <td className="py-3 px-3.5 font-mono font-bold">{req.id}</td>
                            <td className="py-3 px-3.5">
                              <strong className="block">{req.customerName}</strong>
                              <span className="text-[11px] opacity-70">{req.phone}</span>
                            </td>
                            <td className="py-3 px-3.5">
                              <div className="flex items-center gap-1">
                                <span className="font-mono font-semibold">{req.animalId}</span>
                                <span>·</span>
                                <span>{req.animalBreed}</span>
                              </div>
                              <span className={`text-[11px] font-semibold ${isDark ? 'text-[#E0B15A]' : 'text-[#B8792F]'}`}>
                                {formatPrice(req.price)}
                              </span>
                            </td>
                            <td className="py-3 px-3.5">
                              <div className="flex flex-wrap gap-1 max-w-xs">
                                {req.services.map((s, idx) => (
                                  <span
                                    key={idx}
                                    className={`text-[10px] px-1.5 py-0.5 rounded border ${
                                      isDark ? 'bg-[#1B1208] border-[#4A2C16]' : 'bg-[#FAF7F0] border-[#E4D4BC]'
                                    }`}
                                  >
                                    {s}
                                  </span>
                                ))}
                              </div>
                            </td>
                            <td className="py-3 px-3.5">{req.location}</td>
                            <td className="py-3 px-3.5">
                              <span
                                className={`inline-block px-2 py-0.5 rounded text-[10px] font-semibold ${
                                  req.status === 'New'
                                    ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                                    : req.status === 'Contacted'
                                      ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                                      : req.status === 'Confirmed'
                                        ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                                        : 'bg-stone-600/20 text-stone-400 border border-stone-600/30'
                                }`}
                              >
                                {req.status}
                              </span>
                            </td>
                            <td className="py-3 px-3.5 text-right">
                              <select
                                value={req.status}
                                onChange={(e) => handleUpdateRequestStatus(req.id, e.target.value as MockRequest['status'])}
                                className={`px-2 py-1 rounded text-xs border focus:outline-none ${
                                  isDark ? 'bg-[#1B1208] border-[#4A2C16] text-[#F4E8D0]' : 'bg-[#FAF7F0] border-[#E4D4BC] text-[#2A1A0D]'
                                }`}
                              >
                                <option value="New">New</option>
                                <option value="Contacted">Contacted</option>
                                <option value="Confirmed">Confirmed</option>
                                <option value="Completed">Completed</option>
                              </select>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {/* ---------------------------------------------------- */}
            {/* TAB 4: SERVICE DEMAND ANALYSIS */}
            {/* ---------------------------------------------------- */}
            {activeTab === 'demand' && (
              <div className="space-y-6 animate-in fade-in-50 duration-150">
                <div>
                  <h2 className={`font-serif font-bold text-2xl ${isDark ? 'text-[#F4E8D0]' : 'text-[#2A1A0D]'}`}>
                    Services Demand & Attach Rate Analysis
                  </h2>
                  <p className="text-xs opacity-70">
                    Breakdown of customer service preferences and operational volume.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                  <div className={`p-5 rounded-2xl border ${isDark ? 'bg-[#2A1A0D] border-[#4A2C16]' : 'bg-[#F1E8D8] border-[#E4D4BC]'}`}>
                    <div className="flex items-center gap-2 mb-2">
                      <TrendingUp className="w-5 h-5 text-amber-500" />
                      <strong className="font-serif text-base">Meat in KG (Hotels/Restaurants)</strong>
                    </div>
                    <div className="text-2xl font-extrabold font-serif text-amber-500 mb-1">72% Volume Growth</div>
                    <p className="text-xs opacity-80 leading-relaxed mb-3">
                      High commercial demand from Bole, Kazanchis, and Sarbet restaurants ordering sheep, goat, and beef by the kg.
                    </p>
                    <div className="w-full bg-stone-700/30 rounded-full h-2 overflow-hidden">
                      <div className="bg-amber-500 h-full w-[72%]" />
                    </div>
                  </div>

                  <div className={`p-5 rounded-2xl border ${isDark ? 'bg-[#2A1A0D] border-[#4A2C16]' : 'bg-[#F1E8D8] border-[#E4D4BC]'}`}>
                    <div className="flex items-center gap-2 mb-2">
                      <Sparkles className="w-5 h-5 text-amber-500" />
                      <strong className="font-serif text-base">Fresh Slaughtered Sheep Delivery</strong>
                    </div>
                    <div className="text-2xl font-extrabold font-serif text-amber-500 mb-1">61% Consumer Orders</div>
                    <p className="text-xs opacity-80 leading-relaxed mb-3">
                      Customers prefer receiving clean, farm-slaughtered sheep ready for cooking without home holding or cleaning.
                    </p>
                    <div className="w-full bg-stone-700/30 rounded-full h-2 overflow-hidden">
                      <div className="bg-amber-500 h-full w-[61%]" />
                    </div>
                  </div>

                  <div className={`p-5 rounded-2xl border ${isDark ? 'bg-[#2A1A0D] border-[#4A2C16]' : 'bg-[#F1E8D8] border-[#E4D4BC]'}`}>
                    <div className="flex items-center gap-2 mb-2">
                      <Truck className="w-5 h-5 text-amber-500" />
                      <strong className="font-serif text-base">Live Livestock Delivery</strong>
                    </div>
                    <div className="text-2xl font-extrabold font-serif text-amber-500 mb-1">76% of Inquiries</div>
                    <p className="text-xs opacity-80 leading-relaxed mb-3">
                      High volume across all sub-cities of Addis Ababa, Bishoftu, and Adama. Shipments originate directly from Aware.
                    </p>
                    <div className="w-full bg-stone-700/30 rounded-full h-2 overflow-hidden">
                      <div className="bg-amber-500 h-full w-[76%]" />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* ---------------------------------------------------- */}
            {/* TAB 5: FARM SETTINGS & PROFILE */}
            {/* ---------------------------------------------------- */}
            {activeTab === 'settings' && (
              <div className="space-y-6 animate-in fade-in-50 duration-150">
                <div>
                  <h2 className={`font-serif font-bold text-2xl ${isDark ? 'text-[#F4E8D0]' : 'text-[#2A1A0D]'}`}>
                    Farm Configuration & Owner Settings
                  </h2>
                  <p className="text-xs opacity-70">
                    Centralized business contact information and operating guidelines.
                  </p>
                </div>

                <div
                  className={`p-6 rounded-3xl border space-y-4 ${
                    isDark ? 'bg-[#2A1A0D] border-[#4A2C16]' : 'bg-[#F1E8D8] border-[#E4D4BC]'
                  }`}
                >
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                    <div>
                      <span className="block opacity-70 uppercase font-semibold mb-1">Business Name</span>
                      <div className="p-3 rounded-xl border font-semibold" style={{ borderColor: isDark ? '#4A2C16' : '#E4D4BC' }}>
                        {business.name}
                      </div>
                    </div>

                    <div>
                      <span className="block opacity-70 uppercase font-semibold mb-1">Tagline</span>
                      <div className="p-3 rounded-xl border font-semibold" style={{ borderColor: isDark ? '#4A2C16' : '#E4D4BC' }}>
                        {business.tagline}
                      </div>
                    </div>

                    <div>
                      <span className="block opacity-70 uppercase font-semibold mb-1">Direct Phone</span>
                      <div className="p-3 rounded-xl border font-semibold" style={{ borderColor: isDark ? '#4A2C16' : '#E4D4BC' }}>
                        {business.displayPhone}
                      </div>
                    </div>

                    <div>
                      <span className="block opacity-70 uppercase font-semibold mb-1">WhatsApp Number</span>
                      <div className="p-3 rounded-xl border font-semibold" style={{ borderColor: isDark ? '#4A2C16' : '#E4D4BC' }}>
                        {business.displayWhatsapp}
                      </div>
                    </div>

                    <div>
                      <span className="block opacity-70 uppercase font-semibold mb-1">Farm Location</span>
                      <div className="p-3 rounded-xl border font-semibold" style={{ borderColor: isDark ? '#4A2C16' : '#E4D4BC' }}>
                        {business.location}
                      </div>
                    </div>

                    <div>
                      <span className="block opacity-70 uppercase font-semibold mb-1">Operating Hours</span>
                      <div className="p-3 rounded-xl border font-semibold" style={{ borderColor: isDark ? '#4A2C16' : '#E4D4BC' }}>
                        {business.businessHours}
                      </div>
                    </div>
                  </div>

                  <div className="pt-3 border-t text-xs opacity-75" style={{ borderColor: isDark ? '#4A2C16' : '#E4D4BC' }}>
                    * Configuration values are synced from <code className="font-mono">src/config/business.ts</code> and ready for database connection.
                  </div>
                </div>
              </div>
            )}

          </main>

        </div>

      </div>
    </div>
  );
};
