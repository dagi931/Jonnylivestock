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

/**
 * Strips Amharic characters & brackets from text for clean English display
 */
export function cleanEnglishText(text?: string): string {
  if (!text) return '';
  return text
    .replace(/\s*\([\u1200-\u137F\s/]+\)\s*/g, ' ')
    .replace(/[\u1200-\u137F]+/g, '')
    .replace(/\s{2,}/g, ' ')
    .trim();
}

/**
 * Returns item name strictly according to active language:
 * - When in Amharic: returns amharicName (never mixing English)
 * - When in English: returns clean English (never mixing Amharic)
 */
export function getItemDisplayName(item: { name: string; amharicName?: string }, isAmharic: boolean): string {
  if (!item) return '';
  if (isAmharic) {
    if (item.amharicName) return item.amharicName;
    const match = item.name.match(/[\u1200-\u137F]+/g);
    if (match) return match.join(' ');
    return item.name;
  }
  return cleanEnglishText(item.name);
}

/**
 * Returns package title strictly according to active language
 */
export function getPackageTitle(pkg: { name: string; amharicName?: string }, isAmharic: boolean): string {
  if (!pkg) return '';
  if (isAmharic && pkg.amharicName) return pkg.amharicName;
  return cleanEnglishText(pkg.name);
}

/**
 * Returns package description strictly according to active language
 */
export function getPackageDescription(pkg: { description: string; amharicDescription?: string }, isAmharic: boolean): string {
  if (!pkg) return '';
  if (isAmharic && pkg.amharicDescription) return pkg.amharicDescription;
  return cleanEnglishText(pkg.description);
}

