"use client";

import { useEffect } from "react";

export function SwRegister() {
  useEffect(() => {
    if (!("serviceWorker" in navigator)) return;

    // Dev chunks are not content-hashed, so the SW's cache-first static
    // strategy would serve stale code. Only register on production builds
    // (and clean up any SW left over from a previous prod session).
    if (process.env.NODE_ENV !== "production") {
      void navigator.serviceWorker.getRegistrations().then((regs) => {
        regs.forEach((r) => void r.unregister());
      });
      if ("caches" in window) {
        void caches.keys().then((keys) => {
          keys.forEach((k) => void caches.delete(k));
        });
      }
      return;
    }

    navigator.serviceWorker
      .register("/sw.js", { scope: "/", updateViaCache: "none" })
      .catch(() => {
        // Registration failure (e.g. private mode) is non-fatal.
      });
  }, []);
  return null;
}
