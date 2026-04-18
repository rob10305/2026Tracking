'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  ChevronDown,
  ChevronRight,
  CheckCircle2,
  UserPlus,
  Moon,
  FileText,
} from 'lucide-react';

export function PartnerSidebar() {
  const pathname = usePathname();

  const isActiveRoute = pathname.startsWith('/sales-motion/partner/active');
  const isRecruitRoute = pathname.startsWith('/sales-motion/partner/recruit');
  const isDormantRoute = pathname.startsWith('/sales-motion/partner/dormant');
  const isAllContentRoute = pathname.startsWith('/sales-motion/partner/all-content');

  const [activeOpen, setActiveOpen] = useState(isActiveRoute);
  const [recruitOpen, setRecruitOpen] = useState(isRecruitRoute);
  const [dormantOpen, setDormantOpen] = useState(isDormantRoute);
  const [allContentOpen, setAllContentOpen] = useState(isAllContentRoute);

  // Leaf link (inside a section) — AOP-style left-border rail
  const linkClass = (href: string) => {
    const active = pathname.startsWith(href);
    return `flex items-center gap-2.5 px-3 py-2 rounded-md text-[13px] transition-colors border-l-2 ${
      active
        ? 'border-l-accent-violet bg-white/5 text-white font-medium'
        : 'border-l-transparent text-gray-400 hover:bg-white/5 hover:text-white'
    }`;
  };

  // Top-level collapsible section header
  const sectionButtonClass = (isRoute: boolean) =>
    `w-full flex items-center gap-2.5 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
      isRoute
        ? 'bg-white/5 text-white'
        : 'text-gray-300 hover:bg-white/5 hover:text-white'
    }`;

  return (
    <aside className="w-56 bg-canvas-sidebar border-r border-white/5 flex flex-col shrink-0">
      <div className="px-4 py-4 border-b border-white/5">
        <p className="text-[10px] font-semibold uppercase tracking-[0.25em] text-accent-violet">
          FY2026
        </p>
        <h2 className="mt-1 text-sm font-semibold text-white tracking-tight">Partner</h2>
      </div>

      <nav className="flex-1 px-3 py-3 space-y-1 overflow-y-auto">
        <Link
          href="/sales-motion/partner"
          className={`flex items-center gap-2.5 px-3 py-2 rounded-md text-sm transition-colors ${
            pathname === '/sales-motion/partner' ||
            pathname.startsWith('/sales-motion/partner/details')
              ? 'bg-white/5 text-white font-medium'
              : 'text-gray-300 hover:bg-white/5 hover:text-white'
          }`}
        >
          <LayoutDashboard size={16} />
          Dashboard
        </Link>

        {/* Active */}
        <button onClick={() => setActiveOpen(!activeOpen)} className={sectionButtonClass(isActiveRoute)}>
          <CheckCircle2 size={16} className={isActiveRoute ? 'text-accent-emerald' : ''} />
          <span className="flex-1 text-left">Active</span>
          {activeOpen ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
        </button>
        {activeOpen && (
          <div className="ml-3 pl-3 border-l border-white/5 space-y-1">
            <Link href="/sales-motion/partner/active" className={linkClass('/sales-motion/partner/active')}>
              <LayoutDashboard size={14} />
              Overview
            </Link>
          </div>
        )}

        {/* Recruit */}
        <button onClick={() => setRecruitOpen(!recruitOpen)} className={sectionButtonClass(isRecruitRoute)}>
          <UserPlus size={16} className={isRecruitRoute ? 'text-accent-sky' : ''} />
          <span className="flex-1 text-left">Recruit</span>
          {recruitOpen ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
        </button>
        {recruitOpen && (
          <div className="ml-3 pl-3 border-l border-white/5 space-y-1">
            <Link href="/sales-motion/partner/recruit" className={linkClass('/sales-motion/partner/recruit')}>
              <LayoutDashboard size={14} />
              Overview
            </Link>
          </div>
        )}

        {/* Dormant */}
        <button onClick={() => setDormantOpen(!dormantOpen)} className={sectionButtonClass(isDormantRoute)}>
          <Moon size={16} className={isDormantRoute ? 'text-accent-amber' : ''} />
          <span className="flex-1 text-left">Dormant</span>
          {dormantOpen ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
        </button>
        {dormantOpen && (
          <div className="ml-3 pl-3 border-l border-white/5 space-y-1">
            <Link href="/sales-motion/partner/dormant" className={linkClass('/sales-motion/partner/dormant')}>
              <LayoutDashboard size={14} />
              Overview
            </Link>
          </div>
        )}

        {/* All Content */}
        <button onClick={() => setAllContentOpen(!allContentOpen)} className={sectionButtonClass(isAllContentRoute)}>
          <FileText size={16} className={isAllContentRoute ? 'text-accent-violet' : ''} />
          <span className="flex-1 text-left">All Content</span>
          {allContentOpen ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
        </button>
        {allContentOpen && (
          <div className="ml-3 pl-3 border-l border-white/5 space-y-1">
            <Link href="/sales-motion/partner/all-content" className={linkClass('/sales-motion/partner/all-content')}>
              <LayoutDashboard size={14} />
              Overview
            </Link>
          </div>
        )}
      </nav>

      <div className="px-4 py-3 border-t border-white/5 text-[11px] text-gray-500">
        Partner GTM · FY2026
      </div>
    </aside>
  );
}
