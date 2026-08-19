import React from "react";
import {
  X,
  SlidersHorizontal,
  Store,
  Factory as FactoryIcon,
  Truck,
  ShieldCheck,
  ShoppingBag,
  Package,
  Building2,
  Layers,
  Boxes,
  PackageCheck,
  History,
  Building,
  Users,
  RotateCcw,
  Sun,
  Moon,
  LogOut,
  Calendar,
  Zap,
  ChevronLeft,
  CheckCircle2,
} from "lucide-react";
import { AppRole, WholesalerTab } from "./AppPortalSwitcherModal";
import { Factory, MerchantAccount, FactoryAccount } from "../../types";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  activeRole: AppRole;
  setActiveRole: (role: AppRole) => void;
  selectedFactoryId: string;
  setSelectedFactoryId: (id: string) => void;
  activeWholesalerViewTab: WholesalerTab;
  setActiveWholesalerViewTab: (tab: WholesalerTab) => void;
  currentMerchantAccount: MerchantAccount | null;
  currentFactoryAccount: FactoryAccount | null;
  onMerchantLogout: () => void;
  onFactoryLogout: () => void;
  factories: Factory[];
  productsCount: number;
  ordersCount: number;
  salesCount: number;
  cartCount: number;
  onOpenCart: () => void;
  isDarkMode?: boolean;
  onToggleDarkMode?: () => void;
  onResetData: () => void;
}

export const UniversalControlDrawer: React.FC<Props> = ({
  isOpen,
  onClose,
  activeRole,
  setActiveRole,
  selectedFactoryId,
  setSelectedFactoryId,
  activeWholesalerViewTab,
  setActiveWholesalerViewTab,
  currentMerchantAccount,
  currentFactoryAccount,
  onMerchantLogout,
  onFactoryLogout,
  factories,
  productsCount,
  ordersCount,
  salesCount,
  cartCount,
  onOpenCart,
  isDarkMode,
  onToggleDarkMode,
  onResetData,
}) => {
  if (!isOpen) return null;

  const roles = [
    {
      id: "WHOLESALER" as AppRole,
      title: "منصة التاجر والمخازن",
      subTitle: "المبيعات والـ POS وطلب الجملة",
      icon: Store,
      badge: "تطبيق التاجر 🏪",
      color: "emerald",
      colorClass: "bg-emerald-600 text-white",
      activeBg: "bg-emerald-50 dark:bg-emerald-950/80 border-emerald-500 ring-2 ring-emerald-500/20",
    },
    {
      id: "FACTORY" as AppRole,
      title: "منصة المصانع الموردة",
      subTitle: "خطوط الإنتاج والأسعار والطلبات",
      icon: FactoryIcon,
      badge: "تطبيق المصنع 🏭",
      color: "indigo",
      colorClass: "bg-indigo-600 text-white",
      activeBg: "bg-indigo-50 dark:bg-indigo-950/80 border-indigo-500 ring-2 ring-indigo-500/20",
    },
    {
      id: "DRIVER" as AppRole,
      title: "تطبيق السائق والناقل",
      subTitle: "استلام الشحنات وتتبع GPS",
      icon: Truck,
      badge: "تطبيق الناقل 🚚",
      color: "amber",
      colorClass: "bg-amber-500 text-slate-950",
      activeBg: "bg-amber-50 dark:bg-amber-950/80 border-amber-500 ring-2 ring-amber-500/20",
    },
    {
      id: "ADMIN" as AppRole,
      title: "لوحة تحكم الإدارة العامة",
      subTitle: "إدارة المصانع والتجار والإحصائيات",
      icon: ShieldCheck,
      badge: "لوحة الإدارة 🛡️",
      color: "purple",
      colorClass: "bg-purple-600 text-white",
      activeBg: "bg-purple-50 dark:bg-purple-950/80 border-purple-500 ring-2 ring-purple-500/20",
    },
  ];

  const wholesalerWindows = [
    { id: "SALES", label: "نقطة بيع الزبائن والكاشير (POS)", icon: ShoppingBag, color: "text-emerald-500" },
    { id: "EMPLOYEES", label: "ملفات وطاقم الموظفين", icon: Users, color: "text-blue-500" },
    { id: "ITEMS_PRICING", label: "إدارة وتسعير الأصناف المحلية", icon: Package, color: "text-indigo-500" },
    { id: "WAREHOUSES", label: "المخازن والمستودعات الفروعية", icon: Building2, color: "text-blue-500" },
    { id: "UNIFIED_INVENTORY", label: "تتبع المخزون والنواقص الموحد", icon: Layers, color: "text-amber-500" },
    { id: "CATALOG", label: "كتالوج المصانع والطلب بالجملة", icon: Boxes, color: "text-sky-500" },
    { id: "ACTIVE_ORDERS", label: "الطلبيات الجديدة والجارية", icon: PackageCheck, color: "text-teal-500" },
    { id: "ORDER_HISTORY", label: "سجل الطلبات الأرشيفية المكتملة", icon: History, color: "text-purple-500" },
    { id: "DIRECTORY", label: "دليل المصانع والشركات المعتمدة", icon: Building, color: "text-rose-500" },
  ];

  return (
    <div className="fixed inset-0 z-50 flex justify-start dir-rtl animate-in fade-in duration-200">
      {/* Backdrop overlay */}
      <div
        className="fixed inset-0 bg-slate-950/80 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />

      {/* Drawer Container */}
      <div className="relative z-10 w-84 sm:w-96 max-w-[90vw] h-full bg-white dark:bg-slate-900 shadow-2xl border-l border-slate-200 dark:border-slate-800 flex flex-col p-4 sm:p-5 space-y-4 overflow-y-auto animate-in slide-in-from-right duration-250">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-indigo-600 text-white shadow-xs">
              <SlidersHorizontal className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-black text-sm text-slate-900 dark:text-white">
                قائمة التحكم الموحدة
              </h3>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">
                الوصول السريع للنوافذ والخدمات
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-rose-50 hover:text-rose-600 text-slate-600 dark:text-slate-300 transition-colors cursor-pointer"
            title="إغلاق قائمة التحكم"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 1. Quick Role Navigation */}
        <div className="space-y-2">
          <span className="text-[11px] font-black text-slate-400 uppercase tracking-wider block">
            المنصة النشطة والبرامج
          </span>
          <div className="grid grid-cols-2 gap-2">
            {roles.map((r) => {
              const Icon = r.icon;
              const isActive = activeRole === r.id;
              return (
                <button
                  key={r.id}
                  type="button"
                  onClick={() => {
                    setActiveRole(r.id);
                    onClose();
                  }}
                  className={`p-2.5 rounded-2xl border text-right transition-all flex flex-col justify-between gap-1.5 cursor-pointer ${
                    isActive
                      ? `${r.activeBg} font-black`
                      : "bg-slate-50 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700/80 hover:bg-slate-100 dark:hover:bg-slate-800"
                  }`}
                >
                  <div className="flex items-center justify-between w-full">
                    <div className={`p-1.5 rounded-xl ${r.colorClass}`}>
                      <Icon className="w-4 h-4" />
                    </div>
                    {isActive && <CheckCircle2 className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />}
                  </div>
                  <div>
                    <span className="text-xs font-black text-slate-900 dark:text-white block truncate">
                      {r.title}
                    </span>
                    <span className="text-[10px] text-slate-400 block truncate">
                      {r.badge}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* 2. Active Role Specific Sub-Navigation */}
        {activeRole === "WHOLESALER" && (
          <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800">
            <span className="text-[11px] font-black text-slate-400 uppercase tracking-wider block">
              نوافذ وأقسام التاجر المباشرة
            </span>
            <div className="space-y-1">
              {wholesalerWindows.map((win) => {
                const Icon = win.icon;
                const isActive = activeWholesalerViewTab === win.id;
                return (
                  <button
                    key={win.id}
                    type="button"
                    onClick={() => {
                      setActiveWholesalerViewTab(win.id as WholesalerTab);
                      onClose();
                    }}
                    className={`w-full p-2.5 rounded-xl text-right font-bold text-xs flex items-center justify-between transition-all cursor-pointer ${
                      isActive
                        ? "bg-emerald-600 text-white shadow-xs"
                        : "bg-slate-50 dark:bg-slate-800/50 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-800 dark:text-slate-200"
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <Icon className={`w-4 h-4 shrink-0 ${isActive ? "text-white" : win.color}`} />
                      <span className="truncate">{win.label}</span>
                    </div>
                    <ChevronLeft className="w-3.5 h-3.5 opacity-60 shrink-0" />
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Factory Selection if in Factory Role */}
        {activeRole === "FACTORY" && (
          <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800">
            <span className="text-[11px] font-black text-slate-400 uppercase tracking-wider block">
              تبديل المصنع النشط
            </span>
            <div className="space-y-1.5">
              {factories.map((fac) => (
                <button
                  key={fac.id}
                  type="button"
                  onClick={() => {
                    setSelectedFactoryId(fac.id);
                    onClose();
                  }}
                  className={`w-full p-2.5 rounded-xl text-right font-bold text-xs flex items-center justify-between transition-all cursor-pointer ${
                    selectedFactoryId === fac.id
                      ? "bg-indigo-600 text-white shadow-xs"
                      : "bg-slate-50 dark:bg-slate-800/50 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-800 dark:text-slate-200"
                  }`}
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <FactoryIcon className="w-4 h-4 shrink-0" />
                    <div className="min-w-0">
                      <span className="block truncate">{fac.name}</span>
                      <span className="text-[10px] opacity-75 block">{fac.categoryNameAr || fac.category}</span>
                    </div>
                  </div>
                  {selectedFactoryId === fac.id && <span className="text-[10px] bg-white/20 px-1.5 py-0.5 rounded-md">المحدد</span>}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* 3. System Tools & Quick Actions */}
        <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800 mt-auto">
          <span className="text-[11px] font-black text-slate-400 uppercase tracking-wider block">
            إعدادات النظام والبيانات
          </span>

          <div className="space-y-1.5">
            {onToggleDarkMode && (
              <button
                type="button"
                onClick={onToggleDarkMode}
                className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs font-bold flex items-center justify-between cursor-pointer transition-colors"
              >
                <div className="flex items-center gap-2">
                  {isDarkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-600" />}
                  <span>{isDarkMode ? "الوضع النهاري" : "الوضع الليلي"}</span>
                </div>
                <span className="text-[10px] text-slate-400">{isDarkMode ? "نهاري" : "ليلي"}</span>
              </button>
            )}

            <button
              type="button"
              onClick={() => {
                onResetData();
                onClose();
              }}
              className="w-full p-2.5 rounded-xl bg-rose-50 dark:bg-rose-950/50 hover:bg-rose-100 text-rose-600 dark:text-rose-400 text-xs font-bold flex items-center justify-between cursor-pointer transition-colors border border-rose-200 dark:border-rose-800"
            >
              <div className="flex items-center gap-2">
                <RotateCcw className="w-4 h-4" />
                <span>إعادة ضبط بيانات النظام</span>
              </div>
              <span className="text-[10px] font-mono">Default</span>
            </button>

            {/* Logout actions */}
            {activeRole === "WHOLESALER" && currentMerchantAccount && (
              <button
                type="button"
                onClick={() => {
                  onMerchantLogout();
                  onClose();
                }}
                className="w-full p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-red-50 hover:text-red-600 text-slate-700 dark:text-slate-300 text-xs font-bold flex items-center justify-between cursor-pointer transition-colors"
              >
                <div className="flex items-center gap-2">
                  <LogOut className="w-4 h-4" />
                  <span>تسجيل الخروج من حساب التاجر</span>
                </div>
              </button>
            )}

            {activeRole === "FACTORY" && currentFactoryAccount && (
              <button
                type="button"
                onClick={() => {
                  onFactoryLogout();
                  onClose();
                }}
                className="w-full p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-red-50 hover:text-red-600 text-slate-700 dark:text-slate-300 text-xs font-bold flex items-center justify-between cursor-pointer transition-colors"
              >
                <div className="flex items-center gap-2">
                  <LogOut className="w-4 h-4" />
                  <span>تسجيل الخروج من حساب المصنع</span>
                </div>
              </button>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};
