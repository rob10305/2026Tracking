"use client";

export type Rag = "" | "red" | "amber" | "green";

const ORDER: Rag[] = ["", "green", "amber", "red"];

const COLORS: Record<Rag, { bg: string; text: string; label: string }> = {
  "": { bg: "bg-white/5", text: "text-gray-400", label: "—" },
  red: { bg: "bg-red-500/80", text: "text-white", label: "Red" },
  amber: { bg: "bg-amber-400", text: "text-[#050914]", label: "Amber" },
  green: { bg: "bg-emerald-400", text: "text-[#050914]", label: "Green" },
};

export function ragColors(rag: Rag) {
  return COLORS[rag] ?? COLORS[""];
}

/** Click-to-cycle RAG cell. Shows label when wide enough, dot otherwise. */
export default function RagPicker({
  value,
  onChange,
  editing,
  compact = false,
}: {
  value: Rag;
  onChange: (next: Rag) => void;
  editing: boolean;
  compact?: boolean;
}) {
  const v: Rag = ORDER.includes(value) ? value : "";
  const c = ragColors(v);

  if (!editing) {
    return (
      <span
        className={`inline-flex items-center gap-1.5 rounded px-2 py-1 text-xs font-semibold ${c.bg} ${c.text}`}
      >
        <span className={`h-1.5 w-1.5 rounded-full ${v ? "bg-current" : "bg-gray-500"}`} />
        {compact ? "" : c.label}
      </span>
    );
  }

  return (
    <select
      value={v}
      onChange={(e) => onChange(e.target.value as Rag)}
      className={`text-xs font-semibold rounded px-2 py-1 border-0 outline-none cursor-pointer ${c.bg} ${c.text}`}
    >
      <option value="" className="bg-[#0b1120] text-gray-300">—</option>
      <option value="green" className="bg-[#0b1120] text-emerald-400">Green</option>
      <option value="amber" className="bg-[#0b1120] text-amber-400">Amber</option>
      <option value="red" className="bg-[#0b1120] text-red-400">Red</option>
    </select>
  );
}
