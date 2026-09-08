import { Router, Response } from 'express';
import fs from 'fs';
import path from 'path';
import prisma from '../db/prisma.js';
import { PostgresDB } from '../db/postgresDb.js';
import { authenticateToken, requireAdmin, optionalAuth, generateReceiptToken, AuthRequest } from '../middleware/auth.middleware.js';
import { uploadUserSlip, RECEIPTS_DIR, UPLOADS_DIR } from '../middleware/upload.middleware.js';
import { Order, OrderStatus, DeliveryLoadItem } from '../types/index.js';
import { DeliveryService } from '../services/delivery.service.js';
import { realtimeService } from '../services/realtime.service.js';
import { orderContactLimiter } from '../middleware/rateLimit.middleware.js';
import { sanitizeErrorMessage } from '../utils/errorHandler.js';
import { PACKAGE_CATALOG } from '../data/packagesData.js';
import { normalizeEthiopianPhone, isValidEthiopianPhone } from '../utils/phone.js';
import { validatePackageLivestock } from '../utils/packageValidators.js';

const router = Router();

// ==================== CREATE ORDER / RESERVATION (Animal, Meat, or Package) ====================
router.post(
  '/',
  orderContactLimiter,
  optionalAuth,
  uploadUserSlip.single('paymentSlip'),
  async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const {
        customerName,
        customerPhone,
        customerEmail,
        deliveryLocation,
        deliveryAddress,
        deliveryLatitude,
        deliveryLongitude,
        vehicleType,
        animalId,
        isPackage,
        packageName,
        packageDetails,
        isReservation,
        selectedServices,
        servicesFee,
        totalAmount,
        paymentMethod,
        bankAccountId,
        transactionReference,
        customerNotes
      } = req.body;

      const normalizedCustomerPhone = normalizeEthiopianPhone(customerPhone);

      if (!customerName || !customerName.trim()) {
        res.status(400).json({
          success: false,
          error: 'Customer name is required'
        });
        return;
      }

      if (!normalizedCustomerPhone || !isValidEthiopianPhone(normalizedCustomerPhone)) {
        res.status(400).json({
          success: false,
          error: 'Please enter a valid Ethiopian phone number (e.g. 0911223344 or 0712345678)'
        });
        return;
      }

      const isPkg = isPackage === true || isPackage === 'true';
      const isRes = isReservation === true || isReservation === 'true';
      const isMeat = req.body.isMeatByKg === true || req.body.isMeatByKg === 'true';

      if (!isPkg && !animalId && !isMeat) {
        res.status(400).json({
          success: false,
          error: 'Please select an animal, celebration package, or meat order to proceed'
        });
        return;
      }

      if (req.file && req.file.size === 0) {
        res.status(400).json({ success: false, error: 'Uploaded payment slip file is empty (0 bytes).' });
        return;
      }

      // Handle slip file path or URL
      let slipUrl = '';
      if (req.file) {
        slipUrl = `/receipts/${req.file.filename}`;
      } else if (req.body.paymentSlipUrl && req.body.paymentSlipUrl.trim()) {
        slipUrl = req.body.paymentSlipUrl.trim();
      }

      if (!slipUrl) {
        res.status(400).json({
          success: false,
          error: 'Payment slip image or transaction document is required to submit an order.'
        });
        return;
      }

      let animalData: any = null;
      let baseTotal = 0;
      let animalBreed = '';
      let animalType = '';
      let animalPrice = 0;
      const loadItems: DeliveryLoadItem[] = [];

      if (animalId) {
        animalData = await PostgresDB.getAnimalById(animalId);
        if (!animalData) {
          res.status(404).json({ success: false, error: 'Selected animal not found' });
          return;
        }

        if (animalData.status === 'sold' || animalData.status === 'reserved' || (animalData.quantity !== undefined && animalData.quantity <= 0)) {
          res.status(409).json({
            success: false,
            error: animalData.status === 'reserved'
              ? 'This animal is currently reserved by another customer and is pending final payment.'
              : 'This animal is already sold / unavailable'
          });
          return;
        }

        animalBreed = animalData.breed;
        animalType = animalData.type;
        animalPrice = animalData.price;
        baseTotal = animalData.price;

        loadItems.push({
          type: animalData.type as any,
          name: animalData.breed,
          quantity: 1,
          weightKg: animalData.weight
        });
      } else if (isMeat) {
        const kgVal = Number(req.body.meatKg);
        if (!kgVal || isNaN(kgVal) || kgVal <= 0) {
          res.status(400).json({ success: false, error: 'Please enter a valid meat quantity greater than 0 KG' });
          return;
        }
        if (kgVal > 1000) {
          res.status(400).json({ success: false, error: 'Meat order quantity exceeds maximum allowed limit (1000 KG)' });
          return;
        }
        animalType = 'cow';
        const cutName = (req.body.meatCut || 'Prime Cut').trim();
        const pricePerKg = 2500;
        animalBreed = `Raw Ox Beef (${cutName}) - ${kgVal} KG`;
        animalPrice = kgVal * pricePerKg;
        baseTotal = animalPrice;

        loadItems.push({
          type: 'meat',
          name: animalBreed,
          quantity: 1,
          weightKg: kgVal
        });
      }

      // Parse services array
      let parsedServices: string[] = [];
      if (typeof selectedServices === 'string') {
        try {
          parsedServices = JSON.parse(selectedServices);
        } catch {
          parsedServices = selectedServices ? [selectedServices] : [];
        }
      } else if (Array.isArray(selectedServices)) {
        parsedServices = selectedServices;
      }

      const otherServicesFee = Number(servicesFee) || 0;
      baseTotal += otherServicesFee;

      // Parse package details
      let parsedPackageDetails: any = null;
      if (isPkg) {
        if (typeof packageDetails === 'string') {
          try {
            parsedPackageDetails = JSON.parse(packageDetails);
          } catch {
            parsedPackageDetails = null;
          }
        } else {
          parsedPackageDetails = packageDetails;
        }

        // Authoritative package pricing
        const preMadePackages = await PostgresDB.getPackages();
        const matchedPkg = preMadePackages.find(
          (p: any) => p.id === (parsedPackageDetails?.id || req.body.packageId) ||
                      p.name.toLowerCase() === (packageName || '').toLowerCase().trim() ||
                      p.name.toLowerCase() === (parsedPackageDetails?.name || '').toLowerCase().trim()
        );

        if (matchedPkg) {
          baseTotal = matchedPkg.packagePrice;
        } else if (parsedPackageDetails && Array.isArray(parsedPackageDetails.items) && parsedPackageDetails.items.length > 0) {
          // Mandatory rule: custom package must include either Cow/Ox or Sheep/Goat
          const livestockValidation = validatePackageLivestock(parsedPackageDetails.items);
          if (!livestockValidation.hasLivestock) {
            res.status(400).json({
              success: false,
              error: 'Custom celebration packages must include at least one livestock animal (Cow, Ox, Sheep, or Goat).'
            });
            return;
          }

          let computedCustomTotal = 0;
          for (const item of parsedPackageDetails.items) {
            const catalogItem = PACKAGE_CATALOG.find((c: any) => c.id === item.id);
            const unitPrice = catalogItem ? catalogItem.price : Number(item.price || 0);
            const qty = Math.max(1, Number(item.quantity) || 1);
            computedCustomTotal += unitPrice * qty;
          }
          baseTotal = computedCustomTotal > 0 ? computedCustomTotal : (Number(totalAmount) || 0);
        } else if (totalAmount && Number(totalAmount) > 0) {
          baseTotal = Number(totalAmount);
        } else {
          res.status(400).json({ success: false, error: 'Valid celebration package selection or details are required' });
          return;
        }

        if (parsedPackageDetails && Array.isArray(parsedPackageDetails.items)) {
          for (const item of parsedPackageDetails.items) {
            loadItems.push({
              type: item.category === 'meat_livestock' ? 'meat' : (item.category as any) || 'package',
              name: item.name,
              quantity: 1,
              weightKg: item.weightKg || 5
            });
          }
        } else {
          loadItems.push({
            type: 'package',
            name: packageName || 'Celebration Package',
            quantity: 1,
            weightKg: 30
          });
        }
      } else if (isMeat) {
        parsedPackageDetails = {
          isMeatByKg: true,
          livestock: 'ox',
          cut: req.body.meatCut || 'Kurt',
          kg: Number(req.body.meatKg) || 1,
          pricePerKg: Number(req.body.pricePerKg) || 2500,
          isDelivery: Boolean(req.body.isDelivery === true || req.body.isDelivery === 'true'),
          deliveryAddress: deliveryAddress || deliveryLocation || undefined
        };
      }

      // Check if delivery requested
      // IMPORTANT: Delivery functionalities are strictly disabled for reservations!
      // Delivery is functional ONLY when covering total cost upfront or when finishing reservation.
      const wantsDelivery = Boolean(
        !isRes && (
          req.body.isDelivery === true ||
          req.body.isDelivery === 'true' ||
          parsedServices.includes('delivery') ||
          Boolean(deliveryAddress && deliveryAddress.trim()) ||
          Boolean(deliveryLatitude && deliveryLongitude)
        )
      );

      // Free delivery check for celebration packages fulfilling the >= 3 categories requirement
      const isFreeDelivery = Boolean(
        req.body.isFreeDelivery === true ||
        req.body.isFreeDelivery === 'true' ||
        (isPkg && (
          (parsedPackageDetails?.categoriesCount && Number(parsedPackageDetails.categoriesCount) >= 3) ||
          (parsedPackageDetails?.categoryCount && Number(parsedPackageDetails.categoryCount) >= 3) ||
          (parsedPackageDetails?.items && new Set(parsedPackageDetails.items.map((i: any) => i.category)).size >= 3) ||
          (!parsedPackageDetails?.items) // Default pre-made celebration bundle
        ))
      );

      let authoritativeDelivery: any = null;
      let deliveryFee = 0;

      if (wantsDelivery) {
        const destAddress = (deliveryAddress || deliveryLocation || 'Customer Selected Address').trim();
        const dLat = deliveryLatitude !== undefined ? Number(deliveryLatitude) : undefined;
        const dLng = deliveryLongitude !== undefined ? Number(deliveryLongitude) : undefined;

        authoritativeDelivery = await DeliveryService.validateAndCalculateAuthoritativeDelivery({
          deliveryAddress: destAddress,
          deliveryLat: dLat,
          deliveryLng: dLng,
          vehicleType: vehicleType,
          items: loadItems
        });

        if (!authoritativeDelivery.isValid) {
          res.status(400).json({
            success: false,
            error: authoritativeDelivery.error || 'Delivery cannot be fulfilled for the chosen destination or vehicle.'
          });
          return;
        }

        // Waive delivery fee if customer package fulfills free delivery rule
        deliveryFee = isFreeDelivery ? 0 : authoritativeDelivery.deliveryFee;
      }

      const calculatedGrandTotal = isRes ? baseTotal : (baseTotal + deliveryFee);

      const orderId = `ORD-${Date.now().toString().slice(-6)}`;
      const depositAmt = isRes ? Math.round(baseTotal * 0.5) : null;
      const remainingAmt = isRes ? baseTotal - (depositAmt || 0) : 0;

      const resolvedPhone = normalizedCustomerPhone || (req.user && req.user.phone ? normalizeEthiopianPhone(req.user.phone) : '');

      if (req.user && req.user.id && resolvedPhone) {
        if (!req.user.phone || req.user.phone !== resolvedPhone) {
          await PostgresDB.updateUserPhone(req.user.id, resolvedPhone);
          req.user.phone = resolvedPhone;
        }
      }

      const newOrder: Partial<Order> = {
        id: orderId,
        userId: req.user ? req.user.id : undefined,
        customerName: customerName.trim(),
        customerPhone: resolvedPhone,
        customerEmail: customerEmail ? customerEmail.trim() : (req.user ? req.user.email : undefined),
        deliveryLocation: deliveryAddress || deliveryLocation ? (deliveryAddress || deliveryLocation).trim() : undefined,
        
        // Authoritative delivery details
        isDelivery: wantsDelivery,
        deliveryAddress: wantsDelivery && authoritativeDelivery ? (deliveryAddress || deliveryLocation).trim() : undefined,
        deliveryLatitude: wantsDelivery && authoritativeDelivery ? Number(deliveryLatitude) : undefined,
        deliveryLongitude: wantsDelivery && authoritativeDelivery ? Number(deliveryLongitude) : undefined,
        pickupAddress: wantsDelivery && authoritativeDelivery ? authoritativeDelivery.pickupAddress : undefined,
        pickupLatitude: wantsDelivery && authoritativeDelivery ? authoritativeDelivery.pickupLatitude : undefined,
        pickupLongitude: wantsDelivery && authoritativeDelivery ? authoritativeDelivery.pickupLongitude : undefined,
        distanceKm: wantsDelivery && authoritativeDelivery ? authoritativeDelivery.distanceKm : undefined,
        distanceCategory: wantsDelivery && authoritativeDelivery ? authoritativeDelivery.distanceCategory : undefined,
        vehicleType: wantsDelivery && authoritativeDelivery ? authoritativeDelivery.vehicleType : undefined,
        vehicleName: wantsDelivery && authoritativeDelivery ? authoritativeDelivery.vehicleName : undefined,
        deliveryFee: deliveryFee,
        estimatedDurationMinutes: wantsDelivery && authoritativeDelivery ? authoritativeDelivery.estimatedDurationMinutes : undefined,
        
        animalId: animalData ? animalData.id : undefined,
        animalBreed: animalBreed || undefined,
        animalType: animalType || undefined,
        animalPrice: animalPrice || undefined,
        isPackage: isPkg,
        packageName: packageName || (isPkg ? 'Celebration Custom Package' : undefined),
        packageDetails: parsedPackageDetails,
        isReservation: isRes,
        depositAmount: depositAmt !== null ? depositAmt : undefined,
        remainingAmount: remainingAmt,
        selectedServices: parsedServices,
        servicesFee: otherServicesFee,
        totalAmount: calculatedGrandTotal,
        paymentMethod: paymentMethod || 'Telebirr',
        bankAccountId: bankAccountId || undefined,
        paymentSlipUrl: slipUrl,
        transactionReference: transactionReference ? transactionReference.trim() : undefined,
        customerNotes: customerNotes ? customerNotes.trim() : undefined,
        status: isRes ? 'reservation_pending' : 'pending_verification',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      const { order: createdOrder, notification, animal: updatedAnimal } = await PostgresDB.createOrder(newOrder);

      // 🚀 REALTIME BROADCAST
      realtimeService.broadcast(isRes ? 'NEW_RESERVATION_DEPOSIT' : 'NEW_ORDER_SLIP', {
        order: createdOrder,
        notification,
        animal: updatedAnimal
      });

      if (updatedAnimal) {
        realtimeService.broadcast('ANIMAL_UPDATED', updatedAnimal);
      }

      res.status(201).json({
        success: true,
        message: isRes
          ? '🛡️ Reservation deposit slip submitted successfully! Admin will verify and confirm your reservation.'
          : 'Payment slip submitted successfully! Admin has been notified for verification.',
        order: createdOrder,
        notification
      });
    } catch (error: any) {
      console.error('Order creation error:', error);
      const msg = error?.message || '';
      if (msg.includes('no longer available') || msg.includes('sold out') || msg.includes('was not found')) {
        res.status(409).json({
          success: false,
          error: msg
        });
        return;
      }
      res.status(500).json({
        success: false,
        error: sanitizeErrorMessage(error, 'Failed to submit order. Please check your details and try again.')
      });
    }
  }
);

// ==================== SUBMIT FINAL 50% PAYMENT SLIP (Customer Finishing Reservation) ====================
router.post(
  '/:id/final-payment',
  optionalAuth,
  uploadUserSlip.single('finalPaymentSlip'),
  async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const orderId = req.params.id;
      const {
        paymentMethod,
        transactionReference,
        isDelivery,
        deliveryLocation,
        deliveryAddress,
        deliveryLatitude,
        deliveryLongitude,
        vehicleType,
        vehicleName,
        deliveryFee,
        distanceKm,
        distanceCategory,
        customerNotes
      } = req.body;

      let slipUrl = '';
      if (req.file) {
        if (req.file.size === 0) {
          res.status(400).json({ success: false, error: 'Uploaded final payment slip is empty (0 bytes).' });
          return;
        }
        slipUrl = `/receipts/${req.file.filename}`;
      } else if (req.body.finalPaymentSlipUrl && req.body.finalPaymentSlipUrl.trim()) {
        slipUrl = req.body.finalPaymentSlipUrl.trim();
      }

      if (!slipUrl) {
        res.status(400).json({ success: false, error: 'Payment receipt/slip is required to finalize reservation' });
        return;
      }

      const existingOrder = await PostgresDB.getOrderById(orderId);
      if (!existingOrder) {
        res.status(404).json({ success: false, error: 'Reservation order not found' });
        return;
      }

      // Ensure this order is actually a reservation
      if (!existingOrder.isReservation) {
        res.status(400).json({
          success: false,
          error: 'This order is not a reservation order and does not require a final reservation payment.'
        });
        return;
      }

      // Check for already-paid / completed orders
      if (['verified', 'completed', 'delivered'].includes(existingOrder.status)) {
        res.status(400).json({
          success: false,
          error: 'This reservation order has already been fully paid and verified.'
        });
        return;
      }

      // Check if reservation deposit has been verified
      if (existingOrder.status === 'reservation_pending') {
        res.status(400).json({
          success: false,
          error: 'The initial 50% reservation deposit is still pending admin verification. You can finalize payment once the deposit is approved.'
        });
        return;
      }

      // Check for duplicate final payment submission
      if (existingOrder.status === 'final_payment_pending') {
        res.status(400).json({
          success: false,
          error: 'Final payment slip has already been submitted and is currently pending admin verification.'
        });
        return;
      }

      // Cancelled or rejected order
      if (['cancelled', 'rejected'].includes(existingOrder.status)) {
        res.status(400).json({
          success: false,
          error: 'Cannot submit final payment for a cancelled or rejected order.'
        });
        return;
      }

      const orderPhone = normalizeEthiopianPhone(existingOrder.customerPhone);
      const userPhone = req.user?.phone ? normalizeEthiopianPhone(req.user.phone) : '';
      const providedPhone = req.body.customerPhone ? normalizeEthiopianPhone(String(req.body.customerPhone)) : '';

      const isAdmin = req.user?.role === 'admin';
      const isOwner = Boolean(
        req.user && (
          (existingOrder.userId && existingOrder.userId === req.user.id) ||
          (orderPhone && userPhone && orderPhone === userPhone)
        )
      );
      const isVerifiedGuest = Boolean(!req.user && providedPhone && orderPhone && providedPhone === orderPhone);

      // Distinguish unauthenticated from unauthorized
      if (!req.user && !providedPhone) {
        res.status(401).json({
          success: false,
          error: 'Authentication or customer phone verification is required to finalize this reservation.'
        });
        return;
      }

      if (!isAdmin && !isOwner && !isVerifiedGuest) {
        res.status(403).json({
          success: false,
          error: 'Access denied: You must be logged in with the ordering account or provide the phone number used during checkout to finalize this reservation.'
        });
        return;
      }

      const wantsDelivery = Boolean(isDelivery === true || isDelivery === 'true');
      let finalDeliveryFee = 0;
      let finalVehicleType = vehicleType;
      let finalVehicleName = vehicleName;
      let finalDistanceKm: number | undefined = distanceKm ? Number(distanceKm) : undefined;
      let finalDistanceCategory: string | undefined = distanceCategory;
      const finalAddress = (deliveryAddress || deliveryLocation || '').trim();

      if (wantsDelivery) {
        if (!finalAddress) {
          res.status(400).json({
            success: false,
            error: 'Delivery address or location is required when requesting doorstep delivery.'
          });
          return;
        }

        const validVehicleTypes = ['car', 'pickup', 'large_pickup'];
        if (vehicleType && !validVehicleTypes.includes(vehicleType)) {
          res.status(400).json({
            success: false,
            error: `Invalid vehicle type "${vehicleType}". Allowed vehicle types are: ${validVehicleTypes.join(', ')}`
          });
          return;
        }

        const dLat = deliveryLatitude !== undefined && deliveryLatitude !== '' ? Number(deliveryLatitude) : undefined;
        const dLng = deliveryLongitude !== undefined && deliveryLongitude !== '' ? Number(deliveryLongitude) : undefined;

        if (dLat !== undefined && (isNaN(dLat) || dLat < -90 || dLat > 90)) {
          res.status(400).json({
            success: false,
            error: 'Invalid delivery latitude. Must be between -90 and 90.'
          });
          return;
        }
        if (dLng !== undefined && (isNaN(dLng) || dLng < -180 || dLng > 180)) {
          res.status(400).json({
            success: false,
            error: 'Invalid delivery longitude. Must be between -180 and 180.'
          });
          return;
        }

        // Build load items to accurately determine vehicle capacity and price
        const loadItems: DeliveryLoadItem[] = [];
        if (existingOrder.animalType) {
          loadItems.push({
            type: existingOrder.animalType as any,
            quantity: 1,
            weightKg: 40
          });
        } else if (existingOrder.isPackage) {
          loadItems.push({
            type: 'package',
            quantity: 1,
            weightKg: 25
          });
        }

        const authoritativeDelivery = await DeliveryService.validateAndCalculateAuthoritativeDelivery({
          deliveryAddress: finalAddress,
          deliveryLat: dLat,
          deliveryLng: dLng,
          vehicleType: vehicleType,
          items: loadItems
        });

        if (!authoritativeDelivery.isValid) {
          res.status(400).json({
            success: false,
            error: authoritativeDelivery.error || 'Selected delivery location is outside the allowable delivery radius.'
          });
          return;
        }

        // Check if package qualifies for free delivery
        const isFreeDelivery = Boolean(
          req.body.isFreeDelivery === true ||
          req.body.isFreeDelivery === 'true' ||
          (existingOrder.isPackage && (
            (existingOrder.packageDetails?.categoryCount && Number(existingOrder.packageDetails.categoryCount) >= 3) ||
            (existingOrder.packageDetails?.items && new Set(existingOrder.packageDetails.items.map((i: any) => i.category)).size >= 3) ||
            (!existingOrder.packageDetails?.items)
          ))
        );

        finalDeliveryFee = isFreeDelivery ? 0 : authoritativeDelivery.deliveryFee;
        finalVehicleType = authoritativeDelivery.vehicleType;
        finalVehicleName = authoritativeDelivery.vehicleName;
        finalDistanceKm = authoritativeDelivery.distanceKm;
        finalDistanceCategory = authoritativeDelivery.distanceCategory;
      }

      const result = await PostgresDB.submitFinalPayment(
        orderId,
        slipUrl,
        paymentMethod,
        transactionReference,
        {
          isDelivery: wantsDelivery,
          deliveryLocation: finalAddress,
          deliveryAddress: finalAddress,
          deliveryLatitude: deliveryLatitude ? Number(deliveryLatitude) : undefined,
          deliveryLongitude: deliveryLongitude ? Number(deliveryLongitude) : undefined,
          vehicleType: finalVehicleType,
          vehicleName: finalVehicleName,
          deliveryFee: finalDeliveryFee,
          distanceKm: finalDistanceKm,
          distanceCategory: finalDistanceCategory,
          customerNotes
        }
      );
      if (!result) {
        res.status(404).json({ success: false, error: 'Reservation order not found' });
        return;
      }

      // 🚀 REALTIME BROADCAST: Notify admin of final balance slip
      realtimeService.broadcast('FINAL_PAYMENT_SLIP', {
        order: result.order,
        notification: result.notification
      });

      res.json({
        success: true,
        message: '💳 Final payment receipt submitted successfully! Admin will verify and approve your completion.',
        order: result.order,
        notification: result.notification
      });
    } catch (error: any) {
      console.error('Final payment submission error:', error);
      res.status(500).json({ success: false, error: 'Failed to submit final payment' });
    }
  }
);

// ==================== ADMIN: APPROVE 50% RESERVATION DEPOSIT ====================
router.post('/:id/verify-reservation', authenticateToken, requireAdmin, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { adminNotes } = req.body;
    const adminName = req.user?.name || 'Administrator';

    const existingOrder = await PostgresDB.getOrderById(req.params.id);
    if (!existingOrder) {
      res.status(404).json({ success: false, error: 'Reservation order not found' });
      return;
    }
    if (!existingOrder.isReservation) {
      res.status(400).json({ success: false, error: 'This order is not a reservation order.' });
      return;
    }
    if (existingOrder.status === 'reserved') {
      res.status(400).json({ success: false, error: 'Reservation deposit has already been verified and approved.' });
      return;
    }
    if (['verified', 'completed', 'delivered'].includes(existingOrder.status)) {
      res.status(400).json({ success: false, error: 'Order is already fully completed and verified.' });
      return;
    }
    if (['rejected', 'cancelled'].includes(existingOrder.status)) {
      res.status(400).json({ success: false, error: 'Cannot approve a rejected or cancelled reservation.' });
      return;
    }

    const result = await PostgresDB.verifyReservation(req.params.id, adminName, adminNotes);
    if (!result) {
      res.status(404).json({ success: false, error: 'Reservation order not found' });
      return;
    }

    // 🚀 REALTIME BROADCAST
    realtimeService.broadcast('RESERVATION_APPROVED', {
      order: result.order,
      animal: result.animal,
      notification: result.notification
    });

    if (result.animal) {
      realtimeService.broadcast('ANIMAL_UPDATED', result.animal);
    }

    res.json({
      success: true,
      message: `🛡️ Reservation ${result.order.id} verified and approved. 50% deposit confirmed.`,
      order: result.order,
      animal: result.animal
    });
  } catch (error: any) {
    console.error('Error approving reservation:', error);
    res.status(500).json({ success: false, error: 'Failed to verify reservation' });
  }
});

// ==================== ADMIN: APPROVE FINAL REMAINING 50% PAYMENT (Mark Item Sold) ====================
router.post('/:id/verify-final', authenticateToken, requireAdmin, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { adminNotes } = req.body;
    const adminName = req.user?.name || 'Administrator';

    const existingOrder = await PostgresDB.getOrderById(req.params.id);
    if (!existingOrder) {
      res.status(404).json({ success: false, error: 'Order not found' });
      return;
    }
    if (!existingOrder.isReservation) {
      res.status(400).json({ success: false, error: 'This order is not a reservation order.' });
      return;
    }
    if (existingOrder.status === 'reservation_pending') {
      res.status(400).json({
        success: false,
        error: 'Cannot verify final payment before the initial 50% reservation deposit has been approved.'
      });
      return;
    }
    if (['verified', 'completed', 'delivered'].includes(existingOrder.status)) {
      res.status(400).json({
        success: false,
        error: 'Final payment has already been verified and order marked as sold.'
      });
      return;
    }
    if (['rejected', 'cancelled'].includes(existingOrder.status)) {
      res.status(400).json({
        success: false,
        error: 'Cannot verify final payment for a rejected or cancelled order.'
      });
      return;
    }

    const result = await PostgresDB.verifyFinalPayment(req.params.id, adminName, adminNotes);
    if (!result) {
      res.status(404).json({ success: false, error: 'Order not found' });
      return;
    }

    // 🚀 REALTIME BROADCAST
    realtimeService.broadcast('ORDER_VERIFIED', {
      order: result.order,
      animal: result.animal,
      notification: result.notification
    });

    if (result.animal) {
      realtimeService.broadcast('ANIMAL_UPDATED', result.animal);
    }

    res.json({
      success: true,
      message: `🎉 Order ${result.order.id} fully settled, verified, and marked as SOLD!`,
      order: result.order,
      animal: result.animal
    });
  } catch (error: any) {
    console.error('Error verifying final payment:', error);
    res.status(500).json({ success: false, error: 'Failed to verify final payment' });
  }
});

// ==================== GET RESERVATIONS ====================
router.get('/reservations', authenticateToken, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, error: 'Unauthorized' });
      return;
    }

    const reservations = req.user.role === 'admin'
      ? await PostgresDB.getReservations()
      : await PostgresDB.getReservations(req.user.id, req.user.phone);

    res.json({ success: true, count: reservations.length, data: reservations });
  } catch (error: any) {
    console.error('Error fetching reservations:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch reservations' });
  }
});

// ==================== GET DIRECT FULL PAYMENT ORDERS ====================
router.get('/direct-orders', authenticateToken, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, error: 'Unauthorized' });
      return;
    }

    const directOrders = req.user.role === 'admin'
      ? await PostgresDB.getDirectOrders()
      : await PostgresDB.getDirectOrders(req.user.id, req.user.phone);

    res.json({ success: true, count: directOrders.length, data: directOrders });
  } catch (error: any) {
    console.error('Error fetching direct orders:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch direct orders' });
  }
});

// ==================== GET USER'S ALL ORDERS & RESERVATIONS ====================
router.get('/my-orders', authenticateToken, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, error: 'Unauthorized' });
      return;
    }

    const orders = await PostgresDB.getOrdersByUserId(req.user.id, req.user.phone);
    res.json({ success: true, count: orders.length, data: orders });
  } catch (error: any) {
    console.error('Error fetching user orders:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch your orders' });
  }
});

// ==================== GET ALL ORDERS (STRICTLY ADMIN ONLY) ====================
router.get('/', authenticateToken, requireAdmin, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { status, phone, email, isReservation, isPackage } = req.query;
    let orders = await PostgresDB.getOrders();

    if (phone && typeof phone === 'string') {
      orders = orders.filter(o => o.customerPhone.includes(phone));
    } else if (email && typeof email === 'string') {
      orders = orders.filter(o => o.customerEmail?.toLowerCase() === email.toLowerCase());
    }

    if (status && typeof status === 'string' && status !== 'all') {
      orders = orders.filter(o => o.status === status);
    }

    if (isReservation !== undefined) {
      orders = orders.filter(o => o.isReservation === (isReservation === 'true'));
    }

    if (isPackage !== undefined) {
      orders = orders.filter(o => o.isPackage === (isPackage === 'true'));
    }

    res.json({ success: true, count: orders.length, data: orders });
  } catch (error: any) {
    console.error('Error fetching orders:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch orders' });
  }
});

// ==================== GET SINGLE ORDER BY ID ====================
router.get('/:id', optionalAuth, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const order = await PostgresDB.getOrderById(req.params.id);
    if (!order) {
      res.status(404).json({ success: false, error: 'Order not found' });
      return;
    }

    const orderPhone = normalizeEthiopianPhone(order.customerPhone);
    const userPhone = req.user?.phone ? normalizeEthiopianPhone(req.user.phone) : '';
    const queryPhone = req.query.phone ? normalizeEthiopianPhone(String(req.query.phone)) : '';

    // Authorization checks:
    // 1. Admin can view any order
    const isAdmin = req.user?.role === 'admin';

    // 2. Authenticated customer who owns this order
    const isOwner = Boolean(
      req.user && (
        (order.userId && order.userId === req.user.id) ||
        (orderPhone && userPhone && orderPhone === userPhone)
      )
    );

    // 3. Guest lookup with verification phone parameter
    const isVerifiedGuest = Boolean(!req.user && queryPhone && orderPhone && queryPhone === orderPhone);

    if (!isAdmin && !isOwner && !isVerifiedGuest) {
      res.status(403).json({
        success: false,
        error: 'Access denied: Please sign in to view your order, or provide your verification phone number.'
      });
      return;
    }

    // If customer is authenticated and this was an unlinked guest order with matching phone, auto-claim it!
    if (req.user && !order.userId && orderPhone && userPhone && orderPhone === userPhone) {
      await PostgresDB.claimGuestOrdersByPhone(req.user.id, orderPhone);
      order.userId = req.user.id;
    }

    res.json({ success: true, data: order });
  } catch (error: any) {
    console.error('Error fetching order:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch order details' });
  }
});

// ==================== GET SHORT-LIVED SCOPED RECEIPT ACCESS TOKEN ====================
router.get('/:id/receipt-token', optionalAuth, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const order = await prisma.order.findFirst({
      where: { id: { equals: req.params.id, mode: 'insensitive' } }
    });

    if (!order) {
      res.status(404).json({ success: false, error: 'Order not found' });
      return;
    }

    const orderPhone = normalizeEthiopianPhone(order.customerPhone);
    const userPhone = req.user?.phone ? normalizeEthiopianPhone(req.user.phone) : '';
    const queryPhone = req.query.phone ? normalizeEthiopianPhone(String(req.query.phone)) : '';

    const isAdmin = req.user?.role === 'admin';
    const isOwner = Boolean(
      req.user && (
        (order.userId && order.userId === req.user.id) ||
        (orderPhone && userPhone && orderPhone === userPhone)
      )
    );
    const isVerifiedGuest = Boolean(!req.user && queryPhone && orderPhone && queryPhone === orderPhone);

    if (!isAdmin && !isOwner && !isVerifiedGuest) {
      if (!req.user && !queryPhone) {
        res.status(401).json({ success: false, error: 'Authentication required to generate receipt token.' });
        return;
      }
      res.status(403).json({ success: false, error: 'Access denied: You are not authorized to view this receipt.' });
      return;
    }

    // Generate dedicated short-lived receipt token (strictly valid for 120s / 2m, scoped only to this order)
    const receiptToken = generateReceiptToken({
      orderId: order.id,
      userId: req.user?.id,
      role: req.user?.role,
      phone: req.user?.phone || queryPhone
    }, 120);

    res.json({
      success: true,
      receiptToken,
      expiresIn: 120,
      url: `/api/orders/${order.id}/receipt-file?token=${encodeURIComponent(receiptToken)}`
    });
  } catch (error: any) {
    console.error('Error generating receipt token:', error);
    res.status(500).json({ success: false, error: sanitizeErrorMessage(error, 'Failed to generate receipt token') });
  }
});

// ==================== GET ORDER RECEIPT FILE (AUTHENTICATED & PRIVATE) ====================
router.get('/:id/receipt-file', optionalAuth, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    // 1. Fetch raw order from database
    const order = await prisma.order.findFirst({
      where: { id: { equals: req.params.id, mode: 'insensitive' } }
    });

    if (!order) {
      res.status(404).json({ success: false, error: 'Order not found' });
      return;
    }

    const orderPhone = normalizeEthiopianPhone(order.customerPhone);
    const userPhone = req.user?.phone ? normalizeEthiopianPhone(req.user.phone) : '';
    const queryPhone = req.query.phone ? normalizeEthiopianPhone(String(req.query.phone)) : '';

    // 2. Authorization Rules
    // Check if a dedicated short-lived receipt-specific capability token was presented
    const receiptData = req.receiptTokenData;
    let isAuthorizedByReceiptToken = false;
    if (receiptData && receiptData.tokenType === 'receipt') {
      if (receiptData.orderId && receiptData.orderId.toLowerCase() === order.id.toLowerCase()) {
        isAuthorizedByReceiptToken = true;
      } else {
        // Token presented is explicitly for a different order -> reject immediately (prevents cross-order IDOR)
        res.status(403).json({
          success: false,
          error: 'Access denied: Receipt token is not valid for this order.'
        });
        return;
      }
    }

    // - Admin: allowed
    const isAdmin = req.user?.role === 'admin';

    // - Order owner: allowed (account owner or matching verified phone)
    const isOwner = Boolean(
      req.user && (
        (order.userId && order.userId === req.user.id) ||
        (orderPhone && userPhone && orderPhone === userPhone)
      )
    );

    // - Guest users: allowed only if query phone matches order customer phone
    const isVerifiedGuest = Boolean(!req.user && queryPhone && orderPhone && queryPhone === orderPhone);

    if (!isAuthorizedByReceiptToken && !isAdmin && !isOwner && !isVerifiedGuest) {
      if (!req.user && !queryPhone) {
        res.status(401).json({
          success: false,
          error: 'Authentication or customer phone verification required to view this receipt.'
        });
        return;
      }
      res.status(403).json({
        success: false,
        error: 'Access denied: You are not authorized to view this receipt.'
      });
      return;
    }

    // 3. Determine target receipt (initial deposit vs final balance slip)
    const receiptType = (req.query.type || 'initial').toString().toLowerCase();
    let rawSlip = receiptType === 'final' ? order.finalPaymentSlipUrl : order.paymentSlipUrl;
    if (!rawSlip && !req.query.type) {
      rawSlip = order.paymentSlipUrl || order.finalPaymentSlipUrl;
    }

    if (!rawSlip) {
      res.status(404).json({ success: false, error: 'No receipt file on record for this order.' });
      return;
    }

    // 4. Safe filename extraction (protects against directory traversal and path exposure)
    const filename = path.basename(rawSlip);
    if (!filename || filename.includes('\0') || filename.includes('..') || filename.includes('/') || filename.includes('\\')) {
      res.status(400).json({ success: false, error: 'Invalid receipt file identifier.' });
      return;
    }

    // 5. Locate file on server (check private receipts directory first, then legacy uploads directory)
    let resolvedPath = path.join(RECEIPTS_DIR, filename);
    if (!fs.existsSync(resolvedPath)) {
      resolvedPath = path.join(UPLOADS_DIR, filename);
      if (!fs.existsSync(resolvedPath)) {
        res.status(404).json({ success: false, error: 'Receipt file not found on server disk.' });
        return;
      }
    }

    // 6. Prevent path escaping
    const normalizedResolved = path.resolve(resolvedPath);
    const inReceipts = normalizedResolved.startsWith(path.resolve(RECEIPTS_DIR));
    const inUploads = normalizedResolved.startsWith(path.resolve(UPLOADS_DIR));
    if (!inReceipts && !inUploads) {
      res.status(403).json({ success: false, error: 'Access denied.' });
      return;
    }

    // 7. MIME type resolution & secure response headers
    const ext = path.extname(filename).toLowerCase();
    const mimeMap: Record<string, string> = {
      '.jpg': 'image/jpeg',
      '.jpeg': 'image/jpeg',
      '.png': 'image/png',
      '.webp': 'image/webp',
      '.gif': 'image/gif',
      '.pdf': 'application/pdf'
    };
    const contentType = mimeMap[ext] || 'application/octet-stream';

    res.setHeader('Content-Type', contentType);
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('Cache-Control', 'private, no-cache, no-store, must-revalidate, max-age=0');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');
    res.setHeader('Referrer-Policy', 'no-referrer');
    res.setHeader('Content-Security-Policy', "default-src 'none'; style-src 'unsafe-inline'; sandbox");
    res.setHeader('Content-Disposition', `inline; filename="${filename}"`);

    res.sendFile(resolvedPath);
  } catch (error: any) {
    console.error('Error serving receipt file:', error);
    res.status(500).json({ success: false, error: sanitizeErrorMessage(error, 'Failed to retrieve receipt file') });
  }
});

// ==================== ADMIN: STANDARD 100% VERIFICATION ====================
router.post('/:id/verify', authenticateToken, requireAdmin, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { adminNotes } = req.body;
    const adminName = req.user?.name || 'Administrator';

    const existingOrder = await PostgresDB.getOrderById(req.params.id);
    if (!existingOrder) {
      res.status(404).json({ success: false, error: 'Order not found' });
      return;
    }
    if (['verified', 'completed', 'delivered'].includes(existingOrder.status)) {
      res.status(400).json({ success: false, error: 'Order has already been verified and completed.' });
      return;
    }
    if (['rejected', 'cancelled'].includes(existingOrder.status)) {
      res.status(400).json({ success: false, error: 'Cannot verify a rejected or cancelled order.' });
      return;
    }

    const result = await PostgresDB.verifyOrder(req.params.id, adminName, adminNotes);
    if (!result) {
      res.status(404).json({ success: false, error: 'Order not found' });
      return;
    }

    // 🚀 REALTIME BROADCAST
    realtimeService.broadcast('ORDER_VERIFIED', {
      order: result.order,
      animal: result.animal,
      notification: result.notification
    });

    if (result.animal) {
      realtimeService.broadcast('ANIMAL_UPDATED', result.animal);
    }

    res.json({
      success: true,
      message: `Order ${result.order.id} verified successfully. ${result.animal ? result.animal.breed + ' stock updated / marked as SOLD.' : ''}`,
      order: result.order,
      animal: result.animal
    });
  } catch (error: any) {
    console.error('Error verifying order:', error);
    res.status(500).json({ success: false, error: 'Failed to verify order' });
  }
});

// ==================== ADMIN: REJECT ORDER ====================
router.post('/:id/reject', authenticateToken, requireAdmin, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { reason } = req.body;
    if (!reason || !reason.trim()) {
      res.status(400).json({ success: false, error: 'A reason is required to reject an order' });
      return;
    }

    const existingOrder = await PostgresDB.getOrderById(req.params.id);
    if (!existingOrder) {
      res.status(404).json({ success: false, error: 'Order not found' });
      return;
    }
    if (['verified', 'completed', 'delivered'].includes(existingOrder.status)) {
      res.status(400).json({ success: false, error: 'Cannot reject an already completed and verified order.' });
      return;
    }
    if (existingOrder.status === 'rejected') {
      res.status(400).json({ success: false, error: 'Order has already been rejected.' });
      return;
    }

    const result = await PostgresDB.rejectOrder(req.params.id, reason.trim());
    if (!result) {
      res.status(404).json({ success: false, error: 'Order not found' });
      return;
    }

    // 🚀 REALTIME BROADCAST
    realtimeService.broadcast('ORDER_REJECTED', {
      order: result.order,
      animal: result.animal
    });

    if (result.animal) {
      realtimeService.broadcast('ANIMAL_UPDATED', result.animal);
    }

    res.json({
      success: true,
      message: `Order ${result.order.id} has been rejected.`,
      order: result.order,
      animal: result.animal
    });
  } catch (error: any) {
    console.error('Error rejecting order:', error);
    res.status(500).json({ success: false, error: 'Failed to reject order' });
  }
});

// ==================== ADMIN: UPDATE ORDER STATUS ====================
router.post('/:id/status', authenticateToken, requireAdmin, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { status, adminNotes } = req.body;
    if (!status) {
      res.status(400).json({ success: false, error: 'Status is required' });
      return;
    }

    const VALID_ORDER_STATUSES: OrderStatus[] = [
      'pending_verification',
      'reservation_pending',
      'reserved',
      'final_payment_pending',
      'verified',
      'pickup_ready',
      'completed',
      'delivery_pending',
      'delivered',
      'rejected'
    ];
    if (!VALID_ORDER_STATUSES.includes(status)) {
      res.status(400).json({
        success: false,
        error: `Invalid status "${status}". Allowed statuses: ${VALID_ORDER_STATUSES.join(', ')}`
      });
      return;
    }

    const existingOrder = await PostgresDB.getOrderById(req.params.id);
    if (!existingOrder) {
      res.status(404).json({ success: false, error: 'Order not found' });
      return;
    }

    const updatedOrder = await PostgresDB.updateOrderStatus(req.params.id, status, adminNotes);
    if (!updatedOrder) {
      res.status(404).json({ success: false, error: 'Order not found' });
      return;
    }

    // 🚀 REALTIME BROADCAST
    realtimeService.broadcast('ORDER_UPDATED', updatedOrder);

    res.json({
      success: true,
      message: `Order ${updatedOrder.id} status updated to ${status}.`,
      order: updatedOrder
    });
  } catch (error: any) {
    console.error('Error updating order status:', error);
    res.status(500).json({ success: false, error: 'Failed to update order status' });
  }
});

// ==================== ADMIN: APPROVE DELIVERY & DISPATCH ====================
router.post('/:id/approve-delivery', authenticateToken, requireAdmin, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { status = 'delivery_pending', adminNotes } = req.body;
    const adminName = req.user?.name || 'Administrator';

    const validDeliveryStatuses = ['delivery_pending', 'delivered'];
    if (status && !validDeliveryStatuses.includes(status)) {
      res.status(400).json({
        success: false,
        error: `Invalid delivery status "${status}". Allowed: ${validDeliveryStatuses.join(', ')}`
      });
      return;
    }

    const existingOrder = await PostgresDB.getOrderById(req.params.id);
    if (!existingOrder) {
      res.status(404).json({ success: false, error: 'Order not found' });
      return;
    }
    if (['rejected', 'cancelled'].includes(existingOrder.status)) {
      res.status(400).json({ success: false, error: 'Cannot dispatch a rejected or cancelled order.' });
      return;
    }
    if (!existingOrder.isDelivery) {
      res.status(400).json({ success: false, error: 'Cannot assign delivery to a self-pickup order.' });
      return;
    }

    const result = await PostgresDB.approveDelivery(req.params.id, adminName, status, adminNotes);
    if (!result) {
      res.status(404).json({ success: false, error: 'Order not found' });
      return;
    }

    // 🚀 REALTIME BROADCAST
    realtimeService.broadcast('DELIVERY_APPROVED', {
      order: result.order,
      notification: result.notification
    });

    realtimeService.broadcast('ORDER_UPDATED', result.order);

    res.json({
      success: true,
      message: status === 'delivered'
        ? `✓ Order ${result.order.id} delivery completed.`
        : `🚚 Order ${result.order.id} dispatched for delivery.`,
      order: result.order,
      notification: result.notification
    });
  } catch (error: any) {
    console.error('Error approving delivery:', error);
    res.status(500).json({ success: false, error: 'Failed to approve delivery' });
  }
});

// ==================== ADMIN: UPDATE PICKUP STATUS ====================
router.post('/:id/pickup-status', authenticateToken, requireAdmin, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { status = 'pickup_ready', adminNotes } = req.body;
    const adminName = req.user?.name || 'Administrator';

    const validPickupStatuses = ['pickup_ready', 'completed'];
    if (status && !validPickupStatuses.includes(status)) {
      res.status(400).json({
        success: false,
        error: `Invalid pickup status "${status}". Allowed: ${validPickupStatuses.join(', ')}`
      });
      return;
    }

    const existingOrder = await PostgresDB.getOrderById(req.params.id);
    if (!existingOrder) {
      res.status(404).json({ success: false, error: 'Order not found' });
      return;
    }
    if (['rejected', 'cancelled'].includes(existingOrder.status)) {
      res.status(400).json({ success: false, error: 'Cannot update pickup status for a rejected or cancelled order.' });
      return;
    }
    if (existingOrder.isDelivery) {
      res.status(400).json({ success: false, error: 'This is a doorstep delivery order, not a hub pickup order.' });
      return;
    }

    const result = await PostgresDB.updatePickupStatus(req.params.id, adminName, status, adminNotes);
    if (!result) {
      res.status(404).json({ success: false, error: 'Order not found' });
      return;
    }

    // 🚀 REALTIME BROADCAST
    realtimeService.broadcast('ORDER_UPDATED', result.order);

    res.json({
      success: true,
      message: status === 'completed'
        ? `🤝 Order ${result.order.id} marked as picked up and completed.`
        : `📦 Order ${result.order.id} marked as ready for hub pickup.`,
      order: result.order,
      notification: result.notification
    });
  } catch (error: any) {
    console.error('Error updating pickup status:', error);
    res.status(500).json({ success: false, error: 'Failed to update pickup status' });
  }
});

// ==================== ADMIN: CLEAR RECEIPT SLIP FROM ORDER ====================
router.post('/:id/clear-receipt', authenticateToken, requireAdmin, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { receiptType = 'all' } = req.body;

    const existingOrder = await PostgresDB.getOrderById(req.params.id);
    if (!existingOrder) {
      res.status(404).json({ success: false, error: 'Order not found' });
      return;
    }

    const updated = await PostgresDB.clearOrderReceipt(req.params.id, receiptType);
    if (!updated) {
      res.status(404).json({ success: false, error: 'Order not found' });
      return;
    }

    // 🚀 REALTIME BROADCAST
    realtimeService.broadcast('ORDER_UPDATED', updated);

    res.json({
      success: true,
      message: `Receipt slip cleared successfully from order #${updated.id}`,
      order: updated
    });
  } catch (error: any) {
    console.error('Error clearing receipt:', error);
    res.status(500).json({ success: false, error: sanitizeErrorMessage(error, 'Failed to clear receipt') });
  }
});

// ==================== ADMIN: BULK CLEAR RECEIPTS ====================
router.post('/clear-all-receipts', authenticateToken, requireAdmin, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { statusFilter } = req.body;
    const clearedCount = await PostgresDB.clearAllReceipts(statusFilter);

    res.json({
      success: true,
      message: `Successfully cleared ${clearedCount} receipt slip(s).`,
      clearedCount
    });
  } catch (error: any) {
    console.error('Error clearing all receipts:', error);
    res.status(500).json({ success: false, error: sanitizeErrorMessage(error, 'Failed to clear all receipts') });
  }
});

export default router;
