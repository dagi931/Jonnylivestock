import { Router, Request, Response } from 'express';
import { PACKAGE_CATALOG } from '../data/packagesData.js';
import { PostgresDB } from '../db/postgresDb.js';
import { authenticateToken, requireAdmin, optionalAuth, AuthRequest } from '../middleware/auth.middleware.js';
import { uploadAdminMedia } from '../middleware/upload.middleware.js';
import { sanitizeErrorMessage } from '../utils/errorHandler.js';
import { validatePackageLivestock } from '../utils/packageValidators.js';

const router = Router();

// ==================== GET PACKAGE CATALOG & PRE-MADE BUNDLES ====================
router.get('/', async (_req: Request, res: Response): Promise<void> => {
  try {
    const preMadePackages = await PostgresDB.getPackages();
    res.json({
      success: true,
      catalog: PACKAGE_CATALOG,
      preMadePackages,
      rules: {
        minCategoriesForFreeDelivery: 3,
        freeDelivery: true,
        reservationDepositPercent: 50
      }
    });
  } catch (error: any) {
    console.error('Error fetching packages:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch packages' });
  }
});

router.get('/catalog', (_req: Request, res: Response): void => {
  res.json({
    success: true,
    data: PACKAGE_CATALOG
  });
});

router.get('/premade', async (_req: Request, res: Response): Promise<void> => {
  try {
    const data = await PostgresDB.getPackages();
    res.json({
      success: true,
      data
    });
  } catch (error: any) {
    console.error('Error fetching premade packages:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch premade packages' });
  }
});

// ==================== ADMIN: CREATE PACKAGE ====================
router.post('/', authenticateToken, requireAdmin, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const {
      name,
      amharicName,
      tagline,
      description,
      items,
      originalPrice,
      packagePrice,
      badge,
      image,
      featured,
      totalSlots,
      availableSlots
    } = req.body;

    if (!name || !description || !image || originalPrice === undefined || packagePrice === undefined) {
      res.status(400).json({
        success: false,
        error: 'Missing required package fields: name, description, image, originalPrice, packagePrice'
      });
      return;
    }

    // Validate image URL: reject insecure non-localhost HTTP or malformed URLs
    const isValidImageUrl = (url: any): boolean => {
      if (typeof url !== 'string' || !url.trim()) return false;
      const trimmed = url.trim();
      try {
        const parsed = new URL(trimmed);
        if (parsed.protocol === 'https:') return true;
        if (parsed.protocol === 'http:' && (parsed.hostname === 'localhost' || parsed.hostname === '127.0.0.1')) return true;
        return false;
      } catch {
        return trimmed.startsWith('/uploads/') && /\.(jpe?g|png|webp|avif)$/i.test(trimmed);
      }
    };

    if (!isValidImageUrl(image)) {
      res.status(400).json({
        success: false,
        error: 'Invalid package image URL. Insecure HTTP URLs (like http://...) are rejected; images must use HTTPS or valid local upload paths.'
      });
      return;
    }

    const created = await PostgresDB.createPackage({
      name,
      amharicName,
      tagline,
      description,
      items: Array.isArray(items) ? items : [],
      originalPrice: Number(originalPrice),
      packagePrice: Number(packagePrice),
      badge: badge || 'Special Package',
      image,
      featured: Boolean(featured),
      totalSlots: totalSlots !== undefined ? Number(totalSlots) : 10,
      availableSlots: availableSlots !== undefined ? Number(availableSlots) : (totalSlots !== undefined ? Number(totalSlots) : 10)
    });

    res.status(201).json({
      success: true,
      message: 'Celebration package created successfully!',
      data: created
    });
  } catch (error: any) {
    console.error('Error creating package:', error);
    res.status(500).json({ success: false, error: 'Failed to create celebration package' });
  }
});

// ==================== ADMIN: UPDATE PACKAGE SLOTS ====================
router.patch('/:id/slots', authenticateToken, requireAdmin, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { availableSlots, totalSlots } = req.body;
    if (availableSlots === undefined) {
      res.status(400).json({ success: false, error: 'availableSlots is required' });
      return;
    }

    const updated = await PostgresDB.updatePackageSlots(
      req.params.id,
      Number(availableSlots),
      totalSlots !== undefined ? Number(totalSlots) : undefined
    );

    if (!updated) {
      res.status(404).json({ success: false, error: 'Package not found' });
      return;
    }

    res.json({
      success: true,
      message: 'Package slots updated successfully',
      data: updated
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: sanitizeErrorMessage(error, 'Failed to update slots') });
  }
});

// ==================== ADMIN: DELETE PACKAGE ====================
router.delete('/:id', authenticateToken, requireAdmin, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const success = await PostgresDB.deletePackage(req.params.id);
    if (!success) {
      res.status(404).json({ success: false, error: 'Package not found' });
      return;
    }
    res.json({
      success: true,
      message: 'Celebration package deleted successfully!'
    });
  } catch (error: any) {
    console.error('Error deleting package:', error);
    res.status(500).json({ success: false, error: 'Failed to delete package' });
  }
});

// ==================== ADMIN: UPLOAD PACKAGE IMAGE ====================
router.post('/upload-image', authenticateToken, requireAdmin, uploadAdminMedia.single('image'), (req: AuthRequest, res: Response): void => {
  try {
    if (!req.file) {
      res.status(400).json({ success: false, error: 'No image file uploaded' });
      return;
    }
    const imageUrl = `/uploads/${req.file.filename}`;
    res.json({ success: true, url: imageUrl });
  } catch (error: any) {
    console.error('Error uploading package image:', error);
    res.status(500).json({ success: false, error: 'Failed to upload image' });
  }
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

    // Check mandatory livestock requirement: Must include Cow/Ox or Sheep/Goat
    const livestockValidation = validatePackageLivestock(items);
    if (!livestockValidation.hasLivestock) {
      res.status(400).json({
        success: false,
        error: 'Custom celebration packages must include at least one livestock animal (Cow, Ox, Sheep, or Goat).'
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
