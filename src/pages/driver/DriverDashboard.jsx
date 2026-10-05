import React, { useState, useEffect, useRef, useCallback } from "react";
import { Link } from "react-router-dom";
import {
  Truck,
  PhoneCall,
  CheckCircle2,
  XCircle,
  MapPin,
  Navigation,
  Loader2,
  Radio,
  Clock,
  AlertTriangle,
  RefreshCw,
  Activity,
} from "lucide-react";
import { supabase } from "../../lib/supabaseClient";
import { useGeolocation } from "../../context/GeolocationContext";
import { useAuth } from "../../context/AuthContext";
import { formatDistance } from "../../lib/utils";

const STATUS_LABELS = {
  requested: { label: "Requested", cls: "bg-amber-100 text-amber-700" },
  accepted: { label: "Accepted", cls: "bg-brand-100 text-brand-700" },
  on_the_way: { label: "On The Way", cls: "bg-blue-100 text-blue-700" },
  reached: { label: "Reached", cls: "bg-purple-100 text-purple-700" },
  completed: { label: "Completed", cls: "bg-emerald-100 text-emerald-700" },
  cancelled: { label: "Cancelled", cls: "bg-red-100 text-red-700" },
};

function StatusPill({ status }) {
  const cfg = STATUS_LABELS[status] || { label: status, cls: "bg-slate-100 text-slate-600" };
  return (
    <span className={`text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-full ${cfg.cls}`}>
      {cfg.label}
    </span>
  );
}

export default function DriverDashboard() {
  const { user } = useAuth();
  const { userLocation, geoStatus, startWatching, stopWatching } = useGeolocation();

  const [myAmbulance, setMyAmbulance] = useState(null);
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [broadcasting, setBroadcasting] = useState(false);
  const [lastBroadcast, setLastBroadcast] = useState(null);
  const broadcastIntervalRef = useRef(null);
  const realtimeRef = useRef(null);

  // Fetch this driver's ambulance
  useEffect(() => {
    if (!user) return;
    async function fetchMyAmbulance() {
      const { data } = await supabase
        .from("ambulances")
        .select("*")
        .eq("driver_id", user.id)
        .single();
      setMyAmbulance(data || null);
      setLoading(false);
    }
    fetchMyAmbulance();
  }, [user]);

  // Subscribe to incoming requests for this ambulance
  useEffect(() => {
    if (!myAmbulance) return;

    async function fetchRequests() {
      const { data } = await supabase
        .from("emergency_requests")
        .select("*")
        .eq("ambulance_id", myAmbulance.id)
        .in("status", ["requested", "accepted", "on_the_way", "reached"])
        .order("created_at", { ascending: false });
      setRequests(data || []);
    }

    fetchRequests();

    // Realtime subscription
    realtimeRef.current = supabase
      .channel(`driver_requests_${myAmbulance.id}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "emergency_requests",
          filter: `ambulance_id=eq.${myAmbulance.id}`,
        },
        () => fetchRequests()
      )
      .subscribe();

    return () => {
      if (realtimeRef.current) realtimeRef.current.unsubscribe();
    };
  }, [myAmbulance]);

  // Broadcast GPS to ambulances table directly
  const broadcastLocation = useCallback(
    async (loc) => {
      if (!myAmbulance || !loc) return;
      try {
        await supabase
          .from("ambulances")
          .update({
            location: `POINT(${loc.lng} ${loc.lat})`,
            updated_at: new Date().toISOString(),
          })
          .eq("id", myAmbulance.id);
        setLastBroadcast(new Date());
      } catch (e) {
        console.warn("GPS broadcast failed:", e.message);
      }
    },
    [myAmbulance]
  );

  function toggleBroadcast() {
    if (broadcasting) {
      stopWatching();
      if (broadcastIntervalRef.current) clearInterval(broadcastIntervalRef.current);
      setBroadcasting(false);
    } else {
      startWatching((loc) => {
        broadcastLocation(loc);
      });
      broadcastIntervalRef.current = setInterval(() => {
        broadcastLocation(userLocation);
      }, 5000);
      setBroadcasting(true);
    }
  }

  useEffect(() => {
    return () => {
      stopWatching();
      if (broadcastIntervalRef.current) clearInterval(broadcastIntervalRef.current);
    };
  }, [stopWatching]);

  // Accept / Reject / Progress request
  async function updateRequest(requestId, newStatus) {
    await supabase
      .from("emergency_requests")
      .update({ status: newStatus, updated_at: new Date().toISOString() })
      .eq("id", requestId);
  }

  if (!user) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-12 text-center space-y-4">
        <div className="w-16 h-16 rounded-2xl bg-amber-100 text-amber-700 mx-auto flex items-center justify-center">
          <Truck className="w-8 h-8" />
        </div>
        <h1 className="text-xl font-black text-slate-900">Driver Login Required</h1>
        <p className="text-xs text-slate-500">Sign in with your driver account to access the console.</p>
        <Link
          to="/login"
          className="inline-flex items-center space-x-2 px-5 py-2.5 rounded-xl bg-slate-900 text-white text-sm font-bold hover:bg-brand-600 transition-colors"
        >
          <span>Go to Login</span>
        </Link>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24 space-x-2 text-slate-400">
        <Loader2 className="w-6 h-6 animate-spin" />
        <span className="text-sm">Loading driver console…</span>
      </div>
    );
  }

  if (!myAmbulance) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-12 text-center space-y-4">
        <div className="w-16 h-16 rounded-2xl bg-slate-100 mx-auto flex items-center justify-center">
          <Truck className="w-8 h-8 text-slate-400" />
        </div>
        <h1 className="text-xl font-black text-slate-900">No Ambulance Assigned</h1>
        <p className="text-xs text-slate-500">
          Your account is not linked to any ambulance. Contact your admin to get assigned.
        </p>
        <Link to="/" className="text-xs font-bold text-brand-700 hover:text-brand-800">
          ← Back to Home
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-200">
        <div>
          <div className="inline-flex items-center space-x-2 bg-amber-50 text-amber-800 border border-amber-200 px-3 py-1 rounded-full text-xs font-bold mb-2">
            <Truck className="w-3.5 h-3.5 text-amber-600" />
            <span>Driver Console</span>
          </div>
          <h1 className="text-2xl font-black text-slate-900">Ambulance Driver Dashboard</h1>
          <p className="text-slate-500 text-xs mt-1">
            Vehicle: <strong className="text-slate-700">{myAmbulance.vehicle_number || myAmbulance.registration_number}</strong>
          </p>
        </div>

        {/* GPS Broadcast toggle */}
        <button
          onClick={toggleBroadcast}
          className={`flex items-center space-x-2 px-5 py-3 rounded-2xl font-bold text-sm transition-all shadow-md active:scale-95 ${
            broadcasting
              ? "bg-emerald-600 text-white shadow-emerald-200"
              : "bg-slate-900 text-white shadow-slate-300"
          }`}
        >
          <Activity className={`w-4 h-4 ${broadcasting ? "animate-pulse" : ""}`} />
          <span>{broadcasting ? "Broadcasting GPS…" : "Start GPS Broadcast"}</span>
        </button>
      </div>

      {/* GPS Status */}
      <div className="bg-white rounded-2xl border border-slate-200 px-4 py-3 flex items-center justify-between text-xs">
        <div className="flex items-center space-x-2.5">
          <div
            className={`w-2.5 h-2.5 rounded-full ${
              geoStatus === "granted" ? "bg-emerald-500 animate-pulse" : "bg-slate-400"
            }`}
          />
          <span className="font-semibold text-slate-700">
            {geoStatus === "granted"
              ? `${userLocation.lat.toFixed(5)}°N, ${userLocation.lng.toFixed(5)}°E`
              : "GPS not active"}
          </span>
        </div>
        {lastBroadcast && (
          <span className="text-slate-400">
            Last broadcast: {lastBroadcast.toLocaleTimeString("en-IN")}
          </span>
        )}
      </div>

      {/* Incoming Requests */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-bold text-slate-900 flex items-center space-x-2">
            <Radio className="w-4 h-4 text-brand-600" />
            <span>Incoming Requests</span>
            {requests.length > 0 && (
              <span className="ml-1 bg-red-500 text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                {requests.length}
              </span>
            )}
          </h2>
        </div>

        {requests.length === 0 ? (
          <div className="bg-slate-50 rounded-2xl border border-slate-200 p-8 text-center text-xs text-slate-500 space-y-2">
            <Clock className="w-8 h-8 text-slate-300 mx-auto" />
            <p className="font-semibold text-slate-700">No active requests</p>
            <p>Incoming emergency requests will appear here in real-time.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {requests.map((req) => (
              <div
                key={req.id}
                className="bg-white rounded-2xl border border-slate-200 p-5 space-y-4 shadow-sm"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="space-y-1">
                    <p className="text-xs font-bold text-slate-900">
                      Request #{req.id.slice(0, 8)}
                    </p>
                    <div className="flex items-start space-x-1.5 text-xs text-slate-600">
                      <MapPin className="w-3.5 h-3.5 text-red-500 mt-0.5 shrink-0" />
                      <span className="font-medium">{req.pickup_address || "Pickup location specified on map"}</span>
                    </div>
                    <p className="text-[11px] text-slate-400">
                      Created: {new Date(req.created_at).toLocaleTimeString("en-IN", { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                  <StatusPill status={req.status} />
                </div>

                {/* Navigate to patient */}
                {req.pickup_address && (
                  <a
                    href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(req.pickup_address)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center space-x-1.5 text-xs font-bold text-brand-700 bg-brand-50 hover:bg-brand-100 px-3 py-2 rounded-xl transition-colors w-fit"
                  >
                    <Navigation className="w-3.5 h-3.5" />
                    <span>Navigate to Patient</span>
                  </a>
                )}

                {/* Action buttons based on status */}
                {req.status === "requested" && (
                  <div className="flex gap-2 pt-1">
                    <button
                      onClick={() => updateRequest(req.id, "accepted")}
                      className="flex-1 flex items-center justify-center space-x-1.5 py-2.5 rounded-xl bg-emerald-600 text-white text-xs font-bold hover:bg-emerald-700 transition-colors shadow-sm"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Accept Call</span>
                    </button>
                    <button
                      onClick={() => updateRequest(req.id, "cancelled")}
                      className="flex-1 flex items-center justify-center space-x-1.5 py-2.5 rounded-xl bg-slate-100 text-slate-700 text-xs font-bold hover:bg-red-50 hover:text-red-700 transition-colors"
                    >
                      <XCircle className="w-4 h-4" />
                      <span>Reject</span>
                    </button>
                  </div>
                )}

                {req.status === "accepted" && (
                  <button
                    onClick={() => updateRequest(req.id, "on_the_way")}
                    className="w-full py-2.5 rounded-xl bg-brand-600 text-white text-xs font-bold hover:bg-brand-700 transition-colors shadow-sm"
                  >
                    Mark as En Route (On the Way)
                  </button>
                )}

                {req.status === "on_the_way" && (
                  <button
                    onClick={() => updateRequest(req.id, "reached")}
                    className="w-full py-2.5 rounded-xl bg-purple-600 text-white text-xs font-bold hover:bg-purple-700 transition-colors shadow-sm"
                  >
                    Mark as Reached Patient
                  </button>
                )}

                {req.status === "reached" && (
                  <button
                    onClick={() => updateRequest(req.id, "completed")}
                    className="w-full py-2.5 rounded-xl bg-emerald-600 text-white text-xs font-bold hover:bg-emerald-700 transition-colors shadow-sm"
                  >
                    Mark Mission Completed
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Emergency hotline */}
      <div className="bg-red-50 border border-red-200 rounded-2xl p-4 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <AlertTriangle className="w-4 h-4 text-red-600" />
          <span className="text-xs font-bold text-red-800">Control Room Hotline</span>
        </div>
        <a
          href="tel:108"
          className="flex items-center space-x-1 text-xs font-black text-red-700 hover:text-red-800"
        >
          <PhoneCall className="w-3.5 h-3.5" />
          <span>Call 108</span>
        </a>
      </div>
    </div>
  );
}
