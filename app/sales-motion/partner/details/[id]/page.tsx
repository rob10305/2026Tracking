'use client';

import { useParams } from 'next/navigation';
import { PartnerDetail } from '@/components/sales-motion/Partner/PartnerDetail';

export default function PartnerDetailPage() {
  const params = useParams();
  const id = typeof params.id === 'string' ? params.id : Array.isArray(params.id) ? params.id[0] : '';
  return <PartnerDetail partnerId={id} />;
}
