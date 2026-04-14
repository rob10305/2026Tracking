'use client';

import { Fragment, useState, useMemo } from 'react';
import { useMarketing } from '@/lib/sales-motion/marketing/MarketingContext';
import { ATTENDANCE_OPTIONS } from '@/lib/sales-motion/marketing/types';
import type { AttendanceStatus, MarketingEvent } from '@/lib/sales-motion/marketing/types';
import { EditableField } from '@/components/sales-motion/shared/EditableField';
import { SelectDropdown } from '@/components/sales-motion/shared/SelectDropdown';
import { Plus, Trash2, ExternalLink, ChevronDown, ChevronRight } from 'lucide-react';

const COLSPAN = 8;

type QuarterKey = 'Q1' | 'Q2' | 'Q3' | 'Q4' | 'Unscheduled';

const QUARTER_ORDER: QuarterKey[] = ['Q1', 'Q2', 'Q3', 'Q4', 'Unscheduled'];

const QUARTER_COLORS: Record<QuarterKey, string> = {
  Q1: 'bg-blue-50 text-blue-700 border-blue-200',
  Q2: 'bg-green-50 text-green-700 border-green-200',
  Q3: 'bg-amber-50 text-amber-700 border-amber-200',
  Q4: 'bg-purple-50 text-purple-700 border-purple-200',
  Unscheduled: 'bg-gray-50 text-gray-600 border-gray-200',
};

function getQuarter(eventDate: string): QuarterKey {
  if (!eventDate) return 'Unscheduled';
  const m = eventDate.match(/^\d{4}-(\d{2})-\d{2}$/);
  if (!m) return 'Unscheduled';
  const month = parseInt(m[1], 10);
  if (month >= 1 && month <= 3) return 'Q1';
  if (month >= 4 && month <= 6) return 'Q2';
  if (month >= 7 && month <= 9) return 'Q3';
  if (month >= 10 && month <= 12) return 'Q4';
  return 'Unscheduled';
}

export function EventsSection() {
  const { state, dispatch } = useMarketing();
  const rows = state.events;

  const [open, setOpen] = useState<Record<QuarterKey, boolean>>({
    Q1: true, Q2: true, Q3: true, Q4: true, Unscheduled: true,
  });

  const grouped = useMemo(() => {
    const map: Record<QuarterKey, MarketingEvent[]> = { Q1: [], Q2: [], Q3: [], Q4: [], Unscheduled: [] };
    for (const e of rows) {
      map[getQuarter(e.eventDate)].push(e);
    }
    // sort each quarter by date
    for (const q of QUARTER_ORDER) {
      map[q].sort((a, b) => (a.eventDate || '9999').localeCompare(b.eventDate || '9999'));
    }
    return map;
  }, [rows]);

  const addRow = () => {
    dispatch({
      type: 'ADD_ROW',
      section: 'events',
      row: { id: crypto.randomUUID(), name: '', link: '', attendance: '', eventDate: '', location: '', owner: '', budget: '', notes: '' },
    });
    setOpen((o) => ({ ...o, Unscheduled: true }));
  };

  const update = (id: string, field: string, value: string) => {
    dispatch({ type: 'UPDATE_ROW', section: 'events', id, field, value });
  };

  const remove = (id: string) => {
    dispatch({ type: 'DELETE_ROW', section: 'events', id });
  };

  if (rows.length === 0) {
    return (
      <div className="p-5 text-center">
        <p className="text-sm text-gray-400 mb-3">No events tracked yet.</p>
        <button onClick={addRow} className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm text-blue-600 border border-dashed border-blue-300 rounded-lg hover:bg-blue-50">
          <Plus size={14} /> Add Event
        </button>
      </div>
    );
  }

  const renderEventRows = (events: MarketingEvent[]) => {
    if (events.length === 0) {
      return (
        <tr>
          <td colSpan={COLSPAN} className="px-4 py-4 text-center text-xs text-gray-400 italic">No events in this quarter.</td>
        </tr>
      );
    }
    return events.map((row, idx) => (
      <Fragment key={row.id}>
        {/* Main row */}
        <tr className={`${idx > 0 ? 'border-t border-gray-200' : ''} hover:bg-gray-50/30`}>
          <td className="px-4 pt-3 pb-1">
            <EditableField value={row.name} onSave={(v) => update(row.id, 'name', v)} placeholder="Event name" className="text-sm font-semibold text-gray-900" />
          </td>
          <td className="px-4 pt-3 pb-1">
            <input type="date" value={row.eventDate} onChange={(e) => update(row.id, 'eventDate', e.target.value)} className="border border-gray-300 rounded px-1.5 py-0.5 text-xs bg-white w-full" />
          </td>
          <td className="px-4 pt-3 pb-1">
            <SelectDropdown value={row.attendance as AttendanceStatus} options={ATTENDANCE_OPTIONS} onChange={(v) => update(row.id, 'attendance', v)} />
          </td>
          <td className="px-4 pt-3 pb-1">
            <EditableField value={row.location} onSave={(v) => update(row.id, 'location', v)} placeholder="Location" className="text-xs" />
          </td>
          <td className="px-4 pt-3 pb-1">
            <EditableField value={row.owner} onSave={(v) => update(row.id, 'owner', v)} placeholder="Owner" className="text-xs" />
          </td>
          <td className="px-4 pt-3 pb-1">
            <EditableField value={row.budget} onSave={(v) => update(row.id, 'budget', v)} placeholder="$0" className="text-xs" />
          </td>
          <td className="px-4 pt-3 pb-1 text-center">
            {row.link ? (
              <a href={row.link} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:text-blue-700 inline-flex">
                <ExternalLink size={14} />
              </a>
            ) : (
              <EditableField value={row.link} onSave={(v) => update(row.id, 'link', v)} placeholder="URL" className="text-xs" />
            )}
          </td>
          <td className="px-4 pt-3 pb-1">
            <button onClick={() => remove(row.id)} className="text-gray-300 hover:text-red-500 transition-colors"><Trash2 size={14} /></button>
          </td>
        </tr>
        {/* Notes row */}
        <tr className="hover:bg-gray-50/30">
          <td colSpan={COLSPAN} className="px-4 pb-3 pt-1">
            <div className="flex items-start gap-2">
              <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest mt-1 shrink-0">Notes</span>
              <div className="flex-1 min-w-0">
                <EditableField
                  value={row.notes}
                  onSave={(v) => update(row.id, 'notes', v)}
                  placeholder="Add notes — focus, why attend, partners, deadlines, etc."
                  className="text-xs text-gray-600 leading-relaxed block w-full whitespace-pre-wrap break-words"
                  multiline
                />
              </div>
            </div>
          </td>
        </tr>
      </Fragment>
    ));
  };

  return (
    <div>
      {QUARTER_ORDER.map((q) => {
        const events = grouped[q];
        if (events.length === 0 && q === 'Unscheduled') return null;
        const isOpen = open[q];
        return (
          <div key={q} className="border-t border-gray-200 first:border-t-0">
            <button
              onClick={() => setOpen((o) => ({ ...o, [q]: !o[q] }))}
              className="w-full flex items-center gap-3 px-5 py-3 hover:bg-gray-50 transition-colors text-left"
            >
              <span className={`px-2.5 py-1 rounded-md text-xs font-bold border ${QUARTER_COLORS[q]}`}>{q}</span>
              <span className="text-sm font-semibold text-gray-700 flex-1">
                {q === 'Unscheduled' ? 'Unscheduled / No Date' : `${q} 2026`}
              </span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-gray-100 text-gray-600">{events.length}</span>
              {isOpen ? <ChevronDown size={16} className="text-gray-400" /> : <ChevronRight size={16} className="text-gray-400" />}
            </button>

            {isOpen && (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-gray-50 text-left">
                      <th className="px-4 py-2 font-medium text-gray-500 text-xs">Event</th>
                      <th className="px-4 py-2 font-medium text-gray-500 text-xs w-[130px]">Date</th>
                      <th className="px-4 py-2 font-medium text-gray-500 text-xs w-[140px]">Status</th>
                      <th className="px-4 py-2 font-medium text-gray-500 text-xs w-[160px]">Location</th>
                      <th className="px-4 py-2 font-medium text-gray-500 text-xs w-[110px]">Owner</th>
                      <th className="px-4 py-2 font-medium text-gray-500 text-xs w-[100px]">Budget</th>
                      <th className="px-4 py-2 font-medium text-gray-500 text-xs w-[60px]">Link</th>
                      <th className="px-4 py-2 text-xs w-[40px]" />
                    </tr>
                  </thead>
                  <tbody>{renderEventRows(events)}</tbody>
                </table>
              </div>
            )}
          </div>
        );
      })}

      <div className="px-4 py-3 border-t border-gray-200">
        <button onClick={addRow} className="inline-flex items-center gap-1.5 text-xs text-gray-500 hover:text-blue-600">
          <Plus size={12} /> Add Event
        </button>
      </div>
    </div>
  );
}
