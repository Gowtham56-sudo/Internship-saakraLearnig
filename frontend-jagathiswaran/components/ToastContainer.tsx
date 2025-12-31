import React from 'react';
import { Toast } from '../hooks/useToast';

interface ToastContainerProps {
  toasts: Toast[];
  removeToast: (id: string) => void;
}

export const ToastContainer: React.FC<ToastContainerProps> = ({ toasts, removeToast }) => {
  return (
    <div className="fixed top-4 right-4 z-50 space-y-2">
      {toasts.map((toast) => {
        const bgColor = {
          error: 'bg-red-500',
          success: 'bg-green-500',
          info: 'bg-blue-500',
          warning: 'bg-yellow-500',
        }[toast.type];

        const icon = {
          error: '✕',
          success: '✓',
          info: 'ⓘ',
          warning: '⚠',
        }[toast.type];

        return (
          <div
            key={toast.id}
            className={`${bgColor} text-white px-6 py-3 rounded-lg shadow-lg flex items-center gap-3 animate-in fade-in slide-in-from-top`}
          >
            <span className="font-bold text-lg">{icon}</span>
            <span>{toast.message}</span>
            <button
              onClick={() => removeToast(toast.id)}
              className="ml-auto text-white hover:opacity-80"
            >
              ✕
            </button>
          </div>
        );
      })}
    </div>
  );
};
