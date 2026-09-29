import React from 'react';
import { useLeave } from '../../context/LeaveContext';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

export const ToastContainer: React.FC = () => {
  const { toasts, removeToast } = useLeave();

  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 max-w-md w-full pointer-events-none">
      {toasts.map((toast) => {
        const isSuccess = toast.type === 'success';
        const isError = toast.type === 'error';

        return (
          <div
            key={toast.id}
            className={`pointer-events-auto flex items-start gap-3 p-4 rounded-xl shadow-lg border transition-all duration-200 ${
              isSuccess
                ? 'bg-white text-slate-800 border-emerald-200'
                : isError
                ? 'bg-white text-slate-800 border-rose-200'
                : 'bg-white text-slate-800 border-violet-200'
            }`}
          >
            <div className="shrink-0 mt-0.5">
              {isSuccess && <CheckCircle2 className="w-5 h-5 text-emerald-600" />}
              {isError && <AlertCircle className="w-5 h-5 text-rose-600" />}
              {!isSuccess && !isError && <Info className="w-5 h-5 text-violet-600" />}
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="text-sm font-semibold text-slate-900 leading-snug">
                {toast.title}
              </h4>
              <p className="text-xs text-slate-600 mt-0.5 leading-relaxed">
                {toast.message}
              </p>
            </div>
            <button
              onClick={() => removeToast(toast.id)}
              className="shrink-0 text-slate-400 hover:text-slate-600 p-1 rounded-md transition-colors"
              aria-label="Close notification"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        );
      })}
    </div>
  );
};
