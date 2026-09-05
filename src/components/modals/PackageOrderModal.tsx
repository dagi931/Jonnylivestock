import React, { useState, useEffect, useRef, useMemo } from 'react';
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
  Sparkles,
  MapPin
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
  const [selectedLocation, setSelectedLocation] = useState<SelectedDeliveryLocation | null>({
    address: 'Kazanchis / UNECA Area (Kirkos Sub-City, Addis Ababa)',
    lat: 9.0175,
    lng: 38.7690
  });
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
  const deliveryFee = isDelivery && !isFreeDeliveryEligible && selectedVehicleQuote ? selectedVehicleQuote.deliveryFee : 0;
  const grandTotal = basePackagePrice + deliveryFee;
  const depositAmount = Math.round(grandTotal * 0.5);
  const remainingAmount = grandTotal - depositAmount;
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
    if (isDelivery && !selectedLocation) {
      setSubmitError(
        isAmharic
          ? 'እባክዎ የማድረሻ አድራሻ ይምረጡ'
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

      formData.append('isDelivery', String(isDelivery));
      formData.append('isFreeDelivery', String(isFreeDeliveryEligible));
      if (isDelivery && selectedLocation) {
        formData.append('deliveryLocation', selectedLocation.address);
        formData.append('deliveryAddress', selectedLocation.address);
        formData.append('deliveryLatitude', String(selectedLocation.lat));
        formData.append('deliveryLongitude', String(selectedLocation.lng));
        if (selectedVehicleId) formData.append('vehicleType', selectedVehicleId);
        formData.append('deliveryFee', isFreeDeliveryEligible ? '0' : String(selectedVehicleQuote?.deliveryFee || 0));
      } else {
        formData.append('deliveryLocation', 'Self Pickup from Aware Farm Facility');
        formData.append('deliveryFee', '0');
      }

      if (customerNotes.trim()) formData.append('notes', customerNotes.trim());
      if (transactionRef.trim()) formData.append('transactionReference', transactionRef.trim());
      if (selectedBank) formData.append('paymentMethod', selectedBank.bankName);

      // Package specific attributes
      formData.append('isPackage', 'true');
      formData.append('packageName', packageName);
      formData.append('totalAmount', basePackagePrice.toString());
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
        setSubmitError(res.error || 'Failed to submit order. Please try again.');
      }
    } catch (err: any) {
      console.error('Package order error:', err);
      setSubmitError(err.message || 'Network error while placing package order');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

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
                  <Truck className="w-3.5 h-3.5" /> {isFreeDeliveryEligible ? (isAmharic ? 'ነፃ ማድረሻ ተካቷል' : 'Free Delivery Included') : (isAmharic ? 'የበር ማድረሻ' : 'Doorstep Delivery')}
                </span>
                <span>•</span>
                <span>{isAmharic ? 'የተሟላ የበዓል ጥቅል' : 'All-in-one celebration bundle'}</span>
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
                {paymentMode === 'deposit'
                  ? (isAmharic ? 'የ50% ቅድመ-ክፍያ ደረሰኝ ገብቷል!' : 'Reservation Deposit Submitted!')
                  : (isAmharic ? 'የጥቅል ትዕዛዝዎ ተልኳል!' : 'Package Order Placed!')}
              </h4>
              <p className="text-xs sm:text-sm opacity-80 max-w-md mx-auto leading-relaxed">
                {isAmharic ? (
                  <>የማዘዣ ቁጥር: <strong className="font-mono text-amber-500">{createdOrderId}</strong>። የክፍያ ደረሰኝዎ ደርሶናል፣ አስተዳዳሪው በአጭር ጊዜ ውስጥ ያረጋግጣል። ሁኔታውን በ <strong>"የተያዙ ትዕዛዞቼ"</strong> ውስጥ መከታተል ይችላሉ።</>
                ) : (
                  <>Order ID: <strong className="font-mono text-amber-500">{createdOrderId}</strong>. Our admin team has received your payment slip and will verify it shortly. You can track this in <strong>"My Reservations"</strong>.</>
                )}
              </p>
              <div className="pt-2">
                <button
                  onClick={onClose}
                  className="px-8 py-3 rounded-2xl bg-amber-500 hover:bg-amber-600 text-black font-bold transition-all shadow-lg shadow-amber-500/25 cursor-pointer"
                >
                  {isAmharic ? 'ተጠናቋል' : 'Done'}
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
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

              {/* Payment Mode Selector: 50% Reservation vs 100% Full */}
              <div className="space-y-2">
                <label className="block text-xs font-bold uppercase tracking-wider opacity-80">
                  {isAmharic ? 'የክፍያ አማራጭ ይምረጡ:' : 'Select Payment Option:'}
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
                        <span>{isAmharic ? '50% ቅድመ-ክፍያ (መያዣ)' : '50% Deposit (Reserve)'}</span>
                      </div>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500 text-black">
                        {isAmharic ? 'ይመከራል' : 'Recommended'}
                      </span>
                    </div>
                    <div className="font-serif font-bold text-lg text-amber-500">
                      {formatPrice(depositAmount)}
                    </div>
                    <p className="text-[11px] opacity-70 mt-1">
                      {isAmharic
                        ? `በግማሽ ክፍያ አሁኑኑ ያስይዙ። ቀሪውን ${formatPrice(remainingAmount)} ከርክክብ በፊት ይክፈሉ።`
                        : `Lock item now with half payment. Pay remaining ${formatPrice(remainingAmount)} before delivery.`}
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
                        <span>{isAmharic ? '100% ሙሉ ክፍያ' : '100% Full Payment'}</span>
                      </div>
                    </div>
                    <div className="font-serif font-bold text-lg">
                      {formatPrice(grandTotal)}
                    </div>
                    <p className="text-[11px] opacity-70 mt-1">
                      {isAmharic
                        ? 'ሙሉ ክፍያውን አስቀድመው ይፈጽሙ። ፈጣን እና ቀጥታ የበር ማድረስ።'
                        : 'Complete full transaction upfront. Seamless dispatch and door delivery.'}
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
                    <CreditCard className="w-3.5 h-3.5 text-amber-500" />
                    <span>{isAmharic ? `${formatPrice(currentPayAmount)} ወደሚከተሉት ባንኮች ያስተላልፉ፡` : `Transfer ${formatPrice(currentPayAmount)} To:`}</span>
                  </div>
                  <div className="text-[11px] opacity-70">{isAmharic ? 'ሕጋዊ የንግድ ሒሳቦች' : 'Official Business Accounts'}</div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {bankAccounts.map(b => (
                    <button
                      key={b.id}
                      type="button"
                      onClick={() => setSelectedBankId(b.id)}
                      className={`p-2.5 rounded-xl border text-center transition-all cursor-pointer ${
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
                      <span className="opacity-70">{isAmharic ? 'የሒሳብ ስም:' : 'Account Name:'}</span>
                      <span className="font-bold">{selectedBank.accountName}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="opacity-70">{isAmharic ? 'የሒሳብ ቁጥር:' : 'Account Number:'}</span>
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-amber-500">{selectedBank.accountNumber}</span>
                        <button
                          type="button"
                          onClick={() => handleCopy(selectedBank.accountNumber, selectedBank.id)}
                          className="p-1 rounded hover:bg-black/10 dark:hover:bg-white/10 cursor-pointer"
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

              {/* Delivery Option */}
              <div className="space-y-3">
                <label className="text-xs font-bold uppercase opacity-80 flex items-center gap-1.5">
                  <Truck className="w-3.5 h-3.5 text-amber-500" />
                  <span>{isAmharic ? 'የማድረሻ ምርጫ' : 'Delivery Preference'}</span>
                </label>

                <div className="grid grid-cols-2 gap-2.5">
                  <button
                    type="button"
                    onClick={() => setIsDelivery(true)}
                    className={`p-3 rounded-2xl border text-left transition-all cursor-pointer flex items-center gap-3 ${
                      isDelivery
                        ? 'bg-amber-500/15 border-amber-500 text-amber-400'
                        : isDark
                        ? 'bg-[#24170D] border-[#4A2C16]'
                        : 'bg-[#FAF7F0] border-[#E4D4BC]'
                    }`}
                  >
                    <Truck className="w-5 h-5 shrink-0 text-amber-500" />
                    <div>
                      <div className="text-xs font-bold">{isAmharic ? 'በአድራሻዬ ይድረስ' : 'Doorstep Delivery'}</div>
                      <div className="text-[10px] opacity-70">{isAmharic ? 'ወደ ቤትዎ ወይም ሬስቶራንትዎ' : 'Direct to your door'}</div>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setIsDelivery(false)}
                    className={`p-3 rounded-2xl border text-left transition-all cursor-pointer flex items-center gap-3 ${
                      !isDelivery
                        ? 'bg-amber-500/15 border-amber-500 text-amber-400'
                        : isDark
                        ? 'bg-[#24170D] border-[#4A2C16]'
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
                    isFreeDelivery={isFreeDeliveryEligible}
                  />
                )}
              </div>

              {/* Price Summary Banner */}
              <div
                className={`p-4 rounded-2xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                  isDark ? 'bg-amber-500/10 border-amber-500/30' : 'bg-amber-50/80 border-amber-200'
                }`}
              >
                <div className="space-y-0.5 text-xs">
                  <div className="font-bold flex items-center gap-1.5 text-amber-500">
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>{packageName}</span>
                  </div>
                  <div className="text-[11px] opacity-75">
                    Package Price: {formatPrice(basePackagePrice)}
                    {isDelivery && selectedVehicleQuote
                      ? isFreeDeliveryEligible
                        ? ` • Free Delivery Applied (0 ETB - ${selectedVehicleQuote.name})`
                        : ` + Delivery (${selectedVehicleQuote.name}: ${formatPrice(selectedVehicleQuote.deliveryFee)})`
                      : !isDelivery
                      ? ' • Farm Pickup (Free)'
                      : ''}
                  </div>
                </div>

                <div className="text-right sm:border-l sm:pl-4 border-amber-500/20">
                  <div className="text-[10px] uppercase font-bold opacity-60">
                    {paymentMode === 'deposit' ? 'Payable Now (50%)' : 'Total Payable (100%)'}
                  </div>
                  <div className="text-lg sm:text-xl font-mono font-black text-amber-500">
                    {formatPrice(currentPayAmount)}
                  </div>
                </div>
              </div>

              {/* Customer Info Fields */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
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
                    className={`w-full px-3.5 py-2.5 rounded-xl border text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 ${
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
                    className={`w-full px-3.5 py-2.5 rounded-xl border text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 ${
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
                    className={`w-full px-3.5 py-2.5 rounded-xl border text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 ${
                      isDark
                        ? 'bg-[#24170D] border-[#4A2C16] text-[#F4E8D0]'
                        : 'bg-white border-[#E4D4BC] text-[#241A12]'
                    }`}
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold mb-1 opacity-80">
                    {isAmharic ? 'ተጨማሪ ማስታወሻ (አማራጭ)' : 'Special Delivery Instructions (Optional)'}
                  </label>
                  <input
                    type="text"
                    value={customerNotes}
                    onChange={e => setCustomerNotes(e.target.value)}
                    placeholder={isAmharic ? 'ለምሳሌ፡ በበዓል ዋዜማ ከጠዋቱ 4 ሰዓት በፊት ይድረስ' : 'e.g. Deliver before 10 AM on Holiday Eve'}
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
                  {isAmharic ? 'የክፍያ ማረጋገጫ ደረሰኝ / ስክሪንሾት ያያይዙ' : 'Upload Transfer Slip Screenshot'} <span className="text-red-500">*</span>
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
                        <CheckCircle2 className="w-4 h-4" /> {isAmharic ? `ደረሰኝ ተያይዟል (${slipFile?.name})` : `Slip Attached (${slipFile?.name})`}
                      </div>
                      <p className="text-[11px] opacity-60">
                        {isAmharic ? 'ለመቀየር ይጫኑ ወይም ፋይል ይጎትቱ' : 'Click or drag to change receipt'}
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-1.5">
                      <div className="w-10 h-10 rounded-full bg-amber-500/15 text-amber-500 flex items-center justify-center mx-auto">
                        <UploadCloud className="w-5 h-5" />
                      </div>
                      <div className="text-xs font-bold">
                        {isAmharic ? 'የክፍያ ደረሰኝ ስክሪንሾት ለመምረጥ ይጫኑ' : 'Click to browse or drop your transfer screenshot'}
                      </div>
                      <div className="text-[11px] opacity-60">
                        {isAmharic ? 'JPG, PNG, PDF ይደግፋል (የቴሌብር ወይም የባንክ መልእክት)' : 'Supports JPG, PNG, PDF (Telebirr or Bank SMS/Slip)'}
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
            </form>
          )}
        </div>
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
