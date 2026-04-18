'use client';

import { useMemo, useState } from 'react';
import { usePartner } from '@/lib/sales-motion/partner/PartnerContext';
import { createNewPartner } from '@/lib/sales-motion/partner/types';
import type { PartnerStatus } from '@/lib/sales-motion/partner/types';
import { PARTNER_STATUS_OPTIONS } from '@/lib/sales-motion/partner/types';
import { PartnerCard } from './PartnerCard';
import { PartnerEditBar } from './PartnerEditBar';
import { usePartnerEditGate } from './usePartnerEditGate';
import { Handshake, Plus, Search } from 'lucide-react';

function parseNum(s: string): number {
  if (!s) return 0;
  const cleaned = s.replace(/[^0-9.\-]/g, '');
  return parseFloat(cleaned) || 0;
}

type Accent = 'sky' | 'emerald' | 'amber' | 'violet';

export function PartnerDashboard() {
  const { state, dispatch, isLoading } = usePartner();
  const { unlocked, tryUnlock, lock } = usePartnerEditGate();
  const [statusFilter, setStatusFilter] = useState<PartnerStatus | 'All'>('All');
  const [query, setQuery] = useState('');

  const filtered = useMemo(() => {
    return state.partners.filter((p) => {
      if (statusFilter !== 'All' && p.status !== statusFilter) return false;
      if (query && !p.name.toLowerCase().includes(query.toLowerCase())) return false;
      return true;
    });
  }, [state.partners, statusFilter, query]);

  const totals = useMemo(() => {
    const pipelineDeals = state.partners.reduce((s, p) => s + parseNum(p.pipelineDeals), 0);
    const pipelineValue = state.partners.reduce((s, p) => s + parseNum(p.pipelineValue), 0);
    const contacts = state.partners.reduce((s, p) => s + parseNum(p.activeContacts), 0);
    const wins = state.partners.reduce((s, p) => s + parseNum(p.wins), 0);
    return { pipelineDeals, pipelineValue, contacts, wins };
  }, [state.partners]);

  const handleAddPartner = () => {
    dispatch({ type: 'ADD_PARTNER', partner: createNewPartner('New Partner') });
  };

  if (isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center bg-canvas">
        <div className="text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-white/10 border-t-accent-violet" />
          <p className="mt-3 text-sm text-gray-400">Loading partners…</p>
        </div>
      </div>
    );
  }

  const statusCounts: Record<PartnerStatus | 'All', number> = {
    All: state.partners.length,
    Active: state.partners.filter((p) => p.status === 'Active').length,
    Recruit: state.partners.filter((p) => p.status === 'Recruit').length,
    Dormant: state.partners.filter((p) => p.status === 'Dormant').length,
  };

  return (
    <div className="flex-1 overflow-y-auto bg-canvas">
      {/* Header */}
      <div className="px-8 py-6 border-b border-white/5 bg-canvas-raised/40 flex items-center gap-4 flex-wrap">
        <div className="w-11 h-11 rounded-xl flex items-center justify-center bg-accent-violet/10 border border-accent-violet/30 text-accent-violet">
          <Handshake size={20} />
        </div>
        <div className="flex-1 min-w-[200px]">
          <p className="text-[11px] font-semibold uppercase tracking-[0.3em] text-accent-violet">
            FY2026
          </p>
          <h1 className="mt-1 text-2xl font-bold text-white tracking-tight">Partner Dashboard</h1>
          <p className="text-sm text-gray-400 mt-0.5">
            Partner summary cards — click any card to view the full record.
          </p>
        </div>
        <PartnerEditBar unlocked={unlocked} onUnlock={tryUnlock} onLock={lock} />
        {unlocked && (
          <button
            onClick={handleAddPartner}
            className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-semibold bg-accent-violet text-[#050914] rounded-md hover:brightness-110 transition"
          >
            <Plus size={14} /> Add Partner
          </button>
        )}
      </div>

      <div className="p-8 space-y-6">
        {/* Summary metrics */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <SummaryBox label="Total Partners" value={state.partners.length.toString()} accent="violet" />
          <SummaryBox label="Pipeline Deals" value={totals.pipelineDeals.toLocaleString()} accent="sky" />
          <SummaryBox label="Pipeline $" value={fmtMoney(totals.pipelineValue)} accent="emerald" />
          <SummaryBox label="Total Wins" value={totals.wins.toLocaleString()} accent="amber" />
        </div>

        {/* Filters */}
        <div className="bg-canvas-raised rounded-xl border border-white/5 p-3 flex items-center gap-2 flex-wrap">
          <span className="text-[10px] font-semibold uppercase tracking-[0.25em] text-gray-500 mr-1">
            Status
          </span>
          {(['All', ...PARTNER_STATUS_OPTIONS] as const).map((s) => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={`px-3 py-1.5 text-xs font-semibold rounded-md border transition-colors ${
                statusFilter === s
                  ? 'bg-accent-violet/15 text-accent-violet border-accent-violet/40'
                  : 'bg-white/[0.02] text-gray-300 border-white/10 hover:bg-white/[0.06] hover:text-white'
              }`}
            >
              {s} <span className="opacity-75">({statusCounts[s]})</span>
            </button>
          ))}
          <div className="h-5 w-px bg-white/10 mx-1" />
          <div className="relative flex-1 min-w-[200px]">
            <Search
              size={14}
              className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-500"
            />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search partners..."
              className="w-full pl-8 pr-3 py-1.5 text-sm bg-canvas border border-white/10 text-white placeholder-gray-500 rounded-md outline-none focus:border-accent-violet/50"
            />
          </div>
        </div>

        {/* Card grid */}
        {filtered.length === 0 ? (
          <div className="bg-canvas-raised rounded-xl border border-dashed border-white/10 p-12 text-center">
            <div className="w-14 h-14 mx-auto rounded-xl bg-accent-violet/10 border border-accent-violet/30 flex items-center justify-center mb-4">
              <Handshake size={26} className="text-accent-violet" />
            </div>
            <h3 className="text-base font-semibold text-white mb-1">
              {state.partners.length === 0 ? 'No partners yet' : 'No partners match this filter'}
            </h3>
            <p className="text-sm text-gray-400 mb-4 max-w-md mx-auto">
              {state.partners.length === 0
                ? 'Add your first partner to start tracking GTM plans, pipeline, and results.'
                : 'Try a different status or clear the search.'}
            </p>
            {state.partners.length === 0 && unlocked && (
              <button
                onClick={handleAddPartner}
                className="inline-flex items-center gap-1.5 px-4 py-2 bg-accent-violet text-[#050914] font-semibold text-sm rounded-md hover:brightness-110"
              >
                <Plus size={14} /> Add Partner
              </button>
            )}
            {state.partners.length === 0 && !unlocked && (
              <p className="text-xs text-gray-500">Unlock editing above to add partners.</p>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filtered.map((p) => (
              <PartnerCard key={p.id} partner={p} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

const ACCENT: Record<Accent, { text: string; border: string; glow: string }> = {
  sky:     { text: 'text-accent-sky',     border: 'border-l-accent-sky',     glow: 'glow-sky' },
  emerald: { text: 'text-accent-emerald', border: 'border-l-accent-emerald', glow: 'glow-emerald' },
  amber:   { text: 'text-accent-amber',   border: 'border-l-accent-amber',   glow: 'glow-amber' },
  violet:  { text: 'text-accent-violet',  border: 'border-l-accent-violet',  glow: 'glow-violet' },
};

function SummaryBox({
  label,
  value,
  accent,
}: {
  label: string;
  value: string;
  accent: Accent;
}) {
  const a = ACCENT[accent];
  return (
    <div className={`relative overflow-hidden bg-canvas-raised rounded-xl border border-white/5 ${a.border} border-l-4 p-4`}>
      <div
        aria-hidden
        className={`absolute -top-10 -right-10 h-28 w-28 rounded-full ${a.glow} blur-3xl pointer-events-none`}
      />
      <div className="relative">
        <div className="text-[10px] font-semibold text-gray-500 uppercase tracking-[0.25em]">
          {label}
        </div>
        <div className={`text-2xl font-bold mt-2 ${a.text}`}>{value}</div>
      </div>
    </div>
  );
}

function fmtMoney(n: number): string {
  if (n === 0) return '$0';
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `$${Math.round(n / 1_000)}K`;
  return `$${Math.round(n).toLocaleString()}`;
}
