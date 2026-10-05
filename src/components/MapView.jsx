import React, { useEffect } from "react";
import L from "leaflet";
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  Circle,
  useMap,
} from "react-leaflet";
import "leaflet/dist/leaflet.css";
import { Navigation } from "lucide-react";
import { formatDistance, getGoogleMapsDirectionsUrl, getGoogleMapsSearchUrl } from "../lib/utils";

// ─── Fix Leaflet's broken default icon paths in Vite ──────────────────────────
import markerIcon2xUrl from "leaflet/dist/images/marker-icon-2x.png";
import markerIconUrl from "leaflet/dist/images/marker-icon.png";
import markerShadowUrl from "leaflet/dist/images/marker-shadow.png";

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconUrl: markerIconUrl,
  iconRetinaUrl: markerIcon2xUrl,
  shadowUrl: markerShadowUrl,
});

// ─── Custom icons ──────────────────────────────────────────────────────────────
const emergencyIcon = new L.Icon({
  iconUrl: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png",
  shadowUrl: markerShadowUrl,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

const hospitalIcon = new L.Icon({
  iconUrl: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png",
  shadowUrl: markerShadowUrl,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

const campIcon = new L.Icon({
  iconUrl: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png",
  shadowUrl: markerShadowUrl,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

const ambulanceIcon = new L.Icon({
  iconUrl: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-orange.png",
  shadowUrl: markerShadowUrl,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

const userIcon = new L.DivIcon({
  html: `<div style="
    width:18px;height:18px;
    background:#3B82F6;
    border:3px solid white;
    border-radius:50%;
    box-shadow:0 0 0 3px rgba(59,130,246,0.4);
  "></div>`,
  iconSize: [18, 18],
  iconAnchor: [9, 9],
  className: "",
});

// ─── Recenter map when center prop changes ─────────────────────────────────────
function RecenterMap({ center }) {
  const map = useMap();
  useEffect(() => {
    if (center?.lat && center?.lng) {
      map.setView([center.lat, center.lng], map.getZoom(), { animate: true });
    }
  }, [center, map]);
  return null;
}

/**
 * MapView — reusable Leaflet map component.
 *
 * Props:
 *  - center         : { lat, lng }
 *  - userLocation   : { lat, lng }  — shows blue dot + radius circle
 *  - radiusKm       : number        — km for the circle (optional)
 *  - markers        : Array<{
 *      id, name, lat, lng,
 *      isEmergency?,    // red pin
 *      isCamp?,         // green pin
 *      isAmbulance?,    // orange pin
 *      distance?,       // formatted km
 *      address?,
 *      phone?,
 *    }>
 *  - height         : string (CSS), default "420px"
 */
export default function MapView({
  center,
  userLocation,
  radiusKm,
  markers = [],
  height = "420px",
}) {
  const mapCenter = center || userLocation || { lat: 22.3072, lng: 73.1812 };
  const validMarkers = markers.filter((m) => m.lat && m.lng);

  return (
    <div
      style={{ height }}
      className="w-full rounded-2xl overflow-hidden border border-slate-200 shadow-sm"
    >
      <MapContainer
        center={[mapCenter.lat, mapCenter.lng]}
        zoom={13}
        style={{ width: "100%", height: "100%" }}
        scrollWheelZoom={true}
      >
        <RecenterMap center={mapCenter} />

        {/* OpenStreetMap tiles */}
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {/* User location — blue dot */}
        {userLocation?.lat && userLocation?.lng && (
          <>
            <Marker position={[userLocation.lat, userLocation.lng]} icon={userIcon}>
              <Popup>
                <div className="text-xs font-semibold text-blue-700">📍 Your Location</div>
              </Popup>
            </Marker>

            {/* Radius circle */}
            {radiusKm && radiusKm > 0 && (
              <Circle
                center={[userLocation.lat, userLocation.lng]}
                radius={radiusKm * 1000}
                pathOptions={{
                  color: "#3B82F6",
                  fillColor: "#3B82F6",
                  fillOpacity: 0.05,
                  weight: 1.5,
                  dashArray: "6 4",
                }}
              />
            )}
          </>
        )}

        {/* Hospital / Camp / Ambulance markers */}
        {validMarkers.map((m) => {
          const icon = m.isAmbulance
            ? ambulanceIcon
            : m.isCamp
            ? campIcon
            : m.isEmergency
            ? emergencyIcon
            : hospitalIcon;

          return (
            <Marker key={m.id || m.name} position={[m.lat, m.lng]} icon={icon}>
              <Popup maxWidth={260}>
                <div className="space-y-2 py-1">
                  <div className="font-bold text-sm text-slate-900 leading-snug">
                    {m.isEmergency && (
                      <span className="inline-block mr-1 text-red-600">🚨</span>
                    )}
                    {m.isCamp && (
                      <span className="inline-block mr-1 text-emerald-600">🏕️</span>
                    )}
                    {m.isAmbulance && (
                      <span className="inline-block mr-1 text-orange-600">🚑</span>
                    )}
                    {m.name}
                  </div>

                  {m.distance != null && (
                    <div className="text-xs font-semibold text-brand-700 bg-brand-50 px-2 py-0.5 rounded-md inline-block">
                      {formatDistance(m.distance)}
                    </div>
                  )}

                  {m.address && (
                    <p className="text-xs text-slate-500 leading-relaxed">{m.address}</p>
                  )}

                  {/* Directions link */}
                  <a
                    href={
                      m.lat && m.lng
                        ? getGoogleMapsDirectionsUrl(m.lat, m.lng)
                        : getGoogleMapsSearchUrl(m.name, m.address)
                    }
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center space-x-1 text-xs font-bold text-white bg-slate-900 hover:bg-brand-600 px-3 py-1.5 rounded-lg transition-colors mt-1"
                  >
                    <Navigation className="w-3 h-3" />
                    <span>Directions</span>
                  </a>
                </div>
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>
    </div>
  );
}
