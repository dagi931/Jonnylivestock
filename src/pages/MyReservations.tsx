import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Order } from '../types/package';
import { api } from '../services/api';
import { useTheme } from '../context/ThemeContext';
import { useLanguage } from '../context/LanguageContext';
import { useUserAuth } from '../context/UserAuthContext';
import { useAdminAuth } from '../context/AdminAuthContext';
import { formatPrice } from '../utils/formatters';
import { FinalPaymentModal } from '../components/modals/FinalPaymentModal';
import {
  ShieldCheck,
  Clock,
  CheckCircle2,
  AlertCircle,
  CreditCard,
  Sparkles,
  Gift,
  Eye,
  Check
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

  const [reservations, setReservations] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrderForFinalPay, setSelectedOrderForFinalPay] = useState<Order | null>(null);
  const [isFinalModalOpen, setIsFinalModalOpen] = useState(false);

  const fetchReservations = async () => {
    setLoading(true);
    try {
      const data = await api.getReservations();
      setReservations(data);
    } catch (err) {
      console.error('Failed to fetch reservations:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      fetchReservations();
    } else {
      setLoading(false);
    }
  }, [isAuthenticated]);

  const getStatusBadge = (status: Order['status']) => {
    switch (status) {
      case 'reservation_pending':
        return (
          <span className="px-3 py-1 rounded-full text-xs font-bold bg-amber-500/15 text-amber-400 border border-amber-500/30 flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 animate-pulse" />
            <span>Deposit Review Pending</span>
          </span>
        );
      case 'reserved':
        return (
          <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Reservation Confirmed (Locked)</span>
          </span>
        );
      case 'final_payment_pending':
        return (
          <span className="px-3 py-1 rounded-full text-xs font-bold bg-purple-500/15 text-purple-400 border border-purple-500/30 flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 animate-pulse" />
            <span>Final Slip Review Pending</span>
          </span>
        );
      case 'completed':
      case 'verified':
        return (
          <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Fully Paid & Item Sold</span>
          </span>
        );
      case 'rejected':
        return (
          <span className="px-3 py-1 rounded-full text-xs font-bold bg-red-500/15 text-red-400 border border-red-500/30 flex items-center gap-1.5">
            <AlertCircle className="w-3.5 h-3.5" />
            <span>Reservation Rejected</span>
          </span>
        );
      default:
        return (
          <span className="px-3 py-1 rounded-full text-xs font-bold bg-neutral-500/15 text-neutral-400 border border-neutral-500/30">
            {status}
          </span>
        );
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
      {/* Header */}
      <section className="py-10 border-b border-black/10 dark:border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-emerald-500/15 border border-emerald-500/30 text-emerald-500 mb-2">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>50% Reservation Manager</span>
              </div>
              <h1 className="font-serif font-bold text-3xl sm:text-4xl tracking-tight">
                {isAmharic ? 'የእኔ የተያዙ ትዕዛዞች' : 'My Reservations'}
              </h1>
              <p className="text-xs sm:text-sm opacity-75 mt-1">
                Track your 50% deposit reservations, pay remaining balances, and view confirmation slips
              </p>
            </div>

            <Link
              to="/packages"
              className="flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-amber-500 hover:bg-amber-600 text-black font-bold text-xs sm:text-sm transition-all shadow-lg shadow-amber-500/20"
            >
              <Gift className="w-4 h-4" />
              <span>Browse Packages & Livestock</span>
            </Link>
          </div>
        </div>
      </section>

      {/* Body */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        {!isAuthenticated ? (
          <div
            className={`p-10 rounded-3xl border text-center max-w-lg mx-auto space-y-4 ${
              isDark ? 'bg-[#24170D] border-[#4A2C16]' : 'bg-white border-[#E4D4BC]'
            }`}
          >
            <div className="w-12 h-12 rounded-2xl bg-amber-500/15 text-amber-500 flex items-center justify-center mx-auto">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <h3 className="font-serif font-bold text-xl">Sign In to View Your Reservations</h3>
            <p className="text-xs opacity-75">
              Access your active reservations, pay remaining balances, and view status history in real-time.
            </p>
            <button
              onClick={() => openAuthModal('login')}
              className="px-6 py-2.5 rounded-2xl bg-amber-500 hover:bg-amber-600 text-black font-bold text-xs transition-all shadow-md"
            >
              Sign In
            </button>
          </div>
        ) : loading ? (
          <div className="text-center py-20 opacity-60">Loading reservations...</div>
        ) : reservations.length === 0 ? (
          <div
            className={`p-12 rounded-3xl border text-center max-w-lg mx-auto space-y-4 ${
              isDark ? 'bg-[#24170D] border-[#4A2C16]' : 'bg-white border-[#E4D4BC]'
            }`}
          >
            <div className="w-14 h-14 rounded-2xl bg-emerald-500/15 text-emerald-500 flex items-center justify-center mx-auto">
              <ShieldCheck className="w-7 h-7" />
            </div>
            <h3 className="font-serif font-bold text-xl">No Active Reservations</h3>
            <p className="text-xs opacity-75 leading-relaxed">
              You haven't reserved any livestock or holiday packages yet. When placing an order, choose <strong>"50% Reservation Deposit"</strong> to lock items with half payment!
            </p>
            <Link
              to="/packages"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-amber-500 hover:bg-amber-600 text-black font-bold text-xs transition-all shadow-lg"
            >
              <Sparkles className="w-4 h-4" />
              <span>Explore Packages & Reserve</span>
            </Link>
          </div>
        ) : (
          <div className="space-y-6">
            {reservations.map((res) => {
              const deposit = res.depositAmount || res.totalAmount * 0.5;
              const remaining = res.remainingAmount || res.totalAmount * 0.5;

              return (
                <div
                  key={res.id}
                  className={`rounded-3xl border overflow-hidden p-6 transition-all duration-200 shadow-md ${
                    isDark ? 'bg-[#24170D] border-[#4A2C16]' : 'bg-white border-[#E4D4BC]'
                  }`}
                >
                  <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 pb-4 border-b border-black/10 dark:border-white/10">
                    <div className="space-y-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-mono font-bold text-xs text-amber-500 bg-amber-500/10 px-2.5 py-0.5 rounded-md">
                          {res.id}
                        </span>
                        {getStatusBadge(res.status)}
                        {res.isPackage && (
                          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-purple-500/15 text-purple-400">
                            Festive Package (Free Delivery)
                          </span>
                        )}
                      </div>
                      <h3 className="font-serif font-bold text-xl">
                        {res.packageName || res.animalBreed || 'Livestock Reservation'}
                      </h3>
                      <div className="text-xs opacity-60">
                        Reserved on {new Date(res.createdAt).toLocaleDateString()} at{' '}
                        {new Date(res.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </div>

                    {/* Action: Pay remaining balance */}
                    <div className="flex flex-wrap items-center gap-2 w-full lg:w-auto">
                      {res.status === 'reserved' && (
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedOrderForFinalPay(res);
                            setIsFinalModalOpen(true);
                          }}
                          className="w-full sm:w-auto px-6 py-3 rounded-2xl bg-amber-500 hover:bg-amber-600 text-black font-bold text-xs sm:text-sm transition-all shadow-lg shadow-amber-500/20 flex items-center justify-center gap-2"
                        >
                          <CreditCard className="w-4 h-4" />
                          <span>Finish Payment ({formatPrice(remaining)})</span>
                        </button>
                      )}

                      {res.paymentSlipUrl && (
                        <a
                          href={res.paymentSlipUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="px-4 py-2.5 rounded-xl border text-xs font-semibold hover:bg-black/5 dark:hover:bg-white/5 transition-colors flex items-center gap-1.5 opacity-80"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>View Deposit Slip</span>
                        </a>
                      )}

                      {res.finalPaymentSlipUrl && (
                        <a
                          href={res.finalPaymentSlipUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="px-4 py-2.5 rounded-xl border text-xs font-semibold hover:bg-black/5 dark:hover:bg-white/5 transition-colors flex items-center gap-1.5 text-emerald-500"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>View Final Slip</span>
                        </a>
                      )}
                    </div>
                  </div>

                  {/* Financial Breakdown & Progress Bar */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4">
                    <div
                      className={`p-3.5 rounded-2xl border ${
                        isDark ? 'bg-[#1D130A] border-[#4A2C16]' : 'bg-[#FAF7F0] border-[#E4D4BC]'
                      }`}
                    >
                      <div className="text-[11px] opacity-70 font-semibold uppercase">Total Value</div>
                      <div className="font-serif font-bold text-lg text-amber-500 mt-0.5">
                        {formatPrice(res.totalAmount)}
                      </div>
                    </div>

                    <div
                      className={`p-3.5 rounded-2xl border ${
                        isDark ? 'bg-[#1D130A] border-[#4A2C16]' : 'bg-[#FAF7F0] border-[#E4D4BC]'
                      }`}
                    >
                      <div className="text-[11px] opacity-70 font-semibold uppercase flex items-center gap-1">
                        <Check className="w-3.5 h-3.5 text-emerald-500" /> 50% Deposit Paid
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
                      <div className="text-[11px] opacity-70 font-semibold uppercase">Remaining 50% Due</div>
                      <div
                        className={`font-serif font-bold text-lg mt-0.5 ${
                          res.status === 'completed' || res.status === 'verified'
                            ? 'text-neutral-400 line-through'
                            : 'text-amber-500'
                        }`}
                      >
                        {formatPrice(remaining)}
                      </div>
                    </div>
                  </div>

                  {/* Visual Status Tracker */}
                  <div className="mt-5 pt-4 border-t border-black/5 dark:border-white/5">
                    <div className="grid grid-cols-4 gap-2 text-center text-[10px] sm:text-xs">
                      <div
                        className={`p-2 rounded-xl border ${
                          res.status !== 'rejected'
                            ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-500 font-bold'
                            : 'opacity-40'
                        }`}
                      >
                        1. Deposit Uploaded
                      </div>
                      <div
                        className={`p-2 rounded-xl border ${
                          res.status === 'reserved' || res.status === 'final_payment_pending' || res.status === 'completed' || res.status === 'verified'
                            ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-500 font-bold'
                            : 'opacity-40'
                        }`}
                      >
                        2. Reservation Approved
                      </div>
                      <div
                        className={`p-2 rounded-xl border ${
                          res.status === 'final_payment_pending' || res.status === 'completed' || res.status === 'verified'
                            ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-500 font-bold'
                            : 'opacity-40'
                        }`}
                      >
                        3. Final Slip Submitted
                      </div>
                      <div
                        className={`p-2 rounded-xl border ${
                          res.status === 'completed' || res.status === 'verified'
                            ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-400 font-bold'
                            : 'opacity-40'
                        }`}
                      >
                        4. Sold & Dispatched
                      </div>
                    </div>
                  </div>

                  {res.adminNotes && (
                    <div className="mt-3 p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs">
                      <span className="font-bold">Admin Note:</span> {res.adminNotes}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Final Payment Modal */}
      <FinalPaymentModal
        isOpen={isFinalModalOpen}
        onClose={() => {
          setIsFinalModalOpen(false);
          setSelectedOrderForFinalPay(null);
        }}
        order={selectedOrderForFinalPay}
        onSuccess={() => {
          fetchReservations();
        }}
      />
    </div>
  );
};
