import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from "react";

// Vadodara city center — safe fallback when GPS is unavailable
const VADODARA_CENTER = { lat: 22.3072, lng: 73.1812 };

const GeolocationContext = createContext(null);

export function GeolocationProvider({ children }) {
  const [userLocation, setUserLocation] = useState(VADODARA_CENTER);
  const [geoStatus, setGeoStatus] = useState("default"); // 'default' | 'detecting' | 'granted' | 'denied'
  const watchIdRef = useRef(null);

  const requestLocation = useCallback(() => {
    if (!navigator.geolocation) {
      setGeoStatus("denied");
      return;
    }
    setGeoStatus("detecting");
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setUserLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        setGeoStatus("granted");
      },
      (err) => {
        console.warn("[GeolocationContext] GPS denied:", err.message);
        setGeoStatus("denied");
        setUserLocation(VADODARA_CENTER);
      },
      { timeout: 8000, maximumAge: 30000 }
    );
  }, []);

  /** Start watching GPS for real-time tracking (Emergency / Driver) */
  const startWatching = useCallback((onUpdate) => {
    if (!navigator.geolocation) return;
    if (watchIdRef.current !== null) return; // already watching
    watchIdRef.current = navigator.geolocation.watchPosition(
      (pos) => {
        const loc = { lat: pos.coords.latitude, lng: pos.coords.longitude };
        setUserLocation(loc);
        setGeoStatus("granted");
        if (onUpdate) onUpdate(loc);
      },
      (err) => console.warn("[GeolocationContext] watchPosition error:", err.message),
      { enableHighAccuracy: true, maximumAge: 5000 }
    );
  }, []);

  /** Stop watching GPS */
  const stopWatching = useCallback(() => {
    if (watchIdRef.current !== null) {
      navigator.geolocation.clearWatch(watchIdRef.current);
      watchIdRef.current = null;
    }
  }, []);

  // Auto-detect on mount
  useEffect(() => {
    requestLocation();
    return () => stopWatching();
  }, [requestLocation, stopWatching]);

  const value = {
    userLocation,
    geoStatus,
    requestLocation,
    startWatching,
    stopWatching,
    VADODARA_CENTER,
  };

  return (
    <GeolocationContext.Provider value={value}>
      {children}
    </GeolocationContext.Provider>
  );
}

export function useGeolocation() {
  const ctx = useContext(GeolocationContext);
  if (!ctx) throw new Error("useGeolocation must be used inside GeolocationProvider");
  return ctx;
}
