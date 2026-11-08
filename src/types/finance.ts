/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type ExpenseCategory =
  | 'Food'
  | 'Transport'
  | 'House Rent'
  | 'Family Support'
  | 'Shopping'
  | 'Personal Expenses'
  | 'Medical'
  | 'Mobile Recharge'
  | 'Bills'
  | 'Other';

export const EXPENSE_CATEGORIES: ExpenseCategory[] = [
  'Food',
  'Transport',
  'House Rent',
  'Family Support',
  'Shopping',
  'Personal Expenses',
  'Medical',
  'Mobile Recharge',
  'Bills',
  'Other',
];

export type PaymentMethod = 'Cash' | 'bKash' | 'Nagad' | 'Bank' | 'Card' | 'Rocket';

export const PAYMENT_METHODS: PaymentMethod[] = [
  'Cash',
  'bKash',
  'Nagad',
  'Bank',
  'Card',
  'Rocket',
];

export type IncomeSource = 'Salary' | 'Extra Income' | 'Bonus' | 'Other Income';

export const INCOME_SOURCES: IncomeSource[] = [
  'Salary',
  'Extra Income',
  'Bonus',
  'Other Income',
];

export interface Expense {
  id: string;
  date: string; // YYYY-MM-DD
  category: ExpenseCategory;
  amount: number;
  shopOrLocation: string;
  description: string;
  paymentMethod: PaymentMethod;
  createdAt: string;
}

export interface Income {
  id: string;
  date: string; // YYYY-MM-DD
  source: IncomeSource;
  amount: number;
  description: string;
  paymentMethod: PaymentMethod;
  createdAt: string;
}

export interface FamilySupportPayment {
  id: string;
  date: string; // YYYY-MM-DD
  amount: number;
  recipient: string; // e.g. "Father", "Mother", "Family Home", "Sister"
  description: string;
  paymentMethod: PaymentMethod;
  expenseId?: string; // linked to expense table to avoid duplicates
  createdAt: string;
}

export interface SavingsTransaction {
  id: string;
  date: string; // YYYY-MM-DD
  type: 'deposit' | 'withdrawal';
  amount: number;
  accountOrGoal: string; // e.g. "DPS", "Emergency Fund", "Fixed Deposit", "Bank"
  description: string;
  createdAt: string;
}

export interface DebtRepayment {
  id: string;
  date: string; // YYYY-MM-DD
  amount: number;
  note: string;
  createdAt: string;
}

export interface DebtItem {
  id: string;
  type: 'i_owe' | 'they_owe_me'; // Money I Owe (Payable) vs Money People Owe Me (Receivable)
  personName: string;
  totalAmount: number;
  date: string; // YYYY-MM-DD
  description: string;
  status: 'unpaid' | 'partial' | 'settled';
  repayments: DebtRepayment[];
  createdAt: string;
}

export interface BudgetSettings {
  monthlySalary: number; // default: 20000
  houseRent: number; // default: 2000
  dailyFoodBudget: number; // default: 250
  monthlyFoodBudget: number; // default: 7500
  monthlyFamilySupport: number; // default: 5000
  monthlySavingsTarget: number; // default: 3000
  otherExpensesBudget: number; // default: 2500
}

export interface AppState {
  version: number;
  budget: BudgetSettings;
  expenses: Expense[];
  incomes: Income[];
  familyPayments: FamilySupportPayment[];
  savingsTransactions: SavingsTransaction[];
  debts: DebtItem[];
}

export type ActiveTab =
  | 'dashboard'
  | 'add-expense'
  | 'transactions'
  | 'budget'
  | 'family'
  | 'debts'
  | 'savings'
  | 'reports'
  | 'settings';
