'use client';

import { useState, useRef, useEffect } from 'react';
import { Check } from 'lucide-react';
import type { Status } from '@/lib/sales-motion/types';
import { STATUS_OPTIONS } from '@/lib/sales-motion/types';

const STATUS_CONFIG: Record<Status, { label: string; indicator: React.ReactNode }> = {
  'Not Started': {
    label: 'Not Started',
    indicator: <span className="w-2.5 h-2.5 rounded-full bg-gray-300 shrink-0 inline-block" />,
  },
  'In Progress': {
    label: 'In Progress',
    indicator: <span className="w-2.5 h-2.5 rounded-full bg-green-500 shrink-0 inline-block" />,
  },
  'Complete': {
    label: 'Complete',
    indicator: <Check size={12} className="text-green-600 shrink-0" strokeWidth={3} />,
  },
  'Blocked': {
    label: 'Blocked',
    indicator: <span className="w-2.5 h-2.5 rounded-full bg-red-500 shrink-0 inline-block" />,
  },
  'At Risk': {
    label: 'At Risk',
    indicator: <span className="w-2.5 h-2.5 rounded-full bg-amber-500 shrink-0 inline-block" />,
  },
};

interface StatusSelectProps {
  value: Status;
  onChange: (value: Status) => void;
  disabled?: boolean;
  className?: string;
}

export function StatusSelect({ value, onChange, disabled = false, className = '' }: StatusSelectProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open]);

  const config = STATUS_CONFIG[value] ?? STATUS_CONFIG['Not Started'];

  if (disabled) {
    return (
      <div className={`inline-flex items-center gap-1.5 px-2 py-1 rounded text-xs bg-gray-50 text-gray-600 border border-gray-200 ${className}`}>
        {config.indicator}
        <span>{config.label}</span>
      </div>
    );
  }

  return (
    <div ref={ref} className={`relative inline-block ${className}`}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="inline-flex items-center gap-1.5 px-2 py-1 rounded text-xs bg-white border border-gray-300 hover:border-blue-400 cursor-pointer outline-none focus:border-blue-400 transition-colors"
      >
        {config.indicator}
        <span>{config.label}</span>
        <svg className="w-3 h-3 text-gray-400 ml-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
      </button>
      {open && (
        <div className="absolute z-50 top-full left-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg py-1 min-w-[130px]">
          {STATUS_OPTIONS.map((opt) => {
            const c = STATUS_CONFIG[opt];
            return (
              <button
                key={opt}
                type="button"
                onClick={() => { onChange(opt); setOpen(false); }}
                className={`w-full flex items-center gap-2 px-3 py-1.5 text-xs hover:bg-blue-50 transition-colors text-left ${opt === value ? 'bg-blue-50 font-semibold' : ''}`}
              >
                {c.indicator}
                <span>{c.label}</span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
