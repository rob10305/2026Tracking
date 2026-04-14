'use client';

import { MarketingProvider } from '@/lib/sales-motion/marketing/MarketingContext';
import { MarketingSidebar } from '@/components/sales-motion/Layout/MarketingSidebar';

export default function MarketingLayout({ children }: { children: React.ReactNode }) {
  return (
    <MarketingProvider>
      <div className="flex h-full w-full overflow-hidden">
        <MarketingSidebar />
        <div className="flex-1 overflow-hidden flex flex-col">
          {children}
        </div>
      </div>
    </MarketingProvider>
  );
}
