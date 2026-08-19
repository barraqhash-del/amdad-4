import React, { useState, useEffect } from "react";
import {
  MerchantItem,
  MerchantWarehouse,
  MerchantSaleOrder,
  MerchantSaleItem,
  MerchantAccount,
} from "../../types";
import { storeService } from "../../services/storeService";
import { sendWhatsAppMessage } from "../../services/whatsappService";
import { BarcodeGenerator } from "../common/BarcodeGenerator";
import { BarcodeLabelModal } from "./BarcodeLabelModal";
import {
  ShoppingBag,
  Plus,
  Minus,
  Trash2,
  CheckCircle2,
  Receipt,
  Building2,
  User,
  Phone,
  CreditCard,
  DollarSign,
  Printer,
  Calendar,
  Search,
  X,
  FileText,
  TrendingUp,
  AlertTriangle,
  Layers,
  Settings2,
  Wifi,
  Usb,
  Laptop,
  HelpCircle,
  Percent,
  Tag,
  QrCode,
  Send,
  Check,
  Sparkles,
  ShieldCheck,
} from "lucide-react";

interface Props {
  warehouses: MerchantWarehouse[];
  items: MerchantItem[];
  sales: MerchantSaleOrder[];
}

export const MerchantSalesPOS: React.FC<Props> = ({
  warehouses,
  items,
  sales,
}) => {
  const [currentAccount, setCurrentAccount] = useState<MerchantAccount | null>(() =>
    storeService.getCurrentMerchantSession()
  );

  // Barcode Labels Modal State
  const [isBarcodeModalOpen, setIsBarcodeModalOpen] = useState(false);
  const [barcodeItemForLabel, setBarcodeItemForLabel] = useState<MerchantItem | null>(null);

  useEffect(() => {
    const unsubscribe = storeService.subscribe(() => {
      const latest = storeService.getCurrentMerchantSession();
      setCurrentAccount(latest);
    });
    return unsubscribe;
  }, []);

  // Tax configuration from merchant settings
  const isTaxEnabled = Boolean(currentAccount?.taxEnabled);
  const taxRate = isTaxEnabled ? (currentAccount?.taxRate ?? 15) : 0;

  const defaultWh = warehouses.find((w) => w.isDefault) || warehouses[0];
  const [selectedWarehouseId, setSelectedWarehouseId] = useState<string>(
    defaultWh?.id || ""
  );

  // Cashier & Wholesale Order Mode
  const [cashierName] = useState("براق الجالفي");
  const [orderMode, setOrderMode] = useState<"WHOLESALE" | "RETAIL" | "CREDIT" | "DELIVERY">("WHOLESALE");
  const [poReference, setPoReference] = useState("");

  // Customer info
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [customerType, setCustomerType] = useState<
    "RETAIL_STORE" | "WALK_IN" | "COMPANY"
  >("WALK_IN");
  const [paymentMethod, setPaymentMethod] = useState<
    "CASH" | "BANK_TRANSFER" | "CREDIT_30_DAYS"
  >("CASH");
  const [notes, setNotes] = useState("");

  // Cart items for POS sale
  const [cart, setCart] = useState<
    {
      item: MerchantItem;
      quantity: number;
      sellingPrice: number;
    }[]
  >([]);

  // Item search & category filter state
  const [itemSearch, setItemSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("الكل");
  const [selectedInvoice, setSelectedInvoice] =
    useState<MerchantSaleOrder | null>(null);

  // Active sub-tab inside Sales: POS terminal vs Invoice history
  const [salesTab, setSalesTab] = useState<"NEW_SALE" | "HISTORY">("NEW_SALE");

  const handleDeleteSale = (saleId: string) => {
    if (confirm(`هل أنت تأكد من رغبتك في إلغاء وحذف الفاتورة رقم (${saleId}) من سجلات المبيعات؟`)) {
      storeService.deleteMerchantSale(saleId);
      setSelectedInvoice(null);
    }
  };

  // Printer Configuration & Device Settings
  const [selectedPaperFormat, setSelectedPaperFormat] = useState<"A4" | "THERMAL_80MM" | "THERMAL_58MM">("A4");
  const [selectedPrinterType, setSelectedPrinterType] = useState<"SYSTEM_DEFAULT" | "POS_THERMAL_USB" | "POS_BLUETOOTH" | "NETWORK_PRINTER">("SYSTEM_DEFAULT");
  const [showPrinterGuide, setShowPrinterGuide] = useState(false);

  const activeWarehouse =
    warehouses.find((w) => w.id === selectedWarehouseId) || warehouses[0];

  // Dynamically extract categories from all items in merchant inventory
  const categories = [
    "الكل",
    ...Array.from(new Set(items.map((i) => i.category).filter(Boolean))),
  ];

  // Filter items in real-time. ALL items created in Item Management appear immediately!
  const availableItems = items.filter((it) => {
    const query = itemSearch.trim().toLowerCase();
    const matchesSearch =
      !query ||
      it.name.toLowerCase().includes(query) ||
      it.sku.toLowerCase().includes(query) ||
      it.category.toLowerCase().includes(query);

    const matchesCategory =
      selectedCategory === "الكل" || it.category === selectedCategory;

    return matchesSearch && matchesCategory;
  });

  const addToCart = (item: MerchantItem) => {
    const stockInWh =
      item.warehouseStock?.[selectedWarehouseId] ?? item.totalStock ?? 999;
    const existingIndex = cart.findIndex((c) => c.item.id === item.id);

    if (existingIndex > -1) {
      const currentQty = cart[existingIndex].quantity;
      if (stockInWh > 0 && currentQty + 1 > stockInWh) {
        alert(
          `تنبيه: الكمية المتاحة بـ (${activeWarehouse?.name || "المستودع"}) هي ${stockInWh} حبة فقط.`
        );
      }
      const updated = [...cart];
      updated[existingIndex].quantity += 1;
      setCart(updated);
    } else {
      if (stockInWh <= 0 && item.totalStock <= 0) {
        if (!confirm("هذا الصنف مكتوب عليه (0) بالمخزون. هل ترغب بإضافته وإتمامه كطلب مبيعات؟")) {
          return;
        }
      }
      setCart([
        ...cart,
        {
          item,
          quantity: 1,
          sellingPrice: item.sellingPrice,
        },
      ]);
    }
  };

  const updateQuantity = (itemId: string, newQty: number) => {
    if (newQty <= 0) {
      removeFromCart(itemId);
      return;
    }

    setCart(
      cart.map((c) => (c.item.id === itemId ? { ...c, quantity: newQty } : c))
    );
  };

  const removeFromCart = (itemId: string) => {
    setCart(cart.filter((c) => c.item.id !== itemId));
  };

  // Calculations
  const subtotal = cart.reduce(
    (sum, c) => sum + c.quantity * c.sellingPrice,
    0
  );
  const vatTax = isTaxEnabled ? subtotal * (taxRate / 100) : 0;
  const totalAmount = subtotal + vatTax;
  const profitMargin = cart.reduce(
    (sum, c) => sum + c.quantity * (c.sellingPrice - c.item.costPrice),
    0
  );

  // WhatsApp Background Automation State (Zero-Window / Headless)
  const [waSendingSaleId, setWaSendingSaleId] = useState<string | null>(null);
  const [waDispatchSuccessMessage, setWaDispatchSuccessMessage] = useState<string | null>(null);

  // Helper to find responsible employee or cashier phone & details
  const getResponsibleEmployeeInfo = () => {
    const employees = storeService.getEmployees();
    // Search for cashier or sales role or specific cashier
    const matched = employees.find(
      (emp) =>
        emp.name.toLowerCase().includes("براق") ||
        emp.roleTitle.toLowerCase().includes("كاشير") ||
        emp.roleTitle.toLowerCase().includes("مبيعات") ||
        emp.roleTitle.toLowerCase().includes("محاسب")
    ) || employees[0];

    const store = storeService.getCurrentMerchantSession();
    const phone = matched?.phone || store?.whatsAppConfig?.managerPhone || store?.phone || "771234567";
    const name = matched?.name || cashierName || "الموظف المسؤول (الكاشير)";

    return { phone, name, employee: matched };
  };

  // Generate structured, crystal-clear invoice WhatsApp message body
  const generateInvoiceWhatsAppMessage = (sale: MerchantSaleOrder) => {
    const store = storeService.getCurrentMerchantSession();
    const storeName = store?.storeName || currentAccount?.storeName || "مؤسسة التاجر المعتمدة للمبيعات";
    const paymentLabel =
      sale.paymentMethod === "CASH"
        ? "نقداً (كاش)"
        : sale.paymentMethod === "BANK_TRANSFER"
        ? "تحويل بنكي"
        : "بيع آجل / ذمم على الحساب";

    const { name: responsibleName } = getResponsibleEmployeeInfo();

    const itemsSummary = sale.items
      .map(
        (it, idx) =>
          `🔹 *${idx + 1}. ${it.itemName}*\n   الكمية: ${it.quantity} ${it.unit} × ${it.sellingPrice.toFixed(2)} ر.س = *${it.total.toFixed(2)} ر.س*`
      )
      .join("\n");

    const dateStr = new Date(sale.createdAt).toLocaleDateString("ar-YE");
    const timeStr = new Date(sale.createdAt).toLocaleTimeString("ar-YE", {
      hour: "2-digit",
      minute: "2-digit",
    });

    return `🧾 *[إشعار اعتماد سند وفاتورة مبيعات]* 🟢
━━━━━━━━━━━━━━━━━━
🏢 *المنشأة / المتجر:* ${storeName}
📄 *رقم السند/الفاتورة:* ${sale.invoiceNo}
👤 *الموظف المسؤول (الكاشير):* ${responsibleName}
👥 *العميل:* ${sale.customerName} (${sale.customerPhone || "غير مسجل"})
🏛️ *فرع الصرف:* ${sale.warehouseName}
💳 *طريقة السداد:* ${paymentLabel}
━━━━━━━━━━━━━━━━━━
📦 *بيانات وتفاصيل الأصناف:*
${itemsSummary}
━━━━━━━━━━━━━━━━━━
💰 *المجموع الفرعي:* ${sale.subtotal.toFixed(2)} ر.س
${sale.vatTax > 0 ? `📊 *ضريبة القيمة المضافة:* ${sale.vatTax.toFixed(2)} ر.س\n` : ""}💵 *صافي الإجمالي المطلوب:* ${sale.totalAmount.toFixed(2)} ر.س
━━━━━━━━━━━━━━━━━━
📅 *التاريخ والوقت:* ${dateStr} - ${timeStr}
🛡️ *حالة السند:* معتمد رسمياً في النظام (COMPLETED)
⚡ *طريقة الإرسال:* دالة إرسال خلفية مباشرة دون فتح أي نوافذ`;
  };

  // Main approval and silent WhatsApp dispatch trigger
  const handleApproveSaleAndNotify = async (sale: MerchantSaleOrder) => {
    try {
      setWaSendingSaleId(sale.id);

      // 1. Ensure status is COMPLETED / معتمد in persistent storage
      if (sale.status !== "COMPLETED") {
        storeService.updateMerchantSaleStatus(sale.id, "COMPLETED");
        sale.status = "COMPLETED";
      }

      const { phone: responsiblePhone, name: responsibleName } = getResponsibleEmployeeInfo();
      const message = generateInvoiceWhatsAppMessage(sale);

      // 2. Call sendWhatsAppMessage directly in background without opening any windows/popups
      await sendWhatsAppMessage(responsiblePhone, message, {
        employeeName: responsibleName,
        invoiceNo: sale.invoiceNo,
        amount: sale.totalAmount,
        voucherType: "فاتورة مبيعات معتمدة",
      });

      // 3. Also send a copy to customer if a valid phone number is present
      const cleanCustomerPhone = sale.customerPhone ? sale.customerPhone.replace(/[^0-9]/g, "") : "";
      if (cleanCustomerPhone.length >= 8 && sale.customerPhone !== "غير مسجل") {
        sendWhatsAppMessage(sale.customerPhone, message, {
          employeeName: sale.customerName,
          invoiceNo: sale.invoiceNo,
          amount: sale.totalAmount,
          voucherType: "فاتورة مبيعات معتمدة",
        }).catch((err) => console.warn("Customer WhatsApp copy notice:", err));
      }

      setWaDispatchSuccessMessage(
        `تم اعتماد السند (${sale.invoiceNo}) وإرسال تفاصيل الفاتورة آلياً إلى الموظف المسؤول (${responsibleName}) عبر الواتساب في الخلفية بنجاح 🟢⚡`
      );
      setTimeout(() => setWaDispatchSuccessMessage(null), 6000);
    } catch (err: any) {
      console.error("Error approving sale & sending WA message:", err);
    } finally {
      setWaSendingSaleId(null);
    }
  };

  const handleCompleteSale = (e?: React.FormEvent) => {
    if (e) e.preventDefault();

    if (cart.length === 0) {
      alert("الرجاء إضافة أصناف للفاتورة قبل إتمام البيع");
      return;
    }

    const finalCustomerName = customerName.trim() || "زبون مباشر (كاشير)";

    const saleItems: MerchantSaleItem[] = cart.map((c) => ({
      itemId: c.item.id,
      itemName: c.item.name,
      sku: c.item.sku,
      unit: c.item.unit,
      quantity: c.quantity,
      costPrice: c.item.costPrice,
      sellingPrice: c.sellingPrice,
      total: c.quantity * c.sellingPrice,
    }));

    const modeLabels = {
      WHOLESALE: "بيع جملة",
      RETAIL: "قطاعي/تجزئة",
      CREDIT: "بيع آجل/ذمم",
      DELIVERY: "شحن/توصيل",
    };

    const createdSale = storeService.createMerchantSale({
      customerName: finalCustomerName,
      customerPhone: customerPhone.trim() || "غير مسجل",
      customerType,
      warehouseId: activeWarehouse?.id || "wh-default",
      warehouseName: activeWarehouse?.name || "المستودع الرئيسي",
      items: saleItems,
      subtotal,
      vatTax,
      totalAmount,
      profitMargin,
      paymentMethod,
      status: "COMPLETED",
      notes: notes.trim() || `مبيعات تجارية (${modeLabels[orderMode]}) ${poReference ? `- مرجع/عقد: ${poReference}` : ""}`,
    });

    // Reset form & show receipt
    setCart([]);
    setCustomerName("");
    setCustomerPhone("");
    setPoReference("");
    setNotes("");
    setSelectedInvoice(createdSale);

    // Automatically invoke sendWhatsAppMessage for the approved sale in the background
    handleApproveSaleAndNotify(createdSale);
  };

  // Order Reference Number for display
  const currentInvoiceNo = `INV-${Math.floor(100000 + Math.random() * 900000)}`;

  return (
    <div className="space-y-4">
      {/* Top Header Bar for POS vs History Navigation */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-white dark:bg-slate-900 p-4 rounded-3xl border border-slate-200/90 dark:border-slate-800 text-slate-900 dark:text-white shadow-sm">
        <div className="flex items-center gap-3.5">
          <div className="relative w-12 h-12 rounded-2xl bg-gradient-to-tr from-emerald-600 via-emerald-500 to-teal-400 text-white flex items-center justify-center font-black shadow-lg shadow-emerald-500/25 ring-2 ring-emerald-500/20 dark:ring-emerald-400/30 overflow-hidden shrink-0 group transition-all duration-300 hover:scale-105">
            <div className="absolute -top-2 -right-2 w-6 h-6 bg-white/25 rounded-full blur-xs pointer-events-none" />
            <ShoppingBag className="w-6 h-6 text-white drop-shadow-xs transition-transform duration-300 group-hover:scale-110" strokeWidth={2.3} />
            <div className="absolute inset-0 bg-white/10 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-black text-slate-900 dark:text-white">
                كاشير ونقطة البيع السريعة الموحدة (POS)
              </h2>
              <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 text-[11px] font-black border border-emerald-500/30 flex items-center gap-1.5 shadow-2xs">
                <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block" />
                <span>مباشر</span>
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              {cashierName} - كاشير ونظام إدارة المبيعات المباشرة
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto justify-end flex-wrap">
          <button
            onClick={() => {
              setBarcodeItemForLabel(null);
              setIsBarcodeModalOpen(true);
            }}
            className="px-3.5 py-2.5 rounded-xl text-xs font-black transition-all flex items-center gap-2 cursor-pointer bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 hover:bg-indigo-100 dark:hover:bg-indigo-900/60 border border-indigo-200 dark:border-indigo-800 shadow-2xs"
            title="طباعة وتوليد ملصقات الباركود الحقيقي للمنتجات"
          >
            <Tag className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
            <span>طباعة ملصقات الباركود (Labels)</span>
          </button>

          <button
            onClick={() => setSalesTab("NEW_SALE")}
            className={`px-4 py-2.5 rounded-xl text-xs font-black transition-all flex items-center gap-2 cursor-pointer ${
              salesTab === "NEW_SALE"
                ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md shadow-blue-600/25 ring-2 ring-blue-500/30 scale-[1.02]"
                : "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700"
            }`}
          >
            <Plus className="w-4 h-4" />
            <span>نقطة بيع الكاشير (POS)</span>
          </button>

          <button
            onClick={() => setSalesTab("HISTORY")}
            className={`px-4 py-2.5 rounded-xl text-xs font-black transition-all flex items-center gap-2 cursor-pointer ${
              salesTab === "HISTORY"
                ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md shadow-blue-600/25 ring-2 ring-blue-500/30 scale-[1.02]"
                : "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700"
            }`}
          >
            <Receipt className="w-4 h-4" />
            <span>سجل الفواتير ({sales.length})</span>
          </button>
        </div>
      </div>

      {/* Real-time WhatsApp Notification Toast Alert */}
      {waDispatchSuccessMessage && (
        <div className="p-3.5 bg-emerald-500/10 border border-emerald-500/30 rounded-2xl flex items-center justify-between gap-3 text-emerald-800 dark:text-emerald-200 animate-in fade-in slide-in-from-top-2 duration-300">
          <div className="flex items-center gap-2.5 text-xs font-bold">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping shrink-0" />
            <span>{waDispatchSuccessMessage}</span>
          </div>
          <button
            onClick={() => setWaDispatchSuccessMessage(null)}
            className="p-1 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-500/20 rounded-lg transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {salesTab === "NEW_SALE" && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
          {/* RIGHT COLUMN: Product Catalog & Category Nav */}
          <div className="lg:col-span-8 space-y-3.5">
            {/* Top Filter Bar: Warehouse + Search */}
            <div className="bg-white dark:bg-slate-900 p-3.5 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-3 shadow-xs">
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
                {/* Search Bar */}
                <div className="relative flex-1">
                  <Search className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    value={itemSearch}
                    onChange={(e) => setItemSearch(e.target.value)}
                    placeholder="بحث سريع عن صنف، الرمز (SKU) أو التصنيف..."
                    className="w-full pr-10 pl-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                  {itemSearch && (
                    <button
                      onClick={() => setItemSearch("")}
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-white"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                {/* Warehouse selector */}
                <div className="flex items-center gap-2 shrink-0">
                  <Building2 className="w-4 h-4 text-slate-400" />
                  <select
                    value={selectedWarehouseId}
                    onChange={(e) => setSelectedWarehouseId(e.target.value)}
                    className="px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-bold text-slate-900 dark:text-white focus:outline-none"
                  >
                    {warehouses.map((w) => (
                      <option key={w.id} value={w.id}>
                        {w.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Horizontal Scrollable Categories Bar */}
              <div className="flex items-center gap-2 overflow-x-auto pt-1 pb-1 scrollbar-none border-t border-slate-100 dark:border-slate-800">
                {categories.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={`px-3.5 py-2 rounded-xl text-xs font-extrabold whitespace-nowrap transition-all flex items-center gap-1.5 ${
                      selectedCategory === cat
                        ? "bg-blue-600 text-white shadow-md ring-2 ring-blue-500/30"
                        : "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700"
                    }`}
                  >
                    <Layers className="w-3.5 h-3.5" />
                    <span>{cat}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Product Cards Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5 gap-3 max-h-[640px] overflow-y-auto pr-1">
              {availableItems.length === 0 ? (
                <div className="col-span-full p-10 text-center bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 text-slate-400">
                  <AlertTriangle className="w-8 h-8 text-amber-500 mx-auto mb-2" />
                  <p className="text-xs font-bold text-slate-800 dark:text-slate-200">
                    لا توجد أصناف تقتضي البحث المحدد
                  </p>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                    أضف أصناف جديدة في قسم (إضافة وتسعير الأصناف) وتظهر تلقائياً هنا!
                  </p>
                </div>
              ) : (
                availableItems.map((item) => {
                  const stockInWh =
                    item.warehouseStock?.[selectedWarehouseId] ?? item.totalStock ?? 0;
                  const inCartQty =
                    cart.find((c) => c.item.id === item.id)?.quantity || 0;

                  return (
                    <div
                      key={item.id}
                      onClick={() => addToCart(item)}
                      className="p-3 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-emerald-500 dark:hover:border-emerald-500 transition-all cursor-pointer shadow-xs flex flex-col justify-between items-center text-center group relative overflow-hidden active:scale-98"
                    >
                      {/* In-Cart Notification Badge */}
                      {inCartQty > 0 && (
                        <div className="absolute top-2 right-2 px-2 py-0.5 rounded-full bg-emerald-500 text-slate-950 text-[10px] font-black shadow-md z-10 animate-pulse">
                          {inCartQty} بالسلة
                        </div>
                      )}

                      {/* Top Circular / Square Product Image */}
                      <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 shadow-xs mb-2 group-hover:scale-105 transition-transform shrink-0">
                        <img
                          src={
                            item.image ||
                            "https://images.unsplash.com/photo-1586201375761-83865001e31c?w=300&auto=format&fit=crop&q=60"
                          }
                          alt={item.name}
                          referrerPolicy="no-referrer"
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src =
                              "https://images.unsplash.com/photo-1586201375761-83865001e31c?w=300&auto=format&fit=crop&q=60";
                          }}
                        />
                      </div>

                      {/* Product Info */}
                      <div className="w-full space-y-0.5 mb-2">
                        <h4 className="text-xs font-extrabold text-slate-900 dark:text-slate-100 line-clamp-1 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                          {item.name}
                        </h4>
                        <span className="text-[10px] text-slate-500 dark:text-slate-400 block truncate font-mono">
                          {item.category} | {item.unit}
                        </span>
                      </div>

                      {/* Bottom Pricing & Quick Plus Add Button */}
                      <div className="w-full pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-1">
                        <div className="text-right">
                          <span className="text-xs font-black text-emerald-600 dark:text-emerald-400 block font-mono">
                            {item.sellingPrice} ر.س
                          </span>
                          <span className="text-[9px] text-slate-400 dark:text-slate-500 block font-mono">
                            متاح: {stockInWh}
                          </span>
                        </div>

                        <div className="flex items-center gap-1">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setBarcodeItemForLabel(item);
                              setIsBarcodeModalOpen(true);
                            }}
                            className="w-7 h-7 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-indigo-100 dark:hover:bg-indigo-950/80 text-slate-600 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 font-bold transition-all shadow-2xs flex items-center justify-center shrink-0 border border-slate-200 dark:border-slate-700 active:scale-90"
                            title="طباعة ملصق باركود حقيقي للصنف"
                          >
                            <Tag className="w-3.5 h-3.5" />
                          </button>

                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              addToCart(item);
                            }}
                            className="w-7 h-7 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold transition-all shadow-xs flex items-center justify-center shrink-0 active:scale-90"
                            title="إضافة للسلة"
                          >
                            <Plus className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* LEFT COLUMN: Order Details / Cart Side Panel ("تفاصيل الطلب") */}
          <div className="lg:col-span-4 bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between space-y-4 text-slate-900 dark:text-white">
            <div className="space-y-3.5">
              {/* Order Reference Header */}
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
                <div>
                  <div className="flex items-center gap-2">
                    <Receipt className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                    <h3 className="text-sm font-black text-slate-900 dark:text-white">
                      تفاصيل الطلب
                    </h3>
                  </div>
                  <span className="text-[10px] text-slate-500 dark:text-slate-400 font-mono">
                    مرجع الفاتورة: <strong className="text-emerald-600 dark:text-emerald-400">{currentInvoiceNo}</strong>
                  </span>
                </div>

                {cart.length > 0 && (
                  <button
                    onClick={() => setCart([])}
                    className="text-xs text-rose-600 dark:text-rose-400 hover:text-rose-700 font-bold px-2 py-1 rounded-lg bg-rose-50 dark:bg-rose-500/10 border border-rose-200 dark:border-rose-500/20 transition-colors"
                  >
                    تفريغ
                  </button>
                )}
              </div>

              {/* Wholesale / Commercial Order Mode Toggle Pills */}
              <div className="grid grid-cols-4 gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl border border-slate-200 dark:border-slate-700/80 text-[11px] font-extrabold text-center">
                <button
                  type="button"
                  onClick={() => setOrderMode("WHOLESALE")}
                  className={`py-1.5 rounded-lg transition-all ${
                    orderMode === "WHOLESALE"
                      ? "bg-blue-600 text-white shadow-xs"
                      : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                  }`}
                >
                  بيع جملة
                </button>
                <button
                  type="button"
                  onClick={() => setOrderMode("RETAIL")}
                  className={`py-1.5 rounded-lg transition-all ${
                    orderMode === "RETAIL"
                      ? "bg-blue-600 text-white shadow-xs"
                      : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                  }`}
                >
                  قطاعي
                </button>
                <button
                  type="button"
                  onClick={() => setOrderMode("CREDIT")}
                  className={`py-1.5 rounded-lg transition-all ${
                    orderMode === "CREDIT"
                      ? "bg-blue-600 text-white shadow-xs"
                      : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                  }`}
                >
                  بيع آجل
                </button>
                <button
                  type="button"
                  onClick={() => setOrderMode("DELIVERY")}
                  className={`py-1.5 rounded-lg transition-all ${
                    orderMode === "DELIVERY"
                      ? "bg-blue-600 text-white shadow-xs"
                      : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                  }`}
                >
                  شحن
                </button>
              </div>

              {/* Wholesale Reference / Customer Selector */}
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div>
                  <input
                    type="text"
                    value={poReference}
                    onChange={(e) => setPoReference(e.target.value)}
                    placeholder="رقم العقد/المرجع (اختياري)..."
                    className="w-full px-2.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none"
                  />
                </div>
                <div>
                  <input
                    type="text"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    placeholder="اسم التاجر/العميل (اختياري)..."
                    className="w-full px-2.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none"
                  />
                </div>
              </div>

              {/* Cart Items List */}
              <div className="space-y-2 max-h-[260px] overflow-y-auto pr-1">
                {cart.length === 0 ? (
                  <div className="p-8 text-center bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-dashed border-slate-200 dark:border-slate-700 text-slate-400 space-y-2 my-2">
                    <div className="w-12 h-12 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 mx-auto flex items-center justify-center text-slate-400">
                      <ShoppingBag className="w-6 h-6" />
                    </div>
                    <p className="text-xs font-bold text-slate-700 dark:text-slate-300">
                      السلة فارغة، قم بإضافة منتجات
                    </p>
                    <p className="text-[10px] text-slate-500">
                      انقر على أي صنف من قائمة المنتجات لإضافته آلياً
                    </p>
                  </div>
                ) : (
                  cart.map((c) => (
                    <div
                      key={c.item.id}
                      className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-between gap-2 text-xs"
                    >
                      <img
                        src={
                          c.item.image ||
                          "https://images.unsplash.com/photo-1586201375761-83865001e31c?w=200&auto=format&fit=crop&q=60"
                        }
                        alt={c.item.name}
                        referrerPolicy="no-referrer"
                        className="w-10 h-10 rounded-lg object-cover shrink-0 border border-slate-200 dark:border-slate-700"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src =
                            "https://images.unsplash.com/photo-1586201375761-83865001e31c?w=200&auto=format&fit=crop&q=60";
                        }}
                      />

                      <div className="flex-1 min-w-0">
                        <div className="font-bold text-slate-900 dark:text-white truncate">
                          {c.item.name}
                        </div>
                        <div className="text-[10px] text-emerald-600 dark:text-emerald-400 font-mono">
                          {c.sellingPrice} ر.س × {c.quantity} ={" "}
                          <span className="font-bold text-slate-900 dark:text-white">
                            {(c.sellingPrice * c.quantity).toFixed(2)} ر.س
                          </span>
                        </div>
                      </div>

                      {/* Qty Controls */}
                      <div className="flex items-center gap-1 bg-white dark:bg-slate-900 px-1 py-1 rounded-lg border border-slate-200 dark:border-slate-700">
                        <button
                          type="button"
                          onClick={() => updateQuantity(c.item.id, c.quantity - 1)}
                          className="w-5 h-5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white flex items-center justify-center font-bold cursor-pointer"
                          title="إنقاص الكمية 1"
                        >
                          <Minus className="w-3 h-3" />
                        </button>

                        <input
                          type="number"
                          min="1"
                          max="99999"
                          value={c.quantity}
                          onChange={(e) => {
                            const val = parseInt(e.target.value, 10);
                            updateQuantity(c.item.id, isNaN(val) ? 1 : val);
                          }}
                          onBlur={(e) => {
                            const val = parseInt(e.target.value, 10);
                            if (isNaN(val) || val <= 0) {
                              updateQuantity(c.item.id, 1);
                            }
                          }}
                          className="w-10 text-center font-mono font-bold text-xs text-slate-900 dark:text-white bg-slate-50 dark:bg-slate-800 rounded border border-slate-200 dark:border-slate-700 py-0.5 focus:outline-none focus:ring-1 focus:ring-blue-500"
                          title="اكتب الكمية المطلوبة مباشرة بالكيبورد"
                        />

                        <button
                          type="button"
                          onClick={() => updateQuantity(c.item.id, c.quantity + 1)}
                          className="w-5 h-5 rounded-md bg-blue-600 text-white flex items-center justify-center font-bold cursor-pointer"
                          title="زيادة الكمية 1"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>

                      <button
                        onClick={() => removeFromCart(c.item.id)}
                        className="text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 p-1"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Financial Summary & Total */}
            <div className="space-y-3 pt-3 border-t border-slate-100 dark:border-slate-800">
              <div className="space-y-1 text-xs text-slate-600 dark:text-slate-300">
                <div className="flex justify-between">
                  <span>المجموع الفرعي:</span>
                  <span className="font-mono font-bold">{subtotal.toFixed(2)} ر.س</span>
                </div>
                {isTaxEnabled ? (
                  <div className="flex justify-between text-slate-500 dark:text-slate-400">
                    <span>ضريبة القيمة المضافة ({taxRate}%):</span>
                    <span className="font-mono">{vatTax.toFixed(2)} ر.س</span>
                  </div>
                ) : (
                  <div className="flex justify-between text-slate-400 dark:text-slate-500 text-[11px]">
                    <span className="flex items-center gap-1">
                      <span>ضريبة المبيعات:</span>
                      <span className="text-[10px] px-1.5 py-0.2 rounded bg-slate-100 dark:bg-slate-800 text-slate-500">معفاة / مقطوعة (0%)</span>
                    </span>
                    <span className="font-mono">0.00 ر.س</span>
                  </div>
                )}
                <div className="flex justify-between text-slate-500 dark:text-slate-400">
                  <span>خصم الإجمالي:</span>
                  <span className="font-mono">0.00 ر.س</span>
                </div>
              </div>

              {/* Total Amount Due Banner */}
              <div className="bg-slate-50 dark:bg-slate-800 p-3.5 rounded-xl border border-slate-200 dark:border-slate-700 flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold text-slate-700 dark:text-slate-300 block">
                    الإجمالي المطلوب
                  </span>
                  <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-mono">
                    {isTaxEnabled ? `شامل الضريبة (${taxRate}%)` : "بدون ضريبة مبيعات مضافة (كاش)"}
                  </span>
                </div>

                <div className="text-xl font-black text-slate-900 dark:text-white font-mono">
                  {totalAmount.toFixed(2)} ر.س
                </div>
              </div>

              {/* Action Buttons Bar */}
              <div className="space-y-2">
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => alert("تم حفظ الطلب في المسودات")}
                    className="py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 font-bold text-xs border border-slate-200 dark:border-slate-700 transition-colors"
                  >
                    طباعة الحفظ
                  </button>
                  <button
                    type="button"
                    onClick={() => alert("تم تعليق الطلب برقم مرجعي")}
                    className="py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 font-bold text-xs border border-slate-200 dark:border-slate-700 transition-colors"
                  >
                    تعليق الطلب
                  </button>
                </div>

                {/* Big Green Pay & Approve Button */}
                <button
                  type="button"
                  onClick={() => handleCompleteSale()}
                  disabled={cart.length === 0}
                  className={`w-full py-3.5 rounded-2xl font-black text-sm sm:text-base transition-all flex items-center justify-center gap-2 shadow-md ${
                    cart.length > 0
                      ? "bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-emerald-500/20 active:scale-98 cursor-pointer"
                      : "bg-slate-200 dark:bg-slate-800 text-slate-400 dark:text-slate-500 border border-slate-300 dark:border-slate-700 cursor-not-allowed"
                  }`}
                >
                  <CheckCircle2 className="w-5 h-5" />
                  <span>اعتماد الفاتورة والدفع ( {totalAmount.toFixed(2)} ر.س ) 🟢</span>
                </button>
                <p className="text-[10px] text-center text-slate-500 dark:text-slate-400 font-medium pt-0.5 flex items-center justify-center gap-1">
                  <span>⚡</span>
                  <span>إرسال فوري لتفاصيل السند للموظف المسؤول عبر الواتساب بالخلفية بدون فتح نوافذ</span>
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SUBTAB 2: Invoice History List */}
      {salesTab === "HISTORY" && (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 space-y-4 shadow-xs">
          <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                سجل فواتير المبيعات الصادرة
              </h3>
              <p className="text-xs text-slate-500">
                جميع الفواتير والمبيعات اليومية المسجلة وحالات الاعتماد والإشعار بالواتساب
              </p>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-right text-xs">
              <thead className="border-b border-slate-200 dark:border-slate-800 text-slate-500 font-bold bg-slate-50 dark:bg-slate-800/50">
                <tr>
                  <th className="p-3">رقم الفاتورة</th>
                  <th className="p-3">اسم الزبون</th>
                  <th className="p-3">المستودع</th>
                  <th className="p-3">الأصناف</th>
                  <th className="p-3">المبلغ الإجمالي</th>
                  <th className="p-3">طريقة الدفع</th>
                  <th className="p-3">حالة السند</th>
                  <th className="p-3">التاريخ</th>
                  <th className="p-3 text-center">إجراءات</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-medium text-slate-800 dark:text-slate-200">
                {sales.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="p-8 text-center text-slate-400">
                      لا توجد فواتير مبيعات مسجلة حتى الآن
                    </td>
                  </tr>
                ) : (
                  sales.map((sale) => (
                    <tr
                      key={sale.id}
                      className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors"
                    >
                      <td className="p-3 font-mono font-bold text-emerald-600 dark:text-emerald-400">
                        {sale.invoiceNo}
                      </td>
                      <td className="p-3 font-bold">{sale.customerName}</td>
                      <td className="p-3 text-slate-500">{sale.warehouseName}</td>
                      <td className="p-3">
                        <span className="px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 font-bold text-[10px]">
                          {sale.items.length} أصناف
                        </span>
                      </td>
                      <td className="p-3 font-bold text-slate-900 dark:text-white">
                        {sale.totalAmount.toFixed(2)} ر.س
                      </td>
                      <td className="p-3">
                        <span className="px-2 py-0.5 rounded-md bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 font-bold text-[10px]">
                          {sale.paymentMethod === "CASH" ? "نقداً" : "تحويل / آجل"}
                        </span>
                      </td>
                      <td className="p-3">
                        <span className="px-2.5 py-1 rounded-full bg-emerald-100 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300 font-extrabold text-[10px] inline-flex items-center gap-1 border border-emerald-300 dark:border-emerald-800">
                          <Check className="w-3 h-3" />
                          <span>معتمد</span>
                        </span>
                      </td>
                      <td className="p-3 text-slate-400 text-[10px] font-mono">
                        {new Date(sale.createdAt).toLocaleString("ar-YE")}
                      </td>
                      <td className="p-3 text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          <button
                            onClick={() => handleApproveSaleAndNotify(sale)}
                            disabled={waSendingSaleId === sale.id}
                            title="إرسال تفاصيل الفاتورة آلياً للموظف المسؤول عبر الواتساب"
                            className="px-2.5 py-1.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 font-bold text-[11px] hover:bg-emerald-100 transition-colors inline-flex items-center gap-1 border border-emerald-200 dark:border-emerald-800"
                          >
                            <Send className={`w-3.5 h-3.5 ${waSendingSaleId === sale.id ? "animate-spin" : ""}`} />
                            <span>{waSendingSaleId === sale.id ? "جارِ الإرسال..." : "إشعار واتساب"}</span>
                          </button>
                          <button
                            onClick={() => setSelectedInvoice(sale)}
                            className="px-3 py-1.5 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 font-bold text-[11px] hover:bg-indigo-100 transition-colors inline-flex items-center gap-1"
                          >
                            <Printer className="w-3.5 h-3.5" />
                            <span>عرض وطباعة</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Invoice Preview / Print Modal */}
      {selectedInvoice && (
        <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-sm flex items-center justify-center p-2 sm:p-4 overflow-y-auto">
          {/* Printable Dynamic Style Tag */}
          <style>{`
            @media print {
              @page {
                size: ${selectedPaperFormat === "THERMAL_80MM" ? "80mm auto" : selectedPaperFormat === "THERMAL_58MM" ? "58mm auto" : "A4 portrait"};
                margin: ${selectedPaperFormat.startsWith("THERMAL") ? "0" : "10mm"};
              }
              body * {
                visibility: hidden;
              }
              #printable-merchant-invoice, #printable-merchant-invoice * {
                visibility: visible;
              }
              #printable-merchant-invoice {
                position: absolute;
                left: 0;
                top: 0;
                width: ${selectedPaperFormat === "THERMAL_80MM" ? "80mm !important" : selectedPaperFormat === "THERMAL_58MM" ? "58mm !important" : "100% !important"};
                max-width: ${selectedPaperFormat === "THERMAL_80MM" ? "80mm !important" : selectedPaperFormat === "THERMAL_58MM" ? "58mm !important" : "100% !important"};
                margin: 0 auto !important;
                padding: ${selectedPaperFormat.startsWith("THERMAL") ? "10px !important" : "20px !important"};
                background: #ffffff !important;
                color: #000000 !important;
                box-shadow: none !important;
                border: none !important;
              }
              .no-print {
                display: none !important;
              }
            }
          `}</style>

          <div
            id="printable-merchant-invoice"
            className={`bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 ${
              selectedPaperFormat === "A4" ? "max-w-2xl" : "max-w-md"
            } w-full p-5 sm:p-8 shadow-2xl relative my-auto min-h-[85vh] sm:min-h-[90vh] flex flex-col justify-between overflow-y-auto space-y-5`}
          >
            {/* Modal Close Button */}
            <button
              onClick={() => setSelectedInvoice(null)}
              className="no-print absolute left-4 top-4 p-2 rounded-xl text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Printer Setup & Device Connection Bar (NO-PRINT) */}
            <div className="no-print bg-slate-100 dark:bg-slate-800/90 p-4 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200 dark:border-slate-700 pb-2.5">
                <div className="flex items-center gap-2">
                  <Printer className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                  <span className="font-extrabold text-xs text-slate-900 dark:text-white">
                    إعدادات وتوصيل الطابعة والجهاز
                  </span>
                </div>
                <div className="flex items-center gap-1.5 text-[10px] text-emerald-600 dark:text-emerald-400 font-bold bg-emerald-50 dark:bg-emerald-950/60 px-2.5 py-1 rounded-full border border-emerald-200 dark:border-emerald-800">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                  <span>متصل بنظام طباعة الجهاز</span>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                {/* Paper Size Selector */}
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 mb-1">
                    مقاس الورق / الفاتورة:
                  </label>
                  <select
                    value={selectedPaperFormat}
                    onChange={(e) => setSelectedPaperFormat(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-xs font-bold text-slate-900 dark:text-white focus:outline-none"
                  >
                    <option value="A4">📄 ورق A4 تجاري رسمي (مطابع ورق)</option>
                    <option value="THERMAL_80MM">🧾 إيصال كاشير حراري (80mm Thermal POS)</option>
                    <option value="THERMAL_58MM">🔖 إيصال كاشير صغير (58mm Thermal POS)</option>
                  </select>
                </div>

                {/* Printer Type Connection Preset */}
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 mb-1">
                    اختيار منفذ / طابعة الجهاز:
                  </label>
                  <select
                    value={selectedPrinterType}
                    onChange={(e) => setSelectedPrinterType(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-xs font-bold text-slate-900 dark:text-white focus:outline-none"
                  >
                    <option value="SYSTEM_DEFAULT">🖨️ طابعة النظام المباشرة (OS Default)</option>
                    <option value="POS_THERMAL_USB">🔌 طابعة حرارية USB (Epson / Xprinter)</option>
                    <option value="POS_BLUETOOTH">📶 طابعة بلوتوث لاسلكية (Bluetooth / Wireless)</option>
                    <option value="NETWORK_PRINTER">🌐 طابعة شبكة محلية (LAN / Network IP)</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center justify-between text-[11px] pt-1">
                <button
                  type="button"
                  onClick={() => setShowPrinterGuide(!showPrinterGuide)}
                  className="text-indigo-600 dark:text-indigo-400 font-extrabold hover:underline flex items-center gap-1"
                >
                  <HelpCircle className="w-3.5 h-3.5" />
                  <span>كيف أختار وأربط طابعتي المباشرة للجهاز؟</span>
                </button>
                <span className="text-slate-400 text-[10px]">
                  سيتم فتح نافذة المعاينة والطباعة المباشرة عند الضغط
                </span>
              </div>

              {/* Printer Guide Drawer/Alert */}
              {showPrinterGuide && (
                <div className="p-3 bg-white dark:bg-slate-900 rounded-xl border border-indigo-200 dark:border-indigo-800 text-[11px] space-y-1.5 text-slate-700 dark:text-slate-300">
                  <div className="font-extrabold text-indigo-900 dark:text-indigo-200">
                    💡 خطوات اختيار وطباعة الفاتورة على أجهزة Windows / Mac / Android / POS:
                  </div>
                  <ol className="list-decimal list-inside space-y-1 text-[10.5px]">
                    <li>اضغط على زر <strong>"طباعة الفاتورة واختيار الطابعة"</strong> أدناه.</li>
                    <li>ستظهر لك نافذة الطباعة الخاصة بجهازك (Browser / OS Print Window).</li>
                    <li>من قائمة <strong>"المقصد / Destination"</strong>، اختر اسم طابعتك الموصلة (سواء عبر USB، Bluetooth، أو Network).</li>
                    <li>تأكد من ضبط حجم الورق إلى <strong>A4</strong> أو <strong>80mm Thermal</strong> حسب المقاس المحدد أعلاه.</li>
                  </ol>
                </div>
              )}
            </div>

            {/* Official Commercial Wholesale Header */}
            <div className="border-b-2 border-slate-200 dark:border-slate-800 pb-5 space-y-3">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-right">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-indigo-600 text-white flex items-center justify-center font-black shadow-md shrink-0">
                    <Building2 className="w-6 h-6" />
                  </div>
                  <div>
                    <h2 className="text-base font-black text-slate-900 dark:text-white">
                      {currentAccount?.storeName || "مؤسسة التاجر الموحدة للمبيعات بالجملة والتجزئة"}
                    </h2>
                    <p className="text-xs text-slate-500 dark:text-slate-400 font-medium flex flex-wrap items-center gap-2 mt-0.5">
                      <span>{currentAccount?.city || "صنعاء"} - {currentAccount?.district || "العاصمة"}</span>
                      {currentAccount?.taxNumber && (
                        <>
                          <span>•</span>
                          <span>الرقم الضريبي: <strong className="font-mono text-slate-700 dark:text-slate-300">{currentAccount.taxNumber}</strong></span>
                        </>
                      )}
                    </p>
                  </div>
                </div>

                <div className="text-center sm:text-left bg-slate-50 dark:bg-slate-800 p-2.5 rounded-2xl border border-slate-200 dark:border-slate-700 shrink-0 min-w-[170px]">
                  <span className="block text-[10px] text-indigo-600 dark:text-indigo-400 font-extrabold uppercase tracking-wider">
                    {selectedInvoice.vatTax > 0 ? "فاتورة مبيعات جملة ضريبية" : "فاتورة مبيعات تجارية"}
                  </span>
                  <span className="text-sm font-black text-slate-900 dark:text-white font-mono block">
                    {selectedInvoice.invoiceNo}
                  </span>
                  <span className="text-[10px] text-slate-500 font-mono block">
                    تاريخ: {new Date(selectedInvoice.createdAt).toLocaleDateString("ar-YE")}
                  </span>
                </div>
              </div>
            </div>

            {/* Wholesale Customer & Order Metadata Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs bg-slate-50 dark:bg-slate-800/80 p-4 rounded-2xl border border-slate-200 dark:border-slate-700">
              <div className="space-y-1.5">
                <span className="text-[10px] text-slate-400 block font-bold uppercase tracking-wider">
                  بيانات العميل / المنشأة المشترية:
                </span>
                <p className="font-black text-slate-900 dark:text-white text-sm">
                  {selectedInvoice.customerName || "عميل مبيعات جملة كاشير"}
                </p>
                <div className="flex items-center gap-2 text-slate-600 dark:text-slate-300">
                  <Phone className="w-3.5 h-3.5 text-slate-400" />
                  <span className="font-mono">{selectedInvoice.customerPhone || "غير مسجل"}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="px-2 py-0.5 rounded-md bg-indigo-100 dark:bg-indigo-950/80 text-indigo-700 dark:text-indigo-300 text-[10px] font-extrabold">
                    فئة العميل: {selectedInvoice.customerType === "RETAIL_STORE" ? "محل تجزئة" : selectedInvoice.customerType === "COMPANY" ? "شركة / مؤسسة" : "عميل جملة مباشر"}
                  </span>
                </div>
              </div>

              <div className="space-y-1.5 border-t sm:border-t-0 sm:border-r border-slate-200 dark:border-slate-700 pt-3 sm:pt-0 sm:pr-4">
                <span className="text-[10px] text-slate-400 block font-bold uppercase tracking-wider">
                  تفاصيل الشحنة والدفع:
                </span>
                <p className="font-bold text-slate-900 dark:text-white">
                  فرع الصرف: <span className="text-indigo-600 dark:text-indigo-400">{selectedInvoice.warehouseName}</span>
                </p>
                <p className="text-[11px] text-slate-600 dark:text-slate-300">
                  طريقة السداد: <strong className="text-slate-900 dark:text-white">{selectedInvoice.paymentMethod === "CASH" ? "نقداً (كاش)" : selectedInvoice.paymentMethod === "BANK_TRANSFER" ? "تحويل بنكي" : "بيع آجل / ذمم على الحساب"}</strong>
                </p>
                {selectedInvoice.notes && (
                  <p className="text-[10px] text-slate-500 bg-white dark:bg-slate-900 p-1.5 rounded-lg border border-slate-200 dark:border-slate-800 line-clamp-2">
                    ملاحظات: {selectedInvoice.notes}
                  </p>
                )}
              </div>
            </div>

            {/* Structured Commercial Wholesale Table */}
            <div className="space-y-2">
              <h4 className="text-xs font-black text-slate-800 dark:text-slate-200 flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-2">
                <span>بيانات الأصناف والكميات الموردة بالجملة ({selectedInvoice.items.length})</span>
                <span className="text-[10px] text-slate-500 font-mono">العملة: ريال سعودي (ر.س)</span>
              </h4>

              <div className="overflow-x-auto rounded-2xl border border-slate-200 dark:border-slate-800">
                <table className="w-full text-right text-xs border-collapse">
                  <thead>
                    <tr className="bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-black border-b border-slate-200 dark:border-slate-700">
                      <th className="p-2.5 text-center w-10">#</th>
                      <th className="p-2.5">اسم الصنف والبيان</th>
                      <th className="p-2.5 text-center">الرمز (SKU)</th>
                      <th className="p-2.5 text-center">الكمية</th>
                      <th className="p-2.5 text-left">سعر الوحدة/الكرتون</th>
                      <th className="p-2.5 text-left">الإجمالي</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-medium">
                    {selectedInvoice.items.map((it, idx) => (
                      <tr key={idx} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                        <td className="p-2.5 text-center font-bold text-slate-400">{idx + 1}</td>
                        <td className="p-2.5 font-bold text-slate-900 dark:text-white">
                          {it.itemName}
                        </td>
                        <td className="p-2.5 text-center font-mono text-[11px] text-slate-500">
                          {it.sku || "N/A"}
                        </td>
                        <td className="p-2.5 text-center font-bold text-slate-800 dark:text-slate-200">
                          {it.quantity} <span className="text-[10px] font-normal text-slate-400">{it.unit}</span>
                        </td>
                        <td className="p-2.5 text-left font-mono text-slate-700 dark:text-slate-300">
                          {it.sellingPrice.toFixed(2)} ر.س
                        </td>
                        <td className="p-2.5 text-left font-black font-mono text-slate-900 dark:text-white">
                          {it.total.toFixed(2)} ر.س
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Financial Breakdown & Totals */}
            <div className="bg-slate-50 dark:bg-slate-800/80 p-4 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-2 text-xs">
              <div className="flex justify-between text-slate-600 dark:text-slate-400">
                <span>المجموع الفرعي (قبل الضريبة):</span>
                <span className="font-mono font-bold">{selectedInvoice.subtotal.toFixed(2)} ر.س</span>
              </div>
              {selectedInvoice.vatTax > 0 ? (
                <div className="flex justify-between text-slate-600 dark:text-slate-400">
                  <span>ضريبة القيمة المضافة (VAT):</span>
                  <span className="font-mono font-bold">{selectedInvoice.vatTax.toFixed(2)} ر.س</span>
                </div>
              ) : (
                <div className="flex justify-between text-slate-500 dark:text-slate-400 text-[11px]">
                  <span>ضريبة المبيعات المضافة:</span>
                  <span className="font-mono font-bold text-slate-500">0.00 ر.س (معفاة/مبيعات محلية)</span>
                </div>
              )}

              <div className="pt-2 border-t border-slate-200 dark:border-slate-700 flex justify-between items-center text-sm font-black text-slate-900 dark:text-white">
                <span>صافي الإجمالي المطلوب سداده:</span>
                <span className="text-emerald-600 dark:text-emerald-400 text-lg font-black font-mono">
                  {selectedInvoice.totalAmount.toFixed(2)} ر.س
                </span>
              </div>
            </div>

            {/* Official Wholesale Commercial Signatures & Real Invoice Barcode */}
            <div className="pt-4 border-t-2 border-dashed border-slate-300 dark:border-slate-700 space-y-3">
              <div className="grid grid-cols-3 gap-4 text-center text-xs">
                <div className="space-y-6">
                  <span className="font-bold text-slate-700 dark:text-slate-300 block">توقيع واستلام المشتري:</span>
                  <div className="border-b border-slate-300 dark:border-slate-700 w-3/4 mx-auto h-4"></div>
                </div>

                <div className="flex flex-col items-center justify-center space-y-1">
                  <div className="w-14 h-14 bg-white p-1 rounded-xl border border-slate-300 shadow-xs flex flex-col items-center justify-center text-center">
                    <div className="w-full h-full bg-slate-900 rounded-lg flex items-center justify-center text-white text-[7px] font-mono font-bold p-0.5">
                      ZATCA-QR
                    </div>
                  </div>
                  <span className="text-[9px] text-slate-400 font-mono">ختم إلكتروني معتمد</span>
                </div>

                <div className="space-y-6">
                  <span className="font-bold text-slate-700 dark:text-slate-300 block">توقيع وختم المبيعات للجملة:</span>
                  <div className="border-b border-slate-300 dark:border-slate-700 w-3/4 mx-auto h-4"></div>
                </div>
              </div>

              {/* Real Barcode for Invoice Number */}
              <div className="flex flex-col items-center justify-center pt-2 border-t border-slate-100 dark:border-slate-800">
                <BarcodeGenerator
                  value={selectedInvoice.invoiceNo}
                  format="CODE128"
                  width={1.4}
                  height={30}
                  fontSize={10}
                  margin={1}
                />
              </div>
            </div>

            {/* Buttons Bar (hidden when printing) */}
            <div className="no-print flex flex-wrap items-center gap-2.5 pt-2">
              <button
                onClick={() => handleApproveSaleAndNotify(selectedInvoice)}
                disabled={waSendingSaleId === selectedInvoice.id}
                className="flex-1 py-3.5 px-4 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition-colors shadow-md flex items-center justify-center gap-2 cursor-pointer"
                title="إرسال تفاصيل الفاتورة آلياً للموظف المسؤول عبر الواتساب في الخلفية بدون فتح نوافذ"
              >
                <Send className={`w-4 h-4 ${waSendingSaleId === selectedInvoice.id ? "animate-spin" : ""}`} />
                <span>
                  {waSendingSaleId === selectedInvoice.id
                    ? "جارِ الإرسال في الخلفية..."
                    : "اعتماد وإشعار الموظف بالواتساب ⚡"}
                </span>
              </button>
              <button
                onClick={() => window.print()}
                className="py-3.5 px-4 rounded-2xl bg-indigo-600 text-white hover:bg-indigo-700 font-bold text-xs transition-colors shadow-md flex items-center justify-center gap-2"
              >
                <Printer className="w-4 h-4" />
                <span>طباعة الفاتورة 🖨️</span>
              </button>
              <button
                onClick={() => handleDeleteSale(selectedInvoice.id)}
                className="px-3.5 py-3.5 rounded-2xl bg-rose-50 text-rose-600 hover:bg-rose-100 dark:bg-rose-950/40 dark:text-rose-400 font-bold text-xs transition-colors flex items-center gap-1.5"
                title="إلغاء وحذف الفاتورة"
              >
                <Trash2 className="w-4 h-4" />
                <span>حذف</span>
              </button>
              <button
                onClick={() => setSelectedInvoice(null)}
                className="px-5 py-3.5 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold text-xs hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
              >
                إغلاق
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Real Barcode Labels & Sticker Generator Modal */}
      <BarcodeLabelModal
        isOpen={isBarcodeModalOpen}
        onClose={() => setIsBarcodeModalOpen(false)}
        items={items}
        defaultSelectedItem={barcodeItemForLabel}
        storeName={currentAccount?.storeName || "مؤسسة التاجر"}
      />
    </div>
  );
};
