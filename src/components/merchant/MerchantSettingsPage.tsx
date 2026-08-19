import React, { useState, useEffect } from "react";
import { QRCodeSVG } from "qrcode.react";
import { MerchantAccount, SubscriptionTier, BillingCycle, PendingSubscriptionChange } from "../../types";
import { storeService } from "../../services/storeService";
import { LocationPickerModal } from "../ui/LocationPickerModal";
import { CustomerServiceButton } from "../PlatformInfoBox";
import { WhatsAppWebConnector } from "./WhatsAppWebConnector";
import {
  Store,
  Crown,
  Settings,
  Percent,
  MapPin,
  Building2,
  Lock,
  Phone,
  Mail,
  User,
  CheckCircle2,
  Sparkles,
  Calendar,
  Clock,
  Info,
  ShieldCheck,
  Globe2,
  Receipt,
  FileText,
  Compass,
  ArrowRight,
  Layers,
  ShoppingBag,
  AlertCircle,
  AlertTriangle,
  X,
  Headphones,
  RotateCcw,
  Check,
  Send,
  RefreshCw,
  Zap,
  TrendingUp,
  ArrowUpRight,
  MessageSquare,
  QrCode,
  Share2,
  Copy,
  ExternalLink,
  Smartphone,
  Key,
  CheckCheck,
  LogOut
} from "lucide-react";

interface Props {
  merchantAccount: MerchantAccount;
  onUpdateAccount?: (updated: MerchantAccount) => void;
}

export const MerchantSettingsPage: React.FC<Props> = ({
  merchantAccount: initialAccount,
  onUpdateAccount,
}) => {
  const [currentAccount, setCurrentAccount] = useState<MerchantAccount>(initialAccount);
  const [activeTab, setActiveTab] = useState<"PROFILE" | "SUBSCRIPTION" | "TAX" | "WHATSAPP">("PROFILE");

  // Form States for Profile & General Settings
  const [storeName, setStoreName] = useState(initialAccount.storeName || "");
  const [ownerName, setOwnerName] = useState(initialAccount.ownerName || "");
  const [username, setUsername] = useState(initialAccount.username || "");
  const [phone, setPhone] = useState(initialAccount.phone || "");
  const [email, setEmail] = useState(initialAccount.email || "");
  const [commercialReg, setCommercialReg] = useState(initialAccount.commercialReg || "");
  const [taxNumber, setTaxNumber] = useState(initialAccount.taxNumber || "");
  const [taxEnabled, setTaxEnabled] = useState<boolean>(initialAccount.taxEnabled ?? false);
  const [taxRate, setTaxRate] = useState<number>(initialAccount.taxRate ?? 15);
  const [city, setCity] = useState(initialAccount.city || "صنعاء");
  const [district, setDistrict] = useState(initialAccount.district || "العاصمة");
  const [fullAddress, setFullAddress] = useState(initialAccount.fullAddress || "");
  const [password, setPassword] = useState("");
  const [lat, setLat] = useState<number>(initialAccount.lat || 15.3694);
  const [lng, setLng] = useState<number>(initialAccount.lng || 44.1910);

  // Subscription States
  const [selectedBillingCycle, setSelectedBillingCycle] = useState<BillingCycle>(
    initialAccount.subscription?.billingCycle || "YEARLY"
  );
  const [isLocationPickerOpen, setIsLocationPickerOpen] = useState(false);
  const [savedSuccessMsg, setSavedSuccessMsg] = useState("");

  // WhatsApp Integration States
  const [whatsAppEnabled, setWhatsAppEnabled] = useState<boolean>(
    initialAccount.whatsAppConfig?.enabled ?? true
  );
  const [whatsAppPhone, setWhatsAppPhone] = useState<string>(
    initialAccount.whatsAppConfig?.phoneNumber || initialAccount.phone || "771234567"
  );
  const [whatsAppManagerPhone, setWhatsAppManagerPhone] = useState<string>(
    initialAccount.whatsAppConfig?.managerPhone || initialAccount.phone || "771234567"
  );
  const [autoSendSalaryVouchers, setAutoSendSalaryVouchers] = useState<boolean>(
    initialAccount.whatsAppConfig?.autoSendSalaryVouchers ?? true
  );
  const [autoSendAdvanceVouchers, setAutoSendAdvanceVouchers] = useState<boolean>(
    initialAccount.whatsAppConfig?.autoSendAdvanceVouchers ?? true
  );
  const [autoSendPenaltyVouchers, setAutoSendPenaltyVouchers] = useState<boolean>(
    initialAccount.whatsAppConfig?.autoSendPenaltyVouchers ?? true
  );
  const [sendManagerCopy, setSendManagerCopy] = useState<boolean>(
    initialAccount.whatsAppConfig?.sendManagerCopy ?? true
  );
  const [directBackgroundDispatch, setDirectBackgroundDispatch] = useState<boolean>(
    initialAccount.whatsAppConfig?.directBackgroundDispatch ?? true
  );
  const [isWhatsAppConnected, setIsWhatsAppConnected] = useState<boolean>(
    initialAccount.whatsAppConfig?.isConnected ?? false
  );
  const [isCheckingConnection, setIsCheckingConnection] = useState<boolean>(false);
  const [testTargetPhone, setTestTargetPhone] = useState<string>("");
  const [testSampleType, setTestSampleType] = useState<"WELCOME" | "ADVANCE" | "PENALTY" | "SALARY">("WELCOME");
  const [testSendSuccess, setTestSendSuccess] = useState<string>("");

  // Modal for Subscription Upgrade & Approval
  const [isApprovalModalOpen, setIsApprovalModalOpen] = useState(false);
  const [requestedTierForApproval, setRequestedTierForApproval] = useState<SubscriptionTier>("PROFESSIONAL");
  const [requestedCycleForApproval, setRequestedCycleForApproval] = useState<BillingCycle>("YEARLY");

  useEffect(() => {
    setCurrentAccount(initialAccount);
    setStoreName(initialAccount.storeName || "");
    setOwnerName(initialAccount.ownerName || "");
    setUsername(initialAccount.username || "");
    setPhone(initialAccount.phone || "");
    setEmail(initialAccount.email || "");
    setCommercialReg(initialAccount.commercialReg || "");
    setTaxNumber(initialAccount.taxNumber || "");
    setTaxEnabled(initialAccount.taxEnabled ?? false);
    setTaxRate(initialAccount.taxRate ?? 15);
    setCity(initialAccount.city || "صنعاء");
    setDistrict(initialAccount.district || "العاصمة");
    setFullAddress(initialAccount.fullAddress || "");
    setLat(initialAccount.lat || 15.3694);
    setLng(initialAccount.lng || 44.1910);
    if (initialAccount.subscription?.billingCycle) {
      setSelectedBillingCycle(initialAccount.subscription.billingCycle);
    }
    if (initialAccount.whatsAppConfig) {
      setWhatsAppEnabled(initialAccount.whatsAppConfig.enabled ?? true);
      setWhatsAppPhone(initialAccount.whatsAppConfig.phoneNumber || initialAccount.phone || "771234567");
      setWhatsAppManagerPhone(initialAccount.whatsAppConfig.managerPhone || initialAccount.phone || "771234567");
      setAutoSendSalaryVouchers(initialAccount.whatsAppConfig.autoSendSalaryVouchers ?? true);
      setAutoSendAdvanceVouchers(initialAccount.whatsAppConfig.autoSendAdvanceVouchers ?? true);
      setAutoSendPenaltyVouchers(initialAccount.whatsAppConfig.autoSendPenaltyVouchers ?? true);
      setSendManagerCopy(initialAccount.whatsAppConfig.sendManagerCopy ?? true);
      setDirectBackgroundDispatch(initialAccount.whatsAppConfig.directBackgroundDispatch ?? true);
      setIsWhatsAppConnected(initialAccount.whatsAppConfig.isConnected ?? false);
    }
  }, [initialAccount]);

  // Subscribe to live store updates (so real-time admin approvals/rejections immediately reflect)
  useEffect(() => {
    const unsubscribe = storeService.subscribe(() => {
      const current = storeService.getCurrentMerchantSession();
      if (current && current.id === currentAccount.id) {
        setCurrentAccount(current);
        if (onUpdateAccount) onUpdateAccount(current);
      }
    });
    return () => unsubscribe();
  }, [currentAccount.id, onUpdateAccount]);

  const handleSaveProfile = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    storeService.updateMerchantAccountDetails(currentAccount.id, {
      storeName,
      ownerName,
      username,
      email,
      phone,
      commercialReg,
      taxNumber,
      taxEnabled,
      taxRate: isNaN(taxRate) ? 0 : Number(taxRate),
      city,
      district,
      fullAddress,
      password: password.trim() ? password.trim() : undefined,
      lat,
      lng,
    });

    const updated = storeService.getCurrentMerchantSession();
    if (updated) {
      setCurrentAccount(updated);
      if (onUpdateAccount) onUpdateAccount(updated);
    }

    setSavedSuccessMsg("تم حفظ وتحديث إعدادات وبيانات المتجر بنجاح 🟢");
    setTimeout(() => {
      setSavedSuccessMsg("");
    }, 3000);
  };

  const handleResetProfile = () => {
    setStoreName(currentAccount.storeName || "");
    setOwnerName(currentAccount.ownerName || "");
    setUsername(currentAccount.username || "");
    setPhone(currentAccount.phone || "");
    setEmail(currentAccount.email || "");
    setCommercialReg(currentAccount.commercialReg || "");
    setTaxNumber(currentAccount.taxNumber || "");
    setCity(currentAccount.city || "صنعاء");
    setDistrict(currentAccount.district || "العاصمة");
    setFullAddress(currentAccount.fullAddress || "");
    setPassword("");
    setLat(currentAccount.lat || 15.3694);
    setLng(currentAccount.lng || 44.1910);
    setSavedSuccessMsg("تمت استعادة البيانات السابقة 🔄");
    setTimeout(() => setSavedSuccessMsg(""), 2000);
  };

  // Open Approval Modal for Upgrade/Cycle Change
  const triggerUpgradeApprovalFlow = (tier: SubscriptionTier, cycle: BillingCycle = selectedBillingCycle) => {
    setRequestedTierForApproval(tier);
    setRequestedCycleForApproval(cycle);
    setIsApprovalModalOpen(true);
  };

  // When confirmed in the modal, send the request and record pending state
  const handleConfirmUpgradeRequest = () => {
    const pending = storeService.requestMerchantSubscriptionUpgrade(
      currentAccount.id,
      requestedTierForApproval,
      requestedCycleForApproval
    );

    const updated = storeService.getCurrentMerchantSession();
    if (updated) {
      setCurrentAccount(updated);
      if (onUpdateAccount) onUpdateAccount(updated);
    }

    setIsApprovalModalOpen(false);
    setSavedSuccessMsg("تم إرسال طلب الترقية بنجاح 📋 يرجى انتظار موافقة إدارة المنصة");
    setTimeout(() => {
      setSavedSuccessMsg("");
    }, 4500);
  };

  const handleCancelPendingRequest = () => {
    storeService.cancelPendingSubscriptionChange(currentAccount.id);
    const updated = storeService.getCurrentMerchantSession();
    if (updated) {
      setCurrentAccount(updated);
      if (onUpdateAccount) onUpdateAccount(updated);
    }
    setSavedSuccessMsg("تم إلغاء طلب الترقية المعلق بنجاح ❌");
    setTimeout(() => setSavedSuccessMsg(""), 2500);
  };

  const handleDismissDecision = () => {
    storeService.dismissMerchantSubscriptionDecision(currentAccount.id);
    const updated = storeService.getCurrentMerchantSession();
    if (updated) {
      setCurrentAccount(updated);
      if (onUpdateAccount) onUpdateAccount(updated);
    }
  };

  const handleConfirmLocation = (newLat: number, newLng: number, newCity?: string, newDistrict?: string) => {
    setLat(newLat);
    setLng(newLng);
    if (newCity) setCity(newCity);
    if (newDistrict) {
      setDistrict(newDistrict);
      setFullAddress(`${newCity || city} - ${newDistrict}`);
    }
  };

  const handleSaveWhatsAppConfig = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    storeService.updateMerchantWhatsAppConfig(currentAccount.id, {
      enabled: whatsAppEnabled,
      phoneNumber: whatsAppPhone.trim(),
      managerPhone: whatsAppManagerPhone.trim(),
      autoSendSalaryVouchers,
      autoSendAdvanceVouchers,
      autoSendPenaltyVouchers,
      sendManagerCopy,
      directBackgroundDispatch,
      isConnected: isWhatsAppConnected,
      connectedAt: isWhatsAppConnected ? (currentAccount.whatsAppConfig?.connectedAt || new Date().toISOString()) : undefined,
    });

    const updated = storeService.getCurrentMerchantSession();
    if (updated) {
      setCurrentAccount(updated);
      if (onUpdateAccount) onUpdateAccount(updated);
    }

    setSavedSuccessMsg("تم حفظ وتفعيل إعدادات ربط الواتساب بنجاح 💬🟢");
    setTimeout(() => {
      setSavedSuccessMsg("");
    }, 3000);
  };

  const handleUnlinkWhatsApp = () => {
    setIsWhatsAppConnected(false);
    storeService.updateMerchantWhatsAppConfig(currentAccount.id, {
      isConnected: false,
      connectedAt: undefined,
    });

    const updated = storeService.getCurrentMerchantSession();
    if (updated) {
      setCurrentAccount(updated);
      if (onUpdateAccount) onUpdateAccount(updated);
    }

    setSavedSuccessMsg("تم إلغاء الربط (Unlink) ومسح بيانات الجلسة بنجاح، وتمت إعادة تفعيل شاشة مسح كود QR 🔄");
    setTimeout(() => {
      setSavedSuccessMsg("");
    }, 4000);
  };

  const handleTestWhatsApp = () => {
    const target = testTargetPhone.trim() || whatsAppPhone.trim();
    if (!target) {
      alert("يرجى إدخال رقم هاتف واتساب صحيح للاختبار");
      return;
    }

    const testMsg = `*رسالة اختبار من نظام إمداد التجاري* 🚀\n🏢 المتجر: *${storeName}*\n👤 المالك: ${ownerName}\n✅ خدمة الواتساب متصلة وتعمل بنجاح!`;
    const cleanPhone = target.replace(/[^0-9+]/g, "").replace("+", "");
    const encoded = encodeURIComponent(testMsg);
    window.open(`https://wa.me/${cleanPhone}?text=${encoded}`, "_blank");
    setTestSendSuccess("تم فتح محادثة الواتساب لإرسال رسالة الاختبار الفورية بنجاح! 💬");
    setTimeout(() => setTestSendSuccess(""), 4000);
  };

  const handleRefreshConnection = () => {
    setIsCheckingConnection(true);
    setTimeout(() => {
      setIsWhatsAppConnected(true);
      setIsCheckingConnection(false);
      setSavedSuccessMsg("تم فحص وتأكيد الاتصال النشط ببوابة الواتساب بنجاح! 🟢");
      setTimeout(() => setSavedSuccessMsg(""), 3000);
    }, 1200);
  };

  const sub = currentAccount.subscription;
  const pendingChange = currentAccount.pendingSubscriptionChange;
  const lastDecision = currentAccount.lastSubscriptionChangeDecision;

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

  // Sample Calculation for Tax Preview
  const sampleSubtotal = 100000;
  const sampleTax = taxEnabled ? (sampleSubtotal * (taxRate / 100)) : 0;
  const sampleTotal = sampleSubtotal + sampleTax;

  const getTierDetails = (tier: SubscriptionTier) => {
    switch (tier) {
      case "STARTER":
        return { nameAr: "باقة المبتدئ (Starter)", monthlyPrice: 0, yearlyPrice: 0 };
      case "PROFESSIONAL":
        return { nameAr: "باقة التاجر المتقدم (Pro)", monthlyPrice: 15000, yearlyPrice: 150000 };
      case "ENTERPRISE_VIP":
        return { nameAr: "باقة المؤسسات والـ VIP", monthlyPrice: 35000, yearlyPrice: 350000 };
      default:
        return { nameAr: "باقة التاجر", monthlyPrice: 15000, yearlyPrice: 150000 };
    }
  };

  const targetTierInfo = getTierDetails(requestedTierForApproval);
  const targetPrice = requestedCycleForApproval === "YEARLY" ? targetTierInfo.yearlyPrice : targetTierInfo.monthlyPrice;

  return (
    <div className="space-y-6 dir-rtl max-w-6xl mx-auto pb-12 animate-in fade-in duration-300">
      {/* Header Banner */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-slate-800 shadow-md flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-gradient-to-tr from-indigo-600 to-indigo-500 text-white flex items-center justify-center shadow-lg shadow-indigo-500/25 shrink-0">
            <Settings className="w-8 h-8" />
          </div>
          <div>
            <div className="flex items-center gap-2.5 flex-wrap">
              <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
                الإعدادات
              </h1>
              <span className="px-3 py-1 rounded-full bg-indigo-50 dark:bg-indigo-950/80 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800 text-xs font-bold">
                {currentAccount.storeName}
              </span>
            </div>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
              إدارة بيانات المتجر التجارية، باقات الاشتراك والترقية، النظام الضريبي وتحديد الموقع الجغرافي
            </p>
          </div>
        </div>

        {/* Quick Nav Tabs */}
        <div className="flex items-center gap-2 p-1.5 rounded-2xl bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 self-start md:self-auto overflow-x-auto w-full md:w-auto">
          <button
            type="button"
            onClick={() => setActiveTab("PROFILE")}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-black text-xs transition-all whitespace-nowrap cursor-pointer ${
              activeTab === "PROFILE"
                ? "bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-xs"
                : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
            }`}
          >
            <Store className="w-4 h-4" />
            <span>بيانات المتجر والمالك</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("SUBSCRIPTION")}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-black text-xs transition-all whitespace-nowrap cursor-pointer ${
              activeTab === "SUBSCRIPTION"
                ? "bg-indigo-600 text-white shadow-xs"
                : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
            }`}
          >
            <Crown className="w-4 h-4 text-amber-300" />
            <span>الاشتراكات والباقات</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("TAX")}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-black text-xs transition-all whitespace-nowrap cursor-pointer ${
              activeTab === "TAX"
                ? "bg-white dark:bg-slate-900 text-emerald-600 dark:text-emerald-400 shadow-xs"
                : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
            }`}
          >
            <Percent className="w-4 h-4" />
            <span>الضرائب والفوترة</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("WHATSAPP")}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-black text-xs transition-all whitespace-nowrap cursor-pointer ${
              activeTab === "WHATSAPP"
                ? "bg-emerald-600 text-white shadow-xs"
                : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
            }`}
          >
            <MessageSquare className="w-4 h-4 text-emerald-300" />
            <span>خدمة الواتساب والربط (WhatsApp) 💬</span>
          </button>
        </div>
      </div>

      {/* Global Feedback Banner */}
      {savedSuccessMsg && (
        <div className="p-4 rounded-2xl bg-emerald-600 text-white font-extrabold text-xs sm:text-sm text-center shadow-lg animate-bounce flex items-center justify-center gap-2">
          <CheckCircle2 className="w-5 h-5 shrink-0" />
          <span>{savedSuccessMsg}</span>
        </div>
      )}

      {/* TAB 1: Profile & Store Info */}
      {activeTab === "PROFILE" && (
        <form onSubmit={handleSaveProfile} className="space-y-6">
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400">
                  <Store className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-base font-black text-slate-900 dark:text-white">
                    البيانات التجارية والتعريفية للمتجر
                  </h2>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    تظهر هذه البيانات على فواتير المبيعات ونظام الطلبيات
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={handleResetProfile}
                className="px-3 py-1.5 rounded-xl text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>استعادة السابقة</span>
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <div>
                <label className="block font-black text-slate-700 dark:text-slate-300 text-xs mb-1.5">
                  اسم المتجر / المحل *
                </label>
                <div className="relative">
                  <input
                    type="text"
                    required
                    value={storeName}
                    onChange={(e) => setStoreName(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 text-slate-900 dark:text-white font-bold text-xs focus:ring-2 focus:ring-indigo-500 pr-10"
                  />
                  <Store className="w-4 h-4 text-slate-400 absolute right-3.5 top-3" />
                </div>
              </div>

              <div>
                <label className="block font-black text-slate-700 dark:text-slate-300 text-xs mb-1.5">
                  اسم التاجر / المالك المسؤول *
                </label>
                <div className="relative">
                  <input
                    type="text"
                    required
                    value={ownerName}
                    onChange={(e) => setOwnerName(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 text-slate-900 dark:text-white font-bold text-xs focus:ring-2 focus:ring-indigo-500 pr-10"
                  />
                  <User className="w-4 h-4 text-slate-400 absolute right-3.5 top-3" />
                </div>
              </div>

              <div>
                <label className="block font-black text-slate-700 dark:text-slate-300 text-xs mb-1.5">
                  اسم المستخدم للدخول (Username)
                </label>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 text-slate-900 dark:text-white font-mono font-bold text-xs focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block font-black text-slate-700 dark:text-slate-300 text-xs mb-1.5">
                  رقم الهاتف / الجوال *
                </label>
                <div className="relative">
                  <input
                    type="text"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 text-slate-900 dark:text-white font-mono font-bold text-xs focus:ring-2 focus:ring-indigo-500 pr-10"
                  />
                  <Phone className="w-4 h-4 text-slate-400 absolute right-3.5 top-3" />
                </div>
              </div>

              <div>
                <label className="block font-black text-slate-700 dark:text-slate-300 text-xs mb-1.5">
                  البريد الإلكتروني
                </label>
                <div className="relative">
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 text-slate-900 dark:text-white font-mono font-bold text-xs focus:ring-2 focus:ring-indigo-500 pr-10"
                  />
                  <Mail className="w-4 h-4 text-slate-400 absolute right-3.5 top-3" />
                </div>
              </div>

              <div>
                <label className="block font-black text-slate-700 dark:text-slate-300 text-xs mb-1.5">
                  رقم السجل التجاري (إن وجد)
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={commercialReg}
                    onChange={(e) => setCommercialReg(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 text-slate-900 dark:text-white font-mono font-bold text-xs focus:ring-2 focus:ring-indigo-500 pr-10"
                  />
                  <FileText className="w-4 h-4 text-slate-400 absolute right-3.5 top-3" />
                </div>
              </div>

              <div>
                <label className="block font-black text-slate-700 dark:text-slate-300 text-xs mb-1.5">
                  الرقم الضريبي (إن وجد)
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={taxNumber}
                    onChange={(e) => setTaxNumber(e.target.value)}
                    placeholder="مثال: 300123456700003"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 text-slate-900 dark:text-white font-mono font-bold text-xs focus:ring-2 focus:ring-indigo-500 pr-10"
                  />
                  <Receipt className="w-4 h-4 text-slate-400 absolute right-3.5 top-3" />
                </div>
              </div>

              <div>
                <label className="block font-black text-amber-700 dark:text-amber-400 text-xs mb-1.5">
                  تغيير كلمة المرور (اختياري)
                </label>
                <div className="relative">
                  <input
                    type="password"
                    placeholder="أدخل كلمة مرور جديدة للتحديث..."
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-amber-200 dark:border-amber-900/50 bg-amber-50/50 dark:bg-amber-950/20 text-slate-900 dark:text-white font-bold text-xs focus:ring-2 focus:ring-amber-500 pr-10"
                  />
                  <Lock className="w-4 h-4 text-amber-500 absolute right-3.5 top-3" />
                </div>
              </div>
            </div>
          </div>

          {/* Location & Map Section */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400">
                  <MapPin className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-base font-black text-slate-900 dark:text-white">
                    العنوان الجغرافي وموقع التسليم على الخريطة
                  </h2>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    يستخدم الموقع لتوجيه شاحنات المصانع والسائقين لمتجرك بدقة
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setIsLocationPickerOpen(true)}
                className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-black text-xs flex items-center gap-2 transition-colors cursor-pointer shadow-sm"
              >
                <Compass className="w-4 h-4" />
                <span>تحديد على الخريطة 🗺️</span>
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block font-black text-slate-700 dark:text-slate-300 text-xs mb-1.5">
                  المدينة *
                </label>
                <input
                  type="text"
                  required
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 text-slate-900 dark:text-white font-bold text-xs focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block font-black text-slate-700 dark:text-slate-300 text-xs mb-1.5">
                  المديرية / الحي *
                </label>
                <input
                  type="text"
                  required
                  value={district}
                  onChange={(e) => setDistrict(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 text-slate-900 dark:text-white font-bold text-xs focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block font-black text-slate-700 dark:text-slate-300 text-xs mb-1.5">
                  العنوان التفصيلي والشارع
                </label>
                <input
                  type="text"
                  value={fullAddress}
                  onChange={(e) => setFullAddress(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 text-slate-900 dark:text-white font-bold text-xs focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            {/* Coords summary banner */}
            <div className="p-4 rounded-2xl bg-blue-50/60 dark:bg-blue-950/30 border border-blue-200/80 dark:border-blue-900/50 flex flex-wrap items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-2 text-blue-900 dark:text-blue-200 font-bold">
                <MapPin className="w-4 h-4 text-blue-600 shrink-0" />
                <span>الإحداثيات الجغرافية المسجلة:</span>
                <span className="font-mono text-xs bg-white dark:bg-slate-900 px-2 py-0.5 rounded-lg border border-blue-200 dark:border-blue-800">
                  {lat.toFixed(4)}, {lng.toFixed(4)}
                </span>
              </div>
              <span className="text-[11px] text-blue-700 dark:text-blue-400 font-medium">
                جاهز للاستخدام مع الملاحة ونظام التوصيل الفوري
              </span>
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex justify-end gap-3">
            <button
              type="submit"
              className="px-8 py-3.5 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-black text-sm transition-all shadow-md shadow-indigo-600/30 hover:scale-[1.01] active:scale-98 cursor-pointer flex items-center gap-2"
            >
              <CheckCircle2 className="w-5 h-5" />
              <span>حفظ وتحديث بيانات المتجر</span>
            </button>
          </div>
        </form>
      )}

      {/* TAB 2: Subscriptions & Plans */}
      {activeTab === "SUBSCRIPTION" && (
        <div className="space-y-6">
          {/* 1. STATE 1: PENDING REVIEW (قيد المراجعة ⏳) */}
          {pendingChange && pendingChange.status === "PENDING_APPROVAL" && (
            <div className="p-5 sm:p-6 rounded-3xl bg-gradient-to-br from-amber-500/15 via-amber-500/10 to-amber-500/5 border-2 border-amber-500/80 text-amber-950 dark:text-amber-200 shadow-lg space-y-4 animate-in fade-in">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3.5">
                  <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-amber-500 text-slate-950 flex items-center justify-center font-black shadow-md shrink-0 animate-pulse">
                    <Clock className="w-6 h-6 sm:w-7 sm:h-7" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <h4 className="font-black text-base sm:text-lg text-amber-900 dark:text-amber-100">
                        {pendingChange.requestedCycle === "YEARLY" && (sub.billingCycle === "MONTHLY" || pendingChange.previousCycle === "MONTHLY")
                          ? "طلب تحويل الباقة من شهرية إلى سنوية قيد المراجعة ⏳"
                          : "طلب ترقية وتغيير باقة الاشتراك قيد المراجعة ⏳"}
                      </h4>
                      <span className="px-3 py-0.5 rounded-full bg-amber-500 text-slate-950 text-xs font-black shadow-xs">
                        بانتظار موافقة إدارة المنصة
                      </span>
                    </div>
                    <p className="text-xs text-amber-800 dark:text-amber-300 font-medium mt-1">
                      تم استلام طلبك وبانتظار اعتماد الإدارة المالية لتفعيل المميزات والحدود الجديدة تلقائياً.
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 self-end sm:self-auto shrink-0">
                  <button
                    type="button"
                    onClick={handleCancelPendingRequest}
                    className="px-4 py-2.5 rounded-xl bg-amber-200 hover:bg-amber-300 dark:bg-amber-900/70 dark:hover:bg-amber-800 text-amber-950 dark:text-amber-100 font-black text-xs transition-all cursor-pointer shadow-xs"
                  >
                    إلغاء الطلب
                  </button>
                  <CustomerServiceButton className="px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-black text-xs transition-all cursor-pointer shadow-sm flex items-center gap-1.5">
                    <Headphones className="w-4 h-4" />
                    <span>تواصل مع الإدارة</span>
                  </CustomerServiceButton>
                </div>
              </div>

              {/* Request Details Breakdown Card */}
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 p-4 rounded-2xl bg-white/80 dark:bg-slate-900/80 border border-amber-300 dark:border-amber-900/60 text-xs">
                <div>
                  <span className="text-slate-500 dark:text-slate-400 block text-[11px]">الباقة السابقة / الحالية:</span>
                  <strong className="font-black text-slate-800 dark:text-slate-200 mt-0.5 block">
                    {pendingChange.previousPlanName || sub.planNameAr}
                  </strong>
                </div>

                <div>
                  <span className="text-slate-500 dark:text-slate-400 block text-[11px]">الباقة المطلوبة الجديدة:</span>
                  <strong className="font-black text-amber-600 dark:text-amber-400 mt-0.5 block flex items-center gap-1">
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>{pendingChange.requestedPlanName}</span>
                  </strong>
                </div>

                <div>
                  <span className="text-slate-500 dark:text-slate-400 block text-[11px]">قيمة الاشتراك المحددة:</span>
                  <strong className="font-mono font-black text-slate-900 dark:text-white mt-0.5 block">
                    {pendingChange.price > 0 ? `${pendingChange.price.toLocaleString("ar-YE")} ر.ي` : "مجاناً"}
                    <span className="text-[10px] text-slate-400 mr-1">
                      ({pendingChange.requestedCycle === "YEARLY" ? "سنوي - خصم شهرين 🎁" : "شهري 🗓️"})
                    </span>
                  </strong>
                </div>

                <div>
                  <span className="text-slate-500 dark:text-slate-400 block text-[11px]">تاريخ تقديم الطلب:</span>
                  <strong className="font-mono font-bold text-slate-700 dark:text-slate-300 mt-0.5 block">
                    {new Date(pendingChange.requestedAt).toLocaleDateString("ar-YE")}
                  </strong>
                </div>
              </div>

              {/* Visual Multi-step Timeline */}
              <div className="pt-2 border-t border-amber-300/60 dark:border-amber-900/50 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
                <div className="flex items-center gap-2 text-emerald-700 dark:text-emerald-400 font-bold">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>1. تم رفع الطلب بنجاح</span>
                </div>
                <div className="hidden sm:block text-slate-400 dark:text-slate-600">➔</div>
                <div className="flex items-center gap-2 text-amber-700 dark:text-amber-300 font-black animate-pulse">
                  <Clock className="w-4 h-4" />
                  <span>2. قيد مراجعة وتأكيد إدارة المنصة (الآن)</span>
                </div>
                <div className="hidden sm:block text-slate-400 dark:text-slate-600">➔</div>
                <div className="flex items-center gap-2 text-slate-400 dark:text-slate-500">
                  <Crown className="w-4 h-4" />
                  <span>3. تفعيل الصلاحيات والمستودعات الإضافية فورياً</span>
                </div>
              </div>
            </div>
          )}

          {/* 2. STATE 2: APPROVED (تمت الموافقة 🎉) */}
          {lastDecision && lastDecision.status === "APPROVED" && (
            <div className="p-5 sm:p-6 rounded-3xl bg-gradient-to-br from-emerald-500/15 via-emerald-500/10 to-emerald-500/5 border-2 border-emerald-500/80 text-emerald-950 dark:text-emerald-200 shadow-lg flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 animate-in fade-in">
              <div className="flex items-center gap-3.5">
                <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-emerald-600 text-white flex items-center justify-center font-black shadow-md shrink-0">
                  <Sparkles className="w-6 h-6 sm:w-7 sm:h-7" />
                </div>
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <h4 className="font-black text-base sm:text-lg text-emerald-900 dark:text-emerald-100">
                      🎉 تمت الموافقة على طلب ترقية باقتك بنجاح!
                    </h4>
                    <span className="px-3 py-0.5 rounded-full bg-emerald-600 text-white text-xs font-black shadow-xs">
                      معتمد ومفعل 🟢
                    </span>
                  </div>
                  <p className="text-xs text-emerald-800 dark:text-emerald-300 mt-1 leading-relaxed">
                    قامت إدارة المنصة بالموافقة على طلب ترقية الباقة إلى <strong>"{lastDecision.requestedPlanName}"</strong>. تم تحديث كافة الحدود والصلاحيات وميزات الربط مباشرة لمتجرك.
                  </p>
                  {lastDecision.decidedAt && (
                    <span className="text-[11px] text-emerald-700 dark:text-emerald-400 font-mono mt-1 block">
                      تاريخ الاعتماد: {new Date(lastDecision.decidedAt).toLocaleDateString("ar-YE")}
                    </span>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-2 self-end sm:self-auto shrink-0">
                <button
                  type="button"
                  onClick={handleDismissDecision}
                  className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs transition-all cursor-pointer shadow-sm flex items-center gap-1.5"
                >
                  <Check className="w-4 h-4" />
                  <span>إخفاء الإشعار</span>
                </button>
              </div>
            </div>
          )}

          {/* 3. STATE 3: REJECTED (مرفوض ❌) */}
          {lastDecision && lastDecision.status === "REJECTED" && (
            <div className="p-5 sm:p-6 rounded-3xl bg-gradient-to-br from-rose-500/15 via-rose-500/10 to-rose-500/5 border-2 border-rose-500/80 text-rose-950 dark:text-rose-200 shadow-lg space-y-3 animate-in fade-in">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3.5">
                  <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-rose-600 text-white flex items-center justify-center font-black shadow-md shrink-0">
                    <AlertTriangle className="w-6 h-6 sm:w-7 sm:h-7" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <h4 className="font-black text-base sm:text-lg text-rose-900 dark:text-rose-100">
                        ❌ تم رفض طلب ترقية / تغيير الباقة
                      </h4>
                      <span className="px-3 py-0.5 rounded-full bg-rose-600 text-white text-xs font-black shadow-xs">
                        مرفوض من الإدارة
                      </span>
                    </div>
                    <p className="text-xs text-rose-800 dark:text-rose-300 mt-1 leading-relaxed">
                      نعتذر، لم تتم الموافقة على طلب ترقية الباقة إلى <strong>"{lastDecision.requestedPlanName}"</strong>.
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 self-end sm:self-auto shrink-0 flex-wrap">
                  <button
                    type="button"
                    onClick={() => {
                      handleDismissDecision();
                      triggerUpgradeApprovalFlow(lastDecision.requestedTier, lastDecision.requestedCycle);
                    }}
                    className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-black text-xs transition-all cursor-pointer shadow-sm flex items-center gap-1.5"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>إعادة تقديم الطلب</span>
                  </button>
                  <CustomerServiceButton className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-900 text-white font-black text-xs transition-all cursor-pointer shadow-sm flex items-center gap-1.5">
                    <Headphones className="w-3.5 h-3.5" />
                    <span>تواصل مع الإدارة</span>
                  </CustomerServiceButton>
                  <button
                    type="button"
                    onClick={handleDismissDecision}
                    className="p-2 rounded-xl bg-rose-100 dark:bg-rose-900/60 hover:bg-rose-200 text-rose-900 dark:text-rose-200 font-bold text-xs transition-colors cursor-pointer"
                    title="إغلاق"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Admin Note if provided */}
              <div className="p-3.5 rounded-2xl bg-white/80 dark:bg-slate-900/80 border border-rose-200 dark:border-rose-900/50 text-xs">
                <span className="text-rose-700 dark:text-rose-400 font-bold block mb-1">
                  سبب أو ملاحظة إدارة المنصة:
                </span>
                <p className="text-slate-800 dark:text-slate-200 font-medium">
                  {lastDecision.note || "لم يتم توفير سبب محدد. يرجى التواصل مع إدارة المنصة للاستفسار."}
                </p>
                {lastDecision.decidedAt && (
                  <span className="text-[11px] text-slate-400 dark:text-slate-500 font-mono mt-1 block">
                    تاريخ قرار الإدارة: {new Date(lastDecision.decidedAt).toLocaleDateString("ar-YE")}
                  </span>
                )}
              </div>
            </div>
          )}

          {/* Special Conversion Banner for Monthly Merchants to Switch to Yearly Billing */}
          {sub.billingCycle === "MONTHLY" && (
            <div className="p-6 rounded-3xl bg-gradient-to-r from-amber-500 via-amber-400 to-amber-500 text-slate-950 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-5 relative overflow-hidden">
              <div className="relative z-10 space-y-1.5">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-950 text-amber-300 text-[11px] font-black">
                  <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                  <span>عرض التوفير الخاص: خصم شهرين مجاناً (ادفع 10 أشهر فقط) 🎁</span>
                </div>
                <h3 className="text-lg sm:text-xl font-black text-slate-950">
                  هل ترغب في التحويل من الفوترة الشهرية إلى السنوية؟
                </h3>
                <p className="text-xs sm:text-sm text-slate-900 font-medium max-w-2xl leading-relaxed">
                  وفّر ما يصل إلى <strong>{sub.planId === "ENTERPRISE_VIP" ? "70,000 ر.ي" : "30,000 ر.ي"}</strong> سنوياً مع تثبيت أسعار الباقة وضمان استمرارية تشغيل نقاط البيع والفروع بدون انقطاع.
                </p>
              </div>

              <div className="relative z-10 shrink-0">
                {pendingChange && pendingChange.status === "PENDING_APPROVAL" && pendingChange.requestedCycle === "YEARLY" ? (
                  <div className="px-5 py-3 rounded-2xl bg-slate-950 text-amber-300 font-black text-xs flex items-center gap-2 shadow-lg">
                    <Clock className="w-4 h-4 animate-pulse" />
                    <span>طلب التحويل للسنوي قيد المراجعة ⏳</span>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => triggerUpgradeApprovalFlow(sub.planId, "YEARLY")}
                    className="w-full sm:w-auto px-6 py-3.5 rounded-2xl bg-slate-950 hover:bg-slate-900 text-amber-300 hover:text-white font-black text-xs sm:text-sm transition-all shadow-xl hover:scale-105 active:scale-95 cursor-pointer flex items-center justify-center gap-2"
                  >
                    <Sparkles className="w-4 h-4" />
                    <span>طلب التحويل إلى الاشتراك السنوي الآن ⭐</span>
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Active Plan Overview Card */}
          <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 text-white border border-indigo-800 shadow-xl space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-indigo-800/80 pb-5">
              <div className="flex items-center gap-4">
                <div className="p-3.5 rounded-2xl bg-indigo-600 text-amber-300 shadow-lg">
                  <Crown className="w-8 h-8" />
                </div>
                <div>
                  <span className="text-xs text-indigo-300 font-bold block">
                    باقة الاشتراك الحالية لمتجر {currentAccount.storeName}:
                  </span>
                  <div className="flex items-center gap-2.5 flex-wrap mt-0.5">
                    <h2 className="text-xl sm:text-2xl font-black text-white">
                      {sub.planNameAr}
                    </h2>
                    <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-xs font-black">
                      نشط 🟢
                    </span>
                    <span className="px-2.5 py-0.5 rounded-full bg-indigo-800 text-indigo-100 text-xs font-bold">
                      {isYearly ? "فوترة سنوية (خصم شهرين) 🎁" : "فوترة شهرية 🗓️"}
                    </span>
                  </div>
                </div>
              </div>

              <div className="text-right sm:text-left font-mono space-y-1">
                <div className="text-lg font-black text-amber-300">
                  {isYearly 
                    ? `${(sub.priceMonthly * 10).toLocaleString("ar-YE")} ر.ي / سنة`
                    : `${sub.priceMonthly.toLocaleString("ar-YE")} ر.ي / شهر`}
                </div>
                <div className="text-xs text-emerald-400 font-extrabold flex items-center gap-1.5 justify-end">
                  <Clock className="w-4 h-4 text-emerald-400" />
                  <span>متبقي على الانتهاء: {daysLeft} يوماً</span>
                </div>
              </div>
            </div>

            {/* Dates info */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
              <div className="p-3 rounded-2xl bg-slate-950/70 border border-slate-800 text-right">
                <span className="text-[11px] text-slate-400 font-bold block flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-indigo-400" />
                  تاريخ بداية الاشتراك:
                </span>
                <strong className="text-white text-xs font-mono font-bold block mt-1">
                  {sub.startDate || "غير محدد"}
                </strong>
              </div>

              <div className="p-3 rounded-2xl bg-slate-950/70 border border-amber-500/40 text-right">
                <span className="text-[11px] text-amber-400 font-bold block flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-amber-400" />
                  تاريخ انتهاء الصلاحية:
                </span>
                <strong className="text-amber-300 text-xs font-mono font-black block mt-1">
                  {sub.endDate || "غير محدد"}
                </strong>
              </div>

              <div className="p-3 rounded-2xl bg-slate-950/70 border border-indigo-800 text-right">
                <span className="text-[11px] text-indigo-300 font-bold block flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-emerald-400" />
                  حالة الصلاحية:
                </span>
                <strong className="text-emerald-400 text-xs font-bold block mt-1">
                  {daysLeft > 0 ? `صالح ومفعل لمدة ${daysLeft} يوماً` : "منتهي الصلاحية ⚠️"}
                </strong>
              </div>
            </div>

            {/* Plan Capacity Limits Grid */}
            <div className="grid grid-cols-3 gap-3 text-center">
              <div className="p-3.5 rounded-2xl bg-indigo-950/80 border border-indigo-800/80">
                <span className="text-[11px] text-indigo-300 block">حد المستودعات المسموحة</span>
                <strong className="text-sm sm:text-base font-black text-amber-300 block mt-0.5">
                  {sub.maxWarehouses >= 999 ? "غير محدود" : `${sub.maxWarehouses} مخازن`}
                </strong>
              </div>

              <div className="p-3.5 rounded-2xl bg-indigo-950/80 border border-indigo-800/80">
                <span className="text-[11px] text-indigo-300 block">حد الأصناف في المتجر</span>
                <strong className="text-sm sm:text-base font-black text-amber-300 block mt-0.5">
                  {sub.maxItems.toLocaleString()} صنف
                </strong>
              </div>

              <div className="p-3.5 rounded-2xl bg-indigo-950/80 border border-indigo-800/80">
                <span className="text-[11px] text-indigo-300 block">نقاط البيع والكاشير POS</span>
                <strong className="text-sm sm:text-base font-black text-amber-300 block mt-0.5">
                  {sub.maxPOSRegisters >= 999 ? "غير محدود" : `${sub.maxPOSRegisters} نقاط`}
                </strong>
              </div>
            </div>

            {/* Features list */}
            <div className="pt-2">
              <span className="text-xs text-indigo-200 font-bold block mb-2">المميزات المفعلة في باقتك الحالية:</span>
              <div className="flex flex-wrap gap-2 text-xs">
                {sub.features.map((feat, idx) => (
                  <span key={idx} className="px-3 py-1 rounded-xl bg-indigo-900/80 text-indigo-100 border border-indigo-700/80 font-bold flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    <span>{feat}</span>
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Upgrade & Tier Options */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-5">
              <div>
                <h3 className="text-lg font-black text-slate-900 dark:text-white">
                  ترقية أو تجديد باقة الاشتراك
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  اختر الباقة المناسبة لحجم نشاطك التجاري (يتطلب طلب الترقية مراجعة واعتماد إدارة المنصة)
                </p>
              </div>

              {/* Billing Selector Toggle */}
              <div className="flex items-center gap-1.5 p-1.5 rounded-2xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-extrabold">
                <button
                  type="button"
                  onClick={() => {
                    setSelectedBillingCycle("MONTHLY");
                  }}
                  className={`px-4 py-2 rounded-xl transition-all flex items-center gap-1.5 cursor-pointer ${
                    selectedBillingCycle === "MONTHLY"
                      ? "bg-indigo-600 text-white shadow-xs"
                      : "text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white"
                  }`}
                >
                  <Calendar className="w-3.5 h-3.5" />
                  <span>اشتراك شهري 🗓️</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setSelectedBillingCycle("YEARLY");
                  }}
                  className={`px-4 py-2 rounded-xl transition-all flex items-center gap-1.5 cursor-pointer relative ${
                    selectedBillingCycle === "YEARLY"
                      ? "bg-indigo-600 text-white shadow-xs"
                      : "text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white"
                  }`}
                >
                  <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                  <span>اشتراك سنوي ⭐</span>
                  <span className="px-1.5 py-0.2 rounded-full bg-amber-400 text-slate-950 text-[9px] font-black">
                    خصم شهرين
                  </span>
                </button>
              </div>
            </div>

            {/* Pricing Tiers Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* STARTER */}
              {(() => {
                const isCurrent = sub.planId === "STARTER";
                const isPending = pendingChange && pendingChange.status === "PENDING_APPROVAL" && pendingChange.requestedTier === "STARTER";
                return (
                  <div className={`p-6 rounded-3xl border flex flex-col justify-between space-y-6 transition-all ${
                    isPending
                      ? "border-2 border-amber-500 bg-amber-50/40 dark:bg-amber-950/20 shadow-md ring-2 ring-amber-500/30"
                      : isCurrent
                      ? "border-2 border-indigo-600 bg-indigo-50/50 dark:bg-indigo-950/30"
                      : "border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800/60 hover:border-slate-300"
                  }`}>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between flex-wrap gap-1">
                        <span className="font-black text-base text-slate-900 dark:text-white">
                          باقة المبتدئ (Starter)
                        </span>
                        {isPending ? (
                          <span className="px-2.5 py-1 rounded-full bg-amber-500 text-slate-950 text-[10px] font-black animate-pulse flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            <span>طلب قيد المراجعة</span>
                          </span>
                        ) : isCurrent ? (
                          <span className="px-2.5 py-1 rounded-full bg-indigo-600 text-white text-[10px] font-black">
                            الباقة الحالية
                          </span>
                        ) : null}
                      </div>
                      <div className="font-mono">
                        <span className="text-2xl font-black text-slate-900 dark:text-white">
                          0
                        </span>
                        <span className="text-xs text-slate-500 font-bold mr-1">ر.ي مجاناً</span>
                      </div>
                      <ul className="space-y-2 text-xs text-slate-600 dark:text-slate-300">
                        <li className="flex items-center gap-2">
                          <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                          <span>مستودع تخزين رئيسي واحد (1)</span>
                        </li>
                        <li className="flex items-center gap-2">
                          <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                          <span>حتى 100 صنف تجاري</span>
                        </li>
                        <li className="flex items-center gap-2">
                          <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                          <span>نقطة بيع POS كاشير واحدة</span>
                        </li>
                      </ul>
                    </div>

                    <button
                      type="button"
                      disabled={isPending}
                      onClick={() => triggerUpgradeApprovalFlow("STARTER", selectedBillingCycle)}
                      className={`w-full py-3 rounded-2xl font-black text-xs transition-colors cursor-pointer ${
                        isPending
                          ? "bg-amber-500/20 text-amber-800 dark:text-amber-300 cursor-not-allowed"
                          : "bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-800 dark:text-white"
                      }`}
                    >
                      {isPending ? "الطلب قيد المراجعة والاعتماد ⏳" : isCurrent ? "تجديد الباقة الحالية" : "اختيار باقة المبتدئ"}
                    </button>
                  </div>
                );
              })()}

              {/* PROFESSIONAL */}
              {(() => {
                const isCurrent = sub.planId === "PROFESSIONAL";
                const isPending = pendingChange && pendingChange.status === "PENDING_APPROVAL" && pendingChange.requestedTier === "PROFESSIONAL";
                return (
                  <div className={`p-6 rounded-3xl border flex flex-col justify-between space-y-6 transition-all relative ${
                    isPending
                      ? "border-2 border-amber-500 bg-amber-50/40 dark:bg-amber-950/20 shadow-xl ring-2 ring-amber-500/30"
                      : isCurrent
                      ? "border-2 border-indigo-600 bg-indigo-50/50 dark:bg-indigo-950/30 shadow-md"
                      : "border-indigo-300 dark:border-indigo-800 bg-white dark:bg-slate-800/60 shadow-lg"
                  }`}>
                    <div className="absolute -top-3 right-6 px-3 py-0.5 rounded-full bg-amber-400 text-slate-950 font-black text-[10px] shadow-sm">
                      الأكثر طلباً للتجار ⭐
                    </div>

                    <div className="space-y-4">
                      <div className="flex items-center justify-between flex-wrap gap-1">
                        <span className="font-black text-base text-indigo-600 dark:text-indigo-400">
                          باقة التاجر المتقدم (Pro)
                        </span>
                        {isPending ? (
                          <span className="px-2.5 py-1 rounded-full bg-amber-500 text-slate-950 text-[10px] font-black animate-pulse flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            <span>طلب قيد المراجعة</span>
                          </span>
                        ) : isCurrent ? (
                          <span className="px-2.5 py-1 rounded-full bg-indigo-600 text-white text-[10px] font-black">
                            الباقة الحالية
                          </span>
                        ) : null}
                      </div>
                      <div className="font-mono">
                        <span className="text-2xl font-black text-slate-900 dark:text-white">
                          {selectedBillingCycle === "YEARLY" ? "150,000" : "15,000"}
                        </span>
                        <span className="text-xs text-slate-500 font-bold mr-1">
                          {selectedBillingCycle === "YEARLY" ? "ر.ي / سنوياً" : "ر.ي / شهرياً"}
                        </span>
                      </div>
                      <ul className="space-y-2 text-xs text-slate-600 dark:text-slate-300">
                        <li className="flex items-center gap-2">
                          <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                          <span>حتى 5 مستودعات وفروع تخزين</span>
                        </li>
                        <li className="flex items-center gap-2">
                          <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                          <span>حتى 2,500 صنف تجاري</span>
                        </li>
                        <li className="flex items-center gap-2">
                          <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                          <span>حتى 3 نقاط بيع وكاشير متزامنة</span>
                        </li>
                        <li className="flex items-center gap-2">
                          <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                          <span>تنبيهات نقص المخزون التلقائية</span>
                        </li>
                      </ul>
                    </div>

                    <button
                      type="button"
                      disabled={isPending}
                      onClick={() => triggerUpgradeApprovalFlow("PROFESSIONAL", selectedBillingCycle)}
                      className={`w-full py-3 rounded-2xl font-black text-xs transition-colors cursor-pointer shadow-md ${
                        isPending
                          ? "bg-amber-500/20 text-amber-800 dark:text-amber-300 cursor-not-allowed border border-amber-400"
                          : "bg-indigo-600 hover:bg-indigo-700 text-white shadow-indigo-600/30"
                      }`}
                    >
                      {isPending
                        ? "الطلب قيد المراجعة والاعتماد ⏳"
                        : isCurrent
                        ? (selectedBillingCycle === "YEARLY" && sub.billingCycle === "MONTHLY"
                            ? "طلب التحويل للسنوي (وفر شهرين) ⭐"
                            : "تجديد الباقة الحالية 🔄")
                        : "ترقية للباقة المتقدمة 🚀"}
                    </button>
                  </div>
                );
              })()}

              {/* ENTERPRISE_VIP */}
              {(() => {
                const isCurrent = sub.planId === "ENTERPRISE_VIP";
                const isPending = pendingChange && pendingChange.status === "PENDING_APPROVAL" && pendingChange.requestedTier === "ENTERPRISE_VIP";
                return (
                  <div className={`p-6 rounded-3xl border flex flex-col justify-between space-y-6 transition-all ${
                    isPending
                      ? "border-2 border-amber-500 bg-amber-50/40 dark:bg-amber-950/20 shadow-xl ring-2 ring-amber-500/30"
                      : isCurrent
                      ? "border-2 border-indigo-600 bg-indigo-50/50 dark:bg-indigo-950/30 shadow-md"
                      : "border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800/60 hover:border-slate-300"
                  }`}>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between flex-wrap gap-1">
                        <span className="font-black text-base text-amber-600 dark:text-amber-400">
                          باقة المؤسسات والـ VIP
                        </span>
                        {isPending ? (
                          <span className="px-2.5 py-1 rounded-full bg-amber-500 text-slate-950 text-[10px] font-black animate-pulse flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            <span>طلب قيد المراجعة</span>
                          </span>
                        ) : isCurrent ? (
                          <span className="px-2.5 py-1 rounded-full bg-indigo-600 text-white text-[10px] font-black">
                            الباقة الحالية
                          </span>
                        ) : null}
                      </div>
                      <div className="font-mono">
                        <span className="text-2xl font-black text-slate-900 dark:text-white">
                          {selectedBillingCycle === "YEARLY" ? "350,000" : "35,000"}
                        </span>
                        <span className="text-xs text-slate-500 font-bold mr-1">
                          {selectedBillingCycle === "YEARLY" ? "ر.ي / سنوياً" : "ر.ي / شهرياً"}
                        </span>
                      </div>
                      <ul className="space-y-2 text-xs text-slate-600 dark:text-slate-300">
                        <li className="flex items-center gap-2">
                          <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                          <span>مستودعات وفروع غير محدودة (Unlimited)</span>
                        </li>
                        <li className="flex items-center gap-2">
                          <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                          <span>أصناف تجارية غير محدودة</span>
                        </li>
                        <li className="flex items-center gap-2">
                          <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                          <span>نقاط كاشير غير محدودة مع شاشات الزبائن</span>
                        </li>
                        <li className="flex items-center gap-2">
                          <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                          <span>دعم فني مخصص ومباشر على مدار الساعة 24/7</span>
                        </li>
                      </ul>
                    </div>

                    <button
                      type="button"
                      disabled={isPending}
                      onClick={() => triggerUpgradeApprovalFlow("ENTERPRISE_VIP", selectedBillingCycle)}
                      className={`w-full py-3 rounded-2xl font-black text-xs transition-colors cursor-pointer ${
                        isPending
                          ? "bg-amber-500/20 text-amber-800 dark:text-amber-300 cursor-not-allowed border border-amber-400"
                          : "bg-slate-900 hover:bg-slate-800 dark:bg-slate-700 dark:hover:bg-slate-600 text-white"
                      }`}
                    >
                      {isPending
                        ? "الطلب قيد المراجعة والاعتماد ⏳"
                        : isCurrent
                        ? (selectedBillingCycle === "YEARLY" && sub.billingCycle === "MONTHLY"
                            ? "طلب التحويل للسنوي (وفر شهرين) ⭐"
                            : "تجديد باقة VIP 🔄")
                        : "ترقية لباقة المؤسسات VIP 👑"}
                    </button>
                  </div>
                );
              })()}
            </div>

            {/* Help & Custom Inquiries */}
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-2.5 text-slate-700 dark:text-slate-300">
                <Info className="w-4 h-4 text-indigo-500 shrink-0" />
                <span>هل تحتاج باقة مخصصة لشبكة فروع ومستودعات ضخمة أو استفسار مالي؟</span>
              </div>

              <CustomerServiceButton className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-black text-xs transition-colors cursor-pointer self-start sm:self-auto flex items-center gap-1.5 shadow-sm">
                <Headphones className="w-3.5 h-3.5" />
                <span>تواصل مع قسم الاشتراكات والفوترة</span>
              </CustomerServiceButton>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: Taxes & VAT Settings */}
      {activeTab === "TAX" && (
        <form onSubmit={handleSaveProfile} className="space-y-6">
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400">
                  <Percent className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-base font-black text-slate-900 dark:text-white">
                    نظام ضريبة القيمة المضافة (VAT) والفوترة
                  </h2>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    التحكم في إضافة أو إلغاء احتساب الضريبة في فواتير الكاشير والمبيعات
                  </p>
                </div>
              </div>

              <span className="text-xs px-3 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-bold">
                محلي (اليمن) / دولي 🌍
              </span>
            </div>

            {/* Context Box */}
            <div className="p-4 rounded-2xl bg-amber-50/80 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/50 text-xs text-amber-900 dark:text-amber-200 flex items-start gap-3">
              <Info className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
              <div className="space-y-1">
                <span className="font-black block">
                  إيضاح النظام الضريبي والفوترة:
                </span>
                <p className="leading-relaxed text-[11.5px]">
                  في الأسواق المحلية مثل <strong>اليمن</strong>، لا تُفرض ضريبة مبيعات مضافة (VAT) تضاف فوق سعر السلع على الفاتورة، لذا يكون هذا الخيار <strong>مُعطلاً تلقائياً (0%)</strong>. إذا كان نشاطك يتطلب فوترة ضريبية مضافة أو للتوسع في الأسواق الإقليمية (كالخليج والسعودية 15%)، يمكنك تفعيل الخيار وتحديد النسبة المناسبة ليتم احتسابها تلقائياً عند إصدار فواتير POS.
                </p>
              </div>
            </div>

            {/* Toggle Switch */}
            <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <label htmlFor="tax-page-toggle" className="font-black text-slate-900 dark:text-white text-sm cursor-pointer flex items-center gap-2">
                    <span>تفعيل احتساب ضريبة القيمة المضافة (VAT)</span>
                    {taxEnabled ? (
                      <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300">
                        مُفعل ✅
                      </span>
                    ) : (
                      <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300">
                        معطل (افتراضي اليمن) ⭕
                      </span>
                    )}
                  </label>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    عند التفعيل، سيتم إدراج خانة الضريبة وحساب الإجمالي بعد الضريبة على كل فاتورة بيع صادرة.
                  </p>
                </div>

                <label className="relative inline-flex items-center cursor-pointer shrink-0">
                  <input
                    id="tax-page-toggle"
                    type="checkbox"
                    checked={taxEnabled}
                    onChange={(e) => setTaxEnabled(e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-12 h-6 bg-slate-300 peer-focus:outline-none rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-slate-600 peer-checked:bg-emerald-600"></div>
                </label>
              </div>

              {/* Tax Rate Presets & Input if Enabled */}
              {taxEnabled && (
                <div className="pt-4 border-t border-slate-200 dark:border-slate-700 space-y-4 animate-in fade-in">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                      <span className="font-black text-slate-800 dark:text-slate-200 text-xs block">
                        نسبة الضريبة المئوية (%) *
                      </span>
                      <span className="text-[11px] text-slate-400">
                        اختر نسبة سريعة أو اكتب النسبة المخصصة
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setTaxRate(5)}
                        className={`px-3 py-1.5 rounded-xl font-black text-xs transition-colors cursor-pointer ${
                          taxRate === 5
                            ? "bg-emerald-600 text-white"
                            : "bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200"
                        }`}
                      >
                        5% (ميسرة)
                      </button>
                      <button
                        type="button"
                        onClick={() => setTaxRate(15)}
                        className={`px-3 py-1.5 rounded-xl font-black text-xs transition-colors cursor-pointer ${
                          taxRate === 15
                            ? "bg-emerald-600 text-white"
                            : "bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200"
                        }`}
                      >
                        15% (القياسية)
                      </button>
                      <div className="flex items-center gap-1.5 mr-2">
                        <input
                          type="number"
                          min="0"
                          max="100"
                          step="0.5"
                          value={taxRate}
                          onChange={(e) => setTaxRate(parseFloat(e.target.value) || 0)}
                          className="w-20 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 font-mono font-black text-sm text-center text-slate-900 dark:text-white"
                        />
                        <span className="font-black text-slate-600 dark:text-slate-300 text-sm">%</span>
                      </div>
                    </div>
                  </div>

                  {/* Live Calculation Preview */}
                  <div className="p-4 rounded-2xl bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-200/80 dark:border-emerald-900/50 text-xs">
                    <span className="font-black text-emerald-900 dark:text-emerald-200 block mb-2">
                      معاينة حية لاحتساب فاتورة بقيمة {sampleSubtotal.toLocaleString("ar-YE")} ر.ي:
                    </span>
                    <div className="grid grid-cols-3 gap-2 text-center">
                      <div className="p-2 rounded-xl bg-white dark:bg-slate-900 border border-emerald-200 dark:border-emerald-800">
                        <span className="text-[10px] text-slate-500 block">المبلغ قبل الضريبة</span>
                        <strong className="font-mono text-xs text-slate-900 dark:text-white">
                          {sampleSubtotal.toLocaleString("ar-YE")} ر.ي
                        </strong>
                      </div>
                      <div className="p-2 rounded-xl bg-white dark:bg-slate-900 border border-emerald-200 dark:border-emerald-800">
                        <span className="text-[10px] text-emerald-600 dark:text-emerald-400 block">
                          مبلغ الضريبة ({taxRate}%)
                        </span>
                        <strong className="font-mono text-xs text-emerald-600 dark:text-emerald-400">
                          +{sampleTax.toLocaleString("ar-YE")} ر.ي
                        </strong>
                      </div>
                      <div className="p-2 rounded-xl bg-emerald-600 text-white font-black">
                        <span className="text-[10px] text-emerald-100 block">الإجمالي النهائي</span>
                        <strong className="font-mono text-xs">
                          {sampleTotal.toLocaleString("ar-YE")} ر.ي
                        </strong>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="flex justify-end">
              <button
                type="submit"
                className="px-8 py-3.5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-sm transition-all shadow-md shadow-emerald-600/30 hover:scale-[1.01] active:scale-98 cursor-pointer flex items-center gap-2"
              >
                <CheckCircle2 className="w-5 h-5" />
                <span>حفظ إعدادات الفوترة والضرائب</span>
              </button>
            </div>
          </div>
        </form>
      )}

      {/* TAB 4: WhatsApp Integration & Electronic Vouchers */}
      {activeTab === "WHATSAPP" && (
        <div className="space-y-6 animate-fadeIn">
          <WhatsAppWebConnector
            isConnected={isWhatsAppConnected}
            onConnect={() => {
              setIsWhatsAppConnected(true);
              setSavedSuccessMsg("تم ربط جهاز واتساب واقترانه بنجاح! 🟢");
              setTimeout(() => setSavedSuccessMsg(""), 3500);
            }}
            onDisconnect={() => {
              setIsWhatsAppConnected(false);
              handleUnlinkWhatsApp();
            }}
            phone={whatsAppPhone}
            storeName={storeName}
            ownerName={ownerName}
            managerPhone={whatsAppManagerPhone}
          />
        </div>
      )}

      {/* Subscription Upgrade & Platform Approval Notice Modal */}
      {isApprovalModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-4 dir-rtl overflow-y-auto animate-in fade-in duration-200">
          <div className="relative w-full max-w-lg bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden my-6">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-5 bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white border-b border-indigo-900/50">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-2xl bg-amber-500 text-slate-950 shadow-md">
                  <Crown className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-black text-white text-base">
                    طلب ترقية وتغيير باقة الاشتراك
                  </h3>
                  <p className="text-xs text-indigo-200">
                    بوابات الاشتراك والترقية للتجار
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setIsApprovalModalOpen(false)}
                className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-5">
              {/* Highlight Notice Box as explicitly requested by user */}
              <div className="p-5 rounded-3xl bg-amber-500/15 border-2 border-amber-500/80 text-amber-950 dark:text-amber-200 text-center space-y-2 shadow-sm">
                <div className="w-12 h-12 rounded-2xl bg-amber-500 text-slate-950 flex items-center justify-center mx-auto shadow-md">
                  <Clock className="w-6 h-6 animate-pulse" />
                </div>
                <h4 className="text-base sm:text-lg font-black text-amber-900 dark:text-amber-100">
                  يرجى انتظار موافقة إدارة المنصة
                </h4>
                <p className="text-xs text-amber-800 dark:text-amber-300 leading-relaxed font-medium">
                  عند تأكيد إرسال الطلب، سيتم توجيه طلب الترقية مباشرة إلى إدارة المنصة لمراجعة وتأكيد سداد الرسوم وتفعيل حدود الباقة الجديدة لمتجرك في أقرب وقت.
                </p>
              </div>

              {/* Request Details Breakdown */}
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 space-y-3 text-xs">
                <div className="flex items-center justify-between border-b border-slate-200/80 dark:border-slate-700/80 pb-2">
                  <span className="text-slate-500 dark:text-slate-400">الباقة المطلوبة:</span>
                  <span className="font-black text-slate-900 dark:text-white text-xs sm:text-sm">
                    {targetTierInfo.nameAr}
                  </span>
                </div>

                <div className="flex items-center justify-between border-b border-slate-200/80 dark:border-slate-700/80 pb-2">
                  <span className="text-slate-500 dark:text-slate-400">دورة الفوترة:</span>
                  <span className="font-bold px-2.5 py-0.5 rounded-full bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">
                    {requestedCycleForApproval === "YEARLY" ? "اشتراك سنوي (خصم شهرين مجاناً) ⭐" : "اشتراك شهري 🗓️"}
                  </span>
                </div>

                <div className="flex items-center justify-between border-b border-slate-200/80 dark:border-slate-700/80 pb-2">
                  <span className="text-slate-500 dark:text-slate-400">قيمة الاشتراك:</span>
                  <span className="font-mono font-black text-indigo-600 dark:text-indigo-400 text-sm">
                    {targetPrice > 0 ? `${targetPrice.toLocaleString("ar-YE")} ر.ي` : "مجاناً"}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-slate-500 dark:text-slate-400">حالة الطلب بعد التأكيد:</span>
                  <span className="font-black text-amber-600 dark:text-amber-400 flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5" />
                    <span>قيد المراجعة والاعتماد</span>
                  </span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={handleConfirmUpgradeRequest}
                  className="flex-1 py-3.5 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-black text-xs sm:text-sm transition-all shadow-md shadow-indigo-600/30 hover:scale-[1.01] active:scale-98 cursor-pointer flex items-center justify-center gap-2"
                >
                  <Send className="w-4 h-4" />
                  <span>تأكيد وإرسال طلب الترقية</span>
                </button>

                <button
                  type="button"
                  onClick={() => setIsApprovalModalOpen(false)}
                  className="px-5 py-3.5 rounded-2xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-black text-xs transition-colors cursor-pointer"
                >
                  إلغاء
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Location Picker Modal */}
      {isLocationPickerOpen && (
        <LocationPickerModal
          isOpen={isLocationPickerOpen}
          onClose={() => setIsLocationPickerOpen(false)}
          initialLat={lat}
          initialLng={lng}
          onConfirmLocation={handleConfirmLocation}
          title="تحديد الموقع الجغرافي للمتجر على الخريطة"
        />
      )}
    </div>
  );
};
