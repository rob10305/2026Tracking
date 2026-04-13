'use client';

import type { CampaignStatus, AttendanceStatus } from '@/lib/sales-motion/marketing/types';

const CAMPAIGN_COLORS: Record<CampaignStatus, string> = {
  '': 'bg-gray-100 text-gray-500',
  'Draft': 'bg-gray-100 text-gray-600',
  'Active': 'bg-green-100 text-green-700',
  'Paused': 'bg-amber-100 text-amber-700',
  'Completed': 'bg-blue-100 text-blue-700',
  'Cancelled': 'bg-red-100 text-red-700',
};

const ATTENDANCE_COLORS: Record<AttendanceStatus, string> = {
  '': 'bg-gray-100 text-gray-500',
  'Attending': 'bg-green-100 text-green-700',
  'Sponsoring': 'bg-blue-100 text-blue-700',
  'Co-Sponsoring': 'bg-indigo-100 text-indigo-700',
  'Watching': 'bg-amber-100 text-amber-700',
  'Not Attending': 'bg-gray-100 text-gray-500',
};

export function CampaignStatusBadge({ status }: { status: CampaignStatus }) {
  return (
    <span className={`inline-block px-2 py-0.5 rounded-full text-[11px] font-medium ${CAMPAIGN_COLORS[status] || CAMPAIGN_COLORS['']}`}>
      {status || '—'}
    </span>
  );
}

export function AttendanceBadge({ status }: { status: AttendanceStatus }) {
  return (
    <span className={`inline-block px-2 py-0.5 rounded-full text-[11px] font-medium ${ATTENDANCE_COLORS[status] || ATTENDANCE_COLORS['']}`}>
      {status || '—'}
    </span>
  );
}
