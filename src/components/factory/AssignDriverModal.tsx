import React, { useState, useEffect } from "react";
import { SubOrder, DriverInfo, DriverRosterItem } from "../../types";
import { storeService } from "../../services/storeService";
import {
  Truck,
  X,
  Phone,
  User,
  Check,
  Plus,
  Users,
  Info,
  ChevronDown,
  Trash2,
} from "lucide-react";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  subOrder: SubOrder;
  onOpenDriverRosterManager?: () => void;
}

export const AssignDriverModal: React.FC<Props> = ({
  isOpen,
  onClose,
  subOrder,
  onOpenDriverRosterManager,
}) => {
  const [drivers, setDrivers] = useState<DriverRosterItem[]>([]);
  const [selectedDriverId, setSelectedDriverId] = useState<string>("CUSTOM");

  const [driverName, setDriverName] = useState("");
  const [driverPhone, setDriverPhone] = useState("");
  const [vehicleNo, setVehicleNo] = useState("");
  const [vehicleType, setVehicleType] = useState("");
  const [batchRouteNote, setBatchRouteNote] = useState("رحلة توصيل مجمعة - تسليم متتابع");
  const [saveToRoster, setSaveToRoster] = useState(false);
  const [targetStatus, setTargetStatus] = useState<"PROCESSING" | "OUT_FOR_DELIVERY">("PROCESSING");

  useEffect(() => {
    if (isOpen) {
      // Get driver accounts belonging strictly to this suborder's factory
      const driverAccs = storeService.getDriverAccountsByFactoryId(subOrder.factoryId);
      const approvedAccs = driverAccs.filter((d) => d.approvalStatus === "APPROVED");
      
      const factoryDrivers: DriverRosterItem[] = approvedAccs.map((a) => ({
        id: a.id,
        name: a.driverName,
        phone: a.phone,
        vehicleNo: a.vehicleNo,
        vehicleType: a.vehicleType,
        factoryId: a.factoryId,
        notes: a.notes,
        createdAt: a.createdAt || new Date().toISOString(),
      }));

      const loaded = factoryDrivers.length > 0 
        ? factoryDrivers 
        : storeService.getDrivers().filter((d) => !d.factoryId || d.factoryId === subOrder.factoryId);

      setDrivers(loaded);

      // Default target status based on current suborder status
      if (subOrder.status === "READY_FOR_DISPATCH" || subOrder.status === "OUT_FOR_DELIVERY") {
        setTargetStatus("OUT_FOR_DELIVERY");
      } else {
        setTargetStatus("PROCESSING");
      }

      if (loaded.length > 0) {
        setSelectedDriverId(loaded[0].id);
        setDriverName(loaded[0].name);
        setDriverPhone(loaded[0].phone);
        setVehicleNo(loaded[0].vehicleNo);
        setVehicleType(loaded[0].vehicleType);
      } else {
        setSelectedDriverId("CUSTOM");
        setDriverName("");
        setDriverPhone("");
        setVehicleNo("");
        setVehicleType("دينا 5 طن");
      }
    }
  }, [isOpen, subOrder]);

  if (!isOpen) return null;

  const handleSelectDriver = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value;
    setSelectedDriverId(val);

    if (val === "CUSTOM") {
      setDriverName("");
      setDriverPhone("");
      setVehicleNo("");
      setVehicleType("دينا 5 طن");
    } else {
      const found = drivers.find((d) => d.id === val);
      if (found) {
        setDriverName(found.name);
        setDriverPhone(found.phone);
        setVehicleNo(found.vehicleNo);
        setVehicleType(found.vehicleType);
      }
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // If user clicked "Save driver to roster" and it's a custom input
    if (saveToRoster && selectedDriverId === "CUSTOM" && driverName.trim()) {
      storeService.addDriver({
        name: driverName.trim(),
        phone: driverPhone.trim(),
        vehicleNo: vehicleNo.trim(),
        vehicleType: vehicleType.trim() || "دينا 5 طن",
        notes: batchRouteNote,
      });
    }

    const driver: DriverInfo = {
      name: driverName,
      phone: driverPhone,
      vehicleNo,
      vehicleType,
      batchRouteNote,
    };

    const statusNote =
      targetStatus === "OUT_FOR_DELIVERY"
        ? `تم شحن الطلبية وتوجيه السائق ${driverName} (${vehicleType}) للانطلاق والتوصيل المباشر`
        : `تم تعيين السائق ${driverName} (${vehicleType}) للطلبية مسبقاً (قيد التجهيز بالمصنع)`;

    storeService.updateSubOrderStatus(subOrder.id, targetStatus, driver, statusNote);

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 dir-rtl overflow-y-auto">
      <div className="relative w-full max-w-lg rounded-3xl bg-white dark:bg-slate-900 shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden my-8">
        
        {/* Header */}
        <div className="flex items-center justify-between p-5 bg-gradient-to-r from-indigo-900 via-slate-900 to-indigo-950 text-white">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-indigo-600/30 border border-indigo-400/30 rounded-2xl">
              <Truck className="w-6 h-6 text-indigo-300" />
            </div>
            <div>
              <h3 className="font-extrabold text-base sm:text-lg tracking-tight">
                تعيين سائق وتوجيه الشحنة للتوصيل
              </h3>
              <p className="text-xs text-indigo-200">
                شحنة رقم <span className="font-mono font-bold text-white">{subOrder.id}</span> - {subOrder.wholesaler.storeName}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-indigo-200 hover:text-white rounded-xl hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Informational Banner regarding Multiple Batch Orders */}
        <div className="p-4 bg-amber-50 dark:bg-amber-950/40 border-b border-amber-200 dark:border-amber-900/50 flex items-start gap-3 text-xs text-amber-900 dark:text-amber-200">
          <Info className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
          <div className="space-y-0.5">
            <span className="font-bold block">رحلة شحن مجمعة (عدة طلبات):</span>
            <p className="text-[11px] leading-relaxed text-amber-800 dark:text-amber-300">
              السائق يحمل عدة طلبيات في نفس الرحلة، ويقوم بالتسليم بالتتابع بحسب مسار التوصيل.
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          
          {/* Driver Fleet Selector Dropdown */}
          <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 space-y-2">
            <div className="flex items-center justify-between text-xs font-bold text-slate-800 dark:text-slate-200">
              <span className="flex items-center gap-1.5">
                <Users className="w-4 h-4 text-indigo-600" />
                <span>اختر من أسطول السائقين المسجلين:</span>
              </span>
              {onOpenDriverRosterManager && (
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onOpenDriverRosterManager();
                  }}
                  className="text-indigo-600 dark:text-indigo-400 hover:underline text-[11px] font-bold"
                >
                  إدارة قائمة السائقين ⚙️
                </button>
              )}
            </div>

            <select
              value={selectedDriverId}
              onChange={handleSelectDriver}
              className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs font-bold text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:outline-none"
            >
              {drivers.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.name} — {d.vehicleType} ({d.vehicleNo})
                </option>
              ))}
              <option value="CUSTOM">➕ إضافة / كتابة بيانات سائق جديد يدوياً</option>
            </select>
          </div>

          {/* Form Fields */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              اسم السائق:
            </label>
            <div className="relative">
              <User className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                required
                value={driverName}
                onChange={(e) => setDriverName(e.target.value)}
                placeholder="اسم السائق الثلاثي"
                className="w-full pr-10 pl-3 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-bold text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              رقم جوال السائق:
            </label>
            <div className="relative">
              <Phone className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                required
                value={driverPhone}
                onChange={(e) => setDriverPhone(e.target.value)}
                placeholder="77xxxxxxx"
                className="w-full pr-10 pl-3 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-bold text-slate-900 dark:text-white dir-ltr text-right focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                رقم لوحة الشاحنة:
              </label>
              <input
                type="text"
                required
                value={vehicleNo}
                onChange={(e) => setVehicleNo(e.target.value)}
                placeholder="أ ب ج 1234"
                className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-bold text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                نوع المركبة:
              </label>
              <input
                type="text"
                required
                value={vehicleType}
                onChange={(e) => setVehicleType(e.target.value)}
                placeholder="دينا 5 طن / تريلة / فان"
                className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-bold text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              ملاحظات خط المسار أو التوصيل المجمع (اختياري):
            </label>
            <input
              type="text"
              value={batchRouteNote}
              onChange={(e) => setBatchRouteNote(e.target.value)}
              placeholder="مثال: خط توزيع صنعاء - ذمار - تعز - تسليم متتابع"
              className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-medium text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:outline-none"
            />
          </div>

          {/* Target Status Option */}
          <div className="p-3.5 rounded-2xl bg-indigo-50/70 dark:bg-slate-800/80 border border-indigo-200 dark:border-slate-700 space-y-2">
            <label className="block text-xs font-bold text-slate-800 dark:text-slate-200">
              حالة الطلبية بعد إسناد السائق:
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs font-bold">
              <label
                className={`p-2.5 rounded-xl border cursor-pointer flex items-center gap-2 transition-all ${
                  targetStatus === "PROCESSING"
                    ? "bg-white dark:bg-slate-900 border-indigo-500 text-indigo-700 dark:text-indigo-300 shadow-xs"
                    : "bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600"
                }`}
              >
                <input
                  type="radio"
                  name="targetStatusRadio"
                  checked={targetStatus === "PROCESSING"}
                  onChange={() => setTargetStatus("PROCESSING")}
                  className="text-indigo-600"
                />
                <div>
                  <div>إبقاء الطلبية قيد التجهيز 📦</div>
                  <span className="text-[10px] text-slate-500 block font-normal">
                    ليصل إشعار للسائق مبكراً يتتبع الشحنة ويتفقدها قبل الانطلاق
                  </span>
                </div>
              </label>

              <label
                className={`p-2.5 rounded-xl border cursor-pointer flex items-center gap-2 transition-all ${
                  targetStatus === "OUT_FOR_DELIVERY"
                    ? "bg-white dark:bg-slate-900 border-indigo-500 text-indigo-700 dark:text-indigo-300 shadow-xs"
                    : "bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600"
                }`}
              >
                <input
                  type="radio"
                  name="targetStatusRadio"
                  checked={targetStatus === "OUT_FOR_DELIVERY"}
                  onChange={() => setTargetStatus("OUT_FOR_DELIVERY")}
                  className="text-indigo-600"
                />
                <div>
                  <div>تحويل إلى قيد التوصيل 🚚</div>
                  <span className="text-[10px] text-slate-500 block font-normal">
                    الشاحنة جاهزة تماماً وانطلقت للتسليم المباشر للتاجر
                  </span>
                </div>
              </label>
            </div>
          </div>

          {selectedDriverId === "CUSTOM" && (
            <div className="flex items-center gap-2 pt-1">
              <input
                type="checkbox"
                id="saveDriverToRoster"
                checked={saveToRoster}
                onChange={(e) => setSaveToRoster(e.target.checked)}
                className="w-4 h-4 text-indigo-600 rounded border-slate-300 focus:ring-indigo-500"
              />
              <label
                htmlFor="saveDriverToRoster"
                className="text-xs font-bold text-slate-700 dark:text-slate-300 cursor-pointer"
              >
                حفظ هذا السائق في قائمة أسطول المصنع للاستخدام المستقبلي
              </label>
            </div>
          )}

          <div className="pt-3 border-t border-slate-200 dark:border-slate-800 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold text-xs"
            >
              إلغاء
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-md transition-colors flex items-center gap-1.5"
            >
              <Check className="w-4 h-4" />
              <span>تأكيد وحفظ بيانات السائق 🚚</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
