/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  PlusCircle,
  Search,
  Filter,
  Edit2,
  Trash2,
  Receipt,
  Store,
  CreditCard,
  Calendar,
  X,
  FileText,
} from 'lucide-react';
import { useFinance } from '../../context/FinanceContext';
import {
  EXPENSE_CATEGORIES,
  Expense,
  ExpenseCategory,
  PAYMENT_METHODS,
  PaymentMethod,
} from '../../types/finance';
import { filterByMonth, formatBDT, getCurrentDateStr } from '../../utils/finance';
import { ConfirmModal } from '../common/ConfirmModal';

export const AddExpenseView: React.FC = () => {
  const { state, addExpense, updateExpense, deleteExpense, selectedMonth } = useFinance();

  // Form State
  const [date, setDate] = useState(getCurrentDateStr());
  const [category, setCategory] = useState<ExpenseCategory>('Food');
  const [amount, setAmount] = useState('');
  const [shopOrLocation, setShopOrLocation] = useState('');
  const [description, setDescription] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('Cash');

  // Filter & Search State
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilterCategory, setSelectedFilterCategory] = useState<string>('all');

  // Edit State
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);

  // Delete Confirmation State
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Quick Amount presets
  const quickAmounts = [50, 100, 250, 500, 1000, 2000];

  const handleSaveExpense = (e: React.FormEvent) => {
    e.preventDefault();
    const parsedAmount = Number(amount);
    if (!parsedAmount || parsedAmount <= 0) return;

    addExpense({
      date,
      category,
      amount: parsedAmount,
      shopOrLocation: shopOrLocation.trim() || category,
      description: description.trim(),
      paymentMethod,
    });

    // Reset inputs
    setAmount('');
    setShopOrLocation('');
    setDescription('');
  };

  const handleUpdateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingExpense) return;
    const parsedAmount = Number(editingExpense.amount);
    if (!parsedAmount || parsedAmount <= 0) return;

    updateExpense(editingExpense.id, {
      date: editingExpense.date,
      category: editingExpense.category,
      amount: parsedAmount,
      shopOrLocation: editingExpense.shopOrLocation,
      description: editingExpense.description,
      paymentMethod: editingExpense.paymentMethod,
    });

    setEditingExpense(null);
  };

  // Filter expenses for selected month & search query
  const monthExpenses = filterByMonth(state.expenses, selectedMonth);
  const filteredExpenses = monthExpenses.filter((exp) => {
    const matchesSearch =
      searchQuery === '' ||
      exp.shopOrLocation.toLowerCase().includes(searchQuery.toLowerCase()) ||
      exp.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      exp.category.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesCategory =
      selectedFilterCategory === 'all' || exp.category === selectedFilterCategory;

    return matchesSearch && matchesCategory;
  });

  const totalFilteredAmount = filteredExpenses.reduce(
    (sum, exp) => sum + (Number(exp.amount) || 0),
    0
  );

  return (
    <div className="space-y-6 pb-20 md:pb-6">
      {/* Header */}
      <div>
        <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
          Daily Expense Tracker
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
          Record daily expenditures with shops, categories, and payment methods
        </p>
      </div>

      {/* Expense Entry Form Card */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 shadow-2xs space-y-5">
        <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
          <div className="w-8 h-8 rounded-xl bg-[#EAF3FF] text-[#1769D2] flex items-center justify-center">
            <PlusCircle className="w-5 h-5 text-[#1769D2]" />
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-900">New Expense Entry</h2>
            <p className="text-xs text-slate-500">Add an expense to your daily account</p>
          </div>
        </div>

        <form onSubmit={handleSaveExpense} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {/* Amount with quick chips */}
            <div className="sm:col-span-1">
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Amount (৳ BDT) <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <span className="absolute left-3.5 top-2.5 text-slate-400 font-bold">৳</span>
                <input
                  type="number"
                  required
                  min="1"
                  step="any"
                  placeholder="250"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="w-full pl-8 pr-3.5 py-2.5 rounded-xl border border-slate-200 text-sm font-semibold focus:ring-2 focus:ring-[#1769D2] outline-hidden"
                />
              </div>

              {/* Quick Preset Buttons */}
              <div className="flex flex-wrap gap-1 mt-2">
                {quickAmounts.map((preset) => (
                  <button
                    key={preset}
                    type="button"
                    onClick={() => setAmount(preset.toString())}
                    className="px-2 py-0.5 rounded-md bg-slate-100 hover:bg-[#EAF3FF] hover:text-[#1769D2] text-[11px] font-medium text-slate-600 transition"
                  >
                    ৳{preset}
                  </button>
                ))}
              </div>
            </div>

            {/* Category */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Category <span className="text-red-500">*</span>
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as ExpenseCategory)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm font-medium focus:ring-2 focus:ring-[#1769D2] outline-hidden bg-white"
              >
                {EXPENSE_CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            {/* Date */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Date <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                required
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm font-medium focus:ring-2 focus:ring-[#1769D2] outline-hidden"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {/* Shop or Location */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Shop or Location Name
              </label>
              <div className="relative">
                <Store className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <input
                  type="text"
                  placeholder="e.g. Agora / Local Bazar / Landlord"
                  value={shopOrLocation}
                  onChange={(e) => setShopOrLocation(e.target.value)}
                  className="w-full pl-9 pr-3.5 py-2.5 rounded-xl border border-slate-200 text-sm font-medium focus:ring-2 focus:ring-[#1769D2] outline-hidden"
                />
              </div>
            </div>

            {/* Payment Method */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Payment Method <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <CreditCard className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <select
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value as PaymentMethod)}
                  className="w-full pl-9 pr-3.5 py-2.5 rounded-xl border border-slate-200 text-sm font-medium focus:ring-2 focus:ring-[#1769D2] outline-hidden bg-white"
                >
                  {PAYMENT_METHODS.map((method) => (
                    <option key={method} value={method}>
                      {method}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Description */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Description / Item Details
              </label>
              <div className="relative">
                <FileText className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <input
                  type="text"
                  placeholder="e.g. Vegetables, eggs, rice for mess"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full pl-9 pr-3.5 py-2.5 rounded-xl border border-slate-200 text-sm font-medium focus:ring-2 focus:ring-[#1769D2] outline-hidden"
                />
              </div>
            </div>
          </div>

          <div className="pt-2 flex justify-end">
            <button
              type="submit"
              className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-[#1769D2] hover:bg-[#1255ab] text-white text-sm font-bold transition active:scale-95 shadow-xs"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Save Expense</span>
            </button>
          </div>
        </form>
      </div>

      {/* Searchable Expenses Table Section */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-2xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
          <div>
            <div className="flex items-center gap-2">
              <Receipt className="w-5 h-5 text-[#1769D2]" />
              <h2 className="text-base font-bold text-slate-900">Expenses for {selectedMonth}</h2>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Showing {filteredExpenses.length} records • Total:{' '}
              <span className="font-bold text-red-600">{formatBDT(totalFilteredAmount)}</span>
            </p>
          </div>

          {/* Search & Filter Controls */}
          <div className="flex flex-wrap items-center gap-2">
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Search shop, note..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-8.5 pr-3 py-1.5 rounded-xl border border-slate-200 text-xs font-medium focus:ring-2 focus:ring-[#1769D2] outline-hidden w-44 sm:w-56"
              />
            </div>

            <div className="relative">
              <select
                value={selectedFilterCategory}
                onChange={(e) => setSelectedFilterCategory(e.target.value)}
                className="px-3 py-1.5 rounded-xl border border-slate-200 text-xs font-semibold focus:ring-2 focus:ring-[#1769D2] outline-hidden bg-white text-slate-700"
              >
                <option value="all">All Categories</option>
                {EXPENSE_CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Expenses Table */}
        {filteredExpenses.length === 0 ? (
          <div className="py-12 text-center text-slate-400 text-sm">
            No expenses matching your filter. Use the form above to add an expense.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs sm:text-sm">
              <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
                <tr>
                  <th className="py-3 px-3">Date</th>
                  <th className="py-3 px-3">Category</th>
                  <th className="py-3 px-3">Shop / Location</th>
                  <th className="py-3 px-3">Description</th>
                  <th className="py-3 px-3">Method</th>
                  <th className="py-3 px-3 text-right">Amount</th>
                  <th className="py-3 px-3 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredExpenses.map((exp) => (
                  <tr key={exp.id} className="hover:bg-slate-50/70 transition">
                    <td className="py-3 px-3 whitespace-nowrap font-medium text-slate-600">
                      {exp.date}
                    </td>
                    <td className="py-3 px-3 whitespace-nowrap">
                      <span className="px-2 py-0.5 rounded-md font-semibold text-xs bg-[#EAF3FF] text-[#1769D2]">
                        {exp.category}
                      </span>
                    </td>
                    <td className="py-3 px-3 font-semibold text-slate-800">
                      {exp.shopOrLocation || '-'}
                    </td>
                    <td className="py-3 px-3 text-slate-600 max-w-xs truncate">
                      {exp.description || '-'}
                    </td>
                    <td className="py-3 px-3 whitespace-nowrap text-slate-500">
                      <span className="px-2 py-0.5 rounded bg-slate-100 text-[11px] font-medium">
                        {exp.paymentMethod}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-right whitespace-nowrap font-bold text-red-600">
                      -{formatBDT(exp.amount)}
                    </td>
                    <td className="py-3 px-3 text-center whitespace-nowrap">
                      <div className="flex items-center justify-center gap-1">
                        <button
                          onClick={() => setEditingExpense(exp)}
                          aria-label={`Edit expense ${exp.shopOrLocation}`}
                          className="p-1.5 rounded-lg text-slate-500 hover:text-[#1769D2] hover:bg-blue-50 transition"
                          title="Edit"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setDeletingId(exp.id)}
                          aria-label={`Delete expense ${exp.shopOrLocation}`}
                          className="p-1.5 rounded-lg text-slate-500 hover:text-red-600 hover:bg-red-50 transition"
                          title="Delete"
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

            <form onSubmit={handleUpdateSubmit} className="mt-4 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">
                  Amount (৳ BDT)
                </label>
                <input
                  type="number"
                  required
                  min="1"
                  step="any"
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
                  Shop / Location
                </label>
                <input
                  type="text"
                  value={editingExpense.shopOrLocation}
                  onChange={(e) =>
                    setEditingExpense({ ...editingExpense, shopOrLocation: e.target.value })
                  }
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-sm font-medium focus:ring-2 focus:ring-[#1769D2] outline-hidden"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">
                    Payment Method
                  </label>
                  <select
                    value={editingExpense.paymentMethod}
                    onChange={(e) =>
                      setEditingExpense({
                        ...editingExpense,
                        paymentMethod: e.target.value as PaymentMethod,
                      })
                    }
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-medium focus:ring-2 focus:ring-[#1769D2] outline-hidden bg-white"
                  >
                    {PAYMENT_METHODS.map((method) => (
                      <option key={method} value={method}>
                        {method}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">
                    Description
                  </label>
                  <input
                    type="text"
                    value={editingExpense.description}
                    onChange={(e) =>
                      setEditingExpense({ ...editingExpense, description: e.target.value })
                    }
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-medium focus:ring-2 focus:ring-[#1769D2] outline-hidden"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setEditingExpense(null)}
                  className="px-4 py-2.5 rounded-xl border border-slate-200 text-sm font-semibold text-slate-600 hover:bg-slate-50 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-[#1769D2] hover:bg-[#1255ab] text-white text-sm font-semibold transition active:scale-95 shadow-sm"
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
        isOpen={!!deletingId}
        title="Delete Expense Record"
        message="Are you sure you want to permanently delete this expense? This action will immediately adjust your remaining balance and monthly expense totals."
        confirmLabel="Delete"
        isDestructive={true}
        onConfirm={() => {
          if (deletingId) {
            deleteExpense(deletingId);
            setDeletingId(null);
          }
        }}
        onCancel={() => setDeletingId(null)}
      />
    </div>
  );
};
