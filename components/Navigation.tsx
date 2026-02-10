"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const NAV_ITEMS = [
  { href: "/forecast", label: "Forecasts" },
  { href: "/performance", label: "Performance Tracker" },
  { href: "/summary", label: "Summary" },
  { href: "/workback", label: "Workback" },
  { href: "/settings", label: "Critical Business Inputs" },
];

export default function Navigation() {
  const pathname = usePathname();

  return (
    <nav className="bg-gray-900 text-white px-6 py-3 flex items-center gap-8">
      <Link href="/" className="font-bold text-lg tracking-tight hover:text-gray-200 transition-colors">
        FY2026 Forecast
      </Link>
      <div className="flex gap-1">
        {NAV_ITEMS.map((item) => {
          const active =
            pathname === item.href || pathname.startsWith(item.href + "/");
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`px-3 py-1.5 rounded text-sm font-medium transition-colors ${
                active
                  ? "bg-white text-gray-900"
                  : "text-gray-300 hover:bg-gray-700 hover:text-white"
              }`}
            >
              {item.label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
