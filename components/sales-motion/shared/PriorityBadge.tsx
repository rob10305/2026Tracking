import type { Priority } from '@/lib/sales-motion/types';
import { PRIORITY_COLORS } from '@/lib/sales-motion/types';

export function PriorityBadge({ priority }: { priority: Priority }) {
  return (
    <span
      className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium text-white"
      style={{ backgroundColor: PRIORITY_COLORS[priority] }}
    >
      {priority}
    </span>
  );
}
