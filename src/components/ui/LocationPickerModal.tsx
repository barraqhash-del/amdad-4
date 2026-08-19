import React, { useState, useEffect, useRef } from "react";
import L from "leaflet";
import {
  MapPin,
  Navigation,
  CheckCircle2,
  X,
  Compass,
  Globe,
  LocateFixed,
  Search,
  Layers,
  Sparkles,
  RotateCcw,
  Sliders,
  ExternalLink,
  Map as MapIcon,
  Loader2,
  AlertCircle,
  Info
} from "lucide-react";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onConfirmLocation: (lat: number, lng: number, city?: string, district?: string) => void;
  initialLat?: number;
  initialLng?: number;
  initialCity?: string;
  initialDistrict?: string;
  title?: string;
}

const YEMEN_CITIES = [
  { name: "صنعاء", lat: 15.3694, lng: 44.1910, districts: ["السبعين", "التحرير", "معين", "الوحدة", "الصافيه", "شعوب", "بني الحارث", "المنطقة الصناعية"] },
  { name: "عدن", lat: 12.7855, lng: 45.0186, districts: ["كريتر", "المنصورة", "الشيخ عثمان", "خور مكسر", "التواهي", "المعلا", "البريقة"] },
  { name: "تعز", lat: 13.5795, lng: 44.0209, districts: ["المظفر", "القاهرة", "صالة", "التعزية"] },
  { name: "الحديدة", lat: 14.7978, lng: 42.9545, districts: ["الحوك", "المينا", "الحالي"] },
  { name: "إب", lat: 13.9667, lng: 44.1833, districts: ["الظهار", "المشنة", "جبلة"] },
  { name: "المكلا", lat: 14.5425, lng: 49.1242, districts: ["المدينة", "فوة", "الشحر"] },
  { name: "ذمار", lat: 14.5427, lng: 44.4051, districts: ["مدينة ذمار", "عنس"] },
  { name: "عمران", lat: 15.6594, lng: 43.9439, districts: ["مدينة عمران", "ريدة"] },
  { name: "مأرب", lat: 15.4625, lng: 45.3258, districts: ["مدينة مأرب", "الوادي"] },
];

export const LocationPickerModal: React.FC<Props> = ({
  isOpen,
  onClose,
  onConfirmLocation,
  initialLat = 15.3694,
  initialLng = 44.1910,
  initialCity = "صنعاء",
  initialDistrict = "",
  title = "تحديد الموقع الجغرافي الخريطة التفاعلية",
}) => {
  const [lat, setLat] = useState<number>(initialLat || 15.3694);
  const [lng, setLng] = useState<number>(initialLng || 44.1910);
  const [selectedCity, setSelectedCity] = useState<string>(initialCity || "صنعاء");
  const [selectedDistrict, setSelectedDistrict] = useState<string>(initialDistrict || "");
  const [mapMode, setMapMode] = useState<"STREET" | "SATELLITE">("STREET");
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [isLocating, setIsLocating] = useState(false);
  const [gpsStatus, setGpsStatus] = useState<string>("");
  const [searchResults, setSearchResults] = useState<Array<{ display_name: string; lat: string; lon: string }>>([]);

  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markerRef = useRef<L.Marker | null>(null);
  const tileLayerRef = useRef<L.TileLayer | null>(null);

  // Sync state with props when modal opens
  useEffect(() => {
    if (isOpen) {
      const startLat = Number(initialLat) || 15.3694;
      const startLng = Number(initialLng) || 44.1910;
      setLat(startLat);
      setLng(startLng);
      setSelectedCity(initialCity || "صنعاء");
      setSelectedDistrict(initialDistrict || "");
      setGpsStatus("");
      setSearchResults([]);
      setSearchQuery("");
    }
  }, [isOpen, initialLat, initialLng, initialCity, initialDistrict]);

  // Helper function to create custom red pin marker HTML
  const createPinIcon = (cityText: string, districtText: string) => {
    const label = `${cityText} ${districtText ? `- ${districtText}` : ""}`.trim();
    return L.divIcon({
      className: "custom-leaflet-marker",
      html: `
        <div style="position: relative; display: flex; flex-direction: column; align-items: center; transform: translate(-50%, -100%); cursor: grab;">
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
            margin-top: 5px;
            background: #0f172a;
            color: #f8fafc;
            font-weight: 800;
            font-size: 11px;
            padding: 3px 10px;
            border-radius: 14px;
            border: 1px solid #334155;
            white-space: nowrap;
            box-shadow: 0 4px 12px rgba(0,0,0,0.4);
            direction: rtl;
            pointer-events: none;
          ">
            📍 ${label || "الموقع المختار"}
          </div>
        </div>
      `,
      iconSize: [0, 0],
      iconAnchor: [0, 0],
    });
  };

  // Initialize or re-render Leaflet Map instance
  useEffect(() => {
    if (!isOpen || !mapContainerRef.current) return;

    // Destroy existing map if any
    if (mapInstanceRef.current) {
      mapInstanceRef.current.remove();
      mapInstanceRef.current = null;
    }

    const currentLat = lat || 15.3694;
    const currentLng = lng || 44.1910;

    // Create Map
    const map = L.map(mapContainerRef.current, {
      center: [currentLat, currentLng],
      zoom: 16,
      zoomControl: false,
    });

    // Add Zoom Control at top left
    L.control.zoom({ position: "topleft" }).addTo(map);

    // Tile URL
    const tileUrl =
      mapMode === "SATELLITE"
        ? "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
        : "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png";

    const tileLayer = L.tileLayer(tileUrl, {
      maxZoom: 19,
      attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
    }).addTo(map);

    tileLayerRef.current = tileLayer;

    // Draggable Marker
    const marker = L.marker([currentLat, currentLng], {
      draggable: true,
      icon: createPinIcon(selectedCity, selectedDistrict),
    }).addTo(map);

    // On Marker Drag
    marker.on("dragend", () => {
      const pos = marker.getLatLng();
      const newLat = Number(pos.lat.toFixed(5));
      const newLng = Number(pos.lng.toFixed(5));
      setLat(newLat);
      setLng(newLng);
    });

    // On Map Click
    map.on("click", (e: L.LeafletMouseEvent) => {
      const clickLat = Number(e.latlng.lat.toFixed(5));
      const clickLng = Number(e.latlng.lng.toFixed(5));
      setLat(clickLat);
      setLng(clickLng);
      marker.setLatLng([clickLat, clickLng]);
    });

    mapInstanceRef.current = map;
    markerRef.current = marker;

    // Invalidate size after render animation
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
  }, [isOpen, mapMode]);

  // Automatic reverse geocoding whenever lat / lng change
  useEffect(() => {
    if (!isOpen) return;

    const geocodeTimer = setTimeout(async () => {
      try {
        // Proximity check for closest known Yemeni city
        let matchedCity = "";
        let minDistance = 999999;
        for (const c of YEMEN_CITIES) {
          const dist = Math.hypot(c.lat - lat, c.lng - lng);
          if (dist < minDistance) {
            minDistance = dist;
            if (dist < 0.8) { // ~80km radius
              matchedCity = c.name;
            }
          }
        }

        const res = await fetch(
          `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&accept-language=ar&zoom=18`
        );
        if (res.ok) {
          const data = await res.json();
          if (data && data.address) {
            const addr = data.address;
            
            // Detect City / Governorate
            let rawCity = addr.state || addr.city || addr.governorate || addr.county || addr.town || matchedCity;
            if (rawCity) {
              const cleanedCity = rawCity.replace(/محافظة|أمانة|العاصمة|مدينة/g, "").trim();
              const found = YEMEN_CITIES.find(
                (c) => cleanedCity.includes(c.name) || c.name.includes(cleanedCity)
              );
              if (found) {
                setSelectedCity(found.name);
              } else if (cleanedCity) {
                setSelectedCity(cleanedCity);
              }
            } else if (matchedCity) {
              setSelectedCity(matchedCity);
            }

            // Detect District / Suburb / Quarter / Street
            const districtPart = addr.city_district || addr.district || addr.county || addr.town;
            const streetPart =
              addr.road ||
              addr.suburb ||
              addr.neighbourhood ||
              addr.quarter ||
              addr.residential ||
              addr.village;

            let cleanDist = districtPart ? districtPart.replace(/محافظة|أمانة|العاصمة/g, "").trim() : "";
            let cleanStreet = streetPart ? streetPart.trim() : "";

            let distLabel = cleanDist;
            if (distLabel && !distLabel.startsWith("مديرية") && !distLabel.startsWith("حي")) {
              distLabel = `مديرية ${distLabel}`;
            }

            let fullDistrictStr = "";
            if (distLabel && cleanStreet && !cleanStreet.includes(cleanDist) && !cleanDist.includes(cleanStreet)) {
              fullDistrictStr = `${distLabel} - ${cleanStreet}`;
            } else if (distLabel) {
              fullDistrictStr = distLabel;
            } else if (cleanStreet) {
              fullDistrictStr = cleanStreet;
            }

            if (fullDistrictStr) {
              setSelectedDistrict(fullDistrictStr);
            }
          }
        } else if (matchedCity) {
          setSelectedCity(matchedCity);
        }
      } catch {
        // Fallback on network or CORS failure
      }
    }, 350);

    return () => clearTimeout(geocodeTimer);
  }, [lat, lng, isOpen]);

  // Sync marker position & map center when lat/lng change from controls
  useEffect(() => {
    if (mapInstanceRef.current && markerRef.current) {
      const currentPos = markerRef.current.getLatLng();
      if (Math.abs(currentPos.lat - lat) > 0.00001 || Math.abs(currentPos.lng - lng) > 0.00001) {
        markerRef.current.setLatLng([lat, lng]);
        mapInstanceRef.current.panTo([lat, lng]);
      }
      markerRef.current.setIcon(createPinIcon(selectedCity, selectedDistrict));
    }
  }, [lat, lng, selectedCity, selectedDistrict]);

  if (!isOpen) return null;

  // Handle City Change
  const handleCityChange = (cityName: string) => {
    setSelectedCity(cityName);
    const foundCity = YEMEN_CITIES.find((c) => c.name === cityName);
    if (foundCity) {
      setLat(foundCity.lat);
      setLng(foundCity.lng);
      if (foundCity.districts.length > 0) {
        setSelectedDistrict(foundCity.districts[0]);
      } else {
        setSelectedDistrict("");
      }
    }
  };

  // Handle High Accuracy GPS Detection
  const handleDetectGPS = () => {
    setIsLocating(true);
    setGpsStatus("جاري الاتصال بالأقمار الصناعية والأبراج لتحديد موقعك الحقيقي...");

    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const userLat = Number(pos.coords.latitude.toFixed(5));
          const userLng = Number(pos.coords.longitude.toFixed(5));
          setLat(userLat);
          setLng(userLng);
          setIsLocating(false);
          setGpsStatus(`تم رصد الإحداثيات بنجاح (دقة ±${Math.round(pos.coords.accuracy || 5)} متر) 🟢`);
        },
        (error) => {
          setIsLocating(false);
          setGpsStatus("تعذر الوصول لـ GPS المباشر. يمكنك النقر على الخريطة أو أدخال الإحداثيات يدويًا.");
        },
        { enableHighAccuracy: true, timeout: 12000, maximumAge: 0 }
      );
    } else {
      setIsLocating(false);
      setGpsStatus("خدمة الموقع غير مدعومة في هذا المتصفح.");
    }
  };

  // Handle Search Places using OpenStreetMap Nominatim API
  const handleSearchPlaces = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!searchQuery.trim()) return;

    setIsSearching(true);
    setSearchResults([]);
    try {
      const fullQuery = searchQuery.includes("اليمن") || searchQuery.includes("Yemen")
        ? searchQuery
        : `${searchQuery} اليمن`;

      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(fullQuery)}&limit=5`
      );
      const data = await res.json();
      if (Array.isArray(data) && data.length > 0) {
        setSearchResults(data);
        const top = data[0];
        const newLat = Number(parseFloat(top.lat).toFixed(5));
        const newLng = Number(parseFloat(top.lon).toFixed(5));
        setLat(newLat);
        setLng(newLng);
        setGpsStatus(`تم العثور على: ${top.display_name.slice(0, 45)}...`);
      } else {
        setGpsStatus("لم يتم العثور على نتائج مطابقة للبحث.");
      }
    } catch {
      setGpsStatus("حدث خطأ أثناء الاتصال بخدمة البحث. حاول مجدداً.");
    } finally {
      setIsSearching(false);
    }
  };

  // Micro Nudge Steps
  const handleNudge = (direction: "UP" | "DOWN" | "LEFT" | "RIGHT") => {
    const step = 0.0003; // ~30 meters
    if (direction === "UP") setLat((prev) => Number((prev + step).toFixed(5)));
    if (direction === "DOWN") setLat((prev) => Number((prev - step).toFixed(5)));
    if (direction === "LEFT") setLng((prev) => Number((prev - step).toFixed(5)));
    if (direction === "RIGHT") setLng((prev) => Number((prev + step).toFixed(5)));
  };

  const handleConfirm = () => {
    onConfirmLocation(lat, lng, selectedCity, selectedDistrict);
    onClose();
  };

  const currentCityObj = YEMEN_CITIES.find((c) => c.name === selectedCity);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/75 backdrop-blur-xs p-3 sm:p-4 dir-rtl overflow-y-auto">
      <div className="relative w-full max-w-3xl rounded-3xl bg-white dark:bg-slate-900 shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden my-4 animate-in fade-in zoom-in duration-200">
        
        {/* Modal Header */}
        <div className="flex items-center justify-between px-5 py-4 bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white border-b border-indigo-900/50">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-indigo-600 text-amber-300 rounded-2xl shadow-md border border-indigo-400/30">
              <Compass className="w-6 h-6 animate-spin-slow" />
            </div>
            <div>
              <h3 className="font-extrabold text-white text-base sm:text-lg">
                {title}
              </h3>
              <p className="text-xs text-indigo-200">
                خريطة تفاعلية حية - انقر أو اسحب الدبوس لتحديد نقطة الشحن والتسليم الدقيقة
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            type="button"
            className="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-4 sm:p-5 space-y-4 text-xs">

          {/* Top Search Bar & City Selector */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {/* City */}
            <div>
              <label className="block font-extrabold text-slate-700 dark:text-slate-300 mb-1">
                المحافظة / المدينة
              </label>
              <div className="relative">
                <select
                  value={selectedCity}
                  onChange={(e) => handleCityChange(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-bold focus:ring-2 focus:ring-indigo-500 appearance-none pr-8"
                >
                  {YEMEN_CITIES.map((c) => (
                    <option key={c.name} value={c.name}>
                      {c.name}
                    </option>
                  ))}
                </select>
                <Globe className="w-4 h-4 text-indigo-500 absolute left-3 top-3 pointer-events-none" />
              </div>
            </div>

            {/* District & Street / Neighborhood */}
            <div>
              <label className="block font-extrabold text-slate-700 dark:text-slate-300 mb-1">
                المديرية والحي / اسم الشارع
              </label>
              <input
                type="text"
                value={selectedDistrict}
                onChange={(e) => setSelectedDistrict(e.target.value)}
                placeholder="مثل: مديرية معين - شارع 20 أو حارة الدفاع"
                className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-bold focus:ring-2 focus:ring-indigo-500"
              />
              {currentCityObj && currentCityObj.districts.length > 0 && (
                <div className="flex flex-wrap items-center gap-1 mt-1.5">
                  <span className="text-[10px] text-slate-400 font-bold ml-1">اختيار سريع:</span>
                  {currentCityObj.districts.slice(0, 5).map((d) => (
                    <button
                      key={d}
                      type="button"
                      onClick={() => {
                        const newLabel = selectedDistrict.includes("شارع") || selectedDistrict.includes("حارة")
                          ? `مديرية ${d} - ${selectedDistrict}`
                          : `مديرية ${d}`;
                        setSelectedDistrict(newLabel);
                      }}
                      className="px-2 py-0.5 rounded-md bg-slate-200 dark:bg-slate-700 hover:bg-indigo-600 hover:text-white text-slate-700 dark:text-slate-300 text-[10px] font-bold transition-colors"
                    >
                      + {d}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Quick Search Box */}
            <div>
              <label className="block font-extrabold text-slate-700 dark:text-slate-300 mb-1">
                البحث عن حي / شارع / معلم
              </label>
              <form onSubmit={handleSearchPlaces} className="flex gap-1.5">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="مثل: شارع المقالح، سوق الملح..."
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-bold focus:ring-2 focus:ring-indigo-500"
                />
                <button
                  type="submit"
                  disabled={isSearching}
                  className="px-3.5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold flex items-center justify-center shrink-0 shadow-sm"
                >
                  {isSearching ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
                </button>
              </form>
            </div>
          </div>

          {/* Search suggestions dropdown if any */}
          {searchResults.length > 0 && (
            <div className="p-2.5 bg-indigo-50 dark:bg-indigo-950/50 border border-indigo-200 dark:border-indigo-800 rounded-2xl space-y-1">
              <span className="font-extrabold text-indigo-900 dark:text-indigo-300 block mb-1">
                نتائج البحث المتاحة (انقر للتنقل المباشر):
              </span>
              <div className="space-y-1 max-h-32 overflow-y-auto">
                {searchResults.map((item, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => {
                      const newLat = Number(parseFloat(item.lat).toFixed(5));
                      const newLng = Number(parseFloat(item.lon).toFixed(5));
                      setLat(newLat);
                      setLng(newLng);
                      setSearchResults([]);
                    }}
                    className="w-full text-right p-2 rounded-lg bg-white dark:bg-slate-900 hover:bg-indigo-100 dark:hover:bg-indigo-900/40 text-slate-800 dark:text-slate-200 text-[11px] font-bold border border-slate-200 dark:border-slate-800 transition-colors flex items-center justify-between"
                  >
                    <span className="truncate">{item.display_name}</span>
                    <span className="text-indigo-600 font-mono text-[10px] shrink-0 mr-2">
                      ({parseFloat(item.lat).toFixed(3)}, {parseFloat(item.lon).toFixed(3)})
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Map Toolbar Controls */}
          <div className="flex flex-wrap items-center justify-between gap-2 bg-slate-100 dark:bg-slate-800/70 p-2 rounded-2xl border border-slate-200 dark:border-slate-800">
            {/* Map Mode Toggle */}
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => setMapMode("STREET")}
                className={`px-3 py-1.5 rounded-xl font-extrabold text-[11px] transition-all flex items-center gap-1.5 ${
                  mapMode === "STREET"
                    ? "bg-indigo-600 text-white shadow-sm"
                    : "bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:bg-slate-200"
                }`}
              >
                <MapIcon className="w-3.5 h-3.5" />
                <span>خريطة الشوارع (Normal)</span>
              </button>
              <button
                type="button"
                onClick={() => setMapMode("SATELLITE")}
                className={`px-3 py-1.5 rounded-xl font-extrabold text-[11px] transition-all flex items-center gap-1.5 ${
                  mapMode === "SATELLITE"
                    ? "bg-indigo-600 text-white shadow-sm"
                    : "bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:bg-slate-200"
                }`}
              >
                <Layers className="w-3.5 h-3.5" />
                <span>الأقمار الصناعية (Satellite)</span>
              </button>
            </div>

            {/* GPS Detection Button */}
            <button
              type="button"
              onClick={handleDetectGPS}
              disabled={isLocating}
              className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-extrabold text-[11px] flex items-center gap-1.5 shadow-sm transition-all"
            >
              {isLocating ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <LocateFixed className="w-3.5 h-3.5" />
              )}
              <span>تحديد موقعي المباشر بالـ GPS</span>
            </button>
          </div>

          {/* Interactive Leaflet Map Container */}
          <div className="relative rounded-2xl overflow-hidden border-2 border-indigo-500/40 shadow-lg group">
            <div
              ref={mapContainerRef}
              className="h-72 sm:h-80 w-full z-0 bg-slate-900"
            />

            {/* Micro Nudge Overlay Controls */}
            <div className="absolute bottom-3 left-3 z-10 flex items-center gap-1 bg-slate-900/90 text-white backdrop-blur-xs p-1.5 rounded-xl border border-slate-700 shadow-lg dir-ltr">
              <span className="text-[10px] font-extrabold px-1 text-indigo-300">NUDGE:</span>
              <button
                type="button"
                onClick={() => handleNudge("UP")}
                className="px-2 py-1 bg-slate-800 hover:bg-indigo-600 rounded font-black text-[10px]"
                title="تحريك للأعلى"
              >
                ▲
              </button>
              <button
                type="button"
                onClick={() => handleNudge("DOWN")}
                className="px-2 py-1 bg-slate-800 hover:bg-indigo-600 rounded font-black text-[10px]"
                title="تحريك للأسفل"
              >
                ▼
              </button>
              <button
                type="button"
                onClick={() => handleNudge("RIGHT")}
                className="px-2 py-1 bg-slate-800 hover:bg-indigo-600 rounded font-black text-[10px]"
                title="تحريك لليمين"
              >
                ►
              </button>
              <button
                type="button"
                onClick={() => handleNudge("LEFT")}
                className="px-2 py-1 bg-slate-800 hover:bg-indigo-600 rounded font-black text-[10px]"
                title="تحريك لليسار"
              >
                ◄
              </button>
            </div>

            {/* Instruction Badge */}
            <div className="absolute top-3 right-3 z-10 bg-slate-900/85 text-white px-3 py-1.5 rounded-xl text-[11px] font-bold shadow-md backdrop-blur-xs flex items-center gap-1.5 border border-slate-700 pointer-events-none">
              <MapPin className="w-3.5 h-3.5 text-rose-400 animate-pulse" />
              <span>انقر أو اسحب الدبوس لوضع الموقع الدقيق</span>
            </div>
          </div>

          {/* GPS Status message */}
          {gpsStatus && (
            <div className="p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 font-bold text-[11px] flex items-center gap-2 border border-slate-200 dark:border-slate-700">
              <Info className="w-4 h-4 text-indigo-500 shrink-0" />
              <span>{gpsStatus}</span>
            </div>
          )}

          {/* Editable Coordinates & Location Details */}
          <div className="p-3.5 bg-slate-50 dark:bg-slate-800/80 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-extrabold text-slate-800 dark:text-slate-200 text-xs flex items-center gap-1.5">
                <Compass className="w-4 h-4 text-indigo-500" />
                <span>إحداثيات الموقع الدقيقة (يمكن تعديلها يدوياً):</span>
              </span>
              <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded-md border border-emerald-200 dark:border-emerald-800">
                دقة عالية High-Precision GPS
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-500 dark:text-slate-400 font-extrabold mb-1">
                  خط العرض (Latitude)
                </label>
                <input
                  type="number"
                  step="0.00001"
                  value={lat}
                  onChange={(e) => setLat(Number(parseFloat(e.target.value) || 15.3694))}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white font-mono font-bold focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-slate-500 dark:text-slate-400 font-extrabold mb-1">
                  خط الطول (Longitude)
                </label>
                <input
                  type="number"
                  step="0.00001"
                  value={lng}
                  onChange={(e) => setLng(Number(parseFloat(e.target.value) || 44.1910))}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white font-mono font-bold focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>

            {/* Auto-detected location summary */}
            <div className="flex flex-wrap items-center justify-between gap-2 p-2.5 bg-indigo-50 dark:bg-indigo-950/40 rounded-xl border border-indigo-200 dark:border-indigo-800 text-xs">
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-rose-500 shrink-0" />
                <span className="font-extrabold text-indigo-950 dark:text-indigo-200">
                  المنطقة المحددة تلقائياً على الخريطة:
                </span>
              </div>
              <div className="font-black text-indigo-700 dark:text-indigo-300 bg-white dark:bg-slate-900 px-3 py-1 rounded-lg border border-indigo-200 dark:border-indigo-800 shadow-xs">
                📍 {selectedCity} {selectedDistrict ? `- ${selectedDistrict}` : ""}
              </div>
            </div>
          </div>

          {/* Action Footer */}
          <div className="pt-3 flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-slate-200 dark:border-slate-800">
            <a
              href={`https://www.google.com/maps/search/?api=1&query=${lat},${lng}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-indigo-600 dark:text-indigo-400 hover:underline font-bold flex items-center gap-1.5"
            >
              <Navigation className="w-4 h-4 text-indigo-500" />
              <span>معاينة الموقع والاتجاهات على خرائط Google الخارجية</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>

            <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold transition-colors"
              >
                إلغاء
              </button>
              <button
                type="button"
                onClick={handleConfirm}
                className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-black shadow-md flex items-center gap-2 cursor-pointer transition-transform active:scale-95"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>تأكيد وحفظ الموقع المختار 📍</span>
              </button>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};
