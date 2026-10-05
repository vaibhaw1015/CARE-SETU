import React, { useState, useEffect } from "react";
import {
  CalendarHeart,
  MapPin,
  Calendar,
  CheckCircle2,
  ExternalLink,
  Loader2,
  AlertCircle,
  Map,
  List,
} from "lucide-react";
import { supabase } from "../../lib/supabaseClient";
import { formatDate, getGoogleMapsSearchUrl } from "../../lib/utils";
import { useGeolocation } from "../../context/GeolocationContext";
import MapView from "../../components/MapView";

// Demo fallback — 5 Vadodara health camps
const DEMO_CAMPS = [
  {
    id: "40000000-0000-0000-0000-000000000001",
    title: "Free Cardiac & BP Screening Camp",
    organizer: "Vadodara Rotary Health Mission",
    description:
      "Complimentary ECG, Blood Pressure checkup, and cardiologist consultations for senior citizens.",
    address: "Sayaji Baug Garden Community Hall, Sayajigunj, Vadodara, Gujarat 390020",
    start_date: "2026-10-10",
    end_date: "2026-10-12",
    is_free: true,
    is_demo: true,
    lat: 22.3108,
    lng: 73.1889,
  },
  {
    id: "40000000-0000-0000-0000-000000000002",
    title: "Community Eye Checkup & Cataract Screening",
    organizer: "Gujarat Blindness Control Society",
    description:
      "Free vision testing, refraction checks, glaucoma assessment, and subsidised cataract surgery enrollments.",
    address: "Rotary Hall, Near Bahucharaji Temple, Karelibaug, Vadodara, Gujarat 390018",
    start_date: "2026-10-14",
    end_date: "2026-10-16",
    is_free: true,
    is_demo: true,
    lat: 22.3247,
    lng: 73.2012,
  },
  {
    id: "40000000-0000-0000-0000-000000000003",
    title: "Women & Child Wellness Camp",
    organizer: "CareSetu Community Outreach",
    description:
      "Pediatric consultations, nutrition advice, hemoglobin screening, and basic gynecological consults.",
    address: "Gotri Community Health Centre, Near Gotri Lake, Vadodara, Gujarat 390021",
    start_date: "2026-10-18",
    end_date: "2026-10-20",
    is_free: true,
    is_demo: true,
    lat: 22.3301,
    lng: 73.1524,
  },
  {
    id: "40000000-0000-0000-0000-000000000004",
    title: "Geriatric Care & Diabetes Detection Camp",
    organizer: "Vadodara Elders Welfare Trust",
    description:
      "Fasting blood sugar, HbA1c tests, bone mineral density checks, and diet counseling for diabetes.",
    address: "Pensioners Bhavan, Akota Stadium Road, Akota, Vadodara, Gujarat 390020",
    start_date: "2026-10-22",
    end_date: "2026-10-23",
    is_free: true,
    is_demo: true,
    lat: 22.3094,
    lng: 73.1746,
  },
  {
    id: "40000000-0000-0000-0000-000000000005",
    title: "Mega Blood Donation & General Health Camp",
    organizer: "Red Cross Society Vadodara",
    description:
      "Blood donation drive, general consultations, BMI assessment, and basic prescription medicines.",
    address: "MSU Pavilion Ground, Near Fatehgunj Post Office, Vadodara, Gujarat 390002",
    start_date: "2026-10-25",
    end_date: "2026-10-26",
    is_free: true,
    is_demo: true,
    lat: 22.3225,
    lng: 73.1968,
  },
];

/** Returns days until a date string; negative = past */
function daysUntil(dateStr) {
  if (!dateStr) return null;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return Math.ceil((new Date(dateStr) - today) / 86400000);
}

function StatusBadge({ startDate, endDate }) {
  const start = daysUntil(startDate);
  const end = daysUntil(endDate);
  if (start === null) return null;
  if (end !== null && end < 0)
    return (
      <span className="text-[10px] font-bold bg-slate-100 text-slate-500 px-2 py-0.5 rounded-full">
        Ended
      </span>
    );
  if (start <= 0)
    return (
      <span className="text-[10px] font-bold bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full animate-pulse">
        Now
      </span>
    );
  if (start <= 3)
    return (
      <span className="text-[10px] font-bold bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full">
        In {start}d
      </span>
    );
  return (
    <span className="text-[10px] font-bold bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full">
      In {start}d
    </span>
  );
}

export default function Camps() {
  const { userLocation } = useGeolocation();
  const [camps, setCamps] = useState(DEMO_CAMPS);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState("list");

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from("health_camps")
          .select("*")
          .order("start_date");
        if (error || !data || data.length === 0) {
          setCamps(DEMO_CAMPS);
        } else {
          const mapped = data.map((c) => {
            let lat = null,
              lng = null;
            if (c.location?.coordinates) {
              [lng, lat] = c.location.coordinates;
            } else if (c.lat && c.lng) {
              lat = c.lat;
              lng = c.lng;
            }
            return { ...c, lat, lng };
          });
          setCamps(mapped.length > 0 ? mapped : DEMO_CAMPS);
        }
      } catch {
        setCamps(DEMO_CAMPS);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const mapMarkers = camps
    .filter((c) => c.lat && c.lng)
    .map((c) => ({
      id: c.id,
      name: c.title,
      lat: c.lat,
      lng: c.lng,
      isCamp: true,
      address: c.address,
    }));

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200/80 pb-6">
        <div>
          <div className="inline-flex items-center space-x-2 bg-emerald-50 text-emerald-800 border border-emerald-200 px-3 py-1 rounded-full text-xs font-bold mb-2">
            <CalendarHeart className="w-3.5 h-3.5 text-emerald-600" />
            <span>Vadodara Community Outreach</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            Free Health Camps &amp; Screenings
          </h1>
          <p className="text-slate-500 text-xs sm:text-sm mt-1">
            Upcoming free checkups, diabetes screenings, and consultations across Vadodara.
          </p>
        </div>

        {/* View toggle */}
        <div className="flex items-center bg-slate-100 rounded-xl p-1 self-start sm:self-auto">
          <button
            onClick={() => setViewMode("list")}
            className={`p-2 rounded-lg transition-colors ${
              viewMode === "list" ? "bg-white shadow-sm text-slate-900" : "text-slate-400"
            }`}
            title="List View"
          >
            <List className="w-4 h-4" />
          </button>
          <button
            onClick={() => setViewMode("map")}
            className={`p-2 rounded-lg transition-colors ${
              viewMode === "map" ? "bg-white shadow-sm text-slate-900" : "text-slate-400"
            }`}
            title="Map View"
          >
            <Map className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Loading */}
      {loading && (
        <div className="flex items-center justify-center py-12 space-x-2 text-slate-400 text-sm">
          <Loader2 className="w-5 h-5 animate-spin" />
          <span>Loading health camps…</span>
        </div>
      )}

      {!loading && (
        <>
          {/* Map View */}
          {viewMode === "map" && (
            <MapView
              center={userLocation}
              userLocation={userLocation}
              markers={mapMarkers}
              height="440px"
            />
          )}

          {/* List View */}
          {viewMode === "list" && (
            <>
              {camps.length === 0 ? (
                <div className="bg-white rounded-3xl p-12 text-center border border-slate-200 space-y-3">
                  <AlertCircle className="w-10 h-10 text-slate-300 mx-auto" />
                  <h3 className="text-base font-bold text-slate-800">No camps scheduled</h3>
                  <p className="text-xs text-slate-500">
                    Check back soon for upcoming health camps in Vadodara.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {camps.map((camp) => {
                    const startDate = camp.start_date || camp.startDate;
                    const endDate = camp.end_date || camp.endDate;
                    return (
                      <div
                        key={camp.id}
                        className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200 flex flex-col justify-between space-y-4"
                      >
                        <div className="space-y-3">
                          <div className="flex items-start justify-between gap-2">
                            <h3 className="text-base font-bold text-slate-900 leading-snug flex-1 min-w-0">
                              {camp.title}
                            </h3>
                            <div className="flex items-center gap-1.5 flex-shrink-0">
                              {(camp.is_free !== false) && (
                                <span className="text-[11px] font-extrabold uppercase bg-emerald-100 text-emerald-800 px-2.5 py-0.5 rounded-full">
                                  FREE
                                </span>
                              )}
                              {camp.is_demo && (
                                <span className="text-[10px] font-bold uppercase bg-amber-100 text-amber-800 px-2 py-0.5 rounded-md">
                                  Demo
                                </span>
                              )}
                              <StatusBadge startDate={startDate} endDate={endDate} />
                            </div>
                          </div>

                          <p className="text-xs text-brand-700 font-semibold">{camp.organizer}</p>
                          <p className="text-xs text-slate-600 leading-relaxed">{camp.description}</p>

                          <div className="pt-1 space-y-1.5 text-xs text-slate-500">
                            <div className="flex items-center space-x-2">
                              <Calendar className="w-3.5 h-3.5 text-slate-400" />
                              <span>
                                {formatDate(startDate)} — {formatDate(endDate)}
                              </span>
                            </div>
                            <div className="flex items-start space-x-2">
                              <MapPin className="w-3.5 h-3.5 text-slate-400 flex-shrink-0 mt-0.5" />
                              <span>{camp.address}</span>
                            </div>
                          </div>
                        </div>

                        <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                          <span className="text-[11px] text-emerald-700 font-semibold flex items-center space-x-1">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>No Registration Fee</span>
                          </span>
                          <a
                            href={getGoogleMapsSearchUrl(camp.title, camp.address)}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center space-x-1 text-xs font-bold text-slate-900 hover:text-brand-600 transition-colors"
                          >
                            <span>Camp Location</span>
                            <ExternalLink className="w-3 h-3" />
                          </a>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </>
          )}
        </>
      )}
    </div>
  );
}
