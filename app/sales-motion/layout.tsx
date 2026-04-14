'use client';

import { usePathname } from 'next/navigation';
import { TrackerProvider } from '@/lib/sales-motion/context/TrackerContext';
import { ToastProvider } from '@/components/sales-motion/shared/Toast';
import { SMSidebar } from '@/components/sales-motion/Layout/Sidebar';
import { SMUserSwitcher } from '@/components/sales-motion/Layout/UserSwitcher';
import { PartnerSidebar } from '@/components/sales-motion/Layout/PartnerSidebar';

export default function SalesMotionLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isPartnerSection = pathname.startsWith('/sales-motion/partner');
  const isSalesSection = !pathname.startsWith('/sales-motion/marketing') && !isPartnerSection;

  return (
    <TrackerProvider>
      <ToastProvider>
        <div className="-m-4 flex h-[calc(100vh-56px)]">
          {isSalesSection && <SMSidebar />}
          {isPartnerSection && <PartnerSidebar />}
          <div className="flex-1 overflow-hidden flex flex-col">
            {isSalesSection && <SMUserSwitcher />}
            {children}
          </div>
        </div>
      </ToastProvider>
    </TrackerProvider>
  );
}
