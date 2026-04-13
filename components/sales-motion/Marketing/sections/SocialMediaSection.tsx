'use client';

import { useMarketing } from '@/lib/sales-motion/marketing/MarketingContext';
import { CAMPAIGN_STATUS_OPTIONS } from '@/lib/sales-motion/marketing/types';
import type { CampaignStatus } from '@/lib/sales-motion/marketing/types';
import { EditableField } from '@/components/sales-motion/shared/EditableField';
import { SelectDropdown } from '@/components/sales-motion/shared/SelectDropdown';
import { Plus, Trash2 } from 'lucide-react';

export function SocialMediaSection() {
  const { state, dispatch } = useMarketing();
  const rows = state.socialMedia;

  const addRow = () => {
    dispatch({
      type: 'ADD_ROW',
      section: 'socialMedia',
      row: { id: crypto.randomUUID(), platform: 'LinkedIn', campaignName: '', status: '', postDate: '', reach: '', engagement: '', clicks: '', notes: '' },
    });
  };

  const update = (id: string, field: string, value: string) => {
    dispatch({ type: 'UPDATE_ROW', section: 'socialMedia', id, field, value });
  };

  const remove = (id: string) => {
    dispatch({ type: 'DELETE_ROW', section: 'socialMedia', id });
  };

  if (rows.length === 0) {
    return (
      <div className="p-5 text-center">
        <p className="text-sm text-gray-400 mb-3">No social media campaigns tracked yet.</p>
        <button onClick={addRow} className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm text-blue-600 border border-dashed border-blue-300 rounded-lg hover:bg-blue-50">
          <Plus size={14} /> Add Campaign
        </button>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="bg-gray-50 text-left">
            <th className="px-4 py-2.5 font-medium text-gray-500 w-[100px]">Platform</th>
            <th className="px-4 py-2.5 font-medium text-gray-500 w-[180px]">Campaign</th>
            <th className="px-4 py-2.5 font-medium text-gray-500 w-[100px]">Status</th>
            <th className="px-4 py-2.5 font-medium text-gray-500 w-[100px]">Post Date</th>
            <th className="px-4 py-2.5 font-medium text-gray-500 w-[80px]">Reach</th>
            <th className="px-4 py-2.5 font-medium text-gray-500 w-[80px]">Engage.</th>
            <th className="px-4 py-2.5 font-medium text-gray-500 w-[60px]">Clicks</th>
            <th className="px-4 py-2.5 font-medium text-gray-500">Notes</th>
            <th className="px-4 py-2.5 w-[40px]" />
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.id} className="border-t border-gray-100 hover:bg-gray-50/50">
              <td className="px-4 py-2"><EditableField value={row.platform} onSave={(v) => update(row.id, 'platform', v)} placeholder="LinkedIn" className="text-xs" /></td>
              <td className="px-4 py-2"><EditableField value={row.campaignName} onSave={(v) => update(row.id, 'campaignName', v)} placeholder="Campaign name" className="text-sm font-medium" /></td>
              <td className="px-4 py-2"><SelectDropdown value={row.status as CampaignStatus} options={CAMPAIGN_STATUS_OPTIONS} onChange={(v) => update(row.id, 'status', v)} /></td>
              <td className="px-4 py-2"><input type="date" value={row.postDate} onChange={(e) => update(row.id, 'postDate', e.target.value)} className="border border-gray-300 rounded px-1.5 py-0.5 text-xs bg-white w-full" /></td>
              <td className="px-4 py-2"><EditableField value={row.reach} onSave={(v) => update(row.id, 'reach', v)} placeholder="0" className="text-xs" /></td>
              <td className="px-4 py-2"><EditableField value={row.engagement} onSave={(v) => update(row.id, 'engagement', v)} placeholder="0" className="text-xs" /></td>
              <td className="px-4 py-2"><EditableField value={row.clicks} onSave={(v) => update(row.id, 'clicks', v)} placeholder="0" className="text-xs" /></td>
              <td className="px-4 py-2"><EditableField value={row.notes} onSave={(v) => update(row.id, 'notes', v)} placeholder="Notes" className="text-xs" /></td>
              <td className="px-4 py-2"><button onClick={() => remove(row.id)} className="text-gray-300 hover:text-red-500 transition-colors"><Trash2 size={14} /></button></td>
            </tr>
          ))}
        </tbody>
      </table>
      <div className="px-4 py-3 border-t border-gray-100">
        <button onClick={addRow} className="inline-flex items-center gap-1.5 text-xs text-gray-500 hover:text-blue-600"><Plus size={12} /> Add Campaign</button>
      </div>
    </div>
  );
}
