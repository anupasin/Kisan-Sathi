"use client";

import { Radio, Database, WifiOff } from "lucide-react";
import { useT } from "@/i18n/language-provider";
import { Badge } from "./ui";

export function PageHeading({
  title,
  subtitle,
  icon,
}: {
  title: string;
  subtitle?: string;
  icon?: React.ReactNode;
}) {
  return (
    <div className="mb-4 flex items-center gap-3">
      {icon ? (
        <span className="grid size-11 place-items-center rounded-2xl bg-primary/12 text-primary">
          {icon}
        </span>
      ) : null}
      <div>
        <h1 className="text-xl font-bold leading-tight">{title}</h1>
        {subtitle ? (
          <p className="text-sm text-muted-foreground">{subtitle}</p>
        ) : null}
      </div>
    </div>
  );
}

/** Shows whether data is live, an estimate, or offline. */
export function SourceBadge({
  ok,
  fallbackUsed,
}: {
  ok: boolean;
  fallbackUsed: boolean;
  /** Accepted for call-site symmetry; shown separately via SourceNote. */
  source?: string;
}) {
  const t = useT();
  if (!ok)
    return (
      <Badge tone="danger">
        <WifiOff className="size-3" />
        {t("common.na")}
      </Badge>
    );
  if (fallbackUsed)
    return (
      <Badge tone="warning">
        <Database className="size-3" />
        {t("common.estimated")}
      </Badge>
    );
  return (
    <Badge tone="success">
      <Radio className="size-3" />
      {t("common.live")}
    </Badge>
  );
}

export function SourceNote({ source }: { source: string }) {
  const t = useT();
  if (!source || source === "none") return null;
  return (
    <p className="px-4 pb-3 pt-1 text-[11px] text-muted-foreground">
      {t("common.source")}: {source}
    </p>
  );
}
