import React, { useState } from "react";
import { Factory, SubOrder, Product } from "../../types";
import { FactoryOrdersList } from "./FactoryOrdersList";
import { FactoryInventory } from "./FactoryInventory";
import { FactoryAnalytics } from "./FactoryAnalytics";
import { DriversRosterView } from "./DriversRosterView";
import { TechControlPanel, TechTabOption } from "../ui/TechControlPanel";
import {
  Building2,
  CheckCircle2,
  Clock,
  Star,
  Package,
  Boxes,
  BarChart3,
  MapPin,
  ShieldCheck,
  Users,
} from "lucide-react";

interface Props {
  factory: Factory;
  subOrders: SubOrder[];
  products: Product[];
}

export const FactoryDashboard: React.FC<Props> = ({
  factory,
  subOrders,
  products,
}) => {
  const [activeTab, setActiveTab] = useState<"ORDERS" | "INVENTORY" | "ANALYTICS" | "DRIVERS">(
    "ORDERS"
  );

  const pendingOrdersCount = subOrders.filter((o) => o.status === "RECEIVED").length;
  const processingCount = subOrders.filter((o) => o.status === "PROCESSING").length;
  const activeDeliveryCount = subOrders.filter((o) => o.status === "OUT_FOR_DELIVERY").length;

  return (
    <div className="space-y-6 dir-rtl">
      
      {/* Single Unified Horizontal Header & Control Panel */}
      <TechControlPanel
        title={factory.name}
        subtitle={`${factory.city} - ${factory.district} • سجل تجاري: ${factory.commercialReg}`}
        badge={factory.verified ? "مصنع موثق 🟢" : undefined}
        headerActions={
          <div className="flex items-center gap-3 bg-slate-50 dark:bg-slate-800/80 p-2 sm:p-2.5 rounded-2xl border border-slate-200 dark:border-slate-700/80">
            <img
              src={factory.logo}
              alt={factory.name}
              className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl object-cover border border-slate-200 dark:border-slate-700 shadow-xs"
            />
            <div className="text-xs">
              <div className="flex items-center gap-1.5 font-extrabold text-slate-800 dark:text-slate-200">
                <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                <span>{factory.rating}</span>
                <span className="text-slate-400">•</span>
                <span>{factory.ordersFulfilled} طلبية منفذة</span>
              </div>
              <div className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-1 mt-0.5 font-medium">
                <Clock className="w-3 h-3 text-indigo-500" />
                <span>متوسط التجهيز: {factory.avgPreparationHours} ساعات</span>
              </div>
            </div>
          </div>
        }
        tabs={[
          {
            id: "ORDERS",
            label: "الطلبيات الواردة للمصنع",
            subLabel: "معالجة الطلبيات الواردة من تجار الجملة وتجهيز الشحنات للتحميل",
            icon: Package,
            badge: subOrders.length,
            color: "text-indigo-500",
          },
          {
            id: "INVENTORY",
            label: "المخزون وأسعار الجملة",
            subLabel: "إدارة قائمة المنتجات، تحديد خصومات الكرتون، وتعديل كميات المخزون",
            icon: Boxes,
            badge: products.filter(p => p.factoryId === factory.id).length,
            color: "text-blue-500",
          },
          {
            id: "ANALYTICS",
            label: "تقارير المبيعات والأداء",
            subLabel: "إحصائيات إجمالي الإيرادات، معدلات التنفيذ السريعة، وأنشط المنتجات مبيعاً",
            icon: BarChart3,
            color: "text-emerald-500",
          },
          {
            id: "DRIVERS",
            label: "أسطول السائقين والناقلين",
            subLabel: "إسناد الشحنات لسائقي النقل المعتمدين وتتبع حالة التوصيل للتاجر",
            icon: Users,
            badgeColor: "bg-amber-100 text-amber-800",
            color: "text-amber-500",
          },
        ]}
        activeTabId={activeTab}
        onSelectTab={(id) => setActiveTab(id as any)}
        stats={[
          { label: "إجمالي الطلبات", value: subOrders.length, color: "text-indigo-600 dark:text-indigo-400 font-extrabold" },
          { label: "طلبيات جديدة", value: pendingOrdersCount, color: "text-amber-500 font-extrabold" },
          { label: "قيد التجهيز", value: processingCount, color: "text-blue-600 dark:text-blue-400 font-extrabold" },
          { label: "جاري التوصيل", value: activeDeliveryCount, color: "text-emerald-600 dark:text-emerald-400 font-extrabold" },
        ]}
      />

      {/* Content Body */}
      <div className="w-full space-y-6">
        {activeTab === "ORDERS" && (
          <FactoryOrdersList
            subOrders={subOrders}
            factoryName={factory.name}
            onOpenDriversManager={() => setActiveTab("DRIVERS")}
          />
        )}

        {activeTab === "INVENTORY" && (
          <FactoryInventory factory={factory} products={products} />
        )}

        {activeTab === "ANALYTICS" && (
          <FactoryAnalytics factory={factory} subOrders={subOrders} products={products} />
        )}

        {activeTab === "DRIVERS" && <DriversRosterView factoryId={factory.id} />}
      </div>

    </div>
  );
};
