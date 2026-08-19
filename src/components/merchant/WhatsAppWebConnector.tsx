import React, { useState, useEffect } from "react";
import { QRCodeSVG } from "qrcode.react";
import {
  MessageSquare,
  QrCode,
  CheckCircle2,
  RefreshCw,
  Scissors,
  Phone,
  Wifi,
  Save,
  RotateCcw,
  X,
  Sparkles,
  AlertCircle,
  Smartphone,
  Check,
} from "lucide-react";
import {
  fetchWhatsAppServerStatus,
  connectServerSession,
  disconnectServerSession,
  playWhatsAppChimeSound,
} from "../../services/whatsappService";
import { storeService } from "../../services/storeService";

interface Props {
  isConnected?: boolean;
  onConnect?: () => void;
  onDisconnect?: () => void;
  phone?: string;
  storeName?: string;
  ownerName?: string;
  managerPhone?: string;
  autoSendSalary?: boolean;
  autoSendAdvance?: boolean;
  autoSendPenalty?: boolean;
  sendManagerCopy?: boolean;
  directBackgroundDispatch?: boolean;
}

export const WhatsAppWebConnector: React.FC<Props> = ({
  isConnected: initialConnected,
  onConnect,
  onDisconnect,
  phone = "",
  storeName = "",
  ownerName = "",
  managerPhone: initialManagerPhone = "",
}) => {
  const currentSession = storeService.getCurrentMerchantSession();
  const savedConfig = currentSession?.whatsAppConfig;

  // Form states based 1:1 on the user's previous software design
  const [managerPhone, setManagerPhone] = useState<string>(
    savedConfig?.managerPhone || initialManagerPhone || currentSession?.phone || "+966542029496"
  );
  const [centralServerIp, setCentralServerIp] = useState<string>(
    savedConfig?.centralServerIp || ""
  );
  const [sendEmployeeVouchers, setSendEmployeeVouchers] = useState<boolean>(
    savedConfig?.sendEmployeeVouchers ?? true
  );
  const [sendExpenseVouchers, setSendExpenseVouchers] = useState<boolean>(
    savedConfig?.sendExpenseVouchers ?? true
  );
  const [sendDailySalesReport, setSendDailySalesReport] = useState<boolean>(
    savedConfig?.sendDailySalesReport ?? true
  );

  // Connection & Daemon States
  const [connectionStatus, setConnectionStatus] = useState<"CONNECTED" | "CONNECTING" | "DISCONNECTED">(
    initialConnected || savedConfig?.isConnected ? "CONNECTED" : "CONNECTING"
  );
  const [statusMessage, setStatusMessage] = useState<string>("جاري فحص الاتصال بالخلفية...");
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [showQrModal, setShowQrModal] = useState(false);
  const [qrCodeData, setQrCodeData] = useState(
    `https://wa.me/${(savedConfig?.managerPhone || "+966542029496").replace(/[^\d]/g, "")}?text=${encodeURIComponent("تفعيل نظام إمداد وربط واتساب")}`
  );
  const [saveSuccessNotice, setSaveSuccessNotice] = useState<string | null>(null);

  // Sync / check server status
  const checkStatus = async () => {
    try {
      setIsRefreshing(true);
      const res = await fetchWhatsAppServerStatus();
      if (res && res.isConnected) {
        setConnectionStatus("CONNECTED");
        setStatusMessage("متصل بنجاح (النافذة المتخفية جاهزة للإرسال 24/7) 🟢");
      } else if (res && res.status === "CONNECTING") {
        setConnectionStatus("CONNECTING");
        setStatusMessage("جاري محاولة الاتصال بالخلفية...");
      } else {
        setConnectionStatus("DISCONNECTED");
        setStatusMessage("انقطع الاتصال: undefined");
      }
    } catch {
      setConnectionStatus("DISCONNECTED");
      setStatusMessage("انقطع الاتصال: undefined");
    } finally {
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    checkStatus();
    const interval = setInterval(checkStatus, 15000);
    return () => clearInterval(interval);
  }, []);

  // Handle Retry Connection / Connect
  const handleRetryConnection = async () => {
    setConnectionStatus("CONNECTING");
    setStatusMessage("جاري إنشاء رمز QR جديد...");
    setShowQrModal(true);
    setQrCodeData("⏳ جاري التحميل...");

    try {
      // Connect to server and request QR!
      await connectServerSession({ 
          phone: managerPhone, 
          storeName: storeName || "متجر إمداد", 
          ownerName: ownerName || "المدير العام" 
      });
  // Fetch initial right away
      const qRes = await fetch("/api/whatsapp/qr?phone=" + managerPhone);
      const qData = await qRes.json();
      if (qData.qrPayload) {
        setQrCodeData(qData.qrPayload);
        setStatusMessage("يرجى مسح الكود بهاتفك عبر: الأجهزة المرتبطة...");
      }

      // Start polling for real QR if it was fake/waiting
      const pollInterval = setInterval(async () => {
        try {
          const res = await fetch("/api/whatsapp/qr?phone=" + managerPhone);
          const data = await res.json();
          if (data.qrPayload) {
             setQrCodeData(data.qrPayload);
             if (!data.qrPayload.startsWith("FAKE_")) {
               setStatusMessage("يرجى مسح الكود بهاتفك عبر: الأجهزة المرتبطة...");
             }
          }
          
          const statusRes = await fetch("/api/whatsapp/status");
          const statusData = await statusRes.json();
          if (statusData.isConnected) {
             clearInterval(pollInterval);
             setShowQrModal(false);
             checkStatus();
             playWhatsAppChimeSound();
          }
        } catch (e) {
          console.warn("QR Poll Error:", e);
        }
      }, 2000);
      
      // Cleanup on modal close
      (window as any).__qrPollInterval = pollInterval;

    } catch (err) {
      console.warn("Connect attempt notice:", err);
      setStatusMessage("فشل في جلب الباركود. تأكد من تشغيل السيرفر.");
    }
  };

  // Ensure cleanup when unmounting or closing manually
  useEffect(() => {
    if (!showQrModal && (window as any).__qrPollInterval) {
      clearInterval((window as any).__qrPollInterval);
    }
  }, [showQrModal]);

  // Handle Refresh
  const handleRefresh = async () => {
    await checkStatus();
    setSaveSuccessNotice("تم تحديث حالة الاتصال بالسيرفر المركزي بنجاح 🔄");
    setTimeout(() => setSaveSuccessNotice(null), 3000);
  };

  // Handle Unlink / Disconnect
  const handleUnlink = async () => {
    try {
      await disconnectServerSession();
      setConnectionStatus("DISCONNECTED");
      setStatusMessage("انقطع الاتصال: undefined");
      if (currentSession) {
        storeService.updateMerchantWhatsAppConfig(currentSession.id, {
          isConnected: false,
        });
      }
      if (onDisconnect) onDisconnect();
      setSaveSuccessNotice("تم إلغاء الربط وإيقاف الجلسة بنجاح ✂️");
      setTimeout(() => setSaveSuccessNotice(null), 3000);
    } catch (err) {
      console.warn("Unlink notice:", err);
    }
  };

  // Save Settings
  const handleSaveSettings = () => {
    if (currentSession) {
      storeService.updateMerchantWhatsAppConfig(currentSession.id, {
        enabled: true,
        managerPhone: managerPhone.trim(),
        centralServerIp: centralServerIp.trim(),
        sendEmployeeVouchers,
        sendExpenseVouchers,
        sendDailySalesReport,
        autoSendSalaryVouchers: sendEmployeeVouchers,
        autoSendAdvanceVouchers: sendEmployeeVouchers,
        autoSendPenaltyVouchers: sendEmployeeVouchers,
        sendManagerCopy: sendExpenseVouchers,
        directBackgroundDispatch: true,
        isConnected: connectionStatus === "CONNECTED",
      });
    }

    playWhatsAppChimeSound();
    setSaveSuccessNotice("تم حفظ وتطبيق إعدادات الواتساب على جميع أجهزة النظام بنجاح 💾🟢");
    setTimeout(() => setSaveSuccessNotice(null), 4000);
  };

  // Restore Defaults
  const handleRestoreDefaults = () => {
    setManagerPhone(currentSession?.phone || "+966542029496");
    setCentralServerIp("");
    setSendEmployeeVouchers(true);
    setSendExpenseVouchers(true);
    setSendDailySalesReport(true);
    setSaveSuccessNotice("تمت استعادة الإعدادات الافتراضية بنجاح 🔄");
    setTimeout(() => setSaveSuccessNotice(null), 3000);
  };

  return (
    <div
      dir="rtl"
      className="bg-[#121c2b] text-slate-100 p-5 sm:p-7 rounded-3xl border border-slate-700/60 shadow-2xl space-y-6 select-none font-sans"
    >
      {/* Toast Notification */}
      {saveSuccessNotice && (
        <div className="p-3.5 bg-emerald-500/15 border border-emerald-500/40 rounded-2xl flex items-center justify-between gap-3 text-emerald-300 animate-in fade-in slide-in-from-top-2 duration-300">
          <div className="flex items-center gap-2 text-xs font-bold">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping shrink-0" />
            <span>{saveSuccessNotice}</span>
          </div>
          <button
            onClick={() => setSaveSuccessNotice(null)}
            className="p-1 text-emerald-300 hover:bg-emerald-500/20 rounded-lg"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Main Header */}
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h2 className="text-base sm:text-lg font-black text-white flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-emerald-500 flex items-center justify-center text-slate-950 font-black shadow-md shadow-emerald-500/20">
              <MessageSquare className="w-4 h-4 fill-current" />
            </div>
            <span>ربط واتساب (طابعة رقمية)</span>
          </h2>
          <p className="text-xs text-slate-400 font-medium">
            اختر طريقة إرسال الواتساب المناسبة لجهازك.
          </p>
        </div>
      </div>

      {/* Two Column Grid layout matching user previous UI */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        {/* RIGHT COLUMN CARD: واتساب (النافذة المتخفية) */}
        <div className="lg:col-span-5 order-1 lg:order-2">
          <div className="bg-[#192434] border border-cyan-900/40 rounded-2xl p-4 sm:p-5 space-y-4 shadow-lg">
            {/* Card Header */}
            <div className="flex items-center justify-between gap-2 border-b border-slate-700/50 pb-3">
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-white text-xs sm:text-sm">
                  واتساب (النافذة المتخفية)
                </span>
                <span
                  className={`text-[11px] font-bold ${
                    connectionStatus === "CONNECTED"
                      ? "text-emerald-400"
                      : connectionStatus === "CONNECTING"
                      ? "text-amber-400"
                      : "text-rose-400"
                  }`}
                >
                  •{" "}
                  {connectionStatus === "CONNECTED"
                    ? "متصل 🟢"
                    : connectionStatus === "CONNECTING"
                    ? "جاري الاتصال..."
                    : "غير متصل"}
                </span>
              </div>
              <div className="w-7 h-7 rounded-lg bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 flex items-center justify-center shrink-0">
                <MessageSquare className="w-4 h-4" />
              </div>
            </div>

            {/* Subtext */}
            <p className="text-[11.5px] text-slate-300 leading-relaxed">
              واتساب ويب يعمل في الخلفية تلقائياً لإرسال الرسائل والصور، يتطلب مسح QR مرة واحدة.
            </p>

            {/* Error / Status Message Banner */}
            <div
              className={`p-2.5 rounded-xl text-xs font-bold text-center border ${
                connectionStatus === "CONNECTED"
                  ? "bg-emerald-950/40 border-emerald-500/40 text-emerald-300"
                  : connectionStatus === "CONNECTING"
                  ? "bg-amber-950/40 border-amber-500/40 text-amber-300"
                  : "bg-rose-950/40 border-rose-500/40 text-rose-300"
              }`}
            >
              <span>{statusMessage}</span>
            </div>

            {/* Action 1: إعادة محاولة الاتصال Button (Sky / Cyan Blue) */}
            <button
              type="button"
              onClick={handleRetryConnection}
              className="w-full py-2.5 px-4 rounded-xl bg-cyan-500 hover:bg-cyan-400 active:bg-cyan-600 text-slate-950 font-black text-xs transition-all shadow-md cursor-pointer flex items-center justify-center gap-2"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${connectionStatus === "CONNECTING" ? "animate-spin" : ""}`} />
              <span>إعادة محاولة الاتصال</span>
            </button>

            {/* Action: فتح واتس اب ويب (WhatsApp Web Shortcut) */}
            <button
              type="button"
              onClick={() => window.open("https://web.whatsapp.com", "WhatsAppWeb", "width=1000,height=800,popup=1")}
              className="w-full mt-2 py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 text-white font-black text-xs transition-all shadow-md cursor-pointer flex items-center justify-center gap-2"
            >
              <MessageSquare className="w-3.5 h-3.5" />
              <span>فتح واتس اب ويب</span>
            </button>

            {/* Action Row 2: تحديث and الغاء الربط */}
            <div className="grid grid-cols-2 gap-2.5 pt-1">
              <button
                type="button"
                onClick={handleRefresh}
                disabled={isRefreshing}
                className="py-2 px-3 rounded-xl bg-[#243348] hover:bg-[#2e405a] text-slate-200 font-bold text-xs transition-colors flex items-center justify-center gap-1.5 border border-slate-700 cursor-pointer disabled:opacity-50"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? "animate-spin text-cyan-400" : ""}`} />
                <span>تحديث</span>
              </button>

              <button
                type="button"
                onClick={handleUnlink}
                className="py-2 px-3 rounded-xl bg-transparent hover:bg-rose-950/30 text-rose-400 hover:text-rose-300 font-bold text-xs transition-colors flex items-center justify-center gap-1.5 border border-rose-500/40 cursor-pointer"
              >
                <Scissors className="w-3.5 h-3.5 rotate-90" />
                <span>الغاء الربط</span>
              </button>
            </div>
          </div>
        </div>

        {/* LEFT COLUMN: Inputs & Checkbox Options */}
        <div className="lg:col-span-7 order-2 lg:order-1 space-y-4">
          {/* Input 1: رقم هاتف المحاسب/الإدارة لاستلام الإشعارات والسندات */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-slate-200">
              رقم هاتف المحاسب/الإدارة لاستلام الإشعارات والسندات (مطلوب)
            </label>
            <div className="relative">
              <input
                type="text"
                value={managerPhone}
                onChange={(e) => setManagerPhone(e.target.value)}
                placeholder="+966542029496"
                className="w-full bg-[#182334] border border-slate-700/80 rounded-xl px-4 py-2.5 text-xs text-white font-mono font-bold focus:outline-none focus:border-cyan-500 transition-colors pr-10"
              />
              <Phone className="w-4 h-4 text-cyan-400 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          </div>

          {/* Input 2: عنوان IP لجهاز واتساب المركزي (اختياري) */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-slate-200">
              عنوان IP لجهاز واتساب المركزي (اختياري — للأجهزة الفرعية على الشبكة)
            </label>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              اتركه فارغاً على الجهاز الذي يُرسل منه واتساب مباشرة. على الأجهزة الفرعية يُفضّل تركه فارغاً أيضاً: يُكتشف تلقائياً من مزامنة الشبكة عندما يكون الجهاز الرئيسي متصلاً بواتساب. يمكنك التعبئة يدوياً (مثل 192.168.1.10) إذا لم يُكتشف العنوان.
            </p>
            <div className="relative">
              <input
                type="text"
                value={centralServerIp}
                onChange={(e) => setCentralServerIp(e.target.value)}
                placeholder="مثال: 192.168.1.10"
                className="w-full bg-[#182334] border border-slate-700/80 rounded-xl px-4 py-2.5 text-xs text-white font-mono font-bold focus:outline-none focus:border-cyan-500 transition-colors pr-10"
              />
              <Wifi className="w-4 h-4 text-emerald-400 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          </div>

          {/* Checkbox Card 1: إرسال سندات السلف والرواتب */}
          <label className="flex items-center justify-between p-3.5 rounded-xl bg-[#182334] border border-slate-700/70 hover:border-slate-600 transition-colors cursor-pointer">
            <div className="space-y-0.5">
              <strong className="block text-xs font-extrabold text-white">
                إرسال سندات السلف والرواتب للموظفين عبر واتساب
              </strong>
              <span className="text-[11px] text-slate-400">
                إرسال صورة السند تلقائياً إلى واتساب الموظف المستفيد.
              </span>
            </div>
            <input
              type="checkbox"
              checked={sendEmployeeVouchers}
              onChange={(e) => setSendEmployeeVouchers(e.target.checked)}
              className="w-4 h-4 rounded text-cyan-500 bg-slate-900 border-slate-600 focus:ring-cyan-500 focus:ring-offset-0 cursor-pointer ml-1"
            />
          </label>

          {/* Checkbox Card 2: إرسال سندات المصروفات للإدارة */}
          <label className="flex items-center justify-between p-3.5 rounded-xl bg-[#182334] border border-slate-700/70 hover:border-slate-600 transition-colors cursor-pointer">
            <div className="space-y-0.5">
              <strong className="block text-xs font-extrabold text-white">
                إرسال سندات المصروفات للإدارة عبر واتساب
              </strong>
              <span className="text-[11px] text-slate-400">
                إرسال صورة سند عمليات المصروفات وسحبيات المطعم لرقم الإدارة أعلاه.
              </span>
            </div>
            <input
              type="checkbox"
              checked={sendExpenseVouchers}
              onChange={(e) => setSendExpenseVouchers(e.target.checked)}
              className="w-4 h-4 rounded text-cyan-500 bg-slate-900 border-slate-600 focus:ring-cyan-500 focus:ring-offset-0 cursor-pointer ml-1"
            />
          </label>

          {/* Checkbox Card 3: إرسال تقرير المبيعات اليومية */}
          <label className="flex items-center justify-between p-3.5 rounded-xl bg-[#182334] border border-slate-700/70 hover:border-slate-600 transition-colors cursor-pointer">
            <div className="space-y-0.5">
              <strong className="block text-xs font-extrabold text-white">
                إرسال تقرير المبيعات اليومية
              </strong>
              <span className="text-[11px] text-slate-400">
                إرسال ملخص الوردية (الشيفت) عند إغلاقه.
              </span>
            </div>
            <input
              type="checkbox"
              checked={sendDailySalesReport}
              onChange={(e) => setSendDailySalesReport(e.target.checked)}
              className="w-4 h-4 rounded text-cyan-500 bg-slate-900 border-slate-600 focus:ring-cyan-500 focus:ring-offset-0 cursor-pointer ml-1"
            />
          </label>
        </div>
      </div>

      {/* Bottom Action Buttons Bar matching screenshot */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-4 border-t border-slate-700/60">
        <button
          type="button"
          onClick={handleRestoreDefaults}
          className="flex items-center gap-1.5 text-xs text-slate-300 hover:text-white font-bold px-3 py-2 rounded-xl transition-colors cursor-pointer"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>استعادة الافتراضية</span>
        </button>

        <button
          type="button"
          onClick={handleSaveSettings}
          className="px-6 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 active:bg-emerald-600 text-slate-950 font-black text-xs transition-all shadow-md cursor-pointer flex items-center justify-center gap-2"
        >
          <Save className="w-4 h-4" />
          <span>حفظ وتطبيق الإعدادات على جميع الأنظمة</span>
        </button>
      </div>

      {/* Minimalistic QR Code Pairing Popup (Shown on Demand without clutter) */}
      {showQrModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-[#182334] border border-cyan-700/50 rounded-3xl p-6 max-w-sm w-full text-center space-y-4 shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between pb-2 border-b border-slate-700">
              <h3 className="font-extrabold text-white text-sm flex items-center gap-2">
                <QrCode className="w-4 h-4 text-emerald-400" />
                <span>مسح كود QR بالواتساب</span>
              </h3>
              <button
                onClick={() => setShowQrModal(false)}
                className="p-1 rounded-lg bg-slate-800 text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-slate-300">
              افتح تطبيق واتساب بهاتفك &gt; الأجهزة المرتبطة &gt; التوجيه لمسح الكود أدناه (الربط الحقيقي يعمل الآن 🟢):
            </p>

            <div className="bg-white p-4 rounded-2xl inline-block shadow-inner">
              <QRCodeSVG value={qrCodeData} size={180} />
            </div>

            <div className="flex items-center justify-center gap-2 text-xs font-bold text-emerald-400">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
              <span>جاري انتظار المسح والربط التلقائي...</span>
            </div>

            <button
               onClick={() => {
                setShowQrModal(false);
                checkStatus();
              }}
              className="w-full py-2.5 rounded-xl bg-slate-700 text-white font-black text-xs hover:bg-slate-600 transition-colors"
            >
              إغلاق النافذة
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
