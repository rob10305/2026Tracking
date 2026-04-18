'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { useTracker } from '@/lib/sales-motion/context/TrackerContext';
import { LayoutDashboard, BarChart3, Target, GitBranch, Calendar, Wrench, ChevronDown, ChevronRight, Zap, TrendingUp, Star, Megaphone } from 'lucide-react';

const MOTION_LOGOS: Record<string, string> = {
  'Archera': '/logos/archera.png',
};

export function SMSidebar() {
  const { state } = useTracker();
  const pathname = usePathname();

  const isPipelineRoute = pathname.startsWith('/sales-motion/pipeline');
  const isKeyDealsRoute = pathname.startsWith('/sales-motion/key-deals');
  const isDemandGenRoute = pathname.startsWith('/sales-motion/demand-gen');
  // Sales Motions is only considered "active" on its specific sub-routes, not the base /sales-motion
  const isSalesMotionRoute =
    pathname.startsWith('/sales-motion/dashboard') ||
    pathname.startsWith('/sales-motion/motion/') ||
    pathname.startsWith('/sales-motion/monthly-kpis') ||
    pathname.startsWith('/sales-motion/reports') ||
    pathname.startsWith('/sales-motion/goals') ||
    pathname.startsWith('/sales-motion/development');
  const [salesMotionsOpen, setSalesMotionsOpen] = useState(isSalesMotionRoute);
  const [pipelineOpen, setPipelineOpen] = useState(isPipelineRoute);
  const [keyDealsOpen, setKeyDealsOpen] = useState(isKeyDealsRoute);
  const [demandGenOpen, setDemandGenOpen] = useState(isDemandGenRoute);

  // Leaf link: indented under a section, with subtle left border rail like AOP sidebar
  const linkClass = (href: string, exact = false) => {
    const active = exact ? pathname === href : pathname.startsWith(href);
    return `flex items-center gap-2.5 px-3 py-2 rounded-md text-[13px] transition-colors border-l-2 ${
      active
        ? 'border-l-accent-sky bg-white/5 text-white font-medium'
        : 'border-l-transparent text-gray-400 hover:bg-white/5 hover:text-white'
    }`;
  };

  // Section header button (top-level collapsibles)
  const sectionClass = (active: boolean) =>
    `w-full flex items-center gap-2.5 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
      active
        ? 'bg-white/5 text-white'
        : 'text-gray-300 hover:bg-white/5 hover:text-white'
    }`;

  return (
    <aside className="w-56 bg-canvas-sidebar border-r border-white/5 flex flex-col shrink-0">
      <div className="px-4 py-4 border-b border-white/5">
        <p className="text-[10px] font-semibold uppercase tracking-[0.25em] text-accent-emerald">
          FY2026
        </p>
        <h2 className="mt-1 text-sm font-semibold text-white tracking-tight">Sales</h2>
      </div>

      <nav className="flex-1 px-3 py-3 space-y-1 overflow-y-auto">
        {/* Dashboard link — back to Sales Overview */}
        <Link
          href="/sales-motion"
          className={`flex items-center gap-2.5 px-3 py-2 rounded-md text-sm transition-colors ${
            pathname === '/sales-motion'
              ? 'bg-white/5 text-white font-medium'
              : 'text-gray-300 hover:bg-white/5 hover:text-white'
          }`}
        >
          <LayoutDashboard size={16} />
          Dashboard
        </Link>

        {/* Goals link — annual goals summary */}
        <Link
          href="/sales-motion/goals-overview"
          className={`flex items-center gap-2.5 px-3 py-2 rounded-md text-sm transition-colors ${
            pathname.startsWith('/sales-motion/goals-overview')
              ? 'bg-white/5 text-white font-medium'
              : 'text-gray-300 hover:bg-white/5 hover:text-white'
          }`}
        >
          <Target size={16} />
          Goals
        </Link>

        {/* Pipeline collapsible section */}
        <button
          onClick={() => setPipelineOpen(!pipelineOpen)}
          className={sectionClass(isPipelineRoute)}
        >
          <TrendingUp size={16} className={isPipelineRoute ? 'text-accent-sky' : ''} />
          <span className="flex-1 text-left">Pipeline</span>
          {pipelineOpen ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
        </button>
        {pipelineOpen && (
          <div className="ml-3 pl-3 border-l border-white/5 space-y-1">
            <Link href="/sales-motion/pipeline" className={linkClass('/sales-motion/pipeline')}>
              <LayoutDashboard size={14} />
              Overview
            </Link>
          </div>
        )}

        {/* Sales Motions collapsible section */}
        <button
          onClick={() => setSalesMotionsOpen(!salesMotionsOpen)}
          className={sectionClass(isSalesMotionRoute)}
        >
          <Zap size={16} className={isSalesMotionRoute ? 'text-accent-emerald' : ''} />
          <span className="flex-1 text-left">Sales Motions</span>
          {salesMotionsOpen ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
        </button>

        {salesMotionsOpen && (
          <div className="ml-3 pl-3 border-l border-white/5 space-y-1">
            <Link href="/sales-motion/dashboard" className={linkClass('/sales-motion/dashboard')}>
              <LayoutDashboard size={14} />
              Dashboard
            </Link>

            <div className="pt-2 pb-1 px-1">
              <span className="text-[10px] font-semibold text-gray-500 uppercase tracking-[0.25em]">Motions</span>
            </div>

            {state.motions.map((m) => (
              <Link key={m.id} href={`/sales-motion/motion/${m.id}`} className={linkClass(`/sales-motion/motion/${m.id}`)}>
                <span className="w-2.5 h-2.5 rounded-full shrink-0 ring-1 ring-white/10" style={{ backgroundColor: m.color }} />
                {m.name}
                {MOTION_LOGOS[m.name] && (
                  <Image src={MOTION_LOGOS[m.name]} alt={`${m.name} logo`} width={52} height={14} className="object-contain shrink-0 ml-1 opacity-80" style={{ maxHeight: 14 }} unoptimized />
                )}
              </Link>
            ))}

            <div className="pt-2 pb-1 px-1">
              <span className="text-[10px] font-semibold text-gray-500 uppercase tracking-[0.25em]">Reports</span>
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
              <span className="text-[10px] font-semibold text-gray-500 uppercase tracking-[0.25em]">Working Area</span>
            </div>

            <Link href="/sales-motion/development" className={linkClass('/sales-motion/development')}>
              <Wrench size={14} />
              Motion Development
            </Link>
          </div>
        )}

        {/* Key Deals collapsible section */}
        <button
          onClick={() => setKeyDealsOpen(!keyDealsOpen)}
          className={sectionClass(isKeyDealsRoute)}
        >
          <Star size={16} className={isKeyDealsRoute ? 'text-accent-amber' : ''} />
          <span className="flex-1 text-left">Key Deals</span>
          {keyDealsOpen ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
        </button>
        {keyDealsOpen && (
          <div className="ml-3 pl-3 border-l border-white/5 space-y-1">
            <Link href="/sales-motion/key-deals" className={linkClass('/sales-motion/key-deals')}>
              <LayoutDashboard size={14} />
              Overview
            </Link>
          </div>
        )}

        {/* Demand Gen collapsible section */}
        <button
          onClick={() => setDemandGenOpen(!demandGenOpen)}
          className={sectionClass(isDemandGenRoute)}
        >
          <Megaphone size={16} className={isDemandGenRoute ? 'text-accent-violet' : ''} />
          <span className="flex-1 text-left">Demand Gen</span>
          {demandGenOpen ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
        </button>
        {demandGenOpen && (
          <div className="ml-3 pl-3 border-l border-white/5 space-y-1">
            <Link href="/sales-motion/demand-gen" className={linkClass('/sales-motion/demand-gen')}>
              <LayoutDashboard size={14} />
              Overview
            </Link>
          </div>
        )}
      </nav>

      <div className="px-4 py-3 border-t border-white/5 text-[11px] text-gray-500">
        Sales Motions · FY2026
      </div>
    </aside>
  );
}
