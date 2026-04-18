'use client';

import { CheckCircle2 } from 'lucide-react';

export default function ActivePartnersPage() {
  return (
    <div className="flex-1 overflow-y-auto bg-canvas">
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-5 text-center px-6">
        <div className="w-14 h-14 rounded-xl bg-accent-emerald/10 border border-accent-emerald/30 flex items-center justify-center">
          <CheckCircle2 size={26} className="text-accent-emerald" />
        </div>
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.3em] text-accent-emerald">FY2026</p>
          <h1 className="mt-2 text-3xl font-bold text-white tracking-tight">Active Partners</h1>
          <p className="mt-2 text-sm text-gray-400 max-w-md">
            Engaged partners currently delivering results will appear here.
          </p>
        </div>
      </div>
    </div>
  );
}
