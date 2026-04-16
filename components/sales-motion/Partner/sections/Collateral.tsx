'use client';

import { useMemo, useState } from 'react';
import { EditableField } from '@/components/sales-motion/shared/EditableField';
import { SelectDropdown } from '@/components/sales-motion/shared/SelectDropdown';
import { FolderOpen, Plus, Trash2, ExternalLink, LayoutGrid, Rows } from 'lucide-react';
import {
  COLLATERAL_TYPE_OPTIONS,
  COLLATERAL_AUDIENCE_OPTIONS,
  type CollateralType,
  type CollateralAudience,
  type PartnerCollateral,
} from '@/lib/sales-motion/partner/types';
import { AddButton, Pill, Section, type SectionProps } from './_shared';

type ViewMode = 'grid' | 'table';
type TypeFilter = CollateralType | 'All';
type AudienceFilter = CollateralAudience | 'All';

const TYPE_FILTERS: TypeFilter[] = ['All', ...COLLATERAL_TYPE_OPTIONS];
const AUDIENCE_FILTERS: AudienceFilter[] = ['All', ...COLLATERAL_AUDIENCE_OPTIONS];

export function Collateral({ partner, updateField, readOnly }: SectionProps) {
  const [view, setView] = useState<ViewMode>('grid');
  const [typeFilter, setTypeFilter] = useState<TypeFilter>('All');
  const [audienceFilter, setAudienceFilter] = useState<AudienceFilter>('All');

  const filtered = useMemo(() => {
    return partner.collateral.filter((c) => {
      if (typeFilter !== 'All' && c.type !== typeFilter) return false;
      if (audienceFilter !== 'All' && c.audience !== audienceFilter) return false;
      return true;
    });
  }, [partner.collateral, typeFilter, audienceFilter]);

  const updateRow = (id: string, patch: Partial<PartnerCollateral>) => {
    const collateral = partner.collateral.map((c) => (c.id === id ? { ...c, ...patch } : c));
    updateField('collateral', collateral);
  };

  const addRow = () => {
    const collateral: PartnerCollateral[] = [
      ...partner.collateral,
      {
        id: crypto.randomUUID(),
        title: '',
        type: '',
        audience: '',
        url: '',
        notes: '',
        createdAt: new Date().toISOString(),
      },
    ];
    updateField('collateral', collateral);
  };

  const removeRow = (id: string) => {
    updateField('collateral', partner.collateral.filter((c) => c.id !== id));
  };

  return (
    <Section
      icon={FolderOpen}
      title={`Collateral (${partner.collateral.length})`}
      color="bg-cyan-100 text-cyan-600"
      right={
        <div className="flex items-center gap-1 bg-gray-100 rounded-md p-0.5">
          <button
            type="button"
            onClick={() => setView('grid')}
            aria-label="Grid view"
            className={`p-1 rounded ${view === 'grid' ? 'bg-white shadow-sm text-gray-900' : 'text-gray-500 hover:text-gray-700'}`}
          >
            <LayoutGrid size={14} />
          </button>
          <button
            type="button"
            onClick={() => setView('table')}
            aria-label="Table view"
            className={`p-1 rounded ${view === 'table' ? 'bg-white shadow-sm text-gray-900' : 'text-gray-500 hover:text-gray-700'}`}
          >
            <Rows size={14} />
          </button>
        </div>
      }
    >
      {/* Type filter */}
      <div>
        <div className="text-[10px] font-semibold text-gray-500 uppercase tracking-widest mb-1.5">Type</div>
        <div className="flex items-center gap-1.5 flex-wrap">
          {TYPE_FILTERS.map((t) => (
            <Pill key={t} active={typeFilter === t} onClick={() => setTypeFilter(t)}>
              {t}
            </Pill>
          ))}
        </div>
      </div>

      {/* Audience filter */}
      <div>
        <div className="text-[10px] font-semibold text-gray-500 uppercase tracking-widest mb-1.5">Audience</div>
        <div className="flex items-center gap-1.5 flex-wrap">
          {AUDIENCE_FILTERS.map((a) => (
            <Pill key={a} active={audienceFilter === a} onClick={() => setAudienceFilter(a)}>
              {a}
            </Pill>
          ))}
        </div>
      </div>

      {filtered.length === 0 ? (
        <p className="text-sm text-gray-400 italic">
          {partner.collateral.length === 0 ? 'No collateral yet.' : 'No items match the current filters.'}
        </p>
      ) : view === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {filtered.map((c) => (
            <div key={c.id} className="border border-gray-200 rounded-xl p-3 bg-white space-y-2">
              <div className="flex items-start justify-between gap-2">
                <EditableField
                  value={c.title}
                  onSave={(v) => updateRow(c.id, { title: v })}
                  placeholder="Title"
                  className="text-sm font-semibold text-gray-900 flex-1"
                  disabled={readOnly}
                />
                {!readOnly && (
                  <button
                    type="button"
                    onClick={() => removeRow(c.id)}
                    className="text-gray-300 hover:text-red-500"
                    aria-label="Remove collateral"
                  >
                    <Trash2 size={14} />
                  </button>
                )}
              </div>
              <div className="flex items-center gap-2 flex-wrap">
                <SelectDropdown
                  value={c.type}
                  options={['', ...COLLATERAL_TYPE_OPTIONS] as (CollateralType | '')[]}
                  onChange={(v) => updateRow(c.id, { type: v })}
                  disabled={readOnly}
                />
                <SelectDropdown
                  value={c.audience}
                  options={['', ...COLLATERAL_AUDIENCE_OPTIONS] as (CollateralAudience | '')[]}
                  onChange={(v) => updateRow(c.id, { audience: v })}
                  disabled={readOnly}
                />
              </div>
              {readOnly && c.url ? (
                <a href={c.url} target="_blank" rel="noopener noreferrer" className="text-xs text-purple-600 hover:underline inline-flex items-center gap-1 break-all">
                  {c.url} <ExternalLink size={10} />
                </a>
              ) : (
                <EditableField
                  value={c.url}
                  onSave={(v) => updateRow(c.id, { url: v })}
                  placeholder="https://…"
                  className="text-xs text-gray-600"
                  disabled={readOnly}
                />
              )}
              <EditableField
                value={c.notes}
                onSave={(v) => updateRow(c.id, { notes: v })}
                placeholder="Notes"
                className="text-xs text-gray-700"
                multiline
                disabled={readOnly}
              />
            </div>
          ))}
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left bg-gray-50">
                <th className="px-3 py-2 text-xs font-semibold text-gray-500">Title</th>
                <th className="px-3 py-2 text-xs font-semibold text-gray-500 w-[150px]">Type</th>
                <th className="px-3 py-2 text-xs font-semibold text-gray-500 w-[150px]">Audience</th>
                <th className="px-3 py-2 text-xs font-semibold text-gray-500">URL</th>
                <th className="px-3 py-2 text-xs font-semibold text-gray-500">Notes</th>
                <th className="px-3 py-2 w-[40px]" />
              </tr>
            </thead>
            <tbody>
              {filtered.map((c) => (
                <tr key={c.id} className="border-t border-gray-100 align-top">
                  <td className="px-3 py-2">
                    <EditableField value={c.title} onSave={(v) => updateRow(c.id, { title: v })} placeholder="Title" className="text-sm font-medium" disabled={readOnly} />
                  </td>
                  <td className="px-3 py-2">
                    <SelectDropdown
                      value={c.type}
                      options={['', ...COLLATERAL_TYPE_OPTIONS] as CollateralType[]}
                      onChange={(v) => updateRow(c.id, { type: v as CollateralType | '' })}
                      disabled={readOnly}
                    />
                  </td>
                  <td className="px-3 py-2">
                    <SelectDropdown
                      value={c.audience}
                      options={['', ...COLLATERAL_AUDIENCE_OPTIONS] as CollateralAudience[]}
                      onChange={(v) => updateRow(c.id, { audience: v as CollateralAudience | '' })}
                      disabled={readOnly}
                    />
                  </td>
                  <td className="px-3 py-2">
                    {readOnly && c.url ? (
                      <a href={c.url} target="_blank" rel="noopener noreferrer" className="text-xs text-purple-600 hover:underline inline-flex items-center gap-1">
                        Open <ExternalLink size={10} />
                      </a>
                    ) : (
                      <EditableField value={c.url} onSave={(v) => updateRow(c.id, { url: v })} placeholder="https://…" className="text-xs" disabled={readOnly} />
                    )}
                  </td>
                  <td className="px-3 py-2">
                    <EditableField value={c.notes} onSave={(v) => updateRow(c.id, { notes: v })} placeholder="Notes" className="text-xs" multiline disabled={readOnly} />
                  </td>
                  <td className="px-3 py-2">
                    {!readOnly && (
                      <button onClick={() => removeRow(c.id)} className="text-gray-300 hover:text-red-500" aria-label="Remove collateral">
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
          <Plus size={12} /> Add Collateral
        </AddButton>
      )}
    </Section>
  );
}
