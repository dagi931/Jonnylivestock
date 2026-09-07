import React, { useState, useMemo, useEffect, useRef } from 'react';
import { useAdminAuth } from '../context/AdminAuthContext';
import { useUserAuth } from '../context/UserAuthContext';
import { mockAnimals as fallbackAnimals } from '../data/animals';
import { Animal, AnimalType, AnimalStatus, ContactMessage } from '../types/animal';
import { StatusBadge } from '../components/common/StatusBadge';
import { formatPrice, formatWeight, getPhoneCallLink, getWhatsAppLink } from '../utils/formatters';
import { useTheme } from '../context/ThemeContext';
import { api, Order, AdminNotification } from '../services/api';
import { SlipPreviewModal } from '../components/modals/SlipPreviewModal';
import { useRealtimeEvent } from '../context/RealtimeContext';
import { ThemeToggle } from '../components/common/ThemeToggle';
import { LanguageToggle } from '../components/common/LanguageToggle';
import { useLanguage } from '../context/LanguageContext';
import { ADDIS_ABABA_LOCATIONS } from '../data/addisLocations';
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
  Gift,
  MessageSquare,
  AlertTriangle,
  ChevronDown,
  ChevronUp,
  Edit3,
  RotateCcw,
  Scale,
  Truck,
  Navigation,
  Car,
  MapPin,
  Sparkles,
  Settings,
  Filter,
  Menu,
  Package,
  UtensilsCrossed,
  Info
} from 'lucide-react';
import { useSearchParams, Link } from 'react-router-dom';
import { PreMadePackage, PackageCatalogItem } from '../types/package';

type AdminTab = 'overview' | 'orders' | 'inventory' | 'packages' | 'raw_meat' | 'delivery' | 'demand' | 'messages' | 'settings';

const getAnimalFirstImage = (animal: Animal | null | undefined): string => {
  if (!animal) return '';
  const a = animal as any;
  if (typeof a.image === 'string' && a.image.trim()) {
    return a.image.trim().split(/\s+/)[0];
  }
  if (Array.isArray(a.images) && a.images.length > 0) {
    const first = a.images[0];
    if (typeof first === 'string' && first.trim()) {
      return first.trim().split(/\s+/)[0];
    }
  } else if (typeof a.images === 'string' && a.images.trim()) {
    return a.images.trim().split(/\s+/)[0];
  }
  return '';
};

export const Admin: React.FC = () => {
  const { isAuthenticated: isAdminAuth, user: adminUser, token: adminToken, login } = useAdminAuth();
  const { isAuthenticated: isUserAuth, user: currentUser } = useUserAuth();
  const { theme } = useTheme();
  const isDark = theme === 'design7';
  const { isAmharic } = useLanguage();

  // Flag to prevent admin login page flicker when signing out
  const [isLoggingOut, setIsLoggingOut] = useState(() => {
    return typeof window !== 'undefined' && sessionStorage.getItem('jonny_admin_logging_out') === '1';
  });

  const handleAdminLogout = () => {
    setIsLoggingOut(true);
    setIsMobileSidebarOpen(false);
    sessionStorage.setItem('jonny_admin_logging_out', '1');
    localStorage.removeItem('jonny_admin_token');
    localStorage.removeItem('jonny_admin_refresh_token');
    localStorage.removeItem('jonny_admin_token_issued_at');
    localStorage.removeItem('jonny_admin_last_active');
    localStorage.removeItem('jonny_admin_user');
    localStorage.removeItem('jonny_user_token');
    localStorage.removeItem('jonny_user_refresh_token');
    localStorage.removeItem('jonny_user_token_issued_at');
    localStorage.removeItem('jonny_user_profile');
    window.location.replace('/');
  };

  // Strictly admin portal authentication state
  const isAuthenticated = isAdminAuth;
  const user = adminUser;

  // Intercept browser back button so admin stays securely inside the admin portal
  useEffect(() => {
    if (!isAuthenticated) return;

    sessionStorage.removeItem('jonny_admin_signing_in');
    sessionStorage.removeItem('jonny_admin_logging_out');
    setIsLoggingOut(false);

    window.history.pushState(null, '', window.location.href);

    const handlePopState = () => {
      window.history.pushState(null, '', window.location.href);
    };

    window.addEventListener('popstate', handlePopState);
    return () => {
      window.removeEventListener('popstate', handlePopState);
    };
  }, [isAuthenticated]);

  // Login Form States
  const [emailInput, setEmailInput] = useState('');
  const [passwordInput, setPasswordInput] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loginError, setLoginError] = useState('');
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  const [searchParams] = useSearchParams();

  // Dashboard Active Tab
  const [activeTab, setActiveTab] = useState<AdminTab>('overview');
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

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
  const [isLoadingData, setIsLoadingData] = useState(true);

  // Slip Inspector State
  const [selectedSlipOrder, setSelectedSlipOrder] = useState<Order | null>(null);

  // Action status message
  const [actionAlert, setActionAlert] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Filtering & Search
  const [orderStatusFilter, setOrderStatusFilter] = useState<string>('all');
  const [expandedOrderIds, setExpandedOrderIds] = useState<Record<string, boolean>>({});

  const toggleOrderExpanded = (orderId: string) => {
    setExpandedOrderIds(prev => ({
      ...prev,
      [orderId]: !prev[orderId]
    }));
  };
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

  // Edit Animal Modal State
  const [editingAnimal, setEditingAnimal] = useState<Animal | null>(null);
  const [editAnimalType, setEditAnimalType] = useState<AnimalType>('sheep');
  const [editAnimalBreed, setEditAnimalBreed] = useState('');
  const [editAnimalGender, setEditAnimalGender] = useState<'Male' | 'Female'>('Male');
  const [editAnimalWeight, setEditAnimalWeight] = useState<number>(30);
  const [editAnimalPrice, setEditAnimalPrice] = useState<number>(15000);
  const [editAnimalQuantity, setEditAnimalQuantity] = useState<number>(1);
  const [editAnimalColor, setEditAnimalColor] = useState('Natural');
  const [editAnimalLocation, setEditAnimalLocation] = useState('Aware, Addis Ababa');
  const [editAnimalDesc, setEditAnimalDesc] = useState('');
  const [editAnimalStatus, setEditAnimalStatus] = useState<AnimalStatus>('available');
  const [editAnimalFeatured, setEditAnimalFeatured] = useState(false);
  const [editAnimalImage, setEditAnimalImage] = useState('');
  const [isUpdatingAnimal, setIsUpdatingAnimal] = useState(false);
  const [isUploadingEditImage, setIsUploadingEditImage] = useState(false);
  const editAnimalImageInputRef = useRef<HTMLInputElement>(null);

  // Celebration Packages State
  const [packagesList, setPackagesList] = useState<PreMadePackage[]>([]);
  const [catalogItems, setCatalogItems] = useState<PackageCatalogItem[]>([]);
  const [isAddPackageOpen, setIsAddPackageOpen] = useState(false);
  const [newPkgName, setNewPkgName] = useState('');
  const [newPkgAmharicName, setNewPkgAmharicName] = useState('');
  const [newPkgTagline, setNewPkgTagline] = useState('');
  const [newPkgBadge, setNewPkgBadge] = useState('Most Popular');
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
  const [newPkgTotalSlots, setNewPkgTotalSlots] = useState<number>(10);
  const [newPkgAvailableSlots, setNewPkgAvailableSlots] = useState<number>(10);
  const [expandedPkgIds, setExpandedPkgIds] = useState<Record<string, boolean>>({});

  // Contact Messages State
  const [contactMessages, setContactMessages] = useState<ContactMessage[]>([]);
  const [unreadMessagesCount, setUnreadMessagesCount] = useState<number>(0);
  const [messageFilter, setMessageFilter] = useState<'all' | 'unread' | 'read'>('all');
  const [messageSearch, setMessageSearch] = useState('');

  // Package Slot Restock Modal
  const [restockModalPackage, setRestockModalPackage] = useState<PreMadePackage | null>(null);
  const [restockSlotsInput, setRestockSlotsInput] = useState<number>(10);
  const [restockTotalInput, setRestockTotalInput] = useState<number>(10);
  const [isRestocking, setIsRestocking] = useState(false);

  // Raw Meat Pricing State
  const [rawMeatPricing, setRawMeatPricing] = useState<{
    kurtPrice: number;
    kitfoPrice: number;
    tibsWotPrice: number;
    available: boolean;
    notes?: string;
  }>({
    kurtPrice: 2500,
    kitfoPrice: 2200,
    tibsWotPrice: 1800,
    available: true,
    notes: 'Premium Addis Ababa grass-fed fattened ox beef cuts prepared to culinary order.'
  });
  const [isSavingMeatPricing, setIsSavingMeatPricing] = useState(false);
  const [testMeatCut, setTestMeatCut] = useState<'kurt' | 'kitfo' | 'tibs_wot'>('kurt');
  const [testMeatKg, setTestMeatKg] = useState<number>(5);
  const [testIncludeDelivery, setTestIncludeDelivery] = useState<boolean>(false);

  // Slaughter & Optional Services Pricing State (Base 600, Travel extra 200)
  const [slaughterPricing, setSlaughterPricing] = useState<{
    slaughterFee: number;
    travelFee: number;
  }>({
    slaughterFee: 600,
    travelFee: 200
  });
  const [isSavingSlaughterPricing, setIsSavingSlaughterPricing] = useState(false);

  // Delivery Fleet & Logistics Settings State
  const [deliveryVehicles, setDeliveryVehicles] = useState<any[]>([
    {
      id: 'car',
      name: 'Standard Car / Sedan',
      amharicName: 'መደበኛ መኪና (Car)',
      icon: 'car',
      baseFee: 100,
      pricePerKm: 22,
      maxWeightKg: 60,
      maxSheep: 2,
      maxCattle: 0,
      maxChickens: 20,
      description: 'Small orders, 1-2 sheep/goats, chickens, eggs, or meat up to 60 KG',
      active: true
    },
    {
      id: 'pickup',
      name: 'Medium Pickup Truck',
      amharicName: 'ፒካፕ መኪና (Pickup)',
      icon: 'truck',
      baseFee: 150,
      pricePerKm: 26,
      maxWeightKg: 600,
      maxSheep: 10,
      maxCattle: 0,
      maxChickens: 100,
      description: 'Up to 10 sheep/goats, mixed packages, and bulk meat up to 600 KG',
      active: true
    },
    {
      id: 'large_pickup',
      name: 'Large Pickup / Van',
      amharicName: 'ትልቅ ፒካፕ / ቫን (Large Pickup)',
      icon: 'van',
      baseFee: 200,
      pricePerKm: 36,
      maxWeightKg: 2000,
      maxSheep: 35,
      maxCattle: 2,
      maxChickens: 500,
      description: 'Heavy duty vehicle for live cattle (1-2 oxen), up to 35 sheep, or bulk cargo up to 2,000 KG',
      active: true
    }
  ]);

  const [deliverySettings, setDeliverySettings] = useState<any>({
    defaultOriginLat: 9.0314,
    defaultOriginLng: 38.7725,
    defaultOriginName: 'Jonny Livestock Main Facility (Arat Kilo / Belay Zeleke)',
    pickupLatitude: 9.0314,
    pickupLongitude: 38.7725,
    pickupAddress: 'Arat Kilo / Belay Zeleke Street, Addis Ababa',
    maxDistanceKm: 30,
    windingFactor: 1.28
  });
  const [isSavingDeliveryVehicles, setIsSavingDeliveryVehicles] = useState(false);
  const [isSavingDeliverySettings, setIsSavingDeliverySettings] = useState(false);

  // Delivery Simulator State
  const [simSelectedLocId, setSimSelectedLocId] = useState<string>('kazanchis');
  const [simDestLat, setSimDestLat] = useState<number>(9.0175);
  const [simDestLng, setSimDestLng] = useState<number>(38.7690);
  const [simDestAddress, setSimDestAddress] = useState<string>('Kazanchis / UNECA Area');
  const [simSheep, setSimSheep] = useState<number>(2);
  const [simCattle, setSimCattle] = useState<number>(0);
  const [simChickens, setSimChickens] = useState<number>(0);
  const [simMeatKg, setSimMeatKg] = useState<number>(5);
  const [simResult, setSimResult] = useState<any>(null);
  const [isSimulatingRoute, setIsSimulatingRoute] = useState(false);
  const [deliveryOrderFilter, setDeliveryOrderFilter] = useState<'all' | 'pending' | 'in_transit' | 'delivered'>('all');
  const [deliverySubTab, setDeliverySubTab] = useState<'orders' | 'logistics'>('orders');

  const handleSaveDeliveryVehicles = async () => {
    setIsSavingDeliveryVehicles(true);
    try {
      const activeToken = adminToken || localStorage.getItem('jonny_admin_token') || localStorage.getItem('jonny_user_token') || undefined;
      const res = await api.updateDeliveryConfig({ vehicles: deliveryVehicles }, activeToken);
      if (res.success) {
        showAlert('success', 'Delivery vehicle fleet rates and capacity settings saved successfully!');
        if (res.vehicles) setDeliveryVehicles(res.vehicles);
      } else {
        showAlert('error', res.error || 'Failed to save delivery vehicles');
      }
    } catch (err: any) {
      showAlert('error', err.message || 'Error saving delivery vehicles');
    } finally {
      setIsSavingDeliveryVehicles(false);
    }
  };

  const handleSaveDeliverySettings = async () => {
    setIsSavingDeliverySettings(true);
    try {
      const activeToken = adminToken || localStorage.getItem('jonny_admin_token') || localStorage.getItem('jonny_user_token') || undefined;
      const res = await api.updateDeliveryConfig({ settings: deliverySettings }, activeToken);
      if (res.success) {
        showAlert('success', 'Farm facility location & max delivery radius saved successfully!');
        if (res.settings) setDeliverySettings(res.settings);
      } else {
        showAlert('error', res.error || 'Failed to save delivery settings');
      }
    } catch (err: any) {
      showAlert('error', err.message || 'Error saving delivery settings');
    } finally {
      setIsSavingDeliverySettings(false);
    }
  };

  const handleRunSimulator = async () => {
    setIsSimulatingRoute(true);
    setSimResult(null);
    try {
      const loadItems: Array<{ type: string; quantity: number; weightKg?: number }> = [];
      if (simSheep > 0) loadItems.push({ type: 'sheep', quantity: simSheep });
      if (simCattle > 0) loadItems.push({ type: 'cow', quantity: simCattle });
      if (simChickens > 0) loadItems.push({ type: 'chicken', quantity: simChickens });
      if (simMeatKg > 0) loadItems.push({ type: 'kg', quantity: 1, weightKg: simMeatKg });
      if (loadItems.length === 0) loadItems.push({ type: 'general', quantity: 1 });

      const quote = await api.getDeliveryQuote({
        deliveryAddress: simDestAddress,
        deliveryLat: simDestLat,
        deliveryLng: simDestLng,
        items: loadItems
      });

      setSimResult(quote);
    } catch (err: any) {
      showAlert('error', err.message || 'Error running delivery simulation');
    } finally {
      setIsSimulatingRoute(false);
    }
  };

  const handleApproveDelivery = async (orderId: string, status: 'delivery_pending' | 'delivered' = 'delivery_pending') => {
    try {
      const activeToken = adminToken || localStorage.getItem('jonny_admin_token') || localStorage.getItem('jonny_user_token') || undefined;
      const res = await api.approveDelivery(orderId, status, 'Approved via Delivery module', activeToken);
      if (res.success) {
        showAlert('success', status === 'delivered' ? `✓ Order ${orderId} marked as DELIVERED!` : `✓ Order ${orderId} delivery approved & dispatched!`);
        loadDashboardData();
      } else {
        showAlert('error', res.error || 'Failed to update delivery status');
      }
    } catch (err: any) {
      showAlert('error', err.message || 'Error updating delivery status');
    }
  };

  const handleUpdatePickupStatus = async (orderId: string, status: 'pickup_ready' | 'completed' = 'pickup_ready') => {
    try {
      const activeToken = adminToken || localStorage.getItem('jonny_admin_token') || localStorage.getItem('jonny_user_token') || undefined;
      const res = await api.updatePickupStatus(orderId, status, status === 'completed' ? 'Customer picked up livestock from farm' : 'Livestock prepared for farm pickup', activeToken);
      if (res.success) {
        showAlert('success', status === 'completed' ? `✓ Order ${orderId} marked as PICKED UP & COMPLETED!` : `✓ Order ${orderId} is now READY FOR FARM PICKUP!`);
        loadDashboardData();
      } else {
        showAlert('error', res.error || 'Failed to update pickup status');
      }
    } catch (err: any) {
      showAlert('error', err.message || 'Error updating pickup status');
    }
  };

  const handleSaveMeatPricing = async () => {
    setIsSavingMeatPricing(true);
    try {
      const activeToken = adminToken || localStorage.getItem('jonny_admin_token') || localStorage.getItem('jonny_user_token') || undefined;
      const res = await api.updateMeatPricing(rawMeatPricing, activeToken);
      if (res.success) {
        showAlert('success', 'Raw meat pricing updated successfully! Live rates are now active.');
      } else {
        showAlert('error', res.error || 'Failed to update meat pricing');
      }
    } catch (err: any) {
      showAlert('error', err.message || 'Error updating meat pricing');
    } finally {
      setIsSavingMeatPricing(false);
    }
  };

  const handleSaveSlaughterPricing = async () => {
    setIsSavingSlaughterPricing(true);
    try {
      const activeToken = adminToken || localStorage.getItem('jonny_admin_token') || localStorage.getItem('jonny_user_token') || undefined;
      const res = await api.updateSlaughterPricing(slaughterPricing, activeToken);
      if (res.success) {
        showAlert('success', 'Slaughter & optional services rates updated successfully! Live rates are now active.');
      } else {
        showAlert('error', res.error || 'Failed to update slaughter pricing');
      }
    } catch (err: any) {
      showAlert('error', err.message || 'Error updating slaughter pricing');
    } finally {
      setIsSavingSlaughterPricing(false);
    }
  };

  // Load Data from Backend
  const loadDashboardData = async (isSilent: boolean | React.SyntheticEvent = false) => {
    const silent = isSilent === true;
    if (!silent) {
      setIsLoadingData(true);
    }
    try {
      const activeToken = adminToken || localStorage.getItem('jonny_admin_token') || localStorage.getItem('jonny_user_token') || undefined;
      const [fetchedAnimals, fetchedOrders, notifRes, pkgRes, fetchedMsgs, meatPricingRes, deliveryConfigRes, slaughterPricingRes] = await Promise.all([
        api.getAnimals(),
        api.getAllOrders(activeToken),
        api.getNotifications(activeToken),
        api.getPackagesData(),
        api.getContactMessages(),
        api.getMeatPricing(),
        api.getDeliveryConfig(),
        api.getSlaughterPricing()
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
      if (fetchedMsgs) {
        setContactMessages(fetchedMsgs);
        setUnreadMessagesCount(fetchedMsgs.filter(m => !m.read).length);
      }
      if (meatPricingRes) {
        setRawMeatPricing({
          kurtPrice: meatPricingRes.kurtPrice ?? 2500,
          kitfoPrice: meatPricingRes.kitfoPrice ?? 2200,
          tibsWotPrice: meatPricingRes.tibsWotPrice ?? 1800,
          available: meatPricingRes.available ?? true,
          notes: (meatPricingRes as any).notes ?? ''
        });
      }
      if (slaughterPricingRes) {
        setSlaughterPricing({
          slaughterFee: slaughterPricingRes.slaughterFee ?? 600,
          travelFee: slaughterPricingRes.travelFee ?? 200
        });
      }
      if (deliveryConfigRes && deliveryConfigRes.success) {
        if (deliveryConfigRes.vehicles && deliveryConfigRes.vehicles.length > 0) {
          setDeliveryVehicles(deliveryConfigRes.vehicles);
        }
        if (deliveryConfigRes.settings) {
          setDeliverySettings(deliveryConfigRes.settings);
        }
      }
    } catch (err) {
      console.error('Failed to load backend data:', err);
    } finally {
      if (!isSilent) {
        setIsLoadingData(false);
      }
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      loadDashboardData();
      const interval = setInterval(() => {
        if (!document.hidden) {
          loadDashboardData(true);
        }
      }, 30000); // 30s background sync (silent to prevent UI flicker)
      return () => clearInterval(interval);
    }
  }, [isAuthenticated]);

  // Click Outside Handler: Close notification dropdown when clicking anywhere outside of its boundary
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

  // Realtime Listener: New Payment Slip Uploaded by Customer
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

    showAlert('success', `New Payment Slip uploaded by ${data.order.customerName} for ${data.order.packageName || data.order.animalBreed} (${data.order.totalAmount.toLocaleString()} ETB)!`);
  });

  // Realtime Listener: New 50% Reservation Deposit Slip
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

    showAlert('success', `New 50% Reservation Deposit submitted by ${data.order.customerName} for ${data.order.packageName || data.order.animalBreed} (${(data.order.depositAmount || data.order.totalAmount * 0.5).toLocaleString()} ETB)!`);
  });

  // Realtime Listener: Final 50% Payment Slip Submitted
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

    showAlert('success', `Final 50% Balance Slip submitted by ${data.order.customerName} for ${data.order.packageName || data.order.animalBreed}!`);
  });

  // Realtime Listener: Reservation Approved
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

  // Realtime Listener: Final Payment Approved (Completed / Sold)
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

  // Realtime Listener: Order Verified & Payment Approved
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

  // Realtime Listener: Order Rejected
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

  // Realtime Listener: Order Updated (e.g. Receipt Cleared or Status Changed)
  useRealtimeEvent<Order>('ORDER_UPDATED', (updated) => {
    if (!updated) return;
    setOrdersList(prev => {
      const idx = prev.findIndex(o => o.id === updated.id);
      if (idx === -1) return prev;
      const copy = [...prev];
      copy[idx] = { ...copy[idx], ...updated };
      return copy;
    });
  });

  // Realtime Listener: Live Animal Inventory Changes
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

  // Unified Navigation Modules (Used for both Desktop Sidebar & Mobile Side Drawer)
  const navItems = useMemo(() => [
    {
      id: 'overview' as AdminTab,
      label: isAmharic ? 'አጠቃላይ ዳሽቦርድ' : 'Overview & Stats',
      shortLabel: isAmharic ? 'ዳሽቦርድ' : 'Overview',
      icon: LayoutDashboard,
      badge: null,
      badgeIsAlert: false
    },
    {
      id: 'orders' as AdminTab,
      label: isAmharic ? 'ትዕዛዞች እና ደረሰኞች' : 'Orders & Payment Slips',
      shortLabel: isAmharic ? 'ትዕዛዞች' : 'Orders',
      icon: CreditCard,
      badge: stats.pendingOrdersCount > 0 ? `${stats.pendingOrdersCount} ${isAmharic ? 'አዲስ' : 'new'}` : String(ordersList.length),
      badgeIsAlert: stats.pendingOrdersCount > 0
    },
    {
      id: 'inventory' as AdminTab,
      label: isAmharic ? 'የከብቶች ዝርዝር' : 'Livestock Inventory',
      shortLabel: isAmharic ? 'ከብቶች' : 'Livestock',
      icon: Layers,
      badge: String(animalsList.length),
      badgeIsAlert: false
    },
    {
      id: 'packages' as AdminTab,
      label: isAmharic ? 'የበዓል ጥቅሎች' : 'Celebration Packages',
      shortLabel: isAmharic ? 'ጥቅሎች' : 'Packages',
      icon: Gift,
      badge: String(packagesList.length),
      badgeIsAlert: false
    },
    {
      id: 'raw_meat' as AdminTab,
      label: isAmharic ? 'በኪሎ ጥሬ ስጋ' : 'Raw Meat (በኪሎ ስጋ)',
      shortLabel: isAmharic ? 'ስጋ' : 'Raw Meat',
      icon: Scale,
      badge: String(ordersList.filter(o => (o.packageDetails as any)?.isMeatByKg).length),
      badgeIsAlert: false
    },
    {
      id: 'delivery' as AdminTab,
      label: isAmharic ? 'ማድረሻ እና መኪኖች' : 'Delivery & Fleet',
      shortLabel: isAmharic ? 'ማድረሻ' : 'Delivery',
      icon: Truck,
      badge: ordersList.filter(o => o.isDelivery && (o.status === 'pending_verification' || o.status === 'delivery_pending')).length > 0
        ? `${ordersList.filter(o => o.isDelivery && (o.status === 'pending_verification' || o.status === 'delivery_pending')).length} ${isAmharic ? 'አዲስ' : 'new'}`
        : String(ordersList.filter(o => o.isDelivery).length),
      badgeIsAlert: ordersList.filter(o => o.isDelivery && (o.status === 'pending_verification' || o.status === 'delivery_pending')).length > 0
    },
    {
      id: 'demand' as AdminTab,
      label: isAmharic ? 'ትንታኔ እና ገበያ' : 'Demand & Metrics',
      shortLabel: isAmharic ? 'ትንታኔ' : 'Metrics',
      icon: BarChart3,
      badge: null,
      badgeIsAlert: false
    },
    {
      id: 'messages' as AdminTab,
      label: isAmharic ? 'የደንበኞች መልዕክቶች' : 'Customer Inquiries',
      shortLabel: isAmharic ? 'መልዕክቶች' : 'Inquiries',
      icon: MessageSquare,
      badge: unreadMessagesCount > 0 ? `${unreadMessagesCount} ${isAmharic ? 'አዲስ' : 'new'}` : String(contactMessages.length),
      badgeIsAlert: unreadMessagesCount > 0
    }
  ], [isAmharic, stats.pendingOrdersCount, ordersList, animalsList.length, packagesList.length, unreadMessagesCount, contactMessages.length]);

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

  // Handle Clear Payment Receipt Slip
  const handleClearReceipt = async (orderId: string, receiptType: 'initial' | 'final' | 'all' = 'all') => {
    const confirmMsg = isAmharic
      ? 'እርግጠኛ ነዎት ይህን የክፍያ ደረሰኝ መሰረዝ ይፈልጋሉ? ደረሰኙ ከሲስተም ይሰረዛል።'
      : 'Are you sure you want to clear this payment receipt slip? The slip will be removed from the system.';
    if (!window.confirm(confirmMsg)) return;

    const activeToken = adminToken || localStorage.getItem('jonny_admin_token') || localStorage.getItem('jonny_user_token') || undefined;
    const res = await api.clearOrderReceipt(orderId, receiptType, activeToken);
    if (res.success) {
      showAlert('success', isAmharic ? 'የክፍያ ደረሰኝ በተሳካ ሁኔታ ተሰርዟል' : 'Payment receipt slip cleared successfully');
      setOrdersList(prev => prev.map(o => {
        if (o.id !== orderId) return o;
        if (receiptType === 'initial') return { ...o, paymentSlipUrl: undefined };
        if (receiptType === 'final') return { ...o, finalPaymentSlipUrl: undefined };
        return { ...o, paymentSlipUrl: undefined, finalPaymentSlipUrl: undefined };
      }));
      if (selectedSlipOrder && selectedSlipOrder.id === orderId) {
        setSelectedSlipOrder(null);
      }
    } else {
      showAlert('error', res.error || (isAmharic ? 'ደረሰኙን መሰረዝ አልተቻለም' : 'Failed to clear payment receipt'));
    }
  };

  // Handle Clear All Receipts (e.g. for rejected orders)
  const handleClearAllReceipts = async (statusFilter?: string) => {
    const confirmMsg = isAmharic
      ? statusFilter === 'rejected'
        ? 'ውድቅ ለተደረጉ ትዕዛዞች በሙሉ ደረሰኞችን መሰረዝ ይፈልጋሉ?'
        : 'ሁሉንም የክፍያ ደረሰኞች መሰረዝ ይፈልጋሉ?'
      : statusFilter === 'rejected'
        ? 'Are you sure you want to clear all payment receipt slips for rejected orders?'
        : 'Are you sure you want to clear all payment receipts?';
    if (!window.confirm(confirmMsg)) return;

    const activeToken = adminToken || localStorage.getItem('jonny_admin_token') || localStorage.getItem('jonny_user_token') || undefined;
    const res = await api.clearAllReceipts(statusFilter, activeToken);
    if (res.success) {
      showAlert('success', isAmharic ? `${res.count || 0} ደረሰኞች በተሳካ ሁኔታ ተሰርዘዋል` : `${res.count || 0} receipts cleared successfully`);
      loadDashboardData(true);
    } else {
      showAlert('error', res.error || 'Failed to clear receipts');
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

    // 2. Direct to appropriate tab
    if (notif.type === 'OUT_OF_STOCK') {
      setIsNotifDropdownOpen(false);
      if (notif.message.toLowerCase().includes('package')) {
        setActiveTab('packages');
      } else {
        setActiveTab('inventory');
      }
      return;
    }

    if (notif.type === 'CONTACT_MESSAGE') {
      setIsNotifDropdownOpen(false);
      setActiveTab('messages');
      return;
    }

    // 3. Direct to order details and open Slip Approval Modal
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

  // ==================== CONTACT MESSAGES HANDLERS ====================
  const handleMarkMessageRead = async (id: string) => {
    const success = await api.markContactMessageRead(id);
    if (success) {
      setContactMessages(prev => prev.map(m => m.id === id ? { ...m, read: true } : m));
      setUnreadMessagesCount(prev => Math.max(0, prev - 1));
      showAlert('success', '✓ Inquiry marked as read');
    }
  };

  const handleDeleteMessage = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this customer inquiry?')) return;
    const success = await api.deleteContactMessage(id);
    if (success) {
      setContactMessages(prev => prev.filter(m => m.id !== id));
      setUnreadMessagesCount(prev => {
        const wasUnread = contactMessages.find(m => m.id === id)?.read === false;
        return wasUnread ? Math.max(0, prev - 1) : prev;
      });
      showAlert('success', 'Customer inquiry removed.');
    }
  };

  // ==================== RESTOCK PACKAGE SLOTS HANDLERS ====================
  const handleOpenRestockModal = (pkg: PreMadePackage) => {
    setRestockModalPackage(pkg);
    const avail = pkg.availableSlots !== undefined ? pkg.availableSlots : 10;
    const total = pkg.totalSlots !== undefined ? pkg.totalSlots : 10;
    setRestockSlotsInput(avail);
    setRestockTotalInput(total);
  };

  const handleSaveRestockSlots = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!restockModalPackage) return;
    setIsRestocking(true);
    try {
      const res = await api.updatePackageSlots(
        restockModalPackage.id,
        Number(restockSlotsInput),
        Number(restockTotalInput)
      );
      if (res.success) {
        setPackagesList(prev => prev.map(p => {
          if (p.id === restockModalPackage.id) {
            const avail = Number(restockSlotsInput);
            const tot = Number(restockTotalInput);
            return {
              ...p,
              availableSlots: avail,
              totalSlots: tot,
              isOutOfStock: avail <= 0
            };
          }
          return p;
        }));
        showAlert('success', `✓ Slots updated for "${restockModalPackage.name}" (${restockSlotsInput} available)`);
        setRestockModalPackage(null);
      } else {
        showAlert('error', res.error || 'Failed to update package slots');
      }
    } catch (err: any) {
      showAlert('error', err.message || 'Error updating package slots');
    } finally {
      setIsRestocking(false);
    }
  };

  // Open Edit Animal Modal (prefilling all existing fields)
  const handleOpenEditAnimal = (animal: Animal) => {
    setEditingAnimal(animal);
    setEditAnimalType(animal.type);
    setEditAnimalBreed(animal.breed);
    setEditAnimalGender((animal.gender as 'Male' | 'Female') || 'Male');
    setEditAnimalWeight(animal.weight);
    setEditAnimalPrice(animal.price);
    // If it was sold and quantity is 0, prefill 1 so saving makes it cleanly available
    const currentQty = animal.quantity ?? 1;
    setEditAnimalQuantity(animal.status === 'sold' && currentQty <= 0 ? 1 : currentQty);
    setEditAnimalColor(animal.color || 'Natural');
    setEditAnimalLocation(animal.location || 'Aware, Addis Ababa');
    setEditAnimalDesc(animal.description || '');
    setEditAnimalStatus(animal.status);
    setEditAnimalFeatured(Boolean(animal.featured));
    setEditAnimalImage(getAnimalFirstImage(animal));
  };

  // Submit Edit Animal Details & Status
  const handleEditAnimalSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingAnimal) return;
    if (!editAnimalBreed.trim()) {
      showAlert('error', 'Breed name is required');
      return;
    }

    setIsUpdatingAnimal(true);
    try {
      const activeToken = adminToken || localStorage.getItem('jonny_admin_token') || localStorage.getItem('jonny_user_token') || undefined;
      const finalImage = editAnimalImage.trim();
      const existingImages = Array.isArray(editingAnimal.images)
        ? editingAnimal.images
        : (typeof (editingAnimal as any).images === 'string' && (editingAnimal as any).images.trim()
            ? [(editingAnimal as any).images.trim().split(/\s+/)[0]]
            : []);

      const imagesToSave = finalImage
        ? [finalImage]
        : (existingImages.length > 0 ? existingImages : []);

      const res = await api.updateAnimal(
        editingAnimal.id,
        {
          type: editAnimalType,
          breed: editAnimalBreed.trim(),
          gender: editAnimalGender,
          weight: Number(editAnimalWeight),
          price: Number(editAnimalPrice),
          quantity: Number(editAnimalQuantity),
          color: editAnimalColor.trim() || 'Natural',
          location: editAnimalLocation.trim() || 'Aware, Addis Ababa',
          description: editAnimalDesc.trim() || editingAnimal.description,
          status: editAnimalStatus,
          featured: editAnimalFeatured,
          images: imagesToSave
        },
        activeToken
      );

      if (res.success && res.data) {
        setAnimalsList((prev) =>
          prev.map((a) => (a.id === editingAnimal.id ? res.data! : a))
        );
        showAlert(
          'success',
          `✓ Livestock "${res.data.breed}" (${res.data.id}) updated! Status is now "${res.data.status.toUpperCase()}" (Stock: ${res.data.quantity ?? 1}).`
        );
        setEditingAnimal(null);
      } else {
        showAlert('error', res.error || 'Failed to update animal');
      }
    } catch (err: any) {
      showAlert('error', err.message || 'Error updating animal details');
    } finally {
      setIsUpdatingAnimal(false);
    }
  };

  // One-Click Relist Sold Animal as Available
  const handleRelistAnimal = async (animal: Animal, restockQuantity = 1) => {
    try {
      const activeToken = adminToken || localStorage.getItem('jonny_admin_token') || localStorage.getItem('jonny_user_token') || undefined;
      const res = await api.updateAnimal(
        animal.id,
        {
          status: 'available',
          quantity: Math.max(1, restockQuantity)
        },
        activeToken
      );

      if (res.success && res.data) {
        setAnimalsList((prev) =>
          prev.map((a) => (a.id === animal.id ? res.data! : a))
        );
        showAlert(
          'success',
          `Livestock "${animal.breed}" (${animal.id}) is now RELISTED and AVAILABLE on the marketplace! (Stock: ${Math.max(1, restockQuantity)} head)`
        );
      } else {
        showAlert('error', res.error || 'Failed to relist animal');
      }
    } catch (err: any) {
      showAlert('error', err.message || 'Error relisting animal');
    }
  };

  // Upload Photo for Edit Animal
  const handleEditAnimalImageFile = async (file: File) => {
    if (!file.type.startsWith('image/')) {
      showAlert('error', 'Please select a valid image file');
      return;
    }
    const reader = new FileReader();
    reader.onload = (e) => {
      if (e.target?.result) setEditAnimalImage(e.target.result as string);
    };
    reader.readAsDataURL(file);

    try {
      setIsUploadingEditImage(true);
      const res = await api.uploadAnimalImage(file);
      if (res.success && res.url) {
        setEditAnimalImage(res.url);
      }
    } catch (err) {
      console.error('Failed to upload image:', err);
    } finally {
      setIsUploadingEditImage(false);
    }
  };

  // Handle Toggle Animal Status
  const handleToggleStatus = async (animalId: string, newStatus: AnimalStatus) => {
    const target = animalsList.find((a) => a.id === animalId);
    const qtyUpdate =
      newStatus === 'available' && (!target?.quantity || target.quantity <= 0)
        ? 1
        : undefined;

    const activeToken = adminToken || localStorage.getItem('jonny_admin_token') || localStorage.getItem('jonny_user_token') || undefined;
    const res = await api.updateAnimal(
      animalId,
      {
        status: newStatus,
        ...(qtyUpdate !== undefined && { quantity: qtyUpdate })
      },
      activeToken
    );
    if (res.success && res.data) {
      setAnimalsList((prev) =>
        prev.map((a) => (a.id === animalId ? res.data! : a))
      );
      showAlert(
        'success',
        `Animal ${animalId} status set to ${newStatus}${
          qtyUpdate ? ' (restocked to 1 head)' : ''
        }.`
      );
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
      items: newPkgSelectedItems,
      totalSlots: Number(newPkgTotalSlots) || 10,
      availableSlots: Number(newPkgAvailableSlots) !== undefined ? Number(newPkgAvailableSlots) : 10
    });

    if (res.success && res.data) {
      showAlert('success', `✓ Package "${res.data.name}" created and published!`);
      setIsAddPackageOpen(false);
      setNewPkgName('');
      setNewPkgAmharicName('');
      setNewPkgTagline('');
      setNewPkgBadge('Most Popular');
      setNewPkgDescription('');
      setNewPkgImage('');
      setNewPkgOriginalPrice(18000);
      setNewPkgPackagePrice(16000);
      setNewPkgTotalSlots(10);
      setNewPkgAvailableSlots(10);
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
        setIsLoggingIn(false);
      } else {
        sessionStorage.setItem('jonny_admin_signing_in', '1');
      }
    } catch {
      setLoginError('Authentication failed');
      setIsLoggingIn(false);
    }
  };


  // ==========================================
  // VIEW 0: EXITING / SIGNING OUT (Direct to home, prevent login flash)
  // ==========================================
  const isLoggingOutActive = isLoggingOut || (typeof window !== 'undefined' && sessionStorage.getItem('jonny_admin_logging_out') === '1');
  if (isLoggingOutActive) {
    return <div className={`min-h-screen ${isDark ? 'bg-[#1B1208]' : 'bg-[#FAF7F0]'}`} />;
  }

  // ==========================================
  // VIEW 0B: SIGNING IN TRANSITION (Prevent login form flash)
  // ==========================================
  const isSigningInActive = isLoggingIn || (typeof window !== 'undefined' && sessionStorage.getItem('jonny_admin_signing_in') === '1');
  if (isSigningInActive && !isAuthenticated && !loginError) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${isDark ? 'bg-[#1B1208]' : 'bg-[#FAF7F0]'}`}>
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-[#C58A3A] border-t-transparent rounded-full animate-spin" />
          <p className={`text-sm font-medium ${isDark ? 'text-[#D8C5A8]' : 'text-[#746556]'}`}>
            {isAmharic ? 'ወደ አስተዳዳሪ ፖርታል በመግባት ላይ...' : 'Loading Admin Portal...'}
          </p>
        </div>
      </div>
    );
  }

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
              onClick={handleAdminLogout}
              className="w-full py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-black font-bold text-xs transition-all shadow-md cursor-pointer"
            >
              Sign Out & Return Home
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
        </div>
      </div>
    );
  }

  // ==========================================
  // VIEW 2: AUTHENTICATED ADMIN DASHBOARD
  // ==========================================
  return (
    <div className={`min-h-screen pb-16 transition-colors duration-300 ${isDark ? 'bg-[#1B1208] text-[#F4E8D0]' : 'bg-[#FAF7F0] text-[#241A12]'}`}>
      
      {/* Mobile Slide-Out Side Navigation Drawer (Full-Height Sidebar on Phone screens) */}
      {isMobileSidebarOpen && (
        <div className="fixed inset-0 z-50 lg:hidden animate-in fade-in duration-200">
          {/* Backdrop overlay */}
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-xs"
            onClick={() => setIsMobileSidebarOpen(false)}
            aria-hidden="true"
          />

          {/* Drawer content sliding from the left */}
          <aside
            className={`fixed inset-y-0 left-0 w-72 max-w-[85vw] z-50 flex flex-col justify-between shadow-2xl border-r animate-in slide-in-from-left duration-200 ${
              isDark ? 'bg-[#1E140A] border-[#3D2513] text-[#F4E8D0]' : 'bg-[#FAF6EE] border-[#E8DCCB] text-[#241A12]'
            }`}
          >
            {/* Drawer Header */}
            <div className="p-4 border-b border-black/10 dark:border-white/10 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-[#C18A45]/20 text-[#C18A45] flex items-center justify-center font-bold font-serif text-sm">
                  JL
                </div>
                <div>
                  <h3 className="font-bold text-xs sm:text-sm leading-tight">
                    {isAmharic ? 'የጆኒ አስተዳዳሪ' : 'Jonny Admin'}
                  </h3>
                  <p className="text-[10px] opacity-60 truncate max-w-[140px]">
                    {user?.name || 'Administrator'}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsMobileSidebarOpen(false)}
                className="p-1.5 rounded-xl hover:bg-black/10 dark:hover:bg-white/10 opacity-75 hover:opacity-100 transition-opacity cursor-pointer"
                aria-label="Close Navigation"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Navigation Links */}
            <div className="p-3 flex-1 overflow-y-auto space-y-1">
              <div className="px-2 py-1 mb-1 text-[10px] font-bold uppercase tracking-wider text-[#C18A45] opacity-75">
                {isAmharic ? 'የአስተዳዳሪ ክፍሎች' : 'Admin Modules'}
              </div>
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => {
                      setActiveTab(item.id);
                      setIsMobileSidebarOpen(false);
                    }}
                    className={`w-full flex items-center justify-between gap-3 px-3 py-2.5 rounded-xl text-xs font-bold transition-all text-left cursor-pointer ${
                      isActive
                        ? 'bg-[#C18A45] text-white shadow-sm font-extrabold'
                        : isDark
                        ? 'hover:bg-[#2A1A0D] text-[#D8C5A8]'
                        : 'hover:bg-[#F1E8D8] text-[#746556]'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-white' : 'text-[#C18A45]'}`} />
                      <span className="truncate">{item.label}</span>
                    </div>
                    {item.badge && (
                      <span
                        className={`px-2 py-0.5 rounded-md text-[10px] font-bold shrink-0 ${
                          item.badgeIsAlert
                            ? 'bg-amber-500 text-black animate-pulse font-black'
                            : isActive
                            ? 'bg-black/20 text-white'
                            : 'bg-black/5 dark:bg-white/10 opacity-75 font-mono'
                        }`}
                      >
                        {item.badge}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>

            {/* Drawer Footer */}
            <div className="p-3 border-t border-black/10 dark:border-white/10 space-y-2">
              <div className="flex items-center justify-between gap-2 px-1">
                <LanguageToggle />
                <ThemeToggle />
              </div>
              <button
                type="button"
                onClick={handleAdminLogout}
                className="w-full py-2.5 px-3 rounded-xl bg-red-500/10 text-red-400 border border-red-500/20 hover:bg-red-500/20 transition-colors text-xs font-bold flex items-center justify-center gap-2 cursor-pointer"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>{isAmharic ? 'ውጣ' : 'Sign Out'}</span>
              </button>
            </div>
          </aside>
        </div>
      )}

      {/* Top Banner with Real-Time Notification Bell & Refresh */}
      <div className={`border-b sticky top-0 z-40 backdrop-blur-md ${isDark ? 'bg-[#1B1208]/90 border-[#4A2C16]' : 'bg-[#FAF7F0]/90 border-[#E4D4BC]'}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2.5 sm:gap-3">
            {/* Mobile Side Navigation Toggle (visible on phone screens) */}
            <button
              type="button"
              onClick={() => setIsMobileSidebarOpen(true)}
              className={`lg:hidden p-2 rounded-xl border flex items-center justify-center transition-all cursor-pointer relative ${
                isDark
                  ? 'bg-[#2A1A0D] border-[#4A2C16] text-[#C18A45] hover:bg-[#3D2513]'
                  : 'bg-white border-[#E4D4BC] text-[#C18A45] hover:bg-[#FAF6EE]'
              }`}
              aria-label="Open Side Navigation Menu"
              title={isAmharic ? 'የጎን ማውጫ ክፈት' : 'Open Navigation Menu'}
            >
              <Menu className="w-5 h-5" />
              {stats.pendingOrdersCount + unreadMessagesCount > 0 && (
                <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-amber-500 ring-2 ring-white dark:ring-black animate-pulse" />
              )}
            </button>

            <div className="w-8 h-8 rounded-xl bg-[#C18A45]/20 text-[#C18A45] flex items-center justify-center font-bold font-serif text-sm shrink-0">
              JL
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-sm sm:text-base">
                  {isAmharic ? 'የጆኒ አስተዳዳሪ ፖርታል' : 'Jonny Admin Portal'}
                </span>
                {/* Active Module Indicator Badge on Mobile - Tap to Open Side Menu */}
                <button
                  type="button"
                  onClick={() => setIsMobileSidebarOpen(true)}
                  className="lg:hidden flex items-center gap-1 px-2 py-0.5 rounded-lg text-[10px] font-bold bg-[#C18A45]/15 text-[#C18A45] border border-[#C18A45]/30 cursor-pointer"
                  title={isAmharic ? 'ክፍል ለመቀየር ይጫኑ' : 'Tap to switch module'}
                >
                  <span className="truncate max-w-[100px]">
                    {navItems.find(n => n.id === activeTab)?.shortLabel || navItems.find(n => n.id === activeTab)?.label}
                  </span>
                  <ChevronDown className="w-3 h-3 shrink-0" />
                </button>
              </div>
              <p className="text-[11px] opacity-70 hidden sm:block">
                {isAmharic ? 'የገቡበት መለያ:' : 'Logged in as:'} <strong className="text-[#C18A45]">{user?.name}</strong> ({user?.email})
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Refresh Button */}
            <button
              onClick={loadDashboardData}
              disabled={isLoadingData}
              className={`p-2 sm:px-3 sm:py-2 rounded-xl border text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer ${
                isDark ? 'bg-[#2A1A0D] border-[#4A2C16] hover:bg-[#3A2412]' : 'bg-white border-[#E4D4BC] hover:bg-[#EFE8DC]'
              }`}
              title={isAmharic ? 'መረጃ አድስ' : 'Refresh Data'}
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isLoadingData ? 'animate-spin text-[#C18A45]' : ''}`} />
              <span className="hidden sm:inline">{isAmharic ? 'አድስ' : 'Refresh'}</span>
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
                          <span className="px-1.5 py-0.5 rounded-md text-[9px] font-bold bg-amber-500 text-black shadow-xs">
                            {newPaymentsCount} new payment{newPaymentsCount > 1 ? 's' : ''}
                          </span>
                        ) : (
                          <span className="px-1.5 py-0.5 rounded-md text-[9px] font-bold bg-emerald-500/20 text-emerald-400">
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
                                <div className={`font-bold break-words flex items-center gap-1.5 ${
                                  n.type === 'OUT_OF_STOCK' ? 'text-red-400' : 'text-[#C18A45]'
                                }`}>
                                  {n.type === 'OUT_OF_STOCK' ? (
                                    <AlertTriangle className="w-3 h-3 text-red-400 shrink-0" />
                                  ) : n.type === 'CONTACT_MESSAGE' ? (
                                    <MessageSquare className="w-3 h-3 text-[#C18A45] shrink-0" />
                                  ) : isPendingReview ? (
                                    <span className="w-1.5 h-1.5 rounded-full bg-[#C18A45] shrink-0 animate-pulse" />
                                  ) : null}
                                  <span>{n.title}</span>
                                </div>
                                <div className="flex items-center gap-1 shrink-0">
                                  {n.type === 'OUT_OF_STOCK' ? (
                                    <span className="px-1.5 py-0.5 rounded-md text-[8.5px] font-bold bg-red-500/15 text-red-400 border border-red-500/30">
                                      Stock Alert
                                    </span>
                                  ) : n.type === 'CONTACT_MESSAGE' ? (
                                    <span className="px-1.5 py-0.5 rounded-md text-[8.5px] font-bold bg-[#C18A45]/15 text-[#C18A45] border border-[#C18A45]/30">
                                      Inquiry
                                    </span>
                                  ) : isPendingReview ? (
                                    <span className="px-1.5 py-0.5 rounded-md text-[8.5px] font-bold bg-[#C18A45]/15 text-[#C18A45] border border-[#C18A45]/30">
                                      Pending Approval
                                    </span>
                                  ) : relatedOrder?.status === 'completed' || relatedOrder?.status === 'verified' || relatedOrder?.status === 'delivered' ? (
                                    <span className="px-1.5 py-0.5 rounded-md text-[8.5px] font-bold bg-emerald-500/15 text-emerald-400">
                                      ✓ Settled
                                    </span>
                                  ) : relatedOrder?.status === 'reserved' ? (
                                    <span className="px-1.5 py-0.5 rounded-md text-[8.5px] font-bold bg-amber-500/15 text-amber-400">
                                      50% Reserved
                                    </span>
                                  ) : null}
                                  {n.orderId && (
                                    <span className="px-1.5 py-0.5 rounded-md text-[9px] font-mono font-bold bg-[#C18A45]/15 text-[#C18A45]">
                                      #{n.orderId}
                                    </span>
                                  )}
                                </div>
                              </div>
                              <p className="opacity-80 text-[11px] leading-relaxed line-clamp-2">
                                {n.message}
                              </p>
                              
                              <div className="mt-1.5 flex items-center justify-between text-[10px] opacity-60">
                                <span>{new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                {n.type === 'OUT_OF_STOCK' ? (
                                  <span className="text-red-400 font-bold inline-flex items-center gap-0.5 group-hover:underline">
                                    <span>Restock Package Slots</span>
                                    <ArrowRight className="w-2.5 h-2.5" />
                                  </span>
                                ) : n.type === 'CONTACT_MESSAGE' ? (
                                  <span className="text-[#C18A45] font-bold inline-flex items-center gap-0.5 group-hover:underline">
                                    <span>View & Reply Inquiry</span>
                                    <ArrowRight className="w-2.5 h-2.5" />
                                  </span>
                                ) : n.orderId ? (
                                  <span className="text-[#C18A45] font-bold inline-flex items-center gap-0.5 group-hover:underline">
                                    <span>{isPendingReview ? 'Review & Approve Slip' : 'View Order Details'}</span>
                                    <ArrowRight className="w-2.5 h-2.5" />
                                  </span>
                                ) : null}
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

            {/* Language & Theme Controls */}
            <LanguageToggle />
            <ThemeToggle />

            {/* Logout */}
            <button
              onClick={handleAdminLogout}
              className="p-2 rounded-xl bg-red-500/10 text-red-400 border border-red-500/20 hover:bg-red-500/20 transition-colors cursor-pointer"
              title={isAmharic ? 'ውጣ' : 'Sign Out'}
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

      {/* Main Dashboard Layout: Full-Height Continuous Sidebar + Content Area */}
      <div className="flex flex-col lg:flex-row min-h-[calc(100vh-61px)]">
        
        {/* Full-Height Left Sidebar for Desktop (Hidden on phone/mobile screens where slide drawer is used) */}
        <aside
          className={`hidden lg:flex w-64 xl:w-72 shrink-0 border-r transition-colors z-30 flex-col justify-between ${
            isDark ? 'bg-[#1E140A] border-[#3D2513]' : 'bg-[#FAF6EE] border-[#E8DCCB]'
          }`}
        >
          <div className="p-4 sm:p-5 sticky top-20">
            <div className="flex items-center justify-between px-3 py-2 mb-3 rounded-xl bg-black/5 dark:bg-white/5 border border-black/5 dark:border-white/5">
              <span className="text-[11px] font-bold uppercase tracking-wider text-[#C18A45]">
                {isAmharic ? 'የአስተዳዳሪ ክፍሎች' : 'Admin Modules'}
              </span>
              <span className="text-[10px] font-mono opacity-50">{isAmharic ? '8 ክፍሎች' : '8 Modules'}</span>
            </div>

            <nav className="flex flex-col gap-1.5">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setActiveTab(item.id)}
                    className={`flex items-center justify-between gap-2.5 px-3.5 py-3 rounded-xl text-xs font-bold transition-all text-left cursor-pointer ${
                      isActive
                        ? 'bg-[#C18A45] text-white shadow-sm font-extrabold'
                        : isDark
                        ? 'hover:bg-[#2A1A0D] text-[#D8C5A8]'
                        : 'hover:bg-[#F1E8D8] text-[#746556]'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-white' : 'text-[#C18A45]'}`} />
                      <span className="truncate">{item.label}</span>
                    </div>
                    {item.badge && (
                      <span
                        className={`px-2 py-0.5 rounded-md text-[10px] font-bold shrink-0 ${
                          item.badgeIsAlert
                            ? 'bg-amber-500 text-black animate-pulse font-black'
                            : isActive
                            ? 'bg-black/20 text-white'
                            : 'bg-black/5 dark:bg-white/10 opacity-75 font-mono'
                        }`}
                      >
                        {item.badge}
                      </span>
                    )}
                  </button>
                );
              })}
            </nav>
          </div>
        </aside>

        {/* Right Main Content Area */}
        <main className="flex-1 min-w-0 p-4 sm:p-6 lg:p-8">

        {/* ============================================================ */}
        {/* TAB 1: OVERVIEW & METRICS */}
        {/* ============================================================ */}
        {activeTab === 'overview' && (
          isLoadingData && ordersList.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-28 text-center animate-in fade-in duration-200">
              <div className="w-8 h-8 rounded-full border-2 border-amber-500 border-t-transparent animate-spin mb-3" />
              <p className="text-xs font-semibold text-amber-500">
                {isAmharic ? 'በመጫን ላይ...' : 'Loading...'}
              </p>
            </div>
          ) : (
          <div className="space-y-6 animate-in fade-in-50 duration-150">
            {/* KPI Cards Grid with Consistent Unified Icons */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <div className={`p-4 sm:p-5 rounded-2xl border ${isDark ? 'bg-[#2A1A0D] border-[#4A2C16]' : 'bg-[#F1E8D8] border-[#E4D4BC]'}`}>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[11px] font-semibold uppercase tracking-wider opacity-70">
                    {isAmharic ? 'የተረጋገጠ ገቢ' : 'Verified Revenue'}
                  </span>
                  <div className="w-8 h-8 rounded-xl bg-amber-500/10 text-[#C18A45] border border-amber-500/20 flex items-center justify-center">
                    <DollarSign className="w-4 h-4 text-[#C18A45]" />
                  </div>
                </div>
                <div className="text-xl sm:text-2xl font-serif font-extrabold text-[#C18A45]">
                  {formatPrice(stats.verifiedRevenue)}
                </div>
                <p className="text-[11px] opacity-70 mt-1">
                  {stats.verifiedOrdersCount} {isAmharic ? 'የተረጋገጡ ክፍያዎች' : 'Verified Payments'}
                </p>
              </div>

              <div className={`p-4 sm:p-5 rounded-2xl border ${isDark ? 'bg-[#2A1A0D] border-[#4A2C16]' : 'bg-[#F1E8D8] border-[#E4D4BC]'}`}>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[11px] font-semibold uppercase tracking-wider opacity-70">
                    {isAmharic ? 'የሚጠበቁ ደረሰኞች' : 'Pending Slips'}
                  </span>
                  <div className="w-8 h-8 rounded-xl bg-amber-500/10 text-[#C18A45] border border-amber-500/20 flex items-center justify-center">
                    <Clock className="w-4 h-4 text-[#C18A45]" />
                  </div>
                </div>
                <div className="text-xl sm:text-2xl font-serif font-extrabold text-[#C18A45]">
                  {stats.pendingOrdersCount} {isAmharic ? 'ደረሰኞች' : 'Slips'}
                </div>
                <p className="text-[11px] opacity-70 mt-1">
                  {isAmharic ? 'የእርስዎን ማረጋገጫ የሚጠብቁ' : 'Awaiting your approval'}
                </p>
              </div>

              <div className={`p-4 sm:p-5 rounded-2xl border ${isDark ? 'bg-[#2A1A0D] border-[#4A2C16]' : 'bg-[#F1E8D8] border-[#E4D4BC]'}`}>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[11px] font-semibold uppercase tracking-wider opacity-70">
                    {isAmharic ? 'ጠቅላላ ከብቶች' : 'Total Animals'}
                  </span>
                  <div className="w-8 h-8 rounded-xl bg-amber-500/10 text-[#C18A45] border border-amber-500/20 flex items-center justify-center">
                    <ShoppingBag className="w-4 h-4 text-[#C18A45]" />
                  </div>
                </div>
                <div className="text-xl sm:text-2xl font-serif font-extrabold">
                  {stats.totalAnimals} {isAmharic ? 'ራስ' : 'Head'}
                </div>
                <p className="text-[11px] opacity-70 mt-1">
                  {stats.sheepCount} {isAmharic ? 'በጎች' : 'Sheep'} · {stats.goatsCount} {isAmharic ? 'ፍየሎች' : 'Goats'} · {stats.cowsCount} {isAmharic ? 'ላሞች' : 'Cows'}
                </p>
              </div>

              <div className={`p-4 sm:p-5 rounded-2xl border ${isDark ? 'bg-[#2A1A0D] border-[#4A2C16]' : 'bg-[#F1E8D8] border-[#E4D4BC]'}`}>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[11px] font-semibold uppercase tracking-wider opacity-70">
                    {isAmharic ? 'የክምችት ሁኔታ' : 'Inventory Status'}
                  </span>
                  <div className="w-8 h-8 rounded-xl bg-amber-500/10 text-[#C18A45] border border-amber-500/20 flex items-center justify-center">
                    <CheckCircle2 className="w-4 h-4 text-[#C18A45]" />
                  </div>
                </div>
                <div className="flex items-center gap-1.5 text-xs font-semibold">
                  <span className="text-emerald-500 font-bold">{stats.availableCount} {isAmharic ? 'ክፍት' : 'Avail'}</span>
                  <span>·</span>
                  <span className="text-amber-500 font-bold">{stats.reservedCount} {isAmharic ? 'የተያዙ' : 'Hold'}</span>
                  <span>·</span>
                  <span className="text-stone-400 font-bold">{stats.soldCount} {isAmharic ? 'የተሸጡ' : 'Sold'}</span>
                </div>
                <div className="mt-2 w-full bg-stone-700/30 rounded-full h-1.5 overflow-hidden flex">
                  <div style={{ width: `${(stats.availableCount / (stats.totalAnimals || 1)) * 100}%` }} className="bg-emerald-500 h-full" />
                  <div style={{ width: `${(stats.reservedCount / (stats.totalAnimals || 1)) * 100}%` }} className="bg-amber-500 h-full" />
                  <div style={{ width: `${(stats.soldCount / (stats.totalAnimals || 1)) * 100}%` }} className="bg-stone-500 h-full" />
                </div>
              </div>
            </div>

            {/* Quick Pending Slips Action Banner */}
            {stats.pendingOrdersCount > 0 && (
              <div
                className={`p-5 rounded-2xl border flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
                  isDark ? 'bg-[#2A1A0D] border-amber-500/40' : 'bg-[#FFF8EC] border-amber-500/40'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-[#C18A45] flex items-center justify-center flex-shrink-0">
                    <Clock className="w-5 h-5 text-[#C18A45]" />
                  </div>
                  <div>
                    <h3 className="font-serif font-bold text-base text-[#C18A45]">
                      {stats.pendingOrdersCount} {isAmharic ? 'የደንበኛ ክፍያ ደረሰኞች ምርመራ ይጠብቃሉ' : 'Customer Payment Slips Awaiting Review'}
                    </h3>
                    <p className="text-xs opacity-75">
                      {isAmharic ? 'ክፍያዎችን በማጽደቅ ከብቶቹ እንዲቀነሱ እና እንደተሸጡ ምልክት ያድርጉ።' : 'Verify transactions to automatically deduct inventory and mark livestock items as SOLD.'}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setActiveTab('orders')}
                  className="px-5 py-2.5 rounded-xl bg-[#C18A45] hover:bg-[#A06E35] text-white font-bold text-xs shadow-md transition-all self-start sm:self-auto flex items-center gap-1.5 cursor-pointer"
                >
                  <span>{isAmharic ? 'ደረሰኞችን አሁን መርምር' : 'Review Slips Now'}</span>
                  <ArrowUpRight className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
          )
        )}

        {/* ============================================================ */}
        {/* TAB 2: ORDERS & SLIP VERIFICATION */}
        {/* ============================================================ */}
        {activeTab === 'orders' && (
          <div className="space-y-5 animate-in fade-in-50 duration-150">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h2 className="text-xl sm:text-2xl font-serif font-bold">
                  {isAmharic ? 'የትዕዛዞች እና የክፍያ ደረሰኞች ማረጋገጫ' : 'Customer Orders & Payment Slip Verification'}
                </h2>
                <p className="text-xs opacity-70">
                  {isAmharic
                    ? 'የደንበኞችን የባንክ ማስተላለፊያ ደረሰኞች በመመርመር ያጽድቁ። ሲጸድቅ ከብቱ በቀጥታ እንደተሸጠ ይመዘገባል።'
                    : 'Inspect customer-uploaded transfer receipts and verify transactions. Once approved, the animal is automatically marked as SOLD.'}
                </p>
              </div>

              {/* Status Filter & Actions */}
              <div className="flex flex-wrap sm:flex-nowrap items-center gap-2 w-full sm:w-auto">
                <div className="flex items-center gap-2 flex-1 sm:flex-initial min-w-[200px]">
                  <Filter className="w-3.5 h-3.5 opacity-60 text-[#C18A45] shrink-0" />
                  <select
                    value={orderStatusFilter}
                    onChange={(e) => setOrderStatusFilter(e.target.value)}
                    className={`w-full px-3.5 py-2 rounded-xl text-xs font-semibold border focus:outline-none shadow-xs transition-colors ${
                      isDark ? 'bg-[#1B1208] border-[#4A2C16] text-[#F4E8D0]' : 'bg-[#FAF7F0] border-[#E4D4BC] text-[#2A1A0D]'
                    }`}
                  >
                    <option value="all">
                      {isAmharic ? 'ሁሉም ትዕዛዞች እና ቅድመ-ይዞታዎች' : 'All Orders & Reservations'} ({ordersList.length})
                    </option>
                    <option value="active_reservation">
                      {isAmharic ? 'የተያዙ (Reservations)' : 'Active Reservation'} ({ordersList.filter(o => o.status === 'reserved' || o.status === 'reservation_pending').length})
                    </option>
                    <option value="sold">
                      {isAmharic ? 'የተሸጡ / የተጠናቀቁ' : 'Sold'} ({ordersList.filter(o => o.status === 'completed' || o.status === 'verified').length})
                    </option>
                    <option value="delivery_pending">
                      {isAmharic ? 'ማድረሻ የሚጠብቁ' : 'Delivery Pending'} ({ordersList.filter(o => o.status === 'delivery_pending' || ((o.status === 'completed' || o.status === 'verified') && Boolean(o.deliveryLocation))).length})
                    </option>
                    <option value="delivered">
                      {isAmharic ? 'የደረሱ' : 'Delivered'} ({ordersList.filter(o => o.status === 'delivered').length})
                    </option>
                    <option value="rejected">
                      {isAmharic ? 'ውድቅ የተደረጉ' : 'Rejected'} ({ordersList.filter(o => o.status === 'rejected').length})
                    </option>
                  </select>
                </div>

                {ordersList.some(o => o.status === 'rejected' && (o.paymentSlipUrl || o.finalPaymentSlipUrl)) && (
                  <button
                    type="button"
                    onClick={() => handleClearAllReceipts('rejected')}
                    className="px-3 py-2 rounded-xl text-xs font-semibold bg-red-500/15 hover:bg-red-500/25 text-red-400 border border-red-500/30 transition-colors flex items-center gap-1.5 cursor-pointer shrink-0"
                    title={isAmharic ? 'ውድቅ ለተደረጉ ትዕዛዞች ደረሰኞችን አጽዳ' : 'Clear payment receipts for all rejected orders'}
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>{isAmharic ? 'የውድቅ ደረሰኞችን አጽዳ' : 'Clear Rejected Receipts'}</span>
                  </button>
                )}
              </div>
            </div>

            {/* Orders & Slips Content */}
            {isLoadingData && ordersList.length === 0 ? (
              <div className="py-16 text-center">
                <div className="flex flex-col items-center justify-center gap-2 animate-in fade-in duration-200">
                  <div className="w-8 h-8 rounded-full border-2 border-amber-500 border-t-transparent animate-spin" />
                  <span className="text-xs font-semibold text-amber-500">
                    {isAmharic ? 'በመጫን ላይ...' : 'Loading...'}
                  </span>
                </div>
              </div>
            ) : filteredOrders.length === 0 ? (
              <div className={`p-8 text-center rounded-3xl border ${isDark ? 'bg-[#2A1A0D] border-[#4A2C16]' : 'bg-[#F1E8D8] border-[#E4D4BC]'}`}>
                <p className="text-xs opacity-60">
                  {isAmharic ? 'ማጣሪያውን የሚያሟላ ትዕዛዝ አልተገኘም' : 'No orders found matching filter'}
                </p>
              </div>
            ) : (
              <>
                {/* ============================================================ */}
                {/* 1. MOBILE PHONE SCREEN VIEW (< 768px) - COMPACT CARD LIST */}
                {/* ============================================================ */}
                <div className="block md:hidden space-y-2.5">
                  {filteredOrders.map((order) => {
                    const isRes = order.isReservation || order.depositAmount != null;
                    const deposit = order.depositAmount || (order.totalAmount * 0.5);
                    const remaining = order.remainingAmount || (order.totalAmount * 0.5);
                    const isExpanded = Boolean(expandedOrderIds[order.id]);

                    return (
                      <div
                        key={order.id}
                        className={`rounded-2xl border transition-all overflow-hidden shadow-xs ${
                          isDark ? 'bg-[#2A1A0D] border-[#4A2C16]' : 'bg-[#F1E8D8] border-[#E4D4BC]'
                        }`}
                      >
                        {/* Collapsed Clean Row (Minimal Height ~70px) */}
                        <div className="p-3">
                          {/* Row 1: Order ID, Date, Item Type & Status Badge */}
                          <div className="flex items-center justify-between gap-1.5 mb-1.5">
                            <div className="flex items-center gap-1.5 min-w-0">
                              <span className="font-mono font-bold text-xs text-amber-500 truncate">
                                #{order.id}
                              </span>
                              <span className="text-[10px] opacity-60 shrink-0">
                                {new Date(order.createdAt).toLocaleDateString()}
                              </span>
                              {order.isPackage && !(order.packageDetails as any)?.isMeatByKg && (
                                <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-amber-500/15 text-amber-400 border border-amber-500/30 shrink-0">
                                  {isAmharic ? 'ጥቅል' : 'Pkg'}
                                </span>
                              )}
                              {(order.packageDetails as any)?.isMeatByKg && (
                                <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-rose-500/15 text-rose-400 border border-rose-500/30 shrink-0">
                                  {isAmharic ? 'ስጋ' : 'Meat'}
                                </span>
                              )}
                              {isRes && (
                                <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 shrink-0">
                                  50%
                                </span>
                              )}
                            </div>

                            {/* Status Badge */}
                            <div className="shrink-0">
                              {order.status === 'reservation_pending' && (
                                <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-amber-500/15 text-amber-400 border border-amber-500/30 animate-pulse">
                                  {isAmharic ? '50% ምርመራ' : '50% Review'}
                                </span>
                              )}
                              {order.status === 'reserved' && (
                                <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-amber-500/15 text-amber-400 border border-amber-500/30">
                                  {isAmharic ? 'የተያዘ' : 'Reserved'}
                                </span>
                              )}
                              {order.status === 'final_payment_pending' && (
                                <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-amber-500/15 text-amber-400 border border-amber-500/30 animate-pulse">
                                  {isAmharic ? 'ቀሪ 50% ምርመራ' : 'Final Review'}
                                </span>
                              )}
                              {order.status === 'pending_verification' && (
                                <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-amber-500/15 text-amber-400 border border-amber-500/30 animate-pulse">
                                  {isAmharic ? 'ሙሉ ደረሰኝ' : 'Full Review'}
                                </span>
                              )}
                              {order.status === 'delivery_pending' && (
                                <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-[#C18A45]/15 text-[#C18A45] border border-[#C18A45]/30 inline-flex items-center gap-1">
                                  <Truck className="w-2.5 h-2.5" />
                                  <span>{isAmharic ? 'ማድረስ' : 'Delivery'}</span>
                                </span>
                              )}
                              {order.status === 'delivered' && (
                                <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 inline-flex items-center gap-1">
                                  <CheckCircle2 className="w-2.5 h-2.5" />
                                  <span>{isAmharic ? 'ደርሷል' : 'Delivered'}</span>
                                </span>
                              )}
                              {(order.status === 'completed' || order.status === 'verified') && (
                                <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                                  ✓ {isAmharic ? 'የተሸጠ' : 'Sold'}
                                </span>
                              )}
                              {order.status === 'rejected' && (
                                <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-red-500/15 text-red-400 border border-red-500/30">
                                  {isAmharic ? 'ውድቅ' : 'Rejected'}
                                </span>
                              )}
                            </div>
                          </div>

                          {/* Row 2: Customer Name, Item brief & Price */}
                          <div className="flex items-center justify-between gap-2 mb-2">
                            <div className="min-w-0 flex-1">
                              <div className="text-xs font-bold truncate">
                                {order.customerName}
                              </div>
                              <div className="text-[11px] opacity-75 truncate">
                                {(order.packageDetails as any)?.isMeatByKg ? (
                                  <span className="text-rose-400 font-medium">
                                    {(order.packageDetails as any).cut} ({(order.packageDetails as any).kg} KG)
                                  </span>
                                ) : (
                                  order.packageName || order.animalBreed || (isAmharic ? 'የከብት አይነት' : 'Livestock Item')
                                )}
                              </div>
                            </div>

                            <div className="text-right shrink-0">
                              <div className={`font-bold text-xs sm:text-sm font-mono ${isDark ? 'text-[#E0B15A]' : 'text-[#B8792F]'}`}>
                                {formatPrice(order.totalAmount)}
                              </div>
                              {isRes && (
                                <div className="text-[9.5px] text-emerald-500 font-semibold">
                                  {isAmharic ? '50% ቅድመ' : 'Deposit'}: {formatPrice(deposit)}
                                </div>
                              )}
                            </div>
                          </div>

                          {/* Row 3: Receipt Slips Preview, Quick Actions & View More Toggle */}
                          <div className="flex items-center justify-between gap-2 pt-1 border-t border-black/5 dark:border-white/5">
                            {/* Receipt Slips Thumbnails */}
                            <div className="flex items-center gap-1.5 overflow-x-auto py-0.5">
                              {order.paymentSlipUrl ? (
                                <button
                                  type="button"
                                  onClick={() => setSelectedSlipOrder(order)}
                                  className="flex items-center gap-1 p-0.5 pr-1.5 rounded-lg border border-[#C18A45]/30 hover:border-[#C18A45] bg-black/5 dark:bg-white/5 cursor-pointer shrink-0 transition-all"
                                  title={isAmharic ? 'የቅድመ-ክፍያ ደረሰኝን ለመመርመር ይጫኑ' : 'Click to inspect slip'}
                                >
                                  <img
                                    src={order.paymentSlipUrl}
                                    alt="Slip"
                                    className="w-7 h-7 object-cover rounded"
                                  />
                                  <span className="text-[9.5px] font-bold text-[#C18A45]">
                                    {isRes ? (isAmharic ? 'ቅድመ' : 'Deposit') : (isAmharic ? 'ደረሰኝ' : 'Slip')}
                                  </span>
                                </button>
                              ) : null}

                              {order.finalPaymentSlipUrl ? (
                                <button
                                  type="button"
                                  onClick={() => setSelectedSlipOrder({
                                    ...order,
                                    paymentSlipUrl: order.finalPaymentSlipUrl!
                                  })}
                                  className="flex items-center gap-1 p-0.5 pr-1.5 rounded-lg border border-emerald-500/30 hover:border-emerald-500 bg-emerald-500/10 cursor-pointer shrink-0 transition-all"
                                  title={isAmharic ? 'የመጨረሻ 50% ደረሰኝን ለመመርመር ይጫኑ' : 'Click to inspect final slip'}
                                >
                                  <img
                                    src={order.finalPaymentSlipUrl}
                                    alt="Final Slip"
                                    className="w-7 h-7 object-cover rounded"
                                  />
                                  <span className="text-[9.5px] font-bold text-emerald-400">
                                    {isAmharic ? 'የመጨረሻ' : 'Final'}
                                  </span>
                                </button>
                              ) : null}

                              {!order.paymentSlipUrl && !order.finalPaymentSlipUrl && (
                                <span className="text-[10px] opacity-40 italic">
                                  {isAmharic ? 'ደረሰኝ የለም' : 'No slip'}
                                </span>
                              )}
                            </div>

                            {/* Quick Action & View More Button */}
                            <div className="flex items-center gap-1.5 shrink-0">
                              {/* Quick Approve buttons */}
                              {order.status === 'reservation_pending' && (
                                <button
                                  type="button"
                                  onClick={() => handleVerifyReservation(order.id)}
                                  className="px-2 py-1 rounded-md bg-amber-500 hover:bg-amber-600 text-black font-bold text-[10.5px] shadow transition-all flex items-center gap-1 cursor-pointer"
                                >
                                  <Check className="w-3 h-3" />
                                  <span>{isAmharic ? 'አጽድቅ' : 'Approve'}</span>
                                </button>
                              )}
                              {order.status === 'final_payment_pending' && (
                                <button
                                  type="button"
                                  onClick={() => handleVerifyFinalPayment(order.id)}
                                  className="px-2 py-1 rounded-md bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[10.5px] shadow transition-all flex items-center gap-1 cursor-pointer"
                                >
                                  <Check className="w-3 h-3" />
                                  <span>{isAmharic ? 'ሸጥ' : 'Sell'}</span>
                                </button>
                              )}
                              {order.status === 'pending_verification' && (
                                <button
                                  type="button"
                                  onClick={() => handleVerifyOrder(order.id)}
                                  className="px-2 py-1 rounded-md bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[10.5px] shadow transition-all flex items-center gap-1 cursor-pointer"
                                >
                                  <Check className="w-3 h-3" />
                                  <span>{isAmharic ? 'አረጋግጥ' : 'Verify'}</span>
                                </button>
                              )}

                              {/* View More / View Less Toggle Button */}
                              <button
                                type="button"
                                onClick={() => toggleOrderExpanded(order.id)}
                                className={`flex items-center gap-1 px-2 py-1 rounded-md text-[11px] font-semibold border transition-colors cursor-pointer ${
                                  isExpanded
                                    ? 'bg-[#C18A45]/20 text-[#C18A45] border-[#C18A45]/40'
                                    : 'bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10 border-transparent text-[#C18A45]'
                                }`}
                              >
                                <span>{isExpanded ? (isAmharic ? 'ዝርዝር ደብቅ' : 'View Less') : (isAmharic ? 'ዝርዝር አሳይ' : 'View More')}</span>
                                {isExpanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                              </button>
                            </div>
                          </div>
                        </div>

                        {/* Expanded Drawer (Hidden by default, opened by View More) */}
                        {isExpanded && (
                          <div className={`p-3 border-t text-xs space-y-2.5 ${
                            isDark ? 'bg-black/25 border-[#4A2C16]' : 'bg-[#EAE1D0]/70 border-[#E4D4BC]'
                          }`}>
                            {/* Customer Phone & Delivery */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pb-2 border-b border-black/10 dark:border-white/10">
                              <div>
                                <span className="text-[10px] uppercase font-bold opacity-60 block mb-0.5">
                                  {isAmharic ? 'ስልክ ቁጥር' : 'Customer Phone'}
                                </span>
                                <a
                                  href={getPhoneCallLink(order.customerPhone)}
                                  className="inline-flex items-center gap-1 text-emerald-500 font-mono font-semibold hover:underline"
                                >
                                  <Phone className="w-3 h-3" />
                                  <span>{order.customerPhone}</span>
                                </a>
                              </div>

                              <div>
                                <span className="text-[10px] uppercase font-bold opacity-60 block mb-0.5">
                                  {isAmharic ? 'የማድረሻ ቦታ' : 'Delivery Address'}
                                </span>
                                {order.deliveryLocation ? (
                                  <div className="flex items-start gap-1 text-[11px]">
                                    <MapPin className="w-3 h-3 shrink-0 text-[#C18A45] mt-0.5" />
                                    <span className="break-words">{order.deliveryLocation}</span>
                                  </div>
                                ) : (
                                  <span className="text-[11px] opacity-60 italic">
                                    {isAmharic ? 'ከእርሻ ርክክብ (Pickup)' : 'Farm Pickup'}
                                  </span>
                                )}
                                {(order.packageDetails as any)?.isDelivery && (
                                  <span className="inline-flex items-center gap-1 px-1.5 py-0.5 mt-1 rounded text-[9px] font-bold bg-[#C18A45]/10 text-[#C18A45] border border-[#C18A45]/20">
                                    <Truck className="w-2.5 h-2.5" />
                                    <span>{isAmharic ? 'እስከ ደጃፍ ማድረሻ' : 'Doorstep Delivery'}</span>
                                  </span>
                                )}
                              </div>
                            </div>

                            {/* Payment Method, Transaction Ref & Financials */}
                            <div className="grid grid-cols-2 gap-2 pb-2 border-b border-black/10 dark:border-white/10">
                              <div>
                                <span className="text-[10px] uppercase font-bold opacity-60 block mb-0.5">
                                  {isAmharic ? 'የክፍያ ዘዴ & መለያ' : 'Payment & Txn'}
                                </span>
                                <div className="font-semibold text-[11px]">{order.paymentMethod}</div>
                                {order.transactionReference ? (
                                  <div className="font-mono text-[10px] opacity-75 break-all">
                                    Txn: {order.transactionReference}
                                  </div>
                                ) : (
                                  <div className="text-[10px] opacity-50 italic">No Txn Ref</div>
                                )}
                              </div>

                              <div>
                                <span className="text-[10px] uppercase font-bold opacity-60 block mb-0.5">
                                  {isAmharic ? 'የክፍያ ዝርዝር' : 'Financials'}
                                </span>
                                <div className="text-[11px]">
                                  {isAmharic ? 'ጠቅላላ' : 'Total'}: <strong className="text-amber-500 font-mono">{formatPrice(order.totalAmount)}</strong>
                                </div>
                                {isRes && (
                                  <div className="text-[10px] space-y-0.5">
                                    <div className="text-emerald-500">
                                      {isAmharic ? '50% ቅድመ' : 'Deposit'}: {formatPrice(deposit)}
                                    </div>
                                    <div className="text-amber-500">
                                      {isAmharic ? 'ቀሪ' : 'Remaining'}: {formatPrice(remaining)}
                                    </div>
                                  </div>
                                )}
                              </div>
                            </div>

                            {/* Receipt Slips Management */}
                            <div className="space-y-1.5 pb-2 border-b border-black/10 dark:border-white/10">
                              <span className="text-[10px] uppercase font-bold opacity-60 block">
                                {isAmharic ? 'የደረሰኞች ምርመራ እና አስተዳደር' : 'Receipt Slips & Management'}
                              </span>
                              <div className="flex flex-wrap items-center gap-2">
                                {order.paymentSlipUrl && (
                                  <div className="flex items-center gap-1 p-1 rounded-xl border border-[#C18A45]/30 bg-black/10 dark:bg-white/5">
                                    <button
                                      type="button"
                                      onClick={() => setSelectedSlipOrder(order)}
                                      className="flex items-center gap-1.5 cursor-pointer pr-1"
                                      title={isAmharic ? 'ደረሰኝ መርምር' : 'Inspect slip'}
                                    >
                                      <img
                                        src={order.paymentSlipUrl}
                                        alt="Initial Receipt"
                                        className="w-9 h-9 object-cover rounded-lg"
                                      />
                                      <div className="text-left">
                                        <span className="text-[10px] font-bold text-[#C18A45] block">
                                          {isRes ? (isAmharic ? 'ቅድመ-ክፍያ ደረሰኝ' : 'Deposit Slip') : (isAmharic ? 'ሙሉ ደረሰኝ' : 'Full Slip')}
                                        </span>
                                        <span className="text-[9px] opacity-60 flex items-center gap-0.5">
                                          <Eye className="w-2.5 h-2.5" /> {isAmharic ? 'ተመልከት' : 'View'}
                                        </span>
                                      </div>
                                    </button>
                                    <button
                                      type="button"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        handleClearReceipt(order.id, 'initial');
                                      }}
                                      className="p-1.5 rounded-lg text-red-400 hover:bg-red-500/20 transition-colors"
                                      title={isAmharic ? 'ደረሰኝ ሰርዝ' : 'Clear Receipt'}
                                    >
                                      <Trash2 className="w-3.5 h-3.5" />
                                    </button>
                                  </div>
                                )}

                                {order.finalPaymentSlipUrl && (
                                  <div className="flex items-center gap-1 p-1 rounded-xl border border-emerald-500/30 bg-emerald-500/10">
                                    <button
                                      type="button"
                                      onClick={() => setSelectedSlipOrder({
                                        ...order,
                                        paymentSlipUrl: order.finalPaymentSlipUrl!
                                      })}
                                      className="flex items-center gap-1.5 cursor-pointer pr-1"
                                      title={isAmharic ? 'የመጨረሻ ደረሰኝ መርምር' : 'Inspect final slip'}
                                    >
                                      <img
                                        src={order.finalPaymentSlipUrl}
                                        alt="Final Receipt"
                                        className="w-9 h-9 object-cover rounded-lg"
                                      />
                                      <div className="text-left">
                                        <span className="text-[10px] font-bold text-emerald-400 block">
                                          {isAmharic ? 'የመጨረሻ ደረሰኝ' : 'Final Slip'}
                                        </span>
                                        <span className="text-[9px] opacity-60 flex items-center gap-0.5 text-emerald-400">
                                          <Eye className="w-2.5 h-2.5" /> {isAmharic ? 'ተመልከት' : 'View'}
                                        </span>
                                      </div>
                                    </button>
                                    <button
                                      type="button"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        handleClearReceipt(order.id, 'final');
                                      }}
                                      className="p-1.5 rounded-lg text-red-400 hover:bg-red-500/20 transition-colors"
                                      title={isAmharic ? 'የመጨረሻ ደረሰኝ ሰርዝ' : 'Clear Final Slip'}
                                    >
                                      <Trash2 className="w-3.5 h-3.5" />
                                    </button>
                                  </div>
                                )}
                              </div>
                            </div>

                            {/* Extended Workflow Actions */}
                            <div className="space-y-1.5">
                              <span className="text-[10px] uppercase font-bold opacity-60 block">
                                {isAmharic ? 'የአስተዳዳሪ እርምጃዎች' : 'Workflow Actions'}
                              </span>
                              <div className="flex flex-wrap items-center gap-1.5">
                                {order.status === 'reservation_pending' && (
                                  <>
                                    <button
                                      type="button"
                                      onClick={() => handleVerifyReservation(order.id)}
                                      className="px-2.5 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-600 text-black font-bold text-xs shadow transition-all flex items-center gap-1 cursor-pointer"
                                    >
                                      <Check className="w-3.5 h-3.5" />
                                      <span>{isAmharic ? '50% ቅድመ-ክፍያ አጽድቅ' : 'Approve 50% Deposit'}</span>
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => handleRejectOrder(order.id)}
                                      className="px-2.5 py-1.5 rounded-lg bg-red-500/15 hover:bg-red-500/25 text-red-400 border border-red-500/30 text-xs font-bold transition-colors flex items-center gap-1 cursor-pointer"
                                    >
                                      <X className="w-3.5 h-3.5" />
                                      <span>{isAmharic ? 'ውድቅ አድርግ' : 'Reject Slip'}</span>
                                    </button>
                                  </>
                                )}

                                {order.status === 'final_payment_pending' && (
                                  <>
                                    <button
                                      type="button"
                                      onClick={() => handleVerifyFinalPayment(order.id)}
                                      className="px-2.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow transition-all flex items-center gap-1 cursor-pointer"
                                    >
                                      <Check className="w-3.5 h-3.5" />
                                      <span>{isAmharic ? 'ቀሪውን አጽድቅ & ሸጥ' : 'Approve Final & Mark Sold'}</span>
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => handleRejectOrder(order.id)}
                                      className="px-2.5 py-1.5 rounded-lg bg-red-500/15 hover:bg-red-500/25 text-red-400 border border-red-500/30 text-xs font-bold transition-colors flex items-center gap-1 cursor-pointer"
                                    >
                                      <X className="w-3.5 h-3.5" />
                                      <span>{isAmharic ? 'ውድቅ አድርግ' : 'Reject Slip'}</span>
                                    </button>
                                  </>
                                )}

                                {order.status === 'pending_verification' && (
                                  <>
                                    <button
                                      type="button"
                                      onClick={() => handleVerifyOrder(order.id)}
                                      className="px-2.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow transition-all flex items-center gap-1 cursor-pointer"
                                    >
                                      <Check className="w-3.5 h-3.5" />
                                      <span>{isAmharic ? 'አረጋግጥ & ሸጥ' : 'Verify & Mark Sold'}</span>
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => handleRejectOrder(order.id)}
                                      className="px-2.5 py-1.5 rounded-lg bg-red-500/15 hover:bg-red-500/25 text-red-400 border border-red-500/30 text-xs font-bold transition-colors flex items-center gap-1 cursor-pointer"
                                    >
                                      <X className="w-3.5 h-3.5" />
                                      <span>{isAmharic ? 'ውድቅ አድርግ' : 'Reject Slip'}</span>
                                    </button>
                                  </>
                                )}

                                {order.status === 'reserved' && (
                                  <span className="text-[11px] text-amber-500 font-medium">
                                    {isAmharic ? `ቀሪውን ${formatPrice(remaining)} ከደንበኛ ይጠብቃል` : `Awaiting remaining ${formatPrice(remaining)} from customer`}
                                  </span>
                                )}

                                {order.isDelivery && (
                                  <>
                                    {order.status === 'verified' && (
                                      <button
                                        type="button"
                                        onClick={() => handleApproveDelivery(order.id, 'delivery_pending')}
                                        className="px-2.5 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-600 text-black font-bold text-xs shadow transition-all flex items-center gap-1 cursor-pointer"
                                      >
                                        <Truck className="w-3.5 h-3.5" />
                                        <span>{isAmharic ? 'ተሽከርካሪ ላክ' : 'Dispatch Delivery'}</span>
                                      </button>
                                    )}
                                    {order.status === 'delivery_pending' && (
                                      <button
                                        type="button"
                                        onClick={() => handleApproveDelivery(order.id, 'delivered')}
                                        className="px-2.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow transition-all flex items-center gap-1 cursor-pointer"
                                      >
                                        <Check className="w-3.5 h-3.5" />
                                        <span>{isAmharic ? 'ደርሷል (አጠናቅቅ)' : 'Confirm Delivered'}</span>
                                      </button>
                                    )}
                                  </>
                                )}

                                {!order.isDelivery && (
                                  <>
                                    {order.status === 'verified' && (
                                      <button
                                        type="button"
                                        onClick={() => handleUpdatePickupStatus(order.id, 'pickup_ready')}
                                        className="px-2.5 py-1.5 rounded-lg bg-blue-500 hover:bg-blue-600 text-white font-bold text-xs shadow transition-all flex items-center gap-1 cursor-pointer"
                                      >
                                        <Package className="w-3.5 h-3.5" />
                                        <span>{isAmharic ? 'ለርክክብ ዝግጁ አድርግ' : 'Ready for Pickup'}</span>
                                      </button>
                                    )}
                                    {order.status === 'pickup_ready' && (
                                      <button
                                        type="button"
                                        onClick={() => handleUpdatePickupStatus(order.id, 'completed')}
                                        className="px-2.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow transition-all flex items-center gap-1 cursor-pointer"
                                      >
                                        <Check className="w-3.5 h-3.5" />
                                        <span>{isAmharic ? 'ተረክበዋል (አጠናቅቅ)' : 'Mark Picked Up'}</span>
                                      </button>
                                    )}
                                  </>
                                )}
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>

                {/* ============================================================ */}
                {/* 2. DESKTOP & TABLET TABLE VIEW (>= 768px) - CLEAN & COMPACT */}
                {/* ============================================================ */}
                <div
                  className={`hidden md:block rounded-3xl border overflow-hidden shadow-sm ${
                    isDark ? 'bg-[#2A1A0D] border-[#4A2C16]' : 'bg-[#F1E8D8] border-[#E4D4BC]'
                  }`}
                >
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs border-collapse">
                      <thead>
                        <tr className={`border-b ${isDark ? 'border-[#4A2C16] text-[#D8C5A8]' : 'border-[#E4D4BC] text-[#746556]'}`}>
                          <th className="py-3 px-3 uppercase font-semibold whitespace-nowrap">{isAmharic ? 'የትዕዛዝ መለያ' : 'Order ID'}</th>
                          <th className="py-3 px-3 uppercase font-semibold whitespace-nowrap">{isAmharic ? 'ደንበኛ' : 'Customer'}</th>
                          <th className="py-3 px-3 uppercase font-semibold whitespace-nowrap">{isAmharic ? 'ዝርዝር & ክፍያ' : 'Item & Total'}</th>
                          <th className="py-3 px-3 uppercase font-semibold whitespace-nowrap">{isAmharic ? 'የክፍያ ደረሰኝ' : 'Receipt Slip'}</th>
                          <th className="py-3 px-3 uppercase font-semibold whitespace-nowrap">{isAmharic ? 'የክፍያ ዘዴ' : 'Method'}</th>
                          <th className="py-3 px-3 uppercase font-semibold whitespace-nowrap">{isAmharic ? 'ሁኔታ' : 'Status'}</th>
                          <th className="py-3 px-3 uppercase font-semibold text-right whitespace-nowrap">{isAmharic ? 'እርምጃዎች' : 'Actions'}</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y" style={{ borderColor: isDark ? '#4A2C16' : '#E4D4BC' }}>
                        {filteredOrders.map((order) => {
                          const isRes = order.isReservation || order.depositAmount != null;
                          const deposit = order.depositAmount || (order.totalAmount * 0.5);
                          const remaining = order.remainingAmount || (order.totalAmount * 0.5);
                          const isExpanded = Boolean(expandedOrderIds[order.id]);

                          return (
                            <React.Fragment key={order.id}>
                              <tr className={`hover:bg-black/5 dark:hover:bg-white/5 transition-colors ${isDark ? 'text-[#F4E8D0]' : 'text-[#2A1A0D]'}`}>
                                {/* Order ID & Type */}
                                <td className="py-2.5 px-3 font-mono">
                                  <div className="text-amber-500 font-bold whitespace-nowrap">#{order.id}</div>
                                  <div className="text-[10px] opacity-60 whitespace-nowrap">
                                    {new Date(order.createdAt).toLocaleDateString()}
                                  </div>
                                  <div className="flex flex-wrap gap-1 mt-0.5">
                                    {order.isPackage && !(order.packageDetails as any)?.isMeatByKg && (
                                      <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-amber-500/15 text-amber-400 border border-amber-500/30">
                                        {isAmharic ? 'ጥቅል' : 'Pkg'}
                                      </span>
                                    )}
                                    {(order.packageDetails as any)?.isMeatByKg && (
                                      <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-rose-500/15 text-rose-400 border border-rose-500/30">
                                        {isAmharic ? 'ስጋ' : 'Meat'}
                                      </span>
                                    )}
                                    {isRes && (
                                      <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                                        50%
                                      </span>
                                    )}
                                  </div>
                                </td>

                                {/* Customer */}
                                <td className="py-2.5 px-3 max-w-[140px]">
                                  <strong className="block text-xs font-semibold truncate">{order.customerName}</strong>
                                  <a
                                    href={getPhoneCallLink(order.customerPhone)}
                                    className="text-[11px] opacity-75 block hover:underline font-mono truncate"
                                  >
                                    {order.customerPhone}
                                  </a>
                                </td>

                                {/* Item & Price */}
                                <td className="py-2.5 px-3 max-w-[150px]">
                                  <div className="font-semibold text-xs truncate">
                                    {(order.packageDetails as any)?.isMeatByKg ? (
                                      <span className="text-rose-400 font-bold">
                                        {(order.packageDetails as any).cut} ({(order.packageDetails as any).kg} KG)
                                      </span>
                                    ) : (
                                      order.packageName || order.animalBreed || (isAmharic ? 'የከብት አይነት' : 'Livestock Item')
                                    )}
                                  </div>
                                  <div className={`font-bold text-xs sm:text-sm font-mono whitespace-nowrap ${isDark ? 'text-[#E0B15A]' : 'text-[#B8792F]'}`}>
                                    {formatPrice(order.totalAmount)}
                                  </div>
                                </td>

                                {/* Receipt Slip Thumbnails */}
                                <td className="py-2.5 px-3">
                                  <div className="flex items-center gap-1.5">
                                    {order.paymentSlipUrl ? (
                                      <div className="flex items-center gap-1">
                                        <button
                                          type="button"
                                          onClick={() => setSelectedSlipOrder(order)}
                                          className="flex items-center gap-1 p-0.5 pr-1.5 rounded-lg border border-[#C18A45]/30 hover:border-[#C18A45] bg-black/10 dark:bg-white/5 cursor-pointer transition-all shrink-0"
                                          title={isAmharic ? 'ደረሰኝ መርምር' : 'Inspect slip'}
                                        >
                                          <img
                                            src={order.paymentSlipUrl}
                                            alt="Slip"
                                            className="w-7 h-7 object-cover rounded"
                                          />
                                          <span className="text-[9.5px] font-bold text-[#C18A45]">
                                            {isRes ? (isAmharic ? 'ቅድመ' : 'Deposit') : (isAmharic ? 'ደረሰኝ' : 'Slip')}
                                          </span>
                                        </button>
                                        <button
                                          type="button"
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            handleClearReceipt(order.id, 'initial');
                                          }}
                                          className="p-1 rounded text-red-400 hover:bg-red-500/20 transition-colors"
                                          title={isAmharic ? 'ደረሰኝ ሰርዝ' : 'Clear Receipt'}
                                        >
                                          <Trash2 className="w-3 h-3" />
                                        </button>
                                      </div>
                                    ) : (
                                      <span className="text-[10px] opacity-40 italic">{isAmharic ? 'የለም' : 'None'}</span>
                                    )}

                                    {order.finalPaymentSlipUrl && (
                                      <div className="flex items-center gap-1">
                                        <button
                                          type="button"
                                          onClick={() => setSelectedSlipOrder({
                                            ...order,
                                            paymentSlipUrl: order.finalPaymentSlipUrl!
                                          })}
                                          className="flex items-center gap-1 p-0.5 pr-1.5 rounded-lg border border-emerald-500/30 hover:border-emerald-500 bg-emerald-500/10 cursor-pointer transition-all shrink-0"
                                          title={isAmharic ? 'የመጨረሻ ደረሰኝ መርምር' : 'Inspect final slip'}
                                        >
                                          <img
                                            src={order.finalPaymentSlipUrl}
                                            alt="Final Slip"
                                            className="w-7 h-7 object-cover rounded"
                                          />
                                          <span className="text-[9.5px] font-bold text-emerald-400">
                                            {isAmharic ? 'የመጨረሻ' : 'Final'}
                                          </span>
                                        </button>
                                        <button
                                          type="button"
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            handleClearReceipt(order.id, 'final');
                                          }}
                                          className="p-1 rounded text-red-400 hover:bg-red-500/20 transition-colors"
                                          title={isAmharic ? 'የመጨረሻ ደረሰኝ ሰርዝ' : 'Clear Final Slip'}
                                        >
                                          <Trash2 className="w-3 h-3" />
                                        </button>
                                      </div>
                                    )}
                                  </div>
                                </td>

                                {/* Method */}
                                <td className="py-2.5 px-3">
                                  <div className="font-semibold text-xs whitespace-nowrap">{order.paymentMethod}</div>
                                  {order.transactionReference && (
                                    <span className="text-[10px] font-mono opacity-70 block truncate max-w-[110px]" title={order.transactionReference}>
                                      {order.transactionReference}
                                    </span>
                                  )}
                                </td>

                                {/* Status */}
                                <td className="py-2.5 px-3 whitespace-nowrap">
                                  {order.status === 'reservation_pending' && (
                                    <span className="inline-block px-2 py-0.5 rounded-md text-[10px] font-bold bg-amber-500/15 text-amber-400 border border-amber-500/30 animate-pulse">
                                      {isAmharic ? '50% ምርመራ' : '50% Review'}
                                    </span>
                                  )}
                                  {order.status === 'reserved' && (
                                    <span className="inline-block px-2 py-0.5 rounded-md text-[10px] font-bold bg-amber-500/15 text-amber-400 border border-amber-500/30">
                                      {isAmharic ? 'የተያዘ' : 'Reserved'}
                                    </span>
                                  )}
                                  {order.status === 'final_payment_pending' && (
                                    <span className="inline-block px-2 py-0.5 rounded-md text-[10px] font-bold bg-amber-500/15 text-amber-400 border border-amber-500/30 animate-pulse">
                                      {isAmharic ? 'ቀሪ 50% ምርመራ' : 'Final Review'}
                                    </span>
                                  )}
                                  {order.status === 'pending_verification' && (
                                    <span className="inline-block px-2 py-0.5 rounded-md text-[10px] font-bold bg-amber-500/15 text-amber-400 border border-amber-500/30 animate-pulse">
                                      {isAmharic ? 'ሙሉ ደረሰኝ' : 'Full Review'}
                                    </span>
                                  )}
                                  {order.status === 'delivery_pending' && (
                                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold bg-[#C18A45]/15 text-[#C18A45] border border-[#C18A45]/30">
                                      <Truck className="w-2.5 h-2.5" />
                                      <span>{isAmharic ? 'ማድረስ' : 'Delivery'}</span>
                                    </span>
                                  )}
                                  {order.status === 'delivered' && (
                                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                                      <CheckCircle2 className="w-2.5 h-2.5" />
                                      <span>{isAmharic ? 'ደርሷል' : 'Delivered'}</span>
                                    </span>
                                  )}
                                  {(order.status === 'completed' || order.status === 'verified') && (
                                    <span className="inline-block px-2 py-0.5 rounded-md text-[10px] font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                                      ✓ {isAmharic ? 'የተሸጠ' : 'Sold'}
                                    </span>
                                  )}
                                  {order.status === 'rejected' && (
                                    <span className="inline-block px-2 py-0.5 rounded-md text-[10px] font-bold bg-red-500/15 text-red-400 border border-red-500/30">
                                      {isAmharic ? 'ውድቅ' : 'Rejected'}
                                    </span>
                                  )}
                                </td>

                                {/* Actions & View More Button */}
                                <td className="py-2.5 px-3 text-right whitespace-nowrap">
                                  <div className="inline-flex items-center justify-end gap-1.5">
                                    {order.status === 'reservation_pending' && (
                                      <>
                                        <button
                                          onClick={() => handleVerifyReservation(order.id)}
                                          className="px-2 py-1 rounded-md bg-amber-500 hover:bg-amber-600 text-black font-bold text-[10.5px] shadow transition-all flex items-center gap-1 cursor-pointer"
                                          title={isAmharic ? 'የ50% ቅድመ ክፍያን ያጽድቁ' : 'Approve 50% deposit'}
                                        >
                                          <Check className="w-3 h-3" />
                                          <span>{isAmharic ? 'አጽድቅ' : 'Approve'}</span>
                                        </button>
                                        <button
                                          onClick={() => handleRejectOrder(order.id)}
                                          className="p-1 rounded-md bg-red-500/15 hover:bg-red-500/25 text-red-400 transition-colors cursor-pointer"
                                          title={isAmharic ? 'ደረሰኙን ውድቅ አድርግ' : 'Reject slip'}
                                        >
                                          <X className="w-3.5 h-3.5" />
                                        </button>
                                      </>
                                    )}

                                    {order.status === 'final_payment_pending' && (
                                      <>
                                        <button
                                          onClick={() => handleVerifyFinalPayment(order.id)}
                                          className="px-2 py-1 rounded-md bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[10.5px] shadow transition-all flex items-center gap-1 cursor-pointer"
                                          title={isAmharic ? 'ቀሪውን 50% ክፍያ ያጽድቁ እና ከብቱን የተሸጠ ያድርጉ' : 'Verify final balance and mark animal as SOLD'}
                                        >
                                          <Check className="w-3 h-3" />
                                          <span>{isAmharic ? 'ሸጥ' : 'Sell'}</span>
                                        </button>
                                        <button
                                          onClick={() => handleRejectOrder(order.id)}
                                          className="p-1 rounded-md bg-red-500/15 hover:bg-red-500/25 text-red-400 transition-colors cursor-pointer"
                                          title={isAmharic ? 'የመጨረሻ ደረሰኙን ውድቅ አድርግ' : 'Reject slip'}
                                        >
                                          <X className="w-3.5 h-3.5" />
                                        </button>
                                      </>
                                    )}

                                    {order.status === 'pending_verification' && (
                                      <>
                                        <button
                                          onClick={() => handleVerifyOrder(order.id)}
                                          className="px-2 py-1 rounded-md bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[10.5px] shadow transition-all flex items-center gap-1 cursor-pointer"
                                          title={isAmharic ? 'ክፍያውን ያጽድቁ እና ከብቱን የተሸጠ ያድርጉ' : 'Verify payment and mark animal as SOLD'}
                                        >
                                          <Check className="w-3 h-3" />
                                          <span>{isAmharic ? 'አረጋግጥ' : 'Verify'}</span>
                                        </button>
                                        <button
                                          onClick={() => handleRejectOrder(order.id)}
                                          className="p-1 rounded-md bg-red-500/15 hover:bg-red-500/25 text-red-400 transition-colors cursor-pointer"
                                          title={isAmharic ? 'ደረሰኙን ውድቅ አድርግ' : 'Reject slip'}
                                        >
                                          <X className="w-3.5 h-3.5" />
                                        </button>
                                      </>
                                    )}

                                    {order.isDelivery && (
                                      <>
                                        {order.status === 'verified' && (
                                          <button
                                            type="button"
                                            onClick={() => handleApproveDelivery(order.id, 'delivery_pending')}
                                            className="px-2 py-1 rounded-md bg-amber-500 hover:bg-amber-600 text-black font-bold text-[10.5px] shadow transition-all flex items-center gap-1 cursor-pointer"
                                            title={isAmharic ? 'ተሽከርካሪ ላክ' : 'Dispatch delivery'}
                                          >
                                            <Truck className="w-3 h-3" />
                                            <span>{isAmharic ? 'ላክ' : 'Dispatch'}</span>
                                          </button>
                                        )}
                                        {order.status === 'delivery_pending' && (
                                          <button
                                            type="button"
                                            onClick={() => handleApproveDelivery(order.id, 'delivered')}
                                            className="px-2 py-1 rounded-md bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[10.5px] shadow transition-all flex items-center gap-1 cursor-pointer"
                                            title={isAmharic ? 'መድረሱን አረጋግጥ እና አጠናቅቅ' : 'Confirm delivered'}
                                          >
                                            <Check className="w-3 h-3" />
                                            <span>{isAmharic ? 'ደርሷል' : 'Delivered'}</span>
                                          </button>
                                        )}
                                      </>
                                    )}

                                    {!order.isDelivery && (
                                      <>
                                        {order.status === 'verified' && (
                                          <button
                                            type="button"
                                            onClick={() => handleUpdatePickupStatus(order.id, 'pickup_ready')}
                                            className="px-2 py-1 rounded-md bg-blue-500 hover:bg-blue-600 text-white font-bold text-[10.5px] shadow transition-all flex items-center gap-1 cursor-pointer"
                                            title={isAmharic ? 'ለእርሻ ርክክብ ዝግጁ አድርግ' : 'Ready for farm pickup'}
                                          >
                                            <Package className="w-3 h-3" />
                                            <span>{isAmharic ? 'ዝግጁ' : 'Ready'}</span>
                                          </button>
                                        )}
                                        {order.status === 'pickup_ready' && (
                                          <button
                                            type="button"
                                            onClick={() => handleUpdatePickupStatus(order.id, 'completed')}
                                            className="px-2 py-1 rounded-md bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[10.5px] shadow transition-all flex items-center gap-1 cursor-pointer"
                                            title={isAmharic ? 'ተረክበዋል' : 'Picked up'}
                                          >
                                            <Check className="w-3 h-3" />
                                            <span>{isAmharic ? 'ተረክበዋል' : 'Picked Up'}</span>
                                          </button>
                                        )}
                                      </>
                                    )}

                                    {/* View More / View Less Toggle Button */}
                                    <button
                                      type="button"
                                      onClick={() => toggleOrderExpanded(order.id)}
                                      className={`flex items-center gap-1 px-2 py-1 rounded-md text-[10.5px] font-semibold border transition-colors cursor-pointer ${
                                        isExpanded
                                          ? 'bg-[#C18A45]/20 text-[#C18A45] border-[#C18A45]/40'
                                          : 'bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10 border-transparent text-[#C18A45]'
                                      }`}
                                      title={isExpanded ? (isAmharic ? 'ዝርዝር ደብቅ' : 'Hide Details') : (isAmharic ? 'ዝርዝር አሳይ' : 'View Details')}
                                    >
                                      <span>{isExpanded ? (isAmharic ? 'ደብቅ' : 'Less') : (isAmharic ? 'ተጨማሪ' : 'More')}</span>
                                      {isExpanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                                    </button>
                                  </div>
                                </td>
                              </tr>

                              {/* Desktop Accordion Sub-row when View More is open */}
                              {isExpanded && (
                                <tr className={`border-b ${isDark ? 'bg-black/25 border-[#4A2C16]' : 'bg-[#EAE1D0]/60 border-[#E4D4BC]'}`}>
                                  <td colSpan={7} className="p-3.5">
                                    <div className="grid grid-cols-3 gap-4 text-xs">
                                      <div>
                                        <span className="text-[10px] font-bold opacity-60 uppercase block mb-1">
                                          {isAmharic ? 'የማድረሻ ዝርዝር & ስልክ' : 'Delivery & Contact'}
                                        </span>
                                        <div className="mb-1">
                                          <a
                                            href={getPhoneCallLink(order.customerPhone)}
                                            className="inline-flex items-center gap-1 text-emerald-500 font-mono font-semibold hover:underline"
                                          >
                                            <Phone className="w-3 h-3" />
                                            <span>{order.customerPhone}</span>
                                          </a>
                                        </div>
                                        {order.deliveryLocation ? (
                                          <div className="flex items-start gap-1 text-[11px]">
                                            <MapPin className="w-3 h-3 text-[#C18A45] shrink-0 mt-0.5" />
                                            <span className="break-words">{order.deliveryLocation}</span>
                                          </div>
                                        ) : (
                                          <span className="opacity-60 italic text-[11px]">
                                            {isAmharic ? 'ከእርሻ ርክክብ (Farm Pickup)' : 'Farm Pickup'}
                                          </span>
                                        )}
                                        {(order.packageDetails as any)?.isDelivery && (
                                          <span className="inline-flex items-center gap-1 px-1.5 py-0.5 mt-1 rounded text-[9px] font-bold bg-[#C18A45]/10 text-[#C18A45] border border-[#C18A45]/20">
                                            <Truck className="w-2.5 h-2.5" />
                                            <span>{isAmharic ? 'እስከ ደጃፍ ማድረሻ' : 'Doorstep Delivery'}</span>
                                          </span>
                                        )}
                                      </div>

                                      <div>
                                        <span className="text-[10px] font-bold opacity-60 uppercase block mb-1">
                                          {isAmharic ? 'የክፍያ ዝርዝር' : 'Financial Breakdown'}
                                        </span>
                                        <div className="text-[11px]">
                                          {isAmharic ? 'ጠቅላላ' : 'Total'}: <strong className="text-amber-500 font-mono">{formatPrice(order.totalAmount)}</strong>
                                        </div>
                                        {isRes && (
                                          <div className="text-[10.5px] space-y-0.5 mt-0.5">
                                            <div className="text-emerald-500">
                                              {isAmharic ? '50% ቅድመ ክፍያ' : '50% Deposit'}: {formatPrice(deposit)}
                                            </div>
                                            <div className="text-amber-500">
                                              {isAmharic ? 'ቀሪ ሂሳብ' : 'Remaining'}: {formatPrice(remaining)}
                                            </div>
                                          </div>
                                        )}
                                        {order.animalId && (
                                          <div className="text-[10px] font-mono opacity-70 mt-1">
                                            Animal ID: {order.animalId}
                                          </div>
                                        )}
                                      </div>

                                      <div>
                                        <span className="text-[10px] font-bold opacity-60 uppercase block mb-1">
                                          {isAmharic ? 'የግብይት መለያ & ማስታወሻ' : 'Transaction & Details'}
                                        </span>
                                        <div className="font-mono text-[11px] opacity-80 break-all mb-1">
                                          Txn: {order.transactionReference || '-'}
                                        </div>
                                        <div className="text-[10px] opacity-60">
                                          Method: <strong className="opacity-90">{order.paymentMethod}</strong>
                                        </div>
                                        {order.customerEmail && (
                                          <div className="text-[10px] opacity-75 mt-1 font-mono truncate">
                                            {order.customerEmail}
                                          </div>
                                        )}
                                        {(order as any).notes && (
                                          <div className="text-[10px] opacity-70 mt-1 italic">
                                            "{(order as any).notes}"
                                          </div>
                                        )}
                                      </div>
                                    </div>
                                  </td>
                                </tr>
                              )}
                            </React.Fragment>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              </>
            )}
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
                  {isAmharic ? 'የከብቶች ክምችት አስተዳደር' : 'Livestock Inventory Manager'}
                </h2>
                <p className="text-xs opacity-70">
                  {isAmharic
                    ? 'ከብቶችን ይፈልጉ፣ ይመልከቱ፣ የሽያጭ ሁኔታን ይቀይሩ እና አዳዲስ ከብቶችን ይጨምሩ።'
                    : 'Search, inspect, toggle availability, and add new livestock listings.'}
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <button
                  onClick={() => setIsAddAnimalOpen(true)}
                  className="px-3.5 py-1.5 rounded-xl bg-[#C18A45] hover:bg-[#A06E35] text-white text-xs font-bold shadow transition-colors flex items-center gap-1.5 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>{isAmharic ? 'አዲስ ከብት ጨምር' : 'Add Animal'}</span>
                </button>

                <div className="relative">
                  <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 opacity-60" />
                  <input
                    type="text"
                    placeholder={isAmharic ? 'መለያ ወይም ዝርያ ፈልግ...' : 'Search ID, breed...'}
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
                  <option value="all">{isAmharic ? 'ሁሉም አይነቶች' : 'All Types'}</option>
                  <option value="sheep">{isAmharic ? 'በጎች' : 'Sheep'}</option>
                  <option value="goat">{isAmharic ? 'ፍየሎች' : 'Goat'}</option>
                  <option value="cow">{isAmharic ? 'ላሞች / በሬዎች' : 'Cow'}</option>
                </select>

                <select
                  value={selectedStatusFilter}
                  onChange={(e) => setSelectedStatusFilter(e.target.value)}
                  className={`px-2.5 py-1.5 rounded-xl text-xs border focus:outline-none ${
                    isDark ? 'bg-[#1B1208] border-[#4A2C16] text-[#F4E8D0]' : 'bg-[#FAF7F0] border-[#E4D4BC] text-[#2A1A0D]'
                  }`}
                >
                  <option value="all">{isAmharic ? 'ሁሉም ሁኔታዎች' : 'All Statuses'}</option>
                  <option value="available">{isAmharic ? 'ክፍት / ለሽያጭ' : 'Available'}</option>
                  <option value="reserved">{isAmharic ? 'የተያዘ (Hold)' : 'Reserved'}</option>
                  <option value="sold">{isAmharic ? 'የተሸጠ' : 'Sold'}</option>
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
                      <th className="py-3 px-3.5 uppercase font-semibold">{isAmharic ? 'የከብት መለያ' : 'Animal ID'}</th>
                      <th className="py-3 px-3.5 uppercase font-semibold">{isAmharic ? 'ዝርያ & አይነት' : 'Breed & Type'}</th>
                      <th className="py-3 px-3.5 uppercase font-semibold">{isAmharic ? 'ፆታ' : 'Gender'}</th>
                      <th className="py-3 px-3.5 uppercase font-semibold">{isAmharic ? 'ክብደት' : 'Weight'}</th>
                      <th className="py-3 px-3.5 uppercase font-semibold">{isAmharic ? 'ዋጋ' : 'Price'}</th>
                      <th className="py-3 px-3.5 uppercase font-semibold">{isAmharic ? 'ብዛት' : 'Stock'}</th>
                      <th className="py-3 px-3.5 uppercase font-semibold">{isAmharic ? 'ሁኔታ' : 'Status'}</th>
                      <th className="py-3 px-3.5 uppercase font-semibold text-right">{isAmharic ? 'እርምጃዎች' : 'Actions'}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y" style={{ borderColor: isDark ? '#4A2C16' : '#E4D4BC' }}>
                    {isLoadingData && animalsList.length === 0 ? (
                      <tr>
                        <td colSpan={8} className="text-center py-12">
                          <div className="flex flex-col items-center justify-center gap-2 animate-in fade-in duration-200">
                            <div className="w-8 h-8 rounded-full border-2 border-amber-500 border-t-transparent animate-spin" />
                            <span className="text-xs font-semibold text-amber-500">
                              {isAmharic ? 'በመጫን ላይ...' : 'Loading...'}
                            </span>
                          </div>
                        </td>
                      </tr>
                    ) : filteredAnimals.length === 0 ? (
                      <tr>
                        <td colSpan={8} className="text-center py-8 opacity-60">
                          {isAmharic ? 'ምንም ከብት አልተገኘም' : 'No livestock found matching filter'}
                        </td>
                      </tr>
                    ) : (
                      filteredAnimals.map((animal) => (
                      <tr key={animal.id} className={`hover:bg-black/10 transition-colors ${isDark ? 'text-[#F4E8D0]' : 'text-[#2A1A0D]'}`}>
                        <td className="py-3 px-3.5 font-mono font-bold">
                          <span className="inline-flex items-center gap-1 text-[#C18A45]">
                            <span>{animal.id}</span>
                          </span>
                        </td>
                        <td className="py-3 px-3.5">
                          <div className="capitalize font-semibold">{animal.breed}</div>
                          <span className="text-[10px] uppercase opacity-70 tracking-wider">
                            {animal.type === 'sheep' ? (isAmharic ? 'በግ' : 'Sheep') : animal.type === 'goat' ? (isAmharic ? 'ፍየል' : 'Goat') : (isAmharic ? 'ላም/በሬ' : 'Cow')}
                          </span>
                        </td>
                        <td className="py-3 px-3.5">{animal.gender === 'Male' ? (isAmharic ? 'ተባዕት' : 'Male') : (isAmharic ? 'አንስታይ' : 'Female')}</td>
                        <td className="py-3 px-3.5 font-bold">{formatWeight(animal.weight)}</td>
                        <td className={`py-3 px-3.5 font-bold ${isDark ? 'text-[#E0B15A]' : 'text-[#B8792F]'}`}>
                          {formatPrice(animal.price)}
                        </td>
                        <td className="py-3 px-3.5 font-mono text-xs">
                          {animal.quantity !== undefined ? (
                            animal.quantity > 0 ? (
                              <span className="text-emerald-500 font-bold">{animal.quantity} {isAmharic ? 'ራስ' : 'head'}</span>
                            ) : (
                              <span className="text-red-400 font-bold px-1.5 py-0.5 rounded bg-red-500/10 border border-red-500/20 text-[10px]">
                                0 ({isAmharic ? 'አልቋል' : 'Sold Out'})
                              </span>
                            )
                          ) : (
                            <span className="opacity-70 font-semibold">1 {isAmharic ? 'ራስ' : 'head'}</span>
                          )}
                        </td>
                        <td className="py-3 px-3.5">
                          <StatusBadge status={animal.status} size="sm" />
                        </td>
                        <td className="py-3 px-3.5 text-right">
                          <div className="inline-flex items-center justify-end gap-1.5 flex-wrap">
                            {/* If sold, provide instant 1-click Relist button */}
                            {animal.status === 'sold' && (
                              <button
                                type="button"
                                onClick={() => handleRelistAnimal(animal)}
                                className="px-2.5 py-1 rounded-lg text-[10.5px] font-bold bg-emerald-500 hover:bg-emerald-600 text-white shadow-xs flex items-center gap-1 cursor-pointer transition-all hover:scale-[1.02] active:scale-95"
                                title={isAmharic ? 'ከብቱን እንደገና ለሽያጭ ክፍት ያድርጉ' : 'Restock this animal to 1 head and set status to Available immediately'}
                              >
                                <RotateCcw className="w-3 h-3" />
                                <span>{isAmharic ? 'ለሽያጭ ክፈት' : 'Make Available'}</span>
                              </button>
                            )}

                            {/* Edit animal button */}
                            <button
                              type="button"
                              onClick={() => handleOpenEditAnimal(animal)}
                              className="px-2.5 py-1 rounded-lg text-[10.5px] font-bold bg-[#C18A45]/15 hover:bg-[#C18A45]/30 text-[#C18A45] border border-[#C18A45]/30 flex items-center gap-1 cursor-pointer transition-all hover:scale-[1.02] active:scale-95"
                              title={isAmharic ? 'የከብቱን ዝርዝር፣ ክብደት፣ ዋጋ ወይም ፎቶ ያርትዑ' : 'Edit livestock details, weight, price, photo, or availability'}
                            >
                              <Edit3 className="w-3 h-3" />
                              <span>{isAmharic ? 'አርትዕ' : 'Edit'}</span>
                            </button>

                            {/* Quick status toggles */}
                            <div className="inline-flex items-center gap-0.5 rounded-lg border p-0.5 border-black/10 dark:border-white/10">
                              <button
                                type="button"
                                onClick={() => handleToggleStatus(animal.id, 'available')}
                                disabled={animal.status === 'available'}
                                className="px-1.5 py-0.5 rounded text-[9.5px] font-semibold bg-green-500/20 text-green-400 hover:bg-green-500/30 disabled:opacity-25 cursor-pointer"
                                title={isAmharic ? 'ለሽያጭ ክፍት አድርግ' : 'Set Available'}
                              >
                                {isAmharic ? 'ክፍት' : 'Avail'}
                              </button>
                              <button
                                type="button"
                                onClick={() => handleToggleStatus(animal.id, 'reserved')}
                                disabled={animal.status === 'reserved'}
                                className="px-1.5 py-0.5 rounded text-[9.5px] font-semibold bg-amber-500/20 text-amber-400 hover:bg-amber-500/30 disabled:opacity-25 cursor-pointer"
                                title={isAmharic ? 'የተያዘ አድርግ' : 'Set Reserved (Hold)'}
                              >
                                {isAmharic ? 'የተያዘ' : 'Hold'}
                              </button>
                              <button
                                type="button"
                                onClick={() => handleToggleStatus(animal.id, 'sold')}
                                disabled={animal.status === 'sold'}
                                className="px-1.5 py-0.5 rounded text-[9.5px] font-semibold bg-stone-600/20 text-stone-400 hover:bg-stone-600/30 disabled:opacity-25 cursor-pointer"
                                title={isAmharic ? 'የተሸጠ አድርግ' : 'Set Sold'}
                              >
                                {isAmharic ? 'የተሸጠ' : 'Sold'}
                              </button>
                            </div>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
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
                  <Gift className="w-5 h-5 text-[#C18A45]" />
                  <h3 className="font-serif font-bold text-lg sm:text-xl">
                    {isAmharic ? 'የበዓላት እና የድግስ ጥቅሎች' : 'Holiday & Celebration Packages'} ({packagesList.length})
                  </h3>
                </div>
                <p className="text-xs opacity-75 max-w-xl">
                  {isAmharic
                    ? 'በመረጃ ቋት ውስጥ ያሉ የበዓላት ጥቅሎችን ያስተዳድሩ። ደንበኞች በዋናው ገጽ ላይ አይተው በ50% ቅድመ-ክፍያ ማዘዝ ወይም መያዝ ይችላሉ።'
                    : 'Manage festive celebration bundles in the PostgreSQL database. Customers view these bundles on the homepage and can order or reserve them with a 50% deposit.'}
                </p>
              </div>

              <button
                onClick={() => setIsAddPackageOpen(true)}
                className="flex items-center justify-center gap-2 px-5 py-3 rounded-2xl bg-[#C18A45] hover:bg-[#A06E35] text-white font-extrabold text-xs shadow-md transition-all cursor-pointer whitespace-nowrap"
              >
                <Plus className="w-4 h-4 stroke-[3]" />
                <span>{isAmharic ? 'አዲስ የበዓል ጥቅል ጨምር' : 'Add New Celebration Package'}</span>
              </button>
            </div>

            {isLoadingData && packagesList.length === 0 ? (
              <div className={`p-14 text-center rounded-3xl border animate-in fade-in duration-200 ${
                isDark ? 'bg-[#24170D] border-[#4A2C16]' : 'bg-white border-[#E4D4BC]'
              }`}>
                <div className="w-8 h-8 rounded-full border-2 border-amber-500 border-t-transparent animate-spin mx-auto mb-3" />
                <p className="text-xs font-semibold text-amber-500">
                  {isAmharic ? 'በመጫን ላይ...' : 'Loading...'}
                </p>
              </div>
            ) : packagesList.length === 0 ? (
              <div className={`p-12 text-center rounded-3xl border ${
                isDark ? 'bg-[#24170D] border-[#4A2C16]' : 'bg-white border-[#E4D4BC]'
              }`}>
                <Gift className="w-12 h-12 text-[#C18A45]/40 mx-auto mb-3" />
                <h4 className="font-serif font-bold text-base mb-1">
                  {isAmharic ? 'ምንም የበዓል ጥቅሎች አልተገኙም' : 'No Celebration Packages Found'}
                </h4>
                <p className="text-xs opacity-60 mb-4">
                  {isAmharic ? 'የመጀመሪያዎን የበዓል ጥቅል ለመፍጠር ከታች ያለውን ቁልፍ ይጫኑ።' : 'Click below to create your first holiday celebration package.'}
                </p>
                <button
                  onClick={() => setIsAddPackageOpen(true)}
                  className="px-4 py-2 rounded-xl bg-[#C18A45] hover:bg-[#A06E35] text-white font-bold text-xs"
                >
                  + {isAmharic ? 'ጥቅል ጨምር' : 'Add Package'}
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 items-start">
                {packagesList.map((pkg, pIdx) => {
                  const pkgKey = String(pkg.id || `pkg-${pIdx}`);
                  const isExpanded = Boolean(expandedPkgIds[pkgKey]);

                  return (
                    <div
                      key={pkgKey}
                      className={`group rounded-3xl border overflow-hidden flex flex-col justify-between transition-all duration-200 hover:shadow-xl ${
                        isDark ? 'bg-[#1F140A] border-[#4A2C16]' : 'bg-white border-[#E4D4BC]'
                      }`}
                    >
                      <div>
                        {/* Package Image & Badges */}
                        <div className="relative h-36 sm:h-40 w-full bg-black/20 overflow-hidden">
                          <img
                            src={pkg.image}
                            alt={pkg.name}
                            className="w-full h-full object-cover scale-105 group-hover:scale-100 transition-transform duration-500 ease-out"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                          
                          <div className="absolute top-2.5 left-2.5">
                            <span className="px-2.5 py-0.5 rounded-md text-[10.5px] font-bold bg-amber-500 text-black shadow-md">
                              {pkg.badge || (isAmharic ? 'የበዓል ጥቅል' : 'Holiday Package')}
                            </span>
                          </div>

                          <div className="absolute top-2.5 right-2.5 flex flex-col items-end gap-1">
                            {pkg.featured && (
                              <span className="px-2 py-0.5 rounded-md text-[9.5px] font-bold bg-emerald-500 text-white shadow-md">
                                {isAmharic ? 'ተመራጭ' : 'Featured'}
                              </span>
                            )}
                            {(() => {
                              const avail = pkg.availableSlots !== undefined ? pkg.availableSlots : 10;
                              const isOut = Boolean(pkg.isOutOfStock || avail <= 0);
                              if (isOut) {
                                return (
                                  <span className="px-2 py-0.5 rounded-md text-[9px] font-bold bg-red-600 text-white shadow-md animate-pulse">
                                    {isAmharic ? 'አልቋል' : 'OUT OF STOCK'}
                                  </span>
                                );
                              }
                              return (
                                <span className="px-2 py-0.5 rounded-md text-[9px] font-bold bg-black/75 text-emerald-300 border border-emerald-500/30">
                                  {avail} {isAmharic ? 'ክፍት ቦታ ቀርቷል' : 'Slots Left'}
                                </span>
                              );
                            })()}
                          </div>

                          <div className="absolute bottom-2.5 left-2.5 right-2.5 text-white">
                            <h4 className="font-serif font-bold text-sm sm:text-base line-clamp-1">
                              {isAmharic && pkg.amharicName ? pkg.amharicName : pkg.name}
                            </h4>
                            {pkg.amharicName && !isAmharic && (
                              <div className="text-[11px] text-amber-300 font-serif opacity-90 line-clamp-1">{pkg.amharicName}</div>
                            )}
                          </div>
                        </div>

                        {/* Content Details */}
                        <div className="p-3.5 sm:p-4 space-y-2.5">
                          {pkg.tagline && (
                            <div className="text-xs font-semibold text-amber-500 italic line-clamp-1">
                              "{pkg.tagline}"
                            </div>
                          )}

                          <p className="text-xs opacity-80 line-clamp-2 leading-relaxed">
                            {pkg.description}
                          </p>

                          {/* Included Contents Dropdown Button */}
                          <div className="space-y-1.5 pt-1">
                            <button
                              type="button"
                              onClick={() => {
                                setExpandedPkgIds(prev => ({
                                  ...prev,
                                  [pkgKey]: !prev[pkgKey]
                                }));
                              }}
                              className={`w-full py-1.5 px-3 rounded-xl border text-xs font-semibold flex items-center justify-between transition-all cursor-pointer ${
                                isExpanded
                                  ? 'bg-amber-500/15 border-amber-500/40 text-amber-500'
                                  : 'border-black/10 dark:border-white/10 hover:bg-black/5 dark:hover:bg-white/5 opacity-80 hover:opacity-100'
                              }`}
                            >
                              <span className="flex items-center gap-1.5 font-bold">
                                <span>{isAmharic ? 'የተካተቱ ዕቃዎች' : 'Included Items'} ({pkg.items?.length || 0})</span>
                                <span className="text-[10px] opacity-70 font-normal">• {pkg.categoryCount} {isAmharic ? 'ምድቦች' : 'Categories'}</span>
                              </span>
                              <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${
                                isExpanded ? 'rotate-180 text-amber-500' : ''
                              }`} />
                            </button>

                            {/* Expanded Dropdown Content */}
                            {isExpanded && (
                              <div className="space-y-1 pt-1 max-h-48 overflow-y-auto overscroll-contain animate-in fade-in zoom-in-95 duration-150">
                                {pkg.items?.map((item, idx) => (
                                  <div
                                    key={idx}
                                    className="text-[11px] px-2.5 py-1 rounded-lg bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 flex items-center justify-between gap-2"
                                  >
                                    <span className="font-medium truncate">• {item.name}</span>
                                    {item.price ? (
                                      <span className="font-mono text-[10px] opacity-70 shrink-0">{formatPrice(item.price)}</span>
                                    ) : null}
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>

                    {/* Slots Control & Restock Action */}
                    <div className="px-4 sm:px-5 py-2.5 border-t flex items-center justify-between border-black/5 dark:border-white/5 bg-black/[0.02] dark:bg-white/[0.02]">
                      <div className="flex items-center gap-2">
                        <span className="text-[11px] font-semibold opacity-70">{isAmharic ? 'የክምችት ክፍት ቦታዎች:' : 'Inventory Slots:'}</span>
                        <span className="font-mono font-bold text-xs text-amber-500">
                          {pkg.availableSlots !== undefined ? pkg.availableSlots : 10} / {pkg.totalSlots !== undefined ? pkg.totalSlots : 10}
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleOpenRestockModal(pkg)}
                        className="px-2.5 py-1 rounded-lg text-[10.5px] font-bold bg-amber-500/10 text-amber-500 border border-amber-500/30 hover:bg-amber-500 hover:text-black transition-all cursor-pointer"
                      >
                        {isAmharic ? 'ቦታዎችን አስተካክል' : 'Adjust / Restock'}
                      </button>
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
                            {isAmharic ? `ቅናሽ ${formatPrice(pkg.savings)}` : `Save ${formatPrice(pkg.savings)}`}
                          </div>
                        )}
                      </div>

                      <button
                        type="button"
                        onClick={() => handleDeletePackage(pkg.id, pkg.name)}
                        className="p-2.5 rounded-xl text-red-400 hover:bg-red-500/10 transition-colors cursor-pointer border border-red-500/20"
                        title={isAmharic ? 'ጥቅሉን ሰርዝ' : 'Delete Package'}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                );
              })}
              </div>
            )}
          </div>
        )}

        {/* ============================================================ */}
        {/* TAB 5: RAW MEAT (ስጋ በኪሎ) PRICING & ORDER MANAGEMENT */}
        {/* ============================================================ */}
        {activeTab === 'raw_meat' && (
          <div className="space-y-6 animate-in fade-in-50 duration-150">
            {/* Header with Quick Save */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="font-serif font-bold text-2xl flex items-center gap-2">
                  <Scale className="w-6 h-6 text-[#C18A45]" />
                  <span>{isAmharic ? 'የስጋ በኪሎ ዋጋ እና ትዕዛዝ አስተዳደር' : 'Raw Meat (የበሬ / ሰንጋ ስጋ በኪሎ) Administration'}</span>
                </h2>
                <p className="text-xs opacity-70 mt-1">
                  {isAmharic
                    ? 'ለተለያዩ የበሬ ስጋ አይነቶች ይፋዊ የኪሎ ዋጋ ያዘጋጁ። እነዚህ ዋጋዎች በደንበኞች ትዕዛዝ እና ክፍያ ላይ በቀጥታ ተግባራዊ ይሆናሉ።'
                    : 'Configure official price per KG for Ox/Beef cuts. These rates apply directly to customer order calculations and checkout.'}
                </p>
              </div>

              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={handleSaveMeatPricing}
                  disabled={isSavingMeatPricing}
                  className="px-5 py-2.5 rounded-xl bg-[#C18A45] hover:bg-[#A06E35] text-white font-bold text-xs shadow-md transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {isSavingMeatPricing ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      <span>{isAmharic ? 'ዋጋዎችን በማስቀመጥ ላይ...' : 'Saving Rates...'}</span>
                    </>
                  ) : (
                    <>
                      <Check className="w-3.5 h-3.5" />
                      <span>{isAmharic ? 'ዋጋዎችን አስቀምጥ & አትም' : 'Save & Publish Rates'}</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Quick Metrics Bar */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <div className={`p-4 rounded-2xl border ${isDark ? 'bg-[#2A1A0D] border-[#4A2C16]' : 'bg-[#F1E8D8] border-[#E4D4BC]'}`}>
                <span className="text-[11px] font-semibold uppercase tracking-wider opacity-70 block mb-1">
                  {isAmharic ? 'የስጋ ትዕዛዞች' : 'Meat Orders'}
                </span>
                <div className="text-xl font-serif font-extrabold text-[#C18A45]">
                  {ordersList.filter(o => (o.packageDetails as any)?.isMeatByKg).length} {isAmharic ? 'ትዕዛዞች' : 'Orders'}
                </div>
                <span className="text-[10px] opacity-60">{isAmharic ? 'በድረ-ገጽ የገቡ' : 'Submitted online'}</span>
              </div>

              <div className={`p-4 rounded-2xl border ${isDark ? 'bg-[#2A1A0D] border-[#4A2C16]' : 'bg-[#F1E8D8] border-[#E4D4BC]'}`}>
                <span className="text-[11px] font-semibold uppercase tracking-wider opacity-70 block mb-1">
                  {isAmharic ? 'የተሸጠ ጠቅላላ ኪሎ' : 'Total KG Sold'}
                </span>
                <div className="text-xl font-serif font-extrabold text-emerald-500">
                  {ordersList
                    .filter(o => (o.packageDetails as any)?.isMeatByKg)
                    .reduce((sum, o) => sum + ((o.packageDetails as any)?.kg || 0), 0)}{' '}
                  KG
                </div>
                <span className="text-[10px] opacity-60">{isAmharic ? 'በሁሉም የስጋ አይነቶች' : 'Across all ox cuts'}</span>
              </div>

              <div className={`p-4 rounded-2xl border ${isDark ? 'bg-[#2A1A0D] border-[#4A2C16]' : 'bg-[#F1E8D8] border-[#E4D4BC]'}`}>
                <span className="text-[11px] font-semibold uppercase tracking-wider opacity-70 block mb-1">
                  {isAmharic ? 'የስጋ ገቢ' : 'Meat Revenue'}
                </span>
                <div className="text-xl font-serif font-extrabold text-[#C18A45]">
                  {formatPrice(
                    ordersList
                      .filter(o => (o.packageDetails as any)?.isMeatByKg && (o.status === 'completed' || o.status === 'verified'))
                      .reduce((sum, o) => sum + (o.totalAmount || 0), 0)
                  )}
                </div>
                <span className="text-[10px] opacity-60">{isAmharic ? 'የተረጋገጠ ሽያጭ' : 'Verified sales'}</span>
              </div>

              <div className={`p-4 rounded-2xl border ${isDark ? 'bg-[#2A1A0D] border-[#4A2C16]' : 'bg-[#F1E8D8] border-[#E4D4BC]'}`}>
                <span className="text-[11px] font-semibold uppercase tracking-wider opacity-70 block mb-1">
                  {isAmharic ? 'የአገልግሎቱ ሁኔታ' : 'Service Status'}
                </span>
                <div className="text-lg font-bold">
                  {rawMeatPricing.available ? (
                    <span className="text-emerald-400 flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
                      {isAmharic ? 'ትዕዛዞችን ይቀበላል' : 'Accepting Orders'}
                    </span>
                  ) : (
                    <span className="text-rose-400">{isAmharic ? 'ለጊዜው ቆሟል' : 'Paused'}</span>
                  )}
                </div>
                <span className="text-[10px] opacity-60">{isAmharic ? 'የስጋ ትዕዛዝ መስኮት' : 'Ox/Beef orders live'}</span>
              </div>
            </div>

            {/* Cut Pricing Configuration Cards */}
            <div className={`p-6 rounded-3xl border ${isDark ? 'bg-[#2A1A0D] border-[#4A2C16]' : 'bg-[#F1E8D8] border-[#E4D4BC]'}`}>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 mb-6 border-b" style={{ borderColor: isDark ? '#4A2C16' : '#E4D4BC' }}>
                <div>
                  <h3 className="font-serif font-bold text-lg">
                    {isAmharic ? 'የበሬ ስጋ አይነቶች እና የኪሎ ዋጋ' : 'Ox / Beef Cut Rates (ዋጋ በኪሎ)'}
                  </h3>
                  <p className="text-xs opacity-70">
                    {isAmharic ? 'ለእያንዳንዱ የተለየ የስጋ አይነት የኪሎ ዋጋ ይወስኑ።' : 'Configure the price per KG for each specific culinary cut.'}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setRawMeatPricing({
                      ...rawMeatPricing,
                      kurtPrice: 2500,
                      kitfoPrice: 2200,
                      tibsWotPrice: 1800
                    });
                  }}
                  className="text-xs font-semibold text-amber-500 hover:underline mt-2 sm:mt-0 cursor-pointer"
                >
                  {isAmharic ? 'ወደ መደበኛ ዋጋዎች መልስ (2500 / 2200 / 1800)' : 'Reset to Default Rates (2500 / 2200 / 1800)'}
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* 1. Kurt Cut */}
                <div className={`p-5 rounded-2xl border ${isDark ? 'bg-[#1B1208] border-[#4A2C16]' : 'bg-white border-[#E4D4BC]'}`}>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-bold uppercase tracking-wider text-rose-400">
                      {isAmharic ? 'ለጥሬ (Kurt / Raw Cut)' : 'ለጥሬ (Kurt / Raw Cut)'}
                    </span>
                    <span className="text-xs px-2 py-0.5 rounded-full bg-rose-500/10 text-rose-400 font-bold border border-rose-500/20">
                      {isAmharic ? 'የላቀ ጥራት' : 'Top Grade'}
                    </span>
                  </div>
                  <p className="text-xs opacity-70 mb-4 leading-relaxed">
                    {isAmharic
                      ? 'እጅግ ትኩስ፣ ለስላሳ እና ለጥሬ ስጋ አፍቃሪዎች በጥንቃቄ የተመረጠ የበሬ ስጋ።'
                      : 'Ultra-fresh, tender, hand-selected ox beef cuts ideal for kurt connoisseurs and raw meat banquets.'}
                  </p>
                  <label className="block text-[11px] font-semibold opacity-80 mb-1.5">
                    {isAmharic ? 'ዋጋ በኪሎ (ብር)' : 'Price per KG (ETB / ብር)'}
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      min={500}
                      step={50}
                      value={rawMeatPricing.kurtPrice}
                      onChange={(e) =>
                        setRawMeatPricing({
                          ...rawMeatPricing,
                          kurtPrice: Math.max(0, Number(e.target.value))
                        })
                      }
                      className={`w-full px-3.5 py-2.5 rounded-xl text-sm font-bold border focus:outline-none focus:ring-2 focus:ring-amber-500 ${
                        isDark ? 'bg-[#2A1A0D] border-[#4A2C16] text-[#F4E8D0]' : 'bg-[#FAF7F0] border-[#E4D4BC] text-[#2A1A0D]'
                      }`}
                    />
                    <span className="absolute right-3.5 top-2.5 text-xs font-bold opacity-60">ETB</span>
                  </div>
                </div>

                {/* 2. Kitfo Cut */}
                <div className={`p-5 rounded-2xl border ${isDark ? 'bg-[#1B1208] border-[#4A2C16]' : 'bg-white border-[#E4D4BC]'}`}>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-bold uppercase tracking-wider text-amber-400">
                      {isAmharic ? 'ለክትፎ (Kitfo Cut)' : 'ለክትፎ (Kitfo Cut)'}
                    </span>
                    <span className="text-xs px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-400 font-bold border border-amber-500/20">
                      {isAmharic ? 'ቀይ ሙዳ ስጋ' : 'Lean & Mince'}
                    </span>
                  </div>
                  <p className="text-xs opacity-70 mb-4 leading-relaxed">
                    {isAmharic
                      ? 'ስብ የሌለው ቀይ ሙዳ ስጋ፣ ለባህላዊ ክትፎ እና ዱለት ድግስ የተዘጋጀ።'
                      : 'Lean red meat without fat or sinew, minced fresh or prepped for traditional kitfo and dulet banquets.'}
                  </p>
                  <label className="block text-[11px] font-semibold opacity-80 mb-1.5">
                    {isAmharic ? 'ዋጋ በኪሎ (ብር)' : 'Price per KG (ETB / ብር)'}
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      min={500}
                      step={50}
                      value={rawMeatPricing.kitfoPrice}
                      onChange={(e) =>
                        setRawMeatPricing({
                          ...rawMeatPricing,
                          kitfoPrice: Math.max(0, Number(e.target.value))
                        })
                      }
                      className={`w-full px-3.5 py-2.5 rounded-xl text-sm font-bold border focus:outline-none focus:ring-2 focus:ring-amber-500 ${
                        isDark ? 'bg-[#2A1A0D] border-[#4A2C16] text-[#F4E8D0]' : 'bg-[#FAF7F0] border-[#E4D4BC] text-[#2A1A0D]'
                      }`}
                    />
                    <span className="absolute right-3.5 top-2.5 text-xs font-bold opacity-60">ETB</span>
                  </div>
                </div>

                {/* 3. Tibs & Wot Cut */}
                <div className={`p-5 rounded-2xl border ${isDark ? 'bg-[#1B1208] border-[#4A2C16]' : 'bg-white border-[#E4D4BC]'}`}>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">
                      {isAmharic ? 'ለጥብስ እና ወጥ (Tibs & Wot Cut)' : 'ለጥብስ እና ወጥ (Tibs & Wot Cut)'}
                    </span>
                    <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 font-bold border border-emerald-500/20">
                      {isAmharic ? 'ለወጥ & ጥብስ' : 'Stew & Grill'}
                    </span>
                  </div>
                  <p className="text-xs opacity-70 mb-4 leading-relaxed">
                    {isAmharic
                      ? 'መጠነኛ ስብ ያለው ለባህላዊ የኢትዮጵያ ወጦች፣ ጥብስ እና ለድግስ ማዕድ የተቆራረጠ ስጋ።'
                      : 'Succulent cuts with balanced marbling, diced for traditional Ethiopian wots, tibs, and catering feasts.'}
                  </p>
                  <label className="block text-[11px] font-semibold opacity-80 mb-1.5">
                    {isAmharic ? 'ዋጋ በኪሎ (ብር)' : 'Price per KG (ETB / ብር)'}
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      min={500}
                      step={50}
                      value={rawMeatPricing.tibsWotPrice}
                      onChange={(e) =>
                        setRawMeatPricing({
                          ...rawMeatPricing,
                          tibsWotPrice: Math.max(0, Number(e.target.value))
                        })
                      }
                      className={`w-full px-3.5 py-2.5 rounded-xl text-sm font-bold border focus:outline-none focus:ring-2 focus:ring-amber-500 ${
                        isDark ? 'bg-[#2A1A0D] border-[#4A2C16] text-[#F4E8D0]' : 'bg-[#FAF7F0] border-[#E4D4BC] text-[#2A1A0D]'
                      }`}
                    />
                    <span className="absolute right-3.5 top-2.5 text-xs font-bold opacity-60">ETB</span>
                  </div>
                </div>
              </div>

              {/* General Settings */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6 pt-6 border-t" style={{ borderColor: isDark ? '#4A2C16' : '#E4D4BC' }}>
                <div>
                  <label className="block text-xs font-bold mb-2">
                    {isAmharic ? 'የጥራት ዋስትና እና የአገልግሎት ማስታወሻዎች' : 'Quality Guarantee & Service Notes'}
                  </label>
                  <textarea
                    rows={2}
                    value={rawMeatPricing.notes || ''}
                    onChange={(e) =>
                      setRawMeatPricing({
                        ...rawMeatPricing,
                        notes: e.target.value
                      })
                    }
                    placeholder={isAmharic ? 'ለምሳሌ: 100% ዋስትና ያለው ትኩስ የአዲስ አበባ ሰንጋ ስጋ በትዕዛዝዎ መሰረት ተዘጋጅቶ ይቀርባል።' : 'E.g., 100% Guaranteed Fresh Addis Ababa grass-fed fattened ox beef cuts prepared to order.'}
                    className={`w-full px-3.5 py-2.5 rounded-xl text-xs border focus:outline-none focus:ring-2 focus:ring-amber-500 ${
                      isDark ? 'bg-[#1B1208] border-[#4A2C16] text-[#F4E8D0]' : 'bg-[#FAF7F0] border-[#E4D4BC] text-[#2A1A0D]'
                    }`}
                  />
                </div>

                <div className="flex flex-col justify-between">
                  <div>
                    <label className="block text-xs font-bold mb-2">
                      {isAmharic ? 'የአገልግሎት አቅርቦት ሁኔታ' : 'Service Availability'}
                    </label>
                    <div className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        id="meatAvailableCheck"
                        checked={rawMeatPricing.available}
                        onChange={(e) =>
                          setRawMeatPricing({
                            ...rawMeatPricing,
                            available: e.target.checked
                          })
                        }
                        className="w-4 h-4 rounded text-amber-500 focus:ring-amber-500 cursor-pointer"
                      />
                      <label htmlFor="meatAvailableCheck" className="text-xs font-semibold cursor-pointer">
                        {isAmharic ? 'የስጋ በኪሎ የበይነመረብ ትዕዛዞችን ተቀበል (ለደንበኞች የማዘዣ ቁልፍ አሳይ)' : 'Accept Raw Meat Online Orders (Show order button to customers)'}
                      </label>
                    </div>
                  </div>

                  <div className="pt-3 flex justify-end">
                    <button
                      type="button"
                      onClick={handleSaveMeatPricing}
                      disabled={isSavingMeatPricing}
                      className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-black font-bold text-xs shadow transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                    >
                      {isSavingMeatPricing ? (
                        <>
                          <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                          <span>{isAmharic ? 'በማስቀመጥ ላይ...' : 'Saving...'}</span>
                        </>
                      ) : (
                        <>
                          <Check className="w-3.5 h-3.5" />
                          <span>{isAmharic ? 'ዋጋዎችን አስቀምጥ' : 'Save Pricing'}</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Live Price Calculator Preview */}
            <div className={`p-6 rounded-3xl border ${isDark ? 'bg-[#2A1A0D] border-[#4A2C16]' : 'bg-[#F1E8D8] border-[#E4D4BC]'}`}>
              <div className="flex items-center justify-between pb-3 mb-4 border-b" style={{ borderColor: isDark ? '#4A2C16' : '#E4D4BC' }}>
                <div className="flex items-center gap-2">
                  <Scale className="w-4 h-4 text-[#C18A45]" />
                  <h3 className="font-serif font-bold text-base">
                    {isAmharic ? 'የደንበኛ ሂሳብ ማስያ ማስመሰያ (Simulator)' : 'Live Customer Calculation Simulator'}
                  </h3>
                </div>
                <span className="text-[11px] opacity-70">{isAmharic ? 'ደንበኞች ምን ያህል እንደሚከፍሉ ይመልከቱ' : 'Verify what customers will be charged'}</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-center">
                <div>
                  <label className="block text-[11px] font-semibold opacity-80 mb-1">{isAmharic ? 'የስጋ አይነት ምረጥ' : 'Select Cut'}</label>
                  <select
                    value={testMeatCut}
                    onChange={(e) => setTestMeatCut(e.target.value as any)}
                    className={`w-full px-3 py-2 rounded-xl text-xs font-semibold border ${
                      isDark ? 'bg-[#1B1208] border-[#4A2C16] text-[#F4E8D0]' : 'bg-[#FAF7F0] border-[#E4D4BC] text-[#2A1A0D]'
                    }`}
                  >
                    <option value="kurt">{isAmharic ? 'ለጥሬ' : 'Kurt'} ({formatPrice(rawMeatPricing.kurtPrice)} / KG)</option>
                    <option value="kitfo">{isAmharic ? 'ለክትፎ' : 'Kitfo'} ({formatPrice(rawMeatPricing.kitfoPrice)} / KG)</option>
                    <option value="tibs_wot">{isAmharic ? 'ለጥብስ እና ወጥ' : 'Tibs & Wot'} ({formatPrice(rawMeatPricing.tibsWotPrice)} / KG)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold opacity-80 mb-1">{isAmharic ? 'መጠን በኪሎ' : 'Quantity in KG'}</label>
                  <input
                    type="number"
                    min={1}
                    max={200}
                    value={testMeatKg}
                    onChange={(e) => setTestMeatKg(Math.max(1, Number(e.target.value)))}
                    className={`w-full px-3 py-2 rounded-xl text-xs font-semibold border ${
                      isDark ? 'bg-[#1B1208] border-[#4A2C16] text-[#F4E8D0]' : 'bg-[#FAF7F0] border-[#E4D4BC] text-[#2A1A0D]'
                    }`}
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold opacity-80 mb-1">{isAmharic ? 'አቅርቦት' : 'Fulfillment'}</label>
                  <div className="flex items-center gap-2 pt-1.5">
                    <input
                      type="checkbox"
                      id="testDeliveryToggle"
                      checked={testIncludeDelivery}
                      onChange={(e) => setTestIncludeDelivery(e.target.checked)}
                      className="w-4 h-4 rounded text-amber-500 cursor-pointer"
                    />
                    <label htmlFor="testDeliveryToggle" className="text-xs cursor-pointer">
                      {isAmharic ? 'እስከ ደጃፍ ማድረሻ' : 'Doorstep Delivery'}
                    </label>
                  </div>
                </div>

                <div className={`p-4 rounded-xl border text-center ${
                  isDark ? 'bg-[#1B1208] border-[#4A2C16]' : 'bg-white border-[#E4D4BC]'
                }`}>
                  <span className="text-[10px] uppercase font-bold tracking-wider opacity-60 block">{isAmharic ? 'የተሰላ ጠቅላላ ዋጋ' : 'Calculated Total'}</span>
                  <div className="text-xl font-mono font-extrabold text-amber-500">
                    {formatPrice(
                      (testMeatCut === 'kurt'
                        ? rawMeatPricing.kurtPrice
                        : testMeatCut === 'kitfo'
                        ? rawMeatPricing.kitfoPrice
                        : rawMeatPricing.tibsWotPrice) * testMeatKg
                    )}
                  </div>
                  <span className="text-[10px] opacity-60">
                    {testMeatKg} KG × {formatPrice(
                      testMeatCut === 'kurt'
                        ? rawMeatPricing.kurtPrice
                        : testMeatCut === 'kitfo'
                        ? rawMeatPricing.kitfoPrice
                        : rawMeatPricing.tibsWotPrice
                    )}
                  </span>
                </div>
              </div>
            </div>

            {/* Raw Meat Orders List */}
            <div className={`rounded-3xl border overflow-hidden shadow-sm ${
              isDark ? 'bg-[#2A1A0D] border-[#4A2C16]' : 'bg-[#F1E8D8] border-[#E4D4BC]'
            }`}>
              <div className="p-4 border-b flex items-center justify-between" style={{ borderColor: isDark ? '#4A2C16' : '#E4D4BC' }}>
                <div>
                  <h3 className="font-serif font-bold text-base">{isAmharic ? 'የቅርብ ጊዜ የስጋ ትዕዛዞች' : 'Recent Raw Meat Orders'}</h3>
                  <p className="text-xs opacity-70">{isAmharic ? 'የበሬ ስጋ በኪሎ ያዘዙ እና ደረሰኝ ያስገቡ ደንበኞች።' : 'Customers who ordered beef cuts by KG with uploaded payment slips.'}</p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setActiveTab('orders');
                    setOrderStatusFilter('all');
                  }}
                  className="text-xs font-bold text-amber-500 hover:underline cursor-pointer"
                >
                  {isAmharic ? 'ሁሉንም ትዕዛዞች ይመልከቱ →' : 'View All Orders →'}
                </button>
              </div>

              {ordersList.filter(o => (o.packageDetails as any)?.isMeatByKg).length === 0 ? (
                <div className="p-8 text-center opacity-60 text-xs">
                  {isAmharic
                    ? 'ምንም የስጋ በኪሎ ትዕዛዝ አልተገኘም። ደንበኞች ስጋ በኪሎ ሲያዙ እዚህ እና በትዕዛዞች ገጽ ላይ ይታያሉ።'
                    : 'No raw meat orders received yet. When customers order ox cuts by KG, they will appear here and in the Orders tab.'}
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className={`border-b ${isDark ? 'border-[#4A2C16] text-[#D8C5A8]' : 'border-[#E4D4BC] text-[#746556]'}`}>
                        <th className="py-3 px-3.5 uppercase font-semibold">{isAmharic ? 'የትዕዛዝ መለያ' : 'Order ID'}</th>
                        <th className="py-3 px-3.5 uppercase font-semibold">{isAmharic ? 'ደንበኛ' : 'Customer'}</th>
                        <th className="py-3 px-3.5 uppercase font-semibold">{isAmharic ? 'የስጋ አይነት & ኪሎ' : 'Cut & KG'}</th>
                        <th className="py-3 px-3.5 uppercase font-semibold">{isAmharic ? 'ጠቅላላ ክፍያ' : 'Total Amount'}</th>
                        <th className="py-3 px-3.5 uppercase font-semibold">{isAmharic ? 'ደረሰኝ' : 'Slip'}</th>
                        <th className="py-3 px-3.5 uppercase font-semibold">{isAmharic ? 'ሁኔታ' : 'Status'}</th>
                        <th className="py-3 px-3.5 uppercase font-semibold text-right">{isAmharic ? 'እርምጃ' : 'Action'}</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y" style={{ borderColor: isDark ? '#4A2C16' : '#E4D4BC' }}>
                      {ordersList
                        .filter(o => (o.packageDetails as any)?.isMeatByKg)
                        .map(order => {
                          const details = (order.packageDetails as any) || {};
                          return (
                            <tr key={order.id} className="hover:bg-black/5 dark:hover:bg-white/5 transition-colors">
                              <td className="py-3 px-3.5 font-mono font-bold text-amber-500">
                                {order.id}
                                <span className="text-[10px] opacity-50 block font-normal">
                                  {new Date(order.createdAt).toLocaleDateString()}
                                </span>
                              </td>
                              <td className="py-3 px-3.5">
                                <strong className="block">{order.customerName}</strong>
                                <span className="text-[11px] opacity-70 block">{order.customerPhone}</span>
                                {order.deliveryLocation && (
                                  <span className="text-[10px] opacity-60 flex items-center gap-1 mt-0.5">
                                    <MapPin className="w-2.5 h-2.5 text-[#C18A45] shrink-0" />
                                    <span className="truncate">{order.deliveryLocation}</span>
                                  </span>
                                )}
                              </td>
                              <td className="py-3 px-3.5">
                                <span className="font-bold text-rose-400 block">
                                  {details.cut || (isAmharic ? 'የበሬ ስጋ' : 'Ox Cut')}
                                </span>
                                <span className="font-mono text-[11px] opacity-75">
                                  {details.weightKg || details.kg || 1} kg
                                </span>
                              </td>
                              <td className="py-3 px-3.5 font-mono font-bold text-[#C18A45]">
                                {formatPrice(order.totalAmount)}
                              </td>
                              <td className="py-3 px-3.5">
                                {order.paymentSlipUrl ? (
                                  <button
                                    type="button"
                                    onClick={() => setSelectedSlipOrder(order)}
                                    className="px-2 py-1 rounded bg-[#C18A45]/15 text-[#C18A45] font-bold text-[10px] hover:bg-[#C18A45]/25 flex items-center gap-1 cursor-pointer"
                                  >
                                    <Eye className="w-3 h-3" />
                                    <span>{isAmharic ? 'ደረሰኝ' : 'Slip'}</span>
                                  </button>
                                ) : (
                                  <span className="opacity-40 text-[11px]">-</span>
                                )}
                              </td>
                              <td className="py-3 px-3.5">
                                {order.status === 'delivered' ? (
                                  <span className="text-emerald-400 bg-emerald-500/15 border border-emerald-500/25 px-2 py-0.5 rounded text-[10px] font-bold inline-flex items-center gap-1">
                                    <CheckCircle2 className="w-3 h-3" />
                                    <span>{isAmharic ? 'ደርሷል' : 'Delivered'}</span>
                                  </span>
                                ) : order.status === 'delivery_pending' ? (
                                  <span className="text-purple-400 bg-purple-500/15 border border-purple-500/25 px-2 py-0.5 rounded text-[10px] font-bold inline-flex items-center gap-1">
                                    <Truck className="w-3 h-3" />
                                    <span>{isAmharic ? 'በጉዞ ላይ' : 'In Transit'}</span>
                                  </span>
                                ) : order.status === 'verified' ? (
                                  <span className="text-blue-400 bg-blue-500/15 border border-blue-500/25 px-2 py-0.5 rounded text-[10px] font-bold">
                                    {isAmharic ? 'የተረጋገጠ' : 'Verified'}
                                  </span>
                                ) : order.status === 'rejected' ? (
                                  <span className="text-red-400 bg-red-500/15 border border-red-500/25 px-2 py-0.5 rounded text-[10px] font-bold">
                                    {isAmharic ? 'ውድቅ የተደረገ' : 'Rejected'}
                                  </span>
                                ) : (
                                  <span className="text-amber-400 bg-amber-500/15 border border-amber-500/25 px-2 py-0.5 rounded text-[10px] font-bold animate-pulse">
                                    {isAmharic ? 'በመጠባበቅ ላይ' : 'Pending'}
                                  </span>
                                )}
                              </td>
                              <td className="py-3 px-3.5 text-right">
                                <div className="inline-flex items-center justify-end gap-1.5">
                                  {order.status === 'pending_verification' && (
                                    <button
                                      type="button"
                                      onClick={() => handleVerifyOrder(order.id)}
                                      className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[11px] shadow transition-all flex items-center gap-1 cursor-pointer"
                                    >
                                      <Check className="w-3 h-3" />
                                      <span>{isAmharic ? 'አጽድቅ' : 'Approve'}</span>
                                    </button>
                                  )}
                                  {order.isDelivery ? (
                                    <>
                                      {order.status === 'verified' && (
                                        <button
                                          type="button"
                                          onClick={() => handleApproveDelivery(order.id, 'delivery_pending')}
                                          className="px-2.5 py-1 rounded-lg bg-amber-500 hover:bg-amber-600 text-black font-bold text-[11px] shadow transition-all flex items-center gap-1 cursor-pointer"
                                          title={isAmharic ? 'ተሽከርካሪ ላክ (በጉዞ ላይ አድርግ)' : 'Dispatch delivery'}
                                        >
                                          <Truck className="w-3 h-3" />
                                          <span>{isAmharic ? 'ላክ' : 'Dispatch'}</span>
                                        </button>
                                      )}
                                      {order.status === 'delivery_pending' && (
                                        <button
                                          type="button"
                                          onClick={() => handleApproveDelivery(order.id, 'delivered')}
                                          className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[11px] shadow transition-all flex items-center gap-1 cursor-pointer"
                                          title={isAmharic ? 'ደርሷል ምልክት አድርግ (አጠናቅቅ)' : 'Mark Delivered (Complete)'}
                                        >
                                          <Check className="w-3 h-3" />
                                          <span>{isAmharic ? 'ደርሷል' : 'Delivered'}</span>
                                        </button>
                                      )}
                                    </>
                                  ) : (
                                    <>
                                      {order.status === 'verified' && (
                                        <button
                                          type="button"
                                          onClick={() => handleUpdatePickupStatus(order.id, 'pickup_ready')}
                                          className="px-2.5 py-1 rounded-lg bg-blue-500 hover:bg-blue-600 text-white font-bold text-[11px] shadow transition-all flex items-center gap-1 cursor-pointer"
                                          title={isAmharic ? 'ለእርሻ ርክክብ ዝግጁ አድርግ' : 'Ready for Pickup'}
                                        >
                                          <Package className="w-3 h-3" />
                                          <span>{isAmharic ? 'ለርክክብ ዝግጁ' : 'Ready'}</span>
                                        </button>
                                      )}
                                      {order.status === 'pickup_ready' && (
                                        <button
                                          type="button"
                                          onClick={() => handleUpdatePickupStatus(order.id, 'completed')}
                                          className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[11px] shadow transition-all flex items-center gap-1 cursor-pointer"
                                          title={isAmharic ? 'ደንበኛ ተረክቧል፣ ግብይት አጠናቅቅ' : 'Customer Picked Up (Complete)'}
                                        >
                                          <Check className="w-3 h-3" />
                                          <span>{isAmharic ? 'ተረክበዋል' : 'Picked Up'}</span>
                                        </button>
                                      )}
                                    </>
                                  )}
                                  {order.paymentSlipUrl && (
                                    <button
                                      type="button"
                                      onClick={() => setSelectedSlipOrder(order)}
                                      className="p-1 rounded-lg bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10 text-[11px] font-bold transition-colors cursor-pointer"
                                      title={isAmharic ? 'የክፍያ ደረሰኝ ይመልከቱ' : 'View payment slip'}
                                    >
                                      <Eye className="w-3.5 h-3.5" />
                                    </button>
                                  )}
                                </div>
                              </td>
                            </tr>
                          );
                        })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ============================================================ */}
        {/* TAB 6: DELIVERY & FLEET LOGISTICS */}
        {/* ============================================================ */}
        {activeTab === 'delivery' && (
          <div className="space-y-6 animate-in fade-in-50 duration-150">
            {/* 1. Header & Live Refresh */}
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h2 className="text-xl sm:text-2xl font-bold font-serif flex items-center gap-2">
                    <Truck className="w-6 h-6 text-[#C18A45]" />
                    <span>
                      {deliverySubTab === 'orders'
                        ? (isAmharic ? 'የማድረሻ ትዕዛዞች እና መላኪያ ቁጥጥር' : 'Delivery Orders Queue & Dispatch Control')
                        : (isAmharic ? 'የማድረሻ እና የትራንስፖርት መርከብ አስተዳደር' : 'Delivery & Fleet Logistics Management')}
                    </span>
                  </h2>
                  <p className="text-xs opacity-75 mt-0.5">
                    {deliverySubTab === 'orders'
                      ? (isAmharic
                          ? 'የደንበኞች የእስከ ደጃፍ ማድረሻ ትዕዛዞች፣ የጉዞ መስመር ክትትል፣ የደረሰኝ ምርመራ እና የተሽከርካሪ መላኪያ።'
                          : 'Live doorstep customer delivery orders queue, route tracking, payment slip reviews, and vehicle dispatching.')
                      : (isAmharic
                          ? 'የመንገድ ርቀት ስሌት (OSRM ሞተር)፣ የተሽከርካሪ አቅም ማረጋገጫ፣ ተለዋዋጭ ዋጋዎች እና የእርሻ መላኪያ ማዕከል ቅንብሮች።'
                          : 'Live road distance calculation (OSRM engine), vehicle capacity validation, dynamic rates, and farm origin settings.')}
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={loadDashboardData}
                    className="px-3.5 py-2 rounded-xl border border-black/10 dark:border-white/10 hover:bg-black/5 dark:hover:bg-white/5 text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer"
                  >
                    <RefreshCw className="w-3.5 h-3.5 text-[#C18A45]" />
                    <span>{isAmharic ? 'መረጃ አድስ' : 'Refresh Data'}</span>
                  </button>
                </div>
              </div>

              {/* Top Category Switcher: Two Separate Dashboards */}
              <div
                className={`inline-flex p-1 rounded-xl border items-center gap-1 w-full sm:w-auto ${
                  isDark ? 'bg-[#1E140A] border-[#3D2513]' : 'bg-[#F4ECE1] border-[#E4D4BC]'
                }`}
              >
                <button
                  type="button"
                  onClick={() => setDeliverySubTab('orders')}
                  className={`flex-1 sm:flex-initial flex items-center justify-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    deliverySubTab === 'orders'
                      ? 'bg-[#C18A45] text-white shadow-xs font-bold'
                      : isDark
                      ? 'hover:bg-black/20 text-[#D8C5A8] opacity-80 hover:opacity-100'
                      : 'hover:bg-white/60 text-[#746556] opacity-80 hover:opacity-100'
                  }`}
                >
                  <Truck className="w-3.5 h-3.5 shrink-0" />
                  <span>{isAmharic ? 'የማድረሻ ትዕዛዞች እና መላኪያ' : 'Delivery Orders Queue & Dispatch'}</span>
                  <span
                    className={`ml-1.5 px-1.5 py-0.5 rounded text-[10px] font-mono font-bold shrink-0 ${
                      deliverySubTab === 'orders'
                        ? 'bg-black/25 text-white'
                        : 'bg-black/5 dark:bg-white/10 opacity-75'
                    }`}
                  >
                    {
                      ordersList.filter(
                        (o) =>
                          o.isDelivery ||
                          o.deliveryAddress ||
                          (o.deliveryLocation && !o.deliveryLocation.includes('Self Pickup'))
                      ).length
                    }
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => setDeliverySubTab('logistics')}
                  className={`flex-1 sm:flex-initial flex items-center justify-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    deliverySubTab === 'logistics'
                      ? 'bg-[#C18A45] text-white shadow-xs font-bold'
                      : isDark
                      ? 'hover:bg-black/20 text-[#D8C5A8] opacity-80 hover:opacity-100'
                      : 'hover:bg-white/60 text-[#746556] opacity-80 hover:opacity-100'
                  }`}
                >
                  <Settings className="w-3.5 h-3.5 shrink-0" />
                  <span>{isAmharic ? 'የትራንስፖርት መርከብ እና ዋጋዎች' : 'Fleet Logistics & Rates Management'}</span>
                  <span
                    className={`ml-1.5 px-1.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider shrink-0 ${
                      deliverySubTab === 'logistics'
                        ? 'bg-black/25 text-white'
                        : 'bg-black/5 dark:bg-white/10 opacity-75'
                    }`}
                  >
                    {deliveryVehicles.filter((v) => v.active !== false).length} {isAmharic ? 'ተሽከርካሪዎች' : 'Vehicles'}
                  </span>
                </button>
              </div>
            </div>

            {/* ============================================================ */}
            {/* SUB-DASHBOARD 1: DELIVERY ORDERS QUEUE & DISPATCH CONTROL */}
            {/* ============================================================ */}
            {deliverySubTab === 'orders' && (
              <div className="space-y-6 animate-in fade-in-50 duration-150">
                {/* 4 KPIs Metric Cards */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
                  <div
                    className={`p-4 rounded-2xl border ${
                      isDark ? 'bg-[#24170D] border-[#4A2C16]' : 'bg-[#FAF7F0] border-[#E4D4BC]'
                    }`}
                  >
                    <div className="flex items-center justify-between text-xs opacity-70 mb-1">
                      <span>{isAmharic ? 'መላክ የሚጠበቅባቸው' : 'Pending Dispatch'}</span>
                      <Clock className="w-4 h-4 text-[#C18A45]" />
                    </div>
                    <div className="text-2xl font-serif font-bold text-[#C18A45]">
                      {
                        ordersList.filter(
                          (o) =>
                            o.isDelivery &&
                            (o.status === 'pending_verification' || o.status === 'verified')
                        ).length
                      }
                    </div>
                    <p className="text-[10px] opacity-60 mt-1">{isAmharic ? 'ተሽከርካሪ የሚጠብቁ' : 'Awaiting vehicle dispatch'}</p>
                  </div>

                  <div
                    className={`p-4 rounded-2xl border ${
                      isDark ? 'bg-[#24170D] border-[#4A2C16]' : 'bg-[#FAF7F0] border-[#E4D4BC]'
                    }`}
                  >
                    <div className="flex items-center justify-between text-xs opacity-70 mb-1">
                      <span>{isAmharic ? 'በጉዞ ላይ / የተላኩ' : 'In Transit / Dispatched'}</span>
                      <Truck className="w-4 h-4 text-[#C18A45]" />
                    </div>
                    <div className="text-2xl font-serif font-bold text-[#C18A45]">
                      {ordersList.filter((o) => o.isDelivery && o.status === 'delivery_pending').length}
                    </div>
                    <p className="text-[10px] opacity-60 mt-1">{isAmharic ? 'በመንገድ ላይ ያሉ ተሽከርካሪዎች' : 'Vehicles en route'}</p>
                  </div>

                  <div
                    className={`p-4 rounded-2xl border ${
                      isDark ? 'bg-[#24170D] border-[#4A2C16]' : 'bg-[#FAF7F0] border-[#E4D4BC]'
                    }`}
                  >
                    <div className="flex items-center justify-between text-xs opacity-70 mb-1">
                      <span>{isAmharic ? 'የደረሱ' : 'Delivered'}</span>
                      <CheckCircle2 className="w-4 h-4 text-[#C18A45]" />
                    </div>
                    <div className="text-2xl font-serif font-bold text-[#C18A45]">
                      {ordersList.filter((o) => o.isDelivery && o.status === 'delivered').length}
                    </div>
                    <p className="text-[10px] opacity-60 mt-1">{isAmharic ? 'የተጠናቀቁ ማድረሻዎች' : 'Completed door deliveries'}</p>
                  </div>

                  <div
                    className={`p-4 rounded-2xl border ${
                      isDark ? 'bg-[#24170D] border-[#4A2C16]' : 'bg-[#FAF7F0] border-[#E4D4BC]'
                    }`}
                  >
                    <div className="flex items-center justify-between text-xs opacity-70 mb-1">
                      <span>{isAmharic ? 'የማድረሻ ገቢ' : 'Delivery Revenue'}</span>
                      <DollarSign className="w-4 h-4 text-[#C18A45]" />
                    </div>
                    <div className="text-2xl font-mono font-bold text-[#C18A45]">
                      {formatPrice(
                        ordersList
                          .filter((o) => o.isDelivery && o.status !== 'rejected')
                          .reduce((sum, o) => sum + (Number(o.deliveryFee) || 0), 0)
                      )}
                    </div>
                    <p className="text-[10px] opacity-60 mt-1">{isAmharic ? 'የተሰበሰበ የማድረሻ ክፍያ' : 'Total collected delivery fees'}</p>
                  </div>
                </div>

                {/* Live Delivery Orders Dispatch Queue */}
                <div
                  className={`p-5 sm:p-6 rounded-3xl border space-y-4 ${
                    isDark ? 'bg-[#1E140A] border-[#3D2513]' : 'bg-white border-[#E8DCCB]'
                  }`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-black/10 dark:border-white/10">
                    <div>
                      <h3 className="text-base font-serif font-bold flex items-center gap-2">
                        <Truck className="w-4 h-4 text-[#C18A45]" />
                        <span>{isAmharic ? 'የማድረሻ ትዕዛዞች እና መላኪያ ቁጥጥር' : 'Delivery Orders Queue & Dispatch Control'}</span>
                      </h3>
                      <p className="text-xs opacity-70 mt-0.5">
                        {isAmharic
                          ? 'የእስከ ደጃፍ ማድረሻ የተጠየቀባቸው ትዕዛዞች እና የተመደቡ ተሽከርካሪዎች።'
                          : 'Orders with customer doorstep delivery requests and assigned vehicles.'}
                      </p>
                    </div>

                    {/* Filter Pills */}
                    <div className="flex items-center gap-1.5 p-1 rounded-xl bg-black/5 dark:bg-white/5 self-start sm:self-auto">
                      {(['all', 'pending', 'in_transit', 'delivered'] as const).map((filterKey) => (
                        <button
                          key={filterKey}
                          type="button"
                          onClick={() => setDeliveryOrderFilter(filterKey)}
                          className={`px-3 py-1 rounded-lg text-xs font-bold transition-all capitalize cursor-pointer ${
                            deliveryOrderFilter === filterKey
                              ? 'bg-[#C18A45] text-white shadow-xs'
                              : 'opacity-70 hover:opacity-100'
                          }`}
                        >
                          {filterKey === 'all'
                            ? (isAmharic ? 'ሁሉም' : 'All')
                            : filterKey === 'pending'
                            ? (isAmharic ? 'የሚጠበቁ' : 'Pending')
                            : filterKey === 'in_transit'
                            ? (isAmharic ? 'በጉዞ ላይ' : 'In Transit')
                            : (isAmharic ? 'የደረሱ' : 'Delivered')}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Delivery Orders Table */}
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead>
                        <tr className="border-b border-black/10 dark:border-white/10 text-[11px] uppercase tracking-wider opacity-60">
                          <th className="pb-3 pr-2">{isAmharic ? 'የትዕዛዝ መለያ & ቀን' : 'Order ID & Date'}</th>
                          <th className="pb-3 px-2">{isAmharic ? 'ደንበኛ' : 'Customer'}</th>
                          <th className="pb-3 px-2">{isAmharic ? 'የማድረሻ አድራሻ' : 'Destination Address'}</th>
                          <th className="pb-3 px-2">{isAmharic ? 'የተመደበ ተሽከርካሪ' : 'Assigned Vehicle'}</th>
                          <th className="pb-3 px-2">{isAmharic ? 'የማድረሻ ክፍያ' : 'Delivery Fee'}</th>
                          <th className="pb-3 px-2">{isAmharic ? 'ሁኔታ' : 'Status'}</th>
                          <th className="pb-3 pl-2 text-right">{isAmharic ? 'የመላክ እርምጃዎች' : 'Dispatch Actions'}</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-black/5 dark:divide-white/5">
                        {isLoadingData && ordersList.length === 0 ? (
                          <tr>
                            <td colSpan={7} className="text-center py-12">
                              <div className="flex flex-col items-center justify-center gap-2 animate-in fade-in duration-200">
                                <div className="w-8 h-8 rounded-full border-2 border-amber-500 border-t-transparent animate-spin" />
                                <span className="text-xs font-semibold text-amber-500">
                                  {isAmharic ? 'በመጫን ላይ...' : 'Loading...'}
                                </span>
                              </div>
                            </td>
                          </tr>
                        ) : (() => {
                          const deliveryOrdersList = ordersList.filter((o) => {
                            const hasDelivery = Boolean(
                              o.isDelivery ||
                                o.deliveryAddress ||
                                (o.deliveryLocation && !o.deliveryLocation.includes('Self Pickup'))
                            );
                            if (!hasDelivery) return false;

                            if (deliveryOrderFilter === 'pending') {
                              return o.status === 'pending_verification' || o.status === 'verified';
                            } else if (deliveryOrderFilter === 'in_transit') {
                              return o.status === 'delivery_pending';
                            } else if (deliveryOrderFilter === 'delivered') {
                              return o.status === 'delivered';
                            }
                            return true;
                          });

                          if (deliveryOrdersList.length === 0) {
                            return (
                              <tr>
                                <td colSpan={7} className="text-center py-8 opacity-60">
                                  {isAmharic ? 'ምንም የማድረሻ ትዕዛዝ አልተገኘም' : 'No delivery orders found matching filter'}
                                </td>
                              </tr>
                            );
                          }

                          return deliveryOrdersList.map((order) => (
                            <tr key={order.id} className="hover:bg-black/[0.02] dark:hover:bg-white/[0.02]">
                              <td className="py-3 pr-2">
                                <div className="font-mono font-bold text-xs text-[#C18A45]">#{order.id}</div>
                                <div className="text-[10px] opacity-60 mt-0.5">
                                  {new Date(order.createdAt).toLocaleDateString()}
                                </div>
                              </td>

                              <td className="py-3 px-2">
                                <div className="font-bold">{order.customerName}</div>
                                {order.customerPhone && (
                                  <a
                                    href={`tel:${order.customerPhone}`}
                                    className="text-[11px] opacity-75 hover:underline font-mono"
                                  >
                                    {order.customerPhone}
                                  </a>
                                )}
                              </td>

                              <td className="py-3 px-2 max-w-[200px]">
                                <div
                                  className="truncate font-medium flex items-center gap-1"
                                  title={order.deliveryAddress || order.deliveryLocation}
                                >
                                  <MapPin className="w-3 h-3 text-[#C18A45] shrink-0" />
                                  <span className="truncate">
                                    {order.deliveryAddress || order.deliveryLocation || (isAmharic ? 'አዲስ አበባ' : 'Addis Ababa')}
                                  </span>
                                </div>
                                {order.distanceKm && (
                                  <div className="text-[10px] opacity-60 font-mono">
                                    {isAmharic ? 'የመንገድ ርቀት' : 'Road Distance'}: {order.distanceKm} KM
                                  </div>
                                )}
                              </td>

                              <td className="py-3 px-2">
                                <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-amber-500/15 text-amber-400 border border-amber-500/25">
                                  {order.vehicleType || (isAmharic ? 'መኪና / ፒክአፕ' : 'Car / Pickup')}
                                </span>
                              </td>

                              <td className="py-3 px-2 font-mono font-bold text-[#C18A45]">
                                {formatPrice(order.deliveryFee || 0)}
                              </td>

                              <td className="py-3 px-2">
                                {order.status === 'pending_verification' && (
                                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/15 text-amber-400 border border-amber-500/25 animate-pulse">
                                    {isAmharic ? 'ደረሰኝ መመርመር' : 'Slip Review'}
                                  </span>
                                )}
                                {order.status === 'verified' && (
                                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-500/15 text-blue-400 border border-blue-500/25">
                                    {isAmharic ? 'ለመላክ ዝግጁ' : 'Ready to Dispatch'}
                                  </span>
                                )}
                                {order.status === 'delivery_pending' && (
                                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-purple-500/15 text-purple-400 border border-purple-500/25 inline-flex items-center gap-1">
                                    <Truck className="w-3 h-3" />
                                    <span>{isAmharic ? 'በጉዞ ላይ' : 'In Transit'}</span>
                                  </span>
                                )}
                                {order.status === 'delivered' && (
                                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/25 inline-flex items-center gap-1">
                                    <CheckCircle2 className="w-3 h-3" />
                                    <span>{isAmharic ? 'ደርሷል' : 'Delivered'}</span>
                                  </span>
                                )}
                              </td>

                              <td className="py-3 pl-2 text-right">
                                <div className="inline-flex items-center justify-end gap-1.5">
                                  {order.status === 'pending_verification' && (
                                    <button
                                      type="button"
                                      onClick={() => handleVerifyOrder(order.id)}
                                      className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[11px] shadow transition-all flex items-center gap-1 cursor-pointer"
                                      title={isAmharic ? 'ደረሰኝ አረጋግጥ' : 'Verify Slip'}
                                    >
                                      <Check className="w-3 h-3" />
                                      <span>{isAmharic ? 'አረጋግጥ' : 'Verify'}</span>
                                    </button>
                                  )}

                                  {order.status === 'verified' && (
                                    <button
                                      type="button"
                                      onClick={() => handleApproveDelivery(order.id, 'delivery_pending')}
                                      className="px-2.5 py-1 rounded-lg bg-amber-500 hover:bg-amber-600 text-black font-bold text-[11px] shadow transition-all flex items-center gap-1 cursor-pointer"
                                      title={isAmharic ? 'አጽድቅ እና ለመላክ አዘጋጅ (በጉዞ ላይ)' : 'Approve and dispatch delivery'}
                                    >
                                      <Truck className="w-3 h-3" />
                                      <span>{isAmharic ? 'ላክ' : 'Dispatch'}</span>
                                    </button>
                                  )}

                                  {order.status === 'delivery_pending' && (
                                    <button
                                      type="button"
                                      onClick={() => handleApproveDelivery(order.id, 'delivered')}
                                      className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[11px] shadow transition-all flex items-center gap-1 cursor-pointer"
                                      title={isAmharic ? 'ለደንበኛ መድረሱን ያረጋግጡ እና አጠናቅቅ' : 'Confirm delivery to customer door & complete'}
                                    >
                                      <Check className="w-3 h-3" />
                                      <span>{isAmharic ? 'ደርሷል' : 'Delivered'}</span>
                                    </button>
                                  )}

                                  {order.paymentSlipUrl && (
                                    <button
                                      type="button"
                                      onClick={() => setSelectedSlipOrder(order)}
                                      className="p-1 rounded-lg bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10 text-[11px] font-bold transition-colors cursor-pointer"
                                      title={isAmharic ? 'የክፍያ ደረሰኝ ይመልከቱ' : 'View payment slip'}
                                    >
                                      <Eye className="w-3.5 h-3.5" />
                                    </button>
                                  )}
                                </div>
                              </td>
                            </tr>
                          ));
                        })()}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {/* ============================================================ */}
            {/* SUB-DASHBOARD 2: DELIVERY & FLEET LOGISTICS MANAGEMENT */}
            {/* ============================================================ */}
            {deliverySubTab === 'logistics' && (
              <div className="space-y-8 animate-in fade-in-50 duration-150">
                {/* 1. Fleet Vehicle Rates & Capacity Limits (Editable Config Table) */}
                <div
                  className={`p-5 sm:p-6 rounded-3xl border space-y-4 ${
                    isDark ? 'bg-[#1E140A] border-[#3D2513]' : 'bg-white border-[#E8DCCB]'
                  }`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-black/10 dark:border-white/10">
                    <div>
                      <h3 className="text-base font-serif font-bold flex items-center gap-2">
                        <Car className="w-4 h-4 text-[#C18A45]" />
                        <span>{isAmharic ? 'የተሽከርካሪ ዓይነቶች፣ ዋጋዎች እና የመጫን አቅም' : 'Fleet Vehicle Types, Rates & Load Limits'}</span>
                      </h3>
                      <p className="text-xs opacity-70 mt-0.5">
                        {isAmharic
                          ? 'የተለያዩ ምርቶች የመጫን ደንቦች፡ ከብት፣ በግ፣ ዶሮ እና የኪሎ ገደብ ከራስ-ሰር የተሽከርካሪ ምክር ጋር።'
                          : 'Multi-product capacity rules: Cattle, sheep, chickens, and KG limits with automated vehicle recommendation.'}
                      </p>
                    </div>

                    <button
                      type="button"
                      disabled={isSavingDeliveryVehicles}
                      onClick={handleSaveDeliveryVehicles}
                      className="px-4 py-2 rounded-xl bg-[#C18A45] hover:bg-[#A06E35] disabled:opacity-50 text-white font-bold text-xs shadow transition-all flex items-center gap-1.5 cursor-pointer self-start sm:self-auto"
                    >
                      {isSavingDeliveryVehicles ? (
                        <>
                          <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                          <span>{isAmharic ? 'የመርከብ ዋጋዎችን በማስቀመጥ ላይ...' : 'Saving Fleet Rates...'}</span>
                        </>
                      ) : (
                        <>
                          <Check className="w-3.5 h-3.5" />
                          <span>{isAmharic ? 'የተሽከርካሪ መርከብ ዋጋዎችን መዝግብ' : 'Save Vehicle Fleet Rates'}</span>
                        </>
                      )}
                    </button>
                  </div>

                  {/* Responsive Vehicle Config Table */}
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead>
                        <tr className="border-b border-black/10 dark:border-white/10 text-[11px] uppercase tracking-wider opacity-60">
                          <th className="pb-3 pr-3">{isAmharic ? 'ተሽከርካሪ' : 'Vehicle'}</th>
                          <th className="pb-3 px-2">{isAmharic ? 'መነሻ ክፍያ (ብር)' : 'Base Fee (ETB)'}</th>
                          <th className="pb-3 px-2">{isAmharic ? 'ተመን (ብር / ኪ.ሜ)' : 'Rate (ETB / KM)'}</th>
                          <th className="pb-3 px-2">{isAmharic ? 'ከፍተኛ በግ / ፍየል' : 'Max Sheep / Goats'}</th>
                          <th className="pb-3 px-2">{isAmharic ? 'ከፍተኛ በሬ / ከብት' : 'Max Cattle / Ox'}</th>
                          <th className="pb-3 px-2">{isAmharic ? 'ከፍተኛ ዶሮ' : 'Max Chickens'}</th>
                          <th className="pb-3 px-2">{isAmharic ? 'ከፍተኛ ክብደት (ኪሎ)' : 'Max Weight (KG)'}</th>
                          <th className="pb-3 pl-2 text-right">{isAmharic ? 'ሁኔታ' : 'Status'}</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-black/5 dark:divide-white/5">
                        {deliveryVehicles.map((veh, idx) => (
                          <tr key={veh.id} className="hover:bg-black/[0.02] dark:hover:bg-white/[0.02]">
                            <td className="py-3.5 pr-3">
                              <div className="font-bold text-sm flex items-center gap-2">
                                <span>{isAmharic ? (veh.amharicName || veh.name) : veh.name}</span>
                                <span className="text-[10px] font-mono opacity-60 uppercase bg-black/10 dark:bg-white/10 px-1.5 py-0.5 rounded">
                                  {veh.id}
                                </span>
                              </div>
                              <div className="text-[11px] opacity-70 mt-0.5">{isAmharic ? veh.name : veh.amharicName}</div>
                              <div className="text-[10px] opacity-50 mt-0.5 line-clamp-1">{veh.description}</div>
                            </td>

                            {/* Base Fee Input */}
                            <td className="py-3.5 px-2">
                              <div className="flex items-center gap-1">
                                <input
                                  type="number"
                                  min="0"
                                  value={veh.baseFee}
                                  onChange={(e) => {
                                    const val = Number(e.target.value) || 0;
                                    setDeliveryVehicles((prev) =>
                                      prev.map((v, i) => (i === idx ? { ...v, baseFee: val } : v))
                                    );
                                  }}
                                  className="w-20 px-2 py-1.5 rounded-lg border font-mono font-bold bg-transparent text-xs focus:outline-none focus:border-[#C18A45]"
                                />
                                <span className="text-[10px] opacity-60">{isAmharic ? 'ብር' : 'ETB'}</span>
                              </div>
                            </td>

                            {/* Price per KM Input */}
                            <td className="py-3.5 px-2">
                              <div className="flex items-center gap-1">
                                <input
                                  type="number"
                                  min="0"
                                  value={veh.pricePerKm}
                                  onChange={(e) => {
                                    const val = Number(e.target.value) || 0;
                                    setDeliveryVehicles((prev) =>
                                      prev.map((v, i) => (i === idx ? { ...v, pricePerKm: val } : v))
                                    );
                                  }}
                                  className="w-20 px-2 py-1.5 rounded-lg border font-mono font-bold bg-transparent text-xs focus:outline-none focus:border-[#C18A45]"
                                />
                                <span className="text-[10px] opacity-60">{isAmharic ? 'ብር/ኪ.ሜ' : 'ETB/km'}</span>
                              </div>
                            </td>

                            {/* Max Sheep */}
                            <td className="py-3.5 px-2">
                              <input
                                type="number"
                                min="0"
                                value={veh.maxSheep ?? 0}
                                onChange={(e) => {
                                  const val = Number(e.target.value) || 0;
                                  setDeliveryVehicles((prev) =>
                                    prev.map((v, i) => (i === idx ? { ...v, maxSheep: val } : v))
                                  );
                                }}
                                className="w-16 px-2 py-1.5 rounded-lg border font-mono text-xs bg-transparent focus:outline-none focus:border-[#C18A45]"
                              />
                            </td>

                            {/* Max Cattle */}
                            <td className="py-3.5 px-2">
                              <input
                                type="number"
                                min="0"
                                value={veh.maxCattle ?? 0}
                                onChange={(e) => {
                                  const val = Number(e.target.value) || 0;
                                  setDeliveryVehicles((prev) =>
                                    prev.map((v, i) => (i === idx ? { ...v, maxCattle: val } : v))
                                  );
                                }}
                                className="w-16 px-2 py-1.5 rounded-lg border font-mono text-xs bg-transparent focus:outline-none focus:border-[#C18A45]"
                              />
                            </td>

                            {/* Max Chickens */}
                            <td className="py-3.5 px-2">
                              <input
                                type="number"
                                min="0"
                                value={veh.maxChickens ?? 0}
                                onChange={(e) => {
                                  const val = Number(e.target.value) || 0;
                                  setDeliveryVehicles((prev) =>
                                    prev.map((v, i) => (i === idx ? { ...v, maxChickens: val } : v))
                                  );
                                }}
                                className="w-16 px-2 py-1.5 rounded-lg border font-mono text-xs bg-transparent focus:outline-none focus:border-[#C18A45]"
                              />
                            </td>

                            {/* Max Weight */}
                            <td className="py-3.5 px-2">
                              <div className="flex items-center gap-1">
                                <input
                                  type="number"
                                  min="0"
                                  value={veh.maxWeightKg ?? 0}
                                  onChange={(e) => {
                                    const val = Number(e.target.value) || 0;
                                    setDeliveryVehicles((prev) =>
                                      prev.map((v, i) => (i === idx ? { ...v, maxWeightKg: val } : v))
                                    );
                                  }}
                                  className="w-20 px-2 py-1.5 rounded-lg border font-mono text-xs bg-transparent focus:outline-none focus:border-[#C18A45]"
                                />
                                <span className="text-[10px] opacity-60">{isAmharic ? 'ኪሎ' : 'KG'}</span>
                              </div>
                            </td>

                            {/* Active Toggle */}
                            <td className="py-3.5 pl-2 text-right">
                              <button
                                type="button"
                                onClick={() => {
                                  setDeliveryVehicles((prev) =>
                                    prev.map((v, i) => (i === idx ? { ...v, active: !v.active } : v))
                                  );
                                }}
                                className={`px-2.5 py-1 rounded-full text-[10px] font-bold transition-all ${
                                  veh.active !== false
                                    ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                                    : 'bg-red-500/15 text-red-400 border border-red-500/30'
                                }`}
                              >
                                {veh.active !== false ? (isAmharic ? 'ንቁ' : 'Active') : (isAmharic ? 'የቦዘነ' : 'Disabled')}
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* 2. Farm Origin Facility & Global Logistics Settings */}
                <div
                  className={`p-5 sm:p-6 rounded-3xl border space-y-4 ${
                    isDark ? 'bg-[#1E140A] border-[#3D2513]' : 'bg-white border-[#E8DCCB]'
                  }`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-black/10 dark:border-white/10">
                    <div>
                      <h3 className="text-base font-serif font-bold flex items-center gap-2">
                        <MapPin className="w-4 h-4 text-[#C18A45]" />
                        <span>{isAmharic ? 'የአዋሬ እርሻ መላኪያ ማዕከል እና የወሰን ቅንብሮች' : 'Aware Farm Dispatch Hub & Boundary Settings'}</span>
                      </h3>
                      <p className="text-xs opacity-70 mt-0.5">
                        {isAmharic
                          ? 'የከብቶች መጫኛ መነሻ መጋጠሚያዎች እና ለአዲስ አበባ ከፍተኛ የማድረሻ ርቀት ገደብ።'
                          : 'Origin coordinates where livestock are loaded and max driving radius cutoff for Addis Ababa.'}
                      </p>
                    </div>

                    <button
                      type="button"
                      disabled={isSavingDeliverySettings}
                      onClick={handleSaveDeliverySettings}
                      className="px-4 py-2 rounded-xl bg-[#C18A45] hover:bg-[#A06E35] disabled:opacity-50 text-white font-bold text-xs shadow transition-all flex items-center gap-1.5 cursor-pointer self-start sm:self-auto"
                    >
                      {isSavingDeliverySettings ? (
                        <>
                          <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                          <span>{isAmharic ? 'ማዕከሉን በማስቀመጥ ላይ...' : 'Saving Facility Hub...'}</span>
                        </>
                      ) : (
                        <>
                          <Check className="w-3.5 h-3.5" />
                          <span>{isAmharic ? 'የመላኪያ ማዕከሉን መዝግብ' : 'Save Facility Hub'}</span>
                        </>
                      )}
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
                    <div>
                      <label className="block text-[11px] font-bold uppercase mb-1 opacity-70">
                        {isAmharic ? 'የመላኪያ ማዕከል ስም' : 'Dispatch Facility Name'}
                      </label>
                      <input
                        type="text"
                        value={deliverySettings.pickupAddress || deliverySettings.defaultOriginName || ''}
                        onChange={(e) =>
                          setDeliverySettings((prev: any) => ({
                            ...prev,
                            pickupAddress: e.target.value,
                            defaultOriginName: e.target.value
                          }))
                        }
                        className="w-full px-3 py-2 rounded-xl border text-xs bg-transparent focus:outline-none focus:border-[#C18A45]"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold uppercase mb-1 opacity-70">
                        {isAmharic ? 'የእርሻ ላቲቲዩድ (GPS)' : 'Farm Latitude (GPS)'}
                      </label>
                      <input
                        type="number"
                        step="any"
                        value={deliverySettings.pickupLatitude ?? deliverySettings.defaultOriginLat ?? 9.0182}
                        onChange={(e) =>
                          setDeliverySettings((prev: any) => ({
                            ...prev,
                            pickupLatitude: Number(e.target.value),
                            defaultOriginLat: Number(e.target.value)
                          }))
                        }
                        className="w-full px-3 py-2 rounded-xl border text-xs font-mono bg-transparent focus:outline-none focus:border-[#C18A45]"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold uppercase mb-1 opacity-70">
                        {isAmharic ? 'የእርሻ ሎንጊቲዩድ (GPS)' : 'Farm Longitude (GPS)'}
                      </label>
                      <input
                        type="number"
                        step="any"
                        value={deliverySettings.pickupLongitude ?? deliverySettings.defaultOriginLng ?? 38.7750}
                        onChange={(e) =>
                          setDeliverySettings((prev: any) => ({
                            ...prev,
                            pickupLongitude: Number(e.target.value),
                            defaultOriginLng: Number(e.target.value)
                          }))
                        }
                        className="w-full px-3 py-2 rounded-xl border text-xs font-mono bg-transparent focus:outline-none focus:border-[#C18A45]"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold uppercase mb-1 opacity-70">
                        {isAmharic ? 'ከፍተኛ የማድረሻ ርቀት (ኪ.ሜ)' : 'Max Delivery Radius (KM)'}
                      </label>
                      <input
                        type="number"
                        min="1"
                        max="100"
                        value={deliverySettings.maxDistanceKm ?? 30}
                        onChange={(e) =>
                          setDeliverySettings((prev: any) => ({ ...prev, maxDistanceKm: Number(e.target.value) }))
                        }
                        className="w-full px-3 py-2 rounded-xl border text-xs font-mono bg-transparent focus:outline-none focus:border-[#C18A45]"
                      />
                    </div>
                  </div>
                </div>

                {/* 3. Slaughter & On-Site Preparation Rates (Configurable by Admin) */}
                <div
                  className={`p-5 sm:p-6 rounded-3xl border space-y-4 ${
                    isDark ? 'bg-[#1E140A] border-[#3D2513]' : 'bg-white border-[#E8DCCB]'
                  }`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-black/10 dark:border-white/10">
                    <div>
                      <h3 className="text-base font-serif font-bold flex items-center gap-2">
                        <UtensilsCrossed className="w-4 h-4 text-[#C18A45]" />
                        <span>{isAmharic ? 'የዕርድ እና የስጋ ዝግጅት አገልግሎት ተመኖች' : 'Slaughter & On-Site Preparation Rates'}</span>
                      </h3>
                      <p className="text-xs opacity-70 mt-0.5">
                        {isAmharic
                          ? 'የዕርድ መነሻ ዋጋ እና የባለሙያ አብሮ መጓዣ አበል ያዘጋጁ። እነዚህ ዋጋዎች በደንበኞች ትዕዛዝ ላይ በቀጥታ ተግባራዊ ይሆናሉ።'
                          : 'Configure base slaughter fee and worker accompaniment travel fee. Applied automatically to customer orders.'}
                      </p>
                    </div>

                    <button
                      type="button"
                      disabled={isSavingSlaughterPricing}
                      onClick={handleSaveSlaughterPricing}
                      className="px-4 py-2 rounded-xl bg-[#C18A45] hover:bg-[#A06E35] disabled:opacity-50 text-white font-bold text-xs shadow transition-all flex items-center gap-1.5 cursor-pointer self-start sm:self-auto"
                    >
                      {isSavingSlaughterPricing ? (
                        <>
                          <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                          <span>{isAmharic ? 'ዋጋዎችን በማስቀመጥ ላይ...' : 'Saving Rates...'}</span>
                        </>
                      ) : (
                        <>
                          <Check className="w-3.5 h-3.5" />
                          <span>{isAmharic ? 'የዕርድ ዋጋዎችን መዝግብ' : 'Save Slaughter Rates'}</span>
                        </>
                      )}
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Base Slaughter Fee */}
                    <div className={`p-4 rounded-2xl border ${isDark ? 'bg-[#2A1A0D] border-[#4A2C16]' : 'bg-[#FAF7F0] border-[#E4D4BC]'}`}>
                      <label className="block text-xs font-bold uppercase mb-1 flex items-center justify-between">
                        <span>{isAmharic ? 'የዕርድ መነሻ ክፍያ (ብር)' : 'Base Slaughter Fee (ETB)'}</span>
                        <span className="text-[10px] opacity-60 font-mono">Default: 600 ETB</span>
                      </label>
                      <input
                        type="number"
                        min="0"
                        step="50"
                        value={slaughterPricing.slaughterFee}
                        onChange={(e) =>
                          setSlaughterPricing((prev) => ({
                            ...prev,
                            slaughterFee: Math.max(0, Number(e.target.value) || 0)
                          }))
                        }
                        className="w-full px-3 py-2 rounded-xl border text-sm font-mono font-bold bg-transparent focus:outline-none focus:border-[#C18A45]"
                      />
                      <p className="text-[10.5px] opacity-70 mt-1.5 leading-snug">
                        {isAmharic
                          ? 'እርሻው ላይ ታርዶ ሲላክ (Send Slaughtered) ወይም ደንበኞች እራሳቸው መጥተው እርሻው ላይ ሲታረድ የሚከፈል መነሻ ተመን።'
                          : 'Applied when animal is slaughtered at farm before delivery or prepared on-site at farm during pickup.'}
                      </p>
                    </div>

                    {/* Travel Extra Fee */}
                    <div className={`p-4 rounded-2xl border ${isDark ? 'bg-[#2A1A0D] border-[#4A2C16]' : 'bg-[#FAF7F0] border-[#E4D4BC]'}`}>
                      <label className="block text-xs font-bold uppercase mb-1 flex items-center justify-between">
                        <span>{isAmharic ? 'የባለሙያ አብሮ መጓዣ ተጨማሪ ክፍያ (ብር)' : 'Worker Accompaniment Travel Extra (ETB)'}</span>
                        <span className="text-[10px] opacity-60 font-mono">Default: 200 ETB</span>
                      </label>
                      <input
                        type="number"
                        min="0"
                        step="50"
                        value={slaughterPricing.travelFee}
                        onChange={(e) =>
                          setSlaughterPricing((prev) => ({
                            ...prev,
                            travelFee: Math.max(0, Number(e.target.value) || 0)
                          }))
                        }
                        className="w-full px-3 py-2 rounded-xl border text-sm font-mono font-bold bg-transparent focus:outline-none focus:border-[#C18A45]"
                      />
                      <p className="text-[10.5px] opacity-70 mt-1.5 leading-snug">
                        {isAmharic
                          ? `የዕርድ ባለሙያው ከማድረሻ መኪናው ጋር አብሮ ሲላክ ወይም ደንበኞች ይዘውት ሲሄዱ የሚጨመር ተጨማሪ ክፍያ (ጠቅላላ፡ ${formatPrice(slaughterPricing.slaughterFee + slaughterPricing.travelFee)})።`
                          : `Added when slaughterer accompanies delivery vehicle or customer takes him along (Total: ${formatPrice(slaughterPricing.slaughterFee + slaughterPricing.travelFee)}).`}
                      </p>
                    </div>
                  </div>

                  {/* Summary / Formula Rule Box */}
                  <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-xs flex items-start gap-2.5">
                    <Info className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                    <div className="space-y-1">
                      <span className="font-bold text-amber-500 block">
                        {isAmharic ? 'የዋጋ ስሌት ደንብ ማጠቃለያ' : 'Active Rate Calculation Summary'}
                      </span>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] opacity-90">
                        <div>
                          • <strong>{isAmharic ? 'የታረደ መላክ / እርሻው ላይ ማረድ' : 'Send Slaughtered / Farm Slaughter'}:</strong>{' '}
                          <span className="font-mono font-bold text-amber-500">{formatPrice(slaughterPricing.slaughterFee)}</span>
                        </div>
                        <div>
                          • <strong>{isAmharic ? 'ባለሙያ አብሮ ሲጓዝ / ደንበኞች ይዘው ሲሄዱ' : 'Worker Travels With Delivery / Pickup'}:</strong>{' '}
                          <span className="font-mono font-bold text-amber-500">{formatPrice(slaughterPricing.slaughterFee + slaughterPricing.travelFee)}</span>{' '}
                          <span className="text-[10px] opacity-75">({slaughterPricing.slaughterFee} + {slaughterPricing.travelFee})</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* 4. Interactive Live Route & Capacity Simulator Sandbox */}
                <div
                  className={`p-5 sm:p-6 rounded-3xl border space-y-4 ${
                    isDark ? 'bg-[#1E140A] border-[#3D2513]' : 'bg-white border-[#E8DCCB]'
                  }`}
                >
                  <div className="pb-3 border-b border-black/10 dark:border-white/10">
                    <h3 className="text-base font-serif font-bold flex items-center gap-2">
                      <Navigation className="w-4 h-4 text-[#C18A45]" />
                      <span>{isAmharic ? 'የቀጥታ መንገድ እና የተሽከርካሪ ጭነት አስመሳይ' : 'Interactive Route & Vehicle Load Simulator'}</span>
                    </h3>
                    <p className="text-xs opacity-70 mt-0.5">
                      {isAmharic
                        ? 'የእውነተኛ የመንገድ ርቀት፣ የጉዞ ጊዜ፣ የተደባለቁ ጭነቶች እና የተሽከርካሪ አቅም ማረጋገጫን ይሞክሩ።'
                        : 'Test actual road distance calculations, duration, multi-item loads, and capacity enforcement in real time.'}
                    </p>
                  </div>

                  {/* Simulator Input Grid */}
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3.5">
                    {/* Destination Dropdown */}
                    <div className="col-span-2 md:col-span-3 lg:col-span-2">
                      <label className="block text-[11px] font-bold uppercase mb-1 opacity-70">
                        {isAmharic ? 'የአዲስ አበባ መዳረሻ ይምረጡ' : 'Select Addis Ababa Destination'}
                      </label>
                      <select
                        value={simSelectedLocId}
                        onChange={(e) => {
                          const locId = e.target.value;
                          setSimSelectedLocId(locId);
                          const loc = ADDIS_ABABA_LOCATIONS.find((l) => l.id === locId);
                          if (loc) {
                            setSimDestLat(loc.lat);
                            setSimDestLng(loc.lng);
                            setSimDestAddress(`${loc.name} (${loc.subCity} Sub-City)`);
                          }
                        }}
                        className={`w-full px-3 py-2 rounded-xl border text-xs focus:outline-none ${
                          isDark ? 'bg-[#24170D] border-[#4A2C16]' : 'bg-white border-[#E4D4BC]'
                        }`}
                      >
                        {ADDIS_ABABA_LOCATIONS.map((loc) => (
                          <option key={loc.id} value={loc.id}>
                            {loc.name} — {loc.subCity} ({loc.amharicName})
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Sheep / Goats */}
                    <div>
                      <label className="block text-[11px] font-bold uppercase mb-1 opacity-70">{isAmharic ? 'በጎች / ፍየሎች' : 'Sheep / Goats'}</label>
                      <input
                        type="number"
                        min="0"
                        value={simSheep}
                        onChange={(e) => setSimSheep(Math.max(0, Number(e.target.value) || 0))}
                        className="w-full px-3 py-2 rounded-xl border text-xs font-mono bg-transparent focus:outline-none"
                      />
                    </div>

                    {/* Cattle / Oxen */}
                    <div>
                      <label className="block text-[11px] font-bold uppercase mb-1 opacity-70">{isAmharic ? 'በሬዎች / ከብቶች' : 'Cattle / Oxen'}</label>
                      <input
                        type="number"
                        min="0"
                        value={simCattle}
                        onChange={(e) => setSimCattle(Math.max(0, Number(e.target.value) || 0))}
                        className="w-full px-3 py-2 rounded-xl border text-xs font-mono bg-transparent focus:outline-none"
                      />
                    </div>

                    {/* Chickens */}
                    <div>
                      <label className="block text-[11px] font-bold uppercase mb-1 opacity-70">{isAmharic ? 'ዶሮዎች' : 'Chickens'}</label>
                      <input
                        type="number"
                        min="0"
                        value={simChickens}
                        onChange={(e) => setSimChickens(Math.max(0, Number(e.target.value) || 0))}
                        className="w-full px-3 py-2 rounded-xl border text-xs font-mono bg-transparent focus:outline-none"
                      />
                    </div>

                    {/* Raw Meat KG */}
                    <div>
                      <label className="block text-[11px] font-bold uppercase mb-1 opacity-70">{isAmharic ? 'የበሬ ስጋ (ኪሎ)' : 'Beef / Meat (KG)'}</label>
                      <input
                        type="number"
                        min="0"
                        value={simMeatKg}
                        onChange={(e) => setSimMeatKg(Math.max(0, Number(e.target.value) || 0))}
                        className="w-full px-3 py-2 rounded-xl border text-xs font-mono bg-transparent focus:outline-none"
                      />
                    </div>
                  </div>

                  {/* Simulation Trigger Button */}
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      disabled={isSimulatingRoute}
                      onClick={handleRunSimulator}
                      className="px-5 py-2.5 rounded-xl bg-[#C18A45] hover:bg-[#A06E35] disabled:opacity-50 text-white font-bold text-xs shadow transition-all flex items-center gap-2 cursor-pointer"
                    >
                      {isSimulatingRoute ? (
                        <>
                          <RefreshCw className="w-4 h-4 animate-spin" />
                          <span>{isAmharic ? 'የመንገድ ርቀት በማስላት ላይ...' : 'Calculating Driving Route...'}</span>
                        </>
                      ) : (
                        <>
                          <Sparkles className="w-4 h-4" />
                          <span>{isAmharic ? 'መንገድ እና የተሽከርካሪ አቅም አስመስክር' : 'Simulate Route & Check Vehicle Capacity'}</span>
                        </>
                      )}
                    </button>
                  </div>

                  {/* Simulation Results Display */}
                  {simResult && (
                    <div
                      className={`p-4 rounded-2xl border space-y-3 animate-in fade-in-50 duration-200 ${
                        isDark ? 'bg-black/20 border-[#4A2C16]' : 'bg-[#FAF7F0] border-[#E4D4BC]'
                      }`}
                    >
                      <div className="flex flex-wrap items-center justify-between gap-2 pb-2 border-b border-black/10 dark:border-white/10">
                        <div className="flex items-center gap-2 text-xs">
                          <div className="flex items-center gap-1.5 font-bold">
                            <Navigation className="w-3.5 h-3.5 text-[#C18A45]" />
                            <span>{isAmharic ? 'የመንገድ ርቀት:' : 'Road Distance:'}</span>
                          </div>
                          <span className="px-2 py-0.5 rounded-md bg-emerald-500/15 text-emerald-400 font-mono font-bold">
                            {simResult.distanceKm} {isAmharic ? 'ኪ.ሜ' : 'KM'}
                          </span>
                          <span className="opacity-60">•</span>
                          <span>{isAmharic ? `የሚፈጀው ጊዜ ~${simResult.estimatedDurationMinutes} ደቂቃ` : `Est. ${simResult.estimatedDurationMinutes} mins drive`}</span>
                          <span className="opacity-60">•</span>
                          <span className="opacity-80">{isAmharic ? 'ምድብ:' : 'Category:'} {simResult.distanceCategoryLabel}</span>
                        </div>

                        <div className="text-[10px] font-mono opacity-60">
                          {isAmharic ? 'ሞተር:' : 'Engine:'} {simResult.routeSource || 'OSRM Driving Router'}
                        </div>
                      </div>

                      {/* Vehicle Cards */}
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        {simResult.vehicles?.map((v: any) => (
                          <div
                            key={v.id}
                            className={`p-3 rounded-xl border text-xs space-y-1.5 ${
                              v.isSuitable
                                ? 'bg-emerald-500/10 border-emerald-500/30'
                                : 'bg-red-500/10 border-red-500/30 opacity-70'
                            }`}
                          >
                            <div className="flex items-center justify-between font-bold">
                              <span>{isAmharic ? (v.amharicName || v.name) : v.name}</span>
                              {v.isRecommended && (
                                <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-emerald-500 text-black font-black">
                                  {isAmharic ? 'ምርጥ ምርጫ' : 'Best Choice'}
                                </span>
                              )}
                            </div>
                            <div className="text-lg font-mono font-bold text-[#C18A45]">
                              {formatPrice(v.deliveryFee)}
                            </div>
                            <div className="text-[10px] opacity-75">
                              {isAmharic ? 'መነሻ:' : 'Base:'} {v.baseFee} {isAmharic ? 'ብር' : 'ETB'} + {v.pricePerKm} {isAmharic ? 'ብር/ኪ.ሜ' : 'ETB/km'}
                            </div>
                            <div className="pt-1 border-t border-black/5 dark:border-white/5">
                              {v.isSuitable ? (
                                <span className="text-emerald-400 font-semibold flex items-center gap-1">
                                  <CheckCircle2 className="w-3.5 h-3.5" />
                                  <span>{isAmharic ? 'ለዚህ ጭነት ተስማሚ' : 'Suitable for this load'}</span>
                                </span>
                              ) : (
                                <span className="text-red-400 font-semibold flex items-center gap-1 leading-tight">
                                  <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                                  <span>{v.unsuitabilityReason || (isAmharic ? 'ከአቅም በላይ ነው' : 'Exceeds capacity')}</span>
                                </span>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {/* ============================================================ */}
        {/* TAB 7: DEMAND & METRICS */}
        {/* ============================================================ */}
        {activeTab === 'demand' && (
          <div className="space-y-6 animate-in fade-in-50 duration-150">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              <div className={`p-5 rounded-2xl border ${isDark ? 'bg-[#2A1A0D] border-[#4A2C16]' : 'bg-[#F1E8D8] border-[#E4D4BC]'}`}>
                <div className="flex items-center justify-between pb-2.5 border-b" style={{ borderColor: isDark ? '#4A2C16' : '#E4D4BC' }}>
                  <strong className="font-serif text-sm">{isAmharic ? 'የበጎች የገበያ ዋጋ ግምት' : 'Sheep Inventory Valuation'}</strong>
                  <span className="text-[11px] font-mono opacity-70">{stats.sheepCount} {isAmharic ? 'ራስ' : 'Head'}</span>
                </div>
                <div className="pt-2.5 text-lg font-bold text-[#C18A45]">{formatPrice(stats.sheepValue)}</div>
              </div>

              <div className={`p-5 rounded-2xl border ${isDark ? 'bg-[#2A1A0D] border-[#4A2C16]' : 'bg-[#F1E8D8] border-[#E4D4BC]'}`}>
                <div className="flex items-center justify-between pb-2.5 border-b" style={{ borderColor: isDark ? '#4A2C16' : '#E4D4BC' }}>
                  <strong className="font-serif text-sm">{isAmharic ? 'የፍየሎች የገበያ ዋጋ ግምት' : 'Goats Inventory Valuation'}</strong>
                  <span className="text-[11px] font-mono opacity-70">{stats.goatsCount} {isAmharic ? 'ራስ' : 'Head'}</span>
                </div>
                <div className="pt-2.5 text-lg font-bold text-[#C18A45]">{formatPrice(stats.goatValue)}</div>
              </div>

              <div className={`p-5 rounded-2xl border ${isDark ? 'bg-[#2A1A0D] border-[#4A2C16]' : 'bg-[#F1E8D8] border-[#E4D4BC]'}`}>
                <div className="flex items-center justify-between pb-2.5 border-b" style={{ borderColor: isDark ? '#4A2C16' : '#E4D4BC' }}>
                  <strong className="font-serif text-sm">{isAmharic ? 'የከብቶች የገበያ ዋጋ ግምት' : 'Cows Inventory Valuation'}</strong>
                  <span className="text-[11px] font-mono opacity-70">{stats.cowsCount} {isAmharic ? 'ራስ' : 'Head'}</span>
                </div>
                <div className="pt-2.5 text-lg font-bold text-[#C18A45]">{formatPrice(stats.cowValue)}</div>
              </div>
            </div>
          </div>
        )}

        {/* ============================================================ */}
        {/* TAB 8: CUSTOMER INQUIRIES & CONTACT MESSAGES */}
        {/* ============================================================ */}
        {activeTab === 'messages' && (
          <div className="space-y-6 animate-in fade-in-50 duration-150">
            {/* Header & Filter Controls */}
            <div className={`p-4 sm:p-6 rounded-2xl border flex flex-col md:flex-row items-start md:items-center justify-between gap-4 ${
              isDark ? 'bg-[#2A1A0D] border-[#4A2C16]' : 'bg-[#F1E8D8] border-[#E4D4BC]'
            }`}>
              <div>
                <h3 className="font-serif font-bold text-xl flex items-center gap-2">
                  <MessageSquare className="w-5 h-5 text-[#C18A45]" />
                  <span>{isAmharic ? 'የደንበኞች ጥያቄዎች እና መልዕክቶች' : 'Customer Inquiries & Messages'}</span>
                  <span className="text-xs px-2 py-0.5 rounded-md font-sans font-bold bg-amber-500/15 text-amber-400 border border-amber-500/30">
                    {contactMessages.length} {isAmharic ? 'ጠቅላላ' : 'Total'}
                  </span>
                </h3>
                <p className="text-xs opacity-75 mt-0.5">
                  {isAmharic
                    ? 'በእውቂያ ገጽ በኩል የተላኩ ጥያቄዎች። በቀጥታ በስልክ ጥሪ ወይም በዋትስአፕ ምላሽ ይስጡ።'
                    : 'Inquiries submitted via the Contact Us page. Reply directly through phone call or WhatsApp.'}
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
                <div className="relative flex-1 md:w-56">
                  <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 opacity-50" />
                  <input
                    type="text"
                    placeholder={isAmharic ? 'በስም ወይም በስልክ ይፈልጉ...' : 'Search sender, phone...'}
                    value={messageSearch}
                    onChange={(e) => setMessageSearch(e.target.value)}
                    className="w-full pl-8 pr-3 py-1.5 rounded-xl text-xs border bg-transparent"
                  />
                </div>

                <div className="flex items-center gap-1 p-1 rounded-xl border border-black/10 dark:border-white/10 text-xs">
                  <button
                    type="button"
                    onClick={() => setMessageFilter('all')}
                    className={`px-2.5 py-1 rounded-lg font-semibold transition-colors cursor-pointer ${
                      messageFilter === 'all'
                        ? 'bg-amber-500 text-black shadow-xs'
                        : 'opacity-70 hover:opacity-100'
                    }`}
                  >
                    {isAmharic ? 'ሁሉም' : 'All'} ({contactMessages.length})
                  </button>
                  <button
                    type="button"
                    onClick={() => setMessageFilter('unread')}
                    className={`px-2.5 py-1 rounded-lg font-semibold transition-colors cursor-pointer ${
                      messageFilter === 'unread'
                        ? 'bg-amber-500 text-black shadow-xs'
                        : 'opacity-70 hover:opacity-100'
                    }`}
                  >
                    {isAmharic ? 'ያልተነበቡ' : 'Unread'} ({unreadMessagesCount})
                  </button>
                  <button
                    type="button"
                    onClick={() => setMessageFilter('read')}
                    className={`px-2.5 py-1 rounded-lg font-semibold transition-colors cursor-pointer ${
                      messageFilter === 'read'
                        ? 'bg-amber-500 text-black shadow-xs'
                        : 'opacity-70 hover:opacity-100'
                    }`}
                  >
                    {isAmharic ? 'የተነበቡ' : 'Read'} ({contactMessages.length - unreadMessagesCount})
                  </button>
                </div>
              </div>
            </div>

            {/* Messages List */}
            {(() => {
              if (isLoadingData && contactMessages.length === 0) {
                return (
                  <div className={`text-center py-16 rounded-2xl border animate-in fade-in duration-200 ${
                    isDark ? 'bg-[#2A1A0D]/40 border-[#4A2C16]' : 'bg-[#F1E8D8]/40 border-[#E4D4BC]'
                  }`}>
                    <div className="w-8 h-8 rounded-full border-2 border-amber-500 border-t-transparent animate-spin mx-auto mb-3" />
                    <p className="text-xs font-semibold text-amber-500">
                      {isAmharic ? 'በመጫን ላይ...' : 'Loading...'}
                    </p>
                  </div>
                );
              }

              const filtered = contactMessages.filter((m) => {
                if (messageFilter === 'unread' && m.read) return false;
                if (messageFilter === 'read' && !m.read) return false;
                if (messageSearch.trim()) {
                  const q = messageSearch.toLowerCase();
                  const matchName = m.name?.toLowerCase().includes(q);
                  const matchPhone = m.phone?.toLowerCase().includes(q);
                  const matchMsg = m.message?.toLowerCase().includes(q);
                  const matchService = m.serviceNeeded?.toLowerCase().includes(q);
                  if (!matchName && !matchPhone && !matchMsg && !matchService) return false;
                }
                return true;
              });

              if (filtered.length === 0) {
                return (
                  <div className={`text-center py-16 rounded-2xl border ${
                    isDark ? 'bg-[#2A1A0D]/40 border-[#4A2C16]' : 'bg-[#F1E8D8]/40 border-[#E4D4BC]'
                  }`}>
                    <MessageSquare className="w-12 h-12 mx-auto mb-3 opacity-30 text-[#C18A45]" />
                    <p className="font-semibold text-sm">{isAmharic ? 'ምንም የደንበኛ መልዕክት አልተገኘም' : 'No customer inquiries found'}</p>
                    <p className="text-xs opacity-60 mt-1">
                      {messageSearch || messageFilter !== 'all'
                        ? (isAmharic ? 'የፍለጋ ቃልዎን ወይም ማጣሪያዎን ያስተካክሉ።' : 'Try adjusting your search query or filter.')
                        : (isAmharic ? 'ከደንበኞች የሚላኩ መልዕክቶች በቀጥታ እዚህ ይታያሉ።' : 'Customer messages from the Contact Us form will appear here in real time.')}
                    </p>
                  </div>
                );
              }

              return (
                <div className="space-y-4">
                  {filtered.map((msg) => (
                    <div
                      key={msg.id}
                      className={`p-4 sm:p-5 rounded-2xl border transition-all ${
                        !msg.read
                          ? isDark
                            ? 'bg-[#24170D] border-amber-500/40 shadow-md ring-1 ring-amber-500/20'
                            : 'bg-white border-amber-500/50 shadow-md ring-1 ring-amber-500/20'
                          : isDark
                          ? 'bg-[#2A1A0D] border-[#4A2C16]'
                          : 'bg-[#FAF7F0] border-[#E4D4BC]'
                      }`}
                    >
                      {/* Top Bar: Sender & Status */}
                      <div className="flex flex-wrap items-start justify-between gap-2 pb-3 border-b border-black/5 dark:border-white/5">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-sm sm:text-base">{msg.name}</span>
                            {!msg.read ? (
                              <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-amber-500/15 text-amber-400 border border-amber-500/30">
                                {isAmharic ? 'ያልተነበበ' : 'Unread'}
                              </span>
                            ) : (
                              <span className="px-2 py-0.5 rounded-md text-[10px] font-medium opacity-60 border border-black/10 dark:border-white/10">
                                {isAmharic ? 'የተነበበ' : 'Read'}
                              </span>
                            )}
                          </div>
                          <div className="text-[11px] opacity-60 font-mono mt-0.5">
                            {isAmharic ? 'የደረሰው:' : 'Received'} {new Date(msg.createdAt).toLocaleString()}
                          </div>
                        </div>

                        {/* Direct Contact Actions */}
                        <div className="flex flex-wrap items-center gap-2">
                          <a
                            href={getPhoneCallLink(msg.phone)}
                            className="px-3 py-1.5 rounded-xl text-xs font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-500 hover:text-black transition-all flex items-center gap-1.5"
                            title={isAmharic ? 'ለደንበኛው በቀጥታ ይደውሉ' : 'Call Customer directly'}
                          >
                            <Phone className="w-3.5 h-3.5" />
                            <span>{isAmharic ? 'ይደውሉ' : 'Call'} {msg.phone}</span>
                          </a>

                          <a
                            href={getWhatsAppLink(msg.phone, `Hello ${msg.name}, thank you for contacting Jonny Livestock regarding your inquiry.`)}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="px-3 py-1.5 rounded-xl text-xs font-bold bg-emerald-600 text-white hover:bg-emerald-700 transition-all flex items-center gap-1.5 shadow-xs"
                            title={isAmharic ? 'በዋትስአፕ ያውሩ' : 'Chat on WhatsApp'}
                          >
                            <span>WhatsApp</span>
                          </a>

                          {msg.email && (
                            <a
                              href={`mailto:${msg.email}?subject=Regarding your Jonny Livestock inquiry`}
                              className="px-3 py-1.5 rounded-xl text-xs font-semibold border border-black/10 dark:border-white/10 hover:bg-black/5 dark:hover:bg-white/5 transition-all flex items-center gap-1.5"
                            >
                              <Mail className="w-3.5 h-3.5 opacity-70" />
                              <span className="hidden sm:inline">{msg.email}</span>
                            </a>
                          )}

                          {!msg.read && (
                            <button
                              type="button"
                              onClick={() => handleMarkMessageRead(msg.id)}
                              className="px-2.5 py-1.5 rounded-xl text-xs font-semibold bg-amber-500/10 text-amber-500 border border-amber-500/30 hover:bg-amber-500 hover:text-black transition-all cursor-pointer"
                            >
                              {isAmharic ? 'እንደተነበበ ምልክት አድርግ' : 'Mark Read'}
                            </button>
                          )}

                          <button
                            type="button"
                            onClick={() => handleDeleteMessage(msg.id)}
                            className="p-1.5 rounded-xl text-red-400 hover:bg-red-500/10 border border-red-500/20 transition-all cursor-pointer"
                            title={isAmharic ? 'መልዕክቱን ሰርዝ' : 'Delete Inquiry'}
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>

                      {/* Meta Pills (Service / Animal) */}
                      {(msg.serviceNeeded || msg.animalId) && (
                        <div className="flex flex-wrap items-center gap-2 pt-2.5">
                          {msg.serviceNeeded && msg.serviceNeeded !== 'No Service' && (
                            <span className="px-2 py-0.5 rounded-lg text-[10.5px] font-semibold bg-amber-500/15 text-amber-400 border border-amber-500/25">
                              {isAmharic ? 'አገልግሎት:' : 'Service:'} {msg.serviceNeeded}
                            </span>
                          )}
                          {msg.animalId && (
                            <span className="px-2 py-0.5 rounded-lg text-[10.5px] font-mono font-semibold bg-black/10 dark:bg-white/10">
                              {isAmharic ? 'የከብት መለያ:' : 'Animal ID:'} {msg.animalId}
                            </span>
                          )}
                        </div>
                      )}

                      {/* Message Content */}
                      <div className={`mt-3 p-3.5 rounded-xl border text-xs sm:text-sm leading-relaxed whitespace-pre-wrap ${
                        isDark ? 'bg-[#1B1208] border-[#4A2C16]' : 'bg-[#F4ECE1] border-[#E4D4BC]'
                      }`}>
                        "{msg.message}"
                      </div>
                    </div>
                  ))}
                </div>
              );
            })()}
          </div>
        )}
        </main>
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
          onApproveDelivery={async (id, status) => {
            await handleApproveDelivery(id, status);
            setSelectedSlipOrder(null);
          }}
          onUpdatePickupStatus={async (id, status) => {
            await handleUpdatePickupStatus(id, status);
            setSelectedSlipOrder(null);
          }}
          onReject={async (id) => {
            await handleRejectOrder(id);
            setSelectedSlipOrder(null);
          }}
          onClearReceipt={async (id, type) => {
            await handleClearReceipt(id, type);
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
              <span>{isAmharic ? 'አዲስ የከብት ዝርዝር መዝግብ' : 'Add New Livestock Listing'}</span>
            </h3>

            <form onSubmit={handleAddAnimalSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold uppercase mb-1 opacity-80">{isAmharic ? 'ዓይነት *' : 'Type *'}</label>
                  <select
                    value={newAnimalType}
                    onChange={(e) => setNewAnimalType(e.target.value as AnimalType)}
                    className="w-full px-3 py-2 rounded-xl text-xs border bg-transparent"
                  >
                    <option value="sheep" className="text-black">{isAmharic ? 'በግ' : 'Sheep'}</option>
                    <option value="goat" className="text-black">{isAmharic ? 'ፍየል' : 'Goat'}</option>
                    <option value="cow" className="text-black">{isAmharic ? 'ላም / በሬ' : 'Cow'}</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase mb-1 opacity-80">{isAmharic ? 'ዝርያ *' : 'Breed *'}</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Debrebirhan, Ginchi, Wolayita, Arsi"
                    value={newAnimalBreed}
                    onChange={(e) => setNewAnimalBreed(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl text-xs border bg-transparent"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold uppercase mb-1 opacity-80">{isAmharic ? 'ክብደት (ኪሎ) *' : 'Weight (kg) *'}</label>
                  <input
                    type="number"
                    required
                    value={newAnimalWeight}
                    onChange={(e) => setNewAnimalWeight(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl text-xs border bg-transparent"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase mb-1 opacity-80">{isAmharic ? 'ዋጋ (ብር) *' : 'Price (ETB) *'}</label>
                  <input
                    type="number"
                    required
                    value={newAnimalPrice}
                    onChange={(e) => setNewAnimalPrice(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl text-xs border bg-transparent"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase mb-1 opacity-80">{isAmharic ? 'ቀለም' : 'Color'}</label>
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
                <label className="block text-xs font-semibold uppercase mb-1 opacity-80">{isAmharic ? 'መግለጫ' : 'Description'}</label>
                <textarea
                  rows={2}
                  placeholder={isAmharic ? 'ስለ ከብቱ ጥራት፣ የጤና ሁኔታ እና ዝርዝር...' : 'Prime meat conformation, organic grazing history...'}
                  value={newAnimalDesc}
                  onChange={(e) => setNewAnimalDesc(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl text-xs border bg-transparent"
                />
              </div>

              {/* Drag and Drop Image Uploader */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-semibold uppercase opacity-80">
                    {isAmharic ? 'የከብቱ ፎቶ (በመጎተት ወይም ፋይል በመምረጥ)' : 'Animal Photo (Drag & Drop or File)'}
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
                      {isAmharic ? 'በመጎተት' : 'Drag & Drop'}
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
                      {isAmharic ? 'የሊንክ አድራሻ' : 'Paste URL'}
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
                              {isUploadingImage ? (isAmharic ? 'ምስል በመጫን ላይ...' : 'Uploading image...') : (isAmharic ? '✓ ፎቶው ተያይዟል' : '✓ Image Attached')}
                            </span>
                          </div>
                          <p className="text-[10px] opacity-60 truncate mt-0.5">
                            {newAnimalImage.startsWith('data:') ? (isAmharic ? 'የተመረጠው ፎቶ ዝግጁ ነው' : 'Local preview ready') : newAnimalImage}
                          </p>
                          <div className="mt-2.5 flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() => animalImageInputRef.current?.click()}
                              className="text-[11px] font-semibold text-[#C18A45] hover:underline cursor-pointer"
                            >
                              {isAmharic ? 'ሌላ ምረጥ' : 'Choose Another'}
                            </button>
                            <span className="opacity-30">•</span>
                            <button
                              type="button"
                              onClick={() => setNewAnimalImage('')}
                              className="text-[11px] font-semibold text-red-400 hover:underline inline-flex items-center gap-0.5 cursor-pointer"
                            >
                              <Trash2 className="w-3 h-3" />
                              <span>{isAmharic ? 'አስወግድ' : 'Remove'}</span>
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
                                <span className="text-[#C18A45]">{isAmharic ? 'ምስሉን እዚህ ይልቀቁት!' : 'Drop image here!'}</span>
                              ) : (
                                <span>
                                  {isAmharic ? 'የከብቱን ፎቶ እዚህ ይጎትቱ ወይም ' : 'Drag and drop animal photo here, or '}
                                  <span className="text-[#C18A45] underline font-bold">{isAmharic ? 'ይምረጡ' : 'browse'}</span>
                                </span>
                              )}
                            </p>
                            <p className="text-[10px] opacity-60 mt-0.5">
                              JPG, PNG, WEBP, GIF (እስከ 10 MB)
                            </p>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div>
                    <input
                      type="text"
                      placeholder="https://images.unsplash.com/... or /uploads/..."
                      value={newAnimalImage}
                      onChange={(e) => setNewAnimalImage(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl text-xs border bg-transparent font-mono"
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
                        <span className="text-[10px] opacity-60">{isAmharic ? 'የሊንክ ቅድመ እይታ' : 'URL preview'}</span>
                      </div>
                    )}
                  </div>
                )}
              </div>

              <button
                type="submit"
                className="w-full py-3 rounded-xl bg-[#C18A45] hover:bg-[#A06E35] text-white font-bold text-xs shadow transition-all cursor-pointer"
              >
                {isAmharic ? 'ከብቱን መዝግብ' : 'Create Listing'}
              </button>
            </form>
          </div>
        </div>
        )}

      {/* Edit Livestock Listing Modal */}
      {editingAnimal && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div
            className={`relative w-full max-w-lg rounded-3xl border shadow-2xl p-6 sm:p-8 animate-in fade-in zoom-in-95 duration-200 ${
              isDark ? 'bg-[#24170D] border-[#4A2C16] text-[#F4E8D0]' : 'bg-white border-[#E4D4BC] text-[#2A1A0D]'
            }`}
          >
            <button
              type="button"
              onClick={() => setEditingAnimal(null)}
              className="absolute top-5 right-5 p-2 rounded-full opacity-60 hover:opacity-100 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2.5 mb-4">
              <div className="w-9 h-9 rounded-xl bg-[#C18A45]/15 text-[#C18A45] flex items-center justify-center">
                <Edit3 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-serif font-bold text-xl leading-tight">
                  {isAmharic ? 'የከብት ዝርዝርን አርትዕ' : 'Edit Livestock Listing'}
                </h3>
                <span className="text-[11px] font-mono text-[#C18A45] font-bold">
                  ID: {editingAnimal.id}
                </span>
              </div>
            </div>

            {/* Quick Restock / Relist Banner for Sold Animals */}
            {editingAnimal.status === 'sold' && (
              <div className="mb-4 p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                <div>
                  <div className="flex items-center gap-1.5 font-bold text-amber-500">
                    <AlertTriangle className="w-4 h-4 shrink-0" />
                    <span>{isAmharic ? 'በአሁኑ ጊዜ እንደተሸጠ ተመዝግቧል' : 'Currently Marked as SOLD'}</span>
                  </div>
                  <p className="text-[11px] opacity-75 mt-0.5">
                    {isAmharic
                      ? '1 ራስ ከብት ወደ ክምችት ለመመለስ እና በገበያ ላይ እንዲታይ ለማድረግ ከታች ያለውን ይጫኑ።'
                      : 'Click the button to restock 1 head and make it available on the market immediately.'}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setEditAnimalStatus('available');
                    if (editAnimalQuantity <= 0) setEditAnimalQuantity(1);
                  }}
                  className="px-3 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-xs flex items-center gap-1.5 shadow-sm transition-all cursor-pointer whitespace-nowrap self-start sm:self-auto"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>{isAmharic ? 'ክምችት 1 አድርግ & ለሽያጭ አቅርብ' : 'Set Available (Stock: 1)'}</span>
                </button>
              </div>
            )}

            <form onSubmit={handleEditAnimalSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold uppercase mb-1 opacity-80">{isAmharic ? 'ዓይነት *' : 'Type *'}</label>
                  <select
                    value={editAnimalType}
                    onChange={(e) => setEditAnimalType(e.target.value as AnimalType)}
                    className="w-full px-3 py-2 rounded-xl text-xs border bg-transparent"
                  >
                    <option value="sheep" className="text-black">{isAmharic ? 'በግ' : 'Sheep'}</option>
                    <option value="goat" className="text-black">{isAmharic ? 'ፍየል' : 'Goat'}</option>
                    <option value="cow" className="text-black">{isAmharic ? 'ላም / በሬ' : 'Cow'}</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase mb-1 opacity-80">{isAmharic ? 'ዝርያ *' : 'Breed *'}</label>
                  <input
                    type="text"
                    required
                    value={editAnimalBreed}
                    onChange={(e) => setEditAnimalBreed(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl text-xs border bg-transparent"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold uppercase mb-1 opacity-80">{isAmharic ? 'ጾታ' : 'Gender'}</label>
                  <select
                    value={editAnimalGender}
                    onChange={(e) => setEditAnimalGender(e.target.value as 'Male' | 'Female')}
                    className="w-full px-3 py-2 rounded-xl text-xs border bg-transparent"
                  >
                    <option value="Male" className="text-black">{isAmharic ? 'ተባዕት' : 'Male'}</option>
                    <option value="Female" className="text-black">{isAmharic ? 'አንስታይ' : 'Female'}</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase mb-1 opacity-80">{isAmharic ? 'ሁኔታ *' : 'Status *'}</label>
                  <select
                    value={editAnimalStatus}
                    onChange={(e) => {
                      const newStat = e.target.value as AnimalStatus;
                      setEditAnimalStatus(newStat);
                      if (newStat === 'available' && editAnimalQuantity <= 0) {
                        setEditAnimalQuantity(1);
                      }
                    }}
                    className={`w-full px-3 py-2 rounded-xl text-xs font-bold border bg-transparent ${
                      editAnimalStatus === 'available'
                        ? 'text-emerald-500'
                        : editAnimalStatus === 'reserved'
                        ? 'text-amber-500'
                        : 'text-stone-400'
                    }`}
                  >
                    <option value="available" className="text-emerald-600 font-bold">{isAmharic ? 'ለሽያጭ የቀረበ' : 'Available'}</option>
                    <option value="reserved" className="text-amber-600 font-bold">{isAmharic ? 'የተያዘ (Hold)' : 'Reserved (Hold)'}</option>
                    <option value="sold" className="text-stone-600 font-bold">{isAmharic ? 'ተሽጦ ያለቀ' : 'Sold Out'}</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase mb-1 opacity-80">{isAmharic ? 'ክምችት (ራስ) *' : 'Stock (Head) *'}</label>
                  <input
                    type="number"
                    min="0"
                    required
                    value={editAnimalQuantity}
                    onChange={(e) => setEditAnimalQuantity(Math.max(0, Number(e.target.value)))}
                    className="w-full px-3 py-2 rounded-xl text-xs border bg-transparent font-mono font-bold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold uppercase mb-1 opacity-80">{isAmharic ? 'ክብደት (ኪሎ) *' : 'Weight (kg) *'}</label>
                  <input
                    type="number"
                    required
                    value={editAnimalWeight}
                    onChange={(e) => setEditAnimalWeight(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl text-xs border bg-transparent"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase mb-1 opacity-80">{isAmharic ? 'ዋጋ (ብር) *' : 'Price (ETB) *'}</label>
                  <input
                    type="number"
                    required
                    value={editAnimalPrice}
                    onChange={(e) => setEditAnimalPrice(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl text-xs border bg-transparent"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase mb-1 opacity-80">{isAmharic ? 'ቀለም' : 'Color'}</label>
                  <input
                    type="text"
                    value={editAnimalColor}
                    onChange={(e) => setEditAnimalColor(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl text-xs border bg-transparent"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase mb-1 opacity-80">{isAmharic ? 'መገኛ ቦታ' : 'Location'}</label>
                <input
                  type="text"
                  value={editAnimalLocation}
                  onChange={(e) => setEditAnimalLocation(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl text-xs border bg-transparent"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase mb-1 opacity-80">{isAmharic ? 'መግለጫ' : 'Description'}</label>
                <textarea
                  rows={2}
                  value={editAnimalDesc}
                  onChange={(e) => setEditAnimalDesc(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl text-xs border bg-transparent"
                />
              </div>

              {/* Photo Upload & Preview */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-semibold uppercase opacity-80">{isAmharic ? 'ፎቶ' : 'Photo'}</label>
                  <span className="text-[10.5px] opacity-60">{isAmharic ? 'የኮምፒውተር ፎቶ ይምረጡ ወይም ሊንክ ያስገቡ' : 'Upload local image or paste image link'}</span>
                </div>
                <div className="flex items-center gap-3">
                  <input
                    type="file"
                    ref={editAnimalImageInputRef}
                    accept="image/jpeg,image/png,image/webp,image/gif"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) handleEditAnimalImageFile(file);
                    }}
                  />
                  {editAnimalImage ? (
                    <div className="relative w-16 h-16 rounded-xl overflow-hidden border shrink-0 bg-black/10">
                      <img
                        src={editAnimalImage}
                        alt="Preview"
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          (e.target as HTMLElement).style.display = 'none';
                        }}
                      />
                      {isUploadingEditImage && (
                        <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                          <RefreshCw className="w-4 h-4 text-[#C18A45] animate-spin" />
                        </div>
                      )}
                    </div>
                  ) : null}
                  <div className="flex-1 min-w-0 space-y-1">
                    <input
                      type="text"
                      placeholder="https://... or /uploads/..."
                      value={editAnimalImage}
                      onChange={(e) => setEditAnimalImage(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl text-xs border bg-transparent font-mono"
                    />
                    <div className="flex items-center gap-2 text-[11px]">
                      <button
                        type="button"
                        onClick={() => editAnimalImageInputRef.current?.click()}
                        disabled={isUploadingEditImage}
                        className="font-semibold text-[#C18A45] hover:underline cursor-pointer disabled:opacity-50"
                      >
                        {isUploadingEditImage ? (isAmharic ? 'በመጫን ላይ...' : 'Uploading...') : (isAmharic ? 'ፎቶ ምረጥ' : 'Upload Local File')}
                      </button>
                      {editAnimalImage && (
                        <>
                          <span className="opacity-30">•</span>
                          <button
                            type="button"
                            onClick={() => setEditAnimalImage('')}
                            className="font-semibold text-red-400 hover:underline cursor-pointer"
                          >
                            {isAmharic ? 'አስወግድ' : 'Remove'}
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="editAnimalFeatured"
                  checked={editAnimalFeatured}
                  onChange={(e) => setEditAnimalFeatured(e.target.checked)}
                  className="rounded border-[#C18A45] text-[#C18A45] focus:ring-[#C18A45]"
                />
                <label htmlFor="editAnimalFeatured" className="text-xs font-semibold cursor-pointer">
                  {isAmharic ? 'ይህንን ከብት በመነሻ ገጽ ላይ በጉልህ አሳይ' : 'Feature this animal on the Homepage'}
                </label>
              </div>

              <div className="flex items-center gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setEditingAnimal(null)}
                  className="flex-1 py-2.5 rounded-xl border text-xs font-bold hover:bg-black/5 dark:hover:bg-white/5 transition-colors cursor-pointer"
                >
                  {isAmharic ? 'ሰርዝ' : 'Cancel'}
                </button>
                <button
                  type="submit"
                  disabled={isUpdatingAnimal}
                  className="flex-1 py-2.5 rounded-xl bg-[#C18A45] hover:bg-[#A06E35] text-white font-bold text-xs shadow transition-all cursor-pointer disabled:opacity-50 flex items-center justify-center gap-1.5"
                >
                  {isUpdatingAnimal && <RefreshCw className="w-3.5 h-3.5 animate-spin" />}
                  <span>{isAmharic ? 'ለውጦችን መዝግብ' : 'Save Changes'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Celebration Package Modal */}
      {isAddPackageOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4">
          <div
            className={`relative w-full max-w-lg max-h-[88vh] rounded-3xl border shadow-2xl flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200 ${
              isDark ? 'bg-[#24170D] border-[#4A2C16] text-[#F4E8D0]' : 'bg-white border-[#E4D4BC] text-[#2A1A0D]'
            }`}
          >
            {/* Fixed Header */}
            <div className="p-4 sm:p-5 border-b flex items-center justify-between shrink-0" style={{ borderColor: isDark ? '#4A2C16' : '#E4D4BC' }}>
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-amber-500/15 text-amber-500 flex items-center justify-center">
                  <Gift className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-serif font-bold text-base sm:text-lg leading-tight">{isAmharic ? 'የበዓል ጥቅል ፍጠር' : 'Create Celebration Package'}</h3>
                  <p className="text-[11px] opacity-70">{isAmharic ? 'ጥቅሉን በቀጥታ ወደ ዳታቤዝ ያስገቡ' : 'Add bundle directly to database'}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsAddPackageOpen(false)}
                className="p-1.5 rounded-full hover:bg-black/10 dark:hover:bg-white/10 opacity-70 hover:opacity-100 transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Form with Scrollable Content & Sticky Footer */}
            <form onSubmit={handleAddPackageSubmit} className="flex flex-col flex-1 min-h-0">
              <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-3.5">
                
                {/* Package Titles */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  <div>
                    <label className="block text-[11px] font-bold uppercase mb-1 opacity-80">{isAmharic ? 'ስም (በእንግሊዝኛ) *' : 'Name (English) *'}</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Enkutatash Royal Feast"
                      value={newPkgName}
                      onChange={(e) => setNewPkgName(e.target.value)}
                      className="w-full px-3 py-1.5 rounded-xl text-xs border bg-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold uppercase mb-1 opacity-80">{isAmharic ? 'ስም (በአማርኛ)' : 'Name (Amharic)'}</label>
                    <input
                      type="text"
                      placeholder="የእንቁጣጣሽ ድግስ ጥቅል"
                      value={newPkgAmharicName}
                      onChange={(e) => setNewPkgAmharicName(e.target.value)}
                      className="w-full px-3 py-1.5 rounded-xl text-xs border bg-transparent"
                    />
                  </div>
                </div>

                {/* Tagline & Badge */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  <div>
                    <label className="block text-[11px] font-bold uppercase mb-1 opacity-80">{isAmharic ? 'ንዑስ ርዕስ / መግለጫ' : 'Tagline / Subtitle'}</label>
                    <input
                      type="text"
                      placeholder="e.g. Holiday Feast for 15-20 Guests"
                      value={newPkgTagline}
                      onChange={(e) => setNewPkgTagline(e.target.value)}
                      className="w-full px-3 py-1.5 rounded-xl text-xs border bg-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold uppercase mb-1 opacity-80">{isAmharic ? 'የባጅ ምልክት' : 'Badge Label'}</label>
                    <input
                      type="text"
                      placeholder="e.g. Most Popular, Holiday Special"
                      value={newPkgBadge}
                      onChange={(e) => setNewPkgBadge(e.target.value)}
                      className="w-full px-3 py-1.5 rounded-xl text-xs border bg-transparent"
                    />
                  </div>
                </div>

                {/* Description */}
                <div>
                  <label className="block text-[11px] font-bold uppercase mb-1 opacity-80">{isAmharic ? 'መግለጫ *' : 'Description *'}</label>
                  <textarea
                    rows={2}
                    required
                    placeholder="Describe included meats, beverages, and celebration items..."
                    value={newPkgDescription}
                    onChange={(e) => setNewPkgDescription(e.target.value)}
                    className="w-full px-3 py-1.5 rounded-xl text-xs border bg-transparent"
                  />
                </div>

                {/* Pricing & Featured */}
                <div className="grid grid-cols-3 gap-2.5">
                  <div>
                    <label className="block text-[11px] font-bold uppercase mb-1 opacity-80">{isAmharic ? 'የመሸጫ ዋጋ *' : 'Selling Price *'}</label>
                    <input
                      type="number"
                      required
                      min={1}
                      value={newPkgPackagePrice}
                      onChange={(e) => setNewPkgPackagePrice(Number(e.target.value))}
                      className="w-full px-3 py-1.5 rounded-xl text-xs border bg-transparent font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold uppercase mb-1 opacity-80">{isAmharic ? 'የቀድሞ ዋጋ *' : 'Original Price *'}</label>
                    <input
                      type="number"
                      required
                      min={1}
                      value={newPkgOriginalPrice}
                      onChange={(e) => setNewPkgOriginalPrice(Number(e.target.value))}
                      className="w-full px-3 py-1.5 rounded-xl text-xs border bg-transparent font-mono"
                    />
                  </div>
                  <div className="flex flex-col justify-end">
                    <label className="flex items-center gap-1.5 text-xs font-semibold cursor-pointer pb-2">
                      <input
                        type="checkbox"
                        checked={newPkgFeatured}
                        onChange={(e) => setNewPkgFeatured(e.target.checked)}
                        className="w-3.5 h-3.5 rounded text-amber-500"
                      />
                      <span className="text-[11px]">{isAmharic ? 'በጉልህ የሚታይ' : 'Featured'}</span>
                    </label>
                  </div>
                </div>

                {/* Slots Capacity */}
                <div className="grid grid-cols-2 gap-2.5">
                  <div>
                    <label className="block text-[11px] font-bold uppercase mb-1 opacity-80">{isAmharic ? 'ያሉ ክፍት ቦታዎች (Slots) *' : 'Available Slots *'}</label>
                    <input
                      type="number"
                      required
                      min={0}
                      value={newPkgAvailableSlots}
                      onChange={(e) => setNewPkgAvailableSlots(Math.max(0, parseInt(e.target.value) || 0))}
                      className="w-full px-3 py-1.5 rounded-xl text-xs border bg-transparent font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold uppercase mb-1 opacity-80">{isAmharic ? 'ጠቅላላ ገደብ *' : 'Total Cap *'}</label>
                    <input
                      type="number"
                      required
                      min={1}
                      value={newPkgTotalSlots}
                      onChange={(e) => setNewPkgTotalSlots(Math.max(1, parseInt(e.target.value) || 1))}
                      className="w-full px-3 py-1.5 rounded-xl text-xs border bg-transparent font-mono"
                    />
                  </div>
                </div>

                {/* Real-time Savings Banner */}
                {newPkgOriginalPrice > newPkgPackagePrice && (
                  <div className="p-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs flex items-center justify-between">
                    <span className="text-[11px]">{isAmharic ? 'የቅናሽ ቁጠባ:' : 'Savings Discount:'}</span>
                    <span className="font-mono font-bold text-[11px]">
                      {isAmharic ? `${formatPrice(newPkgOriginalPrice - newPkgPackagePrice)} ይቆጥቡ` : `Save ${formatPrice(newPkgOriginalPrice - newPkgPackagePrice)}`} ({Math.round(((newPkgOriginalPrice - newPkgPackagePrice) / newPkgOriginalPrice) * 100)}% {isAmharic ? 'ቅናሽ' : 'OFF'})
                    </span>
                  </div>
                )}

                {/* Image Uploader (Enhanced & Enlarged) */}
                <div className="space-y-2 pt-1">
                  <div className="flex items-center justify-between">
                    <label className="block text-xs font-bold uppercase opacity-90">
                      {isAmharic ? 'የጥቅሉ ሽፋን ፎቶ *' : 'Package Cover Photo *'}
                    </label>
                    <div className="flex items-center gap-1 text-[10px]">
                      <button
                        type="button"
                        onClick={() => setPkgImageUploadMode('upload')}
                        className={`px-2.5 py-1 rounded-lg font-bold transition-colors cursor-pointer ${
                          pkgImageUploadMode === 'upload' ? 'bg-amber-500 text-black shadow-sm' : 'opacity-60 hover:opacity-100'
                        }`}
                      >
                        {isAmharic ? 'ፋይል ምረጥ' : 'File Upload'}
                      </button>
                      <button
                        type="button"
                        onClick={() => setPkgImageUploadMode('url')}
                        className={`px-2.5 py-1 rounded-lg font-bold transition-colors cursor-pointer ${
                          pkgImageUploadMode === 'url' ? 'bg-amber-500 text-black shadow-sm' : 'opacity-60 hover:opacity-100'
                        }`}
                      >
                        {isAmharic ? 'የሊንክ አድራሻ' : 'Paste URL'}
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
                        className={`flex items-center gap-4 p-3.5 rounded-2xl border ${
                          isDark ? 'bg-[#1B1208] border-[#4A2C16]' : 'bg-[#FAF7F0] border-[#E4D4BC]'
                        }`}
                      >
                        <div className="relative w-24 h-24 sm:w-28 sm:h-28 rounded-xl overflow-hidden shrink-0 border border-black/10 dark:border-white/10 bg-black/10 shadow-sm">
                          <img src={newPkgImage} alt="Package Preview" className="w-full h-full object-cover" />
                          {isUploadingPkgImage && (
                            <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                              <RefreshCw className="w-6 h-6 text-[#C18A45] animate-spin" />
                            </div>
                          )}
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-1.5">
                            <span className="text-xs sm:text-sm font-bold text-[#C18A45]">
                              {isUploadingPkgImage ? (isAmharic ? 'ምስል በመጫን ላይ...' : 'Uploading image...') : (isAmharic ? '✓ ፎቶው ተያይዟል' : '✓ High-Res Photo Attached')}
                            </span>
                          </div>
                          <p className="text-[11px] opacity-60 truncate mt-1">
                            {newPkgImage.startsWith('data:') ? (isAmharic ? 'ለህትመት ዝግጁ' : 'Ready for publishing') : newPkgImage}
                          </p>
                          <div className="mt-3 flex items-center gap-3">
                            <button
                              type="button"
                              onClick={() => pkgImageInputRef.current?.click()}
                              className="px-3 py-1 rounded-lg bg-[#C18A45]/15 hover:bg-[#C18A45]/25 text-[#C18A45] text-xs font-bold transition-all cursor-pointer"
                            >
                              {isAmharic ? 'ፎቶ ቀይር' : 'Change Photo'}
                            </button>
                            <button
                              type="button"
                              onClick={() => setNewPkgImage('')}
                              className="text-xs font-semibold text-red-400 hover:underline inline-flex items-center gap-1 cursor-pointer"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                              <span>{isAmharic ? 'አስወግድ' : 'Remove'}</span>
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
                        className={`cursor-pointer rounded-2xl border-2 border-dashed p-6 sm:p-8 text-center transition-all select-none group ${
                          isDraggingPkgImage
                            ? 'border-amber-500 bg-amber-500/20 scale-[1.01]'
                            : isDark
                            ? 'border-[#4A2C16] hover:border-amber-500/70 bg-[#1B1208]/80 hover:bg-[#1B1208]'
                            : 'border-[#E4D4BC] hover:border-amber-500/70 bg-[#FAF7F0] hover:bg-[#F3EDE2]'
                        }`}
                      >
                        <div className="flex flex-col items-center justify-center gap-2">
                          <div className="w-12 h-12 rounded-2xl bg-amber-500/15 text-amber-500 flex items-center justify-center group-hover:scale-110 transition-transform">
                            <UploadCloud className="w-6 h-6" />
                          </div>
                          <div>
                            <p className="text-xs sm:text-sm font-bold">
                              {isAmharic ? 'የጥቅሉን ፎቶ እዚህ ይጎትቱ ወይም ' : 'Drag & drop high-resolution photo here, or '}
                              <span className="text-amber-500 underline">{isAmharic ? 'ፋይል ይምረጡ' : 'browse files'}</span>
                            </p>
                            <p className="text-[11px] opacity-60 mt-0.5">
                              JPG, PNG, WEBP, GIF (እስከ 50MB)
                            </p>
                          </div>
                        </div>
                      </div>
                    )
                  ) : (
                    <div className="space-y-2">
                      <input
                        type="text"
                        placeholder="https://images.unsplash.com/... or /uploads/..."
                        value={newPkgImage}
                        onChange={(e) => setNewPkgImage(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl text-xs border bg-transparent font-mono"
                      />
                      {newPkgImage && (
                        <div className="flex items-center gap-3 p-2 rounded-xl border bg-black/5 dark:bg-white/5">
                          <img
                            src={newPkgImage}
                            alt="URL Preview"
                            className="w-16 h-16 rounded-lg object-cover border"
                            onError={(e) => {
                              (e.target as HTMLElement).style.display = 'none';
                            }}
                          />
                          <span className="text-xs opacity-70">{isAmharic ? 'የሊንክ ቅድመ እይታ' : 'URL preview attached'}</span>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Included Items Selector */}
                <div className="space-y-2 pt-2 border-t border-black/10 dark:border-white/10">
                  <div className="flex items-center justify-between">
                    <label className="block text-[11px] font-bold uppercase tracking-wider opacity-90">
                      {isAmharic ? `የተካተቱ እቃዎች (${newPkgSelectedItems.length} ተመርጠዋል) *` : `Included Items (${newPkgSelectedItems.length} selected) *`}
                    </label>
                    <span className="text-[10.5px] text-amber-500 font-semibold">{isAmharic ? 'ለመምረጥ ይጫኑ' : 'Click to select'}</span>
                  </div>

                  {/* Available Catalog Items */}
                  <div className="grid grid-cols-2 gap-1.5 max-h-36 overflow-y-auto p-1 border rounded-2xl border-black/5 dark:border-white/5">
                    {catalogItems.map((item) => {
                      const isSelected = newPkgSelectedItems.some(i => i.id === item.id);
                      return (
                        <button
                          type="button"
                          key={item.id}
                          onClick={() => handleToggleCatalogItem(item)}
                          className={`p-1.5 rounded-xl border text-left flex items-center gap-1.5 transition-all cursor-pointer ${
                            isSelected
                              ? 'bg-amber-500/20 border-amber-500 text-amber-500'
                              : 'bg-black/5 dark:bg-white/5 border-transparent opacity-70 hover:opacity-100'
                          }`}
                        >
                          <div className="w-3.5 h-3.5 rounded border flex items-center justify-center shrink-0 border-current">
                            {isSelected && <Check className="w-2.5 h-2.5 stroke-[3]" />}
                          </div>
                          <div className="min-w-0">
                            <div className="text-[10.5px] font-bold truncate">{item.name}</div>
                            <div className="text-[9px] opacity-70">{formatPrice(item.price)}</div>
                          </div>
                        </button>
                      );
                    })}
                  </div>

                  {/* Quick Add Custom Item */}
                  <div className="pt-1 flex flex-col sm:flex-row gap-1.5 items-center">
                    <input
                      type="text"
                      placeholder={isAmharic ? 'ብጁ እቃ (ለምሳሌ፦ 5 ኪሎ በርበሬ)' : 'Custom item (e.g. 5kg Extra Berbere)'}
                      value={customItemName}
                      onChange={(e) => setCustomItemName(e.target.value)}
                      className="flex-1 w-full px-2.5 py-1.5 rounded-xl text-xs border bg-transparent"
                    />
                    <select
                      value={customItemCategory}
                      onChange={(e) => setCustomItemCategory(e.target.value as any)}
                      className="w-full sm:w-32 px-2 py-1.5 rounded-xl text-xs border bg-transparent"
                    >
                      <option value="meat_livestock" className="text-black">{isAmharic ? 'ስጋ' : 'Meat'}</option>
                      <option value="wine" className="text-black">{isAmharic ? 'ወይን፣ ውስኪ & ጠጅ' : 'Wine, Whiskies & Tej'}</option>
                      <option value="eggs" className="text-black">{isAmharic ? 'የእርሻ እንቁላል' : 'Farm Eggs'}</option>
                      <option value="flowers" className="text-black">{isAmharic ? 'አበቦች' : 'Flowers'}</option>
                    </select>
                    <button
                      type="button"
                      onClick={handleAddCustomItem}
                      className="w-full sm:w-auto px-3 py-1.5 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-500 text-xs font-bold transition-colors whitespace-nowrap cursor-pointer"
                    >
                      {isAmharic ? '+ አክል' : '+ Add'}
                    </button>
                  </div>
                </div>

              </div>

              {/* Sticky Footer */}
              <div className="p-3.5 sm:p-4 border-t shrink-0 flex items-center gap-2 bg-black/[0.02] dark:bg-white/[0.02]" style={{ borderColor: isDark ? '#4A2C16' : '#E4D4BC' }}>
                <button
                  type="button"
                  onClick={() => setIsAddPackageOpen(false)}
                  className="w-1/3 py-2.5 rounded-xl border text-xs font-semibold hover:bg-black/5 dark:hover:bg-white/5 transition-colors cursor-pointer"
                >
                  {isAmharic ? 'ሰርዝ' : 'Cancel'}
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-black font-extrabold text-xs shadow-md hover:scale-[1.01] active:scale-[0.99] transition-all cursor-pointer"
                >
                  {isAmharic ? 'የበዓል ጥቅሉን ይፋ አድርግ' : 'Publish Celebration Package'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Restock Package Slots Modal */}
      {restockModalPackage && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div
            className={`relative w-full max-w-md rounded-3xl border shadow-2xl p-6 sm:p-8 animate-in fade-in zoom-in-95 duration-200 ${
              isDark ? 'bg-[#24170D] border-[#4A2C16] text-[#F4E8D0]' : 'bg-white border-[#E4D4BC] text-[#2A1A0D]'
            }`}
          >
            <button
              onClick={() => setRestockModalPackage(null)}
              className="absolute top-5 right-5 p-2 rounded-full opacity-60 hover:opacity-100 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="font-serif font-bold text-xl mb-1 flex items-center gap-2">
              <Gift className="w-5 h-5 text-[#C18A45]" />
              <span>{isAmharic ? 'የጥቅል ክምችት ቦታዎችን ያስተካክሉ' : 'Adjust Package Inventory Slots'}</span>
            </h3>
            <p className="text-xs opacity-70 mb-4">
              {isAmharic ? 'ክፍት የትዕዛዝ ቦታዎችን ለ ' : 'Set the available access slots for '}<strong>{restockModalPackage.name}</strong>.
            </p>

            <form onSubmit={handleSaveRestockSlots} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase mb-1.5 opacity-80">
                  {isAmharic ? 'ቀሪ ክፍት ቦታዎች (Slots) *' : 'Available Slots Remaining *'}
                </label>
                <input
                  type="number"
                  min="0"
                  required
                  value={restockSlotsInput}
                  onChange={(e) => setRestockSlotsInput(Math.max(0, parseInt(e.target.value) || 0))}
                  className="w-full px-3.5 py-2.5 rounded-xl text-sm border bg-transparent font-mono font-bold"
                />
                <p className="text-[11px] opacity-60 mt-1">
                  {isAmharic
                    ? 'በትዕዛዝ ጊዜ ይቀንሳል። 0 ሲሆን ጥቅሉ ተሽጦ እንዳለቀ ይታያል።'
                    : 'Decreases on every order/reservation. If set to 0, package will be marked as OUT OF STOCK.'}
                </p>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase mb-1.5 opacity-80">
                  {isAmharic ? 'ጠቅላላ ገደብ (Cap)' : 'Total Slots (Cap)'}
                </label>
                <input
                  type="number"
                  min="1"
                  required
                  value={restockTotalInput}
                  onChange={(e) => setRestockTotalInput(Math.max(1, parseInt(e.target.value) || 1))}
                  className="w-full px-3.5 py-2.5 rounded-xl text-sm border bg-transparent font-mono font-bold"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setRestockModalPackage(null)}
                  className="flex-1 py-2.5 rounded-xl border text-xs font-semibold hover:bg-black/5 dark:hover:bg-white/5 cursor-pointer"
                >
                  {isAmharic ? 'ሰርዝ' : 'Cancel'}
                </button>
                <button
                  type="submit"
                  disabled={isRestocking}
                  className="flex-1 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-black font-bold text-xs shadow-md disabled:opacity-50 cursor-pointer"
                >
                  {isRestocking ? (isAmharic ? 'በማስቀመጥ ላይ...' : 'Saving...') : (isAmharic ? 'ቦታዎችን መዝግብ & አድስ' : 'Save & Update Slots')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
