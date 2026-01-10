/**
 * TextArea
 * Componente textarea reutilizable
 */
import React from 'react';

interface TextAreaProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  rows?: number;
  maxLength?: number;
}

export function TextArea({
  value,
  onChange,
  placeholder,
  disabled = false,
  rows = 4,
  maxLength,
}: TextAreaProps) {
  return (
    <textarea
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      disabled={disabled}
      rows={rows}
      maxLength={maxLength}
      className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-green-500 disabled:bg-gray-100 disabled:cursor-not-allowed resize-none"
    />
  );
}
