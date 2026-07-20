"use client";

import {
  MapPin,
  LocateFixed,
  RefreshCw,
  TriangleAlert,
  X,
} from "lucide-react";
import { useLang } from "@/i18n/language-provider";
import { useLocation } from "@/lib/location-provider";
import { Button, Spinner } from "./ui";

export function LocationBar() {
  const { t } = useLang();
  const { place, coords, status, detect, clear } = useLocation();

  const locating = status === "locating";

  if (!coords) {
    return (
      <div className="rounded-[var(--radius-lg)] border border-border bg-card p-4">
        <div className="flex items-center gap-2.5">
          <span className="grid size-9 place-items-center rounded-full bg-primary/12 text-primary">
            <MapPin className="size-5" />
          </span>
          <div className="min-w-0">
            <p className="font-semibold">{t("location.permissionTitle")}</p>
            <p className="text-xs text-muted-foreground">
              {t("location.permissionBody")}
            </p>
          </div>
        </div>
        {status === "denied" ? (
          <p className="mt-3 flex items-start gap-2 rounded-[var(--radius-md)] bg-danger/10 p-3 text-sm text-danger">
            <TriangleAlert className="mt-0.5 size-4 shrink-0" />
            {t("location.denied")}
          </p>
        ) : null}
        {status === "error" ? (
          <p className="mt-3 text-sm text-danger">
            {t("location.unavailable")}
          </p>
        ) : null}
        <Button
          onClick={detect}
          disabled={locating}
          className="mt-4 w-full"
          size="lg"
        >
          {locating ? <Spinner /> : <LocateFixed className="size-5" />}
          {locating ? t("location.detecting") : t("location.detect")}
        </Button>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-between gap-3 rounded-[var(--radius-lg)] border border-border bg-card px-4 py-3">
      <div className="flex items-center gap-2.5 min-w-0">
        <span className="grid size-9 shrink-0 place-items-center rounded-full bg-primary/12 text-primary">
          <MapPin className="size-5" />
        </span>
        <div className="min-w-0">
          <p className="truncate font-semibold">
            {place?.district || t("location.unknownPlace")}
          </p>
          <p className="truncate text-xs text-muted-foreground">
            {place?.state
              ? `${place.state} · ${coords.lat.toFixed(3)}, ${coords.lon.toFixed(3)}`
              : `${coords.lat.toFixed(3)}, ${coords.lon.toFixed(3)}`}
          </p>
        </div>
      </div>
      <div className="flex shrink-0 items-center gap-1.5">
        <button
          type="button"
          onClick={detect}
          disabled={locating}
          aria-label={t("location.redetect")}
          title={t("location.redetect")}
          className="grid size-9 place-items-center rounded-full border border-border text-muted-foreground transition hover:bg-muted disabled:opacity-50"
        >
          {locating ? <Spinner /> : <RefreshCw className="size-4" />}
        </button>
        <button
          type="button"
          onClick={clear}
          disabled={locating}
          aria-label={t("location.change")}
          title={t("location.change")}
          className="grid size-9 place-items-center rounded-full border border-border text-muted-foreground transition hover:bg-muted disabled:opacity-50"
        >
          <X className="size-4" />
        </button>
      </div>
    </div>
  );
}
