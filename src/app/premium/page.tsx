"use client";

import { useState } from "react";
import Link from "next/link";
import Script from "next/script";
import { Check, Crown, Minus, LogIn } from "lucide-react";
import { useT } from "@/i18n/language-provider";
import { useAuth } from "@/components/auth-provider";
import { PageHeading } from "@/components/bits";
import { Card, Spinner } from "@/components/ui";
import type { ApiResult } from "@/lib/types";

type OrderData = { orderId: string; amount: number; keyId: string };

declare global {
  interface Window {
    Razorpay?: new (options: Record<string, unknown>) => { open: () => void };
  }
}

export default function PremiumPage() {
  const t = useT();
  const { user, premium, refreshPremium } = useAuth();
  const [state, setState] = useState<
    "idle" | "processing" | "success" | "notConfigured" | "failed"
  >("idle");

  const buy = async () => {
    setState("processing");
    try {
      const res = (await fetch("/api/billing/order", { method: "POST" }).then(
        (r) => r.json(),
      )) as ApiResult<OrderData>;
      if (!res.ok || !res.data) {
        setState(
          res.error === "billing_not_configured" ? "notConfigured" : "failed",
        );
        return;
      }
      if (!window.Razorpay) {
        setState("failed");
        return;
      }
      const { orderId, amount, keyId } = res.data;
      const rzp = new window.Razorpay({
        key: keyId,
        amount,
        currency: "INR",
        name: "Kisan Sathi",
        description: t("premium.title"),
        order_id: orderId,
        prefill: { email: user?.email },
        theme: { color: "#2f8f4e" },
        handler: async (response: {
          razorpay_order_id: string;
          razorpay_payment_id: string;
          razorpay_signature: string;
        }) => {
          const verify = (await fetch("/api/billing/verify", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(response),
          }).then((r) => r.json())) as ApiResult<{ active: boolean }>;
          if (verify.ok) {
            await refreshPremium();
            setState("success");
          } else {
            setState("failed");
          }
        },
        modal: { ondismiss: () => setState("idle") },
      });
      rzp.open();
    } catch {
      setState("failed");
    }
  };

  const rows: Array<[string, string | boolean, string | boolean]> = [
    [t("premium.rowScans"), t("premium.rowScansFree"), t("premium.rowScansPremium")],
    [t("premium.rowHistory"), false, true],
    [t("premium.rowAlerts"), false, true],
    [t("premium.rowVoice"), false, true],
    [t("premium.rowReports"), false, true],
  ];

  return (
    <div className="space-y-4">
      <Script src="https://checkout.razorpay.com/v1/checkout.js" />
      <PageHeading
        title={t("premium.title")}
        subtitle={t("premium.subtitle")}
        icon={<Crown className="size-6" />}
      />

      <Card className="overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border text-left">
              <th className="p-3 font-medium text-muted-foreground"></th>
              <th className="p-3 font-semibold">{t("premium.free")}</th>
              <th className="bg-primary/8 p-3 font-semibold text-primary">
                {t("premium.premiumCol")}
              </th>
            </tr>
          </thead>
          <tbody>
            {rows.map(([label, free, prem]) => (
              <tr key={label} className="border-b border-border last:border-0">
                <td className="p-3">{label}</td>
                <td className="p-3 text-muted-foreground">
                  {typeof free === "string" ? (
                    free
                  ) : free ? (
                    <Check className="size-4 text-success" />
                  ) : (
                    <Minus className="size-4" />
                  )}
                </td>
                <td className="bg-primary/8 p-3 font-medium">
                  {typeof prem === "string" ? (
                    prem
                  ) : prem ? (
                    <Check className="size-4 text-success" />
                  ) : (
                    <Minus className="size-4" />
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>

      {premium ? (
        <p className="rounded-[var(--radius-lg)] bg-success/12 p-4 text-sm text-foreground/90">
          {t("premium.success")}
        </p>
      ) : !user ? (
        <Link
          href="/login?next=/premium"
          className="flex w-full items-center justify-center gap-2 rounded-full bg-primary px-4 py-3.5 font-semibold text-primary-foreground shadow-sm"
        >
          <LogIn className="size-5" />
          {t("auth.signIn")}
        </Link>
      ) : (
        <>
          <button
            type="button"
            onClick={() => void buy()}
            disabled={state === "processing"}
            className="flex w-full items-center justify-center gap-2 rounded-full bg-primary px-4 py-3.5 font-semibold text-primary-foreground shadow-sm disabled:opacity-60"
          >
            {state === "processing" ? <Spinner /> : <Crown className="size-5" />}
            {state === "processing"
              ? t("premium.processing")
              : `${t("premium.buy")} — ₹199 ${t("premium.perYear")}`}
          </button>
          {state === "success" ? (
            <p className="rounded-[var(--radius-lg)] bg-success/12 p-4 text-sm">
              {t("premium.success")}
            </p>
          ) : state === "notConfigured" ? (
            <p className="rounded-[var(--radius-lg)] bg-warning/12 p-4 text-sm">
              {t("premium.notConfigured")}
            </p>
          ) : state === "failed" ? (
            <p className="rounded-[var(--radius-lg)] bg-danger/12 p-4 text-sm">
              {t("scan.failed")}
            </p>
          ) : null}
        </>
      )}

      <p className="rounded-[var(--radius-md)] bg-muted/50 p-3 text-xs text-muted-foreground">
        {t("premium.renewNote")}
      </p>
    </div>
  );
}
