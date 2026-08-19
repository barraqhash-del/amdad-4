import React, { useState, useMemo } from "react";
import {
  Users,
  UserPlus,
  Search,
  FileText,
  Clock,
  Edit3,
  Trash2,
  Phone,
  AlertTriangle,
  Receipt,
  CreditCard,
  History,
  Plus,
  Printer,
  UserCheck,
  User,
  Upload,
  Image as ImageIcon,
  Sun,
  Moon,
  Timer,
  Sparkles,
  X,
  Calendar,
  DollarSign,
  Briefcase,
  ShieldCheck,
  ChevronRight,
  Award,
  ArrowRight,
  MessageSquare,
  QrCode,
  Send
} from "lucide-react";
import {
  EmployeeRecord,
  EmployeeAttendanceStatus,
  EmployeeShiftType,
  EmployeeAdvance,
  EmployeePenalty,
  EmployeeVoucher
} from "../../types";
import { storeService } from "../../services/storeService";
import {
  buildVoucher,
  sendVoucherToEmployee,
  dispatchVoucherDirectBackground,
} from "../../services/whatsappService";
import { MerchantWhatsAppVoucherModal } from "./MerchantWhatsAppVoucherModal";
import { WhatsAppLiveStatusBadge } from "./WhatsAppLiveStatusBadge";

interface Props {
  onBackToCashier?: () => void;
}

type MainViewTab =
  | "DIRECTORY"
  | "PAYROLL"
  | "ADVANCES"
  | "PENALTIES"
  | "OPERATIONS_LOG";

export const MerchantEmployeesManager: React.FC<Props> = () => {
  const [employees, setEmployees] = useState<EmployeeRecord[]>(() =>
    storeService.getEmployees()
  );
  const [activeTab, setActiveTab] = useState<MainViewTab>("DIRECTORY");
  const [searchQuery, setSearchQuery] = useState("");

  // Selected Employee for Dedicated Profile View
  const [selectedEmployee, setSelectedEmployee] = useState<EmployeeRecord | null>(null);
  const [profileTab, setProfileTab] = useState<"INFO" | "FINANCIAL" | "ADVANCES" | "PENALTIES" | "ATTENDANCE">("INFO");

  // Deletion Confirmation Dialog State
  const [deletingEmployee, setDeletingEmployee] = useState<EmployeeRecord | null>(null);

  // Add / Edit Employee Form State
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingEmpId, setEditingEmpId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: "", // اسم الموظف الرباعي
    roleTitle: "", // المسمى الوظيفي (يكتب كتابة)
    nationality: "يمني", // الجنسية (تكتب كتابة)
    idNumber: "",
    idExpiryDate: "2027-12-31",
    phone: "",
    basicSalary: "" as unknown as number, // فارغ ويكتب كتابة
    shift: "MORNING" as EmployeeShiftType,
    customShiftFrom: "08:00 ص",
    customShiftTo: "04:00 م",
    avatar: "", // رفع من الجهاز
    notes: "",
  });

  // Advance Form Modal State
  const [isAdvanceModalOpen, setIsAdvanceModalOpen] = useState(false);
  const [advanceEmpId, setAdvanceEmpId] = useState<string>("");
  const [advanceAmount, setAdvanceAmount] = useState<number>(20000);
  const [advanceReason, setAdvanceReason] = useState<string>("");

  // Penalty / Reward Modal State
  const [isPenaltyModalOpen, setIsPenaltyModalOpen] = useState(false);
  const [penaltyEmpId, setPenaltyEmpId] = useState<string>("");
  const [penaltyType, setPenaltyType] = useState<"DEDUCTION" | "WARNING" | "BONUS">("DEDUCTION");
  const [penaltyAmount, setPenaltyAmount] = useState<number>(10000);
  const [penaltyReason, setPenaltyReason] = useState<string>("");

  // WhatsApp Voucher Preview Modal State
  const [activeVoucher, setActiveVoucher] = useState<EmployeeVoucher | null>(null);
  const [isVoucherModalOpen, setIsVoucherModalOpen] = useState(false);

  // Toast / notification message
  const [toastMsg, setToastMsg] = useState("");

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(""), 3000);
  };

  const refreshEmployees = () => {
    const list = storeService.getEmployees();
    setEmployees(list);
    if (selectedEmployee) {
      const updated = list.find((e) => e.id === selectedEmployee.id);
      setSelectedEmployee(updated || null);
    }
  };

  const filteredEmployees = useMemo(() => {
    return employees.filter((emp) => {
      const q = searchQuery.trim().toLowerCase();
      if (!q) return true;
      return (
        emp.name.toLowerCase().includes(q) ||
        (emp.idNumber && emp.idNumber.includes(q)) ||
        (emp.empCode && emp.empCode.toLowerCase().includes(q)) ||
        (emp.roleTitle && emp.roleTitle.toLowerCase().includes(q)) ||
        (emp.phone && emp.phone.includes(q)) ||
        (emp.nationality && emp.nationality.toLowerCase().includes(q))
      );
    });
  }, [employees, searchQuery]);

  // Attendance Toggle
  const handleToggleAttendance = (
    empId: string,
    e?: React.MouseEvent
  ) => {
    if (e) e.stopPropagation();
    const emp = employees.find((x) => x.id === empId);
    if (!emp) return;

    let newStatus: EmployeeAttendanceStatus = "PRESENT";
    if (emp.status === "PRESENT") newStatus = "ABSENT";
    else if (emp.status === "ABSENT") newStatus = "LEAVE";
    else if (emp.status === "LEAVE") newStatus = "NOT_ATTENDED_YET";
    else newStatus = "PRESENT";

    storeService.recordEmployeeAttendance(empId, newStatus);
    refreshEmployees();
    showToast(`تم تحديث حالة الحضور للموظف ${emp.name}`);
  };

  // Open Edit Form
  const handleOpenEdit = (emp: EmployeeRecord, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setEditingEmpId(emp.id);
    setFormData({
      name: emp.name,
      roleTitle: emp.roleTitle,
      nationality: emp.nationality || "يمني",
      idNumber: emp.idNumber || "",
      idExpiryDate: emp.idExpiryDate || "2027-12-31",
      phone: emp.phone || "",
      basicSalary: emp.basicSalary,
      shift: emp.shift || "MORNING",
      customShiftFrom: emp.customShiftHours?.from || "08:00 ص",
      customShiftTo: emp.customShiftHours?.to || "04:00 م",
      avatar: emp.avatar || "",
      notes: emp.notes || "",
    });
    setIsAddModalOpen(true);
  };

  // Open Add Form
  const handleOpenAdd = () => {
    setEditingEmpId(null);
    setFormData({
      name: "",
      roleTitle: "",
      nationality: "يمني",
      idNumber: "",
      idExpiryDate: "2027-12-31",
      phone: "",
      basicSalary: "" as unknown as number,
      shift: "MORNING",
      customShiftFrom: "08:00 ص",
      customShiftTo: "04:00 م",
      avatar: "",
      notes: "",
    });
    setIsAddModalOpen(true);
  };

  // Submit Add / Edit Form
  const handleSaveEmployee = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      showToast("يرجى إدخال اسم الموظف الرباعي");
      return;
    }
    if (!formData.roleTitle.trim()) {
      showToast("يرجى إدخال المسمى الوظيفي");
      return;
    }

    const salaryNum = Number(formData.basicSalary) || 0;

    const payload = {
      name: formData.name.trim(),
      roleTitle: formData.roleTitle.trim(),
      department: formData.roleTitle.trim(),
      nationality: formData.nationality.trim() || "يمني",
      idNumber: formData.idNumber.trim(),
      idExpiryDate: formData.idExpiryDate,
      phone: formData.phone.trim(),
      basicSalary: salaryNum,
      allowances: 0,
      shift: formData.shift,
      customShiftHours:
        formData.shift === "CUSTOM"
          ? {
              from: formData.customShiftFrom || "08:00 ص",
              to: formData.customShiftTo || "04:00 م",
            }
          : undefined,
      avatar: formData.avatar || "",
      notes: formData.notes,
    };

    if (editingEmpId) {
      storeService.updateEmployee(editingEmpId, payload);
      showToast(`تم حفظ تعديل بيانات الموظف ${formData.name} بنجاح ✨`);
    } else {
      const codeNum = Math.floor(10000 + Math.random() * 90000);
      storeService.addEmployee({
        ...payload,
        empCode: `EMP-${codeNum}#`,
        status: "NOT_ATTENDED_YET",
        joinDate: new Date().toISOString().split("T")[0],
        advances: [],
        penalties: [],
      });
      showToast(`تم إضافة الموظف الجديد ${formData.name} بنجاح 🎉`);
    }

    setIsAddModalOpen(false);
    setEditingEmpId(null);
    refreshEmployees();
  };

  // Confirm and Execute Deletion of Employee
  const handleConfirmDelete = () => {
    if (!deletingEmployee) return;
    const empName = deletingEmployee.name;
    storeService.deleteEmployee(deletingEmployee.id);
    if (selectedEmployee?.id === deletingEmployee.id) {
      setSelectedEmployee(null);
    }
    setDeletingEmployee(null);
    refreshEmployees();
    showToast(`تم حذف الموظف "${empName}" بنجاح 🗑️`);
  };

  // Submit Advance
  const handleAddAdvanceSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!advanceEmpId || advanceAmount <= 0) return;
    
    const targetEmp = employees.find((emp) => emp.id === advanceEmpId);
    
    storeService.addEmployeeAdvance(advanceEmpId, {
      amount: Number(advanceAmount),
      reason: advanceReason || "سلفة نقدية",
      status: "PENDING_DEDUCTION",
    });

    // Auto-generate electronic WhatsApp Voucher & Dispatch in Background
    if (targetEmp) {
      const voucher = buildVoucher({
        type: "DISBURSEMENT_ADVANCE",
        employee: targetEmp,
        amount: Number(advanceAmount),
        reason: advanceReason || "سلفة نقدية مسجلة في النظام",
      });
      setActiveVoucher(voucher);
      // Save voucher record
      storeService.saveEmployeeVoucher(voucher);

      const waConfig = storeService.getMerchantWhatsAppConfig();
      // Direct automatic background dispatch from linked WhatsApp phone session without opening any windows/popups
      if (waConfig.enabled !== false && targetEmp.phone) {
        dispatchVoucherDirectBackground(voucher, targetEmp.phone);
      }
    }

    setIsAdvanceModalOpen(false);
    setAdvanceReason("");
    refreshEmployees();
    showToast(`تم اعتماد السند وصرف السلفة وإرسالها بالخلفية فوراً إلى رقم المستلم (${targetEmp?.phone || targetEmp?.name}) 🟢⚡`);
  };

  // Submit Penalty / Bonus
  const handleAddPenaltySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!penaltyEmpId || !penaltyReason) return;
    
    const targetEmp = employees.find((emp) => emp.id === penaltyEmpId);

    storeService.addEmployeePenalty(penaltyEmpId, {
      type: penaltyType,
      amount: penaltyType !== "WARNING" ? Number(penaltyAmount) : undefined,
      reason: penaltyReason,
      approvedBy: "الإدارة العامة",
    });

    // Auto-generate electronic WhatsApp Voucher for Penalty/Bonus & Dispatch directly in Background
    if (targetEmp) {
      const voucherType = penaltyType === "BONUS" ? "BONUS_REWARD" : "DEDUCTION_PENALTY";
      const voucher = buildVoucher({
        type: voucherType,
        employee: targetEmp,
        amount: penaltyType !== "WARNING" ? Number(penaltyAmount) : 0,
        reason: `${penaltyType === "WARNING" ? "إنذار إداري كتابي: " : penaltyType === "BONUS" ? "مكافأة تشجيعية: " : "خصم مالي: "}${penaltyReason}`,
      });
      setActiveVoucher(voucher);
      storeService.saveEmployeeVoucher(voucher);

      const waConfig = storeService.getMerchantWhatsAppConfig();
      // Direct automatic background dispatch from linked WhatsApp phone session without opening any windows/popups
      if (waConfig.enabled !== false && targetEmp.phone) {
        dispatchVoucherDirectBackground(voucher, targetEmp.phone);
      }
    }

    setIsPenaltyModalOpen(false);
    setPenaltyReason("");
    refreshEmployees();
    showToast(
      penaltyType === "BONUS"
        ? `تم اعتماد المكافأة وإرسال السند بالخلفية للموظف (${targetEmp?.name}) في أقل من ثانية 🌟⚡`
        : `تم اعتماد الخصم وإرسال السند بالخلفية إلى هاتف الموظف (${targetEmp?.phone || targetEmp?.name}) في أقل من ثانية ⚠️⚡`
    );
  };

  // Helper for Shift Label
  const getShiftBadge = (shift: EmployeeShiftType, customHours?: { from: string; to: string }) => {
    switch (shift) {
      case "MORNING":
        return { label: "صباحي ☀️", color: "bg-amber-50 text-amber-700 dark:bg-amber-500/15 dark:text-amber-400 border-amber-200 dark:border-amber-500/30" };
      case "EVENING":
        return { label: "مسائي 🌙", color: "bg-indigo-50 text-indigo-700 dark:bg-indigo-500/15 dark:text-indigo-400 border-indigo-200 dark:border-indigo-500/30" };
      case "FULL_DAY":
        return { label: "يوم كامل ⏳", color: "bg-purple-50 text-purple-700 dark:bg-purple-500/15 dark:text-purple-400 border-purple-200 dark:border-purple-500/30" };
      case "CUSTOM":
        return {
          label: `مخصص (${customHours?.from || "08:00 ص"} - ${customHours?.to || "04:00 م"}) ⏱️`,
          color: "bg-blue-50 text-blue-700 dark:bg-blue-500/15 dark:text-blue-400 border-blue-200 dark:border-blue-500/30",
        };
      default:
        return { label: "صباحي ☀️", color: "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border-slate-200 dark:border-slate-700" };
    }
  };

  // Attendance status badge helper
  const getAttendanceBadge = (status?: EmployeeAttendanceStatus) => {
    switch (status) {
      case "PRESENT":
        return { label: "حاضر اليوم", color: "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30" };
      case "LEAVE":
        return { label: "إجازة رسمية", color: "bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/30" };
      case "ABSENT":
        return { label: "غائب اليوم", color: "bg-rose-500/15 text-rose-600 dark:text-rose-400 border-rose-500/30" };
      default:
        return { label: "لم يسجل بعد", color: "bg-slate-500/15 text-slate-600 dark:text-slate-400 border-slate-500/30" };
    }
  };

  // Summary Metrics
  const presentCount = employees.filter((e) => e.status === "PRESENT").length;
  const totalSalaries = employees.reduce((sum, e) => sum + (e.basicSalary || 0), 0);
  const totalPendingAdvances = employees.reduce(
    (sum, e) =>
      sum +
      (e.advances || [])
        .filter((a) => a.status === "PENDING_DEDUCTION")
        .reduce((s, a) => s + a.amount, 0),
    0
  );

  return (
    <div className="space-y-6 text-slate-900 dark:text-slate-100 font-sans w-full">
      {/* Toast Alert */}
      {toastMsg && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-5 py-3 rounded-2xl shadow-xl border border-blue-400/40 font-bold text-xs flex items-center gap-2 animate-bounce">
          <Sparkles className="w-4 h-4 text-amber-300" />
          <span>{toastMsg}</span>
        </div>
      )}

      {/* 1. UNIFIED SINGLE TOP BAR (شريط علوي متكامل وموحد يجمع التبويبات والمؤشرات والإجراءات داخل الإطار) */}
      <div className="w-full bg-white dark:bg-slate-900 p-2.5 sm:p-3 rounded-2xl sm:rounded-3xl border border-slate-200/90 dark:border-slate-800 shadow-xs flex flex-col md:flex-row items-stretch md:items-center justify-between gap-2.5 sm:gap-3 overflow-hidden">
        {/* Right side: Icon, Title & Employee Count */}
        <div className="flex items-center justify-between md:justify-start gap-2.5 shrink-0">
          <div className="flex items-center gap-2">
            <div className="relative w-9 h-9 sm:w-10 sm:h-10 rounded-xl sm:rounded-2xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-purple-600 text-white flex items-center justify-center font-black shadow-md shadow-blue-500/20 ring-2 ring-blue-500/20 dark:ring-blue-400/30 overflow-hidden shrink-0">
              <Users className="w-4 h-4 sm:w-5 sm:h-5 text-white drop-shadow-xs" strokeWidth={2.3} />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h2 className="text-xs sm:text-sm font-black text-slate-900 dark:text-white whitespace-nowrap">
                  إدارة الموظفين
                </h2>
                <span className="text-[10.5px] font-mono font-bold px-2 py-0.2 rounded-full bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
                  {employees.length}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Center: Module Navigation Tabs - Clear Icons & Labels */}
        <div className="flex items-center justify-center gap-1 bg-slate-100/90 dark:bg-slate-800/90 p-1 rounded-xl sm:rounded-2xl border border-slate-200/80 dark:border-slate-700/70 overflow-x-auto scrollbar-none shrink-0">
          {/* Tab 1: دليل الموظفين */}
          <button
            type="button"
            onClick={() => {
              setSelectedEmployee(null);
              setActiveTab("DIRECTORY");
            }}
            title="دليل وبطاقات الموظفين"
            className={`group flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-lg sm:rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === "DIRECTORY" && !selectedEmployee
                ? "bg-blue-600 text-white shadow-xs font-black"
                : "text-slate-700 dark:text-slate-300 hover:bg-white dark:hover:bg-slate-700 hover:text-blue-600"
            }`}
          >
            <div className={`p-0.5 sm:p-1 rounded-md ${activeTab === "DIRECTORY" && !selectedEmployee ? "bg-white/20 text-white" : "bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400"}`}>
              <Users className="w-3.5 h-3.5" />
            </div>
            <span className="font-black text-xs hidden lg:inline whitespace-nowrap">دليل الموظفين</span>
            <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-mono font-bold ${
              activeTab === "DIRECTORY" && !selectedEmployee ? "bg-white/25 text-white" : "bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300"
            }`}>
              {employees.length}
            </span>
          </button>

          {/* Tab 2: مسير الرواتب */}
          <button
            type="button"
            onClick={() => {
              setSelectedEmployee(null);
              setActiveTab("PAYROLL");
            }}
            title="مسير الرواتب الشهرية"
            className={`group flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-lg sm:rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === "PAYROLL" && !selectedEmployee
                ? "bg-blue-600 text-white shadow-xs font-black"
                : "text-slate-700 dark:text-slate-300 hover:bg-white dark:hover:bg-slate-700 hover:text-blue-600"
            }`}
          >
            <div className={`p-0.5 sm:p-1 rounded-md ${activeTab === "PAYROLL" && !selectedEmployee ? "bg-white/20 text-white" : "bg-sky-50 dark:bg-sky-950/40 text-sky-600 dark:text-sky-400"}`}>
              <Receipt className="w-3.5 h-3.5" />
            </div>
            <span className="font-black text-xs hidden lg:inline whitespace-nowrap">مسير الرواتب</span>
          </button>

          {/* Tab 3: السندات والسلف */}
          <button
            type="button"
            onClick={() => {
              setSelectedEmployee(null);
              setActiveTab("ADVANCES");
            }}
            title="سجل السندات والسلف"
            className={`group flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-lg sm:rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === "ADVANCES" && !selectedEmployee
                ? "bg-amber-600 text-white shadow-xs font-black"
                : "text-slate-700 dark:text-slate-300 hover:bg-white dark:hover:bg-slate-700 hover:text-amber-600"
            }`}
          >
            <div className={`p-0.5 sm:p-1 rounded-md ${activeTab === "ADVANCES" && !selectedEmployee ? "bg-white/20 text-white" : "bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400"}`}>
              <CreditCard className="w-3.5 h-3.5" />
            </div>
            <span className="font-black text-xs hidden lg:inline whitespace-nowrap">السندات والسلف</span>
          </button>

          {/* Tab 4: الخصومات والجزاءات */}
          <button
            type="button"
            onClick={() => {
              setSelectedEmployee(null);
              setActiveTab("PENALTIES");
            }}
            title="الخصومات والجزاءات والمكافآت"
            className={`group flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-lg sm:rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === "PENALTIES" && !selectedEmployee
                ? "bg-rose-600 text-white shadow-xs font-black"
                : "text-slate-700 dark:text-slate-300 hover:bg-white dark:hover:bg-slate-700 hover:text-rose-600"
            }`}
          >
            <div className={`p-0.5 sm:p-1 rounded-md ${activeTab === "PENALTIES" && !selectedEmployee ? "bg-white/20 text-white" : "bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400"}`}>
              <AlertTriangle className="w-3.5 h-3.5" />
            </div>
            <span className="font-black text-xs hidden lg:inline whitespace-nowrap">الخصومات</span>
          </button>

          {/* Tab 5: سجل الحركات */}
          <button
            type="button"
            onClick={() => {
              setSelectedEmployee(null);
              setActiveTab("OPERATIONS_LOG");
            }}
            title="سجل الحركات اليومية"
            className={`group flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-lg sm:rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === "OPERATIONS_LOG" && !selectedEmployee
                ? "bg-purple-600 text-white shadow-xs font-black"
                : "text-slate-700 dark:text-slate-300 hover:bg-white dark:hover:bg-slate-700 hover:text-purple-600"
            }`}
          >
            <div className={`p-0.5 sm:p-1 rounded-md ${activeTab === "OPERATIONS_LOG" && !selectedEmployee ? "bg-white/20 text-white" : "bg-purple-50 dark:bg-purple-950/40 text-purple-600 dark:text-purple-400"}`}>
              <History className="w-3.5 h-3.5" />
            </div>
            <span className="font-black text-xs hidden lg:inline whitespace-nowrap">سجل الحركات</span>
          </button>
        </div>

        {/* Left side: Quick Stats Summary Badges & Add Button safely within frame */}
        <div className="flex items-center justify-between md:justify-end gap-2 shrink-0">
          {/* WhatsApp Live Daemon Status Badge */}
          <WhatsAppLiveStatusBadge compact />

          {/* Quick Stats Badges */}
          <div className="flex items-center gap-1.5">
            <div className="flex items-center gap-1 px-2 py-1 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60 text-emerald-700 dark:text-emerald-400 text-[11px] sm:text-xs font-bold whitespace-nowrap">
              <UserCheck className="w-3 h-3 text-emerald-600 dark:text-emerald-400 shrink-0" />
              <span className="hidden xl:inline">الحضور:</span>
              <span className="font-mono font-black">{presentCount}</span>
            </div>

            <div className="flex items-center gap-1 px-2 py-1 rounded-lg bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-800/60 text-indigo-700 dark:text-indigo-400 text-[11px] sm:text-xs font-bold whitespace-nowrap">
              <Receipt className="w-3 h-3 text-indigo-600 dark:text-indigo-400 shrink-0" />
              <span className="hidden xl:inline">الرواتب:</span>
              <span className="font-mono font-black">{totalSalaries.toLocaleString()}</span>
            </div>
          </div>

          {/* Add Employee Button - perfectly constrained inside frame */}
          <button
            type="button"
            onClick={handleOpenAdd}
            className="px-3 py-1.5 sm:py-2 rounded-xl bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:from-blue-500 hover:to-indigo-500 text-white font-black text-xs shadow-sm shadow-blue-600/20 transition-all flex items-center justify-center gap-1.5 cursor-pointer active:scale-95 shrink-0 whitespace-nowrap"
          >
            <UserPlus className="w-3.5 h-3.5 shrink-0" />
            <span>إضافة موظف 👤</span>
          </button>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 4. DEDICATED FULL EMPLOYEE PAGE VIEW (صفحة الموظف المتكاملة) */}
      {/* ========================================================================= */}
      {selectedEmployee && (
        <div className="space-y-6 animate-fadeIn">
          {/* Breadcrumb Navigation / Back Button */}
          <div className="flex items-center justify-between bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
            <div className="flex items-center gap-2 text-xs font-bold text-slate-600 dark:text-slate-400">
              <button
                onClick={() => setSelectedEmployee(null)}
                className="hover:text-blue-600 flex items-center gap-1 cursor-pointer transition-colors"
              >
                <span>دليل الموظفين</span>
              </button>
              <ChevronRight className="w-4 h-4 text-slate-400 rotate-180" />
              <span className="text-blue-600 dark:text-sky-400 font-black">
                الملف الشامل: {selectedEmployee.name}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => window.print()}
                className="px-3.5 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-bold transition-all border border-slate-200 dark:border-slate-700 flex items-center gap-1.5 cursor-pointer"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>طباعة الملف 📄</span>
              </button>

              <button
                onClick={() => handleOpenEdit(selectedEmployee)}
                className="px-3.5 py-2 rounded-xl bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400 hover:bg-blue-100 text-xs font-bold transition-all border border-blue-200 dark:border-blue-800 flex items-center gap-1.5 cursor-pointer"
              >
                <Edit3 className="w-3.5 h-3.5" />
                <span>تعديل البيانات</span>
              </button>

              <button
                onClick={() => setDeletingEmployee(selectedEmployee)}
                className="px-3.5 py-2 rounded-xl bg-rose-50 text-rose-600 dark:bg-rose-900/30 dark:text-rose-400 hover:bg-rose-100 text-xs font-bold transition-all border border-rose-200 dark:border-rose-800 flex items-center gap-1.5 cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>حذف الموظف</span>
              </button>

              <button
                onClick={() => setSelectedEmployee(null)}
                className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-600 dark:text-slate-300 transition-colors cursor-pointer"
                title="إغلاق والعودة"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* HERO PROFILE CARD */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 shadow-xs relative overflow-hidden">
            <div className="flex flex-col md:flex-row items-center md:items-start justify-between gap-6">
              
              {/* Profile Picture & Main Details */}
              <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5 text-center sm:text-right">
                <div className="relative shrink-0">
                  {selectedEmployee.avatar ? (
                    <img
                      src={selectedEmployee.avatar}
                      alt={selectedEmployee.name}
                      className="w-28 h-28 sm:w-32 sm:h-32 rounded-3xl object-cover border-4 border-white dark:border-slate-800 shadow-xl ring-2 ring-blue-500/20"
                      referrerPolicy="no-referrer"
                    />
                  ) : (
                    <div className="w-28 h-28 sm:w-32 sm:h-32 rounded-3xl bg-gradient-to-tr from-slate-100 to-slate-200 dark:from-slate-800 dark:to-slate-700 text-slate-400 dark:text-slate-500 border-4 border-white dark:border-slate-800 shadow-xl flex flex-col items-center justify-center">
                      <User className="w-14 h-14" />
                      <span className="text-[10px] mt-1">بدون صورة</span>
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                    <span className="text-xs font-mono font-bold text-blue-600 dark:text-sky-400 bg-blue-50 dark:bg-sky-500/15 px-3 py-1 rounded-xl border border-blue-200 dark:border-sky-500/20">
                      {selectedEmployee.empCode}
                    </span>
                    <span className="px-3 py-1 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 text-xs font-bold">
                      {selectedEmployee.nationality || "يمني"}
                    </span>
                  </div>

                  <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                    {selectedEmployee.name}
                  </h1>

                  <p className="text-sm font-bold text-slate-500 dark:text-slate-400 flex items-center justify-center sm:justify-start gap-2">
                    <Briefcase className="w-4 h-4 text-blue-500" />
                    <span>المسمى الوظيفي: <strong className="text-slate-800 dark:text-slate-200">{selectedEmployee.roleTitle}</strong></span>
                  </p>

                  <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 pt-1">
                    <span className={`px-3 py-1 rounded-xl border text-xs font-bold ${getShiftBadge(selectedEmployee.shift, selectedEmployee.customShiftHours).color}`}>
                      الوردية: {getShiftBadge(selectedEmployee.shift, selectedEmployee.customShiftHours).label}
                    </span>

                    <button
                      onClick={(e) => handleToggleAttendance(selectedEmployee.id, e)}
                      className={`px-3 py-1 rounded-xl border text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer shadow-xs active:scale-95 ${
                        selectedEmployee.status === "PRESENT"
                          ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-400 border-emerald-300 dark:border-emerald-500/40"
                          : selectedEmployee.status === "LEAVE"
                          ? "bg-amber-50 text-amber-700 dark:bg-amber-500/15 dark:text-amber-400 border-amber-300 dark:border-amber-500/40"
                          : selectedEmployee.status === "ABSENT"
                          ? "bg-rose-50 text-rose-700 dark:bg-rose-500/15 dark:text-rose-400 border-rose-300 dark:border-rose-500/40"
                          : "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border-slate-300 dark:border-slate-700"
                      }`}
                    >
                      <Clock className="w-3.5 h-3.5" />
                      <span>{getAttendanceBadge(selectedEmployee.status).label} (تغيير 🔄)</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Financial Quick Box in Hero */}
              <div className="w-full md:w-auto p-4 bg-slate-50 dark:bg-slate-800/80 rounded-2xl border border-slate-200 dark:border-slate-700/80 text-center sm:text-right space-y-1">
                <div className="text-xs text-slate-500 dark:text-slate-400">الراتب الأساسي المعتمد</div>
                <div className="text-2xl font-black font-mono text-emerald-600 dark:text-emerald-400">
                  {selectedEmployee.basicSalary.toLocaleString()} <span className="text-xs font-normal">ر.ي</span>
                </div>
                {selectedEmployee.phone && (
                  <div className="pt-2 text-xs font-mono text-slate-600 dark:text-slate-300 flex items-center justify-center sm:justify-start gap-1.5">
                    <Phone className="w-3.5 h-3.5 text-emerald-500" />
                    <span>{selectedEmployee.phone}</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* PROFILE TABS */}
          <div className="flex items-center gap-2 bg-white dark:bg-slate-900 p-2 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs overflow-x-auto scrollbar-none">
            <button
              onClick={() => setProfileTab("INFO")}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                profileTab === "INFO"
                  ? "bg-blue-600 text-white shadow-md font-black"
                  : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
              }`}
            >
              <User className="w-4 h-4" />
              <span>البيانات الشخصية والوظيفية</span>
            </button>

            <button
              onClick={() => setProfileTab("FINANCIAL")}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                profileTab === "FINANCIAL"
                  ? "bg-blue-600 text-white shadow-md font-black"
                  : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
              }`}
            >
              <DollarSign className="w-4 h-4 text-emerald-400" />
              <span>الحسابات المالية ومسير الراتب</span>
            </button>

            <button
              onClick={() => setProfileTab("ADVANCES")}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                profileTab === "ADVANCES"
                  ? "bg-blue-600 text-white shadow-md font-black"
                  : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
              }`}
            >
              <CreditCard className="w-4 h-4 text-amber-400" />
              <span>سجل السندات والسلف ({selectedEmployee.advances?.length || 0})</span>
            </button>

            <button
              onClick={() => setProfileTab("PENALTIES")}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                profileTab === "PENALTIES"
                  ? "bg-blue-600 text-white shadow-md font-black"
                  : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
              }`}
            >
              <AlertTriangle className="w-4 h-4 text-rose-400" />
              <span>الخصومات والجزاءات والمكافآت ({selectedEmployee.penalties?.length || 0})</span>
            </button>

            <button
              onClick={() => setProfileTab("ATTENDANCE")}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                profileTab === "ATTENDANCE"
                  ? "bg-blue-600 text-white shadow-md font-black"
                  : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
              }`}
            >
              <Clock className="w-4 h-4 text-sky-400" />
              <span>سجل الحضور والدوام</span>
            </button>
          </div>

          {/* PROFILE TAB 1: PERSONAL & JOB INFO */}
          {profileTab === "INFO" && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                <div className="bg-white dark:bg-slate-900 p-4.5 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs">
                  <span className="text-xs text-slate-400 block mb-1">الاسم الرباعي الكامل</span>
                  <div className="text-sm font-black text-slate-900 dark:text-white">{selectedEmployee.name}</div>
                </div>

                <div className="bg-white dark:bg-slate-900 p-4.5 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs">
                  <span className="text-xs text-slate-400 block mb-1">المسمى الوظيفي</span>
                  <div className="text-sm font-bold text-blue-600 dark:text-sky-400">{selectedEmployee.roleTitle}</div>
                </div>

                <div className="bg-white dark:bg-slate-900 p-4.5 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs">
                  <span className="text-xs text-slate-400 block mb-1">الجنسية</span>
                  <div className="text-sm font-bold text-slate-800 dark:text-slate-200">{selectedEmployee.nationality || "يمني"}</div>
                </div>

                <div className="bg-white dark:bg-slate-900 p-4.5 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs">
                  <span className="text-xs text-slate-400 block mb-1">رقم الهوية / الإقامة</span>
                  <div className="text-sm font-bold font-mono text-slate-900 dark:text-white">
                    {selectedEmployee.idNumber || "غير مسجل"}
                  </div>
                </div>

                <div className="bg-white dark:bg-slate-900 p-4.5 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs">
                  <span className="text-xs text-slate-400 block mb-1">تاريخ انتهاء الهوية</span>
                  <div className="text-sm font-bold font-mono text-slate-800 dark:text-slate-200">
                    {selectedEmployee.idExpiryDate || "2027-12-31"}
                  </div>
                </div>

                <div className="bg-white dark:bg-slate-900 p-4.5 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs">
                  <span className="text-xs text-slate-400 block mb-1">رقم الهاتف للتواصل</span>
                  <div className="text-sm font-bold font-mono text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5">
                    <Phone className="w-3.5 h-3.5" />
                    <span>{selectedEmployee.phone || "غير مسجل"}</span>
                  </div>
                </div>

                <div className="bg-white dark:bg-slate-900 p-4.5 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs">
                  <span className="text-xs text-slate-400 block mb-1">نظام الوردية وساعات العمل</span>
                  <div className="text-xs font-bold text-slate-800 dark:text-slate-200 mt-1">
                    {getShiftBadge(selectedEmployee.shift, selectedEmployee.customShiftHours).label}
                  </div>
                </div>

                <div className="bg-white dark:bg-slate-900 p-4.5 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs">
                  <span className="text-xs text-slate-400 block mb-1">تاريخ الانضمام للعمل</span>
                  <div className="text-sm font-bold font-mono text-slate-800 dark:text-slate-200">
                    {selectedEmployee.joinDate || "2025-01-01"}
                  </div>
                </div>

                <div className="bg-white dark:bg-slate-900 p-4.5 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs">
                  <span className="text-xs text-slate-400 block mb-1">الراتب الأساسي الشهري</span>
                  <div className="text-sm font-black font-mono text-emerald-600 dark:text-emerald-400">
                    {selectedEmployee.basicSalary.toLocaleString()} ر.ي
                  </div>
                </div>
              </div>

              {selectedEmployee.notes && (
                <div className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs">
                  <span className="text-xs font-bold text-slate-500 dark:text-slate-400 block mb-2">ملاحظات إضافية وسجلات خاصة بالموظف:</span>
                  <p className="text-xs text-slate-800 dark:text-slate-200 leading-relaxed">
                    {selectedEmployee.notes}
                  </p>
                </div>
              )}
            </div>
          )}

          {/* PROFILE TAB 2: FINANCIAL */}
          {profileTab === "FINANCIAL" && (
            <div className="space-y-4">
              {(() => {
                const totalAdvances = (selectedEmployee.advances || [])
                  .filter((a) => a.status === "PENDING_DEDUCTION")
                  .reduce((s, a) => s + a.amount, 0);

                const totalDeductions = (selectedEmployee.penalties || [])
                  .filter((p) => p.type === "DEDUCTION")
                  .reduce((s, p) => s + (p.amount || 0), 0);

                const totalBonuses = (selectedEmployee.penalties || [])
                  .filter((p) => p.type === "BONUS")
                  .reduce((s, p) => s + (p.amount || 0), 0);

                const gross = selectedEmployee.basicSalary + totalBonuses;
                const netPay = Math.max(0, gross - totalAdvances - totalDeductions);

                return (
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="bg-white dark:bg-slate-900 p-4.5 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs">
                        <span className="text-xs text-slate-400">الراتب الأساسي</span>
                        <div className="text-lg font-black font-mono text-slate-900 dark:text-white mt-1">
                          {selectedEmployee.basicSalary.toLocaleString()} ر.ي
                        </div>
                      </div>

                      <div className="bg-white dark:bg-slate-900 p-4.5 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs">
                        <span className="text-xs text-amber-500 font-bold">السلف النقدية المعلقة</span>
                        <div className="text-lg font-black font-mono text-amber-600 dark:text-amber-400 mt-1">
                          -{totalAdvances.toLocaleString()} ر.ي
                        </div>
                      </div>

                      <div className="bg-white dark:bg-slate-900 p-4.5 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs">
                        <span className="text-xs text-rose-500 font-bold">إجمالي الخصومات</span>
                        <div className="text-lg font-black font-mono text-rose-600 dark:text-rose-400 mt-1">
                          -{totalDeductions.toLocaleString()} ر.ي
                        </div>
                      </div>

                      <div className="bg-white dark:bg-slate-900 p-4.5 rounded-3xl border border-emerald-200 dark:border-emerald-800/60 shadow-xs bg-emerald-50/20">
                        <span className="text-xs text-emerald-600 dark:text-emerald-400 font-bold">صافي المستحق للصرف</span>
                        <div className="text-xl font-black font-mono text-emerald-600 dark:text-emerald-400 mt-1">
                          {netPay.toLocaleString()} ر.ي
                        </div>
                      </div>
                    </div>

                    <div className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-xs">
                      <div>
                        <h4 className="text-sm font-black text-slate-900 dark:text-white">إصدار وإرسال سند صرف راتب للموظف</h4>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                          إرسال كشف الاستحقاق المالي فورياً لرقم العامل عبر واتساب مع باركود QR وطباعة السند
                        </p>
                      </div>
                      <div className="flex items-center gap-2.5 w-full sm:w-auto">
                        <button
                          onClick={() => {
                            const voucher = buildVoucher({
                              type: "DISBURSEMENT_SALARY",
                              employee: selectedEmployee,
                              amount: netPay,
                              reason: `مسير واستحقاق الراتب الشهري الصافي (${netPay.toLocaleString()} ر.ي)`,
                            });
                            setActiveVoucher(voucher);
                            setIsVoucherModalOpen(true);
                          }}
                          className="flex-1 sm:flex-none px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md flex items-center justify-center gap-2 cursor-pointer transition-all"
                        >
                          <MessageSquare className="w-4 h-4" />
                          <span>إرسال سند واتساب + QR 💬</span>
                        </button>
                        
                        <button
                          onClick={() => window.print()}
                          className="px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold text-xs shadow-xs flex items-center justify-center gap-2 cursor-pointer transition-all border border-slate-200 dark:border-slate-700"
                        >
                          <Receipt className="w-4 h-4" />
                          <span>طباعة السند 🧾</span>
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })()}
            </div>
          )}

          {/* PROFILE TAB 3: ADVANCES */}
          {profileTab === "ADVANCES" && (
            <div className="space-y-4">
              <div className="flex items-center justify-between bg-white dark:bg-slate-900 p-4 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs">
                <div>
                  <h4 className="text-sm font-black text-slate-900 dark:text-white">سندات وسلف {selectedEmployee.name}</h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">سجل المبالغ النقدية المصروفة كسلف ومتابعة استقطاعها</p>
                </div>
                <button
                  onClick={() => {
                    setAdvanceEmpId(selectedEmployee.id);
                    setIsAdvanceModalOpen(true);
                  }}
                  className="px-4 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold flex items-center gap-2 transition-colors cursor-pointer shadow-md"
                >
                  <Plus className="w-4 h-4" />
                  <span>منح سلفة جديدة للموظف 💵</span>
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {(selectedEmployee.advances || []).map((adv) => (
                  <div
                    key={adv.id}
                    className="bg-white dark:bg-slate-900 p-4.5 rounded-3xl border border-slate-200 dark:border-slate-800 flex items-center justify-between shadow-xs"
                  >
                    <div>
                      <div className="text-sm font-bold text-slate-900 dark:text-white">{adv.reason}</div>
                      <div className="text-xs text-slate-400 mt-1 font-mono">تاريخ الصرف: {adv.date}</div>
                    </div>
                    <div className="text-left font-mono">
                      <div className="text-base font-black text-amber-600 dark:text-amber-400">
                        {adv.amount.toLocaleString()} ر.ي
                      </div>
                      <span className="inline-block mt-1 px-2.5 py-0.5 rounded-full text-[10.5px] font-bold bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400 border border-amber-200 dark:border-amber-500/20">
                        قيد الاستقطاع
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              {(!selectedEmployee.advances || selectedEmployee.advances.length === 0) && (
                <div className="text-center py-12 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 text-slate-400 text-xs">
                  لا توجد أي سلف مسجلة على الموظف حالياً
                </div>
              )}
            </div>
          )}

          {/* PROFILE TAB 4: PENALTIES */}
          {profileTab === "PENALTIES" && (
            <div className="space-y-4">
              <div className="flex items-center justify-between bg-white dark:bg-slate-900 p-4 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs">
                <div>
                  <h4 className="text-sm font-black text-slate-900 dark:text-white">الجزاءات والإنذارات والمكافآت</h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">توثيق القرارات الإدارية الخاصة بالموظف</p>
                </div>
                <button
                  onClick={() => {
                    setPenaltyEmpId(selectedEmployee.id);
                    setIsPenaltyModalOpen(true);
                  }}
                  className="px-4 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold flex items-center gap-2 transition-colors cursor-pointer shadow-md"
                >
                  <Plus className="w-4 h-4" />
                  <span>تسجيل إجراء أو مكافأة 📝</span>
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {(selectedEmployee.penalties || []).map((pen) => (
                  <div
                    key={pen.id}
                    className="bg-white dark:bg-slate-900 p-4.5 rounded-3xl border border-slate-200 dark:border-slate-800 flex items-center justify-between shadow-xs"
                  >
                    <div>
                      <div className="text-sm font-bold text-slate-900 dark:text-white">{pen.reason}</div>
                      <div className="text-xs text-slate-400 mt-1">
                        التاريخ: <span className="font-mono">{pen.date}</span> | المعتمد: {pen.approvedBy}
                      </div>
                    </div>
                    <div className="text-left font-mono">
                      {pen.type === "WARNING" ? (
                        <span className="px-3 py-1 rounded-xl bg-amber-50 text-amber-700 dark:bg-amber-500/20 dark:text-amber-400 border border-amber-200 dark:border-amber-500/30 text-xs font-bold">
                          إنذار إداري 📝
                        </span>
                      ) : pen.type === "BONUS" ? (
                        <span className="text-sm font-black text-emerald-600 dark:text-emerald-400">
                          +{pen.amount?.toLocaleString()} ر.ي مكافأة 🌟
                        </span>
                      ) : (
                        <span className="text-sm font-black text-rose-600 dark:text-rose-400">
                          -{pen.amount?.toLocaleString()} ر.ي خصم ⚠️
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {(!selectedEmployee.penalties || selectedEmployee.penalties.length === 0) && (
                <div className="text-center py-12 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 text-slate-400 text-xs">
                  سجل الموظف نظيف تماماً وخالٍ من أي جزاءات أو خصومات 👏
                </div>
              )}
            </div>
          )}

          {/* PROFILE TAB 5: ATTENDANCE */}
          {profileTab === "ATTENDANCE" && (
            <div className="space-y-4">
              <div className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
                <div>
                  <h4 className="text-sm font-black text-slate-900 dark:text-white">حالة حضور الدوام اليومي</h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    وقت تسجيل الدخول: {selectedEmployee.checkInTime || "لم يسجل بعد"}
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      storeService.recordEmployeeAttendance(selectedEmployee.id, "PRESENT");
                      refreshEmployees();
                      showToast("تم تسجيل حضور الموظف اليوم بنجاح ✅");
                    }}
                    className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs cursor-pointer shadow-xs"
                  >
                    تسجيل حضور ✅
                  </button>
                  <button
                    onClick={() => {
                      storeService.recordEmployeeAttendance(selectedEmployee.id, "LEAVE");
                      refreshEmployees();
                      showToast("تم تسجيل إجازة للموظف اليوم 🏖️");
                    }}
                    className="px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs cursor-pointer shadow-xs"
                  >
                    تسجيل إجازة 🏖️
                  </button>
                  <button
                    onClick={() => {
                      storeService.recordEmployeeAttendance(selectedEmployee.id, "ABSENT");
                      refreshEmployees();
                      showToast("تم تسجيل غياب للموظف اليوم ❌");
                    }}
                    className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs cursor-pointer shadow-xs"
                  >
                    تسجيل غياب ❌
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 1: DIRECTORY & CARDS VIEW (دليل الموظفين) */}
      {/* ========================================================================= */}
      {activeTab === "DIRECTORY" && !selectedEmployee && (
        <div className="space-y-4">
          {/* Search Bar */}
          <div className="flex flex-col md:flex-row items-center justify-between gap-3 bg-white dark:bg-slate-900 p-3.5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
            <div className="relative flex-1 w-full">
              <Search className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="ابحث باسم الموظف الرباعي، المسمى الوظيفي، رقم الهوية، أو الهاتف..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/80 rounded-xl pr-10 pl-4 py-2 text-xs text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all text-right"
                dir="rtl"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1 cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 shrink-0">
              <span className="font-semibold">المعروض:</span>
              <span className="font-bold text-slate-800 dark:text-slate-200 font-mono">
                {filteredEmployees.length} من {employees.length}
              </span>
            </div>
          </div>

          {/* EMPLOYEES GRID / EMPTY STATE */}
          {filteredEmployees.length === 0 ? (
            <div className="text-center py-20 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-8 sm:p-12 relative overflow-hidden shadow-xs">
              <div className="relative z-10 max-w-md mx-auto">
                <div className="w-20 h-20 rounded-3xl bg-gradient-to-tr from-blue-600/10 via-indigo-600/10 to-purple-600/10 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-800 flex items-center justify-center mx-auto mb-4 shadow-md">
                  <Users className="w-10 h-10 drop-shadow-xs" strokeWidth={1.8} />
                </div>

                <h4 className="text-lg font-black text-slate-900 dark:text-white">
                  {employees.length === 0 ? "لا يوجد موظفون في سجلات المتجر بعد" : "لا توجد نتائج مطابقة لبحثك"}
                </h4>
                
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 leading-relaxed">
                  {employees.length === 0
                    ? "سجل الموظفين فارغ حالياً. ابدأ بإضافة موظف جديد لتسجيل بياناته، متابعة حضوره، مسير رواتبه، وسلفه المالية بكل سهولة."
                    : "لم نتمكن من العثور على أي موظف يطابق خيارات البحث الحالية. يمكنك مسح البحث أو إضافة موظف جديد."}
                </p>

                <div className="mt-6 flex flex-col sm:flex-row items-center justify-center gap-3">
                  <button
                    onClick={handleOpenAdd}
                    className="w-full sm:w-auto px-6 py-3 rounded-2xl bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:from-blue-500 hover:to-indigo-500 text-white text-xs font-black transition-all shadow-xl shadow-blue-600/25 inline-flex items-center justify-center gap-2 cursor-pointer active:scale-95 hover:scale-102"
                  >
                    <UserPlus className="w-4 h-4" />
                    <span>إضافة أول موظف للمتجر 👤</span>
                  </button>

                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery("")}
                      className="w-full sm:w-auto px-4 py-3 rounded-2xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-bold transition-all border border-slate-200 dark:border-slate-700 inline-flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <span>إعادة تعيين البحث</span>
                    </button>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-5">
              {filteredEmployees.map((emp) => {
                return (
                  <div
                    key={emp.id}
                    className="bg-white dark:bg-slate-900 hover:shadow-2xl hover:border-blue-500/50 rounded-3xl border border-slate-200 dark:border-slate-800 overflow-hidden transition-all duration-300 flex flex-col justify-between group shadow-xs hover:-translate-y-1"
                  >
                    {/* TOP HALF: Photo completely filling the upper section */}
                    <div className="relative w-full h-52 sm:h-56 bg-slate-100 dark:bg-slate-800 overflow-hidden">
                      {emp.avatar ? (
                        <img
                          src={emp.avatar}
                          alt={emp.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                          referrerPolicy="no-referrer"
                        />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-tr from-slate-200 via-slate-100 to-slate-200 dark:from-slate-800 dark:via-slate-900 dark:to-slate-800 flex flex-col items-center justify-center text-slate-400 dark:text-slate-500 group-hover:scale-105 transition-transform duration-500">
                          <div className="w-16 h-16 rounded-2xl bg-white/50 dark:bg-white/5 flex items-center justify-center shadow-xs">
                            <User className="w-9 h-9" strokeWidth={1.5} />
                          </div>
                          <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 mt-2">
                            لا توجد صورة
                          </span>
                        </div>
                      )}
                      
                      {/* Subtle Overlay gradient */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent pointer-events-none" />
                    </div>

                    {/* BOTTOM HALF: Employee Name + Job Role Title + Action Buttons */}
                    <div className="p-4 flex flex-col flex-1 justify-between gap-3.5">
                      {/* Employee Name & Job Role Title */}
                      <div className="text-center py-0.5">
                        <h3
                          className="text-base font-black text-slate-900 dark:text-white line-clamp-1 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors"
                          title={emp.name}
                        >
                          {emp.name}
                        </h3>
                        <p className="text-xs font-bold text-blue-600 dark:text-blue-400 mt-1 line-clamp-1">
                          {emp.roleTitle}
                        </p>
                      </div>

                      {/* Card Actions: View Profile, Edit, Delete */}
                      <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center gap-2 w-full">
                        <button
                          onClick={() => {
                            setSelectedEmployee(emp);
                            setProfileTab("INFO");
                          }}
                          className="flex-1 py-2.5 px-3 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-xs transition-all shadow-xs flex items-center justify-center gap-1.5 cursor-pointer active:scale-95 hover:shadow-md hover:shadow-blue-500/20"
                        >
                          <FileText className="w-3.5 h-3.5" />
                          <span>عرض الملف</span>
                        </button>

                        <button
                          onClick={(e) => handleOpenEdit(emp, e)}
                          title="تعديل بيانات الموظف"
                          className="p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-blue-50 dark:hover:bg-blue-500/20 text-slate-600 dark:text-slate-400 hover:text-blue-600 border border-slate-200 dark:border-slate-700 transition-all cursor-pointer"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>

                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setDeletingEmployee(emp);
                          }}
                          title="حذف الموظف"
                          className="p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-rose-50 dark:hover:bg-rose-500/20 text-slate-400 hover:text-rose-600 border border-slate-200 dark:border-slate-700 transition-all cursor-pointer"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 2: PAYROLL TABLE (مسير الرواتب) */}
      {/* ========================================================================= */}
      {activeTab === "PAYROLL" && !selectedEmployee && (
        <div className="space-y-4">
          <div className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-xs">
            <div>
              <h3 className="text-base font-black text-slate-900 dark:text-white flex items-center gap-2">
                <Receipt className="w-5 h-5 text-blue-500" />
                <span>مسير الرواتب الشهرية</span>
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                حساب الرواتب الأساسية - استقطاعات السندات والسلف والخصومات
              </p>
            </div>
            <button
              onClick={() => window.print()}
              className="px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs font-bold border border-slate-200 dark:border-slate-700 flex items-center gap-2 transition-colors cursor-pointer"
            >
              <Printer className="w-4 h-4" />
              <span>طباعة وتصدير المسير 📄</span>
            </button>
          </div>

          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-right text-xs" dir="rtl">
                <thead className="bg-slate-50 dark:bg-slate-800/80 text-slate-600 dark:text-slate-400 font-bold border-b border-slate-200 dark:border-slate-800">
                  <tr>
                    <th className="p-4">اسم الموظف</th>
                    <th className="p-4">المسمى الوظيفي</th>
                    <th className="p-4">الوردية</th>
                    <th className="p-4">الراتب الأساسي</th>
                    <th className="p-4 text-amber-600 dark:text-amber-400">خصم السلف</th>
                    <th className="p-4 text-rose-600 dark:text-rose-400">الجزاءات والغياب</th>
                    <th className="p-4 text-emerald-600 dark:text-emerald-400 font-black">صافي المستحق</th>
                    <th className="p-4 text-center">الإجراء</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 font-medium">
                  {employees.map((emp) => {
                    const totalAdvances = (emp.advances || [])
                      .filter((a) => a.status === "PENDING_DEDUCTION")
                      .reduce((s, a) => s + a.amount, 0);

                    const totalDeductions = (emp.penalties || [])
                      .filter((p) => p.type === "DEDUCTION")
                      .reduce((s, p) => s + (p.amount || 0), 0);

                    const totalBonuses = (emp.penalties || [])
                      .filter((p) => p.type === "BONUS")
                      .reduce((s, p) => s + (p.amount || 0), 0);

                    const gross = emp.basicSalary + totalBonuses;
                    const netPay = Math.max(0, gross - totalAdvances - totalDeductions);
                    const shiftBadge = getShiftBadge(emp.shift, emp.customShiftHours);

                    return (
                      <tr key={emp.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
                        <td className="p-4">
                          <div className="flex items-center gap-2.5">
                            {emp.avatar ? (
                              <img
                                src={emp.avatar}
                                alt={emp.name}
                                className="w-9 h-9 rounded-xl object-cover border border-slate-200 dark:border-slate-700"
                                referrerPolicy="no-referrer"
                              />
                            ) : (
                              <div className="w-9 h-9 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-500">
                                <User className="w-4 h-4" />
                              </div>
                            )}
                            <div>
                              <div className="font-bold text-slate-900 dark:text-white">{emp.name}</div>
                              <div className="text-[10px] text-blue-600 dark:text-sky-400 font-mono font-bold">{emp.empCode}</div>
                            </div>
                          </div>
                        </td>
                        <td className="p-4 text-slate-600 dark:text-slate-300 font-semibold">{emp.roleTitle}</td>
                        <td className="p-4">
                          <span className={`px-2 py-0.5 rounded-lg border text-[10.5px] font-bold ${shiftBadge.color}`}>
                            {shiftBadge.label}
                          </span>
                        </td>
                        <td className="p-4 font-bold font-mono text-slate-800 dark:text-slate-200">
                          {emp.basicSalary.toLocaleString()} ر.ي
                        </td>
                        <td className="p-4 font-mono text-amber-600 dark:text-amber-400 font-bold">
                          {totalAdvances > 0 ? `-${totalAdvances.toLocaleString()} ر.ي` : "0"}
                        </td>
                        <td className="p-4 font-mono text-rose-600 dark:text-rose-400 font-bold">
                          {totalDeductions > 0 ? `-${totalDeductions.toLocaleString()} ر.ي` : "0"}
                        </td>
                        <td className="p-4 font-mono text-emerald-600 dark:text-emerald-400 font-black text-sm">
                          {netPay.toLocaleString()} ر.ي
                        </td>
                        <td className="p-4 text-center">
                          <div className="flex items-center justify-center gap-1.5">
                            <button
                              onClick={() => {
                                setSelectedEmployee(emp);
                                setProfileTab("FINANCIAL");
                              }}
                              className="px-2.5 py-1.5 rounded-lg bg-blue-50 text-blue-600 dark:bg-blue-600/20 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-600/30 border border-blue-200 dark:border-blue-500/30 text-[11px] font-bold transition-all cursor-pointer whitespace-nowrap"
                            >
                              الملف 🧾
                            </button>
                            <button
                              onClick={() => {
                                const voucher = buildVoucher({
                                  type: "DISBURSEMENT_SALARY",
                                  employee: emp,
                                  amount: netPay,
                                  reason: `مسير واستحقاق الراتب الشهري الصافي (${netPay.toLocaleString()} ر.ي)`,
                                });
                                setActiveVoucher(voucher);
                                setIsVoucherModalOpen(true);
                              }}
                              title="إرسال سند مسير الراتب عبر واتساب وباركود QR"
                              className="p-1.5 rounded-lg bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400 hover:bg-emerald-100 dark:hover:bg-emerald-900/50 border border-emerald-200 dark:border-emerald-800 text-[11px] font-bold transition-all flex items-center gap-1 cursor-pointer"
                            >
                              <MessageSquare className="w-3.5 h-3.5" />
                              <span className="hidden xl:inline text-[10px]">واتساب</span>
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
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 3: ADVANCES VIEW (سجل السندات والسلف) */}
      {/* ========================================================================= */}
      {activeTab === "ADVANCES" && !selectedEmployee && (
        <div className="space-y-4">
          <div className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-xs">
            <div>
              <h3 className="text-base font-black text-slate-900 dark:text-white flex items-center gap-2">
                <CreditCard className="w-5 h-5 text-amber-500" />
                <span>سجل سندات السلف والعهد المالية</span>
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                إدارة ومتابعة السلف النقدية الممنوحة للموظفين وجدولة استقطاعها من الراتب
              </p>
            </div>
            <button
              onClick={() => {
                setAdvanceEmpId(employees[0]?.id || "");
                setIsAdvanceModalOpen(true);
              }}
              disabled={employees.length === 0}
              className="px-4 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-500 disabled:opacity-50 text-white text-xs font-bold flex items-center gap-2 transition-colors cursor-pointer shadow-md"
            >
              <Plus className="w-4 h-4" />
              <span>منح سلفة جديدة 💵</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {employees.flatMap((emp) =>
              (emp.advances || []).map((adv) => (
                <div
                  key={adv.id}
                  className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 flex items-center justify-between shadow-xs"
                >
                  <div className="flex items-center gap-3">
                    {emp.avatar ? (
                      <img
                        src={emp.avatar}
                        alt={emp.name}
                        className="w-10 h-10 rounded-xl object-cover border border-slate-200 dark:border-slate-700"
                        referrerPolicy="no-referrer"
                      />
                    ) : (
                      <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-500">
                        <User className="w-5 h-5" />
                      </div>
                    )}
                    <div>
                      <div className="text-sm font-bold text-slate-900 dark:text-white">{emp.name}</div>
                      <div className="text-xs text-slate-500 dark:text-slate-400">{adv.reason}</div>
                      <div className="text-[10px] text-slate-400 mt-1">
                        تاريخ الصرف: {adv.date}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <div className="text-left font-mono">
                      <div className="text-sm font-black text-amber-600 dark:text-amber-400">
                        {adv.amount.toLocaleString()} ر.ي
                      </div>
                      <span className="inline-block mt-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400 border border-amber-200 dark:border-amber-500/20">
                        قيد الاستقطاع
                      </span>
                    </div>

                    <button
                      onClick={() => {
                        const voucher = buildVoucher({
                          type: "DISBURSEMENT_ADVANCE",
                          employee: emp,
                          amount: adv.amount,
                          reason: adv.reason,
                        });
                        setActiveVoucher(voucher);
                        setIsVoucherModalOpen(true);
                      }}
                      title="عرض وإرسال سند الصرف عبر واتساب وباركود QR"
                      className="p-2 rounded-xl bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400 hover:bg-emerald-100 dark:hover:bg-emerald-900/50 border border-emerald-200 dark:border-emerald-800 text-xs font-bold transition-all flex items-center gap-1 cursor-pointer"
                    >
                      <MessageSquare className="w-4 h-4 text-emerald-600" />
                      <QrCode className="w-3.5 h-3.5 text-emerald-500" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>

          {employees.every((e) => !e.advances || e.advances.length === 0) && (
            <div className="text-center py-14 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 text-xs shadow-xs">
              لا توجد سلف أو عهد مالية مسجلة حالياً
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 4: PENALTIES & BONUSES (الخصومات والجزاءات) */}
      {/* ========================================================================= */}
      {activeTab === "PENALTIES" && !selectedEmployee && (
        <div className="space-y-4">
          <div className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-xs">
            <div>
              <h3 className="text-base font-black text-slate-900 dark:text-white flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-rose-500" />
                <span>سجل العقوبات، الإنذارات، والمكافآت</span>
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                توثيق الجزاءات الإدارية والمكافآت التشجيعية للكادر الوظيفي
              </p>
            </div>
            <button
              onClick={() => {
                setPenaltyEmpId(employees[0]?.id || "");
                setIsPenaltyModalOpen(true);
              }}
              disabled={employees.length === 0}
              className="px-4 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 disabled:opacity-50 text-white text-xs font-bold flex items-center gap-2 transition-colors cursor-pointer shadow-md"
            >
              <Plus className="w-4 h-4" />
              <span>إضافة قرار أو خصم 📝</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {employees.flatMap((emp) =>
              (emp.penalties || []).map((pen) => (
                <div
                  key={pen.id}
                  className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 flex items-center justify-between shadow-xs"
                >
                  <div className="flex items-center gap-3">
                    {emp.avatar ? (
                      <img
                        src={emp.avatar}
                        alt={emp.name}
                        className="w-10 h-10 rounded-xl object-cover border border-slate-200 dark:border-slate-700"
                        referrerPolicy="no-referrer"
                      />
                    ) : (
                      <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-500">
                        <User className="w-5 h-5" />
                      </div>
                    )}
                    <div>
                      <div className="text-sm font-bold text-slate-900 dark:text-white">{emp.name}</div>
                      <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{pen.reason}</div>
                      <div className="text-[10px] text-slate-400 mt-1">
                        التاريخ: {pen.date} | المعتمد: {pen.approvedBy}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <div className="text-left font-mono">
                      {pen.type === "WARNING" ? (
                        <span className="px-3 py-1 rounded-xl bg-amber-50 text-amber-700 dark:bg-amber-500/20 dark:text-amber-400 border border-amber-200 dark:border-amber-500/30 text-xs font-bold">
                          إنذار إداري
                        </span>
                      ) : pen.type === "BONUS" ? (
                        <span className="text-sm font-black text-emerald-600 dark:text-emerald-400">
                          +{pen.amount?.toLocaleString()} ر.ي مكافأة 🌟
                        </span>
                      ) : (
                        <span className="text-sm font-black text-rose-600 dark:text-rose-400">
                          -{pen.amount?.toLocaleString()} ر.ي خصم ⚠️
                        </span>
                      )}
                    </div>

                    <button
                      onClick={() => {
                        const voucherType = pen.type === "BONUS" ? "BONUS_REWARD" : "DEDUCTION_PENALTY";
                        const voucher = buildVoucher({
                          type: voucherType,
                          employee: emp,
                          amount: pen.amount || 0,
                          reason: `${pen.type === "WARNING" ? "إنذار إداري: " : pen.type === "BONUS" ? "مكافأة تشجيعية: " : "سند خصم مالي: "}${pen.reason}`,
                        });
                        setActiveVoucher(voucher);
                        setIsVoucherModalOpen(true);
                      }}
                      title="عرض وإرسال سند الخصم أو المكافأة عبر واتساب وباركود QR"
                      className="p-2 rounded-xl bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400 hover:bg-emerald-100 dark:hover:bg-emerald-900/50 border border-emerald-200 dark:border-emerald-800 text-xs font-bold transition-all flex items-center gap-1 cursor-pointer"
                    >
                      <MessageSquare className="w-4 h-4 text-emerald-600" />
                      <QrCode className="w-3.5 h-3.5 text-emerald-500" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>

          {employees.every((e) => !e.penalties || e.penalties.length === 0) && (
            <div className="text-center py-14 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 text-xs shadow-xs">
              لا توجد جزاءات أو خصومات مسجلة حتى الآن. سجل الموظفين نظيف ومثالي 👏
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 5: OPERATIONS LOG (سجل الحركات) */}
      {/* ========================================================================= */}
      {activeTab === "OPERATIONS_LOG" && !selectedEmployee && (
        <div className="space-y-4">
          <div className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs">
            <h3 className="text-base font-black text-slate-900 dark:text-white flex items-center gap-2">
              <History className="w-5 h-5 text-purple-500" />
              <span>السجل الكامل لعمليات وإجراءات الموظفين</span>
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              سجل تدقيق لكافة الحركات اليومية (تسجيل الحضور، صرف الرواتب، السلف، والقرارات)
            </p>
          </div>

          <div className="space-y-2.5">
            {employees.length === 0 ? (
              <div className="text-center py-12 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 text-slate-400 text-xs">
                لا توجد حركات مسجلة بعد
              </div>
            ) : (
              employees.slice(0, 8).map((emp, idx) => (
                <div
                  key={idx}
                  className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs shadow-xs"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-xl bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold font-mono">
                      {idx + 1}
                    </div>
                    <div>
                      <div className="font-bold text-slate-900 dark:text-white">
                        تسجيل حضور اليوم لـ <span className="text-blue-600 dark:text-sky-400">{emp.name}</span>
                      </div>
                      <div className="text-[11px] text-slate-500 dark:text-slate-400">
                        المسمى: {emp.roleTitle} | الوردية: {getShiftBadge(emp.shift, emp.customShiftHours).label}
                      </div>
                    </div>
                  </div>
                  <span className="text-[11px] text-slate-400 font-mono">اليوم 08:30 ص</span>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: DELETE EMPLOYEE CONFIRMATION (حذف موظف) */}
      {/* ========================================================================= */}
      {deletingEmployee && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto animate-fadeIn">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl w-full max-w-md text-slate-900 dark:text-white shadow-2xl overflow-hidden my-auto p-6 space-y-4 text-center" dir="rtl">
            <div className="w-16 h-16 rounded-3xl bg-rose-50 dark:bg-rose-900/30 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-800 flex items-center justify-center mx-auto shadow-md">
              <Trash2 className="w-8 h-8" />
            </div>

            <div>
              <h3 className="text-lg font-black text-slate-900 dark:text-white">
                تأكيد حذف الموظف نهائياً
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 leading-relaxed">
                هل أنت متأكد من حذف الموظف <strong className="text-rose-600 dark:text-rose-400 font-bold">{deletingEmployee.name}</strong> نهائياً من سجلات الكادر وطاقم العمل؟ لن تتمكن من التراجع عن هذه الخطوة.
              </p>
            </div>

            <div className="pt-3 flex items-center gap-3 justify-center">
              <button
                type="button"
                onClick={() => setDeletingEmployee(null)}
                className="flex-1 py-3 rounded-2xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold text-xs transition-colors cursor-pointer"
              >
                إلغاء
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                className="flex-1 py-3 rounded-2xl bg-rose-600 hover:bg-rose-500 text-white font-black text-xs shadow-lg shadow-rose-600/30 transition-all cursor-pointer active:scale-95 flex items-center justify-center gap-1.5"
              >
                <Trash2 className="w-4 h-4" />
                <span>نعم، حذف الموظف</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: ADD / EDIT EMPLOYEE FORM (نافذة إضافة / تعديل موظف) */}
      {/* ========================================================================= */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5 overflow-y-auto animate-fadeIn">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl w-full max-w-xl text-slate-900 dark:text-white shadow-2xl overflow-hidden my-auto max-h-[92vh] flex flex-col">
            
            {/* Modal Header */}
            <div className="bg-slate-50 dark:bg-slate-800/80 p-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold">
                  <UserPlus className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-black text-slate-900 dark:text-white">
                    {editingEmpId ? "تعديل بيانات الموظف" : "إضافة موظف جديد لطاقم العمل"}
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    تسجيل الاسم الرباعي، المسمى الوظيفي، الراتب، وساعات الوردية
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="p-2 rounded-xl bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 text-slate-600 dark:text-slate-300 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveEmployee} className="p-6 space-y-4 text-xs overflow-y-auto flex-1" dir="rtl">
              
              {/* 1. EMPLOYEE PHOTO UPLOAD (رفع من الجهاز) */}
              <div>
                <label className="block text-slate-700 dark:text-slate-300 mb-1.5 font-bold">
                  صورة الموظف الشخصية (رفع من الجهاز)
                </label>
                <div className="flex items-center gap-3.5 p-3.5 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-200 dark:border-slate-700">
                  {/* Photo Preview */}
                  <div className="relative shrink-0">
                    {formData.avatar ? (
                      <div className="relative">
                        <img
                          src={formData.avatar}
                          alt="Employee avatar"
                          className="w-16 h-16 rounded-2xl object-cover border-2 border-blue-500 shadow-md"
                          referrerPolicy="no-referrer"
                        />
                        <button
                          type="button"
                          onClick={() => setFormData({ ...formData, avatar: "" })}
                          className="absolute -top-1.5 -right-1.5 w-6 h-6 rounded-full bg-rose-600 text-white flex items-center justify-center hover:bg-rose-700 shadow-md cursor-pointer"
                          title="حذف الصورة"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ) : (
                      <div className="w-16 h-16 rounded-2xl bg-slate-200 dark:bg-slate-700 border-2 border-dashed border-slate-300 dark:border-slate-600 text-slate-400 flex flex-col items-center justify-center gap-1">
                        <ImageIcon className="w-6 h-6" />
                        <span className="text-[9px]">بدون صورة</span>
                      </div>
                    )}
                  </div>

                  {/* Upload Actions */}
                  <div className="flex-1 space-y-1.5">
                    <label className="cursor-pointer py-2.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs transition-colors flex items-center justify-center gap-2 shadow-xs">
                      <Upload className="w-4 h-4" />
                      <span>اختر صورة من جهازك 📷</span>
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            const reader = new FileReader();
                            reader.onloadend = () => {
                              if (typeof reader.result === "string") {
                                setFormData({ ...formData, avatar: reader.result });
                              }
                            };
                            reader.readAsDataURL(file);
                          }
                        }}
                      />
                    </label>
                    <p className="text-[11px] text-slate-400">
                      يمكنك رفع صورة شخصية للموظف بصيغة PNG أو JPG
                    </p>
                  </div>
                </div>
              </div>

              {/* 2. FORM FIELDS GRID */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                {/* اسم الموظف الرباعي */}
                <div className="sm:col-span-2">
                  <label className="block text-slate-700 dark:text-slate-300 mb-1 font-bold">
                    اسم الموظف الرباعي *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="مثال: براق محمد علي الجالفي"
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-blue-500 font-medium"
                  />
                </div>

                {/* المسمى الوظيفي (يكتب كتابة) */}
                <div>
                  <label className="block text-slate-700 dark:text-slate-300 mb-1 font-bold">
                    المسمى الوظيفي *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.roleTitle}
                    onChange={(e) => setFormData({ ...formData, roleTitle: e.target.value })}
                    placeholder="مثال: كاشير، محاسب، مباشر صالة، شيف..."
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-blue-500 font-medium"
                  />
                </div>

                {/* الجنسية (تكتب كتابة) */}
                <div>
                  <label className="block text-slate-700 dark:text-slate-300 mb-1 font-bold">
                    الجنسية
                  </label>
                  <input
                    type="text"
                    value={formData.nationality}
                    onChange={(e) => setFormData({ ...formData, nationality: e.target.value })}
                    placeholder="مثال: يمني، سعودي، مصري..."
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-blue-500 font-medium"
                  />
                </div>

                {/* الراتب الأساسي (فارغ ويكتب كتابة) */}
                <div>
                  <label className="block text-slate-700 dark:text-slate-300 mb-1 font-bold">
                    الراتب الأساسي (ر.ي) *
                  </label>
                  <input
                    type="number"
                    required
                    value={formData.basicSalary === 0 ? "" : formData.basicSalary}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        basicSalary: e.target.value === "" ? ("" as unknown as number) : Number(e.target.value),
                      })
                    }
                    placeholder="أدخل الراتب الأساسي (ر.ي)"
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-blue-500 font-mono font-bold"
                  />
                </div>

                {/* رقم الهاتف */}
                <div>
                  <label className="block text-slate-700 dark:text-slate-300 mb-1 font-bold">
                    رقم الهاتف للتواصل
                  </label>
                  <input
                    type="text"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="مثال: 771234567"
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-blue-500 font-mono"
                  />
                </div>

                {/* رقم الهوية / الإقامة */}
                <div className="sm:col-span-2">
                  <label className="block text-slate-700 dark:text-slate-300 mb-1 font-bold">
                    رقم الهوية / الإقامة
                  </label>
                  <input
                    type="text"
                    value={formData.idNumber}
                    onChange={(e) => setFormData({ ...formData, idNumber: e.target.value })}
                    placeholder="مثال: 2596873818"
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-blue-500 font-mono"
                  />
                </div>
              </div>

              {/* 3. SHIFT SELECTOR (الوردية: صباحي، مسائي، يوم كامل، مخصص) */}
              <div className="space-y-2 pt-2 border-t border-slate-200 dark:border-slate-800">
                <label className="block text-slate-700 dark:text-slate-300 font-bold">
                  الوردية ونظام الدوام
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, shift: "MORNING" })}
                    className={`p-3 rounded-2xl border text-center transition-all flex flex-col items-center gap-1.5 cursor-pointer ${
                      formData.shift === "MORNING"
                        ? "bg-amber-50 dark:bg-amber-950/40 border-amber-500 text-amber-700 dark:text-amber-300 font-black shadow-xs scale-102"
                        : "bg-slate-50 dark:bg-slate-800/80 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:border-slate-400"
                    }`}
                  >
                    <Sun className="w-5 h-5 text-amber-500" />
                    <span className="text-xs">صباحي</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, shift: "EVENING" })}
                    className={`p-3 rounded-2xl border text-center transition-all flex flex-col items-center gap-1.5 cursor-pointer ${
                      formData.shift === "EVENING"
                        ? "bg-indigo-50 dark:bg-indigo-950/40 border-indigo-500 text-indigo-700 dark:text-indigo-300 font-black shadow-xs scale-102"
                        : "bg-slate-50 dark:bg-slate-800/80 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:border-slate-400"
                    }`}
                  >
                    <Moon className="w-5 h-5 text-indigo-500" />
                    <span className="text-xs">مسائي</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, shift: "FULL_DAY" })}
                    className={`p-3 rounded-2xl border text-center transition-all flex flex-col items-center gap-1.5 cursor-pointer ${
                      formData.shift === "FULL_DAY"
                        ? "bg-purple-50 dark:bg-purple-950/40 border-purple-500 text-purple-700 dark:text-purple-300 font-black shadow-xs scale-102"
                        : "bg-slate-50 dark:bg-slate-800/80 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:border-slate-400"
                    }`}
                  >
                    <Clock className="w-5 h-5 text-purple-500" />
                    <span className="text-xs">يوم كامل</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, shift: "CUSTOM" })}
                    className={`p-3 rounded-2xl border text-center transition-all flex flex-col items-center gap-1.5 cursor-pointer ${
                      formData.shift === "CUSTOM"
                        ? "bg-blue-50 dark:bg-blue-950/40 border-blue-500 text-blue-700 dark:text-blue-300 font-black shadow-xs scale-102"
                        : "bg-slate-50 dark:bg-slate-800/80 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:border-slate-400"
                    }`}
                  >
                    <Timer className="w-5 h-5 text-blue-500" />
                    <span className="text-xs">مخصص</span>
                  </button>
                </div>

                {/* Custom Hours fields if CUSTOM is selected */}
                {formData.shift === "CUSTOM" && (
                  <div className="p-3.5 bg-blue-50/70 dark:bg-blue-950/30 rounded-2xl border border-blue-200 dark:border-blue-800/60 mt-2 space-y-2 animate-fadeIn">
                    <span className="text-[11px] font-bold text-blue-900 dark:text-blue-200 block">
                      تحديد ساعات الوردية المخصصة:
                    </span>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[11px] text-slate-600 dark:text-slate-400 mb-1">
                          من الساعة:
                        </label>
                        <input
                          type="text"
                          value={formData.customShiftFrom}
                          onChange={(e) => setFormData({ ...formData, customShiftFrom: e.target.value })}
                          placeholder="مثال: 08:00 ص"
                          className="w-full bg-white dark:bg-slate-900 border border-blue-200 dark:border-blue-800 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] text-slate-600 dark:text-slate-400 mb-1">
                          إلى الساعة:
                        </label>
                        <input
                          type="text"
                          value={formData.customShiftTo}
                          onChange={(e) => setFormData({ ...formData, customShiftTo: e.target.value })}
                          placeholder="مثال: 04:00 م"
                          className="w-full bg-white dark:bg-slate-900 border border-blue-200 dark:border-blue-800 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white"
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* 4. NOTES */}
              <div>
                <label className="block text-slate-700 dark:text-slate-300 mb-1 font-bold">
                  ملاحظات إضافية
                </label>
                <textarea
                  rows={2}
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  placeholder="أي ملاحظات حول الموظف أو صلاحياته..."
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-2.5 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-blue-500"
                />
              </div>

              {/* 5. MODAL ACTIONS */}
              <div className="pt-4 border-t border-slate-200 dark:border-slate-800 flex items-center justify-end gap-2.5 shrink-0">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold text-xs transition-colors cursor-pointer"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-black text-xs shadow-md transition-all cursor-pointer active:scale-95"
                >
                  {editingEmpId ? "حفظ التعديلات" : "إضافة الموظف 👤"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: ADVANCE ISSUANCE FORM (منح سلفة) */}
      {/* ========================================================================= */}
      {isAdvanceModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5 overflow-y-auto animate-fadeIn">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl w-full max-w-md text-slate-900 dark:text-white shadow-2xl overflow-hidden my-auto">
            <div className="bg-slate-50 dark:bg-slate-800/80 p-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
              <h3 className="text-base font-black text-slate-900 dark:text-white flex items-center gap-2">
                <CreditCard className="w-5 h-5 text-amber-500" />
                <span>تسجيل سند صرف سلفة نقدية</span>
              </h3>
              <button
                onClick={() => setIsAdvanceModalOpen(false)}
                className="p-1.5 rounded-xl bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 text-slate-600 dark:text-slate-300 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAddAdvanceSubmit} className="p-6 space-y-4 text-xs" dir="rtl">
              <div>
                <label className="block text-slate-600 dark:text-slate-400 mb-1 font-semibold">الموظف المستفيد</label>
                <select
                  value={advanceEmpId}
                  onChange={(e) => setAdvanceEmpId(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 dark:text-white"
                >
                  {employees.map((e) => (
                    <option key={e.id} value={e.id}>
                      {e.name} ({e.empCode})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-600 dark:text-slate-400 mb-1 font-semibold">مبلغ السلفة (ر.ي)</label>
                <input
                  type="number"
                  required
                  value={advanceAmount}
                  onChange={(e) => setAdvanceAmount(Number(e.target.value))}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 dark:text-white font-mono font-bold"
                />
              </div>

              <div>
                <label className="block text-slate-600 dark:text-slate-400 mb-1 font-semibold">السبب أو البيان</label>
                <input
                  type="text"
                  required
                  value={advanceReason}
                  onChange={(e) => setAdvanceReason(e.target.value)}
                  placeholder="مثال: سلفة طارئة، إيجار..."
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 dark:text-white"
                />
              </div>

              <div className="pt-3 border-t border-slate-200 dark:border-slate-800 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setIsAdvanceModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold cursor-pointer"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-bold shadow-md cursor-pointer"
                >
                  تسجيل السلفة 💵
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: PENALTY / BONUS ISSUANCE FORM */}
      {/* ========================================================================= */}
      {isPenaltyModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5 overflow-y-auto animate-fadeIn">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl w-full max-w-md text-slate-900 dark:text-white shadow-2xl overflow-hidden my-auto">
            <div className="bg-slate-50 dark:bg-slate-800/80 p-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
              <h3 className="text-base font-black text-slate-900 dark:text-white flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-rose-500" />
                <span>تسجيل خصم أو إنذار أو مكافأة</span>
              </h3>
              <button
                onClick={() => setIsPenaltyModalOpen(false)}
                className="p-1.5 rounded-xl bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 text-slate-600 dark:text-slate-300 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAddPenaltySubmit} className="p-6 space-y-4 text-xs" dir="rtl">
              <div>
                <label className="block text-slate-600 dark:text-slate-400 mb-1 font-semibold">الموظف المعني</label>
                <select
                  value={penaltyEmpId}
                  onChange={(e) => setPenaltyEmpId(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 dark:text-white"
                >
                  {employees.map((e) => (
                    <option key={e.id} value={e.id}>
                      {e.name} ({e.empCode})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-600 dark:text-slate-400 mb-1 font-semibold">نوع الإجراء</label>
                <select
                  value={penaltyType}
                  onChange={(e) => setPenaltyType(e.target.value as any)}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 dark:text-white"
                >
                  <option value="DEDUCTION">خصم مالي من الراتب ⚠️</option>
                  <option value="WARNING">إنذار إداري كتابي 📝</option>
                  <option value="BONUS">مكافأة تشجيعية مالية 🌟</option>
                </select>
              </div>

              {penaltyType !== "WARNING" && (
                <div>
                  <label className="block text-slate-600 dark:text-slate-400 mb-1 font-semibold">المبلغ (ر.ي)</label>
                  <input
                    type="number"
                    required
                    value={penaltyAmount}
                    onChange={(e) => setPenaltyAmount(Number(e.target.value))}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 dark:text-white font-mono font-bold"
                  />
                </div>
              )}

              <div>
                <label className="block text-slate-600 dark:text-slate-400 mb-1 font-semibold">السبب والبيان *</label>
                <input
                  type="text"
                  required
                  value={penaltyReason}
                  onChange={(e) => setPenaltyReason(e.target.value)}
                  placeholder="مثال: تأخر عن الوردية، أداء متميز..."
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 dark:text-white"
                />
              </div>

              <div className="pt-3 border-t border-slate-200 dark:border-slate-800 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setIsPenaltyModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold cursor-pointer"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold shadow-md cursor-pointer"
                >
                  اعتماد الإجراء ✍️
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: ELECTRONIC WHATSAPP VOUCHER MODAL (سند واتساب الإلكتروني والباركود) */}
      {/* ========================================================================= */}
      {activeVoucher && (
        <MerchantWhatsAppVoucherModal
          voucher={activeVoucher}
          isOpen={isVoucherModalOpen}
          onClose={() => {
            setIsVoucherModalOpen(false);
            setActiveVoucher(null);
          }}
          onSentSuccess={(msg) => showToast(msg)}
        />
      )}
    </div>
  );
};
