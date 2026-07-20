"use client";

import { useCallback, useEffect, useState } from "react";
import Image from "next/image";
import { ScanLine, RefreshCw, Sparkles, KeyRound, History, Trash2 } from "lucide-react";
import { useLang } from "@/i18n/language-provider";
import { scanPlant } from "@/lib/api";
import type { ScanResult } from "@/lib/types";
import { PageHeading } from "@/components/bits";
import { CameraCapture } from "@/components/camera-capture";
import { ScanResultView } from "@/components/scan-result";
import { Button, Spinner } from "@/components/ui";

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
  const [image, setImage] = useState<string | null>(null);
  const [result, setResult] = useState<ScanResult | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [history, setHistory] = useState<HistoryItem[]>([]);

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
    const res = await scanPlant({ image: base64, mediaType: "image/jpeg", lang });
    setAnalyzing(false);

    if (res.ok && res.data) {
      setResult(res.data);
      if (res.data.isPlant) {
        const thumb = await makeThumb(image);
        const item: HistoryItem = {
          id: crypto.randomUUID(),
          thumb,
          result: res.data,
          ts: Date.now(),
        };
        persist([item, ...history].slice(0, 6));
      }
    } else {
      setError(res.error === "missing_api_key" ? "needsKey" : "failed");
    }
  };

  return (
    <div className="space-y-4">
      <PageHeading
        title={t("scan.title")}
        subtitle={t("scan.subtitle")}
        icon={<ScanLine className="size-6" />}
      />

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
      ) : null}

      {result ? <ScanResultView result={result} /> : null}

      {/* History */}
      <section>
        <div className="mb-2 flex items-center justify-between">
          <h2 className="flex items-center gap-2 font-semibold">
            <History className="size-4 text-primary" />
            {t("scan.history")}
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
