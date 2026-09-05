import React, { useState, useEffect, useRef } from 'react';
import { useUserAuth } from '../../context/UserAuthContext';
import { useTheme } from '../../context/ThemeContext';
import { useLanguage } from '../../context/LanguageContext';
import { api, BankAccount } from '../../services/api';
import { formatPrice } from '../../utils/formatters';
import {
  X,
  UploadCloud,
  CheckCircle2,
  AlertCircle,
  Copy,
  Check,
  CreditCard,
  Scale,
  Beef,
  Truck,
  MapPin,
  RefreshCw,
  Sparkles
} from 'lucide-react';
import { DeliveryLocationModal } from '../delivery/DeliveryLocationModal';
import { DeliveryVehicleSelector } from '../delivery/DeliveryVehicleSelector';
import { SelectedDeliveryLocation, VehicleQuoteResult, VehicleTypeId, DeliveryQuoteResponse } from '../../types/delivery';

interface MeatByKgOrderModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

type MeatCutKey = 'kurt' | 'kitfo' | 'tibs_wot';

export const MeatByKgOrderModal: React.FC<MeatByKgOrderModalProps> = ({
  isOpen,
  onClose,
  onSuccess
}) => {
  const { user, isAuthenticated, openAuthModal } = useUserAuth();
  const { theme } = useTheme();
  const { isAmharic } = useLanguage();
  const isDark = theme === 'design7';

  // Live Meat Pricing from Admin Settings
  const [pricing, setPricing] = useState<{
    kurtPrice: number;
    kitfoPrice: number;
    tibsWotPrice: number;
    available?: boolean;
  }>({
    kurtPrice: 2500,
    kitfoPrice: 2200,
    tibsWotPrice: 1800,
    available: true
  });
  const [isLoadingPricing, setIsLoadingPricing] = useState(true);

  // Meat Selection States (By default 100% Prime Ox/Beef)
  const [selectedCut, setSelectedCut] = useState<MeatCutKey>('kitfo');
  const [kg, setKg] = useState<number>(5);

  // Delivery Option States
  const [isDelivery, setIsDelivery] = useState<boolean>(true);
  const [selectedLocation, setSelectedLocation] = useState<SelectedDeliveryLocation | null>({
    address: 'Kazanchis / UNECA Area (Kirkos Sub-City, Addis Ababa)',
    lat: 9.0175,
    lng: 38.7690
  });
  const [isLocationModalOpen, setIsLocationModalOpen] = useState(false);
  const [selectedVehicleId, setSelectedVehicleId] = useState<VehicleTypeId>('car');
  const [selectedVehicleQuote, setSelectedVehicleQuote] = useState<VehicleQuoteResult | null>(null);
  const [deliveryQuoteData, setDeliveryQuoteData] = useState<DeliveryQuoteResponse | null>(null);

  // Bank Accounts & Payment State
  const [bankAccounts, setBankAccounts] = useState<BankAccount[]>([]);
  const [selectedBankId, setSelectedBankId] = useState<string>('');
  const [copiedBankId, setCopiedBankId] = useState<string | null>(null);

  // Customer Contact Fields
  const [customerName, setCustomerName] = useState(user?.name || '');
  const [customerPhone, setCustomerPhone] = useState(user?.phone || '');
  const [customerEmail, setCustomerEmail] = useState(user?.email || '');
  const [customerNotes, setCustomerNotes] = useState('');

  // Slip File State
  const [slipFile, setSlipFile] = useState<File | null>(null);
  const [slipPreviewUrl, setSlipPreviewUrl] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Submission Status
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [completedOrderId, setCompletedOrderId] = useState<string | null>(null);

  // Load Pricing & Accounts on Open
  useEffect(() => {
    if (isOpen) {
      setIsLoadingPricing(true);
      Promise.all([api.getMeatPricing(), api.getBankAccounts()])
        .then(([meatPrices, accounts]) => {
          if (meatPrices) {
            setPricing({
              kurtPrice: Number(meatPrices.kurtPrice) || 2500,
              kitfoPrice: Number(meatPrices.kitfoPrice) || 2200,
              tibsWotPrice: Number(meatPrices.tibsWotPrice) || 1800,
              available: meatPrices.available !== false
            });
          }
          if (accounts && accounts.length > 0) {
            setBankAccounts(accounts);
            setSelectedBankId(accounts[0].id);
          }
        })
        .finally(() => setIsLoadingPricing(false));

      if (user) {
        setCustomerName(user.name || '');
        setCustomerPhone(user.phone || '');
        setCustomerEmail(user.email || '');
      }
      setCompletedOrderId(null);
      setSubmitError(null);
    }
  }, [isOpen, user]);

  if (!isOpen) return null;

  // Ethiopian Cut Definitions with Live Prices
  const cutsData = [
    {
      id: 'kurt' as MeatCutKey,
      title: isAmharic ? 'ለጥሬ (Kurt / Raw Cut)' : 'Kurt Cut (ለጥሬ)',
      amharicName: 'ጥሬ ቁርጥ',
      price: pricing.kurtPrice,
      desc: isAmharic
        ? 'ለጥሬ ቁርጥ የሚሆን እጅግ ለስላሳና ቅባት የሌለው ምርጥ የበሬ ሥጋ'
        : 'Finely selected extra-tender, sinew-free red beef for traditional raw eating',
      badge: '⭐ Prime Kurt'
    },
    {
      id: 'kitfo' as MeatCutKey,
      title: isAmharic ? 'ለክትፎ (Kitfo Cut)' : 'Kitfo Cut (ለክትፎ)',
      amharicName: 'ክትፎ ሥጋ',
      price: pricing.kitfoPrice,
      desc: isAmharic
        ? 'ደም ስርና ጅማት ሙሉ በሙሉ የተወገደለት ለስላሳ ቀይ የበሬ ሥጋ'
        : 'Extra-lean red beef trimmed free of sinew, perfect for authentic kitfo dishes',
      badge: '🔥 Most Popular'
    },
    {
      id: 'tibs_wot' as MeatCutKey,
      title: isAmharic ? 'ለጥብስ እና ወጥ (Tibs & Wot)' : 'Tibs & Wot Cut (ለጥብስና ወጥ)',
      amharicName: 'ጥብስና ወጥ',
      price: pricing.tibsWotPrice,
      desc: isAmharic
        ? 'ለጥብስና ለቤተሰብ ወጥ ድስ የሚሆን በንጽህና የተቆራረጠ ጣፋጭ የበሬ ሥጋ'
        : 'Rich, stew-sized and pan-fry portioned beef chunks for hearty stews and tibs',
      badge: '🍲 Great Value'
    }
  ];

  const currentCut = cutsData.find((c) => c.id === selectedCut) || cutsData[0];
  const meatSubtotal = Math.max(1, kg) * currentCut.price;
  const deliveryFee = isDelivery && selectedVehicleQuote ? selectedVehicleQuote.deliveryFee : 0;
  const totalAmount = meatSubtotal + deliveryFee;

  const loadItems = [
    {
      type: 'kg',
      name: `${kg} KG ${currentCut.title}`,
      quantity: 1,
      weightKg: kg
    }
  ];

  const handleCopyAccount = (accNum: string, id: string) => {
    navigator.clipboard.writeText(accNum.replace(/\s+/g, ''));
    setCopiedBankId(id);
    setTimeout(() => setCopiedBankId(null), 2000);
  };

  const handleFileChange = (file: File) => {
    if (!file.type.startsWith('image/') && file.type !== 'application/pdf') {
      setSubmitError(isAmharic ? 'እባክዎ የምስል ወይም የPDF ፋይል ያስገቡ' : 'Please upload an image file (PNG, JPG) or PDF');
      return;
    }
    setSlipFile(file);
    setSubmitError(null);
    const objectUrl = URL.createObjectURL(file);
    setSlipPreviewUrl(objectUrl);
  };

  const handleRemoveFile = (e: React.MouseEvent) => {
    e.stopPropagation();
    setSlipFile(null);
    if (slipPreviewUrl) {
      URL.revokeObjectURL(slipPreviewUrl);
      setSlipPreviewUrl(null);
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError(null);

    if (!isAuthenticated) {
      setSubmitError(
        isAmharic
          ? 'ትዕዛዝ ለማስገባት እባክዎ መለያ ይፍጠሩ ወይም ይግቡ'
          : 'Please create an account or sign in before placing an order'
      );
      openAuthModal(
        'register',
        isAmharic
          ? 'የበሬ ስጋ በኪሎግራም (KG) ለማዘዝ እባክዎ መጀመሪያ ይመዝገቡ ወይም ይግቡ።'
          : 'To complete your raw beef by KG order, please create an account or sign in first.'
      );
      return;
    }

    if (!customerName.trim()) {
      setSubmitError(isAmharic ? 'እባክዎ ሙሉ ስምዎን ያስገቡ' : 'Please provide your full name');
      return;
    }
    if (!customerPhone.trim()) {
      setSubmitError(isAmharic ? 'እባክዎ ስልክ ቁጥርዎን ያስገቡ' : 'Please provide your phone number');
      return;
    }
    if (isDelivery && !selectedLocation) {
      setSubmitError(
        isAmharic
          ? 'እባክዎ ስጋው የሚደርስበትን ትክክለኛ አድራሻ ይምረጡ'
          : 'Please select your delivery address in Addis Ababa'
      );
      return;
    }
    if (isDelivery && deliveryQuoteData && !deliveryQuoteData.isWithinRange) {
      setSubmitError(
        isAmharic
          ? 'የተመረጠው አድራሻ ከ30 ኪ.ሜ ማድረሻ ክልል ውጪ ነው። እባክዎ በአዲስ አበባ ውስጥ ቅርብ አድራሻ ይምረጡ ወይም ከእርሻው መውሰድ ይምረጡ።'
          : 'Delivery is out of range (>30 km). Please select an address within Addis Ababa or choose Farm Pickup.'
      );
      return;
    }
    if (isDelivery && (!selectedVehicleQuote || !selectedVehicleQuote.isSuitable)) {
      setSubmitError(
        isAmharic
          ? 'እባክዎ ለዚህ ጭነት ተስማሚ ተሽከርካሪ ይምረጡ'
          : 'Please select a suitable delivery vehicle for this order'
      );
      return;
    }
    if (!slipFile) {
      setSubmitError(
        isAmharic
          ? 'እባክዎ የከፈሉበትን ደረሰኝ / የቴሌብር ስክሪንሾት ይጫኑ'
          : 'Please upload your bank transfer slip or payment screenshot'
      );
      return;
    }

    const selectedBank = bankAccounts.find((b) => b.id === selectedBankId);

    setIsSubmitting(true);
    try {
      const formData = new FormData();
      formData.append('customerName', customerName.trim());
      formData.append('customerPhone', customerPhone.trim());
      if (customerEmail.trim()) formData.append('customerEmail', customerEmail.trim());

      formData.append('isDelivery', String(isDelivery));
      if (isDelivery && selectedLocation) {
        formData.append('deliveryLocation', selectedLocation.address);
        formData.append('deliveryAddress', selectedLocation.address);
        formData.append('deliveryLatitude', String(selectedLocation.lat));
        formData.append('deliveryLongitude', String(selectedLocation.lng));
        if (selectedVehicleId) formData.append('vehicleType', selectedVehicleId);
        if (selectedVehicleQuote) formData.append('deliveryFee', String(selectedVehicleQuote.deliveryFee));
      } else {
        formData.append('deliveryLocation', 'Self Pickup from Aware Farm Facility');
        formData.append('deliveryFee', '0');
      }

      // Meat Specifications
      formData.append('isMeatByKg', 'true');
      formData.append('meatCut', currentCut.title);
      formData.append('meatKg', String(kg));
      formData.append('pricePerKg', String(currentCut.price));
      formData.append('totalAmount', String(totalAmount));

      // Payment Details
      formData.append('paymentMethod', selectedBank?.bankName || 'Telebirr');
      if (selectedBankId) formData.append('bankAccountId', selectedBankId);
      formData.append('paymentSlip', slipFile);
      if (customerNotes.trim()) formData.append('customerNotes', customerNotes.trim());

      const res = await api.submitOrderWithSlip(formData);

      if (res.success && res.order) {
        setCompletedOrderId(res.order.id);
        if (onSuccess) onSuccess();
      } else {
        setSubmitError(res.error || 'Failed to place meat order. Please try again.');
      }
    } catch (err: any) {
      setSubmitError(err.message || 'Error processing order');
    } finally {
      setIsSubmitting(false);
    }
  };

  const selectedBank = bankAccounts.find((b) => b.id === selectedBankId) || bankAccounts[0];

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4">
      <div
        className={`relative w-full max-w-2xl max-h-[92vh] rounded-3xl border shadow-2xl flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200 ${
          isDark ? 'bg-[#1E140A] border-[#4A2C16] text-[#F4E8D0]' : 'bg-white border-[#E4D4BC] text-[#2A1A0D]'
        }`}
      >
        {/* Header */}
        <div
          className="p-4 sm:p-5 border-b flex items-center justify-between shrink-0"
          style={{ borderColor: isDark ? '#4A2C16' : '#E4D4BC' }}
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/15 text-amber-500 flex items-center justify-center shadow-xs">
              <Beef className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-serif font-bold text-base sm:text-lg leading-tight">
                  {isAmharic ? 'የበሬ ሥጋ በኪሎ ማዘዣ' : 'Order Prime Beef by the KG'}
                </h2>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/15 text-amber-500 border border-amber-500/25">
                  100% Prime Ox
                </span>
              </div>
              <p className="text-[11px] opacity-75 mt-0.5">
                {isAmharic
                  ? 'ከወፈሩ ሰንጋዎች በንጽህና የተዘጋጀና በዲጂታል ሚዛን የተመዘነ'
                  : 'Extracted fresh from healthy fattened cattle at Aware Farm'}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-black/10 dark:hover:bg-white/10 opacity-70 hover:opacity-100 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        {completedOrderId ? (
          /* Success Screen */
          <div className="p-6 sm:p-8 text-center space-y-4 my-auto overflow-y-auto">
            <div className="w-16 h-16 rounded-3xl bg-emerald-500/20 text-emerald-500 border border-emerald-500/30 flex items-center justify-center mx-auto shadow-sm">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <div>
              <h3 className="font-serif font-bold text-2xl text-emerald-500">
                {isAmharic ? 'ትዕዛዝዎ በተሳካ ሁኔታ ተልኳል!' : 'Meat Order Placed Successfully!'}
              </h3>
              <p className="font-mono text-xs font-bold text-[#C18A45] mt-1">
                Order ID: {completedOrderId}
              </p>
            </div>

            <div
              className={`p-4 rounded-2xl border text-xs text-left max-w-md mx-auto space-y-2 ${
                isDark ? 'bg-black/20 border-[#4A2C16]' : 'bg-black/[0.02] border-[#E4D4BC]'
              }`}
            >
              <div className="flex justify-between pb-1 border-b border-black/10 dark:border-white/10">
                <span className="opacity-70">Fulfillment:</span>
                <span className="font-bold">{isDelivery ? `Doorstep Delivery (${selectedLocation?.address || 'Addis Ababa'})` : 'Farm Pickup'}</span>
              </div>
              <div className="flex justify-between pt-1 text-sm font-extrabold text-[#C18A45]">
                <span>Total Paid:</span>
                <span className="font-mono">{formatPrice(totalAmount)}</span>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-400 max-w-md mx-auto flex items-center gap-2">
              <Sparkles className="w-4 h-4 shrink-0 text-amber-500" />
              <span>
                {isAmharic
                  ? 'የከፈሉበት ደረሰኝ ለአስተዳዳሪው ተልኳል። ወዲያውኑ ተረጋግጦ ስጋዎ ዝግጅት ይጀምራል!'
                  : 'Your payment slip was sent to the Admin for prompt verification. Preparation starts immediately!'}
              </span>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2.5 rounded-xl bg-[#C18A45] hover:bg-[#A06E35] text-white font-bold text-xs shadow transition-all cursor-pointer"
            >
              {isAmharic ? 'ዝጋ' : 'Close'}
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col flex-1 min-h-0">
            <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-5">
              {/* Account Required Alert Banner */}
              {!isAuthenticated && (
                <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-sm">
                  <div className="flex items-start sm:items-center gap-2.5">
                    <div className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-500 flex items-center justify-center shrink-0 mt-0.5 sm:mt-0">
                      <AlertCircle className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="text-xs sm:text-sm font-bold text-amber-500">
                        {isAmharic ? 'ትዕዛዝ ለማስገባት መለያ ያስፈልጋል' : 'Account Required to Order'}
                      </div>
                      <div className="text-[11px] sm:text-xs opacity-80">
                        {isAmharic
                          ? 'የስጋ ትዕዛዝዎን ለመከታተልና ደረሰኝ ለማያያዝ እባክዎ መለያ ይፍጠሩ ወይም ይግቡ።'
                          : 'To track your orders, receipts, and meat delivery status, please create an account or sign in.'}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 w-full sm:w-auto shrink-0">
                    <button
                      type="button"
                      onClick={() => openAuthModal('register', isAmharic ? 'የበሬ ስጋ በኪሎ ለማዘዝ እባክዎ መለያ ይፍጠሩ።' : 'Please create an account to order raw beef by the KG.')}
                      className="flex-1 sm:flex-initial px-3.5 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-black text-xs font-bold transition-all shadow-sm cursor-pointer whitespace-nowrap"
                    >
                      {isAmharic ? 'መለያ ፍጠር (Register)' : 'Create Account'}
                    </button>
                    <button
                      type="button"
                      onClick={() => openAuthModal('login', isAmharic ? 'የበሬ ስጋ በኪሎ ለማዘዝ እባክዎ ይግቡ።' : 'Please sign in to order raw beef by the KG.')}
                      className="flex-1 sm:flex-initial px-3 py-2 rounded-xl border border-amber-500/40 text-amber-500 hover:bg-amber-500/10 text-xs font-bold transition-all cursor-pointer whitespace-nowrap"
                    >
                      {isAmharic ? 'ግባ (Sign In)' : 'Sign In'}
                    </button>
                  </div>
                </div>
              )}

              {submitError && (
                <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{submitError}</span>
                </div>
              )}

              {/* 1. Select Beef Cut */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold uppercase opacity-80 flex items-center gap-1.5">
                    <span>1. {isAmharic ? 'የስጋውን አቆራረጥ ይምረጡ' : 'Select Ox Beef Cut'}</span>
                  </label>
                  <span className="text-[10.5px] opacity-60 font-mono">
                    {isLoadingPricing ? 'Loading prices...' : 'Live Certified Prices'}
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                  {cutsData.map((cut) => {
                    const isSelected = selectedCut === cut.id;
                    return (
                      <button
                        key={cut.id}
                        type="button"
                        onClick={() => setSelectedCut(cut.id)}
                        className={`p-3 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                          isSelected
                            ? 'bg-amber-500/15 border-amber-500 text-amber-400 shadow-xs'
                            : isDark
                            ? 'bg-black/20 border-[#4A2C16] hover:border-amber-500/50'
                            : 'bg-[#FAF7F0] border-[#E4D4BC] hover:border-amber-500/50'
                        }`}
                      >
                        <div>
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-black/20 text-amber-500">
                              {cut.badge}
                            </span>
                            {isSelected && <Check className="w-3.5 h-3.5 text-amber-500" />}
                          </div>
                          <div className="font-serif font-bold text-xs sm:text-sm">{cut.title}</div>
                          <p className="text-[10.5px] opacity-75 mt-1 line-clamp-2 leading-relaxed">
                            {cut.desc}
                          </p>
                        </div>
                        <div className="mt-2.5 pt-2 border-t border-black/10 dark:border-white/10 flex items-baseline justify-between">
                          <span className="text-[10px] opacity-60">Price per KG:</span>
                          <span className="font-mono font-bold text-xs text-[#C18A45]">
                            {formatPrice(cut.price)}
                          </span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* 2. Choose Kilogram Quantity */}
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase opacity-80 flex items-center gap-1.5">
                  <Scale className="w-3.5 h-3.5 text-amber-500" />
                  <span>2. {isAmharic ? 'የኪሎ ግራም መጠን (KG)' : 'Quantity in Kilograms (KG)'}</span>
                </label>

                <div className="flex flex-col sm:flex-row items-center gap-3">
                  {/* Stepper Input */}
                  <div className="flex items-center rounded-2xl border border-black/10 dark:border-white/10 p-1 w-full sm:w-auto">
                    <button
                      type="button"
                      onClick={() => setKg((prev) => Math.max(1, prev - 1))}
                      className="w-9 h-9 rounded-xl flex items-center justify-center font-bold text-base hover:bg-black/10 dark:hover:bg-white/10 transition-colors cursor-pointer"
                    >
                      -
                    </button>
                    <input
                      type="number"
                      min="1"
                      value={kg}
                      onChange={(e) => setKg(Math.max(1, Number(e.target.value) || 1))}
                      className="w-16 text-center font-mono font-bold text-base bg-transparent focus:outline-none"
                    />
                    <button
                      type="button"
                      onClick={() => setKg((prev) => prev + 1)}
                      className="w-9 h-9 rounded-xl flex items-center justify-center font-bold text-base hover:bg-black/10 dark:hover:bg-white/10 transition-colors cursor-pointer"
                    >
                      +
                    </button>
                    <span className="text-xs font-bold opacity-60 pr-2">KG</span>
                  </div>

                  {/* Preset Chips */}
                  <div className="flex items-center gap-1.5 flex-wrap">
                    {[2, 5, 10, 15, 20, 50].map((preset) => (
                      <button
                        key={preset}
                        type="button"
                        onClick={() => setKg(preset)}
                        className={`px-2.5 py-1 rounded-xl text-xs font-mono font-bold border transition-colors cursor-pointer ${
                          kg === preset
                            ? 'bg-amber-500 text-black border-amber-500'
                            : 'border-black/10 dark:border-white/10 hover:bg-black/5 dark:hover:bg-white/5 opacity-80'
                        }`}
                      >
                        {preset} KG
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* 3. Delivery Option */}
              <div className="space-y-3">
                <label className="text-xs font-bold uppercase opacity-80 flex items-center gap-1.5">
                  <Truck className="w-3.5 h-3.5 text-amber-500" />
                  <span>3. {isAmharic ? 'የማድረሻ ምርጫ' : 'Delivery Preference'}</span>
                </label>

                <div className="grid grid-cols-2 gap-2.5">
                  <button
                    type="button"
                    onClick={() => setIsDelivery(true)}
                    className={`p-3 rounded-2xl border text-left transition-all cursor-pointer flex items-center gap-3 ${
                      isDelivery
                        ? 'bg-amber-500/15 border-amber-500 text-amber-400'
                        : isDark
                        ? 'bg-black/20 border-[#4A2C16]'
                        : 'bg-[#FAF7F0] border-[#E4D4BC]'
                    }`}
                  >
                    <Truck className="w-5 h-5 shrink-0 text-amber-500" />
                    <div>
                      <div className="text-xs font-bold">{isAmharic ? 'በአድራሻዬ ይድረስ' : 'Doorstep Delivery'}</div>
                      <div className="text-[10px] opacity-70">{isAmharic ? 'ወደ ቤትዎ ወይም ሬስቶራንትዎ' : 'Direct to your door / restaurant'}</div>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setIsDelivery(false)}
                    className={`p-3 rounded-2xl border text-left transition-all cursor-pointer flex items-center gap-3 ${
                      !isDelivery
                        ? 'bg-amber-500/15 border-amber-500 text-amber-400'
                        : isDark
                        ? 'bg-black/20 border-[#4A2C16]'
                        : 'bg-[#FAF7F0] border-[#E4D4BC]'
                    }`}
                  >
                    <MapPin className="w-5 h-5 shrink-0 text-amber-500" />
                    <div>
                      <div className="text-xs font-bold">{isAmharic ? 'ከእርሻው መውሰድ (Pickup)' : 'Farm Pickup'}</div>
                      <div className="text-[10px] opacity-70">Aware Farm Facility (Free)</div>
                    </div>
                  </button>
                </div>

                {isDelivery && (
                  <DeliveryVehicleSelector
                    loadItems={loadItems}
                    selectedLocation={selectedLocation}
                    onLocationClick={() => setIsLocationModalOpen(true)}
                    selectedVehicleId={selectedVehicleId}
                    onSelectVehicle={(vehicleId, quote) => {
                      setSelectedVehicleId(vehicleId);
                      setSelectedVehicleQuote(quote);
                    }}
                    onQuoteChange={(quote) => setDeliveryQuoteData(quote)}
                  />
                )}
              </div>

              {/* 4. Live Price Calculation Summary Banner */}
              <div
                className={`p-4 rounded-2xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                  isDark ? 'bg-amber-500/10 border-amber-500/30' : 'bg-amber-50/80 border-amber-200'
                }`}
              >
                <div className="space-y-0.5 text-xs">
                  <div className="font-bold flex items-center gap-1.5 text-[#C18A45]">
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>
                      {currentCut.title} — {kg} KG
                    </span>
                  </div>
                  <div className="text-[11px] opacity-75">
                    {kg} KG × {formatPrice(currentCut.price)} = {formatPrice(meatSubtotal)}
                    {isDelivery && selectedVehicleQuote
                      ? ` + Delivery (${selectedVehicleQuote.name}: ${formatPrice(selectedVehicleQuote.deliveryFee)})`
                      : !isDelivery
                      ? ' • Farm Pickup (Free)'
                      : ''}
                  </div>
                </div>

                <div className="text-right sm:border-l sm:pl-4 border-amber-500/20">
                  <div className="text-[10px] uppercase font-bold opacity-60">Total Payable</div>
                  <div className="text-lg sm:text-xl font-mono font-black text-[#C18A45]">
                    {formatPrice(totalAmount)}
                  </div>
                </div>
              </div>

              {/* 5. Payment Accounts & Slip Upload */}
              <div className="space-y-3 pt-1 border-t border-black/10 dark:border-white/10">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold uppercase opacity-80 flex items-center gap-1.5">
                    <CreditCard className="w-3.5 h-3.5 text-amber-500" />
                    <span>4. {isAmharic ? 'የክፍያ ዘዴና የሂሳብ ቁጥር' : 'Payment Account'}</span>
                  </label>
                  <span className="text-[10px] opacity-60 font-mono">1-Click Copy</span>
                </div>

                {/* Bank Account Selection */}
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {bankAccounts.map((b) => {
                    const isSelected = selectedBankId === b.id;
                    return (
                      <button
                        key={b.id}
                        type="button"
                        onClick={() => setSelectedBankId(b.id)}
                        className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer text-xs ${
                          isSelected
                            ? 'bg-amber-500/15 border-amber-500 font-bold'
                            : isDark
                            ? 'bg-black/20 border-[#4A2C16]'
                            : 'bg-[#FAF7F0] border-[#E4D4BC]'
                        }`}
                      >
                        <div className="font-semibold truncate">{b.bankName}</div>
                        <div className="font-mono text-[11px] opacity-70 truncate mt-0.5">{b.accountNumber}</div>
                      </button>
                    );
                  })}
                </div>

                {/* Active Bank Details Card */}
                {selectedBank && (
                  <div
                    className={`p-3.5 rounded-2xl border flex items-center justify-between gap-3 text-xs ${
                      isDark ? 'bg-black/30 border-[#4A2C16]' : 'bg-[#FAF7F0] border-[#E4D4BC]'
                    }`}
                  >
                    <div>
                      <div className="text-[11px] opacity-70">{selectedBank.bankName} — {selectedBank.accountName}</div>
                      <div className="font-mono font-bold text-sm text-[#C18A45] tracking-wider mt-0.5">
                        {selectedBank.accountNumber}
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleCopyAccount(selectedBank.accountNumber, selectedBank.id)}
                      className="px-3 py-1.5 rounded-xl bg-amber-500/15 hover:bg-amber-500/25 text-[#C18A45] font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
                    >
                      {copiedBankId === selectedBank.id ? (
                        <>
                          <Check className="w-3.5 h-3.5" />
                          <span>Copied!</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5" />
                          <span>Copy</span>
                        </>
                      )}
                    </button>
                  </div>
                )}

                {/* Slip Upload Box */}
                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold uppercase opacity-80">
                    {isAmharic ? 'የክፍያ ደረሰኝ / ስሊፕ ምስል ጫን *' : 'Upload Payment Slip / Screenshot *'}
                  </label>

                  <input
                    type="file"
                    ref={fileInputRef}
                    accept="image/*,application/pdf"
                    className="hidden"
                    onChange={(e) => {
                      if (e.target.files && e.target.files[0]) {
                        handleFileChange(e.target.files[0]);
                      }
                    }}
                  />

                  {slipPreviewUrl ? (
                    <div
                      className={`p-3 rounded-2xl border flex items-center justify-between gap-3 ${
                        isDark ? 'bg-black/20 border-[#4A2C16]' : 'bg-[#FAF7F0] border-[#E4D4BC]'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <img
                          src={slipPreviewUrl}
                          alt="Slip Preview"
                          className="w-12 h-12 rounded-xl object-cover border"
                        />
                        <div className="text-xs">
                          <div className="font-bold text-emerald-500">✓ Transfer Slip Attached</div>
                          <div className="text-[10px] opacity-60 truncate max-w-[200px]">{slipFile?.name}</div>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={handleRemoveFile}
                        className="text-xs text-red-400 hover:underline font-semibold cursor-pointer"
                      >
                        Remove
                      </button>
                    </div>
                  ) : (
                    <div
                      onDragOver={(e) => {
                        e.preventDefault();
                        setIsDragging(true);
                      }}
                      onDragLeave={() => setIsDragging(false)}
                      onDrop={(e) => {
                        e.preventDefault();
                        setIsDragging(false);
                        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
                          handleFileChange(e.dataTransfer.files[0]);
                        }
                      }}
                      onClick={() => fileInputRef.current?.click()}
                      className={`cursor-pointer rounded-2xl border-2 border-dashed p-4 text-center transition-all ${
                        isDragging
                          ? 'border-amber-500 bg-amber-500/10'
                          : isDark
                          ? 'border-[#4A2C16] hover:border-amber-500/60 bg-black/10'
                          : 'border-[#E4D4BC] hover:border-amber-500/60 bg-[#FAF7F0]'
                      }`}
                    >
                      <UploadCloud className="w-5 h-5 mx-auto text-amber-500 mb-1" />
                      <p className="text-xs font-bold">
                        {isAmharic
                          ? 'ደረሰኙን እዚህ ይጎትቱ ወይም ፋይል ለመምረጥ ይጫኑ'
                          : 'Click to upload payment screenshot or drag & drop'}
                      </p>
                      <p className="text-[10px] opacity-60 mt-0.5">Supports PNG, JPG, WEBP, PDF</p>
                    </div>
                  )}
                </div>

                {/* Customer Contact Details */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                  <div>
                    <label className="block text-[11px] font-bold uppercase mb-1 opacity-80">Full Name *</label>
                    <input
                      type="text"
                      required
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                      placeholder="e.g. Abebe Bekele"
                      className="w-full px-3 py-2 rounded-xl text-xs border bg-transparent focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold uppercase mb-1 opacity-80">Phone Number *</label>
                    <input
                      type="tel"
                      required
                      value={customerPhone}
                      onChange={(e) => setCustomerPhone(e.target.value)}
                      placeholder="e.g. 0911223344"
                      className="w-full px-3 py-2 rounded-xl text-xs border bg-transparent focus:outline-none font-mono"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-bold uppercase mb-1 opacity-80">
                    Special Cut / Packaging Notes (Optional)
                  </label>
                  <input
                    type="text"
                    value={customerNotes}
                    onChange={(e) => setCustomerNotes(e.target.value)}
                    placeholder="e.g. Please pack in two 2.5 KG separate food-grade bags"
                    className="w-full px-3 py-2 rounded-xl text-xs border bg-transparent focus:outline-none"
                  />
                </div>
              </div>
            </div>

            {/* Sticky Modal Footer */}
            <div
              className="p-4 sm:p-5 border-t flex flex-col sm:flex-row items-center justify-between gap-3 shrink-0"
              style={{ borderColor: isDark ? '#4A2C16' : '#E4D4BC' }}
            >
              <div className="text-xs">
                <span className="opacity-70">Total: </span>
                <span className="font-mono font-black text-base text-[#C18A45]">
                  {formatPrice(totalAmount)}
                </span>
                <span className="opacity-70 text-[11px] ml-1">({kg} KG {currentCut.amharicName})</span>
              </div>

              <div className="flex items-center gap-2.5 w-full sm:w-auto">
                <button
                  type="button"
                  onClick={onClose}
                  className="w-1/3 sm:w-auto px-4 py-2.5 rounded-xl border font-semibold text-xs opacity-75 hover:opacity-100 transition-opacity cursor-pointer"
                >
                  Cancel
                </button>
                {!isAuthenticated ? (
                  <button
                    type="button"
                    onClick={() => openAuthModal('register', isAmharic ? 'የበሬ ስጋ በኪሎ ለማዘዝ እባክዎ መለያ ይፍጠሩ።' : 'Please create an account to order raw beef by the KG.')}
                    className="flex-1 sm:flex-none px-6 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-black font-extrabold text-xs shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <Check className="w-4 h-4" />
                    <span>{isAmharic ? 'መለያ ፈጥረው እዘዝ' : 'Create Account to Order'}</span>
                  </button>
                ) : (
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="flex-1 sm:flex-none px-6 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 disabled:opacity-50 text-black font-extrabold text-xs shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
                  >
                    {isSubmitting ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin" />
                        <span>Submitting Order...</span>
                      </>
                    ) : (
                      <>
                        <Check className="w-4 h-4" />
                        <span>
                          {isAmharic ? `በ${formatPrice(totalAmount)} እዘዝ` : `Place Order (${formatPrice(totalAmount)})`}
                        </span>
                      </>
                    )}
                  </button>
                )}
              </div>
            </div>
          </form>
        )}
      </div>

      <DeliveryLocationModal
        isOpen={isLocationModalOpen}
        onClose={() => setIsLocationModalOpen(false)}
        onSelectLocation={(loc) => setSelectedLocation(loc)}
        selectedLocation={selectedLocation}
      />
    </div>
  );
};
