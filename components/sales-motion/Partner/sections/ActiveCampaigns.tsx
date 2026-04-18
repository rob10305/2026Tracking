'use client';

import { EditableField } from '@/components/sales-motion/shared/EditableField';
import { Megaphone, Plus, Trash2, ExternalLink } from 'lucide-react';
import type { PartnerCampaignLink } from '@/lib/sales-motion/partner/types';
import { AddButton, Section, type SectionProps } from './_shared';

export function ActiveCampaigns({ partner, updateField, readOnly }: SectionProps) {
  const addLink = () => {
    const campaignLinks: PartnerCampaignLink[] = [
      ...partner.campaignLinks,
      { id: crypto.randomUUID(), label: '', url: '', addedAt: new Date().toISOString() },
    ];
    updateField('campaignLinks', campaignLinks);
  };

  const updateLink = (id: string, patch: Partial<PartnerCampaignLink>) => {
    const campaignLinks = partner.campaignLinks.map((c) => (c.id === id ? { ...c, ...patch } : c));
    updateField('campaignLinks', campaignLinks);
  };

  const removeLink = (id: string) => {
    updateField('campaignLinks', partner.campaignLinks.filter((c) => c.id !== id));
  };

  return (
    <Section icon={Megaphone} title={`Active Campaigns (${partner.campaignLinks.length})`} color="bg-rose-100 text-rose-600">
      <p className="text-xs text-gray-500 italic">
        Links to relevant campaigns in the main dashboard. No campaign data is duplicated here.
      </p>

      {partner.campaignLinks.length === 0 ? (
        <p className="text-sm text-gray-500 italic">No campaign links yet.</p>
      ) : (
        <div className="space-y-2">
          {partner.campaignLinks.map((c) => (
            <div key={c.id} className="flex items-center gap-2 flex-wrap border border-white/5 rounded-md px-3 py-2 bg-white/[0.02]">
              <div className="flex-1 min-w-[200px]">
                <EditableField
                  value={c.label}
                  onSave={(v) => updateLink(c.id, { label: v })}
                  placeholder="Campaign label"
                  className="text-sm font-medium text-white"
                  disabled={readOnly}
                />
              </div>
              <div className="flex-1 min-w-[200px]">
                {readOnly && c.url ? (
                  <a href={c.url} target="_blank" rel="noopener noreferrer" className="text-xs text-accent-sky hover:text-white transition-colors inline-flex items-center gap-1">
                    {c.url} <ExternalLink size={10} />
                  </a>
                ) : (
                  <EditableField
                    value={c.url}
                    onSave={(v) => updateLink(c.id, { url: v })}
                    placeholder="https://…"
                    className="text-xs text-gray-300"
                    disabled={readOnly}
                  />
                )}
              </div>
              {!readOnly && (
                <button
                  type="button"
                  onClick={() => removeLink(c.id)}
                  className="text-gray-500 hover:text-accent-rose transition-colors"
                  aria-label="Remove campaign link"
                >
                  <Trash2 size={14} />
                </button>
              )}
            </div>
          ))}
        </div>
      )}

      {!readOnly && (
        <AddButton onClick={addLink}>
          <Plus size={12} /> Add Campaign Link
        </AddButton>
      )}
    </Section>
  );
}
