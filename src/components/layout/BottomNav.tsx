/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  LayoutDashboard,
  PlusCircle,
  ArrowLeftRight,
  PieChart,
  Menu,
  HeartHandshake,
  CreditCard,
  PiggyBank,
  FileSpreadsheet,
  Settings,
  X,
} from 'lucide-react';
import { useFinance } from '../../context/FinanceContext';
import { ActiveTab } from '../../types/finance';

export const BottomNav: React.FC = () => {
  const { activeTab, setActiveTab } = useFinance();
  const [showMoreMenu, setShowMoreMenu] = useState(false);

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'transactions', label: 'History', icon: ArrowLeftRight },
    { id: 'add-expense', label: 'Add', icon: PlusCircle, isPrimary: true },
    { id: 'budget', label: 'Budget', icon: PieChart },
  ];

  const moreItems: { id: ActiveTab; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
    { id: 'family', label: 'Family Support', icon: HeartHandshake },
    { id: 'debts', label: 'Debts & Accounts', icon: CreditCard },
    { id: 'savings', label: 'Savings Tracker', icon: PiggyBank },
    { id: 'reports', label: 'Monthly Reports', icon: FileSpreadsheet },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  const handleSelectTab = (tab: ActiveTab) => {
    setActiveTab(tab);
    setShowMoreMenu(false);
  };

  return (
    <>
      {/* Mobile Drawer for More Items */}
      {showMoreMenu && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 md:hidden bg-slate-900/40 backdrop-blur-xs flex flex-col justify-end"
          onClick={() => setShowMoreMenu(false)}
        >
          <div
            className="bg-white rounded-t-3xl p-5 shadow-2xl border-t border-slate-100 space-y-4 max-h-[80vh] overflow-y-auto animate-in slide-in-from-bottom duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h3 className="font-bold text-slate-800 text-base">More Features</h3>
              <button
                onClick={() => setShowMoreMenu(false)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg"
                aria-label="Close menu"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-2.5">
              {moreItems.map((item) => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => handleSelectTab(item.id)}
                    className={`flex items-center gap-3 p-3 rounded-2xl text-left transition ${
                      isActive
                        ? 'bg-[#EAF3FF] text-[#1769D2] font-bold border border-blue-200'
                        : 'bg-slate-50 text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    <div
                      className={`p-2 rounded-xl shrink-0 ${
                        isActive ? 'bg-[#1769D2] text-white' : 'bg-white text-slate-600 shadow-2xs'
                      }`}
                    >
                      <Icon className="w-5 h-5" />
                    </div>
                    <span className="text-xs font-semibold leading-snug">{item.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Persistent Bottom Bar */}
      <nav className="fixed bottom-0 left-0 right-0 z-40 md:hidden bg-white/95 backdrop-blur-md border-t border-slate-200 shadow-lg px-2 pb-safe">
        <div className="flex items-center justify-around h-16 max-w-lg mx-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;

            if (item.isPrimary) {
              return (
                <button
                  key={item.id}
                  onClick={() => handleSelectTab(item.id as ActiveTab)}
                  className="flex flex-col items-center justify-center -mt-5"
                  aria-label="Add expense"
                >
                  <div className="w-13 h-13 rounded-full bg-[#1769D2] text-white flex items-center justify-center shadow-lg shadow-blue-500/30 hover:bg-[#1255ab] active:scale-90 transition">
                    <PlusCircle className="w-7 h-7" />
                  </div>
                  <span className="text-[10px] font-bold text-[#1769D2] mt-1">{item.label}</span>
                </button>
              );
            }

            return (
              <button
                key={item.id}
                onClick={() => handleSelectTab(item.id as ActiveTab)}
                className={`flex flex-col items-center justify-center py-1 px-3 rounded-xl transition ${
                  isActive ? 'text-[#1769D2]' : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                <Icon className={`w-5 h-5 ${isActive ? 'stroke-[2.5]' : 'stroke-2'}`} />
                <span className={`text-[10px] mt-1 ${isActive ? 'font-bold' : 'font-medium'}`}>
                  {item.label}
                </span>
              </button>
            );
          })}

          {/* More trigger button */}
          <button
            onClick={() => setShowMoreMenu(!showMoreMenu)}
            className={`flex flex-col items-center justify-center py-1 px-3 rounded-xl transition ${
              moreItems.some((m) => m.id === activeTab)
                ? 'text-[#1769D2]'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <Menu className="w-5 h-5 stroke-2" />
            <span className="text-[10px] mt-1 font-medium">More</span>
          </button>
        </div>
      </nav>
    </>
  );
};
