'use client';

import { useMemo, useState } from 'react';
import { EditableField } from '@/components/sales-motion/shared/EditableField';
import { Users, Plus, Trash2, ChevronLeft, ChevronRight } from 'lucide-react';
import {
  CONTACT_TAG_OPTIONS,
  type ContactTag,
  type PartnerContact,
} from '@/lib/sales-motion/partner/types';
import { AddButton, Pill, Section, type SectionProps } from './_shared';

const PAGE_SIZE = 5;
type TagFilter = ContactTag | 'All';
const TAG_FILTERS: TagFilter[] = ['All', ...CONTACT_TAG_OPTIONS];

export function Contacts({ partner, updateField, readOnly }: SectionProps) {
  const [tagFilter, setTagFilter] = useState<TagFilter>('All');
  const [page, setPage] = useState(0);

  const filtered = useMemo(
    () =>
      partner.contacts.filter((c) => {
        if (tagFilter === 'All') return true;
        return c.tags.includes(tagFilter);
      }),
    [partner.contacts, tagFilter]
  );

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages - 1);
  const visible = filtered.slice(safePage * PAGE_SIZE, safePage * PAGE_SIZE + PAGE_SIZE);

  const updateContact = (id: string, patch: Partial<PartnerContact>) => {
    const contacts = partner.contacts.map((c) => (c.id === id ? { ...c, ...patch } : c));
    updateField('contacts', contacts);
  };

  const toggleTag = (id: string, tag: ContactTag) => {
    const contact = partner.contacts.find((c) => c.id === id);
    if (!contact) return;
    const has = contact.tags.includes(tag);
    const tags = has ? contact.tags.filter((t) => t !== tag) : [...contact.tags, tag];
    updateContact(id, { tags });
  };

  const addContact = () => {
    const contacts: PartnerContact[] = [
      ...partner.contacts,
      {
        id: crypto.randomUUID(),
        name: '',
        role: '',
        email: '',
        phone: '',
        active: true,
        notes: '',
        tags: [],
      },
    ];
    updateField('contacts', contacts);
    // Jump to the page containing the newly added contact.
    setPage(Math.floor((partner.contacts.length) / PAGE_SIZE));
  };

  const removeContact = (id: string) => {
    updateField('contacts', partner.contacts.filter((c) => c.id !== id));
  };

  return (
    <Section icon={Users} title={`Contacts (${partner.contacts.length})`} color="bg-teal-100 text-teal-600">
      {/* Tag filter */}
      <div className="flex items-center gap-1.5 flex-wrap">
        {TAG_FILTERS.map((t) => (
          <Pill
            key={t}
            active={tagFilter === t}
            onClick={() => {
              setTagFilter(t);
              setPage(0);
            }}
          >
            {t}
          </Pill>
        ))}
      </div>

      {visible.length === 0 ? (
        <p className="text-sm text-gray-400 italic">
          {partner.contacts.length === 0 ? 'No contacts yet.' : 'No contacts match this filter.'}
        </p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left bg-gray-50">
                <th className="px-3 py-2 text-xs font-semibold text-gray-500">Name</th>
                <th className="px-3 py-2 text-xs font-semibold text-gray-500">Role</th>
                <th className="px-3 py-2 text-xs font-semibold text-gray-500">Email</th>
                <th className="px-3 py-2 text-xs font-semibold text-gray-500">Phone</th>
                <th className="px-3 py-2 text-xs font-semibold text-gray-500">Tags</th>
                <th className="px-3 py-2 text-xs font-semibold text-gray-500">Notes</th>
                <th className="px-3 py-2 w-[40px]" />
              </tr>
            </thead>
            <tbody>
              {visible.map((c) => (
                <tr key={c.id} className="border-t border-gray-100 align-top">
                  <td className="px-3 py-2">
                    <EditableField value={c.name} onSave={(v) => updateContact(c.id, { name: v })} placeholder="Name" className="text-sm font-medium" disabled={readOnly} />
                  </td>
                  <td className="px-3 py-2">
                    <EditableField value={c.role} onSave={(v) => updateContact(c.id, { role: v })} placeholder="Role" className="text-xs" disabled={readOnly} />
                  </td>
                  <td className="px-3 py-2">
                    <EditableField value={c.email} onSave={(v) => updateContact(c.id, { email: v })} placeholder="email@…" className="text-xs" disabled={readOnly} />
                  </td>
                  <td className="px-3 py-2">
                    <EditableField value={c.phone} onSave={(v) => updateContact(c.id, { phone: v })} placeholder="Phone" className="text-xs" disabled={readOnly} />
                  </td>
                  <td className="px-3 py-2">
                    <div className="flex flex-wrap gap-1">
                      {CONTACT_TAG_OPTIONS.map((tag) => {
                        const active = c.tags.includes(tag);
                        return (
                          <button
                            type="button"
                            key={tag}
                            onClick={() => !readOnly && toggleTag(c.id, tag)}
                            disabled={readOnly}
                            className={`text-[10px] px-1.5 py-0.5 rounded border transition-colors ${
                              active
                                ? 'bg-purple-600 text-white border-purple-600'
                                : 'bg-white text-gray-500 border-gray-200 hover:bg-gray-50'
                            } ${readOnly ? 'cursor-default' : ''}`}
                          >
                            {tag}
                          </button>
                        );
                      })}
                    </div>
                  </td>
                  <td className="px-3 py-2">
                    <EditableField value={c.notes} onSave={(v) => updateContact(c.id, { notes: v })} placeholder="Notes" className="text-xs" disabled={readOnly} />
                  </td>
                  <td className="px-3 py-2">
                    {!readOnly && (
                      <button onClick={() => removeContact(c.id)} className="text-gray-300 hover:text-red-500" aria-label="Remove contact">
                        <Trash2 size={14} />
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Pagination */}
      {filtered.length > PAGE_SIZE && (
        <div className="flex items-center justify-between pt-2 text-xs text-gray-500">
          <span>
            Showing {safePage * PAGE_SIZE + 1}–
            {Math.min(filtered.length, (safePage + 1) * PAGE_SIZE)} of {filtered.length}
          </span>
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => setPage((p) => Math.max(0, p - 1))}
              disabled={safePage === 0}
              className="p-1 rounded hover:bg-gray-100 disabled:opacity-40 disabled:hover:bg-transparent"
              aria-label="Previous page"
            >
              <ChevronLeft size={14} />
            </button>
            <span>
              Page {safePage + 1} of {totalPages}
            </span>
            <button
              type="button"
              onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
              disabled={safePage >= totalPages - 1}
              className="p-1 rounded hover:bg-gray-100 disabled:opacity-40 disabled:hover:bg-transparent"
              aria-label="Next page"
            >
              <ChevronRight size={14} />
            </button>
          </div>
        </div>
      )}

      {!readOnly && (
        <AddButton onClick={addContact}>
          <Plus size={12} /> Add Contact
        </AddButton>
      )}
    </Section>
  );
}
