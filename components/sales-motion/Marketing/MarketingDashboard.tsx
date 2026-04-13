'use client';

import { useMarketing } from '@/lib/sales-motion/marketing/MarketingContext';
import { SectionCard } from './shared/SectionCard';
import { EventsSection } from './sections/EventsSection';
import { EmailCampaignsSection } from './sections/EmailCampaignsSection';
import { AdCampaignsSection } from './sections/AdCampaignsSection';
import { ContentSection } from './sections/ContentSection';
import { WebinarsSection } from './sections/WebinarsSection';
import { SocialMediaSection } from './sections/SocialMediaSection';
import { Calendar, Mail, DollarSign, FileText, Video, Share2 } from 'lucide-react';

export function MarketingDashboard() {
  const { state, isLoading } = useMarketing();

  if (isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-gray-300 border-t-orange-600" />
          <p className="mt-3 text-sm text-gray-500">Loading marketing data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto bg-gray-50">
      <div className="px-6 py-4 border-b border-gray-100 bg-white">
        <h1 className="text-xl font-bold text-gray-900">Marketing Dashboard</h1>
        <p className="text-sm text-gray-500 mt-0.5">Track events, campaigns, content, and marketing activities.</p>
      </div>

      <div className="p-6 space-y-4">
        <SectionCard title="Industry Events" icon={Calendar} iconColor="bg-orange-100 text-orange-600" count={state.events.length}>
          <EventsSection />
        </SectionCard>

        <SectionCard title="Email Campaigns" icon={Mail} iconColor="bg-blue-100 text-blue-600" count={state.emailCampaigns.length}>
          <EmailCampaignsSection />
        </SectionCard>

        <SectionCard title="Paid Ads" icon={DollarSign} iconColor="bg-green-100 text-green-600" count={state.adCampaigns.length}>
          <AdCampaignsSection />
        </SectionCard>

        <SectionCard title="Content Marketing" icon={FileText} iconColor="bg-purple-100 text-purple-600" count={state.content.length}>
          <ContentSection />
        </SectionCard>

        <SectionCard title="Webinars" icon={Video} iconColor="bg-cyan-100 text-cyan-600" count={state.webinars.length}>
          <WebinarsSection />
        </SectionCard>

        <SectionCard title="Social Media" icon={Share2} iconColor="bg-pink-100 text-pink-600" count={state.socialMedia.length}>
          <SocialMediaSection />
        </SectionCard>
      </div>
    </div>
  );
}
