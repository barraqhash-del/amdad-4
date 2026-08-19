import React, { useState, useMemo } from "react";
import { SubOrder, WholesalerProfile, OrderStatus } from "../../types";
import { storeService } from "../../services/storeService";
import { StatusBadge } from "../ui/StatusBadge";
import { MapPreviewModal } from "../ui/MapPreviewModal";
import { AssignDriverModal } from "./AssignDriverModal";
import {
  PackageCheck,
  Building2,
  MapPin,
  Phone,
  Truck,
  CheckCircle2,
  Clock,
  Calendar,
  FileText,
  UserCheck,
  Filter,
  Trash2,
  Inbox,
  Layers,
  History,
  LayoutGrid,
  Search,
  ChevronRight,
  ChevronLeft,
  ChevronsRight,
  ChevronsLeft,
  Printer,
  FileSpreadsheet,
  ArrowUpDown,
  Sparkles,
  AlertCircle,
  TrendingUp,
  Receipt,
  Download,
  X,
  Store,
  Boxes,
} from "lucide-react";

interface Props {
  subOrders: SubOrder[];
  factoryName: string;
  onOpenDriversManager?: () => void;
}

export const FactoryOrdersList: React.FC<Props> = ({
  subOrders,
  factoryName,
  onOpenDriversManager,
}) => {
  // Default to 'RECEIVED' (الطلبات الجديدة) as the primary landing page upon clicking incoming orders
  const [selectedFilter, setSelectedFilter] = useState<string>("RECEIVED");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [sortBy, setSortBy] = useState<"NEWEST" | "OLDEST" | "HIGHEST_TOTAL" | "STORE_NAME">("NEWEST");
  
  // Pagination State
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [itemsPerPage, setItemsPerPage] = useState<number>(5);

  // Modals state
  const [activeMapWholesaler, setActiveMapWholesaler] = useState<WholesalerProfile | null>(null);
  const [driverDispatchOrder, setDriverDispatchOrder] = useState<SubOrder | null>(null);
  const [printInvoiceOrder, setPrintInvoiceOrder] = useState<SubOrder | null>(null);

  // Status counts for cards
  const counts = useMemo(() => {
    const received = subOrders.filter((o) => o.status === "RECEIVED").length;
    const processing = subOrders.filter((o) => o.status === "PROCESSING").length;
    const outForDelivery = subOrders.filter((o) => o.status === "OUT_FOR_DELIVERY").length;
    const delivered = subOrders.filter((o) => o.status === "DELIVERED").length;
    const all = subOrders.length;
    return { received, processing, outForDelivery, delivered, all };
  }, [subOrders]);

  // Filtered & Searched Orders
  const filteredOrders = useMemo(() => {
    let list = subOrders.filter((order) => {
      // Filter by Tab/Status
      if (selectedFilter === "RECEIVED") return order.status === "RECEIVED";
      if (selectedFilter === "PROCESSING") return order.status === "PROCESSING";
      if (selectedFilter === "OUT_FOR_DELIVERY") return order.status === "OUT_FOR_DELIVERY";
      if (selectedFilter === "DELIVERED") return order.status === "DELIVERED";
      if (selectedFilter === "ARCHIVE") return order.status === "DELIVERED" || order.status === "CANCELLED";
      return true; // "ALL"
    });

    // Filter by Search Query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      list = list.filter(
        (o) =>
          o.id.toLowerCase().includes(q) ||
          o.wholesaler.storeName.toLowerCase().includes(q) ||
          o.wholesaler.ownerName.toLowerCase().includes(q) ||
          o.wholesaler.phone.toLowerCase().includes(q) ||
          o.wholesaler.city.toLowerCase().includes(q) ||
          o.wholesaler.district.toLowerCase().includes(q) ||
          o.items.some((it) => it.product.name.toLowerCase().includes(q))
      );
    }

    // Sort
    list.sort((a, b) => {
      if (sortBy === "NEWEST") return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      if (sortBy === "OLDEST") return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      if (sortBy === "HIGHEST_TOTAL") return b.total - a.total;
      if (sortBy === "STORE_NAME") return a.wholesaler.storeName.localeCompare(b.wholesaler.storeName, "ar");
      return 0;
    });

    return list;
  }, [subOrders, selectedFilter, searchQuery, sortBy]);

  // Reset pagination when filter or search changes
  const handleSelectFilter = (filterId: string) => {
    setSelectedFilter(filterId);
    setCurrentPage(1);
  };

  const handleSearchChange = (val: string) => {
    setSearchQuery(val);
    setCurrentPage(1);
  };

  // Pagination calculation
  const totalItems = filteredOrders.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / itemsPerPage));
  const validCurrentPage = Math.min(currentPage, totalPages);
  const startIndex = (validCurrentPage - 1) * itemsPerPage;
  const endIndex = Math.min(startIndex + itemsPerPage, totalItems);
  const paginatedOrders = filteredOrders.slice(startIndex, endIndex);

  const handleUpdateStatus = (subOrderId: string, status: OrderStatus, note?: string) => {
    storeService.updateSubOrderStatus(subOrderId, status, undefined, note);
  };

  const handleDeleteSubOrder = (subOrderId: string) => {
    if (confirm(`هل أنت متأكد من إلغاء وحذف الطلبية رقم (${subOrderId}) من سجلاّت المصنع؟`)) {
      storeService.deleteSubOrder(subOrderId);
    }
  };

  // Big Icon Filter Cards configuration
  const filterTabs = [
    {
      id: "RECEIVED",
      label: "الطلبيات الجديدة",
      subLabel: "في انتظار المراجعة والقبول",
      icon: Inbox,
      count: counts.received,
      color: "from-amber-500/20 to-orange-500/10 border-amber-500/50 text-amber-600 dark:text-amber-400",
      activeBg: "bg-gradient-to-br from-amber-500 to-orange-600 text-white shadow-lg shadow-amber-500/25 ring-2 ring-amber-400",
      badgeColor: "bg-amber-100 dark:bg-amber-950 text-amber-900 dark:text-amber-200 border-amber-300 dark:border-amber-800",
      activeBadgeColor: "bg-white/20 text-white border-white/40",
      iconBoxBg: "bg-amber-500 text-white",
      highlightPulse: counts.received > 0,
    },
    {
      id: "PROCESSING",
      label: "قيد التجهيز بالمستودع",
      subLabel: "التعبئة والتحضير للتحميل",
      icon: Layers,
      count: counts.processing,
      color: "from-blue-500/20 to-indigo-500/10 border-blue-500/50 text-blue-600 dark:text-blue-400",
      activeBg: "bg-gradient-to-br from-blue-600 to-indigo-700 text-white shadow-lg shadow-blue-500/25 ring-2 ring-blue-400",
      badgeColor: "bg-blue-100 dark:bg-blue-950 text-blue-900 dark:text-blue-200 border-blue-300 dark:border-blue-800",
      activeBadgeColor: "bg-white/20 text-white border-white/40",
      iconBoxBg: "bg-blue-600 text-white",
      highlightPulse: false,
    },
    {
      id: "OUT_FOR_DELIVERY",
      label: "جاري التوصيل والشحن",
      subLabel: "مع السائق على الطريق للتاجر",
      icon: Truck,
      count: counts.outForDelivery,
      color: "from-indigo-500/20 to-purple-500/10 border-indigo-500/50 text-indigo-600 dark:text-indigo-400",
      activeBg: "bg-gradient-to-br from-indigo-600 to-purple-700 text-white shadow-lg shadow-indigo-500/25 ring-2 ring-indigo-400",
      badgeColor: "bg-indigo-100 dark:bg-indigo-950 text-indigo-900 dark:text-indigo-200 border-indigo-300 dark:border-indigo-800",
      activeBadgeColor: "bg-white/20 text-white border-white/40",
      iconBoxBg: "bg-indigo-600 text-white",
      highlightPulse: counts.outForDelivery > 0,
    },
    {
      id: "DELIVERED",
      label: "المكتملة والمسلّمة",
      subLabel: "تم الاستلام وتفريغ الشحنة",
      icon: CheckCircle2,
      count: counts.delivered,
      color: "from-emerald-500/20 to-teal-500/10 border-emerald-500/50 text-emerald-600 dark:text-emerald-400",
      activeBg: "bg-gradient-to-br from-emerald-600 to-teal-700 text-white shadow-lg shadow-emerald-500/25 ring-2 ring-emerald-400",
      badgeColor: "bg-emerald-100 dark:bg-emerald-950 text-emerald-900 dark:text-emerald-200 border-emerald-300 dark:border-emerald-800",
      activeBadgeColor: "bg-white/20 text-white border-white/40",
      iconBoxBg: "bg-emerald-600 text-white",
      highlightPulse: false,
    },
    {
      id: "ARCHIVE",
      label: "سجل وأرشيف الطلبات",
      subLabel: "سجل المبيعات والتقارير المكتملة",
      icon: History,
      count: counts.delivered,
      color: "from-slate-500/20 to-zinc-500/10 border-slate-500/50 text-slate-700 dark:text-slate-300",
      activeBg: "bg-gradient-to-br from-slate-800 to-slate-950 text-white shadow-lg shadow-slate-900/30 ring-2 ring-slate-600",
      badgeColor: "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-300 dark:border-slate-700",
      activeBadgeColor: "bg-white/20 text-white border-white/40",
      iconBoxBg: "bg-slate-700 text-white",
      highlightPulse: false,
    },
    {
      id: "ALL",
      label: "جميع الطلبيات",
      subLabel: "كافة الحالات المتاحة",
      icon: LayoutGrid,
      count: counts.all,
      color: "from-slate-500/20 to-slate-500/10 border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300",
      activeBg: "bg-gradient-to-br from-slate-900 to-indigo-950 text-white shadow-lg shadow-slate-950/30 ring-2 ring-indigo-500",
      badgeColor: "bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 border-slate-300 dark:border-slate-700",
      activeBadgeColor: "bg-white/20 text-white border-white/40",
      iconBoxBg: "bg-slate-800 text-white",
      highlightPulse: false,
    },
  ];

  return (
    <div className="space-y-6 dir-rtl">
      
      {/* =========================================================================
          1. BIG ICON CATEGORY NAVIGATION CARDS (المربعات والأيقونات الكبيرة الفاخرة)
          ========================================================================= */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3.5">
        {filterTabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = selectedFilter === tab.id;

          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => handleSelectFilter(tab.id)}
              className={`p-4 rounded-2xl border text-right transition-all duration-200 cursor-pointer flex flex-col justify-between gap-3 relative overflow-hidden group ${
                isActive
                  ? `${tab.activeBg} border-transparent scale-[1.02]`
                  : `bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 hover:shadow-md hover:-translate-y-0.5`
              }`}
            >
              {/* Header inside Card: Big Icon Box + Count Badge */}
              <div className="flex items-center justify-between w-full">
                <div
                  className={`w-12 h-12 rounded-xl flex items-center justify-center transition-transform group-hover:scale-110 shadow-xs ${
                    isActive
                      ? "bg-white/20 text-white"
                      : tab.iconBoxBg
                  }`}
                >
                  <Icon
                    className={`w-6 h-6 ${
                      tab.id === "OUT_FOR_DELIVERY" && counts.outForDelivery > 0
                        ? "animate-truck-hop"
                        : ""
                    }`}
                  />
                </div>

                <div className="flex items-center gap-1.5">
                  {tab.highlightPulse && !isActive && (
                    <span className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-ping inline-block" />
                  )}
                  <span
                    className={`px-2.5 py-1 rounded-lg text-xs font-black border font-mono ${
                      isActive ? tab.activeBadgeColor : tab.badgeColor
                    }`}
                  >
                    {tab.count}
                  </span>
                </div>
              </div>

              {/* Title & SubLabel */}
              <div>
                <h4
                  className={`font-black text-sm transition-colors ${
                    isActive ? "text-white" : "text-slate-900 dark:text-white"
                  }`}
                >
                  {tab.label}
                </h4>
                <p
                  className={`text-[11px] font-medium line-clamp-1 mt-0.5 ${
                    isActive ? "text-white/80" : "text-slate-500 dark:text-slate-400"
                  }`}
                >
                  {tab.subLabel}
                </p>
              </div>

              {/* Active Indicator Bar */}
              {isActive && (
                <div className="absolute bottom-0 inset-x-0 h-1 bg-white/60 rounded-full" />
              )}
            </button>
          );
        })}
      </div>

      {/* =========================================================================
          2. SEARCH, SORT & CONTROLS TOOLBAR
          ========================================================================= */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
        
        {/* Search Box */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute right-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => handleSearchChange(e.target.value)}
            placeholder="بحث برقم الطلبية، اسم التاجر، المحل، المدينة، أو الصنف..."
            className="w-full pr-10 pl-9 py-2.5 rounded-xl text-xs font-medium bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => handleSearchChange("")}
              className="absolute left-3 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-600 rounded-full cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Sort & Pagination per page selector */}
        <div className="flex items-center gap-2.5 overflow-x-auto pb-1 md:pb-0">
          
          {/* Sorting */}
          <div className="flex items-center gap-1.5 bg-slate-50 dark:bg-slate-800/80 px-2.5 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs">
            <ArrowUpDown className="w-3.5 h-3.5 text-slate-400" />
            <span className="text-slate-500 font-bold hidden sm:inline">الترتيب:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="bg-transparent text-slate-800 dark:text-slate-200 font-bold text-xs focus:outline-none cursor-pointer"
            >
              <option value="NEWEST" className="dark:bg-slate-900">الأحدث أولاً</option>
              <option value="OLDEST" className="dark:bg-slate-900">الأقدم أولاً</option>
              <option value="HIGHEST_TOTAL" className="dark:bg-slate-900">الأعلى قيمة</option>
              <option value="STORE_NAME" className="dark:bg-slate-900">اسم المتجر (أ-ي)</option>
            </select>
          </div>

          {/* Items Per Page */}
          <div className="flex items-center gap-1.5 bg-slate-50 dark:bg-slate-800/80 px-2.5 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs">
            <span className="text-slate-500 font-bold">عرض:</span>
            <select
              value={itemsPerPage}
              onChange={(e) => {
                setItemsPerPage(Number(e.target.value));
                setCurrentPage(1);
              }}
              className="bg-transparent text-slate-800 dark:text-slate-200 font-bold text-xs focus:outline-none cursor-pointer"
            >
              <option value={5} className="dark:bg-slate-900">5 طلبات</option>
              <option value={10} className="dark:bg-slate-900">10 طلبات</option>
              <option value={20} className="dark:bg-slate-900">20 طلبية</option>
              <option value={50} className="dark:bg-slate-900">50 طلبية</option>
            </select>
          </div>

          {/* Active Filter Label */}
          <div className="px-3 py-1.5 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-800 text-indigo-800 dark:text-indigo-300 font-black text-xs shrink-0">
            {filteredOrders.length} نتيجة
          </div>

        </div>
      </div>

      {/* =========================================================================
          3. ORDERS LIST BODY (WITH PAGES / PAGINATION)
          ========================================================================= */}
      {filteredOrders.length === 0 ? (
        <div className="p-12 text-center bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 space-y-4 shadow-xs">
          <div className="w-16 h-16 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-400 flex items-center justify-center mx-auto">
            <Inbox className="w-8 h-8" />
          </div>
          <div>
            <h3 className="font-extrabold text-slate-800 dark:text-white text-base">
              {selectedFilter === "RECEIVED"
                ? "لا توجد طلبيات جديدة واردة حالياً"
                : "لا توجد طلبيات مطابقة لهذا البحث أو الفلتر"}
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 max-w-md mx-auto mt-1 leading-relaxed">
              {selectedFilter === "RECEIVED"
                ? "عندما يقوم تجار الجملة بإرسال طلبات جديدة لمصنعك ستظهر هنا فوراً للإشعار والقبول والتجهيز."
                : "جرب تغيير كلمات البحث أو اختر تبويب 'جميع الطلبيات' أو 'سجل وأرشيف الطلبات'."}
            </p>
          </div>

          <div className="flex items-center justify-center gap-3 pt-2">
            {selectedFilter !== "ALL" && (
              <button
                type="button"
                onClick={() => handleSelectFilter("ALL")}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-xs transition-colors cursor-pointer"
              >
                عرض جميع الطلبيات ({counts.all})
              </button>
            )}
            {selectedFilter !== "ARCHIVE" && counts.delivered > 0 && (
              <button
                type="button"
                onClick={() => handleSelectFilter("ARCHIVE")}
                className="px-4 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-bold text-xs rounded-xl border border-slate-200 dark:border-slate-700 transition-colors cursor-pointer"
              >
                سجل الطلبات المكتملة ({counts.delivered})
              </button>
            )}
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          
          {/* Order Cards */}
          {paginatedOrders.map((order) => (
            <div
              key={order.id}
              className="rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 sm:p-6 shadow-xs hover:shadow-md transition-all space-y-5"
            >
              {/* Top Banner */}
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-4">
                <div className="flex items-start sm:items-center gap-3.5">
                  <div className="p-3 bg-indigo-50 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300 rounded-2xl font-mono font-black text-sm border border-indigo-100 dark:border-indigo-900 shrink-0">
                    {order.id}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-extrabold text-slate-900 dark:text-white text-base">
                        {order.wholesaler.storeName}
                      </h3>
                      <span className="text-xs text-slate-400 font-normal hidden sm:inline">
                        ({order.wholesaler.ownerName})
                      </span>
                    </div>
                    <div className="flex flex-wrap items-center gap-2.5 text-xs text-slate-500 mt-1">
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5 text-slate-400" />
                        {order.wholesaler.city} - {order.wholesaler.district}
                      </span>
                      <span>•</span>
                      <span className="flex items-center gap-1 font-mono text-[11px]">
                        <Clock className="w-3.5 h-3.5 text-slate-400" />
                        {new Date(order.createdAt).toLocaleString("ar-YE")}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-2.5">
                  {order.assignedDriver && (
                    <div className="px-3 py-1.5 rounded-xl bg-indigo-50 dark:bg-indigo-950/80 border border-indigo-200 dark:border-indigo-800 text-indigo-900 dark:text-indigo-200 text-xs font-bold flex items-center gap-1.5">
                      <Truck className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                      <span>السائق: {order.assignedDriver.name}</span>
                    </div>
                  )}

                  <StatusBadge status={order.status} size="md" />

                  {/* Print Waybill / Invoice Button */}
                  <button
                    type="button"
                    onClick={() => setPrintInvoiceOrder(order)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-bold transition-colors cursor-pointer border border-slate-200 dark:border-slate-700"
                    title="طباعة فاتورة وسند تسليم الشحنة"
                  >
                    <Printer className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
                    <span className="hidden sm:inline">سند/فاتورة</span>
                  </button>

                  {/* Map Pin Button */}
                  <button
                    type="button"
                    onClick={() => setActiveMapWholesaler(order.wholesaler)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-950/60 dark:hover:bg-emerald-900 text-emerald-800 dark:text-emerald-300 text-xs font-bold transition-colors cursor-pointer border border-emerald-200 dark:border-emerald-800"
                    title="معاينة موقع المحل والتوصيل على الخريطة"
                  >
                    <MapPin className="w-3.5 h-3.5 text-emerald-600" />
                    <span>الخريطة</span>
                  </button>
                </div>
              </div>

              {/* Order Content Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
                
                {/* Left: Store & Address Info */}
                <div className="lg:col-span-4 p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/60 space-y-2.5 text-xs">
                  <div className="flex items-center gap-2 font-bold text-slate-900 dark:text-white">
                    <Building2 className="w-4 h-4 text-indigo-600" />
                    <span>تفاصيل التاجر والموقع:</span>
                  </div>
                  <p className="text-slate-700 dark:text-slate-300">
                    <strong>التاجر:</strong> {order.wholesaler.ownerName} ({order.wholesaler.storeName})
                  </p>
                  <p className="text-slate-700 dark:text-slate-300">
                    <strong>العنوان:</strong> {order.wholesaler.city} - {order.wholesaler.district}
                  </p>
                  <p className="text-slate-600 dark:text-slate-400 leading-relaxed text-[11px]">
                    {order.wholesaler.fullAddress}
                  </p>
                  <div className="flex items-center gap-2 pt-1 border-t border-slate-200/60 dark:border-slate-700/60">
                    <Phone className="w-3.5 h-3.5 text-emerald-600" />
                    <a
                      href={`tel:${order.wholesaler.phone}`}
                      className="font-bold text-indigo-600 dark:text-indigo-400 hover:underline dir-ltr font-mono"
                    >
                      {order.wholesaler.phone}
                    </a>
                  </div>
                  {order.deliveryNotes && (
                    <div className="p-2.5 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-amber-800 dark:text-amber-300 text-[11px] leading-relaxed">
                      <strong>ملاحظة التوصيل:</strong> {order.deliveryNotes}
                    </div>
                  )}
                </div>

                {/* Right: Items Table & Status Actions */}
                <div className="lg:col-span-8 space-y-4">
                  <div className="overflow-x-auto rounded-xl border border-slate-100 dark:border-slate-800">
                    <table className="w-full text-xs text-right border-collapse">
                      <thead>
                        <tr className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 text-slate-500 font-bold">
                          <th className="py-2.5 px-3">المنتج والمواصفات</th>
                          <th className="py-2.5 px-3 text-center">الوحدة</th>
                          <th className="py-2.5 px-3 text-center">الكمية</th>
                          <th className="py-2.5 px-3 text-left">السعر الفرعي</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                        {order.items.map((item, idx) => (
                          <tr key={idx} className="text-slate-800 dark:text-slate-200 font-medium hover:bg-slate-50/50 dark:hover:bg-slate-800/30">
                            <td className="py-2.5 px-3 flex items-center gap-2.5">
                              <img
                                src={item.product.image}
                                alt=""
                                className="w-9 h-9 rounded-lg object-cover border border-slate-200 dark:border-slate-700 shrink-0"
                              />
                              <div>
                                <div className="font-bold text-slate-900 dark:text-white">{item.product.name}</div>
                                <div className="text-[10px] text-slate-400 font-mono">{item.priceAtOrder.toLocaleString("ar-YE")} ر.ي / {item.product.unit}</div>
                              </div>
                            </td>
                            <td className="py-2.5 px-3 text-center text-slate-500 font-medium">{item.product.unit}</td>
                            <td className="py-2.5 px-3 text-center font-black text-indigo-700 dark:text-indigo-400 bg-indigo-50/50 dark:bg-indigo-950/30 rounded font-mono">
                              {item.quantity}
                            </td>
                            <td className="py-2.5 px-3 text-left font-black font-mono text-slate-900 dark:text-white">
                              {(item.priceAtOrder * item.quantity).toLocaleString("ar-YE")} ر.ي
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* Summary Footer & Action Buttons */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-3 border-t border-slate-100 dark:border-slate-800">
                    <div className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-2">
                      <span>إجمالي طلبية المصنع:</span>
                      <span className="text-emerald-700 dark:text-emerald-400 text-base font-black font-mono">
                        {order.total.toLocaleString("ar-YE")} ر.ي
                      </span>
                    </div>

                    {/* Action Flow */}
                    <div className="flex flex-wrap items-center gap-2">
                      
                      {order.status === "RECEIVED" && (
                        <>
                          <button
                            type="button"
                            onClick={() =>
                              handleUpdateStatus(
                                order.id,
                                "PROCESSING",
                                "تم قبول الطلبية وبدء التعبئة والتجهيز في مستودع المصنع"
                              )
                            }
                            className="px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-black text-xs shadow-md transition-all flex items-center gap-1.5 cursor-pointer active:scale-95"
                          >
                            <PackageCheck className="w-4 h-4" />
                            <span>قبول وبدء تجهيز الشحنة ⚡</span>
                          </button>
                          
                          <button
                            type="button"
                            onClick={() => setDriverDispatchOrder(order)}
                            className="px-3.5 py-2.5 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-700 dark:bg-indigo-950 dark:hover:bg-indigo-900 dark:text-indigo-300 font-bold text-xs border border-indigo-200 dark:border-indigo-800 transition-colors flex items-center gap-1.5 cursor-pointer"
                          >
                            <Truck className="w-4 h-4 text-indigo-600" />
                            <span>تعيين السائق مبكراً 🚚</span>
                          </button>
                        </>
                      )}

                      {order.status === "PROCESSING" && (
                        <>
                          <button
                            type="button"
                            onClick={() => setDriverDispatchOrder(order)}
                            className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-md transition-all flex items-center gap-1.5 cursor-pointer"
                          >
                            <Truck className="w-4 h-4" />
                            <span>{order.assignedDriver ? "تعديل بيانات السائق 🚚" : "اختيار وتعيين السائق 🚚"}</span>
                          </button>
                          
                          <button
                            type="button"
                            onClick={() =>
                              handleUpdateStatus(
                                order.id,
                                "OUT_FOR_DELIVERY",
                                "تم إكمال تجهيز الشحنة وانطلاق الشاحنة للتوصيل للمتجر"
                              )
                            }
                            className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md transition-all flex items-center gap-1.5 cursor-pointer"
                          >
                            <PackageCheck className="w-4 h-4" />
                            <span>انطلاق الشحنة (قيد التوصيل) 🚚</span>
                          </button>
                        </>
                      )}

                      {order.status === "OUT_FOR_DELIVERY" && (
                        <>
                          <button
                            type="button"
                            onClick={() => setDriverDispatchOrder(order)}
                            className="px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold text-xs transition-colors flex items-center gap-1 cursor-pointer"
                          >
                            <Truck className="w-3.5 h-3.5" />
                            <span>بيانات السائق</span>
                          </button>

                          <button
                            type="button"
                            onClick={() =>
                              handleUpdateStatus(
                                order.id,
                                "DELIVERED",
                                "تم تأكيد استلام الشحنة وتفريغ الكراتين بنجاح لدى متجر التاجر"
                              )
                            }
                            className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md transition-all flex items-center gap-1.5 cursor-pointer"
                          >
                            <CheckCircle2 className="w-4 h-4" />
                            <span>تأكيد التسليم المباشر (مكتملة) ✅</span>
                          </button>
                        </>
                      )}

                      {order.status === "DELIVERED" && (
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/80 px-3 py-2 rounded-xl border border-emerald-200 dark:border-emerald-800 flex items-center gap-1.5">
                            <CheckCircle2 className="w-4 h-4" />
                            <span>تم التسليم ومسجلة بالأرشيف ✅</span>
                          </span>

                          <button
                            type="button"
                            onClick={() => setPrintInvoiceOrder(order)}
                            className="px-3 py-2 rounded-xl bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 font-bold text-xs border border-indigo-200 dark:border-indigo-800 hover:bg-indigo-100 transition-colors flex items-center gap-1 cursor-pointer"
                          >
                            <Printer className="w-3.5 h-3.5" />
                            <span>طباعة السند</span>
                          </button>
                        </div>
                      )}

                      <button
                        type="button"
                        onClick={() => handleDeleteSubOrder(order.id)}
                        className="p-2.5 rounded-xl bg-slate-100 hover:bg-rose-50 text-slate-400 hover:text-rose-600 dark:bg-slate-800 dark:hover:bg-rose-950/50 transition-colors cursor-pointer"
                        title="حذف / إلغاء الطلبية الفرعية"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>

                    </div>
                  </div>

                  {/* Lifecycle History Log */}
                  {order.history && order.history.length > 0 && (
                    <div className="mt-3 p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 space-y-2 text-xs">
                      <div className="font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5 text-indigo-500" />
                        <span>سجل ومراحل معالجة الطلبية:</span>
                      </div>
                      <div className="space-y-1.5">
                        {order.history.map((h, i) => (
                          <div key={i} className="flex items-start justify-between text-[11px] text-slate-600 dark:text-slate-400 border-r-2 border-indigo-500 pr-2.5">
                            <div>
                              <span className="font-bold text-slate-800 dark:text-slate-200">{h.note}</span>
                              {h.updatedBy && <span className="text-slate-400 mr-2"> (بواسطة: {h.updatedBy})</span>}
                            </div>
                            <span className="font-mono text-slate-400 text-[10px] shrink-0">{h.timestamp}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                </div>

              </div>
            </div>
          ))}

          {/* =========================================================================
              4. PAGINATION FOOTER (أزرار الصفحات والتحكم في التنقل)
              ========================================================================= */}
          {totalPages > 1 && (
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs mt-6">
              
              <div className="text-xs text-slate-500 font-bold">
                عرض <span className="text-slate-900 dark:text-white">{startIndex + 1}</span> إلى{" "}
                <span className="text-slate-900 dark:text-white">{endIndex}</span> من أصل{" "}
                <span className="text-indigo-600 dark:text-indigo-400 font-black">{totalItems}</span> طلبية
              </div>

              {/* Page Number Buttons */}
              <div className="flex items-center gap-1.5">
                
                {/* First Page */}
                <button
                  type="button"
                  onClick={() => setCurrentPage(1)}
                  disabled={validCurrentPage === 1}
                  className="p-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-100 transition-colors cursor-pointer"
                  title="الصفحة الأولى"
                >
                  <ChevronsRight className="w-4 h-4" />
                </button>

                {/* Prev */}
                <button
                  type="button"
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={validCurrentPage === 1}
                  className="p-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-100 transition-colors cursor-pointer"
                  title="الصفحة السابقة"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>

                {/* Pages numbers */}
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => {
                  // Only show a window of pages around current page
                  if (
                    totalPages > 7 &&
                    Math.abs(pageNum - validCurrentPage) > 2 &&
                    pageNum !== 1 &&
                    pageNum !== totalPages
                  ) {
                    if (pageNum === 2 || pageNum === totalPages - 1) {
                      return <span key={pageNum} className="px-1 text-slate-400 text-xs">...</span>;
                    }
                    return null;
                  }

                  const isCurrent = pageNum === validCurrentPage;

                  return (
                    <button
                      key={pageNum}
                      type="button"
                      onClick={() => setCurrentPage(pageNum)}
                      className={`min-w-[36px] h-9 px-2 rounded-xl font-bold text-xs transition-all cursor-pointer ${
                        isCurrent
                          ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/30 scale-105"
                          : "bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700"
                      }`}
                    >
                      {pageNum}
                    </button>
                  );
                })}

                {/* Next */}
                <button
                  type="button"
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  disabled={validCurrentPage === totalPages}
                  className="p-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-100 transition-colors cursor-pointer"
                  title="الصفحة التالية"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>

                {/* Last Page */}
                <button
                  type="button"
                  onClick={() => setCurrentPage(totalPages)}
                  disabled={validCurrentPage === totalPages}
                  className="p-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-100 transition-colors cursor-pointer"
                  title="الصفحة الأخيرة"
                >
                  <ChevronsLeft className="w-4 h-4" />
                </button>

              </div>
            </div>
          )}

        </div>
      )}

      {/* =========================================================================
          5. PRINT INVOICE & DELIVERY RECEIPT MODAL
          ========================================================================= */}
      {printInvoiceOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 max-w-2xl w-full p-6 space-y-5 shadow-2xl max-h-[90vh] overflow-y-auto dir-rtl">
            
            {/* Header */}
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-4">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-indigo-600 text-white rounded-2xl">
                  <Receipt className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-black text-lg text-slate-900 dark:text-white">
                    سند تسليم وفاتورة شحنة مصنع
                  </h3>
                  <p className="text-xs text-slate-500 font-mono">
                    رقم الطلبية: {printInvoiceOrder.id}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setPrintInvoiceOrder(null)}
                className="p-2 text-slate-400 hover:text-slate-600 rounded-xl cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Printable Slip Content */}
            <div className="p-5 rounded-2xl border-2 border-dashed border-slate-300 dark:border-slate-700 bg-slate-50/60 dark:bg-slate-800/30 space-y-4">
              
              {/* Factory & Wholesaler Info */}
              <div className="grid grid-cols-2 gap-4 pb-4 border-b border-slate-200 dark:border-slate-700 text-xs">
                <div>
                  <div className="font-bold text-slate-500">جهة الإصدار (المصنع):</div>
                  <div className="font-black text-sm text-slate-900 dark:text-white mt-0.5">{factoryName}</div>
                  <div className="text-slate-500 mt-1">تاريخ السند: {new Date(printInvoiceOrder.createdAt).toLocaleDateString("ar-YE")}</div>
                </div>

                <div>
                  <div className="font-bold text-slate-500">العميل المستلم (التاجر):</div>
                  <div className="font-black text-sm text-slate-900 dark:text-white mt-0.5">{printInvoiceOrder.wholesaler.storeName}</div>
                  <div className="text-slate-500 mt-1">{printInvoiceOrder.wholesaler.city} - {printInvoiceOrder.wholesaler.phone}</div>
                </div>
              </div>

              {/* Items List */}
              <div className="space-y-2">
                <div className="font-bold text-xs text-slate-700 dark:text-slate-300">قائمة الأصناف المحملة:</div>
                <div className="divide-y divide-slate-200 dark:divide-slate-700 text-xs">
                  {printInvoiceOrder.items.map((it, idx) => (
                    <div key={idx} className="py-2 flex items-center justify-between">
                      <div className="font-medium text-slate-900 dark:text-white">
                        {it.product.name} ({it.quantity} {it.product.unit})
                      </div>
                      <div className="font-mono font-bold">
                        {(it.priceAtOrder * it.quantity).toLocaleString("ar-YE")} ر.ي
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Total & Driver */}
              <div className="pt-3 border-t border-slate-200 dark:border-slate-700 flex items-center justify-between text-xs">
                <div>
                  {printInvoiceOrder.assignedDriver ? (
                    <span className="text-slate-600 dark:text-slate-400">
                      السائق المكلف: <strong>{printInvoiceOrder.assignedDriver.name}</strong> ({printInvoiceOrder.assignedDriver.phone})
                    </span>
                  ) : (
                    <span className="text-slate-400">لم يتم تعيين سائق بعد</span>
                  )}
                </div>
                <div className="text-base font-black text-emerald-600 dark:text-emerald-400 font-mono">
                  الإجمالي: {printInvoiceOrder.total.toLocaleString("ar-YE")} ر.ي
                </div>
              </div>

              {/* Signatures */}
              <div className="grid grid-cols-2 gap-4 pt-6 border-t border-slate-200 dark:border-slate-700 text-[11px] text-slate-500">
                <div className="border-t border-slate-400 pt-2 text-center">توقيع وختم المصنع</div>
                <div className="border-t border-slate-400 pt-2 text-center">توقيع المستلم (التاجر)</div>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="flex items-center justify-between gap-3 pt-2">
              <button
                type="button"
                onClick={() => setPrintInvoiceOrder(null)}
                className="px-4 py-2.5 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold text-xs rounded-xl hover:bg-slate-200 transition-colors cursor-pointer"
              >
                إغلاق
              </button>

              <button
                type="button"
                onClick={() => {
                  window.print();
                }}
                className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-md transition-colors flex items-center gap-2 cursor-pointer"
              >
                <Printer className="w-4 h-4" />
                <span>طباعة السند فوراً</span>
              </button>
            </div>

          </div>
        </div>
      )}

      {/* Map Modal */}
      {activeMapWholesaler && (
        <MapPreviewModal
          isOpen={!!activeMapWholesaler}
          onClose={() => setActiveMapWholesaler(null)}
          wholesaler={activeMapWholesaler}
        />
      )}

      {/* Assign Driver Modal */}
      {driverDispatchOrder && (
        <AssignDriverModal
          isOpen={!!driverDispatchOrder}
          onClose={() => setDriverDispatchOrder(null)}
          subOrder={driverDispatchOrder}
          onOpenDriverRosterManager={onOpenDriversManager}
        />
      )}
    </div>
  );
};
