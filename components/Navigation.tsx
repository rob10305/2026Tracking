"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

type NavItem = {
  href: string;
  label: string;
  accent: "sky" | "emerald" | "amber" | "violet";
};

const NAV_ITEMS: NavItem[] = [
  { href: "/forecast", label: "Forecasts", accent: "sky" },
  { href: "/workback", label: "Product Readiness", accent: "violet" },
  { href: "/sales-motion", label: "Sales", accent: "emerald" },
  { href: "/sales-motion/marketing", label: "Marketing", accent: "amber" },
  { href: "/sales-motion/partner", label: "Partner", accent: "amber" },
  { href: "/aop", label: "AOP", accent: "violet" },
  { href: "/ai-showcase", label: "AI Showcase", accent: "sky" },
  { href: "/settings", label: "Settings", accent: "sky" },
];

const ACCENT_TEXT: Record<NavItem["accent"], string> = {
  sky: "text-accent-sky",
  emerald: "text-accent-emerald",
  amber: "text-accent-amber",
  violet: "text-accent-violet",
};

const ACCENT_BG: Record<NavItem["accent"], string> = {
  sky: "bg-accent-sky",
  emerald: "bg-accent-emerald",
  amber: "bg-accent-amber",
  violet: "bg-accent-violet",
};

export default function Navigation() {
  const pathname = usePathname();

  return (
    <nav className="sticky top-0 z-40 bg-canvas-sidebar/95 backdrop-blur border-b border-white/5">
      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-8 h-14">
          <Link
            href="/"
            className="flex items-baseline gap-2 group"
            aria-label="FY2026 GTM home"
          >
            <span className="text-[10px] font-semibold uppercase tracking-[0.3em] text-accent-sky">
              FY2026
            </span>
            <span className="text-[15px] font-semibold tracking-tight text-white group-hover:text-accent-sky transition-colors">
              GTM
            </span>
          </Link>

          <div className="flex items-center gap-0.5 overflow-x-auto">
            {NAV_ITEMS.map((item) => {
              let active =
                pathname === item.href ||
                pathname.startsWith(item.href + "/");
              // Sales tab should not highlight for marketing/partner routes
              if (
                item.href === "/sales-motion" &&
                (pathname.startsWith("/sales-motion/marketing") ||
                  pathname.startsWith("/sales-motion/partner"))
              ) {
                active = false;
              }
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`relative inline-flex items-center gap-2 px-3 py-1.5 rounded-md text-[13px] font-medium whitespace-nowrap transition-colors duration-200 ${
                    active
                      ? "bg-white/5 text-white"
                      : "text-gray-400 hover:text-white hover:bg-white/5"
                  }`}
                >
                  <span
                    className={`h-1.5 w-1.5 rounded-full transition-opacity ${
                      ACCENT_BG[item.accent]
                    } ${active ? "opacity-100" : "opacity-40"}`}
                  />
                  <span>{item.label}</span>
                  {active && (
                    <span
                      className={`absolute left-2 right-2 -bottom-px h-[2px] rounded-full ${
                        ACCENT_BG[item.accent]
                      }`}
                    />
                  )}
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </nav>
  );
}
