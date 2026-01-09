'use client';

import React from 'react';
import { AlertCircle, CheckCircle, Info } from 'lucide-react';

interface AlertProps {
  type?: 'info' | 'success' | 'error' | 'warning';
  title?: string;
  message: string;
  onClose?: () => void;
}

export const Alert: React.FC<AlertProps> = ({ type = 'info', title, message, onClose }) => {
  const styles: Record<string, { bg: string; border: string; icon: React.FC; title: string }> = {
    info: {
      bg: 'bg-blue-50',
      border: 'border-blue-200',
      icon: Info,
      title: 'Información',
    },
    success: {
      bg: 'bg-green-50',
      border: 'border-green-200',
      icon: CheckCircle,
      title: 'Éxito',
    },
    error: {
      bg: 'bg-red-50',
      border: 'border-red-200',
      icon: AlertCircle,
      title: 'Error',
    },
    warning: {
      bg: 'bg-yellow-50',
      border: 'border-yellow-200',
      icon: AlertCircle,
      title: 'Advertencia',
    },
  };

  const style = styles[type];
  const Icon = style.icon;

  return (
    <div className={`${style.bg} border ${style.border} rounded-lg p-4 mb-4`}>
      <div className="flex items-start">
        <Icon className="w-5 h-5 mt-0.5 mr-3 text-gray-700" />
        <div className="flex-1">
          {(title || style.title) && <h4 className="font-semibold text-gray-900">{title || style.title}</h4>}
          <p className="text-gray-700 text-sm mt-1">{message}</p>
        </div>
        {onClose && (
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            ✕
          </button>
        )}
      </div>
    </div>
  );
};
