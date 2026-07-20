"use client";

import { useState } from "react";
import {
  ChevronDown,
  Phone,
  ExternalLink,
  BadgeIndianRupee,
  ShieldCheck,
  Gift,
} from "lucide-react";
import { useLang } from "@/i18n/language-provider";
import type { Scheme } from "@/data/schemes";
import { Badge, cn } from "./ui";

const toneIcon = {
  loan: BadgeIndianRupee,
  insurance: ShieldCheck,
  subsidy: Gift,
} as const;

const toneBadge = {
  loan: "primary",
  insurance: "accent",
  subsidy: "success",
} as const;

export function SchemeCard({ scheme }: { scheme: Scheme }) {
  const { t, lang } = useLang();
  const [open, setOpen] = useState(false);
  const Icon = toneIcon[scheme.tone];

  return (
    <div className="overflow-hidden rounded-[var(--radius-lg)] border border-border bg-card shadow-sm">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-start gap-3 p-4 text-left"
      >
        <span className="grid size-10 shrink-0 place-items-center rounded-full bg-primary/12 text-primary">
          <Icon className="size-5" />
        </span>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <p className="font-semibold leading-tight">{scheme.name[lang]}</p>
          </div>
          <p className="mt-0.5 text-xs text-muted-foreground">
            {scheme.provider[lang]}
          </p>
          <p className="mt-1.5 text-sm text-foreground/90">
            {scheme.benefit[lang]}
          </p>
          <div className="mt-2">
            <Badge tone={toneBadge[scheme.tone]}>
              {open ? t("common.seeLess") : t("common.seeMore")}
            </Badge>
          </div>
        </div>
        <ChevronDown
          className={cn(
            "mt-1 size-5 shrink-0 text-muted-foreground transition",
            open && "rotate-180",
          )}
        />
      </button>

      {open ? (
        <div className="space-y-3 border-t border-border px-4 py-3 text-sm">
          <Detail label={t("support.eligibility")} value={scheme.eligibility[lang]} />
          <Detail label={t("support.apply")} value={scheme.apply[lang]} />
          <div className="flex flex-wrap gap-2 pt-1">
            {scheme.phone ? (
              <a
                href={`tel:${scheme.phone}`}
                className="inline-flex items-center gap-1.5 rounded-full bg-primary px-3.5 py-2 text-sm font-medium text-primary-foreground"
              >
                <Phone className="size-4" />
                {scheme.phone}
              </a>
            ) : null}
            <a
              href={scheme.url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 rounded-full border border-border px-3.5 py-2 text-sm font-medium"
            >
              <ExternalLink className="size-4" />
              {t("common.visitSite")}
            </a>
          </div>
        </div>
      ) : null}
    </div>
  );
}

function Detail({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
        {label}
      </p>
      <p className="mt-0.5 leading-relaxed">{value}</p>
    </div>
  );
}
