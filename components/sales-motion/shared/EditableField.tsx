'use client';

import { useState, useRef, useEffect } from 'react';

interface EditableFieldProps {
  value: string;
  onSave: (value: string) => void;
  placeholder?: string;
  className?: string;
  multiline?: boolean;
  disabled?: boolean;
}

export function EditableField({ value, onSave, placeholder = 'Click to edit', className = '', multiline = false, disabled = false }: EditableFieldProps) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(value);
  const inputRef = useRef<HTMLInputElement | HTMLTextAreaElement>(null);

  useEffect(() => {
    if (editing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [editing]);

  useEffect(() => { setDraft(value); }, [value]);

  const commit = () => {
    setEditing(false);
    if (draft !== value) onSave(draft);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !multiline) { e.preventDefault(); commit(); }
    if (e.key === 'Escape') { setDraft(value); setEditing(false); }
  };

  if (disabled) {
    return (
      <span className={`inline-block min-w-[2rem] ${!value ? 'text-gray-400 italic' : ''} ${className}`}>
        {value || placeholder}
      </span>
    );
  }

  if (!editing) {
    return (
      <span
        className={`cursor-pointer hover:bg-gray-100 rounded px-1 py-0.5 min-w-[2rem] inline-block ${!value ? 'text-gray-400 italic' : ''} ${className}`}
        onClick={() => setEditing(true)}
        tabIndex={0}
        onKeyDown={(e) => { if (e.key === 'Enter') setEditing(true); }}
      >
        {value || placeholder}
      </span>
    );
  }

  if (multiline) {
    return (
      <textarea
        ref={inputRef as React.RefObject<HTMLTextAreaElement>}
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        onBlur={commit}
        onKeyDown={handleKeyDown}
        className={`border border-blue-400 rounded px-1 py-0.5 text-sm w-full min-h-[3rem] outline-none ${className}`}
      />
    );
  }

  return (
    <input
      ref={inputRef as React.RefObject<HTMLInputElement>}
      type="text"
      value={draft}
      onChange={(e) => setDraft(e.target.value)}
      onBlur={commit}
      onKeyDown={handleKeyDown}
      className={`border border-blue-400 rounded px-1 py-0.5 text-sm w-full outline-none ${className}`}
    />
  );
}
