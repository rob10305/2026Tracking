'use client';

import { useTracker } from '@/lib/sales-motion/context/TrackerContext';
import { SalesOverview } from '@/components/sales-motion/Dashboard/SalesOverview';
import { Dashboard } from '@/components/sales-motion/Dashboard/Dashboard';

export default function SalesMotionPage() {
  const { viewAll } = useTracker();
  return viewAll ? <SalesOverview /> : <Dashboard />;
}
