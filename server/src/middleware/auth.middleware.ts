import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';

const JWT_SECRET = process.env.JWT_SECRET || 'jonny_livestock_jwt_secret_key_2026';
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'jonny_livestock_jwt_refresh_secret_key_2026';

export interface AuthRequest extends Request {
  user?: {
    id: string;
    email: string;
    role: 'customer' | 'admin';
    name: string;
    phone?: string;
  };
}

export const authenticateToken = (req: AuthRequest, res: Response, next: NextFunction): void => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.startsWith('Bearer ') ? authHeader.split(' ')[1] : null;

  if (!token) {
    res.status(401).json({ success: false, error: 'Access token required. Direct unauthorized access forbidden.' });
    return;
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as {
      id: string;
      email: string;
      role: 'customer' | 'admin';
      name: string;
      phone?: string;
      jti?: string;
    };
    req.user = decoded;
    next();
  } catch {
    res.status(403).json({ success: false, error: 'Invalid or expired token. Please log in again.' });
  }
};

export const optionalAuth = (req: AuthRequest, res: Response, next: NextFunction): void => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.startsWith('Bearer ') ? authHeader.split(' ')[1] : null;

  if (token) {
    try {
      const decoded = jwt.verify(token, JWT_SECRET) as {
        id: string;
        email: string;
        role: 'customer' | 'admin';
        name: string;
        phone?: string;
        jti?: string;
      };
      req.user = decoded;
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
    const decoded = jwt.verify(token, JWT_REFRESH_SECRET) as any;
    return decoded;
  } catch {
    return null;
  }
};
