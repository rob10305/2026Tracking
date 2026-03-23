"use client";

import React, { useEffect, useState, useCallback } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import {
  CONTRIBUTORS,
  METRICS,
  GOALS,
  CONTRIBUTION_MONTHS,
  CONTRIBUTION_MONTH_LABELS,
  actualKey,
  type ContributorId,
  type MetricId,
} from "@/lib/contribution/data";
import { ArrowLeft, Check, Loader2 } from "lucide-react";

const TEAM_ACCENT: Record<string, { bg: string; badge: string }> = {
  cs:      { bg: "bg-teal-600",   badge: "bg-teal-100 text-teal-800 border border-teal-200" },
  sales:   { bg: "bg-orange-600", badge: "bg-orange-100 text-orange-800 border border-orange-200" },
  partner: { bg: "bg-emerald-600",badge: "bg-emerald-100 text-emerald-800 border border-emerald-200" },
};

function fmtCurrency(n: number): string {
  if (n === 0) return "$0";
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(2)}M`;
  if (n >= 1_000) return `$${Math.round(n / 1_000).toLocaleString()}K`;
  return `$${Math.round(n).toLocaleString()}`;
}

function fmtVal(n: number, format: "number" | "currency"): string {
  return format === "currency" ? fmtCurrency(n) : String(Math.round(n));
}

function pctColor(p: number, hasActual: boolean): string {
  if (!hasActual) return "text-gray-300";
  if (p >= 100) return "text-emerald-600";
  if (p >= 75) return "text-amber-600";
  return "text-red-500";
}

type FieldKey = string;
type SaveState = "idle" | "saving" | "saved";

export default function EditContributionPage() {
  const { id } = useParams<{ id: string }>();

  const contributor = CONTRIBUTORS.find((c) => c.id === id);

  const defaultMonthIdx = (() => {
    const now = new Date();
    const nowYM = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
    const idx = CONTRIBUTION_MONTHS.findIndex((m) => m >= nowYM);
    return Math.max(0, idx === -1 ? CONTRIBUTION_MONTHS.length - 1 : idx);
  })();

  const [selectedMonthIdx, setSelectedMonthIdx] = useState(defaultMonthIdx);
  const selectedMonth = CONTRIBUTION_MONTHS[selectedMonthIdx];

  const [data, setData] = useState<Record<FieldKey, string>>({});
  const [saveState, setSaveState] = useState<Record<FieldKey, SaveState>>({});
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    if (!contributor) return;
    fetch("/api/db/contribution")
      .then((r) => r.json())
      .then((raw: Record<string, number | string>) => {
        const init: Record<string, string> = {};
        for (const metric of METRICS) {
          for (const month of CONTRIBUTION_MONTHS) {
            const base = actualKey(id, metric.id, month);
            if (raw[base] !== undefined) init[base] = String(raw[base]);
            const nk = `${base}::notes`;
            if (raw[nk]) init[nk] = String(raw[nk]);
            const sk = `${base}::sources`;
            if (raw[sk]) init[sk] = String(raw[sk]);
          }
        }
        setData(init);
        setLoaded(true);
      })
      .catch(() => setLoaded(true));
  }, [id, contributor]);

  const saveField = useCallback(async (
    metricId: string,
    month: string,
    field: "value" | "notes" | "sources",
    rawValue: string,
  ) => {
    const base = actualKey(id, metricId, month);
    const fieldKey = field === "value" ? base : `${base}::${field}`;

    setSaveState((p) => ({ ...p, [fieldKey]: "saving" }));

    const body: Record<string, any> = { contributorId: id, metricId, month };
    if (field === "value") body.value = parseFloat(rawValue.replace(/[^0-9.]/g, "")) || 0;
    else body[field] = rawValue;

    try {
      await fetch("/api/db/contribution", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      setSaveState((p) => ({ ...p, [fieldKey]: "saved" }));
      setTimeout(() => setSaveState((p) => ({ ...p, [fieldKey]: "idle" })), 2000);
    } catch {
      setSaveState((p) => ({ ...p, [fieldKey]: "idle" }));
    }
  }, [id]);

  const handleChange = useCallback((fieldKey: string, value: string) => {
    setData((p) => ({ ...p, [fieldKey]: value }));
  }, []);

  if (!contributor) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-500 mb-4">Contributor not found.</p>
          <Link href="/contribution" className="text-blue-600 hover:underline">Back to tracker</Link>
        </div>
      </div>
    );
  }

  const accent = TEAM_ACCENT[contributor.color];

  function SaveIndicator({ fieldKey }: { fieldKey: string }) {
    const s = saveState[fieldKey] ?? "idle";
    if (s === "saving") return <Loader2 className="w-3 h-3 animate-spin text-gray-400 flex-shrink-0" />;
    if (s === "saved") return <Check className="w-3 h-3 text-emerald-500 flex-shrink-0" />;
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-6 py-8">

        <div className="flex items-center gap-4 mb-6">
          <Link href="/contribution" className="text-gray-400 hover:text-gray-600 transition-colors p-1">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div className="flex items-center gap-3 flex-1">
            <div className="w-10 h-10 flex-shrink-0">
              {contributor.photo ? (
                <Image src={contributor.photo} alt={contributor.name} width={40} height={40} className="rounded-full object-cover w-10 h-10" />
              ) : (
                <div className={`w-10 h-10 rounded-full ${accent.bg} flex items-center justify-center text-white font-bold text-sm`}>
                  {contributor.name[0]}
                </div>
              )}
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">{contributor.name}</h1>
              <p className="text-sm text-gray-500">{contributor.team} · Monthly Attainment</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <label className="text-sm font-medium text-gray-600">Month</label>
            <select
              value={selectedMonthIdx}
              onChange={(e) => setSelectedMonthIdx(Number(e.target.value))}
              className="text-sm font-semibold border border-gray-200 rounded-lg px-3 py-2 bg-white text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm"
            >
              {CONTRIBUTION_MONTHS.map((m, i) => (
                <option key={m} value={i}>
                  {CONTRIBUTION_MONTH_LABELS[i]} 2026
                </option>
              ))}
            </select>
          </div>
        </div>

        {!loaded ? (
          <div className="flex items-center justify-center py-20 text-gray-400">
            <Loader2 className="w-6 h-6 animate-spin mr-2" />
            Loading...
          </div>
        ) : (
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="px-6 py-3 bg-gray-50 border-b border-gray-200 flex items-center justify-between">
              <h2 className="text-sm font-bold text-gray-700 uppercase tracking-wide">
                {CONTRIBUTION_MONTH_LABELS[selectedMonthIdx]} 2026 — Goals & Attainment
              </h2>
              <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${accent.badge}`}>
                {contributor.name} · {contributor.team}
              </span>
            </div>

            <table className="w-full text-sm border-collapse">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50/50">
                  <th className="text-left px-6 py-3 text-[11px] font-semibold text-gray-400 uppercase tracking-wider w-48">Goal</th>
                  <th className="text-center px-4 py-3 text-[11px] font-semibold text-gray-400 uppercase tracking-wider w-48">Attainment</th>
                  <th className="text-left px-4 py-3 text-[11px] font-semibold text-gray-400 uppercase tracking-wider">Notes</th>
                  <th className="text-left px-4 py-3 text-[11px] font-semibold text-gray-400 uppercase tracking-wider w-64">Sources / Links</th>
                </tr>
              </thead>
              <tbody>
                {METRICS.map((metric, mi) => {
                  const monthIdx = CONTRIBUTION_MONTHS.indexOf(selectedMonth);
                  const goal = GOALS[contributor.id as ContributorId]?.[metric.id as MetricId]?.[monthIdx] ?? 0;
                  const base = actualKey(id, metric.id, selectedMonth);
                  const notesKey = `${base}::notes`;
                  const sourcesKey = `${base}::sources`;

                  const rawActual = data[base] ?? "";
                  const numActual = parseFloat(rawActual) || 0;
                  const hasActual = rawActual !== "";
                  const attainPct = goal === 0 ? (numActual === 0 ? 100 : 0) : Math.round((numActual / goal) * 100);

                  const notes = data[notesKey] ?? "";
                  const sources = data[sourcesKey] ?? "";

                  return (
                    <tr key={metric.id} className={`border-b border-gray-100 ${mi % 2 === 0 ? "bg-white" : "bg-gray-50/30"}`}>
                      <td className="px-6 py-4 align-top">
                        <div className="font-semibold text-gray-800 text-sm leading-tight">{metric.label}</div>
                        <div className="text-[11px] text-gray-400 mt-0.5">{metric.description}</div>
                        <div className="text-[11px] text-gray-400 mt-1">
                          Goal: <span className="font-medium text-gray-600">{fmtVal(goal, metric.format)}</span>
                        </div>
                      </td>

                      <td className="px-4 py-4 align-top">
                        <div className="flex flex-col items-center gap-1.5">
                          <input
                            type="number"
                            min={0}
                            step={metric.format === "currency" ? 100 : 1}
                            value={rawActual}
                            placeholder="0"
                            onChange={(e) => handleChange(base, e.target.value)}
                            onBlur={() => { if (rawActual !== "") saveField(metric.id, selectedMonth, "value", rawActual); }}
                            onKeyDown={(e) => { if (e.key === "Enter") saveField(metric.id, selectedMonth, "value", rawActual); }}
                            className="w-32 text-center text-sm font-semibold border border-gray-200 rounded-lg px-3 py-2 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-colors [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                          />
                          <div className="flex items-center gap-1.5">
                            <span className={`text-base font-bold ${pctColor(attainPct, hasActual)}`}>
                              {hasActual ? `${attainPct}%` : "—"}
                            </span>
                            <SaveIndicator fieldKey={base} />
                          </div>
                          {hasActual && (
                            <div className="text-[11px] text-gray-400">
                              {fmtVal(numActual, metric.format)} of {fmtVal(goal, metric.format)}
                            </div>
                          )}
                        </div>
                      </td>

                      <td className="px-4 py-4 align-top">
                        <div className="flex items-start gap-1.5">
                          <textarea
                            rows={3}
                            value={notes}
                            placeholder="Explain under/over achievement…"
                            onChange={(e) => handleChange(notesKey, e.target.value)}
                            onBlur={() => saveField(metric.id, selectedMonth, "notes", notes)}
                            className="w-full text-sm text-gray-700 border border-gray-200 rounded-lg px-3 py-2 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-colors resize-none placeholder:text-gray-300"
                          />
                          <div className="pt-2">
                            <SaveIndicator fieldKey={notesKey} />
                          </div>
                        </div>
                      </td>

                      <td className="px-4 py-4 align-top">
                        <div className="flex items-start gap-1.5">
                          <input
                            type="text"
                            value={sources}
                            placeholder="SFDC link, doc URL…"
                            onChange={(e) => handleChange(sourcesKey, e.target.value)}
                            onBlur={() => saveField(metric.id, selectedMonth, "sources", sources)}
                            onKeyDown={(e) => { if (e.key === "Enter") saveField(metric.id, selectedMonth, "sources", sources); }}
                            className="w-full text-sm text-gray-700 border border-gray-200 rounded-lg px-3 py-2 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-colors placeholder:text-gray-300"
                          />
                          <div className="pt-2">
                            <SaveIndicator fieldKey={sourcesKey} />
                          </div>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>

            <div className="px-6 py-3 bg-gray-50 border-t border-gray-100">
              <p className="text-xs text-gray-400">
                Changes save automatically when you move between fields or press Enter.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
