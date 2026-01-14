/**
 * FormActions
 * Botones Guardar/Cancelar reutilizables
 */
import React from 'react';
import Link from 'next/link';

interface FormActionsProps {
  onSave: () => void;
  cancelHref: string;
  isLoading?: boolean;
  isSaveDisabled?: boolean;
  saveLabel?: string;
  cancelLabel?: string;
}

export function FormActions({
  onSave,
  cancelHref,
  isLoading = false,
  isSaveDisabled = false,
  saveLabel = 'Guardar',
  cancelLabel = 'Cancelar',
}: FormActionsProps) {
  return (
    <div className="flex gap-3 pt-4">
      <button
        type="button"
        onClick={onSave}
        disabled={isLoading || isSaveDisabled}
        className="flex-1 bg-green-600 text-white py-2 rounded-md font-medium hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
      >
        {isLoading ? 'Guardando...' : saveLabel}
      </button>

      <Link
        href={cancelHref}
        className="flex-1 bg-gray-200 text-gray-800 py-2 rounded-md font-medium hover:bg-gray-300 text-center transition-colors"
      >
        {cancelLabel}
      </Link>
    </div>
  );
}
