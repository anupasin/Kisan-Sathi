"use client";

import { useCallback, useEffect, useState } from "react";
import { Bell, BellOff } from "lucide-react";
import { useT } from "@/i18n/language-provider";
import { useAuth } from "@/components/auth-provider";

type Status = "unsupported" | "denied" | "off" | "on" | "busy";

function urlBase64ToUint8Array(base64: string): Uint8Array<ArrayBuffer> {
  const padding = "=".repeat((4 - (base64.length % 4)) % 4);
  const b64 = (base64 + padding).replace(/-/g, "+").replace(/_/g, "/");
  const raw = window.atob(b64);
  const out = new Uint8Array(new ArrayBuffer(raw.length));
  for (let i = 0; i < raw.length; i++) out[i] = raw.charCodeAt(i);
  return out;
}

/** Toggle for Web Push notifications (used on alerts + account pages). */
export function PushManager() {
  const t = useT();
  const { user } = useAuth();
  const [status, setStatus] = useState<Status>("busy");

  const supported =
    typeof window !== "undefined" &&
    "serviceWorker" in navigator &&
    "PushManager" in window &&
    Boolean(process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY);

  useEffect(() => {
    if (!supported) {
      setStatus("unsupported");
      return;
    }
    if (Notification.permission === "denied") {
      setStatus("denied");
      return;
    }
    void navigator.serviceWorker.ready
      .then((reg) => reg.pushManager.getSubscription())
      .then((sub) => setStatus(sub ? "on" : "off"))
      .catch(() => setStatus("off"));
  }, [supported]);

  const toggle = useCallback(async () => {
    if (!user || !supported) return;
    setStatus("busy");
    try {
      const reg = await navigator.serviceWorker.ready;
      const existing = await reg.pushManager.getSubscription();
      if (existing) {
        await fetch("/api/push/subscribe", {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ endpoint: existing.endpoint }),
        });
        await existing.unsubscribe();
        setStatus("off");
        return;
      }
      const permission = await Notification.requestPermission();
      if (permission !== "granted") {
        setStatus("denied");
        return;
      }
      const sub = await reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(
          process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!,
        ),
      });
      const res = await fetch("/api/push/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(sub.toJSON()),
      });
      const j = (await res.json()) as { ok: boolean };
      setStatus(j.ok ? "on" : "off");
    } catch {
      setStatus("off");
    }
  }, [user, supported]);

  if (!user) return null;

  const label =
    status === "unsupported"
      ? t("alerts.pushUnsupported")
      : status === "denied"
        ? t("alerts.pushDenied")
        : status === "on"
          ? t("alerts.pushOn")
          : t("alerts.pushOff");

  return (
    <button
      type="button"
      onClick={() => void toggle()}
      disabled={status === "unsupported" || status === "denied" || status === "busy"}
      className={`flex w-full items-center justify-between gap-3 rounded-[var(--radius-lg)] border border-border p-4 text-sm shadow-sm transition ${
        status === "on" ? "bg-primary/8" : "bg-card"
      } disabled:opacity-60`}
    >
      <span className="flex items-center gap-2 font-medium">
        {status === "on" ? (
          <Bell className="size-5 text-primary" />
        ) : (
          <BellOff className="size-5 text-muted-foreground" />
        )}
        {t("alerts.pushLabel")}
      </span>
      <span className="text-xs text-muted-foreground">{label}</span>
    </button>
  );
}
