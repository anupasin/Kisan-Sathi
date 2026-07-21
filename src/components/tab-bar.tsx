"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useT } from "@/i18n/language-provider";
import { primaryTabs, isActive } from "@/lib/nav";
import { cn } from "./ui";

export function TabBar() {
  const pathname = usePathname();
  const t = useT();
  return (
    <nav className="sticky bottom-0 z-30 border-t border-border bg-background/90 backdrop-blur-md md:hidden">
      <div className="mx-auto grid max-w-lg grid-cols-5">
        {primaryTabs.map((item) => {
          const { href, key, icon: Icon } = item;
          const active = isActive(item, pathname);
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
