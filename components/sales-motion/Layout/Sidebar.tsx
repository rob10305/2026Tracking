'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { useTracker } from '@/lib/sales-motion/context/TrackerContext';
import { LayoutDashboard, BarChart3, Target, GitBranch, Calendar, Wrench, ChevronDown, ChevronRight, Zap } from 'lucide-react';

const MOTION_LOGOS: Record<string, string> = {
  'Archera': '/logos/archera.png',
};

export function SMSidebar() {
  const { state } = useTracker();
  const pathname = usePathname();

  const isSalesMotionRoute = pathname.startsWith('/sales-motion') && !pathname.startsWith('/sales-motion/marketing') && !pathname.startsWith('/sales-motion/partner');
  const [salesMotionsOpen, setSalesMotionsOpen] = useState(isSalesMotionRoute);

  const linkClass = (href: string, exact = false) => {
    const active = exact ? pathname === href : pathname.startsWith(href);
    return `flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-colors ${
      active ? 'bg-white shadow-sm text-gray-900 font-medium' : 'text-gray-600 hover:bg-white/60 hover:text-gray-900'
    }`;
  };

  return (
    <aside className="w-56 bg-gray-50 border-r border-gray-200 flex flex-col shrink-0">
      <div className="px-4 py-4 border-b border-gray-200">
        <h2 className="text-sm font-bold text-gray-800 tracking-tight">Sales</h2>
      </div>

      <nav className="flex-1 px-3 py-3 space-y-1 overflow-y-auto">
        {/* Sales Motions collapsible section */}
        <button
          onClick={() => setSalesMotionsOpen(!salesMotionsOpen)}
          className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
            isSalesMotionRoute ? 'text-blue-700 bg-blue-50' : 'text-gray-700 hover:bg-white/60'
          }`}
        >
          <Zap size={16} />
          <span className="flex-1 text-left">Sales Motions</span>
          {salesMotionsOpen ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
        </button>

        {salesMotionsOpen && (
          <div className="ml-3 pl-3 border-l border-gray-200 space-y-1">
            <Link href="/sales-motion" className={linkClass('/sales-motion', true)}>
              <LayoutDashboard size={14} />
              Dashboard
            </Link>

            <div className="pt-2 pb-1 px-1">
              <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest">Motions</span>
            </div>

            {state.motions.map((m) => (
              <Link key={m.id} href={`/sales-motion/motion/${m.id}`} className={linkClass(`/sales-motion/motion/${m.id}`)}>
                <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: m.color }} />
                {m.name}
                {MOTION_LOGOS[m.name] && (
                  <Image src={MOTION_LOGOS[m.name]} alt={`${m.name} logo`} width={52} height={14} className="object-contain shrink-0 ml-1" style={{ maxHeight: 14 }} unoptimized />
                )}
              </Link>
            ))}

            <div className="pt-2 pb-1 px-1">
              <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest">Reports</span>
            </div>

            <Link href="/sales-motion/monthly-kpis" className={linkClass('/sales-motion/monthly-kpis')}>
              <BarChart3 size={14} />
              Monthly KPIs
            </Link>

            <Link href="/sales-motion/reports/dependencies" className={linkClass('/sales-motion/reports/dependencies')}>
              <GitBranch size={14} />
              Dependencies
            </Link>

            <Link href="/sales-motion/reports/upcoming" className={linkClass('/sales-motion/reports/upcoming')}>
              <Calendar size={14} />
              Upcoming
            </Link>

            <Link href="/sales-motion/goals" className={linkClass('/sales-motion/goals')}>
              <Target size={14} />
              Goals
            </Link>

            <div className="pt-2 pb-1 px-1">
              <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest">Working Area</span>
            </div>

            <Link href="/sales-motion/development" className={linkClass('/sales-motion/development')}>
              <Wrench size={14} />
              Motion Development
            </Link>
          </div>
        )}
      </nav>
    </aside>
  );
}
