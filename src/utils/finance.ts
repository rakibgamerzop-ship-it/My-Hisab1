/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import {
  AppState,
  BudgetSettings,
  DebtItem,
  Expense,
  ExpenseCategory,
  FamilySupportPayment,
  Income,
  SavingsTransaction,
} from '../types/finance';

export const DEFAULT_BUDGET: BudgetSettings = {
  monthlySalary: 20000,
  houseRent: 2000,
  dailyFoodBudget: 250,
  monthlyFoodBudget: 7500,
  monthlyFamilySupport: 5000,
  monthlySavingsTarget: 3000,
  otherExpensesBudget: 2500,
};

export function formatBDT(amount: number, showDecimals: boolean = false): string {
  const isNegative = amount < 0;
  const absAmount = Math.abs(amount);
  const formatted = absAmount.toLocaleString('en-BD', {
    minimumFractionDigits: showDecimals ? 2 : 0,
    maximumFractionDigits: showDecimals ? 2 : 0,
  });
  return `${isNegative ? '-' : ''}৳${formatted}`;
}

export function getCurrentMonthStr(date: Date = new Date()): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  return `${y}-${m}`;
}

export function getCurrentDateStr(date: Date = new Date()): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export function getDaysInMonth(yearMonthStr: string): number {
  const [year, month] = yearMonthStr.split('-').map(Number);
  return new Date(year, month, 0).getDate();
}

/**
 * Filter items by month (YYYY-MM)
 */
export function filterByMonth<T extends { date: string }>(items: T[], yearMonthStr: string): T[] {
  return items.filter((item) => item.date.startsWith(yearMonthStr));
}

/**
 * Formula requested by user:
 * Remaining Balance = Total Income - Total Expenses - Savings Deposits
 * If there are savings withdrawals, they return money into balance:
 * Net Savings Outflow = Savings Deposits - Savings Withdrawals
 */
export function calculateRemainingBalance(
  totalIncome: number,
  totalExpenses: number,
  savingsDeposits: number,
  savingsWithdrawals: number = 0
): number {
  const netSavingsDiverted = savingsDeposits - savingsWithdrawals;
  return totalIncome - totalExpenses - netSavingsDiverted;
}

export interface MonthlySummaryStats {
  yearMonth: string;
  monthlySalarySetting: number;
  totalIncome: number;
  totalExpenses: number;
  savingsDeposits: number;
  savingsWithdrawals: number;
  netSavings: number;
  remainingBalance: number;
  foodExpenses: number;
  houseRentExpenses: number;
  familySupportExpenses: number;
  otherExpenses: number;
  categoryBreakdown: Record<ExpenseCategory, number>;
  foodBudgetMonthly: number;
  foodBudgetRemaining: number;
  familySupportBudget: number;
  familySupportRemaining: number;
  houseRentBudget: number;
  savingsTarget: number;
  savingsTargetRemaining: number;
}

export function calculateMonthlySummary(
  state: AppState,
  yearMonth: string = getCurrentMonthStr()
): MonthlySummaryStats {
  const monthExpenses = filterByMonth(state.expenses, yearMonth);
  const monthIncomes = filterByMonth(state.incomes, yearMonth);
  const monthSavings = filterByMonth(state.savingsTransactions, yearMonth);
  const monthFamily = filterByMonth(state.familyPayments, yearMonth);

  const totalIncome = monthIncomes.reduce((sum, item) => sum + (Number(item.amount) || 0), 0);
  const totalExpenses = monthExpenses.reduce((sum, item) => sum + (Number(item.amount) || 0), 0);

  const savingsDeposits = monthSavings
    .filter((s) => s.type === 'deposit')
    .reduce((sum, s) => sum + (Number(s.amount) || 0), 0);
  const savingsWithdrawals = monthSavings
    .filter((s) => s.type === 'withdrawal')
    .reduce((sum, s) => sum + (Number(s.amount) || 0), 0);
  const netSavings = savingsDeposits - savingsWithdrawals;

  const remainingBalance = calculateRemainingBalance(
    totalIncome,
    totalExpenses,
    savingsDeposits,
    savingsWithdrawals
  );

  const categoryBreakdown: Record<ExpenseCategory, number> = {
    Food: 0,
    Transport: 0,
    'House Rent': 0,
    'Family Support': 0,
    Shopping: 0,
    'Personal Expenses': 0,
    Medical: 0,
    'Mobile Recharge': 0,
    Bills: 0,
    Other: 0,
  };

  monthExpenses.forEach((exp) => {
    if (categoryBreakdown[exp.category] !== undefined) {
      categoryBreakdown[exp.category] += Number(exp.amount) || 0;
    } else {
      categoryBreakdown.Other += Number(exp.amount) || 0;
    }
  });

  const foodExpenses = categoryBreakdown['Food'] || 0;
  const houseRentExpenses = categoryBreakdown['House Rent'] || 0;
  
  // Total family support paid: either recorded in familyPayments or categoryBreakdown['Family Support']
  const familyFromPayments = monthFamily.reduce((sum, f) => sum + (Number(f.amount) || 0), 0);
  const familySupportExpenses = Math.max(familyFromPayments, categoryBreakdown['Family Support'] || 0);

  const daysInMonth = getDaysInMonth(yearMonth);
  const foodBudgetMonthly = state.budget.dailyFoodBudget * daysInMonth;
  const foodBudgetRemaining = foodBudgetMonthly - foodExpenses;

  const familySupportBudget = state.budget.monthlyFamilySupport;
  const familySupportRemaining = Math.max(0, familySupportBudget - familySupportExpenses);

  const savingsTarget = state.budget.monthlySavingsTarget;
  const savingsTargetRemaining = Math.max(0, savingsTarget - netSavings);

  const otherExpenses =
    totalExpenses - foodExpenses - houseRentExpenses - (categoryBreakdown['Family Support'] || 0);

  return {
    yearMonth,
    monthlySalarySetting: state.budget.monthlySalary,
    totalIncome,
    totalExpenses,
    savingsDeposits,
    savingsWithdrawals,
    netSavings,
    remainingBalance,
    foodExpenses,
    houseRentExpenses,
    familySupportExpenses,
    otherExpenses,
    categoryBreakdown,
    foodBudgetMonthly,
    foodBudgetRemaining,
    familySupportBudget,
    familySupportRemaining,
    houseRentBudget: state.budget.houseRent,
    savingsTarget,
    savingsTargetRemaining,
  };
}

export interface DebtSummary {
  iOweTotal: number;
  iOwePaid: number;
  iOweRemaining: number;
  theyOweMeTotal: number;
  theyOweMePaid: number;
  theyOweMeRemaining: number;
  netDebtPosition: number; // theyOweMeRemaining - iOweRemaining
}

export function calculateDebtSummary(debts: DebtItem[]): DebtSummary {
  let iOweTotal = 0;
  let iOwePaid = 0;
  let theyOweMeTotal = 0;
  let theyOweMePaid = 0;

  debts.forEach((debt) => {
    const total = Number(debt.totalAmount) || 0;
    const paid = debt.repayments.reduce((s, r) => s + (Number(r.amount) || 0), 0);

    if (debt.type === 'i_owe') {
      iOweTotal += total;
      iOwePaid += paid;
    } else {
      theyOweMeTotal += total;
      theyOweMePaid += paid;
    }
  });

  const iOweRemaining = Math.max(0, iOweTotal - iOwePaid);
  const theyOweMeRemaining = Math.max(0, theyOweMeTotal - theyOweMePaid);
  const netDebtPosition = theyOweMeRemaining - iOweRemaining;

  return {
    iOweTotal,
    iOwePaid,
    iOweRemaining,
    theyOweMeTotal,
    theyOweMePaid,
    theyOweMeRemaining,
    netDebtPosition,
  };
}

export function calculateDebtItemStatus(
  totalAmount: number,
  repayments: { amount: number }[]
): 'unpaid' | 'partial' | 'settled' {
  const paid = repayments.reduce((s, r) => s + (Number(r.amount) || 0), 0);
  if (paid <= 0) return 'unpaid';
  if (paid >= totalAmount) return 'settled';
  return 'partial';
}

export interface SavingsSummary {
  totalSavingsAllTime: number;
  thisMonthDeposits: number;
  thisMonthWithdrawals: number;
  thisMonthNetSavings: number;
  monthlyTarget: number;
  remainingTarget: number;
  annualProjection: number;
}

export function calculateSavingsSummary(
  transactions: SavingsTransaction[],
  target: number,
  yearMonth: string = getCurrentMonthStr()
): SavingsSummary {
  let totalSavingsAllTime = 0;
  let thisMonthDeposits = 0;
  let thisMonthWithdrawals = 0;

  transactions.forEach((tx) => {
    const amount = Number(tx.amount) || 0;
    if (tx.type === 'deposit') {
      totalSavingsAllTime += amount;
      if (tx.date.startsWith(yearMonth)) {
        thisMonthDeposits += amount;
      }
    } else {
      totalSavingsAllTime -= amount;
      if (tx.date.startsWith(yearMonth)) {
        thisMonthWithdrawals += amount;
      }
    }
  });

  const thisMonthNetSavings = thisMonthDeposits - thisMonthWithdrawals;
  const remainingTarget = Math.max(0, target - thisMonthNetSavings);

  // Annual projection: current all time savings + remaining months in current year * target
  const currentMonthNum = Number(yearMonth.split('-')[1]) || 1;
  const remainingMonthsInYear = Math.max(0, 12 - currentMonthNum);
  const annualProjection = Math.max(0, totalSavingsAllTime + remainingMonthsInYear * target);

  return {
    totalSavingsAllTime: Math.max(0, totalSavingsAllTime),
    thisMonthDeposits,
    thisMonthWithdrawals,
    thisMonthNetSavings,
    monthlyTarget: target,
    remainingTarget,
    annualProjection,
  };
}

/**
/**
 * Initial clean state for My Hisab - zero transactions
 */
export function getInitialSeedData(): AppState {
  return {
    version: 2,
    budget: { ...DEFAULT_BUDGET },
    expenses: [],
    incomes: [],
    familyPayments: [],
    savingsTransactions: [],
    debts: [],
  };
}

export function exportToCSV(data: Record<string, unknown>[], filename: string): void {
  if (data.length === 0) return;
  const headers = Object.keys(data[0]);
  const rows = data.map((row) =>
    headers
      .map((header) => {
        const val = row[header] ?? '';
        const escaped = String(val).replace(/"/g, '""');
        return `"${escaped}"`;
      })
      .join(',')
  );

  const csvContent = [headers.join(','), ...rows].join('\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `${filename}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
