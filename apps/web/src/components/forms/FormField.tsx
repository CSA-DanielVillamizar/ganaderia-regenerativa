/**
 * FormField
 * Componente reutilizable para campo de formulario con label e input
 */
import React from 'react';

interface FormFieldProps {
  label: string;
  error?: string;
  required?: boolean;
  hint?: string;
  children: React.ReactNode;
}

export function FormField({
  label,
  error,
  required = false,
  hint,
  children,
}: FormFieldProps) {
  return (
    <div className="space-y-1">
      <label className="block text-sm font-medium text-gray-700">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>

      {children}

      {hint && !error && (
        <p className="text-xs text-gray-500">{hint}</p>
      )}

      {error && (
        <p className="text-xs text-red-600">{error}</p>
      )}
    </div>
  );
}
