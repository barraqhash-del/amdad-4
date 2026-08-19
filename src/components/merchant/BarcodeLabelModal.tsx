import React, { useState } from "react";
import { MerchantItem } from "../../types";
import { BarcodeGenerator } from "../common/BarcodeGenerator";
import {
  Printer,
  X,
  Sliders,
  Check,
  Building2,
  Tag,
  Copy,
  Layers,
  Settings2,
  Grid,
  FileText,
  RotateCcw,
  Sparkles,
  HelpCircle
} from "lucide-react";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  items: MerchantItem[];
  defaultSelectedItem?: MerchantItem | null;
  storeName?: string;
}

export const BarcodeLabelModal: React.FC<Props> = ({
  isOpen,
  onClose,
  items,
  defaultSelectedItem,
  storeName = "مؤسسة إمداد التجارية",
}) => {
  // Selection mode: single item or multiple items
  const [selectedItemId, setSelectedItemId] = useState<string>(() => {
    return defaultSelectedItem?.id || items[0]?.id || "";
  });

  // Label settings
  const [copies, setCopies] = useState<number>(6);
  const [labelTemplate, setLabelTemplate] = useState<
    "THERMAL_50X30" | "THERMAL_38X25" | "THERMAL_60X40" | "A4_SHEET_24" | "SHELF_TAG"
  >("THERMAL_50X30");

  const [barcodeFormat, setBarcodeFormat] = useState<"CODE128" | "EAN13" | "UPC" | "CODE39">("CODE128");
  const [showStoreName, setShowStoreName] = useState(true);
  const [showProductName, setShowProductName] = useState(true);
  const [showPrice, setShowPrice] = useState(true);
  const [showSkuText, setShowSkuText] = useState(true);
  const [showCategory, setShowCategory] = useState(false);
  const [showCurrency, setShowCurrency] = useState(true);
  const [customHeader, setCustomHeader] = useState("");
  const [showGuide, setShowGuide] = useState(false);

  if (!isOpen) return null;

  const currentItem = items.find((i) => i.id === selectedItemId) || items[0];
  const itemSku = currentItem?.sku || "SKU-1001";
  const effectiveStoreName = customHeader.trim() || storeName;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-sm flex items-center justify-center p-2 sm:p-4 overflow-y-auto">
      {/* Print Specific CSS for Label Stickers & A4 Sheets */}
      <style>{`
        @media print {
          @page {
            ${
              labelTemplate === "THERMAL_50X30"
                ? "size: 50mm 30mm; margin: 0;"
                : labelTemplate === "THERMAL_38X25"
                ? "size: 38mm 25mm; margin: 0;"
                : labelTemplate === "THERMAL_60X40"
                ? "size: 60mm 40mm; margin: 0;"
                : labelTemplate === "SHELF_TAG"
                ? "size: 70mm 35mm; margin: 0;"
                : "size: A4 portrait; margin: 8mm;"
            }
          }
          body * {
            visibility: hidden;
          }
          #printable-barcode-labels-container, #printable-barcode-labels-container * {
            visibility: visible;
          }
          #printable-barcode-labels-container {
            position: absolute;
            left: 0;
            top: 0;
            width: 100% !important;
            margin: 0 !important;
            padding: 0 !important;
            background: #ffffff !important;
            color: #000000 !important;
          }
          .barcode-label-sticker {
            page-break-inside: avoid;
            break-inside: avoid;
          }
          .no-print {
            display: none !important;
          }
        }
      `}</style>

      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 w-full max-w-4xl p-4 sm:p-6 shadow-2xl relative my-auto max-h-[92vh] flex flex-col justify-between overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3.5 no-print">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-600 text-white flex items-center justify-center font-black shadow-md shadow-indigo-600/30">
              <Tag className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-black text-slate-900 dark:text-white">
                  طباعة ملصقات الباركود الحقيقي (Barcode Label Maker)
                </h3>
                <span className="px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 text-[10px] font-bold border border-emerald-300">
                  JsBarcode Engine ⚡
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                توليد وطباعة ملصقات الباركود والأسعار بدقة متوافقة مع طابعات الملصقات الحرارية وورق A4
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body: Two Column Setup */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 my-4 overflow-y-auto pr-1">
          {/* Left Column: Settings & Controls (lg:col-span-5) */}
          <div className="lg:col-span-5 space-y-4 no-print text-xs">
            {/* Product Selector */}
            <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700 space-y-2">
              <label className="block font-bold text-slate-700 dark:text-slate-300 text-xs">
                اختر الصنف المراد طباعة باركوده:
              </label>
              <select
                value={selectedItemId}
                onChange={(e) => setSelectedItemId(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-xs font-bold text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              >
                {items.map((it) => (
                  <option key={it.id} value={it.id}>
                    {it.name} - ({it.sku}) - {it.sellingPrice} ر.س
                  </option>
                ))}
              </select>

              {currentItem && (
                <div className="p-2 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 flex items-center justify-between text-[11px]">
                  <div>
                    <span className="text-slate-500 block">رمز SKU الحالي:</span>
                    <strong className="font-mono text-indigo-600 dark:text-indigo-400 text-xs">
                      {currentItem.sku}
                    </strong>
                  </div>
                  <div className="text-left">
                    <span className="text-slate-500 block">سعر البيع:</span>
                    <strong className="font-mono text-emerald-600 dark:text-emerald-400 text-xs">
                      {currentItem.sellingPrice} ر.س
                    </strong>
                  </div>
                </div>
              )}
            </div>

            {/* Label Template Selector */}
            <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700 space-y-2">
              <label className="block font-bold text-slate-700 dark:text-slate-300 text-xs">
                مقاس ونموذج الملصق / الاستيكر:
              </label>
              <div className="grid grid-cols-2 gap-2 text-[11px]">
                <button
                  type="button"
                  onClick={() => setLabelTemplate("THERMAL_50X30")}
                  className={`p-2 rounded-xl border font-bold text-right transition-all ${
                    labelTemplate === "THERMAL_50X30"
                      ? "bg-indigo-600 text-white border-indigo-600 shadow-xs"
                      : "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span>حراري 50×30 مم</span>
                    <span className="text-[9px] opacity-80 font-mono">قياسي</span>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setLabelTemplate("THERMAL_38X25")}
                  className={`p-2 rounded-xl border font-bold text-right transition-all ${
                    labelTemplate === "THERMAL_38X25"
                      ? "bg-indigo-600 text-white border-indigo-600 shadow-xs"
                      : "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span>حراري 38×25 مم</span>
                    <span className="text-[9px] opacity-80 font-mono">صغير</span>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setLabelTemplate("THERMAL_60X40")}
                  className={`p-2 rounded-xl border font-bold text-right transition-all ${
                    labelTemplate === "THERMAL_60X40"
                      ? "bg-indigo-600 text-white border-indigo-600 shadow-xs"
                      : "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span>حراري 60×40 مم</span>
                    <span className="text-[9px] opacity-80 font-mono">كبير</span>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setLabelTemplate("SHELF_TAG")}
                  className={`p-2 rounded-xl border font-bold text-right transition-all ${
                    labelTemplate === "SHELF_TAG"
                      ? "bg-indigo-600 text-white border-indigo-600 shadow-xs"
                      : "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span>بطاقة رف ورفوف</span>
                    <span className="text-[9px] opacity-80 font-mono">سعر بارز</span>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setLabelTemplate("A4_SHEET_24")}
                  className={`col-span-2 p-2 rounded-xl border font-bold text-right transition-all ${
                    labelTemplate === "A4_SHEET_24"
                      ? "bg-indigo-600 text-white border-indigo-600 shadow-xs"
                      : "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span>ورقة A4 كاملة (شبكة 24 ملصق - 3 أعمدة × 8 صفوف)</span>
                    <span className="text-[9px] opacity-80 font-mono">A4 Sheet</span>
                  </div>
                </button>
              </div>
            </div>

            {/* Copies & Content Toggles */}
            <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700 space-y-3">
              <div className="flex items-center justify-between">
                <label className="font-bold text-slate-700 dark:text-slate-300 text-xs">
                  عدد الملصقات للطباعة:
                </label>
                <div className="flex items-center gap-1.5">
                  {[1, 6, 12, 24].map((num) => (
                    <button
                      key={num}
                      type="button"
                      onClick={() => setCopies(num)}
                      className={`px-2.5 py-1 rounded-lg font-mono text-xs font-bold border transition-colors ${
                        copies === num
                          ? "bg-indigo-600 text-white border-indigo-600"
                          : "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300"
                      }`}
                    >
                      {num}
                    </button>
                  ))}
                  <input
                    type="number"
                    min="1"
                    max="120"
                    value={copies}
                    onChange={(e) => setCopies(Math.max(1, parseInt(e.target.value) || 1))}
                    className="w-14 px-2 py-1 rounded-lg bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-center font-mono font-bold text-xs"
                  />
                </div>
              </div>

              {/* Barcode format */}
              <div className="grid grid-cols-2 gap-2 pt-1 border-t border-slate-200 dark:border-slate-700">
                <div>
                  <label className="block text-[11px] font-bold text-slate-500 mb-1">
                    ترميز الباركود:
                  </label>
                  <select
                    value={barcodeFormat}
                    onChange={(e) => setBarcodeFormat(e.target.value as any)}
                    className="w-full px-2 py-1.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-[11px] font-bold"
                  >
                    <option value="CODE128">CODE128 (شامل لجميع الرموز)</option>
                    <option value="EAN13">EAN13 (13 رقم دولي)</option>
                    <option value="UPC">UPC (12 رقم)</option>
                    <option value="CODE39">CODE39 (حروف وأرقام)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-500 mb-1">
                    عنوان المتجر أعلى الملصق:
                  </label>
                  <input
                    type="text"
                    value={customHeader}
                    onChange={(e) => setCustomHeader(e.target.value)}
                    placeholder={storeName}
                    className="w-full px-2 py-1.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-[11px]"
                  />
                </div>
              </div>

              {/* Checkbox options */}
              <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-200 dark:border-slate-700 text-[11px] font-medium text-slate-700 dark:text-slate-300">
                <label className="flex items-center gap-1.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={showStoreName}
                    onChange={(e) => setShowStoreName(e.target.checked)}
                    className="rounded text-indigo-600 focus:ring-indigo-500"
                  />
                  <span>اسم المتجر</span>
                </label>

                <label className="flex items-center gap-1.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={showProductName}
                    onChange={(e) => setShowProductName(e.target.checked)}
                    className="rounded text-indigo-600 focus:ring-indigo-500"
                  />
                  <span>اسم الصنف</span>
                </label>

                <label className="flex items-center gap-1.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={showPrice}
                    onChange={(e) => setShowPrice(e.target.checked)}
                    className="rounded text-indigo-600 focus:ring-indigo-500"
                  />
                  <span>السعر بالريال</span>
                </label>

                <label className="flex items-center gap-1.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={showSkuText}
                    onChange={(e) => setShowSkuText(e.target.checked)}
                    className="rounded text-indigo-600 focus:ring-indigo-500"
                  />
                  <span>رقم SKU أسفل الباركود</span>
                </label>
              </div>
            </div>
          </div>

          {/* Right Column: Live Printable Preview (lg:col-span-7) */}
          <div className="lg:col-span-7 flex flex-col space-y-3">
            <div className="flex items-center justify-between no-print text-xs">
              <span className="font-extrabold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-indigo-600" />
                <span>معاينة حية للملصقات المجهزة للطباعة:</span>
              </span>
              <span className="text-[11px] text-slate-400 font-mono">
                المقاس: {labelTemplate} • عدد {copies} ملصقات
              </span>
            </div>

            {/* Printable Container */}
            <div className="flex-1 p-4 bg-slate-100 dark:bg-slate-950/80 rounded-2xl border-2 border-dashed border-slate-300 dark:border-slate-700 overflow-y-auto max-h-[440px]">
              <div
                id="printable-barcode-labels-container"
                className={
                  labelTemplate === "A4_SHEET_24"
                    ? "grid grid-cols-3 gap-2 bg-white p-4"
                    : "flex flex-wrap gap-3 justify-center bg-transparent"
                }
              >
                {Array.from({ length: copies }).map((_, index) => (
                  <div
                    key={index}
                    className={`barcode-label-sticker bg-white text-slate-950 border border-slate-300 rounded-lg p-2.5 flex flex-col items-center justify-between text-center shadow-xs transition-transform ${
                      labelTemplate === "THERMAL_50X30"
                        ? "w-[190px] h-[125px]"
                        : labelTemplate === "THERMAL_38X25"
                        ? "w-[155px] h-[105px] p-1.5"
                        : labelTemplate === "THERMAL_60X40"
                        ? "w-[220px] h-[150px] p-3"
                        : labelTemplate === "SHELF_TAG"
                        ? "w-[240px] h-[130px] p-3 border-2 border-slate-900"
                        : "w-full min-h-[110px]"
                    }`}
                  >
                    {/* Top: Store Name */}
                    {showStoreName && (
                      <div className="w-full text-center border-b border-slate-200 pb-0.5 mb-0.5">
                        <span className="text-[9px] font-black uppercase tracking-wider block truncate text-slate-800">
                          {effectiveStoreName}
                        </span>
                      </div>
                    )}

                    {/* Middle: Product Name */}
                    {showProductName && currentItem && (
                      <div className="w-full text-center font-black text-slate-900 line-clamp-1 leading-tight text-[10px] sm:text-[11px]">
                        {currentItem.name}
                      </div>
                    )}

                    {/* Barcode Visual using JsBarcode Component */}
                    <div className="my-auto flex items-center justify-center w-full overflow-hidden">
                      <BarcodeGenerator
                        value={itemSku}
                        format={barcodeFormat}
                        width={labelTemplate === "THERMAL_38X25" ? 1.2 : 1.5}
                        height={
                          labelTemplate === "THERMAL_38X25"
                            ? 26
                            : labelTemplate === "THERMAL_60X40"
                            ? 42
                            : 32
                        }
                        displayValue={showSkuText}
                        fontSize={9}
                        margin={2}
                        background="#ffffff"
                        lineColor="#000000"
                      />
                    </div>

                    {/* Bottom: Price & SKU / Shelf Info */}
                    <div className="w-full pt-1 border-t border-slate-100 flex items-center justify-between gap-1 text-[10px]">
                      {showPrice && currentItem && (
                        <div className="font-black text-slate-950 font-mono text-xs">
                          {currentItem.sellingPrice.toFixed(2)}{" "}
                          <span className="text-[9px] font-bold">ر.س</span>
                        </div>
                      )}

                      <div className="text-[9px] text-slate-500 font-mono">
                        {currentItem?.unit || "حبة"}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Quick guide toggle */}
            <div className="no-print pt-1 flex items-center justify-between text-[11px] text-slate-500">
              <button
                type="button"
                onClick={() => setShowGuide(!showGuide)}
                className="text-indigo-600 dark:text-indigo-400 font-bold hover:underline flex items-center gap-1"
              >
                <HelpCircle className="w-3.5 h-3.5" />
                <span>كيفية ضبط طابعة الملصقات الحرارية (Xprinter / Zebra)</span>
              </button>
              <span className="text-slate-400">جاهز للطباعة المباشرة 100%</span>
            </div>

            {showGuide && (
              <div className="no-print p-3 bg-indigo-50 dark:bg-indigo-950/40 rounded-xl border border-indigo-200 dark:border-indigo-800 text-[11px] text-indigo-950 dark:text-indigo-200 space-y-1">
                <div className="font-bold">💡 نصائح لطباعة ملصقات الباركود بأعلى جودة:</div>
                <ul className="list-disc list-inside space-y-0.5 text-[10.5px]">
                  <li>في نافذة الطباعة المنبثقة، اختر طابعة الملصقات الحرارية (مثال: Xprinter XP-365B أو Zebra).</li>
                  <li>حدد مقاس الورق (Paper Size) المطابق لبكرة الملصقات لديك (50x30mm أو 38x25mm).</li>
                  <li>تأكد من ضبط الهوامش على <strong>None / بلا هوامش</strong> ومقياس الصفحة على <strong>100%</strong>.</li>
                </ul>
              </div>
            )}
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-between border-t border-slate-100 dark:border-slate-800 pt-3.5 no-print gap-3">
          <div className="text-xs text-slate-500 hidden sm:block">
            سيتم طباعة <strong className="text-indigo-600 font-mono font-bold">{copies}</strong> ملصق باركود للصنف <strong className="text-slate-900 dark:text-white">({currentItem?.name})</strong>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
            <button
              onClick={handlePrint}
              className="px-6 py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-black text-xs transition-all shadow-md shadow-indigo-600/25 flex items-center justify-center gap-2 cursor-pointer active:scale-95 flex-1 sm:flex-initial"
            >
              <Printer className="w-4 h-4" />
              <span>طباعة ملصقات الباركود الآن 🖨️</span>
            </button>

            <button
              onClick={onClose}
              className="px-5 py-3 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold text-xs hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
            >
              إلغاء
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BarcodeLabelModal;
