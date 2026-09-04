import prisma from './prisma.js';
import { Animal, Order, User, AdminNotification, BankAccount, SavedPackage, PackageCatalogItem, PreMadePackage, ContactMessage } from '../types/index.js';
import { PRE_MADE_PACKAGES } from '../data/packagesData.js';

const normalizeAnimalImages = (raw: any): string[] => {
  if (Array.isArray(raw)) {
    return raw.flatMap(img => (typeof img === 'string' ? img.trim().split(/\s+/) : [])).filter(Boolean);
  }
  if (typeof raw === 'string' && raw.trim()) {
    return raw.trim().split(/\s+/).filter(Boolean);
  }
  return [];
};

export class PostgresDB {
  // ==================== ANIMALS ====================
  public static async getAnimals(): Promise<Animal[]> {
    const animals = await prisma.animal.findMany({
      orderBy: { createdAt: 'desc' }
    });
    return animals.map(a => ({
      ...a,
      images: normalizeAnimalImages(a.images),
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
      images: normalizeAnimalImages(animal.images),
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

    let finalQuantity: number | undefined = updates.quantity !== undefined ? Number(updates.quantity) : undefined;
    if (updates.status === 'available') {
      if (finalQuantity !== undefined) {
        finalQuantity = Math.max(1, finalQuantity);
      } else if (existing.quantity <= 0) {
        finalQuantity = 1;
      }
    }

    const updated = await prisma.animal.update({
      where: { id: existing.id },
      data: {
        ...(updates.type && { type: updates.type }),
        ...(updates.breed && { breed: updates.breed }),
        ...(updates.gender && { gender: updates.gender }),
        ...(updates.weight !== undefined && { weight: Number(updates.weight) }),
        ...(updates.color && { color: updates.color }),
        ...(updates.price !== undefined && { price: Number(updates.price) }),
        ...(finalQuantity !== undefined && { quantity: finalQuantity }),
        ...(updates.location && { location: updates.location }),
        ...(updates.description && { description: updates.description }),
        ...(updates.status && { status: updates.status }),
        ...(updates.images !== undefined && { images: normalizeAnimalImages(updates.images) }),
        ...(updates.video !== undefined && { video: updates.video || null }),
        ...(updates.featured !== undefined && { featured: Boolean(updates.featured) }),
        ...(updates.characteristics && { characteristics: updates.characteristics })
      }
    });

    return {
      ...updated,
      images: normalizeAnimalImages(updated.images),
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

  public static async updateUserPassword(userId: string, passwordHash: string): Promise<boolean> {
    try {
      await prisma.user.update({
        where: { id: userId },
        data: { passwordHash }
      });
      return true;
    } catch (e) {
      console.error('Failed to update user password in Postgres:', e);
      return false;
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

  // ==================== CELEBRATION PACKAGES ====================
  public static async getPackages(): Promise<PreMadePackage[]> {
    try {
      const db = prisma as any;
      const count = await db.package.count();
      if (count === 0) {
        // Seed initial packages into PostgreSQL
        for (const p of PRE_MADE_PACKAGES) {
          await db.package.create({
            data: {
              id: p.id,
              name: p.name,
              amharicName: p.amharicName || null,
              tagline: p.tagline || null,
              description: p.description,
              categoryCount: p.categoryCount || (p.items ? new Set(p.items.map(i => i.category)).size : 1),
              items: p.items as any,
              originalPrice: Number(p.originalPrice),
              packagePrice: Number(p.packagePrice),
              savings: Number(p.savings || (p.originalPrice - p.packagePrice)),
              badge: p.badge || 'Special Package',
              image: p.image,
              featured: Boolean(p.featured),
              totalSlots: Number(p.totalSlots ?? 10),
              availableSlots: Number(p.availableSlots ?? (p.totalSlots ?? 10)),
              isOutOfStock: Boolean(p.isOutOfStock ?? false)
            }
          });
        }
      }

      const packages = await db.package.findMany({
        orderBy: { createdAt: 'desc' }
      });

      return packages.map((p: any) => {
        const totalSlots = p.totalSlots !== undefined && p.totalSlots !== null ? Number(p.totalSlots) : 10;
        const availableSlots = p.availableSlots !== undefined && p.availableSlots !== null ? Number(p.availableSlots) : totalSlots;
        const isOutOfStock = p.isOutOfStock !== undefined && p.isOutOfStock !== null ? Boolean(p.isOutOfStock) : availableSlots <= 0;

        return {
          id: p.id,
          name: p.name,
          amharicName: p.amharicName || undefined,
          tagline: p.tagline || '',
          description: p.description,
          categoryCount: p.categoryCount,
          items: (p.items as unknown) as PackageCatalogItem[],
          originalPrice: p.originalPrice,
          packagePrice: p.packagePrice,
          savings: p.savings,
          badge: p.badge,
          image: p.image,
          featured: p.featured,
          totalSlots,
          availableSlots,
          isOutOfStock
        };
      });
    } catch (e) {
      console.error('Error fetching packages from DB:', e);
      return PRE_MADE_PACKAGES;
    }
  }

  public static async getPackageById(id: string): Promise<PreMadePackage | null> {
    try {
      const db = prisma as any;
      const p = await db.package.findFirst({
        where: { id: { equals: id, mode: 'insensitive' } }
      });
      if (!p) return null;
      const totalSlots = p.totalSlots !== undefined && p.totalSlots !== null ? Number(p.totalSlots) : 10;
      const availableSlots = p.availableSlots !== undefined && p.availableSlots !== null ? Number(p.availableSlots) : totalSlots;
      const isOutOfStock = p.isOutOfStock !== undefined && p.isOutOfStock !== null ? Boolean(p.isOutOfStock) : availableSlots <= 0;

      return {
        id: p.id,
        name: p.name,
        amharicName: p.amharicName || undefined,
        tagline: p.tagline || '',
        description: p.description,
        categoryCount: p.categoryCount,
        items: (p.items as unknown) as PackageCatalogItem[],
        originalPrice: p.originalPrice,
        packagePrice: p.packagePrice,
        savings: p.savings,
        badge: p.badge,
        image: p.image,
        featured: p.featured,
        totalSlots,
        availableSlots,
        isOutOfStock
      };
    } catch {
      return null;
    }
  }

  public static async createPackage(data: {
    name: string;
    amharicName?: string;
    tagline?: string;
    description: string;
    items: PackageCatalogItem[];
    originalPrice: number;
    packagePrice: number;
    badge?: string;
    image: string;
    featured?: boolean;
    totalSlots?: number;
    availableSlots?: number;
  }): Promise<PreMadePackage> {
    const id = `pkg-${Date.now().toString().slice(-6)}`;
    const originalPrice = Number(data.originalPrice);
    const packagePrice = Number(data.packagePrice);
    const savings = Math.max(0, originalPrice - packagePrice);
    const categoryCount = data.items && data.items.length > 0
      ? new Set(data.items.map(i => i.category)).size
      : 1;
    const totalSlots = data.totalSlots !== undefined ? Number(data.totalSlots) : 10;
    const availableSlots = data.availableSlots !== undefined ? Number(data.availableSlots) : totalSlots;
    const isOutOfStock = availableSlots <= 0;

    const db = prisma as any;
    const created = await db.package.create({
      data: {
        id,
        name: data.name.trim(),
        amharicName: data.amharicName ? data.amharicName.trim() : null,
        tagline: data.tagline ? data.tagline.trim() : null,
        description: data.description.trim(),
        categoryCount,
        items: data.items as any,
        originalPrice,
        packagePrice,
        savings,
        badge: data.badge ? data.badge.trim() : 'Special Package',
        image: data.image.trim(),
        featured: Boolean(data.featured),
        totalSlots,
        availableSlots,
        isOutOfStock
      }
    });

    return {
      id: created.id,
      name: created.name,
      amharicName: created.amharicName || undefined,
      tagline: created.tagline || '',
      description: created.description,
      categoryCount: created.categoryCount,
      items: (created.items as unknown) as PackageCatalogItem[],
      originalPrice: created.originalPrice,
      packagePrice: created.packagePrice,
      savings: created.savings,
      badge: created.badge,
      image: created.image,
      featured: created.featured,
      totalSlots: created.totalSlots,
      availableSlots: created.availableSlots,
      isOutOfStock: created.isOutOfStock
    };
  }

  public static async updatePackageSlots(
    id: string,
    availableSlots: number,
    totalSlots?: number
  ): Promise<PreMadePackage | null> {
    try {
      const db = prisma as any;
      const existing = await db.package.findFirst({
        where: { id: { equals: id, mode: 'insensitive' } }
      });
      if (!existing) return null;

      const newAvailable = Math.max(0, Number(availableSlots));
      const newTotal = totalSlots !== undefined ? Math.max(newAvailable, Number(totalSlots)) : (existing.totalSlots || 10);
      const isOutOfStock = newAvailable <= 0;

      const updated = await db.package.update({
        where: { id: existing.id },
        data: {
          availableSlots: newAvailable,
          totalSlots: newTotal,
          isOutOfStock
        }
      });

      return {
        id: updated.id,
        name: updated.name,
        amharicName: updated.amharicName || undefined,
        tagline: updated.tagline || '',
        description: updated.description,
        categoryCount: updated.categoryCount,
        items: (updated.items as unknown) as PackageCatalogItem[],
        originalPrice: updated.originalPrice,
        packagePrice: updated.packagePrice,
        savings: updated.savings,
        badge: updated.badge,
        image: updated.image,
        featured: updated.featured,
        totalSlots: updated.totalSlots,
        availableSlots: updated.availableSlots,
        isOutOfStock: updated.isOutOfStock
      };
    } catch (e) {
      console.error('Error updating package slots:', e);
      return null;
    }
  }

  public static async deletePackage(id: string): Promise<boolean> {
    try {
      const db = prisma as any;
      const existing = await db.package.findFirst({
        where: { id: { equals: id, mode: 'insensitive' } }
      });
      if (!existing) return false;
      await db.package.delete({
        where: { id: existing.id }
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
    const isMeatByKg = Boolean((orderData as any).isMeatByKg || (orderData as any).packageDetails?.isMeatByKg);
    let notifType = isReservation ? 'NEW_RESERVATION_DEPOSIT' : 'NEW_ORDER_SLIP';
    let notifTitle = isReservation ? '🛡️ New 50% Reservation Deposit Slip' : '📦 New Payment Slip Uploaded';
    if (isMeatByKg) {
      notifType = 'NEW_MEAT_ORDER';
      notifTitle = '🥩 New Raw Meat (Ox/Beef) Order';
    }
    const customerPhoneStr = orderData.customerPhone ? ` [📞 ${orderData.customerPhone}]` : '';
    const notifMsg = isMeatByKg
      ? `${orderData.customerName}${customerPhoneStr} ordered ${orderData.animalBreed || 'Raw Beef by KG'} (${totalAmount.toLocaleString()} ETB). Please inspect the payment slip and approve.`
      : isReservation
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

    // Minimize package available slots if package order or reservation
    if (orderData.isPackage || orderData.packageName) {
      try {
        const db = prisma as any;
        let pkgToUpdate = null;
        const details = orderData.packageDetails as any;
        if (details?.preMadeId) {
          pkgToUpdate = await db.package.findFirst({
            where: { id: { equals: details.preMadeId, mode: 'insensitive' } }
          });
        }
        if (!pkgToUpdate && orderData.packageName) {
          pkgToUpdate = await db.package.findFirst({
            where: { name: { equals: orderData.packageName, mode: 'insensitive' } }
          });
        }

        if (pkgToUpdate) {
          const currentAvail = pkgToUpdate.availableSlots !== undefined && pkgToUpdate.availableSlots !== null
            ? Number(pkgToUpdate.availableSlots)
            : 10;
          const newAvail = Math.max(0, currentAvail - 1);
          const isOut = newAvail <= 0;

          await db.package.update({
            where: { id: pkgToUpdate.id },
            data: {
              availableSlots: newAvail,
              isOutOfStock: isOut
            }
          });

          // If package reached 0 slots, alert admin immediately!
          if (isOut) {
            await prisma.adminNotification.create({
              data: {
                id: `NOTIF-${Date.now().toString().slice(-6)}`,
                type: 'OUT_OF_STOCK',
                title: '⚠️ Package Out of Stock',
                message: `Package "${pkgToUpdate.name}" has reached 0 available slots and is now completely SOLD OUT / Out of Stock!`,
                orderId: createdOrder.id,
                read: false,
                createdAt: new Date()
              }
            });
          }
        }
      } catch (pkgErr) {
        console.error('Failed to update package available slots on order creation:', pkgErr);
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

        if (newQty === 0) {
          await prisma.adminNotification.create({
            data: {
              id: `NOTIF-${Date.now().toString().slice(-6)}`,
              type: 'OUT_OF_STOCK',
              title: '⚠️ Animal Out of Stock',
              message: `Animal "${existingAnimal.breed}" (${existingAnimal.id}) has reached 0 available stock and is now marked as SOLD OUT!`,
              orderId: updatedOrder.id,
              read: false,
              createdAt: new Date()
            }
          });
        }

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

        if (newQty === 0) {
          await prisma.adminNotification.create({
            data: {
              id: `NOTIF-${Date.now().toString().slice(-6)}`,
              type: 'OUT_OF_STOCK',
              title: '⚠️ Animal Out of Stock',
              message: `Animal "${existingAnimal.breed}" (${existingAnimal.id}) has reached 0 available stock and is now marked as SOLD OUT!`,
              orderId: updatedOrder.id,
              read: false,
              createdAt: new Date()
            }
          });
        }

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

    // Restore package slot if package was rejected
    if (existing.isPackage || existing.packageName) {
      try {
        const db = prisma as any;
        let pkgToRestore = null;
        const details = existing.packageDetails as any;
        if (details?.preMadeId) {
          pkgToRestore = await db.package.findFirst({
            where: { id: { equals: details.preMadeId, mode: 'insensitive' } }
          });
        }
        if (!pkgToRestore && existing.packageName) {
          pkgToRestore = await db.package.findFirst({
            where: { name: { equals: existing.packageName, mode: 'insensitive' } }
          });
        }

        if (pkgToRestore) {
          const curAvail = Number(pkgToRestore.availableSlots ?? 0);
          const totalS = Number(pkgToRestore.totalSlots ?? 10);
          const restored = Math.min(totalS, curAvail + 1);
          await db.package.update({
            where: { id: pkgToRestore.id },
            data: {
              availableSlots: restored,
              isOutOfStock: restored <= 0
            }
          });
        }
      } catch (e) {
        console.error('Failed to restore package slots on reject:', e);
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
      phone: map.phone || '+251910194903',
      displayPhone: map.displayPhone || '+251 910 194 903',
      whatsapp: map.whatsapp || '251910194903',
      telegram: map.telegram || 'jonnylivestock',
      email: map.email || 'info@jonnylivestock.com',
      location: map.location || 'Addis Ababa & Bishoftu, Ethiopia',
      currency: map.currency || 'ETB'
    };
  }

  // ==================== RAW MEAT PRICING ====================
  public static async getRawMeatPricing() {
    try {
      const setting = await prisma.setting.findUnique({
        where: { key: 'raw_meat_pricing' }
      });
      if (setting && setting.value) {
        return JSON.parse(setting.value);
      }
    } catch (e) {
      console.error('Error fetching raw meat pricing from DB:', e);
    }
    // Default prices as requested by user
    return {
      kurtPrice: 2500,     // ለጥሬ (Raw Cut)
      kitfoPrice: 2200,    // ለክትፎ (Kitfo Cut)
      tibsWotPrice: 1800,  // ለጥብስ እና ወጥ (Tibs & Wot Cut)
      available: true,
      updatedAt: new Date().toISOString()
    };
  }

  public static async updateRawMeatPricing(pricing: {
    kurtPrice: number;
    kitfoPrice: number;
    tibsWotPrice: number;
    available?: boolean;
  }) {
    const dataToSave = {
      kurtPrice: Number(pricing.kurtPrice) || 2500,
      kitfoPrice: Number(pricing.kitfoPrice) || 2200,
      tibsWotPrice: Number(pricing.tibsWotPrice) || 1800,
      available: pricing.available !== undefined ? Boolean(pricing.available) : true,
      updatedAt: new Date().toISOString()
    };

    await prisma.setting.upsert({
      where: { key: 'raw_meat_pricing' },
      update: { value: JSON.stringify(dataToSave) },
      create: { key: 'raw_meat_pricing', value: JSON.stringify(dataToSave) }
    });

    return dataToSave;
  }

  // ==================== CONTACT US MESSAGES ====================
  public static async createContactMessage(data: {
    name: string;
    phone: string;
    email?: string;
    animalId?: string;
    serviceNeeded?: string;
    message: string;
  }): Promise<ContactMessage> {
    const db = prisma as any;
    const created = await db.contactMessage.create({
      data: {
        id: `MSG-${Date.now().toString().slice(-6)}`,
        name: data.name.trim(),
        phone: data.phone.trim(),
        email: data.email ? data.email.trim() : null,
        animalId: data.animalId ? data.animalId.trim() : null,
        serviceNeeded: data.serviceNeeded ? data.serviceNeeded.trim() : null,
        message: data.message.trim(),
        read: false,
        createdAt: new Date()
      }
    });

    // Automatically alert the admin with an unread notification!
    const summary = data.message.length > 70 ? data.message.slice(0, 70) + '...' : data.message;
    await prisma.adminNotification.create({
      data: {
        id: `NOTIF-${Date.now().toString().slice(-6)}`,
        type: 'CONTACT_MESSAGE',
        title: '💬 New Contact Message Received',
        message: `Inquiry from ${data.name} (📞 ${data.phone}): "${summary}"`,
        read: false,
        createdAt: new Date()
      }
    });

    return {
      id: created.id,
      name: created.name,
      phone: created.phone,
      email: created.email || undefined,
      animalId: created.animalId || undefined,
      serviceNeeded: created.serviceNeeded || undefined,
      message: created.message,
      read: created.read,
      createdAt: created.createdAt.toISOString()
    };
  }

  public static async getContactMessages(): Promise<ContactMessage[]> {
    try {
      const db = prisma as any;
      const msgs = await db.contactMessage.findMany({
        orderBy: { createdAt: 'desc' }
      });
      return msgs.map((m: any) => ({
        id: m.id,
        name: m.name,
        phone: m.phone,
        email: m.email || undefined,
        animalId: m.animalId || undefined,
        serviceNeeded: m.serviceNeeded || undefined,
        message: m.message,
        read: Boolean(m.read),
        createdAt: m.createdAt.toISOString()
      }));
    } catch (e) {
      console.error('Error fetching contact messages:', e);
      return [];
    }
  }

  public static async markContactMessageRead(id: string): Promise<boolean> {
    try {
      const db = prisma as any;
      await db.contactMessage.update({
        where: { id },
        data: { read: true }
      });
      return true;
    } catch {
      return false;
    }
  }

  public static async deleteContactMessage(id: string): Promise<boolean> {
    try {
      const db = prisma as any;
      await db.contactMessage.delete({
        where: { id }
      });
      return true;
    } catch {
      return false;
    }
  }
}
