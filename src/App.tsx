import React, { useState, useEffect } from "react";
import { storeService } from "./services/storeService";
import {
  Factory,
  Product,
  WholesalerProfile,
  MainOrder,
  CartItem,
  MerchantWarehouse,
  MerchantItem,
  MerchantSaleOrder,
} from "./types";
import { Navbar } from "./components/Navbar";
import { ProductCatalog } from "./components/wholesaler/ProductCatalog";
import { WholesalerOrderTracker } from "./components/wholesaler/WholesalerOrderTracker";
import { UnifiedCartModal } from "./components/wholesaler/UnifiedCartModal";
import { FactoriesDirectoryModal } from "./components/wholesaler/FactoriesDirectoryModal";
import { MapPreviewModal } from "./components/ui/MapPreviewModal";
import { FactoryDashboard } from "./components/factory/FactoryDashboard";
import { FactoryHeaderBar } from "./components/factory/FactoryHeaderBar";
import { FactoryAuth } from "./components/factory/FactoryAuth";
import { DriverAppTerminal } from "./components/driver/DriverAppTerminal";
import { MerchantHub, MerchantHubSubTab } from "./components/merchant/MerchantHub";
import { MerchantSalesPOS } from "./components/merchant/MerchantSalesPOS";
import { MerchantItemsManager } from "./components/merchant/MerchantItemsManager";
import { MerchantWarehousesManager } from "./components/merchant/MerchantWarehousesManager";
import { MerchantUnifiedInventory } from "./components/merchant/MerchantUnifiedInventory";
import { MerchantEmployeesManager } from "./components/merchant/MerchantEmployeesManager";
import { MerchantHeaderBar } from "./components/merchant/MerchantHeaderBar";
import { MerchantAuth } from "./components/merchant/MerchantAuth";
import { PlatformAdminDashboard } from "./components/admin/PlatformAdminDashboard";
import { TechControlPanel, TechWindowOption } from "./components/ui/TechControlPanel";
import { UniversalControlDrawer } from "./components/ui/UniversalControlDrawer";
import { MerchantSettingsPage } from "./components/merchant/MerchantSettingsPage";
import { ShoppingBag, Factory as FactoryIcon, RotateCcw, Store, Boxes, Building2, PackageCheck, Layers, Sparkles, Package, History, Building, Settings, Users } from "lucide-react";

export type WholesalerViewTab =
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

export default function App() {
  const [activeRole, setActiveRole] = useState<
    "WHOLESALER" | "FACTORY" | "DRIVER" | "ADMIN"
  >("WHOLESALER");
  const [factories, setFactories] = useState<Factory[]>(storeService.getFactories());
  const [selectedFactoryId, setSelectedFactoryId] = useState<string>(
    factories[0]?.id || "fac-1"
  );
  const [products, setProducts] = useState<Product[]>(storeService.getProducts());
  const [wholesaler, setWholesaler] = useState<WholesalerProfile>(
    storeService.getWholesaler()
  );
  const [cart, setCart] = useState<CartItem[]>(storeService.getCart());
  const [mainOrders, setMainOrders] = useState<MainOrder[]>(storeService.getMainOrders());

  // Merchant Hub State
  const [merchantWarehouses, setMerchantWarehouses] = useState<MerchantWarehouse[]>(
    storeService.getMerchantWarehouses()
  );
  const [merchantItems, setMerchantItems] = useState<MerchantItem[]>(
    storeService.getMerchantItems()
  );
  const [merchantSales, setMerchantSales] = useState<MerchantSaleOrder[]>(
    storeService.getMerchantSales()
  );

  // Merchant Account Session State
  const [currentMerchantAccount, setCurrentMerchantAccount] = useState(() =>
    storeService.getCurrentMerchantSession()
  );

  // Factory Account Session State
  const [currentFactoryAccount, setCurrentFactoryAccount] = useState(() =>
    storeService.getCurrentFactorySession()
  );

  useEffect(() => {
    const unsubscribe = storeService.subscribe(() => {
      setCurrentMerchantAccount(storeService.getCurrentMerchantSession());
      setCurrentFactoryAccount(storeService.getCurrentFactorySession());
      setFactories(storeService.getFactories());
      setProducts(storeService.getProducts());
      setWholesaler(storeService.getWholesaler());
      setCart(storeService.getCart());
      setMainOrders(storeService.getMainOrders());
      setMerchantWarehouses(storeService.getMerchantWarehouses());
      setMerchantItems(storeService.getMerchantItems());
      setMerchantSales(storeService.getMerchantSales());
    });
    return unsubscribe;
  }, []);

  const handleMerchantLogout = () => {
    storeService.setCurrentMerchantSession(null);
    setCurrentMerchantAccount(null);
  };

  const handleFactoryLogout = () => {
    storeService.setCurrentFactorySession(null);
    setCurrentFactoryAccount(null);
  };

  // Modals & Theme state
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    const saved = localStorage.getItem("app_theme");
    if (saved) return saved === "dark";
    return window.matchMedia("(prefers-color-scheme: dark)").matches;
  });

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("app_theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("app_theme", "light");
    }
  }, [isDarkMode]);

  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isDirectoryOpen, setIsDirectoryOpen] = useState(false);
  const [activeWholesalerViewTab, setActiveWholesalerViewTab] = useState<WholesalerViewTab>("SALES");
  const [merchantHubActiveSubTab, setMerchantHubActiveSubTab] = useState<MerchantHubSubTab>("SALES");
  const [isMapModalOpen, setIsMapModalOpen] = useState(false);
  const [mapWholesaler, setMapWholesaler] = useState<WholesalerProfile>(wholesaler);

  // Control Panel Toggle State (Persisted & Toggleable from Navbar across all pages)
  const [isControlPanelOpen, setIsControlPanelOpen] = useState<boolean>(() => {
    const saved = localStorage.getItem("app_control_panel_open");
    if (saved !== null) return saved === "true";
    return true; // Default open
  });

  useEffect(() => {
    localStorage.setItem("app_control_panel_open", String(isControlPanelOpen));
  }, [isControlPanelOpen]);

  const selectedFactory =
    factories.find((f) => f.id === selectedFactoryId) || factories[0];
  const selectedFactorySubOrders = storeService.getSubOrdersForFactory(selectedFactoryId);

  const handleOrderSuccess = (newOrder: MainOrder) => {
    setActiveWholesalerViewTab("ACTIVE_ORDERS");
  };

  return (
    <div dir="rtl" className="min-h-screen bg-slate-100/60 dark:bg-slate-950 text-slate-900 dark:text-slate-100 font-sans flex flex-col">
      
      {/* Side Navigation Bar */}
      <Navbar
        activeRole={activeRole}
        setActiveRole={setActiveRole}
        selectedFactoryId={selectedFactoryId}
        setSelectedFactoryId={setSelectedFactoryId}
        onOpenCart={() => setIsCartOpen(true)}
        onOpenOrdersTrack={() => {
          setActiveRole("WHOLESALER");
          setActiveWholesalerViewTab("ACTIVE_ORDERS");
        }}
        onOpenDirectory={() => {
          setActiveRole("WHOLESALER");
          setActiveWholesalerViewTab("DIRECTORY");
        }}
        isDarkMode={isDarkMode}
        onToggleDarkMode={() => setIsDarkMode(!isDarkMode)}
        isControlPanelOpen={isControlPanelOpen}
        onToggleControlPanel={() => setIsControlPanelOpen((prev) => !prev)}
      />

      {/* Universal Control Drawer for Non-Wholesaler roles (Factory, Driver, Admin) */}
      <UniversalControlDrawer
        isOpen={isControlPanelOpen && activeRole !== "WHOLESALER"}
        onClose={() => setIsControlPanelOpen(false)}
        activeRole={activeRole}
        setActiveRole={setActiveRole}
        selectedFactoryId={selectedFactoryId}
        setSelectedFactoryId={setSelectedFactoryId}
        activeWholesalerViewTab={activeWholesalerViewTab}
        setActiveWholesalerViewTab={setActiveWholesalerViewTab}
        currentMerchantAccount={currentMerchantAccount}
        currentFactoryAccount={currentFactoryAccount}
        onMerchantLogout={handleMerchantLogout}
        onFactoryLogout={handleFactoryLogout}
        factories={factories}
        productsCount={products.length}
        ordersCount={mainOrders.length}
        salesCount={merchantSales.length}
        cartCount={cart.reduce((s, i) => s + i.quantity, 0)}
        onOpenCart={() => setIsCartOpen(true)}
        isDarkMode={isDarkMode}
        onToggleDarkMode={() => setIsDarkMode(!isDarkMode)}
        onResetData={() => storeService.resetToDefault()}
      />

      {/* Main Content Area */}
      <div className="flex-1 min-w-0 flex flex-col">
        <main className="w-full px-3 sm:px-5 lg:px-6 py-4 flex-1">
          
          {/* Role: WHOLESALER */}
        {activeRole === "WHOLESALER" && (
          <>
            {(!currentMerchantAccount || currentMerchantAccount.approvalStatus !== "APPROVED") ? (
              <MerchantAuth
                currentAccount={currentMerchantAccount}
                onAuthenticated={(acc) => setCurrentMerchantAccount(acc)}
                onLogout={handleMerchantLogout}
              />
            ) : (
              <div className="-mx-3 -my-4 sm:-mx-5 lg:-mx-6 min-h-screen">
                {/* Side-by-Side Layout: Right Edge-to-Edge Vertical Navigation Sidebar + Left Content Panel */}
                <div className="flex flex-col lg:flex-row items-stretch min-h-screen dir-rtl">
                  <TechControlPanel
                    isOpen={isControlPanelOpen}
                    onClose={() => setIsControlPanelOpen(false)}
                    merchantAccount={currentMerchantAccount}
                    onLogout={handleMerchantLogout}
                    title={currentMerchantAccount?.storeName || wholesaler.storeName || "متجر التاجر المباشر"}
                    subtitle="لوحة التحكم الموحدة بالنوافذ والخصائص"
                    windows={[
                      {
                        id: "SALES",
                        label: "نقطة بيع الزبائن والكاشير (POS)",
                        subLabel: "إصدار وتصميم فواتير البيع المباشر وطباعة الإيصالات والباركود",
                        icon: ShoppingBag,
                        badge: merchantSales.length > 0 ? `${merchantSales.length} مبيعات` : undefined,
                        color: "text-emerald-500",
                      },
                      {
                        id: "EMPLOYEES",
                        label: "ملفات وطاقم الموظفين",
                        subLabel: "دليل الكادر، مسير الرواتب، السلف، والجزاءات والحضور",
                        icon: Users,
                        badge: `${storeService.getEmployees().length} موظف`,
                        color: "text-blue-500",
                      },
                      {
                        id: "ITEMS_PRICING",
                        label: "إدارة وتسعير الأصناف المحلية",
                        subLabel: "تسعير المنتجات بالكرتون والحبة وتحديد خصومات وهوامش الربح",
                        icon: Package,
                        badge: merchantItems.length,
                        color: "text-indigo-500",
                      },
                      {
                        id: "WAREHOUSES",
                        label: "المخازن والمستودعات الفروعية",
                        subLabel: "إدارة المستودعات المستقلة والتحويل المخزني المباشر بين الفروع",
                        icon: Building2,
                        badge: merchantWarehouses.length,
                        color: "text-blue-500",
                      },
                      {
                        id: "UNIFIED_INVENTORY",
                        label: "تتبع المخزون والنواقص الموحد",
                        subLabel: "تنبيهات الأصناف المنخفضة وزر إنشاء طلب الجملة التلقائي",
                        icon: Layers,
                        badge: merchantItems.filter(i => i.totalStock <= i.minStockAlert).length > 0
                          ? `${merchantItems.filter(i => i.totalStock <= i.minStockAlert).length} نقص`
                          : "مكتمل",
                        badgeColor: merchantItems.filter(i => i.totalStock <= i.minStockAlert).length > 0
                          ? "bg-amber-500/20 text-amber-400 border border-amber-500/30"
                          : "bg-emerald-500/20 text-emerald-400",
                        color: "text-amber-500",
                      },
                      {
                        id: "CATALOG",
                        label: "كتالوج المصانع والطلب بالجملة",
                        subLabel: "تصفح المنتجات بأسعار التكلفة المباشرة والشراء بالجملة",
                        icon: Boxes,
                        badge: products.length,
                        color: "text-sky-500",
                      },
                      {
                        id: "ACTIVE_ORDERS",
                        label: "الطلبيات الجديدة والجارية",
                        subLabel: "متابعة الشحنات القائمة والتأكد من الاستلام والتوصيل بالمخزن",
                        icon: PackageCheck,
                        badge: mainOrders.filter((m) => m.subOrders.some((s) => s.status !== "DELIVERED" && s.status !== "CANCELLED")).length,
                        badgeColor: "bg-teal-500/20 text-teal-600 dark:text-teal-400 border border-teal-500/30",
                        color: "text-teal-500",
                      },
                      {
                        id: "ORDER_HISTORY",
                        label: "سجل الطلبات الأرشيفية المكتملة",
                        subLabel: "عرض واستعراض الطلبيات السابقة والفواتير المكتملة بالتفصيل",
                        icon: History,
                        badge: mainOrders.filter((m) => m.subOrders.length > 0 && m.subOrders.every((s) => s.status === "DELIVERED" || s.status === "CANCELLED")).length,
                        badgeColor: "bg-purple-500/20 text-purple-600 dark:text-purple-400 border border-purple-500/30",
                        color: "text-purple-500",
                      },
                      {
                        id: "DIRECTORY",
                        label: "دليل المصانع والشركات المعتمدة",
                        subLabel: "استكشاف المصانع المعتمدة مع توثيق السجلات التجارية وبيانات الاتصال",
                        icon: Building,
                        badge: factories.length,
                        color: "text-rose-500",
                      },
                    ]}
                    activeWindowId={activeWholesalerViewTab}
                    onSelectWindow={(id) => setActiveWholesalerViewTab(id as WholesalerViewTab)}
                    warehouses={merchantWarehouses}
                    onOpenCart={() => setIsCartOpen(true)}
                    cartCount={cart.reduce((s, i) => s + i.quantity, 0)}
                    onResetData={() => storeService.resetToDefault()}
                  />

                  {/* Left Main Content View: Full Page for Each Section */}
                  <div className="flex-1 min-w-0 w-full p-4 sm:p-6 lg:p-8 space-y-6 overflow-y-auto">
                    {/* 1. POS Cashier Full Page */}
                    {(activeWholesalerViewTab === "SALES" || activeWholesalerViewTab === "MERCHANT_HUB") && (
                      <MerchantSalesPOS
                        warehouses={merchantWarehouses}
                        items={merchantItems}
                        sales={merchantSales}
                      />
                    )}

                    {/* 1.5. Employees Files & Staff Full Page */}
                    {activeWholesalerViewTab === "EMPLOYEES" && (
                      <MerchantEmployeesManager
                        onBackToCashier={() => setActiveWholesalerViewTab("SALES")}
                      />
                    )}

                    {/* 2. Items Pricing Full Page */}
                    {activeWholesalerViewTab === "ITEMS_PRICING" && (
                      <MerchantItemsManager
                        items={merchantItems}
                        warehouses={merchantWarehouses}
                        catalogProducts={products}
                        factories={factories}
                      />
                    )}

                    {/* 3. Warehouses Manager Full Page */}
                    {activeWholesalerViewTab === "WAREHOUSES" && (
                      <MerchantWarehousesManager
                        warehouses={merchantWarehouses}
                        items={merchantItems}
                        catalogProducts={products}
                        onOpenCart={() => setIsCartOpen(true)}
                      />
                    )}

                    {/* 4. Unified Inventory & Deficits Tracker Full Page */}
                    {activeWholesalerViewTab === "UNIFIED_INVENTORY" && (
                      <MerchantUnifiedInventory
                        items={merchantItems}
                        warehouses={merchantWarehouses}
                        catalogProducts={products}
                        onOpenCart={() => setIsCartOpen(true)}
                      />
                    )}

                    {/* 5. Direct Factories Product Catalog Full Page */}
                    {activeWholesalerViewTab === "CATALOG" && (
                      <ProductCatalog
                        products={products}
                        factories={factories}
                        onOpenCart={() => setIsCartOpen(true)}
                        onOpenDirectory={() => setActiveWholesalerViewTab("DIRECTORY")}
                      />
                    )}

                    {/* 6. Active & Ongoing Split Orders Full Page */}
                    {(activeWholesalerViewTab === "ACTIVE_ORDERS" || activeWholesalerViewTab === "TRACKER") && (
                      <WholesalerOrderTracker
                        mainOrders={mainOrders}
                        onOpenMapModal={() => setIsMapModalOpen(true)}
                        onOpenCatalog={() => setActiveWholesalerViewTab("CATALOG")}
                        initialTab="NEW_ACTIVE"
                      />
                    )}

                    {/* 7. Order History Full Page */}
                    {activeWholesalerViewTab === "ORDER_HISTORY" && (
                      <WholesalerOrderTracker
                        mainOrders={mainOrders}
                        onOpenMapModal={() => setIsMapModalOpen(true)}
                        onOpenCatalog={() => setActiveWholesalerViewTab("CATALOG")}
                        initialTab="HISTORY"
                      />
                    )}

                    {/* 8. Verified Factories Directory Full Page */}
                    {activeWholesalerViewTab === "DIRECTORY" && (
                      <FactoriesDirectoryModal
                        isFullPage={true}
                        factories={factories}
                        products={products}
                        onOpenCart={() => setIsCartOpen(true)}
                      />
                    )}

                    {/* 9. Full Store Settings Page (including Profile, Subscription, and Taxes) */}
                    {activeWholesalerViewTab === "SETTINGS" && currentMerchantAccount && (
                      <MerchantSettingsPage
                        merchantAccount={currentMerchantAccount}
                        onUpdateAccount={(acc) => setCurrentMerchantAccount(acc)}
                      />
                    )}
                  </div>
                </div>

              </div>
            )}
          </>
        )}

        {/* Role: FACTORY (تطبيق المصنع والمنتج) */}
        {activeRole === "FACTORY" && (
          <div className="space-y-6">
            {currentFactoryAccount && currentFactoryAccount.approvalStatus === "APPROVED" ? (
              <>
                <FactoryHeaderBar
                  currentAccount={currentFactoryAccount}
                  onLogout={handleFactoryLogout}
                />
                <FactoryDashboard
                  factory={selectedFactory}
                  subOrders={selectedFactorySubOrders}
                  products={products}
                />
              </>
            ) : (
              <FactoryAuth
                currentAccount={currentFactoryAccount}
                onAuthenticated={(acc) => setCurrentFactoryAccount(acc)}
                onLogout={handleFactoryLogout}
              />
            )}
          </div>
        )}

        {/* Role: DRIVER (تطبيق السائق والناقل) */}
        {activeRole === "DRIVER" && (
          <DriverAppTerminal
            subOrders={mainOrders.flatMap((m) => m.subOrders)}
            onOpenMapModal={(targetWholesaler) => {
              setMapWholesaler(targetWholesaler);
              setIsMapModalOpen(true);
            }}
          />
        )}

        {/* Role: ADMIN (إدارة المنصة والعملاء والمصانع) */}
        {activeRole === "ADMIN" && (
          <PlatformAdminDashboard
            factories={factories}
            products={products}
            wholesaler={wholesaler}
            orders={mainOrders}
            merchantSales={merchantSales}
            onOpenCart={() => setIsCartOpen(true)}
          />
        )}

      </main>
      </div>

      {/* Modals */}
      <UnifiedCartModal
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        cart={cart}
        wholesaler={wholesaler}
        onOrderSuccess={handleOrderSuccess}
      />

      <FactoriesDirectoryModal
        isOpen={isDirectoryOpen}
        onClose={() => setIsDirectoryOpen(false)}
        factories={factories}
        products={products}
        onOpenCart={() => setIsCartOpen(true)}
      />

      <MapPreviewModal
        isOpen={isMapModalOpen}
        onClose={() => setIsMapModalOpen(false)}
        wholesaler={mapWholesaler || wholesaler}
      />

    </div>
  );
}
