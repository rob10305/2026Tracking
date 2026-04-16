"use client";

import { useState } from "react";
import { ACCENT_BG, ACCENT_TEXT, DepartmentConfig, DepartmentSummary } from "./DepartmentView";
import ExportModal from "./ExportModal";

export default function DepartmentSummaryWithExport({
  dept,
  config,
}: {
  dept: string;
  config: DepartmentConfig;
}) {
  const [open, setOpen] = useState(false);
  const accentBg = ACCENT_BG[config.accent];
  const accentText = ACCENT_TEXT[config.accent];

  return (
    <>
      <div className="relative">
        <button
          type="button"
          onClick={() => setOpen(true)}
          className={`fixed top-[72px] right-6 z-30 inline-flex items-center gap-2 px-4 py-2 rounded-lg shadow-lg ${accentBg} text-[#050914] text-sm font-semibold hover:opacity-90 transition-opacity`}
        >
          <span className={`h-1.5 w-1.5 rounded-full bg-[#050914] opacity-60`} />
          Export {config.name} to PowerPoint
        </button>
        <DepartmentSummary config={config} />
        <p className={`max-w-6xl mx-auto -mt-6 px-8 pb-10 text-xs ${accentText}`}>
          Tip: use the Export button to generate a .pptx with your selected
          months for the Key Metrics slide.
        </p>
      </div>

      <ExportModal
        dept={dept}
        config={config}
        open={open}
        onClose={() => setOpen(false)}
      />
    </>
  );
}
