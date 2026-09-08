import { Router, Request, Response } from 'express';
import { DeliveryService } from '../services/delivery.service.js';
import { authenticateToken, requireAdmin, AuthRequest } from '../middleware/auth.middleware.js';
import { ADDIS_ABABA_LOCATIONS, AWARE_FARM_LOCATION } from '../data/addisLocations.js';
import { DeliveryLoadItem, VehicleTypeId } from '../types/index.js';
import { sanitizeErrorMessage } from '../utils/errorHandler.js';

const router = Router();

// ==================== GET ADDIS ABABA LOCATIONS PRESETS ====================
router.get('/locations', (_req: Request, res: Response) => {
  res.json({
    success: true,
    farmLocation: AWARE_FARM_LOCATION,
    locations: ADDIS_ABABA_LOCATIONS
  });
});

// ==================== REVERSE GEOCODE (LAT/LNG -> ACCURATE PLACE NAME) ====================
router.get('/reverse-geocode', async (req: Request, res: Response): Promise<void> => {
  try {
    const lat = Number(req.query.lat);
    const lng = Number(req.query.lng);

    if (isNaN(lat) || isNaN(lng) || lat < -90 || lat > 90 || lng < -180 || lng > 180) {
      res.status(400).json({ success: false, error: 'Valid latitude (-90 to 90) and longitude (-180 to 180) are required' });
      return;
    }

    const result = await DeliveryService.reverseGeocode(lat, lng);
    res.json({
      success: true,
      data: result
    });
  } catch (error: any) {
    console.error('Error reverse geocoding:', error);
    res.status(500).json({ success: false, error: 'Failed to reverse geocode location' });
  }
});

// ==================== SEARCH PLACES (AUTOCOMPLETE & NOMINATIM) ====================
router.get('/search-places', async (req: Request, res: Response): Promise<void> => {
  try {
    if (req.query.q === undefined || !String(req.query.q).trim()) {
      res.status(400).json({ success: false, error: 'Search query parameter (q) is required' });
      return;
    }
    const query = String(req.query.q).trim();

    const results = await DeliveryService.searchPlaces(query);
    res.json({
      success: true,
      data: results
    });
  } catch (error: any) {
    console.error('Error searching places:', error);
    res.status(500).json({ success: false, error: 'Failed to search places' });
  }
});

// ==================== GET DRIVING ROAD ROUTE & EXACT DISTANCE ====================
router.get('/route', async (req: Request, res: Response): Promise<void> => {
  try {
    const lat = Number(req.query.lat ?? req.query.destLat);
    const lng = Number(req.query.lng ?? req.query.destLng);

    if (isNaN(lat) || isNaN(lng) || lat < -90 || lat > 90 || lng < -180 || lng > 180) {
      res.status(400).json({ success: false, error: 'Valid latitude (-90 to 90) and longitude (-180 to 180) are required' });
      return;
    }

    await DeliveryService.ensureDeliveryDefaults();
    const settings = await DeliveryService.getDeliverySettings();
    const result = await DeliveryService.calculateRoadDistance(
      settings.pickupLatitude,
      settings.pickupLongitude,
      lat,
      lng
    );

    const categoryInfo = DeliveryService.getDistanceCategory(result.distanceKm, settings);

    res.json({
      success: true,
      data: {
        distanceKm: result.distanceKm,
        estimatedDurationMinutes: result.estimatedDurationMinutes,
        isFallback: result.isFallback,
        routeCoordinates: result.routeCoordinates,
        isWithinRange: categoryInfo.isWithinRange,
        distanceCategory: categoryInfo.category,
        distanceCategoryLabel: categoryInfo.label,
        amharicCategoryLabel: categoryInfo.amharicLabel,
        pickupLocation: {
          lat: settings.pickupLatitude,
          lng: settings.pickupLongitude,
          address: settings.pickupAddress
        }
      }
    });
  } catch (error: any) {
    console.error('Error calculating driving route:', error);
    res.status(500).json({ success: false, error: 'Failed to calculate driving route' });
  }
});

// ==================== GET DELIVERY CONFIG & VEHICLES ====================
router.get('/config', async (_req: Request, res: Response): Promise<void> => {
  try {
    await DeliveryService.ensureDeliveryDefaults();
    const settings = await DeliveryService.getDeliverySettings();
    const vehicles = await DeliveryService.getVehicleConfigs();

    res.json({
      success: true,
      settings,
      vehicles
    });
  } catch (error: any) {
    console.error('Error fetching delivery config:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch delivery configuration' });
  }
});

// ==================== POST LIVE DELIVERY QUOTE ====================
router.post('/quote', async (req: Request, res: Response): Promise<void> => {
  try {
    const { deliveryAddress, deliveryLat, deliveryLng, vehicleType, items } = req.body;

    if (
      deliveryLat === undefined ||
      deliveryLat === null ||
      deliveryLat === '' ||
      deliveryLng === undefined ||
      deliveryLng === null ||
      deliveryLng === ''
    ) {
      res.status(400).json({
        success: false,
        error: 'Delivery latitude and longitude are required to calculate road distance'
      });
      return;
    }

    const lat = Number(deliveryLat);
    const lng = Number(deliveryLng);

    if (isNaN(lat) || isNaN(lng) || !isFinite(lat) || !isFinite(lng)) {
      res.status(400).json({
        success: false,
        error: 'Invalid coordinates provided'
      });
      return;
    }

    if (lat < -90 || lat > 90) {
      res.status(400).json({
        success: false,
        error: 'Delivery latitude must be between -90 and 90'
      });
      return;
    }

    if (lng < -180 || lng > 180) {
      res.status(400).json({
        success: false,
        error: 'Delivery longitude must be between -180 and 180'
      });
      return;
    }

    const validVehicleTypes = ['car', 'pickup', 'large_pickup'];
    if (vehicleType && !validVehicleTypes.includes(vehicleType)) {
      res.status(400).json({
        success: false,
        error: `Invalid vehicle type "${vehicleType}". Allowed types are: ${validVehicleTypes.join(', ')}`
      });
      return;
    }

    // Parse delivery items
    let parsedItems: DeliveryLoadItem[] = [];
    if (Array.isArray(items)) {
      parsedItems = items;
    } else if (typeof items === 'string') {
      try {
        parsedItems = JSON.parse(items);
      } catch {
        res.status(400).json({
          success: false,
          error: 'Malformed items JSON provided'
        });
        return;
      }
    }

    // Validate load item quantities and weights
    for (const item of parsedItems) {
      if (item.quantity !== undefined) {
        const q = Number(item.quantity);
        if (isNaN(q) || q <= 0 || !Number.isInteger(q) || q > 10000) {
          res.status(400).json({
            success: false,
            error: 'Item quantity must be a positive integer between 1 and 10,000'
          });
          return;
        }
      }
      if (item.weightKg !== undefined) {
        const w = Number(item.weightKg);
        if (isNaN(w) || w <= 0 || w > 50000) {
          res.status(400).json({
            success: false,
            error: 'Item weight must be a positive number up to 50,000 kg'
          });
          return;
        }
      }
    }

    const quote = await DeliveryService.calculateQuote({
      deliveryAddress,
      deliveryLat: lat,
      deliveryLng: lng,
      items: parsedItems
    });

    res.json(quote);
  } catch (error: any) {
    console.error('Error calculating delivery quote:', error);
    res.status(500).json({ success: false, error: sanitizeErrorMessage(error, 'Failed to calculate delivery quote') });
  }
});

// ==================== ADMIN: UPDATE DELIVERY SETTINGS & VEHICLES ====================
router.put('/config', authenticateToken, requireAdmin, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { settings, vehicles } = req.body;

    let updatedSettings = null;
    if (settings) {
      const normalizedSettings = {
        pickupAddress: settings.pickupAddress || settings.defaultOriginName,
        pickupLatitude:
          settings.pickupLatitude !== undefined
            ? Number(settings.pickupLatitude)
            : settings.defaultOriginLat !== undefined
            ? Number(settings.defaultOriginLat)
            : undefined,
        pickupLongitude:
          settings.pickupLongitude !== undefined
            ? Number(settings.pickupLongitude)
            : settings.defaultOriginLng !== undefined
            ? Number(settings.defaultOriginLng)
            : undefined,
        maxDistanceKm:
          settings.maxDistanceKm !== undefined ? Number(settings.maxDistanceKm) : undefined,
        shortDistanceMaxKm:
          settings.shortDistanceMaxKm !== undefined ? Number(settings.shortDistanceMaxKm) : undefined,
        mediumDistanceMaxKm:
          settings.mediumDistanceMaxKm !== undefined ? Number(settings.mediumDistanceMaxKm) : undefined
      };
      updatedSettings = await DeliveryService.updateDeliverySettings(normalizedSettings);
    }

    const updatedVehicles = [];
    if (Array.isArray(vehicles)) {
      for (const v of vehicles) {
        if (v.id) {
          const updatedV = await DeliveryService.updateVehicleConfig(v.id as VehicleTypeId, v);
          if (updatedV) updatedVehicles.push(updatedV);
        }
      }
    }

    res.json({
      success: true,
      message: 'Delivery configuration updated successfully',
      settings: updatedSettings || (await DeliveryService.getDeliverySettings()),
      vehicles: updatedVehicles.length > 0 ? updatedVehicles : (await DeliveryService.getVehicleConfigs())
    });
  } catch (error: any) {
    console.error('Error updating delivery config:', error);
    res.status(500).json({ success: false, error: sanitizeErrorMessage(error, 'Failed to update delivery configuration') });
  }
});

// ==================== ADMIN: TEST ROUTE / SIMULATOR ====================
router.post('/test-route', authenticateToken, requireAdmin, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { pickupLat, pickupLng, deliveryLat, deliveryLng } = req.body;

    const pLat = Number(pickupLat) || 9.0182;
    const pLng = Number(pickupLng) || 38.7750;
    const dLat = Number(deliveryLat);
    const dLng = Number(deliveryLng);

    const result = await DeliveryService.calculateRoadDistance(pLat, pLng, dLat, dLng);
    res.json({
      success: true,
      ...result
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: sanitizeErrorMessage(error, 'Failed to calculate test route') });
  }
});

export default router;
