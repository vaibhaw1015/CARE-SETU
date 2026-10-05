import React, { useState, useEffect, useMemo } from "react";
import {
  MapPin,
  Phone,
  PhoneCall,
  Navigation,
  ExternalLink,
  ShieldAlert,
  AlertCircle,
  Search,
  Sliders,
  Info,
  Map,
  List,
  LocateFixed,
  Loader2,
} from "lucide-react";
import { supabase } from "../../lib/supabaseClient";
import {
  getGoogleMapsSearchUrl,
  getGoogleMapsDirectionsUrl,
  formatDistance,
} from "../../lib/utils";
import { useGeolocation } from "../../context/GeolocationContext";
import MapView from "../../components/MapView";

// Guaranteed local fallback — 10 real Vadodara hospitals
const REAL_VADODARA_HOSPITALS = [
  {
    id: "20000000-0000-0000-0000-000000000001",
    name: "Zydus Multispeciality and Cancer Hospital",
    address: "Akshar Chowk, Old Padra Rd, Hira Nagar, Tandalja, Vadodara, Gujarat 390020",
    phone: null,
    is_emergency: true,
    specialties: ["Oncology", "Multispeciality", "Emergency Care", "Critical Care"],
    lat: 22.2858,
    lng: 73.1554,
  },
  {
    id: "20000000-0000-0000-0000-000000000002",
    name: "Aadicura Superspeciality Hospital",
    address: "Jetalpur Rd, behind Gujarat Kidney Hospital, Anand Nagar, Haripura, Vadodara, Gujarat 390007",
    phone: null,
    is_emergency: true,
    specialties: ["Superspeciality", "Cardiology", "Nephrology", "Emergency Care"],
    lat: 22.3082,
    lng: 73.1678,
  },
  {
    id: "20000000-0000-0000-0000-000000000003",
    name: "Bhailal Amin General Hospital (BAGH)",
    address: "Bhailal Amin Marg, Gorwa, Vadodara, Gujarat 390003",
    phone: null,
    is_emergency: true,
    specialties: ["General Hospital", "Trauma Care", "Cardiology", "Neurology"],
    lat: 22.3328,
    lng: 73.1651,
  },
  {
    id: "20000000-0000-0000-0000-000000000004",
    name: "SMS Hospital - Shivanshu Multispeciality Hospital",
    address: "2nd, 3rd Floor, Ganesh Plaza, near Maneja Crossing Road, Makarpura, Vadodara, Gujarat 390013",
    phone: "+91 81419 65965",
    is_emergency: false,
    specialties: ["Multispeciality", "General Medicine", "Orthopedics"],
    lat: 22.2536,
    lng: 73.1973,
  },
  {
    id: "20000000-0000-0000-0000-000000000005",
    name: "Amicare Multispeciality Hospital",
    address: "Nilay Park Society, Ajwa Rd, beside Radha Swami Satsang Hall, Kamla Nagar, Vadodara, Gujarat 390019",
    phone: "+91 92748 18895",
    is_emergency: false,
    specialties: ["Multispeciality", "General Surgery", "Pediatrics"],
    lat: 22.3094,
    lng: 73.2381,
  },
  {
    id: "20000000-0000-0000-0000-000000000006",
    name: "Savita Superspeciality Hospital",
    address: "Waghodia Rd, Sarthi Nagar 2, Kendranagar, Vadodara, Gujarat 390019",
    phone: "+91 265 257 8849",
    is_emergency: false,
    specialties: ["Superspeciality", "Gastroenterology", "Urology"],
    lat: 22.2965,
    lng: 73.2365,
  },
  {
    id: "20000000-0000-0000-0000-000000000007",
    name: "Samanvay Hospital",
    address: "Near St. Kabir School, Krishnadham Society, Saiyed Vasna, Vadodara, Gujarat 390012",
    phone: null,
    is_emergency: true,
    specialties: ["Emergency Care", "Critical Care", "Orthopedics", "Cardiology"],
    lat: 22.2991,
    lng: 73.1432,
  },
  {
    id: "20000000-0000-0000-0000-000000000008",
    name: "Sterling Hospital",
    address: "Race Course Road, Opposite Inox Cinema, Hari Nagar, Vadodara, Gujarat 390007",
    phone: null,
    is_emergency: true,
    specialties: ["Tertiary Care", "Emergency Trauma", "Neuroscience", "Organ Transplant"],
    lat: 22.3129,
    lng: 73.1667,
  },
  {
    id: "20000000-0000-0000-0000-000000000009",
    name: "Sir Sayajirao General Hospital (SSG Hospital) - Government",
    address: "Jail Road, Vadodara, Gujarat 390001",
    phone: null,
    is_emergency: true,
    specialties: ["Government Emergency", "Trauma Center", "All Specialties", "Pediatrics"],
    lat: 22.3045,
    lng: 73.1932,
  },
  {
    id: "20000000-0000-0000-0000-000000000010",
    name: "Jamnabai General Hospital - Government",
    address: "Pani Gate Road, Mandvi, Vadodara, Gujarat 390006",
    phone: null,
    is_emergency: false,
    specialties: ["Government General Hospital", "Outpatient Services", "Maternity"],
    lat: 22.2987,
    lng: 73.2104,
  },
];

// Haversine distance in km
function haversine(lat1, lon1, lat2, lon2) {
  if (!lat1 || !lon1 || !lat2 || !lon2) return null;
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) ** 2;
  return Math.round(6371 * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)) * 10) / 10;
}

export default function Hospitals() {
  const { userLocation, geoStatus, requestLocation } = useGeolocation();

  const [radiusKm, setRadiusKm] = useState(25);
  const [onlyEmergency, setOnlyEmergency] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [hospitals, setHospitals] = useState(REAL_VADODARA_HOSPITALS);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState("list"); // 'list' | 'map'

  // Fetch from Supabase with local fallback
  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const { data, error } = await supabase.from("hospitals").select("*").order("name");
        if (error || !data || data.length === 0) {
          setHospitals(REAL_VADODARA_HOSPITALS);
        } else {
          const mapped = data.map((h) => {
            let lat = null, lng = null;
            if (h.location?.coordinates) {
              lng = h.location.coordinates[0];
              lat = h.location.coordinates[1];
            } else if (h.lat && h.lng) {
              lat = h.lat; lng = h.lng;
            }
            return { ...h, lat, lng };
          });
          setHospitals(mapped.length > 0 ? mapped : REAL_VADODARA_HOSPITALS);
        }
      } catch {
        setHospitals(REAL_VADODARA_HOSPITALS);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  // Compute distances + apply filters
  const processed = useMemo(() => {
    return hospitals
      .map((h) => ({
        ...h,
        distance: haversine(userLocation.lat, userLocation.lng, h.lat, h.lng),
      }))
      .filter((h) => {
        if (onlyEmergency && !h.is_emergency) return false;
        if (searchTerm) {
          const q = searchTerm.toLowerCase();
          if (
            !h.name?.toLowerCase().includes(q) &&
            !h.address?.toLowerCase().includes(q) &&
            !h.specialties?.some((s) => s.toLowerCase().includes(q))
          )
            return false;
        }
        if (h.distance !== null && h.distance > radiusKm) return false;
        return true;
      })
      .sort((a, b) => {
        if (a.distance === null) return 1;
        if (b.distance === null) return -1;
        return a.distance - b.distance;
      });
  }, [hospitals, userLocation, radiusKm, onlyEmergency, searchTerm]);

  // Map markers
  const mapMarkers = processed
    .filter((h) => h.lat && h.lng)
    .map((h) => ({
      id: h.id,
      name: h.name,
      lat: h.lat,
      lng: h.lng,
      isEmergency: h.is_emergency,
      distance: h.distance,
      address: h.address,
      phone: h.phone,
    }));

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-6">
      {/* ── Page Header ── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200/80 pb-6">
        <div>
          <div className="inline-flex items-center space-x-2 bg-amber-50 text-amber-800 border border-amber-200 px-3 py-1 rounded-full text-xs font-bold mb-2">
            <MapPin className="w-3.5 h-3.5 text-amber-600" />
            <span>Vadodara City · 10 Real Hospitals</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            Nearby Hospitals &amp; Emergency Care
          </h1>
          <p className="text-slate-500 text-xs sm:text-sm mt-1">
            Real-time distance, 24×7 emergency badges, and one-tap navigation.
          </p>
        </div>

        {/* Emergency call buttons */}
        <div className="flex items-center gap-2.5 flex-shrink-0">
          <a
            href="tel:108"
            className="flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold shadow-md shadow-red-200 transition-all active:scale-95"
          >
            <PhoneCall className="w-4 h-4" />
            <span>Call 108</span>
          </a>
          <a
            href="tel:112"
            className="flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition-all active:scale-95"
          >
            <PhoneCall className="w-4 h-4 text-red-400" />
            <span>Call 112</span>
          </a>
        </div>
      </div>

      {/* ── GPS Status Banner ── */}
      <div className="bg-white px-4 py-3 rounded-2xl border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
        <div className="flex items-center space-x-2.5">
          <div
            className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${
              geoStatus === "granted"
                ? "bg-emerald-500 animate-pulse"
                : geoStatus === "detecting"
                ? "bg-blue-400 animate-pulse"
                : geoStatus === "denied"
                ? "bg-amber-500"
                : "bg-slate-400"
            }`}
          />
          <span className="font-semibold text-slate-700">
            {geoStatus === "granted"
              ? `Live GPS · ${userLocation.lat.toFixed(4)}°N, ${userLocation.lng.toFixed(4)}°E`
              : geoStatus === "detecting"
              ? "Detecting your location…"
              : geoStatus === "denied"
              ? "GPS unavailable — using Vadodara City Centre"
              : "Using Vadodara City Centre"}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={requestLocation}
            className="inline-flex items-center space-x-1 text-xs font-bold text-brand-700 hover:text-brand-800 bg-brand-50 px-3 py-1 rounded-lg transition-colors"
          >
            <LocateFixed className="w-3.5 h-3.5" />
            <span>{geoStatus === "granted" ? "Refresh GPS" : "Use My Location"}</span>
          </button>
          <span className="text-slate-300">|</span>
          <span className="text-slate-400 font-medium">Vadodara, Gujarat</span>
        </div>
      </div>

      {/* ── Search + Filters + View Toggle ── */}
      <div className="bg-white p-4 sm:p-5 rounded-3xl border border-slate-200/80 shadow-sm space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
          {/* Search */}
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Hospital name, specialty, area…"
              className="w-full pl-9 pr-3 py-2.5 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500"
            />
          </div>

          {/* Radius slider */}
          <div className="flex items-center space-x-3 px-2">
            <Sliders className="w-4 h-4 text-slate-400 flex-shrink-0" />
            <div className="flex-1">
              <div className="flex justify-between text-[11px] font-bold text-slate-700 mb-1">
                <span>Radius:</span>
                <span className="text-brand-700">{radiusKm} km</span>
              </div>
              <input
                type="range"
                min="1"
                max="50"
                value={radiusKm}
                onChange={(e) => setRadiusKm(Number(e.target.value))}
                className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-brand-600"
              />
            </div>
          </div>

          {/* Emergency toggle + view mode */}
          <div className="flex items-center justify-end gap-2">
            <button
              onClick={() => setOnlyEmergency(!onlyEmergency)}
              className={`flex items-center space-x-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-colors ${
                onlyEmergency
                  ? "bg-red-600 text-white shadow-sm"
                  : "bg-slate-100 text-slate-700 hover:bg-slate-200"
              }`}
            >
              <ShieldAlert className="w-3.5 h-3.5" />
              <span>Emergency Only</span>
            </button>

            {/* List / Map view toggle */}
            <div className="flex items-center bg-slate-100 rounded-xl p-1">
              <button
                onClick={() => setViewMode("list")}
                className={`p-1.5 rounded-lg transition-colors ${
                  viewMode === "list" ? "bg-white shadow-sm text-slate-900" : "text-slate-400"
                }`}
                title="List View"
              >
                <List className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode("map")}
                className={`p-1.5 rounded-lg transition-colors ${
                  viewMode === "map" ? "bg-white shadow-sm text-slate-900" : "text-slate-400"
                }`}
                title="Map View"
              >
                <Map className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ── Loading ── */}
      {loading && (
        <div className="flex items-center justify-center py-12 space-x-2 text-slate-400 text-sm">
          <Loader2 className="w-5 h-5 animate-spin" />
          <span>Loading hospitals…</span>
        </div>
      )}

      {!loading && (
        <>
          {/* Results count */}
          <div className="flex items-center justify-between text-xs text-slate-500 px-1">
            <span>
              Showing <strong className="text-slate-700">{processed.length}</strong> hospitals
              {onlyEmergency && " · Emergency Only"}
              {searchTerm && ` · "${searchTerm}"`}
            </span>
            <button
              onClick={() => { setRadiusKm(25); setOnlyEmergency(false); setSearchTerm(""); }}
              className="text-brand-600 hover:text-brand-700 font-semibold"
            >
              Reset filters
            </button>
          </div>

          {/* ── MAP VIEW ── */}
          {viewMode === "map" && (
            <MapView
              center={userLocation}
              userLocation={userLocation}
              radiusKm={radiusKm}
              markers={mapMarkers}
              height="480px"
            />
          )}

          {/* ── LIST VIEW ── */}
          {viewMode === "list" && (
            <>
              {processed.length === 0 ? (
                <div className="bg-white rounded-3xl p-12 text-center border border-slate-200 space-y-3">
                  <AlertCircle className="w-10 h-10 text-slate-300 mx-auto" />
                  <h3 className="text-base font-bold text-slate-800">No Hospitals Found</h3>
                  <p className="text-xs text-slate-500 max-w-sm mx-auto">
                    Try expanding the radius slider or clearing the emergency filter.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  {processed.map((h) => (
                    <div
                      key={h.id || h.name}
                      className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200 flex flex-col justify-between space-y-4"
                    >
                      <div className="space-y-3">
                        {/* Header */}
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex-1 min-w-0">
                            <h3 className="text-sm font-bold text-slate-900 leading-snug">
                              {h.name}
                            </h3>
                            <p className="text-xs text-slate-500 flex items-start space-x-1.5 mt-1.5">
                              <MapPin className="w-3 h-3 text-slate-400 flex-shrink-0 mt-0.5" />
                              <span className="leading-relaxed">{h.address}</span>
                            </p>
                          </div>

                          <div className="flex flex-col items-end gap-1.5 flex-shrink-0">
                            {h.is_emergency && (
                              <span className="inline-flex items-center space-x-1 bg-red-100 text-red-700 border border-red-200 px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wide">
                                <ShieldAlert className="w-3 h-3 text-red-600" />
                                <span>24×7 ER</span>
                              </span>
                            )}
                            <span className="text-xs font-bold text-brand-700 bg-brand-50 px-2.5 py-1 rounded-lg">
                              {h.distance !== null ? formatDistance(h.distance) : "—"}
                            </span>
                          </div>
                        </div>

                        {/* Specialty pills */}
                        {h.specialties?.length > 0 && (
                          <div className="flex flex-wrap gap-1.5">
                            {h.specialties.map((s) => (
                              <span
                                key={s}
                                className="bg-slate-100 text-slate-600 px-2 py-0.5 rounded-md text-[10px] font-medium"
                              >
                                {s}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>

                      {/* Actions */}
                      <div className="pt-4 border-t border-slate-100 flex items-center justify-between gap-3">
                        {h.phone ? (
                          <a
                            href={`tel:${h.phone}`}
                            className="inline-flex items-center space-x-1.5 text-xs font-bold text-brand-700 bg-brand-50 hover:bg-brand-100 px-3.5 py-2 rounded-xl transition-colors"
                          >
                            <Phone className="w-3.5 h-3.5" />
                            <span>{h.phone}</span>
                          </a>
                        ) : (
                          <span className="inline-flex items-center space-x-1.5 text-xs text-slate-400 bg-slate-50 px-3 py-1.5 rounded-xl font-medium">
                            <Info className="w-3.5 h-3.5" />
                            <span>Phone not listed</span>
                          </span>
                        )}

                        {h.lat && h.lng ? (
                          <a
                            href={getGoogleMapsDirectionsUrl(h.lat, h.lng)}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center space-x-1.5 text-xs font-bold text-white bg-slate-900 hover:bg-brand-600 px-4 py-2 rounded-xl transition-colors"
                          >
                            <Navigation className="w-3.5 h-3.5" />
                            <span>Directions</span>
                          </a>
                        ) : (
                          <a
                            href={getGoogleMapsSearchUrl(h.name, h.address)}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center space-x-1.5 text-xs font-semibold text-brand-700 hover:text-brand-800"
                          >
                            <span>Search on Maps</span>
                            <ExternalLink className="w-3 h-3" />
                          </a>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
        </>
      )}

      {/* Disclaimer */}
      <div className="bg-slate-100/80 rounded-2xl p-4 text-center border border-slate-200">
        <p className="text-[11px] text-slate-500 font-medium">
          * Hospital details compiled from public information. Confirm availability before visiting.
          Phone numbers shown only where publicly verified.
        </p>
      </div>
    </div>
  );
}
