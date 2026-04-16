'use client';

import { useMemo, useState } from 'react';
import { FileText, Plus, Trash2, Check, X, Pencil } from 'lucide-react';
import type { PartnerNote } from '@/lib/sales-motion/partner/types';
import { Section, type SectionProps } from './_shared';

export function NotesFeed({ partner, updateField, readOnly }: SectionProps) {
  const [drafting, setDrafting] = useState(false);
  const [draftAuthor, setDraftAuthor] = useState('');
  const [draftBody, setDraftBody] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editBody, setEditBody] = useState('');

  const sorted = useMemo(
    () => [...partner.notesList].sort((a, b) => b.createdAt.localeCompare(a.createdAt)),
    [partner.notesList]
  );

  const beginDraft = () => {
    setDrafting(true);
    setDraftAuthor('');
    setDraftBody('');
  };

  const cancelDraft = () => {
    setDrafting(false);
    setDraftAuthor('');
    setDraftBody('');
  };

  const saveDraft = () => {
    if (!draftBody.trim()) return;
    const now = new Date().toISOString();
    const note: PartnerNote = {
      id: crypto.randomUUID(),
      body: draftBody.trim(),
      author: draftAuthor.trim(),
      createdAt: now,
      updatedAt: now,
    };
    updateField('notesList', [note, ...partner.notesList]);
    cancelDraft();
  };

  const beginEdit = (note: PartnerNote) => {
    setEditingId(note.id);
    setEditBody(note.body);
  };

  const saveEdit = () => {
    if (!editingId) return;
    const now = new Date().toISOString();
    const notesList = partner.notesList.map((n) =>
      n.id === editingId ? { ...n, body: editBody, updatedAt: now } : n
    );
    updateField('notesList', notesList);
    setEditingId(null);
    setEditBody('');
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditBody('');
  };

  const removeNote = (id: string) => {
    if (!confirm('Delete this note? This cannot be undone.')) return;
    updateField('notesList', partner.notesList.filter((n) => n.id !== id));
  };

  return (
    <Section icon={FileText} title={`Notes (${partner.notesList.length})`} color="bg-gray-100 text-gray-600">
      {!readOnly && !drafting && (
        <button
          type="button"
          onClick={beginDraft}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-purple-600 text-white rounded-lg hover:bg-purple-700"
        >
          <Plus size={12} /> Add Note
        </button>
      )}

      {drafting && !readOnly && (
        <div className="border border-purple-200 rounded-lg p-3 bg-purple-50 space-y-2">
          <input
            type="text"
            value={draftAuthor}
            onChange={(e) => setDraftAuthor(e.target.value)}
            placeholder="Your name (optional)"
            className="w-full border border-gray-300 rounded px-2 py-1 text-sm bg-white"
          />
          <textarea
            value={draftBody}
            onChange={(e) => setDraftBody(e.target.value)}
            placeholder="Write your note…"
            rows={4}
            autoFocus
            className="w-full border border-gray-300 rounded px-2 py-1.5 text-sm bg-white"
          />
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={saveDraft}
              disabled={!draftBody.trim()}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-40"
            >
              <Check size={12} /> Save Note
            </button>
            <button
              type="button"
              onClick={cancelDraft}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50"
            >
              <X size={12} /> Cancel
            </button>
          </div>
        </div>
      )}

      {sorted.length === 0 ? (
        <p className="text-sm text-gray-400 italic">No notes yet.</p>
      ) : (
        <ul className="space-y-3">
          {sorted.map((note) => {
            const editing = editingId === note.id;
            return (
              <li key={note.id} className="border border-gray-200 rounded-lg p-3 bg-white">
                <div className="flex items-center justify-between gap-2 mb-1.5 text-xs text-gray-500">
                  <span>
                    <span className="font-medium text-gray-700">{note.author || 'Unknown'}</span>
                    <span className="mx-1.5">·</span>
                    <span title={note.createdAt}>{formatDate(note.createdAt)}</span>
                    {note.updatedAt !== note.createdAt && (
                      <span className="ml-1.5 italic text-gray-400">(edited {formatDate(note.updatedAt)})</span>
                    )}
                  </span>
                  {!readOnly && !editing && (
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => beginEdit(note)}
                        className="text-gray-400 hover:text-purple-600 p-1"
                        aria-label="Edit note"
                      >
                        <Pencil size={12} />
                      </button>
                      <button
                        type="button"
                        onClick={() => removeNote(note.id)}
                        className="text-gray-400 hover:text-red-500 p-1"
                        aria-label="Delete note"
                      >
                        <Trash2 size={12} />
                      </button>
                    </div>
                  )}
                </div>
                {editing ? (
                  <div className="space-y-2">
                    <textarea
                      value={editBody}
                      onChange={(e) => setEditBody(e.target.value)}
                      rows={4}
                      autoFocus
                      className="w-full border border-gray-300 rounded px-2 py-1.5 text-sm bg-white"
                    />
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={saveEdit}
                        disabled={!editBody.trim()}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-40"
                      >
                        <Check size={12} /> Save
                      </button>
                      <button
                        type="button"
                        onClick={cancelEdit}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50"
                      >
                        <X size={12} /> Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <p className="text-sm text-gray-700 whitespace-pre-wrap break-words">{note.body}</p>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </Section>
  );
}

function formatDate(iso: string): string {
  try {
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return iso;
    return d.toLocaleString(undefined, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return iso;
  }
}
