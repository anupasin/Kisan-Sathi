"use client";

import { Sprout } from "lucide-react";
import { useT } from "@/i18n/language-provider";
import { LanguagePicker } from "./language-picker";
import { ThemeToggle } from "./theme-toggle";

export function Header() {
  const t = useT();
  return (
    <header className="sticky top-0 z-30 border-b border-border bg-background/85 backdrop-blur-md md:hidden">
      <div className="mx-auto flex h-16 max-w-lg items-center justify-between gap-2 px-4">
        <div className="flex items-center gap-2.5 min-w-0">
          <span className="grid size-10 shrink-0 place-items-center rounded-full bg-primary text-primary-foreground shadow-sm">
            <Sprout className="size-6" />
          </span>
          <div className="min-w-0">
            <h1 className="font-bold leading-tight truncate">
              {t("common.appName")}
            </h1>
            <p className="text-xs text-muted-foreground truncate">
              {t("common.tagline")}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <LanguagePicker />
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}
