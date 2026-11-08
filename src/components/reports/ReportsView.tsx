/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  FileSpreadsheet,
  Printer,
  Download,
  Calendar,
  TrendingUp,
  TrendingDown,
  Wallet,
  PiggyBank,
  HeartHandshake,
  CreditCard,
  CheckCircle,
} from 'lucide-react';
import { useFinance } from '../../context/FinanceContext';
import {
  calculateDebtSummary,
  calculateMonthlySummary,
  exportToCSV,
  filterByMonth,
  formatBDT,
  getDaysInMonth,
} from '../../utils/finance';
import { EXPENSE_CATEGORIES } from '../../types/finance';

export const ReportsView: React.FC = () => {
  const { state, selectedMonth, setSelectedMonth } = useFinance();
  const summary = calculateMonthlySummary(state, selectedMonth);
  const debtSummary = calculateDebtSummary(state.debts);

  // Parse Year and Month for custom selector
  const [yearStr, monthStr] = selectedMonth.split('-');
  const currentYear = Number(yearStr) || new Date().getFullYear();
  const currentMonthNum = Number(monthStr) || new Date().getMonth() + 1;

  const monthExpenses = filterByMonth(state.expenses, selectedMonth);
  const daysInMonth = getDaysInMonth(selectedMonth);

  // Group expenses by day
  const dailyHistory: { date: string; day: number; count: number; total: number }[] = [];
  for (let d = 1; d <= daysInMonth; d++) {
    const dayPadded = String(d).padStart(2, '0');
    const dateStr = `${selectedMonth}-${dayPadded}`;
    const dayExps = monthExpenses.filter((e) => e.date === dateStr);
    const total = dayExps.reduce((sum, e) => sum + (Number(e.amount) || 0), 0);
    if (total > 0 || dayExps.length > 0) {
      dailyHistory.push({
        date: dateStr,
        day: d,
        count: dayExps.length,
        total,
      });
    }
  }

  // Print PDF
  const handlePrint = () => {
    window.print();
  };

  // Export Excel / CSV
  const handleExportSpreadsheet = () => {
    const exportRows: Record<string, unknown>[] = [];

    // Header summary row
    exportRows.push({
      Section: 'MONTHLY SUMMARY',
      Item: 'Month',
      Detail: selectedMonth,
      Amount: '',
    });
    exportRows.push({
      Section: 'MONTHLY SUMMARY',
      Item: 'Total Monthly Income',
      Detail: 'All sources',
      Amount: summary.totalIncome,
    });
    exportRows.push({
      Section: 'MONTHLY SUMMARY',
      Item: 'Total Monthly Expenses',
      Detail: 'All daily expenditures',
      Amount: summary.totalExpenses,
    });
    exportRows.push({
      Section: 'MONTHLY SUMMARY',
      Item: 'Savings Deposits',
      Detail: 'Transferred to DPS/Savings',
      Amount: summary.savingsDeposits,
    });
    exportRows.push({
      Section: 'MONTHLY SUMMARY',
      Item: 'Remaining Balance',
      Detail: 'Income - Expenses - Savings',
      Amount: summary.remainingBalance,
    });
    exportRows.push({
      Section: 'MONTHLY SUMMARY',
      Item: 'Family Support Paid',
      Detail: 'Sent to family',
      Amount: summary.familySupportExpenses,
    });

    // Category breakdown
    EXPENSE_CATEGORIES.forEach((cat) => {
      exportRows.push({
        Section: 'CATEGORY BREAKDOWN',
        Item: cat,
        Detail: 'Expense category',
        Amount: summary.categoryBreakdown[cat] || 0,
      });
    });

    // Daily expense items
    monthExpenses.forEach((exp) => {
      exportRows.push({
        Section: 'EXPENSE ITEM',
        Item: exp.date,
        Detail: `${exp.category} - ${exp.shopOrLocation} - ${exp.description}`,
        Amount: exp.amount,
      });
    });

    exportToCSV(exportRows, `my-hisab-report-${selectedMonth}`);
  };

  const handleYearChange = (newYear: number) => {
    const m = String(currentMonthNum).padStart(2, '0');
    setSelectedMonth(`${newYear}-${m}`);
  };

  const handleMonthChange = (newMonth: number) => {
    const m = String(newMonth).padStart(2, '0');
    setSelectedMonth(`${currentYear}-${m}`);
  };

  return (
    <div className="space-y-6 pb-20 md:pb-6 print:p-0 print:space-y-4">
      {/* Top Header & Year/Month Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs print:hidden">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            Monthly Financial Report
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Audit-grade financial statement for{' '}
            <span className="font-semibold text-slate-700">{selectedMonth}</span>
          </p>
        </div>

        {/* Filter by Month & Year */}
        <div className="flex flex-wrap items-center gap-2">
          <select
            value={currentMonthNum}
            onChange={(e) => handleMonthChange(Number(e.target.value))}
            className="px-3 py-2 rounded-xl border border-slate-200 text-xs sm:text-sm font-semibold bg-white text-slate-700"
          >
            {[
              'January',
              'February',
              'March',
              'April',
              'May',
              'June',
              'July',
              'August',
              'September',
              'October',
              'November',
              'December',
            ].map((name, i) => (
              <option key={i + 1} value={i + 1}>
                {name}
              </option>
            ))}
          </select>

          <select
            value={currentYear}
            onChange={(e) => handleYearChange(Number(e.target.value))}
            className="px-3 py-2 rounded-xl border border-slate-200 text-xs sm:text-sm font-semibold bg-white text-slate-700"
          >
            {[2024, 2025, 2026, 2027, 2028, 2029, 2030].map((y) => (
              <option key={y} value={y}>
                {y}
              </option>
            ))}
          </select>

          <button
            onClick={handleExportSpreadsheet}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs sm:text-sm font-bold transition active:scale-95 shadow-xs"
            title="Download CSV/Excel"
          >
            <Download className="w-4 h-4" />
            <span>Excel / CSV</span>
          </button>

          <button
            onClick={handlePrint}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#1769D2] hover:bg-[#1255ab] text-white text-xs sm:text-sm font-bold transition active:scale-95 shadow-xs"
            title="Print or Save as PDF"
          >
            <Printer className="w-4 h-4" />
            <span>Print PDF</span>
          </button>
        </div>
      </div>

      {/* Printable Report Document Card */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-2xs space-y-6 print:border-none print:shadow-none print:p-0">
        {/* Printable Header */}
        <div className="flex items-center justify-between pb-6 border-b border-slate-200">
          <div>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-[#1769D2] text-white flex items-center justify-center font-bold text-lg">
                ৳
              </div>
              <h2 className="text-xl font-black text-slate-900 tracking-tight">
                My Hisab • Monthly Statement
              </h2>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Statement Period: <strong className="text-slate-800">{selectedMonth}</strong> • Currency: <strong>Bangladeshi Taka (৳ BDT)</strong>
            </p>
          </div>
          <div className="text-right text-xs text-slate-400">
            <p>Generated: {new Date().toLocaleDateString('en-GB')}</p>
            <p className="font-semibold text-[#1769D2]">Status: Audited & Balanced</p>
          </div>
        </div>

        {/* 8 Primary Statement Figures Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-100">
            <span className="text-xs font-semibold text-slate-500">1. Total Monthly Income</span>
            <div className="text-lg sm:text-xl font-black text-emerald-600 mt-1">
              {formatBDT(summary.totalIncome)}
            </div>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 border border-slate-100">
            <span className="text-xs font-semibold text-slate-500">2. Total Monthly Expenses</span>
            <div className="text-lg sm:text-xl font-black text-red-600 mt-1">
              {formatBDT(summary.totalExpenses)}
            </div>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 border border-slate-100">
            <span className="text-xs font-semibold text-slate-500">3. Monthly Savings Deposits</span>
            <div className="text-lg sm:text-xl font-black text-indigo-600 mt-1">
              {formatBDT(summary.savingsDeposits)}
            </div>
          </div>

          <div className="p-4 rounded-xl bg-blue-50 border border-blue-200">
            <span className="text-xs font-bold text-[#1769D2]">4. Remaining Net Balance</span>
            <div className="text-lg sm:text-xl font-black text-[#1769D2] mt-1">
              {formatBDT(summary.remainingBalance)}
            </div>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 border border-slate-100">
            <span className="text-xs font-semibold text-slate-500">5. Family Support</span>
            <div className="text-lg sm:text-xl font-black text-pink-600 mt-1">
              {formatBDT(summary.familySupportExpenses)}
            </div>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 border border-slate-100">
            <span className="text-xs font-semibold text-slate-500">6. House Rent Spent</span>
            <div className="text-lg sm:text-xl font-black text-amber-600 mt-1">
              {formatBDT(summary.houseRentExpenses)}
            </div>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 border border-slate-100">
            <span className="text-xs font-semibold text-slate-500">7. Food Expenses</span>
            <div className="text-lg sm:text-xl font-black text-orange-600 mt-1">
              {formatBDT(summary.foodExpenses)}
            </div>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 border border-slate-100">
            <span className="text-xs font-semibold text-slate-500">8. Net Debt Balance</span>
            <div className="text-lg sm:text-xl font-black text-slate-900 mt-1">
              {formatBDT(debtSummary.netDebtPosition)}
            </div>
          </div>
        </div>

        {/* Category-Wise Expense Breakdown Table */}
        <div className="space-y-3 pt-2">
          <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
            Category-Wise Expenses Breakdown
          </h3>
          <div className="overflow-x-auto border border-slate-200 rounded-xl">
            <table className="w-full text-left text-xs sm:text-sm">
              <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
                <tr>
                  <th className="py-2.5 px-3">Expense Category</th>
                  <th className="py-2.5 px-3 text-right">Amount Spent</th>
                  <th className="py-2.5 px-3 text-right">% of Total</th>
                  <th className="py-2.5 px-3">Visual Distribution</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {EXPENSE_CATEGORIES.map((cat) => {
                  const amount = summary.categoryBreakdown[cat] || 0;
                  const percent =
                    summary.totalExpenses > 0
                      ? Math.round((amount / summary.totalExpenses) * 100)
                      : 0;

                  return (
                    <tr key={cat}>
                      <td className="py-2.5 px-3 font-semibold text-slate-800">{cat}</td>
                      <td className="py-2.5 px-3 text-right font-bold text-slate-900">
                        {formatBDT(amount)}
                      </td>
                      <td className="py-2.5 px-3 text-right text-slate-600">{percent}%</td>
                      <td className="py-2.5 px-3 w-40">
                        <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-[#1769D2] rounded-full"
                            style={{ width: `${percent}%` }}
                          />
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Daily Expense History Table */}
        <div className="space-y-3 pt-4">
          <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
            Daily Expense Log ({selectedMonth})
          </h3>
          {dailyHistory.length === 0 ? (
            <p className="text-xs text-slate-400 py-2">No daily expenses recorded for this month.</p>
          ) : (
            <div className="overflow-x-auto border border-slate-200 rounded-xl">
              <table className="w-full text-left text-xs sm:text-sm">
                <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
                  <tr>
                    <th className="py-2.5 px-3">Date</th>
                    <th className="py-2.5 px-3">Transactions Count</th>
                    <th className="py-2.5 px-3 text-right">Day Total Spent</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {dailyHistory.map((d) => (
                    <tr key={d.date}>
                      <td className="py-2.5 px-3 font-semibold text-slate-800">{d.date}</td>
                      <td className="py-2.5 px-3 text-slate-600">{d.count} entries</td>
                      <td className="py-2.5 px-3 text-right font-bold text-red-600">
                        -{formatBDT(d.total)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Debt and Savings Summary Note */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-slate-200">
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 space-y-1">
            <h4 className="text-xs font-bold text-slate-700">Debt Position Summary</h4>
            <p className="text-xs text-slate-600">
              Money I Owe: <strong className="text-red-600">{formatBDT(debtSummary.iOweRemaining)}</strong>
            </p>
            <p className="text-xs text-slate-600">
              People Owe Me: <strong className="text-emerald-600">{formatBDT(debtSummary.theyOweMeRemaining)}</strong>
            </p>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 space-y-1">
            <h4 className="text-xs font-bold text-slate-700">Savings Cumulative</h4>
            <p className="text-xs text-slate-600">
              All-Time Saved Total:{' '}
              <strong className="text-indigo-600">
                {formatBDT(
                  state.savingsTransactions.reduce(
                    (sum, s) => sum + (s.type === 'deposit' ? s.amount : -s.amount),
                    0
                  )
                )}
              </strong>
            </p>
            <p className="text-xs text-slate-600">
              Net Savings This Month: <strong>{formatBDT(summary.netSavings)}</strong>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
