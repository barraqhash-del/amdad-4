import React, { useState } from "react";
import { FactoryAccount } from "../../types";
import { storeService } from "../../services/storeService";
import { LocationPickerModal } from "../ui/LocationPickerModal";
import {
  Factory as FactoryIcon,
  User,
  Phone,
  Mail,
  MapPin,
  Building2,
  FileText,
  Lock,
  CheckCircle2,
  X,
  Compass,
  Clock,
  DollarSign,
  Tag,
} from "lucide-react";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  currentAccount: FactoryAccount;
}

export const FactorySettingsModal: React.FC<Props> = ({
  isOpen,
  onClose,
  currentAccount,
}) => {
  const [factoryName, setFactoryName] = useState(currentAccount.factoryName || "");
  const [ownerName, setOwnerName] = useState(currentAccount.ownerName || "");
  const [username, setUsername] = useState(currentAccount.username || "");
  const [phone, setPhone] = useState(currentAccount.phone || "");
  const [email, setEmail] = useState(currentAccount.email || "");
  const [commercialReg, setCommercialReg] = useState(currentAccount.commercialReg || "");
  const [taxNumber, setTaxNumber] = useState(currentAccount.taxNumber || "");
  const [category, setCategory] = useState(currentAccount.category || "أغذية ومشروبات");
  const [minOrderValue, setMinOrderValue] = useState<number>(currentAccount.minOrderValue || 1000);
  const [preparationHours, setPreparationHours] = useState<number>(currentAccount.avgPreparationHours || 24);
  const [city, setCity] = useState(currentAccount.city || "صنعاء");
  const [district, setDistrict] = useState(currentAccount.district || "المنطقة الصناعية");
  const [fullAddress, setFullAddress] = useState(currentAccount.fullAddress || "");
  const [password, setPassword] = useState("");
  const [lat, setLat] = useState<number>(currentAccount.lat || 15.3694);
  const [lng, setLng] = useState<number>(currentAccount.lng || 44.1910);

  const [isLocationPickerOpen, setIsLocationPickerOpen] = useState(false);
  const [savedSuccessMsg, setSavedSuccessMsg] = useState("");

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    storeService.updateFactoryAccountDetails(currentAccount.id, {
      factoryName,
      ownerName,
      username,
      email,
      phone,
      commercialReg,
      taxNumber,
      category,
      minOrderValue: Number(minOrderValue),
      preparationHours: Number(preparationHours),
      city,
      district,
      fullAddress,
      password: password.trim() ? password.trim() : undefined,
      lat,
      lng,
    });

    setSavedSuccessMsg("تم حفظ وتحديث بيانات وإعدادات المصنع بنجاح 🟢");
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
                <FactoryIcon className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-extrabold text-white text-base sm:text-lg">
                  إعدادات وتعديل بيانات المصنع ({currentAccount.factoryName})
                </h3>
                <p className="text-xs text-indigo-200">
                  تحديث بيانات السجل والتواصل، وشروط التوريد، وتحديد موقع المصنع على الخريطة
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

            {/* Basic Factory Info */}
            <div className="space-y-3">
              <h4 className="font-black text-slate-900 dark:text-white text-xs flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-2">
                <FactoryIcon className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                <span>البيانات الأساسية للمصنع والتوريد</span>
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-extrabold text-slate-700 dark:text-slate-300 mb-1">
                    اسم المصنع / المنشأة *
                  </label>
                  <input
                    type="text"
                    required
                    value={factoryName}
                    onChange={(e) => setFactoryName(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-bold focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="block font-extrabold text-slate-700 dark:text-slate-300 mb-1">
                    اسم المدير / المالك المسؤول *
                  </label>
                  <input
                    type="text"
                    required
                    value={ownerName}
                    onChange={(e) => setOwnerName(e.target.value)}
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
                    رقم الهاتف / التواصل *
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
                    البريد الإلكتروني الرسمي *
                  </label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-mono font-bold focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="block font-extrabold text-slate-700 dark:text-slate-300 mb-1">
                    رقم السجل التجاري
                  </label>
                  <input
                    type="text"
                    value={commercialReg}
                    onChange={(e) => setCommercialReg(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-mono font-bold focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="block font-extrabold text-slate-700 dark:text-slate-300 mb-1">
                    تصنيف المنتجات والمصنع
                  </label>
                  <input
                    type="text"
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    placeholder="مثال: مواد غذائية، بلاستيك، زيوت..."
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-bold focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="block font-extrabold text-slate-700 dark:text-slate-300 mb-1">
                    الحد الأدنى لقيمة الطلب بالجملة (ر.س)
                  </label>
                  <input
                    type="number"
                    value={minOrderValue}
                    onChange={(e) => setMinOrderValue(Number(e.target.value))}
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-mono font-bold focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="block font-extrabold text-slate-700 dark:text-slate-300 mb-1">
                    متوسط ساعات التحضير للتجهيز
                  </label>
                  <input
                    type="number"
                    value={preparationHours}
                    onChange={(e) => setPreparationHours(Number(e.target.value))}
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-mono font-bold focus:ring-2 focus:ring-indigo-500"
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
              </div>
            </div>

            {/* Address & Map Picker Section */}
            <div className="space-y-3 pt-2">
              <h4 className="font-black text-slate-900 dark:text-white text-xs flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2">
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-emerald-600" />
                  <span>عنوان وموقع المصنع على الخريطة 🗺️</span>
                </div>
                <button
                  type="button"
                  onClick={() => setIsLocationPickerOpen(true)}
                  className="px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-[11px] shadow-sm flex items-center gap-1.5 transition-transform active:scale-95"
                >
                  <Compass className="w-3.5 h-3.5" />
                  <span>فتح وتحديد الخريطة التفاعلية 📍</span>
                </button>
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-extrabold text-slate-700 dark:text-slate-300 mb-1">
                    المحافظة / المدينة
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
                    المديرية / المنطقة الصناعية
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
                    العنوان التفصيلي ومقر المصنع
                  </label>
                  <input
                    type="text"
                    value={fullAddress}
                    onChange={(e) => setFullAddress(e.target.value)}
                    placeholder="المنطقة الصناعية - بجوار صوامع الغلال..."
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
                      إحداثيات موقع المصنع المسجلة:
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
                <span>حفظ بيانات وإعدادات المصنع 💾</span>
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
        title="تحديد موقع المصنع على الخريطة"
      />
    </>
  );
};
