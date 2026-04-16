'use client';

import { useMemo, useState } from 'react';
import { EditableField } from '@/components/sales-motion/shared/EditableField';
import { SelectDropdown } from '@/components/sales-motion/shared/SelectDropdown';
import { Users, Plus, Trash2, ExternalLink } from 'lucide-react';
import {
  LEAD_STAGE_OPTIONS,
  LEAD_SOURCE_OPTIONS,
  type PartnerLead,
  type LeadStage,
  type LeadSource,
} from '@/lib/sales-motion/partner/types';
import {
  AddButton,
  Pill,
  Section,
  isInThisMonth,
  isInThisQuarter,
  isInThisYear,
  type SectionProps,
} from './_shared';

type StageFilter = LeadStage | 'All';
type SourceFilter = LeadSource | 'All';

const STAGE_FILTERS: StageFilter[] = ['All', ...LEAD_STAGE_OPTIONS];
const SOURCE_FILTERS: SourceFilter[] = ['All', ...LEAD_SOURCE_OPTIONS];

export function Leads({ partner, updateField, readOnly }: SectionProps) {
  const [stage, setStage] = useState<StageFilter>('All');
  const [source, setSource] = useState<SourceFilter>('All');

  const { thisMonth, thisQuarter, ytd } = useMemo(() => {
    let m = 0;
    let q = 0;
    let y = 0;
    for (const lead of partner.leads) {
      if (!lead.date) continue;
      if (isInThisMonth(lead.date)) m += 1;
      if (isInThisQuarter(lead.date)) q += 1;
      if (isInThisYear(lead.date)) y += 1;
    }
    return { thisMonth: m, thisQuarter: q, ytd: y };
  }, [partner.leads]);

  const filtered = useMemo(() => {
    return [...partner.leads]
      .filter((l) => stage === 'All' || l.stage === stage)
      .filter((l) => source === 'All' || l.source === source)
      .sort((a, b) => b.date.localeCompare(a.date));
  }, [partner.leads, stage, source]);

  const updateLead = (id: string, patch: Partial<PartnerLead>) => {
    const leads = partner.leads.map((l) => (l.id === id ? { ...l, ...patch } : l));
    updateField('leads', leads);
  };

  const addLead = () => {
    const leads: PartnerLead[] = [
      ...partner.leads,
      {
        id: crypto.randomUUID(),
        name: '',
        company: '',
        source: '',
        date: new Date().toISOString().slice(0, 10),
        stage: 'New',
        owner: '',
        sfLink: '',
      },
    ];
    updateField('leads', leads);
  };

  const removeLead = (id: string) => {
    updateField('leads', partner.leads.filter((l) => l.id !== id));
  };

  return (
    <Section icon={Users} title={`Leads (${partner.leads.length})`} color="bg-sky-100 text-sky-600">
      {/* Summary counts */}
      <div className="grid grid-cols-3 gap-3">
        <SummaryTile label="This Month" value={thisMonth} bgClass="bg-sky-50" textClass="text-sky-700" />
        <SummaryTile label="This Quarter" value={thisQuarter} bgClass="bg-indigo-50" textClass="text-indigo-700" />
        <SummaryTile label="YTD" value={ytd} bgClass="bg-purple-50" textClass="text-purple-700" />
      </div>

      {/* Stage filter */}
      <div className="pt-2">
        <div className="text-[10px] font-semibold text-gray-500 uppercase tracking-widest mb-1.5">Stage</div>
        <div className="flex items-center gap-1.5 flex-wrap">
          {STAGE_FILTERS.map((s) => (
            <Pill key={s} active={stage === s} onClick={() => setStage(s)}>
              {s}
            </Pill>
          ))}
        </div>
      </div>

      {/* Source filter */}
      <div>
        <div className="text-[10px] font-semibold text-gray-500 uppercase tracking-widest mb-1.5">Source</div>
        <div className="flex items-center gap-1.5 flex-wrap">
          {SOURCE_FILTERS.map((s) => (
            <Pill key={s} active={source === s} onClick={() => setSource(s)}>
              {s}
            </Pill>
          ))}
        </div>
      </div>

      {/* Table */}
      {filtered.length === 0 ? (
        <p className="text-sm text-gray-400 italic">
          {partner.leads.length === 0 ? 'No leads yet.' : 'No leads match the current filters.'}
        </p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left bg-gray-50">
                <th className="px-3 py-2 text-xs font-semibold text-gray-500">Lead Name</th>
                <th className="px-3 py-2 text-xs font-semibold text-gray-500">Company</th>
                <th className="px-3 py-2 text-xs font-semibold text-gray-500 w-[140px]">Source</th>
                <th className="px-3 py-2 text-xs font-semibold text-gray-500 w-[120px]">Date</th>
                <th className="px-3 py-2 text-xs font-semibold text-gray-500 w-[120px]">Stage</th>
                <th className="px-3 py-2 text-xs font-semibold text-gray-500 w-[120px]">Owner</th>
                <th className="px-3 py-2 text-xs font-semibold text-gray-500 w-[80px]">SF</th>
                <th className="px-3 py-2 w-[40px]" />
              </tr>
            </thead>
            <tbody>
              {filtered.map((l) => (
                <tr key={l.id} className="border-t border-gray-100">
                  <td className="px-3 py-2">
                    <EditableField value={l.name} onSave={(v) => updateLead(l.id, { name: v })} placeholder="Lead name" className="text-sm font-medium" disabled={readOnly} />
                  </td>
                  <td className="px-3 py-2">
                    <EditableField value={l.company} onSave={(v) => updateLead(l.id, { company: v })} placeholder="Company" className="text-xs" disabled={readOnly} />
                  </td>
                  <td className="px-3 py-2">
                    <SelectDropdown
                      value={l.source}
                      options={['', ...LEAD_SOURCE_OPTIONS] as (LeadSource | '')[]}
                      onChange={(v) => updateLead(l.id, { source: v })}
                      disabled={readOnly}
                    />
                  </td>
                  <td className="px-3 py-2">
                    {readOnly ? (
                      <span className="text-xs text-gray-600">{l.date || '—'}</span>
                    ) : (
                      <input
                        type="date"
                        value={l.date}
                        onChange={(e) => updateLead(l.id, { date: e.target.value })}
                        className="border border-gray-300 rounded px-1.5 py-0.5 text-xs bg-white"
                      />
                    )}
                  </td>
                  <td className="px-3 py-2">
                    <SelectDropdown
                      value={l.stage}
                      options={['', ...LEAD_STAGE_OPTIONS] as (LeadStage | '')[]}
                      onChange={(v) => updateLead(l.id, { stage: v })}
                      disabled={readOnly}
                    />
                  </td>
                  <td className="px-3 py-2">
                    <EditableField value={l.owner} onSave={(v) => updateLead(l.id, { owner: v })} placeholder="Owner" className="text-xs" disabled={readOnly} />
                  </td>
                  <td className="px-3 py-2">
                    {readOnly ? (
                      l.sfLink ? (
                        <a href={l.sfLink} target="_blank" rel="noopener noreferrer" className="text-xs text-purple-600 hover:underline inline-flex items-center gap-1">
                          Open <ExternalLink size={10} />
                        </a>
                      ) : (
                        <span className="text-xs text-gray-400">—</span>
                      )
                    ) : (
                      <EditableField value={l.sfLink} onSave={(v) => updateLead(l.id, { sfLink: v })} placeholder="SF URL" className="text-xs" disabled={readOnly} />
                    )}
                  </td>
                  <td className="px-3 py-2">
                    {!readOnly && (
                      <button onClick={() => removeLead(l.id)} className="text-gray-300 hover:text-red-500" aria-label="Remove lead">
                        <Trash2 size={14} />
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {!readOnly && (
        <AddButton onClick={addLead}>
          <Plus size={12} /> Add Lead
        </AddButton>
      )}
    </Section>
  );
}

function SummaryTile({
  label,
  value,
  bgClass,
  textClass,
}: {
  label: string;
  value: number;
  bgClass: string;
  textClass: string;
}) {
  return (
    <div className={`rounded-xl p-3 border border-gray-100 ${bgClass}`}>
      <div className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider">{label}</div>
      <div className={`text-2xl font-bold ${textClass}`}>{value}</div>
    </div>
  );
}
