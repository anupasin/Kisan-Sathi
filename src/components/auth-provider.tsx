"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import type { User } from "@supabase/supabase-js";
import { getSupabaseBrowser } from "@/lib/supabase/client";
import { useLang } from "@/i18n/language-provider";
import { isLang } from "@/i18n/dictionaries";

type AuthContextValue = {
  user: User | null;
  /** null while unknown (loading). */
  premium: boolean | null;
  loading: boolean;
  signInWithGoogle: (next?: string) => Promise<void>;
  signOut: () => Promise<void>;
  /** Re-check the premium flag (e.g. after checkout). */
  refreshPremium: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const supabase = getSupabaseBrowser();
  const { lang, setLang } = useLang();
  const [user, setUser] = useState<User | null>(null);
  const [premium, setPremium] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(true);

  const refreshPremium = useCallback(async () => {
    const { data: userData } = await supabase.auth.getUser();
    const u = userData.user;
    if (!u) {
      setPremium(false);
      return;
    }
    const { data } = await supabase.rpc("is_premium", { uid: u.id });
    setPremium(data === true);
  }, [supabase]);

  // Two-way settings sync: profile is the source of truth once it has values;
  // otherwise the device's current settings seed the profile.
  const syncProfile = useCallback(
    async (u: User) => {
      const { data: profile } = await supabase
        .from("profiles")
        .select("lang, location")
        .eq("id", u.id)
        .maybeSingle();
      if (!profile) return;

      const localLang = window.localStorage.getItem("kisan-lang");
      const localLocation = window.localStorage.getItem("kisan-location");

      const updates: Record<string, unknown> = {};
      if (profile.lang && isLang(profile.lang) && profile.lang !== localLang) {
        setLang(profile.lang);
      } else if (localLang && localLang !== profile.lang) {
        updates.lang = localLang;
      }
      if (profile.location && !localLocation) {
        window.localStorage.setItem(
          "kisan-location",
          JSON.stringify(profile.location),
        );
      } else if (localLocation && !profile.location) {
        try {
          updates.location = JSON.parse(localLocation);
        } catch {
          /* corrupt local value — skip */
        }
      }
      if (Object.keys(updates).length > 0) {
        updates.updated_at = new Date().toISOString();
        await supabase.from("profiles").update(updates).eq("id", u.id);
      }
    },
    [supabase, setLang],
  );

  useEffect(() => {
    let cancelled = false;

    supabase.auth.getUser().then(({ data }) => {
      if (cancelled) return;
      setUser(data.user);
      setLoading(false);
      if (data.user) {
        void syncProfile(data.user);
        void refreshPremium();
      } else {
        setPremium(false);
      }
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user ?? null);
      if (event === "SIGNED_IN" && session?.user) {
        void syncProfile(session.user);
        void refreshPremium();
      }
      if (event === "SIGNED_OUT") setPremium(false);
    });

    return () => {
      cancelled = true;
      subscription.unsubscribe();
    };
  }, [supabase, syncProfile, refreshPremium]);

  // Keep the signed-in profile's language current when the user switches it.
  useEffect(() => {
    if (!user) return;
    void supabase.from("profiles").update({ lang }).eq("id", user.id);
  }, [lang, user, supabase]);

  const signInWithGoogle = useCallback(
    async (next = "/") => {
      await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent(next)}`,
        },
      });
    },
    [supabase],
  );

  const signOut = useCallback(async () => {
    await supabase.auth.signOut();
  }, [supabase]);

  const value = useMemo(
    () => ({ user, premium, loading, signInWithGoogle, signOut, refreshPremium }),
    [user, premium, loading, signInWithGoogle, signOut, refreshPremium],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
