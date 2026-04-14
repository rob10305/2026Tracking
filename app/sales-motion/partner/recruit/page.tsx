'use client';

import { UserPlus } from 'lucide-react';

export default function RecruitPartnersPage() {
  return (
    <div className="flex-1 overflow-y-auto bg-gray-50">
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4 text-center">
        <div className="w-14 h-14 rounded-2xl bg-blue-100 flex items-center justify-center">
          <UserPlus size={28} className="text-blue-600" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-800 mb-1">Recruit Partners</h1>
          <p className="text-sm text-gray-500">Prospective partners in the pipeline will appear here.</p>
        </div>
      </div>
    </div>
  );
}
