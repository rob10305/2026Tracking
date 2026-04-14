'use client';

import { Megaphone } from 'lucide-react';

export default function DemandGenPage() {
  return (
    <div className="flex-1 overflow-y-auto bg-gray-50">
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4 text-center">
        <div className="w-14 h-14 rounded-2xl bg-pink-100 flex items-center justify-center">
          <Megaphone size={28} className="text-pink-600" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-800 mb-1">Demand Gen</h1>
          <p className="text-sm text-gray-500">Demand generation campaigns and lead sources will appear here.</p>
        </div>
      </div>
    </div>
  );
}
