'use client';

import Link from 'next/link';
import { EditableField } from '@/components/sales-motion/shared/EditableField';
import { SelectDropdown } from '@/components/sales-motion/shared/SelectDropdown';
import { LogoUploader } from '../LogoUploader';
import { PARTNER_STATUS_OPTIONS, PARTNER_TIER_OPTIONS } from '@/lib/sales-motion/partner/types';
import type { PartnerStatus, PartnerTier } from '@/lib/sales-motion/partner/types';
import { ChevronRight, ExternalLink } from 'lucide-react';
import type { SectionProps } from './_shared';

const STATUS_COLORS: Record<PartnerStatus, string> = {
  Active:  'bg-accent-emerald/10 text-accent-emerald border border-accent-emerald/30',
  Recruit: 'bg-accent-sky/10 text-accent-sky border border-accent-sky/30',
  Dormant: 'bg-white/5 text-gray-300 border border-white/10',
};

export function PartnerHeader({ partner, updateField, readOnly }: SectionProps) {
  return (
    <div className="relative overflow-hidden bg-canvas-raised/60 border-b border-white/5">
      {/* Hero glow — violet accent */}
      <div
        aria-hidden
        className="pointer-events-none absolute -top-24 -right-24 h-72 w-72 rounded-full glow-violet blur-3xl"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -bottom-24 -left-24 h-64 w-64 rounded-full glow-sky blur-3xl opacity-80"
      />

      <div className="relative px-8 py-6 max-w-6xl mx-auto">
        {/* Breadcrumb */}
        <nav
          aria-label="Breadcrumb"
          className="flex items-center gap-1 text-[11px] font-semibold uppercase tracking-[0.2em] text-gray-500 mb-4"
        >
          <Link href="/sales-motion" className="hover:text-white transition-colors">
            Dashboard
          </Link>
          <ChevronRight size={12} className="text-gray-600" />
          <Link href="/sales-motion/partner" className="hover:text-white transition-colors">
            Partner
          </Link>
          <ChevronRight size={12} className="text-gray-600" />
          <span className="text-accent-violet">{partner.name || 'Untitled'}</span>
        </nav>

        <div className="flex items-start gap-6 flex-wrap">
          <LogoUploader
            value={partner.logo}
            partnerName={partner.name}
            onChange={(v) => updateField('logo', v)}
            disabled={readOnly}
          />
          <div className="flex-1 min-w-[260px]">
            <p className="text-[11px] font-semibold uppercase tracking-[0.3em] text-accent-violet">
              FY2026 · Partner
            </p>
            <EditableField
              value={partner.name}
              onSave={(v) => updateField('name', v)}
              placeholder="Partner name"
              className="mt-1 text-3xl font-bold text-white tracking-tight"
              disabled={readOnly}
            />
            <div className="flex items-center gap-2 mt-3 flex-wrap">
              <SelectDropdown
                value={partner.status}
                options={PARTNER_STATUS_OPTIONS as unknown as PartnerStatus[]}
                onChange={(v) => updateField('status', v)}
                className={`${STATUS_COLORS[partner.status]} text-[11px] font-semibold uppercase tracking-[0.2em]`}
                disabled={readOnly}
              />
              <SelectDropdown
                value={partner.tier}
                options={PARTNER_TIER_OPTIONS as unknown as PartnerTier[]}
                onChange={(v) => updateField('tier', v)}
                disabled={readOnly}
              />
            </div>
            <div className="mt-4">
              <EditableField
                value={partner.description}
                onSave={(v) => updateField('description', v)}
                placeholder="Short description of the partner…"
                className="text-sm text-gray-300"
                multiline
                disabled={readOnly}
              />
            </div>
            <div className="mt-4 flex items-center gap-3 flex-wrap text-xs">
              <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-gray-500">
                Website
              </span>
              {partner.website ? (
                <a
                  href={partner.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-accent-sky hover:text-white inline-flex items-center gap-1 transition-colors"
                >
                  {partner.website} <ExternalLink size={10} />
                </a>
              ) : (
                <EditableField
                  value={partner.website}
                  onSave={(v) => updateField('website', v)}
                  placeholder="https://…"
                  className="text-xs text-gray-300"
                  disabled={readOnly}
                />
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
