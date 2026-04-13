'use client';

import { useMarketing } from '@/lib/sales-motion/marketing/MarketingContext';
import { CAMPAIGN_STATUS_OPTIONS } from '@/lib/sales-motion/marketing/types';
import type { CampaignStatus } from '@/lib/sales-motion/marketing/types';
import { EditableField } from '@/components/sales-motion/shared/EditableField';
import { SelectDropdown } from '@/components/sales-motion/shared/SelectDropdown';
import { Plus, Trash2, ExternalLink } from 'lucide-react';

export function WebinarsSection() {
  const { state, dispatch } = useMarketing();
  const rows = state.webinars;

  const addRow = () => {
    dispatch({
      type: 'ADD_ROW',
      section: 'webinars',
      row: { id: crypto.randomUUID(), title: '', date: '', status: '', platform: '', registrations: '', attendees: '', recordingLink: '', leads: '', notes: '' },
    });
  };

  const update = (id: string, field: string, value: string) => {
    dispatch({ type: 'UPDATE_ROW', section: 'webinars', id, field, value });
  };

  const remove = (id: string) => {
    dispatch({ type: 'DELETE_ROW', section: 'webinars', id });
  };

  if (rows.length === 0) {
    return (
      <div className="p-5 text-center">
        <p className="text-sm text-gray-400 mb-3">No webinars tracked yet.</p>
        <button onClick={addRow} className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm text-blue-600 border border-dashed border-blue-300 rounded-lg hover:bg-blue-50">
          <Plus size={14} /> Add Webinar
        </button>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="bg-gray-50 text-left">
            <th className="px-4 py-2.5 font-medium text-gray-500 w-[180px]">Title</th>
            <th className="px-4 py-2.5 font-medium text-gray-500 w-[100px]">Date</th>
            <th className="px-4 py-2.5 font-medium text-gray-500 w-[100px]">Status</th>
            <th className="px-4 py-2.5 font-medium text-gray-500 w-[100px]">Platform</th>
            <th className="px-4 py-2.5 font-medium text-gray-500 w-[70px]">Reg.</th>
            <th className="px-4 py-2.5 font-medium text-gray-500 w-[70px]">Attend.</th>
            <th className="px-4 py-2.5 font-medium text-gray-500 w-[60px]">Leads</th>
            <th className="px-4 py-2.5 font-medium text-gray-500 w-[50px]">Rec.</th>
            <th className="px-4 py-2.5 font-medium text-gray-500">Notes</th>
            <th className="px-4 py-2.5 w-[40px]" />
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.id} className="border-t border-gray-100 hover:bg-gray-50/50">
              <td className="px-4 py-2"><EditableField value={row.title} onSave={(v) => update(row.id, 'title', v)} placeholder="Webinar title" className="text-sm font-medium" /></td>
              <td className="px-4 py-2"><input type="date" value={row.date} onChange={(e) => update(row.id, 'date', e.target.value)} className="border border-gray-300 rounded px-1.5 py-0.5 text-xs bg-white w-full" /></td>
              <td className="px-4 py-2"><SelectDropdown value={row.status as CampaignStatus} options={CAMPAIGN_STATUS_OPTIONS} onChange={(v) => update(row.id, 'status', v)} /></td>
              <td className="px-4 py-2"><EditableField value={row.platform} onSave={(v) => update(row.id, 'platform', v)} placeholder="Zoom" className="text-xs" /></td>
              <td className="px-4 py-2"><EditableField value={row.registrations} onSave={(v) => update(row.id, 'registrations', v)} placeholder="0" className="text-xs" /></td>
              <td className="px-4 py-2"><EditableField value={row.attendees} onSave={(v) => update(row.id, 'attendees', v)} placeholder="0" className="text-xs" /></td>
              <td className="px-4 py-2"><EditableField value={row.leads} onSave={(v) => update(row.id, 'leads', v)} placeholder="0" className="text-xs" /></td>
              <td className="px-4 py-2 text-center">
                {row.recordingLink ? (
                  <a href={row.recordingLink} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:text-blue-700"><ExternalLink size={14} /></a>
                ) : (
                  <EditableField value={row.recordingLink} onSave={(v) => update(row.id, 'recordingLink', v)} placeholder="URL" className="text-xs" />
                )}
              </td>
              <td className="px-4 py-2"><EditableField value={row.notes} onSave={(v) => update(row.id, 'notes', v)} placeholder="Notes" className="text-xs" /></td>
              <td className="px-4 py-2"><button onClick={() => remove(row.id)} className="text-gray-300 hover:text-red-500 transition-colors"><Trash2 size={14} /></button></td>
            </tr>
          ))}
        </tbody>
      </table>
      <div className="px-4 py-3 border-t border-gray-100">
        <button onClick={addRow} className="inline-flex items-center gap-1.5 text-xs text-gray-500 hover:text-blue-600"><Plus size={12} /> Add Webinar</button>
      </div>
    </div>
  );
}
