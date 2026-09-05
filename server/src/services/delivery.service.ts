import prisma from '../db/prisma.js';
import {
  VehicleTypeId,
  DistanceCategory,
  DeliveryVehicleConfig,
  DeliverySetting,
  DeliveryLoadItem,
  VehicleQuoteResult,
  DeliveryQuoteResponse
} from '../types/index.js';
import { ADDIS_ABABA_LOCATIONS, AWARE_FARM_LOCATION, AddisLocation } from '../data/addisLocations.js';

// Default initial vehicle configurations
export const DEFAULT_VEHICLE_CONFIGS: DeliveryVehicleConfig[] = [
  {
    id: 'car',
    name: 'Standard Car (መደበኛ መኪና)',
    amharicName: 'መደበኛ መኪና',
    description: 'Best for small orders: up to 2 Sheep/Goats, Raw Meat, Chickens, or Normal Products. (No cattle)',
    amharicDescription: 'ለአነስተኛ ትዕዛዞች፡ እስከ 2 በጎች/ፍየሎች፣ የታረደ ስጋ፣ ዶሮዎች ወይም መደበኛ እቃዎች።',
    icon: 'car',
    baseFee: 100,
    pricePerKm: 22,
    maxSheep: 2,
    maxGoats: 2,
    maxCattle: 0,
    maxChickens: 20,
    maxWeightKg: 60,
    isActive: true
  },
  {
    id: 'pickup',
    name: 'Pickup Truck (ፒክአፕ / Isuzu D-Max)',
    amharicName: 'ፒክአፕ / ዲ-ማክስ',
    description: 'Medium loads: up to 10 Sheep/Goats, heavy meat batches, bulk chickens, or multi-item packages. (No cattle)',
    amharicDescription: 'ለመካከለኛ ጭነቶች፡ እስከ 10 በጎች/ፍየሎች፣ የጅምላ ስጋ፣ በርካታ ዶሮዎች ወይም ጥቅሎች።',
    icon: 'truck',
    baseFee: 150,
    pricePerKm: 26,
    maxSheep: 10,
    maxGoats: 10,
    maxCattle: 0,
    maxChickens: 100,
    maxWeightKg: 600,
    isActive: true
  },
  {
    id: 'large_pickup',
    name: 'Large Pickup / Van (ትልቅ ፒክአፕ / ቫን / FSR)',
    amharicName: 'ትልቅ ፒክአፕ / ቫን / ኤፍኤስአር',
    description: 'Heavy & Large loads: 1–2 Live Cattle/Oxen, 10+ Sheep/Goats, large celebratory event packages.',
    amharicDescription: 'ለትላልቅ ጭነቶች፡ ከ1-2 በሬዎች/ሰንጋዎች፣ ከ10 በላይ በጎች ወይም ትላልቅ የበዓል ዝግጅቶች።',
    icon: 'van',
    baseFee: 200,
    pricePerKm: 36,
    maxSheep: 35,
    maxGoats: 35,
    maxCattle: 2,
    maxChickens: 500,
    maxWeightKg: 2000,
    isActive: true
  }
];

export const DEFAULT_DELIVERY_SETTING: DeliverySetting = {
  id: 'default',
  pickupAddress: AWARE_FARM_LOCATION.address,
  pickupLatitude: AWARE_FARM_LOCATION.lat,
  pickupLongitude: AWARE_FARM_LOCATION.lng,
  maxDistanceKm: 30.0,
  shortDistanceMaxKm: 10.0,
  mediumDistanceMaxKm: 20.0
};

export class DeliveryService {
  /**
   * Ensure default vehicle configurations and delivery settings are seeded in DB
   */
  public static async ensureDeliveryDefaults(): Promise<void> {
    try {
      const settingsCount = await prisma.deliverySetting.count();
      if (settingsCount === 0) {
        await prisma.deliverySetting.create({
          data: {
            id: 'default',
            pickupAddress: DEFAULT_DELIVERY_SETTING.pickupAddress,
            pickupLatitude: DEFAULT_DELIVERY_SETTING.pickupLatitude,
            pickupLongitude: DEFAULT_DELIVERY_SETTING.pickupLongitude,
            maxDistanceKm: DEFAULT_DELIVERY_SETTING.maxDistanceKm,
            shortDistanceMaxKm: DEFAULT_DELIVERY_SETTING.shortDistanceMaxKm,
            mediumDistanceMaxKm: DEFAULT_DELIVERY_SETTING.mediumDistanceMaxKm
          }
        });
      }

      for (const config of DEFAULT_VEHICLE_CONFIGS) {
        const existing = await prisma.deliveryVehicleConfig.findUnique({
          where: { id: config.id }
        });
        if (!existing) {
          await prisma.deliveryVehicleConfig.create({
            data: {
              id: config.id,
              name: config.name,
              amharicName: config.amharicName || null,
              description: config.description,
              amharicDescription: config.amharicDescription || null,
              icon: config.icon,
              baseFee: config.baseFee,
              pricePerKm: config.pricePerKm,
              maxSheep: config.maxSheep,
              maxGoats: config.maxGoats,
              maxCattle: config.maxCattle,
              maxChickens: config.maxChickens,
              maxWeightKg: config.maxWeightKg,
              isActive: config.isActive
            }
          });
        }
      }
    } catch (e) {
      console.error('Error ensuring delivery defaults in DB:', e);
    }
  }

  /**
   * Fetch current delivery settings
   */
  public static async getDeliverySettings(): Promise<DeliverySetting> {
    try {
      const setting = await prisma.deliverySetting.findUnique({
        where: { id: 'default' }
      });
      if (setting) {
        return {
          id: setting.id,
          pickupAddress: setting.pickupAddress,
          pickupLatitude: Number(setting.pickupLatitude),
          pickupLongitude: Number(setting.pickupLongitude),
          maxDistanceKm: Number(setting.maxDistanceKm),
          shortDistanceMaxKm: Number(setting.shortDistanceMaxKm),
          mediumDistanceMaxKm: Number(setting.mediumDistanceMaxKm)
        };
      }
    } catch (e) {
      console.error('Error getting delivery settings:', e);
    }
    return DEFAULT_DELIVERY_SETTING;
  }

  /**
   * Fetch all active vehicle configurations
   */
  public static async getVehicleConfigs(): Promise<DeliveryVehicleConfig[]> {
    try {
      const vehicles = await prisma.deliveryVehicleConfig.findMany({
        where: { isActive: true }
      });
      if (vehicles.length > 0) {
        return vehicles.map(v => ({
          id: v.id as VehicleTypeId,
          name: v.name,
          amharicName: v.amharicName || undefined,
          description: v.description,
          amharicDescription: v.amharicDescription || undefined,
          icon: v.icon,
          baseFee: Number(v.baseFee),
          pricePerKm: Number(v.pricePerKm),
          maxSheep: Number(v.maxSheep),
          maxGoats: Number(v.maxGoats),
          maxCattle: Number(v.maxCattle),
          maxChickens: Number(v.maxChickens),
          maxWeightKg: Number(v.maxWeightKg),
          isActive: v.isActive
        }));
      }
    } catch (e) {
      console.error('Error getting vehicle configs:', e);
    }
    return DEFAULT_VEHICLE_CONFIGS;
  }

  /**
   * Update delivery settings (Admin)
   */
  public static async updateDeliverySettings(updates: Partial<DeliverySetting>): Promise<DeliverySetting> {
    const updated = await prisma.deliverySetting.upsert({
      where: { id: 'default' },
      update: {
        ...(updates.pickupAddress && { pickupAddress: updates.pickupAddress }),
        ...(updates.pickupLatitude !== undefined && { pickupLatitude: Number(updates.pickupLatitude) }),
        ...(updates.pickupLongitude !== undefined && { pickupLongitude: Number(updates.pickupLongitude) }),
        ...(updates.maxDistanceKm !== undefined && { maxDistanceKm: Number(updates.maxDistanceKm) }),
        ...(updates.shortDistanceMaxKm !== undefined && { shortDistanceMaxKm: Number(updates.shortDistanceMaxKm) }),
        ...(updates.mediumDistanceMaxKm !== undefined && { mediumDistanceMaxKm: Number(updates.mediumDistanceMaxKm) })
      },
      create: {
        id: 'default',
        pickupAddress: updates.pickupAddress || DEFAULT_DELIVERY_SETTING.pickupAddress,
        pickupLatitude: updates.pickupLatitude ?? DEFAULT_DELIVERY_SETTING.pickupLatitude,
        pickupLongitude: updates.pickupLongitude ?? DEFAULT_DELIVERY_SETTING.pickupLongitude,
        maxDistanceKm: updates.maxDistanceKm ?? DEFAULT_DELIVERY_SETTING.maxDistanceKm,
        shortDistanceMaxKm: updates.shortDistanceMaxKm ?? DEFAULT_DELIVERY_SETTING.shortDistanceMaxKm,
        mediumDistanceMaxKm: updates.mediumDistanceMaxKm ?? DEFAULT_DELIVERY_SETTING.mediumDistanceMaxKm
      }
    });

    return {
      id: updated.id,
      pickupAddress: updated.pickupAddress,
      pickupLatitude: Number(updated.pickupLatitude),
      pickupLongitude: Number(updated.pickupLongitude),
      maxDistanceKm: Number(updated.maxDistanceKm),
      shortDistanceMaxKm: Number(updated.shortDistanceMaxKm),
      mediumDistanceMaxKm: Number(updated.mediumDistanceMaxKm)
    };
  }

  /**
   * Update a vehicle configuration (Admin)
   */
  public static async updateVehicleConfig(
    id: VehicleTypeId,
    updates: Partial<DeliveryVehicleConfig>
  ): Promise<DeliveryVehicleConfig | null> {
    const updated = await prisma.deliveryVehicleConfig.update({
      where: { id },
      data: {
        ...(updates.name && { name: updates.name }),
        ...(updates.amharicName !== undefined && { amharicName: updates.amharicName || null }),
        ...(updates.description && { description: updates.description }),
        ...(updates.amharicDescription !== undefined && { amharicDescription: updates.amharicDescription || null }),
        ...(updates.icon && { icon: updates.icon }),
        ...(updates.baseFee !== undefined && { baseFee: Number(updates.baseFee) }),
        ...(updates.pricePerKm !== undefined && { pricePerKm: Number(updates.pricePerKm) }),
        ...(updates.maxSheep !== undefined && { maxSheep: Number(updates.maxSheep) }),
        ...(updates.maxGoats !== undefined && { maxGoats: Number(updates.maxGoats) }),
        ...(updates.maxCattle !== undefined && { maxCattle: Number(updates.maxCattle) }),
        ...(updates.maxChickens !== undefined && { maxChickens: Number(updates.maxChickens) }),
        ...(updates.maxWeightKg !== undefined && { maxWeightKg: Number(updates.maxWeightKg) }),
        ...(updates.isActive !== undefined && { isActive: Boolean(updates.isActive) })
      }
    });

    return {
      id: updated.id as VehicleTypeId,
      name: updated.name,
      amharicName: updated.amharicName || undefined,
      description: updated.description,
      amharicDescription: updated.amharicDescription || undefined,
      icon: updated.icon,
      baseFee: Number(updated.baseFee),
      pricePerKm: Number(updated.pricePerKm),
      maxSheep: Number(updated.maxSheep),
      maxGoats: Number(updated.maxGoats),
      maxCattle: Number(updated.maxCattle),
      maxChickens: Number(updated.maxChickens),
      maxWeightKg: Number(updated.maxWeightKg),
      isActive: updated.isActive
    };
  }

  /**
   * Calculate real driving road distance via OSRM routing API with robust Haversine geodesic fallback
   */
  public static async calculateRoadDistance(
    pickupLat: number,
    pickupLng: number,
    deliveryLat: number,
    deliveryLng: number
  ): Promise<{
    distanceKm: number;
    estimatedDurationMinutes: number;
    isFallback: boolean;
    routeCoordinates?: [number, number][];
  }> {
    // 1. Try public OSRM driving router with full turn-by-turn road geometry
    try {
      const url = `https://router.project-osrm.org/route/v1/driving/${pickupLng},${pickupLat};${deliveryLng},${deliveryLat}?overview=full&geometries=geojson`;
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 4000);

      const res = await fetch(url, { signal: controller.signal });
      clearTimeout(timeout);

      if (res.ok) {
        const data: any = await res.json();
        if (data.code === 'Ok' && data.routes && data.routes.length > 0) {
          const route = data.routes[0];
          const meters = route.distance; // in meters along actual roads
          const seconds = route.duration; // in seconds

          const km = Math.round((meters / 1000) * 10) / 10;
          // In Addis Ababa urban traffic, add realistic travel buffer
          const mins = Math.max(8, Math.round((km / 22) * 60) + 5);

          // Extract geojson coordinates: OSRM is [lng, lat], convert to [lat, lng] for Leaflet
          let routeCoordinates: [number, number][] | undefined = undefined;
          if (route.geometry && Array.isArray(route.geometry.coordinates)) {
            routeCoordinates = route.geometry.coordinates.map((coord: [number, number]) => [coord[1], coord[0]]);
          }

          return {
            distanceKm: Math.max(0.5, km),
            estimatedDurationMinutes: mins,
            isFallback: false,
            routeCoordinates
          };
        }
      }
    } catch (err) {
      // OSRM network timeout or unreachable - continue to fallback
    }

    // 2. Resilient Haversine Geodesic Fallback with 1.32x Urban Ethiopian Road Winding Factor
    const R = 6371; // Earth radius in km
    const dLat = ((deliveryLat - pickupLat) * Math.PI) / 180;
    const dLng = ((deliveryLng - pickupLng) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((pickupLat * Math.PI) / 180) *
        Math.cos((deliveryLat * Math.PI) / 180) *
        Math.sin(dLng / 2) *
        Math.sin(dLng / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const straightLineKm = R * c;

    // Addis Ababa road network tortuosity factor: ~1.32x
    const roadKm = Math.round(straightLineKm * 1.32 * 10) / 10;
    // Estimated driving speed ~22 km/h in Addis Ababa traffic + 8 min base buffer
    const estMinutes = Math.max(10, Math.round((roadKm / 22) * 60) + 8);

    return {
      distanceKm: Math.max(0.8, roadKm),
      estimatedDurationMinutes: estMinutes,
      isFallback: true
    };
  }

  /**
   * Categorize distance into SHORT (0-10km), MEDIUM (>10-20km), LONG (>20-30km)
   */
  public static getDistanceCategory(
    distanceKm: number,
    setting: DeliverySetting
  ): {
    category: DistanceCategory;
    label: string;
    amharicLabel: string;
    isWithinRange: boolean;
  } {
    const isWithinRange = distanceKm <= setting.maxDistanceKm;

    if (distanceKm <= setting.shortDistanceMaxKm) {
      return {
        category: 'short',
        label: `Short Distance (0 - ${setting.shortDistanceMaxKm} km)`,
        amharicLabel: `አጭር ርቀት (0 - ${setting.shortDistanceMaxKm} ኪ.ሜ)`,
        isWithinRange
      };
    } else if (distanceKm <= setting.mediumDistanceMaxKm) {
      return {
        category: 'medium',
        label: `Medium Distance (${setting.shortDistanceMaxKm} - ${setting.mediumDistanceMaxKm} km)`,
        amharicLabel: `መካከለኛ ርቀት (${setting.shortDistanceMaxKm} - ${setting.mediumDistanceMaxKm} ኪ.ሜ)`,
        isWithinRange
      };
    } else {
      return {
        category: 'long',
        label: `Long Distance (${setting.mediumDistanceMaxKm} - ${setting.maxDistanceKm} km)`,
        amharicLabel: `ረጅም ርቀት (${setting.mediumDistanceMaxKm} - ${setting.maxDistanceKm} ኪ.ሜ)`,
        isWithinRange
      };
    }
  }

  /**
   * Aggregate load items and compute combined metrics
   */
  public static summarizeLoad(items: DeliveryLoadItem[]): {
    sheep: number;
    goats: number;
    cattle: number;
    chickens: number;
    meatKg: number;
    cargoWeightKg: number;
    totalWeightKg: number;
  } {
    let sheep = 0;
    let goats = 0;
    let cattle = 0;
    let chickens = 0;
    let meatKg = 0;
    let cargoWeight = 0;
    let liveAnimalWeight = 0;

    for (const item of items) {
      const q = Math.max(1, Number(item.quantity) || 1);
      const rawType = (item.type || '').toLowerCase();

      switch (rawType) {
        case 'sheep':
          sheep += q;
          liveAnimalWeight += q * (item.weightKg || 35);
          break;
        case 'goat':
        case 'goats':
          goats += q;
          liveAnimalWeight += q * (item.weightKg || 30);
          break;
        case 'cow':
        case 'cattle':
        case 'ox':
        case 'bull':
          cattle += q;
          liveAnimalWeight += q * (item.weightKg || 300);
          break;
        case 'hen':
        case 'chicken':
        case 'chickens':
        case 'poultry':
          chickens += q;
          liveAnimalWeight += q * (item.weightKg || 1.8);
          break;
        case 'meat':
        case 'raw_meat':
        case 'raw_meat_kg':
        case 'beef':
          const meatAmount = item.weightKg ? Number(item.weightKg) : q;
          meatKg += meatAmount;
          cargoWeight += meatAmount;
          break;
        case 'package':
          // Standard celebratory package average contents (e.g. wine, eggs, spices)
          cargoWeight += q * (item.weightKg || 10);
          break;
        case 'wine':
        case 'whisky':
        case 'tej':
          cargoWeight += q * (item.weightKg || 1.5);
          break;
        case 'eggs':
          cargoWeight += q * (item.weightKg || 2.0);
          break;
        case 'flowers':
          cargoWeight += q * (item.weightKg || 0.8);
          break;
        default:
          cargoWeight += q * (item.weightKg || 1);
          break;
      }
    }

    const totalWeightKg = Math.round((liveAnimalWeight + cargoWeight) * 10) / 10;
    const cargoWeightKg = Math.round(cargoWeight * 10) / 10;

    return {
      sheep,
      goats,
      cattle,
      chickens,
      meatKg,
      cargoWeightKg,
      totalWeightKg
    };
  }

  /**
   * Validate vehicle capacity against aggregated load
   */
  public static evaluateVehicleCapacity(
    vehicle: DeliveryVehicleConfig,
    load: {
      sheep: number;
      goats: number;
      cattle: number;
      chickens: number;
      meatKg: number;
      cargoWeightKg?: number;
      totalWeightKg: number;
    }
  ): { isSuitable: boolean; unsuitabilityReason?: string } {
    const totalSmallRuminants = load.sheep + load.goats;
    const cargoWeight = load.cargoWeightKg !== undefined ? load.cargoWeightKg : load.meatKg;

    // 1. Cattle Check
    if (load.cattle > vehicle.maxCattle) {
      return {
        isSuitable: false,
        unsuitabilityReason: `This vehicle cannot transport cattle/oxen (Requires Large Pickup / Van with dedicated pen).`
      };
    }

    // 2. Sheep/Goat Capacity Check
    if (totalSmallRuminants > vehicle.maxSheep) {
      return {
        isSuitable: false,
        unsuitabilityReason: `Load contains ${totalSmallRuminants} sheep/goats (Vehicle capacity is max ${vehicle.maxSheep}). Upgrade to a larger vehicle.`
      };
    }

    // 3. Chicken Count Check
    if (load.chickens > vehicle.maxChickens) {
      return {
        isSuitable: false,
        unsuitabilityReason: `Load contains ${load.chickens} chickens (Exceeds capacity of ${vehicle.maxChickens}).`
      };
    }

    // 4. Cargo / Meat Weight Limit Check
    if (cargoWeight > vehicle.maxWeightKg) {
      return {
        isSuitable: false,
        unsuitabilityReason: `Cargo/meat weight of ${cargoWeight} KG exceeds vehicle cargo limit of ${vehicle.maxWeightKg} KG.`
      };
    }

    return { isSuitable: true };
  }

  /**
   * Compute comprehensive Delivery Quote with all active vehicles, capacity checks, and live rates
   */
  public static async calculateQuote(params: {
    deliveryAddress?: string;
    deliveryLat: number;
    deliveryLng: number;
    items: DeliveryLoadItem[];
  }): Promise<DeliveryQuoteResponse> {
    await this.ensureDeliveryDefaults();

    const settings = await this.getDeliverySettings();
    const vehicleConfigs = await this.getVehicleConfigs();

    const { distanceKm, estimatedDurationMinutes } = await this.calculateRoadDistance(
      settings.pickupLatitude,
      settings.pickupLongitude,
      params.deliveryLat,
      params.deliveryLng
    );

    const categoryInfo = this.getDistanceCategory(distanceKm, settings);
    const loadSummary = this.summarizeLoad(params.items);

    // Calculate quote for each vehicle
    const vehiclesQuote: VehicleQuoteResult[] = [];

    for (const v of vehicleConfigs) {
      const { isSuitable, unsuitabilityReason } = this.evaluateVehicleCapacity(v, loadSummary);

      // Formula: baseFee + (distanceKm * pricePerKm)
      const calculatedFee = Math.round((v.baseFee + distanceKm * v.pricePerKm) * 10) / 10;

      vehiclesQuote.push({
        id: v.id,
        name: v.name,
        amharicName: v.amharicName,
        description: v.description,
        icon: v.icon,
        baseFee: v.baseFee,
        pricePerKm: v.pricePerKm,
        deliveryFee: calculatedFee,
        isSuitable,
        unsuitabilityReason,
        isRecommended: false,
        capacity: {
          maxSheep: v.maxSheep,
          maxGoats: v.maxGoats,
          maxCattle: v.maxCattle,
          maxChickens: v.maxChickens,
          maxWeightKg: v.maxWeightKg
        }
      });
    }

    // Determine the recommended vehicle: the cheapest suitable vehicle
    const suitableVehicles = vehiclesQuote.filter(v => v.isSuitable);
    let recommendedVehicleId: VehicleTypeId | undefined = undefined;

    if (suitableVehicles.length > 0) {
      // Sort by price ascending
      suitableVehicles.sort((a, b) => a.deliveryFee - b.deliveryFee);
      suitableVehicles[0].isRecommended = true;
      recommendedVehicleId = suitableVehicles[0].id;
    } else if (vehiclesQuote.length > 0) {
      // If none is strictly suitable, pick the largest vehicle (large_pickup)
      const largePickup = vehiclesQuote.find(v => v.id === 'large_pickup') || vehiclesQuote[vehiclesQuote.length - 1];
      largePickup.isRecommended = true;
      recommendedVehicleId = largePickup.id;
    }

    return {
      success: true,
      pickupLocation: {
        name: 'Jonny Livestock Aware Farm Facility',
        address: settings.pickupAddress,
        lat: settings.pickupLatitude,
        lng: settings.pickupLongitude
      },
      deliveryLocation: {
        address: params.deliveryAddress || 'Selected Location',
        lat: params.deliveryLat,
        lng: params.deliveryLng
      },
      distanceKm,
      estimatedDurationMinutes,
      distanceCategory: categoryInfo.category,
      distanceCategoryLabel: categoryInfo.label,
      amharicCategoryLabel: categoryInfo.amharicLabel,
      isWithinRange: categoryInfo.isWithinRange,
      maxDistanceKm: settings.maxDistanceKm,
      loadSummary,
      vehicles: vehiclesQuote,
      recommendedVehicleId
    };
  }

  /**
   * Authoritative server-side calculation of delivery fee during order placement
   */
  public static async validateAndCalculateAuthoritativeDelivery(params: {
    deliveryAddress: string;
    deliveryLat?: number;
    deliveryLng?: number;
    vehicleType?: string;
    items: DeliveryLoadItem[];
  }): Promise<{
    isValid: boolean;
    deliveryFee: number;
    distanceKm: number;
    distanceCategory: DistanceCategory;
    vehicleType: VehicleTypeId;
    vehicleName: string;
    estimatedDurationMinutes: number;
    pickupAddress: string;
    pickupLatitude: number;
    pickupLongitude: number;
    error?: string;
  }> {
    const settings = await this.getDeliverySettings();

    // Default to Kazanchis/Aware if coordinates not explicitly passed
    const destLat = params.deliveryLat ?? 9.0175;
    const destLng = params.deliveryLng ?? 38.7690;

    const quote = await this.calculateQuote({
      deliveryAddress: params.deliveryAddress,
      deliveryLat: destLat,
      deliveryLng: destLng,
      items: params.items
    });

    if (!quote.isWithinRange) {
      return {
        isValid: false,
        deliveryFee: 0,
        distanceKm: quote.distanceKm,
        distanceCategory: quote.distanceCategory,
        vehicleType: 'car',
        vehicleName: 'Car',
        estimatedDurationMinutes: quote.estimatedDurationMinutes,
        pickupAddress: settings.pickupAddress,
        pickupLatitude: settings.pickupLatitude,
        pickupLongitude: settings.pickupLongitude,
        error: `Delivery distance (${quote.distanceKm} km) exceeds maximum allowable limit of ${settings.maxDistanceKm} km.`
      };
    }

    const requestedVehicleId = (params.vehicleType as VehicleTypeId) || quote.recommendedVehicleId || 'car';
    const vehicleResult = quote.vehicles.find(v => v.id === requestedVehicleId) || quote.vehicles[0];

    if (!vehicleResult.isSuitable) {
      return {
        isValid: false,
        deliveryFee: vehicleResult.deliveryFee,
        distanceKm: quote.distanceKm,
        distanceCategory: quote.distanceCategory,
        vehicleType: requestedVehicleId,
        vehicleName: vehicleResult.name,
        estimatedDurationMinutes: quote.estimatedDurationMinutes,
        pickupAddress: settings.pickupAddress,
        pickupLatitude: settings.pickupLatitude,
        pickupLongitude: settings.pickupLongitude,
        error: vehicleResult.unsuitabilityReason || `Selected vehicle ${vehicleResult.name} cannot handle the items in this order.`
      };
    }

    return {
      isValid: true,
      deliveryFee: vehicleResult.deliveryFee,
      distanceKm: quote.distanceKm,
      distanceCategory: quote.distanceCategory,
      vehicleType: vehicleResult.id,
      vehicleName: vehicleResult.name,
      estimatedDurationMinutes: quote.estimatedDurationMinutes,
      pickupAddress: settings.pickupAddress,
      pickupLatitude: settings.pickupLatitude,
      pickupLongitude: settings.pickupLongitude
    };
  }

  /**
   * High-accuracy Reverse Geocoding with OpenStreetMap Nominatim + Smart Local Fallback
   */
  public static async reverseGeocode(lat: number, lng: number): Promise<{
    address: string;
    subCity?: string;
    road?: string;
    neighborhood?: string;
    display_name?: string;
  }> {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 3500);

      const url = `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json&addressdetails=1&zoom=18`;
      const res = await fetch(url, {
        headers: {
          'User-Agent': 'JonnyLivestockEthiopia/1.0 (contact@jonnylivestock.com)'
        },
        signal: controller.signal
      });
      clearTimeout(timeoutId);

      if (res.ok) {
        const data: any = await res.json();
        if (data && data.address) {
          const addr = data.address;
          const road = addr.road || addr.pedestrian || addr.street;
          const neighborhood = addr.neighbourhood || addr.suburb || addr.residential || addr.quarter;
          const subCity = addr.city_district || addr.suburb || addr.county || addr.district;
          const poi = addr.amenity || addr.building || addr.shop || addr.tourism || addr.office;

          const parts: string[] = [];
          if (poi) parts.push(poi);
          if (road) parts.push(road);
          if (neighborhood && neighborhood !== road && neighborhood !== poi) parts.push(neighborhood);
          if (subCity && subCity !== neighborhood) parts.push(`${subCity} Sub-City`);
          parts.push('Addis Ababa');

          const formattedAddress = parts.join(', ');
          return {
            address: formattedAddress,
            subCity,
            road,
            neighborhood,
            display_name: data.display_name
          };
        }
      }
    } catch (err) {
      console.warn('Nominatim reverse geocode error or timeout:', err);
    }

    // Local nearest landmark fallback
    let closest = ADDIS_ABABA_LOCATIONS[0];
    let minD = Infinity;
    for (const loc of ADDIS_ABABA_LOCATIONS) {
      const dLat = loc.lat - lat;
      const dLng = loc.lng - lng;
      const dist = dLat * dLat + dLng * dLng;
      if (dist < minD) {
        minD = dist;
        closest = loc;
      }
    }

    return {
      address: `${closest.name}, ${closest.subCity} Sub-City, Addis Ababa`,
      subCity: closest.subCity,
      neighborhood: closest.name
    };
  }

  /**
   * Search places, hotels, landmarks, hospitals, and addresses via OpenStreetMap Nominatim + Addis Ababa Curated Database
   */
  public static async searchPlaces(query: string): Promise<Array<{
    name: string;
    address: string;
    subCity?: string;
    category?: string;
    lat: number;
    lng: number;
  }>> {
    const q = (query || '').trim().toLowerCase();
    if (!q) return [];

    const results: Array<{
      name: string;
      address: string;
      subCity?: string;
      category?: string;
      lat: number;
      lng: number;
    }> = [];

    // 1. Check local curated landmarks first (Hotels, Hospitals, Malls, Neighborhoods)
    const localMatches = ADDIS_ABABA_LOCATIONS.filter(loc => {
      const name = (loc.name || '').toLowerCase();
      const amharic = (loc.amharicName || '').toLowerCase();
      const subCity = (loc.subCity || '').toLowerCase();
      const category = (loc.category || '').toLowerCase();
      return (
        name.includes(q) ||
        amharic.includes(q) ||
        subCity.includes(q) ||
        category.includes(q) ||
        (q.includes('hotel') && category === 'hotel') ||
        (q.includes('hospital') && category === 'hospital') ||
        (q.includes('mall') && category === 'mall')
      );
    });

    for (const loc of localMatches.slice(0, 8)) {
      results.push({
        name: loc.name,
        address: `${loc.name}, ${loc.subCity} Sub-City, Addis Ababa`,
        subCity: loc.subCity,
        category: loc.category || 'landmark',
        lat: loc.lat,
        lng: loc.lng
      });
    }

    // 2. Fetch live Nominatim search results within Addis Ababa bounding box
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 3500);

      const encoded = encodeURIComponent(`${q}, Addis Ababa, Ethiopia`);
      const url = `https://nominatim.openstreetmap.org/search?q=${encoded}&format=json&addressdetails=1&limit=8&viewbox=38.60,9.15,38.95,8.80&bounded=0`;
      const res = await fetch(url, {
        headers: {
          'User-Agent': 'JonnyLivestockEthiopia/1.0 (contact@jonnylivestock.com)'
        },
        signal: controller.signal
      });
      clearTimeout(timeoutId);

      if (res.ok) {
        const data: any = await res.json();
        if (Array.isArray(data)) {
          for (const item of data) {
            const lat = Number(item.lat);
            const lng = Number(item.lon);
            // Avoid duplicate if very close to existing results
            const isDup = results.some(r => Math.abs(r.lat - lat) < 0.001 && Math.abs(r.lng - lng) < 0.001);
            if (!isDup && !isNaN(lat) && !isNaN(lng)) {
              const name = item.name || item.display_name.split(',')[0];
              const rawType = item.type || item.class || 'landmark';
              let category = 'landmark';
              if (rawType.includes('hotel') || rawType.includes('guest_house') || rawType.includes('resort')) category = 'hotel';
              else if (rawType.includes('hospital') || rawType.includes('clinic') || rawType.includes('pharmacy')) category = 'hospital';
              else if (rawType.includes('mall') || rawType.includes('shop') || rawType.includes('supermarket')) category = 'mall';

              results.push({
                name,
                address: item.display_name,
                subCity: item.address?.city_district || item.address?.suburb || 'Addis Ababa',
                category,
                lat,
                lng
              });
            }
          }
        }
      }
    } catch (err) {
      console.warn('Nominatim search error or timeout:', err);
    }

    return results.slice(0, 10);
  }
}
