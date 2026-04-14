'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, ChevronDown, ChevronRight, CheckCircle2, UserPlus, Moon, FileText } from 'lucide-react';

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

  const linkClass = (href: string) => {
    const active = pathname.startsWith(href);
    return `flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-colors ${
      active ? 'bg-white shadow-sm text-gray-900 font-medium' : 'text-gray-600 hover:bg-white/60 hover:text-gray-900'
    }`;
  };

  const sectionButtonClass = (isRoute: boolean) =>
    `w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
      isRoute ? 'text-purple-700 bg-purple-50' : 'text-gray-700 hover:bg-white/60'
    }`;

  return (
    <aside className="w-56 bg-gray-50 border-r border-gray-200 flex flex-col shrink-0">
      <div className="px-4 py-4 border-b border-gray-200">
        <h2 className="text-sm font-bold text-gray-800 tracking-tight">Partner</h2>
      </div>

      <nav className="flex-1 px-3 py-3 space-y-1 overflow-y-auto">
        <Link href="/sales-motion/partner" className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-colors ${
          pathname === '/sales-motion/partner' ? 'bg-white shadow-sm text-gray-900 font-medium' : 'text-gray-600 hover:bg-white/60 hover:text-gray-900'
        }`}>
          <LayoutDashboard size={16} />
          Overview
        </Link>

        {/* Active */}
        <button onClick={() => setActiveOpen(!activeOpen)} className={sectionButtonClass(isActiveRoute)}>
          <CheckCircle2 size={16} />
          <span className="flex-1 text-left">Active</span>
          {activeOpen ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
        </button>
        {activeOpen && (
          <div className="ml-3 pl-3 border-l border-gray-200 space-y-1">
            <Link href="/sales-motion/partner/active" className={linkClass('/sales-motion/partner/active')}>
              <LayoutDashboard size={14} />
              Overview
            </Link>
          </div>
        )}

        {/* Recruit */}
        <button onClick={() => setRecruitOpen(!recruitOpen)} className={sectionButtonClass(isRecruitRoute)}>
          <UserPlus size={16} />
          <span className="flex-1 text-left">Recruit</span>
          {recruitOpen ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
        </button>
        {recruitOpen && (
          <div className="ml-3 pl-3 border-l border-gray-200 space-y-1">
            <Link href="/sales-motion/partner/recruit" className={linkClass('/sales-motion/partner/recruit')}>
              <LayoutDashboard size={14} />
              Overview
            </Link>
          </div>
        )}

        {/* Dormant */}
        <button onClick={() => setDormantOpen(!dormantOpen)} className={sectionButtonClass(isDormantRoute)}>
          <Moon size={16} />
          <span className="flex-1 text-left">Dormant</span>
          {dormantOpen ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
        </button>
        {dormantOpen && (
          <div className="ml-3 pl-3 border-l border-gray-200 space-y-1">
            <Link href="/sales-motion/partner/dormant" className={linkClass('/sales-motion/partner/dormant')}>
              <LayoutDashboard size={14} />
              Overview
            </Link>
          </div>
        )}

        {/* All Content */}
        <button onClick={() => setAllContentOpen(!allContentOpen)} className={sectionButtonClass(isAllContentRoute)}>
          <FileText size={16} />
          <span className="flex-1 text-left">All Content</span>
          {allContentOpen ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
        </button>
        {allContentOpen && (
          <div className="ml-3 pl-3 border-l border-gray-200 space-y-1">
            <Link href="/sales-motion/partner/all-content" className={linkClass('/sales-motion/partner/all-content')}>
              <LayoutDashboard size={14} />
              Overview
            </Link>
          </div>
        )}
      </nav>
    </aside>
  );
}
