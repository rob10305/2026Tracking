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
          <div className="text-[10px] font-semibold text-gray-500 uppercase tracking-widest mb-1.5">
            Log new activity
          </div>
          <div className="flex items-center gap-1.5 flex-wrap">
            {ACTIVITY_TYPE_OPTIONS.map((t) => (
              <button
                type="button"
                key={t}
                onClick={() => addWithType(t)}
                className="inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-semibold bg-white border border-gray-200 rounded-md hover:border-purple-300 hover:bg-purple-50 hover:text-purple-700 text-gray-600 transition-colors"
              >
                <Plus size={11} /> {t}
              </button>
            ))}
          </div>
        </div>
      )}

      {sorted.length === 0 ? (
        <p className="text-sm text-gray-400 italic">No activities logged yet.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left bg-gray-50">
                <th className="px-3 py-2 text-xs font-semibold text-gray-500 w-[120px]">Date</th>
                <th className="px-3 py-2 text-xs font-semibold text-gray-500 w-[150px]">Type</th>
                <th className="px-3 py-2 text-xs font-semibold text-gray-500 w-[120px]">Owner</th>
                <th className="px-3 py-2 text-xs font-semibold text-gray-500">Summary</th>
                <th className="px-3 py-2 w-[40px]" />
              </tr>
            </thead>
            <tbody>
              {sorted.map((a) => (
                <tr key={a.id} className="border-t border-gray-100 align-top">
                  <td className="px-3 py-2">
                    {readOnly ? (
                      <span className="text-xs text-gray-600">{a.date || '—'}</span>
                    ) : (
                      <input
                        type="date"
                        value={a.date}
                        onChange={(e) => updateRow(a.id, { date: e.target.value })}
                        className="border border-gray-300 rounded px-1.5 py-0.5 text-xs bg-white"
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
                    <EditableField value={a.owner} onSave={(v) => updateRow(a.id, { owner: v })} placeholder="Owner" className="text-xs" disabled={readOnly} />
                  </td>
                  <td className="px-3 py-2">
                    <EditableField value={a.summary} onSave={(v) => updateRow(a.id, { summary: v })} placeholder="Summary…" className="text-xs" multiline disabled={readOnly} />
                  </td>
                  <td className="px-3 py-2">
                    {!readOnly && (
                      <button onClick={() => removeRow(a.id)} className="text-gray-300 hover:text-red-500" aria-label="Remove activity">
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
