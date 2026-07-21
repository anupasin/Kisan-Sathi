"use client";

import { useEffect, useRef, useState } from "react";
import { Check, ChevronDown, Languages } from "lucide-react";
import { useLang } from "@/i18n/language-provider";
import { LANGS } from "@/i18n/dictionaries";
import { cn } from "./ui";

export function LanguagePicker() {
  const { lang, setLang, t } = useLang();
  const [open, setOpen] = useState(false);
  // The button appears bottom-left in the desktop side-nav and top-right in the
  // mobile header, so the menu position is measured on open: it flips up when
  // there's no room below, and aligns to whichever edge keeps it on-screen.
  const [dropUp, setDropUp] = useState(false);
  const [alignLeft, setAlignLeft] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  const MENU_WIDTH = 160; // w-40
  const MENU_HEIGHT = 220; // ~5 rows + padding

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
          if (rect) {
            // Flip up if there's no room below the button.
            setDropUp(window.innerHeight - rect.bottom < MENU_HEIGHT);
            // Right-aligned by default (extends left); align left instead when
            // extending left would run off the screen edge.
            setAlignLeft(rect.right - MENU_WIDTH < 0);
          }
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
            "absolute z-50 w-40 overflow-hidden rounded-[var(--radius-md)] border border-border bg-card py-1 shadow-lg",
            dropUp ? "bottom-full mb-2" : "top-full mt-2",
            alignLeft ? "left-0" : "right-0",
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
