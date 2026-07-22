"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { CircleUser, Crown, LogIn, LogOut, ShieldCheck } from "lucide-react";
import { useT } from "@/i18n/language-provider";
import { useAuth } from "@/components/auth-provider";
import { isAdminEmail } from "@/lib/admin";
import { Badge, cn } from "./ui";

/**
 * Logged-in indicator + menu. Signed out, it's a compact "Sign in" button;
 * signed in, an avatar that opens a menu with the account, plan and sign-out.
 * Shared by the mobile header (top-right) and desktop side-nav (bottom-left),
 * so the menu measures its position on open and flips/realigns to stay
 * on-screen, mirroring the language picker.
 */
export function UserMenu() {
  const t = useT();
  const router = useRouter();
  const { user, premium, loading, signOut } = useAuth();
  const [open, setOpen] = useState(false);
  const [dropUp, setDropUp] = useState(false);
  const [alignLeft, setAlignLeft] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  const MENU_WIDTH = 224; // w-56
  const MENU_HEIGHT = 200;

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

  // Avoid a hydration flash / layout jump while auth state is unknown.
  if (loading) {
    return <span className="size-10 shrink-0 rounded-full bg-muted" aria-hidden />;
  }

  if (!user) {
    return (
      <Link
        href="/login"
        className="flex items-center gap-1.5 rounded-full border border-border bg-card px-3 py-1.5 text-sm font-medium transition hover:bg-muted"
      >
        <LogIn className="size-4 text-primary" />
        <span>{t("auth.signIn")}</span>
      </Link>
    );
  }

  const admin = isAdminEmail(user.email);
  const name =
    (user.user_metadata?.full_name as string | undefined) ?? user.email ?? "";
  const avatar = user.user_metadata?.avatar_url as string | undefined;

  const avatarNode = avatar ? (
    <Image
      src={avatar}
      alt=""
      width={40}
      height={40}
      unoptimized
      className="size-10 rounded-full"
    />
  ) : (
    <span className="grid size-10 place-items-center rounded-full bg-primary/12 text-primary">
      <CircleUser className="size-6" />
    </span>
  );

  return (
    <div ref={rootRef} className="relative">
      <button
        type="button"
        onClick={() => {
          const rect = rootRef.current?.getBoundingClientRect();
          if (rect) {
            setDropUp(window.innerHeight - rect.bottom < MENU_HEIGHT);
            setAlignLeft(rect.right - MENU_WIDTH < 0);
          }
          setOpen((o) => !o);
        }}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label={t("auth.account")}
        className="grid size-10 shrink-0 place-items-center rounded-full ring-2 ring-transparent transition hover:ring-border"
      >
        {avatarNode}
      </button>

      {open ? (
        <div
          role="menu"
          className={cn(
            "absolute z-50 w-56 overflow-hidden rounded-[var(--radius-md)] border border-border bg-card shadow-lg",
            dropUp ? "bottom-full mb-2" : "top-full mt-2",
            alignLeft ? "left-0" : "right-0",
          )}
        >
          <div className="flex items-center gap-2.5 border-b border-border p-3">
            {avatarNode}
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold">{name}</p>
              <p className="truncate text-xs text-muted-foreground">
                {user.email}
              </p>
            </div>
          </div>

          <div className="flex items-center justify-between gap-2 px-3 py-2">
            <span className="text-sm text-muted-foreground">
              {t("auth.plan")}
            </span>
            {admin ? (
              <Badge tone="primary">
                <ShieldCheck className="size-3.5" />
                {t("auth.admin")}
              </Badge>
            ) : premium ? (
              <Badge tone="warning">
                <Crown className="size-3.5" />
                {t("auth.premium")}
              </Badge>
            ) : (
              <Badge tone="muted">{t("auth.free")}</Badge>
            )}
          </div>

          <Link
            href="/account"
            role="menuitem"
            onClick={() => setOpen(false)}
            className="flex items-center gap-2.5 border-t border-border px-3 py-2.5 text-sm transition hover:bg-muted"
          >
            <CircleUser className="size-4 text-muted-foreground" />
            {t("auth.account")}
          </Link>
          <button
            type="button"
            role="menuitem"
            onClick={() => {
              setOpen(false);
              void signOut().then(() => router.replace("/"));
            }}
            className="flex w-full items-center gap-2.5 border-t border-border px-3 py-2.5 text-left text-sm font-medium text-danger transition hover:bg-muted"
          >
            <LogOut className="size-4" />
            {t("auth.signOut")}
          </button>
        </div>
      ) : null}
    </div>
  );
}
