'use client';

import Link from 'next/link';
import { useMarketing } from '@/lib/sales-motion/marketing/MarketingContext';
import { Calendar, Mail, DollarSign, FileText, Share2, ArrowRight } from 'lucide-react';

export function MarketingOverview() {
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

  const sections = [
    { href: '/sales-motion/marketing/events', label: 'Events', icon: Calendar, count: state.events.length, color: 'bg-orange-50 border-orange-200', iconBg: 'bg-orange-100 text-orange-600' },
    { href: '/sales-motion/marketing/email-campaigns', label: 'Email Campaigns', icon: Mail, count: state.emailCampaigns.length, color: 'bg-blue-50 border-blue-200', iconBg: 'bg-blue-100 text-blue-600' },
    { href: '/sales-motion/marketing/paid-ads', label: 'Paid Ads', icon: DollarSign, count: state.adCampaigns.length, color: 'bg-green-50 border-green-200', iconBg: 'bg-green-100 text-green-600' },
    { href: '/sales-motion/marketing/thought-leadership', label: 'Thought Leadership', icon: FileText, count: state.content.length, color: 'bg-purple-50 border-purple-200', iconBg: 'bg-purple-100 text-purple-600' },
    { href: '/sales-motion/marketing/socials', label: 'Socials', icon: Share2, count: state.socialMedia.length, color: 'bg-pink-50 border-pink-200', iconBg: 'bg-pink-100 text-pink-600' },
  ];

  const totalActive = sections.reduce((sum, s) => sum + s.count, 0);

  return (
    <div className="flex-1 overflow-y-auto bg-gray-50">
      <div className="px-6 py-4 border-b border-gray-100 bg-white">
        <h1 className="text-xl font-bold text-gray-900">Marketing Dashboard</h1>
        <p className="text-sm text-gray-500 mt-0.5">Overview of all marketing activities. Select a section from the sidebar to dive in.</p>
      </div>

      <div className="p-6 space-y-6">
        {/* Summary */}
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <div className="text-sm font-medium text-gray-500 mb-1">Total Marketing Items</div>
          <div className="text-3xl font-bold text-gray-900">{totalActive}</div>
          <div className="text-xs text-gray-400 mt-1">Across {sections.length} sections</div>
        </div>

        {/* Section cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {sections.map((s) => {
            const Icon = s.icon;
            return (
              <Link key={s.href} href={s.href} className={`rounded-2xl border p-5 ${s.color} hover:shadow-md transition-shadow group`}>
                <div className="flex items-center gap-3 mb-3">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${s.iconBg}`}>
                    <Icon size={20} />
                  </div>
                  <ArrowRight size={16} className="ml-auto text-gray-400 group-hover:text-gray-700 group-hover:translate-x-1 transition-transform" />
                </div>
                <div className="text-3xl font-bold text-gray-900">{s.count}</div>
                <div className="text-sm text-gray-700 mt-1 font-medium">{s.label}</div>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
