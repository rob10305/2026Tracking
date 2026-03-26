import { formatCurrency } from '@/lib/sales-motion/utils/currency';
import { Users, TrendingUp, Target, Trophy } from 'lucide-react';

interface AggregateMotionCardProps {
  name: string;
  color: string;
  revenueTotal: number;
  leadsTotal: number;
  winsTotal: number;
  repCount: number;
  repNames: string[];
}

function StatBox({
  icon,
  label,
  value,
  accent,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  accent: string;
}) {
  return (
    <div className={`flex flex-col gap-1 px-5 py-3 rounded-xl border ${accent} min-w-[130px]`}>
      <div className="flex items-center gap-1.5 text-[11px] font-medium opacity-70">
        {icon}
        {label}
      </div>
      <div className="text-xl font-bold">{value}</div>
    </div>
  );
}

export function AggregateMotionCard({ name, color, revenueTotal, leadsTotal, winsTotal, repCount, repNames }: AggregateMotionCardProps) {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 relative overflow-hidden">
      <div className="absolute top-0 left-0 w-1.5 h-full" style={{ backgroundColor: color }} />

      <div className="ml-4 mr-3 py-4 flex items-center gap-4 flex-wrap">
        {/* Motion name + reps */}
        <div className="min-w-[180px] shrink-0">
          <h3 className="text-base font-semibold text-gray-900">{name}</h3>
          <p className="text-[11px] text-gray-500 mt-0.5">{repNames.join(', ')}</p>
        </div>

        {/* Stats */}
        <div className="flex items-center gap-3 flex-wrap">
          <StatBox
            icon={<Users size={11} />}
            label="Sellers"
            value={String(repCount)}
            accent="border-gray-200 bg-gray-50 text-gray-700"
          />
          <StatBox
            icon={<TrendingUp size={11} />}
            label="Revenue Expected"
            value={revenueTotal > 0 ? formatCurrency(revenueTotal) : '$0'}
            accent="border-green-200 bg-green-50 text-green-800"
          />
          <StatBox
            icon={<Target size={11} />}
            label="Leads"
            value={leadsTotal > 0 ? String(leadsTotal) : '0'}
            accent="border-blue-200 bg-blue-50 text-blue-800"
          />
          <StatBox
            icon={<Trophy size={11} />}
            label="Wins"
            value={winsTotal > 0 ? String(winsTotal) : '0'}
            accent="border-amber-200 bg-amber-50 text-amber-800"
          />
        </div>
      </div>
    </div>
  );
}
