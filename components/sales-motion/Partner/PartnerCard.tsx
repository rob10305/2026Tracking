'use client';

import Link from 'next/link';
import Image from 'next/image';
import type { Partner, PartnerStatus } from '@/lib/sales-motion/partner/types';
import { Handshake, Users, DollarSign, Trophy, Hash } from 'lucide-react';

const STATUS_COLORS: Record<PartnerStatus, string> = {
  Active: 'bg-green-100 text-green-700 border-green-200',
  Recruit: 'bg-blue-100 text-blue-700 border-blue-200',
  Dormant: 'bg-gray-100 text-gray-600 border-gray-200',
};

const TIER_COLORS: Record<string, string> = {
  Strategic: 'bg-purple-100 text-purple-700',
  Preferred: 'bg-indigo-100 text-indigo-700',
  Standard: 'bg-slate-100 text-slate-700',
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
      className="group bg-white rounded-2xl border-2 border-gray-200 hover:border-purple-400 hover:shadow-xl transition-all overflow-hidden flex flex-col"
    >
      {/* Header strip with logo and status */}
      <div className="relative bg-gradient-to-br from-purple-50 to-indigo-50 h-32 flex items-center justify-center border-b border-gray-100">
        {hasLogo ? (
          <Image
            src={partner.logo}
            alt={partner.name || 'Partner logo'}
            width={120}
            height={60}
            className="object-contain max-h-16"
            unoptimized
          />
        ) : (
          <div className="w-16 h-16 rounded-full bg-white/80 flex items-center justify-center text-2xl font-bold text-purple-600 border-2 border-purple-200">
            {partner.name ? partner.name[0].toUpperCase() : <Handshake size={28} />}
          </div>
        )}
        <div className="absolute top-2 right-2 flex flex-col gap-1 items-end">
          <span className={`inline-block text-[10px] font-bold uppercase px-2 py-0.5 rounded-full border ${STATUS_COLORS[partner.status]}`}>
            {partner.status}
          </span>
          {partner.tier && (
            <span className={`inline-block text-[9px] font-semibold uppercase px-1.5 py-0.5 rounded ${TIER_COLORS[partner.tier] || 'bg-gray-100 text-gray-600'}`}>
              {partner.tier}
            </span>
          )}
        </div>
      </div>

      {/* Name + owner */}
      <div className="px-4 pt-3 pb-2">
        <h3 className="text-base font-bold text-gray-900 group-hover:text-purple-700 transition-colors truncate">
          {partner.name || 'Unnamed Partner'}
        </h3>
      </div>

      {/* Metrics grid */}
      <div className="px-4 pb-3 grid grid-cols-2 gap-2">
        <Metric icon={Hash} label="Pipeline Deals" value={fmtCompact(partner.pipelineDeals)} color="text-blue-600" bg="bg-blue-50" />
        <Metric icon={DollarSign} label="Pipeline $" value={fmtCompact(partner.pipelineValue)} color="text-indigo-600" bg="bg-indigo-50" />
        <Metric icon={Users} label="Contacts" value={fmtCompact(partner.activeContacts)} color="text-teal-600" bg="bg-teal-50" />
        <Metric icon={Trophy} label="Wins" value={fmtCompact(partner.wins)} color="text-amber-600" bg="bg-amber-50" />
      </div>

      {/* Footer */}
      <div className="px-4 py-2 bg-gray-50 border-t border-gray-100 flex items-center justify-between mt-auto">
        <span className="text-[10px] text-gray-400">
          {partner.lastActivity ? `Last: ${partner.lastActivity}` : 'No activity yet'}
        </span>
        <span className="text-[10px] font-semibold text-purple-600 group-hover:text-purple-700">View →</span>
      </div>
    </Link>
  );
}

function Metric({ icon: Icon, label, value, color, bg }: { icon: typeof Hash; label: string; value: string; color: string; bg: string }) {
  return (
    <div className={`${bg} rounded-lg p-2`}>
      <div className="flex items-center gap-1 mb-0.5">
        <Icon size={10} className={color} />
        <span className="text-[9px] font-semibold text-gray-500 uppercase tracking-wider">{label}</span>
      </div>
      <div className={`text-sm font-bold ${color}`}>{value}</div>
    </div>
  );
}
