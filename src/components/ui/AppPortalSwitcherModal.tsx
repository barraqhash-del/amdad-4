import React from "react";
import {
  ShoppingBag,
  Factory,
  Truck,
  ShieldCheck,
  X,
  Sparkles,
  ArrowLeft,
  CheckCircle2,
  Cpu,
  Layers,
  Server,
  Store,
  Boxes,
  PackageCheck,
  Building2,
  Headphones,
  RotateCcw,
  Sliders,
  Sun,
  Moon,
  Maximize2,
  Package,
  History,
  Building,
  Users,
} from "lucide-react";
import { storeService } from "../../services/storeService";

export type AppRole = "WHOLESALER" | "FACTORY" | "DRIVER" | "ADMIN";
export type WholesalerTab =
  | "SALES"
  | "EMPLOYEES"
  | "ITEMS_PRICING"
  | "WAREHOUSES"
  | "UNIFIED_INVENTORY"
  | "CATALOG"
  | "ACTIVE_ORDERS"
  | "ORDER_HISTORY"
  | "DIRECTORY"
  | "SETTINGS"
  | "MERCHANT_HUB"
  | "TRACKER";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  activeRole: AppRole;
  onSelectRole: (role: AppRole) => void;
  activeWholesalerTab?: WholesalerTab;
  onSelectWholesalerTab?: (tab: WholesalerTab) => void;
  isDarkMode?: boolean;
  onToggleDarkMode?: () => void;
}

export const AppPortalSwitcherModal: React.FC<Props> = ({
  isOpen,
  onClose,
  activeRole,
  onSelectRole,
  activeWholesalerTab,
  onSelectWholesalerTab,
  isDarkMode,
  onToggleDarkMode,
}) => {
  if (!isOpen) return null;

  const programs = [
    {
      id: "WHOLESALER" as AppRole,
      title: "منصة تاجر الجملة والمحلات",
      subtitle: "Merchant & Wholesaler Hub",
      description: "إدارة مبيعات وتوزيع المحل والمخازن، متابعة المخزون، وشراء البضائع بالجملة مباشرة من المصانع.",
      icon: ShoppingBag,
      color: "emerald",
      badge: "تطبيق التاجر 🏪",
      features: ["مركز المبيعات والمخازن", "كتالوج المصانع المباشر", "تتبع شحنات المشتريات"],
      bgColor: "bg-emerald-500/10 dark:bg-emerald-950/40",
      borderColor: "border-emerald-500/30 dark:border-emerald-500/40",
      accentColor: "bg-emerald-600 text-white",
      textColor: "text-emerald-800 dark:text-emerald-300",
    },
    {
      id: "FACTORY" as AppRole,
      title: "منصة المصانع والشركات الموردة",
      subtitle: "Factory & Manufacturer Portal",
      description: "استقبال طلبات الشراء بالجملة، جرد المنتجات والأسعار، معالجة خطوط الشحن وإسنادها للسائقين.",
      icon: Factory,
      color: "indigo",
      badge: "تطبيق المصنع 🏭",
      features: ["كتالوج المنتجات والأسعار", "جدولة خطوط الإنتاج", "إسناد الشحنات للناقلين"],
      bgColor: "bg-indigo-500/10 dark:bg-indigo-950/40",
      borderColor: "border-indigo-500/30 dark:border-indigo-500/40",
      accentColor: "bg-indigo-600 text-white",
      textColor: "text-indigo-800 dark:text-indigo-300",
    },
    {
      id: "DRIVER" as AppRole,
      title: "تطبيق السائق والخدمات اللوجستية",
      subtitle: "Driver & Logistics Terminal",
      description: "استلام طلبات النقل، التوجيه بالخريطة التفاعلية GPS، وإثبات تسليم الشحنة للتاجر بالكود.",
      icon: Truck,
      color: "amber",
      badge: "تطبيق الناقل 🚚",
      features: ["خرائط ملاحة GPS دقيقة", "تتبع الشحنات الفوري", "إثبات التسليم بالكود"],
      bgColor: "bg-amber-500/10 dark:bg-amber-950/40",
      borderColor: "border-amber-500/30 dark:border-amber-500/40",
      accentColor: "bg-amber-500 text-slate-950",
      textColor: "text-amber-900 dark:text-amber-300",
    },
    {
      id: "ADMIN" as AppRole,
      title: "لوحة تحكم الإدارة العامة",
      subtitle: "Central Control Dashboard",
      description: "إدارة الحسابات، توثيق السجلات التجارية، مراقبة حركة المبيعات وتدفق النظام الشامل.",
      icon: ShieldCheck,
      color: "purple",
      badge: "لوحة الإدارة 🛡️",
      features: ["توثيق التجار والمصانع", "إحصائيات المنصة الحية", "التحكم بالصلاحيات"],
      bgColor: "bg-purple-500/10 dark:bg-purple-950/40",
      borderColor: "border-purple-500/30 dark:border-purple-500/40",
      accentColor: "bg-purple-600 text-white",
      textColor: "text-purple-800 dark:text-purple-300",
    },
  ];

  const wholesalerSubSections = [
    {
      id: "SALES" as WholesalerTab,
      title: "نقطة بيع الزبائن والكاشير (POS)",
      sub: "إصدار فواتير البيع المباشر وطباعة الإيصالات والباركود",
      icon: ShoppingBag,
      color: "text-emerald-400",
    },
    {
      id: "EMPLOYEES" as WholesalerTab,
      title: "ملفات وطاقم الموظفين",
      sub: "دليل الكادر، مسير الرواتب، السلف، والجزاءات والحضور",
      icon: Users,
      color: "text-sky-400",
    },
    {
      id: "ITEMS_PRICING" as WholesalerTab,
      title: "إدارة وتسعير الأصناف المحلية",
      sub: "تسعير المنتجات بالكرتون والحبة وتحديد هوامش الربح",
      icon: Package,
      color: "text-indigo-400",
    },
    {
      id: "WAREHOUSES" as WholesalerTab,
      title: "المخازن والمستودعات الفروعية",
      sub: "إدارة المستودعات المستقلة والتحويل المخزني بين الفروع",
      icon: Building2,
      color: "text-blue-400",
    },
    {
      id: "UNIFIED_INVENTORY" as WholesalerTab,
      title: "تتبع المخزون والنواقص الموحد",
      sub: "تنبيهات الأصناف المنخفضة وخوارزمية إعادة الطلب",
      icon: Layers,
      color: "text-amber-400",
    },
    {
      id: "CATALOG" as WholesalerTab,
      title: "كتالوج المصانع والطلب بالجملة",
      sub: "كتالوج المنتجات الشامل والشراء المباشر بسعر المصنع",
      icon: Boxes,
      color: "text-sky-400",
    },
    {
      id: "ACTIVE_ORDERS" as WholesalerTab,
      title: "الطلبيات الجديدة والجارية",
      sub: "متابعة تجهيز الشحنات والتتبع الحي لشاحنات النقل",
      icon: PackageCheck,
      color: "text-teal-400",
    },
    {
      id: "ORDER_HISTORY" as WholesalerTab,
      title: "سجل الطلبات الأرشيفية المكتملة",
      sub: "أرشيف الفواتير المكتملة وتاريخ الشحنات المستلمة",
      icon: History,
      color: "text-purple-400",
    },
    {
      id: "DIRECTORY" as WholesalerTab,
      title: "دليل المصانع والموردين المعتمدين",
      sub: "استكشاف أحدث الشركات والمصانع المتاحة للنظام",
      icon: Building,
      color: "text-rose-400",
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-slate-950/85 backdrop-blur-xl dir-rtl overflow-y-auto animate-in fade-in slide-in-from-top-4 duration-300">
      
      {/* Top Bar Header */}
      <div className="sticky top-0 z-10 bg-slate-900/95 border-b border-slate-800 text-white px-4 sm:px-8 py-4 flex items-center justify-between shadow-2xl">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-400 text-slate-950 font-black shadow-lg shadow-emerald-500/20">
            <Layers className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="font-black text-lg sm:text-xl text-white">
                شريط التحكم المركزي والبرامج المنسدلة
              </h2>
              <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-md bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                Full-Height Tech Hub
              </span>
            </div>
            <p className="text-xs text-slate-400 font-medium">
              اختر البرنامج المطلوب أو القسم التقني المناسب للوصول السريع الفوري
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {onToggleDarkMode && (
            <button
              type="button"
              onClick={onToggleDarkMode}
              className="p-2.5 rounded-xl bg-slate-800 text-slate-200 hover:bg-slate-700 transition-colors text-xs font-bold flex items-center gap-2"
            >
              {isDarkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4" />}
              <span className="hidden sm:inline">{isDarkMode ? "الوضع الصباحي" : "الوضع الليلي"}</span>
            </button>
          )}

          <button
            type="button"
            onClick={onClose}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-extrabold text-xs transition-colors shadow-md"
          >
            <span>إغلاق القائمة</span>
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Full Screen Body Container */}
      <div className="w-full px-4 sm:px-8 py-6 space-y-8 flex-1">
        
        {/* Section 1: Main Platform Programs */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Cpu className="w-5 h-5 text-emerald-400" />
              <h3 className="font-extrabold text-base sm:text-lg text-white">
                1. اختيار وتغيير برنامج النظام (تطبيقات المنصة)
              </h3>
            </div>
            <span className="text-xs text-slate-400 font-medium">
              البرنامج الحالي النشط: <strong className="text-emerald-400 font-bold">{programs.find(p => p.id === activeRole)?.title}</strong>
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {programs.map((prog) => {
              const IconComponent = prog.icon;
              const isSelected = activeRole === prog.id;

              return (
                <button
                  key={prog.id}
                  type="button"
                  onClick={() => {
                    onSelectRole(prog.id);
                    onClose();
                  }}
                  className={`group relative text-right p-5 rounded-2xl border-2 transition-all duration-200 flex flex-col justify-between ${
                    isSelected
                      ? `${prog.bgColor} ${prog.borderColor} shadow-xl ring-2 ring-emerald-500/40 scale-[1.02]`
                      : "bg-slate-900/80 border-slate-800 hover:bg-slate-800/90 hover:border-slate-700"
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <div className={`p-3 rounded-2xl ${prog.accentColor} shadow-md`}>
                        <IconComponent className="w-6 h-6" />
                      </div>

                      {isSelected ? (
                        <span className="flex items-center gap-1 px-2.5 py-1 rounded-xl bg-emerald-600 text-white font-black text-[10.5px]">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>تطبيق نشط</span>
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded-lg bg-slate-800 text-slate-300 font-bold text-[10px]">
                          {prog.badge}
                        </span>
                      )}
                    </div>

                    <h4 className="font-extrabold text-white text-base group-hover:text-emerald-400 transition-colors mb-1">
                      {prog.title}
                    </h4>
                    <p className="text-xs text-slate-400 leading-relaxed font-medium mb-3">
                      {prog.description}
                    </p>
                  </div>

                  <div className="pt-3 border-t border-slate-800 flex items-center justify-between text-xs font-bold text-emerald-400">
                    <span>فتح التطبيق المباشر</span>
                    <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Section 2: Wholesaler / Merchant View Sections & Warehouses Navigation */}
        {activeRole === "WHOLESALER" && (
          <div className="p-5 rounded-3xl bg-slate-900/90 border border-slate-800 shadow-xl space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Store className="w-5 h-5 text-emerald-400" />
                <h3 className="font-extrabold text-base text-white">
                  2. أقسام وأدوات تطبيق التاجر والمخازن
                </h3>
              </div>
              <span className="text-xs text-slate-400">تنقل فوري بين أقسام تطبيق التاجر</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {wholesalerSubSections.map((sub) => {
                const SubIcon = sub.icon;
                const isCurrentTab = activeWholesalerTab === sub.id;

                return (
                  <button
                    key={sub.id}
                    type="button"
                    onClick={() => {
                      if (onSelectWholesalerTab) onSelectWholesalerTab(sub.id);
                      onClose();
                    }}
                    className={`p-4 rounded-2xl border text-right transition-all flex flex-col justify-between ${
                      isCurrentTab
                        ? "bg-emerald-600/20 border-emerald-500/50 text-white shadow-md"
                        : "bg-slate-800/60 border-slate-700/80 hover:bg-slate-800 text-slate-300"
                    }`}
                  >
                    <div className="flex items-center gap-3 mb-2">
                      <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-700">
                        <SubIcon className={`w-5 h-5 ${sub.color}`} />
                      </div>
                      <div>
                        <h4 className="font-bold text-sm text-white">{sub.title}</h4>
                      </div>
                    </div>
                    <p className="text-[11px] text-slate-400 leading-snug">{sub.sub}</p>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Section 3: Quick System Controls & Utility Tools */}
        <div className="p-5 rounded-3xl bg-slate-900/90 border border-slate-800 shadow-xl space-y-4">
          <div className="flex items-center gap-2">
            <Sliders className="w-5 h-5 text-amber-400" />
            <h3 className="font-extrabold text-base text-white">
              3. أدوات التحكم وخدمة العملاء والضبط
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <button
              type="button"
              onClick={() => {
                storeService.resetToDefault();
                onClose();
              }}
              className="p-3.5 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-bold text-xs flex items-center justify-between transition-colors"
            >
              <div className="flex items-center gap-2">
                <RotateCcw className="w-4 h-4 text-amber-400" />
                <span>إعادة ضبط البيانات النموذجية</span>
              </div>
              <span className="text-[10px] text-slate-400">ضبط المصنع</span>
            </button>

            <button
              type="button"
              onClick={onClose}
              className="p-3.5 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-bold text-xs flex items-center justify-between transition-colors"
            >
              <div className="flex items-center gap-2">
                <Headphones className="w-4 h-4 text-emerald-400" />
                <span>خدمة العملاء والدعم الفني المباشر</span>
              </div>
              <span className="text-[10px] text-emerald-400 font-bold">24/7</span>
            </button>

            <div className="p-3.5 rounded-2xl bg-indigo-950/60 border border-indigo-800/80 text-indigo-200 font-bold text-xs flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Server className="w-4 h-4 text-indigo-400" />
                <span>ربط السيرفر المركزي المستقبلي</span>
              </div>
              <span className="text-[10px] text-indigo-300 bg-indigo-900/80 px-2 py-0.5 rounded-md">جاهز</span>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};
