import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { getAnimalById, mockAnimals } from '../data/animals';
import { api } from '../services/api';
import { Animal } from '../types/animal';
import { StatusBadge } from '../components/common/StatusBadge';
import { ImageGallery } from '../components/animals/ImageGallery';
import { VideoPlayer } from '../components/animals/VideoPlayer';
import { ReservationModal } from '../components/modals/ReservationModal';
import { ServiceRequestModal } from '../components/modals/ServiceRequestModal';
import { InquiryModal } from '../components/modals/InquiryModal';
import { BuyPaymentModal } from '../components/modals/BuyPaymentModal';
import {
  AnimalOptionalServicesSelector,
  AnimalSlaughterOption,
  SlaughterPricing,
  getSlaughterFee,
  getSlaughterServiceLabel
} from '../components/services/AnimalOptionalServicesSelector';
import { AnimalCard } from '../components/common/AnimalCard';
import { business } from '../config/business';
import { formatPrice, formatWeight, getPhoneCallLink, getWhatsAppLink } from '../utils/formatters';
import { useTheme } from '../context/ThemeContext';
import { useLanguage } from '../context/LanguageContext';
import { useRealtimeEvent } from '../context/RealtimeContext';
import { useDelayedLoading } from '../hooks/useDelayedLoading';
import {
  Phone,
  MessageCircle,
  HelpCircle,
  Scale,
  MapPin,
  Palette,
  Tag,
  ChevronRight,
  ShieldCheck,
  ArrowLeft,
  AlertTriangle,
  Truck,
  CreditCard
} from 'lucide-react';

export const AnimalDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { theme } = useTheme();
  const { t, isAmharic } = useLanguage();
  const isDark = theme === 'design7';

  const [isBuyModalOpen, setIsBuyModalOpen] = useState(false);
  const [buyModalMode, setBuyModalMode] = useState<'deposit' | 'full'>('deposit');
  const [isReservationOpen, setIsReservationOpen] = useState(false);
  const [isServiceModalOpen, setIsServiceModalOpen] = useState(false);
  const [isInquiryOpen, setIsInquiryOpen] = useState(false);
  const [animalData, setAnimalData] = useState<Animal | undefined>(id ? getAnimalById(id) : undefined);
  const [isLoading, setIsLoading] = useState<boolean>(!id || !getAnimalById(id));

  // Optional Services & Fulfillment State
  const [isDelivery, setIsDelivery] = useState<boolean>(true);
  const [slaughterOption, setSlaughterOption] = useState<AnimalSlaughterOption>('none');
  const [slaughterPricing, setSlaughterPricing] = useState<SlaughterPricing>({
    slaughterFee: 600,
    travelFee: 200
  });

  useEffect(() => {
    // Fetch live slaughter and travel pricing from DB
    api.getSlaughterPricing().then((pricing) => {
      if (pricing && pricing.slaughterFee) {
        setSlaughterPricing(pricing);
      }
    });
  }, []);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    if (id) {
      setIsLoading(true);
      // Fetch live animal from backend
      api.getAnimalById(id)
        .then((fetched) => {
          if (fetched) {
            setAnimalData(fetched);
          }
        })
        .catch((err) => {
          console.warn('Could not fetch animal from API:', err);
        })
        .finally(() => {
          setIsLoading(false);
        });
    } else {
      setIsLoading(false);
    }
  }, [id]);

  const refreshAnimal = () => {
    if (id) {
      api.getAnimalById(id).then((fetched) => {
        if (fetched) {
          setAnimalData(fetched);
        }
      });
    }
  };

  // 🚀 Realtime listener: If this animal is marked as sold or updated, update state immediately
  useRealtimeEvent<Animal>('ANIMAL_UPDATED', (updated) => {
    if (updated && id && updated.id.toLowerCase() === id.toLowerCase()) {
      setAnimalData(updated);
    }
  });

  useRealtimeEvent<{ order: any; animal: Animal | null }>('ORDER_VERIFIED', (data) => {
    if (data?.animal && id && data.animal.id.toLowerCase() === id.toLowerCase()) {
      setAnimalData(data.animal);
    }
  });

  const animal = animalData || (id ? getAnimalById(id) : undefined);

  // Only show loading indicator if animal data fetch takes strictly longer than 3 seconds
  const showLoading = useDelayedLoading(isLoading && !animal, 3000);
  if (isLoading && !animal) {
    if (!showLoading) return <div className="min-h-[70vh]" />;
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center px-4 py-20 text-center animate-in fade-in duration-200">
        <div className="w-8 h-8 rounded-full border-2 border-amber-500 border-t-transparent animate-spin mb-3" />
        <p className="text-xs font-semibold text-amber-500">
          {isAmharic ? 'በመጫን ላይ...' : 'Loading...'}
        </p>
      </div>
    );
  }

  // Invalid Animal Handling
  if (!animal) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center px-4 py-16">
        <div
          className={`max-w-md w-full rounded-3xl border p-8 text-center shadow-xl ${
            isDark ? 'bg-[#2A1A0D] border-[#4A2C16]' : 'bg-[#F1E8D8] border-[#E4D4BC]'
          }`}
        >
          <div className="w-16 h-16 rounded-2xl bg-amber-500/20 text-amber-500 border border-amber-500/30 flex items-center justify-center mx-auto mb-4">
            <AlertTriangle className="w-8 h-8" />
          </div>
          <h1 className="font-serif font-bold text-2xl mb-2">{t.detailsPage.animalNotFound}</h1>
          <p className="text-sm opacity-80 mb-6">
            {t.detailsPage.animalNotFoundDesc}
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              to="/sheep"
              className={`px-5 py-2.5 rounded-xl text-sm font-semibold transition-colors ${
                isDark
                  ? 'bg-[#C58A3A] hover:bg-[#E0B15A] text-[#1B1208]'
                  : 'bg-[#B8792F] hover:bg-[#9E6523] text-[#FAF7F0]'
              }`}
            >
              {t.common.browseSheep}
            </Link>
            <Link
              to="/goats"
              className={`px-5 py-2.5 rounded-xl text-sm font-semibold border transition-colors ${
                isDark
                  ? 'bg-[#1B1208] border-[#4A2C16] text-[#D8C5A8] hover:text-[#F4E8D0]'
                  : 'bg-[#FAF7F0] border-[#E4D4BC] text-[#746556] hover:text-[#241A12]'
              }`}
            >
              {t.common.browseGoats}
            </Link>
            <Link
              to="/cows"
              className={`px-5 py-2.5 rounded-xl text-sm font-semibold border transition-colors ${
                isDark
                  ? 'bg-[#1B1208] border-[#4A2C16] text-[#D8C5A8] hover:text-[#F4E8D0]'
                  : 'bg-[#FAF7F0] border-[#E4D4BC] text-[#746556] hover:text-[#241A12]'
              }`}
            >
              {t.common.browseCows}
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Related animals (same type, excluding current)
  const relatedAnimals = mockAnimals
    .filter((a) => a.type === animal.type && a.id !== animal.id)
    .slice(0, 3);

  const isSold = animal.status === 'sold' || (animal.quantity !== undefined && animal.quantity <= 0);

  const categoryPath = animal.type === 'sheep' ? '/sheep' : animal.type === 'goat' ? '/goats' : '/cows';
  const categoryLabel = animal.type === 'sheep'
    ? (isAmharic ? 'በጎች' : 'Sheep')
    : animal.type === 'goat'
    ? (isAmharic ? 'ፍየሎች' : 'Goats')
    : (isAmharic ? 'ከብቶች' : 'Cows');

  const typeName = animal.type === 'sheep'
    ? (isAmharic ? 'በግ' : 'Sheep')
    : animal.type === 'goat'
    ? (isAmharic ? 'ፍየል' : 'Goat')
    : (isAmharic ? 'ከብት / ላም' : 'Cow');

  const currentSlaughterFee = getSlaughterFee(slaughterOption, slaughterPricing);
  const totalWithServices = (animal?.price || 0) + currentSlaughterFee;
  const depositWithServices = Math.round(totalWithServices * 0.5);

  const chosenServiceDetails = slaughterOption !== 'none'
    ? `${getSlaughterServiceLabel(slaughterOption, isAmharic, slaughterPricing).title} (+${formatPrice(currentSlaughterFee)})`
    : '';
  const chosenFulfillmentLabel = isDelivery
    ? (isAmharic ? 'የእስከ ደጃፍ ማድረሻ' : 'Doorstep Delivery')
    : (isAmharic ? 'ከማዕከሉ መውሰድ (Pickup)' : 'Hub Pickup');

  const whatsappInquiryText = isAmharic
    ? `ሰላም ${business.name}፣ ስለ ${animal.breed} (${animal.id}) በዋጋ ${formatPrice(animal.price)} በ${animal.location} ለመጠየቅ ፈልጌ ነበር። የማስረከቢያ ምርጫዬ፡ [${chosenFulfillmentLabel}]${chosenServiceDetails ? `፤ ተጨማሪ አገልግሎት፡ [${chosenServiceDetails}]` : ''}፤ ጠቅላላ ግምት፡ ${formatPrice(totalWithServices)}።`
    : `Hello ${business.name}, I am interested in purchasing ${animal.breed} (${animal.id}) priced at ${formatPrice(animal.price)} in ${animal.location}. Delivery preference: [${chosenFulfillmentLabel}]${chosenServiceDetails ? `, Add-on: [${chosenServiceDetails}]` : ''}, Estimated total: ${formatPrice(totalWithServices)}.`;

  return (
    <div className="min-h-screen py-4 sm:py-10">
      <div className="max-w-7xl mx-auto px-3.5 sm:px-6 lg:px-8">
        
        {/* Navigation Breadcrumbs & Back Button */}
        <div className="flex items-center justify-between gap-2 mb-4 sm:mb-5 text-xs sm:text-sm">
          <nav className="flex items-center gap-1.5 sm:gap-2 opacity-80 min-w-0 overflow-hidden text-ellipsis whitespace-nowrap">
            <Link to="/" className="hover:underline shrink-0">{t.nav.home}</Link>
            <ChevronRight className="w-3.5 h-3.5 shrink-0" />
            <Link to={categoryPath} className="hover:underline shrink-0">
              {categoryLabel}
            </Link>
            <ChevronRight className="w-3.5 h-3.5 shrink-0" />
            <span className="font-mono font-semibold truncate">{animal.id}</span>
          </nav>

          <button
            onClick={() => navigate(-1)}
            type="button"
            className={`shrink-0 inline-flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-lg border text-xs font-semibold transition-colors cursor-pointer ${
              isDark
                ? 'bg-[#2A1A0D] border-[#4A2C16] text-[#D8C5A8] hover:text-[#F4E8D0]'
                : 'bg-[#F1E8D8] border-[#E4D4BC] text-[#746556] hover:text-[#241A12]'
            }`}
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>{t.common.back}</span>
          </button>
        </div>

        {/* Main Details Grid: Left Gallery + Right Information */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-start">
          
          {/* Left Column: Gallery & Video (Balanced 50/50 proportion) */}
          <div className="lg:col-span-6 space-y-4 sm:space-y-5">
            <ImageGallery images={animal.images} alt={`${animal.breed} (${animal.id})`} isSold={isSold} />

            {/* Optional Video Section */}
            {animal.video && (
              <VideoPlayer
                videoUrl={animal.video}
                posterImage={animal.images[0]}
                title={`${animal.breed} (${animal.id})`}
              />
            )}
          </div>

          {/* Right Column: Animal Detail Card + Dedicated Service Card */}
          <div className="lg:col-span-6 space-y-5">
            {/* Main Animal Details & Booking Card */}
            <div
              className={`p-5 sm:p-7 rounded-2xl sm:rounded-3xl border shadow-sm space-y-5 ${
                isDark ? 'bg-[#2A1A0D] border-[#4A2C16]' : 'bg-[#F1E8D8] border-[#E4D4BC]'
              }`}
            >
              {/* SECTION 1: HEADER & PRICING */}
              <div>
                {/* Type, ID, Status */}
                <div className="flex items-center justify-between gap-2 mb-2">
                  <div className="flex items-center gap-1.5 sm:gap-2 min-w-0">
                    <span
                      className={`text-xs font-bold uppercase tracking-wider shrink-0 ${
                        isDark ? 'text-[#C58A3A]' : 'text-[#B8792F]'
                      }`}
                    >
                      {typeName}
                    </span>
                    <span className="font-mono text-xs px-2 py-0.5 rounded-md bg-black/20 font-semibold truncate">
                      {animal.id}
                    </span>
                  </div>
                  <StatusBadge status={isSold ? 'sold' : animal.status} size="sm" />
                </div>

                {/* Breed Title */}
                <h1
                  className={`font-serif font-bold text-2xl sm:text-3xl leading-tight ${
                    isDark ? 'text-[#F4E8D0]' : 'text-[#241A12]'
                  }`}
                >
                  {animal.breed}
                </h1>

                {/* Integrated Price & 50% Deposit Bar */}
                <div
                  className={`mt-3.5 p-3.5 sm:p-4 rounded-xl sm:rounded-2xl border flex items-center justify-between gap-2.5 ${
                    isDark
                      ? 'bg-[#1B1208] border-[#4A2C16]'
                      : 'bg-[#FAF7F0] border-[#E4D4BC]'
                  }`}
                >
                  <div className="min-w-0">
                    <span className="block text-[10.5px] uppercase tracking-wider opacity-70 font-semibold truncate">
                      {t.common.farmPrice}
                    </span>
                    <span
                      className={`text-2xl sm:text-3xl font-extrabold font-serif tracking-tight ${
                        isDark ? 'text-[#E0B15A]' : 'text-[#B8792F]'
                      }`}
                    >
                      {formatPrice(animal.price)}
                    </span>
                  </div>

                  <div className="text-right shrink-0">
                    <span className="block text-[10px] sm:text-[11px] uppercase tracking-wider font-bold text-amber-500 whitespace-nowrap">
                      {isAmharic ? '50% ቅድመ-ክፍያ' : '50% Deposit'}
                    </span>
                    <span className="text-base sm:text-lg font-black font-mono text-emerald-500 whitespace-nowrap">
                      {formatPrice(animal.price * 0.5)}
                    </span>
                  </div>
                </div>

                {/* Characteristics Tags */}
                {animal.characteristics && animal.characteristics.length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-1.5">
                    {animal.characteristics.map((c, i) => (
                      <span
                        key={i}
                        className={`text-[11px] sm:text-xs px-2.5 py-0.5 rounded-lg border font-medium ${
                          isDark
                            ? 'bg-[#1B1208]/60 border-[#4A2C16] text-[#D8C5A8]'
                            : 'bg-[#FAF7F0] border-[#E4D4BC] text-[#746556]'
                        }`}
                      >
                        {c}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* SECTION 2: SPECIFICATIONS & DESCRIPTION */}
              <div className="pt-4 border-t" style={{ borderColor: isDark ? '#4A2C16' : '#E4D4BC' }}>
                <h3
                  className={`font-serif font-bold text-sm sm:text-base mb-2 ${
                    isDark ? 'text-[#F4E8D0]' : 'text-[#241A12]'
                  }`}
                >
                  {t.detailsPage.specificationsTitle}
                </h3>

                <div className="divide-y divide-black/5 dark:divide-white/5">
                  {/* Animal ID */}
                  <div className="flex items-center justify-between gap-2 py-1.5 text-xs sm:text-sm">
                    <div className="flex items-center gap-1.5 opacity-70 text-[11px] uppercase tracking-wider font-semibold shrink-0">
                      <Tag className="w-3.5 h-3.5" />
                      <span>{t.common.animalId}</span>
                    </div>
                    <div className="font-mono font-bold text-right truncate">{animal.id}</div>
                  </div>

                  {/* Breed */}
                  <div className="flex items-center justify-between gap-2 py-1.5 text-xs sm:text-sm">
                    <div className="flex items-center gap-1.5 opacity-70 text-[11px] uppercase tracking-wider font-semibold shrink-0">
                      <Tag className="w-3.5 h-3.5" />
                      <span>{t.common.breed}</span>
                    </div>
                    <div className="font-semibold text-right text-balance break-words">{animal.breed}</div>
                  </div>

                  {/* Gender */}
                  <div className="flex items-center justify-between gap-2 py-1.5 text-xs sm:text-sm">
                    <div className="flex items-center gap-1.5 opacity-70 text-[11px] uppercase tracking-wider font-semibold shrink-0">
                      <Tag className="w-3.5 h-3.5" />
                      <span>{t.common.gender}</span>
                    </div>
                    <div className="font-semibold text-right">
                      {animal.gender === 'Male' ? t.common.male : animal.gender === 'Female' ? t.common.female : animal.gender}
                    </div>
                  </div>

                  {/* Weight */}
                  <div className="flex items-center justify-between gap-2 py-1.5 text-xs sm:text-sm">
                    <div className="flex items-center gap-1.5 opacity-70 text-[11px] uppercase tracking-wider font-semibold shrink-0">
                      <Scale className="w-3.5 h-3.5" />
                      <span>{t.common.weight}</span>
                    </div>
                    <div className="font-bold text-right font-mono">{formatWeight(animal.weight)}</div>
                  </div>

                  {/* Color */}
                  <div className="flex items-center justify-between gap-2 py-1.5 text-xs sm:text-sm">
                    <div className="flex items-center gap-1.5 opacity-70 text-[11px] uppercase tracking-wider font-semibold shrink-0">
                      <Palette className="w-3.5 h-3.5" />
                      <span>{t.common.color}</span>
                    </div>
                    <div className="font-semibold text-right text-balance break-words">{animal.color}</div>
                  </div>

                  {/* Location */}
                  <div className="flex items-center justify-between gap-2 py-1.5 text-xs sm:text-sm">
                    <div className="flex items-center gap-1.5 opacity-70 text-[11px] uppercase tracking-wider font-semibold shrink-0">
                      <MapPin className="w-3.5 h-3.5" />
                      <span>{t.common.location}</span>
                    </div>
                    <div className="font-semibold text-right text-balance break-words">{animal.location}</div>
                  </div>

                  {/* Status */}
                  <div className="flex items-center justify-between gap-2 py-1.5 text-xs sm:text-sm">
                    <div className="flex items-center gap-1.5 opacity-70 text-[11px] uppercase tracking-wider font-semibold shrink-0">
                      <ShieldCheck className="w-3.5 h-3.5" />
                      <span>{t.common.status}</span>
                    </div>
                    <div className={`text-right capitalize font-bold ${
                      isSold ? 'text-red-400' : animal.status === 'reserved' ? 'text-amber-400' : 'text-emerald-500'
                    }`}>
                      {animal.status === 'available' ? t.common.available : animal.status === 'reserved' ? t.common.reserved : t.common.sold}
                    </div>
                  </div>
                </div>

                {/* Description */}
                <div className="pt-2.5 mt-2 border-t" style={{ borderColor: isDark ? '#4A2C16' : '#E4D4BC' }}>
                  <span className="block text-[11px] uppercase tracking-wider font-semibold opacity-70 mb-1">
                    {t.detailsPage.descriptionTitle}
                  </span>
                  <p className="text-xs leading-relaxed opacity-90">
                    {animal.description}
                  </p>
                </div>
              </div>

              {/* SECTION 3: ACTIONS & CONTACT SELLER */}
              <div className="pt-4 border-t" style={{ borderColor: isDark ? '#4A2C16' : '#E4D4BC' }}>
                <h3
                  className={`font-serif font-bold text-sm sm:text-base mb-2.5 ${
                    isDark ? 'text-[#F4E8D0]' : 'text-[#241A12]'
                  }`}
                >
                  {t.detailsPage.contactSellerTitle}
                </h3>

                {isSold ? (
                  <div className="p-4 rounded-2xl bg-stone-800/40 border border-stone-700/50 text-center text-xs text-stone-400 font-semibold">
                    {t.detailsPage.soldNotice}
                  </div>
                ) : (
                  <div className="space-y-2.5">
                    {/* Primary CTA: 50% Reservation Deposit */}
                    <button
                      type="button"
                      onClick={() => {
                        setBuyModalMode('deposit');
                        setIsBuyModalOpen(true);
                      }}
                      className="w-full py-3.5 px-4 rounded-xl text-xs sm:text-sm font-bold flex items-center justify-between gap-2 bg-amber-500 hover:bg-amber-600 text-black shadow-lg hover:shadow-xl hover:scale-[1.005] active:scale-[0.99] transition-all cursor-pointer"
                    >
                      <span className="flex items-center gap-1.5 sm:gap-2 min-w-0">
                        <ShieldCheck className="w-4 h-4 shrink-0" />
                        <span className="truncate">{isAmharic ? 'በ50% ቅድመ-ክፍያ ያስይዙ' : 'Reserve with 50% Deposit'}</span>
                      </span>
                      <span className="font-mono font-black text-xs sm:text-sm bg-black/10 px-2.5 py-0.5 rounded-lg shrink-0 whitespace-nowrap">
                        {formatPrice(depositWithServices)}
                      </span>
                    </button>

                    {/* Secondary CTA: Direct Buy in Full */}
                    <button
                      type="button"
                      onClick={() => {
                        setBuyModalMode('full');
                        setIsBuyModalOpen(true);
                      }}
                      className={`w-full py-2.5 px-3 sm:px-4 rounded-xl text-xs font-semibold border flex items-center justify-between gap-2 transition-all cursor-pointer ${
                        isDark
                          ? 'bg-[#1B1208] border-[#4A2C16] text-[#D8C5A8] hover:border-[#C58A3A] hover:text-[#F4E8D0]'
                          : 'bg-[#FAF7F0] border-[#E4D4BC] text-[#746556] hover:border-[#B8792F] hover:text-[#241A12]'
                      }`}
                    >
                      <span className="flex items-center gap-2 truncate">
                        <CreditCard className="w-3.5 h-3.5 shrink-0" />
                        <span className="truncate">{isAmharic ? '100% ሙሉ ክፍያ (Buy in Full)' : 'Buy in Full'}</span>
                      </span>
                      <span className="font-mono font-bold text-xs shrink-0">
                        {formatPrice(totalWithServices)}
                      </span>
                    </button>

                    <div className="grid grid-cols-2 gap-2">
                      {/* Call Seller */}
                      <a
                        href={getPhoneCallLink(business.phone)}
                        className={`py-2.5 px-2.5 sm:px-3 rounded-xl text-xs font-bold border flex items-center justify-center gap-1.5 transition-colors ${
                          isDark
                            ? 'bg-[#1B1208] border-[#4A2C16] text-[#F4E8D0] hover:border-[#C58A3A]'
                            : 'bg-[#FAF7F0] border-[#E4D4BC] text-[#241A12] hover:border-[#B8792F]'
                        }`}
                      >
                        <Phone className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                        <span className="truncate">{t.common.callSeller}</span>
                      </a>

                      {/* WhatsApp */}
                      <a
                        href={getWhatsAppLink(business.whatsapp, whatsappInquiryText)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={`py-2.5 px-2.5 sm:px-3 rounded-xl text-xs font-bold border flex items-center justify-center gap-1.5 transition-colors ${
                          isDark
                            ? 'bg-[#1B1208] border-[#4A2C16] text-[#F4E8D0] hover:border-[#C58A3A]'
                            : 'bg-[#FAF7F0] border-[#E4D4BC] text-[#241A12] hover:border-[#B8792F]'
                        }`}
                      >
                        <MessageCircle className="w-3.5 h-3.5 text-green-500 shrink-0" />
                        <span className="truncate">{t.common.whatsApp}</span>
                      </a>
                    </div>

                    {/* Send Inquiry */}
                    <button
                      type="button"
                      onClick={() => setIsInquiryOpen(true)}
                      className={`w-full py-2 px-3 rounded-xl text-xs font-semibold transition-colors flex items-center justify-center gap-1 opacity-80 hover:opacity-100 cursor-pointer ${
                        isDark ? 'hover:text-[#E0B15A]' : 'hover:text-[#B8792F]'
                      }`}
                    >
                      <HelpCircle className="w-3 h-3 shrink-0" />
                      <span className="truncate">{t.detailsPage.askQuestionConsultation}</span>
                    </button>
                  </div>
                )}

                <p className="text-[10px] opacity-60 text-center pt-2 mt-2 border-t" style={{ borderColor: isDark ? '#4A2C16' : '#E4D4BC' }}>
                  {t.detailsPage.singleOwnerNotice}
                </p>
              </div>

            </div>

            {/* SEPARATE CARD: OPTIONAL FARM SERVICES & PREPARATION */}
            <div
              className={`p-5 sm:p-6 rounded-2xl sm:rounded-3xl border shadow-sm space-y-3.5 ${
                isDark ? 'bg-[#2A1A0D] border-[#4A2C16]' : 'bg-[#F1E8D8] border-[#E4D4BC]'
              }`}
            >
              <div className="flex items-center justify-between gap-2">
                <div className="min-w-0">
                  <div className="flex items-center gap-1 text-[11px] font-semibold uppercase tracking-wider text-amber-500 mb-0.5">
                    <Truck className="w-3.5 h-3.5" />
                    <span>{t.detailsPage.optionalServicesTitle}</span>
                  </div>
                  <h3 className={`font-serif font-bold text-sm sm:text-base truncate ${isDark ? 'text-[#F4E8D0]' : 'text-[#241A12]'}`}>
                    {isAmharic ? 'የማድረሻ እና የዕርድ አማራጮች' : 'Fulfillment, Delivery & Slaughter Services'}
                  </h3>
                </div>
                <Link to="/services" className="text-xs font-semibold hover:underline text-amber-500 shrink-0">
                  {t.detailsPage.detailsAndFaqs}
                </Link>
              </div>

              <AnimalOptionalServicesSelector
                isDelivery={isDelivery}
                onDeliveryChange={setIsDelivery}
                slaughterOption={slaughterOption}
                onSlaughterOptionChange={setSlaughterOption}
                pricing={slaughterPricing}
                showDeliveryToggle={true}
              />

              {/* Order with Chosen Services Quick Action Bar */}
              <div
                className={`p-3 sm:p-3.5 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs ${
                  isDark ? 'bg-[#1E140A] border-[#4A2C16]' : 'bg-white border-[#E4D4BC]'
                }`}
              >
                <div>
                  <span className="opacity-70 block text-[10px] uppercase font-semibold">
                    {isAmharic ? 'የአገልግሎት ክፍያ' : 'Selected Add-on Fee'}
                  </span>
                  <span className="font-bold text-amber-500 font-mono text-sm">
                    {currentSlaughterFee > 0 ? `+${formatPrice(currentSlaughterFee)}` : (isAmharic ? 'ነፃ (0 ብር)' : 'Free (0 ETB)')}
                  </span>
                </div>

                {isSold ? (
                  <div className="w-full py-2.5 px-4 rounded-xl bg-red-500/15 border border-red-500/40 text-center text-xs font-bold text-red-400 flex items-center justify-center gap-2 shadow-xs">
                    <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                    <span>{isAmharic ? 'ይህ እንስሳ ተሽጧል (SOLD OUT)' : 'This animal has been sold (SOLD OUT)'}</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        setBuyModalMode('deposit');
                        setIsBuyModalOpen(true);
                      }}
                      className="flex-1 sm:flex-initial px-3.5 py-2 rounded-xl bg-[#C58A3A] hover:bg-[#A06E35] text-white font-bold text-xs transition-colors cursor-pointer shadow-xs flex items-center justify-center gap-1.5"
                    >
                      <ShieldCheck className="w-3.5 h-3.5" />
                      <span>{isAmharic ? 'በቅድመ-ክፍያ ይዘዙ' : 'Reserve with Deposit'}</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setBuyModalMode('full');
                        setIsBuyModalOpen(true);
                      }}
                      className={`flex-1 sm:flex-initial px-3.5 py-2 rounded-xl border font-bold text-xs transition-colors cursor-pointer flex items-center justify-center gap-1.5 ${
                        isDark
                          ? 'border-[#4A2C16] text-[#F4E8D0] hover:bg-[#2A1A0D]'
                          : 'border-[#E4D4BC] text-[#241A12] hover:bg-[#FAF7F0]'
                      }`}
                    >
                      <CreditCard className="w-3.5 h-3.5" />
                      <span>{isAmharic ? 'ሙሉ ክፍያ' : 'Buy in Full'}</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Related Animals Section */}
        {relatedAnimals.length > 0 && (
          <div className="mt-8 sm:mt-12 pt-6 sm:pt-8 border-t" style={{ borderColor: isDark ? '#4A2C16' : '#E4D4BC' }}>
            <div className="flex items-center justify-between mb-4 sm:mb-6">
              <h2
                className={`font-serif font-bold text-lg sm:text-2xl ${
                  isDark ? 'text-[#F4E8D0]' : 'text-[#241A12]'
                }`}
              >
                {isAmharic ? `ሌሎች የሚገኙ ${categoryLabel}` : `Other Available ${categoryLabel}`}
              </h2>
              <Link
                to={categoryPath}
                className={`text-xs font-semibold hover:underline ${
                  isDark ? 'text-[#E0B15A]' : 'text-[#B8792F]'
                }`}
              >
                {t.common.viewAll}
              </Link>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-2.5 sm:gap-6 items-start">
              {relatedAnimals.map((item) => (
                <AnimalCard key={item.id} animal={item} />
              ))}
            </div>
          </div>
        )}

      </div>

      {/* Buy / 50% Reserve Payment Slip Modal */}
      <BuyPaymentModal
        animal={animal}
        isOpen={isBuyModalOpen}
        onClose={() => setIsBuyModalOpen(false)}
        onOrderComplete={refreshAnimal}
        initialMode={buyModalMode}
        initialIsDelivery={isDelivery}
        initialSlaughterOption={slaughterOption}
        initialSlaughterPricing={slaughterPricing}
      />

      {/* Reservation Inquiry Modal */}
      <ReservationModal
        animal={animal}
        isOpen={isReservationOpen}
        onClose={() => setIsReservationOpen(false)}
        onOpenDepositSlip={() => {
          setBuyModalMode('deposit');
          setIsBuyModalOpen(true);
        }}
      />

      {/* Service Request Modal */}
      <ServiceRequestModal
        animal={animal}
        preSelectedServices={[]}
        isOpen={isServiceModalOpen}
        onClose={() => setIsServiceModalOpen(false)}
      />

      {/* Inquiry Modal */}
      <InquiryModal
        animal={animal}
        isOpen={isInquiryOpen}
        onClose={() => setIsInquiryOpen(false)}
      />
    </div>
  );
};
