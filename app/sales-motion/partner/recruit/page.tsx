'use client';

import { UserPlus } from 'lucide-react';

export default function RecruitPartnersPage() {
  return (
    <div className="flex-1 overflow-y-auto bg-canvas">
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-5 text-center px-6">
        <div className="w-14 h-14 rounded-xl bg-accent-sky/10 border border-accent-sky/30 flex items-center justify-center">
          <UserPlus size={26} className="text-accent-sky" />
        </div>
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.3em] text-accent-sky">FY2026</p>
          <h1 className="mt-2 text-3xl font-bold text-white tracking-tight">Recruit Partners</h1>
          <p className="mt-2 text-sm text-gray-400 max-w-md">
            Prospective partners in the pipeline will appear here.
          </p>
        </div>
      </div>
    </div>
  );
}
