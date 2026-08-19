import React, { useState } from "react";
import { MerchantWarehouse, MerchantItem, Product } from "../../types";
import { storeService } from "../../services/storeService";
import {
  Building2,
  Plus,
  MapPin,
  User,
  Phone,
  Package,
  Boxes,
  Edit2,
  Trash2,
  CheckCircle2,
  X,
  Layers,
  Eye,
  Star,
  AlertTriangle,
  Zap,
  ShoppingCart,
  Search,
  Filter,
  ArrowLeftRight,
  TrendingUp,
  DollarSign,
  PieChart,
  BarChart3,
  RefreshCw,
  FileSpreadsheet,
  AlertCircle,
  Tag,
  Barcode,
  ArrowLeft,
  Wallet,
} from "lucide-react";

interface Props {
  warehouses: MerchantWarehouse[];
  items: MerchantItem[];
  catalogProducts?: Product[];
  onOpenCart?: () => void;
}

export type WarehouseManagerTab =
  | "WAREHOUSES"
  | "WAREHOUSE_DETAILS"
  | "INVENTORY_STOCK"
  | "FINANCIAL_VALUATION"
  | "SHORTAGES_RADAR";

export const MerchantWarehousesManager: React.FC<Props> = ({
  warehouses,
  items,
  catalogProducts = [],
  onOpenCart,
}) => {
  const [activeTab, setActiveTab] = useState<WarehouseManagerTab>("WAREHOUSES");
  const [selectedWarehouseId, setSelectedWarehouseId] = useState<string | null>(null);

  // Modals state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingWh, setEditingWh] = useState<MerchantWarehouse | null>(null);
  const [viewingItemsWh, setViewingItemsWh] = useState<MerchantWarehouse | null>(null);

  // Transfer modal state
  const [isTransferModalOpen, setIsTransferModalOpen] = useState(false);
  const [transferItemId, setTransferItemId] = useState<string>("");
  const [transferFromWhId, setTransferFromWhId] = useState<string>("");
  const [transferToWhId, setTransferToWhId] = useState<string>("");
  const [transferQty, setTransferQty] = useState<number>(1);

  // Filter & Search states
  const [inventorySearch, setInventorySearch] = useState("");
  const [inventoryWhFilter, setInventoryWhFilter] = useState("ALL");
  const [inventoryStatusFilter, setInventoryStatusFilter] = useState<"ALL" | "IN_STOCK" | "LOW_STOCK" | "OUT_OF_STOCK">("ALL");

  // Single Warehouse View Filter & Search states
  const [singleWhSearch, setSingleWhSearch] = useState("");
  const [singleWhCategoryFilter, setSingleWhCategoryFilter] = useState("ALL");
  const [singleWhStatusFilter, setSingleWhStatusFilter] = useState<"ALL" | "IN_STOCK" | "LOW_STOCK" | "OUT_OF_STOCK">("ALL");

  const [shortageSeverityFilter, setShortageSeverityFilter] = useState<"ALL" | "OUT_OF_STOCK" | "CRITICAL">("ALL");

  // Global calculations
  const globalItemsCount = items.length;
  let globalStockUnits = 0;
  let globalStockCostValue = 0;
  let globalStockSellingValue = 0;
  let globalShortagesCount = 0;
  let outOfStockCount = 0;

  items.forEach((it) => {
    const units = it.totalStock || 0;
    globalStockUnits += units;
    globalStockCostValue += units * it.costPrice;
    globalStockSellingValue += units * it.sellingPrice;
    if (units === 0) {
      outOfStockCount++;
      globalShortagesCount++;
    } else if (units <= it.minStockAlert) {
      globalShortagesCount++;
    }
  });

  const estimatedProfit = globalStockSellingValue - globalStockCostValue;
  const profitMarginPercent = globalStockCostValue > 0 ? ((estimatedProfit / globalStockCostValue) * 100).toFixed(1) : "0";

  const defaultWarehouse = warehouses.find((w) => w.isDefault) || warehouses[0];

  // Replenishment preset state for bulk reorder
  const [replenishPreset, setReplenishPreset] = useState<"SAFE_1X" | "BALANCED_2X" | "BULK_3X" | "LARGE_5X">("BALANCED_2X");

  // Bulk Reorder All Shortages from All Factories in One Click with selected preset multiplier
  const handleOrderAllShortagesBulk = (presetOverride?: "SAFE_1X" | "BALANCED_2X" | "BULK_3X" | "LARGE_5X") => {
    const selectedMode = presetOverride || replenishPreset;
    const shortageItems = items.filter((it) => it.totalStock <= it.minStockAlert);
    if (shortageItems.length === 0) {
      alert("لا توجد أصناف بالنواقص حالياً! جميع المستودعات والمخزونات في مستويات آمنة 🎉");
      return;
    }

    const multiplier =
      selectedMode === "SAFE_1X" ? 1 :
      selectedMode === "BALANCED_2X" ? 2 :
      selectedMode === "BULK_3X" ? 3 : 5;

    let addedCount = 0;
    shortageItems.forEach((item) => {
      let catalogMatch = catalogProducts.find((p) => p.id === item.productId);
      if (!catalogMatch && item.factoryId) {
        catalogMatch = catalogProducts.find((p) => p.factoryId === item.factoryId);
      }
      if (!catalogMatch && catalogProducts.length > 0) {
        catalogMatch = catalogProducts[0];
      }

      if (catalogMatch) {
        // Calculate needed quantity according to selected multiplier
        const targetCapacity = Math.max(item.minStockAlert * multiplier, 10 * multiplier);
        const neededQty = Math.max(targetCapacity - item.totalStock, item.minStockAlert || 5);
        storeService.addToCart(catalogMatch, neededQty);
        addedCount++;
      }
    });

    const presetNames: Record<string, string> = {
      SAFE_1X: "الحد الأدنى الآمن (1x)",
      BALANCED_2X: "الكمية المتوازنة (2x)",
      BULK_3X: "الشراء الاقتصادي (3x)",
      LARGE_5X: "الجملة الكبرى (5x)",
    };

    alert(`تمت إضافة ${addedCount} صنف من كافة النواقص بمستوى [${presetNames[selectedMode]}] إلى السلة الموحدة بنجاح! ⚡🛒\nيمكنك الآن فتح السلة وتعديل الكميات بالكيبورد أو تحديد الأصناف المراد طلبها.`);
    if (onOpenCart) onOpenCart();
  };

  // Handle single item reorder
  const handleSingleItemReorder = (item: MerchantItem) => {
    let catalogMatch = catalogProducts.find((p) => p.id === item.productId);
    if (!catalogMatch && item.factoryId) {
      catalogMatch = catalogProducts.find((p) => p.factoryId === item.factoryId);
    }
    if (!catalogMatch && catalogProducts.length > 0) {
      catalogMatch = catalogProducts[0];
    }

    if (catalogMatch) {
      const reorderQty = Math.max(item.minStockAlert * 2 - item.totalStock, 10);
      storeService.addToCart(catalogMatch, reorderQty);
      alert(`تمت إضافة ${reorderQty} ${item.unit} من "${item.name}" إلى سلة المشتريات ⚡🛒`);
      if (onOpenCart) onOpenCart();
    } else {
      alert(`صنف "${item.name}" غير مرتبط مباشرة بكتالوج المصانع، يمكنك البحث عنه في صفحة الكتالوج.`);
    }
  };

  // Add / Edit Warehouse Form state
  const [name, setName] = useState("");
  const [city, setCity] = useState("صنعاء");
  const [district, setDistrict] = useState("");
  const [address, setAddress] = useState("");
  const [managerName, setManagerName] = useState("");
  const [managerPhone, setManagerPhone] = useState("");
  const [capacityNotes, setCapacityNotes] = useState("");
  const [isDefault, setIsDefault] = useState(false);

  const openAddModal = () => {
    setEditingWh(null);
    setName("");
    setCity("صنعاء");
    setDistrict("");
    setAddress("");
    setManagerName("");
    setManagerPhone("");
    setCapacityNotes("سعة تخزين مناسبة للمواد التموينية والبضائع");
    setIsDefault(warehouses.length === 0);
    setIsModalOpen(true);
  };

  const openEditModal = (wh: MerchantWarehouse) => {
    setEditingWh(wh);
    setName(wh.name);
    setCity(wh.city);
    setDistrict(wh.district);
    setAddress(wh.address);
    setManagerName(wh.managerName);
    setManagerPhone(wh.managerPhone);
    setCapacityNotes(wh.capacityNotes || "");
    setIsDefault(!!wh.isDefault);
    setIsModalOpen(true);
  };

  const handleSubmitWarehouse = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      alert("الرجاء كتابة اسم المستودع");
      return;
    }

    if (editingWh) {
      storeService.updateMerchantWarehouse(editingWh.id, {
        name: name.trim(),
        city,
        district: district.trim(),
        address: address.trim(),
        managerName: managerName.trim(),
        managerPhone: managerPhone.trim(),
        capacityNotes: capacityNotes.trim(),
        isDefault,
      });
    } else {
      storeService.addMerchantWarehouse({
        name: name.trim(),
        city,
        district: district.trim(),
        address: address.trim(),
        managerName: managerName.trim(),
        managerPhone: managerPhone.trim(),
        capacityNotes: capacityNotes.trim(),
        isDefault,
      });
    }
    setIsModalOpen(false);
  };

  const handleDeleteWarehouse = (id: string, whName: string) => {
    if (confirm(`هل أنت متأكد من رغبتك في حذف المستودع/الفرع "${whName}" نهائياً من سجلات التاجر؟`)) {
      storeService.deleteMerchantWarehouse(id);
    }
  };

  // Handle Transfer
  const openTransferModalFor = (itemId?: string, fromWhId?: string) => {
    setTransferItemId(itemId || (items[0]?.id ?? ""));
    setTransferFromWhId(fromWhId || (warehouses[0]?.id ?? ""));
    const otherWh = warehouses.find((w) => w.id !== (fromWhId || warehouses[0]?.id));
    setTransferToWhId(otherWh?.id || "");
    setTransferQty(5);
    setIsTransferModalOpen(true);
  };

  const handleExecuteTransfer = (e: React.FormEvent) => {
    e.preventDefault();
    if (!transferItemId || !transferFromWhId || !transferToWhId) {
      alert("الرجاء اختيار الصنف والمستودعات بشكل صحيح.");
      return;
    }
    if (transferFromWhId === transferToWhId) {
      alert("لا يمكن التحويل لنفس المستودع! يرجى اختيار مستودع وجهة مختلف.");
      return;
    }
    const item = items.find((i) => i.id === transferItemId);
    const available = item?.warehouseStock?.[transferFromWhId] || 0;
    if (transferQty > available) {
      alert(`الكمية المتوفرة في المستودع المصدر هي ${available} فقط! لا يمكن تحويل ${transferQty}.`);
      return;
    }

    const ok = storeService.transferWarehouseStock(transferItemId, transferFromWhId, transferToWhId, transferQty);
    if (ok) {
      const fromWh = warehouses.find((w) => w.id === transferFromWhId);
      const toWh = warehouses.find((w) => w.id === transferToWhId);
      alert(`تم بنجاح تحويل ${transferQty} ${item?.unit || "وحدة"} من (${item?.name}) من ${fromWh?.name} إلى ${toWh?.name} ✅`);
      setIsTransferModalOpen(false);
    } else {
      alert("حدث خطأ أثناء تنفيذ التحويل المخزني.");
    }
  };

  // Filtered inventory items
  const filteredInventoryItems = items.filter((item) => {
    const matchesSearch =
      inventorySearch.trim() === "" ||
      item.name.toLowerCase().includes(inventorySearch.toLowerCase()) ||
      item.sku?.toLowerCase().includes(inventorySearch.toLowerCase()) ||
      item.barcode?.toLowerCase().includes(inventorySearch.toLowerCase()) ||
      item.category?.toLowerCase().includes(inventorySearch.toLowerCase());

    const stockToCheck =
      inventoryWhFilter === "ALL"
        ? item.totalStock
        : item.warehouseStock?.[inventoryWhFilter] || 0;

    let matchesStatus = true;
    if (inventoryStatusFilter === "IN_STOCK") {
      matchesStatus = stockToCheck > item.minStockAlert;
    } else if (inventoryStatusFilter === "LOW_STOCK") {
      matchesStatus = stockToCheck > 0 && stockToCheck <= item.minStockAlert;
    } else if (inventoryStatusFilter === "OUT_OF_STOCK") {
      matchesStatus = stockToCheck === 0;
    }

    return matchesSearch && matchesStatus;
  });

  // Shortage items
  const shortageItemsList = items.filter((it) => {
    if (shortageSeverityFilter === "OUT_OF_STOCK") {
      return it.totalStock === 0;
    }
    if (shortageSeverityFilter === "CRITICAL") {
      return it.totalStock <= Math.floor(it.minStockAlert / 2);
    }
    return it.totalStock <= it.minStockAlert;
  });

  return (
    <div className="space-y-6">
      {/* Top Bar Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-4 rounded-3xl border border-slate-200/90 dark:border-slate-800 shadow-sm">
        <div className="flex items-center gap-3.5">
          <div className="relative w-12 h-12 rounded-2xl bg-gradient-to-tr from-blue-600 via-blue-500 to-indigo-500 text-white flex items-center justify-center font-black shadow-lg shadow-blue-500/25 ring-2 ring-blue-500/20 dark:ring-blue-400/30 overflow-hidden shrink-0 group transition-all duration-300 hover:scale-105">
            <div className="absolute -top-2 -right-2 w-6 h-6 bg-white/25 rounded-full blur-xs pointer-events-none" />
            <Building2 className="w-6 h-6 text-white drop-shadow-xs transition-transform duration-300 group-hover:scale-110" strokeWidth={2.3} />
            <div className="absolute inset-0 bg-white/10 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
          </div>
          <div>
            <h2 className="text-base font-black text-slate-900 dark:text-white flex items-center gap-2">
              <span>إدارة المستودعات والمخزون المركزي</span>
              <span className="px-2.5 py-0.5 rounded-full bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300 text-xs font-bold">
                {warehouses.length} {warehouses.length === 1 ? "مستودع" : "مستودعات"}
              </span>
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              لوحة تحكم تفاعلية للمستودعات، جرد الأصناف، تقييم رأس المال المخزون، ومعالجة النواقص الفورية
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 w-full sm:w-auto">
          {warehouses.length >= 2 && (
            <button
              onClick={() => openTransferModalFor()}
              className="px-3.5 py-2.5 rounded-2xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-bold text-xs sm:text-sm border border-slate-200 dark:border-slate-700 transition-all flex items-center justify-center gap-2"
            >
              <ArrowLeftRight className="w-4 h-4 text-indigo-500" />
              <span>تحويل مخزني بين الفروع</span>
            </button>
          )}

          <button
            onClick={openAddModal}
            className="px-4 py-2.5 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs sm:text-sm shadow-md transition-all flex items-center justify-center gap-2"
          >
            <Plus className="w-4 h-4" />
            <span>إضافة مستودع / فرع جديد 🏬</span>
          </button>
        </div>
      </div>

      {/* 4 Interactive Buttons / Page Tabs (Targeted Selectors) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Tab Button 1: Warehouses */}
        <button
          type="button"
          onClick={() => {
            if (activeTab === "WAREHOUSES" && defaultWarehouse) {
              setSelectedWarehouseId(defaultWarehouse.id);
              setActiveTab("WAREHOUSE_DETAILS");
            } else {
              setActiveTab("WAREHOUSES");
            }
          }}
          className={`p-4.5 rounded-3xl border transition-all duration-200 text-right cursor-pointer flex items-center gap-3.5 relative group ${
            activeTab === "WAREHOUSES" || activeTab === "WAREHOUSE_DETAILS"
              ? "bg-blue-600 text-white border-blue-600 shadow-lg shadow-blue-600/20 ring-2 ring-blue-400/50 scale-[1.01]"
              : "bg-white dark:bg-slate-900 hover:bg-blue-50/50 dark:hover:bg-slate-800/80 border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white shadow-xs"
          }`}
        >
          <div
            className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 transition-transform duration-200 group-hover:scale-105 ${
              activeTab === "WAREHOUSES" || activeTab === "WAREHOUSE_DETAILS"
                ? "bg-white/20 text-white shadow-inner"
                : "bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-800"
            }`}
          >
            <Building2 className="w-6 h-6" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center justify-between">
              <span className={`text-xs font-bold block ${activeTab === "WAREHOUSES" || activeTab === "WAREHOUSE_DETAILS" ? "text-blue-100" : "text-slate-500 dark:text-slate-400"}`}>
                {activeTab === "WAREHOUSE_DETAILS" ? "صفحة المستودع" : "المستودعات المفعلة"}
              </span>
              <span className={`text-[10px] font-black px-2 py-0.5 rounded-full ${
                activeTab === "WAREHOUSES" || activeTab === "WAREHOUSE_DETAILS" ? "bg-white/20 text-white" : "bg-blue-100 dark:bg-blue-950 text-blue-600 dark:text-blue-400"
              }`}>
                {warehouses.length} فروع
              </span>
            </div>
            <div className="flex items-baseline gap-1.5 mt-1">
              <span className="text-xl font-black">{warehouses.length}</span>
              <span className={`text-[11px] truncate font-semibold ${activeTab === "WAREHOUSES" || activeTab === "WAREHOUSE_DETAILS" ? "text-blue-100" : "text-slate-500 dark:text-slate-400"}`}>
                {defaultWarehouse ? `(${defaultWarehouse.name})` : "مستودع"}
              </span>
            </div>
          </div>
        </button>

        {/* Tab Button 2: Items & Stock Units */}
        <button
          type="button"
          onClick={() => setActiveTab("INVENTORY_STOCK")}
          className={`p-4.5 rounded-3xl border transition-all duration-200 text-right cursor-pointer flex items-center gap-3.5 relative group ${
            activeTab === "INVENTORY_STOCK"
              ? "bg-indigo-600 text-white border-indigo-600 shadow-lg shadow-indigo-600/20 ring-2 ring-indigo-400/50 scale-[1.01]"
              : "bg-white dark:bg-slate-900 hover:bg-indigo-50/50 dark:hover:bg-slate-800/80 border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white shadow-xs"
          }`}
        >
          <div
            className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 transition-transform duration-200 group-hover:scale-105 ${
              activeTab === "INVENTORY_STOCK"
                ? "bg-white/20 text-white shadow-inner"
                : "bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800"
            }`}
          >
            <Boxes className="w-6 h-6" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center justify-between">
              <span className={`text-xs font-bold block ${activeTab === "INVENTORY_STOCK" ? "text-indigo-100" : "text-slate-500 dark:text-slate-400"}`}>
                جرد الأصناف & الوحدات
              </span>
              <span className={`text-[10px] font-black px-2 py-0.5 rounded-full ${
                activeTab === "INVENTORY_STOCK" ? "bg-white/20 text-white" : "bg-indigo-100 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400"
              }`}>
                {globalItemsCount} صنف
              </span>
            </div>
            <div className="flex items-baseline gap-1.5 mt-1">
              <span className="text-xl font-black">{globalStockUnits.toLocaleString("ar-YE")}</span>
              <span className={`text-[11px] font-semibold ${activeTab === "INVENTORY_STOCK" ? "text-indigo-100" : "text-slate-500 dark:text-slate-400"}`}>
                وحدة مخزونة
              </span>
            </div>
          </div>
        </button>

        {/* Tab Button 3: Financial Stock Valuation */}
        <button
          type="button"
          onClick={() => setActiveTab("FINANCIAL_VALUATION")}
          className={`p-4.5 rounded-3xl border transition-all duration-200 text-right cursor-pointer flex items-center gap-3.5 relative group ${
            activeTab === "FINANCIAL_VALUATION"
              ? "bg-emerald-600 text-white border-emerald-600 shadow-lg shadow-emerald-600/20 ring-2 ring-emerald-400/50 scale-[1.01]"
              : "bg-white dark:bg-slate-900 hover:bg-emerald-50/50 dark:hover:bg-slate-800/80 border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white shadow-xs"
          }`}
        >
          <div
            className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 transition-transform duration-200 group-hover:scale-105 ${
              activeTab === "FINANCIAL_VALUATION"
                ? "bg-white/20 text-white shadow-inner"
                : "bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800"
            }`}
          >
            <Layers className="w-6 h-6" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center justify-between">
              <span className={`text-xs font-bold block ${activeTab === "FINANCIAL_VALUATION" ? "text-emerald-100" : "text-slate-500 dark:text-slate-400"}`}>
                تقييم قيمة المخزون
              </span>
              <span className={`text-[10px] font-black px-2 py-0.5 rounded-full ${
                activeTab === "FINANCIAL_VALUATION" ? "bg-white/20 text-white" : "bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300"
              }`}>
                +{profitMarginPercent}% ربح
              </span>
            </div>
            <div className="flex items-baseline gap-1 mt-1">
              <span className="text-lg font-black truncate">{globalStockCostValue.toLocaleString("ar-YE")}</span>
              <span className={`text-[11px] font-bold ${activeTab === "FINANCIAL_VALUATION" ? "text-emerald-100" : "text-emerald-600 dark:text-emerald-400"}`}>
                ر.ي تكلفة
              </span>
            </div>
          </div>
        </button>

        {/* Tab Button 4: Shortages & Deficits Radar */}
        <button
          type="button"
          onClick={() => setActiveTab("SHORTAGES_RADAR")}
          className={`p-4.5 rounded-3xl border transition-all duration-200 text-right cursor-pointer flex items-center gap-3.5 relative group ${
            activeTab === "SHORTAGES_RADAR"
              ? "bg-amber-600 text-white border-amber-600 shadow-lg shadow-amber-600/20 ring-2 ring-amber-400/50 scale-[1.01]"
              : globalShortagesCount > 0
              ? "bg-amber-500/10 hover:bg-amber-500/20 border-amber-300 dark:border-amber-800 text-amber-950 dark:text-amber-200 shadow-xs"
              : "bg-white dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white shadow-xs"
          }`}
        >
          <div
            className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 transition-transform duration-200 group-hover:scale-105 ${
              activeTab === "SHORTAGES_RADAR"
                ? "bg-white/20 text-white shadow-inner"
                : globalShortagesCount > 0
                ? "bg-amber-500 text-slate-950 shadow-xs animate-pulse"
                : "bg-emerald-500 text-white"
            }`}
          >
            <AlertTriangle className="w-6 h-6" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center justify-between">
              <span className={`text-xs font-bold block ${activeTab === "SHORTAGES_RADAR" ? "text-amber-100" : "text-slate-500 dark:text-slate-400"}`}>
                رصد ومعالجة النواقص
              </span>
              <span className={`text-[10px] font-black px-2 py-0.5 rounded-full ${
                activeTab === "SHORTAGES_RADAR"
                  ? "bg-white/20 text-white"
                  : globalShortagesCount > 0
                  ? "bg-amber-200 dark:bg-amber-950 text-amber-900 dark:text-amber-200 border border-amber-300 dark:border-amber-800"
                  : "bg-emerald-100 text-emerald-700"
              }`}>
                {globalShortagesCount > 0 ? `${globalShortagesCount} نقص` : "آمن ✓"}
              </span>
            </div>
            <div className="flex items-baseline gap-1.5 mt-1">
              <span className="text-base font-black truncate">
                {globalShortagesCount > 0 ? `${globalShortagesCount} أصناف منخفضة` : "المخزون مكتمل"}
              </span>
            </div>
          </div>
        </button>
      </div>

      {/* =========================================================================
          VIEW 1: WAREHOUSES MANAGEMENT (قائمة المستودعات والفروع)
         ========================================================================= */}
      {activeTab === "WAREHOUSES" && (
        <div className="space-y-6 animate-in fade-in duration-200">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
              <Building2 className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              <span>فروع ومستودعات التاجر ({warehouses.length})</span>
            </h3>
            <span className="text-xs text-slate-500 dark:text-slate-400">
              انقر على أي مستودع لمعاينة محتوياته، تعديل بياناته، أو تحويل البضائع
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {warehouses.map((wh) => {
              let totalItemsCount = 0;
              let totalStockUnits = 0;
              let totalStockValue = 0;

              items.forEach((it) => {
                const stockInWh = it.warehouseStock?.[wh.id] || 0;
                if (stockInWh > 0) {
                  totalItemsCount += 1;
                  totalStockUnits += stockInWh;
                  totalStockValue += stockInWh * it.costPrice;
                }
              });

              const whShortageItems = items.filter((it) => {
                const qty = it.warehouseStock?.[wh.id] || 0;
                return qty <= 3 || qty <= it.minStockAlert;
              });

              return (
                <div
                  key={wh.id}
                  onClick={() => {
                    setSelectedWarehouseId(wh.id);
                    setActiveTab("WAREHOUSE_DETAILS");
                  }}
                  className={`p-5 rounded-3xl bg-white dark:bg-slate-900 border transition-all duration-200 cursor-pointer hover:scale-[1.01] hover:shadow-lg ${
                    wh.isDefault
                      ? "border-blue-500/70 shadow-md ring-2 ring-blue-500/20"
                      : "border-slate-200 dark:border-slate-800 shadow-xs hover:border-blue-400 dark:hover:border-blue-700"
                  } space-y-4 flex flex-col justify-between relative group`}
                >
                  <div className="space-y-3">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-3">
                        <div className="w-11 h-11 rounded-2xl bg-blue-50 group-hover:bg-blue-600 group-hover:text-white dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-800 flex items-center justify-center shrink-0 transition-colors">
                          <Building2 className="w-5.5 h-5.5" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="text-sm font-extrabold text-slate-900 dark:text-white leading-tight group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                              {wh.name}
                            </h4>
                            <span className="text-[10px] text-blue-600 dark:text-blue-400 opacity-0 group-hover:opacity-100 transition-opacity font-bold">
                              فتح الصفحة ←
                            </span>
                          </div>
                          <span className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-1 mt-0.5">
                            <MapPin className="w-3.5 h-3.5 text-rose-500 shrink-0" />
                            {wh.city} {wh.district ? `- ${wh.district}` : ""}
                          </span>
                        </div>
                      </div>

                      {wh.isDefault && (
                        <span className="px-2.5 py-1 rounded-full bg-blue-500/10 text-blue-600 dark:text-blue-400 text-[10px] font-bold flex items-center gap-1 shrink-0 border border-blue-200 dark:border-blue-800">
                          <Star className="w-3 h-3 fill-current text-amber-500" /> المستودع الرئيسي
                        </span>
                      )}
                    </div>

                    {/* Shortage Alert Icon & Pill */}
                    {whShortageItems.length > 0 && (
                      <div
                        onClick={(e) => e.stopPropagation()}
                        className="flex items-center justify-between p-2.5 rounded-2xl bg-amber-500/10 border border-amber-300 dark:border-amber-800/80 text-amber-900 dark:text-amber-200 text-xs font-bold"
                      >
                        <div className="flex items-center gap-1.5">
                          <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 animate-pulse" />
                          <span>نواقص المخزن: {whShortageItems.length} أصناف تحت الحد 🚨</span>
                        </div>
                        <button
                          onClick={() => {
                            setSelectedWarehouseId(wh.id);
                            setActiveTab("WAREHOUSE_DETAILS");
                          }}
                          className="text-[10px] bg-amber-500 hover:bg-amber-600 text-slate-950 px-2 py-1 rounded-lg font-black transition-colors"
                        >
                          عرض الأصناف
                        </button>
                      </div>
                    )}

                    {/* Info Pills */}
                    <div className="space-y-2 text-xs bg-slate-50 dark:bg-slate-800/60 p-3 rounded-2xl border border-slate-100 dark:border-slate-800">
                      <div className="flex items-center justify-between text-slate-700 dark:text-slate-300">
                        <span className="flex items-center gap-1 text-slate-500">
                          <User className="w-3.5 h-3.5" /> أمين المستودع:
                        </span>
                        <strong className="font-bold">{wh.managerName || "غير محدد"}</strong>
                      </div>

                      <div className="flex items-center justify-between text-slate-700 dark:text-slate-300">
                        <span className="flex items-center gap-1 text-slate-500">
                          <Phone className="w-3.5 h-3.5" /> رقم التواصل:
                        </span>
                        <strong className="font-mono">{wh.managerPhone || "غير مسجل"}</strong>
                      </div>

                      {wh.address && (
                        <div className="text-[11px] text-slate-500 pt-1.5 border-t border-slate-200 dark:border-slate-700">
                          العنوان: {wh.address}
                        </div>
                      )}
                    </div>

                    {/* Stock Stats KPI Bar */}
                    <div className="grid grid-cols-2 gap-2 bg-blue-50/50 dark:bg-blue-950/20 p-3 rounded-2xl border border-blue-100 dark:border-blue-900/40 text-center">
                      <div>
                        <span className="text-[10px] text-slate-500 dark:text-slate-400 block">
                          الأصناف المخزنة
                        </span>
                        <strong className="text-xs font-extrabold text-slate-900 dark:text-white">
                          {totalItemsCount} صنف ({totalStockUnits} وحدة)
                        </strong>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-500 dark:text-slate-400 block">
                          قيمة رأس المال
                        </span>
                        <strong className="text-xs font-extrabold text-blue-600 dark:text-blue-400">
                          {totalStockValue.toLocaleString("ar-YE")} ر.ي
                        </strong>
                      </div>
                    </div>

                    {wh.capacityNotes && (
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-2">
                        {wh.capacityNotes}
                      </p>
                    )}
                  </div>

                  {/* Actions */}
                  <div
                    onClick={(e) => e.stopPropagation()}
                    className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-2"
                  >
                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => {
                          setSelectedWarehouseId(wh.id);
                          setActiveTab("WAREHOUSE_DETAILS");
                        }}
                        className="px-3 py-1.5 rounded-xl bg-blue-50 hover:bg-blue-100 dark:bg-blue-950/60 dark:hover:bg-blue-900/60 text-blue-700 dark:text-blue-300 text-xs font-bold transition-colors flex items-center gap-1.5 border border-blue-200 dark:border-blue-800"
                      >
                        <Eye className="w-3.5 h-3.5 text-blue-500" />
                        <span>فتح صفحة المستودع والرؤية</span>
                      </button>

                      {warehouses.length >= 2 && (
                        <button
                          onClick={() => openTransferModalFor(undefined, wh.id)}
                          className="px-2.5 py-1.5 rounded-xl bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 text-xs font-bold transition-colors flex items-center gap-1"
                          title="تحويل مخزني من هذا المستودع"
                        >
                          <ArrowLeftRight className="w-3.5 h-3.5" />
                          <span>تحويل</span>
                        </button>
                      )}
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => openEditModal(wh)}
                        className="p-1.5 text-slate-500 hover:text-blue-600 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
                        title="تعديل بيانات المستودع"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteWarehouse(wh.id, wh.name)}
                        className="p-1.5 text-slate-400 hover:text-rose-500 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/40"
                        title="حذف المستودع"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* =========================================================================
          VIEW: DEDICATED WAREHOUSE PAGE & PRODUCT VIEWER (صفحة المستودع والرؤية للمنتجات)
         ========================================================================= */}
      {activeTab === "WAREHOUSE_DETAILS" && (() => {
        const currentWh = warehouses.find((w) => w.id === selectedWarehouseId) || defaultWarehouse || warehouses[0];
        if (!currentWh) return null;

        // Calculate statistics for this specific warehouse
        let whTotalItems = 0;
        let whTotalUnits = 0;
        let whCostValue = 0;
        let whSellingValue = 0;
        let whShortages = 0;
        let whOutCount = 0;

        const categoriesSet = new Set<string>();

        items.forEach((it) => {
          if (it.category) categoriesSet.add(it.category);
          const qty = it.warehouseStock?.[currentWh.id] || 0;
          if (qty > 0) {
            whTotalItems += 1;
            whTotalUnits += qty;
            whCostValue += qty * it.costPrice;
            whSellingValue += qty * it.sellingPrice;
          }
          if (qty === 0) {
            whOutCount += 1;
            whShortages += 1;
          } else if (qty <= 3 || qty <= it.minStockAlert) {
            whShortages += 1;
          }
        });

        const whProfit = whSellingValue - whCostValue;
        const whProfitPercent = whCostValue > 0 ? ((whProfit / whCostValue) * 100).toFixed(1) : "0";

        // Filter products in this warehouse
        const filteredWhItems = items.filter((it) => {
          const qty = it.warehouseStock?.[currentWh.id] || 0;

          // Search match
          const matchesSearch =
            !singleWhSearch ||
            it.name.toLowerCase().includes(singleWhSearch.toLowerCase()) ||
            it.sku.toLowerCase().includes(singleWhSearch.toLowerCase()) ||
            (it.barcode && it.barcode.includes(singleWhSearch)) ||
            (it.category && it.category.toLowerCase().includes(singleWhSearch.toLowerCase()));

          // Category match
          const matchesCategory =
            singleWhCategoryFilter === "ALL" || it.category === singleWhCategoryFilter;

          // Status match
          let matchesStatus = true;
          if (singleWhStatusFilter === "IN_STOCK") {
            matchesStatus = qty > 3 && qty > it.minStockAlert;
          } else if (singleWhStatusFilter === "LOW_STOCK") {
            matchesStatus = qty > 0 && (qty <= 3 || qty <= it.minStockAlert);
          } else if (singleWhStatusFilter === "OUT_OF_STOCK") {
            matchesStatus = qty === 0;
          }

          return matchesSearch && matchesCategory && matchesStatus;
        });

        return (
          <div className="space-y-6 animate-in fade-in duration-200">
            {/* Header & Warehouse Switcher Bar */}
            <div className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
              <div className="flex items-center gap-3.5">
                <button
                  type="button"
                  onClick={() => setActiveTab("WAREHOUSES")}
                  className="p-3 rounded-2xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 transition-colors flex items-center justify-center shrink-0"
                  title="الرجوع لقائمة المستودعات"
                >
                  <ArrowLeft className="w-5 h-5 rtl:rotate-180" />
                </button>
                <div className="p-3.5 rounded-2xl bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20 shrink-0">
                  <Building2 className="w-7 h-7" />
                </div>
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 className="text-lg font-black text-slate-900 dark:text-white">
                      صفحة {currentWh.name}
                    </h2>
                    {currentWh.isDefault && (
                      <span className="px-2.5 py-0.5 rounded-full bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300 text-xs font-bold flex items-center gap-1 border border-blue-300 dark:border-blue-800">
                        <Star className="w-3 h-3 fill-current text-amber-500" /> الفرع الرئيسي الافتراضي
                      </span>
                    )}
                    <span className="px-2.5 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-xs font-semibold flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-rose-500" />
                      {currentWh.city} {currentWh.district ? `(${currentWh.district})` : ""}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 flex flex-wrap items-center gap-3">
                    <span>👤 أمين المستودع: <strong>{currentWh.managerName || "غير محدد"}</strong></span>
                    <span>📞 الهاتف: <strong className="font-mono">{currentWh.managerPhone || "غير مسجل"}</strong></span>
                    {currentWh.address && <span>📍 العنوان: <strong>{currentWh.address}</strong></span>}
                  </p>
                </div>
              </div>

              {/* Warehouse Quick Switcher & Actions */}
              <div className="flex flex-wrap items-center gap-2.5 w-full lg:w-auto">
                <div className="flex items-center gap-1.5 bg-slate-100 dark:bg-slate-800 p-1.5 rounded-2xl border border-slate-200 dark:border-slate-700">
                  <span className="text-xs font-bold text-slate-500 px-2">الانتقال لمستودع آخر:</span>
                  <select
                    value={currentWh.id}
                    onChange={(e) => setSelectedWarehouseId(e.target.value)}
                    className="bg-white dark:bg-slate-900 text-xs font-bold text-slate-800 dark:text-slate-200 py-1.5 px-3 rounded-xl border border-slate-200 dark:border-slate-700 outline-hidden cursor-pointer"
                  >
                    {warehouses.map((w) => (
                      <option key={w.id} value={w.id}>
                        {w.name} {w.isDefault ? "(الرئيسي ⭐)" : ""}
                      </option>
                    ))}
                  </select>
                </div>

                {warehouses.length >= 2 && (
                  <button
                    onClick={() => openTransferModalFor(undefined, currentWh.id)}
                    className="px-3.5 py-2 rounded-xl bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 font-bold text-xs border border-indigo-200 dark:border-indigo-800 transition-colors flex items-center gap-1.5"
                  >
                    <ArrowLeftRight className="w-4 h-4 text-indigo-500" />
                    <span>تحويل من هذا المستودع</span>
                  </button>
                )}

                <button
                  onClick={() => openEditModal(currentWh)}
                  className="px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold text-xs border border-slate-200 dark:border-slate-700 transition-colors flex items-center gap-1.5"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                  <span>تعديل الفرع</span>
                </button>
              </div>
            </div>

            {/* Warehouse Specific KPI Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="p-4.5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs flex items-center gap-3.5">
                <div className="w-12 h-12 rounded-2xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-800 flex items-center justify-center shrink-0">
                  <Boxes className="w-6 h-6" />
                </div>
                <div>
                  <span className="text-xs text-slate-500 dark:text-slate-400 font-bold block">
                    الأصناف والوحدات المخزنة
                  </span>
                  <div className="flex items-baseline gap-1.5 mt-0.5">
                    <span className="text-xl font-black text-slate-900 dark:text-white">
                      {whTotalItems} صنف
                    </span>
                    <span className="text-xs text-slate-500">
                      ({whTotalUnits.toLocaleString("ar-YE")} وحدة)
                    </span>
                  </div>
                </div>
              </div>

              <div className="p-4.5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs flex items-center gap-3.5">
                <div className="w-12 h-12 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800 flex items-center justify-center shrink-0">
                  <Wallet className="w-6 h-6" />
                </div>
                <div>
                  <span className="text-xs text-slate-500 dark:text-slate-400 font-bold block">
                    قيمة رأس مال البضاعة (التكلفة)
                  </span>
                  <div className="flex items-baseline gap-1 mt-0.5">
                    <span className="text-lg font-black text-emerald-600 dark:text-emerald-400">
                      {whCostValue.toLocaleString("ar-YE")}
                    </span>
                    <span className="text-[11px] text-slate-500 font-bold">ر.ي</span>
                  </div>
                </div>
              </div>

              <div className="p-4.5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs flex items-center gap-3.5">
                <div className="w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800 flex items-center justify-center shrink-0">
                  <TrendingUp className="w-6 h-6" />
                </div>
                <div>
                  <span className="text-xs text-slate-500 dark:text-slate-400 font-bold block">
                    القيمة البيعية المتوقعة
                  </span>
                  <div className="flex items-baseline gap-1 mt-0.5">
                    <span className="text-lg font-black text-indigo-600 dark:text-indigo-400">
                      {whSellingValue.toLocaleString("ar-YE")}
                    </span>
                    <span className="text-[11px] text-slate-500 font-bold">ر.ي (+{whProfitPercent}%)</span>
                  </div>
                </div>
              </div>

              <div className="p-4.5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs flex items-center gap-3.5">
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 ${
                  whShortages > 0
                    ? "bg-amber-500 text-slate-950 shadow-xs animate-pulse"
                    : "bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600"
                }`}>
                  <AlertTriangle className="w-6 h-6" />
                </div>
                <div>
                  <span className="text-xs text-slate-500 dark:text-slate-400 font-bold block">
                    حالة النواقص بالمستودع
                  </span>
                  <div className="flex items-baseline gap-1 mt-0.5">
                    <span className={`text-base font-black ${whShortages > 0 ? "text-amber-600 dark:text-amber-400" : "text-emerald-600 dark:text-emerald-400"}`}>
                      {whShortages > 0 ? `${whShortages} أصناف منخفضة` : "مكتمل وآمن ✓"}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Filter & Search Bar for this Warehouse */}
            <div className="bg-white dark:bg-slate-900 p-4 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
              <div className="flex-1 relative">
                <Search className="w-4 h-4 absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  value={singleWhSearch}
                  onChange={(e) => setSingleWhSearch(e.target.value)}
                  placeholder={`البحث في منتجات ${currentWh.name} بالاسم أو الباركود أو SKU...`}
                  className="w-full pl-4 pr-10 py-2.5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 text-xs font-bold text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-hidden"
                />
              </div>

              <div className="flex flex-wrap items-center gap-2.5">
                {/* Category Filter */}
                <div className="flex items-center gap-1.5 bg-slate-50 dark:bg-slate-800 px-3 py-1.5 rounded-2xl border border-slate-200 dark:border-slate-700">
                  <span className="text-[11px] text-slate-500 font-bold">التصنيف:</span>
                  <select
                    value={singleWhCategoryFilter}
                    onChange={(e) => setSingleWhCategoryFilter(e.target.value)}
                    className="bg-transparent text-xs font-bold text-slate-800 dark:text-slate-200 outline-hidden cursor-pointer"
                  >
                    <option value="ALL">جميع التصنيفات ({categoriesSet.size})</option>
                    {Array.from(categoriesSet).map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Status Filter */}
                <div className="flex items-center gap-1.5 bg-slate-50 dark:bg-slate-800 px-3 py-1.5 rounded-2xl border border-slate-200 dark:border-slate-700">
                  <Filter className="w-4 h-4 text-slate-400" />
                  <select
                    value={singleWhStatusFilter}
                    onChange={(e) => setSingleWhStatusFilter(e.target.value as any)}
                    className="bg-transparent text-xs font-bold text-slate-800 dark:text-slate-200 outline-hidden cursor-pointer"
                  >
                    <option value="ALL">كافة المنتجات ({items.length})</option>
                    <option value="IN_STOCK">متوفر بالمستودع</option>
                    <option value="LOW_STOCK">منخفض (تحت الحد)</option>
                    <option value="OUT_OF_STOCK">منعدم بهذا الفرع (0)</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Products Table for this Warehouse */}
            <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden">
              <div className="p-4.5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
                <h3 className="text-sm font-black text-slate-900 dark:text-white flex items-center gap-2">
                  <Boxes className="w-4.5 h-4.5 text-blue-600 dark:text-blue-400" />
                  <span>جدول رؤية منتجات {currentWh.name} ({filteredWhItems.length} صنف)</span>
                </h3>
                <span className="text-xs text-slate-500">
                  يمكنك إجراء تعديل فوري، نقل مخزني، أو طلب إعادة تعويض النقص من المصنع
                </span>
              </div>

              {filteredWhItems.length === 0 ? (
                <div className="text-center py-12 px-4">
                  <Boxes className="w-12 h-12 text-slate-300 dark:text-slate-700 mx-auto mb-2" />
                  <p className="text-sm font-bold text-slate-700 dark:text-slate-300">
                    لا توجد منتجات مطابقة لخيارات البحث أو الفلترة في هذا المستودع
                  </p>
                  <button
                    onClick={() => {
                      setSingleWhSearch("");
                      setSingleWhCategoryFilter("ALL");
                      setSingleWhStatusFilter("ALL");
                    }}
                    className="mt-3 px-4 py-2 rounded-xl bg-blue-600 text-white text-xs font-bold hover:bg-blue-700"
                  >
                    إعادة ضبط الفلاتر
                  </button>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-right text-xs">
                    <thead className="bg-slate-50 dark:bg-slate-800/80 text-slate-500 dark:text-slate-400 font-black border-b border-slate-200 dark:border-slate-800">
                      <tr>
                        <th className="p-3.5">المنتج / الصنف</th>
                        <th className="p-3.5">الباركود & SKU</th>
                        <th className="p-3.5 text-center">الرصيد بهذا الفرع</th>
                        <th className="p-3.5 text-center">الرصيد الإجمالي</th>
                        <th className="p-3.5">سعر التكلفة</th>
                        <th className="p-3.5">سعر البيع</th>
                        <th className="p-3.5">إجمالي قيمة التكلفة</th>
                        <th className="p-3.5 text-center">الإجراءات والعمليات</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-medium text-slate-800 dark:text-slate-200">
                      {filteredWhItems.map((item) => {
                        const whQty = item.warehouseStock?.[currentWh.id] || 0;
                        const isOut = whQty === 0;
                        const isLow = whQty > 0 && (whQty <= 3 || whQty <= item.minStockAlert);
                        const itemCostVal = whQty * item.costPrice;

                        return (
                          <tr
                            key={item.id}
                            className={`hover:bg-slate-50/60 dark:hover:bg-slate-800/50 transition-colors ${
                              isOut
                                ? "bg-rose-500/5 dark:bg-rose-950/20"
                                : isLow
                                ? "bg-amber-500/5 dark:bg-amber-950/20"
                                : ""
                            }`}
                          >
                            {/* Product Info */}
                            <td className="p-3.5 font-bold">
                              <div className="flex items-center gap-3">
                                {item.imageUrl ? (
                                  <img
                                    src={item.imageUrl}
                                    alt={item.name}
                                    className="w-10 h-10 rounded-xl object-cover border border-slate-200 dark:border-slate-700 shrink-0"
                                  />
                                ) : (
                                  <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-500 flex items-center justify-center shrink-0 border border-slate-200 dark:border-slate-700">
                                    <Boxes className="w-5 h-5" />
                                  </div>
                                )}
                                <div>
                                  <div className="flex items-center gap-1.5">
                                    <span className="font-extrabold text-slate-900 dark:text-white">
                                      {item.name}
                                    </span>
                                  </div>
                                  <div className="flex items-center gap-2 text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">
                                    {item.category && (
                                      <span className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 font-bold">
                                        {item.category}
                                      </span>
                                    )}
                                    {item.factoryName && (
                                      <span>المصنع: {item.factoryName}</span>
                                    )}
                                  </div>
                                </div>
                              </div>
                            </td>

                            {/* SKU / Barcode */}
                            <td className="p-3.5">
                              <div className="font-mono text-slate-600 dark:text-slate-400 text-[11px]">
                                {item.sku}
                              </div>
                              {item.barcode && (
                                <div className="font-mono text-[10px] text-slate-400">
                                  {item.barcode}
                                </div>
                              )}
                            </td>

                            {/* Current Warehouse Stock Badge */}
                            <td className="p-3.5 text-center">
                              <span
                                className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-xl font-black text-xs ${
                                  isOut
                                    ? "bg-rose-100 dark:bg-rose-950/80 text-rose-700 dark:text-rose-300 border border-rose-300 dark:border-rose-800"
                                    : isLow
                                    ? "bg-amber-100 dark:bg-amber-950/80 text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-800"
                                    : "bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800"
                                }`}
                              >
                                {isOut ? (
                                  <span>منعدم (0)</span>
                                ) : isLow ? (
                                  <>
                                    <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                                    <span>{whQty} {item.unit} (منخفض)</span>
                                  </>
                                ) : (
                                  <>
                                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                                    <span>{whQty} {item.unit}</span>
                                  </>
                                )}
                              </span>
                            </td>

                            {/* Global Stock Across all branches */}
                            <td className="p-3.5 text-center font-bold text-slate-700 dark:text-slate-300">
                              <span className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-[11px]">
                                {item.totalStock} {item.unit}
                              </span>
                            </td>

                            {/* Cost Price */}
                            <td className="p-3.5 font-bold font-mono">
                              {item.costPrice.toLocaleString("ar-YE")} ر.ي
                            </td>

                            {/* Selling Price */}
                            <td className="p-3.5 font-bold font-mono text-emerald-600 dark:text-emerald-400">
                              {item.sellingPrice.toLocaleString("ar-YE")} ر.ي
                            </td>

                            {/* Total Inventory Cost Value in this Warehouse */}
                            <td className="p-3.5 font-bold font-mono text-blue-600 dark:text-blue-400">
                              {itemCostVal.toLocaleString("ar-YE")} ر.ي
                            </td>

                            {/* Actions & Quick Operations */}
                            <td className="p-3.5 text-center">
                              <div className="flex items-center justify-center gap-1.5">
                                {/* Replenish / Order from factory if low or zero */}
                                {(isLow || isOut) && (
                                  <button
                                    onClick={() => handleSingleItemReorder(item)}
                                    className="px-2.5 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-black text-[11px] shadow-xs flex items-center gap-1 transition-all"
                                    title="طلب تعويض النقص من المصنع فوراً"
                                  >
                                    <Zap className="w-3.5 h-3.5 fill-slate-950" />
                                    <span>طلب من المصنع</span>
                                  </button>
                                )}

                                {/* Transfer Stock from another warehouse */}
                                {warehouses.length >= 2 && (
                                  <button
                                    onClick={() => openTransferModalFor(item.id, currentWh.id)}
                                    className="px-2.5 py-1.5 rounded-xl bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 font-bold text-[11px] transition-colors flex items-center gap-1"
                                    title="تحويل كمية من هذا الصنف"
                                  >
                                    <ArrowLeftRight className="w-3.5 h-3.5" />
                                    <span>تحويل</span>
                                  </button>
                                )}
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        );
      })()}

      {/* =========================================================================
          VIEW 2: INVENTORY STOCK MATRIX (جرد وتوزيع المخزون بالأصناف)
         ========================================================================= */}
      {activeTab === "INVENTORY_STOCK" && (
        <div className="space-y-5 animate-in fade-in duration-200">
          {/* Controls Bar */}
          <div className="bg-white dark:bg-slate-900 p-4 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
            <div className="flex-1 relative">
              <Search className="w-4 h-4 absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={inventorySearch}
                onChange={(e) => setInventorySearch(e.target.value)}
                placeholder="البحث باسم الصنف، الباركود، الكود SKU، أو التصنيف..."
                className="w-full pl-4 pr-10 py-2.5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 text-xs font-bold text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-hidden"
              />
            </div>

            <div className="flex flex-wrap items-center gap-2.5">
              {/* Warehouse Filter */}
              <div className="flex items-center gap-1.5 bg-slate-50 dark:bg-slate-800 px-3 py-1.5 rounded-2xl border border-slate-200 dark:border-slate-700">
                <Building2 className="w-4 h-4 text-slate-400" />
                <select
                  value={inventoryWhFilter}
                  onChange={(e) => setInventoryWhFilter(e.target.value)}
                  className="bg-transparent text-xs font-bold text-slate-800 dark:text-slate-200 outline-hidden cursor-pointer"
                >
                  <option value="ALL">جميع المستودعات ({warehouses.length})</option>
                  {warehouses.map((wh) => (
                    <option key={wh.id} value={wh.id}>
                      {wh.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Status Filter */}
              <div className="flex items-center gap-1.5 bg-slate-50 dark:bg-slate-800 px-3 py-1.5 rounded-2xl border border-slate-200 dark:border-slate-700">
                <Filter className="w-4 h-4 text-slate-400" />
                <select
                  value={inventoryStatusFilter}
                  onChange={(e) => setInventoryStatusFilter(e.target.value as any)}
                  className="bg-transparent text-xs font-bold text-slate-800 dark:text-slate-200 outline-hidden cursor-pointer"
                >
                  <option value="ALL">كافة الحالات ({items.length})</option>
                  <option value="IN_STOCK">متوفر بمستوى آمن</option>
                  <option value="LOW_STOCK">منخفض (تحت الحد الأدنى)</option>
                  <option value="OUT_OF_STOCK">نفد تماماً (0)</option>
                </select>
              </div>
            </div>
          </div>

          {/* Table of Inventory */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-right text-xs">
                <thead className="bg-slate-50 dark:bg-slate-800/80 text-slate-500 dark:text-slate-400 font-black border-b border-slate-200 dark:border-slate-800">
                  <tr>
                    <th className="p-3.5">الصنف والتصنيف</th>
                    <th className="p-3.5">الباركود / SKU</th>
                    <th className="p-3.5">سعر التكلفة</th>
                    <th className="p-3.5">سعر البيع</th>
                    {warehouses.map((wh) => (
                      <th key={wh.id} className="p-3.5 text-center">
                        <span className="truncate block max-w-[120px]">{wh.name}</span>
                      </th>
                    ))}
                    <th className="p-3.5 text-center">إجمالي المخزون</th>
                    <th className="p-3.5 text-center">الحالة</th>
                    <th className="p-3.5 text-center">إجراءات</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-medium text-slate-800 dark:text-slate-200">
                  {filteredInventoryItems.length === 0 ? (
                    <tr>
                      <td colSpan={7 + warehouses.length} className="p-8 text-center text-slate-400 font-bold">
                        لا توجد أصناف تطابق معايير البحث والفلترة المحددة.
                      </td>
                    </tr>
                  ) : (
                    filteredInventoryItems.map((item) => {
                      const isOutOfStock = item.totalStock === 0;
                      const isLowStock = item.totalStock <= item.minStockAlert;

                      return (
                        <tr
                          key={item.id}
                          className={`hover:bg-slate-50/80 dark:hover:bg-slate-800/50 transition-colors ${
                            isOutOfStock
                              ? "bg-rose-50/30 dark:bg-rose-950/10"
                              : isLowStock
                              ? "bg-amber-50/30 dark:bg-amber-950/10"
                              : ""
                          }`}
                        >
                          <td className="p-3.5">
                            <div className="flex items-center gap-3">
                              {item.image ? (
                                <img
                                  src={item.image}
                                  alt={item.name}
                                  className="w-10 h-10 rounded-xl object-cover border border-slate-200 dark:border-slate-700 shrink-0"
                                />
                              ) : (
                                <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400 shrink-0">
                                  <Package className="w-5 h-5" />
                                </div>
                              )}
                              <div>
                                <strong className="font-extrabold text-slate-900 dark:text-white block">
                                  {item.name}
                                </strong>
                                <span className="text-[11px] text-slate-400 font-medium">
                                  {item.category || "عام"} • {item.unit || "حبة"}
                                </span>
                              </div>
                            </div>
                          </td>

                          <td className="p-3.5 font-mono text-[11px] text-slate-500">
                            <div>{item.barcode || "—"}</div>
                            <div className="text-[10px] text-slate-400">{item.sku}</div>
                          </td>

                          <td className="p-3.5 font-bold">{item.costPrice.toLocaleString("ar-YE")} ر.ي</td>
                          <td className="p-3.5 font-bold text-emerald-600 dark:text-emerald-400">
                            {item.sellingPrice.toLocaleString("ar-YE")} ر.ي
                          </td>

                          {/* Stocks in each warehouse */}
                          {warehouses.map((wh) => {
                            const whQty = item.warehouseStock?.[wh.id] || 0;
                            return (
                              <td key={wh.id} className="p-3.5 text-center font-bold">
                                <span
                                  className={`px-2 py-1 rounded-lg text-xs ${
                                    whQty === 0
                                      ? "text-slate-400 bg-slate-100 dark:bg-slate-800"
                                      : whQty <= 3
                                      ? "text-amber-600 bg-amber-50 dark:bg-amber-950/60"
                                      : "text-slate-900 dark:text-white"
                                  }`}
                                >
                                  {whQty}
                                </span>
                              </td>
                            );
                          })}

                          <td className="p-3.5 text-center">
                            <span className="font-black text-sm text-slate-900 dark:text-white">
                              {item.totalStock}
                            </span>{" "}
                            <span className="text-[10px] text-slate-400">{item.unit}</span>
                          </td>

                          <td className="p-3.5 text-center">
                            {isOutOfStock ? (
                              <span className="px-2.5 py-1 rounded-full text-[10px] font-black bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800">
                                نفد تماماً (0)
                              </span>
                            ) : isLowStock ? (
                              <span className="px-2.5 py-1 rounded-full text-[10px] font-black bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
                                منخفض ({item.totalStock})
                              </span>
                            ) : (
                              <span className="px-2.5 py-1 rounded-full text-[10px] font-black bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                                متوفر آمن ✓
                              </span>
                            )}
                          </td>

                          <td className="p-3.5 text-center">
                            <div className="flex items-center justify-center gap-1.5">
                              {warehouses.length >= 2 && item.totalStock > 0 && (
                                <button
                                  onClick={() => openTransferModalFor(item.id)}
                                  className="p-1.5 rounded-lg text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-950/50"
                                  title="تحويل كمية بين الفروع"
                                >
                                  <ArrowLeftRight className="w-4 h-4" />
                                </button>
                              )}
                              {isLowStock && (
                                <button
                                  onClick={() => handleSingleItemReorder(item)}
                                  className="px-2 py-1 rounded-lg bg-amber-500 hover:bg-amber-600 text-slate-950 font-black text-[10.5px] flex items-center gap-1 shadow-2xs"
                                  title="طلب فوري من المصنع"
                                >
                                  <Zap className="w-3 h-3 fill-current" />
                                  <span>طلب</span>
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          VIEW 3: FINANCIAL STOCK VALUATION (تقرير القيمة المالية ورأس المال المخزون)
         ========================================================================= */}
      {activeTab === "FINANCIAL_VALUATION" && (
        <div className="space-y-6 animate-in fade-in duration-200">
          {/* Summary Metric Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-1">
              <span className="text-xs text-slate-500 dark:text-slate-400 font-bold block">
                رأس مال المخزون (التكلفة)
              </span>
              <div className="text-2xl font-black text-slate-900 dark:text-white">
                {globalStockCostValue.toLocaleString("ar-YE")}{" "}
                <span className="text-xs font-bold text-slate-500">ر.ي</span>
              </div>
              <p className="text-[11px] text-slate-400">إجمالي المبالغ المستثمرة في البضاعة الحالية</p>
            </div>

            <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-1">
              <span className="text-xs text-slate-500 dark:text-slate-400 font-bold block">
                القيمة البيعية المتوقعة
              </span>
              <div className="text-2xl font-black text-blue-600 dark:text-blue-400">
                {globalStockSellingValue.toLocaleString("ar-YE")}{" "}
                <span className="text-xs font-bold text-blue-500">ر.ي</span>
              </div>
              <p className="text-[11px] text-slate-400">إجمالي عوائد البيع المتوقعة لجميع الوحدات</p>
            </div>

            <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-1">
              <span className="text-xs text-slate-500 dark:text-slate-400 font-bold block">
                هامش الربح الإجمالي المتوقع
              </span>
              <div className="text-2xl font-black text-emerald-600 dark:text-emerald-400">
                +{estimatedProfit.toLocaleString("ar-YE")}{" "}
                <span className="text-xs font-bold text-emerald-500">ر.ي</span>
              </div>
              <p className="text-[11px] text-emerald-600 dark:text-emerald-400 font-bold">
                متوسط نسبة الهامش: +{profitMarginPercent}%
              </p>
            </div>

            <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-1">
              <span className="text-xs text-slate-500 dark:text-slate-400 font-bold block">
                متوسط تكلفة الوحدة المخزونة
              </span>
              <div className="text-2xl font-black text-purple-600 dark:text-purple-400">
                {globalStockUnits > 0 ? (globalStockCostValue / globalStockUnits).toFixed(1) : 0}{" "}
                <span className="text-xs font-bold text-purple-500">ر.ي/وحدة</span>
              </div>
              <p className="text-[11px] text-slate-400">عبر {globalStockUnits.toLocaleString("ar-YE")} وحدة في المخازن</p>
            </div>
          </div>

          {/* Breakdown Per Warehouse Table */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-5 space-y-4 shadow-xs">
            <h4 className="text-sm font-black text-slate-900 dark:text-white flex items-center gap-2">
              <Building2 className="w-5 h-5 text-indigo-500" />
              <span>توزيع رأس المال والقيمة المالية حسب المستودعات</span>
            </h4>

            <div className="overflow-x-auto">
              <table className="w-full text-right text-xs">
                <thead className="bg-slate-50 dark:bg-slate-800/80 text-slate-500 dark:text-slate-400 font-bold">
                  <tr>
                    <th className="p-3">المستودع / الفرع</th>
                    <th className="p-3">المدينة والمنطقة</th>
                    <th className="p-3 text-center">عدد الأصناف</th>
                    <th className="p-3 text-center">إجمالي الوحدات</th>
                    <th className="p-3">قيمة التكلفة (رأس المال)</th>
                    <th className="p-3">القيمة البيعية المتوقعة</th>
                    <th className="p-3 text-center">نسبة الحصة من المخزون</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-medium">
                  {warehouses.map((wh) => {
                    let whItemsCount = 0;
                    let whUnits = 0;
                    let whCostValue = 0;
                    let whSellingValue = 0;

                    items.forEach((it) => {
                      const qty = it.warehouseStock?.[wh.id] || 0;
                      if (qty > 0) {
                        whItemsCount++;
                        whUnits += qty;
                        whCostValue += qty * it.costPrice;
                        whSellingValue += qty * it.sellingPrice;
                      }
                    });

                    const percentage = globalStockCostValue > 0 ? ((whCostValue / globalStockCostValue) * 100).toFixed(1) : "0";

                    return (
                      <tr key={wh.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                        <td className="p-3 font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                          <Building2 className="w-4 h-4 text-blue-500" />
                          <span>{wh.name}</span>
                          {wh.isDefault && (
                            <span className="text-[9.5px] px-2 py-0.5 rounded-full bg-blue-100 dark:bg-blue-950 text-blue-600 font-bold">
                              رئيسي
                            </span>
                          )}
                        </td>
                        <td className="p-3 text-slate-500">
                          {wh.city} {wh.district ? `- ${wh.district}` : ""}
                        </td>
                        <td className="p-3 text-center font-bold">{whItemsCount} صنف</td>
                        <td className="p-3 text-center font-bold">{whUnits.toLocaleString("ar-YE")}</td>
                        <td className="p-3 font-black text-slate-900 dark:text-white">
                          {whCostValue.toLocaleString("ar-YE")} ر.ي
                        </td>
                        <td className="p-3 font-bold text-emerald-600 dark:text-emerald-400">
                          {whSellingValue.toLocaleString("ar-YE")} ر.ي
                        </td>
                        <td className="p-3 text-center">
                          <div className="flex items-center justify-center gap-2">
                            <div className="w-20 bg-slate-200 dark:bg-slate-700 h-2 rounded-full overflow-hidden">
                              <div
                                className="bg-indigo-600 h-full rounded-full"
                                style={{ width: `${percentage}%` }}
                              />
                            </div>
                            <span className="font-bold text-[11px] text-slate-700 dark:text-slate-300">
                              {percentage}%
                            </span>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Top 5 Most Valuable Inventory Assets */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-5 space-y-4 shadow-xs">
            <h4 className="text-sm font-black text-slate-900 dark:text-white flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-emerald-500" />
              <span>أعلى 5 أصناف قيمة كأصول ومخزون في مستودعاتك</span>
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5">
              {[...items]
                .sort((a, b) => b.totalStock * b.costPrice - a.totalStock * a.costPrice)
                .slice(0, 5)
                .map((item, idx) => {
                  const assetValue = item.totalStock * item.costPrice;
                  return (
                    <div
                      key={item.id}
                      className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-2 relative"
                    >
                      <span className="absolute top-2 left-2 text-[10px] font-black w-5 h-5 rounded-full bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 flex items-center justify-center">
                        #{idx + 1}
                      </span>
                      <strong className="text-xs font-black text-slate-900 dark:text-white block truncate pl-6">
                        {item.name}
                      </strong>
                      <div className="text-sm font-extrabold text-emerald-600 dark:text-emerald-400">
                        {assetValue.toLocaleString("ar-YE")} ر.ي
                      </div>
                      <div className="text-[10px] text-slate-400">
                        {item.totalStock} {item.unit} × {item.costPrice} ر.ي
                      </div>
                    </div>
                  );
                })}
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          VIEW 4: SHORTAGES & DEFICITS RADAR (رصد ومعالجة النواقص الفورية)
         ========================================================================= */}
      {activeTab === "SHORTAGES_RADAR" && (
        <div className="space-y-6 animate-in fade-in duration-200">
          {/* Quick Action Reorder Banner with Presets */}
          <div className="p-6 rounded-3xl bg-gradient-to-br from-amber-500/20 via-amber-500/10 to-orange-500/20 border-2 border-amber-400/60 dark:border-amber-600/60 flex flex-col xl:flex-row items-start xl:items-center justify-between gap-5 shadow-md">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-amber-500 text-slate-950 flex items-center justify-center shrink-0 shadow-md">
                <Zap className="w-8 h-8 fill-slate-950" />
              </div>
              <div>
                <h3 className="text-base font-black text-slate-950 dark:text-white flex items-center gap-2">
                  <span>مركز التعويض الفوري لنواقص المستودعات</span>
                  <span className="px-2.5 py-0.5 rounded-full bg-amber-500 text-slate-950 text-xs font-black">
                    {globalShortagesCount} صنف يحتاج تزويد
                  </span>
                </h3>
                <p className="text-xs text-slate-600 dark:text-slate-300 mt-1">
                  اختر مضاعف التزويد المناسب ثم أضف النواقص للسلة الموحدة مع إمكانية تعديل وتحديد الكميات بالكيبورد
                </p>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full xl:w-auto">
              {/* Replenishment Preset Selector */}
              <div className="flex items-center bg-white/80 dark:bg-slate-900/80 p-1.5 rounded-2xl border border-amber-400/40 dark:border-amber-700/40 shadow-xs text-xs font-bold">
                <span className="text-[11px] text-slate-500 dark:text-slate-400 px-2 font-black">
                  مستوى التعويض:
                </span>
                <button
                  type="button"
                  onClick={() => setReplenishPreset("SAFE_1X")}
                  className={`px-2.5 py-1.5 rounded-xl transition-all cursor-pointer ${
                    replenishPreset === "SAFE_1X"
                      ? "bg-amber-500 text-slate-950 font-black shadow-2xs"
                      : "text-slate-700 dark:text-slate-300 hover:bg-amber-100/50 dark:hover:bg-slate-800"
                  }`}
                  title="تعويض حتى الحد الأدنى فقط"
                >
                  1x أدنى
                </button>
                <button
                  type="button"
                  onClick={() => setReplenishPreset("BALANCED_2X")}
                  className={`px-2.5 py-1.5 rounded-xl transition-all cursor-pointer ${
                    replenishPreset === "BALANCED_2X"
                      ? "bg-amber-500 text-slate-950 font-black shadow-2xs"
                      : "text-slate-700 dark:text-slate-300 hover:bg-amber-100/50 dark:hover:bg-slate-800"
                  }`}
                  title="تعويض قياسي متوازن ومريح (موصى به)"
                >
                  2x قياسي
                </button>
                <button
                  type="button"
                  onClick={() => setReplenishPreset("BULK_3X")}
                  className={`px-2.5 py-1.5 rounded-xl transition-all cursor-pointer ${
                    replenishPreset === "BULK_3X"
                      ? "bg-amber-500 text-slate-950 font-black shadow-2xs"
                      : "text-slate-700 dark:text-slate-300 hover:bg-amber-100/50 dark:hover:bg-slate-800"
                  }`}
                  title="شراء اقتصادي مضاعف 3x"
                >
                  3x اقتصادي
                </button>
                <button
                  type="button"
                  onClick={() => setReplenishPreset("LARGE_5X")}
                  className={`px-2.5 py-1.5 rounded-xl transition-all cursor-pointer ${
                    replenishPreset === "LARGE_5X"
                      ? "bg-amber-500 text-slate-950 font-black shadow-2xs"
                      : "text-slate-700 dark:text-slate-300 hover:bg-amber-100/50 dark:hover:bg-slate-800"
                  }`}
                  title="شراء جملة كبرى 5x"
                >
                  5x جملة كبرى
                </button>
              </div>

              <button
                type="button"
                onClick={() => handleOrderAllShortagesBulk()}
                className="px-5 py-3 rounded-2xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-black text-xs sm:text-sm shadow-md transition-all flex items-center justify-center gap-2 shrink-0 group cursor-pointer"
              >
                <ShoppingCart className="w-4 h-4 group-hover:scale-110 transition-transform" />
                <span>طلب وتجديد كافة النواقص بنقرة واحدة ⚡🛒</span>
              </button>
            </div>
          </div>

          {/* Severity Filter Controls */}
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-500 dark:text-slate-400">تصفية حسب الشدة:</span>
              <button
                onClick={() => setShortageSeverityFilter("ALL")}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors ${
                  shortageSeverityFilter === "ALL"
                    ? "bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-xs"
                    : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300"
                }`}
              >
                جميع النواقص ({globalShortagesCount})
              </button>
              <button
                onClick={() => setShortageSeverityFilter("OUT_OF_STOCK")}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors ${
                  shortageSeverityFilter === "OUT_OF_STOCK"
                    ? "bg-rose-600 text-white shadow-xs"
                    : "bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400"
                }`}
              >
                المنعدم تماماً 0 ({outOfStockCount})
              </button>
              <button
                onClick={() => setShortageSeverityFilter("CRITICAL")}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors ${
                  shortageSeverityFilter === "CRITICAL"
                    ? "bg-amber-600 text-white shadow-xs"
                    : "bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400"
                }`}
              >
                حرج جداً (أقل من نصف الحد)
              </button>
            </div>
          </div>

          {/* Shortages Grid Cards */}
          {shortageItemsList.length === 0 ? (
            <div className="p-12 text-center bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-3">
              <div className="w-14 h-14 mx-auto rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-600 flex items-center justify-center">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <h4 className="text-base font-black text-slate-900 dark:text-white">
                لا توجد نواقص مطابقة للفلتر المحدد!
              </h4>
              <p className="text-xs text-slate-500">
                مخزونك في حالة ممتازة وتكفي لتلبية احتياجات المبيعات والطلبات.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {shortageItemsList.map((item) => {
                const isZero = item.totalStock === 0;
                const recommendedOrder = Math.max(item.minStockAlert * 2 - item.totalStock, 10);
                const shortageUnits = Math.max(0, item.minStockAlert - item.totalStock);

                return (
                  <div
                    key={item.id}
                    className={`p-5 rounded-3xl bg-white dark:bg-slate-900 border ${
                      isZero
                        ? "border-rose-400/80 dark:border-rose-800/80 shadow-xs ring-1 ring-rose-400/20"
                        : "border-amber-300 dark:border-amber-800/80 shadow-xs"
                    } space-y-4 flex flex-col justify-between`}
                  >
                    <div className="space-y-3">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-3">
                          {item.image ? (
                            <img
                              src={item.image}
                              alt={item.name}
                              className="w-12 h-12 rounded-2xl object-cover border border-slate-200 dark:border-slate-700 shrink-0"
                            />
                          ) : (
                            <div className="w-12 h-12 rounded-2xl bg-amber-100 dark:bg-amber-950 text-amber-600 flex items-center justify-center shrink-0">
                              <AlertTriangle className="w-6 h-6" />
                            </div>
                          )}
                          <div>
                            <h4 className="text-sm font-black text-slate-900 dark:text-white leading-tight">
                              {item.name}
                            </h4>
                            <span className="text-[11px] text-slate-500 dark:text-slate-400">
                              {item.category} • الحد الأدنى: {item.minStockAlert} {item.unit}
                            </span>
                          </div>
                        </div>

                        <span
                          className={`px-2.5 py-1 rounded-full text-[10px] font-black shrink-0 ${
                            isZero
                              ? "bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800"
                              : "bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800"
                          }`}
                        >
                          {isZero ? "منعدم (0)" : `نقص ${shortageUnits} ${item.unit}`}
                        </span>
                      </div>

                      {/* Stock Bar vs Min Limit */}
                      <div className="space-y-1.5 bg-slate-50 dark:bg-slate-800/60 p-3 rounded-2xl border border-slate-100 dark:border-slate-800 text-xs">
                        <div className="flex items-center justify-between font-bold">
                          <span className="text-slate-500">الرصيد الفعلي الحالي:</span>
                          <span className={isZero ? "text-rose-600 dark:text-rose-400 font-black" : "text-amber-600 dark:text-amber-400 font-black"}>
                            {item.totalStock} {item.unit}
                          </span>
                        </div>
                        <div className="flex items-center justify-between font-bold">
                          <span className="text-slate-500">الكمية المقترحة للطلب:</span>
                          <span className="text-blue-600 dark:text-blue-400 font-black">
                            {recommendedOrder} {item.unit}
                          </span>
                        </div>
                        <div className="flex items-center justify-between font-bold">
                          <span className="text-slate-500">تكلفة التجديد التقديرية:</span>
                          <span className="text-slate-900 dark:text-white font-black">
                            {(recommendedOrder * item.costPrice).toLocaleString("ar-YE")} ر.ي
                          </span>
                        </div>
                      </div>

                      {/* Warehouse distribution pills */}
                      <div className="text-[11px] space-y-1 text-slate-500">
                        <span className="font-bold block text-[10px] text-slate-400">توزيع المخزون بالمستودعات:</span>
                        <div className="flex flex-wrap gap-1.5">
                          {warehouses.map((w) => {
                            const q = item.warehouseStock?.[w.id] || 0;
                            return (
                              <span
                                key={w.id}
                                className={`px-2 py-0.5 rounded-lg font-bold text-[10px] ${
                                  q === 0
                                    ? "bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400"
                                    : "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300"
                                }`}
                              >
                                {w.name}: {q}
                              </span>
                            );
                          })}
                        </div>
                      </div>
                    </div>

                    <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-2">
                      {warehouses.length >= 2 && item.totalStock > 0 && (
                        <button
                          onClick={() => openTransferModalFor(item.id)}
                          className="px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs font-bold transition-colors flex items-center gap-1.5"
                        >
                          <ArrowLeftRight className="w-3.5 h-3.5 text-indigo-500" />
                          <span>تحويل داخلي</span>
                        </button>
                      )}

                      <button
                        onClick={() => handleSingleItemReorder(item)}
                        className="flex-1 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-black text-xs shadow-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                      >
                        <Zap className="w-3.5 h-3.5 fill-current" />
                        <span>طلب تعويض ({recommendedOrder} {item.unit}) ⚡</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* =========================================================================
          MODALS
         ========================================================================= */}

      {/* Add / Edit Warehouse Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 max-w-lg w-full p-6 space-y-5 shadow-2xl relative animate-in zoom-in-95 duration-150">
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute left-4 top-4 p-2 rounded-xl text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 border-b border-slate-200 dark:border-slate-800 pb-3">
              <div className="p-2.5 rounded-2xl bg-blue-500/10 text-blue-600 font-bold">
                <Building2 className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  {editingWh ? "تعديل بيانات المستودع" : "إضافة مستودع / فرع جديد"}
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  تحديد اسم المستودع، المدينة، وأمين التخزين
                </p>
              </div>
            </div>

            <form onSubmit={handleSubmitWarehouse} className="space-y-4 text-xs font-bold">
              <div>
                <label className="block text-slate-700 dark:text-slate-300 mb-1">
                  اسم المستودع / الفرع *
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="مثال: مستودع العاصمة الرئيسي - صنعاء"
                  className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 dark:text-slate-300 mb-1">المدينة</label>
                  <select
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                  >
                    <option value="صنعاء">صنعاء</option>
                    <option value="عدن">عدن</option>
                    <option value="تعز">تعز</option>
                    <option value="الحديدة">الحديدة</option>
                    <option value="إب">إب</option>
                    <option value="حضرموت (المكلا)">حضرموت (المكلا)</option>
                    <option value="ذمار">ذمار</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-700 dark:text-slate-300 mb-1">الحي / المنطقة</label>
                  <input
                    type="text"
                    value={district}
                    onChange={(e) => setDistrict(e.target.value)}
                    placeholder="مثال: حي حدة"
                    className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-700 dark:text-slate-300 mb-1">العنوان بالتفصيل</label>
                <input
                  type="text"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="مثال: شارع الخمسين - تقاطع الزبيري"
                  className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 dark:text-slate-300 mb-1">اسم أمين المستودع</label>
                  <input
                    type="text"
                    value={managerName}
                    onChange={(e) => setManagerName(e.target.value)}
                    placeholder="مثال: أحمد العمري"
                    className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 dark:text-slate-300 mb-1">رقم الجوال</label>
                  <input
                    type="text"
                    value={managerPhone}
                    onChange={(e) => setManagerPhone(e.target.value)}
                    placeholder="77xxxxxxx"
                    className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-700 dark:text-slate-300 mb-1">ملاحظات السعة والتخزين</label>
                <textarea
                  rows={2}
                  value={capacityNotes}
                  onChange={(e) => setCapacityNotes(e.target.value)}
                  placeholder="سعة التخزين، إمكانيات التبريد، إلخ..."
                  className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                />
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="defaultWhCheck"
                  checked={isDefault}
                  onChange={(e) => setIsDefault(e.target.checked)}
                  className="w-4 h-4 text-blue-600 rounded"
                />
                <label htmlFor="defaultWhCheck" className="text-slate-700 dark:text-slate-300">
                  تعيين كـ مستودع رئيسي افتراضي لعمليات البيع والخصم
                </label>
              </div>

              <div className="flex items-center gap-3 pt-3 border-t border-slate-200 dark:border-slate-800">
                <button
                  type="submit"
                  className="flex-1 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md transition-colors flex items-center justify-center gap-2"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>حفظ بيانات المستودع</span>
                </button>
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-5 py-3 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold text-xs hover:bg-slate-200"
                >
                  إلغاء
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Warehouse Items Drill-down Modal */}
      {viewingItemsWh && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 max-w-2xl w-full p-6 space-y-5 shadow-2xl relative max-h-[85vh] overflow-y-auto animate-in zoom-in-95 duration-150">
            <button
              onClick={() => setViewingItemsWh(null)}
              className="absolute left-4 top-4 p-2 rounded-xl text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 border-b border-slate-200 dark:border-slate-800 pb-3">
              <div className="p-2.5 rounded-2xl bg-blue-500/10 text-blue-600 font-bold">
                <Boxes className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  الأصناف المخزنة بـ {viewingItemsWh.name}
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {viewingItemsWh.city} - أمين المستودع: {viewingItemsWh.managerName}
                </p>
              </div>
            </div>

            <div className="space-y-2">
              <table className="w-full text-right text-xs">
                <thead className="bg-slate-50 dark:bg-slate-800 text-slate-500 font-bold">
                  <tr>
                    <th className="p-2.5">اسم الصنف</th>
                    <th className="p-2.5">الكمية بالمخزن</th>
                    <th className="p-2.5">سعر التكلفة</th>
                    <th className="p-2.5">الحالة والطلب</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-medium text-slate-700 dark:text-slate-300">
                  {items.map((it) => {
                    const qty = it.warehouseStock?.[viewingItemsWh.id] || 0;
                    const isShortage = qty <= 3 || qty <= it.minStockAlert;

                    return (
                      <tr key={it.id} className={isShortage ? "bg-amber-50/40 dark:bg-amber-950/20" : ""}>
                        <td className="p-2.5 font-bold text-slate-900 dark:text-white">
                          <div className="flex items-center gap-1.5">
                            {isShortage && <AlertTriangle className="w-3.5 h-3.5 text-amber-600 shrink-0" />}
                            <span>{it.name}</span>
                          </div>
                          <span className="block text-[10px] text-slate-400 font-mono">
                            SKU: {it.sku}
                          </span>
                        </td>
                        <td className="p-2.5 font-bold">
                          <span className={qty === 0 ? "text-rose-600 dark:text-rose-400" : isShortage ? "text-amber-600 dark:text-amber-400" : "text-emerald-600 dark:text-emerald-400"}>
                            {qty} {it.unit}
                          </span>
                        </td>
                        <td className="p-2.5">{it.costPrice.toLocaleString("ar-YE")} ر.ي</td>
                        <td className="p-2.5">
                          {isShortage ? (
                            <button
                              onClick={() => handleSingleItemReorder(it)}
                              className="px-2.5 py-1 rounded-lg bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-[11px] shadow-xs flex items-center gap-1 transition-all"
                            >
                              <Zap className="w-3 h-3 fill-slate-950" />
                              <span>طلب تعويض النقص ⚡</span>
                            </button>
                          ) : (
                            <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold">
                              متوفر بحالة جيدة ✓
                            </span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            <div className="pt-2 text-left">
              <button
                onClick={() => setViewingItemsWh(null)}
                className="px-5 py-2.5 rounded-xl bg-slate-900 dark:bg-slate-800 text-white font-bold text-xs hover:bg-slate-800"
              >
                إغلاق المعاينة
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Branch-to-Branch Transfer Modal */}
      {isTransferModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 max-w-lg w-full p-6 space-y-5 shadow-2xl relative animate-in zoom-in-95 duration-150">
            <button
              onClick={() => setIsTransferModalOpen(false)}
              className="absolute left-4 top-4 p-2 rounded-xl text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 border-b border-slate-200 dark:border-slate-800 pb-3">
              <div className="p-2.5 rounded-2xl bg-indigo-500/10 text-indigo-600 font-bold">
                <ArrowLeftRight className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  التحويل المخزني بين المستودعات والفروع
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  نقل كميات الأصناف مباشرة من فرع إلى فرع آخر
                </p>
              </div>
            </div>

            <form onSubmit={handleExecuteTransfer} className="space-y-4 text-xs font-bold">
              <div>
                <label className="block text-slate-700 dark:text-slate-300 mb-1">
                  اختر الصنف المراد تحويله *
                </label>
                <select
                  required
                  value={transferItemId}
                  onChange={(e) => setTransferItemId(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                >
                  {items.map((it) => (
                    <option key={it.id} value={it.id}>
                      {it.name} (إجمالي المتوفر: {it.totalStock} {it.unit})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 dark:text-slate-300 mb-1">
                    المستودع المصدر (من) *
                  </label>
                  <select
                    value={transferFromWhId}
                    onChange={(e) => setTransferFromWhId(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                  >
                    {warehouses.map((wh) => {
                      const curItem = items.find((i) => i.id === transferItemId);
                      const inWh = curItem?.warehouseStock?.[wh.id] || 0;
                      return (
                        <option key={wh.id} value={wh.id}>
                          {wh.name} (متوفر: {inWh})
                        </option>
                      );
                    })}
                  </select>
                </div>

                <div>
                  <label className="block text-slate-700 dark:text-slate-300 mb-1">
                    المستودع الوجهة (إلى) *
                  </label>
                  <select
                    value={transferToWhId}
                    onChange={(e) => setTransferToWhId(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                  >
                    {warehouses
                      .filter((w) => w.id !== transferFromWhId)
                      .map((wh) => (
                        <option key={wh.id} value={wh.id}>
                          {wh.name}
                        </option>
                      ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-700 dark:text-slate-300 mb-1">
                  الكمية المراد نقلها *
                </label>
                <input
                  type="number"
                  min={1}
                  required
                  value={transferQty}
                  onChange={(e) => setTransferQty(Number(e.target.value))}
                  className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                />
              </div>

              <div className="flex items-center gap-3 pt-3 border-t border-slate-200 dark:border-slate-800">
                <button
                  type="submit"
                  className="flex-1 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-md transition-colors flex items-center justify-center gap-2"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>تأكيد التحويل المخزني الفوري</span>
                </button>
                <button
                  type="button"
                  onClick={() => setIsTransferModalOpen(false)}
                  className="px-5 py-3 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold text-xs hover:bg-slate-200"
                >
                  إلغاء
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
