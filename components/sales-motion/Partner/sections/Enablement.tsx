'use client';

import { useState } from 'react';
import { EditableField } from '@/components/sales-motion/shared/EditableField';
import { SelectDropdown } from '@/components/sales-motion/shared/SelectDropdown';
import { GraduationCap, Plus, Trash2, Check } from 'lucide-react';
import {
  CERTIFICATION_STATUS_OPTIONS,
  type CertificationStatus,
  type PartnerCertification,
  type PartnerTraining,
} from '@/lib/sales-motion/partner/types';
import { AddButton, FieldLabel, Section, type SectionProps } from './_shared';

export function Enablement({ partner, updateField, readOnly }: SectionProps) {
  const [enablementDraft, setEnablementDraft] = useState(partner.enablementNotes);
  const [savedAt, setSavedAt] = useState<number | null>(null);

  const enablementDirty = enablementDraft !== partner.enablementNotes;

  const saveEnablement = () => {
    updateField('enablementNotes', enablementDraft);
    setSavedAt(Date.now());
    setTimeout(() => setSavedAt(null), 2000);
  };

  // Certifications
  const updateCert = (id: string, patch: Partial<PartnerCertification>) => {
    const certifications = partner.certifications.map((c) => (c.id === id ? { ...c, ...patch } : c));
    updateField('certifications', certifications);
  };
  const addCert = () => {
    const certifications: PartnerCertification[] = [
      ...partner.certifications,
      {
        id: crypto.randomUUID(),
        certification: '',
        holder: '',
        issued: '',
        expires: '',
        status: 'Active',
      },
    ];
    updateField('certifications', certifications);
  };
  const removeCert = (id: string) => {
    updateField('certifications', partner.certifications.filter((c) => c.id !== id));
  };

  // Trainings
  const updateTraining = (id: string, patch: Partial<PartnerTraining>) => {
    const trainings = partner.trainings.map((t) => (t.id === id ? { ...t, ...patch } : t));
    updateField('trainings', trainings);
  };
  const addTraining = () => {
    const trainings: PartnerTraining[] = [
      ...partner.trainings,
      {
        id: crypto.randomUUID(),
        name: '',
        attendee: '',
        date: new Date().toISOString().slice(0, 10),
        notes: '',
      },
    ];
    updateField('trainings', trainings);
  };
  const removeTraining = (id: string) => {
    updateField('trainings', partner.trainings.filter((t) => t.id !== id));
  };

  return (
    <Section icon={GraduationCap} title="Enablement & Certifications" color="bg-lime-100 text-lime-600">
      {/* Certifications */}
      <div>
        <FieldLabel>Certifications ({partner.certifications.length})</FieldLabel>
        {partner.certifications.length === 0 ? (
          <p className="text-sm text-gray-500 italic mb-2">No certifications yet.</p>
        ) : (
          <div className="overflow-x-auto mb-2">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left bg-white/[0.02]">
                  <th className="px-3 py-2 text-[10px] font-semibold text-gray-500 uppercase tracking-[0.2em]">Certification</th>
                  <th className="px-3 py-2 text-[10px] font-semibold text-gray-500 uppercase tracking-[0.2em] w-[140px]">Holder</th>
                  <th className="px-3 py-2 text-[10px] font-semibold text-gray-500 uppercase tracking-[0.2em] w-[130px]">Issued</th>
                  <th className="px-3 py-2 text-[10px] font-semibold text-gray-500 uppercase tracking-[0.2em] w-[130px]">Expires</th>
                  <th className="px-3 py-2 text-[10px] font-semibold text-gray-500 uppercase tracking-[0.2em] w-[130px]">Status</th>
                  <th className="px-3 py-2 w-[40px]" />
                </tr>
              </thead>
              <tbody>
                {partner.certifications.map((c) => (
                  <tr key={c.id} className="border-t border-white/5 hover:bg-white/[0.02] align-top">
                    <td className="px-3 py-2">
                      <EditableField value={c.certification} onSave={(v) => updateCert(c.id, { certification: v })} placeholder="Certification name" className="text-sm" disabled={readOnly} />
                    </td>
                    <td className="px-3 py-2">
                      <EditableField value={c.holder} onSave={(v) => updateCert(c.id, { holder: v })} placeholder="Holder" className="text-xs" disabled={readOnly} />
                    </td>
                    <td className="px-3 py-2">
                      {readOnly ? (
                        <span className="text-xs text-gray-300">{c.issued || '—'}</span>
                      ) : (
                        <input
                          type="date"
                          value={c.issued}
                          onChange={(e) => updateCert(c.id, { issued: e.target.value })}
                          className="border border-white/10 bg-canvas text-gray-200 rounded px-2 py-1 text-xs focus:outline-none focus:border-accent-sky/50 [color-scheme:dark]"
                        />
                      )}
                    </td>
                    <td className="px-3 py-2">
                      {readOnly ? (
                        <span className="text-xs text-gray-300">{c.expires || '—'}</span>
                      ) : (
                        <input
                          type="date"
                          value={c.expires}
                          onChange={(e) => updateCert(c.id, { expires: e.target.value })}
                          className="border border-white/10 bg-canvas text-gray-200 rounded px-2 py-1 text-xs focus:outline-none focus:border-accent-sky/50 [color-scheme:dark]"
                        />
                      )}
                    </td>
                    <td className="px-3 py-2">
                      <SelectDropdown
                        value={c.status}
                        options={CERTIFICATION_STATUS_OPTIONS as CertificationStatus[]}
                        onChange={(v) => updateCert(c.id, { status: v as CertificationStatus })}
                        disabled={readOnly}
                      />
                    </td>
                    <td className="px-3 py-2">
                      {!readOnly && (
                        <button onClick={() => removeCert(c.id)} className="text-gray-500 hover:text-accent-rose transition-colors" aria-label="Remove certification">
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
          <AddButton onClick={addCert}>
            <Plus size={12} /> Add Certification
          </AddButton>
        )}
      </div>

      {/* Training Log */}
      <div className="pt-3 border-t border-white/5">
        <FieldLabel>Training Log ({partner.trainings.length})</FieldLabel>
        {partner.trainings.length === 0 ? (
          <p className="text-sm text-gray-500 italic mb-2">No training logged yet.</p>
        ) : (
          <div className="overflow-x-auto mb-2">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left bg-white/[0.02]">
                  <th className="px-3 py-2 text-[10px] font-semibold text-gray-500 uppercase tracking-[0.2em] w-[130px]">Date</th>
                  <th className="px-3 py-2 text-[10px] font-semibold text-gray-500 uppercase tracking-[0.2em]">Training</th>
                  <th className="px-3 py-2 text-[10px] font-semibold text-gray-500 uppercase tracking-[0.2em] w-[160px]">Attendee</th>
                  <th className="px-3 py-2 text-[10px] font-semibold text-gray-500 uppercase tracking-[0.2em]">Notes</th>
                  <th className="px-3 py-2 w-[40px]" />
                </tr>
              </thead>
              <tbody>
                {[...partner.trainings]
                  .sort((a, b) => b.date.localeCompare(a.date))
                  .map((t) => (
                    <tr key={t.id} className="border-t border-white/5 hover:bg-white/[0.02] align-top">
                      <td className="px-3 py-2">
                        {readOnly ? (
                          <span className="text-xs text-gray-300">{t.date || '—'}</span>
                        ) : (
                          <input
                            type="date"
                            value={t.date}
                            onChange={(e) => updateTraining(t.id, { date: e.target.value })}
                            className="border border-white/10 bg-canvas text-gray-200 rounded px-2 py-1 text-xs focus:outline-none focus:border-accent-sky/50 [color-scheme:dark]"
                          />
                        )}
                      </td>
                      <td className="px-3 py-2">
                        <EditableField value={t.name} onSave={(v) => updateTraining(t.id, { name: v })} placeholder="Training name" className="text-sm" disabled={readOnly} />
                      </td>
                      <td className="px-3 py-2">
                        <EditableField value={t.attendee} onSave={(v) => updateTraining(t.id, { attendee: v })} placeholder="Attendee" className="text-xs" disabled={readOnly} />
                      </td>
                      <td className="px-3 py-2">
                        <EditableField value={t.notes} onSave={(v) => updateTraining(t.id, { notes: v })} placeholder="Notes" className="text-xs" multiline disabled={readOnly} />
                      </td>
                      <td className="px-3 py-2">
                        {!readOnly && (
                          <button onClick={() => removeTraining(t.id)} className="text-gray-500 hover:text-accent-rose transition-colors" aria-label="Remove training">
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
          <AddButton onClick={addTraining}>
            <Plus size={12} /> Add Training
          </AddButton>
        )}
      </div>

      {/* Outstanding Requirements / Gaps */}
      <div className="pt-3 border-t border-white/5">
        <FieldLabel>Outstanding Requirements / Gaps</FieldLabel>
        <textarea
          value={enablementDraft}
          onChange={(e) => setEnablementDraft(e.target.value)}
          placeholder="Notes on enablement gaps, upcoming certification needs, required training…"
          rows={3}
          disabled={readOnly}
          className="w-full border border-white/10 bg-canvas text-gray-200 placeholder-gray-500 rounded-md px-3 py-2 text-sm focus:outline-none focus:border-accent-sky/50 disabled:bg-white/[0.02] disabled:text-gray-400"
        />
        {!readOnly && (
          <div className="mt-2 flex items-center gap-2">
            <button
              type="button"
              onClick={saveEnablement}
              disabled={!enablementDirty}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-accent-violet text-[#050914] rounded-md hover:brightness-110 disabled:opacity-40 transition"
            >
              Save
            </button>
            {savedAt && (
              <span className="inline-flex items-center gap-1 text-xs text-accent-emerald">
                <Check size={12} /> Saved
              </span>
            )}
          </div>
        )}
      </div>
    </Section>
  );
}
