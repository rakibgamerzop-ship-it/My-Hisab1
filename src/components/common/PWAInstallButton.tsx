/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Download, Smartphone, X } from 'lucide-react';
import { usePWAInstall } from '../../hooks/usePWAInstall';

export const PWAInstallButton: React.FC<{ variant?: 'header' | 'button' | 'card' }> = ({
  variant = 'header',
}) => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [showIOSModal, setShowIOSModal] = useState(false);

  if (isInstalled) {
    return null;
  }

  const handleInstallClick = async () => {
    if (isInstallable) {
      await install();
    } else if (isIOS) {
      setShowIOSModal(true);
    } else {
      // Browser doesn't support beforeinstallprompt yet or already cached
      setShowIOSModal(true);
    }
  };

  return (
    <>
      {variant === 'header' ? (
        <button
          onClick={handleInstallClick}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#EAF3FF] hover:bg-blue-100 text-[#1769D2] text-xs font-semibold transition active:scale-95 border border-blue-200"
          title="Install My Hisab on Android/PC"
        >
          <Download className="w-3.5 h-3.5 text-[#1769D2]" />
          <span className="hidden sm:inline">Install App</span>
          <span className="sm:hidden">Install</span>
        </button>
      ) : (
        <button
          onClick={handleInstallClick}
          className="flex items-center justify-center gap-2 w-full px-4 py-2.5 rounded-xl bg-[#1769D2] hover:bg-[#1255ab] text-white text-sm font-semibold transition active:scale-95 shadow-xs"
        >
          <Smartphone className="w-4 h-4" />
          <span>Install My Hisab on Phone</span>
        </button>
      )}

      {showIOSModal && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs"
        >
          <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-2xl border border-slate-100 text-slate-800">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Smartphone className="w-5 h-5 text-[#1769D2]" />
                <h3 className="font-bold text-slate-900">Install My Hisab App</h3>
              </div>
              <button
                onClick={() => setShowIOSModal(false)}
                className="text-slate-400 hover:text-slate-600 p-1"
                aria-label="Close"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="py-4 space-y-3 text-sm text-slate-600">
              <p className="font-medium text-slate-800">To install on your mobile device:</p>
              <div className="flex items-start gap-2.5">
                <span className="flex items-center justify-center w-5 h-5 rounded-full bg-blue-100 text-[#1769D2] text-xs font-bold shrink-0">
                  1
                </span>
                <span>
                  Tap the browser menu (three dots in Chrome on Android, or <strong>Share</strong> in Safari on iOS).
                </span>
              </div>
              <div className="flex items-start gap-2.5">
                <span className="flex items-center justify-center w-5 h-5 rounded-full bg-blue-100 text-[#1769D2] text-xs font-bold shrink-0">
                  2
                </span>
                <span>
                  Select <strong>&quot;Install app&quot;</strong> or <strong>&quot;Add to Home Screen&quot;</strong>.
                </span>
              </div>
              <div className="flex items-start gap-2.5">
                <span className="flex items-center justify-center w-5 h-5 rounded-full bg-blue-100 text-[#1769D2] text-xs font-bold shrink-0">
                  3
                </span>
                <span>
                  Launch <strong>My Hisab</strong> from your home screen just like a native Android app!
                </span>
              </div>
            </div>
            <button
              onClick={() => setShowIOSModal(false)}
              className="mt-2 w-full py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-semibold text-sm transition"
            >
              Got it
            </button>
          </div>
        </div>
      )}
    </>
  );
};
