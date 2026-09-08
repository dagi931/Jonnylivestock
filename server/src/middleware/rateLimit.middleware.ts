import rateLimit from 'express-rate-limit';

// Standard error response formatter
const createRateLimitResponse = (message: string) => ({
  success: false,
  error: message
});

// Helper to identify localhost / loopback traffic
const isLocalhost = (req: any): boolean => {
  // In production, rate limiting must ALWAYS be enforced - never skipped
  if (process.env.NODE_ENV === 'production') {
    return false;
  }
  // In development/testing only, allow forcing rate limits via test header
  if (req.headers['x-test-rate-limit'] === 'true') {
    return false;
  }
  const ip = req.ip || req.connection?.remoteAddress || '';
  return (
    ip === '127.0.0.1' ||
    ip === '::1' ||
    ip === '::ffff:127.0.0.1' ||
    ip.includes('127.0.0.1')
  );
};

/**
 * Global API rate limiter (protects all /api endpoints from DDoS)
 * Skips localhost/dev and allows up to 5000 requests per 15 minutes.
 */
export const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5000,
  skip: (req) => isLocalhost(req),
  standardHeaders: true,
  legacyHeaders: false,
  message: createRateLimitResponse('Too many requests from this IP address. Please try again in a few minutes.')
});

/**
 * Rate limiter for sending OTPs via Email/SMS (Brevo quota protection)
 * Allows max 15 requests per 15 minutes per IP (skips localhost).
 */
export const otpLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 15,
  skip: (req) => isLocalhost(req),
  standardHeaders: true,
  legacyHeaders: false,
  message: createRateLimitResponse('Too many OTP verification code requests. Please wait a few minutes before requesting another code.')
});

/**
 * Rate limiter for authentication (Login, Register, OTP verification)
 * Protects against brute-force attacks.
 * - Skips successful logins so legitimate users are NEVER penalized!
 * - Skips localhost / local development.
 * - Allows up to 60 failed attempts per 15 minutes.
 */
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 60,
  skipSuccessfulRequests: true, // Only count failed login attempts!
  skip: (req) => isLocalhost(req),
  standardHeaders: true,
  legacyHeaders: false,
  message: createRateLimitResponse('Too many failed authentication attempts. Please try again after 15 minutes.')
});

/**
 * Rate limiter for creating Orders
 * Prevents automated spam submissions.
 */
export const orderContactLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100,
  skip: (req) => isLocalhost(req),
  standardHeaders: true,
  legacyHeaders: false,
  message: createRateLimitResponse('Too many submissions. Please wait a few minutes before submitting again.')
});

/**
 * Dedicated rate limiter for Contact inquiries
 * Limits to 15 inquiries per 15 minutes per IP.
 */
export const contactLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 15,
  skip: (req) => isLocalhost(req),
  standardHeaders: true,
  legacyHeaders: false,
  message: createRateLimitResponse('Too many contact inquiries submitted. Please wait a few minutes before submitting again.')
});
