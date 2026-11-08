/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import {
  LayoutDashboard,
  PlusCircle,
  ArrowLeftRight,
  PieChart,
  HeartHandshake,
  CreditCard,
  PiggyBank,
  FileSpreadsheet,
  Settings,
  ShieldCheck,
} from 'lucide-react';
import { useFinance } from '../../context/FinanceContext';
import { ActiveTab } from '../../types/finance';
import { calculateMonthlySummary, formatBDT } from '../../utils/finance';

export const Sidebar: React.FC = () => {
  const { activeTab, setActiveTab, state, selectedMonth } = useFinance();
  const summary = calculateMonthlySummary(state, selectedMonth);

  const menuItems: {
    id: ActiveTab;
    label: string;
    icon: React.ComponentType<{ className?: string }>;
    badge?: string;
  }[] = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'add-expense', label: 'Add Expense', icon: PlusCircle },
    { id: 'transactions', label: 'Transactions', icon: ArrowLeftRight, badge: `${state.expenses.length + state.incomes.length}` },
    { id: 'budget', label: 'Monthly Budget', icon: PieChart },
    { id: 'family', label: 'Family Support', icon: HeartHandshake },
    { id: 'debts', label: 'Debts & Accounts', icon: CreditCard, badge: `${state.debts.length}` },
    { id: 'savings', label: 'Savings Tracker', icon: PiggyBank },
    { id: 'reports', label: 'Monthly Reports', icon: FileSpreadsheet },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  return (
    <aside className="hidden md:flex flex-col w-64 bg-white border-r border-slate-200 shrink-0 min-h-[calc(100vh-4rem)] p-4 justify-between">
      <div className="space-y-1">
        <div className="px-3 py-2 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
          Main Menu
        </div>
        <nav className="space-y-1">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-semibold transition ${
                  isActive
                    ? 'bg-[#1769D2] text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon className={`w-5 h-5 ${isActive ? 'text-white' : 'text-[#1769D2]'}`} />
                  <span>{item.label}</span>
                </div>
                {item.badge && (
                  <span
                    className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
                      isActive ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-600'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Financial Health Mini-Widget */}
      <div className="mt-6 p-4 rounded-2xl bg-[#EAF3FF] border border-blue-200/70 text-slate-800 space-y-2">
        <div className="flex items-center gap-1.5 text-xs font-bold text-[#1769D2]">
          <ShieldCheck className="w-4 h-4 text-[#1769D2]" />
          <span>Balance Overview</span>
        </div>
        <div>
          <div className="text-[11px] text-slate-500 font-medium">Available Remaining</div>
          <div className="text-xl font-black text-slate-900 tracking-tight">
            {formatBDT(summary.remainingBalance)}
          </div>
        </div>
        <div className="pt-1 border-t border-blue-200/50 flex justify-between text-[11px] text-slate-600">
          <span>Income: {formatBDT(summary.totalIncome)}</span>
          <span>Spent: {formatBDT(summary.totalExpenses)}</span>
        </div>
      </div>
    </aside>
  );
};
