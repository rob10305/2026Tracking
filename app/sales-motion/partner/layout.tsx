'use client';

import { PartnerProvider } from '@/lib/sales-motion/partner/PartnerContext';

export default function PartnerLayout({ children }: { children: React.ReactNode }) {
  return <PartnerProvider>{children}</PartnerProvider>;
}
