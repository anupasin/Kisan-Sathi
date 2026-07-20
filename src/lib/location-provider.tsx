"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import type { ApiResult, Coords, Place } from "./types";

const STORAGE_KEY = "kisan-location";

type Status = "idle" | "locating" | "ready" | "denied" | "error";

type LocationContextValue = {
  coords: Coords | null;
  place: Place | null;
  status: Status;
  detect: () => void;
  clear: () => void;
};

const LocationContext = createContext<LocationContextValue | null>(null);

type Persisted = { coords: Coords; place: Place | null };

export function LocationProvider({ children }: { children: React.ReactNode }) {
  const [coords, setCoords] = useState<Coords | null>(null);
  const [place, setPlace] = useState<Place | null>(null);
  const [status, setStatus] = useState<Status>("idle");

  // Restore last known location so returning users see data instantly.
  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as Persisted;
        if (parsed?.coords) {
          setCoords(parsed.coords);
          setPlace(parsed.place ?? null);
          setStatus("ready");
        }
      }
    } catch {
      /* ignore corrupt storage */
    }
  }, []);

  const resolvePlace = useCallback(async (c: Coords) => {
    try {
      const res = await fetch(`/api/geo/reverse?lat=${c.lat}&lon=${c.lon}`);
      const json = (await res.json()) as ApiResult<Place>;
      const p = json.data;
      setPlace(p);
      window.localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({ coords: c, place: p } satisfies Persisted),
      );
    } catch {
      window.localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({ coords: c, place: null } satisfies Persisted),
      );
    }
  }, []);

  const detect = useCallback(() => {
    if (!("geolocation" in navigator)) {
      setStatus("error");
      return;
    }
    setStatus("locating");
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const c = {
          lat: Number(pos.coords.latitude.toFixed(5)),
          lon: Number(pos.coords.longitude.toFixed(5)),
        };
        setCoords(c);
        setStatus("ready");
        void resolvePlace(c);
      },
      (err) => {
        setStatus(err.code === err.PERMISSION_DENIED ? "denied" : "error");
      },
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 60000 },
    );
  }, [resolvePlace]);

  const clear = useCallback(() => {
    setCoords(null);
    setPlace(null);
    setStatus("idle");
    try {
      window.localStorage.removeItem(STORAGE_KEY);
    } catch {
      /* ignore */
    }
  }, []);

  const value = useMemo(
    () => ({ coords, place, status, detect, clear }),
    [coords, place, status, detect, clear],
  );

  return (
    <LocationContext.Provider value={value}>
      {children}
    </LocationContext.Provider>
  );
}

export function useLocation(): LocationContextValue {
  const ctx = useContext(LocationContext);
  if (!ctx)
    throw new Error("useLocation must be used within a LocationProvider");
  return ctx;
}
