import prisma from './prisma.js';
import { Animal, Order, User, AdminNotification, BankAccount, SavedPackage, PackageCatalogItem } from '../types/index.js';

export class PostgresDB {
  // ==================== ANIMALS ====================
  public static async getAnimals(): Promise<Animal[]> {
    const animals = await prisma.animal.findMany({
      orderBy: { createdAt: 'desc' }
    });
    return animals.map(a => ({
      ...a,
      type: a.type as Animal['type'],
      gender: a.gender as Animal['gender'],
      status: a.status as Animal['status'],
      video: a.video || undefined,
      createdAt: a.createdAt.toISOString()
    }));
  }

  public static async getAnimalById(id: string): Promise<Animal | null> {
    const animal = await prisma.animal.findFirst({
      where: { id: { equals: id, mode: 'insensitive' } }
    });
    if (!animal) return null;
    return {
      ...animal,
      type: animal.type as Animal['type'],
      gender: animal.gender as Animal['gender'],
      status: animal.status as Animal['status'],
      video: animal.video || undefined,
      createdAt: animal.createdAt.toISOString()
    };
  }

  public static async createAnimal(animalData: Animal): Promise<Animal> {
    const created = await prisma.animal.create({
      data: {
        id: animalData.id,
        type: animalData.type,
        breed: animalData.breed,
        gender: animalData.gender,
        weight: Number(animalData.weight),
        color: animalData.color,
        price: Number(animalData.price),
        quantity: animalData.quantity !== undefined ? Number(animalData.quantity) : 1,
        location: animalData.location,
        description: animalData.description,
        status: animalData.status || 'available',
        images: animalData.images || [],
        video: animalData.video || null,
        featured: Boolean(animalData.featured),
        characteristics: animalData.characteristics || [],
        createdAt: animalData.createdAt ? new Date(animalData.createdAt) : new Date()
      }
    });

    return {
      ...created,
      type: created.type as Animal['type'],
      gender: created.gender as Animal['gender'],
      status: created.status as Animal['status'],
      video: created.video || undefined,
      createdAt: created.createdAt.toISOString()
    };
  }

  public static async updateAnimal(id: string, updates: Partial<Animal>): Promise<Animal | null> {
    const existing = await prisma.animal.findFirst({
      where: { id: { equals: id, mode: 'insensitive' } }
    });
    if (!existing) return null;

    const updated = await prisma.animal.update({
      where: { id: existing.id },
      data: {
        ...(updates.type && { type: updates.type }),
        ...(updates.breed && { breed: updates.breed }),
        ...(updates.gender && { gender: updates.gender }),
        ...(updates.weight !== undefined && { weight: Number(updates.weight) }),
        ...(updates.color && { color: updates.color }),
        ...(updates.price !== undefined && { price: Number(updates.price) }),
        ...(updates.quantity !== undefined && { quantity: Number(updates.quantity) }),
        ...(updates.location && { location: updates.location }),
        ...(updates.description && { description: updates.description }),
        ...(updates.status && { status: updates.status }),
        ...(updates.images && { images: updates.images }),
        ...(updates.video !== undefined && { video: updates.video || null }),
        ...(updates.featured !== undefined && { featured: Boolean(updates.featured) }),
        ...(updates.characteristics && { characteristics: updates.characteristics })
      }
    });

    return {
      ...updated,
      type: updated.type as Animal['type'],
      gender: updated.gender as Animal['gender'],
      status: updated.status as Animal['status'],
      video: updated.video || undefined,
      createdAt: updated.createdAt.toISOString()
    };
  }

  public static async deleteAnimal(id: string): Promise<boolean> {
    const existing = await prisma.animal.findFirst({
      where: { id: { equals: id, mode: 'insensitive' } }
    });
    if (!existing) return false;

    await prisma.animal.delete({
      where: { id: existing.id }
    });
    return true;
  }

  // ==================== USERS ====================
  public static async getUsers(): Promise<User[]> {
    const users = await prisma.user.findMany({
      orderBy: { createdAt: 'desc' }
    });
    return users.map(u => ({
      ...u,
      role: u.role as User['role'],
      createdAt: u.createdAt.toISOString()
    }));
  }

  public static async findUserByEmail(email: string): Promise<User | null> {
    const user = await prisma.user.findFirst({
      where: { email: { equals: email, mode: 'insensitive' } }
    });
    if (!user) return null;
    return {
      ...user,
      role: user.role as User['role'],
      createdAt: user.createdAt.toISOString()
    };
  }

  public static async findUserById(id: string): Promise<User | null> {
    const user = await prisma.user.findUnique({
      where: { id }
    });
    if (!user) return null;
    return {
      ...user,
      role: user.role as User['role'],
      createdAt: user.createdAt.toISOString()
    };
  }

  public static async createUser(userData: User): Promise<User> {
    const created = await prisma.user.create({
      data: {
        id: userData.id,
        name: userData.name,
        email: userData.email.toLowerCase(),
        phone: userData.phone,
        passwordHash: userData.passwordHash,
        role: userData.role || 'customer',
        createdAt: userData.createdAt ? new Date(userData.createdAt) : new Date()
      }
    });
    return {
      ...created,
      role: created.role as User['role'],
      createdAt: created.createdAt.toISOString()
    };
  }

  public static async updateUserPhone(userId: string, phone: string): Promise<User | null> {
    try {
      const updated = await prisma.user.update({
        where: { id: userId },
        data: { phone }
      });
      return {
        ...updated,
        role: updated.role as User['role'],
        createdAt: updated.createdAt.toISOString()
      };
    } catch (e) {
      console.error('Failed to update user phone:', e);
      return null;
    }
  }

  // ==================== SAVED PACKAGES ====================
  public static async getSavedPackages(userId?: string): Promise<SavedPackage[]> {
    const saved = await prisma.savedPackage.findMany({
      where: userId ? { userId } : {},
      orderBy: { createdAt: 'desc' }
    });
    return saved.map(s => ({
      id: s.id,
      userId: s.userId || undefined,
      name: s.name,
      description: s.description || undefined,
      items: (s.items as unknown) as PackageCatalogItem[],
      totalPrice: s.totalPrice,
      createdAt: s.createdAt.toISOString()
    }));
  }

  public static async createSavedPackage(data: {
    userId?: string;
    name: string;
    description?: string;
    items: PackageCatalogItem[];
    totalPrice: number;
  }): Promise<SavedPackage> {
    const created = await prisma.savedPackage.create({
      data: {
        userId: data.userId || null,
        name: data.name,
        description: data.description || null,
        items: data.items as any,
        totalPrice: Number(data.totalPrice)
      }
    });
    return {
      id: created.id,
      userId: created.userId || undefined,
      name: created.name,
      description: created.description || undefined,
      items: (created.items as unknown) as PackageCatalogItem[],
      totalPrice: created.totalPrice,
      createdAt: created.createdAt.toISOString()
    };
  }

  public static async deleteSavedPackage(id: string, userId?: string): Promise<boolean> {
    try {
      const existing = await prisma.savedPackage.findFirst({
        where: {
          id,
          ...(userId && { userId })
        }
      });
      if (!existing) return false;

      await prisma.savedPackage.delete({
        where: { id }
      });
      return true;
    } catch {
      return false;
    }
  }

  // ==================== ORDERS & RESERVATIONS ====================
  private static formatOrder(o: any): Order {
    return {
      ...o,
      animalType: o.animalType || undefined,
      status: o.status as Order['status'],
      userId: o.userId || undefined,
      customerEmail: o.customerEmail || undefined,
      deliveryLocation: o.deliveryLocation || undefined,
      animalId: o.animalId || undefined,
      animalBreed: o.animalBreed || undefined,
      animalPrice: o.animalPrice !== null ? Number(o.animalPrice) : undefined,
      isPackage: Boolean(o.isPackage),
      packageName: o.packageName || undefined,
      packageDetails: o.packageDetails || undefined,
      isReservation: Boolean(o.isReservation),
      depositAmount: o.depositAmount !== null ? Number(o.depositAmount) : undefined,
      remainingAmount: o.remainingAmount !== null ? Number(o.remainingAmount) : undefined,
      finalPaymentSlipUrl: o.finalPaymentSlipUrl || undefined,
      finalPaymentMethod: o.finalPaymentMethod || undefined,
      finalTransactionRef: o.finalTransactionRef || undefined,
      finalVerifiedAt: o.finalVerifiedAt ? o.finalVerifiedAt.toISOString() : undefined,
      finalVerifiedBy: o.finalVerifiedBy || undefined,
      bankAccountId: o.bankAccountId || undefined,
      paymentSlipUrl: o.paymentSlipUrl || undefined,
      transactionReference: o.transactionReference || undefined,
      customerNotes: o.customerNotes || undefined,
      adminNotes: o.adminNotes || undefined,
      verifiedAt: o.verifiedAt ? o.verifiedAt.toISOString() : undefined,
      verifiedBy: o.verifiedBy || undefined,
      createdAt: o.createdAt.toISOString(),
      updatedAt: o.updatedAt.toISOString()
    };
  }

  public static async getOrders(): Promise<Order[]> {
    const orders = await prisma.order.findMany({
      orderBy: { createdAt: 'desc' }
    });
    return orders.map(this.formatOrder);
  }

  public static async getOrdersByUserId(userId: string): Promise<Order[]> {
    const orders = await prisma.order.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' }
    });
    return orders.map(this.formatOrder);
  }

  public static async getReservations(userId?: string): Promise<Order[]> {
    const orders = await prisma.order.findMany({
      where: {
        OR: [
          { isReservation: true },
          { depositAmount: { gt: 0 } },
          { status: { in: ['reservation_pending', 'reserved', 'final_payment_pending'] } }
        ],
        ...(userId && { userId })
      },
      orderBy: { createdAt: 'desc' }
    });
    return orders.map(this.formatOrder);
  }

  public static async getOrderById(id: string): Promise<Order | null> {
    const order = await prisma.order.findFirst({
      where: { id: { equals: id, mode: 'insensitive' } }
    });
    if (!order) return null;
    return this.formatOrder(order);
  }

  public static async createOrder(orderData: Partial<Order>): Promise<{ order: Order; notification: AdminNotification; animal: Animal | null }> {
    const isReservation = Boolean(orderData.isReservation);
    const totalAmount = Number(orderData.totalAmount);
    const depositAmount = isReservation ? totalAmount * 0.5 : totalAmount;
    const remainingAmount = isReservation ? totalAmount * 0.5 : 0;
    const status = isReservation ? 'reservation_pending' : (orderData.status || 'pending_verification');

    const createdOrder = await prisma.order.create({
      data: {
        id: orderData.id || `ORD-${Date.now().toString().slice(-6)}`,
        userId: orderData.userId || null,
        customerName: orderData.customerName || 'Valued Customer',
        customerPhone: orderData.customerPhone || '',
        customerEmail: orderData.customerEmail || null,
        deliveryLocation: orderData.deliveryLocation || null,
        
        animalId: orderData.animalId || null,
        animalBreed: orderData.animalBreed || null,
        animalType: orderData.animalType || null,
        animalPrice: orderData.animalPrice !== undefined ? Number(orderData.animalPrice) : null,
        
        isPackage: Boolean(orderData.isPackage),
        packageName: orderData.packageName || null,
        packageDetails: orderData.packageDetails || null,
        
        isReservation,
        depositAmount,
        remainingAmount,
        finalPaymentSlipUrl: null,

        selectedServices: orderData.selectedServices || [],
        servicesFee: Number(orderData.servicesFee || 0),
        totalAmount,
        paymentMethod: orderData.paymentMethod || 'Telebirr',
        bankAccountId: orderData.bankAccountId || null,
        paymentSlipUrl: orderData.paymentSlipUrl || null,
        transactionReference: orderData.transactionReference || null,
        customerNotes: orderData.customerNotes || null,
        status,
        adminNotes: orderData.adminNotes || null,
        createdAt: orderData.createdAt ? new Date(orderData.createdAt) : new Date(),
        updatedAt: orderData.updatedAt ? new Date(orderData.updatedAt) : new Date()
      }
    });

    // Create Notification
    const notifType = isReservation ? 'NEW_RESERVATION_DEPOSIT' : 'NEW_ORDER_SLIP';
    const notifTitle = isReservation ? '🛡️ New 50% Reservation Deposit Slip' : '📦 New Payment Slip Uploaded';
    const customerPhoneStr = orderData.customerPhone ? ` [📞 ${orderData.customerPhone}]` : '';
    const notifMsg = isReservation
      ? `${orderData.customerName}${customerPhoneStr} uploaded a 50% reservation deposit (${depositAmount.toLocaleString()} ETB of ${totalAmount.toLocaleString()} ETB) for ${orderData.packageName || orderData.animalBreed || 'Order'}.`
      : `${orderData.customerName}${customerPhoneStr} uploaded a payment slip for ${orderData.packageName || orderData.animalBreed || 'Order'} - ${totalAmount.toLocaleString()} ETB.`;

    const notif = await prisma.adminNotification.create({
      data: {
        id: `NOTIF-${Date.now().toString().slice(-6)}`,
        type: notifType,
        title: notifTitle,
        message: notifMsg,
        orderId: createdOrder.id,
        read: false,
        createdAt: new Date()
      }
    });

    // Update Animal status if animalId is specified
    let updatedAnimal: Animal | null = null;
    if (orderData.animalId) {
      const existingAnimal = await prisma.animal.findFirst({
        where: { id: { equals: orderData.animalId, mode: 'insensitive' } }
      });

      if (existingAnimal) {
        if (existingAnimal.quantity <= 1) {
          const res = await prisma.animal.update({
            where: { id: existingAnimal.id },
            data: { status: 'reserved' }
          });
          updatedAnimal = {
            ...res,
            type: res.type as Animal['type'],
            gender: res.gender as Animal['gender'],
            status: res.status as Animal['status'],
            video: res.video || undefined,
            createdAt: res.createdAt.toISOString()
          };
        } else {
          updatedAnimal = {
            ...existingAnimal,
            type: existingAnimal.type as Animal['type'],
            gender: existingAnimal.gender as Animal['gender'],
            status: existingAnimal.status as Animal['status'],
            video: existingAnimal.video || undefined,
            createdAt: existingAnimal.createdAt.toISOString()
          };
        }
      }
    }

    const formattedOrder = this.formatOrder(createdOrder);
    const formattedNotification: AdminNotification = {
      ...notif,
      type: notif.type as AdminNotification['type'],
      orderId: notif.orderId || undefined,
      createdAt: notif.createdAt.toISOString()
    };

    return { order: formattedOrder, notification: formattedNotification, animal: updatedAnimal };
  }

  // Customer uploads the 2nd slip (remaining 50% balance)
  public static async submitFinalPayment(
    orderId: string,
    finalSlipUrl: string,
    paymentMethod?: string,
    transactionRef?: string
  ): Promise<{ order: Order; notification: AdminNotification } | null> {
    const existing = await prisma.order.findFirst({
      where: { id: { equals: orderId, mode: 'insensitive' } }
    });
    if (!existing) return null;

    const updatedOrder = await prisma.order.update({
      where: { id: existing.id },
      data: {
        finalPaymentSlipUrl: finalSlipUrl,
        finalPaymentMethod: paymentMethod || existing.paymentMethod,
        finalTransactionRef: transactionRef || null,
        status: 'final_payment_pending',
        updatedAt: new Date()
      }
    });

    const customerPhoneStr = updatedOrder.customerPhone ? ` [📞 ${updatedOrder.customerPhone}]` : '';
    const notif = await prisma.adminNotification.create({
      data: {
        id: `NOTIF-${Date.now().toString().slice(-6)}`,
        type: 'FINAL_PAYMENT_SLIP',
        title: '💳 Final Balance Payment Slip Uploaded',
        message: `${updatedOrder.customerName}${customerPhoneStr} submitted the remaining 50% balance (${(updatedOrder.remainingAmount || 0).toLocaleString()} ETB) for Reservation ${updatedOrder.id}.`,
        orderId: updatedOrder.id,
        read: false,
        createdAt: new Date()
      }
    });

    return {
      order: this.formatOrder(updatedOrder),
      notification: {
        ...notif,
        type: notif.type as AdminNotification['type'],
        orderId: notif.orderId || undefined,
        createdAt: notif.createdAt.toISOString()
      }
    };
  }

  // Admin approves 50% reservation deposit -> status becomes 'reserved'
  public static async verifyReservation(
    orderId: string,
    adminName: string,
    adminNotes?: string
  ): Promise<{ order: Order; animal: Animal | null; notification: AdminNotification } | null> {
    const existing = await prisma.order.findFirst({
      where: { id: { equals: orderId, mode: 'insensitive' } }
    });
    if (!existing) return null;

    const updatedOrder = await prisma.order.update({
      where: { id: existing.id },
      data: {
        status: 'reserved',
        verifiedAt: new Date(),
        verifiedBy: adminName,
        ...(adminNotes && { adminNotes }),
        updatedAt: new Date()
      }
    });

    let updatedAnimal: Animal | null = null;
    if (existing.animalId) {
      const existingAnimal = await prisma.animal.findFirst({
        where: { id: { equals: existing.animalId, mode: 'insensitive' } }
      });
      if (existingAnimal) {
        const res = await prisma.animal.update({
          where: { id: existingAnimal.id },
          data: { status: 'reserved' }
        });
        updatedAnimal = {
          ...res,
          type: res.type as Animal['type'],
          gender: res.gender as Animal['gender'],
          status: res.status as Animal['status'],
          video: res.video || undefined,
          createdAt: res.createdAt.toISOString()
        };
      }
    }

    const notif = await prisma.adminNotification.create({
      data: {
        id: `NOTIF-${Date.now().toString().slice(-6)}`,
        type: 'RESERVATION_APPROVED',
        title: '🛡️ Reservation Approved & Confirmed',
        message: `Reservation ${updatedOrder.id} (${updatedOrder.packageName || updatedOrder.animalBreed}) deposit verified by ${adminName}. Item locked for customer.`,
        orderId: updatedOrder.id,
        read: false,
        createdAt: new Date()
      }
    });

    return {
      order: this.formatOrder(updatedOrder),
      animal: updatedAnimal,
      notification: {
        ...notif,
        type: notif.type as AdminNotification['type'],
        orderId: notif.orderId || undefined,
        createdAt: notif.createdAt.toISOString()
      }
    };
  }

  // Admin approves final remaining payment -> status becomes 'completed' & animal marked 'sold'
  public static async verifyFinalPayment(
    orderId: string,
    adminName: string,
    adminNotes?: string
  ): Promise<{ order: Order; animal: Animal | null; notification: AdminNotification } | null> {
    const existing = await prisma.order.findFirst({
      where: { id: { equals: orderId, mode: 'insensitive' } }
    });
    if (!existing) return null;

    const updatedOrder = await prisma.order.update({
      where: { id: existing.id },
      data: {
        status: 'completed',
        finalVerifiedAt: new Date(),
        finalVerifiedBy: adminName,
        ...(adminNotes && { adminNotes }),
        updatedAt: new Date()
      }
    });

    let updatedAnimal: Animal | null = null;
    if (existing.animalId) {
      const existingAnimal = await prisma.animal.findFirst({
        where: { id: { equals: existing.animalId, mode: 'insensitive' } }
      });
      if (existingAnimal) {
        const currentQty = existingAnimal.quantity ?? 1;
        const newQty = Math.max(0, currentQty - 1);
        const newStatus = newQty === 0 ? 'sold' : 'available';

        const res = await prisma.animal.update({
          where: { id: existingAnimal.id },
          data: {
            quantity: newQty,
            status: newStatus
          }
        });
        updatedAnimal = {
          ...res,
          type: res.type as Animal['type'],
          gender: res.gender as Animal['gender'],
          status: res.status as Animal['status'],
          video: res.video || undefined,
          createdAt: res.createdAt.toISOString()
        };
      }
    }

    const notif = await prisma.adminNotification.create({
      data: {
        id: `NOTIF-${Date.now().toString().slice(-6)}`,
        type: 'PAYMENT_VERIFIED',
        title: '🎉 Reservation Fully Paid & Completed',
        message: `Order ${updatedOrder.id} for ${updatedOrder.packageName || updatedOrder.animalBreed} has been fully settled and marked as SOLD by ${adminName}.`,
        orderId: updatedOrder.id,
        read: false,
        createdAt: new Date()
      }
    });

    return {
      order: this.formatOrder(updatedOrder),
      animal: updatedAnimal,
      notification: {
        ...notif,
        type: notif.type as AdminNotification['type'],
        orderId: notif.orderId || undefined,
        createdAt: notif.createdAt.toISOString()
      }
    };
  }

  // Standard 100% full payment verification
  public static async verifyOrder(orderId: string, adminName: string, adminNotes?: string): Promise<{ order: Order; animal: Animal | null; notification: AdminNotification } | null> {
    const existing = await prisma.order.findFirst({
      where: { id: { equals: orderId, mode: 'insensitive' } }
    });
    if (!existing) return null;

    const updatedOrder = await prisma.order.update({
      where: { id: existing.id },
      data: {
        status: 'completed',
        verifiedAt: new Date(),
        verifiedBy: adminName,
        ...(adminNotes && { adminNotes }),
        updatedAt: new Date()
      }
    });

    // Reduce animal stock or mark as sold
    let updatedAnimal: Animal | null = null;
    if (existing.animalId) {
      const existingAnimal = await prisma.animal.findFirst({
        where: { id: { equals: existing.animalId, mode: 'insensitive' } }
      });

      if (existingAnimal) {
        const currentQty = existingAnimal.quantity ?? 1;
        const newQty = Math.max(0, currentQty - 1);
        const newStatus = newQty === 0 ? 'sold' : 'available';

        const res = await prisma.animal.update({
          where: { id: existingAnimal.id },
          data: {
            quantity: newQty,
            status: newStatus
          }
        });

        updatedAnimal = {
          ...res,
          type: res.type as Animal['type'],
          gender: res.gender as Animal['gender'],
          status: res.status as Animal['status'],
          video: res.video || undefined,
          createdAt: res.createdAt.toISOString()
        };
      }
    }

    const notif = await prisma.adminNotification.create({
      data: {
        id: `NOTIF-${Date.now().toString().slice(-6)}`,
        type: 'PAYMENT_VERIFIED',
        title: 'Order Payment Verified',
        message: `Order ${updatedOrder.id} for ${updatedOrder.packageName || updatedOrder.animalBreed} has been verified and marked as SOLD by ${adminName}.`,
        orderId: updatedOrder.id,
        read: false,
        createdAt: new Date()
      }
    });

    return {
      order: this.formatOrder(updatedOrder),
      animal: updatedAnimal,
      notification: {
        ...notif,
        type: notif.type as AdminNotification['type'],
        orderId: notif.orderId || undefined,
        createdAt: notif.createdAt.toISOString()
      }
    };
  }

  public static async rejectOrder(orderId: string, reason: string): Promise<{ order: Order; animal: Animal | null; notification: AdminNotification } | null> {
    const existing = await prisma.order.findFirst({
      where: { id: { equals: orderId, mode: 'insensitive' } }
    });
    if (!existing) return null;

    const updatedOrder = await prisma.order.update({
      where: { id: existing.id },
      data: {
        status: 'rejected',
        adminNotes: reason,
        updatedAt: new Date()
      }
    });

    let updatedAnimal: Animal | null = null;
    if (existing.animalId) {
      const existingAnimal = await prisma.animal.findFirst({
        where: { id: { equals: existing.animalId, mode: 'insensitive' } }
      });

      if (existingAnimal && existingAnimal.status === 'reserved') {
        const res = await prisma.animal.update({
          where: { id: existingAnimal.id },
          data: { status: 'available' }
        });
        updatedAnimal = {
          ...res,
          type: res.type as Animal['type'],
          gender: res.gender as Animal['gender'],
          status: res.status as Animal['status'],
          video: res.video || undefined,
          createdAt: res.createdAt.toISOString()
        };
      }
    }

    const notif = await prisma.adminNotification.create({
      data: {
        id: `NOTIF-${Date.now().toString().slice(-6)}`,
        type: 'ORDER_REJECTED',
        title: 'Order Slip Rejected',
        message: `Order ${updatedOrder.id} was rejected. Reason: ${reason}`,
        orderId: updatedOrder.id,
        read: false,
        createdAt: new Date()
      }
    });

    return {
      order: this.formatOrder(updatedOrder),
      animal: updatedAnimal,
      notification: {
        ...notif,
        type: notif.type as AdminNotification['type'],
        orderId: notif.orderId || undefined,
        createdAt: notif.createdAt.toISOString()
      }
    };
  }

  // Generic Order Status Update (e.g., 'delivery_pending', 'delivered')
  public static async updateOrderStatus(
    orderId: string,
    status: string,
    adminNotes?: string
  ): Promise<Order | null> {
    const existing = await prisma.order.findFirst({
      where: { id: { equals: orderId, mode: 'insensitive' } }
    });
    if (!existing) return null;

    const updated = await prisma.order.update({
      where: { id: existing.id },
      data: {
        status,
        ...(adminNotes && { adminNotes }),
        updatedAt: new Date()
      }
    });

    return this.formatOrder(updated);
  }

  // ==================== NOTIFICATIONS ====================
  public static async getNotifications(): Promise<AdminNotification[]> {
    const notifs = await prisma.adminNotification.findMany({
      orderBy: { createdAt: 'desc' }
    });
    return notifs.map(n => ({
      ...n,
      type: n.type as AdminNotification['type'],
      orderId: n.orderId || undefined,
      createdAt: n.createdAt.toISOString()
    }));
  }

  public static async markNotificationRead(id: string): Promise<boolean> {
    try {
      await prisma.adminNotification.update({
        where: { id },
        data: { read: true }
      });
      return true;
    } catch {
      return false;
    }
  }

  public static async markAllNotificationsRead(): Promise<void> {
    await prisma.adminNotification.updateMany({
      data: { read: true }
    });
  }

  // ==================== BANK ACCOUNTS & SETTINGS ====================
  public static async getBankAccounts(): Promise<BankAccount[]> {
    const accounts = await prisma.bankAccount.findMany({
      orderBy: { createdAt: 'asc' }
    });
    return accounts.map(a => ({
      ...a,
      instructions: a.instructions || undefined,
      qrCode: a.qrCode || undefined,
      createdAt: a.createdAt.toISOString()
    }));
  }

  public static async getSettings() {
    const settings = await prisma.setting.findMany();
    const map: Record<string, string> = {};
    for (const s of settings) {
      map[s.key] = s.value;
    }
    return {
      businessName: map.businessName || 'Jonny Livestock',
      phone: map.phone || '+251911234567',
      displayPhone: map.displayPhone || '+251 911 234 567',
      whatsapp: map.whatsapp || '+251911234567',
      telegram: map.telegram || 'jonnylivestock',
      email: map.email || 'info@jonnylivestock.com',
      location: map.location || 'Addis Ababa & Bishoftu, Ethiopia',
      currency: map.currency || 'ETB'
    };
  }
}
