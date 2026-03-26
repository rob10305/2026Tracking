'use client';

import { useState, useRef, useEffect } from 'react';
import { ChevronDown, X } from 'lucide-react';

interface MonthMultiSelectProps {
  selected: string[];
  onToggle: (month: string) => void;
}

const MONTH_LABELS = [
  { key: '01', label: 'Jan' }, { key: '02', label: 'Feb' }, { key: '03', label: 'Mar' },
  { key: '04', label: 'Apr' }, { key: '05', label: 'May' }, { key: '06', label: 'Jun' },
  { key: '07', label: 'Jul' }, { key: '08', label: 'Aug' }, { key: '09', label: 'Sep' },
  { key: '10', label: 'Oct' }, { key: '11', label: 'Nov' }, { key: '12', label: 'Dec' },
];

export function MonthMultiSelect({ selected, onToggle }: MonthMultiSelectProps) {
  const [open, setOpen] = useState(false);
  const [viewYear, setViewYear] = useState(() => {
    if (selected.length > 0) return parseInt(selected[0].split('-')[0]);
    return new Date().getFullYear();
  });
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const formatLabel = (m: string) => {
    const [y, mo] = m.split('-');
    const ml = MONTH_LABELS.find((l) => l.key === mo);
    return `${ml?.label || mo} ${y}`;
  };

  return (
    <div ref={ref} className="relative">
      <div
        onClick={() => setOpen(!open)}
        className="flex items-center gap-1.5 border border-gray-300 rounded-lg px-2 py-1 text-sm bg-white hover:bg-gray-50 min-w-[140px] cursor-pointer"
        role="combobox"
      >
        <div className="flex flex-wrap gap-1 flex-1">
          {selected.length === 0 ? (
            <span className="text-gray-400 text-xs">Select months…</span>
          ) : (
            selected.map((m) => (
              <span key={m} className="inline-flex items-center gap-0.5 bg-blue-100 text-blue-800 rounded px-1.5 py-0.5 text-xs font-medium">
                {formatLabel(m)}
                <button onClick={(e) => { e.stopPropagation(); onToggle(m); }} className="hover:text-blue-600">
                  <X size={10} />
                </button>
              </span>
            ))
          )}
        </div>
        <ChevronDown size={14} className="text-gray-400 shrink-0" />
      </div>

      {open && (
        <div className="absolute top-full mt-1 left-0 z-50 bg-white border border-gray-200 rounded-xl shadow-lg p-3 w-64">
          <div className="flex items-center justify-between mb-2">
            <button onClick={() => setViewYear((y) => y - 1)} className="text-xs text-gray-500 hover:text-gray-700 px-1">‹</button>
            <span className="text-xs font-semibold text-gray-700">{viewYear}</span>
            <button onClick={() => setViewYear((y) => y + 1)} className="text-xs text-gray-500 hover:text-gray-700 px-1">›</button>
          </div>
          <div className="grid grid-cols-4 gap-1">
            {MONTH_LABELS.map(({ key, label }) => {
              const val = `${viewYear}-${key}`;
              const isSel = selected.includes(val);
              return (
                <button
                  key={key}
                  onClick={() => onToggle(val)}
                  className={`text-xs py-1 rounded-lg font-medium transition-colors ${isSel ? 'bg-blue-600 text-white' : 'text-gray-600 hover:bg-gray-100'}`}
                >
                  {label}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
