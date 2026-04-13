'use client';

import { useMarketing } from '@/lib/sales-motion/marketing/MarketingContext';
import { ATTENDANCE_OPTIONS } from '@/lib/sales-motion/marketing/types';
import type { AttendanceStatus } from '@/lib/sales-motion/marketing/types';
import { EditableField } from '@/components/sales-motion/shared/EditableField';
import { SelectDropdown } from '@/components/sales-motion/shared/SelectDropdown';
import { AttendanceBadge } from '../shared/StatusBadge';
import { Plus, Trash2, ExternalLink } from 'lucide-react';

export function EventsSection() {
  const { state, dispatch } = useMarketing();
  const rows = state.events;

  const addRow = () => {
    dispatch({
      type: 'ADD_ROW',
      section: 'events',
      row: { id: crypto.randomUUID(), name: '', link: '', attendance: '', eventDate: '', location: '', owner: '', budget: '', notes: '' },
    });
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

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="bg-gray-50 text-left">
            <th className="px-4 py-2.5 font-medium text-gray-500 w-[200px]">Event</th>
            <th className="px-4 py-2.5 font-medium text-gray-500 w-[100px]">Date</th>
            <th className="px-4 py-2.5 font-medium text-gray-500 w-[130px]">Status</th>
            <th className="px-4 py-2.5 font-medium text-gray-500 w-[120px]">Location</th>
            <th className="px-4 py-2.5 font-medium text-gray-500 w-[100px]">Owner</th>
            <th className="px-4 py-2.5 font-medium text-gray-500 w-[80px]">Budget</th>
            <th className="px-4 py-2.5 font-medium text-gray-500 w-[60px]">Link</th>
            <th className="px-4 py-2.5 font-medium text-gray-500">Notes</th>
            <th className="px-4 py-2.5 w-[40px]" />
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.id} className="border-t border-gray-100 hover:bg-gray-50/50">
              <td className="px-4 py-2">
                <EditableField value={row.name} onSave={(v) => update(row.id, 'name', v)} placeholder="Event name" className="text-sm font-medium" />
              </td>
              <td className="px-4 py-2">
                <input type="date" value={row.eventDate} onChange={(e) => update(row.id, 'eventDate', e.target.value)} className="border border-gray-300 rounded px-1.5 py-0.5 text-xs bg-white w-full" />
              </td>
              <td className="px-4 py-2">
                <SelectDropdown value={row.attendance as AttendanceStatus} options={ATTENDANCE_OPTIONS} onChange={(v) => update(row.id, 'attendance', v)} />
              </td>
              <td className="px-4 py-2">
                <EditableField value={row.location} onSave={(v) => update(row.id, 'location', v)} placeholder="Location" className="text-xs" />
              </td>
              <td className="px-4 py-2">
                <EditableField value={row.owner} onSave={(v) => update(row.id, 'owner', v)} placeholder="Owner" className="text-xs" />
              </td>
              <td className="px-4 py-2">
                <EditableField value={row.budget} onSave={(v) => update(row.id, 'budget', v)} placeholder="$0" className="text-xs" />
              </td>
              <td className="px-4 py-2 text-center">
                {row.link ? (
                  <a href={row.link} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:text-blue-700">
                    <ExternalLink size={14} />
                  </a>
                ) : (
                  <EditableField value={row.link} onSave={(v) => update(row.id, 'link', v)} placeholder="URL" className="text-xs" />
                )}
              </td>
              <td className="px-4 py-2">
                <EditableField value={row.notes} onSave={(v) => update(row.id, 'notes', v)} placeholder="Notes" className="text-xs" />
              </td>
              <td className="px-4 py-2">
                <button onClick={() => remove(row.id)} className="text-gray-300 hover:text-red-500 transition-colors"><Trash2 size={14} /></button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <div className="px-4 py-3 border-t border-gray-100">
        <button onClick={addRow} className="inline-flex items-center gap-1.5 text-xs text-gray-500 hover:text-blue-600">
          <Plus size={12} /> Add Event
        </button>
      </div>
    </div>
  );
}
