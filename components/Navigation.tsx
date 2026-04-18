"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BarChart3,
  CalendarRange,
  TrendingUp,
  Megaphone,
  Handshake,
  Target,
  Sparkles,
  Settings,
  Sparkle,
} from "lucide-react";

const NAV_ITEMS = [
  { href: "/forecast", label: "Forecasts", icon: BarChart3 },
  { href: "/workback", label: "Product Readiness", icon: CalendarRange },
  { href: "/sales-motion", label: "Sales", icon: TrendingUp },
  { href: "/sales-motion/marketing", label: "Marketing", icon: Megaphone },
  { href: "/sales-motion/partner", label: "Partner", icon: Handshake },
  { href: "/aop", label: "AOP", icon: Target },
  { href: "/ai-showcase", label: "AI Showcase", icon: Sparkles },
  { href: "/settings", label: "Settings", icon: Settings },
];

export default function Navigation() {
  const pathname = usePathname();

  return (
    <nav className="glass-nav text-white sticky top-0 z-40 border-b border-white/5 shadow-soft">
      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-6 h-14">
          <Link
            href="/"
            className="flex items-center gap-2 font-semibold tracking-tight hover:opacity-90 transition-opacity"
          >
            <span className="relative inline-flex h-8 w-8 items-center justify-center rounded-xl bg-brand-gradient shadow-soft">
              <Sparkle className="w-4 h-4 text-white" strokeWidth={2.5} />
              <span className="absolute inset-0 rounded-xl ring-1 ring-inset ring-white/25" />
            </span>
            <span className="text-[15px]">
              FY2026
              <span className="ml-1 text-white/60 font-normal">GTM</span>
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
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`group relative inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[13px] font-medium whitespace-nowrap transition-all duration-200 ease-smooth ${
                    active
                      ? "bg-white/10 text-white shadow-inner-soft"
                      : "text-white/70 hover:bg-white/5 hover:text-white"
                  }`}
                >
                  <Icon
                    className={`w-3.5 h-3.5 transition-transform duration-200 ${
                      active ? "scale-110" : "group-hover:scale-110"
                    }`}
                    strokeWidth={2}
                  />
                  <span>{item.label}</span>
                  {active && (
                    <span className="absolute left-3 right-3 -bottom-[1px] h-[2px] rounded-full bg-brand-gradient" />
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
