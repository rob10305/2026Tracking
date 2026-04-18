'use client';

import Link from 'next/link';
import Image from 'next/image';
import type { Partner, PartnerStatus } from '@/lib/sales-motion/partner/types';
import { Handshake, Users, DollarSign, Trophy, Hash } from 'lucide-react';

const STATUS_COLORS: Record<PartnerStatus, string> = {
  Active:  'bg-accent-emerald/10 text-accent-emerald border border-accent-emerald/30',
  Recruit: 'bg-accent-sky/10 text-accent-sky border border-accent-sky/30',
  Dormant: 'bg-white/5 text-gray-400 border border-white/10',
};

const TIER_COLORS: Record<string, string> = {
  Strategic: 'bg-accent-violet/10 text-accent-violet border border-accent-violet/30',
  Preferred: 'bg-accent-sky/10 text-accent-sky border border-accent-sky/30',
  Standard:  'bg-white/5 text-gray-300 border border-white/10',
};

// Left-border accent rail reflects partner status
const STATUS_RAIL: Record<PartnerStatus, string> = {
  Active:  'border-l-accent-emerald',
  Recruit: 'border-l-accent-sky',
  Dormant: 'border-l-white/20',
};

function fmtCompact(raw: string): string {
  if (!raw) return '—';
  const cleaned = raw.replace(/[^0-9.\-]/g, '');
  if (!cleaned) return raw;
  const n = parseFloat(cleaned);
  if (isNaN(n)) return raw;
  const hasCurrency = /\$/.test(raw);
  const prefix = hasCurrency ? '$' : '';
  if (Math.abs(n) >= 1_000_000) return `${prefix}${(n / 1_000_000).toFixed(1)}M`;
  if (Math.abs(n) >= 1_000) return `${prefix}${Math.round(n / 1_000)}K`;
  return `${prefix}${n.toLocaleString()}`;
}

export function PartnerCard({ partner }: { partner: Partner }) {
  const hasLogo = partner.logo && partner.logo.trim().length > 0;

  return (
    <Link
      href={`/sales-motion/partner/details/${partner.id}`}
      className={`group relative overflow-hidden bg-canvas-raised rounded-xl border border-white/5 ${STATUS_RAIL[partner.status]} border-l-4 hover:bg-canvas-elevated transition-colors flex flex-col`}
    >
      {/* Decorative corner glow (violet, subtle) */}
      <div
        aria-hidden
        className="absolute -top-12 -right-12 h-32 w-32 rounded-full glow-violet blur-3xl pointer-events-none opacity-70"
      />

      {/* Header strip with logo and status */}
      <div className="relative h-28 flex items-center justify-center border-b border-white/5 bg-white/[0.02]">
        {hasLogo ? (
          <Image
            src={partner.logo}
            alt={partner.name || 'Partner logo'}
            width={120}
            height={60}
            className="object-contain max-h-14 opacity-90"
            unoptimized
          />
        ) : (
          <div className="w-14 h-14 rounded-full bg-accent-violet/10 border border-accent-violet/30 flex items-center justify-center text-xl font-bold text-accent-violet">
            {partner.name ? partner.name[0].toUpperCase() : <Handshake size={24} />}
          </div>
        )}
        <div className="absolute top-2 right-2 flex flex-col gap-1 items-end">
          <span
            className={`inline-block text-[10px] font-bold uppercase tracking-[0.2em] px-2 py-0.5 rounded-full ${STATUS_COLORS[partner.status]}`}
          >
            {partner.status}
          </span>
          {partner.tier && (
            <span
              className={`inline-block text-[9px] font-semibold uppercase tracking-[0.2em] px-1.5 py-0.5 rounded-full ${
                TIER_COLORS[partner.tier] ?? 'bg-white/5 text-gray-400 border border-white/10'
              }`}
            >
              {partner.tier}
            </span>
          )}
        </div>
      </div>

      {/* Name + owner */}
      <div className="relative px-4 pt-3 pb-2">
        <h3 className="text-base font-bold text-white group-hover:text-accent-violet transition-colors truncate">
          {partner.name || 'Unnamed Partner'}
        </h3>
      </div>

      {/* Metrics grid */}
      <div className="relative px-4 pb-3 grid grid-cols-2 gap-2">
        <Metric icon={Hash} label="Pipeline Deals" value={fmtCompact(partner.pipelineDeals)} accent="sky" />
        <Metric icon={DollarSign} label="Pipeline $" value={fmtCompact(partner.pipelineValue)} accent="emerald" />
        <Metric icon={Users} label="Contacts" value={fmtCompact(partner.activeContacts)} accent="violet" />
        <Metric icon={Trophy} label="Wins" value={fmtCompact(partner.wins)} accent="amber" />
      </div>

      {/* Footer */}
      <div className="relative px-4 py-2 bg-white/[0.02] border-t border-white/5 flex items-center justify-between mt-auto">
        <span className="text-[10px] text-gray-500">
          {partner.lastActivity ? `Last: ${partner.lastActivity}` : 'No activity yet'}
        </span>
        <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-accent-violet group-hover:translate-x-0.5 transition-transform">
          View →
        </span>
      </div>
    </Link>
  );
}

type Accent = 'sky' | 'emerald' | 'amber' | 'violet';

const METRIC_ACCENT: Record<Accent, { text: string; border: string }> = {
  sky:     { text: 'text-accent-sky',     border: 'border-accent-sky/20' },
  emerald: { text: 'text-accent-emerald', border: 'border-accent-emerald/20' },
  amber:   { text: 'text-accent-amber',   border: 'border-accent-amber/20' },
  violet:  { text: 'text-accent-violet',  border: 'border-accent-violet/20' },
};

function Metric({
  icon: Icon,
  label,
  value,
  accent,
}: {
  icon: typeof Hash;
  label: string;
  value: string;
  accent: Accent;
}) {
  const a = METRIC_ACCENT[accent];
  return (
    <div className={`bg-white/[0.02] border ${a.border} rounded-md p-2`}>
      <div className="flex items-center gap-1 mb-0.5">
        <Icon size={10} className={a.text} />
        <span className="text-[9px] font-semibold text-gray-500 uppercase tracking-[0.18em]">
          {label}
        </span>
      </div>
      <div className={`text-sm font-bold ${a.text}`}>{value}</div>
    </div>
  );
}
