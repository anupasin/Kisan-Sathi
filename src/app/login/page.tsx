"use client";

import { Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useEffect } from "react";
import { Sprout } from "lucide-react";
import { useT } from "@/i18n/language-provider";
import { useAuth } from "@/components/auth-provider";
import { Card } from "@/components/ui";

function LoginInner() {
  const t = useT();
  const router = useRouter();
  const params = useSearchParams();
  const { user, loading, signInWithGoogle } = useAuth();
  const next = params.get("next") ?? "/account";
  const hasError = params.get("error") === "auth";

  useEffect(() => {
    if (!loading && user) router.replace(next);
  }, [loading, user, next, router]);

  return (
    <div className="grid min-h-[60vh] place-items-center">
      <Card className="w-full max-w-sm p-6 text-center">
        <span className="mx-auto grid size-14 place-items-center rounded-full bg-primary text-primary-foreground">
          <Sprout className="size-7" />
        </span>
        <h1 className="mt-4 text-xl font-bold">{t("auth.signInTitle")}</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          {t("auth.signInBody")}
        </p>

        {hasError ? (
          <p className="mt-3 rounded-[var(--radius-md)] bg-danger/10 p-2 text-sm text-danger">
            {t("auth.authError")}
          </p>
        ) : null}

        <button
          type="button"
          onClick={() => void signInWithGoogle(next)}
          className="mt-5 flex w-full items-center justify-center gap-2.5 rounded-full border border-border bg-card px-4 py-3 text-sm font-semibold shadow-sm transition hover:bg-muted/50"
        >
          <GoogleMark />
          {t("auth.signInGoogle")}
        </button>
      </Card>
    </div>
  );
}

function GoogleMark() {
  return (
    <svg width="18" height="18" viewBox="0 0 48 48" aria-hidden>
      <path
        fill="#EA4335"
        d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"
      />
      <path
        fill="#4285F4"
        d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"
      />
      <path
        fill="#FBBC05"
        d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"
      />
      <path
        fill="#34A853"
        d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"
      />
    </svg>
  );
}

export default function LoginPage() {
  return (
    <Suspense>
      <LoginInner />
    </Suspense>
  );
}
