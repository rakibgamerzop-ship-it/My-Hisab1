/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { ChevronLeft, ChevronRight, PlusCircle } from 'lucide-react';
import { useFinance } from '../../context/FinanceContext';
import { PWAInstallButton } from '../common/PWAInstallButton';

export const Navbar: React.FC = () => {
  const { selectedMonth, setSelectedMonth, setActiveTab } = useFinance();

  // Navigation between months
  const handleMonthChange = (offset: number) => {
    const [year, month] = selectedMonth.split('-').map(Number);
    const date = new Date(year, month - 1 + offset, 1);
    const newY = date.getFullYear();
    const newM = String(date.getMonth() + 1).padStart(2, '0');
    setSelectedMonth(`${newY}-${newM}`);
  };

  // Format display month name (e.g., "November 2026")
  const formatMonthTitle = (ym: string) => {
    const [year, month] = ym.split('-').map(Number);
    const date = new Date(year, month - 1, 1);
    return date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
  };

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-slate-200/80 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-3">
        {/* Brand identity */}
        <div
          className="flex items-center gap-3 cursor-pointer"
          onClick={() => setActiveTab('dashboard')}
        >
          <div className="w-10 h-10 rounded-xl bg-[#1769D2] flex items-center justify-center text-white font-bold text-xl shadow-xs">
            ৳
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-lg font-black text-slate-900 tracking-tight whitespace-nowrap">
                My <span className="text-[#1769D2]">Hisab</span>
              </span>
              <span className="hidden sm:inline-flex px-1.5 py-0.5 rounded text-[10px] font-semibold bg-[#EAF3FF] text-[#1769D2] uppercase tracking-wider">
                BDT ৳
              </span>
            </div>
            <p className="text-[11px] text-slate-500 font-medium hidden sm:block">
              Personal Finance & Budget
            </p>
          </div>
        </div>

        {/* Month Selector */}
        <div className="flex items-center bg-slate-50 border border-slate-200 rounded-xl p-1 shadow-2xs">
          <button
            onClick={() => handleMonthChange(-1)}
            className="p-1 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-white transition"
            aria-label="Previous month"
            title="Previous month"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <span className="px-2 text-xs sm:text-sm font-semibold text-slate-800 min-w-[95px] text-center">
            {formatMonthTitle(selectedMonth)}
          </span>
          <button
            onClick={() => handleMonthChange(1)}
            className="p-1 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-white transition"
            aria-label="Next month"
            title="Next month"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          <PWAInstallButton variant="header" />
          <button
            onClick={() => setActiveTab('add-expense')}
            className="hidden sm:flex items-center gap-1.5 px-3 sm:px-4 py-2 rounded-xl bg-[#1769D2] hover:bg-[#1255ab] text-white text-xs sm:text-sm font-semibold transition active:scale-95 shadow-xs"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Add Expense</span>
          </button>
        </div>
      </div>
    </header>
  );
};
