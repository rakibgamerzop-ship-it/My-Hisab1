/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  HeartHandshake,
  PlusCircle,
  Calendar,
  CreditCard,
  User,
  Trash2,
  Edit2,
  X,
  CheckCircle,
} from 'lucide-react';
import { useFinance } from '../../context/FinanceContext';
import { FamilySupportPayment, PaymentMethod, PAYMENT_METHODS } from '../../types/finance';
import { filterByMonth, formatBDT, getCurrentDateStr } from '../../utils/finance';
import { ConfirmModal } from '../common/ConfirmModal';

export const FamilySupportView: React.FC = () => {
  const {
    state,
    selectedMonth,
    addFamilyPayment,
    updateFamilyPayment,
    deleteFamilyPayment,
    updateBudget,
  } = useFinance();

  // Add form state
  const [showAddModal, setShowAddModal] = useState(false);
  const [date, setDate] = useState(getCurrentDateStr());
  const [amount, setAmount] = useState('');
  const [recipient, setRecipient] = useState('Parents');
  const [description, setDescription] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('bKash');

  // Edit target state
  const [isEditingTarget, setIsEditingTarget] = useState(false);
  const [targetInput, setTargetInput] = useState(state.budget.monthlyFamilySupport.toString());

  // Edit item state
  const [editingItem, setEditingItem] = useState<FamilySupportPayment | null>(null);

  // Delete confirm state
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Month filtering
  const monthPayments = filterByMonth(state.familyPayments, selectedMonth);
  const totalPaid = monthPayments.reduce((sum, p) => sum + (Number(p.amount) || 0), 0);
  const target = state.budget.monthlyFamilySupport;
  const remaining = Math.max(0, target - totalPaid);
  const progressPercent = target > 0 ? Math.round((totalPaid / target) * 100) : 0;

  const handleSavePayment = (e: React.FormEvent) => {
    e.preventDefault();
    const parsedAmount = Number(amount);
    if (!parsedAmount || parsedAmount <= 0) return;

    addFamilyPayment({
      date,
      amount: parsedAmount,
      recipient: recipient.trim() || 'Family',
      description: description.trim() || `Monthly allowance sent to ${recipient}`,
      paymentMethod,
    });

    setAmount('');
    setDescription('');
    setShowAddModal(false);
  };

  const handleUpdatePayment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingItem) return;
    const parsedAmount = Number(editingItem.amount);
    if (!parsedAmount || parsedAmount <= 0) return;

    updateFamilyPayment(editingItem.id, {
      date: editingItem.date,
      amount: parsedAmount,
      recipient: editingItem.recipient,
      description: editingItem.description,
      paymentMethod: editingItem.paymentMethod,
    });

    setEditingItem(null);
  };

  const handleSaveTarget = (e: React.FormEvent) => {
    e.preventDefault();
    const val = Number(targetInput);
    if (val >= 0) {
      updateBudget({ monthlyFamilySupport: val });
      setIsEditingTarget(false);
    }
  };

  return (
    <div className="space-y-6 pb-20 md:pb-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            Family Support Tracker
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Monitor and record money sent to family members for{' '}
            <span className="font-semibold text-slate-700">{selectedMonth}</span>
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-[#1769D2] hover:bg-[#1255ab] text-white text-xs sm:text-sm font-bold transition active:scale-95 shadow-xs self-start sm:self-auto"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Record Contribution</span>
        </button>
      </div>

      {/* KPI Target & Progress Overview */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Monthly Target */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Monthly Target</span>
            <button
              onClick={() => {
                setTargetInput(target.toString());
                setIsEditingTarget(true);
              }}
              className="text-xs font-semibold text-[#1769D2] hover:underline"
            >
              Change
            </button>
          </div>
          <div className="text-2xl font-black text-slate-900 mt-2">{formatBDT(target)}</div>
          <p className="text-[11px] text-slate-500 mt-1">Default benchmark: ৳5,000</p>
        </div>

        {/* Total Paid */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs">
          <span className="text-xs font-semibold text-slate-500">Total Paid This Month</span>
          <div className="text-2xl font-black text-pink-600 mt-2">{formatBDT(totalPaid)}</div>
          <p className="text-[11px] text-slate-500 mt-1">
            {monthPayments.length} transactions recorded
          </p>
        </div>

        {/* Remaining Amount */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs">
          <span className="text-xs font-semibold text-slate-500">Remaining Amount</span>
          <div className="text-2xl font-black text-slate-900 mt-2">{formatBDT(remaining)}</div>
          <p className="text-[11px] text-slate-500 mt-1">
            {remaining === 0 ? 'Monthly target fulfilled! 🎉' : `${formatBDT(remaining)} left to fulfill`}
          </p>
        </div>
      </div>

      {/* Target Progress Bar Card */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-2xs space-y-3">
        <div className="flex items-center justify-between text-xs font-bold text-slate-700">
          <span>Target Progress ({progressPercent}%)</span>
          <span>
            {formatBDT(totalPaid)} / {formatBDT(target)}
          </span>
        </div>
        <div className="w-full bg-slate-100 h-3 rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-300 ${
              progressPercent >= 100 ? 'bg-emerald-500' : 'bg-pink-500'
            }`}
            style={{ width: `${Math.min(progressPercent, 100)}%` }}
          />
        </div>
      </div>

      {/* Edit Target Inline Modal */}
      {isEditingTarget && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs"
        >
          <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-2xl border border-slate-100 text-slate-800">
            <h3 className="font-bold text-slate-900 text-base">Edit Family Support Target</h3>
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

      {/* History Table */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-2xs space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <HeartHandshake className="w-5 h-5 text-pink-600" />
            <h2 className="text-base font-bold text-slate-900">
              Contribution History ({selectedMonth})
            </h2>
          </div>
        </div>

        {monthPayments.length === 0 ? (
          <div className="py-10 text-center text-slate-400 text-sm">
            No family support sent yet in {selectedMonth}.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs sm:text-sm">
              <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
                <tr>
                  <th className="py-3 px-3">Date</th>
                  <th className="py-3 px-3">Recipient</th>
                  <th className="py-3 px-3">Method</th>
                  <th className="py-3 px-3">Description</th>
                  <th className="py-3 px-3 text-right">Amount</th>
                  <th className="py-3 px-3 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {monthPayments.map((p) => (
                  <tr key={p.id} className="hover:bg-slate-50/70 transition">
                    <td className="py-3 px-3 whitespace-nowrap font-medium text-slate-600">
                      {p.date}
                    </td>
                    <td className="py-3 px-3 font-bold text-slate-800">{p.recipient}</td>
                    <td className="py-3 px-3 whitespace-nowrap text-slate-500">
                      <span className="px-2 py-0.5 rounded bg-slate-100 text-[11px] font-semibold">
                        {p.paymentMethod}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-slate-600 max-w-xs truncate">
                      {p.description || '-'}
                    </td>
                    <td className="py-3 px-3 text-right whitespace-nowrap font-bold text-pink-600">
                      {formatBDT(p.amount)}
                    </td>
                    <td className="py-3 px-3 text-center whitespace-nowrap">
                      <div className="flex items-center justify-center gap-1">
                        <button
                          onClick={() => setEditingItem(p)}
                          aria-label={`Edit payment to ${p.recipient}`}
                          className="p-1.5 rounded-lg text-slate-500 hover:text-[#1769D2] hover:bg-blue-50 transition"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setDeletingId(p.id)}
                          aria-label={`Delete payment to ${p.recipient}`}
                          className="p-1.5 rounded-lg text-slate-500 hover:text-red-600 hover:bg-red-50 transition"
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

      {/* Record Contribution Modal */}
      {showAddModal && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs"
        >
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl border border-slate-100 text-slate-800">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-bold text-slate-900 text-lg">Send Money to Family</h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-slate-400 hover:text-slate-600 p-1"
                aria-label="Close"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSavePayment} className="mt-4 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">
                  Recipient Name / Relation <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Parents / Village Home / Brother"
                  value={recipient}
                  onChange={(e) => setRecipient(e.target.value)}
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

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Date</label>
                  <input
                    type="date"
                    required
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-medium focus:ring-2 focus:ring-[#1769D2] outline-hidden"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">
                    Payment Method
                  </label>
                  <select
                    value={paymentMethod}
                    onChange={(e) => setPaymentMethod(e.target.value as PaymentMethod)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-medium focus:ring-2 focus:ring-[#1769D2] outline-hidden bg-white"
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
                  Note / Details
                </label>
                <input
                  type="text"
                  placeholder="e.g. Sent via bKash to mother for medicine & grocery"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm font-medium focus:ring-2 focus:ring-[#1769D2] outline-hidden"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2.5 rounded-xl border border-slate-200 text-sm font-semibold text-slate-600 hover:bg-slate-50 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-pink-600 hover:bg-pink-700 text-white text-sm font-semibold transition active:scale-95 shadow-xs"
                >
                  Record Payment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Payment Modal */}
      {editingItem && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs"
        >
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl border border-slate-100 text-slate-800">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-bold text-slate-900 text-lg">Edit Family Payment</h3>
              <button
                onClick={() => setEditingItem(null)}
                className="text-slate-400 hover:text-slate-600 p-1"
                aria-label="Close"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleUpdatePayment} className="mt-4 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Recipient</label>
                <input
                  type="text"
                  required
                  value={editingItem.recipient}
                  onChange={(e) => setEditingItem({ ...editingItem, recipient: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm font-medium focus:ring-2 focus:ring-[#1769D2] outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">
                  Amount (৳ BDT)
                </label>
                <input
                  type="number"
                  required
                  min="1"
                  value={editingItem.amount}
                  onChange={(e) =>
                    setEditingItem({ ...editingItem, amount: Number(e.target.value) })
                  }
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm font-bold focus:ring-2 focus:ring-[#1769D2] outline-hidden"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Date</label>
                  <input
                    type="date"
                    required
                    value={editingItem.date}
                    onChange={(e) => setEditingItem({ ...editingItem, date: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-medium focus:ring-2 focus:ring-[#1769D2] outline-hidden"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Method</label>
                  <select
                    value={editingItem.paymentMethod}
                    onChange={(e) =>
                      setEditingItem({
                        ...editingItem,
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
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Note</label>
                <input
                  type="text"
                  value={editingItem.description}
                  onChange={(e) =>
                    setEditingItem({ ...editingItem, description: e.target.value })
                  }
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm font-medium focus:ring-2 focus:ring-[#1769D2] outline-hidden"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setEditingItem(null)}
                  className="px-4 py-2.5 rounded-xl border border-slate-200 text-sm font-semibold text-slate-600 hover:bg-slate-50 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-pink-600 hover:bg-pink-700 text-white text-sm font-semibold transition active:scale-95 shadow-sm"
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
        title="Delete Family Payment"
        message="Are you sure you want to delete this family payment record? This will update your family support progress and adjust expense figures."
        confirmLabel="Delete"
        isDestructive={true}
        onConfirm={() => {
          if (deletingId) {
            deleteFamilyPayment(deletingId);
            setDeletingId(null);
          }
        }}
        onCancel={() => setDeletingId(null)}
      />
    </div>
  );
};
