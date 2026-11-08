/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { createContext, useContext, useEffect, useState } from 'react';
import {
  ActiveTab,
  AppState,
  BudgetSettings,
  DebtItem,
  Expense,
  FamilySupportPayment,
  Income,
  SavingsTransaction,
} from '../types/finance';
import {
  calculateDebtItemStatus,
  getCurrentMonthStr,
  getCurrentDateStr,
  getInitialSeedData,
  DEFAULT_BUDGET,
} from '../utils/finance';

const STORAGE_KEY = 'my_hisab_app_state_v2';

interface ToastMessage {
  id: string;
  type: 'success' | 'info' | 'error';
  message: string;
}

interface FinanceContextType {
  state: AppState;
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  selectedMonth: string;
  setSelectedMonth: (month: string) => void;
  // Expense operations
  addExpense: (expense: Omit<Expense, 'id' | 'createdAt'>) => string;
  updateExpense: (id: string, data: Partial<Omit<Expense, 'id' | 'createdAt'>>) => void;
  deleteExpense: (id: string) => void;
  // Income operations
  addIncome: (income: Omit<Income, 'id' | 'createdAt'>) => string;
  updateIncome: (id: string, data: Partial<Omit<Income, 'id' | 'createdAt'>>) => void;
  deleteIncome: (id: string) => void;
  // Family support operations
  addFamilyPayment: (
    payment: Omit<FamilySupportPayment, 'id' | 'createdAt' | 'expenseId'>,
    syncExpense?: boolean
  ) => string;
  updateFamilyPayment: (id: string, data: Partial<FamilySupportPayment>) => void;
  deleteFamilyPayment: (id: string) => void;
  // Savings operations
  addSavingsTransaction: (tx: Omit<SavingsTransaction, 'id' | 'createdAt'>) => string;
  deleteSavingsTransaction: (id: string) => void;
  // Debt operations
  addDebt: (debt: Omit<DebtItem, 'id' | 'status' | 'repayments' | 'createdAt'>) => string;
  updateDebt: (id: string, data: Partial<DebtItem>) => void;
  deleteDebt: (id: string) => void;
  addDebtRepayment: (
    debtId: string,
    repayment: { amount: number; note: string; date: string }
  ) => void;
  deleteDebtRepayment: (debtId: string, repaymentId: string) => void;
  // Budget settings
  updateBudget: (budget: Partial<BudgetSettings>) => void;
  // Storage & backup
  backupJSON: () => void;
  restoreJSON: (jsonStr: string) => boolean;
  resetAllData: () => void;
  // Toasts
  toasts: ToastMessage[];
  dismissToast: (id: string) => void;
  showToast: (message: string, type?: 'success' | 'info' | 'error') => void;
}

const FinanceContext = createContext<FinanceContextType | undefined>(undefined);

export const FinanceProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [activeTab, setActiveTab] = useState<ActiveTab>('dashboard');
  const [selectedMonth, setSelectedMonth] = useState<string>(getCurrentMonthStr());
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  // Initialize state from clean state or v2 storage
  const [state, setState] = useState<AppState>(() => {
    try {
      localStorage.removeItem('my_hisab_app_state_v1');
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored) as AppState;
        if (parsed && parsed.version === 2 && Array.isArray(parsed.expenses) && Array.isArray(parsed.incomes)) {
          return {
            ...parsed,
            budget: { ...DEFAULT_BUDGET, ...parsed.budget },
          };
        }
      }
    } catch (e) {
      console.error('Failed to load stored state', e);
    }
    return getInitialSeedData();
  });

  // Save to localStorage on state changes
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch (e) {
      console.error('Failed to save to localStorage', e);
    }
  }, [state]);

  const showToast = (message: string, type: 'success' | 'info' | 'error' = 'success') => {
    const id = `${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
    setToasts((prev) => [...prev, { id, type, message }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3500);
  };

  const dismissToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // Add Expense
  const addExpense = (data: Omit<Expense, 'id' | 'createdAt'>): string => {
    const id = `exp-${Date.now()}`;
    const newExpense: Expense = {
      ...data,
      amount: Number(data.amount) || 0,
      id,
      createdAt: new Date().toISOString(),
    };
    setState((prev) => ({
      ...prev,
      expenses: [newExpense, ...prev.expenses],
    }));
    showToast(`Added expense: ৳${newExpense.amount} (${newExpense.category})`);
    return id;
  };

  const updateExpense = (id: string, data: Partial<Omit<Expense, 'id' | 'createdAt'>>) => {
    setState((prev) => ({
      ...prev,
      expenses: prev.expenses.map((exp) =>
        exp.id === id
          ? {
              ...exp,
              ...data,
              amount: data.amount !== undefined ? Number(data.amount) || 0 : exp.amount,
            }
          : exp
      ),
    }));
    showToast('Expense updated successfully');
  };

  const deleteExpense = (id: string) => {
    setState((prev) => ({
      ...prev,
      expenses: prev.expenses.filter((exp) => exp.id !== id),
      // If linked with family payment, unlink
      familyPayments: prev.familyPayments.map((fam) =>
        fam.expenseId === id ? { ...fam, expenseId: undefined } : fam
      ),
    }));
    showToast('Expense deleted', 'info');
  };

  // Income operations
  const addIncome = (data: Omit<Income, 'id' | 'createdAt'>): string => {
    const id = `inc-${Date.now()}`;
    const newIncome: Income = {
      ...data,
      amount: Number(data.amount) || 0,
      id,
      createdAt: new Date().toISOString(),
    };
    setState((prev) => ({
      ...prev,
      incomes: [newIncome, ...prev.incomes],
    }));
    showToast(`Recorded income: ৳${newIncome.amount} (${newIncome.source})`);
    return id;
  };

  const updateIncome = (id: string, data: Partial<Omit<Income, 'id' | 'createdAt'>>) => {
    setState((prev) => ({
      ...prev,
      incomes: prev.incomes.map((inc) =>
        inc.id === id
          ? {
              ...inc,
              ...data,
              amount: data.amount !== undefined ? Number(data.amount) || 0 : inc.amount,
            }
          : inc
      ),
    }));
    showToast('Income record updated');
  };

  const deleteIncome = (id: string) => {
    setState((prev) => ({
      ...prev,
      incomes: prev.incomes.filter((inc) => inc.id !== id),
    }));
    showToast('Income entry deleted', 'info');
  };

  // Family support payments
  const addFamilyPayment = (
    payment: Omit<FamilySupportPayment, 'id' | 'createdAt' | 'expenseId'>,
    syncExpense: boolean = true
  ): string => {
    const famId = `fam-${Date.now()}`;
    let expId: string | undefined = undefined;

    if (syncExpense) {
      expId = `exp-${Date.now()}-fam`;
      const linkedExpense: Expense = {
        id: expId,
        date: payment.date,
        category: 'Family Support',
        amount: Number(payment.amount) || 0,
        shopOrLocation: payment.recipient,
        description: payment.description || `Family support sent to ${payment.recipient}`,
        paymentMethod: payment.paymentMethod,
        createdAt: new Date().toISOString(),
      };
      setState((prev) => ({
        ...prev,
        expenses: [linkedExpense, ...prev.expenses],
        familyPayments: [
          {
            ...payment,
            amount: Number(payment.amount) || 0,
            id: famId,
            expenseId: expId,
            createdAt: new Date().toISOString(),
          },
          ...prev.familyPayments,
        ],
      }));
    } else {
      setState((prev) => ({
        ...prev,
        familyPayments: [
          {
            ...payment,
            amount: Number(payment.amount) || 0,
            id: famId,
            createdAt: new Date().toISOString(),
          },
          ...prev.familyPayments,
        ],
      }));
    }

    showToast(`Recorded family support: ৳${payment.amount} for ${payment.recipient}`);
    return famId;
  };

  const updateFamilyPayment = (id: string, data: Partial<FamilySupportPayment>) => {
    setState((prev) => {
      const famItem = prev.familyPayments.find((f) => f.id === id);
      const updatedFam = prev.familyPayments.map((f) =>
        f.id === id
          ? {
              ...f,
              ...data,
              amount: data.amount !== undefined ? Number(data.amount) || 0 : f.amount,
            }
          : f
      );

      let updatedExpenses = prev.expenses;
      if (famItem?.expenseId) {
        updatedExpenses = prev.expenses.map((e) =>
          e.id === famItem.expenseId
            ? {
                ...e,
                amount: data.amount !== undefined ? Number(data.amount) || 0 : e.amount,
                date: data.date || e.date,
                paymentMethod: data.paymentMethod || e.paymentMethod,
                shopOrLocation: data.recipient || e.shopOrLocation,
                description: data.description || e.description,
              }
            : e
        );
      }

      return {
        ...prev,
        familyPayments: updatedFam,
        expenses: updatedExpenses,
      };
    });
    showToast('Family payment updated');
  };

  const deleteFamilyPayment = (id: string) => {
    setState((prev) => {
      const famItem = prev.familyPayments.find((f) => f.id === id);
      const expId = famItem?.expenseId;
      return {
        ...prev,
        familyPayments: prev.familyPayments.filter((f) => f.id !== id),
        expenses: expId ? prev.expenses.filter((e) => e.id !== expId) : prev.expenses,
      };
    });
    showToast('Family support payment deleted', 'info');
  };

  // Savings transactions
  const addSavingsTransaction = (tx: Omit<SavingsTransaction, 'id' | 'createdAt'>): string => {
    const id = `sav-${Date.now()}`;
    const newTx: SavingsTransaction = {
      ...tx,
      amount: Number(tx.amount) || 0,
      id,
      createdAt: new Date().toISOString(),
    };
    setState((prev) => ({
      ...prev,
      savingsTransactions: [newTx, ...prev.savingsTransactions],
    }));
    showToast(
      `${newTx.type === 'deposit' ? 'Deposited' : 'Withdrew'} ৳${newTx.amount} (${newTx.accountOrGoal})`
    );
    return id;
  };

  const deleteSavingsTransaction = (id: string) => {
    setState((prev) => ({
      ...prev,
      savingsTransactions: prev.savingsTransactions.filter((s) => s.id !== id),
    }));
    showToast('Savings record deleted', 'info');
  };

  // Debt operations
  const addDebt = (debt: Omit<DebtItem, 'id' | 'status' | 'repayments' | 'createdAt'>): string => {
    const id = `debt-${Date.now()}`;
    const newDebt: DebtItem = {
      ...debt,
      totalAmount: Number(debt.totalAmount) || 0,
      id,
      status: 'unpaid',
      repayments: [],
      createdAt: new Date().toISOString(),
    };
    setState((prev) => ({
      ...prev,
      debts: [newDebt, ...prev.debts],
    }));
    showToast(`Added debt record for ${debt.personName} (৳${debt.totalAmount})`);
    return id;
  };

  const updateDebt = (id: string, data: Partial<DebtItem>) => {
    setState((prev) => ({
      ...prev,
      debts: prev.debts.map((d) => {
        if (d.id !== id) return d;
        const total = data.totalAmount !== undefined ? Number(data.totalAmount) || 0 : d.totalAmount;
        const repayments = data.repayments || d.repayments;
        const status = calculateDebtItemStatus(total, repayments);
        return {
          ...d,
          ...data,
          totalAmount: total,
          repayments,
          status,
        };
      }),
    }));
    showToast('Debt details updated');
  };

  const deleteDebt = (id: string) => {
    setState((prev) => ({
      ...prev,
      debts: prev.debts.filter((d) => d.id !== id),
    }));
    showToast('Debt record removed', 'info');
  };

  const addDebtRepayment = (
    debtId: string,
    repayment: { amount: number; note: string; date: string }
  ) => {
    const repId = `rep-${Date.now()}`;
    setState((prev) => ({
      ...prev,
      debts: prev.debts.map((d) => {
        if (d.id !== debtId) return d;
        const updatedRepayments = [
          ...d.repayments,
          {
            id: repId,
            amount: Number(repayment.amount) || 0,
            note: repayment.note,
            date: repayment.date,
            createdAt: new Date().toISOString(),
          },
        ];
        const status = calculateDebtItemStatus(d.totalAmount, updatedRepayments);
        return {
          ...d,
          repayments: updatedRepayments,
          status,
        };
      }),
    }));
    showToast(`Repayment of ৳${repayment.amount} recorded`);
  };

  const deleteDebtRepayment = (debtId: string, repaymentId: string) => {
    setState((prev) => ({
      ...prev,
      debts: prev.debts.map((d) => {
        if (d.id !== debtId) return d;
        const updatedRepayments = d.repayments.filter((r) => r.id !== repaymentId);
        const status = calculateDebtItemStatus(d.totalAmount, updatedRepayments);
        return {
          ...d,
          repayments: updatedRepayments,
          status,
        };
      }),
    }));
    showToast('Repayment record deleted', 'info');
  };

  // Budget settings
  const updateBudget = (budgetUpdates: Partial<BudgetSettings>) => {
    setState((prev) => ({
      ...prev,
      budget: {
        ...prev.budget,
        ...budgetUpdates,
      },
    }));
    showToast('Budget settings updated successfully');
  };

  // Backup data as JSON download
  const backupJSON = () => {
    const jsonString = JSON.stringify(state, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    const dateStr = getCurrentDateStr();
    link.href = url;
    link.download = `my-hisab-backup-${dateStr}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    showToast('Backup file downloaded');
  };

  // Restore data from JSON string
  const restoreJSON = (jsonStr: string): boolean => {
    try {
      const parsed = JSON.parse(jsonStr) as AppState;
      if (
        parsed &&
        Array.isArray(parsed.expenses) &&
        Array.isArray(parsed.incomes) &&
        typeof parsed.budget === 'object'
      ) {
        setState({
          version: parsed.version || 1,
          budget: { ...DEFAULT_BUDGET, ...parsed.budget },
          expenses: parsed.expenses || [],
          incomes: parsed.incomes || [],
          familyPayments: parsed.familyPayments || [],
          savingsTransactions: parsed.savingsTransactions || [],
          debts: parsed.debts || [],
        });
        showToast('Data restored successfully!');
        return true;
      } else {
        throw new Error('Invalid structure');
      }
    } catch (e) {
      console.error(e);
      showToast('Failed to restore data: invalid JSON file format', 'error');
      return false;
    }
  };

  // Reset data to empty
  const resetAllData = () => {
    const emptyState: AppState = {
      version: 1,
      budget: { ...DEFAULT_BUDGET },
      expenses: [],
      incomes: [],
      familyPayments: [],
      savingsTransactions: [],
      debts: [],
    };
    setState(emptyState);
    localStorage.removeItem(STORAGE_KEY);
    showToast('All transaction records have been reset', 'info');
  };

  return (
    <FinanceContext.Provider
      value={{
        state,
        activeTab,
        setActiveTab,
        selectedMonth,
        setSelectedMonth,
        addExpense,
        updateExpense,
        deleteExpense,
        addIncome,
        updateIncome,
        deleteIncome,
        addFamilyPayment,
        updateFamilyPayment,
        deleteFamilyPayment,
        addSavingsTransaction,
        deleteSavingsTransaction,
        addDebt,
        updateDebt,
        deleteDebt,
        addDebtRepayment,
        deleteDebtRepayment,
        updateBudget,
        backupJSON,
        restoreJSON,
        resetAllData,
        toasts,
        dismissToast,
        showToast,
      }}
    >
      {children}
    </FinanceContext.Provider>
  );
};

export function useFinance() {
  const context = useContext(FinanceContext);
  if (!context) {
    throw new Error('useFinance must be used within a FinanceProvider');
  }
  return context;
}
