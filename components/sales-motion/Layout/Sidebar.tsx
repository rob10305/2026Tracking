'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { useTracker } from '@/lib/sales-motion/context/TrackerContext';
import { LayoutDashboard, BarChart3 } from 'lucide-react';

const MOTION_LOGOS: Record<string, string> = {
  'Archera': '/logos/archera.png',
};

export function SMSidebar() {
  const { state } = useTracker();
  const pathname = usePathname();

  const linkClass = (href: string, exact = false) => {
    const active = exact ? pathname === href : pathname.startsWith(href);
    return `flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-colors ${
      active ? 'bg-white shadow-sm text-gray-900 font-medium' : 'text-gray-600 hover:bg-white/60 hover:text-gray-900'
    }`;
  };

  return (
    <aside className="w-56 bg-gray-50 border-r border-gray-200 flex flex-col shrink-0">
      <div className="px-4 py-4 border-b border-gray-200">
        <h2 className="text-sm font-bold text-gray-800 tracking-tight">Sales Motions</h2>
      </div>

      <nav className="flex-1 px-3 py-3 space-y-1 overflow-y-auto">
        <Link href="/sales-motion" className={linkClass('/sales-motion', true)}>
          <LayoutDashboard size={16} />
          Dashboard
        </Link>

        <div className="pt-2 pb-1 px-1">
          <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest">Motions</span>
        </div>

        {state.motions.map((m) => (
          <Link key={m.id} href={`/sales-motion/motion/${m.id}`} className={linkClass(`/sales-motion/motion/${m.id}`)}>
            {MOTION_LOGOS[m.name] ? (
              <Image src={MOTION_LOGOS[m.name]} alt={m.name} width={56} height={16} className="object-contain shrink-0" style={{ maxHeight: 16 }} unoptimized />
            ) : (
              <>
                <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: m.color }} />
                {m.name}
              </>
            )}
          </Link>
        ))}

        <div className="pt-2 pb-1 px-1">
          <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest">Reports</span>
        </div>

        <Link href="/sales-motion/monthly-kpis" className={linkClass('/sales-motion/monthly-kpis')}>
          <BarChart3 size={16} />
          Monthly KPIs
        </Link>
      </nav>
    </aside>
  );
}
