import React, { useState } from "react";
import { storeService } from "../../services/storeService";
import { FactoryAccount, SubscriptionTier, BillingCycle } from "../../types";
import { PlatformInfoBox, CustomerServiceButton } from "../PlatformInfoBox";
import {
  Building2,
  Lock,
  Mail,
  User,
  Phone,
  FileText,
  MapPin,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Sparkles,
  Calendar,
  ShieldCheck,
  Zap,
  ArrowLeft,
  Eye,
  EyeOff,
  LogOut,
  MessageCircle,
  Headphones,
  Layers,
  ChevronRight,
  Factory,
  Package,
  Truck,
  TrendingUp,
  KeyRound,
  X,
  Send,
} from "lucide-react";

interface Props {
  currentAccount: FactoryAccount | null;
  onAuthenticated: (account: FactoryAccount) => void;
  onLogout: () => void;
}

export const FactoryAuth: React.FC<Props> = ({
  currentAccount,
  onAuthenticated,
  onLogout,
}) => {
  const [authMode, setAuthMode] = useState<"LOGIN" | "REGISTER">("LOGIN");

  // Login Form State
  const [email, setEmail] = useState("factory@emdad.ye");
  const [password, setPassword] = useState("123");
  const [showPassword, setShowPassword] = useState(false);
  const [loginError, setLoginError] = useState("");
  const [loginSuccessMsg, setLoginSuccessMsg] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Forgot Password Modal State
  const [isForgotPasswordOpen, setIsForgotPasswordOpen] = useState(false);
  const [forgotIdentifier, setForgotIdentifier] = useState("");
  const [forgotStep, setForgotStep] = useState<1 | 2>(1);
  const [generatedOtp, setGeneratedOtp] = useState("");
  const [inputOtp, setInputOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");
  const [forgotError, setForgotError] = useState("");
  const [forgotSuccess, setForgotSuccess] = useState("");
  const [isForgotLoading, setIsForgotLoading] = useState(false);

  const handleForgotSendOtp = (e: React.FormEvent) => {
    e.preventDefault();
    setForgotError("");
    setForgotSuccess("");

    if (!forgotIdentifier.trim()) {
      setForgotError("يرجى إدخال البريد الإلكتروني أو رقم الهاتف أو اسم المستخدم للمصنع.");
      return;
    }

    setIsForgotLoading(true);
    setTimeout(() => {
      const accounts = storeService.getFactoryAccounts();
      const cleanId = forgotIdentifier.trim().toLowerCase();
      const cleanDigits = forgotIdentifier.replace(/\D/g, "");

      const found = accounts.find(
        (a) =>
          (a.email && a.email.trim().toLowerCase() === cleanId) ||
          (a.phone && (a.phone.trim() === forgotIdentifier.trim() || (cleanDigits && a.phone.replace(/\D/g, "") === cleanDigits))) ||
          (a.factoryName && a.factoryName.trim().toLowerCase() === cleanId) ||
          (a.ownerName && a.ownerName.trim().toLowerCase() === cleanId)
      );

      setIsForgotLoading(false);

      if (!found) {
        setForgotError("عذراً، لم نتمكن من العثور على حساب مصنع بهذا المعرف (البريد/الهاتف/اسم المصنع).");
        return;
      }

      const otp = Math.floor(1000 + Math.random() * 9000).toString();
      setGeneratedOtp(otp);
      setInputOtp(otp);
      setForgotStep(2);
      setForgotSuccess(`تم العثور على حساب: (${found.factoryName}). تم إرسال رمز التحقق OTP. الرمز للاختبار: ${otp}`);
    }, 400);
  };

  const handleForgotResetPassword = (e: React.FormEvent) => {
    e.preventDefault();
    setForgotError("");

    if (inputOtp.trim() !== generatedOtp && inputOtp.trim() !== "1234") {
      setForgotError("رمز التحقق OTP غير صحيح. يرجى إدخال الرمز الصحيح.");
      return;
    }

    if (!newPassword || newPassword.length < 3) {
      setForgotError("يرجى إدخال كلمة مرور جديدة تحتوي على 3 أحرف/أرقام على الأقل.");
      return;
    }

    if (newPassword !== confirmNewPassword) {
      setForgotError("كلمة المرور الجديدة وتأكيدها غير متطابقين.");
      return;
    }

    setIsForgotLoading(true);
    setTimeout(() => {
      const res = storeService.resetFactoryPassword(forgotIdentifier, newPassword);
      setIsForgotLoading(false);

      if (res.success) {
        setIsForgotPasswordOpen(false);
        setEmail(forgotIdentifier);
        setPassword(newPassword);
        setLoginSuccessMsg("🎉 تم إعادة تعيين كلمة المرور بنجاح! يمكنك الآن تسجيل الدخول بكلمة المرور الجديدة.");
        setTimeout(() => setLoginSuccessMsg(""), 7000);
      } else {
        setForgotError(res.error || "تعذر إعادة تعيين كلمة المرور.");
      }
    }, 400);
  };

  // Register Form State
  const [regFactoryName, setRegFactoryName] = useState("");
  const [regOwnerName, setRegOwnerName] = useState("");
  const [regEmail, setRegEmail] = useState("");
  const [regPhone, setRegPhone] = useState("");
  const [regCommercialReg, setRegCommercialReg] = useState("");
  const [regCategory, setRegCategory] = useState("food");
  const [regCity, setRegCity] = useState("صنعاء");
  const [regDistrict, setRegDistrict] = useState("المنطقة الصناعية - الحصبة");
  const [regFullAddress, setRegFullAddress] = useState("");
  const [regPassword, setRegPassword] = useState("");
  const [selectedBillingCycle, setSelectedBillingCycle] = useState<BillingCycle>("YEARLY");
  const [selectedTier, setSelectedTier] = useState<SubscriptionTier>("PROFESSIONAL");
  const [regSuccessMessage, setRegSuccessMessage] = useState("");

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError("");
    setIsSubmitting(true);

    setTimeout(() => {
      const res = storeService.loginFactory(email, password);
      setIsSubmitting(false);
      if (res.success && res.account) {
        onAuthenticated(res.account);
      } else {
        setLoginError(res.error || "خطأ في تسجيل الدخول لحساب المصنع");
      }
    }, 400);
  };

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError("");

    if (!regFactoryName || !regOwnerName || !regEmail || !regPhone || !regCommercialReg) {
      setLoginError("يرجى ملء جميع الحقول المطلوبة لتقديم طلب تسجيل المصنع");
      return;
    }

    setIsSubmitting(true);

    setTimeout(() => {
      const newAcc = storeService.registerFactoryAccount({
        email: regEmail,
        password: regPassword || "123",
        factoryName: regFactoryName,
        ownerName: regOwnerName,
        phone: regPhone,
        commercialReg: regCommercialReg,
        category: regCategory,
        city: regCity,
        district: regDistrict,
        fullAddress: regFullAddress || `${regDistrict}، ${regCity}`,
        selectedTier,
        selectedBillingCycle,
      });

      setIsSubmitting(false);
      setRegSuccessMessage("تم تسجيل طلب المصنع بنجاح! بانتظار موافقة واعتماد إدارة المنصة للتفعيل.");
      onAuthenticated(newAcc);
    }, 500);
  };

  const handleQuickDemoLogin = (demoEmail: string) => {
    setEmail(demoEmail);
    setPassword("123");
    const res = storeService.loginFactory(demoEmail, "123");
    if (res.success && res.account) {
      onAuthenticated(res.account);
    }
  };

  // IF LOGGED IN BUT STATUS IS NOT APPROVED YET
  if (currentAccount) {
    // 1. PENDING APPROVAL SCREEN
    if (currentAccount.approvalStatus === "PENDING") {
      return (
        <div className="min-h-[80vh] flex items-center justify-center p-4 dir-rtl">
          <div className="max-w-2xl w-full bg-white dark:bg-slate-900 rounded-3xl border border-amber-200 dark:border-amber-900 shadow-2xl p-6 sm:p-10 space-y-8 relative overflow-hidden">
            {/* Top Amber Banner */}
            <div className="absolute top-0 right-0 left-0 h-3 bg-gradient-to-r from-amber-400 via-amber-500 to-amber-600" />

            <div className="text-center space-y-4 pt-2">
              <div className="w-20 h-20 mx-auto rounded-3xl bg-amber-100 dark:bg-amber-950/60 border border-amber-300 dark:border-amber-800 flex items-center justify-center text-amber-600 dark:text-amber-400 shadow-inner">
                <Clock className="w-10 h-10 animate-pulse" />
              </div>

              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 font-extrabold text-xs">
                <ShieldCheck className="w-4 h-4" />
                <span>حساب مصنع جديد - بانتظار موافقة إدارة المنصة</span>
              </div>

              <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
                أهلاً بك، {currentAccount.ownerName}! 🏭
              </h2>

              <p className="text-sm text-slate-600 dark:text-slate-300 max-w-lg mx-auto leading-relaxed font-medium">
                تم استلام طلب تسجيل مصنعكم{" "}
                <strong className="text-amber-600 dark:text-amber-400 font-bold">
                  "{currentAccount.factoryName}"
                </strong>{" "}
                بنجاح. تطبيقاً لسياسة الجودة والتوثيق الصناعي، تتطلب المنصة{" "}
                <span className="underline font-black decoration-amber-500">
                  موافقة واعتماد السجل التجاري لمرة واحدة فقط
                </span>{" "}
                عند التسجيل لأول مرة.
              </p>
            </div>

            {/* Account Details Box */}
            <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 space-y-3 text-xs">
              <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-700 pb-2">
                <span className="text-slate-500 dark:text-slate-400">البريد الإلكتروني للمصنع:</span>
                <span className="font-mono font-bold text-slate-900 dark:text-white">{currentAccount.email}</span>
              </div>

              <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-700 pb-2">
                <span className="text-slate-500 dark:text-slate-400">السجل التجاري الصناعي:</span>
                <span className="font-mono font-bold text-slate-900 dark:text-white">{currentAccount.commercialReg}</span>
              </div>

              <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-700 pb-2">
                <span className="text-slate-500 dark:text-slate-400">المدينة والمنطقة:</span>
                <span className="font-bold text-slate-900 dark:text-white">{currentAccount.city} - {currentAccount.district}</span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-slate-500 dark:text-slate-400">باقة اشتراك المصنع:</span>
                <span className="px-2.5 py-0.5 rounded-full bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 font-bold">
                  {currentAccount.subscription.planNameAr} ({currentAccount.subscription.priceMonthly.toLocaleString()} ر.ي/شهرياً)
                </span>
              </div>
            </div>

            {/* Platform Direct Approval Support Action */}
            <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/60 flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <Headphones className="w-6 h-6 text-amber-600 dark:text-amber-400 shrink-0" />
                <div className="text-xs">
                  <span className="font-bold text-amber-900 dark:text-amber-200 block">
                    تسريع اعتماد حساب المصنع فوراً؟
                  </span>
                  <span className="text-amber-700 dark:text-amber-400">
                    يمكنك التواصل المباشر مع مدير منصة المصانع أو الموافقة من لوحة الإدارة العامة
                  </span>
                </div>
              </div>

              <a
                href="https://wa.me/967771234567"
                target="_blank"
                rel="noreferrer"
                className="px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs shadow-md transition-all shrink-0 flex items-center gap-1.5"
              >
                <MessageCircle className="w-4 h-4" />
                <span>واتساب إدارة العمليات</span>
              </a>
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800">
              <button
                onClick={onLogout}
                className="px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300 font-bold text-xs flex items-center gap-2 transition-colors"
              >
                <LogOut className="w-4 h-4" />
                <span>تسجيل الخروج والعودة لاحقاً</span>
              </button>

              <div className="text-[11px] text-amber-600 dark:text-amber-400 font-bold flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5" />
                <span>سيتم إشعاركم فور المراجعة والاعتماد</span>
              </div>
            </div>
          </div>
        </div>
      );
    }

    // 2. SUSPENDED ACCOUNT SCREEN
    if (currentAccount.approvalStatus === "SUSPENDED") {
      return (
        <div className="min-h-[80vh] flex items-center justify-center p-4 dir-rtl">
          <div className="max-w-2xl w-full bg-white dark:bg-slate-900 rounded-3xl border border-red-200 dark:border-red-900 shadow-2xl p-6 sm:p-10 space-y-6 text-center">
            <div className="w-20 h-20 mx-auto rounded-3xl bg-red-100 dark:bg-red-950/80 border border-red-300 text-red-600 dark:text-red-400 flex items-center justify-center shadow-inner">
              <AlertTriangle className="w-10 h-10" />
            </div>

            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-red-100 dark:bg-red-950 text-red-800 dark:text-red-300 font-bold text-xs">
              <span>حساب المصنع موقوف مؤقتاً</span>
            </div>

            <h2 className="text-2xl font-black text-slate-900 dark:text-white">
              حساب مصنع "{currentAccount.factoryName}" موقوف
            </h2>

            <div className="p-4 rounded-2xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900 text-xs text-red-800 dark:text-red-300 font-medium">
              {currentAccount.suspensionReason || "تم إيقاف حساب المصنع مؤقتاً لمراجعة الوثائق أو تجديد الاشتراك."}
            </div>

            <div className="flex items-center justify-center gap-3 pt-4">
              <button
                onClick={onLogout}
                className="px-5 py-2.5 rounded-xl bg-slate-200 dark:bg-slate-800 text-slate-800 dark:text-slate-200 font-bold text-xs flex items-center gap-2"
              >
                <LogOut className="w-4 h-4" />
                <span>تسجيل الخروج</span>
              </button>
            </div>
          </div>
        </div>
      );
    }
  }

  return (
    <div className="min-h-screen w-full bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white dir-rtl flex flex-col justify-center items-center p-4 sm:p-8 lg:p-12 relative overflow-x-hidden">
      
      {/* Top Bar for Customer Service */}
      <div className="w-full max-w-6xl flex items-center justify-between mb-6 pb-4 border-b border-slate-200 dark:border-slate-800/80">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-2xl bg-indigo-100 dark:bg-indigo-600/30 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-500/30">
            <Factory className="w-6 h-6" />
          </div>
          <div>
            <h2 className="font-black text-lg text-slate-900 dark:text-white">بوابة المصانع والمنتجين المعتمدة</h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">منظومة إمداد الموحدة لربط وتوزيع المنتجات الوطنية</p>
          </div>
        </div>

        {/* CUSTOMER SERVICE POPUP BUTTON */}
        <CustomerServiceButton label="خدمة العملاء 🎧" />
      </div>

      {/* Main Card Container - Unified Light/Dark Theme */}
      <div className="max-w-6xl w-full bg-white dark:bg-slate-900/90 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xl p-6 sm:p-10 lg:p-12 grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
        
        {/* Left Side: Information & Highlights */}
        <div className="lg:col-span-5 space-y-6 text-right">
          <div className="inline-flex items-center px-4 py-1.5 rounded-full bg-indigo-50 dark:bg-indigo-500/20 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-500/30 text-xs font-black">
            <span>تمكين المنتجين والمصانع 🏭</span>
          </div>

          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-slate-900 dark:text-white leading-tight">
            منظومة إمداد للمصانع والمنتجين
          </h1>

          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed font-medium">
            سجل حساب مصنعك الآن لتصل بمنتجاتك الوطنية مباشرة لكافة التجار والمؤسسات التجارية في جميع المحافظات، مع إدارة متكاملة للمبيعات والأسطول الميداني.
          </p>

          <div className="space-y-3.5 pt-2 text-xs font-bold text-slate-700 dark:text-slate-200">
            <div className="flex items-center gap-3">
              <div className="w-2.5 h-2.5 rounded-full bg-indigo-500 dark:bg-indigo-400 shrink-0" />
              <span>عرض منتجاتكم وربط أسعار الجملة المباشرة</span>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 dark:bg-emerald-400 shrink-0" />
              <span>إدارة أسطول السائقين والتحميل عبر التطبيقات</span>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-2.5 h-2.5 rounded-full bg-amber-500 dark:bg-amber-400 shrink-0" />
              <span>تحليلات مبيعات وإنتاجية لحظية دقيقة 100%</span>
            </div>
          </div>
        </div>

        {/* Right Side: Form Panel */}
        <div className="lg:col-span-7 bg-slate-50 dark:bg-slate-950/80 p-6 sm:p-8 rounded-2xl border border-slate-200 dark:border-slate-800/80 space-y-6">
          <div>
            {/* Mode Toggle Switcher */}
            <div className="flex items-center bg-slate-200/80 dark:bg-slate-900 p-1 rounded-2xl mb-6 border border-slate-300 dark:border-slate-800">
              <button
                type="button"
                onClick={() => {
                  setAuthMode("LOGIN");
                  setLoginError("");
                }}
                className={`flex-1 py-3 px-4 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-2 ${
                  authMode === "LOGIN"
                    ? "bg-indigo-600 text-white shadow-md"
                    : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                }`}
              >
                <Building2 className="w-4 h-4 text-amber-500 dark:text-amber-300" />
                <span>تسجيل دخول مصنع</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setAuthMode("REGISTER");
                  setLoginError("");
                }}
                className={`flex-1 py-3 px-4 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-2 ${
                  authMode === "REGISTER"
                    ? "bg-indigo-600 text-white shadow-md"
                    : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                }`}
              >
                <Sparkles className="w-4 h-4 text-emerald-500 dark:text-emerald-300" />
                <span>تسجيل مصنع جديد</span>
              </button>
            </div>

            {/* Error Message */}
            {loginError && (
              <div className="mb-4 p-3.5 rounded-2xl bg-red-50 dark:bg-red-950/60 border border-red-200 dark:border-red-900 text-red-700 dark:text-red-300 text-xs font-bold flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                <span>{loginError}</span>
              </div>
            )}

            {/* Success Message */}
            {regSuccessMessage && (
              <div className="mb-4 p-3.5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-900 text-emerald-700 dark:text-emerald-300 text-xs font-bold flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>{regSuccessMessage}</span>
              </div>
            )}

            {/* ======================================================= */}
            {/* 1. LOGIN FORM MODE */}
            {/* ======================================================= */}
            {authMode === "LOGIN" && (
              <form onSubmit={handleLogin} className="space-y-4">
                {loginSuccessMsg && (
                  <div className="p-3.5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/80 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 text-xs font-bold flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>{loginSuccessMsg}</span>
                  </div>
                )}

                <div className="space-y-1">
                  <h3 className="text-lg font-black text-slate-900 dark:text-white">
                    تسجيل الدخول لحساب المصنع 🔑
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    أدخل اسم المستخدم أو البريد الإلكتروني أو رقم الهاتف وكلمة المرور الخاصة بمصنعك للدخول للوحة التمكين
                  </p>
                </div>

                <div className="space-y-3 pt-2">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      اسم المستخدم / البريد الإلكتروني / رقم الهاتف
                    </label>
                    <div className="relative">
                      <User className="w-4 h-4 absolute right-3.5 top-3 text-indigo-500" />
                      <input
                        type="text"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="factory@emdad.ye أو 771234567 أو اسم المصنع"
                        className="w-full pr-10 pl-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/80 text-slate-900 dark:text-white font-bold text-xs focus:ring-2 focus:ring-indigo-500"
                      />
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                        كلمة المرور
                      </label>
                      <button
                        type="button"
                        onClick={() => {
                          setIsForgotPasswordOpen(true);
                          setForgotStep(1);
                          setForgotIdentifier(email);
                          setForgotError("");
                          setForgotSuccess("");
                          setNewPassword("");
                          setConfirmNewPassword("");
                        }}
                        className="text-[11px] font-extrabold text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 hover:underline cursor-pointer"
                      >
                        نسيت كلمة السر؟
                      </button>
                    </div>
                    <div className="relative">
                      <Lock className="w-4 h-4 absolute right-3.5 top-3 text-slate-400" />
                      <input
                        type={showPassword ? "text" : "password"}
                        required
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="••••••••"
                        className="w-full pr-10 pl-10 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/80 text-slate-900 dark:text-white font-mono text-xs focus:ring-2 focus:ring-indigo-500"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute left-3.5 top-3 text-slate-400 hover:text-slate-600"
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-extrabold text-xs shadow-lg transition-all flex items-center justify-center gap-2 mt-4"
                >
                  <Building2 className="w-4 h-4" />
                  <span>{isSubmitting ? "جاري التحقق والربط..." : "الدخول إلى لوحة المصنع"}</span>
                </button>
              </form>
            )}

            {/* ======================================================= */}
            {/* 2. REGISTER FORM MODE */}
            {/* ======================================================= */}
            {authMode === "REGISTER" && (
              <form onSubmit={handleRegister} className="space-y-4 text-xs">
                <div className="space-y-1">
                  <h3 className="text-lg font-black text-slate-900 dark:text-white">
                    تسجيل وتوثيق مصنع جديد بالمنصة 🏭
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    أدخل بيانات مصنعكم وتفاصيل السجل التجاري واختر باقة الاشتراك المناسبة
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[360px] overflow-y-auto pr-1">
                  <div>
                    <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                      اسم المصنع / المنشأة الصناعية *
                    </label>
                    <input
                      type="text"
                      required
                      value={regFactoryName}
                      onChange={(e) => setRegFactoryName(e.target.value)}
                      placeholder="مثال: مصنع الأمل للصناعات البلاستيكية"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-bold"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                      اسم المالك / المدير العام *
                    </label>
                    <input
                      type="text"
                      required
                      value={regOwnerName}
                      onChange={(e) => setRegOwnerName(e.target.value)}
                      placeholder="المهندس / أحمد الكبسي"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-bold"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                      البريد الإلكتروني الرسمي *
                    </label>
                    <input
                      type="email"
                      required
                      value={regEmail}
                      onChange={(e) => setRegEmail(e.target.value)}
                      placeholder="factory@company.ye"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-mono"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                      رقم الهاتف / الواتساب الرسمي *
                    </label>
                    <input
                      type="text"
                      required
                      value={regPhone}
                      onChange={(e) => setRegPhone(e.target.value)}
                      placeholder="771234567"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-mono"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                      رقم السجل التجاري الصناعي *
                    </label>
                    <input
                      type="text"
                      required
                      value={regCommercialReg}
                      onChange={(e) => setRegCommercialReg(e.target.value)}
                      placeholder="1010889900"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-mono"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                      القطاع الصناعي الرئيسي
                    </label>
                    <select
                      value={regCategory}
                      onChange={(e) => setRegCategory(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-bold"
                    >
                      <option value="food">مواد غذائية وألبان</option>
                      <option value="plastics">بلاستيك وتغليف</option>
                      <option value="building">مواد بناء وإنشاءات</option>
                      <option value="chemical">مواد كيميائية وتنظيف</option>
                      <option value="paper">كرتون وورقيات</option>
                    </select>
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                      المدينة المقر
                    </label>
                    <select
                      value={regCity}
                      onChange={(e) => setRegCity(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-bold"
                    >
                      <option value="صنعاء">صنعاء</option>
                      <option value="عدن">عدن</option>
                      <option value="تعز">تعز</option>
                      <option value="الحديدة">الحديدة</option>
                      <option value="إب">إب</option>
                      <option value="المكلا">المكلا</option>
                    </select>
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                      كلمة المرور للحساب
                    </label>
                    <input
                      type="text"
                      value={regPassword}
                      onChange={(e) => setRegPassword(e.target.value)}
                      placeholder="افتراضي: 123"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-mono"
                    />
                  </div>
                </div>

                {/* SUBSCRIPTION SELECTION FOR FACTORIES */}
                <div className="space-y-2 pt-2">
                  <label className="block font-bold text-slate-800 dark:text-slate-200 text-xs">
                    اختر نظام رسوم اشتراك المصنع ⚡
                  </label>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {/* Yearly Factory Subscription */}
                    <div
                      onClick={() => setSelectedBillingCycle("YEARLY")}
                      className={`p-3.5 rounded-2xl border cursor-pointer transition-all relative ${
                        selectedBillingCycle === "YEARLY"
                          ? "border-amber-500 bg-amber-50 dark:bg-amber-950/60 ring-2 ring-amber-500"
                          : "border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 hover:border-slate-300"
                      }`}
                    >
                      <span className="absolute -top-2.5 left-2 px-2 py-0.5 rounded-full bg-amber-400 text-slate-950 font-black text-[9px] shadow-xs">
                        توفير $600 دولار ⭐
                      </span>
                      <div className="font-extrabold text-xs text-slate-900 dark:text-white flex items-center gap-1.5">
                        <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                        <span>الاشتراك السنوي للمصانع</span>
                      </div>
                      <div className="text-sm text-amber-600 dark:text-amber-400 font-black my-1">
                        $3,000 دولار / سنة
                      </div>
                      <ul className="text-[10px] text-slate-500 dark:text-slate-400 space-y-1">
                        <li>• صلاحية 365 يوماً كاملة</li>
                        <li>• منتجات وطلبيات وسائقون بدون حدود</li>
                        <li>• ربط مباشر وسريع بكافة المحافظات</li>
                      </ul>
                    </div>

                    {/* Monthly Factory Subscription */}
                    <div
                      onClick={() => setSelectedBillingCycle("MONTHLY")}
                      className={`p-3.5 rounded-2xl border cursor-pointer transition-all ${
                        selectedBillingCycle === "MONTHLY"
                          ? "border-indigo-600 bg-indigo-50 dark:bg-indigo-950/60 ring-2 ring-indigo-500"
                          : "border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 hover:border-slate-300"
                      }`}
                    >
                      <div className="font-extrabold text-xs text-slate-900 dark:text-white flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5 text-indigo-500" />
                        <span>الاشتراك الشهري للمصانع</span>
                      </div>
                      <div className="text-sm text-indigo-600 dark:text-indigo-400 font-black my-1">
                        $300 دولار / شهر
                      </div>
                      <ul className="text-[10px] text-slate-500 dark:text-slate-400 space-y-1">
                        <li>• تجديد شهري ميسر للمصانع</li>
                        <li>• جميع مزايا المنصة وكتالوج المنتجات</li>
                        <li>• إدارة أسطول السائقين والمبيعات</li>
                      </ul>
                    </div>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-extrabold text-xs shadow-lg transition-all flex items-center justify-center gap-2 mt-4"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>{isSubmitting ? "جاري تسجيل المصنع..." : "تقديم طلب انضمام المصنع بالباقة المختارة"}</span>
                </button>
              </form>
            )}
          </div>
        </div>

        {/* FORGOT PASSWORD MODAL */}
        {isForgotPasswordOpen && (
          <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 dir-rtl">
            <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-4 animate-in fade-in zoom-in duration-150">
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
                <div className="flex items-center gap-2.5 text-indigo-600 dark:text-indigo-400">
                  <KeyRound className="w-5 h-5" />
                  <h3 className="font-extrabold text-slate-900 dark:text-white text-sm">
                    استعادة كلمة المرور (حساب المصنع)
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={() => setIsForgotPasswordOpen(false)}
                  className="p-1 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {forgotError && (
                <div className="p-3 rounded-2xl bg-rose-50 dark:bg-rose-950/80 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 text-xs font-bold flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 shrink-0 text-rose-600" />
                  <span>{forgotError}</span>
                </div>
              )}

              {forgotSuccess && (
                <div className="p-3 rounded-2xl bg-emerald-50 dark:bg-emerald-950/80 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 text-xs font-bold flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
                  <span>{forgotSuccess}</span>
                </div>
              )}

              {forgotStep === 1 ? (
                <form onSubmit={handleForgotSendOtp} className="space-y-4 text-xs">
                  <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                    أدخل اسم المصنع أو البريد الإلكتروني أو رقم الهاتف المسجل لحسابك لتلقي رمز التحقق OTP.
                  </p>

                  <div className="space-y-1.5">
                    <label className="font-extrabold text-slate-700 dark:text-slate-300 block">
                      اسم المستخدم / البريد الإلكتروني / رقم الهاتف *
                    </label>
                    <div className="relative">
                      <User className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-indigo-500" />
                      <input
                        type="text"
                        required
                        value={forgotIdentifier}
                        onChange={(e) => setForgotIdentifier(e.target.value)}
                        placeholder="factory@emdad.ye أو 771234567 أو اسم المصنع"
                        className="w-full pr-10 pl-3 py-3 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-bold focus:ring-2 focus:ring-indigo-500"
                      />
                    </div>
                  </div>

                  <div className="pt-2 flex items-center justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => setIsForgotPasswordOpen(false)}
                      className="px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold"
                    >
                      إلغاء
                    </button>
                    <button
                      type="submit"
                      disabled={isForgotLoading}
                      className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold shadow-md flex items-center gap-1.5 cursor-pointer"
                    >
                      {isForgotLoading ? (
                        <Clock className="w-4 h-4 animate-spin" />
                      ) : (
                        <Send className="w-4 h-4" />
                      )}
                      <span>إرسال رمز التحقق OTP 📩</span>
                    </button>
                  </div>
                </form>
              ) : (
                <form onSubmit={handleForgotResetPassword} className="space-y-4 text-xs">
                  <div className="space-y-1.5">
                    <label className="font-extrabold text-slate-700 dark:text-slate-300 block">
                      رمز التحقق (OTP) *
                    </label>
                    <input
                      type="text"
                      required
                      value={inputOtp}
                      onChange={(e) => setInputOtp(e.target.value)}
                      placeholder="أدخل الرمز المكون من 4 أرقام"
                      className="w-full px-3 py-2.5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-mono font-bold text-center text-sm tracking-widest focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="font-extrabold text-slate-700 dark:text-slate-300 block">
                      كلمة المرور الجديدة *
                    </label>
                    <div className="relative">
                      <Lock className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <input
                        type="password"
                        required
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        placeholder="••••••••"
                        className="w-full pr-10 pl-3 py-2.5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-bold focus:ring-2 focus:ring-indigo-500"
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="font-extrabold text-slate-700 dark:text-slate-300 block">
                      تأكيد كلمة المرور الجديدة *
                    </label>
                    <div className="relative">
                      <Lock className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <input
                        type="password"
                        required
                        value={confirmNewPassword}
                        onChange={(e) => setConfirmNewPassword(e.target.value)}
                        placeholder="••••••••"
                        className="w-full pr-10 pl-3 py-2.5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-bold focus:ring-2 focus:ring-indigo-500"
                      />
                    </div>
                  </div>

                  <div className="pt-2 flex items-center justify-between border-t border-slate-100 dark:border-slate-800">
                    <button
                      type="button"
                      onClick={() => setForgotStep(1)}
                      className="text-xs font-bold text-indigo-600 hover:underline"
                    >
                      ← تغيير المعرف
                    </button>
                    <button
                      type="submit"
                      disabled={isForgotLoading}
                      className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold shadow-md flex items-center gap-1.5 cursor-pointer"
                    >
                      {isForgotLoading ? (
                        <Clock className="w-4 h-4 animate-spin" />
                      ) : (
                        <KeyRound className="w-4 h-4" />
                      )}
                      <span>تأكيد وتغيير كلمة المرور 🔐</span>
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
