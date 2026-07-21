"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { dictionaries, isLang, type Dict, type Lang } from "./dictionaries";

const STORAGE_KEY = "kisan-lang";

type LanguageContextValue = {
  lang: Lang;
  setLang: (l: Lang) => void;
  /** Translate a dot-path key, e.g. t("home.soilType"). */
  t: (key: string) => string;
  dict: Dict;
};

const LanguageContext = createContext<LanguageContextValue | null>(null);

function resolve(dict: Dict, key: string): string {
  const value = key
    .split(".")
    .reduce<unknown>(
      (acc, part) =>
        acc && typeof acc === "object"
          ? (acc as Record<string, unknown>)[part]
          : undefined,
      dict,
    );
  return typeof value === "string" ? value : key;
}

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLangState] = useState<Lang>("en");

  useEffect(() => {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    if (isLang(stored)) setLangState(stored);
  }, []);

  useEffect(() => {
    document.documentElement.lang = lang;
  }, [lang]);

  const setLang = useCallback((l: Lang) => {
    setLangState(l);
    window.localStorage.setItem(STORAGE_KEY, l);
  }, []);

  const dict = dictionaries[lang];
  const t = useCallback((key: string) => resolve(dict, key), [dict]);

  const value = useMemo(
    () => ({ lang, setLang, t, dict }),
    [lang, setLang, t, dict],
  );

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLang(): LanguageContextValue {
  const ctx = useContext(LanguageContext);
  if (!ctx)
    throw new Error("useLang must be used within a LanguageProvider");
  return ctx;
}

/** Convenience hook returning just the translate function. */
export function useT() {
  return useLang().t;
}
