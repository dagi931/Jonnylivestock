import React, { useState, useEffect, useRef } from 'react';
import { Animal } from '../../types/animal';
import { useUserAuth } from '../../context/UserAuthContext';
import { useTheme } from '../../context/ThemeContext';
import { useLanguage } from '../../context/LanguageContext';
import { api, BankAccount } from '../../services/api';
import { formatPrice } from '../../utils/formatters';
import { business } from '../../config/business';
import {
  X,
  UploadCloud,
  CheckCircle2,
  AlertCircle,
  Phone,
  MessageSquare,
  Copy,
  Check,
  CreditCard,
  Building2,
  Smartphone,
  ShieldCheck,
  ArrowRight,
  Sparkles,
  Info,
  Clock
} from 'lucide-react';

interface BuyPaymentModalProps {
  animal: Animal;
  isOpen: boolean;
  onClose: () => void;
  onOrderComplete?: () => void;
}

export const BuyPaymentModal: React.FC<BuyPaymentModalProps> = ({
  animal,
  isOpen,
  onClose,
  onOrderComplete
}) => {
  const { user, isAuthenticated, openAuthModal } = useUserAuth();
  const { theme } = useTheme();
  const { isAmharic } = useLanguage();
  const isDark = theme === 'design7';

  // Bank accounts from backend
  const [bankAccounts, setBankAccounts] = useState<BankAccount[]>([]);
  const [selectedBankId, setSelectedBankId] = useState<string>('BANK-TELEBIRR');
  const [copiedBankId, setCopiedBankId] = useState<string | null>(null);

  // Form Fields
  const [customerName, setCustomerName] = useState(user?.name || '');
  const [customerPhone, setCustomerPhone] = useState(user?.phone || '');
  const [customerEmail, setCustomerEmail] = useState(user?.email || '');
  const [deliveryLocation, setDeliveryLocation] = useState('');
  const [customerNotes, setCustomerNotes] = useState('');
  const [transactionRef, setTransactionRef] = useState('');
  const [selectedServices, setSelectedServices] = useState<string[]>([]);
  
  // File Upload State
  const [slipFile, setSlipFile] = useState<File | null>(null);
  const [slipPreviewUrl, setSlipPreviewUrl] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Submission Status
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [completedOrder, setCompletedOrder] = useState<any | null>(null);

  // Fetch bank accounts on mount
  useEffect(() => {
    if (isOpen) {
      api.getBankAccounts().then((accounts) => {
        if (accounts.length > 0) {
          setBankAccounts(accounts);
          setSelectedBankId(accounts[0].id);
        }
      });
      if (user) {
        setCustomerName(user.name || '');
        setCustomerPhone(user.phone || '');
        setCustomerEmail(user.email || '');
      }
    }
  }, [isOpen, user]);

  if (!isOpen) return null;

  // Calculate optional service add-ons
  const availableServices = [
    { id: 'delivery', name: isAmharic ? 'የእንስሳት ማጓጓዣ (Delivery)' : 'Livestock Delivery', fee: 1500 },
    { id: 'slaughter', name: isAmharic ? 'የእርድና የሥጋ ዝግጅት አገልግሎት' : 'Slaughter & Meat Prep', fee: 2000 }
  ];

  const servicesFee = selectedServices.reduce((acc, currId) => {
    const s = availableServices.find(srv => srv.id === currId);
    return acc + (s ? s.fee : 0);
  }, 0);

  const grandTotal = animal.price + servicesFee;

  const handleCopyAccount = (accNum: string, id: string) => {
    navigator.clipboard.writeText(accNum.replace(/\s+/g, ''));
    setCopiedBankId(id);
    setTimeout(() => setCopiedBankId(null), 2000);
  };

  const handleFileChange = (file: File) => {
    if (!file.type.startsWith('image/') && file.type !== 'application/pdf') {
      setSubmitError(isAmharic ? 'እባክዎ የምስል (Image) ወይም የPDF ፋይል ያስገቡ' : 'Please upload an image file (PNG, JPG) or PDF');
      return;
    }
    setSlipFile(file);
    setSubmitError(null);
    const objectUrl = URL.createObjectURL(file);
    setSlipPreviewUrl(objectUrl);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileChange(e.dataTransfer.files[0]);
    }
  };

  const toggleService = (srvId: string) => {
    setSelectedServices(prev =>
      prev.includes(srvId) ? prev.filter(id => id !== srvId) : [...prev, srvId]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError(null);

    if (!customerName.trim()) {
      setSubmitError(isAmharic ? 'እባክዎ ሙሉ ስምዎን ያስገቡ' : 'Please provide your full name');
      return;
    }
    if (!customerPhone.trim()) {
      setSubmitError(isAmharic ? 'እባክዎ ስልክ ቁጥርዎን ያስገቡ' : 'Please provide your phone number');
      return;
    }
    if (!slipFile) {
      setSubmitError(isAmharic ? 'እባክዎ የከፈሉበትን ደረሰኝ/ስሊፕ ምስል ይጫኑ' : 'Please upload your payment receipt or transfer screenshot');
      return;
    }

    setIsSubmitting(true);

    try {
      const selectedBank = bankAccounts.find(b => b.id === selectedBankId);
      const paymentMethodName = selectedBank ? selectedBank.bankName : 'Telebirr';

      const formData = new FormData();
      formData.append('customerName', customerName);
      formData.append('customerPhone', customerPhone);
      if (customerEmail) formData.append('customerEmail', customerEmail);
      if (deliveryLocation) formData.append('deliveryLocation', deliveryLocation);
      formData.append('animalId', animal.id);
      formData.append('selectedServices', JSON.stringify(selectedServices));
      formData.append('servicesFee', String(servicesFee));
      formData.append('paymentMethod', paymentMethodName);
      formData.append('bankAccountId', selectedBankId);
      if (transactionRef) formData.append('transactionReference', transactionRef);
      if (customerNotes) formData.append('customerNotes', customerNotes);
      formData.append('paymentSlip', slipFile);

      const res = await api.submitOrderWithSlip(formData);

      if (res.success && res.order) {
        setCompletedOrder(res.order);
        if (onOrderComplete) onOrderComplete();
      } else {
        setSubmitError(res.error || 'Failed to submit payment slip. Please try again.');
      }
    } catch (err: any) {
      setSubmitError(err.message || 'Error occurred while submitting order.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResetAndClose = () => {
    setCompletedOrder(null);
    setSlipFile(null);
    setSlipPreviewUrl(null);
    onClose();
  };

  const selectedBank = bankAccounts.find(b => b.id === selectedBankId) || bankAccounts[0];

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div
        className={`relative w-full max-w-2xl rounded-3xl border shadow-2xl p-6 sm:p-8 my-8 animate-in fade-in zoom-in-95 duration-200 ${
          isDark
            ? 'bg-[#24170D] border-[#4A2C16] text-[#F4E8D0]'
            : 'bg-[#FAF7F0] border-[#E4D4BC] text-[#2A1A0D]'
        }`}
      >
        {/* Close Button */}
        <button
          onClick={handleResetAndClose}
          type="button"
          className={`absolute top-5 right-5 p-2 rounded-full transition-colors ${
            isDark ? 'hover:bg-[#1B1208] text-[#D8C5A8]' : 'hover:bg-[#EFE8DC] text-[#746556]'
          }`}
          aria-label="Close modal"
        >
          <X className="w-5 h-5" />
        </button>

        {/* ==================== SUCCESS STATE ==================== */}
        {completedOrder ? (
          <div className="text-center py-6">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-emerald-500/20 text-emerald-400 mb-4 animate-bounce">
              <CheckCircle2 className="w-10 h-10" />
            </div>

            <h2 className="text-2xl sm:text-3xl font-bold font-serif mb-2">
              {isAmharic ? 'የክፍያ ደረሰኝዎ በተሳካ ሁኔታ ደርሶናል!' : 'Payment Slip Uploaded Successfully!'}
            </h2>
            
            <p className={`text-sm max-w-md mx-auto mb-6 ${isDark ? 'text-[#D8C5A8]/80' : 'text-[#746556]'}`}>
              {isAmharic
                ? `የትዕዛዝ ቁጥርዎ #${completedOrder.id} ነው። አስተዳዳሪው ደረሰኝዎን በማረጋገጥ ላይ ይገኛል። እንስሳው ተይዞሎታል!`
                : `Your order #${completedOrder.id} has been submitted. Admin has been notified to verify your payment slip. The animal is reserved for you!`}
            </p>

            {/* Order Summary Card */}
            <div
              className={`max-w-md mx-auto rounded-2xl p-4 mb-6 border text-left ${
                isDark ? 'bg-[#1B1208] border-[#4A2C16]' : 'bg-white border-[#E4D4BC]'
              }`}
            >
              <div className="flex justify-between items-center pb-2 border-b border-black/10 dark:border-white/10 text-xs font-semibold uppercase opacity-70">
                <span>{isAmharic ? 'የትዕዛዝ ዝርዝር' : 'Order Reference'}</span>
                <span className="text-[#C18A45] font-mono">{completedOrder.id}</span>
              </div>
              <div className="mt-3 space-y-1.5 text-sm">
                <div className="flex justify-between">
                  <span className="opacity-70">{isAmharic ? 'የእንስሳ አይነት' : 'Item'}:</span>
                  <span className="font-semibold">{completedOrder.animalBreed} ({completedOrder.animalId})</span>
                </div>
                <div className="flex justify-between">
                  <span className="opacity-70">{isAmharic ? 'ጠቅላላ የተከፈለው' : 'Total Amount'}:</span>
                  <span className="font-bold text-[#C18A45]">{formatPrice(completedOrder.totalAmount)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="opacity-70">{isAmharic ? 'የክፍያ መንገድ' : 'Payment Method'}:</span>
                  <span>{completedOrder.paymentMethod}</span>
                </div>
                <div className="flex justify-between items-center pt-2">
                  <span className="opacity-70">{isAmharic ? 'ሁኔታ' : 'Status'}:</span>
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-500/20 text-amber-400 border border-amber-500/30">
                    Pending Admin Verification
                  </span>
                </div>
              </div>
            </div>

            {/* Admin Direct Contact Box */}
            <div
              className={`max-w-md mx-auto rounded-2xl p-5 mb-6 border text-left ${
                isDark ? 'bg-[#2A1A0D] border-[#C18A45]/40' : 'bg-[#F4EEDB] border-[#C18A45]/40'
              }`}
            >
              <h4 className="text-sm font-bold flex items-center gap-2 mb-2 text-[#C18A45]">
                <ShieldCheck className="w-4 h-4" />
                {isAmharic ? 'የአስተዳዳሪው ቀጥታ አድራሻ (Direct Admin Contact)' : 'Direct Admin Contact for Immediate Pickup / Delivery'}
              </h4>
              <p className="text-xs opacity-80 mb-3">
                {isAmharic
                  ? 'ክፍያዎን በፍጥነት ለማረጋገጥ እና ርክክቡን ለማመቻቸት አሁኑኑ በቀጥታ ይደውሉ ወይም በዋትስአፕ ያናግሩን።'
                  : 'For fastest verification and delivery scheduling, reach out directly to our admin team:'}
              </p>

              <div className="grid grid-cols-2 gap-2">
                <a
                  href={`tel:${business.phone}`}
                  className="flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl bg-[#C18A45] text-white text-xs font-bold shadow hover:bg-[#A06E35] transition-colors"
                >
                  <Phone className="w-3.5 h-3.5" />
                  <span>{business.displayPhone}</span>
                </a>
                <a
                  href={`https://wa.me/${business.whatsapp}?text=Hello,%20I%20have%20submitted%20payment%20slip%20for%20order%20${completedOrder.id}%20(${animal.breed})`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl bg-emerald-600 text-white text-xs font-bold shadow hover:bg-emerald-700 transition-colors"
                >
                  <MessageSquare className="w-3.5 h-3.5" />
                  <span>WhatsApp Chat</span>
                </a>
              </div>
            </div>

            <button
              onClick={handleResetAndClose}
              className="px-8 py-3 rounded-xl bg-black/10 dark:bg-white/10 hover:bg-black/20 text-sm font-bold transition-colors"
            >
              {isAmharic ? 'ዝጋ (Close)' : 'Done / Return to Catalog'}
            </button>
          </div>
        ) : (
          /* ==================== CHECKOUT & SLIP UPLOAD FORM ==================== */
          <div>
            {/* Header */}
            <div className="mb-6">
              <div className="flex items-center gap-2 text-[#C18A45] text-xs font-bold uppercase tracking-wider mb-1">
                <Sparkles className="w-4 h-4" />
                <span>{isAmharic ? 'የቀጥታ ግዢና ክፍያ' : 'Direct Purchase & Slip Upload'}</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-bold font-serif">
                {animal.breed} <span className="text-sm font-normal opacity-60">({animal.id})</span>
              </h2>
            </div>

            {/* Animal Quick Summary Card */}
            <div
              className={`flex flex-col sm:flex-row gap-4 p-4 rounded-2xl border mb-6 ${
                isDark ? 'bg-[#1B1208] border-[#4A2C16]' : 'bg-white border-[#E4D4BC]'
              }`}
            >
              <img
                src={animal.images[0]}
                alt={animal.breed}
                className="w-full sm:w-24 h-24 object-cover rounded-xl border border-black/10"
              />
              <div className="flex-1 flex flex-col justify-between">
                <div>
                  <div className="flex justify-between items-start">
                    <span className="font-bold text-base">{animal.breed}</span>
                    <span className="text-lg font-bold text-[#C18A45]">{formatPrice(animal.price)}</span>
                  </div>
                  <p className="text-xs opacity-70 mt-1">
                    {animal.weight} kg • {animal.gender} • {animal.color} • {animal.location}
                  </p>
                </div>

                {/* Optional Services Checkbox */}
                <div className="mt-2 pt-2 border-t border-black/5 dark:border-white/5 flex flex-wrap gap-2">
                  {availableServices.map((srv) => (
                    <button
                      key={srv.id}
                      type="button"
                      onClick={() => toggleService(srv.id)}
                      className={`text-xs px-2.5 py-1 rounded-lg border transition-all flex items-center gap-1.5 ${
                        selectedServices.includes(srv.id)
                          ? 'bg-[#C18A45]/20 border-[#C18A45] text-[#C18A45] font-semibold'
                          : 'opacity-60 border-transparent hover:opacity-100'
                      }`}
                    >
                      <span>{selectedServices.includes(srv.id) ? '✓' : '+'}</span>
                      <span>{srv.name} (+{srv.fee} ETB)</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Total Display */}
            <div className="flex justify-between items-center mb-6 px-1">
              <span className="text-sm font-semibold opacity-80">{isAmharic ? 'ጠቅላላ የሚከፈለው' : 'Total Due'}:</span>
              <span className="text-2xl font-black text-[#C18A45]">{formatPrice(grandTotal)}</span>
            </div>

            {/* Error Banner */}
            {submitError && (
              <div className="mb-4 p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-sm flex items-center gap-2">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{submitError}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* STEP 1: Bank Selection & Details */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider mb-2 opacity-80 flex items-center gap-1.5">
                  <CreditCard className="w-3.5 h-3.5 text-[#C18A45]" />
                  <span>1. {isAmharic ? 'የመክፈያ ባንክ ይምረጡ' : 'Select Bank & Transfer Payment'}</span>
                </label>

                {/* Bank Pills */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-3">
                  {bankAccounts.map((b) => (
                    <button
                      key={b.id}
                      type="button"
                      onClick={() => setSelectedBankId(b.id)}
                      className={`p-2.5 rounded-xl border text-left text-xs transition-all ${
                        selectedBankId === b.id
                          ? 'bg-[#C18A45] text-white border-[#C18A45] shadow-md'
                          : isDark
                          ? 'bg-[#1B1208] border-[#4A2C16] hover:border-[#C18A45]/50'
                          : 'bg-white border-[#E4D4BC] hover:border-[#C18A45]/50'
                      }`}
                    >
                      <div className="font-bold truncate">{b.bankName.split('(')[0]}</div>
                      <div className="opacity-80 text-[10px] truncate">{b.accountNumber}</div>
                    </button>
                  ))}
                </div>

                {/* Selected Bank Details Card */}
                {selectedBank && (
                  <div
                    className={`p-4 rounded-2xl border ${
                      isDark ? 'bg-[#1B1208] border-[#C18A45]/30' : 'bg-white border-[#C18A45]/30'
                    }`}
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="font-bold text-sm text-[#C18A45]">{selectedBank.bankName}</div>
                        <div className="text-xs opacity-70 mt-0.5">{isAmharic ? 'የሂሳብ ስም' : 'Account Name'}: <span className="font-semibold">{selectedBank.accountName}</span></div>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleCopyAccount(selectedBank.accountNumber, selectedBank.id)}
                        className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-[#C18A45]/15 hover:bg-[#C18A45]/25 text-[#C18A45] text-xs font-bold transition-colors"
                      >
                        {copiedBankId === selectedBank.id ? (
                          <>
                            <Check className="w-3.5 h-3.5" />
                            <span>{isAmharic ? 'ተቀድቷል' : 'Copied!'}</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3.5 h-3.5" />
                            <span>{isAmharic ? 'ቁጥሩን ቅዳ' : 'Copy Number'}</span>
                          </>
                        )}
                      </button>
                    </div>
                    <div className="mt-2 text-lg font-mono font-bold tracking-wider text-[#C18A45]">
                      {selectedBank.accountNumber}
                    </div>
                    {selectedBank.instructions && (
                      <p className="mt-2 text-xs opacity-75 border-t border-black/5 dark:border-white/5 pt-2 flex items-start gap-1.5">
                        <Info className="w-3.5 h-3.5 flex-shrink-0 text-[#C18A45] mt-0.5" />
                        <span>{selectedBank.instructions}</span>
                      </p>
                    )}
                  </div>
                )}
              </div>

              {/* STEP 2: SLIP UPLOAD SPACE */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider mb-2 opacity-80 flex items-center gap-1.5">
                  <UploadCloud className="w-3.5 h-3.5 text-[#C18A45]" />
                  <span>2. {isAmharic ? 'የክፍያ ደረሰኝዎን (ስሊፕ) ይጫኑ' : 'Upload Payment Slip / Receipt'} *</span>
                </label>

                <div
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  onClick={() => fileInputRef.current?.click()}
                  className={`border-2 border-dashed rounded-2xl p-5 text-center cursor-pointer transition-all ${
                    isDragging
                      ? 'border-[#C18A45] bg-[#C18A45]/10 scale-[1.01]'
                      : slipPreviewUrl
                      ? 'border-emerald-500/50 bg-emerald-500/5'
                      : isDark
                      ? 'border-[#4A2C16] hover:border-[#C18A45]/60 bg-[#1B1208]'
                      : 'border-[#E4D4BC] hover:border-[#C18A45]/60 bg-white'
                  }`}
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*,application/pdf"
                    className="hidden"
                    onChange={(e) => {
                      if (e.target.files && e.target.files[0]) {
                        handleFileChange(e.target.files[0]);
                      }
                    }}
                  />

                  {slipPreviewUrl ? (
                    <div className="flex flex-col items-center">
                      <div className="relative mb-3">
                        <img
                          src={slipPreviewUrl}
                          alt="Slip Preview"
                          className="max-h-36 rounded-xl border border-emerald-500/30 object-contain shadow-md"
                        />
                        <span className="absolute top-2 right-2 p-1 rounded-full bg-emerald-500 text-white">
                          <Check className="w-3.5 h-3.5" />
                        </span>
                      </div>
                      <p className="text-xs font-semibold text-emerald-500 mb-1">
                        ✓ {slipFile?.name} ({Math.round((slipFile?.size || 0) / 1024)} KB)
                      </p>
                      <p className="text-[11px] opacity-60">
                        {isAmharic ? 'ሌላ ለመቀየር እዚህ ይጫኑ' : 'Click to replace or choose another slip'}
                      </p>
                    </div>
                  ) : (
                    <div className="py-3">
                      <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-[#C18A45]/15 text-[#C18A45] mb-2">
                        <UploadCloud className="w-6 h-6" />
                      </div>
                      <p className="text-sm font-bold">
                        {isAmharic ? 'የስሊፕ ወይም የደረሰኝ ፎቶ እዚህ ይጫኑ' : 'Click to Browse or Drag & Drop Slip'}
                      </p>
                      <p className="text-xs opacity-60 mt-1">
                        Supports JPEG, PNG, WEBP, PDF (Max 10MB)
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* STEP 3: Customer Information */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider mb-2 opacity-80">
                  3. {isAmharic ? 'የእርስዎ መረጃ' : 'Customer & Delivery Information'}
                </label>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <input
                      type="text"
                      required
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                      placeholder={isAmharic ? 'ሙሉ ስም *' : 'Full Name *'}
                      className={`w-full px-3.5 py-2.5 rounded-xl border text-sm transition-all focus:outline-none focus:ring-2 focus:ring-[#C18A45] ${
                        isDark
                          ? 'bg-[#1B1208] border-[#4A2C16] text-[#F4E8D0] placeholder-[#D8C5A8]/40'
                          : 'bg-white border-[#E4D4BC] text-[#2A1A0D] placeholder-[#746556]/40'
                      }`}
                    />
                  </div>
                  <div>
                    <input
                      type="tel"
                      required
                      value={customerPhone}
                      onChange={(e) => setCustomerPhone(e.target.value)}
                      placeholder={isAmharic ? 'ስልክ ቁጥር *' : 'Phone Number *'}
                      className={`w-full px-3.5 py-2.5 rounded-xl border text-sm transition-all focus:outline-none focus:ring-2 focus:ring-[#C18A45] ${
                        isDark
                          ? 'bg-[#1B1208] border-[#4A2C16] text-[#F4E8D0] placeholder-[#D8C5A8]/40'
                          : 'bg-white border-[#E4D4BC] text-[#2A1A0D] placeholder-[#746556]/40'
                      }`}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-3">
                  <div>
                    <input
                      type="text"
                      value={transactionRef}
                      onChange={(e) => setTransactionRef(e.target.value)}
                      placeholder={isAmharic ? 'የግብይት መለያ (Transaction Ref/ID)' : 'Transaction ID / Ref (Optional)'}
                      className={`w-full px-3.5 py-2.5 rounded-xl border text-sm transition-all focus:outline-none focus:ring-2 focus:ring-[#C18A45] ${
                        isDark
                          ? 'bg-[#1B1208] border-[#4A2C16] text-[#F4E8D0] placeholder-[#D8C5A8]/40'
                          : 'bg-white border-[#E4D4BC] text-[#2A1A0D] placeholder-[#746556]/40'
                      }`}
                    />
                  </div>
                  <div>
                    <input
                      type="text"
                      value={deliveryLocation}
                      onChange={(e) => setDeliveryLocation(e.target.value)}
                      placeholder={isAmharic ? 'የማስረከቢያ አድራሻ (Delivery Location)' : 'Delivery Address / Pickup Note'}
                      className={`w-full px-3.5 py-2.5 rounded-xl border text-sm transition-all focus:outline-none focus:ring-2 focus:ring-[#C18A45] ${
                        isDark
                          ? 'bg-[#1B1208] border-[#4A2C16] text-[#F4E8D0] placeholder-[#D8C5A8]/40'
                          : 'bg-white border-[#E4D4BC] text-[#2A1A0D] placeholder-[#746556]/40'
                      }`}
                    />
                  </div>
                </div>
              </div>

              {/* Admin Direct Contacts Callout */}
              <div
                className={`p-3.5 rounded-2xl border text-xs flex items-center justify-between gap-3 ${
                  isDark ? 'bg-[#1B1208] border-[#4A2C16]' : 'bg-[#F2ECE1] border-[#E4D4BC]'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-[#C18A45]/20 text-[#C18A45] flex items-center justify-center flex-shrink-0">
                    <Phone className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="font-bold">{isAmharic ? 'የአስተዳዳሪ ቀጥታ ስልክ' : 'Admin Hotline'}: {business.displayPhone}</div>
                    <div className="opacity-70">{isAmharic ? 'ጥያቄ ካለዎት አሁኑኑ ይደውሉልን' : 'Call or WhatsApp anytime for help'}</div>
                  </div>
                </div>
                <a
                  href={`tel:${business.phone}`}
                  className="px-3 py-1.5 rounded-xl bg-[#C18A45] text-white font-bold hover:bg-[#A06E35] transition-colors flex-shrink-0"
                >
                  {isAmharic ? 'ይደውሉ' : 'Call'}
                </a>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-4 rounded-2xl bg-gradient-to-r from-[#C18A45] to-[#A06E35] text-white font-bold text-base shadow-xl hover:shadow-2xl hover:scale-[1.01] active:scale-[0.99] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isSubmitting ? (
                  <>
                    <span className="inline-block w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>{isAmharic ? 'ደረሰኝ በመጫን ላይ...' : 'Uploading Payment Slip & Notifying Admin...'}</span>
                  </>
                ) : (
                  <>
                    <ShieldCheck className="w-5 h-5" />
                    <span>{isAmharic ? 'ክፍያዬን አረጋግጥና ትዕዛዝ ላክ' : `Submit Payment Slip (${formatPrice(grandTotal)})`}</span>
                    <ArrowRight className="w-4 h-4 ml-1" />
                  </>
                )}
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};
