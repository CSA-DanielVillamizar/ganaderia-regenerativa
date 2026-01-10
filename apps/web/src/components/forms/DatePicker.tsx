/**
 * DatePicker
 * Selector de fechas reutilizable
 */
import React from 'react';

interface DatePickerProps {
  value: string;
  onChange: (date: string) => void;
  min?: string;
  max?: string;
  disabled?: boolean;
}

export function DatePicker({
  value,
  onChange,
  min,
  max,
  disabled = false,
}: DatePickerProps) {
  return (
    <input
      type="date"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      min={min}
      max={max}
      disabled={disabled}
      className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-green-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
    />
  );
}
