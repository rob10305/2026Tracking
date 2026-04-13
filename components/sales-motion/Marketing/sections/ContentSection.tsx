'use client';

import { useMarketing } from '@/lib/sales-motion/marketing/MarketingContext';
import { CAMPAIGN_STATUS_OPTIONS, CONTENT_TYPE_OPTIONS } from '@/lib/sales-motion/marketing/types';
import type { CampaignStatus, ContentType } from '@/lib/sales-motion/marketing/types';
import { EditableField } from '@/components/sales-motion/shared/EditableField';
import { SelectDropdown } from '@/components/sales-motion/shared/SelectDropdown';
import { Plus, Trash2, ExternalLink } from 'lucide-react';

export function ContentSection() {
  const { state, dispatch } = useMarketing();
  const rows = state.content;

  const addRow = () => {
    dispatch({
      type: 'ADD_ROW',
      section: 'content',
      row: { id: crypto.randomUUID(), title: '', type: '', status: '', publishDate: '', author: '', targetKeywords: '', link: '', notes: '' },
    });
  };

  const update = (id: string, field: string, value: string) => {
    dispatch({ type: 'UPDATE_ROW', section: 'content', id, field, value });
  };

  const remove = (id: string) => {
    dispatch({ type: 'DELETE_ROW', section: 'content', id });
  };

  if (rows.length === 0) {
    return (
      <div className="p-5 text-center">
        <p className="text-sm text-gray-400 mb-3">No content items tracked yet.</p>
        <button onClick={addRow} className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm text-blue-600 border border-dashed border-blue-300 rounded-lg hover:bg-blue-50">
          <Plus size={14} /> Add Content
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
            <th className="px-4 py-2.5 font-medium text-gray-500 w-[110px]">Type</th>
            <th className="px-4 py-2.5 font-medium text-gray-500 w-[100px]">Status</th>
            <th className="px-4 py-2.5 font-medium text-gray-500 w-[100px]">Publish Date</th>
            <th className="px-4 py-2.5 font-medium text-gray-500 w-[90px]">Author</th>
            <th className="px-4 py-2.5 font-medium text-gray-500 w-[120px]">Keywords</th>
            <th className="px-4 py-2.5 font-medium text-gray-500 w-[50px]">Link</th>
            <th className="px-4 py-2.5 font-medium text-gray-500">Notes</th>
            <th className="px-4 py-2.5 w-[40px]" />
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.id} className="border-t border-gray-100 hover:bg-gray-50/50">
              <td className="px-4 py-2"><EditableField value={row.title} onSave={(v) => update(row.id, 'title', v)} placeholder="Title" className="text-sm font-medium" /></td>
              <td className="px-4 py-2"><SelectDropdown value={row.type as ContentType} options={CONTENT_TYPE_OPTIONS} onChange={(v) => update(row.id, 'type', v)} /></td>
              <td className="px-4 py-2"><SelectDropdown value={row.status as CampaignStatus} options={CAMPAIGN_STATUS_OPTIONS} onChange={(v) => update(row.id, 'status', v)} /></td>
              <td className="px-4 py-2"><input type="date" value={row.publishDate} onChange={(e) => update(row.id, 'publishDate', e.target.value)} className="border border-gray-300 rounded px-1.5 py-0.5 text-xs bg-white w-full" /></td>
              <td className="px-4 py-2"><EditableField value={row.author} onSave={(v) => update(row.id, 'author', v)} placeholder="Author" className="text-xs" /></td>
              <td className="px-4 py-2"><EditableField value={row.targetKeywords} onSave={(v) => update(row.id, 'targetKeywords', v)} placeholder="Keywords" className="text-xs" /></td>
              <td className="px-4 py-2 text-center">
                {row.link ? (
                  <a href={row.link} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:text-blue-700"><ExternalLink size={14} /></a>
                ) : (
                  <EditableField value={row.link} onSave={(v) => update(row.id, 'link', v)} placeholder="URL" className="text-xs" />
                )}
              </td>
              <td className="px-4 py-2"><EditableField value={row.notes} onSave={(v) => update(row.id, 'notes', v)} placeholder="Notes" className="text-xs" /></td>
              <td className="px-4 py-2"><button onClick={() => remove(row.id)} className="text-gray-300 hover:text-red-500 transition-colors"><Trash2 size={14} /></button></td>
            </tr>
          ))}
        </tbody>
      </table>
      <div className="px-4 py-3 border-t border-gray-100">
        <button onClick={addRow} className="inline-flex items-center gap-1.5 text-xs text-gray-500 hover:text-blue-600"><Plus size={12} /> Add Content</button>
      </div>
    </div>
  );
}
