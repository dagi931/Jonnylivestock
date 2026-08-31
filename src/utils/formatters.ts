import { business } from '../config/business';

export function formatPrice(price: number): string {
  return `${price.toLocaleString('en-US')} ${business.currency}`;
}

export function formatWeight(weight: number): string {
  return `${weight} kg`;
}

export function getWhatsAppLink(phone: string, text: string): string {
  const cleanPhone = phone.replace(/[^0-9]/g, '');
  return `https://wa.me/${cleanPhone}?text=${encodeURIComponent(text)}`;
}

export function getPhoneCallLink(phone: string): string {
  const cleanPhone = phone.replace(/\s+/g, '');
  return `tel:${cleanPhone}`;
}
