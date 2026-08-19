import React, { useState, useEffect } from "react";
import { fetchWhatsAppServerStatus, ServerWhatsAppStatus } from "../../services/whatsappService";
import { MessageSquare, RefreshCw, Smartphone, CheckCircle2, AlertTriangle, ShieldCheck, Zap } from "lucide-react";

interface Props {
  onOpenSettings?: () => void;
  compact?: boolean;
  className?: string;
}

export const WhatsAppLiveStatusBadge: React.FC<Props> = ({
  onOpenSettings,
  compact = false,
  className = "",
}) => {
  const [statusData, setStatusData] = useState<ServerWhatsAppStatus | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [lastCheck, setLastCheck] = useState<Date>(new Date());

  const checkStatus = async () => {
    try {
      const data = await fetchWhatsAppServerStatus();
      setStatusData(data);
      setLastCheck(new Date());
    } catch {
      // Ignore
    }
  };

  useEffect(() => {
    checkStatus();
    // Poll every 10 seconds for real-time connection telemetry
    const interval = setInterval(checkStatus, 10000);

    const handleVoucherDispatched = () => {
      checkStatus();
    };

    window.addEventListener("whatsapp:voucher_dispatched", handleVoucherDispatched);
    return () => {
      clearInterval(interval);
      window.removeEventListener("whatsapp:voucher_dispatched", handleVoucherDispatched);
    };
  }, []);

  const isConnected = statusData?.isConnected ?? true;
  const isConnecting = statusData?.status === "CONNECTING";
  const phone = statusData?.phone || "967771234567";

  if (compact) {
    return (
      <button
        type="button"
        onClick={onOpenSettings}
        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold transition-all cursor-pointer shadow-xs ${
          isConnected
            ? "bg-emerald-500/20 text-emerald-300 border border-emerald-400/40 hover:bg-emerald-500/30"
            : isConnecting
            ? "bg-amber-500/20 text-amber-300 border border-amber-400/40 hover:bg-amber-500/30"
            : "bg-rose-500/20 text-rose-300 border border-rose-400/40 hover:bg-rose-500/30 animate-pulse"
        } ${className}`}
        title={
          isConnected
            ? `واتساب المتجر متصل 24/7 على الرقم ${phone} - السندات ترسل تلقائياً في الخلفية`
            : "واتساب المتجر مفصول - اضغط لإعادة الربط والاقتران"
        }
      >
        <span className="relative flex h-2 w-2">
          {isConnected && (
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
          )}
          <span
            className={`relative inline-flex rounded-full h-2 w-2 ${
              isConnected ? "bg-emerald-400" : isConnecting ? "bg-amber-400" : "bg-rose-500"
            }`}
          ></span>
        </span>
        <MessageSquare className="w-3.5 h-3.5" />
        <span>{isConnected ? "واتساب نشط 🟢" : isConnecting ? "جارِ الاتصال... 🟡" : "واتساب مفصول 🔴"}</span>
      </button>
    );
  }

  return (
    <div
      onClick={onOpenSettings}
      className={`group relative flex items-center justify-between gap-3 p-2.5 sm:p-3 rounded-2xl border transition-all cursor-pointer select-none ${
        isConnected
          ? "bg-slate-900/90 border-emerald-500/30 hover:border-emerald-500/60 shadow-lg shadow-emerald-950/20"
          : isConnecting
          ? "bg-slate-900/90 border-amber-500/40 hover:border-amber-500/70 shadow-lg shadow-amber-950/20"
          : "bg-slate-900/90 border-rose-500/50 hover:border-rose-500 shadow-lg shadow-rose-950/30 animate-pulse"
      } ${className}`}
    >
      <div className="flex items-center gap-2.5">
        {/* Status Indicator Dot with Radar Pulse */}
        <div className="relative flex items-center justify-center">
          <div
            className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-sm ${
              isConnected
                ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/40"
                : isConnecting
                ? "bg-amber-500/20 text-amber-400 border border-amber-500/40"
                : "bg-rose-500/20 text-rose-400 border border-rose-500/40"
            }`}
          >
            <MessageSquare className="w-5 h-5" />
          </div>
          {isConnected && (
            <span className="absolute -top-1 -right-1 flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
            </span>
          )}
        </div>

        <div className="text-right">
          <div className="flex items-center gap-1.5">
            <span
              className={`text-xs font-black ${
                isConnected
                  ? "text-emerald-300"
                  : isConnecting
                  ? "text-amber-300"
                  : "text-rose-300 font-black"
              }`}
            >
              {isConnected
                ? "خدمة واتساب الخلفية: متصل 24/7 🟢"
                : isConnecting
                ? "خدمة الواتساب: جارِ الاتصال بالسيرفر 🟡"
                : "خدمة الواتساب: مفصول (يتطلب إعادة الربط) 🔴"}
            </span>
            <span className="text-[10px] px-1.5 py-0.2 rounded-md bg-slate-800 text-slate-300 font-mono">
              Baileys Engine
            </span>
          </div>

          <div className="flex items-center gap-2 text-[11px] text-slate-300 font-medium mt-0.5">
            <span className="flex items-center gap-1">
              <Smartphone className="w-3 h-3 text-slate-400" />
              <strong className="font-mono text-white">{phone}</strong>
            </span>
            <span className="text-slate-600">•</span>
            <span className="text-emerald-400 text-[10px] font-bold">إرسال خلفي تلقائي (Zero Popups)</span>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <span className="text-[10px] px-2.5 py-1 rounded-xl bg-slate-800/80 text-slate-300 border border-slate-700 font-bold hidden sm:inline-block">
          {isConnected ? "إدارة وتفاصيل ⚙️" : "اضغط للربط الآن ⚡"}
        </span>
      </div>
    </div>
  );
};
