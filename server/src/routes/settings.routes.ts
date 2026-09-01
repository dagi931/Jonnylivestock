import { Router, Request, Response } from 'express';
import { JsonDB } from '../db/jsonDb.js';

const router = Router();

// ==================== GET BANK ACCOUNTS ====================
router.get('/bank-accounts', (_req: Request, res: Response): void => {
  try {
    const bankAccounts = JsonDB.getBankAccounts();
    res.json({ success: true, count: bankAccounts.length, data: bankAccounts });
  } catch (error: any) {
    console.error('Error fetching bank accounts:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch bank accounts' });
  }
});

// ==================== GET BUSINESS SETTINGS & ADMIN CONTACTS ====================
router.get('/business', (_req: Request, res: Response): void => {
  try {
    const settings = JsonDB.getSettings();
    res.json({ success: true, data: settings });
  } catch (error: any) {
    console.error('Error fetching business settings:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch business settings' });
  }
});

export default router;
