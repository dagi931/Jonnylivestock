import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Order } from '../../types/package';
import { useTheme } from '../../context/ThemeContext';
import { useLanguage } from '../../context/LanguageContext';
import { api, BankAccount } from '../../services/api';
import { formatPrice } from '../../utils/formatters';
import { sanitizeClientError } from '../../utils/errorSanitizer';
import { DeliveryLocationModal } from '../delivery/DeliveryLocationModal';
import { DeliveryVehicleSelector } from '../delivery/DeliveryVehicleSelector';
import { SelectedDeliveryLocation, VehicleQuoteResult, VehicleTypeId, DeliveryQuoteResponse, DeliveryLoadItem } from '../../types/delivery';
import { business } from '../../config/business';
import {
  X,
  UploadCloud,
  CheckCircle2,
  AlertCircle,
  CreditCard,
  Copy,
  Check,
  ShieldCheck,
  Truck,
  MapPin,
  Sparkles,
  Phone,
  MessageSquare
} from 'lucide-react';

interface FinalPaymentModalProps {
  order: Order | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export const FinalPaymentModal: React.FC<FinalPaymentModalProps> = ({
  order,
  isOpen,
  onClose,
  onSuccess
}) => {
  const { theme } = useTheme();
  const { isAmharic } = useLanguage();
  const isDark = theme === 'design7';

  const [bankAccounts, setBankAccounts] = useState<BankAccount[]>([]);
  const [selectedBankId, setSelectedBankId] = useState<string>('');
  const [copiedBankId, setCopiedBankId] = useState<string | null>(null);

  const [transactionRef, setTransactionRef] = useState('');
  const [customerNotes, setCustomerNotes] = useState('');
  const [slipFile, setSlipFile] = useState<File | null>(null);
  const [slipPreviewUrl, setSlipPreviewUrl] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Delivery Fulfillment State
  const [isDelivery, setIsDelivery] = useState<boolean>(false);
  const [selectedLocation, setSelectedLocation] = useState<SelectedDeliveryLocation | null>(null);
  const [isLocationModalOpen, setIsLocationModalOpen] = useState(false);
  const [selectedVehicleId, setSelectedVehicleId] = useState<VehicleTypeId>('car');
  const [selectedVehicleQuote, setSelectedVehicleQuote] = useState<VehicleQuoteResult | null>(null);
  const [deliveryQuoteData, setDeliveryQuoteData] = useState<DeliveryQuoteResponse | null>(null);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);

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
      setTransactionRef('');
      setCustomerNotes('');
      setIsDelivery(false);
      setSelectedLocation(null);
      setSelectedVehicleId('car');
      setSelectedVehicleQuote(null);
      setDeliveryQuoteData(null);
    }
  }, [isOpen]);

  // Derive load items for accurate vehicle fit and pricing
  const loadItems: DeliveryLoadItem[] = useMemo(() => {
    if (!order) return [];

    if (order.isPackage) {
      const pkgItems = order.packageDetails?.items;
      if (Array.isArray(pkgItems) && pkgItems.length > 0) {
        return pkgItems.map((item: any) => {
          const cat = item.category || '';
          let t: DeliveryLoadItem['type'] = 'package';
          if (cat === 'meat_livestock' || cat === 'meat') t = 'meat';
          else if (cat === 'sheep' || cat === 'goat' || cat === 'cow') t = cat as any;
          else if (cat === 'wine') t = 'wine';
          else if (cat === 'eggs') t = 'eggs';
          else if (cat === 'flowers') t = 'flowers';

          return {
            type: t,
            name: item.name,
            quantity: 1,
            weightKg: item.weightKg || 10
          };
        });
      }
      return [{ type: 'package', name: order.packageName || 'Celebration Package', quantity: 1, weightKg: 30 }];
    }

    // Animal order
    const aType = (order.animalType || '').toLowerCase();
    const typeKey: 'cow' | 'sheep' | 'goat' =
      aType.includes('ox') || aType.includes('cow') || aType.includes('cattle') ? 'cow'
      : aType.includes('goat') ? 'goat'
      : 'sheep';

    return [{
      type: typeKey,
      name: order.animalBreed || 'Livestock Animal',
      quantity: 1,
      weightKg: typeKey === 'cow' ? 350 : 35
    }];
  }, [order]);

  // Free delivery eligibility check
  const isFreeDeliveryEligible = Boolean(
    order?.packageDetails?.isFreeDelivery ||
    order?.packageDetails?.hasFreeDelivery ||
    (order?.packageDetails?.categoriesCount && Number(order.packageDetails.categoriesCount) >= 3) ||
    (order?.isPackage && !order?.packageDetails?.items)
  );

  if (!isOpen || !order) return null;

  const remainingBase = order.remainingAmount || (order.totalAmount * 0.5);
  const deliveryFee = isDelivery && !isFreeDeliveryEligible && selectedVehicleQuote ? selectedVehicleQuote.deliveryFee : 0;
  const totalFinalAmount = remainingBase + deliveryFee;
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

    if (isDelivery && !selectedLocation) {
      setSubmitError(
        isAmharic
          ? 'እባክዎ የማድረሻ አድራሻ ይምረጡ'
          : 'Please select your delivery destination in Addis Ababa'
      );
      return;
    }

    if (isDelivery && deliveryQuoteData && !deliveryQuoteData.isWithinRange) {
      setSubmitError(
        isAmharic
          ? 'የመረጡት ቦታ ከማድረሻ ክልል (30 ኪ.ሜ) ውጭ ነው'
          : 'Delivery is out of range (>30 km). Please select an address within Addis Ababa or choose Hub Pickup.'
      );
      return;
    }

    if (isDelivery && (!selectedVehicleQuote || !selectedVehicleQuote.isSuitable)) {
      setSubmitError(
        isAmharic
          ? 'እባክዎ ለዚህ ጭነት ተስማሚ ተሽከርካሪ ይምረጡ'
          : 'Please select a suitable vehicle for your delivery'
      );
      return;
    }

    if (!slipFile) {
      setSubmitError(
        isAmharic
          ? 'እባክዎ የቀሪ ክፍያ የባንክ/ቴሌብር ደረሰኝ ያያይዙ'
          : 'Please attach your transfer screenshot or receipt slip'
      );
      return;
    }

    setIsSubmitting(true);
    setSubmitError(null);

    try {
      const formData = new FormData();
      formData.append('finalPaymentSlip', slipFile);
      if (selectedBank) formData.append('paymentMethod', selectedBank.bankName);
      if (transactionRef.trim()) formData.append('transactionReference', transactionRef.trim());
      if (customerNotes.trim()) formData.append('customerNotes', customerNotes.trim());

      // Delivery fulfillment details
      formData.append('isDelivery', String(isDelivery));
      formData.append('isFreeDelivery', String(isDelivery && isFreeDeliveryEligible));
      if (isDelivery && selectedLocation) {
        formData.append('deliveryLocation', selectedLocation.address);
        formData.append('deliveryAddress', selectedLocation.address);
        formData.append('deliveryLatitude', String(selectedLocation.lat));
        formData.append('deliveryLongitude', String(selectedLocation.lng));
        if (selectedVehicleId) formData.append('vehicleType', selectedVehicleId);
        if (selectedVehicleQuote?.name) formData.append('vehicleName', selectedVehicleQuote.name);
        formData.append('deliveryFee', String(deliveryFee));
        if (deliveryQuoteData?.distanceKm !== undefined) {
          formData.append('distanceKm', String(deliveryQuoteData.distanceKm));
        }
        if (deliveryQuoteData?.distanceCategory) {
          formData.append('distanceCategory', deliveryQuoteData.distanceCategory);
        }
      } else {
        formData.append('deliveryLocation', 'Self Pickup from Arat Kilo Livestock Facility');
        formData.append('deliveryFee', '0');
      }

      formData.append('finalTotalAmount', String(totalFinalAmount));

      const res = await api.submitFinalPayment(order.id, formData);

      if (res.success) {
        setIsSuccess(true);
        if (onSuccess) onSuccess();
      } else {
        const friendlyError = sanitizeClientError(
          res.error,
          isAmharic ? 'የቀሪ ክፍያ ደረሰኝ ማስገባት አልተሳካም። እባክዎ እንደገና ይሞክሩ።' : 'Failed to submit final payment slip. Please try again.'
        );
        setSubmitError(friendlyError);
      }
    } catch (err: any) {
      console.error('Final payment submission error:', err);
      const friendlyError = sanitizeClientError(
        err,
        isAmharic ? 'የግንኙነት ስህተት አጋጥሟል። እባክዎ እንደገና ይሞክሩ።' : 'Network error during submission. Please try again.'
      );
      setSubmitError(friendlyError);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-200">
      <div
        className={`relative w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden border transition-all my-6 ${
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
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-serif font-bold text-lg leading-tight">
                {isAmharic ? 'ቀሪ 50% ክፍያ አጠናቅቅና ርክክብ ምረጥ' : 'Finish Reservation & Delivery'}
              </h3>
              <p className="text-xs opacity-75">
                {isAmharic ? 'የትዕዛዝ መለያ:' : 'Reservation ID:'}{' '}
                <span className="font-mono font-bold text-amber-500">{order.id}</span>
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-neutral-400 hover:text-neutral-200 hover:bg-black/10 dark:hover:bg-white/10 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-5 sm:p-7 max-h-[82vh] overflow-y-auto space-y-6">
          {isSuccess ? (
            <div className="text-center py-6 space-y-4 animate-in zoom-in-95 duration-200">
              <div className="w-16 h-16 rounded-full bg-emerald-500/15 border-2 border-emerald-500/30 text-emerald-500 flex items-center justify-center mx-auto shadow-lg">
                <CheckCircle2 className="w-9 h-9" />
              </div>
              <h4 className="font-serif font-bold text-2xl text-emerald-500">
                {isAmharic ? 'የቀሪ ክፍያ ደረሰኝ በተሳካ ሁኔታ ገብቷል!' : 'Final Balance Receipt Submitted!'}
              </h4>
              <p className="text-xs sm:text-sm opacity-80 max-w-md mx-auto leading-relaxed">
                {isAmharic
                  ? `አስተዳዳሪው የቀሪውን ${formatPrice(totalFinalAmount)} ክፍያዎን ያረጋግጣል። እንደተረጋገጠ ትዕዛዝዎ የተጠናቀቀ ሆኖ ${
                      isDelivery ? 'በመረጡት አድራሻ ይደርስዎታል' : 'ከማዕከሉ መረከብ ይችላሉ'
                    }።`
                  : `Our admin team has been notified to verify your final balance of ${formatPrice(totalFinalAmount)}. Once approved, your order is marked Completed and ${
                      isDelivery ? 'dispatched to your chosen address' : 'ready for pickup at Arat Kilo Livestock Center'
                    }!`}
              </p>

              {/* Summary Card */}
              <div
                className={`p-4 rounded-2xl border text-left text-xs space-y-2.5 max-w-md mx-auto ${
                  isDark ? 'bg-[#24170D] border-[#4A2C16]' : 'bg-[#FAF7F0] border-[#E4D4BC]'
                }`}
              >
                <div className="flex justify-between">
                  <span className="opacity-70">{isAmharic ? 'የእቃው አይነት:' : 'Item:'}</span>
                  <span className="font-bold">{order.packageName || order.animalBreed || 'Reserved Livestock'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="opacity-70">{isAmharic ? 'የማስረከቢያ ሁኔታ:' : 'Fulfillment:'}</span>
                  <span className="font-bold text-amber-500">
                    {isDelivery ? (isAmharic ? 'በአድራሻዬ ይድረስ (Doorstep Delivery)' : 'Doorstep Delivery') : (isAmharic ? 'ከማዕከሉ መውሰድ (Hub Pickup)' : 'Hub Pickup')}
                  </span>
                </div>
                {isDelivery && selectedLocation && (
                  <div className="flex justify-between">
                    <span className="opacity-70">{isAmharic ? 'የማድረሻ አድራሻ:' : 'Address:'}</span>
                    <span className="font-medium truncate max-w-[200px]" title={selectedLocation.address}>
                      {selectedLocation.address}
                    </span>
                  </div>
                )}
                <div className="flex justify-between pt-2 border-t border-black/10 dark:border-white/10 font-bold text-emerald-500">
                  <span>{isAmharic ? 'የተከፈለው ጠቅላላ ቀሪ ክፍያ:' : 'Total Final Paid:'}</span>
                  <span>{formatPrice(totalFinalAmount)}</span>
                </div>
              </div>

              {/* Admin Direct Contacts */}
              <div
                className={`p-4 rounded-2xl border max-w-md mx-auto space-y-2 ${
                  isDark ? 'bg-[#2A1A0D] border-[#C18A45]/30' : 'bg-[#F4EEDB] border-[#C18A45]/30'
                }`}
              >
                <div className="text-xs font-bold text-amber-500 flex items-center justify-center gap-1.5">
                  <ShieldCheck className="w-4 h-4" />
                  <span>{isAmharic ? 'ለፈጣን ማረጋገጫ በቀጥታ ይደውሉልን' : 'Direct Support for Immediate Dispatch'}</span>
                </div>
                <div className="grid grid-cols-2 gap-2 pt-1">
                  <a
                    href={`tel:${business.phone}`}
                    className="flex items-center justify-center gap-2 py-2 px-3 rounded-xl bg-[#C18A45] text-white text-xs font-bold shadow hover:bg-[#A06E35] transition-colors"
                  >
                    <Phone className="w-3.5 h-3.5" />
                    <span>{business.displayPhone}</span>
                  </a>
                  <a
                    href={`https://wa.me/${business.whatsapp}?text=Hello,%20I%20have%20submitted%20final%20payment%20for%20order%20${order.id}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-2 py-2 px-3 rounded-xl bg-emerald-600 text-white text-xs font-bold shadow hover:bg-emerald-700 transition-colors"
                  >
                    <MessageSquare className="w-3.5 h-3.5" />
                    <span>WhatsApp</span>
                  </a>
                </div>
              </div>

              <button
                onClick={onClose}
                className="w-full max-w-md py-3.5 rounded-2xl bg-amber-500 hover:bg-amber-600 text-black font-bold text-sm transition-all shadow-lg cursor-pointer"
              >
                {isAmharic ? 'ተጠናቋል (ዝጋ)' : 'Done / Return to Reservations'}
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Order Breakdown Summary Box */}
              <div
                className={`p-4 sm:p-5 rounded-2xl border space-y-2.5 text-xs sm:text-sm ${
                  isDark ? 'bg-[#24170D] border-[#4A2C16]' : 'bg-[#FAF7F0] border-[#E4D4BC]'
                }`}
              >
                <div className="flex justify-between items-center">
                  <span className="opacity-70">{isAmharic ? 'የእቃው ዝርዝር:' : 'Item / Package:'}</span>
                  <span className="font-bold text-amber-500">{order.packageName || order.animalBreed || 'Reserved Item'}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="opacity-70">{isAmharic ? 'ጠቅላላ የእቃው ዋጋ:' : 'Base Value:'}</span>
                  <span className="font-semibold">{formatPrice(order.totalAmount)}</span>
                </div>
                <div className="flex justify-between items-center text-emerald-500 font-semibold">
                  <span className="flex items-center gap-1">
                    <Check className="w-3.5 h-3.5" /> {isAmharic ? 'የተከፈለ 50% ቅድመ-ክፍያ:' : '50% Deposit Paid:'}
                  </span>
                  <span>{formatPrice(order.depositAmount || order.totalAmount * 0.5)}</span>
                </div>
                <div className="flex justify-between items-center opacity-80 pt-1 border-t border-black/5 dark:border-white/5">
                  <span>{isAmharic ? 'ቀሪ የእቃው ሂሳብ (50%):' : 'Remaining Balance Due:'}</span>
                  <span className="font-bold font-mono">{formatPrice(remainingBase)}</span>
                </div>

                {isDelivery && (
                  <div className="flex justify-between items-center text-xs text-amber-500">
                    <span className="flex items-center gap-1.5">
                      <Truck className="w-3.5 h-3.5" /> {isAmharic ? 'የማጓጓዣ ክፍያ:' : 'Doorstep Delivery Fee:'}
                    </span>
                    <span className="font-bold font-mono">
                      {isFreeDeliveryEligible
                        ? <span className="text-emerald-500">{isAmharic ? 'ነፃ (0 ብር)' : 'Free (0 ETB)'}</span>
                        : selectedVehicleQuote
                          ? formatPrice(selectedVehicleQuote.deliveryFee)
                          : '0 ETB'}
                    </span>
                  </div>
                )}

                <div className="flex justify-between items-center pt-2.5 border-t border-black/10 dark:border-white/10 text-base font-bold text-amber-500">
                  <span>{isAmharic ? 'አሁን የሚከፈለው ጠቅላላ ድምር:' : 'Total Final Due to Pay:'}</span>
                  <span className="text-lg font-serif font-black">{formatPrice(totalFinalAmount)}</span>
                </div>
              </div>

              {/* Delivery Fulfillment Section (Functional when finishing reservation) */}
              <div className="space-y-3 p-4 sm:p-5 rounded-2xl border bg-black/[0.02] dark:bg-white/[0.02] border-black/10 dark:border-white/10">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold uppercase tracking-wider opacity-80 flex items-center gap-2">
                    <Truck className="w-4 h-4 text-amber-500" />
                    <span>{isAmharic ? 'የማስረከቢያ መንገድ ይምረጡ' : 'Choose Delivery Fulfillment'}</span>
                  </label>
                  {isDelivery && isFreeDeliveryEligible && (
                    <span className="text-xs font-bold text-emerald-500 flex items-center gap-1">
                      <Sparkles className="w-3.5 h-3.5" /> {isAmharic ? 'ነፃ ማድረሻ ተካቷል' : 'Free Delivery Included'}
                    </span>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-2.5">
                  <button
                    type="button"
                    onClick={() => setIsDelivery(true)}
                    className={`p-3 rounded-2xl border text-left transition-all cursor-pointer flex items-center gap-2.5 ${
                      isDelivery
                        ? 'bg-amber-500/15 border-amber-500 text-amber-500 font-bold shadow-xs ring-1 ring-amber-500/30'
                        : isDark
                        ? 'bg-[#1B1208] border-[#4A2C16] opacity-70 hover:opacity-100'
                        : 'bg-white border-[#E4D4BC] opacity-70 hover:opacity-100'
                    }`}
                  >
                    <Truck className="w-4 h-4 shrink-0 text-[#C18A45]" />
                    <div>
                      <div className="text-xs font-bold">{isAmharic ? 'በአድራሻዬ ይድረስ' : 'Doorstep Delivery'}</div>
                      <div className="text-[10px] opacity-70">{isAmharic ? 'የተሽከርካሪ ማጓጓዣ' : 'Road Fleet Delivery'}</div>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setIsDelivery(false)}
                    className={`p-3 rounded-2xl border text-left transition-all cursor-pointer flex items-center gap-2.5 ${
                      !isDelivery
                        ? 'bg-amber-500/15 border-amber-500 text-amber-500 font-bold shadow-xs ring-1 ring-amber-500/30'
                        : isDark
                        ? 'bg-[#1B1208] border-[#4A2C16] opacity-70 hover:opacity-100'
                        : 'bg-white border-[#E4D4BC] opacity-70 hover:opacity-100'
                    }`}
                  >
                    <MapPin className="w-4 h-4 shrink-0 text-emerald-500" />
                    <div>
                      <div className="text-xs font-bold">{isAmharic ? 'ከማዕከሉ መውሰድ' : 'Hub Pickup'}</div>
                      <div className="text-[10px] opacity-70">{isAmharic ? 'አራት ኪሎ ማዕከል (ነፃ)' : 'Arat Kilo Facility (Free)'}</div>
                    </div>
                  </button>
                </div>

                {isDelivery ? (
                  <div className="pt-2">
                    <DeliveryVehicleSelector
                      loadItems={loadItems}
                      selectedLocation={selectedLocation}
                      onLocationClick={() => setIsLocationModalOpen(true)}
                      onSelectLocation={(loc) => setSelectedLocation(loc)}
                      selectedVehicleId={selectedVehicleId}
                      onSelectVehicle={(vId, vQuote) => {
                        setSelectedVehicleId(vId);
                        setSelectedVehicleQuote(vQuote);
                      }}
                      onQuoteChange={(quote) => setDeliveryQuoteData(quote)}
                      isFreeDelivery={isFreeDeliveryEligible}
                    />
                  </div>
                ) : (
                  <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-xs text-emerald-400 flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 shrink-0" />
                    <span>
                      {isAmharic
                        ? 'ከአራት ኪሎ ማዕከል ተቋም ቀጥታ በነፃ ይረከባሉ። ክፍያዎ እንደተረጋገጠ ርክክብ ይፈጸማል።'
                        : 'Pick up your livestock directly from Arat Kilo Livestock HQ in Addis Ababa free of delivery charge.'}
                    </span>
                  </div>
                )}
              </div>

              {/* Bank Transfer Details */}
              <div
                className={`p-4 sm:p-5 rounded-2xl border space-y-3 ${
                  isDark ? 'bg-[#24170D] border-[#4A2C16]' : 'bg-[#FAF7F0] border-[#E4D4BC]'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="text-xs font-bold uppercase tracking-wider opacity-80 flex items-center gap-2">
                    <CreditCard className="w-3.5 h-3.5 text-amber-500" />
                    <span>
                      {isAmharic
                        ? `${formatPrice(totalFinalAmount)} ወደሚከተሉት ባንኮች ያስተላልፉ፡`
                        : `Transfer ${formatPrice(totalFinalAmount)} To:`}
                    </span>
                  </div>
                  <span className="text-[10px] opacity-60 hidden sm:block">
                    {isAmharic ? 'ሕጋዊ የንግድ ሒሳቦች' : 'Official Accounts'}
                  </span>
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
                    className={`p-3.5 rounded-xl border space-y-1.5 text-xs ${
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
                        <span className="font-mono font-bold text-amber-500 text-sm">{selectedBank.accountNumber}</span>
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
                      <p className="text-[11px] opacity-70 italic pt-1 border-t border-black/5 dark:border-white/5">
                        {selectedBank.instructions}
                      </p>
                    )}
                  </div>
                )}
              </div>

              {/* Upload Receipt */}
              <div className="space-y-2">
                <label className="block text-xs font-bold uppercase tracking-wider opacity-80">
                  {isAmharic ? 'የቀሪ ክፍያ ደረሰኝ/ስሊፕ ምስል ይጫኑ *' : 'Upload Final Balance Receipt Slip *'}
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
                        <CheckCircle2 className="w-4 h-4" /> {isAmharic ? 'ደረሰኝ ተያይዟል' : 'Slip Attached'} ({slipFile?.name})
                      </div>
                      <p className="text-[11px] opacity-60">{isAmharic ? 'ለመቀየር ጠቅ ያድርጉ' : 'Click to change receipt'}</p>
                    </div>
                  ) : (
                    <div className="space-y-1.5">
                      <div className="w-10 h-10 rounded-full bg-amber-500/15 text-amber-500 flex items-center justify-center mx-auto">
                        <UploadCloud className="w-5 h-5" />
                      </div>
                      <div className="text-xs font-bold">
                        {isAmharic
                          ? `የቀሪውን ${formatPrice(totalFinalAmount)} ማስተላለፊያ ደረሰኝ እዚህ ይጫኑ`
                          : `Attach screenshot of remaining ${formatPrice(totalFinalAmount)} transfer`}
                      </div>
                      <div className="text-[11px] opacity-60">JPEG, PNG, PDF (Telebirr or Bank Slip)</div>
                    </div>
                  )}
                </div>
              </div>

              {/* Transaction Ref & Delivery Notes */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <input
                    type="text"
                    value={transactionRef}
                    onChange={e => setTransactionRef(e.target.value)}
                    placeholder={isAmharic ? 'የግብይት መለያ (Transaction Ref / ID)' : 'Transaction ID / Ref (Optional)'}
                    className={`w-full px-3.5 py-2.5 rounded-xl border text-xs focus:outline-none focus:ring-2 focus:ring-amber-500 ${
                      isDark ? 'bg-[#1B1208] border-[#4A2C16] text-[#F4E8D0]' : 'bg-white border-[#E4D4BC]'
                    }`}
                  />
                </div>
                <div>
                  <input
                    type="text"
                    value={customerNotes}
                    onChange={e => setCustomerNotes(e.target.value)}
                    placeholder={isAmharic ? 'ተጨማሪ ማስታወሻ ወይም የማድረሻ መመሪያ' : 'Delivery instructions or note (Optional)'}
                    className={`w-full px-3.5 py-2.5 rounded-xl border text-xs focus:outline-none focus:ring-2 focus:ring-amber-500 ${
                      isDark ? 'bg-[#1B1208] border-[#4A2C16] text-[#F4E8D0]' : 'bg-white border-[#E4D4BC]'
                    }`}
                  />
                </div>
              </div>

              {submitError && (
                <div className="p-3 rounded-xl bg-red-500/15 border border-red-500/30 text-red-400 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{submitError}</span>
                </div>
              )}

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3.5 rounded-2xl bg-amber-500 hover:bg-amber-600 disabled:opacity-50 text-black font-bold text-sm tracking-wide transition-all shadow-lg shadow-amber-500/25 flex items-center justify-center gap-2 cursor-pointer"
              >
                {isSubmitting ? (
                  <>
                    <span className="inline-block w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin" />
                    <span>{isAmharic ? 'በመላክ ላይ...' : 'Submitting Receipt...'}</span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4" />
                    <span>
                      {isAmharic
                        ? `ቀሪ ክፍያ አረጋግጥ (${formatPrice(totalFinalAmount)})`
                        : `Submit Final Payment (${formatPrice(totalFinalAmount)})`}
                    </span>
                  </>
                )}
              </button>
            </form>
          )}
        </div>
      </div>

      {/* Delivery Location Selection Modal */}
      <DeliveryLocationModal
        isOpen={isLocationModalOpen}
        onClose={() => setIsLocationModalOpen(false)}
        currentSelected={selectedLocation}
        onSelectLocation={(loc) => setSelectedLocation(loc)}
      />
    </div>
  );
};
