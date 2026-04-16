'use client';

import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { usePartner } from '@/lib/sales-motion/partner/PartnerContext';
import type { Partner } from '@/lib/sales-motion/partner/types';
import { EditableField } from '@/components/sales-motion/shared/EditableField';
import { PartnerEditBar } from './PartnerEditBar';
import { usePartnerEditGate } from './usePartnerEditGate';
import { ArrowLeft, Trash2, Hash, DollarSign, Users, Trophy, Handshake, TrendingUp } from 'lucide-react';
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
      <div className="flex-1 flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-gray-300 border-t-purple-600" />
          <p className="mt-3 text-sm text-gray-500">Loading partner…</p>
        </div>
      </div>
    );
  }

  if (!partner) {
    return (
      <div className="flex-1 flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <Handshake size={48} className="text-gray-300 mx-auto mb-3" />
          <h2 className="text-lg font-semibold text-gray-700">Partner not found</h2>
          <p className="text-sm text-gray-500 mb-4">This partner may have been deleted.</p>
          <Link href="/sales-motion/partner" className="inline-flex items-center gap-1.5 px-4 py-2 bg-purple-600 text-white text-sm rounded-lg hover:bg-purple-700">
            <ArrowLeft size={14} /> Back to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  const updateField = <K extends keyof Partner>(key: K, value: Partner[K]) => {
    dispatch({ type: 'UPDATE_PARTNER', id: partner.id, patch: { [key]: value } as Partial<Partner> });
  };

  const handleDelete = () => {
    if (!confirm(`Delete partner "${partner.name}"? This cannot be undone.`)) return;
    dispatch({ type: 'DELETE_PARTNER', id: partner.id });
    router.push('/sales-motion/partner');
  };

  const sectionProps = { partner, updateField, readOnly };

  return (
    <div className="flex-1 overflow-y-auto bg-gray-50">
      {/* Top bar: back + edit gate */}
      <div className="px-6 py-3 border-b border-gray-100 bg-white flex items-center justify-between gap-3 flex-wrap">
        <Link href="/sales-motion/partner" className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700">
          <ArrowLeft size={14} /> Back to Partner Dashboard
        </Link>
        <div className="flex items-center gap-2 flex-wrap">
          <PartnerEditBar unlocked={unlocked} onUnlock={tryUnlock} onLock={lock} />
          {!readOnly && (
            <button onClick={handleDelete} className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs text-red-600 border border-red-200 rounded-lg hover:bg-red-50">
              <Trash2 size={12} /> Delete Partner
            </button>
          )}
        </div>
      </div>

      {/* Hero + breadcrumb */}
      <PartnerHeader {...sectionProps} />

      <div className="px-6 py-6 max-w-6xl mx-auto space-y-6">
        {/* Baseball card metrics */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          <MetricCard icon={Hash} label="Pipeline Deals" value={partner.pipelineDeals} onChange={(v) => updateField('pipelineDeals', v)} color="blue" disabled={readOnly} />
          <MetricCard icon={DollarSign} label="Pipeline $" value={partner.pipelineValue} onChange={(v) => updateField('pipelineValue', v)} color="indigo" disabled={readOnly} />
          <MetricCard icon={Users} label="Active Contacts" value={partner.activeContacts} onChange={(v) => updateField('activeContacts', v)} color="teal" disabled={readOnly} />
          <MetricCard icon={Trophy} label="Wins" value={partner.wins} onChange={(v) => updateField('wins', v)} color="amber" disabled={readOnly} />
          <MetricCard icon={TrendingUp} label="Closed $" value={partner.closedRevenue} onChange={(v) => updateField('closedRevenue', v)} color="green" disabled={readOnly} />
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

function MetricCard({
  icon: Icon,
  label,
  value,
  onChange,
  color,
  disabled,
}: {
  icon: typeof Hash;
  label: string;
  value: string;
  onChange: (v: string) => void;
  color: 'blue' | 'indigo' | 'teal' | 'amber' | 'green';
  disabled?: boolean;
}) {
  const colorMap = {
    blue: { bg: 'bg-blue-50', text: 'text-blue-700', icon: 'text-blue-600' },
    indigo: { bg: 'bg-indigo-50', text: 'text-indigo-700', icon: 'text-indigo-600' },
    teal: { bg: 'bg-teal-50', text: 'text-teal-700', icon: 'text-teal-600' },
    amber: { bg: 'bg-amber-50', text: 'text-amber-700', icon: 'text-amber-600' },
    green: { bg: 'bg-green-50', text: 'text-green-700', icon: 'text-green-600' },
  };
  const c = colorMap[color];
  return (
    <div className={`${c.bg} rounded-xl p-3 border border-gray-100`}>
      <div className="flex items-center gap-1.5 mb-1">
        <Icon size={12} className={c.icon} />
        <span className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider">{label}</span>
      </div>
      <div className={`text-lg font-bold ${c.text}`}>
        <EditableField value={value} onSave={onChange} placeholder="—" className={`text-lg font-bold ${c.text}`} disabled={disabled} />
      </div>
    </div>
  );
}
