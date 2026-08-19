import React, { useState } from "react";
import { storeService } from "../../services/storeService";
import { MerchantAccount, SubscriptionTier, BillingCycle } from "../../types";
import { PlatformInfoBox, CustomerServiceButton } from "../PlatformInfoBox";
import {
  Store,
  Lock,
  Mail,
  User,
  Phone,
  FileText,
  MapPin,
  Building2,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Sparkles,
  ShieldCheck,
  Zap,
  Crown,
  Calendar,
  ArrowLeft,
  Eye,
  EyeOff,
  LogOut,
  MessageCircle,
  Headphones,
  HelpCircle,
  BadgePercent,
  Layers,
  ChevronRight,
  Send,
  KeyRound,
  X,
} from "lucide-react";

interface Props {
  currentAccount: MerchantAccount | null;
  onAuthenticated: (account: MerchantAccount) => void;
  onLogout: () => void;
}

export const MerchantAuth: React.FC<Props> = ({
  currentAccount,
  onAuthenticated,
  onLogout,
}) => {
  const [authMode, setAuthMode] = useState<"LOGIN" | "REGISTER">("LOGIN");

  // Login Form State
  const [loginIdentifier, setLoginIdentifier] = useState("merchant_saba");
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
      setForgotError("يرجى إدخال اسم المستخدم أو البريد الإلكتروني أو رقم الهاتف المسجل.");
      return;
    }

    setIsForgotLoading(true);
    setTimeout(() => {
      const accounts = storeService.getMerchantAccounts();
      const cleanId = forgotIdentifier.trim().toLowerCase();
      const cleanDigits = forgotIdentifier.replace(/\D/g, "");

      const found = accounts.find(
        (a) =>
          (a.email && a.email.trim().toLowerCase() === cleanId) ||
          (a.username && a.username.trim().toLowerCase() === cleanId) ||
          (a.phone && (a.phone.trim() === forgotIdentifier.trim() || (cleanDigits && a.phone.replace(/\D/g, "") === cleanDigits))) ||
          (a.ownerName && a.ownerName.trim().toLowerCase() === cleanId) ||
          (a.storeName && a.storeName.trim().toLowerCase() === cleanId)
      );

      setIsForgotLoading(false);

      if (!found) {
        setForgotError("عذراً، لم نتمكن من العثور على حساب تاجر بهذا المعرف (اسم المستخدم/البريد/رقم الهاتف).");
        return;
      }

      const otp = Math.floor(1000 + Math.random() * 9000).toString();
      setGeneratedOtp(otp);
      setInputOtp(otp);
      setForgotStep(2);
      setForgotSuccess(`تم العثور على حساب: (${found.storeName || found.ownerName}). تم إرسال رمز التحقق OTP. الرمز للاختبار: ${otp}`);
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
      const res = storeService.resetMerchantPassword(forgotIdentifier, newPassword);
      setIsForgotLoading(false);

      if (res.success) {
        setIsForgotPasswordOpen(false);
        setLoginIdentifier(forgotIdentifier);
        setPassword(newPassword);
        setLoginSuccessMsg("🎉 تم إعادة تعيين كلمة المرور بنجاح! يمكنك الآن تسجيل الدخول بكلمة المرور الجديدة.");
        setTimeout(() => setLoginSuccessMsg(""), 7000);
      } else {
        setForgotError(res.error || "تعذر إعادة تعيين كلمة المرور.");
      }
    }, 400);
  };

  // Register Form State
  const [regUsername, setRegUsername] = useState("");
  const [regPhone, setRegPhone] = useState("");
  const [regEmail, setRegEmail] = useState(""); // OPTIONAL
  const [regStoreName, setRegStoreName] = useState("");
  const [regOwnerName, setRegOwnerName] = useState("");
  const [regCommercialReg, setRegCommercialReg] = useState("");
  const [regCity, setRegCity] = useState("صنعاء");
  const [regDistrict, setRegDistrict] = useState("حي حدة");
  const [regFullAddress, setRegFullAddress] = useState("");
  const [regPassword, setRegPassword] = useState("");
  const [selectedTier, setSelectedTier] = useState<SubscriptionTier>("PROFESSIONAL");
  const [selectedBillingCycle, setSelectedBillingCycle] = useState<BillingCycle>("YEARLY");
  const [regSuccessMessage, setRegSuccessMessage] = useState("");

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError("");
    setIsSubmitting(true);

    setTimeout(() => {
      const res = storeService.loginMerchant(loginIdentifier, password);
      setIsSubmitting(false);
      if (res.success && res.account) {
        onAuthenticated(res.account);
      } else {
        setLoginError(res.error || "خطأ في تسجيل الدخول. يرجى التأكد من اسم المستخدم / رقم الهاتف وكلمة المرور.");
      }
    }, 400);
  };

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError("");

    if (!regUsername || !regPhone || !regStoreName || !regOwnerName) {
      setLoginError("يرجى ملء جميع الحقول الأساسية: اسم المستخدم، رقم الهاتف، اسم المتجر، واسم التاجر");
      return;
    }

    setIsSubmitting(true);

    setTimeout(() => {
      const newAcc = storeService.registerMerchantAccount({
        username: regUsername.trim(),
        phone: regPhone.trim(),
        email: regEmail.trim(), // Optional!
        password: regPassword || "123",
        storeName: regStoreName.trim(),
        ownerName: regOwnerName.trim(),
        commercialReg: regCommercialReg.trim() || "1010998877",
        city: regCity,
        district: regDistrict,
        fullAddress: regFullAddress || `حي ${regDistrict}، ${regCity}`,
        createdSource: "SELF_REGISTER",
        selectedTier,
        selectedBillingCycle,
      });

      setIsSubmitting(false);
      setRegSuccessMessage("تم إنشاء وتوجيه طلب حساب التاجر بنجاح!");
      onAuthenticated(newAcc);
    }, 500);
  };

  const handleQuickDemoLogin = (demoIdentifier: string) => {
    setLoginIdentifier(demoIdentifier);
    setPassword("123");
    const res = storeService.loginMerchant(demoIdentifier, "123");
    if (res.success && res.account) {
      onAuthenticated(res.account);
    }
  };

  // IF CURRENTLY LOGGED IN, CHECK APPROVAL STATUS
  if (currentAccount) {
    // 1. PENDING APPROVAL SCREEN (صفحة الانتظار للموافقة من إدارة المنصة)
    if (currentAccount.approvalStatus === "PENDING") {
      return (
        <div className="min-h-[80vh] flex items-center justify-center p-4 dir-rtl">
          <div className="max-w-2xl w-full bg-white dark:bg-slate-900 rounded-3xl border border-amber-300 dark:border-amber-800 shadow-2xl p-6 sm:p-10 space-y-8 relative overflow-hidden">
            {/* Top Glowing Amber Gradient Bar */}
            <div className="absolute top-0 right-0 left-0 h-3 bg-gradient-to-r from-amber-400 via-amber-500 to-amber-600" />

            <div className="text-center space-y-4 pt-2">
              <div className="w-20 h-20 mx-auto rounded-3xl bg-amber-100 dark:bg-amber-950/80 border border-amber-300 dark:border-amber-700 flex items-center justify-center text-amber-600 dark:text-amber-400 shadow-inner">
                <Clock className="w-10 h-10 animate-pulse" />
              </div>

              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 font-extrabold text-xs border border-amber-300 dark:border-amber-800">
                <ShieldCheck className="w-4 h-4 text-amber-600" />
                <span>صفحة الانتظار - بانتظار موافقة واعتماد إدارة المنصة ⏳</span>
              </div>

              <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
                أهلاً بك، {currentAccount.ownerName || currentAccount.username}! 👋
              </h2>

              <p className="text-sm text-slate-600 dark:text-slate-300 max-w-lg mx-auto leading-relaxed font-medium">
                تم تسجيل طلب حساب متجرك{" "}
                <strong className="text-amber-600 dark:text-amber-400 font-bold">
                  "{currentAccount.storeName}"
                </strong>{" "}
                بنجاح. تطبيقاً للربط الموثوق والجودة، يتطلب الحساب{" "}
                <span className="underline font-black decoration-amber-500">
                  موافقة واعتماد إدارة المنصة لمرة واحدة فقط
                </span>{" "}
                قبل بدء الطلب والجملة.
              </p>
            </div>

            {/* Registered Account Summary Info Box */}
            <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 space-y-3 text-xs">
              <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-700 pb-2">
                <span className="text-slate-500 font-bold flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5 text-indigo-500" />
                  <span>اسم المستخدم:</span>
                </span>
                <span className="font-mono font-black text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950 px-2.5 py-0.5 rounded-lg border border-indigo-200 dark:border-indigo-800">
                  {currentAccount.username || currentAccount.ownerName}
                </span>
              </div>

              <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-700 pb-2">
                <span className="text-slate-500 font-bold flex items-center gap-1.5">
                  <Phone className="w-3.5 h-3.5 text-emerald-500" />
                  <span>رقم الهاتف / الواتساب:</span>
                </span>
                <span className="font-mono font-bold text-slate-800 dark:text-slate-200">
                  {currentAccount.phone}
                </span>
              </div>

              <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-700 pb-2">
                <span className="text-slate-500 font-bold flex items-center gap-1.5">
                  <Mail className="w-3.5 h-3.5 text-slate-400" />
                  <span>البريد الإلكتروني (اختياري):</span>
                </span>
                <span className="font-mono font-bold text-slate-800 dark:text-slate-200">
                  {currentAccount.email && !currentAccount.email.endsWith("@merchant.ye")
                    ? currentAccount.email
                    : "غير مدخل (اختياري) ⚪"}
                </span>
              </div>

              <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-700 pb-2">
                <span className="text-slate-500 font-bold flex items-center gap-1.5">
                  <Store className="w-3.5 h-3.5 text-amber-500" />
                  <span>اسم المتجر / المحل:</span>
                </span>
                <span className="font-bold text-slate-900 dark:text-white">
                  {currentAccount.storeName} ({currentAccount.city})
                </span>
              </div>

              <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-700 pb-2">
                <span className="text-slate-500 font-bold">طريقة إنشاء الحساب:</span>
                <span className="font-bold text-slate-800 dark:text-slate-200">
                  {currentAccount.createdSource === "FACTORY_CREATED"
                    ? "تم إنشاؤه بواسطة إدارة النظام 🏛️"
                    : "تسجيل جديد من قِبل التاجر 👤"}
                </span>
              </div>

              <div className="flex items-center justify-between pt-1">
                <span className="text-slate-500 font-bold">حالة الاعتماد الحالية:</span>
                <span className="px-3 py-1 rounded-full bg-amber-500 text-slate-950 font-black text-xs animate-pulse">
                  بانتظار موافقة إدارة المنصة ⏳
                </span>
              </div>
            </div>

            {/* Approval Progress Timeline */}
            <div className="space-y-3 bg-indigo-50/50 dark:bg-indigo-950/20 p-5 rounded-2xl border border-indigo-100 dark:border-indigo-900">
              <h4 className="font-extrabold text-xs text-indigo-900 dark:text-indigo-300 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-indigo-600" />
                <span>مراحل الموافقة وتفعيل الحساب:</span>
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-center text-[11px] font-bold">
                <div className="p-2.5 rounded-xl bg-emerald-100 text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300 border border-emerald-300">
                  1. تسجيل (اسم المستخدم + الهاتف) ✔️
                </div>
                <div className="p-2.5 rounded-xl bg-amber-400 text-slate-950 border border-amber-500 font-black animate-pulse shadow-md">
                  2. مراجعة وإقرار إدارة المنصة ⏳
                </div>
                <div className="p-2.5 rounded-xl bg-slate-200 text-slate-500 dark:bg-slate-800 dark:text-slate-400">
                  3. التفعيل والربط المباشر 🚀
                </div>
              </div>
            </div>

            {/* Actions for Wholesaler / Merchant */}
            <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
              <a
                href={`https://wa.me/967771234567?text=أهلاً%20إدارة%20إمداد،%20تم%20تسجيل%20حساب%20جديد%20باسم%20المستخدم:%20${encodeURIComponent(
                  currentAccount.username || currentAccount.ownerName
                )}%20ورقم%20الهاتف:%20${encodeURIComponent(currentAccount.phone)}%20ويرجى%20اعتماده`}
                target="_blank"
                rel="noreferrer"
                className="w-full sm:w-auto px-6 py-3.5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs shadow-lg transition-all flex items-center justify-center gap-2 hover:scale-[1.02]"
              >
                <MessageCircle className="w-4 h-4" />
                <span>مراسلة إدارة المنصة عبر الواتساب للاعتماد السريع</span>
              </a>

              <button
                onClick={onLogout}
                className="w-full sm:w-auto px-5 py-3.5 rounded-2xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold text-xs transition-all flex items-center justify-center gap-2"
              >
                <LogOut className="w-4 h-4" />
                <span>تسجيل الخروج / تبديل الحساب</span>
              </button>
            </div>
          </div>
        </div>
      );
    }

    // 2. SUSPENDED SERVICE ALERT SCREEN
    if (currentAccount.approvalStatus === "SUSPENDED") {
      return (
        <div className="min-h-[80vh] flex items-center justify-center p-4 dir-rtl">
          <div className="max-w-2xl w-full bg-white dark:bg-slate-900 rounded-3xl border-2 border-rose-500 shadow-2xl p-6 sm:p-10 space-y-8 relative overflow-hidden">
            <div className="absolute top-0 right-0 left-0 h-3 bg-gradient-to-r from-rose-600 via-red-600 to-rose-700" />

            <div className="text-center space-y-4 pt-2">
              <div className="w-20 h-20 mx-auto rounded-3xl bg-rose-100 dark:bg-rose-950/80 border-2 border-rose-400 flex items-center justify-center text-rose-600 dark:text-rose-400 shadow-inner">
                <AlertTriangle className="w-10 h-10 animate-bounce" />
              </div>

              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-rose-100 dark:bg-rose-950 text-rose-800 dark:text-rose-300 font-extrabold text-xs border border-rose-300">
                <Lock className="w-4 h-4" />
                <span>تنبيه هام من إدارة المنصة - إيقاف مؤقت للخدمة</span>
              </div>

              <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
                تم إيقاف حساب المتجر مؤقتاً ⛔
              </h2>

              <div className="p-4 rounded-2xl bg-rose-500 text-white font-extrabold text-sm sm:text-base text-center shadow-lg border border-rose-600 leading-relaxed">
                📢 يرجى التواصل بخدمة العملاء لحل المشكلة في أقرب وقت.
              </div>

              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 max-w-lg mx-auto leading-relaxed font-medium">
                عزيزنا التاجر في <strong className="text-slate-900 dark:text-white font-bold">"{currentAccount.storeName}"</strong>، تم إيقاف صلاحيات الوصول مؤقتاً لمراجعة السجلات أو الاشتراكات.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 space-y-3 text-xs">
              <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-700 pb-2">
                <span className="text-slate-500 font-bold">سبب التوقيف المحدد:</span>
                <span className="font-extrabold text-rose-600 dark:text-rose-400">
                  {currentAccount.suspensionReason || "مراجعة وتحديث مستندات السجل والتراخيص التجاري"}
                </span>
              </div>
              <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-700 pb-2">
                <span className="text-slate-500 font-bold">صاحب الحساب:</span>
                <span className="font-bold text-slate-800 dark:text-slate-200">
                  {currentAccount.ownerName} ({currentAccount.phone})
                </span>
              </div>
            </div>

            <div className="pt-2 text-center">
              <button
                onClick={onLogout}
                className="px-6 py-3 rounded-2xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold text-xs transition-all inline-flex items-center gap-2"
              >
                <LogOut className="w-4 h-4" />
                <span>تسجيل الخروج والدخول بحساب آخر</span>
              </button>
            </div>
          </div>
        </div>
      );
    }
  }

  // LOGIN / REGISTER FORM SCREEN
  return (
    <div className="min-h-screen w-full bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white dir-rtl flex flex-col justify-center items-center p-4 sm:p-8 lg:p-12 relative overflow-x-hidden">
      
      {/* Top Customer Service Bar */}
      <div className="w-full max-w-6xl flex items-center justify-between mb-6 pb-4 border-b border-slate-200 dark:border-slate-800/80">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-2xl bg-indigo-100 dark:bg-indigo-600/30 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-500/30">
            <Store className="w-6 h-6" />
          </div>
          <div>
            <h2 className="font-black text-lg text-slate-900 dark:text-white">بوابة التجار والمحلات المعتمدة</h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">منصة إمداد لشراء الجملة والربط المباشر مع المصانع</p>
          </div>
        </div>

        {/* CUSTOMER SERVICE BUTTON POPUP */}
        <CustomerServiceButton label="خدمة العملاء 🎧" />
      </div>

      {/* Main Unified Page Card - Unified Light/Dark Theme */}
      <div className="max-w-6xl w-full bg-white dark:bg-slate-900/90 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xl p-6 sm:p-10 lg:p-12 grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
        
        {/* Left Side: Information & Highlights */}
        <div className="lg:col-span-5 space-y-6 text-right">
          <div className="inline-flex items-center px-4 py-1.5 rounded-full bg-indigo-50 dark:bg-indigo-500/20 border border-indigo-200 dark:border-indigo-400/30 text-indigo-700 dark:text-amber-300 font-black text-xs">
            <span>منظومة إمداد للجملة 🏪</span>
          </div>

          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-slate-900 dark:text-white leading-tight">
            تسجيل حساب متجر تجاري معتمد
          </h1>

          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed font-medium">
            احصل على أسعار الجملة المباشرة من كافة المصانع الوطنية المسجلة، واطلب شحنات الجملة بأسعار التكلفة المصنعية مع توثيق الفواتير الضريبية وتتبع الشحنات الميدانية.
          </p>

          <div className="space-y-3.5 pt-2 text-xs font-bold text-slate-700 dark:text-slate-200">
            <div className="flex items-center gap-3">
              <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 dark:bg-emerald-400 shrink-0" />
              <span>تسجيل وسجل حساب فوري باسم المستخدم ورقم الهاتف</span>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-2.5 h-2.5 rounded-full bg-amber-500 dark:bg-amber-400 shrink-0" />
              <span>توثيق رسمي واعتماد فواتير الشراء الضريبية</span>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-2.5 h-2.5 rounded-full bg-indigo-500 dark:bg-indigo-400 shrink-0" />
              <span>أسعار مصانع مباشرة وتغطية كاملة للمحافظات</span>
            </div>
          </div>
        </div>

        {/* Right Side: Form Panel */}
        <div className="lg:col-span-7 bg-slate-50 dark:bg-slate-950/80 p-6 sm:p-8 rounded-2xl border border-slate-200 dark:border-slate-800/80 space-y-6">
          
          {/* Mode Selector Tabs */}
          <div className="bg-slate-200/80 dark:bg-slate-900 p-1.5 rounded-2xl flex items-center border border-slate-300 dark:border-slate-800">
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
              <Lock className="w-4 h-4 text-amber-500 dark:text-amber-300" />
              <span>تسجيل الدخول لمتجرك</span>
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
              <Building2 className="w-4 h-4 text-emerald-500 dark:text-emerald-300" />
              <span>إنشاء حساب متجر جديد</span>
            </button>
          </div>

            {/* Global Error Banner */}
            {loginError && (
              <div className="p-3.5 rounded-2xl bg-rose-50 dark:bg-rose-950/80 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 text-xs font-bold flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0 text-rose-600" />
                <span>{loginError}</span>
              </div>
            )}

            {/* Registration Success Banner */}
            {regSuccessMessage && (
              <div className="p-3.5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/80 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 text-xs font-bold flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
                <span>{regSuccessMessage}</span>
              </div>
            )}

            {/* 1. LOGIN FORM */}
            {authMode === "LOGIN" && (
              <form onSubmit={handleLogin} className="space-y-4">
                {loginSuccessMsg && (
                  <div className="p-3.5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/80 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 text-xs font-bold flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>{loginSuccessMsg}</span>
                  </div>
                )}

                <div className="space-y-1.5">
                  <label className="text-xs font-extrabold text-slate-700 dark:text-slate-300 block">
                    اسم المستخدم / البريد الإلكتروني / رقم الهاتف
                  </label>
                  <div className="relative">
                    <User className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-indigo-500" />
                    <input
                      type="text"
                      required
                      value={loginIdentifier}
                      onChange={(e) => setLoginIdentifier(e.target.value)}
                      placeholder="أدخل اسم المستخدم (merchant_saba) أو رقم الهاتف (771234567) أو البريد"
                      className="w-full pr-10 pl-3 py-3 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 font-bold"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-extrabold text-slate-700 dark:text-slate-300 block">
                      كلمة المرور
                    </label>
                    <button
                      type="button"
                      onClick={() => {
                        setIsForgotPasswordOpen(true);
                        setForgotStep(1);
                        setForgotIdentifier(loginIdentifier);
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
                    <Lock className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                      type={showPassword ? "text" : "password"}
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full pr-10 pl-10 py-3 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-3.5 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-xs sm:text-sm shadow-lg transition-all flex items-center justify-center gap-2 hover:scale-[1.01]"
                >
                  {isSubmitting ? (
                    <Clock className="w-4 h-4 animate-spin" />
                  ) : (
                    <Send className="w-4 h-4" />
                  )}
                  <span>تسجيل الدخول إلى حساب التاجر</span>
                </button>
              </form>
            )}

            {/* 2. REGISTER FORM */}
            {authMode === "REGISTER" && (
              <form onSubmit={handleRegister} className="space-y-4">

                {/* Main Required Inputs: Username + Phone */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-[11px] font-extrabold text-slate-800 dark:text-slate-200 flex items-center gap-1">
                      <User className="w-3.5 h-3.5 text-indigo-600" />
                      <span>اسم المستخدم (مطلوب) *</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={regUsername}
                      onChange={(e) => setRegUsername(e.target.value)}
                      placeholder="مثال: merchant_saba"
                      className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 text-xs text-slate-900 dark:text-white font-bold"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[11px] font-extrabold text-slate-800 dark:text-slate-200 flex items-center gap-1">
                      <Phone className="w-3.5 h-3.5 text-emerald-600" />
                      <span>رقم الهاتف / الواتساب (مطلوب) *</span>
                    </label>
                    <input
                      type="tel"
                      required
                      value={regPhone}
                      onChange={(e) => setRegPhone(e.target.value)}
                      placeholder="مثال: 771234567"
                      className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 text-xs text-slate-900 dark:text-white font-bold font-mono"
                    />
                  </div>
                </div>

                {/* Email (Optional) */}
                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1">
                      <Mail className="w-3.5 h-3.5 text-slate-400" />
                      <span>البريد الإلكتروني</span>
                    </label>
                    <span className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-500 text-[10px] font-black">
                      اختياري ⚪
                    </span>
                  </div>
                  <input
                    type="email"
                    value={regEmail}
                    onChange={(e) => setRegEmail(e.target.value)}
                    placeholder="example@store.ye (يمكن تركه فارغاً)"
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 text-xs text-slate-900 dark:text-white font-medium"
                  />
                </div>

                {/* Store Name + Owner Name */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300 block">
                      اسم المتجر / المحل التجاري *
                    </label>
                    <input
                      type="text"
                      required
                      value={regStoreName}
                      onChange={(e) => setRegStoreName(e.target.value)}
                      placeholder="أسواق سبأ المركزية للجملة"
                      className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 text-xs text-slate-900 dark:text-white"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300 block">
                      اسم صاحب المحل / التاجر *
                    </label>
                    <input
                      type="text"
                      required
                      value={regOwnerName}
                      onChange={(e) => setRegOwnerName(e.target.value)}
                      placeholder="عبد الله السلمان"
                      className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 text-xs text-slate-900 dark:text-white"
                    />
                  </div>
                </div>

                {/* Password + Commercial Reg */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300 block">
                      كلمة المرور للحساب
                    </label>
                    <input
                      type="password"
                      value={regPassword}
                      onChange={(e) => setRegPassword(e.target.value)}
                      placeholder="•••••••• (افتراضي: 123)"
                      className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 text-xs text-slate-900 dark:text-white"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300 block">
                      السجل التجاري (إن وجد)
                    </label>
                    <input
                      type="text"
                      value={regCommercialReg}
                      onChange={(e) => setRegCommercialReg(e.target.value)}
                      placeholder="1010998877 (اختياري)"
                      className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 text-xs font-mono text-slate-900 dark:text-white"
                    />
                  </div>
                </div>

                {/* City & District */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300 block">
                      المدينة
                    </label>
                    <select
                      value={regCity}
                      onChange={(e) => setRegCity(e.target.value)}
                      className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 text-xs text-slate-900 dark:text-white"
                    >
                      <option value="صنعاء">صنعاء</option>
                      <option value="عدن">عدن</option>
                      <option value="تعز">تعز</option>
                      <option value="الحديدة">الحديدة</option>
                      <option value="المكلا">المكلا</option>
                      <option value="إب">إب</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300 block">
                      الحي / المنطقة
                    </label>
                    <input
                      type="text"
                      value={regDistrict}
                      onChange={(e) => setRegDistrict(e.target.value)}
                      placeholder="حي حدة"
                      className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 text-xs text-slate-900 dark:text-white"
                    />
                  </div>
                </div>

                {/* Subscription Options Selection */}
                <div className="space-y-2.5 pt-1">
                  <div className="border-t border-slate-200 dark:border-slate-800 pt-3">
                    <label className="text-[11px] font-black text-slate-800 dark:text-slate-200 flex items-center gap-1.5 mb-2">
                      <Crown className="w-4 h-4 text-amber-500" />
                      <span>اختر نظام رسم الاشتراك الموحد للتجار:</span>
                    </label>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {/* Yearly Subscription */}
                      <div
                        onClick={() => setSelectedBillingCycle("YEARLY")}
                        className={`p-3.5 rounded-2xl border text-right cursor-pointer transition-all space-y-1.5 relative ${
                          selectedBillingCycle === "YEARLY"
                            ? "border-amber-500 bg-amber-50 dark:bg-amber-950/60 ring-2 ring-amber-500"
                            : "border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800"
                        }`}
                      >
                        <span className="absolute -top-2 left-2 px-2 py-0.5 rounded-full bg-amber-500 text-slate-950 text-[9px] font-black shadow-xs">
                          توفير 10,000 ر.ي ⭐
                        </span>
                        <div className="font-extrabold text-xs text-slate-900 dark:text-white flex items-center gap-1.5">
                          <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                          <span>الاشتراك السنوي للتجار</span>
                        </div>
                        <div className="text-sm text-amber-600 dark:text-amber-400 font-black">
                          50,000 ريال يمني / سنة
                        </div>
                        <p className="text-[10px] text-slate-500 font-medium">
                          صلاحية 365 يوماً كاملة بجميع المزايا
                        </p>
                      </div>

                      {/* Monthly Subscription */}
                      <div
                        onClick={() => setSelectedBillingCycle("MONTHLY")}
                        className={`p-3.5 rounded-2xl border text-right cursor-pointer transition-all space-y-1.5 ${
                          selectedBillingCycle === "MONTHLY"
                            ? "border-indigo-600 bg-indigo-50 dark:bg-indigo-950/60 ring-2 ring-indigo-500"
                            : "border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800"
                        }`}
                      >
                        <div className="font-extrabold text-xs text-slate-900 dark:text-white flex items-center gap-1.5">
                          <Calendar className="w-3.5 h-3.5 text-indigo-500" />
                          <span>الاشتراك الشهري للتجار</span>
                        </div>
                        <div className="text-sm text-indigo-600 dark:text-indigo-400 font-black">
                          5,000 ريال يمني / شهر
                        </div>
                        <p className="text-[10px] text-slate-500 font-medium">
                          تجديد شهري ميسر بكافة الصلاحيات
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-[11px] text-amber-800 dark:text-amber-300 font-bold flex items-center gap-2">
                  <Clock className="w-4 h-4 shrink-0 text-amber-600 animate-pulse" />
                  <span>
                    بعد الضغط على تسجيل، ستظهر لك مباشرة صفحة الانتظار لحين موافقة وإقرار إدارة المنصة للحساب.
                  </span>
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-3.5 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-xs sm:text-sm shadow-lg transition-all flex items-center justify-center gap-2"
                >
                  {isSubmitting ? (
                    <Clock className="w-4 h-4 animate-spin" />
                  ) : (
                    <Building2 className="w-4 h-4 text-amber-300" />
                  )}
                  <span>إنشاء الحساب (والانتقال لصفحة انتظار موافقة المنصة)</span>
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
                    استعادة كلمة المرور (حساب التاجر)
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
                    أدخل اسم المستخدم، البريد الإلكتروني، أو رقم الهاتف المسجل لحساب التاجر لإرسال رمز التحقق OTP.
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
                        placeholder="merchant_saba أو 771234567 أو info@store.ye"
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
    );
  };
