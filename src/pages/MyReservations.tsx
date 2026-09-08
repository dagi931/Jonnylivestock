import React, { useState, useEffect, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Order } from '../types/package';
import { api } from '../services/api';
import { useTheme } from '../context/ThemeContext';
import { useLanguage } from '../context/LanguageContext';
import { useUserAuth } from '../context/UserAuthContext';
import { useAdminAuth } from '../context/AdminAuthContext';
import { useRealtimeEvent } from '../context/RealtimeContext';
import { formatPrice } from '../utils/formatters';
import { FinalPaymentModal } from '../components/modals/FinalPaymentModal';
import { TransactionStagesTracker } from '../components/orders/TransactionStagesTracker';
import {
  ShieldCheck,
  Clock,
  CheckCircle2,
  AlertCircle,
  CreditCard,
  Sparkles,
  Gift,
  Eye,
  Check,
  ShoppingBag,
  Truck,
  MapPin,
  Search,
  Layers
} from 'lucide-react';

export const MyReservations: React.FC = () => {
  const { theme } = useTheme();
  const { isAmharic } = useLanguage();
  const { isAuthenticated, openAuthModal, user: currentUser } = useUserAuth();
  const { isAuthenticated: isAdminAuth, user: adminUser } = useAdminAuth();
  const navigate = useNavigate();
  const isDark = theme === 'design7';

  const isAdmin =
    isAdminAuth ||
    currentUser?.role === 'admin' ||
    adminUser?.role === 'admin' ||
    adminUser?.role === 'Livestock Administrator';

  useEffect(() => {
    if (isAdmin) {
      navigate('/admin?tab=orders&filter=active_reservation', { replace: true });
    }
  }, [isAdmin, navigate]);

  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'all' | 'direct' | 'reservation'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedOrderForFinalPay, setSelectedOrderForFinalPay] = useState<Order | null>(null);
  const [isFinalModalOpen, setIsFinalModalOpen] = useState(false);

  const getAuthSlipUrl = (url?: string | null): string => {
    if (!url) return '';
    const token = typeof window !== 'undefined' ? (localStorage.getItem('jonny_user_token') || localStorage.getItem('jonny_admin_token')) : null;
    if (!token || url.includes('token=')) return url;
    const sep = url.includes('?') ? '&' : '?';
    return `${url}${sep}token=${encodeURIComponent(token)}`;
  };

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const data = await api.getMyOrders();
      setOrders(data);
    } catch (err) {
      console.error('Failed to fetch user orders:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      fetchOrders();
    } else {
      setLoading(false);
    }
  }, [isAuthenticated]);

  // Real-time updates for customer orders
  useRealtimeEvent<{ order: Order }>('ORDER_UPDATED', (data) => {
    if (!data?.order) return;
    setOrders((prev) =>
      prev.map((o) => (o.id === data.order.id ? { ...o, ...data.order } : o))
    );
  });

  useRealtimeEvent<{ order: Order }>('ORDER_VERIFIED', (data) => {
    if (!data?.order) return;
    setOrders((prev) =>
      prev.map((o) => (o.id === data.order.id ? { ...o, ...data.order } : o))
    );
  });

  useRealtimeEvent<{ order: Order }>('DELIVERY_APPROVED', (data) => {
    if (!data?.order) return;
    setOrders((prev) =>
      prev.map((o) => (o.id === data.order.id ? { ...o, ...data.order } : o))
    );
  });

  useRealtimeEvent<{ order: Order }>('ORDER_REJECTED', (data) => {
    if (!data?.order) return;
    setOrders((prev) =>
      prev.map((o) => (o.id === data.order.id ? { ...o, ...data.order } : o))
    );
  });

  // Filter lists
  const directOrders = useMemo(() => orders.filter((o) => !o.isReservation), [orders]);
  const reservations = useMemo(() => orders.filter((o) => Boolean(o.isReservation)), [orders]);

  const displayedOrders = useMemo(() => {
    let list = orders;
    if (activeTab === 'direct') list = directOrders;
    if (activeTab === 'reservation') list = reservations;

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      list = list.filter(
        (o) =>
          o.id.toLowerCase().includes(q) ||
          (o.animalBreed && o.animalBreed.toLowerCase().includes(q)) ||
          (o.packageName && o.packageName.toLowerCase().includes(q)) ||
          (o.deliveryAddress && o.deliveryAddress.toLowerCase().includes(q))
      );
    }
    return list;
  }, [orders, directOrders, reservations, activeTab, searchQuery]);

  const getStatusBadge = (order: Order) => {
    const status = order.status;
    const isRes = Boolean(order.isReservation);

    if (status === 'rejected') {
      return (
        <span className="px-3 py-1 rounded-full text-xs font-bold bg-red-500/15 text-red-400 border border-red-500/30 flex items-center gap-1.5">
          <AlertCircle className="w-3.5 h-3.5" />
          <span>{isAmharic ? 'ውድቅ የተደረገ' : 'Slip Rejected'}</span>
        </span>
      );
    }

    if (!isRes) {
      // Direct Order Status Badges
      switch (status) {
        case 'pending_verification':
          return (
            <span className="px-3 py-1 rounded-full text-xs font-bold bg-amber-500/15 text-amber-400 border border-amber-500/30 flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 animate-pulse" />
              <span>{isAmharic ? 'ክፍያ በመጠባበቅ ላይ' : 'Payment Review Pending'}</span>
            </span>
          );
        case 'verified':
          return (
            <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>{isAmharic ? 'ክፍያ ተረጋግጧል' : 'Payment Confirmed'}</span>
            </span>
          );
        case 'delivery_pending':
          return (
            <span className="px-3 py-1 rounded-full text-xs font-bold bg-blue-500/15 text-blue-400 border border-blue-500/30 flex items-center gap-1.5">
              <Truck className="w-3.5 h-3.5 animate-pulse" />
              <span>{isAmharic ? 'በማድረስ ሂደት ላይ' : 'Out for Delivery'}</span>
            </span>
          );
        case 'pickup_ready':
          return (
            <span className="px-3 py-1 rounded-full text-xs font-bold bg-blue-500/15 text-blue-400 border border-blue-500/30 flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5" />
              <span>{isAmharic ? 'ለርክክብ ዝግጁ ነው' : 'Ready for Hub Pickup'}</span>
            </span>
          );
        case 'delivered':
        case 'completed':
          return (
            <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>{isAmharic ? 'ተጠናቋል' : 'Order Completed'}</span>
            </span>
          );
        default:
          return (
            <span className="px-3 py-1 rounded-full text-xs font-bold bg-neutral-500/15 text-neutral-400 border border-neutral-500/30">
              {status}
            </span>
          );
      }
    } else {
      // Reservation Status Badges
      switch (status) {
        case 'reservation_pending':
          return (
            <span className="px-3 py-1 rounded-full text-xs font-bold bg-amber-500/15 text-amber-400 border border-amber-500/30 flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 animate-pulse" />
              <span>{isAmharic ? 'የቅድመ-ክፍያ ማረጋገጫ' : 'Deposit Review Pending'}</span>
            </span>
          );
        case 'reserved':
          return (
            <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>{isAmharic ? 'ይዞታው ተረጋግጧል (ተቆልፏል)' : 'Reservation Confirmed (Locked)'}</span>
            </span>
          );
        case 'final_payment_pending':
          return (
            <span className="px-3 py-1 rounded-full text-xs font-bold bg-purple-500/15 text-purple-400 border border-purple-500/30 flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 animate-pulse" />
              <span>{isAmharic ? 'የመጨረሻ ክፍያ ማረጋገጫ' : 'Final Slip Review Pending'}</span>
            </span>
          );
        case 'delivery_pending':
          return (
            <span className="px-3 py-1 rounded-full text-xs font-bold bg-blue-500/15 text-blue-400 border border-blue-500/30 flex items-center gap-1.5">
              <Truck className="w-3.5 h-3.5 animate-pulse" />
              <span>{isAmharic ? 'በማድረስ ሂደት ላይ' : 'Out for Delivery'}</span>
            </span>
          );
        case 'pickup_ready':
          return (
            <span className="px-3 py-1 rounded-full text-xs font-bold bg-blue-500/15 text-blue-400 border border-blue-500/30 flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5" />
              <span>{isAmharic ? 'ለርክክብ ዝግጁ ነው' : 'Ready for Hub Pickup'}</span>
            </span>
          );
        case 'completed':
        case 'verified':
        case 'delivered':
          return (
            <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>{isAmharic ? 'ሙሉ በሙሉ ተጠናቋል' : 'Fully Settled & Sold'}</span>
            </span>
          );
        default:
          return (
            <span className="px-3 py-1 rounded-full text-xs font-bold bg-neutral-500/15 text-neutral-400 border border-neutral-500/30">
              {status}
            </span>
          );
      }
    }
  };

  if (isAdmin) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="text-center space-y-3">
          <div className="w-8 h-8 rounded-full border-2 border-[#C18A45] border-t-transparent animate-spin mx-auto" />
          <p className="text-xs font-semibold opacity-70">Redirecting to Admin Control Center...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-24">
      {/* Header Banner */}
      <section className="py-10 border-b border-black/10 dark:border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
            <div className="space-y-2">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-amber-500/15 border border-amber-500/30 text-amber-500">
                <Layers className="w-3.5 h-3.5" />
                <span>{isAmharic ? 'የደንበኛ ትዕዛዞች እና ይዞታዎች ማዕከል' : 'Orders & Reservations Center'}</span>
              </div>
              <h1 className="font-serif font-bold text-3xl sm:text-4xl tracking-tight">
                {isAmharic ? 'የእኔ ትዕዛዞች & ይዞታዎች' : 'My Orders & Reservations'}
              </h1>
              <p className="text-xs sm:text-sm opacity-75 max-w-2xl">
                {isAmharic
                  ? 'የተጠናቀቁ የቀጥታ ግዢዎችዎን፣ የ50% ቅድመ-ክፍያ ይዞታዎችዎን፣ የመጓጓዣ ሁኔታን እና የግብይት ደረጃዎችን እዚህ ይከታተሉ'
                  : 'Track your direct full purchases, 50% deposit reservations, vehicle delivery dispatch, and live transaction stages in real-time.'}
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <Link
                to="/packages"
                className="flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-amber-500 hover:bg-amber-600 text-black font-bold text-xs sm:text-sm transition-all shadow-lg shadow-amber-500/20"
              >
                <Gift className="w-4 h-4" />
                <span>{isAmharic ? 'ጥቅሎች & ከብቶች' : 'Browse Livestock & Packages'}</span>
              </Link>
            </div>
          </div>

          {/* Quick Tabs & Search Filter */}
          <div className="mt-8 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-4 border-t border-black/5 dark:border-white/5">
            {/* Tabs */}
            <div className="w-full sm:w-auto flex items-center p-1 rounded-2xl bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 gap-1 overflow-x-auto no-scrollbar">
              <button
                type="button"
                onClick={() => setActiveTab('all')}
                className={`flex-1 sm:flex-initial flex items-center justify-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap shrink-0 sm:shrink ${
                  activeTab === 'all'
                    ? 'bg-amber-500 text-black shadow-sm'
                    : 'opacity-70 hover:opacity-100 hover:bg-black/5 dark:hover:bg-white/5'
                }`}
              >
                <Layers className="w-3.5 h-3.5 shrink-0" />
                <span className="hidden sm:inline">{isAmharic ? 'ሁሉም ግብይቶች' : 'All Transactions'}</span>
                <span className="sm:hidden">{isAmharic ? 'ሁሉም' : 'All'}</span>
                <span className={`px-1.5 py-0.5 rounded-full text-[10px] font-mono font-bold shrink-0 min-w-[18px] text-center ${
                  activeTab === 'all' ? 'bg-black/20 text-black' : 'bg-black/10 dark:bg-white/10'
                }`}>
                  {orders.length}
                </span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('direct')}
                className={`flex-1 sm:flex-initial flex items-center justify-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap shrink-0 sm:shrink ${
                  activeTab === 'direct'
                    ? 'bg-amber-500 text-black shadow-sm'
                    : 'opacity-70 hover:opacity-100 hover:bg-black/5 dark:hover:bg-white/5'
                }`}
              >
                <ShoppingBag className="w-3.5 h-3.5 text-blue-500 shrink-0" />
                <span className="hidden sm:inline">{isAmharic ? 'የቀጥታ ትዕዛዞች (100%)' : 'Direct Purchases (Full)'}</span>
                <span className="sm:hidden">{isAmharic ? 'ቀጥታ' : 'Direct (Full)'}</span>
                <span className={`px-1.5 py-0.5 rounded-full text-[10px] font-mono font-bold shrink-0 min-w-[18px] text-center ${
                  activeTab === 'direct' ? 'bg-black/20 text-black' : 'bg-black/10 dark:bg-white/10'
                }`}>
                  {directOrders.length}
                </span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('reservation')}
                className={`flex-1 sm:flex-initial flex items-center justify-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap shrink-0 sm:shrink ${
                  activeTab === 'reservation'
                    ? 'bg-amber-500 text-black shadow-sm'
                    : 'opacity-70 hover:opacity-100 hover:bg-black/5 dark:hover:bg-white/5'
                }`}
              >
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                <span className="hidden sm:inline">{isAmharic ? 'ይዞታዎች (50%)' : 'Reservations (50%)'}</span>
                <span className="sm:hidden">{isAmharic ? 'ይዞታዎች' : 'Reservations'}</span>
                <span className={`px-1.5 py-0.5 rounded-full text-[10px] font-mono font-bold shrink-0 min-w-[18px] text-center ${
                  activeTab === 'reservation' ? 'bg-black/20 text-black' : 'bg-black/10 dark:bg-white/10'
                }`}>
                  {reservations.length}
                </span>
              </button>
            </div>

            {/* Search Input */}
            <div className="relative w-full sm:max-w-xs">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 opacity-50" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={isAmharic ? 'በትዕዛዝ ቁጥር ወይም በስም ፈልግ...' : 'Search by Order ID or item...'}
                className="w-full pl-9 pr-3 py-2.5 rounded-xl text-xs bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 focus:outline-none focus:border-amber-500 transition-colors"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Body Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        {!isAuthenticated ? (
          <div
            className={`p-8 sm:p-10 rounded-3xl border text-center max-w-lg mx-auto space-y-4 ${
              isDark ? 'bg-[#24170D] border-[#4A2C16]' : 'bg-white border-[#E4D4BC]'
            }`}
          >
            <div className="w-14 h-14 rounded-2xl bg-amber-500/15 text-amber-500 flex items-center justify-center mx-auto shadow-inner">
              <ShieldCheck className="w-7 h-7" />
            </div>
            <h3 className="font-serif font-bold text-xl sm:text-2xl">
              {isAmharic ? 'ትዕዛዞችን ለመከታተል ይግቡ ወይም ይመዝገቡ' : 'Sign In to Track Your Orders'}
            </h3>
            <p className="text-xs sm:text-sm opacity-80 leading-relaxed">
              {isAmharic
                ? 'ያለ አካውንት ትዕዛዝ አስገብተው ነበር? በትዕዛዝዎ ወቅት በተጠቀሙበት ስልክ ቁጥር ሲገቡ ወይም መለያ ሲከፍቱ ያለፉት ትዕዛዞችዎ እና ይዞታዎችዎ በራስ-ሰር ተገናኝተው እዚህ ይታያሉ።'
                : 'Placed an order as a guest? Simply sign in or create an account with the same phone number you used during checkout, and all your past orders and reservations will automatically connect here.'}
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => openAuthModal('login')}
                className="w-full sm:w-auto px-7 py-3 rounded-2xl bg-amber-500 hover:bg-amber-600 text-black font-bold text-xs sm:text-sm transition-all shadow-md active:scale-98 cursor-pointer"
              >
                {isAmharic ? 'ይግቡ' : 'Sign In'}
              </button>
              <button
                type="button"
                onClick={() => openAuthModal('register')}
                className={`w-full sm:w-auto px-7 py-3 rounded-2xl border font-bold text-xs sm:text-sm transition-all active:scale-98 cursor-pointer ${
                  isDark
                    ? 'border-amber-500/40 text-amber-400 hover:bg-amber-500/10'
                    : 'border-[#B8792F]/50 text-[#8B4513] hover:bg-amber-50'
                }`}
              >
                {isAmharic ? 'መለያ ይፍጠሩ' : 'Create Account'}
              </button>
            </div>
          </div>
        ) : loading ? (
          <div className="text-center py-20 opacity-60">
            <div className="w-8 h-8 rounded-full border-2 border-amber-500 border-t-transparent animate-spin mx-auto mb-3" />
            <p className="text-xs font-semibold text-amber-500">{isAmharic ? 'በመጫን ላይ...' : 'Loading...'}</p>
          </div>
        ) : displayedOrders.length === 0 ? (
          <div
            className={`p-12 rounded-3xl border text-center max-w-lg mx-auto space-y-4 ${
              isDark ? 'bg-[#24170D] border-[#4A2C16]' : 'bg-white border-[#E4D4BC]'
            }`}
          >
            <div className="w-14 h-14 rounded-2xl bg-amber-500/15 text-amber-500 flex items-center justify-center mx-auto">
              {activeTab === 'reservation' ? (
                <ShieldCheck className="w-7 h-7" />
              ) : (
                <ShoppingBag className="w-7 h-7" />
              )}
            </div>
            <h3 className="font-serif font-bold text-xl">
              {activeTab === 'reservation'
                ? isAmharic ? 'ምንም ንቁ ይዞታ አልተገኘም' : 'No Active Reservations'
                : activeTab === 'direct'
                ? isAmharic ? 'ምንም የቀጥታ ግዢ አልተገኘም' : 'No Direct Purchases Yet'
                : isAmharic ? 'ምንም ትዕዛዝ አልተገኘም' : 'No Transactions Found'}
            </h3>
            <p className="text-xs opacity-75 leading-relaxed">
              {activeTab === 'reservation'
                ? isAmharic
                  ? 'እስካሁን ምንም ዓይነት ከብት በ50% ቅድመ-ክፍያ አልያዙም። ከብት ሲመርጡ "50% የቅድመ-ክፍያ ይዞታ" የሚለውን መምረጥ ይችላሉ!'
                  : 'You have not reserved any livestock or holiday packages yet. When ordering, choose "50% Reservation Deposit" to secure items with half payment!'
                : isAmharic
                ? 'እስካሁን ሙሉ ክፍያ የተፈጸመበት የቀጥታ ትዕዛዝ አልተገኘም። ከብት ወይም የበዓል ጥቅል በቀጥታ ይዘዙ!'
                : 'You have not placed any direct full-payment orders yet. Browse our livestock or holiday packages to get started!'}
            </p>
            <Link
              to="/packages"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-amber-500 hover:bg-amber-600 text-black font-bold text-xs transition-all shadow-lg"
            >
              <Sparkles className="w-4 h-4" />
              <span>{isAmharic ? 'ከብቶች & ጥቅሎችን ይመልከቱ' : 'Explore Packages & Livestock'}</span>
            </Link>
          </div>
        ) : (
          <div className="space-y-6">
            {displayedOrders.map((order) => {
              const isRes = Boolean(order.isReservation);
              const deposit = order.depositAmount || (isRes ? order.totalAmount * 0.5 : 0);
              const remaining = order.remainingAmount ?? (isRes ? order.totalAmount * 0.5 : 0);

              return (
                <div
                  key={order.id}
                  className={`rounded-3xl border overflow-hidden p-6 transition-all duration-200 shadow-md ${
                    isDark ? 'bg-[#24170D] border-[#4A2C16]' : 'bg-white border-[#E4D4BC]'
                  }`}
                >
                  {/* Top Bar: IDs, Badges, Titles, and Actions */}
                  <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 pb-4 border-b border-black/10 dark:border-white/10">
                    <div className="space-y-1.5">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-mono font-bold text-xs text-amber-500 bg-amber-500/10 px-2.5 py-0.5 rounded-md">
                          {order.id}
                        </span>

                        {/* Direct Order vs Reservation Badge */}
                        {isRes ? (
                          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 flex items-center gap-1">
                            <ShieldCheck className="w-3 h-3" />
                            <span>{isAmharic ? '50% የቅድመ-ክፍያ ይዞታ' : '50% Reservation'}</span>
                          </span>
                        ) : (
                          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-500/15 text-blue-400 border border-blue-500/30 flex items-center gap-1">
                            <ShoppingBag className="w-3 h-3" />
                            <span>{isAmharic ? 'የቀጥታ ግዢ (ሙሉ ክፍያ)' : 'Direct Purchase (Full Payment)'}</span>
                          </span>
                        )}

                        {getStatusBadge(order)}

                        {order.isPackage && (
                          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-purple-500/15 text-purple-400">
                            {isAmharic ? 'የበዓል ጥቅል' : 'Celebration Package'}
                          </span>
                        )}

                        {order.isDelivery ? (
                          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/15 text-amber-500 flex items-center gap-1">
                            <Truck className="w-3 h-3" />
                            <span>{order.vehicleName || order.vehicleType || (isAmharic ? 'የቤት ማድረስ' : 'Delivery')}</span>
                          </span>
                        ) : (
                          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-neutral-500/15 text-neutral-400 flex items-center gap-1">
                            <MapPin className="w-3 h-3" />
                            <span>{isAmharic ? 'ከማዕከሉ መረከብ' : 'Hub Pickup'}</span>
                          </span>
                        )}
                      </div>

                      <h3 className="font-serif font-bold text-xl sm:text-2xl">
                        {order.packageName || order.animalBreed || (isAmharic ? 'የከብት ትዕዛዝ' : 'Livestock Order')}
                      </h3>

                      <div className="text-xs opacity-60 flex items-center gap-2">
                        <span>
                          {new Date(order.createdAt).toLocaleDateString()} at{' '}
                          {new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                        {order.paymentMethod && (
                          <>
                            <span>•</span>
                            <span>{order.paymentMethod}</span>
                          </>
                        )}
                      </div>
                    </div>

                    {/* Top Right Actions */}
                    <div className="flex flex-wrap items-center gap-2 w-full lg:w-auto">
                      {/* Finish 50% reservation balance if locked */}
                      {isRes && order.status === 'reserved' && (
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedOrderForFinalPay(order);
                            setIsFinalModalOpen(true);
                          }}
                          className="w-full sm:w-auto px-5 py-2.5 rounded-2xl bg-amber-500 hover:bg-amber-600 text-black font-bold text-xs sm:text-sm transition-all shadow-lg shadow-amber-500/20 flex items-center justify-center gap-2 cursor-pointer"
                        >
                          <CreditCard className="w-4 h-4" />
                          <span>
                            {isAmharic ? 'ቀሪ ክፍያ ፈጽም' : 'Finish Payment'} ({formatPrice(remaining)})
                          </span>
                        </button>
                      )}

                      {order.paymentSlipUrl && (
                        <a
                          href={getAuthSlipUrl(order.paymentSlipUrl)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-3.5 py-2 rounded-xl border text-xs font-semibold hover:bg-black/5 dark:hover:bg-white/5 transition-colors flex items-center gap-1.5 opacity-80"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>{isRes ? (isAmharic ? 'የቅድመ-ክፍያ ደረሰኝ' : 'Deposit Slip') : (isAmharic ? 'የክፍያ ደረሰኝ' : 'Payment Slip')}</span>
                        </a>
                      )}

                      {order.finalPaymentSlipUrl && (
                        <a
                          href={getAuthSlipUrl(order.finalPaymentSlipUrl)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-3.5 py-2 rounded-xl border text-xs font-semibold hover:bg-black/5 dark:hover:bg-white/5 transition-colors flex items-center gap-1.5 text-emerald-500 border-emerald-500/30"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>{isAmharic ? 'የመጨረሻ ደረሰኝ' : 'Final Slip'}</span>
                        </a>
                      )}
                    </div>
                  </div>

                  {/* Financial Overview Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-4">
                    {isRes ? (
                      <>
                        <div
                          className={`p-3.5 rounded-2xl border ${
                            isDark ? 'bg-[#1D130A] border-[#4A2C16]' : 'bg-[#FAF7F0] border-[#E4D4BC]'
                          }`}
                        >
                          <div className="text-[11px] opacity-70 font-semibold uppercase">
                            {isAmharic ? 'ጠቅላላ ዋጋ' : 'Total Livestock Value'}
                          </div>
                          <div className="font-serif font-bold text-lg text-amber-500 mt-0.5">
                            {formatPrice(order.totalAmount)}
                          </div>
                        </div>

                        <div
                          className={`p-3.5 rounded-2xl border ${
                            isDark ? 'bg-[#1D130A] border-[#4A2C16]' : 'bg-[#FAF7F0] border-[#E4D4BC]'
                          }`}
                        >
                          <div className="text-[11px] opacity-70 font-semibold uppercase flex items-center gap-1">
                            <Check className="w-3.5 h-3.5 text-emerald-500" />
                            <span>{isAmharic ? '50% የተከፈለ ቅድመ-ክፍያ' : '50% Deposit Paid'}</span>
                          </div>
                          <div className="font-serif font-bold text-lg text-emerald-500 mt-0.5">
                            {formatPrice(deposit)}
                          </div>
                        </div>

                        <div
                          className={`p-3.5 rounded-2xl border ${
                            isDark ? 'bg-[#1D130A] border-[#4A2C16]' : 'bg-[#FAF7F0] border-[#E4D4BC]'
                          }`}
                        >
                          <div className="text-[11px] opacity-70 font-semibold uppercase">
                            {isAmharic ? 'የሚቀረው 50% ክፍያ' : 'Remaining 50% Balance'}
                          </div>
                          <div
                            className={`font-serif font-bold text-lg mt-0.5 ${
                              order.status === 'completed' || order.status === 'verified' || order.status === 'delivered'
                                ? 'text-neutral-400 line-through'
                                : 'text-amber-500'
                            }`}
                          >
                            {order.status === 'completed' || order.status === 'delivered'
                              ? '0 ETB (Paid)'
                              : formatPrice(remaining)}
                          </div>
                        </div>
                      </>
                    ) : (
                      <>
                        <div
                          className={`p-3.5 rounded-2xl border ${
                            isDark ? 'bg-[#1D130A] border-[#4A2C16]' : 'bg-[#FAF7F0] border-[#E4D4BC]'
                          }`}
                        >
                          <div className="text-[11px] opacity-70 font-semibold uppercase">
                            {isAmharic ? 'የተከፈለ ጠቅላላ ዋጋ' : 'Total Amount (100% Paid)'}
                          </div>
                          <div className="font-serif font-bold text-lg text-emerald-500 mt-0.5">
                            {formatPrice(order.totalAmount)}
                          </div>
                        </div>

                        <div
                          className={`p-3.5 rounded-2xl border ${
                            isDark ? 'bg-[#1D130A] border-[#4A2C16]' : 'bg-[#FAF7F0] border-[#E4D4BC]'
                          }`}
                        >
                          <div className="text-[11px] opacity-70 font-semibold uppercase">
                            {isAmharic ? 'የክፍያ ዘዴ' : 'Payment Method'}
                          </div>
                          <div className="font-serif font-bold text-base mt-0.5">
                            {order.paymentMethod || 'Direct Transfer'}
                          </div>
                        </div>

                        <div
                          className={`p-3.5 rounded-2xl border ${
                            isDark ? 'bg-[#1D130A] border-[#4A2C16]' : 'bg-[#FAF7F0] border-[#E4D4BC]'
                          }`}
                        >
                          <div className="text-[11px] opacity-70 font-semibold uppercase">
                            {isAmharic ? 'የትራንስፖርት / የማድረስ ክፍያ' : 'Delivery Fulfillment'}
                          </div>
                          <div className="font-serif font-bold text-base mt-0.5 text-amber-500">
                            {order.isDelivery
                              ? (order.deliveryFee ? formatPrice(order.deliveryFee) : (isAmharic ? 'ነፃ ማድረስ' : 'Free Delivery'))
                              : (isAmharic ? 'ከማዕከሉ መረከብ (0 ETB)' : 'Hub Pickup (0 ETB)')}
                          </div>
                        </div>
                      </>
                    )}
                  </div>

                  {/* Delivery Detail Banner if delivery requested */}
                  {order.isDelivery && (
                    <div className="mt-4 p-3.5 rounded-2xl bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 text-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                      <div className="flex items-start sm:items-center gap-2.5">
                        <Truck className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5 sm:mt-0" />
                        <div>
                          <span className="font-bold opacity-90">
                            {isAmharic ? 'የማድረሻ አድራሻ:' : 'Delivery Destination:'}
                          </span>{' '}
                          <span className="opacity-80">
                            {order.deliveryAddress || order.deliveryLocation || 'Customer address'}
                          </span>
                        </div>
                      </div>

                      {order.distanceKm !== undefined && (
                        <div className="inline-flex items-center gap-2 text-[11px] opacity-70">
                          <span>~{order.distanceKm.toFixed(1)} KM</span>
                          {order.vehicleName && (
                            <>
                              <span>•</span>
                              <span>{order.vehicleName}</span>
                            </>
                          )}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Stages of Transaction Timeline */}
                  <div className="mt-6 pt-5 border-t border-black/10 dark:border-white/10">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="text-xs font-bold uppercase tracking-wider opacity-80 flex items-center gap-2">
                        <Layers className="w-3.5 h-3.5 text-amber-500" />
                        <span>{isAmharic ? 'የግብይት ደረጃዎች (የቀጥታ ሂደት)' : 'Stages of Transaction'}</span>
                      </h4>
                      <span className="text-[11px] opacity-60">
                        {isRes
                          ? (isAmharic ? '4-ደረጃ የይዞታ ሂደት' : '4-Stage Reservation Pipeline')
                          : (isAmharic ? '4-ደረጃ የቀጥታ ግዢ ሂደት' : '4-Stage Direct Order Pipeline')}
                      </span>
                    </div>

                    <TransactionStagesTracker order={order} isAmharic={isAmharic} />
                  </div>

                  {/* Admin Notes if provided */}
                  {order.adminNotes && (
                    <div className="mt-4 p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs">
                      <span className="font-bold">{isAmharic ? 'የአድሚን ማስታወሻ:' : 'Admin Note:'}</span> {order.adminNotes}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Final Payment Modal for Reservations */}
      <FinalPaymentModal
        isOpen={isFinalModalOpen}
        onClose={() => {
          setIsFinalModalOpen(false);
          setSelectedOrderForFinalPay(null);
        }}
        order={selectedOrderForFinalPay}
        onSuccess={() => {
          fetchOrders();
        }}
      />
    </div>
  );
};
export default MyReservations;
