'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { BarChart3, DollarSign, TrendingUp } from 'lucide-react';

const SIDEBAR_ITEMS = [
  { href: '/forecast', label: 'Forecast Modelling', icon: BarChart3, exact: true },
  { href: '/forecast/cfo', label: 'CFO View', icon: DollarSign, exact: false },
  { href: '/forecast/performance', label: 'Performance Tracker', icon: TrendingUp, exact: false },
];

export function ForecastSidebar() {
  const pathname = usePathname();

  const linkClass = (href: string, exact: boolean) => {
    const active = exact
      ? pathname === href || pathname.startsWith(href + '/')
        && !pathname.startsWith('/forecast/cfo')
        && !pathname.startsWith('/forecast/performance')
      : pathname.startsWith(href);
    return `flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-colors ${
      active ? 'bg-white shadow-sm text-gray-900 font-medium' : 'text-gray-600 hover:bg-white/60 hover:text-gray-900'
    }`;
  };

  return (
    <aside className="w-56 bg-gray-50 border-r border-gray-200 flex flex-col shrink-0">
      <div className="px-4 py-4 border-b border-gray-200">
        <h2 className="text-sm font-bold text-gray-800 tracking-tight">Forecasts</h2>
      </div>

      <nav className="flex-1 px-3 py-3 space-y-1 overflow-y-auto">
        {SIDEBAR_ITEMS.map((item) => {
          const Icon = item.icon;
          return (
            <Link key={item.href} href={item.href} className={linkClass(item.href, item.exact)}>
              <Icon size={16} />
              {item.label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
