import React, { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import {
  Ambulance,
  PhoneCall,
  MapPin,
  Navigation,
  CheckCircle2,
  AlertTriangle,
  Loader2,
  Radio,
  ShieldAlert,
  LocateFixed,
  RefreshCw,
} from "lucide-react";
import { supabase } from "../../lib/supabaseClient";
import { useGeolocation } from "../../context/GeolocationContext";
import { useAuth } from "../../context/AuthContext";
import { useToast } from "../../context/ToastContext";
import { formatDistance } from "../../lib/utils";

// Status pills for emergency_requests.status
const STATUS_CONFIG = {
  requested: { label: "Requested", cls: "bg-amber-100 text-amber-700" },
  accepted: { label: "Accepted ✓", cls: "bg-blue-100 text-blue-700" },
  on_the_way: { label: "En Route 🚑", cls: "bg-brand-100 text-brand-700" },
  reached: { label: "Driver Arrived!", cls: "bg-emerald-100 text-emerald-700" },
  completed: { label: "Completed", cls: "bg-slate-100 text-slate-500" },
  cancelled: { label: "Cancelled", cls: "bg-red-100 text-red-600" },
};

function StatusPill({ status }) {
  const cfg = STATUS_CONFIG[status] || { label: status, cls: "bg-slate-100 text-slate-600" };
  return (
    <span className={`text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-full ${cfg.cls}`}>
      {cfg.label}
    </span>
  );
}

// Haversine distance (km)
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

// Status timeline order
const TIMELINE_STEPS = ["requested", "accepted", "on_the_way", "reached", "completed"];

export default function Emergency() {
  const { userLocation, geoStatus, requestLocation } = useGeolocation();
  const { user } = useAuth();
  const toast = useToast();

  const [ambulances, setAmbulances] = useState([]);
  const [loadingAmb, setLoadingAmb] = useState(false);
  const [requesting, setRequesting] = useState(false);
  const [requestId, setRequestId] = useState(null);
  const [requestStatus, setRequestStatus] = useState(null);
  const [selectedAmbulance, setSelectedAmbulance] = useState(null);
  const [error, setError] = useState(null);
  const realtimeRef = useRef(null);

  // Load nearest ambulances using the RPC
  async function loadAmbulances() {
    setLoadingAmb(true);
    setError(null);
    try {
      const { data, error: rpcErr } = await supabase.rpc("nearest_ambulances", {
        lat: userLocation.lat,
        lng: userLocation.lng,
        lim: 3,
      });

      if (!rpcErr && data && data.length > 0) {
        setAmbulances(data);
        return;
      }

      // Fallback: fetch available ambulances and sort client-side
      const { data: fallback, error: fbErr } = await supabase
        .from("ambulances")
        .select("id, vehicle_number, type, is_available, is_demo, location")
        .eq("is_available", true)
        .limit(10);

      if (fbErr) throw fbErr;

      const sorted = (fallback || [])
        .map((a) => {
          let lat = null, lng = null;
          if (a.location?.coordinates) [lng, lat] = a.location.coordinates;
          const distance_km = haversine(userLocation.lat, userLocation.lng, lat, lng);
          return { ...a, lat, lng, distance_km };
        })
        .sort((a, b) => (a.distance_km ?? 999) - (b.distance_km ?? 999))
        .slice(0, 3);

      setAmbulances(sorted);
    } catch (err) {
      console.error("Failed to load ambulances:", err);
      setError("Could not load nearby ambulances. You can still call 108 directly.");
    } finally {
      setLoadingAmb(false);
    }
  }

  // Subscribe to request status via Realtime
  function subscribeToRequest(id) {
    if (realtimeRef.current) realtimeRef.current.unsubscribe();
    realtimeRef.current = supabase
      .channel(`er_request_${id}`)
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "emergency_requests",
          filter: `id=eq.${id}`,
        },
        (payload) => setRequestStatus(payload.new.status)
      )
      .subscribe();
  }

  // Request an ambulance
  async function handleRequestAmbulance() {
    if (!selectedAmbulance) return;
    if (!user) {
      setError("Please sign in to book an ambulance digitally. Or call 108 directly.");
      return;
    }
    setRequesting(true);
    setError(null);
    try {
      const { data, error: insertErr } = await supabase
        .from("emergency_requests")
        .insert({
          user_id: user.id,
          ambulance_id: selectedAmbulance.id,
          pickup_location: `POINT(${userLocation.lng} ${userLocation.lat})`,
          pickup_address: `${userLocation.lat.toFixed(5)}°N, ${userLocation.lng.toFixed(5)}°E`,
          status: "requested",
        })
        .select()
        .single();

      if (insertErr) throw insertErr;
      setRequestId(data.id);
      setRequestStatus("requested");
      subscribeToRequest(data.id);
      toast.success("Ambulance requested! Stay near entrance.");
    } catch (err) {
      console.error("Request failed:", err);
      const msg =
        err.code === "42501"
          ? "Permission denied. Please sign in to book an ambulance."
          : "Ambulance request failed. Please call 108 immediately.";
      setError(msg);
      toast.error(msg);
    } finally {
      setRequesting(false);
    }
  }

  useEffect(() => {
    loadAmbulances();
  }, [userLocation.lat, userLocation.lng]);

  useEffect(() => {
    return () => { if (realtimeRef.current) realtimeRef.current.unsubscribe(); };
  }, []);

  const currentStepIdx = TIMELINE_STEPS.indexOf(requestStatus);

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 space-y-6">

      {/* ── Red emergency header ── */}
      <div className="bg-gradient-to-br from-red-600 to-red-700 rounded-3xl p-6 sm:p-8 text-white shadow-xl shadow-red-200">
        <div className="flex items-center gap-4 mb-5">
          <div className="w-14 h-14 rounded-2xl bg-white/20 flex items-center justify-center flex-shrink-0">
            <Ambulance className="w-8 h-8 text-white animate-pulse" />
          </div>
          <div>
            <h1 className="text-2xl font-black tracking-tight">Emergency Ambulance</h1>
            <p className="text-red-200 text-xs mt-0.5">
              Vadodara Rapid Response · Real-time dispatch
            </p>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <a
            href="tel:108"
            className="flex items-center justify-center space-x-2 p-4 rounded-2xl bg-white text-red-700 font-black text-sm hover:bg-red-50 transition-all shadow-md active:scale-95"
          >
            <PhoneCall className="w-5 h-5" />
            <span>Call 108</span>
          </a>
          <a
            href="tel:112"
            className="flex items-center justify-center space-x-2 p-4 rounded-2xl bg-white/20 border border-white/40 text-white font-bold text-sm hover:bg-white/30 transition-all active:scale-95"
          >
            <PhoneCall className="w-5 h-5" />
            <span>Call 112</span>
          </a>
        </div>
      </div>

      {/* ── Location status ── */}
      <div className="bg-white rounded-2xl border border-slate-200 px-4 py-3 flex items-center justify-between text-xs">
        <div className="flex items-center space-x-2.5">
          <div className={`w-2.5 h-2.5 rounded-full ${geoStatus === "granted" ? "bg-emerald-500 animate-pulse" : "bg-amber-400"}`} />
          <span className="font-semibold text-slate-700">
            {geoStatus === "granted"
              ? `GPS Active · ${userLocation.lat.toFixed(4)}°N, ${userLocation.lng.toFixed(4)}°E`
              : "Using Vadodara City Centre (GPS unavailable)"}
          </span>
        </div>
        <button
          onClick={() => { requestLocation(); setTimeout(loadAmbulances, 1500); }}
          className="flex items-center space-x-1 text-brand-700 font-bold hover:text-brand-800"
        >
          <LocateFixed className="w-3.5 h-3.5" />
          <span>Update</span>
        </button>
      </div>

      {/* ── Nearest ambulances ── */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-bold text-slate-900">Nearest Available Ambulances</h2>
          <button
            onClick={loadAmbulances}
            disabled={loadingAmb}
            className="flex items-center space-x-1 text-xs text-brand-700 font-semibold hover:text-brand-800 disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loadingAmb ? "animate-spin" : ""}`} />
            <span>Refresh</span>
          </button>
        </div>

        {loadingAmb && (
          <div className="flex items-center justify-center py-8 space-x-2 text-slate-400 text-sm">
            <Loader2 className="w-5 h-5 animate-spin" />
            <span>Finding nearest ambulances…</span>
          </div>
        )}

        {!loadingAmb && error && (
          <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 text-xs text-amber-800 flex items-start space-x-2">
            <AlertTriangle className="w-4 h-4 flex-shrink-0 mt-0.5 text-amber-600" />
            <span>{error}</span>
          </div>
        )}

        {!loadingAmb && !error && ambulances.length === 0 && (
          <div className="bg-slate-50 rounded-2xl border border-slate-200 p-6 text-center text-xs text-slate-500 space-y-1">
            <ShieldAlert className="w-8 h-8 text-slate-300 mx-auto mb-2" />
            <p className="font-semibold text-slate-700">No ambulances found nearby</p>
            <p>Please call 108 directly for emergency assistance.</p>
          </div>
        )}

        {!loadingAmb && ambulances.length > 0 && (
          <div className="space-y-3">
            {ambulances.map((amb) => {
              const isSelected = selectedAmbulance?.id === amb.id;
              return (
                <button
                  key={amb.id}
                  onClick={() => !requestId && setSelectedAmbulance(isSelected ? null : amb)}
                  disabled={!!requestId}
                  className={`w-full text-left p-4 rounded-2xl border-2 transition-all ${
                    isSelected
                      ? "border-brand-500 bg-brand-50 shadow-sm"
                      : "border-slate-200 bg-white hover:border-slate-300 hover:shadow-sm"
                  } disabled:cursor-default`}
                >
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${isSelected ? "bg-brand-600 text-white" : "bg-slate-100 text-slate-600"}`}>
                        <Ambulance className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-slate-900">{amb.vehicle_number}</p>
                        <p className="text-xs text-slate-500 capitalize">{amb.type || "Basic"} Ambulance{amb.is_demo ? " · Demo" : ""}</p>
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-1.5">
                      <span className="text-[10px] font-bold bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full uppercase">
                        Available
                      </span>
                      <span className="text-xs font-bold text-brand-700">
                        {amb.distance_km != null ? formatDistance(amb.distance_km) : "—"}
                      </span>
                    </div>
                  </div>
                  {isSelected && (
                    <div className="mt-2 pt-2 border-t border-brand-200 flex items-center space-x-1.5 text-[11px] text-brand-700 font-semibold">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Selected — tap "Request Ambulance" below</span>
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* ── Request button ── */}
      {!requestId && (
        <button
          onClick={handleRequestAmbulance}
          disabled={!selectedAmbulance || requesting}
          className="w-full py-4 rounded-2xl bg-red-600 hover:bg-red-700 disabled:opacity-40 disabled:cursor-not-allowed text-white font-black text-sm transition-all shadow-md shadow-red-200 active:scale-[0.98] flex items-center justify-center space-x-2"
        >
          {requesting ? (
            <><Loader2 className="w-5 h-5 animate-spin" /><span>Requesting…</span></>
          ) : (
            <><Ambulance className="w-5 h-5" /><span>{selectedAmbulance ? "Request This Ambulance" : "Select an Ambulance Above"}</span></>
          )}
        </button>
      )}

      {/* ── Active request tracker ── */}
      {requestId && (
        <div className="bg-white rounded-3xl border-2 border-brand-500 p-6 space-y-4 shadow-md">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-brand-100 flex items-center justify-center">
              <Radio className="w-5 h-5 text-brand-600 animate-pulse" />
            </div>
            <div>
              <p className="text-sm font-black text-slate-900">Ambulance Requested!</p>
              <p className="text-xs text-slate-500">ID: {requestId.slice(0, 8)}…</p>
            </div>
          </div>

          <div className="space-y-2">
            <p className="text-xs font-semibold text-slate-700 uppercase tracking-wide">Live Status</p>
            <StatusPill status={requestStatus || "requested"} />

            {/* Timeline */}
            <div className="flex items-center gap-1 pt-2 overflow-x-auto pb-1">
              {TIMELINE_STEPS.slice(0, 4).map((s, i) => {
                const done = i <= currentStepIdx;
                return (
                  <React.Fragment key={s}>
                    <div className={`text-[9px] font-bold px-2 py-1 rounded-md uppercase whitespace-nowrap flex-shrink-0 ${done ? "bg-brand-600 text-white" : "bg-slate-100 text-slate-400"}`}>
                      {s.replace("_", " ")}
                    </div>
                    {i < 3 && <div className={`flex-1 h-0.5 rounded min-w-[12px] ${done ? "bg-brand-400" : "bg-slate-200"}`} />}
                  </React.Fragment>
                );
              })}
            </div>
          </div>

          <div className="pt-2 border-t border-slate-100 text-xs text-slate-500 flex items-start space-x-1.5">
            <AlertTriangle className="w-3.5 h-3.5 text-amber-500 flex-shrink-0 mt-0.5" />
            <span>Stay near the entrance. Also call <strong>108</strong> to speak to dispatch directly.</span>
          </div>
        </div>
      )}

      {/* ── Nearby hospitals link ── */}
      <div className="bg-slate-50 rounded-2xl border border-slate-200 p-4 flex items-center justify-between">
        <div>
          <p className="text-xs font-bold text-slate-900">Need to go to a hospital?</p>
          <p className="text-[11px] text-slate-500 mt-0.5">Browse 24×7 emergency hospitals in Vadodara</p>
        </div>
        <Link to="/nearby/hospitals" className="text-xs font-bold text-brand-700 hover:text-brand-800 flex items-center space-x-1">
          <span>View Hospitals</span>
          <Navigation className="w-3.5 h-3.5" />
        </Link>
      </div>
    </div>
  );
}
