import React, { useState, useMemo, useEffect, useRef } from 'react';
import { useAdminAuth } from '../context/AdminAuthContext';
import { useUserAuth } from '../context/UserAuthContext';
import { mockAnimals as fallbackAnimals } from '../data/animals';
import { Animal, AnimalType, AnimalStatus } from '../types/animal';
import { StatusBadge } from '../components/common/StatusBadge';
import { formatPrice, formatWeight } from '../utils/formatters';
import { useTheme } from '../context/ThemeContext';
import { api, Order, AdminNotification } from '../services/api';
import { SlipPreviewModal } from '../components/modals/SlipPreviewModal';
import { useRealtimeEvent, useRealtime } from '../context/RealtimeContext';
import {
  DollarSign,
  ShoppingBag,
  Search,
  CheckCircle2,
  ArrowUpRight,
  Lock,
  Mail,
  Eye,
  EyeOff,
  LogOut,
  LayoutDashboard,
  BarChart3,
  Shield,
  Layers,
  AlertCircle,
  Bell,
  Check,
  X,
  CreditCard,
  Plus,
  RefreshCw,
  Clock,
  ArrowRight,
  UploadCloud,
  Trash2,
  Phone,
  Gift
} from 'lucide-react';
import { Link, useSearchParams } from 'react-router-dom';
import { PreMadePackage, PackageCatalogItem } from '../types/package';

type AdminTab = 'overview' | 'orders' | 'inventory' | 'packages' | 'demand' | 'settings';

export const Admin: React.FC = () => {
  const { isAuthenticated, user, login, logout } = useAdminAuth();
  const { isAuthenticated: isUserAuth, user: currentUser, logout: userLogout } = useUserAuth();
  const { theme } = useTheme();
  const isDark = theme === 'design7';

  // Login Form States
  const [emailInput, setEmailInput] = useState('');
  const [passwordInput, setPasswordInput] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loginError, setLoginError] = useState('');
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  const [searchParams] = useSearchParams();

  // Dashboard Active Tab
  const [activeTab, setActiveTab] = useState<AdminTab>('overview');

  // Read tab and filter from URL params (e.g. /admin?tab=orders&filter=active_reservation)
  useEffect(() => {
    const tabParam = searchParams.get('tab') as AdminTab | null;
    const filterParam = searchParams.get('filter');
    if (tabParam) {
      setActiveTab(tabParam);
    } else if (filterParam) {
      setActiveTab('orders');
    }
    if (filterParam) {
      setOrderStatusFilter(filterParam);
    }
  }, [searchParams]);

  // Backend Live Data
  const [animalsList, setAnimalsList] = useState<Animal[]>(fallbackAnimals);
  const [ordersList, setOrdersList] = useState<Order[]>([]);
  const [notifications, setNotifications] = useState<AdminNotification[]>([]);
  const [unreadNotifsCount, setUnreadNotifsCount] = useState<number>(0);
  const [isNotifDropdownOpen, setIsNotifDropdownOpen] = useState(false);
  const notifDropdownRef = useRef<HTMLDivElement>(null);
  const [isLoadingData, setIsLoadingData] = useState(false);

  // Slip Inspector State
  const [selectedSlipOrder, setSelectedSlipOrder] = useState<Order | null>(null);

  // Action status message
  const [actionAlert, setActionAlert] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Filtering & Search
  const [orderStatusFilter, setOrderStatusFilter] = useState<string>('all');
  const [selectedTypeFilter, setSelectedTypeFilter] = useState<string>('all');
  const [selectedStatusFilter, setSelectedStatusFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Add Animal Modal
  const [isAddAnimalOpen, setIsAddAnimalOpen] = useState(false);
  const [newAnimalType, setNewAnimalType] = useState<AnimalType>('sheep');
  const [newAnimalBreed, setNewAnimalBreed] = useState('');
  const [newAnimalWeight, setNewAnimalWeight] = useState(30);
  const [newAnimalPrice, setNewAnimalPrice] = useState(15000);
  const [newAnimalColor, setNewAnimalColor] = useState('Natural');
  const [newAnimalDesc, setNewAnimalDesc] = useState('');
  const [newAnimalImage, setNewAnimalImage] = useState('');
  const [isDraggingImage, setIsDraggingImage] = useState(false);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [imageUploadMode, setImageUploadMode] = useState<'upload' | 'url'>('upload');
  const animalImageInputRef = useRef<HTMLInputElement>(null);

  // Celebration Packages State
  const [packagesList, setPackagesList] = useState<PreMadePackage[]>([]);
  const [catalogItems, setCatalogItems] = useState<PackageCatalogItem[]>([]);
  const [isAddPackageOpen, setIsAddPackageOpen] = useState(false);
  const [newPkgName, setNewPkgName] = useState('');
  const [newPkgAmharicName, setNewPkgAmharicName] = useState('');
  const [newPkgTagline, setNewPkgTagline] = useState('');
  const [newPkgBadge, setNewPkgBadge] = useState('⭐ Most Popular');
  const [newPkgDescription, setNewPkgDescription] = useState('');
  const [newPkgImage, setNewPkgImage] = useState('');
  const [newPkgOriginalPrice, setNewPkgOriginalPrice] = useState<number>(18000);
  const [newPkgPackagePrice, setNewPkgPackagePrice] = useState<number>(16000);
  const [newPkgFeatured, setNewPkgFeatured] = useState<boolean>(true);
  const [newPkgSelectedItems, setNewPkgSelectedItems] = useState<PackageCatalogItem[]>([]);
  const [isDraggingPkgImage, setIsDraggingPkgImage] = useState(false);
  const [isUploadingPkgImage, setIsUploadingPkgImage] = useState(false);
  const [pkgImageUploadMode, setPkgImageUploadMode] = useState<'upload' | 'url'>('upload');
  const pkgImageInputRef = useRef<HTMLInputElement>(null);
  const [customItemName, setCustomItemName] = useState('');
  const [customItemCategory, setCustomItemCategory] = useState<'meat_livestock' | 'wine' | 'eggs' | 'flowers'>('meat_livestock');
  const [customItemPrice, setCustomItemPrice] = useState<number>(1500);

  // Load Data from Backend
  const loadDashboardData = async () => {
    setIsLoadingData(true);
    try {
      const [fetchedAnimals, fetchedOrders, notifRes, pkgRes] = await Promise.all([
        api.getAnimals(),
        api.getAllOrders(),
        api.getNotifications(),
        api.getPackagesData()
      ]);

      if (fetchedAnimals && fetchedAnimals.length > 0) {
        setAnimalsList(fetchedAnimals);
      }
      setOrdersList(fetchedOrders || []);
      setNotifications(notifRes.data || []);
      setUnreadNotifsCount(notifRes.unreadCount || 0);
      if (pkgRes) {
        setPackagesList(pkgRes.preMadePackages || []);
        setCatalogItems(pkgRes.catalog || []);
      }
    } catch (err) {
      console.error('Failed to load backend data:', err);
    } finally {
      setIsLoadingData(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      loadDashboardData();
      const interval = setInterval(loadDashboardData, 15000); // Polling every 15s for live slip uploads
      return () => clearInterval(interval);
    }
  }, [isAuthenticated]);

  // 🔔 Click Outside Handler: Close notification dropdown when clicking anywhere outside of its boundary
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent | TouchEvent) => {
      if (
        notifDropdownRef.current &&
        !notifDropdownRef.current.contains(event.target as Node)
      ) {
        setIsNotifDropdownOpen(false);
      }
    };

    if (isNotifDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('touchstart', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
    };
  }, [isNotifDropdownOpen]);

  const { isConnected } = useRealtime();

  // 🚀 REALTIME LISTENER: New Payment Slip Uploaded by Customer
  useRealtimeEvent<{ order: Order; notification: AdminNotification; animal: Animal | null }>('NEW_ORDER_SLIP', (data) => {
    if (!data || !data.order) return;
    
    setOrdersList(prev => {
      if (prev.some(o => o.id === data.order.id)) return prev;
      return [data.order, ...prev];
    });

    if (data.notification) {
      setNotifications(prev => [data.notification, ...prev]);
      setUnreadNotifsCount(prev => prev + 1);
    }

    if (data.animal) {
      setAnimalsList(prev => {
        const idx = prev.findIndex(a => a.id.toLowerCase() === data.animal!.id.toLowerCase());
        if (idx === -1) return prev;
        const copy = [...prev];
        copy[idx] = { ...copy[idx], ...data.animal };
        return copy;
      });
    }

    showAlert('success', `🔔 New Payment Slip uploaded by ${data.order.customerName} for ${data.order.packageName || data.order.animalBreed} (${data.order.totalAmount.toLocaleString()} ETB)!`);
  });

  // 🚀 REALTIME LISTENER: New 50% Reservation Deposit Slip
  useRealtimeEvent<{ order: Order; notification: AdminNotification; animal: Animal | null }>('NEW_RESERVATION_DEPOSIT', (data) => {
    if (!data || !data.order) return;

    setOrdersList(prev => {
      if (prev.some(o => o.id === data.order.id)) return prev;
      return [data.order, ...prev];
    });

    if (data.notification) {
      setNotifications(prev => [data.notification, ...prev]);
      setUnreadNotifsCount(prev => prev + 1);
    }

    showAlert('success', `🔔 New 50% Reservation Deposit submitted by ${data.order.customerName} for ${data.order.packageName || data.order.animalBreed} (${(data.order.depositAmount || data.order.totalAmount * 0.5).toLocaleString()} ETB)!`);
  });

  // 🚀 REALTIME LISTENER: Final 50% Payment Slip Submitted
  useRealtimeEvent<{ order: Order; notification: AdminNotification }>('FINAL_PAYMENT_SLIP', (data) => {
    if (!data || !data.order) return;

    setOrdersList(prev => {
      const idx = prev.findIndex(o => o.id === data.order.id);
      if (idx === -1) return [data.order, ...prev];
      const copy = [...prev];
      copy[idx] = { ...copy[idx], ...data.order };
      return copy;
    });

    if (data.notification) {
      setNotifications(prev => [data.notification, ...prev]);
      setUnreadNotifsCount(prev => prev + 1);
    }

    showAlert('success', `🔔 Final 50% Balance Slip submitted by ${data.order.customerName} for ${data.order.packageName || data.order.animalBreed}!`);
  });

  // 🚀 REALTIME LISTENER: Reservation Approved
  useRealtimeEvent<{ order: Order; animal: Animal | null; notification: AdminNotification }>('RESERVATION_APPROVED', (data) => {
    if (!data || !data.order) return;

    setOrdersList(prev => {
      const idx = prev.findIndex(o => o.id === data.order.id);
      if (idx === -1) return [data.order, ...prev];
      const copy = [...prev];
      copy[idx] = { ...copy[idx], ...data.order };
      return copy;
    });

    if (data.animal) {
      setAnimalsList(prev => {
        const idx = prev.findIndex(a => a.id.toLowerCase() === data.animal!.id.toLowerCase());
        if (idx === -1) return prev;
        const copy = [...prev];
        copy[idx] = { ...copy[idx], ...data.animal };
        return copy;
      });
    }
  });

  // 🚀 REALTIME LISTENER: Final Payment Approved (Completed / Sold)
  useRealtimeEvent<{ order: Order; animal: Animal | null; notification: AdminNotification }>('FINAL_PAYMENT_APPROVED', (data) => {
    if (!data || !data.order) return;

    setOrdersList(prev => {
      const idx = prev.findIndex(o => o.id === data.order.id);
      if (idx === -1) return [data.order, ...prev];
      const copy = [...prev];
      copy[idx] = { ...copy[idx], ...data.order };
      return copy;
    });

    if (data.animal) {
      setAnimalsList(prev => {
        const idx = prev.findIndex(a => a.id.toLowerCase() === data.animal!.id.toLowerCase());
        if (idx === -1) return prev;
        const copy = [...prev];
        copy[idx] = { ...copy[idx], ...data.animal };
        return copy;
      });
    }
  });

  // 🚀 REALTIME LISTENER: Order Verified & Payment Approved
  useRealtimeEvent<{ order: Order; animal: Animal | null; notification: AdminNotification }>('ORDER_VERIFIED', (data) => {
    if (!data || !data.order) return;

    setOrdersList(prev => {
      const idx = prev.findIndex(o => o.id === data.order.id);
      if (idx === -1) return [data.order, ...prev];
      const copy = [...prev];
      copy[idx] = { ...copy[idx], ...data.order };
      return copy;
    });

    if (data.animal) {
      setAnimalsList(prev => {
        const idx = prev.findIndex(a => a.id.toLowerCase() === data.animal!.id.toLowerCase());
        if (idx === -1) return prev;
        const copy = [...prev];
        copy[idx] = { ...copy[idx], ...data.animal };
        return copy;
      });
    }

    if (data.notification) {
      setNotifications(prev => [data.notification, ...prev]);
      setUnreadNotifsCount(prev => prev + 1);
    }
  });

  // 🚀 REALTIME LISTENER: Order Rejected
  useRealtimeEvent<{ order: Order; animal: Animal | null }>('ORDER_REJECTED', (data) => {
    if (!data || !data.order) return;

    setOrdersList(prev => {
      const idx = prev.findIndex(o => o.id === data.order.id);
      if (idx === -1) return [data.order, ...prev];
      const copy = [...prev];
      copy[idx] = { ...copy[idx], ...data.order };
      return copy;
    });

    if (data.animal) {
      setAnimalsList(prev => {
        const idx = prev.findIndex(a => a.id.toLowerCase() === data.animal!.id.toLowerCase());
        if (idx === -1) return prev;
        const copy = [...prev];
        copy[idx] = { ...copy[idx], ...data.animal };
        return copy;
      });
    }
  });

  // 🚀 REALTIME LISTENER: Live Animal Inventory Changes
  useRealtimeEvent<Animal>('ANIMAL_CREATED', (created) => {
    if (!created) return;
    setAnimalsList(prev => {
      if (prev.some(a => a.id === created.id)) return prev;
      return [created, ...prev];
    });
  });

  useRealtimeEvent<Animal>('ANIMAL_UPDATED', (updated) => {
    if (!updated) return;
    setAnimalsList(prev => {
      const idx = prev.findIndex(a => a.id.toLowerCase() === updated.id.toLowerCase());
      if (idx === -1) return prev;
      const copy = [...prev];
      copy[idx] = { ...copy[idx], ...updated };
      return copy;
    });
  });

  useRealtimeEvent<{ id: string }>('ANIMAL_DELETED', ({ id }) => {
    if (!id) return;
    setAnimalsList(prev => prev.filter(a => a.id.toLowerCase() !== id.toLowerCase()));
  });

  useRealtimeEvent<{ id?: string; all?: boolean }>('NOTIFICATIONS_READ', (payload) => {
    if (payload?.all) {
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
      setUnreadNotifsCount(0);
    } else if (payload?.id) {
      setNotifications(prev => prev.map(n => n.id === payload.id ? { ...n, read: true } : n));
      setUnreadNotifsCount(prev => Math.max(0, prev - 1));
    }
  });

  // Flash alert helper
  const showAlert = (type: 'success' | 'error', message: string) => {
    setActionAlert({ type, message });
    setTimeout(() => setActionAlert(null), 6000);
  };

  // Calculations
  const stats = useMemo(() => {
    const totalAnimals = animalsList.length;
    const sheep = animalsList.filter((a) => a.type === 'sheep');
    const goats = animalsList.filter((a) => a.type === 'goat');
    const cows = animalsList.filter((a) => a.type === 'cow');

    const availableCount = animalsList.filter((a) => a.status === 'available').length;
    const reservedCount = animalsList.filter((a) => a.status === 'reserved').length;
    const soldCount = animalsList.filter((a) => a.status === 'sold').length;

    const totalInventoryValue = animalsList.reduce((acc, a) => acc + a.price, 0);
    const availableValue = animalsList.filter((a) => a.status === 'available').reduce((acc, a) => acc + a.price, 0);
    const soldValue = animalsList.filter((a) => a.status === 'sold').reduce((acc, a) => acc + a.price, 0);

    const pendingOrdersCount = ordersList.filter(o => o.status === 'pending_verification').length;
    const verifiedOrdersCount = ordersList.filter(o => o.status === 'verified').length;
    const verifiedRevenue = ordersList
      .filter(o => o.status === 'verified')
      .reduce((acc, o) => acc + o.totalAmount, 0);

    return {
      totalAnimals,
      sheepCount: sheep.length,
      goatsCount: goats.length,
      cowsCount: cows.length,
      availableCount,
      reservedCount,
      soldCount,
      totalInventoryValue,
      availableValue,
      soldValue,
      pendingOrdersCount,
      verifiedOrdersCount,
      verifiedRevenue,
      sheepValue: sheep.reduce((acc, a) => acc + a.price, 0),
      goatValue: goats.reduce((acc, a) => acc + a.price, 0),
      cowValue: cows.reduce((acc, a) => acc + a.price, 0)
    };
  }, [animalsList, ordersList]);

  // Filtered Animals for Table
  const filteredAnimals = useMemo(() => {
    return animalsList.filter((animal) => {
      const matchesType = selectedTypeFilter === 'all' || animal.type === selectedTypeFilter;
      const matchesStatus = selectedStatusFilter === 'all' || animal.status === selectedStatusFilter;
      const matchesSearch =
        searchQuery === '' ||
        animal.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        animal.breed.toLowerCase().includes(searchQuery.toLowerCase()) ||
        animal.location.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesType && matchesStatus && matchesSearch;
    });
  }, [animalsList, selectedTypeFilter, selectedStatusFilter, searchQuery]);

  // Real count of new customer payments awaiting admin slip review
  const newPaymentsCount = useMemo(() => {
    return ordersList.filter(
      (o) =>
        o.status === 'reservation_pending' ||
        o.status === 'final_payment_pending' ||
        o.status === 'pending_verification'
    ).length;
  }, [ordersList]);

  // Filtered Orders for Table: Supports active_reservation, sold, delivery_pending, delivered, rejected
  const filteredOrders = useMemo(() => {
    return ordersList.filter((order) => {
      let matchesStatus = true;
      if (orderStatusFilter === 'active_reservation') {
        matchesStatus = order.status === 'reserved' || order.status === 'reservation_pending';
      } else if (orderStatusFilter === 'sold') {
        matchesStatus = order.status === 'completed' || order.status === 'verified';
      } else if (orderStatusFilter === 'delivery_pending') {
        matchesStatus = order.status === 'delivery_pending' || ((order.status === 'completed' || order.status === 'verified') && Boolean(order.deliveryLocation));
      } else if (orderStatusFilter === 'delivered') {
        matchesStatus = order.status === 'delivered';
      } else if (orderStatusFilter === 'rejected') {
        matchesStatus = order.status === 'rejected';
      } else if (orderStatusFilter !== 'all') {
        matchesStatus = order.status === orderStatusFilter;
      }

      const matchesSearch =
        searchQuery === '' ||
        order.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        order.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        order.customerPhone.includes(searchQuery) ||
        (order.animalBreed && order.animalBreed.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (order.packageName && order.packageName.toLowerCase().includes(searchQuery.toLowerCase()));

      return matchesStatus && matchesSearch;
    });
  }, [ordersList, orderStatusFilter, searchQuery]);

  // Handle Verify Order & Mark Sold (100% Full Payment)
  const handleVerifyOrder = async (orderId: string) => {
    const res = await api.verifyOrder(orderId, 'Verified payment slip via Admin panel');
    if (res.success) {
      showAlert('success', `✓ Order ${orderId} verified! Corresponding animal marked as SOLD.`);
      loadDashboardData();
    } else {
      showAlert('error', res.error || 'Failed to verify order');
    }
  };

  // Handle Verify 50% Reservation Deposit
  const handleVerifyReservation = async (orderId: string) => {
    const res = await api.verifyReservation(orderId, '50% Reservation Deposit approved by Admin');
    if (res.success) {
      showAlert('success', `✓ Reservation ${orderId} approved! Animal/package is now locked & reserved.`);
      loadDashboardData();
    } else {
      showAlert('error', res.error || 'Failed to approve reservation deposit');
    }
  };

  // Handle Verify Final 50% Payment & Complete Order (Mark Sold)
  const handleVerifyFinalPayment = async (orderId: string) => {
    const res = await api.verifyFinalPayment(orderId, 'Final balance approved by Admin');
    if (res.success) {
      showAlert('success', `✓ Final payment for ${orderId} verified! Order is now COMPLETED and item marked as SOLD.`);
      loadDashboardData();
    } else {
      showAlert('error', res.error || 'Failed to verify final payment');
    }
  };

  // Handle Reject Order
  const handleRejectOrder = async (orderId: string) => {
    const reason = window.prompt('Enter reason for rejecting order (e.g. Invalid transfer slip):');
    if (!reason) return;

    const res = await api.rejectOrder(orderId, reason);
    if (res.success) {
      showAlert('success', `Order ${orderId} rejected.`);
      loadDashboardData();
    } else {
      showAlert('error', res.error || 'Failed to reject order');
    }
  };

  // Handle Update Generic Order Status (e.g. delivery_pending, delivered)
  const handleUpdateOrderStatus = async (orderId: string, newStatus: string) => {
    const res = await api.updateOrderStatus(orderId, newStatus);
    if (res.success) {
      setOrdersList((prev) =>
        prev.map((o) => (o.id === orderId ? { ...o, status: newStatus as any } : o))
      );
      showAlert('success', `✓ Order ${orderId} updated to ${newStatus.replace('_', ' ')}.`);
    } else {
      showAlert('error', res.error || 'Failed to update order status');
    }
  };

  // Handle Click on Notification: Mark Read on server & Open Slip Approval Modal without minimizing notification counts
  const handleNotificationClick = async (notif: AdminNotification) => {
    // 1. Mark as read on server & update state without losing or minimizing total notifications
    if (!notif.read) {
      try {
        await api.markNotificationRead(notif.id);
        setNotifications((prev) =>
          prev.map((n) => (n.id === notif.id ? { ...n, read: true } : n))
        );
      } catch (err) {
        console.error('Failed to mark notification read:', err);
      }
    }

    // 2. Direct to order details and open Slip Approval Modal
    if (notif.orderId) {
      setActiveTab('orders');

      // Check if order already in state
      let targetOrder = ordersList.find(
        (o) => o.id.toLowerCase() === notif.orderId!.toLowerCase()
      );

      // If not found in current state, fetch directly
      if (!targetOrder) {
        try {
          const res = await api.getOrderById(notif.orderId);
          if (res.success && res.data) {
            targetOrder = res.data;
            setOrdersList((prev) => [res.data!, ...prev]);
          }
        } catch (e) {
          console.error('Failed to fetch order for notification:', e);
        }
      }

      if (targetOrder) {
        setSelectedSlipOrder(targetOrder);
      } else {
        setSearchQuery(notif.orderId);
      }
    }
  };

  // Handle Toggle Animal Status
  const handleToggleStatus = async (animalId: string, newStatus: AnimalStatus) => {
    const res = await api.updateAnimal(animalId, { status: newStatus });
    if (res.success) {
      setAnimalsList((prev) =>
        prev.map((a) => (a.id === animalId ? { ...a, status: newStatus } : a))
      );
      showAlert('success', `Animal ${animalId} status set to ${newStatus}.`);
    } else {
      showAlert('error', res.error || 'Failed to update animal status');
    }
  };

  // Handle Add Animal
  const handleAddAnimalSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAnimalBreed.trim()) {
      showAlert('error', 'Breed name is required');
      return;
    }

    const defaultImg = newAnimalType === 'sheep'
      ? 'https://images.unsplash.com/photo-1484557052118-f32bd25b45b5?auto=format&fit=crop&w=1200&q=80'
      : newAnimalType === 'goat'
      ? 'https://images.unsplash.com/photo-1524024973431-2ad916746881?auto=format&fit=crop&w=1200&q=80'
      : 'https://images.unsplash.com/photo-1546445317-29f4545e9d53?auto=format&fit=crop&w=1200&q=80';

    const res = await api.createAnimal({
      type: newAnimalType,
      breed: newAnimalBreed.trim(),
      weight: Number(newAnimalWeight),
      price: Number(newAnimalPrice),
      color: newAnimalColor || 'Natural',
      description: newAnimalDesc || 'Prime livestock pasture-raised in organic conditions.',
      images: [newAnimalImage.trim() || defaultImg],
      location: 'Aware, Addis Ababa',
      gender: 'Male',
      featured: true,
      characteristics: ['Healthy pedigree', 'Pasture raised', 'Vaccinated']
    });

    if (res.success && res.data) {
      showAlert('success', `Animal ${res.data.id} (${res.data.breed}) created successfully!`);
      setIsAddAnimalOpen(false);
      setNewAnimalBreed('');
      setNewAnimalDesc('');
      setNewAnimalImage('');
      setIsDraggingImage(false);
      setIsUploadingImage(false);
      loadDashboardData();
    } else {
      showAlert('error', res.error || 'Failed to create animal');
    }
  };

  // Drag & Drop Image Handlers for New Animal
  const handleAnimalImageFile = async (file: File) => {
    if (!file.type.startsWith('image/')) {
      showAlert('error', 'Please drop a valid image file (JPG, PNG, WEBP, GIF)');
      return;
    }

    // Instant local preview
    const reader = new FileReader();
    reader.onload = (e) => {
      if (e.target?.result) {
        setNewAnimalImage(e.target.result as string);
      }
    };
    reader.readAsDataURL(file);

    // Upload to backend storage
    try {
      setIsUploadingImage(true);
      const res = await api.uploadAnimalImage(file);
      if (res.success && res.url) {
        setNewAnimalImage(res.url);
      }
    } catch (err) {
      console.error('Failed to upload animal image file:', err);
    } finally {
      setIsUploadingImage(false);
    }
  };

  const handleAnimalDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDraggingImage(true);
  };

  const handleAnimalDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDraggingImage(false);
  };

  const handleAnimalDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDraggingImage(false);

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0];
      handleAnimalImageFile(file);
    }
  };

  // ==================== CELEBRATION PACKAGES HANDLERS ====================
  const handleToggleCatalogItem = (item: PackageCatalogItem) => {
    setNewPkgSelectedItems(prev => {
      const exists = prev.some(i => i.id === item.id);
      if (exists) {
        return prev.filter(i => i.id !== item.id);
      } else {
        return [...prev, item];
      }
    });
  };

  const handleAddCustomItem = () => {
    if (!customItemName.trim()) {
      showAlert('error', 'Item name is required');
      return;
    }
    const customItem: PackageCatalogItem = {
      id: `custom-${Date.now().toString().slice(-4)}`,
      name: customItemName.trim(),
      category: customItemCategory,
      description: 'Custom celebration item included in package',
      price: Number(customItemPrice) || 1000,
      image: 'https://images.unsplash.com/photo-1548550023-2bdb3c5beed7?auto=format&fit=crop&w=400&q=80'
    };
    setNewPkgSelectedItems(prev => [...prev, customItem]);
    setCustomItemName('');
    setCustomItemPrice(1500);
    showAlert('success', `✓ Added "${customItem.name}" to package contents`);
  };

  const handlePackageImageFile = async (file: File) => {
    if (!file.type.startsWith('image/')) {
      showAlert('error', 'Please drop a valid image file (JPG, PNG, WEBP, GIF)');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      if (e.target?.result) {
        setNewPkgImage(e.target.result as string);
      }
    };
    reader.readAsDataURL(file);

    setIsUploadingPkgImage(true);
    try {
      const res = await api.uploadPackageImage(file);
      if (res.success && res.url) {
        setNewPkgImage(res.url);
        showAlert('success', '✓ Package image uploaded successfully');
      }
    } catch {
      // Local preview remains
    } finally {
      setIsUploadingPkgImage(false);
    }
  };

  const handlePackageDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDraggingPkgImage(true);
  };

  const handlePackageDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDraggingPkgImage(false);
  };

  const handlePackageDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDraggingPkgImage(false);

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0];
      handlePackageImageFile(file);
    }
  };

  const handleAddPackageSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPkgName.trim()) {
      showAlert('error', 'Package name is required');
      return;
    }
    if (!newPkgDescription.trim()) {
      showAlert('error', 'Package description is required');
      return;
    }
    if (!newPkgImage.trim()) {
      showAlert('error', 'Package image is required (upload or URL)');
      return;
    }
    if (newPkgSelectedItems.length === 0) {
      showAlert('error', 'Please select or add at least one item included in this package');
      return;
    }

    const defaultOriginal = Number(newPkgOriginalPrice) || (Number(newPkgPackagePrice) + 2000);
    const defaultPackagePrice = Number(newPkgPackagePrice) || 15000;

    const res = await api.createPackage({
      name: newPkgName.trim(),
      amharicName: newPkgAmharicName.trim() || undefined,
      tagline: newPkgTagline.trim() || undefined,
      badge: newPkgBadge.trim() || 'Special Package',
      description: newPkgDescription.trim(),
      image: newPkgImage.trim(),
      originalPrice: defaultOriginal,
      packagePrice: defaultPackagePrice,
      featured: newPkgFeatured,
      items: newPkgSelectedItems
    });

    if (res.success && res.data) {
      showAlert('success', `✓ Package "${res.data.name}" created and published!`);
      setIsAddPackageOpen(false);
      setNewPkgName('');
      setNewPkgAmharicName('');
      setNewPkgTagline('');
      setNewPkgBadge('⭐ Most Popular');
      setNewPkgDescription('');
      setNewPkgImage('');
      setNewPkgOriginalPrice(18000);
      setNewPkgPackagePrice(16000);
      setNewPkgSelectedItems([]);
      loadDashboardData();
    } else {
      showAlert('error', res.error || 'Failed to create package');
    }
  };

  const handleDeletePackage = async (pkgId: string, pkgName: string) => {
    if (!window.confirm(`Are you sure you want to delete the package "${pkgName}"?`)) {
      return;
    }
    const res = await api.deletePackage(pkgId);
    if (res.success) {
      showAlert('success', `✓ Package "${pkgName}" deleted successfully.`);
      setPackagesList(prev => prev.filter(p => p.id !== pkgId));
    } else {
      showAlert('error', res.error || 'Failed to delete package');
    }
  };

  // Handle Login Submit
  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');
    setIsLoggingIn(true);

    try {
      const res = await login(emailInput, passwordInput);
      if (!res.success) {
        setLoginError(res.error || 'Login failed');
      }
    } catch {
      setLoginError('Authentication failed');
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleUseDemoCredentials = () => {
    setEmailInput('admin@jonnylivestock.com');
    setPasswordInput('admin123');
    setLoginError('');
  };

  // ==========================================
  // VIEW 1A: 403 FORBIDDEN (If logged in as customer)
  // ==========================================
  const isCustomerAccount = isUserAuth && currentUser && currentUser.role !== 'admin';
  if (isCustomerAccount) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center px-4 py-12 animate-in fade-in zoom-in-95">
        <div
          className={`w-full max-w-md rounded-3xl border p-8 shadow-2xl text-center space-y-4 ${
            isDark ? 'bg-[#2A1A0D] border-[#4A2C16]' : 'bg-[#F1E8D8] border-[#E4D4BC]'
          }`}
        >
          <div className="w-14 h-14 rounded-2xl bg-red-500/15 text-red-500 flex items-center justify-center mx-auto">
            <Shield className="w-7 h-7" />
          </div>
          <h2 className="font-serif font-bold text-2xl text-red-500">403 - Access Denied</h2>
          <p className="text-xs opacity-80 leading-relaxed">
            You are currently signed in as a customer (<strong>{currentUser?.name}</strong>). Administrator credentials with verified privileges are required to view this portal.
          </p>
          <div className="pt-2 space-y-2">
            <button
              onClick={() => {
                userLogout();
                logout();
              }}
              className="w-full py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-black font-bold text-xs transition-all shadow-md"
            >
              Sign Out & Login as Administrator
            </button>
            <Link
              to="/"
              className="block w-full py-2.5 rounded-xl border text-xs font-semibold hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
            >
              Return to Homepage
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // ==========================================
  // VIEW 1B: ADMIN LOGIN PORTAL (if not authenticated)
  // ==========================================
  if (!isAuthenticated) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
        <div
          className={`w-full max-w-md rounded-3xl border p-6 sm:p-8 shadow-2xl transition-all ${
            isDark ? 'bg-[#2A1A0D] border-[#4A2C16]' : 'bg-[#F1E8D8] border-[#E4D4BC]'
          }`}
        >
          {/* Header */}
          <div className="text-center mb-6">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#4A2C16] to-[#2A1A0D] border border-[#C58A3A]/40 flex items-center justify-center mx-auto mb-3 text-[#E0B15A] shadow-inner">
              <Shield className="w-6 h-6" />
            </div>
            <h1 className={`font-serif font-bold text-2xl ${isDark ? 'text-[#F4E8D0]' : 'text-[#2A1A0D]'}`}>
              Owner Admin Portal
            </h1>
            <p className={`text-xs mt-1 ${isDark ? 'text-[#D8C5A8]' : 'text-[#746556]'}`}>
              Sign in with your administrator credentials to verify payment slips and manage livestock inventory.
            </p>
          </div>

          {/* Error Alert */}
          {loginError && (
            <div className="mb-4 p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-500 text-xs flex items-start gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{loginError}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleLoginSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider mb-1.5 opacity-90">
                Admin Email
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 opacity-50" />
                <input
                  type="email"
                  required
                  placeholder="admin@jonnylivestock.com"
                  value={emailInput}
                  onChange={(e) => setEmailInput(e.target.value)}
                  className={`w-full pl-10 pr-4 py-2.5 rounded-xl text-sm border focus:outline-none focus:ring-2 transition-all ${
                    isDark
                      ? 'bg-[#1B1208] border-[#4A2C16] text-[#F4E8D0] focus:ring-[#C58A3A]'
                      : 'bg-[#FAF7F0] border-[#E4D4BC] text-[#2A1A0D] focus:ring-[#B8792F]'
                  }`}
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider mb-1.5 opacity-90">
                Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 opacity-50" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  placeholder="••••••••"
                  value={passwordInput}
                  onChange={(e) => setPasswordInput(e.target.value)}
                  className={`w-full pl-10 pr-10 py-2.5 rounded-xl text-sm border focus:outline-none focus:ring-2 transition-all ${
                    isDark
                      ? 'bg-[#1B1208] border-[#4A2C16] text-[#F4E8D0] focus:ring-[#C58A3A]'
                      : 'bg-[#FAF7F0] border-[#E4D4BC] text-[#2A1A0D] focus:ring-[#B8792F]'
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 opacity-60 hover:opacity-100"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoggingIn}
              className={`w-full py-3 rounded-xl font-bold text-sm transition-all shadow-md flex items-center justify-center gap-2 ${
                isDark
                  ? 'bg-[#C58A3A] hover:bg-[#E0B15A] text-[#1B1208]'
                  : 'bg-[#B8792F] hover:bg-[#9E6523] text-[#FAF7F0]'
              } disabled:opacity-50`}
            >
              {isLoggingIn ? 'Verifying Credentials...' : 'Sign In to Dashboard'}
            </button>
          </form>

          {/* Quick Demo Helper */}
          <div className="mt-5 pt-4 border-t text-center space-y-2" style={{ borderColor: isDark ? '#4A2C16' : '#E4D4BC' }}>
            <p className="text-[11px] opacity-70">
              Demo Credentials: <strong className="font-mono">admin@jonnylivestock.com</strong> / <strong className="font-mono">admin123</strong>
            </p>
            <button
              type="button"
              onClick={handleUseDemoCredentials}
              className={`text-xs font-semibold hover:underline ${isDark ? 'text-[#E0B15A]' : 'text-[#B8792F]'}`}
            >
              Auto-fill Demo Credentials
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ==========================================
  // VIEW 2: AUTHENTICATED ADMIN DASHBOARD
  // ==========================================
  return (
    <div className={`min-h-screen pb-16 transition-colors duration-300 ${isDark ? 'bg-[#1B1208] text-[#F4E8D0]' : 'bg-[#FAF7F0] text-[#241A12]'}`}>
      
      {/* Top Banner with Real-Time Notification Bell & Refresh */}
      <div className={`border-b sticky top-16 z-40 backdrop-blur-md ${isDark ? 'bg-[#1B1208]/90 border-[#4A2C16]' : 'bg-[#FAF7F0]/90 border-[#E4D4BC]'}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-[#C18A45]/20 text-[#C18A45] flex items-center justify-center font-bold font-serif text-sm">
              JL
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-sm sm:text-base">Jonny Admin Portal</span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                  LIVE API
                </span>
              </div>
              <p className="text-[11px] opacity-70">
                Logged in as: <strong className="text-[#C18A45]">{user?.name}</strong> ({user?.email})
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Realtime Stream Badge */}
            <div
              className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-[11px] font-semibold border"
              style={{
                backgroundColor: isConnected ? (isDark ? 'rgba(16, 185, 129, 0.1)' : '#E8F5E9') : (isDark ? 'rgba(239, 68, 68, 0.1)' : '#FFEBEE'),
                borderColor: isConnected ? 'rgba(16, 185, 129, 0.3)' : 'rgba(239, 68, 68, 0.3)',
                color: isConnected ? '#10B981' : '#EF4444'
              }}
            >
              <span className={`w-2 h-2 rounded-full ${isConnected ? 'bg-emerald-500 animate-pulse' : 'bg-red-500'}`} />
              <span>{isConnected ? 'Live Stream Active' : 'Connecting Stream...'}</span>
            </div>

            {/* Refresh Button */}
            <button
              onClick={loadDashboardData}
              disabled={isLoadingData}
              className={`p-2 rounded-xl border text-xs font-semibold flex items-center gap-1.5 transition-colors ${
                isDark ? 'bg-[#2A1A0D] border-[#4A2C16] hover:bg-[#3A2412]' : 'bg-white border-[#E4D4BC] hover:bg-[#EFE8DC]'
              }`}
              title="Refresh Data"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isLoadingData ? 'animate-spin text-[#C18A45]' : ''}`} />
              <span className="hidden sm:inline">Refresh</span>
            </button>

            {/* Notifications Dropdown Container */}
            <div ref={notifDropdownRef} className="relative">
              <button
                onClick={() => setIsNotifDropdownOpen(!isNotifDropdownOpen)}
                className={`relative p-2 rounded-xl border transition-colors ${
                  isDark ? 'bg-[#2A1A0D] border-[#4A2C16] hover:bg-[#3A2412]' : 'bg-white border-[#E4D4BC] hover:bg-[#EFE8DC]'
                }`}
                aria-label="Notifications"
              >
                <Bell className="w-4 h-4 text-[#C18A45]" />
                {newPaymentsCount > 0 ? (
                  <span className="absolute -top-1 -right-1 min-w-4 h-4 px-1 rounded-full bg-red-500 text-white text-[10px] font-bold flex items-center justify-center animate-pulse shadow-sm">
                    {newPaymentsCount}
                  </span>
                ) : (
                  unreadNotifsCount > 0 && (
                    <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-amber-500 ring-2 ring-white dark:ring-black" />
                  )
                )}
              </button>

              {isNotifDropdownOpen && (
                <>
                  {/* Universal Backdrop to close whenever clicking anywhere outside the notification boundary */}
                  <div
                    className="fixed inset-0 z-40 bg-black/20 backdrop-blur-[1px]"
                    onClick={() => setIsNotifDropdownOpen(false)}
                    aria-hidden="true"
                  />

                  {/* Responsive Notification Dropdown: firmly bounded on mobile (inset-x-3) and absolute on desktop */}
                  <div
                    className={`fixed inset-x-3 top-20 sm:top-auto sm:inset-auto sm:absolute sm:right-0 sm:mt-2 w-auto sm:w-96 max-w-[calc(100vw-24px)] rounded-2xl shadow-2xl border p-3.5 z-50 animate-in fade-in zoom-in-95 duration-150 ${
                      isDark ? 'bg-[#24170D] border-[#4A2C16] text-[#F4E8D0]' : 'bg-white border-[#E4D4BC] text-[#2A1A0D]'
                    }`}
                  >
                    <div className="flex justify-between items-center pb-2 border-b border-black/10 dark:border-white/10 mb-2">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-xs">Payment Notifications</span>
                        {newPaymentsCount > 0 ? (
                          <span className="px-1.5 py-0.5 rounded-full text-[9px] font-bold bg-amber-500 text-black shadow-xs">
                            {newPaymentsCount} new payment{newPaymentsCount > 1 ? 's' : ''}
                          </span>
                        ) : (
                          <span className="px-1.5 py-0.5 rounded-full text-[9px] font-bold bg-emerald-500/20 text-emerald-400">
                            All reviewed
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] opacity-70">({notifications.length} total)</span>
                        <button
                          type="button"
                          onClick={() => setIsNotifDropdownOpen(false)}
                          className="p-1 rounded-lg hover:bg-black/10 dark:hover:bg-white/10 opacity-70 sm:hidden"
                          aria-label="Close notifications"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    <div className="max-h-72 overflow-y-auto space-y-2 pr-0.5 overscroll-contain">
                      {notifications.length === 0 ? (
                        <p className="text-xs opacity-60 text-center py-6">No notifications yet</p>
                      ) : (
                        notifications.map((n) => {
                          const relatedOrder = ordersList.find(
                            (o) => o.id.toLowerCase() === n.orderId?.toLowerCase()
                          );
                          const isPendingReview = relatedOrder
                            ? relatedOrder.status === 'reservation_pending' ||
                              relatedOrder.status === 'final_payment_pending' ||
                              relatedOrder.status === 'pending_verification'
                            : (n.type?.includes('SLIP') || n.type?.includes('DEPOSIT'));

                          return (
                            <button
                              key={n.id}
                              type="button"
                              onClick={() => handleNotificationClick(n)}
                              className={`w-full text-left p-2.5 rounded-xl border text-xs transition-all cursor-pointer group hover:scale-[1.01] active:scale-[0.99] ${
                                n.read
                                  ? 'opacity-75 bg-transparent border-black/5 dark:border-white/5 hover:border-[#C18A45]/40'
                                  : isDark
                                  ? 'bg-[#1B1208] border-[#C18A45]/40 hover:border-[#C18A45] shadow-xs'
                                  : 'bg-[#F9F6F0] border-[#C18A45]/40 hover:border-[#C18A45] shadow-xs'
                              }`}
                            >
                              <div className="flex items-start justify-between gap-1 mb-0.5">
                                <div className="font-bold text-[#C18A45] break-words flex items-center gap-1.5">
                                  {isPendingReview && (
                                    <span className="w-1.5 h-1.5 rounded-full bg-amber-500 shrink-0 animate-pulse" />
                                  )}
                                  <span>{n.title}</span>
                                </div>
                                <div className="flex items-center gap-1 shrink-0">
                                  {isPendingReview ? (
                                    <span className="px-1.5 py-0.5 rounded text-[8.5px] font-bold bg-amber-500/20 text-amber-400 border border-amber-500/30">
                                      Pending Approval
                                    </span>
                                  ) : relatedOrder?.status === 'completed' || relatedOrder?.status === 'verified' || relatedOrder?.status === 'delivered' ? (
                                    <span className="px-1.5 py-0.5 rounded text-[8.5px] font-bold bg-emerald-500/20 text-emerald-400">
                                      ✓ Settled
                                    </span>
                                  ) : relatedOrder?.status === 'reserved' ? (
                                    <span className="px-1.5 py-0.5 rounded text-[8.5px] font-bold bg-emerald-500/20 text-emerald-400">
                                      Reserved
                                    </span>
                                  ) : null}
                                  {n.orderId && (
                                    <span className="px-1.5 py-0.5 rounded text-[9px] font-mono font-bold bg-[#C18A45]/15 text-[#C18A45]">
                                      #{n.orderId}
                                    </span>
                                  )}
                                </div>
                              </div>
                              <p className="text-[11px] opacity-90 break-words leading-relaxed">{n.message}</p>
                              
                              {relatedOrder?.customerPhone && (
                                <div className="mt-1 inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 font-mono text-[10px]">
                                  <Phone className="w-2.5 h-2.5" />
                                  <span>{relatedOrder.customerPhone}</span>
                                </div>
                              )}
                              
                              <div className="mt-1.5 flex items-center justify-between gap-2 text-[9px]">
                                <span className="opacity-50 font-mono">
                                  {new Date(n.createdAt).toLocaleTimeString()} • {new Date(n.createdAt).toLocaleDateString()}
                                </span>
                                {n.orderId && (
                                  <span className="text-[#C18A45] font-bold inline-flex items-center gap-0.5 group-hover:underline">
                                    <span>{isPendingReview ? 'Review & Approve Slip' : 'View Order Details'}</span>
                                    <ArrowRight className="w-2.5 h-2.5" />
                                  </span>
                                )}
                              </div>
                            </button>
                          );
                        })
                      )}
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* Logout */}
            <button
              onClick={logout}
              className="p-2 rounded-xl bg-red-500/10 text-red-400 border border-red-500/20 hover:bg-red-500/20 transition-colors"
              title="Sign Out"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Action Flash Alert: Screen-bounded on mobile */}
      {actionAlert && (
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 mt-4 animate-in fade-in slide-in-from-top-2">
          <div
            className={`p-3.5 rounded-2xl border flex items-center justify-between gap-3 text-xs font-semibold ${
              actionAlert.type === 'success'
                ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                : 'bg-red-500/10 border-red-500/30 text-red-400'
            }`}
          >
            <span className="flex-1 min-w-0 break-words leading-relaxed">{actionAlert.message}</span>
            <button onClick={() => setActionAlert(null)} className="shrink-0 p-1">
              <X className="w-4 h-4 opacity-70 hover:opacity-100" />
            </button>
          </div>
        </div>
      )}

      {/* Main Dashboard Container */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
        
        {/* Navigation Tabs */}
        <div className="flex flex-wrap items-center gap-2 border-b pb-4 mb-6" style={{ borderColor: isDark ? '#4A2C16' : '#E4D4BC' }}>
          <button
            onClick={() => setActiveTab('overview')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'overview'
                ? 'bg-[#C18A45] text-white shadow-md'
                : isDark ? 'hover:bg-[#2A1A0D] text-[#D8C5A8]' : 'hover:bg-[#F1E8D8] text-[#746556]'
            }`}
          >
            <LayoutDashboard className="w-4 h-4" />
            <span>Overview</span>
          </button>

          <button
            onClick={() => setActiveTab('orders')}
            className={`relative flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'orders'
                ? 'bg-[#C18A45] text-white shadow-md'
                : isDark ? 'hover:bg-[#2A1A0D] text-[#D8C5A8]' : 'hover:bg-[#F1E8D8] text-[#746556]'
            }`}
          >
            <CreditCard className="w-4 h-4" />
            <span>Orders & Payment Slips</span>
            {stats.pendingOrdersCount > 0 && (
              <span className="px-1.5 py-0.2 rounded-full bg-amber-500 text-black text-[10px] font-black">
                {stats.pendingOrdersCount}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('inventory')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'inventory'
                ? 'bg-[#C18A45] text-white shadow-md'
                : isDark ? 'hover:bg-[#2A1A0D] text-[#D8C5A8]' : 'hover:bg-[#F1E8D8] text-[#746556]'
            }`}
          >
            <Layers className="w-4 h-4" />
            <span>Livestock Inventory ({animalsList.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('packages')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'packages'
                ? 'bg-[#C18A45] text-white shadow-md'
                : isDark ? 'hover:bg-[#2A1A0D] text-[#D8C5A8]' : 'hover:bg-[#F1E8D8] text-[#746556]'
            }`}
          >
            <Gift className="w-4 h-4 text-amber-400" />
            <span>Celebration Packages ({packagesList.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('demand')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'demand'
                ? 'bg-[#C18A45] text-white shadow-md'
                : isDark ? 'hover:bg-[#2A1A0D] text-[#D8C5A8]' : 'hover:bg-[#F1E8D8] text-[#746556]'
            }`}
          >
            <BarChart3 className="w-4 h-4" />
            <span>Demand & Metrics</span>
          </button>
        </div>

        {/* ============================================================ */}
        {/* TAB 1: OVERVIEW & METRICS */}
        {/* ============================================================ */}
        {activeTab === 'overview' && (
          <div className="space-y-6 animate-in fade-in-50 duration-150">
            {/* KPI Cards Grid */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <div className={`p-4 sm:p-5 rounded-2xl border ${isDark ? 'bg-[#2A1A0D] border-[#4A2C16]' : 'bg-[#F1E8D8] border-[#E4D4BC]'}`}>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[11px] font-semibold uppercase tracking-wider opacity-70">Verified Revenue</span>
                  <div className="w-7 h-7 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
                    <DollarSign className="w-3.5 h-3.5" />
                  </div>
                </div>
                <div className="text-xl sm:text-2xl font-serif font-extrabold text-[#C18A45]">
                  {formatPrice(stats.verifiedRevenue)}
                </div>
                <p className="text-[11px] opacity-70 mt-1">
                  {stats.verifiedOrdersCount} Verified Payments
                </p>
              </div>

              <div className={`p-4 sm:p-5 rounded-2xl border ${isDark ? 'bg-[#2A1A0D] border-[#4A2C16]' : 'bg-[#F1E8D8] border-[#E4D4BC]'}`}>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[11px] font-semibold uppercase tracking-wider opacity-70">Pending Slips</span>
                  <div className="w-7 h-7 rounded-lg bg-amber-500/10 text-amber-500 flex items-center justify-center">
                    <Clock className="w-3.5 h-3.5" />
                  </div>
                </div>
                <div className="text-xl sm:text-2xl font-serif font-extrabold text-amber-400">
                  {stats.pendingOrdersCount} Slips
                </div>
                <p className="text-[11px] opacity-70 mt-1">
                  Awaiting your approval
                </p>
              </div>

              <div className={`p-4 sm:p-5 rounded-2xl border ${isDark ? 'bg-[#2A1A0D] border-[#4A2C16]' : 'bg-[#F1E8D8] border-[#E4D4BC]'}`}>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[11px] font-semibold uppercase tracking-wider opacity-70">Total Animals</span>
                  <div className="w-7 h-7 rounded-lg bg-blue-500/10 text-blue-500 flex items-center justify-center">
                    <ShoppingBag className="w-3.5 h-3.5" />
                  </div>
                </div>
                <div className="text-xl sm:text-2xl font-serif font-extrabold">
                  {stats.totalAnimals} Head
                </div>
                <p className="text-[11px] opacity-70 mt-1">
                  {stats.sheepCount} Sheep · {stats.goatsCount} Goats · {stats.cowsCount} Cows
                </p>
              </div>

              <div className={`p-4 sm:p-5 rounded-2xl border ${isDark ? 'bg-[#2A1A0D] border-[#4A2C16]' : 'bg-[#F1E8D8] border-[#E4D4BC]'}`}>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[11px] font-semibold uppercase tracking-wider opacity-70">Inventory Status</span>
                  <div className="w-7 h-7 rounded-lg bg-green-500/10 text-green-500 flex items-center justify-center">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                  </div>
                </div>
                <div className="flex items-center gap-1.5 text-xs font-semibold">
                  <span className="text-green-500 font-bold">{stats.availableCount} Avail</span>
                  <span>·</span>
                  <span className="text-amber-500 font-bold">{stats.reservedCount} Hold</span>
                  <span>·</span>
                  <span className="text-stone-400 font-bold">{stats.soldCount} Sold</span>
                </div>
                <div className="mt-2 w-full bg-stone-700/30 rounded-full h-1.5 overflow-hidden flex">
                  <div style={{ width: `${(stats.availableCount / (stats.totalAnimals || 1)) * 100}%` }} className="bg-green-500 h-full" />
                  <div style={{ width: `${(stats.reservedCount / (stats.totalAnimals || 1)) * 100}%` }} className="bg-amber-500 h-full" />
                  <div style={{ width: `${(stats.soldCount / (stats.totalAnimals || 1)) * 100}%` }} className="bg-stone-500 h-full" />
                </div>
              </div>
            </div>

            {/* Quick Pending Slips Action Banner */}
            {stats.pendingOrdersCount > 0 && (
              <div
                className={`p-5 rounded-3xl border flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
                  isDark ? 'bg-[#2A1A0D] border-amber-500/40' : 'bg-[#FFF8EC] border-amber-500/40'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-amber-500/20 text-amber-500 flex items-center justify-center flex-shrink-0">
                    <Clock className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-serif font-bold text-base text-amber-400">
                      {stats.pendingOrdersCount} Customer Payment Slips Awaiting Review
                    </h3>
                    <p className="text-xs opacity-75">
                      Verify transactions to automatically deduct inventory and mark livestock items as SOLD.
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setActiveTab('orders')}
                  className="px-5 py-2.5 rounded-xl bg-[#C18A45] hover:bg-[#A06E35] text-white font-bold text-xs shadow-md transition-all self-start sm:self-auto flex items-center gap-1.5"
                >
                  <span>Review Slips Now</span>
                  <ArrowUpRight className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        )}

        {/* ============================================================ */}
        {/* TAB 2: ORDERS & SLIP VERIFICATION */}
        {/* ============================================================ */}
        {activeTab === 'orders' && (
          <div className="space-y-5 animate-in fade-in-50 duration-150">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h2 className="font-serif font-bold text-2xl">
                  Customer Orders & Payment Slip Verification
                </h2>
                <p className="text-xs opacity-70">
                  Inspect customer-uploaded transfer receipts and verify transactions. Once approved, the animal is automatically marked as SOLD.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <select
                  value={orderStatusFilter}
                  onChange={(e) => setOrderStatusFilter(e.target.value)}
                  className={`px-3.5 py-2 rounded-xl text-xs font-semibold border focus:outline-none shadow-xs transition-colors ${
                    isDark ? 'bg-[#1B1208] border-[#4A2C16] text-[#F4E8D0]' : 'bg-[#FAF7F0] border-[#E4D4BC] text-[#2A1A0D]'
                  }`}
                >
                  <option value="all">All Orders & Reservations ({ordersList.length})</option>
                  <option value="active_reservation">Active Reservation ({ordersList.filter(o => o.status === 'reserved' || o.status === 'reservation_pending').length})</option>
                  <option value="sold">Sold ({ordersList.filter(o => o.status === 'completed' || o.status === 'verified').length})</option>
                  <option value="delivery_pending">Delivery Pending ({ordersList.filter(o => o.status === 'delivery_pending' || ((o.status === 'completed' || o.status === 'verified') && Boolean(o.deliveryLocation))).length})</option>
                  <option value="delivered">Delivered ({ordersList.filter(o => o.status === 'delivered').length})</option>
                  <option value="rejected">Rejected ({ordersList.filter(o => o.status === 'rejected').length})</option>
                </select>
              </div>
            </div>

            {/* Orders Table */}
            <div
              className={`rounded-3xl border overflow-hidden shadow-sm ${
                isDark ? 'bg-[#2A1A0D] border-[#4A2C16]' : 'bg-[#F1E8D8] border-[#E4D4BC]'
              }`}
            >
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className={`border-b ${isDark ? 'border-[#4A2C16] text-[#D8C5A8]' : 'border-[#E4D4BC] text-[#746556]'}`}>
                      <th className="py-3.5 px-3.5 uppercase font-semibold">Order / Reservation ID</th>
                      <th className="py-3.5 px-3.5 uppercase font-semibold">Customer</th>
                      <th className="py-3.5 px-3.5 uppercase font-semibold">Item & Breakdown</th>
                      <th className="py-3.5 px-3.5 uppercase font-semibold">Receipt Slips</th>
                      <th className="py-3.5 px-3.5 uppercase font-semibold">Method & Txn</th>
                      <th className="py-3.5 px-3.5 uppercase font-semibold">Status</th>
                      <th className="py-3.5 px-3.5 uppercase font-semibold text-right">Verification Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y" style={{ borderColor: isDark ? '#4A2C16' : '#E4D4BC' }}>
                    {filteredOrders.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="text-center py-8 opacity-60">
                          No orders found matching filter
                        </td>
                      </tr>
                    ) : (
                      filteredOrders.map((order) => {
                        const isRes = order.isReservation || order.depositAmount != null;
                        const deposit = order.depositAmount || (order.totalAmount * 0.5);
                        const remaining = order.remainingAmount || (order.totalAmount * 0.5);

                        return (
                          <tr key={order.id} className={`hover:bg-black/10 transition-colors ${isDark ? 'text-[#F4E8D0]' : 'text-[#2A1A0D]'}`}>
                            {/* Order ID & Type */}
                            <td className="py-3.5 px-3.5 font-mono font-bold">
                              <div className="text-amber-500">{order.id}</div>
                              <span className="text-[10px] opacity-50 block">
                                {new Date(order.createdAt).toLocaleDateString()}
                              </span>
                              {order.isPackage && (
                                <span className="inline-block px-1.5 py-0.5 mt-0.5 rounded text-[9px] font-bold bg-purple-500/20 text-purple-400">
                                  Package Order
                                </span>
                              )}
                              {isRes && (
                                <span className="inline-block px-1.5 py-0.5 mt-0.5 rounded text-[9px] font-bold bg-emerald-500/20 text-emerald-400 ml-1">
                                  50% Reserve
                                </span>
                              )}
                            </td>

                            {/* Customer */}
                            <td className="py-3.5 px-3.5">
                              <strong className="block text-sm">{order.customerName}</strong>
                              <span className="text-[11px] opacity-70 block">{order.customerPhone}</span>
                              {order.deliveryLocation && (
                                <span className="text-[10px] opacity-50 truncate max-w-[150px] block">
                                  📍 {order.deliveryLocation}
                                </span>
                              )}
                            </td>

                            {/* Item & Price */}
                            <td className="py-3.5 px-3.5">
                              <div className="font-semibold">{order.packageName || order.animalBreed || 'Livestock Item'}</div>
                              {order.animalId && (
                                <span className="text-[10px] font-mono opacity-60 block">ID: {order.animalId}</span>
                              )}
                              <div className={`font-bold text-sm ${isDark ? 'text-[#E0B15A]' : 'text-[#B8792F]'}`}>
                                Total: {formatPrice(order.totalAmount)}
                              </div>
                              {isRes && (
                                <div className="text-[10px] space-y-0.5 mt-0.5">
                                  <span className="text-emerald-500 font-semibold block">50% Deposit: {formatPrice(deposit)}</span>
                                  <span className="text-amber-500 font-semibold block">Remaining: {formatPrice(remaining)}</span>
                                </div>
                              )}
                            </td>

                            {/* Slip Preview Thumbnails (Initial + Final) */}
                            <td className="py-3.5 px-3.5">
                              <div className="space-y-1">
                                {order.paymentSlipUrl ? (
                                  <button
                                    type="button"
                                    onClick={() => setSelectedSlipOrder(order)}
                                    className="group relative inline-flex items-center gap-1.5 p-1 rounded-xl border border-[#C18A45]/30 hover:border-[#C18A45] transition-all bg-black/20"
                                    title="Click to inspect initial slip"
                                  >
                                    <img
                                      src={order.paymentSlipUrl}
                                      alt="Receipt"
                                      className="w-10 h-10 object-cover rounded-lg"
                                    />
                                    <span className="text-[10px] font-bold text-[#C18A45] pr-1">
                                      {isRes ? 'Deposit Slip' : 'Full Slip'}
                                    </span>
                                  </button>
                                ) : (
                                  <span className="text-[10px] opacity-40 block">No Deposit Slip</span>
                                )}

                                {order.finalPaymentSlipUrl && (
                                  <button
                                    type="button"
                                    onClick={() => setSelectedSlipOrder({
                                      ...order,
                                      paymentSlipUrl: order.finalPaymentSlipUrl!
                                    })}
                                    className="group relative inline-flex items-center gap-1.5 p-1 rounded-xl border border-emerald-500/30 hover:border-emerald-500 transition-all bg-emerald-500/10"
                                    title="Click to inspect final 50% balance slip"
                                  >
                                    <img
                                      src={order.finalPaymentSlipUrl}
                                      alt="Final Receipt"
                                      className="w-10 h-10 object-cover rounded-lg"
                                    />
                                    <span className="text-[10px] font-bold text-emerald-400 pr-1">
                                      Final Slip
                                    </span>
                                  </button>
                                )}
                              </div>
                            </td>

                            {/* Method */}
                            <td className="py-3.5 px-3.5">
                              <div className="font-semibold">{order.paymentMethod}</div>
                              {order.transactionReference && (
                                <span className="text-[10px] font-mono opacity-70 block">
                                  Txn: {order.transactionReference}
                                </span>
                              )}
                            </td>

                            {/* Status Badge */}
                            <td className="py-3.5 px-3.5">
                              {order.status === 'reservation_pending' && (
                                <span className="inline-block px-2.5 py-1 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-400 border border-amber-500/30 animate-pulse">
                                  50% Deposit Review Pending
                                </span>
                              )}
                              {order.status === 'reserved' && (
                                <span className="inline-block px-2.5 py-1 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-400 border border-amber-500/30">
                                  Active Reservation (50% Paid)
                                </span>
                              )}
                              {order.status === 'final_payment_pending' && (
                                <span className="inline-block px-2.5 py-1 rounded-full text-[10px] font-bold bg-purple-500/20 text-purple-400 border border-purple-500/30 animate-pulse">
                                  Final 50% Slip Review Pending
                                </span>
                              )}
                              {order.status === 'pending_verification' && (
                                <span className="inline-block px-2.5 py-1 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-400 border border-amber-500/30 animate-pulse">
                                  Full Slip Review Pending
                                </span>
                              )}
                              {order.status === 'delivery_pending' && (
                                <span className="inline-block px-2.5 py-1 rounded-full text-[10px] font-bold bg-blue-500/20 text-blue-400 border border-blue-500/30">
                                  🚚 Delivery Pending
                                </span>
                              )}
                              {order.status === 'delivered' && (
                                <span className="inline-block px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                                  🏡 Delivered to Customer
                                </span>
                              )}
                              {(order.status === 'completed' || order.status === 'verified') && (
                                <span className="inline-block px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                                  ✓ Sold
                                </span>
                              )}
                              {order.status === 'rejected' && (
                                <span className="inline-block px-2.5 py-1 rounded-full text-[10px] font-bold bg-red-500/20 text-red-400 border border-red-500/30">
                                  Rejected
                                </span>
                              )}
                            </td>

                            {/* Actions */}
                            <td className="py-3.5 px-3.5 text-right">
                              <div className="inline-flex flex-wrap items-center justify-end gap-1.5">
                                {/* 1. Deposit Review Pending Action */}
                                {order.status === 'reservation_pending' && (
                                  <>
                                    <button
                                      onClick={() => handleVerifyReservation(order.id)}
                                      className="px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-black font-bold text-xs shadow transition-all flex items-center gap-1"
                                      title="Approve 50% deposit and lock/reserve item"
                                    >
                                      <Check className="w-3.5 h-3.5" />
                                      <span>Approve 50% Deposit</span>
                                    </button>
                                    <button
                                      onClick={() => handleRejectOrder(order.id)}
                                      className="p-1.5 rounded-xl bg-red-500/20 hover:bg-red-500/30 text-red-400 transition-colors"
                                      title="Reject deposit slip"
                                    >
                                      <X className="w-4 h-4" />
                                    </button>
                                  </>
                                )}

                                {/* 2. Final 50% Balance Review Pending Action */}
                                {order.status === 'final_payment_pending' && (
                                  <>
                                    <button
                                      onClick={() => handleVerifyFinalPayment(order.id)}
                                      className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow transition-all flex items-center gap-1"
                                      title="Verify final balance and mark animal as SOLD"
                                    >
                                      <Check className="w-3.5 h-3.5" />
                                      <span>Approve Final & Mark Sold</span>
                                    </button>
                                    <button
                                      onClick={() => handleRejectOrder(order.id)}
                                      className="p-1.5 rounded-xl bg-red-500/20 hover:bg-red-500/30 text-red-400 transition-colors"
                                      title="Reject final slip"
                                    >
                                      <X className="w-4 h-4" />
                                    </button>
                                  </>
                                )}

                                {/* 3. Standard Full Payment Action */}
                                {order.status === 'pending_verification' && (
                                  <>
                                    <button
                                      onClick={() => handleVerifyOrder(order.id)}
                                      className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow transition-all flex items-center gap-1"
                                      title="Verify payment and mark animal as SOLD"
                                    >
                                      <Check className="w-3.5 h-3.5" />
                                      <span>Verify & Mark Sold</span>
                                    </button>
                                    <button
                                      onClick={() => handleRejectOrder(order.id)}
                                      className="p-1.5 rounded-xl bg-red-500/20 hover:bg-red-500/30 text-red-400 transition-colors"
                                      title="Reject slip"
                                    >
                                      <X className="w-4 h-4" />
                                    </button>
                                  </>
                                )}

                                {/* 4. Already Reserved */}
                                {order.status === 'reserved' && (
                                  <span className="text-[11px] text-amber-500 font-medium">
                                    Awaiting remaining {formatPrice(remaining)} from customer
                                  </span>
                                )}

                                {/* 5. Sold / Completed - Provide Delivery Status Transitions */}
                                {(order.status === 'completed' || order.status === 'verified') && (
                                  <div className="flex items-center gap-1.5">
                                    {order.deliveryLocation ? (
                                      <>
                                        <button
                                          onClick={() => handleUpdateOrderStatus(order.id, 'delivery_pending')}
                                          className="px-2.5 py-1 rounded-xl bg-blue-500/20 hover:bg-blue-500/30 text-blue-400 font-bold text-[11px] transition-colors"
                                          title="Set order as Delivery Pending"
                                        >
                                          Dispatch Delivery
                                        </button>
                                        <button
                                          onClick={() => handleUpdateOrderStatus(order.id, 'delivered')}
                                          className="px-2.5 py-1 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-400 font-bold text-[11px] transition-colors"
                                          title="Mark as Delivered"
                                        >
                                          Mark Delivered ✓
                                        </button>
                                      </>
                                    ) : (
                                      <span className="text-[11px] text-emerald-500 font-semibold">
                                        ✓ Fully Paid & Sold
                                      </span>
                                    )}
                                  </div>
                                )}

                                {/* 6. Delivery Pending Actions */}
                                {order.status === 'delivery_pending' && (
                                  <div className="flex items-center gap-1.5">
                                    <button
                                      onClick={() => handleUpdateOrderStatus(order.id, 'delivered')}
                                      className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow transition-colors flex items-center gap-1"
                                      title="Confirm delivery to customer"
                                    >
                                      <Check className="w-3.5 h-3.5" />
                                      <span>Mark Delivered</span>
                                    </button>
                                  </div>
                                )}

                                {/* 7. Delivered Status */}
                                {order.status === 'delivered' && (
                                  <span className="text-[11px] text-emerald-400 font-bold inline-flex items-center gap-1">
                                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                                    <span>Delivered & Closed</span>
                                  </span>
                                )}
                              </div>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ============================================================ */}
        {/* TAB 3: LIVESTOCK INVENTORY */}
        {/* ============================================================ */}
        {activeTab === 'inventory' && (
          <div className="space-y-5 animate-in fade-in-50 duration-150">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h2 className="font-serif font-bold text-2xl">
                  Livestock Inventory Manager
                </h2>
                <p className="text-xs opacity-70">
                  Search, inspect, toggle availability, and add new livestock listings.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <button
                  onClick={() => setIsAddAnimalOpen(true)}
                  className="px-3.5 py-1.5 rounded-xl bg-[#C18A45] hover:bg-[#A06E35] text-white text-xs font-bold shadow transition-colors flex items-center gap-1.5"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Animal</span>
                </button>

                <div className="relative">
                  <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 opacity-60" />
                  <input
                    type="text"
                    placeholder="Search ID, breed..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className={`pl-8 pr-3 py-1.5 rounded-xl text-xs border focus:outline-none ${
                      isDark ? 'bg-[#1B1208] border-[#4A2C16] text-[#F4E8D0]' : 'bg-[#FAF7F0] border-[#E4D4BC] text-[#2A1A0D]'
                    }`}
                  />
                </div>

                <select
                  value={selectedTypeFilter}
                  onChange={(e) => setSelectedTypeFilter(e.target.value)}
                  className={`px-2.5 py-1.5 rounded-xl text-xs border focus:outline-none ${
                    isDark ? 'bg-[#1B1208] border-[#4A2C16] text-[#F4E8D0]' : 'bg-[#FAF7F0] border-[#E4D4BC] text-[#2A1A0D]'
                  }`}
                >
                  <option value="all">All Types</option>
                  <option value="sheep">Sheep</option>
                  <option value="goat">Goat</option>
                  <option value="cow">Cow</option>
                </select>

                <select
                  value={selectedStatusFilter}
                  onChange={(e) => setSelectedStatusFilter(e.target.value)}
                  className={`px-2.5 py-1.5 rounded-xl text-xs border focus:outline-none ${
                    isDark ? 'bg-[#1B1208] border-[#4A2C16] text-[#F4E8D0]' : 'bg-[#FAF7F0] border-[#E4D4BC] text-[#2A1A0D]'
                  }`}
                >
                  <option value="all">All Statuses</option>
                  <option value="available">Available</option>
                  <option value="reserved">Reserved</option>
                  <option value="sold">Sold</option>
                </select>
              </div>
            </div>

            {/* Inventory Table */}
            <div
              className={`rounded-3xl border overflow-hidden shadow-sm ${
                isDark ? 'bg-[#2A1A0D] border-[#4A2C16]' : 'bg-[#F1E8D8] border-[#E4D4BC]'
              }`}
            >
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className={`border-b ${isDark ? 'border-[#4A2C16] text-[#D8C5A8]' : 'border-[#E4D4BC] text-[#746556]'}`}>
                      <th className="py-3 px-3.5 uppercase font-semibold">Animal ID</th>
                      <th className="py-3 px-3.5 uppercase font-semibold">Breed & Type</th>
                      <th className="py-3 px-3.5 uppercase font-semibold">Gender</th>
                      <th className="py-3 px-3.5 uppercase font-semibold">Weight</th>
                      <th className="py-3 px-3.5 uppercase font-semibold">Price</th>
                      <th className="py-3 px-3.5 uppercase font-semibold">Status</th>
                      <th className="py-3 px-3.5 uppercase font-semibold text-right">Quick Toggle Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y" style={{ borderColor: isDark ? '#4A2C16' : '#E4D4BC' }}>
                    {filteredAnimals.map((animal) => (
                      <tr key={animal.id} className={`hover:bg-black/10 transition-colors ${isDark ? 'text-[#F4E8D0]' : 'text-[#2A1A0D]'}`}>
                        <td className="py-3 px-3.5 font-mono font-bold">
                          <Link to={`/animals/${animal.id}`} className="hover:underline inline-flex items-center gap-1">
                            <span>{animal.id}</span>
                            <ArrowUpRight className="w-3 h-3 opacity-60" />
                          </Link>
                        </td>
                        <td className="py-3 px-3.5">
                          <div className="capitalize font-semibold">{animal.breed}</div>
                          <span className="text-[10px] uppercase opacity-70 tracking-wider">{animal.type}</span>
                        </td>
                        <td className="py-3 px-3.5">{animal.gender}</td>
                        <td className="py-3 px-3.5 font-bold">{formatWeight(animal.weight)}</td>
                        <td className={`py-3 px-3.5 font-bold ${isDark ? 'text-[#E0B15A]' : 'text-[#B8792F]'}`}>
                          {formatPrice(animal.price)}
                        </td>
                        <td className="py-3 px-3.5">
                          <StatusBadge status={animal.status} size="sm" />
                        </td>
                        <td className="py-3 px-3.5 text-right">
                          <div className="inline-flex items-center gap-1">
                            <button
                              onClick={() => handleToggleStatus(animal.id, 'available')}
                              disabled={animal.status === 'available'}
                              className="px-2 py-0.5 rounded text-[10px] font-semibold bg-green-500/20 text-green-400 border border-green-500/30 hover:bg-green-500/30 disabled:opacity-30"
                            >
                              Avail
                            </button>
                            <button
                              onClick={() => handleToggleStatus(animal.id, 'reserved')}
                              disabled={animal.status === 'reserved'}
                              className="px-2 py-0.5 rounded text-[10px] font-semibold bg-amber-500/20 text-amber-400 border border-amber-500/30 hover:bg-amber-500/30 disabled:opacity-30"
                            >
                              Hold
                            </button>
                            <button
                              onClick={() => handleToggleStatus(animal.id, 'sold')}
                              disabled={animal.status === 'sold'}
                              className="px-2 py-0.5 rounded text-[10px] font-semibold bg-stone-600/20 text-stone-400 border border-stone-600/30 hover:bg-stone-600/30 disabled:opacity-30"
                            >
                              Sold
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ============================================================ */}
        {/* TAB 4: CELEBRATION PACKAGES */}
        {/* ============================================================ */}
        {activeTab === 'packages' && (
          <div className="space-y-6 animate-in fade-in-50 duration-150">
            {/* Header Banner & Add Button */}
            <div className={`p-6 rounded-3xl border flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-sm ${
              isDark ? 'bg-[#2A1A0D] border-[#4A2C16]' : 'bg-[#F1E8D8] border-[#E4D4BC]'
            }`}>
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <Gift className="w-5 h-5 text-amber-500" />
                  <h3 className="font-serif font-bold text-lg sm:text-xl">Holiday & Celebration Packages ({packagesList.length})</h3>
                </div>
                <p className="text-xs opacity-75 max-w-xl">
                  Manage festive celebration bundles in the PostgreSQL database. Customers view these bundles on the homepage and can order or reserve them with a 50% deposit.
                </p>
              </div>

              <button
                onClick={() => setIsAddPackageOpen(true)}
                className="flex items-center justify-center gap-2 px-5 py-3 rounded-2xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-black font-extrabold text-xs shadow-lg hover:shadow-xl hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer whitespace-nowrap"
              >
                <Plus className="w-4 h-4 stroke-[3]" />
                <span>Add New Celebration Package</span>
              </button>
            </div>

            {/* Packages Grid */}
            {packagesList.length === 0 ? (
              <div className={`p-12 text-center rounded-3xl border ${
                isDark ? 'bg-[#24170D] border-[#4A2C16]' : 'bg-white border-[#E4D4BC]'
              }`}>
                <Gift className="w-12 h-12 text-amber-500/40 mx-auto mb-3" />
                <h4 className="font-serif font-bold text-base mb-1">No Celebration Packages Found</h4>
                <p className="text-xs opacity-60 mb-4">Click below to create your first holiday celebration package.</p>
                <button
                  onClick={() => setIsAddPackageOpen(true)}
                  className="px-4 py-2 rounded-xl bg-amber-500 text-black font-bold text-xs"
                >
                  + Add Package
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {packagesList.map((pkg) => (
                  <div
                    key={pkg.id}
                    className={`rounded-3xl border overflow-hidden flex flex-col justify-between transition-all duration-200 hover:shadow-xl ${
                      isDark ? 'bg-[#1F140A] border-[#4A2C16]' : 'bg-white border-[#E4D4BC]'
                    }`}
                  >
                    <div>
                      {/* Package Image & Badges */}
                      <div className="relative h-48 w-full bg-black/20 overflow-hidden">
                        <img
                          src={pkg.image}
                          alt={pkg.name}
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                        
                        <div className="absolute top-3 left-3">
                          <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-amber-500 text-black shadow-md">
                            {pkg.badge || 'Holiday Package'}
                          </span>
                        </div>

                        {pkg.featured && (
                          <div className="absolute top-3 right-3">
                            <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-500 text-white shadow-md">
                              ★ Featured on Home
                            </span>
                          </div>
                        )}

                        <div className="absolute bottom-3 left-3 right-3 text-white">
                          <h4 className="font-serif font-bold text-base line-clamp-1">{pkg.name}</h4>
                          {pkg.amharicName && (
                            <div className="text-xs text-amber-300 font-serif opacity-90 line-clamp-1">{pkg.amharicName}</div>
                          )}
                        </div>
                      </div>

                      {/* Content Details */}
                      <div className="p-4 sm:p-5 space-y-3">
                        {pkg.tagline && (
                          <div className="text-xs font-semibold text-amber-500 italic">
                            "{pkg.tagline}"
                          </div>
                        )}

                        <p className="text-xs opacity-80 line-clamp-3 leading-relaxed">
                          {pkg.description}
                        </p>

                        {/* Included Contents */}
                        <div className="space-y-1.5 pt-1">
                          <div className="text-[10px] font-bold uppercase tracking-wider opacity-60 flex items-center justify-between">
                            <span>Includes ({pkg.items?.length || 0} items):</span>
                            <span className="text-emerald-500 font-semibold">{pkg.categoryCount} Categories</span>
                          </div>
                          <div className="flex flex-wrap gap-1">
                            {pkg.items?.map((item, idx) => (
                              <span
                                key={idx}
                                className="text-[10px] px-2 py-0.5 rounded-md bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 font-medium truncate max-w-[220px]"
                              >
                                • {item.name}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Price & Action */}
                    <div className={`p-4 sm:p-5 border-t flex items-center justify-between gap-3 ${
                      isDark ? 'bg-[#24170D] border-[#4A2C16]' : 'bg-[#FAF7F0] border-[#E4D4BC]'
                    }`}>
                      <div>
                        {pkg.originalPrice > pkg.packagePrice && (
                          <div className="text-[10px] line-through opacity-50 font-mono">
                            {formatPrice(pkg.originalPrice)}
                          </div>
                        )}
                        <div className="font-serif font-extrabold text-base sm:text-lg text-amber-500">
                          {formatPrice(pkg.packagePrice)}
                        </div>
                        {pkg.savings > 0 && (
                          <div className="text-[10px] text-emerald-500 font-bold">
                            Save {formatPrice(pkg.savings)}
                          </div>
                        )}
                      </div>

                      <button
                        type="button"
                        onClick={() => handleDeletePackage(pkg.id, pkg.name)}
                        className="p-2.5 rounded-xl text-red-400 hover:bg-red-500/10 transition-colors cursor-pointer border border-red-500/20"
                        title="Delete Package"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ============================================================ */}
        {/* TAB 5: DEMAND & METRICS */}
        {/* ============================================================ */}
        {activeTab === 'demand' && (
          <div className="space-y-6 animate-in fade-in-50 duration-150">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              <div className={`p-5 rounded-2xl border ${isDark ? 'bg-[#2A1A0D] border-[#4A2C16]' : 'bg-[#F1E8D8] border-[#E4D4BC]'}`}>
                <div className="flex items-center justify-between pb-2.5 border-b" style={{ borderColor: isDark ? '#4A2C16' : '#E4D4BC' }}>
                  <strong className="font-serif text-sm">Sheep Inventory Valuation</strong>
                  <span className="text-[11px] font-mono opacity-70">{stats.sheepCount} Head</span>
                </div>
                <div className="pt-2.5 text-lg font-bold text-[#C18A45]">{formatPrice(stats.sheepValue)}</div>
              </div>

              <div className={`p-5 rounded-2xl border ${isDark ? 'bg-[#2A1A0D] border-[#4A2C16]' : 'bg-[#F1E8D8] border-[#E4D4BC]'}`}>
                <div className="flex items-center justify-between pb-2.5 border-b" style={{ borderColor: isDark ? '#4A2C16' : '#E4D4BC' }}>
                  <strong className="font-serif text-sm">Goats Inventory Valuation</strong>
                  <span className="text-[11px] font-mono opacity-70">{stats.goatsCount} Head</span>
                </div>
                <div className="pt-2.5 text-lg font-bold text-[#C18A45]">{formatPrice(stats.goatValue)}</div>
              </div>

              <div className={`p-5 rounded-2xl border ${isDark ? 'bg-[#2A1A0D] border-[#4A2C16]' : 'bg-[#F1E8D8] border-[#E4D4BC]'}`}>
                <div className="flex items-center justify-between pb-2.5 border-b" style={{ borderColor: isDark ? '#4A2C16' : '#E4D4BC' }}>
                  <strong className="font-serif text-sm">Cows Inventory Valuation</strong>
                  <span className="text-[11px] font-mono opacity-70">{stats.cowsCount} Head</span>
                </div>
                <div className="pt-2.5 text-lg font-bold text-[#C18A45]">{formatPrice(stats.cowValue)}</div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Slip Preview & Direct Approval Modal */}
      {selectedSlipOrder && (
        <SlipPreviewModal
          isOpen={Boolean(selectedSlipOrder)}
          onClose={() => setSelectedSlipOrder(null)}
          slipUrl={selectedSlipOrder.paymentSlipUrl || selectedSlipOrder.finalPaymentSlipUrl || ''}
          order={selectedSlipOrder}
          orderId={selectedSlipOrder.id}
          customerName={selectedSlipOrder.customerName}
          onApproveReservation={async (id) => {
            await handleVerifyReservation(id);
            setSelectedSlipOrder(null);
          }}
          onApproveFinal={async (id) => {
            await handleVerifyFinalPayment(id);
            setSelectedSlipOrder(null);
          }}
          onApproveOrder={async (id) => {
            await handleVerifyOrder(id);
            setSelectedSlipOrder(null);
          }}
          onReject={async (id) => {
            await handleRejectOrder(id);
            setSelectedSlipOrder(null);
          }}
        />
      )}

      {/* Add Animal Modal */}
      {isAddAnimalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div
            className={`relative w-full max-w-lg rounded-3xl border shadow-2xl p-6 sm:p-8 animate-in fade-in zoom-in-95 duration-200 ${
              isDark ? 'bg-[#24170D] border-[#4A2C16] text-[#F4E8D0]' : 'bg-white border-[#E4D4BC] text-[#2A1A0D]'
            }`}
          >
            <button
              onClick={() => setIsAddAnimalOpen(false)}
              className="absolute top-5 right-5 p-2 rounded-full opacity-60 hover:opacity-100"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="font-serif font-bold text-xl mb-4 flex items-center gap-2">
              <Plus className="w-5 h-5 text-[#C18A45]" />
              <span>Add New Livestock Listing</span>
            </h3>

            <form onSubmit={handleAddAnimalSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold uppercase mb-1 opacity-80">Type *</label>
                  <select
                    value={newAnimalType}
                    onChange={(e) => setNewAnimalType(e.target.value as AnimalType)}
                    className="w-full px-3 py-2 rounded-xl text-xs border bg-transparent"
                  >
                    <option value="sheep" className="text-black">Sheep</option>
                    <option value="goat" className="text-black">Goat</option>
                    <option value="cow" className="text-black">Cow</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase mb-1 opacity-80">Breed *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Horro, Boer, Boran"
                    value={newAnimalBreed}
                    onChange={(e) => setNewAnimalBreed(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl text-xs border bg-transparent"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold uppercase mb-1 opacity-80">Weight (kg) *</label>
                  <input
                    type="number"
                    required
                    value={newAnimalWeight}
                    onChange={(e) => setNewAnimalWeight(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl text-xs border bg-transparent"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase mb-1 opacity-80">Price (ETB) *</label>
                  <input
                    type="number"
                    required
                    value={newAnimalPrice}
                    onChange={(e) => setNewAnimalPrice(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl text-xs border bg-transparent"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase mb-1 opacity-80">Color</label>
                  <input
                    type="text"
                    placeholder="Solid White"
                    value={newAnimalColor}
                    onChange={(e) => setNewAnimalColor(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl text-xs border bg-transparent"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase mb-1 opacity-80">Description</label>
                <textarea
                  rows={2}
                  placeholder="Prime meat conformation, organic grazing history..."
                  value={newAnimalDesc}
                  onChange={(e) => setNewAnimalDesc(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl text-xs border bg-transparent"
                />
              </div>

              {/* Drag and Drop Image Uploader */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-semibold uppercase opacity-80">
                    Animal Photo (Drag & Drop or File)
                  </label>
                  <div className="flex items-center gap-1 text-[10px]">
                    <button
                      type="button"
                      onClick={() => setImageUploadMode('upload')}
                      className={`px-2 py-0.5 rounded-lg font-medium transition-colors ${
                        imageUploadMode === 'upload'
                          ? 'bg-[#C18A45] text-white shadow-xs'
                          : 'opacity-60 hover:opacity-100'
                      }`}
                    >
                      Drag & Drop
                    </button>
                    <button
                      type="button"
                      onClick={() => setImageUploadMode('url')}
                      className={`px-2 py-0.5 rounded-lg font-medium transition-colors ${
                        imageUploadMode === 'url'
                          ? 'bg-[#C18A45] text-white shadow-xs'
                          : 'opacity-60 hover:opacity-100'
                      }`}
                    >
                      Paste URL
                    </button>
                  </div>
                </div>

                {imageUploadMode === 'upload' ? (
                  <div>
                    <input
                      ref={animalImageInputRef}
                      type="file"
                      accept="image/jpeg,image/png,image/webp,image/gif"
                      className="hidden"
                      onChange={(e) => {
                        if (e.target.files && e.target.files[0]) {
                          handleAnimalImageFile(e.target.files[0]);
                        }
                      }}
                    />

                    {newAnimalImage ? (
                      /* Preview of dropped/uploaded image */
                      <div
                        className={`relative rounded-2xl border p-2.5 flex items-center gap-3 ${
                          isDark ? 'bg-[#1B1208] border-[#4A2C16]' : 'bg-[#FAF7F0] border-[#E4D4BC]'
                        }`}
                      >
                        <div className="relative w-20 h-20 rounded-xl overflow-hidden shrink-0 border border-black/10 dark:border-white/10 bg-black/10">
                          <img
                            src={newAnimalImage}
                            alt="Preview"
                            className="w-full h-full object-cover"
                          />
                          {isUploadingImage && (
                            <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                              <RefreshCw className="w-5 h-5 text-[#C18A45] animate-spin" />
                            </div>
                          )}
                        </div>

                        <div className="flex-1 min-w-0 pr-1">
                          <div className="flex items-center gap-1.5">
                            <span className="text-xs font-bold text-[#C18A45]">
                              {isUploadingImage ? 'Uploading image...' : '✓ Image Attached'}
                            </span>
                          </div>
                          <p className="text-[10px] opacity-60 truncate mt-0.5">
                            {newAnimalImage.startsWith('data:') ? 'Local preview ready' : newAnimalImage}
                          </p>
                          <div className="mt-2.5 flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() => animalImageInputRef.current?.click()}
                              className="text-[11px] font-semibold text-[#C18A45] hover:underline cursor-pointer"
                            >
                              Choose Another
                            </button>
                            <span className="opacity-30">•</span>
                            <button
                              type="button"
                              onClick={() => setNewAnimalImage('')}
                              className="text-[11px] font-semibold text-red-400 hover:underline inline-flex items-center gap-0.5 cursor-pointer"
                            >
                              <Trash2 className="w-3 h-3" />
                              <span>Remove</span>
                            </button>
                          </div>
                        </div>
                      </div>
                    ) : (
                      /* Drop Zone */
                      <div
                        onDragOver={handleAnimalDragOver}
                        onDragLeave={handleAnimalDragLeave}
                        onDrop={handleAnimalDrop}
                        onClick={() => animalImageInputRef.current?.click()}
                        className={`relative cursor-pointer rounded-2xl border-2 border-dashed p-6 text-center transition-all group select-none ${
                          isDraggingImage
                            ? 'border-[#C18A45] bg-[#C18A45]/20 scale-[1.01]'
                            : isDark
                            ? 'border-[#4A2C16] hover:border-[#C18A45]/70 bg-[#1B1208]/60 hover:bg-[#1B1208]'
                            : 'border-[#E4D4BC] hover:border-[#C18A45]/70 bg-[#FAF7F0]/80 hover:bg-[#FAF7F0]'
                        }`}
                      >
                        <div className="flex flex-col items-center justify-center gap-2">
                          <div
                            className={`p-3 rounded-full transition-transform group-hover:scale-110 ${
                              isDraggingImage
                                ? 'bg-[#C18A45] text-white animate-bounce'
                                : 'bg-[#C18A45]/15 text-[#C18A45]'
                            }`}
                          >
                            <UploadCloud className="w-6 h-6" />
                          </div>
                          <div>
                            <p className="text-xs font-bold">
                              {isDraggingImage ? (
                                <span className="text-[#C18A45]">Drop image here!</span>
                              ) : (
                                <span>
                                  Drag and drop animal photo here, or{' '}
                                  <span className="text-[#C18A45] underline font-bold">browse</span>
                                </span>
                              )}
                            </p>
                            <p className="text-[10px] opacity-60 mt-0.5">
                              Supports JPG, PNG, WEBP, GIF (up to 10 MB)
                            </p>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div>
                    <input
                      type="url"
                      placeholder="https://images.unsplash.com/..."
                      value={newAnimalImage}
                      onChange={(e) => setNewAnimalImage(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl text-xs border bg-transparent"
                    />
                    {newAnimalImage && (
                      <div className="mt-2 flex items-center gap-2">
                        <img
                          src={newAnimalImage}
                          alt="URL Preview"
                          className="w-12 h-12 rounded-lg object-cover border"
                          onError={(e) => {
                            (e.target as HTMLElement).style.display = 'none';
                          }}
                        />
                        <span className="text-[10px] opacity-60">URL preview</span>
                      </div>
                    )}
                  </div>
                )}
              </div>

              <button
                type="submit"
                className="w-full py-3 rounded-xl bg-[#C18A45] hover:bg-[#A06E35] text-white font-bold text-xs shadow transition-all"
              >
                Create Listing
              </button>
            </form>
          </div>
        </div>
        )}

      {/* Add Celebration Package Modal */}
      {isAddPackageOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div
            className={`relative w-full max-w-2xl rounded-3xl border shadow-2xl p-6 sm:p-8 animate-in fade-in zoom-in-95 duration-200 my-8 ${
              isDark ? 'bg-[#24170D] border-[#4A2C16] text-[#F4E8D0]' : 'bg-white border-[#E4D4BC] text-[#2A1A0D]'
            }`}
          >
            <button
              onClick={() => setIsAddPackageOpen(false)}
              className="absolute top-5 right-5 p-2 rounded-full opacity-60 hover:opacity-100 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2 mb-2">
              <div className="w-8 h-8 rounded-xl bg-amber-500/15 text-amber-500 flex items-center justify-center">
                <Gift className="w-4 h-4" />
              </div>
              <h3 className="font-serif font-bold text-xl">Create New Celebration Package</h3>
            </div>
            <p className="text-xs opacity-70 mb-5">
              Fill in all package details. It will be saved directly into PostgreSQL and featured on the celebration marketplace.
            </p>

            <form onSubmit={handleAddPackageSubmit} className="space-y-4">
              {/* Package Title (English & Amharic) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold uppercase mb-1 opacity-80">Package Name (English) *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Enkutatash Royal Banquet"
                    value={newPkgName}
                    onChange={(e) => setNewPkgName(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl text-xs border bg-transparent"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase mb-1 opacity-80">Package Name (Amharic)</label>
                  <input
                    type="text"
                    placeholder="የእንቁጣጣሽ የንግሥና ድግስ ጥቅል"
                    value={newPkgAmharicName}
                    onChange={(e) => setNewPkgAmharicName(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl text-xs border bg-transparent"
                  />
                </div>
              </div>

              {/* Tagline & Badge */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold uppercase mb-1 opacity-80">Tagline / Subtitle</label>
                  <input
                    type="text"
                    placeholder="e.g. All-Inclusive Holiday Feast for 15-25 Guests"
                    value={newPkgTagline}
                    onChange={(e) => setNewPkgTagline(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl text-xs border bg-transparent"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase mb-1 opacity-80">Badge / Promotional Label</label>
                  <input
                    type="text"
                    placeholder="e.g. ⭐ Most Popular, 👑 VIP Luxury, 🎉 Holiday Special"
                    value={newPkgBadge}
                    onChange={(e) => setNewPkgBadge(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl text-xs border bg-transparent"
                  />
                </div>
              </div>

              {/* Detailed Description */}
              <div>
                <label className="block text-xs font-semibold uppercase mb-1 opacity-80">Package Description *</label>
                <textarea
                  rows={2}
                  required
                  placeholder="Describe what makes this package special, included premium meats, beverages, and service details..."
                  value={newPkgDescription}
                  onChange={(e) => setNewPkgDescription(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl text-xs border bg-transparent"
                />
              </div>

              {/* Pricing & Featured */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold uppercase mb-1 opacity-80">Package Price (Selling) *</label>
                  <input
                    type="number"
                    required
                    min={1}
                    value={newPkgPackagePrice}
                    onChange={(e) => setNewPkgPackagePrice(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl text-xs border bg-transparent font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase mb-1 opacity-80">Original / Regular Price *</label>
                  <input
                    type="number"
                    required
                    min={1}
                    value={newPkgOriginalPrice}
                    onChange={(e) => setNewPkgOriginalPrice(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl text-xs border bg-transparent font-mono"
                  />
                </div>
                <div className="flex flex-col justify-end">
                  <label className="flex items-center gap-2 text-xs font-semibold cursor-pointer pb-2">
                    <input
                      type="checkbox"
                      checked={newPkgFeatured}
                      onChange={(e) => setNewPkgFeatured(e.target.checked)}
                      className="w-4 h-4 rounded text-amber-500"
                    />
                    <span>Feature on Homepage</span>
                  </label>
                </div>
              </div>

              {/* Real-time Savings Pill */}
              {newPkgOriginalPrice > newPkgPackagePrice && (
                <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs flex items-center justify-between">
                  <span>Customer Savings / Discount:</span>
                  <span className="font-mono font-bold">Save {formatPrice(newPkgOriginalPrice - newPkgPackagePrice)} ({(Math.round(((newPkgOriginalPrice - newPkgPackagePrice) / newPkgOriginalPrice) * 100))}% OFF)</span>
                </div>
              )}

              {/* Drag and Drop Image Uploader */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-semibold uppercase opacity-80">
                    Package Cover Photo (Drag & Drop, File, or URL) *
                  </label>
                  <div className="flex items-center gap-1 text-[10px]">
                    <button
                      type="button"
                      onClick={() => setPkgImageUploadMode('upload')}
                      className={`px-2 py-0.5 rounded-lg font-medium transition-colors cursor-pointer ${
                        pkgImageUploadMode === 'upload'
                          ? 'bg-amber-500 text-black font-bold'
                          : 'opacity-60 hover:opacity-100'
                      }`}
                    >
                      File Upload
                    </button>
                    <button
                      type="button"
                      onClick={() => setPkgImageUploadMode('url')}
                      className={`px-2 py-0.5 rounded-lg font-medium transition-colors cursor-pointer ${
                        pkgImageUploadMode === 'url'
                          ? 'bg-amber-500 text-black font-bold'
                          : 'opacity-60 hover:opacity-100'
                      }`}
                    >
                      Paste URL
                    </button>
                  </div>
                </div>

                <input
                  type="file"
                  ref={pkgImageInputRef}
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => {
                    if (e.target.files && e.target.files[0]) {
                      handlePackageImageFile(e.target.files[0]);
                    }
                  }}
                />

                {pkgImageUploadMode === 'upload' ? (
                  newPkgImage ? (
                    <div
                      className={`flex items-center gap-3 p-3 rounded-2xl border ${
                        isDark ? 'bg-[#1B1208] border-[#4A2C16]' : 'bg-[#FAF7F0] border-[#E4D4BC]'
                      }`}
                    >
                      <div className="relative w-20 h-20 rounded-xl overflow-hidden shrink-0 border border-black/10 dark:border-white/10 bg-black/10">
                        <img
                          src={newPkgImage}
                          alt="Package Preview"
                          className="w-full h-full object-cover"
                        />
                        {isUploadingPkgImage && (
                          <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                            <RefreshCw className="w-5 h-5 text-amber-500 animate-spin" />
                          </div>
                        )}
                      </div>

                      <div className="flex-1 min-w-0 pr-1">
                        <div className="flex items-center gap-1.5">
                          <span className="text-xs font-bold text-amber-500">
                            {isUploadingPkgImage ? 'Uploading image...' : '✓ Package Photo Attached'}
                          </span>
                        </div>
                        <p className="text-[10px] opacity-60 truncate mt-0.5">
                          {newPkgImage.startsWith('data:') ? 'Local preview ready' : newPkgImage}
                        </p>
                        <div className="mt-2 flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => pkgImageInputRef.current?.click()}
                            className="text-[11px] font-semibold text-amber-500 hover:underline cursor-pointer"
                          >
                            Choose Another
                          </button>
                          <span className="opacity-30">•</span>
                          <button
                            type="button"
                            onClick={() => setNewPkgImage('')}
                            className="text-[11px] font-semibold text-red-400 hover:underline inline-flex items-center gap-0.5 cursor-pointer"
                          >
                            <Trash2 className="w-3 h-3" />
                            <span>Remove</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div
                      onDragOver={handlePackageDragOver}
                      onDragLeave={handlePackageDragLeave}
                      onDrop={handlePackageDrop}
                      onClick={() => pkgImageInputRef.current?.click()}
                      className={`relative cursor-pointer rounded-2xl border-2 border-dashed p-5 text-center transition-all group select-none ${
                        isDraggingPkgImage
                          ? 'border-amber-500 bg-amber-500/20 scale-[1.01]'
                          : isDark
                          ? 'border-[#4A2C16] hover:border-amber-500/70 bg-[#1B1208]/60 hover:bg-[#1B1208]'
                          : 'border-[#E4D4BC] hover:border-amber-500/70 bg-[#FAF7F0]/80 hover:bg-[#FAF7F0]'
                      }`}
                    >
                      <div className="flex flex-col items-center justify-center gap-1.5">
                        <div className="p-2.5 rounded-full bg-amber-500/15 text-amber-500">
                          <UploadCloud className="w-5 h-5" />
                        </div>
                        <p className="text-xs font-bold">
                          Drag and drop package photo here, or <span className="text-amber-500 underline">browse</span>
                        </p>
                        <span className="text-[10px] opacity-50">JPG, PNG, WEBP up to 10MB</span>
                      </div>
                    </div>
                  )
                ) : (
                  <div>
                    <input
                      type="url"
                      placeholder="https://images.unsplash.com/..."
                      value={newPkgImage}
                      onChange={(e) => setNewPkgImage(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl text-xs border bg-transparent"
                    />
                    {newPkgImage && (
                      <div className="mt-2 flex items-center gap-2">
                        <img
                          src={newPkgImage}
                          alt="URL Preview"
                          className="w-12 h-12 rounded-lg object-cover border"
                          onError={(e) => {
                            (e.target as HTMLElement).style.display = 'none';
                          }}
                        />
                        <span className="text-[10px] opacity-60">URL preview ready</span>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Included Items Selector */}
              <div className="space-y-2 pt-2 border-t border-black/10 dark:border-white/10">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-bold uppercase tracking-wider opacity-90">
                    Included Items in Package ({newPkgSelectedItems.length} selected) *
                  </label>
                  <span className="text-[11px] text-amber-500 font-semibold">
                    Click items below to include
                  </span>
                </div>

                {/* Available Catalog Items */}
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-44 overflow-y-auto p-1">
                  {catalogItems.map((item) => {
                    const isSelected = newPkgSelectedItems.some(i => i.id === item.id);
                    return (
                      <button
                        type="button"
                        key={item.id}
                        onClick={() => handleToggleCatalogItem(item)}
                        className={`p-2 rounded-xl border text-left flex items-center gap-2 transition-all cursor-pointer ${
                          isSelected
                            ? 'bg-amber-500/20 border-amber-500 text-amber-500 shadow-sm'
                            : 'bg-black/5 dark:bg-white/5 border-transparent opacity-70 hover:opacity-100'
                        }`}
                      >
                        <div className="w-4 h-4 rounded border flex items-center justify-center shrink-0 border-current">
                          {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                        </div>
                        <div className="min-w-0">
                          <div className="text-[11px] font-bold truncate">{item.name}</div>
                          <div className="text-[9px] opacity-70">{formatPrice(item.price)}</div>
                        </div>
                      </button>
                    );
                  })}
                </div>

                {/* Quick Add Custom Item */}
                <div className="pt-2 flex flex-col sm:flex-row gap-2 items-end">
                  <div className="flex-1 w-full">
                    <input
                      type="text"
                      placeholder="Add custom item (e.g. 5kg Extra Berbere Spices)"
                      value={customItemName}
                      onChange={(e) => setCustomItemName(e.target.value)}
                      className="w-full px-3 py-1.5 rounded-xl text-xs border bg-transparent"
                    />
                  </div>
                  <div className="w-full sm:w-36">
                    <select
                      value={customItemCategory}
                      onChange={(e) => setCustomItemCategory(e.target.value as any)}
                      className="w-full px-2 py-1.5 rounded-xl text-xs border bg-transparent"
                    >
                      <option value="meat_livestock" className="text-black">Meat / Livestock</option>
                      <option value="wine" className="text-black">Wine & Tej</option>
                      <option value="eggs" className="text-black">Farm Eggs</option>
                      <option value="flowers" className="text-black">Celebration Flowers</option>
                    </select>
                  </div>
                  <button
                    type="button"
                    onClick={handleAddCustomItem}
                    className="w-full sm:w-auto px-3 py-1.5 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-500 text-xs font-bold transition-colors whitespace-nowrap cursor-pointer"
                  >
                    + Add Item
                  </button>
                </div>
              </div>

              {/* Submit & Save */}
              <button
                type="submit"
                className="w-full py-3.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-black font-extrabold text-xs shadow-lg hover:shadow-xl hover:scale-[1.01] active:scale-[0.99] transition-all cursor-pointer"
              >
                Publish Celebration Package to Database
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
