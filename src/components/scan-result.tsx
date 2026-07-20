"use client";

import {
  Leaf,
  Activity,
  Bug,
  Stethoscope,
  ShieldCheck,
  Lightbulb,
  CircleCheck,
  TriangleAlert,
  HelpCircle,
} from "lucide-react";
import { useT } from "@/i18n/language-provider";
import type { ScanResult } from "@/lib/types";
import { Badge } from "./ui";

const healthMeta = {
  healthy: { tone: "success", Icon: CircleCheck, key: "scan.healthy" },
  unhealthy: { tone: "danger", Icon: TriangleAlert, key: "scan.unhealthy" },
  unsure: { tone: "warning", Icon: HelpCircle, key: "scan.unsure" },
} as const;

export function ScanResultView({ result }: { result: ScanResult }) {
  const t = useT();

  if (!result.isPlant) {
    return (
      <div className="rounded-[var(--radius-lg)] border border-border bg-card p-5 text-center">
        <TriangleAlert className="mx-auto size-8 text-warning" />
        <p className="mt-2 font-medium">{t("scan.notPlant")}</p>
      </div>
    );
  }

  const meta = healthMeta[result.health];

  return (
    <div className="space-y-3 animate-in">
      {/* Header */}
      <div className="rounded-[var(--radius-lg)] border border-border bg-card p-4 shadow-sm">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2.5 min-w-0">
            <span className="grid size-11 shrink-0 place-items-center rounded-full bg-primary/12 text-primary">
              <Leaf className="size-6" />
            </span>
            <div className="min-w-0">
              <p className="truncate text-lg font-bold">
                {result.plant || t("scan.plant")}
              </p>
              <p className="text-xs text-muted-foreground">
                {t("scan.confidence")}: {t(`home.lowHigh.${result.confidence}`)}
              </p>
            </div>
          </div>
          <Badge tone={meta.tone}>
            <meta.Icon className="size-3.5" />
            {t(meta.key)}
          </Badge>
        </div>

        <div className="mt-3 flex items-center gap-2 rounded-[var(--radius-md)] bg-muted/50 px-3 py-2 text-sm">
          <Activity className="size-4 text-primary" />
          <span className="text-muted-foreground">{t("scan.stage")}:</span>
          <span className="font-medium">{result.stage}</span>
        </div>
      </div>

      {/* Problem details */}
      {result.health !== "healthy" && result.disease ? (
        <Section
          icon={<Bug className="size-5" />}
          title={t("scan.disease")}
          tone="danger"
        >
          <p className="font-semibold text-danger">{result.disease}</p>
          {result.cause ? (
            <p className="mt-1 text-sm text-muted-foreground">
              <span className="font-medium text-foreground">
                {t("scan.cause")}:{" "}
              </span>
              {result.cause}
            </p>
          ) : null}
        </Section>
      ) : null}

      {result.cure ? (
        <Section
          icon={<Stethoscope className="size-5" />}
          title={t("scan.cure")}
          tone="primary"
        >
          <p className="text-sm leading-relaxed">{result.cure}</p>
        </Section>
      ) : null}

      {result.prevention ? (
        <Section
          icon={<ShieldCheck className="size-5" />}
          title={t("scan.prevention")}
          tone="accent"
        >
          <p className="text-sm leading-relaxed">{result.prevention}</p>
        </Section>
      ) : null}

      {result.tips ? (
        <Section
          icon={<Lightbulb className="size-5" />}
          title={t("scan.tips")}
          tone="muted"
        >
          <p className="text-sm leading-relaxed">{result.tips}</p>
        </Section>
      ) : null}

      <p className="flex items-start gap-2 rounded-[var(--radius-md)] bg-muted/50 p-3 text-xs text-muted-foreground">
        <TriangleAlert className="mt-0.5 size-4 shrink-0" />
        {t("scan.disclaimer")}
      </p>
    </div>
  );
}

const toneRing: Record<string, string> = {
  danger: "text-danger bg-danger/12",
  primary: "text-primary bg-primary/12",
  accent: "text-accent bg-accent/15",
  muted: "text-muted-foreground bg-muted",
};

function Section({
  icon,
  title,
  tone,
  children,
}: {
  icon: React.ReactNode;
  title: string;
  tone: keyof typeof toneRing;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-[var(--radius-lg)] border border-border bg-card p-4 shadow-sm">
      <div className="mb-2 flex items-center gap-2">
        <span
          className={`grid size-8 place-items-center rounded-full ${toneRing[tone]}`}
        >
          {icon}
        </span>
        <h3 className="font-semibold">{title}</h3>
      </div>
      {children}
    </div>
  );
}
