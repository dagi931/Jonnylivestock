import React, { useState, useMemo, useEffect } from 'react';
import { useAdminAuth } from '../context/AdminAuthContext';
import { mockAnimals as fallbackAnimals } from '../data/animals';
import { Animal, AnimalType, AnimalStatus } from '../types/animal';
import { StatusBadge } from '../components/common/StatusBadge';
import { formatPrice, formatWeight } from '../utils/formatters';
import { useTheme } from '../context/ThemeContext';
import { api, Order, AdminNotification } from '../services/api';
import { SlipPreviewModal } from '../components/modals/SlipPreviewModal';
import { useRealtimeEvent, useRealtime } from '../context/RealtimeContext';
import {
  DollarSign,
  ShoppingBag,
  Search,
  CheckCircle2,
  ArrowUpRight,
  Lock,
  Mail,
  Eye,
  EyeOff,
  LogOut,
  LayoutDashboard,
  BarChart3,
  Shield,
  Layers,
  AlertCircle,
  Bell,
  Check,
  X,
  CreditCard,
  Plus,
  RefreshCw,
  Clock
} from 'lucide-react';
import { Link } from 'react-router-dom';

type AdminTab = 'overview' | 'orders' | 'inventory' | 'demand' | 'settings';

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

  // Dashboard Active Tab
  const [activeTab, setActiveTab] = useState<AdminTab>('overview');

  // Backend Live Data
  const [animalsList, setAnimalsList] = useState<Animal[]>(fallbackAnimals);
  const [ordersList, setOrdersList] = useState<Order[]>([]);
  const [notifications, setNotifications] = useState<AdminNotification[]>([]);
  const [unreadNotifsCount, setUnreadNotifsCount] = useState<number>(0);
  const [isNotifDropdownOpen, setIsNotifDropdownOpen] = useState(false);
  const [isLoadingData, setIsLoadingData] = useState(false);

  // Slip Inspector State
  const [selectedSlipOrder, setSelectedSlipOrder] = useState<Order | null>(null);

  // Action status message
  const [actionAlert, setActionAlert] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Filtering & Search
  const [orderStatusFilter, setOrderStatusFilter] = useState<string>('all');
  const [selectedTypeFilter, setSelectedTypeFilter] = useState<string>('all');
  const [selectedStatusFilter, setSelectedStatusFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Add Animal Modal
  const [isAddAnimalOpen, setIsAddAnimalOpen] = useState(false);
  const [newAnimalType, setNewAnimalType] = useState<AnimalType>('sheep');
  const [newAnimalBreed, setNewAnimalBreed] = useState('');
  const [newAnimalWeight, setNewAnimalWeight] = useState(30);
  const [newAnimalPrice, setNewAnimalPrice] = useState(15000);
  const [newAnimalColor, setNewAnimalColor] = useState('Natural');
  const [newAnimalDesc, setNewAnimalDesc] = useState('');
  const [newAnimalImage, setNewAnimalImage] = useState('');

  // Load Data from Backend
  const loadDashboardData = async () => {
    setIsLoadingData(true);
    try {
      const [fetchedAnimals, fetchedOrders, notifRes] = await Promise.all([
        api.getAnimals(),
        api.getAllOrders(),
        api.getNotifications()
      ]);

      if (fetchedAnimals && fetchedAnimals.length > 0) {
        setAnimalsList(fetchedAnimals);
      }
      setOrdersList(fetchedOrders || []);
      setNotifications(notifRes.data || []);
      setUnreadNotifsCount(notifRes.unreadCount || 0);
    } catch (err) {
      console.error('Failed to load backend data:', err);
    } finally {
      setIsLoadingData(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      loadDashboardData();
      const interval = setInterval(loadDashboardData, 15000); // Polling every 15s for live slip uploads
      return () => clearInterval(interval);
    }
  }, [isAuthenticated]);

  const { isConnected } = useRealtime();

  // 🚀 REALTIME LISTENER: New Payment Slip Uploaded by Customer
  useRealtimeEvent<{ order: Order; notification: AdminNotification; animal: Animal | null }>('NEW_ORDER_SLIP', (data) => {
    if (!data || !data.order) return;
    
    // Add order to list if not already present
    setOrdersList(prev => {
      if (prev.some(o => o.id === data.order.id)) return prev;
      return [data.order, ...prev];
    });

    // Add notification to list
    if (data.notification) {
      setNotifications(prev => [data.notification, ...prev]);
      setUnreadNotifsCount(prev => prev + 1);
    }

    // Update animal status to reserved if provided
    if (data.animal) {
      setAnimalsList(prev => {
        const idx = prev.findIndex(a => a.id.toLowerCase() === data.animal!.id.toLowerCase());
        if (idx === -1) return prev;
        const copy = [...prev];
        copy[idx] = { ...copy[idx], ...data.animal };
        return copy;
      });
    }

    // Show instant prominent notification toast
    showAlert('success', `🔔 New Payment Slip uploaded by ${data.order.customerName} for ${data.order.animalBreed} (${data.order.totalAmount.toLocaleString()} ETB)!`);
  });

  // 🚀 REALTIME LISTENER: Order Verified & Payment Approved
  useRealtimeEvent<{ order: Order; animal: Animal | null; notification: AdminNotification }>('ORDER_VERIFIED', (data) => {
    if (!data || !data.order) return;

    setOrdersList(prev => {
      const idx = prev.findIndex(o => o.id === data.order.id);
      if (idx === -1) return [data.order, ...prev];
      const copy = [...prev];
      copy[idx] = { ...copy[idx], ...data.order };
      return copy;
    });

    if (data.animal) {
      setAnimalsList(prev => {
        const idx = prev.findIndex(a => a.id.toLowerCase() === data.animal!.id.toLowerCase());
        if (idx === -1) return prev;
        const copy = [...prev];
        copy[idx] = { ...copy[idx], ...data.animal };
        return copy;
      });
    }

    if (data.notification) {
      setNotifications(prev => [data.notification, ...prev]);
      setUnreadNotifsCount(prev => prev + 1);
    }
  });

  // 🚀 REALTIME LISTENER: Order Rejected
  useRealtimeEvent<{ order: Order; animal: Animal | null }>('ORDER_REJECTED', (data) => {
    if (!data || !data.order) return;

    setOrdersList(prev => {
      const idx = prev.findIndex(o => o.id === data.order.id);
      if (idx === -1) return [data.order, ...prev];
      const copy = [...prev];
      copy[idx] = { ...copy[idx], ...data.order };
      return copy;
    });

    if (data.animal) {
      setAnimalsList(prev => {
        const idx = prev.findIndex(a => a.id.toLowerCase() === data.animal!.id.toLowerCase());
        if (idx === -1) return prev;
        const copy = [...prev];
        copy[idx] = { ...copy[idx], ...data.animal };
        return copy;
      });
    }
  });

  // 🚀 REALTIME LISTENER: Live Animal Inventory Changes
  useRealtimeEvent<Animal>('ANIMAL_CREATED', (created) => {
    if (!created) return;
    setAnimalsList(prev => {
      if (prev.some(a => a.id === created.id)) return prev;
      return [created, ...prev];
    });
  });

  useRealtimeEvent<Animal>('ANIMAL_UPDATED', (updated) => {
    if (!updated) return;
    setAnimalsList(prev => {
      const idx = prev.findIndex(a => a.id.toLowerCase() === updated.id.toLowerCase());
      if (idx === -1) return prev;
      const copy = [...prev];
      copy[idx] = { ...copy[idx], ...updated };
      return copy;
    });
  });

  useRealtimeEvent<{ id: string }>('ANIMAL_DELETED', ({ id }) => {
    if (!id) return;
    setAnimalsList(prev => prev.filter(a => a.id.toLowerCase() !== id.toLowerCase()));
  });

  useRealtimeEvent<{ id?: string; all?: boolean }>('NOTIFICATIONS_READ', (payload) => {
    if (payload?.all) {
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
      setUnreadNotifsCount(0);
    } else if (payload?.id) {
      setNotifications(prev => prev.map(n => n.id === payload.id ? { ...n, read: true } : n));
      setUnreadNotifsCount(prev => Math.max(0, prev - 1));
    }
  });

  // Flash alert helper
  const showAlert = (type: 'success' | 'error', message: string) => {
    setActionAlert({ type, message });
    setTimeout(() => setActionAlert(null), 6000);
  };

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

    const pendingOrdersCount = ordersList.filter(o => o.status === 'pending_verification').length;
    const verifiedOrdersCount = ordersList.filter(o => o.status === 'verified').length;
    const verifiedRevenue = ordersList
      .filter(o => o.status === 'verified')
      .reduce((acc, o) => acc + o.totalAmount, 0);

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
      pendingOrdersCount,
      verifiedOrdersCount,
      verifiedRevenue,
      sheepValue: sheep.reduce((acc, a) => acc + a.price, 0),
      goatValue: goats.reduce((acc, a) => acc + a.price, 0),
      cowValue: cows.reduce((acc, a) => acc + a.price, 0)
    };
  }, [animalsList, ordersList]);

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

  // Filtered Orders for Table
  const filteredOrders = useMemo(() => {
    return ordersList.filter((order) => {
      const matchesStatus = orderStatusFilter === 'all' || order.status === orderStatusFilter;
      const matchesSearch =
        searchQuery === '' ||
        order.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        order.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        order.customerPhone.includes(searchQuery) ||
        order.animalBreed.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesStatus && matchesSearch;
    });
  }, [ordersList, orderStatusFilter, searchQuery]);

  // Handle Verify Order & Mark Sold
  const handleVerifyOrder = async (orderId: string) => {
    const res = await api.verifyOrder(orderId, 'Verified payment slip via Admin panel');
    if (res.success) {
      showAlert('success', `✓ Order ${orderId} verified! Corresponding animal marked as SOLD.`);
      loadDashboardData();
    } else {
      showAlert('error', res.error || 'Failed to verify order');
    }
  };

  // Handle Reject Order
  const handleRejectOrder = async (orderId: string) => {
    const reason = window.prompt('Enter reason for rejecting order (e.g. Invalid transfer slip):');
    if (!reason) return;

    const res = await api.rejectOrder(orderId, reason);
    if (res.success) {
      showAlert('success', `Order ${orderId} rejected.`);
      loadDashboardData();
    } else {
      showAlert('error', res.error || 'Failed to reject order');
    }
  };

  // Handle Toggle Animal Status
  const handleToggleStatus = async (animalId: string, newStatus: AnimalStatus) => {
    const res = await api.updateAnimal(animalId, { status: newStatus });
    if (res.success) {
      setAnimalsList((prev) =>
        prev.map((a) => (a.id === animalId ? { ...a, status: newStatus } : a))
      );
      showAlert('success', `Animal ${animalId} status set to ${newStatus}.`);
    } else {
      showAlert('error', res.error || 'Failed to update animal status');
    }
  };

  // Handle Add Animal
  const handleAddAnimalSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAnimalBreed.trim()) {
      showAlert('error', 'Breed name is required');
      return;
    }

    const defaultImg = newAnimalType === 'sheep'
      ? 'https://images.unsplash.com/photo-1484557052118-f32bd25b45b5?auto=format&fit=crop&w=1200&q=80'
      : newAnimalType === 'goat'
      ? 'https://images.unsplash.com/photo-1524024973431-2ad916746881?auto=format&fit=crop&w=1200&q=80'
      : 'https://images.unsplash.com/photo-1546445317-29f4545e9d53?auto=format&fit=crop&w=1200&q=80';

    const res = await api.createAnimal({
      type: newAnimalType,
      breed: newAnimalBreed.trim(),
      weight: Number(newAnimalWeight),
      price: Number(newAnimalPrice),
      color: newAnimalColor || 'Natural',
      description: newAnimalDesc || 'Prime livestock pasture-raised in organic conditions.',
      images: [newAnimalImage.trim() || defaultImg],
      location: 'Aware, Addis Ababa',
      gender: 'Male',
      featured: true,
      characteristics: ['Healthy pedigree', 'Pasture raised', 'Vaccinated']
    });

    if (res.success && res.data) {
      showAlert('success', `Animal ${res.data.id} (${res.data.breed}) created successfully!`);
      setIsAddAnimalOpen(false);
      setNewAnimalBreed('');
      setNewAnimalDesc('');
      setNewAnimalImage('');
      loadDashboardData();
    } else {
      showAlert('error', res.error || 'Failed to create animal');
    }
  };

  // Handle Login Submit
  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');
    setIsLoggingIn(true);

    try {
      const res = await login(emailInput, passwordInput);
      if (!res.success) {
        setLoginError(res.error || 'Login failed');
      }
    } catch {
      setLoginError('Authentication failed');
    } finally {
      setIsLoggingIn(false);
    }
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
              Sign in with your administrator credentials to verify payment slips and manage livestock inventory.
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
  // VIEW 2: AUTHENTICATED ADMIN DASHBOARD
  // ==========================================
  return (
    <div className={`min-h-screen pb-16 transition-colors duration-300 ${isDark ? 'bg-[#1B1208] text-[#F4E8D0]' : 'bg-[#FAF7F0] text-[#241A12]'}`}>
      
      {/* Top Banner with Real-Time Notification Bell & Refresh */}
      <div className={`border-b sticky top-16 z-40 backdrop-blur-md ${isDark ? 'bg-[#1B1208]/90 border-[#4A2C16]' : 'bg-[#FAF7F0]/90 border-[#E4D4BC]'}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-[#C18A45]/20 text-[#C18A45] flex items-center justify-center font-bold font-serif text-sm">
              JL
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-sm sm:text-base">Jonny Admin Portal</span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                  LIVE API
                </span>
              </div>
              <p className="text-[11px] opacity-70">
                Logged in as: <strong className="text-[#C18A45]">{user?.name}</strong> ({user?.email})
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Realtime Stream Badge */}
            <div
              className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-[11px] font-semibold border"
              style={{
                backgroundColor: isConnected ? (isDark ? 'rgba(16, 185, 129, 0.1)' : '#E8F5E9') : (isDark ? 'rgba(239, 68, 68, 0.1)' : '#FFEBEE'),
                borderColor: isConnected ? 'rgba(16, 185, 129, 0.3)' : 'rgba(239, 68, 68, 0.3)',
                color: isConnected ? '#10B981' : '#EF4444'
              }}
            >
              <span className={`w-2 h-2 rounded-full ${isConnected ? 'bg-emerald-500 animate-pulse' : 'bg-red-500'}`} />
              <span>{isConnected ? 'Live Stream Active' : 'Connecting Stream...'}</span>
            </div>

            {/* Refresh Button */}
            <button
              onClick={loadDashboardData}
              disabled={isLoadingData}
              className={`p-2 rounded-xl border text-xs font-semibold flex items-center gap-1.5 transition-colors ${
                isDark ? 'bg-[#2A1A0D] border-[#4A2C16] hover:bg-[#3A2412]' : 'bg-white border-[#E4D4BC] hover:bg-[#EFE8DC]'
              }`}
              title="Refresh Data"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isLoadingData ? 'animate-spin text-[#C18A45]' : ''}`} />
              <span className="hidden sm:inline">Refresh</span>
            </button>

            {/* Notifications Dropdown */}
            <div className="relative">
              <button
                onClick={() => setIsNotifDropdownOpen(!isNotifDropdownOpen)}
                className={`relative p-2 rounded-xl border transition-colors ${
                  isDark ? 'bg-[#2A1A0D] border-[#4A2C16] hover:bg-[#3A2412]' : 'bg-white border-[#E4D4BC] hover:bg-[#EFE8DC]'
                }`}
                aria-label="Notifications"
              >
                <Bell className="w-4 h-4 text-[#C18A45]" />
                {unreadNotifsCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-red-500 text-white text-[10px] font-bold flex items-center justify-center animate-pulse">
                    {unreadNotifsCount}
                  </span>
                )}
              </button>

              {isNotifDropdownOpen && (
                <div
                  className={`absolute right-0 mt-2 w-80 sm:w-96 rounded-2xl shadow-2xl border p-3 z-50 animate-in fade-in zoom-in-95 duration-150 ${
                    isDark ? 'bg-[#24170D] border-[#4A2C16] text-[#F4E8D0]' : 'bg-white border-[#E4D4BC] text-[#2A1A0D]'
                  }`}
                >
                  <div className="flex justify-between items-center pb-2 border-b border-black/10 dark:border-white/10 mb-2">
                    <span className="font-bold text-xs">Admin Notifications</span>
                    <span className="text-[10px] opacity-70">{notifications.length} Total</span>
                  </div>
                  <div className="max-h-64 overflow-y-auto space-y-2">
                    {notifications.length === 0 ? (
                      <p className="text-xs opacity-60 text-center py-4">No notifications yet</p>
                    ) : (
                      notifications.map((n) => (
                        <div
                          key={n.id}
                          className={`p-2.5 rounded-xl border text-xs ${
                            n.read
                              ? 'opacity-60 bg-transparent border-transparent'
                              : isDark
                              ? 'bg-[#1B1208] border-[#C18A45]/30'
                              : 'bg-[#F9F6F0] border-[#C18A45]/30'
                          }`}
                        >
                          <div className="font-bold text-[#C18A45]">{n.title}</div>
                          <p className="text-[11px] mt-0.5 opacity-90">{n.message}</p>
                          <span className="text-[9px] opacity-50 block mt-1">
                            {new Date(n.createdAt).toLocaleTimeString()}
                          </span>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Logout */}
            <button
              onClick={logout}
              className="p-2 rounded-xl bg-red-500/10 text-red-400 border border-red-500/20 hover:bg-red-500/20 transition-colors"
              title="Sign Out"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Action Flash Alert */}
      {actionAlert && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-4 animate-in fade-in slide-in-from-top-2">
          <div
            className={`p-3.5 rounded-2xl border flex items-center justify-between gap-3 text-xs font-semibold ${
              actionAlert.type === 'success'
                ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                : 'bg-red-500/10 border-red-500/30 text-red-400'
            }`}
          >
            <span>{actionAlert.message}</span>
            <button onClick={() => setActionAlert(null)}>
              <X className="w-4 h-4 opacity-70 hover:opacity-100" />
            </button>
          </div>
        </div>
      )}

      {/* Main Dashboard Container */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
        
        {/* Navigation Tabs */}
        <div className="flex flex-wrap items-center gap-2 border-b pb-4 mb-6" style={{ borderColor: isDark ? '#4A2C16' : '#E4D4BC' }}>
          <button
            onClick={() => setActiveTab('overview')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'overview'
                ? 'bg-[#C18A45] text-white shadow-md'
                : isDark ? 'hover:bg-[#2A1A0D] text-[#D8C5A8]' : 'hover:bg-[#F1E8D8] text-[#746556]'
            }`}
          >
            <LayoutDashboard className="w-4 h-4" />
            <span>Overview</span>
          </button>

          <button
            onClick={() => setActiveTab('orders')}
            className={`relative flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'orders'
                ? 'bg-[#C18A45] text-white shadow-md'
                : isDark ? 'hover:bg-[#2A1A0D] text-[#D8C5A8]' : 'hover:bg-[#F1E8D8] text-[#746556]'
            }`}
          >
            <CreditCard className="w-4 h-4" />
            <span>Orders & Payment Slips</span>
            {stats.pendingOrdersCount > 0 && (
              <span className="px-1.5 py-0.2 rounded-full bg-amber-500 text-black text-[10px] font-black">
                {stats.pendingOrdersCount}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('inventory')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'inventory'
                ? 'bg-[#C18A45] text-white shadow-md'
                : isDark ? 'hover:bg-[#2A1A0D] text-[#D8C5A8]' : 'hover:bg-[#F1E8D8] text-[#746556]'
            }`}
          >
            <Layers className="w-4 h-4" />
            <span>Livestock Inventory ({animalsList.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('demand')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'demand'
                ? 'bg-[#C18A45] text-white shadow-md'
                : isDark ? 'hover:bg-[#2A1A0D] text-[#D8C5A8]' : 'hover:bg-[#F1E8D8] text-[#746556]'
            }`}
          >
            <BarChart3 className="w-4 h-4" />
            <span>Demand & Metrics</span>
          </button>
        </div>

        {/* ============================================================ */}
        {/* TAB 1: OVERVIEW & METRICS */}
        {/* ============================================================ */}
        {activeTab === 'overview' && (
          <div className="space-y-6 animate-in fade-in-50 duration-150">
            {/* KPI Cards Grid */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <div className={`p-4 sm:p-5 rounded-2xl border ${isDark ? 'bg-[#2A1A0D] border-[#4A2C16]' : 'bg-[#F1E8D8] border-[#E4D4BC]'}`}>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[11px] font-semibold uppercase tracking-wider opacity-70">Verified Revenue</span>
                  <div className="w-7 h-7 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
                    <DollarSign className="w-3.5 h-3.5" />
                  </div>
                </div>
                <div className="text-xl sm:text-2xl font-serif font-extrabold text-[#C18A45]">
                  {formatPrice(stats.verifiedRevenue)}
                </div>
                <p className="text-[11px] opacity-70 mt-1">
                  {stats.verifiedOrdersCount} Verified Payments
                </p>
              </div>

              <div className={`p-4 sm:p-5 rounded-2xl border ${isDark ? 'bg-[#2A1A0D] border-[#4A2C16]' : 'bg-[#F1E8D8] border-[#E4D4BC]'}`}>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[11px] font-semibold uppercase tracking-wider opacity-70">Pending Slips</span>
                  <div className="w-7 h-7 rounded-lg bg-amber-500/10 text-amber-500 flex items-center justify-center">
                    <Clock className="w-3.5 h-3.5" />
                  </div>
                </div>
                <div className="text-xl sm:text-2xl font-serif font-extrabold text-amber-400">
                  {stats.pendingOrdersCount} Slips
                </div>
                <p className="text-[11px] opacity-70 mt-1">
                  Awaiting your approval
                </p>
              </div>

              <div className={`p-4 sm:p-5 rounded-2xl border ${isDark ? 'bg-[#2A1A0D] border-[#4A2C16]' : 'bg-[#F1E8D8] border-[#E4D4BC]'}`}>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[11px] font-semibold uppercase tracking-wider opacity-70">Total Animals</span>
                  <div className="w-7 h-7 rounded-lg bg-blue-500/10 text-blue-500 flex items-center justify-center">
                    <ShoppingBag className="w-3.5 h-3.5" />
                  </div>
                </div>
                <div className="text-xl sm:text-2xl font-serif font-extrabold">
                  {stats.totalAnimals} Head
                </div>
                <p className="text-[11px] opacity-70 mt-1">
                  {stats.sheepCount} Sheep · {stats.goatsCount} Goats · {stats.cowsCount} Cows
                </p>
              </div>

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
                  <div style={{ width: `${(stats.availableCount / (stats.totalAnimals || 1)) * 100}%` }} className="bg-green-500 h-full" />
                  <div style={{ width: `${(stats.reservedCount / (stats.totalAnimals || 1)) * 100}%` }} className="bg-amber-500 h-full" />
                  <div style={{ width: `${(stats.soldCount / (stats.totalAnimals || 1)) * 100}%` }} className="bg-stone-500 h-full" />
                </div>
              </div>
            </div>

            {/* Quick Pending Slips Action Banner */}
            {stats.pendingOrdersCount > 0 && (
              <div
                className={`p-5 rounded-3xl border flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
                  isDark ? 'bg-[#2A1A0D] border-amber-500/40' : 'bg-[#FFF8EC] border-amber-500/40'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-amber-500/20 text-amber-500 flex items-center justify-center flex-shrink-0">
                    <Clock className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-serif font-bold text-base text-amber-400">
                      {stats.pendingOrdersCount} Customer Payment Slips Awaiting Review
                    </h3>
                    <p className="text-xs opacity-75">
                      Verify transactions to automatically deduct inventory and mark livestock items as SOLD.
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setActiveTab('orders')}
                  className="px-5 py-2.5 rounded-xl bg-[#C18A45] hover:bg-[#A06E35] text-white font-bold text-xs shadow-md transition-all self-start sm:self-auto flex items-center gap-1.5"
                >
                  <span>Review Slips Now</span>
                  <ArrowUpRight className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        )}

        {/* ============================================================ */}
        {/* TAB 2: ORDERS & SLIP VERIFICATION */}
        {/* ============================================================ */}
        {activeTab === 'orders' && (
          <div className="space-y-5 animate-in fade-in-50 duration-150">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h2 className="font-serif font-bold text-2xl">
                  Customer Orders & Payment Slip Verification
                </h2>
                <p className="text-xs opacity-70">
                  Inspect customer-uploaded transfer receipts and verify transactions. Once approved, the animal is automatically marked as SOLD.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <select
                  value={orderStatusFilter}
                  onChange={(e) => setOrderStatusFilter(e.target.value)}
                  className={`px-3 py-2 rounded-xl text-xs border focus:outline-none ${
                    isDark ? 'bg-[#1B1208] border-[#4A2C16] text-[#F4E8D0]' : 'bg-[#FAF7F0] border-[#E4D4BC] text-[#2A1A0D]'
                  }`}
                >
                  <option value="all">All Orders</option>
                  <option value="pending_verification">Pending Slips ({stats.pendingOrdersCount})</option>
                  <option value="verified">Verified / Sold</option>
                  <option value="rejected">Rejected</option>
                </select>
              </div>
            </div>

            {/* Orders Table */}
            <div
              className={`rounded-3xl border overflow-hidden shadow-sm ${
                isDark ? 'bg-[#2A1A0D] border-[#4A2C16]' : 'bg-[#F1E8D8] border-[#E4D4BC]'
              }`}
            >
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className={`border-b ${isDark ? 'border-[#4A2C16] text-[#D8C5A8]' : 'border-[#E4D4BC] text-[#746556]'}`}>
                      <th className="py-3.5 px-3.5 uppercase font-semibold">Order ID</th>
                      <th className="py-3.5 px-3.5 uppercase font-semibold">Customer</th>
                      <th className="py-3.5 px-3.5 uppercase font-semibold">Animal & Price</th>
                      <th className="py-3.5 px-3.5 uppercase font-semibold">Payment Slip</th>
                      <th className="py-3.5 px-3.5 uppercase font-semibold">Payment Method</th>
                      <th className="py-3.5 px-3.5 uppercase font-semibold">Status</th>
                      <th className="py-3.5 px-3.5 uppercase font-semibold text-right">Verification Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y" style={{ borderColor: isDark ? '#4A2C16' : '#E4D4BC' }}>
                    {filteredOrders.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="text-center py-8 opacity-60">
                          No orders found matching filter
                        </td>
                      </tr>
                    ) : (
                      filteredOrders.map((order) => (
                        <tr key={order.id} className={`hover:bg-black/10 transition-colors ${isDark ? 'text-[#F4E8D0]' : 'text-[#2A1A0D]'}`}>
                          {/* Order ID */}
                          <td className="py-3.5 px-3.5 font-mono font-bold">
                            <div>{order.id}</div>
                            <span className="text-[10px] opacity-50">
                              {new Date(order.createdAt).toLocaleDateString()}
                            </span>
                          </td>

                          {/* Customer */}
                          <td className="py-3.5 px-3.5">
                            <strong className="block text-sm">{order.customerName}</strong>
                            <span className="text-[11px] opacity-70 block">{order.customerPhone}</span>
                            {order.deliveryLocation && (
                              <span className="text-[10px] opacity-50 truncate max-w-[150px] block">
                                📍 {order.deliveryLocation}
                              </span>
                            )}
                          </td>

                          {/* Animal */}
                          <td className="py-3.5 px-3.5">
                            <div className="font-semibold">{order.animalBreed}</div>
                            <span className="text-[10px] font-mono opacity-60">{order.animalId}</span>
                            <div className={`font-bold text-sm ${isDark ? 'text-[#E0B15A]' : 'text-[#B8792F]'}`}>
                              {formatPrice(order.totalAmount)}
                            </div>
                          </td>

                          {/* Slip Preview Thumbnail */}
                          <td className="py-3.5 px-3.5">
                            {order.paymentSlipUrl ? (
                              <button
                                type="button"
                                onClick={() => setSelectedSlipOrder(order)}
                                className="group relative inline-flex items-center gap-1.5 p-1 rounded-xl border border-[#C18A45]/30 hover:border-[#C18A45] transition-all bg-black/20"
                                title="Click to inspect slip"
                              >
                                <img
                                  src={order.paymentSlipUrl}
                                  alt="Receipt"
                                  className="w-12 h-12 object-cover rounded-lg"
                                />
                                <span className="text-[10px] font-bold text-[#C18A45] pr-1.5">
                                  View Slip
                                </span>
                              </button>
                            ) : (
                              <span className="text-[10px] opacity-40">No Slip</span>
                            )}
                          </td>

                          {/* Method */}
                          <td className="py-3.5 px-3.5">
                            <div className="font-semibold">{order.paymentMethod}</div>
                            {order.transactionReference && (
                              <span className="text-[10px] font-mono opacity-70 block">
                                Txn: {order.transactionReference}
                              </span>
                            )}
                          </td>

                          {/* Status */}
                          <td className="py-3.5 px-3.5">
                            <span
                              className={`inline-block px-2.5 py-1 rounded-full text-[10px] font-bold ${
                                order.status === 'pending_verification'
                                  ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30 animate-pulse'
                                  : order.status === 'verified'
                                  ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                                  : 'bg-red-500/20 text-red-400 border border-red-500/30'
                              }`}
                            >
                              {order.status === 'pending_verification' ? 'Pending Slip Review' : order.status === 'verified' ? 'Verified / Sold' : 'Rejected'}
                            </span>
                          </td>

                          {/* Actions */}
                          <td className="py-3.5 px-3.5 text-right">
                            <div className="inline-flex items-center gap-1.5">
                              {order.status === 'pending_verification' ? (
                                <>
                                  <button
                                    onClick={() => handleVerifyOrder(order.id)}
                                    className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow transition-all flex items-center gap-1"
                                    title="Verify payment and mark animal as SOLD"
                                  >
                                    <Check className="w-3.5 h-3.5" />
                                    <span>Verify & Mark Sold</span>
                                  </button>
                                  <button
                                    onClick={() => handleRejectOrder(order.id)}
                                    className="p-1.5 rounded-xl bg-red-500/20 hover:bg-red-500/30 text-red-400 transition-colors"
                                    title="Reject slip"
                                  >
                                    <X className="w-4 h-4" />
                                  </button>
                                </>
                              ) : (
                                <span className="text-[11px] opacity-60 italic">
                                  {order.status === 'verified' ? `Verified by ${order.verifiedBy || 'Admin'}` : 'Processed'}
                                </span>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ============================================================ */}
        {/* TAB 3: LIVESTOCK INVENTORY */}
        {/* ============================================================ */}
        {activeTab === 'inventory' && (
          <div className="space-y-5 animate-in fade-in-50 duration-150">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h2 className="font-serif font-bold text-2xl">
                  Livestock Inventory Manager
                </h2>
                <p className="text-xs opacity-70">
                  Search, inspect, toggle availability, and add new livestock listings.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <button
                  onClick={() => setIsAddAnimalOpen(true)}
                  className="px-3.5 py-1.5 rounded-xl bg-[#C18A45] hover:bg-[#A06E35] text-white text-xs font-bold shadow transition-colors flex items-center gap-1.5"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Animal</span>
                </button>

                <div className="relative">
                  <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 opacity-60" />
                  <input
                    type="text"
                    placeholder="Search ID, breed..."
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

            {/* Inventory Table */}
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
                      <th className="py-3 px-3.5 uppercase font-semibold">Status</th>
                      <th className="py-3 px-3.5 uppercase font-semibold text-right">Quick Toggle Status</th>
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

        {/* ============================================================ */}
        {/* TAB 4: DEMAND & METRICS */}
        {/* ============================================================ */}
        {activeTab === 'demand' && (
          <div className="space-y-6 animate-in fade-in-50 duration-150">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              <div className={`p-5 rounded-2xl border ${isDark ? 'bg-[#2A1A0D] border-[#4A2C16]' : 'bg-[#F1E8D8] border-[#E4D4BC]'}`}>
                <div className="flex items-center justify-between pb-2.5 border-b" style={{ borderColor: isDark ? '#4A2C16' : '#E4D4BC' }}>
                  <strong className="font-serif text-sm">Sheep Inventory Valuation</strong>
                  <span className="text-[11px] font-mono opacity-70">{stats.sheepCount} Head</span>
                </div>
                <div className="pt-2.5 text-lg font-bold text-[#C18A45]">{formatPrice(stats.sheepValue)}</div>
              </div>

              <div className={`p-5 rounded-2xl border ${isDark ? 'bg-[#2A1A0D] border-[#4A2C16]' : 'bg-[#F1E8D8] border-[#E4D4BC]'}`}>
                <div className="flex items-center justify-between pb-2.5 border-b" style={{ borderColor: isDark ? '#4A2C16' : '#E4D4BC' }}>
                  <strong className="font-serif text-sm">Goats Inventory Valuation</strong>
                  <span className="text-[11px] font-mono opacity-70">{stats.goatsCount} Head</span>
                </div>
                <div className="pt-2.5 text-lg font-bold text-[#C18A45]">{formatPrice(stats.goatValue)}</div>
              </div>

              <div className={`p-5 rounded-2xl border ${isDark ? 'bg-[#2A1A0D] border-[#4A2C16]' : 'bg-[#F1E8D8] border-[#E4D4BC]'}`}>
                <div className="flex items-center justify-between pb-2.5 border-b" style={{ borderColor: isDark ? '#4A2C16' : '#E4D4BC' }}>
                  <strong className="font-serif text-sm">Cows Inventory Valuation</strong>
                  <span className="text-[11px] font-mono opacity-70">{stats.cowsCount} Head</span>
                </div>
                <div className="pt-2.5 text-lg font-bold text-[#C18A45]">{formatPrice(stats.cowValue)}</div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Slip Preview Modal */}
      {selectedSlipOrder && (
        <SlipPreviewModal
          isOpen={Boolean(selectedSlipOrder)}
          onClose={() => setSelectedSlipOrder(null)}
          slipUrl={selectedSlipOrder.paymentSlipUrl || ''}
          orderId={selectedSlipOrder.id}
          customerName={selectedSlipOrder.customerName}
        />
      )}

      {/* Add Animal Modal */}
      {isAddAnimalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div
            className={`relative w-full max-w-lg rounded-3xl border shadow-2xl p-6 sm:p-8 animate-in fade-in zoom-in-95 duration-200 ${
              isDark ? 'bg-[#24170D] border-[#4A2C16] text-[#F4E8D0]' : 'bg-white border-[#E4D4BC] text-[#2A1A0D]'
            }`}
          >
            <button
              onClick={() => setIsAddAnimalOpen(false)}
              className="absolute top-5 right-5 p-2 rounded-full opacity-60 hover:opacity-100"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="font-serif font-bold text-xl mb-4 flex items-center gap-2">
              <Plus className="w-5 h-5 text-[#C18A45]" />
              <span>Add New Livestock Listing</span>
            </h3>

            <form onSubmit={handleAddAnimalSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold uppercase mb-1 opacity-80">Type *</label>
                  <select
                    value={newAnimalType}
                    onChange={(e) => setNewAnimalType(e.target.value as AnimalType)}
                    className="w-full px-3 py-2 rounded-xl text-xs border bg-transparent"
                  >
                    <option value="sheep" className="text-black">Sheep</option>
                    <option value="goat" className="text-black">Goat</option>
                    <option value="cow" className="text-black">Cow</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase mb-1 opacity-80">Breed *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Horro, Boer, Boran"
                    value={newAnimalBreed}
                    onChange={(e) => setNewAnimalBreed(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl text-xs border bg-transparent"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold uppercase mb-1 opacity-80">Weight (kg) *</label>
                  <input
                    type="number"
                    required
                    value={newAnimalWeight}
                    onChange={(e) => setNewAnimalWeight(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl text-xs border bg-transparent"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase mb-1 opacity-80">Price (ETB) *</label>
                  <input
                    type="number"
                    required
                    value={newAnimalPrice}
                    onChange={(e) => setNewAnimalPrice(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl text-xs border bg-transparent"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase mb-1 opacity-80">Color</label>
                  <input
                    type="text"
                    placeholder="Solid White"
                    value={newAnimalColor}
                    onChange={(e) => setNewAnimalColor(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl text-xs border bg-transparent"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase mb-1 opacity-80">Description</label>
                <textarea
                  rows={2}
                  placeholder="Prime meat conformation, organic grazing history..."
                  value={newAnimalDesc}
                  onChange={(e) => setNewAnimalDesc(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl text-xs border bg-transparent"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase mb-1 opacity-80">Image URL (Optional)</label>
                <input
                  type="url"
                  placeholder="https://images.unsplash.com/..."
                  value={newAnimalImage}
                  onChange={(e) => setNewAnimalImage(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl text-xs border bg-transparent"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 rounded-xl bg-[#C18A45] hover:bg-[#A06E35] text-white font-bold text-xs shadow transition-all"
              >
                Create Listing
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
