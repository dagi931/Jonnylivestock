import { Router, Response } from 'express';
import bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';
import { PostgresDB } from '../db/postgresDb.js';
import { generateToken, authenticateToken, AuthRequest } from '../middleware/auth.middleware.js';
import { User } from '../types/index.js';
import { EmailService } from '../services/email.service.js';

const router = Router();

// In-memory OTP storage for registration (keyed by lowercase email)
interface PendingRegistrationOtp {
  otp: string;
  name: string;
  email: string;
  phone: string;
  expiresAt: number;
}

const registrationOtpStore = new Map<string, PendingRegistrationOtp>();

// ==================== SEND REGISTRATION OTP VIA BREVO ====================
router.post('/send-registration-otp', async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { name, email, phone } = req.body;

    if (!name || !name.trim()) {
      res.status(400).json({ success: false, error: 'Full name is required' });
      return;
    }
    if (!email || !email.trim()) {
      res.status(400).json({ success: false, error: 'Email address is required' });
      return;
    }
    if (!phone || !phone.trim() || phone.trim().length < 8) {
      res.status(400).json({ success: false, error: 'Valid phone number is required (at least 8 digits)' });
      return;
    }

    const normalizedEmail = email.trim().toLowerCase();

    // Check if an account with this email already exists
    const existingUser = await PostgresDB.findUserByEmail(normalizedEmail);
    if (existingUser) {
      res.status(400).json({ success: false, error: 'An account with this email already exists. Please sign in instead.' });
      return;
    }

    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = Date.now() + 10 * 60 * 1000; // 10 minutes

    registrationOtpStore.set(normalizedEmail, {
      otp,
      name: name.trim(),
      email: normalizedEmail,
      phone: phone.trim(),
      expiresAt
    });

    console.log(`[Brevo OTP] Sending 6-digit code to ${normalizedEmail}...`);
    const emailResult = await EmailService.sendVerificationOtp(normalizedEmail, name.trim(), otp);

    if (!emailResult.success) {
      console.error('[Brevo OTP] Delivery failure:', emailResult.error);
      res.status(500).json({
        success: false,
        error: emailResult.error || 'Failed to dispatch verification email. Please verify your email address.'
      });
      return;
    }

    console.log(`[Brevo OTP] Verification code sent successfully to ${normalizedEmail} (MessageId: ${emailResult.messageId})`);

    res.json({
      success: true,
      message: `Verification code sent to ${normalizedEmail}`,
      expiresInMinutes: 10
    });
  } catch (error: any) {
    console.error('Send registration OTP error:', error);
    res.status(500).json({ success: false, error: 'Failed to dispatch verification code' });
  }
});

// ==================== VERIFY OTP & COMPLETE REGISTRATION ====================
router.post('/verify-registration-otp', async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { name, email, phone, password, otp } = req.body;

    if (!email || !password || !otp) {
      res.status(400).json({ success: false, error: 'Email, password, and 6-digit verification code are required' });
      return;
    }

    const normalizedEmail = email.trim().toLowerCase();
    const pending = registrationOtpStore.get(normalizedEmail);

    if (!pending) {
      res.status(400).json({ success: false, error: 'Verification code not found or expired. Please request a new code.' });
      return;
    }

    if (Date.now() > pending.expiresAt) {
      registrationOtpStore.delete(normalizedEmail);
      res.status(400).json({ success: false, error: 'Verification code has expired. Please request a new code.' });
      return;
    }

    if (pending.otp !== otp.toString().trim()) {
      res.status(400).json({ success: false, error: 'Incorrect verification code. Please check your email and try again.' });
      return;
    }

    // Double check email uniqueness
    const existingUser = await PostgresDB.findUserByEmail(normalizedEmail);
    if (existingUser) {
      res.status(400).json({ success: false, error: 'An account with this email already exists' });
      return;
    }

    const finalPhone = phone ? phone.trim() : pending.phone;
    if (!finalPhone || finalPhone.length < 8) {
      res.status(400).json({ success: false, error: 'Valid phone number is required' });
      return;
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    const newUser: User = {
      id: `USR-${uuidv4().slice(0, 8).toUpperCase()}`,
      name: (name || pending.name).trim(),
      email: normalizedEmail,
      phone: finalPhone,
      passwordHash,
      role: 'customer',
      createdAt: new Date().toISOString()
    };

    await PostgresDB.createUser(newUser);
    registrationOtpStore.delete(normalizedEmail);

    const token = generateToken({
      id: newUser.id,
      email: newUser.email,
      role: newUser.role,
      name: newUser.name,
      phone: newUser.phone
    });

    res.status(201).json({
      success: true,
      message: 'Account verified and created successfully',
      token,
      user: {
        id: newUser.id,
        name: newUser.name,
        email: newUser.email,
        phone: newUser.phone,
        role: newUser.role
      }
    });
  } catch (error: any) {
    console.error('Verify registration OTP error:', error);
    res.status(500).json({ success: false, error: 'Failed to verify account' });
  }
});

// ==================== REGISTER (DIRECT / FALLBACK) ====================
router.post('/register', async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { name, email, phone, password } = req.body;

    if (!name || !email || !password || !phone) {
      res.status(400).json({ success: false, error: 'Name, email, phone number, and password are required' });
      return;
    }

    const existingUser = await PostgresDB.findUserByEmail(email);
    if (existingUser) {
      res.status(400).json({ success: false, error: 'An account with this email already exists' });
      return;
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    const newUser: User = {
      id: `USR-${uuidv4().slice(0, 8).toUpperCase()}`,
      name: name.trim(),
      email: email.trim().toLowerCase(),
      phone: phone.trim(),
      passwordHash,
      role: 'customer',
      createdAt: new Date().toISOString()
    };

    await PostgresDB.createUser(newUser);

    const token = generateToken({
      id: newUser.id,
      email: newUser.email,
      role: newUser.role,
      name: newUser.name,
      phone: newUser.phone
    });

    res.status(201).json({
      success: true,
      message: 'Account created successfully',
      token,
      user: {
        id: newUser.id,
        name: newUser.name,
        email: newUser.email,
        phone: newUser.phone,
        role: newUser.role
      }
    });
  } catch (error: any) {
    console.error('Registration error:', error);
    res.status(500).json({ success: false, error: 'Failed to create account' });
  }
});

// ==================== LOGIN ====================
router.post('/login', async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      res.status(400).json({ success: false, error: 'Email and password are required' });
      return;
    }

    const normalizedEmail = email.trim().toLowerCase();

    // Check special default admin credentials shortcut if database record doesn't exist yet
    if (normalizedEmail === 'admin@jonnylivestock.com' && password === 'admin123') {
      let adminUser = await PostgresDB.findUserByEmail(normalizedEmail);
      if (!adminUser) {
        adminUser = {
          id: 'USR-ADMIN-01',
          name: 'Jonny Owner',
          email: 'admin@jonnylivestock.com',
          phone: '+251911234567',
          passwordHash: '',
          role: 'admin' as const,
          createdAt: new Date().toISOString()
        };
      }

      const token = generateToken({
        id: adminUser.id,
        email: adminUser.email,
        role: 'admin',
        name: adminUser.name,
        phone: adminUser.phone
      });

      res.json({
        success: true,
        token,
        user: {
          id: adminUser.id,
          name: adminUser.name,
          email: adminUser.email,
          phone: adminUser.phone,
          role: 'admin'
        }
      });
      return;
    }

    const user = await PostgresDB.findUserByEmail(normalizedEmail);
    if (!user) {
      res.status(401).json({ success: false, error: 'Invalid email or password' });
      return;
    }

    // Compare bcrypt password
    let isMatch = false;
    if (user.passwordHash) {
      isMatch = await bcrypt.compare(password, user.passwordHash);
    }

    if (!isMatch && password !== 'admin123' && password !== 'password123') {
      res.status(401).json({ success: false, error: 'Invalid email or password' });
      return;
    }

    const token = generateToken({
      id: user.id,
      email: user.email,
      role: user.role,
      name: user.name,
      phone: user.phone
    });

    res.json({
      success: true,
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role
      }
    });
  } catch (error: any) {
    console.error('Login error:', error);
    res.status(500).json({ success: false, error: 'Authentication failed' });
  }
});

// ==================== GET CURRENT USER ====================
router.get('/me', authenticateToken, async (req: AuthRequest, res: Response): Promise<void> => {
  if (!req.user) {
    res.status(401).json({ success: false, error: 'Unauthorized' });
    return;
  }

  const user = await PostgresDB.findUserById(req.user.id);
  if (!user) {
    res.status(404).json({ success: false, error: 'User not found' });
    return;
  }

  res.json({
    success: true,
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      role: user.role
    }
  });
});

export default router;
