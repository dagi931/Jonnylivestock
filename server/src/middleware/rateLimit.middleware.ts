import rateLimit from 'express-rate-limit';

// Standard error response formatter
const createRateLimitResponse = (message: string) => ({
  success: false,
  error: message
});

/**
 * Global API rate limiter (protects all /api endpoints from general scraping / DDoS)
 * Allows up to 150 requests per 15 minutes per IP.
 */
export const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 150,
  standardHeaders: true, // Return standard RateLimit headers in response
  legacyHeaders: false,
  message: createRateLimitResponse('Too many requests from this IP address. Please try again in 15 minutes.')
});

/**
 * Strict rate limiter for sending OTPs via Email/SMS (Brevo quota protection)
 * Allows max 5 requests per 15 minutes per IP.
 */
export const otpLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: createRateLimitResponse('Too many OTP verification code requests. Please wait 15 minutes before requesting another code.')
});

/**
 * Rate limiter for authentication (Login, Register, OTP verification)
 * Protects against password & 6-digit OTP brute-force attacks.
 * Allows max 10 attempts per 15 minutes per IP.
 */
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: createRateLimitResponse('Too many authentication attempts. Please try again after 15 minutes.')
});

/**
 * Rate limiter for creating Orders and Contact inquiries
 * Prevents automated spam orders and duplicate inquiries.
 * Allows max 15 submissions per 15 minutes per IP.
 */
export const orderContactLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 15,
  standardHeaders: true,
  legacyHeaders: false,
  message: createRateLimitResponse('Too many submissions. Please wait a few minutes before submitting again.')
});
