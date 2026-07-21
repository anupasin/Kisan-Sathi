"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { CircleUser, Crown, LogOut } from "lucide-react";
import { useT } from "@/i18n/language-provider";
import { useAuth } from "@/components/auth-provider";
import { PageHeading } from "@/components/bits";
import { Card, Badge } from "@/components/ui";

export default function AccountPage() {
  const t = useT();
  const router = useRouter();
  const { user, premium, loading, signOut } = useAuth();

  if (loading) return null;
  if (!user) {
    // Proxy normally redirects; this covers client-side navigation.
    router.replace("/login?next=/account");
    return null;
  }

  const name =
    (user.user_metadata?.full_name as string | undefined) ??
    user.email ??
    "";
  const avatar = user.user_metadata?.avatar_url as string | undefined;

  return (
    <div className="space-y-4">
      <PageHeading
        title={t("auth.account")}
        icon={<CircleUser className="size-6" />}
      />

      <Card className="p-4">
        <div className="flex items-center gap-3">
          {avatar ? (
            <Image
              src={avatar}
              alt=""
              width={48}
              height={48}
              unoptimized
              className="size-12 rounded-full"
            />
          ) : (
            <span className="grid size-12 place-items-center rounded-full bg-primary/12 text-primary">
              <CircleUser className="size-6" />
            </span>
          )}
          <div className="min-w-0 flex-1">
            <p className="truncate font-semibold">{name}</p>
            <p className="truncate text-sm text-muted-foreground">
              {user.email}
            </p>
          </div>
        </div>
      </Card>

      <Card className="p-4">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Crown
              className={`size-5 ${premium ? "text-warning" : "text-muted-foreground"}`}
            />
            <p className="font-medium">{t("auth.plan")}</p>
          </div>
          <Badge tone={premium ? "warning" : "muted"}>
            {premium ? t("auth.premium") : t("auth.free")}
          </Badge>
        </div>
        {premium === false ? (
          <Link
            href="/premium"
            className="mt-3 flex items-center justify-center gap-2 rounded-full bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground"
          >
            <Crown className="size-4" />
            {t("premium.buy")} — ₹199 {t("premium.perYear")}
          </Link>
        ) : null}
      </Card>

      <button
        type="button"
        onClick={() => {
          void signOut().then(() => router.replace("/"));
        }}
        className="flex w-full items-center justify-center gap-2 rounded-full border border-border bg-card px-4 py-3 text-sm font-semibold text-danger shadow-sm transition hover:bg-muted/50"
      >
        <LogOut className="size-4" />
        {t("auth.signOut")}
      </button>
    </div>
  );
}
