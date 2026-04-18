'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { BarChart3, DollarSign, TrendingUp } from 'lucide-react';

const SIDEBAR_ITEMS = [
  { href: '/forecast', label: 'Forecast Modelling', icon: BarChart3, exact: true, accent: 'text-accent-sky' },
  { href: '/forecast/cfo', label: 'CFO View', icon: DollarSign, exact: false, accent: 'text-accent-emerald' },
  { href: '/forecast/performance', label: 'Performance Tracker', icon: TrendingUp, exact: false, accent: 'text-accent-violet' },
];

export function ForecastSidebar() {
  const pathname = usePathname();

  // Returns true if the route is considered active. "exact: true" means the
  // /forecast root (and deeper routes that aren't cfo/performance).
  const isActive = (href: string, exact: boolean) => {
    if (exact) {
      return (
        pathname === href ||
        (pathname.startsWith(href + '/') &&
          !pathname.startsWith('/forecast/cfo') &&
          !pathname.startsWith('/forecast/performance'))
      );
    }
    return pathname.startsWith(href);
  };

  return (
    <aside className="w-56 bg-canvas-sidebar border-r border-white/5 flex flex-col shrink-0">
      <div className="px-4 py-4 border-b border-white/5">
        <p className="text-[10px] font-semibold uppercase tracking-[0.25em] text-accent-sky">
          FY2026
        </p>
        <h2 className="mt-1 text-sm font-semibold text-white tracking-tight">Forecasts</h2>
      </div>

      <nav className="flex-1 px-3 py-3 space-y-1 overflow-y-auto">
        {SIDEBAR_ITEMS.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.href, item.exact);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-2.5 px-3 py-2 rounded-md text-[13px] transition-colors border-l-2 ${
                active
                  ? 'border-l-accent-sky bg-white/5 text-white font-medium'
                  : 'border-l-transparent text-gray-400 hover:bg-white/5 hover:text-white'
              }`}
            >
              <Icon size={15} className={active ? item.accent : ''} />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="px-4 py-3 border-t border-white/5 text-[11px] text-gray-500">
        Forecast Models · FY2026
      </div>
    </aside>
  );
}
