import React, { useState, useEffect } from "react";
import { DriverAccount } from "../../types";
import { storeService } from "../../services/storeService";
import {
  Users,
  Plus,
  Trash2,
  Phone,
  Truck,
  Search,
  CheckCircle2,
  X,
  FileText,
  UserCheck,
  ShieldCheck,
  KeyRound,
  Copy,
  Check,
  Eye,
  EyeOff,
  AlertCircle,
  Share2,
  Clock,
  Ban,
  PauseCircle,
  PlayCircle,
  Table as TableIcon,
  LayoutGrid,
} from "lucide-react";

interface Props {
  factoryId?: string;
  onCloseModal?: () => void;
  isModal?: boolean;
}

export const DriversRosterView: React.FC<Props> = ({
  factoryId,
  onCloseModal,
  isModal = false,
}) => {
  const [driverAccounts, setDriverAccounts] = useState<DriverAccount[]>([]);
  const [currentFactorySession] = useState(() => storeService.getCurrentFactorySession());
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"ALL" | "APPROVED" | "SUSPENDED" | "PENDING">("ALL");
  const [viewMode, setViewMode] = useState<"TABLE" | "CARDS">("TABLE");

  const [isAddFormOpen, setIsAddFormOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // New Driver Form state
  const [driverName, setDriverName] = useState("");
  const [phone, setPhone] = useState("");
  const [vehicleNo, setVehicleNo] = useState("");
  const [vehicleType, setVehicleType] = useState("دينا جامبو 5 طن مبردة");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [notes, setNotes] = useState("");

  const [visiblePasswords, setVisiblePasswords] = useState<Record<string, boolean>>({});
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [deletingDriver, setDeletingDriver] = useState<{ id: string; name: string } | null>(null);

  const refreshAccounts = () => {
    const currentFac = storeService.getCurrentFactorySession();
    const fId = factoryId || currentFac?.factoryId || currentFac?.id;
    let list: DriverAccount[] = [];
    if (fId) {
      list = storeService.getDriverAccountsByFactoryId(fId);
    } else {
      list = [];
    }
    setDriverAccounts(list);
  };

  useEffect(() => {
    refreshAccounts();
    const unsubscribe = storeService.subscribe(() => {
      refreshAccounts();
    });
    return () => unsubscribe();
  }, [factoryId, currentFactorySession]);

  const handleAddDriverAccount = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    if (!driverName.trim() || !phone.trim() || !vehicleNo.trim() || !username.trim() || !password.trim()) {
      setErrorMessage("يرجى تعبئة كافة الحقول المطلوبة لبناء حساب السائق بشكل صحيح.");
      return;
    }

    try {
      const currentFac = storeService.getCurrentFactorySession();
      const activeFacId = factoryId || currentFac?.factoryId || currentFac?.id || "fac-1";
      const activeFacName = currentFac?.factoryName || "مصنع المنتجات الرائدة";

      const created = storeService.addDriverAccount({
        driverName: driverName.trim(),
        phone: phone.trim(),
        vehicleNo: vehicleNo.trim(),
        vehicleType: vehicleType.trim(),
        username: username.trim(),
        password: password.trim(),
        factoryId: activeFacId,
        factoryName: activeFacName,
        notes: notes.trim() || "سائق معتمد برحلات مجمعة",
      });

      setSuccessMessage(`🟢 تم إنشاء حساب السائق "${created.driverName}" وتخصيص كلمة المرور بنجاح!`);
      setDriverName("");
      setPhone("");
      setVehicleNo("");
      setUsername("");
      setPassword("");
      setNotes("");
      setIsAddFormOpen(false);

      setTimeout(() => setSuccessMessage(null), 5000);
      refreshAccounts();
    } catch (err: any) {
      setErrorMessage(err.message || "حدث خطأ أثناء إنشاء حساب السائق.");
    }
  };

  const handleApproveDriver = (id: string, name: string) => {
    storeService.approveDriverAccount(id);
    setSuccessMessage(`🟢 تم اعتماد وتفعيل حساب السائق "${name}" بنجاح! يمكن للسائق الآن دخول تطبيق السائق واستلام الطلبيات.`);
    setTimeout(() => setSuccessMessage(null), 5000);
    refreshAccounts();
  };

  const handleRejectDriver = (id: string, name: string) => {
    storeService.deleteDriverAccount(id);
    setSuccessMessage(`تم رفض وإلغاء طلب السائق "${name}".`);
    setTimeout(() => setSuccessMessage(null), 4000);
    refreshAccounts();
  };

  const handleSuspendDriver = (id: string, name: string) => {
    storeService.suspendDriverAccount(id);
    setSuccessMessage(`⏸️ تم إيقاف وتجميد حساب السائق "${name}" مؤقتاً.`);
    setTimeout(() => setSuccessMessage(null), 5000);
    refreshAccounts();
  };

  const handleUnsuspendDriver = (id: string, name: string) => {
    storeService.unsuspendDriverAccount(id);
    setSuccessMessage(`🟢 تم إعادة تفعيل وتنشيط حساب السائق "${name}" بنجاح!`);
    setTimeout(() => setSuccessMessage(null), 5000);
    refreshAccounts();
  };

  const handleDeleteDriverAccount = (id: string, name: string) => {
    setDeletingDriver({ id, name });
  };

  const confirmDeleteDriver = () => {
    if (!deletingDriver) return;
    const { id, name } = deletingDriver;
    storeService.deleteDriverAccount(id);
    setDeletingDriver(null);
    setSuccessMessage(`🗑️ تم حذف حساب السائق "${name}" نهائياً من النظام بنجاح.`);
    setTimeout(() => setSuccessMessage(null), 5000);
    refreshAccounts();
  };

  const togglePasswordVisibility = (id: string) => {
    setVisiblePasswords((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const handleCopyCredentials = (account: DriverAccount) => {
    const text = `🚚 بيانات دخول تطبيق السائق المعتمد:\nاسم المصنع: ${account.factoryName}\nاسم السائق: ${account.driverName}\nاسم المستخدم: ${account.username}\nكلمة المرور: ${account.password || "123456"}\nرقم اللوحة: ${account.vehicleNo}`;
    navigator.clipboard.writeText(text);
    setCopiedId(account.id);
    setTimeout(() => setCopiedId(null), 3000);
  };

  const pendingAccounts = driverAccounts.filter((d) => d.approvalStatus === "PENDING");
  const approvedAccounts = driverAccounts.filter((d) => d.approvalStatus === "APPROVED");
  const suspendedAccounts = driverAccounts.filter((d) => d.approvalStatus === "SUSPENDED");

  const filteredAccounts = driverAccounts.filter((d) => {
    const matchesSearch =
      d.driverName.includes(searchQuery) ||
      d.username.includes(searchQuery) ||
      d.phone.includes(searchQuery) ||
      d.vehicleNo.includes(searchQuery) ||
      d.vehicleType.includes(searchQuery);

    if (!matchesSearch) return false;

    if (statusFilter === "APPROVED") return d.approvalStatus === "APPROVED";
    if (statusFilter === "SUSPENDED") return d.approvalStatus === "SUSPENDED";
    if (statusFilter === "PENDING") return d.approvalStatus === "PENDING";
    return true;
  });

  const maxDriversAllowed = currentFactorySession?.subscription?.maxDrivers || 20;

  const containerContent = (
    <div className="space-y-6 dir-rtl">
      
      {/* Top Banner & Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-3xl bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white border border-slate-800 shadow-md">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-indigo-500/20 border border-indigo-400/30 rounded-2xl text-indigo-300">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-xl font-extrabold tracking-tight">
                إدارة أسطول وسائقي المصنع (Fleet & Drivers Directory 🚚)
              </h2>
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-500/20 border border-emerald-400/30 text-emerald-300 font-bold">
                {driverAccounts.length} / {maxDriversAllowed} سائق بباقتك
              </span>
              {pendingAccounts.length > 0 && (
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-amber-500 text-white font-extrabold animate-bounce">
                  {pendingAccounts.length} طلب بانتظار التفعيل ⏳
                </span>
              )}
            </div>
            <p className="text-xs text-slate-300 mt-1">
              إدارة أسطول السائقين المعتمدين لمصنعك، وتفعيل الحسابات، وتجميد الخدمة أو حذف البيانات نهائياً
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {isModal && onCloseModal && (
            <button
              onClick={onCloseModal}
              className="p-2 text-slate-300 hover:text-white rounded-xl bg-white/10 hover:bg-white/20 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          )}

          <button
            onClick={() => setIsAddFormOpen(!isAddFormOpen)}
            className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md transition-all flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            <span>إضافة سائق جديد + كلمة مرور 🚚</span>
          </button>
        </div>
      </div>

      {/* KPI Stats Cards (Matching Merchants & Factories Admin Page style) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-1">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
            <span className="text-[11px] font-bold">إجمالي أسطول السائقين</span>
            <Users className="w-4 h-4 text-indigo-600" />
          </div>
          <strong className="text-2xl font-extrabold text-slate-900 dark:text-white block">
            {driverAccounts.length} سائق
          </strong>
          <span className="text-[10px] text-indigo-600 dark:text-indigo-400 font-bold">
            مسجلين بالنظام لمصنعكم
          </span>
        </div>

        <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-1">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
            <span className="text-[11px] font-bold">السائقون المعتمدون والنشطون</span>
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
          </div>
          <strong className="text-2xl font-extrabold text-emerald-600 dark:text-emerald-400 block">
            {approvedAccounts.length} سائق 🟢
          </strong>
          <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold">
            متاحون للربط بالطلبات
          </span>
        </div>

        <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-1">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
            <span className="text-[11px] font-bold">الحسابات الموقوفة مؤقتاً</span>
            <Ban className="w-4 h-4 text-rose-600" />
          </div>
          <strong className="text-2xl font-extrabold text-rose-600 dark:text-rose-400 block">
            {suspendedAccounts.length} سائق 🔴
          </strong>
          <span className="text-[10px] text-rose-600 dark:text-rose-400 font-bold">
            مجمدين عن الدخول للتطبيق
          </span>
        </div>

        <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-1">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
            <span className="text-[11px] font-bold">طلبات بانتظار الاعتماد</span>
            <Clock className="w-4 h-4 text-amber-500" />
          </div>
          <strong className="text-2xl font-extrabold text-amber-600 dark:text-amber-400 block">
            {pendingAccounts.length} طلب ⏳
          </strong>
          <span className="text-[10px] text-amber-600 dark:text-amber-400 font-bold">
            تسجيل ذاتي جديد
          </span>
        </div>
      </div>

      {/* Notifications / Alerts */}
      {successMessage && (
        <div className="p-4 rounded-2xl bg-emerald-50 text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 text-xs font-bold flex items-center gap-2 shadow-xs animate-fade-in">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          <span>{successMessage}</span>
        </div>
      )}

      {errorMessage && (
        <div className="p-4 rounded-2xl bg-rose-50 text-rose-800 dark:bg-rose-950/80 dark:text-rose-300 border border-rose-200 dark:border-rose-800 text-xs font-bold flex items-center gap-2 shadow-xs animate-fade-in">
          <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Pending Driver Registration Requests Section */}
      {pendingAccounts.length > 0 && (
        <div className="p-6 rounded-3xl bg-amber-50/90 dark:bg-amber-950/40 border-2 border-amber-400 dark:border-amber-700 shadow-xl space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-amber-200 dark:border-amber-800/60">
            <div className="flex items-center gap-2 text-amber-900 dark:text-amber-200">
              <Clock className="w-5 h-5 text-amber-600 animate-pulse" />
              <h3 className="font-black text-sm sm:text-base">
                طلبات تفعيل السائقين الجدد التابعين لمصنعكم (بانتظار موافقتكم)
              </h3>
              <span className="px-2.5 py-0.5 rounded-full bg-amber-600 text-white font-extrabold text-xs">
                {pendingAccounts.length} طلب تفعيل
              </span>
            </div>
            <p className="text-[11px] text-amber-800 dark:text-amber-300 font-medium">
              قام هؤلاء السائقون بالتسجيل الذاتي واختيار مصنعكم للحصول على الاعتماد والتوصيل
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {pendingAccounts.map((account) => (
              <div
                key={account.id}
                className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-amber-300 dark:border-amber-800/80 shadow-sm space-y-3"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-amber-100 dark:bg-amber-900/60 text-amber-800 dark:text-amber-300 flex items-center justify-center font-black text-sm">
                      {account.driverName.charAt(0)}
                    </div>
                    <div>
                      <h4 className="font-extrabold text-slate-900 dark:text-white text-xs sm:text-sm">
                        {account.driverName}
                      </h4>
                      <p className="text-[11px] text-indigo-600 dark:text-indigo-400 font-mono font-bold dir-ltr text-right">
                        @{account.username}
                      </p>
                    </div>
                  </div>
                  <span className="px-2.5 py-0.5 rounded-md bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 text-[10px] font-bold border border-amber-300 dark:border-amber-800 shrink-0">
                    طلب تفعيل ⏳
                  </span>
                </div>

                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 text-[11px] space-y-1.5">
                  <div className="flex justify-between items-center">
                    <span className="text-slate-500">الجوال:</span>
                    <a href={`tel:${account.phone}`} className="font-bold font-mono text-emerald-600 hover:underline dir-ltr">
                      {account.phone}
                    </a>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-500">تفاصيل المركبة:</span>
                    <span className="font-bold text-slate-800 dark:text-slate-200">
                      {account.vehicleType} ({account.vehicleNo})
                    </span>
                  </div>
                  {account.notes && (
                    <div className="pt-1 text-[10px] text-slate-600 dark:text-slate-400 border-t border-slate-200 dark:border-slate-700">
                      ملاحظة الطلب: {account.notes}
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-2 pt-1">
                  <button
                    onClick={() => handleApproveDriver(account.id, account.driverName)}
                    className="flex-1 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs shadow-md transition-all flex items-center justify-center gap-1.5"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>موافقة واعتماد الحساب 🟢</span>
                  </button>
                  <button
                    onClick={() => handleRejectDriver(account.id, account.driverName)}
                    className="py-2.5 px-3 rounded-xl bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/60 dark:hover:bg-rose-900/60 text-rose-700 dark:text-rose-300 font-bold text-xs border border-rose-200 dark:border-rose-800 transition-all flex items-center justify-center gap-1"
                  >
                    <X className="w-4 h-4" />
                    <span>رفض الطلب</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Add New Driver Collapsible Form */}
      {isAddFormOpen && (
        <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border-2 border-emerald-500/50 shadow-xl space-y-5">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
            <h3 className="font-black text-sm text-slate-900 dark:text-white flex items-center gap-2">
              <UserCheck className="w-5 h-5 text-emerald-600" />
              <span>نموذج إصدار حساب سائق وكلمة مرور جديدة (المصنع):</span>
            </h3>
            <button
              onClick={() => setIsAddFormOpen(false)}
              className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 text-xs font-bold"
            >
              إلغاء
            </button>
          </div>

          <form onSubmit={handleAddDriverAccount} className="space-y-4">
            
            {/* Section 1: Driver Personal & Vehicle Details */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  اسم السائق الرباعي: *
                </label>
                <input
                  type="text"
                  required
                  value={driverName}
                  onChange={(e) => setDriverName(e.target.value)}
                  placeholder="مثال: أحمد علي المروني"
                  className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-bold text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  رقم جوال السائق (الواتساب): *
                </label>
                <input
                  type="text"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="771122334"
                  className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-bold text-slate-900 dark:text-white dir-ltr text-right focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  رقم لوحة الشاحنة/المركبة: *
                </label>
                <input
                  type="text"
                  required
                  value={vehicleNo}
                  onChange={(e) => setVehicleNo(e.target.value)}
                  placeholder="مثال: أ ب ج 4921"
                  className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-bold text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  نوع الشاحنة والقدرة:
                </label>
                <select
                  value={vehicleType}
                  onChange={(e) => setVehicleType(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-bold text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                >
                  <option value="دينا جامبو 5 طن مبردة">دينا جامبو 5 طن مبردة</option>
                  <option value="دينا جوانب مفتوحة 4 طن">دينا جوانب مفتوحة 4 طن</option>
                  <option value="شاحنة تريلة 10 طن">شاحنة تريلة 10 طن</option>
                  <option value="قاطرة ومقطورة 20 طن">قاطرة ومقطورة 20 طن</option>
                  <option value="فان بضائع مقفل 2 طن">فان بضائع مقفل 2 طن</option>
                </select>
              </div>
            </div>

            {/* Section 2: Account Credentials Assigned by Factory */}
            <div className="p-4 rounded-2xl bg-slate-100 dark:bg-slate-800/80 border border-indigo-200 dark:border-indigo-800 space-y-3">
              <div className="flex items-center gap-2 text-indigo-700 dark:text-indigo-300 font-extrabold text-xs">
                <KeyRound className="w-4 h-4" />
                <span>تعيين اسم المستخدم وكلمة المرور لدخول تطبيق السائق:</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    اسم المستخدم للدخول (Username): *
                  </label>
                  <input
                    type="text"
                    required
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="مثال: ahmed_driver77"
                    className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-xs font-mono font-bold text-indigo-600 dark:text-indigo-300 focus:ring-2 focus:ring-indigo-500 focus:outline-none dir-ltr text-right"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    كلمة المرور التأسيسية (Password): *
                  </label>
                  <input
                    type="text"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="مثال: 123456"
                    className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-xs font-mono font-bold text-emerald-600 dark:text-emerald-400 focus:ring-2 focus:ring-indigo-500 focus:outline-none dir-ltr text-right"
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                ملاحظات أو خطوط التغطية والمسارات (اختياري):
              </label>
              <input
                type="text"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="مثال: مخصص لخط صنعاء، تعز، الحديدة، نقل المواد الغذائية المبردة"
                className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-medium text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setIsAddFormOpen(false)}
                className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold text-xs"
              >
                إلغاء
              </button>
              <button
                type="submit"
                className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md transition-colors flex items-center gap-1.5"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>حفظ وتفعيل حساب السائق</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Filter, Search & View Mode Toolbar */}
      <div className="bg-white dark:bg-slate-900 p-4 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-3">
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
          
          {/* Status Filter Tabs (Matching Merchants & Factories style) */}
          <div className="flex items-center gap-1 overflow-x-auto pb-1 md:pb-0">
            <button
              onClick={() => setStatusFilter("ALL")}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 ${
                statusFilter === "ALL"
                  ? "bg-indigo-600 text-white shadow-xs"
                  : "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200"
              }`}
            >
              جميع السائقين ({driverAccounts.length})
            </button>

            <button
              onClick={() => setStatusFilter("APPROVED")}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 ${
                statusFilter === "APPROVED"
                  ? "bg-emerald-600 text-white shadow-xs"
                  : "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200"
              }`}
            >
              🟢 المعتمدون ({approvedAccounts.length})
            </button>

            <button
              onClick={() => setStatusFilter("SUSPENDED")}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 ${
                statusFilter === "SUSPENDED"
                  ? "bg-rose-600 text-white shadow-xs"
                  : "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200"
              }`}
            >
              🔴 الموقوفون ({suspendedAccounts.length})
            </button>

            <button
              onClick={() => setStatusFilter("PENDING")}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 ${
                statusFilter === "PENDING"
                  ? "bg-amber-600 text-white shadow-xs"
                  : "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200"
              }`}
            >
              ⏳ طلبات التفعيل ({pendingAccounts.length})
            </button>
          </div>

          {/* View Mode Toggle: Table View vs Cards View */}
          <div className="flex items-center gap-2 shrink-0 self-end md:self-auto">
            <div className="flex items-center bg-slate-100 dark:bg-slate-800 p-1 rounded-xl border border-slate-200 dark:border-slate-700">
              <button
                onClick={() => setViewMode("TABLE")}
                className={`p-1.5 px-2.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1 ${
                  viewMode === "TABLE"
                    ? "bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-xs"
                    : "text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
                }`}
                title="عرض الجدول"
              >
                <TableIcon className="w-4 h-4" />
                <span>جدول الإدارة</span>
              </button>

              <button
                onClick={() => setViewMode("CARDS")}
                className={`p-1.5 px-2.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1 ${
                  viewMode === "CARDS"
                    ? "bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-xs"
                    : "text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
                }`}
                title="عرض البطاقات"
              >
                <LayoutGrid className="w-4 h-4" />
                <span>بطاقات الأسطول</span>
              </button>
            </div>
          </div>
        </div>

        {/* Search Input Bar */}
        <div className="relative">
          <Search className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="ابحث باسم السائق، اسم المستخدم، رقم الجوال، أو لوحة الشاحنة..."
            className="w-full pr-10 pl-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-medium text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:outline-none"
          />
        </div>
      </div>

      {/* Main Content Render: Table View or Cards Grid View */}
      {filteredAccounts.length === 0 ? (
        <div className="p-12 text-center text-slate-400 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 space-y-3">
          <Truck className="w-12 h-12 text-slate-300 dark:text-slate-700 mx-auto" />
          <p className="font-bold text-sm text-slate-700 dark:text-slate-300">لا يوجد حسابات سائقين مطابقة للبحث أو التصفية.</p>
          <p className="text-xs">اضغط على زر "إضافة سائق جديد" لتزويد سائقي شاحنات المصنع ببيانات الدخول.</p>
        </div>
      ) : viewMode === "TABLE" ? (
        /* TABLE VIEW (Matching Merchants and Factories Admin Table) */
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-right text-xs">
              <thead className="bg-slate-50 dark:bg-slate-800/80 text-slate-600 dark:text-slate-400 font-bold border-b border-slate-200 dark:border-slate-800">
                <tr>
                  <th className="p-3">اسم السائق ورمز الحساب</th>
                  <th className="p-3">تفاصيل المركبة واللوحة</th>
                  <th className="p-3">الجوال والاتصال</th>
                  <th className="p-3">بيانات الدخول (التطبيق)</th>
                  <th className="p-3 text-center">حالة الحساب والاعتماد</th>
                  <th className="p-3 text-center">إجراءات الإدارة ⚙️</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-medium text-slate-700 dark:text-slate-300">
                {filteredAccounts.map((account) => {
                  const isPassVisible = visiblePasswords[account.id] || false;
                  const isCopied = copiedId === account.id;

                  const isApproved = account.approvalStatus === "APPROVED";
                  const isPending = account.approvalStatus === "PENDING";
                  const isSuspended = account.approvalStatus === "SUSPENDED";

                  return (
                    <tr key={account.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                      {/* Driver Name & Username */}
                      <td className="p-3">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-800 flex items-center justify-center text-indigo-600 dark:text-indigo-400 font-black text-sm shrink-0">
                            {account.driverName.charAt(0)}
                          </div>
                          <div>
                            <div className="font-extrabold text-slate-900 dark:text-white">
                              {account.driverName}
                            </div>
                            <span className="text-[10px] text-indigo-600 dark:text-indigo-400 font-mono font-bold block dir-ltr text-right">
                              @{account.username}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Vehicle Details */}
                      <td className="p-3">
                        <div className="font-bold text-slate-800 dark:text-slate-200">
                          {account.vehicleType}
                        </div>
                        <span className="inline-block mt-0.5 text-[10px] font-mono font-bold bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded border border-slate-200 dark:border-slate-700">
                          {account.vehicleNo}
                        </span>
                      </td>

                      {/* Phone Number */}
                      <td className="p-3">
                        <a
                          href={`tel:${account.phone}`}
                          className="font-mono font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1 hover:underline dir-ltr"
                        >
                          <Phone className="w-3.5 h-3.5" />
                          <span>{account.phone}</span>
                        </a>
                      </td>

                      {/* Credentials */}
                      <td className="p-3">
                        <div className="bg-slate-50 dark:bg-slate-800/60 p-2 rounded-xl border border-slate-200/60 dark:border-slate-700/60 space-y-1">
                          <div className="flex items-center justify-between text-[10px]">
                            <span className="text-slate-400">اسم المستخدم:</span>
                            <span className="font-mono font-bold text-indigo-600 dir-ltr">@{account.username}</span>
                          </div>
                          <div className="flex items-center justify-between text-[10px]">
                            <span className="text-slate-400">كلمة المرور:</span>
                            <div className="flex items-center gap-1">
                              <button
                                type="button"
                                onClick={() => togglePasswordVisibility(account.id)}
                                className="text-slate-400 hover:text-slate-600"
                              >
                                {isPassVisible ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                              </button>
                              <span className="font-mono font-bold text-emerald-600 dir-ltr">
                                {isPassVisible ? account.password || "123456" : "••••••"}
                              </span>
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Status Badge */}
                      <td className="p-3 text-center">
                        {isApproved && (
                          <span className="px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 text-[10px] font-extrabold inline-flex items-center gap-1 border border-emerald-300">
                            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                            <span>معتمد ونشط 🟢</span>
                          </span>
                        )}

                        {isPending && (
                          <span className="px-3 py-1 rounded-full bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 text-[10px] font-black animate-pulse inline-flex items-center gap-1 border border-amber-300">
                            <Clock className="w-3.5 h-3.5 text-amber-600" />
                            <span>بانتظار الموافقة ⏳</span>
                          </span>
                        )}

                        {isSuspended && (
                          <span className="px-3 py-1 rounded-full bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300 text-[10px] font-black inline-flex items-center gap-1 border border-rose-300">
                            <Ban className="w-3.5 h-3.5 text-rose-600" />
                            <span>موقوف مؤقتاً ⛔</span>
                          </span>
                        )}
                      </td>

                      {/* Action Buttons: Suspend, Delete, Share */}
                      <td className="p-3 text-center">
                        <div className="flex items-center justify-center gap-1.5 flex-wrap">
                          {isPending && (
                            <button
                              type="button"
                              onClick={() => handleApproveDriver(account.id, account.driverName)}
                              className="px-2.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-[11px] shadow-xs transition-all flex items-center gap-1"
                              title="اعتماد وتفعيل السائق"
                            >
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              <span>اعتماد 🟢</span>
                            </button>
                          )}

                          {isSuspended ? (
                            <button
                              type="button"
                              onClick={() => handleUnsuspendDriver(account.id, account.driverName)}
                              className="px-2.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-[11px] shadow-xs transition-all flex items-center gap-1"
                              title="إعادة تفعيل السائق وتنشيط حسابه"
                            >
                              <PlayCircle className="w-3.5 h-3.5" />
                              <span>تنشيط 🟢</span>
                            </button>
                          ) : isApproved ? (
                            <button
                              type="button"
                              onClick={() => handleSuspendDriver(account.id, account.driverName)}
                              className="px-2.5 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-extrabold text-[11px] shadow-xs transition-all flex items-center gap-1"
                              title="إيقاف وتجميد حساب السائق مؤقتاً"
                            >
                              <PauseCircle className="w-3.5 h-3.5" />
                              <span>إيقاف ⏸️</span>
                            </button>
                          ) : null}

                          <button
                            type="button"
                            onClick={() => handleCopyCredentials(account)}
                            className="p-1.5 rounded-xl text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-950/60 transition-colors"
                            title="نسخ بيانات الدخول للتطبيقات"
                          >
                            {isCopied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                          </button>

                          <button
                            type="button"
                            onClick={() => handleDeleteDriverAccount(account.id, account.driverName)}
                            className="p-1.5 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/50 transition-colors"
                            title="حذف حساب السائق نهائياً"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* CARDS GRID VIEW */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredAccounts.map((account) => {
            const isPassVisible = visiblePasswords[account.id] || false;
            const isCopied = copiedId === account.id;

            return (
              <div
                key={account.id}
                className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs hover:border-indigo-500/50 transition-all flex flex-col justify-between space-y-4 relative overflow-hidden"
              >
                <div className="space-y-3">
                  
                  {/* Driver Header Info */}
                  <div className="flex items-start justify-between gap-2 pb-2 border-b border-slate-100 dark:border-slate-800">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-800 flex items-center justify-center text-indigo-600 dark:text-indigo-400 font-black text-base shrink-0">
                        {account.driverName.charAt(0)}
                      </div>
                      <div>
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <h4 className="font-extrabold text-slate-900 dark:text-white text-sm">
                            {account.driverName}
                          </h4>
                          {account.approvalStatus === "PENDING" ? (
                            <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 border border-amber-300 shrink-0">
                              قيد الانتظار ⏳
                            </span>
                          ) : account.approvalStatus === "SUSPENDED" ? (
                            <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300 border border-rose-300 shrink-0 flex items-center gap-1">
                              <Ban className="w-3 h-3 text-rose-600" />
                              <span>موقوف 🔴</span>
                            </span>
                          ) : (
                            <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-300 shrink-0 flex items-center gap-1">
                              <ShieldCheck className="w-3 h-3 text-emerald-600" />
                              <span>معتمد 🟢</span>
                            </span>
                          )}
                        </div>
                        <span className="inline-block mt-1 text-[11px] font-bold text-indigo-700 dark:text-indigo-300 bg-indigo-50 dark:bg-indigo-950/60 px-2 py-0.5 rounded-md border border-indigo-200/60 dark:border-indigo-800/60">
                          {account.vehicleType}
                        </span>
                      </div>
                    </div>

                    {/* Action buttons: Suspend & Delete */}
                    <div className="flex items-center gap-1.5 shrink-0">
                      {account.approvalStatus === "SUSPENDED" ? (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleUnsuspendDriver(account.id, account.driverName);
                          }}
                          className="px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 active:scale-95 dark:bg-emerald-950/70 dark:hover:bg-emerald-900 text-emerald-700 dark:text-emerald-300 rounded-xl transition-all flex items-center gap-1.5 text-xs font-bold border border-emerald-300 dark:border-emerald-700 shadow-xs cursor-pointer"
                          title="إعادة تفعيل السائق وتنشيط حسابه"
                        >
                          <PlayCircle className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                          <span>تنشيط</span>
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleSuspendDriver(account.id, account.driverName);
                          }}
                          className="px-3 py-1.5 bg-amber-50 hover:bg-amber-100 active:scale-95 dark:bg-amber-950/70 dark:hover:bg-amber-900 text-amber-800 dark:text-amber-200 rounded-xl transition-all flex items-center gap-1.5 text-xs font-bold border border-amber-300 dark:border-amber-700 shadow-xs cursor-pointer"
                          title="إيقاف وتجميد حساب السائق مؤقتاً"
                        >
                          <PauseCircle className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                          <span>إيقاف</span>
                        </button>
                      )}

                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteDriverAccount(account.id, account.driverName);
                        }}
                        className="px-3 py-1.5 bg-rose-50 hover:bg-rose-100 active:scale-95 dark:bg-rose-950/70 dark:hover:bg-rose-900 text-rose-700 dark:text-rose-300 rounded-xl transition-all flex items-center gap-1.5 text-xs font-bold border border-rose-300 dark:border-rose-700 shadow-xs cursor-pointer"
                        title="حذف حساب السائق نهائياً"
                      >
                        <Trash2 className="w-4 h-4 text-rose-600 dark:text-rose-400" />
                        <span>حذف</span>
                      </button>
                    </div>
                  </div>

                  {/* Vehicle & Contact details */}
                  <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 space-y-2 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-500">رقم لوحة الشاحنة:</span>
                      <span className="font-mono font-bold text-slate-900 dark:text-white bg-white dark:bg-slate-800 px-2 py-0.5 rounded border border-slate-200 dark:border-slate-700">
                        {account.vehicleNo}
                      </span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-slate-500">الجوال المباشر:</span>
                      <a
                        href={`tel:${account.phone}`}
                        className="font-mono font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1 hover:underline dir-ltr"
                      >
                        <Phone className="w-3 h-3" />
                        <span>{account.phone}</span>
                      </a>
                    </div>

                    {account.notes && (
                      <div className="pt-1 text-[11px] text-slate-600 dark:text-slate-400 border-t border-slate-200/60 dark:border-slate-700/60 flex items-start gap-1">
                        <FileText className="w-3.5 h-3.5 text-indigo-500 shrink-0 mt-0.5" />
                        <span>{account.notes}</span>
                      </div>
                    )}
                  </div>

                  {/* Driver Application Credentials Card */}
                  <div className="p-3 rounded-2xl bg-indigo-50/80 dark:bg-indigo-950/50 border border-indigo-200 dark:border-indigo-800 space-y-2 text-xs">
                    <div className="flex items-center justify-between border-b border-indigo-200/60 dark:border-indigo-800/60 pb-1.5">
                      <span className="font-bold text-indigo-900 dark:text-indigo-200 flex items-center gap-1 text-[11px]">
                        <KeyRound className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
                        <span>بيانات الدخول لتطبيق السائق</span>
                      </span>

                      <button
                        type="button"
                        onClick={() => handleCopyCredentials(account)}
                        className="text-[10px] font-bold text-indigo-700 dark:text-indigo-300 hover:text-indigo-900 flex items-center gap-1 bg-white dark:bg-slate-900 px-2 py-0.5 rounded-md border border-indigo-200 dark:border-indigo-800 transition-colors"
                      >
                        {isCopied ? (
                          <>
                            <Check className="w-3 h-3 text-emerald-600" />
                            <span className="text-emerald-600 font-bold">تم النسخ</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3 h-3" />
                            <span>نسخ البيانات</span>
                          </>
                        )}
                      </button>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-[11px]">
                      <div>
                        <span className="text-slate-500 block text-[10px]">اسم المستخدم:</span>
                        <span className="font-mono font-black text-indigo-700 dark:text-indigo-300 dir-ltr block text-right">
                          @{account.username}
                        </span>
                      </div>

                      <div>
                        <div className="flex items-center justify-between">
                          <span className="text-slate-500 text-[10px]">كلمة المرور:</span>
                          <button
                            type="button"
                            onClick={() => togglePasswordVisibility(account.id)}
                            className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                            title={isPassVisible ? "إخفاء كلمة المرور" : "إظهار كلمة المرور"}
                          >
                            {isPassVisible ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                          </button>
                        </div>
                        <span className="font-mono font-black text-emerald-700 dark:text-emerald-400 dir-ltr block text-right">
                          {isPassVisible ? account.password || "123456" : "••••••"}
                        </span>
                      </div>
                    </div>
                  </div>

                </div>

                {/* Bottom Share/Call Action */}
                <div className="flex items-center gap-2 pt-1">
                  {account.approvalStatus === "PENDING" ? (
                    <button
                      type="button"
                      onClick={() => handleApproveDriver(account.id, account.driverName)}
                      className="flex-1 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs transition-colors flex items-center justify-center gap-1.5 shadow-md"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      <span>اعتماد وتفعيل السائق 🟢</span>
                    </button>
                  ) : account.approvalStatus === "SUSPENDED" ? (
                    <button
                      type="button"
                      onClick={() => handleUnsuspendDriver(account.id, account.driverName)}
                      className="flex-1 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs transition-colors flex items-center justify-center gap-1.5 shadow-md"
                    >
                      <PlayCircle className="w-4 h-4" />
                      <span>إلغاء الإيقاف وإعادة التفعيل 🟢</span>
                    </button>
                  ) : (
                    <>
                      <button
                        type="button"
                        onClick={() => handleSuspendDriver(account.id, account.driverName)}
                        className="px-3 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-extrabold text-xs transition-colors flex items-center justify-center gap-1.5 shadow-md"
                        title="إيقاف وتجميد حساب السائق"
                      >
                        <PauseCircle className="w-4 h-4" />
                        <span>إيقاف ⏸️</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => handleCopyCredentials(account)}
                        className="flex-1 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs transition-colors flex items-center justify-center gap-1.5 shadow-xs"
                      >
                        <Share2 className="w-3.5 h-3.5" />
                        <span>مشاركة البيانات</span>
                      </button>
                    </>
                  )}

                  <a
                    href={`tel:${account.phone}`}
                    className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300"
                    title="اتصال مباشر"
                  >
                    <Phone className="w-4 h-4" />
                  </a>
                </div>

              </div>
            );
          })}
        </div>
      )}

      {/* DELETE DRIVER CONFIRMATION MODAL */}
      {deletingDriver && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 dir-rtl">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-4">
            <div className="flex items-center gap-3 text-rose-600">
              <div className="p-3 rounded-2xl bg-rose-50 dark:bg-rose-950/80 text-rose-600 dark:text-rose-400">
                <Trash2 className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-bold text-slate-900 dark:text-white text-base">
                  تأكيد حذف حساب السائق
                </h3>
                <span className="text-xs font-bold text-rose-600 block">
                  {deletingDriver.name}
                </span>
              </div>
            </div>

            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
              هل أنت متأكد من رغبتك في حذف حساب السائق <strong className="text-slate-900 dark:text-white">"{deletingDriver.name}"</strong> نهائياً من قائمة السائقين والأسطول المعتمد؟
            </p>

            <div className="pt-3 flex items-center justify-end gap-2 border-t border-slate-100 dark:border-slate-800">
              <button
                type="button"
                onClick={() => setDeletingDriver(null)}
                className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold text-xs"
              >
                إلغاء
              </button>
              <button
                type="button"
                onClick={confirmDeleteDriver}
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs shadow-md transition-all flex items-center gap-1.5"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>تأكيد الحذف 🗑️</span>
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );

  if (isModal) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 dir-rtl overflow-y-auto">
        <div className="relative w-full max-w-5xl rounded-3xl bg-white dark:bg-slate-900 shadow-2xl border border-slate-200 dark:border-slate-800 p-6 my-6 max-h-[85vh] overflow-y-auto">
          {containerContent}
        </div>
      </div>
    );
  }

  return containerContent;
};
