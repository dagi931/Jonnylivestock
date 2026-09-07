import { Router, Request, Response } from 'express';
import { PostgresDB } from '../db/postgresDb.js';
import { authenticateToken, requireAdmin, AuthRequest } from '../middleware/auth.middleware.js';

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

// ==================== GET RAW MEAT PRICING (Public) ====================
router.get('/meat-pricing', async (_req: Request, res: Response): Promise<void> => {
  try {
    const pricing = await PostgresDB.getRawMeatPricing();
    res.json({ success: true, data: pricing });
  } catch (error: any) {
    console.error('Error fetching raw meat pricing:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch raw meat pricing' });
  }
});

// ==================== UPDATE RAW MEAT PRICING (Admin only) ====================
router.put('/meat-pricing', authenticateToken, requireAdmin, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { kurtPrice, kitfoPrice, tibsWotPrice, available } = req.body;
    if (!kurtPrice || !kitfoPrice || !tibsWotPrice) {
      res.status(400).json({ success: false, error: 'Prices for Kurt, Kitfo, and Tibs/Wot are required' });
      return;
    }

    const updated = await PostgresDB.updateRawMeatPricing({
      kurtPrice: Number(kurtPrice),
      kitfoPrice: Number(kitfoPrice),
      tibsWotPrice: Number(tibsWotPrice),
      available: available !== undefined ? Boolean(available) : true
    });

    res.json({ success: true, message: 'Raw meat pricing updated successfully', data: updated });
  } catch (error: any) {
    console.error('Error updating raw meat pricing:', error);
    res.status(500).json({ success: false, error: 'Failed to update raw meat pricing' });
  }
});

// ==================== GET SLAUGHTER & SERVICES PRICING (Public) ====================
router.get('/slaughter-pricing', async (_req: Request, res: Response): Promise<void> => {
  try {
    const pricing = await PostgresDB.getSlaughterPricing();
    res.json({ success: true, data: pricing });
  } catch (error: any) {
    console.error('Error fetching slaughter pricing:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch slaughter pricing' });
  }
});

// ==================== UPDATE SLAUGHTER & SERVICES PRICING (Admin only) ====================
router.put('/slaughter-pricing', authenticateToken, requireAdmin, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { slaughterFee, travelFee } = req.body;
    if (slaughterFee === undefined && travelFee === undefined) {
      res.status(400).json({ success: false, error: 'Slaughter fee or travel fee is required' });
      return;
    }

    const updated = await PostgresDB.updateSlaughterPricing({
      slaughterFee: Number(slaughterFee),
      travelFee: travelFee !== undefined ? Number(travelFee) : undefined
    });

    res.json({ success: true, message: 'Slaughter and services pricing updated successfully', data: updated });
  } catch (error: any) {
    console.error('Error updating slaughter pricing:', error);
    res.status(500).json({ success: false, error: 'Failed to update slaughter pricing' });
  }
});

export default router;

