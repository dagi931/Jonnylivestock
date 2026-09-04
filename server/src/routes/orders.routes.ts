import { Router, Response } from 'express';
import { PostgresDB } from '../db/postgresDb.js';
import { authenticateToken, requireAdmin, optionalAuth, AuthRequest } from '../middleware/auth.middleware.js';
import { uploadSlip } from '../middleware/upload.middleware.js';
import { Order } from '../types/index.js';
import { realtimeService } from '../services/realtime.service.js';
import { orderContactLimiter } from '../middleware/rateLimit.middleware.js';

const router = Router();

// ==================== CREATE ORDER / RESERVATION (Animal or Package) ====================
router.post(
  '/',
  orderContactLimiter,
  optionalAuth,
  uploadSlip.single('paymentSlip'),
  async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const {
        customerName,
        customerPhone,
        customerEmail,
        deliveryLocation,
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
      let calculatedTotal = 0;
      let animalBreed = '';
      let animalType = '';
      let animalPrice = 0;

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
        calculatedTotal = animalData.price;
      } else if (isMeat) {
        animalType = 'cow';
        const cutName = req.body.meatCut || 'Prime Cut';
        const kgVal = Number(req.body.meatKg) || 1;
        animalBreed = `Raw Ox Beef (${cutName}) - ${kgVal} KG`;
        animalPrice = Number(totalAmount) || 0;
        calculatedTotal = Number(totalAmount) || 0;
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

      const fee = Number(servicesFee) || 0;
      calculatedTotal += fee;

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
          calculatedTotal = Number(totalAmount);
        }
      } else if (isMeat) {
        parsedPackageDetails = {
          isMeatByKg: true,
          livestock: 'ox',
          cut: req.body.meatCut || 'Kurt',
          kg: Number(req.body.meatKg) || 1,
          pricePerKg: Number(req.body.pricePerKg) || 2500,
          isDelivery: Boolean(req.body.isDelivery === true || req.body.isDelivery === 'true'),
          deliveryAddress: deliveryLocation || undefined
        };
        if (totalAmount) {
          calculatedTotal = Number(totalAmount);
        }
      }

      // Handle slip file path or URL
      let slipUrl = '';
      if (req.file) {
        slipUrl = `/uploads/${req.file.filename}`;
      } else if (req.body.paymentSlipUrl) {
        slipUrl = req.body.paymentSlipUrl;
      }

      const orderId = `ORD-${Date.now().toString().slice(-6)}`;
      const depositAmt = isRes ? calculatedTotal * 0.5 : calculatedTotal;
      const remainingAmt = isRes ? calculatedTotal * 0.5 : 0;

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
        deliveryLocation: deliveryLocation ? deliveryLocation.trim() : undefined,
        animalId: animalData ? animalData.id : undefined,
        animalBreed: animalBreed || undefined,
        animalType: animalType || undefined,
        animalPrice: animalPrice || undefined,
        isPackage: isPkg,
        packageName: packageName || (isPkg ? 'Celebration Custom Package' : undefined),
        packageDetails: parsedPackageDetails,
        isReservation: isRes,
        depositAmount: depositAmt,
        remainingAmount: remainingAmt,
        selectedServices: parsedServices,
        servicesFee: fee,
        totalAmount: calculatedTotal,
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
      res.status(500).json({ success: false, error: error.message || 'Failed to submit order' });
    }
  }
);

// ==================== SUBMIT FINAL 50% PAYMENT SLIP (Customer Finishing Reservation) ====================
router.post(
  '/:id/final-payment',
  optionalAuth,
  uploadSlip.single('finalPaymentSlip'),
  async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const orderId = req.params.id;
      const { paymentMethod, transactionReference } = req.body;

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

      const result = await PostgresDB.submitFinalPayment(orderId, slipUrl, paymentMethod, transactionReference);
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

    let reservations = await PostgresDB.getReservations();

    // If regular customer, strictly filter to their own reservations
    if (req.user.role !== 'admin') {
      reservations = reservations.filter(r => r.userId === req.user?.id || (req.user?.phone && r.customerPhone === req.user.phone));
    }

    res.json({ success: true, count: reservations.length, data: reservations });
  } catch (error: any) {
    console.error('Error fetching reservations:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch reservations' });
  }
});

// ==================== GET USER'S OWN ORDERS & RESERVATIONS ====================
router.get('/my-orders', authenticateToken, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, error: 'Unauthorized' });
      return;
    }

    const orders = await PostgresDB.getOrdersByUserId(req.user.id);
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

export default router;
