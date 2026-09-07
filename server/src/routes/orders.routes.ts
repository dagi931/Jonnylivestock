import { Router, Response } from 'express';
import { PostgresDB } from '../db/postgresDb.js';
import { authenticateToken, requireAdmin, optionalAuth, AuthRequest } from '../middleware/auth.middleware.js';
import { uploadUserSlip } from '../middleware/upload.middleware.js';
import { Order, DeliveryLoadItem } from '../types/index.js';
import { DeliveryService } from '../services/delivery.service.js';
import { realtimeService } from '../services/realtime.service.js';
import { orderContactLimiter } from '../middleware/rateLimit.middleware.js';
import { sanitizeErrorMessage } from '../utils/errorHandler.js';

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

      if (!customerName || !customerPhone) {
        res.status(400).json({
          success: false,
          error: 'Customer name and phone number are required'
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

        if (animalData.status === 'sold' || (animalData.quantity !== undefined && animalData.quantity <= 0)) {
          res.status(400).json({ success: false, error: 'This animal is already sold / unavailable' });
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
        animalType = 'cow';
        const cutName = req.body.meatCut || 'Prime Cut';
        const kgVal = Number(req.body.meatKg) || 1;
        const pricePerKg = Number(req.body.pricePerKg) || 2500;
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

        if (totalAmount) {
          baseTotal = Number(totalAmount);
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

      // Handle slip file path or URL
      let slipUrl = '';
      if (req.file) {
        slipUrl = `/uploads/${req.file.filename}`;
      } else if (req.body.paymentSlipUrl) {
        slipUrl = req.body.paymentSlipUrl;
      }

      const orderId = `ORD-${Date.now().toString().slice(-6)}`;
      const depositAmt = isRes ? Math.round(baseTotal * 0.5) : null;
      const remainingAmt = isRes ? baseTotal - (depositAmt || 0) : 0;

      const resolvedPhone = customerPhone && customerPhone.trim()
        ? customerPhone.trim()
        : (req.user && req.user.phone ? req.user.phone : '');

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
        slipUrl = `/uploads/${req.file.filename}`;
      } else if (req.body.finalPaymentSlipUrl) {
        slipUrl = req.body.finalPaymentSlipUrl;
      }

      if (!slipUrl) {
        res.status(400).json({ success: false, error: 'Payment receipt/slip is required to finalize reservation' });
        return;
      }

      const wantsDelivery = Boolean(isDelivery === true || isDelivery === 'true');
      const parsedDeliveryFee = wantsDelivery ? (Number(deliveryFee) || 0) : 0;

      const result = await PostgresDB.submitFinalPayment(
        orderId,
        slipUrl,
        paymentMethod,
        transactionReference,
        {
          isDelivery: wantsDelivery,
          deliveryLocation: deliveryLocation || deliveryAddress,
          deliveryAddress: deliveryAddress || deliveryLocation,
          deliveryLatitude: deliveryLatitude ? Number(deliveryLatitude) : undefined,
          deliveryLongitude: deliveryLongitude ? Number(deliveryLongitude) : undefined,
          vehicleType,
          vehicleName,
          deliveryFee: parsedDeliveryFee,
          distanceKm: distanceKm ? Number(distanceKm) : undefined,
          distanceCategory,
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

    // Customer can only view their own order
    if (req.user && req.user.role !== 'admin' && order.userId && order.userId !== req.user.id) {
      res.status(403).json({ success: false, error: 'Access denied' });
      return;
    }

    res.json({ success: true, data: order });
  } catch (error: any) {
    console.error('Error fetching order:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch order details' });
  }
});

// ==================== ADMIN: STANDARD 100% VERIFICATION ====================
router.post('/:id/verify', authenticateToken, requireAdmin, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { adminNotes } = req.body;
    const adminName = req.user?.name || 'Administrator';

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
    if (!reason) {
      res.status(400).json({ success: false, error: 'A reason is required to reject an order' });
      return;
    }

    const result = await PostgresDB.rejectOrder(req.params.id, reason);
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

// ==================== ADMIN: UPDATE ORDER STATUS (e.g. delivery_pending, delivered) ====================
router.post('/:id/status', authenticateToken, requireAdmin, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { status, adminNotes } = req.body;
    if (!status) {
      res.status(400).json({ success: false, error: 'Status is required' });
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

// ==================== ADMIN: UPDATE PICKUP STATUS (pickup_ready or completed) ====================
router.post('/:id/pickup-status', authenticateToken, requireAdmin, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { status = 'pickup_ready', adminNotes } = req.body;
    const adminName = req.user?.name || 'Administrator';

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
        : `📦 Order ${result.order.id} marked as ready for farm pickup.`,
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
    res.status(500).json({ success: false, error: error.message || 'Failed to clear receipt' });
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
    res.status(500).json({ success: false, error: error.message || 'Failed to clear all receipts' });
  }
});

export default router;
