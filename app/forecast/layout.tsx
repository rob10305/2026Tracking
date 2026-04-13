'use client';

import { ForecastSidebar } from '@/components/forecast/ForecastSidebar';

export default function ForecastLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="-m-4 flex h-[calc(100vh-56px)]">
      <ForecastSidebar />
      <div className="flex-1 overflow-y-auto p-6">
        {children}
      </div>
    </div>
  );
}
