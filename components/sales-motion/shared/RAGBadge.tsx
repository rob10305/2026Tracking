import type { RAG } from '@/lib/sales-motion/types';

export function RAGBadge({ rag }: { rag: RAG }) {
  if (!rag) return <span className="text-xs text-gray-400">—</span>;
  return <span className="text-sm">{rag}</span>;
}
