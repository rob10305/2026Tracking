'use client';

import Link from 'next/link';
import { formatCurrency, parseCurrency } from '@/lib/sales-motion/utils/currency';
import { Users, TrendingUp, Target, Trophy, ChevronRight } from 'lucide-react';
import { EditableField } from '@/components/sales-motion/shared/EditableField';

interface AggregateMotionCardProps {
  name: string;
  color: string;
  revenueTotal: number;
  leadsTotal: number;
  winsTotal: number;
  repCount: number;
  repNames: string[];
  motionId: string;
  revenueTarget?: string;
  leadsTarget?: string;
  winsTarget?: string;
  onUpdateTarget: (field: 'revenueTarget' | 'leadsTarget' | 'winsTarget', value: string) => void;
}

function StatBox({
  icon,
  label,
  value,
  accent,
  editable,
  onSave,
  placeholder,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  accent: string;
  editable?: boolean;
  onSave?: (v: string) => void;
  placeholder?: string;
}) {
  return (
    <div className={`flex flex-col gap-1 px-5 py-3 rounded-xl border ${accent} min-w-[130px]`}>
      <div className="flex items-center gap-1.5 text-[11px] font-medium opacity-70">
        {icon}
        {label}
      </div>
      {editable && onSave ? (
        <EditableField
          value={value}
          onSave={onSave}
          placeholder={placeholder ?? '—'}
          className="text-xl font-bold"
        />
      ) : (
        <div className="text-xl font-bold">{value}</div>
      )}
    </div>
  );
}

export function AggregateMotionCard({
  name,
  color,
  revenueTotal,
  leadsTotal,
  winsTotal,
  repCount,
  repNames,
  motionId,
  revenueTarget,
  leadsTarget,
  winsTarget,
  onUpdateTarget,
}: AggregateMotionCardProps) {
  const revenueDisplay = revenueTarget
    ? (parseCurrency(revenueTarget) > 0 ? formatCurrency(parseCurrency(revenueTarget)) : revenueTarget)
    : (revenueTotal > 0 ? formatCurrency(revenueTotal) : '');

  const leadsDisplay = leadsTarget ?? (leadsTotal > 0 ? String(leadsTotal) : '');
  const winsDisplay = winsTarget ?? (winsTotal > 0 ? String(winsTotal) : '');

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 relative overflow-hidden hover:shadow-md transition-shadow">
      <div className="absolute top-0 left-0 w-1.5 h-full" style={{ backgroundColor: color }} />

      <div className="ml-4 mr-3 py-4 flex items-center gap-4 flex-wrap">
        {/* Motion name + reps - clicking here navigates */}
        <Link
          href={motionId ? `/sales-motion/motion/${motionId}` : '#'}
          className="min-w-[180px] shrink-0 group"
          onClick={(e) => e.stopPropagation()}
        >
          <h3 className="text-base font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">{name}</h3>
          <p className="text-[11px] text-gray-500 mt-0.5">{repNames.join(', ')}</p>
        </Link>

        {/* Stats - editable, stop propagation so clicks don't navigate */}
        <div className="flex items-center gap-3 flex-wrap" onClick={(e) => e.stopPropagation()}>
          <StatBox
            icon={<Users size={11} />}
            label="Sellers"
            value={String(repCount)}
            accent="border-gray-200 bg-gray-50 text-gray-700"
          />
          <StatBox
            icon={<TrendingUp size={11} />}
            label="Revenue Expected"
            value={revenueDisplay}
            accent="border-green-200 bg-green-50 text-green-800"
            editable
            onSave={(v) => onUpdateTarget('revenueTarget', v)}
            placeholder="$0"
          />
          <StatBox
            icon={<Target size={11} />}
            label="Leads"
            value={leadsDisplay}
            accent="border-blue-200 bg-blue-50 text-blue-800"
            editable
            onSave={(v) => onUpdateTarget('leadsTarget', v)}
            placeholder="0"
          />
          <StatBox
            icon={<Trophy size={11} />}
            label="Wins"
            value={winsDisplay}
            accent="border-amber-200 bg-amber-50 text-amber-800"
            editable
            onSave={(v) => onUpdateTarget('winsTarget', v)}
            placeholder="0"
          />
        </div>

        <Link
          href={motionId ? `/sales-motion/motion/${motionId}` : '#'}
          className="shrink-0 ml-auto"
          onClick={(e) => e.stopPropagation()}
        >
          <ChevronRight size={18} className="text-gray-400" />
        </Link>
      </div>
    </div>
  );
}
