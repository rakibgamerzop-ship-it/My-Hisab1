/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  PieChart,
  Edit3,
  CheckCircle,
  AlertCircle,
  RotateCcw,
  Home,
  UtensilsCrossed,
  HeartHandshake,
  PiggyBank,
  Wallet,
  Coins,
} from 'lucide-react';
import { useFinance } from '../../context/FinanceContext';
import {
  calculateMonthlySummary,
  DEFAULT_BUDGET,
  formatBDT,
  getDaysInMonth,
} from '../../utils/finance';

export const BudgetView: React.FC = () => {
  const { state, updateBudget, selectedMonth } = useFinance();
  const summary = calculateMonthlySummary(state, selectedMonth);

  // Editing state
  const [isEditing, setIsEditing] = useState(false);
  const [salaryInput, setSalaryInput] = useState(state.budget.monthlySalary.toString());
  const [rentInput, setRentInput] = useState(state.budget.houseRent.toString());
  const [foodInput, setFoodInput] = useState(state.budget.dailyFoodBudget.toString());
  const [familyInput, setFamilyInput] = useState(state.budget.monthlyFamilySupport.toString());
  const [savingsInput, setSavingsInput] = useState(state.budget.monthlySavingsTarget.toString());
  const [otherInput, setOtherInput] = useState(state.budget.otherExpensesBudget.toString());

  const daysInMonth = getDaysInMonth(selectedMonth);
  const monthlyFoodBudget = state.budget.dailyFoodBudget * daysInMonth;

  // Handle Save
  const handleSaveBudget = (e: React.FormEvent) => {
    e.preventDefault();
    updateBudget({
      monthlySalary: Math.max(0, Number(salaryInput) || 0),
      houseRent: Math.max(0, Number(rentInput) || 0),
      dailyFoodBudget: Math.max(0, Number(foodInput) || 0),
      monthlyFamilySupport: Math.max(0, Number(familyInput) || 0),
      monthlySavingsTarget: Math.max(0, Number(savingsInput) || 0),
      otherExpensesBudget: Math.max(0, Number(otherInput) || 0),
    });
    setIsEditing(false);
  };

  const handleResetDefaults = () => {
    updateBudget({ ...DEFAULT_BUDGET });
    setSalaryInput(DEFAULT_BUDGET.monthlySalary.toString());
    setRentInput(DEFAULT_BUDGET.houseRent.toString());
    setFoodInput(DEFAULT_BUDGET.dailyFoodBudget.toString());
    setFamilyInput(DEFAULT_BUDGET.monthlyFamilySupport.toString());
    setSavingsInput(DEFAULT_BUDGET.monthlySavingsTarget.toString());
    setOtherInput(DEFAULT_BUDGET.otherExpensesBudget.toString());
    setIsEditing(false);
  };

  // Budget items calculation
  const budgetItems = [
    {
      title: 'House Rent',
      icon: Home,
      budget: state.budget.houseRent,
      actual: summary.houseRentExpenses,
      unit: '/ month',
      color: 'amber',
    },
    {
      title: 'Food Budget',
      icon: UtensilsCrossed,
      budget: monthlyFoodBudget,
      actual: summary.foodExpenses,
      unit: `(৳${state.budget.dailyFoodBudget}/day × ${daysInMonth} days)`,
      color: 'orange',
    },
    {
      title: 'Family Support',
      icon: HeartHandshake,
      budget: state.budget.monthlyFamilySupport,
      actual: summary.familySupportExpenses,
      unit: '/ month',
      color: 'pink',
    },
    {
      title: 'Savings Target',
      icon: PiggyBank,
      budget: state.budget.monthlySavingsTarget,
      actual: summary.netSavings,
      unit: '/ month',
      color: 'indigo',
    },
    {
      title: 'Other Expenses',
      icon: Coins,
      budget: state.budget.otherExpensesBudget,
      actual: summary.otherExpenses,
      unit: '/ month',
      color: 'purple',
    },
  ];

  const totalPlannedOutlay =
    state.budget.houseRent +
    monthlyFoodBudget +
    state.budget.monthlyFamilySupport +
    state.budget.monthlySavingsTarget +
    state.budget.otherExpensesBudget;

  const totalPlannedSurplus = state.budget.monthlySalary - totalPlannedOutlay;

  return (
    <div className="space-y-6 pb-20 md:pb-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            Monthly Budget Plan
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Configure your monthly spending limits and monitor budget adherence for{' '}
            <span className="font-semibold text-slate-700">{selectedMonth}</span>
          </p>
        </div>

        <div className="flex items-center gap-2">
          {!isEditing ? (
            <button
              onClick={() => {
                setSalaryInput(state.budget.monthlySalary.toString());
                setRentInput(state.budget.houseRent.toString());
                setFoodInput(state.budget.dailyFoodBudget.toString());
                setFamilyInput(state.budget.monthlyFamilySupport.toString());
                setSavingsInput(state.budget.monthlySavingsTarget.toString());
                setOtherInput(state.budget.otherExpensesBudget.toString());
                setIsEditing(true);
              }}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#1769D2] hover:bg-[#1255ab] text-white text-xs sm:text-sm font-semibold transition active:scale-95 shadow-xs"
            >
              <Edit3 className="w-4 h-4" />
              <span>Edit Budget</span>
            </button>
          ) : (
            <button
              onClick={handleResetDefaults}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs sm:text-sm font-semibold transition"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Reset Defaults</span>
            </button>
          )}
        </div>
      </div>

      {/* Edit Budget Form Modal or Inline Card */}
      {isEditing && (
        <div className="bg-[#EAF3FF] border border-blue-200 rounded-2xl p-5 shadow-xs space-y-4 animate-in fade-in">
          <div className="flex items-center justify-between border-b border-blue-200/60 pb-3">
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <PieChart className="w-5 h-5 text-[#1769D2]" />
              <span>Edit Monthly Budget Amounts</span>
            </h2>
            <button
              onClick={() => setIsEditing(false)}
              className="text-xs font-semibold text-slate-500 hover:text-slate-800"
            >
              Cancel
            </button>
          </div>

          <form onSubmit={handleSaveBudget} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Monthly Base Salary (৳)
                </label>
                <input
                  type="number"
                  min="0"
                  required
                  value={salaryInput}
                  onChange={(e) => setSalaryInput(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-blue-300 bg-white text-sm font-bold focus:ring-2 focus:ring-[#1769D2] outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  House Rent (৳)
                </label>
                <input
                  type="number"
                  min="0"
                  required
                  value={rentInput}
                  onChange={(e) => setRentInput(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-blue-300 bg-white text-sm font-bold focus:ring-2 focus:ring-[#1769D2] outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Daily Food Budget (৳)
                </label>
                <input
                  type="number"
                  min="0"
                  required
                  value={foodInput}
                  onChange={(e) => setFoodInput(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-blue-300 bg-white text-sm font-bold focus:ring-2 focus:ring-[#1769D2] outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Monthly Family Support (৳)
                </label>
                <input
                  type="number"
                  min="0"
                  required
                  value={familyInput}
                  onChange={(e) => setFamilyInput(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-blue-300 bg-white text-sm font-bold focus:ring-2 focus:ring-[#1769D2] outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Monthly Savings Target (৳)
                </label>
                <input
                  type="number"
                  min="0"
                  required
                  value={savingsInput}
                  onChange={(e) => setSavingsInput(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-blue-300 bg-white text-sm font-bold focus:ring-2 focus:ring-[#1769D2] outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Other Expenses Budget (৳)
                </label>
                <input
                  type="number"
                  min="0"
                  required
                  value={otherInput}
                  onChange={(e) => setOtherInput(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-blue-300 bg-white text-sm font-bold focus:ring-2 focus:ring-[#1769D2] outline-hidden"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setIsEditing(false)}
                className="px-4 py-2 rounded-xl bg-white border border-slate-300 text-xs font-bold text-slate-600 hover:bg-slate-50 transition"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 rounded-xl bg-[#1769D2] hover:bg-[#1255ab] text-white text-xs font-bold transition active:scale-95 shadow-xs"
              >
                Save Budget
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Salary & Plan Health Card */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs">
          <span className="text-xs font-semibold text-slate-500">Planned Monthly Salary</span>
          <div className="text-2xl font-black text-slate-900 mt-2">
            {formatBDT(state.budget.monthlySalary)}
          </div>
          <p className="text-[11px] text-slate-500 mt-1">Default benchmark income</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs">
          <span className="text-xs font-semibold text-slate-500">Total Planned Allocations</span>
          <div className="text-2xl font-black text-slate-900 mt-2">
            {formatBDT(totalPlannedOutlay)}
          </div>
          <p className="text-[11px] text-slate-500 mt-1">
            Rent + Food + Family + Savings + Other
          </p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs">
          <span className="text-xs font-semibold text-slate-500">Planned Unallocated Buffer</span>
          <div
            className={`text-2xl font-black mt-2 ${
              totalPlannedSurplus >= 0 ? 'text-emerald-600' : 'text-red-600'
            }`}
          >
            {formatBDT(totalPlannedSurplus)}
          </div>
          <p className="text-[11px] text-slate-500 mt-1">
            {totalPlannedSurplus >= 0 ? 'Comfortable buffer' : 'Exceeds monthly salary!'}
          </p>
        </div>
      </div>

      {/* Detailed Budget Category Progress Bars */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 shadow-2xs space-y-6">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div>
            <h2 className="text-base font-bold text-slate-900">
              Budget Execution ({selectedMonth})
            </h2>
            <p className="text-xs text-slate-500">
              Live comparison of actual spending vs your configured limits
            </p>
          </div>
        </div>

        <div className="space-y-6">
          {budgetItems.map((item, idx) => {
            const Icon = item.icon;
            const percent = item.budget > 0 ? Math.round((item.actual / item.budget) * 100) : 0;
            const isExceeded = item.actual > item.budget;
            const remaining = Math.max(0, item.budget - item.actual);

            let barColor = 'bg-[#1769D2]';
            if (percent > 100) barColor = 'bg-red-500';
            else if (percent > 80) barColor = 'bg-amber-500';

            return (
              <div key={idx} className="space-y-2 p-4 rounded-xl bg-slate-50/70 border border-slate-100">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex items-center gap-2.5">
                    <div className="p-2 rounded-xl bg-white border border-slate-200 text-slate-700 shadow-2xs">
                      <Icon className="w-4 h-4 text-[#1769D2]" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold text-slate-800">{item.title}</span>
                        <span className="text-[11px] text-slate-500">{item.unit}</span>
                      </div>
                      <div className="text-xs text-slate-500 mt-0.5">
                        Spent: <span className="font-bold text-slate-900">{formatBDT(item.actual)}</span> of{' '}
                        <span className="font-semibold text-slate-700">{formatBDT(item.budget)}</span>
                      </div>
                    </div>
                  </div>

                  <div className="text-left sm:text-right">
                    <div className="flex items-center gap-2 sm:justify-end">
                      <span
                        className={`text-xs font-bold px-2 py-0.5 rounded-md ${
                          isExceeded
                            ? 'bg-red-100 text-red-700'
                            : percent >= 80
                            ? 'bg-amber-100 text-amber-700'
                            : 'bg-emerald-100 text-emerald-700'
                        }`}
                      >
                        {percent}%
                      </span>
                    </div>
                    <div className="text-[11px] text-slate-500 mt-0.5">
                      {isExceeded ? (
                        <span className="text-red-600 font-semibold flex items-center gap-1">
                          <AlertCircle className="w-3 h-3" /> Over by {formatBDT(item.actual - item.budget)}
                        </span>
                      ) : (
                        <span>Remaining: {formatBDT(remaining)}</span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Progress bar */}
                <div className="w-full bg-slate-200 h-2.5 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-300 ${barColor}`}
                    style={{ width: `${Math.min(percent, 100)}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
