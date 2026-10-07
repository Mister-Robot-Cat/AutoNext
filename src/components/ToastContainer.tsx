import React from 'react';
import { useToast } from '../hooks/useToast';
import { X, CheckCircle, AlertCircle, Info, AlertTriangle } from 'lucide-react';

export const ToastContainer: React.FC = () => {
  const { toasts, removeToast } = useToast();

  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 pointer-events-none">
      {toasts.map((toast) => {
        let Icon = Info;
        let colorClass = 'bg-slate-800 border-slate-700 text-white';
        let iconColor = 'text-blue-400';

        if (toast.type === 'success') {
          Icon = CheckCircle;
          iconColor = 'text-green-400';
        } else if (toast.type === 'error') {
          Icon = AlertCircle;
          iconColor = 'text-red-400';
        } else if (toast.type === 'warning') {
          Icon = AlertTriangle;
          iconColor = 'text-yellow-400';
        }

        return (
          <div
            key={toast.id}
            className={`pointer-events-auto flex items-center gap-3 px-4 py-3 rounded-xl shadow-2xl border ${colorClass} min-w-[300px] max-w-[400px] animate-in slide-in-from-right-8 fade-in duration-300`}
            role="alert"
          >
            <Icon className={`w-5 h-5 flex-shrink-0 ${iconColor}`} />
            <span className="flex-1 text-sm font-medium leading-tight">{toast.message}</span>
            <button
              onClick={() => removeToast(toast.id)}
              className="flex-shrink-0 text-slate-400 hover:text-white transition-colors p-1"
              aria-label="Close toast"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        );
      })}
    </div>
  );
};
