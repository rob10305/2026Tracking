'use client';

import { Moon } from 'lucide-react';

export default function DormantPartnersPage() {
  return (
    <div className="flex-1 overflow-y-auto bg-canvas">
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-5 text-center px-6">
        <div className="w-14 h-14 rounded-xl bg-accent-amber/10 border border-accent-amber/30 flex items-center justify-center">
          <Moon size={26} className="text-accent-amber" />
        </div>
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.3em] text-accent-amber">FY2026</p>
          <h1 className="mt-2 text-3xl font-bold text-white tracking-tight">Dormant Partners</h1>
          <p className="mt-2 text-sm text-gray-400 max-w-md">
            Inactive or lapsed partners needing re-engagement will appear here.
          </p>
        </div>
      </div>
    </div>
  );
}
