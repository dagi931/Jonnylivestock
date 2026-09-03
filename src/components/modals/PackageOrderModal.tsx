import React, { useState, useEffect, useRef } from 'react';
import { PackageCatalogItem, PreMadePackage } from '../../types/package';
import { useUserAuth } from '../../context/UserAuthContext';
import { useTheme } from '../../context/ThemeContext';
import { useLanguage } from '../../context/LanguageContext';
import { api, BankAccount } from '../../services/api';
import { formatPrice, getPackageTitle, cleanEnglishText } from '../../utils/formatters';
import {
  X,
  UploadCloud,
  CheckCircle2,
  AlertCircle,
  Copy,
  Check,
  CreditCard,
  ShieldCheck,
  Gift,
  Truck,
  Sparkles
} from 'lucide-react';

interface PackageOrderModalProps {
  isOpen: boolean;
  onClose: () => void;
  packageItem?: PreMadePackage | null;
  customPackage?: {
    name: string;
    items: PackageCatalogItem[];
    totalPrice: number;
    categoriesCount: number;
  } | null;
  onSuccess?: () => void;
}

export const PackageOrderModal: React.FC<PackageOrderModalProps> = ({
  isOpen,
  onClose,
  packageItem,
  customPackage,
  onSuccess
}) => {
  const { user } = useUserAuth();
  const { theme } = useTheme();
  const { isAmharic } = useLanguage();
  const isDark = theme === 'design7';

  // Payment Mode: 'deposit' (50%) or 'full' (100%)
  const [paymentMode, setPaymentMode] = useState<'deposit' | 'full'>('deposit');

  // Bank accounts from backend
  const [bankAccounts, setBankAccounts] = useState<BankAccount[]>([]);
  const [selectedBankId, setSelectedBankId] = useState<string>('');
  const [copiedBankId, setCopiedBankId] = useState<string | null>(null);

  // Form Fields
  const [customerName, setCustomerName] = useState(user?.name || '');
  const [customerPhone, setCustomerPhone] = useState(user?.phone || '');
  const [customerEmail, setCustomerEmail] = useState(user?.email || '');
  const [deliveryLocation, setDeliveryLocation] = useState('');
  const [customerNotes, setCustomerNotes] = useState('');
  const [transactionRef, setTransactionRef] = useState('');

  // File Upload State
  const [slipFile, setSlipFile] = useState<File | null>(null);
  const [slipPreviewUrl, setSlipPreviewUrl] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Submission Status
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);
  const [createdOrderId, setCreatedOrderId] = useState<string | null>(null);

  useEffect(() => {
    const fetchBanks = async () => {
      const banks = await api.getBankAccounts();
      if (banks && banks.length > 0) {
        setBankAccounts(banks);
        setSelectedBankId(banks[0].id);
      }
    };
    if (isOpen) {
      fetchBanks();
      setIsSuccess(false);
      setSubmitError(null);
      setSlipFile(null);
      setSlipPreviewUrl(null);
      if (user) {
        setCustomerName(user.name);
        setCustomerPhone(user.phone || '');
        setCustomerEmail(user.email || '');
      }
    }
  }, [isOpen, user]);

  if (!isOpen) return null;

  // Derive package name & total price
  const packageName = packageItem
    ? getPackageTitle(packageItem, isAmharic)
    : customPackage
      ? (isAmharic ? customPackage.name : cleanEnglishText(customPackage.name))
      : (isAmharic ? 'የበዓል ጥቅል' : 'Celebration Package');
  const totalPrice = packageItem?.packagePrice || customPackage?.totalPrice || 0;
  const depositAmount = Math.round(totalPrice * 0.5);
  const remainingAmount = totalPrice - depositAmount;
  const currentPayAmount = paymentMode === 'deposit' ? depositAmount : totalPrice;

  const selectedBank = bankAccounts.find(b => b.id === selectedBankId) || bankAccounts[0];

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedBankId(id);
    setTimeout(() => setCopiedBankId(null), 2000);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSlipFile(file);
      const url = URL.createObjectURL(file);
      setSlipPreviewUrl(url);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      setSlipFile(file);
      const url = URL.createObjectURL(file);
      setSlipPreviewUrl(url);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!slipFile) {
      setSubmitError('Please attach your transfer receipt screenshot/slip');
      return;
    }
    if (!customerName.trim() || !customerPhone.trim()) {
      setSubmitError('Please fill in your name and phone number');
      return;
    }

    setIsSubmitting(true);
    setSubmitError(null);

    try {
      const formData = new FormData();
      formData.append('customerName', customerName.trim());
      formData.append('customerPhone', customerPhone.trim());
      if (customerEmail.trim()) formData.append('customerEmail', customerEmail.trim());
      if (deliveryLocation.trim()) formData.append('deliveryLocation', deliveryLocation.trim());
      if (customerNotes.trim()) formData.append('notes', customerNotes.trim());
      if (transactionRef.trim()) formData.append('transactionReference', transactionRef.trim());
      if (selectedBank) formData.append('paymentMethod', selectedBank.bankName);

      // Package specific attributes
      formData.append('isPackage', 'true');
      formData.append('packageName', packageName);
      formData.append('totalAmount', totalPrice.toString());
      formData.append('isReservation', paymentMode === 'deposit' ? 'true' : 'false');
      formData.append('depositAmount', depositAmount.toString());
      formData.append('remainingAmount', remainingAmount.toString());

      const packageDetailsJson = JSON.stringify({
        preMadeId: packageItem?.id,
        items: packageItem?.items || customPackage?.items || [],
        categoriesCount: packageItem?.categoryCount || customPackage?.categoriesCount || 3,
        freeDelivery: true
      });
      formData.append('packageDetails', packageDetailsJson);

      formData.append('paymentSlip', slipFile);

      const res = await api.submitOrderWithSlip(formData);

      if (res.success && res.order) {
        setIsSuccess(true);
        setCreatedOrderId(res.order.id);
        if (onSuccess) onSuccess();
      } else {
        setSubmitError(res.error || 'Failed to submit order. Please try again.');
      }
    } catch (err: any) {
      console.error('Package order error:', err);
      setSubmitError(err.message || 'Network error while placing package order');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/75 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-200">
      <div
        className={`relative w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden border transition-all ${
          isDark
            ? 'bg-[#1D130A] border-[#4A2C16] text-[#F4E8D0]'
            : 'bg-white border-[#E4D4BC] text-[#241A12]'
        }`}
      >
        {/* Header */}
        <div
          className={`px-6 py-5 flex items-center justify-between border-b ${
            isDark ? 'bg-[#2A1A0D] border-[#4A2C16]' : 'bg-[#FAF7F0] border-[#E4D4BC]'
          }`}
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-500">
              <Gift className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-serif font-bold text-lg leading-tight">{packageName}</h3>
              <div className="flex items-center gap-2 text-xs opacity-75">
                <span className="flex items-center gap-1 text-emerald-500 font-semibold">
                  <Truck className="w-3.5 h-3.5" /> Free Delivery
                </span>
                <span>•</span>
                <span>All-in-one celebration bundle</span>
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-neutral-400 hover:text-neutral-200 hover:bg-black/10 dark:hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 max-h-[80vh] overflow-y-auto space-y-6">
          {isSuccess ? (
            <div className="text-center py-8 space-y-4">
              <div className="w-16 h-16 rounded-full bg-emerald-500/15 text-emerald-500 flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-10 h-10" />
              </div>
              <h4 className="font-serif font-bold text-2xl text-emerald-500">
                {paymentMode === 'deposit' ? 'Reservation Deposit Submitted!' : 'Package Order Placed!'}
              </h4>
              <p className="text-xs sm:text-sm opacity-80 max-w-md mx-auto leading-relaxed">
                Order ID: <strong className="font-mono text-amber-500">{createdOrderId}</strong>. Our admin team has received your payment slip and will verify it shortly. You can track this in <strong>"My Reservations"</strong>.
              </p>
              <div className="pt-2">
                <button
                  onClick={onClose}
                  className="px-8 py-3 rounded-2xl bg-amber-500 hover:bg-amber-600 text-black font-bold transition-all shadow-lg shadow-amber-500/25"
                >
                  Done
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Payment Mode Selector: 50% Reservation vs 100% Full */}
              <div className="space-y-2">
                <label className="block text-xs font-bold uppercase tracking-wider opacity-80">
                  Select Payment Option:
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div
                    onClick={() => setPaymentMode('deposit')}
                    className={`p-4 rounded-2xl border-2 cursor-pointer transition-all ${
                      paymentMode === 'deposit'
                        ? 'border-amber-500 bg-amber-500/10 shadow-md'
                        : isDark
                          ? 'border-[#4A2C16] bg-[#24170D] opacity-70 hover:opacity-100'
                          : 'border-[#E4D4BC] bg-[#FAF7F0] opacity-70 hover:opacity-100'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <div className="font-bold text-sm flex items-center gap-1.5 text-amber-500">
                        <ShieldCheck className="w-4 h-4" />
                        <span>50% Deposit (Reserve)</span>
                      </div>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500 text-black">
                        Recommended
                      </span>
                    </div>
                    <div className="font-serif font-bold text-lg text-amber-500">
                      {formatPrice(depositAmount)}
                    </div>
                    <p className="text-[11px] opacity-70 mt-1">
                      Lock item now with half payment. Pay remaining {formatPrice(remainingAmount)} before delivery.
                    </p>
                  </div>

                  <div
                    onClick={() => setPaymentMode('full')}
                    className={`p-4 rounded-2xl border-2 cursor-pointer transition-all ${
                      paymentMode === 'full'
                        ? 'border-amber-500 bg-amber-500/10 shadow-md'
                        : isDark
                          ? 'border-[#4A2C16] bg-[#24170D] opacity-70 hover:opacity-100'
                          : 'border-[#E4D4BC] bg-[#FAF7F0] opacity-70 hover:opacity-100'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <div className="font-bold text-sm flex items-center gap-1.5">
                        <Sparkles className="w-4 h-4 text-emerald-500" />
                        <span>100% Full Payment</span>
                      </div>
                    </div>
                    <div className="font-serif font-bold text-lg">
                      {formatPrice(totalPrice)}
                    </div>
                    <p className="text-[11px] opacity-70 mt-1">
                      Complete full transaction upfront. Seamless dispatch and door delivery.
                    </p>
                  </div>
                </div>
              </div>

              {/* Bank Accounts */}
              <div
                className={`p-4 rounded-2xl border space-y-3 ${
                  isDark ? 'bg-[#24170D] border-[#4A2C16]' : 'bg-[#FAF7F0] border-[#E4D4BC]'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="text-xs font-bold uppercase tracking-wider opacity-80 flex items-center gap-1.5">
                    <CreditCard className="w-3.5 h-3.5 text-amber-500" /> Transfer {formatPrice(currentPayAmount)} To:
                  </div>
                  <div className="text-[11px] opacity-70">Official Business Accounts</div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {bankAccounts.map(b => (
                    <button
                      key={b.id}
                      type="button"
                      onClick={() => setSelectedBankId(b.id)}
                      className={`p-2.5 rounded-xl border text-center transition-all ${
                        selectedBankId === b.id
                          ? 'bg-amber-500 text-black font-bold border-amber-500 shadow-sm'
                          : isDark
                            ? 'bg-[#1D130A] border-[#4A2C16] text-[#F4E8D0] hover:border-amber-500/50'
                            : 'bg-white border-[#E4D4BC] text-[#241A12] hover:border-amber-500/50'
                      }`}
                    >
                      <div className="text-xs font-bold truncate">{b.bankName}</div>
                    </button>
                  ))}
                </div>

                {selectedBank && (
                  <div
                    className={`p-3 rounded-xl border space-y-2 text-xs ${
                      isDark ? 'bg-[#1B1208] border-[#4A2C16]' : 'bg-white border-[#E4D4BC]'
                    }`}
                  >
                    <div className="flex justify-between items-center">
                      <span className="opacity-70">Account Name:</span>
                      <span className="font-bold">{selectedBank.accountName}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="opacity-70">Account Number:</span>
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-amber-500">{selectedBank.accountNumber}</span>
                        <button
                          type="button"
                          onClick={() => handleCopy(selectedBank.accountNumber, selectedBank.id)}
                          className="p-1 rounded hover:bg-black/10 dark:hover:bg-white/10"
                        >
                          {copiedBankId === selectedBank.id ? (
                            <Check className="w-3.5 h-3.5 text-emerald-500" />
                          ) : (
                            <Copy className="w-3.5 h-3.5 opacity-60" />
                          )}
                        </button>
                      </div>
                    </div>
                    {selectedBank.instructions && (
                      <p className="text-[11px] opacity-75 italic pt-1 border-t border-black/10 dark:border-white/10">
                        {selectedBank.instructions}
                      </p>
                    )}
                  </div>
                )}
              </div>

              {/* Customer Info Fields */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-xs font-bold mb-1 opacity-80">
                    Full Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={customerName}
                    onChange={e => setCustomerName(e.target.value)}
                    placeholder="e.g. Dawit Tadesse"
                    className={`w-full px-3.5 py-2.5 rounded-xl border text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 ${
                      isDark
                        ? 'bg-[#24170D] border-[#4A2C16] text-[#F4E8D0]'
                        : 'bg-white border-[#E4D4BC] text-[#241A12]'
                    }`}
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold mb-1 opacity-80">
                    Phone Number <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="tel"
                    required
                    value={customerPhone}
                    onChange={e => setCustomerPhone(e.target.value)}
                    placeholder="e.g. +251 911 234 567"
                    className={`w-full px-3.5 py-2.5 rounded-xl border text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 ${
                      isDark
                        ? 'bg-[#24170D] border-[#4A2C16] text-[#F4E8D0]'
                        : 'bg-white border-[#E4D4BC] text-[#241A12]'
                    }`}
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold mb-1 opacity-80">
                    Delivery Address / Specific Neighborhood
                  </label>
                  <input
                    type="text"
                    value={deliveryLocation}
                    onChange={e => setDeliveryLocation(e.target.value)}
                    placeholder="e.g. Bole, Ayat, CMC, Sarbet, Bishoftu..."
                    className={`w-full px-3.5 py-2.5 rounded-xl border text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 ${
                      isDark
                        ? 'bg-[#24170D] border-[#4A2C16] text-[#F4E8D0]'
                        : 'bg-white border-[#E4D4BC] text-[#241A12]'
                    }`}
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold mb-1 opacity-80">
                    Transaction Reference (Optional)
                  </label>
                  <input
                    type="text"
                    value={transactionRef}
                    onChange={e => setTransactionRef(e.target.value)}
                    placeholder="e.g. FT2348589..."
                    className={`w-full px-3.5 py-2.5 rounded-xl border text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 ${
                      isDark
                        ? 'bg-[#24170D] border-[#4A2C16] text-[#F4E8D0]'
                        : 'bg-white border-[#E4D4BC] text-[#241A12]'
                    }`}
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold mb-1 opacity-80">
                    Special Delivery Instructions (Optional)
                  </label>
                  <input
                    type="text"
                    value={customerNotes}
                    onChange={e => setCustomerNotes(e.target.value)}
                    placeholder="e.g. Deliver before 10 AM on Holiday Eve"
                    className={`w-full px-3.5 py-2.5 rounded-xl border text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 ${
                      isDark
                        ? 'bg-[#24170D] border-[#4A2C16] text-[#F4E8D0]'
                        : 'bg-white border-[#E4D4BC] text-[#241A12]'
                    }`}
                  />
                </div>
              </div>

              {/* Upload Receipt / Slip */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold uppercase tracking-wider opacity-80">
                  Upload Transfer Slip Screenshot <span className="text-red-500">*</span>
                </label>

                <div
                  onDragOver={e => { e.preventDefault(); setIsDragging(true); }}
                  onDragLeave={() => setIsDragging(false)}
                  onDrop={handleDrop}
                  onClick={() => fileInputRef.current?.click()}
                  className={`p-5 rounded-2xl border-2 border-dashed cursor-pointer text-center transition-all ${
                    isDragging
                      ? 'border-amber-500 bg-amber-500/10'
                      : slipPreviewUrl
                        ? 'border-emerald-500 bg-emerald-500/5'
                        : isDark
                          ? 'border-[#4A2C16] hover:border-amber-500/50 bg-[#24170D]'
                          : 'border-[#E4D4BC] hover:border-amber-500/50 bg-[#FAF7F0]'
                  }`}
                >
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    accept="image/*,.pdf"
                    className="hidden"
                  />

                  {slipPreviewUrl ? (
                    <div className="space-y-2">
                      <img
                        src={slipPreviewUrl}
                        alt="Payment Slip Preview"
                        className="max-h-36 mx-auto rounded-xl shadow-md object-contain border"
                      />
                      <div className="text-xs font-bold text-emerald-500 flex items-center justify-center gap-1">
                        <CheckCircle2 className="w-4 h-4" /> Slip Attached ({slipFile?.name})
                      </div>
                      <p className="text-[11px] opacity-60">Click or drag to change receipt</p>
                    </div>
                  ) : (
                    <div className="space-y-1.5">
                      <div className="w-10 h-10 rounded-full bg-amber-500/15 text-amber-500 flex items-center justify-center mx-auto">
                        <UploadCloud className="w-5 h-5" />
                      </div>
                      <div className="text-xs font-bold">Click to browse or drop your transfer screenshot</div>
                      <div className="text-[11px] opacity-60">Supports JPG, PNG, PDF (Telebirr or Bank SMS/Slip)</div>
                    </div>
                  )}
                </div>
              </div>

              {submitError && (
                <div className="p-3 rounded-xl bg-red-500/15 border border-red-500/30 text-red-400 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{submitError}</span>
                </div>
              )}

              {/* Submit Action */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3.5 rounded-2xl bg-amber-500 hover:bg-amber-600 disabled:opacity-50 text-black font-bold text-sm tracking-wide transition-all shadow-lg shadow-amber-500/25 flex items-center justify-center gap-2"
              >
                {isSubmitting ? (
                  <span>Processing...</span>
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4" />
                    <span>
                      {paymentMode === 'deposit'
                        ? `Submit 50% Reservation Deposit (${formatPrice(depositAmount)})`
                        : `Complete Full Order (${formatPrice(totalPrice)})`}
                    </span>
                  </>
                )}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
