/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  PiggyBank,
  PlusCircle,
  MinusCircle,
  TrendingUp,
  Target,
  Sparkles,
  Trash2,
  Calendar,
  X,
  ShieldCheck,
  CheckCircle,
} from 'lucide-react';
import { useFinance } from '../../context/FinanceContext';
import { calculateSavingsSummary, formatBDT, getCurrentDateStr } from '../../utils/finance';
import { ConfirmModal } from '../common/ConfirmModal';

export const SavingsView: React.FC = () => {
  const {
    state,
    selectedMonth,
    addSavingsTransaction,
    deleteSavingsTransaction,
    updateBudget,
  } = useFinance();

  const summary = calculateSavingsSummary(
    state.savingsTransactions,
    state.budget.monthlySavingsTarget,
    selectedMonth
  );

  // Modal State for Deposit/Withdrawal
  const [modalType, setModalType] = useState<'deposit' | 'withdrawal' | null>(null);
  const [amount, setAmount] = useState('');
  const [accountOrGoal, setAccountOrGoal] = useState('DPS Bank Account');
  const [description, setDescription] = useState('');
  const [txDate, setTxDate] = useState(getCurrentDateStr());

  // Target Editor State
  const [isEditingTarget, setIsEditingTarget] = useState(false);
  const [targetInput, setTargetInput] = useState(state.budget.monthlySavingsTarget.toString());

  // Delete Confirm State
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const monthProgress =
    summary.monthlyTarget > 0
      ? Math.round((summary.thisMonthNetSavings / summary.monthlyTarget) * 100)
      : 0;

  const handleSaveTx = (e: React.FormEvent) => {
    e.preventDefault();
    if (!modalType) return;
    const parsed = Number(amount);
    if (!parsed || parsed <= 0) return;

    addSavingsTransaction({
      type: modalType,
      amount: parsed,
      accountOrGoal: accountOrGoal.trim() || 'Savings Fund',
      date: txDate,
      description: description.trim() || `${modalType === 'deposit' ? 'Deposit to' : 'Withdrawal from'} ${accountOrGoal}`,
    });

    setAmount('');
    setDescription('');
    setModalType(null);
  };

  const handleSaveTarget = (e: React.FormEvent) => {
    e.preventDefault();
    const val = Number(targetInput);
    if (val >= 0) {
      updateBudget({ monthlySavingsTarget: val });
      setIsEditingTarget(false);
    }
  };

  return (
    <div className="space-y-6 pb-20 md:pb-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            Savings Tracker
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Grow your emergency funds, DPS, and track deposits & withdrawals for{' '}
            <span className="font-semibold text-slate-700">{selectedMonth}</span>
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              setModalType('deposit');
              setAccountOrGoal('DPS Bank Account');
            }}
            className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs sm:text-sm font-bold transition active:scale-95 shadow-xs"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Deposit</span>
          </button>
          <button
            onClick={() => {
              setModalType('withdrawal');
              setAccountOrGoal('Emergency Fund');
            }}
            className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs sm:text-sm font-bold transition active:scale-95 border border-slate-200"
          >
            <MinusCircle className="w-4 h-4 text-slate-600" />
            <span>Withdraw</span>
          </button>
        </div>
      </div>

      {/* 4 Savings Metrics KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* 1. Total Saved */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Total Saved (All-Time)</span>
            <div className="p-2 rounded-xl bg-indigo-50 text-indigo-600">
              <PiggyBank className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-indigo-600 mt-2">
            {formatBDT(summary.totalSavingsAllTime)}
          </div>
          <p className="text-[11px] text-slate-500 mt-1">Across all accounts & DPS</p>
        </div>

        {/* 2. Monthly Target */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Monthly Target</span>
            <button
              onClick={() => {
                setTargetInput(summary.monthlyTarget.toString());
                setIsEditingTarget(true);
              }}
              className="text-xs font-semibold text-[#1769D2] hover:underline"
            >
              Edit
            </button>
          </div>
          <div className="text-2xl font-black text-slate-900 mt-2">
            {formatBDT(summary.monthlyTarget)}
          </div>
          <p className="text-[11px] text-slate-500 mt-1">Standard benchmark: ৳3,000</p>
        </div>

        {/* 3. Remaining Target */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Remaining Target</span>
            <div className="p-2 rounded-xl bg-blue-50 text-[#1769D2]">
              <Target className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900 mt-2">
            {formatBDT(summary.remainingTarget)}
          </div>
          <p className="text-[11px] text-slate-500 mt-1">
            {summary.remainingTarget === 0 ? 'Goal reached for this month! 🎯' : 'To save this month'}
          </p>
        </div>

        {/* 4. Annual Savings Projection */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Annual Projection</span>
            <div className="p-2 rounded-xl bg-amber-50 text-amber-600">
              <Sparkles className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-amber-600 mt-2">
            {formatBDT(summary.annualProjection)}
          </div>
          <p className="text-[11px] text-slate-500 mt-1">Projected year-end total</p>
        </div>
      </div>

      {/* Target Progress Bar */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-2xs space-y-3">
        <div className="flex items-center justify-between text-xs font-bold text-slate-700">
          <span>This Month Savings Target Progress ({monthProgress}%)</span>
          <span>
            {formatBDT(summary.thisMonthNetSavings)} / {formatBDT(summary.monthlyTarget)}
          </span>
        </div>
        <div className="w-full bg-slate-100 h-3 rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-300 ${
              monthProgress >= 100 ? 'bg-emerald-500' : 'bg-[#1769D2]'
            }`}
            style={{ width: `${Math.min(monthProgress, 100)}%` }}
          />
        </div>
        <div className="flex justify-between text-[11px] text-slate-500">
          <span>Deposited: {formatBDT(summary.thisMonthDeposits)}</span>
          <span>Withdrawn: {formatBDT(summary.thisMonthWithdrawals)}</span>
        </div>
      </div>

      {/* Edit Target Modal */}
      {isEditingTarget && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs"
        >
          <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-2xl border border-slate-100 text-slate-800">
            <h3 className="font-bold text-slate-900 text-base">Edit Savings Target</h3>
            <form onSubmit={handleSaveTarget} className="mt-4 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">
                  Monthly Target (৳ BDT)
                </label>
                <input
                  type="number"
                  min="0"
                  required
                  value={targetInput}
                  onChange={(e) => setTargetInput(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm font-bold focus:ring-2 focus:ring-[#1769D2] outline-hidden"
                />
              </div>
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsEditingTarget(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-600"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-[#1769D2] text-white text-xs font-bold"
                >
                  Save Target
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Savings Transaction History Table */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-2xs space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <Calendar className="w-5 h-5 text-indigo-600" />
            <h2 className="text-base font-bold text-slate-900">
              Savings Transactions ({state.savingsTransactions.length})
            </h2>
          </div>
        </div>

        {state.savingsTransactions.length === 0 ? (
          <div className="py-12 text-center text-slate-400 text-sm">
            No savings transactions yet. Tap Deposit above to start building your savings!
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs sm:text-sm">
              <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
                <tr>
                  <th className="py-3 px-3">Date</th>
                  <th className="py-3 px-3">Type</th>
                  <th className="py-3 px-3">Account / Goal</th>
                  <th className="py-3 px-3">Description</th>
                  <th className="py-3 px-3 text-right">Amount</th>
                  <th className="py-3 px-3 text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {state.savingsTransactions.map((tx) => (
                  <tr key={tx.id} className="hover:bg-slate-50/70 transition">
                    <td className="py-3 px-3 whitespace-nowrap font-medium text-slate-600">
                      {tx.date}
                    </td>
                    <td className="py-3 px-3 whitespace-nowrap">
                      <span
                        className={`px-2 py-0.5 rounded font-bold text-xs uppercase ${
                          tx.type === 'deposit'
                            ? 'bg-emerald-100 text-emerald-700'
                            : 'bg-amber-100 text-amber-700'
                        }`}
                      >
                        {tx.type}
                      </span>
                    </td>
                    <td className="py-3 px-3 font-bold text-slate-800">{tx.accountOrGoal}</td>
                    <td className="py-3 px-3 text-slate-600 max-w-xs truncate">
                      {tx.description || '-'}
                    </td>
                    <td
                      className={`py-3 px-3 text-right whitespace-nowrap font-bold ${
                        tx.type === 'deposit' ? 'text-emerald-600' : 'text-amber-600'
                      }`}
                    >
                      {tx.type === 'deposit' ? '+' : '-'}
                      {formatBDT(tx.amount)}
                    </td>
                    <td className="py-3 px-3 text-center whitespace-nowrap">
                      <button
                        onClick={() => setDeletingId(tx.id)}
                        aria-label="Delete savings transaction"
                        className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add / Withdraw Modal */}
      {modalType && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs"
        >
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl border border-slate-100 text-slate-800">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-bold text-slate-900 text-lg">
                {modalType === 'deposit' ? 'Deposit to Savings' : 'Withdraw from Savings'}
              </h3>
              <button
                onClick={() => setModalType(null)}
                className="text-slate-400 hover:text-slate-600 p-1"
                aria-label="Close"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveTx} className="mt-4 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">
                  Account or Goal Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. DPS Bank / Emergency Fund / Gold Savings"
                  value={accountOrGoal}
                  onChange={(e) => setAccountOrGoal(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm font-medium focus:ring-2 focus:ring-[#1769D2] outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">
                  Amount (৳ BDT) <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-2.5 text-slate-400 font-bold">৳</span>
                  <input
                    type="number"
                    required
                    min="1"
                    placeholder="3000"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="w-full pl-8 pr-3.5 py-2.5 rounded-xl border border-slate-200 text-sm font-bold focus:ring-2 focus:ring-[#1769D2] outline-hidden"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Date</label>
                <input
                  type="date"
                  required
                  value={txDate}
                  onChange={(e) => setTxDate(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-medium focus:ring-2 focus:ring-[#1769D2] outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">
                  Note / Details
                </label>
                <input
                  type="text"
                  placeholder="e.g. Monthly DPS deduction from salary"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm font-medium focus:ring-2 focus:ring-[#1769D2] outline-hidden"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setModalType(null)}
                  className="px-4 py-2.5 rounded-xl border border-slate-200 text-sm font-semibold text-slate-600 hover:bg-slate-50 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className={`px-5 py-2.5 rounded-xl text-white text-sm font-bold transition active:scale-95 shadow-xs ${
                    modalType === 'deposit'
                      ? 'bg-emerald-600 hover:bg-emerald-700'
                      : 'bg-amber-600 hover:bg-amber-700'
                  }`}
                >
                  {modalType === 'deposit' ? 'Save Deposit' : 'Confirm Withdrawal'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={!!deletingId}
        title="Delete Savings Transaction"
        message="Are you sure you want to delete this savings record? Your total savings and balance figures will be recalculated."
        confirmLabel="Delete"
        isDestructive={true}
        onConfirm={() => {
          if (deletingId) {
            deleteSavingsTransaction(deletingId);
            setDeletingId(null);
          }
        }}
        onCancel={() => setDeletingId(null)}
      />
    </div>
  );
};
