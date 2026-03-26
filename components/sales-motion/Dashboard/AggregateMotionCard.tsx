import { formatCurrency } from '@/lib/sales-motion/utils/currency';

interface AggregateMotionCardProps {
  name: string;
  color: string;
  goalTotal: number;
  actualTotal: number;
  repCount: number;
  repNames: string[];
  uniqueRep?: string;
}

export function AggregateMotionCard({ name, color, goalTotal, actualTotal, repCount, repNames, uniqueRep }: AggregateMotionCardProps) {
  const variance = actualTotal - goalTotal;
  const hasValues = goalTotal !== 0 || actualTotal !== 0;

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 relative overflow-hidden">
      <div className="absolute top-0 left-0 w-1.5 h-full" style={{ backgroundColor: color }} />
      <div className="ml-4 mr-3 py-4 flex items-center gap-6">
        <div className="min-w-[200px] shrink-0">
          <h3 className="text-base font-semibold text-gray-900">
            {name}
            {uniqueRep && <span className="text-gray-400 font-normal text-sm ml-1">({uniqueRep})</span>}
          </h3>
          <p className="text-[11px] text-gray-500 mt-0.5">{repCount} rep{repCount !== 1 ? 's' : ''}: {repNames.join(', ')}</p>
        </div>
        <div className="min-w-[160px] shrink-0">
          <span className="text-[11px] text-gray-400 block mb-0.5">Contribution to Revenue Goal</span>
          <span className="text-sm font-semibold text-gray-900">{hasValues ? formatCurrency(goalTotal) : '$0'}</span>
        </div>
        <div className="min-w-[130px] shrink-0">
          <span className="text-[11px] text-gray-400 block mb-0.5">Actual</span>
          <span className="text-sm font-semibold text-gray-900">{hasValues ? formatCurrency(actualTotal) : '$0'}</span>
        </div>
        <div className="min-w-[130px] shrink-0">
          <span className="text-[11px] text-gray-400 block mb-0.5">Variance</span>
          <span className={`text-sm font-semibold ${!hasValues ? 'text-gray-400' : variance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            {!hasValues ? '—' : formatCurrency(variance)}
          </span>
        </div>
        <div className="flex-1" />
      </div>
    </div>
  );
}
