/**
 * Ethiopian Phone Number Normalization & Validation Utility
 * Normalizes user input variations:
 * - 0911223344 -> 0911223344
 * - +251911223344 -> 0911223344
 * - 251911223344 -> 0911223344
 * - 911223344 -> 0911223344
 * - 0712345678 -> 0712345678 (Safaricom)
 * - +251712345678 -> 0712345678
 */

export function normalizeEthiopianPhone(phone: string | undefined | null): string {
  if (!phone) return '';
  // Strip all non-digit characters except leading +
  let cleaned = phone.trim().replace(/[\s\-\(\)\.]/g, '');

  // If starts with +251
  if (cleaned.startsWith('+251')) {
    cleaned = '0' + cleaned.slice(4);
  } else if (cleaned.startsWith('251') && cleaned.length >= 12) {
    cleaned = '0' + cleaned.slice(3);
  } else if ((cleaned.startsWith('9') || cleaned.startsWith('7')) && cleaned.length === 9) {
    cleaned = '0' + cleaned;
  }

  return cleaned;
}

export function isValidEthiopianPhone(phone: string | undefined | null): boolean {
  const normalized = normalizeEthiopianPhone(phone);
  // Valid Ethiopian mobile numbers start with 09 or 07 and are 10 digits total
  return /^0[79]\d{8}$/.test(normalized);
}
