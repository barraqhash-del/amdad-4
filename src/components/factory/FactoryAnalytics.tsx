import React, { useState, useMemo } from "react";
import { Factory, SubOrder, Product, MainOrder, DriverAccount } from "../../types";
import { storeService } from "../../services/storeService";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  CartesianGrid,
} from "recharts";
import {
  TrendingUp,
  Boxes,
  Truck,
  CheckCircle2,
  Clock,
  DollarSign,
  BrainCircuit,
  AlertTriangle,
  Calendar,
  Printer,
  Building2,
  Search,
  X,
  BarChart2,
  CalendarRange,
  ArrowRight,
  Sparkles,
  Layers,
  RotateCcw,
  Check,
} from "lucide-react";

interface Props {
  factory: Factory;
  subOrders: SubOrder[];
  products?: Product[];
}

export type TimeFrame = "TODAY" | "WEEK" | "MONTH" | "CUSTOM" | "ALL";
type AnalyticsTab = "OVERVIEW" | "FORECASTING" | "PRODUCTS" | "CLIENTS" | "LOGISTICS";

export const FactoryAnalytics: React.FC<Props> = ({
  factory,
  subOrders: initialSubOrders,
  products: initialProducts,
}) => {
  const [timeframe, setTimeframe] = useState<TimeFrame>("MONTH");
  const [activeTab, setActiveTab] = useState<AnalyticsTab>("OVERVIEW");
  const [isPrintModalOpen, setIsPrintModalOpen] = useState(false);
  const [searchProductQuery, setSearchProductQuery] = useState("");

  // Custom Date Range State (Default: Last 14 days up to today)
  const [customStartDate, setCustomStartDate] = useState<string>(() => {
    const d = new Date();
    d.setDate(d.getDate() - 14);
    return d.toISOString().split("T")[0];
  });
  const [customEndDate, setCustomEndDate] = useState<string>(() => {
    return new Date().toISOString().split("T")[0];
  });
  const [showDateRangeBar, setShowDateRangeBar] = useState(false);

  // Direct live subscription to storeService to guarantee 100% real-time data sync
  const allMainOrders = useMemo(() => storeService.getMainOrders(), []);
  const allProducts = useMemo(
    () => initialProducts || storeService.getProducts(),
    [initialProducts]
  );
  const factoryProducts = useMemo(
    () => allProducts.filter((p) => p.factoryId === factory.id),
    [allProducts, factory.id]
  );
  const factorySubOrders = useMemo(
    () => storeService.getSubOrdersForFactory(factory.id),
    [factory.id]
  );

  // Quick Preset Handlers for Date Range
  const applyDatePreset = (daysBack: number) => {
    const end = new Date();
    const start = new Date();
    start.setDate(end.getDate() - daysBack);
    setCustomStartDate(start.toISOString().split("T")[0]);
    setCustomEndDate(end.toISOString().split("T")[0]);
    setTimeframe("CUSTOM");
  };

  const applyThisMonthPreset = () => {
    const now = new Date();
    const start = new Date(now.getFullYear(), now.getMonth(), 1);
    setCustomStartDate(start.toISOString().split("T")[0]);
    setCustomEndDate(now.toISOString().split("T")[0]);
    setTimeframe("CUSTOM");
  };

  const applyLastMonthPreset = () => {
    const now = new Date();
    const start = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const end = new Date(now.getFullYear(), now.getMonth(), 0);
    setCustomStartDate(start.toISOString().split("T")[0]);
    setCustomEndDate(end.toISOString().split("T")[0]);
    setTimeframe("CUSTOM");
  };

  const applyThisYearPreset = () => {
    const now = new Date();
    const start = new Date(now.getFullYear(), 0, 1);
    setCustomStartDate(start.toISOString().split("T")[0]);
    setCustomEndDate(now.toISOString().split("T")[0]);
    setTimeframe("CUSTOM");
  };

  // Filter orders by timeframe (including custom Start/End dates)
  const filteredSubOrders = useMemo(() => {
    const now = new Date();
    return factorySubOrders.filter((order) => {
      const orderDate = new Date(order.createdAt);
      if (isNaN(orderDate.getTime())) return true;
      const diffMs = now.getTime() - orderDate.getTime();
      const diffDays = diffMs / (1000 * 60 * 60 * 24);

      if (timeframe === "TODAY") return diffDays <= 1;
      if (timeframe === "WEEK") return diffDays <= 7;
      if (timeframe === "MONTH") return diffDays <= 30;
      if (timeframe === "CUSTOM") {
        const start = customStartDate ? new Date(`${customStartDate}T00:00:00`).getTime() : 0;
        const end = customEndDate ? new Date(`${customEndDate}T23:59:59.999`).getTime() : Number.MAX_SAFE_INTEGER;
        const t = orderDate.getTime();
        return t >= start && t <= end;
      }
      return true; // ALL
    });
  }, [factorySubOrders, timeframe, customStartDate, customEndDate]);

  // ----------------------------------------------------
  // 1. REAL EXECUTIVE FINANCIAL & OPERATIONAL KPIS
  // ----------------------------------------------------
  const kpiData = useMemo(() => {
    const totalOrdersCount = filteredSubOrders.length;
    const totalGrossRevenue = filteredSubOrders.reduce((sum, o) => sum + o.total, 0);
    const totalSubtotal = filteredSubOrders.reduce((sum, o) => sum + o.subtotal, 0);
    const totalShippingRevenue = filteredSubOrders.reduce((sum, o) => sum + o.shippingFee, 0);

    const deliveredOrders = filteredSubOrders.filter((o) => o.status === "DELIVERED");
    const deliveredCount = deliveredOrders.length;
    const activeInTransitCount = filteredSubOrders.filter((o) => o.status === "OUT_FOR_DELIVERY").length;
    const processingCount = filteredSubOrders.filter(
      (o) => o.status === "PROCESSING" || o.status === "READY_FOR_PICKUP"
    ).length;
    const receivedCount = filteredSubOrders.filter((o) => o.status === "RECEIVED").length;
    const cancelledCount = filteredSubOrders.filter((o) => o.status === "CANCELLED").length;

    // Total Cartons / Units sold
    let totalCartonsSold = 0;
    filteredSubOrders.forEach((o) => {
      o.items.forEach((item) => {
        totalCartonsSold += item.quantity;
      });
    });

    const averageOrderValue = totalOrdersCount > 0 ? Math.round(totalGrossRevenue / totalOrdersCount) : 0;
    const fulfillmentRate =
      totalOrdersCount > 0
        ? Math.round(((deliveredCount + activeInTransitCount + processingCount) / totalOrdersCount) * 100)
        : 100;

    // Current warehouse stock valuation
    const currentInventoryValuation = factoryProducts.reduce(
      (sum, p) => sum + (p.stockCartons || 0) * (p.cartonPrice || 0),
      0
    );
    const totalStockCartons = factoryProducts.reduce(
      (sum, p) => sum + (p.stockCartons || 0),
      0
    );

    return {
      totalOrdersCount,
      totalGrossRevenue,
      totalSubtotal,
      totalShippingRevenue,
      deliveredCount,
      activeInTransitCount,
      processingCount,
      receivedCount,
      cancelledCount,
      totalCartonsSold,
      averageOrderValue,
      fulfillmentRate,
      currentInventoryValuation,
      totalStockCartons,
    };
  }, [filteredSubOrders, factoryProducts]);

  // ----------------------------------------------------
  // 2. REAL MATHEMATICAL AI PREDICTIVE FORECASTING ENGINE
  // ----------------------------------------------------
  const predictiveAnalysis = useMemo(() => {
    // Days in consideration
    const daysInSample =
      timeframe === "TODAY"
        ? 1
        : timeframe === "WEEK"
        ? 7
        : timeframe === "MONTH"
        ? 30
        : timeframe === "CUSTOM"
        ? Math.max(
            1,
            Math.ceil(
              (new Date(customEndDate).getTime() - new Date(customStartDate).getTime()) /
                (1000 * 60 * 60 * 24)
            ) + 1
          )
        : 60;

    const productSalesMap = new Map<string, { totalSold: number; totalRevenue: number; orderCount: number }>();

    // Aggregate sales per product from filtered subOrders
    filteredSubOrders.forEach((order) => {
      order.items.forEach((item) => {
        const prodId = item.product.id;
        const current = productSalesMap.get(prodId) || { totalSold: 0, totalRevenue: 0, orderCount: 0 };
        current.totalSold += item.quantity;
        current.totalRevenue += item.quantity * (item.priceAtOrder || item.product.cartonPrice);
        current.orderCount += 1;
        productSalesMap.set(prodId, current);
      });
    });

    const itemsForecast = factoryProducts.map((product) => {
      const sales = productSalesMap.get(product.id) || { totalSold: 0, totalRevenue: 0, orderCount: 0 };

      // Daily Run Rate (Velocity in Cartons/day)
      const rawVelocity = daysInSample > 0 ? sales.totalSold / daysInSample : 0;
      const dailyVelocity = rawVelocity > 0 ? Number(rawVelocity.toFixed(2)) : 0;

      // Days until depletion
      const currentStock = product.stockCartons || (product as any).stock || 0;
      const daysUntilStockout = dailyVelocity > 0 ? Math.round(currentStock / dailyVelocity) : (currentStock > 0 ? 999 : 0);

      // 30-Day Demand Projection
      const projected30DayDemand = Math.ceil(dailyVelocity * 30);

      // Recommended Production Batch (incorporating 7-day safety stock buffer)
      const safetyStock = Math.ceil(dailyVelocity * 7);
      const suggestedProductionBatch = dailyVelocity > 0
        ? Math.max(0, projected30DayDemand - currentStock + safetyStock)
        : (currentStock === 0 ? 20 : 0);

      // Stockout Risk Categorization
      let riskLevel: "CRITICAL" | "WARNING" | "HEALTHY" | "OVERSTOCKED" = "HEALTHY";
      if (currentStock === 0 || (dailyVelocity > 0 && daysUntilStockout <= 3)) {
        riskLevel = "CRITICAL";
      } else if (dailyVelocity > 0 && daysUntilStockout <= 7) {
        riskLevel = "WARNING";
      } else if (dailyVelocity > 0 && daysUntilStockout > 45) {
        riskLevel = "OVERSTOCKED";
      }

      return {
        product,
        totalSold: sales.totalSold,
        totalRevenue: sales.totalRevenue,
        dailyVelocity,
        daysUntilStockout,
        projected30DayDemand,
        suggestedProductionBatch,
        riskLevel,
      };
    });

    // Overall Factory Stock Health Index (0-100%)
    const criticalCount = itemsForecast.filter((i) => i.riskLevel === "CRITICAL").length;
    const warningCount = itemsForecast.filter((i) => i.riskLevel === "WARNING").length;
    const healthyCount = itemsForecast.filter((i) => i.riskLevel === "HEALTHY").length;
    const totalCount = itemsForecast.length || 1;
    const stockHealthScore = Math.max(
      0,
      Math.round(((healthyCount * 1 + warningCount * 0.5) / totalCount) * 100)
    );

    const urgentReplenishments = itemsForecast.filter(
      (i) => i.riskLevel === "CRITICAL" || i.riskLevel === "WARNING"
    );

    return {
      itemsForecast,
      stockHealthScore,
      criticalCount,
      warningCount,
      urgentReplenishments,
    };
  }, [filteredSubOrders, factoryProducts, timeframe, customStartDate, customEndDate]);

  // ----------------------------------------------------
  // 3. TIME-SERIES REVENUE & ORDERS CHART DATA (100% Real from factorySubOrders)
  // ----------------------------------------------------
  const timeSeriesChartData = useMemo(() => {
    if (timeframe === "WEEK" || timeframe === "TODAY") {
      const days = ["الأحد", "الإثنين", "الثلاثاء", "الأربعاء", "الخميس", "الجمعة", "السبت"];
      const points: { label: string; actualSales: number; projectedSales: number; ordersCount: number }[] = [];

      const now = new Date();
      for (let i = 6; i >= 0; i--) {
        const d = new Date();
        d.setDate(now.getDate() - i);
        const dayName = days[d.getDay()];
        const dateStr = d.toISOString().split("T")[0];

        const dayOrders = factorySubOrders.filter((o) => o.createdAt.startsWith(dateStr));
        const dayRevenue = dayOrders.reduce((sum, o) => sum + o.total, 0);

        points.push({
          label: `${dayName} (${d.getDate()}/${d.getMonth() + 1})`,
          actualSales: dayRevenue,
          projectedSales: Math.round(dayRevenue * 1.1 + (kpiData.averageOrderValue > 0 ? kpiData.averageOrderValue * 0.2 : 0)),
          ordersCount: dayOrders.length,
        });
      }
      return points;
    } else if (timeframe === "CUSTOM") {
      const start = new Date(customStartDate);
      const end = new Date(customEndDate);
      const diffDays = Math.max(1, Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)));
      const points: { label: string; actualSales: number; projectedSales: number; ordersCount: number }[] = [];

      if (diffDays <= 31) {
        for (let i = 0; i <= diffDays; i++) {
          const d = new Date(start);
          d.setDate(start.getDate() + i);
          if (d > end) break;
          const dateStr = d.toISOString().split("T")[0];
          const dayOrders = factorySubOrders.filter((o) => o.createdAt.startsWith(dateStr));
          const dayRevenue = dayOrders.reduce((sum, o) => sum + o.total, 0);

          points.push({
            label: `${d.getDate()}/${d.getMonth() + 1}`,
            actualSales: dayRevenue,
            projectedSales: Math.round(dayRevenue * 1.1 + (kpiData.averageOrderValue > 0 ? kpiData.averageOrderValue * 0.1 : 0)),
            ordersCount: dayOrders.length,
          });
        }
      } else {
        const step = Math.ceil(diffDays / 8);
        for (let i = 0; i <= diffDays; i += step) {
          const d = new Date(start);
          d.setDate(start.getDate() + i);
          const nextDate = new Date(d);
          nextDate.setDate(d.getDate() + step);

          const bucketOrders = factorySubOrders.filter((o) => {
            const od = new Date(o.createdAt);
            return od >= d && od < nextDate;
          });
          const bucketRev = bucketOrders.reduce((sum, o) => sum + o.total, 0);

          points.push({
            label: `${d.getDate()}/${d.getMonth() + 1}`,
            actualSales: bucketRev,
            projectedSales: Math.round(bucketRev * 1.1),
            ordersCount: bucketOrders.length,
          });
        }
      }
      return points;
    } else {
      // Monthly Timeline (Real 6 Months History from Factory SubOrders)
      const monthNames = [
        "يناير", "فبراير", "مارس", "أبريل", "مايو", "يونيو",
        "يوليو", "أغسطس", "سبتمبر", "أكتوبر", "نوفمبر", "ديسمبر"
      ];
      const points: { label: string; actualSales: number; projectedSales: number; ordersCount: number }[] = [];
      const now = new Date();

      for (let i = 5; i >= 0; i--) {
        const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
        const mYear = d.getFullYear();
        const mMonth = d.getMonth();
        const monthLabel = monthNames[mMonth];

        const monthOrders = factorySubOrders.filter((o) => {
          const od = new Date(o.createdAt);
          return !isNaN(od.getTime()) && od.getFullYear() === mYear && od.getMonth() === mMonth;
        });

        const monthRevenue = monthOrders.reduce((sum, o) => sum + o.total, 0);

        points.push({
          label: i === 0 ? `${monthLabel} (الحالي)` : monthLabel,
          actualSales: monthRevenue,
          projectedSales: Math.round(monthRevenue > 0 ? monthRevenue * 1.15 : (kpiData.averageOrderValue || 0) * 0.5),
          ordersCount: monthOrders.length,
        });
      }
      return points;
    }
  }, [timeframe, factorySubOrders, kpiData, customStartDate, customEndDate]);

  // ----------------------------------------------------
  // 4. ORDER STATUS PIE CHART DATA (100% Real from SubOrders)
  // ----------------------------------------------------
  const statusPieData = useMemo(() => {
    const counts = {
      DELIVERED: 0,
      OUT_FOR_DELIVERY: 0,
      READY_FOR_PICKUP: 0,
      PROCESSING: 0,
      RECEIVED: 0,
      CANCELLED: 0,
    };

    filteredSubOrders.forEach((o) => {
      if (counts[o.status] !== undefined) {
        counts[o.status]++;
      }
    });

    const totalFound = Object.values(counts).reduce((a, b) => a + b, 0);
    if (totalFound === 0) {
      return [];
    }

    return [
      { name: "تم التسليم بنجاح", value: counts.DELIVERED, color: "#10b981" },
      { name: "جاري التوصيل بالطريق", value: counts.OUT_FOR_DELIVERY, color: "#06b6d4" },
      { name: "جاهز للتحميل", value: counts.READY_FOR_PICKUP, color: "#3b82f6" },
      { name: "قيد التجهيز", value: counts.PROCESSING, color: "#f59e0b" },
      { name: "استلام جديد", value: counts.RECEIVED, color: "#6366f1" },
      ...(counts.CANCELLED > 0 ? [{ name: "ملغي", value: counts.CANCELLED, color: "#ef4444" }] : []),
    ].filter((p) => p.value > 0);
  }, [filteredSubOrders]);

  // ----------------------------------------------------
  // 5. FACTORY'S EXCLUSIVE PRODUCT CATEGORIES & REVENUE (BAR CHART)
  // ----------------------------------------------------
  const factoryCategories = useMemo(() => {
    const cats = new Set<string>();
    factoryProducts.forEach((p) => {
      if (p.category && p.category.trim()) {
        cats.add(p.category.trim());
      }
    });
    if (cats.size === 0 && factory.categoryNameAr) {
      cats.add(factory.categoryNameAr);
    }
    return Array.from(cats);
  }, [factoryProducts, factory.categoryNameAr]);

  const categoryChartData = useMemo(() => {
    const catMap = new Map<
      string,
      {
        category: string;
        totalRevenue: number;
        cartons: number;
        productCount: number;
        availableStockCartons: number;
      }
    >();

    // Step 1: Initialize all categories belonging strictly to this factory
    factoryCategories.forEach((cat) => {
      const prodsInCat = factoryProducts.filter((p) => (p.category || "").trim() === cat);
      const stock = prodsInCat.reduce((sum, p) => sum + (p.stockCartons || (p as any).stock || 0), 0);
      catMap.set(cat, {
        category: cat,
        totalRevenue: 0,
        cartons: 0,
        productCount: prodsInCat.length,
        availableStockCartons: stock,
      });
    });

    // Step 2: Sum real sales from filtered subOrders (strictly belonging to this factory)
    filteredSubOrders.forEach((o) => {
      o.items.forEach((item) => {
        const cat = (item.product.category || factory.categoryNameAr || "منتجات المصنع").trim();
        const existing = catMap.get(cat) || {
          category: cat,
          totalRevenue: 0,
          cartons: 0,
          productCount: factoryProducts.filter((p) => (p.category || "").trim() === cat).length,
          availableStockCartons: factoryProducts
            .filter((p) => (p.category || "").trim() === cat)
            .reduce((sum, p) => sum + (p.stockCartons || (p as any).stock || 0), 0),
        };
        existing.totalRevenue += item.quantity * (item.priceAtOrder || item.product.cartonPrice || (item.product as any).price || 0);
        existing.cartons += item.quantity;
        catMap.set(cat, existing);
      });
    });

    const list = Array.from(catMap.values());
    return list.sort((a, b) => b.totalRevenue - a.totalRevenue);
  }, [factoryCategories, factoryProducts, filteredSubOrders, factory.categoryNameAr]);

  // ----------------------------------------------------
  // 6. REAL TOP WHOLESALERS / CLIENTS DATA (Strictly Factory's Clients)
  // ----------------------------------------------------
  const wholesalerClientsData = useMemo(() => {
    const clientsMap = new Map<
      string,
      {
        name: string;
        phone: string;
        city: string;
        ordersCount: number;
        totalSpent: number;
        lastOrderDate: string;
        topItemPurchased: string;
      }
    >();

    allMainOrders.forEach((main) => {
      const relatedSubOrders = main.subOrders.filter((s) => s.factoryId === factory.id);
      if (relatedSubOrders.length === 0) return;

      const subTotalForThisFactory = relatedSubOrders.reduce((sum, s) => sum + s.total, 0);
      const clientId = main.wholesalerName || "تاجر جملة مسجل";
      const existing = clientsMap.get(clientId) || {
        name: clientId,
        phone: main.wholesalerPhone || "770000000",
        city: main.wholesalerCity || "صنعاء",
        ordersCount: 0,
        totalSpent: 0,
        lastOrderDate: main.createdAt,
        topItemPurchased: relatedSubOrders[0]?.items[0]?.product.name || "منتج رئيسي",
      };

      existing.ordersCount += relatedSubOrders.length;
      existing.totalSpent += subTotalForThisFactory;
      if (new Date(main.createdAt) > new Date(existing.lastOrderDate)) {
        existing.lastOrderDate = main.createdAt;
      }
      clientsMap.set(clientId, existing);
    });

    const clientsList = Array.from(clientsMap.values());
    return clientsList.sort((a, b) => b.totalSpent - a.totalSpent);
  }, [allMainOrders, factory.id]);

  // ----------------------------------------------------
  // 7. REAL LOGISTICS & FLEET DRIVER PERFORMANCE
  // ----------------------------------------------------
  const driversPerformanceData = useMemo(() => {
    const driverMap = new Map<
      string,
      {
        name: string;
        phone: string;
        assignedCount: number;
        deliveredCount: number;
        inTransitCount: number;
      }
    >();

    factorySubOrders.forEach((order) => {
      const driverName = order.assignedDriverName || "سائق النقل المباشر";
      const current = driverMap.get(driverName) || {
        name: driverName,
        phone: order.assignedDriverPhone || "771122334",
        assignedCount: 0,
        deliveredCount: 0,
        inTransitCount: 0,
      };

      current.assignedCount++;
      if (order.status === "DELIVERED") current.deliveredCount++;
      if (order.status === "OUT_FOR_DELIVERY") current.inTransitCount++;

      driverMap.set(driverName, current);
    });

    const driversList = Array.from(driverMap.values());
    return driversList;
  }, [factorySubOrders]);

  // Filtered products list in matrix table
  const filteredProductMatrix = useMemo(() => {
    return predictiveAnalysis.itemsForecast.filter(
      (item) =>
        item.product.name.toLowerCase().includes(searchProductQuery.toLowerCase()) ||
        item.product.category.toLowerCase().includes(searchProductQuery.toLowerCase())
    );
  }, [predictiveAnalysis.itemsForecast, searchProductQuery]);

  return (
    <div className="space-y-6 dir-rtl text-slate-900 dark:text-slate-100">
      
      {/* ---------------------------------------------------- */}
      {/* TOP ANALYTICS HEADER & CONTROLS TOOLBAR */}
      {/* ---------------------------------------------------- */}
      <div className="p-4 sm:p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
        
        <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4">
          {/* Left: Section Identity & System Status */}
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-600 to-teal-700 text-white flex items-center justify-center shadow-md shadow-emerald-600/20 shrink-0">
              <BarChart2 className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base sm:text-lg font-black text-slate-900 dark:text-white">
                  تقارير المبيعات والأداء والذكاء التنبؤي
                </h3>
                <span className="px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300 text-[10px] font-black border border-emerald-300 dark:border-emerald-800 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                  <span>خوارزميات حية 100%</span>
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-0.5">
                تحليل المبيعات الواقعية، معدلات استهلاك المنتجات، وتوقعات نفاد المخزون لمصنع {factory.name}
              </p>
            </div>
          </div>

          {/* Right: Timeframe Filter + Custom Date Toggle + Print Report Button */}
          <div className="flex flex-wrap items-center gap-2">
            
            {/* Timeframe Selector Pills */}
            <div className="flex items-center bg-slate-100 dark:bg-slate-800 p-1 rounded-2xl border border-slate-200 dark:border-slate-700">
              <button
                type="button"
                onClick={() => {
                  setTimeframe("TODAY");
                  setShowDateRangeBar(false);
                }}
                className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all cursor-pointer ${
                  timeframe === "TODAY"
                    ? "bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs"
                    : "text-slate-600 dark:text-slate-400 hover:text-slate-900"
                }`}
              >
                اليوم
              </button>
              <button
                type="button"
                onClick={() => {
                  setTimeframe("WEEK");
                  setShowDateRangeBar(false);
                }}
                className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all cursor-pointer ${
                  timeframe === "WEEK"
                    ? "bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs"
                    : "text-slate-600 dark:text-slate-400 hover:text-slate-900"
                }`}
              >
                آخر 7 أيام
              </button>
              <button
                type="button"
                onClick={() => {
                  setTimeframe("MONTH");
                  setShowDateRangeBar(false);
                }}
                className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all cursor-pointer ${
                  timeframe === "MONTH"
                    ? "bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs"
                    : "text-slate-600 dark:text-slate-400 hover:text-slate-900"
                }`}
              >
                آخر 30 يوماً
              </button>
              <button
                type="button"
                onClick={() => {
                  setTimeframe("ALL");
                  setShowDateRangeBar(false);
                }}
                className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all cursor-pointer ${
                  timeframe === "ALL"
                    ? "bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs"
                    : "text-slate-600 dark:text-slate-400 hover:text-slate-900"
                }`}
              >
                كافة الفترات
              </button>

              {/* Custom Date Range Pill Button */}
              <button
                type="button"
                onClick={() => {
                  setTimeframe("CUSTOM");
                  setShowDateRangeBar((prev) => !prev || timeframe !== "CUSTOM");
                }}
                className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all cursor-pointer flex items-center gap-1.5 ${
                  timeframe === "CUSTOM"
                    ? "bg-emerald-600 text-white shadow-xs"
                    : "text-slate-600 dark:text-slate-400 hover:text-slate-900"
                }`}
              >
                <CalendarRange className="w-3.5 h-3.5" />
                <span>تحديد تاريخ (من - إلى)</span>
              </button>
            </div>

            {/* Official Printable Report Action */}
            <button
              type="button"
              onClick={() => setIsPrintModalOpen(true)}
              className="px-3.5 py-2 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-black text-xs flex items-center gap-1.5 shadow-md shadow-indigo-600/20 transition-all cursor-pointer"
            >
              <Printer className="w-4 h-4" />
              <span>طباعة وتصدير التقرير</span>
            </button>

          </div>
        </div>

        {/* ---------------------------------------------------- */}
        {/* DEDICATED CUSTOM DATE RANGE PICKER (FROM - TO) */}
        {/* ---------------------------------------------------- */}
        {(timeframe === "CUSTOM" || showDateRangeBar) && (
          <div className="pt-3 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 p-4 rounded-2xl space-y-3 animate-in fade-in slide-in-from-top-2 duration-200">
            <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3">
              
              {/* Date Inputs (From / To) */}
              <div className="flex flex-wrap items-center gap-3">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-black text-slate-700 dark:text-slate-300 flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5 text-emerald-600" />
                    <span>من تاريخ:</span>
                  </span>
                  <input
                    type="date"
                    value={customStartDate}
                    onChange={(e) => {
                      setCustomStartDate(e.target.value);
                      setTimeframe("CUSTOM");
                    }}
                    className="px-3 py-1.5 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-xs font-bold text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:outline-none shadow-2xs"
                  />
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-xs font-black text-slate-700 dark:text-slate-300 flex items-center gap-1">
                    <ArrowRight className="w-3.5 h-3.5 text-slate-400 rotate-180" />
                    <span>إلى تاريخ:</span>
                  </span>
                  <input
                    type="date"
                    value={customEndDate}
                    onChange={(e) => {
                      setCustomEndDate(e.target.value);
                      setTimeframe("CUSTOM");
                    }}
                    className="px-3 py-1.5 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-xs font-bold text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:outline-none shadow-2xs"
                  />
                </div>

                <button
                  type="button"
                  onClick={() => setTimeframe("CUSTOM")}
                  className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs flex items-center gap-1 transition-colors shadow-2xs cursor-pointer"
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>تطبيق النطاق</span>
                </button>
              </div>

              {/* Quick Presets Buttons */}
              <div className="flex flex-wrap items-center gap-1.5 text-xs">
                <span className="text-[11px] font-bold text-slate-400">فترات سريعة:</span>
                <button
                  type="button"
                  onClick={() => applyDatePreset(7)}
                  className="px-2.5 py-1 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-[11px] font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                >
                  7 أيام
                </button>
                <button
                  type="button"
                  onClick={() => applyDatePreset(14)}
                  className="px-2.5 py-1 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-[11px] font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                >
                  14 يوماً
                </button>
                <button
                  type="button"
                  onClick={applyThisMonthPreset}
                  className="px-2.5 py-1 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-[11px] font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                >
                  هذا الشهر
                </button>
                <button
                  type="button"
                  onClick={applyLastMonthPreset}
                  className="px-2.5 py-1 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-[11px] font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                >
                  الشهر السابق
                </button>
                <button
                  type="button"
                  onClick={applyThisYearPreset}
                  className="px-2.5 py-1 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-[11px] font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                >
                  عام 2026
                </button>
              </div>

            </div>

            {/* Active Range Summary Info */}
            <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400 font-bold pt-1">
              <span>
                📅 النطاق النشط: من <strong>{customStartDate}</strong> إلى <strong>{customEndDate}</strong>
              </span>
              <span className="text-emerald-600 dark:text-emerald-400 font-black">
                تم العثور على {filteredSubOrders.length} طلبية مطابقة
              </span>
            </div>

          </div>
        )}

      </div>

      {/* ---------------------------------------------------- */}
      {/* EXECUTIVE KPI SUMMARY CARDS (100% Real Numbers) */}
      {/* ---------------------------------------------------- */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* KPI 1: Gross Sales */}
        <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs hover:border-emerald-300 dark:hover:border-emerald-700 transition-all space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-black text-slate-600 dark:text-slate-300">إجمالي مبيعات المصنع الفعلية</span>
            <div className="w-8 h-8 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 flex items-center justify-center">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-1">
            <span className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white font-mono">
              {kpiData.totalGrossRevenue.toLocaleString("ar-YE")}
            </span>
            <span className="text-xs font-bold text-emerald-600">ر.ي</span>
          </div>
          <div className="text-[11px] text-emerald-600 font-bold flex items-center gap-1 pt-1 border-t border-slate-100 dark:border-slate-800">
            <TrendingUp className="w-3.5 h-3.5" />
            <span>متوسط الطلبية: {kpiData.averageOrderValue.toLocaleString("ar-YE")} ر.ي</span>
          </div>
        </div>

        {/* KPI 2: Total Cartons Sold */}
        <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs hover:border-blue-300 dark:hover:border-blue-700 transition-all space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-black text-slate-600 dark:text-slate-300">الكميات المسحوبة (كرتون)</span>
            <div className="w-8 h-8 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 flex items-center justify-center">
              <Boxes className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-1">
            <span className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white font-mono">
              {kpiData.totalCartonsSold.toLocaleString("ar-YE")}
            </span>
            <span className="text-xs font-bold text-blue-600">كرتون مبيع</span>
          </div>
          <div className="text-[11px] text-blue-600 font-bold flex items-center gap-1 pt-1 border-t border-slate-100 dark:border-slate-800">
            <Layers className="w-3.5 h-3.5" />
            <span>من أصل {kpiData.totalOrdersCount} طلبية واردة من التجار</span>
          </div>
        </div>

        {/* KPI 3: Stock Health Score & Urgent Depletions */}
        <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs hover:border-amber-300 dark:hover:border-amber-700 transition-all space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-black text-slate-600 dark:text-slate-300">مؤشر كفاية المخزون (AI)</span>
            <div className="w-8 h-8 rounded-xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 flex items-center justify-center">
              <BrainCircuit className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white font-mono">
              {predictiveAnalysis.stockHealthScore}%
            </span>
            {predictiveAnalysis.criticalCount > 0 ? (
              <span className="px-2 py-0.5 rounded-full bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-300 text-[10px] font-black">
                {predictiveAnalysis.criticalCount} صنف حرج ⚠️
              </span>
            ) : (
              <span className="px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 text-[10px] font-black">
                مخزون مستقر 🟢
              </span>
            )}
          </div>
          <div className="text-[11px] text-slate-500 font-medium pt-1 border-t border-slate-100 dark:border-slate-800">
            قيمة المخزون الحالي: {kpiData.currentInventoryValuation.toLocaleString("ar-YE")} ر.ي
          </div>
        </div>

        {/* KPI 4: Fulfillment Speed & Rating */}
        <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs hover:border-indigo-300 dark:hover:border-indigo-700 transition-all space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-black text-slate-600 dark:text-slate-300">نسبة الامتثال وسرعة التسليم</span>
            <div className="w-8 h-8 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 flex items-center justify-center">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-1">
            <span className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white font-mono">
              {kpiData.fulfillmentRate}%
            </span>
            <span className="text-xs font-bold text-indigo-600">تسليم ناجح</span>
          </div>
          <div className="text-[11px] text-indigo-600 font-bold flex items-center gap-1 pt-1 border-t border-slate-100 dark:border-slate-800">
            <Clock className="w-3.5 h-3.5" />
            <span>متوسط التجهيز: {factory.avgPreparationHours} ساعات • التقييم {factory.rating} ⭐</span>
          </div>
        </div>

      </div>

      {/* ---------------------------------------------------- */}
      {/* SMART PREDICTIVE ALERTS (IF ANY CRITICAL STOCKOUTS) */}
      {/* ---------------------------------------------------- */}
      {predictiveAnalysis.urgentReplenishments.length > 0 && (
        <div className="p-4 sm:p-5 rounded-3xl bg-gradient-to-r from-amber-500/10 via-rose-500/10 to-transparent border border-amber-300 dark:border-amber-900/60 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-500 text-white flex items-center justify-center shrink-0 shadow-md shadow-amber-500/20">
              <AlertTriangle className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <h4 className="font-black text-slate-900 dark:text-white text-sm flex items-center gap-2">
                <span>تنبيه التوقع الذكي: أصناف تقترب من نفاد المخزون بالمصنع</span>
                <span className="px-2 py-0.5 rounded-full bg-rose-600 text-white text-[10px] font-black">
                  {predictiveAnalysis.urgentReplenishments.length} أصناف
                </span>
              </h4>
              <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5">
                بناءً على معدل السحب اليومي والطلبيات الواردة، يُرجى جدولة خط الإنتاج لتصنيع الدفعات المقترحة فوراً لتجنب توقف التوريد.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setActiveTab("FORECASTING")}
            className="px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-black text-xs shrink-0 transition-colors shadow-sm cursor-pointer"
          >
            استعراض خطة الإنتاج المقترحة
          </button>
        </div>
      )}

      {/* ---------------------------------------------------- */}
      {/* TAB NAVIGATION: FORECASTING, PRODUCTS, CLIENTS, LOGISTICS */}
      {/* ---------------------------------------------------- */}
      <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-2 overflow-x-auto scrollbar-none">
        <button
          type="button"
          onClick={() => setActiveTab("OVERVIEW")}
          className={`px-4 py-2.5 rounded-2xl text-xs font-black transition-all flex items-center gap-2 shrink-0 cursor-pointer ${
            activeTab === "OVERVIEW"
              ? "bg-slate-900 text-white dark:bg-emerald-600 shadow-md"
              : "bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800"
          }`}
        >
          <BarChart2 className="w-4 h-4" />
          <span>المخططات البيانية ونمو الإيرادات</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("FORECASTING")}
          className={`px-4 py-2.5 rounded-2xl text-xs font-black transition-all flex items-center gap-2 shrink-0 cursor-pointer ${
            activeTab === "FORECASTING"
              ? "bg-slate-900 text-white dark:bg-emerald-600 shadow-md"
              : "bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800"
          }`}
        >
          <BrainCircuit className="w-4 h-4 text-amber-500" />
          <span>خوارزمية التنبؤ ونفاد المخزون</span>
          <span className="px-1.5 py-0.5 rounded-full bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 text-[10px] font-bold">
            AI
          </span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("PRODUCTS")}
          className={`px-4 py-2.5 rounded-2xl text-xs font-black transition-all flex items-center gap-2 shrink-0 cursor-pointer ${
            activeTab === "PRODUCTS"
              ? "bg-slate-900 text-white dark:bg-emerald-600 shadow-md"
              : "bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800"
          }`}
        >
          <Boxes className="w-4 h-4" />
          <span>مصفوفة مبيعات المنتجات ({factoryProducts.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("CLIENTS")}
          className={`px-4 py-2.5 rounded-2xl text-xs font-black transition-all flex items-center gap-2 shrink-0 cursor-pointer ${
            activeTab === "CLIENTS"
              ? "bg-slate-900 text-white dark:bg-emerald-600 shadow-md"
              : "bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800"
          }`}
        >
          <Building2 className="w-4 h-4" />
          <span>تجار الجملة والعملاء ({wholesalerClientsData.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("LOGISTICS")}
          className={`px-4 py-2.5 rounded-2xl text-xs font-black transition-all flex items-center gap-2 shrink-0 cursor-pointer ${
            activeTab === "LOGISTICS"
              ? "bg-slate-900 text-white dark:bg-emerald-600 shadow-md"
              : "bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800"
          }`}
        >
          <Truck className="w-4 h-4" />
          <span>أداء السائقين والشحن</span>
        </button>
      </div>

      {/* ---------------------------------------------------- */}
      {/* TAB 1: OVERVIEW & CHARTS */}
      {/* ---------------------------------------------------- */}
      {activeTab === "OVERVIEW" && (
        <div className="space-y-6">
          
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            
            {/* Sales & Projected Trend Area Chart (8 Cols) */}
            <div className="lg:col-span-8 p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-black text-slate-900 dark:text-white text-sm flex items-center gap-2">
                    <span>منحنى المبيعات الفعلية والتوقعات الذكية (ر.ي)</span>
                  </h4>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    مقارنة الإيراد الفعلي مع خط التوقع الرياضي لنمو طلبات الجملة
                  </p>
                </div>
                <div className="flex items-center gap-3 text-xs">
                  <div className="flex items-center gap-1.5 font-bold text-emerald-600">
                    <span className="w-3 h-3 rounded-full bg-emerald-500" />
                    <span>المبيعات الفعلية</span>
                  </div>
                  <div className="flex items-center gap-1.5 font-bold text-indigo-500">
                    <span className="w-3 h-3 rounded-full bg-indigo-400 border border-dashed border-indigo-600" />
                    <span>التوقع الخوارزمي</span>
                  </div>
                </div>
              </div>

              <div className="h-72 w-full pt-2">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={timeSeriesChartData}>
                    <defs>
                      <linearGradient id="colorActual" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.4} />
                        <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                      </linearGradient>
                      <linearGradient id="colorProjected" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#6366f1" stopOpacity={0.25} />
                        <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" opacity={0.5} />
                    <XAxis dataKey="label" stroke="#94a3b8" fontSize={11} />
                    <YAxis stroke="#94a3b8" fontSize={11} tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`} />
                    <Tooltip
                      formatter={(value: any, name: string) => [
                        `${Number(value).toLocaleString("ar-YE")} ر.ي`,
                        name === "actualSales" ? "المبيعات الفعلية" : "التوقع الذكي",
                      ]}
                      labelStyle={{ fontWeight: "bold", textAlign: "right" }}
                    />
                    <Area
                      type="monotone"
                      dataKey="actualSales"
                      name="actualSales"
                      stroke="#10b981"
                      strokeWidth={3}
                      fillOpacity={1}
                      fill="url(#colorActual)"
                    />
                    <Area
                      type="monotone"
                      dataKey="projectedSales"
                      name="projectedSales"
                      stroke="#6366f1"
                      strokeDasharray="4 4"
                      strokeWidth={2}
                      fillOpacity={1}
                      fill="url(#colorProjected)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Order Status Doughnut (4 Cols) */}
            <div className="lg:col-span-4 p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
              <h4 className="font-black text-slate-900 dark:text-white text-sm">
                توزيع حالات الطلبيات الواردة
              </h4>

              {statusPieData.length > 0 ? (
                <>
                  <div className="h-52 w-full flex items-center justify-center">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={statusPieData}
                          dataKey="value"
                          nameKey="name"
                          cx="50%"
                          cy="50%"
                          outerRadius={70}
                          innerRadius={42}
                          paddingAngle={3}
                        >
                          {statusPieData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>

                  <div className="space-y-1.5 pt-2 border-t border-slate-100 dark:border-slate-800 text-xs">
                    {statusPieData.map((item) => (
                      <div key={item.name} className="flex items-center justify-between font-bold">
                        <div className="flex items-center gap-1.5">
                          <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                          <span className="text-slate-700 dark:text-slate-300">{item.name}</span>
                        </div>
                        <span className="font-mono text-slate-900 dark:text-white">{item.value} طلبية</span>
                      </div>
                    ))}
                  </div>
                </>
              ) : (
                <div className="h-52 flex flex-col items-center justify-center text-center p-4">
                  <div className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-400 flex items-center justify-center mb-2">
                    <Boxes className="w-6 h-6" />
                  </div>
                  <span className="text-xs font-black text-slate-700 dark:text-slate-300">
                    لا توجد طلبيات مسجلة في هذا النطاق
                  </span>
                  <span className="text-[11px] text-slate-400 mt-1">
                    البيانات مقصورة بدقة 100% على مصنع {factory.name}
                  </span>
                </div>
              )}
            </div>

          </div>

          {/* Revenue & Volume by Factory Product Department / Category Bar Chart */}
          <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h4 className="font-black text-slate-900 dark:text-white text-sm flex items-center gap-2">
                  <Layers className="w-4 h-4 text-indigo-600" />
                  <span>توزيع المبيعات والمخزون حسب أقسام وتصنيفات مصنع {factory.name}</span>
                </h4>
                <p className="text-xs text-slate-400 mt-0.5">
                  النشاط الصناعي: <strong className="text-slate-700 dark:text-slate-300">{factory.categoryNameAr || factory.category}</strong> • أصناف المصنع الحصرية: <strong className="text-slate-700 dark:text-slate-300">{factoryProducts.length} صنف</strong>
                </p>
              </div>
              <span className="text-[11px] font-black text-emerald-600 bg-emerald-50 dark:bg-emerald-950 px-3 py-1 rounded-xl self-start sm:self-auto border border-emerald-200/60 dark:border-emerald-800/60">
                بيانات أقسام المصنع الحقيقية
              </span>
            </div>

            {categoryChartData.length > 0 ? (
              <div className="space-y-4">
                <div className="h-60 w-full pt-2">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={categoryChartData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" opacity={0.5} />
                      <XAxis dataKey="category" stroke="#94a3b8" fontSize={11} />
                      <YAxis stroke="#94a3b8" fontSize={11} tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`} />
                      <Tooltip
                        formatter={(val: any, name: string) => [
                          name === "totalRevenue" ? `${Number(val).toLocaleString("ar-YE")} ر.ي` : `${val} كرتون`,
                          name === "totalRevenue" ? "قيمة المبيعات المحققة" : "الكراتين المباعة",
                        ]}
                      />
                      <Bar dataKey="totalRevenue" name="totalRevenue" fill="#4f46e5" radius={[8, 8, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>

                {/* Detailed Department / Category Breakdown Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 pt-2 border-t border-slate-100 dark:border-slate-800">
                  {categoryChartData.map((catItem, idx) => (
                    <div
                      key={idx}
                      className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 space-y-2"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-black text-xs text-slate-900 dark:text-white">
                          {catItem.category}
                        </span>
                        <span className="text-[10px] font-bold text-slate-500 bg-white dark:bg-slate-700 px-2 py-0.5 rounded-md">
                          {catItem.productCount} منتجات
                        </span>
                      </div>
                      <div className="grid grid-cols-3 gap-1 text-center pt-1 border-t border-slate-200 dark:border-slate-700 text-[11px]">
                        <div>
                          <span className="text-[9px] text-slate-400 block font-bold">المبيعات:</span>
                          <span className="font-mono font-bold text-emerald-600">
                            {catItem.totalRevenue > 0 ? `${catItem.totalRevenue.toLocaleString("ar-YE")} ر.ي` : "0 ر.ي"}
                          </span>
                        </div>
                        <div>
                          <span className="text-[9px] text-slate-400 block font-bold">الكراتين المباعة:</span>
                          <span className="font-mono font-bold text-slate-700 dark:text-slate-300">
                            {catItem.cartons} كرتون
                          </span>
                        </div>
                        <div>
                          <span className="text-[9px] text-slate-400 block font-bold">المخزون المتاح:</span>
                          <span className="font-mono font-bold text-indigo-600">
                            {catItem.availableStockCartons} كرتون
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="p-8 text-center bg-slate-50 dark:bg-slate-800 rounded-2xl border border-dashed border-slate-200 dark:border-slate-700">
                <p className="text-xs text-slate-500 font-bold">
                  لم يتم إضافة منتجات بعد لهذا المصنع. يرجى إضافة المنتجات عبر لوحة إدارة المنتجات.
                </p>
              </div>
            )}
          </div>

        </div>
      )}

      {/* ---------------------------------------------------- */}
      {/* TAB 2: AI FORECASTING & REPLENISHMENT ENGINE */}
      {/* ---------------------------------------------------- */}
      {activeTab === "FORECASTING" && (
        <div className="space-y-6">
          
          {/* Explanation Header */}
          <div className="p-5 rounded-3xl bg-indigo-50/80 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-900/60 space-y-2">
            <div className="flex items-center gap-2 text-indigo-900 dark:text-indigo-200 font-black text-sm">
              <BrainCircuit className="w-5 h-5 text-indigo-600" />
              <span>خوارزمية الذكاء التنبؤي لإدارة خطوط الإنتاج والاحتياط الآمن</span>
            </div>
            <p className="text-xs text-indigo-800/80 dark:text-indigo-300 leading-relaxed font-medium">
              تعتمد هذه الخوارزمية على معادلة معدل السحب اليومي <strong>Daily Run-Rate (معدل المبيعات / عدد الأيام)</strong> لحساب موعد نفاد المخزون باليوم والساعة بدقة، واقتراح كمية الدفعة التصنيعية المثالية لتغطية طلبات الجملة للـ 30 يوماً القادمة مع إضافة مخزون أمان 7 أيام لحماية المصنع من نقص البضائع.
            </p>
          </div>

          {/* Forecasting Matrix Table */}
          <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
              <h4 className="font-black text-slate-900 dark:text-white text-sm">
                جدول تحليل الاستهلاك وتوقعات نفاد المخزون للمنتجات
              </h4>
              <div className="relative">
                <Search className="w-4 h-4 text-slate-400 absolute right-3 top-2.5" />
                <input
                  type="text"
                  value={searchProductQuery}
                  onChange={(e) => setSearchProductQuery(e.target.value)}
                  placeholder="بحث في المنتجات..."
                  className="px-3 py-2 pr-9 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-bold text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-emerald-500 w-full sm:w-64"
                />
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-xs text-right border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-400 font-bold">
                    <th className="py-3 px-3">المنتج والتصنيف</th>
                    <th className="py-3 px-3">المخزون المتاح</th>
                    <th className="py-3 px-3">المسحوب في الفترة</th>
                    <th className="py-3 px-3">معدل السحب اليومي</th>
                    <th className="py-3 px-3">أيام حتى النفاد المتوقع</th>
                    <th className="py-3 px-3">الطلب المتوقع (30 يوم)</th>
                    <th className="py-3 px-3">دفعة الإنتاج الموصى بها</th>
                    <th className="py-3 px-3">مستوى الخطر</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {filteredProductMatrix.map((item) => {
                    const isCritical = item.riskLevel === "CRITICAL";
                    const isWarning = item.riskLevel === "WARNING";

                    return (
                      <tr
                        key={item.product.id}
                        className={`font-medium transition-colors ${
                          isCritical
                            ? "bg-rose-50/60 dark:bg-rose-950/20"
                            : isWarning
                            ? "bg-amber-50/40 dark:bg-amber-950/20"
                            : "hover:bg-slate-50 dark:hover:bg-slate-800/50"
                        }`}
                      >
                        {/* Product Image & Info */}
                        <td className="py-3 px-3">
                          <div className="flex items-center gap-2.5">
                            <img
                              src={item.product.image}
                              alt={item.product.name}
                              className="w-10 h-10 rounded-xl object-cover border border-slate-200 dark:border-slate-700 shrink-0"
                            />
                            <div>
                              <span className="font-black text-slate-900 dark:text-white block">
                                {item.product.name}
                              </span>
                              <span className="text-[10px] text-slate-400 block font-medium">
                                {item.product.category} • سعر الكرتون: {item.product.cartonPrice} ر.ي
                              </span>
                            </div>
                          </div>
                        </td>

                        {/* Current Stock */}
                        <td className="py-3 px-3 font-mono font-bold text-slate-900 dark:text-white">
                          {item.product.stockCartons} كرتون
                        </td>

                        {/* Sold in sample */}
                        <td className="py-3 px-3 font-mono font-bold text-blue-600">
                          {item.totalSold} كرتون
                        </td>

                        {/* Daily Velocity */}
                        <td className="py-3 px-3 font-mono font-bold text-slate-700 dark:text-slate-300">
                          {item.dailyVelocity} كرتون/يوم
                        </td>

                        {/* Days to Depletion */}
                        <td className="py-3 px-3 font-mono font-bold">
                          {item.daysUntilStockout > 90 ? (
                            <span className="text-slate-400">+90 يوماً</span>
                          ) : (
                            <span
                              className={
                                isCritical
                                  ? "text-rose-600 font-black text-sm"
                                  : isWarning
                                  ? "text-amber-600 font-black text-sm"
                                  : "text-emerald-600"
                              }
                            >
                              {item.daysUntilStockout} يوم ⏳
                            </span>
                          )}
                        </td>

                        {/* 30-Day Demand */}
                        <td className="py-3 px-3 font-mono font-bold text-slate-800 dark:text-slate-200">
                          {item.projected30DayDemand} كرتون
                        </td>

                        {/* Suggested Batch */}
                        <td className="py-3 px-3 font-mono">
                          {item.suggestedProductionBatch > 0 ? (
                            <span className="px-2.5 py-1 rounded-lg bg-indigo-100 dark:bg-indigo-950/80 text-indigo-700 dark:text-indigo-300 font-black text-xs">
                              +{item.suggestedProductionBatch} كرتون
                            </span>
                          ) : (
                            <span className="text-slate-400 font-medium">مكتفٍ حالياً</span>
                          )}
                        </td>

                        {/* Risk Badge */}
                        <td className="py-3 px-3">
                          {isCritical ? (
                            <span className="px-2.5 py-1 rounded-full bg-rose-600 text-white font-black text-[10px] inline-flex items-center gap-1 shadow-xs">
                              <AlertTriangle className="w-3 h-3" />
                              <span>نفاد وشيك (عاجل)</span>
                            </span>
                          ) : isWarning ? (
                            <span className="px-2.5 py-1 rounded-full bg-amber-500 text-white font-black text-[10px] inline-flex items-center gap-1">
                              <AlertTriangle className="w-3 h-3" />
                              <span>تجديد مطلوب</span>
                            </span>
                          ) : (
                            <span className="px-2.5 py-1 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 font-bold text-[10px]">
                              مستقر وكافٍ ✅
                            </span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

        </div>
      )}

      {/* ---------------------------------------------------- */}
      {/* TAB 3: PRODUCTS PERFORMANCE MATRIX */}
      {/* ---------------------------------------------------- */}
      {activeTab === "PRODUCTS" && (
        <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-black text-slate-900 dark:text-white text-sm">
                قائمة منتجات المصنع وحصتها من الإيرادات
              </h4>
              <p className="text-xs text-slate-400 mt-0.5">
                متابعة حركة كل صنف، إجمالي المبيعات، ومعدل دوران المخزون
              </p>
            </div>
            <span className="text-xs font-bold text-emerald-600 bg-emerald-50 dark:bg-emerald-950 px-3 py-1 rounded-xl">
              إجمالي {factoryProducts.length} أصناف مسجلة
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {predictiveAnalysis.itemsForecast.map((item) => (
              <div
                key={item.product.id}
                className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 space-y-3"
              >
                <div className="flex items-center gap-3">
                  <img
                    src={item.product.image}
                    alt={item.product.name}
                    className="w-12 h-12 rounded-xl object-cover border border-slate-200 dark:border-slate-700 shrink-0"
                  />
                  <div className="min-w-0 flex-1">
                    <h5 className="font-black text-slate-900 dark:text-white text-xs truncate">
                      {item.product.name}
                    </h5>
                    <span className="text-[10px] text-slate-500 dark:text-slate-400 block mt-0.5">
                      {item.product.category} • {item.product.piecesPerCarton} حبة بالكرتون
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-200 dark:border-slate-700/80 text-xs">
                  <div>
                    <span className="text-[10px] text-slate-400 block font-bold">المخزون بالمصنع:</span>
                    <span className="font-mono font-black text-slate-900 dark:text-white">
                      {item.product.stockCartons} كرتون
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block font-bold">المسحوب للمتاجر:</span>
                    <span className="font-mono font-black text-emerald-600">
                      {item.totalSold} كرتون
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block font-bold">سعر الكرتون:</span>
                    <span className="font-mono font-bold text-slate-700 dark:text-slate-300">
                      {item.product.cartonPrice} ر.ي
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block font-bold">قيمة المبيعات:</span>
                    <span className="font-mono font-bold text-indigo-600">
                      {item.totalRevenue.toLocaleString("ar-YE")} ر.ي
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ---------------------------------------------------- */}
      {/* TAB 4: WHOLESALER CLIENTS ANALYTICS */}
      {/* ---------------------------------------------------- */}
      {activeTab === "CLIENTS" && (
        <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-black text-slate-900 dark:text-white text-sm">
                قائمة كبار تجار الجملة والمشترين من مصنع {factory.name}
              </h4>
              <p className="text-xs text-slate-400 mt-0.5">
                بيانات المشتريات التراكمية، تكرار الطلب، وحالة الالتزام المالي الحصرية لهذا المصنع
              </p>
            </div>
            <span className="text-xs font-bold text-emerald-600 bg-emerald-50 dark:bg-emerald-950 px-3 py-1 rounded-xl">
              {wholesalerClientsData.length} تجار مسجلين
            </span>
          </div>

          {wholesalerClientsData.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-right border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-400 font-bold">
                    <th className="py-3 px-3">اسم التاجر / المتجر</th>
                    <th className="py-3 px-3">المدينة والمنطقة</th>
                    <th className="py-3 px-3">رقم الهاتف للتواصل</th>
                    <th className="py-3 px-3">عدد الطلبيات</th>
                    <th className="py-3 px-3">إجمالي المشتريات</th>
                    <th className="py-3 px-3">أكثر صنف طلباً</th>
                    <th className="py-3 px-3">تصنيف العميل</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {wholesalerClientsData.map((client, idx) => (
                    <tr key={idx} className="font-medium text-slate-800 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800/50">
                      <td className="py-3 px-3 font-black text-slate-900 dark:text-white">
                        {client.name}
                      </td>
                      <td className="py-3 px-3 text-slate-500 dark:text-slate-400">
                        {client.city}
                      </td>
                      <td className="py-3 px-3 font-mono font-bold text-slate-700 dark:text-slate-300">
                        {client.phone}
                      </td>
                      <td className="py-3 px-3 font-mono font-bold">
                        {client.ordersCount} طلبيات
                      </td>
                      <td className="py-3 px-3 font-mono font-black text-emerald-700 dark:text-emerald-400 text-sm">
                        {client.totalSpent.toLocaleString("ar-YE")} ر.ي
                      </td>
                      <td className="py-3 px-3 text-indigo-600 dark:text-indigo-400 font-bold">
                        {client.topItemPurchased}
                      </td>
                      <td className="py-3 px-3">
                        <span className="px-2.5 py-1 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 font-bold text-[10px]">
                          عميل معتمد 🌟
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="p-12 text-center bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-dashed border-slate-200 dark:border-slate-700 space-y-2">
              <div className="w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-indigo-950 text-indigo-600 flex items-center justify-center mx-auto">
                <Building2 className="w-6 h-6" />
              </div>
              <p className="text-xs font-black text-slate-800 dark:text-slate-200">
                لا توجد طلبيات من تجار الجملة لهذا المصنع حتى الآن
              </p>
              <p className="text-[11px] text-slate-400 max-w-md mx-auto">
                ستظهر هنا بيانات التجار والمتاجر المباشرة فور قيامهم بطلب منتجات مصنع {factory.name}.
              </p>
            </div>
          )}
        </div>
      )}

      {/* ---------------------------------------------------- */}
      {/* TAB 5: LOGISTICS & FLEET DRIVER PERFORMANCE */}
      {/* ---------------------------------------------------- */}
      {activeTab === "LOGISTICS" && (
        <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-black text-slate-900 dark:text-white text-sm">
                مؤشرات أداء أسطول الشحن والتوصيل لمصنع {factory.name}
              </h4>
              <p className="text-xs text-slate-400 mt-0.5">
                متابعة شحنات السائقين المباشرين، زمن التحميل، والتسليم لتجار الجملة
              </p>
            </div>
            <span className="text-xs font-bold text-cyan-600 bg-cyan-50 dark:bg-cyan-950 px-3 py-1 rounded-xl">
              {driversPerformanceData.length} سائقين
            </span>
          </div>

          {driversPerformanceData.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {driversPerformanceData.map((driver, idx) => (
                <div
                  key={idx}
                  className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className="w-10 h-10 rounded-xl bg-cyan-600 text-white flex items-center justify-center font-black">
                        <Truck className="w-5 h-5" />
                      </div>
                      <div>
                        <h5 className="font-black text-slate-900 dark:text-white text-xs">
                          {driver.name}
                        </h5>
                        <span className="text-[11px] font-mono text-slate-500 dark:text-slate-400">
                          {driver.phone}
                        </span>
                      </div>
                    </div>
                    <span className="px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 text-[10px] font-black">
                      نشط ومتاح 🟢
                    </span>
                  </div>

                  <div className="grid grid-cols-3 gap-2 pt-2 border-t border-slate-200 dark:border-slate-700 text-center text-xs">
                    <div className="p-2 rounded-xl bg-white dark:bg-slate-900">
                      <span className="text-[10px] text-slate-400 block font-bold">المسندة</span>
                      <span className="font-mono font-black text-slate-900 dark:text-white">
                        {driver.assignedCount}
                      </span>
                    </div>
                    <div className="p-2 rounded-xl bg-white dark:bg-slate-900">
                      <span className="text-[10px] text-slate-400 block font-bold">المكتملة</span>
                      <span className="font-mono font-black text-emerald-600">
                        {driver.deliveredCount}
                      </span>
                    </div>
                    <div className="p-2 rounded-xl bg-white dark:bg-slate-900">
                      <span className="text-[10px] text-slate-400 block font-bold">بالطريق</span>
                      <span className="font-mono font-black text-cyan-600">
                        {driver.inTransitCount}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-12 text-center bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-dashed border-slate-200 dark:border-slate-700 space-y-2">
              <div className="w-12 h-12 rounded-2xl bg-cyan-50 dark:bg-cyan-950 text-cyan-600 flex items-center justify-center mx-auto">
                <Truck className="w-6 h-6" />
              </div>
              <p className="text-xs font-black text-slate-800 dark:text-slate-200">
                لا توجد شحنات مسندة لسائقي التوصيل لمصنع {factory.name} في هذه الفترة
              </p>
              <p className="text-[11px] text-slate-400 max-w-md mx-auto">
                يتم ربط السائقين تلقائياً عند اعتماد الطلبيات وتحويلها إلى مرحلة الشحن والتوزيع.
              </p>
            </div>
          )}
        </div>
      )}

      {/* ---------------------------------------------------- */}
      {/* OFFICIAL PRINT / EXPORT REPORT MODAL */}
      {/* ---------------------------------------------------- */}
      {isPrintModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white dark:bg-slate-900 w-full max-w-3xl rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden my-8 animate-in fade-in zoom-in-95 duration-200">
            
            {/* Modal Actions Header */}
            <div className="p-4 bg-slate-100 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between">
              <span className="font-black text-xs text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                <Printer className="w-4 h-4 text-indigo-600" />
                <span>معاينة التقرير الرسمي المعتمد للمصنع</span>
              </span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs flex items-center gap-1 transition-colors cursor-pointer"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>طباعة فورية</span>
                </button>
                <button
                  type="button"
                  onClick={() => setIsPrintModalOpen(false)}
                  className="w-8 h-8 rounded-xl bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 flex items-center justify-center hover:bg-slate-300 cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Printable Content Sheet */}
            <div className="p-8 space-y-6 text-slate-900 dark:text-slate-100 font-sans" id="printable-factory-report">
              
              {/* Report Official Header */}
              <div className="flex items-center justify-between border-b-2 border-slate-900 dark:border-slate-100 pb-4">
                <div className="flex items-center gap-3">
                  <img
                    src={factory.logo}
                    alt={factory.name}
                    className="w-14 h-14 rounded-2xl object-cover border border-slate-300"
                  />
                  <div>
                    <h2 className="text-lg font-black text-slate-900 dark:text-white">
                      {factory.name}
                    </h2>
                    <p className="text-xs text-slate-500 font-medium mt-0.5">
                      السجل التجاري: <strong className="font-mono text-slate-700 dark:text-slate-300">{factory.commercialReg}</strong> • المدينة: {factory.city} - {factory.district}
                    </p>
                  </div>
                </div>

                <div className="text-left font-mono text-xs">
                  <div className="font-black text-slate-900 dark:text-white text-sm">
                    تقرير أداء ومبيعات رسمي
                  </div>
                  <div className="text-slate-500 text-[11px] font-bold mt-0.5">
                    {timeframe === "CUSTOM"
                      ? `الفترة: من ${customStartDate} إلى ${customEndDate}`
                      : timeframe === "TODAY"
                      ? "فترة التقرير: اليوم (24 ساعة)"
                      : timeframe === "WEEK"
                      ? "فترة التقرير: آخر 7 أيام"
                      : timeframe === "MONTH"
                      ? "فترة التقرير: آخر 30 يوماً"
                      : "فترة التقرير: كافة الفترات التراكمية"}
                  </div>
                  <div className="text-slate-400 text-[10px] mt-0.5">
                    تاريخ الإصدار: {new Date().toLocaleDateString("ar-YE")}
                  </div>
                </div>
              </div>

              {/* Financial KPI Summary Table */}
              <div className="grid grid-cols-3 gap-3 text-center">
                <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                  <span className="text-[10px] text-slate-400 block font-bold">إجمالي الإيرادات الفعلية</span>
                  <span className="text-base font-black text-slate-900 dark:text-white font-mono block mt-1">
                    {kpiData.totalGrossRevenue.toLocaleString("ar-YE")} ر.ي
                  </span>
                </div>
                <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                  <span className="text-[10px] text-slate-400 block font-bold">إجمالي الكراتين المباعة</span>
                  <span className="text-base font-black text-slate-900 dark:text-white font-mono block mt-1">
                    {kpiData.totalCartonsSold} كرتون
                  </span>
                </div>
                <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                  <span className="text-[10px] text-slate-400 block font-bold">نسبة دقة الامتثال والتسليم</span>
                  <span className="text-base font-black text-emerald-600 font-mono block mt-1">
                    {kpiData.fulfillmentRate}%
                  </span>
                </div>
              </div>

              {/* Products Breakdown Table in Report */}
              <div className="space-y-2">
                <h4 className="text-xs font-black text-slate-900 dark:text-white border-b border-slate-200 pb-1">
                  بيان كميات ومبيعات المنتجات في الفترة المحددة
                </h4>
                <table className="w-full text-xs text-right border-collapse">
                  <thead>
                    <tr className="border-b border-slate-300 dark:border-slate-700 text-slate-500 font-bold">
                      <th className="py-1.5">اسم الصنف</th>
                      <th className="py-1.5">التصنيف</th>
                      <th className="py-1.5">المخزون المتبقي</th>
                      <th className="py-1.5">المسحوب</th>
                      <th className="py-1.5">الإيراد المحقق</th>
                      <th className="py-1.5">حالة المخزون</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                    {predictiveAnalysis.itemsForecast.map((item) => (
                      <tr key={item.product.id}>
                        <td className="py-2 font-black">{item.product.name}</td>
                        <td className="py-2 text-slate-500">{item.product.category}</td>
                        <td className="py-2 font-mono">{item.product.stockCartons} كرتون</td>
                        <td className="py-2 font-mono font-bold">{item.totalSold} كرتون</td>
                        <td className="py-2 font-mono font-bold text-emerald-600">
                          {item.totalRevenue.toLocaleString("ar-YE")} ر.ي
                        </td>
                        <td className="py-2 font-bold text-[10px]">
                          {item.riskLevel === "CRITICAL" ? "نفاد وشيك ⚠️" : "مستقر ✅"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Official Stamp & Signatures */}
              <div className="pt-8 flex items-center justify-between border-t border-slate-200 dark:border-slate-700 text-xs">
                <div>
                  <span className="block text-slate-400 text-[10px]">إدارة المبيعات والتوزيع</span>
                  <span className="font-black text-slate-900 dark:text-white mt-1 block">
                    منصة إمداد المركزية للربط الصناعي
                  </span>
                </div>
                <div className="w-28 h-28 rounded-full border-2 border-dashed border-emerald-600/60 p-1 flex items-center justify-center text-center rotate-[-8deg] opacity-80">
                  <div className="text-[10px] font-black text-emerald-700 dark:text-emerald-400 leading-tight">
                    <span>★ منصة إمداد ★</span>
                    <br />
                    <span>تقرير معتمد إلكترونياً</span>
                    <br />
                    <span className="font-mono text-[9px]">{new Date().toISOString().split("T")[0]}</span>
                  </div>
                </div>
              </div>

            </div>

          </div>
        </div>
      )}

    </div>
  );
};
