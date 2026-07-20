"use client";

import { useEffect, useState } from "react";
import { useTheme } from "next-themes";
import { Moon, Sun } from "lucide-react";
import { useT } from "@/i18n/language-provider";

export function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const t = useT();
  useEffect(() => setMounted(true), []);

  // Before mount the resolved theme is unknown; keep a stable value so the
  // server and first client render agree (avoids a hydration mismatch).
  const isDark = mounted && resolvedTheme === "dark";

  return (
    <button
      type="button"
      onClick={() => setTheme(isDark ? "light" : "dark")}
      className="grid size-10 place-items-center rounded-full border border-border bg-card text-foreground transition hover:bg-muted"
      aria-label={isDark ? t("settings.light") : t("settings.dark")}
      title={isDark ? t("settings.light") : t("settings.dark")}
    >
      {isDark ? <Sun className="size-5" /> : <Moon className="size-5" />}
    </button>
  );
}
