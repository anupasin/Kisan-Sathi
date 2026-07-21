"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Sprout, Wheat, Landmark, ScanLine } from "lucide-react";
import { useT } from "@/i18n/language-provider";
import { cn } from "./ui";

const tabs = [
  { href: "/", key: "nav.home", icon: Sprout },
  { href: "/crops", key: "nav.crops", icon: Wheat },
  { href: "/support", key: "nav.support", icon: Landmark },
  { href: "/scan", key: "nav.scan", icon: ScanLine },
] as const;

export function TabBar() {
  const pathname = usePathname();
  const t = useT();
  return (
    <nav className="sticky bottom-0 z-30 border-t border-border bg-background/90 backdrop-blur-md md:hidden">
      <div className="mx-auto grid max-w-lg grid-cols-4">
        {tabs.map(({ href, key, icon: Icon }) => {
          const active =
            href === "/" ? pathname === "/" : pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex flex-col items-center gap-1 py-2.5 text-xs font-medium transition",
                active ? "text-primary" : "text-muted-foreground",
              )}
            >
              <span
                className={cn(
                  "grid size-9 place-items-center rounded-full transition",
                  active ? "bg-primary/12" : "bg-transparent",
                )}
              >
                <Icon className="size-5" />
              </span>
              {t(key)}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
