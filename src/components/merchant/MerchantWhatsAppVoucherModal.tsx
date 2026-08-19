import React, { useState, useRef } from "react";
import { QRCodeSVG } from "qrcode.react";
import { EmployeeVoucher, MerchantAccount } from "../../types";
import { storeService } from "../../services/storeService";
import {
  sendVoucherToEmployee,
  sendVoucherToManager,
  exportVoucherAsImage,
  generateVoucherWhatsAppText,
  getVoucherWhatsAppDirectUrl,
  getVoucherWhatsAppCompactQrUrl,
  openWhatsAppChat,
  dispatchVoucherDirectBackground,
} from "../../services/whatsappService";
import {
  MessageSquare,
  Download,
  Copy,
  Printer,
  X,
  CheckCircle2,
  Share2,
  Building2,
  Receipt,
  User,
  Phone,
  Calendar,
  Clock,
  ShieldCheck,
  CreditCard,
  AlertTriangle,
  Award,
  Sparkles,
  ExternalLink,
  Send,
  FileText,
  QrCode
} from "lucide-react";

interface Props {
  voucher: EmployeeVoucher;
  isOpen: boolean;
  onClose: () => void;
  onSentSuccess?: (msg: string) => void;
}

export const MerchantWhatsAppVoucherModal: React.FC<Props> = ({
  voucher,
  isOpen,
  onClose,
  onSentSuccess,
}) => {
  const [activeTab, setActiveTab] = useState<"CARD_IMAGE" | "TEXT_STATEMENT">("CARD_IMAGE");
  const [customEmpPhone, setCustomEmpPhone] = useState(voucher.employeePhone || "");
  const [customManagerPhone, setCustomManagerPhone] = useState("");
  const [isExporting, setIsExporting] = useState(false);
  const [copiedSuccess, setCopiedSuccess] = useState(false);
  const [storeAccount, setStoreAccount] = useState<MerchantAccount | null>(() =>
    storeService.getCurrentMerchantSession()
  );

  const voucherCardRefId = `voucher-card-${voucher.id}`;

  if (!isOpen) return null;

  const currentManagerPhone =
    customManagerPhone ||
    storeAccount?.whatsAppConfig?.managerPhone ||
    storeAccount?.phone ||
    "771234567";

  const isDisbursement = voucher.type.includes("DISBURSEMENT");
  const isDeduction = voucher.type.includes("DEDUCTION");
  const isBonus = voucher.type.includes("BONUS");

  // Colors & badges according to voucher type
  const themeClasses = isDisbursement
    ? {
        border: "border-emerald-500",
        badgeBg: "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800",
        amountColor: "text-emerald-600 dark:text-emerald-400",
        headerGradient: "from-emerald-700 via-teal-700 to-emerald-800",
        stampBorder: "border-emerald-600 text-emerald-600",
        actionBtn: "bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-600/30",
        icon: <Receipt className="w-5 h-5 text-emerald-400" />,
      }
    : isDeduction
    ? {
        border: "border-rose-500",
        badgeBg: "bg-rose-50 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300 border-rose-200 dark:border-rose-800",
        amountColor: "text-rose-600 dark:text-rose-400",
        headerGradient: "from-rose-700 via-red-700 to-rose-800",
        stampBorder: "border-rose-600 text-rose-600",
        actionBtn: "bg-rose-600 hover:bg-rose-500 text-white shadow-rose-600/30",
        icon: <AlertTriangle className="w-5 h-5 text-rose-400" />,
      }
    : {
        border: "border-amber-500",
        badgeBg: "bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300 border-amber-200 dark:border-amber-800",
        amountColor: "text-amber-600 dark:text-amber-400",
        headerGradient: "from-amber-700 via-orange-700 to-amber-800",
        stampBorder: "border-amber-600 text-amber-600",
        actionBtn: "bg-amber-600 hover:bg-amber-500 text-white shadow-amber-600/30",
        icon: <Award className="w-5 h-5 text-amber-400" />,
      };

  const handleDirectBackgroundSend = async () => {
    setIsExporting(true);
    let imageUrl: string | undefined = undefined;
    try {
      const element = document.getElementById(voucherCardRefId);
      if (element) {
        const { default: html2canvas } = await import("html2canvas");
        const canvas = await html2canvas(element, { scale: 2, useCORS: true, backgroundColor: "#ffffff" });
        imageUrl = canvas.toDataURL("image/png");
      }
    } catch (e) {
      console.warn("Failed to capture voucher image", e);
    } finally {
      setIsExporting(false);
    }
    
    dispatchVoucherDirectBackground(voucher, customEmpPhone, { imageUrl });
    storeService.saveEmployeeVoucher(voucher);
    if (onSentSuccess) {
      onSentSuccess(`تم إرسال السند (النص والصورة) في الخلفية بنجاح للموظف والإدارة ⚡🟢`);
    }
  };

  const handleSendToEmployee = () => {
    sendVoucherToEmployee(voucher, customEmpPhone);
    storeService.saveEmployeeVoucher(voucher);
    if (onSentSuccess) onSentSuccess(`تم فتح واتساب لإرسال السند إلى الموظف (${voucher.employeeName}) بنجاح ✅`);
  };

  const handleSendToManager = () => {
    sendVoucherToManager(voucher, currentManagerPhone);
    storeService.saveEmployeeVoucher(voucher);
    if (onSentSuccess) onSentSuccess(`تم فتح واتساب لإرسال نسخة السند إلى مدير المتجر (${currentManagerPhone}) بنجاح ✅`);
  };

  const handleCopyText = () => {
    const text = generateVoucherWhatsAppText(voucher, storeAccount);
    navigator.clipboard.writeText(text);
    setCopiedSuccess(true);
    setTimeout(() => setCopiedSuccess(false), 2500);
  };

  const handleDownloadImage = async () => {
    setIsExporting(true);
    try {
      const fileName = `${voucher.typeLabelAr}_${voucher.employeeName}_${voucher.voucherNumber}`;
      await exportVoucherAsImage(voucherCardRefId, fileName);
    } finally {
      setIsExporting(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const whatsappFormattedText = generateVoucherWhatsAppText(voucher, storeAccount);

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4 overflow-y-auto animate-fadeIn dir-rtl">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl w-full max-w-3xl text-slate-900 dark:text-white shadow-2xl overflow-hidden my-auto max-h-[96vh] flex flex-col">
        
        {/* Top Header */}
        <div className={`p-4 sm:p-5 bg-gradient-to-r ${themeClasses.headerGradient} text-white flex items-center justify-between shrink-0`}>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center font-bold text-white shadow-xs">
              <MessageSquare className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-mono font-bold bg-black/30 px-2.5 py-0.5 rounded-lg border border-white/20">
                  {voucher.voucherNumber}
                </span>
                <span className="text-xs font-bold text-emerald-200 flex items-center gap-1">
                  <Sparkles className="w-3 h-3" />
                  خدمة واتساب
                </span>
              </div>
              <h3 className="text-base sm:text-lg font-black tracking-tight mt-0.5">
                {voucher.typeLabelAr} - إرسال وتوثيق إلكتروني
              </h3>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* View Toggle Tabs */}
        <div className="bg-slate-50 dark:bg-slate-800/80 px-4 sm:px-6 py-2.5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between gap-3 shrink-0 flex-wrap">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setActiveTab("CARD_IMAGE")}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                activeTab === "CARD_IMAGE"
                  ? "bg-white dark:bg-slate-900 text-blue-600 dark:text-sky-400 shadow-xs font-black border border-slate-200 dark:border-slate-700"
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
              }`}
            >
              <Receipt className="w-3.5 h-3.5" />
              <span>معاينة كرت السند (صورة) 🖼️</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("TEXT_STATEMENT")}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                activeTab === "TEXT_STATEMENT"
                  ? "bg-white dark:bg-slate-900 text-blue-600 dark:text-sky-400 shadow-xs font-black border border-slate-200 dark:border-slate-700"
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
              }`}
            >
              <FileText className="w-3.5 h-3.5" />
              <span>البيان النصي للواتساب 📝</span>
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleDownloadImage}
              disabled={isExporting}
              className="px-3 py-1.5 rounded-xl bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 text-slate-800 dark:text-slate-200 text-xs font-bold transition-colors flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
            >
              <Download className="w-3.5 h-3.5" />
              <span>{isExporting ? "جار التحميل..." : "تحميل صورة PNG"}</span>
            </button>

            <button
              type="button"
              onClick={handlePrint}
              className="px-3 py-1.5 rounded-xl bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 text-slate-800 dark:text-slate-200 text-xs font-bold transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>طباعة</span>
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-4 sm:p-6 overflow-y-auto flex-1 space-y-5">
          
          {/* VIEW TAB 1: GRAPHICAL VOUCHER CARD */}
          {activeTab === "CARD_IMAGE" && (
            <div className="flex justify-center">
              {/* THE RENDERABLE VOUCHER CARD (Target for html2canvas export) */}
              <div
                id={voucherCardRefId}
                className="w-full max-w-sm sm:max-w-md mx-auto bg-white text-slate-900 rounded-3xl p-6 border border-slate-200 shadow-2xl relative overflow-hidden"
                style={{ direction: "rtl", fontFamily: "inherit" }}
              >
                {/* Beautiful Gradient Header */}
                <div className={`absolute top-0 right-0 left-0 h-4 bg-gradient-to-r ${themeClasses.headerGradient}`} />
                <div className="absolute top-0 right-0 w-32 h-32 bg-blue-50 rounded-full blur-3xl -z-10" />

                {/* Store Header & Logo (شعار المحل) */}
                <div className="flex flex-col items-center justify-center pt-2 pb-4 border-b border-dashed border-slate-200 gap-2 text-center">
                   <div className="w-16 h-16 rounded-3xl bg-gradient-to-tr from-slate-100 to-slate-200 border border-slate-300 text-3xl flex items-center justify-center shadow-sm">
                      🏢
                   </div>
                   <div>
                     <h2 className="text-xl font-black text-slate-900 tracking-tight">{voucher.storeName || storeAccount?.storeName || "المتجر"}</h2>
                     <p className="text-xs text-slate-500 font-bold mt-1">تاريخ: {voucher.date} • {voucher.time}</p>
                     <p className="text-[10px] text-slate-400 mt-0.5">سند رقم: {voucher.voucherNumber}</p>
                   </div>
                </div>

                {/* Main Content - Employee & Amount */}
                <div className="py-6 text-center space-y-4">
                  <div className="inline-block px-4 py-1.5 rounded-full bg-slate-100 text-slate-700 text-sm font-bold border border-slate-200 shadow-sm shadow-slate-100 mb-2">
                    {voucher.typeLabelAr}
                  </div>
                  
                  <div>
                    <span className="text-sm text-slate-500 font-bold block mb-1">الموظف:</span>
                    <strong className="text-2xl font-black text-slate-900">{voucher.employeeName}</strong>
                  </div>

                  <div className={`p-5 rounded-2xl border-2 border-dashed ${themeClasses.border} bg-slate-50 shadow-sm mx-auto max-w-xs mt-2`}>
                     <div className="text-xs font-bold text-slate-500 mb-2">المبلغ (السلفة الحالية):</div>
                     <div className={`text-4xl font-black font-mono tracking-tighter ${themeClasses.amountColor}`}>
                       {voucher.amount.toLocaleString("ar-YE")} <span className="text-base text-slate-400 ml-1">ر.ي</span>
                     </div>
                  </div>

                  {voucher.reason && (
                    <p className="text-sm text-slate-600 bg-slate-50 border border-slate-200 rounded-xl p-3 inline-block font-bold">
                       البيان: {voucher.reason}
                    </p>
                  )}
                </div>

                {/* Financial Summary Breakdown */}
                {voucher.financialSummary && (
                  <div className="bg-slate-800 text-white rounded-3xl p-5 shadow-lg relative overflow-hidden mb-4">
                     <div className="absolute top-0 right-0 w-24 h-24 bg-white/5 rounded-full blur-xl mix-blend-overlay" />
                     
                     <div className="space-y-3 relative z-10 text-xs sm:text-sm font-bold">
                       <div className="flex justify-between items-center pb-2 border-b border-white/10">
                         <span className="text-slate-300">الراتب الأساسي:</span>
                         <span className="font-mono text-white">{voucher.financialSummary.basicSalary.toLocaleString()} ر.ي</span>
                       </div>
                       
                       {voucher.financialSummary.totalAdvances !== undefined && (
                         <div className="flex justify-between items-center py-1">
                           <span className="text-rose-300">إجمالي السلف السابقة:</span>
                           <span className="font-mono text-rose-300">
                             -{((voucher.financialSummary.totalAdvances) - (voucher.type.includes("DISBURSEMENT") ? voucher.amount : 0)).toLocaleString()} ر.ي
                           </span>
                         </div>
                       )}

                       {voucher.financialSummary.totalDeductions !== undefined && voucher.financialSummary.totalDeductions > 0 && (
                         <div className="flex justify-between items-center py-1">
                           <span className="text-rose-400">إجمالي الخصومات:</span>
                           <span className="font-mono text-rose-400">-{voucher.financialSummary.totalDeductions.toLocaleString()} ر.ي</span>
                         </div>
                       )}

                       <div className="flex justify-between items-center pt-3 border-t border-white/20 mt-2">
                         <span className="text-emerald-300 font-black">المتبقي من الراتب:</span>
                         <div className="bg-emerald-500/20 px-3 py-1.5 rounded-xl border border-emerald-500/30">
                           <span className="font-mono text-emerald-300 font-black text-base">
                             {voucher.financialSummary.netRemaining?.toLocaleString() || 0} ر.ي
                           </span>
                         </div>
                       </div>
                     </div>
                  </div>
                )}
                
                <div className="text-center pt-2">
                   <div className="text-[11px] font-bold text-slate-400">الاعتماد: {voucher.approvedBy || "إدارة المتجر"}</div>
                </div>
              </div>
            </div>
          )}

          {/* VIEW TAB 2: TEXT STATEMENT */}
          {activeTab === "TEXT_STATEMENT" && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-500 dark:text-slate-400">
                  البيان النصي المهيأ للمشاركة عبر محادثات الواتساب:
                </span>
                <button
                  type="button"
                  onClick={handleCopyText}
                  className="px-3 py-1.5 rounded-xl bg-blue-50 text-blue-600 dark:bg-blue-900/40 dark:text-blue-400 hover:bg-blue-100 text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer"
                >
                  {copiedSuccess ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedSuccess ? "تم النسخ بنجاح!" : "نسخ النص"}</span>
                </button>
              </div>

              <div className="bg-slate-900 text-slate-100 p-4 sm:p-5 rounded-2xl font-mono text-xs whitespace-pre-wrap leading-relaxed border border-slate-800 shadow-inner max-h-[350px] overflow-y-auto">
                {whatsappFormattedText}
              </div>
            </div>
          )}

          {/* QUICK WHATSAPP DISPATCH TARGETS BOX */}
          <div className="p-4 sm:p-5 rounded-3xl bg-emerald-50/70 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/60 space-y-4">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-emerald-600 text-white flex items-center justify-center shadow-xs">
                <MessageSquare className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-sm font-black text-emerald-900 dark:text-emerald-200">
                  إرسال فوري ومباشر عبر تطبيق واتساب (WhatsApp)
                </h4>
                <p className="text-[11px] text-emerald-700 dark:text-emerald-400">
                  إرسال السند بالبيان النصي المعتمد والموقف المالي إلى الموظف والمدير
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              {/* Send to Employee Button */}
              <div className="p-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-emerald-200 dark:border-emerald-800/80 shadow-xs space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                    <User className="w-3.5 h-3.5 text-blue-500" />
                    الموظف المستفيد: {voucher.employeeName.split(" ")[0]}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={customEmpPhone}
                    onChange={(e) => setCustomEmpPhone(e.target.value)}
                    placeholder="رقم هاتف الموظف"
                    className="flex-1 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-2.5 py-2 text-xs font-mono text-slate-900 dark:text-white"
                  />
                  <button
                    type="button"
                    onClick={handleSendToEmployee}
                    className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition-all shadow-md flex items-center gap-1.5 cursor-pointer active:scale-95 shrink-0"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>إرسال للموظف 💬</span>
                  </button>
                </div>
              </div>

              {/* Send to Manager Button */}
              <div className="p-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-emerald-200 dark:border-emerald-800/80 shadow-xs space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                    <Building2 className="w-3.5 h-3.5 text-indigo-500" />
                    مدير / صاحب المتجر (نسخة إدارية)
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={customManagerPhone || currentManagerPhone}
                    onChange={(e) => setCustomManagerPhone(e.target.value)}
                    placeholder="رقم واتساب المدير"
                    className="flex-1 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-2.5 py-2 text-xs font-mono text-slate-900 dark:text-white"
                  />
                  <button
                    type="button"
                    onClick={handleSendToManager}
                    className="px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-700 to-teal-700 hover:from-emerald-600 text-white font-bold text-xs transition-all shadow-md flex items-center gap-1.5 cursor-pointer active:scale-95 shrink-0"
                  >
                    <ShieldCheck className="w-3.5 h-3.5" />
                    <span>إرسال للمدير 👑</span>
                  </button>
                </div>
              </div>
            </div>
          </div>

        </div>

        {/* Modal Footer */}
        <div className="p-4 sm:p-5 bg-slate-50 dark:bg-slate-800/80 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between gap-3 shrink-0">
          <div className="text-[11px] text-slate-500 dark:text-slate-400 hidden sm:block">
            رقم السند: <strong className="font-mono text-slate-800 dark:text-slate-200">{voucher.voucherNumber}</strong>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto justify-end flex-wrap">
            <button
              type="button"
              onClick={onClose}
              className="px-3.5 py-2.5 rounded-xl bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 font-bold text-xs transition-colors cursor-pointer"
            >
              إغلاق
            </button>
            <button
              type="button"
              onClick={handleDirectBackgroundSend}
              title="إرسال السند فورياً ومباشرة في الخلفية من هاتفك المقترن دون فتح أي نافذة"
              className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-black text-xs shadow-md transition-all flex items-center gap-1.5 cursor-pointer active:scale-95"
            >
              <Send className="w-3.5 h-3.5" />
              <span>إرسال فوري بالخلفية ⚡ (دايركت)</span>
            </button>
            <button
              type="button"
              onClick={handleSendToEmployee}
              className="px-4 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-600 text-white font-black text-xs shadow-md transition-all flex items-center gap-1.5 cursor-pointer active:scale-95"
            >
              <MessageSquare className="w-3.5 h-3.5" />
              <span>فتح المحادثة 💬</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
