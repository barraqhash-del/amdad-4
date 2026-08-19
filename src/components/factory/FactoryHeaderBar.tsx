import React, { useState } from "react";
import { FactoryAccount } from "../../types";
import { PlatformInfoBox, CustomerServiceButton } from "../PlatformInfoBox";
import { FactorySettingsModal } from "./FactorySettingsModal";
import {
  Building2,
  ShieldCheck,
  Zap,
  LogOut,
  Calendar,
  CheckCircle2,
  Phone,
  Clock,
  Sparkles,
  X,
  Info,
  Settings,
} from "lucide-react";

interface Props {
  currentAccount: FactoryAccount;
  onLogout: () => void;
}

export const FactoryHeaderBar: React.FC<Props> = ({
  currentAccount,
  onLogout,
}) => {
  const [showPlatformInfoModal, setShowPlatformInfoModal] = useState(false);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  const sub = currentAccount.subscription;

  const getTierColor = (planId: string) => {
    switch (planId) {
      case "ENTERPRISE_VIP":
        return "bg-gradient-to-r from-amber-500 via-amber-400 to-yellow-500 text-slate-950 border-amber-300 shadow-md";
      case "PROFESSIONAL":
        return "bg-indigo-600 text-white border-indigo-500 shadow-sm";
      default:
        return "bg-slate-800 text-slate-200 border-slate-700";
    }
  };

  return (
    <div className="bg-white dark:bg-slate-900 rounded-3xl p-4 sm:p-5 border border-slate-200 dark:border-slate-800 shadow-lg dir-rtl transition-all">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        {/* Left/Right Side: Factory Name & Identity */}
        <div className="flex items-center gap-3.5">
          <div className="p-3.5 rounded-2xl bg-indigo-50 dark:bg-indigo-950/80 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800 shrink-0">
            <Building2 className="w-7 h-7" />
          </div>

          <div className="space-y-1">
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-base sm:text-lg font-black text-slate-900 dark:text-white">
                {currentAccount.factoryName}
              </h2>
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300 text-xs font-bold border border-emerald-200 dark:border-emerald-800">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>مصنع موثق ومحتمد 🏭</span>
              </span>
            </div>

            <p className="text-xs text-slate-500 dark:text-slate-400 flex flex-wrap items-center gap-3">
              <span>المدير المسؤول: <strong className="text-slate-800 dark:text-slate-200">{currentAccount.ownerName}</strong></span>
              <span>•</span>
              <span>سجل تجاري: <span className="font-mono">{currentAccount.commercialReg}</span></span>
              <span>•</span>
              <span>{currentAccount.city} ({currentAccount.district})</span>
            </p>
          </div>
        </div>

        {/* Subscription Info & Actions */}
        <div className="flex flex-wrap items-center gap-3 bg-slate-50 dark:bg-slate-800/60 p-3 rounded-2xl border border-slate-100 dark:border-slate-800">
          {/* Active Subscription Badge */}
          <div className="flex items-center gap-2.5 px-3 py-1.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 shadow-2xs">
            <div className={`px-2.5 py-1 rounded-lg text-xs font-black border flex items-center gap-1 ${getTierColor(sub.planId)}`}>
              <Zap className="w-3.5 h-3.5" />
              <span>{sub.planNameAr}</span>
            </div>

            <div className="text-[11px] text-slate-600 dark:text-slate-300">
              <div className="flex items-center gap-1 font-bold text-emerald-600 dark:text-emerald-400">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>الاشتراك نشط 🟢</span>
              </div>
              <div className="text-[10px] text-slate-400 font-medium flex items-center gap-1">
                <Calendar className="w-3 h-3" />
                <span>تجديد: {sub.endDate}</span>
              </div>
            </div>
          </div>

          {/* Subscription Specs Summary */}
          <div className="hidden sm:flex items-center gap-2 text-[11px] text-slate-500 dark:text-slate-400 border-r border-slate-200 dark:border-slate-700 pr-3 mr-1">
            <span className="font-bold text-slate-700 dark:text-slate-300">
              {sub.maxProducts.toLocaleString()} منتج
            </span>
            <span>•</span>
            <span className="font-bold text-slate-700 dark:text-slate-300">
              {sub.maxDrivers} سائق أسطول
            </span>
          </div>

          {/* Action Buttons: 1. Customer Service, 2. Settings, 3. Logout */}
          <div className="flex items-center gap-2 flex-wrap">
            {/* 1. خدمة العملاء */}
            <CustomerServiceButton
              label="خدمة العملاء 🎧"
              className="px-3.5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs transition-all flex items-center justify-center gap-1.5 shadow-xs hover:scale-[1.02] whitespace-nowrap cursor-pointer"
            />

            {/* 2. الإعدادات */}
            <button
              type="button"
              onClick={() => setIsSettingsModalOpen(true)}
              className="px-3.5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-extrabold text-xs transition-all flex items-center justify-center gap-1.5 shadow-xs hover:scale-[1.02] whitespace-nowrap cursor-pointer"
              title="إعدادات المصنع وتحديد الموقع"
            >
              <Settings className="w-4 h-4 text-indigo-200" />
              <span>الإعدادات ⚙️</span>
            </button>

            {/* 3. خروج */}
            <button
              type="button"
              onClick={onLogout}
              className="px-3.5 py-2.5 rounded-xl bg-rose-50 dark:bg-rose-950/60 hover:bg-rose-100 dark:hover:bg-rose-900/60 text-rose-600 dark:text-rose-400 font-extrabold text-xs transition-all flex items-center justify-center gap-1.5 border border-rose-200 dark:border-rose-900/50 hover:scale-[1.02] whitespace-nowrap cursor-pointer"
              title="تسجيل الخروج من حساب المصنع"
            >
              <LogOut className="w-4 h-4" />
              <span>خروج 🚪</span>
            </button>
          </div>
        </div>
      </div>

      {/* PLATFORM INFO FULL SCREEN PAGE FOR FACTORY */}
      {showPlatformInfoModal && (
        <div className="fixed inset-0 z-50 bg-slate-950 text-white min-h-screen p-6 sm:p-12 lg:p-16 overflow-y-auto dir-rtl flex flex-col justify-between space-y-8">
          <div className="flex items-center justify-between border-b border-slate-800 pb-6">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-2xl bg-indigo-600 text-white shadow-lg">
                <Building2 className="w-8 h-8" />
              </div>
              <div>
                <h2 className="text-2xl font-black text-white">
                  صفحة إدارة وتواصل المنصة المركزية B2B
                </h2>
                <p className="text-sm text-slate-400 mt-1">
                  المعلومات الموحدة للتواصل الرسمي، الدعم الفني، والمقر الرئيسي المعتمد للمصانع
                </p>
              </div>
            </div>

            <button
              onClick={() => setShowPlatformInfoModal(false)}
              className="px-5 py-2.5 rounded-2xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs flex items-center gap-2 transition-all"
            >
              <X className="w-5 h-5 text-amber-300" />
              <span>إغلاق الصفحة والعودة للوحة التحكم</span>
            </button>
          </div>

          <div className="flex-1 py-4">
            <PlatformInfoBox variant="full-card" title="تفاصيل الربط والمقر الرئيسي لمنصة إمداد" />
          </div>

          <div className="pt-6 border-t border-slate-800 text-center">
            <button
              onClick={() => setShowPlatformInfoModal(false)}
              className="px-8 py-3.5 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-extrabold text-sm shadow-xl transition-all"
            >
              العودة للوحة التحكم الرئيسية للمصنع
            </button>
          </div>
        </div>
      )}

      {/* Factory Settings & Map Location Modal */}
      <FactorySettingsModal
        isOpen={isSettingsModalOpen}
        onClose={() => setIsSettingsModalOpen(false)}
        currentAccount={currentAccount}
      />
    </div>
  );
};
