import React, { useState } from "react";
import {
  MerchantItem,
  MerchantWarehouse,
  Product,
  Factory,
} from "../../types";
import { storeService } from "../../services/storeService";
import {
  Package,
  Plus,
  Edit2,
  Trash2,
  DollarSign,
  TrendingUp,
  Building2,
  AlertCircle,
  Search,
  Filter,
  CheckCircle2,
  X,
  Layers,
  Link2,
  Upload,
} from "lucide-react";

interface Props {
  items: MerchantItem[];
  warehouses: MerchantWarehouse[];
  catalogProducts: Product[];
  factories: Factory[];
}

export const MerchantItemsManager: React.FC<Props> = ({
  items,
  warehouses,
  catalogProducts,
  factories,
}) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("ALL");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<MerchantItem | null>(null);

  // Modal Form States
  const [itemName, setItemName] = useState("");
  const [category, setCategory] = useState("مواد غذائية");
  const [sku, setSku] = useState("");
  const [barcode, setBarcode] = useState("");
  const [unit, setUnit] = useState("كرتونة");
  const [costPrice, setCostPrice] = useState<number>(50);
  const [sellingPrice, setSellingPrice] = useState<number>(75);
  const [minStockAlert, setMinStockAlert] = useState<number>(20);
  const [itemImage, setItemImage] = useState("");
  const [warehouseStock, setWarehouseStock] = useState<Record<string, number>>(
    {}
  );
  const [selectedCatalogProductId, setSelectedCatalogProductId] =
    useState("");

  const presetImages = [
    { label: "مواد غذائية", url: "https://images.unsplash.com/photo-1586201375761-83865001e31c?w=500&auto=format&fit=crop&q=60" },
    { label: "ألبان وأجبان", url: "https://images.unsplash.com/photo-1628088062854-d1870b4553da?w=500&auto=format&fit=crop&q=60" },
    { label: "عصائر ومشروبات", url: "https://images.unsplash.com/photo-1527661591475-527312dd65f5?w=500&auto=format&fit=crop&q=60" },
    { label: "منظفات ومعقمات", url: "https://images.unsplash.com/photo-1583947215259-38e31be8751f?w=500&auto=format&fit=crop&q=60" },
    { label: "بلاستيك وتغليف", url: "https://images.unsplash.com/photo-1610557892470-55d9e80c0bce?w=500&auto=format&fit=crop&q=60" },
    { label: "منتجات ورقية", url: "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=500&auto=format&fit=crop&q=60" },
  ];

  const categories = Array.from(
    new Set(["مواد غذائية", "بلاستيكيات ومستلزمات", "منظفات", "مشروبات ومياه", ...items.map((i) => i.category)])
  );

  const openAddModal = () => {
    setEditingItem(null);
    setItemName("");
    setCategory("مواد غذائية");
    setSku(`SKU-${Math.floor(1000 + Math.random() * 9000)}`);
    setBarcode(`628${Math.floor(10000000 + Math.random() * 90000000)}`);
    setUnit("كرتونة");
    setCostPrice(50);
    setSellingPrice(70);
    setMinStockAlert(20);
    setItemImage(presetImages[0].url);

    const initialStock: Record<string, number> = {};
    warehouses.forEach((w) => {
      initialStock[w.id] = 50;
    });
    setWarehouseStock(initialStock);
    setSelectedCatalogProductId("");
    setIsModalOpen(true);
  };

  const openEditModal = (item: MerchantItem) => {
    setEditingItem(item);
    setItemName(item.name);
    setCategory(item.category);
    setSku(item.sku);
    setBarcode(item.barcode);
    setUnit(item.unit);
    setCostPrice(item.costPrice);
    setSellingPrice(item.sellingPrice);
    setMinStockAlert(item.minStockAlert);
    setItemImage(item.image || presetImages[0].url);
    setWarehouseStock(item.warehouseStock || {});
    setSelectedCatalogProductId(item.productId || "");
    setIsModalOpen(true);
  };

  const handleLinkCatalogProduct = (prodId: string) => {
    setSelectedCatalogProductId(prodId);
    if (!prodId) return;

    const prod = catalogProducts.find((p) => p.id === prodId);
    if (prod) {
      setItemName(prod.name);
      setCostPrice(prod.price);
      setSellingPrice(Math.round(prod.price * 1.25)); // default 25% profit margin preview
      setUnit(prod.unit);
      setSku(prod.sku || `SKU-${prod.id}`);
      setBarcode(prod.barcode || "628000000000");
      if (prod.image) {
        setItemImage(prod.image);
      }
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!itemName.trim()) {
      alert("الرجاء إدخال اسم الصنف");
      return;
    }

    const matchedCatalogProd = catalogProducts.find(
      (p) => p.id === selectedCatalogProductId
    );

    const totalStock = Object.values(warehouseStock).reduce(
      (a: number, b: number) => a + (Number(b) || 0),
      0
    );

    if (editingItem) {
      storeService.updateMerchantItem(editingItem.id, {
        name: itemName.trim(),
        category,
        sku,
        barcode,
        unit,
        costPrice: Number(costPrice) || 0,
        sellingPrice: Number(sellingPrice) || 0,
        minStockAlert: Number(minStockAlert) || 0,
        warehouseStock,
        totalStock: Number(totalStock) || 0,
        productId: selectedCatalogProductId || undefined,
        factoryId: matchedCatalogProd?.factoryId || editingItem.factoryId,
        factoryName:
          matchedCatalogProd?.factoryName || editingItem.factoryName,
        image:
          itemImage ||
          matchedCatalogProd?.image ||
          editingItem.image ||
          presetImages[0].url,
      });
    } else {
      storeService.addMerchantItem({
        name: itemName.trim(),
        category,
        sku: sku || `SKU-${Date.now()}`,
        barcode: barcode || "628000000000",
        unit,
        costPrice: Number(costPrice) || 0,
        sellingPrice: Number(sellingPrice) || 0,
        minStockAlert: Number(minStockAlert) || 0,
        warehouseStock,
        totalStock: Number(totalStock) || 0,
        productId: selectedCatalogProductId || undefined,
        factoryId: matchedCatalogProd?.factoryId,
        factoryName: matchedCatalogProd?.factoryName,
        image:
          itemImage ||
          matchedCatalogProd?.image ||
          presetImages[0].url,
      });
    }

    setIsModalOpen(false);
  };

  const handleDelete = (id: string, name: string) => {
    if (confirm(`هل أنت تأكد من رغبتك في حذف الصنف "${name}" من سجلات المخزون؟`)) {
      storeService.deleteMerchantItem(id);
    }
  };

  const filteredItems = items.filter((item) => {
    const query = searchQuery.trim().toLowerCase();
    const matchesQuery =
      !query ||
      item.name.toLowerCase().includes(query) ||
      item.sku.toLowerCase().includes(query) ||
      item.category.toLowerCase().includes(query);

    const matchesCat =
      selectedCategory === "ALL" || item.category === selectedCategory;

    return matchesQuery && matchesCat;
  });

  return (
    <div className="space-y-6">
      {/* Top Header & Quick Action */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-4 rounded-3xl border border-slate-200/90 dark:border-slate-800 shadow-sm">
        <div className="flex items-center gap-3.5">
          <div className="relative w-12 h-12 rounded-2xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-purple-500 text-white flex items-center justify-center font-black shadow-lg shadow-indigo-500/25 ring-2 ring-indigo-500/20 dark:ring-indigo-400/30 overflow-hidden shrink-0 group transition-all duration-300 hover:scale-105">
            <div className="absolute -top-2 -right-2 w-6 h-6 bg-white/25 rounded-full blur-xs pointer-events-none" />
            <Package className="w-6 h-6 text-white drop-shadow-xs transition-transform duration-300 group-hover:scale-110" strokeWidth={2.3} />
            <div className="absolute inset-0 bg-white/10 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
          </div>
          <div>
            <h2 className="text-base font-black text-slate-900 dark:text-white">
              إضافة وتسعير الأصناف وربطها بالمخازن
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              إدارة كتالوج أصناف المحل، أسعار التكلفة والبيع، وحدود تنبيه النواقص
            </p>
          </div>
        </div>

        <button
          onClick={openAddModal}
          className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-black text-xs shadow-md shadow-indigo-600/25 transition-all flex items-center gap-2 cursor-pointer active:scale-95"
        >
          <Plus className="w-4 h-4" />
          <span>إضافة صنف جديد للكتالوج 📦</span>
        </button>
      </div>

      {/* Filter & Search Controls */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-3 bg-white dark:bg-slate-900 p-3.5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
        <div className="relative flex-1 w-full">
          <Search className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="ابحث باسم الصنف، الرمز (SKU)، أو التصنيف..."
            className="w-full pr-10 pl-4 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 text-xs text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:outline-none"
          />
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto">
          <Filter className="w-4 h-4 text-slate-400" />
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 text-xs font-bold text-slate-700 dark:text-slate-200"
          >
            <option value="ALL">جميع التصنيفات ({items.length})</option>
            {categories.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Items Cards / Table */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredItems.length === 0 ? (
          <div className="col-span-3 p-12 text-center bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 text-slate-500 space-y-2">
            <Package className="w-10 h-10 text-slate-300 mx-auto" />
            <p className="text-xs font-bold">لا توجد أصناف تطابق فلاتر البحث</p>
          </div>
        ) : (
          filteredItems.map((item) => {
            const margin = item.sellingPrice - item.costPrice;
            const marginPercent =
              item.costPrice > 0
                ? ((margin / item.costPrice) * 100).toFixed(1)
                : "0";
            const isLowStock = item.totalStock <= item.minStockAlert;

            return (
              <div
                key={item.id}
                className={`p-4 rounded-2xl bg-white dark:bg-slate-900 border ${
                  isLowStock
                    ? "border-amber-300 dark:border-amber-800/80 bg-amber-50/20 dark:bg-amber-950/10"
                    : "border-slate-200 dark:border-slate-800"
                } shadow-xs space-y-3 flex flex-col justify-between overflow-hidden`}
              >
                <div>
                  {/* Product Thumbnail Banner */}
                  <div className="relative h-32 -mx-4 -mt-4 mb-3 bg-slate-100 dark:bg-slate-800 overflow-hidden border-b border-slate-100 dark:border-slate-800 group">
                    <img
                      src={item.image || presetImages[0].url}
                      alt={item.name}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = presetImages[0].url;
                      }}
                    />
                    <div className="absolute top-2.5 right-2.5 flex items-center gap-1.5">
                      <span className="px-2.5 py-1 rounded-xl bg-slate-900/80 backdrop-blur-xs text-white text-[10px] font-extrabold shadow-xs">
                        {item.category}
                      </span>
                    </div>

                    <div className="absolute top-2.5 left-2.5 flex items-center gap-1 bg-white/90 dark:bg-slate-900/90 backdrop-blur-xs p-1 rounded-xl shadow-xs">
                      <button
                        onClick={() => openEditModal(item)}
                        className="p-1 text-slate-700 hover:text-indigo-600 dark:text-slate-200 rounded-lg transition-colors"
                        title="تعديل الصنف والتسعير"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDelete(item.id, item.name)}
                        className="p-1 text-slate-400 hover:text-rose-500 rounded-lg transition-colors"
                        title="حذف الصنف"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h3 className="text-xs font-bold text-slate-900 dark:text-white">
                        {item.name}
                      </h3>
                      <span className="text-[10px] text-slate-400 font-mono block">
                        SKU: {item.sku} | الوحدة: {item.unit}
                      </span>
                    </div>
                  </div>

                  {/* Pricing Overview */}
                  <div className="mt-3 grid grid-cols-3 gap-2 bg-slate-50 dark:bg-slate-800/60 p-2.5 rounded-xl text-center text-xs border border-slate-100 dark:border-slate-800">
                    <div>
                      <span className="text-[10px] text-slate-400 block">
                        التكلفة
                      </span>
                      <strong className="text-slate-800 dark:text-slate-200">
                        {item.costPrice} ر.ي
                      </strong>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 block">
                        سعر البيع
                      </span>
                      <strong className="text-emerald-600 dark:text-emerald-400">
                        {item.sellingPrice} ر.ي
                      </strong>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 block">
                        الربح (%)
                      </span>
                      <strong className="text-indigo-600 dark:text-indigo-400">
                        +{marginPercent}%
                      </strong>
                    </div>
                  </div>

                  {/* Stock Distribution per Warehouse */}
                  <div className="mt-3 space-y-1.5 text-[11px]">
                    <div className="flex items-center justify-between text-slate-500 font-bold">
                      <span>توزيع المخزون بالمخازن:</span>
                      <span
                        className={
                          isLowStock
                            ? "text-amber-600 font-extrabold flex items-center gap-1"
                            : "text-slate-900 dark:text-white"
                        }
                      >
                        إجمالي: {item.totalStock} {item.unit}
                        {isLowStock && (
                          <span className="text-[10px] text-amber-600 font-bold">
                            (نقص ⚠️)
                          </span>
                        )}
                      </span>
                    </div>

                    <div className="space-y-1">
                      {warehouses.map((wh) => {
                        const qtyInWh = item.warehouseStock?.[wh.id] || 0;
                        return (
                          <div
                            key={wh.id}
                            className="flex items-center justify-between px-2 py-1 rounded-lg bg-slate-100/70 dark:bg-slate-800/80 text-[10px]"
                          >
                            <span className="text-slate-600 dark:text-slate-400 truncate">
                              {wh.name}
                            </span>
                            <span className="font-bold text-slate-900 dark:text-white">
                              {qtyInWh}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>

                {item.factoryName && (
                  <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[10px] text-slate-400">
                    <span className="flex items-center gap-1 truncate">
                      <Link2 className="w-3 h-3 text-indigo-500" />
                      مرتبط بمصنع: {item.factoryName}
                    </span>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Add / Edit Item Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 max-w-xl w-full p-6 space-y-5 shadow-2xl relative max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute left-4 top-4 p-2 rounded-xl text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 border-b border-slate-200 dark:border-slate-800 pb-3">
              <div className="p-2.5 rounded-2xl bg-indigo-500/10 text-indigo-600 font-bold">
                <Package className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  {editingItem ? "تعديل الصنف والتسعير" : "إضافة صنف جديد لكتالوج المحل"}
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  تحديد أسعار التكلفة والبيع وتوزيع المخزون الأولي على المستودعات
                </p>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 text-xs font-bold">
              {/* Optional Catalog product link */}
              <div className="p-3 bg-indigo-50/70 dark:bg-indigo-950/40 rounded-2xl border border-indigo-200 dark:border-indigo-800 space-y-1.5">
                <label className="block text-indigo-900 dark:text-indigo-200">
                  استيراد بيانات المنتج تلقائياً من كتالوج المصانع الموردة (اختياري):
                </label>
                <select
                  value={selectedCatalogProductId}
                  onChange={(e) => handleLinkCatalogProduct(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-indigo-200 dark:border-indigo-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
                >
                  <option value="">-- صنف مخصص / بدون ربط تلقائي --</option>
                  {catalogProducts.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name} ({p.factoryName} - {p.price} ر.ي)
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="col-span-2">
                  <label className="block text-slate-700 dark:text-slate-300 mb-1">
                    اسم الصنف *
                  </label>
                  <input
                    type="text"
                    required
                    value={itemName}
                    onChange={(e) => setItemName(e.target.value)}
                    placeholder="مثال: أرز بنجابي أبيض 10 كجم"
                    className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 dark:text-slate-300 mb-1">
                    التصنيف
                  </label>
                  <input
                    type="text"
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    placeholder="مثال: مواد غذائية"
                    className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 dark:text-slate-300 mb-1">
                    وحدة القياس/التعبئة
                  </label>
                  <input
                    type="text"
                    value={unit}
                    onChange={(e) => setUnit(e.target.value)}
                    placeholder="مثال: كرتونة (24 حبة)"
                    className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 dark:text-slate-300 mb-1">
                    الرمز التشفيري (SKU)
                  </label>
                  <input
                    type="text"
                    value={sku}
                    onChange={(e) => setSku(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-mono"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 dark:text-slate-300 mb-1">
                    البار كود (Barcode)
                  </label>
                  <input
                    type="text"
                    value={barcode}
                    onChange={(e) => setBarcode(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-mono"
                  />
                </div>
              </div>

              {/* Product Image Section */}
              <div className="p-3.5 bg-indigo-50/50 dark:bg-slate-800/80 rounded-2xl border border-indigo-100 dark:border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <label className="block font-bold text-slate-800 dark:text-slate-200">
                    صورة المنتج (رفع صورة محلياً من الجهاز أو رابط):
                  </label>
                  {itemImage && (
                    <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" /> تم تحديد الصورة
                    </span>
                  )}
                </div>

                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                  {/* Image Preview Box */}
                  <div className="w-20 h-20 rounded-2xl bg-slate-200 dark:bg-slate-700 overflow-hidden shrink-0 border border-slate-300 dark:border-slate-600 shadow-xs relative group mx-auto sm:mx-0">
                    {itemImage ? (
                      <img
                        src={itemImage}
                        alt="معاينة الصنف"
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src =
                            "https://images.unsplash.com/photo-1586201375761-83865001e31c?w=300&auto=format&fit=crop&q=60";
                        }}
                      />
                    ) : (
                      <div className="w-full h-full flex flex-col items-center justify-center text-slate-400 p-2 text-center text-[10px]">
                        <Package className="w-6 h-6 mb-1 text-slate-400" />
                        <span>بدون صورة</span>
                      </div>
                    )}
                  </div>

                  <div className="flex-1 space-y-2">
                    {/* Primary Option: Upload Local File */}
                    <div className="flex items-center gap-2">
                      <label className="flex-1 cursor-pointer py-2.5 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs transition-colors flex items-center justify-center gap-2 shadow-xs">
                        <Upload className="w-4 h-4" />
                        <span>اختر صورة من جهازك (ملف محلي)</span>
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) {
                              const reader = new FileReader();
                              reader.onloadend = () => {
                                if (typeof reader.result === "string") {
                                  setItemImage(reader.result);
                                }
                              };
                              reader.readAsDataURL(file);
                            }
                          }}
                        />
                      </label>

                      {itemImage && (
                        <button
                          type="button"
                          onClick={() => setItemImage("")}
                          className="p-2.5 rounded-xl bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-900 font-bold text-xs hover:bg-rose-100 transition-colors"
                          title="حذف الصورة"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      )}
                    </div>

                    {/* Secondary Option: Image URL */}
                    <input
                      type="url"
                      value={itemImage}
                      onChange={(e) => setItemImage(e.target.value)}
                      placeholder="أو ضع رابط صورة إن وُجد (https://...)"
                      className="w-full p-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-[11px] font-mono"
                    />
                  </div>
                </div>

                {/* Preset Options */}
                <div>
                  <span className="text-[11px] text-slate-500 block mb-1.5 font-bold">
                    أو اختر صورة توضيحية سريعة من النماذج الجاهزة:
                  </span>
                  <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                    {presetImages.map((p, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => setItemImage(p.url)}
                        className={`p-1 rounded-xl border text-[10px] font-bold flex flex-col items-center gap-1 transition-all ${
                          itemImage === p.url
                            ? "border-indigo-600 bg-indigo-100/60 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 ring-2 ring-indigo-500/30"
                            : "border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:border-slate-400"
                        }`}
                      >
                        <img
                          src={p.url}
                          alt={p.label}
                          referrerPolicy="no-referrer"
                          className="w-full h-8 object-cover rounded-lg"
                        />
                        <span className="truncate w-full text-center">{p.label}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Pricing Section */}
              <div className="p-3.5 bg-slate-50 dark:bg-slate-800/80 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-3">
                <h4 className="text-slate-900 dark:text-white font-bold flex items-center gap-1.5">
                  <DollarSign className="w-4 h-4 text-emerald-600" />
                  أسعار التكلفة والبيع للزبون
                </h4>

                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <label className="block text-[11px] text-slate-500 mb-1">
                      سعر التكلفة بالشراء (ر.ي)
                    </label>
                    <input
                      type="number"
                      min="0"
                      step="0.5"
                      value={costPrice}
                      onChange={(e) => setCostPrice(parseFloat(e.target.value) || 0)}
                      className="w-full p-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 font-bold text-slate-900 dark:text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] text-slate-500 mb-1">
                      سعر البيع للزبون (ر.ي)
                    </label>
                    <input
                      type="number"
                      min="0"
                      step="0.5"
                      value={sellingPrice}
                      onChange={(e) => setSellingPrice(parseFloat(e.target.value) || 0)}
                      className="w-full p-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 font-bold text-emerald-600 dark:text-emerald-400"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] text-slate-500 mb-1">
                      حد تنبيه النقص (أقل كمية)
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={minStockAlert}
                      onChange={(e) => setMinStockAlert(parseInt(e.target.value) || 0)}
                      className="w-full p-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 font-bold text-amber-600 dark:text-amber-400"
                    />
                  </div>
                </div>
              </div>

              {/* Warehouse Stock Allocation */}
              <div className="space-y-2">
                <label className="block text-slate-700 dark:text-slate-300">
                  ربط وتوزيع الكميات المتاحة بكل مستودع:
                </label>

                <div className="space-y-2">
                  {warehouses.map((wh) => (
                    <div
                      key={wh.id}
                      className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800"
                    >
                      <span className="text-slate-700 dark:text-slate-300">
                        {wh.name}
                      </span>
                      <div className="flex items-center gap-1.5 w-32">
                        <input
                          type="number"
                          min="0"
                          value={warehouseStock[wh.id] ?? 0}
                          onChange={(e) =>
                            setWarehouseStock({
                              ...warehouseStock,
                              [wh.id]: Math.max(0, parseInt(e.target.value) || 0),
                            })
                          }
                          className="w-full p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-center font-bold text-slate-900 dark:text-white"
                        />
                        <span className="text-[10px] text-slate-400">وحدة</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex items-center gap-3 pt-3 border-t border-slate-200 dark:border-slate-800">
                <button
                  type="submit"
                  className="flex-1 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-md transition-colors flex items-center justify-center gap-2"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>حفظ بيانات الصنف والتسعير</span>
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
    </div>
  );
};
