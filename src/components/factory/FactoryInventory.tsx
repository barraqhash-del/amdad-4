import React, { useState, useRef, useMemo } from "react";
import { Product, Factory } from "../../types";
import { storeService } from "../../services/storeService";
import {
  Package,
  Plus,
  Edit2,
  Check,
  X,
  Boxes,
  DollarSign,
  Tag,
  Building2,
  Trash2,
  Upload,
  Image as ImageIcon,
  FileText,
  Link as LinkIcon,
  Search,
  AlertTriangle,
  CheckCircle2,
  ArrowUpDown,
  SlidersHorizontal,
  LayoutGrid,
  List,
  Sparkles,
  RefreshCw,
  TrendingDown,
  TrendingUp,
  AlertCircle,
  ShieldAlert,
  Bell,
  Archive,
  BarChart2,
  PlusCircle,
  MinusCircle,
  Eye,
  CheckCircle,
} from "lucide-react";

interface Props {
  factory: Factory;
  products: Product[];
}

type TabType = "ALL" | "AVAILABLE" | "LOW_STOCK" | "OUT_OF_STOCK";
type SortOption = "STOCK_ASC" | "STOCK_DESC" | "PRICE_DESC" | "PRICE_ASC" | "NAME_ASC" | "NEWEST";
type ViewMode = "GRID" | "TABLE";

export const FactoryInventory: React.FC<Props> = ({ factory, products }) => {
  const factoryProducts = useMemo(() => {
    return products.filter((p) => p.factoryId === factory.id);
  }, [products, factory.id]);

  // Search & Filter States
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState<TabType>("ALL");
  const [selectedCategory, setSelectedCategory] = useState<string>("ALL");
  const [sortOption, setSortOption] = useState<SortOption>("STOCK_ASC");
  const [viewMode, setViewMode] = useState<ViewMode>("GRID");

  // Inline Editing
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editPrice, setEditPrice] = useState<number>(0);
  const [editStock, setEditStock] = useState<number>(0);
  const [editMinAlert, setEditMinAlert] = useState<number>(50);

  // Quick Restock Input Modal
  const [quickRestockItem, setQuickRestockItem] = useState<Product | null>(null);
  const [customRestockQty, setCustomRestockQty] = useState<number>(100);

  // Add Product Modal
  const [showAddModal, setShowAddModal] = useState(false);
  const [newName, setNewName] = useState("");
  const [newDesc, setNewDesc] = useState("");
  const [newPrice, setNewPrice] = useState<number>(50);
  const [newUnit, setNewUnit] = useState("كرتونة (24 حبة)");
  const [newStock, setNewStock] = useState<number>(500);
  const [newMinStockAlert, setNewMinStockAlert] = useState<number>(50);
  const [newCategory, setNewCategory] = useState(factory.categoryNameAr || "مواد غذائية وألبان");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [imageMode, setImageMode] = useState<"FILE" | "URL">("FILE");
  const [newImage, setNewImage] = useState<string>(
    "https://images.unsplash.com/photo-1542838132-92c53300491e?w=500&auto=format&fit=crop&q=80"
  );
  const [imagePreview, setImagePreview] = useState<string>("");

  // Threshold Configuration Modal
  const [showThresholdConfigModal, setShowThresholdConfigModal] = useState(false);
  const [globalThresholdValue, setGlobalThresholdValue] = useState<number>(50);

  // Categories extracted from factory products
  const availableCategories = useMemo(() => {
    const cats = new Set<string>();
    factoryProducts.forEach((p) => {
      if (p.category) cats.add(p.category);
    });
    return Array.from(cats);
  }, [factoryProducts]);

  // Inventory Statistics & KPIs
  const stats = useMemo(() => {
    const totalItems = factoryProducts.length;
    let totalStockUnits = 0;
    let totalInventoryValue = 0;
    let availableCount = 0;
    let lowStockCount = 0;
    let outOfStockCount = 0;

    factoryProducts.forEach((p) => {
      const stock = p.stock || 0;
      const minAlert = p.minStockAlert !== undefined ? p.minStockAlert : 50;
      totalStockUnits += stock;
      totalInventoryValue += (p.price || 0) * stock;

      if (stock === 0 || !p.isAvailable) {
        outOfStockCount++;
      } else if (stock <= minAlert) {
        lowStockCount++;
        availableCount++; // Still has some stock available
      } else {
        availableCount++;
      }
    });

    return {
      totalItems,
      totalStockUnits,
      totalInventoryValue,
      availableCount,
      lowStockCount,
      outOfStockCount,
    };
  }, [factoryProducts]);

  // Filtered & Sorted Products
  const filteredProducts = useMemo(() => {
    let list = [...factoryProducts];

    // 1. Tab filtering
    if (activeTab === "AVAILABLE") {
      // In-stock and available items (both normal and low stock)
      list = list.filter((p) => (p.stock || 0) > 0 && p.isAvailable);
    } else if (activeTab === "LOW_STOCK") {
      // Specifically items needing replenishment: stock <= minStockAlert
      list = list.filter((p) => {
        const minAlert = p.minStockAlert !== undefined ? p.minStockAlert : 50;
        return (p.stock || 0) <= minAlert;
      });
    } else if (activeTab === "OUT_OF_STOCK") {
      list = list.filter((p) => (p.stock || 0) === 0 || !p.isAvailable);
    }

    // 2. Category filtering
    if (selectedCategory !== "ALL") {
      list = list.filter((p) => p.category === selectedCategory);
    }

    // 3. Search query filtering
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      list = list.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.sku.toLowerCase().includes(q) ||
          (p.barcode && p.barcode.includes(q)) ||
          p.unit.toLowerCase().includes(q) ||
          p.category.toLowerCase().includes(q) ||
          (p.description && p.description.toLowerCase().includes(q))
      );
    }

    // 4. Sorting
    list.sort((a, b) => {
      const stockA = a.stock || 0;
      const stockB = b.stock || 0;
      const priceA = a.price || 0;
      const priceB = b.price || 0;
      const minA = a.minStockAlert !== undefined ? a.minStockAlert : 50;
      const minB = b.minStockAlert !== undefined ? b.minStockAlert : 50;

      switch (sortOption) {
        case "STOCK_ASC":
          // Items closest to or below threshold come first (needs restock)
          return stockA - stockB;
        case "STOCK_DESC":
          return stockB - stockA;
        case "PRICE_DESC":
          return priceB - priceA;
        case "PRICE_ASC":
          return priceA - priceB;
        case "NAME_ASC":
          return a.name.localeCompare(b.name, "ar");
        case "NEWEST":
        default:
          return b.id.localeCompare(a.id);
      }
    });

    return list;
  }, [factoryProducts, activeTab, selectedCategory, searchQuery, sortOption]);

  const handleImageFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 8 * 1024 * 1024) {
        alert("حجم الصورة كبير، يرجى اختيار صورة أقل من 8 ميجابايت.");
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64 = reader.result as string;
        setImagePreview(base64);
        setNewImage(base64);
      };
      reader.readAsDataURL(file);
    }
  };

  const startEdit = (p: Product) => {
    setEditingId(p.id);
    setEditPrice(p.price);
    setEditStock(p.stock);
    setEditMinAlert(p.minStockAlert !== undefined ? p.minStockAlert : 50);
  };

  const saveEdit = (p: Product) => {
    storeService.updateProduct({
      ...p,
      price: editPrice,
      stock: editStock,
      minStockAlert: editMinAlert,
      isAvailable: editStock > 0 ? true : p.isAvailable,
    });
    setEditingId(null);
  };

  const toggleAvailability = (p: Product) => {
    storeService.updateProduct({
      ...p,
      isAvailable: !p.isAvailable,
    });
  };

  const handleDeleteProduct = (p: Product) => {
    if (window.confirm(`هل أنت متأكد من حذف المنتج (${p.name}) نهائياً من الكتالوج والمخزن؟`)) {
      storeService.deleteProduct(p.id);
    }
  };

  const handleQuickRestock = (productId: string, amount: number) => {
    storeService.quickRestockProduct(productId, amount);
  };

  const handleApplyGlobalThreshold = () => {
    if (globalThresholdValue < 0) return;
    factoryProducts.forEach((p) => {
      storeService.updateProduct({
        ...p,
        minStockAlert: globalThresholdValue,
      });
    });
    setShowThresholdConfigModal(false);
  };

  const handleAddProduct = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) return;

    const newProd: Product = {
      id: `p-${Date.now()}`,
      factoryId: factory.id,
      factoryName: factory.name,
      name: newName,
      description: newDesc,
      category: newCategory || factory.categoryNameAr || "عام",
      price: newPrice,
      unit: newUnit,
      stock: newStock,
      minQuantity: 1,
      minStockAlert: newMinStockAlert,
      image: newImage,
      sku: `SKU-${Math.floor(100 + Math.random() * 900)}`,
      barcode: `628${Math.floor(1000000000 + Math.random() * 9000000000)}`,
      isAvailable: newStock > 0,
    };

    storeService.addProduct(newProd);
    setShowAddModal(false);
    setNewName("");
    setNewDesc("");
    setNewPrice(50);
    setNewStock(500);
    setNewMinStockAlert(50);
    setImagePreview("");
  };

  return (
    <div className="space-y-6 dir-rtl">
      
      {/* =========================================================================
          1. HEADER & ACTIONS BAR (رأس لوحة المخزون المتطورة)
          ========================================================================= */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-gradient-to-br from-slate-900 via-slate-800 to-indigo-950 p-5 sm:p-6 rounded-3xl text-white shadow-xl border border-slate-800 relative overflow-hidden">
        {/* Glow decoration */}
        <div className="absolute top-0 right-1/3 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 space-y-1">
          <div className="flex items-center gap-2.5">
            <div className="w-11 h-11 rounded-2xl bg-indigo-600/30 border border-indigo-400/40 flex items-center justify-center text-indigo-300 shadow-md">
              <Boxes className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-black text-white tracking-tight flex items-center gap-2">
                <span>إدارة المخزون والكميات المتاحة</span>
                <span className="px-2.5 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-400/30 text-xs font-bold">
                  {factory.name}
                </span>
              </h2>
              <p className="text-xs text-slate-300">
                متابعة دقيقة للأصناف، كشف الكميات المتاحة، وتنبيهات إعادة التجديد قبل النفاد
              </p>
            </div>
          </div>
        </div>

        <div className="relative z-10 flex items-center gap-2.5 flex-wrap">
          <button
            type="button"
            onClick={() => setShowThresholdConfigModal(true)}
            className="px-3.5 py-2.5 rounded-2xl bg-slate-800/90 hover:bg-slate-700 text-slate-200 border border-slate-700 font-bold text-xs shadow-xs transition-all flex items-center gap-1.5 cursor-pointer active:scale-95"
            title="تحديد حد التنبيه الأدنى للمخزون"
          >
            <Bell className="w-4 h-4 text-amber-400" />
            <span>ضبط حدود التنبيه ⚠️</span>
          </button>

          <button
            type="button"
            onClick={() => setShowAddModal(true)}
            className="px-4 py-2.5 rounded-2xl bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-600 text-white font-black text-xs shadow-lg shadow-indigo-600/30 transition-all flex items-center gap-2 cursor-pointer active:scale-95"
          >
            <Plus className="w-4 h-4" />
            <span>إضافة صنف جديد للمصنع</span>
          </button>
        </div>
      </div>

      {/* =========================================================================
          2. KPI & INVENTORY METRICS SUMMARY CARDS (مؤشرات المخزون الرئيسية)
          ========================================================================= */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        
        {/* Metric 1: Total Catalog Items */}
        <div
          onClick={() => setActiveTab("ALL")}
          className={`p-3.5 rounded-2xl border transition-all cursor-pointer shadow-xs ${
            activeTab === "ALL"
              ? "bg-indigo-50/90 dark:bg-indigo-950/40 border-indigo-500 ring-2 ring-indigo-500/20"
              : "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-slate-300"
          }`}
        >
          <div className="flex items-center justify-between gap-1.5">
            <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400">إجمالي الأصناف</span>
            <div className="p-1.5 rounded-xl bg-indigo-100 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400">
              <Package className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-1.5">
            <span className="text-xl font-black text-slate-900 dark:text-white font-mono">
              {stats.totalItems}
            </span>
            <span className="text-[10px] text-slate-400 font-bold">صنف مسجل</span>
          </div>
        </div>

        {/* Metric 2: Available In-Stock Items */}
        <div
          onClick={() => setActiveTab("AVAILABLE")}
          className={`p-3.5 rounded-2xl border transition-all cursor-pointer shadow-xs ${
            activeTab === "AVAILABLE"
              ? "bg-emerald-50/90 dark:bg-emerald-950/40 border-emerald-500 ring-2 ring-emerald-500/20"
              : "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-slate-300"
          }`}
        >
          <div className="flex items-center justify-between gap-1.5">
            <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400">الكميات المتاحة</span>
            <div className="p-1.5 rounded-xl bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-1.5">
            <span className="text-xl font-black text-emerald-600 dark:text-emerald-400 font-mono">
              {stats.availableCount}
            </span>
            <span className="text-[10px] text-emerald-700 dark:text-emerald-300 font-bold">صنف متوفر للطلب</span>
          </div>
        </div>

        {/* Metric 3: Low Stock / Reorder Needed (CRITICAL) */}
        <div
          onClick={() => setActiveTab("LOW_STOCK")}
          className={`p-3.5 rounded-2xl border transition-all cursor-pointer shadow-xs relative overflow-hidden ${
            activeTab === "LOW_STOCK"
              ? "bg-amber-50 dark:bg-amber-950/40 border-amber-500 ring-2 ring-amber-500/30"
              : "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-amber-300"
          }`}
        >
          {stats.lowStockCount > 0 && (
            <span className="absolute top-2 left-2 w-2 h-2 rounded-full bg-amber-500 animate-ping" />
          )}
          <div className="flex items-center justify-between gap-1.5">
            <span className="text-[11px] font-bold text-amber-700 dark:text-amber-400 flex items-center gap-1">
              <span>تتطلب تجديد الكمية</span>
              <AlertTriangle className="w-3.5 h-3.5 text-amber-500" />
            </span>
            <div className="p-1.5 rounded-xl bg-amber-100 dark:bg-amber-950 text-amber-600 dark:text-amber-400">
              <TrendingDown className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-1.5">
            <span className="text-xl font-black text-amber-600 dark:text-amber-400 font-mono">
              {stats.lowStockCount}
            </span>
            <span className="text-[10px] text-amber-700 dark:text-amber-400 font-bold">صنف بحاجة لتعبئة</span>
          </div>
        </div>

        {/* Metric 4: Out of Stock */}
        <div
          onClick={() => setActiveTab("OUT_OF_STOCK")}
          className={`p-3.5 rounded-2xl border transition-all cursor-pointer shadow-xs ${
            activeTab === "OUT_OF_STOCK"
              ? "bg-rose-50/90 dark:bg-rose-950/40 border-rose-500 ring-2 ring-rose-500/20"
              : "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-slate-300"
          }`}
        >
          <div className="flex items-center justify-between gap-1.5">
            <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400">نافدة من المخزن</span>
            <div className="p-1.5 rounded-xl bg-rose-100 dark:bg-rose-950 text-rose-600 dark:text-rose-400">
              <Archive className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-1.5">
            <span className="text-xl font-black text-rose-600 dark:text-rose-400 font-mono">
              {stats.outOfStockCount}
            </span>
            <span className="text-[10px] text-rose-700 dark:text-rose-400 font-bold">صنف منتهي</span>
          </div>
        </div>

        {/* Metric 5: Total Inventory Value */}
        <div className="col-span-2 sm:col-span-1 p-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between gap-1.5">
            <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400">قيمة بضاعة المخزن</span>
            <div className="p-1.5 rounded-xl bg-cyan-100 dark:bg-cyan-950 text-cyan-600 dark:text-cyan-400">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-1">
            <span className="text-sm sm:text-base font-black text-cyan-700 dark:text-cyan-400 font-mono truncate">
              {stats.totalInventoryValue.toLocaleString("ar-YE")}
            </span>
            <span className="text-[10px] text-cyan-800 dark:text-cyan-300 font-bold">ر.ي</span>
          </div>
        </div>

      </div>

      {/* =========================================================================
          3. SEARCH, TAB NAVIGATION & CONTROLS (أيقونة البحث وأقسام التصفية)
          ========================================================================= */}
      <div className="bg-white dark:bg-slate-900 p-4 sm:p-5 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
        
        {/* Row 1: Search Bar + View Toggle */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          
          {/* Enhanced Search Input */}
          <div className="relative flex-1">
            <div className="absolute right-3.5 top-1/2 -translate-y-1/2 flex items-center pointer-events-none text-slate-400">
              <Search className="w-4 h-4 text-indigo-600" />
            </div>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="ابحث باسم المنتج، كود SKU، الباركود، الفئة، أو وحدة التعبئة..."
              className="w-full pr-10 pl-9 py-2.5 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-bold text-slate-900 dark:text-white placeholder:text-slate-400 focus:ring-2 focus:ring-indigo-500 focus:bg-white dark:focus:bg-slate-900 focus:outline-none transition-all shadow-inner"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                className="absolute left-3 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
                title="مسح البحث"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Controls: Sorting & View Mode */}
          <div className="flex items-center gap-2 justify-end flex-wrap">
            
            {/* Sort Dropdown */}
            <div className="flex items-center gap-1.5 bg-slate-50 dark:bg-slate-800 p-1 rounded-2xl border border-slate-200 dark:border-slate-700 text-xs">
              <ArrowUpDown className="w-3.5 h-3.5 text-slate-500 mr-2 shrink-0" />
              <select
                value={sortOption}
                onChange={(e) => setSortOption(e.target.value as SortOption)}
                className="bg-transparent text-slate-700 dark:text-slate-200 font-bold text-xs py-1.5 pl-2 pr-1 focus:outline-none cursor-pointer"
              >
                <option value="STOCK_ASC">الأقل كمية (الأولوية للتجديد ⚠️)</option>
                <option value="STOCK_DESC">الأعلى كمية وتوفراً</option>
                <option value="PRICE_DESC">الأعلى سعراً بالجملة</option>
                <option value="PRICE_ASC">الأقل سعراً بالجملة</option>
                <option value="NAME_ASC">أبجدياً (أ - ي)</option>
                <option value="NEWEST">الأحدث إضافة</option>
              </select>
            </div>

            {/* View Mode Toggle */}
            <div className="flex items-center bg-slate-100 dark:bg-slate-800 p-1 rounded-2xl border border-slate-200 dark:border-slate-700">
              <button
                type="button"
                onClick={() => setViewMode("GRID")}
                className={`p-2 rounded-xl transition-all cursor-pointer ${
                  viewMode === "GRID"
                    ? "bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-xs"
                    : "text-slate-400 hover:text-slate-600"
                }`}
                title="عرض البطاقات الشبكية"
              >
                <LayoutGrid className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => setViewMode("TABLE")}
                className={`p-2 rounded-xl transition-all cursor-pointer ${
                  viewMode === "TABLE"
                    ? "bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-xs"
                    : "text-slate-400 hover:text-slate-600"
                }`}
                title="عرض الجدول السريع"
              >
                <List className="w-4 h-4" />
              </button>
            </div>

          </div>

        </div>

        {/* Row 2: Category Pills (if more than 1 category) */}
        {availableCategories.length > 1 && (
          <div className="flex items-center gap-1.5 overflow-x-auto pt-1 border-t border-slate-100 dark:border-slate-800 text-xs">
            <span className="text-[11px] font-bold text-slate-400 shrink-0 ml-1">التصنيف:</span>
            <button
              type="button"
              onClick={() => setSelectedCategory("ALL")}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all cursor-pointer ${
                selectedCategory === "ALL"
                  ? "bg-indigo-600 text-white"
                  : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200"
              }`}
            >
              الكل ({factoryProducts.length})
            </button>
            {availableCategories.map((cat) => {
              const count = factoryProducts.filter((p) => p.category === cat).length;
              return (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all shrink-0 cursor-pointer ${
                    selectedCategory === cat
                      ? "bg-indigo-600 text-white"
                      : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200"
                  }`}
                >
                  {cat} ({count})
                </button>
              );
            })}
          </div>
        )}

      </div>

      {/* =========================================================================
          4. PROMINENT LOW-STOCK REPLENISHMENT CALLOUT (شريط تنبيه النقص)
          ========================================================================= */}
      {stats.lowStockCount > 0 && activeTab !== "OUT_OF_STOCK" && (
        <div className="p-4 rounded-3xl bg-gradient-to-r from-amber-500/15 via-amber-500/10 to-orange-500/15 border border-amber-500/40 text-amber-950 dark:text-amber-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-500 text-slate-950 flex items-center justify-center shrink-0 shadow-md">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-black text-xs sm:text-sm text-amber-900 dark:text-amber-300 flex items-center gap-1.5">
                <span>يوجد {stats.lowStockCount} أصناف وصلت للحد الأدنى وتتطلب تجديد الكمية فوراً!</span>
              </h4>
              <p className="text-[11px] text-amber-800 dark:text-amber-300/90 mt-0.5">
                يمكنك الضغط على أزرار التعبئة السريعة (+50 / +100 / +500) لتحديث كميات الإنتاج المتاحة لطلبات الجملة.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={() => setActiveTab("LOW_STOCK")}
              className="px-3.5 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-black text-xs transition-all shadow-sm flex items-center gap-1.5 cursor-pointer"
            >
              <Eye className="w-4 h-4" />
              <span>استعراض الأصناف المنخفضة ({stats.lowStockCount})</span>
            </button>
          </div>
        </div>
      )}

      {/* =========================================================================
          5. PRODUCTS LISTING (GRID OR TABLE VIEW)
          ========================================================================= */}
      {filteredProducts.length === 0 ? (
        <div className="p-12 text-center text-slate-400 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 space-y-3 shadow-xs">
          <div className="w-16 h-16 rounded-3xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400 mx-auto">
            <Boxes className="w-8 h-8" />
          </div>
          <h3 className="font-extrabold text-slate-800 dark:text-white text-base">
            {searchQuery
              ? `لا توجد منتجات مطابقة لبحثك عن "${searchQuery}"`
              : activeTab === "LOW_STOCK"
              ? "مخزونك في حالة ممتازة! لا توجد أصناف تتطلب تجديد الكمية حالياً"
              : activeTab === "OUT_OF_STOCK"
              ? "لا توجد أصناف نافدة من المخزن"
              : "لا توجد منتجات مسجلة في هذا القسم"}
          </h3>
          <p className="text-xs text-slate-500 max-w-md mx-auto">
            {searchQuery
              ? "تأكد من كتابة اسم الصنف أو كود SKU بدقة، أو قم بمسح عبارة البحث."
              : "يمكنك إضافة منتجات جديدة أو تغيير التبويب النشط للاطلاع على باقي الأصناف."}
          </p>
          {(searchQuery || activeTab !== "ALL" || selectedCategory !== "ALL") && (
            <button
              type="button"
              onClick={() => {
                setSearchQuery("");
                setActiveTab("ALL");
                setSelectedCategory("ALL");
              }}
              className="px-4 py-2 rounded-xl bg-indigo-600 text-white font-bold text-xs shadow-xs cursor-pointer hover:bg-indigo-700 transition-colors inline-flex items-center gap-1.5"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>إعادة ضبط العرض لكافة المنتجات</span>
            </button>
          )}
        </div>
      ) : viewMode === "GRID" ? (
        
        /* -------------------------------------------------------------
           GRID VIEW (عرض البطاقات التفاعلية الغنية بالمعلومات)
           ------------------------------------------------------------- */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
          {filteredProducts.map((p) => {
            const isEditing = editingId === p.id;
            const stock = p.stock || 0;
            const minAlert = p.minStockAlert !== undefined ? p.minStockAlert : 50;
            const isLowStock = stock <= minAlert;
            const isOutOfStock = stock === 0 || !p.isAvailable;
            
            // Stock percentage relative to 3x minAlert (for visual bar capped at 100%)
            const stockPercent = Math.min(100, Math.round((stock / Math.max(1, minAlert * 2.5)) * 100));

            return (
              <div
                key={p.id}
                className={`rounded-3xl border bg-white dark:bg-slate-900 p-4 sm:p-5 space-y-4 shadow-xs hover:shadow-md transition-all flex flex-col justify-between relative overflow-hidden ${
                  isOutOfStock
                    ? "border-rose-200 dark:border-rose-900/60 bg-rose-50/10 dark:bg-rose-950/10"
                    : isLowStock
                    ? "border-amber-300 dark:border-amber-700/80 bg-amber-50/20 dark:bg-amber-950/10 shadow-amber-500/5"
                    : "border-slate-200 dark:border-slate-800"
                }`}
              >
                
                {/* Product Header & Image */}
                <div className="space-y-3">
                  
                  {/* Top Badges Row */}
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[10px] font-mono font-bold text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-md">
                      {p.sku}
                    </span>

                    {isOutOfStock ? (
                      <span className="text-[10px] font-black px-2.5 py-0.5 rounded-full bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300 border border-rose-200 dark:border-rose-800 flex items-center gap-1">
                        <Archive className="w-3 h-3 text-rose-500" />
                        <span>نافد من المخزن 🚫</span>
                      </span>
                    ) : isLowStock ? (
                      <span className="text-[10px] font-black px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 border border-amber-300 dark:border-amber-700 flex items-center gap-1 animate-pulse">
                        <AlertTriangle className="w-3 h-3 text-amber-500" />
                        <span>يتطلب تجديد الكمية ⚠️</span>
                      </span>
                    ) : (
                      <span className="text-[10px] font-black px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3 text-emerald-500" />
                        <span>متوفر وجاهز ✓</span>
                      </span>
                    )}
                  </div>

                  {/* Product Info with Image */}
                  <div className="flex items-start gap-3">
                    <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 shrink-0 shadow-inner">
                      <img
                        src={p.image}
                        alt={p.name}
                        className="w-full h-full object-cover hover:scale-105 transition-transform"
                      />
                    </div>

                    <div className="flex-1 min-w-0">
                      <h4 className="font-black text-xs sm:text-sm text-slate-900 dark:text-white line-clamp-2 leading-snug">
                        {p.name}
                      </h4>
                      <div className="flex items-center gap-2 text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                        <span className="font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/60 px-1.5 py-0.2 rounded-md">
                          {p.unit}
                        </span>
                        {p.category && (
                          <span className="text-[10px] text-slate-400 truncate">
                            • {p.category}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Stock Level Progress Indicator */}
                  <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/70 border border-slate-200/80 dark:border-slate-700 space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-1">
                        <Boxes className="w-3.5 h-3.5 text-slate-400" />
                        <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400">الكمية الحالية:</span>
                      </div>
                      <div className="flex items-baseline gap-1">
                        <strong className={`text-base font-black font-mono ${
                          isOutOfStock
                            ? "text-rose-600 dark:text-rose-400"
                            : isLowStock
                            ? "text-amber-600 dark:text-amber-400"
                            : "text-slate-900 dark:text-white"
                        }`}>
                          {stock.toLocaleString("ar-YE")}
                        </strong>
                        <span className="text-[10px] text-slate-400 font-bold">{p.unit}</span>
                      </div>
                    </div>

                    {/* Visual Progress Bar */}
                    <div className="w-full bg-slate-200 dark:bg-slate-700 h-2 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all ${
                          isOutOfStock
                            ? "bg-rose-500 w-0"
                            : isLowStock
                            ? "bg-amber-500"
                            : "bg-emerald-500"
                        }`}
                        style={{ width: `${Math.max(5, stockPercent)}%` }}
                      />
                    </div>

                    <div className="flex items-center justify-between text-[10px] text-slate-400 font-bold pt-0.5">
                      <span className="flex items-center gap-1 text-slate-500 dark:text-slate-400">
                        <Bell className="w-3 h-3 text-amber-500" />
                        <span>حد التنبيه الأدنى: {minAlert} {p.unit}</span>
                      </span>
                      <span className={isLowStock ? "text-amber-600 dark:text-amber-400 font-black" : "text-emerald-600 dark:text-emerald-400"}>
                        {isOutOfStock ? "0%" : `${Math.round((stock / minAlert) * 100)}% من الحد`}
                      </span>
                    </div>
                  </div>

                </div>

                {/* Bottom Values & Actions */}
                <div className="space-y-3 pt-2 border-t border-slate-100 dark:border-slate-800">
                  
                  {isEditing ? (
                    <div className="p-3 rounded-2xl bg-indigo-50/60 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-800 space-y-2.5 text-xs">
                      <div className="font-extrabold text-indigo-900 dark:text-indigo-200 text-xs flex items-center justify-between">
                        <span>تعديل السعر والمخزون والتنبيه:</span>
                        <span className="font-mono text-[10px] text-slate-400">{p.sku}</span>
                      </div>

                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="text-[10px] font-bold text-slate-600 dark:text-slate-400 block mb-0.5">
                            سعر الجملة (ر.ي):
                          </label>
                          <input
                            type="number"
                            value={editPrice}
                            onChange={(e) => setEditPrice(Number(e.target.value))}
                            className="w-full p-1.5 border rounded-lg bg-white dark:bg-slate-900 font-bold text-xs"
                          />
                        </div>

                        <div>
                          <label className="text-[10px] font-bold text-slate-600 dark:text-slate-400 block mb-0.5">
                            الكمية المتوفرة:
                          </label>
                          <input
                            type="number"
                            value={editStock}
                            onChange={(e) => setEditStock(Number(e.target.value))}
                            className="w-full p-1.5 border rounded-lg bg-white dark:bg-slate-900 font-bold text-xs"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="text-[10px] font-bold text-amber-700 dark:text-amber-400 block mb-0.5">
                          حد التنبيه الأدنى للتجديد:
                        </label>
                        <input
                          type="number"
                          value={editMinAlert}
                          onChange={(e) => setEditMinAlert(Number(e.target.value))}
                          className="w-full p-1.5 border border-amber-300 dark:border-amber-700 rounded-lg bg-white dark:bg-slate-900 font-bold text-xs"
                        />
                      </div>

                      <div className="flex items-center gap-2 pt-1">
                        <button
                          type="button"
                          onClick={() => saveEdit(p)}
                          className="flex-1 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs shadow-xs cursor-pointer transition-colors"
                        >
                          حفظ التعديلات ✓
                        </button>
                        <button
                          type="button"
                          onClick={() => setEditingId(null)}
                          className="py-1.5 px-3 rounded-xl bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold text-xs cursor-pointer"
                        >
                          إلغاء
                        </button>
                      </div>
                    </div>
                  ) : (
                    <>
                      {/* Price & Value */}
                      <div className="flex items-center justify-between">
                        <div>
                          <span className="text-[10px] text-slate-400 block">سعر كرتونة الجملة:</span>
                          <strong className="text-emerald-700 dark:text-emerald-400 font-black text-sm font-mono">
                            {p.price} ر.ي
                          </strong>
                        </div>

                        <div className="text-left">
                          <span className="text-[10px] text-slate-400 block">قيمة المخزون:</span>
                          <span className="text-xs font-bold text-slate-700 dark:text-slate-300 font-mono">
                            {(p.price * stock).toLocaleString("ar-YE")} ر.ي
                          </span>
                        </div>
                      </div>

                      {/* Quick Restock Action Bar */}
                      <div className="space-y-1.5">
                        <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 flex items-center justify-between">
                          <span>تجديد وتعبئة سريعة للمخزن:</span>
                          <span className="text-[9px] text-indigo-500 cursor-pointer hover:underline" onClick={() => setQuickRestockItem(p)}>
                            كمية مخصصة ✎
                          </span>
                        </span>
                        
                        <div className="grid grid-cols-4 gap-1.5">
                          <button
                            type="button"
                            onClick={() => handleQuickRestock(p.id, 50)}
                            className="py-1 px-1.5 rounded-lg bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-950/60 dark:hover:bg-indigo-900/60 text-indigo-700 dark:text-indigo-300 font-mono font-bold text-[11px] border border-indigo-200 dark:border-indigo-800 transition-colors cursor-pointer"
                            title="إضافة 50 وحدة للمخزون"
                          >
                            +50
                          </button>
                          <button
                            type="button"
                            onClick={() => handleQuickRestock(p.id, 100)}
                            className="py-1 px-1.5 rounded-lg bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-950/60 dark:hover:bg-indigo-900/60 text-indigo-700 dark:text-indigo-300 font-mono font-bold text-[11px] border border-indigo-200 dark:border-indigo-800 transition-colors cursor-pointer"
                            title="إضافة 100 وحدة للمخزون"
                          >
                            +100
                          </button>
                          <button
                            type="button"
                            onClick={() => handleQuickRestock(p.id, 250)}
                            className="py-1 px-1.5 rounded-lg bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-950/60 dark:hover:bg-indigo-900/60 text-indigo-700 dark:text-indigo-300 font-mono font-bold text-[11px] border border-indigo-200 dark:border-indigo-800 transition-colors cursor-pointer"
                            title="إضافة 250 وحدة للمخزون"
                          >
                            +250
                          </button>
                          <button
                            type="button"
                            onClick={() => handleQuickRestock(p.id, 500)}
                            className="py-1 px-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-950/60 dark:hover:bg-emerald-900/60 text-emerald-800 dark:text-emerald-300 font-mono font-bold text-[11px] border border-emerald-200 dark:border-emerald-800 transition-colors cursor-pointer"
                            title="إضافة 500 وحدة للمخزون"
                          >
                            +500
                          </button>
                        </div>
                      </div>

                      {/* Card Control Buttons */}
                      <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800">
                        <button
                          type="button"
                          onClick={() => toggleAvailability(p)}
                          className={`text-[10px] font-bold px-2.5 py-1 rounded-xl border transition-colors cursor-pointer ${
                            p.isAvailable
                              ? "bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100"
                              : "bg-rose-50 text-rose-700 border-rose-200 hover:bg-rose-100"
                          }`}
                        >
                          {p.isAvailable ? "متاح للطلب 🟢" : "غير متاح 🔴"}
                        </button>

                        <div className="flex items-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => startEdit(p)}
                            className="p-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 transition-colors cursor-pointer"
                            title="تعديل السعر والمخزون والتنبيه"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>

                          <button
                            type="button"
                            onClick={() => handleDeleteProduct(p)}
                            className="p-1.5 rounded-xl bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/40 dark:hover:bg-rose-900/40 text-rose-600 dark:text-rose-400 transition-colors cursor-pointer"
                            title="حذف الصنف نهائياً"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    </>
                  )}

                </div>

              </div>
            );
          })}
        </div>
      ) : (
        
        /* -------------------------------------------------------------
           TABLE VIEW (عرض جدول بيانات سريع وكثيف للمخزون)
           ------------------------------------------------------------- */
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-right text-xs">
              <thead className="bg-slate-50 dark:bg-slate-800/80 text-slate-500 dark:text-slate-400 font-bold border-b border-slate-200 dark:border-slate-800">
                <tr>
                  <th className="p-3.5">المنتج / الصنف</th>
                  <th className="p-3.5">الفئة والوحدة</th>
                  <th className="p-3.5">سعر الجملة</th>
                  <th className="p-3.5">الكمية الحالية</th>
                  <th className="p-3.5">حد التنبيه</th>
                  <th className="p-3.5">حالة المخزون</th>
                  <th className="p-3.5">تجديد سريع</th>
                  <th className="p-3.5 text-center">إجراءات</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {filteredProducts.map((p) => {
                  const stock = p.stock || 0;
                  const minAlert = p.minStockAlert !== undefined ? p.minStockAlert : 50;
                  const isLowStock = stock <= minAlert;
                  const isOutOfStock = stock === 0 || !p.isAvailable;

                  return (
                    <tr
                      key={p.id}
                      className={`hover:bg-slate-50/80 dark:hover:bg-slate-800/50 transition-colors ${
                        isLowStock ? "bg-amber-50/20 dark:bg-amber-950/10" : ""
                      }`}
                    >
                      {/* Product Name & Image */}
                      <td className="p-3.5">
                        <div className="flex items-center gap-2.5">
                          <img
                            src={p.image}
                            alt={p.name}
                            className="w-10 h-10 rounded-xl object-cover border border-slate-200 dark:border-slate-700 shrink-0"
                          />
                          <div>
                            <div className="font-extrabold text-slate-900 dark:text-white line-clamp-1">
                              {p.name}
                            </div>
                            <span className="text-[10px] font-mono text-slate-400">{p.sku}</span>
                          </div>
                        </div>
                      </td>

                      {/* Category & Unit */}
                      <td className="p-3.5 text-slate-600 dark:text-slate-300">
                        <div>{p.unit}</div>
                        <div className="text-[10px] text-slate-400">{p.category}</div>
                      </td>

                      {/* Price */}
                      <td className="p-3.5 font-bold font-mono text-emerald-600 dark:text-emerald-400">
                        {p.price} ر.ي
                      </td>

                      {/* Current Stock */}
                      <td className="p-3.5">
                        <span className={`font-mono font-black text-sm ${
                          isOutOfStock ? "text-rose-600" : isLowStock ? "text-amber-600" : "text-slate-900 dark:text-white"
                        }`}>
                          {stock.toLocaleString("ar-YE")}
                        </span>
                      </td>

                      {/* Min Stock Alert */}
                      <td className="p-3.5 font-mono text-slate-500">
                        {minAlert}
                      </td>

                      {/* Stock Status Badge */}
                      <td className="p-3.5">
                        {isOutOfStock ? (
                          <span className="px-2 py-0.5 rounded-full bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300 text-[10px] font-black">
                            نافد 🚫
                          </span>
                        ) : isLowStock ? (
                          <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 text-[10px] font-black animate-pulse">
                            يتطلب تجديد ⚠️
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 text-[10px] font-black">
                            متوفر وجاهز ✓
                          </span>
                        )}
                      </td>

                      {/* Quick Restock Buttons */}
                      <td className="p-3.5">
                        <div className="flex items-center gap-1">
                          <button
                            type="button"
                            onClick={() => handleQuickRestock(p.id, 50)}
                            className="px-2 py-0.5 rounded-lg bg-slate-100 hover:bg-indigo-600 hover:text-white text-slate-700 text-[10px] font-bold font-mono transition-colors cursor-pointer"
                          >
                            +50
                          </button>
                          <button
                            type="button"
                            onClick={() => handleQuickRestock(p.id, 100)}
                            className="px-2 py-0.5 rounded-lg bg-slate-100 hover:bg-indigo-600 hover:text-white text-slate-700 text-[10px] font-bold font-mono transition-colors cursor-pointer"
                          >
                            +100
                          </button>
                          <button
                            type="button"
                            onClick={() => handleQuickRestock(p.id, 500)}
                            className="px-2 py-0.5 rounded-lg bg-emerald-50 hover:bg-emerald-600 hover:text-white text-emerald-800 text-[10px] font-bold font-mono transition-colors cursor-pointer"
                          >
                            +500
                          </button>
                        </div>
                      </td>

                      {/* Actions */}
                      <td className="p-3.5 text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => startEdit(p)}
                            className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-300 cursor-pointer"
                            title="تعديل الصنف"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteProduct(p)}
                            className="p-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/50 text-rose-600 cursor-pointer"
                            title="حذف الصنف"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* =========================================================================
          6. MODAL: ADD NEW PRODUCT (نافذة إضافة منتج جديد)
          ========================================================================= */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 dir-rtl overflow-y-auto">
          <div className="relative w-full max-w-lg rounded-3xl bg-white dark:bg-slate-900 shadow-2xl border border-slate-200 dark:border-slate-800 p-6 space-y-4 max-h-[90vh] overflow-y-auto">
            
            <div className="flex items-center justify-between border-b pb-3 border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-indigo-100 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400">
                  <Plus className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-black text-slate-900 dark:text-white text-base">
                    إضافة منتج جديد لكتالوج {factory.name}
                  </h3>
                  <p className="text-[11px] text-slate-400">
                    أدخل تفاصيل الصنف والكمية المتاحة وحد التنبيه لإعادة الطلب
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddProduct} className="space-y-4 text-xs">
              
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  اسم المنتج: <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="مثال: كرتونة عصير مانجو طازج 250 مل (24 حبة)"
                  className="w-full p-2.5 border border-slate-300 dark:border-slate-700 rounded-xl bg-slate-50 dark:bg-slate-800 focus:ring-2 focus:ring-indigo-500 font-bold"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    التصنيف / الفئة:
                  </label>
                  <input
                    type="text"
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value)}
                    placeholder="مثال: مواد غذائية، مشروبات..."
                    className="w-full p-2.5 border border-slate-300 dark:border-slate-700 rounded-xl bg-slate-50 dark:bg-slate-800 font-bold"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    الوحدة والتعبئة: <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={newUnit}
                    onChange={(e) => setNewUnit(e.target.value)}
                    placeholder="مثال: كرتونة (24 حبة)، كيس 10 كجم"
                    className="w-full p-2.5 border border-slate-300 dark:border-slate-700 rounded-xl bg-slate-50 dark:bg-slate-800 font-bold"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  وصف المنتج والمواصفات:
                </label>
                <textarea
                  rows={2}
                  value={newDesc}
                  onChange={(e) => setNewDesc(e.target.value)}
                  placeholder="اكتب وصفاً تفصيلياً للمكونات، مدة الصلاحية، أو شروط التخزين..."
                  className="w-full p-2.5 border border-slate-300 dark:border-slate-700 rounded-xl bg-slate-50 dark:bg-slate-800 focus:ring-2 focus:ring-indigo-500 font-medium resize-none"
                />
              </div>

              {/* Image Upload Selection */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                    <ImageIcon className="w-4 h-4 text-indigo-600" />
                    <span>صورة المنتج:</span>
                  </label>

                  <div className="flex rounded-lg bg-slate-100 dark:bg-slate-800 p-0.5 text-[10px] font-bold">
                    <button
                      type="button"
                      onClick={() => setImageMode("FILE")}
                      className={`px-2.5 py-1 rounded-md transition-all flex items-center gap-1 cursor-pointer ${
                        imageMode === "FILE"
                          ? "bg-indigo-600 text-white shadow-xs"
                          : "text-slate-500 hover:text-slate-900 dark:hover:text-white"
                      }`}
                    >
                      <Upload className="w-3 h-3" />
                      <span>رفع من الجهاز 📱</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setImageMode("URL")}
                      className={`px-2.5 py-1 rounded-md transition-all flex items-center gap-1 cursor-pointer ${
                        imageMode === "URL"
                          ? "bg-indigo-600 text-white shadow-xs"
                          : "text-slate-500 hover:text-slate-900 dark:hover:text-white"
                      }`}
                    >
                      <LinkIcon className="w-3 h-3" />
                      <span>رابط صورة web</span>
                    </button>
                  </div>
                </div>

                {imageMode === "FILE" ? (
                  <div className="space-y-2">
                    <input
                      type="file"
                      ref={fileInputRef}
                      accept="image/*"
                      onChange={handleImageFileChange}
                      className="hidden"
                    />

                    {imagePreview ? (
                      <div className="relative rounded-2xl border border-indigo-200 dark:border-indigo-800 p-2 bg-indigo-50/30 dark:bg-indigo-950/20 flex items-center gap-3">
                        <img
                          src={imagePreview}
                          alt="معاينة الصورة"
                          className="w-16 h-16 rounded-xl object-cover border border-slate-200 dark:border-slate-700 shadow-xs"
                        />
                        <div className="flex-1 min-w-0">
                          <span className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 block">
                            تم تحميل الصورة بنجاح ✓
                          </span>
                          <span className="text-[10px] text-slate-400 block">
                            جاهزة للعرض في كتالوج المصنع
                          </span>
                        </div>
                        <button
                          type="button"
                          onClick={() => fileInputRef.current?.click()}
                          className="px-2.5 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-[10px] cursor-pointer"
                        >
                          تغيير
                        </button>
                      </div>
                    ) : (
                      <div
                        onClick={() => fileInputRef.current?.click()}
                        className="border-2 border-dashed border-indigo-300 dark:border-indigo-800 hover:border-indigo-500 rounded-2xl p-4 text-center bg-indigo-50/20 dark:bg-indigo-950/10 cursor-pointer transition-all space-y-1.5"
                      >
                        <Upload className="w-6 h-6 text-indigo-500 mx-auto" />
                        <span className="font-extrabold text-slate-800 dark:text-slate-200 block text-xs">
                          انقر لاختيار صورة من هاتفك أو جهازك المحمول
                        </span>
                        <span className="text-[10px] text-slate-400 block">
                          تدعم صيغ PNG, JPG, WEBP حتى 8 ميجابايت
                        </span>
                      </div>
                    )}
                  </div>
                ) : (
                  <input
                    type="url"
                    value={newImage}
                    onChange={(e) => {
                      setNewImage(e.target.value);
                      setImagePreview(e.target.value);
                    }}
                    placeholder="https://example.com/product-image.jpg"
                    className="w-full p-2.5 border border-slate-300 dark:border-slate-700 rounded-xl bg-slate-50 dark:bg-slate-800 font-mono text-[11px]"
                  />
                )}
              </div>

              {/* Price, Initial Stock & Low Stock Alert */}
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    السعر بالجملة (ر.ي): <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="number"
                    required
                    min={1}
                    value={newPrice}
                    onChange={(e) => setNewPrice(Number(e.target.value))}
                    className="w-full p-2.5 border border-slate-300 dark:border-slate-700 rounded-xl bg-slate-50 dark:bg-slate-800 font-bold font-mono"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    الكمية المتاحة: <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="number"
                    required
                    min={0}
                    value={newStock}
                    onChange={(e) => setNewStock(Number(e.target.value))}
                    className="w-full p-2.5 border border-slate-300 dark:border-slate-700 rounded-xl bg-slate-50 dark:bg-slate-800 font-bold font-mono"
                  />
                </div>

                <div>
                  <label className="block font-bold text-amber-700 dark:text-amber-400 mb-1 flex items-center gap-1">
                    <Bell className="w-3 h-3 text-amber-500" />
                    <span>حد التنبيه الأدنى:</span>
                  </label>
                  <input
                    type="number"
                    required
                    min={0}
                    value={newMinStockAlert}
                    onChange={(e) => setNewMinStockAlert(Number(e.target.value))}
                    className="w-full p-2.5 border border-amber-300 dark:border-amber-700 rounded-xl bg-slate-50 dark:bg-slate-800 font-bold font-mono text-amber-700 dark:text-amber-400"
                    title="الكمية التي عند وصول المخزون إليها يظهر تنبيه لإعادة التجديد"
                  />
                </div>
              </div>

              <div className="p-3 rounded-2xl bg-amber-50/60 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 text-[11px] text-amber-900 dark:text-amber-300 flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <div>
                  <strong>تنبيه تجديد الكمية:</strong> عندما ينخفض رصيد هذا الصنف إلى أقل من أو يساوي (<strong>{newMinStockAlert} {newUnit}</strong>)، سيقوم النظام بإرسال إشعار فوري وتمييز الصنف في تبويب "تتطلب تجديد الكمية".
                </div>
              </div>

              <div className="pt-3 flex justify-end gap-2 border-t dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-200 transition-colors cursor-pointer"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-black shadow-md transition-all cursor-pointer"
                >
                  حفظ وإدراج الصنف بالمخزون
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* =========================================================================
          7. MODAL: CUSTOM QUICK RESTOCK (تجديد كمية مخصصة)
          ========================================================================= */}
      {quickRestockItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 dir-rtl">
          <div className="relative w-full max-w-sm rounded-3xl bg-white dark:bg-slate-900 shadow-2xl border border-slate-200 dark:border-slate-800 p-6 space-y-4">
            <div className="flex items-center justify-between border-b pb-3 border-slate-100 dark:border-slate-800">
              <h3 className="font-black text-slate-900 dark:text-white text-sm flex items-center gap-1.5">
                <Boxes className="w-4 h-4 text-indigo-600" />
                <span>تجديد كمية المخزون</span>
              </h3>
              <button
                type="button"
                onClick={() => setQuickRestockItem(null)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800 flex items-center gap-3">
                <img
                  src={quickRestockItem.image}
                  alt={quickRestockItem.name}
                  className="w-12 h-12 rounded-xl object-cover border shrink-0"
                />
                <div>
                  <div className="font-extrabold text-slate-900 dark:text-white line-clamp-1">
                    {quickRestockItem.name}
                  </div>
                  <div className="text-[11px] text-slate-400">
                    الرصيد الحالي: <strong className="text-slate-800 dark:text-white font-mono">{quickRestockItem.stock} {quickRestockItem.unit}</strong>
                  </div>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  الكمية المضافة للإنتاج ({quickRestockItem.unit}):
                </label>
                <input
                  type="number"
                  min={1}
                  value={customRestockQty}
                  onChange={(e) => setCustomRestockQty(Number(e.target.value))}
                  className="w-full p-2.5 border border-slate-300 dark:border-slate-700 rounded-xl bg-slate-50 dark:bg-slate-800 font-mono font-black text-base text-indigo-600"
                />
              </div>

              <div className="p-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-200 text-[11px] font-bold">
                الرصيد الإجمالي بعد التجديد: <strong className="font-mono text-sm">{quickRestockItem.stock + customRestockQty}</strong> {quickRestockItem.unit}
              </div>

              <div className="flex items-center gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    handleQuickRestock(quickRestockItem.id, customRestockQty);
                    setQuickRestockItem(null);
                  }}
                  className="flex-1 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs shadow-md transition-all cursor-pointer"
                >
                  تأكيد إضافة الكمية ✓
                </button>
                <button
                  type="button"
                  onClick={() => setQuickRestockItem(null)}
                  className="py-2.5 px-4 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold text-xs cursor-pointer"
                >
                  إلغاء
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          8. MODAL: GLOBAL THRESHOLD CONFIGURATION (ضبط حدود التنبيه العامة)
          ========================================================================= */}
      {showThresholdConfigModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 dir-rtl">
          <div className="relative w-full max-w-md rounded-3xl bg-white dark:bg-slate-900 shadow-2xl border border-slate-200 dark:border-slate-800 p-6 space-y-4">
            
            <div className="flex items-center justify-between border-b pb-3 border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-amber-100 dark:bg-amber-950 text-amber-600">
                  <Bell className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-black text-slate-900 dark:text-white text-base">
                    إعدادات حدود التنبيه الأدنى للمخزون
                  </h3>
                  <p className="text-[11px] text-slate-400">
                    تطبيق حد أدنى موحد لتنبيهات تجديد الكمية لكافة منتجات المصنع
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowThresholdConfigModal(false)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4 text-xs">
              <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
                يقوم هذا الخيار بتعيين حد التنبيه الأدنى الافتراضي لكافة الأصناف المسجلة في مصنع (<strong>{factory.name}</strong>). عندما ينخفض رصيد أي صنف عن هذه القيمة سيظهر تنبيه باللون الأصفر.
              </p>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  الحد الأدنى الموحد للتنبيه (عدد الوحدات):
                </label>
                <input
                  type="number"
                  min={1}
                  value={globalThresholdValue}
                  onChange={(e) => setGlobalThresholdValue(Number(e.target.value))}
                  className="w-full p-2.5 border border-amber-300 dark:border-amber-700 rounded-xl bg-slate-50 dark:bg-slate-800 font-mono font-black text-base text-amber-600"
                />
              </div>

              <div className="grid grid-cols-4 gap-2">
                {[20, 50, 100, 200].map((val) => (
                  <button
                    key={val}
                    type="button"
                    onClick={() => setGlobalThresholdValue(val)}
                    className={`py-1.5 px-2 rounded-xl border text-xs font-bold font-mono transition-colors cursor-pointer ${
                      globalThresholdValue === val
                        ? "bg-amber-500 text-slate-950 border-amber-500 font-black"
                        : "bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700"
                    }`}
                  >
                    {val} وحدة
                  </button>
                ))}
              </div>

              <div className="flex items-center gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={handleApplyGlobalThreshold}
                  className="flex-1 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-black text-xs shadow-md transition-all cursor-pointer"
                >
                  تطبيق الحد على كافة الأصناف ({factoryProducts.length}) ✓
                </button>
                <button
                  type="button"
                  onClick={() => setShowThresholdConfigModal(false)}
                  className="py-2.5 px-4 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold text-xs cursor-pointer"
                >
                  إلغاء
                </button>
              </div>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};
