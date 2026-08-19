export type FactoryCategory = string;

export interface FactoryCategoryInfo {
  id: string;
  nameAr: string;
  description?: string;
  icon?: string;
}

export interface Factory {
  id: string;
  name: string;
  category: FactoryCategory;
  categoryNameAr: string;
  logo: string;
  city: string;
  district: string;
  address: string;
  fullAddress?: string;
  phone: string;
  email: string;
  rating: number;
  ordersFulfilled: number;
  verified: boolean;
  minOrderValue: number;
  avgPreparationHours: number;
  preparationHours?: number;
  commercialReg: string;
  taxNumber?: string;
  lat?: number;
  lng?: number;
}

export interface Product {
  id: string;
  factoryId: string;
  factoryName: string;
  name: string;
  description: string;
  category: string;
  price: number; // Wholesale price per unit in SAR
  unit: string; // e.g. "كرتونة (24 حبة)", "كيس 10 كجم", "باكت 12 علبة"
  stock: number;
  minQuantity: number;
  minStockAlert?: number; // Minimum stock alert threshold for factory
  image: string;
  sku: string;
  barcode: string;
  isAvailable: boolean;
}

export interface WholesalerProfile {
  id: string;
  storeName: string; // اسم المتجر / المحل
  ownerName: string; // اسم التاجر المسجل
  phone: string;
  email: string;
  city: string;
  district: string;
  fullAddress: string;
  lat: number;
  lng: number;
  commercialReg: string; // رقم السجل التجاري
  taxNumber: string;
}

export interface CartItem {
  product: Product;
  quantity: number;
  factoryId: string;
  factoryName: string;
}

export type OrderStatus =
  | "RECEIVED" // تم استلام الطلب بالمصنع
  | "PROCESSING" // جاري التحضير والتعبئة
  | "READY_FOR_DISPATCH" // جاهز للشحن
  | "LOADED_FROM_FACTORY" // تم استلام الطلبية من المصنع
  | "OUT_FOR_DELIVERY" // قيد التوصيل مع السائق
  | "ARRIVED_AT_DESTINATION" // وصلت إلى موقع التسليم
  | "AWAITING_MERCHANT_CONFIRMATION" // تم تسليم الطلبية - بانتظار موافقة التاجر على التسليم
  | "DELIVERED" // تم التسليم للتاجر
  | "CANCELLED"; // ملغي

export interface StatusHistoryItem {
  status: OrderStatus;
  timestamp: string;
  note?: string;
  updatedBy?: string;
}

export interface DriverInfo {
  name: string;
  phone: string;
  vehicleNo: string;
  vehicleType: string;
  etaMinutes?: number;
  batchRouteNote?: string;
}

export interface DriverRosterItem {
  id: string;
  name: string;
  phone: string;
  vehicleNo: string;
  vehicleType: string;
  factoryId?: string;
  notes?: string;
  createdAt: string;
}

export type DriverApprovalStatus = "PENDING" | "APPROVED" | "SUSPENDED";

export interface DriverAccount {
  id: string;
  username: string; // Used by driver to log into Driver Terminal
  email?: string; // Optional email
  password?: string; // Created by factory or driver
  driverName: string;
  phone: string;
  vehicleNo: string;
  vehicleType: string;
  factoryId: string;
  factoryName: string;
  approvalStatus?: DriverApprovalStatus;
  approvalNote?: string;
  createdSource?: "SELF_REGISTER" | "FACTORY_CREATED";
  notes?: string;
  isOnline?: boolean;
  city?: string;
  district?: string;
  fullAddress?: string;
  lat?: number;
  lng?: number;
  createdAt: string;
}

export interface SubOrder {
  id: string;
  mainOrderId: string;
  factoryId: string;
  factoryName: string;
  wholesaler: WholesalerProfile;
  items: {
    product: Product;
    quantity: number;
    priceAtOrder: number;
  }[];
  subtotal: number;
  tax: number; // 15% VAT
  total: number;
  status: OrderStatus;
  createdAt: string;
  updatedAt: string;
  estimatedDeliveryDate: string;
  assignedDriver?: DriverInfo;
  deliveryNotes?: string;
  verifiedLoadedItems?: string[];
  isFullyVerifiedForLoading?: boolean;
  history: StatusHistoryItem[];
}

export interface MainOrder {
  id: string;
  wholesaler: WholesalerProfile;
  subOrders: SubOrder[];
  totalAmount: number;
  createdAt: string;
  paymentMethod: "INVOICE_30_DAYS" | "CASH_ON_DELIVERY" | "BANK_TRANSFER";
  statusSummary: string;
}

export interface AppNotification {
  id: string;
  targetRole: "WHOLESALER" | "FACTORY" | "ADMIN" | "ALL";
  factoryId?: string;
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  orderId?: string;
  type?: "NEW_ORDER" | "STATUS_UPDATE" | "DRIVER_ASSIGNED" | "DELIVERED" | "SUBSCRIPTION" | "ORDER";
}

export interface MerchantWarehouse {
  id: string;
  name: string;
  city: string;
  district: string;
  address: string;
  managerName: string;
  managerPhone: string;
  capacityNotes?: string;
  isDefault?: boolean;
  createdAt: string;
}

export interface MerchantItem {
  id: string;
  name: string;
  category: string;
  sku: string;
  barcode: string;
  unit: string;
  costPrice: number;
  sellingPrice: number;
  minStockAlert: number;
  warehouseStock: Record<string, number>; // warehouseId -> quantity
  totalStock: number;
  factoryId?: string;
  factoryName?: string;
  productId?: string;
  image?: string;
  description?: string;
  createdAt: string;
}

export interface MerchantSaleItem {
  itemId: string;
  itemName: string;
  sku: string;
  unit: string;
  quantity: number;
  costPrice: number;
  sellingPrice: number;
  total: number;
}

export interface MerchantSaleOrder {
  id: string;
  invoiceNo: string;
  customerName: string;
  customerPhone: string;
  customerType: "RETAIL_STORE" | "WALK_IN" | "COMPANY";
  warehouseId: string;
  warehouseName: string;
  items: MerchantSaleItem[];
  subtotal: number;
  vatTax: number;
  totalAmount: number;
  profitMargin: number;
  paymentMethod: "CASH" | "BANK_TRANSFER" | "CREDIT_30_DAYS";
  status: "COMPLETED" | "DRAFT" | "CANCELLED";
  notes?: string;
  createdAt: string;
}

export type MerchantApprovalStatus = "PENDING" | "APPROVED" | "SUSPENDED";

export type SubscriptionTier = "STARTER" | "PROFESSIONAL" | "ENTERPRISE_VIP";
export type BillingCycle = "MONTHLY" | "YEARLY";

export interface MerchantSubscription {
  planId: SubscriptionTier;
  planNameAr: string;
  status: "ACTIVE" | "EXPIRED" | "SUSPENDED";
  priceMonthly: number;
  billingCycle?: BillingCycle;
  startDate: string;
  endDate: string;
  autoRenew: boolean;
  maxWarehouses: number;
  maxItems: number;
  maxPOSRegisters: number;
  features: string[];
}

export interface PendingSubscriptionChange {
  requestedTier: SubscriptionTier;
  requestedCycle: BillingCycle;
  requestedPlanName: string;
  previousPlanName?: string;
  previousCycle?: BillingCycle;
  price: number;
  requestedAt: string;
  decidedAt?: string;
  status: "PENDING_APPROVAL" | "APPROVED" | "REJECTED";
  note?: string;
}

export interface MerchantAccount {
  id: string;
  username?: string;
  email?: string;
  password?: string;
  storeName: string;
  ownerName: string;
  phone: string;
  commercialReg?: string;
  taxNumber?: string;
  city: string;
  district: string;
  fullAddress: string;
  lat?: number;
  lng?: number;
  taxEnabled?: boolean; // خيار تفعيل أو إلغاء ضريبة القيمة المضافة (في اليمن لا توجد ضريبة مبيعات مضافة إلا إذا فُعّلت يدوياً للتوسع الدولي)
  taxRate?: number; // نسبة الضريبة المئوية في حال التفعيل (افتراضياً 0% أو 15% عند التفعيل)
  approvalStatus: MerchantApprovalStatus;
  approvalNote?: string;
  approvedAt?: string;
  suspendedAt?: string;
  suspensionReason?: string;
  createdSource?: "SELF_REGISTER" | "FACTORY_CREATED";
  subscription: MerchantSubscription;
  pendingSubscriptionChange?: PendingSubscriptionChange;
  lastSubscriptionChangeDecision?: PendingSubscriptionChange;
  whatsAppConfig?: MerchantWhatsAppConfig;
  createdAt: string;
}

export interface MerchantWhatsAppConfig {
  enabled: boolean;
  phoneNumber?: string; // رقم واتساب المتجر الأساسي للارسال
  managerPhone?: string; // رقم هاتف المحاسب/الإدارة لاستلام الإشعارات والسندات
  centralServerIp?: string; // عنوان IP لجهاز واتساب المركزي (اختياري)
  sendEmployeeVouchers?: boolean; // إرسال سندات السلف والرواتب للموظفين عبر واتساب
  sendExpenseVouchers?: boolean; // إرسال سندات المصروفات للإدارة عبر واتساب
  sendDailySalesReport?: boolean; // إرسال تقرير المبيعات اليومية (ملخص الوردية)
  apiKey?: string;
  autoSendSalaryVouchers?: boolean; // إرسال تلقائي لسندات صرف الراتب
  autoSendAdvanceVouchers?: boolean; // إرسال تلقائي لسندات صرف السلف
  autoSendPenaltyVouchers?: boolean; // إرسال تلقائي لسندات الخصومات والجزاءات
  sendManagerCopy?: boolean; // إرسال نسخة تلقائية للمدير
  directBackgroundDispatch?: boolean; // إرسال السندات تلقائياً في الخلفية مباشرة دون فتح أي نافذة
  customHeader?: string;
  customFooter?: string;
  isConnected?: boolean;
  connectedAt?: string;
}

export type VoucherType = "DISBURSEMENT_ADVANCE" | "DISBURSEMENT_SALARY" | "DEDUCTION_PENALTY" | "BONUS_REWARD";

export interface EmployeeVoucher {
  id: string;
  voucherNumber: string; // e.g. "VCH-2026-0817"
  type: VoucherType;
  typeLabelAr: string; // e.g. "سند صرف سلفة نقدية" أو "سند حسم / خصم إداري"
  storeName: string;
  storePhone?: string;
  employeeId: string;
  employeeName: string;
  employeeCode: string;
  employeeRole: string;
  employeePhone: string;
  amount: number;
  amountInWords?: string;
  reason: string;
  date: string;
  time: string;
  approvedBy: string;
  financialSummary?: {
    basicSalary: number;
    totalAdvances?: number;
    totalDeductions?: number;
    netRemaining?: number;
  };
  notes?: string;
}

export type FactoryApprovalStatus = "PENDING" | "APPROVED" | "SUSPENDED";

export interface FactorySubscription {
  planId: SubscriptionTier;
  planNameAr: string;
  status: "ACTIVE" | "EXPIRED" | "SUSPENDED";
  priceMonthly: number;
  billingCycle?: BillingCycle;
  startDate: string;
  endDate: string;
  autoRenew: boolean;
  maxProducts: number;
  maxMonthlyOrders: number;
  maxDrivers: number;
  features: string[];
}

export interface FactoryAccount {
  id: string;
  username?: string;
  email: string;
  password?: string;
  factoryName: string;
  ownerName: string;
  phone: string;
  commercialReg: string;
  taxNumber?: string;
  category: string;
  categoryNameAr?: string;
  city: string;
  district: string;
  fullAddress: string;
  minOrderValue?: number;
  avgPreparationHours?: number;
  lat?: number;
  lng?: number;
  factoryId: string;
  approvalStatus: FactoryApprovalStatus;
  approvalNote?: string;
  approvedAt?: string;
  suspendedAt?: string;
  suspensionReason?: string;
  subscription: FactorySubscription;
  createdAt: string;
}

export interface SubscriptionPlanConfig {
  id: string;
  targetType: "MERCHANT" | "FACTORY";
  cycle: "YEARLY" | "MONTHLY";
  title: string;
  price: number;
  originalPrice?: number;
  currency: string;
  discountBadge?: string;
  description: string;
  features: string[];
  isActive: boolean;
}

export interface SpecialOfferConfig {
  id: string;
  title: string;
  badge: string;
  discountPercent: number;
  targetType: "ALL" | "MERCHANT" | "FACTORY";
  validUntil: string;
  description: string;
  code?: string;
  isActive: boolean;
}

export interface PlatformSubscriptionSettings {
  plans: SubscriptionPlanConfig[];
  specialOffers: SpecialOfferConfig[];
  activePromoBanner?: string;
  isPromoBannerEnabled: boolean;
}

export type EmployeeAttendanceStatus = "PRESENT" | "ABSENT" | "NOT_ATTENDED_YET" | "LEAVE" | "LATE";

export interface EmployeeAdvance {
  id: string;
  amount: number;
  date: string;
  reason: string;
  status: "PAID" | "PENDING_DEDUCTION" | "DEDUCTED";
}

export interface EmployeePenalty {
  id: string;
  type: "DEDUCTION" | "WARNING" | "BONUS";
  amount?: number;
  date: string;
  reason: string;
  approvedBy: string;
}

export type EmployeeShiftType = "MORNING" | "EVENING" | "FULL_DAY" | "CUSTOM";

export interface EmployeeRecord {
  id: string;
  empCode: string; // e.g. "EMP-41464#"
  name: string; // e.g. "براق الجالفي"
  roleTitle: string; // e.g. "كاشير نقطة البيع"
  department?: string;
  avatar?: string;
  nationality: string; // e.g. "يمني"
  idNumber: string; // e.g. "2596589826"
  idExpiryDate?: string;
  phone: string;
  status: EmployeeAttendanceStatus;
  checkInTime?: string;
  checkOutTime?: string;
  basicSalary: number;
  allowances?: number;
  joinDate: string;
  shift: EmployeeShiftType;
  customShiftHours?: {
    from: string;
    to: string;
  };
  advances: EmployeeAdvance[];
  penalties: EmployeePenalty[];
  notes?: string;
}



