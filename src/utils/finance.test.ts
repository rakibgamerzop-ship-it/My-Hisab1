import test from 'node:test';
import assert from 'node:assert/strict';
import {
  calculateRemainingBalance,
  calculateMonthlySummary,
  calculateDebtSummary,
  calculateDebtItemStatus,
  calculateSavingsSummary,
  formatBDT,
  DEFAULT_BUDGET,
  getInitialSeedData,
} from './finance';
import { AppState } from '../types/finance';

test('formatBDT formats amounts in Bangladeshi Taka with symbol', () => {
  assert.equal(formatBDT(20000), '৳20,000');
  assert.equal(formatBDT(250), '৳250');
  assert.equal(formatBDT(-500), '-৳500');
  assert.equal(formatBDT(0), '৳0');
});

test('calculateRemainingBalance enforces Remaining Balance = Total Income - Total Expenses - Savings Deposits', () => {
  // Example: Income 20,000, Expenses 5,000, Savings Deposits 3,000 => Remaining = 12,000
  const balance = calculateRemainingBalance(20000, 5000, 3000, 0);
  assert.equal(balance, 12000);

  // If user withdraws 1,000 from savings back to active cash
  const balanceWithWithdrawal = calculateRemainingBalance(20000, 5000, 3000, 1000);
  assert.equal(balanceWithWithdrawal, 13000);
});

test('calculateDebtItemStatus calculates unpaid, partial, and settled states correctly', () => {
  assert.equal(calculateDebtItemStatus(1000, []), 'unpaid');
  assert.equal(calculateDebtItemStatus(1000, [{ amount: 400 }]), 'partial');
  assert.equal(calculateDebtItemStatus(1000, [{ amount: 500 }, { amount: 500 }]), 'settled');
  assert.equal(calculateDebtItemStatus(1000, [{ amount: 1200 }]), 'settled');
});

test('calculateDebtSummary tracks Money I Owe and Money People Owe Me separately', () => {
  const debts = [
    {
      id: 'd1',
      type: 'i_owe' as const,
      personName: 'Karim',
      totalAmount: 2000,
      date: '2026-11-01',
      description: 'Rent loan',
      status: 'partial' as const,
      repayments: [{ id: 'r1', date: '2026-11-02', amount: 500, note: '', createdAt: '' }],
      createdAt: '',
    },
    {
      id: 'd2',
      type: 'they_owe_me' as const,
      personName: 'Shakil',
      totalAmount: 5000,
      date: '2026-11-01',
      description: 'Lent money',
      status: 'partial' as const,
      repayments: [{ id: 'r2', date: '2026-11-03', amount: 2000, note: '', createdAt: '' }],
      createdAt: '',
    },
  ];

  const summary = calculateDebtSummary(debts);
  assert.equal(summary.iOweTotal, 2000);
  assert.equal(summary.iOwePaid, 500);
  assert.equal(summary.iOweRemaining, 1500);

  assert.equal(summary.theyOweMeTotal, 5000);
  assert.equal(summary.theyOweMePaid, 2000);
  assert.equal(summary.theyOweMeRemaining, 3000);
  assert.equal(summary.netDebtPosition, 1500); // 3000 receivable - 1500 payable
});

test('calculateMonthlySummary aggregates categories, remaining balance, and budget comparisons', () => {
  const dummyState: AppState = {
    version: 1,
    budget: { ...DEFAULT_BUDGET },
    expenses: [
      {
        id: 'e1',
        date: '2026-11-02',
        category: 'Food',
        amount: 300,
        shopOrLocation: 'Bazar',
        description: 'Groceries',
        paymentMethod: 'Cash',
        createdAt: '',
      },
      {
        id: 'e2',
        date: '2026-11-03',
        category: 'House Rent',
        amount: 2000,
        shopOrLocation: 'Landlord',
        description: 'Rent',
        paymentMethod: 'bKash',
        createdAt: '',
      },
      {
        id: 'e3',
        date: '2026-11-05',
        category: 'Family Support',
        amount: 4000,
        shopOrLocation: 'Village',
        description: 'Family support',
        paymentMethod: 'bKash',
        createdAt: '',
      },
    ],
    incomes: [
      {
        id: 'i1',
        date: '2026-11-01',
        source: 'Salary',
        amount: 20000,
        description: 'Monthly Salary',
        paymentMethod: 'Bank',
        createdAt: '',
      },
    ],
    familyPayments: [
      {
        id: 'f1',
        date: '2026-11-05',
        amount: 4000,
        recipient: 'Parents',
        description: 'Monthly Family Support',
        paymentMethod: 'bKash',
        createdAt: '',
      },
    ],
    savingsTransactions: [
      {
        id: 's1',
        date: '2026-11-01',
        type: 'deposit',
        amount: 3000,
        accountOrGoal: 'DPS',
        description: 'Savings',
        createdAt: '',
      },
    ],
    debts: [],
  };

  const summary = calculateMonthlySummary(dummyState, '2026-11');
  assert.equal(summary.totalIncome, 20000);
  assert.equal(summary.totalExpenses, 6300); // 300 + 2000 + 4000
  assert.equal(summary.savingsDeposits, 3000);
  // Remaining Balance = 20000 - 6300 - 3000 = 10700
  assert.equal(summary.remainingBalance, 10700);
  assert.equal(summary.foodExpenses, 300);
  assert.equal(summary.houseRentExpenses, 2000);
  assert.equal(summary.familySupportExpenses, 4000);
  assert.equal(summary.familySupportRemaining, 1000); // 5000 budget - 4000 paid
});

test('calculateSavingsSummary calculates target progress and annual projection', () => {
  const txs = [
    {
      id: 's1',
      date: '2026-11-01',
      type: 'deposit' as const,
      amount: 3000,
      accountOrGoal: 'DPS',
      description: 'Monthly DPS',
      createdAt: '',
    },
  ];
  const summary = calculateSavingsSummary(txs, 3000, '2026-11');
  assert.equal(summary.totalSavingsAllTime, 3000);
  assert.equal(summary.thisMonthNetSavings, 3000);
  assert.equal(summary.remainingTarget, 0);
  // Month 11 => 1 remaining month in year => 3000 + 1 * 3000 = 6000
  assert.equal(summary.annualProjection, 6000);
});

test('getInitialSeedData returns zero demo transactions and matches real budget', () => {
  const initial = getInitialSeedData();
  assert.equal(initial.expenses.length, 0, 'Expenses must be empty initially');
  assert.equal(initial.incomes.length, 0, 'Incomes must be empty initially');
  assert.equal(initial.debts.length, 0, 'Debts must be empty initially');
  assert.equal(initial.familyPayments.length, 0, 'Family support must be empty initially');
  assert.equal(initial.savingsTransactions.length, 0, 'Savings must be empty initially');
  assert.equal(initial.budget.monthlySalary, 20000);
  assert.equal(initial.budget.houseRent, 2000);
  assert.equal(initial.budget.dailyFoodBudget, 250);
  assert.equal(initial.budget.monthlyFoodBudget, 7500);
  assert.equal(initial.budget.monthlyFamilySupport, 5000);
  assert.equal(initial.budget.monthlySavingsTarget, 3000);
  assert.equal(initial.budget.otherExpensesBudget, 2500);
});
