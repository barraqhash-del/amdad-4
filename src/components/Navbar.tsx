import React, { useState, useEffect } from "react";
import { storeService } from "../services/storeService";
import { Factory, CartItem, AppNotification } from "../types";
import { CustomerServiceButton } from "./PlatformInfoBox";
import { AppPortalSwitcherModal, AppRole, WholesalerTab } from "./ui/AppPortalSwitcherModal";
import {
  ShoppingBag,
  Factory as FactoryIcon,
  Sparkles,
  Bell,
  Check,
  ChevronDown,
  Layers,
  Building2,
  Truck,
  Sun,
  Moon,
  ShieldCheck,
  Maximize2,
  Minimize2,
  Menu,
  X,
  PackageCheck,
  LayoutDashboard,
  Store,
  Grid,
  Settings,
  SlidersHorizontal,
} from "lucide-react";

interface Props {
  activeRole: AppRole;
  setActiveRole: (role: AppRole) => void;
  selectedFactoryId: string;
  setSelectedFactoryId: (id: string) => void;
  onOpenCart: () => void;
  onOpenOrdersTrack: () => void;
  onOpenDirectory?: () => void;
  activeWholesalerTab?: WholesalerTab;
  onSelectWholesalerTab?: (tab: WholesalerTab) => void;
  isDarkMode?: boolean;
  onToggleDarkMode?: () => void;
  onOpenSettings?: () => void;
  isControlPanelOpen?: boolean;
  onToggleControlPanel?: () => void;
}

export const Navbar: React.FC<Props> = ({
  activeRole,
  setActiveRole,
  selectedFactoryId,
  setSelectedFactoryId,
  onOpenCart,
  onOpenOrdersTrack,
  onOpenDirectory,
  activeWholesalerTab,
  onSelectWholesalerTab,
  isDarkMode,
  onToggleDarkMode,
  onOpenSettings,
  isControlPanelOpen = true,
  onToggleControlPanel,
}) => {
  const [cart, setCart] = useState<CartItem[]>(storeService.getCart());
  const [factories, setFactories] = useState<Factory[]>(storeService.getFactories());
  const [notifications, setNotifications] = useState<AppNotification[]>(
    storeService.getNotifications()
  );
  const [showNotifs, setShowNotifs] = useState(false);
  const [showFactorySelect, setShowFactorySelect] = useState(false);
  const [isPortalModalOpen, setIsPortalModalOpen] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () => document.removeEventListener("fullscreenchange", handleFullscreenChange);
  }, []);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch((err) => {
        console.error("Fullscreen error:", err);
      });
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      }
    }
  };

  useEffect(() => {
    const unsubscribe = storeService.subscribe(() => {
      setCart(storeService.getCart());
      setFactories(storeService.getFactories());
      setNotifications(storeService.getNotifications());
    });
    return unsubscribe;
  }, []);

  const totalCartCount = cart.reduce((sum, item) => sum + item.quantity, 0);
  const selectedFactory = factories.find((f) => f.id === selectedFactoryId) || factories[0];

  const unreadCount = notifications.filter((n) => {
    if (activeRole === "FACTORY") {
      return (
        n.targetRole === "FACTORY" &&
        (!n.factoryId || n.factoryId === "ALL" || n.factoryId === selectedFactoryId) &&
        !n.read
      );
    }
    return (n.targetRole === "WHOLESALER" || n.targetRole === "MERCHANT" as any) && !n.read;
  }).length;

  const roleMeta = {
    WHOLESALER: {
      title: "منصة تاجر الجملة والمخازن",
      badge: "تطبيق التاجر 🏪",
      icon: Store,
      colorClass: "bg-emerald-600 text-white",
      bgSoft: "bg-emerald-50 dark:bg-emerald-950/60 border-emerald-200 dark:border-emerald-800 text-emerald-900 dark:text-emerald-200",
    },
    FACTORY: {
      title: "منصة المصانع الموردة",
      badge: "تطبيق المصنع 🏭",
      icon: FactoryIcon,
      colorClass: "bg-indigo-600 text-white",
      bgSoft: "bg-indigo-50 dark:bg-indigo-950/60 border-indigo-200 dark:border-indigo-800 text-indigo-900 dark:text-indigo-200",
    },
    DRIVER: {
      title: "تطبيق السائق والناقل",
      badge: "تطبيق الناقل 🚚",
      icon: Truck,
      colorClass: "bg-amber-500 text-slate-950",
      bgSoft: "bg-amber-50 dark:bg-amber-950/60 border-amber-200 dark:border-amber-800 text-amber-900 dark:text-amber-200",
    },
    ADMIN: {
      title: "لوحة تحكم الإدارة العامة",
      badge: "لوحة الإدارة 🛡️",
      icon: ShieldCheck,
      colorClass: "bg-purple-600 text-white",
      bgSoft: "bg-purple-50 dark:bg-purple-950/60 border-purple-200 dark:border-purple-800 text-purple-900 dark:text-purple-200",
    },
  };

  const currentRoleInfo = roleMeta[activeRole];
  const RoleIcon = currentRoleInfo.icon;

  return (
    <>
      {/* Top Main Navigation Bar Header */}
      <header className="sticky top-0 z-40 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-slate-200/80 dark:border-slate-800 shadow-xs">
        <div className="w-full px-4 sm:px-6 lg:px-8 py-3">
          <div className="flex items-center justify-between gap-3">
            
            {/* Left Brand Logo & Main Control Panel Button */}
            <div className="flex items-center gap-2.5 sm:gap-3.5">
              {/* Logo & Company Name */}
              <div className="flex items-center gap-2.5">
                <div className="p-2 sm:p-2.5 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-500 text-white shadow-md shadow-emerald-500/20">
                  <Layers className="w-5 h-5 sm:w-6 sm:h-6" />
                </div>
                <div className="hidden sm:block">
                  <div className="flex items-center gap-1.5">
                    <span className="font-black text-lg sm:text-xl tracking-tight text-slate-900 dark:text-white">
                      إمداد
                    </span>
                    <span className="text-[10px] font-extrabold px-1.5 py-0.5 rounded-md bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                      B2B
                    </span>
                  </div>
                  <p className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">
                    منصة تجارة الجملة والمصانع
                  </p>
                </div>
              </div>

              {/* Vertical divider */}
              {onToggleControlPanel && (
                <div className="hidden sm:block h-6 w-px bg-slate-200 dark:bg-slate-700" />
              )}

              {/* Main Control Panel Toggle Button placed right next to Company Logo and Name */}
              {onToggleControlPanel && (
                <button
                  type="button"
                  onClick={onToggleControlPanel}
                  className={`flex items-center gap-2 px-3 sm:px-3.5 py-2 rounded-2xl border font-black text-xs transition-all duration-200 shadow-xs hover:scale-[1.02] active:scale-95 cursor-pointer ${
                    isControlPanelOpen
                      ? "bg-indigo-600 text-white border-indigo-500 shadow-indigo-600/30 ring-2 ring-indigo-400/40"
                      : "bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-100 border-slate-300 dark:border-slate-700"
                  }`}
                  title={isControlPanelOpen ? "انقر لإخفاء قائمة التحكم" : "انقر لإظهار قائمة التحكم"}
                >
                  <div className={`p-1.5 rounded-xl transition-colors ${
                    isControlPanelOpen ? "bg-white/20 text-white" : "bg-indigo-600 text-white shadow-xs"
                  }`}>
                    <SlidersHorizontal className="w-4 h-4" />
                  </div>
                  <div className="text-right">
                    <div className="flex items-center gap-1.5">
                      <span className="font-black text-xs sm:text-sm leading-tight">
                        قائمة التحكم
                      </span>
                      <span className={`text-[9px] font-black px-1.5 py-0.2 rounded-md ${
                        isControlPanelOpen
                          ? "bg-white/20 text-white"
                          : "bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800"
                      }`}>
                        {isControlPanelOpen ? "معروضة 🟢" : "مخفية ⚡"}
                      </span>
                    </div>
                    <span className="text-[9.5px] opacity-80 hidden sm:block font-bold">
                      {isControlPanelOpen ? "انقر للإخفاء" : "انقر للإظهار"}
                    </span>
                  </div>
                </button>
              )}
            </div>

            {/* Left Side: Unified App Portal Controls & Actions */}
            <div className="flex items-center gap-2 relative">

                {/* Main Unified Program Menu Trigger */}
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setIsPortalModalOpen(!isPortalModalOpen)}
                    className={`flex items-center gap-2.5 px-3.5 py-2 rounded-2xl border font-extrabold text-xs transition-all shadow-xs hover:scale-[1.01] active:scale-95 cursor-pointer ${currentRoleInfo.bgSoft}`}
                    title="انقر لفتح قائمة البرامج والتطبيقات"
                  >
                    <div className={`p-1.5 rounded-xl ${currentRoleInfo.colorClass}`}>
                      <RoleIcon className="w-4 h-4" />
                    </div>
                    <div className="text-right">
                      <div className="flex items-center gap-1.5">
                        <span className="font-black text-xs sm:text-sm">
                          {currentRoleInfo.title}
                        </span>
                        <span className="text-[10px] font-bold px-1.5 py-0.2 rounded-md bg-white/60 dark:bg-slate-900/60 border border-slate-200/60 dark:border-slate-800/60">
                          {currentRoleInfo.badge}
                        </span>
                      </div>
                      <span className="text-[10px] opacity-75 block font-bold">
                        قائمة البرامج والخيارات ▾
                      </span>
                    </div>
                    <ChevronDown className="w-4 h-4 opacity-70 shrink-0 mr-0.5" />
                  </button>
                </div>

                {/* Direct Cart Button for Quick Access if Wholesaler */}
                {activeRole === "WHOLESALER" && (
                  <button
                    onClick={onOpenCart}
                    className="relative flex items-center gap-2 px-3 py-2 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs transition-all shadow-xs"
                    title="السلة الموحدة"
                  >
                    <ShoppingBag className="w-4 h-4" />
                    <span className="hidden sm:inline">السلة</span>
                    {totalCartCount > 0 && (
                      <span className="px-1.5 py-0.2 bg-amber-400 text-slate-950 rounded-full text-[10px] font-extrabold">
                        {totalCartCount}
                      </span>
                    )}
                  </button>
                )}

                {/* Notifications Button */}
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setShowNotifs(!showNotifs)}
                    className="relative p-2.5 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                    title="الإشعارات والتنبيهات"
                  >
                    <Bell className="w-4.5 h-4.5 text-emerald-600 dark:text-emerald-400" />
                    {unreadCount > 0 && (
                      <span className="absolute -top-1 -right-1 w-4.5 h-4.5 rounded-full bg-rose-500 text-white text-[9.5px] font-extrabold flex items-center justify-center border-2 border-white dark:border-slate-900 animate-pulse">
                        {unreadCount}
                      </span>
                    )}
                  </button>

                  {/* Notifications Popup Dropdown */}
                  {showNotifs && (
                    <div className="absolute top-full mt-2 left-0 w-80 rounded-2xl bg-white dark:bg-slate-900 shadow-2xl border border-slate-200 dark:border-slate-800 p-3 z-50">
                      <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2 mb-2">
                        <span className="font-bold text-xs text-slate-900 dark:text-white">
                          الإشعارات المباشرة
                        </span>
                        <button
                          type="button"
                          onClick={() => setShowNotifs(false)}
                          className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      <div className="max-h-60 overflow-y-auto space-y-2">
                        {notifications.filter((n) =>
                          activeRole === "FACTORY"
                            ? n.targetRole === "FACTORY" && (!n.factoryId || n.factoryId === "ALL" || n.factoryId === selectedFactoryId)
                            : n.targetRole === "WHOLESALER" || n.targetRole === "MERCHANT" as any
                        ).length === 0 ? (
                          <div className="text-center py-4 text-slate-400 text-xs">
                            لا توجد إشعارات جديدة حالياً
                          </div>
                        ) : (
                          notifications
                            .filter((n) =>
                              activeRole === "FACTORY"
                                ? n.targetRole === "FACTORY" && (!n.factoryId || n.factoryId === "ALL" || n.factoryId === selectedFactoryId)
                                : n.targetRole === "WHOLESALER" || n.targetRole === "MERCHANT" as any
                            )
                            .map((n) => (
                              <div
                                key={n.id}
                                onClick={() => storeService.markNotificationAsRead(n.id)}
                                className={`p-2.5 rounded-xl border text-xs cursor-pointer transition-colors ${
                                  n.read
                                    ? "bg-slate-50 dark:bg-slate-800/40 border-slate-200 dark:border-slate-800 text-slate-600"
                                    : "bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800 text-slate-900 dark:text-slate-100 font-medium"
                                }`}
                              >
                                <div className="flex items-center justify-between mb-1">
                                  <span className="font-bold text-emerald-700 dark:text-emerald-400">
                                    {n.title}
                                  </span>
                                  <span className="text-[9px] text-slate-400">{n.timestamp}</span>
                                </div>
                                <p className="text-[11px] leading-relaxed">{n.message}</p>
                              </div>
                            ))
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {/* Settings Icon Button in Top Header */}
                {onOpenSettings && (
                  <button
                    type="button"
                    onClick={onOpenSettings}
                    className="p-2.5 rounded-2xl bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 hover:bg-purple-100 dark:hover:bg-purple-900/60 transition-colors border border-purple-200 dark:border-purple-800 cursor-pointer"
                    title="إعدادات المنصة والتعاميم"
                  >
                    <Settings className="w-4.5 h-4.5" />
                  </button>
                )}

                {/* Dark/Light Mode Toggle */}
                {onToggleDarkMode && (
                  <button
                    type="button"
                    onClick={onToggleDarkMode}
                    className="p-2.5 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 transition-colors"
                    title={isDarkMode ? "الوضع النهاري" : "الوضع الليلي"}
                  >
                    {isDarkMode ? (
                      <Sun className="w-4.5 h-4.5 text-amber-400" />
                    ) : (
                      <Moon className="w-4.5 h-4.5 text-slate-700" />
                    )}
                  </button>
                )}

                {/* Fullscreen Toggle */}
                <button
                  type="button"
                  onClick={toggleFullscreen}
                  className="hidden sm:flex p-2.5 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 transition-colors"
                  title={isFullscreen ? "خروج من ملء الشاشة" : "ملء الشاشة"}
                >
                  {isFullscreen ? (
                    <Minimize2 className="w-4.5 h-4.5 text-indigo-600" />
                  ) : (
                    <Maximize2 className="w-4.5 h-4.5 text-indigo-600 dark:text-indigo-400" />
                  )}
                </button>
              </div>

          </div>
        </div>
      </header>

      {/* App Portal Switcher Popup Modal */}
      <AppPortalSwitcherModal
        isOpen={isPortalModalOpen}
        onClose={() => setIsPortalModalOpen(false)}
        activeRole={activeRole}
        onSelectRole={(role) => setActiveRole(role)}
        activeWholesalerTab={activeWholesalerTab}
        onSelectWholesalerTab={onSelectWholesalerTab}
        isDarkMode={isDarkMode}
        onToggleDarkMode={onToggleDarkMode}
      />
    </>
  );
};
