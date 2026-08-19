import React, { useState, useEffect } from "react";
import {
  MerchantWarehouse,
  MerchantItem,
  MerchantSaleOrder,
  Product,
  Factory,
  MerchantAccount,
  SubscriptionTier,
} from "../../types";
import { storeService } from "../../services/storeService";
import { MerchantAuth } from "./MerchantAuth";
import { MerchantSalesPOS } from "./MerchantSalesPOS";
import { MerchantItemsManager } from "./MerchantItemsManager";
import { MerchantWarehousesManager } from "./MerchantWarehousesManager";
import { MerchantUnifiedInventory } from "./MerchantUnifiedInventory";
import { MerchantEmployeesManager } from "./MerchantEmployeesManager";
import { TechControlPanel, TechTabOption } from "../ui/TechControlPanel";
import {
  ShoppingBag,
  Package,
  Building2,
  Layers,
  Users,
  Sparkles,
  ArrowRightLeft,
  Boxes,
  ShieldCheck,
  CreditCard,
  LogOut,
  UserCheck,
  CheckCircle2,
  X,
  Zap,
  Clock,
  ChevronLeft,
  Crown,
} from "lucide-react";

interface Props {
  warehouses: MerchantWarehouse[];
  merchantItems: MerchantItem[];
  merchantSales: MerchantSaleOrder[];
  catalogProducts: Product[];
  factories: Factory[];
  onOpenCart: () => void;
  activeSubTab?: MerchantHubSubTab;
  onSelectSubTab?: (subTab: MerchantHubSubTab) => void;
}

export type MerchantHubSubTab =
  | "SALES"
  | "EMPLOYEES"
  | "ITEMS_PRICING"
  | "WAREHOUSES"
  | "UNIFIED_INVENTORY";

export const MerchantHub: React.FC<Props> = ({
  warehouses,
  merchantItems,
  merchantSales,
  catalogProducts,
  factories,
  onOpenCart,
  activeSubTab: externalActiveSubTab,
  onSelectSubTab,
}) => {
  const [internalActiveSubTab, setInternalActiveSubTab] =
    useState<MerchantHubSubTab>("SALES");

  const activeSubTab = externalActiveSubTab || internalActiveSubTab;
  const setActiveSubTab = (tab: MerchantHubSubTab) => {
    if (onSelectSubTab) onSelectSubTab(tab);
    setInternalActiveSubTab(tab);
  };

  // Merchant Account Session State
  const [currentAccount, setCurrentAccount] = useState<MerchantAccount | null>(
    () => storeService.getCurrentMerchantSession()
  );

  // Subscription Modal State
  const [isSubscriptionModalOpen, setIsSubscriptionModalOpen] = useState(false);
  const [selectedPlanUpgrade, setSelectedPlanUpgrade] = useState<SubscriptionTier | null>(null);
  const [upgradeSuccessMsg, setUpgradeSuccessMsg] = useState("");

  // Sync session state on change
  useEffect(() => {
    const unsubscribe = storeService.subscribe(() => {
      const latest = storeService.getCurrentMerchantSession();
      setCurrentAccount(latest);
    });
    return unsubscribe;
  }, []);

  const handleLogout = () => {
    storeService.setCurrentMerchantSession(null);
    setCurrentAccount(null);
  };

  const handlePlanUpgradeSubmit = (newTier: SubscriptionTier) => {
    if (!currentAccount) return;
    storeService.updateMerchantSubscription(currentAccount.id, newTier);
    setUpgradeSuccessMsg("تم تحديث باقة الاشتراك بنجاح 🚀");
    setTimeout(() => {
      setUpgradeSuccessMsg("");
      setIsSubscriptionModalOpen(false);
    }, 1200);
  };

  // If not logged in or account is not approved (pending/suspended), show MerchantAuth screen
  if (!currentAccount || currentAccount.approvalStatus !== "APPROVED") {
    return (
      <MerchantAuth
        currentAccount={currentAccount}
        onAuthenticated={(acc) => setCurrentAccount(acc)}
        onLogout={handleLogout}
      />
    );
  }

  const shortageCount = merchantItems.filter(
    (i) => i.totalStock <= i.minStockAlert
  ).length;

  const totalStockSum = merchantItems.reduce((acc, item) => acc + item.totalStock, 0);

  const hubTabs: TechTabOption[] = [
    {
      id: "SALES",
      label: "نقطة بيع الزبائن والفواتير (POS)",
      subLabel: "إصدار فواتير بيع المباشر مع طباعة إيصالات الدفع وتحديث المخزون فوراً",
      icon: ShoppingBag,
      color: "text-emerald-500",
    },
    {
      id: "EMPLOYEES",
      label: "ملفات وطاقم الموظفين",
      subLabel: "دليل الكادر، مسير الرواتب، السلف، والجزاءات والحضور",
      icon: Users,
      color: "text-blue-500",
    },
    {
      id: "ITEMS_PRICING",
      label: "إدارة وتسعير الأصناف المحلية",
      subLabel: "تسعير الأصناف بالكرتون أو الحبة، تحديد أسعار الجملة والجملة العادية",
      icon: Package,
      badge: merchantItems.length,
      color: "text-indigo-500",
    },
    {
      id: "WAREHOUSES",
      label: "المخازن والمستودعات الفروعية",
      subLabel: "إدارة الفروع والمستودعات والتحويل المخزني المباشر بين الفروع",
      icon: Building2,
      badge: warehouses.length,
      color: "text-blue-500",
    },
    {
      id: "UNIFIED_INVENTORY",
      label: "تتبع المخزون والنواقص الموحد",
      subLabel: "مراقبة تنبيهات المخزون المنخفض مع زر إكمال طلب الجملة التلقائي",
      icon: Layers,
      badge: shortageCount > 0 ? `${shortageCount} نقص` : "مكتمل",
      badgeColor: shortageCount > 0 ? "bg-amber-500/20 text-amber-500 border border-amber-500/40" : "bg-emerald-500/20 text-emerald-500",
      color: "text-amber-500",
    },
  ];

  return (
    <div className="space-y-6">
      {/* Active Section Header */}
      <div className="bg-slate-900 text-white p-3.5 sm:p-4 rounded-2xl border border-slate-800 shadow-sm flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-emerald-600 text-white font-black">
            {activeSubTab === "SALES" && <ShoppingBag className="w-5 h-5" />}
            {activeSubTab === "ITEMS_PRICING" && <Package className="w-5 h-5" />}
            {activeSubTab === "WAREHOUSES" && <Building2 className="w-5 h-5" />}
            {activeSubTab === "UNIFIED_INVENTORY" && <Layers className="w-5 h-5" />}
          </div>
          <div>
            <h3 className="font-extrabold text-sm sm:text-base">
              {activeSubTab === "SALES" && "نقطة بيع الزبائن الكاشير والفواتير (POS)"}
              {activeSubTab === "ITEMS_PRICING" && "إدارة الأصناف المحلية والتسعير المباشر"}
              {activeSubTab === "WAREHOUSES" && "المخازن والمستودعات الفروعية المستقلة"}
              {activeSubTab === "UNIFIED_INVENTORY" && "جدول المخزون الموحد وتنبيهات النواقص"}
            </h3>
            <p className="text-xs text-slate-400">
              {activeSubTab === "SALES" && "إصدار وتصميم فواتير البيع للزبائن مع خصم الكميات فوراً"}
              {activeSubTab === "ITEMS_PRICING" && `إجمالي ${merchantItems.length} صنف محلي مسجل بالمتجر`}
              {activeSubTab === "WAREHOUSES" && `إجمالي ${warehouses.length} مستودع وفرع نشط`}
              {activeSubTab === "UNIFIED_INVENTORY" && (shortageCount > 0 ? `⚠️ يوجد ${shortageCount} صنف بحاجة لإعادة طلب بالجملة` : "جميع الأصناف متوفرة بنسب ممتازة")}
            </p>
          </div>
        </div>

        {shortageCount > 0 && activeSubTab !== "UNIFIED_INVENTORY" && (
          <button
            onClick={() => setActiveSubTab("UNIFIED_INVENTORY")}
            className="px-3 py-1.5 rounded-xl bg-amber-500/20 text-amber-300 border border-amber-500/40 text-xs font-bold hover:bg-amber-500/30 transition-colors flex items-center gap-1.5"
          >
            <span>نقص في {shortageCount} صنف</span>
            <ArrowRightLeft className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {/* Render Active SubTab */}
      {activeSubTab === "SALES" && (
        <MerchantSalesPOS
          warehouses={warehouses}
          items={merchantItems}
          sales={merchantSales}
        />
      )}

      {activeSubTab === "EMPLOYEES" && (
        <MerchantEmployeesManager
          onBackToCashier={() => setActiveSubTab("SALES")}
        />
      )}

      {activeSubTab === "ITEMS_PRICING" && (
        <MerchantItemsManager
          items={merchantItems}
          warehouses={warehouses}
          catalogProducts={catalogProducts}
          factories={factories}
        />
      )}

      {activeSubTab === "WAREHOUSES" && (
        <MerchantWarehousesManager
          warehouses={warehouses}
          items={merchantItems}
          catalogProducts={catalogProducts}
          onOpenCart={onOpenCart}
        />
      )}

      {activeSubTab === "UNIFIED_INVENTORY" && (
        <MerchantUnifiedInventory
          items={merchantItems}
          warehouses={warehouses}
          catalogProducts={catalogProducts}
          onOpenCart={onOpenCart}
        />
      )}
    </div>
  );
};

