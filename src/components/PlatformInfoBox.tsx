import React, { useState, useEffect } from "react";
import { storeService } from "../services/storeService";
import { WholesalerProfile } from "../types";
import {
  Building2,
  Phone,
  Mail,
  MapPin,
  FileText,
  ShieldCheck,
  Headphones,
  Globe,
  Sparkles,
  ExternalLink,
} from "lucide-react";

interface Props {
  variant?: "full-card" | "compact" | "banner" | "auth-hero";
  className?: string;
  title?: string;
}

export const PlatformInfoBox: React.FC<Props> = ({
  variant = "full-card",
  className = "",
  title,
}) => {
  const [platformInfo, setPlatformInfo] = useState<WholesalerProfile>(
    storeService.getWholesaler()
  );

  useEffect(() => {
    const unsubscribe = storeService.subscribe(() => {
      setPlatformInfo(storeService.getWholesaler());
    });
    return unsubscribe;
  }, []);

  if (variant === "compact") {
    return (
      <div className={`p-3 rounded-2xl bg-indigo-50/70 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-800 text-xs text-indigo-950 dark:text-indigo-200 flex flex-wrap items-center justify-between gap-3 ${className}`}>
        <div className="flex items-center gap-2">
          <Building2 className="w-4 h-4 text-indigo-600 dark:text-indigo-400 shrink-0" />
          <span className="font-extrabold">{platformInfo.storeName}</span>
          <span className="text-slate-400">•</span>
          <span className="text-slate-600 dark:text-slate-300 font-medium">
            {platformInfo.ownerName}
          </span>
        </div>

        <div className="flex items-center gap-3 font-bold font-mono text-[11px]">
          <a
            href={`tel:${platformInfo.phone}`}
            className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 hover:underline"
          >
            <Phone className="w-3.5 h-3.5" />
            <span>{platformInfo.phone}</span>
          </a>
          <span className="text-slate-400">•</span>
          <span className="flex items-center gap-1 text-slate-500 dark:text-slate-400">
            <MapPin className="w-3.5 h-3.5" />
            <span>{platformInfo.city}</span>
          </span>
        </div>
      </div>
    );
  }

  if (variant === "banner") {
    return (
      <div className={`p-4 rounded-2xl bg-gradient-to-r from-indigo-950 via-slate-900 to-indigo-900 text-white border border-indigo-800/60 shadow-md ${className}`}>
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-indigo-500/20 border border-indigo-400/30 text-amber-300 shrink-0">
              <Headphones className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-black text-sm text-white flex items-center gap-2">
                <span>{title || "بيانات إدارة التواصل والمنصة المركزية"}</span>
                <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] font-bold border border-emerald-400/30">
                  الدعم المباشر 🟢
                </span>
              </h4>
              <p className="text-xs text-indigo-200 mt-0.5">
                {platformInfo.storeName} ({platformInfo.ownerName})
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3 text-xs font-bold font-mono">
            <a
              href={`tel:${platformInfo.phone}`}
              className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white shadow-xs transition-all flex items-center gap-1.5"
            >
              <Phone className="w-3.5 h-3.5" />
              <span>{platformInfo.phone}</span>
            </a>
            <span className="text-indigo-300 text-[11px] font-sans">
              📍 {platformInfo.fullAddress || `${platformInfo.city} - ${platformInfo.district}`}
            </span>
          </div>
        </div>
      </div>
    );
  }

  if (variant === "auth-hero") {
    return (
      <div className={`space-y-4 pt-6 border-t border-indigo-800/60 text-white ${className}`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-emerald-400" />
            <h4 className="font-black text-sm text-amber-300">
              {title || "معلومات التواصل والإدارة المركزية للمنصة"}
            </h4>
          </div>
          <span className="text-[11px] px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-mono font-bold border border-emerald-400/30">
            س.ت: {platformInfo.commercialReg}
          </span>
        </div>

        <div className="space-y-1.5 text-xs">
          <div className="font-black text-base text-white flex items-center gap-2">
            <Building2 className="w-4.5 h-4.5 text-indigo-300 shrink-0" />
            <span>{platformInfo.storeName}</span>
          </div>
          <p className="text-xs text-indigo-200 font-medium">
            المسؤول والمشرف: {platformInfo.ownerName}
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs pt-1 font-bold">
          <a
            href={`tel:${platformInfo.phone}`}
            className="py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white flex items-center justify-center gap-2 transition-all font-mono shadow-md text-sm"
          >
            <Phone className="w-4 h-4 shrink-0" />
            <span>{platformInfo.phone}</span>
          </a>

          <a
            href={`mailto:${platformInfo.email}`}
            className="py-3 px-4 rounded-xl bg-indigo-800/70 hover:bg-indigo-700/80 text-indigo-100 flex items-center justify-center gap-2 transition-all font-mono text-xs truncate border border-indigo-700/60"
          >
            <Mail className="w-4 h-4 text-indigo-300 shrink-0" />
            <span className="truncate">{platformInfo.email}</span>
          </a>
        </div>

        <div className="text-xs text-indigo-300 flex items-center gap-2 pt-2">
          <MapPin className="w-4 h-4 text-amber-400 shrink-0" />
          <span>العنوان الرسمي: {platformInfo.fullAddress || `${platformInfo.city} - ${platformInfo.district}`}</span>
        </div>
      </div>
    );
  }

  // Default "full-card"
  return (
    <div className={`space-y-6 text-right dir-rtl ${className}`}>
      <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-4">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-2xl bg-indigo-600 text-white shadow-md">
            <Headphones className="w-6 h-6" />
          </div>
          <div>
            <h3 className="font-black text-base text-slate-900 dark:text-white">
              {title || "قسم خدمة العملاء والمنصة المركزية B2B"}
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              فريق الدعم الفني الموحد للتجار، المصانع، والسائقين
            </p>
          </div>
        </div>
        <span className="px-3 py-1 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 text-xs font-black border border-emerald-300 dark:border-emerald-800">
          دعم مباشر 🟢
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 text-xs">
        <div className="space-y-1">
          <span className="text-xs font-bold text-slate-400 block">اسم المنصة والشركة</span>
          <div className="font-black text-slate-900 dark:text-white text-base">
            {platformInfo.storeName}
          </div>
          <div className="text-xs text-slate-500 dark:text-slate-400">
            إدارة: {platformInfo.ownerName}
          </div>
        </div>

        <div className="space-y-1">
          <span className="text-xs font-bold text-slate-400 block">رقم خدمة العملاء المباشر</span>
          <a
            href={`tel:${platformInfo.phone}`}
            className="font-black text-emerald-600 dark:text-emerald-400 text-base font-mono flex items-center gap-1.5 hover:underline"
          >
            <Phone className="w-4.5 h-4.5" />
            <span>{platformInfo.phone}</span>
          </a>
          <div className="text-xs text-slate-500 dark:text-slate-400 font-mono">
            {platformInfo.email}
          </div>
        </div>

        <div className="space-y-1">
          <span className="text-xs font-bold text-slate-400 block">المقر والعنوان الرئيسي</span>
          <div className="font-black text-slate-800 dark:text-slate-200 flex items-center gap-1.5 text-sm">
            <MapPin className="w-4 h-4 text-rose-500 shrink-0" />
            <span>{platformInfo.city} - {platformInfo.district}</span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            {platformInfo.fullAddress}
          </p>
        </div>

        <div className="space-y-1">
          <span className="text-xs font-bold text-slate-400 block">التوثيق التجاري والضريبي</span>
          <div className="font-mono text-slate-900 dark:text-white text-sm font-black">
            س.ت: {platformInfo.commercialReg}
          </div>
          <div className="font-mono text-slate-500 dark:text-slate-400 text-xs">
            رقم ضريبي: {platformInfo.taxNumber}
          </div>
        </div>
      </div>
    </div>
  );
};

// EXPORT REUSABLE CUSTOMER SERVICE MODAL AND BUTTON
export const CustomerServiceModal: React.FC<{ isOpen: boolean; onClose: () => void }> = ({
  isOpen,
  onClose,
}) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto dir-rtl">
      <div className="max-w-2xl w-full bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl p-6 relative space-y-6 my-8 text-right">
        <button
          onClick={onClose}
          className="absolute top-5 left-5 p-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-600 dark:text-slate-400 transition-colors"
          title="إغلاق"
        >
          ✕
        </button>

        <PlatformInfoBox variant="full-card" title="قائمة معلومات خدمة العملاء والدعم الفني المباشر" />

        <div className="pt-2 text-center">
          <button
            onClick={onClose}
            className="px-8 py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-extrabold text-xs shadow-lg transition-all"
          >
            إغلاق القائمة
          </button>
        </div>
      </div>
    </div>
  );
};

export const CustomerServiceButton: React.FC<{ className?: string; label?: string; children?: React.ReactNode }> = ({
  className = "",
  label = "خدمة العملاء",
  children,
}) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className={className || `px-4 py-2.5 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs transition-all flex items-center gap-2 shadow-lg hover:scale-105`}
        title="انقر لعرض معلومات خدمة العملاء"
      >
        {children || (
          <>
            <Headphones className="w-4 h-4 text-amber-300 animate-pulse" />
            <span>{label}</span>
          </>
        )}
      </button>

      <CustomerServiceModal isOpen={isOpen} onClose={() => setIsOpen(false)} />
    </>
  );
};
