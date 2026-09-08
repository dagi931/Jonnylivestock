import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';

const JWT_SECRET = process.env.JWT_SECRET || 'jonny_livestock_jwt_secret_key_2026';
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'jonny_livestock_jwt_refresh_secret_key_2026';

export interface ReceiptTokenPayload {
  orderId: string;
  userId?: string;
  role?: string;
  phone?: string;
  tokenType: 'receipt';
  jti?: string;
}

export interface AuthRequest extends Request {
  user?: {
    id: string;
    email: string;
    role: 'customer' | 'admin';
    name: string;
    phone?: string;
  };
  receiptTokenData?: ReceiptTokenPayload;
}

/**
 * Extracts a named cookie from Express `req.headers.cookie` without requiring third-party middleware.
 */
export const extractCookie = (req: Request, name: string): string | null => {
  const cookieHeader = req.headers?.cookie;
  if (!cookieHeader || typeof cookieHeader !== 'string') return null;
  const match = cookieHeader.match(new RegExp(`(?:^|;\\s*)${name}=([^;]*)`));
  return match ? decodeURIComponent(match[1]) : null;
};

export const authenticateToken = (req: AuthRequest, res: Response, next: NextFunction): void => {
  const authHeader = req.headers['authorization'];
  const queryToken = typeof req.query?.token === 'string' ? req.query.token : null;
  const cookieToken = extractCookie(req, 'jonny_access_token');
  const token = (authHeader && authHeader.startsWith('Bearer ') ? authHeader.split(' ')[1] : null) || queryToken || cookieToken;

  if (!token) {
    res.status(401).json({ success: false, error: 'Access token required. Direct unauthorized access forbidden.' });
    return;
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET, { algorithms: ['HS256'] }) as {
      id: string;
      email: string;
      role: 'customer' | 'admin';
      name: string;
      phone?: string;
      tokenType?: string;
      jti?: string;
    };

    if (decoded.tokenType && decoded.tokenType !== 'access') {
      res.status(401).json({ success: false, error: 'Invalid token type. Access token required.' });
      return;
    }

    req.user = decoded;
    next();
  } catch {
    res.status(401).json({ success: false, error: 'Invalid or expired token. Please log in again.' });
  }
};

export const optionalAuth = (req: AuthRequest, res: Response, next: NextFunction): void => {
  const authHeader = req.headers['authorization'];
  const queryToken = typeof req.query?.token === 'string' ? req.query.token : null;
  const cookieToken = extractCookie(req, 'jonny_access_token') || extractCookie(req, 'jonny_receipt_token');
  const token = (authHeader && authHeader.startsWith('Bearer ') ? authHeader.split(' ')[1] : null) || queryToken || cookieToken;

  if (token) {
    try {
      const decoded = jwt.verify(token, JWT_SECRET, { algorithms: ['HS256'] }) as any;
      if (!decoded.tokenType || decoded.tokenType === 'access') {
        req.user = decoded;
      } else if (decoded.tokenType === 'receipt') {
        req.receiptTokenData = decoded;
      }
    } catch {
      // Ignore error for optional auth
    }
  }
  next();
};

export const requireAdmin = (req: AuthRequest, res: Response, next: NextFunction): void => {
  if (!req.user || req.user.role !== 'admin') {
    res.status(403).json({
      success: false,
      error: 'Forbidden: Admin authorization required. Direct requests without valid admin credentials are rejected.'
    });
    return;
  }
  next();
};

export interface UserTokenPayload {
  id: string;
  email: string;
  role: 'customer' | 'admin';
  name: string;
  phone?: string;
}

/**
 * Generates a short-lived access token valid for 15 minutes.
 */
export const generateAccessToken = (payload: UserTokenPayload): string => {
  return jwt.sign(
    {
      ...payload,
      tokenType: 'access',
      jti: uuidv4()
    },
    JWT_SECRET,
    { expiresIn: '15m' }
  );
};

/**
 * Generates a long-lived refresh token valid for 7 days.
 */
export const generateRefreshToken = (payload: UserTokenPayload): string => {
  return jwt.sign(
    {
      id: payload.id,
      email: payload.email,
      role: payload.role,
      name: payload.name,
      tokenType: 'refresh',
      jti: uuidv4()
    },
    JWT_REFRESH_SECRET,
    { expiresIn: '7d' }
  );
};

/**
 * Helper to generate both Access Token (15m) and Refresh Token (7d) together.
 */
export const generateTokens = (payload: UserTokenPayload) => {
  const accessToken = generateAccessToken(payload);
  const refreshToken = generateRefreshToken(payload);
  return {
    token: accessToken,
    accessToken,
    refreshToken,
    expiresIn: 15 * 60 // 900 seconds (15 minutes)
  };
};

/**
 * Alias for backward compatibility.
 */
export const generateToken = generateAccessToken;

/**
 * Verifies a 7-day refresh token.
 */
export const verifyRefreshToken = (token: string): (UserTokenPayload & { jti?: string }) | null => {
  try {
    const decoded = jwt.verify(token, JWT_REFRESH_SECRET, { algorithms: ['HS256'] }) as any;
    if (decoded.tokenType && decoded.tokenType !== 'refresh') {
      return null;
    }
    return decoded;
  } catch {
    return null;
  }
};

/**
 * Generates a short-lived (default 120 seconds / 2 minutes) capability token strictly scoped to an individual order's receipt.
 * Cannot be used as an account access token on any other API routes.
 */
export const generateReceiptToken = (
  payload: { orderId: string; userId?: string; role?: string; phone?: string },
  expiresInSeconds: number = 120
): string => {
  return jwt.sign(
    {
      ...payload,
      tokenType: 'receipt',
      jti: uuidv4()
    },
    JWT_SECRET,
    { expiresIn: expiresInSeconds }
  );
};

/**
 * Sets an HttpOnly, Secure, SameSite cookie for the access token.
 * Defaults to SameSite=Lax to permit top-level navigations (e.g. <a target="_blank"> receipt previews).
 * Configurable via COOKIE_DOMAIN and COOKIE_SAME_SITE for subdomain or reverse-proxy architectures.
 */
export const setAuthCookie = (res: Response, token: string) => {
  const isProd = process.env.NODE_ENV === 'production';
  const sameSite = (process.env.COOKIE_SAME_SITE as 'lax' | 'strict' | 'none') || 'lax';
  const domain = process.env.COOKIE_DOMAIN ? process.env.COOKIE_DOMAIN.trim() : undefined;

  res.cookie('jonny_access_token', token, {
    httpOnly: true,
    secure: isProd,
    sameSite,
    path: '/',
    domain,
    maxAge: 15 * 60 * 1000 // 15 minutes
  });
};

/**
 * Clears the HttpOnly access token cookie using matching path and domain attributes.
 */
export const clearAuthCookie = (res: Response) => {
  const isProd = process.env.NODE_ENV === 'production';
  const sameSite = (process.env.COOKIE_SAME_SITE as 'lax' | 'strict' | 'none') || 'lax';
  const domain = process.env.COOKIE_DOMAIN ? process.env.COOKIE_DOMAIN.trim() : undefined;

  res.clearCookie('jonny_access_token', {
    httpOnly: true,
    secure: isProd,
    sameSite,
    path: '/',
    domain
  });
};

