'use client';

import { DollarSign } from 'lucide-react';
import { SectionPageLayout } from '@/components/sales-motion/Marketing/shared/SectionPageLayout';
import { AdCampaignsSection } from '@/components/sales-motion/Marketing/sections/AdCampaignsSection';

export default function PaidAdsPage() {
  return (
    <SectionPageLayout
      title="Paid Ads"
      description="Track Google Ads, LinkedIn Ads, and other paid channels."
      icon={DollarSign}
      iconColor="bg-green-100 text-green-600"
    >
      <AdCampaignsSection />
    </SectionPageLayout>
  );
}
