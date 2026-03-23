"use client";

import React, { useEffect, useState, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  CONTRIBUTORS,
  METRICS,
  GOALS,
  CONTRIBUTION_MONTHS,
  CONTRIBUTION_MONTH_LABELS,
  actualKey,
  type ContributionMonth,
  type ContributorId,
  type ContributorInfo,
  type MetricId,
} from "@/lib/contribution/data";
import { Lock, LockOpen, ShieldCheck, Check, Loader2, Edit2 } from "lucide-react";

const TEAM_ACCENT: Record<string, { bg: string; badge: string; border: string }> = {
  cs:      { bg: "bg-teal-600",    badge: "bg-teal-50 text-teal-800 border-teal-200",    border: "border-teal-200" },
  sales:   { bg: "bg-orange-600",  badge: "bg-orange-50 text-orange-800 border-orange-200", border: "border-orange-200" },
  partner: { bg: "bg-emerald-600", badge: "bg-emerald-50 text-emerald-800 border-emerald-200", border: "border-emerald-200" },
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

type LockMap = Record<string, { isLocked: boolean; hasPassword: boolean }>;
type ActualsMap = Record<string, number | string>;
type SaveState = "idle" | "saving" | "saved";

export default function ContributorAccessPage() {
  const [locks, setLocks] = useState<LockMap>({});
  const [actuals, setActuals] = useState<ActualsMap>({});
  const [saveStates, setSaveStates] = useState<Record<string, SaveState>>({});
  const [resetting, setResetting] = useState<string | null>(null);
  const [editContributor, setEditContributor] = useState<string | null>(null);
  const [editMonthIdx, setEditMonthIdx] = useState(() => {
    const now = new Date();
    const nowYM = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
    const idx = CONTRIBUTION_MONTHS.findIndex((m) => m >= nowYM);
    return Math.max(0, idx === -1 ? CONTRIBUTION_MONTHS.length - 1 : idx);
  });
  const [localData, setLocalData] = useState<Record<string, string>>({});

  const fetchLocks = useCallback(async () => {
    const res = await fetch("/api/db/contribution/lock");
    setLocks(await res.json());
  }, []);

  const fetchActuals = useCallback(async () => {
    const res = await fetch("/api/db/contribution");
    setActuals(await res.json());
  }, []);

  useEffect(() => {
    fetchLocks();
    fetchActuals();
  }, [fetchLocks, fetchActuals]);

  useEffect(() => {
    if (!editContributor) return;
    const init: Record<string, string> = {};
    for (const metric of METRICS) {
      for (const month of CONTRIBUTION_MONTHS) {
        const base = actualKey(editContributor, metric.id, month);
        if (actuals[base] !== undefined) init[base] = String(actuals[base]);
        const nk = `${base}::notes`;
        if (actuals[nk]) init[nk] = String(actuals[nk]);
      }
    }
    setLocalData(init);
  }, [editContributor, actuals]);

  const handleReset = async (contributorId: string) => {
    if (!confirm(`Reset the lock for ${CONTRIBUTORS.find(c => c.id === contributorId)?.name}? This will clear their password and unlock their page.`)) return;
    setResetting(contributorId);
    try {
      await fetch("/api/db/contribution/lock", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "admin-reset", contributorId, adminPassword: "itmethods" }),
      });
      await fetchLocks();
    } finally {
      setResetting(null);
    }
  };

  const saveField = async (
    contributorId: string,
    metricId: string,
    month: string,
    field: "value" | "notes",
    rawValue: string,
  ) => {
    const base = actualKey(contributorId, metricId, month);
    const fieldKey = field === "value" ? base : `${base}::${field}`;
    setSaveStates(p => ({ ...p, [fieldKey]: "saving" }));
    const body: Record<string, any> = { contributorId, metricId, month };
    if (field === "value") body.value = parseFloat(rawValue.replace(/[^0-9.]/g, "")) || 0;
    else body[field] = rawValue;
    try {
      await fetch("/api/db/contribution", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      setSaveStates(p => ({ ...p, [fieldKey]: "saved" }));
      setTimeout(() => setSaveStates(p => ({ ...p, [fieldKey]: "idle" })), 2000);
      await fetchActuals();
    } catch {
      setSaveStates(p => ({ ...p, [fieldKey]: "idle" }));
    }
  };

  function SaveIcon({ k }: { k: string }) {
    const s = saveStates[k] ?? "idle";
    if (s === "saving") return <Loader2 className="w-3 h-3 animate-spin text-gray-400" />;
    if (s === "saved") return <Check className="w-3 h-3 text-emerald-500" />;
    return null;
  }

  const editMonth = CONTRIBUTION_MONTHS[editMonthIdx] as ContributionMonth;
  const editContributorObj = CONTRIBUTORS.find(c => c.id === editContributor) as ContributorInfo | undefined;

  return (
    <div className="max-w-4xl mx-auto px-6 py-8">
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-1">
          <ShieldCheck className="w-5 h-5 text-blue-600" />
          <h1 className="text-xl font-bold text-gray-900">Contributor Access</h1>
        </div>
        <p className="text-sm text-gray-500">Manage contributor page locks and edit attainment data directly.</p>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm mb-8">
        <div className="px-6 py-4 border-b border-gray-100">
          <h2 className="text-sm font-bold text-gray-700 uppercase tracking-wide">Page Locks</h2>
        </div>
        <div className="divide-y divide-gray-100">
          {CONTRIBUTORS.map((c) => {
            const lock = locks[c.id];
            const accent = TEAM_ACCENT[c.color];
            const isLocked = lock?.isLocked ?? false;

            return (
              <div key={c.id} className="flex items-center gap-4 px-6 py-4">
                <div className="w-10 h-10 flex-shrink-0">
                  {c.photo ? (
                    <Image src={c.photo} alt={c.name} width={40} height={40} className="rounded-full object-cover w-10 h-10" />
                  ) : (
                    <div className={`w-10 h-10 rounded-full ${accent.bg} flex items-center justify-center text-white font-bold text-sm`}>
                      {c.name[0]}
                    </div>
                  )}
                </div>
                <div className="flex-1">
                  <div className="font-semibold text-gray-800 text-sm">{c.name}</div>
                  <div className="text-xs text-gray-400">{c.team}</div>
                </div>
                <div className="flex items-center gap-3">
                  {isLocked ? (
                    <span className="flex items-center gap-1.5 text-xs font-medium text-amber-700 bg-amber-50 border border-amber-200 px-2.5 py-1 rounded-full">
                      <Lock className="w-3 h-3" /> Locked
                    </span>
                  ) : (
                    <span className="flex items-center gap-1.5 text-xs font-medium text-gray-500 bg-gray-50 border border-gray-200 px-2.5 py-1 rounded-full">
                      <LockOpen className="w-3 h-3" /> Unlocked
                    </span>
                  )}
                  {isLocked && (
                    <button
                      onClick={() => handleReset(c.id)}
                      disabled={resetting === c.id}
                      className="text-xs font-medium text-red-600 bg-red-50 border border-red-200 px-3 py-1.5 rounded-lg hover:bg-red-100 transition-colors disabled:opacity-60 flex items-center gap-1.5"
                    >
                      {resetting === c.id ? <Loader2 className="w-3 h-3 animate-spin" /> : null}
                      Reset Lock
                    </button>
                  )}
                  <button
                    onClick={() => setEditContributor(editContributor === c.id ? null : c.id)}
                    className={`flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-lg border transition-colors ${editContributor === c.id ? "bg-blue-600 text-white border-blue-600" : "text-blue-700 bg-blue-50 border-blue-200 hover:bg-blue-100"}`}
                  >
                    <Edit2 className="w-3 h-3" />
                    {editContributor === c.id ? "Close Editor" : "Edit Records"}
                  </button>
                  <Link
                    href={`/contribution/edit/${c.id}`}
                    className="text-xs font-medium text-gray-500 hover:text-gray-700 transition-colors"
                  >
                    View page →
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {editContributor && editContributorObj && (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
          <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 flex-shrink-0">
                {editContributorObj.photo ? (
                  <Image src={editContributorObj.photo} alt={editContributorObj.name} width={32} height={32} className="rounded-full object-cover w-8 h-8" />
                ) : (
                  <div className={`w-8 h-8 rounded-full ${TEAM_ACCENT[editContributorObj.color].bg} flex items-center justify-center text-white font-bold text-xs`}>
                    {editContributorObj.name[0]}
                  </div>
                )}
              </div>
              <div>
                <h2 className="text-sm font-bold text-gray-700">
                  Editing: {editContributorObj.name} — {editContributorObj.team}
                </h2>
                <p className="text-xs text-gray-400">Admin override — changes save immediately</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <label className="text-xs font-medium text-gray-500">Month</label>
              <select
                value={editMonthIdx}
                onChange={(e) => setEditMonthIdx(Number(e.target.value))}
                className="text-sm font-semibold border border-gray-200 rounded-lg px-3 py-1.5 bg-white text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {CONTRIBUTION_MONTHS.map((m, i) => (
                  <option key={m} value={i}>{CONTRIBUTION_MONTH_LABELS[i]} 2026</option>
                ))}
              </select>
            </div>
          </div>

          <table className="w-full text-sm border-collapse">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50/50">
                <th className="text-left px-6 py-2.5 text-[11px] font-semibold text-gray-400 uppercase tracking-wider w-44">Goal</th>
                <th className="text-center px-4 py-2.5 text-[11px] font-semibold text-gray-400 uppercase tracking-wider w-28">Goal Value</th>
                <th className="text-center px-4 py-2.5 text-[11px] font-semibold text-gray-400 uppercase tracking-wider w-36">Actual</th>
                <th className="text-left px-4 py-2.5 text-[11px] font-semibold text-gray-400 uppercase tracking-wider">Notes</th>
              </tr>
            </thead>
            <tbody>
              {METRICS.map((metric, mi) => {
                const monthIdx = CONTRIBUTION_MONTHS.indexOf(editMonth);
                const goal = GOALS[editContributor as ContributorId]?.[metric.id as MetricId]?.[monthIdx] ?? 0;
                const base = actualKey(editContributor, metric.id, editMonth);
                const notesKey = `${base}::notes`;
                const rawActual = localData[base] ?? "";
                const notes = localData[notesKey] ?? "";

                return (
                  <tr key={metric.id} className={`border-b border-gray-100 ${mi % 2 === 0 ? "bg-white" : "bg-gray-50/30"}`}>
                    <td className="px-6 py-3 align-middle">
                      <div className="font-semibold text-gray-800 text-sm">{metric.label}</div>
                    </td>
                    <td className="px-4 py-3 text-center align-middle">
                      <span className="text-sm font-medium text-gray-500">{fmtVal(goal, metric.format)}</span>
                    </td>
                    <td className="px-4 py-3 align-middle">
                      <div className="flex items-center justify-center gap-1.5">
                        <input
                          type="number"
                          min={0}
                          step={metric.format === "currency" ? 100 : 1}
                          value={rawActual}
                          placeholder="0"
                          onChange={(e) => setLocalData(p => ({ ...p, [base]: e.target.value }))}
                          onBlur={() => { if (rawActual !== "") saveField(editContributor, metric.id, editMonth, "value", rawActual); }}
                          onKeyDown={(e) => { if (e.key === "Enter") saveField(editContributor, metric.id, editMonth, "value", rawActual); }}
                          className="w-28 text-center text-sm font-semibold border border-gray-200 rounded-lg px-3 py-1.5 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-colors [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                        />
                        <SaveIcon k={base} />
                      </div>
                    </td>
                    <td className="px-4 py-3 align-middle">
                      <div className="flex items-center gap-1.5">
                        <input
                          type="text"
                          value={notes}
                          placeholder="Notes…"
                          onChange={(e) => setLocalData(p => ({ ...p, [notesKey]: e.target.value }))}
                          onBlur={() => saveField(editContributor, metric.id, editMonth, "notes", notes)}
                          onKeyDown={(e) => { if (e.key === "Enter") saveField(editContributor, metric.id, editMonth, "notes", notes); }}
                          className="w-full text-sm text-gray-700 border border-gray-200 rounded-lg px-3 py-1.5 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-colors placeholder:text-gray-300"
                        />
                        <SaveIcon k={notesKey} />
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          <div className="px-6 py-3 bg-gray-50 border-t border-gray-100 rounded-b-xl">
            <p className="text-xs text-gray-400">Admin edits bypass contributor locks and save immediately.</p>
          </div>
        </div>
      )}
    </div>
  );
}
