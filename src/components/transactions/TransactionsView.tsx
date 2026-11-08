/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import {
  ArrowLeftRight,
  Search,
  Filter,
  Calendar,
  Edit2,
  Trash2,
  Download,
  X,
  FileSpreadsheet,
} from 'lucide-react';
import { useFinance } from '../../context/FinanceContext';
import {
  EXPENSE_CATEGORIES,
  Expense,
  ExpenseCategory,
  Income,
  PaymentMethod,
  PAYMENT_METHODS,
} from '../../types/finance';
import { exportToCSV, formatBDT } from '../../utils/finance';
import { ConfirmModal } from '../common/ConfirmModal';

interface UnifiedTransaction {
  id: string;
  sourceType: 'expense' | 'income' | 'savings' | 'family';
  date: string;
  category: string;
  description: string;
  paymentMethod?: string;
  amount: number;
  isPositive: boolean;
  originalItem: unknown;
}

export const TransactionsView: React.FC = () => {
  const {
    state,
    deleteExpense,
    deleteIncome,
    deleteSavingsTransaction,
    deleteFamilyPayment,
    updateExpense,
    updateIncome,
  } = useFinance();

  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<'all' | 'expense' | 'income' | 'savings' | 'family'>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  // Delete modal state
  const [deletingTx, setDeletingTx] = useState<UnifiedTransaction | null>(null);

  // Edit Expense / Income modal
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);
  const [editingIncome, setEditingIncome] = useState<Income | null>(null);

  // Build unified transactions list
  const allTransactions: UnifiedTransaction[] = useMemo(() => {
    const list: UnifiedTransaction[] = [];

    // Expenses
    state.expenses.forEach((e) => {
      list.push({
        id: e.id,
        sourceType: 'expense',
        date: e.date,
        category: e.category,
        description: e.description || e.shopOrLocation || 'Expense',
        paymentMethod: e.paymentMethod,
        amount: e.amount,
        isPositive: false,
        originalItem: e,
      });
    });

    // Incomes
    state.incomes.forEach((i) => {
      list.push({
        id: i.id,
        sourceType: 'income',
        date: i.date,
        category: i.source,
        description: i.description || i.source,
        paymentMethod: i.paymentMethod,
        amount: i.amount,
        isPositive: true,
        originalItem: i,
      });
    });

    // Savings Transactions
    state.savingsTransactions.forEach((s) => {
      list.push({
        id: s.id,
        sourceType: 'savings',
        date: s.date,
        category: s.type === 'deposit' ? 'Savings Deposit' : 'Savings Withdrawal',
        description: `${s.accountOrGoal} - ${s.description}`,
        amount: s.amount,
        isPositive: s.type === 'withdrawal', // withdrawal brings money into balance
        originalItem: s,
      });
    });

    // Sort by date descending
    return list.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [state]);

  // Filtered transactions
  const filteredTransactions = useMemo(() => {
    return allTransactions.filter((tx) => {
      // Type filter
      if (typeFilter !== 'all' && tx.sourceType !== typeFilter) return false;

      // Category filter
      if (categoryFilter !== 'all' && tx.category !== categoryFilter) return false;

      // Date range filter
      if (startDate && tx.date < startDate) return false;
      if (endDate && tx.date > endDate) return false;

      // Text search
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchesCat = tx.category.toLowerCase().includes(query);
        const matchesDesc = tx.description.toLowerCase().includes(query);
        const matchesMethod = (tx.paymentMethod || '').toLowerCase().includes(query);
        if (!matchesCat && !matchesDesc && !matchesMethod) return false;
      }

      return true;
    });
  }, [allTransactions, typeFilter, categoryFilter, startDate, endDate, searchQuery]);

  const handleEditClick = (tx: UnifiedTransaction) => {
    if (tx.sourceType === 'expense') {
      setEditingExpense(tx.originalItem as Expense);
    } else if (tx.sourceType === 'income') {
      setEditingIncome(tx.originalItem as Income);
    }
  };

  const handleDeleteConfirm = () => {
    if (!deletingTx) return;
    if (deletingTx.sourceType === 'expense') {
      deleteExpense(deletingTx.id);
    } else if (deletingTx.sourceType === 'income') {
      deleteIncome(deletingTx.id);
    } else if (deletingTx.sourceType === 'savings') {
      deleteSavingsTransaction(deletingTx.id);
    } else if (deletingTx.sourceType === 'family') {
      deleteFamilyPayment(deletingTx.id);
    }
    setDeletingTx(null);
  };

  const handleExportCSV = () => {
    const csvData = filteredTransactions.map((tx) => ({
      Date: tx.date,
      Type: tx.sourceType.toUpperCase(),
      Category: tx.category,
      Description: tx.description,
      PaymentMethod: tx.paymentMethod || 'N/A',
      Amount: tx.amount,
      Direction: tx.isPositive ? 'INCOME' : 'EXPENSE',
    }));
    exportToCSV(csvData, `my-hisab-transactions-${new Date().toISOString().slice(0, 10)}`);
  };

  const resetFilters = () => {
    setSearchQuery('');
    setTypeFilter('all');
    setCategoryFilter('all');
    setStartDate('');
    setEndDate('');
  };

  return (
    <div className="space-y-6 pb-20 md:pb-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            Transaction History
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Complete searchable ledger of all expenses, incomes, savings, and contributions
          </p>
        </div>

        <button
          onClick={handleExportCSV}
          className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs sm:text-sm font-bold transition active:scale-95 border border-slate-200 self-start sm:self-auto"
        >
          <Download className="w-4 h-4 text-[#1769D2]" />
          <span>Export CSV</span>
        </button>
      </div>

      {/* Advanced Filter Bar Card */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-5 shadow-2xs space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-[#1769D2]" />
            <h2 className="text-xs sm:text-sm font-bold text-slate-800">Filter Transactions</h2>
          </div>
          {(searchQuery || typeFilter !== 'all' || categoryFilter !== 'all' || startDate || endDate) && (
            <button
              onClick={resetFilters}
              className="text-xs font-semibold text-[#1769D2] hover:underline"
            >
              Reset Filters
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          {/* Search */}
          <div className="relative lg:col-span-2">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search description, shop..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-8.5 pr-3 py-2 rounded-xl border border-slate-200 text-xs font-medium focus:ring-2 focus:ring-[#1769D2] outline-hidden"
            />
          </div>

          {/* Type Filter */}
          <div>
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value as unknown as typeof typeFilter)}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold focus:ring-2 focus:ring-[#1769D2] outline-hidden bg-white text-slate-700"
            >
              <option value="all">All Types</option>
              <option value="expense">Expenses Only</option>
              <option value="income">Incomes Only</option>
              <option value="savings">Savings Only</option>
            </select>
          </div>

          {/* Start Date */}
          <div>
            <input
              type="date"
              placeholder="Start Date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-medium focus:ring-2 focus:ring-[#1769D2] outline-hidden"
            />
          </div>

          {/* End Date */}
          <div>
            <input
              type="date"
              placeholder="End Date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-medium focus:ring-2 focus:ring-[#1769D2] outline-hidden"
            />
          </div>
        </div>
      </div>

      {/* Transactions Table Card */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-2xs space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <ArrowLeftRight className="w-5 h-5 text-[#1769D2]" />
            <h2 className="text-base font-bold text-slate-900">
              Transactions ({filteredTransactions.length})
            </h2>
          </div>
        </div>

        {filteredTransactions.length === 0 ? (
          <div className="py-12 text-center text-slate-400 text-sm">
            No transactions match the selected criteria.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs sm:text-sm">
              <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
                <tr>
                  <th className="py-3 px-3">Date</th>
                  <th className="py-3 px-3">Type</th>
                  <th className="py-3 px-3">Category / Source</th>
                  <th className="py-3 px-3">Description</th>
                  <th className="py-3 px-3">Method</th>
                  <th className="py-3 px-3 text-right">Amount</th>
                  <th className="py-3 px-3 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredTransactions.map((tx) => (
                  <tr key={`${tx.sourceType}-${tx.id}`} className="hover:bg-slate-50/70 transition">
                    <td className="py-3 px-3 whitespace-nowrap font-medium text-slate-600">
                      {tx.date}
                    </td>
                    <td className="py-3 px-3 whitespace-nowrap">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                          tx.sourceType === 'income'
                            ? 'bg-emerald-100 text-emerald-700'
                            : tx.sourceType === 'expense'
                            ? 'bg-red-100 text-red-700'
                            : 'bg-indigo-100 text-indigo-700'
                        }`}
                      >
                        {tx.sourceType}
                      </span>
                    </td>
                    <td className="py-3 px-3 whitespace-nowrap font-bold text-slate-800">
                      {tx.category}
                    </td>
                    <td className="py-3 px-3 text-slate-600 max-w-xs truncate">
                      {tx.description}
                    </td>
                    <td className="py-3 px-3 whitespace-nowrap text-slate-500">
                      {tx.paymentMethod ? (
                        <span className="px-2 py-0.5 rounded bg-slate-100 text-[11px] font-medium">
                          {tx.paymentMethod}
                        </span>
                      ) : (
                        '-'
                      )}
                    </td>
                    <td
                      className={`py-3 px-3 text-right whitespace-nowrap font-black ${
                        tx.isPositive ? 'text-emerald-600' : 'text-red-600'
                      }`}
                    >
                      {tx.isPositive ? '+' : '-'}
                      {formatBDT(tx.amount)}
                    </td>
                    <td className="py-3 px-3 text-center whitespace-nowrap">
                      <div className="flex items-center justify-center gap-1">
                        {(tx.sourceType === 'expense' || tx.sourceType === 'income') && (
                          <button
                            onClick={() => handleEditClick(tx)}
                            aria-label={`Edit ${tx.category}`}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-[#1769D2] hover:bg-blue-50 transition"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                        )}
                        <button
                          onClick={() => setDeletingTx(tx)}
                          aria-label={`Delete ${tx.category}`}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Edit Expense Modal */}
      {editingExpense && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs"
        >
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl border border-slate-100 text-slate-800">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-bold text-slate-900 text-lg">Edit Expense</h3>
              <button
                onClick={() => setEditingExpense(null)}
                className="text-slate-400 hover:text-slate-600 p-1"
                aria-label="Close"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                updateExpense(editingExpense.id, {
                  amount: Number(editingExpense.amount),
                  category: editingExpense.category,
                  date: editingExpense.date,
                  shopOrLocation: editingExpense.shopOrLocation,
                  description: editingExpense.description,
                  paymentMethod: editingExpense.paymentMethod,
                });
                setEditingExpense(null);
              }}
              className="mt-4 space-y-4"
            >
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">
                  Amount (৳ BDT)
                </label>
                <input
                  type="number"
                  required
                  min="1"
                  value={editingExpense.amount}
                  onChange={(e) =>
                    setEditingExpense({ ...editingExpense, amount: Number(e.target.value) })
                  }
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm font-bold focus:ring-2 focus:ring-[#1769D2] outline-hidden"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">
                    Category
                  </label>
                  <select
                    value={editingExpense.category}
                    onChange={(e) =>
                      setEditingExpense({
                        ...editingExpense,
                        category: e.target.value as ExpenseCategory,
                      })
                    }
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-medium focus:ring-2 focus:ring-[#1769D2] outline-hidden bg-white"
                  >
                    {EXPENSE_CATEGORIES.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Date</label>
                  <input
                    type="date"
                    required
                    value={editingExpense.date}
                    onChange={(e) =>
                      setEditingExpense({ ...editingExpense, date: e.target.value })
                    }
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-medium focus:ring-2 focus:ring-[#1769D2] outline-hidden"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">
                  Shop / Description
                </label>
                <input
                  type="text"
                  value={editingExpense.description || editingExpense.shopOrLocation}
                  onChange={(e) =>
                    setEditingExpense({
                      ...editingExpense,
                      description: e.target.value,
                      shopOrLocation: e.target.value,
                    })
                  }
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm font-medium focus:ring-2 focus:ring-[#1769D2] outline-hidden"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setEditingExpense(null)}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-600"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-[#1769D2] text-white text-xs font-bold"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={!!deletingTx}
        title="Delete Transaction"
        message="Are you sure you want to permanently delete this transaction record? All totals and remaining balances will immediately update."
        confirmLabel="Delete"
        isDestructive={true}
        onConfirm={handleDeleteConfirm}
        onCancel={() => setDeletingTx(null)}
      />
    </div>
  );
};
