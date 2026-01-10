/**
 * NumberInput
 * Input numérico con validación de rango
 */
import React from 'react';

interface NumberInputProps {
  value: number | '';
  onChange: (value: number | '') => void;
  min?: number;
  max?: number;
  step?: number;
  decimals?: number;
  disabled?: boolean;
  placeholder?: string;
}

export function NumberInput({
  value,
  onChange,
  min,
  max,
  step = 1,
  decimals = 0,
  disabled = false,
  placeholder,
}: NumberInputProps) {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    
    if (val === '') {
      onChange('');
      return;
    }

    let num = parseFloat(val);

    if (isNaN(num)) return;

    if (decimals >= 0) {
      const factor = Math.pow(10, decimals);
      num = Math.round(num * factor) / factor;
    }

    if (min !== undefined && num < min) num = min;
    if (max !== undefined && num > max) num = max;

    onChange(num);
  };

  return (
    <input
      type="number"
      value={value}
      onChange={handleChange}
      min={min}
      max={max}
      step={step}
      disabled={disabled}
      placeholder={placeholder}
      className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-green-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
    />
  );
}
