/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  TrendingDown,
  TrendingUp,
  Wallet,
  PiggyBank,
  HeartHandshake,
  Home,
  UtensilsCrossed,
  DollarSign,
  PlusCircle,
  Calendar,
  Layers,
  ArrowUpRight,
  ArrowDownRight,
  BarChart3,
} from 'lucide-react';
import { useFinance } from '../../context/FinanceContext';
import {
  calculateMonthlySummary,
  filterByMonth,
  formatBDT,
  getCurrentDateStr,
  getDaysInMonth,
} from '../../utils/finance';
import { EXPENSE_CATEGORIES, ExpenseCategory, IncomeSource, PaymentMethod, PAYMENT_METHODS } from '../../types/finance';

export const DashboardView: React.FC = () => {
  const { state, selectedMonth, setActiveTab, addIncome } = useFinance();
  const summary = calculateMonthlySummary(state, selectedMonth);

  // Quick Income Modal State
  const [showIncomeModal, setShowIncomeModal] = useState(false);
  const [incomeAmount, setIncomeAmount] = useState('');
  const [incomeSource, setIncomeSource] = useState<IncomeSource>('Salary');
  const [incomeDesc, setIncomeDesc] = useState('');
  const [incomePaymentMethod, setIncomePaymentMethod] = useState<PaymentMethod>('Bank');
  const [incomeDate, setIncomeDate] = useState(getCurrentDateStr());

  // Chart view mode: 'daily' | 'weekly' | 'category'
  const [activeChartTab, setActiveChartTab] = useState<'daily' | 'weekly' | 'category'>('daily');

  // Compute daily totals for the selected month
  const daysCount = getDaysInMonth(selectedMonth);
  const monthExpenses = filterByMonth(state.expenses, selectedMonth);

  const dailyTotals: { day: number; dateStr: string; amount: number }[] = [];
  for (let d = 1; d <= daysCount; d++) {
    const dayPadded = String(d).padStart(2, '0');
    const dateStr = `${selectedMonth}-${dayPadded}`;
    const dayExps = monthExpenses.filter((e) => e.date === dateStr);
    const amount = dayExps.reduce((sum, e) => sum + (Number(e.amount) || 0), 0);
    dailyTotals.push({ day: d, dateStr, amount });
  }

  // Max daily amount for scaling bar chart
  const maxDaily = Math.max(...dailyTotals.map((d) => d.amount), 500);

  // Compute weekly totals
  const weeklyTotals = [
    { label: 'Week 1 (1-7)', amount: 0 },
    { label: 'Week 2 (8-14)', amount: 0 },
    { label: 'Week 3 (15-21)', amount: 0 },
    { label: 'Week 4 (22-28)', amount: 0 },
    { label: 'Week 5 (29+)', amount: 0 },
  ];

  dailyTotals.forEach((d) => {
    if (d.day <= 7) weeklyTotals[0].amount += d.amount;
    else if (d.day <= 14) weeklyTotals[1].amount += d.amount;
    else if (d.day <= 21) weeklyTotals[2].amount += d.amount;
    else if (d.day <= 28) weeklyTotals[3].amount += d.amount;
    else weeklyTotals[4].amount += d.amount;
  });

  const maxWeekly = Math.max(...weeklyTotals.map((w) => w.amount), 1000);

  // Handle Quick Income submit
  const handleSaveIncome = (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = Number(incomeAmount);
    if (!parsed || parsed <= 0) return;

    addIncome({
      amount: parsed,
      source: incomeSource,
      date: incomeDate,
      description: incomeDesc.trim() || `${incomeSource} entry`,
      paymentMethod: incomePaymentMethod,
    });

    setIncomeAmount('');
    setIncomeDesc('');
    setShowIncomeModal(false);
  };

  // Recent transactions list
  const recentExpenses = [...monthExpenses]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 6);

  return (
    <div className="space-y-6 pb-20 md:pb-6">
      {/* Top Banner & Quick Shortcuts */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            Financial Dashboard
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Overview of your income, expenses, family support, and savings for{' '}
            <span className="font-semibold text-slate-700">{selectedMonth}</span>
          </p>
        </div>

        {/* Quick Action Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setActiveTab('add-expense')}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#1769D2] hover:bg-[#1255ab] text-white text-xs sm:text-sm font-semibold transition active:scale-95 shadow-xs"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Add Expense</span>
          </button>
          <button
            onClick={() => setShowIncomeModal(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs sm:text-sm font-semibold transition active:scale-95 shadow-xs"
          >
            <ArrowUpRight className="w-4 h-4" />
            <span>Add Income</span>
          </button>
          <button
            onClick={() => setActiveTab('savings')}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#EAF3FF] hover:bg-blue-100 text-[#1769D2] text-xs sm:text-sm font-semibold transition border border-blue-200"
          >
            <PiggyBank className="w-4 h-4 text-[#1769D2]" />
            <span>Savings</span>
          </button>
        </div>
      </div>

      {/* 8 Primary Financial KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {/* 1. Monthly Salary (Default ৳20,000) */}
        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-2xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Monthly Salary</span>
            <div className="p-2 rounded-xl bg-blue-50 text-[#1769D2]">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-lg sm:text-2xl font-black text-slate-900 tracking-tight">
              {formatBDT(summary.monthlySalarySetting)}
            </div>
            <button
              onClick={() => setActiveTab('budget')}
              className="text-[11px] text-[#1769D2] font-semibold hover:underline mt-1 inline-block"
            >
              Budget Target &rarr;
            </button>
          </div>
        </div>

        {/* 2. Total Income */}
        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-2xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Total Income</span>
            <div className="p-2 rounded-xl bg-emerald-50 text-emerald-600">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-lg sm:text-2xl font-black text-emerald-600 tracking-tight">
              {formatBDT(summary.totalIncome)}
            </div>
            <p className="text-[11px] text-slate-500 mt-1">Recorded this month</p>
          </div>
        </div>

        {/* 3. Total Expenses */}
        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-2xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Total Expenses</span>
            <div className="p-2 rounded-xl bg-red-50 text-red-600">
              <TrendingDown className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-lg sm:text-2xl font-black text-red-600 tracking-tight">
              {formatBDT(summary.totalExpenses)}
            </div>
            <p className="text-[11px] text-slate-500 mt-1">All daily outlays</p>
          </div>
        </div>

        {/* 4. Remaining Balance (Crucial Formula) */}
        <div className="bg-gradient-to-br from-[#1769D2] to-[#0d4ea3] p-4 sm:p-5 rounded-2xl text-white shadow-md flex flex-col justify-between col-span-2 sm:col-span-1">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-blue-100">Remaining Balance</span>
            <div className="p-2 rounded-xl bg-white/20 text-white">
              <Wallet className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-xl sm:text-2xl font-black tracking-tight">
              {formatBDT(summary.remainingBalance)}
            </div>
            <p className="text-[11px] text-blue-100 mt-1">
              Income - Expenses - Savings
            </p>
          </div>
        </div>

        {/* 5. Monthly Savings */}
        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-2xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Monthly Savings</span>
            <div className="p-2 rounded-xl bg-indigo-50 text-indigo-600">
              <PiggyBank className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-lg sm:text-2xl font-black text-slate-900 tracking-tight">
              {formatBDT(summary.netSavings)}
            </div>
            <p className="text-[11px] text-slate-500 mt-1">
              Target: {formatBDT(summary.savingsTarget)}
            </p>
          </div>
        </div>

        {/* 6. Family Support */}
        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-2xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Family Support</span>
            <div className="p-2 rounded-xl bg-pink-50 text-pink-600">
              <HeartHandshake className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-lg sm:text-2xl font-black text-slate-900 tracking-tight">
              {formatBDT(summary.familySupportExpenses)}
            </div>
            <p className="text-[11px] text-slate-500 mt-1">
              Target: {formatBDT(summary.familySupportBudget)}
            </p>
          </div>
        </div>

        {/* 7. House Rent */}
        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-2xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">House Rent</span>
            <div className="p-2 rounded-xl bg-amber-50 text-amber-600">
              <Home className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-lg sm:text-2xl font-black text-slate-900 tracking-tight">
              {formatBDT(summary.houseRentExpenses)}
            </div>
            <p className="text-[11px] text-slate-500 mt-1">
              Budget: {formatBDT(summary.houseRentBudget)}
            </p>
          </div>
        </div>

        {/* 8. Food Expenses */}
        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-2xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Food Expenses</span>
            <div className="p-2 rounded-xl bg-orange-50 text-orange-600">
              <UtensilsCrossed className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-lg sm:text-2xl font-black text-slate-900 tracking-tight">
              {formatBDT(summary.foodExpenses)}
            </div>
            <p className="text-[11px] text-slate-500 mt-1">
              Budget: {formatBDT(summary.foodBudgetMonthly)} (৳250/day)
            </p>
          </div>
        </div>
      </div>

      {/* Interactive Charts Section */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-2xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-[#1769D2]" />
            <h2 className="text-base font-bold text-slate-900">Expense Analytics & Trends</h2>
          </div>

          {/* Chart View Selector */}
          <div className="flex items-center bg-slate-100 rounded-xl p-1 self-start sm:self-auto">
            <button
              onClick={() => setActiveChartTab('daily')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                activeChartTab === 'daily'
                  ? 'bg-white text-[#1769D2] shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Daily
            </button>
            <button
              onClick={() => setActiveChartTab('weekly')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                activeChartTab === 'weekly'
                  ? 'bg-white text-[#1769D2] shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Weekly
            </button>
            <button
              onClick={() => setActiveChartTab('category')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                activeChartTab === 'category'
                  ? 'bg-white text-[#1769D2] shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Monthly Category
            </button>
          </div>
        </div>

        {/* 1. Daily Chart */}
        {activeChartTab === 'daily' && (
          <div className="space-y-3">
            <div className="flex justify-between items-center text-xs text-slate-500">
              <span>Day 1 to Day {daysCount} of {selectedMonth}</span>
              <span>Total: {formatBDT(summary.totalExpenses)}</span>
            </div>
            <div className="overflow-x-auto pb-2">
              <div className="min-w-[650px] h-48 flex items-end gap-1.5 pt-6 px-1">
                {dailyTotals.map((item) => {
                  const heightPercent = item.amount > 0 ? Math.max(8, (item.amount / maxDaily) * 100) : 4;
                  return (
                    <div
                      key={item.day}
                      className="flex-1 flex flex-col items-center group relative h-full justify-end"
                    >
                      {/* Tooltip */}
                      {item.amount > 0 && (
                        <div className="absolute -top-7 opacity-0 group-hover:opacity-100 transition pointer-events-none bg-slate-900 text-white text-[10px] font-bold py-1 px-2 rounded whitespace-nowrap z-10">
                          Day {item.day}: {formatBDT(item.amount)}
                        </div>
                      )}
                      <div
                        style={{ height: `${heightPercent}%` }}
                        className={`w-full rounded-t-md transition-all ${
                          item.amount > 0
                            ? 'bg-[#1769D2] group-hover:bg-[#1255ab]'
                            : 'bg-slate-100'
                        }`}
                      />
                      <span className="text-[10px] text-slate-400 mt-2 font-medium">
                        {item.day}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* 2. Weekly Chart */}
        {activeChartTab === 'weekly' && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-5 gap-3">
              {weeklyTotals.map((week, idx) => {
                const heightPercent = week.amount > 0 ? (week.amount / maxWeekly) * 100 : 0;
                return (
                  <div
                    key={idx}
                    className="p-4 rounded-xl bg-slate-50 border border-slate-100 flex sm:flex-col justify-between items-center sm:items-start gap-2"
                  >
                    <div>
                      <div className="text-xs font-semibold text-slate-500">{week.label}</div>
                      <div className="text-base font-bold text-slate-900 mt-1">
                        {formatBDT(week.amount)}
                      </div>
                    </div>
                    <div className="w-24 sm:w-full bg-slate-200 h-2.5 rounded-full overflow-hidden mt-2">
                      <div
                        className="bg-[#1769D2] h-full rounded-full transition-all"
                        style={{ width: `${heightPercent}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* 3. Category Breakdown Chart */}
        {activeChartTab === 'category' && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {EXPENSE_CATEGORIES.map((cat) => {
                const amount = summary.categoryBreakdown[cat] || 0;
                const percent =
                  summary.totalExpenses > 0
                    ? Math.round((amount / summary.totalExpenses) * 100)
                    : 0;

                return (
                  <div
                    key={cat}
                    className="p-3.5 rounded-xl bg-slate-50/70 border border-slate-100 space-y-1.5"
                  >
                    <div className="flex items-center justify-between text-xs font-semibold">
                      <span className="text-slate-700">{cat}</span>
                      <span className="text-slate-900 font-bold">
                        {formatBDT(amount)} ({percent}%)
                      </span>
                    </div>
                    <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full bg-[#1769D2]"
                        style={{ width: `${percent}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Recent Transactions Preview */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-2xs space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Calendar className="w-5 h-5 text-[#1769D2]" />
            <h2 className="text-base font-bold text-slate-900">Recent Expenses</h2>
          </div>
          <button
            onClick={() => setActiveTab('transactions')}
            className="text-xs font-semibold text-[#1769D2] hover:underline"
          >
            View All ({monthExpenses.length}) &rarr;
          </button>
        </div>

        {recentExpenses.length === 0 ? (
          <div className="py-8 text-center text-slate-400 text-sm">
            No expenses recorded for this month yet. Tap &quot;Add Expense&quot; above to get started!
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {recentExpenses.map((exp) => (
              <div
                key={exp.id}
                className="py-3 flex items-center justify-between gap-3 hover:bg-slate-50/50 px-2 rounded-xl transition"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-9 h-9 rounded-xl bg-[#EAF3FF] text-[#1769D2] flex items-center justify-center font-bold text-xs shrink-0">
                    {exp.category.slice(0, 2)}
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-bold text-slate-800 truncate">
                      {exp.shopOrLocation || exp.category}
                    </p>
                    <p className="text-xs text-slate-500 truncate">
                      {exp.date} • {exp.paymentMethod} {exp.description ? `• ${exp.description}` : ''}
                    </p>
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <div className="text-sm font-black text-red-600">
                    -{formatBDT(exp.amount)}
                  </div>
                  <span className="text-[10px] font-semibold text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded">
                    {exp.category}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Quick Add Income Modal */}
      {showIncomeModal && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs"
        >
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl border border-slate-100 text-slate-800 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <ArrowUpRight className="w-5 h-5 text-emerald-600" />
                <h3 className="font-bold text-slate-900 text-lg">Record Income</h3>
              </div>
              <button
                onClick={() => setShowIncomeModal(false)}
                className="text-slate-400 hover:text-slate-600 p-1"
                aria-label="Close"
              >
                &times;
              </button>
            </div>

            <form onSubmit={handleSaveIncome} className="mt-4 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">
                  Income Source
                </label>
                <select
                  value={incomeSource}
                  onChange={(e) => setIncomeSource(e.target.value as IncomeSource)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm font-medium focus:ring-2 focus:ring-[#1769D2] outline-hidden"
                >
                  <option value="Salary">Salary (৳20,000 standard)</option>
                  <option value="Extra Income">Extra Income</option>
                  <option value="Bonus">Bonus</option>
                  <option value="Other Income">Other Income</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">
                  Amount (৳ BDT)
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-2.5 text-slate-400 font-bold">৳</span>
                  <input
                    type="number"
                    required
                    min="1"
                    placeholder="20000"
                    value={incomeAmount}
                    onChange={(e) => setIncomeAmount(e.target.value)}
                    className="w-full pl-8 pr-3.5 py-2.5 rounded-xl border border-slate-200 text-sm font-medium focus:ring-2 focus:ring-[#1769D2] outline-hidden"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">
                    Date
                  </label>
                  <input
                    type="date"
                    required
                    value={incomeDate}
                    onChange={(e) => setIncomeDate(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-medium focus:ring-2 focus:ring-[#1769D2] outline-hidden"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">
                    Payment Method
                  </label>
                  <select
                    value={incomePaymentMethod}
                    onChange={(e) => setIncomePaymentMethod(e.target.value as PaymentMethod)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-medium focus:ring-2 focus:ring-[#1769D2] outline-hidden"
                  >
                    {PAYMENT_METHODS.map((method) => (
                      <option key={method} value={method}>
                        {method}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">
                  Description / Note
                </label>
                <input
                  type="text"
                  placeholder="e.g. Monthly salary from company"
                  value={incomeDesc}
                  onChange={(e) => setIncomeDesc(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm font-medium focus:ring-2 focus:ring-[#1769D2] outline-hidden"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowIncomeModal(false)}
                  className="px-4 py-2.5 rounded-xl border border-slate-200 text-sm font-semibold text-slate-600 hover:bg-slate-50 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold transition active:scale-95 shadow-sm"
                >
                  Save Income
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
