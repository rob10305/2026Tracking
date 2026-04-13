'use client';

import { useState } from 'react';
import { ChevronDown, ChevronRight, type LucideIcon } from 'lucide-react';

interface SectionCardProps {
  title: string;
  icon: LucideIcon;
  iconColor: string;
  count: number;
  defaultOpen?: boolean;
  children: React.ReactNode;
}

export function SectionCard({ title, icon: Icon, iconColor, count, defaultOpen = true, children }: SectionCardProps) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center gap-3 px-5 py-3.5 hover:bg-gray-50 transition-colors"
      >
        <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${iconColor}`}>
          <Icon size={16} />
        </div>
        <h3 className="text-sm font-semibold text-gray-800 flex-1 text-left">{title}</h3>
        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-gray-100 text-gray-600">{count}</span>
        {open ? <ChevronDown size={16} className="text-gray-400" /> : <ChevronRight size={16} className="text-gray-400" />}
      </button>
      {open && <div className="border-t border-gray-100">{children}</div>}
    </div>
  );
}
