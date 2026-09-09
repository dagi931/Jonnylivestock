import React, { useState } from 'react';
import { business } from '../config/business';
import { ContactFormData } from '../types/animal';
import { useTheme } from '../context/ThemeContext';
import { useLanguage } from '../context/LanguageContext';
import { getPhoneCallLink, getWhatsAppLink } from '../utils/formatters';
import { FarmMap } from '../components/common/FarmMap';
import { useInView } from '../hooks/useInView';
import { api } from '../services/api';
import {
  Phone,
  MessageSquare,
  MapPin,
  Clock,
  Send,
  CheckCircle2,
  AlertCircle,
  ShieldAlert,
  ChevronDown
} from 'lucide-react';

export const Contact: React.FC = () => {
  const { theme } = useTheme();
  const { t, isAmharic } = useLanguage();
  const isDark = theme === 'design7';
  const { ref: mapRef, isInView: isMapInView } = useInView({ rootMargin: '0px' });

  const [formData, setFormData] = useState<ContactFormData>({
    name: '',
    phone: '',
    email: '',
    animalId: '',
    serviceNeeded: 'No Service',
    message: ''
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const validate = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = isAmharic ? 'እባክዎ ሙሉ ስምዎን ያስገቡ' : 'Full name is required';
    }

    if (!formData.phone.trim()) {
      newErrors.phone = isAmharic ? 'እባክዎ ስልክ ቁጥርዎን ያስገቡ' : 'Phone number is required';
    } else if (!/^[+0-9\s-]{9,15}$/.test(formData.phone.trim())) {
      newErrors.phone = isAmharic ? 'እባክዎ ትክክለኛ ስልክ ቁጥር ያስገቡ' : 'Please enter a valid phone number';
    }

    if (!formData.email || !formData.email.trim()) {
      newErrors.email = isAmharic ? 'እባክዎ ኢሜይል ያስገቡ' : 'Email address is required';
    } else {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.email.trim())) {
        newErrors.email = isAmharic ? 'እባክዎ ትክክለኛ ኢሜይል ያስገቡ' : 'Please provide a valid email address';
      }
    }

    if (!formData.message.trim()) {
      newErrors.message = isAmharic ? 'እባክዎ መልእክትዎን ወይም የትዕዛዝ ዝርዝር ያስገቡ' : 'Please provide a message or inquiry details';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);
    try {
      const res = await api.submitContactMessage(formData);
      if (res.success) {
        setIsSuccess(true);
      } else {
        setErrors({
          general: res.error || (isAmharic ? 'መልእክት መላክ አልተሳካም። እባክዎ እንደገና ይሞክሩ።' : 'Failed to send message. Please try again.')
        });
      }
    } catch (err: any) {
      setErrors({
        general: err.message || (isAmharic ? 'የኔትወርክ ችግር አጋጥሟል። እባክዎ እንደገና ይሞክሩ።' : 'Network error occurred. Please try again.')
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReset = () => {
    setFormData({
      name: '',
      phone: '',
      email: '',
      animalId: '',
      serviceNeeded: 'No Service',
      message: ''
    });
    setErrors({});
    setIsSuccess(false);
  };

  return (
    <div className="min-h-screen py-8 sm:py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="max-w-3xl mb-8">
          <span
            className={`text-xs font-semibold uppercase tracking-wider ${
              isDark ? 'text-[#C58A3A]' : 'text-[#8A4B08]'
            }`}
          >
            {t.contactPage.badge}
          </span>
          <h1
            className={`font-serif font-bold text-2xl sm:text-3xl lg:text-4xl mt-1 mb-2.5 ${
              isDark ? 'text-[#F4E8D0]' : 'text-[#241A12]'
            }`}
          >
            {t.contactPage.title}
          </h1>
          <p
            className={`text-xs sm:text-sm md:text-base ${
              isDark ? 'text-[#D8C5A8]' : 'text-[#4A3B2C]'
            }`}
          >
            {t.contactPage.subtext}
          </p>
        </div>

        {/* 2-Column Grid: Contact Info Cards + Interactive Form */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-start">
          
          {/* Left Column: Direct Info Cards */}
          <div className="lg:col-span-5 space-y-4">
            
            {/* Phone Card */}
            <div
              className={`p-5 rounded-2xl border transition-all ${
                isDark ? 'bg-[#2A1A0D] border-[#4A2C16] shadow-rustic' : 'bg-[#F1E8D8] border-[#E4D4BC] shadow-premium'
              }`}
            >
              <div className="flex items-start gap-3.5">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${isDark ? 'bg-[#1B1208] text-[#C58A3A] border border-[#4A2C16]' : 'bg-[#FAF7F0] text-[#8A4B08] border border-[#E4D4BC]'}`}>
                  <Phone className="w-5 h-5" />
                </div>
                <div className="flex-1">
                  <span className={`block text-[11px] uppercase tracking-wider font-semibold ${isDark ? 'text-[#D8C5A8]/75' : 'text-[#54473A]'}`}>
                    {t.contactPage.phoneTitle}
                  </span>
                  <a
                    href={getPhoneCallLink(business.phone)}
                    aria-label={`${isAmharic ? 'የቀጥታ ስልክ ጥሪ ለ' : 'Direct phone call to'} ${business.name} ${business.displayPhone}`}
                    className={`block font-serif font-bold text-lg mt-0.5 hover:underline ${
                      isDark ? 'text-[#E0B15A]' : 'text-[#8A4B08]'
                    }`}
                  >
                    {business.displayPhone}
                  </a>
                  <p className={`text-xs mt-0.5 ${isDark ? 'text-[#D8C5A8]/80' : 'text-[#54473A]'}`}>
                    {t.contactPage.phoneDesc}
                  </p>
                </div>
              </div>
            </div>

            {/* WhatsApp Card */}
            <div
              className={`p-5 rounded-2xl border transition-all ${
                isDark ? 'bg-[#2A1A0D] border-[#4A2C16] shadow-rustic' : 'bg-[#F1E8D8] border-[#E4D4BC] shadow-premium'
              }`}
            >
              <div className="flex items-start gap-3.5">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${isDark ? 'bg-[#1B1208] text-[#25D366] border border-[#4A2C16]' : 'bg-[#FAF7F0] text-[#25D366] border border-[#E4D4BC]'}`}>
                  <MessageSquare className="w-5 h-5" />
                </div>
                <div className="flex-1">
                  <span className={`block text-[11px] uppercase tracking-wider font-semibold ${isDark ? 'text-[#D8C5A8]/75' : 'text-[#54473A]'}`}>
                    {t.contactPage.whatsappTitle}
                  </span>
                  <a
                    href={getWhatsAppLink(business.whatsapp, isAmharic ? 'ሰላም፣ ስላላችሁ ከብቶችና አገልግሎቶች ማወቅ ፈልጌ ነበር።' : 'Hello, I would like to inquire about your available livestock and services.')}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={`${isAmharic ? 'የዋትስአፕ መልእክት ለ' : 'Send WhatsApp message to'} ${business.name} ${business.displayWhatsapp}`}
                    className={`block font-serif font-bold text-lg mt-0.5 hover:underline ${
                      isDark ? 'text-[#E0B15A]' : 'text-[#8A4B08]'
                    }`}
                  >
                    {business.displayWhatsapp}
                  </a>
                  <p className={`text-xs mt-0.5 ${isDark ? 'text-[#D8C5A8]/80' : 'text-[#54473A]'}`}>
                    {t.contactPage.whatsappDesc}
                  </p>
                </div>
              </div>
            </div>

            {/* Location & Hours Card */}
            <div
              className={`p-5 rounded-2xl border space-y-3 ${
                isDark ? 'bg-[#2A1A0D] border-[#4A2C16]' : 'bg-[#F1E8D8] border-[#E4D4BC]'
              }`}
            >
              <div className="flex items-start gap-2.5">
                <MapPin className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                <div>
                  <strong className="block text-xs uppercase tracking-wider font-semibold">{t.contactPage.locationTitle}</strong>
                  <p className={`text-xs sm:text-sm mt-0.5 leading-relaxed ${isDark ? 'text-[#D8C5A8]/90' : 'text-[#4A3B2C]'}`}>
                    {business.location}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-2.5 pt-2.5 border-t" style={{ borderColor: isDark ? '#4A2C16' : '#E4D4BC' }}>
                <Clock className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                <div>
                  <strong className="block text-xs uppercase tracking-wider font-semibold">{t.contactPage.hoursTitle}</strong>
                  <p className={`text-xs mt-0.5 leading-relaxed ${isDark ? 'text-[#D8C5A8]/80' : 'text-[#54473A]'}`}>
                    {business.businessHours}
                  </p>
                </div>
              </div>
            </div>

            {/* Disclaimer pill */}
            <div
              className={`p-3.5 rounded-xl border text-xs leading-relaxed flex items-start gap-2.5 ${
                isDark ? 'bg-[#1B1208] border-[#4A2C16] text-[#D8C5A8]' : 'bg-[#FAF7F0] border-[#E4D4BC] text-[#4A3B2C]'
              }`}
            >
              <ShieldAlert className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
              <span>
                {t.contactPage.disclaimer}
              </span>
            </div>

          </div>

          {/* Right Column: Contact Form */}
          <div className="lg:col-span-7">
            <div
              className={`p-5 sm:p-7 rounded-3xl border transition-all ${
                isDark ? 'bg-[#2A1A0D] border-[#4A2C16] shadow-rustic' : 'bg-[#F1E8D8] border-[#E4D4BC] shadow-premium'
              }`}
            >
              {isSuccess ? (
                <div className="text-center py-8 space-y-3">
                  <div className="w-14 h-14 rounded-full bg-green-500/20 text-green-400 border border-green-500/30 flex items-center justify-center mx-auto">
                    <CheckCircle2 className="w-8 h-8" />
                  </div>
                  <h3 className="font-serif font-bold text-xl">{t.contactPage.successTitle}</h3>
                  <p className="text-xs sm:text-sm opacity-85 max-w-md mx-auto leading-relaxed">
                    {isAmharic
                      ? `እናመሰግናለን ${formData.name}። መልእክትዎ ደርሶናል፤ አጭር ጊዜ ውስጥ በ ${formData.phone} እንደውላለን።`
                      : `Thank you, ${formData.name}. Your message has been sent to ${business.name}. We will review your inquiry and contact you at ${formData.phone} promptly.`}
                  </p>

                  <div className="pt-2 flex justify-center gap-3">
                    <button
                      type="button"
                      onClick={handleReset}
                      className={`px-5 py-2 rounded-xl text-xs sm:text-sm font-semibold border transition-colors ${
                        isDark
                          ? 'bg-[#1B1208] border-[#4A2C16] text-[#F4E8D0] hover:border-[#C58A3A]'
                          : 'bg-[#FAF7F0] border-[#E4D4BC] text-[#241A12] hover:border-[#8A4B08]'
                      }`}
                    >
                      {t.contactPage.sendAnotherBtn}
                    </button>
                  </div>
                </div>
              ) : (
                <div>
                  <div className="mb-4">
                    <h2
                      className={`font-serif font-bold text-xl sm:text-2xl ${
                        isDark ? 'text-[#F4E8D0]' : 'text-[#241A12]'
                      }`}
                    >
                      {t.contactPage.formTitle}
                    </h2>
                    <p className={`text-xs mt-0.5 ${isDark ? 'text-[#D8C5A8]/75' : 'text-[#54473A]'}`}>
                      {t.contactPage.formSubtext}
                    </p>
                  </div>

                  <form onSubmit={handleSubmit} className="space-y-3.5">
                    {/* Name & Phone */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label htmlFor="contactName" className="block text-xs font-semibold uppercase tracking-wider mb-1 opacity-90">
                          {t.contactPage.nameLabel} <span className="text-red-500">*</span>
                        </label>
                        <input
                          id="contactName"
                          name="name"
                          autoComplete="name"
                          type="text"
                          placeholder={isAmharic ? 'ለምሳሌ፡ አበበ በቀለ' : 'e.g. Abebe Bekele'}
                          value={formData.name}
                          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                          className={`w-full px-3.5 py-2 rounded-xl text-sm border focus:outline-none focus:ring-2 transition-all ${
                            errors.name ? 'border-red-500 ring-1 ring-red-500' : ''
                          } ${
                            isDark
                              ? 'bg-[#1B1208] border-[#4A2C16] text-[#F4E8D0] focus:ring-[#C58A3A]'
                              : 'bg-[#FAF7F0] border-[#E4D4BC] text-[#241A12] focus:ring-[#8A4B08]'
                          }`}
                        />
                        {errors.name && (
                          <p className="mt-1 text-xs text-red-500 flex items-center gap-1">
                            <AlertCircle className="w-3 h-3" />
                            {errors.name}
                          </p>
                        )}
                      </div>

                      <div>
                        <label htmlFor="contactPhone" className="block text-xs font-semibold uppercase tracking-wider mb-1 opacity-90">
                          {t.contactPage.phoneLabel} <span className="text-red-500">*</span>
                        </label>
                        <input
                          id="contactPhone"
                          name="phone"
                          autoComplete="tel"
                          type="tel"
                          placeholder={isAmharic ? 'ለምሳሌ፡ +251 91 123 4567' : 'e.g. +251 91 123 4567'}
                          value={formData.phone}
                          onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                          className={`w-full px-3.5 py-2 rounded-xl text-sm border focus:outline-none focus:ring-2 transition-all ${
                            errors.phone ? 'border-red-500 ring-1 ring-red-500' : ''
                          } ${
                            isDark
                              ? 'bg-[#1B1208] border-[#4A2C16] text-[#F4E8D0] focus:ring-[#C58A3A]'
                              : 'bg-[#FAF7F0] border-[#E4D4BC] text-[#241A12] focus:ring-[#8A4B08]'
                          }`}
                        />
                        {errors.phone && (
                          <p className="mt-1 text-xs text-red-500 flex items-center gap-1">
                            <AlertCircle className="w-3 h-3" />
                            {errors.phone}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Email & Animal ID */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label htmlFor="contactEmail" className="block text-xs font-semibold uppercase tracking-wider mb-1 opacity-90">
                          {t.contactPage.emailLabel} <span className="text-red-500">*</span>
                        </label>
                        <input
                          id="contactEmail"
                          name="email"
                          autoComplete="email"
                          type="email"
                          placeholder={isAmharic ? 'ለምሳሌ፡ abebe@example.com' : 'e.g. abebe@example.com'}
                          value={formData.email}
                          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                          className={`w-full px-3.5 py-2 rounded-xl text-sm border focus:outline-none focus:ring-2 transition-all ${
                            errors.email ? 'border-red-500 ring-1 ring-red-500' : ''
                          } ${
                            isDark
                              ? 'bg-[#1B1208] border-[#4A2C16] text-[#F4E8D0] focus:ring-[#C58A3A]'
                              : 'bg-[#FAF7F0] border-[#E4D4BC] text-[#241A12] focus:ring-[#8A4B08]'
                          }`}
                        />
                        {errors.email && (
                          <p className="mt-1 text-xs text-red-500 flex items-center gap-1">
                            <AlertCircle className="w-3 h-3" />
                            {errors.email}
                          </p>
                        )}
                      </div>

                      <div>
                        <label htmlFor="contactAnimalId" className="block text-xs font-semibold uppercase tracking-wider mb-1 opacity-90">
                          {t.contactPage.animalIdLabel} <span className="text-[10px] opacity-60 font-normal lowercase">({isAmharic ? 'አስገዳጅ ያልሆነ' : 'optional'})</span>
                        </label>
                        <input
                          id="contactAnimalId"
                          name="animalId"
                          type="text"
                          placeholder="e.g. SH-001 or CW-001"
                          value={formData.animalId}
                          onChange={(e) => setFormData({ ...formData, animalId: e.target.value })}
                          className={`w-full px-3.5 py-2 rounded-xl text-sm border focus:outline-none focus:ring-2 transition-all ${
                            isDark
                              ? 'bg-[#1B1208] border-[#4A2C16] text-[#F4E8D0] focus:ring-[#C58A3A]'
                              : 'bg-[#FAF7F0] border-[#E4D4BC] text-[#241A12] focus:ring-[#8A4B08]'
                          }`}
                        />
                      </div>
                    </div>

                    {/* Service Needed Dropdown */}
                    <div>
                      <label htmlFor="contactServiceNeeded" className="block text-xs font-semibold uppercase tracking-wider mb-1 opacity-90">
                        {t.contactPage.serviceNeededLabel} <span className="text-[10px] opacity-60 font-normal lowercase">({isAmharic ? 'አስገዳጅ ያልሆነ' : 'optional'})</span>
                      </label>
                      <div className="relative">
                        <select
                          id="contactServiceNeeded"
                          name="serviceNeeded"
                          aria-label={t.contactPage.serviceNeededLabel}
                          value={formData.serviceNeeded}
                          onChange={(e) => setFormData({ ...formData, serviceNeeded: e.target.value })}
                          className={`w-full px-3.5 py-2 rounded-xl text-sm border appearance-none pr-10 focus:outline-none focus:ring-2 transition-all ${
                            isDark
                              ? 'bg-[#1B1208] border-[#4A2C16] text-[#F4E8D0] focus:ring-[#C58A3A]'
                              : 'bg-[#FAF7F0] border-[#E4D4BC] text-[#241A12] focus:ring-[#8A4B08]'
                          }`}
                        >
                          <option value="No Service">{isAmharic ? 'አገልግሎት አያስፈልግም (እንስሳው ብቻ)' : 'No Service (Animal Only)'}</option>
                          <option value="Live Livestock Delivery">{isAmharic ? '01. የቀጥታ ከብትና በጎች ማድረስ' : '01. Live Livestock Delivery'}</option>
                          <option value="On-Site Slaughter & Meat Prep (Single Worker)">{isAmharic ? '02. በቦታው ላይ የዕርድና የስጋ ዝግጅት' : '02. On-Site Slaughter & Meat Prep (Single Worker)'}</option>
                          <option value="Holidays, Weddings & Funeral Ceremonies">{isAmharic ? '03. ለበዓላት፣ ለሰርግና ለተለያዩ ዝግጅቶች' : '03. Holidays, Weddings & Funeral Ceremonies'}</option>
                          <option value="Meat Supply in KG (for Hotels, Restaurants & Catering)">{isAmharic ? '04. ስጋ በኪሎ ለሆቴሎችና ሬስቶራንቶች' : '04. Meat Supply in KG (for Hotels, Restaurants & Catering)'}</option>
                          <option value="Freshly Slaughtered Sheep Delivery">{isAmharic ? '05. የታረደ ትኩስ በግ ማድረስ' : '05. Freshly Slaughtered Sheep Delivery'}</option>
                          <option value="All Services Combined">{isAmharic ? 'ሁሉም የተካተቱ አገልግሎቶች' : 'All Services Combined'}</option>
                        </select>
                        <ChevronDown className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none opacity-60" />
                      </div>
                    </div>

                    {/* Message */}
                    <div>
                      <label htmlFor="contactMessage" className="block text-xs font-semibold uppercase tracking-wider mb-1 opacity-90">
                        {t.contactPage.messageLabel} <span className="text-red-500">*</span>
                      </label>
                      <textarea
                        id="contactMessage"
                        name="message"
                        rows={3}
                        placeholder={isAmharic ? 'ስለሚፈልጉት እንስሳ፣ ማድረሻ አድራሻ ወይም ልዩ የስጋ ዝግጅት ትዕዛዝ ይጻፉልን...' : 'Tell us about the animal you want, delivery destination, or specific service instructions...'}
                        value={formData.message}
                        onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                        className={`w-full px-3.5 py-2 rounded-xl text-sm border focus:outline-none focus:ring-2 transition-all resize-none ${
                          errors.message ? 'border-red-500 ring-1 ring-red-500' : ''
                        } ${
                          isDark
                            ? 'bg-[#1B1208] border-[#4A2C16] text-[#F4E8D0] focus:ring-[#C58A3A]'
                            : 'bg-[#FAF7F0] border-[#E4D4BC] text-[#241A12] focus:ring-[#8A4B08]'
                        }`}
                      />
                      {errors.message && (
                        <p className="mt-1 text-xs text-red-500 flex items-center gap-1">
                          <AlertCircle className="w-3 h-3" />
                          {errors.message}
                        </p>
                      )}
                    </div>

                    {/* Submit Button */}
                    <div className="pt-1">
                      <button
                        type="submit"
                        disabled={isSubmitting}
                        className={`w-full sm:w-auto px-6 py-2.5 rounded-xl font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all shadow-sm transform hover:-translate-y-0.5 active:scale-[0.99] disabled:opacity-50 ${
                          isDark
                            ? 'bg-[#C58A3A] hover:bg-[#E0B15A] text-[#1B1208]'
                            : 'bg-[#8A4B08] hover:bg-[#6D3A05] text-[#FAF7F0]'
                        }`}
                      >
                        {isSubmitting ? (
                          <span>{t.contactPage.submittingBtn}</span>
                        ) : (
                          <>
                            <Send className="w-3.5 h-3.5" />
                            <span>{t.contactPage.submitBtn}</span>
                          </>
                        )}
                      </button>
                    </div>
                  </form>
                </div>
              )}
            </div>
          </div>

        </div>

        {/* Live GIS Map Section (decreased width from left & right) */}
        <div ref={mapRef} className="mt-12 max-w-5xl mx-auto px-2 sm:px-4">
          {isMapInView ? (
            <FarmMap />
          ) : (
            <div className="h-[320px] sm:h-[380px] rounded-3xl bg-stone-900/5 border border-stone-800/10" />
          )}
        </div>

      </div>
    </div>
  );
};
