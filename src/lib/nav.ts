import {
  Sprout,
  Wheat,
  ScanLine,
  Landmark,
  Ellipsis,
  Calculator,
  CircleUser,
  Crown,
  MessageCircleQuestion,
  NotebookPen,
  BellRing,
  type LucideIcon,
} from "lucide-react";

export type NavItem = {
  href: string;
  /** Dictionary key for the label, e.g. "nav.home". */
  key: string;
  icon: LucideIcon;
};

/**
 * Single source of truth for navigation.
 * - Mobile tab bar renders `primaryTabs` (max 5).
 * - Desktop side-nav renders `primaryTabs` + `moreItems` flat.
 * - The More page lists `moreItems` (plus account/settings blocks).
 */
export const primaryTabs: NavItem[] = [
  { href: "/", key: "nav.home", icon: Sprout },
  { href: "/crops", key: "nav.crops", icon: Wheat },
  { href: "/scan", key: "nav.scan", icon: ScanLine },
  { href: "/ask", key: "nav.ask", icon: MessageCircleQuestion },
  { href: "/more", key: "nav.more", icon: Ellipsis },
];

export const moreItems: NavItem[] = [
  { href: "/support", key: "nav.support", icon: Landmark },
  { href: "/diary", key: "diary.title", icon: NotebookPen },
  { href: "/alerts", key: "alerts.title", icon: BellRing },
  { href: "/calculator", key: "calculator.title", icon: Calculator },
  { href: "/premium", key: "auth.premium", icon: Crown },
  { href: "/account", key: "auth.account", icon: CircleUser },
];

/** True when `pathname` belongs to `item` (More owns all moreItems paths). */
export function isActive(item: NavItem, pathname: string): boolean {
  if (item.href === "/") return pathname === "/";
  if (item.href === "/more") {
    return (
      pathname.startsWith("/more") ||
      moreItems.some((m) => pathname.startsWith(m.href))
    );
  }
  return pathname.startsWith(item.href);
}
