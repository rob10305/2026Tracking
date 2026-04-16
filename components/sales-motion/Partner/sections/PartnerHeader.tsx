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
  Active: 'bg-green-100 text-green-700 border-green-200',
  Recruit: 'bg-blue-100 text-blue-700 border-blue-200',
  Dormant: 'bg-gray-100 text-gray-600 border-gray-200',
};

export function PartnerHeader({ partner, updateField, readOnly }: SectionProps) {
  return (
    <div className="bg-gradient-to-br from-purple-50 via-indigo-50 to-white border-b border-gray-100">
      <div className="px-6 py-4 max-w-6xl mx-auto">
        {/* Breadcrumb */}
        <nav aria-label="Breadcrumb" className="flex items-center gap-1 text-xs text-gray-500 mb-3">
          <Link href="/sales-motion" className="hover:text-gray-800">
            Dashboard
          </Link>
          <ChevronRight size={12} className="text-gray-400" />
          <Link href="/sales-motion/partner" className="hover:text-gray-800">
            Partner
          </Link>
          <ChevronRight size={12} className="text-gray-400" />
          <span className="text-gray-800 font-medium">{partner.name || 'Untitled'}</span>
        </nav>

        <div className="flex items-start gap-5 flex-wrap">
          <LogoUploader
            value={partner.logo}
            partnerName={partner.name}
            onChange={(v) => updateField('logo', v)}
            disabled={readOnly}
          />
          <div className="flex-1 min-w-[260px]">
            <EditableField
              value={partner.name}
              onSave={(v) => updateField('name', v)}
              placeholder="Partner name"
              className="text-2xl font-bold text-gray-900"
              disabled={readOnly}
            />
            <div className="flex items-center gap-2 mt-2 flex-wrap">
              <SelectDropdown
                value={partner.status}
                options={PARTNER_STATUS_OPTIONS as unknown as PartnerStatus[]}
                onChange={(v) => updateField('status', v)}
                className={`${STATUS_COLORS[partner.status]} text-[11px] font-semibold uppercase`}
                disabled={readOnly}
              />
              <SelectDropdown
                value={partner.tier}
                options={PARTNER_TIER_OPTIONS as unknown as PartnerTier[]}
                onChange={(v) => updateField('tier', v)}
                disabled={readOnly}
              />
            </div>
            <div className="mt-3">
              <EditableField
                value={partner.description}
                onSave={(v) => updateField('description', v)}
                placeholder="Short description of the partner…"
                className="text-sm text-gray-600"
                multiline
                disabled={readOnly}
              />
            </div>
            <div className="mt-3 flex items-center gap-3 flex-wrap text-xs">
              <span className="text-gray-500">Website:</span>
              {partner.website ? (
                <a href={partner.website} target="_blank" rel="noopener noreferrer" className="text-purple-600 hover:underline inline-flex items-center gap-1">
                  {partner.website} <ExternalLink size={10} />
                </a>
              ) : (
                <EditableField value={partner.website} onSave={(v) => updateField('website', v)} placeholder="https://…" className="text-xs text-gray-600" disabled={readOnly} />
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
