'use client';

import { Mail } from 'lucide-react';
import { SectionPageLayout } from '@/components/sales-motion/Marketing/shared/SectionPageLayout';
import { EmailCampaignsSection } from '@/components/sales-motion/Marketing/sections/EmailCampaignsSection';

export default function EmailCampaignsPage() {
  return (
    <SectionPageLayout
      title="Email Campaigns"
      description="Manage email campaigns, audience segments, and performance."
      icon={Mail}
      iconColor="bg-blue-100 text-blue-600"
    >
      <EmailCampaignsSection />
    </SectionPageLayout>
  );
}
