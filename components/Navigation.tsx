"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

type NavItem = {
  href: string;
  label: string;
  accentText: string;
  accentBg: string;
  accentBorder: string;
};

const NAV_ITEMS: NavItem[] = [
  { href: "/forecast", label: "Forecasts", accentText: "text-sky-400", accentBg: "bg-sky-400", accentBorder: "border-sky-400" },
  { href: "/workback", label: "Product Readiness", accentText: "text-violet-400", accentBg: "bg-violet-400", accentBorder: "border-violet-400" },
  { href: "/sales-motion", label: "Sales", accentText: "text-emerald-400", accentBg: "bg-emerald-400", accentBorder: "border-emerald-400" },
  { href: "/sales-motion/marketing", label: "Marketing", accentText: "text-amber-400", accentBg: "bg-amber-400", accentBorder: "border-amber-400" },
  { href: "/sales-motion/partner", label: "Partner", accentText: "text-amber-400", accentBg: "bg-amber-400", accentBorder: "border-amber-400" },
  { href: "/aop", label: "AOP", accentText: "text-sky-400", accentBg: "bg-sky-400", accentBorder: "border-sky-400" },
  { href: "/settings", label: "Settings", accentText: "text-gray-300", accentBg: "bg-gray-300", accentBorder: "border-gray-300" },
];

export default function Navigation() {
  const pathname = usePathname();

  return (
    <nav className="bg-[#0b1120] border-b border-white/5 text-white px-6 py-3 flex items-center gap-8">
      <Link
        href="/"
        className="font-bold text-lg tracking-tight hover:text-gray-200 transition-colors flex items-center gap-2"
      >
        <span className="text-[10px] font-semibold uppercase tracking-[0.25em] text-gray-500">
          FY2026
        </span>
        <span>GTM</span>
      </Link>
      <div className="flex gap-1">
        {NAV_ITEMS.map((item) => {
          let active = pathname === item.href || pathname.startsWith(item.href + "/");
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
              className={`relative flex items-center gap-2 px-3 py-1.5 rounded text-sm font-medium transition-colors border ${
                active
                  ? `bg-white/5 ${item.accentBorder} text-white`
                  : "border-transparent text-gray-400 hover:bg-white/5 hover:text-white"
              }`}
            >
              <span
                className={`h-1.5 w-1.5 rounded-full ${item.accentBg} ${
                  active ? "opacity-100" : "opacity-50"
                }`}
              />
              {item.label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
