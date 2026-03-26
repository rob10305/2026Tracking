import { STATUS_COLORS, STATUS_OPTIONS } from '@/lib/sales-motion/types';

export function StatusLegend() {
  return (
    <div className="flex items-center gap-4 px-6 py-3 bg-white border-t border-gray-200">
      <span className="text-xs font-medium text-gray-500 uppercase tracking-wider">Status Legend:</span>
      {STATUS_OPTIONS.map((s) => (
        <div key={s} className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: STATUS_COLORS[s] }} />
          <span className="text-xs text-gray-600">{s}</span>
        </div>
      ))}
    </div>
  );
}
