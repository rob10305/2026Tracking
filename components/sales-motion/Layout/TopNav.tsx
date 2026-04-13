'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { TrendingUp, Megaphone, Handshake } from 'lucide-react';

const TABS = [
  { href: '/sales-motion', label: 'Sales', icon: TrendingUp, match: (p: string) => p === '/sales-motion' || (p.startsWith('/sales-motion') && !p.startsWith('/sales-motion/marketing') && !p.startsWith('/sales-motion/partner')) },
  { href: '/sales-motion/marketing', label: 'Marketing', icon: Megaphone, match: (p: string) => p.startsWith('/sales-motion/marketing') },
  { href: '/sales-motion/partner', label: 'Partner', icon: Handshake, match: (p: string) => p.startsWith('/sales-motion/partner') },
];

export function SMTopNav() {
  const pathname = usePathname();

  return (
    <div className="bg-white border-b border-gray-200 px-6 flex items-center gap-1">
      {TABS.map((tab) => {
        const active = tab.match(pathname);
        const Icon = tab.icon;
        return (
          <Link
            key={tab.href}
            href={tab.href}
            className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
              active
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <Icon size={16} />
            {tab.label}
          </Link>
        );
      })}
    </div>
  );
}
