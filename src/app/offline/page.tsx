"use client";

import { WifiOff } from "lucide-react";
import { useT } from "@/i18n/language-provider";

export default function OfflinePage() {
  const t = useT();
  return (
    <div className="grid min-h-[60vh] place-items-center">
      <div className="max-w-sm space-y-3 text-center">
        <span className="mx-auto grid size-14 place-items-center rounded-full bg-muted text-muted-foreground">
          <WifiOff className="size-7" />
        </span>
        <h1 className="text-xl font-bold">{t("offline.title")}</h1>
        <p className="text-sm text-muted-foreground">{t("offline.body")}</p>
        <button
          type="button"
          onClick={() => window.location.reload()}
          className="rounded-full bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground"
        >
          {t("common.retry")}
        </button>
      </div>
    </div>
  );
}
