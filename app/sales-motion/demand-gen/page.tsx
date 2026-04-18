'use client';

import { Megaphone } from 'lucide-react';

export default function DemandGenPage() {
  return (
    <div className="flex-1 overflow-y-auto bg-canvas">
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-5 text-center px-6">
        <div className="w-14 h-14 rounded-xl bg-accent-violet/10 border border-accent-violet/30 flex items-center justify-center">
          <Megaphone size={26} className="text-accent-violet" />
        </div>
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.3em] text-accent-violet">FY2026</p>
          <h1 className="mt-2 text-3xl font-bold text-white tracking-tight">Demand Gen</h1>
          <p className="mt-2 text-sm text-gray-400 max-w-md">
            Demand generation campaigns and lead sources will appear here.
          </p>
        </div>
      </div>
    </div>
  );
}
