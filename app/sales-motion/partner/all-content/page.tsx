'use client';

import { FileText } from 'lucide-react';

export default function AllContentPage() {
  return (
    <div className="flex-1 overflow-y-auto bg-gray-50">
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4 text-center">
        <div className="w-14 h-14 rounded-2xl bg-indigo-100 flex items-center justify-center">
          <FileText size={28} className="text-indigo-600" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-800 mb-1">All Content</h1>
          <p className="text-sm text-gray-500">Consolidated view of all partner content will appear here.</p>
        </div>
      </div>
    </div>
  );
}
