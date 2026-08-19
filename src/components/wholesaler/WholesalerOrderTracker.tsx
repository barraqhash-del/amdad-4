import React, { useState } from "react";
import { MainOrder, SubOrder, OrderStatus } from "../../types";
import { storeService } from "../../services/storeService";
import { StatusBadge } from "../ui/StatusBadge";
import {
  Package,
  Building2,
  Clock,
  Truck,
  Phone,
  CheckCircle2,
  MapPin,
  ChevronDown,
  ChevronUp,
  Printer,
  FileText,
  Calendar,
  AlertCircle,
  ExternalLink,
  Trash2,
  X,
  HelpCircle,
  Lock,
  PackageCheck,
  Radio,
  ShieldCheck,
  Eye,
  EyeOff,
  History,
  Sparkles,
  Archive,
} from "lucide-react";
import { LiveTruckTrackingModal } from "../ui/LiveTruckTrackingModal";

interface Props {
  mainOrders: MainOrder[];
  onOpenMapModal: () => void;
  onOpenCatalog?: () => void;
  initialTab?: "NEW_ACTIVE" | "HISTORY" | "ALL";
}

export const WholesalerOrderTracker: React.FC<Props> = ({
  mainOrders,
  onOpenMapModal,
  onOpenCatalog,
  initialTab = "NEW_ACTIVE",
}) => {
  const merchantWarehouses = storeService.getMerchantWarehouses();
  const [subOrderWarehouseMap, setSubOrderWarehouseMap] = useState<Record<string, string>>({});
  const [activeLiveTrackingSubOrder, setActiveLiveTrackingSubOrder] = useState<SubOrder | null>(null);
  const [expandedOrders, setExpandedOrders] = useState<Record<string, boolean>>({
    [mainOrders[0]?.id]: true,
  });

  // Tab filter: NEW_ACTIVE (default), HISTORY, ALL
  const [trackerTab, setTrackerTab] = useState<"NEW_ACTIVE" | "HISTORY" | "ALL">(initialTab);

  React.useEffect(() => {
    setTrackerTab(initialTab);
  }, [initialTab]);

  // Modals for batch deletion
  const [showDeleteAllModal, setShowDeleteAllModal] = useState(false);
  const [showDeleteHistoryModal, setShowDeleteHistoryModal] = useState(false);

  // Printing & Printer selection state
  const [selectedInvoiceOrder, setSelectedInvoiceOrder] = useState<MainOrder | null>(null);
  const [selectedPaperFormat, setSelectedPaperFormat] = useState<"A4" | "THERMAL_80MM" | "THERMAL_58MM">("A4");
  const [selectedPrinterType, setSelectedPrinterType] = useState<"SYSTEM_DEFAULT" | "POS_THERMAL_USB" | "POS_BLUETOOTH" | "NETWORK_PRINTER">("SYSTEM_DEFAULT");
  const [showPrinterGuide, setShowPrinterGuide] = useState(false);

  // Derive Active Orders vs History Orders
  const activeOrders = mainOrders.filter((main) =>
    main.subOrders.some((so) => so.status !== "DELIVERED" && so.status !== "CANCELLED")
  );

  const historyOrders = mainOrders.filter(
    (main) =>
      main.subOrders.length > 0 &&
      main.subOrders.every((so) => so.status === "DELIVERED" || so.status === "CANCELLED")
  );

  const displayedOrders =
    trackerTab === "NEW_ACTIVE"
      ? activeOrders
      : trackerTab === "HISTORY"
      ? historyOrders
      : mainOrders;

  const toggleExpand = (id: string) => {
    setExpandedOrders((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const handlePrintInvoice = (order: MainOrder) => {
    setSelectedInvoiceOrder(order);
  };

  const handleDeleteMainOrder = (orderId: string) => {
    if (confirm(`هل أنت تأكد من رغبتك في حذف الطلب الموحد (${orderId}) بكامل شحناته من السجلات؟`)) {
      storeService.deleteMainOrder(orderId);
    }
  };

  const handleConfirmDeleteAll = () => {
    storeService.deleteAllOrders();
    setShowDeleteAllModal(false);
  };

  const handleConfirmDeleteHistory = () => {
    storeService.deleteCompletedOrders();
    setShowDeleteHistoryModal(false);
  };

  const getDriverQueueInfo = (sub: SubOrder) => {
    if (!sub.assignedDriver) return null;
    const allMains = storeService.getMainOrders();
    const activeDriverSubOrders: SubOrder[] = [];
    allMains.forEach((m) => {
      m.subOrders.forEach((so) => {
        if (
          so.assignedDriver &&
          so.assignedDriver.name === sub.assignedDriver?.name &&
          so.status !== "DELIVERED" &&
          so.status !== "CANCELLED"
        ) {
          activeDriverSubOrders.push(so);
        }
      });
    });

    const index = activeDriverSubOrders.findIndex((so) => so.id === sub.id);
    if (index === -1) return null;
    return {
      position: index + 1,
      totalInBatch: activeDriverSubOrders.length,
      isActiveDestination: index === 0,
    };
  };

  const handleDeleteSubOrder = (subId: string) => {
    if (confirm(`هل أنت تأكد من رغبتك في حذف طلب الشحنة الفرعية (${subId})؟`)) {
      storeService.deleteSubOrder(subId);
    }
  };

  return (
    <div className="space-y-6 dir-rtl">
      
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
        <div>
          <h2 className="text-xl font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
            <Package className="w-6 h-6 text-emerald-600" />
            <span>نظام تتبع ورصد الطلبيات الشامل</span>
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            متابعة الطلبيات الجديدة، وسجل الطلبات الأرشيفية المكتملة مع إمكانية إدارة الفواتير والمسح الشامل
          </p>
        </div>

        <button
          onClick={onOpenMapModal}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 text-slate-800 dark:text-slate-200 text-xs font-bold transition-colors"
        >
          <MapPin className="w-4 h-4 text-emerald-600" />
          <span>تغيير موقع التوصيل على الخريطة</span>
        </button>
      </div>

      {/* Tabs Filter & Action Toolbar */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-4 sm:p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
        {/* Category Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 lg:pb-0">
          <button
            onClick={() => setTrackerTab("NEW_ACTIVE")}
            className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-extrabold flex items-center gap-2 transition-all whitespace-nowrap ${
              trackerTab === "NEW_ACTIVE"
                ? "bg-emerald-600 text-white shadow-md shadow-emerald-600/20"
                : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700"
            }`}
          >
            <PackageCheck className="w-4 h-4" />
            <span>الطلبيات الجديدة والجارية (الرئيسية)</span>
            <span className={`px-2 py-0.5 rounded-full text-[11px] font-mono ${
              trackerTab === "NEW_ACTIVE"
                ? "bg-emerald-800 text-white"
                : "bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300"
            }`}>
              {activeOrders.length}
            </span>
          </button>

          <button
            onClick={() => setTrackerTab("HISTORY")}
            className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-extrabold flex items-center gap-2 transition-all whitespace-nowrap ${
              trackerTab === "HISTORY"
                ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/20"
                : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700"
            }`}
          >
            <History className="w-4 h-4" />
            <span>سجل الطلبات الأرشيفية</span>
            <span className={`px-2 py-0.5 rounded-full text-[11px] font-mono ${
              trackerTab === "HISTORY"
                ? "bg-indigo-800 text-white"
                : "bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300"
            }`}>
              {historyOrders.length}
            </span>
          </button>

          <button
            onClick={() => setTrackerTab("ALL")}
            className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-extrabold flex items-center gap-2 transition-all whitespace-nowrap ${
              trackerTab === "ALL"
                ? "bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 shadow-md"
                : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700"
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>جميع الطلبيات الشاملة</span>
            <span className={`px-2 py-0.5 rounded-full text-[11px] font-mono ${
              trackerTab === "ALL"
                ? "bg-slate-700 text-white dark:bg-slate-300 dark:text-slate-900"
                : "bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300"
            }`}>
              {mainOrders.length}
            </span>
          </button>
        </div>

        {/* Global Action Controls */}
        <div className="flex items-center gap-2 flex-wrap">
          {historyOrders.length > 0 && trackerTab === "HISTORY" && (
            <button
              onClick={() => setShowDeleteHistoryModal(true)}
              className="px-3.5 py-2 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-amber-800 dark:text-amber-300 hover:bg-amber-100 text-xs font-bold transition-colors flex items-center gap-1.5 shadow-2xs"
            >
              <Trash2 className="w-4 h-4 text-amber-600" />
              <span>مسح سجل المكتملة ({historyOrders.length})</span>
            </button>
          )}

          {mainOrders.length > 0 && (
            <button
              onClick={() => setShowDeleteAllModal(true)}
              className="px-4 py-2 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 hover:bg-rose-100 dark:hover:bg-rose-900/60 text-xs font-extrabold transition-colors flex items-center gap-1.5 shadow-2xs"
            >
              <Trash2 className="w-4 h-4 text-rose-600" />
              <span>حذف جميع الطلبات 🗑️</span>
            </button>
          )}
        </div>
      </div>

      {displayedOrders.length === 0 ? (
        <div className="p-12 text-center bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-4">
          {trackerTab === "NEW_ACTIVE" ? (
            <>
              <div className="w-16 h-16 rounded-2xl bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800 text-emerald-600 flex items-center justify-center mx-auto">
                <PackageCheck className="w-8 h-8" />
              </div>
              <div>
                <h3 className="font-extrabold text-slate-800 dark:text-slate-200 text-lg">
                  لا توجد طلبيات جديدة أو قيد التنفيذ حالياً 📦
                </h3>
                <p className="text-xs text-slate-500 max-w-md mx-auto mt-1 leading-relaxed">
                  الطلبيات السابقة المكتملة محفوظة في <span className="font-bold text-indigo-600 dark:text-indigo-400">[سجل الطلبات الأرشيفية]</span>. قم بإضافة نواقص جديدة من الكتالوج لتظهر هنا حالة التوزيع والمتابعة الحية.
                </p>
              </div>
              <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
                {historyOrders.length > 0 && (
                  <button
                    onClick={() => setTrackerTab("HISTORY")}
                    className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition-colors inline-flex items-center gap-2 shadow-xs"
                  >
                    <History className="w-4 h-4" />
                    <span>عرض سجل الطلبات المكتملة ({historyOrders.length})</span>
                  </button>
                )}
                {onOpenCatalog && (
                  <button
                    onClick={onOpenCatalog}
                    className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-colors inline-flex items-center gap-2 shadow-xs"
                  >
                    <Package className="w-4 h-4" />
                    <span>تصفح الكتالوج وإرسال طلب جديد 🛒</span>
                  </button>
                )}
              </div>
            </>
          ) : trackerTab === "HISTORY" ? (
            <>
              <div className="w-16 h-16 rounded-2xl bg-indigo-50 dark:bg-indigo-950/50 border border-indigo-200 dark:border-indigo-800 text-indigo-600 flex items-center justify-center mx-auto">
                <History className="w-8 h-8" />
              </div>
              <div>
                <h3 className="font-extrabold text-slate-800 dark:text-slate-200 text-lg">
                  سجل الطلبات الأرشيفية فارغ حالياً 📜
                </h3>
                <p className="text-xs text-slate-500 max-w-md mx-auto mt-1 leading-relaxed">
                  عند استلام الشحنات وتأكيد وصولها بنجاح لمستودعك، تنقل الطلبيات تلقائياً هنا للأرشيف ورصد الفواتير.
                </p>
              </div>
              {activeOrders.length > 0 && (
                <button
                  onClick={() => setTrackerTab("NEW_ACTIVE")}
                  className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-colors inline-flex items-center gap-2 shadow-xs mx-auto"
                >
                  <PackageCheck className="w-4 h-4" />
                  <span>العودة للطلبيات الجديدة والجارية ({activeOrders.length})</span>
                </button>
              )}
            </>
          ) : (
            <>
              <Clock className="w-12 h-12 text-slate-300 mx-auto" />
              <h3 className="font-bold text-slate-700 dark:text-slate-300 text-base">
                لا توجد طلبيات مسجلة في النظام
              </h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                قم بإضافة النواقص وتأكيد الطلب لتظهر هنا حالة التوزيع والتوصيل المباشر.
              </p>
            </>
          )}
        </div>
      ) : (
        <div className="space-y-6">
          {displayedOrders.map((mainOrder) => {
            const isExpanded = expandedOrders[mainOrder.id] !== false;
            return (
              <div
                key={mainOrder.id}
                className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-xs"
              >
                {/* Main Order Bar */}
                <div
                  onClick={() => toggleExpand(mainOrder.id)}
                  className="p-5 bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4 cursor-pointer hover:bg-slate-100/80 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 rounded-xl font-mono font-bold text-sm">
                      {mainOrder.id}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-extrabold text-slate-900 dark:text-white text-base">
                          طلب موحد ({mainOrder.subOrders.length} مصانع)
                        </h3>
                        <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 font-semibold">
                          {mainOrder.paymentMethod === "INVOICE_30_DAYS"
                            ? "آجل 30 يوماً"
                            : "عند الاستلام"}
                        </span>
                      </div>
                      <div className="flex items-center gap-3 text-xs text-slate-500 mt-1">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3.5 h-3.5" />
                          {new Date(mainOrder.createdAt).toLocaleDateString("ar-YE", {
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                          })}
                        </span>
                        <span>•</span>
                        <span>إجمالي الفاتورة: <strong>{mainOrder.totalAmount.toLocaleString("ar-YE")} ر.ي</strong></span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handlePrintInvoice(mainOrder);
                      }}
                      className="p-2 text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 text-xs font-bold flex items-center gap-1"
                    >
                      <Printer className="w-4 h-4" />
                      <span className="hidden sm:inline">طباعة الفاتورة</span>
                    </button>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteMainOrder(mainOrder.id);
                      }}
                      className="p-2 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/50 transition-colors"
                      title="إلغاء وحذف الطلب الموحد بكامل شحناته"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>

                    {isExpanded ? (
                      <ChevronUp className="w-5 h-5 text-slate-400" />
                    ) : (
                      <ChevronDown className="w-5 h-5 text-slate-400" />
                    )}
                  </div>
                </div>

                {/* Sub-Orders per Factory */}
                {isExpanded && (
                  <div className="p-5 space-y-6">
                    <div className="text-xs font-bold text-slate-500">
                      طلبيات المصانع الفرعية المقسمة آلياً:
                    </div>

                    <div className="grid grid-cols-1 gap-6">
                      {mainOrder.subOrders.map((sub) => (
                        <div
                          key={sub.id}
                          className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 space-y-4 shadow-2xs"
                        >
                          {/* Sub order top */}
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-3">
                            <div className="flex items-center gap-3">
                              <Building2 className="w-5 h-5 text-emerald-600" />
                              <div>
                                <h4 className="font-bold text-slate-900 dark:text-white text-sm">
                                  {sub.factoryName}
                                </h4>
                                <div className="text-xs text-slate-400 font-mono">
                                  رقم الشحنة: {sub.id} | وقت التوصيل المتوقع: {sub.estimatedDeliveryDate}
                                </div>
                              </div>
                            </div>
                            <StatusBadge status={sub.status} size="md" />
                          </div>

                          {/* Order Stepper Progress */}
                          <div className="py-2">
                            <div className="grid grid-cols-4 gap-2 text-center text-xs">
                              {["RECEIVED", "PROCESSING", "OUT_FOR_DELIVERY", "DELIVERED"].map(
                                (stepStatus, idx) => {
                                  const statusMap: Record<string, number> = {
                                    RECEIVED: 1,
                                    PROCESSING: 2,
                                    OUT_FOR_DELIVERY: 3,
                                    DELIVERED: 4,
                                  };
                                  const currentStep = statusMap[sub.status] || 1;
                                  const stepNumber = idx + 1;
                                  const isDone = currentStep >= stepNumber;
                                  const labels = [
                                    "استلام بالمصنع",
                                    "تحضير وتعبئة",
                                    "خرج للشحن 🚚",
                                    "تم التسليم",
                                  ];
                                  return (
                                    <div key={stepStatus} className="space-y-1">
                                      <div
                                        className={`h-2 rounded-full transition-all ${
                                          isDone
                                            ? "bg-emerald-600 shadow-xs"
                                            : "bg-slate-200 dark:bg-slate-800"
                                        }`}
                                      />
                                      <span
                                        className={`text-[11px] font-bold block ${
                                          isDone
                                            ? "text-emerald-700 dark:text-emerald-400"
                                            : "text-slate-400"
                                        }`}
                                      >
                                        {labels[idx]}
                                      </span>
                                    </div>
                                  );
                                }
                              )}
                            </div>
                          </div>

                          {/* Merchant Confirm Delivery Action Box (ظهر للتاجر لتأكيد التسليم بنفسه) */}
                          {sub.status !== "DELIVERED" && sub.status !== "CANCELLED" && (
                            <div className="p-4 rounded-2xl bg-gradient-to-r from-emerald-900 via-slate-900 to-indigo-950 text-white border-2 border-emerald-500/50 shadow-lg space-y-3">
                              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                                <div className="flex items-center gap-3">
                                  <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-400/40 flex items-center justify-center text-emerald-300 shrink-0">
                                    <CheckCircle2 className="w-6 h-6 animate-pulse" />
                                  </div>
                                  <div>
                                    <h4 className="font-extrabold text-sm text-emerald-300">
                                      {sub.status === "AWAITING_MERCHANT_CONFIRMATION"
                                        ? "🚨 وصل السائق بالموقع! يُرجى تأكيد استلام الشحنة 🚚"
                                        : "زر تأكيد التسليم واستلام البضائع 📦"}
                                    </h4>
                                    <p className="text-xs text-slate-300 mt-0.5">
                                      انقر هنا بعد استلامك للبضائع من السائق لإيداع الكميات تلقائياً في مخازنك وإعلام السائق بتأكيد التسليم.
                                    </p>
                                  </div>
                                </div>

                                {merchantWarehouses.length > 0 && (
                                  <div className="shrink-0 space-y-1">
                                    <label className="block text-[10px] font-bold text-slate-300">
                                      المستودع المستلم:
                                    </label>
                                    <select
                                      value={subOrderWarehouseMap[sub.id] || (merchantWarehouses.find(w => w.isDefault)?.id || merchantWarehouses[0]?.id || "")}
                                      onChange={(e) =>
                                        setSubOrderWarehouseMap((prev) => ({
                                          ...prev,
                                          [sub.id]: e.target.value,
                                        }))
                                      }
                                      className="px-3 py-1.5 rounded-xl bg-slate-900 text-white border border-emerald-400/40 text-xs font-bold focus:outline-none"
                                    >
                                      {merchantWarehouses.map((wh) => (
                                        <option key={wh.id} value={wh.id}>
                                          {wh.name} ({wh.city}) {wh.isDefault ? "— الرئيسي" : ""}
                                        </option>
                                      ))}
                                    </select>
                                  </div>
                                )}
                              </div>

                              <div className="pt-2 border-t border-white/10 flex justify-end">
                                <button
                                  onClick={() => {
                                    const targetWhId =
                                      subOrderWarehouseMap[sub.id] ||
                                      merchantWarehouses.find((w) => w.isDefault)?.id ||
                                      merchantWarehouses[0]?.id;

                                    storeService.updateSubOrderStatus(
                                      sub.id,
                                      "DELIVERED",
                                      sub.assignedDriver,
                                      `تم التأكيد والاستلام الفعلي من لوحة التاجر وإيداع الكميات بالمخزن`,
                                      targetWhId
                                    );
                                  }}
                                  className="w-full sm:w-auto px-6 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-black text-xs sm:text-sm shadow-xl transition-all flex items-center justify-center gap-2"
                                >
                                  <CheckCircle2 className="w-5 h-5" />
                                  <span>تأكيد استلام الشحنة وإيداعها بالمخزن الآن ✅</span>
                                </button>
                              </div>
                            </div>
                          )}

                          {/* If delivered, show warehouse deposit confirmation banner */}
                          {sub.status === "DELIVERED" && (
                            <div className="p-3.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-xs text-emerald-900 dark:text-emerald-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                              <div className="flex items-center gap-2.5">
                                <div className="p-2 bg-emerald-600 text-white rounded-lg">
                                  <CheckCircle2 className="w-4 h-4" />
                                </div>
                                <div>
                                  <div className="font-extrabold text-emerald-950 dark:text-emerald-200">
                                    تم استلام الشحنة وإيداع الأصناف آلياً في مخازن التجر 📦
                                  </div>
                                  <div className="text-[11px] text-emerald-800 dark:text-emerald-300">
                                    تم تزويد رصيد المستودع بـ ({sub.items.reduce((acc, item) => acc + item.quantity, 0)} وحدات) من {sub.items.length} منتجات مضافة بنجاح.
                                  </div>
                                </div>
                              </div>
                              <span className="shrink-0 font-bold px-3 py-1 bg-emerald-600 text-white rounded-lg text-[11px]">
                                متوفر في المخزون
                              </span>
                            </div>
                          )}

                          {/* Driver assigned info card & Batch Route Queue Status */}
                          {sub.assignedDriver && (() => {
                            const queueInfo = getDriverQueueInfo(sub);
                            return (
                              <div className="space-y-3">
                                {/* Driver Info Box */}
                                <div className="p-3.5 rounded-2xl bg-cyan-50 dark:bg-cyan-950/40 border border-cyan-200 dark:border-cyan-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                                  <div className="flex items-center gap-3">
                                    <div className="p-2.5 bg-cyan-600 text-white rounded-xl shadow-xs shrink-0">
                                      <Truck className="w-5 h-5" />
                                    </div>
                                    <div>
                                      <div className="font-extrabold text-cyan-950 dark:text-cyan-200 text-sm">
                                        السائق المكلف: {sub.assignedDriver.name} ({sub.assignedDriver.vehicleType})
                                      </div>
                                      <div className="text-cyan-800 dark:text-cyan-300">
                                        رقم الشاحنة: <span className="font-mono font-bold">{sub.assignedDriver.vehicleNo}</span>
                                        {sub.assignedDriver.batchRouteNote ? (
                                          <span> | {sub.assignedDriver.batchRouteNote}</span>
                                        ) : (
                                          <span> | رحلة شحن مجمعة (خط سير تسليم متتابع) 🚚</span>
                                        )}
                                      </div>
                                    </div>
                                  </div>

                                  <a
                                    href={`tel:${sub.assignedDriver.phone}`}
                                    className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2 bg-cyan-600 hover:bg-cyan-700 text-white font-bold rounded-xl transition-colors shrink-0 shadow-xs"
                                  >
                                    <Phone className="w-4 h-4" />
                                    <span>الاتصال بالسائق</span>
                                  </a>
                                </div>

                                {/* Batch Queue Position Indicator & Live Location for Wholesaler */}
                                {queueInfo && sub.status !== "DELIVERED" && sub.status !== "CANCELLED" && (
                                  queueInfo.isActiveDestination ? (
                                    <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border-2 border-emerald-500/70 text-emerald-950 dark:text-emerald-200 text-xs space-y-3 shadow-md">
                                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                                        <div className="flex items-center gap-2.5 font-black text-sm text-emerald-900 dark:text-emerald-200">
                                          <Radio className="w-5 h-5 text-emerald-600 animate-pulse shrink-0" />
                                          <span>🚚 شحنتك هي المحطة الأولى النشطة حالياً (#1)!</span>
                                        </div>
                                        <span className="px-3 py-1 rounded-full bg-emerald-200/80 dark:bg-emerald-900/80 text-emerald-950 dark:text-emerald-200 text-xs font-black border border-emerald-400/50">
                                          البث الحي مفعل 📡
                                        </span>
                                      </div>

                                      <p className="text-emerald-800 dark:text-emerald-300 font-medium text-xs leading-relaxed">
                                        السائق في طريقه المباشر حالياً نحو متجرك. يمكنك متابعة الخريطة التفاعلية وموقع الشاحنة الحي وسرعتها والوقت المقدر للوصول لحظة بلحظة.
                                      </p>

                                      <div className="pt-2 border-t border-emerald-200/60 dark:border-emerald-800/60 flex flex-wrap items-center justify-between gap-2">
                                        <div className="flex items-center gap-3 text-[11px] font-bold text-emerald-900 dark:text-emerald-200">
                                          <span>⏱️ الوصول: ~12 دقيقة</span>
                                          <span>•</span>
                                          <span>🚗 السرعة: 42 كم/س</span>
                                        </div>

                                        <button
                                          type="button"
                                          onClick={() => setActiveLiveTrackingSubOrder(sub)}
                                          className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs shadow-md transition-all flex items-center gap-2 cursor-pointer"
                                        >
                                          <Radio className="w-4 h-4 text-emerald-300 animate-pulse" />
                                          <span>تتبع الموقع الحي للشاحنة المباشر 📡</span>
                                        </button>
                                      </div>
                                    </div>
                                  ) : (
                                    <div className="p-4 rounded-2xl bg-amber-50/90 dark:bg-amber-950/40 border-2 border-amber-300 dark:border-amber-800/80 text-amber-950 dark:text-amber-200 text-xs space-y-3 shadow-xs">
                                      <div className="flex items-center justify-between gap-2 flex-wrap">
                                        <div className="flex items-center gap-2 font-black text-sm text-amber-900 dark:text-amber-300">
                                          <Clock className="w-5 h-5 text-amber-600 shrink-0" />
                                          <span>📦 الشحنة محملة بالشاحنة وفي الطريق — دورك رقم #{queueInfo.position}</span>
                                        </div>
                                        <span className="px-3 py-1 rounded-full bg-amber-200/80 dark:bg-amber-900/80 text-amber-950 dark:text-amber-200 text-[11px] font-black border border-amber-400/50">
                                          ترتيب الاستلام: #{queueInfo.position} من أصل {queueInfo.totalInBatch} شحنات
                                        </span>
                                      </div>

                                      <p className="text-amber-800 dark:text-amber-300 font-medium leading-relaxed">
                                        تنويه: السائق يقوم حالياً بتوصيل الشحنة السابقة لتاجر آخر في خط السير، وسيبدأ التوجه المباشر نحو متجرك فور إتمام الطلبية السابقة.
                                      </p>

                                      <div className="p-3 rounded-xl bg-amber-100/80 dark:bg-amber-900/60 text-xs font-bold text-amber-950 dark:text-amber-200 space-y-1 border border-amber-300/60 dark:border-amber-800">
                                        <div className="flex items-center gap-2 font-extrabold text-amber-900 dark:text-amber-200">
                                          <Lock className="w-4 h-4 text-amber-600 shrink-0" />
                                          <span>🔒 نظام حماية الخصوصية والتنظيم اللوجستي:</span>
                                        </div>
                                        <p className="text-[11px] text-amber-900 dark:text-amber-300 font-medium leading-normal pr-6">
                                          تأكيداً على الخصوصية: مسار الخريطة وموقع الشاحنة الحي محجوب حالياً لحماية خصوصية وعناوين التجار الآخرين. سينفتح البث الحي والخريطة المباشرة لشاحنتك تلقائياً فور وصول السائق لدور طلبك (#1).
                                        </p>
                                      </div>
                                    </div>
                                  )
                                )}
                              </div>
                            );
                          })()}

                          {/* Items Table with Clear Image & Loading Status */}
                          <div className="divide-y divide-slate-100 dark:divide-slate-800">
                            {sub.items.map((item, i) => {
                              const isVerified = (sub.verifiedLoadedItems || []).includes(item.product.id);
                              return (
                                <div
                                  key={i}
                                  className="py-3 flex items-center justify-between text-xs gap-3"
                                >
                                  <div className="flex items-center gap-3">
                                    <div className="relative w-12 h-12 rounded-xl overflow-hidden border-2 border-slate-200 dark:border-slate-700 bg-white shrink-0 shadow-xs">
                                      <img
                                        src={item.product.image}
                                        alt={item.product.name}
                                        className="w-full h-full object-cover"
                                      />
                                    </div>
                                    <div>
                                      <div className="font-extrabold text-slate-800 dark:text-slate-200 text-xs">
                                        {item.product.name}
                                      </div>
                                      <div className="text-slate-500 text-[11px] mt-0.5">
                                        السعر: {item.priceAtOrder.toLocaleString("ar-YE")} ر.ي / {item.product.unit}
                                      </div>
                                      {sub.assignedDriver && (
                                        <span className={`inline-block mt-1 px-2 py-0.5 rounded text-[10px] font-black ${
                                          isVerified
                                            ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300"
                                            : "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300"
                                        }`}>
                                          {isVerified ? "تم التحميل بالشاحنة ✅" : "قيد الفحص والمطابقة ⏳"}
                                        </span>
                                      )}
                                    </div>
                                  </div>
                                  <div className="text-left font-bold text-slate-900 dark:text-white shrink-0">
                                    <span className="text-indigo-600 dark:text-indigo-400 font-extrabold text-xs block">
                                      {item.quantity} {item.product.unit}
                                    </span>
                                    <div className="text-[11px] text-emerald-700 dark:text-emerald-400 font-mono mt-0.5">
                                      {(item.priceAtOrder * item.quantity).toLocaleString("ar-YE")} ر.ي
                                    </div>
                                  </div>
                                </div>
                              );
                            })}
                          </div>

                          {/* Sub Order Summary */}
                          <div className="flex items-center justify-between text-xs pt-2 border-t border-slate-100 dark:border-slate-800 font-bold">
                            <span className="text-slate-500">مجموع الطلبية الفرعية لهذا المصنع (شامل الضريبة):</span>
                            <span className="text-emerald-700 dark:text-emerald-400 text-sm">
                              {sub.total.toLocaleString("ar-YE")} ر.ي
                            </span>
                          </div>

                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Wholesale Order Invoice Printable Modal */}
      {selectedInvoiceOrder && (
        <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-sm flex items-center justify-center p-2 sm:p-4 overflow-y-auto">
          {/* Printable Dynamic Style Tag */}
          <style>{`
            @media print {
              @page {
                size: ${selectedPaperFormat === "THERMAL_80MM" ? "80mm auto" : selectedPaperFormat === "THERMAL_58MM" ? "58mm auto" : "A4 portrait"};
                margin: ${selectedPaperFormat.startsWith("THERMAL") ? "0" : "10mm"};
              }
              body * {
                visibility: hidden;
              }
              #printable-wholesaler-invoice, #printable-wholesaler-invoice * {
                visibility: visible;
              }
              #printable-wholesaler-invoice {
                position: absolute;
                left: 0;
                top: 0;
                width: ${selectedPaperFormat === "THERMAL_80MM" ? "80mm !important" : selectedPaperFormat === "THERMAL_58MM" ? "58mm !important" : "100% !important"};
                max-width: ${selectedPaperFormat === "THERMAL_80MM" ? "80mm !important" : selectedPaperFormat === "THERMAL_58MM" ? "58mm !important" : "100% !important"};
                margin: 0 auto !important;
                padding: ${selectedPaperFormat.startsWith("THERMAL") ? "10px !important" : "20px !important"};
                background: #ffffff !important;
                color: #000000 !important;
                box-shadow: none !important;
                border: none !important;
              }
              .no-print {
                display: none !important;
              }
            }
          `}</style>

          <div
            id="printable-wholesaler-invoice"
            className={`bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 ${
              selectedPaperFormat === "A4" ? "max-w-2xl" : "max-w-md"
            } w-full p-5 sm:p-8 shadow-2xl relative my-auto min-h-[85vh] sm:min-h-[90vh] flex flex-col justify-between overflow-y-auto space-y-5`}
          >
            {/* Modal Close Button */}
            <button
              onClick={() => setSelectedInvoiceOrder(null)}
              className="no-print absolute left-4 top-4 p-2 rounded-xl text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Printer Setup & Device Connection Bar (NO-PRINT) */}
            <div className="no-print bg-slate-100 dark:bg-slate-800/90 p-4 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200 dark:border-slate-700 pb-2.5">
                <div className="flex items-center gap-2">
                  <Printer className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                  <span className="font-extrabold text-xs text-slate-900 dark:text-white">
                    إعدادات وتوصيل الطابعة والجهاز
                  </span>
                </div>
                <div className="flex items-center gap-1.5 text-[10px] text-emerald-600 dark:text-emerald-400 font-bold bg-emerald-50 dark:bg-emerald-950/60 px-2.5 py-1 rounded-full border border-emerald-200 dark:border-emerald-800">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                  <span>متصل بنظام طباعة الجهاز</span>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                {/* Paper Size Selector */}
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 mb-1">
                    مقاس الورق / الفاتورة:
                  </label>
                  <select
                    value={selectedPaperFormat}
                    onChange={(e) => setSelectedPaperFormat(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-xs font-bold text-slate-900 dark:text-white focus:outline-none"
                  >
                    <option value="A4">📄 ورق A4 رسمية تجارية (طابعة مكتبية)</option>
                    <option value="THERMAL_80MM">🧾 إيصال كاشير حراري (80mm Thermal POS)</option>
                    <option value="THERMAL_58MM">🔖 إيصال كاشير صغير (58mm Thermal POS)</option>
                  </select>
                </div>

                {/* Printer Type Connection Preset */}
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 mb-1">
                    اختيار منفذ / طابعة الجهاز:
                  </label>
                  <select
                    value={selectedPrinterType}
                    onChange={(e) => setSelectedPrinterType(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-xs font-bold text-slate-900 dark:text-white focus:outline-none"
                  >
                    <option value="SYSTEM_DEFAULT">🖨️ طابعة النظام المباشرة (OS Default)</option>
                    <option value="POS_THERMAL_USB">🔌 طابعة حرارية USB (Epson / Xprinter)</option>
                    <option value="POS_BLUETOOTH">📶 طابعة بلوتوث لاسلكية (Bluetooth / Wireless)</option>
                    <option value="NETWORK_PRINTER">🌐 طابعة شبكة محلية (LAN / Network IP)</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center justify-between text-[11px] pt-1">
                <button
                  type="button"
                  onClick={() => setShowPrinterGuide(!showPrinterGuide)}
                  className="text-emerald-600 dark:text-emerald-400 font-extrabold hover:underline flex items-center gap-1"
                >
                  <HelpCircle className="w-3.5 h-3.5" />
                  <span>كيف أختار وأربط طابعتي المباشرة بالجهاز؟</span>
                </button>
                <span className="text-slate-400 text-[10px]">
                  فتح نافذة اختيار الطابعة المباشرة للنظام
                </span>
              </div>

              {/* Printer Guide Drawer */}
              {showPrinterGuide && (
                <div className="p-3 bg-white dark:bg-slate-900 rounded-xl border border-emerald-200 dark:border-emerald-800 text-[11px] space-y-1.5 text-slate-700 dark:text-slate-300">
                  <div className="font-extrabold text-emerald-950 dark:text-emerald-200">
                    💡 طريقة اختيار الطابعة الموصولة بجهازك:
                  </div>
                  <ol className="list-decimal list-inside space-y-1 text-[10.5px]">
                    <li>اضغط على زر <strong>"اختيار الطابعة والطباعة الفورية"</strong> بالأسفل.</li>
                    <li>ستظهر لك النافذة المباشرة للطباعة من المتصفح أو نظام التشغيل.</li>
                    <li>من قائمة <strong>"المقصد / Destination"</strong>، حدد طابعتك (الموصلة بـ USB، Bluetooth، أو Network).</li>
                  </ol>
                </div>
              )}
            </div>

            {/* Official Order Header */}
            <div className="border-b-2 border-slate-200 dark:border-slate-800 pb-5 space-y-3">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-right">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-emerald-600 text-white flex items-center justify-center font-black shadow-md shrink-0">
                    <Package className="w-6 h-6" />
                  </div>
                  <div>
                    <h2 className="text-base font-black text-slate-900 dark:text-white">
                      امر توريد نواقص تجاري موحد - منصة التاجر
                    </h2>
                    <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                      طلبية مقسمة تلقائياً على المصانع الموردة المعتمدة
                    </p>
                  </div>
                </div>

                <div className="text-center sm:text-left bg-slate-50 dark:bg-slate-800 p-2.5 rounded-2xl border border-slate-200 dark:border-slate-700 shrink-0 min-w-[170px]">
                  <span className="block text-[10px] text-emerald-600 dark:text-emerald-400 font-extrabold uppercase tracking-wider">
                    رقم الطلب الموحد
                  </span>
                  <span className="text-sm font-black text-slate-900 dark:text-white font-mono block">
                    {selectedInvoiceOrder.id}
                  </span>
                  <span className="text-[10px] text-slate-500 font-mono block">
                    تاريخ: {new Date(selectedInvoiceOrder.createdAt).toLocaleDateString("ar-YE")}
                  </span>
                </div>
              </div>
            </div>

            {/* Order Items Breakdown per Factory */}
            <div className="space-y-4">
              {selectedInvoiceOrder.subOrders.map((sub) => (
                <div key={sub.id} className="p-3.5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 space-y-2">
                  <div className="flex items-center justify-between text-xs font-bold border-b border-slate-200 dark:border-slate-700 pb-1.5">
                    <span className="text-slate-900 dark:text-white flex items-center gap-1.5">
                      <Building2 className="w-4 h-4 text-emerald-600" />
                      {sub.factoryName} (شحنة: {sub.id})
                    </span>
                    <span className="font-mono text-emerald-600">{sub.total.toLocaleString("ar-YE")} ر.ي</span>
                  </div>

                  <div className="space-y-1">
                    {sub.items.map((it, idx) => (
                      <div key={idx} className="flex justify-between items-center text-xs text-slate-700 dark:text-slate-300">
                        <span>• {it.product.name} ({it.quantity} {it.product.unit})</span>
                        <span className="font-mono text-[11px]">{(it.priceAtOrder * it.quantity).toLocaleString("ar-YE")} ر.ي</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            {/* Total Financial Summary */}
            <div className="bg-slate-100 dark:bg-slate-800 p-4 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-1.5 text-xs">
              <div className="flex justify-between items-center text-sm font-black text-slate-900 dark:text-white">
                <span>الإجمالي العام التقديري للطلب الموحد:</span>
                <span className="text-emerald-600 dark:text-emerald-400 text-lg font-black font-mono">
                  {selectedInvoiceOrder.totalAmount.toLocaleString("ar-YE")} ر.ي
                </span>
              </div>
            </div>

            {/* Signatures & Seal */}
            <div className="pt-4 border-t-2 border-dashed border-slate-300 dark:border-slate-700 grid grid-cols-2 gap-4 text-center text-xs">
              <div className="space-y-6">
                <span className="font-bold text-slate-700 dark:text-slate-300 block">توقيع المستلم (التاجر):</span>
                <div className="border-b border-slate-300 dark:border-slate-700 w-3/4 mx-auto h-4"></div>
              </div>
              <div className="space-y-6">
                <span className="font-bold text-slate-700 dark:text-slate-300 block">اعتماد قسم المشتريات:</span>
                <div className="border-b border-slate-300 dark:border-slate-700 w-3/4 mx-auto h-4"></div>
              </div>
            </div>

            {/* Buttons Bar (NO-PRINT) */}
            <div className="no-print flex items-center gap-3 pt-2">
              <button
                onClick={() => window.print()}
                className="flex-1 py-3.5 rounded-2xl bg-emerald-600 text-white hover:bg-emerald-700 font-bold text-xs transition-colors shadow-md flex items-center justify-center gap-2"
              >
                <Printer className="w-4 h-4" />
                <span>اختيار الطابعة والطباعة الفورية 🖨️</span>
              </button>
              <button
                onClick={() => setSelectedInvoiceOrder(null)}
                className="px-6 py-3.5 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold text-xs hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
              >
                إغلاق
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Live Truck GPS Tracking Modal */}
      {activeLiveTrackingSubOrder && (
        <LiveTruckTrackingModal
          isOpen={!!activeLiveTrackingSubOrder}
          onClose={() => setActiveLiveTrackingSubOrder(null)}
          subOrder={activeLiveTrackingSubOrder}
        />
      )}

      {/* Delete All Orders Modal */}
      {showDeleteAllModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-rose-200 dark:border-rose-900/50 max-w-md w-full p-6 space-y-5 shadow-2xl dir-rtl">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
              <div className="flex items-center gap-3 text-rose-600 dark:text-rose-400">
                <div className="p-2.5 bg-rose-100 dark:bg-rose-950/60 rounded-2xl">
                  <Trash2 className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-extrabold text-slate-900 dark:text-white text-base">
                    حذف جميع الطلبات نهائياً 🚨
                  </h3>
                  <p className="text-xs text-slate-500">
                    مسح وتصفير كافة الطلبات من السجل والنظام
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowDeleteAllModal(false)}
                className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-xl"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-xs text-rose-900 dark:text-rose-200 space-y-2">
              <div className="font-bold flex items-center gap-1.5">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                <span>تحذير هـام:</span>
              </div>
              <p className="leading-relaxed">
                أنت على وشك حذف <strong>جميع الطلبات ({mainOrders.length} طلبية موحدة)</strong> من النظام. تشمل هذه العملية الطلبيات الجديدة، قيد الشحن، والسجل المكتمل بالكامل.
              </p>
              <p className="font-bold text-rose-700 dark:text-rose-300">
                ⚠️ هذه العملية فورية ولا يمكن التراجع عنها.
              </p>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={() => setShowDeleteAllModal(false)}
                className="px-5 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300 text-xs font-bold transition-colors"
              >
                إلغاء الأمر
              </button>
              <button
                onClick={handleConfirmDeleteAll}
                className="px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-extrabold shadow-lg shadow-rose-600/20 transition-all flex items-center gap-2"
              >
                <Trash2 className="w-4 h-4" />
                <span>نعم، حذف جميع الطلبات الآن</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete History Modal */}
      {showDeleteHistoryModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-indigo-200 dark:border-indigo-900/50 max-w-md w-full p-6 space-y-5 shadow-2xl dir-rtl">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
              <div className="flex items-center gap-3 text-indigo-600 dark:text-indigo-400">
                <div className="p-2.5 bg-indigo-100 dark:bg-indigo-950/60 rounded-2xl">
                  <Trash2 className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-extrabold text-slate-900 dark:text-white text-base">
                    حذف سجل الطلبات المكتملة 🧹
                  </h3>
                  <p className="text-xs text-slate-500">
                    تفريغ وتصفية الأرشيف التاريخي
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowDeleteHistoryModal(false)}
                className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-xl"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-4 rounded-2xl bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-800 text-xs text-indigo-900 dark:text-indigo-200 space-y-2">
              <p className="leading-relaxed">
                سيتم مسح وحذف <strong>الطلبيات المكتملة فقط ({historyOrders.length} طلبية)</strong> المسلمة بنجاح، مع الإبقاء على كافة الطلبيات الجديدة والجارية دون تأثير.
              </p>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={() => setShowDeleteHistoryModal(false)}
                className="px-5 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300 text-xs font-bold transition-colors"
              >
                إلغاء
              </button>
              <button
                onClick={handleConfirmDeleteHistory}
                className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-extrabold shadow-lg shadow-indigo-600/20 transition-all flex items-center gap-2"
              >
                <Trash2 className="w-4 h-4" />
                <span>مسح الطلبيات المكتملة</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
