import React, { useState } from "react";
import { MerchantAccount } from "../../types";
import { storeService } from "../../services/storeService";
import { LocationPickerModal } from "../ui/LocationPickerModal";
import {
  Store,
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
  Map,
  ShieldCheck,
  Percent,
  Receipt,
  Globe2,
  Info,
  MessageSquare,
  Send,
} from "lucide-react";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  currentAccount: MerchantAccount;
}

export const MerchantSettingsModal: React.FC<Props> = ({
  isOpen,
  onClose,
  currentAccount,
}) => {
  const [storeName, setStoreName] = useState(currentAccount.storeName || "");
  const [ownerName, setOwnerName] = useState(currentAccount.ownerName || "");
  const [username, setUsername] = useState(currentAccount.username || "");
  const [phone, setPhone] = useState(currentAccount.phone || "");
  const [email, setEmail] = useState(currentAccount.email || "");
  const [commercialReg, setCommercialReg] = useState(currentAccount.commercialReg || "");
  const [taxNumber, setTaxNumber] = useState(currentAccount.taxNumber || "");
  const [taxEnabled, setTaxEnabled] = useState<boolean>(currentAccount.taxEnabled ?? false);
  const [taxRate, setTaxRate] = useState<number>(currentAccount.taxRate ?? 15);
  const [city, setCity] = useState(currentAccount.city || "صنعاء");
  const [district, setDistrict] = useState(currentAccount.district || "العاصمة");
  const [fullAddress, setFullAddress] = useState(currentAccount.fullAddress || "");
  const [password, setPassword] = useState("");
  const [lat, setLat] = useState<number>(currentAccount.lat || 15.3694);
  const [lng, setLng] = useState<number>(currentAccount.lng || 44.1910);

  // WhatsApp states
  const [whatsAppEnabled, setWhatsAppEnabled] = useState<boolean>(
    currentAccount.whatsAppConfig?.enabled ?? true
  );
  const [whatsAppPhone, setWhatsAppPhone] = useState<string>(
    currentAccount.whatsAppConfig?.phoneNumber || currentAccount.phone || "771234567"
  );
  const [whatsAppManagerPhone, setWhatsAppManagerPhone] = useState<string>(
    currentAccount.whatsAppConfig?.managerPhone || currentAccount.phone || "771234567"
  );

  const [isLocationPickerOpen, setIsLocationPickerOpen] = useState(false);
  const [savedSuccessMsg, setSavedSuccessMsg] = useState("");

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
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

    storeService.updateMerchantWhatsAppConfig(currentAccount.id, {
      enabled: whatsAppEnabled,
      phoneNumber: whatsAppPhone.trim(),
      managerPhone: whatsAppManagerPhone.trim(),
      isConnected: true,
      connectedAt: new Date().toISOString(),
    });

    setSavedSuccessMsg("تم حفظ وتحديث بيانات وإعدادات المتجر والواتساب بنجاح 🟢");
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
          {/* Modal Header */}
          <div className="flex items-center justify-between p-5 bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white border-b border-indigo-900/50">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-2xl bg-indigo-600 text-amber-300 border border-indigo-400/40">
                <Store className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-extrabold text-white text-base sm:text-lg">
                  إعدادات وتعديل بيانات المتجر ({currentAccount.storeName})
                </h3>
                <p className="text-xs text-indigo-200">
                  تحديث البيانات التجارية، وسائل التواصل، وتحديد الموقع الجغرافي على الخريطة
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

            {/* Basic Store Info */}
            <div className="space-y-3">
              <h4 className="font-black text-slate-900 dark:text-white text-xs flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-2">
                <Store className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                <span>البيانات الأساسية والتجارية للمتجر</span>
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-extrabold text-slate-700 dark:text-slate-300 mb-1">
                    اسم المتجر / المحل *
                  </label>
                  <input
                    type="text"
                    required
                    value={storeName}
                    onChange={(e) => setStoreName(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-bold focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="block font-extrabold text-slate-700 dark:text-slate-300 mb-1">
                    اسم التاجر / المالك المسؤول *
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
                    رقم الهاتف / الجوال *
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
                    البريد الإلكتروني
                  </label>
                  <input
                    type="email"
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
                    الرقم الضريبي
                  </label>
                  <input
                    type="text"
                    value={taxNumber}
                    onChange={(e) => setTaxNumber(e.target.value)}
                    placeholder="مثال: 300123456700003"
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

            {/* Tax Settings Section (VAT Toggle & Rate) */}
            <div className="space-y-3 pt-2">
              <h4 className="font-black text-slate-900 dark:text-white text-xs flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2">
                <div className="flex items-center gap-2">
                  <Percent className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                  <span>إعدادات ضريبة القيمة المضافة (VAT) ونظام الفوترة</span>
                </div>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 font-bold">
                  محلي / دولي 🌍
                </span>
              </h4>

              {/* Informational Context Box */}
              <div className="p-3.5 rounded-2xl bg-amber-50/80 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/50 text-[11px] text-amber-900 dark:text-amber-200 flex items-start gap-2.5">
                <Info className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <span className="font-black block">
                    ملاحظة هامة حول النظام الضريبي (اليمن والتوسع الدولي):
                  </span>
                  <p className="leading-relaxed">
                    في الأسواق المحلية مثل <strong>اليمن</strong>، لا توجد ضريبة مبيعات مضافة (VAT) مضافة على فواتير الزبائن وإنما ضريبة ثابتة مقطوعة تُسدد نقداً للمصلحة، لذا يكون خيار الضريبة <strong>مُعطلاً تلقائياً (0%)</strong>. وفي حال التوسع التجاري دولياً (مثل السعودية أو الخليج) يمكنك <strong>تفعيل الخيار وتحديد نسبة الضريبة</strong> يدوياً لتُحسب تلقائياً في فواتير الكاشير والـ POS.
                  </p>
                </div>
              </div>

              {/* Toggle Card */}
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <label htmlFor="tax-toggle" className="font-black text-slate-900 dark:text-white text-xs cursor-pointer flex items-center gap-1.5">
                      <span>تفعيل احتساب ضريبة القيمة المضافة على المبيعات</span>
                      {taxEnabled ? (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-emerald-100 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300">
                          مُفعل ✅
                        </span>
                      ) : (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300">
                          معطل (افتراضي اليمن) ⭕
                        </span>
                      )}
                    </label>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400">
                      عند التعطيل لن تُضاف أي نسبة ضريبية على الفواتير، وعند التفعيل ستظهر خانة الضريبة في الكاشير وحساب الإجمالي.
                    </p>
                  </div>

                  {/* Switch toggle */}
                  <label className="relative inline-flex items-center cursor-pointer shrink-0">
                    <input
                      id="tax-toggle"
                      type="checkbox"
                      checked={taxEnabled}
                      onChange={(e) => setTaxEnabled(e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-slate-300 peer-focus:outline-none rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-slate-600 peer-checked:bg-emerald-600"></div>
                  </label>
                </div>

                {/* Tax Rate Input (Shown or enabled when tax is active) */}
                {taxEnabled && (
                  <div className="pt-3 border-t border-slate-200 dark:border-slate-700 animate-in fade-in slide-in-from-top-1 duration-200">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 items-center">
                      <div>
                        <label className="block font-extrabold text-slate-700 dark:text-slate-300 mb-1">
                          نسبة ضريبة القيمة المضافة المطبقة (%) *
                        </label>
                        <div className="relative">
                          <input
                            type="number"
                            min="0"
                            max="100"
                            step="0.5"
                            value={taxRate}
                            onChange={(e) => setTaxRate(parseFloat(e.target.value))}
                            className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-white font-mono font-bold focus:ring-2 focus:ring-emerald-500 pl-8"
                            placeholder="15"
                          />
                          <span className="absolute left-3 top-2.5 font-bold text-slate-400 font-mono text-xs">
                            %
                          </span>
                        </div>
                      </div>

                      <div className="flex flex-wrap items-center gap-1.5 pt-4 sm:pt-6">
                        <span className="text-[11px] text-slate-500 dark:text-slate-400 font-bold ml-1">نسب شائعة:</span>
                        {[5, 10, 15, 16].map((rate) => (
                          <button
                            key={rate}
                            type="button"
                            onClick={() => setTaxRate(rate)}
                            className={`px-2.5 py-1 rounded-lg text-xs font-mono font-bold transition-colors ${
                              taxRate === rate
                                ? "bg-emerald-600 text-white"
                                : "bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 hover:bg-slate-100"
                            }`}
                          >
                            %{rate}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Address & Location Picker Section */}
            <div className="space-y-3 pt-2">
              <h4 className="font-black text-slate-900 dark:text-white text-xs flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2">
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-emerald-600" />
                  <span>العنوان والتحديد الجغرافي على الخريطة 🗺️</span>
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
                    المديرية / المنطقة
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
                    العنوان التفصيلي
                  </label>
                  <input
                    type="text"
                    value={fullAddress}
                    onChange={(e) => setFullAddress(e.target.value)}
                    placeholder="شارع المقالح - بجوار سوق المركز التجاري..."
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-bold focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              {/* Map Coordinates Badge Card */}
              <div className="p-3.5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 flex items-center justify-between gap-3">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-xl bg-emerald-600 text-white shadow-xs">
                    <MapPin className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="font-extrabold text-emerald-900 dark:text-emerald-300 block text-xs">
                      موقع الشحن والتوصيل المحدد:
                    </span>
                    <span className="font-mono font-bold text-[11px] text-emerald-700 dark:text-emerald-400">
                      GPS: {lat}, {lng}
                    </span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setIsLocationPickerOpen(true)}
                  className="px-3 py-1.5 rounded-xl bg-white dark:bg-slate-900 hover:bg-emerald-100 text-emerald-800 dark:text-emerald-300 font-extrabold border border-emerald-300 dark:border-emerald-700 text-xs transition-colors"
                >
                  تغيير الموقع
                </button>
              </div>
            </div>

            {/* WhatsApp Integration Section */}
            <div className="space-y-3 pt-2">
              <div className="p-4 rounded-2xl bg-emerald-50/60 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="p-1.5 rounded-xl bg-emerald-600 text-white">
                      <MessageSquare className="w-4 h-4" />
                    </div>
                    <div>
                      <strong className="block font-black text-slate-900 dark:text-white text-xs">
                        خدمة الواتساب للسندات (WhatsApp Gateway) 💬
                      </strong>
                      <span className="text-[11px] text-slate-500 dark:text-slate-400">
                        إرسال سندات الصرف والسلف والخصومات كصور وبيانات نصية للموظفين والإدارة
                      </span>
                    </div>
                  </div>

                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={whatsAppEnabled}
                      onChange={(e) => setWhatsAppEnabled(e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-9 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all dark:border-slate-600 peer-checked:bg-emerald-600"></div>
                  </label>
                </div>

                {whatsAppEnabled && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-emerald-200/80 dark:border-emerald-800/60">
                    <div>
                      <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1 text-[11px]">
                        رقم واتساب المتجر الأساسي للإرسال
                      </label>
                      <input
                        type="text"
                        value={whatsAppPhone}
                        onChange={(e) => setWhatsAppPhone(e.target.value)}
                        placeholder="771234567"
                        className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white font-mono font-bold text-xs focus:ring-2 focus:ring-emerald-500"
                      />
                    </div>

                    <div>
                      <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1 text-[11px]">
                        رقم واتساب المالك / المدير (استلام نسخة)
                      </label>
                      <input
                        type="text"
                        value={whatsAppManagerPhone}
                        onChange={(e) => setWhatsAppManagerPhone(e.target.value)}
                        placeholder="775554433"
                        className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white font-mono font-bold text-xs focus:ring-2 focus:ring-emerald-500"
                      />
                    </div>
                  </div>
                )}
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
                <span>حفظ التغييرات والإعدادات 💾</span>
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
        title="تحديد موقع متجر الجملة على الخريطة"
      />
    </>
  );
};
