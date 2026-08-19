import React, { useState, useEffect, useMemo } from "react";
import { SubOrder, WholesalerProfile, DriverRosterItem, DriverAccount, OrderStatus } from "../../types";
import { storeService } from "../../services/storeService";
import { DriverAuth } from "./DriverAuth";
import { DriverSettingsModal } from "./DriverSettingsModal";
import { PlatformInfoBox, CustomerServiceButton } from "../PlatformInfoBox";
import {
  Truck,
  MapPin,
  Phone,
  CheckCircle2,
  PackageCheck,
  Building2,
  ShieldCheck,
  Search,
  Check,
  AlertTriangle,
  Clock,
  DollarSign,
  User,
  Navigation,
  FileText,
  Boxes,
  RefreshCw,
  ChevronDown,
  ChevronUp,
  Maximize2,
  Minimize2,
  Layers,
  Info,
  X,
  Settings,
  Lock,
  Radio,
  Gauge,
  Inbox,
  History,
  LayoutGrid,
  Sparkles,
  Smartphone,
  CheckCircle,
  AlertCircle,
  ExternalLink,
  ChevronRight,
  TrendingUp,
  SlidersHorizontal,
} from "lucide-react";

interface Props {
  subOrders: SubOrder[];
  onOpenMapModal: (wholesaler: WholesalerProfile) => void;
}

export const DriverAppTerminal: React.FC<Props> = ({
  subOrders,
  onOpenMapModal,
}) => {
  const [currentDriverAccount, setCurrentDriverAccount] = useState<DriverAccount | null>(() =>
    storeService.getCurrentDriverSession()
  );

  const [drivers, setDrivers] = useState<DriverRosterItem[]>([]);
  const [merchantWarehouses, setMerchantWarehouses] = useState(storeService.getMerchantWarehouses());
  const [selectedDriverName, setSelectedDriverName] = useState<string>("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  
  // Mobile app tab navigation: NEW_ORDERS (الجديدة/الموكلة), ACTIVE_DELIVERY (قيد التوصيل الآن), COMPLETED (سجل المكتملة), ALL (الكل)
  const [activeTab, setActiveTab] = useState<"NEW" | "IN_TRANSIT" | "COMPLETED" | "ALL">("NEW");
  
  const [expandedChecklists, setExpandedChecklists] = useState<Record<string, boolean>>({});
  const [expandedOrders, setExpandedOrders] = useState<Record<string, boolean>>({});
  const [showPlatformModal, setShowPlatformModal] = useState(false);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  const [quickFiltersOpen, setQuickFiltersOpen] = useState(false);

  const [previewImageModalItem, setPreviewImageModalItem] = useState<{
    name: string;
    image: string;
    unit: string;
    quantity: number;
    priceAtOrder?: number;
    isVerified: boolean;
    subId: string;
    productId: string;
  } | null>(null);

  useEffect(() => {
    const loadedDrivers = storeService.getDrivers();
    const loadedWarehouses = storeService.getMerchantWarehouses();
    const session = storeService.getCurrentDriverSession();
    setDrivers(loadedDrivers);
    setMerchantWarehouses(loadedWarehouses);
    setCurrentDriverAccount(session);

    if (session) {
      setSelectedDriverName(session.driverName);
    } else if (loadedDrivers.length > 0 && selectedDriverName === "ALL") {
      setSelectedDriverName(loadedDrivers[0].name);
    }

    const unsubscribe = storeService.subscribe(() => {
      const updatedSession = storeService.getCurrentDriverSession();
      setCurrentDriverAccount(updatedSession);
      setDrivers(storeService.getDrivers());
      setMerchantWarehouses(storeService.getMerchantWarehouses());
    });
    return () => unsubscribe();
  }, []);

  const handleDriverLogout = () => {
    storeService.setCurrentDriverSession(null);
    setCurrentDriverAccount(null);
  };

  // If driver is not authenticated or account is pending factory approval or suspended, render DriverAuth
  if (!currentDriverAccount || currentDriverAccount.approvalStatus === "PENDING" || currentDriverAccount.approvalStatus === "SUSPENDED") {
    return (
      <DriverAuth
        currentAccount={currentDriverAccount}
        onAuthenticated={(acc) => {
          setCurrentDriverAccount(acc);
          setSelectedDriverName(acc.driverName);
        }}
        onLogout={handleDriverLogout}
      />
    );
  }

  // Base list of driver's assigned orders
  const baseDriverOrders = useMemo(() => {
    return subOrders.filter((sub) => {
      // 1. Isolate by factory
      if (currentDriverAccount?.factoryId && sub.factoryId && sub.factoryId !== currentDriverAccount.factoryId) {
        return false;
      }

      // 2. Filter by assigned driver
      const matchesDriver =
        selectedDriverName === "ALL" ||
        (sub.assignedDriver && sub.assignedDriver.name === selectedDriverName) ||
        (sub.assignedDriver && sub.assignedDriver.name === currentDriverAccount?.driverName);

      return matchesDriver;
    });
  }, [subOrders, currentDriverAccount, selectedDriverName]);

  // Counts for mobile tabs
  const tabCounts = useMemo(() => {
    const newOrders = baseDriverOrders.filter(
      (s) => s.status === "RECEIVED" || s.status === "PROCESSING" || s.status === "READY_FOR_DISPATCH" || s.status === "LOADED_FROM_FACTORY"
    ).length;
    const inTransit = baseDriverOrders.filter(
      (s) => s.status === "OUT_FOR_DELIVERY" || s.status === "ARRIVED_AT_DESTINATION" || s.status === "AWAITING_MERCHANT_CONFIRMATION"
    ).length;
    const completed = baseDriverOrders.filter((s) => s.status === "DELIVERED").length;
    const all = baseDriverOrders.length;

    return { newOrders, inTransit, completed, all };
  }, [baseDriverOrders]);

  // Filtered orders according to Tab & Search Query
  const filteredDriverOrders = useMemo(() => {
    let list = baseDriverOrders.filter((sub) => {
      // Tab filter
      if (activeTab === "NEW") {
        return (
          sub.status === "RECEIVED" ||
          sub.status === "PROCESSING" ||
          sub.status === "READY_FOR_DISPATCH" ||
          sub.status === "LOADED_FROM_FACTORY"
        );
      }
      if (activeTab === "IN_TRANSIT") {
        return (
          sub.status === "OUT_FOR_DELIVERY" ||
          sub.status === "ARRIVED_AT_DESTINATION" ||
          sub.status === "AWAITING_MERCHANT_CONFIRMATION"
        );
      }
      if (activeTab === "COMPLETED") {
        return sub.status === "DELIVERED";
      }
      return true; // "ALL"
    });

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      list = list.filter(
        (sub) =>
          sub.wholesaler.storeName.toLowerCase().includes(q) ||
          sub.wholesaler.ownerName.toLowerCase().includes(q) ||
          sub.wholesaler.city.toLowerCase().includes(q) ||
          sub.wholesaler.district.toLowerCase().includes(q) ||
          sub.wholesaler.phone.includes(q) ||
          sub.id.toLowerCase().includes(q) ||
          sub.items.some((it) => it.product.name.toLowerCase().includes(q))
      );
    }

    return list;
  }, [baseDriverOrders, activeTab, searchQuery]);

  // Analytics calculation
  const totalAmountToCollect = baseDriverOrders.reduce((sum, s) => sum + s.total, 0);
  const totalCompletedAmount = baseDriverOrders.filter(s => s.status === "DELIVERED").reduce((sum, s) => sum + s.total, 0);

  const toggleOrderExpansion = (orderId: string) => {
    setExpandedOrders((prev) => ({
      ...prev,
      [orderId]: !prev[orderId],
    }));
  };

  const expandAllOrders = () => {
    const allExpanded: Record<string, boolean> = {};
    filteredDriverOrders.forEach((o) => {
      allExpanded[o.id] = true;
    });
    setExpandedOrders(allExpanded);
  };

  const collapseAllOrders = () => {
    setExpandedOrders({});
  };

  const toggleChecklist = (subOrderId: string) => {
    setExpandedChecklists((prev) => ({
      ...prev,
      [subOrderId]: !prev[subOrderId],
    }));
  };

  // Helper for status progression rank
  const getStepRank = (st: OrderStatus): number => {
    switch (st) {
      case "RECEIVED":
      case "PROCESSING":
      case "READY_FOR_DISPATCH":
        return 0;
      case "LOADED_FROM_FACTORY":
        return 1;
      case "OUT_FOR_DELIVERY":
        return 2;
      case "ARRIVED_AT_DESTINATION":
        return 3;
      case "AWAITING_MERCHANT_CONFIRMATION":
        return 4;
      case "DELIVERED":
        return 5;
      default:
        return 0;
    }
  };

  // Undelivered orders for smart sequential delivery
  const undeliveredOrders = baseDriverOrders.filter(
    (s) => s.status !== "DELIVERED" && s.status !== "CANCELLED"
  );
  const firstActiveOrder = undeliveredOrders[0];

  return (
    <div className="max-w-4xl mx-auto space-y-4 dir-rtl pb-24 px-2 sm:px-4">
      
      {/* =========================================================================
          1. MOBILE-FIRST APP HEADER (شريط رأس تطبيق السائق الذكي)
          ========================================================================= */}
      <div className="rounded-3xl bg-slate-900 text-white shadow-xl border border-slate-800 p-4 sm:p-5 relative overflow-hidden">
        {/* Ambient Top Glow */}
        <div className="absolute top-0 right-1/4 w-48 h-48 bg-indigo-500/15 rounded-full blur-3xl pointer-events-none" />
        
        <div className="relative z-10 flex flex-col gap-4">
          
          {/* Top Row: Driver Profile + Settings/Logout */}
          <div className="flex items-center justify-between gap-3">
            
            {/* Driver Identity */}
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-gradient-to-br from-indigo-600 to-indigo-800 border border-indigo-400/40 flex items-center justify-center text-white shadow-lg shrink-0">
                  <Truck className="w-6 h-6 sm:w-7 sm:h-7" />
                </div>
                <span className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-emerald-500 border-2 border-slate-900 flex items-center justify-center">
                  <span className="w-2 h-2 rounded-full bg-white animate-ping inline-block" />
                </span>
              </div>

              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-base sm:text-lg font-black text-white">
                    {currentDriverAccount.driverName}
                  </h1>
                  <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 text-[10px] font-black">
                    متصل 🟢
                  </span>
                </div>
                
                <div className="flex items-center gap-2 text-xs text-slate-300 mt-0.5 flex-wrap">
                  <span className="text-amber-300 font-bold flex items-center gap-1">
                    <Building2 className="w-3.5 h-3.5" />
                    {currentDriverAccount.factoryName}
                  </span>
                  <span>•</span>
                  <span className="text-slate-400 font-mono text-[11px]">
                    {currentDriverAccount.vehicleType} ({currentDriverAccount.vehicleNo})
                  </span>
                </div>
              </div>
            </div>

            {/* Quick Actions (Settings & Logout) */}
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setIsSettingsModalOpen(true)}
                className="p-2.5 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-all cursor-pointer shadow-xs active:scale-95"
                title="إعدادات السائق والموقع"
              >
                <Settings className="w-4 h-4 text-indigo-300" />
              </button>

              <button
                type="button"
                onClick={handleDriverLogout}
                className="p-2.5 rounded-2xl bg-rose-950/80 hover:bg-rose-900 text-rose-300 border border-rose-800/80 transition-all cursor-pointer shadow-xs active:scale-95"
                title="تسجيل خروج السائق"
              >
                <User className="w-4 h-4" />
              </button>
            </div>

          </div>

          {/* GPS Broadcast Pill for Mobile */}
          <div className="p-3 rounded-2xl bg-gradient-to-r from-cyan-950/90 to-indigo-950/90 border border-cyan-500/30 flex items-center justify-between gap-2 text-xs">
            <div className="flex items-center gap-2">
              <Radio className="w-4 h-4 text-cyan-400 animate-pulse shrink-0" />
              <span className="text-cyan-200 font-bold text-[11px] sm:text-xs">
                بث الموقع الحي GPS نشط وموجه لمحطة التاجر الأولى 📡
              </span>
            </div>
            <CustomerServiceButton label="دعم 🎧" />
          </div>

        </div>
      </div>

      {/* =========================================================================
          2. MOBILE APP TAB NAVIGATION BAR (أقسام التطبيق الرئيسية)
          ========================================================================= */}
      <div className="grid grid-cols-4 gap-2 bg-white dark:bg-slate-900 p-1.5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm sticky top-2 z-20 backdrop-blur-md">
        
        {/* Tab 1: New / Assigned Orders */}
        <button
          type="button"
          onClick={() => setActiveTab("NEW")}
          className={`py-2.5 px-2 rounded-xl font-black text-xs transition-all flex flex-col items-center justify-center gap-1 cursor-pointer relative ${
            activeTab === "NEW"
              ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/30 scale-[1.02]"
              : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
          }`}
        >
          <div className="flex items-center gap-1">
            <Inbox className="w-4 h-4" />
            <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-mono font-bold ${
              activeTab === "NEW" ? "bg-white/25 text-white" : "bg-indigo-100 text-indigo-800 dark:bg-indigo-950 dark:text-indigo-300"
            }`}>
              {tabCounts.newOrders}
            </span>
          </div>
          <span className="text-[11px] leading-tight">الجديدة/التحميل</span>
        </button>

        {/* Tab 2: In Transit / Active Delivery */}
        <button
          type="button"
          onClick={() => setActiveTab("IN_TRANSIT")}
          className={`py-2.5 px-2 rounded-xl font-black text-xs transition-all flex flex-col items-center justify-center gap-1 cursor-pointer relative ${
            activeTab === "IN_TRANSIT"
              ? "bg-cyan-600 text-white shadow-md shadow-cyan-600/30 scale-[1.02]"
              : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
          }`}
        >
          <div className="flex items-center gap-1">
            <Truck className={`w-4 h-4 ${tabCounts.inTransit > 0 ? "animate-truck-hop" : ""}`} />
            <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-mono font-bold ${
              activeTab === "IN_TRANSIT" ? "bg-white/25 text-white" : "bg-cyan-100 text-cyan-800 dark:bg-cyan-950 dark:text-cyan-300"
            }`}>
              {tabCounts.inTransit}
            </span>
          </div>
          <span className="text-[11px] leading-tight">قيد التوصيل 🚚</span>
        </button>

        {/* Tab 3: Completed Orders History */}
        <button
          type="button"
          onClick={() => setActiveTab("COMPLETED")}
          className={`py-2.5 px-2 rounded-xl font-black text-xs transition-all flex flex-col items-center justify-center gap-1 cursor-pointer relative ${
            activeTab === "COMPLETED"
              ? "bg-emerald-600 text-white shadow-md shadow-emerald-600/30 scale-[1.02]"
              : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
          }`}
        >
          <div className="flex items-center gap-1">
            <CheckCircle2 className="w-4 h-4" />
            <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-mono font-bold ${
              activeTab === "COMPLETED" ? "bg-white/25 text-white" : "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300"
            }`}>
              {tabCounts.completed}
            </span>
          </div>
          <span className="text-[11px] leading-tight">سجل المسلّمة ✅</span>
        </button>

        {/* Tab 4: All Orders */}
        <button
          type="button"
          onClick={() => setActiveTab("ALL")}
          className={`py-2.5 px-2 rounded-xl font-black text-xs transition-all flex flex-col items-center justify-center gap-1 cursor-pointer relative ${
            activeTab === "ALL"
              ? "bg-slate-900 text-white shadow-md scale-[1.02]"
              : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
          }`}
        >
          <div className="flex items-center gap-1">
            <LayoutGrid className="w-4 h-4" />
            <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-mono font-bold ${
              activeTab === "ALL" ? "bg-white/25 text-white" : "bg-slate-200 text-slate-800 dark:bg-slate-800 dark:text-slate-200"
            }`}>
              {tabCounts.all}
            </span>
          </div>
          <span className="text-[11px] leading-tight">كافة الشحنات</span>
        </button>

      </div>

      {/* =========================================================================
          3. SUMMARY METRICS CARDS (ملخص الرحلة والتحصيل المالي)
          ========================================================================= */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
        
        <div className="p-3 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs flex items-center gap-2.5">
          <div className="p-2 bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 rounded-xl shrink-0">
            <Boxes className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <span className="text-[10px] font-bold text-slate-500 block truncate">إجمالي الشحنات</span>
            <span className="text-sm font-black text-slate-900 dark:text-white font-mono">
              {baseDriverOrders.length} طلبية
            </span>
          </div>
        </div>

        <div className="p-3 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs flex items-center gap-2.5">
          <div className="p-2 bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 rounded-xl shrink-0">
            <Clock className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <span className="text-[10px] font-bold text-slate-500 block truncate">المتبقي للتسليم</span>
            <span className="text-sm font-black text-amber-600 dark:text-amber-400 font-mono">
              {undeliveredOrders.length} محطة
            </span>
          </div>
        </div>

        <div className="p-3 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs flex items-center gap-2.5">
          <div className="p-2 bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 rounded-xl shrink-0">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <span className="text-[10px] font-bold text-slate-500 block truncate">تم تسليمها بنجاح</span>
            <span className="text-sm font-black text-emerald-600 dark:text-emerald-400 font-mono">
              {tabCounts.completed} مكتملة
            </span>
          </div>
        </div>

        <div className="p-3 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs flex items-center gap-2.5">
          <div className="p-2 bg-cyan-50 dark:bg-cyan-950/60 text-cyan-600 dark:text-cyan-400 rounded-xl shrink-0">
            <DollarSign className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <span className="text-[10px] font-bold text-slate-500 block truncate">إجمالي التحصيل</span>
            <span className="text-xs sm:text-sm font-black text-cyan-700 dark:text-cyan-400 font-mono truncate block">
              {totalAmountToCollect.toLocaleString("ar-YE")} ر.ي
            </span>
          </div>
        </div>

      </div>

      {/* =========================================================================
          4. SEARCH & EXPAND CONTROLS (البحث والتحكم بالعرض المدمج)
          ========================================================================= */}
      <div className="p-3 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5">
        
        {/* Search */}
        <div className="relative flex-1">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="ابحث باسم المحل، التاجر، المدينة، رقم الطلبية..."
            className="w-full pr-9 pl-8 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-bold text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:outline-none"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery("")}
              className="absolute left-2.5 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-600 cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* View toggles */}
        <div className="flex items-center gap-1.5 justify-end">
          <button
            type="button"
            onClick={collapseAllOrders}
            className="px-2.5 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold text-xs transition-colors flex items-center gap-1 shrink-0 cursor-pointer"
            title="طي كافة التفاصيل لعرض مدمج"
          >
            <Minimize2 className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">عرض مدمج</span>
          </button>

          <button
            type="button"
            onClick={expandAllOrders}
            className="px-2.5 py-1.5 rounded-xl bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-950/60 dark:hover:bg-indigo-900/60 text-indigo-700 dark:text-indigo-300 font-bold text-xs transition-colors flex items-center gap-1 shrink-0 cursor-pointer"
            title="توسيع كافة الطلبيات"
          >
            <Maximize2 className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">توسيع الكل</span>
          </button>
        </div>

      </div>

      {/* =========================================================================
          5. BATCH LOAD ACTION AT FACTORY (تحميل الكل للشاحنة بالمصنع)
          ========================================================================= */}
      {baseDriverOrders.some((s) => s.status === "RECEIVED" || s.status === "PROCESSING" || s.status === "READY_FOR_DISPATCH") && (
        <div className="p-3.5 rounded-2xl bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white border border-indigo-500/40 shadow-lg flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-indigo-500/20 border border-indigo-400/40 flex items-center justify-center text-emerald-400 shrink-0">
              <PackageCheck className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-extrabold text-xs sm:text-sm text-indigo-200">
                تحميل كافة الحمولات بالشاحنة دفعة واحدة بالمصنع 🏭
              </h4>
              <p className="text-[11px] text-slate-300">
                تأكيد استلام وفحص كافة الشحنات على الشاحنة لإعلام التجار بجاهزية الانطلاق.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => {
              baseDriverOrders
                .filter((s) => s.status === "RECEIVED" || s.status === "PROCESSING" || s.status === "READY_FOR_DISPATCH")
                .forEach((s) => {
                  storeService.updateSubOrderStatus(
                    s.id,
                    "LOADED_FROM_FACTORY",
                    s.assignedDriver,
                    "تم استلام وتحميل الشحنة بالمصنع ضمن حمولة الشاحنة المجمعة"
                  );
                });
            }}
            className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-black text-xs transition-all shadow-md shrink-0 cursor-pointer flex items-center justify-center gap-1.5 active:scale-95"
          >
            <Check className="w-4 h-4" />
            <span>تأكيد تحميل الكل للشاحنة 🏭</span>
          </button>
        </div>
      )}

      {/* =========================================================================
          6. ORDERS LIST ACCORDING TO SELECTED TAB
          ========================================================================= */}
      {filteredDriverOrders.length === 0 ? (
        <div className="p-10 text-center text-slate-400 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 space-y-3 shadow-xs">
          <div className="w-14 h-14 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400 mx-auto">
            {activeTab === "NEW" && <Inbox className="w-7 h-7" />}
            {activeTab === "IN_TRANSIT" && <Truck className="w-7 h-7" />}
            {activeTab === "COMPLETED" && <CheckCircle2 className="w-7 h-7" />}
            {activeTab === "ALL" && <LayoutGrid className="w-7 h-7" />}
          </div>
          <h3 className="font-extrabold text-slate-800 dark:text-white text-sm">
            {activeTab === "NEW" && "لا توجد طلبيات جديدة بانتظار التحميل حالياً"}
            {activeTab === "IN_TRANSIT" && "لا توجد شحنات قيد التوصيل على الطريق حالياً"}
            {activeTab === "COMPLETED" && "لا توجد طلبيات مسجلة في سجل المسلّمة حتى الآن"}
            {activeTab === "ALL" && "لا توجد طلبيات مطابقة لبحثك"}
          </h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            {activeTab === "NEW"
              ? "عند قيام المصنع بتعيين شحنات جديدة لمركبتك ستظهر هنا فوراً."
              : "يمكنك التبديل بين التبويبات العلوية لمشاهدة باقي الشحنات."}
          </p>
          {activeTab !== "ALL" && (
            <button
              type="button"
              onClick={() => setActiveTab("ALL")}
              className="px-4 py-2 rounded-xl bg-indigo-600 text-white font-bold text-xs shadow-xs cursor-pointer hover:bg-indigo-700 transition-colors"
            >
              عرض كافة الشحنات ({tabCounts.all})
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-3.5">
          {filteredDriverOrders.map((sub, index) => {
            const verifiedItemsCount = sub.verifiedLoadedItems?.length || 0;
            const totalItemsCount = sub.items.length;
            const isFullyVerified = verifiedItemsCount === totalItemsCount;
            const isDelivered = sub.status === "DELIVERED";
            const isExpanded = expandedOrders[sub.id] || false;
            const isChecklistOpen = expandedChecklists[sub.id] ?? true;

            // Sequential lock check
            const seqIndexInUndelivered = undeliveredOrders.findIndex((s) => s.id === sub.id);
            const isUnlocked = isDelivered || seqIndexInUndelivered === 0 || seqIndexInUndelivered === -1;

            const currentRank = getStepRank(sub.status);

            return (
              <div
                key={sub.id}
                className={`rounded-3xl bg-white dark:bg-slate-900 border transition-all overflow-hidden shadow-xs hover:shadow-md ${
                  isDelivered
                    ? "border-emerald-200 dark:border-emerald-900/50 bg-emerald-50/10 dark:bg-emerald-950/5"
                    : isFullyVerified
                    ? "border-indigo-300 dark:border-indigo-800 shadow-indigo-500/5"
                    : "border-slate-200 dark:border-slate-800"
                }`}
              >
                
                {/* Mobile-Friendly Banner Card Header */}
                <div
                  onClick={() => toggleOrderExpansion(sub.id)}
                  className="p-4 bg-gradient-to-r from-slate-900 via-slate-800 to-indigo-950 text-white flex flex-col gap-3 cursor-pointer select-none transition-colors hover:bg-slate-850"
                >
                  
                  {/* Top line: Sequence #, Store Name, Status Badge */}
                  <div className="flex items-center justify-between gap-2">
                    
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="w-8 h-8 rounded-xl bg-indigo-500/20 border border-indigo-400/30 flex items-center justify-center font-black text-indigo-300 text-xs shrink-0">
                        #{index + 1}
                      </div>

                      <div className="min-w-0">
                        <h3 className="text-sm sm:text-base font-black tracking-tight text-white truncate flex items-center gap-1.5">
                          {isUnlocked ? (
                            sub.wholesaler.storeName
                          ) : (
                            <>
                              <Lock className="w-3.5 h-3.5 text-amber-400 shrink-0 inline" />
                              <span className="truncate">{sub.wholesaler.storeName} (محطة مقفلة)</span>
                            </>
                          )}
                        </h3>
                        <span className="text-[11px] text-slate-300 font-medium block truncate">
                          {isUnlocked ? sub.wholesaler.ownerName : "🔒 بيانات التاجر مقفلة للتسلسل"}
                        </span>
                      </div>
                    </div>

                    {/* Status Badge */}
                    <div className="shrink-0">
                      {isDelivered ? (
                        <span className="px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 text-[10px] font-black flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                          <span>مسلّمة ✅</span>
                        </span>
                      ) : sub.status === "AWAITING_MERCHANT_CONFIRMATION" ? (
                        <span className="px-2.5 py-1 rounded-full bg-amber-500/20 text-amber-300 border border-amber-400/30 text-[10px] font-black flex items-center gap-1 animate-pulse">
                          <Clock className="w-3 h-3 text-amber-400" />
                          <span>بانتظار التأكيد ⏳</span>
                        </span>
                      ) : sub.status === "ARRIVED_AT_DESTINATION" ? (
                        <span className="px-2.5 py-1 rounded-full bg-purple-500/20 text-purple-300 border border-purple-400/30 text-[10px] font-black flex items-center gap-1 animate-pulse">
                          <MapPin className="w-3 h-3 text-purple-300" />
                          <span>وصلت للموقع 📍</span>
                        </span>
                      ) : sub.status === "OUT_FOR_DELIVERY" ? (
                        <span className="px-2.5 py-1 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-400/30 text-[10px] font-black flex items-center gap-1 animate-pulse">
                          <Truck className="w-3 h-3 text-cyan-300" />
                          <span>في الطريق 🚚</span>
                        </span>
                      ) : sub.status === "LOADED_FROM_FACTORY" ? (
                        <span className="px-2.5 py-1 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-400/30 text-[10px] font-black flex items-center gap-1">
                          <PackageCheck className="w-3 h-3 text-indigo-300" />
                          <span>بالشاحنة 🏭</span>
                        </span>
                      ) : (
                        <span className="px-2.5 py-1 rounded-full bg-slate-500/20 text-slate-300 border border-slate-400/30 text-[10px] font-black flex items-center gap-1">
                          <Boxes className="w-3 h-3 text-indigo-300" />
                          <span>قيد التجهيز 📦</span>
                        </span>
                      )}
                    </div>

                  </div>

                  {/* Bottom Line: Address info, items count, and Price/Expand */}
                  <div className="flex items-center justify-between gap-2 pt-2 border-t border-slate-700/60 text-xs">
                    <div className="flex items-center gap-2 text-[11px] text-slate-300 truncate">
                      <span className="flex items-center gap-1 text-slate-200">
                        <MapPin className="w-3 h-3 text-rose-400 shrink-0" />
                        <span className="truncate">
                          {isUnlocked ? `${sub.wholesaler.city} - ${sub.wholesaler.district}` : "🔒 الموقع مقفل"}
                        </span>
                      </span>
                      <span>•</span>
                      <span className="text-indigo-200 shrink-0">
                        {totalItemsCount} أصناف ({verifiedItemsCount} مفحوصة)
                      </span>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <span className="text-xs font-black text-emerald-400 font-mono">
                        {sub.total.toLocaleString("ar-YE")} ر.ي
                      </span>
                      <div className="p-1 rounded-lg bg-white/10 text-white">
                        {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                      </div>
                    </div>
                  </div>

                </div>

                {/* Expanded Details Section */}
                {isExpanded && (
                  <div className="p-4 sm:p-5 space-y-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/60">
                    
                    {/* Active Destination Live GPS Broadcast Indicator */}
                    {seqIndexInUndelivered === 0 && !isDelivered && (
                      <div className="p-3 rounded-2xl bg-cyan-950/90 text-cyan-200 border border-cyan-500/50 text-xs flex items-center justify-between gap-2 shadow-sm">
                        <div className="flex items-center gap-2">
                          <Radio className="w-4 h-4 text-cyan-400 animate-pulse shrink-0" />
                          <span className="font-extrabold text-[11px] sm:text-xs text-cyan-100">
                            📡 البث الحي لموقع الشاحنة نشط وموجه لـ ({sub.wholesaler.storeName})
                          </span>
                        </div>
                        <span className="px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 font-mono text-[9px] font-black border border-cyan-400/40 shrink-0">
                          GPS ACTIVE 📡
                        </span>
                      </div>
                    )}
                    
                    {/* PRIVACY LOCK NOTICE FOR ORDER #2+ */}
                    {!isUnlocked && !isDelivered && (
                      <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-950 dark:text-amber-200 text-xs space-y-1.5">
                        <div className="flex items-center gap-2 font-black text-xs text-amber-900 dark:text-amber-300">
                          <Lock className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0" />
                          <span>🔒 تسلسل التسليم: محطة التاجر ورقم الهاتف مقفلان مؤقتاً</span>
                        </div>
                        <p className="text-[11px] text-amber-800 dark:text-amber-300 leading-relaxed">
                          يفتح الموقع ورقم الهاتف تلقائياً فور إنجاز وتسليم المحطة الأولى (<strong>{firstActiveOrder?.wholesaler.storeName || "المحطة الأولى"}</strong>).
                        </p>
                      </div>
                    )}

                    {/* Wholesaler Details & Map Actions */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                      
                      {/* Store & Contact Card */}
                      <div className="p-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-2">
                        <div className="font-black text-slate-900 dark:text-white flex items-center justify-between border-b pb-1.5 border-slate-100 dark:border-slate-800 text-xs">
                          <span className="flex items-center gap-1.5">
                            <Building2 className="w-3.5 h-3.5 text-indigo-600" />
                            <span>بيانات التاجر والمحل:</span>
                          </span>
                          <span className="font-mono text-slate-400 text-[10px]">{sub.id}</span>
                        </div>

                        <div className="space-y-1 text-slate-700 dark:text-slate-300 text-[11px]">
                          <div>المتجر: <strong className="text-slate-900 dark:text-white">{isUnlocked ? sub.wholesaler.storeName : "🔒 مقفل"}</strong></div>
                          <div>التاجر: {isUnlocked ? sub.wholesaler.ownerName : "🔒 مقفل"}</div>
                          
                          <div className="flex items-center justify-between pt-1 border-t border-slate-100 dark:border-slate-800">
                            <span className="text-slate-500">الاتصال المباشر:</span>
                            {isUnlocked ? (
                              <a
                                href={`tel:${sub.wholesaler.phone}`}
                                className="px-3 py-1 rounded-lg bg-emerald-600 text-white font-bold font-mono text-xs flex items-center gap-1 hover:bg-emerald-700 transition-colors dir-ltr shadow-xs"
                              >
                                <Phone className="w-3 h-3" />
                                <span>{sub.wholesaler.phone}</span>
                              </a>
                            ) : (
                              <span className="px-2 py-0.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-400 text-[10px] flex items-center gap-1">
                                <Lock className="w-3 h-3 text-amber-500" />
                                <span>مقفل للتسلسل</span>
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Map & Delivery Address Card */}
                      <div className="p-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-2 flex flex-col justify-between">
                        <div>
                          <div className="font-black text-slate-900 dark:text-white flex items-center gap-1.5 border-b pb-1.5 border-slate-100 dark:border-slate-800 text-xs">
                            <MapPin className="w-3.5 h-3.5 text-rose-500" />
                            <span>موقع وعنوان التسليم:</span>
                          </div>

                          <div className="mt-1.5 text-[11px] text-slate-600 dark:text-slate-300 leading-relaxed">
                            {isUnlocked ? (
                              <>
                                <strong className="text-slate-900 dark:text-white block">{sub.wholesaler.city} - {sub.wholesaler.district}</strong>
                                <span className="text-slate-500">{sub.wholesaler.fullAddress}</span>
                              </>
                            ) : (
                              <span className="text-slate-400">موقع الخريطة مقفل حالياً لحين إكمال المحطة السابقة.</span>
                            )}
                          </div>
                        </div>

                        {isUnlocked ? (
                          <button
                            type="button"
                            onClick={() => onOpenMapModal(sub.wholesaler)}
                            className="w-full mt-2 py-2 px-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs transition-colors flex items-center justify-center gap-1.5 shadow-xs cursor-pointer"
                          >
                            <Navigation className="w-3.5 h-3.5" />
                            <span>فتح موقع المحل على الخريطة 🗺️</span>
                          </button>
                        ) : (
                          <button
                            type="button"
                            disabled
                            className="w-full mt-2 py-2 px-3 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-400 font-bold text-xs flex items-center justify-center gap-1 cursor-not-allowed border border-slate-200 dark:border-slate-700"
                          >
                            <Lock className="w-3 h-3 text-amber-500" />
                            <span>رابط الخريطة مقفل 🔒</span>
                          </button>
                        )}
                      </div>

                    </div>

                    {/* Pre-loading Item Verification Checklist */}
                    <div className="rounded-2xl border border-indigo-200 dark:border-indigo-900/60 bg-indigo-50/40 dark:bg-slate-800/80 overflow-hidden">
                      
                      {/* Checklist Header */}
                      <div className="p-3 bg-indigo-900 text-white flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <PackageCheck className="w-4 h-4 text-emerald-400" />
                          <span className="font-extrabold text-xs">
                            فحص ومطابقة أصناف الشحنة ({verifiedItemsCount}/{totalItemsCount})
                          </span>
                        </div>

                        <div className="flex items-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => storeService.markAllSubOrderItemsVerified(sub.id)}
                            className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[10px] transition-colors flex items-center gap-1 shadow-xs cursor-pointer"
                          >
                            <Check className="w-3 h-3" />
                            <span>مطابقة الكل ✅</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => toggleChecklist(sub.id)}
                            className="p-1 text-indigo-200 hover:text-white rounded-lg cursor-pointer"
                          >
                            <RefreshCw className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>

                      {/* Checklist Items List */}
                      {isChecklistOpen && (
                        <div className="p-3 space-y-2">
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                            {sub.items.map((it) => {
                              const isVerified = (sub.verifiedLoadedItems || []).includes(it.product.id);

                              return (
                                <div
                                  key={it.product.id}
                                  className={`p-2.5 rounded-xl border transition-all flex items-center justify-between gap-2 text-xs ${
                                    isVerified
                                      ? "bg-emerald-50/80 dark:bg-emerald-950/40 border-emerald-400/70 dark:border-emerald-800 text-emerald-950 dark:text-emerald-100"
                                      : "bg-rose-50/40 dark:bg-rose-950/20 border-rose-300 dark:border-rose-900/70 text-rose-950 dark:text-rose-100"
                                  }`}
                                >
                                  <div className="flex items-center gap-2.5 min-w-0">
                                    <div
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        setPreviewImageModalItem({
                                          name: it.product.name,
                                          image: it.product.image,
                                          unit: it.product.unit,
                                          quantity: it.quantity,
                                          priceAtOrder: it.priceAtOrder,
                                          isVerified,
                                          subId: sub.id,
                                          productId: it.product.id,
                                        });
                                      }}
                                      className="w-11 h-11 rounded-lg overflow-hidden border border-slate-200 dark:border-slate-700 shrink-0 cursor-pointer bg-white"
                                      title="انقر لتكبير صورة الصنف"
                                    >
                                      <img
                                        src={it.product.image}
                                        alt={it.product.name}
                                        className="w-full h-full object-cover"
                                      />
                                    </div>

                                    <div className="min-w-0">
                                      <div className="font-extrabold text-xs truncate">{it.product.name}</div>
                                      <div className="text-[11px] font-black text-indigo-700 dark:text-indigo-400 mt-0.5">
                                        {it.quantity} {it.product.unit}
                                      </div>
                                    </div>
                                  </div>

                                  <button
                                    type="button"
                                    onClick={() => storeService.toggleSubOrderItemVerification(sub.id, it.product.id)}
                                    className={`p-2 rounded-lg text-xs font-bold shrink-0 transition-all cursor-pointer shadow-xs ${
                                      isVerified
                                        ? "bg-emerald-600 text-white"
                                        : "bg-white dark:bg-slate-800 text-rose-600 border border-rose-300 dark:border-rose-800"
                                    }`}
                                  >
                                    <Check className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      )}

                    </div>

                    {/* Step-by-Step Delivery Action Buttons */}
                    {!isDelivered && (
                      <div className="p-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-3">
                        <div className="flex items-center justify-between border-b pb-2 border-slate-100 dark:border-slate-800">
                          <span className="font-black text-xs text-slate-900 dark:text-white flex items-center gap-1.5">
                            <Truck className="w-4 h-4 text-indigo-600" />
                            <span>مراحل تسليم الشحنة للسائق:</span>
                          </span>
                          <span className="text-[11px] font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950 px-2 py-0.5 rounded-md">
                            مرحلة {currentRank} من 4
                          </span>
                        </div>

                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                          
                          {/* Step 1 */}
                          {currentRank >= 1 ? (
                            <div className="p-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-300 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 text-[11px] font-black flex items-center justify-center gap-1 text-center">
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                              <span>1. حُمّلت بالشاحنة</span>
                            </div>
                          ) : (
                            <button
                              type="button"
                              onClick={() => {
                                storeService.updateSubOrderStatus(
                                  sub.id,
                                  "LOADED_FROM_FACTORY",
                                  sub.assignedDriver,
                                  `تم استلام الطلبية من المصنع وتحميل الأصناف على الشاحنة`
                                );
                              }}
                              className="py-2.5 px-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-[11px] shadow-sm transition-all flex items-center justify-center gap-1 cursor-pointer active:scale-95"
                            >
                              <PackageCheck className="w-3.5 h-3.5" />
                              <span>1. استلام بالمصنع</span>
                            </button>
                          )}

                          {/* Step 2 */}
                          {currentRank >= 2 ? (
                            <div className="p-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-300 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 text-[11px] font-black flex items-center justify-center gap-1 text-center">
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                              <span>2. قيد التوصيل</span>
                            </div>
                          ) : (
                            <button
                              type="button"
                              disabled={currentRank < 1 || !isUnlocked}
                              onClick={() => {
                                storeService.updateSubOrderStatus(
                                  sub.id,
                                  "OUT_FOR_DELIVERY",
                                  sub.assignedDriver,
                                  `انطلق السائق بالشاحنة وهي قيد التوصيل في الطريق`
                                );
                              }}
                              className={`py-2.5 px-2 rounded-xl font-bold text-[11px] shadow-sm transition-all flex items-center justify-center gap-1 ${
                                currentRank >= 1 && isUnlocked
                                  ? "bg-cyan-600 hover:bg-cyan-700 text-white cursor-pointer active:scale-95"
                                  : "bg-slate-100 dark:bg-slate-800 text-slate-400 cursor-not-allowed"
                              }`}
                            >
                              <Truck className="w-3.5 h-3.5" />
                              <span>2. انطلاق للتوصيل</span>
                            </button>
                          )}

                          {/* Step 3 */}
                          {currentRank >= 3 ? (
                            <div className="p-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-300 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 text-[11px] font-black flex items-center justify-center gap-1 text-center">
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                              <span>3. وصلت للمحل</span>
                            </div>
                          ) : (
                            <button
                              type="button"
                              disabled={currentRank < 2 || !isUnlocked}
                              onClick={() => {
                                storeService.updateSubOrderStatus(
                                  sub.id,
                                  "ARRIVED_AT_DESTINATION",
                                  sub.assignedDriver,
                                  `وصل السائق إلى موقع التسليم لمحل التاجر وبدأ تفريغ الحمولة`
                                );
                              }}
                              className={`py-2.5 px-2 rounded-xl font-bold text-[11px] shadow-sm transition-all flex items-center justify-center gap-1 ${
                                currentRank >= 2 && isUnlocked
                                  ? "bg-purple-600 hover:bg-purple-700 text-white cursor-pointer active:scale-95"
                                  : "bg-slate-100 dark:bg-slate-800 text-slate-400 cursor-not-allowed"
                              }`}
                            >
                              <MapPin className="w-3.5 h-3.5" />
                              <span>3. وصلت للمحل</span>
                            </button>
                          )}

                          {/* Step 4 */}
                          {currentRank >= 4 ? (
                            <div className="p-2.5 rounded-xl bg-amber-50 dark:bg-amber-950/50 border border-amber-300 dark:border-amber-800 text-amber-900 dark:text-amber-200 text-[10px] font-black flex items-center justify-center gap-1 text-center">
                              <Clock className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                              <span>4. بانتظار التاجر</span>
                            </div>
                          ) : (
                            <button
                              type="button"
                              disabled={currentRank < 3 || !isUnlocked}
                              onClick={() => {
                                storeService.updateSubOrderStatus(
                                  sub.id,
                                  "AWAITING_MERCHANT_CONFIRMATION",
                                  sub.assignedDriver,
                                  `تم تسليم البضاعة للسائق وبانتظار موافقة التاجر من شاشته`
                                );
                              }}
                              className={`py-2.5 px-2 rounded-xl font-bold text-[11px] shadow-sm transition-all flex items-center justify-center gap-1 ${
                                currentRank >= 3 && isUnlocked
                                  ? "bg-amber-500 hover:bg-amber-600 text-slate-950 font-black cursor-pointer active:scale-95"
                                  : "bg-slate-100 dark:bg-slate-800 text-slate-400 cursor-not-allowed"
                              }`}
                            >
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              <span>4. تم التسليم 📦</span>
                            </button>
                          )}

                        </div>
                      </div>
                    )}

                    {/* Completion Banner */}
                    {isDelivered && (
                      <div className="p-3.5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-xs text-emerald-900 dark:text-emerald-200 space-y-1.5">
                        <div className="flex items-center justify-between font-bold">
                          <div className="flex items-center gap-1.5">
                            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                            <span>تم التسليم بنجاح وإيداع الأصناف بمخزن التاجر ✅</span>
                          </div>
                          <span className="font-mono text-[10px] bg-emerald-200 dark:bg-emerald-900/80 px-2 py-0.5 rounded-full font-black">
                            مكتملة ومسجلة
                          </span>
                        </div>
                      </div>
                    )}

                  </div>
                )}

              </div>
            );
          })}
        </div>
      )}

      {/* =========================================================================
          7. MODALS (الإعدادات وتكبير الصور)
          ========================================================================= */}
      <DriverSettingsModal
        isOpen={isSettingsModalOpen}
        onClose={() => setIsSettingsModalOpen(false)}
        currentAccount={currentDriverAccount}
      />

      {/* Image Preview Modal */}
      {previewImageModalItem && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
          <div className="max-w-xs w-full bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl p-5 relative space-y-3 my-8">
            <button
              type="button"
              onClick={() => setPreviewImageModalItem(null)}
              className="absolute top-3 left-3 p-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-600 dark:text-slate-400 cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="text-center space-y-0.5">
              <span className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-black ${
                previewImageModalItem.isVerified
                  ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300"
                  : "bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300"
              }`}>
                {previewImageModalItem.isVerified ? "صنف محمل بالشاحنة ✅" : "⚠️ صنف غير محمل"}
              </span>
              <h3 className="text-sm font-black text-slate-900 dark:text-white pt-1">
                {previewImageModalItem.name}
              </h3>
            </div>

            <div className="relative rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-700 bg-white aspect-square flex items-center justify-center p-2">
              <img
                src={previewImageModalItem.image}
                alt={previewImageModalItem.name}
                className="max-h-full max-w-full object-contain rounded-lg"
              />
            </div>

            <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 text-xs flex justify-between items-center">
              <span className="font-bold text-slate-600 dark:text-slate-400">الكمية:</span>
              <span className="font-black text-indigo-600 dark:text-indigo-400">
                {previewImageModalItem.quantity} {previewImageModalItem.unit}
              </span>
            </div>

            <button
              type="button"
              onClick={() => {
                storeService.toggleSubOrderItemVerification(
                  previewImageModalItem.subId,
                  previewImageModalItem.productId
                );
                setPreviewImageModalItem((prev) =>
                  prev ? { ...prev, isVerified: !prev.isVerified } : null
                );
              }}
              className={`w-full py-2.5 px-3 rounded-xl font-bold text-xs transition-all cursor-pointer shadow-md flex items-center justify-center gap-1.5 ${
                previewImageModalItem.isVerified
                  ? "bg-rose-500 hover:bg-rose-600 text-white"
                  : "bg-emerald-600 hover:bg-emerald-700 text-white"
              }`}
            >
              <Check className="w-4 h-4" />
              <span>{previewImageModalItem.isVerified ? "تحديد كصنف ناقص ⚠️" : "تأكيد تحميل الصنف ✅"}</span>
            </button>
          </div>
        </div>
      )}

    </div>
  );
};
