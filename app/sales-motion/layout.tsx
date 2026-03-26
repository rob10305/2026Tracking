'use client';

import { TrackerProvider } from '@/lib/sales-motion/context/TrackerContext';
import { ToastProvider } from '@/components/sales-motion/shared/Toast';
import { SMSidebar } from '@/components/sales-motion/Layout/Sidebar';
import { SMUserSwitcher } from '@/components/sales-motion/Layout/UserSwitcher';

export default function SalesMotionLayout({ children }: { children: React.ReactNode }) {
  return (
    <TrackerProvider>
      <ToastProvider>
        <div className="-m-4 flex h-[calc(100vh-56px)]">
          <SMSidebar />
          <div className="flex-1 overflow-hidden flex flex-col">
            <SMUserSwitcher />
            {children}
          </div>
        </div>
      </ToastProvider>
    </TrackerProvider>
  );
}
