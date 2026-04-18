'use client';

import { EditableField } from '@/components/sales-motion/shared/EditableField';
import { Target, Plus, Trash2, Calendar } from 'lucide-react';
import type { PartnerGTMPlan, PartnerKeyDate } from '@/lib/sales-motion/partner/types';
import { Section, FieldLabel, AddButton, type SectionProps } from './_shared';

export function GtmStrategy({ partner, updateField, readOnly }: SectionProps) {
  const plan = partner.gtmPlan;

  const updateGtm = (field: keyof PartnerGTMPlan, value: string) => {
    updateField('gtmPlan', { ...plan, [field]: value });
  };

  const addKeyDate = () => {
    const keyDates: PartnerKeyDate[] = [
      ...plan.keyDates,
      { id: crypto.randomUUID(), date: '', description: '' },
    ];
    updateField('gtmPlan', { ...plan, keyDates });
  };

  const updateKeyDate = (id: string, field: 'date' | 'description', value: string) => {
    const keyDates = plan.keyDates.map((d) => (d.id === id ? { ...d, [field]: value } : d));
    updateField('gtmPlan', { ...plan, keyDates });
  };

  const removeKeyDate = (id: string) => {
    updateField('gtmPlan', { ...plan, keyDates: plan.keyDates.filter((d) => d.id !== id) });
  };

  return (
    <Section icon={Target} title="GTM Strategy" color="bg-indigo-100 text-indigo-600">
      <GtmTextField label="Summary" value={plan.summary} onSave={(v) => updateGtm('summary', v)} disabled={readOnly} multiline />
      <GtmTextField label="Target Accounts / Segments" value={plan.targets} onSave={(v) => updateGtm('targets', v)} disabled={readOnly} multiline />
      <GtmTextField label="Offerings" value={plan.offerings} onSave={(v) => updateGtm('offerings', v)} disabled={readOnly} multiline />

      {/* Structured GTM fields */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2 border-t border-white/5">
        <GtmTextField label="Partner Margin %" value={plan.partnerMargin} onSave={(v) => updateGtm('partnerMargin', v)} placeholder="e.g. 20%" disabled={readOnly} />
        <GtmTextField label="Pricing Model" value={plan.pricingModel} onSave={(v) => updateGtm('pricingModel', v)} placeholder="e.g. Resell, Referral, Co-sell" disabled={readOnly} />
        <GtmTextField label="MDF Budget" value={plan.mdfBudget} onSave={(v) => updateGtm('mdfBudget', v)} placeholder="e.g. $50K / quarter" disabled={readOnly} />
        <GtmTextField label="Competitive Context" value={plan.competitiveContext} onSave={(v) => updateGtm('competitiveContext', v)} placeholder="Competitors, positioning" disabled={readOnly} multiline />
      </div>

      {/* Key dates */}
      <div className="pt-3 border-t border-white/5">
        <div className="flex items-center gap-2 mb-2">
          <Calendar size={13} className="text-accent-sky" />
          <FieldLabel>Key Dates</FieldLabel>
        </div>
        {plan.keyDates.length === 0 ? (
          <p className="text-xs text-gray-500 italic mb-2">No key dates yet.</p>
        ) : (
          <div className="space-y-2 mb-2">
            {plan.keyDates.map((d) => (
              <div key={d.id} className="flex items-center gap-2 flex-wrap">
                {readOnly ? (
                  <span className="text-xs text-gray-200 font-medium">{d.date || '—'}</span>
                ) : (
                  <input
                    type="date"
                    value={d.date}
                    onChange={(e) => updateKeyDate(d.id, 'date', e.target.value)}
                    className="border border-white/10 bg-canvas text-gray-200 rounded px-2 py-1 text-xs focus:outline-none focus:border-accent-sky/50 [color-scheme:dark]"
                  />
                )}
                <div className="flex-1 min-w-[200px]">
                  <EditableField
                    value={d.description}
                    onSave={(v) => updateKeyDate(d.id, 'description', v)}
                    placeholder="Describe milestone…"
                    className="text-xs text-gray-300"
                    disabled={readOnly}
                  />
                </div>
                {!readOnly && (
                  <button
                    type="button"
                    onClick={() => removeKeyDate(d.id)}
                    className="text-gray-500 hover:text-accent-rose transition-colors"
                    aria-label="Remove key date"
                  >
                    <Trash2 size={14} />
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
        {!readOnly && (
          <AddButton onClick={addKeyDate}>
            <Plus size={12} /> Add Key Date
          </AddButton>
        )}
      </div>
    </Section>
  );
}

function GtmTextField({
  label,
  value,
  onSave,
  disabled,
  placeholder,
  multiline,
}: {
  label: string;
  value: string;
  onSave: (v: string) => void;
  disabled?: boolean;
  placeholder?: string;
  multiline?: boolean;
}) {
  return (
    <div>
      <FieldLabel>{label}</FieldLabel>
      <EditableField
        value={value}
        onSave={onSave}
        placeholder={placeholder ?? `Add ${label.toLowerCase()}…`}
        className="text-sm text-gray-300 block w-full whitespace-pre-wrap break-words"
        multiline={multiline}
        disabled={disabled}
      />
    </div>
  );
}
