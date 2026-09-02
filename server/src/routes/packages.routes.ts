import { Router, Request, Response } from 'express';
import { PACKAGE_CATALOG, PRE_MADE_PACKAGES } from '../data/packagesData.js';
import { PostgresDB } from '../db/postgresDb.js';
import { authenticateToken, optionalAuth, AuthRequest } from '../middleware/auth.middleware.js';

const router = Router();

// ==================== GET PACKAGE CATALOG & PRE-MADE BUNDLES ====================
router.get('/', (_req: Request, res: Response): void => {
  res.json({
    success: true,
    catalog: PACKAGE_CATALOG,
    preMadePackages: PRE_MADE_PACKAGES,
    rules: {
      minCategoriesForFreeDelivery: 3,
      freeDelivery: true,
      reservationDepositPercent: 50
    }
  });
});

router.get('/catalog', (_req: Request, res: Response): void => {
  res.json({
    success: true,
    data: PACKAGE_CATALOG
  });
});

router.get('/premade', (_req: Request, res: Response): void => {
  res.json({
    success: true,
    data: PRE_MADE_PACKAGES
  });
});

// ==================== GET USER'S SAVED PACKAGES ====================
router.get('/saved', authenticateToken, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    const saved = await PostgresDB.getSavedPackages(userId);
    res.json({
      success: true,
      count: saved.length,
      data: saved
    });
  } catch (error: any) {
    console.error('Error fetching saved packages:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch saved packages' });
  }
});

// ==================== SAVE A CUSTOM PACKAGE ====================
router.post('/saved', authenticateToken, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { name, description, items, totalPrice } = req.body;

    if (!name || !items || !Array.isArray(items) || items.length === 0) {
      res.status(400).json({
        success: false,
        error: 'Package name and at least one item are required'
      });
      return;
    }

    // Check category count
    const uniqueCategories = new Set(items.map((i: any) => i.category));
    if (uniqueCategories.size < 3) {
      res.status(400).json({
        success: false,
        error: 'Packages must include items from at least 3 categories (Meat/Livestock, Wine, Eggs, Flowers) to qualify for package benefits and free delivery.'
      });
      return;
    }

    const saved = await PostgresDB.createSavedPackage({
      userId: req.user?.id,
      name: name.trim(),
      description: description ? description.trim() : undefined,
      items,
      totalPrice: Number(totalPrice)
    });

    res.status(201).json({
      success: true,
      message: 'Package saved to your collection successfully!',
      data: saved
    });
  } catch (error: any) {
    console.error('Error saving package:', error);
    res.status(500).json({ success: false, error: 'Failed to save package' });
  }
});

// ==================== DELETE SAVED PACKAGE ====================
router.delete('/saved/:id', authenticateToken, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    const success = await PostgresDB.deleteSavedPackage(req.params.id, userId);

    if (!success) {
      res.status(404).json({ success: false, error: 'Saved package not found' });
      return;
    }

    res.json({
      success: true,
      message: 'Package removed from saved collection'
    });
  } catch (error: any) {
    console.error('Error deleting saved package:', error);
    res.status(500).json({ success: false, error: 'Failed to delete saved package' });
  }
});

export default router;
