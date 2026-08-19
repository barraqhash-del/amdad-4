import React, { useState } from "react";
import { Product, Factory } from "../../types";
import { storeService } from "../../services/storeService";
import {
  Search,
  Filter,
  Building2,
  CheckCircle2,
  Plus,
  Minus,
  ShoppingBag,
  Sparkles,
  Layers,
  Heart,
  BookOpen,
  X,
  PackageX,
  Zap,
} from "lucide-react";

interface Props {
  products: Product[];
  factories: Factory[];
  onOpenCart: () => void;
  onOpenDirectory?: () => void;
}

export const ProductCatalog: React.FC<Props> = ({
  products,
  factories,
  onOpenCart,
  onOpenDirectory,
}) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("ALL");
  const [selectedFactoryId, setSelectedFactoryId] = useState<string>("ALL");
  const [showOnlyFavorites, setShowOnlyFavorites] = useState(false);
  const [quantities, setQuantities] = useState<Record<string, number>>({});

  const handleOrderAllShortagesBulk = () => {
    const merchantItems = storeService.getMerchantItems();
    const shortageItems = merchantItems.filter(
      (it) => it.totalStock <= it.minStockAlert
    );

    if (shortageItems.length === 0) {
      alert("لا توجد أصناف بالنواقص حالياً! جميع المخزونات في مستويات آمنة 🎉");
      return;
    }

    let addedCount = 0;
    shortageItems.forEach((item) => {
      let catalogMatch = products.find((p) => p.id === item.productId);
      if (!catalogMatch && item.factoryId) {
        catalogMatch = products.find((p) => p.factoryId === item.factoryId);
      }
      if (!catalogMatch) {
        catalogMatch = products[0];
      }
      if (catalogMatch) {
        const reorderQty = Math.max(
          item.minStockAlert * 2 - item.totalStock,
          item.minStockAlert
        );
        storeService.addToCart(catalogMatch, reorderQty);
        addedCount++;
      }
    });

    alert(
      `تمت إضافة ${addedCount} صنف من النواقص مباشرة إلى سلة المشتريات من جميع المصانع بنقرة واحدة! ⚡🛒`
    );
    onOpenCart();
  };

  const favoriteFactoryIds = storeService.getFavoriteFactoryIds();
  const categories = Array.from(new Set(products.map((p) => p.category)));

  const filteredProducts = products.filter((p) => {
    const query = searchQuery.trim().toLowerCase();
    const matchesSearch =
      !query ||
      p.name.toLowerCase().includes(query) ||
      p.description.toLowerCase().includes(query) ||
      p.category.toLowerCase().includes(query) ||
      p.factoryName.toLowerCase().includes(query) ||
      (p.sku && p.sku.toLowerCase().includes(query));

    const matchesCategory =
      selectedCategory === "ALL" || p.category === selectedCategory;
    const matchesFactory =
      selectedFactoryId === "ALL" || p.factoryId === selectedFactoryId;
    const matchesFavorites =
      !showOnlyFavorites || favoriteFactoryIds.includes(p.factoryId);

    return matchesSearch && matchesCategory && matchesFactory && matchesFavorites;
  });

  const getQty = (id: string) => quantities[id] || 1;

  const setQty = (id: string, val: number) => {
    setQuantities((prev) => ({ ...prev, [id]: Math.max(1, isNaN(val) ? 1 : val) }));
  };

  const handleAddToCart = (product: Product) => {
    const qty = getQty(product.id);
    storeService.addToCart(product, qty);
  };

  return (
    <div className="space-y-6 dir-rtl">
      
      {/* Banner & Hero Header */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-emerald-900 via-teal-900 to-slate-900 text-white p-6 sm:p-8 shadow-xl">
        <div className="relative z-10 max-w-2xl space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-400/30 text-emerald-300 text-xs font-bold">
            <Sparkles className="w-3.5 h-3.5" />
            <span>وجهة واحدة لجميع طلبيات النواقص بالجملة</span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight leading-tight">
            اطلب نواقص متجرك من كافة المصانع في سلة موحدة
          </h1>

          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
            تصفح منتجات المصانع المسجلة لدينا، وأضف المواد المطلوب استكمالها في محلك. عند تأكيد الطلب، سيقوم النظام بتوزيع وتقسيم الطلبيات آلياً على المصانع المعنية.
          </p>

          <div className="flex flex-wrap items-center gap-3 pt-2">
            <button
              onClick={handleOrderAllShortagesBulk}
              className="px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-black text-xs sm:text-sm shadow-lg transition-all flex items-center gap-2"
            >
              <Zap className="w-4 h-4 fill-slate-950" />
              <span>طلب جميع النواقص من جميع المصانع (بنقرة واحدة) ⚡</span>
            </button>

            <button
              onClick={onOpenDirectory}
              className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs sm:text-sm shadow-md transition-all flex items-center gap-2"
            >
              <BookOpen className="w-4 h-4" />
              <span>دليل المصانع والموردين</span>
            </button>

            <button
              onClick={onOpenCart}
              className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white border border-white/20 font-bold text-xs sm:text-sm transition-all flex items-center gap-2 backdrop-blur-xs"
            >
              <ShoppingBag className="w-4 h-4" />
              <span>استعراض السلة الموحدة</span>
            </button>
          </div>
        </div>

        {/* Decorative elements */}
        <div className="absolute -bottom-10 -left-10 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl" />
        <div className="absolute top-0 right-1/3 w-48 h-48 bg-teal-500/10 rounded-full blur-2xl" />
      </div>

      {/* Filters & Search */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
        
        {/* Search Bar */}
        <div className="relative flex-1">
          <Search className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="ابحث باسم المنتج، تصنيف المنتج، أو اسم المصنع المنتج..."
            className="w-full pr-10 pl-9 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 text-xs text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:outline-none font-medium placeholder:text-slate-400"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1 rounded-lg"
              title="مسح البحث"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Factory Filter & Favorites Pill */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 md:pb-0">
          
          <button
            onClick={() => setShowOnlyFavorites(!showOnlyFavorites)}
            className={`px-3 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 whitespace-nowrap ${
              showOnlyFavorites
                ? "bg-rose-600 text-white shadow-xs"
                : "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200"
            }`}
            title="تصفية المنتجات حسب المصانع والموردين المفضّلين"
          >
            <Heart
              className={`w-3.5 h-3.5 ${
                showOnlyFavorites ? "fill-white" : "text-rose-500"
              }`}
            />
            <span>الموردون المفضّلون ({favoriteFactoryIds.length})</span>
          </button>

          <select
            value={selectedFactoryId}
            onChange={(e) => setSelectedFactoryId(e.target.value)}
            className="px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-300 focus:outline-none"
          >
            <option value="ALL">جميع المصانع ({factories.length})</option>
            {factories.map((fac) => (
              <option key={fac.id} value={fac.id}>
                {fac.name} {favoriteFactoryIds.includes(fac.id) ? "★" : ""}
              </option>
            ))}
          </select>

          {/* Category Pills */}
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setSelectedCategory("ALL")}
              className={`px-3 py-2 rounded-xl text-xs font-bold transition-colors whitespace-nowrap ${
                selectedCategory === "ALL"
                  ? "bg-emerald-600 text-white"
                  : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200"
              }`}
            >
              الكل
            </button>
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-2 rounded-xl text-xs font-bold transition-colors whitespace-nowrap ${
                  selectedCategory === cat
                    ? "bg-emerald-600 text-white"
                    : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Active Search & Filter info bar if search query active */}
      {searchQuery.trim() !== "" && (
        <div className="flex items-center justify-between text-xs px-2 text-slate-600 dark:text-slate-400 font-medium">
          <span>
            نتائج البحث عن: <strong className="text-emerald-600 dark:text-emerald-400">"{searchQuery}"</strong> ({filteredProducts.length} منتج)
          </span>
          <button
            onClick={() => setSearchQuery("")}
            className="text-xs text-rose-500 hover:underline flex items-center gap-1 font-bold"
          >
            <X className="w-3.5 h-3.5" />
            إلغاء تصفية البحث
          </button>
        </div>
      )}

      {/* Empty State when no products match */}
      {filteredProducts.length === 0 ? (
        <div className="p-12 text-center bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 space-y-4">
          <PackageX className="w-12 h-12 text-slate-300 dark:text-slate-700 mx-auto" />
          <div className="space-y-1">
            <h3 className="font-bold text-sm text-slate-800 dark:text-slate-200">
              لم يتم العثور على منتجات تطابق البحث
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 max-w-md mx-auto">
              جرب تغيير كلمة البحث أو إعادة تعيين تصفية المصنع والتصنيفات للوصول إلى المنتجات المتاحة.
            </p>
          </div>
          <button
            onClick={() => {
              setSearchQuery("");
              setSelectedCategory("ALL");
              setSelectedFactoryId("ALL");
              setShowOnlyFavorites(false);
            }}
            className="px-4 py-2 rounded-xl bg-slate-900 text-white dark:bg-slate-800 font-bold text-xs hover:bg-slate-800 transition-colors inline-flex items-center gap-1.5"
          >
            <span>إعادة تعيين كافة الفلاتر والبحث</span>
          </button>
        </div>
      ) : (
        /* Product Cards Grid */
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {filteredProducts.map((product) => {
            const qty = getQty(product.id);
            const isFavFactory = favoriteFactoryIds.includes(product.factoryId);

            return (
              <div
                key={product.id}
                className="flex flex-col rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 overflow-hidden shadow-xs hover:shadow-md transition-shadow group"
              >
              {/* Product Image & Factory Badge */}
              <div className="relative h-44 w-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                <img
                  src={product.image}
                  alt={product.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                
                {/* Factory Name Tag */}
                <div className="absolute top-3 right-3 bg-slate-900/85 backdrop-blur-xs text-white px-2.5 py-1 rounded-lg text-[11px] font-bold flex items-center gap-1 shadow-sm max-w-[85%] truncate">
                  <Building2 className="w-3 h-3 text-emerald-400 shrink-0" />
                  <span className="truncate">{product.factoryName}</span>
                </div>

                {/* Favorite Factory Heart Tag */}
                <button
                  onClick={() => storeService.toggleFavoriteFactory(product.factoryId)}
                  className={`absolute top-3 left-3 p-1.5 rounded-lg backdrop-blur-xs transition-colors ${
                    isFavFactory
                      ? "bg-rose-600 text-white"
                      : "bg-slate-900/60 text-white/70 hover:text-white"
                  }`}
                  title={isFavFactory ? "مصنع مفضل" : "إضافة المصنع للمفضلة"}
                >
                  <Heart className={`w-3.5 h-3.5 ${isFavFactory ? "fill-white" : ""}`} />
                </button>

                {/* Stock Tag */}
                <div className="absolute bottom-3 left-3 bg-white/90 dark:bg-slate-900/90 backdrop-blur-xs text-slate-700 dark:text-slate-300 px-2 py-0.5 rounded-md text-[10px] font-mono">
                  متوفر: {product.stock} {product.unit}
                </div>
              </div>

              {/* Product Details */}
              <div className="flex-1 p-4 flex flex-col justify-between space-y-3">
                <div className="space-y-1">
                  <div className="flex items-center justify-between text-[11px] text-slate-400">
                    <span>{product.category}</span>
                    <span className="font-mono">رمز: {product.sku}</span>
                  </div>
                  <h3 className="font-bold text-sm text-slate-900 dark:text-white leading-snug line-clamp-2">
                    {product.name}
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed">
                    {product.description}
                  </p>
                </div>

                {/* Price & Add to Cart Controls */}
                <div className="pt-2 border-t border-slate-100 dark:border-slate-800 space-y-3">
                  <div className="flex items-baseline justify-between">
                    <div>
                      <span className="text-lg font-extrabold text-emerald-700 dark:text-emerald-400">
                        {product.price}
                      </span>
                      <span className="text-xs font-bold text-slate-600 dark:text-slate-400 mr-1">
                        ر.ي
                      </span>
                    </div>
                    <span className="text-[11px] text-slate-400">
                      لكل {product.unit}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    {/* Quantity Selector */}
                    <div className="flex items-center bg-slate-100 dark:bg-slate-800 p-1 rounded-xl border border-slate-200 dark:border-slate-700">
                      <button
                        type="button"
                        onClick={() => setQty(product.id, Math.max(1, qty - 1))}
                        className="w-7 h-7 flex items-center justify-center hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg text-slate-700 dark:text-slate-300 cursor-pointer transition-colors"
                        title="إنقاص الكمية 1"
                      >
                        <Minus className="w-3.5 h-3.5" />
                      </button>

                      {/* Editable Direct Keyboard Input */}
                      <input
                        type="number"
                        min="1"
                        max="99999"
                        value={qty}
                        onChange={(e) => {
                          const val = parseInt(e.target.value, 10);
                          setQty(product.id, isNaN(val) ? 1 : val);
                        }}
                        onBlur={(e) => {
                          const val = parseInt(e.target.value, 10);
                          if (isNaN(val) || val <= 0) {
                            setQty(product.id, 1);
                          }
                        }}
                        className="w-12 text-center font-black text-xs py-1 px-1 rounded-md bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white focus:ring-1 focus:ring-emerald-500 focus:outline-none"
                        title="اكتب الكمية المطلوبة مباشرة بالكيبورد"
                      />

                      <button
                        type="button"
                        onClick={() => setQty(product.id, qty + 1)}
                        className="w-7 h-7 flex items-center justify-center hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg text-slate-700 dark:text-slate-300 cursor-pointer transition-colors"
                        title="زيادة الكمية 1"
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    {/* Add to Cart Button */}
                    <button
                      onClick={() => handleAddToCart(product)}
                      className="flex-1 py-2 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs transition-colors shadow-xs flex items-center justify-center gap-1.5"
                    >
                      <Plus className="w-4 h-4" />
                      <span>إضافة للسلة</span>
                    </button>
                  </div>
                </div>

              </div>
            </div>
          );
        })}
      </div>
      )}
    </div>
  );
};

