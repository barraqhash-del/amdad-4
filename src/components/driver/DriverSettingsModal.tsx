import React, { useState } from "react";
import { DriverAccount } from "../../types";
import { storeService } from "../../services/storeService";
import { LocationPickerModal } from "../ui/LocationPickerModal";
import {
  Truck,
  User,
  Phone,
  MapPin,
  Lock,
  CheckCircle2,
  X,
  Compass,
  FileText,
  ShieldCheck,
} from "lucide-react";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  currentAccount: DriverAccount;
}

export const DriverSettingsModal: React.FC<Props> = ({
  isOpen,
  onClose,
  currentAccount,
}) => {
  const [driverName, setDriverName] = useState(currentAccount.driverName || "");
  const [username, setUsername] = useState(currentAccount.username || "");
  const [phone, setPhone] = useState(currentAccount.phone || "");
  const [vehicleNo, setVehicleNo] = useState(currentAccount.vehicleNo || "");
  const [vehicleType, setVehicleType] = useState(currentAccount.vehicleType || "دينا شحن جملة");
  const [notes, setNotes] = useState(currentAccount.notes || "");
  const [city, setCity] = useState(currentAccount.city || "صنعاء");
  const [district, setDistrict] = useState(currentAccount.district || "مركز التوزيع");
  const [fullAddress, setFullAddress] = useState(currentAccount.fullAddress || "");
  const [password, setPassword] = useState("");
  const [lat, setLat] = useState<number>(currentAccount.lat || 15.3694);
  const [lng, setLng] = useState<number>(currentAccount.lng || 44.1910);

  const [isLocationPickerOpen, setIsLocationPickerOpen] = useState(false);
  const [savedSuccessMsg, setSavedSuccessMsg] = useState("");

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    storeService.updateDriverAccountDetails(currentAccount.id, {
      driverName,
      username,
      phone,
      vehicleNo,
      vehicleType,
      notes,
      city,
      district,
      fullAddress,
      password: password.trim() ? password.trim() : undefined,
      lat,
      lng,
    });

    setSavedSuccessMsg("تم حفظ وتحديث بيانات وإعدادات السائق والمركبة بنجاح 🟢");
    setTimeout(() => {
      setSavedSuccessMsg("");
      onClose();
    }, 1200);
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

  return (
    <>
      <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4 dir-rtl overflow-y-auto">
        <div className="relative w-full max-w-2xl bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden my-6 animate-in fade-in zoom-in duration-200">
          {/* Header */}
          <div className="flex items-center justify-between p-5 bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white border-b border-indigo-900/50">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-2xl bg-indigo-600 text-amber-300 border border-indigo-400/40">
                <Truck className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-extrabold text-white text-base sm:text-lg">
                  إعدادات وتعديل بيانات السائق ({currentAccount.driverName})
                </h3>
                <p className="text-xs text-indigo-200">
                  تحديث بيانات المركبة والجوال وتحديد موقع الانطلاق على الخريطة
                </p>
              </div>
            </div>

            <button
              onClick={onClose}
              type="button"
              className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="p-6 space-y-5 text-xs">
            {savedSuccessMsg && (
              <div className="p-3.5 rounded-2xl bg-emerald-500 text-white font-extrabold text-xs text-center animate-bounce shadow-md">
                {savedSuccessMsg}
              </div>
            )}

            {/* Basic Driver Info */}
            <div className="space-y-3">
              <h4 className="font-black text-slate-900 dark:text-white text-xs flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-2">
                <User className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                <span>البيانات الشخصية وبيانات المركبة</span>
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-extrabold text-slate-700 dark:text-slate-300 mb-1">
                    اسم السائق الثلاثي *
                  </label>
                  <input
                    type="text"
                    required
                    value={driverName}
                    onChange={(e) => setDriverName(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-bold focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="block font-extrabold text-slate-700 dark:text-slate-300 mb-1">
                    اسم المستخدم للدخول (Username)
                  </label>
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-mono font-bold focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="block font-extrabold text-slate-700 dark:text-slate-300 mb-1">
                    رقم الجوال للتواصل *
                  </label>
                  <input
                    type="text"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-mono font-bold focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="block font-extrabold text-slate-700 dark:text-slate-300 mb-1">
                    رقم اللوحة / لوحة المركبة *
                  </label>
                  <input
                    type="text"
                    required
                    value={vehicleNo}
                    onChange={(e) => setVehicleNo(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-mono font-bold focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="block font-extrabold text-slate-700 dark:text-slate-300 mb-1">
                    نوع وشاحنة التوصيل *
                  </label>
                  <input
                    type="text"
                    required
                    value={vehicleType}
                    onChange={(e) => setVehicleType(e.target.value)}
                    placeholder="دينا نقل، شاحنة 5 طن، فيان مغلق..."
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-bold focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="block font-extrabold text-amber-700 dark:text-amber-400 mb-1">
                    تغيير كلمة المرور (اختياري)
                  </label>
                  <input
                    type="password"
                    placeholder="كلمة مرور جديدة..."
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl border border-amber-200 dark:border-amber-900/50 bg-amber-50/50 dark:bg-amber-950/20 text-slate-900 dark:text-white font-bold focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block font-extrabold text-slate-700 dark:text-slate-300 mb-1">
                    ملاحظات الحركة والأسطول
                  </label>
                  <input
                    type="text"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="سائق معتمد - خط سير المحافظات..."
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-bold focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>
            </div>

            {/* Address & Map Picker Section */}
            <div className="space-y-3 pt-2">
              <h4 className="font-black text-slate-900 dark:text-white text-xs flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2">
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-emerald-600" />
                  <span>منطقة التغطية وموقع الانطلاق على الخريطة 🗺️</span>
                </div>
                <button
                  type="button"
                  onClick={() => setIsLocationPickerOpen(true)}
                  className="px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-[11px] shadow-sm flex items-center gap-1.5 transition-transform active:scale-95"
                >
                  <Compass className="w-3.5 h-3.5" />
                  <span>فتح الخريطة التفاعلية 📍</span>
                </button>
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-extrabold text-slate-700 dark:text-slate-300 mb-1">
                    المحافظة الرئيسية
                  </label>
                  <input
                    type="text"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-bold focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="block font-extrabold text-slate-700 dark:text-slate-300 mb-1">
                    المديرية / نطاق الحركة
                  </label>
                  <input
                    type="text"
                    value={district}
                    onChange={(e) => setDistrict(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-bold focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block font-extrabold text-slate-700 dark:text-slate-300 mb-1">
                    العنوان ومقر تحرك الشاحنة
                  </label>
                  <input
                    type="text"
                    value={fullAddress}
                    onChange={(e) => setFullAddress(e.target.value)}
                    placeholder="مواقف أسطول نقل الجملة..."
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-bold focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              {/* Map Coordinates Badge Card */}
              <div className="p-3.5 rounded-2xl bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-800 flex items-center justify-between gap-3">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-xl bg-indigo-600 text-white shadow-xs">
                    <MapPin className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="font-extrabold text-indigo-900 dark:text-indigo-300 block text-xs">
                      إحداثيات موقع السائق الحالية:
                    </span>
                    <span className="font-mono font-bold text-[11px] text-indigo-700 dark:text-indigo-400">
                      GPS: {lat}, {lng}
                    </span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setIsLocationPickerOpen(true)}
                  className="px-3 py-1.5 rounded-xl bg-white dark:bg-slate-900 hover:bg-indigo-100 text-indigo-800 dark:text-indigo-300 font-extrabold border border-indigo-300 dark:border-indigo-700 text-xs transition-colors"
                >
                  تعديل الموقع على الخريطة
                </button>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="pt-4 flex items-center justify-end gap-2 border-t border-slate-100 dark:border-slate-800">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold hover:bg-slate-200"
              >
                إلغاء
              </button>
              <button
                type="submit"
                className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-black shadow-md flex items-center gap-2 cursor-pointer"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>حفظ إعدادات السائق 💾</span>
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Location Map Picker Sub-modal */}
      <LocationPickerModal
        isOpen={isLocationPickerOpen}
        onClose={() => setIsLocationPickerOpen(false)}
        onConfirmLocation={handleConfirmLocation}
        initialLat={lat}
        initialLng={lng}
        initialCity={city}
        initialDistrict={district}
        title="تحديد موقع الانطلاق للسائق على الخريطة"
      />
    </>
  );
};
