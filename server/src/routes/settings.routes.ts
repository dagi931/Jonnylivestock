import { Router, Request, Response } from 'express';
import { PostgresDB } from '../db/postgresDb.js';

const router = Router();

// ==================== GET BANK ACCOUNTS ====================
router.get('/bank-accounts', async (_req: Request, res: Response): Promise<void> => {
  try {
    const bankAccounts = await PostgresDB.getBankAccounts();
    res.json({ success: true, count: bankAccounts.length, data: bankAccounts });
  } catch (error: any) {
    console.error('Error fetching bank accounts:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch bank accounts' });
  }
});

// ==================== GET BUSINESS SETTINGS & ADMIN CONTACTS ====================
router.get('/business', async (_req: Request, res: Response): Promise<void> => {
  try {
    const settings = await PostgresDB.getSettings();
    res.json({ success: true, data: settings });
  } catch (error: any) {
    console.error('Error fetching business settings:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch business settings' });
  }
});

export default router;
