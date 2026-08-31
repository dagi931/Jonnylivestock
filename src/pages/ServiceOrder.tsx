import React from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';
import { DeliveryDashboard } from '../components/services/dashboards/DeliveryDashboard';
import { SlaughterPrepDashboard } from '../components/services/dashboards/SlaughterPrepDashboard';
import { CeremonyDashboard } from '../components/services/dashboards/CeremonyDashboard';
import { MeatByKgDashboard } from '../components/services/dashboards/MeatByKgDashboard';
import { FreshSheepDashboard } from '../components/services/dashboards/FreshSheepDashboard';
import { livestockServices } from '../data/services';
import { ArrowLeft, ChevronRight, PhoneCall, MessageSquare } from 'lucide-react';
import { business } from '../config/business';
import { getPhoneCallLink, getWhatsAppLink } from '../utils/formatters';

export const ServiceOrder: React.FC = () => {
  const { serviceId } = useParams<{ serviceId: string }>();
  const { theme } = useTheme();
  const isDark = theme === 'design7';
  const navigate = useNavigate();

  const currentService = livestockServices.find((s) => s.id === serviceId) || livestockServices[0];
  const activeServiceId = serviceId || 'delivery';

  return (
    <div className="min-h-screen py-6 sm:py-10">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Navigation Bar & Back Button */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-3">
            <Link
              to="/services"
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border transition-colors ${
                isDark
                  ? 'bg-[#2A1A0D] border-[#4A2C16] text-[#F4E8D0] hover:border-[#C58A3A]'
                  : 'bg-[#F1E8D8] border-[#E4D4BC] text-[#2A1A0D] hover:border-[#B8792F]'
              }`}
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to Services</span>
            </Link>

            <div className="flex items-center gap-1.5 text-xs opacity-70">
              <Link to="/services" className="hover:underline">Services</Link>
              <ChevronRight className="w-3 h-3" />
              <span className="font-semibold text-amber-500">{currentService.title}</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <a
              href={getWhatsAppLink(business.whatsapp, `Hello Jonny Livestock, I am on the ${currentService.title} dashboard and would like to order.`)}
              target="_blank"
              rel="noopener noreferrer"
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold border flex items-center gap-1.5 transition-colors ${
                isDark ? 'bg-[#2A1A0D] border-[#4A2C16] text-[#F4E8D0]' : 'bg-[#F1E8D8] border-[#E4D4BC] text-[#2A1A0D]'
              }`}
            >
              <MessageSquare className="w-3.5 h-3.5 text-green-500" />
              <span>WhatsApp Direct</span>
            </a>

            <a
              href={getPhoneCallLink(business.phone)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all shadow-xs ${
                isDark ? 'bg-[#C58A3A] hover:bg-[#E0B15A] text-[#1B1208]' : 'bg-[#B8792F] hover:bg-[#9E6523] text-[#FAF7F0]'
              }`}
            >
              <PhoneCall className="w-3.5 h-3.5" />
              <span>{business.displayPhone}</span>
            </a>
          </div>
        </div>

        {/* Service Switcher Bar */}
        <div className="mb-8">
          <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
            {livestockServices.map((service, index) => {
              const isActive = service.id === activeServiceId;

              return (
                <button
                  key={service.id}
                  type="button"
                  onClick={() => navigate(`/services/order/${service.id}`)}
                  className={`flex items-center gap-2 px-3.5 py-2 rounded-xl border transition-all shrink-0 text-xs ${
                    isActive
                      ? isDark
                        ? 'bg-[#C58A3A] text-[#1B1208] border-[#C58A3A] font-bold shadow-xs'
                        : 'bg-[#B8792F] text-[#FAF7F0] border-[#B8792F] font-bold shadow-xs'
                      : isDark
                      ? 'bg-[#2A1A0D] border-[#4A2C16] text-[#D8C5A8] hover:bg-[#1B1208]'
                      : 'bg-[#F1E8D8] border-[#E4D4BC] text-[#746556] hover:bg-[#F1E8D8]/50'
                  }`}
                >
                  <span className="font-mono font-bold opacity-75">0{index + 1}</span>
                  <span className="truncate max-w-[150px]">{service.title}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Dedicated Service Order Dashboard */}
        <div>
          {activeServiceId === 'delivery' && <DeliveryDashboard />}
          {activeServiceId === 'slaughter-prep' && <SlaughterPrepDashboard />}
          {activeServiceId === 'events-ceremonies' && <CeremonyDashboard />}
          {activeServiceId === 'meat-by-kg' && <MeatByKgDashboard />}
          {activeServiceId === 'fresh-slaughtered-sheep' && <FreshSheepDashboard />}
        </div>

      </div>
    </div>
  );
};
