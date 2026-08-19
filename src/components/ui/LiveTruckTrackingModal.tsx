import React, { useEffect, useRef, useState } from "react";
import L from "leaflet";
import { SubOrder } from "../../types";
import {
  Truck,
  MapPin,
  Phone,
  Radio,
  X,
  Navigation,
  ShieldCheck,
  Clock,
  Gauge,
  CheckCircle2,
  Lock,
} from "lucide-react";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  subOrder: SubOrder;
}

export const LiveTruckTrackingModal: React.FC<Props> = ({
  isOpen,
  onClose,
  subOrder,
}) => {
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);

  // Simulated live stats
  const [speed, setSpeed] = useState(42);
  const [etaMinutes, setEtaMinutes] = useState(12);
  const [distanceKm, setDistanceKm] = useState(3.4);
  const [lastPing, setLastPing] = useState("الآن (قبل ثانية)");

  useEffect(() => {
    if (!isOpen) return;

    const interval = setInterval(() => {
      // Small simulated variations
      setSpeed(Math.floor(38 + Math.random() * 12));
      setLastPing("الآن (بث حي)");
    }, 4000);

    return () => clearInterval(interval);
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen || !mapContainerRef.current) return;

    if (mapInstanceRef.current) {
      mapInstanceRef.current.remove();
      mapInstanceRef.current = null;
    }

    // Default coordinates: store location + truck simulated slightly offset
    const storeLat = Number(subOrder.wholesaler.lat) || 15.3694;
    const storeLng = Number(subOrder.wholesaler.lng) || 44.1910;

    // Truck is slightly south-west of store
    const truckLat = storeLat - 0.015;
    const truckLng = storeLng - 0.012;

    const centerLat = (storeLat + truckLat) / 2;
    const centerLng = (storeLng + truckLng) / 2;

    const map = L.map(mapContainerRef.current, {
      center: [centerLat, centerLng],
      zoom: 14,
      zoomControl: false,
    });

    L.control.zoom({ position: "topleft" }).addTo(map);

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      maxZoom: 19,
      attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
    }).addTo(map);

    // 1. Truck Marker (Animated Pulse)
    const truckHtml = `
      <div style="position: relative; display: flex; flex-direction: column; align-items: center; transform: translate(-50%, -50%);">
        <div style="
          position: absolute;
          width: 50px;
          height: 50px;
          border-radius: 50%;
          background: rgba(6, 182, 212, 0.35);
          animation: ping 1.8s cubic-bezier(0, 0, 0.2, 1) infinite;
        "></div>
        <div style="
          background: #0284c7;
          color: white;
          padding: 10px;
          border-radius: 16px;
          box-shadow: 0 10px 25px rgba(2, 132, 199, 0.6);
          border: 3px solid white;
          z-index: 10;
          display: flex;
          align-items: center;
          justify-content: center;
        ">
          <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
            <path d="M14 18V6a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v11a1 1 0 0 0 1 1h2"/>
            <path d="M15 18H9"/>
            <path d="M19 18h2a1 1 0 0 0 1-1v-3.65a1 1 0 0 0-.22-.624l-3.48-4.35A1 1 0 0 0 17.52 8H14"/>
            <circle cx="17" cy="18" r="2"/>
            <circle cx="7" cy="18" r="2"/>
          </svg>
        </div>
        <div style="
          margin-top: 6px;
          background: #0f172a;
          color: white;
          font-weight: 800;
          font-size: 11px;
          padding: 4px 10px;
          border-radius: 10px;
          border: 1px solid #0284c7;
          white-space: nowrap;
          box-shadow: 0 4px 12px rgba(0,0,0,0.4);
          direction: rtl;
        ">
          🚚 شاحنة ${subOrder.assignedDriver?.name || "السائق"}
        </div>
      </div>
    `;

    const truckIcon = L.divIcon({
      className: "custom-leaflet-truck",
      html: truckHtml,
      iconSize: [0, 0],
      iconAnchor: [0, 0],
    });

    L.marker([truckLat, truckLng], { icon: truckIcon }).addTo(map);

    // 2. Store Destination Marker
    const storeHtml = `
      <div style="position: relative; display: flex; flex-direction: column; align-items: center; transform: translate(-50%, -100%);">
        <div style="
          background: #10b981;
          color: white;
          padding: 8px;
          border-radius: 9999px;
          box-shadow: 0 10px 20px rgba(16, 185, 129, 0.5);
          border: 2px solid white;
          display: flex;
          align-items: center;
          justify-content: center;
        ">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
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
          padding: 3px 8px;
          border-radius: 8px;
          border: 1px solid #10b981;
          white-space: nowrap;
          direction: rtl;
        ">
          📍 متجرك: ${subOrder.wholesaler.storeName}
        </div>
      </div>
    `;

    const storeIcon = L.divIcon({
      className: "custom-leaflet-store",
      html: storeHtml,
      iconSize: [0, 0],
      iconAnchor: [0, 0],
    });

    L.marker([storeLat, storeLng], { icon: storeIcon }).addTo(map);

    // 3. Connect route polyline
    const routePoints: [number, number][] = [
      [truckLat, truckLng],
      [truckLat + 0.007, truckLng + 0.004],
      [storeLat, storeLng],
    ];

    L.polyline(routePoints, {
      color: "#0284c7",
      weight: 5,
      opacity: 0.8,
      dashArray: "10, 10",
    }).addTo(map);

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
  }, [isOpen, subOrder]);

  if (!isOpen) return null;

  const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${subOrder.wholesaler.lat},${subOrder.wholesaler.lng}`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-md p-3 sm:p-4 dir-rtl overflow-y-auto">
      <div className="relative w-full max-w-3xl rounded-3xl bg-white dark:bg-slate-900 shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden my-6 animate-in fade-in duration-200">
        
        {/* Header Bar */}
        <div className="flex items-center justify-between p-4 bg-slate-900 text-white border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-cyan-500/20 text-cyan-300 border border-cyan-400/30 rounded-2xl">
              <Radio className="w-6 h-6 animate-pulse text-cyan-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-black text-white text-base sm:text-lg">
                  تتبع الموقع الحي للشاحنة 📡 (Live GPS)
                </h3>
                <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] font-extrabold border border-emerald-400/30">
                  مباشر لحسابك
                </span>
              </div>
              <p className="text-xs text-slate-300">
                وجهتك نشطة حالياً — موقع الشاحنة يبث بدقة للتاجر ({subOrder.wholesaler.storeName})
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white cursor-pointer transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Live Metrics Dashboard Bar */}
        <div className="p-3 sm:p-4 bg-slate-950 text-white border-b border-slate-800 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
          
          <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 space-y-1">
            <span className="text-[10px] text-slate-400 font-bold block flex items-center gap-1">
              <Radio className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
              حالة البث الحي
            </span>
            <span className="font-black text-cyan-300 text-xs block truncate">
              {lastPing}
            </span>
          </div>

          <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 space-y-1">
            <span className="text-[10px] text-slate-400 font-bold block flex items-center gap-1">
              <Clock className="w-3.5 h-3.5 text-amber-400" />
              الوصول المقدر (ETA)
            </span>
            <span className="font-black text-amber-300 text-xs block">
              {etaMinutes} دقيقة تقريباً
            </span>
          </div>

          <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 space-y-1">
            <span className="text-[10px] text-slate-400 font-bold block flex items-center gap-1">
              <Gauge className="w-3.5 h-3.5 text-emerald-400" />
              سرعة الشاحنة
            </span>
            <span className="font-black text-emerald-300 text-xs block">
              {speed} كم / الساعة
            </span>
          </div>

          <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 space-y-1">
            <span className="text-[10px] text-slate-400 font-bold block flex items-center gap-1">
              <Navigation className="w-3.5 h-3.5 text-indigo-400" />
              المسافة المتبقية
            </span>
            <span className="font-black text-indigo-300 text-xs block">
              {distanceKm} كم
            </span>
          </div>

        </div>

        {/* Leaflet Live Map Box */}
        <div className="relative w-full h-[360px] sm:h-[420px] bg-slate-950">
          <div ref={mapContainerRef} className="w-full h-full z-10" />

          {/* Privacy & Guarantee Badge */}
          <div className="absolute top-3 right-3 z-20 p-2.5 rounded-xl bg-slate-900/90 text-white backdrop-blur-md border border-slate-700 text-[11px] font-bold flex items-center gap-2 shadow-lg max-w-xs">
            <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>
              خاص بمتجرك: الخريطة نشطة حالياً لأن دور شحنتك هو الأول (#1) بمسار التسليم.
            </span>
          </div>
        </div>

        {/* Footer Actions & Driver Info */}
        <div className="p-4 bg-slate-50 dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          
          <div className="flex items-center gap-3">
            <div className="p-2 bg-indigo-600 text-white rounded-xl shadow-xs shrink-0">
              <Truck className="w-5 h-5" />
            </div>
            <div>
              <div className="font-extrabold text-slate-900 dark:text-white">
                السائق: {subOrder.assignedDriver?.name} ({subOrder.assignedDriver?.vehicleType})
              </div>
              <div className="text-slate-500 font-mono text-[11px]">
                رقم الشاحنة: {subOrder.assignedDriver?.vehicleNo}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <a
              href={`tel:${subOrder.assignedDriver?.phone}`}
              className="px-4 py-2 bg-cyan-600 hover:bg-cyan-700 text-white font-bold rounded-xl transition-colors inline-flex items-center gap-1.5 shadow-xs"
            >
              <Phone className="w-4 h-4" />
              <span>الاتصال بالسائق</span>
            </a>

            <a
              href={mapsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white font-bold rounded-xl transition-colors inline-flex items-center gap-1.5 shadow-xs"
            >
              <Navigation className="w-4 h-4 text-emerald-400" />
              <span>تطبيق الخرائط الخارجي</span>
            </a>
          </div>

        </div>

      </div>
    </div>
  );
};
