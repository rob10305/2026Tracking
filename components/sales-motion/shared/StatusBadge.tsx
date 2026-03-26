import type { Status } from '@/lib/sales-motion/types';
import { STATUS_COLORS } from '@/lib/sales-motion/types';

export function StatusBadge({ status }: { status: Status }) {
  return (
    <span
      className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium text-white"
      style={{ backgroundColor: STATUS_COLORS[status] }}
    >
      {status}
    </span>
  );
}
