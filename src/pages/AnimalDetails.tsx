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
import { ServiceSelector } from '../components/services/ServiceSelector';
import { AnimalCard } from '../components/common/AnimalCard';
import { business } from '../config/business';
import { formatPrice, formatWeight, getPhoneCallLink, getWhatsAppLink } from '../utils/formatters';
import { useTheme } from '../context/ThemeContext';
import { useLanguage } from '../context/LanguageContext';
import { useRealtimeEvent } from '../context/RealtimeContext';
import {
  Phone,
  MessageCircle,
  CalendarCheck,
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
  Sparkles,
  CreditCard
} from 'lucide-react';

export const AnimalDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { theme } = useTheme();
  const { t, isAmharic } = useLanguage();
  const isDark = theme === 'design7';

  const [isBuyModalOpen, setIsBuyModalOpen] = useState(false);
  const [isReservationOpen, setIsReservationOpen] = useState(false);
  const [isServiceModalOpen, setIsServiceModalOpen] = useState(false);
  const [isInquiryOpen, setIsInquiryOpen] = useState(false);
  const [selectedServices, setSelectedServices] = useState<string[]>([]);
  const [animalData, setAnimalData] = useState<Animal | undefined>(id ? getAnimalById(id) : undefined);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    if (id) {
      // Fetch live animal from backend
      api.getAnimalById(id).then((fetched) => {
        if (fetched) {
          setAnimalData(fetched);
        }
      });
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

  const isSold = animal.status === 'sold';

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

  const whatsappInquiryText = isAmharic
    ? `ሰላም ${business.name}፣ ስለ ${animal.breed} (${animal.id}) በዋጋ ${formatPrice(animal.price)} በ${animal.location} ለመጠየቅ ፈልጌ ነበር።${selectedServices.length > 0 ? ` እንዲሁም ተጨማሪ አገልግሎቶች እፈልጋለሁ፡ [${selectedServices.join(', ')}]።` : ''}`
    : `Hello ${business.name}, I am interested in purchasing ${animal.breed} (${animal.id}) priced at ${formatPrice(animal.price)} in ${animal.location}.${selectedServices.length > 0 ? ` I would also like additional services: [${selectedServices.join(', ')}].` : ''}`;

  return (
    <div className="min-h-screen py-6 sm:py-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Navigation Breadcrumbs & Back Button */}
        <div className="flex flex-wrap items-center justify-between gap-3 mb-5 text-xs sm:text-sm">
          <nav className="flex items-center gap-2 opacity-80">
            <Link to="/" className="hover:underline">{t.nav.home}</Link>
            <ChevronRight className="w-3.5 h-3.5" />
            <Link to={categoryPath} className="hover:underline">
              {categoryLabel}
            </Link>
            <ChevronRight className="w-3.5 h-3.5" />
            <span className="font-mono font-semibold">{animal.id}</span>
          </nav>

          <button
            onClick={() => navigate(-1)}
            type="button"
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-semibold transition-colors ${
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
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8">
          
          {/* Left Column: Gallery & Video */}
          <div className="lg:col-span-7 space-y-5">
            <ImageGallery images={animal.images} alt={`${animal.breed} (${animal.id})`} />

            {/* Optional Video Section */}
            {animal.video && (
              <VideoPlayer
                videoUrl={animal.video}
                posterImage={animal.images[0]}
                title={`${animal.breed} (${animal.id})`}
              />
            )}
          </div>

          {/* Right Column: Animal Specifications & Actions */}
          <div className="lg:col-span-5 space-y-5">
            
            {/* Header Card */}
            <div
              className={`p-5 sm:p-6 rounded-3xl border transition-all ${
                isDark ? 'bg-[#2A1A0D] border-[#4A2C16] shadow-rustic' : 'bg-[#F1E8D8] border-[#E4D4BC] shadow-premium'
              }`}
            >
              {/* Type, ID, Status */}
              <div className="flex items-center justify-between gap-3 mb-2.5">
                <div className="flex items-center gap-2">
                  <span
                    className={`text-xs font-bold uppercase tracking-wider ${
                      isDark ? 'text-[#C58A3A]' : 'text-[#B8792F]'
                    }`}
                  >
                    {typeName}
                  </span>
                  <span className="font-mono text-xs px-2 py-0.5 rounded-md bg-black/20 font-semibold">
                    {animal.id}
                  </span>
                </div>
                <StatusBadge status={animal.status} size="sm" />
              </div>

              {/* Breed Title */}
              <h1
                className={`font-serif font-bold text-xl sm:text-2xl ${
                  isDark ? 'text-[#F4E8D0]' : 'text-[#241A12]'
                }`}
              >
                {animal.breed}
              </h1>

              {/* Price Banner */}
              <div
                className={`mt-3.5 p-3.5 rounded-2xl border flex items-baseline justify-between ${
                  isDark
                    ? 'bg-[#1B1208] border-[#4A2C16]'
                    : 'bg-[#FAF7F0] border-[#E4D4BC]'
                }`}
              >
                <div>
                  <span className="block text-[11px] uppercase tracking-wider opacity-70 font-semibold">
                    {t.common.farmPrice}
                  </span>
                  <span
                    className={`text-2xl sm:text-3xl font-extrabold font-serif ${
                      isDark ? 'text-[#E0B15A]' : 'text-[#B8792F]'
                    }`}
                  >
                    {formatPrice(animal.price)}
                  </span>
                </div>

                <div className="text-right text-xs opacity-70">
                  <span>{isAmharic ? 'ቀጥታ ከእርሻ' : 'Direct Farm Price'}</span>
                </div>
              </div>

              {/* Characteristics Tags */}
              {animal.characteristics && animal.characteristics.length > 0 && (
                <div className="mt-3.5 flex flex-wrap gap-1.5">
                  {animal.characteristics.map((c, i) => (
                    <span
                      key={i}
                      className={`text-xs px-2.5 py-0.5 rounded-lg border font-medium ${
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

            {/* Detailed Specification Table (Strictly NO Age) */}
            <div
              className={`p-5 rounded-3xl border space-y-3 text-xs sm:text-sm ${
                isDark ? 'bg-[#2A1A0D] border-[#4A2C16]' : 'bg-[#F1E8D8] border-[#E4D4BC]'
              }`}
            >
              <h3
                className={`font-serif font-bold text-sm sm:text-base border-b pb-2 ${
                  isDark ? 'text-[#F4E8D0] border-[#4A2C16]' : 'text-[#241A12] border-[#E4D4BC]'
                }`}
              >
                {t.detailsPage.specificationsTitle}
              </h3>

              <div className="grid grid-cols-2 gap-y-2.5 pt-1">
                <div className="flex items-center gap-1.5 opacity-70 text-[11px] uppercase tracking-wider font-semibold">
                  <Tag className="w-3 h-3" />
                  <span>{t.common.animalId}</span>
                </div>
                <div className="font-mono font-bold text-right">{animal.id}</div>

                <div className="flex items-center gap-1.5 opacity-70 text-[11px] uppercase tracking-wider font-semibold">
                  <Tag className="w-3 h-3" />
                  <span>{t.common.breed}</span>
                </div>
                <div className="font-semibold text-right">{animal.breed}</div>

                <div className="flex items-center gap-1.5 opacity-70 text-[11px] uppercase tracking-wider font-semibold">
                  <Tag className="w-3 h-3" />
                  <span>{t.common.gender}</span>
                </div>
                <div className="font-semibold text-right">
                  {animal.gender === 'Male' ? t.common.male : animal.gender === 'Female' ? t.common.female : animal.gender}
                </div>

                <div className="flex items-center gap-1.5 opacity-70 text-[11px] uppercase tracking-wider font-semibold">
                  <Scale className="w-3 h-3" />
                  <span>{t.common.weight}</span>
                </div>
                <div className="font-bold text-right">{formatWeight(animal.weight)}</div>

                <div className="flex items-center gap-1.5 opacity-70 text-[11px] uppercase tracking-wider font-semibold">
                  <Palette className="w-3 h-3" />
                  <span>{t.common.color}</span>
                </div>
                <div className="font-semibold text-right">{animal.color}</div>

                <div className="flex items-center gap-1.5 opacity-70 text-[11px] uppercase tracking-wider font-semibold">
                  <MapPin className="w-3 h-3" />
                  <span>{t.common.location}</span>
                </div>
                <div className="font-semibold text-right">{animal.location}</div>

                <div className="flex items-center gap-1.5 opacity-70 text-[11px] uppercase tracking-wider font-semibold">
                  <ShieldCheck className="w-3 h-3" />
                  <span>{t.common.status}</span>
                </div>
                <div className="text-right capitalize font-bold">
                  {animal.status === 'available' ? t.common.available : animal.status === 'reserved' ? t.common.reserved : t.common.sold}
                </div>
              </div>

              {/* Description */}
              <div className="pt-2.5 border-t" style={{ borderColor: isDark ? '#4A2C16' : '#E4D4BC' }}>
                <span className="block text-[11px] uppercase tracking-wider font-semibold opacity-70 mb-1">
                  {t.detailsPage.descriptionTitle}
                </span>
                <p className="text-xs leading-relaxed opacity-90">
                  {animal.description}
                </p>
              </div>
            </div>

            {/* Additional Services Checklist Option */}
            <div
              className={`p-5 rounded-3xl border space-y-3.5 ${
                isDark ? 'bg-[#2A1A0D] border-[#4A2C16]' : 'bg-[#F1E8D8] border-[#E4D4BC]'
              }`}
            >
              <div className="flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-1 text-[11px] font-semibold uppercase tracking-wider text-amber-500 mb-0.5">
                    <Truck className="w-3 h-3" />
                    <span>{t.detailsPage.optionalServicesTitle}</span>
                  </div>
                  <h3 className={`font-serif font-bold text-sm sm:text-base ${isDark ? 'text-[#F4E8D0]' : 'text-[#241A12]'}`}>
                    {t.detailsPage.optionalServicesSubtitle}
                  </h3>
                </div>
                <Link to="/services" className="text-xs font-medium hover:underline text-amber-500">
                  {t.detailsPage.detailsAndFaqs}
                </Link>
              </div>

              <ServiceSelector
                selectedServices={selectedServices}
                onChange={setSelectedServices}
              />
            </div>

            {/* Direct Seller Action Buttons */}
            <div
              className={`p-5 rounded-3xl border space-y-2.5 ${
                isDark ? 'bg-[#2A1A0D] border-[#4A2C16]' : 'bg-[#F1E8D8] border-[#E4D4BC]'
              }`}
            >
              <h3
                className={`font-serif font-bold text-sm sm:text-base ${
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
                  {/* Primary CTA: Direct Buy & Upload Payment Slip */}
                  <button
                    type="button"
                    onClick={() => setIsBuyModalOpen(true)}
                    className="w-full py-3.5 px-4 rounded-xl text-sm font-bold flex items-center justify-center gap-2 bg-gradient-to-r from-[#C18A45] to-[#A06E35] text-white shadow-lg hover:shadow-xl hover:scale-[1.01] active:scale-[0.99] transition-all"
                  >
                    <CreditCard className="w-4 h-4" />
                    <span>{isAmharic ? 'በቀጥታ ይግዙና ደረሰኝ ይጫኑ (Buy Now & Upload Slip)' : 'Buy Now & Upload Payment Slip'}</span>
                  </button>

                  {/* Secondary CTA: Request Reservation & Services */}
                  <button
                    type="button"
                    onClick={() => {
                      if (selectedServices.length > 0) {
                        setIsServiceModalOpen(true);
                      } else {
                        setIsReservationOpen(true);
                      }
                    }}
                    className={`w-full py-2.5 px-4 rounded-xl text-xs font-semibold border flex items-center justify-center gap-2 transition-all ${
                      isDark
                        ? 'bg-[#1B1208] border-[#4A2C16] text-[#D8C5A8] hover:border-[#C58A3A] hover:text-[#F4E8D0]'
                        : 'bg-[#FAF7F0] border-[#E4D4BC] text-[#746556] hover:border-[#B8792F] hover:text-[#241A12]'
                    }`}
                  >
                    {selectedServices.length > 0 ? (
                      <>
                        <Sparkles className="w-3.5 h-3.5 text-[#C18A45]" />
                        <span>{t.detailsPage.requestAnimalAndServices} ({selectedServices.length})</span>
                      </>
                    ) : (
                      <>
                        <CalendarCheck className="w-3.5 h-3.5 text-[#C18A45]" />
                        <span>{t.common.requestReservation}</span>
                      </>
                    )}
                  </button>

                  <div className="grid grid-cols-2 gap-2">
                    {/* Call Seller */}
                    <a
                      href={getPhoneCallLink(business.phone)}
                      className={`py-2.5 px-3 rounded-xl text-xs font-semibold border flex items-center justify-center gap-1.5 transition-colors ${
                        isDark
                          ? 'bg-[#1B1208] border-[#4A2C16] text-[#F4E8D0] hover:border-[#C58A3A]'
                          : 'bg-[#FAF7F0] border-[#E4D4BC] text-[#241A12] hover:border-[#B8792F]'
                      }`}
                    >
                      <Phone className="w-3.5 h-3.5 text-amber-500" />
                      <span>{t.common.callSeller}</span>
                    </a>

                    {/* WhatsApp */}
                    <a
                      href={getWhatsAppLink(business.whatsapp, whatsappInquiryText)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`py-2.5 px-3 rounded-xl text-xs font-semibold border flex items-center justify-center gap-1.5 transition-colors ${
                        isDark
                          ? 'bg-[#1B1208] border-[#4A2C16] text-[#F4E8D0] hover:border-[#C58A3A]'
                          : 'bg-[#FAF7F0] border-[#E4D4BC] text-[#241A12] hover:border-[#B8792F]'
                      }`}
                    >
                      <MessageCircle className="w-3.5 h-3.5 text-green-500" />
                      <span>{t.common.whatsApp}</span>
                    </a>
                  </div>

                  {/* Send Inquiry */}
                  <button
                    type="button"
                    onClick={() => setIsInquiryOpen(true)}
                    className={`w-full py-2 px-3 rounded-xl text-xs font-semibold transition-colors flex items-center justify-center gap-1 opacity-80 hover:opacity-100 ${
                      isDark ? 'hover:text-[#E0B15A]' : 'hover:text-[#B8792F]'
                    }`}
                  >
                    <HelpCircle className="w-3 h-3" />
                    <span>{t.detailsPage.askQuestionConsultation}</span>
                  </button>
                </div>
              )}

              <p className="text-[10px] opacity-60 text-center pt-1.5 border-t" style={{ borderColor: isDark ? '#4A2C16' : '#E4D4BC' }}>
                {t.detailsPage.singleOwnerNotice}
              </p>
            </div>

          </div>
        </div>

        {/* Related Animals Section */}
        {relatedAnimals.length > 0 && (
          <div className="mt-12 pt-8 border-t" style={{ borderColor: isDark ? '#4A2C16' : '#E4D4BC' }}>
            <div className="flex items-center justify-between mb-6">
              <h2
                className={`font-serif font-bold text-xl sm:text-2xl ${
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

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
              {relatedAnimals.map((item) => (
                <AnimalCard key={item.id} animal={item} />
              ))}
            </div>
          </div>
        )}

      </div>

      {/* Buy Now & Payment Slip Modal */}
      <BuyPaymentModal
        animal={animal}
        isOpen={isBuyModalOpen}
        onClose={() => setIsBuyModalOpen(false)}
        onOrderComplete={refreshAnimal}
      />

      {/* Reservation Modal */}
      <ReservationModal
        animal={animal}
        isOpen={isReservationOpen}
        onClose={() => setIsReservationOpen(false)}
      />

      {/* Service Request Modal */}
      <ServiceRequestModal
        animal={animal}
        preSelectedServices={selectedServices}
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
