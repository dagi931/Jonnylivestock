import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';

const JWT_SECRET = process.env.JWT_SECRET || 'jonny_livestock_jwt_secret_key_2026';

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

export const generateToken = (payload: {
  id: string;
  email: string;
  role: 'customer' | 'admin';
  name: string;
  phone?: string;
}): string => {
  // Generate a uniquely keyed JWT token with unique UUID token identifier (jti)
  return jwt.sign(
    {
      ...payload,
      jti: uuidv4()
    },
    JWT_SECRET,
    { expiresIn: '7d' }
  );
};
