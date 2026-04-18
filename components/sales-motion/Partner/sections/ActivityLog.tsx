'use client';

import { EditableField } from '@/components/sales-motion/shared/EditableField';
import { SelectDropdown } from '@/components/sales-motion/shared/SelectDropdown';
import { Calendar, Plus, Trash2 } from 'lucide-react';
import {
  ACTIVITY_TYPE_OPTIONS,
  type ActivityType,
  type PartnerActivity,
} from '@/lib/sales-motion/partner/types';
import { Section, type SectionProps } from './_shared';

export function ActivityLog({ partner, updateField, readOnly }: SectionProps) {
  const updateRow = (id: string, patch: Partial<PartnerActivity>) => {
    const activities = partner.activities.map((a) => (a.id === id ? { ...a, ...patch } : a));
    updateField('activities', activities);
  };

  const addWithType = (type: ActivityType) => {
    const activities: PartnerActivity[] = [
      ...partner.activities,
      {
        id: crypto.randomUUID(),
        date: new Date().toISOString().slice(0, 10),
        type,
        summary: '',
        owner: '',
      },
    ];
    updateField('activities', activities);
  };

  const removeRow = (id: string) => {
    updateField('activities', partner.activities.filter((a) => a.id !== id));
  };

  const sorted = [...partner.activities].sort((a, b) => b.date.localeCompare(a.date));

  return (
    <Section
      icon={Calendar}
      title={`Activity Log (${partner.activities.length})`}
      color="bg-amber-100 text-amber-600"
    >
      {!readOnly && (
        <div>
          <div className="text-[10px] font-semibold text-gray-500 uppercase tracking-[0.25em] mb-1.5">
            Log new activity
          </div>
          <div className="flex items-center gap-1.5 flex-wrap">
            {ACTIVITY_TYPE_OPTIONS.map((t) => (
              <button
                type="button"
                key={t}
                onClick={() => addWithType(t)}
                className="inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-semibold bg-white/[0.03] border border-white/10 rounded-md hover:bg-accent-amber/10 hover:border-accent-amber/40 hover:text-accent-amber text-gray-300 transition-colors"
              >
                <Plus size={11} /> {t}
              </button>
            ))}
          </div>
        </div>
      )}

      {sorted.length === 0 ? (
        <p className="text-sm text-gray-500 italic">No activities logged yet.</p>
      ) : (
        <div className="overflow-x-auto rounded-md border border-white/5">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left bg-white/[0.02]">
                <th className="px-3 py-2 text-[10px] font-semibold text-gray-500 uppercase tracking-[0.2em] w-[120px]">Date</th>
                <th className="px-3 py-2 text-[10px] font-semibold text-gray-500 uppercase tracking-[0.2em] w-[150px]">Type</th>
                <th className="px-3 py-2 text-[10px] font-semibold text-gray-500 uppercase tracking-[0.2em] w-[120px]">Owner</th>
                <th className="px-3 py-2 text-[10px] font-semibold text-gray-500 uppercase tracking-[0.2em]">Summary</th>
                <th className="px-3 py-2 w-[40px]" />
              </tr>
            </thead>
            <tbody>
              {sorted.map((a) => (
                <tr key={a.id} className="border-t border-white/5 hover:bg-white/[0.02] align-top">
                  <td className="px-3 py-2">
                    {readOnly ? (
                      <span className="text-xs text-gray-300">{a.date || '—'}</span>
                    ) : (
                      <input
                        type="date"
                        value={a.date}
                        onChange={(e) => updateRow(a.id, { date: e.target.value })}
                        className="border border-white/10 bg-canvas text-gray-200 rounded px-2 py-1 text-xs focus:outline-none focus:border-accent-sky/50 [color-scheme:dark]"
                      />
                    )}
                  </td>
                  <td className="px-3 py-2">
                    <SelectDropdown
                      value={a.type}
                      options={['', ...ACTIVITY_TYPE_OPTIONS] as string[]}
                      onChange={(v) => updateRow(a.id, { type: v })}
                      disabled={readOnly}
                    />
                  </td>
                  <td className="px-3 py-2">
                    <EditableField value={a.owner} onSave={(v) => updateRow(a.id, { owner: v })} placeholder="Owner" className="text-xs text-gray-300" disabled={readOnly} />
                  </td>
                  <td className="px-3 py-2">
                    <EditableField value={a.summary} onSave={(v) => updateRow(a.id, { summary: v })} placeholder="Summary…" className="text-xs text-gray-300" multiline disabled={readOnly} />
                  </td>
                  <td className="px-3 py-2">
                    {!readOnly && (
                      <button onClick={() => removeRow(a.id)} className="text-gray-500 hover:text-accent-rose transition-colors" aria-label="Remove activity">
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
    </Section>
  );
}
