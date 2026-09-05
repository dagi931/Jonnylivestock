import React, { useState } from 'react';
import {
  X,
  ExternalLink,
  ShieldCheck,
  Check,
  Phone,
  MapPin,
  Package,
  Sparkles,
  CheckCircle2,
  Mail,
  Maximize2,
  Minimize2,
  ZoomIn
} from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import { Order } from '../../services/api';
import { formatPrice } from '../../utils/formatters';

interface SlipPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  slipUrl: string;
  order?: Order | null;
  orderId?: string;
  customerName?: string;
  onApproveReservation?: (id: string) => void;
  onApproveFinal?: (id: string) => void;
  onApproveOrder?: (id: string) => void;
  onApproveDelivery?: (id: string, status?: 'delivery_pending' | 'delivered') => void;
  onReject?: (id: string) => void;
  isActionLoading?: boolean;
}

export const SlipPreviewModal: React.FC<SlipPreviewModalProps> = ({
  isOpen,
  onClose,
  slipUrl,
  order,
  orderId,
  customerName,
  onApproveReservation,
  onApproveFinal,
  onApproveOrder,
  onApproveDelivery,
  onReject,
  isActionLoading = false
}) => {
  const { theme } = useTheme();
  const isDark = theme === 'design7';

  // Toggle between Initial Deposit Slip and Final Payment Slip if both exist
  const [activeSlipTab, setActiveSlipTab] = useState<'initial' | 'final'>('initial');

  // Expanded Image Lightbox State (expands when clicked!)
  const [isSlipExpanded, setIsSlipExpanded] = useState(false);

  if (!isOpen) return null;

  const currentOrderId = order?.id || orderId;
  const currentCustomer = order?.customerName || customerName;
  const isRes = order ? Boolean(order.isReservation || order.depositAmount != null) : false;
  const deposit = order ? (order.depositAmount || order.totalAmount * 0.5) : 0;
  const remaining = order ? (order.remainingAmount || order.totalAmount * 0.5) : 0;

  // Determine current active slip URL to preview
  const currentSlip =
    activeSlipTab === 'final' && order?.finalPaymentSlipUrl
      ? order.finalPaymentSlipUrl
      : order?.paymentSlipUrl || slipUrl;

  const hasMultipleSlips = Boolean(order?.paymentSlipUrl && order?.finalPaymentSlipUrl);

  // Parse package items if available
  let packageItems: any[] = [];
  if (order?.packageDetails) {
    if (Array.isArray(order.packageDetails)) {
      packageItems = order.packageDetails;
    } else if (typeof order.packageDetails === 'object' && Array.isArray((order.packageDetails as any).items)) {
      packageItems = (order.packageDetails as any).items;
    }
  }

  return (
    <>
      {/* ============================================================ */}
      {/* 1. PRIMARY DETAILS & APPROVAL MODAL (COMPACT PREVIEW AT FIRST) */}
      {/* ============================================================ */}
      <div className="fixed inset-0 z-50 overflow-y-auto bg-black/85 backdrop-blur-md p-2 sm:p-4 md:p-6 flex items-center justify-center">
        {/* Background Backdrop */}
        <div className="fixed inset-0" onClick={onClose} aria-hidden="true" />

        {/* Modal Container */}
        <div
          className={`relative w-full max-w-4xl h-auto max-h-[92dvh] sm:max-h-[92vh] flex flex-col rounded-3xl border shadow-2xl z-10 overflow-hidden animate-in fade-in zoom-in-95 duration-200 ${
            isDark
              ? 'bg-[#1B1208] border-[#4A2C16] text-[#F4E8D0]'
              : 'bg-white border-[#E4D4BC] text-[#2A1A0D]'
          }`}
        >
          {/* Modal Header */}
          <div
            className="flex justify-between items-center px-4 sm:px-6 py-3.5 border-b shrink-0 sticky top-0 z-20 backdrop-blur-md"
            style={{ borderColor: isDark ? '#4A2C16' : '#E4D4BC' }}
          >
            <div className="min-w-0 pr-2">
              <div className="flex flex-wrap items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-[#C18A45] shrink-0" />
                <h3 className="text-sm sm:text-base font-bold font-serif truncate">
                  Payment Review & Order Details
                </h3>
                {order && (
                  <span
                    className={`px-2 py-0.5 rounded-md text-[10.5px] font-bold shrink-0 ${
                      order.status === 'reservation_pending'
                        ? 'bg-amber-500/15 text-amber-400 border border-amber-500/30 animate-pulse'
                        : order.status === 'final_payment_pending'
                        ? 'bg-amber-500/15 text-amber-400 border border-amber-500/30 animate-pulse'
                        : order.status === 'pending_verification'
                        ? 'bg-amber-500/15 text-amber-400 border border-amber-500/30 animate-pulse'
                        : order.status === 'reserved'
                        ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                        : order.status === 'delivery_pending'
                        ? 'bg-amber-500/15 text-amber-400 border border-amber-500/30'
                        : order.status === 'delivered'
                        ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                        : order.status === 'completed' || order.status === 'verified'
                        ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                        : 'bg-red-500/15 text-red-400 border border-red-500/30'
                    }`}
                  >
                    {order.status === 'reservation_pending' && '50% Deposit Review'}
                    {order.status === 'final_payment_pending' && 'Final 50% Slip Review'}
                    {order.status === 'pending_verification' && 'Full Slip Review'}
                    {order.status === 'reserved' && 'Reserved (50% Confirmed)'}
                    {order.status === 'delivery_pending' && '🚀 Delivery In Transit'}
                    {order.status === 'delivered' && '✓ Delivered to Doorstep'}
                    {(order.status === 'completed' || order.status === 'verified') && '✓ Fully Settled & Sold'}
                    {order.status === 'rejected' && 'Rejected'}
                  </span>
                )}
              </div>
              <p className="text-xs opacity-65 mt-0.5 font-mono truncate">
                {currentOrderId ? `Order: #${currentOrderId}` : ''} {currentCustomer ? `• Customer: ${currentCustomer}` : ''}
              </p>
            </div>

            <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
              <button
                onClick={onClose}
                className="p-2 rounded-xl bg-black/5 dark:bg-white/10 hover:bg-black/10 dark:hover:bg-white/20 transition-colors"
                aria-label="Close"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Modal Scrollable Body */}
          <div className="flex-1 overflow-y-auto overscroll-contain p-4 sm:p-6 space-y-5">
            {/* Top Row: Customer Card & Payment Slip Preview Thumbnail */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
              {/* Left (7 Cols on desktop): Customer & Order Overview */}
              <div className="md:col-span-7 space-y-3.5">
                {/* Customer Details Card */}
                <div
                  className={`p-3.5 rounded-2xl border text-xs space-y-2 ${
                    isDark ? 'bg-[#24170D] border-[#4A2C16]' : 'bg-[#FAF7F0] border-[#E4D4BC]'
                  }`}
                >
                  <div className="font-bold text-xs uppercase tracking-wider text-[#C18A45] pb-1 border-b border-black/5 dark:border-white/5 flex items-center justify-between">
                    <span>Customer Details</span>
                    <span className="font-mono text-[10px] opacity-60">#{currentOrderId}</span>
                  </div>
                  <div className="space-y-1.5">
                    <div className="font-bold text-sm text-foreground">
                      {currentCustomer}
                    </div>
                    {order?.customerPhone && (
                      <div className="flex items-center gap-2 opacity-85">
                        <Phone className="w-3.5 h-3.5 text-[#C18A45] shrink-0" />
                        <a href={`tel:${order.customerPhone}`} className="hover:underline font-mono font-semibold">
                          {order.customerPhone}
                        </a>
                      </div>
                    )}
                    {order?.customerEmail && (
                      <div className="flex items-center gap-2 opacity-80 truncate">
                        <Mail className="w-3.5 h-3.5 text-[#C18A45] shrink-0" />
                        <span className="truncate">{order.customerEmail}</span>
                      </div>
                    )}
                    {order?.deliveryLocation && (
                      <div className="flex items-center gap-2 opacity-80 pt-0.5">
                        <MapPin className="w-3.5 h-3.5 text-[#C18A45] shrink-0" />
                        <span>{order.deliveryLocation}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Financial Summary Card */}
                {order && (
                  <div
                    className={`p-3.5 rounded-2xl border text-xs space-y-2 ${
                      isDark ? 'bg-[#24170D] border-[#4A2C16]' : 'bg-[#FAF7F0] border-[#E4D4BC]'
                    }`}
                  >
                    <div className="font-bold text-xs uppercase tracking-wider text-[#C18A45] pb-1 border-b border-black/5 dark:border-white/5 flex items-center justify-between">
                      <span>Payment Breakdown</span>
                      <span className="text-[10px] font-mono opacity-60">
                        Method: {order.paymentMethod}
                      </span>
                    </div>

                    <div className="flex justify-between items-baseline pt-1">
                      <span className="text-xs opacity-75 font-medium">Total Price:</span>
                      <span className="font-serif font-bold text-base text-[#C18A45]">
                        {formatPrice(order.totalAmount)}
                      </span>
                    </div>

                    {isRes && (
                      <div className="p-2 rounded-xl bg-black/5 dark:bg-white/5 space-y-1 mt-1 border border-black/5 dark:border-white/5">
                        <div className="flex justify-between text-xs font-semibold text-emerald-500">
                          <span>50% Reservation Deposit:</span>
                          <span className="font-mono">{formatPrice(deposit)}</span>
                        </div>
                        <div className="flex justify-between text-xs font-semibold text-amber-500">
                          <span>Remaining 50% Balance:</span>
                          <span className="font-mono">{formatPrice(remaining)}</span>
                        </div>
                      </div>
                    )}

                    {order.deliveryFee != null && Number(order.deliveryFee) > 0 && (
                      <div className="flex justify-between text-xs text-amber-500 pt-1 border-t border-black/5 dark:border-white/5">
                        <span>Included Delivery Fee ({order.vehicleType || 'Vehicle'}):</span>
                        <span className="font-mono font-bold">{formatPrice(order.deliveryFee)}</span>
                      </div>
                    )}

                    {order.transactionReference && (
                      <div className="text-[11px] font-mono opacity-85 pt-1">
                        <strong>Txn Reference:</strong> {order.transactionReference}
                      </div>
                    )}

                    {order.customerNotes && (
                      <div className="text-[11px] opacity-75 italic pt-1 border-t border-black/5 dark:border-white/5">
                        "{order.customerNotes}"
                      </div>
                    )}
                  </div>
                )}

                {/* Delivery & Logistics Details Card */}
                {(order?.isDelivery || order?.deliveryLocation || order?.vehicleType) && (
                  <div
                    className={`p-3.5 rounded-2xl border text-xs space-y-2 ${
                      isDark ? 'bg-[#24170D] border-[#4A2C16]' : 'bg-[#FAF7F0] border-[#E4D4BC]'
                    }`}
                  >
                    <div className="font-bold text-xs uppercase tracking-wider text-[#C18A45] pb-1 border-b border-black/5 dark:border-white/5 flex items-center justify-between">
                      <span className="flex items-center gap-1.5">
                        <MapPin className="w-3.5 h-3.5" />
                        <span>Delivery & Dispatch Info</span>
                      </span>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        order.status === 'delivered'
                          ? 'bg-emerald-500/20 text-emerald-400'
                          : order.status === 'delivery_pending'
                          ? 'bg-amber-500/20 text-amber-400'
                          : 'bg-black/10 dark:bg-white/10 opacity-75'
                      }`}>
                        {order.status === 'delivered' ? '✓ Delivered' : order.status === 'delivery_pending' ? '🚀 Dispatched / In Transit' : 'Pending Dispatch'}
                      </span>
                    </div>

                    <div className="space-y-1.5">
                      <div className="flex items-start gap-2">
                        <MapPin className="w-3.5 h-3.5 text-[#C18A45] shrink-0 mt-0.5" />
                        <div>
                          <span className="opacity-70 text-[11px]">Destination: </span>
                          <span className="font-bold">{order.deliveryAddress || order.deliveryLocation || 'Aware Farm Pickup'}</span>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-2 pt-1">
                        <div className="p-2 rounded-xl bg-black/5 dark:bg-white/5">
                          <span className="text-[10px] opacity-60 block uppercase">Vehicle Assigned</span>
                          <span className="font-bold uppercase text-amber-500">{order.vehicleType || 'Standard'}</span>
                        </div>

                        <div className="p-2 rounded-xl bg-black/5 dark:bg-white/5">
                          <span className="text-[10px] opacity-60 block uppercase">Distance & Fee</span>
                          <span className="font-bold font-mono">
                            {order.distanceKm ? `${order.distanceKm} km • ` : ''}{formatPrice(order.deliveryFee || 0)}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Right (5 Cols on desktop): Compact Click-to-Expand Slip Card */}
              <div className="md:col-span-5 flex flex-col justify-between">
                <div
                  className={`p-3.5 rounded-2xl border flex flex-col items-center justify-center text-center space-y-2.5 h-full ${
                    isDark ? 'bg-[#24170D] border-[#4A2C16]' : 'bg-[#FAF7F0] border-[#E4D4BC]'
                  }`}
                >
                  <div className="w-full flex items-center justify-between text-xs font-bold uppercase tracking-wider text-[#C18A45] pb-1 border-b border-black/5 dark:border-white/5">
                    <span>Payment Receipt</span>
                    {hasMultipleSlips && (
                      <div className="flex gap-1">
                        <button
                          type="button"
                          onClick={() => setActiveSlipTab('initial')}
                          className={`px-2 py-0.5 rounded text-[9px] font-bold ${
                            activeSlipTab === 'initial' ? 'bg-amber-500 text-black' : 'opacity-60 hover:opacity-100'
                          }`}
                        >
                          Deposit
                        </button>
                        <button
                          type="button"
                          onClick={() => setActiveSlipTab('final')}
                          className={`px-2 py-0.5 rounded text-[9px] font-bold ${
                            activeSlipTab === 'final' ? 'bg-emerald-500 text-black' : 'opacity-60 hover:opacity-100'
                          }`}
                        >
                          Final
                        </button>
                      </div>
                    )}
                  </div>

                  {currentSlip ? (
                    <div
                      onClick={() => setIsSlipExpanded(true)}
                      className="group relative w-full h-44 sm:h-52 rounded-xl overflow-hidden cursor-pointer border-2 border-dashed border-[#C18A45]/40 hover:border-[#C18A45] bg-black/40 flex items-center justify-center transition-all hover:shadow-xl"
                      title="Click to expand slip to full screen"
                    >
                      {currentSlip.endsWith('.pdf') ? (
                        <div className="flex flex-col items-center gap-2 text-white">
                          <Maximize2 className="w-8 h-8 text-[#C18A45]" />
                          <span className="text-xs font-bold">Click to view PDF Slip</span>
                        </div>
                      ) : (
                        <img
                          src={currentSlip}
                          alt="Payment Slip Preview"
                          className="w-full h-full object-contain p-1 rounded-lg group-hover:scale-105 transition-transform duration-200"
                        />
                      )}

                      {/* Hover Overlay with Expand Hint */}
                      <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-1.5 text-white p-2">
                        <ZoomIn className="w-6 h-6 text-[#C18A45] animate-bounce" />
                        <span className="text-xs font-bold">Click Picture to Expand</span>
                        <span className="text-[10px] opacity-75">View full high-res receipt</span>
                      </div>

                      {/* Permanent Corner Badge */}
                      <div className="absolute bottom-2 right-2 px-2 py-1 rounded-lg bg-black/80 text-[10px] text-white flex items-center gap-1 shadow-md">
                        <Maximize2 className="w-3 h-3 text-[#C18A45]" />
                        <span>Click to expand</span>
                      </div>
                    </div>
                  ) : (
                    <div className="py-12 opacity-50 text-xs">No slip attached</div>
                  )}

                  <p className="text-[11px] opacity-65 italic">
                    💡 Click image above to zoom and expand to full size
                  </p>
                </div>
              </div>
            </div>

            {/* Bottom Row: Item / Package Specification Details */}
            {order && (
              <div
                className={`p-3.5 rounded-2xl border text-xs space-y-2.5 ${
                  isDark ? 'bg-[#24170D] border-[#4A2C16]' : 'bg-[#FAF7F0] border-[#E4D4BC]'
                }`}
              >
                <div className="font-bold text-xs uppercase tracking-wider text-[#C18A45] pb-1 border-b border-black/5 dark:border-white/5 flex items-center justify-between">
                  <span>Product / Package Details</span>
                  <span className="text-[10px] font-mono opacity-60">
                    {new Date(order.createdAt).toLocaleDateString()}
                  </span>
                </div>

                <div className="font-bold text-sm flex items-center gap-2">
                  <Package className="w-4 h-4 text-amber-500 shrink-0" />
                  <span>{order.packageName || order.animalBreed || 'Livestock Product'}</span>
                </div>

                {order.animalId && (
                  <div className="text-[11px] font-mono opacity-70">
                    Livestock ID: <strong>{order.animalId}</strong>
                  </div>
                )}

                {/* Package contents if package */}
                {order.isPackage && packageItems.length > 0 && (
                  <div className="space-y-1.5 pt-1">
                    <div className="text-[10px] font-bold uppercase tracking-wider opacity-65">
                      Included Package Items ({packageItems.length}):
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 max-h-36 overflow-y-auto pr-1">
                      {packageItems.map((item, idx) => (
                        <div
                          key={idx}
                          className="flex items-center justify-between p-2 rounded-xl bg-black/5 dark:bg-white/5 text-[11px]"
                        >
                          <span className="truncate pr-2 font-medium">{item.name}</span>
                          <span className="font-mono opacity-75 shrink-0">{formatPrice(item.price)}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Selected Extra Services */}
                {order.selectedServices && order.selectedServices.length > 0 && (
                  <div className="pt-1 text-[11px] border-t border-black/5 dark:border-white/5 space-y-1">
                    <div className="font-semibold flex items-center gap-1 text-[#C18A45]">
                      <Sparkles className="w-3 h-3" />
                      <span>Add-on Services:</span>
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {order.selectedServices.map((srv, i) => (
                        <span
                          key={i}
                          className="px-2 py-0.5 rounded-md text-[10px] font-medium bg-amber-500/10 text-amber-500"
                        >
                          {srv}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Modal Sticky Footer: Direct Verification Buttons */}
          <div
            className="p-4 border-t sticky bottom-0 z-20 backdrop-blur-md bg-inherit shrink-0 space-y-2.5"
            style={{ borderColor: isDark ? '#4A2C16' : '#E4D4BC' }}
          >
            {/* 1. Pending 50% Deposit Approval */}
            {order?.status === 'reservation_pending' && onApproveReservation && (
              <div className="flex flex-col sm:flex-row items-center gap-2.5">
                <button
                  type="button"
                  disabled={isActionLoading}
                  onClick={() => onApproveReservation(order.id)}
                  className="w-full sm:flex-1 py-3 rounded-xl bg-amber-500 hover:bg-amber-600 text-black font-bold text-xs shadow-md transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  <Check className="w-4 h-4" />
                  <span>{isActionLoading ? 'Processing...' : 'Approve 50% Deposit & Lock Item'}</span>
                </button>
                {onReject && (
                  <button
                    type="button"
                    disabled={isActionLoading}
                    onClick={() => onReject(order.id)}
                    className="w-full sm:w-auto px-5 py-3 rounded-xl bg-red-500/15 hover:bg-red-500/25 text-red-400 font-bold text-xs transition-colors flex items-center justify-center gap-1.5"
                  >
                    <X className="w-4 h-4" />
                    <span>Reject Slip</span>
                  </button>
                )}
              </div>
            )}

            {/* 2. Pending Final 50% Balance Approval */}
            {order?.status === 'final_payment_pending' && onApproveFinal && (
              <div className="flex flex-col sm:flex-row items-center gap-2.5">
                <button
                  type="button"
                  disabled={isActionLoading}
                  onClick={() => onApproveFinal(order.id)}
                  className="w-full sm:flex-1 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  <Check className="w-4 h-4" />
                  <span>{isActionLoading ? 'Processing...' : 'Approve Final Balance & Mark SOLD'}</span>
                </button>
                {onReject && (
                  <button
                    type="button"
                    disabled={isActionLoading}
                    onClick={() => onReject(order.id)}
                    className="w-full sm:w-auto px-5 py-3 rounded-xl bg-red-500/15 hover:bg-red-500/25 text-red-400 font-bold text-xs transition-colors flex items-center justify-center gap-1.5"
                  >
                    <X className="w-4 h-4" />
                    <span>Reject Slip</span>
                  </button>
                )}
              </div>
            )}

            {/* 3. Pending 100% Full Payment Approval */}
            {order?.status === 'pending_verification' && onApproveOrder && (
              <div className="flex flex-col sm:flex-row items-center gap-2.5">
                <button
                  type="button"
                  disabled={isActionLoading}
                  onClick={() => onApproveOrder(order.id)}
                  className="w-full sm:flex-1 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  <Check className="w-4 h-4" />
                  <span>{isActionLoading ? 'Processing...' : 'Verify Full Payment & Mark SOLD'}</span>
                </button>
                {onReject && (
                  <button
                    type="button"
                    disabled={isActionLoading}
                    onClick={() => onReject(order.id)}
                    className="w-full sm:w-auto px-5 py-3 rounded-xl bg-red-500/15 hover:bg-red-500/25 text-red-400 font-bold text-xs transition-colors flex items-center justify-center gap-1.5"
                  >
                    <X className="w-4 h-4" />
                    <span>Reject Slip</span>
                  </button>
                )}
              </div>
            )}

            {/* 4. Delivery / Logistics Actions */}
            {order?.isDelivery && onApproveDelivery && (order.status === 'verified' || order.status === 'completed' || order.status === 'delivery_pending') && (
              <div className="pt-2 border-t border-black/10 dark:border-white/10 flex items-center justify-between gap-2">
                <span className="text-xs font-bold text-[#C18A45] flex items-center gap-1">
                  <MapPin className="w-4 h-4" />
                  <span>Logistics Action:</span>
                </span>
                <div className="flex items-center gap-2">
                  {order.status !== 'delivery_pending' && (
                    <button
                      type="button"
                      disabled={isActionLoading}
                      onClick={() => onApproveDelivery(order.id, 'delivery_pending')}
                      className="px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-black font-bold text-xs shadow transition-all flex items-center gap-1 cursor-pointer"
                    >
                      <span>Approve & Dispatch Delivery</span>
                    </button>
                  )}
                  <button
                    type="button"
                    disabled={isActionLoading}
                    onClick={() => onApproveDelivery(order.id, 'delivered')}
                    className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow transition-all flex items-center gap-1 cursor-pointer"
                  >
                    <Check className="w-3.5 h-3.5" />
                    <span>Mark Delivered ✓</span>
                  </button>
                </div>
              </div>
            )}

            {/* Confirmed States */}
            {(order?.status === 'completed' || order?.status === 'verified') && !order.isDelivery && (
              <div className="p-2.5 rounded-xl bg-emerald-500/15 text-emerald-400 text-xs font-bold text-center flex items-center justify-center gap-2">
                <CheckCircle2 className="w-4 h-4" />
                <span>Order Fully Settled & Livestock Marked as Sold</span>
              </div>
            )}

            {order?.status === 'reserved' && (
              <div className="p-2.5 rounded-xl bg-amber-500/15 text-amber-400 text-xs font-bold text-center flex items-center justify-center gap-2">
                <ShieldCheck className="w-4 h-4" />
                <span>50% Deposit Confirmed • Item Reserved For Customer</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ============================================================ */}
      {/* 2. EXPANDED PICTURE LIGHTBOX (OPENS WHEN SLIP IS CLICKED!) */}
      {/* ============================================================ */}
      {isSlipExpanded && currentSlip && (
        <div className="fixed inset-0 z-[60] overflow-hidden bg-black/95 backdrop-blur-xl flex flex-col animate-in fade-in zoom-in-95 duration-200">
          {/* Top Bar */}
          <div className="flex items-center justify-between px-4 sm:px-8 py-4 border-b border-white/10 shrink-0 text-white bg-black/40">
            <div className="flex items-center gap-3">
              <ShieldCheck className="w-6 h-6 text-[#C18A45]" />
              <div>
                <h4 className="font-bold text-sm sm:text-base font-serif">
                  {activeSlipTab === 'final' ? 'Final 50% Payment Slip' : 'Initial 50% Deposit Slip'} (Full View)
                </h4>
                <p className="text-xs text-white/60 font-mono">
                  {currentOrderId ? `#${currentOrderId}` : ''} {currentCustomer ? `• ${currentCustomer}` : ''}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              {hasMultipleSlips && (
                <div className="flex gap-1.5 bg-white/10 p-1 rounded-xl">
                  <button
                    type="button"
                    onClick={() => setActiveSlipTab('initial')}
                    className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                      activeSlipTab === 'initial' ? 'bg-amber-500 text-black' : 'text-white/70 hover:text-white'
                    }`}
                  >
                    Deposit Slip
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveSlipTab('final')}
                    className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                      activeSlipTab === 'final' ? 'bg-emerald-500 text-black' : 'text-white/70 hover:text-white'
                    }`}
                  >
                    Final Slip
                  </button>
                </div>
              )}

              <a
                href={currentSlip}
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 rounded-xl bg-white/10 hover:bg-[#C18A45] hover:text-black text-white transition-colors"
                title="Open original file in new tab"
              >
                <ExternalLink className="w-5 h-5" />
              </a>

              <button
                type="button"
                onClick={() => setIsSlipExpanded(false)}
                className="px-3.5 py-2 rounded-xl bg-white/15 hover:bg-white/25 text-white font-bold text-xs flex items-center gap-1.5 transition-colors"
                title="Minimize / Return to details"
              >
                <Minimize2 className="w-4 h-4 text-[#C18A45]" />
                <span>Close Zoom</span>
              </button>
            </div>
          </div>

          {/* Centered Expanded Image */}
          <div
            className="flex-1 overflow-auto p-4 sm:p-8 flex items-center justify-center cursor-zoom-out"
            onClick={() => setIsSlipExpanded(false)}
          >
            {currentSlip.endsWith('.pdf') ? (
              <iframe src={currentSlip} className="w-full h-[85vh] rounded-2xl max-w-5xl" title="Payment Slip PDF" />
            ) : (
              <img
                src={currentSlip}
                alt="Expanded Payment Receipt"
                className="max-h-[86vh] max-w-[94vw] w-auto object-contain rounded-2xl shadow-2xl border border-white/20"
                onClick={(e) => e.stopPropagation()}
              />
            )}
          </div>
        </div>
      )}
    </>
  );
};
