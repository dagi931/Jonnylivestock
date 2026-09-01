import { Router, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { JsonDB } from '../db/jsonDb.js';
import { authenticateToken, requireAdmin, optionalAuth, AuthRequest } from '../middleware/auth.middleware.js';
import { uploadSlip } from '../middleware/upload.middleware.js';
import { Order, OrderStatus } from '../types/index.js';

const router = Router();

// ==================== CREATE ORDER WITH PAYMENT SLIP ====================
router.post(
  '/',
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
        selectedServices,
        servicesFee,
        paymentMethod,
        bankAccountId,
        transactionReference,
        customerNotes
      } = req.body;

      if (!customerName || !customerPhone || !animalId) {
        res.status(400).json({
          success: false,
          error: 'Customer name, phone number, and animal ID are required'
        });
        return;
      }

      // Check animal existence
      const animal = JsonDB.getAnimalById(animalId);
      if (!animal) {
        res.status(404).json({ success: false, error: 'Selected animal not found' });
        return;
      }

      if (animal.status === 'sold') {
        res.status(400).json({ success: false, error: 'This animal is already sold' });
        return;
      }

      // Parse services array if needed
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
      const total = animal.price + fee;

      // Handle slip file path or URL
      let slipUrl = '';
      if (req.file) {
        slipUrl = `/uploads/${req.file.filename}`;
      } else if (req.body.paymentSlipUrl) {
        slipUrl = req.body.paymentSlipUrl;
      }

      const newOrder: Order = {
        id: `ORD-${Date.now().toString().slice(-6)}`,
        userId: req.user ? req.user.id : undefined,
        customerName: customerName.trim(),
        customerPhone: customerPhone.trim(),
        customerEmail: customerEmail ? customerEmail.trim() : (req.user ? req.user.email : undefined),
        deliveryLocation: deliveryLocation ? deliveryLocation.trim() : undefined,
        animalId: animal.id,
        animalBreed: animal.breed,
        animalType: animal.type,
        animalPrice: animal.price,
        selectedServices: parsedServices,
        servicesFee: fee,
        totalAmount: total,
        paymentMethod: paymentMethod || 'Telebirr',
        bankAccountId: bankAccountId || undefined,
        paymentSlipUrl: slipUrl,
        transactionReference: transactionReference ? transactionReference.trim() : undefined,
        customerNotes: customerNotes ? customerNotes.trim() : undefined,
        status: 'pending_verification',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      // Set animal to reserved so others know it's being purchased
      JsonDB.updateAnimal(animal.id, { status: 'reserved' });

      const createdOrder = JsonDB.createOrder(newOrder);

      res.status(201).json({
        success: true,
        message: 'Payment slip submitted successfully! Admin has been notified for verification.',
        order: createdOrder
      });
    } catch (error: any) {
      console.error('Order creation error:', error);
      res.status(500).json({ success: false, error: error.message || 'Failed to submit order' });
    }
  }
);

// ==================== GET USER'S OWN ORDERS ====================
router.get('/my-orders', authenticateToken, (req: AuthRequest, res: Response): void => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, error: 'Unauthorized' });
      return;
    }

    const orders = JsonDB.getOrdersByUserId(req.user.id);
    res.json({ success: true, count: orders.length, data: orders });
  } catch (error: any) {
    console.error('Error fetching user orders:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch your orders' });
  }
});

// ==================== GET ALL ORDERS (Admin or with optional user filter) ====================
router.get('/', optionalAuth, (req: AuthRequest, res: Response): void => {
  try {
    const { status, phone, email } = req.query;
    let orders = JsonDB.getOrders();

    // If regular customer query without admin, filter by user/phone
    if (req.user && req.user.role !== 'admin') {
      orders = orders.filter(o => o.userId === req.user?.id || o.customerPhone === req.user?.phone);
    } else if (phone && typeof phone === 'string') {
      orders = orders.filter(o => o.customerPhone.includes(phone));
    } else if (email && typeof email === 'string') {
      orders = orders.filter(o => o.customerEmail?.toLowerCase() === email.toLowerCase());
    }

    if (status && typeof status === 'string' && status !== 'all') {
      orders = orders.filter(o => o.status === status);
    }

    res.json({ success: true, count: orders.length, data: orders });
  } catch (error: any) {
    console.error('Error fetching orders:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch orders' });
  }
});

// ==================== GET SINGLE ORDER BY ID ====================
router.get('/:id', optionalAuth, (req: AuthRequest, res: Response): void => {
  try {
    const order = JsonDB.getOrderById(req.params.id);
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

// ==================== ADMIN: VERIFY PAYMENT & APPROVE ORDER ====================
router.post('/:id/verify', authenticateToken, requireAdmin, (req: AuthRequest, res: Response): void => {
  try {
    const { adminNotes } = req.body;
    const adminName = req.user?.name || 'Administrator';

    const result = JsonDB.verifyOrder(req.params.id, adminName, adminNotes);
    if (!result) {
      res.status(404).json({ success: false, error: 'Order not found' });
      return;
    }

    res.json({
      success: true,
      message: `Order ${result.order.id} verified successfully. ${result.animal ? result.animal.breed + ' marked as SOLD.' : ''}`,
      order: result.order,
      animal: result.animal
    });
  } catch (error: any) {
    console.error('Error verifying order:', error);
    res.status(500).json({ success: false, error: 'Failed to verify order' });
  }
});

// ==================== ADMIN: REJECT ORDER ====================
router.post('/:id/reject', authenticateToken, requireAdmin, (req: AuthRequest, res: Response): void => {
  try {
    const { reason } = req.body;
    if (!reason) {
      res.status(400).json({ success: false, error: 'A reason is required to reject an order' });
      return;
    }

    const order = JsonDB.rejectOrder(req.params.id, reason);
    if (!order) {
      res.status(404).json({ success: false, error: 'Order not found' });
      return;
    }

    res.json({
      success: true,
      message: `Order ${order.id} has been rejected.`,
      order
    });
  } catch (error: any) {
    console.error('Error rejecting order:', error);
    res.status(500).json({ success: false, error: 'Failed to reject order' });
  }
});

export default router;
