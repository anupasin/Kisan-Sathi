"use client";

import { useEffect, useRef, useState } from "react";
import { Check, ChevronDown, Languages } from "lucide-react";
import { useLang } from "@/i18n/language-provider";
import { LANGS } from "@/i18n/dictionaries";
import { cn } from "./ui";

export function LanguagePicker() {
  const { lang, setLang, t } = useLang();
  const [open, setOpen] = useState(false);
  // In the desktop side-nav the button sits near the viewport bottom, so the
  // menu must flip upward when there isn't room below it.
  const [dropUp, setDropUp] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onPointerDown = (e: PointerEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("pointerdown", onPointerDown);
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("pointerdown", onPointerDown);
      window.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const current = LANGS.find((l) => l.code === lang) ?? LANGS[0];

  return (
    <div ref={rootRef} className="relative">
      <button
        type="button"
        onClick={() => {
          const rect = rootRef.current?.getBoundingClientRect();
          // Menu is ~5 rows × 36px + padding; flip up if it wouldn't fit.
          if (rect) setDropUp(window.innerHeight - rect.bottom < 220);
          setOpen((o) => !o);
        }}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label={t("settings.language")}
        className="flex items-center gap-1.5 rounded-full border border-border bg-card px-3 py-1.5 text-sm font-medium"
      >
        <Languages className="size-4 text-primary" />
        <span>{current.short}</span>
        <ChevronDown
          className={cn("size-3.5 text-muted-foreground transition", open && "rotate-180")}
        />
      </button>

      {open ? (
        <ul
          role="listbox"
          aria-label={t("settings.language")}
          className={cn(
            "absolute right-0 z-50 w-40 overflow-hidden rounded-[var(--radius-md)] border border-border bg-card py-1 shadow-lg",
            dropUp ? "bottom-full mb-2" : "top-full mt-2",
          )}
        >
          {LANGS.map((l) => {
            const active = l.code === lang;
            return (
              <li key={l.code}>
                <button
                  type="button"
                  role="option"
                  aria-selected={active}
                  lang={l.code}
                  onClick={() => {
                    setLang(l.code);
                    setOpen(false);
                  }}
                  className={cn(
                    "flex w-full items-center justify-between px-3 py-2 text-sm transition",
                    active
                      ? "bg-primary/10 font-semibold text-primary"
                      : "text-foreground hover:bg-muted",
                  )}
                >
                  {l.label}
                  {active ? <Check className="size-4" /> : null}
                </button>
              </li>
            );
          })}
        </ul>
      ) : null}
    </div>
  );
}
