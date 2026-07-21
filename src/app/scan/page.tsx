"use client";

import { useCallback, useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  ScanLine,
  RefreshCw,
  Sparkles,
  KeyRound,
  History,
  Trash2,
  LogIn,
  Crown,
  Cloud,
} from "lucide-react";
import { useLang } from "@/i18n/language-provider";
import { useAuth } from "@/components/auth-provider";
import { getSupabaseBrowser } from "@/lib/supabase/client";
import { scanPlant } from "@/lib/api";
import type { ScanResult } from "@/lib/types";
import { PageHeading } from "@/components/bits";
import { CameraCapture } from "@/components/camera-capture";
import { ScanResultView } from "@/components/scan-result";
import { Badge, Button, Spinner } from "@/components/ui";

const FREE_SCANS = 5;

const HISTORY_KEY = "kisan-scan-history";

type HistoryItem = { id: string; thumb: string; result: ScanResult; ts: number };

function makeThumb(dataUrl: string): Promise<string> {
  return new Promise((resolve) => {
    const img = new window.Image();
    img.onload = () => {
      const size = 96;
      const canvas = document.createElement("canvas");
      canvas.width = size;
      canvas.height = size;
      const ctx = canvas.getContext("2d");
      if (!ctx) return resolve(dataUrl);
      const min = Math.min(img.naturalWidth, img.naturalHeight);
      const sx = (img.naturalWidth - min) / 2;
      const sy = (img.naturalHeight - min) / 2;
      ctx.drawImage(img, sx, sy, min, min, 0, 0, size, size);
      resolve(canvas.toDataURL("image/jpeg", 0.7));
    };
    img.onerror = () => resolve(dataUrl);
    img.src = dataUrl;
  });
}

export default function ScanPage() {
  const { t, lang } = useLang();
  const { user, premium, loading: authLoading } = useAuth();
  const [image, setImage] = useState<string | null>(null);
  const [result, setResult] = useState<ScanResult | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [used, setUsed] = useState<number | null>(null);

  // Quota pill for signed-in free users.
  const refreshUsage = useCallback(async () => {
    if (!user) return;
    const supabase = getSupabaseBrowser();
    const { data } = await supabase
      .from("scan_usage")
      .select("count")
      .eq("user_id", user.id)
      .eq(
        "month_key",
        new Intl.DateTimeFormat("en-CA", {
          timeZone: "Asia/Kolkata",
          year: "numeric",
          month: "2-digit",
        })
          .format(new Date())
          .slice(0, 7),
      )
      .maybeSingle();
    setUsed(data?.count ?? 0);
  }, [user]);

  useEffect(() => {
    void refreshUsage();
  }, [refreshUsage]);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(HISTORY_KEY);
      if (raw) setHistory(JSON.parse(raw) as HistoryItem[]);
    } catch {
      /* ignore */
    }
  }, []);

  const persist = useCallback((items: HistoryItem[]) => {
    setHistory(items);
    try {
      window.localStorage.setItem(HISTORY_KEY, JSON.stringify(items));
    } catch {
      /* quota exceeded — keep in memory only */
    }
  }, []);

  const onImage = (dataUrl: string) => {
    setImage(dataUrl);
    setResult(null);
    setError(null);
  };

  const reset = () => {
    setImage(null);
    setResult(null);
    setError(null);
  };

  const analyze = async () => {
    if (!image) return;
    setAnalyzing(true);
    setError(null);
    const base64 = image.split(",")[1] ?? "";
    const thumb = await makeThumb(image);
    const res = await scanPlant({
      image: base64,
      mediaType: "image/jpeg",
      lang,
      thumb,
    });
    setAnalyzing(false);

    if (res.ok && res.data) {
      setResult(res.data);
      void refreshUsage();
      if (res.data.isPlant) {
        const item: HistoryItem = {
          id: crypto.randomUUID(),
          thumb,
          result: res.data,
          ts: Date.now(),
        };
        persist([item, ...history].slice(0, 6));
      }
    } else if (res.error === "auth_required") {
      setError("authRequired");
    } else if (res.error === "quota_exceeded") {
      setError("quotaExceeded");
      void refreshUsage();
    } else {
      setError(res.error === "missing_api_key" ? "needsKey" : "failed");
    }
  };

  const scansLeft =
    used != null ? Math.max(0, FREE_SCANS - used) : null;

  return (
    <div className="space-y-4">
      <PageHeading
        title={t("scan.title")}
        subtitle={t("scan.subtitle")}
        icon={<ScanLine className="size-6" />}
      />

      {/* Quota / sign-in status */}
      {!authLoading && !user ? (
        <Link
          href="/login?next=/scan"
          className="flex items-center gap-2.5 rounded-[var(--radius-lg)] border border-border bg-card p-3.5 text-sm shadow-sm"
        >
          <span className="grid size-9 shrink-0 place-items-center rounded-full bg-primary/12 text-primary">
            <LogIn className="size-4.5" />
          </span>
          <span className="flex-1">{t("scan.signInNotice")}</span>
        </Link>
      ) : user && premium === false && scansLeft != null ? (
        <div className="flex items-center justify-between rounded-[var(--radius-lg)] border border-border bg-card px-3.5 py-2.5 text-sm shadow-sm">
          <span className="text-muted-foreground">{t("scan.quotaLeft")}</span>
          <Badge tone={scansLeft > 0 ? "success" : "danger"}>
            {scansLeft} / {FREE_SCANS}
          </Badge>
        </div>
      ) : null}

      {!image ? (
        <CameraCapture onImage={onImage} />
      ) : (
        <div className="space-y-3">
          <div className="relative overflow-hidden rounded-[var(--radius-lg)] border border-border">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={image}
              alt="captured plant"
              className="aspect-[3/4] w-full object-cover"
            />
          </div>
          {!result ? (
            <div className="flex gap-2">
              <Button variant="outline" size="lg" className="flex-1" onClick={reset}>
                <RefreshCw className="size-5" />
                {t("scan.retake")}
              </Button>
              <Button
                size="lg"
                className="flex-1"
                onClick={analyze}
                disabled={analyzing}
              >
                {analyzing ? <Spinner /> : <Sparkles className="size-5" />}
                {analyzing ? t("scan.analyzing") : t("scan.analyze")}
              </Button>
            </div>
          ) : (
            <Button variant="outline" size="lg" className="w-full" onClick={reset}>
              <RefreshCw className="size-5" />
              {t("scan.retake")}
            </Button>
          )}
        </div>
      )}

      {error === "needsKey" ? (
        <Notice icon={<KeyRound className="size-5" />} tone="warning">
          {t("scan.needsKey")}
        </Notice>
      ) : error === "failed" ? (
        <Notice icon={<RefreshCw className="size-5" />} tone="danger">
          {t("scan.failed")}
        </Notice>
      ) : error === "authRequired" ? (
        <div className="space-y-2 rounded-[var(--radius-lg)] bg-warning/12 p-4 text-sm">
          <p className="text-foreground/90">{t("scan.signInNotice")}</p>
          <Link
            href="/login?next=/scan"
            className="inline-flex items-center gap-1.5 rounded-full bg-primary px-4 py-2 font-medium text-primary-foreground"
          >
            <LogIn className="size-4" />
            {t("auth.signIn")}
          </Link>
        </div>
      ) : error === "quotaExceeded" ? (
        <div className="space-y-2 rounded-[var(--radius-lg)] bg-warning/12 p-4 text-sm">
          <p className="text-foreground/90">{t("scan.quotaExceeded")}</p>
          <Link
            href="/premium"
            className="inline-flex items-center gap-1.5 rounded-full bg-primary px-4 py-2 font-medium text-primary-foreground"
          >
            <Crown className="size-4" />
            {t("scan.goPremium")}
          </Link>
        </div>
      ) : null}

      {result ? <ScanResultView result={result} /> : null}

      {/* History */}
      <section>
        <div className="mb-2 flex items-center justify-between">
          <h2 className="flex items-center gap-2 font-semibold">
            <History className="size-4 text-primary" />
            {t("scan.history")}
            {premium ? (
              <Link
                href="/scan/history"
                className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2.5 py-1 text-xs font-medium text-primary"
              >
                <Cloud className="size-3.5" />
                {t("scan.cloudHistory")}
              </Link>
            ) : null}
          </h2>
          {history.length > 0 ? (
            <button
              type="button"
              onClick={() => persist([])}
              className="inline-flex items-center gap-1 text-xs text-muted-foreground"
            >
              <Trash2 className="size-3.5" />
              {t("scan.clearHistory")}
            </button>
          ) : null}
        </div>
        {history.length === 0 ? (
          <p className="rounded-[var(--radius-lg)] border border-dashed border-border p-4 text-center text-sm text-muted-foreground">
            {t("scan.noHistory")}
          </p>
        ) : (
          <div className="grid grid-cols-3 gap-2">
            {history.map((h) => (
              <button
                key={h.id}
                type="button"
                onClick={() => {
                  setResult(h.result);
                  setImage(h.thumb);
                  setError(null);
                }}
                className="overflow-hidden rounded-[var(--radius-md)] border border-border text-left"
              >
                <Image
                  src={h.thumb}
                  alt={h.result.plant || "scan"}
                  width={96}
                  height={96}
                  unoptimized
                  className="aspect-square w-full object-cover"
                />
                <div className="p-1.5">
                  <p className="truncate text-xs font-medium">
                    {h.result.plant || t("scan.plant")}
                  </p>
                  <p className="truncate text-[10px] text-muted-foreground">
                    {t(`scan.${h.result.health}`)}
                  </p>
                </div>
              </button>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

function Notice({
  icon,
  tone,
  children,
}: {
  icon: React.ReactNode;
  tone: "warning" | "danger";
  children: React.ReactNode;
}) {
  const cls =
    tone === "warning"
      ? "bg-warning/12 text-warning"
      : "bg-danger/12 text-danger";
  return (
    <div
      className={`flex items-start gap-2 rounded-[var(--radius-lg)] p-4 text-sm ${cls}`}
    >
      <span className="mt-0.5 shrink-0">{icon}</span>
      <span className="text-foreground/90">{children}</span>
    </div>
  );
}
