'use client';

import { Share2 } from 'lucide-react';
import { SectionPageLayout } from '@/components/sales-motion/Marketing/shared/SectionPageLayout';
import { SocialMediaSection } from '@/components/sales-motion/Marketing/sections/SocialMediaSection';

export default function SocialsPage() {
  return (
    <SectionPageLayout
      title="Socials"
      description="LinkedIn, Twitter/X, YouTube, and other social media campaigns."
      icon={Share2}
      iconColor="bg-pink-100 text-pink-600"
    >
      <SocialMediaSection />
    </SectionPageLayout>
  );
}
