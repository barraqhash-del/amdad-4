import React, { useState, useEffect } from "react";
import confetti from "canvas-confetti";
import { CartItem, WholesalerProfile, MainOrder, SubOrder } from "../../types";
import { storeService } from "../../services/storeService";
import {
  ShoppingBag,
  X,
  Trash2,
  Plus,
  Minus,
  Building2,
  MapPin,
  CreditCard,
  FileText,
  Truck,
  CheckCircle2,
  ArrowRight,
  ShieldAlert,
  AlertTriangle,
  RefreshCw,
  Layers,
  PlusCircle,
  Clock,
  CheckSquare,
  Square,
} from "lucide-react";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  cart: CartItem[];
  wholesaler: WholesalerProfile;
  onOrderSuccess: (mainOrder: MainOrder) => void;
}

export const UnifiedCartModal: React.FC<Props> = ({
  isOpen,
  onClose,
  cart,
  wholesaler: initialWholesaler,
  onOrderSuccess,
}) => {
  const [wholesaler, setWholesaler] = useState<WholesalerProfile>(initialWholesaler);
  const [isEditingAddress, setIsEditingAddress] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<
    "INVOICE_30_DAYS" | "CASH_ON_DELIVERY" | "BANK_TRANSFER"
  >("INVOICE_30_DAYS");
  const [deliveryNotes, setDeliveryNotes] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Selected item IDs for checkout
  const [selectedItemIds, setSelectedItemIds] = useState<Set<string>>(() => {
    return new Set(cart.map((item) => item.product.id));
  });

  // Keep selected items in sync when cart changes
  useEffect(() => {
    setSelectedItemIds((prev) => {
      const next = new Set<string>();
      cart.forEach((item) => {
        if (prev.has(item.product.id)) {
          next.add(item.product.id);
        } else {
          // Default new items to selected
          next.add(item.product.id);
        }
      });
      return next;
    });
  }, [cart]);
  
  // Warning state for existing active orders from same factory
  const [existingActiveOrdersWarning, setExistingActiveOrdersWarning] = useState<
    Record<string, { factoryName: string; activeSubs: SubOrder[]; cartItems: CartItem[] }> | null
  >(null);

  if (!isOpen) return null;

  // Toggle single item selection
  const toggleItemSelection = (productId: string) => {
    setSelectedItemIds((prev) => {
      const next = new Set(prev);
      if (next.has(productId)) {
        next.delete(productId);
      } else {
        next.add(productId);
      }
      return next;
    });
  };

  // Toggle all items in a factory
  const toggleFactoryGroupSelection = (factoryItems: CartItem[]) => {
    const allGroupSelected = factoryItems.every((it) => selectedItemIds.has(it.product.id));
    setSelectedItemIds((prev) => {
      const next = new Set(prev);
      factoryItems.forEach((it) => {
        if (allGroupSelected) {
          next.delete(it.product.id);
        } else {
          next.add(it.product.id);
        }
      });
      return next;
    });
  };

  // Select all items
  const selectAll = () => {
    setSelectedItemIds(new Set(cart.map((item) => item.product.id)));
  };

  // Deselect all items
  const deselectAll = () => {
    setSelectedItemIds(new Set());
  };

  // Group items by Factory
  const factoryGroups: Record<
    string,
    { factoryName: string; items: CartItem[]; subtotal: number; selectedSubtotal: number; selectedCount: number }
  > = {};

  cart.forEach((item) => {
    const fId = item.factoryId || item.product.factoryId || "fac-1";
    const fName = item.factoryName || item.product.factoryName || "مصنع عام";
    if (!factoryGroups[fId]) {
      factoryGroups[fId] = {
        factoryName: fName,
        items: [],
        subtotal: 0,
        selectedSubtotal: 0,
        selectedCount: 0,
      };
    }
    factoryGroups[fId].items.push(item);
    const itemTotal = item.product.price * item.quantity;
    factoryGroups[fId].subtotal += itemTotal;
    if (selectedItemIds.has(item.product.id)) {
      factoryGroups[fId].selectedSubtotal += itemTotal;
      factoryGroups[fId].selectedCount += 1;
    }
  });

  // Calculate totals strictly for SELECTED items
  const selectedCartItems = cart.filter((item) => selectedItemIds.has(item.product.id));
  const selectedSubtotal = selectedCartItems.reduce(
    (sum, item) => sum + item.product.price * item.quantity,
    0
  );
  const vat = selectedSubtotal * 0.15;
  const overallTotal = selectedSubtotal + vat;

  // Selected factories count
  const selectedFactoriesCount = Object.values(factoryGroups).filter(
    (g) => g.selectedCount > 0
  ).length;

  const handleQuantityChange = (productId: string, newQty: number) => {
    if (isNaN(newQty)) return;
    storeService.updateCartQuantity(productId, Math.max(0, newQty));
  };

  const handleRemoveCartItem = (productId: string) => {
    storeService.updateCartQuantity(productId, 0);
  };

  const handleConfirmOrder = (forceNewOrder: boolean = false) => {
    if (selectedCartItems.length === 0) {
      alert("يرجى تحديد صنف واحد على الأقل عبر خانة التحديد (Checkbox) لإتمام الطلب.");
      return;
    }
    setIsSubmitting(true);

    try {
      // 1. Check for active pending orders for same factory if not forced
      if (!forceNewOrder) {
        const activeMap: Record<
          string,
          { factoryName: string; activeSubs: SubOrder[]; cartItems: CartItem[] }
        > = {};

        Object.entries(factoryGroups).forEach(([fId, group]) => {
          const groupSelectedItems = group.items.filter((it) => selectedItemIds.has(it.product.id));
          if (groupSelectedItems.length === 0) return;

          const activeSubs = storeService.getActiveSubOrdersForFactory(
            wholesaler,
            fId
          );
          if (activeSubs.length > 0) {
            activeMap[fId] = {
              factoryName: group.factoryName,
              activeSubs,
              cartItems: groupSelectedItems,
            };
          }
        });

        if (Object.keys(activeMap).length > 0) {
          setExistingActiveOrdersWarning(activeMap);
          setIsSubmitting(false);
          return;
        }
      }

      // 2. Create main order & split automatically into sub-orders for selected items only!
      const mainOrder = storeService.createUnifiedOrder(
        wholesaler,
        paymentMethod,
        deliveryNotes,
        selectedCartItems
      );

      // Trigger Confetti Celebration
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
      });

      onOrderSuccess(mainOrder);
      setExistingActiveOrdersWarning(null);
      onClose();
    } catch (err: any) {
      alert(err.message || "حدث خطأ أثناء تنفيذ الطلب");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleMergeIntoSubOrder = (targetSubOrderId: string, itemsToMerge: CartItem[]) => {
    setIsSubmitting(true);
    try {
      const mergedMainOrder = storeService.mergeCartItemsIntoSubOrder(targetSubOrderId, itemsToMerge);
      
      confetti({
        particleCount: 120,
        spread: 80,
        origin: { y: 0.6 },
      });

      onOrderSuccess(mergedMainOrder);
      setExistingActiveOrdersWarning(null);
      onClose();
    } catch (err: any) {
      alert(err.message || "حدث خطأ أثناء دمج الأصناف مع الطلبية المعلقة.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 dir-rtl overflow-y-auto">
      <div className="relative w-full max-w-4xl rounded-2xl bg-white dark:bg-slate-900 shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden my-6">
        
        {/* Active Orders Warning & Consolidation Modal */}
        {existingActiveOrdersWarning && (
          <div className="absolute inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-md p-4 dir-rtl">
            <div className="w-full max-w-2xl bg-white dark:bg-slate-900 border border-amber-500/40 rounded-2xl p-6 shadow-2xl space-y-5 max-h-[85vh] overflow-y-auto">
              
              <div className="flex items-start gap-3 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 p-4 rounded-xl">
                <div className="p-2 bg-amber-500/20 text-amber-600 rounded-lg shrink-0">
                  <AlertTriangle className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="font-bold text-amber-900 dark:text-amber-200 text-base">
                    تنبيه: توجد طلبيات سابقة قيد التنفيذ من نفس المصنع!
                  </h4>
                  <p className="text-xs text-amber-800 dark:text-amber-300 mt-1 leading-relaxed">
                    لاحظنا وجود طلبيات نشطة لم تُسلم بعد لنفس المصنع المعني. يمكنك دمج منتجات السلة الحالية مع إحدى الطلبيات المعلقة لتصلك في شحنة واحدة وتوفير تكاليف الشحن، أو إنشاء طلبية جديدة منفصلة.
                  </p>
                </div>
              </div>

              {/* Loop per factory with existing active orders */}
              <div className="space-y-4">
                {(
                  Object.entries(existingActiveOrdersWarning) as [
                    string,
                    { factoryName: string; activeSubs: SubOrder[]; cartItems: CartItem[] }
                  ][]
                ).map(([factoryId, data]) => (
                  <div key={factoryId} className="border border-slate-200 dark:border-slate-800 rounded-xl p-4 bg-slate-50 dark:bg-slate-800/50 space-y-3">
                    <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-700 pb-2">
                      <div className="flex items-center gap-2">
                        <Building2 className="w-4 h-4 text-emerald-600" />
                        <span className="font-bold text-sm text-slate-900 dark:text-white">{data.factoryName}</span>
                      </div>
                      <span className="text-xs font-bold text-amber-600 dark:text-amber-400">
                        {data.activeSubs.length} طلبية معلقة حالياً
                      </span>
                    </div>

                    <div className="space-y-2">
                      {data.activeSubs.map((sub) => (
                        <div key={sub.id} className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg">
                          <div className="space-y-1 text-xs">
                            <div className="flex items-center gap-2 font-bold text-slate-800 dark:text-slate-200">
                              <span>رقم الطلبية المعلقة: #{sub.id}</span>
                              <span className="text-[10px] bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 px-2 py-0.5 rounded-full font-bold">
                                {sub.status === "RECEIVED" ? "قيد الاستلام والتجهيز" : sub.status === "PROCESSING" ? "جاري التجهيز بالمصنع" : sub.status === "LOADED_FROM_FACTORY" ? "تم التحميل على الشاحنة" : sub.status === "OUT_FOR_DELIVERY" ? "في الطريق إليك" : "معلقة"}
                              </span>
                            </div>
                            <div className="text-slate-500">
                              عدد الأصناف الحالية: {sub.items.length} أصناف | المجموع: {sub.total.toLocaleString("ar-YE")} ر.ي
                            </div>
                          </div>

                          <button
                            type="button"
                            onClick={() => handleMergeIntoSubOrder(sub.id, data.cartItems)}
                            disabled={isSubmitting}
                            className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-lg transition-colors flex items-center justify-center gap-1.5 shrink-0 cursor-pointer"
                          >
                            <RefreshCw className="w-3.5 h-3.5" />
                            <span>دمج السلة مع هذه الطلبية (#{sub.id})</span>
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>

              {/* Modal Actions */}
              <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-slate-200 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setExistingActiveOrdersWarning(null)}
                  className="w-full sm:w-auto px-4 py-2.5 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold text-xs rounded-xl hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors cursor-pointer"
                >
                  الرجوع لتعديل السلة
                </button>

                <button
                  type="button"
                  onClick={() => handleConfirmOrder(true)}
                  disabled={isSubmitting}
                  className="w-full sm:w-auto px-5 py-2.5 bg-slate-900 dark:bg-slate-100 dark:text-slate-900 text-white font-bold text-xs rounded-xl hover:bg-slate-800 dark:hover:bg-slate-200 transition-colors flex items-center justify-center gap-2 cursor-pointer"
                >
                  <PlusCircle className="w-4 h-4" />
                  <span>تأكيد وإرسال كطلبية جديدة إضافية منفصلة</span>
                </button>
              </div>

            </div>
          </div>
        )}

        {/* Header */}
        <div className="flex items-center justify-between p-5 bg-slate-900 text-white">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-emerald-500 rounded-xl">
              <ShoppingBag className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="font-bold text-lg">السلة الموحدة وتقسيم الطلبات للمصانع</h3>
              <p className="text-xs text-slate-300">
                حدد الأصناف المطلوبة وعدّل الكميات مباشرة بالكيبورد ثم أرسل الطلب بنقرة واحدة
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {cart.length === 0 ? (
          <div className="p-12 text-center space-y-4">
            <div className="w-16 h-16 bg-slate-100 dark:bg-slate-800 text-slate-400 rounded-full flex items-center justify-center mx-auto">
              <ShoppingBag className="w-8 h-8" />
            </div>
            <h4 className="font-bold text-slate-700 dark:text-slate-300 text-base">
              السلة فارغة حالياً
            </h4>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              قم بإضافة المواد والنواقص من قائمة المنتجات أو استخدم زر تعويض النواقص لتعبئة السلة فوراً.
            </p>
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 bg-emerald-600 text-white font-bold text-xs rounded-xl hover:bg-emerald-700 transition-colors cursor-pointer"
            >
              تصفح كتالوج المصانع
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12">
            
            {/* Left Column: Grouped Factory Items */}
            <div className="lg:col-span-7 p-6 border-b lg:border-b-0 lg:border-l border-slate-200 dark:border-slate-800 space-y-5 max-h-[70vh] overflow-y-auto">
              
              {/* Top Controls Bar: Select All / Deselect / Clear Cart */}
              <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-200 dark:border-slate-700 flex flex-wrap items-center justify-between gap-2.5">
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={selectAll}
                    className="px-2.5 py-1 text-xs font-bold bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-800 dark:text-slate-200 rounded-lg hover:bg-emerald-50 dark:hover:bg-emerald-950/40 hover:text-emerald-600 transition-colors flex items-center gap-1.5 cursor-pointer shadow-2xs"
                  >
                    <CheckSquare className="w-3.5 h-3.5 text-emerald-600" />
                    <span>تحديد الكل ({cart.length})</span>
                  </button>

                  <button
                    type="button"
                    onClick={deselectAll}
                    className="px-2.5 py-1 text-xs font-bold bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-600 dark:text-slate-300 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors flex items-center gap-1.5 cursor-pointer shadow-2xs"
                  >
                    <Square className="w-3.5 h-3.5 text-slate-400" />
                    <span>إلغاء التحديد</span>
                  </button>

                  <span className="text-[11px] font-bold px-2 py-0.5 rounded-md bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300">
                    محدد: {selectedCartItems.length} من {cart.length}
                  </span>
                </div>

                <button
                  type="button"
                  onClick={() => storeService.clearCart()}
                  className="px-2.5 py-1 text-xs text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-lg transition-colors flex items-center gap-1.5 font-bold cursor-pointer border border-transparent hover:border-rose-200 dark:hover:border-rose-900"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>تفريغ السلة</span>
                </button>
              </div>

              {/* Loop over factory groups */}
              {Object.entries(factoryGroups).map(([factoryId, group]) => {
                const isGroupAllSelected = group.items.length > 0 && group.items.every((it) => selectedItemIds.has(it.product.id));
                const isGroupPartiallySelected = group.items.some((it) => selectedItemIds.has(it.product.id)) && !isGroupAllSelected;

                return (
                  <div
                    key={factoryId}
                    className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 p-4 space-y-3"
                  >
                    {/* Factory Header with Group Checkbox */}
                    <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-700 pb-2.5">
                      <div className="flex items-center gap-2.5">
                        <label className="flex items-center gap-2 cursor-pointer select-none">
                          <input
                            type="checkbox"
                            checked={isGroupAllSelected}
                            ref={(el) => {
                              if (el) el.indeterminate = isGroupPartiallySelected;
                            }}
                            onChange={() => toggleFactoryGroupSelection(group.items)}
                            className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500 dark:focus:ring-emerald-400 cursor-pointer accent-emerald-600"
                          />
                          <Building2 className="w-4 h-4 text-emerald-600" />
                          <h4 className="font-bold text-slate-900 dark:text-white text-sm">
                            {group.factoryName}
                          </h4>
                        </label>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400">
                          ({group.selectedCount}/{group.items.length} محدد)
                        </span>
                        <span className="text-xs font-bold text-emerald-700 dark:text-emerald-400">
                          المطلوب: {group.selectedSubtotal.toLocaleString("ar-YE")} ر.ي
                        </span>
                      </div>
                    </div>

                    {/* Factory Items */}
                    <div className="space-y-3">
                      {group.items.map((ci) => {
                        const isSelected = selectedItemIds.has(ci.product.id);

                        return (
                          <div
                            key={ci.product.id}
                            className={`flex items-center justify-between gap-3 p-3 rounded-xl border transition-all ${
                              isSelected
                                ? "bg-white dark:bg-slate-900 border-emerald-500/40 dark:border-emerald-600/40 shadow-xs"
                                : "bg-slate-100/70 dark:bg-slate-900/40 border-slate-200 dark:border-slate-800 opacity-60"
                            }`}
                          >
                            {/* Checkbox for item */}
                            <label className="flex items-center gap-2.5 cursor-pointer shrink-0">
                              <input
                                type="checkbox"
                                checked={isSelected}
                                onChange={() => toggleItemSelection(ci.product.id)}
                                className="w-4.5 h-4.5 rounded text-emerald-600 focus:ring-emerald-500 dark:focus:ring-emerald-400 cursor-pointer accent-emerald-600"
                              />
                              <img
                                src={ci.product.image}
                                alt=""
                                className="w-12 h-12 rounded-lg object-cover border border-slate-200 dark:border-slate-700"
                              />
                            </label>

                            <div className="flex-1 min-w-0">
                              <h5 className="font-bold text-xs text-slate-900 dark:text-white truncate">
                                {ci.product.name}
                              </h5>
                              <div className="text-[11px] text-slate-500 flex items-center gap-1.5 mt-0.5">
                                <span>{ci.product.price} ر.ي / {ci.product.unit}</span>
                                {isSelected ? (
                                  <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold bg-emerald-50 dark:bg-emerald-950/60 px-1.5 py-0.2 rounded">
                                    مشمول بالطلب
                                  </span>
                                ) : (
                                  <span className="text-[10px] text-slate-400 font-bold">
                                    غير محدد
                                  </span>
                                )}
                              </div>
                            </div>

                            {/* Direct Keyboard Number Input & Quantity Controls */}
                            <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl border border-slate-200 dark:border-slate-700">
                              <button
                                type="button"
                                onClick={() =>
                                  handleQuantityChange(ci.product.id, Math.max(1, ci.quantity - 1))
                                }
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
                                value={ci.quantity}
                                onChange={(e) => {
                                  const val = parseInt(e.target.value, 10);
                                  handleQuantityChange(ci.product.id, isNaN(val) ? 1 : val);
                                }}
                                onBlur={(e) => {
                                  const val = parseInt(e.target.value, 10);
                                  if (isNaN(val) || val <= 0) {
                                    handleQuantityChange(ci.product.id, 1);
                                  }
                                }}
                                className="w-14 text-center font-black text-xs py-1 px-1 rounded-md bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white focus:ring-1 focus:ring-emerald-500 focus:outline-none"
                                title="اكتب الكمية المطلوبة مباشرة بالكيبورد"
                              />

                              <button
                                type="button"
                                onClick={() =>
                                  handleQuantityChange(ci.product.id, ci.quantity + 1)
                                }
                                className="w-7 h-7 flex items-center justify-center hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg text-slate-700 dark:text-slate-300 cursor-pointer transition-colors"
                                title="زيادة الكمية 1"
                              >
                                <Plus className="w-3.5 h-3.5" />
                              </button>
                            </div>

                            <div className="flex items-center gap-2">
                              <div className="text-left font-black text-xs text-slate-900 dark:text-white min-w-[70px]">
                                {(ci.product.price * ci.quantity).toLocaleString("ar-YE")} ر.ي
                              </div>
                              <button
                                type="button"
                                onClick={() => handleRemoveCartItem(ci.product.id)}
                                className="p-1.5 hover:bg-rose-100 dark:hover:bg-rose-950/60 rounded-lg text-slate-400 hover:text-rose-600 transition-colors cursor-pointer"
                                title="حذف هذا المنتج من السلة"
                              >
                                <Trash2 className="w-4 h-4 text-rose-500 hover:scale-110 transition-transform" />
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Right Column: Wholesaler Store Info & Checkout Summary */}
            <div className="lg:col-span-5 p-6 space-y-5 bg-slate-50 dark:bg-slate-900/60">
              
              {/* Wholesaler Location & Store Card */}
              <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-emerald-600" />
                    <span className="font-bold text-xs text-slate-900 dark:text-white">
                      موقع التاجر لاستلام الشحنة
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setIsEditingAddress(!isEditingAddress)}
                    className="text-[11px] text-emerald-700 dark:text-emerald-400 font-bold hover:underline cursor-pointer"
                  >
                    {isEditingAddress ? "حفظ" : "تعديل الموقع"}
                  </button>
                </div>

                {isEditingAddress ? (
                  <div className="space-y-2 text-xs">
                    <input
                      type="text"
                      value={wholesaler.storeName}
                      onChange={(e) =>
                        setWholesaler({ ...wholesaler, storeName: e.target.value })
                      }
                      placeholder="اسم المتجر / المحل"
                      className="w-full p-2 border rounded-lg bg-slate-50 dark:bg-slate-800"
                    />
                    <input
                      type="text"
                      value={wholesaler.ownerName}
                      onChange={(e) =>
                        setWholesaler({ ...wholesaler, ownerName: e.target.value })
                      }
                      placeholder="اسم التاجر المسؤول"
                      className="w-full p-2 border rounded-lg bg-slate-50 dark:bg-slate-800"
                    />
                    <input
                      type="text"
                      value={wholesaler.phone}
                      onChange={(e) => setWholesaler({ ...wholesaler, phone: e.target.value })}
                      placeholder="رقم الجوال"
                      className="w-full p-2 border rounded-lg bg-slate-50 dark:bg-slate-800"
                    />
                    <input
                      type="text"
                      value={wholesaler.fullAddress}
                      onChange={(e) =>
                        setWholesaler({ ...wholesaler, fullAddress: e.target.value })
                      }
                      placeholder="العنوان التفصيلي"
                      className="w-full p-2 border rounded-lg bg-slate-50 dark:bg-slate-800"
                    />
                  </div>
                ) : (
                  <div className="text-xs space-y-1">
                    <p className="font-bold text-slate-900 dark:text-white">
                      {wholesaler.storeName}
                    </p>
                    <p className="text-slate-600 dark:text-slate-400">
                      {wholesaler.ownerName} ({wholesaler.phone})
                    </p>
                    <p className="text-slate-500 text-[11px] leading-tight">
                      {wholesaler.city} - {wholesaler.district} | {wholesaler.fullAddress}
                    </p>
                  </div>
                )}
              </div>

              {/* Payment Method Selector */}
              <div className="space-y-2">
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                  طريقة الدفع وشروط السداد B2B:
                </label>
                <div className="grid grid-cols-1 gap-2">
                  <button
                    type="button"
                    onClick={() => setPaymentMethod("INVOICE_30_DAYS")}
                    className={`flex items-center justify-between p-3 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                      paymentMethod === "INVOICE_30_DAYS"
                        ? "bg-emerald-50 border-emerald-600 text-emerald-900 dark:bg-emerald-950/50 dark:text-emerald-300"
                        : "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300"
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <FileText className="w-4 h-4 text-emerald-600" />
                      <span>فاتورة آجلة B2B (سداد خلال 30 يوماً)</span>
                    </div>
                    {paymentMethod === "INVOICE_30_DAYS" && (
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={() => setPaymentMethod("CASH_ON_DELIVERY")}
                    className={`flex items-center justify-between p-3 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                      paymentMethod === "CASH_ON_DELIVERY"
                        ? "bg-emerald-50 border-emerald-600 text-emerald-900 dark:bg-emerald-950/50 dark:text-emerald-300"
                        : "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300"
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <Truck className="w-4 h-4 text-emerald-600" />
                      <span>الدفع نقداً أو شبكة عند استلام الشاحنة</span>
                    </div>
                    {paymentMethod === "CASH_ON_DELIVERY" && (
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    )}
                  </button>
                </div>
              </div>

              {/* Special Delivery Notes */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  ملاحظات التوصيل أو المستودع (اختياري):
                </label>
                <input
                  type="text"
                  value={deliveryNotes}
                  onChange={(e) => setDeliveryNotes(e.target.value)}
                  placeholder="مثال: يرجى التنزيل من البوابة الخلفية للمحل..."
                  className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs text-slate-900 dark:text-white"
                />
              </div>

              {/* Financial Calculation Summary for Selected Items */}
              <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-2 text-xs">
                <div className="flex items-center justify-between font-bold text-slate-700 dark:text-slate-300 pb-1 border-b border-slate-100 dark:border-slate-800">
                  <span>الأصناف المحددة للطلب:</span>
                  <span className="text-emerald-600 dark:text-emerald-400">
                    {selectedCartItems.length} صنف ({selectedFactoriesCount} مصانع)
                  </span>
                </div>
                <div className="flex justify-between text-slate-600 dark:text-slate-400">
                  <span>المجموع الفرعي للأصناف المحددة:</span>
                  <span>{selectedSubtotal.toLocaleString("ar-YE")} ر.ي</span>
                </div>
                <div className="flex justify-between text-slate-600 dark:text-slate-400">
                  <span>ضريبة القيمة المضافة (15%):</span>
                  <span>{vat.toLocaleString("ar-YE")} ر.ي</span>
                </div>
                <div className="border-t border-slate-200 dark:border-slate-800 pt-2 flex justify-between font-extrabold text-sm text-slate-900 dark:text-white">
                  <span>إجمالي الطلب الفعلي:</span>
                  <span className="text-emerald-700 dark:text-emerald-400">
                    {overallTotal.toLocaleString("ar-YE")} ر.ي
                  </span>
                </div>
              </div>

              {/* Submit Split Order Button */}
              <button
                type="button"
                onClick={() => handleConfirmOrder(false)}
                disabled={isSubmitting || selectedCartItems.length === 0}
                className={`w-full py-3.5 rounded-xl font-bold text-sm shadow-md transition-all flex items-center justify-center gap-2 ${
                  selectedCartItems.length === 0 || isSubmitting
                    ? "bg-slate-300 dark:bg-slate-800 text-slate-500 cursor-not-allowed"
                    : "bg-emerald-600 hover:bg-emerald-700 text-white cursor-pointer active:scale-[0.99]"
                }`}
              >
                {selectedCartItems.length === 0 ? (
                  <span>يرجى تحديد صنف واحد على الأقل لإتمام الطلب</span>
                ) : (
                  <>
                    <span>تأكيد وإرسال ({selectedCartItems.length}) صنف للمصانع</span>
                    <ArrowRight className="w-4 h-4 rotate-180" />
                  </>
                )}
              </button>

            </div>

          </div>
        )}
      </div>
    </div>
  );
};

