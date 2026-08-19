import React, { useState, useEffect } from "react";
import {
  CreditCard,
  Sparkles,
  Percent,
  Plus,
  Trash2,
  CheckCircle,
  Save,
  RotateCcw,
  Tag,
  Calendar,
  Building2,
  Store,
  DollarSign,
  Megaphone,
  AlertCircle,
  X,
  Edit2,
  ShieldCheck,
} from "lucide-react";
import {
  PlatformSubscriptionSettings,
  SubscriptionPlanConfig,
  SpecialOfferConfig,
  MerchantAccount,
} from "../../types";
import { storeService } from "../../services/storeService";

export const SubscriptionManagement: React.FC = () => {
  const [settings, setSettings] = useState<PlatformSubscriptionSettings>(() =>
    storeService.getSubscriptionSettings()
  );
  const [merchants, setMerchants] = useState<MerchantAccount[]>(() =>
    storeService.getMerchantAccounts()
  );
  const [activeSubSection, setActiveSubSection] = useState<
    "MERCHANT_PLANS" | "FACTORY_PLANS" | "SPECIAL_OFFERS" | "PROMO_BANNER" | "PENDING_REQUESTS"
  >("MERCHANT_PLANS");

  const [savedSuccessMsg, setSavedSuccessMsg] = useState<string | null>(null);

  // Modal State for Adding New Offer
  const [isAddOfferModalOpen, setIsAddOfferModalOpen] = useState(false);
  const [newOfferTitle, setNewOfferTitle] = useState("");
  const [newOfferBadge, setNewOfferBadge] = useState("خصم خاص 🎁");
  const [newOfferDiscount, setNewOfferDiscount] = useState<number>(15);
  const [newOfferTarget, setNewOfferTarget] = useState<"ALL" | "MERCHANT" | "FACTORY">("ALL");
  const [newOfferValidUntil, setNewOfferValidUntil] = useState("2026-12-31");
  const [newOfferCode, setNewOfferCode] = useState("DISCOUNT2026");
  const [newOfferDesc, setNewOfferDesc] = useState("");

  // Feature Input Helpers for Plan Editing
  const [newFeatureText, setNewFeatureText] = useState<{ [planId: string]: string }>({});

  useEffect(() => {
    const unsub = storeService.subscribe(() => {
      setSettings(storeService.getSubscriptionSettings());
      setMerchants(storeService.getMerchantAccounts());
    });
    return unsub;
  }, []);

  const handleApproveSubscriptionUpgrade = (id: string, storeName: string, planName?: string) => {
    storeService.approveMerchantSubscriptionUpgrade(id);
    setMerchants(storeService.getMerchantAccounts());
    setSavedSuccessMsg(`🟢 تمت الموافقة واعتماد ترقية باقة المتجر "${storeName}" إلى "${planName || 'الباقة المطلوبة'}" بنجاح!`);
    setTimeout(() => setSavedSuccessMsg(null), 4000);
  };

  const handleRejectSubscriptionUpgrade = (id: string, storeName: string) => {
    storeService.rejectMerchantSubscriptionUpgrade(id);
    setMerchants(storeService.getMerchantAccounts());
    setSavedSuccessMsg(`❌ تم رفض طلب ترقية الباقة للمتجر "${storeName}".`);
    setTimeout(() => setSavedSuccessMsg(null), 4000);
  };

  const handleSaveAll = () => {
    storeService.updateSubscriptionSettings(settings);
    setSavedSuccessMsg("تم حفظ وتطبيق تعديلات خطط الاشتراكات والأسعار والعروض بنجاح 🟢");
    setTimeout(() => setSavedSuccessMsg(null), 4000);
  };

  const handleResetDefaults = () => {
    if (confirm("هل أنت أصلح من استعادة الأسعار والعروض الافتراضية للمنصة؟")) {
      const def = storeService.resetSubscriptionSettingsToDefault();
      setSettings(def);
      setSavedSuccessMsg("تمت استعادة الأسعار والعروض الافتراضية بنجاح 🔄");
      setTimeout(() => setSavedSuccessMsg(null), 4000);
    }
  };

  const handleUpdatePlan = (
    planId: string,
    updates: Partial<SubscriptionPlanConfig>
  ) => {
    const updatedPlans = settings.plans.map((p) =>
      p.id === planId ? { ...p, ...updates } : p
    );
    const newSettings = { ...settings, plans: updatedPlans };
    setSettings(newSettings);
    storeService.updateSubscriptionSettings(newSettings);
  };

  const handleAddFeatureToPlan = (planId: string) => {
    const text = newFeatureText[planId]?.trim();
    if (!text) return;
    const plan = settings.plans.find((p) => p.id === planId);
    if (!plan) return;

    handleUpdatePlan(planId, {
      features: [...plan.features, text],
    });
    setNewFeatureText((prev) => ({ ...prev, [planId]: "" }));
  };

  const handleRemoveFeatureFromPlan = (planId: string, featureIndex: number) => {
    const plan = settings.plans.find((p) => p.id === planId);
    if (!plan) return;
    const updated = plan.features.filter((_, idx) => idx !== featureIndex);
    handleUpdatePlan(planId, { features: updated });
  };

  const handleToggleOfferStatus = (offerId: string) => {
    const updatedOffers = settings.specialOffers.map((off) =>
      off.id === offerId ? { ...off, isActive: !off.isActive } : off
    );
    const newSettings = { ...settings, specialOffers: updatedOffers };
    setSettings(newSettings);
    storeService.updateSubscriptionSettings(newSettings);
  };

  const handleDeleteOffer = (offerId: string) => {
    if (confirm("هل أنت أصلح من حذف هذا العرض الخاص نهائياً؟")) {
      const updatedOffers = settings.specialOffers.filter((o) => o.id !== offerId);
      const newSettings = { ...settings, specialOffers: updatedOffers };
      setSettings(newSettings);
      storeService.updateSubscriptionSettings(newSettings);
    }
  };

  const handleCreateNewOffer = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newOfferTitle.trim()) {
      alert("يرجى إدخال عنوان العرض الخاص");
      return;
    }

    const newOffer: SpecialOfferConfig = {
      id: `OFFER_${Date.now()}`,
      title: newOfferTitle.trim(),
      badge: newOfferBadge.trim() || "عرض خاص 🎁",
      discountPercent: Number(newOfferDiscount) || 10,
      targetType: newOfferTarget,
      validUntil: newOfferValidUntil || "2026-12-31",
      description: newOfferDesc.trim() || "عرض خاص ومميز مقدّم من منصة إمداد B2B",
      code: newOfferCode.trim().toUpperCase() || "B2B2026",
      isActive: true,
    };

    const newSettings = {
      ...settings,
      specialOffers: [newOffer, ...settings.specialOffers],
    };
    setSettings(newSettings);
    storeService.updateSubscriptionSettings(newSettings);

    setIsAddOfferModalOpen(false);
    setNewOfferTitle("");
    setNewOfferDesc("");
    setSavedSuccessMsg("تم إضافة العرض الخاص والخصم بنجاح 🎉");
    setTimeout(() => setSavedSuccessMsg(null), 4000);
  };

  const merchantPlans = settings.plans.filter((p) => p.targetType === "MERCHANT");
  const factoryPlans = settings.plans.filter((p) => p.targetType === "FACTORY");

  return (
    <div className="space-y-6 dir-rtl text-right">
      {/* Top Banner Header */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white p-6 sm:p-8 rounded-3xl shadow-xl border border-indigo-900/50 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 -mt-10 -mr-10 w-48 h-48 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex items-center gap-4 z-10">
          <div className="p-4 rounded-2xl bg-amber-500/20 border border-amber-400/30 text-amber-400">
            <CreditCard className="w-8 h-8" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl sm:text-2xl font-extrabold tracking-tight">
                إدارة خطط الاشتراكات والأسعار والعروض الخاصة
              </h2>
              <span className="px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 text-[11px] font-bold border border-amber-400/30">
                تحكم مالي شامل 💳
              </span>
            </div>
            <p className="text-xs text-slate-300 mt-1 max-w-2xl">
              تحديث أسعار باقات التجار والمصانع السنوية والشهرية، تخصيص شارات الخصومات، وإدارة الكوبونات والعروض الترويجية الفعالة
            </p>
          </div>
        </div>

        {/* Global Action Buttons */}
        <div className="flex items-center gap-2.5 z-10 w-full sm:w-auto">
          <button
            type="button"
            onClick={handleSaveAll}
            className="flex-1 sm:flex-initial px-4 py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <Save className="w-4 h-4" />
            <span>حفظ كافة التغييرات 💾</span>
          </button>

          <button
            type="button"
            onClick={handleResetDefaults}
            className="px-3.5 py-3 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-extrabold text-xs transition-all flex items-center gap-1.5 border border-slate-700 cursor-pointer"
            title="استعادة الأسعار الافتراضية"
          >
            <RotateCcw className="w-4 h-4" />
            <span>افتراضي 🔄</span>
          </button>
        </div>
      </div>

      {/* Success Alert Toast */}
      {savedSuccessMsg && (
        <div className="p-4 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-800 dark:text-emerald-200 text-xs font-extrabold flex items-center justify-between shadow-xs animate-fade-in">
          <div className="flex items-center gap-2">
            <CheckCircle className="w-5 h-5 text-emerald-500" />
            <span>{savedSuccessMsg}</span>
          </div>
          <button onClick={() => setSavedSuccessMsg(null)} className="text-slate-400 hover:text-slate-600">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Navigation Sub-Tabs */}
      <div className="flex flex-wrap items-center gap-2 bg-white dark:bg-slate-900 p-2 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
        <button
          type="button"
          onClick={() => setActiveSubSection("MERCHANT_PLANS")}
          className={`flex-1 min-w-[140px] px-4 py-2.5 rounded-xl font-extrabold text-xs transition-all flex items-center justify-center gap-2 cursor-pointer ${
            activeSubSection === "MERCHANT_PLANS"
              ? "bg-amber-500 text-slate-950 shadow-xs"
              : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
          }`}
        >
          <Store className="w-4 h-4" />
          <span>باقات التجار ({merchantPlans.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveSubSection("FACTORY_PLANS")}
          className={`flex-1 min-w-[140px] px-4 py-2.5 rounded-xl font-extrabold text-xs transition-all flex items-center justify-center gap-2 cursor-pointer ${
            activeSubSection === "FACTORY_PLANS"
              ? "bg-indigo-600 text-white shadow-xs"
              : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
          }`}
        >
          <Building2 className="w-4 h-4" />
          <span>باقات المصانع ({factoryPlans.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveSubSection("SPECIAL_OFFERS")}
          className={`flex-1 min-w-[140px] px-4 py-2.5 rounded-xl font-extrabold text-xs transition-all flex items-center justify-center gap-2 cursor-pointer ${
            activeSubSection === "SPECIAL_OFFERS"
              ? "bg-emerald-600 text-white shadow-xs"
              : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
          }`}
        >
          <Tag className="w-4 h-4" />
          <span>العروض والخصومات ({settings.specialOffers.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveSubSection("PROMO_BANNER")}
          className={`flex-1 min-w-[140px] px-4 py-2.5 rounded-xl font-extrabold text-xs transition-all flex items-center justify-center gap-2 cursor-pointer ${
            activeSubSection === "PROMO_BANNER"
              ? "bg-purple-600 text-white shadow-xs"
              : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
          }`}
        >
          <Megaphone className="w-4 h-4" />
          <span>الشريط الترويجي العام</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveSubSection("PENDING_REQUESTS")}
          className={`flex-1 min-w-[140px] px-4 py-2.5 rounded-xl font-extrabold text-xs transition-all flex items-center justify-center gap-2 cursor-pointer ${
            activeSubSection === "PENDING_REQUESTS"
              ? "bg-amber-600 text-white shadow-xs"
              : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
          } ${
            merchants.filter((m) => m.pendingSubscriptionChange?.status === "PENDING_APPROVAL").length > 0
              ? "animate-pulse border border-amber-400 dark:border-amber-600"
              : ""
          }`}
        >
          <Sparkles className="w-4 h-4 text-amber-300" />
          <span>طلبات ترقية الباقات</span>
          <span
            className={`px-1.5 py-0.2 rounded-full text-[10px] font-black ${
              merchants.filter((m) => m.pendingSubscriptionChange?.status === "PENDING_APPROVAL").length > 0
                ? "bg-amber-500 text-white"
                : "bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300"
            }`}
          >
            {merchants.filter((m) => m.pendingSubscriptionChange?.status === "PENDING_APPROVAL").length}
          </span>
        </button>
      </div>

      {/* ========================================================= */}
      {/* SECTION 1: MERCHANT SUBSCRIPTION PLANS */}
      {/* ========================================================= */}
      {activeSubSection === "MERCHANT_PLANS" && (
        <div className="space-y-6">
          <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
            <div>
              <h3 className="font-extrabold text-slate-900 dark:text-white text-base flex items-center gap-2">
                <Store className="w-5 h-5 text-amber-500" />
                <span>إدارة أسعار وباقات التجار والمحلات التجارية</span>
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                تعديل قيم الاشتراك السنوي والشهري للتجار، شارات التوفير، والمميزات المفعلة
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {merchantPlans.map((plan) => (
              <div
                key={plan.id}
                className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-5 relative"
              >
                {/* Active Toggle Switch Header */}
                <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
                  <div className="flex items-center gap-2">
                    <span className="p-2 rounded-xl bg-amber-500/10 text-amber-500 font-black text-xs">
                      {plan.cycle === "YEARLY" ? "اشتراك سنوي 📅" : "اشتراك شهري 📆"}
                    </span>
                    <h4 className="font-extrabold text-slate-900 dark:text-white text-sm">
                      {plan.title}
                    </h4>
                  </div>

                  <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-slate-600 dark:text-slate-400">
                    <span>{plan.isActive ? "الباقة مفعلة 🟢" : "الباقة معطلة 🔴"}</span>
                    <input
                      type="checkbox"
                      checked={plan.isActive}
                      onChange={(e) =>
                        handleUpdatePlan(plan.id, { isActive: e.target.checked })
                      }
                      className="w-4 h-4 text-amber-500 rounded-sm focus:ring-amber-500 cursor-pointer"
                    />
                  </label>
                </div>

                {/* Editable Inputs */}
                <div className="space-y-4 text-xs">
                  <div>
                    <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                      عنوان الباقة الأساسي
                    </label>
                    <input
                      type="text"
                      value={plan.title}
                      onChange={(e) =>
                        handleUpdatePlan(plan.id, { title: e.target.value })
                      }
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-bold"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                        السعر الفعلي ({plan.currency}) *
                      </label>
                      <input
                        type="number"
                        value={plan.price}
                        onChange={(e) =>
                          handleUpdatePlan(plan.id, {
                            price: Number(e.target.value),
                          })
                        }
                        className="w-full px-3.5 py-2.5 rounded-xl border border-amber-400 dark:border-amber-800 bg-amber-50/40 dark:bg-amber-950/20 text-amber-900 dark:text-amber-200 font-extrabold text-sm"
                      />
                    </div>

                    <div>
                      <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                        السعر الأصلي قبل الخصم ({plan.currency})
                      </label>
                      <input
                        type="number"
                        value={plan.originalPrice || ""}
                        onChange={(e) =>
                          handleUpdatePlan(plan.id, {
                            originalPrice: Number(e.target.value) || undefined,
                          })
                        }
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 text-slate-500 dark:text-slate-400 font-bold"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                      شارة الخصم / التوفير السريعة (تظهر أعلى الباقة)
                    </label>
                    <input
                      type="text"
                      value={plan.discountBadge || ""}
                      onChange={(e) =>
                        handleUpdatePlan(plan.id, { discountBadge: e.target.value })
                      }
                      placeholder="مثال: توفير 10,000 ر.ي 🎉"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 text-amber-600 dark:text-amber-400 font-bold"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                      وصف الباقة الفني
                    </label>
                    <textarea
                      rows={2}
                      value={plan.description}
                      onChange={(e) =>
                        handleUpdatePlan(plan.id, { description: e.target.value })
                      }
                      className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-medium"
                    />
                  </div>

                  {/* Features Manager */}
                  <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                    <label className="block font-bold text-slate-800 dark:text-slate-200">
                      قائمة المميزات المضمنة في الباقة:
                    </label>
                    <div className="space-y-1.5">
                      {plan.features.map((feat, idx) => (
                        <div
                          key={idx}
                          className="flex items-center justify-between p-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700/60 text-xs font-bold text-slate-800 dark:text-slate-200"
                        >
                          <span className="flex items-center gap-1.5">
                            <CheckCircle className="w-3.5 h-3.5 text-emerald-500" />
                            <span>{feat}</span>
                          </span>
                          <button
                            type="button"
                            onClick={() => handleRemoveFeatureFromPlan(plan.id, idx)}
                            className="text-rose-500 hover:text-rose-600 p-1 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/40 cursor-pointer"
                            title="حذف الميزة"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ))}
                    </div>

                    <div className="flex items-center gap-2 pt-1">
                      <input
                        type="text"
                        value={newFeatureText[plan.id] || ""}
                        onChange={(e) =>
                          setNewFeatureText((prev) => ({
                            ...prev,
                            [plan.id]: e.target.value,
                          }))
                        }
                        placeholder="إضافة ميزة جديدة للباقة..."
                        className="flex-1 px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 text-xs font-bold"
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            e.preventDefault();
                            handleAddFeatureToPlan(plan.id);
                          }
                        }}
                      />
                      <button
                        type="button"
                        onClick={() => handleAddFeatureToPlan(plan.id)}
                        className="px-3 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs flex items-center gap-1 cursor-pointer"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>إضافة</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* SECTION 2: FACTORY SUBSCRIPTION PLANS */}
      {/* ========================================================= */}
      {activeSubSection === "FACTORY_PLANS" && (
        <div className="space-y-6">
          <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
            <div>
              <h3 className="font-extrabold text-slate-900 dark:text-white text-base flex items-center gap-2">
                <Building2 className="w-5 h-5 text-indigo-500" />
                <span>إدارة أسعار وباقات المصانع والمنتجين الوطنيين</span>
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                تحديد اشتراكات تراخيص المصانع والمنتجين وتحديث المزايا التجارية الممنوحة
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {factoryPlans.map((plan) => (
              <div
                key={plan.id}
                className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-5 relative"
              >
                {/* Active Toggle Switch Header */}
                <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
                  <div className="flex items-center gap-2">
                    <span className="p-2 rounded-xl bg-indigo-500/10 text-indigo-500 font-black text-xs">
                      {plan.cycle === "YEARLY" ? "ترخيص سنوي 👑" : "ترخيص شهري 🏭"}
                    </span>
                    <h4 className="font-extrabold text-slate-900 dark:text-white text-sm">
                      {plan.title}
                    </h4>
                  </div>

                  <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-slate-600 dark:text-slate-400">
                    <span>{plan.isActive ? "الباقة مفعلة 🟢" : "الباقة معطلة 🔴"}</span>
                    <input
                      type="checkbox"
                      checked={plan.isActive}
                      onChange={(e) =>
                        handleUpdatePlan(plan.id, { isActive: e.target.checked })
                      }
                      className="w-4 h-4 text-indigo-600 rounded-sm focus:ring-indigo-500 cursor-pointer"
                    />
                  </label>
                </div>

                {/* Editable Inputs */}
                <div className="space-y-4 text-xs">
                  <div>
                    <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                      عنوان الترخيص/الباقة للمصنع
                    </label>
                    <input
                      type="text"
                      value={plan.title}
                      onChange={(e) =>
                        handleUpdatePlan(plan.id, { title: e.target.value })
                      }
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-bold"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                        السعر ({plan.currency}) *
                      </label>
                      <input
                        type="number"
                        value={plan.price}
                        onChange={(e) =>
                          handleUpdatePlan(plan.id, {
                            price: Number(e.target.value),
                          })
                        }
                        className="w-full px-3.5 py-2.5 rounded-xl border border-indigo-400 dark:border-indigo-800 bg-indigo-50/40 dark:bg-indigo-950/20 text-indigo-900 dark:text-indigo-200 font-extrabold text-sm"
                      />
                    </div>

                    <div>
                      <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                        السعر الأصلي قبل الخصم ({plan.currency})
                      </label>
                      <input
                        type="number"
                        value={plan.originalPrice || ""}
                        onChange={(e) =>
                          handleUpdatePlan(plan.id, {
                            originalPrice: Number(e.target.value) || undefined,
                          })
                        }
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 text-slate-500 dark:text-slate-400 font-bold"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                      شارة الخصم / التاج الترويجي للمصانع
                    </label>
                    <input
                      type="text"
                      value={plan.discountBadge || ""}
                      onChange={(e) =>
                        handleUpdatePlan(plan.id, { discountBadge: e.target.value })
                      }
                      placeholder="مثال: خصم العصر الذهبي للمصانع 👑"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 font-bold"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                      وصف الباقة للمصنع
                    </label>
                    <textarea
                      rows={2}
                      value={plan.description}
                      onChange={(e) =>
                        handleUpdatePlan(plan.id, { description: e.target.value })
                      }
                      className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-medium"
                    />
                  </div>

                  {/* Features Manager */}
                  <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                    <label className="block font-bold text-slate-800 dark:text-slate-200">
                      قائمة المميزات المضمنة في ترخيص المصنع:
                    </label>
                    <div className="space-y-1.5">
                      {plan.features.map((feat, idx) => (
                        <div
                          key={idx}
                          className="flex items-center justify-between p-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700/60 text-xs font-bold text-slate-800 dark:text-slate-200"
                        >
                          <span className="flex items-center gap-1.5">
                            <CheckCircle className="w-3.5 h-3.5 text-indigo-500" />
                            <span>{feat}</span>
                          </span>
                          <button
                            type="button"
                            onClick={() => handleRemoveFeatureFromPlan(plan.id, idx)}
                            className="text-rose-500 hover:text-rose-600 p-1 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/40 cursor-pointer"
                            title="حذف الميزة"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ))}
                    </div>

                    <div className="flex items-center gap-2 pt-1">
                      <input
                        type="text"
                        value={newFeatureText[plan.id] || ""}
                        onChange={(e) =>
                          setNewFeatureText((prev) => ({
                            ...prev,
                            [plan.id]: e.target.value,
                          }))
                        }
                        placeholder="إضافة ميزة جديدة لترخيص المصنع..."
                        className="flex-1 px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 text-xs font-bold"
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            e.preventDefault();
                            handleAddFeatureToPlan(plan.id);
                          }
                        }}
                      />
                      <button
                        type="button"
                        onClick={() => handleAddFeatureToPlan(plan.id)}
                        className="px-3 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs flex items-center gap-1 cursor-pointer"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>إضافة</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* SECTION 3: SPECIAL OFFERS & PROMO DISCOUNTS */}
      {/* ========================================================= */}
      {activeSubSection === "SPECIAL_OFFERS" && (
        <div className="space-y-6">
          <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3 flex-wrap gap-4">
            <div>
              <h3 className="font-extrabold text-slate-900 dark:text-white text-base flex items-center gap-2">
                <Tag className="w-5 h-5 text-emerald-500" />
                <span>إدارة العروض الخاصة والخصومات والتخفيضات Tiers & Promos</span>
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                إضافة عروض وتخفيضات موسمية، تخصيص كود الخصم ونسب التخفيض للشركاء
              </p>
            </div>

            <button
              type="button"
              onClick={() => setIsAddOfferModalOpen(true)}
              className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs shadow-md transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>إضافة عرض خاص جديد 🎁</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {settings.specialOffers.map((offer) => (
              <div
                key={offer.id}
                className={`p-6 rounded-3xl border shadow-xs transition-all space-y-4 relative ${
                  offer.isActive
                    ? "bg-white dark:bg-slate-900 border-emerald-500/40 ring-1 ring-emerald-500/20"
                    : "bg-slate-50 dark:bg-slate-900/50 border-slate-200 dark:border-slate-800 opacity-60"
                }`}
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-[11px] font-black border border-emerald-500/20">
                        {offer.badge}
                      </span>
                      <h4 className="font-extrabold text-slate-900 dark:text-white text-sm">
                        {offer.title}
                      </h4>
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                      {offer.description}
                    </p>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => handleToggleOfferStatus(offer.id)}
                      className={`px-2.5 py-1 rounded-lg text-[10px] font-black cursor-pointer ${
                        offer.isActive
                          ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300"
                          : "bg-slate-200 text-slate-700 dark:bg-slate-800 dark:text-slate-300"
                      }`}
                    >
                      {offer.isActive ? "مفعل 🟢" : "معطل 🔴"}
                    </button>

                    <button
                      type="button"
                      onClick={() => handleDeleteOffer(offer.id)}
                      className="p-1.5 text-rose-500 hover:text-rose-600 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/40 cursor-pointer"
                      title="حذف العرض"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-50 dark:bg-slate-800/60 p-3 rounded-2xl border border-slate-200 dark:border-slate-700/50 text-xs">
                  <div>
                    <span className="text-[10px] text-slate-400 block font-bold">نسبة الخصم</span>
                    <strong className="text-emerald-600 dark:text-emerald-400 font-extrabold">
                      {offer.discountPercent}% OFF
                    </strong>
                  </div>

                  <div>
                    <span className="text-[10px] text-slate-400 block font-bold">كود الخصم</span>
                    <strong className="font-mono text-slate-900 dark:text-white font-extrabold">
                      {offer.code || "بدون كود"}
                    </strong>
                  </div>

                  <div>
                    <span className="text-[10px] text-slate-400 block font-bold">الفئة المستهدفة</span>
                    <strong className="text-indigo-600 dark:text-indigo-400 font-bold">
                      {offer.targetType === "ALL"
                        ? "جميع الحسابات"
                        : offer.targetType === "MERCHANT"
                        ? "التجار فقط"
                        : "المصانع فقط"}
                    </strong>
                  </div>

                  <div>
                    <span className="text-[10px] text-slate-400 block font-bold">صالح حتى</span>
                    <strong className="text-slate-700 dark:text-slate-300 font-bold">
                      {offer.validUntil}
                    </strong>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* SECTION 4: PROMO BANNER SETTINGS */}
      {/* ========================================================= */}
      {activeSubSection === "PROMO_BANNER" && (
        <div className="bg-white dark:bg-slate-900 p-6 sm:p-8 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-6">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-2xl bg-purple-500/10 text-purple-600 dark:text-purple-400">
                <Megaphone className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-extrabold text-slate-900 dark:text-white text-base">
                  إدارة الشريط الترويجي العام للمنصة (Announcement Banner)
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  يظهر هذا الشريط في أعلى لوحات تحكم التجار والمصانع للإعلان عن التخفيضات الموسمية والفرص
                </p>
              </div>
            </div>

            <label className="flex items-center gap-2 cursor-pointer text-xs font-extrabold text-slate-700 dark:text-slate-300">
              <span>{settings.isPromoBannerEnabled ? "الشريط مفعّل 🟢" : "الشريط معطل 🔴"}</span>
              <input
                type="checkbox"
                checked={settings.isPromoBannerEnabled}
                onChange={(e) => {
                  const updated = {
                    ...settings,
                    isPromoBannerEnabled: e.target.checked,
                  };
                  setSettings(updated);
                  storeService.updateSubscriptionSettings(updated);
                }}
                className="w-5 h-5 text-purple-600 rounded-sm focus:ring-purple-500 cursor-pointer"
              />
            </label>
          </div>

          <div className="space-y-4 text-xs">
            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                نص الإعلان الترويجي العام *
              </label>
              <textarea
                rows={3}
                value={settings.activePromoBanner || ""}
                onChange={(e) => {
                  const updated = {
                    ...settings,
                    activePromoBanner: e.target.value,
                  };
                  setSettings(updated);
                  storeService.updateSubscriptionSettings(updated);
                }}
                placeholder="أدخل نص العرض الترويجي الذي سيظهر للعملاء والمصانع..."
                className="w-full px-4 py-3 rounded-2xl border border-purple-300 dark:border-purple-800 bg-purple-50/30 dark:bg-purple-950/20 text-purple-950 dark:text-purple-100 font-extrabold text-sm"
              />
            </div>

            {/* Live Preview of Banner */}
            <div className="p-4 rounded-2xl bg-gradient-to-r from-amber-500 via-emerald-600 to-indigo-600 text-white font-extrabold text-xs shadow-md flex items-center justify-between gap-4">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-amber-200 animate-pulse" />
                <span>معاينة خيار الإعلان المباشر: {settings.activePromoBanner || "لا يوجد نص إعلان"}</span>
              </div>
              <span className="px-2.5 py-1 rounded-full bg-white/20 text-white text-[10px]">
                شريط المنصة الفعال
              </span>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* SECTION 5: PENDING SUBSCRIPTION UPGRADE REQUESTS */}
      {/* ========================================================= */}
      {activeSubSection === "PENDING_REQUESTS" && (() => {
        const pendingUpgradeMerchants = merchants.filter(
          (m) => !!m.pendingSubscriptionChange && m.pendingSubscriptionChange.status === "PENDING_APPROVAL"
        );

        return (
          <div className="space-y-6">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
              <div>
                <h3 className="text-base font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                  <span>طلبات ترقية وتعديل الباقات الواردة من التجار</span>
                  <span className="px-2.5 py-0.5 rounded-full bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 text-xs font-black">
                    {pendingUpgradeMerchants.length} طلب
                  </span>
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  مراجعة طلبات الترقية التي قام التجار بإرسالها واعتماد أو رفض الباقة مع إشعار التاجر فورياً
                </p>
              </div>
            </div>

            {pendingUpgradeMerchants.length === 0 ? (
              <div className="text-center py-16 px-4 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 space-y-3">
                <div className="w-16 h-16 rounded-full bg-emerald-50 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto text-2xl">
                  ✓
                </div>
                <div className="font-extrabold text-slate-900 dark:text-white text-base">
                  لا توجد أي طلبات ترقية معلقة حالياً
                </div>
                <p className="text-xs text-slate-500 max-w-md mx-auto">
                  كافة طلبات ترقية وتعديل الباقات تم معالجتها. عندما يطلب أي تاجر ترقية باقته من لوحة تحكمه، ستظهر هنا فوراً.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {pendingUpgradeMerchants.map((merch) => {
                  const pending = merch.pendingSubscriptionChange!;
                  return (
                    <div
                      key={`sub-mgmt-pending-${merch.id}`}
                      className="bg-white dark:bg-slate-900 p-5 rounded-3xl border-2 border-amber-400/60 dark:border-amber-600/40 shadow-sm flex flex-col justify-between gap-4 relative overflow-hidden"
                    >
                      <div className="space-y-3">
                        <div className="flex items-start justify-between gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
                          <div>
                            <div className="font-black text-slate-900 dark:text-white text-base flex items-center gap-1.5">
                              <span>🏬</span>
                              <span>{merch.storeName}</span>
                            </div>
                            <div className="text-xs text-slate-600 dark:text-slate-400 font-bold mt-0.5">
                              المالك: {merch.ownerName} • {merch.phone}
                            </div>
                            <div className="text-[11px] text-slate-500 font-medium">
                              📍 {merch.city} - {merch.district} • س.ت: {merch.commercialReg}
                            </div>
                          </div>
                          <span className="px-2.5 py-1 rounded-xl bg-amber-500 text-white text-[10px] font-black shadow-xs animate-pulse">
                            ⏳ بانتظار قرار الإدارة
                          </span>
                        </div>

                        <div className="grid grid-cols-2 gap-2.5 p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/70 border border-slate-200/60 dark:border-slate-700/60">
                          <div>
                            <div className="text-[10px] text-slate-500 font-bold mb-0.5">الباقة الحالية:</div>
                            <div className="font-black text-slate-800 dark:text-slate-200 text-xs">
                              {merch.subscription.planNameAr}
                            </div>
                            <div className="text-[10px] text-slate-500">
                              نظام: {merch.subscription.billingCycle === "MONTHLY" ? "شهري 🗓️" : "سنوي ⭐"}
                            </div>
                          </div>

                          <div>
                            <div className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold mb-0.5">
                              الباقة المطلوبة:
                            </div>
                            <div className="font-black text-emerald-700 dark:text-emerald-300 text-xs">
                              {pending.requestedPlanName}
                            </div>
                            <div className="text-[10px] font-bold text-amber-600 dark:text-amber-400 font-mono">
                              السعر: {pending.price.toLocaleString("ar-YE")} ر.ي
                            </div>
                          </div>
                        </div>

                        {pending.note && (
                          <div className="text-xs text-slate-700 dark:text-slate-300 bg-amber-50/70 dark:bg-amber-950/40 p-2.5 rounded-xl border border-amber-200 dark:border-amber-900/60">
                            💬 <strong>ملاحظة الطلب:</strong> {pending.note}
                          </div>
                        )}

                        <div className="text-[10px] text-slate-400 font-mono">
                          تاريخ تقديم الطلب: {new Date(pending.requestedAt).toLocaleString("ar-YE")}
                        </div>
                      </div>

                      <div className="flex items-center gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
                        <button
                          type="button"
                          onClick={() =>
                            handleApproveSubscriptionUpgrade(merch.id, merch.storeName, pending.requestedPlanName)
                          }
                          className="flex-1 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs shadow-md transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                        >
                          <CheckCircle className="w-4 h-4" />
                          <span>الموافقة وترقية الباقة فوراً 🟢</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => handleRejectSubscriptionUpgrade(merch.id, merch.storeName)}
                          className="px-3.5 py-2.5 rounded-xl bg-rose-50 dark:bg-rose-950/50 hover:bg-rose-100 text-rose-700 dark:text-rose-300 font-bold text-xs border border-rose-200 dark:border-rose-800 transition-all flex items-center gap-1 cursor-pointer"
                        >
                          <X className="w-4 h-4" />
                          <span>رفض الطلب ❌</span>
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        );
      })()}

      {/* ========================================================= */}
      {/* MODAL: ADD NEW SPECIAL OFFER */}
      {/* ========================================================= */}
      {isAddOfferModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-xs animate-fade-in">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 w-full max-w-lg shadow-2xl space-y-6 dir-rtl text-right">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
              <div className="flex items-center gap-2.5">
                <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-500">
                  <Tag className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-extrabold text-slate-900 dark:text-white text-base">
                    إضافة عرض خاص وخصم جديد
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    إنشاء خصم ترويجي أو كود تخفيض للعملاء والتجار
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsAddOfferModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-white p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateNewOffer} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  عنوان العرض الخاص *
                </label>
                <input
                  type="text"
                  required
                  value={newOfferTitle}
                  onChange={(e) => setNewOfferTitle(e.target.value)}
                  placeholder="مثال: خصم موسم الصيف للتجار والمصانع"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-bold"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    نسبة الخصم % *
                  </label>
                  <input
                    type="number"
                    required
                    min={1}
                    max={100}
                    value={newOfferDiscount}
                    onChange={(e) => setNewOfferDiscount(Number(e.target.value))}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-bold"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    كود التخفيض (الكوبون)
                  </label>
                  <input
                    type="text"
                    value={newOfferCode}
                    onChange={(e) => setNewOfferCode(e.target.value)}
                    placeholder="EMDAD2026"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 font-mono font-bold uppercase text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    الفئة المستهدفة
                  </label>
                  <select
                    value={newOfferTarget}
                    onChange={(e) => setNewOfferTarget(e.target.value as any)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-bold"
                  >
                    <option value="ALL">جميع الحسابات (تجار ومصانع)</option>
                    <option value="MERCHANT">التجار والمتاجر فقط</option>
                    <option value="FACTORY">المصانع والمنتجين فقط</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    شارة العرض الترويجي
                  </label>
                  <input
                    type="text"
                    value={newOfferBadge}
                    onChange={(e) => setNewOfferBadge(e.target.value)}
                    placeholder="خصم 20% 🚀"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-bold"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  تاريخ انتهاء صلاحية العرض
                </label>
                <input
                  type="date"
                  value={newOfferValidUntil}
                  onChange={(e) => setNewOfferValidUntil(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-bold"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  شرح وتفاصيل العرض
                </label>
                <textarea
                  rows={2}
                  value={newOfferDesc}
                  onChange={(e) => setNewOfferDesc(e.target.value)}
                  placeholder="وصف ملخص للعرض والخصم الخاص..."
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-medium"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsAddOfferModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold hover:bg-slate-200 cursor-pointer"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold shadow-md cursor-pointer"
                >
                  حفظ وإضافة العرض 🎉
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
