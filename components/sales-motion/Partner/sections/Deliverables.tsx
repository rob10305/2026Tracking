'use client';

import { useMemo, useState } from 'react';
import { EditableField } from '@/components/sales-motion/shared/EditableField';
import { SelectDropdown } from '@/components/sales-motion/shared/SelectDropdown';
import { ClipboardList, Plus, Trash2 } from 'lucide-react';
import {
  DELIVERABLE_STATUS_OPTIONS,
  type DeliverableStatus,
  type PartnerDeliverable,
} from '@/lib/sales-motion/partner/types';
import { AddButton, Pill, Section, type SectionProps } from './_shared';

type Tab = 'Open' | 'All';
const TABS: Tab[] = ['Open', 'All'];

export function Deliverables({ partner, updateField, readOnly }: SectionProps) {
  const [tab, setTab] = useState<Tab>('Open');

  const openCount = useMemo(
    () => partner.deliverables.filter((d) => d.status === 'Open' || d.status === 'In Progress').length,
    [partner.deliverables]
  );

  const visible = useMemo(() => {
    if (tab === 'All') return partner.deliverables;
    return partner.deliverables.filter((d) => d.status !== 'Done');
  }, [partner.deliverables, tab]);

  const updateRow = (id: string, patch: Partial<PartnerDeliverable>) => {
    const deliverables = partner.deliverables.map((d) => (d.id === id ? { ...d, ...patch } : d));
    updateField('deliverables', deliverables);
  };

  const addRow = () => {
    const deliverables: PartnerDeliverable[] = [
      ...partner.deliverables,
      {
        id: crypto.randomUUID(),
        title: '',
        owner: '',
        dueDate: '',
        status: 'Open',
        notes: '',
      },
    ];
    updateField('deliverables', deliverables);
  };

  const removeRow = (id: string) => {
    updateField('deliverables', partner.deliverables.filter((d) => d.id !== id));
  };

  return (
    <Section
      icon={ClipboardList}
      title={`Deliverables (${openCount} open)`}
      color="bg-orange-100 text-orange-600"
    >
      <div className="flex items-center gap-1.5 flex-wrap">
        {TABS.map((t) => (
          <Pill key={t} active={tab === t} onClick={() => setTab(t)}>
            {t}
          </Pill>
        ))}
      </div>

      {visible.length === 0 ? (
        <p className="text-sm text-gray-500 italic">
          {partner.deliverables.length === 0 ? 'No deliverables yet.' : 'No deliverables in this view.'}
        </p>
      ) : (
        <div className="overflow-x-auto rounded-md border border-white/5">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left bg-white/[0.02]">
                <th className="px-3 py-2 text-[10px] font-semibold text-gray-500 uppercase tracking-[0.2em]">Title</th>
                <th className="px-3 py-2 text-[10px] font-semibold text-gray-500 uppercase tracking-[0.2em] w-[120px]">Owner</th>
                <th className="px-3 py-2 text-[10px] font-semibold text-gray-500 uppercase tracking-[0.2em] w-[120px]">Due</th>
                <th className="px-3 py-2 text-[10px] font-semibold text-gray-500 uppercase tracking-[0.2em] w-[130px]">Status</th>
                <th className="px-3 py-2 text-[10px] font-semibold text-gray-500 uppercase tracking-[0.2em]">Notes</th>
                <th className="px-3 py-2 w-[40px]" />
              </tr>
            </thead>
            <tbody>
              {visible.map((d) => (
                <tr key={d.id} className="border-t border-white/5 hover:bg-white/[0.02] align-top">
                  <td className="px-3 py-2">
                    <EditableField value={d.title} onSave={(v) => updateRow(d.id, { title: v })} placeholder="Deliverable title" className="text-sm font-medium text-white" disabled={readOnly} />
                  </td>
                  <td className="px-3 py-2">
                    <EditableField value={d.owner} onSave={(v) => updateRow(d.id, { owner: v })} placeholder="Owner" className="text-xs text-gray-300" disabled={readOnly} />
                  </td>
                  <td className="px-3 py-2">
                    {readOnly ? (
                      <span className="text-xs text-gray-300">{d.dueDate || '—'}</span>
                    ) : (
                      <input
                        type="date"
                        value={d.dueDate}
                        onChange={(e) => updateRow(d.id, { dueDate: e.target.value })}
                        className="border border-white/10 bg-canvas text-gray-200 rounded px-2 py-1 text-xs focus:outline-none focus:border-accent-sky/50 [color-scheme:dark]"
                      />
                    )}
                  </td>
                  <td className="px-3 py-2">
                    <SelectDropdown
                      value={d.status}
                      options={DELIVERABLE_STATUS_OPTIONS as DeliverableStatus[]}
                      onChange={(v) => updateRow(d.id, { status: v as DeliverableStatus })}
                      disabled={readOnly}
                    />
                  </td>
                  <td className="px-3 py-2">
                    <EditableField value={d.notes} onSave={(v) => updateRow(d.id, { notes: v })} placeholder="Notes" className="text-xs text-gray-300" multiline disabled={readOnly} />
                  </td>
                  <td className="px-3 py-2">
                    {!readOnly && (
                      <button onClick={() => removeRow(d.id)} className="text-gray-500 hover:text-accent-rose transition-colors" aria-label="Remove deliverable">
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
        <AddButton onClick={addRow}>
          <Plus size={12} /> Add Deliverable
        </AddButton>
      )}
    </Section>
  );
}
