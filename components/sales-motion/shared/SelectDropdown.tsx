'use client';

interface SelectDropdownProps<T extends string> {
  value: T;
  options: T[];
  onChange: (value: T) => void;
  className?: string;
  disabled?: boolean;
}

export function SelectDropdown<T extends string>({ value, options, onChange, className = '', disabled = false }: SelectDropdownProps<T>) {
  if (disabled) {
    return (
      <span className={`inline-block border border-gray-200 bg-gray-50 rounded px-2 py-0.5 text-xs text-gray-700 ${className}`}>
        {value || '—'}
      </span>
    );
  }
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value as T)}
      className={`border border-gray-300 rounded px-1 py-0.5 text-xs bg-white cursor-pointer outline-none focus:border-blue-400 ${className}`}
    >
      {options.map((opt) => (
        <option key={opt} value={opt}>{opt || '—'}</option>
      ))}
    </select>
  );
}
