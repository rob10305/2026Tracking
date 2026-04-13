'use client';

import { MarketingProvider } from '@/lib/sales-motion/marketing/MarketingContext';
import { MarketingDashboard } from '@/components/sales-motion/Marketing/MarketingDashboard';

export default function MarketingPage() {
  return (
    <MarketingProvider>
      <MarketingDashboard />
    </MarketingProvider>
  );
}
