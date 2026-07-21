"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Cloud, Crown, Trash2 } from "lucide-react";
import { useT } from "@/i18n/language-provider";
import { useAuth } from "@/components/auth-provider";
import { getSupabaseBrowser } from "@/lib/supabase/client";
import type { ScanResult } from "@/lib/types";
import { PageHeading } from "@/components/bits";
import { ScanResultView } from "@/components/scan-result";
import { Spinner } from "@/components/ui";

type Row = {
  id: string;
  result: ScanResult;
  thumb_path: string | null;
  created_at: string;
  thumbUrl?: string;
};

export default function CloudHistoryPage() {
  const t = useT();
  const { user, premium, loading: authLoading } = useAuth();
  const [rows, setRows] = useState<Row[] | null>(null);
  const [selected, setSelected] = useState<Row | null>(null);

  useEffect(() => {
    if (!user || !premium) return;
    const supabase = getSupabaseBrowser();
    void (async () => {
      const { data } = await supabase
        .from("scan_history")
        .select("id, result, thumb_path, created_at")
        .order("created_at", { ascending: false })
        .limit(60);
      const list = (data ?? []) as Row[];
      const paths = list
        .map((r) => r.thumb_path)
        .filter((p): p is string => !!p);
      if (paths.length > 0) {
        const { data: signed } = await supabase.storage
          .from("scan-thumbs")
          .createSignedUrls(paths, 3600);
        const byPath = new Map<string, string>();
        for (const s of signed ?? []) {
          if (s.path && s.signedUrl) byPath.set(s.path, s.signedUrl);
        }
        for (const r of list) {
          if (r.thumb_path) r.thumbUrl = byPath.get(r.thumb_path);
        }
      }
      setRows(list);
    })();
  }, [user, premium]);

  const remove = async (id: string) => {
    const supabase = getSupabaseBrowser();
    await supabase.from("scan_history").delete().eq("id", id);
    setRows((r) => r?.filter((x) => x.id !== id) ?? null);
    if (selected?.id === id) setSelected(null);
  };

  return (
    <div className="space-y-4">
      <PageHeading
        title={t("scan.cloudHistory")}
        icon={<Cloud className="size-6" />}
      />

      {authLoading ? null : !user || premium === false ? (
        <div className="space-y-2 rounded-[var(--radius-lg)] bg-warning/12 p-4 text-sm">
          <p className="text-foreground/90">{t("scan.quotaExceeded")}</p>
          <Link
            href={user ? "/premium" : "/login?next=/scan/history"}
            className="inline-flex items-center gap-1.5 rounded-full bg-primary px-4 py-2 font-medium text-primary-foreground"
          >
            <Crown className="size-4" />
            {user ? t("scan.goPremium") : t("auth.signIn")}
          </Link>
        </div>
      ) : rows == null ? (
        <div className="grid place-items-center py-10">
          <Spinner />
        </div>
      ) : rows.length === 0 ? (
        <p className="rounded-[var(--radius-lg)] border border-dashed border-border p-4 text-center text-sm text-muted-foreground">
          {t("scan.noHistory")}
        </p>
      ) : (
        <>
          {selected ? <ScanResultView result={selected.result} /> : null}
          <div className="grid grid-cols-3 gap-2">
            {rows.map((r) => (
              <div
                key={r.id}
                className="relative overflow-hidden rounded-[var(--radius-md)] border border-border"
              >
                <button
                  type="button"
                  onClick={() => setSelected(r)}
                  className="block w-full text-left"
                >
                  {r.thumbUrl ? (
                    <Image
                      src={r.thumbUrl}
                      alt={r.result.plant || "scan"}
                      width={96}
                      height={96}
                      unoptimized
                      className="aspect-square w-full object-cover"
                    />
                  ) : (
                    <div className="grid aspect-square w-full place-items-center bg-muted text-muted-foreground">
                      <Cloud className="size-6" />
                    </div>
                  )}
                  <div className="p-1.5">
                    <p className="truncate text-xs font-medium">
                      {r.result.plant || t("scan.plant")}
                    </p>
                    <p className="truncate text-[10px] text-muted-foreground">
                      {new Date(r.created_at).toLocaleDateString()}
                    </p>
                  </div>
                </button>
                <button
                  type="button"
                  onClick={() => void remove(r.id)}
                  aria-label={t("scan.clearHistory")}
                  className="absolute right-1 top-1 grid size-6 place-items-center rounded-full bg-background/80 text-muted-foreground"
                >
                  <Trash2 className="size-3.5" />
                </button>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
