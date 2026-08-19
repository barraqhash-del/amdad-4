import React, { useState, useEffect } from "react";
import { MerchantAccount, SubscriptionTier, BillingCycle } from "../../types";
import { storeService } from "../../services/storeService";
import { PlatformInfoBox, CustomerServiceButton } from "../PlatformInfoBox";
import { MerchantSettingsModal } from "./MerchantSettingsModal";
import { WhatsAppLiveStatusBadge } from "./WhatsAppLiveStatusBadge";
import {
  Building2,
  CheckCircle2,
  Crown,
  CreditCard,
  LogOut,
  X,
  Info,
  Settings,
  MapPin,
  Calendar,
  Clock,
  Sparkles,
} from "lucide-react";

interface Props {
  currentAccount: MerchantAccount;
  onLogout: () => void;
}

export const MerchantHeaderBar: React.FC<Props> = ({
  currentAccount: initialAccount,
  onLogout,
}) => {
  const [currentAccount, setCurrentAccount] = useState<MerchantAccount>(initialAccount);
  const [isSubscriptionModalOpen, setIsSubscriptionModalOpen] = useState(false);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  const [showPlatformPage, setShowPlatformPage] = useState(false);
  const [upgradeSuccessMsg, setUpgradeSuccessMsg] = useState("");
  const [selectedBillingCycle, setSelectedBillingCycle] = useState<BillingCycle>("YEARLY");

  useEffect(() => {
    setCurrentAccount(initialAccount);
    if (initialAccount?.subscription?.billingCycle) {
      setSelectedBillingCycle(initialAccount.subscription.billingCycle);
    }
  }, [initialAccount]);

  useEffect(() => {
    const unsubscribe = storeService.subscribe(() => {
      const latest = storeService.getCurrentMerchantSession();
      if (latest) {
        setCurrentAccount(latest);
      }
    });
    return unsubscribe;
  }, []);

  const handlePlanUpgradeSubmit = (newTier: SubscriptionTier, cycle: BillingCycle = selectedBillingCycle) => {
    if (!currentAccount) return;
    storeService.updateMerchantSubscription(currentAccount.id, newTier, cycle);
    const cycleText = cycle === "YEARLY" ? "السنوي (توفير شهرين 🎉)" : "الشهري";
    setUpgradeSuccessMsg(`تم تحديث الاشتراك بنجاح للباقة واختيار النظام ${cycleText} 🚀`);
    setTimeout(() => {
      setUpgradeSuccessMsg("");
      setIsSubscriptionModalOpen(false);
    }, 1500);
  };

  return (
    <>
      {/* Top Merchant Identity & Active Subscription Bar */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white p-4 sm:p-5 rounded-3xl border border-indigo-900/50 shadow-xl flex flex-col md:flex-row items-center justify-between gap-4">
        
        <div className="flex items-center gap-3.5 w-full md:w-auto">
          <div className="w-12 h-12 rounded-2xl bg-indigo-600 text-amber-300 border border-indigo-400/40 flex items-center justify-center shrink-0 shadow-inner">
            <Building2 className="w-6 h-6" />
          </div>

          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-base sm:text-lg font-black text-white">
                {currentAccount?.storeName || "اسم المتجر"}
              </h2>
              <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 border border-emerald-400/40 text-emerald-300 text-[10px] font-black flex items-center gap-1">
                <span>حساب مُعتمد ونشط</span>
              </span>
              {currentAccount?.taxEnabled ? (
                <span className="px-2 py-0.5 rounded-full bg-indigo-500/30 border border-indigo-400/40 text-indigo-200 text-[10px] font-bold">
                  ضريبة VAT ({currentAccount.taxRate ?? 15}%) 🌐
                </span>
              ) : (
                <span className="px-2 py-0.5 rounded-full bg-slate-800/80 border border-slate-700 text-slate-300 text-[10px] font-bold">
                  ضريبة معفاة / مقطوعة (0%) 🇾🇪
                </span>
              )}
            </div>

            <div className="text-xs text-indigo-200 flex flex-wrap items-center gap-x-3 gap-y-1 mt-1 font-medium">
              <span>التاجر: <strong className="text-white font-bold">{currentAccount?.ownerName || "المالك"}</strong></span>
              <span className="text-indigo-400">•</span>
              <span className="font-mono text-indigo-300">س.ت: {currentAccount?.commercialReg || "—"}</span>
              <span className="text-indigo-400">•</span>
              <span className="text-indigo-200">الجوال: <strong className="text-white font-mono">{currentAccount?.phone || "—"}</strong></span>
              <span className="text-indigo-400">•</span>
              <span className="text-indigo-200">{currentAccount?.city || "صنعاء"} - {currentAccount?.district || "العاصمة"}</span>
            </div>
          </div>
        </div>

        {/* Subscription Info Badge & Actions */}
        <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto justify-end">
          
          <div className="px-3.5 py-2 rounded-2xl bg-indigo-900/60 border border-indigo-700/60 text-right space-y-0.5">
            <div className="flex items-center gap-1.5 text-amber-300 font-extrabold text-xs">
              <span>{currentAccount?.subscription?.planNameAr || "الباقة الاحترافية"}</span>
            </div>
            <p className="text-[10px] text-indigo-200 font-bold">
              تاريخ التجديد: {currentAccount?.subscription?.endDate || "2025-12-31"}
            </p>
          </div>

          {/* Action Buttons: 1. WhatsApp Status, 2. Customer Service, 3. Settings, 4. Subscriptions, 5. Logout */}
          <div className="flex items-center gap-2 flex-wrap">
            {/* WhatsApp Live Status Badge (Green/Red) */}
            <WhatsAppLiveStatusBadge
              compact
              onOpenSettings={() => setIsSettingsModalOpen(true)}
            />

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
              title="إعدادات المتجر والموقع"
            >
              <Settings className="w-4 h-4 text-indigo-200" />
              <span>الإعدادات ⚙️</span>
            </button>

            {/* 3. الاشتراكات */}
            <button
              type="button"
              onClick={() => setIsSubscriptionModalOpen(true)}
              className="px-3.5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-extrabold text-xs transition-all flex items-center justify-center gap-1.5 shadow-xs hover:scale-[1.02] whitespace-nowrap cursor-pointer"
              title="نظام الاشتراكات"
            >
              <span>الاشتراكات 💳</span>
            </button>

            {/* 4. خروج */}
            <button
              type="button"
              onClick={onLogout}
              title="تسجيل الخروج"
              className="px-3.5 py-2.5 rounded-xl bg-rose-500/20 hover:bg-rose-500/30 text-rose-200 font-extrabold text-xs transition-all flex items-center justify-center gap-1.5 border border-rose-500/30 hover:scale-[1.02] whitespace-nowrap cursor-pointer"
            >
              <LogOut className="w-4 h-4" />
              <span>خروج 🚪</span>
            </button>
          </div>
        </div>
      </div>

      {/* SUBSCRIPTION MODAL */}
      {isSubscriptionModalOpen && currentAccount && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
          <div className="max-w-3xl w-full bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden p-6 sm:p-8 space-y-6 relative my-8">
            
            <button
              onClick={() => setIsSubscriptionModalOpen(false)}
              className="absolute top-5 left-5 p-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-600 dark:text-slate-400"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="space-y-2 text-right">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 font-extrabold text-xs">
                <Crown className="w-4 h-4" />
                <span>تفاصيل الاشتراك وإدارة الباقات B2B</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
                حالة اشتراك المتجر: {currentAccount.storeName}
              </h2>
            </div>

            {upgradeSuccessMsg && (
              <div className="p-3.5 rounded-2xl bg-emerald-500 text-white font-extrabold text-xs text-center animate-bounce">
                {upgradeSuccessMsg}
              </div>
            )}

            {/* Current Active Subscription Status Card */}
            {(() => {
              const sub = currentAccount.subscription;
              const calculateDaysRemaining = (endDateStr: string) => {
                if (!endDateStr) return 0;
                const end = new Date(endDateStr);
                const today = new Date();
                const diffTime = end.getTime() - today.getTime();
                const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                return diffDays > 0 ? diffDays : 0;
              };
              const daysLeft = calculateDaysRemaining(sub.endDate);
              const isYearly = sub.billingCycle === "YEARLY" || !sub.billingCycle;

              return (
                <div className="p-5 rounded-2xl bg-slate-900 text-white space-y-4 border border-indigo-800 shadow-xl">
                  <div className="flex flex-wrap items-center justify-between gap-3 border-b border-indigo-800 pb-3">
                    <div>
                      <span className="text-[10px] text-indigo-300 font-bold block">تفاصيل الباقة ونوع الاشتراك:</span>
                      <div className="text-lg font-black text-amber-300 flex items-center gap-2 flex-wrap">
                        <span>{sub.planNameAr}</span>
                        <span className="px-2 py-0.5 rounded-md bg-indigo-800 text-indigo-100 text-[10px] font-black border border-indigo-600">
                          {isYearly ? "اشتراك سنوي 📅" : "اشتراك شهري 🗓️"}
                        </span>
                        <span className="px-2 py-0.5 rounded-md bg-emerald-500 text-slate-950 text-[10px] font-black">
                          نشط 🟢
                        </span>
                      </div>
                    </div>

                    <div className="text-left font-mono space-y-1">
                      <div className="text-sm font-extrabold text-amber-300">
                        {isYearly 
                          ? `${(sub.priceMonthly * 10).toLocaleString("ar-YE")} ر.ي / سنة`
                          : `${sub.priceMonthly.toLocaleString("ar-YE")} ر.ي / شهر`}
                      </div>
                      <div className="text-[11px] text-emerald-400 font-extrabold flex items-center gap-1 justify-end">
                        <Clock className="w-3.5 h-3.5 text-emerald-400" />
                        <span>متبقي: {daysLeft} يوم</span>
                      </div>
                    </div>
                  </div>

                  {/* Dates Grid: Start Date, Expiry Date, Remaining Validity */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
                    <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-right">
                      <span className="text-[10px] text-slate-400 font-bold block flex items-center gap-1">
                        <Calendar className="w-3 h-3 text-indigo-400" />
                        تاريخ بداية الاشتراك:
                      </span>
                      <strong className="text-white text-xs font-mono font-bold block mt-0.5">
                        {sub.startDate || "غير محدد"}
                      </strong>
                    </div>

                    <div className="p-2.5 rounded-xl bg-slate-950 border border-amber-500/40 text-right">
                      <span className="text-[10px] text-amber-400 font-bold block flex items-center gap-1">
                        <Calendar className="w-3 h-3 text-amber-400" />
                        تاريخ صلاحية الاشتراك (الانتهاء):
                      </span>
                      <strong className="text-amber-300 text-xs font-mono font-black block mt-0.5">
                        {sub.endDate || "غير محدد"}
                      </strong>
                    </div>

                    <div className="p-2.5 rounded-xl bg-slate-950 border border-indigo-800 text-right">
                      <span className="text-[10px] text-indigo-300 font-bold block flex items-center gap-1">
                        <Clock className="w-3 h-3 text-emerald-400" />
                        حالة التجديد والصلاحية:
                      </span>
                      <strong className="text-emerald-400 text-xs font-bold block mt-0.5">
                        {daysLeft > 0 ? `صالح لمدة ${daysLeft} يوماً` : "منتهي الاشتراك ⚠️"}
                      </strong>
                    </div>
                  </div>

                  {/* Limits */}
                  <div className="grid grid-cols-3 gap-2 text-center text-xs">
                    <div className="p-2 rounded-xl bg-indigo-950 border border-indigo-800">
                      <span className="text-[10px] text-indigo-300 block">حد المستودعات</span>
                      <strong className="text-amber-300 text-xs font-black">
                        {sub.maxWarehouses} مستودعات
                      </strong>
                    </div>

                    <div className="p-2 rounded-xl bg-indigo-950 border border-indigo-800">
                      <span className="text-[10px] text-indigo-300 block">حد الأصناف</span>
                      <strong className="text-amber-300 text-xs font-black">
                        {sub.maxItems} صنف
                      </strong>
                    </div>

                    <div className="p-2 rounded-xl bg-indigo-950 border border-indigo-800">
                      <span className="text-[10px] text-indigo-300 block">نقاط POS</span>
                      <strong className="text-amber-300 text-xs font-black">
                        {sub.maxPOSRegisters} نقاط
                      </strong>
                    </div>
                  </div>

                  {/* Unlocked features list */}
                  <div className="pt-1">
                    <span className="text-[11px] text-indigo-200 font-bold block mb-1">المميزات المفعلة في باقتك:</span>
                    <div className="flex flex-wrap gap-2 text-[10px]">
                      {sub.features.map((feat, idx) => (
                        <span key={idx} className="px-2.5 py-1 rounded-lg bg-indigo-900 text-indigo-100 border border-indigo-700 font-bold">
                          ✔️ {feat}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              );
            })()}

            {/* Subscription Options (Monthly vs Yearly) */}
            <div className="space-y-4">
              <h3 className="font-black text-sm text-slate-900 dark:text-white">
                اختر قسم ونظام الاشتراك للتجديد أو التغيير:
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Yearly Merchant Subscription */}
                <div
                  className={`p-5 rounded-2xl border transition-all text-right space-y-3 relative ${
                    (currentAccount.subscription.billingCycle || "YEARLY") === "YEARLY"
                      ? "border-amber-500 bg-amber-50 dark:bg-amber-950/60 ring-2 ring-amber-500"
                      : "border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800"
                  }`}
                >
                  <span className="absolute -top-2.5 left-3 px-2.5 py-0.5 rounded-full bg-amber-500 text-slate-950 text-[10px] font-black shadow-xs">
                    توفير 10,000 ر.ي 🎉
                  </span>
                  <div>
                    <div className="font-black text-sm text-slate-900 dark:text-white flex items-center gap-1.5">
                      <Sparkles className="w-4 h-4 text-amber-500" />
                      <span>فئة الاشتراك السنوي للتجار</span>
                    </div>
                    <div className="text-sm text-amber-600 dark:text-amber-400 font-black mt-1">
                      50,000 ريال يمني / سنة
                      <span className="block text-[10px] text-slate-500 line-through">60,000 ر.ي (بدون خصم)</span>
                    </div>
                  </div>
                  <ul className="text-xs text-slate-600 dark:text-slate-400 space-y-1 font-bold">
                    <li>• صلاحية 365 يوماً كاملة</li>
                    <li>• كافة خدمات وربط المنصة والمصانع</li>
                    <li>• إدارة كاملة للمستودعات ونقاط البيع</li>
                  </ul>
                  <button
                    onClick={() => handlePlanUpgradeSubmit("PROFESSIONAL", "YEARLY")}
                    className="w-full py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs transition-colors shadow-md"
                  >
                    {(currentAccount.subscription.billingCycle || "YEARLY") === "YEARLY"
                      ? "نظام الاشتراك الحالي (سنوي) ✓"
                      : "تحويل إلى الاشتراك السنوي ⭐"}
                  </button>
                </div>

                {/* Monthly Merchant Subscription */}
                <div
                  className={`p-5 rounded-2xl border transition-all text-right space-y-3 ${
                    currentAccount.subscription.billingCycle === "MONTHLY"
                      ? "border-indigo-600 bg-indigo-50 dark:bg-indigo-950/60 ring-2 ring-indigo-500"
                      : "border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800"
                  }`}
                >
                  <div>
                    <div className="font-black text-sm text-slate-900 dark:text-white flex items-center gap-1.5">
                      <Calendar className="w-4 h-4 text-indigo-500" />
                      <span>فئة الاشتراك الشهري للتجار</span>
                    </div>
                    <div className="text-sm text-indigo-600 dark:text-indigo-400 font-black mt-1">
                      5,000 ريال يمني / شهر
                    </div>
                  </div>
                  <ul className="text-xs text-slate-600 dark:text-slate-400 space-y-1 font-bold">
                    <li>• تجديد شهري ميسر بـ 5,000 ر.ي</li>
                    <li>• إمكانية التحويل للسنوي في أي وقت</li>
                    <li>• صلاحية شهر كامل بكافة الصلاحيات</li>
                  </ul>
                  <button
                    onClick={() => handlePlanUpgradeSubmit("PROFESSIONAL", "MONTHLY")}
                    className="w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-black text-xs transition-colors shadow-md"
                  >
                    {currentAccount.subscription.billingCycle === "MONTHLY"
                      ? "نظام الاشتراك الحالي (شهري) ✓"
                      : "تحويل إلى الاشتراك الشهري 🗓️"}
                  </button>
                </div>
              </div>
            </div>

            {/* Platform Admin Contact & Location Info */}
            <PlatformInfoBox variant="banner" title="بيانات التواصل مع إدارة المنصة المركزية B2B" />

            <div className="pt-2 text-center">
              <button
                onClick={() => setIsSubscriptionModalOpen(false)}
                className="px-6 py-2.5 rounded-2xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold text-xs"
              >
                إغلاق
              </button>
            </div>

          </div>
        </div>
      )}

      {/* PLATFORM INFO FULL SCREEN PAGE FOR MERCHANT */}
      {showPlatformPage && (
        <div className="fixed inset-0 z-50 bg-slate-950 text-white min-h-screen p-6 sm:p-12 lg:p-16 overflow-y-auto dir-rtl flex flex-col justify-between space-y-8">
          <div className="flex items-center justify-between border-b border-slate-800 pb-6">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-2xl bg-purple-600 text-white shadow-lg">
                <Building2 className="w-8 h-8" />
              </div>
              <div>
                <h2 className="text-2xl font-black text-white">
                  صفحة إدارة وتواصل المنصة المركزية B2B
                </h2>
                <p className="text-sm text-slate-400 mt-1">
                  المعلومات الرسمية الموحدة للتوثيق، التواصل الفني المباشر، والدعم اللوجستي للتجار
                </p>
              </div>
            </div>

            <button
              onClick={() => setShowPlatformPage(false)}
              className="px-5 py-2.5 rounded-2xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs flex items-center gap-2 transition-all"
            >
              <X className="w-5 h-5 text-amber-300" />
              <span>إغلاق الصفحة والعودة للوحة التحكم</span>
            </button>
          </div>

          <div className="flex-1 py-4">
            <PlatformInfoBox variant="full-card" title="تفاصيل الربط والمقر الرئيسي لمنصة إمداد الجملة" />
          </div>

          <div className="pt-6 border-t border-slate-800 text-center">
            <button
              onClick={() => setShowPlatformPage(false)}
              className="px-8 py-3.5 rounded-2xl bg-purple-600 hover:bg-purple-500 text-white font-extrabold text-sm shadow-xl transition-all"
            >
              العودة للوحة التحكم الرئيسية للمتجر
            </button>
          </div>
        </div>
      )}

      {/* Merchant Settings & Location Modal */}
      <MerchantSettingsModal
        isOpen={isSettingsModalOpen}
        onClose={() => setIsSettingsModalOpen(false)}
        currentAccount={currentAccount}
      />
    </>
  );
};
