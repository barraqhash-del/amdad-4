import React, { useState } from "react";
import { DriverAccount } from "../../types";
import { storeService } from "../../services/storeService";
import { PlatformInfoBox, CustomerServiceButton } from "../PlatformInfoBox";
import {
  Truck,
  KeyRound,
  ShieldCheck,
  AlertCircle,
  Lock,
  UserCheck,
  Building2,
  Phone,
  Sparkles,
  Mail,
  Clock,
  CheckCircle2,
  RefreshCw,
  LogOut,
  User,
  Send,
  FileText,
  Eye,
  EyeOff,
  Ban,
  AlertTriangle,
  Search,
  X,
} from "lucide-react";

interface Props {
  currentAccount: DriverAccount | null;
  onAuthenticated: (account: DriverAccount) => void;
  onLogout: () => void;
}

export const DriverAuth: React.FC<Props> = ({
  currentAccount,
  onAuthenticated,
  onLogout,
}) => {
  const [authMode, setAuthMode] = useState<"LOGIN" | "REGISTER">("LOGIN");

  // Login Form State
  const [loginQuery, setLoginQuery] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [loginSuccessMsg, setLoginSuccessMsg] = useState("");
  const [isLoading, setIsLoading] = useState(false);

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
      setForgotError("يرجى إدخال اسم المستخدم أو رقم الهاتف أو البريد الإلكتروني الخاص بالسائق.");
      return;
    }

    setIsForgotLoading(true);
    setTimeout(() => {
      const accounts = storeService.getDriverAccounts();
      const cleanId = forgotIdentifier.trim().toLowerCase();
      const cleanDigits = forgotIdentifier.replace(/\D/g, "");

      const found = accounts.find(
        (a) =>
          (a.username && a.username.trim().toLowerCase() === cleanId) ||
          (a.email && a.email.trim().toLowerCase() === cleanId) ||
          (a.phone && (a.phone.trim() === forgotIdentifier.trim() || (cleanDigits && a.phone.replace(/\D/g, "") === cleanDigits))) ||
          (a.driverName && a.driverName.trim().toLowerCase() === cleanId)
      );

      setIsForgotLoading(false);

      if (!found) {
        setForgotError("عذراً، لم نتمكن من العثور على حساب سائق بهذا المعرف (اسم المستخدم/الهاتف/البريد).");
        return;
      }

      const otp = Math.floor(1000 + Math.random() * 9000).toString();
      setGeneratedOtp(otp);
      setInputOtp(otp);
      setForgotStep(2);
      setForgotSuccess(`تم العثور على حساب: (${found.driverName || found.username}). تم إرسال رمز التحقق OTP. الرمز للاختبار: ${otp}`);
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
      const res = storeService.resetDriverPassword(forgotIdentifier, newPassword);
      setIsForgotLoading(false);

      if (res.success) {
        setIsForgotPasswordOpen(false);
        setLoginQuery(forgotIdentifier);
        setLoginPassword(newPassword);
        setLoginSuccessMsg("🎉 تم إعادة تعيين كلمة المرور بنجاح! يمكنك الآن تسجيل الدخول بكلمة المرور الجديدة.");
        setTimeout(() => setLoginSuccessMsg(""), 7000);
      } else {
        setForgotError(res.error || "تعذر إعادة تعيين كلمة المرور.");
      }
    }, 400);
  };

  // Registration Form State
  const factories = storeService.getFactories();
  const [regFactoryId, setRegFactoryId] = useState(() => factories[0]?.id || "fac-1");
  const [factorySearchQuery, setFactorySearchQuery] = useState("");
  const [isFactorySearchOpen, setIsFactorySearchOpen] = useState(false);

  const selectedFactory = factories.find((f) => f.id === regFactoryId) || factories[0];

  const filteredFactories = factorySearchQuery.trim()
    ? factories.filter(
        (f) =>
          f.name.toLowerCase().includes(factorySearchQuery.toLowerCase()) ||
          (f.city && f.city.toLowerCase().includes(factorySearchQuery.toLowerCase()))
      )
    : [];
  const [regUsername, setRegUsername] = useState("");
  const [regPhone, setRegPhone] = useState("");
  const [regEmail, setRegEmail] = useState(""); // OPTIONAL
  const [regDriverName, setRegDriverName] = useState("");
  const [regVehicleNo, setRegVehicleNo] = useState("");
  const [regVehicleType, setRegVehicleType] = useState("دينا 5 طن مبردة");
  const [regPassword, setRegPassword] = useState("");

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!loginQuery.trim() || !loginPassword.trim()) {
      setErrorMessage("يرجى إدخال اسم المستخدم أو رقم الهاتف وكلمة المرور.");
      return;
    }

    setIsLoading(true);
    setTimeout(() => {
      const res = storeService.loginDriver(loginQuery, loginPassword);
      setIsLoading(false);

      if (res.success && res.account) {
        onAuthenticated(res.account);
      } else {
        setErrorMessage(res.error || "خطأ في تسجيل الدخول. تأكد من البيانات وإقرار المصنع.");
      }
    }, 400);
  };

  const handleRegisterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!regUsername.trim() || !regPhone.trim()) {
      setErrorMessage("يرجى ملء الحقول الأساسية المطلوبة: اسم المستخدم ورقم الهاتف.");
      return;
    }

    const selectedFactory = factories.find((f) => f.id === regFactoryId) || factories[0];

    setIsLoading(true);

    setTimeout(() => {
      try {
        const newAcc = storeService.registerDriverAccount({
          username: regUsername.trim(),
          phone: regPhone.trim(),
          email: regEmail.trim(), // Optional
          driverName: regDriverName.trim() || regUsername.trim(),
          vehicleNo: regVehicleNo.trim() || "ط ك ل 9911",
          vehicleType: regVehicleType.trim() || "شاحنة توصيل 5 طن",
          password: regPassword.trim() || "123",
          factoryId: selectedFactory?.id || "fac-1",
          factoryName: selectedFactory?.name || "مصنع البركة للأغذية والمواشي",
          createdSource: "SELF_REGISTER",
        });

        setIsLoading(false);
        onAuthenticated(newAcc);
      } catch (err: any) {
        setIsLoading(false);
        setErrorMessage(err.message || "حدث خطأ أثناء إنشاء حساب السائق");
      }
    }, 500);
  };

  const handleQuickDemoLogin = (user: string, pass: string) => {
    setLoginQuery(user);
    setLoginPassword(pass);
    setErrorMessage(null);
    const res = storeService.loginDriver(user, pass);
    if (res.success && res.account) {
      onAuthenticated(res.account);
    }
  };

  const handleSimulateFactoryApproval = () => {
    if (currentAccount) {
      storeService.approveDriverAccount(currentAccount.id);
      const updated = storeService.getCurrentDriverSession();
      if (updated) {
        onAuthenticated(updated);
      }
    }
  };

  // ================= 1. PENDING APPROVAL WAITING SCREEN =================
  if (currentAccount && currentAccount.approvalStatus === "PENDING") {
    return (
      <div className="min-h-[80vh] flex items-center justify-center p-4 dir-rtl">
        <div className="max-w-2xl w-full bg-white dark:bg-slate-900 rounded-3xl border border-amber-300 dark:border-amber-800 shadow-2xl p-6 sm:p-10 space-y-8 relative overflow-hidden">
          {/* Top Glowing Amber Bar */}
          <div className="absolute top-0 right-0 left-0 h-3 bg-gradient-to-r from-amber-400 via-amber-500 to-amber-600" />

          {/* Header Banner */}
          <div className="text-center space-y-4 pt-2">
            <div className="w-20 h-20 mx-auto rounded-3xl bg-amber-100 dark:bg-amber-950/80 border border-amber-300 dark:border-amber-700 flex items-center justify-center text-amber-600 dark:text-amber-400 shadow-inner">
              <Clock className="w-10 h-10 animate-pulse" />
            </div>

            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 font-extrabold text-xs border border-amber-300 dark:border-amber-800">
              <span className="w-2 h-2 rounded-full bg-amber-500 animate-ping" />
              <span>صفحة الانتظار - بانتظار موافقة وإقرار المصنع ⏳</span>
            </div>

            <div>
              <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                أهلاً بك يا كابتن / {currentAccount.driverName || currentAccount.username} 👋
              </h2>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 max-w-lg mx-auto mt-2 leading-relaxed">
                تم استلام طلب تسجيل حساب السائق الخاص بك بنجاح. حسابك الآن في مرحلة المراجعة لدى مسؤول حركة الأسطول في{" "}
                <strong className="text-indigo-600 dark:text-indigo-400 font-bold">
                  {currentAccount.factoryName || "المصنع التابع له"}
                </strong>
                .
              </p>
            </div>
          </div>

          {/* Account Details Summary Box */}
          <div className="bg-slate-50 dark:bg-slate-800/80 rounded-2xl p-5 border border-slate-200 dark:border-slate-700 space-y-3 text-xs">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-700">
              <span className="font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                <Truck className="w-4 h-4 text-indigo-600" />
                <span>بيانات حساب السائق المسجلة:</span>
              </span>
              <span className="px-2.5 py-1 rounded-lg bg-amber-500/10 text-amber-700 dark:text-amber-300 font-bold border border-amber-300/30">
                قيد الموافقة ⏳
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-slate-700 dark:text-slate-300 font-medium">
              <div>
                <span className="text-slate-400 block text-[11px]">اسم المستخدم:</span>
                <span className="font-bold text-slate-900 dark:text-white dir-ltr text-right inline-block">
                  @{currentAccount.username}
                </span>
              </div>

              <div>
                <span className="text-slate-400 block text-[11px]">رقم الهاتف / الجوال:</span>
                <span className="font-bold text-slate-900 dark:text-white dir-ltr text-right inline-block">
                  {currentAccount.phone}
                </span>
              </div>

              <div>
                <span className="text-slate-400 block text-[11px]">البريد الإلكتروني (اختياري):</span>
                <span className="font-bold text-slate-900 dark:text-white">
                  {currentAccount.email ? (
                    <span className="dir-ltr text-right inline-block">{currentAccount.email}</span>
                  ) : (
                    <span className="text-slate-400 font-normal">غير مدخل (اختياري ⚪)</span>
                  )}
                </span>
              </div>

              <div>
                <span className="text-slate-400 block text-[11px]">تفاصيل المركبة:</span>
                <span className="font-bold text-slate-900 dark:text-white">
                  {currentAccount.vehicleType} ({currentAccount.vehicleNo})
                </span>
              </div>

              <div className="sm:col-span-2 pt-2 border-t border-slate-200/60 dark:border-slate-700/60">
                <span className="text-slate-400 block text-[11px]">المصنع التابع له:</span>
                <span className="font-bold text-indigo-600 dark:text-indigo-400">
                  {currentAccount.factoryName}
                </span>
              </div>
            </div>
          </div>

          {/* Workflow Timeline Steps */}
          <div className="space-y-3">
            <h4 className="text-xs font-extrabold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
              <FileText className="w-4 h-4 text-amber-500" />
              <span>خطوات اعتماد تفعيل حساب السائق:</span>
            </h4>

            <div className="space-y-2 text-xs">
              <div className="flex items-center gap-3 p-3 rounded-2xl bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 font-bold">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                <span>1. إنشاء حساب السائق وتعبئة اسم المستخدم والهاتف (تم بنجاح ✔️)</span>
              </div>

              <div className="flex items-center gap-3 p-3 rounded-2xl bg-amber-50 dark:bg-amber-950/60 border border-amber-300 dark:border-amber-800 text-amber-900 dark:text-amber-200 font-bold">
                <Clock className="w-5 h-5 text-amber-600 animate-spin shrink-0" />
                <span>2. مراجعة ورط الشاحنة بواسطة مسؤول حركة المصنع (جاري الآن ⏳)</span>
              </div>

              <div className="flex items-center gap-3 p-3 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-400 font-medium">
                <Truck className="w-5 h-5 shrink-0" />
                <span>3. الدخول التلقائي لتطبيق الشحن واستلام طلبيات الجملة للتوصيل 🚚</span>
              </div>
            </div>
          </div>

          {/* Interactive Demo Action Bar */}
          <div className="pt-4 border-t border-slate-200 dark:border-slate-800 space-y-3">
            <div className="p-3 rounded-2xl bg-amber-50/80 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-xs text-amber-800 dark:text-amber-300 flex items-center gap-2 font-bold">
              <Sparkles className="w-4 h-4 text-amber-600 shrink-0" />
              <span>زر المعاينة السريعة لاختبار تجربة السائق المعتمد مباشرة:</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <button
                type="button"
                onClick={handleSimulateFactoryApproval}
                className="w-full py-3 px-4 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-black shadow-lg transition-all flex items-center justify-center gap-2"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>محاكاة موافقة المصنع الآن ⚡</span>
              </button>

              <a
                href={`https://wa.me/967771122334?text=${encodeURIComponent(
                  `السلام عليكم مسؤول حركة المصنع، يرجى تفعيل حساب السائق الخاص بي: اسم المستخدم (${currentAccount.username}) - جوال (${currentAccount.phone})`
                )}`}
                target="_blank"
                rel="noreferrer"
                className="w-full py-3 px-4 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-white text-xs font-black shadow-lg transition-all flex items-center justify-center gap-2"
              >
                <Send className="w-4 h-4" />
                <span>مراسلة المصنع بالواتساب للاعتماد 💬</span>
              </a>
            </div>

            <button
              type="button"
              onClick={onLogout}
              className="w-full py-2.5 rounded-2xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-extrabold transition-colors flex items-center justify-center gap-2"
            >
              <LogOut className="w-4 h-4" />
              <span>تسجيل الخروج / تبديل الحساب</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ================= 1.5. SUSPENDED ACCOUNT SCREEN =================
  if (currentAccount && currentAccount.approvalStatus === "SUSPENDED") {
    return (
      <div className="min-h-[80vh] flex items-center justify-center p-4 dir-rtl">
        <div className="max-w-2xl w-full bg-white dark:bg-slate-900 rounded-3xl border border-rose-300 dark:border-rose-800 shadow-2xl p-6 sm:p-10 space-y-8 relative overflow-hidden">
          {/* Top Glowing Rose Bar */}
          <div className="absolute top-0 right-0 left-0 h-3 bg-gradient-to-r from-rose-500 via-red-600 to-rose-700" />

          {/* Header Banner */}
          <div className="text-center space-y-4 pt-2">
            <div className="w-20 h-20 mx-auto rounded-3xl bg-rose-100 dark:bg-rose-950/80 border border-rose-300 dark:border-rose-700 flex items-center justify-center text-rose-600 dark:text-rose-400 shadow-inner">
              <Ban className="w-10 h-10 animate-bounce" />
            </div>

            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-rose-100 dark:bg-rose-950 text-rose-800 dark:text-rose-300 font-extrabold text-xs border border-rose-300 dark:border-rose-800">
              <span className="w-2 h-2 rounded-full bg-rose-600 animate-ping" />
              <span>حساب السائق موقوف مؤقتاً 🛑</span>
            </div>

            <div>
              <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                عذراً يا كابتن / {currentAccount.driverName || currentAccount.username}
              </h2>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 max-w-lg mx-auto mt-2 leading-relaxed">
                تم إيقاف وتجميد حساب السائق الخاص بك مؤقتاً بواسطة مسؤول الحركة في{" "}
                <strong className="text-rose-600 dark:text-rose-400 font-bold">
                  {currentAccount.factoryName || "المصنع التابع له"}
                </strong>
                .
              </p>
            </div>
          </div>

          {/* Suspension Reason Box */}
          <div className="bg-rose-50/80 dark:bg-rose-950/40 rounded-2xl p-5 border border-rose-200 dark:border-rose-800 space-y-3 text-xs">
            <div className="flex items-center gap-2 font-black text-rose-900 dark:text-rose-200">
              <AlertTriangle className="w-4 h-4 text-rose-600" />
              <span>سبب الإيقاف / ملاحظة الإدارة:</span>
            </div>
            <p className="text-slate-700 dark:text-slate-300 font-medium leading-relaxed bg-white/80 dark:bg-slate-900/80 p-3 rounded-xl border border-rose-100 dark:border-rose-900">
              {currentAccount.approvalNote || currentAccount.notes || "تم إيقاف حساب السائق مؤقتاً بواسطة إدارة الحركة بالمصنع."}
            </p>
          </div>

          {/* Action buttons */}
          <div className="pt-4 border-t border-slate-200 dark:border-slate-800 space-y-3">
            <a
              href={`https://wa.me/967771122334?text=${encodeURIComponent(
                `السلام عليكم مسؤول حركة المصنع، يرجى الاستفسار عن إيقاف حساب السائق: (${currentAccount.driverName} - @${currentAccount.username})`
              )}`}
              target="_blank"
              rel="noreferrer"
              className="w-full py-3 px-4 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-black shadow-lg transition-all flex items-center justify-center gap-2"
            >
              <Send className="w-4 h-4" />
              <span>التواصل مع مسؤول الحركة بالواتساب لإعادة التفعيل 💬</span>
            </a>

            <button
              type="button"
              onClick={onLogout}
              className="w-full py-2.5 rounded-2xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-extrabold transition-colors flex items-center justify-center gap-2"
            >
              <LogOut className="w-4 h-4" />
              <span>تسجيل الخروج / الخروج من الحساب</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ================= 2. LOGIN & REGISTRATION FORMS =================
  return (
    <div className="min-h-screen w-full bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white dir-rtl flex flex-col justify-center items-center p-4 sm:p-8 lg:p-12 relative overflow-x-hidden">
      
      {/* Top Header Bar for Customer Service */}
      <div className="w-full max-w-xl flex items-center justify-between mb-6 pb-4 border-b border-slate-200 dark:border-slate-800">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-2xl bg-purple-100 dark:bg-purple-500/20 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-500/30">
            <Truck className="w-6 h-6" />
          </div>
          <div>
            <h2 className="font-black text-lg text-slate-900 dark:text-white">تطبيق الناقل والأسطول الميداني</h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">إدارات الشحن والتسليم المباشر للتجار</p>
          </div>
        </div>

        <CustomerServiceButton label="خدمة العملاء 🎧" />
      </div>

      <div className="max-w-xl w-full bg-white dark:bg-slate-900/90 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xl p-6 sm:p-8 space-y-6">
        
        {/* Header Banner */}
        <div className="text-center space-y-3">
          <div className="w-16 h-16 mx-auto rounded-2xl bg-gradient-to-tr from-purple-600 via-indigo-600 to-indigo-900 text-white flex items-center justify-center shadow-lg border border-purple-400/40">
            <Truck className="w-8 h-8 text-white animate-bounce" />
          </div>

          <div>
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
              تطبيق السائق والناقل (Driver Terminal)
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              منصة إدارة الحمولات وتوصيل طلبيات الجملة من المصنع للتجار
            </p>
          </div>

          {/* Tab Switcher */}
          <div className="grid grid-cols-2 p-1 rounded-2xl bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 font-bold text-xs mt-4">
            <button
              type="button"
              onClick={() => {
                setAuthMode("LOGIN");
                setErrorMessage(null);
              }}
              className={`py-3 rounded-xl transition-all font-black ${
                authMode === "LOGIN"
                  ? "bg-amber-500 text-slate-950 shadow-md"
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
              }`}
            >
              تسجيل الدخول 🔑
            </button>

            <button
              type="button"
              onClick={() => {
                setAuthMode("REGISTER");
                setErrorMessage(null);
              }}
              className={`py-3 rounded-xl transition-all font-black ${
                authMode === "REGISTER"
                  ? "bg-amber-500 text-slate-950 shadow-md"
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
              }`}
            >
              إنشاء حساب سائق جديد 🚚
            </button>
          </div>
        </div>

      {/* Error Alert Box */}
      {errorMessage && (
        <div className="p-4 rounded-2xl bg-rose-50 text-rose-800 dark:bg-rose-950/80 dark:text-rose-300 border border-rose-200 dark:border-rose-800 text-xs font-bold flex items-center gap-2">
          <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {loginSuccessMsg && (
        <div className="p-4 rounded-2xl bg-emerald-50 text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 text-xs font-bold flex items-center gap-2">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          <span>{loginSuccessMsg}</span>
        </div>
      )}

      {/* ================= LOGIN FORM ================= */}
      {authMode === "LOGIN" && (
        <form onSubmit={handleLoginSubmit} className="space-y-4">
          <div className="p-3.5 rounded-2xl bg-indigo-50/70 dark:bg-indigo-950/50 border border-indigo-200 dark:border-indigo-800 text-xs text-indigo-900 dark:text-indigo-200 space-y-1">
            <div className="font-extrabold flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-indigo-600" />
              <span>طريقة الدخول:</span>
            </div>
            <p className="text-[11px] leading-relaxed text-slate-600 dark:text-slate-300">
              يمكنك الدخول بحساب السائق المنشأ لك من قبل المصنع، أو الحساب الذي قمت بتسجيله بذاتك بعد إقراره.
            </p>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
              اسم المستخدم / رقم الهاتف / البريد الإلكتروني: *
            </label>
            <div className="relative">
              <User className="w-4 h-4 absolute right-3 top-3.5 text-indigo-500" />
              <input
                type="text"
                required
                value={loginQuery}
                onChange={(e) => setLoginQuery(e.target.value)}
                placeholder="أدخل اسم المستخدم أو رقم الجوال أو البريد..."
                className="w-full p-3 pr-9 pl-3 rounded-2xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-bold text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                كلمة المرور: *
              </label>
              <button
                type="button"
                onClick={() => {
                  setIsForgotPasswordOpen(true);
                  setForgotStep(1);
                  setForgotIdentifier(loginQuery);
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
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute left-3 top-3.5 text-slate-400 hover:text-slate-600"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
              <input
                type={showPassword ? "text" : "password"}
                required
                value={loginPassword}
                onChange={(e) => setLoginPassword(e.target.value)}
                placeholder="••••••"
                className="w-full p-3 pl-9 rounded-2xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-bold text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3.5 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-extrabold text-xs shadow-lg transition-all flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {isLoading ? (
              <span>جاري التحقق من بيانات الدخول...</span>
            ) : (
              <>
                <KeyRound className="w-4 h-4" />
                <span>دخول تطبيق السائق 🚚</span>
              </>
            )}
          </button>
        </form>
      )}

      {/* ================= REGISTER FORM ================= */}
      {authMode === "REGISTER" && (
        <form onSubmit={handleRegisterSubmit} className="space-y-4">
          <div className="p-3.5 rounded-2xl bg-amber-50 dark:bg-amber-950/50 border border-amber-200 dark:border-amber-800 text-xs text-amber-900 dark:text-amber-200 space-y-1">
            <div className="font-extrabold flex items-center gap-1.5">
              <Clock className="w-4 h-4 text-amber-600" />
              <span>ملاحظة حول تسجيل السائقين:</span>
            </div>
            <p className="text-[11px] leading-relaxed text-slate-600 dark:text-slate-300">
              عند إتمام تسجيل الحساب بذاتك عبر (اسم المستخدم والهاتف)، سيتم توجيه حسابك لصفحة الانتظار لموافقة إدارة المصنع.
            </p>
          </div>

          {/* Search Factory */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
              البحث باسم المصنع التابع له: *
            </label>
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-3.5 text-indigo-500" />
              <input
                type="text"
                value={factorySearchQuery}
                onFocus={() => setIsFactorySearchOpen(true)}
                onChange={(e) => {
                  setFactorySearchQuery(e.target.value);
                  setIsFactorySearchOpen(true);
                }}
                placeholder="اكتب اسم المصنع للبحث..."
                className="w-full p-3 pl-9 pr-9 rounded-2xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-bold text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              />
              <Building2 className="w-4 h-4 absolute right-3 top-3.5 text-slate-400" />
            </div>

            {/* Filtered Factory Results List */}
            {isFactorySearchOpen && factorySearchQuery.trim().length > 0 && (
              <div className="mt-1.5 max-h-48 overflow-y-auto rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 shadow-xl z-20 relative divide-y divide-slate-100 dark:divide-slate-800">
                {filteredFactories.length > 0 ? (
                  filteredFactories.map((f) => (
                    <button
                      key={f.id}
                      type="button"
                      onClick={() => {
                        setRegFactoryId(f.id);
                        setFactorySearchQuery(f.name);
                        setIsFactorySearchOpen(false);
                      }}
                      className={`w-full p-3 text-right hover:bg-indigo-50 dark:hover:bg-indigo-950/50 transition-colors flex items-center justify-between text-xs ${
                        regFactoryId === f.id
                          ? "bg-indigo-50/80 dark:bg-indigo-900/40 text-indigo-600 dark:text-indigo-300 font-extrabold"
                          : "text-slate-800 dark:text-slate-200"
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <Building2 className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
                        <span>{f.name}</span>
                      </div>
                      <span className="text-[10px] text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-full">
                        {f.city}
                      </span>
                    </button>
                  ))
                ) : (
                  <div className="p-3 text-center text-xs text-slate-400 font-medium">
                    لا يوجد مصنع مطابق لهذا الاسم
                  </div>
                )}
              </div>
            )}

            {/* Currently Selected Factory Badge */}
            {selectedFactory && (
              <div className="mt-2 p-2.5 rounded-xl bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-800 flex items-center justify-between text-xs text-indigo-900 dark:text-indigo-200">
                <div className="flex items-center gap-2 font-bold">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                  <span>المصنع المحدد: {selectedFactory.name}</span>
                </div>
                <span className="text-[10px] text-slate-500 dark:text-slate-400 font-mono">({selectedFactory.city})</span>
              </div>
            )}

            <p className="text-[10px] text-slate-500 mt-1">
              سيظهر طلب تفعيل حسابك مباشرة في لوحة تحكم هذا المصنع للموافقة عليه.
            </p>
          </div>

          {/* Username */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
              اسم المستخدم (Username): *
            </label>
            <div className="relative">
              <UserCheck className="w-4 h-4 absolute left-3 top-3.5 text-slate-400" />
              <input
                type="text"
                required
                value={regUsername}
                onChange={(e) => setRegUsername(e.target.value)}
                placeholder="مثال: driver_ali أو ahmed77"
                className="w-full p-3 pl-9 rounded-2xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-bold text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:outline-none dir-ltr text-right"
              />
            </div>
          </div>

          {/* Phone */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
              رقم الهاتف / الجوال: *
            </label>
            <div className="relative">
              <Phone className="w-4 h-4 absolute left-3 top-3.5 text-slate-400" />
              <input
                type="tel"
                required
                value={regPhone}
                onChange={(e) => setRegPhone(e.target.value)}
                placeholder="مثال: 771122334"
                className="w-full p-3 pl-9 rounded-2xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-bold text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:outline-none dir-ltr text-right"
              />
            </div>
          </div>

          {/* Email (OPTIONAL) */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                البريد الإلكتروني:
              </label>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300">
                اختياري
              </span>
            </div>
            <div className="relative">
              <Mail className="w-4 h-4 absolute left-3 top-3.5 text-slate-400" />
              <input
                type="email"
                value={regEmail}
                onChange={(e) => setRegEmail(e.target.value)}
                placeholder="مثال: driver@gmail.com (اختياري)"
                className="w-full p-3 pl-9 rounded-2xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-bold text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:outline-none dir-ltr text-right"
              />
            </div>
          </div>

          {/* Driver Name */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
              اسم السائق الثلاثي:
            </label>
            <input
              type="text"
              value={regDriverName}
              onChange={(e) => setRegDriverName(e.target.value)}
              placeholder="مثال: علي محمد المروني"
              className="w-full p-3 rounded-2xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-bold text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:outline-none"
            />
          </div>

          {/* Vehicle Info */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                نوع المركبة:
              </label>
              <input
                type="text"
                value={regVehicleType}
                onChange={(e) => setRegVehicleType(e.target.value)}
                placeholder="دينا / تريلة"
                className="w-full p-3 rounded-2xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-bold text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                رقم اللوحة:
              </label>
              <input
                type="text"
                value={regVehicleNo}
                onChange={(e) => setRegVehicleNo(e.target.value)}
                placeholder="أ ب ج 1234"
                className="w-full p-3 rounded-2xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-bold text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              />
            </div>
          </div>

          {/* Password */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
              كلمة المرور:
            </label>
            <input
              type="password"
              value={regPassword}
              onChange={(e) => setRegPassword(e.target.value)}
              placeholder="••••••"
              className="w-full p-3 rounded-2xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-bold text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:outline-none dir-ltr text-right"
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3.5 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-extrabold text-xs shadow-lg transition-all flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {isLoading ? (
              <span>جاري تقديم طلب التسجيل...</span>
            ) : (
              <>
                <Truck className="w-4 h-4" />
                <span>إرسال طلب التسجيل والانتقال لصفحة الانتظار ⏳</span>
              </>
            )}
          </button>
        </form>
      )}

      </div>

      {/* FORGOT PASSWORD MODAL */}
      {isForgotPasswordOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 dir-rtl">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-4 animate-in fade-in zoom-in duration-150">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div className="flex items-center gap-2.5 text-indigo-600 dark:text-indigo-400">
                <KeyRound className="w-5 h-5" />
                <h3 className="font-extrabold text-slate-900 dark:text-white text-sm">
                  استعادة كلمة المرور (حساب السائق)
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
                  أدخل اسم المستخدم، رقم الجوال، أو البريد الإلكتروني المسجل لحساب السائق لتلقي رمز التحقق OTP.
                </p>

                <div className="space-y-1.5">
                  <label className="font-extrabold text-slate-700 dark:text-slate-300 block">
                    اسم المستخدم / رقم الهاتف / البريد الإلكتروني *
                  </label>
                  <div className="relative">
                    <User className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-indigo-500" />
                    <input
                      type="text"
                      required
                      value={forgotIdentifier}
                      onChange={(e) => setForgotIdentifier(e.target.value)}
                      placeholder="driver1 أو 770000001"
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
