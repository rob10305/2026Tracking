'use client';

import { Calendar } from 'lucide-react';
import { SectionPageLayout } from '@/components/sales-motion/Marketing/shared/SectionPageLayout';
import { EventsSection } from '@/components/sales-motion/Marketing/sections/EventsSection';

export default function EventsPage() {
  return (
    <SectionPageLayout
      title="Industry Events"
      description="Track industry events, conferences, and trade shows."
      icon={Calendar}
      iconColor="bg-orange-100 text-orange-600"
    >
      <EventsSection />
    </SectionPageLayout>
  );
}
