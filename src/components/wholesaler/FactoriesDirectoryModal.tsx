import React, { useState } from "react";
import { Factory, Product } from "../../types";
import { storeService } from "../../services/storeService";
import {
  Building2,
  Star,
  MapPin,
  Clock,
  ShieldCheck,
  Search,
  Heart,
  ChevronLeft,
  X,
  Package,
  Plus,
  Minus,
  ShoppingBag,
  ExternalLink,
  Phone,
  Mail,
  CheckCircle2,
  ArrowRight,
} from "lucide-react";

interface Props {
  isOpen?: boolean;
  onClose?: () => void;
  factories: Factory[];
  products: Product[];
  onSelectFactoryProducts?: (factoryId: string) => void;
  onOpenCart?: () => void;
  isFullPage?: boolean;
}

export const FactoriesDirectoryModal: React.FC<Props> = ({
  isOpen = true,
  onClose,
  factories,
  products,
  onSelectFactoryProducts,
  onOpenCart,
  isFullPage = false,
}) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("ALL");
  const [showOnlyFavorites, setShowOnlyFavorites] = useState(false);
  const [selectedFactoryDetail, setSelectedFactoryDetail] = useState<Factory | null>(
    null
  );
  const [factorySearchQuery, setFactorySearchQuery] = useState("");
  const [quantities, setQuantities] = useState<Record<string, number>>({});

  if (!isFullPage && !isOpen) return null;

  const favoriteIds = storeService.getFavoriteFactoryIds();
  const dynamicCategories = storeService.getCategories();

  const getQty = (id: string) => quantities[id] || 1;
  const setQty = (id: string, val: number) => {
    setQuantities((prev) => ({ ...prev, [id]: Math.max(1, val) }));
  };

  const handleAddToCart = (p: Product) => {
    const qty = getQty(p.id);
    storeService.addToCart(p, qty);
  };

  // If a specific factory is selected, render its dedicated full page view
  if (selectedFactoryDetail) {
    const isFav = favoriteIds.includes(selectedFactoryDetail.id);
    const factoryProducts = products.filter(
      (p) =>
        p.factoryId === selectedFactoryDetail.id &&
        (!factorySearchQuery.trim() ||
          p.name.toLowerCase().includes(factorySearchQuery.toLowerCase()) ||
          p.category.toLowerCase().includes(factorySearchQuery.toLowerCase()))
    );

    return (
      <div className="w-full space-y-6 dir-rtl">
        {/* Top Breadcrumb & Actions Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white dark:bg-slate-900 p-4 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xs">
          <button
            onClick={() => {
              setSelectedFactoryDetail(null);
              setFactorySearchQuery("");
            }}
            className="flex items-center gap-2 text-xs sm:text-sm font-bold text-slate-700 dark:text-slate-200 hover:text-emerald-600 dark:hover:text-emerald-400 bg-slate-100 dark:bg-slate-800/80 px-4 py-2.5 rounded-2xl transition-all w-fit"
          >
            <ArrowRight className="w-4 h-4" />
            <span>العودة إلى دليل المصانع والموردين</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              onClick={() => storeService.toggleFavoriteFactory(selectedFactoryDetail.id)}
              className={`px-4 py-2.5 rounded-2xl text-xs font-bold transition-all flex items-center gap-2 ${
                isFav
                  ? "bg-rose-50 dark:bg-rose-950/80 text-rose-600 border border-rose-200 dark:border-rose-800"
                  : "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:bg-slate-200"
              }`}
            >
              <Heart className={`w-4 h-4 ${isFav ? "fill-rose-600" : ""}`} />
              <span>{isFav ? "مصنع مفضل" : "إضافة للمفضلة"}</span>
            </button>

            {onOpenCart && (
              <button
                onClick={onOpenCart}
                className="px-4 py-2.5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md transition-all flex items-center gap-2"
              >
                <ShoppingBag className="w-4 h-4" />
                <span>عرض السلة الموحدة</span>
              </button>
            )}
          </div>
        </div>

        {/* Factory Dedicated Hero Banner */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white p-6 sm:p-8 shadow-xl border border-slate-800 space-y-6">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div className="flex items-center gap-5">
              <img
                src={selectedFactoryDetail.logo}
                alt={selectedFactoryDetail.name}
                className="w-20 h-20 sm:w-24 sm:h-24 rounded-3xl object-cover border-2 border-indigo-400/30 shadow-2xl shrink-0"
              />
              <div className="space-y-2">
                <div className="flex flex-wrap items-center gap-2">
                  <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
                    {selectedFactoryDetail.name}
                  </h1>
                  {selectedFactoryDetail.verified && (
                    <span className="px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 text-xs font-bold flex items-center gap-1.5">
                      <ShieldCheck className="w-4 h-4 text-emerald-400" />
                      <span>مصنع معتمد برقم سجل</span>
                    </span>
                  )}
                  <span className="px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-400/30 text-xs font-bold">
                    {selectedFactoryDetail.categoryNameAr}
                  </span>
                </div>

                <p className="text-xs sm:text-sm text-slate-300 flex flex-wrap items-center gap-3">
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-indigo-400" />
                    الفرع الرئيسي: {selectedFactoryDetail.city} - {selectedFactoryDetail.district}
                  </span>
                  <span>•</span>
                  <span className="flex items-center gap-1 font-mono">
                    سجل تجاري: {selectedFactoryDetail.commercialReg}
                  </span>
                </p>

                <div className="flex flex-wrap items-center gap-3 text-xs pt-1">
                  <div className="flex items-center gap-1.5 text-amber-400 font-bold bg-amber-400/10 border border-amber-400/20 px-3 py-1 rounded-xl">
                    <Star className="w-4 h-4 fill-amber-400" />
                    <span>{selectedFactoryDetail.rating}</span>
                    <span className="text-slate-300 font-normal">({selectedFactoryDetail.ordersFulfilled} طلبية شحن)</span>
                  </div>

                  <div className="flex items-center gap-1.5 text-indigo-300 bg-indigo-500/10 border border-indigo-400/20 px-3 py-1 rounded-xl">
                    <Clock className="w-4 h-4 text-indigo-400" />
                    <span>تجهيز الشحنة: {selectedFactoryDetail.avgPreparationHours} ساعة</span>
                  </div>

                  <div className="flex items-center gap-1.5 text-emerald-300 bg-emerald-500/10 border border-emerald-400/20 px-3 py-1 rounded-xl">
                    <span>الحد الأدنى للطلب:</span>
                    <strong className="font-bold">{selectedFactoryDetail.minOrderValue} ر.ي</strong>
                  </div>
                </div>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-white/5 border border-white/10 w-full md:w-64 space-y-2">
              <div className="text-[11px] text-slate-400 font-bold">للتواصل والربط المباشر:</div>
              <div className="font-mono font-bold text-sm text-emerald-400 flex items-center gap-2">
                <Phone className="w-4 h-4" />
                <span className="dir-ltr">{selectedFactoryDetail.phone}</span>
              </div>
              <div className="text-[10px] text-slate-400">
                تسليم الطلبيات وتوزيع الفواتير آلياً عبر المنصة
              </div>
            </div>
          </div>
        </div>

        {/* Factory Products Catalog Section */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 pb-4 border-b border-slate-100 dark:border-slate-800">
            <div>
              <h2 className="text-lg font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                <Package className="w-5 h-5 text-emerald-600" />
                <span>كتالوج منتجات {selectedFactoryDetail.name} ({factoryProducts.length} صنف)</span>
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                تصفح الأصناف المتوفرة بالجملة، وحدد الكمية لإضافتها للسلة الموحدة مباشرة
              </p>
            </div>

            {/* Factory Product Search */}
            <div className="relative w-full sm:w-72">
              <Search className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                value={factorySearchQuery}
                onChange={(e) => setFactorySearchQuery(e.target.value)}
                placeholder="ابحث في أصناف المصنع..."
                className="w-full pr-10 pl-4 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 text-xs text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              />
            </div>
          </div>

          {factoryProducts.length === 0 ? (
            <div className="p-12 text-center text-slate-400 space-y-2">
              <Package className="w-10 h-10 mx-auto text-slate-300 dark:text-slate-700" />
              <p className="font-bold text-sm">لا توجد أصناف مطابقة للبحث داخل هذا المصنع.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
              {factoryProducts.map((p) => {
                const qty = getQty(p.id);
                return (
                  <div
                    key={p.id}
                    className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 flex flex-col justify-between space-y-4 hover:border-emerald-500/50 transition-all group"
                  >
                    <div className="space-y-3">
                      <div className="relative h-36 w-full rounded-xl overflow-hidden bg-white dark:bg-slate-900 border">
                        <img
                          src={p.image}
                          alt={p.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                        />
                        <span className="absolute bottom-2 left-2 px-2 py-0.5 rounded-md bg-slate-900/80 backdrop-blur-xs text-[10px] text-white font-mono">
                          متوفر: {p.stock}
                        </span>
                      </div>

                      <div>
                        <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded-md border border-emerald-200/50">
                          {p.category}
                        </span>
                        <h3 className="font-bold text-xs text-slate-900 dark:text-white mt-1.5 line-clamp-1">
                          {p.name}
                        </h3>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                          وحدة التعبئة: {p.unit}
                        </p>
                      </div>

                      <div className="text-emerald-700 dark:text-emerald-400 font-extrabold text-base">
                        {p.price} <span className="text-xs font-bold">ر.ي</span>
                      </div>
                    </div>

                    <div className="space-y-2 pt-2 border-t border-slate-200 dark:border-slate-700">
                      {/* Quantity counter */}
                      <div className="flex items-center justify-between bg-white dark:bg-slate-900 p-1.5 rounded-xl border border-slate-200 dark:border-slate-700">
                        <span className="text-[11px] font-semibold text-slate-500 pr-2">
                          الكمية:
                        </span>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => setQty(p.id, qty - 1)}
                            className="w-6 h-6 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 flex items-center justify-center font-bold hover:bg-slate-200"
                          >
                            <Minus className="w-3 h-3" />
                          </button>
                          <span className="font-mono font-bold text-xs w-6 text-center">
                            {qty}
                          </span>
                          <button
                            onClick={() => setQty(p.id, qty + 1)}
                            className="w-6 h-6 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 flex items-center justify-center font-bold hover:bg-slate-200"
                          >
                            <Plus className="w-3 h-3" />
                          </button>
                        </div>
                      </div>

                      <button
                        onClick={() => handleAddToCart(p)}
                        className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs transition-colors flex items-center justify-center gap-1.5 shadow-xs"
                      >
                        <Plus className="w-4 h-4" />
                        <span>إضافة للسلة الموحدة</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    );
  }

  const filteredFactories = factories.filter((fac) => {
    const matchesSearch =
      fac.name.includes(searchQuery) ||
      fac.city.includes(searchQuery) ||
      fac.categoryNameAr.includes(searchQuery);
    const matchesCategory =
      selectedCategory === "ALL" || fac.category === selectedCategory;
    const matchesFavorite = !showOnlyFavorites || favoriteIds.includes(fac.id);
    return matchesSearch && matchesCategory && matchesFavorite;
  });

  const toggleFavorite = (facId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    storeService.toggleFavoriteFactory(facId);
  };

  const categoryOptions = [
    { id: "ALL", label: "جميع المصانع" },
    ...dynamicCategories.map((c) => ({ id: c.id, label: c.nameAr })),
  ];

  const content = (
    <div
      className={
        isFullPage
          ? "w-full space-y-6 dir-rtl"
          : "relative w-full max-w-5xl rounded-3xl bg-white dark:bg-slate-900 shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden my-6"
      }
    >
      {/* Header */}
      <div className="flex items-center justify-between p-6 bg-gradient-to-r from-emerald-900 via-teal-900 to-slate-900 text-white rounded-3xl shadow-sm">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-emerald-500/20 border border-emerald-400/30 rounded-2xl text-emerald-300">
            <Building2 className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-extrabold tracking-tight">
              دليل المصانع والموردين المعتمدين (B2B Directory)
            </h2>
            <p className="text-xs text-slate-300">
              تصفح مصانع المنتجات الوطنية والغذائية في المملكة وحدد الموردين الدائمين
            </p>
          </div>
        </div>

        {!isFullPage && onClose && (
          <button
            onClick={onClose}
            className="p-2 text-slate-300 hover:text-white rounded-xl hover:bg-white/10 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        )}
      </div>

      {/* Filters and Search Bar */}
      <div className="p-6 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 rounded-3xl space-y-4">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          {/* Search Input */}
          <div className="relative flex-1">
            <Search className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="ابحث باسم المصنع، المدينة، أو نوع النشاط..."
              className="w-full pr-10 pl-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:outline-none font-medium"
            />
          </div>

          {/* Favorites Toggle */}
          <button
            onClick={() => setShowOnlyFavorites(!showOnlyFavorites)}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 ${
              showOnlyFavorites
                ? "bg-rose-600 text-white shadow-md"
                : "bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 hover:bg-slate-100"
            }`}
          >
            <Heart
              className={`w-4 h-4 ${
                showOnlyFavorites ? "fill-white" : "text-rose-500"
              }`}
            />
            <span>الموردون المفضلون (المفضلة) ({favoriteIds.length})</span>
          </button>
        </div>

        {/* Categories Horizontal Filter */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1">
          {categoryOptions.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-colors whitespace-nowrap ${
                selectedCategory === cat.id
                  ? "bg-emerald-600 text-white shadow-xs"
                  : "bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700 hover:bg-slate-100"
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* Directory Grid */}
      <div className={isFullPage ? "p-1" : "p-6 max-h-[60vh] overflow-y-auto"}>
        {filteredFactories.length === 0 ? (
          <div className="p-12 text-center text-slate-400 space-y-3 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800">
            <Building2 className="w-12 h-12 text-slate-300 dark:text-slate-700 mx-auto" />
            <p className="font-bold text-sm">لم يتم العثور على مصانع مطابقة لخيارات البحث.</p>
            <p className="text-xs">جرّب تغيير كلمات البحث أو إزالة فلتر المفضلة.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredFactories.map((fac) => {
              const isFav = favoriteIds.includes(fac.id);
              const factoryProductsCount = products.filter(
                (p) => p.factoryId === fac.id
              ).length;

              return (
                <div
                  key={fac.id}
                  onClick={() => setSelectedFactoryDetail(fac)}
                  className="group relative rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 shadow-xs hover:shadow-md hover:border-emerald-500/50 transition-all cursor-pointer flex flex-col justify-between space-y-4"
                >
                  {/* Top Info */}
                  <div className="space-y-3">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <img
                          src={fac.logo}
                          alt={fac.name}
                          className="w-14 h-14 rounded-2xl object-cover border border-slate-200 dark:border-slate-700 shadow-2xs"
                        />
                        <div>
                          <div className="flex items-center gap-1.5">
                            <h3 className="font-extrabold text-slate-900 dark:text-white text-sm group-hover:text-emerald-600 transition-colors">
                              {fac.name}
                            </h3>
                            {fac.verified && (
                              <ShieldCheck
                                className="w-4 h-4 text-emerald-500 shrink-0"
                                title="مصنع موثق بسجل تجاري رسمي"
                              />
                            )}
                          </div>
                          <span className="text-[11px] font-semibold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded-md border border-emerald-200/60 dark:border-emerald-800/60 inline-block mt-0.5">
                            {fac.categoryNameAr}
                          </span>
                        </div>
                      </div>

                      {/* Star Favorite Button */}
                      <button
                        onClick={(e) => toggleFavorite(fac.id, e)}
                        className={`p-2 rounded-xl transition-all ${
                          isFav
                            ? "bg-rose-50 dark:bg-rose-950 text-rose-600 border border-rose-200"
                            : "bg-slate-100 dark:bg-slate-800 text-slate-400 hover:text-rose-500"
                        }`}
                        title={
                          isFav
                            ? "إزالة من الموردين المفضلين"
                            : "إضافة للموردين المفضلين (المفضلة)"
                        }
                      >
                        <Heart
                          className={`w-4 h-4 ${isFav ? "fill-rose-600" : ""}`}
                        />
                      </button>
                    </div>

                    {/* Details stats */}
                    <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-600 dark:text-slate-400 bg-slate-50 dark:bg-slate-800/60 p-2.5 rounded-xl">
                      <div className="flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span className="truncate">{fac.city} - {fac.district}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span>تجهيز: {fac.avgPreparationHours}س</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400 shrink-0" />
                        <span className="font-bold text-slate-800 dark:text-slate-200">
                          {fac.rating} ({fac.ordersFulfilled} طلبية)
                        </span>
                      </div>
                      <div className="flex items-center gap-1 font-mono text-[10px]">
                        <span>سجل: {fac.commercialReg}</span>
                      </div>
                    </div>
                  </div>

                  {/* Bottom Action */}
                  <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs font-bold text-emerald-700 dark:text-emerald-400">
                    <span>{factoryProductsCount} أصناف جملة متوفرة</span>
                    <span className="flex items-center gap-1 group-hover:translate-x-[-4px] transition-transform">
                      <span>دخول لصفحة المصنع</span>
                      <ChevronLeft className="w-4 h-4" />
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );

  if (isFullPage) {
    return content;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 dir-rtl overflow-y-auto">
      {content}
    </div>
  );
};

