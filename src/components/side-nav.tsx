"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Sprout, MapPin } from "lucide-react";
import { useT } from "@/i18n/language-provider";
import { useLocation } from "@/lib/location-provider";
import { primaryTabs, moreItems, isActive } from "@/lib/nav";
import { LanguagePicker } from "./language-picker";
import { ThemeToggle } from "./theme-toggle";
import { UserMenu } from "./user-menu";
import { cn } from "./ui";

// Desktop has room for everything: primary tabs (minus "More") + more items.
const tabs = [...primaryTabs.filter((i) => i.href !== "/more"), ...moreItems];

export function SideNav() {
  const pathname = usePathname();
  const t = useT();
  const { place, coords } = useLocation();

  return (
    <aside className="hidden w-64 shrink-0 flex-col border-r border-border bg-background/85 md:flex">
      <div className="flex items-center gap-2.5 px-4 h-16 border-b border-border">
        <span className="grid size-10 shrink-0 place-items-center rounded-full bg-primary text-primary-foreground shadow-sm">
          <Sprout className="size-6" />
        </span>
        <div className="min-w-0">
          <p className="font-bold leading-tight truncate">
            {t("common.appName")}
          </p>
          <p className="text-xs text-muted-foreground truncate">
            {t("common.tagline")}
          </p>
        </div>
      </div>

      <nav className="flex flex-1 flex-col gap-1 p-3">
        {tabs.map((item) => {
          const { href, key, icon: Icon } = item;
          const active = isActive(item, pathname);
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex items-center gap-3 rounded-[var(--radius-md)] px-3 py-2.5 text-sm font-medium transition",
                active
                  ? "bg-primary/12 text-primary"
                  : "text-muted-foreground hover:bg-muted",
              )}
            >
              <Icon className="size-5" />
              {t(key)}
            </Link>
          );
        })}
      </nav>

      <div className="flex flex-col gap-3 border-t border-border p-3">
        {coords ? (
          <div className="flex items-center gap-2.5 rounded-[var(--radius-md)] bg-card px-3 py-2 min-w-0">
            <span className="grid size-8 shrink-0 place-items-center rounded-full bg-primary/12 text-primary">
              <MapPin className="size-4" />
            </span>
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold">
                {place?.district || t("location.unknownPlace")}
              </p>
              {place?.state ? (
                <p className="truncate text-xs text-muted-foreground">
                  {place.state}
                </p>
              ) : null}
            </div>
          </div>
        ) : null}
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <UserMenu />
            <LanguagePicker />
          </div>
          <ThemeToggle />
        </div>
      </div>
    </aside>
  );
}
