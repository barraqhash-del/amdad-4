import {
  Factory,
  Product,
  WholesalerProfile,
  MainOrder,
  SubOrder,
  CartItem,
  OrderStatus,
  AppNotification,
  DriverRosterItem,
  MerchantWarehouse,
  MerchantItem,
  MerchantSaleOrder,
  MerchantSaleItem,
  FactoryCategoryInfo,
  MerchantAccount,
  MerchantApprovalStatus,
  SubscriptionTier,
  BillingCycle,
  MerchantSubscription,
  FactoryAccount,
  FactoryApprovalStatus,
  FactorySubscription,
  DriverAccount,
  PlatformSubscriptionSettings,
  SubscriptionPlanConfig,
  SpecialOfferConfig,
  PendingSubscriptionChange,
  EmployeeRecord,
  EmployeeAttendanceStatus,
  EmployeeAdvance,
  EmployeePenalty,
  MerchantWhatsAppConfig,
  EmployeeVoucher,
} from "../types";
import {
  INITIAL_FACTORIES,
  INITIAL_PRODUCTS,
  CURRENT_WHOLESALER,
  INITIAL_ORDERS,
  INITIAL_FACTORY_CATEGORIES,
} from "../data/mockData";

const SINGLE_DEFAULT_FACTORY: Factory = {
  id: "fac-1",
  name: "مصنع البركة للأغذية والمواشي",
  category: "food",
  categoryNameAr: "مواد غذائية وألبان",
  logo: "https://images.unsplash.com/photo-1542838132-92c53300491e?w=200&auto=format&fit=crop&q=80",
  city: "صنعاء",
  district: "منطقة الحصبة الصناعية",
  address: "شارع الخمسين، القطعة 142",
  phone: "771234567",
  email: "orders@albarakafoods.ye",
  rating: 5.0,
  ordersFulfilled: 0,
  verified: true,
  minOrderValue: 500,
  avgPreparationHours: 4,
  commercialReg: "1010482910",
};

const DEFAULT_MERCHANT_ACCOUNTS: MerchantAccount[] = [
  {
    id: "merch-101",
    email: "merchant@emdad.ye",
    password: "123",
    storeName: "أسواق ومحلات الخير المعتمدة",
    ownerName: "أحمد بن سالم بافلح",
    phone: "771234567",
    commercialReg: "1010482910",
    city: "صنعاء",
    district: "حي حدة",
    fullAddress: "شارع الخمسين، مقابل مجمع الخمسين",
    approvalStatus: "APPROVED",
    approvedAt: "2025-01-15T10:00:00.000Z",
    subscription: {
      planId: "PROFESSIONAL",
      planNameAr: "الاشتراك السنوي الشامل (50,000 ر.ي)",
      status: "ACTIVE",
      priceMonthly: 50000,
      billingCycle: "YEARLY",
      startDate: "2025-01-15",
      endDate: "2026-12-31",
      autoRenew: true,
      maxWarehouses: 10,
      maxItems: 5000,
      maxPOSRegisters: 10,
      features: [
        "وصول كامل لكافة خدمات وإمكانيات المنصة",
        "ربط مباشر بالمصانع وطلب بالجملة",
        "إدارة المخزون والكاشير ونقاط البيع (POS)",
        "دعم فني مخصص على مدار 24/7",
      ],
    },
    createdAt: "2025-01-15T09:00:00.000Z",
  },
  {
    id: "merch-102",
    email: "pending@emdad.ye",
    password: "123",
    storeName: "أسواق البركة والتوفير (جديد)",
    ownerName: "سعيد بن عبدالملك باوزير",
    phone: "775887766",
    commercialReg: "4030112233",
    city: "عدن",
    district: "حي المعلا",
    fullAddress: "شارع الرئيسي، عمارة الأمل",
    approvalStatus: "PENDING",
    approvalNote: "بانتظار موافقة وإعتماد السجل التجاري من قبل إدارة المنصة (المرة الأولى)",
    subscription: {
      planId: "STARTER",
      planNameAr: "الاشتراك الشهري (5,000 ر.ي)",
      status: "ACTIVE",
      priceMonthly: 5000,
      billingCycle: "MONTHLY",
      startDate: "2026-03-01",
      endDate: "2026-04-01",
      autoRenew: false,
      maxWarehouses: 10,
      maxItems: 5000,
      maxPOSRegisters: 10,
      features: [
        "وصول كامل لكافة خدمات المنصة",
        "إدارة مخزون ونقاط بيع",
        "تنبيهات واستعراض المصانع",
      ],
    },
    createdAt: "2026-03-01T11:20:00.000Z",
  },
  {
    id: "merch-103",
    email: "suspended@emdad.ye",
    password: "123",
    storeName: "مؤسسة النور الموقوفة",
    ownerName: "عمر العولقي",
    phone: "730334455",
    commercialReg: "2050998877",
    city: "تعز",
    district: "حي المسبح",
    fullAddress: "شارع جمال، بجانب البنك الأهلي",
    approvalStatus: "SUSPENDED",
    suspensionReason: "تم إيقاف الخدمة مؤقتاً بواسطة إدارة المنصة لمراجعة وثائق السجل والترخيص التجاري",
    suspendedAt: "2026-03-02T14:30:00.000Z",
    subscription: {
      planId: "PROFESSIONAL",
      planNameAr: "الاشتراك السنوي (50,000 ر.ي)",
      status: "SUSPENDED",
      priceMonthly: 50000,
      billingCycle: "YEARLY",
      startDate: "2025-10-01",
      endDate: "2026-10-01",
      autoRenew: true,
      maxWarehouses: 10,
      maxItems: 5000,
      maxPOSRegisters: 10,
      features: ["إدارة المستودعات", "تحليلات متقدمة"],
    },
    createdAt: "2025-10-01T08:00:00.000Z",
  },
];

const DEFAULT_FACTORY_ACCOUNTS: FactoryAccount[] = [
  {
    id: "fac-acc-101",
    email: "factory@emdad.ye",
    password: "123",
    factoryName: "مصنع البركة للأغذية والمواشي",
    ownerName: "المهندس/ يحيى بن شملان",
    phone: "771234567",
    commercialReg: "1010482910",
    category: "food",
    categoryNameAr: "مواد غذائية وألبان",
    city: "صنعاء",
    district: "منطقة الحصبة الصناعية",
    fullAddress: "شارع الخمسين، القطعة 142",
    factoryId: "fac-1",
    approvalStatus: "APPROVED",
    approvedAt: "2025-01-10T08:00:00.000Z",
    subscription: {
      planId: "PROFESSIONAL",
      planNameAr: "الاشتراك السنوي للمصانع ($3,000)",
      status: "ACTIVE",
      priceMonthly: 3000,
      billingCycle: "YEARLY",
      startDate: "2025-01-10",
      endDate: "2026-12-31",
      autoRenew: true,
      maxProducts: 10000,
      maxMonthlyOrders: 50000,
      maxDrivers: 50,
      features: [
        "إضافة وإدارة منتجات غير محدودة",
        "متابعة وإدارة طلبيات بالجملة مباشرة",
        "إدارة أسطول السائقين والشحن بالتطبيقات",
        "تحليلات إنتاجية ومبيعات ذكية 100%",
        "ربط مباشر بالتجار في كافة المحافظات",
        "دعم فني وتدريب كادر المصنع 24/7",
      ],
    },
    createdAt: "2025-01-10T08:00:00.000Z",
  },
  {
    id: "fac-acc-102",
    email: "pending.factory@emdad.ye",
    password: "123",
    factoryName: "مصنع البلاستيك والتغليف الوطني (جديد)",
    ownerName: "الشيخ/ فؤاد باعباد",
    phone: "775112233",
    commercialReg: "4030889911",
    category: "plastics",
    categoryNameAr: "بلاستيك وتغليف",
    city: "عدن",
    district: "المنطقة الصناعية - كابوتا",
    fullAddress: "شارع التغليف، قطعة 8",
    factoryId: "fac-2",
    approvalStatus: "PENDING",
    approvalNote: "بانتظار مراجعة وتوثيق السجل التجاري الصناعي من قِبل إدارة المنصة (المرة الأولى)",
    subscription: {
      planId: "STARTER",
      planNameAr: "الاشتراك الشهري للمصانع ($300)",
      status: "ACTIVE",
      priceMonthly: 300,
      billingCycle: "MONTHLY",
      startDate: "2026-03-01",
      endDate: "2026-04-01",
      autoRenew: false,
      maxProducts: 10000,
      maxMonthlyOrders: 50000,
      maxDrivers: 50,
      features: [
        "منتجات وطلبيات غير محدودة",
        "إدارة أسطول السائقين والطلبات",
      ],
    },
    createdAt: "2026-03-01T09:00:00.000Z",
  },
  {
    id: "fac-acc-103",
    email: "suspended.factory@emdad.ye",
    password: "123",
    factoryName: "مصنع الكيماويات والمستلزمات الموقوف",
    ownerName: "صالح الريمي",
    phone: "730998877",
    commercialReg: "2050114455",
    category: "chemical",
    categoryNameAr: "مواد كيميائية وتنظيف",
    city: "تعز",
    district: "الحوبان الصناعية",
    fullAddress: "شارع المصانع، مقابل محطة الكهرباء",
    factoryId: "fac-3",
    approvalStatus: "SUSPENDED",
    suspensionReason: "تم إيقاف حساب المصنع مؤقتاً لتحديث تراخيص البيئة والسلامة الصناعية مع الإدارة",
    suspendedAt: "2026-03-02T11:00:00.000Z",
    subscription: {
      planId: "ENTERPRISE_VIP",
      planNameAr: "الاشتراك السنوي للمصانع ($3,000)",
      status: "SUSPENDED",
      priceMonthly: 3000,
      billingCycle: "YEARLY",
      startDate: "2025-08-01",
      endDate: "2026-08-01",
      autoRenew: true,
      maxProducts: 10000,
      maxMonthlyOrders: 50000,
      maxDrivers: 50,
      features: ["منتجات غير محدودة", "دعم أسطول ضخم", "ربط آلي بالكامل"],
    },
    createdAt: "2025-08-01T10:00:00.000Z",
  },
];

const DEFAULT_DRIVER_ACCOUNTS: DriverAccount[] = [
  {
    id: "drv-101",
    username: "ahmed77",
    password: "123",
    driverName: "أحمد علي المروني",
    phone: "771122334",
    email: "ahmed.driver@emdad.ye",
    vehicleNo: "أ ب ج 4921",
    vehicleType: "دينا جامبو 5 طن مبردة",
    factoryId: "fac-1",
    factoryName: "مصنع البركة للأغذية والمواشي",
    approvalStatus: "APPROVED",
    createdSource: "FACTORY_CREATED",
    approvalNote: "سائق معتمد من المصنع لدخول تطبيق التوصيل المباشر",
    notes: "خط صنعاء - تعز - الحديدة (سائق معتمد)",
    createdAt: "2025-01-15T00:00:00.000Z",
  },
  {
    id: "drv-102",
    username: "saleh73",
    password: "123",
    driverName: "صالح عبد الله الريمي",
    phone: "733445566",
    vehicleNo: "س ص ع 8812",
    vehicleType: "شاحنة تريلة 20 طن",
    factoryId: "fac-1",
    factoryName: "مصنع البركة للأغذية والمواشي",
    approvalStatus: "APPROVED",
    createdSource: "FACTORY_CREATED",
    approvalNote: "سائق معتمد من المصنع",
    notes: "شحن المحافظات الجنوبية والساحل",
    createdAt: "2025-01-16T00:00:00.000Z",
  },
  {
    id: "drv-103",
    username: "pending_driver",
    password: "123",
    driverName: "محمد عبد الملك السائق",
    phone: "775544332",
    email: "pending.driver@emdad.ye",
    vehicleNo: "ط ك ل 1199",
    vehicleType: "شاحنة نقل خفيف 3 طن",
    factoryId: "fac-1",
    factoryName: "مصنع البركة للأغذية والمواشي",
    approvalStatus: "PENDING",
    createdSource: "SELF_REGISTER",
    approvalNote: "بانتظار مراجعة واعتماد مسؤول الحركة بالمصنع لربط الشاحنة والتطبيق",
    notes: "سائق جديد - قدم طلب تسجيل من التطبيق",
    createdAt: "2026-03-01T10:00:00.000Z",
  },
  {
    id: "drv-201",
    username: "hani_fac2",
    password: "123",
    driverName: "هاني سالم باعباد",
    phone: "772233445",
    vehicleNo: "ع ف ق 5021",
    vehicleType: "شاحنة مغلقة 8 طن",
    factoryId: "fac-2",
    factoryName: "مصنع الأمل للبلاستيك والتغليف",
    approvalStatus: "APPROVED",
    createdSource: "FACTORY_CREATED",
    approvalNote: "سائق معتمد لخط البلاستيك والتغليف",
    notes: "نقل شحنات البلاستيك لمنطقة عدن ولحج",
    createdAt: "2025-02-01T00:00:00.000Z",
  },
  {
    id: "drv-202",
    username: "tareq_fac2",
    password: "123",
    driverName: "طارق منصور اليافعي",
    phone: "734455667",
    vehicleNo: "ك ل م 8833",
    vehicleType: "دينا نقل 4 طن",
    factoryId: "fac-2",
    factoryName: "مصنع الأمل للبلاستيك والتغليف",
    approvalStatus: "PENDING",
    createdSource: "SELF_REGISTER",
    approvalNote: "طلب تفعيل حساب جديد لمصنع الأمل",
    notes: "سائق جديد طلب الانضمام لأسطول البلاستيك",
    createdAt: "2026-03-02T11:00:00.000Z",
  },
  {
    id: "drv-301",
    username: "ammar_fac3",
    password: "123",
    driverName: "عمار ياسر التعزي",
    phone: "711224455",
    vehicleNo: "ن هـ و 3090",
    vehicleType: "صهريج ونقل مواد منظفة",
    factoryId: "fac-3",
    factoryName: "مصنع الشفاء للمنظفات والمطهرات",
    approvalStatus: "APPROVED",
    createdSource: "FACTORY_CREATED",
    approvalNote: "سائق معتمد لمصنع الشفاء",
    notes: "خط تعز - إب",
    createdAt: "2025-02-10T00:00:00.000Z",
  },
];

const DEFAULT_EMPLOYEES: EmployeeRecord[] = [];


const STORAGE_KEYS = {
  FACTORIES: "emdad_factories_v1",
  PRODUCTS: "emdad_products_v1",
  WHOLESALER: "emdad_wholesaler_v1",
  ORDERS: "emdad_orders_v1",
  CART: "emdad_cart_v1",
  NOTIFICATIONS: "emdad_notifications_v1",
  FAVORITE_FACTORIES: "emdad_favorite_factories_v1",
  DRIVERS: "emdad_drivers_v1",
  DRIVER_ACCOUNTS: "emdad_driver_accounts_v1",
  CURRENT_DRIVER_SESSION: "emdad_current_driver_session_v1",
  MERCHANT_WAREHOUSES: "emdad_merchant_warehouses_v1",
  MERCHANT_ITEMS: "emdad_merchant_items_v1",
  MERCHANT_SALES: "emdad_merchant_sales_v1",
  CATEGORIES: "emdad_categories_v1",
  MERCHANT_ACCOUNTS: "emdad_merchant_accounts_v2",
  CURRENT_MERCHANT_SESSION: "emdad_current_merchant_session_v2",
  FACTORY_ACCOUNTS: "emdad_factory_accounts_v1",
  CURRENT_FACTORY_SESSION: "emdad_current_factory_session_v1",
  SUBSCRIPTION_SETTINGS: "emdad_subscription_settings_v1",
  EMPLOYEES: "emdad_merchant_employees_v1",
  EMPLOYEE_VOUCHERS: "emdad_employee_vouchers_v1",
};

/**
 * Helper to strip base64 data URIs from any JSON string to save space
 */
function cleanBase64FromPayload(str: string): string {
  if (str.includes("data:image/")) {
    return str.replace(/data:image\/[a-zA-Z0-9+\/]+;base64,[^"'\s\\]+/g, "https://images.unsplash.com/photo-1542838132-92c53300491e?w=200&auto=format&fit=crop&q=80");
  }
  return str;
}

/**
 * Helper to strip base64 images and limit order histories to keep orders JSON lightweight
 */
function sanitizeOrdersForStorage(orders: MainOrder[], maxOrders: number = 15): MainOrder[] {
  if (!Array.isArray(orders)) return [];
  
  const sliced = orders.slice(0, maxOrders);

  return sliced.map((main) => ({
    ...main,
    subOrders: (main.subOrders || []).map((sub) => ({
      ...sub,
      history: (sub.history || []).slice(0, 5),
      items: (sub.items || []).map((item) => ({
        ...item,
        product: {
          ...item.product,
          image: item.product?.image?.startsWith("data:")
            ? "https://images.unsplash.com/photo-1542838132-92c53300491e?w=200&auto=format&fit=crop&q=80"
            : item.product?.image,
        },
      })),
    })),
  }));
}

/**
 * Safe localStorage writer that handles browser QuotaExceededError automatically
 * by pruning old notifications, clearing large base64 strings, and trimming order history logs.
 */
export function safeSetStorageItem(key: string, dataStr: string): void {
  try {
    localStorage.setItem(key, dataStr);
  } catch (err: any) {
    console.warn(`[Storage Quota Exceeded] Unable to save "${key}". Attempting automatic storage pruning...`, err);

    // 1. Remove non-critical storage items (notifications & merchant sales)
    try {
      localStorage.removeItem(STORAGE_KEYS.NOTIFICATIONS);
      localStorage.removeItem(STORAGE_KEYS.MERCHANT_SALES);
    } catch {}

    // 2. Retry with clean data (stripping bulky base64 data URIs)
    const cleanedData = cleanBase64FromPayload(dataStr);
    try {
      localStorage.setItem(key, cleanedData);
      return;
    } catch {}

    // 3. Special handling if target key is ORDERS
    if (key === STORAGE_KEYS.ORDERS) {
      try {
        const parsed = JSON.parse(cleanedData);
        if (Array.isArray(parsed)) {
          const sanitized15 = sanitizeOrdersForStorage(parsed, 15);
          localStorage.setItem(key, JSON.stringify(sanitized15));
          return;
        }
      } catch {}

      try {
        const parsed = JSON.parse(cleanedData);
        if (Array.isArray(parsed)) {
          const sanitized8 = sanitizeOrdersForStorage(parsed, 8);
          localStorage.setItem(key, JSON.stringify(sanitized8));
          return;
        }
      } catch {}
    }

    // 4. Special handling if target key is NOTIFICATIONS or PRODUCTS or MERCHANT_ITEMS
    if (key === STORAGE_KEYS.NOTIFICATIONS) {
      try {
        const parsed = JSON.parse(dataStr);
        if (Array.isArray(parsed)) {
          localStorage.setItem(key, JSON.stringify(parsed.slice(0, 5)));
          return;
        }
      } catch {}
    }

    if (key === STORAGE_KEYS.PRODUCTS || key === STORAGE_KEYS.MERCHANT_ITEMS) {
      try {
        const parsed = JSON.parse(cleanedData);
        if (Array.isArray(parsed) && parsed.length > 25) {
          localStorage.setItem(key, JSON.stringify(parsed.slice(0, 25)));
          return;
        }
      } catch {}
    }

    // 5. Emergency cleanup: remove all non-essential keys except core sessions and target key
    try {
      const keysToKeep = [
        STORAGE_KEYS.WHOLESALER,
        STORAGE_KEYS.CURRENT_MERCHANT_SESSION,
        STORAGE_KEYS.CURRENT_FACTORY_SESSION,
        STORAGE_KEYS.CURRENT_DRIVER_SESSION,
        key,
      ];
      for (let i = localStorage.length - 1; i >= 0; i--) {
        const k = localStorage.key(i);
        if (k && !keysToKeep.includes(k)) {
          localStorage.removeItem(k);
        }
      }
      localStorage.setItem(key, cleanedData);
    } catch (finalErr) {
      console.error(`[Storage Quota Error] Critical error saving key "${key}":`, finalErr);
    }
  }
}

const DEFAULT_SUBSCRIPTION_SETTINGS: PlatformSubscriptionSettings = {
  plans: [
    {
      id: "MERCHANT_YEARLY",
      targetType: "MERCHANT",
      cycle: "YEARLY",
      title: "الاشتراك السنوي الشامل للتجار",
      price: 50000,
      originalPrice: 60000,
      currency: "ر.ي",
      discountBadge: "توفير 10,000 ر.ي 🎉",
      description: "اشتراك سنوي يغطي جميع خدمات المنصة والمستودعات والربط المباشر بالمصانع",
      features: [
        "صلاحية 365 يوماً كاملة",
        "ربط مباشر مع جميع المصانع الوطنية",
        "إدارة كاملة للمستودعات وPOS",
        "تقارير المبيعات والدعم الفني المباشر",
      ],
      isActive: true,
    },
    {
      id: "MERCHANT_MONTHLY",
      targetType: "MERCHANT",
      cycle: "MONTHLY",
      title: "الاشتراك الشهري للتجار",
      price: 5000,
      originalPrice: 6000,
      currency: "ر.ي",
      discountBadge: "تجديد ميسر ⚡",
      description: "اشتراك شهري مرن يتيح التجربة وإمكانية التحويل للسنوي في أي وقت",
      features: [
        "صلاحية 30 يوماً متجددة",
        "جميع صلاحيات الربط بالمصانع",
        "إمكانية الترقية للسنوي بأي وقت",
      ],
      isActive: true,
    },
    {
      id: "FACTORY_YEARLY",
      targetType: "FACTORY",
      cycle: "YEARLY",
      title: "الاشتراك السنوي للمصانع والمنتجين",
      price: 3000,
      originalPrice: 3600,
      currency: "$",
      discountBadge: "خصم العصر الذهبي 👑",
      description: "ترخيص سنوي شامل لإضافة المنتجات، إدارة خطوط الإنتاج والأسطول",
      features: [
        "عرض غير محدود لمنتجات الجملة",
        "إدارة طلبات التوريد والأسطول",
        "توثيق العلامة التجارية بالسجل الرسمي",
        "أولوية الظهور في نتائج بحث التجار",
      ],
      isActive: true,
    },
    {
      id: "FACTORY_MONTHLY",
      targetType: "FACTORY",
      cycle: "MONTHLY",
      title: "الاشتراك الشهري للمصانع",
      price: 300,
      originalPrice: 350,
      currency: "$",
      discountBadge: "باقة التجربة 🏭",
      description: "اشتراك شهري للمصانع والناشئين في منصة إمداد",
      features: [
        "إدارة الكتالوج والمنتجات الأساسية",
        "استقبال الطلبات المباشرة من التجار",
      ],
      isActive: true,
    },
  ],
  specialOffers: [
    {
      id: "OFFER_LAUNCH",
      title: "عرض الانطلاقة الكبرى 2026",
      badge: "خصم 20% 🚀",
      discountPercent: 20,
      targetType: "ALL",
      validUntil: "2026-12-31",
      description: "خصم خاص على الاشتراكات السنوية للشركاء الجدد والمؤسسات الكبرى",
      code: "EMDAD2026",
      isActive: true,
    },
    {
      id: "OFFER_MERCHANT_SPECIAL",
      title: "خصم الدفع المباشر للتجار",
      badge: "توفير إضافي 💰",
      discountPercent: 15,
      targetType: "MERCHANT",
      validUntil: "2026-10-31",
      description: "خصم إضافي عند تجديد الاشتراك السنوي مقدماً",
      code: "MERCHANT15",
      isActive: true,
    },
  ],
  activePromoBanner: "🎉 عرض خاص بمناسبة انطلاق موسم 2026: خصم 20% على جميع الاشتراكات السنوية للتجار والمصانع!",
  isPromoBannerEnabled: true,
};

type Listener = () => void;

class StoreService {
  private listeners: Set<Listener> = new Set();

  constructor() {
    this.init();
  }

  private init() {
    const isZeroed = localStorage.getItem("emdad_zeroed_v10") === "true";
    if (!isZeroed) {
      this.zeroOutAllData();
      return;
    }

    if (!localStorage.getItem(STORAGE_KEYS.FACTORIES)) safeSetStorageItem(STORAGE_KEYS.FACTORIES, "[]");
    if (!localStorage.getItem(STORAGE_KEYS.PRODUCTS)) safeSetStorageItem(STORAGE_KEYS.PRODUCTS, "[]");
    if (!localStorage.getItem(STORAGE_KEYS.ORDERS)) safeSetStorageItem(STORAGE_KEYS.ORDERS, "[]");
    if (!localStorage.getItem(STORAGE_KEYS.CART)) safeSetStorageItem(STORAGE_KEYS.CART, "[]");
    if (!localStorage.getItem(STORAGE_KEYS.NOTIFICATIONS)) safeSetStorageItem(STORAGE_KEYS.NOTIFICATIONS, "[]");
    if (!localStorage.getItem(STORAGE_KEYS.DRIVERS)) safeSetStorageItem(STORAGE_KEYS.DRIVERS, "[]");
    if (!localStorage.getItem(STORAGE_KEYS.DRIVER_ACCOUNTS)) safeSetStorageItem(STORAGE_KEYS.DRIVER_ACCOUNTS, "[]");
    if (!localStorage.getItem(STORAGE_KEYS.MERCHANT_WAREHOUSES)) safeSetStorageItem(STORAGE_KEYS.MERCHANT_WAREHOUSES, "[]");
    if (!localStorage.getItem(STORAGE_KEYS.MERCHANT_ITEMS)) safeSetStorageItem(STORAGE_KEYS.MERCHANT_ITEMS, "[]");
    if (!localStorage.getItem(STORAGE_KEYS.MERCHANT_SALES)) safeSetStorageItem(STORAGE_KEYS.MERCHANT_SALES, "[]");
    if (!localStorage.getItem(STORAGE_KEYS.MERCHANT_ACCOUNTS)) safeSetStorageItem(STORAGE_KEYS.MERCHANT_ACCOUNTS, "[]");
    if (!localStorage.getItem(STORAGE_KEYS.FACTORY_ACCOUNTS)) safeSetStorageItem(STORAGE_KEYS.FACTORY_ACCOUNTS, "[]");
    if (!localStorage.getItem(STORAGE_KEYS.FAVORITE_FACTORIES)) safeSetStorageItem(STORAGE_KEYS.FAVORITE_FACTORIES, "[]");
    if (!localStorage.getItem(STORAGE_KEYS.CATEGORIES)) {
      safeSetStorageItem(STORAGE_KEYS.CATEGORIES, JSON.stringify(INITIAL_FACTORY_CATEGORIES));
    }
  }

  // Zero out all products, factories, merchants, drivers, orders, and demo items for clean fresh slate
  public zeroOutAllData(): void {
    safeSetStorageItem("emdad_zeroed_v10", "true");
    safeSetStorageItem("emdad_wiped_v2", "true");

    safeSetStorageItem(STORAGE_KEYS.FACTORIES, JSON.stringify([]));
    safeSetStorageItem(STORAGE_KEYS.PRODUCTS, JSON.stringify([]));
    safeSetStorageItem(STORAGE_KEYS.WHOLESALER, JSON.stringify({
      id: "wholesaler-01",
      name: "منصة إمداد المركزية",
      phone: "770000000",
      city: "صنعاء",
      district: "المركز الرئيسي",
      address: "برج إمداد للأعمال",
    }));
    safeSetStorageItem(STORAGE_KEYS.ORDERS, JSON.stringify([]));
    safeSetStorageItem(STORAGE_KEYS.CART, JSON.stringify([]));
    safeSetStorageItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify([]));
    safeSetStorageItem(STORAGE_KEYS.DRIVERS, JSON.stringify([]));
    safeSetStorageItem(STORAGE_KEYS.DRIVER_ACCOUNTS, JSON.stringify([]));
    localStorage.removeItem(STORAGE_KEYS.CURRENT_DRIVER_SESSION);

    safeSetStorageItem(STORAGE_KEYS.MERCHANT_WAREHOUSES, JSON.stringify([]));
    safeSetStorageItem(STORAGE_KEYS.MERCHANT_ITEMS, JSON.stringify([]));
    safeSetStorageItem(STORAGE_KEYS.MERCHANT_SALES, JSON.stringify([]));
    safeSetStorageItem(STORAGE_KEYS.MERCHANT_ACCOUNTS, JSON.stringify([]));
    localStorage.removeItem(STORAGE_KEYS.CURRENT_MERCHANT_SESSION);

    safeSetStorageItem(STORAGE_KEYS.FACTORY_ACCOUNTS, JSON.stringify([]));
    localStorage.removeItem(STORAGE_KEYS.CURRENT_FACTORY_SESSION);

    safeSetStorageItem(STORAGE_KEYS.FAVORITE_FACTORIES, JSON.stringify([]));
    safeSetStorageItem(STORAGE_KEYS.CATEGORIES, JSON.stringify(INITIAL_FACTORY_CATEGORIES));
    safeSetStorageItem("emdad_subscribed_merchants_v1", JSON.stringify([]));

    this.notify();
  }

  public subscribe(listener: Listener): () => void {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  private notify() {
    this.listeners.forEach((listener) => listener());
  }

  // Categories Management
  public getCategories(): FactoryCategoryInfo[] {
    try {
      const data = JSON.parse(localStorage.getItem(STORAGE_KEYS.CATEGORIES) || "[]");
      if (!Array.isArray(data) || data.length === 0) {
        safeSetStorageItem(STORAGE_KEYS.CATEGORIES, JSON.stringify(INITIAL_FACTORY_CATEGORIES));
        return INITIAL_FACTORY_CATEGORIES;
      }
      return data;
    } catch {
      return INITIAL_FACTORY_CATEGORIES;
    }
  }

  public addCategory(category: FactoryCategoryInfo): void {
    const categories = this.getCategories();
    const id = category.id?.trim().toLowerCase().replace(/\s+/g, "_") || `cat_${Date.now()}`;
    const newCat: FactoryCategoryInfo = {
      id,
      nameAr: category.nameAr,
      description: category.description || "",
      icon: category.icon || "Package",
    };
    categories.push(newCat);
    safeSetStorageItem(STORAGE_KEYS.CATEGORIES, JSON.stringify(categories));
    this.notify();
  }

  public updateCategory(id: string, updated: Partial<FactoryCategoryInfo>): void {
    const categories = this.getCategories();
    const idx = categories.findIndex((c) => c.id === id);
    if (idx !== -1) {
      categories[idx] = { ...categories[idx], ...updated };
      safeSetStorageItem(STORAGE_KEYS.CATEGORIES, JSON.stringify(categories));
      this.notify();
    }
  }

  public deleteCategory(id: string): void {
    const categories = this.getCategories().filter((c) => c.id !== id);
    safeSetStorageItem(STORAGE_KEYS.CATEGORIES, JSON.stringify(categories));
    this.notify();
  }

  public resetCategoriesToDefault(): void {
    safeSetStorageItem(STORAGE_KEYS.CATEGORIES, JSON.stringify(INITIAL_FACTORY_CATEGORIES));
    this.notify();
  }

  // Factories
  public getFactories(): Factory[] {
    try {
      const data = JSON.parse(localStorage.getItem(STORAGE_KEYS.FACTORIES) || "[]");
      if (!Array.isArray(data)) return [];
      return data;
    } catch {
      return [];
    }
  }

  public addFactory(factoryData: Omit<Factory, "id"> & { password?: string; ownerName?: string }): Factory {
    const factories = this.getFactories();
    const factoryId = "fac-" + Date.now();
    const newFactory: Factory = {
      ...factoryData,
      id: factoryId,
    };
    factories.unshift(newFactory);
    safeSetStorageItem(STORAGE_KEYS.FACTORIES, JSON.stringify(factories));

    // Also register corresponding factory account so it appears in subscribers panel
    const accounts = this.getFactoryAccounts();
    const now = new Date();
    const nextYear = new Date(now);
    nextYear.setFullYear(now.getFullYear() + 1);

    const newAccount: FactoryAccount = {
      id: `fac-acc-${Date.now()}`,
      email: factoryData.email || `factory_${Date.now()}@emdad.ye`,
      password: factoryData.password || "123456",
      factoryName: factoryData.name,
      ownerName: factoryData.ownerName || "إدارة المصنع",
      phone: factoryData.phone || "770000000",
      commercialReg: factoryData.commercialReg || "1010000000",
      category: factoryData.category || "food",
      city: factoryData.city || "صنعاء",
      district: factoryData.district || "القطاع الصناعي",
      fullAddress: factoryData.address || "شارع الرئيسي",
      factoryId: factoryId,
      approvalStatus: "APPROVED",
      approvalNote: "تم الاعتماد والموافقة التلقائية عند الإضافة المباشرة من لوحة التحكم",
      subscription: {
        planId: "ENTERPRISE_VIP",
        planNameAr: "باقة المصنع المتقدمة VIP",
        status: "ACTIVE",
        priceMonthly: 250000,
        startDate: now.toISOString().split("T")[0],
        endDate: nextYear.toISOString().split("T")[0],
        autoRenew: true,
        maxProducts: 1000,
        maxMonthlyOrders: 5000,
        maxDrivers: 50,
        features: ["منتجات غير محدودة", "إدارة أسطول السائقين", "إحصائيات متقدمة"],
      },
      createdAt: now.toISOString(),
      approvedAt: now.toISOString(),
    };
    accounts.unshift(newAccount);
    safeSetStorageItem(STORAGE_KEYS.FACTORY_ACCOUNTS, JSON.stringify(accounts));

    this.notify();
    return newFactory;
  }

  public updateFactory(factoryId: string, updatedFields: Partial<Factory>) {
    const factories = this.getFactories().map((f) =>
      f.id === factoryId ? { ...f, ...updatedFields } : f
    );
    safeSetStorageItem(STORAGE_KEYS.FACTORIES, JSON.stringify(factories));
    this.notify();
  }

  public updateFactoryAccountDetails(
    id: string,
    data: {
      factoryName?: string;
      ownerName?: string;
      username?: string;
      email?: string;
      phone?: string;
      commercialReg?: string;
      taxNumber?: string;
      category?: string;
      city?: string;
      district?: string;
      fullAddress?: string;
      password?: string;
      minOrderValue?: number;
      preparationHours?: number;
      lat?: number;
      lng?: number;
    }
  ): void {
    const accounts = this.getFactoryAccounts();
    const index = accounts.findIndex((a) => a.id === id || a.factoryId === id);
    if (index !== -1) {
      const acc = accounts[index];
      if (data.factoryName !== undefined) acc.factoryName = data.factoryName.trim();
      if (data.ownerName !== undefined) acc.ownerName = data.ownerName.trim();
      if (data.username !== undefined) acc.username = data.username.trim();
      if (data.email !== undefined) acc.email = data.email.trim();
      if (data.phone !== undefined) acc.phone = data.phone.trim();
      if (data.commercialReg !== undefined) acc.commercialReg = data.commercialReg.trim();
      if (data.taxNumber !== undefined) acc.taxNumber = data.taxNumber.trim();
      if (data.category !== undefined) acc.category = data.category;
      if (data.city !== undefined) acc.city = data.city;
      if (data.district !== undefined) acc.district = data.district;
      if (data.fullAddress !== undefined) acc.fullAddress = data.fullAddress;
      if (data.minOrderValue !== undefined) acc.minOrderValue = Number(data.minOrderValue);
      if (data.preparationHours !== undefined) acc.avgPreparationHours = Number(data.preparationHours);
      if (data.lat !== undefined) acc.lat = data.lat;
      if (data.lng !== undefined) acc.lng = data.lng;
      if (data.password && data.password.trim().length > 0) acc.password = data.password.trim();

      safeSetStorageItem(STORAGE_KEYS.FACTORY_ACCOUNTS, JSON.stringify(accounts));

      // Update session if active
      const current = this.getCurrentFactorySession();
      if (current && (current.id === id || current.factoryId === id)) {
        this.setCurrentFactorySession(acc);
      }

      // Update matching factory in FACTORIES
      const factories = this.getFactories();
      const facIndex = factories.findIndex(
        (f) => f.id === id || f.id === acc.factoryId || f.name === acc.factoryName
      );
      if (facIndex !== -1) {
        if (data.factoryName !== undefined) factories[facIndex].name = data.factoryName.trim();
        if (data.email !== undefined) factories[facIndex].email = data.email.trim();
        if (data.phone !== undefined) factories[facIndex].phone = data.phone.trim();
        if (data.commercialReg !== undefined) factories[facIndex].commercialReg = data.commercialReg.trim();
        if (data.category !== undefined) factories[facIndex].category = data.category;
        if (data.city !== undefined) factories[facIndex].city = data.city;
        if (data.district !== undefined) factories[facIndex].district = data.district;
        if (data.fullAddress !== undefined) factories[facIndex].fullAddress = data.fullAddress;
        if (data.minOrderValue !== undefined) factories[facIndex].minOrderValue = Number(data.minOrderValue);
        if (data.preparationHours !== undefined) factories[facIndex].avgPreparationHours = Number(data.preparationHours);

        safeSetStorageItem(STORAGE_KEYS.FACTORIES, JSON.stringify(factories));
      }

      this.notify();
    }
  }

  public deleteFactory(factoryId: string) {
    const factories = this.getFactories().filter((f) => f.id !== factoryId);
    safeSetStorageItem(STORAGE_KEYS.FACTORIES, JSON.stringify(factories));
    
    // Also remove corresponding factory account
    const accounts = this.getFactoryAccounts().filter(
      (a) => a.id !== factoryId && a.factoryId !== factoryId
    );
    safeSetStorageItem(STORAGE_KEYS.FACTORY_ACCOUNTS, JSON.stringify(accounts));

    // Also remove factory products
    const products = this.getProducts().filter((p) => p.factoryId !== factoryId);
    safeSetStorageItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(products));

    const current = this.getCurrentFactorySession();
    if (current && (current.id === factoryId || current.factoryId === factoryId)) {
      this.setCurrentFactorySession(null);
    }
    this.notify();
  }

  // Favorites / Frequent Suppliers
  public getFavoriteFactoryIds(): string[] {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEYS.FAVORITE_FACTORIES) || "[]");
    } catch {
      return [];
    }
  }

  public isFactoryFavorite(factoryId: string): boolean {
    return this.getFavoriteFactoryIds().includes(factoryId);
  }

  public toggleFavoriteFactory(factoryId: string) {
    let favs = this.getFavoriteFactoryIds();
    if (favs.includes(factoryId)) {
      favs = favs.filter((id) => id !== factoryId);
    } else {
      favs.push(factoryId);
    }
    safeSetStorageItem(STORAGE_KEYS.FAVORITE_FACTORIES, JSON.stringify(favs));
    this.notify();
  }

  // Drivers Fleet Roster Management
  public getDrivers(): DriverRosterItem[] {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEYS.DRIVERS) || "[]");
    } catch {
      return [];
    }
  }

  public addDriver(driverData: Omit<DriverRosterItem, "id" | "createdAt">): DriverRosterItem {
    const drivers = this.getDrivers();
    const newDriver: DriverRosterItem = {
      ...driverData,
      id: "drv-" + Date.now(),
      createdAt: new Date().toISOString(),
    };
    drivers.push(newDriver);
    safeSetStorageItem(STORAGE_KEYS.DRIVERS, JSON.stringify(drivers));
    this.notify();
    return newDriver;
  }

  public deleteDriver(driverId: string) {
    const drivers = this.getDrivers().filter((d) => d.id !== driverId);
    safeSetStorageItem(STORAGE_KEYS.DRIVERS, JSON.stringify(drivers));
    this.notify();
  }

  public updateDriver(driverId: string, updatedFields: Partial<DriverRosterItem>) {
    const drivers = this.getDrivers().map((d) =>
      d.id === driverId ? { ...d, ...updatedFields } : d
    );
    safeSetStorageItem(STORAGE_KEYS.DRIVERS, JSON.stringify(drivers));
    this.notify();
  }

  // Products
  public getProducts(): Product[] {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEYS.PRODUCTS) || "[]");
    } catch {
      return INITIAL_PRODUCTS;
    }
  }

  public addProduct(product: Product) {
    const products = this.getProducts();
    products.unshift(product);
    safeSetStorageItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(products));
    this.notify();
  }

  public updateProduct(updated: Product) {
    const products = this.getProducts().map((p) => (p.id === updated.id ? updated : p));
    safeSetStorageItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(products));
    this.notify();
  }

  public quickRestockProduct(productId: string, amount: number) {
    const products = this.getProducts().map((p) => {
      if (p.id === productId) {
        const newStock = Math.max(0, (p.stock || 0) + amount);
        return {
          ...p,
          stock: newStock,
          isAvailable: newStock > 0 ? true : p.isAvailable,
        };
      }
      return p;
    });
    safeSetStorageItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(products));
    this.notify();
  }

  public deleteProduct(productId: string) {
    const products = this.getProducts().filter((p) => p.id !== productId);
    safeSetStorageItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(products));
    this.notify();
  }

  // Wholesaler
  public getWholesaler(): WholesalerProfile {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEYS.WHOLESALER) || "{}");
    } catch {
      return CURRENT_WHOLESALER;
    }
  }

  public updateWholesaler(profile: WholesalerProfile) {
    safeSetStorageItem(STORAGE_KEYS.WHOLESALER, JSON.stringify(profile));
    this.notify();
  }

  // Cart
  public getCart(): CartItem[] {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEYS.CART) || "[]");
    } catch {
      return [];
    }
  }

  public addToCart(product: Product, quantity: number) {
    const cart = this.getCart();
    const existingIndex = cart.findIndex((item) => item.product.id === product.id);
    if (existingIndex > -1) {
      cart[existingIndex].quantity += quantity;
    } else {
      cart.push({
        product,
        quantity,
        factoryId: product.factoryId,
        factoryName: product.factoryName,
      });
    }
    safeSetStorageItem(STORAGE_KEYS.CART, JSON.stringify(cart));
    this.notify();
  }

  public updateCartQuantity(productId: string, quantity: number) {
    let cart = this.getCart();
    if (quantity <= 0) {
      cart = cart.filter((item) => item.product.id !== productId);
    } else {
      cart = cart.map((item) =>
        item.product.id === productId ? { ...item, quantity } : item
      );
    }
    safeSetStorageItem(STORAGE_KEYS.CART, JSON.stringify(cart));
    this.notify();
  }

  public clearCart() {
    safeSetStorageItem(STORAGE_KEYS.CART, JSON.stringify([]));
    this.notify();
  }

  // Orders & Auto-Split Logic
  public getMainOrders(): MainOrder[] {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEYS.ORDERS) || "[]");
    } catch {
      return INITIAL_ORDERS;
    }
  }

  public getSubOrdersForFactory(factoryId: string): SubOrder[] {
    const mainOrders = this.getMainOrders();
    const subOrders: SubOrder[] = [];
    mainOrders.forEach((main) => {
      main.subOrders.forEach((sub) => {
        if (sub.factoryId === factoryId) {
          subOrders.push(sub);
        }
      });
    });
    return subOrders.sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }

  /**
   * Helper to check active pending sub-orders for a specific factory for a wholesaler
   */
  public getActiveSubOrdersForFactory(wholesalerInput: WholesalerProfile | string, factoryId: string): SubOrder[] {
    const mainOrders = this.getMainOrders();
    const activeSubOrders: SubOrder[] = [];
    
    let targetId = "";
    let targetPhone = "";
    let targetStore = "";

    if (typeof wholesalerInput === "string") {
      const clean = wholesalerInput.trim().toLowerCase();
      targetId = clean;
      targetPhone = wholesalerInput.replace(/\D/g, "");
      targetStore = clean;
    } else if (wholesalerInput) {
      targetId = wholesalerInput.id ? wholesalerInput.id.trim().toLowerCase() : "";
      targetPhone = wholesalerInput.phone ? wholesalerInput.phone.replace(/\D/g, "") : "";
      targetStore = wholesalerInput.storeName ? wholesalerInput.storeName.trim().toLowerCase() : "";
    }

    if (!targetId && !targetPhone && !targetStore) {
      return [];
    }

    mainOrders.forEach((main) => {
      if (!main.wholesaler) return;
      const wId = main.wholesaler.id ? main.wholesaler.id.trim().toLowerCase() : "";
      const wPhone = main.wholesaler.phone ? main.wholesaler.phone.replace(/\D/g, "") : "";
      const wStore = main.wholesaler.storeName ? main.wholesaler.storeName.trim().toLowerCase() : "";

      const matchWholesaler =
        (targetId && wId && wId === targetId) ||
        (targetPhone && wPhone && wPhone === targetPhone) ||
        (targetStore && wStore && wStore === targetStore);

      if (matchWholesaler) {
        main.subOrders.forEach((sub) => {
          const matchFactory = sub.factoryId === factoryId || sub.factoryName === factoryId;
          if (
            matchFactory &&
            sub.status !== "DELIVERED" &&
            sub.status !== "CANCELLED"
          ) {
            activeSubOrders.push(sub);
          }
        });
      }
    });

    return activeSubOrders;
  }

  /**
   * Merge cart items into an existing pending sub-order
   */
  public mergeCartItemsIntoSubOrder(subOrderId: string, cartItemsToMerge: CartItem[]): MainOrder {
    const mainOrders = this.getMainOrders();
    let targetMainOrder: MainOrder | null = null;
    let targetSubOrder: SubOrder | null = null;

    for (const main of mainOrders) {
      const foundSub = main.subOrders.find((s) => s.id === subOrderId);
      if (foundSub) {
        targetMainOrder = main;
        targetSubOrder = foundSub;
        break;
      }
    }

    if (!targetMainOrder || !targetSubOrder) {
      throw new Error(`الطلبية الفرعية برقم (${subOrderId}) غير موجودة.`);
    }

    // Merge items into targetSubOrder
    cartItemsToMerge.forEach((ci) => {
      this.ensureMerchantItemExists(ci.product, ci.factoryId, ci.factoryName);
      const existingItem = targetSubOrder!.items.find((it) => it.product.id === ci.product.id);
      if (existingItem) {
        existingItem.quantity += ci.quantity;
      } else {
        targetSubOrder!.items.push({
          product: ci.product,
          quantity: ci.quantity,
          priceAtOrder: ci.product.price,
        });
      }
    });

    // Recalculate subtotal, tax, total
    let newSubtotal = 0;
    targetSubOrder.items.forEach((it) => {
      newSubtotal += (it.priceAtOrder || it.product.price) * it.quantity;
    });
    targetSubOrder.subtotal = newSubtotal;
    targetSubOrder.tax = newSubtotal * 0.15;
    targetSubOrder.total = newSubtotal + targetSubOrder.tax;
    targetSubOrder.updatedAt = new Date().toISOString();

    // Add history entry
    targetSubOrder.history.unshift({
      status: targetSubOrder.status,
      timestamp: new Date().toLocaleTimeString("ar-YE"),
      note: `تم دمج ${cartItemsToMerge.length} أصناف إضافية من السلة إلى هذه الطلبية المعلقة بنجاح.`,
    });

    // Recalculate parent main order total
    targetMainOrder.totalAmount = targetMainOrder.subOrders.reduce((sum, s) => sum + s.total, 0);

    // Save orders
    safeSetStorageItem(STORAGE_KEYS.ORDERS, JSON.stringify(mainOrders));

    // Send notification to factory
    this.addNotification({
      id: `notif-${Date.now()}-${subOrderId}`,
      targetRole: "FACTORY",
      factoryId: targetSubOrder.factoryId,
      title: "تحديث ودمج أصناف جديدة بالطلبية 📦",
      message: `قام متجر "${targetSubOrder.wholesaler.storeName}" بدمج منتجات جديدة بالطلبية المعلقة رقم ${subOrderId}. الإجمالي الجديد: ${targetSubOrder.total.toLocaleString("ar-YE")} ر.ي`,
      timestamp: new Date().toLocaleTimeString("ar-YE"),
      read: false,
      orderId: subOrderId,
      type: "STATUS_UPDATE",
    });

    this.clearCart();
    this.notify();

    return targetMainOrder;
  }

  /**
   * Core Requirement: Wholesaler submits unified cart, system automatically splits items into sub-orders per factory!
   */
  public createUnifiedOrder(
    wholesaler: WholesalerProfile,
    paymentMethod: "INVOICE_30_DAYS" | "CASH_ON_DELIVERY" | "BANK_TRANSFER",
    deliveryNotes?: string,
    selectedItems?: CartItem[]
  ): MainOrder {
    const allCart = this.getCart();
    const cart = selectedItems && selectedItems.length > 0 ? selectedItems : allCart;
    if (cart.length === 0) throw new Error("السلة فارغة أو لم يتم تحديد أي أصناف للطلب");

    const mainOrderId = `ORD-${Math.floor(1000 + Math.random() * 9000)}`;
    const nowStr = new Date().toISOString();

    // Group cart items strictly by Factory ID
    const factoryGroups: Record<string, { factoryName: string; items: CartItem[] }> = {};
    cart.forEach((item) => {
      const fKey = item.factoryId || item.product.factoryId || "fac-1";
      const fName = item.factoryName || item.product.factoryName || "مصنع عام";
      if (!factoryGroups[fKey]) {
        factoryGroups[fKey] = {
          factoryName: fName,
          items: [],
        };
      }
      factoryGroups[fKey].items.push(item);
    });

    // Auto-register purchased items into Merchant Items catalog
    cart.forEach((ci) => {
      this.ensureMerchantItemExists(ci.product, ci.factoryId, ci.factoryName);
    });

    const subOrders: SubOrder[] = [];
    let totalMainAmount = 0;

    let subIndex = 1;
    Object.entries(factoryGroups).forEach(([factoryId, group]) => {
      const subOrderId = `SUB-${mainOrderId.replace("ORD-", "")}-${subIndex++}`;
      
      let subtotal = 0;
      const orderItems = group.items.map((ci) => {
        const itemTotal = ci.product.price * ci.quantity;
        subtotal += itemTotal;
        return {
          product: ci.product,
          quantity: ci.quantity,
          priceAtOrder: ci.product.price,
        };
      });

      const tax = subtotal * 0.15;
      const total = subtotal + tax;
      totalMainAmount += total;

      const subOrder: SubOrder = {
        id: subOrderId,
        mainOrderId,
        factoryId,
        factoryName: group.factoryName,
        wholesaler,
        items: orderItems,
        subtotal,
        tax,
        total,
        status: "RECEIVED",
        createdAt: nowStr,
        updatedAt: nowStr,
        estimatedDeliveryDate: (() => {
          const estDate = new Date();
          estDate.setHours(estDate.getHours() + 24);
          const formattedDate = estDate.toLocaleDateString("ar-YE", {
            weekday: "long",
            year: "numeric",
            month: "short",
            day: "numeric",
          });
          return `${formattedDate} - (توقع دقيق 100%)`;
        })(),
        deliveryNotes: deliveryNotes || "",
        history: [
          {
            status: "RECEIVED",
            timestamp: new Date().toLocaleTimeString("ar-YE"),
            note: "تم إنشاء الطلبية وتقسيمها آلياً وتوجيهها للمصنع المعني",
          },
        ],
      };

      subOrders.push(subOrder);

      // Create notification for Factory
      this.addNotification({
        id: `notif-${Date.now()}-${subOrderId}`,
        targetRole: "FACTORY",
        factoryId,
        title: "طلبية جديدة متجهة لمصنعك 📦",
        message: `طلب جديد رقم ${subOrderId} من متجر "${wholesaler.storeName}" بقيمة ${total.toLocaleString(
          "ar-YE"
        )} ر.ي`,
        timestamp: new Date().toLocaleTimeString("ar-YE"),
        read: false,
        orderId: subOrderId,
        type: "NEW_ORDER",
      });
    });

    const mainOrder: MainOrder = {
      id: mainOrderId,
      wholesaler,
      subOrders,
      totalAmount: totalMainAmount,
      createdAt: nowStr,
      paymentMethod,
      statusSummary: `تم إرسال ${subOrders.length} طلبية إلى المصانع المعنية`,
    };

    const mainOrders = this.getMainOrders();
    mainOrders.unshift(mainOrder);
    safeSetStorageItem(STORAGE_KEYS.ORDERS, JSON.stringify(mainOrders));
    
    // Remove ordered items from cart and retain unselected ones
    const orderedProductIds = new Set(cart.map((c) => c.product.id));
    const remainingCart = allCart.filter((c) => !orderedProductIds.has(c.product.id));
    safeSetStorageItem(STORAGE_KEYS.CART, JSON.stringify(remainingCart));
    this.notify();

    return mainOrder;
  }

  public receiveSubOrderToWarehouse(
    sub: SubOrder,
    targetWarehouseId?: string
  ): { warehouseName: string; receivedItemsCount: number; totalQuantity: number } {
    let warehouses = this.getMerchantWarehouses();
    if (warehouses.length === 0) {
      const newWh = this.addMerchantWarehouse({
        name: "المستودع الرئيسي للمتجر",
        city: sub.wholesaler?.city || "صنعاء",
        district: sub.wholesaler?.district || "المحيط",
        address: sub.wholesaler?.fullAddress || "المقر الرئيسي",
        managerName: sub.wholesaler?.ownerName || "مدير المخزن",
        managerPhone: sub.wholesaler?.phone || "770000000",
        capacityNotes: "مخزن رئيسي تلقائي لاستلام توريدات المصانع",
        isDefault: true,
      });
      warehouses = [newWh];
    }

    const selectedWh =
      warehouses.find((w) => w.id === targetWarehouseId) ||
      warehouses.find((w) => w.isDefault) ||
      warehouses[0];
    const whId = selectedWh.id;

    const merchantItems = this.getMerchantItems();
    let totalQuantity = 0;

    sub.items.forEach((item) => {
      totalQuantity += item.quantity;
      const match = merchantItems.find(
        (m) =>
          (m.productId && m.productId === item.product.id) ||
          (m.sku && item.product.sku && m.sku === item.product.sku) ||
          m.name === item.product.name
      );

      if (match) {
        match.warehouseStock = match.warehouseStock || {};
        match.warehouseStock[whId] = (match.warehouseStock[whId] || 0) + item.quantity;
        match.totalStock = Object.values(match.warehouseStock).reduce(
          (a: number, b: number) => a + (Number(b) || 0),
          0
        );
        if (item.priceAtOrder && item.priceAtOrder > 0) {
          match.costPrice = item.priceAtOrder;
        }
      } else {
        const newItem: MerchantItem = {
          id: `mitem-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
          name: item.product.name,
          category: item.product.category || "مواد غذائية",
          sku: item.product.sku || `SKU-${Date.now()}`,
          barcode: item.product.barcode || `628${Math.floor(100000000 + Math.random() * 900000000)}`,
          unit: item.product.unit || "حبة",
          costPrice: item.priceAtOrder || item.product.price,
          sellingPrice: Math.round((item.priceAtOrder || item.product.price) * 1.25),
          minStockAlert: 10,
          warehouseStock: { [whId]: item.quantity },
          totalStock: item.quantity,
          factoryId: sub.factoryId,
          factoryName: sub.factoryName,
          productId: item.product.id,
          image: item.product.image,
          createdAt: new Date().toISOString(),
        };
        merchantItems.unshift(newItem);
      }
    });

    safeSetStorageItem(STORAGE_KEYS.MERCHANT_ITEMS, JSON.stringify(merchantItems));
    this.notify();

    return {
      warehouseName: selectedWh.name,
      receivedItemsCount: sub.items.length,
      totalQuantity,
    };
  }

  public updateSubOrderStatus(
    subOrderId: string,
    newStatus: OrderStatus,
    driverInfo?: SubOrder["assignedDriver"],
    note?: string,
    targetWarehouseId?: string
  ) {
    const mainOrders = this.getMainOrders();
    let updatedSubOrder: SubOrder | null = null;
    let wasAlreadyDelivered = false;

    mainOrders.forEach((main) => {
      main.subOrders.forEach((sub) => {
        if (sub.id === subOrderId) {
          if (sub.status === "DELIVERED") {
            wasAlreadyDelivered = true;
          }
          sub.status = newStatus;
          sub.updatedAt = new Date().toISOString();
          if (driverInfo) {
            sub.assignedDriver = driverInfo;
          }
          const statusTextAr: Record<OrderStatus, string> = {
            RECEIVED: "تم استلام الطلب",
            PROCESSING: "جاري التحضير والتعبئة",
            READY_FOR_DISPATCH: "جاهز للشحن والتسليم",
            LOADED_FROM_FACTORY: "تم استلام الطلبية من المصنع",
            OUT_FOR_DELIVERY: "قيد التوصيل مع السائق",
            ARRIVED_AT_DESTINATION: "وصلت الشاحنة إلى موقع التسليم",
            AWAITING_MERCHANT_CONFIRMATION: "تم تسليم الطلبية - بانتظار موافقة التاجر على التسليم",
            DELIVERED: "تم التسليم بنجاح وإيداع المنتجات بالمخزن",
            CANCELLED: "ملغي",
          };
          sub.history.unshift({
            status: newStatus,
            timestamp: new Date().toLocaleTimeString("ar-YE"),
            note: note || `تحديث حالة الطلب إلى: ${statusTextAr[newStatus]}`,
            updatedBy: driverInfo ? driverInfo.name : "إدارة المصنع / السائق",
          });
          updatedSubOrder = sub;
        }
      });
    });

    safeSetStorageItem(STORAGE_KEYS.ORDERS, JSON.stringify(mainOrders));

    if (updatedSubOrder) {
      const sub = updatedSubOrder as SubOrder;
      
      // Auto-receive products into merchant inventory on first delivery
      if (newStatus === "DELIVERED" && !wasAlreadyDelivered) {
        const result = this.receiveSubOrderToWarehouse(sub, targetWarehouseId);
        this.addNotification({
          id: `notif-${Date.now()}-del`,
          targetRole: "WHOLESALER",
          title: `تم إيداع الشحنة بالمخزن بنجاح 📦`,
          message: `تم تسليم الشحنة ${sub.id} وتزويد مستودع "${result.warehouseName}" بـ (${result.receivedItemsCount} أصناف / ${result.totalQuantity} وحدة).`,
          timestamp: new Date().toLocaleTimeString("ar-YE"),
          read: false,
          orderId: sub.id,
          type: "DELIVERED",
        });
      } else {
        // Notify Wholesaler
        this.addNotification({
          id: `notif-${Date.now()}`,
          targetRole: "WHOLESALER",
          title: `تحديث طلبية ${sub.factoryName} 🚚`,
          message: `تم تغيير حالة الشحنة ${sub.id} إلى "${sub.status}"`,
          timestamp: new Date().toLocaleTimeString("ar-YE"),
          read: false,
          orderId: sub.id,
          type: "STATUS_UPDATE",
        });
      }
    }

    this.notify();
  }

  // Notifications
  public getNotifications(): AppNotification[] {
    try {
      const raw = localStorage.getItem(STORAGE_KEYS.NOTIFICATIONS) || "[]";
      const notifs = JSON.parse(raw);
      if (Array.isArray(notifs)) {
        if (notifs.length > 30) {
          const trimmed = notifs.slice(0, 30);
          safeSetStorageItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify(trimmed));
          return trimmed;
        }
        return notifs;
      }
      return [];
    } catch {
      return [];
    }
  }

  public addNotification(notif: AppNotification) {
    let notifs = this.getNotifications();
    notifs.unshift(notif);
    if (notifs.length > 30) {
      notifs = notifs.slice(0, 30);
    }
    safeSetStorageItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify(notifs));
    this.notify();
  }

  public markNotificationAsRead(id: string) {
    const notifs = this.getNotifications().map((n) =>
      n.id === id ? { ...n, read: true } : n
    );
    safeSetStorageItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify(notifs));
    this.notify();
  }

  public deleteNotification(id: string) {
    const notifs = this.getNotifications().filter((n) => n.id !== id);
    safeSetStorageItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify(notifs));
    this.notify();
  }

  public toggleSubOrderItemVerification(subOrderId: string, productId: string) {
    const mainOrders = this.getMainOrders();
    mainOrders.forEach((main) => {
      main.subOrders.forEach((sub) => {
        if (sub.id === subOrderId) {
          const verified = sub.verifiedLoadedItems || [];
          if (verified.includes(productId)) {
            sub.verifiedLoadedItems = verified.filter((id) => id !== productId);
          } else {
            sub.verifiedLoadedItems = [...verified, productId];
          }
          sub.isFullyVerifiedForLoading = sub.items.every((it) =>
            sub.verifiedLoadedItems?.includes(it.product.id)
          );
        }
      });
    });
    safeSetStorageItem(STORAGE_KEYS.ORDERS, JSON.stringify(mainOrders));
    this.notify();
  }

  public markAllSubOrderItemsVerified(subOrderId: string) {
    const mainOrders = this.getMainOrders();
    mainOrders.forEach((main) => {
      main.subOrders.forEach((sub) => {
        if (sub.id === subOrderId) {
          sub.verifiedLoadedItems = sub.items.map((it) => it.product.id);
          sub.isFullyVerifiedForLoading = true;
        }
      });
    });
    safeSetStorageItem(STORAGE_KEYS.ORDERS, JSON.stringify(mainOrders));
    this.notify();
  }

  // Merchant Warehouses CRUD
  public getMerchantWarehouses(): MerchantWarehouse[] {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEYS.MERCHANT_WAREHOUSES) || "[]");
    } catch {
      return [];
    }
  }

  public addMerchantWarehouse(data: Omit<MerchantWarehouse, "id" | "createdAt">): MerchantWarehouse {
    const list = this.getMerchantWarehouses();
    const newWh: MerchantWarehouse = {
      ...data,
      id: `wh-${Date.now()}`,
      createdAt: new Date().toISOString(),
    };
    list.push(newWh);
    safeSetStorageItem(STORAGE_KEYS.MERCHANT_WAREHOUSES, JSON.stringify(list));
    this.notify();
    return newWh;
  }

  public updateMerchantWarehouse(id: string, data: Partial<MerchantWarehouse>): void {
    const list = this.getMerchantWarehouses().map((w) => (w.id === id ? { ...w, ...data } : w));
    safeSetStorageItem(STORAGE_KEYS.MERCHANT_WAREHOUSES, JSON.stringify(list));
    this.notify();
  }

  public deleteMerchantWarehouse(id: string): void {
    const list = this.getMerchantWarehouses().filter((w) => w.id !== id);
    safeSetStorageItem(STORAGE_KEYS.MERCHANT_WAREHOUSES, JSON.stringify(list));
    this.notify();
  }

  // Merchant Items & Inventory Pricing CRUD
  public getMerchantItems(): MerchantItem[] {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEYS.MERCHANT_ITEMS) || "[]");
    } catch {
      return [];
    }
  }

  public addMerchantItem(data: Omit<MerchantItem, "id" | "createdAt">): MerchantItem {
    const list = this.getMerchantItems();
    const newItem: MerchantItem = {
      ...data,
      id: `mitem-${Date.now()}`,
      createdAt: new Date().toISOString(),
    };
    list.unshift(newItem);
    safeSetStorageItem(STORAGE_KEYS.MERCHANT_ITEMS, JSON.stringify(list));
    this.notify();
    return newItem;
  }

  public ensureMerchantItemExists(
    product: Product,
    factoryId?: string,
    factoryName?: string
  ): MerchantItem {
    const list = this.getMerchantItems();
    const defaultWh = this.getMerchantWarehouses().find((w) => w.isDefault) || this.getMerchantWarehouses()[0];
    const defaultWhId = defaultWh ? defaultWh.id : "wh-1";

    const match = list.find(
      (m) =>
        (m.productId && m.productId === product.id) ||
        (m.sku && product.sku && m.sku === product.sku) ||
        m.name === product.name
    );

    if (match) {
      return match;
    }

    const newItem: MerchantItem = {
      id: `mitem-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      name: product.name,
      category: product.category || "مواد غذائية",
      sku: product.sku || `SKU-${Date.now()}`,
      barcode: product.barcode || `628${Math.floor(100000000 + Math.random() * 900000000)}`,
      unit: product.unit || "حبة",
      costPrice: product.price,
      sellingPrice: Math.round(product.price * 1.25),
      minStockAlert: 10,
      warehouseStock: { [defaultWhId]: 0 },
      totalStock: 0,
      factoryId: factoryId || product.factoryId,
      factoryName: factoryName,
      productId: product.id,
      image: product.image,
      createdAt: new Date().toISOString(),
    };

    list.unshift(newItem);
    safeSetStorageItem(STORAGE_KEYS.MERCHANT_ITEMS, JSON.stringify(list));
    this.notify();
    return newItem;
  }

  public updateMerchantItem(id: string, data: Partial<MerchantItem>): void {
    const list = this.getMerchantItems().map((it) => {
      if (it.id === id) {
        const updated = { ...it, ...data };
        if (updated.warehouseStock) {
          updated.totalStock = Object.values(updated.warehouseStock).reduce((a: number, b: number) => a + (Number(b) || 0), 0);
        }
        return updated;
      }
      return it;
    });
    safeSetStorageItem(STORAGE_KEYS.MERCHANT_ITEMS, JSON.stringify(list));
    this.notify();
  }

  public deleteMerchantItem(id: string): void {
    const list = this.getMerchantItems().filter((it) => it.id !== id);
    safeSetStorageItem(STORAGE_KEYS.MERCHANT_ITEMS, JSON.stringify(list));
    this.notify();
  }

  public updateMerchantItemWarehouseStock(itemId: string, warehouseId: string, quantity: number): void {
    const items = this.getMerchantItems();
    items.forEach((it) => {
      if (it.id === itemId) {
        it.warehouseStock = it.warehouseStock || {};
        it.warehouseStock[warehouseId] = Math.max(0, quantity);
        it.totalStock = Object.values(it.warehouseStock).reduce((a: number, b: number) => a + (Number(b) || 0), 0);
      }
    });
    safeSetStorageItem(STORAGE_KEYS.MERCHANT_ITEMS, JSON.stringify(items));
    this.notify();
  }

  public transferWarehouseStock(itemId: string, fromWarehouseId: string, toWarehouseId: string, transferQty: number): boolean {
    if (fromWarehouseId === toWarehouseId || transferQty <= 0) return false;
    const items = this.getMerchantItems();
    let success = false;
    items.forEach((it) => {
      if (it.id === itemId) {
        it.warehouseStock = it.warehouseStock || {};
        const currentFrom = it.warehouseStock[fromWarehouseId] || 0;
        if (currentFrom >= transferQty) {
          it.warehouseStock[fromWarehouseId] = currentFrom - transferQty;
          it.warehouseStock[toWarehouseId] = (it.warehouseStock[toWarehouseId] || 0) + transferQty;
          it.totalStock = Object.values(it.warehouseStock).reduce((a: number, b: number) => a + (Number(b) || 0), 0);
          success = true;
        }
      }
    });
    if (success) {
      safeSetStorageItem(STORAGE_KEYS.MERCHANT_ITEMS, JSON.stringify(items));
      this.notify();
    }
    return success;
  }

  // Merchant Customer Sales (POS / Invoicing)
  public getMerchantSales(): MerchantSaleOrder[] {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEYS.MERCHANT_SALES) || "[]");
    } catch {
      return [];
    }
  }

  public createMerchantSale(data: Omit<MerchantSaleOrder, "id" | "invoiceNo" | "createdAt">): MerchantSaleOrder {
    const sales = this.getMerchantSales();
    const invoiceNo = `INV-${new Date().getFullYear()}-${String(sales.length + 1).padStart(3, "0")}`;
    const newSale: MerchantSaleOrder = {
      ...data,
      id: `msale-${Date.now()}`,
      invoiceNo,
      createdAt: new Date().toISOString(),
    };

    // Automatically deduct stock from selected warehouse
    const items = this.getMerchantItems();
    data.items.forEach((sItem) => {
      const match = items.find((i) => i.id === sItem.itemId);
      if (match && match.warehouseStock) {
        const currentQty = match.warehouseStock[data.warehouseId] || 0;
        match.warehouseStock[data.warehouseId] = Math.max(0, currentQty - sItem.quantity);
        match.totalStock = Object.values(match.warehouseStock).reduce((a: number, b: number) => a + (Number(b) || 0), 0);
      }
    });

    safeSetStorageItem(STORAGE_KEYS.MERCHANT_ITEMS, JSON.stringify(items));

    sales.unshift(newSale);
    safeSetStorageItem(STORAGE_KEYS.MERCHANT_SALES, JSON.stringify(sales));
    this.notify();
    return newSale;
  }

  public updateMerchantSaleStatus(saleId: string, status: "COMPLETED" | "DRAFT" | "CANCELLED"): MerchantSaleOrder | null {
    const sales = this.getMerchantSales();
    let updatedSale: MerchantSaleOrder | null = null;
    const list = sales.map((s) => {
      if (s.id === saleId) {
        updatedSale = { ...s, status };
        return updatedSale;
      }
      return s;
    });
    safeSetStorageItem(STORAGE_KEYS.MERCHANT_SALES, JSON.stringify(list));
    this.notify();
    return updatedSale;
  }

  public deleteMerchantSale(saleId: string): void {
    const sales = this.getMerchantSales().filter((s) => s.id !== saleId);
    safeSetStorageItem(STORAGE_KEYS.MERCHANT_SALES, JSON.stringify(sales));
    this.notify();
  }

  public deleteSubOrder(subOrderId: string): void {
    const mainOrders = this.getMainOrders();
    const updated = mainOrders
      .map((main) => ({
        ...main,
        subOrders: main.subOrders.filter((s) => s.id !== subOrderId),
      }))
      .filter((main) => main.subOrders.length > 0);
    safeSetStorageItem(STORAGE_KEYS.ORDERS, JSON.stringify(updated));
    this.notify();
  }

  public deleteMainOrder(mainOrderId: string): void {
    const mainOrders = this.getMainOrders().filter((m) => m.id !== mainOrderId);
    safeSetStorageItem(STORAGE_KEYS.ORDERS, JSON.stringify(mainOrders));
    this.notify();
  }

  public deleteAllOrders(): void {
    safeSetStorageItem(STORAGE_KEYS.ORDERS, JSON.stringify([]));
    this.notify();
  }

  public deleteCompletedOrders(): void {
    const mainOrders = this.getMainOrders();
    // Keep only main orders that have at least one sub-order still active (not DELIVERED or CANCELLED)
    const activeOnly = mainOrders.filter((main) =>
      main.subOrders.some(
        (sub) => sub.status !== "DELIVERED" && sub.status !== "CANCELLED"
      )
    );
    safeSetStorageItem(STORAGE_KEYS.ORDERS, JSON.stringify(activeOnly));
    this.notify();
  }

  // ================= MERCHANT ACCOUNTS & SUBSCRIPTION MANAGEMENT =================

  public getMerchantAccounts(): MerchantAccount[] {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEYS.MERCHANT_ACCOUNTS) || "[]");
    } catch {
      return [];
    }
  }

  public getMerchantAccountById(id: string): MerchantAccount | undefined {
    return this.getMerchantAccounts().find((acc) => acc.id === id);
  }

  public getCurrentMerchantSession(): MerchantAccount | null {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.CURRENT_MERCHANT_SESSION);
      if (!stored) return null;
      const parsed: MerchantAccount = JSON.parse(stored);
      // Synchronize with latest status from accounts list
      const latest = this.getMerchantAccountById(parsed.id);
      return latest || parsed;
    } catch {
      return null;
    }
  }

  public setCurrentMerchantSession(account: MerchantAccount | null): void {
    if (account) {
      safeSetStorageItem(STORAGE_KEYS.CURRENT_MERCHANT_SESSION, JSON.stringify(account));
    } else {
      localStorage.removeItem(STORAGE_KEYS.CURRENT_MERCHANT_SESSION);
    }
    this.notify();
  }

  public loginMerchant(
    identifier: string,
    pass: string
  ): { success: boolean; account?: MerchantAccount; error?: string } {
    const accounts = this.getMerchantAccounts();
    const cleanId = identifier.trim().toLowerCase();
    const cleanDigits = identifier.replace(/\D/g, "");

    const found = accounts.find(
      (a) =>
        (a.email && a.email.trim().toLowerCase() === cleanId) ||
        (a.username && a.username.trim().toLowerCase() === cleanId) ||
        (a.phone && (a.phone.trim() === identifier.trim() || (cleanDigits && a.phone.replace(/\D/g, "") === cleanDigits))) ||
        (a.ownerName && a.ownerName.trim().toLowerCase() === cleanId) ||
        (a.storeName && a.storeName.trim().toLowerCase() === cleanId)
    );

    if (!found) {
      return {
        success: false,
        error: "بيانات الدخول (اسم المستخدم / البريد الإلكتروني / رقم الهاتف) غير مسجلة في النظام",
      };
    }

    if (found.password && found.password !== pass) {
      return { success: false, error: "كلمة المرور غير صحيحة" };
    }

    this.setCurrentMerchantSession(found);
    return { success: true, account: found };
  }

  public resetMerchantPassword(
    identifier: string,
    newPass: string
  ): { success: boolean; message?: string; account?: MerchantAccount; error?: string } {
    const accounts = this.getMerchantAccounts();
    const cleanId = identifier.trim().toLowerCase();
    const cleanDigits = identifier.replace(/\D/g, "");

    const index = accounts.findIndex(
      (a) =>
        (a.email && a.email.trim().toLowerCase() === cleanId) ||
        (a.username && a.username.trim().toLowerCase() === cleanId) ||
        (a.phone && (a.phone.trim() === identifier.trim() || (cleanDigits && a.phone.replace(/\D/g, "") === cleanDigits))) ||
        (a.ownerName && a.ownerName.trim().toLowerCase() === cleanId) ||
        (a.storeName && a.storeName.trim().toLowerCase() === cleanId)
    );

    if (index === -1) {
      return { success: false, error: "لم يتم العثور على حساب تاجر مطابق لاسم المستخدم أو البريد أو رقم الهاتف المدخل." };
    }

    accounts[index].password = newPass;
    safeSetStorageItem(STORAGE_KEYS.MERCHANT_ACCOUNTS, JSON.stringify(accounts));
    this.notify();
    return { success: true, message: "تم إعادة تعيين كلمة المرور بنجاح!", account: accounts[index] };
  }

  public registerMerchantAccount(data: {
    username?: string;
    email?: string;
    password?: string;
    storeName: string;
    ownerName: string;
    phone: string;
    commercialReg?: string;
    city?: string;
    district?: string;
    fullAddress?: string;
    createdSource?: "SELF_REGISTER" | "FACTORY_CREATED";
    selectedTier?: SubscriptionTier;
    selectedBillingCycle?: BillingCycle;
  }): MerchantAccount {
    const accounts = this.getMerchantAccounts();
    const cycle = data.selectedBillingCycle || "YEARLY";
    const isYearly = cycle === "YEARLY";

    const price = isYearly ? 50000 : 5000;
    const planNameAr = isYearly ? "الاشتراك السنوي الشامل (50,000 ر.ي)" : "الاشتراك الشهري الشامل (5,000 ر.ي)";

    const now = new Date();
    const endDate = new Date(now);
    if (isYearly) {
      endDate.setFullYear(now.getFullYear() + 1);
    } else {
      endDate.setMonth(now.getMonth() + 1);
    }

    const generatedEmail = data.email && data.email.trim() ? data.email.trim() : `${data.username || data.phone}@merchant.ye`;

    const newAccount: MerchantAccount = {
      id: `merch-${Date.now()}`,
      username: data.username || data.phone,
      email: generatedEmail,
      password: data.password || "123",
      storeName: data.storeName,
      ownerName: data.ownerName,
      phone: data.phone,
      commercialReg: data.commercialReg || "1010998877",
      city: data.city || "صنعاء",
      district: data.district || "حي حدة",
      fullAddress: data.fullAddress || `حي ${data.district || "حدة"}، ${data.city || "صنعاء"}`,
      createdSource: data.createdSource || "SELF_REGISTER",
      approvalStatus: "PENDING",
      approvalNote: "بانتظار مراجعة وتوثيق الحساب من قِبل إدارة المصنع والمنصة",
      subscription: {
        planId: "PROFESSIONAL",
        planNameAr: planNameAr,
        status: "ACTIVE",
        priceMonthly: price,
        billingCycle: cycle,
        startDate: now.toISOString().split("T")[0],
        endDate: endDate.toISOString().split("T")[0],
        autoRenew: true,
        maxWarehouses: 10,
        maxItems: 5000,
        maxPOSRegisters: 10,
        features: [
          "وصول كامل لكافة خدمات وإمكانيات المنصة",
          "ربط مباشر بالمصانع وطلب بالجملة",
          "إدارة المخزون والكاشير ونقاط البيع (POS)",
          "دعم فني مخصص 24/7",
        ],
      },
      createdAt: now.toISOString(),
    };

    accounts.unshift(newAccount);
    safeSetStorageItem(STORAGE_KEYS.MERCHANT_ACCOUNTS, JSON.stringify(accounts));
    this.setCurrentMerchantSession(newAccount);
    this.notify();
    return newAccount;
  }

  public approveMerchantAccount(id: string): void {
    const accounts = this.getMerchantAccounts();
    const index = accounts.findIndex((a) => a.id === id);
    if (index !== -1) {
      accounts[index].approvalStatus = "APPROVED";
      accounts[index].approvedAt = new Date().toISOString();
      accounts[index].approvalNote = "تمت الموافقة والاعتماد بنجاح من إدارة المنصة";
      accounts[index].subscription.status = "ACTIVE";
      safeSetStorageItem(STORAGE_KEYS.MERCHANT_ACCOUNTS, JSON.stringify(accounts));

      // If active session belongs to this merchant, update session
      const current = this.getCurrentMerchantSession();
      if (current && current.id === id) {
        this.setCurrentMerchantSession(accounts[index]);
      }
      this.notify();
    }
  }

  public suspendMerchantAccount(id: string, reason?: string): void {
    const accounts = this.getMerchantAccounts();
    const index = accounts.findIndex((a) => a.id === id);
    if (index !== -1) {
      accounts[index].approvalStatus = "SUSPENDED";
      accounts[index].suspendedAt = new Date().toISOString();
      accounts[index].suspensionReason =
        reason || "تم إيقاف الخدمة مؤقتاً بواسطة إدارة المنصة. يرجى التواصل مع خدمة العملاء لحل المشكلة في أقرب وقت.";
      accounts[index].subscription.status = "SUSPENDED";
      safeSetStorageItem(STORAGE_KEYS.MERCHANT_ACCOUNTS, JSON.stringify(accounts));

      // If active session belongs to this merchant, update session
      const current = this.getCurrentMerchantSession();
      if (current && current.id === id) {
        this.setCurrentMerchantSession(accounts[index]);
      }
      this.notify();
    }
  }

  public updateMerchantAccountDetails(
    id: string,
    data: {
      storeName?: string;
      ownerName?: string;
      username?: string;
      email?: string;
      phone?: string;
      commercialReg?: string;
      taxNumber?: string;
      city?: string;
      district?: string;
      fullAddress?: string;
      password?: string;
      lat?: number;
      lng?: number;
      taxEnabled?: boolean;
      taxRate?: number;
      whatsAppConfig?: Partial<MerchantWhatsAppConfig>;
    }
  ): void {
    const accounts = this.getMerchantAccounts();
    const index = accounts.findIndex((a) => a.id === id);
    if (index !== -1) {
      const acc = accounts[index];
      if (data.storeName !== undefined) acc.storeName = data.storeName.trim();
      if (data.ownerName !== undefined) acc.ownerName = data.ownerName.trim();
      if (data.username !== undefined) acc.username = data.username.trim();
      if (data.email !== undefined) acc.email = data.email.trim();
      if (data.phone !== undefined) acc.phone = data.phone.trim();
      if (data.commercialReg !== undefined) acc.commercialReg = data.commercialReg.trim();
      if (data.taxNumber !== undefined) acc.taxNumber = data.taxNumber.trim();
      if (data.city !== undefined) acc.city = data.city;
      if (data.district !== undefined) acc.district = data.district;
      if (data.fullAddress !== undefined) acc.fullAddress = data.fullAddress;
      if (data.lat !== undefined) acc.lat = data.lat;
      if (data.lng !== undefined) acc.lng = data.lng;
      if (data.taxEnabled !== undefined) acc.taxEnabled = data.taxEnabled;
      if (data.taxRate !== undefined) acc.taxRate = data.taxRate;
      if (data.password && data.password.trim().length > 0) acc.password = data.password.trim();
      if (data.whatsAppConfig !== undefined) {
        acc.whatsAppConfig = {
          enabled: true,
          autoSendSalaryVouchers: true,
          autoSendAdvanceVouchers: true,
          autoSendPenaltyVouchers: true,
          sendManagerCopy: true,
          ...(acc.whatsAppConfig || {}),
          ...data.whatsAppConfig,
        };
      }

      safeSetStorageItem(STORAGE_KEYS.MERCHANT_ACCOUNTS, JSON.stringify(accounts));

      // Update session if currently logged in as this merchant
      const current = this.getCurrentMerchantSession();
      if (current && current.id === id) {
        this.setCurrentMerchantSession(acc);
      }

      // Sync to WholesalerProfile as well
      const wholesaler = this.getWholesaler();
      this.updateWholesaler({
        ...wholesaler,
        storeName: acc.storeName,
        ownerName: acc.ownerName,
        phone: acc.phone,
        email: acc.email || wholesaler.email,
        city: acc.city,
        district: acc.district,
        fullAddress: acc.fullAddress,
        commercialReg: acc.commercialReg || wholesaler.commercialReg,
        taxNumber: acc.taxNumber || wholesaler.taxNumber,
        lat: acc.lat !== undefined ? acc.lat : wholesaler.lat,
        lng: acc.lng !== undefined ? acc.lng : wholesaler.lng,
      });

      this.notify();
    }
  }

  // ================= WHATSAPP INTEGRATION & VOUCHERS MANAGEMENT =================

  public getMerchantWhatsAppConfig(merchantId?: string): MerchantWhatsAppConfig {
    const merchant = merchantId
      ? this.getMerchantAccountById(merchantId)
      : this.getCurrentMerchantSession();

    if (merchant && merchant.whatsAppConfig) {
      return merchant.whatsAppConfig;
    }

    return {
      enabled: true,
      phoneNumber: merchant?.phone || "771234567",
      managerPhone: merchant?.phone || "771234567",
      autoSendSalaryVouchers: true,
      autoSendAdvanceVouchers: true,
      autoSendPenaltyVouchers: true,
      sendManagerCopy: true,
      directBackgroundDispatch: true,
      isConnected: false,
      connectedAt: undefined,
    };
  }

  public updateMerchantWhatsAppConfig(merchantId: string, config: Partial<MerchantWhatsAppConfig>): MerchantWhatsAppConfig {
    const accounts = this.getMerchantAccounts();
    const index = accounts.findIndex((a) => a.id === merchantId);
    let updatedConfig: MerchantWhatsAppConfig;

    if (index !== -1) {
      const current = accounts[index].whatsAppConfig || {
        enabled: true,
        phoneNumber: accounts[index].phone || "771234567",
        managerPhone: accounts[index].phone || "771234567",
        autoSendSalaryVouchers: true,
        autoSendAdvanceVouchers: true,
        autoSendPenaltyVouchers: true,
        sendManagerCopy: true,
        directBackgroundDispatch: true,
        isConnected: false,
      };

      updatedConfig = {
        ...current,
        ...config,
      };

      accounts[index].whatsAppConfig = updatedConfig;
      safeSetStorageItem(STORAGE_KEYS.MERCHANT_ACCOUNTS, JSON.stringify(accounts));

      const currSession = this.getCurrentMerchantSession();
      if (currSession && currSession.id === merchantId) {
        this.setCurrentMerchantSession(accounts[index]);
      }
      this.notify();
      return updatedConfig;
    }

    return {
      enabled: true,
      ...config,
    };
  }

  public getEmployeeVouchers(employeeId?: string): EmployeeVoucher[] {
    try {
      const list: EmployeeVoucher[] = JSON.parse(localStorage.getItem(STORAGE_KEYS.EMPLOYEE_VOUCHERS) || "[]");
      if (employeeId) {
        return list.filter((v) => v.employeeId === employeeId);
      }
      return list;
    } catch {
      return [];
    }
  }

  public saveEmployeeVoucher(voucher: EmployeeVoucher): void {
    const list = this.getEmployeeVouchers();
    list.unshift(voucher);
    // Keep max 50 vouchers
    const pruned = list.slice(0, 50);
    safeSetStorageItem(STORAGE_KEYS.EMPLOYEE_VOUCHERS, JSON.stringify(pruned));
    this.notify();
  }

  public requestMerchantSubscriptionUpgrade(
    id: string,
    requestedTier: SubscriptionTier,
    requestedCycle: BillingCycle
  ): PendingSubscriptionChange | null {
    const accounts = this.getMerchantAccounts();
    const index = accounts.findIndex((a) => a.id === id);
    if (index === -1) return null;

    let planName = "باقة التاجر المتقدم (Pro)";
    let price = requestedCycle === "YEARLY" ? 150000 : 15000;
    if (requestedTier === "STARTER") {
      planName = "باقة المبتدئ (Starter)";
      price = 0;
    } else if (requestedTier === "ENTERPRISE_VIP") {
      planName = "باقة المؤسسات والـ VIP";
      price = requestedCycle === "YEARLY" ? 350000 : 35000;
    }

    const targetAccount = accounts[index];
    const pendingChange: PendingSubscriptionChange = {
      requestedTier,
      requestedCycle,
      requestedPlanName: `${planName} - ${requestedCycle === "YEARLY" ? "سنوي" : "شهري"}`,
      previousPlanName: targetAccount.subscription?.planNameAr || "الباقة الحالية",
      previousCycle: targetAccount.subscription?.billingCycle || "YEARLY",
      price,
      requestedAt: new Date().toISOString(),
      status: "PENDING_APPROVAL",
      note: "يرجى انتظار موافقة إدارة المنصة لمراجعة وتفعيل الباقة الجديدة.",
    };

    accounts[index].pendingSubscriptionChange = pendingChange;
    // Clear any older decision banner when submitting a new request
    delete accounts[index].lastSubscriptionChangeDecision;
    safeSetStorageItem(STORAGE_KEYS.MERCHANT_ACCOUNTS, JSON.stringify(accounts));

    // Also add an Admin Notification
    this.addNotification({
      id: `notif-upgrade-${Date.now()}`,
      targetRole: "ALL",
      title: `📋 طلب ترقية باقة جديد: ${accounts[index].storeName}`,
      message: `طلب التاجر "${accounts[index].storeName}" (${accounts[index].ownerName}) الترقية إلى "${pendingChange.requestedPlanName}". بانتظار موافقة الإدارة.`,
      timestamp:
        new Date().toLocaleTimeString("ar-YE", { hour: "2-digit", minute: "2-digit" }) +
        " - " +
        new Date().toLocaleDateString("ar-YE"),
      read: false,
      type: "ORDER",
    });

    const current = this.getCurrentMerchantSession();
    if (current && current.id === id) {
      this.setCurrentMerchantSession(accounts[index]);
    }
    this.notify();
    return pendingChange;
  }

  public cancelPendingSubscriptionChange(id: string): void {
    const accounts = this.getMerchantAccounts();
    const index = accounts.findIndex((a) => a.id === id);
    if (index !== -1) {
      delete accounts[index].pendingSubscriptionChange;
      safeSetStorageItem(STORAGE_KEYS.MERCHANT_ACCOUNTS, JSON.stringify(accounts));

      const current = this.getCurrentMerchantSession();
      if (current && current.id === id) {
        this.setCurrentMerchantSession(accounts[index]);
      }
      this.notify();
    }
  }

  public dismissMerchantSubscriptionDecision(id: string): void {
    const accounts = this.getMerchantAccounts();
    const index = accounts.findIndex((a) => a.id === id);
    if (index !== -1) {
      delete accounts[index].lastSubscriptionChangeDecision;
      safeSetStorageItem(STORAGE_KEYS.MERCHANT_ACCOUNTS, JSON.stringify(accounts));

      const current = this.getCurrentMerchantSession();
      if (current && current.id === id) {
        this.setCurrentMerchantSession(accounts[index]);
      }
      this.notify();
    }
  }

  public approveMerchantSubscriptionUpgrade(id: string): void {
    const accounts = this.getMerchantAccounts();
    const index = accounts.findIndex((a) => a.id === id);
    if (index === -1) return;

    const targetAccount = accounts[index];
    const pending = targetAccount.pendingSubscriptionChange;
    if (!pending) return;

    const requestedTier = pending.requestedTier;
    const requestedCycle = pending.requestedCycle;
    const isYearly = requestedCycle === "YEARLY";

    let planNameAr = "باقة التاجر المتقدم (Pro)";
    let price = isYearly ? 150000 : 15000;
    let maxWarehouses = 5;
    let maxItems = 2500;
    let maxPOSRegisters = 3;
    let features = [
      "حتى 5 مستودعات وفروع تخزين",
      "حتى 2,500 صنف تجاري",
      "حتى 3 نقاط بيع وكاشير متزامنة",
      "تنبيهات نقص المخزون التلقائية",
      "وصول كامل لسوق المصانع والطلب المباشر",
    ];

    if (requestedTier === "STARTER") {
      planNameAr = "باقة المبتدئ (Starter)";
      price = 0;
      maxWarehouses = 1;
      maxItems = 100;
      maxPOSRegisters = 1;
      features = [
        "مستودع تخزين رئيسي واحد",
        "حتى 100 صنف تجاري",
        "نقطة بيع وكاشير واحدة",
      ];
    } else if (requestedTier === "ENTERPRISE_VIP") {
      planNameAr = "باقة المؤسسات والـ VIP";
      price = isYearly ? 350000 : 35000;
      maxWarehouses = 999;
      maxItems = 999999;
      maxPOSRegisters = 999;
      features = [
        "مستودعات وفروع غير محدودة",
        "أصناف تجارية غير محدودة",
        "نقاط كاشير غير محدودة مع شاشات الزبائن",
        "دعم فني مخصص ومباشر 24/7",
        "وصول مميز ذو أولوية في التوريد",
      ];
    }

    const now = new Date();
    const endDate = new Date(now);
    if (isYearly) {
      endDate.setFullYear(now.getFullYear() + 1);
    } else {
      endDate.setMonth(now.getMonth() + 1);
    }

    accounts[index].subscription = {
      planId: requestedTier,
      planNameAr: `${planNameAr} - ${isYearly ? "سنوي" : "شهري"}`,
      status: targetAccount.approvalStatus === "SUSPENDED" ? "SUSPENDED" : "ACTIVE",
      priceMonthly: price,
      billingCycle: requestedCycle,
      startDate: now.toISOString().split("T")[0],
      endDate: endDate.toISOString().split("T")[0],
      autoRenew: true,
      maxWarehouses,
      maxItems,
      maxPOSRegisters,
      features,
    };

    // Save decision for UI display
    accounts[index].lastSubscriptionChangeDecision = {
      ...pending,
      status: "APPROVED",
      decidedAt: new Date().toISOString(),
    };

    delete accounts[index].pendingSubscriptionChange;
    safeSetStorageItem(STORAGE_KEYS.MERCHANT_ACCOUNTS, JSON.stringify(accounts));

    // Send notification to merchant
    this.addNotification({
      id: `notif-approved-${Date.now()}`,
      targetRole: "WHOLESALER",
      title: `🎉 تمت الموافقة على ترقية باقتك!`,
      message: `تهانينا! قامت إدارة المنصة بالموافقة على طلب ترقية باقتك إلى "${accounts[index].subscription.planNameAr}". كافة الميزات أصبحت مفعلة الآن.`,
      timestamp:
        new Date().toLocaleTimeString("ar-YE", { hour: "2-digit", minute: "2-digit" }) +
        " - " +
        new Date().toLocaleDateString("ar-YE"),
      read: false,
      type: "ORDER",
    });

    const current = this.getCurrentMerchantSession();
    if (current && current.id === id) {
      this.setCurrentMerchantSession(accounts[index]);
    }
    this.notify();
  }

  public rejectMerchantSubscriptionUpgrade(id: string, note?: string): void {
    const accounts = this.getMerchantAccounts();
    const index = accounts.findIndex((a) => a.id === id);
    if (index !== -1) {
      const storeName = accounts[index].storeName;
      const pending = accounts[index].pendingSubscriptionChange;

      if (pending) {
        accounts[index].lastSubscriptionChangeDecision = {
          ...pending,
          status: "REJECTED",
          decidedAt: new Date().toISOString(),
          note: note || "نعتذر، لم تتم الموافقة على طلب ترقية الباقة في الوقت الحالي. يرجى مراجعة إدارة المنصة.",
        };
      }

      delete accounts[index].pendingSubscriptionChange;
      safeSetStorageItem(STORAGE_KEYS.MERCHANT_ACCOUNTS, JSON.stringify(accounts));
      safeSetStorageItem(STORAGE_KEYS.MERCHANT_ACCOUNTS, JSON.stringify(accounts));

      this.addNotification({
        id: `notif-rejected-${Date.now()}`,
        targetRole: "WHOLESALER",
        title: `❌ تم رفض طلب ترقية الباقة`,
        message:
          note ||
          `نعتذر، لم تتم الموافقة على طلب ترقية باقة المتجر "${storeName}". يرجى التواصل مع إدارة المنصة أو الدعم الفني للمزيد من التفاصيل.`,
        timestamp:
          new Date().toLocaleTimeString("ar-YE", { hour: "2-digit", minute: "2-digit" }) +
          " - " +
          new Date().toLocaleDateString("ar-YE"),
        read: false,
        type: "ORDER",
      });

      const current = this.getCurrentMerchantSession();
      if (current && current.id === id) {
        this.setCurrentMerchantSession(accounts[index]);
      }
      this.notify();
    }
  }

  public updateMerchantSubscription(id: string, cycleOrTier: any = "YEARLY", cycleParam: BillingCycle = "YEARLY"): void {
    const accounts = this.getMerchantAccounts();
    const index = accounts.findIndex((a) => a.id === id);
    if (index !== -1) {
      const cycle: BillingCycle = (cycleOrTier === "MONTHLY" || cycleOrTier === "YEARLY") ? cycleOrTier : cycleParam;
      const isYearly = cycle === "YEARLY";
      const price = isYearly ? 50000 : 5000;
      const planNameAr = isYearly ? "الاشتراك السنوي الشامل (50,000 ر.ي)" : "الاشتراك الشهري الشامل (5,000 ر.ي)";

      const now = new Date();
      const endDate = new Date(now);
      if (isYearly) {
        endDate.setFullYear(now.getFullYear() + 1);
      } else {
        endDate.setMonth(now.getMonth() + 1);
      }

      accounts[index].subscription = {
        planId: "PROFESSIONAL",
        planNameAr: planNameAr,
        status: accounts[index].approvalStatus === "SUSPENDED" ? "SUSPENDED" : "ACTIVE",
        priceMonthly: price,
        billingCycle: cycle,
        startDate: now.toISOString().split("T")[0],
        endDate: endDate.toISOString().split("T")[0],
        autoRenew: true,
        maxWarehouses: 10,
        maxItems: 5000,
        maxPOSRegisters: 10,
        features: [
          "وصول كامل لكافة خدمات وإمكانيات المنصة",
          "ربط مباشر بالمصانع والطلب بالجملة",
          "إدارة المخزون والكاشير ونقاط البيع (POS)",
          "دعم فني مخصص 24/7",
        ],
      };

      safeSetStorageItem(STORAGE_KEYS.MERCHANT_ACCOUNTS, JSON.stringify(accounts));

      const current = this.getCurrentMerchantSession();
      if (current && current.id === id) {
        this.setCurrentMerchantSession(accounts[index]);
      }
      this.notify();
    }
  }

  public deleteMerchantAccount(id: string): void {
    const accounts = this.getMerchantAccounts().filter((a) => a.id !== id);
    safeSetStorageItem(STORAGE_KEYS.MERCHANT_ACCOUNTS, JSON.stringify(accounts));

    const current = this.getCurrentMerchantSession();
    if (current && current.id === id) {
      this.setCurrentMerchantSession(null);
    }
    this.notify();
  }

  // ================= FACTORY ACCOUNTS & SUBSCRIPTION MANAGEMENT =================

  public getFactoryAccounts(): FactoryAccount[] {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEYS.FACTORY_ACCOUNTS) || "[]");
    } catch {
      return [];
    }
  }

  public getFactoryAccountById(id: string): FactoryAccount | undefined {
    return this.getFactoryAccounts().find((acc) => acc.id === id);
  }

  public getCurrentFactorySession(): FactoryAccount | null {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.CURRENT_FACTORY_SESSION);
      if (!stored) return null;
      const parsed: FactoryAccount = JSON.parse(stored);
      const latest = this.getFactoryAccountById(parsed.id);
      return latest || parsed;
    } catch {
      return null;
    }
  }

  public setCurrentFactorySession(account: FactoryAccount | null): void {
    if (account) {
      safeSetStorageItem(STORAGE_KEYS.CURRENT_FACTORY_SESSION, JSON.stringify(account));
    } else {
      localStorage.removeItem(STORAGE_KEYS.CURRENT_FACTORY_SESSION);
    }
    this.notify();
  }

  public loginFactory(
    identifier: string,
    pass: string
  ): { success: boolean; account?: FactoryAccount; error?: string } {
    const accounts = this.getFactoryAccounts();
    const cleanId = identifier.trim().toLowerCase();
    const cleanDigits = identifier.replace(/\D/g, "");

    const found = accounts.find(
      (a) =>
        (a.username && a.username.trim().toLowerCase() === cleanId) ||
        (a.email && a.email.trim().toLowerCase() === cleanId) ||
        (a.phone && (a.phone.trim() === identifier.trim() || (cleanDigits && a.phone.replace(/\D/g, "") === cleanDigits))) ||
        (a.factoryName && a.factoryName.trim().toLowerCase() === cleanId) ||
        (a.ownerName && a.ownerName.trim().toLowerCase() === cleanId)
    );

    if (!found) {
      return { success: false, error: "بيانات الدخول (اسم المستخدم / البريد الإلكتروني / رقم الهاتف) غير مسجلة للمصنع" };
    }

    if (found.password && found.password !== pass) {
      return { success: false, error: "كلمة المرور غير صحيحة" };
    }

    this.setCurrentFactorySession(found);
    return { success: true, account: found };
  }

  public resetFactoryPassword(
    identifier: string,
    newPass: string
  ): { success: boolean; message?: string; account?: FactoryAccount; error?: string } {
    const accounts = this.getFactoryAccounts();
    const cleanId = identifier.trim().toLowerCase();
    const cleanDigits = identifier.replace(/\D/g, "");

    const index = accounts.findIndex(
      (a) =>
        (a.email && a.email.trim().toLowerCase() === cleanId) ||
        (a.phone && (a.phone.trim() === identifier.trim() || (cleanDigits && a.phone.replace(/\D/g, "") === cleanDigits))) ||
        (a.factoryName && a.factoryName.trim().toLowerCase() === cleanId) ||
        (a.ownerName && a.ownerName.trim().toLowerCase() === cleanId)
    );

    if (index === -1) {
      return { success: false, error: "لم يتم العثور على حساب مصنع مطابق للبريد أو اسم المستخدم أو رقم الهاتف المدخل." };
    }

    accounts[index].password = newPass;
    safeSetStorageItem(STORAGE_KEYS.FACTORY_ACCOUNTS, JSON.stringify(accounts));
    this.notify();
    return { success: true, message: "تم إعادة تعيين كلمة المرور للمصنع بنجاح!", account: accounts[index] };
  }

  public registerFactoryAccount(data: {
    email: string;
    password?: string;
    factoryName: string;
    ownerName: string;
    phone: string;
    commercialReg: string;
    category: string;
    city: string;
    district: string;
    fullAddress: string;
    selectedTier?: SubscriptionTier;
    selectedBillingCycle?: BillingCycle;
  }): FactoryAccount {
    const accounts = this.getFactoryAccounts();
    const cycle = data.selectedBillingCycle || "YEARLY";
    const isYearly = cycle === "YEARLY";

    const price = isYearly ? 3000 : 300;
    const planNameAr = isYearly ? "الاشتراك السنوي للمصانع ($3,000)" : "الاشتراك الشهري للمصانع ($300)";

    const now = new Date();
    const endDate = new Date(now);
    if (isYearly) {
      endDate.setFullYear(now.getFullYear() + 1);
    } else {
      endDate.setMonth(now.getMonth() + 1);
    }

    const factoryId = `fac-${Date.now()}`;

    // Also register the Factory entity into factories list
    const existingFactories = this.getFactories();
    const newFactoryEntity: Factory = {
      id: factoryId,
      name: data.factoryName,
      category: data.category || "food",
      categoryNameAr: "مصنع وطني معتمد",
      logo: "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=200&auto=format&fit=crop&q=80",
      city: data.city,
      district: data.district,
      address: data.fullAddress,
      phone: data.phone,
      email: data.email,
      rating: 5.0,
      ordersFulfilled: 0,
      verified: true,
      minOrderValue: 1000,
      avgPreparationHours: 6,
      commercialReg: data.commercialReg,
    };
    existingFactories.push(newFactoryEntity);
    safeSetStorageItem(STORAGE_KEYS.FACTORIES, JSON.stringify(existingFactories));

    const newAccount: FactoryAccount = {
      id: `fac-acc-${Date.now()}`,
      email: data.email,
      password: data.password || "123",
      factoryName: data.factoryName,
      ownerName: data.ownerName,
      phone: data.phone,
      commercialReg: data.commercialReg,
      category: data.category,
      city: data.city,
      district: data.district,
      fullAddress: data.fullAddress,
      factoryId: factoryId,
      approvalStatus: "PENDING",
      approvalNote: "بانتظار مراجعة وإعتماد السجل التجاري الصناعي من قِبل إدارة المنصة (المرة الأولى)",
      subscription: {
        planId: "PROFESSIONAL",
        planNameAr: planNameAr,
        status: "ACTIVE",
        priceMonthly: price,
        billingCycle: cycle,
        startDate: now.toISOString().split("T")[0],
        endDate: endDate.toISOString().split("T")[0],
        autoRenew: true,
        maxProducts: 10000,
        maxMonthlyOrders: 50000,
        maxDrivers: 50,
        features: [
          "إضافة وإدارة منتجات غير محدودة",
          "متابعة وإدارة طلبيات بالجملة مباشرة",
          "إدارة أسطول السائقين والشحن بالتطبيقات",
          "تحليلات إنتاجية ومبيعات ذكية 100%",
          "ربط مباشر بالتجار في كافة المحافظات",
          "دعم فني وتدريب كادر المصنع 24/7",
        ],
      },
      createdAt: now.toISOString(),
    };

    accounts.unshift(newAccount);
    safeSetStorageItem(STORAGE_KEYS.FACTORY_ACCOUNTS, JSON.stringify(accounts));
    this.setCurrentFactorySession(newAccount);
    this.notify();
    return newAccount;
  }

  public updateFactorySubscription(id: string, cycleOrTier: any = "YEARLY", cycleParam: BillingCycle = "YEARLY"): void {
    const accounts = this.getFactoryAccounts();
    const index = accounts.findIndex((a) => a.id === id);
    if (index !== -1) {
      const cycle: BillingCycle = (cycleOrTier === "MONTHLY" || cycleOrTier === "YEARLY") ? cycleOrTier : cycleParam;
      const isYearly = cycle === "YEARLY";
      const price = isYearly ? 3000 : 300;
      const planNameAr = isYearly ? "الاشتراك السنوي للمصانع ($3,000)" : "الاشتراك الشهري للمصانع ($300)";

      const now = new Date();
      const endDate = new Date(now);
      if (isYearly) {
        endDate.setFullYear(now.getFullYear() + 1);
      } else {
        endDate.setMonth(now.getMonth() + 1);
      }

      accounts[index].subscription = {
        planId: "PROFESSIONAL",
        planNameAr: planNameAr,
        status: accounts[index].approvalStatus === "SUSPENDED" ? "SUSPENDED" : "ACTIVE",
        priceMonthly: price,
        billingCycle: cycle,
        startDate: now.toISOString().split("T")[0],
        endDate: endDate.toISOString().split("T")[0],
        autoRenew: true,
        maxProducts: 10000,
        maxMonthlyOrders: 50000,
        maxDrivers: 50,
        features: [
          "إضافة وإدارة منتجات غير محدودة",
          "متابعة وإدارة طلبيات بالجملة مباشرة",
          "إدارة أسطول السائقين والشحن بالتطبيقات",
          "تحليلات إنتاجية ومبيعات ذكية 100%",
          "ربط مباشر بالتجار في كافة المحافظات",
          "دعم فني وتدريب كادر المصنع 24/7",
        ],
      };

      safeSetStorageItem(STORAGE_KEYS.FACTORY_ACCOUNTS, JSON.stringify(accounts));

      const current = this.getCurrentFactorySession();
      if (current && current.id === id) {
        this.setCurrentFactorySession(accounts[index]);
      }
      this.notify();
    }
  }

  public approveFactoryAccount(id: string): void {
    const accounts = this.getFactoryAccounts();
    const index = accounts.findIndex((a) => a.id === id);
    if (index !== -1) {
      accounts[index].approvalStatus = "APPROVED";
      accounts[index].approvedAt = new Date().toISOString();
      accounts[index].approvalNote = "تمت الموافقة والاعتماد بنجاح من إدارة المنصة";
      accounts[index].subscription.status = "ACTIVE";
      safeSetStorageItem(STORAGE_KEYS.FACTORY_ACCOUNTS, JSON.stringify(accounts));

      const current = this.getCurrentFactorySession();
      if (current && current.id === id) {
        this.setCurrentFactorySession(accounts[index]);
      }
      this.notify();
    }
  }

  public suspendFactoryAccount(id: string, reason?: string): void {
    const accounts = this.getFactoryAccounts();
    const index = accounts.findIndex((a) => a.id === id);
    if (index !== -1) {
      accounts[index].approvalStatus = "SUSPENDED";
      accounts[index].suspendedAt = new Date().toISOString();
      accounts[index].suspensionReason =
        reason || "تم إيقاف حساب المصنع مؤقتاً بواسطة إدارة المنصة. يرجى التواصل مع إدارة العمليات.";
      accounts[index].subscription.status = "SUSPENDED";
      safeSetStorageItem(STORAGE_KEYS.FACTORY_ACCOUNTS, JSON.stringify(accounts));

      const current = this.getCurrentFactorySession();
      if (current && current.id === id) {
        this.setCurrentFactorySession(accounts[index]);
      }
      this.notify();
    }
  }

  public deleteFactoryAccount(id: string): void {
    const acc = this.getFactoryAccounts().find((a) => a.id === id);
    const targetFactoryId = acc?.factoryId || id;

    const accounts = this.getFactoryAccounts().filter((a) => a.id !== id && a.factoryId !== targetFactoryId);
    safeSetStorageItem(STORAGE_KEYS.FACTORY_ACCOUNTS, JSON.stringify(accounts));

    const factories = this.getFactories().filter((f) => f.id !== targetFactoryId && f.id !== id);
    safeSetStorageItem(STORAGE_KEYS.FACTORIES, JSON.stringify(factories));

    const products = this.getProducts().filter((p) => p.factoryId !== targetFactoryId && p.factoryId !== id);
    safeSetStorageItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(products));

    const current = this.getCurrentFactorySession();
    if (current && (current.id === id || current.factoryId === targetFactoryId)) {
      this.setCurrentFactorySession(null);
    }
    this.notify();
  }

  public deleteMultipleFactories(factoryIds: string[]): void {
    if (factoryIds.length === 0) return;
    const targetIdsSet = new Set(factoryIds);

    const factoryAccs = this.getFactoryAccounts();
    factoryAccs.forEach((acc) => {
      if (targetIdsSet.has(acc.id) || (acc.factoryId && targetIdsSet.has(acc.factoryId))) {
        targetIdsSet.add(acc.id);
        if (acc.factoryId) targetIdsSet.add(acc.factoryId);
      }
    });

    const remainingAccs = this.getFactoryAccounts().filter(
      (a) => !targetIdsSet.has(a.id) && (!a.factoryId || !targetIdsSet.has(a.factoryId))
    );
    safeSetStorageItem(STORAGE_KEYS.FACTORY_ACCOUNTS, JSON.stringify(remainingAccs));

    const remainingFactories = this.getFactories().filter((f) => !targetIdsSet.has(f.id));
    safeSetStorageItem(STORAGE_KEYS.FACTORIES, JSON.stringify(remainingFactories));

    const remainingProducts = this.getProducts().filter((p) => !targetIdsSet.has(p.factoryId));
    safeSetStorageItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(remainingProducts));

    const current = this.getCurrentFactorySession();
    if (current && (targetIdsSet.has(current.id) || (current.factoryId && targetIdsSet.has(current.factoryId)))) {
      this.setCurrentFactorySession(null);
    }
    this.notify();
  }

  public deleteMultipleMerchants(merchantIds: string[]): void {
    if (merchantIds.length === 0) return;
    const targetIdsSet = new Set(merchantIds);

    const remainingMerchants = this.getMerchantAccounts().filter((a) => !targetIdsSet.has(a.id));
    safeSetStorageItem(STORAGE_KEYS.MERCHANT_ACCOUNTS, JSON.stringify(remainingMerchants));

    const current = this.getCurrentMerchantSession();
    if (current && targetIdsSet.has(current.id)) {
      this.setCurrentMerchantSession(null);
    }
    this.notify();
  }

  public deleteMultipleFactoriesAndMerchants(factoryIds: string[], merchantIds: string[]): void {
    if (factoryIds.length > 0) {
      const targetIdsSet = new Set(factoryIds);
      const factoryAccs = this.getFactoryAccounts();
      factoryAccs.forEach((acc) => {
        if (targetIdsSet.has(acc.id) || (acc.factoryId && targetIdsSet.has(acc.factoryId))) {
          targetIdsSet.add(acc.id);
          if (acc.factoryId) targetIdsSet.add(acc.factoryId);
        }
      });

      const remainingAccs = this.getFactoryAccounts().filter(
        (a) => !targetIdsSet.has(a.id) && (!a.factoryId || !targetIdsSet.has(a.factoryId))
      );
      safeSetStorageItem(STORAGE_KEYS.FACTORY_ACCOUNTS, JSON.stringify(remainingAccs));

      const remainingFactories = this.getFactories().filter((f) => !targetIdsSet.has(f.id));
      safeSetStorageItem(STORAGE_KEYS.FACTORIES, JSON.stringify(remainingFactories));

      const remainingProducts = this.getProducts().filter((p) => !targetIdsSet.has(p.factoryId));
      safeSetStorageItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(remainingProducts));

      const currentFactory = this.getCurrentFactorySession();
      if (currentFactory && (targetIdsSet.has(currentFactory.id) || (currentFactory.factoryId && targetIdsSet.has(currentFactory.factoryId)))) {
        this.setCurrentFactorySession(null);
      }
    }

    if (merchantIds.length > 0) {
      const targetMerchantsSet = new Set(merchantIds);
      const remainingMerchants = this.getMerchantAccounts().filter((a) => !targetMerchantsSet.has(a.id));
      safeSetStorageItem(STORAGE_KEYS.MERCHANT_ACCOUNTS, JSON.stringify(remainingMerchants));

      const currentMerchant = this.getCurrentMerchantSession();
      if (currentMerchant && targetMerchantsSet.has(currentMerchant.id)) {
        this.setCurrentMerchantSession(null);
      }
    }

    this.notify();
  }

  // ================= DRIVER ACCOUNTS & DRIVER TERMINAL MANAGEMENT =================

  public getDriverAccounts(): DriverAccount[] {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.DRIVER_ACCOUNTS);
      if (stored === null) {
        safeSetStorageItem(STORAGE_KEYS.DRIVER_ACCOUNTS, JSON.stringify([]));
        return [];
      }
      return JSON.parse(stored);
    } catch {
      return [];
    }
  }

  public getDriverAccountsByFactoryId(factoryId: string): DriverAccount[] {
    if (!factoryId) return [];
    const factoryAccount = this.getFactoryAccounts().find((f) => f.id === factoryId || f.factoryId === factoryId);
    const targetFactoryId = factoryAccount ? (factoryAccount.factoryId || factoryAccount.id) : factoryId;
    return this.getDriverAccounts().filter((d) => {
      if (!d.factoryId) return false;
      return (
        d.factoryId === targetFactoryId ||
        d.factoryId === factoryId ||
        (factoryAccount && (d.factoryId === factoryAccount.id || d.factoryId === factoryAccount.factoryId))
      );
    });
  }

  public getCurrentDriverSession(): DriverAccount | null {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.CURRENT_DRIVER_SESSION);
      if (!stored) return null;
      const parsed: DriverAccount = JSON.parse(stored);
      const latest = this.getDriverAccounts().find((acc) => acc.id === parsed.id);
      return latest || parsed;
    } catch {
      return null;
    }
  }

  public setCurrentDriverSession(account: DriverAccount | null): void {
    if (!account) {
      localStorage.removeItem(STORAGE_KEYS.CURRENT_DRIVER_SESSION);
    } else {
      safeSetStorageItem(STORAGE_KEYS.CURRENT_DRIVER_SESSION, JSON.stringify(account));
    }
    this.notify();
  }

  public loginDriver(
    usernameOrPhoneOrEmail: string,
    pass: string
  ): { success: boolean; account?: DriverAccount; error?: string } {
    const query = usernameOrPhoneOrEmail.trim().toLowerCase();
    const cleanPass = pass.trim();

    const accounts = this.getDriverAccounts();
    const match = accounts.find(
      (a) =>
        (a.username.toLowerCase() === query ||
         a.phone.replace(/\D/g, "") === query.replace(/\D/g, "") ||
         (a.email && a.email.toLowerCase() === query)) &&
        (a.password || "123") === cleanPass
    );

    if (!match) {
      return {
        success: false,
        error: "بيانات الدخول غير صحيحة. يرجى التأكد من اسم المستخدم أو رقم الهاتف وكلمة المرور المسلمة لك.",
      };
    }

    this.setCurrentDriverSession(match);
    return { success: true, account: match };
  }

  public resetDriverPassword(
    identifier: string,
    newPass: string
  ): { success: boolean; message?: string; account?: DriverAccount; error?: string } {
    const accounts = this.getDriverAccounts();
    const cleanId = identifier.trim().toLowerCase();
    const cleanDigits = identifier.replace(/\D/g, "");

    const index = accounts.findIndex(
      (a) =>
        (a.username && a.username.trim().toLowerCase() === cleanId) ||
        (a.email && a.email.trim().toLowerCase() === cleanId) ||
        (a.phone && (a.phone.trim() === identifier.trim() || (cleanDigits && a.phone.replace(/\D/g, "") === cleanDigits))) ||
        (a.driverName && a.driverName.trim().toLowerCase() === cleanId)
    );

    if (index === -1) {
      return { success: false, error: "لم يتم العثور على حساب سائق مطابق لاسم المستخدم أو البريد أو رقم الهاتف المدخل." };
    }

    accounts[index].password = newPass;
    safeSetStorageItem(STORAGE_KEYS.DRIVER_ACCOUNTS, JSON.stringify(accounts));
    this.notify();
    return { success: true, message: "تم إعادة تعيين كلمة المرور للسائق بنجاح!", account: accounts[index] };
  }

  public registerDriverAccount(data: {
    username: string;
    phone: string;
    email?: string; // OPTIONAL
    driverName?: string;
    password?: string;
    vehicleNo?: string;
    vehicleType?: string;
    factoryId?: string;
    factoryName?: string;
    createdSource?: "SELF_REGISTER" | "FACTORY_CREATED";
  }): DriverAccount {
    const accounts = this.getDriverAccounts();
    const cleanUsername = data.username.trim();
    const cleanPhone = data.phone.trim();
    const cleanEmail = data.email?.trim() || "";

    // Check if username already exists
    const exists = accounts.some(
      (a) => a.username.toLowerCase() === cleanUsername.toLowerCase()
    );
    if (exists) {
      throw new Error(`اسم المستخدم "${cleanUsername}" مستخدم بالفعل، يرجى اختيار اسم آخر للسائق.`);
    }

    const currentFactory = this.getCurrentFactorySession();
    const fId = data.factoryId || currentFactory?.id || "fac-1";
    const fName = data.factoryName || currentFactory?.factoryName || "مصنع البركة للأغذية والمواشي";
    const isFactoryCreated = data.createdSource === "FACTORY_CREATED";

    const newAcc: DriverAccount = {
      id: `drv-${Date.now()}`,
      username: cleanUsername,
      phone: cleanPhone,
      email: cleanEmail || undefined,
      password: data.password?.trim() || "123",
      driverName: data.driverName?.trim() || cleanUsername,
      vehicleNo: data.vehicleNo?.trim() || "شاحنة توصيل غير محددة",
      vehicleType: data.vehicleType?.trim() || "دينا شحن جملة",
      factoryId: fId,
      factoryName: fName,
      approvalStatus: isFactoryCreated ? "APPROVED" : "PENDING",
      approvalNote: isFactoryCreated
        ? "حساب سائق تم إنشاؤه واعتماده مباشرة بواسطة المصنع"
        : "بانتظار مراجعة واعتماد طلب السائق من قبل إدارة المصنع",
      createdSource: data.createdSource || "SELF_REGISTER",
      createdAt: new Date().toISOString(),
    };

    accounts.unshift(newAcc);
    safeSetStorageItem(STORAGE_KEYS.DRIVER_ACCOUNTS, JSON.stringify(accounts));

    this.setCurrentDriverSession(newAcc);
    this.notify();
    return newAcc;
  }

  public approveDriverAccount(id: string): void {
    const accounts = this.getDriverAccounts();
    const index = accounts.findIndex((a) => a.id === id);
    if (index !== -1) {
      accounts[index].approvalStatus = "APPROVED";
      accounts[index].approvalNote = "تمت الموافقة والاعتماد بنجاح من إدارة المصنع";
      safeSetStorageItem(STORAGE_KEYS.DRIVER_ACCOUNTS, JSON.stringify(accounts));

      const current = this.getCurrentDriverSession();
      if (current && current.id === id) {
        this.setCurrentDriverSession(accounts[index]);
      }
      this.notify();
    }
  }

  public suspendDriverAccount(id: string, reason?: string): void {
    const accounts = this.getDriverAccounts();
    const index = accounts.findIndex((a) => a.id === id);
    if (index !== -1) {
      accounts[index].approvalStatus = "SUSPENDED";
      accounts[index].approvalNote =
        reason || "تم إيقاف وتجميد حساب السائق مؤقتاً بواسطة إدارة المصنع. يرجى التواصل مع إدارة الحركة بالمصنع.";
      safeSetStorageItem(STORAGE_KEYS.DRIVER_ACCOUNTS, JSON.stringify(accounts));

      const current = this.getCurrentDriverSession();
      if (current && current.id === id) {
        this.setCurrentDriverSession(accounts[index]);
      }
      this.notify();
    }
  }

  public unsuspendDriverAccount(id: string): void {
    const accounts = this.getDriverAccounts();
    const index = accounts.findIndex((a) => a.id === id);
    if (index !== -1) {
      accounts[index].approvalStatus = "APPROVED";
      accounts[index].approvalNote = "تم إعادة تفعيل الحساب بنجاح بواسطة إدارة المصنع";
      safeSetStorageItem(STORAGE_KEYS.DRIVER_ACCOUNTS, JSON.stringify(accounts));

      const current = this.getCurrentDriverSession();
      if (current && current.id === id) {
        this.setCurrentDriverSession(accounts[index]);
      }
      this.notify();
    }
  }

  public addDriverAccount(data: {
    driverName: string;
    phone: string;
    vehicleNo: string;
    vehicleType: string;
    username: string;
    password?: string;
    factoryId?: string;
    factoryName?: string;
    notes?: string;
  }): DriverAccount {
    const accounts = this.getDriverAccounts();

    // Check if username already exists
    const exists = accounts.some(
      (a) => a.username.toLowerCase() === data.username.trim().toLowerCase()
    );
    if (exists) {
      throw new Error(`اسم المستخدم "${data.username}" مستخدم بالفعل، يرجى اختيار اسم آخر للسائق.`);
    }

    const currentFactory = this.getCurrentFactorySession();
    const fId = data.factoryId || currentFactory?.id || "fac-1";
    const fName = data.factoryName || currentFactory?.factoryName || "مصنع البركة للأغذية والمواشي";

    const newAcc: DriverAccount = {
      id: `drv-${Date.now()}`,
      driverName: data.driverName.trim(),
      phone: data.phone.trim(),
      vehicleNo: data.vehicleNo.trim(),
      vehicleType: data.vehicleType.trim(),
      username: data.username.trim(),
      password: data.password?.trim() || "123456",
      factoryId: fId,
      factoryName: fName,
      notes: data.notes?.trim() || "سائق معتمد لدى المصنع",
      createdAt: new Date().toISOString(),
    };

    accounts.unshift(newAcc);
    safeSetStorageItem(STORAGE_KEYS.DRIVER_ACCOUNTS, JSON.stringify(accounts));

    // Also sync to legacy DRIVERS list
    this.addDriver({
      name: newAcc.driverName,
      phone: newAcc.phone,
      vehicleNo: newAcc.vehicleNo,
      vehicleType: newAcc.vehicleType,
      factoryId: newAcc.factoryId,
      notes: newAcc.notes,
    });

    this.notify();
    return newAcc;
  }

  public updateDriverAccountDetails(
    id: string,
    data: {
      driverName?: string;
      username?: string;
      phone?: string;
      email?: string;
      password?: string;
      vehicleNo?: string;
      vehicleType?: string;
      notes?: string;
      city?: string;
      district?: string;
      fullAddress?: string;
      lat?: number;
      lng?: number;
    }
  ): void {
    const accounts = this.getDriverAccounts();
    const index = accounts.findIndex((a) => a.id === id);
    if (index !== -1) {
      const acc = accounts[index];
      if (data.driverName !== undefined) acc.driverName = data.driverName.trim();
      if (data.username !== undefined) acc.username = data.username.trim();
      if (data.phone !== undefined) acc.phone = data.phone.trim();
      if (data.email !== undefined) acc.email = data.email.trim();
      if (data.password && data.password.trim().length > 0) acc.password = data.password.trim();
      if (data.vehicleNo !== undefined) acc.vehicleNo = data.vehicleNo.trim();
      if (data.vehicleType !== undefined) acc.vehicleType = data.vehicleType.trim();
      if (data.notes !== undefined) acc.notes = data.notes.trim();
      if (data.city !== undefined) acc.city = data.city.trim();
      if (data.district !== undefined) acc.district = data.district.trim();
      if (data.fullAddress !== undefined) acc.fullAddress = data.fullAddress.trim();
      if (data.lat !== undefined) acc.lat = data.lat;
      if (data.lng !== undefined) acc.lng = data.lng;

      safeSetStorageItem(STORAGE_KEYS.DRIVER_ACCOUNTS, JSON.stringify(accounts));

      const current = this.getCurrentDriverSession();
      if (current && current.id === id) {
        this.setCurrentDriverSession(acc);
      }
      this.notify();
    }
  }

  public deleteDriverAccount(id: string): void {
    const targetAccount = this.getDriverAccounts().find((a) => a.id === id);
    const accounts = this.getDriverAccounts().filter((a) => a.id !== id);
    safeSetStorageItem(STORAGE_KEYS.DRIVER_ACCOUNTS, JSON.stringify(accounts));

    // Also remove from legacy DRIVERS array if matched by ID or name
    if (targetAccount) {
      const legacyDrivers = this.getDrivers().filter(
        (d) => d.id !== id && d.name !== targetAccount.driverName
      );
      safeSetStorageItem(STORAGE_KEYS.DRIVERS, JSON.stringify(legacyDrivers));
    }

    const currentSession = this.getCurrentDriverSession();
    if (currentSession && currentSession.id === id) {
      this.setCurrentDriverSession(null);
    }

    this.notify();
  }

  // Employees & Staff Directory CRUD
  public getEmployees(): EmployeeRecord[] {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.EMPLOYEES);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (err) {
      console.error("Error reading employees:", err);
    }
    return DEFAULT_EMPLOYEES;
  }

  public addEmployee(data: Omit<EmployeeRecord, "id">): EmployeeRecord {
    const list = this.getEmployees();
    const newEmp: EmployeeRecord = {
      ...data,
      id: `emp-${Date.now()}`,
    };
    list.unshift(newEmp);
    safeSetStorageItem(STORAGE_KEYS.EMPLOYEES, JSON.stringify(list));
    this.notify();
    return newEmp;
  }

  public updateEmployee(id: string, data: Partial<EmployeeRecord>): void {
    const list = this.getEmployees().map((emp) =>
      emp.id === id ? { ...emp, ...data } : emp
    );
    safeSetStorageItem(STORAGE_KEYS.EMPLOYEES, JSON.stringify(list));
    this.notify();
  }

  public deleteEmployee(id: string): void {
    const list = this.getEmployees().filter((emp) => emp.id !== id);
    safeSetStorageItem(STORAGE_KEYS.EMPLOYEES, JSON.stringify(list));
    this.notify();
  }

  public recordEmployeeAttendance(
    id: string,
    status: EmployeeAttendanceStatus,
    timeStr?: string
  ): void {
    const now = timeStr || new Date().toLocaleTimeString("ar-YE", { hour: "2-digit", minute: "2-digit" });
    const list = this.getEmployees().map((emp) => {
      if (emp.id === id) {
        return {
          ...emp,
          status,
          checkInTime: status === "PRESENT" ? (emp.checkInTime || now) : emp.checkInTime,
        };
      }
      return emp;
    });
    safeSetStorageItem(STORAGE_KEYS.EMPLOYEES, JSON.stringify(list));
    this.notify();
  }

  public addEmployeeAdvance(
    id: string,
    advance: Omit<EmployeeAdvance, "id" | "date">
  ): void {
    const list = this.getEmployees().map((emp) => {
      if (emp.id === id) {
        const newAdv: EmployeeAdvance = {
          ...advance,
          id: `adv-${Date.now()}`,
          date: new Date().toISOString().split("T")[0],
        };
        return {
          ...emp,
          advances: [newAdv, ...(emp.advances || [])],
        };
      }
      return emp;
    });
    safeSetStorageItem(STORAGE_KEYS.EMPLOYEES, JSON.stringify(list));
    this.notify();
  }

  public addEmployeePenalty(
    id: string,
    penalty: Omit<EmployeePenalty, "id" | "date">
  ): void {
    const list = this.getEmployees().map((emp) => {
      if (emp.id === id) {
        const newPen: EmployeePenalty = {
          ...penalty,
          id: `pen-${Date.now()}`,
          date: new Date().toISOString().split("T")[0],
        };
        return {
          ...emp,
          penalties: [newPen, ...(emp.penalties || [])],
        };
      }
      return emp;
    });
    safeSetStorageItem(STORAGE_KEYS.EMPLOYEES, JSON.stringify(list));
    this.notify();
  }

  // Get Platform Subscription Settings
  public getSubscriptionSettings(): PlatformSubscriptionSettings {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.SUBSCRIPTION_SETTINGS);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (err) {
      console.error("Error reading subscription settings:", err);
    }
    return DEFAULT_SUBSCRIPTION_SETTINGS;
  }

  // Update Subscription Settings
  public updateSubscriptionSettings(newSettings: PlatformSubscriptionSettings): void {
    try {
      safeSetStorageItem(STORAGE_KEYS.SUBSCRIPTION_SETTINGS, JSON.stringify(newSettings));
      this.notify();
    } catch (err) {
      console.error("Error saving subscription settings:", err);
    }
  }

  // Reset Subscription Settings to Default
  public resetSubscriptionSettingsToDefault(): PlatformSubscriptionSettings {
    try {
      safeSetStorageItem(STORAGE_KEYS.SUBSCRIPTION_SETTINGS, JSON.stringify(DEFAULT_SUBSCRIPTION_SETTINGS));
      this.notify();
    } catch (err) {
      console.error("Error resetting subscription settings:", err);
    }
    return DEFAULT_SUBSCRIPTION_SETTINGS;
  }

  // Completely wipe all data for a clean slate with 1 single factory
  public wipeAllData(): void {
    this.zeroOutAllData();
  }

  // Reset data helper
  public resetToDefault() {
    this.zeroOutAllData();
  }

  // Completely clear all demo/test data (factories, products, orders, items, accounts)
  public clearAllDemoData(): void {
    this.zeroOutAllData();
  }
}

export const storeService = new StoreService();
