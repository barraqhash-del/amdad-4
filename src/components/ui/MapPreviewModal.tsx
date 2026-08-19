import React, { useEffect, useRef, useState } from "react";
import L from "leaflet";
import { WholesalerProfile } from "../../types";
import {
  MapPin,
  Navigation,
  Phone,
  Building2,
  ExternalLink,
  X,
  ShieldCheck,
  Layers,
  Map as MapIcon
} from "lucide-react";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  wholesaler: WholesalerProfile;
}

export const MapPreviewModal: React.FC<Props> = ({ isOpen, onClose, wholesaler }) => {
  const [mapMode, setMapMode] = useState<"STREET" | "SATELLITE">("STREET");
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);

  useEffect(() => {
    if (!isOpen || !mapContainerRef.current) return;

    if (mapInstanceRef.current) {
      mapInstanceRef.current.remove();
      mapInstanceRef.current = null;
    }

    const mapLat = Number(wholesaler.lat) || 15.3694;
    const mapLng = Number(wholesaler.lng) || 44.1910;

    const map = L.map(mapContainerRef.current, {
      center: [mapLat, mapLng],
      zoom: 16,
      zoomControl: false,
    });

    L.control.zoom({ position: "topleft" }).addTo(map);

    const tileUrl =
      mapMode === "SATELLITE"
        ? "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
        : "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png";

    L.tileLayer(tileUrl, {
      maxZoom: 19,
      attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
    }).addTo(map);

    // Custom Pin Marker
    const pinHtml = `
      <div style="position: relative; display: flex; flex-direction: column; align-items: center; transform: translate(-50%, -100%);">
        <div style="
          background: #e11d48;
          color: white;
          padding: 8px;
          border-radius: 9999px;
          box-shadow: 0 12px 28px rgba(225, 29, 72, 0.6);
          border: 2px solid white;
          display: flex;
          align-items: center;
          justify-content: center;
        ">
          <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
            <path d="M20 10c0 4.993-5.539 10.193-7.399 11.799a1 1 0 0 1-1.202 0C9.539 20.193 4 14.993 4 10a8 8 0 0 1 16 0Z"/>
            <circle cx="12" cy="10" r="3"/>
          </svg>
        </div>
        <div style="
          margin-top: 4px;
          background: #0f172a;
          color: white;
          font-weight: 800;
          font-size: 11px;
          padding: 3px 10px;
          border-radius: 12px;
          border: 1px solid #334155;
          white-space: nowrap;
          box-shadow: 0 4px 10px rgba(0,0,0,0.3);
          direction: rtl;
        ">
          📍 ${wholesaler.storeName} (${wholesaler.city}${wholesaler.district ? ` - ${wholesaler.district}` : ""})
        </div>
      </div>
    `;

    const pinIcon = L.divIcon({
      className: "custom-leaflet-marker",
      html: pinHtml,
      iconSize: [0, 0],
      iconAnchor: [0, 0],
    });

    L.marker([mapLat, mapLng], { icon: pinIcon }).addTo(map);

    mapInstanceRef.current = map;

    const timer = setTimeout(() => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.invalidateSize();
      }
    }, 200);

    return () => {
      clearTimeout(timer);
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [isOpen, mapMode, wholesaler]);

  if (!isOpen) return null;

  const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${wholesaler.lat},${wholesaler.lng}`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/75 backdrop-blur-xs p-3 sm:p-4 dir-rtl overflow-y-auto">
      <div className="relative w-full max-w-2xl rounded-3xl bg-white dark:bg-slate-900 shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden my-6">
        {/* Header */}
        <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 rounded-2xl shadow-sm">
              <MapPin className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-extrabold text-slate-900 dark:text-white text-base sm:text-lg">
                موقع تسليم المتجر ({wholesaler.storeName})
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                إحداثيات GPS المحددة لتسليم شحنة المصنع المباشرة
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-xl hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Map Canvas Header Controls */}
        <div className="flex items-center justify-between px-4 py-2 bg-slate-100 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 text-xs">
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => setMapMode("STREET")}
              className={`px-3 py-1 rounded-lg font-bold text-[11px] transition-all flex items-center gap-1 ${
                mapMode === "STREET"
                  ? "bg-indigo-600 text-white shadow-xs"
                  : "bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300"
              }`}
            >
              <MapIcon className="w-3.5 h-3.5" />
              <span>شوارع</span>
            </button>
            <button
              type="button"
              onClick={() => setMapMode("SATELLITE")}
              className={`px-3 py-1 rounded-lg font-bold text-[11px] transition-all flex items-center gap-1 ${
                mapMode === "SATELLITE"
                  ? "bg-indigo-600 text-white shadow-xs"
                  : "bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300"
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>أقمار صناعية</span>
            </button>
          </div>

          <div className="font-mono text-xs font-bold text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-900 px-2.5 py-1 rounded-md border border-slate-200 dark:border-slate-800">
            GPS: {wholesaler.lat?.toFixed(5)}, {wholesaler.lng?.toFixed(5)}
          </div>
        </div>

        {/* Interactive Leaflet Map View */}
        <div className="relative h-72 sm:h-80 w-full bg-slate-900">
          <div ref={mapContainerRef} className="h-full w-full z-0" />
        </div>

        {/* Store Details Section */}
        <div className="p-5 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800 space-y-1">
              <div className="flex items-center gap-2 text-xs font-bold text-slate-500 dark:text-slate-400">
                <Building2 className="w-4 h-4 text-emerald-600" />
                <span>عنوان المحل والحي</span>
              </div>
              <p className="font-extrabold text-slate-900 dark:text-white text-sm">
                {wholesaler.city} - {wholesaler.district || "العاصمة"}
              </p>
              <p className="text-xs text-slate-600 dark:text-slate-400 font-bold">{wholesaler.fullAddress}</p>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800 space-y-1">
              <div className="flex items-center gap-2 text-xs font-bold text-slate-500 dark:text-slate-400">
                <Phone className="w-4 h-4 text-emerald-600" />
                <span>التاجر والاتصال</span>
              </div>
              <p className="font-extrabold text-slate-900 dark:text-white text-sm">
                {wholesaler.ownerName}
              </p>
              <p className="text-xs text-slate-600 dark:text-slate-400 font-mono font-bold dir-ltr text-right">
                {wholesaler.phone}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 text-xs text-emerald-800 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/40 p-3 rounded-2xl border border-emerald-200 dark:border-emerald-800">
            <ShieldCheck className="w-4 h-4 shrink-0 text-emerald-600" />
            <span>
              سجل تجاري موثق: <strong className="font-mono">{wholesaler.commercialReg}</strong> | الرقم الضريبي: <strong className="font-mono">{wholesaler.taxNumber || "مسجل"}</strong>
            </span>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-2 pt-2 border-t border-slate-200 dark:border-slate-800">
            <a
              href={mapsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs transition-all shadow-md"
            >
              <Navigation className="w-4 h-4" />
              <span>فتح الاتجاهات المباشرة في خرائط Google</span>
              <ExternalLink className="w-3.5 h-3.5 opacity-80" />
            </a>
            <a
              href={`tel:${wholesaler.phone}`}
              className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-bold text-xs transition-colors"
            >
              <Phone className="w-4 h-4 text-emerald-600" />
              <span>الاتصال بالتاجر</span>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};
