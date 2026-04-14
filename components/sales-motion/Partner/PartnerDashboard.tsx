'use client';

import { useMemo, useState } from 'react';
import { usePartner } from '@/lib/sales-motion/partner/PartnerContext';
import { createNewPartner } from '@/lib/sales-motion/partner/types';
import type { PartnerStatus } from '@/lib/sales-motion/partner/types';
import { PARTNER_STATUS_OPTIONS } from '@/lib/sales-motion/partner/types';
import { PartnerCard } from './PartnerCard';
import { Handshake, Plus, Search } from 'lucide-react';

function parseNum(s: string): number {
  if (!s) return 0;
  const cleaned = s.replace(/[^0-9.\-]/g, '');
  return parseFloat(cleaned) || 0;
}

export function PartnerDashboard() {
  const { state, dispatch, isLoading } = usePartner();
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
      <div className="flex-1 flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-gray-300 border-t-purple-600" />
          <p className="mt-3 text-sm text-gray-500">Loading partners…</p>
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
    <div className="flex-1 overflow-y-auto bg-gray-50">
      {/* Header */}
      <div className="px-6 py-4 border-b border-gray-100 bg-white flex items-center gap-3 flex-wrap">
        <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-purple-100 text-purple-600">
          <Handshake size={20} />
        </div>
        <div className="flex-1">
          <h1 className="text-xl font-bold text-gray-900">Partner Dashboard</h1>
          <p className="text-sm text-gray-500 mt-0.5">Partner summary cards — click any card to view the full record.</p>
        </div>
        <button
          onClick={handleAddPartner}
          className="flex items-center gap-1.5 px-3 py-1.5 text-sm bg-purple-600 text-white rounded-lg hover:bg-purple-700"
        >
          <Plus size={14} /> Add Partner
        </button>
      </div>

      <div className="p-6 space-y-6">
        {/* Summary metrics */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <SummaryBox label="Total Partners" value={state.partners.length.toString()} />
          <SummaryBox label="Pipeline Deals" value={totals.pipelineDeals.toLocaleString()} />
          <SummaryBox label="Pipeline $" value={fmtMoney(totals.pipelineValue)} />
          <SummaryBox label="Total Wins" value={totals.wins.toLocaleString()} />
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl border border-gray-200 p-3 flex items-center gap-2 flex-wrap">
          <span className="text-xs font-medium text-gray-500 mr-1">Status:</span>
          {(['All', ...PARTNER_STATUS_OPTIONS] as const).map((s) => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
                statusFilter === s ? 'bg-purple-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {s} <span className="opacity-75">({statusCounts[s]})</span>
            </button>
          ))}
          <div className="h-5 w-px bg-gray-200 mx-1" />
          <div className="relative flex-1 min-w-[180px]">
            <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search partners..."
              className="w-full pl-8 pr-3 py-1.5 text-sm border border-gray-300 rounded-lg outline-none focus:border-purple-400"
            />
          </div>
        </div>

        {/* Card grid */}
        {filtered.length === 0 ? (
          <div className="bg-white rounded-xl border border-dashed border-gray-300 p-12 text-center">
            <div className="w-14 h-14 mx-auto rounded-2xl bg-purple-100 flex items-center justify-center mb-3">
              <Handshake size={28} className="text-purple-600" />
            </div>
            <h3 className="text-base font-semibold text-gray-800 mb-1">
              {state.partners.length === 0 ? 'No partners yet' : 'No partners match this filter'}
            </h3>
            <p className="text-sm text-gray-500 mb-4">
              {state.partners.length === 0
                ? 'Add your first partner to start tracking GTM plans, pipeline, and results.'
                : 'Try a different status or clear the search.'}
            </p>
            {state.partners.length === 0 && (
              <button
                onClick={handleAddPartner}
                className="inline-flex items-center gap-1.5 px-4 py-2 bg-purple-600 text-white text-sm rounded-lg hover:bg-purple-700"
              >
                <Plus size={14} /> Add Partner
              </button>
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

function SummaryBox({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-4">
      <div className="text-xs font-medium text-gray-500 uppercase tracking-wider">{label}</div>
      <div className="text-2xl font-bold text-gray-900 mt-1">{value}</div>
    </div>
  );
}

function fmtMoney(n: number): string {
  if (n === 0) return '$0';
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `$${Math.round(n / 1_000)}K`;
  return `$${Math.round(n).toLocaleString()}`;
}
