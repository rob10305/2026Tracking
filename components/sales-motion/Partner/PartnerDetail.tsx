'use client';

import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { usePartner } from '@/lib/sales-motion/partner/PartnerContext';
import { PARTNER_STATUS_OPTIONS, PARTNER_TIER_OPTIONS } from '@/lib/sales-motion/partner/types';
import type { Partner, PartnerStatus, PartnerTier } from '@/lib/sales-motion/partner/types';
import { EditableField } from '@/components/sales-motion/shared/EditableField';
import { SelectDropdown } from '@/components/sales-motion/shared/SelectDropdown';
import {
  ArrowLeft, Trash2, ExternalLink, Hash, DollarSign, Users, Trophy, Handshake,
  Target, TrendingUp, FileText, Calendar, Plus,
} from 'lucide-react';

const STATUS_COLORS: Record<PartnerStatus, string> = {
  Active: 'bg-green-100 text-green-700 border-green-200',
  Recruit: 'bg-blue-100 text-blue-700 border-blue-200',
  Dormant: 'bg-gray-100 text-gray-600 border-gray-200',
};

export function PartnerDetail({ partnerId }: { partnerId: string }) {
  const router = useRouter();
  const { state, dispatch, isLoading } = usePartner();
  const partner = state.partners.find((p) => p.id === partnerId);

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
          <Link href="/sales-motion/partner/dashboard" className="inline-flex items-center gap-1.5 px-4 py-2 bg-purple-600 text-white text-sm rounded-lg hover:bg-purple-700">
            <ArrowLeft size={14} /> Back to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  const updateField = <K extends keyof Partner>(key: K, value: Partner[K]) => {
    dispatch({ type: 'UPDATE_PARTNER', id: partner.id, patch: { [key]: value } as Partial<Partner> });
  };

  const updateNested = <K extends 'gtmPlan' | 'impact'>(key: K, field: string, value: string) => {
    const current = partner[key];
    dispatch({ type: 'UPDATE_PARTNER', id: partner.id, patch: { [key]: { ...current, [field]: value } } as Partial<Partner> });
  };

  const handleDelete = () => {
    if (!confirm(`Delete partner "${partner.name}"? This cannot be undone.`)) return;
    dispatch({ type: 'DELETE_PARTNER', id: partner.id });
    router.push('/sales-motion/partner/dashboard');
  };

  const addContact = () => {
    const contacts = [...partner.contacts, { id: crypto.randomUUID(), name: '', role: '', email: '', phone: '', active: true, notes: '' }];
    updateField('contacts', contacts);
  };

  const updateContact = (cid: string, field: string, value: string | boolean) => {
    const contacts = partner.contacts.map((c) => (c.id === cid ? { ...c, [field]: value } : c));
    updateField('contacts', contacts);
  };

  const removeContact = (cid: string) => {
    updateField('contacts', partner.contacts.filter((c) => c.id !== cid));
  };

  const addActivity = () => {
    const activities = [...partner.activities, { id: crypto.randomUUID(), date: new Date().toISOString().slice(0, 10), type: '', summary: '', owner: '' }];
    updateField('activities', activities);
  };

  const updateActivity = (aid: string, field: string, value: string) => {
    const activities = partner.activities.map((a) => (a.id === aid ? { ...a, [field]: value } : a));
    updateField('activities', activities);
  };

  const removeActivity = (aid: string) => {
    updateField('activities', partner.activities.filter((a) => a.id !== aid));
  };

  return (
    <div className="flex-1 overflow-y-auto bg-gray-50">
      {/* Back link */}
      <div className="px-6 py-3 border-b border-gray-100 bg-white flex items-center justify-between">
        <Link href="/sales-motion/partner/dashboard" className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700">
          <ArrowLeft size={14} /> Back to Partner Dashboard
        </Link>
        <button onClick={handleDelete} className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs text-red-600 border border-red-200 rounded-lg hover:bg-red-50">
          <Trash2 size={12} /> Delete Partner
        </button>
      </div>

      {/* Hero */}
      <div className="bg-gradient-to-br from-purple-50 via-indigo-50 to-white border-b border-gray-100">
        <div className="px-6 py-6 max-w-6xl mx-auto">
          <div className="flex items-start gap-5 flex-wrap">
            <div className="w-28 h-28 bg-white rounded-2xl border-2 border-purple-200 flex items-center justify-center shrink-0 overflow-hidden">
              {partner.logo ? (
                <Image src={partner.logo} alt={partner.name} width={112} height={112} className="object-contain p-2" unoptimized />
              ) : (
                <Handshake size={40} className="text-purple-400" />
              )}
            </div>
            <div className="flex-1 min-w-[260px]">
              <EditableField
                value={partner.name}
                onSave={(v) => updateField('name', v)}
                placeholder="Partner name"
                className="text-2xl font-bold text-gray-900"
              />
              <div className="flex items-center gap-2 mt-2 flex-wrap">
                <SelectDropdown
                  value={partner.status}
                  options={PARTNER_STATUS_OPTIONS as unknown as PartnerStatus[]}
                  onChange={(v) => updateField('status', v)}
                  className={`${STATUS_COLORS[partner.status]} text-[11px] font-semibold uppercase`}
                />
                <SelectDropdown
                  value={partner.tier}
                  options={PARTNER_TIER_OPTIONS as unknown as PartnerTier[]}
                  onChange={(v) => updateField('tier', v)}
                />
                <span className="text-xs text-gray-500">•</span>
                <span className="text-xs text-gray-500">Owner:</span>
                <EditableField value={partner.owner} onSave={(v) => updateField('owner', v)} placeholder="Set owner" className="text-xs font-medium text-gray-700" />
              </div>
              <div className="mt-3">
                <EditableField
                  value={partner.description}
                  onSave={(v) => updateField('description', v)}
                  placeholder="Short description of the partner…"
                  className="text-sm text-gray-600"
                  multiline
                />
              </div>
              <div className="mt-3 flex items-center gap-3 flex-wrap text-xs">
                <span className="text-gray-500">Website:</span>
                {partner.website ? (
                  <a href={partner.website} target="_blank" rel="noopener noreferrer" className="text-purple-600 hover:underline inline-flex items-center gap-1">
                    {partner.website} <ExternalLink size={10} />
                  </a>
                ) : (
                  <EditableField value={partner.website} onSave={(v) => updateField('website', v)} placeholder="https://…" className="text-xs text-gray-600" />
                )}
                <span className="text-gray-500 ml-2">Logo URL:</span>
                <EditableField value={partner.logo} onSave={(v) => updateField('logo', v)} placeholder="URL…" className="text-xs text-gray-600" />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="px-6 py-6 max-w-6xl mx-auto space-y-6">
        {/* Baseball card metrics */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          <MetricCard icon={Hash} label="Pipeline Deals" value={partner.pipelineDeals} onChange={(v) => updateField('pipelineDeals', v)} color="blue" />
          <MetricCard icon={DollarSign} label="Pipeline $" value={partner.pipelineValue} onChange={(v) => updateField('pipelineValue', v)} color="indigo" />
          <MetricCard icon={Users} label="Active Contacts" value={partner.activeContacts} onChange={(v) => updateField('activeContacts', v)} color="teal" />
          <MetricCard icon={Trophy} label="Wins" value={partner.wins} onChange={(v) => updateField('wins', v)} color="amber" />
          <MetricCard icon={TrendingUp} label="Closed $" value={partner.closedRevenue} onChange={(v) => updateField('closedRevenue', v)} color="green" />
        </div>

        {/* GTM Plan */}
        <Section icon={Target} title="GTM Plan" color="bg-indigo-100 text-indigo-600">
          <GTMField label="Summary" value={partner.gtmPlan.summary} onSave={(v) => updateNested('gtmPlan', 'summary', v)} />
          <GTMField label="Target Accounts / Segments" value={partner.gtmPlan.targets} onSave={(v) => updateNested('gtmPlan', 'targets', v)} />
          <GTMField label="Joint Offerings" value={partner.gtmPlan.jointOfferings} onSave={(v) => updateNested('gtmPlan', 'jointOfferings', v)} />
          <GTMField label="Marketing Initiatives" value={partner.gtmPlan.marketingInitiatives} onSave={(v) => updateNested('gtmPlan', 'marketingInitiatives', v)} />
          <GTMField label="Key Milestones" value={partner.gtmPlan.keyMilestones} onSave={(v) => updateNested('gtmPlan', 'keyMilestones', v)} />
        </Section>

        {/* Impact & Results */}
        <Section icon={TrendingUp} title="Impact & Results" color="bg-emerald-100 text-emerald-600">
          <GTMField label="Deals Influenced" value={partner.impact.dealsInfluenced} onSave={(v) => updateNested('impact', 'dealsInfluenced', v)} />
          <GTMField label="Revenue Sourced" value={partner.impact.revenueSourced} onSave={(v) => updateNested('impact', 'revenueSourced', v)} />
          <GTMField label="Marketing Contribution" value={partner.impact.marketingContribution} onSave={(v) => updateNested('impact', 'marketingContribution', v)} />
          <GTMField label="Notable Wins" value={partner.impact.notableWins} onSave={(v) => updateNested('impact', 'notableWins', v)} />
        </Section>

        {/* Contacts */}
        <Section icon={Users} title={`Contacts (${partner.contacts.length})`} color="bg-teal-100 text-teal-600">
          {partner.contacts.length === 0 ? (
            <p className="text-sm text-gray-400 italic px-1">No contacts yet.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left bg-gray-50">
                    <th className="px-3 py-2 text-xs font-semibold text-gray-500">Name</th>
                    <th className="px-3 py-2 text-xs font-semibold text-gray-500">Role</th>
                    <th className="px-3 py-2 text-xs font-semibold text-gray-500">Email</th>
                    <th className="px-3 py-2 text-xs font-semibold text-gray-500">Phone</th>
                    <th className="px-3 py-2 text-xs font-semibold text-gray-500">Notes</th>
                    <th className="px-3 py-2 w-[40px]" />
                  </tr>
                </thead>
                <tbody>
                  {partner.contacts.map((c) => (
                    <tr key={c.id} className="border-t border-gray-100">
                      <td className="px-3 py-2"><EditableField value={c.name} onSave={(v) => updateContact(c.id, 'name', v)} placeholder="Name" className="text-sm font-medium" /></td>
                      <td className="px-3 py-2"><EditableField value={c.role} onSave={(v) => updateContact(c.id, 'role', v)} placeholder="Role" className="text-xs" /></td>
                      <td className="px-3 py-2"><EditableField value={c.email} onSave={(v) => updateContact(c.id, 'email', v)} placeholder="email@…" className="text-xs" /></td>
                      <td className="px-3 py-2"><EditableField value={c.phone} onSave={(v) => updateContact(c.id, 'phone', v)} placeholder="Phone" className="text-xs" /></td>
                      <td className="px-3 py-2"><EditableField value={c.notes} onSave={(v) => updateContact(c.id, 'notes', v)} placeholder="Notes" className="text-xs" /></td>
                      <td className="px-3 py-2"><button onClick={() => removeContact(c.id)} className="text-gray-300 hover:text-red-500"><Trash2 size={14} /></button></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          <button onClick={addContact} className="mt-2 inline-flex items-center gap-1.5 text-xs text-gray-500 hover:text-purple-600">
            <Plus size={12} /> Add Contact
          </button>
        </Section>

        {/* Activity Log */}
        <Section icon={Calendar} title={`Activity Log (${partner.activities.length})`} color="bg-amber-100 text-amber-600">
          {partner.activities.length === 0 ? (
            <p className="text-sm text-gray-400 italic px-1">No activities logged yet.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left bg-gray-50">
                    <th className="px-3 py-2 text-xs font-semibold text-gray-500 w-[120px]">Date</th>
                    <th className="px-3 py-2 text-xs font-semibold text-gray-500 w-[100px]">Type</th>
                    <th className="px-3 py-2 text-xs font-semibold text-gray-500 w-[100px]">Owner</th>
                    <th className="px-3 py-2 text-xs font-semibold text-gray-500">Summary</th>
                    <th className="px-3 py-2 w-[40px]" />
                  </tr>
                </thead>
                <tbody>
                  {[...partner.activities].sort((a, b) => b.date.localeCompare(a.date)).map((a) => (
                    <tr key={a.id} className="border-t border-gray-100">
                      <td className="px-3 py-2">
                        <input type="date" value={a.date} onChange={(e) => updateActivity(a.id, 'date', e.target.value)} className="border border-gray-300 rounded px-1.5 py-0.5 text-xs bg-white" />
                      </td>
                      <td className="px-3 py-2"><EditableField value={a.type} onSave={(v) => updateActivity(a.id, 'type', v)} placeholder="Call, Meeting…" className="text-xs" /></td>
                      <td className="px-3 py-2"><EditableField value={a.owner} onSave={(v) => updateActivity(a.id, 'owner', v)} placeholder="Owner" className="text-xs" /></td>
                      <td className="px-3 py-2"><EditableField value={a.summary} onSave={(v) => updateActivity(a.id, 'summary', v)} placeholder="Summary…" className="text-xs" multiline /></td>
                      <td className="px-3 py-2"><button onClick={() => removeActivity(a.id)} className="text-gray-300 hover:text-red-500"><Trash2 size={14} /></button></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          <button onClick={addActivity} className="mt-2 inline-flex items-center gap-1.5 text-xs text-gray-500 hover:text-purple-600">
            <Plus size={12} /> Log Activity
          </button>
        </Section>

        {/* Notes */}
        <Section icon={FileText} title="Notes" color="bg-gray-100 text-gray-600">
          <EditableField
            value={partner.notes}
            onSave={(v) => updateField('notes', v)}
            placeholder="Free-form notes about this partner…"
            className="text-sm text-gray-700 block w-full whitespace-pre-wrap break-words"
            multiline
          />
        </Section>
      </div>
    </div>
  );
}

function MetricCard({
  icon: Icon, label, value, onChange, color,
}: { icon: typeof Hash; label: string; value: string; onChange: (v: string) => void; color: 'blue' | 'indigo' | 'teal' | 'amber' | 'green' }) {
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
        <EditableField value={value} onSave={onChange} placeholder="—" className={`text-lg font-bold ${c.text}`} />
      </div>
    </div>
  );
}

function Section({ icon: Icon, title, color, children }: { icon: typeof Target; title: string; color: string; children: React.ReactNode }) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
      <div className="px-5 py-3 border-b border-gray-100 flex items-center gap-2.5">
        <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${color}`}>
          <Icon size={15} />
        </div>
        <h2 className="text-sm font-semibold text-gray-800">{title}</h2>
      </div>
      <div className="p-4 space-y-3">{children}</div>
    </div>
  );
}

function GTMField({ label, value, onSave }: { label: string; value: string; onSave: (v: string) => void }) {
  return (
    <div>
      <div className="text-[10px] font-semibold text-gray-500 uppercase tracking-widest mb-1">{label}</div>
      <EditableField
        value={value}
        onSave={onSave}
        placeholder={`Add ${label.toLowerCase()}…`}
        className="text-sm text-gray-700 block w-full whitespace-pre-wrap break-words"
        multiline
      />
    </div>
  );
}
