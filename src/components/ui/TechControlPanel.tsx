import React, { useState, useEffect } from "react";
import {
  SlidersHorizontal,
  ChevronDown,
  ChevronUp,
  Building2,
  Store,
  Boxes,
  PackageCheck,
  Building,
  RotateCcw,
  ShoppingBag,
  Sparkles,
  CheckCircle2,
  Layers,
  ArrowLeft,
  X,
  Package,
  Menu,
  Check,
  Activity,
  Tag,
  Settings,
  Wifi,
  BarChart3,
  Users,
  Crown,
  CreditCard,
  LogOut,
  User,
  Phone,
  MapPin,
  Headphones,
  Calendar,
  Clock
} from "lucide-react";
import { MerchantWarehouse, MerchantAccount, SubscriptionTier, BillingCycle } from "../../types";
import { storeService } from "../../services/storeService";
import { PlatformInfoBox, CustomerServiceButton } from "../PlatformInfoBox";
import { MerchantSettingsModal } from "../merchant/MerchantSettingsModal";

export interface TechSubSection {
  id: string;
  label: string;
  subLabel?: string;
  icon: React.ElementType;
  badge?: string | number;
  badgeColor?: string;
  color?: string;
}

export interface TechWindowOption {
  id: string;
  label: string;
  subLabel?: string;
  icon: React.ElementType;
  badge?: string | number;
  badgeColor?: string;
  color?: string;
  subSections?: TechSubSection[];
}

export type TechTabOption = TechWindowOption;

interface Props {
  merchantAccount?: MerchantAccount;
  onLogout?: () => void;
  title?: string;
  subtitle?: string;
  windows?: TechWindowOption[];
  tabs?: TechWindowOption[];
  activeWindowId?: string;
  activeTabId?: string;
  onSelectWindow?: (windowId: string) => void;
  onSelectTab?: (tabId: string) => void;
  activeSubSectionId?: string;
  onSelectSubSection?: (subSectionId: string) => void;
  warehouses?: MerchantWarehouse[];
  selectedWarehouseId?: string;
  onSelectWarehouse?: (id: string) => void;
  stats?: {
    label: string;
    value: string | number;
    color?: string;
  }[];
  badge?: string;
  headerActions?: React.ReactNode;
  onResetData?: () => void;
  onOpenCart?: () => void;
  cartCount?: number;
  isOpen?: boolean;
  onClose?: () => void;
}

export const TechControlPanel: React.FC<Props> = ({
  merchantAccount: initialAccount,
  onLogout,
  title = "اسم محل التاجر",
  subtitle,
  windows: windowsProp,
  tabs: tabsProp,
  activeWindowId: activeWindowIdProp,
  activeTabId: activeTabIdProp,
  onSelectWindow: onSelectWindowProp,
  onSelectTab: onSelectTabProp,
  activeSubSectionId,
  onSelectSubSection,
  warehouses = [],
  selectedWarehouseId,
  onSelectWarehouse,
  stats = [],
  badge,
  headerActions,
  onResetData,
  onOpenCart,
  cartCount = 0,
  isOpen = true,
  onClose,
}) => {
  const [currentAccount, setCurrentAccount] = useState<MerchantAccount | undefined>(initialAccount);
  const [isSubscriptionModalOpen, setIsSubscriptionModalOpen] = useState(false);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  const [upgradeSuccessMsg, setUpgradeSuccessMsg] = useState("");
  const [selectedBillingCycle, setSelectedBillingCycle] = useState<BillingCycle>("YEARLY");

  useEffect(() => {
    setCurrentAccount(initialAccount);
    if (initialAccount?.subscription?.billingCycle) {
      setSelectedBillingCycle(initialAccount.subscription.billingCycle);
    }
  }, [initialAccount]);

  useEffect(() => {
    const unsubscribe = storeService.subscribe(() => {
      const latest = storeService.getCurrentMerchantSession();
      if (latest) {
        setCurrentAccount(latest);
      }
    });
    return unsubscribe;
  }, []);

  const handlePlanUpgradeSubmit = (newTier: SubscriptionTier, cycle: BillingCycle = selectedBillingCycle) => {
    if (!currentAccount) return;
    storeService.updateMerchantSubscription(currentAccount.id, newTier, cycle);
    const cycleText = cycle === "YEARLY" ? "السنوي (توفير شهرين 🎉)" : "الشهري";
    setUpgradeSuccessMsg(`تم تحديث الاشتراك بنجاح للباقة واختيار النظام ${cycleText} 🚀`);
    setTimeout(() => {
      setUpgradeSuccessMsg("");
      setIsSubscriptionModalOpen(false);
    }, 1500);
  };

  const windows = windowsProp || tabsProp || [];
  const activeWindowId = activeWindowIdProp || activeTabIdProp || (windows[0]?.id || "");
  const onSelectWindow = onSelectWindowProp || onSelectTabProp || (() => {});
  
  const [isWarehouseDropdownOpen, setIsWarehouseDropdownOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [expandedWindowIds, setExpandedWindowIds] = useState<string[]>([]);
  const [isPinned, setIsPinned] = useState(false);
  const [isOverlayOpen, setIsOverlayOpen] = useState(false);

  // Auto-detect collapsible pages (Only POS / نقطة البيع)
  const isCollapsibleView = React.useMemo(() => {
    return (
      activeSubSectionId === "SALES" ||
      activeWindowId === "SALES" ||
      activeTabIdProp === "SALES"
    );
  }, [activeSubSectionId, activeWindowId, activeTabIdProp]);

  const toggleWindowExpand = (winId: string) => {
    setExpandedWindowIds((prev) =>
      prev.includes(winId) ? prev.filter((id) => id !== winId) : [...prev, winId]
    );
  };

  const activeWindow = windows.find((w) => w.id === activeWindowId) || windows[0];
  const selectedWarehouse = warehouses.find((w) => w.id === selectedWarehouseId);

  // IF TABS MODE (e.g. Platform Admin Dashboard or Factory Dashboard): Render Horizontal Top Control Panel Card
  if (tabsProp && !windowsProp) {
    return (
      <div className="w-full bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-5 sm:p-6 shadow-md space-y-5 dir-rtl my-4">
        {/* Header with Title, Subtitle, Badge, and Action Buttons */}
        {((title && title.trim() !== "") || headerActions || onResetData) && (
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-4">
            {title && title.trim() !== "" && (
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-2xl bg-indigo-50 dark:bg-indigo-950/80 border border-indigo-200 dark:border-indigo-800/80 text-indigo-600 dark:text-indigo-400 shadow-xs shrink-0">
                  <SlidersHorizontal className="w-6 h-6" />
                </div>
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <h2 className="text-lg sm:text-xl font-black text-slate-900 dark:text-white">
                      {title}
                    </h2>
                    {badge ? (
                      <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 text-[10px] font-extrabold border border-emerald-200 dark:border-emerald-800">
                        {badge}
                      </span>
                    ) : (
                      <span className="px-2.5 py-0.5 rounded-full bg-indigo-100 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 text-xs font-bold border border-indigo-200 dark:border-indigo-800">
                        لوحة الإدارة الموحدة
                      </span>
                    )}
                  </div>
                  {subtitle && (
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 font-medium">
                      {subtitle}
                    </p>
                  )}
                </div>
              </div>
            )}

            <div className="flex flex-wrap items-center gap-2">
              {headerActions}
              {onResetData && (
                <button
                  type="button"
                  onClick={onResetData}
                  className="px-4 py-2 rounded-xl bg-rose-50 dark:bg-rose-950/50 hover:bg-rose-100 text-rose-600 dark:text-rose-400 font-extrabold text-xs flex items-center gap-2 border border-rose-200 dark:border-rose-800 transition-all cursor-pointer"
                >
                  <RotateCcw className="w-4 h-4" />
                  <span>إعادة ضبط بيانات المنصة</span>
                </button>
              )}
            </div>
          </div>
        )}

        {/* Stats row if provided */}
        {stats && stats.length > 0 && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-50 dark:bg-slate-800/50 p-3.5 rounded-2xl border border-slate-200/80 dark:border-slate-800">
            {stats.map((st, i) => (
              <div key={i} className="text-right space-y-0.5">
                <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 block">{st.label}</span>
                <span className={`text-sm sm:text-base font-extrabold block ${st.color || "text-slate-900 dark:text-white"}`}>
                  {st.value}
                </span>
              </div>
            ))}
          </div>
        )}

        {/* Horizontal Tabs Grid */}
        <div className={`grid grid-cols-1 sm:grid-cols-2 ${
          tabsProp.length === 1
            ? "lg:grid-cols-1"
            : tabsProp.length === 2
            ? "lg:grid-cols-2"
            : tabsProp.length === 3
            ? "lg:grid-cols-3"
            : tabsProp.length === 4
            ? "lg:grid-cols-4"
            : "lg:grid-cols-5"
        } gap-3.5`}>
          {tabsProp.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTabIdProp === tab.id;

            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => onSelectTabProp && onSelectTabProp(tab.id)}
                className={`text-right p-4 sm:p-5 rounded-2xl border transition-all duration-200 flex flex-col justify-between space-y-3.5 cursor-pointer group ${
                  isActive
                    ? "bg-indigo-600 text-white border-indigo-600 shadow-lg shadow-indigo-600/20 ring-2 ring-indigo-400/50 scale-[1.01]"
                    : "bg-slate-50 dark:bg-slate-800/80 hover:bg-slate-100 dark:hover:bg-slate-800 border-slate-200 dark:border-slate-700/80 text-slate-800 dark:text-slate-200 hover:border-slate-300 shadow-2xs"
                }`}
              >
                <div className="flex items-start justify-between gap-3 w-full">
                  <div className="flex items-center gap-3.5 min-w-0">
                    <div
                      className={`w-12 h-12 sm:w-13 sm:h-13 rounded-2xl flex items-center justify-center shrink-0 transition-transform duration-300 group-hover:scale-105 ${
                        isActive
                          ? "bg-white/20 text-white shadow-inner"
                          : `bg-white dark:bg-slate-900 ${tab.color || "text-indigo-500"} shadow-sm border border-slate-200/80 dark:border-slate-800`
                      }`}
                    >
                      <Icon className="w-6 h-6 sm:w-7 sm:h-7" strokeWidth={2.2} />
                    </div>
                    <div>
                      <span className={`font-black text-sm sm:text-base block truncate ${isActive ? "text-white" : "text-slate-900 dark:text-white"}`}>
                        {tab.label}
                      </span>
                      {tab.subLabel && (
                        <p className={`text-[11px] sm:text-xs mt-0.5 leading-tight line-clamp-1 ${isActive ? "text-indigo-100" : "text-slate-500 dark:text-slate-400"}`}>
                          {tab.subLabel}
                        </p>
                      )}
                    </div>
                  </div>

                  {tab.badge !== undefined && (
                    <span
                      className={`px-2.5 py-1 rounded-xl text-[11px] font-black shrink-0 ${
                        isActive
                          ? "bg-white text-indigo-900 shadow-2xs"
                          : tab.badgeColor || "bg-indigo-100 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800"
                      }`}
                    >
                      {tab.badge}
                    </span>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      </div>
    );
  }

  // Grouping helper for category headers like the reference photo
  const getCategoryHeader = (index: number) => {
    switch (index) {
      case 0:
        return "الرئيسية";
      case 1:
        return "المبيعات والخدمات";
      case 2:
        return "العمليات والمخزون";
      default:
        return "";
    }
  };

  const renderSidebarContent = (inOverlay = false) => (
    <div className="space-y-3">
      {/* 1. Store Profile Identity Header Card */}
      <div className="p-3.5 rounded-2xl bg-slate-900 text-white border border-indigo-900 shadow-md text-center space-y-2">
        {/* Logo / Brand Shield Icon & Name */}
        <div className="flex items-center justify-center gap-2.5 text-right">
          <div className="w-10 h-10 rounded-2xl bg-indigo-600 text-amber-300 border border-indigo-400 flex items-center justify-center shrink-0 shadow-inner">
            <Building2 className="w-5 h-5" />
          </div>

          <div className="space-y-0.5 min-w-0 flex-1">
            <h2 className="font-black text-sm sm:text-base text-white leading-tight truncate">
              {currentAccount?.storeName || title}
            </h2>

            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-300 border border-emerald-500 text-[9.5px] font-black flex items-center gap-1">
                <span>معتمد 🟢</span>
              </span>
              <span className="px-2 py-0.5 rounded-full bg-blue-600 text-white font-black text-[9.5px] tracking-wider uppercase">
                POS
              </span>
            </div>
          </div>
        </div>

        {/* Merchant Account Quick Info */}
        {currentAccount && (
          <div className="bg-indigo-950 p-2 rounded-xl border border-indigo-800 text-[10.5px] text-indigo-200 space-y-1 font-medium text-right dir-rtl">
            <div className="flex justify-between items-center">
              <span className="text-indigo-300">التاجر: <strong className="text-white font-bold">{currentAccount.ownerName || "المالك"}</strong></span>
              <span className="font-mono text-indigo-400 text-[9.5px]">س.ت: {currentAccount.commercialReg || "—"}</span>
            </div>
          </div>
        )}
      </div>

      {/* 2. Menu Items & Navigation List */}
      <div className="space-y-2.5">
        {windows.map((win) => {
          const Icon = win.icon;
          const isWindowActive = activeWindowId === win.id;
          const hasSubSections = win.subSections && win.subSections.length > 0;
          const isExpanded = expandedWindowIds.includes(win.id);

          return (
            <div key={win.id} className="space-y-1">
              {/* Main Window Vertical Button */}
              <button
                type="button"
                onClick={() => {
                  onSelectWindow(win.id);
                  if (hasSubSections && !isExpanded) {
                    setExpandedWindowIds((prev) => [...prev, win.id]);
                  }
                  if (inOverlay && !hasSubSections) {
                    setIsOverlayOpen(false);
                  }
                }}
                className={`w-full text-right p-3 sm:p-3.5 rounded-2xl border transition-all duration-200 flex items-center justify-between group cursor-pointer ${
                  isWindowActive
                    ? "bg-white dark:bg-slate-900 border-2 border-indigo-600 dark:border-indigo-500 shadow-md shadow-indigo-600/10 ring-2 ring-indigo-500/20 text-slate-900 dark:text-white scale-[1.01]"
                    : "bg-slate-50/90 dark:bg-slate-800/70 border-slate-200/90 dark:border-slate-800 text-slate-700 dark:text-slate-200 hover:bg-white dark:hover:bg-slate-800 hover:border-slate-300 dark:hover:border-slate-700 hover:shadow-xs"
                }`}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div
                    className={`w-11 h-11 sm:w-12 sm:h-12 rounded-2xl flex items-center justify-center shrink-0 transition-transform duration-300 group-hover:scale-105 ${
                      isWindowActive
                        ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/30"
                        : `bg-white dark:bg-slate-900 ${win.color || "text-indigo-600 dark:text-indigo-400"} shadow-xs border border-slate-200/80 dark:border-slate-800`
                    }`}
                  >
                    <Icon className="w-5.5 h-5.5 sm:w-6 sm:h-6" strokeWidth={2.2} />
                  </div>

                  <div className="min-w-0">
                    <span className="text-xs sm:text-sm truncate font-black block leading-tight">
                      {win.label}
                    </span>
                    {win.subLabel && (
                      <span className="text-[10.5px] sm:text-[11px] text-slate-500 dark:text-slate-400 font-medium block truncate mt-0.5">
                        {win.subLabel}
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-1.5 shrink-0 mr-1">
                  {win.badge !== undefined && (
                    <span
                      className={`px-2.5 py-0.5 rounded-xl text-[10.5px] font-black shrink-0 ${
                        win.badgeColor || (isWindowActive ? "bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800" : "bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300")
                      }`}
                    >
                      {win.badge}
                    </span>
                  )}

                  {hasSubSections && (
                    <div
                      role="button"
                      tabIndex={0}
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleWindowExpand(win.id);
                      }}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" || e.key === " ") {
                          e.stopPropagation();
                          toggleWindowExpand(win.id);
                        }
                      }}
                      className="p-1 rounded-lg hover:bg-slate-200/80 dark:hover:bg-slate-700/80 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition-all cursor-pointer shrink-0"
                      title={isExpanded ? "إخفاء الخيارات الفرعية" : "عرض الخيارات الفرعية"}
                    >
                      <ChevronDown
                        className={`w-4 h-4 transition-transform duration-200 ${
                          isExpanded ? "rotate-180 text-indigo-600 dark:text-indigo-400" : ""
                        }`}
                      />
                    </div>
                  )}
                </div>
              </button>

              {/* Sub-Sections Indented Vertically */}
              {hasSubSections && isExpanded && (
                <div className="mr-3 pr-3 border-r-2 border-indigo-200 dark:border-indigo-900 space-y-1.5 pt-1.5 pb-1 animate-in fade-in duration-200">
                  {win.subSections?.map((sub) => {
                    const SubIcon = sub.icon;
                    const isSubActive = activeSubSectionId === sub.id;

                    return (
                      <button
                        key={sub.id}
                        type="button"
                        onClick={() => {
                          onSelectWindow(win.id);
                          if (onSelectSubSection) onSelectSubSection(sub.id);
                          if (inOverlay) setIsOverlayOpen(false);
                        }}
                        className={`w-full text-right p-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-between cursor-pointer ${
                          isSubActive
                            ? "bg-indigo-600 text-white shadow-xs"
                            : "text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                        }`}
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <SubIcon className={`w-4 h-4 shrink-0 ${isSubActive ? "text-white" : "text-indigo-500"}`} />
                          <span className="truncate">{sub.label}</span>
                        </div>

                        {sub.badge !== undefined && (
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-black shrink-0 ${
                              isSubActive ? "bg-white/20 text-white" : "bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300"
                            }`}
                          >
                            {sub.badge}
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}

        {/* Warehouse Selector Option */}
        {warehouses.length > 0 && (
          <div className="pt-2 border-t border-slate-200/80 dark:border-slate-800/80">
            <div className="relative">
              <button
                type="button"
                onClick={() => setIsWarehouseDropdownOpen(!isWarehouseDropdownOpen)}
                className="w-full text-right p-3 sm:p-3.5 rounded-2xl border transition-all duration-200 flex items-center justify-between group cursor-pointer bg-slate-50/90 dark:bg-slate-800/70 border-slate-200/90 dark:border-slate-800 text-slate-700 dark:text-slate-200 hover:bg-white dark:hover:bg-slate-800 hover:border-slate-300 dark:hover:border-slate-700 hover:shadow-xs"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-2xl flex items-center justify-center shrink-0 transition-transform duration-300 group-hover:scale-105 bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-xs border border-slate-200/80 dark:border-slate-800">
                    <Building2 className="w-5.5 h-5.5 sm:w-6 sm:h-6" strokeWidth={2.2} />
                  </div>
                  <div className="min-w-0">
                    <span className="text-xs sm:text-sm truncate font-black block leading-tight">
                      {selectedWarehouse ? `مستودع: ${selectedWarehouse.name}` : "كافة المستودعات"}
                    </span>
                    <span className="text-[10.5px] sm:text-[11px] text-slate-500 dark:text-slate-400 font-medium block truncate mt-0.5">
                      تحديد المستودع النشط
                    </span>
                  </div>
                </div>
                <ChevronDown className="w-4 h-4 text-slate-400 shrink-0" />
              </button>

              {isWarehouseDropdownOpen && (
                <div className="absolute right-0 bottom-full mb-2 w-full bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl p-2 z-50 space-y-1">
                  <button
                    type="button"
                    onClick={() => {
                      if (onSelectWarehouse) onSelectWarehouse("ALL");
                      setIsWarehouseDropdownOpen(false);
                    }}
                    className={`w-full text-right p-2.5 rounded-xl text-xs font-bold transition-colors ${
                      !selectedWarehouseId || selectedWarehouseId === "ALL"
                        ? "bg-blue-600 text-white"
                        : "hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300"
                    }`}
                  >
                    كافة المخازن الموحدة
                  </button>
                  {warehouses.map((w) => (
                    <button
                      key={w.id}
                      type="button"
                      onClick={() => {
                        if (onSelectWarehouse) onSelectWarehouse(w.id);
                        setIsWarehouseDropdownOpen(false);
                      }}
                      className={`w-full text-right p-2.5 rounded-xl text-xs font-bold transition-colors ${
                        selectedWarehouseId === w.id
                          ? "bg-blue-600 text-white"
                          : "hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300"
                      }`}
                    >
                      {w.name}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Quick Cart Action */}
        {onOpenCart && (
          <div>
            <button
              type="button"
              onClick={() => {
                onOpenCart();
                if (inOverlay) setIsOverlayOpen(false);
              }}
              className="w-full text-right p-3 sm:p-3.5 rounded-2xl border transition-all duration-200 flex items-center justify-between group cursor-pointer bg-slate-50/90 dark:bg-slate-800/70 border-slate-200/90 dark:border-slate-800 text-slate-700 dark:text-slate-200 hover:bg-white dark:hover:bg-slate-800 hover:border-slate-300 dark:hover:border-slate-700 hover:shadow-xs"
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-2xl flex items-center justify-center shrink-0 transition-transform duration-300 group-hover:scale-105 bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-xs border border-slate-200/80 dark:border-slate-800">
                  <ShoppingBag className="w-5.5 h-5.5 sm:w-6 sm:h-6" strokeWidth={2.2} />
                </div>
                <div className="min-w-0">
                  <span className="text-xs sm:text-sm truncate font-black block leading-tight">
                    سلة طلبات الجملة
                  </span>
                  <span className="text-[10.5px] sm:text-[11px] text-slate-500 dark:text-slate-400 font-medium block truncate mt-0.5">
                    الطلبيات قيد التجهيز
                  </span>
                </div>
              </div>
              {cartCount > 0 ? (
                <span className="px-2.5 py-0.5 rounded-xl bg-amber-400 text-slate-950 font-black text-xs shrink-0">
                  {cartCount}
                </span>
              ) : (
                <span className="px-2.5 py-0.5 rounded-xl bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300 font-extrabold text-xs shrink-0">
                  0
                </span>
              )}
            </button>
          </div>
        )}
      </div>

      {/* 3. Settings & Options Section */}
      <div className="pt-2 border-t border-slate-200 dark:border-slate-800 space-y-2">
        <div className="px-3 py-1 flex items-center justify-between text-slate-400">
          <span className="text-[11px] font-black text-slate-500 dark:text-slate-400">الإعدادات</span>
        </div>

        <div className="space-y-2">
          {/* Store Settings Button (Navigates to full page settings including subscriptions) */}
          <button
            type="button"
            onClick={() => {
              if (onSelectWindow) {
                onSelectWindow("SETTINGS");
              } else if (onSelectTabProp) {
                onSelectTabProp("SETTINGS");
              } else {
                setIsSettingsModalOpen(true);
              }
              if (inOverlay) setIsOverlayOpen(false);
            }}
            className={`w-full text-right p-3 sm:p-3.5 rounded-2xl border transition-all duration-200 flex items-center justify-between group cursor-pointer ${
              activeWindowId === "SETTINGS" || activeWindowIdProp === "SETTINGS" || activeTabIdProp === "SETTINGS"
                ? "border-indigo-600 bg-indigo-50/80 dark:bg-indigo-950/40 text-indigo-950 dark:text-indigo-200 shadow-xs"
                : "bg-slate-50/90 dark:bg-slate-800/70 border-slate-200/90 dark:border-slate-800 text-slate-700 dark:text-slate-200 hover:bg-white dark:hover:bg-slate-800 hover:border-slate-300 dark:hover:border-slate-700 hover:shadow-xs"
            }`}
          >
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-2xl flex items-center justify-center shrink-0 transition-transform duration-300 group-hover:scale-105 bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 border border-slate-200/80 dark:border-slate-800 shadow-xs">
                <Settings className="w-5.5 h-5.5 sm:w-6 sm:h-6" strokeWidth={2.2} />
              </div>
              <div className="min-w-0">
                <span className="text-xs sm:text-sm truncate font-black block leading-tight">
                  الإعدادات
                </span>
              </div>
            </div>
            <ChevronDown className="w-4 h-4 text-slate-400 -rotate-90 shrink-0" />
          </button>

          {/* Support & Customer Service */}
          <CustomerServiceButton className="w-full text-right p-3 sm:p-3.5 rounded-2xl border transition-all duration-200 flex items-center justify-between group cursor-pointer border-emerald-500/60 bg-emerald-50/70 dark:bg-emerald-950/30 hover:bg-emerald-100/80 dark:hover:bg-emerald-950/50 text-emerald-950 dark:text-emerald-200 hover:shadow-xs">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-2xl flex items-center justify-center shrink-0 transition-transform duration-300 group-hover:scale-105 bg-emerald-600 text-white shadow-md shadow-emerald-600/30">
                <Headphones className="w-5.5 h-5.5 sm:w-6 sm:h-6 text-amber-300 animate-pulse" strokeWidth={2.2} />
              </div>
              <div className="min-w-0">
                <span className="text-xs sm:text-sm truncate font-black block leading-tight text-emerald-900 dark:text-emerald-200">
                  الدعم الفني والخدمة المباشرة
                </span>
                <span className="text-[10.5px] sm:text-[11px] text-emerald-700/80 dark:text-emerald-400 font-medium block truncate mt-0.5">
                  خدمة عملاء على مدار الساعة
                </span>
              </div>
            </div>
            <span className="px-2.5 py-0.5 rounded-xl bg-emerald-200 dark:bg-emerald-900 text-emerald-800 dark:text-emerald-200 font-black text-xs shrink-0">
              24/7
            </span>
          </CustomerServiceButton>

          {/* Logout Button */}
          {onLogout && (
            <button
              type="button"
              onClick={() => {
                onLogout();
                if (inOverlay) setIsOverlayOpen(false);
              }}
              className="w-full text-right p-3 sm:p-3.5 rounded-2xl border transition-all duration-200 flex items-center justify-between group cursor-pointer bg-slate-50/90 dark:bg-slate-800/70 border-slate-200/90 dark:border-slate-800 text-slate-700 hover:text-red-600 dark:text-slate-200 dark:hover:text-red-400 hover:bg-red-50/50 dark:hover:bg-red-950/30 hover:border-red-200 dark:hover:border-red-900/50 hover:shadow-xs"
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-2xl flex items-center justify-center shrink-0 transition-transform duration-300 group-hover:scale-105 bg-white dark:bg-slate-900 text-rose-600 group-hover:text-rose-700 border border-slate-200/80 dark:border-slate-800 shadow-xs">
                  <LogOut className="w-5.5 h-5.5 sm:w-6 sm:h-6" strokeWidth={2.2} />
                </div>
                <div className="min-w-0">
                  <span className="text-xs sm:text-sm truncate font-black block leading-tight">
                    تسجيل الخروج من الحساب
                  </span>
                  <span className="text-[10.5px] sm:text-[11px] text-slate-500 dark:text-slate-400 font-medium block truncate mt-0.5">
                    إنهاء الجلسة الحالية
                  </span>
                </div>
              </div>
            </button>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <>
      {isOpen && (
        <>
          {/* Slide-out Drawer Overlay on Mobile (< lg) */}
          <div className="lg:hidden fixed inset-0 z-50 flex justify-start dir-rtl animate-in fade-in duration-200">
            <div
              className="fixed inset-0 bg-slate-950/80 backdrop-blur-xs transition-opacity"
              onClick={onClose}
            />
            <div className="relative z-10 w-80 sm:w-88 h-full bg-white dark:bg-slate-900 shadow-2xl border-l border-slate-200 dark:border-slate-800 flex flex-col p-4 space-y-3 overflow-y-auto no-scrollbar animate-in slide-in-from-right duration-250">
              <div className="flex items-center justify-between pb-2 border-b border-slate-200 dark:border-slate-800">
                <div className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400 font-extrabold text-xs">
                  <SlidersHorizontal className="w-4 h-4" />
                  <span>قائمة خيارات التحكم الإداري</span>
                </div>
                {onClose && (
                  <button
                    type="button"
                    onClick={onClose}
                    className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-600 dark:text-slate-300 transition-colors cursor-pointer"
                  >
                    <X className="w-5 h-5" />
                  </button>
                )}
              </div>

              {renderSidebarContent(true)}
            </div>
          </div>

          {/* Standard Sticky Fixed Column on Desktop (lg+) */}
          <div className="hidden lg:flex w-80 shrink-0 dir-rtl lg:sticky lg:top-0 lg:h-screen flex-col z-30 transition-all duration-300">
            <div className="bg-white dark:bg-slate-900 border-l border-slate-200 dark:border-slate-800 shadow-2xl p-3 sm:p-4 transition-all duration-300 h-full overflow-y-auto no-scrollbar space-y-3 flex flex-col">
              {/* Header with Title and Close Button */}
              <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400 font-black text-xs">
                  <SlidersHorizontal className="w-4 h-4" />
                  <span>قائمة التحكم الرئيسية</span>
                </div>
                {onClose && (
                  <button
                    type="button"
                    onClick={onClose}
                    className="p-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-rose-50 hover:text-rose-600 text-slate-500 dark:text-slate-400 transition-colors cursor-pointer text-[11px] font-bold flex items-center gap-1"
                    title="إخفاء قائمة التحكم (انقر للإخفاء)"
                  >
                    <X className="w-4 h-4" />
                    <span>إخفاء</span>
                  </button>
                )}
              </div>

              {renderSidebarContent(false)}
            </div>
          </div>
        </>
      )}

      {/* SUBSCRIPTION MODAL */}
      {isSubscriptionModalOpen && currentAccount && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
          <div className="max-w-3xl w-full bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden p-6 sm:p-8 space-y-6 relative my-8 dir-rtl">
            
            <button
              onClick={() => setIsSubscriptionModalOpen(false)}
              className="absolute top-5 left-5 p-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-600 dark:text-slate-400"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="space-y-2 text-right">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 font-extrabold text-xs">
                <Crown className="w-4 h-4" />
                <span>تفاصيل الاشتراك وإدارة الباقات B2B</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
                حالة اشتراك المتجر: {currentAccount.storeName}
              </h2>
            </div>

            {upgradeSuccessMsg && (
              <div className="p-3.5 rounded-2xl bg-emerald-500 text-white font-extrabold text-xs text-center animate-bounce">
                {upgradeSuccessMsg}
              </div>
            )}

            {/* Current Active Subscription Status Card */}
            {(() => {
              const sub = currentAccount.subscription;
              const calculateDaysRemaining = (endDateStr: string) => {
                if (!endDateStr) return 0;
                const end = new Date(endDateStr);
                const today = new Date();
                const diffTime = end.getTime() - today.getTime();
                const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                return diffDays > 0 ? diffDays : 0;
              };
              const daysLeft = calculateDaysRemaining(sub.endDate);
              const isYearly = sub.billingCycle === "YEARLY" || !sub.billingCycle;

              return (
                <div className="p-5 rounded-2xl bg-slate-900 text-white space-y-4 border border-indigo-800 shadow-xl">
                  <div className="flex flex-wrap items-center justify-between gap-3 border-b border-indigo-800 pb-3">
                    <div>
                      <span className="text-[10px] text-indigo-300 font-bold block">تفاصيل الباقة ونوع الاشتراك:</span>
                      <div className="text-lg font-black text-amber-300 flex items-center gap-2 flex-wrap">
                        <span>{sub.planNameAr}</span>
                        <span className="px-2 py-0.5 rounded-md bg-indigo-800 text-indigo-100 text-[10px] font-black border border-indigo-600">
                          {isYearly ? "اشتراك سنوي 📅" : "اشتراك شهري 🗓️"}
                        </span>
                        <span className="px-2 py-0.5 rounded-md bg-emerald-500 text-slate-950 text-[10px] font-black">
                          نشط 🟢
                        </span>
                      </div>
                    </div>

                    <div className="text-left font-mono space-y-1">
                      <div className="text-sm font-extrabold text-amber-300">
                        {isYearly 
                          ? `${(sub.priceMonthly * 10).toLocaleString("ar-YE")} ر.ي / سنة`
                          : `${sub.priceMonthly.toLocaleString("ar-YE")} ر.ي / شهر`}
                      </div>
                      <div className="text-[11px] text-emerald-400 font-extrabold flex items-center gap-1 justify-end">
                        <Clock className="w-3.5 h-3.5 text-emerald-400" />
                        <span>متبقي: {daysLeft} يوم</span>
                      </div>
                    </div>
                  </div>

                  {/* Dates Grid: Start Date, Expiry Date, Remaining Validity */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
                    <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-right">
                      <span className="text-[10px] text-slate-400 font-bold block flex items-center gap-1">
                        <Calendar className="w-3 h-3 text-indigo-400" />
                        تاريخ بداية الاشتراك:
                      </span>
                      <strong className="text-white text-xs font-mono font-bold block mt-0.5">
                        {sub.startDate || "غير محدد"}
                      </strong>
                    </div>

                    <div className="p-2.5 rounded-xl bg-slate-950 border border-amber-500/40 text-right">
                      <span className="text-[10px] text-amber-400 font-bold block flex items-center gap-1">
                        <Calendar className="w-3 h-3 text-amber-400" />
                        تاريخ صلاحية الاشتراك (الانتهاء):
                      </span>
                      <strong className="text-amber-300 text-xs font-mono font-black block mt-0.5">
                        {sub.endDate || "غير محدد"}
                      </strong>
                    </div>

                    <div className="p-2.5 rounded-xl bg-slate-950 border border-indigo-800 text-right">
                      <span className="text-[10px] text-indigo-300 font-bold block flex items-center gap-1">
                        <Clock className="w-3 h-3 text-emerald-400" />
                        حالة التجديد والصلاحية:
                      </span>
                      <strong className="text-emerald-400 text-xs font-bold block mt-0.5">
                        {daysLeft > 0 ? `صالح لمدة ${daysLeft} يوماً` : "منتهي الاشتراك ⚠️"}
                      </strong>
                    </div>
                  </div>

                  {/* Limits */}
                  <div className="grid grid-cols-3 gap-2 text-center text-xs">
                    <div className="p-2 rounded-xl bg-indigo-950 border border-indigo-800">
                      <span className="text-[10px] text-indigo-300 block">حد المستودعات</span>
                      <strong className="text-amber-300 text-xs font-black">
                        {sub.maxWarehouses} مستودعات
                      </strong>
                    </div>

                    <div className="p-2 rounded-xl bg-indigo-950 border border-indigo-800">
                      <span className="text-[10px] text-indigo-300 block">حد الأصناف</span>
                      <strong className="text-amber-300 text-xs font-black">
                        {sub.maxItems} صنف
                      </strong>
                    </div>

                    <div className="p-2 rounded-xl bg-indigo-950 border border-indigo-800">
                      <span className="text-[10px] text-indigo-300 block">نقاط POS</span>
                      <strong className="text-amber-300 text-xs font-black">
                        {sub.maxPOSRegisters} نقاط
                      </strong>
                    </div>
                  </div>

                  {/* Unlocked features list */}
                  <div className="pt-1">
                    <span className="text-[11px] text-indigo-200 font-bold block mb-1">المميزات المفعلة في باقتك:</span>
                    <div className="flex flex-wrap gap-2 text-[10px]">
                      {sub.features.map((feat, idx) => (
                        <span key={idx} className="px-2.5 py-1 rounded-lg bg-indigo-900 text-indigo-100 border border-indigo-700 font-bold">
                          ✔️ {feat}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              );
            })()}

            {/* Upgrade Plan Options with Monthly vs Yearly Tabs */}
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200 dark:border-slate-800 pb-3">
                <h3 className="font-black text-sm text-slate-900 dark:text-white">
                  أقسام الاشتراك وترقية الباقة:
                </h3>

                {/* Billing Cycle Selector Tabs (Monthly vs Yearly) */}
                <div className="flex items-center gap-1.5 p-1 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-extrabold">
                  <button
                    type="button"
                    onClick={() => setSelectedBillingCycle("MONTHLY")}
                    className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 cursor-pointer ${
                      selectedBillingCycle === "MONTHLY"
                        ? "bg-indigo-600 text-white shadow-xs"
                        : "text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white"
                    }`}
                  >
                    <Calendar className="w-3.5 h-3.5" />
                    <span>قسم الاشتراك الشهري 🗓️</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setSelectedBillingCycle("YEARLY")}
                    className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 cursor-pointer relative ${
                      selectedBillingCycle === "YEARLY"
                        ? "bg-indigo-600 text-white shadow-xs"
                        : "text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white"
                    }`}
                  >
                    <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                    <span>قسم الاشتراك السنوي ⭐</span>
                    <span className="px-1.5 py-0.2 rounded-full bg-amber-400 text-slate-950 text-[9px] font-black">
                      خصم شهرين 🎉
                    </span>
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                
                {/* Starter */}
                <div
                  className={`p-4 rounded-2xl border transition-all text-right space-y-3 ${
                    currentAccount.subscription.planId === "STARTER" && (currentAccount.subscription.billingCycle || "YEARLY") === selectedBillingCycle
                      ? "border-indigo-500 bg-indigo-50 dark:bg-indigo-950 ring-2 ring-indigo-500"
                      : "border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800"
                  }`}
                >
                  <div>
                    <div className="font-black text-xs text-slate-900 dark:text-white">باقة البداية والنمو</div>
                    <div className="text-xs text-indigo-600 dark:text-indigo-400 font-extrabold mt-0.5">
                      {selectedBillingCycle === "YEARLY" ? (
                        <>
                          <span className="text-sm font-black text-indigo-600 dark:text-indigo-400">500,000 ر.ي / سنة</span>
                          <span className="block text-[9.5px] text-slate-500 line-through">600,000 ر.ي (توفير 100 ألف)</span>
                        </>
                      ) : (
                        <span className="text-sm font-black text-indigo-600 dark:text-indigo-400">50,000 ر.ي / شهر</span>
                      )}
                    </div>
                  </div>
                  <ul className="text-[10px] text-slate-600 dark:text-slate-400 space-y-1 font-bold">
                    <li>• مستودعين بحد أقصى</li>
                    <li>• 500 صنف تجاري</li>
                    <li>• إدارة المخزون الأساسية</li>
                    <li>• {selectedBillingCycle === "YEARLY" ? "صلاحية كاملة لمدة 12 شهراً" : "تجديد شهري تلقائي"}</li>
                  </ul>
                  <button
                    onClick={() => handlePlanUpgradeSubmit("STARTER", selectedBillingCycle)}
                    className="w-full py-2 rounded-xl bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 text-slate-900 dark:text-white font-extrabold text-xs transition-colors"
                  >
                    {currentAccount.subscription.planId === "STARTER" && (currentAccount.subscription.billingCycle || "YEARLY") === selectedBillingCycle
                      ? "الباقة والاشتراك الحالي"
                      : `اختيار الباقة (${selectedBillingCycle === "YEARLY" ? "سنوي" : "شهري"})`}
                  </button>
                </div>

                {/* Professional */}
                <div
                  className={`p-4 rounded-2xl border transition-all text-right space-y-3 relative ${
                    currentAccount.subscription.planId === "PROFESSIONAL" && (currentAccount.subscription.billingCycle || "YEARLY") === selectedBillingCycle
                      ? "border-amber-500 bg-amber-50 dark:bg-amber-950 ring-2 ring-amber-500"
                      : "border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800"
                  }`}
                >
                  <span className="absolute -top-2.5 left-2 px-2 py-0.5 rounded bg-amber-500 text-slate-950 text-[9px] font-black">
                    الخيار الموصى به ⭐
                  </span>
                  <div>
                    <div className="font-black text-xs text-slate-900 dark:text-white">الباقة الاحترافية الذهبية</div>
                    <div className="text-xs text-amber-600 dark:text-amber-400 font-extrabold mt-0.5">
                      {selectedBillingCycle === "YEARLY" ? (
                        <>
                          <span className="text-sm font-black text-amber-600 dark:text-amber-400">1,500,000 ر.ي / سنة</span>
                          <span className="block text-[9.5px] text-slate-500 line-through">1,800,000 ر.ي (توفير 300 ألف)</span>
                        </>
                      ) : (
                        <span className="text-sm font-black text-amber-600 dark:text-amber-400">150,000 ر.ي / شهر</span>
                      )}
                    </div>
                  </div>
                  <ul className="text-[10px] text-slate-600 dark:text-slate-400 space-y-1 font-bold">
                    <li>• 10 مستودعات موحدة</li>
                    <li>• 5,000 صنف تجاري</li>
                    <li>• توقعات ذكية دقيقة 100%</li>
                    <li>• {selectedBillingCycle === "YEARLY" ? "صلاحية سنوية + ربط المصانع" : "تجديد شهري ميسر"}</li>
                  </ul>
                  <button
                    onClick={() => handlePlanUpgradeSubmit("PROFESSIONAL", selectedBillingCycle)}
                    className="w-full py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs transition-colors"
                  >
                    {currentAccount.subscription.planId === "PROFESSIONAL" && (currentAccount.subscription.billingCycle || "YEARLY") === selectedBillingCycle
                      ? "الباقة والاشتراك الحالي"
                      : `ترقية للباقة الذهبية (${selectedBillingCycle === "YEARLY" ? "سنوي" : "شهري"}) ⚡`}
                  </button>
                </div>

                {/* Enterprise */}
                <div
                  className={`p-4 rounded-2xl border transition-all text-right space-y-3 ${
                    currentAccount.subscription.planId === "ENTERPRISE_VIP" && (currentAccount.subscription.billingCycle || "YEARLY") === selectedBillingCycle
                      ? "border-emerald-500 bg-emerald-50 dark:bg-emerald-950 ring-2 ring-emerald-500"
                      : "border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800"
                  }`}
                >
                  <div>
                    <div className="font-black text-xs text-slate-900 dark:text-white">باقة المؤسسات الماسية VIP</div>
                    <div className="text-xs text-emerald-600 dark:text-emerald-400 font-extrabold mt-0.5">
                      {selectedBillingCycle === "YEARLY" ? (
                        <>
                          <span className="text-sm font-black text-emerald-600 dark:text-emerald-400">3,500,000 ر.ي / سنة</span>
                          <span className="block text-[9.5px] text-slate-500 line-through">4,200,000 ر.ي (توفير 700 ألف)</span>
                        </>
                      ) : (
                        <span className="text-sm font-black text-emerald-600 dark:text-emerald-400">350,000 ر.ي / شهر</span>
                      )}
                    </div>
                  </div>
                  <ul className="text-[10px] text-slate-600 dark:text-slate-400 space-y-1 font-bold">
                    <li>• 50 مستودع للشركات الكبرى</li>
                    <li>• 50,000 صنف مع تحليلات كبار التجار</li>
                    <li>• مدير حساب مخصص والدعم الفوري</li>
                    <li>• {selectedBillingCycle === "YEARLY" ? "صلاحية 365 يوماً كاملة" : "تجديد شهري VIP"}</li>
                  </ul>
                  <button
                    onClick={() => handlePlanUpgradeSubmit("ENTERPRISE_VIP", selectedBillingCycle)}
                    className="w-full py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs transition-colors"
                  >
                    {currentAccount.subscription.planId === "ENTERPRISE_VIP" && (currentAccount.subscription.billingCycle || "YEARLY") === selectedBillingCycle
                      ? "الباقة والاشتراك الحالي"
                      : `ترقية للباقة الماسية (${selectedBillingCycle === "YEARLY" ? "سنوي" : "شهري"}) 💎`}
                  </button>
                </div>

              </div>
            </div>

            {/* Platform Admin Contact & Location Info */}
            <PlatformInfoBox variant="banner" title="بيانات التواصل مع إدارة المنصة المركزية B2B" />

            <div className="pt-2 text-center">
              <button
                onClick={() => setIsSubscriptionModalOpen(false)}
                className="px-6 py-2.5 rounded-2xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold text-xs"
              >
                إغلاق
              </button>
            </div>

          </div>
        </div>
      )}

      {/* Merchant Settings & Location Modal */}
      {currentAccount && (
        <MerchantSettingsModal
          isOpen={isSettingsModalOpen}
          onClose={() => setIsSettingsModalOpen(false)}
          currentAccount={currentAccount}
        />
      )}
    </>
  );
};
