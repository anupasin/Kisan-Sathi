"use client";

import { useMemo } from "react";
import { Landmark, Phone, ExternalLink, Info, Building2 } from "lucide-react";
import { useLang } from "@/i18n/language-provider";
import { useLocation } from "@/lib/location-provider";
import { SCHEMES, agenciesForLocation, type Agency } from "@/data/schemes";
import { PageHeading } from "@/components/bits";
import { LocationBar } from "@/components/location-bar";
import { SchemeCard } from "@/components/scheme-card";

export default function SupportPage() {
  const { t, lang } = useLang();
  const { place } = useLocation();

  const agencies = useMemo(
    () => agenciesForLocation(place?.state),
    [place?.state],
  );

  return (
    <div className="space-y-4">
      <PageHeading
        title={t("support.title")}
        subtitle={t("support.subtitle")}
        icon={<Landmark className="size-6" />}
      />

      <LocationBar />

      {/* Loan & credit schemes */}
      <section>
        <h2 className="mb-2 flex items-center gap-2 font-semibold">
          <Building2 className="size-4 text-primary" />
          {t("support.loans")}
        </h2>
        <div className="space-y-3">
          {SCHEMES.map((s) => (
            <SchemeCard key={s.id} scheme={s} />
          ))}
        </div>
      </section>

      {/* Government agencies */}
      <section>
        <h2 className="mb-2 flex items-center gap-2 font-semibold">
          {t("support.agencies")}
          {place?.state ? (
            <span className="text-sm font-normal text-muted-foreground">
              · {place.state}
            </span>
          ) : null}
        </h2>
        <div className="space-y-3">
          {agencies.map((a) => (
            <AgencyCard key={a.id} agency={a} lang={lang} tapLabel={t("common.tapToCall")} visit={t("common.visitSite")} />
          ))}
        </div>
      </section>

      <p className="flex items-start gap-2 rounded-[var(--radius-md)] bg-muted/50 p-3 text-xs text-muted-foreground">
        <Info className="mt-0.5 size-4 shrink-0" />
        {t("support.disclaimer")}
      </p>
    </div>
  );
}

function AgencyCard({
  agency,
  lang,
  tapLabel,
  visit,
}: {
  agency: Agency;
  lang: "en" | "hi";
  tapLabel: string;
  visit: string;
}) {
  return (
    <div className="rounded-[var(--radius-lg)] border border-border bg-card p-4 shadow-sm">
      <p className="font-semibold">{agency.name[lang]}</p>
      <p className="mt-1 text-sm text-muted-foreground">{agency.desc[lang]}</p>
      <div className="mt-3 flex flex-wrap gap-2">
        {agency.phone ? (
          <a
            href={`tel:${agency.phone}`}
            className="inline-flex items-center gap-1.5 rounded-full bg-primary px-3.5 py-2 text-sm font-medium text-primary-foreground"
            aria-label={tapLabel}
          >
            <Phone className="size-4" />
            {agency.phone}
          </a>
        ) : null}
        <a
          href={agency.url}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 rounded-full border border-border px-3.5 py-2 text-sm font-medium"
        >
          <ExternalLink className="size-4" />
          {visit}
        </a>
      </div>
    </div>
  );
}
