import React, { useState, useEffect, useRef, useMemo } from 'react';
import { PackageCatalogItem, PreMadePackage } from '../../types/package';
import { useUserAuth } from '../../context/UserAuthContext';
import { useTheme } from '../../context/ThemeContext';
import { useLanguage } from '../../context/LanguageContext';
import { api, BankAccount } from '../../services/api';
import { formatPrice, getPackageTitle, cleanEnglishText } from '../../utils/formatters';
import { sanitizeClientError } from '../../utils/errorSanitizer';
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
  Sparkles,
  MapPin,
  ArrowLeft,
  FileText,
  BadgeCheck
} from 'lucide-react';
import { DeliveryLocationModal } from '../delivery/DeliveryLocationModal';
import { DeliveryVehicleSelector } from '../delivery/DeliveryVehicleSelector';
import {
  SelectedDeliveryLocation,
  VehicleQuoteResult,
  VehicleTypeId,
  DeliveryQuoteResponse
} from '../../types/delivery';

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
  const { user, isAuthenticated, openAuthModal } = useUserAuth();
  const { theme } = useTheme();
  const { isAmharic } = useLanguage();
  const isDark = theme === 'design7';

  // Payment Mode: 'deposit' (50%) or 'full' (100%)
  const [paymentMode, setPaymentMode] = useState<'deposit' | 'full'>('deposit');

  // Bank accounts from backend
  const [bankAccounts, setBankAccounts] = useState<BankAccount[]>([]);
  const [selectedBankId, setSelectedBankId] = useState<string>('');
  const [copiedBankId, setCopiedBankId] = useState<string | null>(null);

  // Delivery Option States
  const [isDelivery, setIsDelivery] = useState<boolean>(true);
  const [selectedLocation, setSelectedLocation] = useState<SelectedDeliveryLocation | null>(null);
  const [isLocationModalOpen, setIsLocationModalOpen] = useState(false);
  const [selectedVehicleId, setSelectedVehicleId] = useState<VehicleTypeId>('car');
  const [selectedVehicleQuote, setSelectedVehicleQuote] = useState<VehicleQuoteResult | null>(null);
  const [deliveryQuoteData, setDeliveryQuoteData] = useState<DeliveryQuoteResponse | null>(null);

  // Form Fields
  const [customerName, setCustomerName] = useState(user?.name || '');
  const [customerPhone, setCustomerPhone] = useState(user?.phone || '');
  const [customerEmail, setCustomerEmail] = useState(user?.email || '');
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

  // Lock body scroll when full-screen ordering modal is open
  useEffect(() => {
    if (isOpen) {
      const originalOverflow = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = originalOverflow;
      };
    }
  }, [isOpen]);

  // Close on Escape key (if nested location modal is not open)
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !isLocationModalOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, isLocationModalOpen, onClose]);

  // Derive package name & total price
  const packageName = packageItem
    ? getPackageTitle(packageItem, isAmharic)
    : customPackage
      ? (isAmharic ? customPackage.name : cleanEnglishText(customPackage.name))
      : (isAmharic ? 'የበዓል ጥቅል' : 'Celebration Package');

  // Check if eligible for Free Doorstep Delivery:
  // Custom packages with >= 3 categories or Pre-Made celebration bundles
  const distinctCategoriesCount = useMemo(() => {
    if (customPackage?.categoriesCount) return customPackage.categoriesCount;
    if (packageItem?.categoryCount) return packageItem.categoryCount;
    if (customPackage?.items) return new Set(customPackage.items.map(i => i.category)).size;
    return 3;
  }, [customPackage, packageItem]);

  const isFreeDeliveryEligible = Boolean(
    (customPackage && distinctCategoriesCount >= 3) ||
    (packageItem && (packageItem.categoryCount ?? 3) >= 3) ||
    packageItem != null
  );

  const basePackagePrice = packageItem?.packagePrice || customPackage?.totalPrice || 0;
  const deliveryFee = paymentMode === 'full' && isDelivery && !isFreeDeliveryEligible && selectedVehicleQuote ? selectedVehicleQuote.deliveryFee : 0;
  const grandTotal = basePackagePrice + deliveryFee;
  const depositAmount = Math.round(basePackagePrice * 0.5);
  const remainingAmount = basePackagePrice - depositAmount;
  const currentPayAmount = paymentMode === 'deposit' ? depositAmount : grandTotal;

  // Derive load items from package with precise item classifier
  const rawItems = packageItem?.items || customPackage?.items || [];
  const loadItems: Array<{ type: string; name?: string; quantity: number; weightKg?: number }> = useMemo(() => {
    if (!rawItems || rawItems.length === 0) {
      return [{ type: 'package', name: packageName, quantity: 1, weightKg: 25 }];
    }

    return rawItems.map((item) => {
      const nameLower = ((item.name || '') + ' ' + (item.id || '') + ' ' + (item.description || '')).toLowerCase();

      // 1. Cattle / Ox / Bull
      if (
        nameLower.includes('ox') ||
        nameLower.includes('bull') ||
        nameLower.includes('cow') ||
        nameLower.includes('steer') ||
        nameLower.includes('cattle') ||
        nameLower.includes('በሬ') ||
        nameLower.includes('ኮርማ') ||
        nameLower.includes('ሰንጋ')
      ) {
        return { type: 'cattle', name: item.name, quantity: 1, weightKg: 350 };
      }

      // 2. Sheep / Ram
      if (
        nameLower.includes('sheep') ||
        nameLower.includes('ram') ||
        nameLower.includes('lamb') ||
        nameLower.includes('በግ') ||
        nameLower.includes('ጠቦት') ||
        nameLower.includes('ደንዳና')
      ) {
        return { type: 'sheep', name: item.name, quantity: 1, weightKg: 35 };
      }

      // 3. Goat
      if (
        nameLower.includes('goat') ||
        nameLower.includes('ፍየል') ||
        nameLower.includes('ሙክት')
      ) {
        return { type: 'goat', name: item.name, quantity: 1, weightKg: 30 };
      }

      // 4. Chicken / Rooster / Poultry
      if (
        nameLower.includes('rooster') ||
        nameLower.includes('hen') ||
        nameLower.includes('chicken') ||
        nameLower.includes('poultry') ||
        nameLower.includes('ዶሮ')
      ) {
        return { type: 'chicken', name: item.name, quantity: 1, weightKg: 2 };
      }

      // 5. Raw Meat (10 KG / 5 KG / General Meat)
      if (nameLower.includes('10kg') || nameLower.includes('10 kg') || nameLower.includes('10 ኪ')) {
        return { type: 'raw_meat_kg', name: item.name, quantity: 10, weightKg: 10 };
      }
      if (
        nameLower.includes('5kg') ||
        nameLower.includes('5 kg') ||
        nameLower.includes('5 ኪ') ||
        nameLower.includes('meat') ||
        nameLower.includes('beef') ||
        nameLower.includes('ሥጋ') ||
        nameLower.includes('ስጋ')
      ) {
        return { type: 'raw_meat_kg', name: item.name, quantity: 5, weightKg: 5 };
      }

      // 6. Wine / Whisky / Alcohol
      if (
        item.category === 'wine' ||
        nameLower.includes('whisky') ||
        nameLower.includes('whiskey') ||
        nameLower.includes('wine') ||
        nameLower.includes('tej') ||
        nameLower.includes('ዊስኪ') ||
        nameLower.includes('ወይን')
      ) {
        return { type: 'wine', name: item.name, quantity: 1, weightKg: 1.5 };
      }

      // 7. Eggs
      if (item.category === 'eggs' || nameLower.includes('egg') || nameLower.includes('እንቁላል')) {
        return { type: 'eggs', name: item.name, quantity: 1, weightKg: 2.0 };
      }

      // 8. Flowers
      if (item.category === 'flowers' || nameLower.includes('flower') || nameLower.includes('አበባ')) {
        return { type: 'flowers', name: item.name, quantity: 1, weightKg: 0.8 };
      }

      return {
        type: item.category || 'other',
        name: item.name,
        quantity: 1,
        weightKg: 2
      };
    });
  }, [rawItems, packageName]);

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

    if (!isAuthenticated) {
      setSubmitError(
        isAmharic
          ? 'ትዕዛዝ ለማስገባት እባክዎ መለያ ይፍጠሩ ወይም ይግቡ'
          : 'Please create an account or sign in before placing an order'
      );
      openAuthModal(
        'register',
        isAmharic
          ? `የበዓል ጥቅል "${packageName}" ለማዘዝ እባክዎ መጀመሪያ ይመዝገቡ ወይም ይግቡ።`
          : `To complete your order for "${packageName}", please create an account or sign in first.`
      );
      return;
    }

    if (!customerName.trim() || !customerPhone.trim()) {
      setSubmitError('Please fill in your name and phone number');
      return;
    }
    if (paymentMode === 'full' && isDelivery && !selectedLocation) {
      setSubmitError(
        isAmharic
          ? 'እባክዎ የማድረሻ አድራሻ ይምረጡ'
          : 'Please select your delivery address in Addis Ababa'
      );
      return;
    }
    if (paymentMode === 'full' && isDelivery && deliveryQuoteData && !deliveryQuoteData.isWithinRange) {
      setSubmitError(
        isAmharic
          ? 'የተመረጠው አድራሻ ከ30 ኪ.ሜ ማድረሻ ክልል ውጪ ነው። እባክዎ በአዲስ አበባ ውስጥ ቅርብ አድራሻ ይምረጡ ወይም ከእርሻው መውሰድ ይምረጡ።'
          : 'Delivery is out of range (>30 km). Please select an address within Addis Ababa or choose Farm Pickup.'
      );
      return;
    }
    if (paymentMode === 'full' && isDelivery && (!selectedVehicleQuote || !selectedVehicleQuote.isSuitable)) {
      setSubmitError(
        isAmharic
          ? 'እባክዎ ለዚህ ጭነት ተስማሚ ተሽከርካሪ ይምረጡ'
          : 'Please select a suitable delivery vehicle for this package order'
      );
      return;
    }
    if (!slipFile) {
      setSubmitError('Please attach your transfer receipt screenshot/slip');
      return;
    }

    setIsSubmitting(true);
    setSubmitError(null);

    try {
      const formData = new FormData();
      formData.append('customerName', customerName.trim());
      formData.append('customerPhone', customerPhone.trim());
      if (customerEmail.trim()) formData.append('customerEmail', customerEmail.trim());

      // Delivery attributes: only functional when covering full cost!
      const effectiveDelivery = paymentMode === 'full' && isDelivery;
      formData.append('isDelivery', String(effectiveDelivery));
      formData.append('isFreeDelivery', String(effectiveDelivery && isFreeDeliveryEligible));
      if (effectiveDelivery && selectedLocation) {
        formData.append('deliveryLocation', selectedLocation.address);
        formData.append('deliveryAddress', selectedLocation.address);
        formData.append('deliveryLatitude', String(selectedLocation.lat));
        formData.append('deliveryLongitude', String(selectedLocation.lng));
        if (selectedVehicleId) formData.append('vehicleType', selectedVehicleId);
        formData.append('deliveryFee', isFreeDeliveryEligible ? '0' : String(selectedVehicleQuote?.deliveryFee || 0));
      } else if (paymentMode === 'deposit') {
        formData.append('deliveryLocation', 'Reservation - Delivery arranged on final payment');
        formData.append('deliveryFee', '0');
      } else {
        formData.append('deliveryLocation', 'Self Pickup from Arat Kilo Farm Facility');
        formData.append('deliveryFee', '0');
      }

      if (customerNotes.trim()) formData.append('notes', customerNotes.trim());
      if (transactionRef.trim()) formData.append('transactionReference', transactionRef.trim());
      if (selectedBank) formData.append('paymentMethod', selectedBank.bankName);

      // Package specific attributes
      formData.append('isPackage', 'true');
      formData.append('packageName', packageName);
      formData.append('totalAmount', (paymentMode === 'deposit' ? basePackagePrice : grandTotal).toString());
      formData.append('isReservation', paymentMode === 'deposit' ? 'true' : 'false');
      formData.append('depositAmount', depositAmount.toString());
      formData.append('remainingAmount', remainingAmount.toString());

      const packageDetailsJson = JSON.stringify({
        preMadeId: packageItem?.id,
        items: packageItem?.items || customPackage?.items || [],
        categoriesCount: distinctCategoriesCount || 3,
        vehicleType: selectedVehicleId,
        deliveryFee: isDelivery && !isFreeDeliveryEligible && selectedVehicleQuote ? selectedVehicleQuote.deliveryFee : 0,
        isFreeDelivery: isFreeDeliveryEligible
      });
      formData.append('packageDetails', packageDetailsJson);

      formData.append('paymentSlip', slipFile);

      const res = await api.submitOrderWithSlip(formData);

      if (res.success && res.order) {
        setIsSuccess(true);
        setCreatedOrderId(res.order.id);
        if (onSuccess) onSuccess();
      } else {
        const friendlyError = sanitizeClientError(
          res.error,
          isAmharic ? 'ትዕዛዝ ማስተናገድ አልተቻለም። እባክዎ እንደገና ይሞክሩ።' : 'Failed to submit order. Please check your details and try again.'
        );
        setSubmitError(friendlyError);
      }
    } catch (err: any) {
      console.error('Package order error:', err);
      const friendlyError = sanitizeClientError(
        err,
        isAmharic ? 'የትዕዛዝ ግንኙነት ስህተት አጋጥሟል። እባክዎ እንደገና ይሞክሩ።' : 'Network error while placing package order. Please try again.'
      );
      setSubmitError(friendlyError);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 w-screen h-screen h-[100dvh] bg-black/90 backdrop-blur-md flex flex-col overflow-hidden animate-in fade-in duration-200">
      <div
        className={`relative w-full h-full flex flex-col overflow-hidden ${
          isDark
            ? 'bg-[#150D06] text-[#F4E8D0]'
            : 'bg-[#FBF9F5] text-[#241A12]'
        }`}
      >
        {/* Full-Width Top Header Bar */}
        <header
          className={`px-4 sm:px-8 py-3.5 sm:py-4 border-b shrink-0 flex items-center justify-between gap-4 z-20 shadow-xs backdrop-blur-md ${
            isDark
              ? 'bg-[#1C1208]/95 border-[#4A2C16]'
              : 'bg-[#FAF7F0]/95 border-[#E4D4BC]'
          }`}
        >
          <div className="flex items-center gap-3 min-w-0">
            <button
              type="button"
              onClick={onClose}
              className={`p-2 sm:p-2.5 rounded-xl border transition-all flex items-center gap-1.5 cursor-pointer ${
                isDark
                  ? 'border-white/10 hover:border-amber-500/50 hover:bg-white/5 text-neutral-300'
                  : 'border-neutral-200 hover:border-amber-500/50 hover:bg-black/5 text-neutral-700'
              }`}
              title={isAmharic ? 'ተመለስ / ዝጋ' : 'Back / Close'}
            >
              <ArrowLeft className="w-5 h-5 text-amber-500" />
              <span className="text-xs font-semibold hidden sm:inline">{isAmharic ? 'ተመለስ' : 'Back'}</span>
            </button>

            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-2xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-500 shrink-0 shadow-inner">
              <Gift className="w-5 h-5" />
            </div>

            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h1 className="font-serif font-bold text-base sm:text-xl leading-tight truncate">
                  {packageName}
                </h1>
                <span className="hidden md:inline-flex text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-md bg-amber-500/15 text-amber-500 border border-amber-500/30 shrink-0">
                  {isAmharic ? 'የበዓል ማዘዣ ገጽ' : 'Full Screen Checkout'}
                </span>
              </div>
              <div className="flex items-center gap-2 text-xs opacity-75 truncate">
                <span className="flex items-center gap-1 text-amber-500 font-semibold truncate">
                  <Truck className="w-3.5 h-3.5 shrink-0" />{' '}
                  {isFreeDeliveryEligible
                    ? isAmharic ? 'ነፃ ማድረሻ ተካቷል' : 'Free Delivery Included'
                    : isAmharic ? 'የበር ማድረሻ' : 'Doorstep Delivery'}
                </span>
                <span>•</span>
                <span className="truncate">{isAmharic ? 'የተሟላ የበዓል ጥቅል' : 'All-in-one celebration bundle'}</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <div className="hidden md:flex flex-col text-right pr-2">
              <span className="text-[10px] uppercase tracking-wider opacity-60 font-semibold">
                {paymentMode === 'deposit'
                  ? isAmharic ? 'አሁን የሚከፈል (50%)' : 'Payable Now (50%)'
                  : isAmharic ? 'ጠቅላላ ክፍያ (100%)' : 'Total Payable (100%)'}
              </span>
              <span className="font-mono font-bold text-base sm:text-lg text-amber-500">
                {formatPrice(currentPayAmount)}
              </span>
            </div>

            <button
              type="button"
              onClick={onClose}
              className={`p-2 sm:p-2.5 rounded-xl border transition-all flex items-center gap-1.5 cursor-pointer ${
                isDark
                  ? 'border-white/10 hover:border-red-500/50 hover:bg-red-500/10 text-neutral-300 hover:text-red-400'
                  : 'border-neutral-200 hover:border-red-500/50 hover:bg-red-500/10 text-neutral-700 hover:text-red-500'
              }`}
              title="Close (Esc)"
            >
              <X className="w-5 h-5" />
              <kbd className="hidden md:inline-block text-[10px] font-mono opacity-60 bg-black/10 dark:bg-white/10 px-1.5 py-0.5 rounded">
                Esc
              </kbd>
            </button>
          </div>
        </header>

        {/* Scrollable Full-Screen Content Area */}
        <main className="flex-1 overflow-y-auto w-full">
          {isSuccess ? (
            <div className="max-w-2xl mx-auto px-4 py-12 sm:py-20 text-center space-y-6 animate-in zoom-in-95 duration-200">
              <div className="w-20 h-20 rounded-full bg-emerald-500/15 border-2 border-emerald-500/40 text-emerald-500 flex items-center justify-center mx-auto shadow-lg shadow-emerald-500/10">
                <CheckCircle2 className="w-12 h-12" />
              </div>
              <div className="space-y-2">
                <h2 className="font-serif font-bold text-2xl sm:text-3xl text-emerald-500">
                  {paymentMode === 'deposit'
                    ? (isAmharic ? 'የ50% ቅድመ-ክፍያ ደረሰኝ ገብቷል!' : 'Reservation Deposit Submitted!')
                    : (isAmharic ? 'የጥቅል ትዕዛዝዎ ተልኳል!' : 'Package Order Placed!')}
                </h2>
                <p className="text-xs sm:text-sm opacity-80 max-w-lg mx-auto leading-relaxed">
                  {isAmharic ? (
                    <>የማዘዣ ቁጥር: <strong className="font-mono text-amber-500 text-base">{createdOrderId}</strong>። የክፍያ ደረሰኝዎ ደርሶናል፣ አስተዳዳሪው በአጭር ጊዜ ውስጥ ያረጋግጣል። ሁኔታውን በ <strong>"የተያዙ ትዕዛዞቼ"</strong> ውስጥ መከታተል ይችላሉ።</>
                  ) : (
                    <>Order ID: <strong className="font-mono text-amber-500 text-base">{createdOrderId}</strong>. Our admin team has received your payment slip and will verify it shortly. You can track this in <strong>"My Reservations"</strong>.</>
                  )}
                </p>
              </div>

              {/* Summary Pill Card */}
              <div
                className={`p-5 rounded-2xl border text-left space-y-3 max-w-lg mx-auto ${
                  isDark ? 'bg-white/5 border-white/10' : 'bg-white border-neutral-200 shadow-sm'
                }`}
              >
                <div className="flex justify-between items-center text-xs pb-2.5 border-b border-black/5 dark:border-white/5">
                  <span className="opacity-70">{isAmharic ? 'ጥቅል:' : 'Package:'}</span>
                  <span className="font-bold text-amber-500">{packageName}</span>
                </div>
                <div className="flex justify-between items-center text-xs pb-2.5 border-b border-black/5 dark:border-white/5">
                  <span className="opacity-70">{isAmharic ? 'የተከፈለው መጠን:' : 'Amount Paid:'}</span>
                  <span className="font-mono font-bold text-amber-500">{formatPrice(currentPayAmount)} ({paymentMode === 'deposit' ? '50% Deposit' : 'Full Payment'})</span>
                </div>
                {paymentMode === 'deposit' && (
                  <div className="flex justify-between items-center text-xs pb-2.5 border-b border-black/5 dark:border-white/5">
                    <span className="opacity-70">{isAmharic ? 'ቀሪ ክፍያ (ሲረከቡ):' : 'Remaining Balance:'}</span>
                    <span className="font-mono font-semibold">{formatPrice(remainingAmount)}</span>
                  </div>
                )}
                {paymentMode === 'full' ? (
                  <div className="flex justify-between items-center text-xs">
                    <span className="opacity-70">{isAmharic ? 'የማድረሻ ሁኔታ:' : 'Delivery Preference:'}</span>
                    <span className="font-medium">{isDelivery ? (isAmharic ? 'የበር ማድረሻ' : 'Doorstep Delivery') : (isAmharic ? 'ከእርሻው መውሰድ' : 'Farm Pickup')}</span>
                  </div>
                ) : (
                  <div className="flex justify-between items-center text-xs text-amber-500">
                    <span className="opacity-70">{isAmharic ? 'የማድረሻ ሁኔታ:' : 'Delivery Preference:'}</span>
                    <span className="font-medium">{isAmharic ? 'ቀሪ ክፍያ ሲፈጸም የሚመረጥ' : 'Arranged upon final payment'}</span>
                  </div>
                )}
              </div>

              <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-3">
                <button
                  onClick={onClose}
                  className="w-full sm:w-auto px-8 py-3.5 rounded-2xl bg-amber-500 hover:bg-amber-600 text-black font-bold transition-all shadow-lg shadow-amber-500/25 cursor-pointer text-sm"
                >
                  {isAmharic ? 'ተጠናቋል (ወደ ዝርዝር ተመለስ)' : 'Done / Return to Packages'}
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-start">
                
                {/* Left Column (7 cols on lg): Payment, Banks, Delivery, Notes */}
                <div className="lg:col-span-7 space-y-6">
                  {/* Account Required Alert Banner */}
                  {!isAuthenticated && (
                    <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-xs">
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
                              ? 'የበዓል ጥቅል ትዕዛዝዎን ለመከታተልና ደረሰኝ ለማያያዝ እባክዎ መለያ ይፍጠሩ ወይም ይግቡ።'
                              : 'To track your celebration packages, receipts, and order status, please create an account or sign in.'}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 w-full sm:w-auto shrink-0">
                        <button
                          type="button"
                          onClick={() => openAuthModal('register', isAmharic ? `የበዓል ጥቅል "${packageName}" ለማዘዝ እባክዎ መለያ ይፍጠሩ።` : `Please create an account to order "${packageName}".`)}
                          className="flex-1 sm:flex-initial px-3.5 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-black text-xs font-bold transition-all shadow-sm cursor-pointer whitespace-nowrap"
                        >
                          {isAmharic ? 'መለያ ፍጠር (Register)' : 'Create Account'}
                        </button>
                        <button
                          type="button"
                          onClick={() => openAuthModal('login', isAmharic ? `የበዓል ጥቅል "${packageName}" ለማዘዝ እባክዎ ይግቡ።` : `Please sign in to order "${packageName}".`)}
                          className="flex-1 sm:flex-initial px-3 py-2 rounded-xl border border-amber-500/40 text-amber-500 hover:bg-amber-500/10 text-xs font-bold transition-all cursor-pointer whitespace-nowrap"
                        >
                          {isAmharic ? 'ግባ (Sign In)' : 'Sign In'}
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Section 1: Payment Mode Selector */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-bold uppercase tracking-wider opacity-80 flex items-center gap-2">
                        <span className="w-5 h-5 rounded-full bg-amber-500/20 text-amber-500 flex items-center justify-center text-[10px] font-bold">1</span>
                        <span>{isAmharic ? 'የክፍያ አማራጭ ይምረጡ' : 'Select Payment Option'}</span>
                      </label>
                      <span className="text-xs text-amber-500 font-semibold">
                        {paymentMode === 'deposit'
                          ? (isAmharic ? '50% ቅድመ-ክፍያ' : '50% Deposit')
                          : (isAmharic ? '100% ሙሉ ክፍያ' : '100% Full Payment')}
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <button
                        type="button"
                        onClick={() => setPaymentMode('deposit')}
                        className={`p-4 rounded-xl border text-left transition-all cursor-pointer relative ${
                          paymentMode === 'deposit'
                            ? 'border-amber-500 bg-amber-500/10 ring-1 ring-amber-500/30'
                            : isDark
                              ? 'border-white/10 bg-white/5 opacity-80 hover:opacity-100 hover:border-white/20'
                              : 'border-neutral-200 bg-neutral-50/50 opacity-80 hover:opacity-100 hover:border-neutral-300'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-1.5">
                          <div className="font-bold text-xs flex items-center gap-1.5 text-amber-500">
                            <ShieldCheck className="w-4 h-4" />
                            <span>{isAmharic ? '50% ቅድመ-ክፍያ (መያዣ)' : '50% Deposit (Reserve)'}</span>
                          </div>
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-500 text-black">
                            {isAmharic ? 'ይመከራል' : 'Recommended'}
                          </span>
                        </div>
                        <div className="font-serif font-bold text-lg text-amber-500">
                          {formatPrice(depositAmount)}
                        </div>
                        <p className="text-xs opacity-70 mt-1 leading-snug">
                          {isAmharic
                            ? `በግማሽ ክፍያ ያስይዙ። ቀሪውን ${formatPrice(remainingAmount)} ከርክክብ በፊት ይክፈሉ።`
                            : `Lock package now with 50% deposit. Pay remaining ${formatPrice(remainingAmount)} before doorstep delivery.`}
                        </p>
                      </button>

                      <button
                        type="button"
                        onClick={() => setPaymentMode('full')}
                        className={`p-4 rounded-xl border text-left transition-all cursor-pointer ${
                          paymentMode === 'full'
                            ? 'border-amber-500 bg-amber-500/10 ring-1 ring-amber-500/30'
                            : isDark
                              ? 'border-white/10 bg-white/5 opacity-80 hover:opacity-100 hover:border-white/20'
                              : 'border-neutral-200 bg-neutral-50/50 opacity-80 hover:opacity-100 hover:border-neutral-300'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-1.5">
                          <div className="font-bold text-xs flex items-center gap-1.5">
                            <Sparkles className="w-4 h-4 text-amber-500" />
                            <span>{isAmharic ? '100% ሙሉ ክፍያ' : '100% Full Payment'}</span>
                          </div>
                        </div>
                        <div className="font-serif font-bold text-lg">
                          {formatPrice(grandTotal)}
                        </div>
                        <p className="text-xs opacity-70 mt-1 leading-snug">
                          {isAmharic
                            ? 'ሙሉ ክፍያውን አስቀድመው ይፈጽሙ። ፈጣን እና ቀጥታ የበር ማድረስ።'
                            : 'Complete full transaction upfront. Seamless dispatch and door delivery.'}
                        </p>
                      </button>
                    </div>
                  </div>

                  {/* Section 2: Bank Transfer Details */}
                  <div className="space-y-3 pt-6 border-t border-black/10 dark:border-white/10">
                    <div className="flex items-center justify-between">
                      <div className="text-xs font-bold uppercase tracking-wider opacity-80 flex items-center gap-2">
                        <span className="w-5 h-5 rounded-full bg-amber-500/20 text-amber-500 flex items-center justify-center text-[10px] font-bold">2</span>
                        <CreditCard className="w-4 h-4 text-amber-500" />
                        <span>{isAmharic ? `${formatPrice(currentPayAmount)} ወደሚከተሉት ባንኮች ያስተላልፉ፡` : `Transfer ${formatPrice(currentPayAmount)} To:`}</span>
                      </div>
                      <div className="text-[11px] opacity-60 hidden sm:block">
                        {isAmharic ? 'ሕጋዊ የንግድ ሒሳቦች' : 'Official Business Accounts'}
                      </div>
                    </div>

                    {/* Bank Pills */}
                    <div className="flex flex-wrap gap-2">
                      {bankAccounts.map(b => (
                        <button
                          key={b.id}
                          type="button"
                          onClick={() => setSelectedBankId(b.id)}
                          className={`px-3.5 py-2 rounded-xl text-xs font-medium transition-all cursor-pointer border ${
                            selectedBankId === b.id
                              ? 'bg-amber-500 text-black font-bold border-amber-500 shadow-sm'
                              : isDark
                                ? 'bg-white/5 border-white/10 text-[#F4E8D0] hover:border-amber-500/40'
                                : 'bg-neutral-50 border-neutral-200 text-[#241A12] hover:border-amber-500/40'
                          }`}
                        >
                          {b.bankName}
                        </button>
                      ))}
                    </div>

                    {/* Clean Inline Bank Details without extra card box */}
                    {selectedBank && (
                      <div className="flex flex-wrap items-center justify-between gap-3 pt-2 text-xs">
                        <div className="flex items-center gap-2">
                          <span className="opacity-60">{isAmharic ? 'የሒሳብ ስም:' : 'Account Name:'}</span>
                          <span className="font-semibold text-sm">{selectedBank.accountName}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="opacity-60">{isAmharic ? 'የሒሳብ ቁጥር:' : 'Account Number:'}</span>
                          <span className="font-mono font-bold text-base text-amber-500">{selectedBank.accountNumber}</span>
                          <button
                            type="button"
                            onClick={() => handleCopy(selectedBank.accountNumber, selectedBank.id)}
                            className="px-2.5 py-1 rounded-lg border border-amber-500/30 hover:bg-amber-500/10 cursor-pointer text-amber-500 transition-colors flex items-center gap-1.5 text-xs font-medium"
                            title={isAmharic ? 'ቁጥሩን ቅዳ' : 'Copy account number'}
                          >
                            {copiedBankId === selectedBank.id ? (
                              <>
                                <Check className="w-3.5 h-3.5 text-emerald-500" />
                                <span className="text-emerald-500 font-bold">{isAmharic ? 'ተቀድቷል' : 'Copied'}</span>
                              </>
                            ) : (
                              <>
                                <Copy className="w-3.5 h-3.5" />
                                <span>{isAmharic ? 'ቅዳ' : 'Copy'}</span>
                              </>
                            )}
                          </button>
                        </div>
                        {selectedBank.instructions && (
                          <p className="w-full text-[11px] opacity-70 italic pt-1 border-t border-black/5 dark:border-white/5">
                            {selectedBank.instructions}
                          </p>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Section 3: Delivery Preference & Vehicle Selector */}
                  <div className="space-y-3 pt-6 border-t border-black/10 dark:border-white/10">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-bold uppercase opacity-80 flex items-center gap-2">
                        <span className="w-5 h-5 rounded-full bg-amber-500/20 text-amber-500 flex items-center justify-center text-[10px] font-bold">3</span>
                        <Truck className="w-4 h-4 text-amber-500" />
                        <span>{isAmharic ? 'የማድረሻ ምርጫ' : 'Delivery Preference'}</span>
                      </label>
                      {paymentMode === 'full' && isFreeDeliveryEligible && isDelivery && (
                        <span className="text-xs font-bold text-emerald-500 flex items-center gap-1">
                          <Sparkles className="w-3.5 h-3.5" /> {isAmharic ? 'ነፃ ማድረሻ ተካቷል' : 'Free Delivery Included'}
                        </span>
                      )}
                    </div>

                    {paymentMode === 'full' ? (
                      <>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <button
                            type="button"
                            onClick={() => setIsDelivery(true)}
                            className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer flex items-center gap-3 ${
                              isDelivery
                                ? 'bg-amber-500/15 border-amber-500 text-amber-500 font-semibold ring-1 ring-amber-500/30'
                                : isDark
                                  ? 'bg-transparent border-white/10 text-neutral-400 hover:border-white/20'
                                  : 'bg-transparent border-neutral-200 text-neutral-600 hover:border-neutral-300'
                            }`}
                          >
                            <div className="w-10 h-10 rounded-xl bg-amber-500/20 flex items-center justify-center shrink-0">
                              <Truck className="w-5 h-5" />
                            </div>
                            <div className="min-w-0">
                              <div className="text-xs sm:text-sm font-bold truncate">{isAmharic ? 'በአድራሻዬ ይድረስ' : 'Doorstep Delivery'}</div>
                              <div className="text-[11px] opacity-70 truncate">{isAmharic ? 'ወደ ቤትዎ ወይም ሬስቶራንትዎ' : 'Direct to your door/compound'}</div>
                            </div>
                          </button>

                          <button
                            type="button"
                            onClick={() => setIsDelivery(false)}
                            className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer flex items-center gap-3 ${
                              !isDelivery
                                ? 'bg-amber-500/15 border-amber-500 text-amber-500 font-semibold ring-1 ring-amber-500/30'
                                : isDark
                                  ? 'bg-transparent border-white/10 text-neutral-400 hover:border-white/20'
                                  : 'bg-transparent border-neutral-200 text-neutral-600 hover:border-neutral-300'
                            }`}
                          >
                            <div className="w-10 h-10 rounded-xl bg-neutral-500/20 flex items-center justify-center shrink-0">
                              <MapPin className="w-5 h-5" />
                            </div>
                            <div className="min-w-0">
                              <div className="text-xs sm:text-sm font-bold truncate">{isAmharic ? 'ከእርሻው መውሰድ (Pickup)' : 'Farm Pickup'}</div>
                              <div className="text-[11px] opacity-70 truncate">Arat Kilo Facility (Free)</div>
                            </div>
                          </button>
                        </div>

                        {isDelivery && (
                          <div className="pt-2">
                            <DeliveryVehicleSelector
                              loadItems={loadItems}
                              selectedLocation={selectedLocation}
                              onLocationClick={() => setIsLocationModalOpen(true)}
                              onSelectLocation={(loc) => setSelectedLocation(loc)}
                              selectedVehicleId={selectedVehicleId}
                              onSelectVehicle={(vehicleId, quote) => {
                                setSelectedVehicleId(vehicleId);
                                setSelectedVehicleQuote(quote);
                              }}
                              onQuoteChange={(quote) => setDeliveryQuoteData(quote)}
                              isFreeDelivery={isFreeDeliveryEligible}
                            />
                          </div>
                        )}
                      </>
                    ) : (
                      <div className="p-4 rounded-2xl border bg-amber-500/10 border-amber-500/30 flex items-start gap-3">
                        <Truck className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
                        <div className="space-y-1">
                          <div className="text-xs font-bold text-amber-500">
                            {isAmharic ? 'የማስረከቢያ መንገድ (Delivery)' : 'Fulfillment & Delivery'}
                          </div>
                          <p className="text-xs opacity-80 leading-relaxed">
                            {isAmharic
                              ? 'የበር ማድረሻ ወይም ከእርሻው የመውሰድ አማራጭ የሚመረጠው ቀሪውን 50% ክፍያ ሲጨርሱ ነው። በዚህ ቅድመ-ክፍያ ምንም የማጓጓዣ ክፍያ አይታሰብም።'
                              : 'Doorstep delivery or farm pickup will be chosen when finishing your reservation (paying the remaining 50% balance). No delivery fee is charged during initial reservation.'}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Section 4: Special Instructions */}
                  <div className="space-y-2 pt-6 border-t border-black/10 dark:border-white/10">
                    <label className="text-xs font-bold uppercase opacity-80 flex items-center gap-2">
                      <span className="w-5 h-5 rounded-full bg-amber-500/20 text-amber-500 flex items-center justify-center text-[10px] font-bold">4</span>
                      <FileText className="w-4 h-4 text-amber-500" />
                      <span>{isAmharic ? 'ተጨማሪ ማስታወሻ ወይም መመሪያ (አማራጭ)' : 'Special Delivery Instructions (Optional)'}</span>
                    </label>
                    <input
                      type="text"
                      value={customerNotes}
                      onChange={e => setCustomerNotes(e.target.value)}
                      placeholder={isAmharic ? 'ለምሳሌ፡ በበዓል ዋዜማ ከጠዋቱ 4 ሰዓት በፊት ይድረስ፣ ወይም ልዩ የመድረሻ ምልክት' : 'e.g. Deliver before 10 AM on Holiday Eve, gate code, or landmark'}
                      className={`w-full px-4 py-3 rounded-xl border text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 transition-all ${
                        isDark
                          ? 'bg-[#24170D] border-[#4A2C16] text-[#F4E8D0]'
                          : 'bg-white border-[#E4D4BC] text-[#241A12]'
                      }`}
                    />
                  </div>
                </div>

                {/* Right Column (5 cols on lg): Single Unified Checkout Card */}
                <div className="lg:col-span-5 lg:sticky lg:top-4">
                  <div
                    className={`p-5 sm:p-6 rounded-3xl border shadow-md space-y-5 ${
                      isDark ? 'bg-[#1D130A] border-[#4A2C16]' : 'bg-white border-[#E4D4BC]'
                    }`}
                  >
                    {/* Header with Title & Badge */}
                    <div className="space-y-1">
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-[10px] uppercase font-bold tracking-wider px-2.5 py-0.5 rounded-full bg-amber-500/15 text-amber-500 border border-amber-500/30">
                          {packageItem?.badge || (isAmharic ? 'የበዓል ጥቅል' : 'Celebration Package')}
                        </span>
                        {isFreeDeliveryEligible && (
                          <span className="text-[10px] font-bold text-emerald-500 flex items-center gap-1">
                            <Sparkles className="w-3 h-3" /> {isAmharic ? 'ነፃ ማድረሻ' : 'Free Delivery'}
                          </span>
                        )}
                      </div>
                      <h3 className="font-serif font-bold text-lg leading-tight text-amber-500">
                        {packageName}
                      </h3>
                      {packageItem?.tagline && (
                        <p className="text-xs opacity-75">
                          {isAmharic && packageItem.amharicTagline ? packageItem.amharicTagline : packageItem.tagline}
                        </p>
                      )}
                    </div>

                    {/* Included Items Pills */}
                    {rawItems.length > 0 && (
                      <div className="pt-2 border-t border-black/5 dark:border-white/5">
                        <span className="text-[11px] font-semibold opacity-70 block mb-2">
                          {isAmharic ? 'የጥቅሉ ይዘቶች:' : 'Included Bundle Items:'}
                        </span>
                        <div className="flex flex-wrap gap-1.5">
                          {rawItems.map((item, idx) => (
                            <span
                              key={item.id || idx}
                              className={`text-[11px] px-2.5 py-1 rounded-lg border font-medium ${
                                isDark
                                  ? 'bg-white/5 border-white/10 text-[#F4E8D0]'
                                  : 'bg-neutral-100 border-neutral-200 text-neutral-800'
                              }`}
                            >
                              {isAmharic && item.amharicName ? item.amharicName : item.name}
                              {item.unit ? ` (${item.unit})` : ''}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Financial Breakdown & Amount Due Now */}
                    <div className="pt-2 border-t border-black/5 dark:border-white/5 space-y-2 text-xs">
                      <div className="flex justify-between items-center opacity-80">
                        <span>{isAmharic ? 'የጥቅል መነሻ ዋጋ:' : 'Package Price:'}</span>
                        <span className="font-mono font-medium">{formatPrice(basePackagePrice)}</span>
                      </div>

                      {paymentMode === 'full' ? (
                        <div className="flex justify-between items-center opacity-80">
                          <span>{isAmharic ? 'የማድረሻ ክፍያ:' : 'Delivery Fee:'}</span>
                          <span className="font-mono font-medium">
                            {isDelivery
                              ? isFreeDeliveryEligible
                                ? <span className="text-emerald-500 font-bold">{isAmharic ? 'ነፃ (0 ብር)' : 'Free (0 ETB)'}</span>
                                : selectedVehicleQuote
                                  ? formatPrice(selectedVehicleQuote.deliveryFee)
                                  : '0 ETB'
                              : <span className="text-neutral-400">{isAmharic ? 'ከእርሻው መውሰድ (0 ብር)' : 'Pickup (0 ETB)'}</span>}
                          </span>
                        </div>
                      ) : (
                        <div className="flex justify-between items-center opacity-80 text-amber-500">
                          <span>{isAmharic ? 'የማድረሻ ሁኔታ:' : 'Delivery Fulfillment:'}</span>
                          <span className="font-medium text-[11px]">{isAmharic ? 'ቀሪ ክፍያ ሲፈጸም የሚመረጥ' : 'Arranged at final balance'}</span>
                        </div>
                      )}

                      <div className="flex justify-between items-center pt-2 border-t border-black/5 dark:border-white/5 font-semibold">
                        <span>{isAmharic ? 'ጠቅላላ የጥቅሉ ዋጋ:' : 'Total Order Value:'}</span>
                        <span className="font-mono">{formatPrice(paymentMode === 'deposit' ? basePackagePrice : grandTotal)}</span>
                      </div>

                      {/* Clean Inline Amount Payable */}
                      <div className="flex justify-between items-baseline pt-2 border-t border-black/5 dark:border-white/5">
                        <span className="font-bold text-xs text-amber-500">
                          {paymentMode === 'deposit'
                            ? (isAmharic ? 'አሁን የሚከፈል (50% ቅድመ-ክፍያ):' : 'Payable Now (50% Deposit):')
                            : (isAmharic ? 'አሁን የሚከፈል ሙሉ ክፍያ:' : 'Payable Now (100% Full):')}
                        </span>
                        <span className="font-serif font-bold text-xl text-amber-500">
                          {formatPrice(currentPayAmount)}
                        </span>
                      </div>
                      {paymentMode === 'deposit' && (
                        <div className="text-[11px] opacity-75 text-right">
                          {isAmharic
                            ? `ቀሪ ክፍያ በርክክብ ወቅት: ${formatPrice(remainingAmount)}`
                            : `Remaining on delivery: ${formatPrice(remainingAmount)}`}
                        </div>
                      )}
                    </div>

                    {/* Customer Information Fields */}
                    <div className="pt-3 border-t border-black/5 dark:border-white/5 space-y-3">
                      <div className="text-xs font-bold uppercase tracking-wider opacity-80 flex items-center gap-1.5">
                        <BadgeCheck className="w-4 h-4 text-amber-500" />
                        <span>{isAmharic ? 'የደንበኛ መረጃ' : 'Customer Details'}</span>
                      </div>

                      <div className="space-y-2.5">
                        <div>
                          <label className="block text-xs font-bold mb-1 opacity-80">
                            {isAmharic ? 'ሙሉ ስም' : 'Full Name'} <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="text"
                            required
                            value={customerName}
                            onChange={e => setCustomerName(e.target.value)}
                            placeholder={isAmharic ? 'ለምሳሌ፡ ዳዊት ታደሰ' : 'e.g. Dawit Tadesse'}
                            className={`w-full px-3.5 py-2 rounded-xl border text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 transition-all ${
                              isDark
                                ? 'bg-[#24170D] border-[#4A2C16] text-[#F4E8D0]'
                                : 'bg-white border-[#E4D4BC] text-[#241A12]'
                            }`}
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-bold mb-1 opacity-80">
                            {isAmharic ? 'ስልክ ቁጥር' : 'Phone Number'} <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="tel"
                            required
                            value={customerPhone}
                            onChange={e => setCustomerPhone(e.target.value)}
                            placeholder={isAmharic ? 'ለምሳሌ፡ 0910194903' : 'e.g. +251 910 194 903'}
                            className={`w-full px-3.5 py-2 rounded-xl border text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 transition-all ${
                              isDark
                                ? 'bg-[#24170D] border-[#4A2C16] text-[#F4E8D0]'
                                : 'bg-white border-[#E4D4BC] text-[#241A12]'
                            }`}
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-bold mb-1 opacity-80">
                            {isAmharic ? 'የትራንዛክሽን ቁጥር (አማራጭ)' : 'Transaction Reference (Optional)'}
                          </label>
                          <input
                            type="text"
                            value={transactionRef}
                            onChange={e => setTransactionRef(e.target.value)}
                            placeholder={isAmharic ? 'ለምሳሌ፡ FT2348589...' : 'e.g. FT2348589...'}
                            className={`w-full px-3.5 py-2 rounded-xl border text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 transition-all ${
                              isDark
                                ? 'bg-[#24170D] border-[#4A2C16] text-[#F4E8D0]'
                                : 'bg-white border-[#E4D4BC] text-[#241A12]'
                            }`}
                          />
                        </div>
                      </div>
                    </div>

                    {/* Upload Receipt / Slip */}
                    <div className="pt-3 border-t border-black/5 dark:border-white/5 space-y-2">
                      <label className="block text-xs font-bold uppercase tracking-wider opacity-80">
                        {isAmharic ? 'የክፍያ ማረጋገጫ ደረሰኝ' : 'Payment Slip Screenshot'} <span className="text-red-500">*</span>
                      </label>

                      <div
                        onDragOver={e => { e.preventDefault(); setIsDragging(true); }}
                        onDragLeave={() => setIsDragging(false)}
                        onDrop={handleDrop}
                        onClick={() => fileInputRef.current?.click()}
                        className={`p-3.5 rounded-xl border border-dashed cursor-pointer text-center transition-all ${
                          isDragging
                            ? 'border-amber-500 bg-amber-500/10'
                            : slipPreviewUrl
                              ? 'border-emerald-500 bg-emerald-500/5'
                              : isDark
                                ? 'border-white/20 hover:border-amber-500/50 bg-white/5'
                                : 'border-neutral-300 hover:border-amber-500/50 bg-neutral-50'
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
                          <div className="space-y-1.5">
                            <img
                              src={slipPreviewUrl}
                              alt="Payment Slip Preview"
                              className="max-h-28 mx-auto rounded-lg shadow-sm object-contain border border-black/10 dark:border-white/10"
                            />
                            <div className="text-xs font-bold text-emerald-500 flex items-center justify-center gap-1">
                              <CheckCircle2 className="w-3.5 h-3.5" /> {isAmharic ? `ደረሰኝ ተያይዟል (${slipFile?.name})` : `Slip Attached (${slipFile?.name})`}
                            </div>
                            <p className="text-[10px] opacity-60">
                              {isAmharic ? 'ለመቀየር ይጫኑ ወይም ፋይል ይጎትቱ' : 'Click or drag to replace receipt'}
                            </p>
                          </div>
                        ) : (
                          <div className="flex items-center justify-center gap-2.5 py-1">
                            <div className="w-8 h-8 rounded-lg bg-amber-500/15 text-amber-500 flex items-center justify-center shrink-0">
                              <UploadCloud className="w-4 h-4" />
                            </div>
                            <div className="text-left">
                              <div className="text-xs font-bold">
                                {isAmharic ? 'ስክሪንሾት ለመምረጥ ይጫኑ' : 'Click to browse transfer screenshot'}
                              </div>
                              <div className="text-[10px] opacity-60">
                                {isAmharic ? 'ቴሌብር ወይም የባንክ ደረሰኝ (JPG, PNG, PDF)' : 'Telebirr or Bank Slip (JPG, PNG, PDF)'}
                              </div>
                            </div>
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
                    {!isAuthenticated ? (
                      <button
                        type="button"
                        onClick={() => openAuthModal('register', isAmharic ? `የበዓል ጥቅል "${packageName}" ለማዘዝ እባክዎ መለያ ይፍጠሩ።` : `Please create an account to order "${packageName}".`)}
                        className="w-full py-3.5 rounded-2xl bg-amber-500 hover:bg-amber-600 text-black font-bold text-sm tracking-wide transition-all shadow-lg shadow-amber-500/25 flex items-center justify-center gap-2 cursor-pointer"
                      >
                        <CheckCircle2 className="w-4 h-4" />
                        <span>{isAmharic ? 'መለያ ፈጥረው ትዕዛዝዎን ያጠናቅቁ' : 'Create Account to Complete Order'}</span>
                      </button>
                    ) : (
                      <button
                        type="submit"
                        disabled={isSubmitting}
                        className="w-full py-3.5 rounded-2xl bg-amber-500 hover:bg-amber-600 disabled:opacity-50 text-black font-bold text-sm tracking-wide transition-all shadow-lg shadow-amber-500/25 flex items-center justify-center gap-2 cursor-pointer"
                      >
                        {isSubmitting ? (
                          <span>{isAmharic ? 'በማስተናገድ ላይ...' : 'Processing...'}</span>
                        ) : (
                          <>
                            <CheckCircle2 className="w-4 h-4" />
                            <span>
                              {paymentMode === 'deposit'
                                ? (isAmharic
                                    ? `የ50% ቅድመ-ክፍያ ደረሰኝ ላክ (${formatPrice(depositAmount)})`
                                    : `Submit 50% Reservation Deposit (${formatPrice(depositAmount)})`)
                                : (isAmharic
                                    ? `ሙሉ ትዕዛዝ ጨርስ (${formatPrice(grandTotal)})`
                                    : `Complete Full Order (${formatPrice(grandTotal)})`)}
                            </span>
                          </>
                        )}
                      </button>
                    )}

                    {/* Trust & Assurance Footnote */}
                    <div className="pt-1 text-center text-[10.5px] opacity-60 flex items-center justify-center gap-4">
                      <span className="flex items-center gap-1">
                        <ShieldCheck className="w-3.5 h-3.5 text-amber-500" />
                        {isAmharic ? 'ሕጋዊ ማረጋገጫ' : 'Verified Livestock'}
                      </span>
                      <span>•</span>
                      <span className="flex items-center gap-1">
                        <Truck className="w-3.5 h-3.5 text-amber-500" />
                        {isAmharic ? 'የቀጥታ ማድረሻ' : 'Cold-Chain Transport'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </form>
          )}
        </main>
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
