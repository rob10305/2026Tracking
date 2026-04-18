'use client';

import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { usePartner } from '@/lib/sales-motion/partner/PartnerContext';
import type { Partner } from '@/lib/sales-motion/partner/types';
import { EditableField } from '@/components/sales-motion/shared/EditableField';
import { PartnerEditBar } from './PartnerEditBar';
import { usePartnerEditGate } from './usePartnerEditGate';
import {
  ArrowLeft,
  Trash2,
  Hash,
  DollarSign,
  Users,
  Trophy,
  Handshake,
  TrendingUp,
} from 'lucide-react';
import { PartnerHeader } from './sections/PartnerHeader';
import { GtmStrategy } from './sections/GtmStrategy';
import { Leads } from './sections/Leads';
import { ActiveCampaigns } from './sections/ActiveCampaigns';
import { Contacts } from './sections/Contacts';
import { Deliverables } from './sections/Deliverables';
import { Enablement } from './sections/Enablement';
import { ActivityLog } from './sections/ActivityLog';
import { Collateral } from './sections/Collateral';
import { NotesFeed } from './sections/NotesFeed';

export function PartnerDetail({ partnerId }: { partnerId: string }) {
  const router = useRouter();
  const { state, dispatch, isLoading } = usePartner();
  const { unlocked, tryUnlock, lock } = usePartnerEditGate();
  const partner = state.partners.find((p) => p.id === partnerId);
  const readOnly = !unlocked;

  if (isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center bg-canvas">
        <div className="text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-white/10 border-t-accent-violet" />
          <p className="mt-3 text-sm text-gray-400">Loading partner…</p>
        </div>
      </div>
    );
  }

  if (!partner) {
    return (
      <div className="flex-1 flex items-center justify-center bg-canvas">
        <div className="text-center">
          <Handshake size={48} className="text-gray-600 mx-auto mb-3" />
          <h2 className="text-lg font-semibold text-white">Partner not found</h2>
          <p className="text-sm text-gray-400 mb-4">This partner may have been deleted.</p>
          <Link
            href="/sales-motion/partner"
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-accent-violet text-[#050914] text-sm font-semibold rounded-md hover:brightness-110"
          >
            <ArrowLeft size={14} /> Back to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  const updateField = <K extends keyof Partner>(key: K, value: Partner[K]) => {
    dispatch({
      type: 'UPDATE_PARTNER',
      id: partner.id,
      patch: { [key]: value } as Partial<Partner>,
    });
  };

  const handleDelete = () => {
    if (!confirm(`Delete partner "${partner.name}"? This cannot be undone.`)) return;
    dispatch({ type: 'DELETE_PARTNER', id: partner.id });
    router.push('/sales-motion/partner');
  };

  const sectionProps = { partner, updateField, readOnly };

  return (
    <div className="flex-1 overflow-y-auto bg-canvas">
      {/* Top bar: back + edit gate */}
      <div className="px-8 py-3 border-b border-white/5 bg-canvas-raised/40 flex items-center justify-between gap-3 flex-wrap">
        <Link
          href="/sales-motion/partner"
          className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-[0.2em] text-gray-400 hover:text-white transition-colors"
        >
          <ArrowLeft size={14} /> Back to Partner Dashboard
        </Link>
        <div className="flex items-center gap-2 flex-wrap">
          <PartnerEditBar unlocked={unlocked} onUnlock={tryUnlock} onLock={lock} />
          {!readOnly && (
            <button
              onClick={handleDelete}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-accent-rose border border-accent-rose/30 bg-accent-rose/10 rounded-md hover:bg-accent-rose/20 transition-colors"
            >
              <Trash2 size={12} /> Delete Partner
            </button>
          )}
        </div>
      </div>

      {/* Hero + breadcrumb */}
      <PartnerHeader {...sectionProps} />

      <div className="px-8 py-8 max-w-6xl mx-auto space-y-6">
        {/* Baseball card metrics */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          <MetricCard
            icon={Hash}
            label="Pipeline Deals"
            value={partner.pipelineDeals}
            onChange={(v) => updateField('pipelineDeals', v)}
            accent="sky"
            disabled={readOnly}
          />
          <MetricCard
            icon={DollarSign}
            label="Pipeline $"
            value={partner.pipelineValue}
            onChange={(v) => updateField('pipelineValue', v)}
            accent="violet"
            disabled={readOnly}
          />
          <MetricCard
            icon={Users}
            label="Active Contacts"
            value={partner.activeContacts}
            onChange={(v) => updateField('activeContacts', v)}
            accent="emerald"
            disabled={readOnly}
          />
          <MetricCard
            icon={Trophy}
            label="Wins"
            value={partner.wins}
            onChange={(v) => updateField('wins', v)}
            accent="amber"
            disabled={readOnly}
          />
          <MetricCard
            icon={TrendingUp}
            label="Closed $"
            value={partner.closedRevenue}
            onChange={(v) => updateField('closedRevenue', v)}
            accent="emerald"
            disabled={readOnly}
          />
        </div>

        <GtmStrategy {...sectionProps} />
        <Leads {...sectionProps} />
        <ActiveCampaigns {...sectionProps} />
        <Contacts {...sectionProps} />
        <Deliverables {...sectionProps} />
        <Enablement {...sectionProps} />
        <ActivityLog {...sectionProps} />
        <Collateral {...sectionProps} />
        <NotesFeed {...sectionProps} />
      </div>
    </div>
  );
}

type Accent = 'sky' | 'emerald' | 'amber' | 'violet' | 'rose';

const METRIC_ACCENT: Record<Accent, { text: string; border: string; glow: string }> = {
  sky:     { text: 'text-accent-sky',     border: 'border-l-accent-sky',     glow: 'glow-sky' },
  emerald: { text: 'text-accent-emerald', border: 'border-l-accent-emerald', glow: 'glow-emerald' },
  amber:   { text: 'text-accent-amber',   border: 'border-l-accent-amber',   glow: 'glow-amber' },
  violet:  { text: 'text-accent-violet',  border: 'border-l-accent-violet',  glow: 'glow-violet' },
  rose:    { text: 'text-accent-rose',    border: 'border-l-accent-rose',    glow: 'bg-accent-rose/12' },
};

function MetricCard({
  icon: Icon,
  label,
  value,
  onChange,
  accent,
  disabled,
}: {
  icon: typeof Hash;
  label: string;
  value: string;
  onChange: (v: string) => void;
  accent: Accent;
  disabled?: boolean;
}) {
  const a = METRIC_ACCENT[accent];
  return (
    <div
      className={`relative overflow-hidden bg-canvas-raised rounded-xl border border-white/5 ${a.border} border-l-4 p-3`}
    >
      <div
        aria-hidden
        className={`absolute -top-10 -right-10 h-24 w-24 rounded-full ${a.glow} blur-3xl pointer-events-none opacity-70`}
      />
      <div className="relative">
        <div className="flex items-center gap-1.5 mb-1">
          <Icon size={12} className={a.text} />
          <span className="text-[10px] font-semibold text-gray-500 uppercase tracking-[0.2em]">
            {label}
          </span>
        </div>
        <div className={`text-lg font-bold ${a.text}`}>
          <EditableField
            value={value}
            onSave={onChange}
            placeholder="—"
            className={`text-lg font-bold ${a.text}`}
            disabled={disabled}
          />
        </div>
      </div>
    </div>
  );
}
