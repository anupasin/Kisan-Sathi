"use client";

import { useLang } from "@/i18n/language-provider";

export function LanguageToggle() {
  const { lang, setLang } = useLang();
  return (
    <div className="flex items-center rounded-full border border-border bg-card p-0.5 text-sm font-medium">
      <button
        type="button"
        onClick={() => setLang("en")}
        aria-pressed={lang === "en"}
        className={`rounded-full px-3 py-1.5 transition ${
          lang === "en"
            ? "bg-primary text-primary-foreground"
            : "text-muted-foreground"
        }`}
      >
        EN
      </button>
      <button
        type="button"
        onClick={() => setLang("hi")}
        aria-pressed={lang === "hi"}
        className={`rounded-full px-3 py-1.5 transition ${
          lang === "hi"
            ? "bg-primary text-primary-foreground"
            : "text-muted-foreground"
        }`}
      >
        हिं
      </button>
    </div>
  );
}
