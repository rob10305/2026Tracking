'use client';

import { useMarketing } from '@/lib/sales-motion/marketing/MarketingContext';
import type { LucideIcon } from 'lucide-react';

interface SectionPageLayoutProps {
  title: string;
  description: string;
  icon: LucideIcon;
  iconColor: string;
  children: React.ReactNode;
}

export function SectionPageLayout({ title, description, icon: Icon, iconColor, children }: SectionPageLayoutProps) {
  const { isLoading } = useMarketing();

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
      <div className="px-6 py-4 border-b border-gray-100 bg-white flex items-center gap-3">
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${iconColor}`}>
          <Icon size={20} />
        </div>
        <div>
          <h1 className="text-xl font-bold text-gray-900">{title}</h1>
          <p className="text-sm text-gray-500 mt-0.5">{description}</p>
        </div>
      </div>
      <div className="p-6">
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          {children}
        </div>
      </div>
    </div>
  );
}
