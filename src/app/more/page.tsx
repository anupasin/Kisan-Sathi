"use client";

import Link from "next/link";
import { Ellipsis, ChevronRight, Smartphone } from "lucide-react";
import { useT } from "@/i18n/language-provider";
import { moreItems } from "@/lib/nav";
import { PageHeading } from "@/components/bits";
import { LanguagePicker } from "@/components/language-picker";
import { ThemeToggle } from "@/components/theme-toggle";

export default function MorePage() {
  const t = useT();

  return (
    <div className="space-y-4">
      <PageHeading
        title={t("more.title")}
        subtitle={t("more.subtitle")}
        icon={<Ellipsis className="size-6" />}
      />

      <div className="space-y-2">
        {moreItems.map(({ href, key, icon: Icon }) => (
          <Link
            key={href}
            href={href}
            className="flex items-center gap-3 rounded-[var(--radius-lg)] border border-border bg-card p-4 shadow-sm transition hover:bg-muted/40"
          >
            <span className="grid size-10 shrink-0 place-items-center rounded-full bg-primary/12 text-primary">
              <Icon className="size-5" />
            </span>
            <span className="flex-1 font-medium">{t(key)}</span>
            <ChevronRight className="size-5 text-muted-foreground" />
          </Link>
        ))}
      </div>

      <div className="rounded-[var(--radius-lg)] border border-border bg-card p-4 shadow-sm">
        <div className="flex items-center justify-between gap-3">
          <p className="text-sm font-medium">{t("settings.language")}</p>
          <LanguagePicker />
        </div>
        <div className="mt-3 flex items-center justify-between gap-3 border-t border-border pt-3">
          <p className="text-sm font-medium">{t("settings.theme")}</p>
          <ThemeToggle />
        </div>
      </div>

      <p className="flex items-start gap-2 rounded-[var(--radius-md)] bg-muted/50 p-3 text-xs text-muted-foreground">
        <Smartphone className="mt-0.5 size-4 shrink-0" />
        {t("more.install")}
      </p>
    </div>
  );
}
