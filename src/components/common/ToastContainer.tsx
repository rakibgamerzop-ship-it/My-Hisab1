/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { CheckCircle2, Info, AlertCircle, X } from 'lucide-react';
import { useFinance } from '../../context/FinanceContext';

export const ToastContainer: React.FC = () => {
  const { toasts, dismissToast } = useFinance();

  if (toasts.length === 0) return null;

  return (
    <div
      aria-live="polite"
      className="fixed bottom-20 md:bottom-6 right-4 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none"
    >
      {toasts.map((toast) => {
        let icon = <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />;
        let borderColor = 'border-emerald-200 bg-white text-slate-800';

        if (toast.type === 'error') {
          icon = <AlertCircle className="w-5 h-5 text-red-600 shrink-0" />;
          borderColor = 'border-red-200 bg-white text-slate-800';
        } else if (toast.type === 'info') {
          icon = <Info className="w-5 h-5 text-[#1769D2] shrink-0" />;
          borderColor = 'border-blue-200 bg-white text-slate-800';
        }

        return (
          <div
            key={toast.id}
            className={`pointer-events-auto flex items-center justify-between gap-3 p-3.5 rounded-xl border shadow-lg transition-all transform animate-in slide-in-from-right-5 duration-200 ${borderColor}`}
          >
            <div className="flex items-center gap-2.5">
              {icon}
              <span className="text-sm font-medium">{toast.message}</span>
            </div>
            <button
              onClick={() => dismissToast(toast.id)}
              aria-label="Dismiss toast"
              className="text-slate-400 hover:text-slate-600 p-1 rounded-md"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        );
      })}
    </div>
  );
};
