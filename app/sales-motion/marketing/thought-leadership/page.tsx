'use client';

import { FileText } from 'lucide-react';
import { SectionPageLayout } from '@/components/sales-motion/Marketing/shared/SectionPageLayout';
import { ContentSection } from '@/components/sales-motion/Marketing/sections/ContentSection';

export default function ThoughtLeadershipPage() {
  return (
    <SectionPageLayout
      title="Thought Leadership"
      description="Blog posts, whitepapers, case studies, webinars, and other thought leadership content."
      icon={FileText}
      iconColor="bg-purple-100 text-purple-600"
    >
      <ContentSection />
    </SectionPageLayout>
  );
}
