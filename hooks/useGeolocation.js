"use client";

import { useState, useCallback, useRef } from "react";

const CACHE_KEY = "bh_user_location";
const CACHE_TTL = 30 * 60 * 1000; // 30 minutes

function readCache() {
  try {
    const raw = sessionStorage.getItem(CACHE_KEY);
    if (!raw) return null;
    const cached = JSON.parse(raw);
    if (Date.now() - cached.ts > CACHE_TTL) return null;
    return cached;
  } catch {
    return null;
  }
}

function writeCache(data) {
  try {
    sessionStorage.setItem(CACHE_KEY, JSON.stringify({ ...data, ts: Date.now() }));
  } catch {}
}

export function useGeolocation() {
  const [state, setState] = useState({
    city: null,
    state: null,
    lat: null,
    lng: null,
    loading: false,
    error: null,
    granted: false,
  });

  const inFlight = useRef(false);

  const requestLocation = useCallback(async () => {
    if (inFlight.current) return;
    inFlight.current = true;

    // Return cached result immediately
    const cached = readCache();
    if (cached) {
      setState({
        city: cached.city,
        state: cached.state,
        lat: cached.lat,
        lng: cached.lng,
        loading: false,
        error: null,
        granted: true,
      });
      inFlight.current = false;
      return;
    }

    if (!navigator?.geolocation) {
      setState((prev) => ({
        ...prev,
        loading: false,
        error: "Geolocation is not supported by your browser.",
      }));
      inFlight.current = false;
      return;
    }

    setState((prev) => ({ ...prev, loading: true, error: null }));

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude: lat, longitude: lng } = position.coords;

        try {
          // Call our server-side geocode route — avoids browser referrer restrictions on the API key
          const res = await fetch(`/api/geocode?lat=${lat}&lng=${lng}`);
          const data = await res.json();

          // Always proceed — city/state may be null if geocoding couldn't resolve them
          const payload = { city: data.city || null, state: data.state || null, lat, lng };
          if (data.city || data.state) {
            writeCache(payload); // only cache if we got a real location
          }
          setState({ ...payload, loading: false, error: null, granted: true });
        } catch (err) {
          // Geolocation succeeded but reverse-geocoding failed — still mark as granted
          // so we can at least show national listings
          setState((prev) => ({
            ...prev,
            lat,
            lng,
            loading: false,
            error: null, // don't surface this as a hard error
            granted: true,
          }));
        }

        inFlight.current = false;
      },
      (err) => {
        const messages = {
          1: "Location access was denied. Please allow it in your browser settings.",
          2: "Unable to determine your location.",
          3: "Location request timed out.",
        };
        setState((prev) => ({
          ...prev,
          loading: false,
          error: messages[err.code] || "Unknown location error.",
        }));
        inFlight.current = false;
      },
      { timeout: 10000, maximumAge: 0, enableHighAccuracy: false }
    );
  }, []);

  const clearLocation = useCallback(() => {
    try { sessionStorage.removeItem(CACHE_KEY); } catch {}
    setState({ city: null, state: null, lat: null, lng: null, loading: false, error: null, granted: false });
  }, []);

  return { ...state, requestLocation, clearLocation };
}
